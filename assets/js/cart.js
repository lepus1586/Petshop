// JS for cart page

// Khai báo sẵn hàm showNotification nếu chưa có
window.showNotification = window.showNotification || function(msg, type) {
    alert((type === 'error' ? 'Lỗi: ' : 'Thông báo: ') + msg);
};

// Biến toàn cục
let selectedPaymentMethod = 'cod';
let selectedAddressId = 0;
let cartAddresses = [];
let appliedVoucherCode = '';
let discountAmount = 0;
let currentCartSubtotal = 0;
const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

// Bản đồ 63 tỉnh/thành -> quận/huyện (Đồng bộ chuẩn 100% với trang Profile)
const districtsByProvince = {
    "An Giang": ["TP Long Xuyên", "TP Châu Đốc", "Thị xã Tân Châu", "An Phú", "Tịnh Biên", "Tri Tôn", "Châu Phú", "Châu Thành", "Thoại Sơn", "Chợ Mới", "Phú Tân"],
    "Bà Rịa - Vũng Tàu": ["TP Vũng Tàu", "TP Bà Rịa", "Thị xã Phú Mỹ", "Long Điền", "Đất Đỏ", "Xuyên Mộc", "Châu Đức", "Côn Đảo"],
    "Bạc Liêu": ["TP Bạc Liêu", "Thị xã Giá Rai", "Hồng Dân", "Phước Long", "Vĩnh Lợi", "Đông Hải", "Hòa Bình"],
    "Bắc Giang": ["TP Bắc Giang", "Thị xã Việt Yên", "Hiệp Hòa", "Lạng Giang", "Lục Nam", "Lục Ngạn", "Sơn Động", "Tân Yên", "Yên Dũng", "Yên Thế"],
    "Bắc Kạn": ["TP Bắc Kạn", "Pác Nặm", "Ba Bể", "Ngân Sơn", "Bạch Thông", "Chợ Đồn", "Chợ Mới", "Na Rì"],
    "Bắc Ninh": ["TP Bắc Ninh", "Thị xã Từ Sơn", "Thị xã Quế Võ", "Thị xã Thuận Thành", "Gia Bình", "Lương Tài", "Tiên Du", "Yên Phong"],
    "Bến Tre": ["TP Bến Tre", "Châu Thành", "Chợ Lách", "Mỏ Cày Bắc", "Mỏ Cày Nam", "Giồng Trôm", "Ba Tri", "Thạnh Phú", "Bình Đại"],
    "Bình Dương": ["TP Thủ Dầu Một", "TP Thuận An", "TP Dĩ An", "TP Tân Uyên", "TP Bến Cát", "Bàu Bàng", "Dầu Tiếng", "Phú Giáo", "Bắc Tân Uyên"],
    "Bình Định": ["TP Quy Nhơn", "Thị xã An Nhơn", "Thị xã Hoài Nhơn", "An Lão", "Phù Cát", "Phù Mỹ", "Tuy Phước", "Tây Sơn", "Vân Canh", "Vĩnh Thạnh", "Hoài Ân"],
    "Bình Phước": ["TP Đồng Xoài", "Thị xã Phước Long", "Thị xã Bình Long", "Thị xã Chơn Thành", "Đồng Phú", "Bù Đăng", "Bù Đốp", "Bù Gia Mập", "Lộc Ninh", "Hớn Quản", "Phú Riềng"],
    "Bình Thuận": ["TP Phan Thiết", "Thị xã La Gi", "Tuy Phong", "Bắc Bình", "Hàm Thuận Bắc", "Hàm Thuận Nam", "Tánh Linh", "Đức Linh", "Hàm Tân", "Phú Quý"],
    "Cà Mau": ["TP Cà Mau", "U Minh", "Thới Bình", "Trần Văn Thời", "Cái Nước", "Đầm Dơi", "Năm Căn", "Phú Tân", "Ngọc Hiển"],
    "Cao Bằng": ["TP Cao Bằng", "Bảo Lạc", "Bảo Lâm", "Hạ Lang", "Hà Quảng", "Hòa An", "Nguyên Bình", "Quảng Hòa", "Thạch An", "Trùng Khánh"],
    "Cần Thơ": ["Quận Ninh Kiều", "Quận Bình Thủy", "Quận Cái Răng", "Quận Ô Môn", "Quận Thốt Nốt", "Phong Điền", "Cờ Đỏ", "Vĩnh Thạnh", "Thới Lai"],
    "Đà Nẵng": ["Quận Hải Châu", "Quận Thanh Khê", "Quận Sơn Trà", "Quận Ngũ Hành Sơn", "Quận Liên Chiểu", "Quận Cẩm Lệ", "Hòa Vang", "Hoàng Sa"],
    "Đắk Lắk": ["TP Buôn Ma Thuột", "Thị xã Buôn Hồ", "Ea H'leo", "Ea Súp", "Krông Năng", "Krông Búk", "Buôn Đôn", "Cư M'gar", "Krông Pắc", "Krông Bông", "Krông Ana", "Lắk", "M'Drắk", "Ea Kar"],
    "Đắk Nông": ["TP Gia Nghĩa", "Đắk Glong", "Đắk Mil", "Đắk R'lấp", "Đắk Song", "Krông Nô", "Tuy Đức", "Cư Jút"],
    "Điện Biên": ["TP Điện Biên Phủ", "Thị xã Mường Lay", "Điện Biên", "Điện Biên Đông", "Mường Ảng", "Mường Chà", "Mường Nhé", "Nậm Pồ", "Tủa Chùa", "Tuần Giáo"],
    "Đồng Nai": ["TP Biên Hòa", "TP Long Khánh", "Long Thành", "Nhơn Trạch", "Trảng Bom", "Thống Nhất", "Cẩm Mỹ", "Vĩnh Cửu", "Xuân Lộc", "Định Quán", "Tân Phú"],
    "Đồng Tháp": ["TP Cao Lãnh", "TP Sa Đéc", "TP Hồng Ngự", "Tân Hồng", "Thanh Bình", "Tháp Mười", "Cao Lãnh", "Lấp Vò", "Lai Vung", "Châu Thành"],
    "Gia Lai": ["TP Pleiku", "Thị xã An Khê", "Thị xã Ayun Pa", "Chư Păh", "Chư Prông", "Chư Sê", "Đắk Đoa", "Chư Pưh", "Phú Thiện", "Mang Yang", "Krông Pa", "Kông Chro", "K'Pang", "Ia Pa", "Ia Grai", "Đức Cơ", "Đắk Pơ"],
    "Hà Giang": ["TP Hà Giang", "Bắc Mê", "Bắc Quang", "Đồng Văn", "Hoàng Su Phì", "Mèo Vạc", "Quản Bạ", "Quang Bình", "Vị Xuyên", "Xín Mần", "Yên Minh"],
    "Hà Nam": ["TP Phủ Lý", "Thị xã Duy Tiên", "Kim Bảng", "Lý Nhân", "Thanh Liêm", "Bình Lục"],
    "Hà Nội": ["Quận Ba Đình", "Quận Hoàn Kiếm", "Quận Tây Hồ", "Quận Long Biên", "Quận Cầu Giấy", "Quận Đống Đa", "Quận Hai Bà Trưng", "Quận Hoàng Mai", "Quận Thanh Xuân", "Quận Nam Từ Liêm", "Quận Bắc Từ Liêm", "Quận Hà Đông", "Thị xã Sơn Tây", "Ba Vì", "Chương Mỹ", "Đan Phượng", "Đông Anh", "Gia Lâm", "Hoài Đức", "Mê Linh", "Mỹ Đức", "Phú Xuyên", "Phúc Thọ", "Quốc Oai", "Sóc Sơn", "Thạch Thất", "Thanh Oai", "Thanh Trì", "Thường Tín", "Ứng Hòa"],
    "Hà Tĩnh": ["TP Hà Tĩnh", "Thị xã Hồng Lĩnh", "Thị xã Kỳ Anh", "Can Lộc", "Cẩm Xuyên", "Đức Thọ", "Hương Khê", "Hương Sơn", "Kỳ Anh", "Lộc Hà", "Nghi Xuân", "Thạch Hà", "Vũ Quang"],
    "Hải Dương": ["TP Hải Dương", "TP Chí Linh", "Thị xã Kinh Môn", "Bình Giang", "Cẩm Giàng", "Gia Lộc", "Kim Thành", "Nam Sách", "Ninh Giang", "Thanh Hà", "Thanh Miện", "Tứ Kỳ"],
    "Hải Phòng": ["Quận Hồng Bàng", "Quận Ngô Quyền", "Quận Lê Chân", "Quận Kiến An", "Quận Hải An", "Quận Đồ Sơn", "Quận Dương Kinh", "An Dương", "An Lão", "Kiến Thụy", "Thủy Nguyên", "Tiên Lãng", "Vĩnh Bảo", "Bạch Long Vĩ", "Cát Hải"],
    "Hậu Giang": ["TP Vị Thanh", "TP Ngã Bảy", "Thị xã Long Mỹ", "Châu Thành", "Châu Thành A", "Long Mỹ", "Phụng Hiệp", "Vị Thủy"],
    "Hòa Bình": ["TP Hòa Bình", "Cao Phong", "Đà Bắc", "Kim Bôi", "Lạc Sơn", "Lạc Thủy", "Lương Sơn", "Mai Châu", "Tân Lạc", "Yên Thủy"],
    "Hưng Yên": ["TP Hưng Yên", "Thị xã Mỹ Hào", "Ân Thi", "Khoái Châu", "Kim Động", "Phù Cừ", "Tiên Lữ", "Văn Giang", "Văn Lâm", "Yên Mỹ"],
    "Khánh Hòa": ["TP Nha Trang", "TP Cam Ranh", "Thị xã Ninh Hòa", "Vạn Ninh", "Diên Khánh", "Khánh Vĩnh", "Khánh Sơn", "Cam Lâm", "Trường Sa"],
    "Kiên Giang": ["TP Rạch Giá", "TP Hà Tiên", "TP Phú Quốc", "An Biên", "An Minh", "Châu Thành", "Giang Thành", "Giồng Riềng", "Gò Quao", "Hòn Đất", "Kiên Hải", "Kiên Lương", "Tân Hiệp", "U Minh Thượng", "Vĩnh Thuận"],
    "Kon Tum": ["TP Kon Tum", "Đắk Glei", "Đắk Hà", "Đắk Tô", "Ia H'Drai", "Kon Plông", "Kon Rẫy", "Ngọc Hồi", "Sa Thầy", "Tu Mơ Rông"],
    "Lai Châu": ["TP Lai Châu", "Mường Tè", "Nậm Nhùn", "Phong Thổ", "Sìn Hồ", "Tam Đường", "Tân Uyên", "Than Uyên"],
    "Lạng Sơn": ["TP Lạng Sơn", "Bắc Sơn", "Bình Gia", "Cao Lộc", "Chi Lăng", "Đình Lập", "Hữu Lũng", "Lộc Bình", "Phục Hòa", "Tràng Định", "Văn Lãng", "Văn Quan"],
    "Lào Cai": ["TP Lào Cai", "Thị xã Sa Pa", "Bát Xát", "Bảo Thắng", "Bảo Yên", "Bắc Hà", "Mường Khương", "Si Ma Cai", "Văn Bàn"],
    "Lâm Đồng": ["TP Đà Lạt", "TP Bảo Lộc", "Bảo Lâm", "Cát Tiên", "Di Linh", "Đạ Huoai", "Đạ Tẻh", "Đam Rông", "Đơn Dương", "Đức Trọng", "Lạc Dương", "Lâm Hà"],
    "Long An": ["TP Tân An", "Thị xã Kiến Tường", "Bến Lức", "Cần Đước", "Cần Giuộc", "Châu Thành", "Đức Hòa", "Đức Huệ", "Mộc Hóa", "Tân Trụ", "Thủ Thừa", "Thạnh Hóa", "Tân Thạnh", "Vĩnh Hưng", "Tân Hưng"],
    "Nam Định": ["TP Nam Định", "Vụ Bản", "Ý Yên", "Mỹ Lộc", "Nam Trực", "Trực Ninh", "Xuân Trường", "Giao Thủy", "Hải Hậu", "Nghĩa Hưng"],
    "Nghệ An": ["TP Vinh", "Thị xã Cửa Lò", "Thị xã Thái Hòa", "Thị xã Hoàng Mai", "Anh Sơn", "Con Cuông", "Diễn Châu", "Đô Lương", "Hưng Nguyên", "Kỳ Sơn", "Nam Đàn", "Nghi Lộc", "Nghĩa Đàn", "Quế Phong", "Quỳ Châu", "Quỳ Hợp", "Quỳnh Lưu", "Tân Kỳ", "Thanh Chương", "Tương Dương", "Yên Thành"],
    "Ninh Bình": ["TP Ninh Bình", "TP Tam Điệp", "Gia Viễn", "Hoa Lư", "Kim Sơn", "Nho Quan", "Yên Khánh", "Yên Mô"],
    "Ninh Thuận": ["TP Phan Rang - Tháp Chàm", "Bác Ái", "Ninh Hải", "Ninh Phước", "Ninh Sơn", "Thuận Bắc", "Thuận Nam"],
    "Phú Thọ": ["TP Việt Trì", "Thị xã Phú Thọ", "Cẩm Khê", "Đoan Hùng", "Hạ Hòa", "Lâm Thao", "Phù Ninh", "Tam Nông", "Tân Sơn", "Thanh Ba", "Thanh Sơn", "Thanh Thủy", "Yên Lập"],
    "Phú Yên": ["TP Tuy Hòa", "Thị xã Sông Cầu", "Thị xã Đông Hòa", "Đồng Xuân", "Sông Hinh", "Sơn Hòa", "Phú Hòa", "Tây Hòa", "Tuy An"],
    "Quảng Bình": ["TP Đồng Hới", "Thị xã Ba Đồn", "Lệ Thủy", "Minh Hóa", "Quảng Ninh", "Quảng Trạch", "Tuyên Hóa", "Tuyên Ninh"],
    "Quảng Nam": ["TP Tam Kỳ", "TP Hội An", "Thị xã Điện Bàn", "Bắc Trà My", "Duy Xuyên", "Đại Lộc", "Đông Giang", "Hiệp Đức", "Nam Giang", "Nam Trà My", "Nông Sơn", "Núi Thành", "Phú Ninh", "Phước Sơn", "Quế Sơn", "Tây Giang", "Thăng Bình", "Tiên Phước"],
    "Quảng Ngãi": ["TP Quảng Ngãi", "Thị xã Đức Phổ", "Ba Tơ", "Bình Sơn", "Lý Sơn", "Minh Long", "Mộ Đức", "Nghĩa Hành", "Sơn Hà", "Sơn Tây", "Sơn Tịnh", "Trà Bồng", "Tư Nghĩa"],
    "Quảng Ninh": ["TP Hạ Long", "TP Móng Cái", "TP Cẩm Phả", "TP Uông Bí", "Thị xã Đông Triều", "Thị xã Quảng Yên", "Vân Đồn", "Tiên Yên", "Hải Hà", "Cô Tô", "Đầm Hà", "Bình Liêu", "Ba Chẽ"],
    "Quảng Trị": ["TP Đông Hà", "Thị xã Quảng Trị", "Cam Lộ", "Cồn Cỏ", "Đa Krông", "Gio Linh", "Hải Lăng", "Hướng Hóa", "Triệu Phong", "Vĩnh Linh"],
    "Sóc Trăng": ["TP Sóc Trăng", "Thị xã Vĩnh Châu", "Thị xã Ngã Năm", "Châu Thành", "Cù Lao Dung", "Kế Sách", "Long Phú", "Mỹ Tú", "Mỹ Xuyên", "Thạnh Trị", "Trần Đề"],
    "Sơn La": ["TP Sơn La", "Bắc Yên", "Mai Sơn", "Mộc Châu", "Mường La", "Phù Yên", "Quỳnh Nhai", "Sông Mã", "Sốp Cộp", "Thuận Châu", "Vân Hồ", "Yên Châu"],
    "Tây Ninh": ["TP Tây Ninh", "Thị xã Trảng Bàng", "Thị xã Hòa Thành", "Bến Cầu", "Châu Thành", "Dương Minh Châu", "Gò Dầu", "Tân Biên", "Tân Châu"],
    "Thái Bình": ["TP Thái Bình", "Đông Hưng", "Hưng Hà", "Kiến Xương", "Quỳnh Phụ", "Thái Thụy", "Tiền Hải", "Vũ Thư"],
    "Thái Nguyên": ["TP Thái Nguyên", "TP Sông Công", "TP Phổ Yên", "Đại Từ", "Định Hóa", "Đồng Hỷ", "Phú Bình", "Phú Lương", "Võ Nhai"],
    "Thanh Hóa": ["TP Thanh Hóa", "TP Sầm Sơn", "Thị xã Bỉm Sơn", "Thị xã Nghi Sơn", "Bá Thước", "Cẩm Thủy", "Đông Sơn", "Hà Trung", "Hậu Lộc", "Hoằng Hóa", "Lang Chánh", "Mường Lát", "Nga Sơn", "Ngọc Lặc", "Như Xuân", "Như Thanh", "Nông Cống", "Quan Hóa", "Quan Sơn", "Quảng Xương", "Thạch Thành", "Thiệu Hóa", "Thọ Xuân", "Thường Xuân", "Triệu Sơn", "Vĩnh Lộc", "Yên Định"],
    "Thừa Thiên Huế": ["TP Huế", "Thị xã Hương Thủy", "Thị xã Hương Trà", "A Lưới", "Nam Đông", "Phong Điền", "Phú Lộc", "Phú Vang", "Quảng Điền"],
    "Tiền Giang": ["TP Mỹ Tho", "Thị xã Gò Công", "Thị xã Cai Lậy", "Cái Bè", "Châu Thành", "Chợ Gạo", "Gò Công Đông", "Gò Công Tây", "Tân Phước", "Tân Phú Đông"],
    "TP Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 10", "Quận 11", "Quận 12", "TP Thủ Đức", "Bình Tân", "Bình Thạnh", "Gò Vấp", "Phú Nhuận", "Tân Bình", "Tân Phú", "Bình Chánh", "Cần Giờ", "Củ Chi", "Hóc Môn", "Nhà Bè"],
    "Trà Vinh": ["TP Trà Vinh", "Thị xã Duyên Hải", "Càng Long", "Cầu Kè", "Cầu Ngang", "Châu Thành", "Duyên Hải", "Tiểu Cần", "Trà Cú"],
    "Tuyên Quang": ["TP Tuyên Quang", "Chiêm Hóa", "Hàm Yên", "Lâm Bình", "Na Hang", "Sơn Dương", "Yên Sơn"],
    "Vĩnh Long": ["TP Vĩnh Long", "Thị xã Bình Minh", "Bình Tân", "Long Hồ", "Mang Thít", "Tam Bình", "Trà Ôn", "Vũng Liêm"],
    "Vĩnh Phúc": ["TP Vĩnh Yên", "TP Phúc Yên", "Bình Xuyên", "Lập Thạch", "Sông Lô", "Tam Đảo", "Tam Dương", "Vĩnh Tường", "Yên Lạc"],
    "Yên Bái": ["TP Yên Bái", "Thị xã Nghĩa Lộ", "Lục Yên", "Mù Cang Chải", "Trạm Tấu", "Trấn Yên", "Văn Chấn", "Văn Yên", "Yên Bình"]
};

document.addEventListener('DOMContentLoaded', async () => {
    loadCart();
    loadAddressOptions();
    initPaymentMethod();
    initVoucher();
    
    // Xử lý thanh toán
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            let addressId = selectedAddressId || 0;
            
            if (addressId <= 0) {
                const confirmRedirect = confirm('Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ trước khi thanh toán.\n\nBạn có muốn chuyển đến trang cá nhân để thêm địa chỉ không?');
                if (confirmRedirect) {
                    window.location.href = 'profile.php';
                }
                return;
            }
            
            const paymentMethod = selectedPaymentMethod || 'cod';
            if (paymentMethod === 'bank') {
                showNotification('Đang bảo trì cổng thanh toán. Vui lòng chọn phương thức thanh toán khác.', 'error');
                selectedPaymentMethod = 'cod';
                const codRadio = document.querySelector('input[name="payment-method"][value="cod"]');
                if (codRadio) {
                    codRadio.checked = true;
                }
                return;
            }
            
            const voucherCode = appliedVoucherCode || '';
            try {
                const res = await fetch('api/checkout.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address_id: addressId, voucher_code: voucherCode, payment_method: paymentMethod })
                });
                const data = await res.json();
                if (data.success) {
                    const message = 'Đã đặt đơn hàng thành công!\nMã đơn: ' + data.order_id + '\nThành tiền: ' + Number(data.final_total).toLocaleString() + '₫';
                    showNotification(message, 'success');
                    appliedVoucherCode = '';
                    discountAmount = 0;
                    loadCart();
                    loadAddressOptions();
                    initPaymentMethod();
                    updateTotals(0);
                } else {
                    showNotification(data.message || 'Thanh toán thất bại.', 'error');
                }
            } catch (err) {
                showNotification('Không thể thanh toán.', 'error');
            }
        });
    }
});

async function loadCart() {
    try {
        const res = await fetch('api/get_cart.php');
        const data = await res.json();
        const cartItems = data.items || [];
        const savedItems = data.saved || [];
        const cartTable = document.getElementById('cart-items');
        const savedTable = document.getElementById('saved-items');
        
        cartTable.innerHTML = '';
        savedTable.innerHTML = '';
        
        if (cartItems.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="5" style="text-align:center;">Giỏ hàng của bạn đang trống.</td>`;
            cartTable.appendChild(emptyRow);
        } else {
            cartItems.forEach(item => {
                const row = document.createElement('tr');
                const priceHtml = buildPriceHtml(item);
                const warningHtml = buildStockWarning(item);
                row.innerHTML = `
                    <td>
                        <div class="cart-item-info">
                            ${item.image ? `<img src="assets/images/${item.image}" alt="${item.name}" />` : ''}
                            <div>
                                <strong>${item.name}</strong>
                                ${warningHtml}
                            </div>
                        </div>
                    </td>
                    <td>${priceHtml}</td>
                    <td>
                        <div class="qty-control">
                            <input type="number" min="1" ${item.max_quantity ? `max="${item.max_quantity}"` : ''} value="${item.quantity}" data-id="${item.product_id}" onchange="updateQuantity(this)" />
                        </div>
                    </td>
                    <td>${formatCurrency(item.line_total)}</td>
                    <td>
                        <button onclick="saveForLater(${item.product_id})">Yêu thích</button>
                        <button onclick="removeItem(${item.product_id}, false)">Xóa</button>
                    </td>
                `;
                cartTable.appendChild(row);
            });
        }
        
        if (savedItems.length === 0) {
            const emptySaved = document.createElement('tr');
            emptySaved.innerHTML = `<td colspan="4" style="text-align:center;">Chưa có sản phẩm yêu thích nào.</td>`;
            savedTable.appendChild(emptySaved);
        } else {
            savedItems.forEach(item => {
                const row = document.createElement('tr');
                const priceHtml = buildPriceHtml(item, true);
                row.innerHTML = `
                    <td>
                        <div class="cart-item-info">
                            ${item.image ? `<img src="assets/images/${item.image}" alt="${item.name}" />` : ''}
                            <div><strong>${item.name}</strong></div>
                        </div>
                    </td>
                    <td>${priceHtml}</td>
                    <td>${item.quantity}</td>
                    <td>
                        <button onclick="moveToCart(${item.product_id})">Mua ngay</button>
                        <button onclick="removeItem(${item.product_id}, true)">Xóa</button>
                    </td>
                `;
                savedTable.appendChild(row);
            });
        }
        
        currentCartSubtotal = data.summary ? Number(data.summary.subtotal) || 0 : 0;
        document.getElementById('cart-total').textContent = formatCurrency(currentCartSubtotal);
        updateTotals(currentCartSubtotal);
        
        const lineCount = data.summary ? data.summary.line_count : cartItems.length;
        const text = lineCount > 0 ? `(${lineCount})` : '';
        const cartCount = document.getElementById('cart-count');
        const navCartCount = document.getElementById('nav-cart-count');
        if (cartCount) cartCount.textContent = text;
        if (navCartCount) navCartCount.textContent = text;
    } catch (err) {
        console.error("Lỗi load giỏ hàng: ", err);
    }
}

// Bind sự kiện đổi Tỉnh/Thành phố -> load Quận/Huyện tự động
function bindCartCityDistrictSelects(rootEl = document) {
    const citySelect = rootEl.querySelector('#addr-city');
    const districtSelect = rootEl.querySelector('#addr-district');
    if (!citySelect || !districtSelect) return;

    // Tự động render 63 tỉnh/thành phố vào thẻ select (Đồng bộ Profile)
    if (citySelect.options.length <= 1) {
        citySelect.innerHTML = '<option value="">--- Chọn tỉnh/thành ---</option>';
        const provinces = Object.keys(districtsByProvince).sort();
        provinces.forEach(province => {
            const opt = document.createElement('option');
            opt.value = province;
            opt.textContent = province;
            citySelect.appendChild(opt);
        });
    }

    if (citySelect.dataset.bound === '1') return;
    citySelect.dataset.bound = '1';

    const renderDistricts = () => {
        const val = citySelect.value;
        districtSelect.innerHTML = '<option value="">--- Chọn quận/huyện ---</option>';
        const districts = districtsByProvince[val] || [];
        districts.forEach((d) => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            districtSelect.appendChild(opt);
        });
    };

    citySelect.addEventListener('change', renderDistricts);
}

async function updateQuantity(input) {
    const id = input.dataset.id;
    const quantity = parseInt(input.value);
    try {
        const res = await fetch('api/update_cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, quantity })
        });
        const data = await res.json();
        if (data && data.message) {
            showNotification(data.message, data.success ? 'success' : 'error');
        }
        loadCart();
    } catch (err) {
        console.error(err);
    }
}

async function saveForLater(productId) {
    try {
        await fetch('api/save_for_later.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: productId })
        });
        loadCart();
    } catch (err) {
        console.error(err);
    }
}

async function moveToCart(productId) {
    try {
        await fetch('api/move_to_cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: productId })
        });
        loadCart();
    } catch (err) {
        console.error(err);
    }
}

async function removeItem(productId, saved) {
    try {
        await fetch('api/remove_item.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: productId, saved })
        });
        loadCart();
    } catch (err) {
        console.error(err);
    }
}

async function loadAddressOptions() {
    const container = document.getElementById('address-select-container');
    if (!container) return;
    container.innerHTML = '';
    try {
        const res = await fetch('api/get_addresses.php');
        const addresses = await res.json();
        cartAddresses = Array.isArray(addresses) ? addresses : [];
        if (!Array.isArray(addresses) || addresses.length === 0) {
            container.innerHTML = '<p style="color: #e53935; font-weight: 500;">⚠️ Bạn chưa có địa chỉ giao hàng. <a href="profile.php" style="color: #1a73e8; text-decoration: underline;">Vui lòng thêm địa chỉ tại đây</a> trước khi thanh toán.</p>';
            return;
        }
        
        let currentAddr = null;
        if (selectedAddressId) {
            currentAddr = addresses.find(a => Number(a.id) === Number(selectedAddressId)) || null;
        }
        if (!currentAddr) {
            currentAddr = addresses.find(a => Number(a.is_default) === 1) || addresses[0];
        }
        selectedAddressId = currentAddr ? Number(currentAddr.id) : 0;

        renderCartAddressSummary(currentAddr);

        const changeBtn = document.getElementById('cart-change-address-btn');
        if (changeBtn) {
            changeBtn.addEventListener('click', openCartAddressModal);
        }
    } catch (err) {
        container.innerHTML = '<p>Không thể tải địa chỉ.</p>';
    }
}

function renderCartAddressSummary(addr) {
    const container = document.getElementById('address-select-container');
    if (!container || !addr) return;
    const phoneText = addr.phone ? `(+84) ${addr.phone}` : '';
    const isDefault = Number(addr.is_default) === 1;
    container.innerHTML = `
        <div class="cart-address-summary">
            <div class="cart-address-label">Địa Chỉ Nhận Hàng</div>
            <div class="cart-address-main">
                <strong>${addr.recipient_name}</strong> ${phoneText ? `<span>${phoneText}</span>` : ''} -
                <span>${addr.address}</span>
                ${isDefault ? '<span class="address-default-badge" style="margin-left:6px;">Mặc định</span>' : ''}
            </div>
            <div class="cart-address-change">
                <button type="button" id="cart-change-address-btn" class="btn-link">Thay đổi</button>
            </div>
        </div>
    `;

    const changeBtn = document.getElementById('cart-change-address-btn');
    if (changeBtn) {
        changeBtn.addEventListener('click', openCartAddressModal);
    }
}

async function openCartAddressModal() {
    const overlay = document.getElementById('cart-address-modal-overlay');
    const listEl = document.getElementById('cart-address-list');
    const form = document.getElementById('cart-address-form');
    if (!overlay || !listEl) return;

    try {
        const res = await fetch('api/get_addresses.php');
        const addresses = await res.json();
        cartAddresses = Array.isArray(addresses) ? addresses : [];
    } catch (err) {
        console.error(err);
        cartAddresses = [];
    }

    const titleEl = document.querySelector('.cart-address-modal .address-modal-header h4');
    const confirmBtn = document.getElementById('cart-address-modal-confirm');
    const toggleAddBtn = document.getElementById('cart-address-add-toggle');
    let isAddMode = false;

    if (titleEl) titleEl.textContent = 'Địa Chỉ Của Tôi';
    if (confirmBtn) confirmBtn.textContent = 'Xác nhận';
    if (toggleAddBtn) toggleAddBtn.textContent = '+ Thêm Địa Chỉ Mới';
    if (form) {
        form.classList.add('hidden');
        form.reset();
    }

    listEl.style.display = '';
    listEl.innerHTML = '';
    if (!Array.isArray(cartAddresses) || cartAddresses.length === 0) {
        listEl.innerHTML = '<p>Chưa có địa chỉ giao hàng.</p>';
    } else {
        cartAddresses.forEach(addr => {
            const row = document.createElement('div');
            row.className = 'address-item';
            row.dataset.id = addr.id;
            row.innerHTML = `
                <label class="address-row">
                    <div style="margin-right:10px;">
                        <input type="radio" name="cart-address-radio" value="${addr.id}" ${Number(addr.id) === selectedAddressId ? 'checked' : ''} />
                    </div>
                    <div class="address-main">
                        <p class="address-recipient">
                            <strong>${addr.recipient_name}</strong>
                            ${addr.phone ? `<span class="address-phone">(+84) ${addr.phone}</span>` : ''}
                        </p>
                        <p class="address-text">${addr.address}</p>
                    </div>
                    <div class="address-actions">
                        ${Number(addr.is_default) === 1 ? '<span class="address-default-badge">Mặc định</span>' : ''}
                    </div>
                </label>
            `;
            listEl.appendChild(row);
        });
    }

    overlay.classList.remove('hidden');

    const closeBtn = document.getElementById('cart-address-modal-close');
    const cancelBtn = document.getElementById('cart-address-modal-cancel');

    function switchToListMode() {
        isAddMode = false;
        if (titleEl) titleEl.textContent = 'Địa Chỉ Của Tôi';
        if (listEl) listEl.style.display = '';
        if (toggleAddBtn) toggleAddBtn.textContent = '+ Thêm Địa Chỉ Mới';
        if (form) {
            form.classList.add('hidden');
            form.reset();
        }
        if (confirmBtn) confirmBtn.textContent = 'Xác nhận';
    }

    function switchToAddMode() {
        isAddMode = true;
        if (titleEl) titleEl.textContent = 'Thêm Địa Chỉ Mới';
        if (listEl) listEl.style.display = 'none';
        if (toggleAddBtn) toggleAddBtn.textContent = '← Quay lại danh sách';
        if (form) form.classList.remove('hidden');
        if (confirmBtn) confirmBtn.textContent = 'Lưu';
    }

    function closeModal() {
        overlay.classList.add('hidden');
    }

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            if (isAddMode) {
                switchToListMode();
            } else {
                closeModal();
            }
        };
    }
    overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
    };

    if (toggleAddBtn && form) {
        toggleAddBtn.onclick = () => {
            if (isAddMode) {
                switchToListMode();
            } else {
                switchToAddMode();
                bindCartCityDistrictSelects(overlay);
            }
        };
    }

    if (confirmBtn) {
        confirmBtn.onclick = async () => {
            if (isAddMode) {
                const recipient = overlay.querySelector('#addr-recipient')?.value.trim() || '';
                const email = overlay.querySelector('#addr-email')?.value.trim() || '';
                const phone = overlay.querySelector('#addr-phone')?.value.trim() || '';
                const fullAddress = overlay.querySelector('#addr-address')?.value.trim() || '';
                const city = overlay.querySelector('#addr-city')?.value.trim() || '';
                const district = overlay.querySelector('#addr-district')?.value.trim() || '';
                
                if (!recipient || !email || !fullAddress || !city) {
                    showNotification('Vui lòng nhập đầy đủ tên, email, địa chỉ và tỉnh/thành.', 'error');
                    return;
                }
                
                try {
                    const res = await fetch('api/add_address.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            recipient_name: recipient,
                            email,
                            phone,
                            city,
                            district,
                            address: fullAddress
                        })
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                        showNotification('Đã thêm địa chỉ mới.', 'success');
                        selectedAddressId = Number(data.id) || selectedAddressId;
                        closeModal();
                        loadAddressOptions();
                    } else {
                        showNotification(data.error || 'Không thể thêm địa chỉ', 'error');
                    }
                } catch (err) {
                    console.error(err);
                    showNotification('Có lỗi xảy ra khi thêm địa chỉ.', 'error');
                }
            } else {
                const checked = document.querySelector('input[name="cart-address-radio"]:checked');
                if (checked) {
                    const id = Number(checked.value);
                    const addr = cartAddresses.find(a => Number(a.id) === id);
                    if (addr) {
                        selectedAddressId = id;
                        renderCartAddressSummary(addr);
                    }
                }
                closeModal();
            }
        };
    }
}

function initVoucher() {
    const container = document.getElementById('voucher-container');
    if (!container) return;
    container.innerHTML = '';
    
    const title = document.createElement('p');
    title.textContent = 'Chọn mã giảm giá:';
    title.style.marginBottom = '8px';
    container.appendChild(title);
    
    const select = document.createElement('select');
    select.id = 'voucher-select';
    
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '-- Không sử dụng --';
    select.appendChild(defaultOpt);
    container.appendChild(select);
    
    fetch('api/get_vouchers.php')
        .then(res => res.json())
        .then(list => {
            if (Array.isArray(list) && list.length > 0) {
                list.forEach(v => {
                    const opt = document.createElement('option');
                    opt.value = v.code;
                    let desc = v.discount_type === 'percent' ? `Giảm ${v.discount_value}%` : `Giảm ${Number(v.discount_value).toLocaleString()}₫`;
                    opt.textContent = `${v.code} (${desc})`;
                    select.appendChild(opt);
                });
            } else {
                const noOpt = document.createElement('option');
                noOpt.value = '';
                noOpt.textContent = 'Không có voucher khả dụng';
                select.appendChild(noOpt);
            }
        })
        .catch(err => {
            const errOpt = document.createElement('option');
            errOpt.value = '';
            errOpt.textContent = 'Lỗi tải voucher';
            select.appendChild(errOpt);
            console.error(err);
        });
        
    select.addEventListener('change', async () => {
        const code = select.value;
        if (!code) {
            appliedVoucherCode = '';
            discountAmount = 0;
            document.getElementById('discount-info').textContent = '';
            updateTotals();
            return;
        }
        try {
            const res = await fetch('api/check_voucher.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code })
            });
            const data = await res.json();
            if (data.error) {
                appliedVoucherCode = '';
                discountAmount = 0;
                document.getElementById('discount-info').textContent = data.error;
            } else {
                appliedVoucherCode = data.code;
                document.getElementById('discount-info').textContent = 'Đã áp dụng voucher ' + data.code;
                updateTotals();
            }
        } catch (err) {
            showNotification('Không thể kiểm tra voucher', 'error');
        }
    });
}

function initPaymentMethod() {
    const container = document.getElementById('payment-select-container');
    if (!container) return;
    container.innerHTML = '';
    const title = document.createElement('p');
    title.textContent = 'Chọn phương thức thanh toán:';
    title.style.marginBottom = '8px';
    container.appendChild(title);
    
    const options = [
        { value: 'cod', label: 'Thanh toán khi nhận hàng' },
        { value: 'bank', label: 'Thanh toán qua ngân hàng', disabled: true, notice: 'Đang bảo trì' }
    ];
    
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'payment-options';
    
    options.forEach(opt => {
        const labelEl = document.createElement('label');
        labelEl.className = 'payment-option';
        if (opt.disabled) {
            labelEl.style.opacity = '0.5';
            labelEl.style.cursor = 'not-allowed';
            labelEl.style.position = 'relative';
        }
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'payment-method';
        radio.value = opt.value;
        if (opt.disabled) {
            radio.disabled = true;
        }
        if (opt.value === 'cod' && selectedPaymentMethod !== 'bank') {
            radio.checked = true;
            selectedPaymentMethod = 'cod';
        } else if (opt.value === selectedPaymentMethod && !opt.disabled) {
            radio.checked = true;
        }
        
        radio.addEventListener('change', () => {
            if (opt.value === 'bank') {
                showNotification('Đang bảo trì cổng thanh toán. Vui lòng chọn phương thức thanh toán khác.', 'error');
                selectedPaymentMethod = 'cod';
                const codRadio = document.querySelector('input[name="payment-method"][value="cod"]');
                if (codRadio) {
                    codRadio.checked = true;
                }
            } else {
                selectedPaymentMethod = opt.value;
            }
        });
        
        const span = document.createElement('span');
        span.textContent = opt.label;
        if (opt.notice) {
            const notice = document.createElement('span');
            notice.textContent = ' (' + opt.notice + ')';
            notice.style.color = '#e53935';
            notice.style.fontSize = '12px';
            notice.style.fontWeight = '600';
            span.appendChild(notice);
        }
        
        labelEl.appendChild(radio);
        labelEl.appendChild(span);
        optionsDiv.appendChild(labelEl);
    });
    
    container.appendChild(optionsDiv);
}

function updateTotals(subtotalOverride) {
    if (typeof subtotalOverride === 'number' && !isNaN(subtotalOverride)) {
        currentCartSubtotal = subtotalOverride;
    }
    let total = currentCartSubtotal;
    let final = total;
    
    if (appliedVoucherCode) {
        fetch('api/check_voucher.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: appliedVoucherCode })
        }).then(res => res.json()).then(data => {
            if (!data.error) {
                if (data.type === 'percent') {
                    discountAmount = total * (data.value / 100);
                } else {
                    discountAmount = data.value;
                }
                if (discountAmount > total) discountAmount = total;
                final = total - discountAmount;
                document.getElementById('final-total').textContent = formatCurrency(final);
                document.getElementById('final-total-area').style.display = 'block';
                document.getElementById('discount-info').textContent = 'Đã giảm: ' + formatCurrency(discountAmount);
            }
        }).catch(err => {
            console.error(err);
        });
    } else {
        document.getElementById('final-total-area').style.display = 'none';
        document.getElementById('discount-info').textContent = '';
    }
}

function buildPriceHtml(item, skipSavingText = false) {
    const price = Number(item.price || item.original_price || 0);
    const sale = item.sale_price !== null && item.sale_price !== undefined ? Number(item.sale_price) : null;
    const effective = Number(item.effective_price || item.price || item.original_price || 0);
    if (sale !== null && sale < price) {
        const saving = skipSavingText ? '' : `<p class="saving-text">Tiết kiệm ${formatCurrency(price - sale)}</p>`;
        return `
            <div class="price-stack">
                <span class="sale-price">${formatCurrency(sale)}</span>
                <span class="original-price">${formatCurrency(price)}</span>
                ${saving}
            </div>
        `;
    }
    return `<span class="sale-price">${formatCurrency(effective)}</span>`;
}

function buildStockWarning(item) {
    if (item.is_out_of_stock) {
        return `<p class="stock-warning">Hết hàng - vui lòng xóa sản phẩm khỏi giỏ</p>`;
    }
    if (item.needs_adjustment) {
        return `<p class="stock-warning">Chỉ còn ${item.stock} sản phẩm</p>`;
    }
    if (item.unit_saving > 0) {
        return `<p class="saving-pill">Tiết kiệm ${formatCurrency(item.unit_saving)} mỗi sản phẩm</p>`;
    }
    return '';
}

function formatCurrency(value) {
    return currencyFormatter.format(Number(value || 0));
}