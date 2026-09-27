## Trong hợp đồng



## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The script that checks signed dossiers stay untouched diffs against the current tip of origin/onehub instead of the branch point, so it can go red for changes this branch never made**
    Người dùng thấy gì: Trong tương lai, việc gộp tính năng này có thể bị chặn nhầm bởi lỗi 'xung đột' giả, dù tính năng không đụng đến hồ sơ nào khác.
    file: `_acceptance/ha-tran-thang-hoi-zalo/rang/khong-cham-da-ky.mjs`
    severity: medium
    Đề xuất: known-limits

- **Phép kiểm trước-gộp báo «ok» ngay cả khi pre-merge-check hỏng giữa chừng (exit 2, không in dòng VIOLATION)**
    Người dùng thấy gì: Nếu phần công cụ kiểm tra bên trong gặp trục trặc, hệ thống có thể vẫn báo 'ổn' thay vì báo lỗi, khiến người duyệt tưởng nhầm là đã kiểm tra xong.
    file: `_acceptance/ha-tran-thang-hoi-zalo/rang/khong-cham-da-ky.mjs`
    severity: medium
    Đề xuất: known-limits

- **So sánh với đầu nhánh origin/onehub thay vì merge-base: đỏ giả khi onehub ghim lại hồ sơ đã ký**
    Người dùng thấy gì: Có rủi ro nhỏ là việc gộp tính năng này bị báo lỗi giả trong tương lai nếu phần khác của hệ thống thay đổi hồ sơ không liên quan.
    file: `_acceptance/ha-tran-thang-hoi-zalo/rang/khong-cham-da-ky.mjs`
    severity: low
    Đề xuất: known-limits

- **Shape 4 (a negative check with no positive control): the pre-merge half of khong-cham-da-ky.mjs passes when pre-merge never ran**
    Người dùng thấy gì: Nếu công cụ kiểm tra trước khi gộp bị hỏng nặng hoặc không chạy được, hệ thống vẫn có thể báo 'không có vi phạm' dù thực ra chưa kiểm tra gì, khiến người duyệt yên tâm nhầm.
    file: `_acceptance/ha-tran-thang-hoi-zalo/rang/khong-cham-da-ky.mjs`
    severity: high
    Đề xuất: new-contract

- **Shape 5 (claims a class but tests only point cases): the khong-tinh case covers 4 of the 6 statuses that should not count, and does not check that dang-hoi counts**
    Người dùng thấy gì: Một vài loại tin nhắn hiếm gặp chưa được kiểm chứng rõ có bị tính vào giới hạn tháng hay không, dù các loại phổ biến đã được kiểm chứng đúng.
    file: `apps/agent/test/tran-thang-hoi-zalo.integration.spec.ts`
    severity: medium
    Đề xuất: known-limits

- **Shape 2 (hand-written fixture in the reader's format): gieo() writes ketQua as a free string, so the not-counted half cannot tell real statuses from typos**
    Người dùng thấy gì: Nếu sau này có người gõ nhầm tên trạng thái khi sửa code, phép kiểm tra hiện tại có thể không phát hiện ra, dù hành vi thật đã sai.
    file: `apps/agent/test/tran-thang-hoi-zalo.integration.spec.ts`
    severity: medium
    Đề xuất: known-limits

- **Shape 4 (control check without a pinned message): the baseline control in tai-lieu.mjs accepts any failure, so it does not prove the 'no more 1.500' check has teeth**
    Người dùng thấy gì: Bài kiểm đối chứng cho tài liệu có thể báo đúng dù đang kiểm nhầm lý do, nên nếu sau này ai đó vô tình làm hỏng phần kiểm số cũ, hệ thống có thể không phát hiện ra.
    file: `_acceptance/ha-tran-thang-hoi-zalo/rang/tai-lieu.mjs`
    severity: low
    Đề xuất: known-limits

- **Shape 3 (asserts substrings where the promise is a relation): the 4b row in lo-trinh is checked with four independent includes**
    Người dùng thấy gì: Nếu sau này ai đó vô tình ghi ngược chiều quyết định trong tài liệu theo dõi (ví dụ ghi thành tăng thay vì giảm), phép kiểm tra hiện tại có thể không phát hiện ra.
    file: `_acceptance/ha-tran-thang-hoi-zalo/rang/tai-lieu.mjs`
    severity: low
    Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
