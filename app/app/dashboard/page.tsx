'use client';

import GradientButton from "@/components/Buttons/GradientButton";
import WalletButton from "@/components/Buttons/WalletButton";
import StatisticCard from "@/components/Cards/StatisticCard";
import BorderedContainer from "@/components/Containers/BorderedContainer";
import ShapeContainer from "@/components/Containers/ShapeContainer";
import { InfoIcon, RightArrow } from "@/components/Icons/Icons";
import Text from "@/components/Texts/Text"
import { NumericFormat } from 'react-number-format'
import { PageData } from "./_types/types";
import { convertAmount } from "@/utils/contractUtils";
import RedeemSide from "./_components/RedeemSide";
import Tooltip from "@/components/Tooltip/Tooltip";
import NotificationDropdown from "./_components/NotificationDropdown";
import { isNil } from "lodash";
import { ClientEnum } from "@/types/types";
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