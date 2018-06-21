"use strict";

const rule = require("digdown/rule");

function init() {
    return (ctx) => {
        let match = /^((?:    )*)--- /.exec(ctx.line);
        if (match) {
            return main(match[1]);
        }
        return rule.oneOf();
    };
}

function main(prefix) {
    return rule.blocks(
        (ctx) => {
            if (ctx.line.startsWith(prefix + "\t") && !ctx.line.startsWith(prefix + "\t\t")) {
                return {
                    begin: ctx.offset,
                    line: ctx.line,
                };
            }
        },
        (ctx, state) => {
            if (ctx.line.startsWith(prefix + "\t\t")) {
                return state;
            }
        },
        (ctx, state) => undefined,
        (ctx, state) => {
            return {
                offset: state.begin,
                length: ctx.offset - state.begin,
                metadata: {
                    type: "go_test_result_message",
                    name: state.line,
                },
            };
        },
    );
}

module.exports = init;
