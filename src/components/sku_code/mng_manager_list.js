/**
 * This application was developed by Haneri.jeong of ITS Community at 2022 years.
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
 * 설명 : 거래처 SKU 코드 관리
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
class MngManagerList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			startDate:"",
			endDate : "",
			isOpenModal : false,
			
			searchKeySku :"",
			searchKeyBuyerCode :"",  
		
			gridData : [],
            pageInfo : {
                totalPage : 0,
                totalCount : 0
            },
            activePage : 1,
            perPage : 20,
            pageNumber : 1,
 			
			_USER_ID: sessionStorage.getItem('_USER_ID'),
			_USER_NAME: sessionStorage.getItem('_USER_NAME'),
			_MANAGER_ID: sessionStorage.getItem('_MANAGER_ID'), 
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
        
        axios.all([
             api.get(process.env.REACT_APP_DB_HOST+"/api/v1/skucode/mngManagerList",{params : params})
             ,api.get(process.env.REACT_APP_DB_HOST+"/api/v1/skucode/mngManagerRowCount",{params : params}) 
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

	onSubmit = (e) => { 
		const skuList = this.gridRef.current.getInstance().getCheckedRows();	 
		if(skuList.length === 0) {
			alert("저장할 자료를 선택하세요.");
			return;
		}
		for(let i in skuList){ 
			if(skuList[i].managerSku ==='' ){
				alert("관리자 SKU 코드는 필수 입니다." );
				return;
			} 
			skuList[i].managerId    =  this.state._MANAGER_ID;
			skuList[i].crtId        =  this.state._USER_ID;
			skuList[i].updId        =  this.state._USER_ID;
		}
 		if(window.confirm(skuList.length +"건을 저장하시겠습니까?")) { 
	  		let getSku = this.getSku;
			axios.put(process.env.REACT_APP_DB_HOST+"/api/v1/skucode/updateMngList",{ skuList : skuList} ,{"Content-Type": 'application/json'})
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
	}
	
    onGridUpdatePages = (params)=>{  
        axios.all([
             api.get(process.env.REACT_APP_DB_HOST+"/api/v1/skucode/mngManagerList",{params : params})
            ,api.get(process.env.REACT_APP_DB_HOST+"/api/v1/skucode/mngManagerRowCount",{params : params}) 
            
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
			searchKeyBuyerCode :"", 
            pageNumber : 1,
            activePage : 1,
            perPage : 20
		});
        const params={};
        params.rowStart = 0;
        params.perPage =20;
        params.pageNumber = 1;
        this.onGridUpdatePages(params);
	}

    onChangePerPage = (perPage,e) =>{
        this.setState({
            perPage : Number(perPage),
        })
        const params = {};
 
		params.searchKeySku = this.state.searchKeySku;
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
 
		params.searchKeySku = this.state.searchKeySku;
		params.searchKeyBuyerCode = this.state.searchKeyBuyerCode;  
        
        params.rowStart = (Number(pageNumber-1))*Number(this.state.perPage);
        params.perPage = Number(this.state.perPage);
        params.pageNumber = pageNumber;
		
		//params.storeNo = sessionStorage.getItem("_STORE_NO");
        this.onGridUpdatePages(params);

    }

    onSearch = (e) =>{
		const params = {};
 
		params.searchKeySku = this.state.searchKeySku;
		params.searchKeyBuyerCode = this.state.searchKeyBuyerCode;  
		
        params.pageNumber = 1;
        params.rowStart = 0;
        params.perPage = Number(this.state.perPage);
		params.storeNo = sessionStorage.getItem("_STORE_NO");
        this.onGridUpdatePages(params);
	} 

 

	render() {
        const {pageInfo} = this.state;
 		const gridData   = this.state.gridData;  	
 			
 		const onBlurValue = (rowKey, colName, value) =>{ 
			 
		  	gridData[rowKey][colName] = value;
	    	this.setState({ 
		        gridData : gridData 
		    }); 
		    this.gridRef.current.getInstance().resetData(gridData); 
	 	} 
 		
 		
 		class CustomTextEditor {
		    constructor(props) { 
		      const el = document.createElement('select');  
		      
		      el.name = props.columnInfo.name;
		      el.dataRowKey  = props.rowKey; 
		      el.value = String(props.value);
		      let options_str = "";
		      options_str += '<option value="Y">Y</option>'; 
		      options_str += '<option value="N">N</option>'; 
		      el.innerHTML = options_str;
		      el.style.width = 'calc(100% - 10px)';
		      el.style.minHeight = '27.33px';
		      el.style.padding = '6px 7px';
			  el.style.border = 'solid 1px #ddd';
			  el.style.margin = 'auto 5px';    
		      
		      this.el = el;
		      el.addEventListener("blur", function(ev) {
		      	 onBlurValue(this.dataRowKey, this.name,  this.value);
			  });
		      
		    }
		    getElement() {
		       return this.el;
		     }
		
		     getValue() {
		       return this.el.value;
		     }
		
		     mounted() {
		    	//  this.el.select();
		    }   
	   }	
 			
		const columns = [
			{ name: "id", header: "ID", width: 10, hidden: true},
 			{ name: "sku", header: "SKU", width: 200, sortable: true,align: "center"},
			{ name: "username", header: "거래처 코드", width: 200, sortable: true,align: "center" },
			{ name: "clientSku", header: "거래처 SKU 코드", width: 200, sortable: true,align: "center" },  
			{ name: "managerId", header: "관리자 id", width: 200, sortable: true,align: "center" , hidden: true },  
			{ name: "managerSku", header: "관리자 SKU 코드", width: 200, show: false,  sortable: true, align: "center"},
			{ name: "fnSku", header: "FN SKU", width: 150, show: false,  sortable: true, align: "center"},
			{ name: "managerUseYn", header: "사용여부", sortable: true , filter : 'select', align: 'center', width : 200,
                editor:{ 
                    type: CustomTextEditor, 
               	}
               	,renderer: {
			      styles: {
			      	width : 'calc(100% - 10px)',
			      	padding : '6px 7px',
			      	border: 'solid 1px #ddd',
			        margin: 'auto 5px',    
			        textAlign : 'center'   
			      }, 
			    }  
           },
		];
		
		return (
			<div>
                {this.state.loading && (<Loading/>)}
				<div className="page-header">
					<h3 className="page-title">거래처 SKU 코드 관리</h3>
					<nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"> 
                                Sku Code
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                MngManagerList
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
                                                        style={{"minHeight": "1rem"}}placeholder="SKU를입력하세요">
                                                </Form.Control> 
                                            </li>
											<li className="list-inline-item me-1">
                                                <Form.Text><Trans>거래처 코드</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1"> 
                                                <Form.Control type="text" className="form-control" size="sm" name="searchKeyBuyerCode" value={this.state.searchKeyBuyerCode} onChange={this.onChange}
                                                        style={{"minHeight": "1rem"}}placeholder="거래처 코드를입력하세요">
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
										<Grid columns={columns} onGridMounted={(e) => this.onGridMounted(e)} ref={this.gridRef} rowHeaders={["rowNum","checkbox"]}
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

export default withTranslation()(withRouter(MngManagerList));