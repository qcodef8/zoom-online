require.config({
    paths: {
        vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs",
    },
});

require(["vs/editor/editor.main"], function () {
    const htmlEditor = monaco.editor.create(
        document.getElementById("htmlEditor"),
        {
            value: `<h1>Hello Live Preview</h1>`,
            language: "html",
            theme: "vs-dark",
            automaticLayout: true,
        }
    );

    const cssEditor = monaco.editor.create(
        document.getElementById("cssEditor"),
        {
            value: `body { font-family: sans-serif; background: #f4f4f4; color: #333; }`,
            language: "css",
            theme: "vs-dark",
            automaticLayout: true,
        }
    );

    const jsEditor = monaco.editor.create(document.getElementById("jsEditor"), {
        value: `console.log("Hello from JS");`,
        language: "javascript",
        theme: "vs-dark",
        automaticLayout: true,
    });

    const iframe = document.getElementById("iframePreview");

    function updatePreview() {
        const html = htmlEditor.getValue();
        const css = cssEditor.getValue();
        const js = jsEditor.getValue().replace(/<\/script>/gi, "<\\/script>");

        const fullDoc = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <style>${css}</style>
                </head>
                <body>
                    ${html}
                    <script>${js}</script>
                </body>
            </html>
        `;

        iframe.srcdoc = fullDoc;
    }

    htmlEditor.onDidChangeModelContent(updatePreview);
    cssEditor.onDidChangeModelContent(updatePreview);
    jsEditor.onDidChangeModelContent(updatePreview);

    updatePreview();

    window.addEventListener("beforeunload", (e) => {
        e.preventDefault();
        e.returnValue = "";
    });

    monaco.languages.html.htmlDefaults.setOptions({
        format: { enable: true },
        suggest: { html5: true },
        autoClosingTags: true,
    });
});
