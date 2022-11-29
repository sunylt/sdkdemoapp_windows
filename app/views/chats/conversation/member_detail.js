import React, { PureComponent } from "react";
import * as actionCreators from "@/stores/actions";
import { connect } from "react-redux";
import HeadImageView from "@/views/common/head_image";
import CreateGroupView from "../groups/group_create";
import { withRouter } from "react-router-dom";
import { Icon } from "antd";

class MemberDetailView extends PureComponent {
	constructor(props){
		super(props);
		const {
			globals,
			selectConversationId
		} = this.props;
	}

	render(){
		const { selectConversationId, allMembersInfo,isSelectCovGroup,globals } = this.props;
		const selectMember = allMembersInfo[selectConversationId];
		const selectGroup = isSelectCovGroup;
		//var groupMembers = selectGroup ? [selectGroup.owner].concat(selectGroup.adminMembers).concat(selectGroup.members) : [];
		let isGroup = isSelectCovGroup == 1;
		let conversation = globals.chatManager.conversationWithType(selectConversationId, isGroup);
		let name;
		console.log("isGroup:" + isGroup + "    isSelectCovGroup:" + isSelectCovGroup);
		console.log("selectConversationId:" + selectConversationId);
		var lenth;
		if(isGroup)
		{
			var group = globals.groupManager.groupWithId(selectConversationId);
			name = group.groupSubject();
			lenth = group.groupMembersCount();
			
			if(lenth == 0)
			{
				console.log("lenth=0");
				globals.groupManager.fetchGroupSpecification(selectConversationId).then(res => {
					
				});
				lenth = group.groupMembersCount();
				globals.groupManager.fetchGroupMembers(selectConversationId, "", 500).then((res) => {

				},(error) => {});
			}
			
		}else
			name = selectConversationId;
		console.log("name:" + name);
		return (

			<div className="oa-conversation-top">
				<div>
					{/* <HeadImageView
						imgUrl={ "" }
					/> */}
					<span className="ellipsis selectName">
						{
							name
						}
					</span>
					<span>{ isGroup && lenth != 0 && `（${lenth}）`}</span>
				</div>
				{
					!isGroup && <CreateGroupView selectMember={ [{easemobName:selectConversationId}] } />
				}
				<span style={ { fontSize: "24px", marginRight: "20px", cursor: "pointer" } } onClick={ this.props.handleShowCard }><Icon type="solution" /></span>
			</div>
		);

	}
}

const mapStateToProps = state => ({
	isSelectCovGroup:state.isSelectCovGroup,
	globals: state.globals,
	selectConversationId: state.selectConversationId,
	allMembersInfo: state.allMembersInfo
});
export default  withRouter(connect(mapStateToProps, actionCreators)(MemberDetailView));
