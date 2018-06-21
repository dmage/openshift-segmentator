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
                type: "cmd_suite",
                name: ctx.name,
                status: ctx.status,
            },
        });
        return init()(ctx);
    };
}

function main() {
    return rule.oneOf(
        rule.pattern(/^\+\+ \/go\/src\/github\.com\/openshift\/origin\/test\/cmd\/[A-Za-z0-9._-]+\.sh$|\[INFO\] .*starting test --/, (ctx) => {
            if (ctx.started) {
                return finish()(ctx);
            }
            ctx.started = true;
            ctx.begin = ctx.offset;
            ctx.name = ctx.line;
            ctx.status = undefined;
        }),
        rule.pattern(/^(?:Of [0-9]+ tests executed in|\[INFO\] .*No compiled `junitreport` binary was found\. Attempting to build one using:)/, (ctx) => {
            if (ctx.started) {
                return finish()(ctx);
            }
        }),
        rule.pattern(/^\[INFO\] .*cluster up --/, (ctx) => {
            if (ctx.started) {
                return finish();
            }
        }),
        rule.pattern(/^FAILURE after /, (ctx) => {
            ctx.status = "failure";
        }),
    );
}

module.exports = init;
