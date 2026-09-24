---
slug: cau-truc-to-chuc
at: 2026-09-24T05:16:29Z
route: http://localhost:3710/proto/cau-truc-to-chuc
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (khong-dong-bo-tren-anh)
options:
divergence: skipped — hình cây đã qua Cổng Đáng trên bảy trạng thái và phải giữ nguyên cho phiên OKR «Theo đơn vị»; trạng thái mới là hộp thoại và bảng theo khuôn sẵn của kho (Dialog, Table, Select), không có hai hướng khả dĩ
ds_skill: web-design-guidelines
states: [ST-tochuc-cay, ST-tochuc-chidoc, ST-vitri-theotruong, ST-vitri-ghide, ST-nhap-trong, ST-nhap-xemtruoc, ST-nhap-honghet, ST-dieuphoi-locbophan]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 3
deferred: 2
---
# design-pass — cau-truc-to-chuc

Bản bấm được chạy trong host thật (`apps/app`, sau cờ `PROTO_ROUTE`) ở máy chủ dev của chính worktree này, cổng 3710. Vật liệu thật: `Collapsible`, `DropdownMenu`, `Dialog`, `Table`, `Select`, `Textarea`, `Badge`, `PersonAvatar`, `InputGroup` của `@crm/ui`; không sửa `packages/ui`. Dữ liệu giả, không tRPC. Bảy trạng thái của Cổng Đáng giữ nguyên, tám trạng thái mới ở `man-to-chuc.tsx`. Nạp luật: `web-design-guidelines` (chuẩn DS của kho), `ux-ui-craft`, `docs/design.md`, `docs/proto.md`. Không trạng thái nào tràn ngang ở cả hai khổ.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-dieuphoi-locbophan | desktop-1280 | dark | evidence/design-pass/ST-dieuphoi-locbophan--desktop--dark.png |
| ST-dieuphoi-locbophan | desktop-1280 | light | evidence/design-pass/ST-dieuphoi-locbophan--desktop--light.png |
| ST-dieuphoi-locbophan | mobile-375 | dark | evidence/design-pass/ST-dieuphoi-locbophan--mobile--dark.png |
| ST-dieuphoi-locbophan | mobile-375 | light | evidence/design-pass/ST-dieuphoi-locbophan--mobile--light.png |
| ST-nhap-honghet | desktop-1280 | dark | evidence/design-pass/ST-nhap-honghet--desktop--dark.png |
| ST-nhap-honghet | desktop-1280 | light | evidence/design-pass/ST-nhap-honghet--desktop--light.png |
| ST-nhap-honghet | mobile-375 | dark | evidence/design-pass/ST-nhap-honghet--mobile--dark.png |
| ST-nhap-honghet | mobile-375 | light | evidence/design-pass/ST-nhap-honghet--mobile--light.png |
| ST-nhap-trong | desktop-1280 | dark | evidence/design-pass/ST-nhap-trong--desktop--dark.png |
| ST-nhap-trong | desktop-1280 | light | evidence/design-pass/ST-nhap-trong--desktop--light.png |
| ST-nhap-trong | mobile-375 | dark | evidence/design-pass/ST-nhap-trong--mobile--dark.png |
| ST-nhap-trong | mobile-375 | light | evidence/design-pass/ST-nhap-trong--mobile--light.png |
| ST-nhap-xemtruoc | desktop-1280 | dark | evidence/design-pass/ST-nhap-xemtruoc--desktop--dark.png |
| ST-nhap-xemtruoc | desktop-1280 | light | evidence/design-pass/ST-nhap-xemtruoc--desktop--light.png |
| ST-nhap-xemtruoc | mobile-375 | dark | evidence/design-pass/ST-nhap-xemtruoc--mobile--dark.png |
| ST-nhap-xemtruoc | mobile-375 | light | evidence/design-pass/ST-nhap-xemtruoc--mobile--light.png |
| ST-tochuc-cay | desktop-1280 | dark | evidence/design-pass/ST-tochuc-cay--desktop--dark.png |
| ST-tochuc-cay | desktop-1280 | light | evidence/design-pass/ST-tochuc-cay--desktop--light.png |
| ST-tochuc-cay | mobile-375 | dark | evidence/design-pass/ST-tochuc-cay--mobile--dark.png |
| ST-tochuc-cay | mobile-375 | light | evidence/design-pass/ST-tochuc-cay--mobile--light.png |
| ST-tochuc-chidoc | desktop-1280 | dark | evidence/design-pass/ST-tochuc-chidoc--desktop--dark.png |
| ST-tochuc-chidoc | desktop-1280 | light | evidence/design-pass/ST-tochuc-chidoc--desktop--light.png |
| ST-tochuc-chidoc | mobile-375 | dark | evidence/design-pass/ST-tochuc-chidoc--mobile--dark.png |
| ST-tochuc-chidoc | mobile-375 | light | evidence/design-pass/ST-tochuc-chidoc--mobile--light.png |
| ST-vitri-ghide | desktop-1280 | dark | evidence/design-pass/ST-vitri-ghide--desktop--dark.png |
| ST-vitri-ghide | desktop-1280 | light | evidence/design-pass/ST-vitri-ghide--desktop--light.png |
| ST-vitri-ghide | mobile-375 | dark | evidence/design-pass/ST-vitri-ghide--mobile--dark.png |
| ST-vitri-ghide | mobile-375 | light | evidence/design-pass/ST-vitri-ghide--mobile--light.png |
| ST-vitri-theotruong | desktop-1280 | dark | evidence/design-pass/ST-vitri-theotruong--desktop--dark.png |
| ST-vitri-theotruong | desktop-1280 | light | evidence/design-pass/ST-vitri-theotruong--desktop--light.png |
| ST-vitri-theotruong | mobile-375 | dark | evidence/design-pass/ST-vitri-theotruong--mobile--dark.png |
| ST-vitri-theotruong | mobile-375 | light | evidence/design-pass/ST-vitri-theotruong--mobile--light.png |

## Cảnh ngữ-cảnh

- Không cần: `context: host-embedded` — bản mẫu render trong host thật sau cờ dev.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Câu lỗi của dòng nhập bị cắt trong cột «Kết quả» (ô bảng không xuống dòng) — câu lỗi chuyển thành danh sách «Dòng N: …» ngay trên bảng, cột «Kết quả» chỉ còn «Hợp lệ» / «Hỏng».
- Phòng ban phụ trong hộp thoại vị trí không có đường bỏ — thêm nút «×» có nhãn đọc được cạnh mỗi phòng ban phụ.
- Trưởng bộ phận không thuộc phòng ban nào không hiện ở đâu ngoài dòng trưởng, nên dòng độ phủ đếm lệch (7/9) — đưa người đó vào nhóm «Chưa có phòng ban», dòng độ phủ nay 7/10.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Trưởng bộ phận có cần một phòng ban chính không? Nếu không, họ kéo dòng độ phủ xuống dưới ngưỡng 90% dù cây đã đúng. Đề xuất: có — họ chọn phòng ban mình ngồi; ghi thành giả định trong Coverage của hợp đồng để Cổng Phạm vi gạch.
- `TableCell` của `@crm/ui` không xuống dòng, nên bảng xem trước trên điện thoại phải cuộn ngang trong khung. Chấp nhận cho lượt này (câu lỗi đã ra ngoài bảng); nếu cần bảng xuống dòng thì là một biến thể trong `packages/ui`, không vá ở màn.
