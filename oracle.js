var fetch = require('fetch')
var OracleContract = require('./build/contracts/CMCOracle.json') // 作ったContractの定義JSON
var contract = require('truffle-contract')

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

// Truffleの定義JSONからSmart Contractを取得
var oracleContract = contract(OracleContract)
oracleContract.setProvider(web3.currentProvider)

// Dirty hack for web3@1.0.0 support for localhost testrpc
// see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
if (typeof oracleContract.currentProvider.sendAsync !== "function") {
  oracleContract.currentProvider.sendAsync = function() {
    return oracleContract.currentProvider.send.apply(
      oracleContract.currentProvider, arguments
    );
  };
}

// web3 APIを利用して、自分のアカウントを取得
web3.eth.getAccounts((err, accounts) => {
  oracleContract.deployed()
  .then((oracleInstance) => {
    // SmartContractで指定の関数をWatch 
    oracleInstance.CallbackGetBTCCap()
    .watch((err, event) => {
      // データをfetchして、smart contract内の変数をupdate
      fetch.fetchUrl('https://api.coinmarketcap.com/v1/global/', (err, m, b) => {
        console.log(b.toString())
        const cmcJson = JSON.parse(b.toString())
        const btcMarketCap = parseInt(cmcJson.total_market_cap_usd)

        // チェーン上のデータを更新
        oracleInstance.setBTCCap(btcMarketCap, {from: accounts[0]})
      })
    })
  })
  .catch((err) => {
    console.log(err)
  })
})