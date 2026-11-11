// Script to load admin dashboard statistics
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Dùng ../api/ để lùi từ thư mục admin ra ngoài, rồi mới vào api
        const res = await fetch('../api/get_admin_stats.php');
        const data = await res.json();
        if (data && data.success) {
            const stats = data.stats;
            
            const totalProductsEl = document.getElementById('stat-total-products');
            if (totalProductsEl) totalProductsEl.textContent = stats.total_products;
            
            const totalUsersEl = document.getElementById('stat-total-users');
            if (totalUsersEl) totalUsersEl.textContent = stats.total_users;
            
            const completedOrders = stats.orders && stats.orders.completed ? stats.orders.completed : 0;
            const completedOrdersEl = document.getElementById('stat-completed-orders');
            if (completedOrdersEl) completedOrdersEl.textContent = completedOrders;
            
            const revenueEl = document.getElementById('stat-revenue');
            if (revenueEl) revenueEl.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue || 0);
        }

        // Tải biểu đồ
        const chartCanvas = document.getElementById('salesChart');
        if (chartCanvas) {
            // Dùng ../api/ ở đây nữa
            const monthRes = await fetch('../api/get_monthly_stats.php');
            const monthData = await monthRes.json();
            if (monthData && monthData.success) {
                const ctx = chartCanvas.getContext('2d');
                const labels = (monthData.months || []).map(m => String(m).padStart(2, '0') + '/' + monthData.year);
                const orderCounts = monthData.orders || [];
                const revenues = monthData.revenues || [];
                
                if (labels.length) {
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [
                                {
                                    label: 'Đơn hàng',
                                    data: orderCounts,
                                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                    borderColor: 'rgba(255, 99, 132, 1)',
                                    borderWidth: 1,
                                    yAxisID: 'yOrders'
                                },
                                {
                                    label: 'Doanh thu (₫)',
                                    data: revenues,
                                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                    borderColor: 'rgba(54, 162, 235, 1)',
                                    borderWidth: 1,
                                    yAxisID: 'yRevenue'
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            interaction: { mode: 'index', intersect: false },
                            stacked: false,
                            scales: {
                                yOrders: {
                                    type: 'linear',
                                    position: 'left',
                                    beginAtZero: true,
                                    title: { display: true, text: 'Số đơn' }
                                },
                                yRevenue: {
                                    type: 'linear',
                                    position: 'right',
                                    beginAtZero: true,
                                    title: { display: true, text: 'Doanh thu (₫)' },
                                    grid: { drawOnChartArea: false }
                                }
                            }
                        }
                    });
                }
            }
        }
    } catch (err) {
        console.error('Error loading admin stats', err);
    }
});