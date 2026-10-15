---
slug: re-mo-hinh-mac-dinh
at: 2026-10-15T11:05:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | AC-6 chấm bốn chỉ số tổng, còn ô cơ hội ghi «mỗi ô theo tầng và kiểu chữ»; câu trích của dòng sổ không chọn giữa hai cách đọc [hoi-dap-okr#F1] | Đúng trang tổng 82% nhưng ô câu không dấu một tầng còn 60%: E5 xanh, thẻ ghi SỐNG, theo ô cơ hội là CHẾT | Câu Hỏi trên thẻ Cổng Phạm vi; dòng sổ thay d-5; chọn chấm ô thì so-nguong in bảng ô và có chiều đỏ tụt một ô | human-gate1: Hỏi-1 (máy khuyên chấm tổng theo ngưỡng cũ, in kèm bảng ô) |
| P0 | design | «Không làm» chốt giữ lựa chọn của workspace đã lưu GLM mà phạm vi đã duyệt không nói | Workspace lưu GLM trên production vẫn chạy GLM sau khi giao; mọi eval xanh | Câu Hỏi trên thẻ Cổng 1 kèm dòng sổ | human-gate1: Hỏi-2 (máy khuyên giữ; màn Cài đặt có ô «Mặc định» riêng nên GLM lưu là lựa chọn có chủ ý) |
| P1 | evals | E5 kiểm băm mã trợ lý và ngưỡng nhưng không chứng lượt đo đã gọi Gemini | Lượt đo đi model khác qua một đường riêng mà E5 vẫn xanh | Mỗi dòng kết quả ghi mã model Gateway trả về | deferred: bộ chấm của hồ sơ đã ký không ghi mã model; E5 thêm vế cấu hình của cây chọn Gemini và danh sách tệp phải có tai-lieu-config.ts; dòng sổ revisit |
| P1 | evals | E2 đo cờ ZDR trên bản bọc modelTaiLieu, không trên đường subagent thật [d-20261015T023909Z-26] | Subagent đọc thẳng maModel rồi gọi gateway, yêu cầu thật thiếu ZDR mà E2 xanh | Ma trận hai đường thật, chiều đỏ gỡ middleware | fixed: E2 lấy model từ chính định nghĩa may_soan và tro_ly_kho, gắn backend-effect; AC-3 sửa câu |
| P2 | evals | E1b dùng mã không có trong danh mục; đường lùi về mặc định không có ca; ảnh chụp giá không có xuất xứ | Ca (b) lùi về Gemini nên đỏ oan; ảnh chụp gõ tay đảo giá mà E3 vẫn xanh | Mã có trong danh mục cho (b), ca (c) lùi; ảnh chụp sinh bằng script có fetched_at, sha; E3 so thêm giá chủ kho duyệt | fixed: E1 ba ca (a)(b)(c), AC-1 thêm vế lùi; ảnh chụp do rang/chup-danh-muc.ts ghi; E3 so ba nguồn |
