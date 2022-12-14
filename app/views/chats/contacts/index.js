import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Link, Route, Router, withRouter } from "react-router-dom";
import * as actionCreators from "@/stores/actions";
import MenuList from "./contact_list";
import MemberDetailView from "./contact_detail";

import GroupList from "../groups/group_list";
import RosterListView from "./RosterListView";
import OrgListView from "./OrgListView";
import DataBase from "../../../utils/db";

const MyGroupView = () => {
	return (
		<React.Fragment>
			<h3>我的群组</h3>
			<div className="contact-content">
				<GroupList />
			</div>
		</React.Fragment>
	);
};

const MyRosterView = ({ users }) => {
	return (
		<React.Fragment>
			<h3>我的好友</h3>
			<div className="contact-content">
				<RosterListView users={ users } sort={ true } />
			</div>
		</React.Fragment>
	);
};

class ContactView extends PureComponent {

	render(){
		console.log(this.props);
		const { match, users, orgs, topOrg } = this.props;
		const name = match.params.name || "roster";
		const orgId = name === "org" ? location.href.split("org/")[1] : "";

		if(orgId){

			console.log("db>>>", DataBase.db, orgId);

			DataBase.searchData("orgs", "parentId", orgId).then((res) => {
				console.log("search data", res);
			});
		}

		return (
			<div>
				<MenuList selectedKey={ name } />
				<div className="contact-main">
					{name === "roster" && <MyRosterView users={ users } />}
					{name === "group" && <MyGroupView />}
					{name === "org" &&
						<OrgListView
							orgId={ orgId }
							users={ users }
							orgs={ orgs }
							topOrg={ topOrg }
						/>
					}
				</div>
				{/* <MemberDetailView { ...this.props } /> */}
			</div>);

	}
}
const mapStateToProps = state => ({
	loginState: state.userInfo,
	users: state.org.allUsers,
	orgs: state.org.allOrgs,
	topOrg: state.org.topOrg
});
export default withRouter(connect(mapStateToProps, actionCreators)(ContactView));
