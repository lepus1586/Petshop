<?php
// Admin header include using ArchitectUI layout
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!isset($_SESSION['user']) || ($_SESSION['user']['role'] ?? '') !== 'admin') {
    // Ép thẳng đường dẫn tuyệt đối
    header('Location: /petshop/login.php');
    exit;
}

$username    = htmlspecialchars($_SESSION['user']['username'] ?? '');
$currentFile = basename(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
?>
<!doctype html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PetShop Admin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    
    <link rel="stylesheet" href="/petshop/assets/css/admin-architect.css">
</head>
<body class="admin-layout">
<div class="app-container app-theme-white body-tabs-shadow fixed-sidebar fixed-header">
    <div class="app-header header-shadow">
        <div class="header-right" style="display: flex; align-items: center; gap: 15px;">
            
            <a class="btn btn-sm btn-info text-white" href="/petshop/index.php">
                <i class="fa-solid fa-house"></i> Về trang chủ
            </a>
            
            <div class="user-block" style="margin-left: 10px;">
                <div class="user-name"><?= $username ?></div>
                <div class="user-role">Quản trị viên</div>
            </div>
            
            <a class="btn btn-sm btn-outline-secondary" href="/petshop/api/logout.php">Đăng xuất</a>
        </div>
    </div>
    <div class="app-main">
        <div class="app-sidebar sidebar-shadow">
            <div class="app-header__logo">
                <div class="logo-src logo-text">PetShop <span class="logo-accent">Admin</span></div>
                <div class="header__pane ml-auto">
                    <button type="button" class="hamburger close-sidebar-btn hamburger--elastic" data-class="closed-sidebar">
                        <span class="hamburger-box">
                            <span class="hamburger-inner"></span>
                        </span>
                    </button>
                </div>
            </div>
            <div class="app-sidebar__inner">
                <ul class="vertical-nav-menu">
                    <li class="app-sidebar__heading">Quản trị</li>
                    
                    <li>
                        <a href="/petshop/admin/dashboard.php" class="<?= $currentFile === 'dashboard.php' ? 'mm-active' : '' ?>">
                            <i class="metismenu-icon fa-solid fa-chart-line"></i>
                            Bảng điều khiển
                        </a>
                    </li>
                    <li>
                        <a href="/petshop/admin/manage_products.php" class="<?= $currentFile === 'manage_products.php' || $currentFile === 'add_product.php' || $currentFile === 'edit_product.php' ? 'mm-active' : '' ?>">
                            <i class="metismenu-icon fa-solid fa-boxes-stacked"></i>
                            Sản phẩm
                        </a>
                    </li>
                    <li>
                        <a href="/petshop/admin/manage_orders.php" class="<?= $currentFile === 'manage_orders.php' || $currentFile === 'order_detail.php' ? 'mm-active' : '' ?>">
                            <i class="metismenu-icon fa-solid fa-cart-shopping"></i>
                            Đơn hàng
                        </a>
                    </li>
                    <li>
                        <a href="/petshop/admin/manage_vouchers.php" class="<?= $currentFile === 'manage_vouchers.php' ? 'mm-active' : '' ?>">
                            <i class="metismenu-icon fa-solid fa-ticket"></i>
                            Voucher
                        </a>
                    </li>
                    <li>
                        <a href="/petshop/admin/manage_users.php" class="<?= $currentFile === 'manage_users.php' || $currentFile === 'edit_user.php' || $currentFile === 'user_detail.php' ? 'mm-active' : '' ?>">
                            <i class="metismenu-icon fa-solid fa-users"></i>
                            Người dùng
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <div class="app-main__outer">
            <div class="app-main__inner">