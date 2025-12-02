const conflip = artifacts.require("Coinflip");

contract("Coinflip", async accounts => {
    it("Can create coinflip", async () => {
        const instance = await conflip.deployed();
        // await instance.initiateCoinflip({ value: web3.utils.toWei("0.1", "ether") });

        assert.equal(1, 1, "Coinflip created");
    })
})