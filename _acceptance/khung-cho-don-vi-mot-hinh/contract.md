---
schema_version: 1
feature: Mở trang Theo đơn vị lúc đang tải chỉ thấy một khung chờ đúng hình bảng, không hai khung khác hình nối nhau
slug: khung-cho-don-vi-mot-hinh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-20-khung-cho-don-vi-mot-hinh-design.md
---

# Acceptance Contract: khung-cho-don-vi-mot-hinh

## Context

Trang Theo đơn vị có hai khung chờ khác hình: fallback `Suspense` của `page.tsx` dùng hình `bang` chung (tám dòng một
vạch), còn `theo-don-vi.tsx` vẽ tay `KhungDangTaiDonVi` (năm dòng hai tầng, hình đích đã duyệt ở bản mẫu của DH2). Mở
trang hay đổi đơn vị có thể thấy hai khung nối nhau, và khung đầu không giống bảng sắp hiện. Lượt này thêm hình
`bang-hai-dong` vào `KhungXuong` của `packages/ui` và cho trang dùng đúng một khung ở mọi pha tải. Chỉ giao diện: thủ
tục API, dữ liệu, quyền giữ nguyên.

Source input: hàng DH12 `docs/plan/lo-trinh-okr.json`; Ngoài-1 của hồ sơ đã ký `_acceptance/trang-don-vi-mot-bang`
(`d-20261017T223322Z-56`); ô cơ hội `_acceptance/khung-cho-don-vi-mot-hinh/opportunity.md` (Cổng Đáng 19/10).

## Criteria

- AC-1: Given trang Theo đơn vị (kiểu xem danh sách) mở bằng tải cứng trên mạng chậm, ở 1440 px và ở 390 px, When trang
  đi từ lúc vẽ đầu tới khi dòng mục tiêu đầu tiên hiện, Then mọi lúc đang tải có khung chờ đều mang cùng một chữ ký khung —
  cùng chiều cao hàng công cụ, cùng khoảng từ đỉnh vùng nội dung tới đầu bảng, cùng chiều cao đầu bảng, cùng số dòng
  khung, cùng chiều cao từng dòng — không lúc nào có khung chờ nào khác hình (vạch hay vùng đang tải không thuộc khung
  này), và lúc đang tải không có cây đơn vị, không quá một ô chọn đơn vị, không vòng quay toàn trang.
- AC-2: Given người đang ở một thẻ OKR khác (Toàn cảnh), When bấm thẻ Theo đơn vị (điều hướng mềm) trên mạng chậm, Then
  khung chờ trên đường đi mang đúng chữ ký thân bảng của AC-1 ở cùng khổ.
- AC-3: Given trang Theo đơn vị đã có bảng của một đơn vị, When chọn đơn vị khác trong ô chọn và danh sách mục tiêu còn
  đang nạp, Then hàng công cụ thật (ô chọn đơn vị, nút chuyển kiểu xem) vẫn hiện, và bấm vào ô chọn đơn vị
  mở được danh sách đơn vị, thân bảng là khung mang
  đúng chữ ký của AC-1, và đỉnh ô chọn đơn vị không đổi quá 1 px giữa lúc đang tải và lúc bảng đã dựng.
- AC-4: Given khung chờ của AC-1 và bảng đã dựng của cùng trang, cùng khổ, When so hai cái, Then ở mọi lúc
  đang tải khung có không quá 5 dòng, mỗi dòng khung cao trong khoảng từ dòng mục tiêu thật thấp nhất tới dòng cao nhất
  của bảng đó, và đầu bảng, hàng công cụ của khung cao lệch đầu bảng, hàng công cụ thật không quá 1 px.
- AC-5: Given mã nguồn trang Theo đơn vị, When dựng fallback của `page.tsx` và `KhungDangTaiDonVi` (có và không có hàng
  công cụ thật), Then fallback của `page.tsx` chính là `KhungDangTaiDonVi`, cả ba vẽ cùng một `KhungXuong` hình
  `bang-hai-dong` của `packages/ui` với cùng chữ ký thân bảng, và không tệp nào dưới `okr/theo-don-vi/` tự vẽ vạch
  (nhập `Skeleton` theo bất kỳ đường nào, hay dùng lớp `animate-pulse`).
- AC-6: Given `KhungXuong` của `packages/ui`, When dựng hình `bang-hai-dong`, Then có một hàng công cụ, một đầu bảng và
  năm dòng, mỗi dòng có vạch con; sáu hình cho sáu cây khác nhau; năm hình cũ giữ đúng số vạch hôm nay; và mọi trang
  khác đang dùng hình `bang` vẫn dùng hình `bang`.
- AC-7: Given khung chờ của trang Theo đơn vị, When trình đọc màn hình đi qua nó — ở fallback của `page.tsx` và ở pha tải phía trình duyệt, có và
  không có hàng công cụ thật — Then nó có `aria-busy="true"`, đúng một
  dòng trạng thái đọc «Đang tải OKR…», phần vạch ẩn với trình đọc màn hình, không vạch nào nhận tiêu điểm; khi có hàng
  công cụ thật thì hàng đó nằm ngoài phần ẩn và ô chọn đơn vị nhận được tiêu điểm.

## Coverage

Quét bằng skill morphological-scan, preset test-matrix — bản đầy đủ ở `_acceptance/khung-cho-don-vi-mot-hinh/coverage-scan.md`.

- Trục A — pha tải sinh khung chờ: fallback Suspense | chờ kỳ, quyền, cây | chờ danh sách khi hàng công cụ thật đã có [thước CE: SUY-TỪ-REPO `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx`, `page.tsx`]
- Trục B — đường vào: tải cứng | điều hướng mềm | đổi đơn vị [thước CE: SUY-TỪ-REPO `_acceptance/trang-don-vi-mot-bang/rang/man-don-vi.mjs` E4]
- Trục C — khổ: 1440 | 390 [thước CE: SUY-TỪ-REPO `docs/design.md`]
- Trục D — kiểu xem: danh sách (Core) | cây, họp tuần, chấm điểm (Later — khung riêng) [thước CE: SUY-TỪ-REPO `okr-search-params.ts` `CACH_XEM`]
- Chân ngành: [NGÀNH: Nielsen Norman Group — «Skeleton Screens 101»], [NGÀNH: Carbon Design System — skeleton states]: khung xương giống bố cục sắp hiện, không trộn hình.
- Ô chờ kỳ, quyền, cây hiếm thấy trên màn (đã nạp sẵn phía máy chủ) → phủ bằng AC-5 (bài kiểm cấu trúc), không bằng thước màn.

## Đường đo

- bỏ đường-đo — ô cơ hội chưa khai ngưỡng nghiệm thu nào để đo (mục «Ngưỡng chết / ngưỡng UAT» còn trống) (entry d-20261020T091146Z-7)

## Out of scope

- Khung đang tải của kiểu xem cây căn chỉnh, họp tuần, chấm điểm — mỗi kiểu có khung riêng; không đổi.
- Giữ bảng cũ khi đổi lọc thay vì chuyển sang khung chờ, và menu «Lọc» tự đóng sau mỗi lần chọn — hàng DH13
  `loc-don-vi-khong-tu-dong`.
- Hình `bang` dùng chung của Liên hệ, Thoả thuận, Công ty, Chiến dịch, Onboarding, Cài đặt — không đổi.
- Trang «Của tôi» (`ST-donvi-dangtai` cũng dùng ở đó qua `trang-thai-okr.tsx`) — không đổi khung của nó.
- `translate="no"` trên chữ giao diện ở chân bảng (Ngoài-2 của DH2, chủ kho ghi Known limits).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Hình đích của khung chờ là hình đã duyệt ở bản mẫu của DH2 (`/proto/trang-don-vi-mot-bang`, trạng thái
  `ST-donvi-dangtai`); vòng này chuyển hình đó vào `packages/ui`, không vẽ hình mới.
- Chạm `apps/app/app/(app)/[slug]/okr/theo-don-vi/**` và `packages/ui/src/components/khung-xuong.tsx`: các hồ sơ đã ký
  canh hai chỗ này sẽ được giữ tươi ở bước ghim lại trước khi gộp.
