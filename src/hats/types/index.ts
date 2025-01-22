import type {
    Address,
    Hash,
} from "viem";
import * as viemChains from "viem/chains";

const _SupportedChainList = Object.keys(viemChains) as Array<keyof typeof viemChains>;
export type SupportedChain = (typeof _SupportedChainList)[number];

export interface MintParams {
    chain: SupportedChain;
    hatId: Hash;
    toAddress: Address;
}

export interface MintResponse {
    hash: Hash;
    wearer: Address;
    hatId: Hash;
}

export interface RevokeParams {
    chain: SupportedChain;
    hatId: Hash;
    fromAddress: Address;
    goodStanding: boolean;
}

export interface RevokeResponse {
    hash: Hash;
    wearer: Address;
    standing: boolean;
    hatId: Hash;
}

export interface BalanceParams {
    chain: SupportedChain;
    userAddress: Address;
    hatId: Hash;
}

export interface BalanceResponse {
    balance: number;
    hatId: Hash;
}
