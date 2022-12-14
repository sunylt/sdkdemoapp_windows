import React, { Component } from "react";
import { connect } from "react-redux";
import { Menu,Input,Button, Icon } from "antd";
import { Link, NavLink, withRouter } from "react-router-dom";
import * as actionCreators from "@/stores/actions";
import _ from "underscore";
import { setNotice, updateUserOrgs } from "../../../stores/actions";
import routes from "../../common/routes";
const SubMenu = Menu.SubMenu;


class MenuList extends Component {
	constructor(props){
		super(props);
		this.state = {
			openKeys: [],
			currentMenuId: 0,
			rootOrgId: "",
		};
		this.handleClick = this.handleClick.bind(this);
		this.handleOpenChange = this.handleOpenChange.bind(this);
		this.addContact = this.addContact.bind(this);
		this.onIdChange = this.onIdChange.bind(this);
	}
	addContact(e){
		const {
			allContacts,
			globals,
			setNotice
		} = this.props;
		if(!this.state.chatName || this.state.chatName == "")
		{
			setNotice("联系人ID不能为空");
			return;
		}
		let  name = this.state.chatName.toLowerCase();
		var arrContacs = allContacts.contacts;
		if(arrContacs.indexOf(name) > -1){
			setNotice("联系人已在好友列表中");
			return;
		}
		let contactManager = globals.contactManager;
		contactManager.inviteContact(name,"welcome").then((res) => {
		if(res.code == 0)
			setNotice("好友申请发送成功");
		else
			setNotice("好友申请发送失败：" + res.description);
		});
	}
	onIdChange(event){
		this.setState({
			chatName: $.trim(event.target.value),
		});
	}

	formSubmenusChild(obj){
		let cHtml = <div></div>;
		const { orgTree } = this.props;
		let childArray = orgTree[obj.id] ? orgTree[obj.id].children : [];
		if(obj.children && obj.children.length > 0){
			cHtml = childArray.map((item, i) => {
				return this.formSubmenusChild(item);
			});
			return <SubMenu key={ obj.id } title={ obj.orgName }>{ cHtml }</SubMenu>;
		}
		return <Menu.Item key={ obj.easemobName || obj.username || obj.id }>{ obj.orgName || obj.realName || obj.username } </Menu.Item>;
	}

	handleClick(e){
		const key = e.key;
		const {
			memberOfSelect,
			userInfo
		} = this.props;
		const tenantId = userInfo ? userInfo.user.tenantId : 9;
		this.setState({ currentMenuId: key });
		memberOfSelect({"easemobName":key});
	}

	handleOpenChange(keys){
		const { keysOfOpenMenu } = this.props;
		keysOfOpenMenu(keys);
	}

	handleSetRootOrgId(id){
		console.log("setRootOrgId", id);
		this.setState({
			rootOrgId: id
		});
	}

	render(){
		const {
			openMenuKeys,
			selectMember,
			networkConnection,
			allContacts,
			history,
			match,
			selctedKey,
			org
		} = this.props;
		const { rootOrgId } = this.state;
		var arrContacs = allContacts.contacts;
		console.log("arrContacs:" + allContacts.contacts);

		const routeName = match.params.name;
		const orgId = routeName === "org" ? location.href.split("org/")[1] : "";

		return (
			<div className="oa-main-list  oa-conversation-list">
				{
					networkConnection
						? <div className="network-state">网络连接已断开</div>
						: null
				}
				{/* <Menu
					style={ { width: 300, border: "none" } }
					onClick={ e => history.push() }
					defaultSelectedKeys={ [selctedKey || match.params.name || "roster"] }
				>
					<Menu.Item key="roster">我的好友</Menu.Item>
					<Menu.Item key="group">我的群组</Menu.Item>
				</Menu> */}
				<div className="userContact">
					<ul>
						<li key="roster" className={ (routeName === "roster" || !routeName) ? "item-selected" : "" }>
							<Link to={ routes.chats.contacts.id("roster") }><span className="user-icon"><Icon type="user"></Icon></span>我的好友</Link>
						</li>
						<li key="group" className={ routeName === "group" ? "item-selected" : "" }>
							<Link to={ routes.chats.contacts.id("group") }><span className="group-icon"><Icon type="team"></Icon></span>我的群组</Link>
						</li>
					</ul>
				</div>

				{
					org.topOrg.name &&
				<div className="userOrg">
					<div className="topOrgName"><span className="org-icon"><Icon type="apartment"></Icon></span>{org.topOrg.name}</div>
					<ul>
						<li key="all" className={ (orgId === org.topOrg.id && !rootOrgId)  || (orgId && rootOrgId === org.topOrg.id) ? "item-selected" : "" } onClick={ () => this.handleSetRootOrgId(org.topOrg.id) }>
							<Link to={ `/chats/contacts/org/${org.topOrg.id}` }>组织架构</Link>
						</li>
						{
							org.userOrgs.map(item =>
								(
									<li key={ `org_${item.id}` } className={ (orgId === item.id && rootOrgId !== org.topOrg.id) || (orgId && rootOrgId === item.id) ? "item-selected" : "" } onClick={ () => this.handleSetRootOrgId(item.id) }>
										<Link to={ `/chats/contacts/org/${item.id}` }>{ item.name }</Link>
									</li>
								)
							)
						}
					</ul>
				</div>
				}
				
				{/* <Menu.Item key="all">组织架构</Menu.Item> */}
				
				{/* <div className="groupname" style={ { padding: "10px" } }>
					<Input title="好友用户ID" placeholder="输入联系人ID" onChange={(event) => {this.onIdChange(event)}}></Input>
				</div>
				<Button style={ { margin: "0 10px 10px" } } type="primary" onClick={ this.addContact }>添加好友</Button> */}
				{/* <Menu
					onClick={ this.handleClick }
					onOpenChange={ this.handleOpenChange }
					style={ { width: 300, border: "none" } }
					openKeys={ openMenuKeys }
					selectedKeys={ selectMember ? [`${selectMember.easemobName}`, `${selectMember.username}`] : [] }
					mode="inline"
				>
					{
						arrContacs && arrContacs.map( (contact) => {
							console.log(contact);
							return <Menu.Item key={contact}>{contact}</Menu.Item>
						})
					}
				</Menu> */}
			</div>
		);
	}
}

const mapStateToProps = state => ({
	openMenuKeys: state.openMenuKeys,
	selectMember: state.selectMember,
	userInfo: state.userInfo,
	allContacts: state.allContacts,
	globals: state.globals,
	networkConnection: state.networkConnection,
	org: state.org
});
export default withRouter(connect(mapStateToProps, actionCreators)(MenuList));
