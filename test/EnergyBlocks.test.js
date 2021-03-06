const { assert, expect } = require('chai');
const EnergyBlocks = artifacts.require('./EnergyBlocks.sol');

// Special function of Chai. To use `should`
require('chai')
  .use(require('chai-as-promised'))
  .should();

// accounts: Address #1~3 generated by Ganache
contract('EnergyBlocks', ([deployer, seller, buyer]) => {
  let energyBlock;

  beforeEach(async () => {
    energyBlock = await EnergyBlocks.deployed();
  });

  const addEnergyBlock = async (
    sourceId = 'SolarPV',
    valueBN = web3.utils.toWei('1', 'Ether')) => {
      const txn = await energyBlock
      .addEnergyBlock(seller, sourceId, valueBN);
      const energyBlockId = txn.logs[0].args[0];
      // console.log('energyBlkId:', energyBlockId.toString());

      const eBlk = await energyBlock.getEnergyBlock(energyBlockId);
      return {energyBlockId, eBlk};

    }


  describe('P2P EnergyBlocks', async () => {
    console.log('deployer:', deployer.toString());
    console.log('seller:', seller.toString());
    console.log('buyer:', buyer.toString());
    it('Should deploy successfully', async () => {
      const address = await energyBlock.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it('Should Allow producer to add new energyBlocks', async() => {
      const sourceId = 'WindTurbine1';
      const price = web3.utils.toWei('0.123', 'Ether');
      let { eBlk} = await addEnergyBlock(sourceId, price);
      // Convert eBlk:[] -> {}
      eBlk = {...eBlk};
      // console.log('eBlk:', eBlk);

      expect(eBlk.producer.toString()).to.equal(seller.toString());
      expect(eBlk.sourceId).to.equal(sourceId);
      expect(eBlk.priceInWei).to.equal(price);
    });

    it('Should allow consumers to view available energyBlocks', async() => {
      const sourceId = 'WindTurbine2';
      const price = web3.utils.toWei('0.456', 'Ether');

      const {eBlk} = await addEnergyBlock(sourceId, price);

      expect(eBlk.producer.toString()).to.equal(seller.toString())
      expect(eBlk.sourceId).to.equal(sourceId)
      expect(eBlk.priceInWei).to.equal(price)
    })

    it(`Should allow to set eBlk's buyer`, async () => {
      const sourceId = 'SolarPv101'
      const valueBN = web3.utils.toWei('1.23')
      const { eBlkId, eBlk } = await addEnergyBlock(sourceId, valueBN)

      await energyBlock.setTradeContractAddress(seller)
      // await energyBlock.setConsumerForEnergyBlock(eBlkId, buyer)

      console.log('buyer:', buyer.toString());

      // const eBlk = await energyBlock.getEnergyBlock(eBlkId)


      // expect(eBlk.consumer).to.equal(buyer)
      expect(eBlk.producer).to.equal(seller)
    });

    it('Should add new eBlk to all eBlks list', async () => {
      const sourceId1 = 'SolarPv101'
      const valueBN = web3.utils.toWei('1.23')
      const { eBlkId: eBlkId1 } = await addEnergyBlock(sourceId1, valueBN)
      const sourceId2 = 'TeslaModelX'
      const { eBlkId: eBlkId2 } = await addEnergyBlock(sourceId2, valueBN)

      const allEnergyBlocksLength = await energyBlock.allEnergyBlocksLength()
      expect(allEnergyBlocksLength.toNumber()).to.equal(5)

      const eBlk1 = await energyBlock.getEnergyBlockByIndex(3)

      expect(eBlk1.sourceId).to.equal(sourceId1)

      // const allEnergyBlockIds = await energyBlock.getAllEnergyBlockIds()
      // expect(allEnergyBlockIds[3]).to.equal(eBlkId1)
    });

  });

});