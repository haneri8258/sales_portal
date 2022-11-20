/**
 * This application was developed by Haneri.jeong  of ITS Community at 2022 years.
 */
import React, { Component } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import Grid from "@toast-ui/react-grid";
import { Dropdown, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import SelectSearch, {fuzzySearch} from 'react-select-search';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ImageInGrid from '../utils/imageInGrid';
import ButtonInGrid from '../utils/buttonInGrid';
import { alert } from "react-bootstrap-confirmation";
import api from '../../CustomAxios';
import Pagination from 'react-js-pagination';
import TuiGrid from 'tui-grid';
import LinkInGrid from '../utils/linkInGrid';

/**
 * 설명 : 발주관리 - 등록
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
class BtoBOrderRegist extends Component{
	constructor(props){
		super(props);
		this.state = {
            isOpenModal : false,

            imageData : [],
            categoryOption : [],
            storeList : [],
            payMethodList : [],
            pageInfo : {
                totalPage : 0,
                totalCount : 0
            },
            activePage : 1,
            pageNumber : "",
            perPage : 50,
            orderProductImg :  {},
            categoryNo : "",
            storeNo  : "",
            storeName : "",
            b2bordererName : "",
            productPrice : "",
            productTotalQty : "",
            b2borderAmount : "",
            paymentCode : "",
			b2borderMemo : "",
			
			_USER_ID: sessionStorage.getItem('_USER_ID'),
			_USER_NAME: sessionStorage.getItem('_USER_NAME'),
			_STORE_NO: sessionStorage.getItem('_STORE_NO'),
			_STORE_NAME: sessionStorage.getItem('_STORE_NAME'),
			_GROUP_ID: sessionStorage.getItem('_GROUP_ID'),
		}
	}
    modalProductGridRef = React.createRef();
    gridRef = React.createRef();

	componentDidMount() {
        TuiGrid.applyTheme("striped");
        const params = {};
        params.searchCondition = "";
        params.searchKeyword = "";
        params.searchUseYn = "";

        const data = {};
        data.code = "";

        const obj = {};
        obj.rowStart = 0;
        obj.perPage = this.state.perPage

		axios
			.all([
				api.post(process.env.REACT_APP_DB_HOST + "/common/getStores", params)
                , api.get(process.env.REACT_APP_DB_HOST+"/product/getCategories")
                , api.post(process.env.REACT_APP_DB_HOST +"/common/getCodePaymethod",data)
			])
			.then(
				axios.spread((res1,res2,res3)=>{
					const categoryOptions = [];
					for(let i in res2.data){
						categoryOptions.push({name: res2.data[i].categoryNameAll, value: res2.data[i].categoryNo});
					}
                    const storeList = [];
                    for(let i in res1.data){
                        storeList.push({name: res1.data[i].storeName, value: res1.data[i].storeNo});
                    }
					this.setState({
						storeList : storeList,
						categoryOption : categoryOptions,
                        payMethodList : res3.data,
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

    onChange = (e) => {
        this.setState({
            [e.target.name] : e.target.value
        })
    }
    openModal = (e) => {
        if(this.state.storeNo === ""){
            alert("상점을 검색해 선택해 주세요",{okButtonStyle : "info"});
            return;
        }
        this.setState({
            isOpenModal: true,
        });
    }
    closeModal = (e) => {
        this.setState({
            isOpenModal: false,
        });
    }
	onGridProduct = (e) =>{
        const params ={};
        params.storeNo = this.state.storeNo;
        params.perPage = this.state.perPage;
        params.rowStart = 0;
        axios.all([
            api.get(process.env.REACT_APP_DB_HOST+"/inventory/getInventories",{params : params})
            , api.get(process.env.REACT_APP_DB_HOST+"/inventory/inventoryRowCount",{params : params})
        ]).then(
            axios.spread((res1,res2)=>{
                let imageData = [];
                const data = res1.data;
                for(let i in data){
                    if(data[i].optionNo !== undefined){
                        data[i].stockQtyShow = !!data[i].optionStockQtyShow ? data[i].optionStockQtyShow : 0;
                        data[i].stockQtyReal = !!data[i].optionStockQtyReal ? data[i].optionStockQtyReal : 0;
                        data[i].price = Number(!!data[i].price ? data[i].price : 0) + Number(!!data[i].addPrice ? data[i].addPrice : 0);
                    }
                    if(data[i].thumbnail){
                        const thumbnail = {
                            seq : i,
                            imageSrc : data[i].thumbnail,
                        }
                        imageData.push(thumbnail);
                    }
                }
                this.setState({
                    imageData : imageData,
                    products : res1.data,
                    pageInfo  : res2.data
                });
                e.instance.resetData(data);

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

    onGridUpdatePages = (params) => {
        axios.all([
            api.get(process.env.REACT_APP_DB_HOST+"/inventory/getInventories",{params : params})
            , api.get(process.env.REACT_APP_DB_HOST+"/inventory/inventoryRowCount",{params : params})
        ]).then(
            axios.spread((res1,res2)=>{
                const data =  res1.data;
                let imageData = [];
                for(let i in data){
                    if(data[i].optionNo !== undefined){
                        data[i].stockQtyShow = !!data[i].optionStockQtyShow ? data[i].optionStockQtyShow : 0;
                        data[i].stockQtyReal = !!data[i].optionStockQtyReal ? data[i].optionStockQtyReal : 0;
                        data[i].price = Number(data[i].price) + Number(!!data[i].addPrice ? data[i].addPrice : 0);
                    }

                    if(data[i].thumbnail){
                        const thumbnail = {
                            seq : i,
                            imageSrc : data[i].thumbnail,
                        }
                        imageData.push(thumbnail);
                    }
                }
                this.setState({
                    gridData : data,
                    pageInfo : res2.data,
                    imageData : imageData
                })
                this.modalProductGridRef.current.getInstance().resetData(data);

            })
        )
    }
    onChangePage = (pageNumber)=>{
        this.setState({
            pageNumber : pageNumber,
            activePage : pageNumber,
        })
        const params = {};
        params.searchKeyword = this.state.searchKeyword;
        params.pageNumber = pageNumber;
        params.rowStart  = (Number(pageNumber-1)*Number(this.state.perPage));
        params.perPage = Number(this.state.perPage);
        params.storeNo = this.state.storeNo;
        this.onGridUpdatePages(params);

    }

	onGridUpdated = (e) =>{
		const gridInfo =e.instance;
		gridInfo.getData().forEach(row=>{
			if(row.stockQtyShow < 3 || row.stockQtyShow === null){
				gridInfo.addCellClassName(row.rowKey,"stockQtyShow","fs-6 bg-opacity-25 bg-danger ");
			}else if(3<=row.stockQtyShow && row.stockQtyShow<=5){
				gridInfo.addCellClassName(row.rowKey,"stockQtyShow","fs-6 bg-opacity-25 bg-warning");
			}else{
				gridInfo.addCellClassName(row.rowKey,"stockQtyShow","fs-6 bg-opacity-25 bg-info");
			}
		})
	}

    appendRow = (grid,rowkey) => {
        const orderGrid = this.gridRef.current.getInstance();
        const row = grid.getRow(rowkey);
        this.setState({
            isOpenModal : false,
        })
        orderGrid.appendRow(row);
    }
    removeGridRow = (grid, rowKey) =>{
        const row = grid.getRow(rowKey);
        const gridInfo = this.gridRef.current.getInstance();
        gridInfo.removeRow(row);
    }
    onSubmit = (e) => {
		if(this.gridRef.current.getInstance().getData().length === 0){
			alert("상품을 담아 주세요",{okButtonStyle : "info"});
			return;
		}
        this.sendData(e);


    }
    sendData = () =>{
        const rowData = this.gridRef.current.getInstance().getData();
        const products = [];
        for(let i in rowData){
            const b2borderObj = new Object();
            b2borderObj.productNo = rowData[i].productNo
            b2borderObj.optionNo = rowData[i].optionNo
            b2borderObj.b2bordererName = !!this.state.b2bordererName ? this.state.b2bordererName : null ;
            b2borderObj.productPrice = !!this.state.productPrice ? this.state.productPrice : null;
            b2borderObj.productTotalQty = !!this.state.productTotalQty ? this.state.productTotalQty : null;
            b2borderObj.b2borderAmount = !!this.state.b2borderAmount ? this.state.b2borderAmount : null;
            b2borderObj.b2borderMemo = !!this.state.b2borderMemo ? this.state.b2borderMemo : null;
            b2borderObj.paymentCode = !!this.state.paymentCode ? this.state.paymentCode : null;
            b2borderObj.b2borderFinishYn = 'N';
            b2borderObj.b2borderStatus = "B2B01";
            b2borderObj.insertUser = this.state._USER_ID;
            products.push(b2borderObj);
        }
        const params = {};
        params.b2border = products;
        api.post(process.env.REACT_APP_DB_HOST+"/inventory/btoborder/new",params).then(res=>{
            if(res.status === 200){
                alert("발주성공",{okButtonStyle : "info"});
                this.props.router.navigate("/inventory/btob_order", {replace: true});

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
    goB2BOrderList = (e) => {
        this.props.router.navigate("/inventory/btob_order");

    }
    changeSelect = (value, type) => {
		this.setState({
			[type] : value,
		})
	}
    searchProduct = (e) => {		
		const params={};

        params.searchType = this.state.searchType;
        params.searchKeyword = this.state.searchKeyword;
        params.categoryNo = this.state.categoryNo;
        params.storeNo = this.state.storeNo;
        params.pageNumber = 1;
        params.rowStart = 0;
        params.perPage=Number(this.state.perPage);
        this.onGridUpdatePages(params);
	}
    resetProduct = (e) =>{
        this.setState({
			searchKeyword : "",
            categoryNo : ""
		});

        const params = {};
        params.searchKeyword = "";
        params.pageNumber = 1;
        params.rowStart = 0;
        params.perPage =50;
        this.onGridUpdatePages(params);

    }


	render(){
		const {imageData,payMethodList,pageInfo} = this.state;

		const onButtonClicked = (grid, rowKey, buttonType) =>{
			if(buttonType === "삭제"){
				this.removeGridRow(grid, rowKey);
			}

			if(buttonType ==="선택"){
				this.appendRow(grid, rowKey);
			}
		}

        const onClickedAtag = (e,rowKey) =>{
			e.preventDefault();
			const productNo = this.modalProductGridRef.current.getInstance().getValue(rowKey,"productNo");
			this.props.router.navigate("/product/"+productNo+"/edit");
		}

		const orderColumns = [
			{ 
                name: "productImageName",
                header: "Image",
                width: "10",
                align: "center",
				renderer: {
					type: ImageInGrid,
					options: {
						data: imageData,
					}
				}
                
            },
			{ name: "categoryNameAll", header: "Category", width: "10", align: "center" },
			{ name: "productName", header: "Title", width: "10", align: "center" },
            { name: "optionNo",header : "옵션번호", width: 200, hidden : true,align: "center"},
            { name: "optionName",header : "Option Name", width: 200, align: "center"},
			{ name: "brandName", header: "Brand", width: "10", align: "center" },
			{ name: "makerName", header: "Maker", width: "10", align: "center" },
			{
				name: "delete",
				header: "delete",
				width: "5",
				align: "center",
				renderer: {
					type: ButtonInGrid,
					options: { 
						onButtonClicked,
						buttonType : "삭제",
						buttonCss : "btn btn-sm btn-danger" 
					},
				},
			},
		];


		const productColumns = [
			{ name: "storeName", header: "거래처명", width: 80,align: "center" },
			{ 
				name: "image",
				header: "이미지",
				width: 100,
				align: "center",
				renderer: {
					type: ImageInGrid,
					options: {
						data: imageData,
					}
				}
			},
			{name: 'productNo', header: "상품 번호",width: 100, hidden: true,align: "center"},
			{ name: "categoryNameAll", header: "카테고리", width: 300,align: "center"},
			{ 
                name: "productName",
                header: "상품명",
                width: 300,
                align: "center",
                renderer : {
					type : LinkInGrid,
					options : {
						onClickedAtag
					}
				},

            },
			{ name: "brandName", header: "브랜드", width: 150, filter : 'select',align: "center" },
			{ name: "makerName", header: "제조사", width: 150, filter : 'select' ,align: "center"},
            { name: "optionNo",header : "옵션번호", width: 200, hidden : true,align: "center"},
            { name: "optionName",header : "옵션명", width: 200, align: "center"},
			{
				name: 'price', 
				header: '판매가', 
				sortable: true, 
				width: 120,
				align: "right", 
				formatter({value}){
					const currency = Number(value).toLocaleString(); 
					return value = 0 ? 0 :`${currency}원`; 
				},
			},
			{
				name: "stockQtyShow",
				header: "총재고",
				width: 120,
				filter: 'number',
				align: "center",
				validation: {
					min: 1,
				},
                formatter: ({ value }) => {
                    return value === null ? 0 : value
                },

			},
			{
				name: "click",
				header: "click",
				align: "center",
                width: 100,
				renderer: {
					type: ButtonInGrid,
					options: { 
						onButtonClicked,
						buttonType : "선택",
						buttonCss : "btn btn-sm btn-info btn-lg"
					},
				}
			},
		];

		return(
			<div>
				<div className="page-header">
					<h3 className="page-title">
						B2B Order Regist
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
                                <Form.Group>
                                    <Form.Label className="col-sm-3 col-form-label">
                                        <Trans>상점검색</Trans><span className="text-danger fs-5">&nbsp;*</span>
                                    </Form.Label>
                                    <div className="col-4 grid-margin" style={{"zIndex" : 999,"position" : "relative"}}>
                                        <SelectSearch name="categoryNo" options={this.state.storeList} value={this.state.storeNo} filterOptions={fuzzySearch} 
                                                            onChange={(e) => this.changeSelect(e, "storeNo")} emptyMessage="Not found" placeholder="::상점검색::" search/>
                                    </div>
                                </Form.Group>				
							<Form.Text className="text-muted">
								<Trans>*입력하신 키워드가 포함된 상점을 검색하여 보여지게 됩니다</Trans>
							</Form.Text>
							{/* Product 시작 */}
							<div>
								<h4 className="card-title my-3">Product<span className="text-danger fs-5">&nbsp;*</span></h4>
								<div>
                                    <Grid columns={orderColumns} bodyHeight={100} ref={this.gridRef} scrollX={false} minBodyHeight="200" ></Grid>
								</div>
								<div className="text-lg-end mt-2">
									<button type="button" className="btn btn-lg btn-success " onClick={this.openModal}>
										<Trans>주문할 상품검색</Trans>
									</button>
								</div>

							</div>
							{/* Product 끝 */}
							</div>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-12 grid-margin">
						<div className="card">
							<div className="card-body">
								<Form className="forms-sample">
									<Form.Group  className="row border-bottom m-0">
										<Form.Label className="col-sm-3 col-form-label-sm mb-0 bg-light text-end">
											<Trans>발주자 성명</Trans>
										</Form.Label>
										<div className="col-5 grid-margin">
											<Form.Control type="text" name="b2bordererName" className="form-control-sm mt-2"
												size="sm"  onChange={this.onChange}>
											</Form.Control>
										</div>
									</Form.Group>
									<Form.Group  className="row border-bottom m-0">
										<Form.Label className="col-sm-3 col-form-label-sm mb-0 bg-light text-end">
											<Trans>상품 단가</Trans>
										</Form.Label>
										<div className="col-5 grid-margin">
											<Form.Control type="number" name="productPrice" className="form-control-sm mt-2"
												size="sm"  onChange={this.onChange}>
											</Form.Control>
										</div>
									</Form.Group>
									<Form.Group  className="row border-bottom m-0">
										<Form.Label className="col-sm-3 col-form-label-sm mb-0 bg-light text-end">
											<Trans>상품총개수</Trans>
										</Form.Label>
										<div className="col-5 grid-margin">
											<Form.Control type="number" name="productTotalQty" className="form-control-sm mt-2"
												size="sm"  onChange={this.onChange}>
											</Form.Control>
										</div>
									</Form.Group>
									<Form.Group  className="row border-bottom m-0">
										<Form.Label className="col-sm-3 col-form-label-sm mb-0 bg-light text-end">
											<Trans>발주총금액</Trans>
										</Form.Label>
										<div className="col-5 grid-margin">
											<Form.Control type="number" name="b2borderAmount" className="form-control-sm mt-2"
												size="sm"  onChange={this.onChange}>
											</Form.Control>
										</div>
									</Form.Group>
									<Form.Group  className="row border-bottom m-0">
										<Form.Label className="col-sm-3 col-form-label-sm mb-0 bg-light text-end">
											<Trans>결제방법</Trans>
										</Form.Label>
										<div className="col-5 grid-margin">
                                            <Form.Select name="paymentCode" className="form-select-sm mt-2" value = {this.state.paymentCode} onChange={this.onChange}>
                                                <option value="">::결제방법::</option>
                                                {payMethodList.map((option)=>{
                                                    return <option key={option.code} value={option.code}>{option.codeNm}</option>
                                                })}
                                            </Form.Select>
										</div>
									</Form.Group>
                                    <Form.Group  className="row border-bottom m-0">
										<Form.Label className="col-sm-3 col-form-label-sm mb-0 bg-light text-end">
											<Trans>메모</Trans>
										</Form.Label>
										<div className="col-5 grid-margin">
											<Form.Control type="text" name="b2borderMemo" className="form-control-sm mt-2"
												size="sm"  onChange={this.onChange}>
											</Form.Control>
										</div>
									</Form.Group>
									<div className="text-end mt-3">
                                        <ul className="grid-margin text-end">
                                            <li className="list-inline-item ">
                                                <button type="button" className="btn btn-sm btn-success text-center" onClick={(e)=>this.onSubmit(e)} >
                                                    <Trans>발주하기</Trans>
                                                </button>
                                            </li>
                                            <li className="list-inline-item ">
                                                <button type="button" className="btn btn-sm btn-dark text-center"onClick={this.goB2BOrderList}  >
                                                    <Trans>목록</Trans>
                                                </button>
                                            </li>
                                        </ul>
									</div>
								</Form>
							</div>
						</div>
					</div>
				</div>
				<Modal show={this.state.isOpenModal} onHide={this.closeModal} size="lg" aria-labelledby="contained-modal-title-vcenter"centered scrollable>
					<Modal.Header closeButton>
						<Modal.Title><Trans>상품선택</Trans></Modal.Title>
					</Modal.Header>
					<Modal.Body style={{"minHeight":"45rem"}}>
						<div className="">
							<ul className="list-inline mb-1 col-12 text-end">
								<li className="list-inline-item me-1 col-4">					
										<SelectSearch name="categoryNo" options={this.state.categoryOption} value={this.state.categoryNo} filterOptions={fuzzySearch} 
														onChange={(e) => this.changeSelect(e, "categoryNo")} emptyMessage="Not found" placeholder="::카테고리 선택::" search/>
								</li>
								<li className="list-inline-item me-1">
                                    <Trans>상품명 :</Trans>
								</li>
								<li className="list-inline-item me-1">
									<Form.Control type="text" className="form-control " size="sm" name="searchKeyword" onChange={this.onChange}
													style={{ minHeight: "1rem" }} placeholder="검색어를 입력하세요">
									</Form.Control>
								</li>
								<li className="list-inline-item me-1">
                                    <button className="btn btn-sm btn-success" onClick={this.searchProduct}>
                                        <Trans>검색</Trans>
                                    </button>
								</li>
                                <li className="list-inline-item me-1">
                                    <button className="btn btn-sm btn-dark" onClick={this.resetProduct}>
                                        <Trans>목록</Trans>
                                    </button>
                                </li>
							</ul>
							<div>
								<Grid columns={productColumns} ref={this.modalProductGridRef} onGridMounted={(e)=>this.onGridProduct(e)} onGridUpdated={(e)=>this.onGridUpdated(e)}
								      rowHeight={50} bodyHeight={300} scrollY={true} scrollX={false} minBodyHeight="500" rowHeaders={["rowNum"]}     >
                                </Grid>
                                <Pagination totalItemsCount={pageInfo.totalCount} onChange={this.onChangePage} activePage={this.state.activePage} itemsCountPerPage={this.state.perPage} pageRangeDisplayed={10}></Pagination>

							</div>
						</div>
					</Modal.Body>
				</Modal>
			</div>
		)
	}
}
export default withTranslation()(withRouter(BtoBOrderRegist));