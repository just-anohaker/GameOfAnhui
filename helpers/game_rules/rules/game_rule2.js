"use strict";

const bignum = require("bignumber");

const BaseRule = require("./base_rule");
const { Rule2 } = require("./config");

class GameRule2 extends BaseRule {
    constructor() {
        super();
    }

    validate(point, amount) {
        if (typeof point !== "string" || typeof amount !== "string") {
            throw new Error("point and amount must be a string");
        }
        const values = [];
        for (let key in Rule2) {
            values.push(Rule2[key]);
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

        const succ = (points[0] === points[1] && points[0] === points[2]);
        if (succ) {
            if (point === Rule2.PointAll) {
                return bignum(amount).mul(25);
            } else if (point === points.join("")) {
                return bignum(amount).mul(151);
            }
        }

        return bignum("0");
    }
}

module.exports = GameRule2;