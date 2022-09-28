import EmediaSDK from "@/utils/EmediaSDK";

const LOG_LEVEL = 5;

export default {
	rtcServer: "",
	rtcAppId: "",
	rtcAppKey: "",
	userId: "",
	userSig: "",
	localStream: null,
	localSharedDesktopStream: null,
	currentMainScreenItem: null,
	_isInited: false,
	_handles: {},

	on(eventType, handle){
		this._handles[eventType] = handle;
	},
	off(eventType){
		this._handles.delete(eventType);
	},
	emit(eventType, ...args){
		if(this._handles[eventType]){
			this._handles[eventType].apply(null, args);
		}
	},
	query(selector){
		var root = this.root || document;
		return root.querySelector(selector);
	},
	init({ rtcAppId, rtcAppKey, userId, rtcServer, userSig }){
		if(this._isInited){
			return;
		}
		this.rtcServer = rtcServer;
		this.rtcAppId = rtcAppId;
		this.rtcAppKey = rtcAppKey;
		this.userId = userId;
		this.userSig = userSig;
		this.initRtcSDK();
		this._isInited = true;
	},
	async _fetchUserSig(userId){
		const { rtcServer, rtcAppId, rtcAppKey } = this;
		const userSig = await fetch(`${rtcServer}/management/room/player/usersig?name=${userId}&sdkAppId=${rtcAppId}&sdkAppKey=${rtcAppKey}`)
		.then(res => res.text());
		return userSig;
	},
	async fetchUserSigByIM(){

	},
	async getTicket(roomId){
		const { rtcServer, rtcAppId, userSig, userId } = this;
		const ticket = await fetch(`${rtcServer}/emedia/enter_room?app_id=${rtcAppId}&user_sig=${userSig}&room_id=${roomId}&user_id=${userId}&_=${+new Date()}`)
		.then(res => res.json());
		return ticket;
	},
	createMiniPlayer(id, name){
		if(this.query(`#${id}`)){
			return this.query(`#${id}`);
		}
		const item = document.createElement("div");
		const videoTag = document.createElement("video");
		item.id = id;
		videoTag.autoplay = true;
		videoTag.playsInline = true;
		if(name){
			const nameTag = document.createElement("span");
			nameTag.innerText = name;
			item.appendChild(nameTag);
		}
		item.addEventListener("click", () => {
			this.swithVideoToMain(item.id);
		});
		item.appendChild(videoTag);
		this.videoList.appendChild(item);
		return item;
	},
	removeVideoPlayer(id){
		const videoTag = this.query(`#${id}`);
		if(!videoTag) return;
		this.videoList.removeChild(videoTag);
	},
	swithVideoToMain(id){
		if(this.currentMainScreenItem){
			this.currentMainScreenItem.className = "";
		}
		const item = this.query(`#${id}`);
		item.className = "rtc-fullscreen";
		this.currentMainScreenItem = item;
	},
	pushStream(constaints = {}, success = () => {}, fail = () => {}){
		const _pubS = new this.service.AVPubstream({
			constaints: Object.assign({ audio: true, video: true }, constaints),
			aoff: 0,
			voff: 0
		});
		this.service.openUserMedia(_pubS).then(
			() => this.service.push(_pubS, stream => success(stream), error => fail(error)),
			error => fail(error)
		);
	},
	joinRoom(roomId, constaints = {}){
		return new Promise(async (resolve, reject) => {
			if(!roomId){
				reject({ msg: "roomId error" });
				return;
			}
			if(!this.userSig){
				this.userSig = await this._fetchUserSig(this.userId);
			}
			const result = await this.getTicket(roomId);
			if(result && result.ticket){
				try{
					this.service.setup(result.ticket, this.userExtInfo || {});
					this.service.join(
						() => this.pushStream(constaints, resolve, reject),
						error => reject(error)
					);
				}
				catch(e){
					reject(e);
				}
			}
			else{
				reject({ error: true, msg: "fetch ticket error." });
			}
		});
	},
	leaveRoom(destoryRoom){
		if(this.service){
			this.service.exit(destoryRoom);
		}
	},
	initRtcSDK(){
		const me = this;
		const emedia = window.emedia = new EmediaSDK({
			config: {
				LOG_LEVEL
			}
		});
		this.service = new emedia.Service({
			listeners: {
				onMeExit: me.onMeExit.bind(me),
				onNotifyEvent: me.onNotifyEvent.bind(me),

				onAddMember: me.onAddMember.bind(me),
				onRemoveMember: me.onRemoveMember.bind(me),

				onAddStream: me.onAddStream.bind(me),
				onRemoveStream: me.onRemoveStream.bind(me),
				onUpdateStream: me.onUpdateStream.bind(me)

			}
		});
	},
	onMeExit(...rest){
		console.log("触发onMeExit，原因:", ...rest);
		this.localStream = null;
		this.currentMainScreenItem = null;
		this.videoList.innerHTML = "";
		this.cachedPlayers = [];
		this.emit("exit");
	},
	onNotifyEvent(evt){
		console.log(evt);
	},
	onAddMember(member){
		console.log("add member >>>", member);
		this.emit("addMember", member);
	},
	onRemoveMember(member){
		console.log("remove member >>>", member);
		this.emit("removeMember", member);
	},
	// 流的增加，仅用于统计人数，不处理流
	onAddStream(stream){
		console.log(`stream add >>>> `, stream);
		const nickname = stream.owner.ext.nickname || stream.owner.name;
		this.createMiniPlayer(stream.id, `${nickname}${stream.type ? "的桌面" : ""}`);
		if(stream.located() && stream.type == 0){
			this.swithVideoToMain(stream.id);
		}
	},
	// 某成员的流退出（包含本地流、音视频流，共享桌面等）
	onUpdateStream(stream, updateObj){
		console.log(`stream update >>>> `, stream, updateObj);
		const mediaStream = stream.getMediaStream();
		const videoPlayer = this.query(`#${stream.id} video`);

		// located()=>true 当前用户 type 0 音视频通话 1 桌面共享
		if(stream.located() && stream.type == 0){
			if(!this.localStream){
				this.localStream = stream;
				videoPlayer.srcObject = mediaStream;
				videoPlayer.muted = true; // 自己永远静音
			}
		}
		else{
			videoPlayer.srcObject = mediaStream;
		}
	},
	// 某成员的流退出（包含本地流、音视频流，共享桌面等）
	onRemoveStream(stream){
		console.log("stream remove>>>>", stream);
		if(stream.located()){
			this.localSharedDesktopStream = null;
		}
		this.removeVideoPlayer(stream.id);
	},
	toggleVideo(){
		const stream = this.localStream;
		if(stream){
			this.service.voff(stream, !stream.voff);
			return !!stream.voff;
		}
		return false;
	},
	toggleAudio(){
		const stream = this.localStream;
		if(stream){
			this.service.aoff(stream, !stream.aoff);
			return !!stream.aoff;
		}
		return false;
	},
	shareDesktopToggle(){
		if(navigator.userAgent.includes("Mobile")) return;

		// 无开启的会议
		if(!this.localStream){
			return;
		}
		if(this.localSharedDesktopStream){
			this.localSharedDesktopStream && this.service.hungup(this.localSharedDesktopStream.id);
			return;
		}

		// 配置共享桌面选项
		const shareStream = new this.service.ShareDesktopPubstream({
			voff: 0,
			aoff: 1,
			isAgentShare: true,
			ext: {},
			screenOptions: ["screen", "window", "tab"]
		});

		// 打开设备并推流
		this.service.openUserMedia(shareStream).then(() => {
			this.service.push(shareStream, (localShareStream) => {

				const deskMediaStream = localShareStream.getLocalMediaStream();

				// 监听桌面共享被取消
				deskMediaStream.getVideoTracks()[0].onended = function(){
					this.service.hungup(localShareStream.id);
				};

				this.localSharedDesktopStream = localShareStream;
			}, (error) => {
				console.error("Push shareStream error.", error);
			});
		}, (error) => {
			console.log(error);
		});
	},
	render(rootEle){
		this.root = rootEle;
		this.videoList = document.createElement("div");
		this.videoList.id = "rtc-member-list";
		this.root.appendChild(this.videoList);
	}
};
