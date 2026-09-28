## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **tran-gio.mjs can-cu: an unreadable or all-fail CI table crashes with exit 1 (red) instead of exit 2 (cannot measure)**
    Người dùng thấy gì: Nếu bảng số đo tốc độ CI bị trống hay hỏng, công cụ kiểm tra sẽ báo lỗi giống như tính năng đang hỏng, thay vì báo đúng là không đo được, dễ khiến người xem báo cáo hiểu nhầm mức độ nghiêm trọng.
    file: `_acceptance/lai-ra-man-tran-gio/rang/tran-gio.mjs`
    severity: low
    Đề xuất: known-limits

- **tran-gio.mjs duplicates GOC and the spec read, and hard-codes its mutation values instead of putting them in CAU_HINH**
    Người dùng thấy gì: Một vài con số cấu hình dùng để đo tốc độ được viết lặp lại ở hai nơi thay vì gom về một chỗ, nên sau này ai đổi ngưỡng dễ sửa sót mà không hay biết.
    file: `_acceptance/lai-ra-man-tran-gio/rang/tran-gio.mjs`
    severity: low
    Đề xuất: wont-fix

- **A timed-out lai test can leave console.error muted for the rest of the bun process**
    Người dùng thấy gì: Nếu một lượt kiểm tra từng bị treo quá lâu, thông báo lỗi thật ở những màn kiểm tra chạy sau đó trong cùng một lượt có thể bị nuốt mất, khiến người xem tưởng mọi thứ ổn dù thực ra có lỗi.
    file: `packages/ui/test/lai-ra-man.spec.tsx`
    severity: medium
    Đề xuất: new-contract

- **Unexpected read/parse errors exit 1 (FAIL) instead of 2 (could not measure)**
    Người dùng thấy gì: Khi dữ liệu đo bị thiếu hay hỏng theo một số cách khác, công cụ kiểm tra dừng đột ngột và báo như thể tính năng lỗi, thay vì báo rõ là không đo được, gây hiểu nhầm về nguyên nhân thật.
    file: `_acceptance/lai-ra-man-tran-gio/rang/tran-gio.mjs`
    severity: low
    Đề xuất: known-limits

- **Shape 5 (claims a class sweep but the sweep has a hole): E1 claims to check every test(...) call, but its filter silently drops some calls, so the 3-case anchor still passes**
    Người dùng thấy gì: Cách rà soát tự động hiện chỉ nhận diện một số kiểu khai báo ca kiểm tra; nếu sau này có người thêm một ca kiểm tra viết theo kiểu khác, công cụ có thể không phát hiện ra ca đó thiếu giới hạn thời gian, dù đáng lẽ phải bắt được.
    file: `_acceptance/lai-ra-man-tran-gio/rang/cay.mjs`
    severity: medium
    Đề xuất: new-contract

- **Shape 2 (hand-written fixture with no round trip): bang-do-ci.json is a table typed up from CI logs, and no script re-extracts it from `gh run view --log`**
    Người dùng thấy gì: Bảng số liệu dùng để tính ngưỡng thời gian được gõ tay từ nhật ký CI thay vì lấy lại tự động từ nguồn gốc, nên một sai sót khi gõ tay có thể lọt qua mà không ai nhận ra, làm ngưỡng thời gian bị tính sai.
    file: `_acceptance/lai-ra-man-tran-gio/rang/bang-do-ci.json`
    severity: low
    Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
