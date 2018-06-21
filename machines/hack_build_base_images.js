"use strict";

const rule = require("digdown/rule");

function init() {
    return rule.blocks(
        rule.pattern(/\+ hack\/build-base-images.sh$/, (ctx) => {
            return {
                begin: ctx.offset,
                line: ctx.line,
            };
        }),
        (ctx, state) => {
            if (/^\[.+?\] /.test(ctx.line)) {
                return state;
            }
        },
        (ctx, state) => {
            return rule.pattern(/^hack\/build-base-images\.sh took/, (ctx) => {
                return state;
            })(ctx);
        },
        (ctx, state) => {
            return {
                offset: state.begin,
                length: ctx.offset - state.begin,
                metadata: {
                    type: "hack_build_base_images",
                    name: state.line,
                },
            };
        },
    );
}

module.exports = init;
