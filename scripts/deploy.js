const hre = require("hardhat");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
   // Unit Deploy&Verify MinimalForwarder contract
  const MinimalForwarder = await ethers.getContractFactory("MinimalForwarder");
  const minimalForwarder = await MinimalForwarder.deploy();
  await minimalForwarder.waitForDeployment();
  console.log("FruitVoting deployed to:", minimalForwarder.target);
  await sleep(1000);
  await hre.run("verify:verify", {
    address: minimalForwarder.target,
    contract: "contracts/MinimalForwarder.sol:MinimalForwarder",
  });

   // Unit Deploy&Verify FruitVoting contract
   const FruitVoting = await ethers.getContractFactory("FruitVoting");
   const fruitVoting = await FruitVoting.deploy(minimalForwarder.target);
   await fruitVoting.deployed();
   console.log("FruitVoting deployed to:", fruitVoting.address);
   await sleep(1000);
  await hre.run("verify:verify", {
    address: fruitVoting.target,
    contract: "contracts/FruitVoting.sol:FruitVoting",
    constructorArguments: [minimalForwarder.target]
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
