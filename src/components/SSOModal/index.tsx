import { logger } from '../../lib/logger';
import { Modal,  ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,  ModalCloseButton, Button, Input,  FormControl, FormLabel, FormHelperText, useToast, } from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import { getAccountRegistryContract } from '../../lib/AccountRegistry';
import { config, getDemoNFTContractAddressByChainId } from '../../lib/config';
import { ethers } from 'ethers';
import { Session, useSession } from '../../hooks/useSession';
import { Identity } from '@semaphore-protocol/identity';

interface IUserRegistrationModal{
  isOpen:boolean; 
  onOpen():void; 
  onClose():void; 
}

export default function SSOModal({ isOpen, onOpen, onClose }:IUserRegistrationModal) {
  const toast = useToast()
  const [username,setUsername] = useState("")
  const [popup, setPopup] = useState<Window>();
  const {setSession,setIdentity,setUserAddress,setUsername:setSessionUsername} = useSession()
  
  const [authorizationOrigin,setAuthorizationOrigin] = useState<string>()
  
  useEffect(() => {
    // Handle the message event to receive data from the popup
    const receiveMessage = (event) => {
      logger.debug("receive message: ",event.origin)
      logger.debug("receive message: ",event)
      // Ensure that the message is from a trusted origin
      if (event.origin === authorizationOrigin) {
        console.log("Received Data from popup",event.data);
        const data = event.data
        if(data && data.status === 200 ){
          toast({ title: "Successfully Logged In",
          description: "", status: "success",
          duration: 9000, isClosable: true })

          const sessionIdentityString = event.data.sessionIdentity
          const sessionExpiry = event.data.sessionExpiry
          setIdentity(sessionIdentityString)
          let session:Session ={
              sessionCommitment :new Identity(sessionIdentityString).commitment.toString(),
              validAfter:Math.round( Date.now()/1000),
              validUntil:parseInt(sessionExpiry)
            }
          setSession(session)
          setSessionUsername(username)
        }else{
            toast({ title: "Failed to Logged In",
            description: "", status: "error",
            duration: 9000, isClosable: true })
          }
          popup && popup.close()
          onClose()
        }

      };
      
    // Add event listener for the message event
    window.addEventListener('message', receiveMessage);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener('message', receiveMessage);
    };
  }, [authorizationOrigin, onClose, popup, setIdentity, setSession, setSessionUsername, toast, username]);

  const handleSSO = async() => {
    const accountMetaInfo = await fetchAccountMetaInfo()
    if(!ethers.isAddress(accountMetaInfo.accountAddress) || !accountMetaInfo.domainUrl ){
      toast({ title: "User not registered yet",
        description: "", status: "error",
        duration: 9000, isClosable: true });
      return;
    }
    logger.debug(ethers.toUtf8String(accountMetaInfo.domainUrl))
    setAuthorizationOrigin(ethers.toUtf8String(accountMetaInfo.domainUrl))
    console.log(accountMetaInfo.accountAddress)
    setUserAddress(accountMetaInfo.accountAddress)
    const width = 600;
    const height = 400;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    const redirect_uri = window.location.origin
    const scope = [`${username}`,'']
    const chainId = '0x14a33'
    const client_id = getDemoNFTContractAddressByChainId(chainId)
    const params = `?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope.join(" ")}`
    const popupWindow = window.open(
      `${ethers.toUtf8String(accountMetaInfo.domainUrl)}/#/authorize`+params,
      'Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    setPopup(popupWindow);
  };


  const fetchAccountMetaInfo =  async() =>{
    console.log("fetching account metaInfo for user:",username)
    const chainId = '0x14a33' 
    const provider = new ethers.JsonRpcProvider('https://goerli.base.org');
    const accountRegistry = getAccountRegistryContract(config[chainId].accountRegistryContractAddress,provider)
    const accountMetaInfo = await accountRegistry.getAccountMetaInfo(ethers.keccak256(ethers.toUtf8Bytes(username)));
    logger.info("AccountMetaInfo",ethers.toUtf8String(accountMetaInfo.domainUrl))
    return accountMetaInfo;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Login</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
        <FormControl>
          <FormLabel>Username</FormLabel>
          <Input type='email' value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())}/>
          <FormHelperText>Enter username to identify your account.</FormHelperText>
        </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='red' mr={3} onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSSO} colorScheme='green'>Login</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}