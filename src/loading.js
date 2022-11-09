import React, { Component } from "react";
import { useNavigate } from "react-router-dom";
import { Trans, withTranslation } from "react-i18next";
import LoadingSpinner from './assets/images/loading.gif';

function withRouter(Component){
	function ComponentWithRouterProp(props){
		let navigate = useNavigate();
		return (
			<Component {...props} router={{navigate}}/>
		);
	}
	return ComponentWithRouterProp
}

export class Loading extends Component {
    render () {
        return(
            <div className="bg-overlay">
                <div className="overlay">
                    <img src={LoadingSpinner}/>
                </div>
            </div>
        )
    }
}export default withTranslation() (withRouter(Loading));