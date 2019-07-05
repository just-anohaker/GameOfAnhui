"use strict";

module.exports = {
    name: "settlements",
    fields: [
        {
            name: "id",
            type: "String",
            length: 64,
            not_null: !0
        },
        {
            name: "result",
            type: "Number",
            not_null: !0
        },
        {
            name: "amount",
            type: "String",
            length: 50,
            not_null: !0,
        }
    ]
}