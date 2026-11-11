// JavaScript to load featured categories on the home page for PetShop

document.addEventListener('DOMContentLoaded', async () => {
    // Lưu ý: Vẫn giữ nguyên các ID cũ (home-laptop, home-linhkien) để không phải sửa lại file index.php
    const laptopContainer = document.getElementById('home-laptop');
    const linhkienContainer = document.getElementById('home-linhkien');
    if (!laptopContainer || !linhkienContainer) return;

    // Hàm tạo HTML dùng chung cho tất cả các thẻ sản phẩm PetShop
    function createProductCard(p) {
        const desc = p.description || '';
        const shortDesc = desc.length > 120 ? desc.substring(0, 120) + '...' : desc;
        const original = Number(p.price);
        const sale = p.sale_price && p.sale_price < p.price ? Number(p.sale_price) : null;
        const hasSale = sale !== null;
        const finalPrice = hasSale ? sale : original;
        const discountPercent = hasSale ? Math.round((original - sale) / original * 100) : null;
        
        const buttonPriceHtml = hasSale
            ? `<span class="sale-price">${finalPrice.toLocaleString()}₫</span><span class="original-price">${original.toLocaleString()}₫</span>`
            : `<span class="sale-price">${original.toLocaleString()}₫</span>`;
        const discountBadge = hasSale ? `<div class="discount-badge">Giảm ${discountPercent}%</div>` : '';
        
        return `
        <div class="product-card">
            ${discountBadge}
            <img src="assets/images/${p.image}" alt="${p.name}" />
            <h4>${p.name}</h4>
            <p class="product-short-desc">${shortDesc}</p>
            <button class="product-price-btn" onclick="location.href='product_detail.php?id=${p.id}'">${buttonPriceHtml}</button>
        </div>
        `;
    }

    try {
        // Tối ưu hóa: Gọi API 1 lần duy nhất để lấy toàn bộ sản phẩm
        const resAll = await fetch('api/get_products.php');
        let allProducts = await resAll.json();
        allProducts = Array.isArray(allProducts) ? allProducts : [];
        
        // Sắp xếp ID giảm dần (Sản phẩm mới nhất lên đầu)
        allProducts.sort((a, b) => b.id - a.id);

        // ---------- 1. Sản phẩm nổi bật (Lọc lấy Thức ăn / Pate) ----------
        const foodProducts = allProducts.filter(p => 
            p.category && (p.category.includes('Thức ăn') || p.category.includes('Pate'))
        ).slice(0, 4); // ĐÃ SỬA: Chỉ lấy tối đa 4 sản phẩm
        
        // Nếu mục thức ăn rỗng, lấy đại 4 sản phẩm mới nhất bất kỳ lấp vào
        const topProducts = foodProducts.length > 0 ? foodProducts : allProducts.slice(0, 4); // ĐÃ SỬA: Chỉ lấy tối đa 4 sản phẩm
        laptopContainer.innerHTML = topProducts.map(createProductCard).join('');

        // ---------- 2. Phụ kiện & Đồ chơi (Lọc lấy Phụ kiện / Cát / Chuồng / Sữa tắm) ----------
        const accessoryProducts = allProducts.filter(p => 
            p.category && (p.category.includes('Phụ kiện') || p.category.includes('Chuồng') || p.category.includes('Cát') || p.category.includes('Sữa tắm'))
        ).slice(0, 8); // Mục này vẫn giữ nguyên 8 sản phẩm, bạn có thể sửa thành 4 nếu muốn đồng bộ
        
        linhkienContainer.innerHTML = accessoryProducts.map(createProductCard).join('');

        // ---------- 3. Giảm giá sâu ----------
        const discountContainer = document.getElementById('home-discount');
        if (discountContainer) {
            // Lọc ra những sản phẩm có giá sale nhỏ hơn giá gốc
            const discounted = allProducts.filter(p => p.sale_price && p.sale_price < p.price);
            
            // Sắp xếp theo phần trăm giảm giá nhiều nhất
            discounted.sort((a, b) => {
                const aOrig = Number(a.price);
                const aSale = Number(a.sale_price);
                const bOrig = Number(b.price);
                const bSale = Number(b.sale_price);
                const aDisc = aOrig > 0 ? (aOrig - aSale) / aOrig : 0;
                const bDisc = bOrig > 0 ? (bOrig - bSale) / bOrig : 0;
                return bDisc - aDisc;
            });
            
            const topDiscounts = discounted.slice(0, 8);
            discountContainer.innerHTML = topDiscounts.map(createProductCard).join('');
        }
    } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
    }

    // Điều chỉnh chiều cao quảng cáo
    function adjustAdHeight() {
        const nav = document.querySelector('.home-page .categories-nav');
        const leftImg = document.querySelector('.ads-left img');
        const rightImg = document.querySelector('.ads-right img');
        if (nav && leftImg && rightImg) {
            const navHeight = nav.offsetHeight;
            if (navHeight > 0) {
                leftImg.style.height = navHeight + 'px';
                rightImg.style.height = navHeight + 'px';
            }
        }
    }

    adjustAdHeight();
    window.addEventListener('resize', adjustAdHeight);
});