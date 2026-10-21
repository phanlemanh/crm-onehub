# Gọn đầu trang Lấy ý kiến — nút Gửi trong màn đầu (VK13)

Ô cơ hội: `_acceptance/gon-dau-trang-lay-y-kien/opportunity.md` (build, Phan Le Manh, 20/10). Hàng VK13 của
`docs/plan/lo-trinh-okr.json`.

## Hôm nay

Ở 390×812, người góp ý mở Lấy ý kiến trong pha góp: thanh trên cùng, ô chu kỳ và hàng mục của thanh bên khu,
đầu trang Mục tiêu (tiêu đề, mô tả, dòng lý do, hàng nút), dải mốc, câu hỏi, rồi khung soạn có ba ô (Ý · Vì sao ·
Đo bằng gì) và hàng «còn được N ý» + nút Gửi. Mép dưới nút Gửi ở 957px (đo bằng `dot-hoi-y-tuong-okr` E12 bước 5
trên đỉnh VK2) — quá màn đầu 812px. Hồ sơ đã ký `dot-hoi-y-tuong-okr` đỏ sẵn ở đúng bước đó từ 927px trên onehub
trước VK2.

## Ba lối đã cân

| Lối | Kéo nút lên | Vì sao không / vì sao chọn |
| --- | --- | --- |
| Gọn đầu trang (một hàng nút, giấu mô tả ở điện thoại) | ~40–80px, không đủ 145px | Đổi hình đã ký của `dau-trang-okr-cho-nut-hoi-kara`, `duong-ly-do-muc-tieu`, `khung-man-chung` — câu «bật khi» của hàng cấm |
| Gập «Vì sao», «Đo bằng gì» sau một nút mở | ~180px | Bài đã ký `okr-hoi-y.dom.tsx` tìm thẳng ô «Vì sao (tuỳ chọn)» và gõ vào; gập là đổi hình đã ký |
| **Hàng Gửi bám đáy vùng cuộn khi khung soạn còn dưới màn** | nút luôn trong màn đầu | Không đổi ô nào, không đổi đầu trang; kho đã có tiền lệ ở Cập nhật tuần (`cap-nhat-tuan.tsx`: `sticky bottom-0 … border-t bg-background py-3`) |

## Thiết kế

- Hàng cuối của khung soạn `OSoanY` (`hoi-y/khoi-gop.tsx`: chữ «còn được N ý» + nút Gửi) thành hàng bám đáy
  **dưới khổ md**: `sticky bottom-0` trong vùng cuộn của trang, nền `bg-background`, viền trên, đệm dọc như Cập
  nhật tuần. Từ md trở lên hàng không bám, không viền, không đệm thêm — đứng đúng chỗ và đúng hình như onehub.
  Khi khung soạn đã cuộn trọn vào màn, hàng nằm đúng chỗ cũ (sau ô Đo bằng gì) — sticky chỉ giữ nó ở đáy khi
  phần dưới khung còn khuất.
- Lớp và đệm của hàng không viết tại chỗ gọi: thêm một thành phần dùng chung `HangHanhDongBamDay` vào
  `packages/ui` (bậc 5 của `docs/design.md` sau khi tra bậc 1–4), và Cập nhật tuần chưa đổi trong vòng này
  (ngoài phạm vi — đổi là chạm hình đã ký của hồ sơ Cập nhật tuần).
- Ô đang được trỏ vào không bị hàng bám che (Web Interface Guidelines: «Sticky … must not cover the focused
  element»): khối `Field` của ba ô (nhãn + ô + dòng mô tả/lỗi) mang `scroll-mb` bằng chiều cao hàng bám (dưới md),
  để trình duyệt cuộn cả khối — gồm dòng lỗi — lên trên hàng khi ô nhận tiêu điểm.
- Gửi khi ô Ý sai (dưới 10 ký tự): lỗi hiện ngay dưới ô như hôm nay; máy cuộn khối `Field` của ô Ý vào màn
  (`scrollIntoView({ block: "nearest" })`, tôn trọng `scroll-mb`) rồi chuyển tiêu điểm về ô Ý không cuộn thêm
  (WIG «focus first error on submit»). Ô Ý và câu lỗi đều nằm trên hàng bám.
- Không đổi gì ở máy tính: từ md trở lên hàng không bám, không viền, không đệm — nút Gửi đứng đúng chỗ cũ.
- Áp bản vá `docs/plan/vo-khu-muc-tieu/dot-hoi-y-tuong-okr-hoi-1.patch` (Hỏi-1 của VK2: gỡ đo thanh thẻ ngang trong
  `man-hoi-y.mjs`, hai dòng sổ) để thước `dot-hoi-y-tuong-okr` khớp khu Mục tiêu mới, rồi ghim lại hồ sơ đó.
  Huy hiệu số ý kiến trên thanh bên (Ngoài-16) thuộc hàng riêng `huy-hieu-hoi-y-co-thuoc`, không làm ở đây.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thanh bên › Lấy ý kiến (pha góp, còn được góp) → thấy câu hỏi và nút Gửi ở đáy màn đầu → gõ ý → bấm
  Gửi (điểm ra: ý vào «Ý của bạn», khung trống lại).
- Biên: đã đủ 3 ý (khung soạn thay bằng thông báo «đủ ý» — không có hàng bám); không có quyền góp (không có khung).
- Lỗi & quay lại: Gửi khi ý dưới 10 ký tự → lỗi dưới ô Ý, tiêu điểm về ô Ý, hàng bám vẫn ở đáy → sửa rồi Gửi lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Lấy ý kiến · pha góp (`/okr/lay-y-kien`) | góp tối đa 3 ý cho câu hỏi của kỳ | thanh bên Mục tiêu, tin nhắc / ở lại trang |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-layykien-gop-duoi-man | Lấy ý kiến 390 | khung soạn còn khuất dưới màn; hàng «còn được N ý · Gửi» bám đáy | gõ ý / cuộn tới khung |
| ST-layykien-gop-trong-man | Lấy ý kiến 390 · 1280 | khung soạn trọn trong màn; hàng Gửi đứng sau ô Đo bằng gì | gõ ý / Gửi |
| ST-layykien-gop-loi | Lấy ý kiến 390 · 375 | «Ý cần ít nhất 10 ký tự…» dưới ô Ý, tiêu điểm ở ô Ý; ô Ý và câu lỗi đều trên hàng bám | sửa ý rồi Gửi |
| ST-layykien-gop-dang-gui | Lấy ý kiến 390 | nút Gửi khoá, có vòng quay | chờ |
| ST-layykien-du-y | Lấy ý kiến 390 | thông báo đủ 3 ý, không hàng bám | xem ý của bạn |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Breakpoint: hàng chỉ bám dưới md; từ md trở lên hàng đứng trong dòng chảy như onehub, không viền, không đệm thêm.
- Phím & tiêu điểm: thứ tự Tab không đổi (Ý → Vì sao → Đo bằng gì → Gửi); ô nhận tiêu điểm không bị hàng bám che.
- Gửi sai: tiêu điểm về ô Ý.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Field orientation="horizontal"`, `Button`, `FieldDescription` | dùng | hàng Gửi hôm nay |
| `HangHanhDongBamDay` (`packages/ui`) | tạo | `packages/ui` chưa có hàng hành động bám đáy; Cập nhật tuần tự viết lớp tại chỗ — tra bậc 1–4 ghi ở PR |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: luồng hiển nhiên — trang đã là một cột cuộn; vòng chỉ giữ nút hành động chính trong tầm nhìn, như Cập nhật
tuần của chính kho.
<!-- UX-SPEC-TEMPLATE>>> -->

## Không làm

Gọn đầu trang Mục tiêu · gập ô tuỳ chọn · đổi Cập nhật tuần sang thành phần mới · huy hiệu Lấy ý kiến trên thanh
bên (`huy-hieu-hoi-y-co-thuoc`) · hàng công cụ Bộ OKR (`hang-cong-cu-bo-okr-mot-dong`).
