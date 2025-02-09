'use client'

import { Box, Container, Grid, Heading } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { SpiralCanvas, SpiralCanvasRef } from './features/SpiralCanvas'
import { SpiralControls } from './features/SpiralControls'
import { SpiralConfig } from './models/types'

const defaultConfig: SpiralConfig = {
  stepLength: 10,
  angleChange: 30,
  angleIncrement: 0.2,  // Small positive value for outward spiral
  speed: 50,
  color: '#00ff00',
  lineWidth: 2,
  isPaused: false
}

export default function Home() {
  const [config, setConfig] = useState<SpiralConfig>(defaultConfig)
  const canvasRef = useRef<SpiralCanvasRef>(null)

  const handleReset = () => {
    setConfig(defaultConfig)
    canvasRef.current?.startAnimation()
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Heading size="2xl" mb={8} textAlign="center">
        Spiralizer
      </Heading>
      
      <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap={6}>
        <SpiralControls 
          config={config} 
          onChange={setConfig}
          onReset={handleReset}
        />
        <Box height="600px">
          <SpiralCanvas ref={canvasRef} config={config} />
        </Box>
      </Grid>
    </Container>
  )
}
