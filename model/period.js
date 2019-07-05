"use strict";

module.exports = {
    name: "periods",
    fields: [
        {
            name: "id",
            type: "String",
            length: 64,
            not_null: !0,
            primary_key: !0
        },
        {
            name: "periodId",
            type: "String",
            length: 32,
            not_null: !0,
            index: !0
        },
        {
            name: "status",
            type: "Number",
            not_null: !0
        },
        {
            name: "point_sequences",
            type: "String",
            length: 256
        }
    ]
};