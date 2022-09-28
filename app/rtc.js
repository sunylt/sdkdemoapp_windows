import { ipcRenderer, remote } from "electron";
import rtcHelper from "./utils/rtc-helper";
import "./style/rtc.scss";

const mainWindow = remote.getCurrentWindow().getParentWindow();
const app = document.getElementById("app");
const tip = document.getElementById("rtc-invitee-tip");
const txt = "正在邀请 $invitee 进行视频通话";
let userCount = 0;
let isCalling = false;

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

ipcRenderer.on("rtcInitData", (event, data) => {
	console.log("rtcInitData", data);
	rtcHelper.init(data);
});

ipcRenderer.on("leaveRoom", () => {
	console.log("leaveRoom");
	rtcHelper.leaveRoom();
});

ipcRenderer.on("joinRoom", (event, { roomId, invitee }) => {
	if(isCalling){
		return;
	}
	rtcHelper.joinRoom(roomId)
	.then(() => {
		if(invitee){
			tip.innerText = txt.replace("$invitee", invitee);
			tip.style.display = "block";
		}
		mainWindow.webContents.send(invitee ? "rtcInviteJoinSuccess" : "rtcJoinRoomSuccess");
	})
	.catch((e) => {
		console.error("join room error", e);
		// eslint-disable-next-line no-alert
		alert(`${invitee ? "无法邀请" : "加入失败"}，请检查摄像头或重试`);
		ipcRenderer.send("closeRtcWindow");
		isCalling = false;
	});
	isCalling = true;
});

rtcHelper.on("addMember", () => {
	userCount++;
	tip.style.display = "none";
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
	mainWindow.webContents.send("leaveRtcRoom");
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
	mainWindow.webContents.send("leaveRtcRoom");
	isCalling = false;
});

rtcHelper.render(app);
