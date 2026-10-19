---
slug: go-tin-hieu-rac
at: 2026-10-19T13:53:03Z
route: http://localhost:3302/proto/go-tin-hieu-rac
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (ghim — ảnh ma trận đính kèm lời mời Cổng Phạm vi; người phản ứng bằng câu trả lời cổng)
options:
divergence: skipped — menu thao tác dòng, nút «Đã lưu trữ» trên thanh công cụ và toast Hoàn tác đều theo nếp có sẵn (bảng Công ty, docs/vong-doi.md); NGÀNH Productboard trùng khuôn; chỗ còn mở duy nhất là trang người gửi, đã thành Hỏi-1 trong sổ quyết định
ds_skill: web-design-guidelines
states: [ST-cua-toi-da-luu-tru, ST-da-luu-tru-co, ST-da-luu-tru-loc-mo, ST-da-luu-tru-rong, ST-tat-ca-co-menu, ST-tat-ca-da-lay-ve, ST-tat-ca-loc-mo, ST-tat-ca-luu-tru-loi, ST-tat-ca-vua-luu-tru]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 2
deferred: 2
---
# design-pass — go-tin-hieu-rac

Bản mẫu ghép từ đúng các mảnh sẽ chạy thật (`apps/app/components/tin-hieu/bang-tat-ca.tsx`, `menu-luu-tru.tsx`,
`danh-sach-tin-hieu.tsx`, `ba-so-tin-hieu.tsx`, `thanh-the-tin-hieu.tsx`) trong khung trang thật (`PageShell`, thanh thẻ
«Của tôi · Tất cả», ba ô số) — thiếu thanh bên của ứng dụng nên khai `static-frame`. Dữ liệu giả trong
`apps/app/app/proto/_modules/go-tin-hieu-rac/du-lieu.ts` (dùng lại bộ dòng của TH4). Bản mẫu bấm được: «Lưu trữ» rời dòng
và hiện toast Hoàn tác thật (`baoDaLuuTru`), «Khôi phục» đưa dòng về; trạng thái `ST-tat-ca-luu-tru-loi` cho lệnh lưu
trữ hỏng. Chụp bằng puppeteer: `ST-tat-ca-da-lay-ve` là `ST-tat-ca-co-menu` mở menu dòng đã lấy về; hai dạng
«Đã lưu trữ» chụp kèm `&archived=true`; `*-loc-mo` là 375 với nhóm Lọc mở. Mỗi ảnh đếm lỗi trang (0) và tràn ngang (0).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-cua-toi-da-luu-tru | desktop-1280 | dark | evidence/design-pass/ST-cua-toi-da-luu-tru--desktop-1280--dark.png |
| ST-cua-toi-da-luu-tru | desktop-1280 | light | evidence/design-pass/ST-cua-toi-da-luu-tru--desktop-1280.png |
| ST-cua-toi-da-luu-tru | mobile-375 | dark | evidence/design-pass/ST-cua-toi-da-luu-tru--mobile-375--dark.png |
| ST-cua-toi-da-luu-tru | mobile-375 | light | evidence/design-pass/ST-cua-toi-da-luu-tru--mobile-375.png |
| ST-da-luu-tru-co | desktop-1280 | dark | evidence/design-pass/ST-da-luu-tru-co--desktop-1280--dark.png |
| ST-da-luu-tru-co | desktop-1280 | light | evidence/design-pass/ST-da-luu-tru-co--desktop-1280.png |
| ST-da-luu-tru-co | mobile-375 | dark | evidence/design-pass/ST-da-luu-tru-co--mobile-375--dark.png |
| ST-da-luu-tru-co | mobile-375 | light | evidence/design-pass/ST-da-luu-tru-co--mobile-375.png |
| ST-da-luu-tru-loc-mo | mobile-375 | light | evidence/design-pass/ST-da-luu-tru-loc-mo--mobile-375.png |
| ST-da-luu-tru-rong | desktop-1280 | dark | evidence/design-pass/ST-da-luu-tru-rong--desktop-1280--dark.png |
| ST-da-luu-tru-rong | desktop-1280 | light | evidence/design-pass/ST-da-luu-tru-rong--desktop-1280.png |
| ST-da-luu-tru-rong | mobile-375 | dark | evidence/design-pass/ST-da-luu-tru-rong--mobile-375--dark.png |
| ST-da-luu-tru-rong | mobile-375 | light | evidence/design-pass/ST-da-luu-tru-rong--mobile-375.png |
| ST-tat-ca-co-menu | desktop-1280 | dark | evidence/design-pass/ST-tat-ca-co-menu--desktop-1280--dark.png |
| ST-tat-ca-co-menu | desktop-1280 | light | evidence/design-pass/ST-tat-ca-co-menu--desktop-1280.png |
| ST-tat-ca-co-menu | mobile-375 | dark | evidence/design-pass/ST-tat-ca-co-menu--mobile-375--dark.png |
| ST-tat-ca-co-menu | mobile-375 | light | evidence/design-pass/ST-tat-ca-co-menu--mobile-375.png |
| ST-tat-ca-da-lay-ve | desktop-1280 | dark | evidence/design-pass/ST-tat-ca-da-lay-ve--desktop-1280--dark.png |
| ST-tat-ca-da-lay-ve | desktop-1280 | light | evidence/design-pass/ST-tat-ca-da-lay-ve--desktop-1280.png |
| ST-tat-ca-da-lay-ve | mobile-375 | dark | evidence/design-pass/ST-tat-ca-da-lay-ve--mobile-375--dark.png |
| ST-tat-ca-da-lay-ve | mobile-375 | light | evidence/design-pass/ST-tat-ca-da-lay-ve--mobile-375.png |
| ST-tat-ca-loc-mo | mobile-375 | light | evidence/design-pass/ST-tat-ca-loc-mo--mobile-375.png |
| ST-tat-ca-luu-tru-loi | desktop-1280 | dark | evidence/design-pass/ST-tat-ca-luu-tru-loi--desktop-1280--dark.png |
| ST-tat-ca-luu-tru-loi | desktop-1280 | light | evidence/design-pass/ST-tat-ca-luu-tru-loi--desktop-1280.png |
| ST-tat-ca-luu-tru-loi | mobile-375 | dark | evidence/design-pass/ST-tat-ca-luu-tru-loi--mobile-375--dark.png |
| ST-tat-ca-luu-tru-loi | mobile-375 | light | evidence/design-pass/ST-tat-ca-luu-tru-loi--mobile-375.png |
| ST-tat-ca-vua-luu-tru | desktop-1280 | dark | evidence/design-pass/ST-tat-ca-vua-luu-tru--desktop-1280--dark.png |
| ST-tat-ca-vua-luu-tru | desktop-1280 | light | evidence/design-pass/ST-tat-ca-vua-luu-tru--desktop-1280.png |
| ST-tat-ca-vua-luu-tru | mobile-375 | dark | evidence/design-pass/ST-tat-ca-vua-luu-tru--mobile-375--dark.png |
| ST-tat-ca-vua-luu-tru | mobile-375 | light | evidence/design-pass/ST-tat-ca-vua-luu-tru--mobile-375.png |

## Cảnh ngữ-cảnh

- Không cần cảnh riêng: bản mẫu đã nằm trong khung trang thật của «Mọi tín hiệu» (tiêu đề, thanh thẻ, ba ô số); đường
  vào–ra của người dùng là thanh thẻ «Của tôi · Tất cả» có sẵn từ TH4.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Dạng «Đã lưu trữ» thay cột «Trạng thái» bằng «Lưu trữ lúc» và «Người lưu trữ»: mọi tín hiệu ở đó đều «Chờ lấy về»
  nên cột trạng thái chỉ lặp một câu.
- Bỏ `className` tự đặt trên nút «Đã lưu trữ» (bảng Công ty có `justify-start sm:justify-center`) — luật «không
  className trên component @crm/ui» của `docs/design.md`.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Trên điện thoại, nút «Đã lưu trữ» nằm trong nhóm «Lọc» gập của `DataTable` (như bảng Công ty) — tới được sau một chạm
  «Lọc», không thấy ngay. Đề xuất: giữ như mọi bảng; nếu muốn đưa ra ngoài thì là việc của `DataTable` cho mọi bảng.
- Nút thanh công cụ do trang thêm vào (`actions`) căn giữa trên điện thoại trong khi «Cột» căn trái, vì `DataTable`
  chưa có biến thể cho nút thanh công cụ và bảng Công ty lách bằng `className`. Đề xuất: thêm biến thể trong
  `packages/ui` ở một vòng riêng; vòng này chấp nhận lệch căn.
