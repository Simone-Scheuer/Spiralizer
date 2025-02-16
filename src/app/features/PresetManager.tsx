import {
  Button,
  HStack,
  VStack,
  Input,
  Text,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Box,
  MenuGroup,
  MenuOptionGroup,
  MenuItemOption,
  Flex,
} from '@chakra-ui/react'
import { ChevronDownIcon, DeleteIcon } from '@chakra-ui/icons'
import { useState, useEffect } from 'react'
import { SpiralConfig, SpiralPreset } from '../models/types'

interface PresetManagerProps {
  config: SpiralConfig
  onLoadPreset: (preset: SpiralPreset) => void
}

export const PresetManager = ({ config, onLoadPreset }: PresetManagerProps) => {
  const [presets, setPresets] = useState<SpiralPreset[]>([])
  const [isClient, setIsClient] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  // Set isClient to true on mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const savedPresets = localStorage.getItem('spiralPresets')
      if (savedPresets) {
        const parsedPresets = JSON.parse(savedPresets)
        // Sort presets by creation date, newest first
        parsedPresets.sort((a: SpiralPreset, b: SpiralPreset) => b.createdAt - a.createdAt)
        setPresets(parsedPresets)
      }
    } catch (e) {
      console.error('Error loading presets:', e)
    }
  }, [])

  // Save presets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('spiralPresets', JSON.stringify(presets))
    } catch (e) {
      console.error('Error saving presets:', e)
    }
  }, [presets])

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for your preset',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Create new preset, omitting the specified properties
    const { isPaused, audioEnabled, audioVolume, screensaverMode, ...configToSave } = config
    const newPreset: SpiralPreset = {
      id: Date.now().toString(),
      name: newPresetName.trim(),
      config: configToSave,
      createdAt: Date.now(),
    }

    // Add to presets list
    setPresets(prev => [newPreset, ...prev])
    setNewPresetName('')
    onClose()

    toast({
      title: 'Preset saved',
      description: `"${newPreset.name}" has been saved`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleDeletePreset = (presetId: string, presetName: string) => {
    setPresets(prev => prev.filter(p => p.id !== presetId))
    toast({
      title: 'Preset deleted',
      description: `"${presetName}" has been removed`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  const handleLoadPreset = (preset: SpiralPreset) => {
    onLoadPreset(preset)
    toast({
      title: 'Preset loaded',
      description: `"${preset.name}" has been loaded`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }

  return (
    <>
      <HStack 
        width="100%" 
        spacing={2} 
        flexWrap="wrap" 
        gap={2}
      >
        <Button
          onClick={onOpen}
          colorScheme="yellow"
          size="md"
          flex={{ base: "1 1 100%", sm: "1" }}
        >
          Save Settings
        </Button>
        <Menu closeOnSelect={false}>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            colorScheme="blue"
            size="md"
            flex={{ base: "1 1 100%", sm: "1" }}
            isDisabled={!isClient || presets.length === 0}
          >
            Load Preset {isClient && presets.length > 0 && `(${presets.length})`}
          </MenuButton>
          {isClient && presets.length > 0 && (
            <MenuList bg="gray.800" borderColor="whiteAlpha.200">
              <MenuGroup title="Saved Presets" color="whiteAlpha.700">
                {presets.map(preset => (
                  <Box key={preset.id} role="group" position="relative">
                    <MenuItem
                      bg="gray.800"
                      _hover={{ bg: 'gray.700' }}
                      onClick={() => handleLoadPreset(preset)}
                      pr="12"
                    >
                      <Text>{preset.name}</Text>
                    </MenuItem>
                    <Box
                      position="absolute"
                      right="2"
                      top="50%"
                      transform="translateY(-50%)"
                      opacity="0"
                      _groupHover={{ opacity: 1 }}
                      transition="opacity 0.2s"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePreset(preset.id, preset.name)
                      }}
                      cursor="pointer"
                      color="red.400"
                      _hover={{ color: 'red.300' }}
                      role="button"
                      aria-label="Delete preset"
                    >
                      <DeleteIcon />
                    </Box>
                  </Box>
                ))}
              </MenuGroup>
            </MenuList>
          )}
        </Menu>
      </HStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader color="white">Save Preset</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Box width="100%">
                <Text mb={2} color="white">Preset Name</Text>
                <Input
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Enter a name for your preset"
                  bg="whiteAlpha.200"
                  color="white"
                />
              </Box>
              <Button
                colorScheme="yellow"
                width="100%"
                onClick={handleSavePreset}
              >
                Save Preset
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
} 