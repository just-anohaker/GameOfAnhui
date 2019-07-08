"use strict";

module.exports = {
    name: "game_rewards",
    fields: [
        {
            name: "periodId",
            type: "String",
            length: 32,
            not_null: !0,
            index: !0
        },
        {
            name: "amount",
            type: "String",
            length: 50,
            not_null: !0
        }
    ]
};