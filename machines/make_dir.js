"use strict";

const rule = require("digdown/rule");

function init() {
    return (ctx) => main();
}

function main() {
    return rule.oneOf(
        rule.pattern(/^make(\[[0-9]+\])?: Entering directory (.*)$/, (ctx) => {
            let state = {
                begin: ctx.offset,
                name: ctx.line,
                end: "make" + (typeof ctx.match[1] === "undefined" ? "" : ctx.match[1]) + ": Leaving directory " + ctx.match[2],
                lines: 0,
            };
            return rule.oneOf(
                (ctx) => {
                    if (state.lines === 0) {
                        state.name = ctx.line;
                        if (state.name.length > 255) {
                            state.name = state.name.slice(0, 255-3) + "...";
                        }
                    }
                    state.lines++;
                    if (/^make(\[[0-9]+\])?: \*\*\* \[.*\] Error [1-9][0-9]*$/.test(ctx.line)) {
                        state.status = "failure";
                    }
                },
                rule.pattern(state.end, (ctx) => {
                    return (ctx) => {
                        ctx.emit({
                            offset: state.begin,
                            length: ctx.offset - state.begin,
                            metadata: {
                                type: "make_dir",
                                name: state.name,
                                status: state.status,
                            },
                        });
                        return main()(ctx);
                    };
                }),
            );
        }),
    );
}

module.exports = init;
