
import React from "react";
const LENGTH_NAME = -2;

export default  ({ name }) => {
	return (<div className="user-avatar">{name && name.slice(LENGTH_NAME)}</div>);
};
