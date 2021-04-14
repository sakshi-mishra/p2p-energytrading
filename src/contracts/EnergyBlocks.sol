// SPDX-License-Identifier: MIT
pragma solidity >0.7.0;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";

enum EnergyBlockState {New, Traded, Completed, Complaint}
struct EnergyBlock {
    address producer;
    string sourceId;
    uint256 priceInWei;
    address consumer;
    EnergyBlockState state;
}

contract EnergyBlocks is Ownable {
    mapping(uint256 => EnergyBlock) public _energyBlocks;
    address private _orderContractAddress;
    uint256[] public _allEnergyBlockIds;
    event EnergyBlockAdded(
        uint256 indexed energyBlockId,
        EnergyBlock energyBlock
    );

    function setTradeContractAddress(address orderContract) public onlyOwner {
        _orderContractAddress = orderContract;
    }

    function addEnergyBlock(
        address producer,
        string memory sourceId,
        uint256 priceInWei
    ) external returns (uint256 energyBlockId) {
        uint256 id =
            uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, msg.sender, sourceId)
                )
            );

        EnergyBlock memory energyBlock =
            EnergyBlock(
                producer,
                sourceId,
                priceInWei,
                address(0x00),
                EnergyBlockState.New
            );
        _energyBlocks[id] = energyBlock;
        _allEnergyBlockIds.push(id);

        emit EnergyBlockAdded(id, energyBlock);
        return id;
    }

    function setConsumerForEnergyBlock(uint256 energyBlockId, address consumer)
        external
    {
        require(
            msg.sender == _orderContractAddress,
            "Can be only called by TradeContract"
        );

        EnergyBlock storage energyBlock = _energyBlocks[energyBlockId];
        if (energyBlock.producer != address(0x00)) {
            energyBlock.consumer = consumer;
            energyBlock.state = EnergyBlockState.Traded;
        }
    }

    function setEnergyBlockState(uint256 energyBlockId, EnergyBlockState state)
        external
    {
        require(
            msg.sender == _orderContractAddress,
            "Can be only called by TradeContract"
        );

        EnergyBlock storage energyBlock = _energyBlocks[energyBlockId];
        if (energyBlock.producer != address(0x00)) {
            energyBlock.state = state;
        }
    }

    function getEnergyBlock(uint256 id)
        external
        view
        returns (EnergyBlock memory energyBlock)
    {
        return _energyBlocks[id];
    }

    function allEnergyBlocksLength() external view returns (uint256) {
        return _allEnergyBlockIds.length;
    }

    function getAllEnergyBlockIds() external view returns (uint256[] memory) {
        return _allEnergyBlockIds;
    }

    function getEnergyBlockByIndex(uint256 index)
        external
        view
        returns (EnergyBlock memory energyBlock)
    {
        return _energyBlocks[_allEnergyBlockIds[index]];
    }
}
