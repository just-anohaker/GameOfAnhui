"use strict";

const bignum = require("bignumber");

const BaseRule = require("./base_rule");

class GameRule3 extends BaseRule {
    constructor() {
        super();
    }

    settle(period, point, amount) {
        return bignum(amount);
    }
}

module.exports = GameRule3;