---
slug: tac-nhan-model-rieng
at: 2026-09-27T07:05:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E4 gọi thẳng hàm xử lý với sự kiện viết tay; không đo hook có được eve gọi, có lọc purpose, có lấy runId từ thuộc tính phiên không; fixture viết theo khuôn bên đọc [tra-loi-tin-nhac#F1]; thiết kế không nói đã đọc guide hook | Hàm đúng nên E4 xanh nhưng hook đăng ký sai hoặc không thấy runId; ngoài đời lượt Gemini hỏng rơi xuống RUNNER_NO_RESULT, mất lý do «ref loops» | Đi qua hook thật trong ngữ cảnh eve thử [d-20260926T232446Z-11]; sự kiện ghi lại từ phiên eve thật; thuộc tính lấy từ send của dispatchAgentRun | fixed: E4 chạy default export của hook trong eve-ngu-canh với auth bắt từ dispatchAgentRun; fixture runner-loi-that.json chép từ agentRunEvent của một lượt Gemini thật (chụp ở S3); thêm đối chứng purpose research; thiết kế ghi đã đọc eve/docs/guides/hooks.md |
| P1 | evals | E2 tự ráp chat/completions bằng chính hàm chuyển khuôn của E1, nên vòng tròn; 2xx với max_tokens 64 không chứng minh model gọi được finish_run với kết quả có nội dung | eve gửi strict/khác khuôn nên lượt thật bị từ chối mà E2 vẫn xanh; hoặc Gemini nhận khuôn nhưng nộp result rỗng, «Hỏng mà vẫn Xong» quay lại | Ép toolChoice finish_run, nhắn hai khoá có tên, parse đối số bằng khuôn run-result; đi qua tầng eve dùng | fixed: E2 dùng generateText/tool/jsonSchema của gói ai nạp từ eve, gọi model bằng mã chuỗi qua Gateway; ép finish_run; assert parse được và đủ hai khoá kiemTra, soDem; chiều đỏ có mã thoát riêng 3 |
| P1 | design, contract, evals | Chưa chốt câu mặc định khi output lỗi không có message; giả định nói AC-4 đo điều đó nhưng không có ca | output là chuỗi hoặc {} → đọc .message undefined, failRun ném hoặc bỏ qua, lượt không đóng | Chốt một câu mặc định ở design và AC-4; thêm ca chuỗi trần và {} | fixed: câu «Bộ chạy báo lỗi nhưng không nói lý do.» ghi ở design, AC-4 và giả định; E4 thêm ma trận 4 ô (message dài, chuỗi trần, {}, null) |
| P2 | design, contract | Thiết kế coi OpenAI từ chối là phát hiện để sau, còn AC-2 đòi cả ba 2xx [tien-te-chua-tai-khong-doan#F1] | S4 OpenAI trả 400, E2 đỏ, không có hướng đã duyệt → lấn phạm vi hoặc sửa hợp đồng sau duyệt | Chốt một hướng ở Cổng 1 | fixed: chọn hướng 1 — cả ba bắt buộc; bỏ câu trong Rủi ro; thiết kế ghi rõ nhà cung cấp nào từ chối là khuôn chưa di động và sửa khuôn thuộc phạm vi vòng này |
| P2 | evals | E1 so đếm với chính glob nên luôn khớp; ô công cụ gốc không có số tối thiểu; tệp không có inputSchema bị coi là đã tắt | Công cụ gốc ở thư mục con hoặc khai khuôn khác bị bỏ qua; một $ref ở gốc lọt | Số tối thiểu theo từng ô, kiểm bằng tên; chỉ xếp đã tắt khi có disableTool; glob ** | fixed: glob `**`; tối thiểu theo tên cho gốc (≥ 20 khuôn, có search_crm, read_crm_history), bộ dựng (3 tên), bộ chạy (6 tên), hai outputSchema; không khuôn mà không disableTool thì là vi phạm, có đối chứng riêng |
