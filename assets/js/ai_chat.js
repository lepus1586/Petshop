// Chatbox AI hoàn thiện: front-end
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('ai-chat-toggle');
    const panel = document.getElementById('ai-chat-panel');
    const closeBtn = document.getElementById('ai-chat-close');
    const input = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send');
    const messagesBox = document.getElementById('ai-chat-messages');
    const historyList = document.getElementById('ai-chat-history-list'); // ID này cần khớp với HTML của bạn

    if (!toggleBtn || !panel || !closeBtn || !input || !sendBtn || !messagesBox) return;

    // --- 1. TỰ ĐỘNG TẢI LỊCH SỬ KHI TRANG LOAD ---
    loadChatHistory();

    function appendMessage(text, type) {
        const div = document.createElement('div');
        div.className = 'ai-msg ' + type;
        div.textContent = text;
        messagesBox.appendChild(div);
        messagesBox.scrollTop = messagesBox.scrollHeight;
    }

    // Hàm tải lịch sử cuộc trò chuyện
    async function loadChatHistory() {
        if (!historyList) return;
        try {
            // Gọi action get_history (Bạn cần kiểm tra api/ai_support.php có hỗ trợ action này chưa)
            const res = await fetch('chatbot_api.php?action=get_history');
            const data = await res.json();
            
            if (data.success && data.history) {
                historyList.innerHTML = '';
                data.history.forEach(item => {
                    const li = document.createElement('div');
                    li.className = 'history-item';
                    li.textContent = item.title || 'Cuộc trò chuyện mới';
                    historyList.appendChild(li);
                });
            } else {
                historyList.innerHTML = '<p>Chưa có lịch sử.</p>';
            }
        } catch (err) {
            console.error("Lỗi load history:", err);
            historyList.innerHTML = '<p>Không thể tải lịch sử.</p>';
        }
    }

    // --- 2. XỬ LÝ GỬI TIN NHẮN ---
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;
        
        appendMessage(text, 'user');
        input.value = '';

        try {
            // Đảm bảo đường dẫn này đúng với vị trí file chatbot_api.php của bạn
            const res = await fetch('chatbot_api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            // Nếu server trả lỗi (ví dụ lỗi 500), hiện thông báo rõ ràng
            if (!res.ok) {
                const errorText = await res.text();
                console.error("Server Error:", errorText);
                appendMessage('Lỗi server: Không thể kết nối tới máy chủ AI.', 'bot');
                return;
            }

            const data = await res.json();
            if (data.reply) {
                appendMessage(data.reply, 'bot');
            } else if (data.error) {
                appendMessage('Lỗi: ' + data.error, 'bot');
            } else {
                appendMessage('Xin lỗi, tôi không thể xử lý câu hỏi này lúc này.', 'bot');
            }
        } catch (err) {
            console.error("Lỗi kết nối:", err);
            appendMessage('Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại mạng hoặc server.', 'bot');
        }
    }

    // --- 3. SỰ KIỆN GIAO DIỆN ---
    toggleBtn.addEventListener('click', () => panel.classList.toggle('hidden'));
    closeBtn.addEventListener('click', () => panel.classList.add('hidden'));
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});