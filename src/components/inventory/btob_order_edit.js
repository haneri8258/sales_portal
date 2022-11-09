/**
 * This application was developed by YS.Im, HJ.Yoon and GH.Zhang of GIE&S(www.giens.co.kr) at 2022 years.
 */
import React, { Component } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import Grid from "@toast-ui/react-grid";
import { Form} from 'react-bootstrap';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ImageInGrid from '../utils/imageInGrid';
import LinkInGrid from '../utils/linkInGrid';
import { alert } from "react-bootstrap-confirmation";
import api from '../../CustomAxios';
import TuiGrid from 'tui-grid';

/**
 * 설명 : 발주관리 - 변경
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
class BtoBOrderEdit extends Component{
	constructor(props){
		super(props);
		this.state = {
            product : {},
            imageData : {},
            storeList : [],
            warehouseList : [],
            payMethodList : [],
            b2borderStatusList : [],
            gridData : [],
            b2border : [],
            b2borderStatus : "",
			_USER_ID: sessionStorage.getItem('_USER_ID'),
		}
	}
    gridRef = React.createRef();
    
	componentDidMount() {
        TuiGrid.applyTheme("striped");
        const params = {};
        const b2borderNo = this.props.router.params.b2borderNo;
        const b2borderStatus = this.props.router.location.state.b2borderStatus;
        params.searchCondition = '';
        params.searchKeyword = '';
        params.searchUseAt = '';
        params.code = '';

        axios
            .all([
                 api.post(process.env.REACT_APP_DB_HOST + "/common/getStores", params)
                , api.post(process.env.REACT_APP_DB_HOST + "/inventory/getWarehouses", params)
                , api.post(process.env.REACT_APP_DB_HOST +"/common/getCodePaymethod",params)
                , api.post(process.env.REACT_APP_DB_HOST +"/common/getCodeB2border",params)
                , api.get(process.env.REACT_APP_DB_HOST +"/inventory/b2borderInfo",{params : {"b2borderNo" : b2borderNo, "b2borderStatus" : b2borderStatus}})

            ]).then(
                axios.spread((res1,res2,res3,res4,res5)=>{
                    this.setState({
                        storeList: res1.data,
                        warehouseList : res2.data,
                        payMethodList : res3.data,
                        b2borderStatusList : res4.data,
                        b2border : res5.data,
                        b2borderStatus : res5.data[0].b2borderStatus,
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
    onGridMounted = (e) => {
        const b2borderNo = this.props.router.params.b2borderNo;
        const b2borderStatus = this.props.router.location.state.b2borderStatus;
        api.get(process.env.REACT_APP_DB_HOST+"/inventory/btoborder",{params : {"b2borderNo" : b2borderNo, "b2borderStatus" : b2borderStatus}}).then(res=>{
            if(res.status === 200){
				let imageData = [];
				const data = res.data;
				for(let i in data){
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
                    gridData : data,
                    product : data[0],
                });
                e.instance.resetData(data);
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
    onChange = (e) => {
        this.setState(prevState =>({
            product : {
                ...prevState.product,
                [e.target.name]: e.target.value
            }
        }))

    }

    updateData = (e) => {
        const b2border = this.state.product;
        b2border.updateUser = sessionStorage.getItem("_USER_ID");
        api.put(process.env.REACT_APP_DB_HOST+"/inventory/btoborder",b2border).then(res=>{
            if(res.status === 200){
                alert("수정되었습니다",{okButtonStyle : "info"});
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
    onChangeStatus = (e) => {
        const b2borderStatus = this.state.product.b2borderStatus;
        if(b2borderStatus === "B2B11"){
            const data = this.state.product;
            const qty = [];
            if(!!data.optionNo){
                //not null
                qty.productNo = data.productNo;
                qty.optionNo = data.optionNo;
                qty.stockQtyReal = !!data.optionStockQtyReal ? Number(data.optionStockQtyReal) + Number(data.productTotalQty) : 0+Number(data.productTotalQty);
            } else {
                qty.productNo = data.productNo;
                qty.productTotalQty = !!data.productTotalQty ? Number(data.productTotalQty) + Number(data.productTotalQty) : 0+Number(data.productTotalQty);
            }
            qty.productTotalQty = data.productTotalQty;
            qty.updateUser = sessionStorage.getItem("_USER_ID");

            const gridData = this.state.gridData;
            for(let i in gridData){
                const data = gridData[i];
                if(!!data.optionNo){
                    qty.push({
                        optionNo : data.optionNo,
                        productNo : data.productNo,
                        stockQtyReal : !!data.optionStockQtyReal ? Number(data.optionStockQtyReal) + Number(data.productTotalQty) : 0+Number(data.productTotalQty),
                        b2borderStatus : "B2B11",
                        updateUser : sessionStorage.getItem("_USER_ID")
                    })
                } else {
                    qty.push({
                        productNo : data.productNo,
                        productTotalQty : !!data.productTotalQty ? Number(data.productTotalQty) + Number(data.productTotalQty) : 0+Number(data.productTotalQty),
                        b2borderStatus : "B2B11",
                        updateUser : sessionStorage.getItem("_USER_ID")
                    })
                }
            }

            const b2borders = this.state.b2border;
            for(let i in b2borders){
                b2borders[i].insertUser = sessionStorage.getItem("_USER_ID");
                b2borders[i].b2borderStatus = "B2B11"
            }

            const params = {};
            params.b2border = JSON.stringify(b2borders);
            params.qty = JSON.stringify(qty);

            api.post(process.env.REACT_APP_DB_HOST+"/inventory/btoborder",params).then(res=>{
                if(res.status === 200){
                    alert("발주상태를 변경하였습니다",{okButtonStyle : "info"});
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
    }
    goB2BOrderList = (e) => {
        this.props.router.navigate("/inventory/btob_order",{replace: true});

    }

	render(){
        const {imageData, payMethodList,b2borderStatusList} = this.state;

		const onClickedAtag = (e,rowKey) =>{
			e.preventDefault();
			const productNo = this.gridRef.current.getInstance().getValue(rowKey,"productNo");
			this.props.router.navigate("/product/"+productNo+"/edit");
		}

		const orderColumns = [
			{ 
                name: "productImageName", 
                header: "Image",
                width: 100, 
                align: "center",
                renderer: {
					type: ImageInGrid,
					options: {
						data: imageData
					}
				}

            },
            { name: "brandName", header: "Brand", width: 100, align: "center" },
            { name: "MakerName", header: "Manufacturer", width: 100, align: "center" },
			{ name: "categoryNameAll", header: "Category", width: 300, align: "center"},
			{ 
                name: "productName", 
                header: "Title", 
                width: "20", 
                align: "center",
                renderer : {
					type : LinkInGrid,
					options : {
						onClickedAtag
					}
				}

            },
            { name: "optionNo",header : "옵션번호", width: "10", hidden : true,align: "center"},
            { name: "optionName",header : "Option Name", width: "10", align: "center"},
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
                                <div>
                                    <h4 className="card-title my-3">Product</h4>
                                    <div>
                                        <ul className="grid-margin text-end">
                                            <li className="list-inline-item ">
                                                <Form.Select name="b2borderStatus" className="form-select-sm" value={this.state.product.b2borderStatus} onChange={this.onChange} >
                                                    <option value="">::발주상태::</option>
                                                    {b2borderStatusList.map((option)=>{
                                                        return <option key={option.code} value={option.code}>{option.codeNm}</option>
                                                    })}
                                                </Form.Select>
                                            </li>
                                            <li className="list-inline-item ">
                                                { this.state.b2borderStatus === "B2B11" ?
                                                    <button className="btn btn-sm btn-success" disabled><Trans>상태변경</Trans></button>
                                                    :
                                                    <button className="btn btn-sm btn-success" onClick={(e)=>this.onChangeStatus(e)}><Trans>상태변경</Trans></button>
                                                }
                                            </li>
                                            <li className="list-inline-item ">
												<button type="button" className="btn btn-sm btn-dark text-center"onClick={this.goB2BOrderList}  >
													<Trans>목록</Trans>
												</button>
											</li>

                                        </ul>
                                    </div>
                                    <div>
                                        <Grid columns={orderColumns} bodyHeight={100} onGridMounted={(e)=>this.onGridMounted(e)} ref={this.gridRef} ></Grid>
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
								<Form className="forms-sample">
									{/* <Form.Group  className="row border-bottom m-0">
										<Form.Label className="col-sm-3 col-form-label-sm mb-0 bg-light text-end">
											<Trans>상점이름</Trans>
										</Form.Label>
										<div className="col-5 grid-margin">
											<Form.Select name="storeNo" className="form-select-sm mt-2" value={this.state.storeNo} onChange={this.onChange}>
												<option value="0">::상점 선택::</option>
												{ storeList.map((option)=>{
													    return <option key={option.storeNo} value={option.storeNo}>{option.storeName}</option>
													})
												}
											</Form.Select>
										</div>
									</Form.Group> */}
                                    <Form.Group  className="row border-bottom m-0">
										<Form.Label className="col-sm-3 col-form-label-sm mb-0 bg-light text-end">
											<Trans>상점 이름</Trans>
										</Form.Label>
										<div className="col-5 grid-margin">
											<Form.Control type="text" name="storeName" autoComplete='off' className="form-control-sm mt-2" value={this.state.product.storeName || ""} readOnly
												size="sm"  onChange={this.onChange}>
											</Form.Control>
										</div>
									</Form.Group>

									{/* <Form.Group  className="row border-bottom m-0">
										<Form.Label className="col-sm-3 col-form-label-sm mb-0 bg-light text-end">
											<Trans>물류창고</Trans>
										</Form.Label>
										<div className="col-5 grid-margin">
											<Form.Select name="warehouseNo" className="form-select-sm mt-2" value={this.state.warehouseNo} onChange={this.onChange}>
												<option value="">::물류창고 선택::</option>
												{ warehouseList.map((option)=>{
													    return <option key={option.warehouseNo} value={option.warehouseNo}>{option.warehouseName}</option>
													})
												}
											</Form.Select>
										</div>
									</Form.Group> */}
									<Form.Group  className="row border-bottom m-0">
										<Form.Label className="col-sm-3 col-form-label-sm mb-0 bg-light text-end">
											<Trans>발주자 성명</Trans>
										</Form.Label>
										<div className="col-5 grid-margin">
											<Form.Control type="text" name="b2bordererName" autoComplete='off' className="form-control-sm mt-2" value={this.state.product.b2bordererName || ""}
												size="sm"  onChange={this.onChange}>
											</Form.Control>
										</div>
									</Form.Group>
									<Form.Group  className="row border-bottom m-0">
										<Form.Label className="col-sm-3 col-form-label-sm mb-0 bg-light text-end">
											<Trans>상품 단가</Trans>
										</Form.Label>
										<div className="col-5 grid-margin">
											<Form.Control type="number" name="productPrice" autoComplete='off' className="form-control-sm mt-2" value={this.state.product.productPrice || ""}
												size="sm"  onChange={this.onChange}>
											</Form.Control>
										</div>
									</Form.Group>
									<Form.Group  className="row border-bottom m-0">
										<Form.Label className="col-sm-3 col-form-label-sm mb-0 bg-light text-end">
											<Trans>상품총개수</Trans>
										</Form.Label>
										<div className="col-5 grid-margin">
											<Form.Control type="number" name="productTotalQty" autoComplete='off' className="form-control-sm mt-2" value={this.state.product.productTotalQty ||""}
												size="sm"  onChange={this.onChange}>
											</Form.Control>
										</div>
									</Form.Group>
									<Form.Group  className="row border-bottom m-0">
										<Form.Label className="col-sm-3 col-form-label-sm mb-0 bg-light text-end">
											<Trans>발주총금액</Trans>
										</Form.Label>
										<div className="col-5 grid-margin">
											<Form.Control type="number" name="b2borderAmount" autoComplete='off' className="form-control-sm mt-2" value={this.state.product.b2borderAmount || ""}
												size="sm"  onChange={this.onChange}>
											</Form.Control>
										</div>
									</Form.Group>
									<Form.Group  className="row border-bottom m-0">
										<Form.Label className="col-sm-3 col-form-label-sm mb-0 bg-light text-end">
											<Trans>결제방법</Trans>
										</Form.Label>
										<div className="col-5 grid-margin">
                                            <Form.Select name="paymentCode" className="form-select-sm mt-2"  onChange={this.onChange} value={this.state.product.paymentCode || ""}>
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
											<Form.Control type="text" name="b2borderMemo" className="form-control-sm mt-2" value={this.state.product.b2borderMemo || ""}
												size="sm"  onChange={this.onChange}>
											</Form.Control>
										</div>
									</Form.Group>
                                    <Form.Group  className="row border-bottom m-0">
										<Form.Label className="col-sm-3 col-form-label-sm mb-0 bg-light text-end">
											<Trans>결제완료여부</Trans>
										</Form.Label>
										<div className="col-5 grid-margin">
                                            <Form.Select name="b2borderFinishYn" className="form-select-sm mt-2" value={this.state.product.b2borderFinishYn} onChange={this.onChange}>
                                                <option value="">::결제완료여부::</option>
                                                <option value="Y">Y</option>
                                                <option value="N">N</option>
                                            </Form.Select>
                                        </div>
									</Form.Group>
									<div className="text-end mt-3">
										<ul className="grid-margin text-end">
											<li className="list-inline-item ">
												<button type="button" className="btn btn-sm btn-success text-center" onClick={(e)=>this.updateData(e)}>
													<Trans>수정하기</Trans>
												</button>
											</li>
										</ul>
									</div>
								</Form>
							</div>
						</div>
					</div>
				</div>
			</div>

		)
	}
}
export default withTranslation()(withRouter(BtoBOrderEdit));