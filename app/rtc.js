import { ipcRenderer, remote } from "electron";
import rtcHelper from "./utils/rtc-helper";
import "./style/rtc.scss";

const mainWindow = remote.getCurrentWindow().getParentWindow();
const app = document.getElementById("app");
const tip = document.getElementById("rtc-invitee-tip");
const txt = "正在邀请 $invitee 进行视频通话";
let userCount = 0;
let isCalling = false;
let timer = null;

const initToolbar = () => {
	const toolbar = document.createElement("div");
	const cxt = {};
	toolbar.id = "rtc-toolbar";

	["audio", "video", "iconfontphone"].forEach((type) => {
		const icon = document.createElement("i");
		icon.className = `iconfont icon-${type}`;
		cxt[type] = icon;
		toolbar.appendChild(icon);
	});

	app.appendChild(toolbar);
	return cxt;
};

const toolbar = initToolbar();

ipcRenderer.on("rtc-init-data", (event, data) => {
	console.log("rtc-init-data", data);
	rtcHelper.init(data);
});

ipcRenderer.on("rtc-leave-room", () => {
	console.log("leaveRoom");
	rtcHelper.leaveRoom();
});

ipcRenderer.on("rtc-join-room", (event, { roomId, invitee }) => {
	if(isCalling){
		return;
	}
	rtcHelper.joinRoom(roomId)
	.then(() => {
		if(invitee){
			tip.innerText = txt.replace("$invitee", invitee);
			tip.style.display = "block";
			timer = setTimeout(() => {
				if(userCount === 0){
					mainWindow.webContents.send("rtc-invitee-timeout");
					rtcHelper.leaveRoom();
					timer = null;
				}
			// eslint-disable-next-line no-magic-numbers
			}, 60 * 1000);
		}
		mainWindow.webContents.send(invitee ? "rtcInviteJoinSuccess" : "rtcJoinRoomSuccess");
	})
	.catch((e) => {
		console.error("join room error", e);
		// eslint-disable-next-line no-alert
		alert(`${invitee ? "无法邀请" : "加入失败"}，请检查摄像头或重试`);
		ipcRenderer.send("close-rtc-window");
		isCalling = false;
	});
	isCalling = true;
});

rtcHelper.on("addMember", () => {
	userCount++;
	tip.style.display = "none";
	if(timer){
		clearTimeout(timer);
		timer = null;
	}
});

rtcHelper.on("removeMember", () => {
	userCount--;
	if(userCount === 0){ // 没人了退出
		rtcHelper.leaveRoom();
	}
});

rtcHelper.on("exit", () => {
	userCount = 0;
	isCalling = false;
	toolbar.video.className = "iconfont icon-video";
	toolbar.audio.className = "iconfont icon-audio";
	mainWindow.webContents.send("rtc-clear-data");
	tip.style.display = "none";
});

toolbar.audio.addEventListener("click", (e) => {
	const res = rtcHelper.toggleAudio();
	e.target.className = `iconfont icon-${res ? "audiostatic" : "audio"}`;
});

toolbar.video.addEventListener("click", (e) => {
	const res = rtcHelper.toggleVideo();
	e.target.className = `iconfont icon-${res ? "videoOff" : "video"}`;
});

toolbar.iconfontphone.addEventListener("click", () => {
	rtcHelper.leaveRoom();
	isCalling = false;
	if(timer){
		clearTimeout(timer);
		timer = null;
	}
});

rtcHelper.render(app);
