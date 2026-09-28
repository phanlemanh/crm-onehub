---
slug: tro-ly-okr-de-xuat
at: 2026-09-28T05:13:20Z
route: http://localhost:3910/proto/tro-ly-okr-de-xuat
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (anh-gui-kem-the-cong)
options: http://localhost:3910/proto/tro-ly-okr-de-xuat?state=ST-huong-chuyen-man
divergence: opened
ds_skill: web-design-guidelines
states: [ST-caidat-nac, ST-caidat-nac-bat-toan, ST-huong-chuyen-man, ST-kr-cot, ST-kr-khong-xu-huong, ST-kr-xu-huong, ST-muctieu-co-dong, ST-muctieu-da-quyet, ST-muctieu-dang-cho, ST-muctieu-dang-soan, ST-muctieu-het-luot, ST-muctieu-het-tran, ST-muctieu-loi, ST-muctieu-loi-nhan, ST-muctieu-nut, ST-muctieu-nut-khoa-sua, ST-muctieu-rong, ST-muctieu-sua-dong, ST-sodo-co-so, ST-sodo-dang-tai, ST-sodo-loi, ST-sodo-ngan, ST-sodo-rong]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 4
deferred: 3
---
# design-pass — tro-ly-okr-de-xuat

Bản mẫu chạy trong chính ứng dụng sau cờ `PROTO_ROUTE=1`, dựng bằng thành phần thật của
`packages/ui` (`Dialog size="wide"`, `Item`, `Shimmer`, `Textarea`, `FieldDescription`,
`Select`, `SimpleTable`, `Sheet`, `StatusIndicator`); hộp thoại nằm trên khung ứng dụng OKR
dùng chung của các bản mẫu OKR (`ban-mau-okr/phan-chung.tsx`). Dữ liệu giả, không đường
ghi. Chụp bằng `rang/chup-proto.mjs` (puppeteer, 1280 và 375, sáng và tối); 0 trạng thái
tràn ngang.

## Bước phân kỳ

Hai hướng cho chỗ đặt đề xuất — tên ổn định, lời khuyên ghim trên vật:

- **Hướng A · Cột cạnh form** (máy khuyên) — trục: đề xuất đứng cạnh ô nó sửa. Động cơ:
  người thấy ô sắp đổi, nhận xong thấy ngay ô đã đổi; khớp Grammarly, WRITER, Tability F02.
  Đánh đổi: hộp phải mở rộng; điện thoại xếp cột dưới form, phải cuộn.
  Trạng thái `ST-muctieu-co-dong` và các trạng thái hộp Mục tiêu còn lại.
- **Hướng B · Chuyển màn trong hộp** — trục: một việc một lúc. Động cơ: hộp giữ bề rộng
  cũ, điện thoại không phải xếp hai cột. Đánh đổi: không thấy ô sắp đổi; nhận xong phải
  quay lại form. Trạng thái `ST-huong-chuyen-man`, lời «máy không khuyên» ghim trên hộp.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-caidat-nac | desktop-1280 | dark | evidence/design-pass/ST-caidat-nac--desktop-1280--dark.png |
| ST-caidat-nac | desktop-1280 | light | evidence/design-pass/ST-caidat-nac--desktop-1280.png |
| ST-caidat-nac | mobile-375 | dark | evidence/design-pass/ST-caidat-nac--mobile-375--dark.png |
| ST-caidat-nac | mobile-375 | light | evidence/design-pass/ST-caidat-nac--mobile-375.png |
| ST-caidat-nac-bat-toan | desktop-1280 | dark | evidence/design-pass/ST-caidat-nac-bat-toan--desktop-1280--dark.png |
| ST-caidat-nac-bat-toan | desktop-1280 | light | evidence/design-pass/ST-caidat-nac-bat-toan--desktop-1280.png |
| ST-caidat-nac-bat-toan | mobile-375 | dark | evidence/design-pass/ST-caidat-nac-bat-toan--mobile-375--dark.png |
| ST-caidat-nac-bat-toan | mobile-375 | light | evidence/design-pass/ST-caidat-nac-bat-toan--mobile-375.png |
| ST-huong-chuyen-man | desktop-1280 | dark | evidence/design-pass/ST-huong-chuyen-man--desktop-1280--dark.png |
| ST-huong-chuyen-man | desktop-1280 | light | evidence/design-pass/ST-huong-chuyen-man--desktop-1280.png |
| ST-huong-chuyen-man | mobile-375 | dark | evidence/design-pass/ST-huong-chuyen-man--mobile-375--dark.png |
| ST-huong-chuyen-man | mobile-375 | light | evidence/design-pass/ST-huong-chuyen-man--mobile-375.png |
| ST-kr-cot | desktop-1280 | dark | evidence/design-pass/ST-kr-cot--desktop-1280--dark.png |
| ST-kr-cot | desktop-1280 | light | evidence/design-pass/ST-kr-cot--desktop-1280.png |
| ST-kr-cot | mobile-375 | dark | evidence/design-pass/ST-kr-cot--mobile-375--dark.png |
| ST-kr-cot | mobile-375 | light | evidence/design-pass/ST-kr-cot--mobile-375.png |
| ST-kr-khong-xu-huong | desktop-1280 | dark | evidence/design-pass/ST-kr-khong-xu-huong--desktop-1280--dark.png |
| ST-kr-khong-xu-huong | desktop-1280 | light | evidence/design-pass/ST-kr-khong-xu-huong--desktop-1280.png |
| ST-kr-khong-xu-huong | mobile-375 | dark | evidence/design-pass/ST-kr-khong-xu-huong--mobile-375--dark.png |
| ST-kr-khong-xu-huong | mobile-375 | light | evidence/design-pass/ST-kr-khong-xu-huong--mobile-375.png |
| ST-kr-xu-huong | desktop-1280 | dark | evidence/design-pass/ST-kr-xu-huong--desktop-1280--dark.png |
| ST-kr-xu-huong | desktop-1280 | light | evidence/design-pass/ST-kr-xu-huong--desktop-1280.png |
| ST-kr-xu-huong | mobile-375 | dark | evidence/design-pass/ST-kr-xu-huong--mobile-375--dark.png |
| ST-kr-xu-huong | mobile-375 | light | evidence/design-pass/ST-kr-xu-huong--mobile-375.png |
| ST-muctieu-co-dong | desktop-1280 | dark | evidence/design-pass/ST-muctieu-co-dong--desktop-1280--dark.png |
| ST-muctieu-co-dong | desktop-1280 | light | evidence/design-pass/ST-muctieu-co-dong--desktop-1280.png |
| ST-muctieu-co-dong | mobile-375 | dark | evidence/design-pass/ST-muctieu-co-dong--mobile-375--dark.png |
| ST-muctieu-co-dong | mobile-375 | light | evidence/design-pass/ST-muctieu-co-dong--mobile-375.png |
| ST-muctieu-da-quyet | desktop-1280 | dark | evidence/design-pass/ST-muctieu-da-quyet--desktop-1280--dark.png |
| ST-muctieu-da-quyet | desktop-1280 | light | evidence/design-pass/ST-muctieu-da-quyet--desktop-1280.png |
| ST-muctieu-da-quyet | mobile-375 | dark | evidence/design-pass/ST-muctieu-da-quyet--mobile-375--dark.png |
| ST-muctieu-da-quyet | mobile-375 | light | evidence/design-pass/ST-muctieu-da-quyet--mobile-375.png |
| ST-muctieu-dang-cho | desktop-1280 | dark | evidence/design-pass/ST-muctieu-dang-cho--desktop-1280--dark.png |
| ST-muctieu-dang-cho | desktop-1280 | light | evidence/design-pass/ST-muctieu-dang-cho--desktop-1280.png |
| ST-muctieu-dang-cho | mobile-375 | dark | evidence/design-pass/ST-muctieu-dang-cho--mobile-375--dark.png |
| ST-muctieu-dang-cho | mobile-375 | light | evidence/design-pass/ST-muctieu-dang-cho--mobile-375.png |
| ST-muctieu-dang-soan | desktop-1280 | dark | evidence/design-pass/ST-muctieu-dang-soan--desktop-1280--dark.png |
| ST-muctieu-dang-soan | desktop-1280 | light | evidence/design-pass/ST-muctieu-dang-soan--desktop-1280.png |
| ST-muctieu-dang-soan | mobile-375 | dark | evidence/design-pass/ST-muctieu-dang-soan--mobile-375--dark.png |
| ST-muctieu-dang-soan | mobile-375 | light | evidence/design-pass/ST-muctieu-dang-soan--mobile-375.png |
| ST-muctieu-het-luot | desktop-1280 | dark | evidence/design-pass/ST-muctieu-het-luot--desktop-1280--dark.png |
| ST-muctieu-het-luot | desktop-1280 | light | evidence/design-pass/ST-muctieu-het-luot--desktop-1280.png |
| ST-muctieu-het-luot | mobile-375 | dark | evidence/design-pass/ST-muctieu-het-luot--mobile-375--dark.png |
| ST-muctieu-het-luot | mobile-375 | light | evidence/design-pass/ST-muctieu-het-luot--mobile-375.png |
| ST-muctieu-het-tran | desktop-1280 | dark | evidence/design-pass/ST-muctieu-het-tran--desktop-1280--dark.png |
| ST-muctieu-het-tran | desktop-1280 | light | evidence/design-pass/ST-muctieu-het-tran--desktop-1280.png |
| ST-muctieu-het-tran | mobile-375 | dark | evidence/design-pass/ST-muctieu-het-tran--mobile-375--dark.png |
| ST-muctieu-het-tran | mobile-375 | light | evidence/design-pass/ST-muctieu-het-tran--mobile-375.png |
| ST-muctieu-loi | desktop-1280 | dark | evidence/design-pass/ST-muctieu-loi--desktop-1280--dark.png |
| ST-muctieu-loi | desktop-1280 | light | evidence/design-pass/ST-muctieu-loi--desktop-1280.png |
| ST-muctieu-loi | mobile-375 | dark | evidence/design-pass/ST-muctieu-loi--mobile-375--dark.png |
| ST-muctieu-loi | mobile-375 | light | evidence/design-pass/ST-muctieu-loi--mobile-375.png |
| ST-muctieu-loi-nhan | desktop-1280 | dark | evidence/design-pass/ST-muctieu-loi-nhan--desktop-1280--dark.png |
| ST-muctieu-loi-nhan | desktop-1280 | light | evidence/design-pass/ST-muctieu-loi-nhan--desktop-1280.png |
| ST-muctieu-loi-nhan | mobile-375 | dark | evidence/design-pass/ST-muctieu-loi-nhan--mobile-375--dark.png |
| ST-muctieu-loi-nhan | mobile-375 | light | evidence/design-pass/ST-muctieu-loi-nhan--mobile-375.png |
| ST-muctieu-nut | desktop-1280 | dark | evidence/design-pass/ST-muctieu-nut--desktop-1280--dark.png |
| ST-muctieu-nut | desktop-1280 | light | evidence/design-pass/ST-muctieu-nut--desktop-1280.png |
| ST-muctieu-nut | mobile-375 | dark | evidence/design-pass/ST-muctieu-nut--mobile-375--dark.png |
| ST-muctieu-nut | mobile-375 | light | evidence/design-pass/ST-muctieu-nut--mobile-375.png |
| ST-muctieu-nut-khoa-sua | desktop-1280 | dark | evidence/design-pass/ST-muctieu-nut-khoa-sua--desktop-1280--dark.png |
| ST-muctieu-nut-khoa-sua | desktop-1280 | light | evidence/design-pass/ST-muctieu-nut-khoa-sua--desktop-1280.png |
| ST-muctieu-nut-khoa-sua | mobile-375 | dark | evidence/design-pass/ST-muctieu-nut-khoa-sua--mobile-375--dark.png |
| ST-muctieu-nut-khoa-sua | mobile-375 | light | evidence/design-pass/ST-muctieu-nut-khoa-sua--mobile-375.png |
| ST-muctieu-rong | desktop-1280 | dark | evidence/design-pass/ST-muctieu-rong--desktop-1280--dark.png |
| ST-muctieu-rong | desktop-1280 | light | evidence/design-pass/ST-muctieu-rong--desktop-1280.png |
| ST-muctieu-rong | mobile-375 | dark | evidence/design-pass/ST-muctieu-rong--mobile-375--dark.png |
| ST-muctieu-rong | mobile-375 | light | evidence/design-pass/ST-muctieu-rong--mobile-375.png |
| ST-muctieu-sua-dong | desktop-1280 | dark | evidence/design-pass/ST-muctieu-sua-dong--desktop-1280--dark.png |
| ST-muctieu-sua-dong | desktop-1280 | light | evidence/design-pass/ST-muctieu-sua-dong--desktop-1280.png |
| ST-muctieu-sua-dong | mobile-375 | dark | evidence/design-pass/ST-muctieu-sua-dong--mobile-375--dark.png |
| ST-muctieu-sua-dong | mobile-375 | light | evidence/design-pass/ST-muctieu-sua-dong--mobile-375.png |
| ST-sodo-co-so | desktop-1280 | dark | evidence/design-pass/ST-sodo-co-so--desktop-1280--dark.png |
| ST-sodo-co-so | desktop-1280 | light | evidence/design-pass/ST-sodo-co-so--desktop-1280.png |
| ST-sodo-co-so | mobile-375 | dark | evidence/design-pass/ST-sodo-co-so--mobile-375--dark.png |
| ST-sodo-co-so | mobile-375 | light | evidence/design-pass/ST-sodo-co-so--mobile-375.png |
| ST-sodo-dang-tai | desktop-1280 | dark | evidence/design-pass/ST-sodo-dang-tai--desktop-1280--dark.png |
| ST-sodo-dang-tai | desktop-1280 | light | evidence/design-pass/ST-sodo-dang-tai--desktop-1280.png |
| ST-sodo-dang-tai | mobile-375 | dark | evidence/design-pass/ST-sodo-dang-tai--mobile-375--dark.png |
| ST-sodo-dang-tai | mobile-375 | light | evidence/design-pass/ST-sodo-dang-tai--mobile-375.png |
| ST-sodo-loi | desktop-1280 | dark | evidence/design-pass/ST-sodo-loi--desktop-1280--dark.png |
| ST-sodo-loi | desktop-1280 | light | evidence/design-pass/ST-sodo-loi--desktop-1280.png |
| ST-sodo-loi | mobile-375 | dark | evidence/design-pass/ST-sodo-loi--mobile-375--dark.png |
| ST-sodo-loi | mobile-375 | light | evidence/design-pass/ST-sodo-loi--mobile-375.png |
| ST-sodo-ngan | desktop-1280 | dark | evidence/design-pass/ST-sodo-ngan--desktop-1280--dark.png |
| ST-sodo-ngan | desktop-1280 | light | evidence/design-pass/ST-sodo-ngan--desktop-1280.png |
| ST-sodo-ngan | mobile-375 | dark | evidence/design-pass/ST-sodo-ngan--mobile-375--dark.png |
| ST-sodo-ngan | mobile-375 | light | evidence/design-pass/ST-sodo-ngan--mobile-375.png |
| ST-sodo-rong | desktop-1280 | dark | evidence/design-pass/ST-sodo-rong--desktop-1280--dark.png |
| ST-sodo-rong | desktop-1280 | light | evidence/design-pass/ST-sodo-rong--desktop-1280.png |
| ST-sodo-rong | mobile-375 | dark | evidence/design-pass/ST-sodo-rong--mobile-375--dark.png |
| ST-sodo-rong | mobile-375 | light | evidence/design-pass/ST-sodo-rong--mobile-375.png |

## Cảnh ngữ-cảnh

- Không cần cảnh riêng: `context: host-embedded` — bản mẫu chạy trong ứng dụng thật, hộp
  thoại mở trên khung OKR dùng chung.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Dòng đề xuất: hàng nút Nhận · Sửa · Bác đứng cạnh nội dung làm câu mới gãy từng chữ ở
  cột hẹp → nút chuyển xuống dưới nội dung trong cùng `Item`.
- Nhãn loại dòng bằng `Badge` cạnh tên ô xếp chồng khó đọc → một dòng mô tả «Viết lại ·
  Tên Mục tiêu».
- Thẻ số đo: ô số lớn làm «31% · 12% · 40%» gãy ba dòng → bảng hai cột Bật · Bóng, mỗi số
  một hàng.
- Dòng xu hướng dưới ô Đích mang biểu tượng câu hỏi của luật lượt 7, dù nó không phải câu
  hỏi → `FieldDescription` thường.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `Suggestion` của `packages/ui` chỉ có một dòng giá trị, lý do, hai nút biểu tượng; lượt
  này cần biến thể câu cũ gạch → câu mới, nút chữ Nhận · Sửa · Bác, ô sửa, trạng thái đã
  quyết — dựng thành biến thể của `Suggestion` ở S3, dùng token `diff-them`/`diff-bo` của
  `diff-trang`. Bản mẫu ráp tạm bằng `Item`.
- `SimpleTable` trên điện thoại cuộn ngang trong khung, cột thứ ba của bảng số đo và các
  cột Nấc · Dòng · Độ trễ của bảng lượt nằm khuất — cần một cách ẩn cột phụ hay xếp dọc ở
  khổ hẹp, hoặc chấp nhận cuộn ngang cho màn chỉ quản trị.
- Dialog trên điện thoại: cột góp ý nằm dưới form dài, người phải cuộn; hành vi «bấm nút
  thì cuộn tới cột» là mã của màn, không phải của thành phần — ghi để S3 không quên.
