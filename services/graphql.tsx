"use client";
import { ChainName } from "@/enums/Chain";
import {
  ClientEnum,
  RiskyTrovesResponse,
  TotalTrovesResponse,
} from "@/types/types";
import { request, gql } from "graphql-request";

export default function graphql({ selectedChainName = ChainName.INJECTIVE }: { selectedChainName?: ChainName }) {


  const URL = (): string => {
    switch (selectedChainName) {
      case ChainName.ARCHWAY:
        return process.env.NEXT_PUBLIC_INDEXER_ARCH as string;
      case ChainName.SEI:
        return process.env.NEXT_PUBLIC_INDEXER_DOMAIN as string;
      case ChainName.NEUTRON:
        return process.env.NEXT_PUBLIC_INDEXER_NEUTRON as string;
      case ChainName.INJECTIVE:
        return process.env.NEXT_PUBLIC_INDEXER_INJ as string;
      default:
        return process.env.NEXT_PUBLIC_INDEXER_DOMAIN as string;
    }
  };

  const getRiskyTrovesQuery =
    selectedChainName === ChainName.INJECTIVE
      ? gql`
          query {
            troves {
              nodes {
                owner
              }
            }
          }
        `
      : gql`
          query {
            troves {
              nodes {
                owner
                liquidityThreshold
              }
            }
          }
        `;

  const getTotalTrovesQuery = gql`
    query {
      troves {
        totalCount
      }
    }
  `;
  const requestRiskyTroves = async (): Promise<RiskyTrovesResponse> => {
    return await request(URL(), getRiskyTrovesQuery);
  };

  const requestTotalTroves = async (): Promise<TotalTrovesResponse> => {
    return await request(URL(), getTotalTrovesQuery);
  };
  return {
    requestRiskyTroves,
    requestTotalTroves,
  };
}
