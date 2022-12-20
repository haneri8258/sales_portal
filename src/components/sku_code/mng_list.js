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
			rowCount  : 0 ,
			 
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
                    pageInfo : res2.data ,
                    rowCount : res1.data.length
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
		  
		const  gridData = this.state.gridData ; 
		const  skuCreatedList = [];
		const  skuUpdateList  = [];   
		
		for(let i in gridData){ 
			if(gridData[i].rowStatus) { 
				if(gridData[i].sku ===''   ){
					alert("SKU Code는 필수 입니다." );
					return;
				}
				if(gridData[i].clientSku ==='' ){
					alert("Buyer SKU Code는 필수 입니다." );
					return;
				} 
				if( gridData[i].validate ==="N") {
				   	alert("["+ gridData[i].sku + "]  SKU Code는 등록되지 않는 코드 입니다." );
					return;
				}
				if( gridData[i].validate ==="D") {
				   	alert("["+ gridData[i].sku + "] SKU Code는 기입력된 중복된 코드 입니다." );
					return;
				}
				
				gridData[i].clientId  = sessionStorage.getItem('_CLIENT_ID');
				gridData[i].crtId     =  this.state._USER_ID;
				gridData[i].updId     =  this.state._USER_ID;
				if(gridData[i].rowStatus ==="C") 
					skuCreatedList.push(gridData[i]);
				else
					skuUpdateList.push(gridData[i]);
			}
		}
		if(skuCreatedList.length == 0 &&  skuUpdateList.length ==0 ) {
			alert("추가 또는 수정된 자료가 없습니다." );
			return;
		}
		
		if(window.confirm("저장하시겠습니까?") === false) return;  
		let getSku = this.getSku;
		axios.put(process.env.REACT_APP_DB_HOST+"/api/v1/skucode/updateClientList",{skuCreatedList : skuCreatedList, skuUpdateList : skuUpdateList} ,{"Content-Type": 'application/json'}) 
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
		const rowData = {id: "", sku: "", desciption: "", clientSku: "",  clientId: "", useYn : "" , createdAt: "", createdClientName: "",updatedAt : "", updatedClientName :"" , validate : "" , rowStatus: 'C' }; 
		this.state.gridData.push(rowData); 
		this.gridRef.current.getInstance().appendRow(rowData, {
		  at: this.state.gridData.length-1, 
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
        params.pageNumber = 1;
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
		const gridData   = this.state.gridData;  
		const rowCount   = this.state.rowCount;
		
		
		const onBlurValue = (rowKey, colName, value) =>{
			
			if(gridData[rowKey].id) 
				gridData[rowKey].rowStatus = 'U';
			else	
		 		gridData[rowKey].rowStatus = 'C';
		 		
		  	gridData[rowKey][colName] = value;
	    	this.setState({ 
		        gridData : gridData 
		    }); 
		    this.gridRef.current.getInstance().resetData(gridData); 
		     
			if(colName ==='sku') {
				axios.put(process.env.REACT_APP_DB_HOST+"/api/v1/skucode/checkSkuCode",{sku : value, id : gridData[rowKey].id , clientId : sessionStorage.getItem("_CLIENT_ID")  },{"Content-Type": 'application/json'}) 
				.then(function (res){ 
		         		if(res.data.resultCode ==0){
		         			alert("등록 되지 않는 SKU 코드 입니다.");
		         			gridData[rowKey].validate = "N";
		         		}else if(res.data.resultCode == 9){
		         			alert("기 등록된 SKU 코드 입니다.");
		         			gridData[rowKey].validate = "D";	
		         		}else{
		         			gridData[rowKey].validate = "Y";
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
		
		class CustomTextEditor {
		    constructor(props) {
		      const el = document.createElement('input');
		      const { maxLength } = props.columnInfo.editor.options; 
		      el.type = 'text';
		      el.name = props.columnInfo.name;
		      el.dataRowKey  = props.rowKey;
		      el.maxLength = maxLength;
		      el.value = String(props.value);
		      if(props.columnInfo.name === 'sku') {  // 컬럼이 sku 인 경우   
			      if(props.rowKey > rowCount-1 ){    // 추가의 경우 수정이 가능하게 
				  	  el.disabled= false;	
				  	  if( el.value ==="null") el.value = ""; 
				  }else{
				  	 el.disabled= true;
				  }	 
			  }else{
			  		el.disabled= false;	
				  	if( el.value ==="null") el.value = ""; 
			  }
			 
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
		       this.el.select();
		    }   
	   }
	   
	   const columns = [
			{ name: "id", header: "ID", width: 10, hidden: true},
 			{ name: "sku", header: "SKU", width: 200, sortable: true,align: "center" 
 				,editor: {
		              type: CustomTextEditor
		              ,options: {
		                maxLength: 40
		              }
		        } 
	 			,renderer: {
	 			  styles: {
	 			  	minHeight: '27.33px',
			      	width : 'calc(100% - 10px)',
			      	padding : '6px 7px',
			      	border: 'solid 1px #ddd',
			        margin: 'auto 5px',    
			        textAlign : 'center'   
			      }, 
			    } 
 			},
			{ name: "desciption", header: "DESC", width: 200, sortable: true,align: "left"
				,editor: {
		              type: CustomTextEditor
		              ,options: {
		                maxLength: 40
		              }
		        } 
				,renderer: {
			      styles: {
			      	minHeight: '27.33px',
			      	width : 'calc(100% - 10px)',
			      	padding : '6px 7px',
			      	border: 'solid 1px #ddd',
			        margin: 'auto 5px',    
			        textAlign : 'center'  
			      }, 
			    }   
			},
			{ name: "clientSku", header: "거래처 SKU 코드", width: 200, sortable: true,align: "left"
				,editor: {
		              type: CustomTextEditor
		              ,options: {
		                maxLength: 100
		              }
		        } 
				,renderer: {
			      styles: {
			      	minHeight: '27.33px',
			      	width : 'calc(100% - 10px)',
			      	padding : '6px 7px',
			      	border: 'solid 1px #ddd',
			        margin: 'auto 5px',    
			        textAlign : 'center'   
			      }, 
			    }  
			},
			{ name: "clientId", header: "Buyer Code", width: 150, show: false,  sortable: true,align: "center", editor: 'text', hidden: true
				,renderer: {
			      styles: {
			      	minHeight: '27.33px',
			      	width : 'calc(100% - 10px)',
			      	padding : '6px 7px',
			      	border: 'solid 1px #ddd',
			        margin: 'auto 5px',    
			        textAlign : 'center'
			      }, 
			    }  
			},
			{ name: "createdAt", header: "생성일", width: 150, sortable: true,align: "center" },
			{ name: "createdClientName", header: "생성자", width: 150, sortable: true,align: "center" 
				,editor: {
		              type: CustomTextEditor
		              ,options: {
		                maxLength: 100
		              }
		        } 
				,renderer: {
			      styles: {
			      	minHeight: '27.33px',
			      	width : 'calc(100% - 10px)',
			      	padding : '6px 7px',
			      	border: 'solid 1px #ddd',
			        margin: 'auto 5px',    
			        textAlign : 'center' 
			      }, 
			    }
			},  
			{ name: "updatedAt", header: "수정일", width: 200, sortable: true,align: "center"},
			{ name: "updatedClientName", header: "수정자", width: 200, sortable: true,align: "center" 
			   ,editor: {
		              type: CustomTextEditor
		              ,options: {
		                maxLength: 100
		              }
		        } 	
				,renderer: {
			      styles: {
			      	minHeight: '27.33px',
			      	width : 'calc(100% - 10px)',
			      	padding : '6px 7px',
			      	border: 'solid 1px #ddd',
			        margin: 'auto 5px',    
			        textAlign : 'center'
			      }, 
			    } 
			},
			{ name: "validate", header: "validate", width: 10, hidden: true}, 
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