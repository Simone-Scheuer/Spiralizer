import { RefObject, useCallback, useRef, useEffect } from 'react'
import { SpiralConfig } from '../models/types'
import { shepardTone } from '../utils/audio'

export const useSpiralAnimation = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  config: SpiralConfig,
  canvasSize: number = 1000 // Default size if not specified
) => {
  const animationFrameRef = useRef<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentAngleRef = useRef<number>(0)
  const stepCountRef = useRef<number>(0)
  const currentPosRef = useRef({ x: 0, y: 0 })
  const isInitializedRef = useRef<boolean>(false)
  const hueRef = useRef<number>(0)

  // Handle audio state
  useEffect(() => {
    if (config.audioEnabled && !config.isPaused) {
      shepardTone?.start()
      shepardTone?.setVolume(config.audioVolume)
    } else {
      shepardTone?.stop()
    }

    return () => {
      shepardTone?.stop()
    }
  }, [config.audioEnabled, config.audioVolume, config.isPaused])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      shepardTone?.cleanup()
    }
  }, [])

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
  }, [config.rainbowMode, config.color, config.fadeOpacity, canvasRef])

  const drawSpiral = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize canvas size if needed
    if (!isInitializedRef.current) {
      // Set canvas dimensions
      canvas.width = canvasSize
      canvas.height = canvasSize
      
      // Set initial position to origin
      currentPosRef.current = {
        x: canvas.width * config.originX,
        y: canvas.height * config.originY
      }
      
      // Reset animation state
      currentAngleRef.current = 0
      stepCountRef.current = 0
      hueRef.current = 0
      
      isInitializedRef.current = true
    }

    // Set global composite operation
    ctx.globalCompositeOperation = config.blendMode as GlobalCompositeOperation

    // Apply line effects
    ctx.lineCap = config.lineCap
    ctx.lineJoin = config.lineJoin
    if (config.lineDash.length > 0) {
      ctx.setLineDash(config.lineDash)
    } else {
      ctx.setLineDash([])
    }

    // Calculate current speed with acceleration
    const currentSpeed = config.speed + (stepCountRef.current * config.acceleration)

    // Update Shepard tone if enabled
    if (config.audioEnabled) {
      const normalizedProgress = (currentAngleRef.current % 360) / 360
      const normalizedSpeed = 1 - (currentSpeed / 300) // Normalize speed to 0-1 range
      shepardTone?.updateTone({
        progress: normalizedProgress,
        speed: normalizedSpeed,
        stepLength: config.stepLength,
        angleChange: config.angleChange,
        multiLineCount: config.multiLineCount,
        stepMultiplier: config.stepMultiplier,
        oscillate: config.oscillate,
        oscillationSpeed: config.oscillationSpeed,
        reverseDirection: config.reverseDirection
      })
    }

    // Draw multiple lines if configured
    for (let i = 0; i < config.multiLineCount; i++) {
      const angleOffset = (i * config.rotationOffset) * (Math.PI / 180)
      let angleInRadians = (currentAngleRef.current * Math.PI) / 180 + angleOffset

      // Apply oscillation if enabled
      if (config.oscillate) {
        const oscillation = Math.sin(stepCountRef.current * config.oscillationSpeed * 0.01) * Math.PI / 4
        angleInRadians += oscillation
      }

      // Calculate next position with dynamic step length
      const stepMultiplier = 1 + (stepCountRef.current * config.stepMultiplier)
      const currentStepLength = config.stepLength * stepMultiplier * (config.reverseDirection ? -1 : 1)
      const spacing = i * config.multiLineSpacing
      
      const nextX = currentPosRef.current.x + 
        Math.cos(angleInRadians) * (currentStepLength + spacing)
      const nextY = currentPosRef.current.y + 
        Math.sin(angleInRadians) * (currentStepLength + spacing)

      // Calculate opacity
      let opacity = config.baseOpacity
      if (config.fadeOpacity) {
        opacity *= Math.max(0.1, 1 - stepCountRef.current * 0.001)
      }

      // Draw line
      ctx.beginPath()
      ctx.strokeStyle = getLineColor(i)
      ctx.globalAlpha = opacity
      ctx.lineWidth = config.lineWidth
      ctx.moveTo(currentPosRef.current.x, currentPosRef.current.y)
      ctx.lineTo(nextX, nextY)
      ctx.stroke()
    }

    // Reset global alpha for next frame
    ctx.globalAlpha = 1

    // Update position and continue the path
    const angleInRadians = currentAngleRef.current * Math.PI / 180
    const stepMultiplier = 1 + (stepCountRef.current * config.stepMultiplier)
    const currentStepLength = config.stepLength * stepMultiplier * (config.reverseDirection ? -1 : 1)
    
    currentPosRef.current = {
      x: currentPosRef.current.x + Math.cos(angleInRadians) * currentStepLength,
      y: currentPosRef.current.y + Math.sin(angleInRadians) * currentStepLength
    }
    
    // Update angle and step count
    currentAngleRef.current += config.angleChange + (config.angleIncrement * stepCountRef.current)
    stepCountRef.current++

    // Update rainbow hue if enabled
    if (config.rainbowMode) {
      hueRef.current = (hueRef.current + config.rainbowSpeed) % 360
    }

    // Only continue animation if not paused
    if (!config.isPaused) {
      timeoutRef.current = setTimeout(() => {
        animationFrameRef.current = requestAnimationFrame(drawSpiral)
      }, currentSpeed)
    }
  }, [
    config.angleChange,
    config.angleIncrement,
    config.blendMode,
    config.color,
    config.fadeOpacity,
    config.isPaused,
    config.lineWidth,
    config.multiLineCount,
    config.multiLineSpacing,
    config.originX,
    config.originY,
    config.rainbowMode,
    config.rainbowSpeed,
    config.rotationOffset,
    config.speed,
    config.stepLength,
    config.stepMultiplier,
    config.lineCap,
    config.lineJoin,
    config.lineDash,
    config.baseOpacity,
    config.reverseDirection,
    config.acceleration,
    config.oscillate,
    config.oscillationSpeed,
    config.audioEnabled,
    getLineColor,
    canvasSize
  ])

  const resetCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    cleanup()
    
    // Reset canvas dimensions and clear
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Reset all animation state
    isInitializedRef.current = false
    currentAngleRef.current = 0
    stepCountRef.current = 0
    hueRef.current = 0
    currentPosRef.current = {
      x: canvas.width * config.originX,
      y: canvas.height * config.originY
    }
  }, [cleanup, config.originX, config.originY, canvasRef])

  // Handle pausing and resuming
  useEffect(() => {
    cleanup()
    
    if (!config.isPaused) {
      // Don't reset initialization when resuming
      animationFrameRef.current = requestAnimationFrame(drawSpiral)
    }
  }, [config.isPaused, drawSpiral, cleanup])

  // Handle origin changes
  useEffect(() => {
    // Only reinitialize if already initialized to prevent double initialization
    if (isInitializedRef.current) {
      const canvas = canvasRef.current
      if (!canvas) return
      
      // Update current position to new origin
      currentPosRef.current = {
        x: canvas.width * config.originX,
        y: canvas.height * config.originY
      }
    }
  }, [config.originX, config.originY, canvasRef])

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      // Update canvas dimensions
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      
      // Update position to maintain relative origin position
      currentPosRef.current = {
        x: canvas.width * config.originX,
        y: canvas.height * config.originY
      }
      
      // Force redraw
      if (!config.isPaused) {
        animationFrameRef.current = requestAnimationFrame(drawSpiral)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [drawSpiral, config.isPaused, config.originX, config.originY, canvasRef])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return { startAnimation: drawSpiral, resetCanvas }
} 