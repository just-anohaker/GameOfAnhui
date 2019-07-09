"use strict";

class Rule {
    constructor() {

    }

    settle(periodId, point, amount) {
        // TODO
        throw new Error("implemented by subclass");
    }
}

module.exports = Rule;