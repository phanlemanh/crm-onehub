---
slug: go-tin-hieu-rac
at: 2026-10-19T13:58:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

# Phản biện context sạch — go-tin-hieu-rac

Một tác tử tươi (`feature-loop:cham-doc`) đọc đúng sáu tệp: design doc, `contract.md`, `evals.yaml`,
`decisions.jsonl`, bài học xuyên tính năng (claim-scan, 12 dòng) và `opportunity.md`. Không đọc mã kho.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract+evals | AC-7 không nói ba ô số phải đổi ngay sau lưu trữ, Hoàn tác, Khôi phục; ô số tính một lần ở trang máy chủ, E7b khoá cứng ô số, E5c không đọc ô số | Lưu trữ một tín hiệu: bảng còn 4 dòng mà ô «30 ngày qua» vẫn 5 tới khi tải lại; mọi eval xanh | AC-7 thêm vế không tải lại; E5c đọc ô số ở bốn mốc so với API; E7b thêm ca lưu trữ thành công | fixed: AC-7 thêm vế «đổi ngay, bằng số đếm của Tất cả mặc định»; design §3 đếm ở `TatCaTrang` bằng hàm chung trên truy vấn mặc định; E5c đọc ô số ở bốn mốc kèm chiều đỏ; E7b thêm ca 2 |
| P1 | contract | Đường đo ngưỡng 2 tự so với chính bảng vết; ngưỡng 1 «sống» cả khi chưa có tín hiệu nào được lưu trữ | Một nhánh quên ghi vết vẫn cho ngưỡng 2 bằng nhau; trước lượt kéo về đầu tiên chưa ai lưu trữ thì ngưỡng 1 báo SỐNG mà chưa đo | Ngưỡng 2 so với cột `archivedAt`/`archivedById`; ngưỡng 1 cần tập đã lưu trữ khác rỗng, rỗng thì «chưa đo được» | fixed: mục «Đường đo» viết lại đúng hai thước đề xuất, ghi rõ ca miễn khi tài khoản đã xoá |
| P2 | evals | Chiều đỏ ca chạy đồng thời của E3 dựa vào 12 lần `Promise.all`, không bảo đảm xen nhau | Bản đột biến bỏ khoá rơi đúng thứ tự an toàn 12 lần, ô vẫn xanh | Hai ca có thứ tự: giữ khoá của bên này, khẳng định bên kia đang chờ, rồi xả | fixed: E3 ô 2 thành hai ca có thứ tự (a) và (b), mỗi ca một chiều đỏ ghim thông điệp |
| P2 | design | Dòng sổ d-4 trích luật vòng đời (chỉ quyết số trên màn) làm căn cứ đổi cách đếm của lệnh kéo về | Người duyệt tưởng luật vòng đời buộc đổi số ngưỡng sống đã ký của LT2/TH4 | Dòng sổ mới trích ô cơ hội | fixed: dòng sổ mới supersedes d-20261019T134430Z-4, trích câu «Vì sao» của `opportunity.md` |
| P2 | evals | E11 hỏi «chữ MỚI» trong khi hội đồng không có diff, và đối chiếu với mục từ điển do chính vòng viết | Hội đồng UNCERTAIN hoặc PASS vô nghĩa | Liệt sẵn khoá cần chấm; chuẩn lấy từ «Bộ chữ» của `docs/vong-doi.md` | fixed: E11 liệt đúng 17 khoá, bỏ `CONTEXT.md` khỏi `inputs` |
