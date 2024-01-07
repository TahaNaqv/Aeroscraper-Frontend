'use client'

import MaintenancePage from "@/components/MaintenancePage";
import { ClientEnum } from "@/types/types";
import { ReactNode, useState } from "react";
import ArchwayTheme from "./themes/ArchwayTheme";
import InjeciveTheme from "./themes/InjectiveTheme";
import { PrimaryTheme } from "./themes/PrimaryTheme";
import useChainAdapter from "@/hooks/useChainAdapter";
import { ChainName } from "@/enums/Chain";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
    const { selectedChainName } = useChainAdapter();

    const chainTheme: Record<ChainName, ReactNode> = {
        [ChainName.SEI]: <PrimaryTheme clientType={ClientEnum.SEI} />,
        [ChainName.ARCHWAY]: <ArchwayTheme />,
        [ChainName.NEUTRON]: <PrimaryTheme clientType={ClientEnum.NEUTRON} />,
        [ChainName.INJECTIVE]: <InjeciveTheme />,
    }

    const selectedTheme = chainTheme[selectedChainName!] || <InjeciveTheme />;

    const [isProjectMaintenance] = useState(false); // manage the project's maintenance status here

    if (isProjectMaintenance) {
        return <MaintenancePage />
    }

    return (
        <>
            {selectedTheme}
            <div className='container mx-auto'>
                {children}
            </div>
        </>
    )
}

export default AppLayout
