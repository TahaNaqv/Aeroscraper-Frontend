import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

  const missionDatas = await fetch("https://api.zealy.io/communities/aeroscraper/quests", {
    headers: {
      "x-api-key": `${process.env.NEXT_PUBLIC_ZEALY_API_KEY}`
    },
    method: req.method,
    cache: "no-cache"
  });

  const missionsData = await missionDatas.json();

  if (missionDatas.status !== 200) {
    return NextResponse.json({
      status: missionDatas.status,
      msg: "There was a problem",
    });
  } else {
    return NextResponse.json(missionsData);
  }
}
