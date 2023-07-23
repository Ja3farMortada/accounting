const {
    contextBridge,
    ipcRenderer,
    webContents
} = require('electron')

contextBridge.exposeInMainWorld(
    'electron', {
        ipcRenderer: ipcRenderer,
        send: async (channel, data) => {
            let response = await ipcRenderer.invoke(channel, data);
            return response;
        },
        receive: (channel, fn) => {
            ipcRenderer.on(channel, fn)
        },

        // test: (channel, fn) => ipcRenderer.on('up-to-date', channel),

        print: (callback) => ipcRenderer.on('printDocument', callback),


    }
)