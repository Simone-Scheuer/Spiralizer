import { forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback } from 'react'
import { Box, IconButton, HStack } from '@chakra-ui/react'
import { useSpiralAnimation } from '../hooks/useSpiralAnimation'
import { SpiralConfig, SpiralConfigLocks } from '../models/types'
import { createRandomConfig } from '../utils/spiral'
import { AddIcon, MinusIcon, SmallCloseIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

// Fixed canvas size that's large enough to prevent pattern cutoff
const CANVAS_SIZE = 3000

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
    const containerRef = useRef<HTMLDivElement>(null)
    const viewportRef = useRef<HTMLDivElement>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [zoom, setZoom] = useState(1)
    const { startAnimation, resetCanvas } = useSpiralAnimation(canvasRef, config, CANVAS_SIZE)

    useImperativeHandle(ref, () => ({
      startAnimation,
      resetCanvas
    }))

    const handleZoomIn = useCallback(() => {
      setZoom(prev => Math.min(prev * 1.2, 5)) // Max zoom 5x
    }, [])

    const handleZoomOut = useCallback(() => {
      setZoom(prev => Math.max(prev / 1.2, 0.2)) // Min zoom 0.2x
    }, [])

    const toggleFullscreen = useCallback(async () => {
      if (typeof document === 'undefined') return; // Skip on server-side

      try {
        if (!isFullscreen && containerRef.current) {
          await containerRef.current.requestFullscreen()
        } else if (document.fullscreenElement) {
          await document.exitFullscreen()
        }
      } catch (error) {
        console.error('Error toggling fullscreen:', error)
      }
    }, [isFullscreen])

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
          case 'KeyF':
            e.preventDefault()
            toggleFullscreen()
            break
          case 'Equal': // Plus key
            if (e.metaKey || e.ctrlKey) {
              e.preventDefault()
              handleZoomIn()
            }
            break
          case 'Minus':
            if (e.metaKey || e.ctrlKey) {
              e.preventDefault()
              handleZoomOut()
            }
            break
          case 'Digit0':
            if (e.metaKey || e.ctrlKey) {
              e.preventDefault()
              setZoom(1)
            }
            break
        }
      }

      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }, [config, onChange, onReset, onResetToDefaults, locks, toggleFullscreen, handleZoomIn, handleZoomOut, setZoom])

    // Handle fullscreen changes
    useEffect(() => {
      if (typeof document === 'undefined') return; // Skip on server-side

      const handleFullscreenChange = () => {
        setIsFullscreen(document.fullscreenElement !== null)
      }

      document.addEventListener('fullscreenchange', handleFullscreenChange)
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    return (
      <Box 
        ref={containerRef}
        width="100%" 
        height="100%" 
        bg="black" 
        borderRadius={isFullscreen ? "0" : "md"} 
        overflow="hidden" 
        position="relative"
      >
        <Box
          ref={viewportRef}
          width="100%"
          height="100%"
          overflow="hidden"
          position="relative"
        >
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform={`translate(-50%, -50%) scale(${zoom})`}
            transformOrigin="center center"
            transition="transform 0.2s ease-out"
            width={`${CANVAS_SIZE}px`}
            height={`${CANVAS_SIZE}px`}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              style={{ 
                width: '100%', 
                height: '100%',
              }}
            />
          </Box>
        </Box>
        <HStack 
          position="absolute" 
          top={4} 
          right={4} 
          spacing={2}
          bg="whiteAlpha.200"
          backdropFilter="blur(10px)"
          borderRadius="md"
          p={2}
        >
          <IconButton
            aria-label="Zoom out"
            icon={<MinusIcon />}
            onClick={handleZoomOut}
            size="sm"
            variant="ghost"
            colorScheme="whiteAlpha"
            isDisabled={zoom <= 0.2}
          />
          <IconButton
            aria-label="Reset zoom"
            icon={<SmallCloseIcon />}
            onClick={() => setZoom(1)}
            size="sm"
            variant="ghost"
            colorScheme="whiteAlpha"
          >
            {Math.round(zoom * 100)}%
          </IconButton>
          <IconButton
            aria-label="Zoom in"
            icon={<AddIcon />}
            onClick={handleZoomIn}
            size="sm"
            variant="ghost"
            colorScheme="whiteAlpha"
            isDisabled={zoom >= 5}
          />
          <IconButton
            aria-label="Toggle fullscreen"
            icon={isFullscreen ? <ViewOffIcon /> : <ViewIcon />}
            onClick={toggleFullscreen}
            size="sm"
            variant="ghost"
            colorScheme="whiteAlpha"
          />
        </HStack>
      </Box>
    )
  }
)

SpiralCanvas.displayName = 'SpiralCanvas' 