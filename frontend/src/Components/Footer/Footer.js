import React from 'react';
import "./Footer.css";
function Footer(props) {
    return (
        <section id="footer">
            <div className="footer">
                <div className="footer-top">
                    <div className="footer-top-name">
                        <h2 style={{color:"#ffcc00"}}>MHOANG</h2>
                    </div>
                    <div className="footer-top-about">
                        <h2>about</h2>
                        <ul>
                            <li>
                            MHOANG là địa chỉ tin cậy cho mọi nhu cầu về máy ảnh và thiết bị quay chụp chất lượng cao.
                            </li>
                            <li>
                            Với cam kết về sản phẩm chính hãng và dịch vụ tận tâm, chúng tôi mang đến trải nghiệm mua sắm chuyên nghiệp và hài lòng nhất. Ghé ngay MHOANG để khám phá thế giới máy ảnh và công nghệ đỉnh cao!
                            </li>
                        </ul>
                    </div>
                    <div className="footer-top-sp">
                        <h2>Always-on Support</h2>
                        <p>- Phone/Zalo: 0966907473</p>
                        <p>- Facebook: <a style={{ color: '#cce7ff', textDecoration: 'underline' }} href='https://www.facebook.com/littlemozart.mh'>Minh Hoang</a></p>
                        <p>- Instagram: <a style={{ color: '#cce7ff', textDecoration: 'underline' }} href='https://www.instagram.com/hmoang22'>hmoang22</a></p>
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