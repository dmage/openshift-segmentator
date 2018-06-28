"use strict";

const rule = require("digdown/rule");

function init() {
    return rule.blocks(
        rule.pattern(/^In suite .* test case .* failed:$/, (ctx) => {
            return {
                begin: ctx.offset,
                name: ctx.line,
            };
        }),
        (ctx, state) => {
            if (/^[0-9][0-9][0-9][0-9]\/[0-9][0-9]\/[0-9][0-9] [0-9][0-9]:[0-9][0-9]:[0-9][0-9] /.test(ctx.line)) {
                return;
            }
            return state;
        },
        (ctx, state) => undefined,
        (ctx, state) => {
            return {
                offset: state.begin,
                length: ctx.offset - state.begin,
                metadata: {
                    type: "in_suite",
                    name: state.name,
                },
            };
        },
    );
}

module.exports = init;
