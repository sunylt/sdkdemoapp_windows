import React from "react";
import ReactDOM from "react-dom";
import { ipcRenderer, remote } from "electron";
import rtcHelper from "./utils/rtc-helper";
import "./style/rtc.scss";
import { Icon } from "antd";


console.log("rtcWindow", +new Date());

window.rtcHelper = rtcHelper;

ipcRenderer.on("rtcInitData", (event, data) => {
	console.log("rtcInitData", data);
	rtcHelper.init(data);
});

ipcRenderer.on("test", (event, data) => {
	console.log("test", data);
});

const tipStyle = {
	position: "relative",
	zIndex: 111,
	textAlign: "center",
	paddingTop: "30px",
	color: "#fff",
	textShadow: "1px 1px 3px rgba(0,0,0,.8)"
};

const InviteInfo = ({ name }) => <div id="rtc-invite-tip" style={ tipStyle }>正在邀请 {name} 进行视频通话</div>;

class RtcView extends React.Component {
	state = {
		isCalling: false,
		invitee: "", // 被邀请人
		voff: false, // 画面关闭
		aoff: false // 静音
	}
	handleLeave = () => {
		rtcHelper.service && rtcHelper.service.exit();
		remote.getCurrentWindow().getParentWindow().webContents.send("leaveRtcRoom");
		this.setState({
			isCalling: false
		});
	}
	handleToggleVideo = () => {
		const result = rtcHelper.toggleVideo();
		this.setState({
			voff: result
		});
	}

	handleToggleAudio = () => {
		const result = rtcHelper.toggleAudio();
		this.setState({
			aoff: result
		});
	}
	componentDidMount = () => {

		console.log("rtcView did mout >>>>", +new Date());
		// window.onbeforeunload = (e) => {
		// 	console.log("I do not want to be closed");
		// 	// eslint-disable-next-line no-alert
		// 	const closeWindow = window.confirm("关闭窗口并退出房间，确认？");
		// 	// 与通常的浏览器不同,会提示给用户一个消息框,
		// 	//返回非空值将默认取消关闭
		// 	//建议使用对话框 API 让用户确认关闭应用程序.
		// 	e.returnValue = false;
		// };
		ipcRenderer.on("leaveRoom", () => {
			this.setState({ isCalling: false });
			rtcHelper.service && rtcHelper.service.exit();
			ipcRenderer.send("closeRtcWindow");
		});

		ipcRenderer.on("joinRoom", (event, { roomId, invitee }) => {
			console.log("joinRoom>>>>>");
			
			if(this.state.isCalling){
				return;
			}

			this.setState({
				voff: false,
				aoff: false
			});

			rtcHelper.joinRoom(roomId)
			.then(() => console.log("join room success"))
			.catch((e) => {
				console.error("join room error", e);
				this.setState({ isCalling: false });
			});

			this.setState({ invitee, isCalling: true });
		});

		rtcHelper.on("onAddMember", (member) => {
			console.log("member joined", member);
			this.setState({ invitee: "" });
		});

		rtcHelper.render(document.getElementById("rtc-view-container"));
		
	}
	render(){
		const { invitee, aoff, voff } = this.state;
		return (
			<div id="rtc-view-container">
				{invitee ? <InviteInfo name={ invitee } /> : null}
				<div id="rtc-toolbar">
					<i className={ `iconfont ${aoff ? "icon-audiostatic" : "icon-audio"}` } onClick={ this.handleToggleAudio }></i>
					<i className={ `iconfont ${voff ? "icon-videoOff" : "icon-video"}` } onClick={ this.handleToggleVideo }></i>
					<i className="iconfont icon-iconfontphone" onClick={ this.handleLeave }></i>
				</div>
			</div>
		);
	}
}

ReactDOM.render(<RtcView />, document.getElementById("app"));
