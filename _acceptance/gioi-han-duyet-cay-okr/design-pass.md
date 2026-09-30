---
slug: gioi-han-duyet-cay-okr
at: 2026-09-29T01:26:13Z
route: http://localhost:3217/proto/gioi-han-duyet-cay-okr
material: real-components
context: static-frame
context_scenes: [evidence/design-pass/ST-duyet-cho-nguoi-duyet--desktop-1440.png, evidence/design-pass/ST-duyet-cho-nguoi-duyet--mobile-390.png]
reaction: nac-1 (anh-gui-kem-the-cong)
options:
divergence: skipped — ba luật gắn vào màn có sẵn (khung mục tiêu, Tổ chức, Chương trình OKR, Sức khoẻ); các cách đã so ở thiết kế mục 2, người veto ở Cổng Phạm vi
ds_skill: web-design-guidelines
states: [ST-chuongtrinh-duyet, ST-chuongtrinh-khong-quyen, ST-chuyen-hop, ST-chuyen-loi, ST-duyet-bi-tra-lai, ST-duyet-cho-nguoi-duyet, ST-duyet-cho-nguoi-gui, ST-duyet-tra-lai-hop, ST-duyet-viec-cua-toi, ST-hienthi-con-can-chinh, ST-hienthi-hop, ST-khung-gioi-han, ST-khung-khong-thay, ST-mocoi-co, ST-mocoi-dang-tai, ST-mocoi-loi, ST-mocoi-rong, ST-tochuc-luu-tru-chan, ST-tochuc-okr-mo]
breakpoints: [mobile-390, desktop-1440]
themes: [light, dark]
patched: 4
deferred: 3
---
# design-pass — gioi-han-duyet-cay-okr

Bản mẫu `/proto/gioi-han-duyet-cay-okr`, 19 trạng thái, dựng bằng thành phần thật của
`packages/ui` với dữ liệu giả của công ty mẫu «Hải Đăng Logistics». Màn khung mục tiêu, việc của
tôi và Sức khoẻ nằm trong khung ứng dụng tĩnh của bản mẫu OKR (`KhungUngDung`); Chương trình OKR
và Tổ chức là trang Cài đặt tràn ngang như 8a. Không đường ghi. Chụp ở 1440 và 390, sáng; bốn
trạng thái chính chụp thêm tối — 46 ảnh. Không trạng thái nào tràn ngang ở 390. Mặc định là KHÔNG ĐỒNG BỘ: máy dựng bản mẫu, tự chụp ma trận trạng thái × khổ, gửi gói rồi đi làm việc khác; nac-3 (ngồi cùng) chỉ mở khi có người gọi tên nó.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-chuongtrinh-duyet | desktop-1440 | light | evidence/design-pass/ST-chuongtrinh-duyet--desktop-1440.png |
| ST-chuongtrinh-duyet | mobile-390 | light | evidence/design-pass/ST-chuongtrinh-duyet--mobile-390.png |
| ST-chuongtrinh-khong-quyen | desktop-1440 | light | evidence/design-pass/ST-chuongtrinh-khong-quyen--desktop-1440.png |
| ST-chuongtrinh-khong-quyen | mobile-390 | light | evidence/design-pass/ST-chuongtrinh-khong-quyen--mobile-390.png |
| ST-chuyen-hop | desktop-1440 | dark | evidence/design-pass/ST-chuyen-hop--desktop-1440--dark.png |
| ST-chuyen-hop | desktop-1440 | light | evidence/design-pass/ST-chuyen-hop--desktop-1440.png |
| ST-chuyen-hop | mobile-390 | dark | evidence/design-pass/ST-chuyen-hop--mobile-390--dark.png |
| ST-chuyen-hop | mobile-390 | light | evidence/design-pass/ST-chuyen-hop--mobile-390.png |
| ST-chuyen-loi | desktop-1440 | light | evidence/design-pass/ST-chuyen-loi--desktop-1440.png |
| ST-chuyen-loi | mobile-390 | light | evidence/design-pass/ST-chuyen-loi--mobile-390.png |
| ST-duyet-bi-tra-lai | desktop-1440 | light | evidence/design-pass/ST-duyet-bi-tra-lai--desktop-1440.png |
| ST-duyet-bi-tra-lai | mobile-390 | light | evidence/design-pass/ST-duyet-bi-tra-lai--mobile-390.png |
| ST-duyet-cho-nguoi-duyet | desktop-1440 | dark | evidence/design-pass/ST-duyet-cho-nguoi-duyet--desktop-1440--dark.png |
| ST-duyet-cho-nguoi-duyet | desktop-1440 | light | evidence/design-pass/ST-duyet-cho-nguoi-duyet--desktop-1440.png |
| ST-duyet-cho-nguoi-duyet | mobile-390 | dark | evidence/design-pass/ST-duyet-cho-nguoi-duyet--mobile-390--dark.png |
| ST-duyet-cho-nguoi-duyet | mobile-390 | light | evidence/design-pass/ST-duyet-cho-nguoi-duyet--mobile-390.png |
| ST-duyet-cho-nguoi-gui | desktop-1440 | light | evidence/design-pass/ST-duyet-cho-nguoi-gui--desktop-1440.png |
| ST-duyet-cho-nguoi-gui | mobile-390 | light | evidence/design-pass/ST-duyet-cho-nguoi-gui--mobile-390.png |
| ST-duyet-tra-lai-hop | desktop-1440 | light | evidence/design-pass/ST-duyet-tra-lai-hop--desktop-1440.png |
| ST-duyet-tra-lai-hop | mobile-390 | light | evidence/design-pass/ST-duyet-tra-lai-hop--mobile-390.png |
| ST-duyet-viec-cua-toi | desktop-1440 | light | evidence/design-pass/ST-duyet-viec-cua-toi--desktop-1440.png |
| ST-duyet-viec-cua-toi | mobile-390 | light | evidence/design-pass/ST-duyet-viec-cua-toi--mobile-390.png |
| ST-hienthi-con-can-chinh | desktop-1440 | light | evidence/design-pass/ST-hienthi-con-can-chinh--desktop-1440.png |
| ST-hienthi-con-can-chinh | mobile-390 | light | evidence/design-pass/ST-hienthi-con-can-chinh--mobile-390.png |
| ST-hienthi-hop | desktop-1440 | light | evidence/design-pass/ST-hienthi-hop--desktop-1440.png |
| ST-hienthi-hop | mobile-390 | light | evidence/design-pass/ST-hienthi-hop--mobile-390.png |
| ST-khung-gioi-han | desktop-1440 | dark | evidence/design-pass/ST-khung-gioi-han--desktop-1440--dark.png |
| ST-khung-gioi-han | desktop-1440 | light | evidence/design-pass/ST-khung-gioi-han--desktop-1440.png |
| ST-khung-gioi-han | mobile-390 | dark | evidence/design-pass/ST-khung-gioi-han--mobile-390--dark.png |
| ST-khung-gioi-han | mobile-390 | light | evidence/design-pass/ST-khung-gioi-han--mobile-390.png |
| ST-khung-khong-thay | desktop-1440 | light | evidence/design-pass/ST-khung-khong-thay--desktop-1440.png |
| ST-khung-khong-thay | mobile-390 | light | evidence/design-pass/ST-khung-khong-thay--mobile-390.png |
| ST-mocoi-co | desktop-1440 | dark | evidence/design-pass/ST-mocoi-co--desktop-1440--dark.png |
| ST-mocoi-co | desktop-1440 | light | evidence/design-pass/ST-mocoi-co--desktop-1440.png |
| ST-mocoi-co | mobile-390 | dark | evidence/design-pass/ST-mocoi-co--mobile-390--dark.png |
| ST-mocoi-co | mobile-390 | light | evidence/design-pass/ST-mocoi-co--mobile-390.png |
| ST-mocoi-dang-tai | desktop-1440 | light | evidence/design-pass/ST-mocoi-dang-tai--desktop-1440.png |
| ST-mocoi-dang-tai | mobile-390 | light | evidence/design-pass/ST-mocoi-dang-tai--mobile-390.png |
| ST-mocoi-loi | desktop-1440 | light | evidence/design-pass/ST-mocoi-loi--desktop-1440.png |
| ST-mocoi-loi | mobile-390 | light | evidence/design-pass/ST-mocoi-loi--mobile-390.png |
| ST-mocoi-rong | desktop-1440 | light | evidence/design-pass/ST-mocoi-rong--desktop-1440.png |
| ST-mocoi-rong | mobile-390 | light | evidence/design-pass/ST-mocoi-rong--mobile-390.png |
| ST-tochuc-luu-tru-chan | desktop-1440 | light | evidence/design-pass/ST-tochuc-luu-tru-chan--desktop-1440.png |
| ST-tochuc-luu-tru-chan | mobile-390 | light | evidence/design-pass/ST-tochuc-luu-tru-chan--mobile-390.png |
| ST-tochuc-okr-mo | desktop-1440 | light | evidence/design-pass/ST-tochuc-okr-mo--desktop-1440.png |
| ST-tochuc-okr-mo | mobile-390 | light | evidence/design-pass/ST-tochuc-okr-mo--mobile-390.png |

## Cảnh ngữ-cảnh

- evidence/design-pass/ST-duyet-cho-nguoi-duyet--desktop-1440.png và --mobile-390.png — trưởng bộ phận mở khung mục tiêu đang chờ duyệt trong khu «Theo đơn vị» (vào: «Việc OKR của tôi» › «Chờ bạn duyệt»; ra: «Duyệt và công bố» hoặc hộp «Trả lại…»). Ở 390 hai nút của dải xếp dọc, rộng hết dải.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Ngày in bằng `Intl.DateTimeFormat("vi-VN", { day, month })` ra «29-09», không phải «29/09» như bảng trạng thái → ghép ngày/tháng từ `formatToParts`; mọi ngày trong dữ liệu mẫu (gửi duyệt, trả lại, lưu trữ, người rời) đi qua cùng một hàm, không còn ngày gõ tay.
- Dòng «Luôn thấy: …» của hộp mức hiển thị dựng bằng `Item` muted: chữ to hơn chữ hộp thoại và bị cắt hai dòng ở 390 → đổi thành `FieldDescription` một câu, đúng «dòng» của bảng trạng thái.
- Chi tiết phòng ban ở Tổ chức có khối «Trưởng phòng ban» riêng lặp lại người đã mang nhãn trưởng trong danh sách người, chữ tên to hơn nhãn → bỏ khối lặp, giữ nhãn «Trưởng phòng ban» trên dòng người.
- Mô tả từng OKR mồ côi dài quá hai dòng ở 390 và bị `ItemDescription` cắt mất ngày → rút gọn câu chi tiết («lưu trữ ngày 12/09», «chưa có trưởng ở cả hai cấp», «Lâm Gia Phúc rời ngày 20/09»).

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `DialogContent` không có biến thể toàn màn ở khổ nhỏ; thiết kế mục 4 đòi «Khổ 390: hộp thoại toàn màn». Ba hộp (mức hiển thị, trả lại, chuyển OKR) hiện là hộp nổi cách mép 16px. Đề xuất: thêm biến thể toàn màn dưới `sm` trong `packages/ui` (hoặc dùng khung `ResponsiveSheet` sẵn có của app), quyết ở Cổng Phạm vi — không tự vá bằng `className`.
- `Item` giữ cỡ chữ `text-sm` khi nằm trong `Dialog` (`text-xs`): danh sách mục tiêu của hộp chuyển OKR có chữ to hơn tiêu đề và mô tả của chính hộp. Đề xuất: `Item` theo cỡ chữ của bề mặt chứa nó, sửa trong `packages/ui`.
- `CardDescription` ẩn dưới `sm` (`hidden sm:block`): ở 390, câu «Chỉ quản trị thấy khối này» của khối OKR mồ côi và dòng «đơn vị · kỳ · người phụ trách» của khung mục tiêu biến mất. Chấp nhận được nếu là chủ ý của hệ thống; nêu để người duyệt biết chữ nào không tới được điện thoại.

Ghi chú không phải finding: chân hộp thoại ở 390 xếp nút chính trên «Huỷ» — hành vi sẵn có của `DialogFooter`, giống mọi hộp khác trong app.
