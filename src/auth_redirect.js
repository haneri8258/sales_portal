import React, { Component } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Trans, withTranslation } from "react-i18next";
import api from "./CustomAxios";
import queryString from 'query-string';
import {Buffer} from 'buffer';


function withRouter(Component){
	function ComponentWithRouterProp(props){
		let navigate = useNavigate();
        let location = useLocation();
		return (
			<Component {...props} router={{navigate, location}}/>
		);
	}
	return ComponentWithRouterProp
}

class AuthRedirect extends Component {
    constructor(props) {        
		super(props);

        const query = queryString.parse(props.router.location.search);
        const [ mall_id ] = Buffer.from(query.state, "base64").toString("utf-8").split(":");
        api.get(process.env.REACT_APP_DB_HOST+"/cafe24/auth", {params: {code: query.code, mallId: mall_id, state: query.state}}).then(res => {
            console.log(res);
            this.props.router.navigate("/login");
        }).catch(err => {
            if(err.response){
                console.log(err.response.data);
            }else if(err.request){
                console.log(err.request);
            }else{
                console.log('Error', err);
            }
        });
    }
    render(){
        return(
            <></>
        )
    }
}export default withTranslation() (withRouter(AuthRedirect));