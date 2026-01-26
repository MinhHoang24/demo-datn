import React from 'react';
import "./Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import {
  faLocationDot,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";

function Footer() {
    return (
        <section id="footer">
            <div className="footer">
                <div className="footer-top">
                    <div className="footer-top-name">
                        <h2 style={{color:"#ffcc00"}}>MH SHOP</h2>
                    </div>
                    <div className="footer-top-about">
                        <h2>about</h2>
                        <ul>
                            <li>
                            MH Shop chuyên phân phối các thiết bị điện tử và công nghệ bao gồm điện thoại, laptop, máy tính, tivi cùng nhiều sản phẩm hiện đại khác.
                            </li>
                            <li>Với cam kết sản phẩm chính hãng và dịch vụ chuyên nghiệp, chúng tôi luôn nỗ lực mang đến trải nghiệm mua sắm tiện lợi và đáng tin cậy cho khách hàng.</li>
                            <li>
                                Chúng tôi luôn đặt sự hài lòng của khách hàng làm trọng tâm trong mọi dịch vụ.
                            </li>
                        </ul>
                    </div>
                    <div className="footer-top-sp">
                        <h2>Always-on Support</h2>

                        <div className="contact-icons flex flex-col gap-2">
                            {/* PHONE / ZALO */}
                            <a
                                href="tel:0966907473"
                                className="contact-icon flex gap-2"
                                title="Gọi / Zalo: 0966907473"
                            >
                                <FontAwesomeIcon icon={faPhone} />
                                <span>0966 907 473</span>
                            </a>

                            {/* FACEBOOK */}
                            <a
                                href="https://www.facebook.com/littlemozart.mh"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-icon facebook flex gap-2"
                                title="Facebook"
                            >
                                <FontAwesomeIcon icon={faFacebook} />
                                <span>Facebook</span>
                            </a>

                            {/* INSTAGRAM */}
                            <a
                                href="https://www.instagram.com/hmoang22"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-icon instagram flex gap-2"
                                title="Instagram"
                            >
                                <FontAwesomeIcon icon={faInstagram} />
                                <span>Instagram</span>
                            </a>

                            {/* MAP */}
                            <a
                                href="https://maps.app.goo.gl/g2MQvdShHSmiwDEd8"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-icon map flex gap-2"
                                title="Xem bản đồ"
                            >
                                <FontAwesomeIcon icon={faLocationDot} />
                                <span>Số 1, Đại Cồ Việt,Hà Nội</span>
                            </a>
                        </div>
                    </div>
                    <div className="footer-top-delivery">
                        <h2>Payment</h2>
                        <ul>
                            <li>
                                Phương thức thanh toán: Thanh toán khi nhận hàng hoặc qua các cổng thanh toán trực tuyến như VNPay.
                            </li>
                            <li>
                                Giao hàng: Miễn phí vận chuyển cho đơn hàng trên 1.000.000 VNĐ. Hỗ trợ giao hàng nhanh trong 24h tại các thành phố lớn.
                            </li>
                            <li>
                                Ưu đãi: Theo dõi các chương trình khuyến mãi và nhận ưu đãi độc quyền khi trở thành khách hàng thân thiết.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Footer;