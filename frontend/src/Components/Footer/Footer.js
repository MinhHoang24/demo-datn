import React from 'react';
import "./Footer.css";
function Footer(props) {
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
                        <p>Phone/Zalo: 0966907473</p>
                        <p>Facebook: <a style={{ color: '#cce7ff', textDecoration: 'underline' }} href='https://www.facebook.com/littlemozart.mh'>Minh Hoang</a></p>
                        <p>Instagram: <a style={{ color: '#cce7ff', textDecoration: 'underline' }} href='https://www.instagram.com/hmoang22'>hmoang22</a></p>
                        <p>
                            📍 Hà Nội, Việt Nam –{" "}
                            <a
                                href="https://maps.app.goo.gl/99VpowniGSKrYRsC6"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#ffcc00", textDecoration: "underline" }}
                            >
                                Xem bản đồ
                            </a>
                        </p>
                    </div>
                    <div className="footer-top-delivery">
                        <h2>Payment</h2>
                        <ul>
                            <li>
                                Phương thức thanh toán: Thanh toán khi nhận hàng hoặc qua các cổng thanh toán trực tuyến như VNPay, Momo.
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