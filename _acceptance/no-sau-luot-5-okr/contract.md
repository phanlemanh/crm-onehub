---
schema_version: 1
feature: Nợ sau lượt 5 OKR — khối «OKR của bạn» báo lỗi kèm Thử lại khi không tải được chu kỳ hay KR, bộ lọc người phụ trách luôn hiện tên thay cho mã, trang Theo đơn vị dùng được bản tải trước danh sách ở máy chủ
slug: no-sau-luot-5-okr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by: Manh Phan
approved_at: 2026-09-26T12:54:59Z
design_doc: docs/superpowers/specs/2026-09-26-no-sau-luot-5-okr-design.md
---

# Acceptance Contract: no-sau-luot-5-okr

## Context

Bốn mục «mở hợp đồng mới» người ký chọn khi ký Cổng Bằng chứng của lượt 5
`toan-canh-okr` (Ngoài-2, Ngoài-6, Ngoài-7, Ngoài-8; sổ `d-20260926T110238Z-31`,
`-35`, `-36`, `-37` của hồ sơ đó), chủ kho chốt gom làm một vòng trước lượt 6 vì
cùng phục vụ ngày mọi phòng ban vào CRM (26/10). Ba lỗ hổng, cùng khu OKR trong
`apps/app`, không chạm API: (1) khối «OKR của bạn» biến mất im lặng khi truy vấn chu
kỳ lỗi; (2) bộ lọc người phụ trách ở Theo đơn vị hiện mã người dùng; (3) bản tải
trước danh sách Theo đơn vị ở máy chủ không bao giờ trúng khoá của trình duyệt.

Source input: `_acceptance/toan-canh-okr/decisions.jsonl` (-31, -35, -36, -37) ·
`_acceptance/toan-canh-okr/review-findings.md` · tin phiên điều phối 2026-09-26 ·
prompt chủ kho (Ngoài-8, luật lỗi-trước-đang-tải của sổ `d-20260926T091042Z-23`).

## Criteria

- AC-1: Given người mở Tổng quan (vai quản lý bán hàng hay vai «chỉ OKR») và truy vấn danh sách chu kỳ OKR lỗi, When trang tải xong, Then thẻ «OKR của bạn» vẫn hiện với câu «Không tải được KR của bạn.» và nút «Thử lại», không có khung chờ quay mãi và không có bảng KR.
- AC-2: Given thẻ «OKR của bạn» đang báo lỗi chu kỳ, When người bấm «Thử lại» sau khi truy vấn chu kỳ hết lỗi, Then danh sách chu kỳ được gọi lại và bảng KR của người đó hiện trong thẻ; When bấm lúc truy vấn vẫn lỗi, Then câu lỗi và nút ở lại.
- AC-3: Given truy vấn KR của khối lỗi (chu kỳ vẫn tải được), When khối hiện trên Tổng quan hoặc trên trang một người, Then thân thẻ là câu lỗi kèm «Thử lại» — «Không tải được KR của bạn.» trên Tổng quan, «Không tải được KR của người này.» trên trang một người — và bấm «Thử lại» gọi lại truy vấn KR.
- AC-4: Given truy vấn chu kỳ thành công nhưng không có chu kỳ hiện tại, When Tổng quan hiện, Then khối «OKR của bạn» không hiện (giữ hành vi cũ); Given truy vấn chu kỳ còn đang tải, Then khối hiện khung chờ, không hiện câu lỗi.
- AC-5: Given ở Theo đơn vị người dùng đã chọn một người phụ trách mà các mặt lọc khác làm người đó không còn mục tiêu nào khớp, When mở bộ lọc «Người phụ trách», Then lựa chọn của người đó hiện tên người kèm «· 0», không hiện mã người dùng.
- AC-6: Given người đã chọn ở bộ lọc phụ trách không còn trong tổ chức (không có trong danh sách người của workspace), When mở bộ lọc, Then lựa chọn hiện «Người không còn trong tổ chức · 0», không hiện mã.
- AC-7: Given người mở trang Theo đơn vị (không lọc, chỉ lọc mức tự tin, hoặc lọc cả bốn mặt), When trang hiện xong, Then trình duyệt không gọi danh sách mục tiêu lần nào — danh sách đến từ bản tải trước ở máy chủ — cho tới khi người đổi bộ lọc.
- AC-8: Given API nhận một tập mặt lọc cho danh sách mục tiêu, When trang máy chủ và trình duyệt dựng bộ lọc từ tham số URL, Then cả hai dựng từ cùng một hàm và hàm đó trả đúng tập mặt lọc API nhận, không thiếu mặt nào.
- AC-9: Given các tệp giao diện vòng này đổi, When soi bằng sàn thiết kế của kho, Then không có vi phạm P0 của design-gate và không có dấu hiệu vẽ tay của `docs/design.md` — trạng thái lỗi dùng `LoiXem` (Empty + Button) có sẵn, không dựng khối mới.

## Coverage

Quét bằng `morphological-scan` trong phiên (bản quét: `coverage-scan.md`).

- Trục A — nơi khối hiện: Tổng quan (quản lý bán hàng) | Tổng quan vai «chỉ OKR» | trang một người [thước CE: ba chỗ gọi `KhoiKrCuaToi` — SUY-TỪ-REPO `apps/app/app/(app)/[slug]/dashboard-summary.tsx`, `tong-quan-chi-okr.tsx`, `okr/theo-don-vi/theo-don-vi.tsx`]
- Trục B — trạng thái truy vấn của khối: chu kỳ lỗi | KR lỗi | đang tải | không có chu kỳ hiện tại | có dữ liệu | rỗng | thử lại hết lỗi | thử lại vẫn lỗi [thước CE: NGÀNH NN/g «Error-Message Guidelines» (lỗi phải hiện, nói chuyện gì, cho đường khôi phục) + luật ST lỗi-trước-đang-tải của lượt 5]
- Trục C — người đã chọn ở bộ lọc phụ trách: có KR khớp | không khớp nhưng còn trong tổ chức | không còn trong tổ chức [thước CE: SUY-TỪ-REPO `apps/api/src/okr/danh-sach.ts` (đếm chỉ gồm người có mục tiêu khớp) + `apps/api/src/to-chuc/cay.ts` (people = thành viên)]
- Trục D — bộ lọc trên URL khi mở Theo đơn vị: không lọc | chỉ tự tin | chỉ mặt khác | đủ bốn mặt [thước CE: NGÀNH TanStack Query «Advanced Server Rendering» (bản tải trước chỉ dùng được khi khoá truy vấn trùng) + `locDanhSach` trong `apps/api/src/okr/okr-xem.contracts.ts`]
- [GIẢ ĐỊNH] Người đã rời workspace vẫn có thể nằm trong URL bộ lọc (liên kết cũ, dấu trang) — nhãn chung là đủ, không cần tên cũ của họ.

## Out of scope

- Không đổi API, không thêm truy vấn tên người ở máy chủ: tên lấy từ cây tổ chức trình duyệt đã tải.
- Không chuyển `LoiXem` sang `trang-thai-okr.tsx` hay `packages/ui` (chạm ba tệp của hồ sơ đã ký chỉ để đổi dòng nhập; sổ quyết định).
- Không đổi thứ tự «đang tải trước lỗi» của chính trang Theo đơn vị (`theo-don-vi.tsx` xét `isPending` trước `isError`) — khi chu kỳ lỗi thì `isPending` đã là `false` nên trang vẫn tới Empty lỗi; không có lỗi người dùng thấy.
- Không thêm bản mẫu `/proto` cho hai trạng thái lỗi mới.
- Không sửa các mục «ghi Known limits» khác của lượt 5.

## Notes

- Đường nền 26/09: `duong-nen.md` đỏ ở `test` và `build` vì làn chạy qua `bash -lc` rơi về Node 22 (eve đòi Node ≥ 24) và cây mới thiếu `sharp` trước `bun install`; chạy lại cùng lệnh với Node 24 sau `bun install`: `bunx turbo run build --force` mã 0, `bun run test` mã 0. Đỏ môi trường, không phải lỗi kho.

- Ba tệp nguồn chính: `apps/app/app/(app)/[slug]/okr/khoi-kr-cua-toi.tsx`, `okr/loc-okr.tsx`, `okr/theo-don-vi/page.tsx` (cùng `theo-don-vi.tsx`, `okr-search-params.ts`, `apps/app/lib/messages/okr-toan-canh.ts`).
- Chạm tệp mà eval của hồ sơ đã ký (`toan-canh-okr`, `dat-okr-trong-crm`, `cap-nhat-tuan-okr`, `okr-soat-anh-luot-3`) theo dõi — S5 ghim lại các hồ sơ bị chạm.
