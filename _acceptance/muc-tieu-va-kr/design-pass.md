---
slug: muc-tieu-va-kr
at: 2026-10-01T23:27:00Z
route: http://localhost:3420/proto/muc-tieu-va-kr
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-2 (thao-luan)
options:
divergence: skipped — hướng đã chốt trên vật thật trước vòng (ảnh màn đang chạy của chủ kho → phân tích A–G → proto bấm được, chủ kho duyệt thiết kế 02/10)
ds_skill: web-design-guidelines
states: [ST-cua-toi, ST-theo-don-vi, ST-chi-tiet, ST-chua-co-kr, ST-cham, ST-dang-tai, ST-hien-tai]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 8
deferred: 3
---
# design-pass — muc-tieu-va-kr

Bản mẫu chạy trong app thật sau cờ `PROTO_ROUTE` (máy chủ dev riêng của worktree, cổng
3420), ghép từ thành phần của `packages/ui`; khung trang OKR mượn từ proto `ban-mau-okr`.
Chủ kho đã xem và bấm bản mẫu trong phiên trước khi duyệt thiết kế (nac-2).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-cua-toi | desktop-1280 | light | evidence/design-pass/ST-cua-toi--desktop-1280--light.png |
| ST-cua-toi | desktop-1280 | dark | evidence/design-pass/ST-cua-toi--desktop-1280--dark.png |
| ST-cua-toi | mobile-375 | light | evidence/design-pass/ST-cua-toi--mobile-375--light.png |
| ST-theo-don-vi | desktop-1280 | light | evidence/design-pass/ST-theo-don-vi--desktop-1280--light.png |
| ST-theo-don-vi | desktop-1280 | dark | evidence/design-pass/ST-theo-don-vi--desktop-1280--dark.png |
| ST-theo-don-vi | mobile-375 | light | evidence/design-pass/ST-theo-don-vi--mobile-375--light.png |
| ST-chi-tiet | desktop-1280 | light | evidence/design-pass/ST-chi-tiet--desktop-1280--light.png |
| ST-chi-tiet | desktop-1280 | dark | evidence/design-pass/ST-chi-tiet--desktop-1280--dark.png |
| ST-chi-tiet | mobile-375 | light | evidence/design-pass/ST-chi-tiet--mobile-375--light.png |
| ST-chua-co-kr | desktop-1280 | light | evidence/design-pass/ST-chua-co-kr--desktop-1280--light.png |
| ST-chua-co-kr | desktop-1280 | dark | evidence/design-pass/ST-chua-co-kr--desktop-1280--dark.png |
| ST-cham | desktop-1280 | light | evidence/design-pass/ST-cham--desktop-1280--light.png |
| ST-cham | desktop-1280 | dark | evidence/design-pass/ST-cham--desktop-1280--dark.png |
| ST-cham | mobile-375 | light | evidence/design-pass/ST-cham--mobile-375--light.png |
| ST-dang-tai | desktop-1280 | light | evidence/design-pass/ST-dang-tai--desktop-1280--light.png |
| ST-dang-tai | desktop-1280 | dark | evidence/design-pass/ST-dang-tai--desktop-1280--dark.png |
| ST-hien-tai | desktop-1280 | light | evidence/design-pass/ST-hien-tai--desktop-1280--light.png |
| ST-hien-tai | desktop-1280 | dark | evidence/design-pass/ST-hien-tai--desktop-1280--dark.png |

Mọi ảnh: `document.documentElement.scrollWidth == innerWidth` (đo lúc chụp).

## Cảnh ngữ-cảnh

- Không cần: `context: host-embedded` — bản mẫu render trong app thật, cùng thanh điều hướng và tab OKR.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Dòng phụ hàng mục tiêu «Trung bình N KR» → «Tính từ N KR» (trình duyệt không biết chương trình bật trọng số).
- Mũi tên thu/mở thêm `motion-reduce:transition-none`.
- Thêm trạng thái ST-cham: mục tiêu là hàng đầu bảng chấm, KR đánh số, «Điều học được» và «Mang sang» là hàng cuối của cùng bảng.
- ST-cham: hai bảng lệch cột (Số ở 771 px và 745 px) → bảng chấm `table-fixed` cùng độ rộng cột.
- ST-cham: KR mốc ghi «Chưa xong → Xong» → «Mốc» + «Kết quả Chưa xong».
- Một bảng cho cả danh sách → mỗi mục tiêu một khung (`data-muc-tieu` bọc một `SimpleTable`), hàng tiêu đề cột chỉ cho trình đọc màn hình: giữ móc mà 6 hồ sơ đã ký đang đo (`[data-muc-tieu] thead th` = 4, KR là con của khối, tên mục tiêu là `translate=no` đầu khối) mà vẫn không lặp tiêu đề ra mắt.
- Ẩn `thead` làm `table-fixed` chia đều bốn cột (cột mũi tên 294 px) → bỏ `table-fixed`, khai độ rộng trên ô hàng mục tiêu (52 / 674 / 192 / 256 px đo được).
- 375 px: thanh tiến độ KR dài ngắn theo chữ → khối tiến độ dưới tên `w-full`.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `SimpleTableRow` cần `nested` (nền hàng con) và `joined` (bỏ vạch dưới); bản mẫu đang đặt `bg-muted/30` và `border-b-0` bằng `className` — đề xuất: thêm vào `packages/ui/src/components/simple-table.tsx` ở lượt này (AC-8).
- `SimpleTable` cần một cách ẩn hàng tiêu đề khỏi mắt mà giữ cho trình đọc màn hình; bản mẫu đang truyền `headerClassName="sr-only"` — đề xuất: thuộc tính `header="sr-only"` trong `packages/ui`, cùng tệp với mục trên.
- Khung trang OKR của bản mẫu (`KhungUngDung` của `ban-mau-okr`) là bản chép tay vỏ app, không phải vỏ thật — có sẵn từ trước vòng này; đề xuất: giữ nguyên, ghi Known limits của proto, không mở việc riêng.
