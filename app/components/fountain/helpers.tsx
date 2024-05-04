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

export const setDraftTokenValue = async (
  fid: number,
  key: string,
  value: string
) => {
  const prevUser = await redis.get<FountainUser>(`${USER_KEY}${fid}`);

  const nextUser = {
    ...prevUser,
    draftToken: {
      ...prevUser?.draftToken,
      [key]: value,
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
