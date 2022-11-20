/**
 * This application was developed by Haneri.jeong  of ITS Community at 2022 years.
 */
 import React, { Component } from 'react';
 import { Trans, withTranslation } from 'react-i18next';
 import Grid from "@toast-ui/react-grid";
 import { Form} from 'react-bootstrap';
 import SelectYnInGrid from '../utils/selectYnInGrid';
 import axios from 'axios';
 import LinkInGrid from '../utils/linkInGrid';
 import { useNavigate } from 'react-router-dom';
 import api from '../../CustomAxios';
 import Pagination from 'react-js-pagination';
 import ExcelJS from 'exceljs';
 import TuiGrid from 'tui-grid';
 /**
  * 설명 : 재고량 관리
  *
  * @author		: 윤홍주
  * @since 		: 2022.04.15
  * @reference   : 참조 - 
  */
 function withRouter (Component){
     function ComponentWithRouterProp(props){
         let navigate = useNavigate();
         return (
             <Component {...props} router={{navigate}}/>
         );
     }
     return ComponentWithRouterProp
 }
 
 class Inventory extends Component {
     constructor(props){
         super(props);
         this.state = {
             gridData : [],
             pageInfo : {
                 totalPage : 0,
                 totalCount : 0
             },
             activePage : 1,
             perPage : 20,
             pageNumber : "",
             searchKeyword : "",
 
             _USER_ID: sessionStorage.getItem('_USER_ID'),
         }
     }
 
    gridRef = React.createRef();

    componentDidMount = async() =>{
        TuiGrid.applyTheme("striped");
    }
 
    formattedData = (data) =>{
        for(let i in data){
            if(data[i].optionNo !== undefined){
                data[i].totalQtyReal = data[i].optionStockQtyReal;
                data[i].totalQtyShow = data[i].optionStockQtyShow;
                data[i].priceTotal = Number(data[i].priceRetail) + Number(!!data[i].addPrice ? data[i].addPrice : 0);
            }else {
                data[i].totalQtyReal = data[i].stockQtyReal;
                data[i].totalQtyShow = data[i].stockQtyShow;
            }
        }

        return data;
    }
 
    onGridMounted = (e) => {
        const params = {};
        params.rowStart = 0;
        params.perPage = this.state.perPage;
        axios.all([
            api.get(process.env.REACT_APP_DB_HOST+"/inventory/getInventories",{params : params})
            , api.get(process.env.REACT_APP_DB_HOST+"/inventory/inventoryRowCount",{params : params})
        ]).then(
            axios.spread((res1,res2)=>{
                const data = this.formattedData(res1.data);
                this.setState({
                    gridData : data,
                    pageInfo : res2.data,
                });
                e.instance.resetData(data);

            })
        )
    }
    onGridUpdated = (e) => {
        const gridInfo =e.instance;
        gridInfo.getData().forEach(row=>{
            if(row.currentStock < 3 || row.currentStock === null || row.currentStock === undefined){
                gridInfo.addCellClassName(row.rowKey,"currentStock","fs-6 bg-opacity-25 bg-danger ");
            }else if(3<=row.currentStock && row.currentStock<=5){
                gridInfo.addCellClassName(row.rowKey,"currentStock","fs-6 bg-opacity-25 bg-warning");
            }else{
                gridInfo.addCellClassName(row.rowKey,"currentStock","fs-6 bg-opacity-25 bg-info");
            }
        })
    }
    onChange = (e) => {
        this.setState({
            [e.target.name] : e.target.value
        });
    }
 
    updateProduct = (data) =>{
        api.put(process.env.REACT_APP_DB_HOST+"/inventory/updProduct",data).then(res=>{
            if(res.status === 200){
                
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
 
    updateProductYn = (data) => {
        api.put(process.env.REACT_APP_DB_HOST+"/inventory/updProductYn ",data).then(res=>{
            if(res.status === 200){
                
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
 
    onEditingFinish = (e) => {
        const chekNumber = /\d/;
        const gridData = this.state.gridData;
        const {rowKey,value,columnName} = e;
        const params = {};
        if(chekNumber.test(Number(e.value))){
            const optionNo = e.instance.getRow(rowKey).optionNo;
            const rowData = e.instance.getRow(rowKey);
            
            if(optionNo === null || optionNo === ""){
                //옵션상품 없을때
                rowData.stockQtyReal = !!rowData.totalQtyReal ? rowData.totalQtyReal : 0;
                rowData.stockQtyShow = !!rowData.totalQtyShow ? rowData.totalQtyShow : 0;
            } else {
                // 옵션 재고
                rowData.optionStockQtyReal = !!rowData.totalQtyReal ? rowData.totalQtyReal : 0;
                rowData.optionStockQtyShow = !!rowData.totalQtyShow ? rowData.totalQtyShow : 0;
            }

            params.productNo = e.instance.getRow(rowKey).productNo;
            params.optionNo = e.instance.getRow(rowKey).optionNo;
            params.product = JSON.stringify(rowData);
            if(columnName === "totalQtyReal"){
                if(Number(gridData[rowKey].stockQtyReal) !== Number(value)){
                    this.updateProduct(params);
                }
            }else if(columnName === "totalQtyShow"){
                if(Number(gridData[rowKey].stockQtyShow) !== Number(value)){
                    this.updateProduct(params);
                }
            }
        
        }
    }
 
    onSearch = (e) => {
        const params = {};
        params.searchKeyword = this.state.searchKeyword;
        params.pageNumber = 1;
        params.rowStart = 0;
        params.perPage = Number(this.state.perPage);
        this.onGridUpdatePages(params); 
    }
 
    exportDefaultExcel = (e) =>{
        const date = new Date();
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1));
        const day = ('0' + date.getDate())
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const dateStr = [year, month, day,hours,minutes].join('');
        const titleName = "Inventory_List_"+dateStr;

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
        api.get(process.env.REACT_APP_DB_HOST+"/inventory/excelInventories",{params : params}).then(res=>{
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
 
 
 
    onGridUpdatePages = (params) => {
        axios.all([
            api.get(process.env.REACT_APP_DB_HOST+"/inventory/getInventories",{params : params})
            , api.get(process.env.REACT_APP_DB_HOST+"/inventory/inventoryRowCount",{params : params})
        ]).then(
            axios.spread((res1,res2)=>{
                const data =  this.formattedData(res1.data);
                this.setState({
                    gridData : data,
                    pageInfo : res2.data,
                    activePage : Number(params.pageNumber),
                })
                this.gridRef.current.getInstance().resetData(data);

            })
        )
    }
 
    onResetGrid = (e) =>{
        this.setState({
            searchKeyword : "",
            activePage : 1,
            perPage : 20,
            pageNumber : "",
        });
        const params = {};
        params.searchKeyword = "";
        params.pageNumber = 1;
        params.rowStart = 0;
        params.perPage =20;
        this.onGridUpdatePages(params);
    }

    onChangePerPage = (perPage,e) =>{
        this.setState({
            perPage : Number(perPage),
            pageNumber : 1,
        })
        const params = {};
        params.searchKeyword = this.state.searchKeyword;
        params.pageNumber = 1;
        params.rowStart = 0;
        params.perPage = Number(perPage);
        this.onGridUpdatePages(params);
    }
 
    onChangePage = (pageNumber) => {
        this.setState({
            pageNumber : pageNumber
        })
        const params = {};
        params.searchKeyword = this.state.searchKeyword;
        params.pageNumber = pageNumber;
        params.rowStart  = (Number(pageNumber-1)*Number(this.state.perPage));
        params.perPage = Number(this.state.perPage);
        this.onGridUpdatePages(params);

    }
 
    render () {
        const {pageInfo} = this.state;

        const onChangeSelectYn = (e,grid,rowKey,columnName)=>{
            if(grid.getValue(rowKey, columnName) !== e.target.value){
                const params = {};
                const rowData = grid.getRow(rowKey);
    
                rowData.soldOutYn = e.target.value;
                rowData.updateUser = this.state._USER_ID;
                
                params.product=JSON.stringify(rowData);
                this.updateProductYn(params);
            }
        }
        const onClickedAtag = (e,rowKey) =>{
            e.preventDefault();
            const productNo = this.gridRef.current.getInstance().getValue(rowKey,"productNo");
            this.props.router.navigate("/product/"+productNo+"/edit");
        }

        const inventoryColumns = [
            {name : "productNo", header : "상품번호",width: 80,hidden:true},
            {name : "storeName", header : "거래처",align: "center",width: 100,  sortable : true, filter : "select",formatter: ({ value }) => { return value === null  ? "" : value; }},
            {name : "categoryNameAll", header : "카테고리",align: "center", sortable : true, filter : "select",width : 200,formatter: ({ value }) => { return value === null ? "" : value; }},
            {name : "brandName", header : "브랜드",align: "center", sortable : true, filter : 'select',formatter: ({ value }) => { return value === null  ? "" : value; }},
            {
                name : "productName",
                header : "상품명", 
                sortable : true, 
                align: "center",
                width: 250,
                resizable: true,
                formatter: ({ value }) => {
                    return value === null  ? "" : value; 
                },
                filter: {
                    type: 'text',
                    operator: 'OR'
                },
                renderer : {
                    type : LinkInGrid,
                    options : {
                        onClickedAtag
                    }
                }

            },
            { name: "optionNo",header : "옵션번호", width: 200, hidden : true,align: "center"},
            { name: "optionName",header : "옵션명", width: 200, align: "center",formatter: ({ value }) => { return value === null  ? "" : value; },resizable: true},
            {name : "warehouseName", header : "물류창고",align: "center", sortable : true, filter : "select"},
            {name : "currentStock", header : "현재재고량",align: "center", sortable : true, filter : 'number'},
            {name : "totalQtyReal", header : "초기재고량",align: "center", sortable : true, filter : "number",editor: 'text',validation: { dataType: 'number', required : true},formatter: ({ value }) => { return value === null || value === undefined ? 0 : value; }},
            {name : "totalQtyShow", header : "표시재고량",align: "center", sortable : true, filter : "number",editor: 'text',validation: { dataType: 'number', required : true},formatter: ({ value }) => { return value === null || value === undefined ? 0 : value; }},
            {name : "optionStockQtyReal",hidden:true, header : "옵션초기재고량",align: "center", sortable : true, filter : "number",editor: 'text'},
            {name : "optionStockQtyShow",hidden:true, header : "옵션재고량",align: "center", sortable : true, filter : "number",editor: 'text'},
            {name : "stockQtyReal",hidden:true, header : "초기재고량",align: "center", sortable : true, filter : "number",editor: 'text'},
            {name : "stockQtyShow",hidden:true, header : "재고량",align: "center", sortable : true, filter : "number",editor: 'text'},
            {
                name : "soldOutYn",  
                header : "품절여부", 
                sortable : true, 
                filter : "select",
                align: "center",
                editor:{
                    type:SelectYnInGrid, 
                    options:{
                        onChangeSelectYn, 
                        columnName:"soldOutYn"
                    }
                },
            },
        ]

        
        return (
            <div>
                <div className="page-header">
                    <h3 className="page-title">
                    Inventory List
                    </h3>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">Inventory</li>
                            <li className="breadcrumb-item active" aria-current="page"><Trans>Inventory</Trans></li>
                        </ol>
                    </nav>
                </div>
                <div className="row">
                    <div className="col-12 grid-margin">
                        <div className="card">
                            <div className="card-body">
                                <div>
                                    <ul className=" list-inline mb-1 text-end my-3 mb-3">
                                        <li className="list-inline-item me-1">
                                            <Trans>상품명 :</Trans>
                                        </li>
                                        <li className="list-inline-item me-1">
                                            <Form.Control type="text" className="form-control" size="sm" name="searchKeyword" value={this.state.searchKeyword} onChange={(e)=>this.onChange(e)}
                                                    style={{"minHeight": "1rem"}} placeholder="검색어를 입력하세요">
                                            </Form.Control>
                                        </li>
                                        <li className="list-inline-item me-1">
                                            <button type="button" className="btn btn-sm btn-success" onClick={(e)=>this.onSearch(e)} >
                                                <Trans>검색</Trans>
                                            </button>
                                        </li>
                                        <li className="list-inline-item me-1">
                                            <button	type="button" className="btn btn-sm btn-dark" onClick={(e)=>this.onResetGrid(e)}>
                                                <Trans>목록</Trans>
                                            </button>
                                        </li>
                                        <li className="list-inline-item me-1">
                                            <button	type="button" className="btn btn-sm btn-info " onClick={this.exportDefaultExcel}>
                                                <Trans>엑셀</Trans>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <Grid columns={inventoryColumns} onGridMounted={(e)=>this.onGridMounted(e)} onGridUpdated={(e)=>this.onGridUpdated(e)} rowHeaders={["rowNum"]} scrollY={false} scrollX={false}
                                            onEditingFinish={(e)=>this.onEditingFinish(e)} ref={this.gridRef} editingEvent='click'>
                                    </Grid>
                                </div>
                                <div className="ms-5">
                                    <Pagination totalItemsCount={pageInfo.totalCount} onChange={this.onChangePage} activePage={this.state.activePage} itemsCountPerPage={this.state.perPage} pageRangeDisplayed={20}></Pagination>
                                    <ul className=" list-inline mb-1 text-end my-3 mb-3">
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
                                        <li className="list-inline-item me-1">
                                            <button	type="button" className="btn btn-sm btn-warning " onClick={(e)=>this.onChangePerPage("200",e)}>
                                                <Trans>200</Trans>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
 
 export default  withTranslation()(withRouter(Inventory));