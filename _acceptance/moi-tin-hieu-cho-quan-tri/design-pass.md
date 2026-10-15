---
slug: moi-tin-hieu-cho-quan-tri
at: 2026-10-14T03:14:01Z
route: http://localhost:3480/proto/moi-tin-hieu-cho-quan-tri
material: real-components
context: standalone
context_scenes: []
reaction: nac-1 (ghim — ảnh ma trận đính kèm lời mời Cổng Phạm vi; người phản ứng bằng câu trả lời cổng)
options:
divergence: skipped — thẻ con, ô số tổng quan và bảng lọc đều theo nếp màn có sẵn của docs/design.md (Toàn cảnh OKR, Lộ trình); hai chỗ còn mở là quyền và chỗ lọc, đã thành câu hỏi trong sổ quyết định
ds_skill: web-design-guidelines
states: [ST-cua-toi-quan-tri, ST-hop-bao-truoc, ST-tat-ca-co, ST-tat-ca-dang-tai, ST-tat-ca-khong-ban-ve, ST-tat-ca-khong-quyen, ST-tat-ca-loc, ST-tat-ca-loc-rong, ST-tat-ca-loi, ST-tat-ca-rong, ST-tat-ca-thieu]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 4
deferred: 2
---
# design-pass — moi-tin-hieu-cho-quan-tri

Bản mẫu ghép từ đúng các mảnh sẽ chạy thật (`apps/app/components/tin-hieu/thanh-the-tin-hieu.tsx`,
`ba-so-tin-hieu.tsx`, `bang-tat-ca.tsx`), dữ liệu giả trong
`apps/app/app/proto/_modules/moi-tin-hieu-cho-quan-tri/du-lieu.ts`. Hai trạng thái lọc chụp từ `ST-tat-ca-co`
kèm tham số lọc trên đường dẫn (`&phongBan=pb-kd`; `&phongBan=pb-kt&trangThaiTinHieu=cho-lay-ve`). Chụp bằng
puppeteer, gỡ nút nổi của bản dev; mỗi lượt chụp đếm lỗi trang (0) và tràn ngang (0).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-cua-toi-quan-tri | desktop-1280 | dark | evidence/design-pass/ST-cua-toi-quan-tri--desktop-1280--dark.png |
| ST-cua-toi-quan-tri | desktop-1280 | light | evidence/design-pass/ST-cua-toi-quan-tri--desktop-1280.png |
| ST-cua-toi-quan-tri | mobile-375 | dark | evidence/design-pass/ST-cua-toi-quan-tri--mobile-375--dark.png |
| ST-cua-toi-quan-tri | mobile-375 | light | evidence/design-pass/ST-cua-toi-quan-tri--mobile-375.png |
| ST-hop-bao-truoc | desktop-1280 | dark | evidence/design-pass/ST-hop-bao-truoc--desktop-1280--dark.png |
| ST-hop-bao-truoc | desktop-1280 | light | evidence/design-pass/ST-hop-bao-truoc--desktop-1280.png |
| ST-hop-bao-truoc | mobile-375 | dark | evidence/design-pass/ST-hop-bao-truoc--mobile-375--dark.png |
| ST-hop-bao-truoc | mobile-375 | light | evidence/design-pass/ST-hop-bao-truoc--mobile-375.png |
| ST-tat-ca-co | desktop-1280 | dark | evidence/design-pass/ST-tat-ca-co--desktop-1280--dark.png |
| ST-tat-ca-co | desktop-1280 | light | evidence/design-pass/ST-tat-ca-co--desktop-1280.png |
| ST-tat-ca-co | mobile-375 | dark | evidence/design-pass/ST-tat-ca-co--mobile-375--dark.png |
| ST-tat-ca-co | mobile-375 | light | evidence/design-pass/ST-tat-ca-co--mobile-375.png |
| ST-tat-ca-dang-tai | desktop-1280 | dark | evidence/design-pass/ST-tat-ca-dang-tai--desktop-1280--dark.png |
| ST-tat-ca-dang-tai | desktop-1280 | light | evidence/design-pass/ST-tat-ca-dang-tai--desktop-1280.png |
| ST-tat-ca-dang-tai | mobile-375 | dark | evidence/design-pass/ST-tat-ca-dang-tai--mobile-375--dark.png |
| ST-tat-ca-dang-tai | mobile-375 | light | evidence/design-pass/ST-tat-ca-dang-tai--mobile-375.png |
| ST-tat-ca-khong-ban-ve | desktop-1280 | dark | evidence/design-pass/ST-tat-ca-khong-ban-ve--desktop-1280--dark.png |
| ST-tat-ca-khong-ban-ve | desktop-1280 | light | evidence/design-pass/ST-tat-ca-khong-ban-ve--desktop-1280.png |
| ST-tat-ca-khong-ban-ve | mobile-375 | dark | evidence/design-pass/ST-tat-ca-khong-ban-ve--mobile-375--dark.png |
| ST-tat-ca-khong-ban-ve | mobile-375 | light | evidence/design-pass/ST-tat-ca-khong-ban-ve--mobile-375.png |
| ST-tat-ca-khong-quyen | desktop-1280 | dark | evidence/design-pass/ST-tat-ca-khong-quyen--desktop-1280--dark.png |
| ST-tat-ca-khong-quyen | desktop-1280 | light | evidence/design-pass/ST-tat-ca-khong-quyen--desktop-1280.png |
| ST-tat-ca-khong-quyen | mobile-375 | dark | evidence/design-pass/ST-tat-ca-khong-quyen--mobile-375--dark.png |
| ST-tat-ca-khong-quyen | mobile-375 | light | evidence/design-pass/ST-tat-ca-khong-quyen--mobile-375.png |
| ST-tat-ca-loc | desktop-1280 | dark | evidence/design-pass/ST-tat-ca-loc--desktop-1280--dark.png |
| ST-tat-ca-loc | desktop-1280 | light | evidence/design-pass/ST-tat-ca-loc--desktop-1280.png |
| ST-tat-ca-loc | mobile-375 | dark | evidence/design-pass/ST-tat-ca-loc--mobile-375--dark.png |
| ST-tat-ca-loc | mobile-375 | light | evidence/design-pass/ST-tat-ca-loc--mobile-375.png |
| ST-tat-ca-loc-rong | desktop-1280 | dark | evidence/design-pass/ST-tat-ca-loc-rong--desktop-1280--dark.png |
| ST-tat-ca-loc-rong | desktop-1280 | light | evidence/design-pass/ST-tat-ca-loc-rong--desktop-1280.png |
| ST-tat-ca-loc-rong | mobile-375 | dark | evidence/design-pass/ST-tat-ca-loc-rong--mobile-375--dark.png |
| ST-tat-ca-loc-rong | mobile-375 | light | evidence/design-pass/ST-tat-ca-loc-rong--mobile-375.png |
| ST-tat-ca-loi | desktop-1280 | dark | evidence/design-pass/ST-tat-ca-loi--desktop-1280--dark.png |
| ST-tat-ca-loi | desktop-1280 | light | evidence/design-pass/ST-tat-ca-loi--desktop-1280.png |
| ST-tat-ca-loi | mobile-375 | dark | evidence/design-pass/ST-tat-ca-loi--mobile-375--dark.png |
| ST-tat-ca-loi | mobile-375 | light | evidence/design-pass/ST-tat-ca-loi--mobile-375.png |
| ST-tat-ca-rong | desktop-1280 | dark | evidence/design-pass/ST-tat-ca-rong--desktop-1280--dark.png |
| ST-tat-ca-rong | desktop-1280 | light | evidence/design-pass/ST-tat-ca-rong--desktop-1280.png |
| ST-tat-ca-rong | mobile-375 | dark | evidence/design-pass/ST-tat-ca-rong--mobile-375--dark.png |
| ST-tat-ca-rong | mobile-375 | light | evidence/design-pass/ST-tat-ca-rong--mobile-375.png |
| ST-tat-ca-thieu | desktop-1280 | dark | evidence/design-pass/ST-tat-ca-thieu--desktop-1280--dark.png |
| ST-tat-ca-thieu | desktop-1280 | light | evidence/design-pass/ST-tat-ca-thieu--desktop-1280.png |
| ST-tat-ca-thieu | mobile-375 | dark | evidence/design-pass/ST-tat-ca-thieu--mobile-375--dark.png |
| ST-tat-ca-thieu | mobile-375 | light | evidence/design-pass/ST-tat-ca-thieu--mobile-375.png |

## Cảnh ngữ-cảnh

- Bỏ cảnh — xem dòng sổ quyết định bắt đầu «bỏ cảnh ngữ-cảnh — ».

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Cột «Điều đã kể» bị ép còn ~40 px ở 1280: gộp «Màn» vào dòng phụ của cột «Gửi lúc», thu bề rộng các cột phụ — cột chính rộng ~230 px.
- Nhãn trạng thái bị cắt ở 375: câu trạng thái ẩn dưới `md` (nhãn ngắn có chấm vẫn hiện), mã tín hiệu ẩn dưới `sm`.
- Khoá lọc «trangThai» đã thuộc màn khác (bộ canh khoá đường dẫn của kho ném lỗi khi dựng trang): đổi thành «trangThaiTinHieu».
- Bộ chụp không bắt lỗi dựng trang phía máy chủ (ảnh vẫn ra): thêm đếm lỗi trang vào mỗi lượt chụp.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `DataTable` chưa có kiểu danh sách thẻ dưới `md` (thẻ «Của tôi» dùng `Item` dưới `md`): ở 375 cột «Điều đã kể» vẫn hẹp, nhãn trạng thái dài («Không thành việc», «Đã vào nhóm») bị cắt. Đề xuất: biến thể danh sách thẻ cho `DataTable` trong `packages/ui` — việc riêng (cùng tác động trang Lộ trình), không làm trong vòng này.
- `StatGroup` chia lưới 2/4 cột: ba ô để trống một ô ở 1280 và xếp 2+1 ở 375. Đề xuất: biến thể ba cột cho `StatGroup` — việc riêng; vòng này để nguyên.
