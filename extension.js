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

    let uri = new vscode.Uri("./package.json");

    const test = controller.createTestItem("test", "a test", uri);
    controller.items.add(test);
}

function deactivate() { }