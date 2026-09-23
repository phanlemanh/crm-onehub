---
slug: khoa-cu-khong-mo-khoa-moi
at: 2026-09-23T14:47:30Z
verdict: findings
p0: 0
p1: 3
p2: 1
---

# Phản biện context sạch — khoa-cu-khong-mo-khoa-moi

Một agent tươi, chỉ đọc design doc, contract, evals, sổ quyết định và tệp bài học
xuyên hồ sơ (claim-scan, 12 dòng). Không đọc mã.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Lượt dọn ghi dữ liệu thật, khó đảo, mà Cổng 2 không có con số nào về số khoá sẽ tắt trên production; điều kiện xét lại của d-20260923T144150Z-2 không bật được vì không ai thấy nhóm bị ảnh hưởng | Production có khoá của người không có dòng member mà vẫn cần sống; E5/E6 xanh trên dữ liệu dựng, người ký duyệt mù, migrate deploy tắt hàng loạt | Câu đếm chỉ-đọc cùng mệnh đề WHERE của migration, in số khoá, số chủ, số khoá dùng gần đây, đính vào Cổng 2 | fixed: thêm AC-9 + E9 — lệnh `packages/db/scripts/xem-truoc-luot-don.ts` rút mệnh đề bằng máy từ migration.sql, chạy BEGIN READ ONLY, chỉ nhận XEM_TRUOC_DATABASE_URL; bài kiểm ghim «số xem trước = số dòng migration đổi». Máy không với tới production nên người ký chạy lệnh ở Cổng 2 (ghi trong Notes của contract) |
| P1 | evals | E5/E6 không nói khoá dựng bằng writer thật hay chèn tay; cả migration lẫn fixture giả định referenceId giữ id người dùng [dieu-phoi-30-ngay-dau#F1] | writer thật ghi chủ khoá ở cột khác, bài tự khớp giả định của nó và xanh, production tắt nhầm khoá thành viên | Tạo khoá bằng auth.api.createApiKey, khẳng định referenceId trước khi dọn | fixed: mọi khoá của E5/E6/E9 tạo bằng auth.api.createApiKey; E5 so BẰNG [referenceId, enabled] của năm khoá trước lượt dọn |
| P1 | evals | Chiều đỏ «đặt plugin trước apiKey(...)» chỉ là lời khẳng định, chưa chạy thật, và không đòi lưu [chu-cuoi-cung-tien-de#F1] | Móc plugin khoá không phụ thuộc vị trí; đột biến vẫn xanh, ghim thứ tự chỉ trên giấy | Chạy thật đột biến, lưu mã thoát và dòng thông điệp vào bằng chứng | fixed: kế hoạch Task 1 Step 5 chạy thật lượt phá thử và ghi vào `evidence/pha-thu.md`; expected của E1–E3 trỏ tới tệp đó. Không thêm khoá lạ vào evidence_required vì bộ đọc của kit không biết khoá đó |
| P2 | contract | Trục D có ô không AC nào phủ: ngoài kho với khoá false, thành viên với khoá null, bảng rỗng với khoá null | Bỏ lọc enabled thì khoá đã tắt bị đè updatedAt mà E5 vẫn xanh; một bản sửa đụng khoá null của thành viên lọt | Ma trận viết trước cho trục D | fixed: E5 thêm b3 (ngoài kho, false, updatedAt 2020-01-01 — phải giữ cả hai) và c2 (thành viên, null — phải giữ null); E6 thêm b2 null. Ô «false bất kỳ × bảng rỗng» cùng vị từ với b3, không thêm ca |
