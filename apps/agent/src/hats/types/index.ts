import type { Address, Hex } from "viem";
import * as viemChains from "viem/chains";

const _SupportedChainList = Object.keys(viemChains) as Array<
    keyof typeof viemChains
>;
export type SupportedChain = (typeof _SupportedChainList)[number];

export interface MintParams {
    chain: SupportedChain;
    hatId: Hex;
    toAddress: Address;
}

export interface MintResponse {
    hash: Hex;
    wearer: Address;
    hatId: Hex;
}

export interface RevokeParams {
    chain: SupportedChain;
    hatId: Hex;
    fromAddress: Address;
    goodStanding: boolean;
}

export interface RevokeResponse {
    hash: Hex;
    wearer: Address;
    standing: boolean;
    hatId: Hex;
}

export interface BalanceParams {
    chain: SupportedChain;
    userAddress: Address;
    hatId: Hex;
}

export interface BalanceResponse {
    balance: number;
    hatId: Hex;
}
