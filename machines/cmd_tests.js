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
                type: "cmd_test",
                name: ctx.name,
                status: ctx.status,
            },
        });
        return init()(ctx);
    };
}

function main() {
    return rule.oneOf(
        rule.pattern(/^Running .*\.sh:[0-9]+: executing/, (ctx) => {
            if (ctx.started) {
                return finish()(ctx);
            }
            ctx.started = true;
            ctx.begin = ctx.offset;
            ctx.name = ctx.line;
            ctx.status = undefined;
        }),
        rule.pattern(/^(?:[A-Za-z0-9 ._-]+: ok$|Of [0-9]+ tests executed in|\[(?:INFO|ERROR)\] |\[INFO\] .*No compiled `junitreport` binary was found\. Attempting to build one using:)/, (ctx) => {
            if (ctx.started) {
                return finish()(ctx);
            }
        }),
        rule.eof((ctx) => {
            if (ctx.started) {
                return finish()(ctx);
            }
        }),
        rule.pattern(/^SUCCESS after /, (ctx) => {
            ctx.status = "success";
        }),
        rule.pattern(/^FAILURE after /, (ctx) => {
            ctx.status = "failure";
        }),
    );
}

module.exports = init;
