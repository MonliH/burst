import { Box, ChakraProvider, Image, Text } from '@chakra-ui/react';
import React from 'react';
import logo from '../../assets/img/logo.png';

export default function Popup() {
  return (
    <ChakraProvider>
      <Box width="300px" padding="3" borderRadius="sm">
        <Image src={logo} width="70%" />
        <Text ml="2" fontSize="lg">
          Escape your filter bubble.
        </Text>
      </Box>
    </ChakraProvider>
  );
}
