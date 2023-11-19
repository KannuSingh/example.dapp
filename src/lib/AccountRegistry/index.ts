import { Contract,Provider,Signer} from "ethers"
import Account_Registry_ABI from "./abis/AccountRegistry.json"
import { AccountRegistry } from "./types"

export function getAccountRegistryContract(address:string,signerOrProvider: Provider|Signer):AccountRegistry  {
  return  new Contract(address, Account_Registry_ABI, signerOrProvider) as unknown as AccountRegistry 
}