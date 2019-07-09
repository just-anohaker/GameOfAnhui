"use strict";

const bignum = require("bignumber");

const BaseRule = require("./base_rule");
const { Rule1 } = require("./config");

class GameRule1 extends BaseRule {
    constructor() {
        super();
    }

    validate(point, amount) {
        if (typeof point !== "string" || typeof amount !== "string") {
            throw new Error("point and amount must be a string");
        }
        const values = [];
        for (let key in Rule1) {
            values.push(Rule1[key]);
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

        if (point === Rule1.Point1 ||
            point === Rule1.Point2 ||
            point === Rule1.Point3 ||
            point === Rule1.Point4 ||
            point === Rule1.Point5 ||
            point === Rule1.Point6) {
            let count = 0;
            points.forEach(p => {
                count = p === point ? count + 1 : count;
            });
            if (count === 1) {
                return bignum(amount).mul(2);
            } else if (count === 2) {
                return bignum(amount).mul(3);
            } else if (count === 3) {
                return bignum(amount).mul(4);
            }
        } else if (point === Rule1.PointSmall ||
            point === Rule1.PointBig) {
            let sum = 0;
            points.forEach(p => {
                sum += Number(p);
            });
            if ((sum >= 4 && sum <= 10) || (sum >= 11 && sum <= 17)) {
                return bignum(amount).mul(2);
            }
        }

        return bignum("0");
    }
}

module.exports = GameRule1;