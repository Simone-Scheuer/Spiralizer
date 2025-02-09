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
  Button
} from '@chakra-ui/react'
import { SpiralConfig } from '../models/types'

interface SpiralControlsProps {
  config: SpiralConfig
  onChange: (config: SpiralConfig) => void
  onReset: () => void
}

export const SpiralControls = ({ config, onChange, onReset }: SpiralControlsProps) => {
  const handleChange = (key: keyof SpiralConfig, value: number | string | boolean) => {
    onChange({ ...config, [key]: value })
  }

  return (
    <VStack spacing={4} width="100%" p={4} bg="whiteAlpha.100" borderRadius="md">
      <HStack width="100%" spacing={4}>
        <Button
          onClick={() => handleChange('isPaused', !config.isPaused)}
          colorScheme={config.isPaused ? 'green' : 'red'}
        >
          {config.isPaused ? 'Resume' : 'Pause'}
        </Button>
        <Button onClick={onReset} colorScheme="blue">
          Reset
        </Button>
      </HStack>

      <Box width="100%">
        <Text mb={2}>Step Length</Text>
        <Slider
          value={config.stepLength}
          onChange={(v) => handleChange('stepLength', v)}
          min={1}
          max={50}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>

      <Box width="100%">
        <Text mb={2}>Angle Change (degrees)</Text>
        <Slider
          value={config.angleChange}
          onChange={(v) => handleChange('angleChange', v)}
          min={1}
          max={180}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>

      <Box width="100%">
        <Text mb={2}>Angle Increment (per rotation)</Text>
        <Slider
          value={config.angleIncrement}
          onChange={(v) => handleChange('angleIncrement', v)}
          min={-1}
          max={1}
          step={0.1}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>

      <Box width="100%">
        <Text mb={2}>Speed (ms)</Text>
        <Slider
          value={config.speed}
          onChange={(v) => handleChange('speed', v)}
          min={1}
          max={100}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>

      <Box width="100%">
        <Text mb={2}>Line Width</Text>
        <Slider
          value={config.lineWidth}
          onChange={(v) => handleChange('lineWidth', v)}
          min={1}
          max={10}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>

      <HStack width="100%">
        <Text>Color</Text>
        <Input
          type="color"
          value={config.color}
          onChange={(e) => handleChange('color', e.target.value)}
          width="80px"
        />
      </HStack>
    </VStack>
  )
} 