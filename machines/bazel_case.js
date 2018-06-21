"use strict";

const rule = require("digdown/rule");

function init() {
    return rule.blocks(
        rule.pattern(/\+\+\+ Running case: (.*)/, (ctx) => {
            return {
                begin: ctx.offset,
                name: ctx.line,
            };
        }),
        (ctx, state) => state,
        (ctx, state) => {
            return rule.pattern(/\+\+\+ exit code: (.*)$/, (ctx) => {
                if (ctx.match[1] === "0") {
                    state.status = "success";
                } else {
                    state.status = "failure";
                }
                return state;
            })(ctx);
        },
        (ctx, state) => {
            return {
                offset: state.begin,
                length: ctx.offset - state.begin,
                metadata: {
                    type: "bazel_case",
                    name: state.name,
                    status: state.status,
                },
            };
        },
    );
}

module.exports = init;
