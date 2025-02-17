// Base pentatonic scale frequencies for more musical sounds
const BASE_SCALE = [
  220.00,  // A3
  261.63,  // C4
  293.66,  // D4
  329.63,  // E4
  392.00   // G4
]

// Different waveform combinations for unique timbres
const WAVEFORM_SETS: OscillatorType[][] = [
  ['sine', 'sine', 'triangle'],      // Smooth, pure
  ['triangle', 'square', 'sine'],    // Bright, digital
  ['sawtooth', 'triangle', 'sine'],  // Rich, warm
  ['square', 'square', 'triangle'],  // Sharp, retro
]

interface AudioParams {
  progress: number
  speed?: number
  stepLength?: number
  angleChange?: number
  multiLineCount?: number
  stepMultiplier?: number
  oscillate?: boolean
  oscillationSpeed?: number
  reverseDirection?: boolean
}

class SpiralSoundGenerator {
  private audioContext: AudioContext | null = null
  private oscillators: OscillatorNode[] = []
  private gainNodes: GainNode[] = []
  private filterNodes: BiquadFilterNode[] = []
  private delayNode: DelayNode | null = null
  private reverbNode: ConvolverNode | null = null
  private masterGain: GainNode | null = null
  private isPlaying = false
  private lastParams: AudioParams | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      void this.initialize()
    }
  }

  private async initialize() {
    this.audioContext = new AudioContext()
    
    // Create effects chain
    this.masterGain = this.audioContext.createGain()
    this.masterGain.gain.value = 0.1

    // Create reverb
    this.reverbNode = this.audioContext.createConvolver()
    await this.createReverb()

    // Add delay effect for more space
    this.delayNode = this.audioContext.createDelay(1.0)
    this.delayNode.delayTime.value = 0.2
    const delayGain = this.audioContext.createGain()
    delayGain.gain.value = 0.2

    // Connect effects chain
    this.delayNode.connect(delayGain)
    delayGain.connect(this.reverbNode)
    this.reverbNode.connect(this.masterGain)
    this.masterGain.connect(this.audioContext.destination)

    await this.setupOscillators()
  }

  private async createReverb() {
    if (!this.audioContext || !this.reverbNode) return

    try {
      // Create impulse response for reverb
      const audioContext = this.audioContext // Store reference to avoid null checks
      const length = audioContext.sampleRate * 2.5
      const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate)
      
      const channelPromises = [0, 1].map(async channel => {
        const channelData = impulse.getChannelData(channel)
        for (let i = 0; i < length; i++) {
          const decay = Math.exp(-i / (audioContext.sampleRate * 0.5))
          channelData[i] = (Math.random() * 2 - 1) * decay
        }
      })

      await Promise.all(channelPromises)
      this.reverbNode.buffer = impulse
    } catch (error) {
      console.error('Error creating reverb:', error)
    }
  }

  private async setupOscillators() {
    if (!this.audioContext || !this.masterGain || !this.delayNode || !this.reverbNode) return

    // Clean up existing oscillators
    this.oscillators.forEach(osc => osc.stop())
    this.oscillators = []
    this.gainNodes = []
    this.filterNodes = []

    // Create oscillators for each waveform set
    WAVEFORM_SETS.forEach((waveforms) => {
      BASE_SCALE.forEach((baseFreq) => {
        waveforms.forEach((waveform, waveformIndex) => {
          // Create oscillator with unique waveform
          const oscillator = this.audioContext!.createOscillator()
          oscillator.type = waveform
          oscillator.frequency.value = baseFreq

          // Create filter for this oscillator
          const filter = this.audioContext!.createBiquadFilter()
          filter.type = waveformIndex === 0 ? 'lowpass' : waveformIndex === 1 ? 'bandpass' : 'highpass'
          filter.frequency.value = 2000
          filter.Q.value = 2

          // Create gain node for amplitude
          const gainNode = this.audioContext!.createGain()
          gainNode.gain.value = 0

          // Connect nodes with different routing based on waveform
          oscillator.connect(filter)
          filter.connect(gainNode)
          if (waveformIndex === 0) {
            gainNode.connect(this.masterGain!) // Direct to output
          } else if (waveformIndex === 1) {
            gainNode.connect(this.delayNode!) // To delay
          } else {
            gainNode.connect(this.reverbNode!) // To reverb
          }

          // Start oscillator
          oscillator.start()

          // Store nodes
          this.oscillators.push(oscillator)
          this.gainNodes.push(gainNode)
          this.filterNodes.push(filter)
        })
      })
    })
  }

  updateTone(params: AudioParams) {
    if (!this.audioContext || !this.isPlaying) return

    const {
      progress,
      speed = 1,
      stepLength = 10,
      angleChange = 15,
      multiLineCount = 1,
      stepMultiplier = 0,
      oscillate = false,
      oscillationSpeed = 1,
      reverseDirection = false
    } = params

    // Normalize progress for pattern generation
    const normalizedProgress = progress % 1
    
    // Map parameters to distinct musical characteristics
    const tempo = Math.max(60, 240 * (1 - speed / 300)) // Speed → Tempo
    const beatDuration = 60 / tempo
    const currentBeat = (Date.now() * tempo / 60000) % 4
    
    // angleChange → Pattern complexity and note selection
    const patternLength = Math.max(2, Math.min(16, Math.floor(angleChange / 5)))
    const noteShift = Math.floor(angleChange / 45) // Changes which notes are played
    
    // multiLineCount → Texture density and harmony
    const textureIntensity = Math.min(multiLineCount / 3, 1)
    const harmonicSpread = Math.floor(multiLineCount / 2) // Affects chord spread
    
    // stepLength → Envelope and articulation
    const attackTime = Math.max(0.01, Math.min(0.2, stepLength / 100))
    const releaseTime = Math.max(0.05, Math.min(0.5, stepLength / 50))
    
    // stepMultiplier → Timbre evolution
    const filterSweepRange = 1000 + (stepMultiplier * 6000)
    
    this.oscillators.forEach((osc, index) => {
      const waveformIndex = index % 3
      
      // Calculate base frequency with more dramatic shifts
      let targetFreq = BASE_SCALE[(Math.floor((index % (BASE_SCALE.length * 3)) / 3) + noteShift) % BASE_SCALE.length]
      
      // Apply more dramatic pitch modifications based on parameters
      if (reverseDirection) {
        // Reverse direction creates descending patterns
        targetFreq *= 0.5 + (Math.floor((index % (BASE_SCALE.length * 3)) / 3) * 0.1)
      } else {
        // Forward direction creates ascending patterns
        targetFreq *= 1 + (Math.floor((index % (BASE_SCALE.length * 3)) / 3) * 0.1)
      }
      
      // Oscillation creates more dramatic pitch modulation
      if (oscillate) {
        const oscPhase = Date.now() * oscillationSpeed * 0.001
        const modDepth = oscillationSpeed * 0.2 // More dramatic modulation
        targetFreq *= 1 + Math.sin(oscPhase + index * 0.5) * modDepth
      }
      
      // Apply harmonic spreading based on multiLineCount
      targetFreq *= 1 + (harmonicSpread * 0.02 * waveformIndex)
      
      // Calculate rhythmic pattern
      const patternPosition = (normalizedProgress * patternLength + (Math.floor((index % (BASE_SCALE.length * 3)) / 3) * textureIntensity)) % 1
      const beatPosition = (currentBeat + (index * 0.125 * textureIntensity)) % 1
      
      // Calculate gain with more dynamic envelope
      let gain = 0
      
      // Create more complex rhythmic patterns
      if (patternPosition < textureIntensity) {
        const envelope = Math.sin(patternPosition / textureIntensity * Math.PI)
        gain = 0.15 * envelope
      }
      
      // Add rhythmic accents
      if (beatPosition < 0.1) {
        gain *= 1.5
      }
      
      // Modify gain based on waveform role
      gain *= 0.7 - (waveformIndex * 0.2)
      
      // Apply filter modulation
      const filterFreq = Math.min(12000, 
        filterSweepRange * (1 + Math.sin(currentBeat * Math.PI * 2) * 0.5))
      
      this.filterNodes[index].frequency.setTargetAtTime(
        filterFreq,
        this.audioContext!.currentTime,
        0.1
      )
      
      // Update oscillator frequency if in range
      if (targetFreq >= 55 && targetFreq <= 8800) {
        osc.frequency.setTargetAtTime(
          targetFreq,
          this.audioContext!.currentTime,
          attackTime
        )
      }
      
      // Apply gain with envelope
      this.gainNodes[index].gain.setTargetAtTime(
        Math.min(gain, 0.15),
        this.audioContext!.currentTime,
        patternPosition < textureIntensity ? attackTime : releaseTime
      )
    })

    // Update delay time based on tempo
    if (this.delayNode) {
      this.delayNode.delayTime.setTargetAtTime(
        beatDuration / (reverseDirection ? 3 : 2), // Different delay times for forward/reverse
        this.audioContext!.currentTime,
        0.1
      )
    }
  }

  start() {
    if (!this.audioContext) return
    
    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume()
    }
    
    this.isPlaying = true
    this.lastParams = null
    
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0.1, this.audioContext.currentTime, 0.1)
    }
  }

  stop() {
    this.isPlaying = false
    this.lastParams = null
    
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.1)
    }
  }

  setVolume(volume: number) {
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setTargetAtTime(volume * 0.2, this.audioContext.currentTime, 0.1)
    }
  }

  cleanup() {
    if (this.audioContext) {
      this.oscillators.forEach(osc => osc.stop())
      void this.audioContext.close()
    }
  }
}

// Export a singleton instance
export const shepardTone = typeof window !== 'undefined' ? new SpiralSoundGenerator() : null 