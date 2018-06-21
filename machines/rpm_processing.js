"use strict";

const rule = require("digdown/rule");

function init() {
    return rule.blocks(
        rule.pattern(/^Processing files: /, (ctx) => {
            return {
                begin: ctx.offset,
                name: ctx.line,
            };
        }),
        (ctx, state) => {
            if (ctx.line.startsWith("Wrote: ")) {
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
                    type: "rpm_processing",
                    name: state.name,
                },
            }
        },
    );
}

module.exports = init;
