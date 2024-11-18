window.onload = () => {
    const vscode = acquireVsCodeApi();
    const button = document.getElementById('alertButton');
    if (button) {
        button.addEventListener('click', () => {
            vscode.postMessage({ command: 'checkall', text: '按钮被点击了！' });
        });
    }

    // 页面加载后自动发送请求
    vscode.postMessage({ command: 'fetchHealthData' });

    // 处理扩展端返回的消息
    window.addEventListener('message', (event) => {
        const message = event.data;
        const tablename = message.tablename;
        const tablebodyname = message.tablebodyname;
        console.log(tablebodyname );

        if (message.command === 'displayData') {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(message.data, 'application/xml');
            updateTable(xmlDoc, tablename, tablebodyname);
        } else if (message.command === 'error') {
            document.getElementById('loading').textContent = `请求失败: ${message.message}`;
        }s
    });

    function updateTable(xmlDoc, tablename, tablebodyname) {
        const tableBody = document.getElementById(tablebodyname);
        const loadingText = document.getElementById('loading');
        const healthTable = document.getElementById(tablename);    

        // 隐藏加载文字，显示表格
        loadingText.style.display = 'none';
        healthTable.style.display = 'table';

        // 遍历 XML 的元素并添加到表格中
        const elements = xmlDoc.documentElement.children;
        for (let i = 0; i < elements.length; i++) {
            const row = document.createElement('tr');
            const keyCell = document.createElement('td');
            const valueCell = document.createElement('td');

            keyCell.textContent = elements[i].nodeName;
            valueCell.textContent = elements[i].textContent;

            row.appendChild(keyCell);
            row.appendChild(valueCell);
            tableBody.appendChild(row);
        }
    }
};