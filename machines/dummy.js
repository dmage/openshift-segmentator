"use strict";

const rule = require("digdown/rule");

function init(metadata) {
    return rule.oneOf(
        rule.eof((ctx) => {
            ctx.emit({
                offset: 0,
                length: ctx.offset,
                metadata: metadata,
            });
        }),
    );
}

module.exports = init;
