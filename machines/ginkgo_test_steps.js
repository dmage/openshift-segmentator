"use strict";

const rule = require("digdown/rule");

function init() {
    return rule.blocks(
        rule.pattern(
            /^(?:[A-Z][a-z][a-z] [ 0-9][0-9] [0-9][0-9]:[0-9][0-9]:[0-9][0-9]\.[0-9][0-9][0-9]: INFO:|STEP: )/,
            (ctx) => {
                return {
                    begin: ctx.offset,
                    name: rule.truncateName(ctx.line),
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
