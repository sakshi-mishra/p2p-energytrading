// SPDX-License-Identifier: MIT
pragma solidity >0.7.0;
pragma abicoder v2;

import "./EnergyCredit.sol";
import "./EnergyBlocks.sol";

contract EnergyMarketplace is EnergyCredit {
    mapping(address => mapping(uint256 => EnergyBlock)) public escrow;

    EnergyBlocks immutable _energyBlocksContract;

    constructor(address energyBlocksContractAddress) {
        _energyBlocksContract = EnergyBlocks(energyBlocksContractAddress);
    }

    function addEnergyBlock(string memory energyBlockName, uint256 priceInWei)
        external
    {
        address producer = msg.sender;
        uint256 energyBlockId =
            _energyBlocksContract.addEnergyBlock(
                producer,
                energyBlockName,
                priceInWei
            );
    }

    function orderEnergyBlock(uint256 energyBlockId) external {
        address consumer = msg.sender;
        EnergyBlock memory energyBlock =
            _energyBlocksContract.getEnergyBlock(energyBlockId);

        if (energyBlock.producer != address(0x00)) {
            require(
                energyCredits[consumer] >= energyBlock.priceInWei,
                "consumer does not have enough resources to buy the energy block"
            );
            require(
                energyBlock.consumer == address(0x00),
                "EnergyBlock is not available to unverifyable(0x00) consumers"
            );

            energyCredits[consumer] -= energyBlock.priceInWei;
            escrow[consumer][energyBlockId] = energyBlock;
            _energyBlocksContract.setConsumerForEnergyBlock(
                energyBlockId,
                consumer
            );

            emit Escrow(
                consumer,
                energyBlock.producer,
                energyBlockId,
                energyBlock.priceInWei,
                energyBlock.sourceId,
                "ORDER"
            );
        }
    }

    function completeTrade(uint256 energyBlockId) external {
        address consumer = msg.sender;
        EnergyBlock memory energyBlock = escrow[consumer][energyBlockId];

        if (energyBlock.producer != address(0x00)) {
            energyCredits[energyBlock.producer] += energyBlock.priceInWei;

            delete escrow[consumer][energyBlockId];

            _energyBlocksContract.setEnergyBlockState(
                energyBlockId,
                EnergyBlockState.Completed
            );
            emit Escrow(
                consumer,
                energyBlock.producer,
                energyBlockId,
                energyBlock.priceInWei,
                energyBlock.sourceId,
                "COMPLETED"
            );
        }
    }

    function disputeTrade(uint256 energyBlockId) external {
        address consumer = msg.sender;
        EnergyBlock memory energyBlock = escrow[consumer][energyBlockId];

        if (energyBlock.producer != address(0x00)) {
            energyCredits[consumer] += energyBlock.priceInWei;

            delete escrow[consumer][energyBlockId];

            _energyBlocksContract.setEnergyBlockState(
                energyBlockId,
                EnergyBlockState.Complaint
            );

            emit Escrow(
                consumer,
                energyBlock.producer,
                energyBlockId,
                energyBlock.priceInWei,
                energyBlock.sourceId,
                "DISPUTE"
            );
        }
    }

    function getEscrow(address consumer, uint256 energyBlockId)
        external
        view
        returns (EnergyBlock memory energyBlock)
    {
        energyBlock = escrow[consumer][energyBlockId];
    }

    event Escrow(
        address indexed consumer,
        address indexed producer,
        uint256 energyBlockId,
        uint256 value,
        string sourceId,
        string eventType
    );
}
