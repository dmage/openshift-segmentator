"use strict";

const rule = require("digdown/rule");

function init() {
    return rule.blocks(
        rule.pattern(/^\++ /, (ctx) => {
            if (/^\+\+ [A-Z][a-z]+ /.test(ctx.line)) {
                return;
            }
            return {
                begin: ctx.offset,
                name: rule.truncateName(ctx.line),
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
