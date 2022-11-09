/**
 * This application was developed by YS.Im, HJ.Yoon and GH.Zhang of GIE&S at 2022 years.
 */
import React, { Component } from 'react';

/**
 * 설명 : 공통 - 페이지 하단
 *
 * @author		: 정병진
 * @since 		: 2022.04.15
 * @reference   : 참조 - 
 */
class Footer extends Component {
    render () {
        return (
            <footer className="footer">
                <div className="text-center">
                    <span className="footer_item">CEO : HANERI JEONG</span>
                    <span className="footer_item">Mail : <a href="mailto:haneri.jeong@gmail.com">haneri.jeong@gmail.com</a></span>
                    <span className="footer_item">Address : Wooseong Techno Park I , Bukwang-ro 220, Sosa-gu, Incheon, Republic of Korea</span>
                    <div className="footer_logo">
                        <span className="d-block text-center copyright">Copyright ©<a href="/dashboard"></a>All Rights Reserved.</span>
                    </div>
                </div>
            </footer> 
        );
    }
}

export default Footer;