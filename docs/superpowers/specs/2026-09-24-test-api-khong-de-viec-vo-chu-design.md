# Test api không để lại việc vô chủ — thiết kế

Ngày: 2026-09-24 · Hồ sơ: `_acceptance/test-api-khong-de-viec-vo-chu/`

## Vấn đề

Một lượt `bun run test` dùng một cơ sở dữ liệu cho mọi gói, gói api chạy trước
gói agent. Trong CI (run 35879017470, lượt 1), `go-la-cat-quyen.spec.ts` đăng
nhập thật; hook `session.create.after` gọi mọi handler đăng ký qua
`onSignedIn`, và `BackfillService` chạy một lượt quét không ai chờ. Lượt quét
xếp dòng `AgentTask` loại `identify` cho 11 liên hệ còn nằm trong cơ sở dữ liệu.
22 dòng đó (hai lượt quét) sống sang gói agent và làm đỏ ba bài `claimDue`.

## Đã đo (2026-09-24, máy này)

Chạy gói api một lượt rồi đếm ngay trong cơ sở dữ liệu của lượt đó:

- còn đúng **11 liên hệ** tên `Ca nhan-<giờ>-<n>` và **25 công ty** tên
  `Cong ty-<giờ>-<n>` — khớp số 11 của CI;
- khuôn tên đó chỉ `apps/api/test/dieu-phoi-gieo.ts` sinh ra;
- hai file dùng nó mà không dọn: `dieu-phoi.spec.ts` (không có bước dọn nào,
  6 liên hệ) và `dieu-phoi-diem-nhan.spec.ts` (chỉ dọn `AgentTask` loại của nó,
  5 liên hệ). Chúng còn để lại người dùng, bộ phận, kế hoạch;
- 25 công ty không có tên miền, nên lượt quét không xếp `brand` hay
  `company-profile` cho chúng — chỉ liên hệ gây rò.

Nguồn thứ hai: mỗi file dựng ứng dụng Nest bằng `createApp()` đăng ký thêm một
handler vào mảng cấp module của `@crm/auth`. `app.close()` không gỡ nó, nên một
lần đăng nhập ở file sau đánh thức handler của mọi ứng dụng đã đóng, mỗi cái
một bộ nhớ đệm riêng — CI thấy 9 lượt quét trong một lần đăng nhập.

Ở máy này `bun test` xếp `go-la-cat-quyen` chạy sớm, trước khi có liên hệ nào
sót, nên màu đỏ không tái hiện theo thứ tự tự nhiên. `bun test` không giữ thứ
tự file theo tham số, nên phép đo không dựa vào thứ tự: mỗi phép đo tự dựng
tình huống của nó.

## Cách làm

1. **Dọn đúng thứ đã gieo.** `dieu-phoi-gieo.ts` ghi lại mã mọi dòng nó tạo và
   xuất một hàm dọn; hai file trên gọi hàm đó ở `afterAll`. Xoá công ty kéo theo
   kế hoạch, bước, ghi danh (khoá ngoại cascade), rồi mới xoá liên hệ, người
   dùng, bộ phận. Hàm dọn xoá sổ ghi sau khi chạy, vì module dùng chung giữa các
   file trong một tiến trình.
2. **Ứng dụng đã đóng thôi phản ứng với đăng nhập — đổi sản phẩm, nêu rõ.**
   `BackfillService` thêm `onModuleDestroy` bật một cờ đã dừng; handler đăng
   nhập kiểm cờ trước khi gọi `auto()`. Ở production chỉ có một ứng dụng và nó
   chỉ đóng lúc tắt tiến trình, nên không ai thấy khác. Đây là sửa vòng đời:
   một dịch vụ đã huỷ không nên còn làm việc.
3. **Test đăng nhập không kích lượt quét thật.** `go-la-cat-quyen.spec.ts` đo
   quyền, không đo quét: nó thay `auto()` của chính ứng dụng nó bằng một hàm rỗng
   ngay sau `createApp()`.
4. **Giữ một bài chứng đường quét thật vẫn sống**: file mới
   `quet-khi-dang-nhap.spec.ts` đăng nhập thật trên ứng dụng đang chạy, chờ dòng
   `identify` cho một liên hệ nó gieo, rồi xoá đúng các dòng lượt quét đó sinh ra
   (theo thời điểm bắt đầu và loại việc).

## Phương án đã loại

- **Cho `onSignedIn` trả hàm huỷ đăng ký** (sửa `packages/auth`). Gọn hơn về
  API, nhưng `packages/auth/**` là đường T3 — thêm một cổng duyệt kế hoạch cho
  một thay đổi ba dòng. Cờ đã-dừng trong `apps/api` cho cùng kết quả quan sát
  được; đổi lại handler vẫn nằm trong mảng sau khi ứng dụng đóng (chỉ tốn bộ
  nhớ trong tiến trình test). Đáng gửi lên hãng sau, cùng lúc với bản vá này.
- **Xoá hết `AgentTask` ở `afterAll` của gói api.** Che triệu chứng, không
  chữa nguồn; và xoá cả dòng của file khác.
- **Ép thứ tự file để tái hiện CI.** `bun test` không giữ thứ tự tham số.

## Chứng

Năm phép đo, đều chạy trong cơ sở dữ liệu riêng của lượt (`bun run test -- …`):
đếm sót sau hai file điều phối; hai ứng dụng một lần đăng nhập (đã đóng vs
đang chạy); đường quét thật; một liên hệ lẻ gieo trước `go-la-cat-quyen`; và cả
gói api một lượt rồi đếm dòng `AgentTask` chưa xong. Chiều đỏ của mỗi phép đo
chạy trên mã trước vá (cây tạm từ `onehub`).
