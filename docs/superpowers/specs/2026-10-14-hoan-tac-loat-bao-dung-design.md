# Lưu trữ và hoàn tác loạt báo đúng — thiết kế

Hàng V2f của `docs/plan/lo-trinh-okr.json`, dãy P3 đợt r2. Cổng Đáng `build` (chủ kho, 2026-10-12T23:58:15Z). Ba dòng
tồn đọng loại hành vi từ V2d `hoan-tac-loat-dung-id` (#354): Ngoài-3, Ngoài-4, Ngoài-7 trong mục Known limits của
`_acceptance/hoan-tac-loat-dung-id/contract.md`.

## Vấn đề

| Mục | Hôm nay |
| --- | --- |
| Ngoài-3 | Lỗi thật của máy chủ (mất kết nối cơ sở dữ liệu…) khi lưu trữ hàng loạt rơi vào `failed`, và toast báo vàng «n bản bị bỏ qua — đã lưu trữ từ trước hoặc không còn» dù bản đó chưa được cất. |
| Ngoài-4 | «Hoàn tác» khi mọi bản đã được người khác khôi phục trước (`succeeded 0, skipped n`) vẫn báo «Chưa hoàn tác được. Các bản ghi vẫn ở mục Đã lưu trữ.» — sai: các bản đã ở danh sách. |
| Ngoài-7 | `runBulk` (`apps/api/src/crm/bulk.ts`) nuốt lỗi từng bản; phía vận hành không có dấu vết. |

## Cách làm

**Máy chủ — `runBulk` tách lỗi thật khỏi «không còn», ghi log từng bản.**

- Giữ nguyên luật đếm đã ký ở AC-1 của V2d: bản đã lưu trữ từ trước vào `skipped`, id không tồn tại vào `failed`.
- `crmBulkResultOutput` thêm `errored: number` — số bản hỏng vì lỗi khác `NotFoundException`; luôn `errored ≤ failed`.
- Mỗi lỗi bắt được ghi một dòng log qua `Logger` của Nest theo luật `docs/api.md` mục Logging: lỗi thật
  `logger.error({ message: "Bulk action failed", recordId }, err.stack)`; id không còn
  `logger.warn({ message: "Bulk action skipped a missing record", recordId })`. Không ghi thân lỗi ra ngoài log.
- `docs/api.md` mục «Deleting a record is archive first, purge later» thêm đoạn nói `changedIds`, `skipped`,
  `failed`, `errored` nghĩa là gì.

**App — `bulk-actions.tsx`.**

- `BulkResult` thêm `errored: number`. Đọc an toàn khi trường vắng (bản máy chủ cũ, dữ liệu giả của bài V2d):
  coi như 0.
- `baoLuuTruLoat`: «bị bỏ qua» chỉ đếm `skipped + failed − errored`. `errored > 0` thêm vế riêng
  `bulk.chuaLuuTru(n)` — «n bản chưa lưu trữ được vì máy chủ gặp lỗi — thử lại sau.» Không bản nào được cất mà có
  lỗi thật → `toast.error`, không nút «Hoàn tác». Không in lời lỗi thô của máy chủ (giữ luật AC-4 của V2d).
- `baoHoanTacLoat`: `succeeded 0, failed 0, skipped > 0` → `toast.success(bulk.daVeTruoc(n))` — «n bản đã được
  khôi phục từ trước.» Các ca khác giữ như V2d.

## Không làm

- Ngoài-1 (kiểu `BulkResult` suy từ đầu ra router) — vẫn viết tay, thêm một trường.
- Ngoài-2 (gộp `archiveIfActive`/`restoreIfArchived` ba service) — không đụng.
- Đổi luật đếm `failed` của V2d.
- Thử lại tự động khi máy chủ lỗi.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Lưu trữ hàng loạt có lỗi thật: bảng › chọn n dòng › «Hành động» › «Lưu trữ» → toast nói số đã lưu trữ, số bị bỏ qua
  (nếu có) và số chưa lưu trữ được vì máy chủ lỗi; có «Hoàn tác» khi có bản được cất. Không bản nào cất được mà có lỗi
  thật → toast lỗi, không «Hoàn tác».
- Hoàn tác khi mọi bản đã về: toast lưu trữ › «Hoàn tác» (người khác đã khôi phục cả lô trước đó) → toast «n bản đã
  được khôi phục từ trước.», các dòng có trong bảng.
- Biên: các ca khác giữ như V2d.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bảng Cá nhân / Công ty / Thoả thuận | xem và thao tác hàng loạt trên bản ghi | thanh bên / ngăn bản ghi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-luu-tru-co-loi | bảng | toast «2 … đã lưu trữ. 1 bản chưa lưu trữ được vì máy chủ gặp lỗi — thử lại sau.» + «Hoàn tác» | thử lại bản lỗi, hoặc «Hoàn tác» |
| ST-luu-tru-loi-het | bảng | toast lỗi «3 bản chưa lưu trữ được vì máy chủ gặp lỗi — thử lại sau.», không «Hoàn tác» | thử lại |
| ST-hoan-tac-da-ve | bảng | toast «3 bản đã được khôi phục từ trước.» | làm tiếp |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Không in lời lỗi thô của máy chủ trong toast (giữ luật AC-4 của V2d).
- `errored` vắng trong kết quả coi như 0.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `baoDaLuuTru`, `toast` (`packages/ui`, sonner) | dùng | toast lưu trữ có «Hoàn tác» chung |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: chỉ đổi chữ toast trên bảng có sẵn — luồng hiển nhiên, không tra.
<!-- UX-SPEC-TEMPLATE>>> -->

## Chuẩn nội đã nạp

`feature_loop.ui_standards_skill: web-design-guidelines` — bản Web Interface Guidelines đã nạp ở V2e cùng phiên (14/10).
Áp ở đây: lời báo lỗi nói bước kế («thử lại sau»), không in lỗi thô; thao tác cất được thì có hoàn tác.
