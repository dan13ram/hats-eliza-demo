export * from "./actions/mintHat.ts";
export * from "./actions/revokeHat.ts";
export * from "./actions/balance.ts";
export * from "./providers/wallet.ts";
export * from "./types/index.ts";

import type { Plugin } from "@elizaos/core";
import { mintHatAction } from "./actions/mintHat.ts";
import { revokeHatAction } from "./actions/revokeHat.ts";
import { balanceAction } from "./actions/balance.ts";
import { evmWalletProvider } from "./providers/wallet.ts";

export const hatsPlugin: Plugin = {
    name: "hats",
    description: "Hats Protocol on EVM blockchain integration plugin",
    providers: [evmWalletProvider],
    evaluators: [],
    services: [],
    actions: [mintHatAction, revokeHatAction, balanceAction],
};

export default hatsPlugin;
