// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title ModularToken
 * @dev ERC-20 token for Mod Cellular DePIN network
 * Rewards users for relaying messages, providing bandwidth, and mesh networking
 */
contract ModularToken {
    string public name = "Modular Token";
    string public symbol = "MODX";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => uint256) public reputationScore;
    mapping(address => uint256) public totalRelays;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event RelayReward(address indexed node, uint256 amount, uint256 packets);
    event ReputationUpdate(address indexed node, uint256 newScore);

    constructor() {
        totalSupply = 1000000000 * 10**18; // 1 billion tokens
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        require(to != address(0), "Invalid recipient");
        
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        require(to != address(0), "Invalid recipient");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Reward a node for relaying packets
     * Only callable by authorized relay coordinator (future implementation)
     */
    function rewardRelay(address node, uint256 amount, uint256 packets) public {
        require(node != address(0), "Invalid node");
        require(amount > 0, "Invalid amount");
        
        balanceOf[node] += amount;
        totalRelays[node] += packets;
        totalSupply += amount; // Mint new tokens as relay rewards
        
        emit RelayReward(node, amount, packets);
        emit Transfer(address(0), node, amount);
    }

    /**
     * @dev Update reputation score for a node
     */
    function updateReputation(address node, uint256 score) public {
        require(node != address(0), "Invalid node");
        
        reputationScore[node] = score;
        emit ReputationUpdate(node, score);
    }

    /**
     * @dev Get node statistics
     */
    function getNodeStats(address node) public view returns (
        uint256 balance,
        uint256 reputation,
        uint256 relays
    ) {
        return (
            balanceOf[node],
            reputationScore[node],
            totalRelays[node]
        );
    }
}
