import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Link, Route, Router, withRouter } from "react-router-dom";
import * as actionCreators from "@/stores/actions";
import MenuList from "./contact_list";
import MemberDetailView from "./contact_detail";
import { org } from "../../../stores/reducers";

class RoserView extends PureComponent {
	render(){
		const { allContacts } = this.props;
		const arrContacs = allContacts.contacts;
		console.log(allContacts);
		return (
			<div className="contact-content roster-list">
				<h3>我的好友</h3>
				{
					arrContacs.length ? arrContacs.map((contact) => {
						console.log(contact);
						return <p key={ contact }>{contact}</p>;
					}) : <p>暂无好友信息</p>
				}
			</div>
		);
	}
}

const WRosterView = withRouter(connect(
	state => ({
		allContacts: state.allContacts
	})
)(RoserView));

const AvatarImg = ({ username }) => {
	return (<div className="user-avatar" style={ { borderRadius: "4px", width: "34px", height: "34px", background: "blue", color: "#fff", textAlign: "center", lineHeight: "34px", display: "inline-block" } }>{username.slice(-2)}</div>);
};

const OrgView = ({ orgId, orgs = [], users = [], topOrg = {} }) => {
	const orgList = orgs.filter(item => item.parentId == orgId).map(item => <li key={ item.id }><Link to={ `/chats/contacts/org/${item.id}` }>{ item.name }</Link></li>);
	const userList = users.filter(item => item.status == "1" && item.organEntities.find(org => org.id == orgId)).map(item => <li key={ item.id }><AvatarImg username={ item.name } />{ item.name }</li>);
	const currentOrg = orgs.find(item => item.id === orgId);
	const pathData = [];
	let pId = "";
	if(orgs && currentOrg && topOrg.id !== orgId){
		console.log('>>>', currentOrg, orgId)
		pId = currentOrg.parentId;
		while(pId !== topOrg.id){
			const org = orgs.find(item => item.id === pId);
			console.log("find org.>>", org);
			pathData.unshift(org);
			pId = org.parentId;
		}
		pathData.unshift(topOrg);
	}
	console.log("render org view",  pathData);
	if(!orgs.length) return null;
	return (
		<div className="my-org">
			<h3 className="top-orgName">{topOrg.name}</h3>
			<p className="org-breadcrumb">{pathData.map(item => <span key={ item.id }><Link to={ `/chats/contacts/org/${item.id}` }>{item.name}</Link> &gt; </span>)}{currentOrg.name}</p>
			<ul className="org-list">
				{orgList}
			</ul>
			<ul className="user-list">
				{userList}
			</ul>
		</div>
	);
};


class UserOrgView extends PureComponent {
	state = {
		data: []
	}
	render(){
		return (
			<div className="user-org-view">

			</div>
		);
	}
}

const GroupView = () => <div className="contact-content"><h3>我的群组</h3></div>;

class ContactView extends PureComponent {

	render(){
		console.log(this.props);
		const { match, users, orgs, topOrg } = this.props;
		const name = match.params.name || "roster";
		const orgId = name === "org" ? location.href.split("org/")[1] : "";

		console.log("router view name", name);
		return (
			<div>
				<MenuList selectedKey={ name } />
				<div className="contact-main">
					{name === "roster" && <WRosterView />}
					{name === "group" && <GroupView />}
					{name === "org" &&
						<OrgView
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
