## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **--tao drops an unmarked database of the same name, skipping the mark check that --xoa enforces**
    Người dùng thấy gì: Tạo một phiên đo mới có thể âm thầm xoá một cơ sở dữ liệu khác đã có sẵn cùng tên, kể cả khi cơ sở dữ liệu đó không do công cụ đo tạo ra.
    file: `packages/db/scripts/measure-db.ts`
    severity: medium
    Đề xuất: known-limits

- **docs/setup.md still says nothing but db:test may drop a database, and the new section right below contradicts it**
    Người dùng thấy gì: Tài liệu hướng dẫn có thể chứa hai câu mâu thuẫn nhau về việc phép đo có được phép xoá cơ sở dữ liệu hay không, khiến người đọc dễ hiểu nhầm điều gì là an toàn.
    file: `docs/setup.md`
    severity: low
    Đề xuất: known-limits

- **Inline unit literals instead of deriving from one base (AGENTS.md constants rule)**
    Người dùng thấy gì: Không có tác động tới người dùng; đây chỉ là cách viết hằng số thời gian bên trong mã nguồn.
    file: `packages/db/scripts/measure-db.ts`
    severity: low
    Đề xuất: wont-fix

- **MA_NGAT signal-exit table duplicated across the lan-do area while cau-hinh.mjs is the area's config module**
    Người dùng thấy gì: Nếu hai chỗ ghi mã thoát cho lệnh bị ngắt lệch nhau trong tương lai, người dùng có thể thấy công cụ báo hai kết quả khác nhau cho cùng một lần bấm dừng.
    file: `scripts/lan-do/tien-de.mjs`
    severity: low
    Đề xuất: wont-fix

- **phien-do.mjs re-implements tenDb that the same area already exports**
    Người dùng thấy gì: Không có tác động trực tiếp tới người dùng hiện tại; hai đoạn mã cùng làm một việc có thể lệch nhau nếu chỉ một chỗ được sửa về sau.
    file: `scripts/lan-do/phien-do.mjs`
    severity: low
    Đề xuất: wont-fix

- **The quet-mo-coi test runs a server-wide sweep dated a day ahead, so it drops other checkouts' templates and live session databases**
    Người dùng thấy gì: Chạy bộ kiểm thử đầy đủ có thể xoá mất cơ sở dữ liệu mẫu của các cây làm việc khác, hoặc làm hỏng một phiên đo đang chạy ở cây khác, khiến người phải dựng lại từ đầu hoặc thấy phép đo lỗi giữa chừng mà không rõ vì sao.
    file: `packages/db/test/measure-database.spec.ts`
    severity: high
    Đề xuất: new-contract

- **Ctrl-C or SIGTERM is ignored for up to 60 minutes while a session waits for the tree lock**
    Người dùng thấy gì: Nếu một phiên đo đang phải xếp hàng chờ tới lượt, việc bấm dừng hoặc lệnh huỷ có thể không có tác dụng gì trong tối đa một giờ.
    file: `scripts/lan-do/phien-do.mjs`
    severity: medium
    Đề xuất: new-contract

- **The template fingerprint ignores the modules seed.ts imports, so a changed seed is silently reused from the old template**
    Người dùng thấy gì: Nếu dữ liệu mẫu ban đầu của phép đo phụ thuộc vào những phần khác đã đổi, phép đo có thể vẫn chạy trên dữ liệu cũ mà không có cảnh báo nào.
    file: `packages/db/scripts/measure-db.ts`
    severity: medium
    Đề xuất: known-limits

- **The lock connection's errors are swallowed, so a dropped connection releases the tree lock with no warning**
    Người dùng thấy gì: Trong một tình huống hiếm khi kết nối cơ sở dữ liệu bị rớt giữa chừng, một phiên đo khác có thể vô tình xoá mất cơ sở dữ liệu của phiên đang chạy mà không ai được báo.
    file: `packages/db/scripts/measure-db.ts`
    severity: low
    Đề xuất: wont-fix

- **Hình dạng 4 (âm-tính-một-mình): dấu vân tay «kho chung không đổi» không có đối chứng dương nào chứng nó bắt được một lần ghi**
    Người dùng thấy gì: Lời hứa cốt lõi rằng phép đo không bao giờ ghi vào cơ sở dữ liệu chung hiện chưa có phép thử nào chứng minh công cụ thực sự phát hiện được một lần ghi nhầm; nếu có lỗi khiến nó ghi nhầm, bộ kiểm thử hiện tại có thể vẫn báo an toàn.
    file: `packages/db/test/measure-database.spec.ts`
    severity: high
    Đề xuất: new-contract

- **Hình dạng 4 (âm-tính-một-mình): «hai cổng không còn ai nghe» đo bằng lsof mà đối chứng dương khai kèm lại không chạy lsof**
    Người dùng thấy gì: Cách kiểm tra 'không còn tiến trình chiếm cổng sau khi dọn' hiện chưa được chứng minh là thực sự phát hiện được một tiến trình còn sống; nếu cách đo bị sai, bộ kiểm thử có thể báo đã dọn sạch dù cổng thực ra vẫn bị chiếm.
    file: `_acceptance/do-man-tren-kho-rieng/rang/phien.mjs`
    severity: medium
    Đề xuất: new-contract

- **Hình dạng 4: «máy chủ cũ đã chết trước khi phiên kế chạy lệnh» đo pid đầu nhóm, trong khi đối chứng dương đo cả nhóm tiến trình**
    Người dùng thấy gì: Việc kiểm tra 'các tiến trình máy chủ cũ đã bị dọn hết trước khi phiên kế tiếp chạy' hiện chỉ soi một phần của nhóm tiến trình; nếu tiến trình chính bị dừng nhưng tiến trình con vẫn sống, phép đo có thể vẫn báo là đã dọn sạch.
    file: `_acceptance/do-man-tren-kho-rieng/rang/do-trong-phien.mjs`
    severity: medium
    Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).