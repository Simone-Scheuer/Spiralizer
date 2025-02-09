export interface SpiralConfig {
  stepLength: number      // Length of each step
  angleChange: number     // Angle change in degrees after each step
  angleIncrement: number  // How much to change the angle after each rotation
  speed: number          // Animation speed (ms per step)
  color: string          // Line color
  lineWidth: number      // Width of the spiral line
  isPaused: boolean      // Whether the animation is paused
} 