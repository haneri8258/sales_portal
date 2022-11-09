/**
 * This application was developed by YS.Im, HJ.Yoon and GH.Zhang of GIE&S(www.giens.co.kr) at 2022 years.
 */
import React, { Component } from 'react';
import './App.scss';
import AppRoutes from './AppRoutes';
import Navbar from './components/included/Navbar';
import Sidebar from './components/included/Sidebar';
import Footer from './components/included/Footer';
import Login from './login';
import Auth from './auth';
import { useLocation } from "react-router-dom";
import AuthRedirect from './auth_redirect';

/**
 * 설명 : 전체 화면 관리
 *
 * @author		: 정병진
 * @since 		: 2022.04.15
 * @reference   : 참조 - 
 */

function withRouter(Component) {
    function ComponentWithRouterProp(props) {
        let location = useLocation();
        return (
            <Component
                {...props}
                router={{ location }}
            />
        );
    }

    return ComponentWithRouterProp;
}

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
            isLogin: false
        };
    }

    // 로그인 확인 후 처리
    onCheckLogin() {
        let _USER_ID = sessionStorage.getItem('_USER_ID');
        let _USE_AT = sessionStorage.getItem('_USE_AT');
        let _LOCK_AT = sessionStorage.getItem('_LOCK_AT');

        if(_USER_ID === null || _USER_ID === "") {
            this.setState({ isLogin: false });
        } else {
            this.setState({ isLogin: true });
        }
    }

    componentDidMount() {
        this.onRouteChanged();
    }

    render () {
        let navbarComponent = !this.state.isFullPageLayout ? <Navbar/> : '';
        let sidebarComponent = !this.state.isFullPageLayout ? <Sidebar/> : '';
        let footerComponent = !this.state.isFullPageLayout ? <Footer/> : '';

        const getPage = () => {
            const pathName = this.props.router.location.pathname;
            if(pathName === "/cafe24/index"){
                return <Auth/>;
            }

            if(pathName === "/cafe24/auth"){
                return <AuthRedirect/>;
            }

            if(pathName === "/login"){
                return <Login/>;
            }
        }

        // 로그인 여부
        let authenticated = this.state.isLogin;
        let noNeedAuthenticate = this.state.isFullPageLayout;

		let className01 = "main-panel";
		
		if(!authenticated) {
			className01 = "main-panel-login";
		}

        return (
            <div className="container-scroller">
                { authenticated ? navbarComponent : "" }
				
                <div className="container-fluid page-body-wrapper">
                    { authenticated ? sidebarComponent : "" }
					
                    <div className={className01}>
                        <div className="content-wrapper"> 
                            {noNeedAuthenticate? getPage() : authenticated ? (<AppRoutes/>) : (<Login/>) }
                        </div>
                        { authenticated ? footerComponent : "" }
                    </div>
                </div>
            </div>
        );

    }

    componentDidUpdate(prevProps) {
        if (this.props.router.location !== prevProps.router.location) {
            this.onRouteChanged();
        }
    }

    onRouteChanged() {
        window.scrollTo(0, 0);

        // 로그인 확인
        this.onCheckLogin();

        // 인증 불필요 화면(기본 상단, 하단, 좌측 화면 제외 페이지)
        const fullPageLayoutRoutes = [
            '/error-pages/error-404', 
            '/error-pages/error-500', 
            '/general-pages/landing-page',
            '/login',
            '/cafe24/index',
            '/cafe24/auth',
        ];

        for ( let i = 0; i < fullPageLayoutRoutes.length; i++ ) {
            if (this.props.router.location.pathname === fullPageLayoutRoutes[i]) {
                this.setState({ isFullPageLayout: true});
                document.querySelector('.page-body-wrapper').classList.add('full-page-wrapper');
                break;
            } else {
                this.setState({ isFullPageLayout: false});
                document.querySelector('.page-body-wrapper').classList.remove('full-page-wrapper');
            }
        }
    }

}

export default (withRouter(App));
