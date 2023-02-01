import path from "path";
import fs from "fs";
import
electron,
{
	BrowserWindow,
	app as ElectronApp,
	Menu,
	Tray,
	nativeImage,
	ipcMain,
	dialog,
	screen
}
	from "electron";
import _ from "underscore";
const metadata = require("../../package");
const { shell } = require("electron");
const exec = require("child_process").exec;
const easemob = require("../../node/index");
const IS_MAC_OSX = process.platform === "darwin";
const IS_DEV = process.env.NODE_ENV === "development";
const HOT_DEV_SERVER = "http://localhost:3000";
let emclient = null;
if(DEBUG && process.type === "renderer"){
	console.error("AppRemote must run in main process.");
}

class AppRemote {
	constructor(){
		let me = this;
		this.windows = {};
		this.cancelConfrId = {};
		this.isAnswered = false;
		ipcMain.on("open-file", (e, filePath) => {
			if(IS_MAC_OSX) shell.showItemInFolder(filePath);
			else{
				// windows下showItemInFolder不能选中文件，不知道为什么
				var reg = /\\|\//g;
				filePath = filePath.replace(reg, "\\");
				var cmdInfo = `explorer.exe /select,${filePath}`;
				exec(cmdInfo);
			}
		});

		// 设置未读消息数
		ipcMain.on("receive-unread-msg", (e, badge) => {
			badge > 0 ? this.flashTrayIcon() : this.flashTrayIcon(false);
			if(process.platform == "darwin"){
				if(badge > 0){
					ElectronApp.dock.setBadge(badge.toString());
				}
				else if(badge > 99){
					ElectronApp.dock.setBadge("99+");
				}
				else{
					ElectronApp.dock.setBadge("");
				}
			}
		});

		ipcMain.on("open-url", (e, url) => {
			shell.openExternal(url);
		});

		// 消息右键菜单
		ipcMain.on("show-context-menu", (event, fromMe, isAllowRecall, type, openFilePath, fileName, remotePath) => {
			this.openFilePath = openFilePath;
			this.saveFileName = fileName;
			this.remotePath = remotePath;
			switch(type){
			case "TEXT":
			case "LOCATION":
				me.contextMenuTemplate = _.clone(me.textMenuTemplate);
				break;
			case "IMAGE":
			case "FILE":
			default:
				me.contextMenuTemplate = _.clone(me.textMenuTemplate);
			}
			if(fromMe && isAllowRecall){
				me.contextMenuTemplate.splice(me.contextMenuTemplate.length - 1, 0, { label: "撤回", click(){ me.mainWindow.webContents.send("recallMessage"); } });
				Menu.buildFromTemplate(me.contextMenuTemplate).popup(this.mainWindow);
			}
			else if(fromMe && !isAllowRecall){
				me.contextMenuTemplate.splice(me.contextMenuTemplate.length - 1, 0, { label: "撤回(已超过两分钟)", enabled: false });
				Menu.buildFromTemplate(me.contextMenuTemplate).popup(this.mainWindow);
			}
			else{
				Menu.buildFromTemplate(me.contextMenuTemplate).popup(this.mainWindow);
			}
		});

		// 会话列表右键菜单
		ipcMain.on("conversation-context-menu", (event, conversationId) => {
			let me = this;
			let conversationMenuTemplate = [
				{ label: "删除", click(){ me.mainWindow.webContents.send("deleteConversation", { conversationId }); } },
			];
			console.log("combaknversation-context-menu");
			Menu.buildFromTemplate(conversationMenuTemplate).popup(this.mainWindow);
		});

		// 收到更新通知
		ipcMain.on("receive-client-upgrade", (event) => {
			console.log("receive-client-upgrade");
		});

		ipcMain.on("syncPrivateServerConfig", (event, data) => {
			const config = me.getPrivateConfig();
			me.mainWindow.webContents.send("privateServerConfig", config);
			event.returnValue = config;
		});

		ipcMain.on("rtc-init-window", (event, data) => {
			if(!me.rtcWindow || me.rtcWindow.isDestroyed()){
				console.log("create  new rtc window.");
				this.createRtcWindow(data);
				event.returnValue = { winId: me.rtcWindow.id, isNew: true };
			}
			else{
				console.log("find exsit rtc window.");
				event.returnValue = { winId: me.rtcWindow.id, isNew: false };
			}
				
			IS_DEV && me.rtcWindow.webContents.openDevTools();
			
		});
		ipcMain.on("close-rtc-window", () => {
			console.log("close rtc win");
			if(me.rtcWindow && !me.rtcWindow.isDestroyed()){
				me.rtcWindow.hide();
			}
		});
		easemob.createEMClient = ({ resourcePath, workPath, appKey, deviceId }) => {
			if(!emclient){
				console.log("Create new emclient");
				console.log("resourcePath>>>", resourcePath);
				console.log("workPath>>>", workPath);
				console.log("appKey>>>", appKey);
				console.log("deviceId>>>", deviceId);
				const chatConfigs = new easemob.EMChatConfig(resourcePath, workPath, appKey, deviceId);
				const connectListener = new easemob.EMConnectionListener();
				// chatConfigs.setDeleteMessageAsExitGroup(true);
				emclient = new easemob.EMClient(chatConfigs);
				connectListener.onConnect(() => {
					this.mainWindow.webContents.send("emclient-connect-listener", { status: 1 });
				});
				connectListener.onDisconnect((error) => {
					this.mainWindow.webContents.send("emclient-connect-listener", { status: 0, error });
				});
				emclient.addConnectionListener(connectListener);
			}
			else{
				console.log(JSON.stringify(emclient.getLoginInfo()));
				emclient.logout();
			}
			return emclient;
		};
		ElectronApp.easemob = easemob;
	}

	createRtcWindow(data){
		const me = this;
		me.rtcWindow = new BrowserWindow({
			width: 400,
			height: 550,
			minWidth: 400,
			minHeight: 550,
			// frame: false,
			resizable: true,
			parent: me.mainWindow,
			show: false,
			movable: true,
			autoHideMenuBar: !IS_MAC_OSX,
			// closable: true,
			minimizable: true,
			// title: "音视频通话",
			webPreferences: {
				webSecurity: false,
				nodeIntegration: true,
				contextIsolation: false,
				enableRemoteModule: true,
				// preload: path.join(app.getAppPath(), '/dist/preLoad.js'), // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
			}
		});

		me.rtcWindow.loadURL(IS_DEV ? `${HOT_DEV_SERVER}/rtc.html` : `file://${this.entryPath}/rtc.html`);

		me.rtcWindow.on("closed", () => {
			console.log("rtc window is closed");
			me.mainWindow.webContents.send("rtc-window-closed");
		});
	
	}

	// eslint-disable-next-line class-methods-use-this
	getPrivateConfig(){
		const isDev = process.env.NODE_ENV === "development";
		const  filePath = path.resolve(__dirname,  isDev  ? "../../server.json" : "../../app/server.json");
		const privateConfig = fs.readFileSync(filePath, "utf-8");
		return typeof privateConfig === "string" ? JSON.parse(privateConfig) : privateConfig;
	}
  
	init(entryPath){
		if(!entryPath){
			throw new Error("Argument entryPath must be set on init app-remote.");
		}
		this.entryPath = entryPath;
		this.mainWindow = null;
	}

	ready(){
		this.openMainWindow();
		this.initTrayIcon();
	}

	initTrayIcon(){
		var trayMenuTemplate = [
			{
				label: "退出",
				click: () => {
					this.quit();
				}
			},
		];
		if(process.platform === "win32"){
			trayMenuTemplate.unshift(
				{
					label: "关于",
					click: () => {
						this.showAboutWindow();
					}
				},
			);
		}
		if(this.tray){
			this.tray.destroy();
		}
		// Make tray icon
		const tray = new Tray(`${this.entryPath}/media/img/tray-icon-16.png`);
		const trayContextMenu = Menu.buildFromTemplate(trayMenuTemplate);
		tray.setToolTip("IM-SDK桌面端Demo");
		tray.on("click", () => {
			this.openMainWindow();
		});
		tray.on("right-click", () => {
			tray.popUpContextMenu(trayContextMenu);
		});
		this.tray = tray;
		this._trayIcons = [
			nativeImage.createFromPath(`${this.entryPath}/media/img/tray-icon-16.png`),
			nativeImage.createFromPath(`${this.entryPath}/media/img/tray-icon-transparent.png`)
		];
		this._trayIconCounter = 0;
	}

	flashTrayIcon(flash = true){
		if(flash){
			if(!this._flashTrayIconTask){
				this._flashTrayIconTask = setInterval(() => {
					this.tray && this.tray.setImage(this._trayIcons[(this._trayIconCounter++) % 2]);
				}, 400);
			}
		}
		else{
			if(this._flashTrayIconTask){
				clearInterval(this._flashTrayIconTask);
				this._flashTrayIconTask = null;
			}
			this.tray && this.tray.setImage(this._trayIcons[0]);
		}
	}

	openMainWindow(){
		if(this.mainWindow === null){
			this.createMainWindow();
		}
		else{
			console.log("MainWindow already");
			this.mainWindow.show();
			this.mainWindow.focus();
			this.flashTrayIcon(false);
		}
	}

	createMainWindow(){
		var name;
		var me = this;
		let options = {
			width: 900,
			height: 650,
			minWidth: 900,
			minHeight: 650,
			url: "index.html",
			hashRoute: "/index",
			name: "main",
			resizable: true,
			debug: true,
			autoHideMenuBar: !IS_MAC_OSX,
			backgroundColor: "#465d78",
			show: DEBUG,
			frame: true,
			titleBarStyle: IS_MAC_OSX ? "hidden" : "default",
			webPreferences: {
				webSecurity: false,
				nodeIntegration: true,
				contextIsolation: false,
				enableRemoteModule: true,
			},
			thickFrame: true,
			showAfterLoad: true,
			trafficLightPosition: {
				x: 10,
				y: 18
			}
		};

		if(DEBUG){
			const display = electron.screen.getPrimaryDisplay();
			options.height = display.workAreaSize.height;
			options.width = 800;
			options.x = display.workArea.x;
			options.y = display.workArea.y;
		}
		// this.mainWindow = this.createWindow(options);

		this.isUpdating = false;

		let browserWindow = new BrowserWindow(options);
		// if(browserWindow){
		// 	throw new Error(`The window with name '${name}' has already be created.`);
		// }
		this.mainWindow = browserWindow;

		browserWindow.on("enter-full-screen", () => {
			browserWindow.webContents.send("full-screen-event", {  result: true });
		});

		browserWindow.on("leave-full-screen", () => {
			browserWindow.webContents.send("full-screen-event", { result: false });
		});

		browserWindow.on("close", (event) => {
			// dock 上右键退出，ElectronApp.quitting = true
			if(!ElectronApp.quitting && !this.isUpdating){
				event.preventDefault();
				this.mainWindow.hide();
			}
		});

		browserWindow.on("closed", () => {
			this.mainWindow = null;
		});

		browserWindow.webContents.on("did-finish-load", () => {
			if(options.showAfterLoad){
				if(options.beforeShow){
					options.beforeShow(browserWindow, name);
				}
				browserWindow.show();
				browserWindow.focus();
				if(options.afterShow){
					options.afterShow(browserWindow, name);
				}
			}
			if(options.onLoad){
				options.onLoad(browserWindow);
			}
			const config = this.getPrivateConfig();
			browserWindow.webContents.send("privateServerConfig", config);
		});

		let url = options.url;
		if(url){
			if(!url.startsWith("file://") && !url.startsWith("http://") && !url.startsWith("https://")){
				url = `file://${this.entryPath}/${options.url}`;
			}
			if(DEBUG){
				url += "?react_perf";
			}
			if(options.hashRoute){
				url += `#${options.hashRoute}`;
			}
			browserWindow.loadURL(IS_DEV ? `${HOT_DEV_SERVER}/#/index` : url);
		}

		// 定义文字快捷菜单
		this.textMenuTemplate = [
			// { label: "复制", click(){ me.copySelect();} },
			// { type: "separator" },
			{ label: "删除", click(){ browserWindow.webContents.send("deleteMessage"); } }
		];

		// 定义多媒体快捷菜单
		this.mediaMenuTemplate = [
			// { label: "复制", role: "copy" },
			{ label: "存储...", click(){ me.saveFile(); } },
			// { type: "separator" },
			{ label: "打开文件夹", click(){ me.openItemInFolder();} },
			{ type: "separator" },
			{ label: "删除", click(){ browserWindow.webContents.send("deleteMessage"); } }
		];

		if(options.debug){
			// browserWindow.openDevTools();
			browserWindow.webContents.on("context-menu", (e, props) => {
				const { x, y } = props;
				Menu.buildFromTemplate([{
					label: "审查元素",
					click(){
						browserWindow.inspectElement(x, y);
					}
				}]).popup(browserWindow);
			});
		}
	}
	// 复制
	copySelect(){
		this.mainWindow.webContents.send("copiedValue");
	}

	// 打开所在文件夹
	openItemInFolder(){
		this.openFilePath && shell.showItemInFolder(this.openFilePath);
	}

	saveFile(){
		var me = this;
		var name = this.saveFileName.split(".");
		var ext = name.length > 1 ? name[name.length - 1] : "*";
		var remotePath = this.remotePath;
		const options = {
			filters: [
				{ name: this.saveFileName, extensions: [ext] }
			]
		};
		dialog.showSaveDialog(options, function(filePath){
			me.mainWindow.webContents.send("savedFile", { filePath, remotePath });
		});
	}

	showAboutWindow(){
		const options = {
			type: "info",
			title: "Information",
			message: `${metadata.productName} 版本${metadata.version}`,
			buttons: ["关闭"]
		};
		dialog.showMessageBox(options, function(index){
			// event.sender.send("information-dialog-selection", index);
		});
	}

	closeMainWindow(){
		if(this.mainWindow){
			this.mainWindow.close();
		}
	}

	quit(){
		this.closeMainWindow();
		ElectronApp.quit();
	}
}

const app = new AppRemote();
export default app;
