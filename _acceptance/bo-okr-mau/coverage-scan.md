# Quét độ phủ — bo-okr-mau

## Ngữ cảnh

- Sản phẩm: CRM OneHub, khu OKR — chân sản phẩm: đào repo
  [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.md mục 5 «Dựng hết bằng dữ liệu mẫu»]
  [SUY-TỪ-REPO: packages/db/prisma/schema.prisma các model Okr*, Division, Department, OrgPlacement]
  [SUY-TỪ-REPO: apps/api/src/okr/hop-tuan.ts — «đáng bàn» tính theo hôm nay]
  [SUY-TỪ-REPO: docs/setup.md — preview dùng chung cơ sở dữ liệu production]
- Chân ngành: lệnh gieo dữ liệu tự chặn môi trường production
  [NGÀNH: Rails — `ActiveRecord::ProtectedEnvironmentError` chặn tác vụ phá dữ liệu ở
  môi trường production] [NGÀNH: Laravel — `db:seed` đòi `--force` khi
  `APP_ENV=production`]. Kho này chặt hơn cả hai: không có cờ vượt, vì bộ mẫu không
  bao giờ có lý do ở production.

## Trục

- **A — lớp dữ liệu:** tổ chức và vai · OKR năm OneHub · OKR quý 4 (kiểu KR, căn chỉnh,
  nguồn CRM, trạng thái mục tiêu) · Cập nhật tuần sáu tuần (trôi, đáng bàn, bỏ cập nhật) ·
  quý 3 đã khép (điểm, điều học được, mang sang) · ca góp ý
  [thước CE: năm gạch đầu dòng của mục 5 lộ trình + model Okr* trong schema]
- **B — tình huống lệnh:** kho cục bộ chưa có bộ mẫu · kho đã có bộ mẫu (nạp lại) · xoá ·
  kho có OKR thật · máy chủ không cục bộ / môi trường production · tệp bộ mẫu hỏng ·
  ghi hỏng giữa chừng
  [thước CE: câu «Lệnh nạp từ chối …» của lộ trình + NGÀNH Rails/Laravel]
- **C — bên đọc:** dịch vụ đọc của API · thủ tục ghi thật trên bộ đã nạp · màn trình
  duyệt · eval của tác nhân (ca)
  [thước CE: danh sách lượt dùng bộ mẫu ở mục 5 — 8a, 8b, 9b, 9c, 10, C, L, T]
- **D — thời gian:** ngày nạp mặc định · ngày ghim `--moc`
  [thước CE: `lyDoCua(kr, homNay)` của `hop-tuan.ts`]

## Core

1. A-tổ chức × C-dịch vụ đọc — cây và vai đúng đọc qua `toChuc.tree` → AC-1
2. A-năm + quý 4 × C-dịch vụ đọc — toàn cảnh có mọi phòng ban, căn chỉnh → AC-2
3. A-kiểu KR và nguồn CRM × luật sản phẩm — sáu kiểu, số đúng luật, nguồn parse được → AC-3
4. A-sáu tuần × D × C-dịch vụ đọc — bảng họp tuần có «tụt» và «im» → AC-4, AC-6
5. A-quý 3 × C-dịch vụ đọc — bảng chấm của kỳ đã đóng đủ → AC-5
6. B-nạp lại, B-xoá → AC-7, AC-8
7. B-production, B-OKR thật, B-tệp hỏng → AC-9, AC-10, AC-11
8. C-thủ tục ghi thật trên bộ đã nạp → AC-12
9. A-ca góp ý × C-eval → AC-13
10. A × C-màn → AC-14
11. Tài liệu cho lượt sau → AC-15

## Later

- Bộ mẫu trong kho mẫu của phiên đo (`crm_<cây>__mau_do`) — khi đủ lượt sau cần mặc
  định; hôm nay thước đã ký cần kho không có chu kỳ.
- Ca «tóm tắt tuần» cho 9c — 9c tự viết trên ghi chú của bộ này.
- Đề xuất và tóm tắt AI đã sinh sẵn (`OkrDeXuat`, `OkrTomTat`) — lượt 9b, 9c sinh thật.

## Never

- B-production có cờ vượt — bộ mẫu không bao giờ có lý do ở production.
- Nạp vào bản xem trước khi nó dùng chung cơ sở dữ liệu và api với production — là nạp
  vào production (xem dòng sổ quyết định «bỏ bản-xem-trước»).
- B-ghi hỏng giữa chừng thành AC riêng — một giao dịch Prisma lo; đo nó cần tiêm lỗi vào
  Prisma, đắt hơn giá trị.

## Cross-cutting áp mọi ô Core

- Mọi hàng bộ mẫu mang tiền tố mã `mau-okr-` và người mẫu có đuôi thư `@mau.onehub.test`.
- Mọi lần từ chối: thoát khác 0, câu ghim, 0 hàng ghi.
- Không chữ nào của bộ mẫu là dữ liệu thật (tên người, tên đối tác đều giả).
