---
slug: cua-toi-chi-liet-kr
at: 2026-10-28T05:20:00Z
route: http://localhost:3312/proto/cua-toi-chi-liet-kr
material: real-components
context: static-frame
context_scenes: []
reaction: nac-2 (gui-anh-va-link-ban-mau)
options:
divergence: skipped — khuôn có sẵn: danh sách Item của docs/design.md, đích «mở trong bộ» theo câu giao và bản mẫu HT1 24/10; hai chỗ chọn còn mở đã thành Hỏi-1, Hỏi-2 trên thẻ
ds_skill: repo-tokens
states: [ST-ctlk-cua-toi, ST-ctlk-mo-kr, ST-ctlk-dong-ngan, ST-ctlk-hop-cap-nhat, ST-ctlk-tin-nhac, ST-ctlk-kr-khong-thay, ST-ctlk-da-du, ST-ctlk-khong-kr, ST-ctlk-dang-tai, ST-ctlk-loi]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 2
deferred: 1
---
# design-pass — cua-toi-chi-liet-kr

Bản mẫu `/proto/cua-toi-chi-liet-kr` dựng bằng thành phần thật của `packages/ui` (AreaSidebar, PageShell, Item,
SectionHeading, Card, Breadcrumb, Tabs gạch chân, SimpleTable, Sheet, Dialog, Field) trong khung tĩnh của khu Mục tiêu.
Dữ liệu giả viết sẵn trong module: 7 KR chờ cập nhật ở 3 bộ (Kinh doanh vùng 1, một khối tên dài, OneHub), tên KR
dài tới hai dòng, một KR chưa cập nhật lần nào. Không tRPC. Chạy: cấu hình `proto-sv1` của `.claude/launch.json`
(cổng 3312, `PROTO_ROUTE=1`). Ảnh chụp bằng `scripts/ui-capture.mjs`.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-ctlk-cua-toi | desktop-1280 / mobile-375 | light / dark | evidence/design-pass/cua-toi--<khổ>--<nền>.png |
| ST-ctlk-mo-kr | desktop-1280 / mobile-375 | light / dark | evidence/design-pass/mo-kr--<khổ>--<nền>.png |
| ST-ctlk-dong-ngan | desktop-1280 / mobile-375 | light / dark | evidence/design-pass/dong-ngan--<khổ>--<nền>.png |
| ST-ctlk-hop-cap-nhat | desktop-1280 / mobile-375 | light / dark | evidence/design-pass/hop-cap-nhat--<khổ>--<nền>.png |
| ST-ctlk-tin-nhac | desktop-1280 / mobile-375 | light / dark | evidence/design-pass/tin-nhac--<khổ>--<nền>.png |
| ST-ctlk-kr-khong-thay | desktop-1280 / mobile-375 | light / dark | evidence/design-pass/kr-khong-thay--<khổ>--<nền>.png |
| ST-ctlk-da-du | desktop-1280 / mobile-375 | light / dark | evidence/design-pass/da-du--<khổ>--<nền>.png |
| ST-ctlk-khong-kr | desktop-1280 / mobile-375 | light / dark | evidence/design-pass/khong-kr--<khổ>--<nền>.png |
| ST-ctlk-dang-tai | desktop-1280 / mobile-375 | light / dark | evidence/design-pass/dang-tai--<khổ>--<nền>.png |
| ST-ctlk-loi | desktop-1280 / mobile-375 | light / dark | evidence/design-pass/loi--<khổ>--<nền>.png |

40 ảnh.

## Cảnh ngữ-cảnh

- Khung tĩnh của khu Mục tiêu bọc vật (thanh bên, đầu trang, dòng vị trí «Bộ OKR › …», thẻ con); hành trình vào–ra
  là chuỗi trạng thái Của tôi → mở KR → hộp cập nhật → đóng ngăn ở bộ, và trạng thái «Tin nhắc 08:30 dẫn tới đâu».

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Ở 375 cột số hiện tại và «lần trước» ép tên KR cắt sau một dòng rưỡi: dưới `sm` đưa số và «lần trước» xuống dòng
  dưới tên, cột phải chỉ còn mũi tên.
- Ngăn KR là `Sheet` có nền phủ, nên ảnh «mở KR» không cho thấy người đang ở trang bộ: thêm trạng thái
  `ST-ctlk-dong-ngan` (đóng ngăn — đứng ở bộ của KR, dòng KR vừa mở được đánh dấu).

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `design_pass.ds_skill` khai `web-design-guidelines` nhưng phiên này không nạp được skill đó; phiên chạy trên từ
  vựng token của kho (`packages/ui`, `docs/design.md`).
