"use strict";

const rule = require("digdown/rule");

function init() {
    return rule.oneOf(
		rule.pattern(/^=== RUN   /, (ctx) => {
			const begin = ctx.offset;
			return rule.oneOf(
				rule.pattern(/^(ok  |FAIL)\t/, (ctx) => {
                    const name = ctx.line;
                    const status = ctx.match[1] === "ok  " ? "success" : "failure";
                    return (ctx) => {
                        ctx.emit({
                            offset: begin,
                            length: ctx.offset - begin,
                            metadata: {
                                type: "go_test_package",
                                name: name,
                                status: status,
                            },
                        });
                        return init()(ctx);
                    };
				}),
			);
		}),
    );
}

module.exports = init;
