"use strict";

const rule = require("digdown/rule");

function init() {
    return (ctx) => {
        ctx.started = false
        ctx.begin = ctx.offset;
        ctx.name = undefined;
        ctx.status = undefined;
        return main()(ctx);
    };
}

function finish() {
    return (ctx) => {
        ctx.emit({
            offset: ctx.begin,
            length: ctx.offset - ctx.begin,
            metadata: {
                type: "ginkgo_test_block",
                name: ctx.name,
                status: ctx.status,
            },
        });
        return init()(ctx);
    };
}

function main() {
    return rule.oneOf(
        rule.pattern(/^(?:\[(?:BeforeEach|JustBeforeEach|It|AfterEach)\] |•|S \[SKIPPING\])/, (ctx) => {
            if (ctx.started) {
                return finish()(ctx);
            }
            ctx.started = true;
            ctx.begin = ctx.offset;
            ctx.name = ctx.line;
        }),
        rule.eof((ctx) => {
            if (ctx.started) {
                return finish()(ctx);
            }
        }),
    );
}

module.exports = init;
