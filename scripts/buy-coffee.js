// we have access to ethers gloabally

// Returns the Ether balance of a given address.
async function getBalance(address) {
  const balanceBigInt = await ethers.provider.getBalance(address);
  return ethers.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses.
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

// Logs the memos stored on-chain from coffee purchases.
async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(
      `At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`
    );
  }
}

async function main() {
  // Get the example accounts we'll be working with.
  const [owner, tipper, tipper2, tipper3] = await ethers.getSigners();

  // We get the contract to deploy.
  const buyMeACoffee = await ethers.deployContract('BuyMeACoffee');

  // Deploy the contract.
  await buyMeACoffee.waitForDeployment();
  console.log('BuyMeACoffee deployed to:', buyMeACoffee.target);

  // Check balances before the coffee purchase.
  const addresses = [owner.address, tipper.address, buyMeACoffee.target];
  console.log('== start ==');
  await printBalances(addresses);

  // Buy the owner a few coffees.
  const tip = { value: ethers.parseEther('1') };
  await buyMeACoffee
    .connect(tipper)
    .buyCoffee('Carolina', "You're the best!", tip);
  await buyMeACoffee
    .connect(tipper2)
    .buyCoffee('Vitto', 'Amazing teacher', tip);
  await buyMeACoffee
    .connect(tipper3)
    .buyCoffee('Kay', 'I love my Proof of Knowledge', tip);

  // Check balances after the coffee purchase.
  console.log('== bought coffee ==');
  await printBalances(addresses);

  // Withdraw.
  await buyMeACoffee.connect(owner).withdrawTips();

  // Check balances after withdrawal.
  console.log('== withdrawTips ==');
  await printBalances(addresses);

  // Check out the memos.
  console.log('== memos ==');
  const memos = await buyMeACoffee.getMemos();
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
