<?php
// Trang chi tiết sản phẩm
include __DIR__ . '/includes/header.php';

// Lấy ID sản phẩm từ query string
require_once __DIR__ . '/database/connect.php';

$productId = 0;
if (isset($_GET['id'])) {
    $productId = (int)$_GET['id'];
} elseif (isset($_GET['product_id'])) {
    // để tương thích nếu chỗ khác dùng product_id
    $productId = (int)$_GET['product_id'];
}

if ($productId <= 0) {
    // xử lý không có ID hợp lệ
    // ví dụ: show thông báo "Sản phẩm không tồn tại"
}

?>

<main class="main-content">
    <section class="product-detail" data-product-id="<?= $productId ?>">
        <div class="product-image">
            <img id="prod-img" src="" alt="Ảnh sản phẩm" />
        </div>
        <div class="product-info">
            <h2 id="prod-name">Đang tải...</h2>
            <p id="prod-desc"></p>
        <div id="prod-specs" class="product-specs"></div>
            <div class="product-price">
                <h3 id="prod-price"></h3>
            </div>
            <div class="quantity">
                <label for="qty">Số lượng:</label>
                <input id="qty" type="number" value="1" min="1" />
            </div>
            <div class="actions">
                <button id="buy-now-btn" class="buy-now">Mua ngay</button>
                <button id="add-cart-btn" class="add-to-cart">🛒 Thêm vào giỏ hàng</button>
            </div>
            <div class="promotion-section">
                <h4>Khuyến mãi đặc biệt (Số lượng có hạn)</h4>
                <ul>
                    <li>🎁 Tặng kèm 1 tuýp súp thưởng Ciao Churu cho đơn hàng từ 300.000đ</li>
                    <li>💸 Giảm thêm 5% khi mua combo Thức ăn và Cát vệ sinh</li>
                    <li>🚚 Miễn phí vận chuyển nội thành cho mọi đơn hàng từ 500.000đ</li>
                </ul>
            </div>
            <div class="product-meta">
                <p><strong>Tình trạng:</strong> <span id="prod-stock"></span></p>
                <p><strong>Danh mục:</strong> <span id="prod-cat"></span></p>
            </div>
            <div class="warranty-section">
                <h4>Chính sách đổi trả & Bảo hành</h4>
                <p>Hỗ trợ đổi trả trong vòng 7 ngày nếu lỗi từ nhà sản xuất hoặc không vừa size (áp dụng với quần áo, phụ kiện). Không áp dụng đổi trả với thức ăn, pate, cát vệ sinh đã bóc vỏ.</p>
            </div>
        </div>
    </section>
    <section class="related-section">
        <h3>🛍️ Sản phẩm liên quan</h3>
        <div id="related-products" class="related-products"></div>
    </section>

    <section class="review-section">
        <h3>⭐ Đánh giá sản phẩm</h3>
        <div id="average-rating">Đang tải...</div>
        <div class="comment-box">
            <h4>Viết đánh giá của bạn:</h4>
            <select id="rating">
                <option value="5">5 ⭐ Tuyệt vời</option>
                <option value="4">4 ⭐ Tốt</option>
                <option value="3">3 ⭐ Trung bình</option>
                <option value="2">2 ⭐ Kém</option>
                <option value="1">1 ⭐ Tệ</option>
            </select>
            <textarea id="comment" placeholder="Chia sẻ cảm nhận..."></textarea>
            <button id="submit-review">Gửi đánh giá</button>
        </div>
        <div class="user-comments" id="comment-list"></div>
    </section>
</main>
<?php include __DIR__ . '/includes/footer.php'; ?>
<script src="assets/js/product_detail.js" defer></script>