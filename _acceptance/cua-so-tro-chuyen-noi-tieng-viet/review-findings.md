# Phát hiện của vòng chấm — cua-so-tro-chuyen-noi-tieng-viet

Vòng chấm ngày 06/09, chạy tuần tự từng lệnh (điều khoản CLASSIFIER-FALLBACK).

## Trong hợp đồng

Năm lỗi bắt được trong lúc thi công, tất cả đã vá.

- **Chỉ thị `"use client"` bị đẩy xuống dưới import** — AC: AC-1.
  Đặt sai là component thành server và cả màn hỏng. Bộ quét thấy nó biến thành
  một chuỗi thường và gọi tên.
- **Bốn chỗ thay biểu thức vào bên trong dấu nháy** — AC: AC-1.
  `?? "{t.man.boDung}"` — trong JSX thế là chuỗi, màn sẽ in ra nguyên dấu ngoặc.
  Một trong bốn còn biến một lệnh gạch chéo thành chuỗi hỏng.
- **Suýt khai `status` là tên thuộc tính kỹ thuật** — AC: AC-2.
  Cùng tên đó còn mang `"Live"` và `"Private"` là chữ người đọc; khai nó là làm
  hai chuỗi ấy biến mất khỏi mọi phép đo. Bỏ khai, nối cả hai vào kho.
- **Chép một script sang lát này** — AC: AC-12.
  `mot-bo-thuoc.mjs` chép của đợt một rồi đổi slug — đúng thứ chân đó canh, và
  bản chép còn kiểm nhầm ổ cắm của hồ sơ kia. Đã viết mới.
- **Một chiều đỏ suýt được ghi mà chưa từng chạy** — AC: AC-7b.
  Lệnh xoá `translate="no"` không khớp định dạng nên không xoá gì, và chân trả
  xanh. Làm lại đúng: mã 1, gọi đúng `file:dòng`.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **AC-8 của hồ sơ đợt một hứa một phép đo không tồn tại**
  Người dùng thấy gì: hợp đồng đã ký nói rằng máy canh việc chữ của đợt một rò sang vùng hoãn, nhưng không có dòng mã nào làm việc đó — thứ duy nhất tồn tại là một câu máy tự in ra nói rằng nó có canh.
  file: `_acceptance/man-cai-dat-noi-tieng-viet/rang/khai-sinh.mjs`
  severity: P1
  Đề xuất: known-limits — vế ấy sau vòng này không còn đối tượng vì sáu dòng đã chuyển sang bàn giao, và câu log sai đã gỡ; nhưng bằng chứng đã ký của đợt một vẫn hứa nhiều hơn nó đo
- **Đóng màn lẫn tiếng làm rỗng tập đo của một tiêu chí đã ký**
  Người dùng thấy gì: hoàn thành đợt hai lấy mất đúng những chuỗi mà một phép đo của đợt một dùng làm đối tượng, nên phép đo đó nay tự khai là chưa đo được.
  file: `_acceptance/agent-builder-noi-tieng-viet/rang/khong-dich-cua-lat.json`
  severity: P1
  Đề xuất: known-limits — vòng này dựng lại độ phủ ấy ở AC-7 của chính nó với 7 vị trí dữ liệu thật trên màn trò chuyện, nên độ phủ của kho không giảm; chỉ chỗ đo là dời
- **Màn chia sẻ hội thoại mang tên hãng gốc**
  Người dùng thấy gì: câu "Anyone in Comp AI with the link" hiện tên của hãng mà kho này đã rẽ ra, không phải tên sản phẩm của đội.
  file: `apps/app/components/agent-builder/share-chat-dialog.tsx`
  severity: P2
  Đề xuất: known-limits — đã dịch theo tên thật của sản phẩm trong vòng này; ghi lại vì đây là một quyết định về tên chứ không phải một phép dịch
- **Nhãn trợ năng đến từ mặc định của thư viện ngoài**
  Người dùng thấy gì: vùng tin nhắn có một nhãn tiếng Anh cho trình đọc màn hình mà không file nguồn nào của kho chứa nó, nên không bộ quét tĩnh nào có thể thấy.
  file: `packages/ui/src/components/message-scroller.tsx`
  severity: P2
  Đề xuất: new-contract — vòng này đã kéo nhãn đó về kho chuỗi tại chỗ gọi, nhưng lớp lỗi vẫn còn: mọi mặc định khác của thư viện vẫn vô hình với bộ quét

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
