---
slug: bam-kr-mo-chi-tiet-kr
at: 2026-10-24T06:18:17Z
route: http://localhost:3312/proto/bam-kr-mo-chi-tiet-kr
material: real-components
context: static-frame
context_scenes: []
reaction: nac-2 (gui-anh-va-link-ban-mau)
options:
divergence: skipped — khuôn có sẵn: luật 2 của chủ kho chốt đích của cú bấm (chi tiết KR), thành phần đều có ở packages/ui (Button link, Sheet, Dialog, TreeNav); chỗ chọn còn mở đã nằm ở Hỏi-1, Hỏi-2
ds_skill: web-design-guidelines
states: [ST-bkr-cua-toi, ST-bkr-so-do, ST-bkr-ngan-muc-tieu, ST-bkr-ngan-kr, ST-bkr-hop-cap-nhat, ST-bkr-hom-nay, ST-bkr-chu]
breakpoints: [mobile-375, desktop-1440]
themes: [light, dark]
patched: 1
deferred: 1
---
# design-pass — bam-kr-mo-chi-tiet-kr

Chủ kho đặt luật 24/10 ~06:20Z: «Lưu ý là phải bổ sung proto (nếu có) ở mỗi vòng, vì hiện nay giờ khá nhiều dữ liệu nên,
tôi muốn xác nhận kỹ trước khi làm nhé.» Bản mẫu `/proto/bam-kr-mo-chi-tiet-kr` dựng bằng thành phần thật của `packages/ui`
(AreaSidebar, PageShell, SimpleTable, Item, TreeNav, Sheet, Dialog, Tabs) trong khung tĩnh của khu Mục tiêu. Dữ liệu giả, không
tRPC: ba mục tiêu, sáu KR, ba việc OKR, lịch sử cập nhật. Bấm được: bốn chỗ bấm KR mở chi tiết KR, tên KR trong chi tiết mục
tiêu mở chi tiết KR chồng lên (nút quay về mục tiêu ở đầu), chi tiết KR › «Cập nhật» mở hộp cập nhật một KR tiêu đề «Cập nhật».
«Hôm nay» là màn onehub `09d7d1dcf` để so trước và sau. «Chữ» là bảng cặp chữ cũ → mới.

Chạy: cấu hình `proto-sv6` (cổng 3312, `PROTO_ROUTE=1`) cùng `api-sv6` (3311) để có phiên đăng nhập; ảnh chụp bằng
`.acceptance-runs/bam-kr-mo-chi-tiet-kr/chup-design-pass.mjs` (puppeteer-core, Chrome của máy).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| chu | desktop-1440 | dark | evidence/design-pass/chu--desktop-1440--dark.png |
| chu | desktop-1440 | light | evidence/design-pass/chu--desktop-1440--light.png |
| chu | mobile-375 | dark | evidence/design-pass/chu--mobile-375--dark.png |
| chu | mobile-375 | light | evidence/design-pass/chu--mobile-375--light.png |
| cua-toi | desktop-1440 | dark | evidence/design-pass/cua-toi--desktop-1440--dark.png |
| cua-toi | desktop-1440 | light | evidence/design-pass/cua-toi--desktop-1440--light.png |
| cua-toi | mobile-375 | dark | evidence/design-pass/cua-toi--mobile-375--dark.png |
| cua-toi | mobile-375 | light | evidence/design-pass/cua-toi--mobile-375--light.png |
| hom-nay | desktop-1440 | dark | evidence/design-pass/hom-nay--desktop-1440--dark.png |
| hom-nay | desktop-1440 | light | evidence/design-pass/hom-nay--desktop-1440--light.png |
| hom-nay | mobile-375 | dark | evidence/design-pass/hom-nay--mobile-375--dark.png |
| hom-nay | mobile-375 | light | evidence/design-pass/hom-nay--mobile-375--light.png |
| hop-cap-nhat | desktop-1440 | dark | evidence/design-pass/hop-cap-nhat--desktop-1440--dark.png |
| hop-cap-nhat | desktop-1440 | light | evidence/design-pass/hop-cap-nhat--desktop-1440--light.png |
| hop-cap-nhat | mobile-375 | dark | evidence/design-pass/hop-cap-nhat--mobile-375--dark.png |
| hop-cap-nhat | mobile-375 | light | evidence/design-pass/hop-cap-nhat--mobile-375--light.png |
| ngan-kr | desktop-1440 | dark | evidence/design-pass/ngan-kr--desktop-1440--dark.png |
| ngan-kr | desktop-1440 | light | evidence/design-pass/ngan-kr--desktop-1440--light.png |
| ngan-kr | mobile-375 | dark | evidence/design-pass/ngan-kr--mobile-375--dark.png |
| ngan-kr | mobile-375 | light | evidence/design-pass/ngan-kr--mobile-375--light.png |
| ngan-kr-chong | desktop-1440 | dark | evidence/design-pass/ngan-kr-chong--desktop-1440--dark.png |
| ngan-kr-chong | desktop-1440 | light | evidence/design-pass/ngan-kr-chong--desktop-1440--light.png |
| ngan-kr-chong | mobile-375 | dark | evidence/design-pass/ngan-kr-chong--mobile-375--dark.png |
| ngan-kr-chong | mobile-375 | light | evidence/design-pass/ngan-kr-chong--mobile-375--light.png |
| ngan-muc-tieu | desktop-1440 | dark | evidence/design-pass/ngan-muc-tieu--desktop-1440--dark.png |
| ngan-muc-tieu | desktop-1440 | light | evidence/design-pass/ngan-muc-tieu--desktop-1440--light.png |
| ngan-muc-tieu | mobile-375 | dark | evidence/design-pass/ngan-muc-tieu--mobile-375--dark.png |
| ngan-muc-tieu | mobile-375 | light | evidence/design-pass/ngan-muc-tieu--mobile-375--light.png |
| so-do | desktop-1440 | dark | evidence/design-pass/so-do--desktop-1440--dark.png |
| so-do | desktop-1440 | light | evidence/design-pass/so-do--desktop-1440--light.png |
| so-do | mobile-375 | dark | evidence/design-pass/so-do--mobile-375--dark.png |
| so-do | mobile-375 | light | evidence/design-pass/so-do--mobile-375--light.png |

## Cảnh ngữ-cảnh

- Khung tĩnh của khu Mục tiêu (thanh bên Của tôi · Bộ OKR, tiêu đề «Mục tiêu») bọc mọi màn — `context: static-frame`.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Nhãn mức tự tin hiện tiếng Anh vì bản mẫu chưa bọc `LocaleProvider` → bọc `locale="vi"` như bản mẫu HT1.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Ở 375, tiêu đề dài của ngăn (`SheetTitle`) chạy dưới nút đóng ✕ — thuộc `Sheet` của `packages/ui`, có từ trước vòng; đề xuất một hàng riêng chừa chỗ nút đóng.
