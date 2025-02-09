import { RefObject, useCallback, useRef, useEffect } from 'react'
import { SpiralConfig } from '../models/types'

export const useSpiralAnimation = (
  canvasRef: RefObject<HTMLCanvasElement>,
  config: SpiralConfig
) => {
  const animationFrameRef = useRef<number | NodeJS.Timeout>()
  const currentAngleRef = useRef(0)
  const currentAngleChangeRef = useRef(config.angleChange)
  const rotationCountRef = useRef(0)
  const currentPosRef = useRef({ x: 0, y: 0 })
  const isInitializedRef = useRef(false)

  const drawSpiral = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || config.isPaused) return

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
      currentAngleChangeRef.current = config.angleChange
      rotationCountRef.current = 0
    }

    // Calculate next position
    const angleInRadians = (currentAngleRef.current * Math.PI) / 180
    const nextX = currentPosRef.current.x + Math.cos(angleInRadians) * config.stepLength
    const nextY = currentPosRef.current.y + Math.sin(angleInRadians) * config.stepLength

    // Draw line
    ctx.beginPath()
    ctx.strokeStyle = config.color
    ctx.lineWidth = config.lineWidth
    ctx.moveTo(currentPosRef.current.x, currentPosRef.current.y)
    ctx.lineTo(nextX, nextY)
    ctx.stroke()

    // Update position and angle
    currentPosRef.current = { x: nextX, y: nextY }
    currentAngleRef.current += currentAngleChangeRef.current

    // Check if we've completed a rotation (360 degrees)
    if (currentAngleRef.current >= (rotationCountRef.current + 1) * 360) {
      rotationCountRef.current++
      // Gradually change the angle for the next rotation
      currentAngleChangeRef.current += config.angleIncrement
    }

    // Schedule next frame
    animationFrameRef.current = setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(drawSpiral)
    }, config.speed)
  }, [canvasRef, config])

  const startAnimation = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Only clear and reset when explicitly starting a new animation
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    currentPosRef.current = { x: 0, y: 0 }
    currentAngleRef.current = 0
    currentAngleChangeRef.current = config.angleChange
    rotationCountRef.current = 0
    isInitializedRef.current = false

    animationFrameRef.current = requestAnimationFrame(drawSpiral)
  }, [canvasRef, drawSpiral])

  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      if (typeof animationFrameRef.current === 'number') {
        cancelAnimationFrame(animationFrameRef.current)
      } else {
        clearTimeout(animationFrameRef.current)
      }
    }
  }, [])

  // Handle pausing and resuming
  useEffect(() => {
    if (config.isPaused) {
      stopAnimation()
    } else {
      animationFrameRef.current = requestAnimationFrame(drawSpiral)
    }
  }, [config.isPaused, drawSpiral, stopAnimation])

  return { startAnimation, stopAnimation }
} 