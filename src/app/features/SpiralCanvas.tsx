import { forwardRef, useEffect, useImperativeHandle, useRef, useCallback } from 'react'
import { Box } from '@chakra-ui/react'
import { useSpiralAnimation } from '../hooks/useSpiralAnimation'
import { SpiralConfig } from '../models/types'

interface SpiralCanvasProps {
  config: SpiralConfig
}

export interface SpiralCanvasRef {
  startAnimation: () => void
  resetCanvas: () => void
}

export const SpiralCanvas = forwardRef<SpiralCanvasRef, SpiralCanvasProps>(
  ({ config }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { startAnimation, resetCanvas } = useSpiralAnimation(canvasRef, config)

    useImperativeHandle(ref, () => ({
      startAnimation,
      resetCanvas
    }))

    const drawOriginIndicator = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Draw crosshair
      ctx.save()
      ctx.globalCompositeOperation = 'source-over'
      
      const x = canvas.width * config.originX
      const y = canvas.height * config.originY
      const size = 10

      // Draw outer circle
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw crosshair lines
      ctx.beginPath()
      ctx.moveTo(x - size, y)
      ctx.lineTo(x + size, y)
      ctx.moveTo(x, y - size)
      ctx.lineTo(x, y + size)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw center dot
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, Math.PI * 2)
      ctx.fillStyle = 'white'
      ctx.fill()

      ctx.restore()
    }, [config.originX, config.originY])

    useEffect(() => {
      if (config.isPaused) {
        drawOriginIndicator()
      }
    }, [config.isPaused, config.originX, config.originY, drawOriginIndicator])

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