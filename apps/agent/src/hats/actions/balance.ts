import { getContract } from "viem";
import { HATS_ABI } from "../abis/hats.ts";
import {
    composeContext,
    generateObjectDeprecated,
    HandlerCallback,
    ModelClass,
    type IAgentRuntime,
    type Memory,
    type State,
} from "@elizaos/core";

import { initWalletProvider, WalletProvider } from "../providers/wallet.ts";
import type { BalanceResponse, BalanceParams } from "../types/index.ts";
import { balanceTemplate } from "../templates/index.ts";

export { balanceTemplate };

// Exported for tests
export class BalanceAction {
    constructor(private walletProvider: WalletProvider) { }

    async balance(params: BalanceParams): Promise<BalanceResponse> {
        console.log(
            `Fetching Hat Balance: Hat ID ${params.hatId} for ${params.userAddress} on ${params.chain}`
        );

        const publicClient = this.walletProvider.getPublicClient(
            params.chain
        );

        const hatContract = getContract({
            address: "0x3bc1A0Ad72417f2d411118085256fC53CBdDd137",
            abi: HATS_ABI,
            client: {
                public: publicClient,
            },
        });

        try {
            const balance = await hatContract.read.balanceOf([params.userAddress, params.hatId]);

            return {
                balance: Number(balance),
                hatId: params.hatId
            };
        } catch (e) {
            const error = e as Error;
            throw new Error(`Balance of Hat failed: ${error.message}`);
        }
    }
}

const buildBalanceDetails = async (
    state: State,
    runtime: IAgentRuntime,
    wp: WalletProvider
): Promise<BalanceParams> => {
    const context = composeContext({
        state,
        template: balanceTemplate,
    });

    const chains = Object.keys(wp.chains);

    const contextWithChains = context.replace(
        "SUPPORTED_CHAINS",
        chains.map((item) => `"${item}"`).join("|")
    );

    const balanceDetails = (await generateObjectDeprecated({
        runtime,
        context: contextWithChains,
        modelClass: ModelClass.SMALL,
    })) as BalanceParams;

    const existingChain = wp.chains[balanceDetails.chain];

    if (!existingChain) {
        throw new Error(
            "The chain " +
            balanceDetails.chain +
            " not configured yet. Add the chain or choose one from configured: " +
            chains.toString()
        );
    }

    return balanceDetails;
};

export const balanceAction = {
    name: "balance",
    description: "Check the balance of a Hat for a specified address and Hat ID",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State | undefined,
        _options: any,
        callback?: HandlerCallback
    ) => {
        if (!state) {
            throw new Error("State is required");
        }
        console.log("Hat balance action handler called");
        const walletProvider = initWalletProvider(runtime);
        const action = new BalanceAction(walletProvider);

        // Compose balance context
        const paramOptions = await buildBalanceDetails(
            state,
            runtime,
            walletProvider
        );

        try {
            const balanceResp = await action.balance(paramOptions);
            if (callback) {
                callback({
                    text: `Balance of Hat ID ${paramOptions.hatId} for Address ${paramOptions.userAddress} is ${balanceResp.balance}`,
                    content: {
                        success: true,
                        hatId: balanceResp.hatId,
                        balance: balanceResp.balance,
                        chain: paramOptions.chain,
                    },
                });
            }
            return true;
        } catch (e) {
            const error = e as Error;
            console.error("Error during balance:", error);
            if (callback) {
                callback({
                    text: `Error fetching hat balance: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: balanceTemplate,
    validate: async () => {
        return true;
    },
    examples: [
        [
            {
                user: "assistant",
                content: {
                    text: "I'll help you check if 0x742d35Cc6634C0532925a3b844Bc454e4438f44e has a Hat ID 12345",
                    action: "HAT_BALANCE",
                },
            },
            {
                user: "user",
                content: {
                    text: "Can you check if 0x742d35Cc6634C0532925a3b844Bc454e4438f44e has a Hat ID 12345",
                    action: "HAT_BALANCE",
                },
            },
        ],
    ],
    similes: ["HAT_BALANCE", "CHECK_HAT_BALANCE"],
};
