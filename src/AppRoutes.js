/**
 * This application was developed by Haneri.jeong  of ITS Community at 2022 years.
 */
import React, { Component, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Spinner from './components/included/Spinner';

const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));

const Login = lazy(() => import( './login'));
const Auth = lazy(() => import( './auth'));
const AuthRedirect = lazy(() => import( './auth_redirect'));
 
const OrderList = lazy(() => import( './components/order_report/list'));
const OrderOrder = lazy(() => import( './components/order/order'));

const ProofList = lazy(() => import( './components/bank_slip/proof_list'));
const RequestList = lazy(() => import( './components/bank_slip/request_list'));
const InvoiceList = lazy(() => import( './components/bank_slip/invoice_list'));
const ConfirmList = lazy(() => import( './components/bank_slip_manager/confirm_list'));
const InvoiceManagerList = lazy(() => import( './components/bank_slip_manager/invoice_list'));

const MngList = lazy(() => import( './components/sku_code/mng_list'));
const BaseList = lazy(() => import( './components/sku_code/base_list'));
const MngManagerList = lazy(() => import( './components/sku_code/mng_manager_list'));
const BaseManagerList = lazy(() => import( './components/sku_code/base_manager_list'));

/*
* 위에 메뉴추가  
*/


const BlankPage = lazy(() => import( './components/general-pages/BlankPage'));

/**
 * 설명 : 라우터
 *
 * @author		: 정병진
 * @since 		: 2022.04.15
 * @reference   : 참조 - 
 */
class AppRoutes extends Component {
	render () {
		return (
			<Suspense fallback={<Spinner/>}>
				<Routes>
                    <Route exact path="/dashboard" element={ <Dashboard/> } />
                    <Route exact path="/login" element={ <Login/> } />
                    <Route path="/order_report/list" element={ <OrderList/> } />
                    <Route path="/order/order" element={ <OrderOrder/> } />
                    
                    <Route path="/bank_slip/proof_list" element={ <ProofList/> } />
                    <Route path="/bank_slip/request_list" element={ <RequestList/> } />
                    <Route path="/bank_slip/invoice_list" element={ <InvoiceList/> } />
                    <Route path="/bank_slip_manager/confirm_list" element={ <ConfirmList/> } />
                    <Route path="/bank_slip_manager/invoice_list" element={ <InvoiceManagerList/> } />
                    
                    <Route path="/sku_code/mng_list" element={ <MngList/> } />
                    <Route path="/sku_code/base_list" element={ <BaseList/> } />
                    <Route path="/sku_code/mng_manager_list" element={ <MngManagerList/> } />
                    <Route path="/sku_code/base_manager_list" element={ <BaseManagerList/> } />
                    
                    <Route path="/general-pages/blank-page" element={ <BlankPage/> } /> 
                    <Route path="/" element={<Navigate to="/dashboard" />}/>
                    
                    
/*
* 위에 Route를추가  
*/
                  
				</Routes>
			</Suspense>
		);
	}
}

export default AppRoutes;