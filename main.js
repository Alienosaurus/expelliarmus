const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const process = require('process')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let controlWindow

const devMode = process.argv.indexOf("devMode") >= 0;

function createWindow () {
  // Create the browser window.
  controlWindow = new BrowserWindow({width: 900, height: 600})
  controlWindow.devMode = devMode;
  // and load the index.html of the app.
  controlWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'control/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  if(devMode){
    // Open the DevTools.
    controlWindow.webContents.openDevTools()
  }

  // Emitted when the window is closed.
  controlWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    controlWindow = null
  });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (controlWindow === null) {
    createWindow();
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

