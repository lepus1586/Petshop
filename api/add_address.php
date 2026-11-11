<?php
// Thêm địa chỉ giao hàng mới cho người dùng
header('Content-Type: application/json; charset=utf-8');
session_start();
require_once __DIR__ . '/../database/connect.php';

// Chỉ cho phép user đã đăng nhập
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Bạn phải đăng nhập để thêm địa chỉ']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Dữ liệu gửi lên không hợp lệ']);
    exit;
}

// Lấy dữ liệu từ form
$recipientName = trim($data['recipient_name'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$city = trim($data['city'] ?? '');
$district = trim($data['district'] ?? '');
$street = trim($data['address'] ?? '');   // textarea "Địa chỉ giao hàng"

// Kiểm tra bắt buộc
if ($recipientName === '' || $street === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Vui lòng nhập đầy đủ tên người nhận và địa chỉ']);
    exit;
}

$userId = (int) $_SESSION['user']['id'];

// Ghép địa chỉ đầy đủ
$fullAddress = $street;
if ($district !== '') {
    $fullAddress .= ', ' . $district;
}
if ($city !== '') {
    $fullAddress .= ', ' . $city;
}

// BƯỚC QUAN TRỌNG: Bắt lỗi SQL nếu Database bị thiếu cột
$sql = "INSERT INTO addresses (user_id, recipient_name, email, phone, city, district, address, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, 0)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    // Nếu chuẩn bị câu lệnh thất bại, trả về lỗi SQL thực sự ra màn hình
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Lỗi Database: ' . $conn->error]);
    exit;
}

$stmt->bind_param(
    'issssss',
    $userId,
    $recipientName,
    $email,
    $phone,
    $city,
    $district,
    $fullAddress
);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Đã lưu địa chỉ thành công!', 'id' => $stmt->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Không thể thêm địa chỉ: ' . $stmt->error]);
}

$stmt->close();
?>