import React, { Component } from "react";
import { connect } from "react-redux";
import { Switch, Input, Upload, Icon, Modal, Button } from "antd";
import * as actionCreators from "@/stores/actions";
import HeadImageView from "@/views/common/head_image";
import $ from "jquery";
import * as selectors from "@/stores/selectors";
var _const = require("@/views/common/domain");

class GroupSettingView extends Component {
	constructor(props){
		super(props);
		const { selectConversationId, globals } = this.props;
		const group = globals.groupManager.groupWithId(selectConversationId);
		this.state = {
			chatName: group.groupSubject(),
			avatarUrl: "",
			previewVisible: false,
			previewImage: "",
			fileList: [
				{
					uid: -1,
					name: "",
					status: "done",
					url: `${require("@/views/config/img/default_avatar.png")}`
				}
			],

			groupAnnouncement: "",
			messageClearVisible: false,
			destoryGroupDialogVisible: false,
			exitGroupDialogVisible: false,
			showEditBox: false,
			editData: {}
		};
		// this.messageFromValue = emGroup.isMessageBlocked();
		// this.handleOpenChange = this.handleOpenChange.bind(this);
		this.handleExitGroup = this.handleExitGroup.bind(this);
		this.handleDissolveGroup = this.handleDissolveGroup.bind(this);
		this.handleChangeChatName = this.handleChangeChatName.bind(this);
		this.handleSave = this.handleSave.bind(this);
		this.handleChangeAvatar = this.handleChangeAvatar.bind(this);
		this.handleCancelAvatar = this.handleCancelAvatar.bind(this);
		this.handlePreviewAvatar = this.handlePreviewAvatar.bind(this);
		this.handleClearRecord = this.handleClearRecord.bind(this);
		this.handleClearMessage = this.handleClearMessage.bind(this);
		this.handleCancelClearMessages = this.handleCancelClearMessages.bind(this);
		this.handleChangeMessageFrom = this.handleChangeMessageFrom.bind(this);

		this.handleCancelDestoryGrop = this.handleCancelDestoryGrop.bind(this);
		this.handleDestoryGroupDialog = this.handleDestoryGroupDialog.bind(this);

		this.handleCancelExitGroup = this.handleCancelExitGroup.bind(this);
		this.handleExitGroupDialog = this.handleExitGroupDialog.bind(this);
		this.group = group;
	}

	// 解散群组
	handleCancelDestoryGrop(){
		this.setState({ destoryGroupDialogVisible: false });
	}
	handleDestoryGroupDialog(){
		this.setState({ destoryGroupDialogVisible: true });
	}

	// 退出群组
	handleCancelExitGroup(){
		this.setState({ exitGroupDialogVisible: false });
	}
	handleExitGroupDialog(){
		this.setState({ exitGroupDialogVisible: true });
	}

	// 普通成员，退群，调 sdk 的 接口
	handleExitGroup(){
		const {
			selectConversationId,
			globals,
			leaveGroupAction,
		} = this.props;
		var groupManager = globals.groupManager;
		groupManager.leaveGroup(selectConversationId).then((res) => {
			if(res.code != 0)
			  console.log("leave group fail:" + res.description);
		});
		leaveGroupAction(selectConversationId);
	}

	// 解散群组 是群主，解散群, 调 rest 接口;
	handleDissolveGroup(){
		const {
			selectConversationId,
			globals,
			destoryGroup
		} = this.props;
		let groupManager = globals.groupManager;
		groupManager.destroyGroup(selectConversationId).then((res) => {
			if(res.code == 0)
			{
				destoryGroup(selectConversationId);
			}
		});
	}

	handleChangeChatName(event){
		this.setState({
			chatName: $.trim(event.target.value),
		});
	}

	handleChangeAvatar({ fileList, file }){
		const { setNotice, selectConversationId } = this.props;
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
						url: `${require("@/views/config/img/default_avatar.png")}`,
					}
				] });
			}
		}
	}

	handleCancelAvatar(){
		this.setState({ previewVisible: false });
	}

	handlePreviewAvatar(file){
		this.setState({
			previewImage: file.url || file.thumbUrl,
			previewVisible: true,
		});
	}

	handleSave(){
		const {
			userInfo,
			selectConversationId,
			conversationOfSelect,
			globals,
			setNotice
		} = this.props;
		let groupManager = globals.groupManager;
		if(!this.state.chatName || this.state.chatName == "")
		{
			setNotice("群组名称不能为空");
			return;
		}
		groupManager.changeGroupSubject(selectConversationId,this.state.chatName.substring(0, 20)).then(res => {
			if(res.code != 0)
			  console.log("leave group fail:" + res.description);
			conversationOfSelect("");
			conversationOfSelect(selectConversationId);
		});
	}


	handleClearRecord(){
		this.setState({
			messageClearVisible: true
		});
	}

	handleCancelClearMessages(){
		this.setState({
			messageClearVisible: false
		});
	}

	// 清空聊天记录
	handleClearMessage(){
		const {
			selectConversationId,
			globals,
			clearAllMessagesAction
		} = this.props;
		var conversation = globals.chatManager.conversationWithType(selectConversationId, 1);
		conversation.clearAllMessages();
		clearAllMessagesAction({ id: selectConversationId });
		this.handleCancelClearMessages();
	}

	// 屏蔽群聊
	handleChangeMessageFrom(checked){
		const { globals, selectConversationId } = this.props;
		const groupManager = globals.groupManager;
		if(checked){
			groupManager.blockGroupMessage(selectConversationId).then(res => {
				if(res.code == 0)
				{
					console.log(`blockGroupMessage error.description = ${res.description}`);
				}
			});
			// console.log(`blockGroupMessage error.errorCode = ${error.errorCode}`);
			// console.log(`blockGroupMessage error.description = ${error.description}`);
		}
		else{
			groupManager.unblockGroupMessage(selectConversationId).then(res => {
				if(res.code == 0)
				{
					console.log(`unblockGroupMessage error.description = ${res.description}`);
				}
			});
			// console.log(`unblockGroupMessage error.errorCode = ${error.errorCode}`);
			// console.log(`unblockGroupMessage error.description = ${error.description}`);
		}
	}

	showGroupInfo(){
		const {
			selectConversationId,
			userInfo,
			globals,
		} = this.props;
		const { previewVisible, previewImage, fileList } = this.state;
		var group = globals.groupManager.groupWithId(selectConversationId);
		const isOwner = group.groupOwner() === userInfo.user.easemobName;
		// 如果是群主，才能修改昵称和头像
		if(group.groupOwner() === userInfo.user.easemobName){
			return (
				<div className="group-setting">
					<HeadImageView imgUrl={ "" } />
					<div className="groupname">
						<Input
							value={ this.state.chatName }
							onChange={ (event) => { this.handleChangeChatName(event); } }
						/>
					</div>
					<Button type="primary" onClick={ this.handleSave }>保存</Button>
					<div className="info">
						<div className="operate-member operate-switch">
							<span>屏蔽群聊</span>
							<Switch
								checkedChildren="开"
								unCheckedChildren="关"
								defaultChecked={ group.isMessageBlocked() }
								onChange={ this.handleChangeMessageFrom }
							/>
						</div>
						<div className="operate-member" onClick={ this.handleClearRecord }>清空聊天记录</div>
						<div  className="operate-member" onClick={ this.handleDestoryGroupDialog }>解散群组</div>
					</div>

					{/* 头像预览 */}
					<Modal visible={ previewVisible } footer={ null } onCancel={ this.handleCancelAvatar }>
						<img alt="example" style={ { width: "100%" } } src={ previewImage } />
					</Modal>
					{/* 清空聊天记录确认框 */}
					<Modal
						title="清空聊天记录"
						visible={ this.state.messageClearVisible }
						onOk={ this.handleClearMessage }
						onCancel={ this.handleCancelClearMessages }
					>
						<div>
							确定要清空聊天记录吗？
						</div>
						<div>
							您的聊天记录清空后将无法找回，请确定是否要清空聊天记录
						</div>
					</Modal>
					{/* 解散群组确认框 */}
					<Modal
						title="解散群组"
						visible={ this.state.destoryGroupDialogVisible }
						onOk={ this.handleDissolveGroup }
						onCancel={ this.handleCancelDestoryGrop }
					>
						<div>
							确定要解散群组吗？
						</div>
					</Modal>
				</div>

			);

		}

		// 清空聊天记录 成功清空聊天记录后，再次进入群，应不展示任何消息，但不影响其他成员查看群消息
		return (
			<div className="info" key={ selectConversationId }>
				<div className="operate-member operate-switch">
					<span>屏蔽群聊</span>
					<Switch
						checkedChildren="开"
						unCheckedChildren="关"
						defaultChecked={ group.isMessageBlocked() }
						onChange={ this.handleChangeMessageFrom }
					/>
				</div>
				<div className="operate-member" onClick={ this.handleClearRecord }>清空聊天记录</div>
				<div className="operate-member" onClick={ this.handleExitGroupDialog }>退出群组</div>
				{/* 清空聊天记录确认框 */}
				<Modal
					title="清空聊天记录"
					visible={ this.state.messageClearVisible }
					onOk={ this.handleClearMessage }
					onCancel={ this.handleCancelClearMessages }
					okText="确定"
					cancelText="取消"
				>
					<div>
						确定要清空聊天记录吗？
					</div>
					<div>
						您的聊天记录清空后将无法找回，请确定是否要清空聊天记录
					</div>
				</Modal>
				{/* 退出群组确认框 */}
				<Modal
					title="退出群组"
					visible={ this.state.exitGroupDialogVisible }
					onOk={ this.handleExitGroup }
					onCancel={ this.handleCancelExitGroup }
				>
					<div>
						确定要退出群组吗？
					</div>
				</Modal>
			</div>
		);
	}

	handleEditGroupData = (title, type, content) => {
		this.setState({
			showEditBox: true,
			editData: {
				title,
				type,
				content,
			}
		});
	}

	handleChangeTextArea = (e) => {
		const editData = this.state.editData;
		editData.content = e.target.value;
		this.setState(editData);
	}

	handleSaveEditData = () => {
		const {
			selectConversationId,
			globals,
		} = this.props;
		const { type, content } = this.state.editData;
		console.log(globals.groupManager);
		if(type == 1){
			globals.groupManager.changeGroupSubject(selectConversationId, content);
		}
		else if(type == 2){
			globals.groupManager.updateGroupAnnouncement(selectConversationId, content).then((res) =>{
				console.log("群公告完成更新>>", content);
			},
			(error) => {});
		}
		else if(type == 3){
			globals.groupManager.changeGroupDescription(selectConversationId, content);
		}
		this.setState({
			showEditBox: false
		});
	}

	handleSetTop = (checked) => {
		const { setTop } = this.props;
		const extField = this.conversation.extField();
		const ext = extField ? JSON.parse(extField) : {};
		ext.isTop = checked;
		this.conversation.setExtField(JSON.stringify(ext));
		setTop({ id: this.conversation.conversationId(), top: !!checked });
	}

	handleSetMuted = (checked) => {
		const extField = this.conversation.extField();
		const ext = extField ? JSON.parse(extField) : {};
		ext.muted = checked;
		this.conversation.setExtField(JSON.stringify(ext));
	}

	componentDidMount(){
		const {
			selectConversationId,
			globals,
		} = this.props;
		globals.groupManager.fetchGroupAnnouncement(selectConversationId).then((res) => {
			if(res && res.code == 0){
				this.setState({
					groupAnnouncement: res.data
				});
			}
		}, () => {});
	}

	render(){
		const {
			selectConversationId,
			userInfo,
			globals,
		} = this.props;
		const { previewVisible, previewImage, fileList } = this.state;
		const group = globals.groupManager.groupWithId(selectConversationId);
		const conversation = globals.chatManager.conversationWithType(selectConversationId, 1);
		const isOwner = group.groupOwner() === userInfo.user.easemobName;
		const subject = group.groupSubject();
		const annc = group.groupAnnouncement();
		const desc = group.groupDescription();
		const ext = conversation.extField() ? JSON.parse(conversation.extField()) : {};

		this.conversation = conversation;
		
		return (
			<React.Fragment>
				<div className="info">
					<div className="operate-member operate-switch">
						<span>群名称</span>
						<span className="item-content">{subject}</span>
						<Icon type={ isOwner ? "edit" : "right" } onClick={ () => this.handleEditGroupData("群名称", "1", subject) } />
					</div>
					<div className="operate-member operate-switch">
						<span>群公告</span>
						<span className="item-content">{annc}</span>
						<Icon type={ isOwner ? "edit" : "right" } onClick={ () => this.handleEditGroupData("群公告", "2", annc) } />
					</div>
					<div className="operate-member operate-switch">
						<span>群介绍</span>
						<span className="item-content">{desc}</span>
						<Icon type={ isOwner ? "edit" : "right" } onClick={ () => this.handleEditGroupData("群介绍", "3", desc) } />
					</div>
				</div>

				<div className="info">
					<div className="operate-member operate-switch">
						<span>置顶聊天</span>
						<Switch
							defaultChecked={ !!ext.isTop }
							onChange={ this.handleSetTop }
						/>
					</div>
					<div className="operate-member operate-switch">
						<span>消息免打扰</span>
						<Switch
							defaultChecked={ !!ext.muted }
							onChange={ this.handleSetMuted }
						/>
					</div>
					<div className="operate-member operate-switch">
						<span>屏蔽群聊</span>
						<Switch
							defaultChecked={ group.isMessageBlocked() }
							onChange={ this.handleChangeMessageFrom }
						/>
					</div>
					<div className="operate-member">
						<span className="text-button" onClick={ this.handleClearRecord }>清空聊天记录</span>
					</div>
				</div>

				<div className="info">
					{!isOwner ?
						<div className="operate-member">
							<span className="text-button" onClick={ this.handleExitGroupDialog }>退出群组</span>
						</div>
						:
						<div  className="operate-member">
							<span className="text-button" onClick={ this.handleDestoryGroupDialog }>解散群组</span>
						</div>
					}
				</div>

				<Modal
					title={ this.state.editData.title }
					visible={ this.state.showEditBox }
					onCancel={ () => this.setState({ showEditBox: false }) }
					onOk={ this.handleSaveEditData }
					okText="确定"
					cancelText="取消"
				>
					<Input.TextArea value={ this.state.editData.content } onChange={ this.handleChangeTextArea } disabled={ !isOwner }></Input.TextArea>
				</Modal>

				
				<Modal
					title="解散群组"
					visible={ this.state.destoryGroupDialogVisible }
					onOk={ this.handleDissolveGroup }
					onCancel={ this.handleCancelDestoryGrop }
					okText="确定"
					cancelText="取消"
				>
					<div>
						确定要解散群组吗？
					</div>
				</Modal>

				<Modal
					title="清空聊天记录"
					visible={ this.state.messageClearVisible }
					onOk={ this.handleClearMessage }
					onCancel={ this.handleCancelClearMessages }
					okText="确定"
					cancelText="取消"
				>
					<div>
						确定要清空聊天记录吗？
					</div>
					<div>
						您的聊天记录清空后将无法找回，请确定是否要清空聊天记录
					</div>
				</Modal>
				{/* 退出群组确认框 */}
				<Modal
					title="退出群组"
					visible={ this.state.exitGroupDialogVisible }
					onOk={ this.handleExitGroup }
					onCancel={ this.handleCancelExitGroup }
				>
					<div>
						确定要退出群组吗？
					</div>
				</Modal>
				{/* {this.showGroupInfo()} */}
			</React.Fragment>
		);

	}
}

const mapStateToProps = state => ({
	globals: state.globals,
	selectGroup: state.selectGroup,
	selectConversationId: state.selectConversationId,
	allMembersInfo: state.allMembersInfo,
	userInfo: state.userInfo,
	addMembers: selectors.getAddMembers(state),
	removeMembers: selectors.getRemoveMembers(state),
	membersIdOfEditGroup: selectors.membersIdArray(state),
	membersIdOfDeleteGroup: selectors.deleteGroupMembersIdArray(state),
});
export default connect(mapStateToProps, actionCreators)(GroupSettingView);
