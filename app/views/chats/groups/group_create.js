import React, { PureComponent } from "react";
import * as actionCreators from "@/stores/actions";
import * as selectors from "@/stores/selectors";
import { connect } from "react-redux";
import { Icon, Modal, Input, Button, Form, Switch } from "antd";
import HeadImageView from "@/views/common/head_image";
import MenuList from "../contacts/contact_all_list";
import _ from "underscore";
import AvatarImage from "../contacts/AvatarImage";
import { Select } from "antd";
const EventEmitter = require('events').EventEmitter;
var gEventEmiter = new EventEmitter();
class HorizontalForm extends PureComponent {
	constructor(props){
		super(props);
		this.state = {
			groupName: "",
			description: "",
			createGroupButtonState: false,
			allowMemberInvited: false,
			isPublicGroup: false,
		};
		this.handleChangeGroupName = this.handleChangeGroupName.bind(this);
		this.handleChangeDesc = this.handleChangeDesc.bind(this);
		this.handleChangeInvite = this.handleChangeInvite.bind(this);

		var me = this;
		gEventEmiter.on('cancelcreategroup',(event)=>{
			console.log("cancelcreategroup");
			me.cancelcreategroup();
		});
	}

	cancelcreategroup(){
		this.setState({
			groupName: "",
			description: "",
			createGroupButtonState: false,
			isPublicGroup: false,
			allowMemberInvited: false
		});
		this.props.form.resetFields();
	}
	handleChangeGroupName(e){
		this.setState({
			groupName: e.target.value
		});
	}

	handleChangeDesc(e){
		this.setState({
			description: e.target.value
		});
	}

	// 允许群成员邀请成员开关
	handleChangeInvite(checked){
		this.setState({
			allowMemberInvited: checked
		});
		this.props.form.setFieldsValue({ allowMemberInvited: checked });
	}

	handleSetPublic = (checked) => {
		this.setState({
			isPublicGroup: checked
		});
		this.props.form.setFieldsValue({ isPublicGroup: checked });
	}

	render(){
		const { getFieldDecorator, setFieldsValue } = this.props.form;
		const { membersIdOfCreateGroup } = this.props.reduxProps;
		const { createGroup } = this.props;
		return (
			<Form
				labelCol={ { span: 4 } }
				wrapperCol={ { span: 20 } }
				// onSubmit={
				// 	(e) => {
				// 		e.preventDefault();
				// 		createGroup(this.state.groupName, this.state.description,this.state.allowMemberInvited);
				// 		setFieldsValue({
				// 			groupName: "",
				// 			groupDescription: ""
				// 		});
				// 		this.setState({
				// 			"groupName":"",
				// 			"description":"",
				// 			allowMemberInvited:false
				// 		})
				// 	}
				// }
				className="login-form"
			>
				<FormItem label="名称">
					{/* <span>群名称</span> */}
					{getFieldDecorator("groupName", {
						rules: [{ required: true, message: "群名称不能为空" }, { max: 20, message: "群名称最多为 20 个字" } ],
					})(
						<Input
							// prefix={ <Icon type="user"style={ { color: "rgba(0,0,0,.25)" } } /> }
							placeholder="请输入群名称"
							onChange={ this.handleChangeGroupName }
						/>
					)}
				</FormItem>
				<FormItem label="简介">
					{/* <span>群描述</span> */}
					{getFieldDecorator("groupDescription", {})(
						<Input
						// prefix={ <Icon type="lock" style={ { color: "rgba(0,0,0,.25)" } } /> }
							placeholder="请输入群描述"
							onChange={ this.handleChangeDesc }
						/>
					)}
				</FormItem>

				<FormItem label="群组人数">
					{getFieldDecorator("groupMembersCount", {
						initialValue: 100
					})(
						<Select>
							<Select.Option value={ 100 }>100 人</Select.Option>
							<Select.Option value={ 200 }>200 人</Select.Option>
							<Select.Option value={ 300 }>300 人</Select.Option>
						</Select>
					)}
				</FormItem>
				
				<FormItem style={ { marginBottom: 0 } } wrapperCol={ { offset: 4 } }>
					{getFieldDecorator("isPublicGroup", {
						initialValue: false
					})(
						<Switch
							id="isPublicGroup"
							checked={ this.state.isPublicGroup }
							onChange={ this.handleSetPublic }
						/>
					)}
					<span className="switch-label">公开群组<em>其他用户不能查找到此群</em></span>
				</FormItem>
				<FormItem wrapperCol={ { offset: 4 } }>
					{getFieldDecorator("allowMemberInvited", {
						initialValue: false
					})(
						<Switch
							id="allowMemberInvited"
							checked={ this.state.allowMemberInvited }
							onChange={ this.handleChangeInvite }
						/>
					)}
					<span className="switch-label">群成员邀请权限<em>只允许群主邀请用户进群</em></span>
				</FormItem>
				<FormItem label="群组成员">
					{ this.props.children }
				</FormItem>
				{/* <FormItem>
					<Button
						type="primary"
						htmlType="submit"
						className="login-form-button"
						disabled={ !(membersIdOfCreateGroup.length > 0) }
					>
						确定
					</Button>
				</FormItem> */}
			</Form>
		);
	}
}
const FormItem = Form.Item;
const WrappedHorizontalForm = Form.create()(HorizontalForm);
class CreateGroupView extends PureComponent {
	constructor(props){
		super(props);
		this.state = {
			visible: false,
			groupName: "",
			description: "",
			previewVisible: false,
			previewImage: "",
			fileList: [],
			avatarUrl: ""
		};
		this.handleCreatGroup = this.handleCreatGroup.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.createGroup = this.createGroup.bind(this);
		this.handlePreviewAvatar = this.handlePreviewAvatar.bind(this);
		this.handleChangeAvatar = this.handleChangeAvatar.bind(this);
		this.handleCancelAvatar = this.handleCancelAvatar.bind(this);
		this.handleCancleSelectMember = this.handleCancleSelectMember.bind(this);
		this.handleRemoveAvatar = this.handleRemoveAvatar.bind(this);
	}

	handleCancelAvatar(){
		this.setState({ previewVisible: false });
	}

	handleRemoveAvatar(){
		this.setState({ avatarUrl: "", fileList: [] });
	}

	handlePreviewAvatar(file){
		this.setState({
			previewImage: file.url || file.thumbUrl,
			previewVisible: true,
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

	handleCreatGroup(){
		const {
			selectMembersAction,
			selectMember
		} = this.props;
		this.setState({
			visible: true,
			fileList: [],
			avatarUrl: ""
		});
		//
		selectMember && selectMembersAction(selectMember);

	}

	// 取消创建
	handleCancel(){
		const { cancelCreateGroupAction } = this.props;
		this.setState({
			visible: false,
			fileList: [],
			avatarUrl: ""
		});
		cancelCreateGroupAction();
		console.log("cancel");
		gEventEmiter.emit('cancelcreategroup');
	}

	// 创建群组时除了自己应该至少选 2 人，否则去单聊
	createGroup(groupName, description, allowMemberInvited, isPublic, maxMembersCount){
		const {
			membersId,
			membersIdArray,
			userInfo,
			membersName,
			globals,
			conversationOfSelect,
			msgsOfConversation,
			allMembersInfo,
			cancelCreateGroupAction,
			setNotice,
			createAGroup,
			setSelectConvType
		} = this.props;
		var conversation;
		var messages;
		var extInfo;
		var selectMember;
		var username;
		var setting;
		var groupManager = globals.groupManager;
		var style;

		console.log("create selected members>>", membersIdArray);
		if(membersIdArray.length == 0){
			setNotice("创建群需要至少 2 名成员", "fail");
		}
		else if(membersIdArray.length >= maxMembersCount){
			setNotice(`当前选择的群成员已超过 ${maxMembersCount} 人`, "fail");
		}
		else{
			
			username = userInfo.user.realName || userInfo.user.username || userInfo.user.easemobName;
			groupName = groupName ? groupName.substring(0, 20) : `${username},${membersName}`.substring(0, 20);
			description = description ? description.substring(0, 100) : "";
			
			/**  
     * 实例化区群组设置
     * param style 组类型,Number,0为私有群，只有群主可以邀请成员加入，1为私有群，成员也可以邀请成员加入，2为公开群，但申请入群需要群主同意，3为公开群，成员可以随意申请加入
     * param maxUserCount 最大成员数,Number，最大200
     * param inviteNeedConfirm 邀请是否需要确认，Bool
     * param extension 扩展信息，String
     * return 返回组设置对象
     */
			// EMMucSetting(style, maxUserCount, inviteNeedConfirm, extension)
			// 调用方法如下：
			
			// var setting = new easemob.EMMucSetting(1, 20, false, "test");
			// 组设置，4个参数分别为组类型（0,1,2,3），最大成员数，邀请是否需要确认，扩展信息
			if(isPublic){
				style = allowMemberInvited ? 2 : 3;
			}
			else{
				style = allowMemberInvited ? 1 : 0;
			}
			setting = new globals.easemob.EMMucSetting(style, maxMembersCount, true, "test");
			console.log(`membersIdArray:${membersIdArray}`);
			console.log(`membersId:${membersId}`);
			groupManager.createGroup(groupName, description, "welcome message", setting, membersIdArray).then((res) => {
				console.log(res, 2);
				if(res.code == 0){
					let group = res.data;
					let conversation = globals.chatManager.conversationWithType(group.groupId(), 1);
					// createGroup({"easemobGroupId":group.groupId(),"convesation":conversation});
					createAGroup({ easemobGroupId: group.groupId(), conversation });
					setSelectConvType(1);
					console.log(`createGroup success:${group.groupId()}`);
					cancelCreateGroupAction();
					this.setState({
						visible: false,
					});
					gEventEmiter.emit("cancelcreategroup");
				}
				else{
					setNotice(`创建群失败，原因: ${res.description}`, "fail");
					// cancelCreateGroupAction();
				}
			});
			// console.log(3);
			/*,(group,err) => {
				if(err.errorCode == 0)
				{
					let conversation = globals.chatManager.conversationWithType(group.groupId(),1);
					//createGroup({"easemobGroupId":group.groupId(),"convesation":conversation});
					createAGroup({easemobGroupId:group.groupId(),conversation});
					setSelectConvType(1);
					console.log("createGroup success:" + group.groupId());
				}else
					console.log("createGroup fail!errorDescription:" + err.description);
				cancelCreateGroupAction();
				
			});*/
		}


	}

	handleCancleSelectMember(item){
		const { cancelMembersAction } = this.props;
		cancelMembersAction(item.userName);
	}

	handleCreateGroup = () => {
		const { form } = this.wform.props;
		form.validateFields((errors, values) => {
			if(!errors){
				console.log(form, values);
				const { groupName, groupDescription, groupMembersCount, isPublicGroup, allowMemberInvited } = values;
				this.createGroup(groupName, groupDescription, allowMemberInvited, isPublicGroup, groupMembersCount);
			}
		});
	}

	render(){
		const {
			userInfo,
			selectConversationId,
			selectMember,
			membersIdOfCreateGroup,
			membersOfCreateGroup,
			allMembersInfo
		} = this.props;
		const { previewVisible, previewImage, fileList } = this.state;
		var groupMemberInfoData = userInfo.userData ? (selectMember ? [userInfo.userData].concat(selectMember) : [userInfo.userData]) : [];
		var groupMemberIds = _.pluck(groupMemberInfoData, "userName");
		var memberInfoOfGroup;
		return (
			<React.Fragment>
				<div className="button-add" onClick={ this.handleCreatGroup }>
					<Icon type="plus" />
				</div>
				{userInfo ? 
					<Modal
						title="创建群组"
						visible={ this.state.visible }
						onOk={ this.handleCreateGroup }
						onCancel={ this.handleCancel }
						// mask={ false }
						// footer={ null }
						style={ { top: 50 } }
						cancelText="取消"
						okText="创建"
						width={ 660 }
					>
						<div className="oa-group">
							<WrappedHorizontalForm wrappedComponentRef={ (form) => { this.wform = form; } } reduxProps={ this.props } createGroup={ this.createGroup }>
								<div className="members-container">
									<div className="oa-group-setting oa-group-create-setting">
										<div style={ { paddingTop: "5px" } }>已选 { membersIdOfCreateGroup.length + 1} 人</div>
										<div className="selected-members-container">
											<div className="select-member" >
												<AvatarImage name={ userInfo.userData.name || userInfo.userData.userName } />
												<div className="member-name">{ userInfo.userData.name || userInfo.userData.userName }</div>
											</div>
											{
												_.map(membersOfCreateGroup, (member) => {
													// memberInfoOfGroup = allMembersInfo[member];
													return (
														<div className="select-member" key={ member.id }>
															{/* <HeadImageView imgUrl={ memberInfoOfGroup ? memberInfoOfGroup.image : "" }></HeadImageView> */}
															<AvatarImage name={ member.name } />
															<div className="member-name">
																{ member.name }
															</div>
															{
																member.userName == selectConversationId
																	? null
																	: <div className="cancel-member" onClick={ () => { this.handleCancleSelectMember(member);  } }>
																		<Icon type="close" />
																	</div>
															}

														</div>
													);
												})
											}
										</div>
									</div>
									<div className="oa-group-member">
										<MenuList
											selectMemberData={ membersIdOfCreateGroup }
											groupMemberData={ groupMemberIds }
										/>
									</div>
								</div>
							</WrappedHorizontalForm>
						</div>
					</Modal> : null
				}
			</React.Fragment>
		);

	}
}

const mapStateToProps = state => ({
	globals: state.globals,
	allMembersInfo: state.allMembersInfo,
	selectConversationId: state.selectConversationId,
	membersId: selectors.membersIdOfGroup(state),
	membersName: selectors.membersNameOfGroup(state),
	userInfo: state.userInfo,
	membersOfCreateGroup: state.membersOfCreateGroup,
	membersIdArray: selectors.membersIdArray(state),
	membersIdOfCreateGroup: selectors.createGroupMembersIdArray(state),
});
export default connect(mapStateToProps, actionCreators)(CreateGroupView);
