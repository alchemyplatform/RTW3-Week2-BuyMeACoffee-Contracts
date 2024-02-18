const { expect } = require('chai');

const {
  loadFixture,
} = require('@nomicfoundation/hardhat-toolbox/network-helpers');
const { ethers } = require('hardhat');

describe('BuyMeACoffee contract', function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployContractFixture() {
    // Get the Signers here.
    // Contracts are deployed using the first signer/account by default
    const [owner, tipper1] = await ethers.getSigners();

    // Deploy the contract
    const buyMeACoffee = await ethers.deployContract('BuyMeACoffee');
    await buyMeACoffee.waitForDeployment();

    // Fixtures can return anything you consider useful for your tests
    return { buyMeACoffee, owner, tipper1 };
  }

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      const { buyMeACoffee, owner } = await loadFixture(deployContractFixture);
      expect(await buyMeACoffee.owner()).to.equal(owner.address);
    });

    it('The contract should start with a zero balance', async function () {
      const { buyMeACoffee } = await loadFixture(deployContractFixture);
      expect(await ethers.provider.getBalance(buyMeACoffee.target)).to.equal(0);
    });
  });

  describe('Buying coffee', function () {
    it('Should revert if called with 0 Eth', async function () {
      const { buyMeACoffee, tipper1 } = await loadFixture(
        deployContractFixture
      );

      const tip = { value: ethers.parseEther('0') };
      await expect(
        buyMeACoffee.connect(tipper1).buyCoffee('tipper 1', 'a comment', tip)
      ).to.be.revertedWith("can't buy coffee for free!");
    });

    it('Should transer Eth to the owner', async function () {
      const { buyMeACoffee, tipper1 } = await loadFixture(
        deployContractFixture
      );

      // Buy the owner a coffees.
      const tip = { value: ethers.parseEther('1') };

      await expect(
        await buyMeACoffee
          .connect(tipper1)
          .buyCoffee('tipper1', 'tipper 1 message', tip)
      ).to.changeEtherBalance(buyMeACoffee.target, tip.value);
    });

    describe('Events', function () {
      it('Should emit an event on buying coffee', async function () {
        const { buyMeACoffee, tipper1 } = await loadFixture(
          deployContractFixture
        );

        // Get the latest block timestamp.
        const blockTimestamp = (await ethers.provider.getBlock('latest'))
          .timestamp;

        // Provide a sample tip.
        const tip = { value: ethers.parseEther('1') };
        await expect(
          await buyMeACoffee
            .connect(tipper1)
            .buyCoffee('tipper 1', 'cool content', tip)
        )
          .to.emit(buyMeACoffee, 'NewMemo')
          .withArgs(
            tipper1.address,
            blockTimestamp + 1,
            'tipper 1',
            'cool content'
          );
      });
    });
  });

  describe('Withdrawals', function () {
    describe('Validation', function () {
      it('Should revert if called from another account', async function () {
        const { buyMeACoffee, tipper1 } = await loadFixture(
          deployContractFixture
        );

        // Provide a sample tip.
        const tip = { value: ethers.parseEther('1') };
        await buyMeACoffee
          .connect(tipper1)
          .buyCoffee('tipper 1', 'enjoyed', tip);

        expect(await buyMeACoffee.connect(tipper1).withdrawTips()).to.be
          .reverted;
      });

      it("Should'n fail if called by the owner", async function () {
        const { buyMeACoffee, tipper1 } = await loadFixture(
          deployContractFixture
        );

        const tip = { value: ethers.parseEther('1') };
        await buyMeACoffee
          .connect(tipper1)
          .buyCoffee('tipper 1', 'sample message', tip);

        expect(await buyMeACoffee.withdrawTips()).not.to.be.reverted;
      });
    });

    describe('Transfers', function () {
      it('Should transfer the balance to the owner', async function () {
        const { buyMeACoffee, owner, tipper1 } = await loadFixture(
          deployContractFixture
        );

        // Provide a sample tip.
        const tip = { value: ethers.parseEther('1') };
        await buyMeACoffee
          .connect(tipper1)
          .buyCoffee('tipper 1', 'enjoyed', tip);

        const contractBalance = await ethers.provider.getBalance(
          buyMeACoffee.target
        );
        await expect(await buyMeACoffee.withdrawTips()).to.changeEtherBalance(
          owner,
          contractBalance
        );
      });

      it('The contract balance should be zero after withdrawal', async function () {
        const { buyMeACoffee, tipper1 } = await loadFixture(
          deployContractFixture
        );

        // Provide a sample tip.
        const tip = { value: ethers.parseEther('1') };
        await buyMeACoffee
          .connect(tipper1)
          .buyCoffee('tipper 1', 'enjoyed', tip);

        await buyMeACoffee.withdrawTips();
        expect(await ethers.provider.getBalance(buyMeACoffee.target)).to.equal(
          0
        );

        // Another way to check this test
        // const contractBalance = await ethers.provider.getBalance(
        //   buyMeACoffee.target
        // );
        // await expect(await buyMeACoffee.withdrawTips()).to.changeEtherBalance(
        //   buyMeACoffee.target,
        //   -contractBalance
        // );
      });
    });
  });
});
