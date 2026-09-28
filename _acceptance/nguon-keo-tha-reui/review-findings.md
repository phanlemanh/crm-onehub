## Trong hợp đồng

Không có phát hiện nào được ánh xạ vào AC ở vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Label copy repeats the new button: «Kéo tệp vào đây, hoặc chọn tệp» sits next to «Chọn tệp»**
    Người dùng thấy gì: Nhãn hướng dẫn kéo-thả nhắc lại đúng chữ 'chọn tệp' đã có sẵn trên nút bên cạnh, nghe hơi thừa nhưng không ảnh hưởng đến việc dùng tính năng.
    file: `apps/app/lib/messages/tai-lieu.ts:413`
    severity: low
    Đề xuất: known-limits

- **Vendored useFileUpload leaks a blob URL for every Word/PDF file chosen**
    Người dùng thấy gì: Mỗi tệp Word hoặc PDF được chọn trong hộp tải giữ lại một vùng nhớ tạm cho đến khi người dùng đóng trang, có thể khiến trang chạy nặng dần nếu mở rất lâu.
    file: `packages/ui/src/hooks/use-file-upload.ts:129`
    severity: low
    Đề xuất: known-limits

- **Hidden bug in the shared useFileUpload hook: one duplicate file silently drops the whole batch in multiple mode**
    Người dùng thấy gì: Nếu sau này có nơi khác trong hệ thống bật tính năng chọn nhiều tệp cùng lúc, chọn trùng một tệp có thể khiến toàn bộ các tệp khác vừa chọn bị mất âm thầm, không có thông báo lỗi nào.
    file: `packages/ui/src/hooks/use-file-upload.ts:201`
    severity: low
    Đề xuất: known-limits

- **The re-select test cannot catch the bug it is named for (input value not being reset)**
    Người dùng thấy gì: Bài kiểm tra cho tình huống 'chọn lại đúng tệp vừa bị từ chối' không thực sự phát hiện được nếu chức năng đó bị hỏng, nên nhóm có thể yên tâm nhầm rằng nó vẫn hoạt động tốt dù thực tế chưa chắc.
    file: `packages/ui/test/nguon-keo-tha.dom.tsx:140`
    severity: low
    Đề xuất: known-limits

- **Hình dạng 5 — E2 hứa «không tự khai bộ bắt DragEvent nào» (cả lớp) nhưng chỉ đo một thẻ và một dòng import**
    Người dùng thấy gì: Phép đo tự động cho quy tắc 'không tự viết cách bắt kéo-thả riêng' chỉ kiểm một phần nhỏ của tệp, nên nếu sau này ai đó vô tình vi phạm quy tắc này ở chỗ khác trong cùng tệp, hệ thống có thể không phát hiện ra.
    file: `_acceptance/nguon-keo-tha-reui/rang/cai-sach.mjs:238`
    severity: medium
    Đề xuất: known-limits

- **Hình dạng 5 — chiều đỏ của E2 chỉ phá onDrop; nhánh getInputProps và nhánh DragEvent chưa lần nào được thấy đỏ**
    Người dùng thấy gì: Phép đo tự động chưa được thử đủ các kiểu sai để chắc chắn nó thực sự bắt được lỗi, nên một số cách mã nguồn bị sai âm thầm có thể lọt qua mà không bị phát hiện.
    file: `_acceptance/nguon-keo-tha-reui/rang/cai-sach.mjs:277`
    severity: medium
    Đề xuất: known-limits

- **Hình dạng 2 — ca «chọn lại đúng tệp vừa bị từ chối vẫn báo lại» tự dựng sự kiện change, bỏ qua cơ chế trình duyệt mà lời hứa dựa vào**
    Người dùng thấy gì: Bài kiểm tra 'chọn lại đúng tệp vừa bị từ chối' mô phỏng theo cách khác với cách trình duyệt thật hoạt động, nên có thể báo kết quả tốt dù tính năng này chưa chắc hoạt động đúng khi người dùng thật thao tác.
    file: `packages/ui/test/nguon-keo-tha.dom.tsx:140`
    severity: medium
    Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
