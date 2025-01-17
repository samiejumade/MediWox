<p align="center">
  <h1 align="center"><a href="https://mediwox.netlify.app/" target="_blank">MediWox</a></h1>
  <p align="center">
    Revolutionizing healthcare data management: blockchain-based medical record storage for patients and insurance companies

    https://projects.aircwou.in/vid/MediWox.mp4
  </p>
</p>


<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
  <li>
      <a href="#getting-started">Problem Statement</a>
  </li>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
      </ul>
        <li><a href="#built-with">Built With</a></li>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#running-the-project">Running the project</a></li>
      </ul>
    </li>
     <li>
      <a href="#Future Prospective">Future Prospects</a>
     </li>
    <!-- <li><a href="#relevant-screenshots">Relevant Screenshots</a></li> -->
  </ol>
</details>

## ℹ️ Problem Statement

The data privacy of patients is essential because it involves sensitive personal information, such as medical records, test results, and health history. If failed to do so it can result in various consequences, such as financial loss, identity theft, damage to reputation, and even physical harm. It can also lead to discrimination, as individuals with certain health conditions may face challenges in obtaining health insurance.

## ℹ️ About The Project

Our project MediWox seeks to address these challenges by leveraging the power of blockchain to create a secure, decentralized platform for storing and sharing healthcare data. By doing so, we hope to empower patients and Insurance providers, to make more informed decisions, improve outcomes, and advance the field of healthcare as a whole.

## ℹ️ Future Prospects
1. We will be implementing insurance policy as ERC-721 Standard (i.e Non-Fungible Tokens), so as to specify the uniqueness and ownership of each insurance policy.
2. We will be giving patients the flexibility to buy health insurance policy according to their preference instead of defined policies by the insurance provider.
3. We will predict policy annual premium amount using Machine Learning techniques based on factors like patient's age, location, etc.

## 🛠️ Built With

![img1](https://user-images.githubusercontent.com/54027343/404147521-e6116db0-00b4-4bf4-b690-11a3d2564e8f.png)
Following technologies and libraries are used for the development of this project.

- [React](https://reactjs.org/)
- [Solidity](https://soliditylang.org/)
- [Truffle](https://trufflesuite.com/)
- [Mocha](https://mochajs.org/)
- [Chai](https://chaijs.com/)
- [Infura](https://infura.io/)

<!-- GETTING STARTED -->

## 📌 Installation

To setup the project locally follow the steps below

### 💻 Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- [Ganache](https://trufflesuite.com/ganache/)
- [Metamask Wallet Extension](https://docs.docker.com/compose/install/) or a Web3 browser like Brave

### 🤖 Running the project.

To set this up in the local repository:

1. **Fork** and **clone** the project to your local system
2. Copy the commands below to install the dependencies:

```
npm i -g truffle
npm run client:install
npm run truffle:install
```

3. Now, start a local Ethereum blockchain network on your system using Ganache. Ganache provides you with 10 testing accounts each with 100 ETH. 

4. Obtain Infura API Key and API Secret for IPFS from [Infura Dashboard](https://infura.io/), and create a dedicated gateway for your project. Set the environment variables in `client/.env` file. Or you can rename `client/.env.example` to `client/.env`
```bash
REACT_APP_INFURA_PROJECT_ID=...
REACT_APP_INFURA_API_KEY_SECRET=...
REACT_APP_INFURA_DEDICATED_GATEWAY=....
```

5. Then, copy the following commands to deploy the smart contracts to the local Ethereum blockchain and start the React app:

```
npm run truffle:migrate
npm run client:start
```

6. Set up Metamask to connect to the local blockchain created by Ganache(i.e. [http://localhost:8545/](http://localhost:8545/))

7. Now, obtain the private keys of some of the accounts from Ganache and import the accounts into Metamask wallet.

8. You're ready to go. Visit [http://localhost:3000/](http://localhost:3000/) to check out MediWox

////////////////////////Sepolia contract deployment details //////////////////////////////////////


   Second contract:--
   Starting migrations...
======================
> Network name:    'sepolia'
> Network id:      11155111
> Block gas limit: 36000000 (0x2255100)


1_deploy_medichain.js
=====================

   Deploying 'MediWox'
   -------------------
   > transaction hash:    0xf344afd889d280a87cd723b89050e35447810c08c04a0b9e314d710ccbc78844
   > Blocks: 1            Seconds: 9
   > contract address:    0x450B70084F7Cf32655c8bC9e842479145B0EE364
   > block number:        7503798
   > block timestamp:     1737027828
   > account:             0x0bb6A0a5b8A05a98D0dc50838716a59Ca4b57901
   > balance:             5.165878599036755721
   > gas used:            3173713 (0x306d51)
   > gas price:           9.6717881 gwei
   > value sent:          0 ETH
   > total cost:          0.0306954796262153 ETH

   Pausing for 2 confirmations...

   -------------------------------
   > confirmation number: 1 (block: 7503799)
   > confirmation number: 2 (block: 7503800)
   > Saving artifacts
   -------------------------------------
   > Total cost:     0.0306954796262153 ETH

Summary
=======
> Total deployments:   1
> Final cost:          0.0306954796262153 ETH



First contract on sepolia befoe=re changes in contract :--
transaction hash:    0xb7085d7788f75df0f4a1481509d05add24f6e2a50b0042fa79e8f5363e408984
   > Blocks: 3            Seconds: 29
   > contract address:    0x1FAE98AfD4D608f88fEdEE95774d93f637ABa8Ab
   > block number:        7495812
   > block timestamp:     1736931504
   > account:             0x0bb6A0a5b8A05a98D0dc50838716a59Ca4b57901
   > balance:             5.87297320691916718
