"use strict";

class Rule {
    constructor() {

    }

    validate(point, amount) {
        void (point);
        void (amount);

        throw new Error("implemented by subclass");
    }

    settle(periodId, point, amount, points) {
        void (periodId);
        void (point);
        void (amount);
        void (points);
        // TODO
        throw new Error("implemented by subclass");
    }
}

module.exports = Rule;