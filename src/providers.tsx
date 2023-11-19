import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider } from './hooks/useSession'

export default function Providers({ 
    children 
  }: { 
  children: React.ReactNode 
  }) {
  return (
      <ChakraProvider>
        <SessionProvider>
          {children}
        </SessionProvider>
      </ChakraProvider>
  )
}