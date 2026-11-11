// JS for profile page
// Khai báo sẵn một hàm showNotification phòng hờ trường hợp bạn chưa định nghĩa nó ở file main.js
window.showNotification = window.showNotification || function(msg, type) {
    alert((type === 'error' ? 'Lỗi: ' : 'Thông báo: ') + msg);
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadProfile();
    bindProfileNav();
    bindProfileForms();
    setupAddressModal();
    loadAddresses();

    const citySelect = document.getElementById('addr-city');
    const districtSelect = document.getElementById('addr-district');
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

    if (citySelect && districtSelect) {
        // 1. Tự động render 63 tỉnh/thành phố vào thẻ select từ object districtsByProvince
        const provinces = Object.keys(districtsByProvince).sort();
        provinces.forEach(function(province) {
            const opt = document.createElement('option');
            opt.value = province;
            opt.textContent = province;
            citySelect.appendChild(opt);
        });

        // 2. Lắng nghe sự kiện khi chọn Tỉnh/Thành phố thì load Quận/Huyện tương ứng
        citySelect.addEventListener('change', function() {
            const val = citySelect.value;
            districtSelect.innerHTML = '<option value="">--- Chọn quận/huyện ---</option>';
            if (val && districtsByProvince[val]) {
                districtsByProvince[val].forEach(function(d) {
                    const opt = document.createElement('option');
                    opt.value = d;
                    opt.textContent = d;
                    districtSelect.appendChild(opt);
                });
            }
        });
    }

    loadVouchers();
    updateOrderStat();
    bindChangeAvatar();
});

async function loadProfile() {
    try {
        const res = await fetch('api/get_profile.php');
        const user = await res.json();
        if (user) {
            document.getElementById('profile-name').value = user.name || '';
            document.getElementById('profile-email').value = user.email || '';
            document.getElementById('profile-phone').value = user.phone || '';
            
            // Đã sửa: Load thêm Ngày sinh và Giới tính
            if (user.birthday) {
                document.getElementById('profile-birthday').value = user.birthday;
            }
            if (user.gender) {
                const genderRadio = document.querySelector(`input[name="gender"][value="${user.gender}"]`);
                if (genderRadio) genderRadio.checked = true;
            }

            const nameDisplay = document.getElementById('profile-name-display');
            const emailDisplay = document.getElementById('profile-email-display');
            const phoneDisplay = document.getElementById('profile-phone-display');
            const sidebarName = document.getElementById('sidebar-name-display');
            const avatarPreview = document.getElementById('avatar-preview');
            const sidebarAvatar = document.getElementById('sidebar-avatar');

            const displayName = user.name || 'Người dùng';
            const displayEmail = user.email || 'Chưa có email';
            const displayPhone = user.phone || 'Chưa cập nhật số điện thoại';

            if (nameDisplay) nameDisplay.textContent = displayName;
            if (emailDisplay) emailDisplay.textContent = displayEmail;
            if (phoneDisplay) phoneDisplay.textContent = displayPhone;
            if (sidebarName) sidebarName.textContent = displayName;

            const avatarSrc = user.avatar
                ? 'assets/images/avatars/' + user.avatar
                : 'assets/images/default-avatar.png';
            if (avatarPreview) avatarPreview.src = avatarSrc;
            if (sidebarAvatar) sidebarAvatar.src = avatarSrc;
        }
    } catch (err) {
        console.error(err);
    }
}

function bindProfileNav() {
    const navLinks = document.querySelectorAll('.profile-nav a[data-section], .profile-shortcut[data-section]');
    const sectionLinks = document.querySelectorAll('.profile-nav a[data-section]');
    const sections = document.querySelectorAll('.profile-section');

    function showSection(id) {
        sections.forEach(sec => sec.classList.add('hidden'));
        const target = document.getElementById(id + '-section');
        if (target) target.classList.remove('hidden');
        if (id === 'orders') {
            loadOrders();
        }
        sectionLinks.forEach(l => {
            const secId = l.getAttribute('data-section');
            l.classList.toggle('active', secId === id);
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            if (!sectionId) return;
            showSection(sectionId);
        });
    });

    showSection('account');
}

function bindProfileForms() {
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Đã sửa: Lấy thêm giới tính và ngày sinh vào Payload
            const genderEl = document.querySelector('input[name="gender"]:checked');
            
            const payload = {
                name: document.getElementById('profile-name').value,
                email: document.getElementById('profile-email').value,
                phone: document.getElementById('profile-phone').value,
                birthday: document.getElementById('profile-birthday').value,
                gender: genderEl ? genderEl.value : null
            };
            
            try {
                const res = await fetch('api/update_profile.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                showNotification(data.message || 'Đã cập nhật thông tin.', 'success');
                loadProfile(); // Tải lại để cập nhật hiển thị
            } catch (err) {
                showNotification('Không thể cập nhật thông tin.', 'error');
            }
        });
    }
    
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const oldPassword = document.getElementById('old-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (newPassword !== confirmPassword) {
                showNotification('Mật khẩu mới và xác nhận không khớp.', 'error');
                return;
            }
            
            try {
                const res = await fetch('api/change_password.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
                });
                const data = await res.json();
                showNotification(data.message || 'Đã đổi mật khẩu.', 'success');
                document.getElementById('old-password').value = '';
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';
            } catch (err) {
                showNotification('Không thể đổi mật khẩu.', 'error');
            }
        });
    }
}

function bindChangeAvatar() {
    const fileInput = document.getElementById('avatar-input');
    const changeBtn = document.getElementById('change-avatar-btn');
    if (!fileInput || !changeBtn) return;
    
    changeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
    });
    
    fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;
        const img = new Image();
        img.onload = async function() {
            const side = Math.min(img.width, img.height);
            const sx = (img.width - side) / 2;
            const sy = (img.height - side) / 2;
            const canvas = document.createElement('canvas');
            canvas.width = side;
            canvas.height = side;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, sx, sy, side, side, 0, 0, side, side);
            
            const preview = document.getElementById('avatar-preview');
            if (preview) {
                preview.src = canvas.toDataURL('image/png');
            }
            
            canvas.toBlob(async (blob) => {
                const formData = new FormData();
                formData.append('avatar', blob, file.name);
                try {
                    const res = await fetch('api/upload_avatar.php', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await res.json();
                    if (data.success) {
                        preview.src = 'assets/images/avatars/' + data.avatar;
                        showNotification('Đã cập nhật ảnh đại diện.', 'success');
                    } else {
                        showNotification(data.message || 'Lỗi tải ảnh', 'error');
                    }
                } catch (err) {
                    showNotification('Không thể tải ảnh.', 'error');
                }
            }, 'image/png');
        };
        img.src = URL.createObjectURL(file);
    });
}

async function loadAddresses() {
    try {
        const res = await fetch('api/get_addresses.php');
        const list = await res.json();
        const container = document.getElementById('address-list');
        if (!container) return;
        container.innerHTML = '';
        if (!Array.isArray(list) || list.length === 0) {
            container.innerHTML = '<p>Chưa có địa chỉ giao hàng.</p>';
            const addressStat = document.getElementById('stat-address-count');
            if (addressStat) addressStat.textContent = '0';
            return;
        }
        const addressStat = document.getElementById('stat-address-count');
        if (addressStat) addressStat.textContent = list.length;
        
        list.forEach((addr) => {
            const div = document.createElement('div');
            div.className = 'address-item';
            div.dataset.id = addr.id;
            div.dataset.recipient = addr.recipient_name || '';
            div.dataset.email = addr.email || '';
            div.dataset.phone = addr.phone || '';
            div.dataset.city = addr.city || '';
            div.dataset.district = addr.district || '';
            div.dataset.address = addr.address || '';
            
            const isDefault = Number(addr.is_default) === 1;
            div.innerHTML = `
                <div class="address-row">
                    <div class="address-main">
                        <p class="address-recipient">
                            <strong>${addr.recipient_name}</strong>
                            ${addr.phone ? `<span class="address-phone">(+84) ${addr.phone}</span>` : ''}
                        </p>
                        <p class="address-text">${addr.address}</p>
                    </div>
                    <div class="address-actions">
                        ${isDefault ? '<span class="address-default-badge">Mặc định</span>' : ''}
                        <button class="btn-link btn-edit-address">Cập nhật</button>
                        <button class="btn-link btn-delete-address">Xóa</button>
                        ${!isDefault ? '<button class="btn-outline btn-set-default">Thiết lập mặc định</button>' : ''}
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
        bindAddressItemEvents();
    } catch (err) {
        console.error(err);
    }
}

let currentAddressId = null;

function setupAddressModal() {
    const openBtn = document.getElementById('open-address-modal');
    const overlay = document.getElementById('address-modal-overlay');
    const closeBtn = document.getElementById('close-address-modal');
    const cancelBtn = document.getElementById('cancel-address-modal');
    const form = document.getElementById('address-form');
    const titleEl = document.getElementById('address-modal-title');

    if (!overlay || !form) return;

    document.addEventListener('openAddressModal', (e) => {
        const { mode, addr } = e.detail || {};
        openModal(mode, addr);
    });

    function openModal(mode, addr) {
        overlay.classList.remove('hidden');
        document.body.classList.add('no-scroll');
        if (mode === 'edit' && addr) {
            titleEl.textContent = 'Cập nhật địa chỉ';
            currentAddressId = addr.id;
            document.getElementById('addr-recipient').value = addr.recipient || '';
            document.getElementById('addr-email').value = addr.email || '';
            document.getElementById('addr-phone').value = addr.phone || '';
            document.getElementById('addr-city').value = addr.city || '';
            const event = new Event('change');
            document.getElementById('addr-city').dispatchEvent(event);
            document.getElementById('addr-district').value = addr.district || '';
            document.getElementById('addr-address').value = addr.address || '';
        } else {
            titleEl.textContent = 'Thêm địa chỉ mới';
            currentAddressId = null;
            form.reset();
        }
    }

    function closeModal() {
        overlay.classList.add('hidden');
        document.body.classList.remove('no-scroll');
        currentAddressId = null;
    }

    if (openBtn) openBtn.addEventListener('click', () => openModal('add'));
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            recipient_name: document.getElementById('addr-recipient').value.trim(),
            email: document.getElementById('addr-email').value.trim(),
            phone: document.getElementById('addr-phone').value.trim(),
            city: document.getElementById('addr-city').value.trim(),
            district: document.getElementById('addr-district').value.trim(),
            address: document.getElementById('addr-address').value.trim()
        };

        const url = currentAddressId ? 'api/update_address.php' : 'api/add_address.php';
        if (currentAddressId) {
            payload.id = currentAddressId;
        }

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                showNotification(data.error || 'Không thể lưu địa chỉ', 'error');
                return;
            }
            showNotification(data.message || 'Đã lưu địa chỉ.', 'success');
            closeModal();
            loadAddresses();
        } catch (err) {
            console.error(err);
            showNotification('Có lỗi xảy ra, vui lòng thử lại.', 'error');
        }
    });
}

function bindAddressItemEvents() {
    document.querySelectorAll('.btn-delete-address').forEach(btn => {
        btn.addEventListener('click', async () => {
            const wrapper = btn.closest('.address-item');
            const id = wrapper?.dataset.id;
            if (!id) return;
            if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
            
            try {
                const res = await fetch('api/delete_address.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: Number(id) })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    showNotification(data.message || 'Đã xóa địa chỉ.', 'success');
                    loadAddresses();
                } else {
                    showNotification(data.error || 'Không thể xóa địa chỉ', 'error');
                }
            } catch (err) {
                showNotification('Lỗi xóa địa chỉ', 'error');
            }
        });
    });

    document.querySelectorAll('.btn-edit-address').forEach(btn => {
        btn.addEventListener('click', () => {
            const wrapper = btn.closest('.address-item');
            if (!wrapper) return;
            const addr = {
                id: wrapper.dataset.id,
                recipient: wrapper.dataset.recipient,
                email: wrapper.dataset.email,
                phone: wrapper.dataset.phone,
                city: wrapper.dataset.city,
                district: wrapper.dataset.district,
                address: wrapper.dataset.address
            };
            const openEvent = new CustomEvent('openAddressModal', { detail: { mode: 'edit', addr } });
            document.dispatchEvent(openEvent);
        });
    });

    document.querySelectorAll('.btn-set-default').forEach(btn => {
        btn.addEventListener('click', async () => {
            const wrapper = btn.closest('.address-item');
            const id = wrapper?.dataset.id;
            if (!wrapper || !id) return;
            
            try {
                const res = await fetch('api/set_default_address.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: Number(id) })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    showNotification(data.message || 'Đã đặt địa chỉ mặc định.', 'success');
                    loadAddresses();
                } else {
                    showNotification(data.error || 'Không thể đặt địa chỉ mặc định', 'error');
                }
            } catch (err) {
                showNotification('Lỗi khi đặt địa chỉ mặc định', 'error');
            }
        });
    });
}

async function loadVouchers() {
    try {
        const res = await fetch('api/get_vouchers.php');
        const vouchers = await res.json();
        const container = document.getElementById('voucher-list');
        if (!container) return;
        
        container.innerHTML = '';
        if (!Array.isArray(vouchers) || vouchers.length === 0) {
            container.innerHTML = '<p>Không có voucher khả dụng.</p>';
            const voucherStat = document.getElementById('stat-voucher-count');
            if (voucherStat) voucherStat.textContent = '0';
            return;
        }
        
        const voucherStat = document.getElementById('stat-voucher-count');
        if (voucherStat) voucherStat.textContent = vouchers.length;
        
        vouchers.forEach(v => {
            const div = document.createElement('div');
            div.className = 'voucher-item';
            let discountText = v.discount_type === 'percent' ? `${v.discount_value}%` : `${Number(v.discount_value).toLocaleString()}₫`;
            div.innerHTML = `<p><strong>${v.code}</strong> - Giảm: ${discountText} - HSD: ${v.expiration_date}</p>`;
            container.appendChild(div);
        });
    } catch (err) {
        console.error(err);
    }
}

async function updateOrderStat() {
    try {
        const res = await fetch('api/get_order_history.php');
        const orders = await res.json();
        const orderStat = document.getElementById('stat-order-count');
        if (orderStat && Array.isArray(orders)) {
            orderStat.textContent = orders.length;
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadOrders() {
    // Đã sửa: ID là 'orders-list' theo như file HTML
    const container = document.getElementById('orders-list');
    if (!container) return;
    
    // (Phần này bạn có thể viết thêm logic gọi API get đơn hàng sau nhé)
}

async function loadSavedList() {
    try {
        const res = await fetch('api/get_saved_list.php');
        const items = await res.json();
        const container = document.getElementById('saved-list');
        if (!container) return;
        
        container.innerHTML = '';
        if (items.length === 0) {
            container.innerHTML = '<p>Không có sản phẩm nào lưu.</p>';
            return;
        }
        
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'saved-item';
            div.innerHTML = `${item.name} - ${Number(item.price).toLocaleString()}₫ (x${item.quantity})`;
            container.appendChild(div);
        });
    } catch (err) {
        console.error(err);
    }
}