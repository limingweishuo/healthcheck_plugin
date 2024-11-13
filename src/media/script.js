window.onload = () => {
    const button = document.getElementById('alertButton');
    if (button) {
        button.addEventListener('click', () => {
            vscode.postMessage({ command: 'alert', text: '按钮被点击了！' });
        });
    }
};