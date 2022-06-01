const vscode = require("vscode");
const process = require("child_process");

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

                if (request.exclude && request.exclude.includes(test))
                {
                    continue;
                }

                if (test.uri)
                {
                    command = test.uri.path;
                    let start = Date.now();
                    const result = await new Promise((resolve, reject) => {
                        process.execFile(command, (err, out) => resolve({err, out}));
                    });
                    let duration = Date.now() - start;

                    let message = result.out;
                    message = message.replaceAll("\n", "\n\r");
                    run.appendOutput(message);

                    if (result.err === null)
                    {
                        run.passed(test, duration);
                    }
                    else
                    {
                        let { code, message } = result.err;
                        run.failed(test, new vscode.TestMessage(message), duration);
                    }
                }
                else
                {
                    test.children.forEach(test => queue.push(test));
                }
            }

            // Make sure to end the run after all tests have been executed:
            run.end();
        }
    );
    
    const tests = controller.createTestItem("tests", "tests");
    const test = controller.createTestItem("test", "test", vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, "tests/test"));

    tests.children.add(test);

    this.disposableRegistry.push(
        commandManager.registerCommand(
            constants.Commands.Tests_Configure,
            function(_, _, resource)
            {
            },
        ),
    );

    // controller.items.add(tests);
}

function deactivate() { }