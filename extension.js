const vscode = require("vscode");

module.exports = {
    activate,
    deactivate,
};

function activate(context)
{
    const controller = vscode.tests.createTestController(
        "helloWorldTests",
        "Hello World Tests"
    );

    const runProfile = controller.createRunProfile(
        "Run",
        vscode.TestRunProfileKind.Run,
        async (request, token) => {
            const run = controller.createTestRun(request);
            const queue = [];

            // Loop through all included tests, or all known tests, and add them to our queue
            if (request.include) {
                request.include.forEach(test => queue.push(test));
            } else {
                controller.items.forEach(test => queue.push(test));
            }

            // For every test that was queued, try to run it. Call run.passed() or run.failed().
            // The `TestMessage` can contain extra information, like a failing location or
            // a diff output. But here we'll just give it a textual message.
            while (queue.length > 0 && !token.isCancellationRequested)
            {
                const test = queue.pop();

                // Skip tests the user asked to exclude
                if (request.exclude && request.exclude.includes(test))
                {
                    continue;
                }

                let start = Date.now();
                if (true)
                {
                    run.passed(test, Date.now() - start);
                }
                else
                {
                    run.failed(test, new vscode.TestMessage(e.message), Date.now() - start);
                }

                test.children.forEach(test => queue.push(test));
            }

            // Make sure to end the run after all tests have been executed:
            run.end();
        }
    );
    
    const tests = controller.createTestItem("tests", "tests");
    const test = controller.createTestItem("test", "test", vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, "tests/test"));

    tests.children.add(test);

    controller.items.add(tests);
}

function deactivate() { }