"use strict";

const bignum = require("bignumber");

const BaseRule = require("./base_rule");
const { Rule4 } = require("./config");

class GameRule4 extends BaseRule {
    constructor() {
        super();
    }

    validate(point, amount) {
        if (typeof point !== "string" || typeof amount !== "string") {
            throw new Error("point and amount must be a string");
        }
        const values = [];
        for (let key in Rule4) {
            values.push(Rule4[key]);
        }
        if (!values.includes(point)) {
            throw new Error(`point value is invalid, value in ${JSON.stringify(values)}`);
        }

        try {
            let bamount = bignum(amount);
            if (bamount.lte("0")) {
                throw new Error("amount must more than zero");
            }
        } catch (error) {
            throw error;
        }
    }

    settle(periodId, point, amount, points) {
        void (periodId);

        const valids = [
            Rule4.Point12, Rule4.Point13, Rule4.Point14, Rule4.Point15, Rule4.Point16,
            Rule4.Point23, Rule4.Point24, Rule4.Point25, Rule4.Point26,
            Rule4.Point34, Rule4.Point35, Rule4.Point36,
            Rule4.Point45, Rule4.Point46,
            Rule4.Point56
        ];

        for (let i = 0; i < valids.length; i++) {
            const [p1, p2] = valids[i].split("");
            if (point === valids[i] && points.includes(p1) && points.includes(p2)) {
                return bignum(amount).mul(6);
            }
        }
        return bignum("0");
    }
}

module.exports = GameRule4;