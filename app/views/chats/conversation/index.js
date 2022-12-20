import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import * as actionCreators from "@/stores/actions";
import MenuList from "./conversation_list";
import ConversationDetailView from "./conversation_detail";
import ChatSendBoxView from "../editor/chat_sendbox";
import MemberDetailView from "./member_detail";
import GroupTabView from "../groups/group_tab";
import MemberTabView from "../members/index";
import moment from "moment";


class ConversationView extends PureComponent {

  state = {
  	showCard: true
  }

  showInfo(){
  	const { isSelectCovGroup } = this.props;
  	// 群组
  	if(isSelectCovGroup){
  		return <GroupTabView />;
  	}
  	// 个人
  	return <MemberTabView />;
  }

  showCard = (e) => {
  	this.setState({
  		showCard: !this.state.showCard
  	});
  }

  render(){
  	const { selectConversationId } = this.props;
  	return (
  		<div>
  			<MenuList { ...this.props } />
  			{
  				selectConversationId
  					? <div className="oa-conversation-box">
  						<div className="chat-container">
  							<MemberDetailView handleShowCard={ this.showCard } />
  							<div className="chat-primary">
								  <div className="chat-detail">
									  <ConversationDetailView { ...this.props } />
									  <ChatSendBoxView { ...this.props } key={ selectConversationId } />
								  </div>
  								<div className={ this.state.showCard ? "chat-aside show-card" : "chat-aside" }>
  									{this.showInfo()}
								  </div>
  							</div>
  						</div>
  						{/* { this.showInfo() } */}
  					</div>
  					: null
  			}

  		</div>);

  }
}
const mapStateToProps = state => ({
	selectConversationId: state.selectConversationId,
	isSelectCovGroup:state.isSelectCovGroup
});
export default withRouter(connect(mapStateToProps, actionCreators)(ConversationView));
