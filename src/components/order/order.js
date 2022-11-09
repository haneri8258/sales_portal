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
 * 설명 : 주문관리
 *
 * @author		: 윤홍주
 * @since 		: 2022.04.15
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
class OrdersOrder extends Component {
	constructor(props) {
		super(props);
		this.state = {
			startDate:"",
			endDate : "",
			isOpenModal : false,

			mall : "",
			orderStatus : "",
			searchType : "",
			nonSaleOption : "",
			searchKeyword : "",
            searchTransStatus : "",

			gridData : [],
            orderStatusList : [],
            pageInfo : {
                totalPage : 0,
                totalCount : 0
            },
            activePage : 1,
            perPage : 20,
            pageNumber : "",


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
            api.get(process.env.REACT_APP_DB_HOST+"/order/getOrders",{params : params})
            , api.get(process.env.REACT_APP_DB_HOST+"/order/orderRowCount",{params : params})
            , api.get(process.env.REACT_APP_DB_HOST+"/order/getOrderStatus")
        ]).then(
            axios.spread((res1,res2,res3)=>{
				this.setState({
					gridData : res1.data,
                    pageInfo : res2.data,
                    orderStatusList : res3.data,
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

        api.get(process.env.REACT_APP_DB_HOST+"/order/excelOrders",{params : params}).then(res=>{
            if(res.status ===200){
                const workbook = new ExcelJS.Workbook();
                const inventoryList =workbook.addWorksheet("inventoryList");
                inventoryList.columns = columns;

                const data = res.data;
                data.map((item,index)=>{
                    inventoryList.addRow(item);
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

		if(sessionStorage.getItem("_GROUP_ID")=== "AG001"){
			params.storeNo = ""
		} else {
			params.storeNo = sessionStorage.getItem("_STORE_NO");
		}
        axios.all([
            api.get(process.env.REACT_APP_DB_HOST+"/order/getOrders",{params : params})
            , api.get(process.env.REACT_APP_DB_HOST+"/order/orderRowCount",{params :params})
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
			startDate : "",
			endDate : "",
			searchType : "",
			nonSaleOption : "",
			searchKeyword : "",
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
        if(this.state.startDate !== ""){
			params.startDate = this.timestamp(this.state.startDate);
		}
		if(this.state.endDate !== ""){
			params.endDate = this.timestamp(this.state.endDate);
		}
		params.searchType = this.state.searchType;
        params.searchKeyword = this.state.searchKeyword;
        params.searchTransStatus = this.state.searchTransStatus;
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
        if(this.state.startDate !== ""){
			params.startDate = this.timestamp(this.state.startDate);
		}
		if(this.state.endDate !== ""){
			params.endDate = this.timestamp(this.state.endDate);
		}
		params.searchType = this.state.searchType;
        params.searchKeyword = this.state.searchKeyword;
        params.searchTransStatus = this.state.searchTransStatus;
        params.rowStart = (Number(pageNumber-1))*Number(this.state.perPage);
        params.perPage = Number(this.state.perPage);
        params.pageNumber = pageNumber;
		params.storeNo = sessionStorage.getItem("_STORE_NO");
        this.onGridUpdatePages(params);

    }

    onSearch = (e) =>{
		const params = {};
		if(this.state.startDate !== ""){
			params.startDate = this.timestamp(this.state.startDate);
		}
		if(this.state.endDate !== ""){
			params.endDate = this.timestamp(this.state.endDate);
		}
		params.searchType = this.state.searchType;
		params.searchKeyword = this.state.searchKeyword;
        params.searchTransStatus = this.state.searchTransStatus;
        params.pageNumber = 1;
        params.rowStart = 0;
        params.perPage = Number(this.state.perPage);
		params.storeNo = sessionStorage.getItem("_STORE_NO");
        this.onGridUpdatePages(params);
	}

    getApiOrders = async(e) => {
        e.preventDefault();
        this.setState({loading: true});
        await api.get(process.env.REACT_APP_DB_HOST+"/cafe24/api/orders").then(res => {
            if(res.status === 200){
                this.setState({loading:false});
                this.getOrders();
            }
        }).catch(err => {
            console.log(err);
            this.setState({loading:false});
            if(err.response){
                console.log(err.response.data);
            }else if(err.request){
                console.log(err.request);
            }else{
                console.log('Error', err.message);
            }
        });
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
			{ name: "storeName", header: "타겟몰", width: 100, sortable: true,align: "center"},
			{ name: "paymentMethodCode", header: "결제방식", width: 120, sortable: true,align: "center"},
			{ 
				name: "orderNo", 
				header: "SCM주문번호", 
				width: 180,
				sortable: true,
				align: "center",
				renderer : {
					type : LinkInGrid,
					options : {
						onClickedAtag
					}
				},
			},
			{ name: "transStatus", header: "주문상태", width: 120, sortable: true,align: "center"},
			{ 
				name: "storeOrderNo", 
				header: "타겟몰주문번호", 
				width: 200, 
				sortable: true,
				align: "center",
			},
			{ 
                name: "paymentAmount",
                header: "결제총금액",
                width: 100,
                sortable: true,
                align: "center",
                formatter: ({ value }) => {
                    const currency = Number(value).toLocaleString(); 
                    return `${currency}원`; 
                },	
            },			{ 
                name: "commission",
                header: "결제수수료",
                width: 100,
                sortable: true,
                align: "center",
                formatter: ({ value }) => {
                    const currency = Number(value).toLocaleString(); 
                    return currency === 0 ? `0원`:`${currency}원` 
                },	
            },

			{ name: "deliveryCompany", header: "택배사", width: 100, sortable: true,align: "center"},
			{ name: "receiverName", header: "수취인", width: 120, sortable: true,align: "center"},
			{ name: "orderDate", header: "결제일시", width: 150, sortable: true,align: "center"},
			{ name: "productName", header: "상품명", width: 300, sortable: true,align: "center" },
			{ name: "productOptionName", header: "옵션정보", width: 100, sortable: true,align: "center" },
			{ name: "productTotalQty", header: "수량", width: 80, sortable: true,align: "center" },
			{ 
				name: "productAmount", 
				header: "상품금액",
				 width: 120, 
				 sortable: true,
				 align: "center",
				 formatter: ({ value }) => {
					if(value !== null){
						const currency = Number(value).toLocaleString(); 
						return `${currency}원`; 
					}
				},	
			},            
            { 
                name: "point", header: "포인트사용금액", width: 80, sortable: true,align: "center", 
                    formatter: ({ value }) => {
                    if(value !== null){
                        const currency = Number(value).toLocaleString(); 
                        return `${currency}원`; 
                    }
                }, 
            },
			{ 
                name: "discount", header: "할인금액", width: 80, sortable: true,align: "center", 
                formatter: ({ value }) => {
					if(value !== null){
						const currency = Number(value).toLocaleString(); 
						return `${currency}원`; 
					}
				},
            },
			{ 
                name: "coupon", header: "쿠폰사용금액", width: 80, sortable: true,align: "center" ,
                formatter: ({ value }) => {
					if(value !== null){
						const currency = Number(value).toLocaleString(); 
						return `${currency}원`; 
					}
				},
            },
			{ 
				name: "deliverCharge", 
				header: "배송비", 
				width: 80, 
				sortable: true,
				align: "center",
				formatter: ({ value }) => {
					if(value !== null){
						const currency = Number(value).toLocaleString(); 
						return `${currency}원`; 
					}
				},	
			},
			{ name: "deliveryCompany", header: "택배사", width: 100, sortable: true,align: "center" },
			{ name: "invoiceNo", header: "송장번호", width: 100, sortable: true ,align: "center"},
			{ name: "ordererName", header: "주문자", width:80, sortable: true,align: "center"},
			{ name: "ordererMobileNo", header: "주문자휴대폰 번호", width:150, sortable: true ,align: "center"},
			{ name: "ordererTelNo", header: "주문자 전화번호", width:150, sortable: true,align: "center" },
			{ name: "receiverMobileNo", header: "수취인 휴대폰 번호", width: 150, sortable: true,align: "center"},
			{ name: "receiverTelNo", header: "수취인 전화번호", width: 150, sortable: true,align: "center"},
			{ name: "receiverZipCode", header: "우편번호", width: 120, sortable: true,align: "center"},
			{ name: "receiverAddr", header: "주소", width: 400, sortable: true,align: "center"},
			{ name: "receiverAddrDetail", header: "주소상세", width: 150, sortable: true,align: "center"},
			{ name: "deliveryMemo", header: "배송메세지", width: 100, sortable: true,align: "center"},
			{ name: "customsCode", header: "세관신고정보", width: 120, sortable: true,align: "center"},
		];

		return (
			<div>
                {this.state.loading && (<Loading/>)}
				<div className="page-header">
					<h3 className="page-title">Order List</h3>
					<nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"> 
                                Order
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Order
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
                                                <Form.Text><Trans>결제일시</Trans></Form.Text>
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <DatePicker selected={this.state.startDate} className="form-control form-control-sm" size="sm"
                                                            dateFormat="yyyy-MM-dd" defaultValue="" placeholderText="시작일시" 
                                                            onChange={(date) =>	this.setState({ startDate: date })}>
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
                                                <Form.Select name="searchType" className="form-select-sm" onChange={this.onChange} value={this.state.searchType}>
                                                    <option value="null">::검색항목::</option>
                                                    <option value="storeName">타겟몰</option>
                                                    <option value="orderNo">SCM주문번호</option>
                                                    <option value="transStatus">주문상태</option>
                                                    <option value="storeOrderNo">타겟몰주문번호</option>
                                                    <option value="invoiceNo">한국송장번호</option>
                                                    <option value="ordererName">주문자명</option>
                                                    <option value="ordererMobileNo">주문자휴대폰</option>
                                                    <option value="ordererTelNo">주문자전화번호</option>
                                                    <option value="receiverName">수취인명</option>
                                                    <option value="receiverMobileNo">수취인휴대폰</option>
                                                    <option value="receiverTelNo">수취인전화번호</option>
                                                </Form.Select>
                                            </li>
                                            {this.state.searchType === "transStatus" &&
                                                <li className="list-inline-item me-1">
                                                    <Form.Select name="searchTransStatus" className="form-select-sm" onChange={this.onChange} value={this.state.searchTransStatus}>
                                                    <option value="">::주문상태::</option>
                                                        {   
                                                            this.state.orderStatusList.map((option)=>{
                                                                return <option key={option.code} value={option.code} >{option.codeNm}</option>
                                                            })
                                                        }
                                                    </Form.Select>
                                                </li>
                                            }
                                            <li className="list-inline-item me-1">
                                                <Form.Control type="text" className="form-control" size="sm" name="searchKeyword" value={this.state.searchKeyword} onChange={this.onChange}
                                                        style={{"minHeight": "1rem"}}placeholder="검색어를 입력하세요">
                                                </Form.Control>
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <button type="button" className="btn btn-sm btn-success"  onClick={this.onSearch}>
                                                    <Trans>검색</Trans>
                                                </button>
                                            </li>
                                            <li className="list-inline-item me-1">
                                                <button	type="button" className="btn btn-sm btn-dark" onClick={this.onResetGrid}>
                                                    <Trans>목록</Trans>
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
                                            <button className="btn btn-sm btn-warning m-1" onClick={(e) => this.getApiOrders(e)}><i className="mdi mdi-cloud-download-outline"></i> 주문 불러오기</button>
                                        </div>
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
												scrollX={true} columnOptions={{frozenCount : 5}}>
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
				<Modal show={this.state.isOpenModal} onHide={this.closeModal} aria-labelledby="contained-modal-title-vcenter"centered>
					<Modal.Header closeButton>
						<Modal.Title><Trans>송장번호 일괄업로드</Trans></Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div className="">
							<Form.Select name="" className="form-select-sm">
								<option>택배사 선택</option>
								<option>cj대한통운</option>
								<option>우체국택배</option>
							</Form.Select>
							<div className="float-start">
								<Form.Label className="col-sm-3 col-form-label"><Trans>입력란</Trans></Form.Label>
								<Form.Control as="textarea" rows={20} />
							</div>
							<div className="float-end">
								<Form.Label className="col-sm-3 col-form-label"><Trans>결과란</Trans></Form.Label>
								<Form.Control as="textarea" rows={20} />
							</div>
						</div>
						<div>
						<div className="float-start ">
								<Trans>* 주문번호 송장번호는 순서대로 복사해서 넣어주시면 됩니다</Trans>
							</div>
						</div>
					</Modal.Body>
					<Modal.Footer>
					<button className="btn btn-sm btn-success" onClick={this.saveInvoice}>
						<Trans>저장</Trans>
						</button>
						<button className="btn btn-sm btn-dark" onClick={this.closeModal}>
							<Trans>Close</Trans>
						</button>
					</Modal.Footer>
				</Modal>
			</div>
		);
	}
}

export default withTranslation()(withRouter(OrdersOrder));