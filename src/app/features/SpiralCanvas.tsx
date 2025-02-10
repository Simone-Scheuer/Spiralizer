import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { useSpiralAnimation } from '../hooks/useSpiralAnimation'
import { SpiralConfig } from '../models/types'

interface SpiralCanvasProps {
  config: SpiralConfig
  onChange: (config: SpiralConfig) => void
}

export interface SpiralCanvasRef {
  startAnimation: () => void
  resetCanvas: () => void
}

export const SpiralCanvas = forwardRef<SpiralCanvasRef, SpiralCanvasProps>(
  ({ config, onChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { startAnimation, resetCanvas } = useSpiralAnimation(canvasRef, config)

    useImperativeHandle(ref, () => ({
      startAnimation,
      resetCanvas
    }))

    // Handle keyboard shortcuts
    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        // Only handle if not typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return
        }
        
        // Space to toggle pause
        if (e.code === 'Space') {
          e.preventDefault() // Prevent page scroll
          onChange({ ...config, isPaused: !config.isPaused })
        }
      }

      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }, [config, onChange])

    return (
      <Box width="100%" height="100%" bg="black" borderRadius="md" overflow="hidden" position="relative">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>
    )
  }
) 