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
		const { selectConversationId,globals } = this.props;
		var group = globals.groupManager.groupWithId(selectConversationId);
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

			messageClearVisible: false,
			destoryGroupDialogVisible: false,
			exitGroupDialogVisible: false
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
	}

	// ????????????
	handleCancelDestoryGrop(){
		this.setState({ destoryGroupDialogVisible: false });
	}
	handleDestoryGroupDialog(){
		this.setState({ destoryGroupDialogVisible: true });
	}

	// ????????????
	handleCancelExitGroup(){
		this.setState({ exitGroupDialogVisible: false });
	}
	handleExitGroupDialog(){
		this.setState({ exitGroupDialogVisible: true });
	}

	// ??????????????????????????? sdk ??? ??????
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

	// ???????????? ?????????????????????, ??? rest ??????;
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
				setNotice("?????????????????????????????????", "fail");
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
			setNotice("????????????????????????");
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

	// ??????????????????
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

	// ????????????
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
		// ?????????????????????????????????????????????
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
					<Button type="primary" onClick={ this.handleSave }>??????</Button>
					<div className="info">
						<div className="operate-member operate-switch">
							<span>????????????</span>
							<Switch
								checkedChildren="???"
								unCheckedChildren="???"
								defaultChecked={ group.isMessageBlocked() }
								onChange={ this.handleChangeMessageFrom }
							/>
						</div>
						<div className="operate-member" onClick={ this.handleClearRecord }>??????????????????</div>
						<div  className="operate-member" onClick={ this.handleDestoryGroupDialog }>????????????</div>
					</div>

					{/* ???????????? */}
					<Modal visible={ previewVisible } footer={ null } onCancel={ this.handleCancelAvatar }>
						<img alt="example" style={ { width: "100%" } } src={ previewImage } />
					</Modal>
					{/* ??????????????????????????? */}
					<Modal
						title="??????????????????"
						visible={ this.state.messageClearVisible }
						onOk={ this.handleClearMessage }
						onCancel={ this.handleCancelClearMessages }
					>
						<div>
							?????????????????????????????????
						</div>
						<div>
							?????????????????????????????????????????????????????????????????????????????????
						</div>
					</Modal>
					{/* ????????????????????? */}
					<Modal
						title="????????????"
						visible={ this.state.destoryGroupDialogVisible }
						onOk={ this.handleDissolveGroup }
						onCancel={ this.handleCancelDestoryGrop }
					>
						<div>
							???????????????????????????
						</div>
					</Modal>
				</div>

			);

		}

		// ?????????????????? ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????
		return (
			<div className="info" key={ selectConversationId }>
				<div className="operate-member operate-switch">
					<span>????????????</span>
					<Switch
						checkedChildren="???"
						unCheckedChildren="???"
						defaultChecked={ group.isMessageBlocked() }
						onChange={ this.handleChangeMessageFrom }
					/>
				</div>
				<div className="operate-member" onClick={ this.handleClearRecord }>??????????????????</div>
				<div className="operate-member" onClick={ this.handleExitGroupDialog }>????????????</div>
				{/* ??????????????????????????? */}
				<Modal
					title="??????????????????"
					visible={ this.state.messageClearVisible }
					onOk={ this.handleClearMessage }
					onCancel={ this.handleCancelClearMessages }
				>
					<div>
						?????????????????????????????????
					</div>
					<div>
						?????????????????????????????????????????????????????????????????????????????????
					</div>
				</Modal>
				{/* ????????????????????? */}
				<Modal
					title="????????????"
					visible={ this.state.exitGroupDialogVisible }
					onOk={ this.handleExitGroup }
					onCancel={ this.handleCancelExitGroup }
				>
					<div>
						???????????????????????????
					</div>
				</Modal>
			</div>
		);
	}

	render(){
		return (
			<div className="group-tab">

				{
					this.showGroupInfo()
				}

			</div>
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
