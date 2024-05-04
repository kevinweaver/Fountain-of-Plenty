/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-key */
/** @jsxImportSource frog/jsx */
import { uniswapBuyLink } from "@/app/services/uniswap";
import {
  FountainContext,
  FountainState,
  Step,
  initialFountainState,
  steps,
} from "@/app/types";
import { getAbsoluteUrl, isDevelopment, isProd } from "@/app/utils";
import { Button, Frog, TextInput } from "frog";
import { neynar } from "frog/hubs";
import { handle } from "frog/next";
import { ErrorFrame, Layout, TokenData } from "./components";
import {
  deriveInitialStepFromState,
  fetchFountainUser,
  getOrInitState,
  setDraftTokenValue,
} from "./helpers";
import { Box, Column, Columns, HStack, Image, Text, VStack, vars } from "./ui";
import {
  CONNECTIONS,
  FROG_SIGNER_SECRET,
  NEYNAR_API_KEY,
  NO_CACHE_HEADER,
} from "@/app/config/constants";
import { getNeynar } from "@/app/services/neynar";
import { CastResponse } from "@neynar/nodejs-sdk/build/neynar-api/v2";

const Fountain = new Frog<{ State: FountainState }>({
  assetsPath: "/",
  basePath: "/",
  browserLocation: CONNECTIONS.prod.channel,
  initialState: initialFountainState,
  hub: isProd() ? neynar({ apiKey: NEYNAR_API_KEY }) : undefined,
  secret: FROG_SIGNER_SECRET,
  verify: process.env.NODE_ENV === "development" ? false : true,
  ui: { vars },
});

Fountain.frame("/", async (c) => {
  return c.res({
    image: "/fountain.png",
    intents: [
      <Button action="/more-info">More Info</Button>,
      <Button action="/create" value="init">
        Make Offering
      </Button>,
    ],
  });
});

const EnterName = (
  c: FountainContext,
  { needsValidation }: { needsValidation?: boolean } = {}
) => {
  return c.res({
    headers: NO_CACHE_HEADER,
    image: (
      <Layout>
        <Box grow alignHorizontal="center" alignVertical="center" gap="4">
          <>
            <Text size="24" color="blue">
              [step 1]{" "}
            </Text>
            <Text size="24"> give your offering a name</Text>
            {needsValidation && (
              <Text size="18" color="red">
                max 10 characters
              </Text>
            )}
          </>
        </Box>
      </Layout>
    ),
    intents: [
      <TextInput placeholder="enter name" />,
      <Button value="symbol">next 👉</Button>,
    ],
  });
};

const EnterSymbol = (
  c: FountainContext,
  { needsValidation }: { needsValidation?: boolean } = {}
) => {
  return c.res({
    headers: NO_CACHE_HEADER,
    image: (
      <Layout>
        <Box grow alignHorizontal="center" alignVertical="center" gap="4">
          <>
            <Text size="24" color="blue">
              [step 2]{" "}
            </Text>
            <Text size="24"> give your offering a ticker</Text>
            {needsValidation && (
              <Text size="18" color="red">
                max 6 characters
              </Text>
            )}
          </>
        </Box>
      </Layout>
    ),
    intents: [
      <TextInput placeholder="token symbol" />,
      <Button value="back:name">back</Button>,
      <Button value="meme">next 👉</Button>,
    ],
  });
};

const PostMeme = (c: FountainContext) => {
  const { name, symbol } = c.deriveState().draftValues || {};

  return c.res({
    headers: NO_CACHE_HEADER,
    image: "/fountain-logo.png", //TODO update to gif
  });
};

Fountain.frame("/more-info", async (c) => {
  return c.res({
    image: (
      <Layout>
        <Box grow alignHorizontal="center" alignVertical="center" gap="4">
          <VStack gap="4">
            <li>&bull; you offer a meme, Fountain of Plenty deploys a token</li>
            <li>
              &bull; toss some of your new tokens into the Fountain (burn them)
            </li>
            <li>&bull; 0% creator fee </li>
            <li>
              &bull; 100% remaining tokens fair launched via 1 sided Uni v3 LP
            </li>
            <li>&bull; 1% swap fee</li>
            <li>&bull; locked LP</li>
            <li>&bull; no additional allocation or permissions</li>
          </VStack>
        </Box>
      </Layout>
    ),
    intents: [<Button.Reset>Back</Button.Reset>],
  });
});

Fountain.frame("/create", async (c) => {
  if (!c.frameData?.fid) return ErrorFrame(c, "Invalid frame data - no fid");
  console.log("user`s fid", c.frameData.fid);
  await getOrInitState(c);

  const pressedBack = c.buttonValue?.includes("back:");
  const currentStep =
    c.buttonValue === "init"
      ? deriveInitialStepFromState(c)
      : pressedBack
      ? (c.buttonValue?.split(":")[1] as Exclude<Step, "init">)
      : (c.buttonValue?.split(":")[0] as Exclude<Step, "init">);

  if (c.buttonValue !== "init" && !pressedBack) {
    const previousStep = steps[steps.indexOf(currentStep) - 1];
    // Update the draft values in state

    const value = c.inputText;

    const needsRetry =
      !value ||
      (previousStep === "name" && value.length > 10) ||
      (previousStep === "symbol" && value.length > 6);

    if (needsRetry) {
      if (previousStep === "name")
        return EnterName(c, { needsValidation: true });
      if (previousStep === "symbol")
        return EnterSymbol(c, { needsValidation: true });
    }

    console.log("calling derive stage again");
    c.deriveState((s) => {
      s.draftValues = {
        ...(s.draftValues ?? {}),
        [previousStep]: value,
      };
    });

    // Send the input to the DB
    await setDraftTokenValue(c.frameData.fid, previousStep, value!);
  }

  // Renderer
  if (currentStep === "name") return EnterName(c);
  if (currentStep === "symbol") return EnterSymbol(c);
  if (currentStep === "meme") return PostMeme(c);
  return ErrorFrame(c, "Invalid step");
});

const unwrapEmbedUrlFromCastResponse = async (
  response: CastResponse
): Promise<string | null> => {
  const [embed] = response?.cast?.embeds ?? [];
  if (!embed) return null;

  if ("url" in embed) return embed.url;
  if ("cast_id" in embed)
    return await getNeynar()
      .lookUpCastByHashOrWarpcastUrl(embed.cast_id.hash, "hash")
      .then(unwrapEmbedUrlFromCastResponse)
      .catch((e) => null);
  return null;
};

Fountain.frame("/token/:fid/:tokenAddress", async (c) => {
  const { fid, tokenAddress } = c.req.param();
  if (!fid) return ErrorFrame(c, "no FID passed");

  const user = await fetchFountainUser(+fid).catch((e) => null);
  if (!user) return ErrorFrame(c, "User not found");

  const token = user.deployedTokens.find(
    (t) => t.tokenAddress === tokenAddress
  );
  if (!tokenAddress) return ErrorFrame(c, "no tokenAddress passed");
  if (!token) return ErrorFrame(c, "token not found");

  const response = await getNeynar()
    .lookUpCastByHashOrWarpcastUrl(token.memeCastHash, "hash")
    .catch((e) => null);

  const imageUrl = !response
    ? ""
    : (await unwrapEmbedUrlFromCastResponse(response)) || "";

  const network = isDevelopment() ? "sepolia" : "base";
  const uniswapLink = uniswapBuyLink(network, tokenAddress);

  if (!response) return ErrorFrame(c, "Cast not found");
  return c.res({
    image: (
      <Box backgroundColor="background" padding="8" grow>
        <Columns gap="4" grow width="100%">
          <Column
            width="3/4"
            alignHorizontal="left"
            alignVertical="center"
            gap="8"
            paddingLeft="16"
            paddingTop="16"
          >
            <Image src="/fountain.png" width="100%" />
            <VStack
              alignHorizontal="left"
              gap="16"
              grow
              paddingTop="16"
              width="100%"
            >
              <TokenData
                name={token.name}
                symbol={token.symbol}
                deployer={response?.cast?.author?.username}
              />
            </VStack>
          </Column>
          <Column
            grow
            width="1/4"
            flexDirection="column"
            justifyContent="space-between"
            alignHorizontal="right"
            paddingTop="16"
          >
            <Box paddingRight="16">
              <Image
                objectFit="cover"
                src={imageUrl}
                width="224"
                height="224"
                borderRadius="18"
              />
            </Box>
            <img src="/Fountain-watermark.svg" alt="Metal" width="300px" />
          </Column>
        </Columns>
      </Box>
    ),
    intents: [
      <Button.Link href={CONNECTIONS.prod.channel}>
        deploy yours 👀
      </Button.Link>,
      <Button.Link href={`https://dexscreener.com/${network}/${tokenAddress}`}>
        dexscreener 🦅
      </Button.Link>,
      <Button.Link href={`${getAbsoluteUrl()}/api/redirect/?to=${uniswapLink}`}>
        buy 🦄
      </Button.Link>,
    ],
  });
});

export const GET = handle(Fountain);
export const POST = handle(Fountain);

export default Fountain;
