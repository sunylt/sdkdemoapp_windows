import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Spin, Icon } from "antd";
import * as actionCreators from "@/stores/actions";
import * as selectors from "@/stores/selectors";
import Login from "./form";
import restServer, { getQRcode, getQRLoginStat } from "@/utils/api";
import QRCode from "qrcode";
const { ipcRenderer } = require("electron");

class LoginView extends PureComponent {
	constructor(props){
		super(props);
		this.state = {
			loginWithQrc: false,
			qrCode: "",
			expireTime: 0,
			qrCodeStat: 0, // 0无意义 1扫过 2登陆 -1过期 3手机端取消登陆
		};
		this.handleRender = this.handleRender.bind(this);
	}

	handleRender(){
		ipcRenderer.on("message", (event, { message, data, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate }) => {
			console.log(message, data);
			switch(message){
			case "isUpdateNow":
				console.log(message, data, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate);
				ipcRenderer.send("updateNow");
				break;
			default:
				break;
			}
		});
	}

	doLogin = (userName, password, appkey) => {
		const userInfo = {
			user: {
				easemobName: userName,
				id: 1,
				easemobPwd: password,
				os: "PC",
				appkey,
				tenantId: 9,
				image: ""
			}
		};
		console.log("qrcode doLogin", this);
		if(navigator.onLine){
			localStorage.setItem("userInfo", JSON.stringify(userInfo));
			this.props.requestLogin(userInfo);
			this.props.history.push("/chats/recents");
			console.log("push router to login");
		}
	}

	renderQRCode = (qrCode) => {
		const data = `${restServer}/qrCode/${qrCode}`;
		clearInterval(this._interval);
		QRCode.toCanvas(document.getElementById("c-qrcode"), data, (error) => {
			if(error){
				console.error(error);
			}
			else{
				console.log("success!");
				this._interval = setInterval(() => {
					if(this.state.expireTime <= +new Date()){
						clearInterval(this._interval);
						this.setState({ qrCodeStat: -1 });
						return;
					}
					getQRLoginStat(qrCode).then((_res) => {
						const res = _res.length ? JSON.parse(_res) : {};
						console.log("qrCode state>>", res);
						if(res && res.state == "1"){
							// 用户扫描成功
							this.setState({ qrCodeStat: 1 });
						}
						else if(res.state == "2" && res.userName && res.orgName && res.appName){
							// 用户确认登陆，stop interval and doLoign
							clearInterval(this._interval);
							this.doLogin(res.userName, res.password, `${res.orgName}#${res.appName}`);
						}
						else if(res.state == "3"){
							clearInterval(this._interval);
							this.setState({ qrCodeStat: 3 });
						}
					});
				}, 2000);
			}
		});
	}

	updateQRCode = () => {
		getQRcode().then((res) => {
			this.setState({
				loginWithQrc: res,
				qrCode: res.qrCode,
				expireTime: res.expireAt,
				qrCodeStat: 0
			});
			this.renderQRCode(res.qrCode);
		}).catch((e) => {
			console.error("QR code request error.", e);
			this.props.setNotice("当前服务不支持扫码登录", "fail");
		});
	}

	handleToggleQRcode = () => {
		const checked = !this.state.loginWithQrc;
		if(checked){
			console.log(this.state.expireTime, new Date().getTime());
			if(this.state.qrCode && this.state.expireTime > new Date().getTime() && this.state.qrCodeStat !== 1){
				this.setState({
					loginWithQrc: checked
				});
				this.renderQRCode(this.state.qrCode);
				return;
			}
			this.updateQRCode();
		}
		else{
			this.setState({
				loginWithQrc: checked
			});
			clearInterval(this._interval);
		}
	}

	render(){
		const { areRequestsPending } = this.props;
		const { loginWithQrc, expireTime, qrCodeStat, qrCode } = this.state;
		const isExpired = qrCodeStat == -1 || (loginWithQrc && expireTime && new Date().getTime() > expireTime);
		return (
			<div className="login-container">
				{/* {
					this.handleRender()
				} */}

				{/* 为了做一个拖动区域 */}
				<div className="login-drag">
					<div className="logo-home"></div>
				</div>
				<div className="oa-login">
					{/* <div className="login-logo">
						<img src={ require(`@/views/config/img/logo.png`) } />
					</div> */}
					<div className="app-login center-content">
						<span className="btn-qrcode" onClick={ this.handleToggleQRcode }>{ !loginWithQrc ? "二维码" : "返回" }</span>
						<section style={ { display: loginWithQrc ? "none" : "block" } }>
							<Login {...this.props}/>
							{
								areRequestsPending
									? <Spin tip="Loading..." />
									: null
							}
						</section>
						<section className="login-qrcode" style={ { display: loginWithQrc ? "block" : "none" } }>
							<h4>请扫码登陆</h4>
							<canvas id="c-qrcode" style={ { display: qrCodeStat > 0 ? "none" : "initial" } }></canvas>
							{qrCode && qrCodeStat <= 0 && expireTime >= +new Date() ? <div className="scan-info"><span className="ico-phone"></span><br />打开手机客户端<br />消息-右上角 + 号扫一扫</div> : ""}
							{qrCodeStat == 1 && <div className="scan-success"><span className="ico-phone"></span><p>扫码成功<br />请在手机上<em>确认登陆</em></p><span className="cancel-login">取消登陆</span></div>}
							{qrCodeStat == 3 && <div>已取消登陆操作 <span onClick={ () => this.updateQRCode() }>刷新</span></div>}
							{isExpired && <div>二维码已过期，请<span onClick={ () => this.updateQRCode() }>刷新</span></div>}
						</section>
					</div>
				</div>
			</div>
		);
	}
}
const mapStateToProps = state => ({
	loginState: state.userInfo,
	loginRequest: selectors.getRequest(state, "login"),
	areRequestsPending: selectors.areRequestsPending(selectors.getRequests(state)),
});
export default connect(mapStateToProps, actionCreators)(LoginView);
