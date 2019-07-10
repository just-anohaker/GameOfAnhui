"use strict";

const ETMJS = require("etm-js");

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
    console.log("[interface account] get game_balance:", balance.toString());
    return resp.toString();
});

app.route.get("/account/bettings", async function (req) {
    // TODO
    throw new Error("[Interface account] /account/bettings unimplemented.");
});

app.route.get("/account/informations", async function (req) {
    // TODO
    throw new Error("[Interface account] /account/informations unimplemented.");
});

app.route.post("/account/recharge", async function (req) {
    console.log("============== [interface account] /account/recharge:", req);
    const query = req.query;
    const tr = ETMJS.transfer.createInTransfer(app.meta.transactionId, "ETM",
        query.amount, query.secret, query.secondSecret);
    console.log("[interface account] /account/recharge", tr);
    app.api.transport.message("transaction", tr, (...args) => {
        console.log("================ dapp transaction:", ...args);
    });
});