import React, { useEffect, useState } from "react";
import Text from "@/components/Texts/Text";
import { Table } from "@/components/Table/Table";
import { TableBodyCol } from "@/components/Table/TableBodyCol";
import { TableHeaderCol } from "@/components/Table/TableHeaderCol";
import { getCroppedString } from "@/utils/stringUtils";
import { NumericFormat } from "react-number-format";
import SkeletonLoading from "@/components/Table/SkeletonLoading";
import Checkbox from "@/components/Checkbox";
import MissionCard, { ZealyMission } from "@/components/MissionCard";
import { isNil } from "lodash";
import useChainAdapter from "@/hooks/useChainAdapter";

interface ZealyResponseModel {
  items: ZealyUser[];
  totalUsers: number;
  totalPages: number;
  page: number;
}

interface ZealyUser {
  userId: string;
  xp: number;
  name: string;
  avatar: string;
  numberOfQuests: number;
  addresses: Record<string, any>;
  address: string;
  twitterId: string;
  discord: string;
  twitter: string;
  discordId: string;
  connectedWallet: string;
}

interface Account {
  id: string;
  userId: string;
  authentification: string;
  createdAt: string;
  updatedAt: string;
  accountType: string;
  verified: boolean;
  tokenStatus: string;
}

interface ZealyUserInformation {
  xp: number;
  rank: number;
  invites: number;
  role: string;
  level: number;
  isBanned: boolean;
  karma: number;
  accounts: Account[];
  ethWallet: string;
  isMe: boolean;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  addresses: Record<string, any>;
  avatar: string;
  discordHandle: string;
  twitterUsername: string;
  displayedInformation: string[];
  deletedAt: string | null;
  accountLinkingInformation: { linkType: string; count: number }[];
}

enum TABS {
  LEADERBOARD = 0,
  MISSIONS,
}

const LeaderboardTab = () => {
  const { address } = useChainAdapter();

  const [leaderboard, setLeaderboard] = useState<ZealyUser[]>([]);
  const [userInformation, setUserInformation] =
    useState<ZealyUserInformation | null>(null);
  const [missionList, setMissionList] = useState<Record<
    string,
    ZealyMission
  > | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  const [selectedTab, setSelectedTab] = useState<TABS>(TABS.MISSIONS);
  const [informationLoading, setInformationLoading] = useState(false);

  const [loading, setLoading] = useState(true);

  const [zealyId, setZealyId] = useState<string | null>(null);

  useEffect(() => {
    fetchZealyData();
    getZealyUserId();
  }, []);

  useEffect(() => {
    if (zealyId) {
      fetchZealyInformationData();
    }
  }, [zealyId]);

  useEffect(() => {
    console.log("selectedTab", selectedTab, selectedTab === TABS.MISSIONS);
    console.log("zealyId", zealyId);

    if (selectedTab === TABS.MISSIONS && zealyId) {
      fetchZealyMissionData();
    }
  }, [selectedTab, zealyId]);

  const fetchZealyData = async () => {
    try {
      const result = await fetch("/api/zealy/leaderboard", {
        next: {
          revalidate: false,
        },
        cache: "no-cache",
      });

      const data: ZealyResponseModel = await result.json();

      setTotalUsers(data.totalUsers);
      setLeaderboard(data.items);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const getZealyUserId = async () => {
    try {
      const result = await fetch(
        `https://db.aeroscraper.io/api/collections/leaderboard/records?filter=address="${address}"`,
        {
          next: {
            revalidate: false,
          },
          cache: "no-cache",
        }
      );

      const data: ZealyResponseModel = await result.json();

      if (data.items.length > 0) {
        setZealyId(data.items[0].userId);
      } else {
        setZealyId("");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const fetchZealyInformationData = async () => {
    //setInformationLoading(true);

    try {
      if (zealyId) {
        const result = await fetch(`/api/zealy/userInformation/${zealyId}`, {
          next: {
            revalidate: 0,
          },
          cache: "no-store",
        });

        const data = await result.json();

        setUserInformation(data);
        setInformationLoading(false);

        setLoading(false);
      } else {
        setInformationLoading(false);
        setLoading(false);
        setUserInformation(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setInformationLoading(false);
    }
  };

  const fetchZealyMissionData = async () => {
    try {
      if (!zealyId) {
        setMissionList(null);
        return;
      }

      const result: any = await fetch(`/api/zealy/missions?userId=${zealyId}`, {
        next: {
          revalidate: 0,
        },
        cache: "no-store",
        method: "GET",
      });

      if (!result.ok) {
        throw new Error("Network response was not ok.");
      }

      const data = await result.json();

      if (typeof data !== "object") {
        throw new Error("Network response was not ok.");
      }

      const missionList = data.reduce(
        (acc: Record<string, ZealyMission>, mission: ZealyMission) => {
          return {
            ...acc,
            [mission.id]: {
              ...mission,
              currentXP: 0,
              status: null,
            },
          };
        },
        {}
      );

      setMissionList(missionList);

      fetchZealyMissionClaimedData(missionList);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchZealyMissionClaimedData = async (
    missionList: Record<string, ZealyMission>
  ) => {
    try {
      if (!zealyId) {
        return;
      }

      const result: any = await fetch(
        `/api/zealy/claimedMissions/${zealyId}`, //
        {
          next: {
            revalidate: 0,
          },
          cache: "no-cache",
          method: "GET",
        }
      );

      if (!result.ok) {
        throw new Error("Network response was not ok.");
      }

      const data = await result.json();

      if (typeof data !== "object") {
        throw new Error("Network response was not ok.");
      }

      let tempMissionList = { ...missionList };

      data.data.forEach((claim: any) => {
        const { questId, xp, status } = claim;

        if (tempMissionList[questId]) {
          tempMissionList[questId].currentXP = xp;
          tempMissionList[questId].status = status;
        }
      });

      setMissionList(tempMissionList);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <Text size="3xl">
        See your ranking among <b>Zealy</b> users
      </Text>
      <Text size="base" weight="font-regular" className="mt-1">
        Earn points and increase your ranking
      </Text>
      <div className="flex flex-col">
        <Checkbox
          className="mt-8"
          label={"Missions"}
          checked={selectedTab === TABS.MISSIONS}
          onChange={() => {
            setSelectedTab(TABS.MISSIONS);
          }}
        />
        {selectedTab === TABS.MISSIONS &&
          (isNil(missionList) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {new Array(6).fill({}).map((_item, idx) => {
                return (
                  <div
                    key={idx}
                    className="w-full bg-cetacean-dark-blue border border-white/10 rounded-2xl px-4 pt-4 pb-4 items-end justify-between mt-6"
                  >
                    <div className="w-full flex justify-between gap-6 items-center">
                      <SkeletonLoading
                        height="h-6 mt-6"
                        width="w-32"
                        noPadding
                      />
                      <div
                        className={`px-8 pb-1 m-1 text-base font-medium text-white relative cursor-pointer rounded-md hover:text-red-500 duration-700 whitespace-nowrap text-center`}
                      >
                        <SkeletonLoading
                          height="h-4 mt-6"
                          width="w-24"
                          noPadding
                        />
                        <div className="absolute bottom-0 h-[40px] border-2 rounded-md border-red-500 left-0 right-0" />
                      </div>
                    </div>
                    <SkeletonLoading
                      height="h-4 mt-6"
                      width="w-full"
                      noPadding
                    />
                    <SkeletonLoading
                      height="h-4 mt-6"
                      width="w-full"
                      noPadding
                    />
                    <div className="mt-4">
                      <Text
                        size="sm"
                        weight="font-regular"
                        textColor="text-gray-400"
                        className="mb-1"
                      >
                        Points
                      </Text>
                      <Text
                        size="xl"
                        textColor="text-gradient"
                        weight="font-medium"
                      >
                        <SkeletonLoading
                          height="h-4 mt-2"
                          width="w-24"
                          noPadding
                        />
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
              {Object.values(missionList)?.map((mission, idx) => {
                return <MissionCard key={idx} mission={mission} />;
              })}
            </div>
          ))}
        <Checkbox
          className="mt-8"
          label={"Leaderboard"}
          checked={selectedTab === TABS.LEADERBOARD}
          onChange={() => {
            setSelectedTab(TABS.LEADERBOARD);
          }}
        />
        {selectedTab === TABS.LEADERBOARD && (
          <>
            <div className="w-full bg-cetacean-dark-blue border border-white/10 rounded-2xl px-6 py-6 flex items-end justify-between mt-6">
              <div className="w-full">
                <Text size="base" weight="font-bold">
                  Your Rank
                </Text>
                <div className="mt-6 flex justify-between w-full">
                  {informationLoading ? (
                    <SkeletonLoading height="h-4 mt-6" width="w-24" noPadding />
                  ) : (
                    <div className="flex items-end">
                      <Text
                        size="5xl"
                        textColor="text-gradient"
                        weight="font-semibold"
                      >
                        {userInformation?.rank ?? "-"}
                      </Text>
                      <Text
                        size="sm"
                        weight="font-regular"
                        textColor="text-gray-400"
                        className="ml-3 mb-1"
                      >
                        of {totalUsers} wallets
                      </Text>
                    </div>
                  )}
                  <div className="flex items-end">
                    <Text
                      size="2xl"
                      textColor="text-white"
                      weight="font-semibold"
                    >
                      {userInformation?.xp ?? "-"}
                    </Text>
                    <Text
                      size="sm"
                      weight="font-regular"
                      textColor="text-gray-400"
                      className="ml-2 mb-1"
                    >
                      points
                    </Text>
                  </div>
                </div>
              </div>
            </div>
            <Table
              listData={leaderboard}
              header={
                <div className="grid-cols-6 grid gap-5 lg:gap-0 mt-4 md:mr-0 mr-6">
                  <TableHeaderCol col={1} text="Rank" />
                  <TableHeaderCol col={4} text="Address" />
                  <TableHeaderCol col={1} text="Points" textCenter />
                </div>
              }
              bodyCss="space-y-1 max-h-[350px] overflow-auto"
              loading={loading}
              renderItem={(item: ZealyUser, idx) => {
                return (
                  <div
                    key={item.userId}
                    className="grid grid-cols-6 border-b border-white/10"
                  >
                    <TableBodyCol
                      col={1}
                      text="XXXXXX"
                      value={
                        <Text
                          size="sm"
                          className="whitespace-nowrap text-start ml-4"
                        >
                          {idx + 1}
                        </Text>
                      }
                    />
                    <TableBodyCol
                      col={4}
                      text="XXXXXX"
                      value={
                        <Text
                          size="sm"
                          className="whitespace-nowrap text-start ml-4"
                        >
                          {getCroppedString(item.address, 6, 8)}
                        </Text>
                      }
                    />
                    <TableBodyCol
                      col={1}
                      text="XXXXXX"
                      value={
                        <NumericFormat
                          value={item.xp}
                          thousandsGroupStyle="thousand"
                          thousandSeparator=","
                          fixedDecimalScale
                          decimalScale={0}
                          displayType="text"
                          renderText={(value) => (
                            <Text
                              size="sm"
                              responsive={false}
                              className="whitespace-nowrap"
                            >
                              {value} xp
                            </Text>
                          )}
                        />
                      }
                    />
                  </div>
                );
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardTab;
