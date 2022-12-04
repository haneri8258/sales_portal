/**
 * This application was developed by Haneri.Jeong of ITS Community at 2022 years.
 */
import React, { Component } from "react";
import { Form,Modal} from "react-bootstrap";
import Grid from "@toast-ui/react-grid";
import { Trans, withTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import LinkInGrid from "../utils/linkInGrid";
import { useNavigate } from "react-router-dom";
import { alert } from "react-bootstrap-confirmation";
import api from '../../CustomAxios';
import Pagination from "react-js-pagination";
import ExcelJS from 'exceljs';
import TuiGrid from 'tui-grid';
import { Loading } from "../../loading";
/**
 * 설명 : SKU 코드 관리
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
class MngList extends Component {
	constructor(props) {
		super(props);
		this.state = { 
			isOpenModal : false, 
			searchKeySku :"",
			searchKeyBuyerSku :"",
			searchKeyDesc  :"",
			searchKeyBuyerCode : sessionStorage.getItem('_CLIENT_ID'), 
			
			gridData : [],
            pageInfo : {
                totalPage : 0,
                totalCount : 0
            },
            activePage : 1,
            perPage : 20,
            pageNumber : "",


			_USER_ID: sessionStorage.getItem('_USER_ID'),
			_USER_NAME: sessionStorage.getItem('_USER_NAME'),
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
        this.getSku();
	}

    getSku = () => {
        const params = {};
        params.rowStart = 0;
        params.perPage = this.state.perPage; 
        params.searchKeyBuyerCode  = sessionStorage.getItem('_CLIENT_ID');
        
        axios.all([
             api.get(process.env.REACT_APP_DB_HOST+"/api/v1/skucode/mngList",{params : params})
             ,api.get(process.env.REACT_APP_DB_HOST+"/api/v1/skucode/mngRowCount",{params : params}) 
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
		return date.toISOString().replace('T', ' ').substring(0, 19); 
	}
	
	onSubmit = (e) => { 
		const  skuCreatedList =  this.gridRef.current.getInstance().getModifiedRows().createdRows;  
		const  skuUpdateList =  this.gridRef.current.getInstance().getModifiedRows().updatedRows;  
		debugger; 
		if(skuCreatedList.length === 0 && skuUpdateList ===0 ) {
			alert("추가 및 수정된 내용이 없습니다.");
			return;
		}
		
		for(let i in skuCreatedList){ 
			if(skuCreatedList[i].sku ==='' ){
				alert("SKU Code는 필수 입니다." );
				return;
			}
			if(skuCreatedList[i].clientSku ==='' ){
				alert("Buyer SKU Code는 필수 입니다." );
				return;
			} 
			skuCreatedList[i].clientId  = sessionStorage.getItem('_CLIENT_ID');
			skuCreatedList[i].crtId     =  this.state._USER_ID;
			skuCreatedList[i].updId     =  this.state._USER_ID;
		}
		
		for(let i in skuUpdateList){ 
			if(skuUpdateList[i].sku ==='' ){
				alert("SKU Code는 필수 입니다." );
				return;
			}
			if(skuUpdateList[i].clientSku ==='' ){
				alert("Buyer SKU Code는 필수 입니다." );
				return;
			} 
			skuUpdateList[i].clientId  = sessionStorage.getItem('_CLIENT_ID');
			skuUpdateList[i].crtId     =  this.state._USER_ID;
			skuUpdateList[i].updId     =  this.state._USER_ID;
		}
		let getSku = this.getSku;
		axios.put(process.env.REACT_APP_DB_HOST+"/api/v1/skucode/updateMngList",{skuCreatedList : skuCreatedList, skuUpdateList : skuUpdateList} ,{"Content-Type": 'application/json'}) 
		.then(function (res){ 
         		if(res.data.resultCode >0){
         			alert("성공적으로 저장 되었습니다");
         			getSku();
         		}	
            }
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
	
	onAppendRow = (e) => { 
		 debugger;
		 
		const rowData = [{sku: "", desciption: "", clientSku: "",  clientId: "", useYn : "" , createdAt: "", createdClientName: "",updatedAt : "", updatedClientName :"" }];

		this.gridRef.current.getInstance().appendRow(rowData, {
		  at: 0,
		  extendPrevRowSpan: true,
		  focus: true
		});
				 
	}
 
    onGridUpdatePages = (params)=>{   
    	axios.all([
             api.get(process.env.REACT_APP_DB_HOST+"/api/v1/skucode/mngList",{params : params})
            ,api.get(process.env.REACT_APP_DB_HOST+"/api/v1/skucode/mngRowCount",{params : params}) 
            
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
			searchKeySku :"",
			searchKeyBuyerSku :"",
			searchKeyDesc  :"",
			searchKeyBuyerCode : sessionStorage.getItem('_CLIENT_ID'),
			
		    pageNumber : 1,
            perPage : 20
		});
        const params={};
        params.searchKeyBuyerCode  = sessionStorage.getItem('_CLIENT_ID');
        params.rowStart = 0;
        params.perPage =20;
        this.onGridUpdatePages(params);
	}

    onChangePerPage = (perPage,e) =>{
        this.setState({
            perPage : Number(perPage),
        })
        const params = {};
 
		params.searchKeySku = this.state.searchKeySku;
		params.searchKeyBuyerSku = this.state.searchKeyBuyerSku;
		params.searchKeyDesc = this.state.searchKeyDesc; 
		params.searchKeyBuyerCode = this.state.searchKeyBuyerCode; 
		
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
 		
 		debugger;
		params.searchKeySku = this.state.searchKeySku;
		params.searchKeyBuyerSku = this.state.searchKeyBuyerSku;
		params.searchKeyDesc = this.state.searchKeyDesc; 
		params.searchKeyBuyerCode = this.state.searchKeyBuyerCode; 
		
        params.rowStart = (Number(pageNumber-1))*Number(this.state.perPage);
        params.perPage = Number(this.state.perPage);
        params.pageNumber = pageNumber;
		params.clientId = sessionStorage.getItem("_CLIENT_ID");
        this.onGridUpdatePages(params);

    }

    onSearch = (e) =>{
		const params = {}; 
		params.searchKeySku  = this.state.searchKeySku;
		params.searchKeyBuyerSku = this.state.searchKeyBuyerSku;
		params.searchKeyDesc = this.state.searchKeyDesc; 
		params.searchKeyBuyerCode = this.state.searchKeyBuyerCode; 
		
        params.pageNumber = 1;
        params.rowStart = 0;
        params.perPage = Number(this.state.perPage); 
        this.onGridUpdatePages(params);
	} 

	render() {
        const {pageInfo} = this.state;

	
		const columns = [
			{ name: "id", header: "ID", width: 10, hidden: true},
 			{ name: "sku", header: "SKU", width: 200, sortable: true,align: "center" , editor: 'text'
	 			,formatter({value}){
						return value === null ? '':'<span style="width:100%;height:100%;color:red">'+value+'</span>'; 
				}
 			},
			{ name: "desciption", header: "DESC", width: 200, sortable: true,align: "left", editor: 'text'
				,formatter({value}){
					return value === null ? '':'<span style="width:100%;height:100%;color:red">'+value+'</span>'; 
				}
			},
			{ name: "clientSku", header: "거래처 SKU 코드", width: 200, sortable: true,align: "left", editor: 'text'
				,formatter({value}){
					return value === null ? '':'<span style="width:100%;height:100%;color:red">'+value+'</span>'; 
				}
			},
			{ name: "clientId", header: "Buyer Code", width: 150, show: false,  sortable: true,align: "center", editor: 'text', hidden: true
				,formatter({value}){
					return value === null ? '':'<span style="width:100%;height:100%;color:red">'+value+'</span>'; 
				}
			},
			{ name: "createdAt", header: "생성일", width: 150, sortable: true,align: "right" },
			{ name: "createdClientName", header: "생성자", width: 150, sortable: true,align: "center" , editor: 'text'
				,formatter({value}){
						return value === null ? '':'<span style="width:100%;height:100%;color:blue">'+value+'</span>'; 
				}
			},  
			{ name: "updatedAt", header: "수정일", width: 200, sortable: true,align: "left"},
			{ name: "updatedClientName", header: "수정자", width: 200, sortable: true,align: "center" , editor: 'text'
				,formatter({value}){
						return value === null ? '':'<span style="width:100%;height:100%;color:blue">'+value+'</span>'; 
				}
			} 
		];

		return (
			<div>
                {this.state.loading && (<Loading/>)}
				<div className="page-header">
					<h3 className="page-title">SKU 코드 관리</h3>
					<nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"> 
                                Sku Code
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                MngList
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
                                                <Form.Text><Trans>SKU</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1"> 
                                                <Form.Control type="text" className="form-control" size="sm" name="searchKeySku" value={this.state.searchKeySku} onChange={this.onChange}
                                                        style={{"minHeight": "1rem"}} placeholder="SKU를입력하세요">
                                                </Form.Control> 
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <Form.Text><Trans>거래처 SKU 코드</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1"> 
                                                <Form.Control type="text" className="form-control" size="sm" name="searchKeyBuyerSku" value={this.state.searchKeyBuyerSku} onChange={this.onChange}
                                                        style={{"minHeight": "1rem"}} placeholder="거래처SKU를입력하세요">
                                                </Form.Control> 
                                            </li>
											<li className="list-inline-item me-1">
                                                <Form.Text><Trans>DESC</Trans></Form.Text>
                                            </li>
                                           <li className="list-inline-item me-1"> 
                                                <Form.Control type="text" className="form-control" size="sm" name="searchKeyDesc" value={this.state.searchKeyDesc} onChange={this.onChange}
                                                       style={{"minHeight": "1rem"}} placeholder="DESC를입력하세요">
                                                </Form.Control> 
                                            </li>
                                            
                                            {/*<li className="list-inline-item me-1">
                                                <Form.Text><Trans>Buyer Code</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1"> 
                                                <Form.Control type="text" className="form-control" size="sm" name="searchKeyBuyerCode" value={this.state.searchKeyBuyerCode} onChange={this.onChange}
                                                        style={{"minHeight": "1rem"}} placeholder="Buyer Code를입력하세요">
                                                </Form.Control> 
                                            </li>*/}
                                           
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
									<div className="row">
									     <div className="col-sm">
                                            <ul className="list-inline text-end mb-3">
                                                <li className="list-inline-item me-1">
                                                    <button type="button" className="btn btn-sm btn-info" onClick={this.onSubmit}>
                                                        <Trans>저장</Trans>
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
									</div>
									<div className="">                                        
										<Grid columns={columns} onGridMounted={(e) => this.onGridMounted(e)} ref={this.gridRef} rowHeaders={["rowNum"]}
												scrollX={true} columnOptions={{frozenCount : 0}}>
										</Grid>
									</div>
									
									<div><span>&nbsp;&nbsp;</span></div>
									
									<div className="ms-5">
									     <div className="col-sm">
                                            <ul className="list-inline text-end mb-3">
                                                <li className="list-inline-item me-1">
                                                    <button type="button" className="btn btn-sm btn-info" onClick={this.onAppendRow}>
                                                        <Trans>추가</Trans>
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
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

export default withTranslation()(withRouter(MngList));