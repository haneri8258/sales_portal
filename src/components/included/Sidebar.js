/**
 * This application was developed by YS.Im, HJ.Yoon and GH.Zhang of GIE&S(www.giens.co.kr) at 2022 years.
 */
import React, { Component } from 'react';
import { Link, useLocation} from 'react-router-dom';
import { Collapse } from 'react-bootstrap';
import { Trans, withTranslation } from 'react-i18next';
import api from '../../CustomAxios';

/**
 * 설명 : 공통 - 페이지 좌측
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

class Sidebar extends Component {

	state = {};
    showMenu =[];

	toggleMenuState(menuState) {
		if (this.state[menuState]) {
			this.setState({[menuState] : false});
		} else if(Object.keys(this.state).length === 0) {
			this.setState({[menuState] : true});
		} else {
			Object.keys(this.state).forEach(i => {
				this.setState({[i]: false});
			});
			this.setState({[menuState] : true});
		}
	}


    
	componentDidUpdate(prevProps) {
		if (this.props.router.location !== prevProps.router.location) {
			this.onRouteChanged();
		}
	}

	onRouteChanged() {
		document.querySelector('#sidebar').classList.remove('active');
		Object.keys(this.state).forEach(i => {
			this.setState({[i]: false});
		});

		const dropdownPaths = [
			{path:'/order_report', state: 'orderReportMenuOpen'},
			/*
			{path:'/system_management', state: 'systemsMenuOpen'},
			{path:'/product', state: 'productsMenuOpen'},
			{path:'/order', state: 'ordersMenuOpen'},
			{path:'/inventory', state: 'inventoriesMenuOpen'},
			{path:'/apilink', state: 'apiLinksMenuOpen'},
			{path:'/cssupport', state: 'customerSupportsMenuOpen'},
			{path:'/statistics', state: 'statisticsMenuOpen'},
			{path:'/apimonitoring', state: 'apiMonitoringMenuOpen'},
			{path:'/ptnorder', state: 'partnerOrdersMenuOpen'},
			*/
		];

		dropdownPaths.forEach((obj => {
			if (this.isPathActive(obj.path)) {
				this.setState({[obj.state] : true})
			}
		}));
	}

	render () {
		return (
			<nav className="sidebar sidebar-offcanvas" id="sidebar">
				<ul className="nav">
				
                    <Collapse in={this.isShowYn('/order_report')}>
                        {/*  제품별 오더 */}
                        <li className={ this.isPathActive('/order_report') ? 'nav-item active' : 'nav-item' }>
                            <div className={ this.state.orderReportMenuOpen ? 'nav-link menu-expanded' : 'nav-link' } onClick={ () => this.toggleMenuState('orderReportMenuOpen') } data-toggle="collapse">
                                <span className="menu-title"><div><Trans>제품별 </Trans>&nbsp;<Trans>오더</Trans></div></span>
                                <i className="menu-arrow"></i>
                                <i className="mdi mdi-account-cog menu-icon"></i>
                            </div>
                            <Collapse in={ this.state.orderReportMenuOpen }>
                                <ul className="nav flex-column sub-menu">
                                    {/* 제품별 오더 현황 레포트 */}
                                    <Collapse in={this.isShowYn('/order_report/list')}>
                                        <li className="nav-item"> <Link className={ this.isPathActive('/order_report/list') ? 'nav-link active' : 'nav-link' } to="/order_report/list"><div><Trans>제품별 오더 현황 레포트</Trans></div></Link></li>
                                    </Collapse>
                                    {/* 주문현황(샘플) */}
                                    <Collapse in={this.isShowYn('/order_report/order')}>
                                        <li className="nav-item"> <Link className={ this.isPathActive('/order_report/order') ? 'nav-link active' : 'nav-link' } to="/order_report/order"><div><Trans>주문현황(샘플)</Trans></div></Link></li>
                                    </Collapse>
                                </ul>
                            </Collapse>
                        </li>
                    </Collapse> 
  {/*
  	* 상단에 메뉴를 추가 <Collapse>   </Collapse>
  */
  }                  
                    

				</ul>
			</nav>
		);
	}

	isPathActive(path) {
		return this.props.router.location.pathname.startsWith(path);
	}

    isShowYn(path){
        const menu = this.showMenu;
        if(menu.includes(path)){
            return true;
        } else {
            return false;
        }
    }

	componentDidMount() {
		this.onRouteChanged();
        const groupId = sessionStorage.getItem("_USER_TYPE");
        api.get(process.env.REACT_APP_DB_HOST + "/common/sideMenu" , {params : {"groupId" : groupId}}).then(res=>{
            if(res.status === 200){
                const showMenu = [];
                for(let i in res.data){
                    showMenu.push(res.data[i].menuUrl)
                }
                this.showMenu = showMenu
                showMenu.forEach((obj=>{
                    this.setState({[obj.state] : true})
                }))
            }
        })

		// add class 'hover-open' to sidebar navitem while hover in sidebar-icon-only menu
		const body = document.querySelector('body');

		document.querySelectorAll('.sidebar .nav-item').forEach((el) => {
			el.addEventListener('mouseover', 
			
			
			function() {
				if(body.classList.contains('sidebar-icon-only')) {
					el.classList.add('hover-open');
				}
			});

			el.addEventListener('mouseout', function() {
				if(body.classList.contains('sidebar-icon-only')) {
					el.classList.remove('hover-open');
				}
			});
		});
	}

}

export default withTranslation() (withRouter(Sidebar));