// This is essential to have global access to ethers.js
require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const GOERLI_URL = process.env.GOERLI_URL;
const SEPOLIA_URL = process.env.SEPOLIA_URL;
const POLYGONZK_URL = process.env.POLYGONZK_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.24',
  networks: {
    goerli: {
      networkCheckTimeout: 10000,
      url: GOERLI_URL,
      accounts: [PRIVATE_KEY],
    },
    sepolia: {
      networkCheckTimeout: 10000,
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY],
    },
    polygonZk: {
      networkCheckTimeout: 10000,
      url: POLYGONZK_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};
