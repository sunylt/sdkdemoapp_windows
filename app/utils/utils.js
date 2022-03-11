const fs = require("fs-extra");
const { remote, ipcRenderer } = require("electron");
let configDir = remote.app.getPath("userData");
const easemob = require('../node/index');
let privateServerConfig = {};

ipcRenderer.on("privateServerConfig", (event, data) => {
	console.log("privateServerConfig event", data);
	privateServerConfig = data;
});

const utils = {
	latestFunc(){
		var callback;
		return function(cb){
			callback = cb;
			return function(){
				cb === callback && cb.apply(this, arguments);
			};
		};
	},
	initEmclient(){
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
		const appKey = privateServerConfig.usePrivateConfig ? privateServerConfig.appKey : (userInfo && userInfo.user.appkey)
		this.chatConfigs = new easemob.EMChatConfig(`${configDir}/easemob-desktop`, `${configDir}/easemob-desktop`, appKey, 0);
		this.chatConfigs.setDeleteMessageAsExitGroup(true);
		const emclient = new easemob.EMClient(this.chatConfigs);
		console.log(emclient, privateServerConfig);
		if(privateServerConfig.usePrivateConfig){
			let config = emclient.getChatConfigs();
			let privateconfigs = config.privateConfigs();
			privateconfigs.enableDns = false;
			privateconfigs.chatServer = privateServerConfig.chatServer;
			privateconfigs.chatPort = privateServerConfig.chatPort;
			privateconfigs.restServer = privateServerConfig.restServer;
		}
		// privateconfigs.resolverServer = "http://192.168.1.101:5002";
		return emclient;
	}
};


export default{
	utils
};
