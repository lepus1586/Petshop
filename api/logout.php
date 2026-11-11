<?php
// Đăng xuất
session_start();
session_unset();
session_destroy();

// Dùng ../ để lùi ra 1 thư mục, sau đó mới gọi login.php
header('Location: ../login.php');
exit;
?>