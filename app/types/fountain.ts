import { FrameContext } from "frog";
import { Address, Hex } from "viem";

///
////// FRAME TYPES
///

export const steps = ["init", "name", "symbol", "meme"] as const;

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

export type FountainToken = {
  name: string;
  symbol: string;
  tokenUri: string;
  memeCastHash: Hex;
  tokenAddress: Address;
};

export type FountainDraftToken = {
  /**
   * ISO Date string
   */
  updatedTimestamp: string;
  name: string;
  symbol: string;
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
