import React from "react";
import { Link } from "react-router-dom";
import AvatarImage from "./AvatarImage";

export default ({ orgId, orgs = [], users = [], topOrg = {} }) => {
	const orgList = orgs.filter(item => item.parentId == orgId).map(item => <li key={ item.id }><Link to={ `/chats/contacts/org/${item.id}` }>{ item.name }</Link></li>);
	const userList = users.filter(item => item.status == "1" && item.organEntities.find(org => org.id == orgId)).map(item => <li key={ item.id }><AvatarImage name={ item.name } />{ item.name }</li>);
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
		<div>
			<h3>{topOrg.name}</h3>
			<div className="my-org">
				<p className="org-breadcrumb">{pathData.map(item => <span key={ item.id }><Link to={ `/chats/contacts/org/${item.id}` }>{item.name}</Link> &gt; </span>)}{currentOrg.name}</p>
				<ul className="org-list">
					{orgList}
				</ul>
				<ul className="roster-list">
					{userList}
				</ul>
			</div>
		</div>
	);
};