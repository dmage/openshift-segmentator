"use strict";

const rule = require("digdown/rule");

const re = /^\[([^\]]*)\] /;

function init() {
    return rule.oneOf(
        rule.pattern(re, (ctx) => {
            const begin = ctx.offset,
                name = ctx.match[1],
                prefix = "[" + name + "] ";
            let n = 1;
            return rule.oneOf(
                (ctx) => {
                    if (ctx.line.startsWith(prefix)) {
                        n++;
                    } else {
                        if (n >= 4) {
                            ctx.emit({
                                offset: begin,
                                length: ctx.offset - begin,
                                metadata: {
                                    type: "square_brackets",
                                    name: name,
                                },
                            });
                        }
                        return init()(ctx);
                    }
                },
            );
        }),
    );
}

module.exports = init;
