# KKFI Jetton Token

## Install blueprint cli tool
```npm create ton@latest```

## Project structure

-   `contracts` - source code of all the smart contracts of the project and their dependencies.
-   `wrappers` - wrapper classes (implementing `Contract` from ton-core) for the contracts, including any [de]serialization primitives and compilation functions.
-   `tests` - tests for the contracts.
-   `scripts` - scripts used by the project, mainly the deployment scripts.

## How to use

### Build

`npx blueprint build` 

### Test

`npx blueprint test` 

### Deploy script

`npx blueprint run` 

### Add a new contract

`npx blueprint create ContractName` 
