<?php
// Global header include
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$isLoggedIn = isset($_SESSION['user']);
$isAdmin = $isLoggedIn && ($_SESSION['user']['role'] ?? 'user') === 'admin';
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>PetShop - Thức ăn & Phụ kiện thú cưng</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/estore.css">
</head>
<body>
<header class="header">
    <div class="logo">
        <a href="index.php">PetShop <span>🐰</span></a>
    </div>
    <div class="search-container">
        <input type="text" id="searchInput" placeholder="Bạn cần tìm gì cho Boss?" />
        <button id="searchBtn" class="search-btn">🔍</button>
    </div>
    <div class="user-cart">
        <div class="user-menu">
            <span class="user-icon">👤</span>
            <?php if ($isLoggedIn): ?>
                <span class="username"><?php echo htmlspecialchars($_SESSION['user']['username'] ?? ''); ?></span>
                <div class="user-dropdown">
                    <a href="profile.php">Thông tin tài khoản</a>
                    <?php if ($isAdmin): ?>
                        <a href="admin/dashboard.php">Quản trị</a>
                    <?php endif; ?>
                    <a href="api/logout.php">Đăng xuất</a>
                </div>
            <?php else: ?>
                <div class="user-dropdown">
                    <a href="login.php">Đăng nhập</a>
                    <a href="register.php">Đăng ký</a>
                </div>
            <?php endif; ?>
        </div>
    </div>
</header>

<nav class="main-nav">
    <a href="index.php">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">Trang chủ</span>
    </a>
    <a href="products.php">
        <span class="nav-icon">🛍️</span>
        <span class="nav-text">Sản phẩm</span>
    </a>
    <a href="orders.php" class="protected-link">
        <span class="nav-icon">📦</span>
        <span class="nav-text">Đơn hàng</span>
    </a>
    <a href="cart.php" class="protected-link">
        <span class="nav-icon">🛒</span>
        <span class="nav-text">Giỏ hàng</span>
        <span id="nav-cart-count"></span>
    </a>
</nav>
<script>
const IS_LOGGED_IN = <?php echo $isLoggedIn ? 'true' : 'false'; ?>;

// Cập nhật số lượng giỏ hàng, tìm kiếm, bảo vệ liên kết
document.addEventListener('DOMContentLoaded', function () {
    // Update cart count
    fetch('api/get_cart.php')
        .then(res => res.json())
        .then(data => {
            const count = data.summary ? data.summary.line_count : Object.keys(data.cart || {}).length;
            const cartCount = document.getElementById('cart-count');
            const navCartCount = document.getElementById('nav-cart-count');
            const text = count > 0 ? '(' + count + ')' : '';
            if (cartCount) cartCount.textContent = text;
            if (navCartCount) navCartCount.textContent = text;
        })
        .catch(() => {});

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    function doSearch() {
        if (!searchInput) return;
        const q = searchInput.value.trim();
        if (q) {
            window.location.href = 'products.php?q=' + encodeURIComponent(q);
        }
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                doSearch();
            }
        });
    }
    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            doSearch();
        });
    }

    document.querySelectorAll('.protected-link').forEach(link => {
        link.addEventListener('click', function (e) {
            if (!IS_LOGGED_IN) {
                e.preventDefault();
                window.location.href = 'login.php';
            }
        });
    });

    const headerEl = document.querySelector('.header');
    function handleScroll() {
        if (window.scrollY > 50) {
            headerEl.classList.add('scrolled');
        } else {
            headerEl.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', handleScroll);
});
</script>
<script src="assets/js/notify.js"></script>