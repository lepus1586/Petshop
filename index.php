<?php
// Trang chủ PetShop
include __DIR__ . '/includes/header.php';
?>

<style>
    /* Chỉnh lưới chứa 4 banner */
    .hero-promos {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
    }

    /* Ép chiều cao của từng banner ngắn lại để dóng ngang với 2 nút bấm */
    .hero-promo {
        position: relative;
        overflow: hidden;
        border-radius: 12px;
        height: 130px; /* ĐÂY LÀ CHÌA KHÓA: Giới hạn chiều cao cố định */
        display: block;
    }

    /* Xử lý ảnh vừa vặn khung */
    .hero-promo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        transition: transform 0.3s ease; /* Thêm hiệu ứng mượt khi hover */
    }

    /* Hiệu ứng phóng to nhẹ ảnh khi di chuột vào */
    .hero-promo:hover img {
        transform: scale(1.05);
    }

    /* Xử lý lớp phủ bóng đen ở dưới chân ảnh để làm nổi chữ */
    .hero-promo-text {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
        padding: 20px 10px 10px 10px;
        margin: 0;
    }

    /* Chỉnh lại kích thước chữ cho cân đối với khung nhỏ */
    .hero-promo-text h3 {
        color: #fff !important;
        font-size: 15px !important;
        font-weight: 600;
        margin: 0 0 3px 0 !important;
        text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
    }

    .hero-promo-text p {
        color: #eee !important;
        font-size: 12px !important;
        margin: 0 !important;
        text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
    }
</style>

<main class="main-content home-page">
    <nav class="categories-nav">
        <ul>
            <li><a href="products.php?cat=Thức ăn cho thú cưng">Thức ăn cho thú cưng</a></li>
            <li><a href="products.php?cat=Pate - Súp thưởng">Pate & Súp thưởng</a></li>
            <li><a href="products.php?cat=Cát vệ sinh">Cát vệ sinh</a></li>
            <li><a href="products.php?cat=Phụ kiện">Phụ kiện & Đồ chơi</a></li>
            <li><a href="products.php?cat=Sữa tắm - Vệ sinh">Sữa tắm & Vệ sinh</a></li>
            <li><a href="products.php?cat=Chuồng - Balo">Chuồng, Balo & Đệm</a></li>
            <li><a href="products.php?cat=Quần áo">Quần áo thú cưng</a></li>
            <li><a href="products.php?cat=Thực phẩm chức năng">Thực phẩm chức năng</a></li>
        </ul>
    </nav>
    <section class="content">
        <div class="hero-banner">
            <div class="hero-main">
                <span class="hero-badge">Ưu đãi thức ăn & phụ kiện</span>
                <h1>PetShop - Dinh dưỡng tốt nhất cho thú cưng</h1>
                <p>
                    Cung cấp đa dạng các loại hạt, pate, đồ chơi và phụ kiện chăm sóc sức khỏe cho các bé yêu của bạn. Sản phẩm chính hãng, an toàn và đầy đủ dinh dưỡng.
                </p>
                <div class="hero-actions">
                    <a href="products.php?cat=Thức ăn cho thú cưng" class="btn-primary">Xem thức ăn</a>
                    <a href="products.php" class="btn-outline">Tất cả sản phẩm</a>
                </div>
            </div>
            <div class="hero-promos">
                <a href="products.php?cat=Thức ăn cho thú cưng" class="hero-promo">
                    <img src="assets/images/banner-pet-food.png" alt="Flash sale thức ăn" />
                    <div class="hero-promo-text">
                        <h3>Flash Sale Hạt</h3>
                        <p>Giảm giá cực sốc</p>
                    </div>
                </a>
                <a href="products.php?cat=Pate - Súp thưởng" class="hero-promo">
                    <img src="assets/images/banner-pate.png" alt="Pate & Súp thưởng" />
                    <div class="hero-promo-text">
                        <h3>Pate & Súp thưởng</h3>
                        <p>Siêu ngon, bổ dưỡng</p>
                    </div>
                </a>
                <a href="products.php?cat=Cát vệ sinh" class="hero-promo">
                    <img src="assets/images/banner-cat-ve-sinh.png" alt="Cát vệ sinh" />
                    <div class="hero-promo-text">
                        <h3>Cát vệ sinh</h3>
                        <p>Khử mùi hiệu quả</p>
                    </div>
                </a>
                <a href="products.php?cat=Phụ kiện" class="hero-promo">
                    <img src="assets/images/banner-phu-kien-pet.png" alt="Phụ kiện thú cưng" />
                    <div class="hero-promo-text">
                        <h3>Phụ kiện sành điệu</h3>
                        <p>Giá tốt mỗi ngày</p>
                    </div>
                </a>
            </div>
        </div>
        <div class="home-section">
            <h3>Sản phẩm nổi bật</h3>
            <div id="home-laptop" class="home-products"></div>
        </div>
        <div class="home-section">
            <h3>Phụ kiện & Đồ chơi</h3>
            <div id="home-linhkien" class="home-products"></div>
        </div>
        <div class="home-section">
            <h3>Giảm giá sâu</h3>
            <div id="home-discount" class="home-products"></div>
        </div>
    </section>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>
<script src="assets/js/home.js" defer></script>