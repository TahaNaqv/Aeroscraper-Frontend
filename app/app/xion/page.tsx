"use client";
import Link from "next/link";
import { useState } from "react";
import {
  useAbstraxionAccount,
} from "@burnt-labs/abstraxion";

import "@burnt-labs/ui/styles.css";
import type { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import useChainAdapter from "@/hooks/useChainAdapter";
import XionTheme from "@/layouts/themes/XionTheme";
import XionDashboard from "../dashboard/_chain/XionDashboard";


export default function Page(): JSX.Element {
  const { selectedChainName } = useChainAdapter();
  // Abstraxion hooks
  const { data: account } = useAbstraxionAccount();
  
  
  return (
    <main className="m-auto xion flex min-h-screen flex-col items-center text-white justify-start gap-4 p-4 container mx-auto px-3 md:px-[64px] w-full">
      <XionTheme />
      <XionDashboard />
    </main>
  );
}
