# Trang giới thiệu hết mã màu thô — thiết kế (SN2)

Hàng SN2 của `docs/plan/lo-trinh-okr.json`, đợt `don-dep-3110`. Hồ sơ `_acceptance/hex-trang-gioi-thieu/`.

## Vấn đề

Nghiên cứu sàn thiết kế (`docs/findings/2026-10-31-design-floor-crm/README.md` mục 3.4) đếm được 11 chỗ màu hex ở 6 tệp
`apps/app/components/landing/*`. Đó là nợ hex thật duy nhất của phần màn trong app. `docs/design.md` cấm màu tự đặt ở
chỗ gọi. Khi kho bật M1, mọi vòng chạm trang giới thiệu sẽ bị chặn cả tệp vì các chỗ này.

## Hiện trạng

Trang `apps/app/app/(landing)/page.tsx` bọc toàn trang trong `div.dark`, nên trang luôn vẽ bằng bộ token nền tối,
bất kể máy khách đặt sáng hay tối. Mười một chỗ:

| # | Tệp | Hiện | Đổi thành | Giá trị nền tối |
|---|---|---|---|---|
| 1 | `built-with.tsx` | `text-[#6E6E6E]` nhãn BUILT WITH | `text-muted-foreground` | xám 63% |
| 2 | `ask-card.tsx` | `text-[#5A5A5A]` nhãn SUGGESTED | `text-muted-foreground` | xám 63% |
| 3 | `ask-card.tsx` | `bg-[#1A1A1A]` ô hỏi | `bg-muted` | xám 10% = `#1A1A1A`, không đổi |
| 4 | `ask-card.tsx` | `text-[#6E6E6E]` chữ gợi ý trong ô | `text-muted-foreground` | xám 63% |
| 5 | `bento-card.tsx` | `text-[#5A5A5A]` nhãn mono (WHY…) | `text-muted-foreground` | xám 63% |
| 6 | `capabilities-section.tsx` | `bg-[#3A3A3A]` chấm việc chưa tới | `bg-border` | trắng 14% trên nền thẻ |
| 7 | `capabilities-section.tsx` | `text-[#6E6E6E]` hạn của việc | `text-muted-foreground` | xám 63% |
| 8 | `capabilities-section.tsx` | `stroke="#4A4A4A"` vòng nền của vòng quay | `stroke="var(--border)"` | cùng lối với `var(--ring)` ngay dưới |
| 9 | `github-star-button.tsx` | `text-[#E3B341]` ngôi sao | `text-warning` | amber 800 |
| 10 | `agent-section.tsx` | `border-[#3D3D3D]` khung soạn | `border-border` | trắng 14% |
| 11 | `agent-section.tsx` | `text-[#00805E]` lệnh «/Create agent» | `text-code-string` (Hỏi-2) | `#40be96` ở nền tối |

## Phát hiện ở bước thiết kế: trang không giữ nền tối

Ảnh chụp ở cây gốc (`onehub` 6ca59691a) cho thấy: máy khách đặt nền sáng thì trang giới thiệu vẽ thành nền sáng, chữ
`text-white` (Vercel, Next.js…) biến mất trên nền trắng. Nguyên nhân: `globals.css` khai token ngữ nghĩa
(`--background: var(--ds-background-200)`…) chỉ trên `:root`, nên giá trị được giải một lần ở `<html>` rồi kế thừa
nguyên xuống. `div.dark` của trang chỉ ghi đè thang `--ds-*` của `geist.css`; token ngữ nghĩa không giải lại ở đó.
`<html>` chỉ có lớp `dark` khi `next-themes` (`defaultTheme="system"`) thấy máy khách đặt tối.

Sửa: khai khối token ngữ nghĩa cho cả `.dark` — `:root, .dark { … }` — để mọi phần tử mang `.dark` giải lại token
theo thang tối. Khi `<html>` đã có `.dark`, khối khai trùng giá trị, không đổi gì. Trang giới thiệu là chỗ duy nhất
đặt `.dark` lồng trong app (`grep` 31/10).

| Khổ | Nền máy khách sáng, trước vòng | Sau vòng |
|---|---|---|
| 1280, 375 | nền trắng, chữ trắng mất | giống hệt nền tối |


- **Token ngữ nghĩa có sẵn, không thêm token mới.** `docs/design.md`: «Do not introduce custom border radii, spacing,
  colours…». Nhãn nhỏ đổi từ xám 35–43% lên `muted-foreground` 63%: sáng hơn, đạt tương phản 4.5:1 trên nền đen (cũ
  chỉ khoảng 2.9–3.6:1). Lối khác — thêm bốn token riêng cho trang giới thiệu vào `globals.css` để giữ đúng từng
  điểm ảnh — là câu hỏi cho chủ kho ở Cổng Phạm vi (Hỏi-1), vì đó là gu nhìn.
- **Lệnh «/Create agent» không dùng `text-primary`.** `docs/design.md`: «`#006B4F` is too close to the dark background
  to register». Chọn giữa `text-code-string` (khuyên: lệnh là chữ dạng mã) và `text-ring` (cùng màu, nhưng là token
  viền tiêu điểm) là Hỏi-2 ở Cổng Phạm vi.
- **`text-white` không đổi** — không phải hex, ngoài câu giao (dòng sổ `descope`).
- **Vòng nền của vòng quay dùng `stroke="var(--border)"`** — đúng lối của nét `stroke="var(--ring)"` cùng hình.
- `globals.css` chỉ đổi bộ chọn của khối token ngữ nghĩa (`:root` → `:root, .dark`), không thêm token nào.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: khách mở `/` → cuộn qua các mục → bấm câu gợi ý ở thẻ «Ask any record a question» (điểm ra: chữ trong ô
  hỏi đổi sang màu chữ chính)
- Biên: máy khách đặt nền sáng — trang vẫn vẽ nền tối, giống hệt
- Lỗi & quay lại: không có — trang tĩnh, không gửi gì

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Trang giới thiệu `/` | giới thiệu sản phẩm | gõ địa chỉ / nút đăng nhập, GitHub |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-gioi-thieu-mac-dinh | Trang giới thiệu | ô hỏi hiện chữ gợi ý «What do they sell?» màu `muted-foreground` | bấm một câu gợi ý |
| ST-gioi-thieu-da-hoi | Trang giới thiệu | ô hỏi hiện câu vừa chọn màu `foreground` | bấm câu khác |
| ST-gioi-thieu-nen-sang | Trang giới thiệu | máy khách đặt nền sáng; trang giống hệt nền tối | không đổi |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Khổ 1280 và 375; không đổi bố cục, chỉ đổi màu ở 11 chỗ đã khai.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Token màu của `globals.css` | dùng | token ngữ nghĩa có sẵn phủ đủ 11 chỗ |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: trang giới thiệu có sẵn, vòng này không đổi cấu trúc — chỉ đổi màu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đo

- Quét mã hex trong `apps/app/components/landing` bằng đúng mẫu `RE_HEX` của kit, kèm đối chứng dương trên bản sao có
  tiêm một mã hex (E1).
- Trên trang đang chạy, màu tính được của 11 chỗ bằng màu của token đã khai, đọc từ chính trang (E2); chữ đạt tương
  phản 4.5:1 (E3); bấm câu gợi ý đổi màu chữ trong ô (E5).
- Ảnh 1280 và 375 ở hai nền của máy khách; hai nền ra ảnh trùng từng điểm, và người duyệt so ảnh trước/sau (E4).
