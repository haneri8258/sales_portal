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
		debugger;
        this.getRequest();
	}

    getRequest = () => {
        const params = {};
        params.rowStart = 0;
        params.perPage = this.state.perPage;
  
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
    
	timestamp = (date)=>{
		date.setHours(date.getHours() + 9);
		return date.toISOString().replace('T', ' ').substring(0, 19); 
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
	
	// 등록창 열기
    onOpenModalAdd = async () => { 
        this.setState({
            isOpenModalAdd: true
        });
    }

    // 등록창 닫기
    onCloseModalAdd = () => {
       // this.emptyChoiceData();

        this.setState({
            isOpenModalAdd: false 
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
 			{ name: "invoiceNo", header: "Invoice", width: 200, sortable: true,align: "center"},
			{ name: "invoiceDate", header: "Invoice Date", width: 200, sortable: true,align: "left"},
			{ name: "invoiceAmount", header: "Amount", width: 150, sortable: true,align: "right"},
			{ name: "balanceAmount", header: "잔액", width: 150, sortable: true,align: "right" },
			{ name: "selectYn", header: "선택", minWidth: 100, align: "center", editor: 'text', formatter: "listItemText", 
                editor:{
                    type:'checkbox', 
                    useViewMode: false,
                    options:{
                        listItems:[
                            {text: '', value:'Y'}
                        ],
                    }
                },
            }    
		];
		
		// 등록
        const addBankSlip = async (event) => {
        
        
        }

		return (
			<div>
                {this.state.loading && (<Loading/>)}
				<div className="page-header">
					<h3 className="page-title">BankSlip 증빙</h3>
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
                                                <button type="button" className="btn btn-sm btn-success"  onClick={this.onSearch}>
                                                    <Trans>Search</Trans>
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
                <Modal className="modal fade" show={this.state.isOpenModalAdd} onHide={this.onCloseModalAdd} aria-labelledby="contained-modal-title-vcenter" aria-hidden="true" centered scrollable>
					<Modal.Header className="modal-header" closeButton>
						<Modal.Title><Trans>Channel 등록</Trans></Modal.Title>
					</Modal.Header>
					<Modal.Body>
                        {/* 등록 Form Start */}
						<Form controlid="form01" noValidate validated={this.state.vldtAdd} ref={this.formAddRef}>
							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="mallIdAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Badge className="badge rounded-pill bg-danger">필수</Badge>&nbsp;<Trans>채널 ID</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
									<Form.Control type="text" name="mallIdAdd" className="form-control-sm"value={this.state.mallIdAdd || ""} 
										          onChange={(event) => this.onChangeHandler(event)} placeholder="영문/숫자 20글자 이내" required
                                                  maxLength={"20"} aria-describedby="mallIdAddHelp"autoFocus >
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid"><Trans>채널 ID를</Trans>&nbsp;<Trans>입력해주세요.</Trans></Form.Control.Feedback>
                                    {this.state.isMallIdIdAddX && <span id="mallIdAddHelp" className="text-danger small" muted><Trans>이미 사용중인 채널 ID 입니다.</Trans></span>}
                                    {this.state.isMallIdAddO && <span id="mallIdAddHelp" className="text-success small" muted><Trans>사용이 가능한 채널 ID 입니다.</Trans></span>}
                                    {this.state.isMallId && <span id="mallIdAddHelp" className="text-danger small" muted><Trans>채널 ID를 입력하세요.</Trans></span>}
								</div>
							</Form.Group>
							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="mallNameAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Badge className="badge rounded-pill bg-danger">필수</Badge>&nbsp;<Trans>채널 명</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
									<Form.Control type="text" name="mallNameAdd" className="form-control-sm" value={this.state.mallNameAdd || ""} 
										          onChange={(event) => this.onChangeHandler(event)} placeholder="100글자 이내" required
                                                  maxLength={"100"} aria-describedby="mallNameAddHelp"autoFocus>
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid"><Trans>채널 명을</Trans>&nbsp;<Trans>입력해주세요.</Trans></Form.Control.Feedback>
                                    {this.state.isMallName && <span id="mallNameAddHelp" className="text-danger small" muted><Trans>채널명을 입력하세요.</Trans></span>}
								</div>
							</Form.Group>
							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="mallAliasAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Badge className="badge rounded-pill bg-danger">필수</Badge>&nbsp;<Trans>채널 Alias</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
									<Form.Control type="text" name="mallAliasAdd" className="form-control-sm" value={this.state.mallAliasAdd || ""} 
										          onChange={(event) => this.onChangeHandler(event)} placeholder="30글자 이내" required
                                                  maxLength={"30"} aria-describedby="mallAliasAddHelp"autoFocus>
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid"><Trans>채널 명을</Trans>&nbsp;<Trans>입력해주세요.</Trans></Form.Control.Feedback>
                                    {this.state.isMallAlias && <span id="mallAliasAddHelp" className="text-danger small" muted><Trans>채널Alias를 입력하세요.</Trans></span>}
								</div>
							</Form.Group> 

	  					
							<Form.Group className="row border-bottom m-0"> 
								<Form.Label htmlFor="openDateAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>시작일자</Trans>
                                </Form.Label> 
								<div className="col-sm-8 p-1"> 
									<Form.Control type="date" name="openDateAdd" className="form-control-sm" 
										          onChange={(event) => this.onChangeHandler(event)}   
                                                  maxLength={"10"} aria-describedby="openDateAddHelp"autoFocus>
                                    </Form.Control> 
 
								</div>	 
                            </Form.Group> 
	
							<Form.Group className="row border-bottom m-0"> 
								<Form.Label htmlFor="closeDateAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>종료일자</Trans>
                                </Form.Label> 
								<div className="col-sm-8 p-1">
									<Form.Control type="date" name="closeDateAdd" className="form-control-sm" 
										          onChange={(event) => this.onChangeHandler(event)}  
                                                  maxLength={"10"} aria-describedby="openDateAddHelp"autoFocus>
                                    </Form.Control> 
								</div> 
                            </Form.Group>
	
							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="remarkAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>비고</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
									<Form.Control type="text" name="remarkAdd" className="form-control-sm" value={this.state.remarkAdd || ""} 
										          onChange={(event) => this.onChangeHandler(event)} placeholder="100글자 이내"
                                                  maxLength={"30"} aria-describedby="remarkAddHelp" autoFocus >
                                    </Form.Control> 
								</div>
							</Form.Group>	

							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="useYnAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>사용여부</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
                                    <Form.Select name="useYnAdd" className="form-select-sm" onChange={(event) => this.onChangeHandler(event)} value={this.state.useYnAdd || ""}>
                                        <option value="Y">사용중</option>
                                        <option value="N">미사용</option>
                                    </Form.Select>
								</div>
							</Form.Group> 

						</Form>
                        {/* 등록 Form End */}
					</Modal.Body>
					<Modal.Footer>
						<button className="btn btn-sm btn-dark" onClick={this.onCloseModalAdd}><Trans>취소</Trans></button>
						<button className="btn btn-sm btn-success" onClick={(event) => addBankSlip(event)} disabled={this.state.isBtnAddDisabled}><Trans>등록</Trans></button>
					</Modal.Footer>
                </Modal> 
				
			</div>
		);
	}
}

export default withTranslation()(withRouter(ProofList));