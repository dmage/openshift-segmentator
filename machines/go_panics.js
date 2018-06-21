"use strict";

const rule = require("digdown/rule");
const regular = require("digdown/regular");

function goroutineTrace() {
    return regular.sequence(
        regular.oneOrMore(
            regular.pattern(/^[A-Za-z0-9/()*._-]+\([0-9a-fx, .]*\)$/),
            regular.pattern(/^\t[/A-Za-z0-9/<>._-]+:[0-9]+ \+0x[0-9a-f]+$/),
        ),
        regular.optional(
            regular.pattern(/^created by [A-Za-z0-9/()*._-]+$/),
            regular.pattern(/^\t[A-Za-z0-9/<>._-]+:[0-9]+ \+0x[0-9a-f]+$/),
        ),
    );
}

function goroutine() {
    return regular.sequence(
        regular.pattern(/^(?<name>goroutine [0-9]+(?: \[.*\])?:)$/),
        goroutineTrace(),
        regular.optional(
            regular.pattern(/^$/),
        ),
    );
}

function panic() {
    return regular.sequence(
        regular.pattern(/^(?<name>panic: .*)/),
        regular.zeroOrMore(
            regular.pattern(/^(?<name>.+)/),
        ),
        regular.oneOrMore(
            regular.pattern(/^$/),
            regular.pattern(/^goroutine [0-9]+(?: \[.*\])?:$/),
            goroutineTrace(),
        ),
    );
}

module.exports.panic = () => regular.search(panic(), {"type": "go_panic", "status": "failure"});
module.exports.goroutine = () => regular.search(goroutine(), {"type": "go_panic_goroutine"});
