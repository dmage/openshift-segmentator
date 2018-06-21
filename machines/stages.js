"use strict";

const rule = require("digdown/rule");

function init() {
    return rule.blocks(
        rule.pattern(/^########## STARTING STAGE: (.*) ##########$/, (ctx) => {
            return {
                begin: ctx.offset,
                name: ctx.match[1],
            };
        }),
        (ctx, state) => state,
        (ctx, state) => {
            return rule.pattern(/^########## FINISHED STAGE: (.*) ##########$/, (ctx) => {
                state.name = ctx.match[1];
                if (state.name.startsWith("SUCCESS:")) {
                    state.status = "success";
                } else if (state.name.startsWith("FAILURE:")) {
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
                    type: "stage",
                    name: state.name,
                    status: state.status,
                },
            };
        },
    );
}

module.exports = init;
