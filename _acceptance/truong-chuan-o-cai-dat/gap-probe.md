---
slug: truong-chuan-o-cai-dat
at: 2026-10-21T01:00:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

# Phản biện context sạch — truong-chuan-o-cai-dat

Tác tử tươi (`feature-loop:cham-doc`) đọc đúng sáu tệp: design doc, `contract.md`, `evals.yaml`, `decisions.jsonl`,
bài học từ claim-scan và `opportunity.md`. Không đọc mã của kho.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng d-8 «bắt buộc luôn hiện» ghi mot-loi, nhưng docs/design.md cho form tạo hiện «trường bắt buộc và trường đang hiện trên phiếu», nên lối cho ẩn trường bắt buộc vẫn sống | Người ký AC-4, AC-6 vì tin đây là lối duy nhất; đội một tiền tệ không ẩn được «Tiền tệ» | Thay d-8 bằng một câu chỉ-người | human-gate1: thành Hỏi-4 (dòng d-20261021T005653Z-11 supersedes d-8); AC-4, AC-6 viết theo khuyến nghị, đổi theo câu trả lời |
| P0 | contract | Hai dòng descope mục-tiêu trích câu không quyết thứ mình descope (d-2 Mô tả và Giai đoạn, d-9 ô đầu phiếu và Kara); «Bố trí riêng từng người» không có dòng sổ | Người ký Out of scope vì tin luật đích đã quyết; ẩn «Người phụ trách» vẫn thấy ở đầu phiếu | Câu trích quyết đúng thứ bị descope, hoặc thành câu hỏi | human-gate1: d-2 thành Hỏi-5, d-9 thành Hỏi-6; fixed: thêm dòng descope cho bố trí riêng từng người, trích docs/settings.md |
| P1 | evals | Ca lưu lỗi chưa đo đủ: E2 không có ca fields.reorder lỗi; E3 chỉ khẳng định toast không chứa câu máy chủ | Bản dựng nuốt lỗi kéo, danh sách đứng thứ tự mới còn máy chủ giữ thứ tự cũ — đúng ngưỡng CHẾT của opportunity.md | Ca lỗi có đối chứng dương và câu ghim | fixed: AC-2 thêm vế lỗi; E2 thêm ca lỗi ('loi khong ve', 'khong bao loi'); E3 ghim toast «Chưa lưu được Thành phố.» |
| P1 | evals | Vế «bảng Công ty vẫn có cột Thành phố» của AC-3 không eval nào đo | Lọc mục ẩn ngay ở danh mục chung làm mất cột trên bảng, mọi eval vẫn xanh | Dựng bảng Công ty thật với city ẩn | fixed: E3 vế (4) 'tcc an: bang mat cot' có đối chứng cột 'Tên' |
| P2 | evals | Fixture bố trí ở E3, E7b, E8b dựng tay; bốn AC qua máy chủ thiếu tag (cross-layer); chiều chuột của AC-2 và phiếu 375 chưa đo | API đổi tên khoá mà bài DOM vẫn xanh trên fixture tay | Schema đầu ra một chỗ, fixture qua parse | fixed: design thêm schema @crm/validation/bo-tri-truong, mọi fixture qua parse; AC-4, AC-6, AC-7, AC-8 gắn (cross-layer); E9 kéo và bấm bằng chuột thật, chụp phiếu 375 |
