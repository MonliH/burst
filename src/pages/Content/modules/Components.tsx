import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  HStack,
  Progress,
  Spacer,
  Spinner,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { AlertCircle, AlertTriangle, Tool, XSquare } from 'react-feather';
import { EmotionRes, HateSpeech, Misleading } from './api';

export function Loader() {
  return (
    <HStack
      position="absolute"
      bottom="3"
      right="3"
      bgColor="rgba(0, 0, 0, 0.8)"
      padding="2"
      borderRadius="md"
      color="white"
    >
      <Spinner />
      <Text>Checking</Text>
    </HStack>
  );
}
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function EmotionDisplay({ emotion }: { emotion: EmotionRes }) {
  let weightedValue = (emotion.strength - 0.8) * 5 * 100;
  weightedValue *= weightedValue;
  weightedValue /= 100;
  return (
    <HStack
      padding="2"
      borderRadius="md"
      borderColor="yellow.700"
      borderWidth="1px"
      color="white"
      my="2"
    >
      <AlertTriangle color="#975A16" />
      <Box flexGrow={1} ml="3">
        <HStack mb="1">
          <Text fontWeight="bold" fontSize="xs">
            Warning: strong emotions detected.
          </Text>
          <Spacer />
          <Text fontSize="sm">{capitalizeFirstLetter(emotion.emotion)}</Text>
        </HStack>
        <Progress
          value={weightedValue}
          size="xs"
          borderRadius={2}
          colorScheme="yellow"
          width="100%"
        />
      </Box>
    </HStack>
  );
}

function format(hate: HateSpeech): string {
  const isAgressive = hate.aggressive > 0.5;
  const isTargeted = hate.targeted > 0.5;

  if (isAgressive && isTargeted) {
    return 'aggressive, targeted, and hateful';
  } else if (isTargeted) {
    return 'targeted and hateful';
  } else if (isAgressive) {
    return 'aggressive and hateful';
  } else {
    return 'hateful';
  }
}

export function HateDisplay({ hate }: { hate: null | HateSpeech }) {
  const [continued, setContinued] = useState(false);
  return !continued && hate && hate.hateful > 0.5 ? (
    <>
      <VStack minHeight="120px"></VStack>
      <HStack
        zIndex={999}
        position="absolute"
        top="0"
        left="0"
        width="100%"
        minHeight="100%"
        backdropFilter="blur(10px)"
        backgroundColor="rgba(0, 0, 0, 0.5)"
        color="white"
        padding="3"
        spacing="5"
      >
        <Box>
          <AlertCircle color="#FC8181" size={64} />
        </Box>
        <Box>
          <Heading size="md">Warning: Hateful Content</Heading>
          <Text mb="3">
            The following post contains <b>{format(hate)}</b> content.
          </Text>
          <Text fontWeight="bold" mb="1" fontSize="sm">
            Continue at your own discretion.
          </Text>
          <Button
            colorScheme="red"
            variant="outline"
            size="sm"
            onClick={() => setContinued(true)}
          >
            Continue
          </Button>
        </Box>
      </HStack>
    </>
  ) : null;
}

export function MisleadingDisplay({
  misleading,
}: {
  misleading: Misleading | null;
}) {
  return misleading && misleading.misleading > 0.99 ? (
    <Box position="absolute" right="0" bottom="0" zIndex="10">
      <Tooltip label="The information in this tweet may be misleading.">
        <XSquare color="#B83280" />
      </Tooltip>
    </Box>
  ) : null;
}
