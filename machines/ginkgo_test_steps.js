"use strict";

const rule = require("digdown/rule");

function init() {
    return rule.blocks(
        rule.pattern(
            /^(?:[A-Z][a-z][a-z] [ 0-9][0-9] [0-9][0-9]:[0-9][0-9]:[0-9][0-9]\.[0-9][0-9][0-9]: INFO:|STEP: )/,
            (ctx) => {
                let name = ctx.line;
                if (ctx.line.length > 255) {
                    name = ctx.line.slice(0, 255-3) + "...";
                }
                return {
                    begin: ctx.offset,
                    name: name,
                };
            },
        ),
        (ctx, state) => state,
        (ctx, state) => undefined,
        (ctx, state) => {
            return {
                offset: state.begin,
                length: ctx.offset - state.begin,
                metadata: {
                    type: "ginkgo_test_step",
                    name: state.name,
                },
            };
        },
    );
}

module.exports = init;
