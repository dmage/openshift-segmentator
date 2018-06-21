"use strict";

const rule = require("digdown/rule");

const its = ["[It]", "[BeforeEach]", "[JustBeforeEach]", "[AfterEach]"];
const skippingBegin = "[BeforeEach] [Top Level]";

class Frame {
    constructor(name, fileLine) {
        this.name = name;
        this.fileLine = fileLine;
    }

    toString() {
        return this.name + "\n" + this.fileLine;
    }
}

class Header {
    constructor(first, second, fileLine) {
        this.first = first;
        this.second = second;
        this.fileLine = fileLine;
    }

    toString() {
        return this.first + "\n  " + this.second + "\n  " + this.fileLine;
    }
}

class Memory {
    constructor() {
        this.headers = {};
    }
}

function removeIt(s) {
    for (let it of its) {
        if (s.endsWith(" " + it)) {
            return s.slice(0, -it.length - 1);
        }
    }
    return s;
}

function moveIt(s) {
    for (let it of its) {
        if (s.endsWith(" " + it)) {
            return it + " " + s.slice(0, -it.length - 1);
        }
    }
    return s;
}

function headerFromStack(stack) {
    return new Header(
        stack.slice(0, -1).map((x) => removeIt(x.name) + " ").join(""),
        removeIt(stack[stack.length - 1].name),
        stack[stack.length - 1].fileLine,
    );
}

function nameFromStack(stack) {
    return stack.map((x) => moveIt(x.name)).join(" ");
}


function stateInit() {
    return stateMain(new Memory());
}

function stateMain(memory) {
    return rule.oneOf(
        rule.pattern(/^(?:•|S \[SKIPPING\])/, (ctx) => {
            return stateResult(memory)(ctx);
        }),
        rule.pattern(skippingBegin, (ctx) => {
            memory.headers[new Header(ctx.line, "", "")] = ctx.offset;
        }),
        rule.pattern(/^  /, (ctx) => {
            return stateMain(memory);
        }),
        (ctx) => {
            return stateHeader(memory)(ctx);
        },
    );
}

function stateHeader(memory) {
    return (ctx) => {
        let begin = ctx.offset;
        let first = ctx.line;
        return rule.oneOf(
            rule.pattern(/^  (.*)$/, (ctx) => {
                let second = ctx.match[1];
                return rule.oneOf(
                    rule.pattern(/^  (.*)$/, (ctx) => {
                        let fileLine = ctx.match[1];
                        return rule.oneOf(
                            rule.pattern(/^$/, (ctx) => {
                                memory.headers[new Header(first, second, fileLine)] = begin;
                                return stateMain(memory);
                            }),
                            (ctx) => {
                                return stateMain(memory)(ctx);
                            },
                        );
                    }),
                    (ctx) => {
                        return stateMain(memory)(ctx);
                    },
                );
            }),
            (ctx) => {
                return stateMain(memory)(ctx);
            },
        );
    };
}

function stateResult(memory) {
    return (ctx) => {
        memory.resultBegin = ctx.offset;
        memory.resultLine = ctx.line;
        memory.stack = [];
        return stateFrame(memory, /^/);
    };
}

function stateFrame(memory, prefix) {
    return rule.oneOf(
        rule.eof((ctx) => {
            return stateEnd(memory)(ctx);
        }),
        rule.pattern(prefix, (ctx) => {
            let name = ctx.line.slice(ctx.match[0].length);
            return rule.oneOf(
                rule.eof((ctx) => {
                    return stateEnd(memory)(ctx);
                }),
                rule.pattern(prefix, (ctx) => {
                    let fileLine = ctx.line.slice(ctx.match[0].length);
                    if (fileLine.startsWith("/")) {
                        memory.stack.push(new Frame(name, fileLine));
                        const deeperPrefix = new RegExp(prefix.source + "  ");
                        return rule.oneOf(
                            rule.eof((ctx) => {
                                return stateEnd(memory)(ctx);
                            }),
                            rule.pattern(deeperPrefix, (ctx) => {
                                return stateFrame(memory, deeperPrefix)(ctx);
                            }),
                            rule.pattern(/^$/, (ctx) => {
                                return stateOutput(memory, prefix);
                            }),
                            rule.pattern(/^------------------------------$/, (ctx) => {
                                return stateEnd(memory);
                            }),
                            (ctx) => {
                                return stateEnd(memory)(ctx);
                            },
                        );
                    }
                }),
                (ctx) => {
                    return stateEnd(memory)(ctx);
                },
            );
        }),
        (ctx) => {
            return stateEnd(memory)(ctx);
        },
    );
}

function stateOutput(memory, prefix) {
    return rule.oneOf(
        rule.pattern(/^------------------------------$/, (ctx) => {
            return stateEnd(memory);
        }),
        rule.pattern(/^$/, (ctx) => {
            return stateOutput(memory, prefix);
        }),
        rule.pattern(prefix, (ctx) => {
            return stateOutput(memory, prefix);
        }),
        (ctx) => {
            return stateEnd(memory)(ctx);
        },
    );
}

function stateEnd(memory) {
    return (ctx) => {
        let begin = memory.headers[headerFromStack(memory.stack)];
        if (typeof begin === "undefined" && memory.resultLine.startsWith("S")) {
            begin = memory.headers[new Header(skippingBegin, "", "")];
        }
        if (typeof begin === "undefined") {
            begin = memory.resultBegin;
        }
        let metadata = {
            type: "ginkgo_test",
            name: nameFromStack(memory.stack),
            result: memory.resultLine,
        };
        if (memory.resultLine.startsWith("• Failure") || memory.resultLine.startsWith("•! Panic") || memory.resultLine.startsWith("•... Timeout")) {
            metadata["status"] = "failure";
        } else if (memory.resultLine == "•" || memory.resultLine.startsWith("• [")) {
            metadata["status"] = "success";
        } else if (memory.resultLine.startsWith("S")) {
            metadata["status"] = "skipped";
        }
        ctx.emit({
            offset: begin,
            length: ctx.offset - begin,
            metadata: metadata,
        });
        return stateInit()(ctx);
    };
}

module.exports = stateInit;
