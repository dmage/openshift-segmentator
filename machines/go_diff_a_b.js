"use strict";

const rule = require("digdown/rule");

function lookForB(beginA, lineA) {
    return rule.oneOf(
        rule.pattern(/^B: /, (ctx) => {
            const beginB = ctx.offset, lineB = ctx.line;
            return rule.oneOf(
                rule.pattern(/^$/, (ctx) => {
                    ctx.emit({
                        offset: beginA,
                        length: beginB - beginA,
                        metadata: {
                            type: "go_diff",
                            name: rule.truncateName(lineA),
                        },
                    });
                    ctx.emit({
                        offset: beginB,
                        length: ctx.offset - beginB,
                        metadata: {
                            type: "go_diff",
                            name: rule.truncateName(lineB),
                        },
                    });
                    return init();
                }),
            );
        }),
        (ctx) => init()(ctx),
    );
}

function init() {
    return rule.oneOf(
        rule.pattern(/^A: /, (ctx) => {
            const beginA = ctx.offset, lineA = ctx.line;
            return rule.oneOf(
                rule.pattern(/^$/, (ctx) => {
                    return rule.oneOf(
                        (ctx) => {
                            if (ctx.line != "") {
                                return lookForB(beginA, lineA)(ctx);
                            }
                        },
                    );
                }),
            );
        }),
    );
}

module.exports = init;
