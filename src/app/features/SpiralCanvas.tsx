import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { useSpiralAnimation } from '../hooks/useSpiralAnimation'
import { SpiralConfig, SpiralConfigLocks } from '../models/types'
import { createRandomConfig } from '../utils/spiral'

interface SpiralCanvasProps {
  config: SpiralConfig
  onChange: (config: SpiralConfig) => void
  onReset: () => void
  onResetToDefaults: () => void
  locks: SpiralConfigLocks
}

export interface SpiralCanvasRef {
  startAnimation: () => void
  resetCanvas: () => void
}

export const SpiralCanvas = forwardRef<SpiralCanvasRef, SpiralCanvasProps>(
  ({ config, onChange, onReset, onResetToDefaults, locks }, ref) => {
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
        
        switch (e.code) {
          case 'Space':
            e.preventDefault() // Prevent page scroll
            onChange({ ...config, isPaused: !config.isPaused })
            break
          case 'KeyR':
            e.preventDefault()
            // Use the shared randomization function
            const newConfig = createRandomConfig(config, locks)
            onChange(newConfig)
            break
          case 'KeyU':
            e.preventDefault()
            onReset()
            break
          case 'KeyD':
            e.preventDefault()
            onResetToDefaults()
            break
        }
      }

      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }, [config, onChange, onReset, onResetToDefaults, locks])

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

SpiralCanvas.displayName = 'SpiralCanvas' 