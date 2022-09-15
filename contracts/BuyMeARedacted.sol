//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// Example deployed to Goerli: 0xDBa03676a2fBb6711CB652beF5B7416A53c1421D

contract BuyMeARedacted {
    // Event to emit when a Memo is created.
    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message,
        string item
    );
    
    // Memo struct.
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
        string item;
    }
    
    // Address of contract deployer. Marked payable so that
    // we can withdraw to this address later.
    address payable owner;

    // List of all memos received from Redacted purchases.
    Memo[] memos;

    constructor() {
        // Store the address of the deployer as a payable address.
        // When we withdraw funds, we'll withdraw here.
        owner = payable(msg.sender);
    }

    /**
     * @dev fetches all stored memos
     */
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }

    /**
     * @dev buy a Redacted for owner (sends an ETH tip and leaves a memo)
     * @param _name name of the Redacted purchaser
     * @param _message a nice message from the purchaser
     * @param _item nice message from the purchaser
     */
    function buyRedacted(string memory _name, string memory _message, string memory _item) public payable {
        // Must accept more than 0 ETH for a Redacted.
        require(msg.value > 0, "can't buy Redacted for free!");

        // Add the memo to storage!
        memos.push(Memo(
            msg.sender,
            block.timestamp,
            _name,
            _message,
            _item
        ));

        // Emit a NewMemo event with details about the memo.
        emit NewMemo(
            msg.sender,
            block.timestamp,
            _name,
            _message,
            _item
        );
    }

    /**
     * @dev send the entire balance stored in this contract to the owner
     */
    function withdrawTips() public {
        require(owner.send(address(this).balance));
    }
}
