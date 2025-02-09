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
} 