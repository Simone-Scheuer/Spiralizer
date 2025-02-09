import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { Box } from '@chakra-ui/react'
import { useSpiralAnimation } from '../hooks/useSpiralAnimation'
import { SpiralConfig } from '../models/types'

interface SpiralCanvasProps {
  config: SpiralConfig
}

export interface SpiralCanvasRef {
  startAnimation: () => void
}

export const SpiralCanvas = forwardRef<SpiralCanvasRef, SpiralCanvasProps>(
  ({ config }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { startAnimation, stopAnimation } = useSpiralAnimation(canvasRef, config)

    useImperativeHandle(ref, () => ({
      startAnimation
    }))

    useEffect(() => {
      startAnimation()
      return () => stopAnimation()
    }, [config, startAnimation, stopAnimation])

    return (
      <Box width="100%" height="100%" bg="black" borderRadius="md" overflow="hidden">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>
    )
  }
) 