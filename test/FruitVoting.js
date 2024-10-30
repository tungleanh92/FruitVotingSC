const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FruitVoting", function () {
  const APPLE = "apple";

  async function deploy() {
    // Contracts are deployed using the first signer/account by default
    const [owner, user1, user2, user3] = await ethers.getSigners();

    const MinimalForwarder = await ethers.getContractFactory(
      "MinimalForwarder"
    );
    const minimalForwarder = await MinimalForwarder.deploy();

    const FruitVoting = await ethers.getContractFactory("FruitVoting");
    const fruitVoting = await FruitVoting.deploy(minimalForwarder.address);

    return { fruitVoting, minimalForwarder, owner, user1, user2, user3 };
  }

  describe("Voting", function () {
    it("Execute voteForFruit and getVotesForFruit", async function () {
      const { fruitVoting, minimalForwarder, owner, user1 } = await loadFixture(
        deploy
      );
      // create data from function signature and its input
      let ABI = ["function voteForFruit(string)"];
      let iface = new ethers.utils.Interface(ABI);
      let data = iface.encodeFunctionData("voteForFruit", [APPLE]);
      let userAddress = await user1.getAddress();

      // construct transaction data
      const Req = {
        from: userAddress,
        to: fruitVoting.address,
        value: "0",
        gas: ethers.BigNumber.from("1000000000"),
        nonce: await minimalForwarder.getNonce(userAddress),
        data,
      };

      // encode transaction metadata
      let message = ethers.utils.solidityKeccak256(
        ["address", "address", "uint256", "uint256", "uint256", "bytes"],
        [Req.from, Req.to, Req.value, Req.gas, Req.nonce, Req.data]
      );

      // use user's wallet to sign the transaction
      const arrayifyMessage = ethers.utils.arrayify(message);
      const signature = await user1.signMessage(arrayifyMessage);

      // call contract using operator's wallet
      await minimalForwarder.connect(owner).execute(Req, signature);

      // state updated 
      expect(await fruitVoting.getVotesForFruit(APPLE)).eq(1);
    });
  });
});
// new update