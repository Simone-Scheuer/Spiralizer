import { extendTheme } from '@chakra-ui/react'
import { theme as themeConfig } from './theme'

export const theme = extendTheme(themeConfig)

// For TypeScript support
export type Theme = typeof theme 