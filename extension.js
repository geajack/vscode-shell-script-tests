const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const process = require("child_process");

module.exports = {
    activate,
    deactivate,
};

async function activate(context)
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
                    run.started(test);
                    const result = await new Promise((resolve, reject) => {
                        process.execFile(
                            command,
                            { cwd: vscode.workspace.workspaceFolders[0].uri.fsPath },
                            (err, out) => resolve({err, out})
                        );
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
                        message = message.replaceAll("\n", "\n\r");
                        run.appendOutput(message);
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

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "shellScriptTests.configureTests",
            async function(_, _, resource)
            {
                let response = await vscode.window.showInputBox(
                    {
                        prompt: "Tests folder:"
                    }
                );

                let configuration = vscode.workspace.getConfiguration("shellScriptTests");
                try
                {
                    await configuration.update("testFolder", response, false);
                }
                catch (exception)
                {
                    console.log(exception);
                }

                detectTests();
            },
        ),
    );

    detectTests();

    async function detectTests()
    {
        let configuration = vscode.workspace.getConfiguration("shellScriptTests");
        let relativePath = await configuration.get("testFolder");
        let root = vscode.workspace.workspaceFolders[0].uri;
        let testsPath = vscode.Uri.joinPath(root, relativePath);

        await findTests(testsPath, controller.items);

        async function findTests(directoryUri, parent)
        {
            let children = await vscode.workspace.fs.readDirectory(directoryUri);
            for (let child of children)
            {
                let [name, type] = child;
                let uri = vscode.Uri.joinPath(directoryUri, name);
                let test;
                if (type === vscode.FileType.Directory)
                {
                    test = controller.createTestItem(uri.fsPath, name);
                    findTests(uri, test.children);
                }
                else if (type === vscode.FileType.File)
                {
                    test = controller.createTestItem(uri.fsPath, name, uri);
                }
                parent.add(test);
            }
        }
    }

}

function deactivate() { }