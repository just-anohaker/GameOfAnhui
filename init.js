module.exports = async function () {
    console.log('enter dapp[AnHui_Kuai3] init')

    app.registerContract(1000, "accounts.deposit");
    app.registerContract(1001, "accounts.withdrawal");

    app.registerContract(1100, "game.start_period");
    app.registerContract(1101, "game.mothball_period");
    app.registerContract(1102, "game.end_period");
    app.registerContract(1103, "game.betting")

    app.events.on('newBlock', (block) => {
        console.log('new block received', block.height)
    })
}