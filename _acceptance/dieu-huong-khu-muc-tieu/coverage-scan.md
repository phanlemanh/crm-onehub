# Quét độ phủ — dieu-huong-khu-muc-tieu (15/10, preset entity-feature, tự dựng trục)

## Ngữ cảnh
- Sản phẩm: OneHub CRM, khu Mục tiêu (OKR) — chân sản phẩm: đào kho
  [SUY-TỪ-REPO: docs/plan/pham-vi-okr-dieu-huong-1410.md] [SUY-TỪ-REPO: apps/app/app/(app)/[slug]/okr/tab-okr.ts]
  [SUY-TỪ-REPO: apps/api/src/okr/okr-access.service.ts] · chân ngành: [NGÀNH: Carbon Design System — mẫu
  «Page header»: tiêu đề trang, hành động ở phải, thanh thẻ dưới đầu trang]; lượt rà production 14/10 đã đối
  chiếu Tability (Strategy Map) và Perdoo (chủ sở hữu mục tiêu) [SUY-TỪ-REPO: docs/plan/pham-vi-okr-dieu-huong-1410.md].

## Trục
- Trục A — trang của khu: Của tôi | Cập nhật tuần | Theo đơn vị | Toàn cảnh | Sức khoẻ chương trình | Hỏi ý
  [thước CE: `tab-okr.ts` + 6 `page.tsx` gọi `DauTrangOkrTrang` — SUY-TỪ-REPO]. Trang soạn: không đầu trang khu (gạch).
- Trục B — người xem: quản trị | trưởng bộ phận | trưởng phòng ban | thành viên không dẫn ai | vai «chỉ OKR»
  [thước CE: `suaDuocDonVi`/`nhapDuoc` trong `okr-access.service.ts`]
- Trục C — nguồn đơn vị đích: đơn vị đang chọn (Theo đơn vị) | `donOkr` trên đường dẫn | đơn vị mình dẫn | cấp công ty
  [thước CE: thiết kế §Hướng làm]
- Trục D — trạng thái: đang tải | lỗi quyền | có quyền | không quyền | chu kỳ ngoài pha lập kế hoạch
  [thước CE: `docs/design.md` «Chờ tải và lỗi tải»; `docs/settings.md` «Không đủ quyền»]

## Core
1. Mọi trang × tiêu đề cố định + mô tả theo thẻ (A × đã dựng/đang tải) — AC-1, E1.
2. Mọi thẻ × hàng hành động góc phải, 1440/390, so Thoả thuận — AC-2, E2/E3/E14.
3. C × B: đơn vị đích theo bốn nguồn × năm người xem — AC-3, E4 (ma trận 25 ô), E5 (tạo thật).
4. «…» Nhập + nút soạn cho đơn vị đích, lý do khoá riêng của soạn — AC-4, E6.
5. D «không quyền» × hai nguồn câu lý do — AC-5, E7.
6. Vòng đổi thẻ giữ đơn vị + chu kỳ — AC-6, E8.
7. Sức khoẻ chương trình: tiêu đề, thẻ, đường dẫn A › B, en — AC-7, E9.
8. D «đang tải», «lỗi quyền» — AC-8, E10.

## Later
- Cách xem (`xemOkr`) đi theo khi đổi thẻ — B4, hàng DH2.
- Ô chọn đơn vị có tìm kiếm thay cây 20 dòng — B1, hàng DH2.
- Thanh bên nhớ đơn vị gần nhất khi vào lại từ thanh bên (không có `donOkr`) — chưa có trong phạm vi đợt.

## Never
- Vai «chỉ OKR» × hàng hành động khác thành viên: không — vai này đi đúng nhánh «không quyền» của máy chủ, không có giao diện riêng.
- Trang soạn × đầu trang khu: trang soạn cố ý không có đầu trang khu (giữ như hôm nay).
- Bỏ thẻ «Cập nhật tuần»: A3 của hàng DH3.

## Cross-cutting áp mọi ô Core
- Khổ 1440 và 390; tiếng Việt và tiếng Anh; quyền lấy từ `canCreate` của máy chủ, không tính ở trình duyệt.
