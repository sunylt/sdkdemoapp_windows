import React, { Component } from "react";
import { connect } from "react-redux";
import {
	Icon,
	Menu,
	Dropdown,
	Modal,
	Button,
	Form,
	Input,
	Upload
} from "antd";
import * as actionCreators from "@/stores/actions";
import * as selectors from "@/stores/selectors";
import HeadImageView from "@/views/common/head_image";
import AvatarImage from "../chats/contacts/AvatarImage";
import DataBase from "../../utils/db";
import { withRouter } from "react-router-dom";
import CreateGroupView from "../chats/groups/group_create";
import { Tabs } from "antd";
var _const = require("@/views/common/domain");
const { ipcRenderer } = require("electron");
const FormItem = Form.Item;
const { TabPane } = Tabs;

function parseKw(str, kw){
	return str.replace(kw, `<em>${kw}</em>`);
}

// class FormInput extends Component {

// 	constructor(props){
// 		super(props);
// 		this.handleSubmit = this.handleSubmit.bind(this);
// 		const { userInfo } = this.props.reduxProps;
// 		this.state = {
// 			realName: userInfo.user.realName || userInfo.user.username || userInfo.user.easemobName,
// 			mobilephone: userInfo.user.mobilephone,
// 			email: userInfo.user.email,
// 		};
// 	}

// 	handleSubmit(e){
// 		const { userInfo, globals } = this.props.reduxProps;
// 		const avatar = this.props.avatar;
// 		const handleCancel = this.props.event;
// 		var tenantId = userInfo.user.tenantId;
// 		var userId = userInfo.user.id;
// 		e.preventDefault();
// 		this.props.form.validateFields((err, values) => {
// 			if(!err){
// 				values.image = avatar;
// 				handleCancel();
// 			}
// 		});
// 	}

// 	render(){
// 		const { getFieldDecorator } = this.props.form;
// 		return (
// 			<Form onSubmit={ this.handleSubmit } hideRequiredMark={true}>
// 				<FormItem
// 					label="用户名:"
// 					labelCol={ { span: 7 } }
// 					wrapperCol={ { span: 17 } }
// 				>
// 				<a >&nbsp;&nbsp;{this.state.realName}</a>
// 				</FormItem>
// 				<FormItem
// 					wrapperCol={ { span: 4, offset: 9 } }
// 				>
// 					<Button type="primary" htmlType="submit">
// 						保存
// 					</Button>
// 				</FormItem>
// 			</Form>
// 		);
// 	}

// }

// const WrappedApp = Form.create()(FormInput);

class TopNav extends Component {
	constructor(props){
		super(props);
		this.handleClick = this.handleClick.bind(this);
		this.showModal = this.showModal.bind(this);
		this.handleOk = this.handleOk.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.handlePreviewAvatar = this.handlePreviewAvatar.bind(this);
		this.handleChangeAvatar = this.handleChangeAvatar.bind(this);
		this.handleCancelAvatar = this.handleCancelAvatar.bind(this);
		const { userInfo,  allGroupChats, globals} = this.props;
		this.state = {
			visible: false,
			previewVisible: false,
			previewImage: "",
			fileList: [
				{
					uid: -1,
					name: "",
					status: "done",
					url: ""
				}
			],
			users: [],
			groups: [],
			kw: "",
			showUserProfile: false
		};
		const allGroups = allGroupChats.allGroups || [];
		this.allGroups = allGroups.map((groupId) => {
			const groupManager = globals.groupManager;
			const group = groupManager.groupWithId(groupId);
			return {
				id: groupId,
				name: group.groupSubject()
			};
		});
	}

	handlePreviewAvatar(file){
		this.setState({
			previewImage: file.url || file.thumbUrl,
			previewVisible: true,
		});
	}

	handleChangeAvatar({ fileList, file }){
		const { setNotice, userInfo } = this.props;
		this.setState({ fileList });
		if(file.status == "done"){
			this.setState({ avatarUrl: file.response.url });
		}
		else if(file.status == "error"){
			if(file.error.status == 413){
				setNotice("上传失败，上传头像过大", "fail");
				this.setState({ fileList: [
					{
						uid: -1,
						name: "",
						status: "done",
						url: this.imgUrl(userInfo.user.image),
					}
				] });
			}
		}
	}

	handleCancelAvatar(){
		this.setState({ previewVisible: false });
	}

	showModal(){
		this.setState({
			visible: true,
		});
	}

	handleOk(e){
		this.setState({
			visible: false,
		});
	}

	handleCancel(e){
		this.setState({
			visible: false,
		});
	}

	handleClick(e){
		const { globals, logout } = this.props;
		var emclient = globals.emclient;
		switch(e.key){
		case "personal":
			this.showModal();
			break;
		case "changePwd":
			emclient.logout();
			logout();
			break;
		case "cancellation":
			emclient.getChatManager().clearListeners();
			//emclient.getGroupManager().clearListeners();
			emclient.logout();
			this.props.history.push('/index');
			logout();
			localStorage.clear();
			break;
		case "logout":
			emclient.logout().then((res) => {
				logout();
			})
			
			break;
		default:
			break;
		}
	}

	handleShowSettings = () => {

	}

	handleLogout = () => {
		const { globals, logout } = this.props;
		const emclient = globals.emclient;
		emclient.getChatManager().clearListeners();
		emclient.getGroupManager().clearListeners();
		emclient.logout();
		this.props.history.push("/index");
		logout();
		localStorage.clear();
	}

	handleSearch = (e) => {
		const { allUsers } = this.props;
		const allGroups = this.allGroups;
		const kw = e.target.value.trim();
		if(kw.length){
			const users = Object.values(allUsers).filter(item => item.name.includes(kw) || item.userName.includes(kw));
			const groups = allGroups.filter(group => group.id.includes(kw) || group.name.includes(kw));
			this.setState({ users, groups, kw });
		}
		else{
			this.setState({ users: [], groups: [], kw: "" });
		}
	}

	imgUrl(imgUrl){
		// const { imgUrl } = this.props;
		if(!imgUrl){
			return require("@/views/config/img/default_avatar.png");
		}
		else if(imgUrl.indexOf("http") == 0){
			return imgUrl;
		}
		return `${_const.domain}${imgUrl}`;
	}

	handleToggleUserPofile = (e) => {
		e.stopPropagation();
		this.setState({
			showUserProfile: !this.state.showUserProfile
		});
	}

	componentDidMount(){
		document.body.addEventListener("click", () => {
			this.setState({
				showUserProfile: false
			});
		});
	}

	render(){
		const { users, groups, kw } = this.state;
		const { userInfo, userData } = this.props;
		// const { previewVisible, previewImage, fileList } = this.state;
		const realName = userData.name || userData.userName;
		// const menu = (
		// 	<Menu onClick={ this.handleClick } style={ { width: 100 } }>
		// 		<Menu.Item key="personal">
		// 			<span>个人资料</span>
		// 		</Menu.Item>
		// 		<Menu.Divider />
		// 		{/* <Menu.Item key="changePwd">
		// 			<span>修改密码</span>
		// 		</Menu.Item> */}
		// 		<Menu.Item key="cancellation">
		// 			<span>注销</span>
		// 		</Menu.Item>
		// 		{/* <Menu.Item key="logout">
		// 			<span>退出</span>
		// 		</Menu.Item> */}
		// 	</Menu>
		// );
		const userListView = users.map(user => (
			<li key={ user.userName }>
				<AvatarImage name={ user.name } />
				<h5 dangerouslySetInnerHTML={ {__html: parseKw(user.name || user.userName, kw)} } />
				<p dangerouslySetInnerHTML={ {__html: "用户ID：" + parseKw(`${user.userName}`, kw)} }  />
			</li>
		));
		const groupListView = groups.map(group => (
			<li key={ group.id }>
				<AvatarImage name="群" />
				<h5 dangerouslySetInnerHTML={ {__html: parseKw(group.name, kw)} } />
				<p dangerouslySetInnerHTML={ {__html: "群ID：" + parseKw(`${group.id}`, kw)} }  />
			</li>
		));
		return (
			<div className="nav-user">
				<div className="user-profile">
					<AvatarImage name={ realName } onClick={ this.handleToggleUserPofile } />
					<div className="user-popup" style={ { display: this.state.showUserProfile ? "block" : "none" } } onClick={ e => e.stopPropagation() }>
						<AvatarImage name={ realName } />
						<h4>{ realName }</h4>
						<p>用户ID：{ userData.userName }</p>
						<Button className="btn-settings">偏好设置</Button>
						<Button className="btn-logout" onClick={ this.handleLogout }>退出登陆</Button>
					</div>
				</div>
	
				<div className="search-box">
					<Input
						placeholder="输入内容查询"
						prefix={ <Icon type="search" /> }
						// suffix={suffix}
						// value={userName}
						onChange={ this.handleSearch }
						// ref={node => this.userNameInput = node}
					/>
					<div className="search-result" style={ { display: userListView.length || groupListView.length ? "block" : "none" } }>
						<Tabs defaultActiveKey="1" onChange={ () => {} }>
							<TabPane tab="综合" key="1">
								<div className="search-result-list">
									{ userListView.length ? <h4>联系人</h4> : null }
									<ul>
										{ userListView }
									</ul>
									{ groupListView.length ? <h4>我的群组</h4> : null }
									<ul>
										{ groupListView }
									</ul>
								</div>
							</TabPane>
							<TabPane tab="联系人" key="2">
								<div className="search-result-list">
									<ul>
										{ userListView }
									</ul>
								</div>
							</TabPane>
							<TabPane tab="群组" key="3">
								<div className="search-result-list">
									<ul>
										{ groupListView }
									</ul>
								</div>
							</TabPane>
						</Tabs>
					</div>
				</div>
				{/* <div className="button-add">
					<Icon type="plus" />
				</div> */}
				<CreateGroupView />
			</div>
		);
	}
}

const mapStateToProps = state => ({
	allUnReadMsgCount: selectors.allUnReadMsgCount(state),
	userInfo: state.userInfo,
	globals: state.globals,
	allUsers: state.org.allUsers,
	allGroupChats: state.allGroupChats
});
export default withRouter(connect(mapStateToProps, actionCreators)(TopNav));
