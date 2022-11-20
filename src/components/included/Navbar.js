/**
 * This application was developed by YS.Im, HJ.Yoon and GH.Zhang of GIE&S(www.giens.co.kr) at 2022 years.
 */
import React, { Component } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { Trans, withTranslation } from 'react-i18next';
import { alert } from "react-bootstrap-confirmation";
import { confirm } from "react-bootstrap-confirmation";
import api from '../../CustomAxios';
import TrafficLight from 'react-trafficlight';


/**
 * 설명 : 공통 - 페이지 상단
 *
 * @author		: 정병진
 * @since 		: 2022.04.15
 * @reference   : 참조 - 
 */
 function withRouter(Component){
    function ComponentWithRouterProp(props){
        let navigate = useNavigate();
        return (
            <Component {...props} router={{navigate}}/>
        );
    }
    return ComponentWithRouterProp
}

class Navbar extends Component {
	constructor(props) {
		super(props);
		this.state = {
            _USER_ID: sessionStorage.getItem('_USER_ID'),
            _USER_NAME: sessionStorage.getItem('_USER_NAME'),
            _CLIENT_ID: sessionStorage.getItem('_CLIENT_ID'),
            _CLIENT_NAME: sessionStorage.getItem('_CLIENT_NAME'),
            _GROUP_ID: sessionStorage.getItem('_GROUP_ID'),
            _ORGNZ_ID: sessionStorage.getItem('_ORGNZ_ID'),
            _USER_STATUS: sessionStorage.getItem('_USER_STATUS'),
            _USER_TYPE: sessionStorage.getItem('_USER_TYPE'),
            _LOCK_AT: sessionStorage.getItem('_LOCK_AT'),
            _USE_AT: sessionStorage.getItem('_USE_AT'),

            redOn : false,
            yellowOn : false,
            greenOn : false
		};  
	}
      
    toggleOffcanvas() {
        document.querySelector('.sidebar-offcanvas').classList.toggle('active');
    }

 	componentDidMount() {  
	     api.post(process.env.REACT_APP_DB_HOST + "/monitoring/getApiTrafficLight" ).then(res=>{
			if(res.status === 200){
			    if(res.data.FAIL_CNT === 0 ) {
                    this.setState({greenOn : true});
			    }else if( (res.data.FAIL_CNT / res.data.SUCCESS_CNT) < 10  ){ 
                    this.setState({yellowOn : true});
			    } else {  
                     this.setState({redOn : true});
			   }
            }
        })
	}	

    changeLanguage(e, lang) {
        e.preventDefault();
        const { i18n } = this.props;
        i18n.changeLanguage(lang);
    }


    render () {  
		
        // 사용자 로그아웃 처리
        const onLogout = async (event) => {
            event.preventDefault();
            
			// 사용자 로그정보 저장
			let params = {};
			params.userId = this.state._USER_ID;
			debugger;
			await api.post(process.env.REACT_APP_DB_HOST + "/common/updUserLog", params).then(response => {
                if(response.status === 200) {
                    sessionStorage.removeItem('_USER_ID');
                    sessionStorage.removeItem('_USER_NAME');
                    sessionStorage.removeItem('_CLIENT_ID');
                    sessionStorage.removeItem('_CLIENT_NAME');
                    sessionStorage.removeItem('_GROUP_ID');
                    sessionStorage.removeItem('_ORGNZ_ID');
                    sessionStorage.removeItem('_USER_STATUS');
                    sessionStorage.removeItem('_USER_TYPE');
                    sessionStorage.removeItem('_LOCK_AT');
                    sessionStorage.removeItem('_USE_AT');
                    sessionStorage.removeItem('_JWT_TOKEN');
                    this.props.router.navigate('/login', {replace: true});
                }
			});
			
		}
		
		// 브라우저 종료 시 사용자 로그 저장
		window.addEventListener('beforeunload', async (event) => { 
            event.preventDefault();
            
			let params = {};
			params.userId = this.state._USER_ID;
			
			await api.post(process.env.REACT_APP_DB_HOST + "/common/updUserLog", params).then(response => {
                if(response.status === 200) {
                    console.log("[00092] Log Out :: ", response.data);
                }
			});
		});


        return (
            <nav className="navbar default-layout-navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
                <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
                    <Link className="navbar-brand brand-logo" to="/"><img src={require("../../assets/images/ubello.png")} alt="logo" /></Link>
                    <Link className="navbar-brand brand-logo-mini" to="/"><img src={require("../../assets/images/ubello_mini.png")} alt="logo" /></Link>
                </div>
                <div className="navbar-menu-wrapper d-flex align-items-stretch">
                    <button className="navbar-toggler navbar-toggler align-self-center" type="button" onClick={ () => document.body.classList.toggle('sidebar-icon-only') }>
                        <span className="mdi mdi-menu"></span>
                    </button>
                    
                    <ul className="navbar-nav navbar-nav-right">
                        <li className="nav-item">
                            <Dropdown>
                                <Dropdown.Toggle className="nav-link">
                                    <span><i className="mdi mdi-account-circle me-2"></i>{this.state._USER_NAME}</span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="navbar-dropdown">
                                    <Dropdown.Item href="!#" onClick={(event) => onLogout(event)}>Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </li>


                        {/* 다국어 처리 
                        <li className="nav-item">
                            <Dropdown align="end">
                                <Dropdown.Toggle className="nav-link">
                                    <span><i className="mdi mdi-translate me-2"></i><Trans>Lang</Trans></span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="navbar-dropdown">
                                    <Dropdown.Item href="!#" className="text-center" onClick={(e, lang) => this.changeLanguage(e, "ko")}>
                                        <div>한국어</div>
                                    </Dropdown.Item>
                                    <Dropdown.Item href="!#" onClick={(e, lang) => this.changeLanguage(e, "en")}>
                                        <div>English</div>
                                    </Dropdown.Item>
                                    <Dropdown.Item href="!#" onClick={(e, lang) => this.changeLanguage(e, "cn")}>
                                        <div>中文</div>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </li> 
                        */}
                    </ul>                    
                    <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" onClick={this.toggleOffcanvas}>
                        <span className="mdi mdi-menu"></span>
                    </button>
                </div>
            </nav>
        );
    }
}

export default withTranslation() (withRouter(Navbar));
