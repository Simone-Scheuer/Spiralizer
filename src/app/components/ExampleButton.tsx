'use client'

import { Button, ButtonProps, useColorMode } from '@chakra-ui/react'

interface ExampleButtonProps extends ButtonProps {
  variant?: 'solid' | 'outline'
}

export function ExampleButton({ variant = 'solid', children, ...props }: ExampleButtonProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  
  return (
    <Button
      onClick={toggleColorMode}
      variant={variant}
      colorScheme="brand"
      size="lg"
      {...props}
    >
      {children || `Switch to ${colorMode === 'light' ? 'Dark' : 'Light'} Mode`}
    </Button>
  )
} 