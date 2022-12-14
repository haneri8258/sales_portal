/**
 * This application was developed by YS.Im, HJ.Yoon and GH.Zhang of GIE&S at 2022 years.
 */
import React, { Component} from "react"; 

import { Form,Modal} from "react-bootstrap";
import Grid from "@toast-ui/react-grid";
import { Trans, withTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import LinkInGrid from "../utils/linkInGrid";
import { useNavigate } from "react-router-dom";
import { alert } from "react-bootstrap-confirmation";
import { MultiSelect } from "react-multi-select-component";

import api from '../../CustomAxios';
import Pagination from "react-js-pagination";
import ExcelJS from 'exceljs';
import TuiGrid from 'tui-grid';
import { Loading } from "../../loading";
/**
 * 설명 : 제품별 오더 현황 레포트
 *
 * @author		: 정병진
 * @since 		: 2022.11.08
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
class OrdersList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			startDate:"",
			endDate : "",
			isOpenModal : false,
			
			searchKeyPlant :"",
			searchKeyPosi  :"",
			searchKeyMatnr :"",
			searchKeyBatch :"",
			searchKeyMRPMgr :"",
			searchKeyVkgrpT :"",
		
			gridData : [],
            pageInfo : {
                totalPage : 0,
                totalCount : 0
            },
            activePage : 1,
            perPage : 20,
            pageNumber : "",
			selected : [], 
			
			_USER_ID: sessionStorage.getItem('_USER_ID'),
			_USER_NAME: sessionStorage.getItem('_USER_NAME'),
			_STORE_NO: sessionStorage.getItem('_STORE_NO'),
			_STORE_NAME: sessionStorage.getItem('_STORE_NAME'),
			_GROUP_ID: sessionStorage.getItem('_GROUP_ID'),
		};
	}
    componentDidMount(){
        TuiGrid.applyTheme("striped");
    }


	onChange = (e) =>{
		this.setState({
			[e.target.name] : e.target.value
		});
	}

	onSelect = (selectedItem) =>{
		this.setState({
			selected : selectedItem
		});
	}
	
	onRemove = (selectedItem) =>{
		 
	}
	
	openModal = () =>{
		this.setState({
			isOpenModal : true
		});
	}

	closeModal = () =>{
		this.setState({
			isOpenModal : false
		});
	}

	gridRef = React.createRef();

	onGridMounted = (e) => { 
        this.getOrders();
	}

    getOrders = () => {
        const params = {};
        params.rowStart = 0;
        params.perPage = this.state.perPage;

        if(sessionStorage.getItem("_ADMIN_AUTH") === "PART"){
			params.storeNo = sessionStorage.getItem("_STORE_NO");
		} else {
			params.storeNo = "";
		} 
        axios.all([
             api.get(process.env.REACT_APP_DB_HOST+"/api/v1/orders/reportList",{params : params})
            ,api.get(process.env.REACT_APP_DB_HOST+"/api/v1/orders/reportRowCount",{params : params}) 
        ]).then(
        	axios.spread((res1,res2)=>{   
				this.setState({
					gridData : res1.data,
                    pageInfo : res2.data 
				});
				this.gridRef.current.getInstance().resetData(res1.data);
            })
        ).catch(err => {
			if(err.response){
				console.log(err.response.data);
			}else if(err.request){
				console.log(err.request);
			}else{
				console.log('Error', err.message);
			}
		});
    }
    
	timestamp = (date)=>{
		date.setHours(date.getHours() + 9);
		return date.toISOString().replace('T', ' ').substring(0, 10); 
	}
 
    onGridUpdatePages = (params)=>{  
        axios.all([
             api.get(process.env.REACT_APP_DB_HOST+"/api/v1/orders/reportList",{params : params})
            ,api.get(process.env.REACT_APP_DB_HOST+"/api/v1/orders/reportRowCount",{params : params}) 
            
        ]).then(
            axios.spread((res1,res2)=>{
            	this.setState({
                    gridData : res1.data,
                    pageInfo : res2.data,
                    activePage : Number(params.pageNumber),
                })
                this.gridRef.current.getInstance().resetData(res1.data);
            })
        ).catch(err => {
			if(err.response){
				console.log(err.response.data);
			}else if(err.request){
				console.log(err.request);
			}else{
				console.log('Error', err.message);
			}
		});
    }
    onResetGrid = () => {
		this.setState({
			searchKeyPlant :"",
			searchKeyPosi  :"",
			searchKeyMatnr :"",
			searchKeyBatch :"",
			searchKeyMRPMgr :"" ,
			searchKeyVkgrpT :"",
			selected : [],
            pageNumber : 1,
            perPage : 20
		});
        const params={};
        params.rowStart = 0;
        params.perPage =20;
        this.onGridUpdatePages(params);
	}

    onChangePerPage = (perPage,e) =>{
        this.setState({
            perPage : Number(perPage),
        })
        const params = {};
 
		params.searchKeyPlant = this.state.searchKeyPlant;
		params.searchKeyPosi = this.state.searchKeyPosi; 

		params.searchKeyMatnr = this.state.searchKeyMatnr;
		params.searchKeyBatch = this.state.searchKeyBatch;
		
		params.searchKeyMRPMgr = this.state.searchKeyMRPMgr;
		params.searchKeyVkgrpT = this.state.searchKeyVkgrpT;
		
        params.pageNumber = 1;
        params.rowStart = 0;
        params.perPage = Number(perPage);
        this.onGridUpdatePages(params);
    }


    onChangePage = (pageNumber) => {
        this.setState({
            pageNumber : pageNumber
        });
        const params = {};
 
		params.searchKeyPlant = this.state.searchKeyPlant;
		params.searchKeyPosi = this.state.searchKeyPosi; 

		params.searchKeyMatnr = this.state.searchKeyMatnr;
		params.searchKeyBatch = this.state.searchKeyBatch;
		
		params.searchKeyMRPMgr = this.state.searchKeyMRPMgr;
		params.searchKeyVkgrpT = this.state.searchKeyVkgrpT;
        
        params.rowStart = (Number(pageNumber-1))*Number(this.state.perPage);
        params.perPage = Number(this.state.perPage);
        params.pageNumber = pageNumber;
		
		//params.storeNo = sessionStorage.getItem("_STORE_NO");
        this.onGridUpdatePages(params);

    }

    onSearch = (e) =>{
		const params = {};
 
		params.searchKeyPlant = this.state.searchKeyPlant;
		params.searchKeyPosi = this.state.searchKeyPosi; 
		params.searchKeyMatnr = this.state.searchKeyMatnr;
		
		 
		params.searchKeyBatch ="";
		for(let i in this.state.selected){ 
			params.searchKeyBatch += this.state.selected[i].value+ ",";
		}
		
		params.searchKeyMRPMgr = this.state.searchKeyMRPMgr;
		params.searchKeyVkgrpT = this.state.searchKeyVkgrpT;
		
        params.pageNumber = 1;
        params.rowStart = 0;
        params.perPage = Number(this.state.perPage);
		params.storeNo = sessionStorage.getItem("_STORE_NO");
        this.onGridUpdatePages(params);
	} 

	render() {
        const {pageInfo} = this.state; 
		const options = [
		  { label: "v0", value: "0" },
		  { label: "v1", value: "1" },
		  { label: "v2", value: "2" }, //, disabled: true
		  { label: "v3", value: "3" },
		  { label: "v4", value: "4" },
		  { label: "v5", value: "5" },
		  { label: "v6", value: "6" },
		  { label: "v7", value: "7" },
		  { label: "v8", value: "8" },
		  { label: "v9", value: "9" }
		];
		
		const onClickedAtag = (e, rowKey) => {
			e.preventDefault();
            const productName = this.gridRef.current.getInstance().getRow(rowKey).productName;
            if(productName === null || productName === ""){
                alert("미연동 상품입니다. 관리자에게 문의 바랍니다.");
                return;
            }
			const orderNo = this.gridRef.current.getInstance().getRow(rowKey).orderNo;
			this.props.router.navigate('/order/order/'+orderNo, {state : {"orderNo": orderNo}});
		}

		const columns = [
 			{ name: "matnr", header: "자재", width: 200, sortable: true,align: "center"},
			{ name: "nameKr", header: "자재명", width: 200, sortable: true,align: "left"},
			{ name: "managermrpname", header: "MRP 관리자", width: 200, sortable: true,align: "left"},
			{ name: "charg", header: "배치", width: 150, sortable: true,align: "center"},
			{ name: "labst", header: "재고량", width: 150, sortable: true,align: "right" },
			{ name: "vkgrp", header: "팀코드", width: 150, sortable: true,align: "center" },  
			{ name: "vkgrpT", header: "팀명", width: 200, sortable: true,align: "left" },  
			{ name: "orderQty", header: "오더량", width: 150, sortable: true,align: "right"},
			{ name: "cancelQty", header: "취소량", width: 150, sortable: true,align: "right"},
			{ name: "invoiceQty", header: "납품량", width: 150, sortable: true,align: "right"}
		];

		return (
			<div>
                {this.state.loading && (<Loading/>)}
				<div className="page-header">
					<h3 className="page-title">제품별 오더 현황 레포트</h3>
					<nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"> 
                                Order Report
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                List
                            </li>
                        </ol>
					</nav>
				</div>
				<div className="row">
					<div className="col-12 grid-margin">
                        <div className="card">
                            <div className="card-body">
                                <div>
                                    <div className="text-end">
                                        <ul className="list-inline mb-1">
											<li className="list-inline-item me-1">
                                                <Form.Text><Trans>플랜트</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <Form.Select name="searchKeyPlant" className="form-select-sm" disabled onChange={this.onChange} value={this.state.searchKeyPlant}>
                                                    <option value="null">선택해주세요</option> 
                                                </Form.Select>
                                            </li>
											<li className="list-inline-item me-1">
                                                <Form.Text><Trans>지정위치</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <Form.Select name="searchKeyPosi" className="form-select-sm" disabled onChange={this.onChange} value={this.state.searchKeyPosi}>
                                                    <option value="null">선택해주세요</option>
                                                    <option value="100">지정위치1</option> 
                                                </Form.Select>
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <Form.Text><Trans>자재</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1"> 
                                                <Form.Control type="text" className="form-control" size="sm" name="searchKeyMatnr" value={this.state.searchKeyMatnr} onChange={this.onChange}
                                                        style={{"minHeight": "1rem"}}placeholder="자재를입력하세요">
                                                </Form.Control> 
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <Form.Text><Trans>배치</Trans></Form.Text>
                                            </li>
                                            
                                            <li className="list-inline-item me-1">
                                                  <MultiSelect 
                                                    style="{{
													    'minWidth' : '250px', 
													    'minHeight': '1rem'
													}}"                               
                                                    onChange={this.onSelect} 
                                                  	options={options}
											        value={this.state.selected} 
													onSelect={this.onSelect}  
													onRemove={this.onRemove}  
											        labelledBy="선택해주세요"
											      /> 
											      
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <Form.Text><Trans>MRP 관리자</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <Form.Select name="searchKeyMRPMgr" className="form-select-sm" onChange={this.onChange} value={this.state.searchKeyMRPMgr}>
                                                    <option value="">전체</option>
                                                    <option value="100">일반(자재)포장</option>
                                                    <option value="200">특판(제품)포장</option>
                                                    <option value="300">ODM (국내)</option>
                                                    <option value="310">ODM (해외)</option>
                                                    <option value="900">기타</option>
                                                </Form.Select>
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <Form.Text><Trans>영업그룹</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1"> 
                                                <Form.Control type="text" className="form-control" size="sm" name="searchKeyVkgrpT" value={this.state.searchKeyVkgrpT} onChange={this.onChange}
                                                        style={{"minHeight": "1rem"}}placeholder="영업그룹을 입력하세요">
                                                </Form.Control> 
                                            </li>
                                           
                                            <li className="list-inline-item me-1">
                                                <button type="button" className="btn btn-sm btn-success"  onClick={this.onSearch}>
                                                    <Trans>검색</Trans>
                                                </button>
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <button	type="button" className="btn btn-sm btn-dark" onClick={this.onResetGrid}>
                                                    <Trans>초기화</Trans>
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
					</div>
				</div>
				<div className="row">
					<div className="col-12 grid-margin">
						<div className="card">
							<div className="card-body">
								<div>
									<div className="">                                        
										<Grid columns={columns} onGridMounted={(e) => this.onGridMounted(e)} ref={this.gridRef} rowHeaders={["rowNum"]}
												scrollX={true} columnOptions={{frozenCount : 0}}>
										</Grid>
									</div>
                                    <div className="ms-5">
                                        <Pagination totalItemsCount={pageInfo.totalCount} onChange={this.onChangePage} activePage={this.state.activePage} itemsCountPerPage={this.state.perPage} pageRangeDisplayed={10}>
                                        </Pagination>
                                        <ul className=" list-inline mb-1 text-end my-3 mb-3">
                                            <li className="list-inline-item me-1">
                                                <button	type="button" className="btn btn-sm btn-warning " onClick={(e)=>this.onChangePerPage("20",e)}>
                                                    <Trans>20</Trans>
                                                </button>
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <button	type="button" className="btn btn-sm btn-warning " onClick={(e)=>this.onChangePerPage("50",e)}>
                                                    <Trans>50</Trans>
                                                </button>
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <button	type="button" className="btn btn-sm btn-warning " onClick={(e)=>this.onChangePerPage("100",e)}>
                                                    <Trans>100</Trans>
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
								</div>
							</div>
						</div>
					</div>
				</div>

			</div>
		);
	}
}

export default withTranslation()(withRouter(OrdersList));