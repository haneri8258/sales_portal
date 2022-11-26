/**
 * This application was developed by haneri.jeong of ITS Community at 2022 years.
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
			{path:'/bank_slip', state: 'bankSlipMenuOpen'},
			{path:'/bank_slip_manager', state: 'bankSlipManagerMenuOpen'},
			{path:'/sku_code', state: 'skuCodeMenuOpen'}, 
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
                                </ul>
                            </Collapse>
                        </li>
                    </Collapse> 
                    
                    <Collapse in={this.isShowYn('/bank_slip')}>
                        {/*  Bank Slip 거래처 */}
                        <li className={ this.isPathActive('/bank_slip') ? 'nav-item active' : 'nav-item' }>
                            <div className={ this.state.bankSlipMenuOpen ? 'nav-link menu-expanded' : 'nav-link' } onClick={ () => this.toggleMenuState('bankSlipMenuOpen') } data-toggle="collapse">
                                <span className="menu-title"><div><Trans>Bank Slip </Trans></div></span>
                                <i className="menu-arrow"></i>
                                <i className="mdi mdi-account-cog menu-icon"></i>
                            </div>
                            <Collapse in={ this.state.bankSlipMenuOpen }>
                                <ul className="nav flex-column sub-menu">
                                    {/* Bank Slip 증빙 */}
                                    <Collapse in={this.isShowYn('/bank_slip/proof_list')}>
                                        <li className="nav-item"> <Link className={ this.isPathActive('/bank_slip/proof_list') ? 'nav-link active' : 'nav-link' } to="/bank_slip/proof_list"><div><Trans>Bank Slip 증빙</Trans></div></Link></li>
                                    </Collapse>
                                    {/* Bank Slip 요청현황 */}
                                    <Collapse in={this.isShowYn('/bank_slip/request_list')}>
                                        <li className="nav-item"> <Link className={ this.isPathActive('/bank_slip/request_list') ? 'nav-link active' : 'nav-link' } to="/bank_slip/request_list"><div><Trans>Bank Slip 요청현황</Trans></div></Link></li>
                                    </Collapse>
                                    {/* 인보이스별 Bank Slip 현황 */}
                                    <Collapse in={this.isShowYn('/bank_slip/invoice_list')}>
                                        <li className="nav-item"> <Link className={ this.isPathActive('/bank_slip/invoice_list') ? 'nav-link active' : 'nav-link' } to="/bank_slip/invoice_list"><div><Trans>인보이스별 Bank Slip 현황</Trans></div></Link></li>
                                    </Collapse>
                                 </ul>   
                             </Collapse>
                         </li>
                     </Collapse>
                     
                     <Collapse in={this.isShowYn('/bank_slip_manager')}>
                          {/*  Bank Slip Manager (담당자) */}
                         <li className={ this.isPathActive('/bank_slip_manager') ? 'nav-item active' : 'nav-item' }>
                            <div className={ this.state.bankSlipManagerMenuOpen ? 'nav-link menu-expanded' : 'nav-link' } onClick={ () => this.toggleMenuState('bankSlipManagerMenuOpen') } data-toggle="collapse">
                                <span className="menu-title"><div><Trans>Bank Slip </Trans></div></span>
                                <i className="menu-arrow"></i>
                                <i className="mdi mdi-account-cog menu-icon"></i>
                            </div>     
                             <Collapse in={ this.state.bankSlipManagerMenuOpen }> 
                             	<ul className="nav flex-column sub-menu">     
                                    {/* Bank Slip 확인 */}
                                    <Collapse in={this.isShowYn('/bank_slip_manager/confirm_list')}>
                                        <li className="nav-item"> <Link className={ this.isPathActive('/bank_slip_manager/confirm_list') ? 'nav-link active' : 'nav-link' } to="/bank_slip_manager/confirm_list"><div><Trans>Bank Slip 확인</Trans></div></Link></li>
                                    </Collapse>
                                    {/* 인보이스별 Bank Slip 현황 */}
                                    <Collapse in={this.isShowYn('/bank_slip_manager/invoice_list')}>
                                        <li className="nav-item"> <Link className={ this.isPathActive('/bank_slip_manager/invoice_list') ? 'nav-link active' : 'nav-link' } to="/bank_slip_manager/invoice_list"><div><Trans>인보이스별 Bank Slip 현황</Trans></div></Link></li>
                                    </Collapse>
                                </ul>
                            </Collapse>
                        </li>
                    </Collapse>
                    
                    <Collapse in={this.isShowYn('/sku_code')}>
                        {/*  SKU 코드관리 */}
                        <li className={ this.isPathActive('/sku_code') ? 'nav-item active' : 'nav-item' }>
                            <div className={ this.state.skuCodeMenuOpen ? 'nav-link menu-expanded' : 'nav-link' } onClick={ () => this.toggleMenuState('skuCodeMenuOpen') } data-toggle="collapse">
                                <span className="menu-title"><div><Trans>SKU 코드관리</Trans></div></span>
                                <i className="menu-arrow"></i>
                                <i className="mdi mdi-account-cog menu-icon"></i>
                            </div>
                            <Collapse in={ this.state.skuCodeMenuOpen }>
                                <ul className="nav flex-column sub-menu">
                                    {/* SKU 코드관리 */}
                                    <Collapse in={this.isShowYn('/sku_code/mng_list')}>
                                        <li className="nav-item"> <Link className={ this.isPathActive('/sku_code/mng_list') ? 'nav-link active' : 'nav-link' } to="/sku_code/mng_list"><div><Trans>SKU 코드 관리</Trans></div></Link></li>
                                    </Collapse>
                                </ul>
                            </Collapse>
                            <Collapse in={ this.state.skuCodeMenuOpen }>
                                <ul className="nav flex-column sub-menu">
                                    {/* SKU 코드관리 이력 */}
                                    <Collapse in={this.isShowYn('/sku_code/hist_list')}>
                                        <li className="nav-item"> <Link className={ this.isPathActive('/sku_code/hist_list') ? 'nav-link active' : 'nav-link' } to="/sku_code/hist_list"><div><Trans>SKU 코드 관리 이력</Trans></div></Link></li>
                                    </Collapse>
                                </ul>
                            </Collapse>
                      		<Collapse in={ this.state.skuCodeMenuOpen }>
                                <ul className="nav flex-column sub-menu">
                                    {/* SKU 코드관리 (담당자) */}
                                    <Collapse in={this.isShowYn('/sku_code/mng_manager_list')}>
                                        <li className="nav-item"> <Link className={ this.isPathActive('/sku_code/mng_manager_list') ? 'nav-link active' : 'nav-link' } to="/sku_code/mng_manager_list"><div><Trans>SKU 거래처 SKU 코드 관리</Trans></div></Link></li>
                                    </Collapse>
                                </ul>
                            </Collapse> 
                            <Collapse in={ this.state.skuCodeMenuOpen }>
                                <ul className="nav flex-column sub-menu">
                                    {/* SKU 코드기준 (담당자) */}
                                    <Collapse in={this.isShowYn('/sku_code/base_manager_list')}>
                                        <li className="nav-item"> <Link className={ this.isPathActive('/sku_code/base_manager_list') ? 'nav-link active' : 'nav-link' } to="/sku_code/base_manager_list"><div><Trans>SKU 거래처 SKU 코드 기준</Trans></div></Link></li>
                                    </Collapse>
                                </ul>
                            </Collapse>
                            <Collapse in={ this.state.skuCodeMenuOpen }>
                                <ul className="nav flex-column sub-menu">
                                    {/* SKU 코드기준 (담당자) */}
                                    <Collapse in={this.isShowYn('/sku_code/hist_manager_list')}>
                                        <li className="nav-item"> <Link className={ this.isPathActive('/sku_code/hist_manager_list') ? 'nav-link active' : 'nav-link' } to="/sku_code/hist_manager_list"><div><Trans>SKU SKU 코드 관리 이력</Trans></div></Link></li>
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