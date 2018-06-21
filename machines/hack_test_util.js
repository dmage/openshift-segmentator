"use strict";

const rule = require("digdown/rule");

function init() {
    return rule.blocks(
        rule.pattern("hack/test-util.sh", (ctx) => {
            return {
                begin: ctx.offset,
                line: ctx.line,
            };
        }),
        (ctx, state) => {
            if (!ctx.line.startsWith("hack/")) {
                return state;
            }
        },
        (ctx, state) => {
            if (ctx.line === "compression: ok") {
                return state;
            }
        },
        (ctx, state) => {
            return {
                offset: state.begin,
                length: ctx.offset - state.begin,
                metadata: {
                    type: "hack_test_util",
                    name: state.line,
                },
            };
        },
    );
}

module.exports = init;
