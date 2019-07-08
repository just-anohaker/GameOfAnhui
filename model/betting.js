"use strict";

module.exports = {
    name: "game_bettings",
    fields: [
        {
            name: "tid",
            type: "String",
            length: 64,
            not_null: !0,
            index: !0,
            unique: !0,
            primary_key: !0,
        },
        {
            name: "periodId",
            type: "String",
            length: 32,
            not_null: !0,
            index: !0
        },
        {
            name: "address",
            type: "String",
            length: 50,
            not_null: !0
        },
        {
            name: "betOrders",
            type: "String",
            length: 20480,
            not_null: !0
        }
    ]
};