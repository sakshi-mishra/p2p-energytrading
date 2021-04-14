const energyBlocksContract = artifacts.require("./EnergyBlocks.sol");
const energyMarketplaceContract = artifacts.require("./EnergyMarketplace.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(energyBlocksContract).then(function() {
    console.log("EnergyBlocksContract.address:", energyBlocksContract.address);
    return deployer.deploy(
      energyMarketplaceContract,
      energyBlocksContract.address
    );
  });
};
