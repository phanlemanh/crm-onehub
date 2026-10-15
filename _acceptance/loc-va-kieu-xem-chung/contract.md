---
schema_version: 1
feature: "Lọc và chuyển kiểu xem ở mọi danh sách trông và chạy như nhau, và gửi đường dẫn cho đồng nghiệp là giữ nguyên bộ lọc"
slug: loc-va-kieu-xem-chung
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-15T03:27:14Z
design_doc: docs/superpowers/specs/2026-10-14-loc-va-kieu-xem-chung-design.md
---

# Acceptance Contract: loc-va-kieu-xem-chung

## Context

Hàng NM2 của `docs/plan/lo-trinh-okr.json`, dãy P4 của đợt r2. Ba màn danh sách lệch mục «Chip lọc và chuyển kiểu
xem» của `docs/design.md`: số đếm trong chip có màn mờ bằng `opacity-60`, có màn bằng chữ phụ; Thoả thuận lọc trạng
thái bằng menu thả còn Onboarding bằng chip; Thoả thuận và Onboarding tự ghép `ToggleGroup` để chuyển kiểu xem thay vì
`ViewSwitch`; Tài liệu tự ghép chuỗi truy vấn rồi `router.push` thay vì nuqs. Hạng T2: chạm `packages/ui` và
`apps/app`, không chạm API, cơ sở dữ liệu hay đường T3.

Source input: hàng NM2 (`cau_giao`, `ghi_chu`) · `opportunity.md` (Cổng Đáng ký build 12/10) · `docs/design.md` mục
«Nếp màn trong app» · design doc.

## Criteria

- AC-1: Given `ToggleGroupItem` của `packages/ui`, When người gọi truyền `count={n}`, Then sau nhãn có một phần tử
  `data-slot="toggle-group-item-count"` chứa đúng số `n` (kể cả `0`) với lớp `text-muted-foreground tabular-nums` và
  không lớp `opacity-*`; When không truyền `count`, Then không có phần tử đó; And số đếm của `DataTable` (`FacetCount`,
  số bộ lọc đang bật trên nút «Bộ lọc») dùng `text-muted-foreground`, không `opacity-*`.
- AC-2: Given mã nguồn `apps/app`, When quét mọi tệp `.tsx`, Then không `ToggleGroupItem` nào tự đặt phần tử số đếm
  bên trong (trừ `apps/app/components/lo-trinh/trang-lo-trinh.tsx`, khai ở Out of scope); And Onboarding (trạng thái),
  Tài liệu › Trang (loại trang) và Việc của tôi (nhóm) truyền số đếm qua `count`.
- AC-3: Given danh sách Thoả thuận ở kiểu bảng, When dựng màn, Then lọc trạng thái là một nhóm chip `ToggleGroup`
  (Tất cả · Đang mở · Đã chốt), mỗi chip một số đếm qua `count` — «Tất cả» mang tổng hai chip kia — và không còn menu thả; When bấm một chip, Then tham số
  `status` của đường dẫn đổi theo và trang về 1.
- AC-4: Given Thoả thuận và Onboarding, When dựng màn, Then chuyển kiểu xem — kiểu xem của Thoả thuận, cách xem và
  «Chia cột theo» của Onboarding — là `ViewSwitch` (nhóm nút từ `md`, ô chọn dưới `md`) ghi đúng khoá hôm nay (`view`,
  `cachXem`, `cachChia`); When Thoả thuận đang xem lưu trữ, Then `ViewSwitch` hiện nhưng khoá cả nút lẫn ô chọn.
- AC-5: Given Tài liệu › Trang và › Chờ duyệt, When người dùng đổi loại trang, đơn vị, chủ trang, lưu trữ, nhóm đề
  xuất, xoá lọc hay sang trang, Then giá trị ghi lên đường dẫn qua nuqs với đúng bộ parser `taiLieuParsers` mà trang
  máy chủ đọc, đổi bộ lọc đưa `page` về 1, và danh sách hiện hàng của bộ lọc mới ngay trên trang, không tải lại trang;
  And `danh-sach-trang.tsx`, `cho-duyet.tsx` không còn `router.push`,
  `danh-sach-loc.ts` không còn `URLSearchParams`, và đường dẫn của các thẻ trang con dựng từ cùng bộ parser.
- AC-6: Given một đường dẫn mang bộ lọc và kiểu xem của Thoả thuận (`status`, `view`), Onboarding (`trangThai`,
  `cachXem`) hay Tài liệu (`loai`, `donVi`, `chuTrang`, `archived`, `page`, `nhomDeXuat`) — kể cả đường dẫn chép tay
  theo khoá hôm nay, trước vòng này — When dựng màn chỉ từ đường dẫn đó, Then mọi điều khiển, kể cả kiểu xem bảng cột,
  hiện đúng giá trị trong đường dẫn và truy vấn danh sách nhận đúng bộ lọc ấy; When bấm đổi
  một bộ lọc rồi dựng lại màn từ đường dẫn mới, Then hai trạng thái bằng nhau.
- AC-7 (judgment): Given bản dựng thật của cây chạy trong phiên đo, có dữ liệu mẫu ở Thoả thuận, Onboarding và Tài
  liệu, When chụp ba màn ở 360 và 1280, Then máy đo được mọi số đếm trong chip có màu bằng màu chữ phụ và độ mờ 1,
  `ViewSwitch` là ô chọn ở 360 và nhóm nút ở 1280, trang không cuộn ngang ngoài hai vùng cuộn đã khai (bảng
  `DataTable`, hàng chip trong khối lọc), bấm chip ở Tài liệu thì danh sách đổi ngay trên trang, và dán đường dẫn có
  bộ lọc vào một phiên mới thì điều khiển hiện đúng giá trị; và người xem thấy chip, số đếm và chuyển kiểu xem của ba màn cùng một dáng.

## Coverage

Quét theo khuôn test-matrix của `morphological-scan` (`_acceptance/loc-va-kieu-xem-chung/coverage.md` không tách tệp —
ghi thẳng ở đây).

- Trục màn: Thoả thuận bảng | Thoả thuận bảng cột | Onboarding | Tài liệu › Trang | Tài liệu › Chờ duyệt | Việc của tôi
  | Lộ trình [thước CE: mọi tệp `apps/app` có `ToggleGroupItem` hay `ViewSwitch` theo `git grep` trên c1864a3a2]
- Trục điều khiển: chip lọc trạng thái/nhóm | số đếm trong chip | chuyển kiểu xem | lọc phụ (đơn vị, chủ trang, lưu
  trữ) | phân trang [thước CE: mục «Chip lọc và chuyển kiểu xem» của `docs/design.md`]
- Trục nguồn trạng thái: bấm trên màn | mở đường dẫn gửi tới [thước CE: câu giao NM2 «gửi đường dẫn… giữ nguyên bộ lọc»]
- Trục khổ: 360 | 1280 [thước CE: `ViewSwitch` đổi dạng ở `md`; 360 là khổ đo của F25]
- Core: số đếm × mọi màn có chip (AC-1, AC-2); chip trạng thái × Thoả thuận bảng (AC-3); kiểu xem × Thoả thuận,
  Onboarding (AC-4); lọc phụ + phân trang × Tài liệu (AC-5); mở đường dẫn × ba màn (AC-6); khổ × ba màn (AC-7).
- Later: bảng trên điện thoại cuộn ngang hay thành thẻ (Hỏi-2); Lộ trình sang prop `count`; Thoả thuận bảng cột chưa
  có lọc trạng thái (bảng cột chia theo giai đoạn, trạng thái không áp).

## Out of scope

- Bảng `DataTable` trên điện thoại cuộn ngang (Thoả thuận) hay thành thẻ dọc (Tài liệu) — chờ Hỏi-2, khuyến nghị một
  hàng riêng.
- `apps/app/components/lo-trinh/trang-lo-trinh.tsx` sang prop `count` — vùng Lộ trình của máy khác (luật 19,
  `docs/plan/dot-r2/LUAT-rieng.md`); màn đã đúng nếp hiển thị.
- Thẻ gạch chân của OKR và Tài liệu — là trang con, đã đúng nếp «Thẻ con của trang».
- Đổi tên khoá đường dẫn — giữ tên hôm nay để đường dẫn đã gửi trước vòng này còn mở được.

## Đường đo

- bỏ đường-đo — ô cơ hội không khai ngưỡng (hàng dựng); xem sổ quyết định.

## Notes

- Hồ sơ mở từ hàng NM2 sau khi NM4 (#400) gộp vào `onehub` 1997da85b.
