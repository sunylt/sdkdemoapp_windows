import React from "react";
import { connect } from "react-redux";
import * as actionCreators from "@/stores/actions";
import { utils } from "../../utils/utils";
import { ipcRenderer } from "electron";
import _ from "underscore";

class RtcView extends React.Component {

	state = {
		aoff: false,
		voff: false,
		isShare: false
	}

	sendTextMsg(conversationId, chatType, msg, ext){
		const {
			globals,
			sendMsg,
			userInfo,
			setNotice,
			networkStatus,
			conversations
		} = this.props;
		let me = this;
		if(networkStatus){
			setNotice("网络连接已断开，无法发送消息，请检查网络状态后再次尝试。", "fail");
			return;
		}
		let atListEasemobName = [];
		let atList;
		let conversation;

		let emCallback = globals.emCallback;
		const textMsgBody = new globals.easemob.EMTextMessageBody(msg);
		let sendMessage = globals.easemob.createSendMessage((userInfo && userInfo.user.easemobName), conversationId, textMsgBody);
		let textareaVal = this.input ? this.input.textAreaRef.value : "";
		
		if(ext && Object.keys(ext).length){
			Object.keys(ext).forEach(
				attr => sendMessage[typeof ext[attr] === "object" ? "setJsonAttribute" : "setAttribute"](attr, ext[attr])
			);
		}
		// 群聊需要设置 setChatType(1) 和 setTo(groupId)
		if(chatType == 1){
			if(textareaVal.indexOf("@所有成员") > -1){
				sendMessage.setAttribute("em_at_list", "all");
			}
			else{
				let atMembersOfGroup;
				let admins = globals.groupManager.groupWithId(conversationId).groupAdmins();
				let members = globals.groupManager.groupWithId(conversationId).groupMembers();
				atMembersOfGroup = admins.concat(members);
				_.map(textareaVal.split("@"), function(member){
					atList = _.find(atMembersOfGroup, function(m){
						return m == member.split(" ")[0];
					});
					atList && atListEasemobName.push(`"${atList.id}"`);
				});
				atListEasemobName.length && sendMessage.setJsonAttribute("em_at_list", `[${atListEasemobName}]`);
			}
			sendMessage.setChatType(1);
			sendMessage.setTo(conversationId);
		}

		emCallback.onSuccess(() => {
			console.log("emCallback call back success");
			if(me.cfr){
				console.log(sendMessage);
				console.log(sendMessage.msgId());
				conversation = globals.chatManager.conversationWithType(conversationId, chatType);
				conversation.removeMessage(sendMessage.msgId());
			}
			return true;
		});
		emCallback.onFail((error) => {
			console.log("emCallback call back fail");
			console.log(error.description);
			console.log(error.errorCode);
			return true;
		});
		emCallback.onProgress((progress) => {
			console.log(progress);
			console.log("call back progress");
		});
		sendMessage.setCallback(emCallback);
		globals.chatManager.sendMessage(sendMessage);
		sendMsg({ id: conversationId, msg: sendMessage, conversation: conversations[conversationId] });
	}

	handleAccept = ({ from, conferenceId, isGroupChat }) => {
		// rtc.joinRoom(conferenceId).then(() => {
		// 	this.props.setRtcStatus(2);
		// 	this.sendTextMsg(conversationId, isGroupChat ? 1 : 0, "已接受视频邀请", { conferenceNotice: 2 });
		// });
		const me = this;
		const { userInfo, globals } = this.props;
		const loginInfo = globals.emclient.getLoginInfo();
		const chatConfig = globals.emclient.getChatConfigs();
		
		utils.initRtcWindow({
			userId: userInfo.user.easemobName,
			userName: userInfo.userData.name,
			imAppKey: chatConfig.getAppKey(),
			imToken: loginInfo.loginToken
		}).then((rtcWin) => {
			rtcWin.webContents.send("rtc-join-room", { roomId: conferenceId });
			ipcRenderer.once("rtcJoinRoomSuccess", () => {
				me.props.setRtcStatus(2);
				me.sendTextMsg(from, isGroupChat ? 1 : 0, "已接受视频邀请", {
					conferenceNotice: 2
				});
			});
		});
	}

	handleRefuse = ({ from, isGroupChat }) => {
		const { data } = this.props.rtcInfo;
		this.props.setRtcStatus(0);
		this.sendTextMsg(from, isGroupChat ? 1 : 0, "拒绝视频邀请", {
			conferenceNotice: 3,
			conferenceId: data.conferenceId
		});
	}

	handleLeaveRoom = (closeRtcWindow) => {
		const { status, data } = this.props.rtcInfo;

		if(status == 1){
			this.sendTextMsg(data.invitee, data.chatType, "取消音视频", {
				conferenceNotice: 4,
				conferenceId: data.conferenceId,
				isGroupChat: !!data.chatType,
				fromNickName: data.fromNickName
			});
		}
		this.props.setRtcStatus(0);
		this.props.setRtcData({});
		closeRtcWindow && ipcRenderer.send("close-rtc-window");
	}

	// handleDestroyRoom = () => {
	// 	rtc.service.exit(true);
	// }

	// handleShareDesktopToggle = () => {
	// 	rtc.shareDesktopToggle();
	// }

	// handleToggleVideo = () => {
	// 	const result = rtc.toggleVideo();
	// 	this.setState({
	// 		voff: result
	// 	});
	// }

	// handleToggleAudio = () => {
	// 	const result = rtc.toggleAudio();
	// 	this.setState({
	// 		aoff: result
	// 	});
	// }

	componentDidMount = () => {
		// const { easemobName } = this.props.userInfo.user;
		// const { rtcAppId, rtcAppKey, rtcServer } = utils.getServerConfig();
		// rtc.init({ userId: easemobName, rtcAppId, rtcAppKey, rtcServer });
		// rtc.render(document.querySelector(".rtc-meeting-view"));
		ipcRenderer.on("rtc-clear-data", () => this.handleLeaveRoom(true));
		ipcRenderer.on("rtc-window-closed", () => this.handleLeaveRoom(false));
	}
	componentWillUnmount(){
		ipcRenderer.removeAllListeners("rtc-clear-data");
		ipcRenderer.removeAllListeners("rtc-window-closed");
	}
	render(){
		// console.log("rtc-view>>>", this.props);
		const { rtcInfo } = this.props;
		// const { voff, aoff } = this.state;
		return (
			<div style={ { display: !rtcInfo.status ? "none" : "block" } }>
				{
					rtcInfo.status === 3 ? <div className="rtc-invite-view">
						<p>{rtcInfo.data.fromNickName} 邀请您进行音视频通话</p>
						<button onClick={ () => this.handleRefuse(rtcInfo.data) }>拒绝</button>
						<button onClick={ () => this.handleAccept(rtcInfo.data) }>接听</button>
					</div> : ""
				}
			</div>);
	}
}

const mapStateToProps = state => ({
	globals: state.globals,
	networkStatus: state.networkConnection,
	conversations: state.conversations,
	rtcInfo: state.rtcInfo,
	userInfo: state.userInfo
});
const mapActionToProps = dispatch => ({
	setRtcStatus: status => dispatch(actionCreators.setRtcStatus(status)),
	setRtcData: status => dispatch(actionCreators.setRtcData(status)),
	sendMsg: payload => dispatch(actionCreators.sendMsg(payload)),
	setNotice: payload => dispatch(actionCreators.setNotice(payload))
});
export default connect(mapStateToProps, mapActionToProps)(RtcView);
