<?php
// MySQL connection (Localhost XAMPP)
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "petshop_db";
$port = 3306;

$conn = new mysqli($servername, $username, $password, $dbname, $port);
if ($conn->connect_error) {
    die("Kết nối cơ sở dữ liệu thất bại: " . $conn->connect_error);
}

// Thiết lập charset UTF-8 để hiển thị tiếng Việt không bị lỗi font
$conn->set_charset('utf8mb4');
?>