"use strict";

module.exports = {
    name: "bettings",
    fields: [
        {
            name: "id",
            type: "String",
            not_null: !0,
            index: !0,
            primary_key: !0,
        },
        {
            name: "periodId",
            type: "String",
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
            name: "type",
            type: "String",
            not_null: !0
        },
        {
            name: "args",
            type: "String",
            not_null: !0
        }
    ]
};