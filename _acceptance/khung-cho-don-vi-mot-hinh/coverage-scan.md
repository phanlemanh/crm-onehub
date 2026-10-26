# Quét độ phủ — khung-cho-don-vi-mot-hinh (DH12)

Preset `test-matrix` của skill morphological-scan. Không gian: những khung chờ người dùng có thể thấy ở trang
Theo đơn vị từ lúc mở trang tới lúc bảng mục tiêu hiện.

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub, khu Mục tiêu (OKR), trang Theo đơn vị. Chân sản phẩm: đào kho —
  `apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx`, `theo-don-vi.tsx`, `hang-cong-cu.tsx`,
  `packages/ui/src/components/khung-xuong.tsx`, `docs/design.md` mục «Chờ tải và lỗi tải».
- Chân ngành: [NGÀNH: Nielsen Norman Group — «Skeleton Screens 101»] khung xương phải giống bố cục trang sắp hiện,
  và [NGÀNH: Carbon Design System — skeleton states] khung xương thay đúng thành phần sẽ hiện, không trộn hình.

## Trục

- Trục A — pha tải sinh khung chờ: A1 fallback Suspense lúc máy chủ chưa xong (`page.tsx`) | A2 phía trình duyệt chờ
  kỳ, quyền, cây tổ chức (`theo-don-vi.tsx` nhánh `cycles/access/cay isPending`) | A3 phía trình duyệt chờ danh sách
  mục tiêu khi hàng công cụ thật đã hiện (`byUnit.isPending || isPlaceholderData`)
  [thước CE: SUY-TỪ-REPO `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx` dòng 175 và 237, `page.tsx` dòng 30]
- Trục B — đường vào: B1 tải cứng | B2 điều hướng mềm từ thẻ OKR khác | B3 đổi đơn vị trên trang
  [thước CE: SUY-TỪ-REPO `_acceptance/trang-don-vi-mot-bang/rang/man-don-vi.mjs` — E4 đo tải cứng và đổi đơn vị mềm]
- Trục C — khổ: C1 1440 | C2 390
  [thước CE: SUY-TỪ-REPO `docs/design.md` (chụp 1280 và 375), `_acceptance/trang-don-vi-mot-bang/evals.yaml` E4 (390)]
- Trục D — kiểu xem: D1 danh sách | D2 cây căn chỉnh | D3 họp tuần | D4 chấm điểm
  [thước CE: SUY-TỪ-REPO `apps/app/app/(app)/[slug]/okr/okr-search-params.ts` `CACH_XEM`]

## Không gian (A × B × C trên D1; D2–D4 tách riêng)

| Ô | Có thật? | Nhãn |
|---|---|---|
| A1·B1·C1, A1·B1·C2 | có — trang trả fallback trước khi `NoiDung` xong | Core |
| A1·B2·C1, A1·B2·C2 | có — điều hướng mềm chờ RSC | Core |
| A2·B1/B2 | hiếm — kỳ, quyền, cây đã nạp sẵn phía máy chủ; vẫn là một nhánh mã | Core (đo bằng bài kiểm cấu trúc, không bằng màn) |
| A3·B3·C1, A3·B3·C2 | có — đổi đơn vị, danh sách nạp lại | Core |
| A3·B1 | chỉ khi danh sách không nạp sẵn được phía máy chủ | gộp vào A3·B3 (cùng nhánh mã) |
| A1·D2–D4, A3·D2–D4 | D2–D4 có khung đang tải riêng (`DangTai`, `HopTuan`, `ChamDiem`) | Later |

Core 4 nhóm ô trên 9 nhóm có nghĩa; gộp được vì A1, A2, A3 đều đi qua một thành phần sau khi sửa — thước «một hình»
đo chữ ký thân bảng của mọi mẫu đang tải, không đo từng ô riêng.

## Later

- Khung đang tải của cây căn chỉnh, họp tuần, chấm điểm (D2–D4): mỗi kiểu xem có khung riêng hợp với hình của nó;
  thống nhất chúng là một vòng khác nếu có người gặp.
- Bảng giữ nguyên khi đổi lọc thay vì chuyển sang khung chờ: hàng DH13 `loc-don-vi-khong-tu-dong`.

## Never

- Đổi hình `bang` dùng chung của Liên hệ, Thoả thuận, Công ty, Chiến dịch, Onboarding, Cài đặt — trang nào cũng có bảng
  một dòng; đổi nó vì một trang là sai tầng.

## Cross-cutting áp mọi ô Core

- Một dòng trạng thái đọc được cho trình đọc màn hình, phần vẽ ẩn, không vạch nhận tiêu điểm (`docs/design.md`,
  bài `packages/ui/test/khung-xuong.dom.tsx`).
- Không vòng quay toàn trang, không cây đơn vị, tối đa một ô chọn đơn vị lúc đang tải (AC-8 của DH2, đã ký).
