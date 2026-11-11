<?php
// Trang danh sách sản phẩm PetShop
include __DIR__ . '/includes/header.php';
?>
<main class="main-content products-page">
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

    <section class="products-section">
        <h2>Danh sách sản phẩm</h2>
        <div class="products-section-inner">
            <div class="products-toolbar simple">
                <button id="toggleAdvancedFilters" class="filter-toggle-btn" type="button">
                    Bộ lọc nâng cao
                </button>

                <span class="toolbar-label">Sắp xếp:</span>
                <select id="sortSelect" class="sort-select">
                    <option value="default">Mặc định</option>
                    <option value="price-asc">Giá thấp đến cao</option>
                    <option value="price-desc">Giá cao đến thấp</option>
                    <option value="name-asc">Tên A → Z</option>
                    <option value="discount-desc">Ưu đãi nhiều</option>
                </select>
            </div>

            <div class="product-grid" id="productList">
                </div>
            <div id="pagination" class="pagination"></div>
        </div>
    </section>
    
    <div id="advancedFilterModal" class="modal hidden advanced-filter-modal">
        <div class="modal-content">
            <h3 class="filter-modal-title">Bộ lọc nâng cao</h3>
            <div class="advanced-filters" id="advancedFilters">
                <div class="filter-group">
                    <label for="keyword">Từ khóa</label>
                    <input type="text" id="keyword" placeholder="Tên sản phẩm, thương hiệu, mô tả..." />
                </div>
                <div class="filter-group">
                    <label for="priceRangePreset">Khoảng giá</label>
                    <select id="priceRangePreset">
                        <option value="">Tất cả</option>
                        <option value="0-100000">Dưới 100.000đ</option>
                        <option value="100000-300000">100.000đ - 300.000đ</option>
                        <option value="300000-500000">300.000đ - 500.000đ</option>
                        <option value="500000-1000000">500.000đ - 1.000.000đ</option>
                        <option value="1000000-">Trên 1.000.000đ</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="minPrice">Giá từ (tùy chọn)</label>
                    <input type="number" id="minPrice" placeholder="0" min="0" />
                </div>
                <div class="filter-group">
                    <label for="maxPrice">Đến (tùy chọn)</label>
                    <input type="number" id="maxPrice" placeholder="1.000.000" min="0" />
                </div>
                <div class="filter-group">
                    <label for="filterCategory">Danh mục</label>
                    <select id="filterCategory">
                        <option value="">Tất cả</option>
                    </select>
                </div>
                <div class="filter-group checkbox-group">
                    <label>
                        <input type="checkbox" id="onSaleOnly" />
                        Chỉ hiển thị sản phẩm đang giảm giá
                    </label>
                </div>
            </div>
            <div class="filter-modal-actions">
                <button id="applyFilters" type="button">Tìm kiếm</button>
                <button id="clearFilters" type="button" class="secondary">Xóa</button>
                <button id="closeFilterModal" type="button" class="link-btn">Đóng</button>
            </div>
        </div>
    </div>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>
<script src="assets/js/main.js" defer></script>