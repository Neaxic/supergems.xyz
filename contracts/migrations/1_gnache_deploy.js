const CoinflipContract = artifacts.require("CoinflipContract");

module.exports = function (deployer) {
    deployer.deploy(CoinflipContract);
    // Constructor arguments migration
    // deployer.deploy(CoinflipContract, arg1, arg2, ...);
};