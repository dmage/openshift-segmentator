#!/usr/bin/env node
"use strict";

const rule = require("digdown/rule");
const segment = require("digdown/segment");
const machine = require("digdown/machine");
const segmentator = require("digdown/segmentator");

function dropSmallSegments(minSize, seg) {
    return segmentator.filter((x) => x.length >= minSize, seg);
}

(function() {
    const stage = [
        require("./machines/ansible_tasks"),
        require("./machines/ginkgo_tests"),
        require("./machines/cmd_suites"),
        require("./machines/hack_test_util"),
        require("./machines/hack_build_images"),
        require("./machines/hack_build_base_images"),
        require("./machines/cmd_tests"),
        require("./machines/go_test_packages"),
        require("./machines/go_test_result"),
        require("./machines/go_build_packages"),
        require("./machines/go_panics").panic,
        require("./machines/bazel_case"),
        require("./machines/rpm_processing"),
        require("./machines/rpm_executing"),
        require("./machines/make_dir"),
        require("./machines/shell_traces"),
        require("./machines/in_suites"),
    ];
    const segtor = segmentator.collapseSuccessfulSiblings(
        10,
        segmentator.filter(
            (x) => x.metadata.type !== "shell_trace" && x.metadata.type !== "in_suite" || x.length >= 4096,
            segmentator.byType({
                "toplevel": segmentator.basic(
                    require("./machines/stages"),
                    require("./machines/travis_fold"),
                    require("./machines/travis_time"),
                    ...stage
                ),
                "stage": segmentator.basic(...stage),
                "travis_fold": segmentator.basic(
                    require("./machines/travis_time")
                ),
                "ginkgo_test": dropSmallSegments(1024, segmentator.basic(
                    require("./machines/ginkgo_test_blocks")
                )),
                "ginkgo_test_block": dropSmallSegments(1024, segmentator.basic(
                    require("./machines/ginkgo_test_steps")
                )),
                "hack_test_util": segmentator.basic(
                    require("./machines/cmd_tests")
                ),
                "cmd_suite": segmentator.basic(
                    require("./machines/cmd_tests")
                ),
                "go_test_package": segmentator.basic(
                    require("./machines/go_test_result"),
                    require("./machines/go_panics").panic
                ),
                "go_panic": segmentator.basic(
                    require("./machines/go_panics").goroutine
                ),
                "go_test_result": dropSmallSegments(1024, segmentator.basic(
                    require("./machines/go_test_result"),
                    require("./machines/go_test_result_message")
                )),
                "rpm_processing": segmentator.basic(
                    require("./machines/rpm_executing")
                ),
                "rpm_executing": segmentator.basic(
                    require("./machines/make_dir")
                ),
                "make_dir": segmentator.basic(
                    require("./machines/make_dir")
                ),
                "hack_build_images": segmentator.basic(
                    require("./machines/square_brackets")
                ),
                "hack_build_base_images": segmentator.basic(
                    require("./machines/square_brackets")
                ),
                "in_suite": segmentator.basic(
                    require("./machines/go_diff_a_b")
                ),
            })
        )
    );

    const filename = process.argv[2];
    if (!filename) {
        throw "the first argument should be a filename";
    }

    const seg = segment.toplevel(filename, {
        type: "toplevel",
    });
    segtor(filename, 0, seg, segtor, (err) => {
        if (err) {
            throw err;
        }
        process.stdout.write(JSON.stringify(seg) + "\n");
    });
})();
