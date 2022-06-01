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

    let uri = vscode.Uri.file("tests/test");
    
    const test = controller.createTestItem("test", "test", uri);
    controller.items.add(test);
}

function deactivate() { }