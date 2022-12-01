/**
 * This application was developed by Haneri.jeong  of ITS Community at 2022 years.
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
import 'tui-date-picker/dist/tui-date-picker.css';
import { Loading } from "../../loading";
/**
 * 설명 : BankSlip 요청현황
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
class RequestList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			startDate:"",
			endDate : "",
			isOpenModal : false,
			isOpenModalFile: false,
			
			searchKeyInvoiceDate :"",
			searchKeyRemittanceDate  :"",
			searchKeyInvoiceNo :"", 
			
			imageBase64 : "",
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
         
	// 증빙파일 열기
    onOpenModalFile = async (rowKey) => {
    
	     const gridData =	this.gridRef.current.getInstance().getData(); 
	     const params   = { serverFileName : gridData[rowKey].serverFileName};
	     axios.all([api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/getServerFileName",{params : params}) 
         ]).then(
         	axios.spread((res)=>{   
         			debugger;
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
        this.getRequest();
	}

    getRequest = () => {
        const params = {};
        params.rowStart = 0;
        params.perPage = this.state.perPage;
		params.clientId = sessionStorage.getItem('_CLIENT_ID');
        
        axios.all([
             api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/requestList",{params : params})
            ,api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/requestRowCount",{params : params}) 
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
             api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/requestList",{params : params})
            ,api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/requestRowCount",{params : params}) 
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
			searchKeyRemittanceDate  :"",
			searchKeyInvoiceNo :"", 
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
 
		params.searchKeyInvoiceDate = this.timestamp(this.state.searchKeyInvoiceDate);
		params.searchKeyRemittanceDate = this.timestamp(this.state.searchKeyRemittanceDate);  
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
		params.searchKeyRemittanceDate = this.timestamp(this.state.searchKeyRemittanceDate);  
		params.searchKeyInvoiceNo = this.state.searchKeyInvoiceNo; 
        params.clientId = sessionStorage.getItem('_CLIENT_ID');
        params.rowStart = (Number(pageNumber-1))*Number(this.state.perPage);
        params.perPage = Number(this.state.perPage);
        params.pageNumber = pageNumber;
		 
        this.onGridUpdatePages(params);

    }

    onSearch = (e) =>{
		const params = {};
 
		params.searchKeyInvoiceDate = this.timestamp(this.state.searchKeyInvoiceDate);
		params.searchKeyRemittanceDate = this.timestamp(this.state.searchKeyRemittanceDate);  
		params.searchKeyInvoiceNo = this.state.searchKeyInvoiceNo; 
		
        params.pageNumber = 1;
        params.rowStart = 0;
        params.perPage = Number(this.state.perPage);
		params.clientId = sessionStorage.getItem('_CLIENT_ID');
        this.onGridUpdatePages(params);
	} 

	render() {
        const {pageInfo} = this.state;

		const onClickedAtag = (e, rowKey) => {
			
			e.preventDefault();
            this.onOpenModalFile(rowKey);
		}
		

		const columns = [
 			{ name: "seq", header: "요청번호", width: 200, sortable: true,align: "center"},
 			{ name: "requestDate", header: "요청일자", width: 150, sortable: true,align: "center"},
 			
 			
 			{ name: "remittanceDate", header: "송금 날짜", width: 150, sortable: true,align: "center"},
			{ name: "remittanceAmount", header: "송금 금액", width: 150, sortable: true,align: "right"
				,formatter({value}){
					return '<span style="width:100%;height:100%;color:blue">'+value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+'</span>&nbsp;&nbsp;&nbsp;&nbsp';
				}
			},
 			
			{ name: "remittanceType", header: "인보이스 번호", width: 200, sortable: true,align: "center"},
			{ name: "invoiceDate", header: "인보이스 일자", width: 150, sortable: true,align: "center"}, 
			/*
			{ name: "invoiceAmount", header: "인보이스 금액", width: 150, sortable: true, align: "right"
				,formatter({value}){
					return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				}
		 	},
		 	*/
			{ name: "status", header: "승인 상태", width: 150, sortable: true,align: "center"},
			{ name: "confirmDate", header: "거래일자", width: 150, sortable: true,align: "center"},
			/*	
			{ name: "createdAt", header: "승인요청일자", width: 150, sortable: true,align: "center"},
		 	*/
			{ name: "confirmAmount", header: "입금액", width: 150, sortable: true,align: "right"
				,formatter({value}){
					return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				}
			},
			{ name: "comment", header: "승인 내용", width: 300, sortable: true,align: "left"},
			{ name: "serverFileName", header: "증빙서 서버파일명", width: 0, hidden: true },
			{ name: "originFileName", header: "증명서", width: 300, sortable: true,align: "left"
				,renderer: {
                    type: LinkInGrid,
                    options: {
                        onClickedAtag
                    }
                } 
				,formatter({value}){
					return '<span style="width:100%;height:100%;color:blue">'+value.toString()+'</span>';
				}
			},
		 	
			
		];

	
	// 파일 업로드 핸들러
    const handleChangeFile = (event) => {
      /*  const rowKey   = this.state.rowKey;  
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
		this.onCloseModalFile();*/
	} 
	
		return (
			<div>
                {this.state.loading && (<Loading/>)}
				<div className="page-header">
					<h3 className="page-title">BankSlip 요청현황</h3>
					<nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"> 
                                Bank Slip
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                RequestList
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
                                                <Form.Text><Trans>송금 날짜</Trans></Form.Text>
                                            </li>
                                        	<li className="list-inline-item me-1">
                                                <DatePicker selected={this.state.searchKeyRemittanceDate} className="form-control form-control-sm" size="sm"
                                                            dateFormat="yyyy-MM-dd" defaultValue="" placeholderText="송금 날짜" 
                                                            onChange={(date) =>   this.setState({ searchKeyRemittanceDate: date })}>
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
			</div>
		);
	}
}

export default withTranslation()(withRouter(RequestList));