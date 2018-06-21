"use strict";

const rule = require("digdown/rule");

function init() {
    return main(0);
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function main(forceBegin) {
    return rule.oneOf(
        (ctx) => {
            let offset = ctx.offset, line = ctx.line;
            if (offset < forceBegin) {
                line = line.slice(forceBegin - offset);
                offset = forceBegin;
            }
            let match = /(^|\r\x1b\[0K)travis_time:start:([^\r]+)\r\x1b\[0K(\$ .*)$/.exec(line);
            if (match !== null) {
                let begin = offset + line.indexOf(match[0]) + match[1].length;
                let name = match[3];
                let end = new RegExp("(^|\r\x1b\\[0K)travis_time:end:" + escapeRegExp(match[2]) + ":start=[0-9]+,finish=[0-9]+,duration=([0-9]+)\r\x1b\\[0K");
                return rule.oneOf(
                    (ctx) => {
                        let match = end.exec(ctx.line);
                        if (match !== null) {
                            let length = ctx.offset + ctx.line.indexOf(match[0]) + match[0].length - begin;
                            ctx.emit({
                                offset: begin,
                                length: length,
                                metadata: {
                                    type: "travis_command",
                                    name: name + " (" + Math.round(parseInt(match[2], 10) / 1e9 * 1000)/1000 + " seconds)",
                                },
                            });
                            return main(begin + length)(ctx);
                        }
                    },
                );
            }
        },
    );
}

module.exports = init;
