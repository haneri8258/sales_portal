/**
 * This application was developed by YS.Im, HJ.Yoon and GH.Zhang of GIE&S(www.giens.co.kr) at 2022 years.
 */
import React, { Component } from 'react';
import { Trans, withTranslation } from "react-i18next";
import Grid from "@toast-ui/react-grid";
import { Card, Form } from "react-bootstrap";
import { Bar, Line } from "react-chartjs-2";
import axios from 'axios';
import api from '../../CustomAxios';
import TuiGrid from 'tui-grid';
import { Chart as ChartJS, LineController, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale , BarElement, ArcElement} from 'chart.js';
import ImageInGrid from '../utils/imageInGrid';
ChartJS.register(LineController, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale, BarElement, ArcElement);

/**
 * 설명 : 대시보드
 *
 * @author		: 임예슬
 * @since 		: 2022.04.15
 * @reference   : 참조 - 
 */
class Dashboard extends Component{
	constructor(props){
		super(props);
		this.state ={
			env: process.env.REACT_APP_DB_HOST,

			_USER_ID: sessionStorage.getItem('_USER_ID'),
			_USER_NAME: sessionStorage.getItem('_USER_NAME'),
			_STORE_NO: sessionStorage.getItem('_STORE_NO'),
			_STORE_NAME: sessionStorage.getItem('_STORE_NAME'),
			_GROUP_ID: sessionStorage.getItem('_GROUP_ID'),

			todayOrders: [], 
			monthlyOrders : [],
			orderStatus: {},
            QandAs : [],
			delayBeforeDelivery: {
				labels: ['day'],
				datasets : [
					{
						label : '결제완료 후 배송지연건 수',
						data: [0],
						borderColor: 'rgba(254, 124, 150, 0.5)',
						backgroundColor: 'rgba(254, 124, 150, 1)',
					}
				],
			},
			delayBeforeDeliveryOptions: {
				scales: {
					y: {
						beginAtZero: true,
						ticks:{
							stepSize: 1
						},
					},
				}
			},
			statSales: {
				labels: [''],
				datasets : [
					{
						label : '판매금액',
						data: [0],
						borderColor: 'rgba(25, 138, 227, 0.5)',
						backgroundColor: 'rgba(25, 138, 227, 1)',
						yAxisID: 'y',
					},
					{
						label : '판매건수',
						data: [1],
						borderColor: 'rgba(6, 185, 157, 0.5)',
						backgroundColor: 'rgba(6, 185, 157, 1)',
						yAxisID: 'y1',
					},
				],
			},
			statSalesOptions: {
				scales: {
					y: {
						type: 'linear',
						display: true,
						position: 'left',
						beginAtZero: true
					},
					y1: {
						type: 'linear',
						display: true,
						position: 'right',
						ticks:{
							stepSize: 1
						},
						beginAtZero: true
					},
				}
			},
		}
	}
	gridTodayOrders = React.createRef();	

	componentDidMount = async() => {
        TuiGrid.applyTheme("striped");
        let storeNo;
        if(sessionStorage.getItem("_ADMIN_AUTH") === "PART"){
			storeNo = sessionStorage.getItem("_STORE_NO");
		} else {
			storeNo = "";
		}
        await axios.all([
			api.get(this.state.env+"/dashboard/sales", {params : {storeNo : storeNo}}),
			api.get(this.state.env+"/dashboard/before/processing", {params : {storeNo : storeNo}}),
			api.get(this.state.env+"/dashboard/order", {params: {period: 1,storeNo : storeNo}}),
			api.get(this.state.env+"/dashboard/order/status/count",{params : {storeNo : storeNo}}),
			api.get(this.state.env+"/dashboard/statistics/delivery/delay",{params : {storeNo : storeNo}}),
			api.get(this.state.env+"/dashboard/statistics/sales", {params: {period: 7,storeNo : storeNo}}),
			api.get(this.state.env+"/dashboard/order", {params: {period: 30,storeNo : storeNo}}),
			api.get(this.state.env+"/dashboard/best/seller", {params : {storeNo : storeNo}}),
            api.get(this.state.env+"/common/excelBoards",{params : {storeNo : storeNo}})
		]).then(            
            axios.spread((res1, res2, res3, res4, res5, res6, res7, res8, res9) => {
                const sales = res1.data;
				const beforeProcessing = res2.data;
				const todayOrders = res3.data;
				const orderStatus = res4.data;
				const delay = res5.data;
				const saleStat = res6.data;
				const monthlyOrders = res7.data;
				const bestTop50 = res8.data;
                const QandAs = res9.data;
				for(let i in sales){
					this.setState({[i]: sales[i]});
				}
				let salesCompare = Math.round(((this.state.salesToday-this.state.salesYesterday)/this.state.salesYesterday)*100);
				
				let beforeProcessingTotalCount, beforeProcessingTotalPrice;
				for(let i in beforeProcessing){
					beforeProcessingTotalCount += beforeProcessing[i].count;
					beforeProcessingTotalPrice += beforeProcessing[i].totalAmount;
				}

				for(let i in orderStatus){
					this.setState({orderStatus : ({
							...this.state.orderStatus,
							[i] : orderStatus[i],
						})
					});
				}

				const delayLabel = []; const delayData = [];
				let count = 0;
				for(let i = 0; i <= delay.length; i++){
					if(!delayLabel.includes(delay[i]?.transDate)){
						if(count !== 0){
							delayData.push(count);
						}
						count = 0;
						if(i < delay.length){
							delayLabel.push(delay[i].transDate);
						}
					}					
					count++;
				}
				const delayDatasets = [...this.state.delayBeforeDelivery.datasets];
				delayDatasets[0].data = delayData;

				const statSellDate = []; const statTotalAmount = []; const statSellCount = [];
				for(let i in saleStat){
					statSellDate.push(saleStat[i].sellDate);
					statTotalAmount.push(saleStat[i].lastweekTotalAmount);
					statSellCount.push(saleStat[i].sellCount);
				}
				const statDatasets = [...this.state.statSales.datasets];
				statDatasets[0].data = statTotalAmount;
				statDatasets[1].data = statSellCount;
				this.setState({
					salesCompare : salesCompare,
					beforeProcessingTotalCount : beforeProcessingTotalCount,
					beforeProcessing : beforeProcessing,
					todayOrders : todayOrders,
					delayBeforeDelivery : ({
						...this.state.delayBeforeDelivery,
						labels: delayLabel,
						datasets: delayDatasets,
					}),
					statSales : ({
						...this.state.statSales,
						labels: statSellDate,
						datasets: statDatasets,
					}),
					monthlyOrders: monthlyOrders,
					bestTop50: bestTop50,
                    QandAs : QandAs,
				});
			})
		).catch(err => {
			if(err.response){
				console.log(err.response.data);
			}else if(err.request){
				console.log(err.request);
			}else{
				console.log('Error', err);
			}
		});
		
		const date = new Date();
		let thisMonth = "";
		thisMonth += date.getFullYear()+" ";
		let month = (date.getMonth() + 1).toString();
		thisMonth += (month.length === 1 ? "0" + month : month)+" ";
		this.setState({thisMonth : thisMonth});
	}

	render(){		
		const beforeProcessingColumns = [
			{ name : "storeName", header : "storeName"},
			{ name : "count", header : "count", align: "right"},
			{ name : "totalAmount", header : "totalAmount", align: "right",
				formatter({value}){
					const currency = Number(value).toLocaleString(); 
					return `${currency}`; 
				},
			},
		]
		const todayOrdersColumns = [
			{ name : "orderNo", header : "orderNo"},
			{ name : "count", header : "count", align: "right"},
			{ name : "totalAmount", header : "totalAmount", align: "right",
				formatter({value}){
					const currency = Number(value).toLocaleString(); 
					return `${currency}`; 
				},
			},
		]
		const QandAColumns = [
			{ name : "insertUser", header : "등록자ID",align:"center"},
			{ name : "insertDate", header : "등록시간",align:"center"},
			{ name : "replyYn", header : "답변여부",align:"center"},
		]
		const userActivityColumns = [
			{ name : "", header : "Date"},
			{ name : "", header : "UserID"},
		]
		const monthlyOrdersColumns = [
			{ name : "orderDate", header : "orderDate"},
			{ name : "brandName", header : "brandName"},
			{ name : "transStatusCodeName", header : "transStatusCodeName"},
			{ name : "insertUser", header : "insertUser"},
			{ name : "totalAmount", header : "totalAmount", align: "right",
				formatter({value}){
					const currency = Number(value).toLocaleString(); 
					return `${currency}`; 
				},
			},
		]
		const noticeColumns = [
			{ name : "", header : "test"},
			{ name : "", header : "test"},
			{ name : "", header : "test"},
		]
		const statisticsColumns = [
			{ name : "", header : "test"},
			{ name : "", header : "test"},
			{ name : "", header : "test"},
		]

		let imageData = [];
        for(let i in this.state.bestTop50){
            if(this.state.bestTop50[i].thumbnail){
                const thumbnail = {
                    seq: i,
                    imageSrc: this.state.bestTop50[i].thumbnail,
                }
                imageData.push(thumbnail);
            }
        }
		const top50Products = [
			{ name : "image", header : "이미지", width: 70, align: "center", renderer: {type: ImageInGrid, options: {data: imageData}}},
			{ name : "brandName", header : "브랜드", width: 100},
			{ name : "gender", header : "성별", width: 30},
			{ name : "productName", header : "상품명", minWidth: 200},
			{ name : "productCode", header : "상품코드", align: "center"},
			{ name : "productTotalQty", header : "판매수량", align: "right", className:"pe-2",
				formatter({value}){
					const currency = Number(value).toLocaleString(); 
					return `${currency}`; 
				},
			},
		]

		return(
			<div>
				<div className="row">
					<div className="col-md-3 stretch-card grid-margin">
						<div className="card bg-gradient-danger card-img-holder text-white">
							<div className="card-body">
								<h4 className="font-weight-normal mb-3"><Trans>Sales Total (Monthly)</Trans> <i className="mdi mdi-chart-line mdi-24px float-right"></i></h4>
								<div>
									<Form.Label className=" col-form-label">
										<h2>{Number(this.state.salesToday).toLocaleString()}</h2>
									<Form.Text className="text-white"><Trans>Today's Sales</Trans></Form.Text>
									</Form.Label>
									<div className="float-end mt-5"><Trans>전월대비</Trans>({this.state.salesCompare||0}%)</div>
								</div>
								<div>
									<Form.Label className=" col-form-label">
										<h2>{Number(this.state.salesYesterday).toLocaleString()}</h2>
									<Form.Text className="text-white"><Trans>Yesterday Sales</Trans></Form.Text>
									</Form.Label>
								</div>
								<div>
									<Form.Label className=" col-form-label">
										<h2>{Number(this.state.salesWeek).toLocaleString()}</h2>
									<Form.Text className="text-white"><Trans>Recently week Sales</Trans></Form.Text>
									</Form.Label>
								</div>
								<div>
									<Form.Label className="col-form-label">
										<h2>{Number(this.state.salesMonth).toLocaleString()}</h2>
									<Form.Text className="text-white">{this.state.thisMonth}<Trans>Monthly Sales</Trans></Form.Text>
									</Form.Label>
								</div>
							</div>
						</div>
					</div>
					<div className="col-md-3 stretch-card grid-margin">
						<div className="card bg-gradient-info card-img-holder text-white">
							<div className="card-body">
								<h4 className="font-weight-normal mb-3"><Trans>Before Processing Orders</Trans>({this.state.beforeProcessingTotalCount||0})</h4>
								<Grid data={this.state.beforeProcessing} columns={beforeProcessingColumns}
									header={{height: 0}} bodyHeight={300} 
									scrollX={true} scrollY={true}
									summary={{
										height: 30, 
										position: 'bottom', 
										columnContent : {
											targetMallName:{
												template: function(){
													return `<div class="text-start">미처리 합계</div>`;
												}
											},
											totalAmount: {
												template: function(valueMap){
													return `<div class="text-end">${Number(valueMap.sum).toLocaleString()||0}</div>`;
												}
											}
										}
									}}/>
							</div>
						</div>
					</div>
					<div className="col-md-3 stretch-card grid-margin">
						<div className="card bg-gradient-primary card-img-holder text-white">
							<div className="card-body">
								<h4 className="font-weight-normal mb-3"><Trans>Orders </Trans>({this.state.todayOrders.length||0})</h4>
								<Grid ref={this.gridTodayOrders} data={this.state.todayOrders} columns={todayOrdersColumns}
									header={{height: 0}} bodyHeight={330}
									scrollX={true} scrollY={true}/>
							</div>
						</div>
					</div>
					<div className="col-md-3 stretch-card grid-margin">
						<div className="card bg-gradient-success card-img-holder text-white">
							<div className="card-body">
								<h4 className="font-weight-normal mb-3"><Trans>Q&A</Trans></h4>
								<Grid columns={QandAColumns} data={this.state.QandAs}
									header={{height: 0}} bodyHeight={330} 
									scrollX={true} scrollY={true}/>
							</div>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-12 grid-margin">
						<div className="card">
							<div className="card-body">
								<ul className="list-inline mb-1 col-12 text-center">
									<li className="list-inline-item me-1">
									<Card border="dark" style={{ width: '16rem' }} >
										<Card.Header className="text-center"><h4><Trans>신규주문(재고확인중)</Trans></h4></Card.Header>
										<Card.Body>
											<div className="text-center">
												<h2>{this.state.orderStatus.newOrders||0}<Trans>건</Trans></h2>
											</div>
										</Card.Body>
									</Card>			
									</li>
									<li className="list-inline-item me-1">
										<Card border="dark"  style={{ width: '16rem' }} >
											<Card.Header className="text-center"><h4><Trans>재고확인완료</Trans></h4></Card.Header>
											<Card.Body>
												<div className="text-center">
													<h2>{this.state.orderStatus.stockChecked||0}<Trans>건</Trans></h2>
												</div>
											</Card.Body>
										</Card>			
									</li>
									<li className="list-inline-item me-1">
									<Card border="dark"  style={{ width: '8rem' }}>
										<Card.Header className="text-center text-danger"><h4><Trans>판매불가</Trans></h4></Card.Header>
										<Card.Body>
											<div className="text-center">
												<h3>{this.state.orderStatus.notAvailable||0}<Trans>건</Trans></h3>
											</div>
										</Card.Body>
									</Card>			
									</li>
									<li className="list-inline-item me-1">
										<Card border="dark" style={{ width: '8rem' }}>
											<Card.Header className="text-center"><h4><Trans>배송준비중</Trans></h4></Card.Header>
											<Card.Body>
												<div className="text-center">
													<h3>{this.state.orderStatus.deliveryReady||0}<Trans>건</Trans></h3>
												</div>
											</Card.Body>
										</Card>			
									</li>
									<li className="list-inline-item me-1">
										<Card border="dark" style={{ width: '8rem' }}>
											<Card.Header className="text-center"><h4><Trans>배송중</Trans></h4></Card.Header>
											<Card.Body>
												<div className="text-center">
													<h3>{this.state.orderStatus.onDelivery||0}<Trans>건</Trans></h3>
												</div>
											</Card.Body>
										</Card>			
									</li>
									<li className="list-inline-item me-1">
										<Card border="dark" style={{ width: '8rem' }}>
											<Card.Header className="text-center"><h4><Trans>배송완료</Trans></h4></Card.Header>
											<Card.Body>
												<div className="text-center">
													<h3>{this.state.orderStatus.deliveryDone||0}<Trans>건</Trans></h3>
												</div>
											</Card.Body>
										</Card>			
									</li>
									<li className="list-inline-item me-1">
										<Card border="dark" style={{ width: '8rem' }}>
											<Card.Header className="text-center text-danger"><h4><Trans>취소신청</Trans></h4></Card.Header>
											<Card.Body>
												<div className="text-center">
													<h3>{this.state.orderStatus.cancelOrderRequest||0}<Trans>건</Trans></h3>
												</div>
											</Card.Body>
										</Card>			
									</li>
									<li className="list-inline-item me-1">
										<Card border="dark" style={{ width: '8rem' }}>
											<Card.Header className="text-center text-danger"><h4><Trans>반품신청</Trans></h4></Card.Header>
											<Card.Body>
												<div className="text-center">
													<h3>{this.state.orderStatus.returnRequest||0}<Trans>건</Trans></h3>
												</div>
											</Card.Body>
										</Card>			
									</li>
									<li className="list-inline-item me-1">
										<Card border="dark" style={{ width: '8rem' }}>
											<Card.Header className="text-center text-danger"><h4><Trans>교환신청</Trans></h4></Card.Header>
											<Card.Body>
												<div className="text-center">
													<h3>{this.state.orderStatus.exchangeRequest||0}<Trans>건</Trans></h3>
												</div>
											</Card.Body>
										</Card>			
									</li>
									<li className="list-inline-item me-1">
										<Card border="dark" style={{ width: '8rem' }}>
											<Card.Header className="text-center"><h4><Trans>수취완료</Trans></h4></Card.Header>
											<Card.Body>
												<div className="text-center">
													<h3>{this.state.orderStatus.complete||0}<Trans>건</Trans></h3>
												</div>
											</Card.Body>
										</Card>			
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-md-6 grid-margin stretch-card">
						<div className="card">
							<div className="card-body">
								<h4 className="card-title float-left"><Trans>결제완료 후 배송전까지 지연통계</Trans></h4>
								<Bar data={this.state.delayBeforeDelivery} options={this.state.delayBeforeDeliveryOptions}/>
							</div>
						</div>
					</div>
					<div className="col-md-6 grid-margin stretch-card">
						<div className="card">
							<div className="card-body">
								<h4 className="card-title"><Trans>최근7일 매출통계</Trans></h4>
								<Line data={this.state.statSales} options={this.state.statSalesOptions}/>
							</div>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-md-3 stretch-card grid-margin">
						<div className="card card-img-holder ">
							<div className="card-body dashboard">
								<h4 className="font-weight-normal mb-3"><Trans>Today User Activity</Trans></h4>
								<Grid columns={userActivityColumns} 
									bodyHeight={200} header={{height: 0}} 
									scrollX={true} scrollY={true}></Grid>
							</div>
						</div>
					</div>
					<div className="col-md-3 stretch-card grid-margin">
						<div className="card card-img-holder ">
							<div className="card-body dashboard">
								<h4 className="font-weight-normal mb-3"><Trans>Orders</Trans>({this.state.monthlyOrders.length||0})</h4>
								<Grid data={this.state.monthlyOrders} columns={monthlyOrdersColumns}
									bodyHeight={200} header={{height: 0}} 
									rowHeight={20} minRowHeight={10}
									scrollX={true} scrollY={true}/>
							</div>
						</div>
					</div>
					<div className="col-md-3 stretch-card grid-margin">
						<div className="card card-img-holder ">
							<div className="card-body dashboard">
								<h4 className="font-weight-normal mb-3"><Trans>Notice</Trans></h4>
								<Grid columns={noticeColumns} 
									bodyHeight={200} header={{height: 0}} 
									scrollX={true} scrollY={true}></Grid>
							</div>
						</div>
					</div>
					<div className="col-md-3 stretch-card grid-margin">
						<div className="card card-img-holder ">
							<div className="card-body dashboard">
								<h4 className="font-weight-normal mb-3"><Trans>General Statistics</Trans></h4>
								<Grid columns={statisticsColumns} 
									bodyHeight={200} header={{height: 0}} 
									scrollX={true} scrollY={true}></Grid>
							</div>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-12 grid-margin">
						<div className="card">
							<div className="card-body">
								<h4 className="font-weight-normal mb-3"><Trans>최근30일이내 판매상위 50</Trans></h4>
								<Grid data={this.state.bestTop50} columns={top50Products}
									rowHeaders={['rowNum']} rowHeight={50}
									scrollX={true} scrollY={true}></Grid>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
export default withTranslation()(Dashboard);