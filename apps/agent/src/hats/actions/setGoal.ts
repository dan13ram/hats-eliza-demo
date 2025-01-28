import { isHex, getContract, isAddress, Hex } from "viem";
import { HATS_ABI } from "../abis/hats.ts";
import {
    composeContext,
    generateObject,
    HandlerCallback,
    ModelClass,
    type IAgentRuntime,
    type Memory,
    type State,
} from "@elizaos/core";

import { initWalletProvider, WalletProvider } from "../providers/wallet.ts";
import type { MintResponse, MintParams } from "../types/index.ts";

import { z } from "zod";

export const mintTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested transfer:
- Chain to execute on: Must be one of ["ethereum", "base", ...] (like in viem/chains)
- Hat ID: Must be a valid hat ID which is a decimal or hexadecimal number. Eg: 1881804318505984011044986043100966942838 or 0x1234567890abcdef1234567890abcdef12345678
- Wearer address: Must be a valid Ethereum address starting with "0x"

If you are unsure about any of the parameters, you can ask the user to provide them.
Always confirm with the user if all the parameters are correct, before proceeding with the action.

Respond with a JSON markdown block containing only the extracted values:

\`\`\`json
{
    "chain": SUPPORTED_CHAINS,
    "hatId": string,
    "toAddress": string
}
\`\`\`
`;

// Exported for tests
export class MintAction {
    constructor(private walletProvider: WalletProvider) { }

    async mintHat(params: MintParams): Promise<MintResponse> {
        console.log(
            `Minting: Hat ID ${params.hatId} to ${params.toAddress} on ${params.chain}`
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
            const hash = await hatContract.write.mintHat([params.hatId, params.toAddress]);

            return {
                hash,
                wearer: params.toAddress,
                hatId: params.hatId,
            };
        } catch (e) {
            const error = e as Error;
            throw new Error(`Minting of Hat failed: ${error.message}`);
        }
    }
}

function isBigInt(input: string): boolean {
    try {
        BigInt(input);
        return true;
    } catch (e) {
        return false;
    }
}

const isValidHatId = (str: string | null | undefined) => {
    if (!str) return false;
    return isHex(str) || isBigInt(str);

}

const buildMintDetails = async (
    state: State,
    runtime: IAgentRuntime,
    wp: WalletProvider
): Promise<MintParams> => {
    const context = composeContext({
        state,
        template: mintTemplate,
    });

    const chains = Object.keys(wp.chains);

    const contextWithChains = context.replace(
        "SUPPORTED_CHAINS",
        chains.map((item) => `"${item}"`).join("|")
    );

    const mintSchema = z.object({
        chain: z.number().int().positive(),
        hatId: z.custom<string>(isValidHatId, "Invalid Hat ID"),
        toAddress: z.custom<string>(isAddress, "Invalid Ethereum Address"),
    });


    const mintHatDetails = (await generateObject({
        runtime,
        context: contextWithChains,
        modelClass: ModelClass.SMALL,
        schema: mintSchema,
    })) as z.infer<typeof mintSchema>;


    const existingChain = wp.chains[mintHatDetails.chain];

    if (!existingChain) {
        throw new Error(
            "The chain " +
            mintHatDetails.chain +
            " not configured yet. Add the chain or choose one from configured: " +
            chains.toString()
        );
    }

    const { hatId, chainId, toAddress)

        return {
            ...mintHatDetails,
            hatId: isHex(mintH
    }
};

export const mintHatAction = {
    name: "mintHat",
    description: "Mint a Hat to a specified address",
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
        console.log("MintHat action handler called");
        const walletProvider = initWalletProvider(runtime);
        const action = new MintAction(walletProvider);

        // Compose mintHat context
        const paramOptions = await buildMintDetails(
            state,
            runtime,
            walletProvider
        );

        try {
            const mintHatResp = await action.mintHat(paramOptions);
            if (callback) {
                callback({
                    text: `Successfully minted Hat ID ${paramOptions.hatId} to ${paramOptions.toAddress}\nTransaction Hash: ${mintHatResp.hash}`,
                    content: {
                        success: true,
                        hash: mintHatResp.hash,
                        hatId: mintHatResp.hatId,
                        wearer: mintHatResp.wearer,
                        chain: paramOptions.chain,
                    },
                });
            }
            return true;
        } catch (e) {
            const error = e as Error;
            console.error("Error during mintHat:", error);
            if (callback) {
                callback({
                    text: `Error minting hat: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: mintTemplate,
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "assistant",
                content: {
                    text: "I'll help you mint the Hat ID 12345 to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    action: "MINT_HAT",
                },
            },
            {
                user: "user",
                content: {
                    text: "Mint the Hat ID 12345 to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    action: "MINT_HAT",
                },
            },
        ],
    ],
    similes: ["MINT_HAT", "GIVE_HAT"],
};
