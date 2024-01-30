'use client'

import MaintenancePage from "@/components/MaintenancePage";
import { ReactNode, useState } from "react";
import ArchwayTheme from "./themes/ArchwayTheme";
import InjeciveTheme from "./themes/InjectiveTheme";
import { PrimaryTheme } from "./themes/PrimaryTheme";
import useChainAdapter from "@/hooks/useChainAdapter";
import { ChainName } from "@/enums/Chain";
import XionTheme from "./themes/XionTheme";
import { usePathname } from "next/navigation";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
    const { selectedChainName } = useChainAdapter();
    const pathname = usePathname();

    const chainTheme: Record<ChainName, ReactNode> = {
        [ChainName.SEI]: <PrimaryTheme selectedChainName={ChainName.SEI} />,
        [ChainName.ARCHWAY]: <ArchwayTheme />,
        [ChainName.NEUTRON]: <PrimaryTheme selectedChainName={ChainName.NEUTRON} />,
        [ChainName.INJECTIVE]: <InjeciveTheme />,
        [ChainName.XION]: <XionTheme />,
    }

    const selectedTheme = chainTheme[selectedChainName!] || <InjeciveTheme />;

    const [isProjectMaintenance] = useState(false); // manage the project's maintenance status here

    if (isProjectMaintenance) {
        return <MaintenancePage />
    }

    if (pathname.includes('xion')) {
        return <>{children}</>
    }

    return (
        <>
            {selectedTheme}
            <div className='container mx-auto px-3 md:px-[64px]'>
                {children}
            </div>
        </>
    )
}

export default AppLayout
