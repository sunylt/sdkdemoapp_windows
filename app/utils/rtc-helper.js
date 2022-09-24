import EmediaSDK from "@/utils/EmediaSDK";

export default {
	rtcServer: "",
	rtcAppId: "",
	rtcAppKey: "",
	userId: "",
	userSig: "",
	localStream: null,
	localSharedDesktopStream: null,
	currentMainScreenItem: null,
	cachedPlayers: [],
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
		if(id === "localstream"){
			videoTag.muted = true;
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
		item.className = "mainScreen";
		this.currentMainScreenItem = item;
	},
	pushStream(containts, success = () => {}, fail = () => {}){
		const _pubS = new this.service.AVPubstream({
			containts,
			aoff: 0,
			voff: 0
		});
		this.service.openUserMedia(_pubS).then(
			() => this.service.push(_pubS, stream => success(stream), error => fail(error)),
			error => fail(error)
		);
	},
	joinRoom(roomId){
		return new Promise(async (resolve, reject) => {
			if(!roomId){
				reject({ msg: "roomId error." });
				return;
			}
			if(!this.userSig){
				this.userSig = await this._fetchUserSig(this.userId);
			}
			const result = await this.getTicket(roomId);
			if(result && result.ticket){
				this.service.setup(result.ticket, this.userExtInfo || {});
				this.service.join(
					() => this.pushStream({ audio: true, video: true }, resolve, reject),
					error => reject(error));
			}
			else{
				reject({ error: true, msg: "fetch ticket error." });
			}
		});
	},
	initRtcSDK(){
		const me = this;
		const emedia = window.emedia = new EmediaSDK({
			config: {
				// eslint-disable-next-line no-magic-numbers
				LOG_LEVEL: 5
			}
		});
		this.service = new emedia.Service({
			listeners: {
				onMeExit(...rest){
					console.log("触发onMeExit，原因:", ...rest);
					me.localStream = null;
					me.currentMainScreenItem = null;
					me.videoList.innerHTML = "";
					me.cachedPlayers = [];
					console.log("reset all...");
				},
				onNotifyEvent(evt){
					console.log("event>>>>", evt);
				},
				onAddMember: me.onAddMember.bind(me),
				onRemoveMember: me.onRemoveMember.bind(me),
				onAddStream: me.onAddStream.bind(me),
				onUpdateStream: me.onUpdateStream.bind(me),
				onRemoveStream: me.onRemoveMember.bind(me),
			}
		});
	},
	onAddMember(member){
		console.log("member add>>>>", member);
		const name = member.ext.nickname || member.nickName || member.name || member.memName;
		// 成员播放器创建
		this.createMiniPlayer(member.id, name);
		this.emit("onAddMember", member);
	},
	onRemoveMember(member){
		console.log("member remove>>>>", member);
		this.removeVideoPlayer(member.id);
		this.emit("onRemoveMember", member);
	},
	// 流的增加，仅用于统计人数，不处理流
	onAddStream(stream){
		console.log(this);
		console.log(`${new Date()}stream add >>>> `, stream);
		const nickname = stream.located() ? "我" : stream.owner.ext.nickname || stream.owner.name;
		if(stream.located() && stream.type == 0){
			this.createMiniPlayer("localstream");
			this.swithVideoToMain("localstream");
		}
		// 针对桌面共享单独处理
		if(stream.type == 1){
			this.createMiniPlayer(stream.id, `${nickname}的桌面`);
		}
	},
	// 某成员的流退出（包含本地流、音视频流，共享桌面等）
	onUpdateStream(stream, updateObj){
		console.log(`${new Date()} stream update >>>> `, stream);
		const mediaStream = stream.getMediaStream();

		// type 1 桌面共享
		if(stream.type == 1){
			const videoPlayer = this.query(`#${stream.id} video`);
			videoPlayer.srcObject = mediaStream;

			// 如果localStream还没进来，已加入的成员 player 不调用 play()
			if(this.localStream){
				videoPlayer.play();
			}
			else{
				this.cachedPlayers.push(videoPlayer);
			}
		}

		// type 0 音视频通话
		if(stream.type == 0){

			// located()=>true 当前用户
			if(stream.located()){
				const localPlayer =  this.query("#localstream video");
				console.log(`Play local mediaStream.`, localPlayer);
				if(!this.localStream){ // localstream处理一次即可
					this.localStream = stream;
					localPlayer.srcObject = mediaStream;
					localPlayer.play();
					localPlayer.muted = true; // 自己永远静音
					if(this.cachedPlayers.length){
						this.cachedPlayers.forEach(memberPlayer => memberPlayer.play());
						this.cachedPlayers = [];
					}
				}
			}
			else{
				// 自动播放策略 https://developer.chrome.com/blog/autoplay/
				// TRTC自动播放受限处理建议 https://web.sdk.qcloud.com/trtc/webrtc/doc/zh-cn/tutorial-21-advanced-auto-play-policy.html
				// TRTC微信autoplay问题 https://web.sdk.qcloud.com/trtc/webrtc/doc/zh-cn/tutorial-02-info-webrtc-issues.html#h2-8
				// 实时音视频 TRTC 常见问题汇总---WebRTC篇 https://cloud.tencent.com/developer/article/1539376
				const memberPlayer = this.query(`#${stream.memId} video`);
				console.log(`Play member's mediaStream.`);
				memberPlayer.srcObject = mediaStream;

				// 如果localStream还没进来，已加入的成员 player 不调用 play()
				if(this.localStream){
					memberPlayer.play();
				}
				else{
					this.cachedPlayers.push(memberPlayer);
				}
			}
		}
	},
	// 某成员的流退出（包含本地流、音视频流，共享桌面等）
	onRemoveStream(stream){
		console.log("stream remove>>>>", stream);

		// 桌面共享的流单独处理，因为不会触发onRemoveMember
		if(stream.type == 1){

			// 清除缓存的本地共享流
			if(stream.located()){
				this.localSharedDesktopStream = null;
			}

			this.removeVideoPlayer(stream.id);
		}
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
		if(!this.localStream || this.localSharedDesktopStream){
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
