import React, { PureComponent } from "react";
import * as actionCreators from "@/stores/actions";
import { connect } from "react-redux";
import { Modal } from "antd";
import { localOrRemoteFile } from "@/utils/local_remote_file";

class ImgPreview extends PureComponent {
	constructor(props){
		super(props);
		this.state = {
			previewVisible: false,
		};
		this.handleCancel = this.handleCancel.bind(this);
		this.handlePreview = this.handlePreview.bind(this);
	}

	handleCancel(){
		this.setState({ previewVisible: false });
	}
	handlePreview(){
		this.setState({ previewVisible: true });
	}

	urlExit(filePath){
		const { remotePath } = this.props;
		console.log("file>>>>", filePath, remotePath);
		let path = localOrRemoteFile(filePath, remotePath);
		console.log("dist path>>", path);
		// if(!path.includes("http") && location.href.includes("http")){
		// 	path = `file://${path}`;
		// }
		return path;
	}

	render(){
		const { url, thumbUrl } = this.props;
		return (
			<div className="message-res">
				<img src={ this.urlExit(thumbUrl) } onClick={ this.handlePreview } />
				<Modal visible={ this.state.previewVisible } footer={ null } onCancel={ this.handleCancel }>
					<img style={ { width: "100%" } } src={ this.urlExit(url) } />
				</Modal>
			</div>);

	}
}
const mapStateToProps = state => ({
});
export default connect(mapStateToProps, actionCreators)(ImgPreview);
