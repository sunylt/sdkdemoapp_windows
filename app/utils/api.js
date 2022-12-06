import { ipcRenderer } from "electron";

const privateConfig = ipcRenderer.sendSync("syncPrivateServerConfig");
const { restServer } = privateConfig;

export const getQRcode =  () => {
	return fetch(`${restServer}/login/qrCode`, { method: "POST" }).then(res => res.json());
};


export const getQRLoginStat = (qrCodeId) => {
	return fetch(`${restServer}/login/qrCode/${qrCodeId}/scan_info`).then(res => res.json());
};

export const fetchTopOrg = (userName) => {
	return fetch(`${restServer}/v1/organization/integration/users/${userName}/organsAndTopOrgans`).then(res => res.json());
};

export const fetchChildOrg = (orgId, showTree) => {
	return fetch(`${restServer}/v1/organization/integration/organs/${orgId}/organs${showTree ? "?type=tree" : ""}`).then(res => res.json());
};

export const fetchOrgUser = (orgId, showAll) => {
	return fetch(`${restServer}/v1/organization/integration/organs/${orgId}/users${showAll ? "?type=all" : ""}`).then(res => res.json());
};

export default restServer;


