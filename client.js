var OracleContract = require('./build/contracts/CMCOracle.json')
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
    // プロミス
    const oraclePromises = [
      oracleInstance.getBTCCap(),  // 現在のBTCの時価総額を取得
      oracleInstance.updateBTCCap({from: accounts[0]})  // Oracleに情報の更新を依頼
    ]

    // プロミスを実行
    Promise.all(oraclePromises)
    .then((result) => {
      console.log('BTC時価総額: ' + result[0])
      console.log('Oracleに情報の更新を要求しています.....')
    })
    .catch((err) => {
      console.log(err)
    })
  })
  .catch((err) => {
    console.log(err)
  })
})