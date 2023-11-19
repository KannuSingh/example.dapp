import { useState } from 'react';
import {  Box, Button, Container, Divider, Flex, Heading,Icon,Image, Link,Spacer, Stack, Text,  useColorMode, useColorModeValue, useDisclosure,  useToast  } from '@chakra-ui/react'
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import SSOModal from './components/SSOModal';
import { useSession } from './hooks/useSession';
import UserProfile from './components/UserProfile';
import { formatTime, getNonceValue } from './utils';
import { logger } from './lib/logger';
import { getBlockExplorerURLByChainId, getDemoNFTContractAddressByChainId, getEntryPointContractAddressByChainId, getPimlicoChainNameByChainId } from './lib/config';
import { Contract, ethers } from 'ethers';
import { getDemoNFTContract } from './lib/demoNFT';
import { Identity } from '@semaphore-protocol/identity';
import generateProof from './lib/zkSessionAccountProof';
import { PasskeyXzkAccount } from './lib/passkeyXzkAccount';
import { BiLinkExternal } from 'react-icons/bi';


export default function App() {
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen:isOpenSSOModal, onOpen:onOpenSSOModal, onClose:onCloseSSOModal } = useDisclosure()
  const {session,timeRemaining,identity,userAddress} = useSession()
  const [isLoading,setLoading] = useState(false)
  const [txLink,setTxLink] = useState<string>()

  const handleMint = async () => {
    setLoading(true)
    try{
      const provider = new ethers.JsonRpcProvider('https://goerli.base.org');
      const metadataFile = 'bafybeifyl3g3wr24zqlxplb37zzxykk6crcl6wbvn7fcpi3rwnnerqzjpm'

      const chainId = '0x14a33' //"0x"+BigInt((await provider.getNetwork()).chainId).toString(16)
      logger.debug("smart contract account userAddress: ",userAddress)
    
      const passkeyZkAccount = PasskeyXzkAccount.getPasskeyZkAccountContract(userAddress,provider)
      const nftContractAddress = getDemoNFTContractAddressByChainId(chainId);
      // Prepare calldata to mint NFT
      const to =  nftContractAddress!;
      const value = ethers.parseEther('0')
      const demoNFTContracts = getDemoNFTContract(nftContractAddress!,provider) 
      const mintingCall = demoNFTContracts.interface.encodeFunctionData("mintNFT",[userAddress,metadataFile])
      const data = mintingCall
      let callData = passkeyZkAccount.interface.encodeFunctionData("execute", [to, value,data])
      logger.debug("Generated callData:", callData)
      const gasPrice = (await provider.getFeeData()).gasPrice
      logger.debug("Gas Price",gasPrice)

      
      if (provider == null) throw new Error('must have entryPoint to autofill nonce')
      const c = new Contract(userAddress, [`function getNonce() view returns(uint256)`], provider)
      const nonceValue = await getNonceValue(c)
      const chain = getPimlicoChainNameByChainId(chainId) // find the list of chain names on the Pimlico verifying paymaster reference page
      const apiKey = process.env.REACT_APP_PIMLICO_API_KEY
      const pimlicoEndpoint = `https://api.pimlico.io/v1/${chain}/rpc?apikey=${apiKey}`
      const pimlicoProvider = new ethers.JsonRpcProvider(pimlicoEndpoint,null,{staticNetwork:await provider.getNetwork()})
      const entryPointContractAddress = getEntryPointContractAddressByChainId(chainId)!// '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
      const userOperation = {
        sender: userAddress,
        nonce:"0x"+nonceValue.toString(16),
        initCode:'0x',
        callData,
        callGasLimit: "0x"+BigInt(2000000).toString(16), // hardcode it for now at a high value
        verificationGasLimit: "0x"+BigInt(2000000).toString(16), // hardcode it for now at a high value
        preVerificationGas: "0x"+BigInt(2000000).toString(16), // hardcode it for now at a high value
        maxFeePerGas: "0x"+gasPrice.toString(16),
        maxPriorityFeePerGas: "0x"+gasPrice.toString(16),
        paymasterAndData: "0x",
        signature: "0x"
      }
      const sponsorUserOperationResult = await pimlicoProvider.send("pm_sponsorUserOperation", [
        userOperation,
        {
          entryPoint: entryPointContractAddress,
        },
      ])
         
      const paymasterAndData = sponsorUserOperationResult.paymasterAndData
      logger.debug(`PaymasterAndData: ${paymasterAndData}`)
      if (paymasterAndData && session.sessionCommitment){
        const savedIdentity = new Identity(identity);
        userOperation.paymasterAndData = paymasterAndData
        const userOpHash = await PasskeyXzkAccount.getEntryPointContract(provider).getUserOpHash(userOperation)
        const nullifier = savedIdentity.nullifier;
        const trapdoor = savedIdentity.trapdoor;
        const externalNullifier =  BigInt(userOpHash) >> BigInt(8) //BigInt(solidityKeccak256(['bytes'],[calldataHash])) >> BigInt(8)
        const {proof,publicSignals} = await generateProof(trapdoor,nullifier,externalNullifier)
        const sessionProof: any[8] = proof
        const proofInput: any[3] = publicSignals
        const argv = sessionProof.map((x:any) => BigInt(x))
        const hexStrings = argv.map((n:BigInt) => '0x' + n.toString(16));
        const sessionMode = '0x00000001' // '0x00000001' for session mode, '0x00000000' for direct signature mode
        // Encode the array of hex strings
        const defaultAbiCoder = ethers.AbiCoder.defaultAbiCoder()
        const encodedSessionProof = defaultAbiCoder.encode(['bytes4','address','uint256','uint256[8]'], [sessionMode,nftContractAddress,proofInput[1],hexStrings]);
        userOperation.signature = encodedSessionProof
        logger.debug(userOperation)

        // SUBMIT THE USER OPERATION TO BE BUNDLED
        const userOperationHash = await pimlicoProvider.send("eth_sendUserOperation", [
          userOperation,
          entryPointContractAddress // ENTRY_POINT_ADDRESS
        ])
        logger.debug("UserOperation hash:", userOperationHash)
        // let's also wait for the userOperation to be included, by continually querying for the receipts
        logger.debug("Querying for receipts...")
        let receipt = null
        while (receipt === null) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          receipt = await pimlicoProvider.send("eth_getUserOperationReceipt", [
          userOperationHash,
        ]);
          logger.debug(receipt === null ? "Still waiting..." : receipt)
        }

        const txHash = receipt.receipt.transactionHash
        const blockExplorer = getBlockExplorerURLByChainId(chainId)
        logger.debug(`UserOperation included: ${blockExplorer}/tx/${txHash}`)
        setTxLink(`${blockExplorer}/tx/${txHash}`)
        toast({
          title: "Successfully minted DEMO NFT",
          description: "",
          status: "success",
          duration: 9000,
          isClosable: true,
        })
        } else {
        logger.debug('Invalid PaymasterAndData.');
      }  

    }catch(e){
      logger.error(e)
    }
   setLoading(false)
  };

  return (
    <Container maxW='6xl'>
      {/* Nav bar */}
      <Flex minWidth='max-content' p={2} alignItems='center' gap='2'>
        <Box py='2'>
          <Heading size='md' fontFamily={"monospace"}>Example Dapp</Heading>
        </Box>
        <Spacer />
        {timeRemaining
          && <>
            <Text>
              {formatTime(timeRemaining)}
            </Text>
            <UserProfile/>
          </>
        }
        
        
        <Button onClick={toggleColorMode}>
          {colorMode === "light" ? <MoonIcon /> : <SunIcon color="icon"/>}
        </Button>
      </Flex>

      <Divider orientation='horizontal' />

      {/* body */}
      <Flex direction={"column"} minH={"100vh"} p={2}  >
        <Container maxW={'3xl'}>
          <Stack
            as={Box}
            textAlign={'center'}
            spacing={{ base: 8, md: 14 }}
            py={{ base: 16, md: 28 }}>
            <Heading
              fontWeight={600}
              fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
              lineHeight={'110%'}>
              Example{" "}
              <Text as={'span'} color={'green.400'}>
                Dapp{" "}
              </Text>
            </Heading>
            <Stack textAlign={'start'} spacing={5}>
            {session  
                ?<Stack
                  direction={'column'}
                  spacing={3}
                  align={'center'}
                  alignSelf={'center'}
                  position={'relative'}>
                    <Button
                      isLoading = {isLoading}
                      colorScheme={'green'}
                      bg={'green.400'}
                      rounded={'full'}
                      px={6}
                      onClick={handleMint}
                      _hover={{
                        bg: 'green.500',
                      }}>
                      MintNFT
                    </Button>
                    {txLink && <Link href={txLink} isExternal>
                      Transaction link <Icon as={BiLinkExternal} mx='2px' />
                    </Link> }
                </Stack>
                : <Stack
                    direction={'column'}
                    spacing={3}
                    align={'center'}
                    alignSelf={'center'}
                    position={'relative'}>
                      <Button
                        isLoading = {isLoading}
                        colorScheme={'green'}
                        bg={'green.400'}
                        rounded={'full'}
                        px={6}
                        onClick={onOpenSSOModal}
                        _hover={{
                          bg: 'green.500',
                        }}>
                        Sign In w/ Permissionless Account
                      </Button>
                      <Button as={Link} target="_blank" href='ipfs://bafybeifdkeqmj33tazfar3i2qvngbels4hgxaqfjjygdlqfzpt2o33apcy/' >
                          Create new account 
                      </Button>
                  </Stack>
              }
            </Stack>
          </Stack>
          <SSOModal isOpen={isOpenSSOModal} onOpen={onOpenSSOModal} onClose={onCloseSSOModal} />

        {/* footer */} 
        <Flex direction={"column"} alignItems={"center"} gap={2}>
          <Text textAlign={'center'} mt={4}>
            {`Explore this application as a practical example showcasing a passkey and zk 
            commitmentId smart contract account. Reach out to `}<Text as={'b'}>{`@kdsinghsaini`}</Text>
            {` on Telegram or Twitter for any feedback.`}
          </Text>
          
          <Text> Sponsored By{' '}
            <Link href="https://www.pimlico.io" color='blue.400' _hover={{ color: 'blue.500' }}>
              Pimlico
            </Link>
          </Text>
          <Box bgColor={useColorModeValue('gray.800', '')} p={2}>
            <Image
              src="/pimlico.svg"
              alt="Pimlico Logo"
            />
          </Box>
        </Flex>
        </Container>
      </Flex>
    </Container>
  )
}