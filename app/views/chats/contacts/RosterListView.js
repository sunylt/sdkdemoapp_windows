
import React, { PureComponent } from "react";
import * as actionCreators from "@/stores/actions";
import ROUTES from "../../common/routes";
import { pinyin } from "pinyin-pro";
import AvatarImage from "./AvatarImage";
import { Button } from "antd";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

const AZ = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "others"];
const CARD_W = 240;
const CARD_H = 180;
const ST = 10;

class RosterListView extends PureComponent {
	state = {
		selectedUser: {},
		x: 0,
		y: 0
	}

	handleShowUserInfo = (user, e) => {
		e.nativeEvent.stopImmediatePropagation();
		const { outerWidth, outerHeight } = window;
		if(this.state.selectedUser.id){
			this.setState({
				selectedUser: {}
			});
			return;
		}
		console.log("actived user info>>", user);
		this.setState({
			selectedUser: user,
			x: e.pageX + CARD_W > outerWidth ? outerWidth - CARD_W - ST : e.pageX,
			y: e.pageY + CARD_H > outerHeight ? outerHeight - CARD_H - ST  : e.pageY
		});
	}

	handleSendMessage = () => {
		console.log(this.props);
		const { userName, name } = this.state.selectedUser;
		const {
			globals,
			selectMember,
			msgsOfConversation,
			conversationOfSelect,
			selectNavAction,
			setSelectConvType
		} = this.props;
		var conversation = globals.chatManager.conversationWithType(userName, 0);
		var messages = conversation.loadMoreMessagesByMsgId("", 20,0);
		var extInfo = {
			userid: userName,
			name: name
		};
		// // 设置扩展消息
		conversation.setExtField(JSON.stringify(extInfo));
		conversationOfSelect(userName);
		msgsOfConversation({ id: userName, msgs: messages, conversation });
		setSelectConvType(0);
		selectNavAction(ROUTES.chats.recents.__);
	}

	sortByPinyin = (users) => {
		const _users = {};
		AZ.forEach((w) => { _users[w] = []; });
		users.forEach((item) => {
			const w = pinyin(item.name.trim().charAt(0).toLowerCase(), { toneType: "none" }).charAt(0);
			if(w in _users){
				_users[w].push(item);
			}
			else{
				_users["others"].push(item);
			}
		});
		return _users;
	}

	handleBodyClick = () => {
		if(this.state.selectedUser.id){
			this.setState({
				selectedUser: {}
			});
		}
	}

	handleUserCard = (e) => {
		e.stopPropagation();
	}

	componentWillUnmount(){
		document.body.removeEventListener("click", this.handleBodyClick);
	}

	componentDidMount(){
		document.body.addEventListener("click", this.handleBodyClick);
	}

	renderUserListSort(users){
		const _users = this.sortByPinyin(users);
		const listView = [];
		AZ.forEach((letter) => {
			if(_users[letter] && _users[letter].length){
				listView.push(<li key={ letter } className="letter-space">{letter === "others" ? "其他" : letter.toUpperCase()}</li>);
				_users[letter].forEach((user) => {
					listView.push(<li key={ user.id } onClick={ e => this.handleShowUserInfo(user, e) }><AvatarImage name={ user.name.trim() } />{user.name.trim()}</li>);
				});
			}
		});
		return listView;
	}

	renderUserList(users){
		return users.map(user => <li key={ user.id } onClick={ e => this.handleShowUserInfo(user, e) }><AvatarImage name={ user.name.trim() } />{user.name.trim()}</li>);
	}

	render(){
		const { selectedUser, x, y } = this.state;
		const { users, sort } = this.props;
		
		return (
			<React.Fragment>
				{
					users.length ?
						<ul className="roster-list">
							{sort ? this.renderUserListSort(users) : this.renderUserList(users)}
						</ul>
						:
						null
				}
				<div className="user-card" style={ { left: x, top: y, display: `${selectedUser.id ? "block" : "none"}` } } onClick={ this.handleUserCard }>
					<div>
						<AvatarImage name={ selectedUser.name } />
						<h4>{selectedUser.name}</h4>
						<p>用户ID：{selectedUser.userName}</p>
					</div>
					<Link to={ ROUTES.chats.recents.__ }>
						<Button type="primary" onClick={ () => this.handleSendMessage() }>发消息</Button>
					</Link>
				</div>
			</React.Fragment>
		);
	}
}

export default connect(state => ({ globals: state.globals }), actionCreators)(RosterListView);
