# Quét độ phủ — cap-nhat-gan-day (preset entity-feature)

## Ngữ cảnh

- Sản phẩm: khu Mục tiêu của CRM OneHub — chân sản phẩm: đào kho (`CONTEXT.md` mục «Cập nhật gần đây», «Tôi dẫn · Đang
  theo dõi»; `docs/api.md` mục OKR; `packages/db/prisma/schema.prisma` các bảng `OkrCheckIn`, `OkrFollow`, `OkrComment`)
  · chân ngành: `[NGÀNH: Tability — Recent updates]` (báo cáo 18/10 trong `docs/plan/pham-vi-okr-vo-khu-1810.md`, 37 trang
  hướng dẫn ở `docs/findings/2026-10-22-hop-tuan/README.md` §5): dòng tin cập nhật lọc theo kế hoạch đang theo dõi, đội,
  cấp dưới; bình luận và cảm xúc dưới từng lần cập nhật.

## Trục

- Trục A — người xem: trưởng phòng ban | trưởng bộ phận | thành viên | quản trị chương trình | người xem hẹp (OKR giới
  hạn) | vai «chỉ OKR» [thước CE: `OkrAccessService.quyen`, `dieuKienXemMucTieu`, `apps/api/test/vai-chi-okr.spec.ts`]
  `[SUY-TỪ-REPO: docs/api.md]`
- Trục B — nguồn dòng: mục tiêu công bố cấp OneHub | bộ phận | phòng ban | cá nhân | mục tiêu nháp hay đã bỏ | chu kỳ
  khác | KR số hay KR mốc, tự cập nhật hay cập nhật thay [thước CE: `CAP_MUC_TIEU`, `TRANG_THAI_MUC_TIEU`, cột `onBehalf`
  của `OkrCheckIn`] `[SUY-TỪ-REPO: packages/db/prisma/schema.prisma]`
- Trục C — phạm vi và trang: Tất cả | Tôi dẫn | Đang theo dõi | trang đầu | trang sau | đổi chu kỳ | đường dẫn chép tay
  [thước CE: `CONTEXT.md` «Tôi dẫn · Đang theo dõi», `docs/design.md` «Hàng công cụ»] `[SUY-TỪ-REPO: CONTEXT.md]`
- Trục D — việc trên một dòng: đọc | bấm mở chi tiết KR | trả lời lần mới nhất | lần cũ (không trả lời, D5 lối a) |
  trả lời bị từ chối (chu kỳ đã ẩn, rỗng, quá dài) | cảm xúc `[NGÀNH: Tability]` [thước CE: `ghi_chu` của hàng VK12
  (D5, D8), `docs/design.md` «Bấm vào KR và cập nhật»]
- Lớp cắt ngang — trạng thái màn × khổ: chờ | lỗi | chưa chu kỳ | rỗng cả chu kỳ | rỗng theo lọc | có dữ liệu × 1280 |
  375 [thước CE: `docs/design.md` «Nếp màn trong app»]

## Core

1. A × C: Tôi dẫn theo đơn vị người xem làm trưởng (không kéo phòng ban con, không bộ OneHub); Đang theo dõi theo bộ có
   mục tiêu người xem theo dõi — vì CONTEXT.md định nghĩa đúng vậy → AC-4.
2. A × B (người xem hẹp × OKR giới hạn): lần cập nhật của OKR người xem không được thấy không lọt vào dòng tin hay số
   đếm → AC-3.
3. B (công bố OneHub · bộ phận · phòng ban, chu kỳ đang chọn) đủ mọi lần, mới nhất trước; cá nhân, nháp, đã bỏ, chu kỳ
   khác vắng → AC-2.
4. C (trang đầu · trang sau, số đếm chip = số dòng khi chọn chip, đường dẫn) → AC-4, AC-5.
5. D trả lời lần mới nhất, thấy ngay dưới dòng và ở thẻ Trao đổi của mục tiêu → AC-6; lần cũ không có ô → AC-6.
6. D bấm dòng mở chi tiết KR, ma trận lối mở KR thêm ô → AC-7.
7. Thanh bên khu thêm mục thứ bảy, đường dẫn giữ chu kỳ → AC-1.
8. Lớp trạng thái × khổ → AC-8, AC-9.
9. Dữ liệu mẫu có theo dõi và trả lời để Đang theo dõi và lần trả lời có mà xem → AC-10.

## Later

- Trả lời trên từng lần cập nhật (không chỉ lần mới nhất) — hàng HT5, cần `checkInId` cho `OkrComment` (T3).
- Cảm xúc dưới lần cập nhật `[NGÀNH: Tability]` — hàng HT5.
- Nhắc tên người trong trả lời — vẫn làm được ở thẻ Trao đổi của mục tiêu.
- Gom dòng tin theo tuần, tìm kiếm, lọc theo một bộ hay một người cụ thể.
- Lọc «cấp dưới» `[NGÀNH: Tability]` — kho chưa có khái niệm cấp dưới ngoài cây tổ chức; Tôi dẫn đã phủ đơn vị mình dẫn.

## Never

- Lần cập nhật của mục tiêu cá nhân trong dòng tin — «bộ OKR» của khu là bộ đơn vị (danh sách bộ không có bộ cá nhân).
- Sửa hay xoá một lần cập nhật từ dòng tin — lần cập nhật chỉ thêm, không sửa (`docs/api.md`).

## Cross-cutting áp mọi ô Core

- Mọi lần đọc `okrCheckIn`, `okrComment`, `okrFollow` mang `dieuKienXemMucTieu` (bộ quét `soi-ma.mjs --ca xem`).
- Chữ trên màn rút từ tệp chữ vi/en; dữ liệu người nhập mang `translate="no"`.
- Thủ tục mới nằm trong tập `vai-chi-okr.spec.ts` cho phép vai «chỉ OKR».
