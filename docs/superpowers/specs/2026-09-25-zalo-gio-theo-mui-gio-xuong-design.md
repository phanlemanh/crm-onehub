# Giờ trên màn Kết nối › Zalo theo múi giờ xưởng — thiết kế

Ngày: 2026-09-25 · Hồ sơ: `_acceptance/zalo-gio-theo-mui-gio-xuong/` · Hạng T2.

## Vấn đề

Thử production sáng 25/09: `zalo.xuong` trả `pollCuoi` = `2026-09-24T22:27:04Z` (05:27 sáng
25/09 giờ Việt Nam), nhưng màn Kết nối › Zalo in «Bot OneHub 1 · trả lời lần cuối lúc 22:27
24-09». Người đọc tưởng tác tử đã im bảy tiếng.

Nguyên nhân: trang (`apps/app/app/(app)/[slug]/settings/connections/zalo/page.tsx`) là component
máy chủ, gọi `ngayGio(locale, xuong.pollCuoi)` (`apps/app/lib/nhac-qua-zalo-man.ts`). `ngayGio`
dựng `Intl.DateTimeFormat` không khai `timeZone`, nên định dạng theo múi giờ của tiến trình. Máy
chủ Vercel chạy UTC; máy dev ở VN nên lỗi không hiện khi thử tại chỗ.

## Hướng đã chọn

- `ngayGio(locale, luc, muiGio)` nhận múi giờ là tham số **bắt buộc** và truyền vào
  `timeZone`. Không có giá trị mặc định: mọi chỗ gọi phải nói rõ múi giờ, trình biên dịch bắt
  chỗ quên.
- Trang Kết nối › Zalo truyền `NHAC.muiGio` (`@crm/db/onboarding-nhac`, `Asia/Ho_Chi_Minh`) —
  cùng nguồn với giờ nhắc 08:30. Trang là component máy chủ nên được import `@crm/db`; tệp
  `nhac-qua-zalo-man.ts` vẫn không import gói máy chủ (component client dùng nó).
- `gioPhut` («Hết hạn lúc» ở Thông báo của bạn) không đổi: nó chạy trong trình duyệt nên theo
  múi giờ máy người xem, đúng với người ở VN.

## Phương án đã loại

- **Định dạng ở trình duyệt** (chuyển `pollCuoi` thô xuống client). Loại vì: giờ xưởng là một
  múi giờ duy nhất đã khai (`NHAC.muiGio`), và định dạng ở máy chủ với múi giờ tường minh tránh
  luôn lệch hiển thị giữa máy chủ và client.
- **Đặt `TZ=Asia/Ho_Chi_Minh` cho cả project trên Vercel.** Loại vì: sửa bằng biến môi trường
  không nằm trong kho, không đo được bằng test, và đổi múi giờ của mọi đoạn mã khác.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt › Kết nối › Zalo → đầu trang đọc «<tên bot> · trả lời lần cuối lúc <giờ:phút
  ngày/tháng>» theo giờ Việt Nam (điểm ra: ở lại trang).
- Biên: lần kiểm cuối rơi sau nửa đêm giờ VN nhưng trước nửa đêm UTC → ngày in là ngày giờ VN.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Kết nối › Zalo | cho quản trị viên biết bot nào đang dùng, tin có về CRM không, và bot còn sống không | Cài đặt › Kết nối / Thông báo của bạn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ket-noi-zalo-song | Kết nối › Zalo | «<tên bot> · trả lời lần cuối lúc 05:27 25-09» theo giờ VN | không cần |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Định dạng qua `Intl.DateTimeFormat` với `timeZone` tường minh; chữ số theo ngôn ngữ màn.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Dòng trạng thái bot có sẵn của `KetNoiZaloThan` | dùng | chỉ đổi chuỗi giờ đưa vào |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: màn cài đặt có sẵn; vòng này không đổi bố cục, chỉ đổi múi giờ của một chuỗi — luồng
hiển nhiên, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm

- Tệp mới `apps/app/test/zalo-gio-theo-mui-gio-xuong.spec.ts`: ma trận 2 ngôn ngữ × 3 thời điểm
  viết trước, chạy dưới `bun test` (tiến trình ép `TZ=UTC`, như Vercel). Kỳ vọng tính bằng một
  `Intl.DateTimeFormat` đối chứng khai `timeZone: "Asia/Ho_Chi_Minh"` và kèm giờ:phút chữ ghim.
- Eval `ui-check`: app và api của cây đang xét, máy chủ app chạy với `TZ=UTC`, gieo
  `zaloPolledAt` = `2026-09-24T22:27:04Z`, chụp Kết nối › Zalo ở 1440 và 375.
