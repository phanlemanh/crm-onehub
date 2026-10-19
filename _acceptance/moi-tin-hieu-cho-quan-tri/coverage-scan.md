# Quét chống sót — mọi tín hiệu cho quản trị (preset entity-feature)

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub, một công ty, mọi phòng ban dùng từ 14/10 — chân sản phẩm: đào repo
  [SUY-TỪ-REPO: CONTEXT.md] [SUY-TỪ-REPO: packages/validation/src/vai-workspace.ts] (vai owner/admin/member
  cộng vai «chỉ OKR»; quản trị = owner hoặc admin) [SUY-TỪ-REPO: _acceptance/gui-tin-hieu-trong-crm/contract.md]
  (tín hiệu LT2: cất người gửi, phòng ban chính lúc gửi, màn, giờ gửi, giờ kéo về).
- Luật riêng tư chủ kho chốt 14/10 [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.json — hàng TH4, `ghi_chu`]: quản
  trị thấy tên người gửi; hộp gửi báo trước; người khác chỉ thấy tín hiệu của mình; tệp git không mang danh
  tính.
- Chân ngành (hộp thư góp ý phía quản trị): [NGÀNH: Canny] bảng quản trị liệt mọi ý kèm người gửi, công ty,
  trạng thái, lọc theo trạng thái và người; [NGÀNH: Productboard Insights] hộp «insights» liệt mọi ghi nhận
  kèm người gửi, nguồn, đã xử lý hay chưa, lọc theo công ty và người.

## Trục

- **A — Vật trên thẻ Tất cả:** danh sách · bộ lọc · ba ô số · đường dẫn từ «Của tôi» sang
  [thước CE: câu giao hàng TH4 + mã Q1, Q2 của `docs/plan/pham-vi-vong-tin-hieu-1410.md`; Canny/Productboard]
- **B — Người × quyền:** chủ · quản trị · thành viên · vai «chỉ OKR» · gọi API thẳng không qua màn
  [thước CE: `laQuanTriWorkspace`; bảng phạm vi router `docs/api.md`]
- **C — Hình dạng một dòng dữ liệu:** đủ (người, phòng ban, màn, trạng thái kit) · người gửi đã bị xoá ·
  không có phòng ban (chưa xếp, hoặc phòng ban lưu trữ lúc gửi) · bản vẽ không có trạng thái của mã đó · bản
  vẽ vắng/hỏng
  [thước CE: cột nullable của bảng `tinHieu`; năm ca đọc khoan dung của LT1/LT2]
- **D — Ca của trang:** suôn sẻ · rỗng · chờ tải · lỗi tải · khổ điện thoại · lọc ra rỗng
  [thước CE: mục «Nếp màn trong app» của `docs/design.md`]

## Core

1. A-danh sách × B-quản trị × C-đủ — mỗi dòng: mã, điều đã kể, người gửi, phòng ban, màn, giờ gửi, trạng thái.
2. A-danh sách × B-thành viên/«chỉ OKR»/API thẳng — không thấy thẻ, đường dẫn thẳng không lộ dữ liệu, API từ chối.
3. A-lọc × B-quản trị — theo phòng ban, trạng thái, người gửi; giá trị trên đường dẫn; lọc ra rỗng nói rõ.
4. A-ba ô số × lệnh kéo về — một hàm đếm cho cả hai; cùng bộ tín hiệu ra cùng ba số.
5. C-người đã xoá / không phòng ban / bản vẽ thiếu — dòng vẫn hiện, nói rõ thiếu gì; đếm theo đúng luật của lệnh.
6. Hộp gửi báo trước quản trị thấy tên (Q3) × B-mọi vai.
7. D-chờ tải/lỗi/rỗng/điện thoại của thẻ Tất cả.

## Later

- Gỡ, lưu trữ tín hiệu rác — TH5 (T3).
- Xuất danh sách ra tệp — chưa ai xin; quản trị đã có lệnh kéo về.
- Trả lời người gửi trong CRM [NGÀNH: Canny] — chưa có trong bản phạm vi.
- Phân trang phía máy chủ — số tín hiệu một tháng cỡ vài chục; mở khi vượt vài trăm.
- Báo «có n tín hiệu mới» — N5, đợt hộp thông báo.

## Never

- Bầu chọn, xếp ưu tiên theo số tín hiệu [NGÀNH: Canny] — trái luật kit «không xếp điểm ưu tiên tự động».
- Đưa tên người gửi vào tệp git — luật riêng tư 14/10.
- Quản trị sửa nội dung tín hiệu của người khác — tín hiệu là lời kể đã gửi.
- Trưởng phòng ban xem tín hiệu của phòng mình — luật 14/10 chỉ mở cho quản trị.

## Cross-cutting áp mọi ô Core

- Dữ liệu cá nhân: tên người gửi chỉ đi tới quản trị; nhật ký máy chủ không ghi nội dung tín hiệu (docs/api.md, Logging).
- Dữ liệu người nhập (điều đã kể, tên) không dịch và đánh dấu để trình duyệt không tự dịch (CLAUDE.md «Ngôn ngữ sản phẩm»).
