"use strict";

const rule = require("digdown/rule");

function init() {
    return rule.oneOf(
        rule.pattern(/^Executing\(%[a-z]+\): /, (ctx) => {
            const begin = ctx.offset;
            const name = ctx.line;
            return rule.oneOf(
                rule.pattern(/^\+ exit ([0-9]+)$/, (ctx) => {
                    const status = ctx.match[1] === "0" ? "success" : "failure";
                    return (ctx) => {
                        ctx.emit({
                            offset: begin,
                            length: ctx.offset - begin,
                            metadata: {
                                type: "rpm_executing",
                                name: name,
                                status: status,
                            },
                        });
                        return init()(ctx);
                    };
                }),
                rule.eof((ctx) => {
                    ctx.emit({
                        offset: begin,
                        length: ctx.offset - begin,
                        metadata: {
                            type: "rpm_executing",
                            name: name,
                        },
                    });
                    return init();
                }),
            );
        }),
    );
}

module.exports = init;
