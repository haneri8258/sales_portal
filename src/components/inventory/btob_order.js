/**
 * This application was developed by Haneri.jeong  of ITS Community at 2022 years.
 */
import React, { Component } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import Grid from "@toast-ui/react-grid";
import { Form } from 'react-bootstrap';
import axios from 'axios';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import LinkInGrid from '../utils/linkInGrid';
import DatePicker from "react-datepicker";
import api from '../../CustomAxios';
import Pagination from 'react-js-pagination';
import ExcelJS from 'exceljs';
import TuiGrid from 'tui-grid';
/**
 * 설명 : 발주관리
 *
 * @author		: 윤홍주
 * @since 		: 2022.04.15
 * @reference   : 참조 - 
 */
function withRouter (Component){
	function ComponentWithRouterProp(props){
		let navigate = useNavigate();
		let params = useParams();
        let location = useLocation();
		return (
			<Component {...props} router={{navigate, params,location}}/>
		);
	}
	return ComponentWithRouterProp
} 
class BtoBOrder extends Component{
	constructor(props){
		super(props);
		this.state = {
            startDate : "",
            endDate : "",
            searchKeyword : "",
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
		}
	}
	gridRef = React.createRef();

    componentDidMount(){
        TuiGrid.applyTheme("striped");
    }
    onGridMounted = (e) => {
        const params={};
        params.rowStart = 0;
        params.perPage = this.state.perPage;
        axios.all([
            api.get(process.env.REACT_APP_DB_HOST+"/inventory/btoborders",{params : params})
            , api.get(process.env.REACT_APP_DB_HOST+"/inventory/b2borderRowCount",{params : params})
        ]).then(
            axios.spread((res1,res2)=>{
				this.setState({
					gridData : res1.data,
                    pageInfo : res2.data,
				});
				e.instance.resetData(res1.data);
            })
        )
    }
	onChange = (e) =>{
		this.setState({
			[e.target.name] : e.target.value
		})
	}

    timestamp = (date)=>{
		date.setHours(date.getHours() + 9);
		return date.toISOString().replace('T', ' ').substring(0, 19); 
	}

    onSearch = (e) => {
		const params = {};
		if(this.state.startDate !== ""){
			params.startDate = this.timestamp(this.state.startDate);
		}
		if(this.state.endDate !== ""){
			params.endDate = this.timestamp(this.state.endDate);
		}
		params.searchKeyword = this.state.searchKeyword;
        params.pageNumber = 1;
        params.rowStart = 0;
        params.perPage = Number(this.state.perPage);
        this.onGridUpdatePages(params);

    }
    onResetGrid = (e) => {
        this.setState({
			searchKeyword : "",
            startDate : "",
            endDate : "",

		});
        const params = {};
        params.searchKeyword = "";
        params.pageNumber = 1;
        params.rowStart = 0;
        params.perPage =20;
        this.onGridUpdatePages(params);

    }
	exportDefaultExcel = (e) =>{
		const date = new Date();
		const year = date.getFullYear();
		const month = ('0' + (date.getMonth() + 1));
		const day = ('0' + date.getDate());
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const dateStr = [year, month, day,hours,minutes].join('');
		const titleName = "B2BOrder_List_"+dateStr;

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
        api.get(process.env.REACT_APP_DB_HOST+"/inventory/excelBtoborders",{params : params}).then(res=>{
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
        axios.all([
            api.get(process.env.REACT_APP_DB_HOST+"/inventory/btoborders",{params : params})
            , api.get(process.env.REACT_APP_DB_HOST+"/inventory/b2borderRowCount",{params : params})
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

    onChangePage = (pageNumber) => {
        this.setState({
            pageNumber : pageNumber
        })
        const params = {};
        if(this.state.startDate !== ""){
			params.startDate = this.timestamp(this.state.startDate);
		}
		if(this.state.endDate !== ""){
			params.endDate = this.timestamp(this.state.endDate);
        }
        params.searchKeyword = this.state.searchKeyword;
        params.pageNumber = pageNumber;
        params.rowStart  = (Number(pageNumber-1)*Number(this.state.perPage));
        params.perPage = Number(this.state.perPage);
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
        params.mall = this.state.mall;
		params.orderStatus = this.state.orderStatus;
		params.searchType = this.state.searchType;
		params.nonSaleOption = this.state.nonSaleOption;
        params.searchKeyword = this.state.searchKeyword;
        params.pageNumber = 1;
        params.rowStart = 0;
        params.perPage = Number(perPage);
        this.onGridUpdatePages(params);
    }

	render(){
        const {pageInfo} = this.state;

		const onClickedAtag = (e, rowKey) => {
			e.preventDefault();
			const b2borderNo = this.gridRef.current.getInstance().getRow(rowKey).b2borderNo;
			const b2borderStatus = this.gridRef.current.getInstance().getRow(rowKey).b2borderStatus;
			this.props.router.navigate('/inventory/btob_order/'+b2borderNo+"/edit", {state : {"b2borderStatus" : b2borderStatus}});
		}

		const B2BColumns = [

            {name : "b2boTransNo", header : "발주처리번호",hidden : true},
            {name : "productNo", header : "상품번호",hidden : true},
            {name : "optionNo", header : "옵션번호",hidden : true},
			{
				name : "b2borderNo",
				header : "발주번호", 
				align: "center", 
				sortable : true, 
				filter : 'select',
                width : 200,
				renderer : {
					type : LinkInGrid,
					options : {
						onClickedAtag
					}
				},
			},
            {name : "b2borderDate", header : "발주일시", align: "center", sortable : true, width : 200},
            {name : "b2borderStatus", header : "발주상태", align: "center", sortable : true, filter : 'select',width : 120,hidden:true},
            {name : "b2borderStatusName", header : "발주상태", align: "center", sortable : true, filter : 'select',width : 120,},
			{name : "categoryNameAll", header : "카테고리", align: "center", sortable : true, filter : 'select', width : 200},
			{name : "productName", header : "상품명", align: "center", sortable : true, filter : 'select',width : 120,},
			{name : "warehouseName", header : "물류창고", align: "center", sortable : true, filter : 'select',width : 120,},
			{
                name : "productPrice", 
                header : "상품단가", 
                align: "center", 
                sortable : true, 
                filter : 'number',
                width : 120,
                formatter: ({ value }) => {
					if(value !== null){
						const currency = Number(value).toLocaleString(); 
						return `${currency}원`; 
					}
				},	

            },
			{
                name : "productTotalQty",
                header : "상품총개수", 
                align: "center", 
                sortable : true, 
                filter : 'number',
                width : 150,
                formatter: ({ value }) => {
					if(value !== null){
						const currency = Number(value).toLocaleString(); 
						return `${currency}개`; 
					}
				},	

            },
			{
                name : "b2borderAmount", 
                header : "발주총금액", 
                align: "center", 
                sortable : true, 
                filter : 'number',
                width : 150,
                formatter: ({ value }) => {
					if(value !== null){
						const currency = Number(value).toLocaleString(); 
						return `${currency}원`; 
					}
				},	

            },
			{name : "b2bordererName", header : "발주자", align: "center", sortable : true, filter : 'select',width : 120,},
			{name : "paymentCode", header : "결제방법", align: "center", sortable : true, filter : 'select',width : 120,},
			{name : "paymentFinishYn", header : "결제완료여부", align: "center", sortable : true, filter : 'select',width : 150,},
		]

		
		return(
            <div>
                <div className="page-header">
                    <h3 className="page-title">
                        B2B Order List
                    </h3>
                    <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">Inventory</li>
                        <li className="breadcrumb-item active" aria-current="page">B2B-Order</li>
                    </ol>
                    </nav>
                </div>
                <div className="row">
                    <div className="col-12 grid-margin">
                        <div className="card">
                            <div className="card-body">
								<div>
									<ul className=" list-inline text-end my-3 mb-3">
                                        <li className="list-inline-item me-1">
											<Form.Text><Trans>발주일시</Trans></Form.Text>
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
											<Trans>상품명 :</Trans>
										</li>
										<li className="list-inline-item me-1">
											<Form.Control type="text" className="form-control" size="sm" name="searchKeyword" onChange={this.onChange} value={this.state.searchKeyword}
													style={{"minHeight": "1rem"}} placeholder="검색어를 입력하세요">
											</Form.Control>
										</li>
										<li className="list-inline-item me-1">
											<button type="button" className="btn btn-sm btn-success" onClick={this.onSearch} >
												<Trans>검색</Trans>
											</button>
										</li>
										<li className="list-inline-item me-1">
											<button	type="button" className="btn btn-sm btn-dark" onClick={this.onResetGrid}>
												<Trans>목록</Trans>
											</button>
										</li>
										<li className="list-inline-item me-1">
											<button	type="button" className="btn btn-sm btn-info " onClick={this.exportDefaultExcel}>
												<Trans>엑셀</Trans>
											</button>
										</li>
										<li className="list-inline-item me-1">
                                            <Link className="btn btn-sm btn-danger" to="/inventory/btob_order/new">발주하기</Link>
										</li>
									</ul>
								</div>
                                <div>
                                    <Grid columns={B2BColumns}  ref={this.gridRef} onGridMounted={(e)=>this.onGridMounted(e)} scrollX={true} bodyHeight={500} rowHeaders={["rowNum"]}></Grid>
                                </div>
                                <div className="ms-5">
                                    <Pagination totalItemsCount={pageInfo.totalCount} onChange={this.onChangePage} activePage={this.state.activePage} itemsCountPerPage={this.state.perPage} pageRangeDisplayed={10}></Pagination>
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
		)
	}
}
export default withTranslation()(withRouter(BtoBOrder));