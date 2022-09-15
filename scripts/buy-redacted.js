const hre = require("hardhat");

// Returns the Ether balance of a given address.
async function getBalance(address) {
  const balanceBigInt = await hre.waffle.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses.
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

// Logs the memos stored on-chain from Redacted purchases.
async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    const item = memo.item;
    console.log(
      `At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}" and told you to buy "${item}"`
    );
  }
}

async function main() {
  // Get the example accounts we'll be working with.
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  // We get the contract to deploy.
  const BuyMeARedacted = await hre.ethers.getContractFactory("BuyMeARedacted");
  const buyMeARedacted = await BuyMeARedacted.deploy();

  // Deploy the contract.
  await buyMeARedacted.deployed();
  console.log("BuyMeARedacted deployed to:", buyMeARedacted.address);

  // Check balances before the Redacted purchase.
  const addresses = [owner.address, tipper.address, buyMeARedacted.address];
  console.log("== start ==");
  await printBalances(addresses);

  // Buy the owner a few Redacteds.
  const tip = { value: hre.ethers.utils.parseEther("1") };
  await buyMeARedacted
    .connect(tipper)
    .buyRedacted("Carolina", "You're the best!", tip);
  await buyMeARedacted
    .connect(tipper2)
    .buyRedacted("Vitto", "Amazing teacher", tip);
  await buyMeARedacted
    .connect(tipper3)
    .buyRedacted("Kay", "I love my Proof of Knowledge", tip);

  // Check balances after the Redacted purchase.
  console.log("== bought Redacted ==");
  await printBalances(addresses);

  // Withdraw.
  await buyMeARedacted.connect(owner).withdrawTips();

  // Check balances after withdrawal.
  console.log("== withdrawTips ==");
  await printBalances(addresses);

  // Check out the memos.
  console.log("== memos ==");
  const memos = await buyMeARedacted.getMemos();
  printMemos(memos);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
