// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./libs/ERC721A.sol";

contract FruitVoting {
    address immutable _trustedForwarder;
    // maps fruit names to vote counts
    mapping(string => uint) private voting;

    event Vote(address, string);

    constructor(address trustedForwarder) {
        _trustedForwarder = trustedForwarder;
    }

    function isTrustedForwarder(address forwarder) public view returns (bool) {
        // contract can only called from this forwarder contract
        return forwarder == _trustedForwarder;
    }

    function msgSender() internal view returns (address payable signer) {
        // recover sender address who sign the meta transaction, not the forwarder contract
        signer = payable(msg.sender);
        if (msg.data.length >= 20 && isTrustedForwarder(signer)) {
            assembly {
                signer := shr(96, calldataload(sub(calldatasize(), 20)))
            }
            return signer;
        } else {
            revert("invalid call");
        }
    }

    function voteForFruit(string memory fruit) external {
        voting[fruit] = voting[fruit] + 1;
        emit Vote(msgSender(), fruit);
    }

    function getVotesForFruit(string memory fruit) public view returns (uint) {
        return voting[fruit];
    }
}
