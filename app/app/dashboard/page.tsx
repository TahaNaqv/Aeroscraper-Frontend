'use client';


import { isNil } from "lodash";
import SeiDashboard from "./_chain/SeiDashboard";
import ArchwayDashboard from "./_chain/ArchwayDashboard";
import NeutronDashboard from "./_chain/NeutronDashboard";
import InjectiveDashboard from "./_chain/InjectiveDashboard";
import useChainAdapter from "@/hooks/useChainAdapter";
import { ChainName } from "@/enums/Chain";

export default function Dashboard() {
    const { selectedChainName } = useChainAdapter();

    if (!isNil(selectedChainName)) {
        if (selectedChainName === ChainName.SEI) {
            return <SeiDashboard />
        }

        if (selectedChainName === ChainName.ARCHWAY) {
            return <ArchwayDashboard />
        }

        if (selectedChainName === ChainName.NEUTRON) {
            return <NeutronDashboard />
        }

        if (selectedChainName === ChainName.INJECTIVE) {
            return <InjectiveDashboard />
        }
    }

    return (
        <InjectiveDashboard />
    )
}