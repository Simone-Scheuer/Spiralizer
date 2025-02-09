'use client'

import { ColorModeScript } from '@chakra-ui/react'
import { theme } from './index'

export function ColorMode() {
  return <ColorModeScript initialColorMode={theme.config.initialColorMode} />
} 