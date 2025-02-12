'use client'

import { Box, Container, Grid, Heading, Text, VStack } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { SpiralCanvas, SpiralCanvasRef } from './features/SpiralCanvas'
import { SpiralControls } from './features/SpiralControls'
import { SpiralConfig, SpiralConfigLocks } from './models/types'

const defaultConfig: SpiralConfig = {
  stepLength: 10,       // Larger steps for classic spiral
  angleChange: 15,      // Fixed angle for consistent spiral
  angleIncrement: 0,    // No increment for classic spiral
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
  blendMode: 'source-over',
  // Origin position (0.5, 0.5 is center)
  originX: 0.5,
  originY: 0.5
}

export default function Home() {
  const [config, setConfig] = useState<SpiralConfig>(defaultConfig)
  const [locks, setLocks] = useState<SpiralConfigLocks>(() => {
    // Initialize with all settings unlocked
    const initialLocks = {} as SpiralConfigLocks
    // Get all config keys except isPaused
    const configKeys = Object.keys(defaultConfig).filter(key => key !== 'isPaused')
    
    // Try to load locks from localStorage
    try {
      const savedLocks = localStorage.getItem('spiralLocks')
      if (savedLocks) {
        const parsed = JSON.parse(savedLocks)
        // Ensure all config keys are present in loaded locks
        configKeys.forEach(key => {
          if (!(key in parsed)) {
            parsed[key] = false
          }
        })
        return parsed
      }
    } catch (e) {
      console.error('Error loading locks from localStorage:', e)
    }

    // If no saved locks or error, initialize all to unlocked
    configKeys.forEach(key => {
      initialLocks[key as keyof SpiralConfigLocks] = false
    })
    return initialLocks
  })
  const canvasRef = useRef<SpiralCanvasRef>(null)

  const handleReset = () => {
    // Reset canvas and ensure it's paused
    setConfig(prev => ({ ...prev, isPaused: true }))
    // Only reset the canvas, don't start animation
    setTimeout(() => {
      canvasRef.current?.resetCanvas()
    }, 0)
  }

  const handleResetToDefaults = () => {
    // Reset all settings to defaults (which includes isPaused: true)
    setConfig({ ...defaultConfig, isPaused: true })
    // Only reset the canvas, don't start animation
    setTimeout(() => {
      canvasRef.current?.resetCanvas()
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
            onResetToDefaults={handleResetToDefaults}
            locks={locks}
            onLocksChange={setLocks}
          />
          <Box 
            height="85vh" 
            borderRadius="xl" 
            overflow="hidden"
            boxShadow="2xl"
          >
            <SpiralCanvas 
              ref={canvasRef} 
              config={config} 
              onChange={setConfig}
              onReset={handleReset}
              onResetToDefaults={handleResetToDefaults}
              locks={locks}
            />
          </Box>
        </Grid>
      </Container>
    </Box>
  )
}
