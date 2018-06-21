"use strict";

const rule = require("digdown/rule");

function init() {
    return (ctx) => main();
}

function main() {
    return rule.oneOf(
        rule.pattern(/^((?:    )*)(--- (PASS|FAIL): .*)/, (ctx) => {
            const prefix = new RegExp("^" + ctx.match[1] + "(?:\t|    )");
            const begin = ctx.offset;
            const name = ctx.match[2];
            const status = (ctx.match[3] === "PASS" ? "success" : "failure");
            return rule.oneOf(
                (ctx) => {
                    if (!prefix.test(ctx.line)) {
                        ctx.emit({
                            offset: begin,
                            length: ctx.offset - begin,
                            metadata: {
                                type: "go_test_result",
                                name: name,
                                status: status,
                            },
                        });
                        return main()(ctx);
                    }
                },
            );
        }),
    );
}

module.exports = init;
