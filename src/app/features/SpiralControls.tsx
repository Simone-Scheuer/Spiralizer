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
  IconButton
} from '@chakra-ui/react'
import { SpiralConfig, SpiralConfigLocks } from '../models/types'
import { BLEND_MODES, createRandomConfig } from '../utils/spiral'
import { LockIcon, UnlockIcon } from '@chakra-ui/icons'

interface SpiralControlsProps {
  config: SpiralConfig
  onChange: (config: SpiralConfig) => void
  onReset: () => void
  onResetToDefaults: () => void
  locks: SpiralConfigLocks
  onLocksChange: (locks: SpiralConfigLocks) => void
}

export const SpiralControls = ({ config, onChange, onReset, onResetToDefaults, locks, onLocksChange }: SpiralControlsProps) => {
  const handleChange = (key: keyof SpiralConfig, value: number | string | boolean | number[]) => {
    if (key !== 'isPaused' && !config.isPaused) {
      onChange({ ...config, [key]: value, isPaused: true })
    } else {
      onChange({ ...config, [key]: value })
    }
  }

  const toggleLock = (key: keyof SpiralConfigLocks) => {
    const newLocks = {
      ...locks,
      [key]: !locks[key]
    }
    try {
      localStorage.setItem('spiralLocks', JSON.stringify(newLocks))
    } catch (e) {
      console.error('Error saving locks to localStorage:', e)
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
    try {
      localStorage.setItem('spiralLocks', JSON.stringify(allUnlocked))
    } catch (e) {
      console.error('Error saving locks to localStorage:', e)
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
    try {
      localStorage.setItem('spiralLocks', JSON.stringify(allLocked))
    } catch (e) {
      console.error('Error saving locks to localStorage:', e)
    }
    onLocksChange(allLocked)
  }

  const handleRandomize = () => {
    const newConfig = createRandomConfig(config, locks)
    onChange(newConfig)
  }

  // Helper component for control headers with lock button
  const ControlHeader = ({ label, value, settingKey }: { label: string, value: string, settingKey: keyof SpiralConfigLocks }) => (
    <HStack mb={2} justify="space-between">
      <HStack>
        <Text fontWeight="medium">{label}</Text>
        <IconButton
          aria-label={locks[settingKey] ? "Unlock setting" : "Lock setting"}
          icon={locks[settingKey] ? <LockIcon /> : <UnlockIcon />}
          size="xs"
          variant="ghost"
          onClick={() => toggleLock(settingKey)}
        />
      </HStack>
      <Text fontSize="sm" color="whiteAlpha.700">{value}</Text>
    </HStack>
  )

  // Helper component for boolean controls with lock button
  const BooleanControl = ({ label, value, settingKey }: { label: string, value: boolean, settingKey: keyof SpiralConfigLocks }) => (
    <HStack width="100%" justify="space-between">
      <HStack>
        <Text fontWeight="medium">{label}</Text>
        <IconButton
          aria-label={locks[settingKey] ? "Unlock setting" : "Lock setting"}
          icon={locks[settingKey] ? <LockIcon /> : <UnlockIcon />}
          size="xs"
          variant="ghost"
          onClick={() => toggleLock(settingKey)}
        />
      </HStack>
      <Switch
        id={`switch-${settingKey}`}
        name={settingKey}
        isChecked={value}
        onChange={(e) => handleChange(settingKey, e.target.checked)}
      />
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

      <HStack width="100%" spacing={4}>
        <Button
          onClick={onResetToDefaults}
          colorScheme="orange"
          size="md"
          flex={1}
          variant="outline"
        >
          Reset All Settings
        </Button>
        <Button
          onClick={handleRandomize}
          colorScheme="purple"
          size="md"
          flex={1}
          variant="outline"
        >
          Randomize Settings
        </Button>
      </HStack>

      <HStack width="100%" spacing={4}>
        <Button
          onClick={unlockAll}
          colorScheme="blue"
          backgroundColor="white.200"
          size="md"
          flex={1}
          variant="outline"
        >
          🔓 Unlock All
        </Button>
        <Button
          onClick={lockAll}
          colorScheme="blue"
          size="md"
          flex={1}
          variant="outline"
        >
          🔒 Lock All
        </Button>
      </HStack>

      <Divider />

      <Text fontSize="lg" fontWeight="bold" width="100%">Basic Controls</Text>

      <Box width="100%">
        <ControlHeader 
          label="Step Length" 
          value={config.stepLength.toFixed(1)} 
          settingKey="stepLength"
        />
        <Tooltip label={config.stepLength}>
          <Slider
            value={config.stepLength}
            onChange={(v) => handleChange('stepLength', v)}
            min={0.1}
            max={100}
            step={0.1}
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
          label="Angle Change (degrees)" 
          value={`${config.angleChange.toFixed(1)}°`}
          settingKey="angleChange"
        />
        <Tooltip label={config.angleChange}>
          <Slider
            value={config.angleChange}
            onChange={(v) => handleChange('angleChange', v)}
            min={0.1}
            max={180}
            step={0.1}
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
          label="Angle Increment (per rotation)" 
          value={`${config.angleIncrement.toFixed(3)}°`}
          settingKey="angleIncrement"
        />
        <Tooltip label={config.angleIncrement}>
          <Slider
            value={config.angleIncrement}
            onChange={(v) => handleChange('angleIncrement', v)}
            min={-2}
            max={2}
            step={0.01}
          >
            <SliderMark value={-2} mt={2} fontSize="xs">-2°</SliderMark>
            <SliderMark value={0} mt={2} ml={-1} fontSize="xs">0°</SliderMark>
            <SliderMark value={2} mt={2} ml={-2} fontSize="xs">+2°</SliderMark>
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
        />
        <Tooltip label={config.lineWidth}>
          <Slider
            value={config.lineWidth}
            onChange={(v) => handleChange('lineWidth', v)}
            min={0.1}
            max={40}
            step={0.1}
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

      <Divider />

      <Text fontSize="lg" fontWeight="bold" width="100%">Advanced Controls</Text>

      <Box width="100%">
        <ControlHeader 
          label="Origin X Position" 
          value={`${(config.originX * 100).toFixed(1)}%`}
          settingKey="originX"
        />
        <Tooltip label={`${(config.originX * 100).toFixed(1)}%`}>
          <Slider
            value={config.originX}
            onChange={(v) => handleChange('originX', v)}
            min={0}
            max={1}
            step={0.01}
          >
            <SliderMark value={0} mt={2} fontSize="xs">Left</SliderMark>
            <SliderMark value={0.5} mt={2} ml={-2} fontSize="xs">Center</SliderMark>
            <SliderMark value={1} mt={2} ml={-4} fontSize="xs">Right</SliderMark>
            <SliderTrack bg="whiteAlpha.200">
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={6} />
          </Slider>
        </Tooltip>
      </Box>

      <Box width="100%">
        <ControlHeader 
          label="Origin Y Position" 
          value={`${(config.originY * 100).toFixed(1)}%`}
          settingKey="originY"
        />
        <Tooltip label={`${(config.originY * 100).toFixed(1)}%`}>
          <Slider
            value={config.originY}
            onChange={(v) => handleChange('originY', v)}
            min={0}
            max={1}
            step={0.01}
          >
            <SliderMark value={0} mt={2} fontSize="xs">Top</SliderMark>
            <SliderMark value={0.5} mt={2} ml={-2} fontSize="xs">Center</SliderMark>
            <SliderMark value={1} mt={2} ml={-4} fontSize="xs">Bottom</SliderMark>
            <SliderTrack bg="whiteAlpha.200">
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={6} />
          </Slider>
        </Tooltip>
      </Box>

      <Box width="100%">
        <ControlHeader 
          label="Multiple Lines" 
          value={config.multiLineCount.toString()}
          settingKey="multiLineCount"
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

      <Divider />

      <Text fontSize="lg" fontWeight="bold" width="100%">Effects</Text>

      <Box width="100%">
        <ControlHeader 
          label="Line Opacity" 
          value={config.baseOpacity.toFixed(2)}
          settingKey="baseOpacity"
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

      <Box width="100%">
        <HStack mb={2} justify="space-between">
          <HStack>
            <Text fontWeight="medium">Line Style</Text>
            <IconButton
              aria-label={locks.lineCap ? "Unlock setting" : "Lock setting"}
              icon={locks.lineCap ? <LockIcon /> : <UnlockIcon />}
              size="xs"
              variant="ghost"
              onClick={() => toggleLock('lineCap')}
            />
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
          <HStack>
            <Text fontWeight="medium">Line Join</Text>
            <IconButton
              aria-label={locks.lineJoin ? "Unlock setting" : "Lock setting"}
              icon={locks.lineJoin ? <LockIcon /> : <UnlockIcon />}
              size="xs"
              variant="ghost"
              onClick={() => toggleLock('lineJoin')}
            />
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

      <BooleanControl
        label="Fade Lines"
        value={config.fadeOpacity}
        settingKey="fadeOpacity"
      />

      <BooleanControl
        label="Rainbow Mode"
        value={config.rainbowMode}
        settingKey="rainbowMode"
      />

      {config.rainbowMode && (
        <Box width="100%">
          <ControlHeader 
            label="Rainbow Speed" 
            value={`${config.rainbowSpeed.toFixed(1)}`}
            settingKey="rainbowSpeed"
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

      <Divider />

      <Text fontSize="lg" fontWeight="bold" width="100%">Motion Controls</Text>

      <BooleanControl
        label="Reverse Direction"
        value={config.reverseDirection}
        settingKey="reverseDirection"
      />

      <Box width="100%">
        <ControlHeader 
          label="Acceleration" 
          value={config.acceleration.toFixed(3)}
          settingKey="acceleration"
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

      <BooleanControl
        label="Oscillate"
        value={config.oscillate}
        settingKey="oscillate"
      />

      {config.oscillate && (
        <Box width="100%">
          <ControlHeader 
            label="Oscillation Speed" 
            value={config.oscillationSpeed.toFixed(1)}
            settingKey="oscillationSpeed"
          />
          <Tooltip label={config.oscillationSpeed}>
            <Slider
              value={config.oscillationSpeed}
              onChange={(v) => handleChange('oscillationSpeed', v)}
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

      <Box width="100%">
        <HStack mb={2} justify="space-between">
          <HStack>
            <Text fontWeight="medium">Blend Mode</Text>
            <IconButton
              aria-label={locks.blendMode ? "Unlock setting" : "Lock setting"}
              icon={locks.blendMode ? <LockIcon /> : <UnlockIcon />}
              size="xs"
              variant="ghost"
              onClick={() => toggleLock('blendMode')}
            />
          </HStack>
        </HStack>
        <Select
          id="blendMode"
          name="blendMode"
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

      <Divider />

      <HStack width="100%" spacing={4} justify="space-between">
        <HStack>
          <Text fontWeight="medium">Base Color</Text>
          <IconButton
            aria-label={locks.color ? "Unlock setting" : "Lock setting"}
            icon={locks.color ? <LockIcon /> : <UnlockIcon />}
            size="xs"
            variant="ghost"
            onClick={() => toggleLock('color')}
          />
        </HStack>
        <Input
          id="baseColor"
          name="baseColor"
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
    </VStack>
  )
} 