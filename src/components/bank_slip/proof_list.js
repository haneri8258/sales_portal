/**
 * This application was developed by BlackLeader of ITS Community  at 2022 years.
 */
import React, { Component } from "react";
import { Form, Modal, Badge } from "react-bootstrap"; 
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
/*import 'tui-date-picker/dist/tui-date-picker.css';*/
import { Loading } from "../../loading";
/**
 * 설명 : BankSlip 증빙
 *
 * @author		:  장동희
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
class ProofList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			startDate:"",
			endDate : "", 
			isOpenModalAdd: false,
			isOpenModalFile: false, 
			
			searchKeyInvoiceDate :"", 
			searchKeyInvoiceNo :"", 
			
			rowKey	: 0, 
			gridData : [],
			slipData : [],
			fileInfo : [],
            pageInfo : {
                totalPage : 0,
                totalCount : 0
            },
            activePage : 1,
            perPage : 20,
            pageNumber : "",
 			remittanceAmount : 0,
			_USER_ID: sessionStorage.getItem('_USER_ID'),
			_USER_NAME: sessionStorage.getItem('_USER_NAME'), 
			_GROUP_ID: sessionStorage.getItem('_GROUP_ID'),
			_CLIENT_ID: sessionStorage.getItem('_CLIENT_ID')
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
	
 	gridRef   = React.createRef();
	slipRef   = React.createRef();	

	onGridMounted = (e) => { 
        this.getRequest();
	}

    getRequest = () => {
        const params = {};
        params.rowStart = 0;
        params.perPage = this.state.perPage;
  		params.clientId = sessionStorage.getItem('_CLIENT_ID');
        axios.all([ 
             api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/proofList",{params : params})
            ,api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/proofRowCount",{params : params}) 
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
    
    // Slip 요청그리드 열림
    onGridSlipMounted = (e) => { 
       //this.getRequest();
    }
    
    
	timestamp = (date)=>{
		if(date){
			date.setHours(date.getHours() + 9);
			return date.toISOString().replace('T', ' ').substring(0, 10); 
		}	
	}
 
    onGridUpdatePages = (params)=>{   
        axios.all([
             api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/proofList",{params : params})
            ,api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/proofRowCount",{params : params}) 
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
			searchKeyInvoiceDate :"",
			searchKeyInvoiceNo :"", 
            pageNumber : 1,
            perPage : 20
		});
        const params={};
        params.rowStart = 0;
        params.perPage =20;
        params.pageNumber = 1;
        this.onGridUpdatePages(params);
	}
	
	// 등록창 열기
    onOpenModalAdd = async () => { 
    	const gridData   = this.gridRef.current.getInstance().getData();
        const checkedRows = this.gridRef.current.getInstance().getCheckedRows();
        if(checkedRows.length===0) {
        	alert("송금할 데이터를 선택하세요!");
        	return;
        }
        
        const date = new Date();
		const year = date.getFullYear(); 
		const month = (date.getMonth()  < 10 ?  '0' + (date.getMonth() + 1) :  date.getMonth() + 1);
		const day = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate() );
		const dateStr = [year, month, day].join('-');
		 
        let balanceAmount = 0; 
        let remittanceAmount = 0; 
        
        const slipRows = [];
        
        for(let i in gridData){ 
        	 remittanceAmount += gridData[i].balanceAmount  
        }
       
        slipRows.push({remittanceType : '선급금', invoiceNo : '',  originFileName : "파일업로드", remittanceDate : dateStr , balanceAmount: 0 , remittanceAmount : 0  , fileInfo : [] } ); 
        for(let i in checkedRows){ 
        	balanceAmount += checkedRows[i].balanceAmount; 
        	/*
        	checkedRows[i].rowKey = (Number(i) + 1);
        	checkedRows[i].remittanceType   = checkedRows[i].invoiceNo;
        	checkedRows[i].invoiceNo  		= checkedRows[i].invoiceNo; 
        	checkedRows[i].originFileName   = "파일업로드";  
        	checkedRows[i].remittanceDate   =  dateStr;
        	checkedRows[i].remittanceAmount = 0;  
        	checkedRows[i].fileInfo = [];
        	slipRows.push(checkedRows[i]);
        	*/
        } 
        slipRows.push({remittanceType : '인보이스', invoiceNo : '',  originFileName : "파일업로드", remittanceDate : dateStr , balanceAmount: balanceAmount , remittanceAmount : 0  , fileInfo : [] } ); 
        
        if(balanceAmount ===0 ) {
        	 alert("선택한 자료의 송금할 금액이 0 입니다.");
        	return;
        } 		 
        this.setState({
            isOpenModalAdd: true,
            slipData : slipRows ,
            remittanceAmount : remittanceAmount  // 인보이스 총 잔액
        }); 
          
    }

    // 등록창 닫기
    onCloseModalAdd = () => {
        this.setState({
            isOpenModalAdd: false 
        });
    }
    
    // 증빙파일업로드 열기
    onOpenModalFile = async (rowKey) => { 
     	this.setState({
            isOpenModalFile: true,
            rowKey	: rowKey
        }); 
    }
    //  증빙업로드 등록창 닫기
    onCloseModalFile = () => {
        this.setState({
            isOpenModalFile: false 
        });
    }
    
      // 선택 정보 비우기
    emptyChoiceData = () => {
        this.setState({ 
			 
        });
    }
    
    onChangePerPage = (perPage,e) =>{
        this.setState({
            perPage : Number(perPage),
        })
        const params = {}; 
		
		params.searchKeyInvoiceDate = this.timestamp(this.state.searchKeyInvoiceDate);
		params.searchKeyInvoiceNo = this.state.searchKeyInvoiceNo; 
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
        
        params.searchKeyInvoiceDate = this.timestamp(this.state.searchKeyInvoiceDate);
		params.searchKeyInvoiceNo = this.state.searchKeyInvoiceNo; 
        params.rowStart = (Number(pageNumber-1))*Number(this.state.perPage);
        params.perPage = Number(this.state.perPage);
        params.pageNumber = pageNumber;
		
        this.onGridUpdatePages(params);

    }

    onSearch = (e) =>{
		const params = {};
  		
  		params.searchKeyInvoiceDate = this.timestamp(this.state.searchKeyInvoiceDate);
		params.searchKeyInvoiceNo = this.state.searchKeyInvoiceNo; 
        params.pageNumber = 1;
        params.rowStart = 0;
        params.perPage = Number(this.state.perPage);
		params.clientId = sessionStorage.getItem("_CLIENT_ID");
        this.onGridUpdatePages(params);
	} 

	render() {
        const {pageInfo} = this.state; 
		 
		const onClickedAtag = (e, rowKey) => {
			e.preventDefault();
            this.onOpenModalFile(rowKey);
		}
		
		const onBlurValue = (rowKey, value) =>{
		  	const gridData   = this.slipRef.current.getInstance().getData();
	    	gridData[rowKey].remittanceAmount = value;
	    	this.setState({ 
		        slipData : gridData 
		    }); 
	 	} 
		
		class CustomTextEditor {
		    constructor(props) {
			      const el = document.createElement('input');
			      el.type  = 'text';
			      el.value = String(props.value);
			      el.dataRowKey  = props.rowKey;
			      this.el = el; 
				  el.addEventListener("blur", function(ev) {
					 onBlurValue(this.dataRowKey, this.value);
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
 			{ name: "invoiceNo", header: "Invoice No.", width: 200, sortable: true,align: "center"},
			{ name: "invoiceDate", header: "Invoice Date", width: 200, sortable: true,align: "center"},
			{ name: "invoiceAmount", header: "인보이스 금액", width: 150, sortable: true,align: "right"
				,formatter({value}){
					return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				}
			},  
 
			{ name: "remittanceAmount", header: "송금액", width: 150, sortable: true,align: "right"
				,formatter({value}){
					return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				}
			},
			
			{ name: "balanceAmount", header: "송금잔액", width: 150, sortable: true,align: "right"
				,formatter({value}){
					return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				}
			} 
		];
		
		 
		const slipColumns = [
			{ name: "remittanceType", header: "구분", width: 100, sortable: false, align: "center"},
 			{ name: "invoiceNo", header: "invoiceNo", hidden : true },
			{ name: "balanceAmount", header: "인보이스금액", width: 100, sortable: false
			 	, align: "right"
				, formatter({value}){
					return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				} 
			},
			{ name: "remittanceDate", header: "송금날짜", width: 120, sortable: false
				, align: "center", editor: 'text'  
				, editor: {
			      type: 'datePicker',
			           options: {
			            format: 'yyyy-MM-dd' 
			            ,style : {zIndex: "9999999"} 
			        }
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
			{ name: "remittanceAmount", header: "송금액", width: 120, sortable: false
				, align: "right"
			 	,formatter({value}){
			 		return value.toString().replace(/[^0-9.]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				}
			 	,editor: {
			       type: CustomTextEditor 
			       ,options: {
		                maxLength: 20
		           }  
			    }
			    ,renderer: {
			      styles: {
			      	width : 'calc(100% - 10px)',
			      	padding : '6px 7px',
			      	border: 'solid 1px #ddd',
			        margin: 'auto 5px',    
			        textAlign : 'right'
			      }
			    } 
			    ,validation: {
			    	dataType : 'number'	
			    } 
			},
			{ name: "originFileName", header: "증빙", width: 150, sortable: false, align: "center" 
				,renderer: {
                    type: LinkInGrid,
                    options: {
                        onClickedAtag
                    } 
                } 
			}			 
		];
				
		// 등록
        const addBankSlip = async (event) => { 
        	let closeModel  =  this.onCloseModalAdd;
        	let getRequest  =  this.getRequest;
         	const slipData = this.slipRef.current.getInstance().getData();
         	const checkedRows = this.gridRef.current.getInstance().getCheckedRows();
          	const formData = new FormData(); 
             
            let  balanceTotAmount = 0;
            let  remittanceTotAmount = 0;
            let  advancePayment = 0;
            
            for(let i = 0; i < slipData.length; i++){
	        	if(slipData[i].remittanceType !== '선급금') {
		        	
		        	if( Number(slipData[i].remittanceAmount) === 0 ) {
		        		alert("송금액이 입력되지 않았습니다.");
		        		return;
		        	} 
		        	if(slipData[i].fileInfo.name === undefined ) {
		        		alert("증빙이 입력되지 않았습니다. ");
		        		return;
		        	}	
		        	
		        	if( Number(slipData[i].balanceAmount) < Number(slipData[i].remittanceAmount)) {   
		        		alert("송금 금액이 선택된 인보이스 금액보다 많습니다. 인보이스 금액을 확인 해주세요");
		        		return;
		        	}

		        	balanceTotAmount   += Number(slipData[i].balanceAmount);
		        	remittanceTotAmount   += Number(slipData[i].remittanceAmount);
		        }else{ // 선급금 인경우 
		        	if(Number(slipData[i].remittanceAmount) === 0 &&  slipData[i].fileInfo.name !== undefined ) {
		        		alert("선금급 증빙이 입력되었으나 송금액이 입력되지 않았습니다.");
		        		return;
		        	}
		        	if(Number(slipData[i].remittanceAmount) > 0 &&  slipData[i].fileInfo.name === undefined  ) {
		        		alert("선급금이 입력되었으나 증빙이 입력되지 않았습니다.");
		        		return;
		        	}
		        	if(Number(slipData[i].remittanceAmount) !=="")
		        		advancePayment = Number(slipData[i].remittanceAmount);
		        }	
	        	slipData[i].clientId = sessionStorage.getItem('_CLIENT_ID');
	            formData.append(i, slipData[i].fileInfo);  
	        }
	        
	        if( advancePayment > 0  &&  balanceTotAmount > remittanceTotAmount ) {
	        	alert("인보이스를 먼저 선택해주세요. 잔액이 있는 경우, 잔액을 제외한 금액만 선수금 처리 가능 합니다");
	        	return;
	        }
	        
	        if( balanceTotAmount < remittanceTotAmount ) {
	        	alert("송금 금액이 인보이스 금액보다 많습니다. 남은 금액은 선수금으로 입력해주세요.");
	        	return;
	        }
	         // 함계송금액  < 전체 송금잔액 인경우 선급금이 입력된 경우 	
	        if( remittanceTotAmount <  this.state.remittanceAmount && advancePayment >0 ) {
	        	alert("송금할 총잔액이 남아있습니다. 선수금을 송금할 금액으로 입력해주세요.");
	        	return;
	        }
	         
	        formData.append("slipData", JSON.stringify(slipData)); 
	        formData.append("invoiceData", JSON.stringify(checkedRows)); 
	               
	        const url = process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/uploadProof";
 	        await api.post(url, formData, {header: {"Content-Type": "multipart/form-data;"}} )
 	        .then(function (res){ 
         		if(res.data.resultCode >0){
         			alert("총" +res.data.resultCode +"건이 성공적으로 처리 되었습니다"); 
         			closeModel();
         			getRequest();
         		}else{
         			alert("저장에 실패하였습니다.\n사유[" + res.data.resultMsg +"]" ); 
         		}	 
              }).catch(err => {
				if(err.response){
					console.log(err.response.data);
				}else if(err.request){
					console.log(err.request);
				}else{
					console.log('Error', err.message);
				}
			});  
        }
            
        // 파일 업로드 핸들러
        const handleChangeFile = (event) => {
            const rowKey   = this.state.rowKey;  
		    const slipData = this.slipRef.current.getInstance().getData();
		    slipData[rowKey].fileInfo = event.target.files[0];
		    slipData[rowKey].originFileName = event.target.files[0].name;  
		    
		    const slipRows = [];
        
	        for(let i in slipData){  
	         	slipRows.push(slipData[i]);
	        } 
	       	 
	        this.setState({ 
	            slipData : slipRows 
	        });  
	        
			this.slipRef.current.getInstance().resetData(slipRows);	      
			this.onCloseModalFile();
		} 

		return (
			<div>
                {this.state.loading && (<Loading/>)}
				<div className="page-header">
					<h3 className="page-title">Bank Slip 증빙</h3>
					<nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"> 
                                Bank Slip
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                ProofList
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
                                                    <button type="button" className="btn btn-sm btn-info" onClick={this.onOpenModalAdd}>
                                                        <Trans>송금입력</Trans>
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
									</div>
									<div className="">                                        	
										<Grid columns={columns} onGridMounted={(e) => this.onGridMounted(e)} data={this.state.gridData} ref={this.gridRef} rowHeaders={["rowNum","checkbox"]}
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
				
				{/* 등록 Modal */}
                <Modal className="modal fade" show={this.state.isOpenModalAdd} onHide={this.onCloseModalAdd} aria-labelledby="contained-modal-title-vcenter" aria-hidden="true" centered scrollable>
					<Modal.Header className="modal-header" closeButton>
						<Modal.Title><Trans>송금증빙 요청</Trans></Modal.Title>
					</Modal.Header>
					<Modal.Body>
                        {/* 등록 Form Start */}
						<Form controlid="form01" noValidate validated={this.state.vldtAdd} ref={this.formAddRef}>
							<div className ="col-12 grid-margin">
								<div className="card">   
									<div className="card-body">                                    	
										<Grid columns={slipColumns} onGridMounted={(e) => this.onGridSlipMounted(e)}  data={this.state.slipData} ref={this.slipRef}   
												scrollX={true} columnOptions={{frozenCount : 0}}>
										</Grid> 
									</div>	
								</div> 
							</div>	
						</Form>
                        {/* 등록 Form End */}
					</Modal.Body>
					<Modal.Footer>
						<button className="btn btn-sm btn-dark" onClick={this.onCloseModalAdd}><Trans>취소</Trans></button>
						<button className="btn btn-sm btn-success" onClick={(event) => addBankSlip(event)} disabled={this.state.isBtnAddDisabled}><Trans>송금증빙 요청</Trans></button>
					</Modal.Footer>
                </Modal> 
                
                {/* 등록 Modal */}
                <Modal className="modal fade" show={this.state.isOpenModalFile} onHide={this.onCloseModalFile} aria-labelledby="contained-modal-title-vcenter" aria-hidden="true" centered scrollable>
					<Modal.Header className="modal-header" closeButton>
						<Modal.Title><Trans>증빙파일업로드</Trans></Modal.Title>
					</Modal.Header>
					<Modal.Body>
                        {/* 등록 Form Start */}
						<Form controlid="form02">
							<div className ="col-12 grid-margin">
								<div className="card">   
									<div className="card-body">                                    	
										<input type="file" id="file"  onChange={handleChangeFile} accept='image/jpeg,image/gif,image/png' />
									</div>	
								</div> 
							</div>	
						</Form>
                        {/* 등록 Form End */}
					</Modal.Body> 
                </Modal> 
                
				
			</div>
		);
	}
}

export default withTranslation()(withRouter(ProofList));