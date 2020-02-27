import React from 'react';
import ReactDom from 'react-dom';

export default function Portal(props) {
	return ReactDom.createPortal(
	    props.children,
        document.body
    );
}