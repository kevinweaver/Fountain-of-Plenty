import { createSystem, colors } from 'frog/ui';

export const { Box, Columns, Column, Heading, HStack, Rows, Row, Spacer, Text, Image, VStack, vars } = createSystem({
  colors: {
    ...colors.dark,
    text: '#D0DDFF',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    background: '#151516',
    blue: '#316BFF',
    red: '#FF0000'
  },
  fonts: {
    default: [
      {
        name: 'Share Tech Mono',
        source: 'google',
        weight: 400
      }
    ]
  }
});

export type UIColors = keyof typeof vars.colors;
