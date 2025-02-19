import {
  VStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  Box,
  HStack,
  Input,
  Button,
  Divider,
  Tooltip,
  SliderMark,
  Switch,
  Select,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react'
import { SpiralConfig, SpiralConfigLocks } from '../models/types'
import { BLEND_MODES, createRandomConfig } from '../utils/spiral'
import { LockIcon, UnlockIcon, InfoIcon } from '@chakra-ui/icons'
import { useEffect, useRef, useCallback } from 'react'
import { PresetManager } from './PresetManager'
import { SpiralPreset } from '../models/types'

interface SpiralControlsProps {
  config: SpiralConfig
  onChange: (config: SpiralConfig) => void
  onReset: () => void
  onResetToDefaults: () => void
  locks: SpiralConfigLocks
  onLocksChange: (locks: SpiralConfigLocks) => void
}

export const SpiralControls = ({ config, onChange, onReset, onResetToDefaults, locks, onLocksChange }: SpiralControlsProps) => {
  const screensaverTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleChange = (key: keyof SpiralConfig, value: number | string | boolean | number[] | [string, string]) => {
    const newConfig = { ...config, [key]: value }
    if (key !== 'isPaused' && !config.isPaused) {
      newConfig.isPaused = true
    }
    
    // Save to localStorage (except isPaused state)
    try {
      const configToSave = Object.fromEntries(
        Object.entries(newConfig).filter(([k]) => k !== 'isPaused')
      )
      localStorage.setItem('spiralConfig', JSON.stringify(configToSave))
    } catch (e) {
      console.error('Error saving config to localStorage:', e)
    }
    
    onChange(newConfig)
  }

  const handleRandomize = useCallback(() => {
    const newConfig = createRandomConfig(config, locks)
    
    // Save to localStorage (except isPaused state)
    try {
      const configToSave = Object.fromEntries(
        Object.entries(newConfig).filter(([k]) => k !== 'isPaused')
      )
      localStorage.setItem('spiralConfig', JSON.stringify(configToSave))
    } catch (e) {
      console.error('Error saving config to localStorage:', e)
    }
    
    // If in screensaver mode, ensure animation continues
    if (config.screensaverMode) {
      newConfig.isPaused = false
    }
    
    onChange(newConfig)
  }, [config, locks, onChange])

  // Handle screensaver mode
  useEffect(() => {
    if (config.screensaverMode && !config.isPaused) {
      // Start the timer
      const startNewPattern = () => {
        // First reset the canvas
        onReset()
        
        // Short delay to ensure canvas is cleared
        setTimeout(() => {
          const newConfig = createRandomConfig(config, locks)
          newConfig.isPaused = false // Keep animation running
          onChange(newConfig)
        }, 100)

        // Schedule next pattern
        screensaverTimerRef.current = setTimeout(startNewPattern, 5000)
      }
      
      // Start first pattern after delay
      screensaverTimerRef.current = setTimeout(startNewPattern, 5000)
    }

    return () => {
      // Cleanup timer
      if (screensaverTimerRef.current) {
        clearTimeout(screensaverTimerRef.current)
        screensaverTimerRef.current = null
      }
    }
  }, [config.screensaverMode, config.isPaused, config, locks, onChange, onReset])

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
          handleRandomize()
          break
        case 'KeyU':
          e.preventDefault()
          onReset()
          break
        case 'KeyD':
          e.preventDefault()
          onResetToDefaults()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [config, onChange, onReset, onResetToDefaults, handleRandomize])

  const toggleLock = (key: keyof SpiralConfigLocks) => {
    const newLocks = {
      ...locks,
      [key]: !locks[key]
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('spiralLocks', JSON.stringify(newLocks))
      } catch (e) {
        console.error('Error saving locks to localStorage:', e)
      }
    }
    onLocksChange(newLocks)
  }

  const unlockAll = () => {
    const allUnlocked = {} as SpiralConfigLocks
    Object.keys(config).forEach(key => {
      if (key !== 'isPaused') {
        allUnlocked[key as keyof SpiralConfigLocks] = false
      }
    })
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('spiralLocks', JSON.stringify(allUnlocked))
      } catch (e) {
        console.error('Error saving locks to localStorage:', e)
      }
    }
    onLocksChange(allUnlocked)
  }

  const lockAll = () => {
    const allLocked = {} as SpiralConfigLocks
    Object.keys(config).forEach(key => {
      if (key !== 'isPaused') {
        allLocked[key as keyof SpiralConfigLocks] = true
      }
    })
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('spiralLocks', JSON.stringify(allLocked))
      } catch (e) {
        console.error('Error saving locks to localStorage:', e)
      }
    }
    onLocksChange(allLocked)
  }

  const handleLoadPreset = (preset: SpiralPreset) => {
    // Preserve current audio and screensaver settings
    const newConfig = {
      ...preset.config,
      audioEnabled: config.audioEnabled,
      audioVolume: config.audioVolume,
      screensaverMode: config.screensaverMode,
      isPaused: true // Always start paused when loading a preset
    }
    
    // Save to localStorage
    try {
      const configToSave = Object.fromEntries(
        Object.entries(newConfig).filter(([k]) => k !== 'isPaused')
      )
      localStorage.setItem('spiralConfig', JSON.stringify(configToSave))
    } catch (e) {
      console.error('Error saving config to localStorage:', e)
    }
    
    onChange(newConfig)
  }

  // Helper component for control headers with lock button
  const ControlHeader = ({ label, value, settingKey, tooltip }: { label: string, value: string, settingKey: keyof SpiralConfigLocks, tooltip: string }) => (
    <HStack mb={2} justify="space-between">
      <HStack spacing={2}>
        <Text fontWeight="medium">{label}</Text>
        <IconButton
          aria-label={locks[settingKey] ? "Unlock setting" : "Lock setting"}
          icon={locks[settingKey] ? <LockIcon /> : <UnlockIcon />}
          size="xs"
          variant="ghost"
          onClick={() => toggleLock(settingKey)}
        />
        <Tooltip label={tooltip} placement="top">
          <InfoIcon boxSize={3} color="whiteAlpha.600" />
        </Tooltip>
      </HStack>
      <Text fontSize="sm" color="whiteAlpha.700">{value}</Text>
    </HStack>
  )

  // Helper component for boolean controls with lock button
  const BooleanControl = ({ label, value, settingKey, tooltip }: { label: string, value: boolean, settingKey: keyof SpiralConfigLocks, tooltip: string }) => (
    <HStack width="100%" justify="space-between">
      <HStack spacing={2}>
        <Text fontWeight="medium">{label}</Text>
        <IconButton
          aria-label={locks[settingKey] ? "Unlock setting" : "Lock setting"}
          icon={locks[settingKey] ? <LockIcon /> : <UnlockIcon />}
          size="xs"
          variant="ghost"
          onClick={() => toggleLock(settingKey)}
        />
        <Tooltip label={tooltip} placement="top">
          <InfoIcon boxSize={3} color="whiteAlpha.600" />
        </Tooltip>
      </HStack>
      <Switch
        id={`switch-${settingKey}`}
        name={settingKey}
        isChecked={value}
        onChange={(e) => handleChange(settingKey, e.target.checked)}
      />
    </HStack>
  )

  // Helper component for section headers
  const SectionHeader = ({ children }: { children: React.ReactNode }) => (
    <HStack width="100%" py={2}>
      <Text fontSize="lg" fontWeight="bold">{children}</Text>
      <AccordionIcon />
    </HStack>
  )

  return (
    <VStack 
      spacing={6} 
      width="100%" 
      p={6} 
      bg="whiteAlpha.200" 
      borderRadius="xl" 
      backdropFilter="blur(10px)"
      boxShadow="lg"
      maxH="85vh"
      overflowY="auto"
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'whiteAlpha.300',
          borderRadius: '24px',
        },
      }}
    >
      {/* Main Controls */}
      <HStack width="100%" spacing={4}>
        <Button
          onClick={() => handleChange('isPaused', !config.isPaused)}
          colorScheme={config.isPaused ? 'teal' : 'pink'} 
          size="lg"
          flex={1}
          variant="solid"
        >
          {config.isPaused ? '▶ Resume' : '⏸ Pause'}
        </Button>
        <Button 
          onClick={onReset} 
          colorScheme="teal"
          size="lg"
          flex={1}
          variant="solid"
        >
          ↺ Restart Canvas
        </Button>
      </HStack>

      <PresetManager config={config} onLoadPreset={handleLoadPreset} />

      <HStack width="100%" spacing={4}>
        <Button
          onClick={onResetToDefaults}
          colorScheme="orange"
          size="md"
          flex={1}
          variant="solid"
          bg="orange.600"
          _hover={{ bg: 'orange.500' }}
        >
          Reset All Settings
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault()
            handleRandomize()
          }}
          colorScheme="purple"
          size="md"
          flex={1}
          variant="solid"
          bg="purple.600"
          _hover={{ bg: 'purple.500' }}
        >
          Randomize Settings
        </Button>
      </HStack>

      <HStack width="100%" spacing={4}>
        <Button
          onClick={unlockAll}
          colorScheme="blue"
          size="md"
          flex={1}
          variant="solid"
          bg="blue.600"
          _hover={{ bg: 'blue.500' }}
        >
          🔓 Unlock All
        </Button>
        <Button
          onClick={lockAll}
          colorScheme="blue"
          size="md"
          flex={1}
          variant="solid"
          bg="blue.600"
          _hover={{ bg: 'blue.500' }}
        >
          🔒 Lock All
        </Button>
      </HStack>

      <Divider />

      {/* Collapsible Sections */}
      <Accordion defaultIndex={[0]} allowMultiple width="100%">
        {/* Audio & Screensaver */}
        <AccordionItem border="none">
          <AccordionButton px={0}>
            <SectionHeader>Audio & Screensaver</SectionHeader>
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={4} width="100%">
              <HStack width="100%" spacing={4} justify="center">
                <HStack spacing={3}>
                  <Text fontWeight="medium">🔊 Sound</Text>
                  <Switch
                    isChecked={config.audioEnabled}
                    onChange={(e) => handleChange('audioEnabled', e.target.checked)}
                  />
                </HStack>
                <HStack spacing={3}>
                  <Text fontWeight="medium">🎬 Screensaver</Text>
                  <Switch
                    isChecked={config.screensaverMode}
                    onChange={(e) => handleChange('screensaverMode', e.target.checked)}
                  />
                </HStack>
              </HStack>

              {config.audioEnabled && (
                <Box width="100%">
                  <ControlHeader 
                    label="Audio Volume" 
                    value={config.audioVolume.toFixed(2)}
                    settingKey="audioVolume"
                    tooltip="Controls the volume of the audio"
                  />
                  <Tooltip label={config.audioVolume}>
                    <Slider
                      value={config.audioVolume}
                      onChange={(v) => handleChange('audioVolume', v)}
                      min={0}
                      max={1}
                      step={0.01}
                    >
                      <SliderTrack bg="whiteAlpha.200">
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={6} />
                    </Slider>
                  </Tooltip>
                </Box>
              )}
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        {/* Color & Effects */}
        <AccordionItem border="none">
          <AccordionButton px={0}>
            <SectionHeader>Color & Effects</SectionHeader>
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={4} width="100%">
              <HStack width="100%" spacing={4} justify="space-between">
                <HStack spacing={2}>
                  <Text fontWeight="medium">Base Color</Text>
                  <IconButton
                    aria-label={locks.color ? "Unlock setting" : "Lock setting"}
                    icon={locks.color ? <LockIcon /> : <UnlockIcon />}
                    size="xs"
                    variant="ghost"
                    onClick={() => toggleLock('color')}
                  />
                  <Tooltip label="The main color of the spiral" placement="top">
                    <InfoIcon boxSize={3} color="whiteAlpha.600" />
                  </Tooltip>
                </HStack>
                <Input
                  type="color"
                  value={config.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  width="80px"
                  height="40px"
                  padding={1}
                  borderRadius="md"
                  cursor="pointer"
                />
              </HStack>

              <BooleanControl
                label="Rainbow Mode"
                value={config.rainbowMode}
                settingKey="rainbowMode"
                tooltip="Cycle through colors as the spiral is drawn"
              />

              {config.rainbowMode && (
                <Box width="100%">
                  <ControlHeader 
                    label="Rainbow Speed" 
                    value={`${config.rainbowSpeed.toFixed(1)}`}
                    settingKey="rainbowSpeed"
                    tooltip="Controls how quickly the colors change in rainbow mode"
                  />
                  <Tooltip label={config.rainbowSpeed}>
                    <Slider
                      value={config.rainbowSpeed}
                      onChange={(v) => handleChange('rainbowSpeed', v)}
                      min={0.1}
                      max={5}
                      step={0.1}
                    >
                      <SliderTrack bg="whiteAlpha.200">
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={6} />
                    </Slider>
                  </Tooltip>
                </Box>
              )}

              <BooleanControl
                label="Gradient Mode"
                value={config.gradientMode}
                settingKey="gradientMode"
                tooltip="Use a smooth gradient between two colors"
              />

              {config.gradientMode && (
                <>
                  <HStack width="100%" spacing={4} justify="space-between">
                    <VStack align="start" spacing={2} flex={1}>
                      <HStack spacing={2}>
                        <Text fontWeight="medium">Start Color</Text>
                        <IconButton
                          aria-label={locks.gradientColors ? "Unlock setting" : "Lock setting"}
                          icon={locks.gradientColors ? <LockIcon /> : <UnlockIcon />}
                          size="xs"
                          variant="ghost"
                          onClick={() => toggleLock('gradientColors')}
                        />
                        <Tooltip label="The starting color of the gradient" placement="top">
                          <InfoIcon boxSize={3} color="whiteAlpha.600" />
                        </Tooltip>
                      </HStack>
                      <Input
                        type="color"
                        value={config.gradientColors[0]}
                        onChange={(e) => handleChange('gradientColors', [e.target.value, config.gradientColors[1]] as [string, string])}
                        width="80px"
                        height="40px"
                        padding={1}
                        borderRadius="md"
                        cursor="pointer"
                      />
                    </VStack>
                    <VStack align="start" spacing={2} flex={1}>
                      <HStack spacing={2}>
                        <Text fontWeight="medium">End Color</Text>
                        <Tooltip label="The ending color of the gradient" placement="top">
                          <InfoIcon boxSize={3} color="whiteAlpha.600" />
                        </Tooltip>
                      </HStack>
                      <Input
                        type="color"
                        value={config.gradientColors[1]}
                        onChange={(e) => handleChange('gradientColors', [config.gradientColors[0], e.target.value] as [string, string])}
                        width="80px"
                        height="40px"
                        padding={1}
                        borderRadius="md"
                        cursor="pointer"
                      />
                    </VStack>
                  </HStack>

                  <Box width="100%">
                    <ControlHeader 
                      label="Gradient Speed" 
                      value={`${config.gradientSpeed.toFixed(1)}`}
                      settingKey="gradientSpeed"
                      tooltip="Controls how quickly the gradient cycles"
                    />
                    <Tooltip label={config.gradientSpeed}>
                      <Slider
                        value={config.gradientSpeed}
                        onChange={(v) => handleChange('gradientSpeed', v)}
                        min={0.1}
                        max={5}
                        step={0.1}
                      >
                        <SliderTrack bg="whiteAlpha.200">
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb boxSize={6} />
                      </Slider>
                    </Tooltip>
                  </Box>

                  <BooleanControl
                    label="Reverse Gradient"
                    value={config.gradientReverse}
                    settingKey="gradientReverse"
                    tooltip="Reverse the direction of the gradient cycle"
                  />
                </>
              )}

              <BooleanControl
                label="Fade Lines"
                value={config.fadeOpacity}
                settingKey="fadeOpacity"
                tooltip="Gradually fade out the spiral lines as they are drawn"
              />

              <Box width="100%">
                <ControlHeader 
                  label="Line Opacity" 
                  value={config.baseOpacity.toFixed(2)}
                  settingKey="baseOpacity"
                  tooltip="Controls the transparency of the spiral lines"
                />
                <Tooltip label={config.baseOpacity}>
                  <Slider
                    value={config.baseOpacity}
                    onChange={(v) => handleChange('baseOpacity', v)}
                    min={0}
                    max={1}
                    step={0.01}
                  >
                    <SliderTrack bg="whiteAlpha.200">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </Tooltip>
              </Box>
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        {/* Shape & Motion */}
        <AccordionItem border="none">
          <AccordionButton px={0}>
            <SectionHeader>Shape & Motion</SectionHeader>
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={4} width="100%">
              <Box width="100%">
                <ControlHeader 
                  label="Step Length" 
                  value={config.stepLength.toFixed(1)} 
                  settingKey="stepLength"
                  tooltip="Controls the distance between each point in the spiral"
                />
                <Tooltip label={config.stepLength}>
                  <Slider
                    value={config.stepLength}
                    onChange={(v) => handleChange('stepLength', v)}
                    min={0.1}
                    max={100}
                    step={1}
                  >
                    <SliderMark value={0.1} mt={2} fontSize="xs">0.1</SliderMark>
                    <SliderMark value={50} mt={2} ml={-2} fontSize="xs">50</SliderMark>
                    <SliderMark value={100} mt={2} ml={-4} fontSize="xs">100</SliderMark>
                    <SliderTrack bg="whiteAlpha.200">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </Tooltip>
              </Box>

              <Box width="100%">
                <ControlHeader 
                  label="Angle Change" 
                  value={`${config.angleChange.toFixed(1)}°`}
                  settingKey="angleChange"
                  tooltip="Controls the angle between each point in the spiral"
                />
                <Tooltip label={config.angleChange}>
                  <Slider
                    value={config.angleChange}
                    onChange={(v) => handleChange('angleChange', v)}
                    min={0.1}
                    max={180}
                    step={1}
                  >
                    <SliderMark value={0.1} mt={2} fontSize="xs">0.1°</SliderMark>
                    <SliderMark value={90} mt={2} ml={-2} fontSize="xs">90°</SliderMark>
                    <SliderMark value={180} mt={2} ml={-4} fontSize="xs">180°</SliderMark>
                    <SliderTrack bg="whiteAlpha.200">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </Tooltip>
              </Box>

              <Box width="100%">
                <ControlHeader 
                  label="Angle Increment" 
                  value={`${config.angleIncrement.toFixed(3)}°`}
                  settingKey="angleIncrement"
                  tooltip="How much to change the angle after each step"
                />
                <Tooltip label={config.angleIncrement}>
                  <Slider
                    value={config.angleIncrement}
                    onChange={(v) => handleChange('angleIncrement', v)}
                    min={-2}
                    max={2}
                    step={0.1}
                  >
                    <SliderTrack bg="whiteAlpha.200">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </Tooltip>
              </Box>

              <Box width="100%">
                <ControlHeader 
                  label="Animation Speed" 
                  value={`${config.speed}ms`}
                  settingKey="speed"
                  tooltip="Controls how fast the spiral is drawn (lower = faster)"
                />
                <Tooltip label={`${config.speed}ms`}>
                  <Slider
                    value={config.speed}
                    onChange={(v) => handleChange('speed', v)}
                    min={0}
                    max={300}
                    step={1}
                  >
                    <SliderMark value={0} mt={2} fontSize="xs">Fast</SliderMark>
                    <SliderMark value={150} mt={2} ml={-2} fontSize="xs">Med</SliderMark>
                    <SliderMark value={300} mt={2} ml={-4} fontSize="xs">Slow</SliderMark>
                    <SliderTrack bg="whiteAlpha.200">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </Tooltip>
              </Box>

              <Box width="100%">
                <ControlHeader 
                  label="Line Width" 
                  value={`${config.lineWidth.toFixed(1)}px`}
                  settingKey="lineWidth"
                  tooltip="Controls the thickness of the spiral line"
                />
                <Tooltip label={config.lineWidth}>
                  <Slider
                    value={config.lineWidth}
                    onChange={(v) => handleChange('lineWidth', v)}
                    min={0.1}
                    max={40}
                    step={1}
                  >
                    <SliderMark value={0.1} mt={2} fontSize="xs">0.1px</SliderMark>
                    <SliderMark value={20} mt={2} ml={-2} fontSize="xs">20px</SliderMark>
                    <SliderMark value={40} mt={2} ml={-4} fontSize="xs">40px</SliderMark>
                    <SliderTrack bg="whiteAlpha.200">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </Tooltip>
              </Box>

              <BooleanControl
                label="Reverse Direction"
                value={config.reverseDirection}
                settingKey="reverseDirection"
                tooltip="Draw the spiral inward instead of outward"
              />

              <Box width="100%">
                <ControlHeader 
                  label="Acceleration" 
                  value={config.acceleration.toFixed(3)}
                  settingKey="acceleration"
                  tooltip="Gradually changes the animation speed over time"
                />
                <Tooltip label={config.acceleration}>
                  <Slider
                    value={config.acceleration}
                    onChange={(v) => handleChange('acceleration', v)}
                    min={-0.1}
                    max={0.1}
                    step={0.001}
                  >
                    <SliderTrack bg="whiteAlpha.200">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </Tooltip>
              </Box>
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        {/* Advanced Settings */}
        <AccordionItem border="none">
          <AccordionButton px={0}>
            <SectionHeader>Advanced Settings</SectionHeader>
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={4} width="100%">
              <Box width="100%">
                <ControlHeader 
                  label="Multiple Lines" 
                  value={config.multiLineCount.toString()}
                  settingKey="multiLineCount"
                  tooltip="Number of parallel spirals to draw"
                />
                <Tooltip label={config.multiLineCount}>
                  <Slider
                    value={config.multiLineCount}
                    onChange={(v) => handleChange('multiLineCount', v)}
                    min={1}
                    max={30}
                    step={1}
                  >
                    <SliderMark value={1} mt={2} fontSize="xs">1</SliderMark>
                    <SliderMark value={15} mt={2} ml={-1} fontSize="xs">15</SliderMark>
                    <SliderMark value={30} mt={2} ml={-2} fontSize="xs">30</SliderMark>
                    <SliderTrack bg="whiteAlpha.200">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </Tooltip>
              </Box>

              <Box width="100%">
                <ControlHeader 
                  label="Line Spacing" 
                  value={config.multiLineSpacing.toString()}
                  settingKey="multiLineSpacing"
                  tooltip="Distance between parallel spiral lines"
                />
                <Tooltip label={config.multiLineSpacing}>
                  <Slider
                    value={config.multiLineSpacing}
                    onChange={(v) => handleChange('multiLineSpacing', v)}
                    min={0}
                    max={50}
                    step={1}
                  >
                    <SliderTrack bg="whiteAlpha.200">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </Tooltip>
              </Box>

              <Box width="100%">
                <ControlHeader 
                  label="Step Growth" 
                  value={config.stepMultiplier.toFixed(3)}
                  settingKey="stepMultiplier"
                  tooltip="How much the step length grows as the spiral expands"
                />
                <Tooltip label={config.stepMultiplier}>
                  <Slider
                    value={config.stepMultiplier}
                    onChange={(v) => handleChange('stepMultiplier', v)}
                    min={0}
                    max={0.1}
                    step={0.001}
                  >
                    <SliderTrack bg="whiteAlpha.200">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </Tooltip>
              </Box>

              <Box width="100%">
                <ControlHeader 
                  label="Rotation Offset" 
                  value={`${config.rotationOffset}°`}
                  settingKey="rotationOffset"
                  tooltip="Initial rotation angle of the spiral"
                />
                <Tooltip label={config.rotationOffset}>
                  <Slider
                    value={config.rotationOffset}
                    onChange={(v) => handleChange('rotationOffset', v)}
                    min={0}
                    max={360}
                    step={1}
                  >
                    <SliderTrack bg="whiteAlpha.200">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </Tooltip>
              </Box>

              <Box width="100%">
                <HStack mb={2} justify="space-between">
                  <HStack spacing={2}>
                    <Text fontWeight="medium">Line Style</Text>
                    <IconButton
                      aria-label={locks.lineCap ? "Unlock setting" : "Lock setting"}
                      icon={locks.lineCap ? <LockIcon /> : <UnlockIcon />}
                      size="xs"
                      variant="ghost"
                      onClick={() => toggleLock('lineCap')}
                    />
                    <Tooltip label="Choose how the ends of lines are drawn" placement="top">
                      <InfoIcon boxSize={3} color="whiteAlpha.600" />
                    </Tooltip>
                  </HStack>
                </HStack>
                <Select
                  value={config.lineCap}
                  onChange={(e) => handleChange('lineCap', e.target.value)}
                  bg="whiteAlpha.200"
                >
                  <option value="butt">Flat</option>
                  <option value="round">Round</option>
                  <option value="square">Square</option>
                </Select>
              </Box>

              <Box width="100%">
                <HStack mb={2} justify="space-between">
                  <HStack spacing={2}>
                    <Text fontWeight="medium">Line Join</Text>
                    <IconButton
                      aria-label={locks.lineJoin ? "Unlock setting" : "Lock setting"}
                      icon={locks.lineJoin ? <LockIcon /> : <UnlockIcon />}
                      size="xs"
                      variant="ghost"
                      onClick={() => toggleLock('lineJoin')}
                    />
                    <Tooltip label="Choose how line segments are joined together" placement="top">
                      <InfoIcon boxSize={3} color="whiteAlpha.600" />
                    </Tooltip>
                  </HStack>
                </HStack>
                <Select
                  value={config.lineJoin}
                  onChange={(e) => handleChange('lineJoin', e.target.value)}
                  bg="whiteAlpha.200"
                >
                  <option value="round">Round</option>
                  <option value="bevel">Bevel</option>
                  <option value="miter">Miter</option>
                </Select>
              </Box>

              <Box width="100%">
                <ControlHeader 
                  label="Line Dash Length" 
                  value={config.lineDash[0]?.toString() || "0"}
                  settingKey="lineDash"
                  tooltip="Creates a dashed line pattern (0 for solid line)"
                />
                <Tooltip label={config.lineDash[0] || "0"}>
                  <Slider
                    value={config.lineDash[0] || 0}
                    onChange={(v) => handleChange('lineDash', v === 0 ? [] : [v, v])}
                    min={0}
                    max={50}
                    step={1}
                  >
                    <SliderTrack bg="whiteAlpha.200">
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
                </Tooltip>
              </Box>

              <Box width="100%">
                <HStack mb={2} justify="space-between">
                  <HStack spacing={2}>
                    <Text fontWeight="medium">Blend Mode</Text>
                    <IconButton
                      aria-label={locks.blendMode ? "Unlock setting" : "Lock setting"}
                      icon={locks.blendMode ? <LockIcon /> : <UnlockIcon />}
                      size="xs"
                      variant="ghost"
                      onClick={() => toggleLock('blendMode')}
                    />
                    <Tooltip label="How new lines blend with existing ones" placement="top">
                      <InfoIcon boxSize={3} color="whiteAlpha.600" />
                    </Tooltip>
                  </HStack>
                </HStack>
                <Select
                  value={config.blendMode}
                  onChange={(e) => handleChange('blendMode', e.target.value)}
                  bg="whiteAlpha.200"
                >
                  {BLEND_MODES.map(mode => (
                    <option key={mode} value={mode}>
                      {mode.replace(/-/g, ' ')}
                    </option>
                  ))}
                </Select>
              </Box>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </VStack>
  )
} 