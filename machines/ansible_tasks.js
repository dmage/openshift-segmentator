"use strict";

const rule = require("digdown/rule");

function result_to_status(result) {
    return {
        "skipped": "skipped",
        "ok":      "success",
        "changed": "success",
        "failed":  "failure",
        "fatal":   "failure",
    }[result];
}

function merge_status(a, b) {
    if (typeof a === "undefined" || typeof b === "undefined") {
        return a || b;
    }
    const num = {
        failure: 1,
        success: 2,
        skipped: 3,
    };
    return (num[a] < num[b]) ? a : b;
}

function init() {
    return rule.oneOf(
        rule.pattern(/^(TASK|CHECK|PLAY|RUNNING HANDLER) \[(.*)\] \*\*\*\**$/, (ctx) => {
            let seg = {
                offset: ctx.offset,
                metadata: {
                    type: "ansible_task",
                    name: ctx.match[1] + " " + ctx.match[2],
                },
            }
            return inside(seg);
        }),
    );
}

function inside(seg) {
    return rule.oneOf(
        rule.eof((ctx) => {
            return end(seg)(ctx);
        }),
        rule.pattern(/^$/, (ctx) => {
            return end(seg);
        }),
        rule.pattern(/^[0-9][0-9][0-9][0-9]\/[0-9][0-9]\/[0-9][0-9] /, (ctx) => {
            // start of the prow output
            return end(seg)(ctx);
        }),
        rule.pattern(/^(ok|changed|skipping|failed|fatal): \[([A-Za-z0-9. >-]+)\].* => {$/, (ctx) => {
            seg.metadata.status = merge_status(seg.metadata.status, result_to_status(ctx.match[1]));
            return rule.oneOf(
                rule.eof((ctx) => {
                    return end(seg)(ctx);
                }),
                rule.pattern(/^}$/, (ctx) => {
                    return inside(seg);
                }),
            );
        }),
        rule.pattern(/^(ok|changed|skipping|failed|fatal): \[([A-Za-z0-9. >-]+)\].* => {.*}$/, (ctx) => {
            seg.metadata.status = merge_status(seg.metadata.status, result_to_status(ctx.match[1]));
        }),
        rule.pattern(/^(ok|changed|skipping): \[([A-Za-z0-9. >-]+)\]$/, (ctx) => {
            seg.metadata.status = merge_status(seg.metadata.status, result_to_status(ctx.match[1]));
        }),
    );
}

function end(seg) {
    return (ctx) => {
        seg.length = ctx.offset - seg.offset;
        ctx.emit(seg);
        return init()(ctx);
    };
}

module.exports = init;
