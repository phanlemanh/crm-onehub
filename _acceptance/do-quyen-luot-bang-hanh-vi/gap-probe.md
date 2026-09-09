---
slug: do-quyen-luot-bang-hanh-vi
at: 2026-09-09T14:41:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
claims_input: ok
---

# Phản biện context sạch — do-quyen-luot-bang-hanh-vi

Một agent context sạch, đọc đúng năm tệp: design doc · contract · evals ·
decisions.jsonl · bảng bài học xuyên feature (claim-scan). Không đọc mã kho.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design + evals (E1) | Chuỗi trong design bắt đầu từ hàng DB, nhưng `expected` của E1 bắt đầu từ khối tham số của `builderSessionAttributes`. Mũi tên đầu — chỗ mã rút trường từ hàng — không eval nào đi qua; fixture viết tay đúng khuôn bên đọc, không round-trip từ nơi giá trị thật sự được đặt [chan-uy-thac-sai-luot#F1] | Sửa chỗ gọi trong `custom-agent-dispatch.ts` thành `commandType: <ternary xuống dòng trên row.message>`. AC-2 xanh (chữ ký hàm không đổi), AC-3 xanh (ngoài `apps/api`), E1 xanh (fixture nạp thẳng vào `builderSessionAttributes`). Agent suy lại quyền từ tin nhắn mà mọi AC đều xanh | E1 gọi hàm sản phẩm nhận HÀNG; thêm điểm 3 của AC-2: initializer `commandType` tại mọi chỗ gọi phải là truy cập thuộc tính trần, kèm vectơ đỏ cấy ternary xuống dòng | fixed: AC-1 đổi fixture sang hàng và đo qua `builderSessionAuthFromRow`; AC-2 thêm điểm 3; E3 thêm vectơ `cho-goi-tinh-toan`; E2 thêm vectơ `ternary-xuong-dong` |
| P0 | evals (E2, E5) | Cây sao dựng bằng `git worktree add` tại HEAD. HEAD không chứa thay đổi chưa commit, mà S4 chạy trên cây làm việc. Không assert nào đòi bản sao phải chứa mã đang xét trước khi tin màu | Ở S4, mã mới còn trong working tree. E2 dựng cây sao tại HEAD = mã cũ, đối chứng dương xanh trên spec cũ, đột biến trên mã cũ ra đỏ đúng chuỗi ghim. Toàn bộ E2 và E5 báo xanh về một cây KHÔNG phải cây đang xét | Cây sao dựng từ trạng thái đang xét (`git stash create` rồi worktree lên object đó); thêm assert danh tính trên bản sao chưa đột biến, không đạt là mã 2 với chữ «cây sao không chứa mã đang xét»; in đường tuyệt đối và sha | fixed: E2 và E5 khai cả hai yêu cầu, kèm nội dung assert danh tính (`builderCommandType` vắng · `builderSessionAttributes` không có `message` · `builderSessionAuthFromRow` có) |
| P1 | contract (AC-5 vs AC-8) | AC-5 xoá bài đo trong spec, AC-8 đóng băng từng ký tự E5 của hồ sơ cũ. Không AC nào nói eval cũ còn chạy được không sau khi mã nó gọi bị xoá. `recheck: strict` | Kiểm lại và xác nhận, qua đường khác đường agent đoán: `ql_khong_suy_dien` lọc `-t suy-dien`, và bài ĐẦU của khối ấy gọi `builderCommandType` — đúng hàm AC-2 xoá. Vòng đỏ ở Cổng 2 vì phép đo của vòng khác, và đường sửa hiển nhiên nhất bị AC-8 chặn bằng sha | Một AC riêng đòi bốn lệnh máy của hồ sơ cũ thoát 0; và AC-8 khai rõ vùng nào đóng băng, vùng nào được động | fixed: thêm AC-9 + E10 (`layer: backend-effect`); AC-5 thêm điểm giữ nguyên tên khối `describe("suy-dien")`; AC-8 khai hai vùng và đòi dòng Notes nói rõ `expected` của E5 không còn mô tả thứ lệnh nó chạy |
| P1 | evals (E4) | Sàn dân số là «ít nhất 3 chỗ ghi» — một cận dưới, không phải ma trận toàn phần. Khả năng đi xuống object `create` lồng được AC hứa nhưng không vectơ đỏ nào chứng minh | Mã duyệt quan hệ lồng viết sai (chỉ một tầng). Bộ dò vẫn thấy 3 chỗ phẳng, sàn «≥3» xanh, hai vectơ phẳng đỏ đúng khai, E4 xanh toàn tập. Rồi một đường ghi `conversation: { create: { commandType: ... } }` được thêm và bộ dò mù | In danh sách `file:dòng` và so với danh sách ghim sẵn, số phần tử khác là mã 2; thêm vectơ quan hệ lồng và vectơ đối xứng dưới `select` phải vẫn xanh | fixed: AC-3 đổi sang ma trận toàn phần; E4 lên bốn vectơ — `ghim-cung`, `bien-trung-gian`, `quan-he-long`, `duoi-select` |
| P2 | evals (E8) | E8 chỉ đòi «ít nhất một dòng» khai sinh mỗi eval, trong khi E2/E3/E4 khai nhiều vectơ. Không phép kiểm nào buộc hai bản khai vectơ khớp số | Wire vectơ 1 của E2 vào khai sinh, quên vectơ `ternary-xuong-dong` — đúng hình dạng mà bộ dò cũ mù, lý do tồn tại của cả vòng. E8 xanh; bằng chứng nộp Cổng 2 nói «mọi phép đo mới đều có chiều đỏ chạy được» trong khi vectơ nguy hiểm nhất chưa bao giờ chạy | E8 đếm số vectơ khai trong `expected` và đòi số dòng khai mang cùng id eval bằng đúng số đó; mỗi dòng khai mang trường `vecto` trùng tên | fixed: AC-7 và E8 viết lại theo đúng thước ấy; khuôn dòng khai lên năm trường |

## Ghi chú

Không finding nào lật quyết định đã có trong `decisions.jsonl`. P1 về hồ sơ cũ
giữ nguyên `d-20260909T143334Z-20735` (không viết lại chữ AC-5 và E5) — nó chỉ
nêu một hệ quả thi hành mà ledger chưa ghi. P0 thứ nhất giữ nguyên
`d-20260909T143334Z-21009` (không thêm phép đo chạm DB): thước đề xuất chạy
trên một object hàng viết trong bộ nhớ.

Sửa xong artifact thì **không re-probe** (one-pass) — phần mã còn ba vòng chấm ở S4.
