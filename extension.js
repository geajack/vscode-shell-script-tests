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
        (request, token) => {
            console.log(request);
        }
    );
    
    const tests = controller.createTestItem("tests", "tests");
    const test = controller.createTestItem("test", "test", vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, "tests/test"));

    tests.children.add(test);

    controller.items.add(tests);
}

function deactivate() { }