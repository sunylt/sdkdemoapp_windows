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
	initRtcWindow(userId){
		
		const { rtcAppId, rtcAppKey, rtcServer } = utils.getServerConfig();
		return new Promise((resolve, reject) => {
			try{
				const { winId, isNew } = ipcRenderer.sendSync("initRtcWindow");
				const rtcWindow = remote.BrowserWindow.fromId(winId);

				rtcWindow.webContents.once("did-finish-load", () => {
					rtcWindow.webContents.send("rtcInitData", { userId, rtcAppId, rtcAppKey, rtcServer });
					rtcWindow.show();
					resolve(rtcWindow);
				});
				
				if(!isNew){
					rtcWindow.webContents.send("rtcInitData", { userId, rtcAppId, rtcAppKey, rtcServer });
					rtcWindow.show();
					resolve(rtcWindow);
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
		const _privateConfig = config ? config : privateServerConfig;
		this._privateConfig = _privateConfig;
		let userInfo = {
				"user":{
					"id":1,
					"os":"PC",
					"appkey":"easemob-demo#easeim",
					"tenantId":9,
					"image":""
				}
			};
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
		const appKey = _privateConfig.usePrivateConfig ? _privateConfig.appKey : (userInfo && userInfo.user.appkey);
		this.chatConfigs = new easemob.EMChatConfig(`${configDir}/easemob-desktop`, `${configDir}/easemob-desktop`, appKey, 0);
		this.chatConfigs.setDeleteMessageAsExitGroup(true);
		const emclient = new easemob.EMClient(this.chatConfigs);
		console.warn("util init emclient", emclient, _privateConfig);
		if(Object.keys(_privateConfig).length && _privateConfig.usePrivateConfig){
			console.warn("use private config", _privateConfig);
			let config = emclient.getChatConfigs();
			let privateconfigs = config.privateConfigs();
			privateconfigs.enableDns = false;
			privateconfigs.chatServer = _privateConfig.chatServer;
			privateconfigs.chatPort = _privateConfig.chatPort;
			privateconfigs.restServer = _privateConfig.restServer;
		}
		// privateconfigs.resolverServer = "http://192.168.1.101:5002";
		return emclient;
	}
};


export default{
	utils
};
