<?php
// Trang quản lý đơn hàng (admin)
// Include admin header (enforces admin authentication and opens <main>)
include __DIR__ . '/../includes/admin_header.php';
?>
<div class="app-page-title admin-page-title">
    <div class="page-title-wrapper">
        <div class="page-title-heading">
            <div class="page-title-icon">
                <i class="pe-7s-cart text-primary"></i>
            </div>
            <div>
                Quản lý đơn hàng
                <div class="page-title-subheading">Cập nhật trạng thái và xem chi tiết từng đơn.</div>
            </div>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-striped table-hover align-middle admin-table mb-0" id="orders-table">
                <thead>
                    <tr>
                        <th>Đơn hàng</th><th>Khách hàng</th><th>Thành tiền</th><th>Trạng thái</th><th>Ngày tạo</th><th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
        <div id="orders-pagination" class="pagination-wrap"></div>
    </div>
</div>

<script>
let ordersData = [];
const perPage = 20;
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});

// ĐÃ SỬA: Hàm tải đơn hàng linh hoạt và chống lỗi
async function loadOrders() {
    try {
        // SỬA ĐƯỜNG DẪN: Đổi /api/ thành ../api/
        const res = await fetch('../api/get_admin_orders.php');
        const result = await res.json();
        
        // Kiểm tra xem API trả về mảng trực tiếp hay nằm trong biến "data"
        if (Array.isArray(result)) {
            ordersData = result;
        } else if (result && Array.isArray(result.data)) {
            ordersData = result.data;
        } else {
            console.error("Dữ liệu trả về không đúng định dạng:", result);
            ordersData = [];
        }
        
        currentPage = 1;
        renderOrders();
        renderPagination();
    } catch (err) {
        console.error("Lỗi khi gọi API tải đơn hàng:", err);
    }
}

function renderOrders() {
    const tbody = document.querySelector('#orders-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const start = (currentPage - 1) * perPage;
    const pageItems = ordersData.slice(start, start + perPage);
    if (!pageItems.length) return;
        // Danh sách trạng thái với nhãn tiếng Việt. Giá trị giữ nguyên để gửi cho API.
        const statusList = [
            { value: 'Pending', label: 'Đang chờ' },
            { value: 'Processing', label: 'Đang xử lý' },
            { value: 'Shipping', label: 'Đang giao' },
            { value: 'Completed', label: 'Hoàn thành' },
            { value: 'Cancelled', label: 'Đã hủy' }
        ];
        pageItems.forEach(order => {
            const tr = document.createElement('tr');
            const firstName = order.first_product_name || 'Đơn hàng';
            const itemsCount = order.items_count ? Number(order.items_count) : null;
            const moreItemsText = itemsCount && itemsCount > 1 ? ` +${itemsCount - 1} SP khác` : '';
            
            // SỬA ĐƯỜNG DẪN ẢNH: Đổi /assets/ thành ../assets/
            const imageHtml = order.first_product_image
                ? `<div class="admin-order-thumb"><img src="../assets/images/${order.first_product_image}" alt="${firstName}"></div>`
                : '<div class="admin-order-thumb admin-order-thumb--empty"><span>?</span></div>';
                
            const orderCellHtml = `
                <div class="admin-order-main">
                    ${imageHtml}
                    <div class="admin-order-text">
                        <div class="admin-order-title">${firstName}${moreItemsText}</div>
                        <div class="admin-order-meta">Mã: <a href="order_detail.php?id=${order.id}">#${order.id}</a></div>
                    </div>
                </div>
            `;
            // Tạo các option cho select với nhãn tiếng Việt và đánh dấu chọn phù hợp
            const optionsHtml = statusList.map(st => {
                const selected = (order.status || '').toLowerCase() === st.value.toLowerCase() ? 'selected' : '';
                return `<option value="${st.value}" ${selected}>${st.label}</option>`;
            }).join('');
            tr.innerHTML = `
                <td>${orderCellHtml}</td>
                <td>${order.username || 'Unknown'}</td>
                <td>${Number(order.final_total).toLocaleString()}₫</td>
                <td>
                    <select data-id="${order.id}" onchange="changeStatus(this)">
                        ${optionsHtml}
                    </select>
                </td>
                <td>${order.created_at}</td>
                <td>
                    <button class="btn-edit" onclick="updateOrder(${order.id}, this.parentElement.parentElement.querySelector('select').value)"><span class="icon">🔄</span> Cập nhật</button>
                    <button class="btn-delete" onclick="deleteOrder(${order.id}, this)"><span class="icon">🗑️</span> Xóa</button>
                </td>
            `;
            // Cho phép click vào hàng để xem chi tiết đơn hàng (trừ khi bấm vào nút hoặc chọn trạng thái)
            tr.addEventListener('click', function(e) {
                const tag = e.target.tagName.toLowerCase();
                if (tag === 'button' || tag === 'select' || tag === 'option' || (e.target.closest('button') !== null) || (e.target.closest('select') !== null)) {
                    return;
                }
                // SỬA ĐƯỜNG DẪN CHUYỂN TRANG
                window.location.href = `order_detail.php?id=${order.id}`;
            });
            tbody.appendChild(tr);
        });
}

function renderPagination() {
    const container = document.getElementById('orders-pagination');
    if (!container) return;
    const totalPages = Math.max(1, Math.ceil(ordersData.length / perPage));
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    let html = '<div class="pagination-circles">';
    html += currentPage > 1
        ? `<a href="#" data-page="${currentPage - 1}" aria-label="Trang trước">←</a>`
        : `<span class="disabled">←</span>`;
    for (let p = 1; p <= totalPages; p++) {
        if (p === currentPage) {
            html += `<span class="active">${p}</span>`;
        } else {
            html += `<a href="#" data-page="${p}">${p}</a>`;
        }
    }
    html += currentPage < totalPages
        ? `<a href="#" data-page="${currentPage + 1}" aria-label="Trang sau">→</a>`
        : `<span class="disabled">→</span>`;
    html += '</div>';
    container.innerHTML = html;
    container.querySelectorAll('a[data-page]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const target = parseInt(a.getAttribute('data-page'), 10);
            if (!isNaN(target)) {
                currentPage = target;
                renderOrders();
                renderPagination();
            }
        });
    });
}

function changeStatus(select) {
    // no immediate action; update occurs on button click
}
async function updateOrder(orderId, status) {
    try {
        // SỬA ĐƯỜNG DẪN: Đổi /api/ thành ../api/
        const res = await fetch('../api/update_order_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: orderId, status })
        });
        const data = await res.json();
        if (!data.success) {
            showNotification(data.message || 'Cập nhật thất bại', 'error');
        } else {
            showNotification('Cập nhật thành công', 'success');
        }
    } catch (err) {
        showNotification('Không thể cập nhật đơn hàng.', 'error');
    }
}

// Hàm xóa đơn hàng
async function deleteOrder(orderId, btn) {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng #' + orderId + ' không?')) {
        return;
    }
    try {
        // SỬA ĐƯỜNG DẪN: Đổi /api/ thành ../api/
        const res = await fetch('../api/delete_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: orderId })
        });
        const data = await res.json();
        if (data && data.success) {
            // Xóa hàng khỏi bảng
            const row = btn.closest('tr');
            if (row) row.remove();
            showNotification(data.message || 'Đã xóa đơn hàng.', 'success');
        } else {
            showNotification(data.message || 'Không thể xóa đơn hàng.', 'error');
        }
    } catch (err) {
        showNotification('Không thể xóa đơn hàng.', 'error');
    }
}
</script>
<?php include __DIR__ . '/../includes/admin_footer.php'; ?>