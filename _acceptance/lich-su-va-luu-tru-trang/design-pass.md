---
slug: lich-su-va-luu-tru-trang
at: 2026-10-13T12:55:00Z
route: http://localhost:3606/proto/lich-su-va-luu-tru-trang
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (ghim — ảnh gửi qua giám sát, chủ kho phản ứng lúc rảnh)
options:
divergence: skipped — màn đọc, màn duyệt, danh sách và tab Chờ duyệt của Kho đã có khuôn; lịch sử theo khuôn danh-sách-chi-tiết như Confluence Page history
ds_skill: repo-tokens
states: [ST-lich-su-nhieu-ban, ST-lich-su-mot-ban, ST-ban-cu-so-sanh, ST-ban-cu-toan-van, ST-ban-cu-dang-dung, ST-doc-hop-luu-tru, ST-doc-cho-luu-tru, ST-doc-da-luu-tru, ST-duyet-luu-tru, ST-duyet-quay-lai, ST-ds-da-luu-tru, ST-ds-da-luu-tru-rong, ST-cho-duyet-da-xu-ly]
breakpoints: [mobile-375, desktop-1280]
themes: [light]
patched: 2
deferred: 3
---
# design-pass — lich-su-va-luu-tru-trang

Bản mẫu ghép từ component thật của `@crm/ui` (subpath), dữ liệu giả, không đường ghi, trong khung ứng dụng tĩnh của bản mẫu
Kho có sẵn (`_modules/kho-tai-lieu/khung.tsx`). Chạy trên cổng 3606 với `PROTO_ROUTE=1` (3000/3001 là của chủ kho).
Không trạng thái nào cuộn ngang ở 375 và 1280 (đo `scrollWidth - clientWidth` = 0 cho cả 26 ảnh).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-lich-su-nhieu-ban | mobile-375 | light | evidence/design-pass/ST-lich-su-nhieu-ban--mobile-375.png |
| ST-lich-su-nhieu-ban | desktop-1280 | light | evidence/design-pass/ST-lich-su-nhieu-ban--desktop-1280.png |
| ST-lich-su-mot-ban | mobile-375 | light | evidence/design-pass/ST-lich-su-mot-ban--mobile-375.png |
| ST-lich-su-mot-ban | desktop-1280 | light | evidence/design-pass/ST-lich-su-mot-ban--desktop-1280.png |
| ST-ban-cu-so-sanh | mobile-375 | light | evidence/design-pass/ST-ban-cu-so-sanh--mobile-375.png |
| ST-ban-cu-so-sanh | desktop-1280 | light | evidence/design-pass/ST-ban-cu-so-sanh--desktop-1280.png |
| ST-ban-cu-toan-van | mobile-375 | light | evidence/design-pass/ST-ban-cu-toan-van--mobile-375.png |
| ST-ban-cu-toan-van | desktop-1280 | light | evidence/design-pass/ST-ban-cu-toan-van--desktop-1280.png |
| ST-ban-cu-dang-dung | mobile-375 | light | evidence/design-pass/ST-ban-cu-dang-dung--mobile-375.png |
| ST-ban-cu-dang-dung | desktop-1280 | light | evidence/design-pass/ST-ban-cu-dang-dung--desktop-1280.png |
| ST-doc-hop-luu-tru | mobile-375 | light | evidence/design-pass/ST-doc-hop-luu-tru--mobile-375.png |
| ST-doc-hop-luu-tru | desktop-1280 | light | evidence/design-pass/ST-doc-hop-luu-tru--desktop-1280.png |
| ST-doc-cho-luu-tru | mobile-375 | light | evidence/design-pass/ST-doc-cho-luu-tru--mobile-375.png |
| ST-doc-cho-luu-tru | desktop-1280 | light | evidence/design-pass/ST-doc-cho-luu-tru--desktop-1280.png |
| ST-doc-da-luu-tru | mobile-375 | light | evidence/design-pass/ST-doc-da-luu-tru--mobile-375.png |
| ST-doc-da-luu-tru | desktop-1280 | light | evidence/design-pass/ST-doc-da-luu-tru--desktop-1280.png |
| ST-duyet-luu-tru | mobile-375 | light | evidence/design-pass/ST-duyet-luu-tru--mobile-375.png |
| ST-duyet-luu-tru | desktop-1280 | light | evidence/design-pass/ST-duyet-luu-tru--desktop-1280.png |
| ST-duyet-quay-lai | mobile-375 | light | evidence/design-pass/ST-duyet-quay-lai--mobile-375.png |
| ST-duyet-quay-lai | desktop-1280 | light | evidence/design-pass/ST-duyet-quay-lai--desktop-1280.png |
| ST-ds-da-luu-tru | mobile-375 | light | evidence/design-pass/ST-ds-da-luu-tru--mobile-375.png |
| ST-ds-da-luu-tru | desktop-1280 | light | evidence/design-pass/ST-ds-da-luu-tru--desktop-1280.png |
| ST-ds-da-luu-tru-rong | mobile-375 | light | evidence/design-pass/ST-ds-da-luu-tru-rong--mobile-375.png |
| ST-ds-da-luu-tru-rong | desktop-1280 | light | evidence/design-pass/ST-ds-da-luu-tru-rong--desktop-1280.png |
| ST-cho-duyet-da-xu-ly | mobile-375 | light | evidence/design-pass/ST-cho-duyet-da-xu-ly--mobile-375.png |
| ST-cho-duyet-da-xu-ly | desktop-1280 | light | evidence/design-pass/ST-cho-duyet-da-xu-ly--desktop-1280.png |

## Cảnh ngữ-cảnh

- Không cần: bản mẫu ở nấc `static-frame` — khung ứng dụng tĩnh (thanh trên, thanh biểu tượng với «Tài liệu» đang mở) bọc vật.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Phiên bản cũ: chiều so đổi thành từ bản đang dùng tới phiên bản cũ, nhãn «Quay lại sẽ thêm / sẽ bỏ / Số và ngày sẽ đổi» —
  trước đó tô ngược chiều với nhãn «Chỉ phiên bản này có».
- Dải trang đã lưu trữ: «Đề xuất khôi phục» rời khỏi câu mô tả, sang `AlertAction placement="below"` — ở 375 nút từng chen
  giữa dòng chữ.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `design_pass.ds_skill` khai `web-design-guidelines`, mà skill đó là bộ soát mã giao diện (tải luật từ mạng rồi soát tệp),
  không phải từ vựng DS — phiên chạy trên token của kho (`packages/ui`), và skill ấy sẽ dùng ở bước soát sau S3.
- Mảnh dải báo bản ghi đã lưu trữ dùng chung chưa có trong `packages/ui` — việc của hàng V2e `dai-luu-tru-dung-chung`;
  bản mẫu và lượt này dùng `Alert`.
- Nút «Đã lưu trữ» trên thanh công cụ bảng chưa thành mảnh chung (`docs/vong-doi.md` mục Mảnh dùng chung, «lượt 2») —
  danh sách trang Kho dựng tại chỗ như các bảng khác đang làm.
