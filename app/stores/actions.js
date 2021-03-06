import api from "../api";

export const globalAction = payload => ({
	type: "app/initGlobal",
	payload
});
export const networkConnectAction = payload => ({
	type: "app/networkConnection",
	payload
});
export const loginState = payload => ({
	type: "app/setLogin",
	payload,
});
export const logout = payload => ({
	type: "app/setLogout",
	payload
});
export const rootOrg = payload => ({
	type: "app/getRootOrg",
	payload
});
export const childOrg = payload => ({
	type: "app/getChildOrg",
	payload
});
export const membersOfOrg = payload => ({
	type: "app/membersOfOrg",
	payload
});
export const getAllMembers = payload => ({
	type: "app/getAllMembers",
	payload
});
export const memberOfSelect = payload => ({
	type: "app/selectMember",
	payload
});
export const setMemberInfo = payload => ({
	type: "app/setMemberInfo",
	payload
});
export const keysOfOpenMenu = payload => ({
	type: "app/openSubMenu",
	payload
});
export const keyOfCurrentOpenMenu = payload => ({
	type: "app/openCurrentMenu",
	payload
});
export const conversationOfSelect = payload => ({
	type: "app/selectConversation",
	payload
});
export const msgsOfConversation = payload => ({
	type: "app/msgsOfConversation",
	payload
});
export const selectConversationOfList = payload => ({
	type: "app/selectConversationOfList",
	payload
});
export const initConversationsActiton = payload => ({
	type: "app/initConversations",
	payload
});
export const msgsOfHistory = payload => ({
	type: "app/msgsOfHistory",
	payload
});
export const sendMsg = payload => ({
	type: "app/sendMsg",
	payload
});
export const receiveMsgAction = payload => ({
	type: "app/receiveMsg",
	payload
});
export const selectMembersAction = payload => ({
	type: "app/selectMembersOfGroup",
	payload
});
export const cancelMembersAction = payload => ({
	type: "app/cancelMembersOfGroup",
	payload
});
export const cancelCreateGroupAction = payload => ({
	type: "app/cancelCreateGroup",
	payload
});
export const editMembersGroupAction = payload => ({
	type: "app/editMembersOfGroup",
	payload
});
export const cancelEditGroupAction = payload => ({
	type: "app/cancelEditGroup",
	payload
});

export const selectDelMembersAction = payload => ({
	type: "app/selectDelMembersOfGroup",
	payload
});
export const cancelDelMembersAction = payload => ({
	type: "app/cancelDelMembersOfGroup",
	payload
});

export const cancelRemoveGroupAction = payload => ({
	type: "app/cancelDeleteGroup",
	payload
});
export const groupManagerAction = payload => ({
	type: "app/groupManager",
	payload
});

export const selectNavAction = payload => ({
	type: "app/selectNav",
	payload
});

// ????????????
export const getMemberInfoAction = payload => ({
	type: "app/getMemberInfo",
	payload
});

// ???????????????
export const changeGroupInfo = payload => ({
	type: "app/changeGroupInfo",
	payload
});
// ???????????????
export const setOwnerAction = payload => ({
	type: "app/setOwner",
	payload
});

// ???????????????
export const setAdminAction = payload => ({
	type: "app/setAdmin",
	payload
});
// ???????????????
export const cancelAdminAction = payload => ({
	type: "app/cancelAdmin",
	payload
});

// ???????????????
export const inviteMemberAction = payload => ({
	type: "app/inveitMembers",
	payload
});

// ?????????????????????
export const receiveMemberJoinGroupAction = payload => ({
	type: "app/memberJoinedGroup",
	payload
});

export const createAGroup = payload => ({
	type: "app/createGroup",
	payload
});

export const getGroupChats = payload => ({
	type: "app/getGroupChats",
	payload
});

export const selectOfGroup = payload => ({
	type: "app/selectOfGroup",
	payload
});

// ???????????????
export const removeMemberAction = payload => ({
	type: "app/removeMembers",
	payload
});

// ???????????????
export const memberLeftGroupAction = payload => ({
	type: "app/memberLeftGroup",
	payload
});

// ?????????
export const leaveGroupAction = payload => ({
	type: "app/leaveGroup",
	payload
});
// ?????????
export const destoryGroup = payload => ({
	type: "app/destoryGroup",
	payload
});

// ????????????????????????????????????
export const receiveJoinGroupAction = payload => ({
	type: "app/joinGroup",
	payload
});

// ??????????????????
export const clearAllMessagesAction = payload => ({
	type: "app/clearAllMessages",
	payload
});

// ???????????????????????????
export const searchConversationAction = payload => ({
	type: "app/searchConversationAction",
	payload
});

// ????????????
export const deleteConversationAction = payload => ({
	type: "app/deleteConversation",
	payload
});
//
export const changeGroupInfoAction = payload => ({
	type: "app/getGroupMembers",
	payload
});

// ??????????????????
export const changeUserInfo = payload => ({
	type: "app/changeUserInfo",
	payload
});

// ????????????
export const addMemberInfoAction = payload => ({
	type: "app/addMemberInfo",
	payload
});

// ????????????
export const addOrgAction = payload => ({
	type: "app/addOrg",
	payload
});

// ??????????????????
export const changeOrgAction = payload => ({
	type: "app/changeOrg",
	payload
});

// ????????????
export const removeOrgAction = payload => ({
	type: "app/removeOrg",
	payload
});

// ?????????????????????
export const changeMemberInfoAction = payload => ({
	type: "app/changeMemberInfo",
	payload
});
export const deleteMemberAction = payload => ({
	type: "app/deleteMember",
	payload
});

//
export const getGroupInfo = payload => ({
	type: "app/getGroupInfo",
	payload
});

// ????????????
export const recallMessageAction = payload => ({
	type: "app/recallMessage",
	payload
});

// ????????????
export const deleteMessageAction = payload => ({
	type: "app/deleteMessage",
	payload
});

// ??? @
export const groupAtAction = payload => ({
	type: "app/receiveAtMsg",
	payload
});

// ?????????????????????
export const unReadMsgCountAction = payload => ({
	type: "app/unReadMsgCount",
	payload
});

// ???????????????
export const conferenceAction = payload => ({
	type: "app/conference",
	payload
});

export const setNotice = (content, level = "success") => ({
	type: "app/setNotice",
	payload: {
		content,
		level,
	},
});

// ???????????????????????????
export const searchMember = payload => ({
	type: "app/searchMember",
	payload
});

// ???????????????
export const searchMembersOfConcat = payload => ({
	type: "app/searchMembersOfConcat",
	payload
});

// ????????????
export const searchGroupAction = payload => ({
	type: "app/searchGroup",
	payload
});

export const clearNotice = () => ({
	type: "app/clearNotice",
});

export const markRequestPending = key => ({
	type: "app/markRequestPending",
	meta: { key },
});

// ??????????????????
export const setAllContacts = (payload) => ({
	type:"app/setcontacts",
	payload
});

// ??????????????????
export const addContact = (payload) => ({
	type:"app/addcontacts",
	payload
});

// ??????????????????
export const removeContact = (payload) => ({
	type:"app/removecontacts",
	payload
});

// ??????????????????
export const setGroupChats = (payload) => ({
	type:"app/setgroupchats",
	payload
})

// ?????????????????????????????????????????????
export const setSelectConvType = (payload) => ({
	type:"app/isSelectCovGroup",
	payload
})

//  ??????????????????
export const requestLogin = (payload) => (
	{
		type: "app/setLogin",
		payload
	}
)

export const getPublicGroupList = payload => ({
	type: "group/getPublicGroup",
	payload
});

export const clearPublicGroupList = payload => ({
	type: "clear/getPublicGroup",
	payload
})

export const endcall = payload => ({
	type:"app/endcall",
	payload
})

export const setsession = payload => ({
	type:"app/setsession",
	payload
})

export const addvideocontrol = payload => ({
	type: "app/addvideocontrol",
	payload
})
