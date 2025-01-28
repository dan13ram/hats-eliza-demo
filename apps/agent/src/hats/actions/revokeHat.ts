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
import type { RevokeResponse, RevokeParams } from "../types/index.ts";
import { revokeTemplate } from "../templates/index.ts";

export { revokeTemplate };

// Exported for tests
export class RevokeAction {
    constructor(private walletProvider: WalletProvider) { }

    async revokeHat(params: RevokeParams): Promise<RevokeResponse> {
        console.log(
            `Revoking: Hat ID ${params.hatId} from ${params.fromAddress} on ${params.chain}`
        );

        this.walletProvider.switchChain(params.chain);

        const walletClient = this.walletProvider.getWalletClient(
            params.chain
        );

        const publicClient = this.walletProvider.getPublicClient(
            params.chain
        );

        const hatContract = getContract({
            address: "0x3bc1A0Ad72417f2d411118085256fC53CBdDd137",
            abi: HATS_ABI,
            client: {
                public: publicClient,
                wallet: walletClient,
            },
        });

        try {
            const hash = await hatContract.write.setHatWearerStatus([params.hatId, params.fromAddress, false, params.goodStanding]);

            return {
                hash,
                wearer: params.fromAddress,
                hatId: params.hatId,
                standing: params.goodStanding,
            };
        } catch (e) {
            const error = e as Error;
            throw new Error(`Revoking of Hat failed: ${error.message}`);
        }
    }
}

const buildRevokeDetails = async (
    state: State,
    runtime: IAgentRuntime,
    wp: WalletProvider
): Promise<RevokeParams> => {
    const context = composeContext({
        state,
        template: revokeTemplate,
    });

    const chains = Object.keys(wp.chains);

    const contextWithChains = context.replace(
        "SUPPORTED_CHAINS",
        chains.map((item) => `"${item}"`).join("|")
    );

    const revokeHatDetails = (await generateObjectDeprecated({
        runtime,
        context: contextWithChains,
        modelClass: ModelClass.SMALL,
    })) as RevokeParams;

    const existingChain = wp.chains[revokeHatDetails.chain];

    if (!existingChain) {
        throw new Error(
            "The chain " +
            revokeHatDetails.chain +
            " not configured yet. Add the chain or choose one from configured: " +
            chains.toString()
        );
    }

    return revokeHatDetails;
};

export const revokeHatAction = {
    name: "revokeHat",
    description: "Revoke a Hat to a specified address",
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
        console.log("RevokeHat action handler called");
        const walletProvider = initWalletProvider(runtime);
        const action = new RevokeAction(walletProvider);

        // Compose revokeHat context
        const paramOptions = await buildRevokeDetails(
            state,
            runtime,
            walletProvider
        );

        try {
            const revokeHatResp = await action.revokeHat(paramOptions);
            if (callback) {
                callback({
                    text: `Successfully revoked Hat ID ${paramOptions.hatId} from ${paramOptions.fromAddress}\nTransaction Hash: ${revokeHatResp.hash}`,
                    content: {
                        success: true,
                        hash: revokeHatResp.hash,
                        hatId: revokeHatResp.hatId,
                        wearer: paramOptions.fromAddress,
                        chain: paramOptions.chain,
                    },
                });
            }
            return true;
        } catch (e) {
            const error = e as Error;
            console.error("Error during revokeHat:", error);
            if (callback) {
                callback({
                    text: `Error revokeing hat: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: revokeTemplate,
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "assistant",
                content: {
                    text: "I'll help you revoke the Hat ID 12345 from 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    action: "REVOKE_HAT",
                },
            },
            {
                user: "user",
                content: {
                    text: "Revoke the Hat ID 12345 from 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    action: "REVOKE_HAT",
                },
            },
        ],
    ],
    similes: ["REVOKE_HAT", "REMOVE_HAT"],
};
