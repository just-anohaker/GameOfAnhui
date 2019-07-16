"use strict";

const config = require("../helpers/config");

app.route.get("/account/chain_balance", async function (req) {
    console.log("[interface account] get chain_balance query:", req.query);
    const resp = await global.PIFY(app.api.accounts.getBalance(req.query.address));
    console.log("[interface account] get chain_balance:", resp.balance);
    return { balance: resp.balance.toString() };
});

app.route.get("/account/game_balance", async function (req) {
    console.log("[interface account] get game_balance query:", req.query);
    const resp = app.balances.get(req.query.address, config.currency);
    console.log("[interface account] get game_balance:", resp.toString());
    return resp.toString();
});

app.route.get("/account/bettings", async function (req) {
    console.log("[interface account] get bettings query: ", req.query);
    // let senderId = req.query.address;
    // let offset = req.query.offset || 0;
    // let limit = req.query.limit || 100;
    // const resp = await app.model.GameBetting.findAll({
    //     fields: ["id"],
    //     condition: { senderId: senderId },
    //     sort: "timestamp"
    // });
    // TODO
    throw new Error("[Interface account] /account/bettings unimplemented.");
});

app.route.get("/account/informations", async function (req) {
    // TODO
    throw new Error("[Interface account] /account/informations unimplemented.");
});