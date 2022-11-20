/**
 * This application was developed by Haneri.jeong  of ITS Community at 2022 years.
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
	 	const date = new Date();
		let thisMonth = "";
		thisMonth += date.getFullYear()+" ";
		let month = (date.getMonth() + 1).toString();
		thisMonth += (month.length === 1 ? "0" + month : month)+" ";
		this.setState({thisMonth : thisMonth});
	}

	render(){		
		 
 		return(
			<div>
				<div className="row">
					  
				</div>	 
			</div>
		);
	}
}
export default withTranslation()(Dashboard);