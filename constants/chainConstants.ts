import { ChainName } from "@/enums/Chain";

export const MissingChainImageByName: Record<string, string | undefined> = {
    [ChainName.INJECTIVE]: "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.png"
}