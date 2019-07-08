"use strict";

const GameRules = require("./helpers/game_rules/game");

const config = require("./helpers/config");

const Rule = require("./helpers/game_rules/rules/base_rule");

module.exports = async function () {
    console.log('enter dapp[AnHui_Kuai3] init');

    app.gameRules = new GameRules();
    await app.gameRules._init();

    // set game default currency
    app.setDefaultFee(config.currency, "10000000");

    // contract account
    app.registerFee(1000, 0);
    app.registerContract(1000, "account.deposit");
    app.registerFee(1001, 0);
    app.registerContract(1001, "account.withdrawal");

    // contract game
    app.registerFee(1100, 0);
    app.registerContract(1100, "game.start_period");
    app.registerFee(1101, 0);
    app.registerContract(1101, "game.mothball_period");
    app.registerFee(1102, 0);
    app.registerContract(1102, "game.end_period");
    app.registerFee(1103, 0);
    app.registerContract(1103, "game.betting")

    console.log("dapp[AnHui_Kuai3] inited");
    // 
    app.events.on('newBlock', (block) => {
        console.log('new block received', block.height)
    })
}