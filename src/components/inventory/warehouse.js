/**
 * This application was developed by YS.Im, HJ.Yoon and GH.Zhang of GIE&S at 2022 years.
 */
import React, { Component } from "react";
import { Trans, withTranslation } from "react-i18next";
import Grid from "@toast-ui/react-grid";
import { Form, Modal, Badge } from "react-bootstrap";
import axios from "axios";
import LinkInGrid from "../utils/linkInGrid";
import { alert } from "react-bootstrap-confirmation";
import { confirm } from "react-bootstrap-confirmation";
import api from '../../CustomAxios';
import TuiGrid from 'tui-grid';
/**
 * 설명 : 물류창고 관리
 *
 * @author		: "Geunhee.Zhang(gh.zhang@gi-ens.co.kr)"
 * @since 		: 2022.04.15
 * @reference   : 참조 - 
 */
class Warehouse extends Component {
	constructor(props) {
		super(props);
		this.state = {
            gridData: {},

            isOpenModalUpd: false,
            isOpenModalAdd: false,
            isCheckedErs: false,
            isWarehouseNameAddX: false,
            isWarehouseNameAddO: false,
            isBtnAdd: true,
            isWarehouseName: false,
			
            vldtAdd: false,
            vldtUpd: false,

            searchCondition: "",
            searchKeyword: "",
            searchUseAt: "",

			_USER_ID: sessionStorage.getItem('_USER_ID'),
			_USER_NAME: sessionStorage.getItem('_USER_NAME'),
			_STORE_NO: sessionStorage.getItem('_STORE_NO'),
			_STORE_NAME: sessionStorage.getItem('_STORE_NAME'),
			_GROUP_ID: sessionStorage.getItem('_GROUP_ID'),

            warehouseNo: "",
            warehouseName: "",
            warehouseDesc: "",
            warehouseAddress: "",
            warehouseType: "",
            useYn: "",
            insertDate: "",
            insertUser: "",
            updateDate: "",
            updateUser: "",
            eraseYn: "",

            warehouseNameAdd: "",
            warehouseDescAdd: "",
            warehouseAddressAdd: "",
            warehouseTypeAdd: "",

            warehouseNameUpd: "",
            warehouseDescUpd: "",
            warehouseAddressUpd: "",
            warehouseTypeUpd: "",

            stores: []
		};

		this.gridRef = React.createRef();
        this.formAddRef = React.createRef();
        this.formUpdRef = React.createRef();
    }


    // 그리드 데이터 조회
    setGridData = (event) => {
		let params = {};
		params.searchCondition = this.state.searchCondition;
        params.searchKeyword = this.state.searchKeyword;
        params.searchUseAt = this.state.searchUseAt;

        api.post(process.env.REACT_APP_DB_HOST + "/inventory/getWarehouses", params).then(response => {
            this.setState({gridData: response.data});
            event.instance.resetData(this.state.gridData);
        });
    }

    // Form Elements 변경 시 동작
    onChangeHandler = async (event) => {
		let elmnName = event.target.name;
        let elmnValue = event.target.value;
        let rowCount = 0;

        // 유효성 검사
		if(elmnName === "warehouseNameAdd" || elmnName === "warehouseNameUpd") {
            if(elmnValue.length > 0) {
                this.setState({
                    isWarehouseName: false,
                    isBtnAdd: false
                });
            } else {
                this.setState({ 
                    isWarehouseName: true,
                    isBtnAdd: true
                });
            }
		}

        // 해당 항목에 값 반환
		this.setState({
            [elmnName]: elmnValue
		});
    }

    // Row Count
	getRowCount = async (warehouseName) => {
        let params = {};
        let result = 0;
        params.warehouseName = warehouseName;

        await api.post(process.env.REACT_APP_DB_HOST + "/inventory/getWarehouseCount", params).then(response => {
            if(response.status === 200) {
                result = Number(response.data.rowCount);
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

        return result;
    }

    // 상세 검색
	onSearchDetail = async (warehouseNo) => {
        let params = {};
        let result = {};
        params.warehouseNo = warehouseNo;

        await api.post(process.env.REACT_APP_DB_HOST + "/inventory/getWarehouseDetail", params).then(response => {
            if(response.status === 200) {
                result = response.data;
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

        return result;
    }

    // 목록 검색
	onSearch = () => {
		let params = {};

		params.searchCondition = this.state.searchCondition;
        params.searchKeyword = this.state.searchKeyword;
        params.searchUseAt = this.state.searchUseAt;

        api.post(process.env.REACT_APP_DB_HOST + "/inventory/getWarehouses", params).then(response => {
			if(response.status === 200) {
				this.gridRef.current.getInstance().resetData(response.data);
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

    // 상세보기/편집창 열기
    onOpenModalUpd = () => {
        this.getStores();

        this.setState({
            isOpenModalUpd: true
        });
    }

    // 상세보기/편집창 닫기
    onCloseModalUpd = () => {
        this.emptyChoiceData();

        this.setState({
            isOpenModalUpd: false
        });
    }

    // 등록창 열기
    onOpenModalAdd = async () => {
        this.getStores();

        this.setState({
            isOpenModalAdd: true
        });
    }

    // 등록창 닫기
    onCloseModalAdd = () => {
        this.emptyChoiceData();

        this.setState({
            isOpenModalAdd: false
        });
    }

    // 목록에서 선택한 정보 담기
    setChoiceData = (rowKey) => {
        this.setState({
            warehouseNo: this.gridRef.current.getInstance().getRow(rowKey).warehouseNo,
            storeNo: this.gridRef.current.getInstance().getRow(rowKey).storeNo,
            storeNoUpd: this.gridRef.current.getInstance().getRow(rowKey).storeNo,
            warehouseName: this.gridRef.current.getInstance().getRow(rowKey).warehouseName,
            warehouseNameUpd: this.gridRef.current.getInstance().getRow(rowKey).warehouseName,
            warehouseDesc: this.gridRef.current.getInstance().getRow(rowKey).warehouseDesc,
            warehouseDescUpd: this.gridRef.current.getInstance().getRow(rowKey).warehouseDesc,
            warehouseAddress: this.gridRef.current.getInstance().getRow(rowKey).warehouseAddress,
            warehouseAddressUpd: this.gridRef.current.getInstance().getRow(rowKey).warehouseAddress,
            warehouseType: this.gridRef.current.getInstance().getRow(rowKey).warehouseType,
            warehouseTypeUpd: this.gridRef.current.getInstance().getRow(rowKey).warehouseType,
            useYn: this.gridRef.current.getInstance().getRow(rowKey).useYn,
            insertDate: this.gridRef.current.getInstance().getRow(rowKey).insertDate,
            insertUser: this.gridRef.current.getInstance().getRow(rowKey).insertUser,
            updateDate: this.gridRef.current.getInstance().getRow(rowKey).updateDate,
            updateUser: this.gridRef.current.getInstance().getRow(rowKey).updateUser,
        });
    }

    // 선택 정보 비우기
    emptyChoiceData = () => {
        this.setState({
            warehouseNo: "",
            storeNo: "",
            storeNoAdd : "",
            storeNoUpd: "",
            warehouseName: "",
            warehouseNameAdd : "",
            warehouseNameUpd: "",
            warehouseDesc: "",
            warehouseDescAdd : "",
            warehouseDescUpd: "",
            warehouseAddress: "",
            warehouseAddressAdd : "",
            warehouseAddressUpd: "",
            warehouseType: "",
            warehouseTypeAdd : "",
            warehouseTypeUpd: "",
            useYn: "",
            insertDate: "",
            insertUser: "",
            updateDate: "",
            updateUser: "",
        });
    }

    // 입점사(상점) 콤보박스 생성
    getStores = async () => {
        let params = {};
        let stores = {};
        params.searchUseAt = "Y";

        await api.post(process.env.REACT_APP_DB_HOST + "/common/getStores", params).then(response => {
			if(response.status === 200) {
                stores = response.data;
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
        
        this.setState({
            stores: stores
        });
    }

    // After Component Mounted
    componentDidMount() {
        TuiGrid.applyTheme("striped");
    }


    // React Component Rendering
    render () {

        // 목록 클릭
        const onClickedAtag = (event, rowKey) => {
            event.preventDefault();
            this.setChoiceData(rowKey);
            this.onOpenModalUpd();
        }

		// 등록
        const addWarehouse = async (event) => {
			let form = this.formAddRef.current;

			if(form.checkValidity() === false) {
				event.preventDefault();
				event.stopPropagation();
			} else {
                let params = {};
                params.warehouseName = this.state.warehouseNameAdd;

                // 중복 확인
                await api.post(process.env.REACT_APP_DB_HOST + "/inventory/getWarehouseCount", params).then(response => {
                    if(response.status === 200) {
                        if(Number(response.data.rowCount) === 0) {
                            this.setState({
                                 isWarehouseNameAddX: false,
                                 isWarehouseNameAddO: true,
                                 isBtnAdd: true
                            });

                            api.post(process.env.REACT_APP_DB_HOST + "/inventory/addWarehouse", null, { params: {
                                warehouseName: this.state.warehouseNameAdd,
                                warehouseDesc: this.state.warehouseDescAdd,
                                warehouseAddress: this.state.warehouseAddressAdd,
                                warehouseType: this.state.warehouseTypeAdd,
                                useYn: "Y",
                                insertUser: this.state._USER_ID,
                                updateUser: this.state._USER_ID
                            }}).then(response => {
                                if(response.status === 200) {
                                    this.emptyChoiceData();
                                    this.onCloseModalAdd();
                                    this.onSearch();
                                    alert("등록이 완료되었습니다.", { okButtonStyle: "info" });
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
                        } else {
                            this.setState({ 
                                sWarehouseNameAddX: true,
                                isWarehouseNameAddO: false,
                                isBtnAdd: false,
                            });
                        }
                    }
                });
            }
            
			form.classList.add('was-validated');
        }
        
        // 변경
        const updWarehouse = async (event) => {
            let form = this.formUpdRef.current;

            if(form.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                api.post(process.env.REACT_APP_DB_HOST + "/inventory/updWarehouse", null, { params: {
                    warehouseNo: this.state.warehouseNo,
                    storeNo: this.state.storeNoUpd,
                    warehouseName: this.state.warehouseNameUpd,
                    warehouseDesc: this.state.warehouseDescUpd,
                    warehouseAddress: this.state.warehouseAddressUpd,
                    warehouseType: this.state.warehouseTypeUpd,
                    updateUser: this.state._USER_ID,
                    useYn : this.state.useYn,
        
                }}).then(response => {
                    if(response.status === 200) {
                        this.onCloseModalUpd();
                        this.onSearch();
                        alert("변경이 완료되었습니다.", { okButtonStyle: "info" });
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

            form.classList.add('was-validated');
        }

        // 삭제
        const delWarehouse = async () => {
            let answer = await confirm("삭제 하시겠습니까?", { okButtonStyle: "info" });

            if(answer) {
                api.post(process.env.REACT_APP_DB_HOST + "/inventory/delWarehouse", null, {params: {
                    warehouseNo: this.state.warehouseNo,
                    useYn: "N",
                    updateUser: this.state._USER_ID,
                    eraseYn: this.state.eraseYn
                }}).then(response => {
                    if(response.status === 200) {
                        this.onCloseModalUpd();
                        this.onSearch();
                        alert("삭제가 완료되었습니다.", { okButtonStyle: "info" });
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
            } else {
                return;
            }
        }

        const columns = [
            { name: "warehouseNo", header: "창고번호", sortable: true, filter: 'select', align: "center"},
            { name: "warehouseName", header: "물류창고명", sortable: true, filter: 'left',
                renderer: {
                    type: LinkInGrid,
                    options: {
                        onClickedAtag
                    }
                }
            },
            { name: "storeName", header: "상점명", sortable: true, align: "left" },
            { name: "warehouseDesc", header: "물류창고설명", sortable: true, align: "left" },
            { name: "warehouseAddress", header: "물류창고주소", sortable: true, align: "left" },
            { name: "warehouseTypeNm", header: "물류창고구분", sortable: true, align: "center" },
            { name: "useYn", header: "사용여부", sortable: true, align: "center" },
            { name: "updateDate", header: "최근변경일시", sortable: true, align: "center" },
            { name: "updateUser", header: "최근변경자", sortable: true, align: "left" },
        ]

        // 입점사(상점) 콤보박스
        const storeOpts = this.state.stores.map((stores, key) => (
            <option key={key} value={stores.storeNo}>{stores.storeName}</option>
        ));


        return (
            <div>
                <div className="page-header">
                    <h3 className="page-title">Warehouse Management</h3>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">Inventory</li>
                            <li className="breadcrumb-item active" aria-current="page">Warehouse</li>
                        </ol>
                    </nav>
                </div>
                <div className="row">
                    <div className="col-12 grid-margin">
                        <div className="card">
                            <div className="card-body">
                                <div className="text-end">
                                    <ul className="list-inline  my-3 mb-3">
                                        <li className="list-inline-item me-1">
                                            <Form.Text>검색조건</Form.Text>
                                        </li>
                                        <li className="list-inline-item me-1">
                                            <Form.Select name="searchCondition" className="form-select-sm" onChange={(event) => this.onChangeHandler(event)} value={this.state.searchCondition}>
                                                <option value="">전체</option>
                                                <option value="2">물류창고명</option>
                                            </Form.Select>
                                        </li>
                                        <li className="list-inline-item me-1">
											&nbsp;
                                            <Form.Text><Trans>사용여부</Trans></Form.Text>
                                        </li>
                                        <li className="list-inline-item me-1">
                                            <Form.Select name="searchUseAt" className="form-select-sm" onChange={(event) => this.onChangeHandler(event)} value={this.state.searchUseAt}>
                                                <option value="">전체</option>
                                                <option value="Y">사용</option>
                                                <option value="N">미사용</option>
                                            </Form.Select>
                                        </li>
                                        <li className="list-inline-item me-1">
                                            <Form.Control type="text"  className="form-control"  size="sm" name="searchKeyword" 
                                                          onChange={(event) => this.onChangeHandler(event)} style={{"minHeight": "1rem"}}
                                                          value={this.state.searchKeyword} placeholder="검색어를 입력하세요." autoFocus >
                                            </Form.Control>
                                        </li>
                                        <li className="list-inline-item me-1">
                                            <button type="search" className="btn btn-sm btn-success" onClick={this.onSearch}>
                                                <Trans>검색</Trans>
                                            </button>
                                        </li>
                                        <li className="list-inline-item me-1">
                                            <button	type="search" className="btn btn-sm btn-danger" onClick={this.onOpenModalAdd}>
                                                <Trans>등록</Trans>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                                <Grid  columns={columns} rowHeaders={['rowNum']} onGridMounted={(event) => this.setGridData(event)} ref={this.gridRef} bodyHeight={500}></Grid>
                            </div>
                        </div>
                    </div>
                </div>



                {/* 등록 Modal */}
                <Modal className="modal fade" show={this.state.isOpenModalAdd} onHide={this.onCloseModalAdd} aria-labelledby="contained-modal-title-vcenter" aria-hidden="true" centered scrollable>
					<Modal.Header className="modal-header" closeButton>
						<Modal.Title><Trans>물류창고 등록</Trans></Modal.Title>
					</Modal.Header>
					<Modal.Body>
                        {/* 등록 Form Start */}
						<Form controlid="form01" noValidate validated={this.state.vldtAdd} ref={this.formAddRef}>
							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="storeNoAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>입점사(상점)</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
                                    <Form.Select name="storeNoAdd" className="form-select-sm" onChange={(event) => this.onChangeHandler(event)} value={this.state.storeNoAdd}>
                                        <option value="">상점선택</option>
                                        {storeOpts}
                                    </Form.Select>
								</div>
							</Form.Group>

							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="warehouseNameAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Badge className="badge rounded-pill bg-danger">필수</Badge>&nbsp;<Trans>물류창고명</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
									<Form.Control type="text" name="warehouseNameAdd" className="form-control-sm" value={this.state.warehouseNameAdd} 
										          onChange={(event) => this.onChangeHandler(event)} placeholder="50글자 이내" required
                                                  maxLength={"50"} aria-describedby="warehouseNameAddHelp"  autoFocus>
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid"><Trans>물류창고명을</Trans>&nbsp;<Trans>입력해주세요.</Trans></Form.Control.Feedback>
                                    {this.state.isWarehouseNameAddX && <span id="warehouseNameAddHelp" className="text-danger small" muted><Trans>이미 사용중인 물류창고명 입니다.</Trans></span>}
                                    {this.state.isWarehouseNameAddO && <span id="warehouseNameAddHelp" className="text-success small" muted><Trans>사용이 가능한 물류창고명 입니다.</Trans></span>}
                                    {this.state.isWarehouseName && <span id="warehouseNameAddHelp" className="text-danger small" muted><Trans>물류창고명을 입력해주세요.</Trans></span>}
								</div>
							</Form.Group>

							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="warehouseDescAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>물류창고설명</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
									<Form.Control type="text" name="warehouseDescAdd" className="form-control-sm" value={this.state.warehouseDescAdd} 
										          onChange={(event) => this.onChangeHandler(event)} placeholder="100글자 이내" maxLength={"100"} >
                                    </Form.Control>
								</div>
							</Form.Group>

							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="warehouseAddressAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>물류창고주소</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
									<Form.Control type="text" name="warehouseAddressAdd" className="form-control-sm" value={this.state.warehouseAddressAdd} 
										          onChange={(event) => this.onChangeHandler(event)} placeholder="100글자 이내" maxLength={"100"} >
                                    </Form.Control>
								</div>
							</Form.Group>

							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="warehouseTypeAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>물류창고구분</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
                                    <Form.Select name="warehouseTypeAdd" className="form-select-sm" onChange={(event) => this.onChangeHandler(event)} value={this.state.warehouseTypeAdd}>
                                        <option value="">구분선택</option>
                                        <option value="1">본사창고</option>
                                        <option value="2">입점사창고</option>
                                        <option value="99">기타창고</option>
                                    </Form.Select>
								</div>
							</Form.Group>

						</Form>
                        {/* 등록 Form End */}
					</Modal.Body>
					<Modal.Footer>
						<button className="btn btn-sm btn-dark" onClick={this.onCloseModalAdd}><Trans>취소</Trans></button>
						<button className="btn btn-sm btn-success" onClick={(event) => addWarehouse(event)} disabled={this.state.isBtnAdd}><Trans>등록</Trans></button>
					</Modal.Footer>
                </Modal>


                {/* 변경 Modal */}
                <Modal className="modal fade" show={this.state.isOpenModalUpd} onHide={this.onCloseModalUpd} aria-labelledby="contained-modal-title-vcenter" aria-hidden="true" centered scrollable>
					<Modal.Header className="modal-header" closeButton>
						<Modal.Title><Trans>물류창고 변경</Trans></Modal.Title>
					</Modal.Header>
					<Modal.Body>
                        {/* 변경 Form Start */}
						<form controlid="form02" noValidate validated={this.state.vldtUpd ? 1 : 0} ref={this.formUpdRef}>

                            <Form.Group className="row border-bottom m-0">
                                <Form.Label className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>물류창고번호</Trans>
                                </Form.Label>
                                <div className="col-sm-8 p-1">&nbsp;{this.state.warehouseNo}</div>
                            </Form.Group>

							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="storeNoUpd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>입점사(상점)</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
                                    <Form.Select name="storeNoUpd" className="form-select-sm" onChange={(event) => this.onChangeHandler(event)} value={this.state.storeNoUpd}>
                                        <option value="">상점선택</option>
                                        {storeOpts}
                                    </Form.Select>
								</div>
							</Form.Group>

							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="warehouseNameUpd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Badge className="badge rounded-pill bg-danger">필수</Badge>&nbsp;<Trans>물류창고명</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
									<Form.Control type="text" name="warehouseNameUpd" className="form-control-sm" value={this.state.warehouseNameUpd} 
										          onChange={(event) => this.onChangeHandler(event)} placeholder="50글자 이내" required
                                                  maxLength={"50"} aria-describedby="warehouseNameUpdHelp" autoFocus>
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid"><Trans>물류창고명을</Trans>&nbsp;<Trans>입력해주세요.</Trans></Form.Control.Feedback>
                                    {this.state.isWarehouseUpdX && <span id="warehouseNameUpdHelp" className="text-danger small" muted><Trans>이미 사용중인 물류창고명 입니다.</Trans></span>}
                                    {this.state.isWarehouseUpdO && <span id="warehouseNameUpdHelp" className="text-success small" muted><Trans>사용이 가능한 물류창고명 입니다.</Trans></span>}
                                    {this.state.isWarehouseName && <span id="warehouseNameAddHelp" className="text-danger small" muted><Trans>물류창고명을 입력해주세요.</Trans></span>}
								</div>
							</Form.Group>

							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="warehouseDescUpd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>물류창고설명</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
									<Form.Control type="text"name="warehouseDescUpd" className="form-control-sm" value={this.state.warehouseDescUpd} 
										          onChange={(event) => this.onChangeHandler(event)} placeholder="100글자 이내" maxLength={"100"} >
                                    </Form.Control>
								</div>
							</Form.Group>

							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="warehouseAddressUpd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>물류창고주소</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
									<Form.Control type="text" name="warehouseAddressUpd" className="form-control-sm" value={this.state.warehouseAddressUpd} 
										          onChange={(event) => this.onChangeHandler(event)} placeholder="100글자 이내" maxLength={"100"} >
                                    </Form.Control>
								</div>
							</Form.Group>

							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="warehouseTypeUpd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>물류창고구분</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
                                    <Form.Select name="warehouseTypeUpd" className="form-select-sm" onChange={(event) => this.onChangeHandler(event)} value={this.state.warehouseTypeUpd}>
                                        <option value="">구분선택</option>
                                        <option value="1">본사창고</option>
                                        <option value="2">입점사창고</option>
                                        <option value="99">기타창고</option>
                                    </Form.Select>
								</div>
							</Form.Group>
							<Form.Group className="row border-bottom m-0">
								<Form.Label className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>사용여부</Trans>
                                </Form.Label>
                                <div className="col-sm-8 p-1">
                                    <Form.Select name="useYn" className="form-select-sm" onChange={(event) => this.onChangeHandler(event)} value={this.state.useYn}>
                                        <option value="Y">Y</option>
                                        <option value="N">N</option>
                                    </Form.Select>
                                </div>
							</Form.Group>
							<Form.Group className="row border-bottom m-0">
								<Form.Label className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>최초등록일시</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">&nbsp;{this.state.insertDate}</div>
							</Form.Group>

							<Form.Group className="row border-bottom m-0">
								<Form.Label className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>최초등록자</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">&nbsp;{this.state.insertUser}</div>
							</Form.Group>

							<Form.Group className="row border-bottom m-0">
								<Form.Label className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>최근변경일시</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">&nbsp;{this.state.updateDate}</div>
							</Form.Group>

							<Form.Group className="row border-bottom m-0">
								<Form.Label className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Trans>최근변경자</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">&nbsp;{this.state.updateUser}</div>
							</Form.Group>
						</form>
                        {/* 변경 Form End */}
					</Modal.Body>
					<Modal.Footer>
						<button className="btn btn-sm btn-dark" onClick={this.onCloseModalUpd}><Trans>취소</Trans></button>
						<button className="btn btn-sm btn-success" onClick={(event) => updWarehouse(event)}><Trans>변경</Trans></button>
					</Modal.Footer>
                </Modal>

            </div>
        );
    }
}

export default withTranslation() (Warehouse);