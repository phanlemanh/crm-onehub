---
slug: noi-zalo-cho-nguoi-moi
at: 2026-09-24T04:20:00Z
route: http://localhost:3300/proto/noi-zalo-cho-nguoi-moi
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (ghim)
options:
divergence: skipped — khuôn đã chốt với chủ kho 24/09: wizard ba bước trong trang cài đặt sẵn có (khuôn khoá nghiên cứu cho ô token, stepper dọc tham chiếu ReUI onboarding-2), không mở màn riêng
ds_skill: web-design-guidelines
states: [ST-thong-bao-chua-noi, ST-thong-bao-ma-cho, ST-thong-bao-ma-het-han, ST-thong-bao-da-noi, ST-thong-bao-gui-thu-xong, ST-thong-bao-gui-thu-loi, ST-ket-noi-chua-bat, ST-ket-noi-dang-luu, ST-ket-noi-token-sai, ST-ket-noi-zalo-tu-choi, ST-ket-noi-song, ST-ket-noi-can-https, ST-ket-noi-chua-webhook, ST-ket-noi-env, ST-ket-noi-thanh-vien]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 4
deferred: 2
---
# design-pass — noi-zalo-cho-nguoi-moi

Bản mẫu là module `noi-zalo-cho-nguoi-moi` dưới `/proto`, ghép từ component thật
của `packages/ui` và **dùng lại** khung Cài đặt, khối mã và khối chọn kênh của
module `nhac-qua-zalo` (mở `export`, không chép). Dữ liệu giả, không đường ghi.
Ba bước tạm dựng bằng danh sách có số (`Badge` + `ol`) chờ `@reui/stepper`.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-thong-bao-chua-noi | desktop-1280 | light | evidence/design-pass/ST-thong-bao-chua-noi--desktop-1280--light.png |
| ST-thong-bao-chua-noi | mobile-375 | light | evidence/design-pass/ST-thong-bao-chua-noi--mobile-375--light.png |
| ST-thong-bao-ma-cho | desktop-1280 | light | evidence/design-pass/ST-thong-bao-ma-cho--desktop-1280--light.png |
| ST-thong-bao-ma-cho | desktop-1280 | dark | evidence/design-pass/ST-thong-bao-ma-cho--desktop-1280--dark.png |
| ST-thong-bao-ma-cho | mobile-375 | light | evidence/design-pass/ST-thong-bao-ma-cho--mobile-375--light.png |
| ST-thong-bao-ma-het-han | desktop-1280 | light | evidence/design-pass/ST-thong-bao-ma-het-han--desktop-1280--light.png |
| ST-thong-bao-da-noi | desktop-1280 | light | evidence/design-pass/ST-thong-bao-da-noi--desktop-1280--light.png |
| ST-thong-bao-da-noi | mobile-375 | light | evidence/design-pass/ST-thong-bao-da-noi--mobile-375--light.png |
| ST-thong-bao-gui-thu-xong | desktop-1280 | light | evidence/design-pass/ST-thong-bao-gui-thu-xong--desktop-1280--light.png |
| ST-thong-bao-gui-thu-loi | desktop-1280 | light | evidence/design-pass/ST-thong-bao-gui-thu-loi--desktop-1280--light.png |
| ST-ket-noi-chua-bat | desktop-1280 | light | evidence/design-pass/ST-ket-noi-chua-bat--desktop-1280--light.png |
| ST-ket-noi-chua-bat | desktop-1280 | dark | evidence/design-pass/ST-ket-noi-chua-bat--desktop-1280--dark.png |
| ST-ket-noi-chua-bat | mobile-375 | light | evidence/design-pass/ST-ket-noi-chua-bat--mobile-375--light.png |
| ST-ket-noi-dang-luu | desktop-1280 | light | evidence/design-pass/ST-ket-noi-dang-luu--desktop-1280--light.png |
| ST-ket-noi-token-sai | desktop-1280 | light | evidence/design-pass/ST-ket-noi-token-sai--desktop-1280--light.png |
| ST-ket-noi-token-sai | mobile-375 | light | evidence/design-pass/ST-ket-noi-token-sai--mobile-375--light.png |
| ST-ket-noi-zalo-tu-choi | desktop-1280 | light | evidence/design-pass/ST-ket-noi-zalo-tu-choi--desktop-1280--light.png |
| ST-ket-noi-song | desktop-1280 | light | evidence/design-pass/ST-ket-noi-song--desktop-1280--light.png |
| ST-ket-noi-song | mobile-375 | light | evidence/design-pass/ST-ket-noi-song--mobile-375--light.png |
| ST-ket-noi-can-https | desktop-1280 | light | evidence/design-pass/ST-ket-noi-can-https--desktop-1280--light.png |
| ST-ket-noi-chua-webhook | desktop-1280 | light | evidence/design-pass/ST-ket-noi-chua-webhook--desktop-1280--light.png |
| ST-ket-noi-env | desktop-1280 | light | evidence/design-pass/ST-ket-noi-env--desktop-1280--light.png |
| ST-ket-noi-thanh-vien | desktop-1280 | light | evidence/design-pass/ST-ket-noi-thanh-vien--desktop-1280--light.png |

## Cảnh ngữ-cảnh

- Không cần: `context: static-frame` — mọi ảnh đã bọc trong khung Cài đặt tĩnh
  (thanh bên thật của kho), thấy chỗ màn sống và mục «Kết nối», «Thông báo của bạn».

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- «Zalo: Zalo chưa bật cho xưởng» và «Slack: Slack chưa nhận ra bạn» ở khối chọn
  kênh: câu lý do bỏ tên kênh lặp (sửa luôn trong module `nhac-qua-zalo`).
- Nút «Thay token» khi bot đã bật đổi từ tô đầy sang `outline`: ở trang này hành động
  chính không phải thay token (luật «chỉ hai thứ được tô đầy» của `docs/design.md`).
- Bỏ dòng «Token đang dùng: ••••x7Qa» vì ô token đã hiện đúng gợi ý đó; chỉ giữ
  câu nguồn khi token nằm trong `.env`.
- Dòng «3/7 người đã nối Zalo» và nút «Nối Zalo của tôi» xuống hàng ở 375 thay vì
  ép chữ thành năm dòng hẹp.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Ba bước có số: cài `@reui/stepper` vào `packages/ui/src/components/reui/` ở S3
  (dry-run sạch, đổi import `cn` sang `@crm/ui/lib/utils`); proto tạm dựng bằng
  `Badge` + `ol`, có ghi đè `className` trên `Badge` — thay hết khi stepper về.
- `StatusIndicator` cắt nhãn dài ở 375: dòng «Đang chờ bạn nhắn · hết hạn lúc …»
  thành «hết …» (cùng lớp lỗi với «Not conne…» của lái thử). Đề xuất ở S3: tách giờ
  hết hạn thành một dòng chữ riêng dưới chỉ báo; AC-14 đã thêm điều kiện này.
