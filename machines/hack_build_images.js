"use strict";

const rule = require("digdown/rule");

function init() {
    return rule.blocks(
        rule.pattern("hack/build-images.sh", (ctx) => {
            return {
                begin: ctx.offset,
                line: ctx.line,
            };
        }),
        (ctx, state) => {
            if (/\[.+?\] /.test(ctx.line)) {
                return state;
            }
        },
        (ctx, state) => {
            return rule.pattern(/hack\/build-images\.sh exited with code ([0-9]+)/, (ctx) => {
                state.status = ctx.match[1] === "0" ? "success" : "failure";
                return state;
            })(ctx);
        },
        (ctx, state) => {
            return {
                offset: state.begin,
                length: ctx.offset - state.begin,
                metadata: {
                    type: "hack_build_images",
                    name: state.line,
                    status: state.status,
                },
            };
        },
    );
}

module.exports = init;
