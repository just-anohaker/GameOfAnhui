"use strict";

const bignum = require("bignumber");

const BaseRule = require("./base_rule");

class GameRule4 extends BaseRule {
    constructor() {
        super();
    }

    settle(period, point, amount) {
        return bignum(amount);
    }
}

module.exports = GameRule4;