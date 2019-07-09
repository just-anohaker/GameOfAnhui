"use strict";

const bignum = require("bignumber");

const BaseRule = require("./base_rule");
const { Rule5 } = require("./config");

class GameRule5 extends BaseRule {
    constructor() {
        super();
    }

    validate(point, amount) {
        if (typeof point !== "string" || typeof amount !== "string") {
            throw new Error("point and amount must be a string");
        }
        const values = [];
        for (let key in Rule5) {
            values.push(Rule5[key]);
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
            Rule5.Point11, Rule5.Point22, Rule5.Point33,
            Rule5.Point44, Rule5.Point55, Rule5.Point66
        ];

        const sortedPoints = points.sort();
        const sortedPointsStr = sortedPoints.join("");

        for (let i = 0; i < valids.length; i++) {
            if (point === valids[i] && sortedPointsStr.includes(valids[i])) {
                return bignum(amount).mul(9);
            }
        }

        return bignum("0");
    }
}

module.exports = GameRule5;