"use strict";

const config = require("../helpers/config");

const { splitPeriodId, parseOffsetAndLimit } = require("../helpers/utils");

const Q_BETTING_ALL = "0", Q_BETTING_UNEND = "1", Q_BETTING_WIN = "2", Q_BETTING_LOSE = "3";

const Q_REPORT_LATEAST = "0", Q_REPORT_CURRENT_WEEK = "1", Q_REPORT_LAST_WEEK = "2";

const ONE_DAY_TIME = 24 * 60 * 60 * 1000;

function getDateTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = date.getDate();

    return `${year}${month + 1}${days}`;
}

function getlatest7days() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const days = now.getDate();

    const start = (new Date(year, month, days, 0, 0, 0, 0)).getTime();
    const result = [];
    for (let i = 0; i < 7; i++) {
        result.push(getDateTime(start - i * ONE_DAY_TIME));
    }
    return result;
}

function getcurrentweek() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const days = now.getDate();
    const day = now.getDay();

    const start = (new Date(year, month, days, 0, 0, 0, 0)).getTime();
    const result = [];
    for (let i = 0; i <= day; i++) {
        result.push(getDateTime(start - i * ONE_DAY_TIME));
    }
    return result;
}

function getlastweek() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const days = now.getDate();
    const day = now.getDay();

    const start = (new Date(year, month, days, 0, 0, 0, 0)).getTime();
    const newstart = start - (day + 1) * ONE_DAY_TIME;
    const result = [];
    for (let i = 0; i < 7; i++) {
        result.push(getDateTime(start - i * ONE_DAY_TIME));
    }
    return result;
}

app.route.get("/account/chain_balance", async function (req) {
    console.log("[interface account] /account/chain_balance:", req.query);
    const resp = await global.PIFY(app.api.accounts.getBalance)(req.query.address);
    console.log("[interface account] get chain_balance:", resp.balance);
    return { balance: resp.balance.toString() };
});

app.route.get("/account/game_balance", async function (req) {
    console.log("[interface account] /account/game_balance:", req.query);
    const resp = app.balances.get(req.query.address, config.currency);
    console.log("[interface account] get game_balance:", resp.toString());
    return { balance: resp.toString() };
});

app.route.get("/account/bettings", async function (req) {
    console.log("[interface account] /account/bettings", req.query);
    const body = req.query;
    const address = body.address;
    const cond = String(body.cond || Q_BETTING_ALL);     // 0: all, 1: 未开奖, 2: 已中奖, 3: 未中奖
    if (![Q_BETTING_ALL, Q_BETTING_UNEND, Q_BETTING_WIN, Q_BETTING_LOSE].includes(cond.trim())) {
        throw new Error("cond must in ['0', '1', '2', '3']");
    }
    let [offset, limit] = parseOffsetAndLimit(body.offset || "0", body.limit || "100", 0, 100);
    if (offset >= limit) offset = 0;

    // 查询指定地址的所有下注记录
    const allBets = await app.model.GameBetting.findAll({
        fields: ["tid", "timestamp", "periodId", "address", "orders"],
        condition: { address },
        sort: "timestamp"
    });
    allBets.forEach(val => {
        try {
            val.orders = JSON.parse(val.orders);
        } catch (e) {
            val.orders = {};
        }
    });

    const result = [];
    const sCond = cond.trim();
    if (sCond === Q_BETTING_ALL) {
        // 直接返回所有的下注记录
        allBets.forEach(val => result.push(val));
    } else {
        const availableTids = allBets.map(val => val.tid);
        // 查询已获取的所有的下注记录对应的结算记录
        const allSettlement = await app.model.GameSettlement.findAll({
            fields: ["tid", "result", "amount"],
            condition: { tid: { $in: availableTids } }
        });
        const availableSettleTid = allSettlement.map(val => val.tid);
        const winOrLoseMap = new Map();
        allSettlement.forEach(val => {
            winOrLoseMap.set(val.tid, val.result);
        });

        if (sCond === Q_BETTING_UNEND) {
            allBets.forEach(val => {
                if (!availableSettleTid.includes(val.tid)) {
                    result.push(val);
                }
            });
        } else if (sCond === Q_BETTING_WIN) {
            allBets.forEach(val => {
                if (availableSettleTid.includes(val.tid) && winOrLoseMap.get(val.tid) === 1) {
                    result.push(val);
                }
            });
        } else if (sCond === Q_BETTING_LOSE) {
            allBets.forEach(val => {
                if (availableSettleTid.includes(val.tid) && winOrLoseMap.get(val.tid) === 0) {
                    result.push(val);
                }
            });
        }
    }

    const resp = result.slice(offset, offset + limit);
    return { result: resp, count: result.length };
});

app.route.get("/account/crystal", async function (req) {
    console.log("[interface account] /account/crystal:", req.query);
    const body = req.query;
    const address = body.address;
    const cond = String(body.cond || Q_REPORT_LATEAST);
    if (![Q_REPORT_LATEAST, Q_REPORT_CURRENT_WEEK, Q_REPORT_LAST_WEEK].includes(cond.trim())) {
        throw new Error("cond must in ['0', '1', '2']");
    }
    const likePeriodIds = [];
    let condResult = [];
    const sCond = cond.trim();
    if (sCond === Q_REPORT_LATEAST) {
        condResult = getlatest7days();
    } else if (sCond === Q_REPORT_CURRENT_WEEK) {
        condResult = getcurrentweek();
    } else if (sCond === Q_REPORT_LAST_WEEK) {
        condResult = getlastweek();
    }
    condResult.forEach(val => likePeriodIds.push(val + "%"));

    const allBettings = await app.model.GameBetting.findAll({
        fields: ["tid", "periodId"],
        // condition: { senderId: address, periodId: { $in: likePeriodIds } },
        condition: {
            $and: [{
                address
            }, {
                $or: likePeriodIds.map(val => {
                    return { periodId: { $like: val } }
                })
            }]
        },
        sort: "timestamp"
    });
    const availableTids = allBettings.map(val => val.tid);
    const periodAndTidMap = new Map();
    allBettings.forEach(val => periodAndTidMap.set(val.tid, val.periodId));

    const comb = {};
    const allSettlement = await app.model.GameSettlement.findAll({
        // fields: ["tid", "result", "bet_amount", "amount"],
        fields: ["tid", "result", "amount"],
        condition: { tid: { $in: availableTids } }
    });
    allSettlement.forEach(val => {
        const periodId = periodAndTidMap.get(val.tid);
        const { year, month, day } = splitPeriodId(periodId);
        const datetime = `${year}${month}${day}`;
        const result = comb[datetime] || { datetime, bet_amount: "0", settlement: "0" };
        // TODO
        // result.bet_amount = bignum(result.bet_amount).plus(val.bet_amount);
        result.settlement = bignum(result.settlement).plus(val.amount);

        comb[datetime] = result;
    });
    const result = [];
    for (let key in comb) {
        result.push(comb[key]);
    }
    result.sort((a, b) => a > b ? -1 : a == b ? 0 : 1);
    return { result };
});