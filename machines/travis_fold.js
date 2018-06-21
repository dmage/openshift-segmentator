"use strict";

const rule = require("digdown/rule");

function init() {
    return main(0);
}

function main(forceBegin) {
    return rule.oneOf(
        (ctx) => {
            let offset = ctx.offset, line = ctx.line;
            if (offset < forceBegin) {
                line = line.slice(forceBegin - offset);
                offset = forceBegin;
            }
            let match = /(^|\r\x1b\[0K)travis_fold:start:([^\r]+)\r\x1b\[0K/.exec(line);
            if (match !== null) {
                let begin = offset + line.indexOf(match[0]) + match[1].length;
                let name = match[2];
                let end = "travis_fold:end:" + match[2] + "\r\x1b[0K";
                return rule.oneOf(
                    (ctx) => {
                        let pos = -1;
                        if (ctx.line.startsWith(end)) {
                            pos = 0;
                        } else if ((pos = ctx.line.indexOf("\r\x1b[0K" + end)) !== -1) {
                            pos += 5;
                        }
                        if (pos !== -1) {
                            ctx.emit({
                                offset: begin,
                                length: ctx.offset + pos + end.length - begin,
                                metadata: {
                                    type: "travis_fold",
                                    name: name,
                                },
                            });
                            return main(ctx.offset + pos + end.length)(ctx);
                        }
                    },
                );
            }
        },
    );
}

module.exports = init;
