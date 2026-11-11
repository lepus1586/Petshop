<?php
// Trang giỏ hàng
include __DIR__ . '/includes/header.php';

// Yêu cầu đăng nhập để truy cập giỏ hàng
if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}
?>

<style>
    /* Ép kích thước hình ảnh trong bảng giỏ hàng và danh sách yêu thích */
    .cart-table img {
        width: 80px; /* Cố định chiều rộng */
        height: 80px; /* Cố định chiều cao */
        object-fit: cover; /* Tự động cắt cúp, tránh méo ảnh */
        border-radius: 8px; /* Bo góc nhẹ cho đẹp */
        border: 1px solid #eee; /* Viền mỏng cho ảnh sáng hơn */
        display: block;
    }
    
    /* Căn chỉnh lại cột chứa hình ảnh và tên sản phẩm cho gọn gàng */
    .cart-table td:first-child {
        display: flex;
        align-items: center;
        gap: 15px; /* Tạo khoảng cách 15px giữa tấm ảnh và tên sản phẩm */
        text-align: left;
    }
</style>

<main class="main-content">
    <h2>Giỏ hàng của bạn</h2>
    <div class="cart-container">
        <h3>Sản phẩm sẽ thanh toán</h3>
        <div class="checkout-options" id="checkout-options" style="margin-bottom:20px;">
            <div id="address-select-container" class="checkout-section cart-address-section"
                style="margin-bottom:10px;"></div>
            <div id="payment-select-container" class="checkout-section" style="margin-bottom:10px;"></div>
            <div id="voucher-container" class="checkout-section" style="margin-bottom:10px;"></div>
            <div id="discount-info" style="font-style: italic; color: #e53935;"></div>
        </div>

        <table class="cart-table" id="cart-table">
            <thead>
                <tr>
                    <th>Sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Tổng</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody id="cart-items">
            </tbody>
        </table>

        <div class="cart-total">
            <strong>Tổng cộng:</strong> <span id="cart-total">0₫</span><br />
            <span id="final-total-area" style="display:none;"><strong>Thành tiền:</strong> <span
                    id="final-total">0₫</span></span>
        </div>
        <button id="checkout-btn">Tiến hành thanh toán</button>
    </div>

    <div class="saved-container">
        <h3>Sản phẩm yêu thích</h3>
        <table class="cart-table" id="saved-table">
            <thead>
                <tr>
                    <th>Sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody id="saved-items">
            </tbody>
        </table>
    </div>

    <div id="cart-address-modal-overlay" class="address-modal-overlay hidden">
        <div class="address-modal cart-address-modal">
            <div class="address-modal-header">
                <h4>Địa Chỉ Của Tôi</h4>
                <button type="button" id="cart-address-modal-close" class="address-modal-close">×</button>
            </div>

            <div id="cart-address-list" class="address-list"></div>

            <button type="button" id="cart-address-add-toggle" class="btn-outline cart-add-address-toggle">
                + Thêm Địa Chỉ Mới
            </button>

            <form id="cart-address-form" class="shipping-form hidden">
                <div class="form-group">
                    <label>Khách hàng: *</label>
                    <input type="text" id="addr-recipient" required />
                </div>
                <div class="form-group">
                    <label>Email: *</label>
                    <input type="email" id="addr-email" required />
                </div>
                <div class="form-group">
                    <label>Số điện thoại:</label>
                    <input type="text" id="addr-phone" />
                </div>

                <div class="form-group">
                    <label>Tỉnh/Thành phố: *</label>
                    <select id="addr-city" required>
                        <option value="">--- Chọn tỉnh/thành ---</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Quận/Huyện:</label>
                    <select id="addr-district">
                        <option value="">--- Chọn quận/huyện ---</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Địa chỉ giao hàng:</label>
                    <textarea id="addr-address" required placeholder="Địa chỉ giao hàng"></textarea>
                </div>
            </form>

            <div class="address-modal-actions">
                <button type="button" id="cart-address-modal-cancel" class="btn-cancel-address">Hủy</button>
                <button type="button" id="cart-address-modal-confirm" class="btn-save-address">Xác nhận</button>
            </div>
        </div>
    </div>
</main>
<?php include __DIR__ . '/includes/footer.php'; ?>
<script src="assets/js/cart.js" defer></script>