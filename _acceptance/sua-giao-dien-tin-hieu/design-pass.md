---
slug: sua-giao-dien-tin-hieu
at: 2026-10-14T08:16:28Z
route: http://localhost:3392/proto/sua-giao-dien-tin-hieu
material: real-components
context: standalone
context_scenes: []
reaction: nac-1 (ghim — ảnh trước/sau gửi kèm lời mời Cổng Phạm vi; chủ kho phản ứng lúc rảnh bằng lời)
options:
divergence: skipped — sửa lỗi trên khuôn LT2 đã ký; mở bằng vật thật đang có (hai trạng thái «Trước» dựng từ đúng thành phần đang chạy production), không có hướng IA thứ hai
ds_skill: web-design-guidelines
states: [ST-ds-co, ST-ds-da-xoa, ST-ds-en, ST-ds-rong, ST-ds-xac-nhan-xoa, ST-ds-xoa-hong, ST-ds-xoa-khoa, ST-hop-da-gui, ST-hop-dang-go, ST-hop-loi, ST-hop-qua-tran, ST-hop-qua-tran-en, ST-hop-trong, ST-truoc-bang, ST-truoc-hop-qua-tran]
breakpoints: [mobile-375, desktop-768, desktop-900, desktop-1100, desktop-1280]
themes: [dark]
patched: 2
deferred: 3
---
# design-pass — sua-giao-dien-tin-hieu

Bản mẫu ghép từ thành phần thật của `packages/ui`; hai trạng thái «Trước» dựng từ đúng thành phần đang chạy
(`apps/app/components/tin-hieu/`) với đường dẫn thô như production 14/10. Các trạng thái sau là bản nháp ở
`apps/app/app/proto/_modules/sua-giao-dien-tin-hieu/ban-moi.tsx` — S3 chuyển vào thành phần thật. Dữ liệu giả, chỉ đọc.

Số đo của lượt chụp (bề rộng cột tiêu đề, px): bảng cũ ở 900px `[82, 258, 124, 289, 48]` — cột «Điều đã kể» 82px, đúng
lỗi crm-1; bảng mới ở 768px `[277, 144, 201, 48]`, 900px `[369, 144, 241, 48]`, 1100 và 1280px `[456, 144, 278, 48]` —
cột kể rộng nhất ở mọi khổ; không khổ nào cuộn ngang.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-ds-co | desktop-1100 | dark | evidence/design-pass/ST-ds-co--desktop-1100.png |
| ST-ds-co | desktop-1280 | dark | evidence/design-pass/ST-ds-co--desktop-1280.png |
| ST-ds-co | desktop-768 | dark | evidence/design-pass/ST-ds-co--desktop-768.png |
| ST-ds-co | desktop-900 | dark | evidence/design-pass/ST-ds-co--desktop-900.png |
| ST-ds-co | mobile-375 | dark | evidence/design-pass/ST-ds-co--mobile-375.png |
| ST-ds-da-xoa | desktop-1280 | dark | evidence/design-pass/ST-ds-da-xoa--desktop-1280.png |
| ST-ds-en | desktop-1280 | dark | evidence/design-pass/ST-ds-en--desktop-1280.png |
| ST-ds-en | mobile-375 | dark | evidence/design-pass/ST-ds-en--mobile-375.png |
| ST-ds-rong | desktop-1280 | dark | evidence/design-pass/ST-ds-rong--desktop-1280.png |
| ST-ds-rong | mobile-375 | dark | evidence/design-pass/ST-ds-rong--mobile-375.png |
| ST-ds-xac-nhan-xoa | desktop-1280 | dark | evidence/design-pass/ST-ds-xac-nhan-xoa--desktop-1280.png |
| ST-ds-xac-nhan-xoa | mobile-375 | dark | evidence/design-pass/ST-ds-xac-nhan-xoa--mobile-375.png |
| ST-ds-xoa-hong | desktop-1280 | dark | evidence/design-pass/ST-ds-xoa-hong--desktop-1280.png |
| ST-ds-xoa-hong | mobile-375 | dark | evidence/design-pass/ST-ds-xoa-hong--mobile-375.png |
| ST-ds-xoa-khoa | desktop-1280 | dark | evidence/design-pass/ST-ds-xoa-khoa--desktop-1280.png |
| ST-hop-da-gui | desktop-1280 | dark | evidence/design-pass/ST-hop-da-gui--desktop-1280.png |
| ST-hop-da-gui | mobile-375 | dark | evidence/design-pass/ST-hop-da-gui--mobile-375.png |
| ST-hop-dang-go | desktop-1280 | dark | evidence/design-pass/ST-hop-dang-go--desktop-1280.png |
| ST-hop-dang-go | mobile-375 | dark | evidence/design-pass/ST-hop-dang-go--mobile-375.png |
| ST-hop-loi | desktop-1280 | dark | evidence/design-pass/ST-hop-loi--desktop-1280.png |
| ST-hop-qua-tran | desktop-1280 | dark | evidence/design-pass/ST-hop-qua-tran--desktop-1280.png |
| ST-hop-qua-tran | mobile-375 | dark | evidence/design-pass/ST-hop-qua-tran--mobile-375.png |
| ST-hop-qua-tran-en | desktop-1280 | dark | evidence/design-pass/ST-hop-qua-tran-en--desktop-1280.png |
| ST-hop-trong | desktop-1280 | dark | evidence/design-pass/ST-hop-trong--desktop-1280.png |
| ST-hop-trong | mobile-375 | dark | evidence/design-pass/ST-hop-trong--mobile-375.png |
| ST-truoc-bang | desktop-1280 | dark | evidence/design-pass/ST-truoc-bang--desktop-1280.png |
| ST-truoc-bang | desktop-900 | dark | evidence/design-pass/ST-truoc-bang--desktop-900.png |
| ST-truoc-hop-qua-tran | desktop-1280 | dark | evidence/design-pass/ST-truoc-hop-qua-tran--desktop-1280.png |

## Cảnh ngữ-cảnh

- Bỏ cảnh — xem sổ quyết định «bỏ cảnh ngữ-cảnh — …»: màn đang chạy production, đường vào–ra không đổi so với LT2.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Giờ gửi: bỏ tháng chữ («16 thg 10») về số («09:14 16-10» / «16/10, 09:14») — ngắn, đọc nhanh trong cột hẹp.
- Dòng «Kể đủ hai câu rồi bấm Gửi.» dời lên trên chân hộp thay vì nhét vào chân bằng lớp căn lề — giữ chân hộp đúng
  khuôn, không đè kiểu thành phần chung.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Nút ⋮ trên điện thoại dừng ở 36×36 (`icon-lg`, cỡ lớn nhất bộ chung có); 44×44 cần cỡ nút mới ở `packages/ui` →
  đề xuất gửi về hàng lớp phủ của bộ giao diện chung (TH7).
- Câu trạng thái sau gom do kit viết bằng tiếng Việt, nên ở giao diện tiếng Anh dòng «Đang làm» vẫn mang câu tiếng
  Việt («Đã thành việc …») — thấy rõ ở `ST-ds-en`. Câu thuộc kit; vòng này không đổi. Đề xuất báo phiên điều phối
  chuyển sang kho kit.
- U9 — lớp phủ hộp thoại ở nền tối đen đặc (thấy ở mọi ảnh hộp): bộ giao diện chung, ngoài vòng.
