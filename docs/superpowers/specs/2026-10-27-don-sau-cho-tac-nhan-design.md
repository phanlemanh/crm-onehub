# Dọn giao diện sau K7 — thiết kế

Hàng K7c của lộ trình OKR (`docs/plan/lo-trinh-okr.json`), hồ sơ `_acceptance/don-sau-cho-tac-nhan/`. Chủ kho ký Cổng
Đáng 27/10. Việc dọn hai mục Known limits của K7 (`cho-tac-nhan-lau`, Ngoài-5 và Ngoài-11).

## Vấn đề

- Thẻ «Đang dựng» (`TheDangDung`) sống ở `apps/app/components/agent-builder/the-dang-dung.tsx`, trái luật
  `docs/design.md`: «/packages/ui is the single source of truth for all UI».
- Ở chỗ gọi, `CardAction` mang `gap-3` cùng màu và cỡ chữ, `CardFooter` mang `gap-2`, trái luật «Do not override
  component styles with className».

## Phương án

1. **Dời thẻ vào `packages/ui/src/components/the-dang-dung.tsx`**, giữ tên `TheDangDung` và `data-slot="the-dang-dung"`
   (bài đo màn của K7 tìm thẻ bằng dấu đó). Thẻ thành thành phần chỉ vẽ: nhận chữ đã dựng sẵn qua tham số, không đọc
   `messages` của app, không tự đếm giờ. Không đụng `packages/ui/src/lib/messages.ts` (#568 đang sửa tệp đó).
2. **Phần tính ở lại app.** `apps/app/lib/agent-builder-the-dang-dung.ts` (mới, `"use client"`) có hook `useTheDangDung`:
   đọc `useSeconds`, dùng ba hàm sẵn có của `agent-builder-cho.ts` (`daTroiTuLucGui`, `dongHoDaTroi`, `laLauHonThuongLe`)
   và chữ `t.dung.*`, trả đúng các tham số thẻ cần. Hai chỗ gọi — màn chat (`agent-builder-chat.tsx`) và bản mẫu
   (`proto/_modules/cho-tac-nhan-lau`) — gọi hook rồi đưa kết quả cho thẻ. Tên tệp khớp glob
   `apps/app/lib/agent-builder-*.ts` trong `paths` của eval E1 của K7, nên hồ sơ đã ký vẫn phủ tệp mới.
3. **Bỏ `className` đổi khoảng cách và chữ trên `CardAction`, `CardFooter`.** Hai phần dùng khoảng mặc định của `Card`
   (`CardAction` 8 px giữa đồng hồ và tiến độ, `CardFooter` 12 px giữa câu «rời trang» và nút Dừng). Màu xám, cỡ chữ
   nhỏ và chữ số đều hàng chuyển xuống hai `span` con, là phần tử của chính thẻ. Không thêm biến thể `Card`: ô cơ hội đã
   ký ghi «phải thêm biến thể vào `Card` mà chỉ một chỗ dùng» là CHẾT.
4. Xoá `apps/app/components/agent-builder/the-dang-dung.tsx`.

Lệch hình duy nhất là hai khoảng trên: 12 → 8 px ở đầu thẻ, 8 → 12 px ở chân thẻ. Đây là **Hỏi-1** cho Cổng Phạm vi
(gu nhìn, chủ kho chọn):

- **Khuyến nghị — theo mặc định của `Card`.** Đúng ý Ngoài-11: thẻ không lệch các thẻ khác.
- Lối khác — bọc một phần tử trong thẻ giữ 12/8 px. Thẻ trông y như K7, không `className` trên `CardAction`,
  `CardFooter`, nhưng vẫn lệch mọi thẻ khác — chỉ dời chỗ lệch vào trong.

Ảnh trước/sau của hai lối ở `_acceptance/don-sau-cho-tac-nhan/design-pass.md`. Biến thể `Card` một chỗ dùng là CHẾT
theo ô cơ hội, nên không là lối.

Bài kiểm của K7 (`apps/app/test/cho-tac-nhan-lau.dom.tsx`) vẽ thẻ qua `BuildingAgentCard` của màn chat, không nhập thẻ
trực tiếp — đổi khế ước của thẻ không buộc sửa tệp test, và E4 chặn mọi sửa ở tệp đó.

Ngoài phạm vi: `CardContent` của thẻ vẫn mang `gap-2` (hai mục Known limits không nêu nó); các `CardAction`,
`CardFooter` mang `className` ở chỗ khác (`okr/toan-canh/toan-canh.tsx`, hai bản mẫu `khep-ky-okr`,
`soan-okr-cung-tro-ly`) thuộc các hàng NM.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: người dùng gửi mô tả tác nhân ở `/chat/<id>` → thẻ «Đang dựng tác nhân» hiện bốn bước, đồng hồ đã trôi, câu
  «rời trang» và nút Dừng → bước xong dần (điểm ra: bản nháp tác nhân chờ duyệt). Luồng không đổi so với K7.
- Biên: dưới 1 giây không có đồng hồ; quá 200 giây có dòng «lâu hơn thường lệ».
- Lỗi & quay lại: không đổi so với K7 (nút Dừng, thử lại).

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hội thoại dựng tác nhân `/chat/<id>` | cho thấy lượt dựng đang ở đâu | từ thanh bên hay chuông / tới bản nháp |
| Bản mẫu `/proto/cho-tac-nhan-lau` | cho xem thẻ ở hai trạng thái cố định | gõ đường dẫn / không |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-the-dang-dung-duoi-nguong | `/chat/<id>`, bản mẫu | bốn bước, đồng hồ «Đã m:ss», «n trên 4», câu rời trang, nút Dừng | chờ, rời trang, hay Dừng |
| ST-the-dang-dung-tren-nguong | `/chat/<id>`, bản mẫu | như trên, thêm dòng «Đã quá 3 phút. Kara vẫn đang dựng.» | như trên |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Khổ 375: trang không cuộn ngang (đo lại bằng bài đo màn của K7).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Card`, `CardHeader`, `CardTitle`, `CardAction`, `CardContent`, `CardFooter` | dùng | khoảng mặc định, không `className` trên `CardAction`, `CardFooter` |
| `DotMatrix`, `Icon` | dùng | như K7 |
| `TheDangDung` | tạo (bậc 5 của `docs/design.md`) | bậc 1 đã tra `kara/steps.tsx` (`KaraSteps`): là danh sách gập, khác hình thẻ — dùng nó là đổi hình (CHẾT); bậc 2–4 không có thẻ tiến độ có đồng hồ và nút |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: hội-thoại
Căn cứ: luồng hiển nhiên — thẻ nằm trong hội thoại dựng tác nhân đã có từ K7; việc này không đổi IA.
<!-- UX-SPEC-TEMPLATE>>> -->

## Soát chuẩn giao diện (web-design-guidelines)

Kho khai `feature_loop.ui_standards_skill: web-design-guidelines`; đã soát thẻ hiện có:

- Biểu tượng xong và chấm đang làm có `aria-hidden` (qua `Icon` và `DotMatrix decorative`) — đạt.
- Đồng hồ và tiến độ dùng `tabular-nums` — giữ, chuyển xuống `span`.
- Tên tệp (`instructions.md`…) là mã, lẽ ra mang `translate="no"` — để ngoài vòng: vòng này dời nguyên trạng, thêm thuộc
  tính là đổi hành vi của thẻ K7.
