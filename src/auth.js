import React, { Component } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Trans, withTranslation } from "react-i18next";
import api from "./CustomAxios";
import queryString from 'query-string';


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

class Auth extends Component {
    constructor(props) {        
		super(props);

        const query = queryString.parse(props.router.location.search);
        api.get(process.env.REACT_APP_DB_HOST+"/cafe24/index").then(res => {
            const mall_id = query.mall_id;
            const client_id = res.data.clientId;
            const redirect_uri = res.data.redirectUri;
            const state = window.btoa(`${mall_id}:app_install`);
            let scope = "mall.read_application,mall.write_application,";
                scope += "mall.read_category,mall.write_category,";
                scope += "mall.read_product,mall.write_product,";
                scope += "mall.read_collection,mall.write_collection,";
                scope += "mall.read_supply,mall.write_supply,";
                scope += "mall.read_personal,mall.write_personal,";
                scope += "mall.read_order,mall.write_order,";
                scope += "mall.read_community,mall.write_community,";
                scope += "mall.read_customer,mall.write_customer,";
                scope += "mall.read_notification,mall.write_notification,";
                scope += "mall.read_store,mall.write_store,";
                scope += "mall.read_promotion,mall.write_promotion,";
                scope += "mall.read_salesreport,";
                scope += "mall.read_shipping,mall.write_shipping,";
                scope += "mall.read_translation,mall.write_translation";
            const URI =  `https://${mall_id}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=${client_id}&state=${state}&redirect_uri=${redirect_uri}&scope=${scope}`;
            
            
            this.setState({
                mallId: mall_id,
                clientId: client_id,
                redirectUri: redirect_uri,
                state: state,
                scope: scope,
            });

            window.location.replace(URI);
            
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
}export default withTranslation() (withRouter(Auth));