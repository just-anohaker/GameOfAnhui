"use strict";

app.route.get("/account/chain_balance", async function (req) {
    // TODO
    throw new Error("[Interface account] /account/chain_balance unimplemented.");
});

app.route.get("/account/game_balance", async function (req) {
    // TODO
    console.log("[Interface account] /account/game_balance ", req);
    // const found = app.model.Balance.findAll({
    //     condition: {
    //         address: a
    //     },
    //     fields: ["currency", "balance"]
    // });
    // return found;
    throw new Error("[Interface account] /account/game_balance unimplemented.");
});

app.route.get("/account/bettings", async function (req) {
    // TODO
    throw new Error("[Interface account] /account/bettings unimplemented.");
});

app.route.get("/account/informations", async function (req) {
    // TODO
    throw new Error("[Interface account] /account/informations unimplemented.");
});