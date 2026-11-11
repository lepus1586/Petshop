<?php
// Cấu hình chung cho ứng dụng PetShop

// 1. Nạp file cấu hình riêng trên máy cá nhân (không commit lên Git)
$localConfigFile = __DIR__ . '/config.local.php';
if (file_exists($localConfigFile)) {
    require_once $localConfigFile;
}

// 2. Khóa API Gemini cho tính năng AI Chatbot tư vấn thú cưng
// Thứ tự ưu tiên: config.local.php -> Biến môi trường hệ thống GEMINI_API_KEY -> Chuỗi rỗng
if (!defined('GEMINI_API_KEY')) {
    $envKey = getenv('GEMINI_API_KEY');
    define('GEMINI_API_KEY', ($envKey !== false && $envKey !== '') ? $envKey : '');
}
