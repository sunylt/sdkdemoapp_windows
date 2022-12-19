import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { HashRouter as Router } from "react-router-dom";
import "@/style/app.scss";
import IndexView from "@/views/index";
import configureStore from "@/stores";
import { ipcRenderer, remote } from "electron";

const $body = document.body;
const win = remote.getCurrentWindow();

ipcRenderer.on("full-screen-event", (event, data) => {
	$body.classList[data.result ? "add" : "remove"]("page-full-screen");
});

$body.className = window.process.platform === "darwin" ? "mac" : "win";

if(win.isFullScreen()){
	$body.classList.add("page-full-screen");
}

ReactDOM.render(
	<Router>
		<Provider store={ configureStore() }>
			<IndexView />
		</Provider>
	</Router>,
	document.getElementById("appContainer"), () => {
		const loadingElement = document.getElementById("loading");
		loadingElement.parentNode.removeChild(loadingElement);
	}
);
