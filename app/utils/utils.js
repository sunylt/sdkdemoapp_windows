const fs = require("fs-extra");
const { remote, ipcRenderer } = require("electron");
let configDir = remote.app.getPath("userData");
const { easemob } = remote.app;
let privateServerConfig = {};

// ipcRenderer.on("privateServerConfig", (event, data) => {
// 	console.log("privateServerConfig event", data);
// 	privateServerConfig = data;
// });

const utils = {
	getServerConfig(){
		return this._privateConfig;
	},
	initRtcWindow({ userId, userName, imAppKey, imToken }){
		
		const { rtcAppId, rtcAppKey, rtcServer } = utils.getServerConfig();
		return new Promise((resolve, reject) => {
			try{
				const { winId, isNew } = ipcRenderer.sendSync("rtc-init-window");
				const rtcWindow = remote.BrowserWindow.fromId(winId);
				const winReady = () => {
					rtcWindow.webContents.send("rtc-init-data", { userId, userName, rtcAppId, rtcAppKey, rtcServer, imAppKey, imToken });
					rtcWindow.show();
					resolve(rtcWindow);
				};

				if(isNew){
					rtcWindow && rtcWindow.webContents.once("did-finish-load", winReady);
				}
				else{
					winReady();
				}

				if(!winId){
					reject({ msg: "init rtc window fail." });
				}
			}
			catch(e){
				reject(e);
			}
		});
	},
	latestFunc(){
		var callback;
		return function(cb){
			callback = cb;
			return function(){
				cb === callback && cb.apply(this, arguments);
			};
		};
	},
	initEmclient(config){
		console.log("init emclient >>>>");
		const _privateConfig = config ? config : privateServerConfig;
		const userInfo = {
			user: {
				id: 1,
				os: "PC",
				appkey: "easemob-demo#easeim",
				tenantId: 9,
				image: ""
			}
		};
		const appKey = _privateConfig.usePrivateConfig ? _privateConfig.appKey : (userInfo && userInfo.user.appkey);
	
		fs.ensureDir(`${configDir}/easemob`, function(err){
			console.log(err);
		});
		fs.ensureDir(`${configDir}/easemob-desktop`, function(err){
			console.log(err);
		});
		// 头像文件夹下创建一个用户文件夹，不同的用户头像存放在不同的文件夹下
		// 创建一个文件夹用来存放头像
		fs.ensureDir(`${configDir}/easemob/easemobAvatar`, function(err){
			console.log(err);
		});
		fs.ensureDir(`${configDir}/easemob/easemobAvatar/user`, function(err){
			console.log(err);
		});
		// 创建一个文件夹用来存放 pasteImage
		fs.ensureDir(`${configDir}/easemob/pasteImage`, function(err){
			console.log(err);
		});
		
		this._privateConfig = _privateConfig;
		this.emclient = easemob.createEMClient({
			resourcePath: `${configDir}/easemob-desktop`,
			workPath: `${configDir}/easemob-desktop`,
			appKey,
			deviceId: 0
		});

		// const chatConfigs = new easemob.EMChatConfig(`${configDir}/easemob-desktop`, `${configDir}/easemob-desktop`, appKey, 0);
		// const connectListener = new easemob.EMConnectionListener();
		// chatConfigs.setDeleteMessageAsExitGroup(true);
		// chatConfigs.setDeviceName(`sdk_pc_${+new Date()}`);
		// this.emclient = new easemob.EMClient(chatConfigs);
		// connectListener.onConnect(() => {
		// 	 this.mainWindow.webContents.send("emclient-connect-listener", { status: 1 });
		// });
		// connectListener.onDisconnect((error) => {
		// 	 this.mainWindow.webContents.send("emclient-connect-listener", { status: 0, error });
		// });
		// this.emclient.addConnectionListener(connectListener);
		
		// 配置私有化服务
		if(Object.keys(_privateConfig).length && _privateConfig.usePrivateConfig){
			const config = this.emclient.getChatConfigs();
			const privateconfigs = config.privateConfigs();
			
			privateconfigs.enableDns = false;
			privateconfigs.chatServer = _privateConfig.chatServer;
			privateconfigs.chatPort = _privateConfig.chatPort;
			privateconfigs.restServer = _privateConfig.restServer;
		}
		// privateconfigs.resolverServer = "http://192.168.1.101:5002";
		console.log(this.emclient);
		return this.emclient;
	}
};


export default{
	utils
};
