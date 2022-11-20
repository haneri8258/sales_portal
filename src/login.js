/**
 * This application was developed by YS.Im, HJ.Yoon and GH.Zhang of GIE&S at 2022 years.
 */
import React, { Component } from "react";
import { Trans, withTranslation } from "react-i18next";
import { Form, Modal, Badge } from "react-bootstrap";
import axios from "axios";
import { alert } from "react-bootstrap-confirmation";
import { confirm } from "react-bootstrap-confirmation";
import { useNavigate } from "react-router-dom";
import api from "./CustomAxios";

/**
 * 설명 : 로그인
 *
 * @author		: 정병진
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

export class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
            stores : [],
            isUserId: false,
            isPassword: false,
            
            isBtnLoginDisabled: true,
            isBtnAddDisabled: true,

            isOpenModalAdd: false,
            isStoreAddX: false,
            isStoreAddO: false,
            isStoreName: false,
			
            vldtLogin: false,
            vldtApplyStore: false,

            userId: "",
            password: "",

            storeNameAdd: "",
            storeDescAdd: "",
            storeAddressAdd: "",
            storeManagerAdd: "",
            storeTelNoAdd: "",
            storeTypeAdd: "",
        };
        
        this.formLoginRef = React.createRef();
        this.formApplyStoreRef = React.createRef();
    }

    // Form Elements 변경 시 동작
    onChangeHandler = async (event) => {
		let elmnName = event.target.name;
        let elmnValue = event.target.value;

        // 유효성 검사 - User ID
		if(elmnName === "userId") {
            if(elmnValue.length > 0) {
                this.setState({ isUserId: false });
                this.setState({ isBtnLoginDisabled: false });
            } else {
                this.setState({ isUserId: true });
                this.setState({ isBtnLoginDisabled: true });
            }
        }
        
        // 유효성 검사 - Password
		if(elmnName === "password") {
            if(elmnValue.length > 0) {
                this.setState({ isPassword: false });
                this.setState({ isBtnLoginDisabled: false });
            } else {
                this.setState({ isPassword: true });
                this.setState({ isBtnLoginDisabled: true });
            }
        }
        
        // 유효성 검사 - Store Name
		if(elmnName === "storeNameAdd") {
            if(elmnValue.length > 0) {
                this.setState({ isStoreName: false });
                this.setState({ isBtnAddDisabled: false });
            } else {
                this.setState({ isStoreName: true });
                this.setState({ isBtnAddDisabled: true });
            }
		}

        // 해당 항목에 값 반환
		this.setState({
            [elmnName]: elmnValue
		});
    }


    // 등록창 열기
    onOpenModalAdd = async () => {
        this.setState({
            isOpenModalAdd: true
        });
        this.StoreType();
    }

    // 등록창 닫기
    onCloseModalAdd = () => {
        this.setState({
            isOpenModalAdd: false
        });
    }

    StoreType = () => {

        let params = {};
        params.code = ""

        api.post(process.env.REACT_APP_DB_HOST + "/common/getCodeStoretype", params).then(res => {
            if(res.status === 200){
                this.setState({
                    stores: res.data
                });

            }
            
        });

    }    
    
    render() {
        //엔터키 로그인
        const onEnterKeyPress = (e) => {
            if(e.key === "Enter"){
                onLogin(e);
            }
        }
        
        // 로그인 처리
        const onLogin = async (event) => {
            let form = this.formLoginRef.current;
			
			//debugger;
			
            if(form.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                let params = {};
                params.userId = this.state.userId;
                params.password = this.state.password;
				debugger;
                await axios.post(process.env.REACT_APP_DB_HOST + "/common/getUserLogin", params).then(response => {
                    if(response.status === 200) {
                        if(!response.data) {
                            alert("로그인 정보를 다시 한번 확인해주세요.", { okButtonStyle: "danger" });
                            return;
                        } else {
                            if(response.data.userId === "_USER_ID_NONE") {
                                alert("등록되지 않은 사용자ID 입니다.", { okButtonStyle: "warning" });
                                return;
                            } else if(response.data.userId === "_PASSWORD_MISMATCH") {
                                alert("비밀번호가 일치하지 않습니다.", { okButtonStyle: "warning" });
                                return;
                            } else if(response.data.username) {
                                // 사용자정보 저장
                                debugger;
                                sessionStorage.setItem('_USER_ID', response.data.id);
                                sessionStorage.setItem('_USER_NAME', response.data.nickname); 
                                sessionStorage.setItem('_CLIENT_ID', response.data.clientId);
                                sessionStorage.setItem('_CLIENT_NAME', response.data.clientName);
                                sessionStorage.setItem('_GROUP_ID', response.data.groupId);
                                sessionStorage.setItem('_ORGNZ_ID', response.data.orgnzId);
                                sessionStorage.setItem('_USER_STATUS', response.data.userStatus);
                                sessionStorage.setItem('_USER_TYPE', response.data.userType);
                                sessionStorage.setItem('_LOCK_AT', response.data.lockAt);
                                sessionStorage.setItem('_ADMIN_AUTH', response.data.adminAuth);
                                sessionStorage.setItem('_USE_AT', response.data.useAt);
                                sessionStorage.setItem("_JWT_TOKEN", response.data.token);
                                                                
                                // Dashboard(시작 페이지)로 이동
                                this.props.router.navigate('/dashboard', {replace: true});
                                window.location.reload(); 
							} else {
	                            alert("로그인 정보를 다시 한번 확인해주세요.", { okButtonStyle: "danger" });
	                            return;
                            }
                        }
                    }
                }).catch(error => {
                    alert("로그인 정보를 다시 한번 확인해주세요.", { okButtonStyle: "danger" });
                    console.log("[00110] ERROR :: ", error.message);
                });
            }

            form.classList.add('was-validated');
        }

		// 가입신청 - 입점사
        const applyStore = async (event) => {
			let form = this.formApplyStoreRef.current;

			if(form.checkValidity() === false) {
				event.preventDefault();
				event.stopPropagation();
			} else {
                let params = {};
                params.storeName = this.state.storeNameAdd;

                // 입점사명 중복 확인
                await axios.post(process.env.REACT_APP_DB_HOST + "/common/getStoreCount", params).then(response => {
                    if(response.status === 200) {
                        if(Number(response.data.rowCount) === 0) {
                            this.setState({ isStoreAddX: false });
                            this.setState({ isStoreAddO: true });
                            this.setState({ isBtnAddDisabled: true });

                            axios.post(process.env.REACT_APP_DB_HOST + "/common/addStore", null, { params: {
                                storeName: this.state.storeNameAdd,
                                storeDesc: this.state.storeDescAdd,
                                storeAddress: this.state.storeAddressAdd,
                                storeManager: this.state.storeManagerAdd,
                                storeTelNo: this.state.storeTelNoAdd,
                                storeType: this.state.storeTypeAdd,
                                useYn: "R",
                                insertUser: "_GUEST",
                                updateUser: "_GUEST",
                            }}).then(response => {
                                if(response.status === 200) {
                                    this.onCloseModalAdd();
                                    this.setState({
                                        storeNameAdd: "",
                                        storeDescAdd: "",
                                        storeAddressAdd: "",
                                        storeManagerAdd: "",
                                        storeTelNoAdd: "",
                                        storeTypeAdd: "",
                                        isStoreAddO : "",
                                    })
                                    alert("가입신청이 완료되었습니다. 담당자 확인 후 연락드리도록 하겠습니다.", { okButtonStyle: "info" });
                                }
                            }).catch(error => {
                                console.log("[00309] ERROR :: ", error.message);
                            });
                        } else {
                            this.setState({ isStoreAddX: true });
                            this.setState({ isStoreAddO: false });
                            this.setState({ isBtnAddDisabled: false });
                        }
                    }
                });
            }
            
			form.classList.add('was-validated');
        }


        return (
            <div className="d-flex align-items-center auth px-0">
                <div className="row w-100 mx-0">
                    <div className="col-lg-4 mx-auto">

                        <div className="auth-form-light text-center p-2">
                            
                            <div className="brand-logo">
                                <img src={require("./assets/images/ubello.png")} alt="LOGO" />
                            </div>
                            
                            <h4>Hello! let's get started. Sign in to continue.</h4>
                        </div>

                        <div className="auth-form-light text-left py-3 px-4">
                            <Form className="pt-3" controlid="form01" noValidate validated={this.state.vldtLogin} ref={this.formLoginRef}>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="userId">
                                        <Trans>사용자ID</Trans>
                                    </Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        className="h-auto" 
                                        size="sm" 
                                        name="userId" 
                                        value={this.state.userId}
                                        onChange={(event) => this.onChangeHandler(event)}
                                        placeholder="사용자 ID를 입력하세요." 
                                        autoFocus
                                        required
                                        aria-describedby="userIdHelp"
                                    ></Form.Control>
                                    <Form.Control.Feedback type="invalid"><Trans>사용자 ID를</Trans>&nbsp;<Trans>입력해주세요.</Trans></Form.Control.Feedback>
                                    {this.state.isUserId && <span id="userIdHelp" className="text-danger small" muted><Trans>사용자ID를 입력하세요.</Trans></span>}
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="password">
                                        <Trans>비밀번호</Trans>
                                    </Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        className="h-auto"
                                        size="sm"
                                        name="password"
                                        value={this.state.password}
                                        onChange={(event) => this.onChangeHandler(event)}
                                        placeholder="비밀번호를 입력하세요."
                                        required
                                        aria-describedby="passwordHelp"
                                        onKeyPress={(event) => onEnterKeyPress(event)}
                                    ></Form.Control>
                                    <Form.Control.Feedback type="invalid"><Trans>비밀번호를</Trans>&nbsp;<Trans>입력해주세요.</Trans></Form.Control.Feedback>
                                    {this.state.isPassword && <span id="passwordHelp" className="text-danger small" muted><Trans>비밀번호를 입력하세요.</Trans></span>}
                                </Form.Group>
                            </Form>

                            <div className="mt-3 text-center">
                                <button className="btn btn-lg btn-info" onClick={this.onOpenModalAdd}><Trans>가입신청</Trans></button>
                                <button className="btn btn-lg btn-success" onClick={(event) => onLogin(event)} disabled={this.state.isBtnLoginDisabled}><Trans>로그인</Trans></button>
                            </div>
                        </div>

                    </div>
                </div>


                {/* 가입신청 - 입점사 Modal Start */}
                <Modal className="modal fade" show={this.state.isOpenModalAdd} onHide={this.onCloseModalAdd} aria-labelledby="contained-modal-title-vcenter" aria-hidden="true" centered scrollable>
					<Modal.Header className="modal-header" closeButton>
						<Modal.Title><Trans>입점사 가입 신청하기</Trans></Modal.Title>
					</Modal.Header>
					<Modal.Body>
                        {/* 가입신청 - 입점사 Form Start */} 
						<Form controlid="form02" noValidate validated={this.state.vldtApplyStore} ref={this.formApplyStoreRef}>

							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="storeTypeAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Badge className="badge rounded-pill bg-danger">필수</Badge>&nbsp;<Trans>상점구분</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
                                    <Form.Select name="storeTypeAdd" className="form-select-sm" onChange={(event) => this.onChangeHandler(event)} value={this.state.storeTypeAdd}>
                                        <option value="">::선택해주세요::</option>
                                        {this.state.stores.map((option)=>{
                                            return <option key={option.code} value={option.code}>{option.codeNm}</option>
                                        })}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid"><Trans>상점구분을</Trans>&nbsp;<Trans>선택해주세요.</Trans></Form.Control.Feedback>
								</div>
							</Form.Group>

							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="storeNameAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    <Badge className="badge rounded-pill bg-danger">필수</Badge>&nbsp;<Trans>상점명</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
									<Form.Control 
										type="text" 
										name="storeNameAdd" 
										className="form-control-sm"
										value={this.state.storeNameAdd} 
										onChange={(event) => this.onChangeHandler(event)} 
										placeholder="50글자 이내" 
										required
                                        maxLength={"50"}
                                        aria-describedby="storeNameAddHelp"
                                        autoFocus
									></Form.Control>
                                    <Form.Control.Feedback type="invalid"><Trans>상점명을</Trans>&nbsp;<Trans>입력해주세요.</Trans></Form.Control.Feedback>
                                    {this.state.isStoreAddX && <span id="storeNameAddHelp" className="text-danger small" muted><Trans>이미 사용중인 상점명 입니다.</Trans></span>}
                                    {this.state.isStoreAddO && <span id="storeNameAddHelp" className="text-success small" muted><Trans>사용이 가능한 상점명 입니다.</Trans></span>}
                                    {this.state.isStoreName && <span id="storeNameAddHelp" className="text-danger small" muted><Trans>상점명을 입력하세요.</Trans></span>}
								</div>
							</Form.Group>

							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="storeDescAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    &nbsp;<Trans>상점설명</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
									<Form.Control 
										type="text" 
										name="storeDescAdd" 
										className="form-control-sm" 
										value={this.state.storeDescAdd} 
										onChange={(event) => this.onChangeHandler(event)} 
										placeholder="100글자 이내" 
										maxLength={"100"} 
									></Form.Control>
								</div>
							</Form.Group>

							<Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="storeAddressAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    &nbsp;<Trans>상점주소</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
									<Form.Control 
										type="text" 
										name="storeAddressAdd" 
										className="form-control-sm" 
										value={this.state.storeAddressAdd} 
										onChange={(event) => this.onChangeHandler(event)} 
										placeholder="100글자 이내" 
										maxLength={"100"} 
									></Form.Control>
								</div>
							</Form.Group>

                            <Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="storeManagerAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    &nbsp;<Trans>상점관리자</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
									<Form.Control 
										type="text" 
										name="storeManagerAdd" 
										className="form-control-sm" 
										value={this.state.storeManagerAdd} 
										onChange={(event) => this.onChangeHandler(event)} 
										placeholder="20글자 이내" 
										maxLength={"20"} 
									></Form.Control>
								</div>
							</Form.Group>

                            <Form.Group className="row border-bottom m-0">
								<Form.Label htmlFor="storeTelNoAdd" className="col-sm-4 col-form-label-sm mb-0 bg-light text-end">
                                    &nbsp;<Trans>상점전화번호</Trans>
                                </Form.Label>
								<div className="col-sm-8 p-1">
									<Form.Control 
										type="text" 
										name="storeTelNoAdd" 
										className="form-control-sm" 
										value={this.state.storeTelNoAdd} 
										onChange={(event) => this.onChangeHandler(event)} 
										placeholder="20글자 이내" 
										maxLength={"20"} 
									></Form.Control>
								</div>
							</Form.Group>
						</Form>
                        {/* 가입신청 - 입점사 Form End */}
					</Modal.Body>
					<Modal.Footer>
						<button className="btn btn-sm btn-dark" onClick={this.onCloseModalAdd}><Trans>취소</Trans></button>
						<button className="btn btn-sm btn-success" onClick={(event) => applyStore(event)} disabled={this.state.isBtnApplyDisabled}><Trans>가입신청</Trans></button>
					</Modal.Footer>
                </Modal>
                {/* 가입신청 - 입점사 Modal End */}

            </div>
        );
    }
}

export default withTranslation()(withRouter(Login));
