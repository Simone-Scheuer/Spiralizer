export interface SpiralConfig {
  stepLength: number      // Length of each step
  angleChange: number     // Angle change in degrees after each step
  angleIncrement: number  // How much to change the angle after each step
  speed: number          // Animation speed (ms per step)
  color: string          // Line color
  lineWidth: number      // Width of the spiral line
  isPaused: boolean      // Whether the animation is paused
  // Advanced options
  multiLineCount: number // Number of parallel lines to draw
  multiLineSpacing: number // Spacing between parallel lines
  stepMultiplier: number // How much to increase step length over time
  fadeOpacity: boolean   // Whether to fade lines over time
  rotationOffset: number // Additional rotation offset per line
  rainbowMode: boolean   // Whether to cycle through colors
  rainbowSpeed: number   // Speed of color cycling
  blendMode: string     // Canvas blend mode for interesting effects
  // Origin position (0-1 represents percentage of canvas size)
  originX: number       // X position of spiral origin (0-1)
  originY: number       // Y position of spiral origin (0-1)
  // New line effects
  lineDash: number[]    // Pattern for dashed lines [dash length, gap length]
  lineCap: CanvasLineCap // Line end style: 'butt', 'round', 'square'
  lineJoin: CanvasLineJoin // Line corner style: 'round', 'bevel', 'miter'
  baseOpacity: number   // Base opacity for lines (0-1)
  // New motion controls
  reverseDirection: boolean // Whether to spiral inward instead of outward
  acceleration: number  // Speed change per step (can be negative)
  oscillate: boolean   // Whether parameters should oscillate
  oscillationSpeed: number // Speed of parameter oscillation
  // Audio settings
  audioEnabled: boolean // Whether sound is enabled
  audioVolume: number  // Sound volume (0-1)
  // Screensaver mode
  screensaverMode: boolean // Whether to automatically cycle through patterns
}

// Type for tracking which settings are locked
export type SpiralConfigLocks = {
  [K in keyof Omit<SpiralConfig, 'isPaused'>]: boolean
}

// Type for a saved preset
export interface SpiralPreset {
  id: string
  name: string
  config: Omit<SpiralConfig, 'isPaused' | 'audioEnabled' | 'audioVolume' | 'screensaverMode'>
  createdAt: number
} 