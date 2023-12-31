/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "./common";

export declare namespace IAccountRegistry {
  export type SignerInfoStruct = {
    signerType: BigNumberish;
    pubKeyX: BigNumberish;
    pubKeyY: BigNumberish;
    id: BytesLike;
  };

  export type SignerInfoStructOutput = [
    signerType: bigint,
    pubKeyX: bigint,
    pubKeyY: bigint,
    id: string
  ] & { signerType: bigint; pubKeyX: bigint; pubKeyY: bigint; id: string };

  export type AccountMetaInfoStruct = {
    accountAddress: AddressLike;
    signerInfo: IAccountRegistry.SignerInfoStruct;
    domainUrl: BytesLike;
  };

  export type AccountMetaInfoStructOutput = [
    accountAddress: string,
    signerInfo: IAccountRegistry.SignerInfoStructOutput,
    domainUrl: string
  ] & {
    accountAddress: string;
    signerInfo: IAccountRegistry.SignerInfoStructOutput;
    domainUrl: string;
  };
}

export interface AccountRegistryInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "addAccountMetaInfo"
      | "getAccountMetaInfo"
      | "updateAccountMetaInfo"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: "AccountMetaInfoAdded" | "AccountMetaInfoUpdated"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "addAccountMetaInfo",
    values: [BytesLike, IAccountRegistry.AccountMetaInfoStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "getAccountMetaInfo",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "updateAccountMetaInfo",
    values: [BytesLike, IAccountRegistry.AccountMetaInfoStruct]
  ): string;

  decodeFunctionResult(
    functionFragment: "addAccountMetaInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAccountMetaInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateAccountMetaInfo",
    data: BytesLike
  ): Result;
}

export namespace AccountMetaInfoAddedEvent {
  export type InputTuple = [
    username: BytesLike,
    accountAddress: AddressLike,
    metaInfo: IAccountRegistry.AccountMetaInfoStruct
  ];
  export type OutputTuple = [
    username: string,
    accountAddress: string,
    metaInfo: IAccountRegistry.AccountMetaInfoStructOutput
  ];
  export interface OutputObject {
    username: string;
    accountAddress: string;
    metaInfo: IAccountRegistry.AccountMetaInfoStructOutput;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace AccountMetaInfoUpdatedEvent {
  export type InputTuple = [
    username: BytesLike,
    accountAddress: AddressLike,
    metaInfo: IAccountRegistry.AccountMetaInfoStruct
  ];
  export type OutputTuple = [
    username: string,
    accountAddress: string,
    metaInfo: IAccountRegistry.AccountMetaInfoStructOutput
  ];
  export interface OutputObject {
    username: string;
    accountAddress: string;
    metaInfo: IAccountRegistry.AccountMetaInfoStructOutput;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface AccountRegistry extends BaseContract {
  connect(runner?: ContractRunner | null): AccountRegistry;
  waitForDeployment(): Promise<this>;

  interface: AccountRegistryInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  addAccountMetaInfo: TypedContractMethod<
    [
      _username: BytesLike,
      _accountMetaInfo: IAccountRegistry.AccountMetaInfoStruct
    ],
    [void],
    "nonpayable"
  >;

  getAccountMetaInfo: TypedContractMethod<
    [_username: BytesLike],
    [IAccountRegistry.AccountMetaInfoStructOutput],
    "view"
  >;

  updateAccountMetaInfo: TypedContractMethod<
    [
      _username: BytesLike,
      _accountMetaInfo: IAccountRegistry.AccountMetaInfoStruct
    ],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "addAccountMetaInfo"
  ): TypedContractMethod<
    [
      _username: BytesLike,
      _accountMetaInfo: IAccountRegistry.AccountMetaInfoStruct
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getAccountMetaInfo"
  ): TypedContractMethod<
    [_username: BytesLike],
    [IAccountRegistry.AccountMetaInfoStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "updateAccountMetaInfo"
  ): TypedContractMethod<
    [
      _username: BytesLike,
      _accountMetaInfo: IAccountRegistry.AccountMetaInfoStruct
    ],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "AccountMetaInfoAdded"
  ): TypedContractEvent<
    AccountMetaInfoAddedEvent.InputTuple,
    AccountMetaInfoAddedEvent.OutputTuple,
    AccountMetaInfoAddedEvent.OutputObject
  >;
  getEvent(
    key: "AccountMetaInfoUpdated"
  ): TypedContractEvent<
    AccountMetaInfoUpdatedEvent.InputTuple,
    AccountMetaInfoUpdatedEvent.OutputTuple,
    AccountMetaInfoUpdatedEvent.OutputObject
  >;

  filters: {
    "AccountMetaInfoAdded(bytes32,address,tuple)": TypedContractEvent<
      AccountMetaInfoAddedEvent.InputTuple,
      AccountMetaInfoAddedEvent.OutputTuple,
      AccountMetaInfoAddedEvent.OutputObject
    >;
    AccountMetaInfoAdded: TypedContractEvent<
      AccountMetaInfoAddedEvent.InputTuple,
      AccountMetaInfoAddedEvent.OutputTuple,
      AccountMetaInfoAddedEvent.OutputObject
    >;

    "AccountMetaInfoUpdated(bytes32,address,tuple)": TypedContractEvent<
      AccountMetaInfoUpdatedEvent.InputTuple,
      AccountMetaInfoUpdatedEvent.OutputTuple,
      AccountMetaInfoUpdatedEvent.OutputObject
    >;
    AccountMetaInfoUpdated: TypedContractEvent<
      AccountMetaInfoUpdatedEvent.InputTuple,
      AccountMetaInfoUpdatedEvent.OutputTuple,
      AccountMetaInfoUpdatedEvent.OutputObject
    >;
  };
}
