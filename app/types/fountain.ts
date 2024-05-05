import { FrameContext } from "frog";
import { Address, Hex } from "viem";

///
////// FRAME TYPES
///

export const steps = [
  "init",
  "name",
  "symbol",
  "supply",
  "price",
  "burn",
  "meme",
] as const;

export type Step = (typeof steps)[number];

export type FountainState = {
  frameState: "init" | "ready";
  draftValues?: {
    name?: string;
    symbol?: string;
  };
};

export const initialFountainState: FountainState = {
  frameState: "init",
} as const;

export type FountainContext = FrameContext<{
  State: FountainState;
}>;

///
////// REDIS TYPES
///
export type MemeCoin = {
  /**
   * token name
   */
  name: string;
  /**
   * token symbol
   */
  symbol: string;
  /**
   * Total supply in human readable format
   * @example 1000000
   */
  totalSupply: number;
  /**
   * Initial price in human readable format
   * @example 0.02
   */
  initialPrice: number;
  /**
   * optionally specify a token recipient and an amount.
   * @dev must be less <= totalSupply
   */
  recipient?: {
    /**
     * address which will receive an initial distribution of the token
     */
    address: Address;
    /*
     * amount of tokens to distribute to the recipient
     */
    amount: number;
  };
};

export type FountainToken = MemeCoin & {
  tokenUri: string;
  memeCastHash: Hex;
  tokenAddress: Address;
};

export type FountainDraftToken = MemeCoin & {
  /**
   * ISO Date string
   */
  updatedTimestamp: string;
  /**
   * undefined if they haven’t posted
   * their meme yet
   */
  memeCastHash?: Hex;
};

export type FountainUser = {
  draftToken?: FountainDraftToken;
  deployedTokens: FountainToken[];
};
