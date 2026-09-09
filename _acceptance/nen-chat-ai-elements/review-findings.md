## Trong hợp đồng

- **Đối chứng đỏ vô hiệu — E10 ghim bg-accent làm ca chứng minh "không phải danh sách đen", nhưng bg-accent đã có sẵn trong cây và răng vẫn xanh**
  file: `_acceptance/nen-chat-ai-elements/evals.yaml:181`
  severity: medium
  AC: AC-6
  detail: evals.yaml E10 dòng 181-183 khai: "(b) đặt bg-accent — một lớp CHƯA TỪNG có trong kho, không nằm trong bất kỳ danh sách đen nào — vào message.tsx -> mã 1, nêu nguyên văn 'bg-accent'. Vế (b) xanh trước bg-accent nghĩa là phép đo vẫn đang chạy danh sách đen." Cả hai vế của tiền đề đều sai, và tôi đã chạy thử để chắc:

  1. `hover:bg-accent` ĐANG NẰM trong cây, ở packages/ui/src/components/ai-elements/message.tsx:400 — nên nó không phải "lớp chưa từng có trong kho".
  2. Danh sách trắng của mau-ban-kinh.mjs không dựng từ bảng của docs/design.md như AC-6 khai (dòng 129-134 của contract.md), mà từ mọi `--color-*` trong packages/ui/src/styles/globals.css (mau-ban-kinh.mjs:146-152, 162-166). globals.css:113 khai `--color-accent`, nên `laToken("accent", bang)` trả true.

  Chép cây ra sân riêng rồi chèn `bg-accent` trần vào message.tsx:400 → răng in "VE MAU — xet 21 lop mang o mau, ngoai bang: 0", thoát 0. Cùng sân đó chèn `text-amber-500` → thoát 1, in đích danh. Nghĩa là răng đúng là danh sách trắng (amber bị bắt), nhưng ĐÚNG cái lớp mà gap-probe.md dòng P1 nêu là kịch bản hồi quy phải chặn ("chiều ngược: conversation kéo tươi mang về bg-accent") lại lọt, và hồ sơ ghi E10 PASS với baseline red như thể đối chứng đó đã chạy đỏ. AC-6 còn dẫn "bảng của docs/design.md" — docs/design.md không có bảng token nào; mau-ban-kinh.mjs chỉ đọc nó để kiểm bốn chữ `rounded-*` còn được nêu (dòng 242-250), không lấy tên màu từ đó.
  rationale: AC-6 quy định rõ danh sách trắng màu phải là token có tên trong "bảng của docs/design.md", nhưng docs/design.md không có bảng token nào và công cụ đo thực tế lấy danh sách trắng từ globals.css — lệch đúng cơ chế mà AC-6 quy định bằng chữ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Xoá component nhưng để lại phụ thuộc duy nhất của chúng trong packages/ui/package.json**
  Người dùng thấy gì: Ba gói phần mềm không còn được dùng vẫn nằm trong danh sách phụ thuộc của kho, làm bản cài đặt nặng hơn một chút nhưng không ảnh hưởng gì tới màn chat người dùng thấy.
  file: `packages/ui/package.json`
  severity: medium
  Đề xuất: known-limits

- **gate-shape.json khai lý do sai sự thật cho răng pham-vi-diff**
  Người dùng thấy gì: Ghi chú nội bộ giải thích vì sao một phép kiểm phạm vi thay đổi bị để ngoài cổng bảo vệ đang nêu lý do sai — phép kiểm đó thực ra đã chạy được, nhưng ghi chú khiến người đọc sau tưởng nó không chạy được nên không đưa vào cổng.
  file: `.githooks/gate-shape.json`
  severity: medium
  Đề xuất: known-limits

- **Tool call thất bại bị nuốt thành thành công khi errorText rỗng**
  Người dùng thấy gì: Khi một hành động của trợ lý AI thất bại nhưng hệ thống không có sẵn dòng mô tả lỗi cụ thể, màn hình chat có thể hiển thị như hành động đó đã hoàn tất bình thường, khiến người dùng không biết là có lỗi xảy ra.
  file: `packages/ui/src/lib/eve-to-ai-sdk.ts`
  severity: high
  Đề xuất: new-contract

- **revokeObjectURL gọi ngay sau click có thể huỷ tệp tải về**
  Người dùng thấy gì: Tải xuống bản ghi trò chuyện có thể lỗi hoặc trả về tệp rỗng khi dùng trình duyệt Firefox hoặc Safari, dù vẫn hoạt động bình thường trên Chrome.
  file: `packages/ui/src/components/ai-elements/conversation.tsx`
  severity: low
  Đề xuất: known-limits

- **Lý do khai notInGate cho pham-vi-diff đã sai sự thật**
  Người dùng thấy gì: Ghi chú nội bộ giải thích vì sao một phép kiểm phạm vi thay đổi bị để ngoài cổng bảo vệ đang nêu lý do sai — phép kiểm đó thực ra đã chạy được, nhưng ghi chú khiến người đọc sau tưởng nó không chạy được nên không đưa vào cổng.
  file: `.githooks/gate-shape.json`
  severity: low
  Đề xuất: known-limits

- **Fixture round-trip có thật nhưng E8 không chạy nó — lệnh của E8 chỉ chạy bên ĐỌC, chiều đỏ đã khai không thể bật**
  Người dùng thấy gì: Bằng chứng tự động cho việc chuyển đổi hội thoại có thể không thực sự kiểm tra đúng phần đọc dữ liệu như tài liệu nội bộ khai, nên nếu có lỗi ẩn ở đó thì bằng chứng này sẽ không bắt được — dù bộ kiểm thử đầy đủ khác của kho vẫn phủ được phần đó.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).