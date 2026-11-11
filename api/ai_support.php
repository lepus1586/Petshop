<?php
// API tư vấn sản phẩm dùng Gemini với logic tìm kiếm nâng cao cho PetShop
header('Content-Type: application/json; charset=utf-8');
session_start();

// Tắt hiển thị lỗi ra ngoài để tránh phá JSON trả về
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Kết nối tới database
require_once __DIR__ . '/../database/connect.php';

// Đọc nội dung JSON gửi lên
$raw = file_get_contents('php://input');
$input = json_decode($raw, true) ?: [];

// Câu hỏi từ người dùng
$query = isset($input['message']) ? trim($input['message']) : '';
$newChat = !empty($input['new_chat']);

// Lưu thông tin user và session hiện tại (nếu có)
$currentUserId = isset($_SESSION['user']['id']) ? (int) $_SESSION['user']['id'] : 0;
$sessionId = isset($input['session_id']) ? (int) $input['session_id'] : 0;

/**
 * Lưu 1 tin nhắn vào bảng ai_chat_messages
 */
function ai_save_message(int $sessionId, int $userId, string $sender, string $message): void
{
    if ($sessionId <= 0 || $message === '' || $userId <= 0) {
        return;
    }
    global $conn;
    $stmt = $conn->prepare(
        "INSERT INTO ai_chat_messages (session_id, user_id, sender, message, created_at)
         VALUES (?, ?, ?, ?, NOW())"
    );
    if ($stmt) {
        $stmt->bind_param('iiss', $sessionId, $userId, $sender, $message);
        $stmt->execute();
        $stmt->close();
    }
}

/**
 * Gửi JSON response và đồng thời lưu lịch sử chat
 */
function ai_respond_and_log(
    bool $success,
    string $reply,
    int $sessionId,
    int $currentUserId,
    string $userMessage
): void {
    if ($currentUserId > 0) {
        if ($userMessage !== '') {
            ai_save_message($sessionId, $currentUserId, 'user', $userMessage);
        }
        if ($reply !== '') {
            ai_save_message($sessionId, $currentUserId, 'bot', $reply);
        }
    }

    echo json_encode(
        [
            'success' => $success,
            'reply' => $reply,
            'session_id' => $sessionId,
        ],
        JSON_UNESCAPED_UNICODE
    );
    exit;
}

if ($query !== '') {
    if ($newChat || $sessionId <= 0) {
        if ($currentUserId > 0) {
            $title = mb_substr($query, 0, 80, 'UTF-8');
            $stmtSession = $conn->prepare(
                "INSERT INTO ai_chat_sessions (user_id, title, created_at, updated_at)
                 VALUES (?, ?, NOW(), NOW())"
            );
            if ($stmtSession) {
                $stmtSession->bind_param('is', $currentUserId, $title);
                if ($stmtSession->execute()) {
                    $sessionId = $stmtSession->insert_id;
                }
                $stmtSession->close();
            }
        }
    } elseif ($sessionId > 0 && $currentUserId > 0) {
        $stmtUpdate = $conn->prepare(
            "UPDATE ai_chat_sessions SET updated_at = NOW() WHERE id = ? AND user_id = ?"
        );
        if ($stmtUpdate) {
            $stmtUpdate->bind_param('ii', $sessionId, $currentUserId);
            $stmtUpdate->execute();
            $stmtUpdate->close();
        }
    }
}

if ($newChat) {
    unset($_SESSION['ai_last_products'], $_SESSION['ai_last_question']);
}

if ($query === '') {
    ai_respond_and_log(false, '', $sessionId, $currentUserId, $query);
}

// Chuẩn hóa về chữ thường để so khớp
$normalizedQuery = mb_strtolower($query, 'UTF-8');

// Xử lý số đơn giản (1, 2, 3...) để chọn sản phẩm
$handledNumberSelection = false;
if (preg_match('/^\s*(\d+)\s*$/u', trim($query)) && strlen(trim($query)) <= 3) {
    $num = (int) trim($query);
    if ($num >= 1 && $num <= 20 && !empty($_SESSION['ai_last_products'])) {
        if (preg_match_all('/product_detail\.php\?id=(\d+)/', $_SESSION['ai_last_products'], $mids)) {
            $idx = $num - 1;
            if (isset($mids[1][$idx])) {
                $productId = (int) $mids[1][$idx];
                $stmt = $conn->prepare("SELECT * FROM products WHERE id = ? LIMIT 1");
                if ($stmt) {
                    $stmt->bind_param('i', $productId);
                    if ($stmt->execute()) {
                        $res = $stmt->get_result();
                        if ($product = $res->fetch_assoc()) {
                            $info = build_product_info_line($product);
                            $_SESSION['ai_last_products'] = $info;
                            $_SESSION['ai_last_question'] = $query;
                            $query = 'Giới thiệu chi tiết về ' . $product['name'];
                            $normalizedQuery = mb_strtolower($query, 'UTF-8');
                            $handledNumberSelection = true;
                        }
                    }
                    $stmt->close();
                }
            }
        }
    }
}

function get_first_recommended_product_id(): ?int
{
    if (empty($_SESSION['ai_last_products'])) {
        return null;
    }
    $info = $_SESSION['ai_last_products'];
    if (preg_match('/product_detail\.php\?id=(\d+)/', $info, $m)) {
        return (int) $m[1];
    }
    return null;
}

function ai_add_to_cart(int $productId, int $qty = 1): string
{
    global $conn;
    if ($productId <= 0) {
        return 'Không có sản phẩm phù hợp để thêm vào giỏ hàng.';
    }
    $stmt = $conn->prepare("SELECT id, name, price, stock FROM products WHERE id = ? LIMIT 1");
    $stmt->bind_param('i', $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    $product = $result->fetch_assoc();
    $stmt->close();
    if (!$product) {
        return 'Sản phẩm không tồn tại.';
    }
    if (!isset($_SESSION['cart']) || !is_array($_SESSION['cart'])) {
        $_SESSION['cart'] = [];
    }
    $existingQty = isset($_SESSION['cart'][$productId]) ? $_SESSION['cart'][$productId]['quantity'] : 0;
    if ($product['stock'] < $qty + $existingQty) {
        return 'Số lượng sản phẩm vượt quá tồn kho hiện có.';
    }
    if (isset($_SESSION['cart'][$productId])) {
        $_SESSION['cart'][$productId]['quantity'] += $qty;
    } else {
        $_SESSION['cart'][$productId] = [
            'product_id' => (int) $product['id'],
            'name' => $product['name'],
            'price' => (float) $product['price'],
            'quantity' => $qty
        ];
    }
    if (isset($_SESSION['user'])) {
        $userId = (int) $_SESSION['user']['id'];
        $stmtCart = $conn->prepare("SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?");
        $stmtCart->bind_param('ii', $userId, $productId);
        $stmtCart->execute();
        $resCart = $stmtCart->get_result();
        if ($row = $resCart->fetch_assoc()) {
            $newQty = $row['quantity'] + $qty;
            $updateCart = $conn->prepare("UPDATE cart_items SET quantity = ? WHERE id = ?");
            $updateCart->bind_param('ii', $newQty, $row['id']);
            $updateCart->execute();
        } else {
            $insertCart = $conn->prepare("INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)");
            $insertCart->bind_param('iii', $userId, $productId, $qty);
            $insertCart->execute();
        }
        $stmtCart->close();
    }
    return 'Đã thêm sản phẩm "' . $product['name'] . '" vào giỏ hàng thành công. Bạn có muốn xem thêm gì cho bé nữa không?';
}

function get_recommended_product_id_from_query(string $normalizedQuery): ?int
{
    global $conn;
    $sanQuery = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $normalizedQuery);
    $sanQuery = preg_replace('/\s+/u', ' ', $sanQuery);
    $sanQuery = trim($sanQuery);
    if ($sanQuery === '') {
        return null;
    }

    $bestId = null;
    $bestMatchLength = 0;
    $res = $conn->query("SELECT id, name FROM products");
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $name = mb_strtolower($row['name'], 'UTF-8');
            $sanName = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $name);
            $sanName = preg_replace('/\s+/u', ' ', $sanName);
            $sanName = trim($sanName);
            if ($sanName === '') {
                continue;
            }
            $compactQuery = preg_replace('/\s+/u', '', $sanQuery);
            $compactName = preg_replace('/\s+/u', '', $sanName);
            if (strpos($compactQuery, $compactName) !== false) {
                $len = mb_strlen($sanName, 'UTF-8');
                if ($len > $bestMatchLength) {
                    $bestMatchLength = $len;
                    $bestId = (int) $row['id'];
                }
            }
        }
        $res->free();
    }
    if ($bestId) {
        return $bestId;
    }

    // Các thương hiệu và từ khóa cho PetShop
    $dbHints = [
        'royal canin', 'whiskas', 'pedigree', 'me-o', 'purina', 'inaba', 'ciao', 'nekko', 'reflex', 'nutrience', 'orijen', 'taste of the wild', 'snappy tom',
        'hạt', 'pate', 'súp thưởng', 'cát vệ sinh', 'chuồng', 'balo', 'đệm', 'sữa tắm', 'vòng cổ', 'đồ chơi'
    ];
    
    foreach ($dbHints as $needle) {
        if (mb_stripos($sanQuery, $needle, 0, 'UTF-8') !== false) {
            $like = '%' . $needle . '%';
            $stmt = $conn->prepare(
                "SELECT id, name FROM products WHERE LOWER(name) LIKE ? ORDER BY LENGTH(name) DESC, COALESCE(sale_price, price) DESC LIMIT 1"
            );
            if ($stmt) {
                $stmt->bind_param('s', $like);
                if ($stmt->execute()) {
                    $r = $stmt->get_result();
                    if ($r && $row = $r->fetch_assoc()) {
                        $stmt->close();
                        return (int) $row['id'];
                    }
                }
                $stmt->close();
            }
        }
    }

    $selectedIndex = null;
    if (preg_match('/th(?:ứ|u)\s*(\d+)/u', $sanQuery, $mm)) {
        $selectedIndex = max(1, (int) $mm[1]) - 1;
    } elseif (preg_match('/^\s*(\d+)\s*$/u', trim($sanQuery)) && strlen(trim($sanQuery)) <= 3) {
        $num = (int) trim($sanQuery);
        if ($num >= 1 && $num <= 20) {
            $selectedIndex = $num - 1;
        }
    }

    if ($selectedIndex !== null && !empty($_SESSION['ai_last_products'])) {
        if (preg_match_all('/product_detail\.php\?id=(\d+)/', $_SESSION['ai_last_products'], $mids)) {
            if (isset($mids[1][$selectedIndex])) {
                return (int) $mids[1][$selectedIndex];
            }
        }
    }
    return null;
}

// Các câu hỏi CSKH của PetShop
$supportResponses = [
    'bảo hành' => 'Đối với các sản phẩm như máy cho ăn tự động, máy lọc nước, PetShop hỗ trợ bảo hành chính hãng từ 6-12 tháng. Bạn vui lòng liên hệ hotline để được hướng dẫn chi tiết nhé.',
    'bảo trì' => 'Đối với các sản phẩm điện tử thú cưng, PetShop hỗ trợ bảo hành chính hãng từ 6-12 tháng. Bạn vui lòng liên hệ hotline để được hướng dẫn chi tiết.',
    'đổi trả' => 'PetShop hỗ trợ đổi trả trong 7 ngày nếu sản phẩm (đặc biệt là quần áo, phụ kiện) bị lỗi nhà sản xuất hoặc không vừa size. Lưu ý: Thức ăn/Pate đã bóc bao bì không hỗ trợ đổi trả để đảm bảo vệ sinh an toàn cho các bé.',
    'hủy đơn' => 'Để hủy đơn hàng, bạn vui lòng gọi ngay hotline 1900-1234 để PetShop kịp thời dừng đóng gói và hoàn tiền cho bạn nhé.',
    'giao hàng' => 'PetShop giao hàng siêu tốc 2h trong nội thành và 2-3 ngày với các tỉnh khác. Đơn hàng từ 500k sẽ được freeship tận nơi cho các boss!',
    'phí ship' => 'Đơn từ 500k sẽ được miễn phí vận chuyển. Các đơn dưới mức này phí ship sẽ từ 20k - 35k tùy khu vực nhé.',
    'thanh toán' => 'Bạn có thể thanh toán bằng tiền mặt khi nhận hàng (COD) hoặc chuyển khoản ngân hàng, ví Momo, ZaloPay đều được nhé.',
    'liên hệ' => 'Bạn có thể gọi số 1900-1234 hoặc inbox fanpage PetShop để đội ngũ chăm sóc khách hàng hỗ trợ bạn ngay lập tức.',
    'địa chỉ' => 'PetShop có cửa hàng tại 123 Đường Paws, Quận 1, TP.HCM và 456 Đường Meow, Hà Nội. Hoan nghênh bạn dẫn các bé đến chơi và mua sắm!',
    'giờ mở cửa' => 'PetShop mở cửa đón các bé từ 8h sáng đến 10h tối tất cả các ngày trong tuần.',
];

if (preg_match('/(?:thêm|them|mua)\s+(?:.*)?(?:vào giỏ|vao gio|giỏ hàng|gio hang|mua ngay)/u', $normalizedQuery)) {
    $explicitName = '';
    if (preg_match('/(?:thêm|them|mua)\s+(.*?)\s*(?:vào giỏ|vao gio|giỏ hàng|gio hang|mua ngay)/u', $normalizedQuery, $mmName)) {
        $explicitName = trim($mmName[1]);
    }

    $genericRefs = [
        'sản phẩm này', 'san pham nay', 'sản phẩm đó', 'san pham do', 'sản phẩm kia', 'san pham kia',
        'món này', 'mon nay', 'món đó', 'mon do', 'món kia', 'mon kia',
        'hạt này', 'hat nay', 'hạt đó', 'hat do', 'pate này', 'pate đó',
        'sp này', 'sp đó', 'sp kia'
    ];

    $isGenericRef = false;
    if ($explicitName !== '') {
        foreach ($genericRefs as $gr) {
            if ($explicitName === $gr) {
                $isGenericRef = true;
                break;
            }
        }
    }

    $pid = get_recommended_product_id_from_query($normalizedQuery);

    if (!$pid && $explicitName !== '' && !$isGenericRef) {
        $message = 'Mình không tìm thấy chính xác món "' . $explicitName . '" bạn muốn thêm vào giỏ. Bạn có thể nói rõ tên sản phẩm hơn để mình tìm cho bé yêu nhé!';
        ai_respond_and_log(true, $message, $sessionId, $currentUserId, $query);
    }

    if (!$pid) {
        $pid = get_first_recommended_product_id();
    }

    if ($pid !== null) {
        $message = ai_add_to_cart((int) $pid, 1);
    } else {
        $message = 'Hiện không có sản phẩm được đề xuất để thêm vào giỏ hàng.';
    }

    ai_respond_and_log(true, $message, $sessionId, $currentUserId, $query);
}

foreach ($supportResponses as $keyword => $responseText) {
    if (mb_stripos($normalizedQuery, $keyword, 0, 'UTF-8') !== false) {
        ai_respond_and_log(true, $responseText, $sessionId, $currentUserId, $query);
    }
}

function build_product_info_line(array $row): string
{
    $name = $row['name'] ?? '';
    $id = isset($row['id']) ? (int) $row['id'] : 0;
    $link = "product_detail.php?id={$id}";

    $priceValue = 0.0;
    if (!empty($row['sale_price']) && (float) $row['sale_price'] > 0) {
        $priceValue = (float) $row['sale_price'];
    } elseif (!empty($row['price'])) {
        $priceValue = (float) $row['price'];
    }
    $price = number_format($priceValue, 0, ',', '.') . ' VND';

    $desc = $row['description'] ?? '';
    $specs = $row['specs'] ?? '';
    $category = $row['category'] ?? '';

    if (function_exists('mb_strlen')) {
        if (mb_strlen($specs) > 220) {
            $specs = mb_substr($specs, 0, 220) . '...';
        }
    } else {
        if (strlen($specs) > 220) {
            $specs = substr($specs, 0, 220) . '...';
        }
    }

    $out = "✨ **[{$name}]({$link})** - {$price}\n";
    if ($category !== '') {
        $out .= "   • Danh mục: {$category}\n";
    }
    if ($specs !== '') {
        $out .= "   • Thông tin: {$specs}\n";
    }
    if ($desc !== '') {
        $out .= "   • Mô tả: {$desc}\n";
    }
    $out .= "\n";

    return $out;
}

$normalized = mb_strtolower($query, 'UTF-8');
$keywords = [];

$stopWords = [
    'tìm', 'tim', 'kiếm', 'kiem', 'tìm kiếm', 'tim kiem', 'giới thiệu', 'gioi thieu', 'giúp', 'giup', 
    'chọn', 'chon', 'cho', 'tôi', 'toi', 'với', 'voi', 'cần', 'can', 'có', 'co', 'phù hợp', 'phu hop', 
    'phù', 'phu', 'hợp', 'hop', 'nào', 'nao', 'muốn', 'muon', 'khoảng', 'khoang', 'tham khảo', 'tham khao', 
    'dùng', 'dung', 'dành', 'danh', 'theo', 'mua', 'nhu cầu', 'nhu cau', 'sản phẩm', 'san pham', 'xin', 
    'vui lòng', 'vui long', 'vui', 'mong', 'hãy', 'hay', 'đến', 'den', 'hãy cho', 'hay cho', 'gởi', 'gui',
    'dưới', 'duoi', 'trên', 'tren', 'tư', 'tu', 'vấn', 'van', 'giá', 'gia', 'giá cả', 'gia ca', 'triệu', 'trieu', 'tr'
];

// Danh sách hãng thức ăn/đồ dùng thú cưng
$brandNames = ['royal canin', 'whiskas', 'pedigree', 'me-o', 'purina', 'inaba', 'ciao', 'nekko', 'reflex', 'nutrience'];

// Danh sách các loại sản phẩm thú cưng phổ biến
$componentWords = [
    'hạt', 'pate', 'súp', 'cát', 'chuồng', 'balo', 'sữa tắm', 'đồ chơi', 'vòng cổ', 'xích', 'quần áo', 'nệm', 'đệm', 'khay vệ sinh'
];

// Ngữ cảnh liên quan đến thú cưng
$contextPetWords = [
    'chó', 'mèo', 'cún', 'miu', 'kitten', 'puppy', 'mèo con', 'chó con', 'thú cưng', 'boss', 'hoàng thượng'
];

$brand = '';
foreach ($brandNames as $b) {
    if (mb_stripos($normalized, $b, 0, 'UTF-8') !== false) {
        $brand = $b;
        break;
    }
}

$priceFilterType = '';
$priceFilterValue = null;

if (preg_match('/(?:dưới|duoi|<|<=)\s*(\d+(?:[\.,]\d+)?)\s*(?:tr|triệu|trieu)?/u', $normalized, $m)) {
    $priceFilterType = 'max';
    $priceFilterValue = (float) str_replace(',', '.', $m[1]) * 1000000;
} elseif (preg_match('/(?:trên|tren|>|>=)\s*(\d+(?:[\.,]\d+)?)\s*(?:tr|triệu|trieu)?/u', $normalized, $m)) {
    $priceFilterType = 'min';
    $priceFilterValue = (float) str_replace(',', '.', $m[1]) * 1000000;
} elseif (preg_match('/\b(\d+(?:[\.,]\d+)?)\s*(?:tr|triệu|trieu)\b/u', $normalized, $m)) {
    $priceFilterType = 'min';
    $priceFilterValue = (float) str_replace(',', '.', $m[1]) * 1000000;
}

$tmpQuery = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $normalized);
$words = preg_split('/\s+/u', $tmpQuery, -1, PREG_SPLIT_NO_EMPTY);

foreach ($words as $word) {
    $w = trim($word);
    if ($w === '' || is_numeric($w)) {
        continue;
    }
    $skip = false;
    foreach ($stopWords as $stop) {
        if ($w === $stop) {
            $skip = true;
            break;
        }
    }
    if ($skip) {
        continue;
    }
    $keywords[] = $w;
}

if ($brand !== '' && !in_array($brand, $keywords, true)) {
    $keywords[] = $brand;
}

$hasContextPet = false;
foreach ($contextPetWords as $cw) {
    if (mb_stripos($normalized, $cw, 0, 'UTF-8') !== false) {
        $hasContextPet = true;
        break;
    }
}

$hasComponent = false;
$detectedComponentEarly = '';
foreach ($componentWords as $cw) {
    if (mb_stripos($normalized, $cw, 0, 'UTF-8') !== false) {
        $hasComponent = true;
        $detectedComponentEarly = $cw;
        if (!in_array($cw, $keywords, true)) {
            $keywords[] = $cw;
        }
        break;
    }
}

// Nếu có nhắc đến chó/mèo mà không nói rõ là mua gì, ưu tiên gợi ý "thức ăn"
if ($hasContextPet && !$hasComponent && !in_array('thức ăn', $keywords, true)) {
    $keywords[] = 'thức ăn';
}

if ($hasComponent && in_array('thức ăn', $keywords, true)) {
    $keywords = array_values(array_filter($keywords, function ($kw) {
        return $kw !== 'thức ăn';
    }));
}

$params = [];
$whereClauses = [];

$detectedComponent = $detectedComponentEarly;
if ($detectedComponent === '') {
    foreach ($componentWords as $comp) {
        if (in_array($comp, $keywords, true)) {
            $detectedComponent = $comp;
            break;
        }
    }
}
if ($detectedComponent === '') {
    foreach ($componentWords as $comp) {
        if (mb_stripos($normalized, $comp, 0, 'UTF-8') !== false) {
            $detectedComponent = $comp;
            if (!in_array($comp, $keywords, true)) {
                $keywords[] = $comp;
            }
            break;
        }
    }
}

if ($brand !== '' && $detectedComponent !== '') {
    $brandComponentCond = [];
    $brandCond = [];
    foreach (['name', 'description', 'specs'] as $col) {
        $brandCond[] = "LOWER($col) LIKE ?";
        $params[] = '%' . $brand . '%';
    }
    $brandComponentCond[] = '(' . implode(' OR ', $brandCond) . ')';

    $compCond = [];
    foreach (['name', 'description', 'category', 'specs'] as $col) {
        $compCond[] = "LOWER($col) LIKE ?";
        $params[] = '%' . $detectedComponent . '%';
    }
    $brandComponentCond[] = '(' . implode(' OR ', $compCond) . ')';

    $whereClauses[] = '(' . implode(' AND ', $brandComponentCond) . ')';

    $keywords = array_filter($keywords, function ($kw) use ($brand, $detectedComponent) {
        return $kw !== $brand && $kw !== $detectedComponent;
    });
    $keywords = array_values($keywords);
}

if ($detectedComponent !== '' && empty($whereClauses)) {
    $compWhere = [];
    foreach (['name', 'description', 'category', 'specs'] as $col) {
        $compWhere[] = "LOWER($col) LIKE ?";
        $params[] = '%' . $detectedComponent . '%';
    }
    $whereClauses[] = '(' . implode(' OR ', $compWhere) . ')';

    $keywords = array_filter($keywords, function ($kw) use ($detectedComponent) {
        return $kw !== $detectedComponent && $kw !== 'thức ăn';
    });
    $keywords = array_values($keywords);
}

if (!empty($keywords)) {
    $keywordConds = [];
    foreach ($keywords as $kw) {
        $subCond = [];
        foreach (['name', 'description', 'category', 'specs'] as $col) {
            $subCond[] = "LOWER($col) LIKE ?";
            $params[] = '%' . $kw . '%';
        }
        $keywordConds[] = '(' . implode(' OR ', $subCond) . ')';
    }
    if (!empty($whereClauses)) {
        $whereClauses[] = '(' . implode(' OR ', $keywordConds) . ')';
    } else {
        $whereClauses[] = '(' . implode(' OR ', $keywordConds) . ')';
    }
}

if ($priceFilterType !== '' && $priceFilterValue !== null) {
    if ($priceFilterType === 'max') {
        $whereClauses[] = 'COALESCE(sale_price, price) <= ?';
    } else {
        $whereClauses[] = 'COALESCE(sale_price, price) >= ?';
    }
    $params[] = $priceFilterValue;
}

if (empty($whereClauses)) {
    if ($brand !== '') {
        $whereClauses[] = '(LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ? OR LOWER(specs) LIKE ?)';
        for ($i = 0; $i < 4; $i++) {
            $params[] = '%' . $brand . '%';
        }
    } else {
        $whereClauses[] = '(LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ? OR LOWER(specs) LIKE ?)';
        for ($i = 0; $i < 4; $i++) {
            $params[] = '%' . $normalized . '%';
        }
    }
}

$whereSql = implode(' AND ', $whereClauses);

$orderSql = '';
if ($priceFilterType === 'max') {
    $orderSql = 'ORDER BY COALESCE(sale_price, price) ASC';
} else {
    if ($detectedComponent !== '') {
        $escapedComponent = $conn->real_escape_string($detectedComponent);
        if ($brand !== '') {
            $escapedBrand = $conn->real_escape_string($brand);
            $orderSql = "ORDER BY 
                CASE 
                    WHEN LOWER(name) LIKE '%{$escapedBrand}%' AND LOWER(name) LIKE '%{$escapedComponent}%' THEN 1
                    WHEN LOWER(name) LIKE '%{$escapedComponent}%' AND LOWER(category) LIKE '%{$escapedComponent}%' THEN 2
                    WHEN LOWER(name) LIKE '%{$escapedBrand}%' OR LOWER(name) LIKE '%{$escapedComponent}%' THEN 3
                    ELSE 4
                END,
                COALESCE(sale_price, price) DESC";
        } else {
            $orderSql = "ORDER BY 
                CASE 
                    WHEN LOWER(name) LIKE '%{$escapedComponent}%' AND LOWER(category) LIKE '%{$escapedComponent}%' THEN 1
                    WHEN LOWER(name) LIKE '%{$escapedComponent}%' THEN 2
                    WHEN LOWER(name) NOT LIKE '%thức ăn%' AND LOWER(category) LIKE '%{$escapedComponent}%' THEN 3
                    ELSE 4
                END,
                COALESCE(sale_price, price) DESC";
        }
    } else {
        $orderSql = 'ORDER BY COALESCE(sale_price, price) DESC';
    }
}

$sql = "SELECT * FROM products WHERE $whereSql $orderSql LIMIT 20";

$info = '';
$foundProducts = false;
$stmt = $conn->prepare($sql);
if ($stmt) {
    if (!empty($params)) {
        $types = '';
        foreach ($params as $p) {
            if (is_int($p) || is_float($p)) {
                $types .= 'd';
            } else {
                $types .= 's';
            }
        }
        $stmt->bind_param($types, ...$params);
    }
    if ($stmt->execute()) {
        $res = $stmt->get_result();
        while ($row = $res->fetch_assoc()) {
            $info .= build_product_info_line($row);
            $foundProducts = true;
        }
        $res->free();
    }
    $stmt->close();
}

if (!$foundProducts && $brand !== '' && $detectedComponent !== '') {
    $fallbackParams = [];
    $fallbackWhere = [];

    $fallbackCond = [];
    foreach (['name', 'description', 'category', 'specs'] as $col) {
        $fallbackCond[] = "(LOWER($col) LIKE ? OR LOWER($col) LIKE ?)";
        $fallbackParams[] = '%' . $brand . '%';
        $fallbackParams[] = '%' . $detectedComponent . '%';
    }
    $fallbackWhere[] = '(' . implode(' OR ', $fallbackCond) . ')';

    if ($priceFilterType !== '' && $priceFilterValue !== null) {
        if ($priceFilterType === 'max') {
            $fallbackWhere[] = 'COALESCE(sale_price, price) <= ?';
        } else {
            $fallbackWhere[] = 'COALESCE(sale_price, price) >= ?';
        }
        $fallbackParams[] = $priceFilterValue;
    }

    $fallbackSql = "SELECT * FROM products WHERE " . implode(' AND ', $fallbackWhere) . " " . $orderSql . " LIMIT 20";

    $stmtFallback = $conn->prepare($fallbackSql);
    if ($stmtFallback) {
        if (!empty($fallbackParams)) {
            $types = '';
            foreach ($fallbackParams as $p) {
                if (is_int($p) || is_float($p)) {
                    $types .= 'd';
                } else {
                    $types .= 's';
                }
            }
            $stmtFallback->bind_param($types, ...$fallbackParams);
        }
        if ($stmtFallback->execute()) {
            $res = $stmtFallback->get_result();
            $info = '';
            while ($row = $res->fetch_assoc()) {
                $info .= build_product_info_line($row);
                $foundProducts = true;
            }
            $res->free();
        }
        $stmtFallback->close();
    }
}

if (!$foundProducts && $brand !== '') {
    $brandOnlyParams = [];
    $brandOnlyWhere = ['(LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ? OR LOWER(specs) LIKE ?)'];
    for ($i = 0; $i < 4; $i++) {
        $brandOnlyParams[] = '%' . $brand . '%';
    }

    if ($priceFilterType !== '' && $priceFilterValue !== null) {
        if ($priceFilterType === 'max') {
            $brandOnlyWhere[] = 'COALESCE(sale_price, price) <= ?';
        } else {
            $brandOnlyWhere[] = 'COALESCE(sale_price, price) >= ?';
        }
        $brandOnlyParams[] = $priceFilterValue;
    }

    $brandOnlySql = "SELECT * FROM products WHERE " . implode(' AND ', $brandOnlyWhere) . " " . $orderSql . " LIMIT 20";

    $stmtBrand = $conn->prepare($brandOnlySql);
    if ($stmtBrand) {
        $types = '';
        foreach ($brandOnlyParams as $p) {
            if (is_int($p) || is_float($p)) {
                $types .= 'd';
            } else {
                $types .= 's';
            }
        }
        $stmtBrand->bind_param($types, ...$brandOnlyParams);
        if ($stmtBrand->execute()) {
            $res = $stmtBrand->get_result();
            $info = '';
            while ($row = $res->fetch_assoc()) {
                $info .= build_product_info_line($row);
                $foundProducts = true;
            }
            $res->free();
        }
        $stmtBrand->close();
    }
}

if ($info !== '' && !$handledNumberSelection) {
    $_SESSION['ai_last_products'] = $info;
    $_SESSION['ai_last_question'] = $query;
}

if ($info === '' && !empty($_SESSION['ai_last_products']) && !$handledNumberSelection) {
    $info = $_SESSION['ai_last_products'];
}

if ($info === '') {
    $res = $conn->query('SELECT * FROM products ORDER BY id DESC LIMIT 5');
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $info .= build_product_info_line($row);
        }
        $res->free();
    }
}

// ===================================
//   Tạo prompt gửi cho mô hình Gemini 
// ===================================

$lastQuestion = $_SESSION['ai_last_question'] ?? '';

if ($info !== '') {
    $prompt = "Bạn là trợ lý ảo tư vấn khách hàng cực kỳ thân thiện và am hiểu của PetShop - Cửa hàng chuyên cung cấp thức ăn, phụ kiện, đồ chơi và dịch vụ chăm sóc cho chó mèo.\n\n";

    if ($lastQuestion && !$newChat) {
        $prompt .= "Ở lần trước, khách đã hỏi: \"{$lastQuestion}\" và bạn đã gợi ý các sản phẩm sau:\n";
    } else {
        $prompt .= "Dưới đây là danh sách sản phẩm hiện có trong shop:\n";
    }

    $prompt .= $info . "\n";
    $prompt .= "Mỗi sản phẩm bao gồm: tên, giá, danh mục, và thông tin chi tiết (thành phần, độ tuổi, công dụng).\n";
    $prompt .= "Tên sản phẩm đã được viết sẵn dưới dạng Markdown link [Tên sản phẩm](product_detail.php?id=SỐ_ID). Khi tư vấn hoặc khi khách muốn xem chi tiết, hãy sử dụng lại đúng các link này, KHÔNG tự tạo link mới.\n\n";

    $prompt .= "Hiện tại khách hỏi: \"{$query}\".\n\n";
    $prompt .= "YÊU CẦU:\n";
    $prompt .= "- Tư vấn chuyên sâu về dinh dưỡng, lựa chọn thức ăn/phụ kiện phù hợp với chó, mèo dựa trên độ tuổi (kitten, puppy, adult) hoặc giống loài.\n";
    $prompt .= "- Kết hợp thông tin trong danh sách sản phẩm VÀ hiểu biết chung của bạn về chăm sóc thú cưng để đưa ra lời khuyên chân thành, hữu ích.\n";
    $prompt .= "- Thái độ: Vui vẻ, nhiệt tình. Xưng 'mình' hoặc 'PetShop', gọi khách là 'bạn'. Rất khuyến khích dùng các từ ngữ dễ thương như 'boss', 'hoàng thượng', 'bé cưng', 'sen'.\n";
    $prompt .= "- QUY TẮC NGHIÊM NGẶT: TUYỆT ĐỐI KHÔNG tư vấn về các sản phẩm công nghệ (Laptop, RAM, SSD, Điện thoại, Chuột, Bàn phím...). Nếu khách cố tình hỏi ngoài lề, hãy khéo léo từ chối và hướng họ quay lại chủ đề chăm sóc chó mèo.\n";
    $prompt .= "- Mỗi sản phẩm gợi ý nên trình bày dạng:\n";
    $prompt .= "  🐾 **Tên sản phẩm** - GIÁ\n";
    $prompt .= "     • Ưu điểm nổi bật (dinh dưỡng / công dụng / chất liệu...).\n";
} else {
    $prompt = "Bạn là trợ lý ảo của PetShop.\n";
    $prompt .= "Hiện tại không lấy được dữ liệu sản phẩm từ cơ sở dữ liệu.\n";
    $prompt .= "Khách hỏi: \"{$query}\".\n";
    $prompt .= "Hãy trả lời chung chung, thân thiện về kinh nghiệm chăm sóc thú cưng và khuyên khách hàng liên hệ trực tiếp cửa hàng.\n";
}

require_once __DIR__ . '/../includes/config.php';
$apiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : '';

if (!$apiKey) {
    ai_respond_and_log(false, 'Chưa cấu hình khóa API Gemini.', $sessionId, $currentUserId, $query);
}
if (!function_exists('curl_init')) {
    ai_respond_and_log(false, 'Máy chủ không hỗ trợ cURL.', $sessionId, $currentUserId, $query);
}

$model = 'gemini-2.5-flash';
$url = 'https://generativelanguage.googleapis.com/v1beta/models/' . $model . ':generateContent?key=' . urlencode($apiKey);

$payload = [
    'contents' => [
        [
            'parts' => [['text' => $prompt]]
        ]
    ]
];

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);
curl_close($ch);

// Ghi log
file_put_contents(
    __DIR__ . '/ai_support_log.txt',
    date('Y-m-d H:i:s') . " HTTP:$httpCode\n" .
    "CURL_ERR: $curlErr\n" .
    "RESP: $response\n\n",
    FILE_APPEND
);

if ($response === false) {
    ai_respond_and_log(false, 'Không kết nối được tới Gemini.', $sessionId, $currentUserId, $query);
}

$data = json_decode($response, true);

if ($httpCode !== 200) {
    $errMsg = $data['error']['message'] ?? 'Không rõ nguyên nhân';
    $msg = "Lỗi từ Gemini (HTTP $httpCode): $errMsg";
    ai_respond_and_log(false, $msg, $sessionId, $currentUserId, $query);
}

if (!isset($data['candidates'][0]['content']['parts'][0]['text'])) {
    ai_respond_and_log(false, 'Dữ liệu trả về từ Gemini không đúng định dạng.', $sessionId, $currentUserId, $query);
}

$reply = trim($data['candidates'][0]['content']['parts'][0]['text']);

ai_respond_and_log(true, $reply, $sessionId, $currentUserId, $query);