pragma solidity ^0.4.17;

contract CMCOracle {
    // コントラクトの所有者
    address public owner;

    // BTCの時価総額、初期値は0
    uint public btcMarketCap;

    // コールバック関数
    event CallbackGetBTCCap(address from);

    function CMCOracle() public {
        owner = msg.sender;
    }

    function updateBTCCap() public {
        // Oracleに情報の更新を依頼
        CallbackGetBTCCap(msg.sender);
    }

    function setBTCCap(uint cap) public {
        // メッセージ送信者がownerなのか確認。
        require(msg.sender == owner);
        // 時価総額を更新
        btcMarketCap = cap;
    }

    function getBTCCap() constant public returns (uint) {
        return btcMarketCap;
    }
}