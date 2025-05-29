import React from 'react';
import "./Footer.css";
function Footer(props) {
    return (
        <section id="footer">
            <div className="footer">
                <div className="footer-top">
                    <div className="footer-top-name">
                        <h2 style={{color:"rgb(243, 247, 10)"}}>HI TECH</h2>
                    </div>
                    <div className="footer-top-about">
                        <h2>about</h2>
                        <ul>
                            <li>
                            HI TECH là địa chỉ tin cậy cho mọi người khi tìm kiếm các sản phẩm điện máy và điện tử chất lượng cao.
                            </li>
                            <li>
                            Với cam kết về chất lượng và dịch vụ chuyên nghiệp, chúng tôi luôn đảm bảo rằng mỗi khách hàng đều có trải nghiệm mua sắm tốt nhất khi đến với chúng tôi. Hãy ghé thăm cửa hàng của chúng tôi ngay hôm nay để khám phá thế giới công nghệ đầy sáng tạo và tiện ích!
                            </li>
                        </ul>
                    </div>
                    <div className="footer-top-sp">
                        <h2>Always-on Support</h2>
                        <p>- Support 039 6666 666 (07:00-21:00)</p>
                        <p>- Delivery 039 6666 666 (07:00-21:00)</p>
                    </div>
                    <div className="footer-top-delivery">
                        <h2>Payment</h2>
                        <ul>
                            <li>
                                Phương thức thanh toán: Thanh toán khi nhận hàng hoặc qua các cổng thanh toán trực tuyến như VNPay, Momo.
                            </li>
                            <li>
                                Giao hàng: Miễn phí vận chuyển cho đơn hàng trên 500.000 VNĐ. Hỗ trợ giao hàng nhanh trong 24h tại các thành phố lớn.
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