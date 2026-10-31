---
schema_version: 1
feature: "Mọi page.tsx của ứng dụng, kể cả trang sinh sau ngày dựng bài kiểm, đều bị soát hình theo màn; trang lệch không có trong bảng ngoại lệ kèm lý do thì bài kiểm đỏ"
slug: rang-khung-trang-mo
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-31T12:23:09Z
design_doc: docs/superpowers/specs/2026-10-31-rang-khung-trang-mo-design.md
---

# Acceptance Contract: rang-khung-trang-mo

## Context

Hàng BK3 của `docs/plan/lo-trinh-okr.json`, đợt `ban-do-khuon-3010`, dãy L. Ô cơ hội ký `build` ngày 31/10.
Bài khung trang của hồ sơ `khung-man-chung` chỉ đọc 39 tệp có tên trong một bảng sinh từ commit `3a2783409`. Vì
vậy 12 trang đủ khung và 5 trang lệch sinh sau 13/10 không bài nào soát; ba trong năm trang lệch lặp lại đúng lỗi
NM1 đã sửa (tiêu đề theo dữ liệu nằm trong `Suspense`, lúc chờ không có đầu trang). Vòng này thêm một bài kiểm
đọc mọi `page.tsx` của cây, kèm bảng ngoại lệ có lý do. Hạng T2: chỉ thêm tệp kiểm dưới `apps/app/test`.

Source input: hàng BK3 (`cau_giao`, `bat_khi`, `ghi_chu`) · `opportunity.md` · `docs/design.md` mục «Khung trang» ·
`docs/plan/pham-vi-ban-do-khuon-3010.md` · trang tri thức `ban-do-khuon.md` · design doc.

Thuật ngữ: **trang** = một tệp `page.tsx` dưới `apps/app/app/`. **Lúc tải** = đường đi từ hàm mặc định của trang
không qua phần thân của một `Suspense` (đi vào `fallback` thì được), theo nhập cục bộ và hàm cùng tệp tối đa ba bậc.
**Bài** = `apps/app/test/khung-trang-mo.spec.ts`. **Bảng** = `apps/app/test/fixtures/khung-trang-ngoai-le.json`.

## Criteria

- AC-1: Given cây kho ở đỉnh đang xét, When chạy bài, Then tập trang bài đọc bằng đúng tập `page.tsx` mà
  `git ls-files` liệt dưới `apps/app/app/`, không qua bảng tệp hay commit gốc nào; mỗi trang thuộc đúng một nhóm
  `khung` · `chuyen-huong` · `ngoai-le`; và bài in số trang của mỗi nhóm.
- AC-2: Given một trang mới không dựng `PageShellHeader` lúc tải (dựng đầu trang bằng `div` và `<h1>` riêng), When
  chạy bài, Then bài đỏ với một dòng gọi tên tệp đó và nói nó dựng đầu trang ngoài `PageShellHeader`.
- AC-3: Given một trang có `PageShellHeader` lúc tải, When `PageShellTitle` chỉ nằm trong phần thân `Suspense`, hoặc
  không có `PageShellDescription` lúc tải, hoặc có thêm một `<h1>` tới được lúc tải, Then bài đỏ với một dòng gọi tên
  tệp và đúng chỗ thiếu hay thừa (tiêu đề lúc tải · mô tả lúc tải · `<h1>` riêng).
- AC-4: Given một trang không có phần tử JSX nào, When chạy bài, Then trang thuộc nhóm `chuyen-huong` mà không cần
  dòng trong bảng; And When trang đó thêm JSX mà không dựng đầu trang, Then nó thành trang lệch như AC-2.
- AC-5: Given bảng, When một dòng trỏ tệp không có trong tập trang, trùng tệp với dòng khác, mang `loai` ngoài tập
  `ngoai-app` · `ban-mau` · `toan-vung` · `chuyen-huong-sau-tai` · `tieu-de-theo-du-lieu` · `no`, hoặc `ly_do` rỗng,
  Then bài đỏ với một dòng gọi tên tệp và lỗi của dòng.
- AC-6: Given một dòng của bảng, When trang của nó tới đủ `PageShellHeader`, `PageShellTitle` và
  `PageShellDescription` lúc tải, Then bài đỏ «ngoại lệ thừa» gọi tên tệp; And When dòng mang loại
  `tieu-de-theo-du-lieu` mà trang không tới `PageShellHeader` lúc tải, Then bài đỏ gọi tên tệp.
- AC-7: Given cây ở đỉnh đang xét, When chạy bài, Then không dòng đỏ nào; bảng có 21 dòng, năm dòng `no` là đúng
  tập {chi tiết tác nhân, Hội thoại, một hội thoại, Lịch sử trang, phiên bản cũ của trang}, mỗi dòng `no` ghi đích
  sửa; và bài chạy trong `bun run test` của `apps/app`.
- AC-8: Given danh sách đưa cho lối quét có đường `page.tsx` ngoài `apps/app/app/` (dưới `docs/`, `_acceptance/`,
  `packages/`), When quét, Then các đường ấy không vào tập trang và không sinh dòng đỏ nào.

## Coverage

Bỏ coverage-scan — bài toán một chiều: mỗi trang của cây vào đúng một nhóm, và tập trang là đầu ra của một lệnh
(`git ls-files`), nên đủ là quan hệ bằng nhau của AC-1 chứ không phải lưới trục (entry «bỏ coverage-scan» trong
`decisions.jsonl`). Thước đủ của phần lệch: bảng 21 dòng đo trên cây ở design doc, mục «Vấn đề, đo trên cây».

## Out of scope

- Hình khung xương lúc tải của trang mới — **chờ chủ kho chốt ở Cổng Phạm vi (Hỏi-1)**. Câu giao ghi «hình theo
  màn»; hợp đồng này soát phần đầu trang của hình ấy. AC-3 và AC-17 của `khung-man-chung` (đã ký) giữ bảng hình bằng
  tập ở `3a2783409`, nên trang mới chưa dùng được `KhungXuong`; mở bảng đó là đổi lời tiêu chí đã ký. Máy khuyên
  để phần này cho hàng riêng `bang-hinh-khung-mo` (yêu cầu `L-2` đã gửi giám sát).
- Sửa năm trang nợ: bảng chặn nợ mới, không dọn nợ cũ (luật 40 của đợt).
- Hàng công cụ và lọc (BK6).
- `<h2>` thô ở Kết nối và Slack (bảng «Dấu hiệu vẽ tay», BK5).

## Notes

- Lối quét nằm ở `apps/app/test/support/khung-trang.ts` để BK6 nhập lại, không chạm `apps/app/test/lib/**`
  (vùng BK2).
