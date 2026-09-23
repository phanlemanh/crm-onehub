# Review findings — bo-dung-chung-nhan-chuoi (vòng chấm 6)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Sort arrow sits inside the line-clamp-2 label, so a clamped left-aligned header hides its sort direction**
    Người dùng thấy gì: Với những tiêu đề cột quá dài bị rút gọn thành hai dòng, mũi tên báo đang sắp xếp tăng hay giảm có thể bị che mất, khiến người dùng không còn thấy hướng sắp xếp dù bảng vẫn sắp đúng thứ tự.
    file: `packages/ui/src/components/data-table.tsx:712`
    severity: medium
    Đề xuất: known-limits

- **Arrow-distance and edge checks silently skip when the svg is hidden or no text rects are found, yet still count as passed**
    Người dùng thấy gì: Phép đo tự động dùng để kiểm tra vị trí mũi tên sắp xếp có thể bỏ qua việc kiểm tra mà không báo lỗi khi mũi tên bị ẩn, nên một lỗi hiển thị tương tự ở lần sau có nguy cơ lọt qua mà không ai phát hiện.
    file: `_acceptance/tieu-de-cot-doc-tron/rang/tieu-de-cot.mjs:208`
    severity: low
    Đề xuất: known-limits

- **chup.mjs swallows the table-load timeout and takes the E9 screenshot anyway**
    Người dùng thấy gì: Ảnh chụp dùng làm bằng chứng cho một phần kiểm tra có thể được lưu và coi là hợp lệ ngay cả khi trang chưa tải xong hoặc đã chuyển sang một địa chỉ khác, nên tấm ảnh đó không còn chắc chắn phản ánh đúng màn hình cần xét duyệt.
    file: `_acceptance/tieu-de-cot-doc-tron/rang/chup.mjs:24`
    severity: low
    Đề xuất: known-limits

- **Stale-lock takeover in mot-luot.sh can let two runs proceed concurrently**
    Người dùng thấy gì: Nếu một lượt đo trước đó bị dừng đột ngột, một lượt đo mới có thể vô tình chạy chồng lên một lượt khác cùng lúc mà không ai được cảnh báo, làm kết quả của lần đo đó không còn đáng tin.
    file: `_acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh:8`
    severity: low
    Đề xuất: known-limits

- **Shape 4 (negative-only assertion, no positive control): the E3/E1(b) arrow checks pass silently when the svg or text box is missing**
    Người dùng thấy gì: Nếu mũi tên sắp xếp trên tiêu đề một cột nào đó biến mất hoặc bị ẩn đi, phép đo tự động vẫn có thể tính là đạt, nên một lỗi hiển thị như vậy có nguy cơ không bị phát hiện ở các lần kiểm tra sau.
    file: `_acceptance/tieu-de-cot-doc-tron/rang/tieu-de-cot.mjs:370`
    severity: medium
    Đề xuất: known-limits

- **Shape 6 (measures another tree instead of the tree under test): chup.mjs for E9 has no canhCay guard, and the lsof step checks fixed ports that may not match APP_URL**
    Người dùng thấy gì: Nếu máy đang có sẵn một phiên bản khác của ứng dụng chạy ở cùng địa chỉ mặc định, ảnh chụp làm bằng chứng cho phần này có thể vô tình chụp nhầm phiên bản đó thay vì đúng bản đang được xét duyệt.
    file: `_acceptance/tieu-de-cot-doc-tron/rang/chup.mjs:3`
    severity: medium
    Đề xuất: known-limits

- **Shape 1/3 (measures a class name instead of output): the AC-7 test in data-table-locale.spec.tsx only checks for the string class="line-clamp-2" in the SSR markup**
    Người dùng thấy gì: Bài kiểm tự động cho việc rút gọn tiêu đề cột dài chỉ kiểm tra tên một lớp giao diện chứ chưa thật sự kiểm tra chữ có bị cắt đúng hay không, nên nếu tính năng này bị hỏng ở đúng chỗ đó trong tương lai, bài kiểm này sẽ không phát hiện ra.
    file: `packages/ui/test/data-table-locale.spec.tsx:98`
    severity: low
    Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 5/7 lỗi rơi vào file không bộ đo nào phủ (_acceptance/tieu-de-cot-doc-tron/rang/tieu-de-cot.mjs, _acceptance/tieu-de-cot-doc-tron/rang/chup.mjs, _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
