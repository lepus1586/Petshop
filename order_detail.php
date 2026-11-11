<?php
// Chi tiết đơn hàng cho người dùng
include __DIR__ . '/includes/header.php';

// Kiểm tra đăng nhập, nếu chưa đăng nhập chuyển hướng
if (!isset($_SESSION['user'])) {
    // Đã sửa: Xóa dấu / ở đầu
    header('Location: login.php');
    exit;
}

// Lấy ID đơn hàng từ query string
$orderId = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($orderId <= 0) {
    echo '<main class="main-content"><p>Đơn hàng không tồn tại.</p></main>';
    include __DIR__ . '/includes/footer.php';
    exit;
}
?>

<main class="main-content order-detail-page">
    <div class="order-detail-header">
        <a href="orders.php" class="order-back-link">← Quay lại đơn hàng</a>
        <h2>Chi tiết đơn hàng #<?php echo htmlspecialchars($orderId); ?></h2>
    </div>

    <div id="order-info">
        <p>Đang tải thông tin đơn hàng...</p>
    </div>

    <table class="cart-table" id="order-items-table">
        <thead>
            <tr>
                <th>Sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Tổng</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    </table>
    <p id="order-total"></p>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>

<script>
    // JS để tải chi tiết đơn hàng
    document.addEventListener('DOMContentLoaded', async () => {
        const orderId = <?php echo $orderId; ?>;
        try {
            // Đã sửa: Xóa dấu / ở đầu đường dẫn API
            const res = await fetch(`api/get_order_detail.php?id=${orderId}`);

            // Nếu server trả lỗi (ví dụ 404 hoặc 500) thì hiển thị thông báo
            if (!res.ok) {
                document.getElementById('order-info').innerHTML = '<p>Lỗi khi tải dữ liệu (Server Error).</p>';
                return;
            }

            let data;
            try {
                data = await res.json();
            } catch (e) {
                document.getElementById('order-info').innerHTML = '<p>Lỗi khi tải dữ liệu (Invalid JSON).</p>';
                return;
            }

            if (!data || !data.items) {
                document.getElementById('order-info').innerHTML = '<p>Không tìm thấy đơn hàng.</p>';
                return;
            }

            const info = data.info;
            const items = data.items;

            // Mapping trạng thái tiếng Anh sang tiếng Việt
            const statusMap = {
                'Pending': 'Chờ xác nhận',
                'Processing': 'Đang xử lý',
                'Shipping': 'Đang vận chuyển',
                'Completed': 'Thành công',
                'Cancelled': 'Đã hủy'
            };

            const viStatus = statusMap[info.status] || info.status;

            // Khởi tạo HTML hiển thị thông tin đơn hàng
            let infoHtml = `
            <div class="order-info-card">
                <p><strong>Mã đơn:</strong> #${info.id}</p>
                <p><strong>Ngày tạo:</strong> ${info.created_at}</p>
                <p><strong>Trạng thái:</strong> <span class="status-badge status-${info.status.toLowerCase()}">${viStatus}</span></p>
            </div>
        `;

            // Hiển thị địa chỉ
            if (info.address) {
                infoHtml += `
                <div class="order-address-card">
                    <p><strong>Địa chỉ nhận hàng:</strong></p>
                    <p>${info.address.recipient_name} - ${info.address.phone || ''}</p>
                    <p>${info.address.address}</p>
                </div>
            `;
            }

            // Hiển thị voucher và giảm giá nếu có
            if (info.voucher_code) {
                infoHtml += `<p><strong>Voucher:</strong> ${info.voucher_code} (-${Number(info.discount).toLocaleString()}₫)</p>`;
            }

            // Tính phí vận chuyển
            const shippingCost = (Number(info.final_total) - Number(info.total) + Number(info.discount));

            infoHtml += `<hr><p><strong>Tổng đơn hàng:</strong> ${Number(info.total).toLocaleString()}₫</p>`;

            if (shippingCost > 0) {
                infoHtml += `<p><strong>Phí vận chuyển:</strong> ${Number(shippingCost).toLocaleString()}₫</p>`;
            }

            infoHtml += `<p class="final-price"><strong>Thành tiền:</strong> ${Number(info.final_total).toLocaleString()}₫</p>`;

            // Nếu có lý do hủy, hiển thị
            if (info.status === 'Cancelled' && info.cancel_reason) {
                infoHtml += `<p class="cancel-reason"><strong>Lý do hủy:</strong> ${info.cancel_reason}</p>`;
            }

            document.getElementById('order-info').innerHTML = infoHtml;

            // Hiển thị danh sách sản phẩm
            const tbody = document.querySelector('#order-items-table tbody');
            tbody.innerHTML = '';

            items.forEach(item => {
                const imgHtml = item.image
                    ? `<div class="order-item-thumb"><img src="assets/images/${item.image}" alt="${item.name}"></div>`
                    : '';

                const row = document.createElement('tr');
                const subtotal = Number(item.price) * Number(item.quantity);

                row.innerHTML = `
                <td class="order-item-product-cell">
                    <div class="order-item-product">
                        ${imgHtml}
                        <div class="order-item-text">
                            <p class="order-item-name">${item.name}</p>
                        </div>
                    </div>
                </td>
                <td>${Number(item.price).toLocaleString()}₫</td>
                <td>${item.quantity}</td>
                <td>${subtotal.toLocaleString()}₫</td>
            `;
                tbody.appendChild(row);
            });

        } catch (err) {
            document.getElementById('order-info').innerHTML = '<p>Lỗi kết nối server.</p>';
            console.error(err);
        }
    });
</script>