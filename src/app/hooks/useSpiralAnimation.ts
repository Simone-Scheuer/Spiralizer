import { RefObject, useCallback, useRef, useEffect } from 'react'
import { SpiralConfig } from '../models/types'

export const useSpiralAnimation = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  config: SpiralConfig
) => {
  const animationFrameRef = useRef<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentAngleRef = useRef<number>(0)
  const stepCountRef = useRef<number>(0)
  const currentPosRef = useRef({ x: 0, y: 0 })
  const isInitializedRef = useRef<boolean>(false)
  const hueRef = useRef<number>(0)

  const cleanup = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const getLineColor = useCallback((lineIndex: number) => {
    if (config.rainbowMode) {
      const hue = (hueRef.current + (lineIndex * 30)) % 360
      return `hsla(${hue}, 100%, 50%, ${config.fadeOpacity ? Math.max(0.1, 1 - stepCountRef.current * 0.001) : 1})`
    }
    return config.fadeOpacity 
      ? `${config.color}${Math.floor(Math.max(0.1, 1 - stepCountRef.current * 0.001) * 255).toString(16).padStart(2, '0')}`
      : config.color
  }, [config.rainbowMode, config.color, config.fadeOpacity])

  const drawSpiral = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize canvas size and starting position only once
    if (!isInitializedRef.current) {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      currentPosRef.current = {
        x: canvas.width / 2,
        y: canvas.height / 2
      }
      isInitializedRef.current = true
      stepCountRef.current = 0
      hueRef.current = 0
    }

    // Set global composite operation
    ctx.globalCompositeOperation = config.blendMode as GlobalCompositeOperation

    // Draw multiple lines if configured
    for (let i = 0; i < config.multiLineCount; i++) {
      const angleOffset = (i * config.rotationOffset) * (Math.PI / 180)
      const baseAngle = config.angleChange + (config.angleIncrement * stepCountRef.current)
      const angleInRadians = (currentAngleRef.current * Math.PI) / 180 + angleOffset

      // Calculate next position with dynamic step length
      const stepMultiplier = 1 + (stepCountRef.current * config.stepMultiplier)
      const currentStepLength = config.stepLength * stepMultiplier
      const spacing = i * config.multiLineSpacing
      
      const nextX = currentPosRef.current.x + 
        Math.cos(angleInRadians) * (currentStepLength + spacing)
      const nextY = currentPosRef.current.y + 
        Math.sin(angleInRadians) * (currentStepLength + spacing)

      // Draw line
      ctx.beginPath()
      ctx.strokeStyle = getLineColor(i)
      ctx.lineWidth = config.lineWidth
      ctx.moveTo(currentPosRef.current.x, currentPosRef.current.y)
      ctx.lineTo(nextX, nextY)
      ctx.stroke()
    }

    // Update position and continue the path
    const baseAngle = config.angleChange + (config.angleIncrement * stepCountRef.current)
    const angleInRadians = currentAngleRef.current * Math.PI / 180
    const stepMultiplier = 1 + (stepCountRef.current * config.stepMultiplier)
    const currentStepLength = config.stepLength * stepMultiplier
    
    currentPosRef.current = {
      x: currentPosRef.current.x + Math.cos(angleInRadians) * currentStepLength,
      y: currentPosRef.current.y + Math.sin(angleInRadians) * currentStepLength
    }
    
    // Update angle and step count
    currentAngleRef.current += baseAngle
    stepCountRef.current++

    // Update rainbow hue if enabled
    if (config.rainbowMode) {
      hueRef.current = (hueRef.current + config.rainbowSpeed) % 360
    }

    // Only continue animation if not paused
    if (!config.isPaused) {
      timeoutRef.current = setTimeout(() => {
        animationFrameRef.current = requestAnimationFrame(drawSpiral)
      }, config.speed)
    }
  }, [canvasRef, config, getLineColor])

  const startAnimation = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clean up any existing animation
    cleanup()

    // Reset canvas and animation state
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    currentPosRef.current = { x: 0, y: 0 }
    currentAngleRef.current = 0
    stepCountRef.current = 0
    hueRef.current = 0
    isInitializedRef.current = false

    // Start new animation if not paused
    if (!config.isPaused) {
      animationFrameRef.current = requestAnimationFrame(drawSpiral)
    }
  }, [canvasRef, drawSpiral, cleanup, config.isPaused])

  // Handle pausing and resuming
  useEffect(() => {
    if (config.isPaused) {
      cleanup()
    } else if (isInitializedRef.current) {
      animationFrameRef.current = requestAnimationFrame(drawSpiral)
    }
  }, [config.isPaused, drawSpiral, cleanup])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return { startAnimation }
} 