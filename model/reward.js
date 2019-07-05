"use strict";

module.exports = {
    name: "rewards",
    fields: [
        {
            name: "periodId",
            type: "String",
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