/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-key */
/** @jsxImportSource frog/jsx */
// @ts-nocheck
import { Button, FrameContext } from "frog";
import { Box, Heading, Text, VStack, Columns, Column } from "./ui";
import { NO_CACHE_HEADER } from "@/app/config/constants";

export const ErrorFrame = (c: FrameContext<any, any, any>, message: string) =>
  c.res({
    headers: NO_CACHE_HEADER,
    image: (
      <Box
        grow
        alignHorizontal="center"
        alignVertical="center"
        backgroundColor="background"
        padding="32"
      >
        <VStack gap="4">
          <Heading>Error</Heading>
          <Text>{message}</Text>
        </VStack>
      </Box>
    ),
    intents: [<Button.Reset>🏠</Button.Reset>],
  });

export const Layout = ({
  children,
  imgWidth = 800,
}: {
  children: JSX.Element | JSX.Element[];
  imgWidth?: number;
}) => (
  <Box
    grow
    alignHorizontal="center"
    alignVertical="center"
    backgroundColor="background"
    padding="8"
  >
    <img
      src="/fountain-logo.png"
      alt="fountain"
      width={`${imgWidth}px`}
      style={{ marginTop: 50 }}
    />
    {children}
    <div tw="flex justify-end w-full">
      <img src="/fountain-watermark.svg" alt="Metal" width="300px" />
    </div>
  </Box>
);

export const TokenData = ({
  name,
  symbol,
  price,
  supply,
  burned,
  deployer,
}: {
  name?: string;
  symbol?: string;
  price?: string;
  supply?: string;
  burned?: string;
  deployer?: string;
}) => (
  <Box grow width="100%">
    <Columns grow>
      <Column width="1/2" display="flex" flexDirection="column" gap="8">
        {deployer && (
          <Text size="20" color="blue">
            deployer:
          </Text>
        )}
        <Text size="20" color="blue">
          name:
        </Text>
        <Text size="20" color="blue">
          symbol:
        </Text>
      </Column>
      <Column width="1/2" display="flex" flexDirection="column" gap="8">
        {deployer && (
          <Text size="20" color="text">
            @{deployer}
          </Text>
        )}
        <Text size="20" color="text">
          {name}
        </Text>
        <Text size="20" color="text">
          ${symbol}
        </Text>
      </Column>
    </Columns>
  </Box>
);
