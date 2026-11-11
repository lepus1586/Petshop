<?php
// Admin dashboard page
// Đã sửa: Thêm ../ để lùi ra ngoài tìm đúng thư mục includes
include __DIR__ . '/../includes/admin_header.php';
$adminName = htmlspecialchars($_SESSION['user']['username'] ?? '');
?>
<div class="app-page-title admin-page-title">
    <div class="page-title-wrapper">
        <div class="page-title-heading">
            <div class="page-title-icon">
                <i class="pe-7s-graph text-primary"></i>
            </div>
            <div>
                Bảng điều khiển
                <div class="page-title-subheading">Tổng quan hoạt động và số liệu chính.</div>
            </div>
        </div>
    </div>
</div>

<div class="card mb-3">
    <div class="card-body">
        <h5 class="card-title mb-3">Chào mừng, <?= $adminName ?> 👋</h5>
        <div id="admin-stats" class="admin-stats">
            <div class="admin-stat-card">
                <h4>Tổng sản phẩm</h4>
                <p id="stat-total-products">0</p>
            </div>
            <div class="admin-stat-card">
                <h4>Tổng người dùng</h4>
                <p id="stat-total-users">0</p>
            </div>
            <div class="admin-stat-card">
                <h4>Đơn hàng đã hoàn thành</h4>
                <p id="stat-completed-orders">0</p>
            </div>
            <div class="admin-stat-card">
                <h4>Doanh thu</h4>
                <p id="stat-revenue">0₫</p>
            </div>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header d-flex align-items-center justify-content-between">
        <div>
            <div class="card-title mb-0">Bán hàng & Doanh thu</div>
            <small class="text-muted">Biểu đồ doanh thu theo tháng</small>
        </div>
    </div>
    <div class="card-body chart-wrapper">
        <canvas id="salesChart" style="max-width:100%; height:320px;"></canvas>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="/petshop/assets/js/admin_dashboard.js" defer></script>
<?php include __DIR__ . '/../includes/admin_footer.php'; ?>