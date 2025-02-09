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
  Select
} from '@chakra-ui/react'
import { SpiralConfig } from '../models/types'

interface SpiralControlsProps {
  config: SpiralConfig
  onChange: (config: SpiralConfig) => void
  onReset: () => void
}

const BLEND_MODES = [
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
]

export const SpiralControls = ({ config, onChange, onReset }: SpiralControlsProps) => {
  const handleChange = (key: keyof SpiralConfig, value: number | string | boolean) => {
    onChange({ ...config, [key]: value })
  }

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
          colorScheme={config.isPaused ? 'green' : 'red'}
          size="lg"
          flex={1}
          variant="solid"
        >
          {config.isPaused ? '▶ Resume' : '⏸ Pause'}
        </Button>
        <Button 
          onClick={onReset} 
          colorScheme="blue" 
          size="lg"
          flex={1}
          variant="outline"
        >
          ↺ Reset
        </Button>
      </HStack>

      <Divider />

      <Text fontSize="lg" fontWeight="bold" width="100%">Basic Controls</Text>

      <Box width="100%">
        <Text mb={2} fontWeight="medium">Step Length</Text>
        <Tooltip label={config.stepLength}>
          <Slider
            value={config.stepLength}
            onChange={(v) => handleChange('stepLength', v)}
            min={0.1}
            max={100}
            step={0.1}
          >
            <SliderMark value={0.1} mt={2} ml={-4} fontSize="xs">0.1</SliderMark>
            <SliderMark value={50} mt={2} ml={-6} fontSize="xs">50</SliderMark>
            <SliderMark value={100} mt={2} ml={-6} fontSize="xs">100</SliderMark>
            <SliderTrack bg="whiteAlpha.200">
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={6} />
          </Slider>
        </Tooltip>
      </Box>

      <Box width="100%">
        <Text mb={2} fontWeight="medium">Angle Change (degrees)</Text>
        <Tooltip label={config.angleChange}>
          <Slider
            value={config.angleChange}
            onChange={(v) => handleChange('angleChange', v)}
            min={0.1}
            max={90}
            step={0.1}
          >
            <SliderMark value={0.1} mt={2} ml={-4} fontSize="xs">0.1°</SliderMark>
            <SliderMark value={45} mt={2} ml={-6} fontSize="xs">45°</SliderMark>
            <SliderMark value={90} mt={2} ml={-6} fontSize="xs">90°</SliderMark>
            <SliderTrack bg="whiteAlpha.200">
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={6} />
          </Slider>
        </Tooltip>
      </Box>

      <Box width="100%">
        <Text mb={2} fontWeight="medium">Angle Increment (per rotation)</Text>
        <Tooltip label={config.angleIncrement}>
          <Slider
            value={config.angleIncrement}
            onChange={(v) => handleChange('angleIncrement', v)}
            min={-1}
            max={1}
            step={0.01}
          >
            <SliderMark value={-1} mt={2} ml={-6} fontSize="xs">-1°</SliderMark>
            <SliderMark value={0} mt={2} ml={-3} fontSize="xs">0°</SliderMark>
            <SliderMark value={1} mt={2} ml={-5} fontSize="xs">+1°</SliderMark>
            <SliderTrack bg="whiteAlpha.200">
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={6} />
          </Slider>
        </Tooltip>
      </Box>

      <Box width="100%">
        <Text mb={2} fontWeight="medium">Animation Speed</Text>
        <Tooltip label={`${config.speed}ms`}>
          <Slider
            value={config.speed}
            onChange={(v) => handleChange('speed', v)}
            min={0}
            max={200}
            step={1}
          >
            <SliderMark value={0} mt={2} ml={-6} fontSize="xs">Fast</SliderMark>
            <SliderMark value={100} mt={2} ml={-5} fontSize="xs">Med</SliderMark>
            <SliderMark value={200} mt={2} ml={-6} fontSize="xs">Slow</SliderMark>
            <SliderTrack bg="whiteAlpha.200">
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={6} />
          </Slider>
        </Tooltip>
      </Box>

      <Box width="100%">
        <Text mb={2} fontWeight="medium">Line Width</Text>
        <Tooltip label={config.lineWidth}>
          <Slider
            value={config.lineWidth}
            onChange={(v) => handleChange('lineWidth', v)}
            min={0.1}
            max={20}
            step={0.1}
          >
            <SliderMark value={0.1} mt={2} ml={-4} fontSize="xs">0.1px</SliderMark>
            <SliderMark value={10} mt={2} ml={-4} fontSize="xs">10px</SliderMark>
            <SliderMark value={20} mt={2} ml={-5} fontSize="xs">20px</SliderMark>
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
        <Text mb={2} fontWeight="medium">Multiple Lines</Text>
        <Tooltip label={config.multiLineCount}>
          <Slider
            value={config.multiLineCount}
            onChange={(v) => handleChange('multiLineCount', v)}
            min={1}
            max={10}
            step={1}
          >
            <SliderMark value={1} mt={2} ml={-4} fontSize="xs">1</SliderMark>
            <SliderMark value={5} mt={2} ml={-4} fontSize="xs">5</SliderMark>
            <SliderMark value={10} mt={2} ml={-4} fontSize="xs">10</SliderMark>
            <SliderTrack bg="whiteAlpha.200">
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={6} />
          </Slider>
        </Tooltip>
      </Box>

      <Box width="100%">
        <Text mb={2} fontWeight="medium">Line Spacing</Text>
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
        <Text mb={2} fontWeight="medium">Step Growth</Text>
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
        <Text mb={2} fontWeight="medium">Rotation Offset</Text>
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

      <HStack width="100%" justify="space-between">
        <Text fontWeight="medium">Fade Lines</Text>
        <Switch
          isChecked={config.fadeOpacity}
          onChange={(e) => handleChange('fadeOpacity', e.target.checked)}
        />
      </HStack>

      <HStack width="100%" justify="space-between">
        <Text fontWeight="medium">Rainbow Mode</Text>
        <Switch
          isChecked={config.rainbowMode}
          onChange={(e) => handleChange('rainbowMode', e.target.checked)}
        />
      </HStack>

      {config.rainbowMode && (
        <Box width="100%">
          <Text mb={2} fontWeight="medium">Rainbow Speed</Text>
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

      <Box width="100%">
        <Text mb={2} fontWeight="medium">Blend Mode</Text>
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

      <Divider />

      <HStack width="100%" spacing={4}>
        <Text fontWeight="medium">Base Color</Text>
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
    </VStack>
  )
} 