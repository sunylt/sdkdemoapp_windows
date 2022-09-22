import React from "react";
import { connect } from "react-redux";
import * as actionCreators from "@/stores/actions";
import { utils } from "../../utils/utils";
import rtc from "../../utils/rtc-helper";

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

	handleAccept = ({ conferenceId, conversationId, isGroupChat }) => {
		rtc.joinRoom(conferenceId).then(() => {
			this.props.setRtcStatus(2);
			this.sendTextMsg(conversationId, isGroupChat ? 1 : 0, "已接受视频邀请", { conferenceNotice: 2 });
		});
	}

	handleRefuse =  ({ conferenceId, conversationId, isGroupChat }) => {
		this.props.setRtcStatus(0);
		this.sendTextMsg(conversationId, isGroupChat ? 1 : 0, "拒接接受视频邀请", { conferenceNotice: 3 });
	}

	handleLeaveRoom = ({ invitee, chatType, conferenceId, fromNickName }) => {
		rtc.service.exit();
		if(this.props.rtcInfo.status == 1){
			this.sendTextMsg(invitee, chatType, "取消音视频", {
				conferenceNotice: 4,
				conferenceId,
				isGroupChat: !!chatType,
				fromNickName
			});
		}

		// eslint-disable-next-line no-invalid-this
		this.props.setRtcStatus(0);
	}

	handleDestroyRoom = () => {
		rtc.service.exit(true);
	}

	handleShareDesktopToggle = () => {
		rtc.shareDesktopToggle();
	}

	handleToggleVideo = () => {
		const result = rtc.toggleVideo();
		// eslint-disable-next-line no-invalid-this
		this.setState({
			voff: result
		});
	}

	handleToggleAudio = () => {
		const result = rtc.toggleAudio();
		// eslint-disable-next-line no-invalid-this
		this.setState({
			aoff: result
		});
	}

	componentDidMount(){
		const { easemobName } = this.props.userInfo.user;
		const { rtcAppId, rtcAppKey, rtcServer } = utils.getServerConfig();
		rtc.init({ userId: easemobName, rtcAppId, rtcAppKey, rtcServer });
		rtc.render(document.querySelector(".rtc-meeting-view"));
	}
	render(){
		console.log("rtc-view>>>", this.props);
		const { rtcInfo } = this.props;
		const { voff, aoff } = this.state;
		return (
			<div style={ { display: !rtcInfo.status ? "none" : "block" } }>
				{
					rtcInfo.status === 3 ? <div className="rtc-invite-view">
						<p>{rtcInfo.data.fromNickName} 邀请您进行音视频通话</p>
						<button onClick={ () => this.handleRefuse(rtcInfo.data) }>拒绝</button>
						<button onClick={ () => this.handleAccept(rtcInfo.data) }>接听</button>
					</div> : ""
				}
				<div className="rtc-meeting-view" style={ { display: [1, 2].includes(rtcInfo.status) ? "block" : "none" } }>
					{rtcInfo.status === 1 ? <div className="invite-tip">正在邀请 {rtcInfo.data.invitee} 进行音视频通话</div> : ""}
					<div id="rtc-toolbar">
						<button onClick={ this.handleToggleAudio }>{aoff ? "取消" : ""}静音</button>
						<button onClick={ this.handleToggleVideo }>{voff ? "打开" : "关闭"}图像</button>
						<button onClick={ this.handleShareDesktopToggle }>共享/停止桌面</button>
						<button onClick={ () => this.handleLeaveRoom(rtcInfo.data) }>挂断</button>
						{/* <button onClick={ this.handleDestroyRoom }>解散会议</button> */}
					</div>
				</div>
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
	sendMsg: payload => dispatch(actionCreators.sendMsg(payload)),
	setNotice: payload => dispatch(actionCreators.setNotice(payload))
});
export default connect(mapStateToProps, mapActionToProps)(RtcView);

// class RtcInviteView extends React.Component {
	
// 	componentDidMount(){
// 		const { username, token } = this.props;
// 		rtc.init(username, token);
// 	}

// 	accept = () => {
// 		const _this = this;
// 		const { rtcInfo } = rtc;
// 		_this.props.hideInviteView();
// 		document.querySelector("#emedia-iframe-wrapper").style.display = "flex";
// 		rtc.joinConference(() => {
// 			if(!rtcInfo.isGroupChat){
// 				_this.props.sendTxtMessage(rtcInfo.isGroupChat ? "groupchat" : "chat", rtcInfo.fromNickName, {
// 					msg: "已接受音视频邀请",
// 					ext: {
// 						conferenceNotice: 2
// 					}
// 				});
// 			}
// 		});
// 	}

// 	refuse = () => {
// 		const { isGroupChat, fromNickName } = rtc.rtcInfo;
// 		if(!isGroupChat){
// 			this.props.sendTxtMessage(isGroupChat ? "groupchat" : "chat", fromNickName, {
// 				msg: "拒绝接受音视频",
// 				ext: {
// 					conferenceNotice: 3
// 				}
// 			});
// 		}
// 		this.props.hideInviteView();
// 	}

// 	cancel = () => {
// 		const me = this;
// 		const { userId, chatType } = rtc.inviteeInfo;
// 		this.props.sendTxtMessage(chatType, userId, {
// 			msg: "取消音视频",
// 			ext: {
// 				conferenceNotice: 4,
// 				conferenceId: this.props.username,
// 				isGroupChat: chatType !== "chat",
// 				fromNickName: this.props.username
// 			}
// 		});
// 		rtc.emediaPlugin.exit(true);
// 	}

// 	close = () => {
// 		this.props.rtcStat === 1 ? this.cancel() : this.refuse();
// 		this.props.hideInviteView();
// 	}

// 	render(){
// 		const titleTop = ["", "等待对方接受音视频邀请", "邀请您进行音视频通话"];
// 		return (
// 			<div className="rtc-plugin" style={ { display: [1, 2].includes(this.props.rtcStat) ? "block" : "none" } }>
// 				<div className="webim-rtc-video" style={ { width: "360px", height: "360px" } }>
// 					<span>{titleTop[this.props.rtcStat]}</span>
// 					<i
// 						key="accept" onClick={ this.accept } className="font small accept"
// 						style={ {
// 							display: this.props.rtcStat === 2 ? "block" : "none",
// 							left: "6px",
// 							right: "auto",
// 							top: "auto",
// 							bottom: "6px"
// 						} }
// 					>z</i>
// 					<i
// 						key="close" onClick={ this.close } className="font small close"
// 						style={ { left: "auto", right: "6px", top: "auto", bottom: "6px" } }
// 					>Q</i>
// 				</div>
// 			</div>
// 		);
// 	}
// }

// export default connect(
// 	(state, props) => ({
// 		username: state.login.username,
// 		token: state.login.token,
// 		rtcStat: state.multiAV.rtcStat
// 	}),
// 	dispatch => ({
// 		sendTxtMessage: (chatType, id, message) => dispatch(MessageActions.sendTxtMessage(chatType, id, message)),
// 		hideInviteView: () => dispatch(MultiAVActions.setRtcStat(0)),
// 	})
// )(RtcInviteView)
