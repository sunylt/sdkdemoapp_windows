
import React from "react";
const LENGTH_NAME = -2;

export default  ({ name, onClick = () => {} }) => {
	return (<div className="user-avatar" onClick={ onClick }>{name && name.slice(LENGTH_NAME)}</div>);
};
