// SPDX-License-Identifier: MIT
pragma solidity >0.7.0;

contract EnergyCredit {
    //! TODO: Convert to a ERC-20/ERC-721/ERC-1155 token
    bool private _lock = false;
    mapping(address => uint256) public energyCredits;

    function addEnergyCredit() external payable {
        require(msg.value > 0, "No value sent");
        energyCredits[msg.sender] += msg.value;
    }

    function getEnergyCredit(address addr) public view returns (uint256) {
        return energyCredits[addr];
    }

    function withdrawEnergyCredit(uint256 value) external {
        require(energyCredits[msg.sender] >= value, "Not enough energyCredits");
        require(!_lock, "re-entrance");
        energyCredits[msg.sender] -= value;

        _lock = true;
        payable(msg.sender).transfer(value);
        _lock = false;
    }
}
