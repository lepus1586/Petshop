<?php
// Trang chỉnh sửa thông tin người dùng cho admin
include __DIR__ . '/../includes/admin_header.php';
require_once __DIR__ . '/../database/connect.php';

// Lấy ID người dùng từ query string
$userId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($userId <= 0) {
    echo '<div class="alert alert-warning">Người dùng không hợp lệ.</div>';
    include __DIR__ . '/../includes/admin_footer.php';
    exit;
}

// Không cho phép chỉnh sửa chính bản thân qua trang này
if ($userId == ($_SESSION['user']['id'] ?? 0)) {
    echo '<div class="alert alert-info">Bạn không thể chỉnh sửa thông tin của chính mình tại đây.</div>';
    include __DIR__ . '/../includes/admin_footer.php';
    exit;
}

// Truy vấn thông tin người dùng
$stmt = $conn->prepare("SELECT id, username, email, phone, role, avatar, created_at FROM users WHERE id = ? LIMIT 1");
$stmt->bind_param('i', $userId);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    echo '<div class="admin-card"><p>Không tìm thấy người dùng.</p></div>';
    include __DIR__ . '/../includes/admin_footer.php';
    exit;
}

// ĐÃ SỬA ĐƯỜNG DẪN ẢNH AVATAR: Xóa dấu / ở đầu, thay bằng ../
$avatarFile = $user['avatar'] ?? '';
$avatarPath = '../assets/images/default-avatar.png';
if ($avatarFile) {
    $avatarPath = '../assets/images/avatars/' . $avatarFile;
}
?>
<div class="app-page-title admin-page-title">
    <div class="page-title-wrapper">
        <div class="page-title-heading">
            <div class="page-title-icon">
                <i class="pe-7s-user text-primary"></i>
            </div>
            <div>
                Chỉnh sửa người dùng #<?= htmlspecialchars($userId) ?>
                <div class="page-title-subheading">Cập nhật thông tin đăng nhập và liên hệ.</div>
            </div>
        </div>
        <div class="page-title-actions">
            <a class="btn btn-outline-secondary btn-shadow" href="manage_users.php">Quay lại danh sách</a>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-body">
        <div class="d-flex align-items-start gap-3 mb-3">
            <img src="<?= htmlspecialchars($avatarPath) ?>" alt="Avatar" style="width:120px; height:120px; object-fit:cover; border-radius:8px;">
            <div>
                <p class="mb-1"><strong>ID:</strong> <?= $user['id'] ?></p>
                <p class="mb-1"><strong>Quyền:</strong> <?= htmlspecialchars($user['role']) ?></p>
                <p class="mb-1"><strong>Ngày tạo:</strong> <?= htmlspecialchars($user['created_at']) ?></p>
            </div>
        </div>
        <form action="update_user.php" method="post" class="admin-form" style="max-width:500px;">
            <input type="hidden" name="id" value="<?= $user['id'] ?>" />
            <label>Tên đăng nhập
                <input type="text" name="username" value="<?= htmlspecialchars($user['username']) ?>" required />
            </label>
            <label>Email
                <input type="email" name="email" value="<?= htmlspecialchars($user['email']) ?>" required />
            </label>
            <label>Điện thoại
                <input type="text" name="phone" value="<?= htmlspecialchars($user['phone'] ?? '') ?>" />
            </label>
            <label>Mật khẩu mới (để trống nếu không đổi)
                <input type="password" name="password" />
            </label>
            <button type="submit" class="btn-edit"><span class="icon">💾</span> Lưu</button>
        </form>
    </div>
</div>

<?php include __DIR__ . '/../includes/admin_footer.php'; ?>