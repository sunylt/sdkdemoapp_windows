import React, { PureComponent } from "react";
import * as actionCreators from "@/stores/actions";
import { connect } from "react-redux";
import HeadImageView from "@/views/common/head_image";
import { Modal, Switch } from "antd";

class MemberSettingView extends PureComponent {
	constructor(props){
		super(props);
		this.state = {
			checked: false,
			messageClearVisible: false
		};
		this.handleClearRecord = this.handleClearRecord.bind(this);
		this.handleClearMessage = this.handleClearMessage.bind(this);
		this.handleCancelClearMessages = this.handleCancelClearMessages.bind(this);
	}

	handleClearRecord(){
		this.setState({
			messageClearVisible: true
		});
	}

	handleClearMessage(){
		const {
			selectConversationId,
			globals,
			clearAllMessagesAction
		} = this.props;
		var conversation = globals.chatManager.conversationWithType(selectConversationId, 0);
		conversation.clearAllMessages();
		clearAllMessagesAction({ id: selectConversationId });
		this.handleCancelClearMessages();
	}

	handleSetTop = (checked) => {
		const { setTop } = this.props;
		const extField = this.conversation.extField();
		const ext = extField ? JSON.parse(extField) : {};
		ext.isTop = checked;
		this.conversation.setExtField(JSON.stringify(ext));
		setTop({ id: this.conversation.conversationId(), top: !!checked });
		this.setState({ checked });
	}

	handleCancelClearMessages(){
		this.setState({
			messageClearVisible: false
		});
	}

	static getDerivedStateFromProps({ selectConversationId, globals }, state){
		const conversation = globals.chatManager.conversationWithType(selectConversationId, 0);
		const ext = conversation.extField() ? JSON.parse(conversation.extField()) : {};
		return {
			checked: !!ext.isTop,
			messageClearVisible: state.messageClearVisible
		};
	}

	render(){
		const { selectConversationId, allUsers, globals } = this.props;
		const conversation = globals.chatManager.conversationWithType(selectConversationId, 0);
		const ext = conversation.extField() ? JSON.parse(conversation.extField()) : {};
		const userInfo = allUsers[selectConversationId] || {};
		this.conversation = conversation;
		// console.log("selectConversationId:" + selectConversationId);
		// console.log("allMembersInfo:" + allMembersInfo);
		// const memberInfo = allMembersInfo[selectConversationId];
		// console.log("memberInfo:" + memberInfo);
		return (
			<div>
				<div className="member-info">
					<div className="avatar-name">
						<div className="member-name">
							{ ext.name || userInfo.name || selectConversationId}
						</div>
					</div>
					<div className="info">
						<div><span>用户:</span><span className="ellipsis infos">{ selectConversationId }</span></div>
						<div>会话置顶 <Switch checked={ this.state.checked } onChange={ this.handleSetTop } style={ { top: "12px", left: "10px" } } /></div>
						<div className="operate-member" onClick={ this.handleClearRecord }>清空聊天记录</div>
					</div>
				</div>
				{/* 删除聊天记录确认框 */}
				<Modal
					title="删除聊天记录"
					visible={ this.state.messageClearVisible }
					onOk={ this.handleClearMessage }
					onCancel={ this.handleCancelClearMessages }
					okText="确定"
					cancelText="取消"
				>
					<div>
						确定要删除这些聊天记录吗？
					</div>
					<div>
						您的聊天记录删除后将无法找回，请确定是否要删除聊天记录
					</div>
				</Modal>
			</div>
		);

	}
}
const mapStateToProps = state => ({
	globals: state.globals,
	selectConversationId: state.selectConversationId,
	allMembersInfo: state.allMembersInfo,
	allUsers: state.org.allUsers
});
export default connect(mapStateToProps, actionCreators)(MemberSettingView);
