/**
 * This application was developed by YS.Im, HJ.Yoon and GH.Zhang of GIE&S at 2022 years.
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
 * 설명 : BankSlip 확인
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
class ConfirmList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			
			isOpenModal : false,
			
			searchKeyBuyerCode :"",
			searchKeyBuyerName :"",
			searchKeyRequestNo :"",
			searchKeyRemittamceDate:"",
			searchKeyInvoiceNo : "",
			searchKeyInvoiceDate : "",
		 
		    cancelComment : "",
		
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

	// 증빙파일 열기
    onOpenModalFile = async (rowKey) => {
	     const gridData =	this.gridRef.current.getInstance().getData(); 
	     const params   = { serverFileName : gridData[rowKey].serverFileName};
	     axios.all([api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/getServerFileName",{params : params}) 
         ]).then(
         	axios.spread((res)=>{   
         			this.setState({
				        isOpenModalFile: true,
				        imageBase64	: "data:image/png;base64,"+ res.data.imageBase64
			 	 	});    
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
    //  증빙파일 닫기
    onCloseModalFile = () => {
        this.setState({
            isOpenModalFile: false 
        });
    }
    
	gridRef = React.createRef();

	onGridMounted = (e) => {
        this.getOrders();
	}

    getOrders = () => {
        const params = {};
        this.setState({ 
 			pageNumber : 1,
 			activePage : 1,
            perPage : 20
		});
        params.rowStart = 0; 
        params.perPage = Number(this.state.perPage);
        params.pageNumber = Number(this.state.pageNumber);
 	    axios.all([
             api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/confirmList",{params : params})
            ,api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/confirmRowCount",{params : params}) 
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
		if(date) {
			date.setHours(date.getHours() + 9);
			return date.toISOString().replace('T', ' ').substring(0, 10);
		} 
	}
 

    onGridUpdatePages = (params)=>{  
        axios.all([
             api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/confirmList",{params : params})
            ,api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/confirmRowCount",{params : params}) 
            
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
			searchKeyBuyerCode :"",
			searchKeyBuyerName :"",
			searchKeyRequestNo :"",
			searchKeyRemittamceDate:"",
			searchKeyInvoiceNo : "",
			searchKeyInvoiceDate : "",
			selected : [],
            pageNumber : 1,
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
 
		params.searchKeyBuyerCode = this.state.searchKeyBuyerCode;
		params.searchKeyBuyerName = this.state.searchKeyBuyerName; 

		params.searchKeyRequestNo = this.state.searchKeyRequestNo;
		params.searchKeyRemittamceDate = this.timestamp(this.state.searchKeyRemittamceDate);
		
		params.searchKeyInvoiceNo = this.state.searchKeyInvoiceNo;
		params.searchKeyInvoiceDate = this.timestamp(this.state.searchKeyInvoiceDate);
		
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
 
		params.searchKeyBuyerCode = this.state.searchKeyBuyerCode;
		params.searchKeyBuyerName = this.state.searchKeyBuyerName; 

		params.searchKeyRequestNo = this.state.searchKeyRequestNo;
		params.searchKeyRemittamceDate = this.timestamp(this.state.searchKeyRemittamceDate);
		
		params.searchKeyInvoiceNo = this.state.searchKeyInvoiceNo;
		params.searchKeyInvoiceDate = this.timestamp(this.state.searchKeyInvoiceDate);
        
        params.rowStart = (Number(pageNumber-1))*Number(this.state.perPage);
        params.perPage = Number(this.state.perPage);
        params.pageNumber = pageNumber;
		
		//params.storeNo = sessionStorage.getItem("_STORE_NO");
        this.onGridUpdatePages(params);

    }

    onSearch = (e) =>{
		const params = {};
 
		params.searchKeyBuyerCode = this.state.searchKeyBuyerCode;
		params.searchKeyBuyerName = this.state.searchKeyBuyerName; 
 
		params.searchKeyRequestNo = this.state.searchKeyRequestNo;
		params.searchKeyRemittamceDate = this.timestamp(this.state.searchKeyRemittamceDate);
		
		params.searchKeyInvoiceNo = this.state.searchKeyInvoiceNo;
		params.searchKeyInvoiceDate = this.timestamp(this.state.searchKeyInvoiceDate); 
		
        params.pageNumber = 1;
        params.rowStart = 0;
        params.perPage = Number(this.state.perPage);
		params.storeNo = sessionStorage.getItem("_STORE_NO");
        this.onGridUpdatePages(params);
	}
	
	onApproval = (e) =>{
        let getOrders  =  this.getOrders;
        
		const checkedRows = this.gridRef.current.getInstance().getCheckedRows();
		
		if(checkedRows.length===0) {
        	alert("승인 데이터를 선택하세요!");
        	return;
        }
        let requestNo = checkedRows[0].seq ;
        
		if(window.confirm( "요청번호[" + requestNo + "]"+(checkedRows.length > 1 ? " 외 " + (checkedRows.length -1) :"1" ) +"건 승인 하시겠습니까?") === true){
			for(let i in checkedRows){ 
				checkedRows[i].crtId     =  this.state._USER_ID;
				checkedRows[i].updId     =  this.state._USER_ID;
				checkedRows[i].managerId    =  this.state._MANAGER_ID;
				checkedRows[i].status       =  "02";
				checkedRows[i].comment      =  "승인합니다.";
			}
			axios.put(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/uploadConfirm",{checkedRows : checkedRows} ,{"Content-Type": 'application/json'}) 
			.then(function (res){ 
	         		if(res.data.resultCode >0){
	         			alert("성공적으로 저장 되었습니다");
         				getOrders();
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
		};
	}
	
	// 거절사유 열기
    onOpenModalComment = () => {
    	const checkedRows = this.gridRef.current.getInstance().getCheckedRows();
    	
    	if(checkedRows.length===0) {
        	alert("거절 데이터를 선택하세요!");
        	return;
        }
        
		this.setState({
	    	isOpenModalComment: true,
	    	checkedRows : checkedRows 
	    }); 
	}   
    //  거절사유 닫기
    onCloseModalComment = () => {
        this.setState({
            isOpenModalComment: false 
        });
    }
    
	confirmCancel = () => { 
		let closeModel  =  this.onCloseModalComment;
        let getOrders   =  this.getOrders;
        
		const checkedRows = this.gridRef.current.getInstance().getCheckedRows();
	
		if(checkedRows.length===0) {
        	alert("거절 데이터를 선택하세요!");
        	return;
        }
        let requestNo = checkedRows[0].seq ;
        
        if(window.confirm("요청번호[" + requestNo + "]"+(checkedRows.length > 1 ? " 외 " +  (checkedRows.length -1) :"1" ) + "건 거절 하시겠습니까?") === true){
        	
			for(let i in checkedRows){ 
				checkedRows[i].crtId     =  this.state._USER_ID;
				checkedRows[i].updId     =  this.state._USER_ID;
				checkedRows[i].managerId     =  this.state._MANAGER_ID;
				checkedRows[i].status        =  "03";
				checkedRows[i].comment     =  this.state.cancelComment;
			}
			axios.put(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/uploadConfirm",{checkedRows : checkedRows} ,{"Content-Type": 'application/json'}) 
			.then(function (res){ 
	         		if(res.data.resultCode >0){
	         			alert("성공적으로 저장 되었습니다");
	         			closeModel();
         				getOrders();
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
		};
	}
	
	render() {
        const {pageInfo} = this.state;


		const onClickedAtag = (e, rowKey) => {
			 e.preventDefault();
			 let closeModel  =  this.onCloseModalComment;
       		 let getOrders  =  this.getOrders;
			 const getRows = this.gridRef.current.getInstance().getData();
			 const checkedRows = [];
			 const param = {}; 
			 if( e.currentTarget.innerHTML ==="승인") {
			 	 
			 	param.crtId         =  this.state._USER_ID;
				param.updId         =  this.state._USER_ID;
				param.managerId     =  this.state._MANAGER_ID;
				param.status        =  "02";
				param.comment       =  "승인합니다.";
				param.id            =  getRows[rowKey].id;
				checkedRows.push(param);
				if(window.confirm("요청번호[" + getRows[rowKey].seq + "]을 승인 하시겠습니까?") === true){
					axios.put(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/uploadConfirm",{checkedRows : checkedRows} ,{"Content-Type": 'application/json'}) 
					.then(function (res){ 
			         		if(res.data.resultCode >0){
			         			alert("성공적으로 저장 되었습니다");
			         			closeModel();
		         				getOrders();
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
				
			 }else if( e.currentTarget.innerHTML ==="거절") {
			 	
			 	param.crtId         =  this.state._USER_ID;
				param.updId         =  this.state._USER_ID;
				param.managerId     =  this.state._MANAGER_ID;
				param.status        =  "03";
				param.comment       =  "승인거절 합니다.";
				param.id            =  getRows[rowKey].id;
				checkedRows.push(param);
				if(window.confirm("요청번호[" + getRows[rowKey].seq + "]을 거절 하시겠습니까?") === true){
					axios.put(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/uploadConfirm",{checkedRows : checkedRows} ,{"Content-Type": 'application/json'}) 
					.then(function (res){ 
			         		if(res.data.resultCode >0){
			         			alert("성공적으로 저장 되었습니다");
			         			closeModel();
		         				getOrders();
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
			 }else{
            	this.onOpenModalFile(rowKey);
            }	
		}

		const columns = [
			{ name: "id", header: "ID", width: 10, hidden: true},
 			{ name: "username", header: "거래처 코드", width: 120, sortable: true,align: "center"},
			{ name: "companyname", header: "거래처명", width: 180, sortable: true,align: "left"},
			{ name: "seq", header: "요청번호", width: 150, sortable: true,align: "center"},
			{ name: "createdAt", header: "요청일자", width: 150, sortable: true,align: "center"},
			{ name: "remittanceDate", header: "송금 날짜", width: 150, sortable: true,align: "center" },
			{ name: "remittanceAmount", header: "송금 금액", width: 150, sortable: true,align: "right" 
				,formatter({value}){
					return '<span style="width:100%;height:100%;color:blue">'+value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+'</span>&nbsp;&nbsp;&nbsp;&nbsp';
				}
			},  
			{ name: "remittanceType", header: "인보이스 번호", width: 150, sortable: true,align: "center"},
			{ name: "invoiceDate", header: "인보이스 날자", width: 150, sortable: true,align: "center"},
			{ name: "serverFileName", header: "증빙서 서버파일명", width: 0, hidden: true },
			{ name: "originFileName", header: "증명서", width: 300, sortable: true,align: "left" 
				,renderer: {
	                    type: LinkInGrid,
	                    options: {
	                        onClickedAtag
	                    }
	                }
            }, 
			{ name: "status", header: "승인상태", width: 150, sortable: true,align: "center"},
			{ name: "comment", header: "사유", width: 150, sortable: true,align: "left" } ,
			{ name: "confirm", header: "승인", width: 100, sortable: true,align: "center" 
					,renderer: {
	                    type: LinkInGrid,
	                    options: {
	                        onClickedAtag
	                    }
	                } 
			} ,
			{ name: "reject", header: "거절", width: 100, sortable: true,align: "center" 
					,renderer: {
	                    type: LinkInGrid,
	                    options: {
	                        onClickedAtag
	                    }
	                } 
			} ,
		];

		return (
			<div>
                {this.state.loading && (<Loading/>)}
				<div className="page-header">
					<h3 className="page-title">Bank Slip 확인</h3>
					<nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"> 
                                Bank Slip
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                ConfirmList
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
                                                <Form.Text><Trans>거래처 코드</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1"> 
                                                <Form.Control type="text" className="form-control" size="sm" name="searchKeyBuyerCode" value={this.state.searchKeyBuyerCode} onChange={this.onChange}
                                                        style={{"minHeight": "1rem"}}placeholder="거래처 코드를입력하세요">
                                                </Form.Control> 
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <Form.Text><Trans>거래처명</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1"> 
                                                <Form.Control type="text" className="form-control" size="sm" name="searchKeyBuyerName" value={this.state.searchKeyBuyerName} onChange={this.onChange}
                                                        style={{"minHeight": "1rem"}}placeholder="거래처명를입력하세요">
                                                </Form.Control> 
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <Form.Text><Trans>요청 번호</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1"> 
                                                <Form.Control type="text" className="form-control" size="sm" name="searchKeyRequestNo" value={this.state.searchKeyRequestNo} onChange={this.onChange}
                                                        style={{"minHeight": "1rem"}}placeholder="요청번호를입력하세요">
                                                </Form.Control> 
                                            </li>
											<li className="list-inline-item me-1">
                                                <Form.Text><Trans>송금 날짜</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <DatePicker selected={this.state.searchKeyRemittamceDate} className="form-control form-control-sm" size="sm"
                                                            dateFormat="yyyy-MM-dd" defaultValue="" placeholderText="송금 날짜" 
                                                            onChange={(date) =>   this.setState({ searchKeyRemittamceDate: date })}>
                                                </DatePicker>
                                            </li>
                                             
                                            <li className="list-inline-item me-1">
                                                <Form.Text><Trans>인보이스 번호</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1"> 
                                                <Form.Control type="text" className="form-control" size="sm" name="searchKeyInvoiceNo" value={this.state.searchKeyInvoiceNo} onChange={this.onChange}
                                                        style={{"minHeight": "1rem"}}placeholder="인보이스번호를입력하세요">
                                                </Form.Control> 
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <Form.Text><Trans>인보이스 날짜</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <DatePicker selected={this.state.searchKeyInvoiceDate} className="form-control form-control-sm" size="sm"
                                                            dateFormat="yyyy-MM-dd" defaultValue="" placeholderText="인보이스 날짜" 
                                                            onChange={(date) =>   this.setState({ searchKeyInvoiceDate: date })}>
                                                </DatePicker>
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
                                                	<button type="button" className="btn btn-sm btn-dark" onClick={this.onOpenModalComment}>
                                                        <Trans>거절</Trans>
                                                    </button>&nbsp;&nbsp;
                                                    <button type="button" className="btn btn-sm btn-dark" onClick={this.onApproval}>
                                                        <Trans>승인</Trans>
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
									</div>
									{/*<div className="row">
									     <div className="col-sm">
                                            <ul className="list-inline text-end mb-3">
                                                <li className="list-inline-item me-1">
                                                    <button type="button" className="btn btn-sm btn-info" onClick={this.exportDefaultExcel}>
                                                        <Trans>엑셀</Trans>
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
									</div>*/}
									<div className="">                                        
										<Grid columns={columns} onGridMounted={(e) => this.onGridMounted(e)} ref={this.gridRef} rowHeaders={["rowNum","checkbox"]}
												scrollX={true} columnOptions={{frozenCount : 0}} >
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
				{/* 등록 Modal */}
                <Modal className="modal fade" show={this.state.isOpenModalFile} onHide={this.onCloseModalFile} aria-labelledby="contained-modal-title-vcenter" aria-hidden="true" centered scrollable>
					<Modal.Header className="modal-header" closeButton>
						<Modal.Title><Trans>증빙파일확인</Trans></Modal.Title>
					</Modal.Header>
					<Modal.Body>
                        {/* 등록 Form Start */}
						<Form controlid="form02">
							<div className ="col-12 grid-margin">
								<div className="card">   
									<div className="card-body">                                    	
										 <img src={this.state.imageBase64} width="1000"  /> 
									</div>	
								</div> 
							</div>	
						</Form>
                        {/* 등록 Form End */}
					</Modal.Body> 
                </Modal>
                
                {/* 사유등록 Modal */}
                <Modal className="modal fade" show={this.state.isOpenModalComment} onHide={this.onCloseModalComment} aria-labelledby="contained-modal-title-vcenter" aria-hidden="true" centered scrollable>
					<Modal.Header className="modal-header" closeButton>
						<Modal.Title><Trans>거절사유</Trans></Modal.Title>
					</Modal.Header>
					<Modal.Body>
                        {/* 등록 Form Start */}
						<Form controlid="form02">
							<div className ="col-12 grid-margin">
								<div className="card">   
									<div className="card-body">                                    	
										<li className="list-inline-item me-1"> 
                                            <Form.Control type="text" className="form-control" size="sm" name="cancelComment" value={this.state.cancelComment} onChange={this.onChange}
                                                    style={{"minHeight": "1rem","width":"630px"}}placeholder="거절사유를입력하세요">
                                            </Form.Control> 
                                        </li>
									</div>	
								</div> 
							</div>	
						</Form>
                        {/* 등록 Form End */}
					</Modal.Body> 
					<Modal.Footer>
						<button className="btn btn-sm btn-dark" onClick={this.onCloseModalComment}><Trans>취소</Trans></button>
						<button className="btn btn-sm btn-success" onClick={this.confirmCancel} disabled={this.state.isBtnAddDisabled}><Trans>거절저장</Trans></button>
					</Modal.Footer>
                </Modal>
			</div>
		);
	}
}

export default withTranslation()(withRouter(ConfirmList));