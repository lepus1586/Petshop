<?php
// Global footer include
?>
<footer class="footer">
    <div class="footer-content">
        <p>© <?php echo date('Y'); ?> PetShop. Bản quyền thuộc về PetShop.</p>
        <p>Liên hệ: <a href="mailto:support@petshop.vn">support@petshop.vn</a> | Hotline: 0987 654 321</p>
        <p>
            <a href="terms.php">Điều khoản dịch vụ</a> |
            <a href="privacy.php">Chính sách bảo mật</a>
        </p>
    </div>
</footer>

<div id="chatbox-container" class="chatbox-container">
    <button id="chatbox-toggle" class="chatbox-toggle">💬</button>
    <div id="chatbox-panel" class="chatbox-panel chatbox-hidden">
        <div class="chatbox-sidebar">
            <div class="chatbox-sidebar-header">
                <span>Lịch sử</span>
                <button class="chatbox-reset" id="chatbox-reset" title="Cuộc trò chuyện mới">Mới</button>
            </div>
            <div id="chatbox-session-list" class="chatbox-session-list">
                <div class="chatbox-session-empty">Chưa có lịch sử</div>
            </div>
            <div class="chatbox-sidebar-footer">
                <button id="chatbox-new" class="chatbox-new-btn">+ Cuộc chat mới</button>
            </div>
        </div>
        <div class="chatbox-main">
            <div class="chatbox-header">
                <span class="chatbox-title">Tư vấn sản phẩm</span>
                <div class="chatbox-header-actions">
                    <button class="chatbox-close" id="chatbox-close" title="Đóng">&times;</button>
                </div>
            </div>
            <div id="chatbox-messages" class="chatbox-messages"></div>
            <div class="chatbox-input-area">
                <input type="text" id="chatbox-input" placeholder="Nhập câu hỏi cho PetShop..." />
                <button id="chatbox-send" class="chatbox-send">Gửi</button>
            </div>
        </div>
    </div>
</div>

<script src="assets/js/main.js"></script>
<script src="assets/js/supportbox.js"></script>
</body>
</html>