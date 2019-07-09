"use strict";

const bignum = require("bignumber");

const BaseRule = require("./base_rule");
const { Rule3 } = require("./config");

class GameRule3 extends BaseRule {
    constructor() {
        super();
    }

    validate(point, amount) {
        if (typeof point !== "string" || typeof amount !== "string") {
            throw new Error("point and amount must be a string");
        }
        const values = [];
        for (let key in Rule3) {
            values.push(Rule3[key]);
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

        let sum = 0;
        points.forEach(p => {
            sum += Number(p);
        });
        const sumStr = sum.toString();
        if (point === sumStr) {
            if (sumStr === Rule3.Point4 || sumStr === Rule3.Point17) {
                return bignum(amount).mul(51);
            } else if (sumStr === Rule3.Point5 || sumStr === Rule3.Point16) {
                return bignum(amount).mul(19);
            } else if (sumStr === Rule3.Point6 || sumStr === Rule3.Point15) {
                return bignum(amount).mul(15);
            } else if (sumStr === Rule3.Point7 || sumStr === Rule3.Point14) {
                return bignum(amount).mul(13);
            } else if (sumStr === Rule3.Point8 || sumStr === Rule3.Point13) {
                return bignum(amount).mul(9);
            } else if (sumStr === Rule3.Point9 || sumStr === Rule3.Point10 ||
                sumStr === Rule3.Point11 || sumStr === Rule3.Point12) {
                return bignum(amount).mul(7);
            }
        }
        return bignum("0");
    }
}

module.exports = GameRule3;