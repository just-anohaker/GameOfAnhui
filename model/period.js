"use strict";

module.exports = {
    name: "game_periods",
    fields: [
        {
            name: "periodId",
            type: "String",
            length: 32,
            not_null: !0,
            unique: !0,
            primary_key: !0,
        },
        {
            name: "begin_tid",
            type: "String",
            length: 64,
            unique: !0
        },
        {
            name: "mothball_tid",
            type: "String",
            length: 64,
            unique: !0
        },
        {
            name: "end_tid",
            type: "String",
            length: 64,
            unique: !0
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