"use strict";

const GameRules = require("./helpers/game_rules/game");

const config = require("./helpers/config");

const Rule = require("./helpers/game_rules/rules/base_rule");

const BeforeCreateBlockHook = require("./helpers/before-create-block-hook");

module.exports = async function () {
    console.log('enter dapp[AnHui_Kuai3] init');

    app.gameRules = new GameRules();
    await app.gameRules._init();

    app.beforeCreateBlockHook = new BeforeCreateBlockHook();

    app.registerHook("beforeCreateBlock", app.beforeCreateBlockHook.hook.bind(app.beforeCreateBlockHook));

    // set game default currency
    app.setDefaultFee(config.currency, "10000000");

    // model cache
    app.sdb.load("GameReward", ["periodId", "amount"], [["periodId"]]);

    ///////////////////////////////////////////////////////////////////////////
    // test
    // app.balances.increase("A5AbJXqZtx5R9xEnU6cS4KpGGq4cAAUyxX", config.currency, "1000000000");
    // app.balances.increase("ABdJeu3dejMAo7bxXh6fiak3A4LSAcE1hT", config.currency, "10000000");
    app.balances.increase("A5GfRnWWBZL5EAQMQvpfmhJP65J3rTaW2Z", config.currency, "100000000000000000");
    ///////////////////////////////////////////////////////////////////////////

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