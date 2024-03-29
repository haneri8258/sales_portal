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
 * 설명 : 인보이스 별 BankSlip 현황(거래처)
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
class InvoceList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			startDate:"",
			endDate : "",
			isOpenModal : false,
			
			searchKeyInvoiceDate :"",
			searchKeyStatus  :"",
			searchKeyInvoiceNo :"", 
		
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
             api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/invoiceClientList",{params : params})
            ,api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/invoiceClientRowCount",{params : params}) 
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
		if(date){
			date.setHours(date.getHours() + 9);
			return date.toISOString().replace('T', ' ').substring(0, 10); 
		}
	}
  
    onGridUpdatePages = (params)=>{  
        axios.all([
             api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/invoiceClientList",{params : params})
            ,api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/invoiceClientRowCount",{params : params}) 
        ]).then(axios.spread((res1,res2)=>{
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
			searchKeyStatus  :"",
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

    onChangePerPage = (perPage,e) =>{
        this.setState({
            perPage : Number(perPage),
        })
        const params = {};
 
		params.searchKeyInvoiceDate = this.timestamp(this.state.searchKeyInvoiceDate);
		params.searchKeyStatus = this.state.searchKeyStatus;  
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
		params.searchKeyStatus = this.state.searchKeyStatus;  
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
		params.searchKeyStatus =  this.state.searchKeyStatus;  
		params.searchKeyInvoiceNo = this.state.searchKeyInvoiceNo; 
		
        params.pageNumber = 1;
        params.rowStart = 0;
        params.perPage = Number(this.state.perPage);
		params.clientId = sessionStorage.getItem('_CLIENT_ID');
        this.onGridUpdatePages(params);
	} 

	render() {
        const {pageInfo} = this.state;
 

		const columns = [
 			{ name: "invoiceNo", header: "인보이스 번호", width: 200, sortable: true,align: "center"},
			{ name: "invoiceDate", header: "인보이스 일자", width: 200, sortable: true,align: "left"},
			{ name: "invoiceAmount", header: "인보이스 금액", width: 150, sortable: true,align: "right"
				,formatter({value}){
					return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				}
			},
			{ name: "depositAmt", header: "입금액", width: 150, sortable: true,align: "right"
				,formatter({value}){
					return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				} 
			},
			{ name: "confirmAmt", header: "승인입금액", width: 150, sortable: true,align: "right"
				,formatter({value}){
					return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				} 
			},
			{ name: "status", header: "Status", width: 150, sortable: true,align: "center"
				,formatter({value}){
					return value === '정산완료' ? '<span style="width:100%;height:100%;color:blue;font-weight:bold;">'+value+'</span>' 
					:  (value === '미정산' ? '<span style="width:100%;height:100%;color:red;font-weight:bold;">'+value+'</span>' : '<span style="width:100%;height:100%;color:black;font-weight:bold;">'+value+'</span>')  ; 
				} 
			},  
			{ name: "balanceAmt", header: "차액(자동계산)", width: 200, sortable: true,align: "right" 
				,formatter({value}){
					return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				} 
			}
		];

		return (
			<div>
                {this.state.loading && (<Loading/>)}
				<div className="page-header">
					<h3 className="page-title">인보이스 별 BankSlip 현황(거래처)</h3>
					<nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"> 
                                Bank Slip
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                InvoiceList
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
                                                <Form.Text><Trans>Status</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1"> 
                                                <Form.Select name="searchKeyStatus" className="form-select-sm" onChange={this.onChange} value={this.state.searchKeyStatus}>
                                                    <option value="">전체</option>
                                                    <option value="미정산">미정산</option>
                                                    <option value="부분산중">부분정산</option>
                                                    <option value="정산완료">정산완료</option> 
                                                </Form.Select>
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
			</div>
		);
	}
}

export default withTranslation()(withRouter(InvoceList));