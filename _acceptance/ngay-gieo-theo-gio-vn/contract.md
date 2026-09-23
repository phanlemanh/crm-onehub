---
schema_version: 1
feature: Ngày gieo của test «bước của tôi» tính theo ngày giờ VN như sản phẩm, ghim bằng hai mốc giờ
slug: ngay-gieo-theo-gio-vn
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: signed-off
design_doc: docs/superpowers/specs/2026-09-23-ngay-gieo-theo-gio-vn-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-23T00:03:00Z
---

# Acceptance Contract: ngay-gieo-theo-gio-vn

## Context

Ca `viec-cua-toi` trong `apps/api/test/moi-phia-ke-hoach.spec.ts` đỏ trong khung
00:00–07:00 giờ VN và xanh ngoài khung. Hàm gieo `ngayCach` dựng hạn theo ngày UTC,
còn sản phẩm cắt cửa sổ «bước của tôi» theo ngày giờ VN (hồ sơ
`han-viec-theo-ngay`). Đã tái hiện đỏ trên `origin/onehub` 607fe361 lúc 06:44 VN
ngày 23/09, và đường nền của vòng này đỏ đúng một ca đó. Vòng này sửa phép đo,
không sửa sản phẩm.

Source input: prompt

## Criteria

- AC-1: Given đồng hồ ghim ở 2026-09-22T23:30:00Z (06:30 VN 23/09, ngày UTC còn 22/09) và A được giao các bước gieo bằng `ngayCach` ở D-1, D, D+3, D+4, thêm một bước đã xong, một bước của B và một bước trong kế hoạch đã đóng, When gọi thật `DashboardService.summary` của A ở chế độ `me` và `everyone`, Then phần «bước của tôi» thuộc các kế hoạch gieo bằng đúng [D-1, D, D+3] theo thứ tự, ngày hiển thị là 2026-09-22, 2026-09-23, 2026-09-26, bước của B không vào, và đổi hạn D+4 sang D+3 thì D+4 vào.
- AC-2: Given đồng hồ ghim ở 2026-09-22T13:54:00Z (20:54 VN 22/09, cùng ngày UTC) và cùng bộ gieo như AC-1, When gọi thật `DashboardService.summary` của A ở hai chế độ, Then phần «bước của tôi» bằng đúng [D-1, D, D+3] với ngày 2026-09-21, 2026-09-22, 2026-09-25, cùng hai đối chứng như AC-1.
- AC-3: Given hai mốc ghim của AC-1 và AC-2, When gọi `ngayCach(k)` với k ∈ {-1, 0, 3, 4}, Then mỗi giá trị bằng đúng giá trị `ngayLich` của sản phẩm phân tích từ ngày lịch VN hôm-nay-cộng-k viết sẵn trong bảng (tám ô).
- AC-4: Given một bản sao của tệp test, bộ gieo và fixture ở thư mục ẩn, When chạy bản sao nguyên vẹn rồi chạy lại sau khi trả `ngayCach` về cách tính theo ngày UTC, Then lượt nguyên vẹn xanh cả bốn ca; lượt phá thì hai ca `khung-dem` đỏ với thông điệp ghim và hai ca `khung-ngay` vẫn xanh.
- AC-5: Given `moi-phia-ke-hoach.spec.ts` là tệp duy nhất trong `apps/api/test` gọi `ngayCach`, When chạy cả tệp ở giờ thật, Then mọi ca trong tệp xanh.
- AC-6: Given cây sau bản sửa, When chạy năm lệnh chứng của kho (`bun run test`, `check-types`, `lint`, `lint:slop`, `build`), Then cả năm thoát 0.

## Coverage

Không chạy skill morphological-scan: không gian hẹp và đã khai đủ trong đề bài
(xem entry `descope` trong sổ quyết định). Ba trục khai thẳng:

- Trục giờ chạy: trong khung 00:00–07:00 VN (AC-1, AC-3) | ngoài khung (AC-2, AC-3) | giờ thật lúc chạy (AC-5, AC-6)
- Trục lớp đo: hàm gieo (AC-3) | dịch vụ tổng quan qua cơ sở dữ liệu (AC-1, AC-2) | toàn suite và bản dựng (AC-5, AC-6)
- Trục chiều: xanh trên vật lành (AC-1, AC-2, AC-3) | đỏ khi trả về cách tính UTC (AC-4)

## Out of scope

- Không đổi mã sản phẩm (`dashboard.service.ts`, `onboarding-nhac.ts`). Sản phẩm đúng, phép đo sai.
- Không đụng `ngayCach(goc, soNgay)` của `apps/agent/test/support/nhac-gui-gieo.ts`: hàm khác, nhận mốc tường minh, không đọc đồng hồ.
- Không quét các ca test ngày-lịch khác trong kho; `han-viec.spec.ts` đã ghim giờ bằng `setSystemTime`.

## Notes

Mã test viết trước hợp đồng, vì đề bài đã chốt gốc lỗi, cách sửa, cách ghim và
cách chứng đỏ. Giảm nhẹ: mỗi tiêu chí neo vào một lệnh chạy được; ngày mong đợi
là hằng viết trước, không suy từ hàm đang đo; AC-4 đo chiều đỏ trên bản sao, và
chính răng của AC-4 đã được thử đỏ bằng cách dời mốc `khung-dem` ra 09:00 VN.

Không có bề mặt người nhìn. Không sinh eval thiết kế hay `ui-check`.

- Known limit (Ngoài-1, Cổng Bằng chứng 2026-09-23): E3 khai «round-trip qua writer thật» nhưng chỉ so `ngayCach` với bộ phân tích đầu vào `ngayLich`; không ca nào đi qua đường ghi hạn bước của sản phẩm, nên nếu đường ghi đổi cách tính ngày thì E1–E3 vẫn xanh.
