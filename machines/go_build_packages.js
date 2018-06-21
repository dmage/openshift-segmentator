"use strict";

const rule = require("digdown/rule");

const packageName = /[A-Za-z0-9._-]+/;
const importPath = new RegExp(packageName.source + "(?:/" + packageName.source + ")*");
const onlyImportPath = new RegExp("^" + importPath.source + "$");

function init() {
    let count = 0, begin;
    return rule.oneOf(
        (ctx) => {
            if (onlyImportPath.test(ctx.line)) {
                if (count === 0) {
                    begin = ctx.offset;
                }
                count++;
            } else {
                if (count > 15) {
                    ctx.emit({
                        offset: begin,
                        length: ctx.offset - begin,
                        metadata: {
                            type: "go_build_packages",
                            name: count + " packages",
                        },
                    });
                }
                count = 0;
            }
        },
    );
}

module.exports = init;
