"use strict";

const regular = require("digdown/regular");

function init() {
    return regular.search(
        regular.sequence(
            regular.pattern(/\[WARNING\] (?:\[[0-9:+-]+\] )?`go test` had the following output to stderr:$/),
            regular.oneOrMore(
                regular.pattern(/^\[WARNING\] /)
            )
        ),
        {
            type: "go_test_stderr",
            name: "go test",
            status: "failure",
        }
    );
}

module.exports = init;
