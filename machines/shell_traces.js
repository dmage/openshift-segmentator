"use strict";

const rule = require("digdown/rule");

function init() {
    return rule.blocks(
        rule.pattern(/^\++ /, (ctx) => {
            if (ctx.line.startsWith("++ Building")) {
                return;
            }
            return {
                begin: ctx.offset,
                name: ctx.line,
            };
        }),
        (ctx, state) => state,
        (ctx, state) => undefined,
        (ctx, state) => {
            return {
                offset: state.begin,
                length: ctx.offset - state.begin,
                metadata: {
                    type: "shell_trace",
                    name: state.name,
                },
            };
        },
    );
}

module.exports = init;
