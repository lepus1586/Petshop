<?php
// File: htdocs/admin/index.php
// Giao diện Admin dashboard (ArchitectUI-like)

session_start();
require_once __DIR__ . '/../database/connect.php';

// Kiểm tra quyền admin
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header('Location: /petshop/login.php');
    exit;
}

// Lấy dữ liệu tĩnh ban đầu (fallback)
$stats = [
    'total_orders' => 0,
    'completed_orders' => 0,
    'total_users' => 0,
    'total_products' => 0
];

// SỬA LỖI CURL: Phải dùng URL đầy đủ (có http:// và host) thì XAMPP mới hiểu
$apiUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/petshop/api/get_admin_stats.php';
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 2
]);
$res = curl_exec($ch);
if ($res !== false) {
    $json = json_decode($res, true);
    if (!empty($json['success']) && !empty($json['stats'])) { // Sửa 'data' thành 'stats' cho khớp API của bạn
        $stats = array_merge($stats, $json['stats']);
    }
}
curl_close($ch);
?>
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Admin - Dashboard</title>

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <link href="/petshop/assets/css/admin.css" rel="stylesheet">
</head>
<body>
  <div class="admin-wrapper d-flex">
    <nav id="sidebar" class="sidebar bg-dark text-white">
      <div class="sidebar-header p-3 text-center">
        <a href="/petshop/admin/index.php" class="text-decoration-none text-white">
          <h4 class="mb-0">PetShop Admin</h4>
        </a>
      </div>
      <ul class="nav flex-column px-2">
        <li class="nav-item"><a class="nav-link text-white" href="/petshop/admin/index.php"><i class="fa fa-tachometer-alt me-2"></i> Dashboard</a></li>
        <li class="nav-item"><a class="nav-link text-white" href="/petshop/admin/manage_products.php"><i class="fa fa-box-open me-2"></i> Products</a></li>
        <li class="nav-item"><a class="nav-link text-white" href="/petshop/admin/manage_orders.php"><i class="fa fa-shopping-cart me-2"></i> Orders</a></li>
        <li class="nav-item"><a class="nav-link text-white" href="/petshop/admin/manage_users.php"><i class="fa fa-users me-2"></i> Users</a></li>
        <li class="nav-item"><a class="nav-link text-white" href="/petshop/admin/manage_vouchers.php"><i class="fa fa-ticket-alt me-2"></i> Vouchers</a></li>
      </ul>
      <div class="sidebar-footer p-3 mt-auto">
        <small>Logged in as: <strong><?php echo htmlspecialchars($_SESSION['user']['username'] ?? 'Admin'); ?></strong></small>
      </div>
    </nav>

    <div class="main flex-grow-1">
      <header class="topbar d-flex align-items-center justify-content-between px-3">
        <div class="d-flex align-items-center">
          <button id="sidebarToggle" class="btn btn-sm btn-outline-secondary me-3"><i class="fa fa-bars"></i></button>
          <h5 class="mb-0">Dashboard</h5>
        </div>
        <div class="d-flex align-items-center">
          <div class="me-3">
            <input id="admin-search" class="form-control form-control-sm" placeholder="Tìm sản phẩm, đơn hàng..." />
          </div>
          <div class="dropdown">
            <a href="#" class="text-dark text-decoration-none" id="adminMenu" data-bs-toggle="dropdown">
              <img src="/petshop/assets/images/default-avatar.png" class="rounded-circle" width="36" height="36" alt="avatar">
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="adminMenu">
              <li><a class="dropdown-item" href="/petshop/api/logout.php">Logout</a></li>
            </ul>
          </div>
        </div>
      </header>

      <main class="content p-4">
        <div class="container-fluid">
          <div class="row g-3 mb-4">
            <div class="col-12 col-md-6 col-lg-3">
              <div class="card stat-card">
                <div class="card-body d-flex align-items-center">
                  <div class="me-3 display-6 text-primary"><i class="fa fa-receipt"></i></div>
                  <div>
                    <div class="fw-bold" id="stat-total-orders"><?php echo number_format($stats['orders']['completed'] ?? 0); ?></div>
                    <small class="text-muted">Đơn hoàn thành</small>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6 col-lg-3">
              <div class="card stat-card">
                <div class="card-body d-flex align-items-center">
                  <div class="me-3 display-6 text-success"><i class="fa fa-check-circle"></i></div>
                  <div>
                    <div class="fw-bold" id="stat-revenue"><?php echo number_format($stats['revenue'] ?? 0); ?>₫</div>
                    <small class="text-muted">Doanh thu</small>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6 col-lg-3">
              <div class="card stat-card">
                <div class="card-body d-flex align-items-center">
                  <div class="me-3 display-6 text-warning"><i class="fa fa-users"></i></div>
                  <div>
                    <div class="fw-bold" id="stat-total-users"><?php echo number_format($stats['total_users']); ?></div>
                    <small class="text-muted">Người dùng</small>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6 col-lg-3">
              <div class="card stat-card">
                <div class="card-body d-flex align-items-center">
                  <div class="me-3 display-6 text-danger"><i class="fa fa-boxes"></i></div>
                  <div>
                    <div class="fw-bold" id="stat-total-products"><?php echo number_format($stats['total_products']); ?></div>
                    <small class="text-muted">Sản phẩm</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="row mt-3">
            <div class="col-12">
              <div class="card p-3">
                <strong>Hành động nhanh</strong>
                <div class="mt-3 d-flex gap-2 flex-wrap">
                  <a href="/petshop/admin/manage_products.php" class="btn btn-outline-secondary btn-sm">Quản lý sản phẩm</a>
                  <a href="/petshop/admin/manage_orders.php" class="btn btn-outline-secondary btn-sm">Quản lý đơn</a>
                  <a href="/petshop/admin/manage_users.php" class="btn btn-outline-secondary btn-sm">Quản lý người dùng</a>
                  <a href="/petshop/admin/manage_vouchers.php" class="btn btn-outline-secondary btn-sm">Quản lý Voucher</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer class="p-3 text-center small text-muted">
        © <?php echo date('Y'); ?> PetShop — Admin Panel
      </footer>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="/petshop/assets/js/admin.js"></script>
</body>
</html>