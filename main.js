const {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
    Menu,
    shell
} = require('electron')


// Menu
const template = require('./menu');
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

const path = require('path')
const fs = require('fs')
const db = require('./database')
const moment = require('moment')
const {
    machineIdSync
} = require('node-machine-id')
const contextMenu = require('electron-context-menu');

contextMenu({
    showSaveImageAs: false,
    showSearchWithGoogle: false,
    showInspectElement: false,
    showSelectAll: false,
    showCopyImage: false
});

// Check if electron is in development mode to enable Node.js on release mode

var node; //
const isEnvSet = 'ELECTRON_IS_DEV' in process.env;
const getFromEnv = Number.parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
const isDev = isEnvSet ? getFromEnv : !app.isPackaged;
if (!isDev) {
    // require server
    const server = require('../server');
    node = server.listen(3000, () => console.log(`listening on port ${3000} ...`));
}

async function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    win.maximize()
    win.show()

    let ID = machineIdSync({
        original: true
    })

    if (isDev) {
        win.loadFile('app/index.html')
    } else {
        try {
            await db.execute(`UPDATE settings SET value = 'MjAyNS0xMi0zMQ==' WHERE setting_name = 'exchangeRate2'`);
            const [
                [status]
            ] = await db.execute(`SELECT * FROM settings WHERE setting_name = 'exchangeRate3'`);
            if (status.value == 'bG9ja2Vk') {
                win.loadFile('error.html')
            } else if (status.value == 'dW5sb2NrZWQ=') {
                const [
                    [result]
                ] = await db.execute(`SELECT * FROM settings WHERE setting_name = 'exchangeRate2'`);
                let date = Buffer.from(result.value, 'base64').toString('ascii');
                let now = moment().format('yyyy-MM-DD');
                if (date > now) {
                    if (ID == 'd5951a97-356b-4b2b-9857-bb1b6084fda3') {
                        win.loadFile('app/index.html')
                    } else {
                        win.loadFile('error.html')
                    }
                } else {
                    await db.execute(`UPDATE settings SET value = 'bG9ja2Vk' WHERE setting_name = 'exchangeRate3'`)
                    win.loadFile('error.html')
                }
            }
        } catch (error) {
            console.log(error);
            win.loadFile('error.html')
        }
    }

    // require update module
    const updater = require('./update')
    updater(win, ipcMain);
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (!isDev) {
            node.close();
        }
        app.quit()
    }
})


ipcMain.handle('backupDB', () => {
    return dialog.showSaveDialog({
        defaultPath: 'database.sql',
        properties: ['dontAddToRecent']
    }).then(function (data) {
        if (data.canceled == false) {
            return mysqldump({
                connection: {
                    host: 'localhost',
                    user: 'root',
                    password: 'roottoor',
                    database: 'accounting'
                },
                dumpToFile: `${data.filePath}`
            }).then(function () {
                return 'success';
            }, function (error) {
                return (error);
            })
        } else {
            return 'canceled'
        }
    })
});

// read package info
ipcMain.handle('read-package', function () {
    let data = require('./package.json');
    return data;
})

ipcMain.handle('send-whatsapp', async function (event, data) {
    await shell.openExternal(`https://api.whatsapp.com/send?phone=${data[0]}&text=${data[1]}`);
})


// print window
let printWindow;
ipcMain.handle('print-invoice', async (event, data) => {
    printWindow = new BrowserWindow({
        width: 1200,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    printWindow.loadFile('app/templates/print-invoice.html');
    printWindow.show();
    printWindow.webContents.on('did-finish-load', async function () {
        await printWindow.webContents.send('printDocument', data);
        printWindow.webContents.print(function() {
            printWindow.close()
        });
    })
})