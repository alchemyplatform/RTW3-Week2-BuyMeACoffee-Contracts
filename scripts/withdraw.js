const hre = require("hardhat");
const abi = require("../artifacts/contracts/BuyMeARedacted.sol/BuyMeARedacted.json");

async function getBalance(provider, address) {
  const balanceBigInt = await provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

async function main() {
  // Get the contract that has been deployed to Goerli.
  const contractAddress = "0xF1584FE322d5101E4D5ca7d410ECc962ef7E791c";
  const contractABI = abi.abi;

  // Get the node connection and wallet connection.
  const provider = new hre.ethers.providers.AlchemyProvider(
    "goerli",
    process.env.GOERLI_API_KEY
  );

  // Ensure that signer is the SAME address as the original contract deployer,
  // or else this script will fail with an error.
  const signer = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Instantiate connected contract.
  const buyMeARedacted = new hre.ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  // Check starting balances.
  console.log(
    "current balance of owner: ",
    await getBalance(provider, signer.address),
    "ETH"
  );
  const contractBalance = await getBalance(provider, buyMeARedacted.address);
  console.log(
    "current balance of contract: ",
    await getBalance(provider, buyMeARedacted.address),
    "ETH"
  );

  // Withdraw funds if there are funds to withdraw.
  if (contractBalance !== "0.0") {
    console.log("withdrawing funds..");
    const withdrawTxn = await buyMeARedacted.withdrawTips();
    await withdrawTxn.wait();
  } else {
    console.log("no funds to withdraw!");
  }

  // Check ending balance.
  console.log(
    "current balance of owner: ",
    await getBalance(provider, signer.address),
    "ETH"
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
