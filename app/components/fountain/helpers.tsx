import { KV_REST_API_TOKEN, KV_REST_API_URL } from "@/app/config/constants";
import { FountainContext, FountainUser } from "@/app/types";
import { isProd } from "@/app/utils";
import { createClient } from "@vercel/kv";

const USER_KEY = "fountain-user::";

const redis = createClient({
  url: KV_REST_API_URL,
  token: KV_REST_API_TOKEN,
});

export const fetchFountainUser = async (fid: number) =>
  await redis.get<FountainUser>(`${USER_KEY}${fid}`);

export const getDraftToken = async (fid: number) =>
  fetchFountainUser(fid).then((u) => u?.draftToken ?? null);

const keyMapping = {
  name: "name", // same key
  symbol: "symbol", // same key
  supply: "totalSupply", // maps to totalSupply
  price: "initialPrice", // maps to initialPrice
  burn: "recipient.amount", // special case, nested property
};

export const setDraftTokenValue = async (
  fid: number,
  step: string,
  value: string
) => {
  const prevUser = await redis.get<FountainUser>(`${USER_KEY}${fid}`);

  // Handling nested properties separately
  let updatedDraftToken = { ...prevUser?.draftToken };

  if (step === "burn") {
    // Update recipient amount specifically
    updatedDraftToken.recipient = {
      address: "0x0000000000000000000000000000000000000000",
      amount: parseInt(value, 10),
    };
  } else {
    // Update other properties based on keyMapping
    const key = keyMapping[step as keyof typeof keyMapping];

    if (key) {
      // @ts-ignore
      updatedDraftToken[key] = value;
    }
  }

  const nextUser = {
    ...prevUser,
    draftToken: {
      ...updatedDraftToken,
      updatedTimestamp: new Date().toISOString(),
    },
  };

  await redis.set(`${USER_KEY}${fid}`, nextUser);
};

// if the user has already entered a name or a symbol, skip those steps
export const deriveInitialStepFromState = (c: FountainContext) =>
  c.deriveState().draftValues?.symbol
    ? "meme"
    : c.deriveState().draftValues?.name
    ? "symbol"
    : "name";

/**
 * @dev Initializes the user state if necessary
 */
export const getOrInitState = async (
  c: FountainContext,
  { refresh }: { refresh?: boolean } = {}
) =>
  c.deriveState(async (previousState) => {
    // no-op if the state is already initialized
    if (previousState.frameState === "ready" && !refresh) return;

    const [draftToken] = c.frameData?.fid
      ? await Promise.all([getDraftToken(c.frameData.fid)])
      : [null, null];
    // set the state to ready
    previousState.frameState = "ready";
    // fill in the draft values from the db
    if (draftToken) {
      previousState.draftValues = {
        name: draftToken.name,
        symbol: draftToken.symbol,
      };
    }
  });
