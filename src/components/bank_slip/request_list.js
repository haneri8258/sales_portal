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
			
			searchKeyInvoceNo :"",
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
        this.getRequest();
	}

    getRequest = () => {
        const params = {};
        params.rowStart = 0;
        params.perPage = this.state.perPage;

        if(sessionStorage.getItem("_ADMIN_AUTH") === "PART"){
			params.storeNo = sessionStorage.getItem("_STORE_NO");
		} else {
			params.storeNo = "";
		}
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
		date.setHours(date.getHours() + 9);
		return date.toISOString().replace('T', ' ').substring(0, 19); 
	}

	exportDefaultExcel = (e) => {
		const date = new Date();
		const year = date.getFullYear();
		const month = ('0' + (date.getMonth() + 1));
		const day = ('0' + date.getDate());
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const dateStr = [year, month, day,hours,minutes].join('');
		const titleName = "Order_List_"+dateStr;

        const columnsData = this.gridRef.current.getInstance().getColumns();
        const columns = [];
        for(let i in columnsData){
            const column = {};
            column.header = columnsData[i].header;
            column.key=columnsData[i].name
            columns.push(column);
        }
        const params = {};
        params.searchKeyword = this.state.searchKeyword;
        params.startDate = this.state.startDate;
        params.endDate = this.state.endDate;
        params.searchType = this.state.searchType;
        params.searchTransStatus = this.state.searchTransStatus;
		if(sessionStorage.getItem("_GROUP_ID")=== "AG001"){
			params.storeNo = ""
		} else {
			params.storeNo = sessionStorage.getItem("_STORE_NO");
		}

        api.get(process.env.REACT_APP_DB_HOST+"/api/v1/orders/excelOrderReport",{params : params}).then(res=>{
            if(res.status ===200){
                const workbook = new ExcelJS.Workbook();
                const orderReport =workbook.addWorksheet("orderReport");
                orderReport.columns = columns;

                const data = res.data;
                data.map((item,index)=>{
                    orderReport.addRow(item);
                });

                workbook.xlsx.writeBuffer().then((data)=>{
                    const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                    const url = window.URL.createObjectURL(blob);
                    const anchor = document.createElement('a');
                    anchor.href = url;
                    anchor.download = `${titleName}.xlsx`;
                    anchor.click();
                    window.URL.revokeObjectURL(url);
                })
        
            }
        })

	}

    onGridUpdatePages = (params)=>{  
        axios.all([
             api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/requestList",{params : params})
            ,api.get(process.env.REACT_APP_DB_HOST+"/api/v1/bankslip/reportRowCount",{params : params}) 
            
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
		params.searchKeyBatch = this.state.searchKeyBatch;
		
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
 			{ name: "requestNo", header: "요청번호", width: 200, sortable: true,align: "center"},
			{ name: "requestDate", header: "요청일자", width: 200, sortable: true,align: "left"},
			{ name: "remittamceDate", header: "송금날짜", width: 150, sortable: true,align: "center"},
			{ name: "remittanceAmount", header: "송금금액", width: 150, sortable: true,align: "right" },
			{ name: "invoiceNo", header: "인보이스 번호", width: 200, sortable: true,align: "center"},
			{ name: "invoiceDate", header: "인보이스 날짜", width: 180, sortable: true,align: "left"},
			{ name: "status", header: "Status", width: 150, sortable: true,align: "center"},
			{ name: "remittamceDate", header: "Remittamce Date", width: 150, sortable: true,align: "left"},
			{ name: "depositAmt", header: "입금액", width: 150, sortable: true,align: "right"}
		];

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
                                                <DatePicker selected={this.state.startDate} className="form-control form-control-sm" size="sm"
                                                            dateFormat="yyyy-MM-dd" defaultValue="" placeholderText="시작일시" 
                                                            onChange={(date) =>   this.setState({ startDate: date })}>
                                                </DatePicker>
                                            </li>
                                            <li className="list-inline-item me-1"> ~</li>
                                            <li className="list-inline-item me-1">
                                                <DatePicker selected={this.state.endDate} className="form-control form-control-sm"
                                                            dateFormat="yyyy-MM-dd" placeholderText="종료일시" defaultValue=""
                                                            minDate={this.state.startDate} onChange={(date) => this.setState({ endDate: date })}>
                                                </DatePicker>
                                            </li>
											<li className="list-inline-item me-1">
                                                <Form.Text><Trans>인보이스 번호</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1"> 
                                                <Form.Control type="text" className="form-control" size="sm" name="searchKeyInvoceNo" value={this.state.searchKeyInvoceNo} onChange={this.onChange}
                                                        style={{"minHeight": "1rem"}}placeholder="인보이스번호를입력하세요">
                                                </Form.Control> 
                                            </li>
											<li className="list-inline-item me-1">
                                                <Form.Text><Trans>인보이스 날짜</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <DatePicker selected={this.state.startDate} className="form-control form-control-sm" size="sm"
                                                            dateFormat="yyyy-MM-dd" defaultValue="" placeholderText="시작일시" 
                                                            onChange={(date) =>   this.setState({ startDate: date })}>
                                                </DatePicker>
                                            </li>
                                            <li className="list-inline-item me-1"> ~</li>
                                            <li className="list-inline-item me-1">
                                                <DatePicker selected={this.state.endDate} className="form-control form-control-sm"
                                                            dateFormat="yyyy-MM-dd" placeholderText="종료일시" defaultValue=""
                                                            minDate={this.state.startDate} onChange={(date) => this.setState({ endDate: date })}>
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
                                                    <button type="button" className="btn btn-sm btn-info" onClick={this.exportDefaultExcel}>
                                                        <Trans>엑셀</Trans>
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

export default withTranslation()(withRouter(RequestList));