// assets/js/supportbox.js - Phiên bản đã fix lỗi đường dẫn
document.addEventListener('DOMContentLoaded', () => {
    const panel     = document.getElementById('chatbox-panel');
    const toggleBtn = document.getElementById('chatbox-toggle');
    const closeBtn  = document.getElementById('chatbox-close');
    const inputEl   = document.getElementById('chatbox-input');
    const sendBtn   = document.getElementById('chatbox-send');
    const resetBtn  = document.getElementById('chatbox-reset');
    const newBtn    = document.getElementById('chatbox-new');
    const messages  = document.getElementById('chatbox-messages');
    const sessionList = document.getElementById('chatbox-session-list');

    if (!panel || !toggleBtn || !closeBtn || !inputEl || !sendBtn || !messages || !sessionList) {
        console.warn('Chatbox elements not found');
        return;
    }

    let nextMessageStartsNewChat = false;
    let currentSessionId = 0;
    let sessions = [];

    // ====== MỞ / ĐÓNG KHUNG CHAT ======
    toggleBtn.addEventListener('click', () => {
        panel.classList.remove('chatbox-hidden');
        inputEl.focus();
    });

    closeBtn.addEventListener('click', () => {
        panel.classList.add('chatbox-hidden');
    });

    if (resetBtn) resetBtn.addEventListener('click', startNewChat);
    if (newBtn) newBtn.addEventListener('click', startNewChat);

    sendBtn.addEventListener('click', sendMessage);
    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    async function sendMessage() {
        const text = inputEl.value.trim();
        if (!text) return;

        appendMessage('user', text);
        inputEl.value = '';

        const body = { message: text };
        if (nextMessageStartsNewChat || currentSessionId === 0) body.new_chat = true;
        if (currentSessionId > 0) body.session_id = currentSessionId;

        try {
            const res = await fetch('api/ai_support.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const textData = await res.text();
            let data;
            try {
                data = JSON.parse(textData);
            } catch (e) {
                console.error("Server trả về lỗi HTML thay vì JSON:", textData);
                appendMessage('bot', 'Lỗi hệ thống: Máy chủ trả về phản hồi không hợp lệ.');
                return;
            }

            if (!data.success) {
                appendMessage('bot', data.reply || 'Có lỗi xảy ra.');
            } else {
                appendMessage('bot', data.reply);
                if (data.session_id) currentSessionId = data.session_id;
                nextMessageStartsNewChat = false;
                loadSessions(false, currentSessionId);
            }
        } catch (err) {
            appendMessage('bot', 'Không thể kết nối tới máy chủ AI.');
        }
    }

    function appendMessage(sender, text) {
        const wrapper = document.createElement('div');
        wrapper.className = `chatbox-message chatbox-message-${sender}`;
        
        const label = document.createElement('div');
        label.className = 'chatbox-label';
        label.textContent = sender === 'user' ? 'Bạn' : 'Tư vấn AI';

        const bubble = document.createElement('div');
        bubble.className = 'chatbox-bubble';
        bubble.innerHTML = sender === 'bot' ? formatBotText(text) : text;

        wrapper.appendChild(label);
        wrapper.appendChild(bubble);
        messages.appendChild(wrapper);
        messages.scrollTop = messages.scrollHeight;
    }

    function formatBotText(text) {
        if (!text) return '';
        let safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        return safe.replace(/\n/g, '<br>');
    }

    async function loadSessions(selectIfEmpty = true, keepActiveId = 0) {
        try {
            const res = await fetch('api/ai_support_history.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (res.status === 401) {
                renderSessionError('Vui lòng đăng nhập để xem lịch sử chat', true);
                return;
            }

            const data = await res.json();
            if (!data.success) {
                renderSessionError(data.message || 'Lỗi tải lịch sử');
                return;
            }

            sessions = data.sessions || [];
            renderSessions();
            if (selectIfEmpty && currentSessionId === 0 && sessions.length > 0) {
                selectSession(sessions[0].id);
            }
        } catch (err) {
            renderSessionError('Không thể tải lịch sử');
        }
    }

    function renderSessionError(text, isUnauthorized = false) {
        sessionList.innerHTML = `<div style="text-align: center; padding: 10px;">
            <p>${text}</p>
            ${isUnauthorized ? '<button onclick="window.location.href=\'login.php\'">Đăng nhập</button>' : ''}
        </div>`;
    }

    function renderSessions() {
        sessionList.innerHTML = '';
        sessions.forEach(sess => {
            const item = document.createElement('div');
            item.className = `chatbox-session-item ${sess.id === currentSessionId ? 'active' : ''}`;
            item.innerHTML = `<div><strong>${sess.title || 'Cuộc trò chuyện'}</strong><br><small>${sess.created_at}</small></div>`;
            item.onclick = () => selectSession(sess.id);
            sessionList.appendChild(item);
        });
    }

    async function selectSession(id) {
        currentSessionId = id;
        messages.innerHTML = '';
        try {
            const res = await fetch('api/ai_support_history.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: id })
            });
            const data = await res.json();
            if (data.success) {
                data.messages.forEach(m => appendMessage(m.sender, m.message));
            }
        } catch (err) { console.error(err); }
    }

    function startNewChat() {
        messages.innerHTML = '';
        appendMessage('bot', 'Chào Hoang, tôi có thể giúp gì cho bạn?');
        currentSessionId = 0;
    }

    loadSessions(true);
});