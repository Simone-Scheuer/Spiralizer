import { SpiralConfig, SpiralConfigLocks } from '../models/types'

export const BLEND_MODES = [
  'source-over',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity'
] as const

// Helper function to get random number in range
export const randomInRange = (min: number, max: number, step: number = 1) => {
  const steps = Math.floor((max - min) / step)
  return min + (Math.floor(Math.random() * steps) * step)
}

// Helper function to get random color
export const randomColor = () => {
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Function to create new random settings while respecting locks
export const createRandomConfig = (currentConfig: SpiralConfig, locks: SpiralConfigLocks): SpiralConfig => {
  // Log current locks state for debugging
  console.log('Creating random config with locks:', locks)
  
  // Create new random settings, respecting locks
  const newConfig: SpiralConfig = {
    ...currentConfig,
    stepLength: locks.stepLength ? currentConfig.stepLength : randomInRange(0.1, 100, 0.1),
    angleChange: locks.angleChange ? currentConfig.angleChange : randomInRange(0.1, 180, 0.1),
    angleIncrement: locks.angleIncrement ? currentConfig.angleIncrement : randomInRange(-2, 2, 0.01),
    speed: locks.speed ? currentConfig.speed : randomInRange(0, 300, 1),
    color: locks.color ? currentConfig.color : randomColor(),
    lineWidth: locks.lineWidth ? currentConfig.lineWidth : randomInRange(0.1, 20, 0.1),
    multiLineCount: locks.multiLineCount ? currentConfig.multiLineCount : randomInRange(1, 30, 1),
    multiLineSpacing: locks.multiLineSpacing ? currentConfig.multiLineSpacing : randomInRange(0, 50, 1),
    stepMultiplier: locks.stepMultiplier ? currentConfig.stepMultiplier : randomInRange(0, 0.1, 0.001),
    rotationOffset: locks.rotationOffset ? currentConfig.rotationOffset : randomInRange(0, 360, 1),
    fadeOpacity: locks.fadeOpacity ? currentConfig.fadeOpacity : Math.random() > 0.5,
    rainbowMode: locks.rainbowMode ? currentConfig.rainbowMode : Math.random() > 0.5,
    rainbowSpeed: locks.rainbowSpeed ? currentConfig.rainbowSpeed : randomInRange(0.1, 5, 0.1),
    blendMode: locks.blendMode ? currentConfig.blendMode : BLEND_MODES[Math.floor(Math.random() * BLEND_MODES.length)],
    originX: locks.originX ? currentConfig.originX : randomInRange(0, 1, 0.01),
    originY: locks.originY ? currentConfig.originY : randomInRange(0, 1, 0.01),
    isPaused: true // Always start paused with new random settings
  }
  
  // Log what's being randomized vs locked for debugging
  console.log('Randomization result:', {
    locks,
    oldConfig: currentConfig,
    newConfig
  })
  
  return newConfig
} 