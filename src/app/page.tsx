'use client'

import { Box, Container, Grid, Heading, Text, VStack } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { SpiralCanvas, SpiralCanvasRef } from './features/SpiralCanvas'
import { SpiralControls } from './features/SpiralControls'
import { SpiralConfig } from './models/types'

const defaultConfig: SpiralConfig = {
  stepLength: 5,        // Start with smaller steps for tighter initial spiral
  angleChange: 15,      // Smaller angle for smoother spiral
  angleIncrement: 0.05, // Subtle angle increment
  speed: 20,           // Faster animation for smoother appearance
  color: '#00ff00',
  lineWidth: 2,
  isPaused: true,
  // Advanced options
  multiLineCount: 1,
  multiLineSpacing: 10,
  stepMultiplier: 0.01,
  fadeOpacity: false,
  rotationOffset: 0,
  rainbowMode: false,
  rainbowSpeed: 1,
  blendMode: 'source-over'
}

export default function Home() {
  const [config, setConfig] = useState<SpiralConfig>(defaultConfig)
  const canvasRef = useRef<SpiralCanvasRef>(null)

  const handleReset = () => {
    // Only pause the animation and reset the canvas
    setConfig(prev => ({ ...prev, isPaused: true }))
    // Use setTimeout to ensure the pause state is set before restarting
    setTimeout(() => {
      canvasRef.current?.startAnimation()
    }, 0)
  }

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Container maxW="container.2xl" py={10}>
        <VStack spacing={6} mb={10}>
          <Heading size="2xl" bgGradient="linear(to-r, cyan.400, purple.500)" bgClip="text">
            Spiralizer
          </Heading>
          <Text fontSize="lg" color="gray.400" textAlign="center">
            Create mesmerizing spiral patterns with interactive controls
          </Text>
        </VStack>
        
        <Grid 
          templateColumns={{ base: '1fr', lg: '400px 1fr' }} 
          gap={8}
          alignItems="start"
        >
          <SpiralControls 
            config={config} 
            onChange={setConfig}
            onReset={handleReset}
          />
          <Box 
            height="85vh" 
            borderRadius="xl" 
            overflow="hidden"
            boxShadow="2xl"
          >
            <SpiralCanvas ref={canvasRef} config={config} />
          </Box>
        </Grid>
      </Container>
    </Box>
  )
}
