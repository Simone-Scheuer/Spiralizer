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

// Predefined gradient pairs for better-looking random gradients
const GRADIENT_PAIRS: [string, string][] = [
  ['#0066ff', '#00ffff'], // Blue to Cyan
  ['#ff0066', '#ff00ff'], // Red to Magenta
  ['#66ff00', '#ffff00'], // Green to Yellow
  ['#ff3300', '#ffcc00'], // Orange to Yellow
  ['#6600ff', '#ff00ff'], // Purple to Magenta
  ['#00ff66', '#00ffff'], // Mint to Cyan
  ['#ff0033', '#ff9900'], // Red to Orange
  ['#3300ff', '#00ffff'], // Deep Blue to Cyan
]

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
    // New gradient options
    gradientMode: locks.gradientMode ? currentConfig.gradientMode : Math.random() > 0.5,
    gradientColors: locks.gradientColors ? currentConfig.gradientColors : 
      Math.random() > 0.3 ? 
        GRADIENT_PAIRS[Math.floor(Math.random() * GRADIENT_PAIRS.length)] : 
        [randomColor(), randomColor()],
    gradientSpeed: locks.gradientSpeed ? currentConfig.gradientSpeed : randomInRange(0.1, 5, 0.1),
    gradientReverse: locks.gradientReverse ? currentConfig.gradientReverse : Math.random() > 0.5,
    // Rest of existing options
    blendMode: locks.blendMode ? currentConfig.blendMode : BLEND_MODES[Math.floor(Math.random() * BLEND_MODES.length)],
    //originX: locks.originX ? currentConfig.originX : randomInRange(0, 1, 0.01),
    //originY: locks.originY ? currentConfig.originY : randomInRange(0, 1, 0.01),
    // New line effects
    lineDash: locks.lineDash ? currentConfig.lineDash : Math.random() > 0.7 ? [randomInRange(1, 20, 1), randomInRange(1, 20, 1)] : [],
    lineCap: locks.lineCap ? currentConfig.lineCap : ['butt', 'round', 'square'][Math.floor(Math.random() * 3)] as CanvasLineCap,
    lineJoin: locks.lineJoin ? currentConfig.lineJoin : ['round', 'bevel', 'miter'][Math.floor(Math.random() * 3)] as CanvasLineJoin,
    baseOpacity: locks.baseOpacity ? currentConfig.baseOpacity : randomInRange(0.1, 1, 0.01),
    // New motion controls
    reverseDirection: locks.reverseDirection ? currentConfig.reverseDirection : Math.random() > 0.5,
    acceleration: locks.acceleration ? currentConfig.acceleration : randomInRange(-0.05, 0.05, 0.001),
    oscillate: locks.oscillate ? currentConfig.oscillate : Math.random() > 0.7, // Less frequent to keep some patterns stable
    oscillationSpeed: locks.oscillationSpeed ? currentConfig.oscillationSpeed : randomInRange(0.1, 3, 0.1),
    isPaused: true, // Always start paused with new random settings
    // Preserve audio settings
    audioEnabled: currentConfig.audioEnabled,
    audioVolume: currentConfig.audioVolume
  }
  
  // Log what's being randomized vs locked for debugging
  console.log('Randomization result:', {
    locks,
    oldConfig: currentConfig,
    newConfig
  })
  
  return newConfig
} 