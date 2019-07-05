module.exports = async function () {
    console.log('enter dapp[AnHui_Kuai3] init')

    // contract account
    app.registerFee(1000, 0);
    app.registerContract(1000, "accounts.deposit");
    app.registerFee(1001, 0);
    app.registerContract(1001, "accounts.withdrawal");

    // contract game
    app.registerFee(1100, 0);
    app.registerContract(1100, "game.start_period");
    app.registerFee(1101, 0);
    app.registerContract(1101, "game.mothball_period");
    app.registerFee(1102, 0);
    app.registerContract(1102, "game.end_period");
    app.registerFee(1103, 0);
    app.registerContract(1103, "game.betting")

    // 
    app.events.on('newBlock', (block) => {
        console.log('new block received', block.height)
    })
}