import React, { Component } from "react";
import { connect } from "react-redux";
import { Menu } from "antd";
import { withRouter, Route, Link, NavLink } from "react-router-dom";
import * as actionCreators from "@/stores/actions";
import _ from "underscore";
import HeadImageView from "@/views/common/head_image";
import AddGroup from "./add_group";
import routes from "../../common/routes";
import AvatarImage from "../contacts/AvatarImage";
const SubMenu = Menu.SubMenu;

// const NavLink = ({ item }) => (
// 	<Menu.Item key={ item.id }> {item.orgName || item.realName} </Menu.Item>
// );

class GroupList extends Component {
	constructor(props){
		super(props);
		this.state = {
			openKeys: [],
			currentMenuId: 0
		};
		this.handleClick = this.handleClick.bind(this);
		// this.handleOpenChange = this.handleOpenChange.bind(this);
	}


	// const {
	// 	globals,
	// 	selectGroup,
	// 	msgsOfConversation,
	// 	conversationOfSelect,
	// 	selectNavAction,
	// 	setSelectConvType
	// } = this.props;
	// var groupInfo;
	// var conversation = globals.chatManager.conversationWithType(selectGroup.easemobGroupId, 1);
	// var messages = conversation.loadMoreMessagesByMsgId("", 20,0);
	// // var extInfo = {
	// // 	avatar: selectMember.image,
	// // 	nick: selectMember.realName,
	// // 	userid: selectMember.id
	// // };
	// // // // 设置扩展消息
	// // conversation.setExtField(JSON.stringify(extInfo));

	// // 从 sdk 获取群主及群成员列表更新 reducer
	// var group = globals.groupManager.groupWithId(selectGroup.easemobGroupId);
	// groupInfo = {
	// 	owner: group.groupOwner(),
	// 	members: group.groupMembers(),
	// 	adminMembers: group.groupAdmins()
	// };

	// conversationOfSelect(selectGroup.easemobGroupId);
	// msgsOfConversation({ id: selectGroup.easemobGroupId, msgs: messages, conversation });

	// selectNavAction(ROUTES.chats.recents.__);
	// setSelectConvType(1);

	handleClick(groupId){
		const { chatManager } = this.props.globals;
		const { selectOfGroup, conversationOfSelect, msgsOfConversation, selectNavAction, setSelectConvType, history } = this.props;
		const  conversation = chatManager.conversationWithType(groupId, 1);
		const messages = conversation.loadMoreMessagesByMsgId("", 20, 0);


		conversationOfSelect(groupId);
		msgsOfConversation({ id: groupId, msgs: messages, conversation });
		selectOfGroup({
			easemobGroupId: groupId
		});
		setSelectConvType(1);
		selectNavAction(routes.chats.recents.__);
		history.push(routes.chats.recents.__);
	}

	render(){
		const {
			selectGroup,
			networkConnection,
			allGroupChats,
			globals
		} = this.props;
		let arrGroupChats = allGroupChats.allGroups || [];
		const groupListItem = arrGroupChats.map((groupId) => {
			var groupManager = globals.groupManager;
			var group = groupManager.groupWithId(groupId);
			console.log(group);
			return (
				<li key={ groupId } onClick={ () =>  this.handleClick(groupId) }>
					<AvatarImage name={ "群" } />
					<div className="item-top">
						<span className="ellipsis item-name">{ group.groupSubject() }</span>
						<p>{group.groupDescription()}</p>
					</div>
				</li>);
		});
		return (
			<div className="group-list">
				{/* <AddGroup /> */}
				{
					networkConnection
						? <div className="network-state">网络连接已断开</div>
						: null
				}
				{
					groupListItem.length ? <ul>{ groupListItem }</ul> : <div className="tip-add-group">暂无群组，可在右上角点击 + 添加</div>
				}
				{/* <Menu
					onClick={ this.handleClick }
					style={ { border: "none" } }
					selectedKeys={ selectGroup.easemobGroupId ? [selectGroup.easemobGroupId] : [] }
					// mode="inline"
				>
					{
						arrGroupChats.map((groupId) => {
							var groupManager = globals.groupManager;
							var group = groupManager.groupWithId(groupId);
							return (
								<Menu.Item key={ group.groupId() }>
									<HeadImageView
										name={ group.groupSubject() }
									/>
									<div className="item-top">
										<span className="ellipsis item-name">{ group.groupSubject() }</span>
										<p>{ group.groupMembersCount() }人</p>
									</div>
								</Menu.Item>);
						})
					}
				</Menu> */}
			</div>
		);
	}
}

const mapStateToProps = state => ({
	selectGroup: state.selectGroup,
	networkConnection: state.networkConnection,
	allGroupChats: state.allGroupChats,
	globals: state.globals
});
export default withRouter(connect(mapStateToProps, actionCreators)(GroupList));
