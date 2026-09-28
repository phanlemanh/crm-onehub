---
slug: tro-ly-okr-nen
at: 2026-09-27T07:21:42Z
route: http://localhost:3900/proto/tro-ly-okr-nen
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (anh-gui-kem-the-cong)
options:
divergence: skipped — trang Cài đặt › Chương trình OKR đã là khuôn một-cột-cuộn gồm các thẻ; hai khối mới là hai thẻ thêm cuối, không có hướng thứ hai khả dĩ
ds_skill: web-design-guidelines
states: [ST-troly-san-sang, ST-troly-dang-tai, ST-troly-tat, ST-troly-chua-san-sang, ST-troly-het-tran, ST-troly-khong-don-vi, ST-troly-loi-luu, ST-sochiphi-dang-tai, ST-sochiphi-rong, ST-sochiphi-co-so, ST-sochiphi-80, ST-sochiphi-100, ST-sochiphi-doi-soat-lech, ST-sochiphi-khong-doi-soat, ST-sochiphi-loi, ST-thanh-vien]
breakpoints: [mobile-375, desktop-1280]
themes: [dark, light]
patched: 3
deferred: 3
---
# design-pass — tro-ly-okr-nen

Bản mẫu chạy trong chính ứng dụng, sau cờ `PROTO_ROUTE=1`, dựng bằng thành phần thật của
`packages/ui` và khung trang `PageShell` thật; dữ liệu giả, không đường ghi. Thanh bên Cài đặt
không có trong bản mẫu — hai khối nằm cuối trang Chương trình OKR, dưới hai thẻ có sẵn (Chu kỳ,
Cấu hình) vẽ dạng thu gọn. Ma trận dark chụp ở cả hai khổ; light chụp bốn trạng thái chính ở
desktop. Không trạng thái nào tràn ngang.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-troly-san-sang | desktop-1280 | dark | evidence/design-pass/ST-troly-san-sang--desktop-1280.png |
| ST-troly-san-sang | mobile-375 | dark | evidence/design-pass/ST-troly-san-sang--mobile-375.png |
| ST-troly-dang-tai | desktop-1280 | dark | evidence/design-pass/ST-troly-dang-tai--desktop-1280.png |
| ST-troly-dang-tai | mobile-375 | dark | evidence/design-pass/ST-troly-dang-tai--mobile-375.png |
| ST-troly-tat | desktop-1280 | dark | evidence/design-pass/ST-troly-tat--desktop-1280.png |
| ST-troly-tat | mobile-375 | dark | evidence/design-pass/ST-troly-tat--mobile-375.png |
| ST-troly-chua-san-sang | desktop-1280 | dark | evidence/design-pass/ST-troly-chua-san-sang--desktop-1280.png |
| ST-troly-chua-san-sang | mobile-375 | dark | evidence/design-pass/ST-troly-chua-san-sang--mobile-375.png |
| ST-troly-het-tran | desktop-1280 | dark | evidence/design-pass/ST-troly-het-tran--desktop-1280.png |
| ST-troly-het-tran | mobile-375 | dark | evidence/design-pass/ST-troly-het-tran--mobile-375.png |
| ST-troly-khong-don-vi | desktop-1280 | dark | evidence/design-pass/ST-troly-khong-don-vi--desktop-1280.png |
| ST-troly-khong-don-vi | mobile-375 | dark | evidence/design-pass/ST-troly-khong-don-vi--mobile-375.png |
| ST-troly-loi-luu | desktop-1280 | dark | evidence/design-pass/ST-troly-loi-luu--desktop-1280.png |
| ST-troly-loi-luu | mobile-375 | dark | evidence/design-pass/ST-troly-loi-luu--mobile-375.png |
| ST-sochiphi-dang-tai | desktop-1280 | dark | evidence/design-pass/ST-sochiphi-dang-tai--desktop-1280.png |
| ST-sochiphi-dang-tai | mobile-375 | dark | evidence/design-pass/ST-sochiphi-dang-tai--mobile-375.png |
| ST-sochiphi-rong | desktop-1280 | dark | evidence/design-pass/ST-sochiphi-rong--desktop-1280.png |
| ST-sochiphi-rong | mobile-375 | dark | evidence/design-pass/ST-sochiphi-rong--mobile-375.png |
| ST-sochiphi-co-so | desktop-1280 | dark | evidence/design-pass/ST-sochiphi-co-so--desktop-1280.png |
| ST-sochiphi-co-so | mobile-375 | dark | evidence/design-pass/ST-sochiphi-co-so--mobile-375.png |
| ST-sochiphi-80 | desktop-1280 | dark | evidence/design-pass/ST-sochiphi-80--desktop-1280.png |
| ST-sochiphi-80 | mobile-375 | dark | evidence/design-pass/ST-sochiphi-80--mobile-375.png |
| ST-sochiphi-100 | desktop-1280 | dark | evidence/design-pass/ST-sochiphi-100--desktop-1280.png |
| ST-sochiphi-100 | mobile-375 | dark | evidence/design-pass/ST-sochiphi-100--mobile-375.png |
| ST-sochiphi-doi-soat-lech | desktop-1280 | dark | evidence/design-pass/ST-sochiphi-doi-soat-lech--desktop-1280.png |
| ST-sochiphi-doi-soat-lech | mobile-375 | dark | evidence/design-pass/ST-sochiphi-doi-soat-lech--mobile-375.png |
| ST-sochiphi-khong-doi-soat | desktop-1280 | dark | evidence/design-pass/ST-sochiphi-khong-doi-soat--desktop-1280.png |
| ST-sochiphi-khong-doi-soat | mobile-375 | dark | evidence/design-pass/ST-sochiphi-khong-doi-soat--mobile-375.png |
| ST-sochiphi-loi | desktop-1280 | dark | evidence/design-pass/ST-sochiphi-loi--desktop-1280.png |
| ST-sochiphi-loi | mobile-375 | dark | evidence/design-pass/ST-sochiphi-loi--mobile-375.png |
| ST-thanh-vien | desktop-1280 | dark | evidence/design-pass/ST-thanh-vien--desktop-1280.png |
| ST-thanh-vien | mobile-375 | dark | evidence/design-pass/ST-thanh-vien--mobile-375.png |
| ST-troly-san-sang | desktop-1280 | light | evidence/design-pass/ST-troly-san-sang--desktop-1280--light.png |
| ST-troly-het-tran | desktop-1280 | light | evidence/design-pass/ST-troly-het-tran--desktop-1280--light.png |
| ST-sochiphi-80 | desktop-1280 | light | evidence/design-pass/ST-sochiphi-80--desktop-1280--light.png |
| ST-thanh-vien | desktop-1280 | light | evidence/design-pass/ST-thanh-vien--desktop-1280--light.png |

## Cảnh ngữ-cảnh

- Không cần: bản mẫu nhúng trong host thật (`context: host-embedded`).

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Danh sách đơn vị đã chọn trông như chữ trơn khi dùng ô nhập thẻ (`TokenField`, vốn cho ô nhập) — đổi sang `Badge variant="token"` trong một danh sách.
- Ở khổ 375 bảng sổ chi phí cắt cột tiền — bỏ cột «Số bước» (lượt này chỉ hứa tiền theo việc); bảng còn hai cột, vừa khổ 375.
- Chỉ báo sẵn sàng đặt trong mô tả của thẻ bị ẩn ở khổ điện thoại (`CardDescription` ẩn dưới `sm`) — dời vào đầu thân thẻ, hiện ở mọi khổ.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Chọn nhiều đơn vị: `packages/ui` có `PickListDialog` nhưng chưa rõ nó nhận cây Bộ phận › Phòng ban; S3 tra nó trước, không vừa thì tra ReUI rồi mới dựng mới (bậc 1–3 của docs/design.md).
- Tiền hiện theo `Intl` vi-VN ra «2,42 US$»; màn thật phải dùng bộ định dạng tiền sẵn có của app (`docs/currency.md`) để cùng cách viết với phần còn lại của CRM.
- Luật rút ra cho S3: không đặt thông tin trạng thái trong `CardDescription` (ẩn trên điện thoại) — trạng thái sống trong thân thẻ.
