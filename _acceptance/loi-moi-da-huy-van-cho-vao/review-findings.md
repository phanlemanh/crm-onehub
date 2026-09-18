# Review Findings: loi-moi-da-huy-van-cho-vao

## Trong hợp đồng

### Thước E5 dùng regex /"([a-z]+)"/ nên âm thầm bỏ qua trạng thái mới có dấu gạch hoặc chữ số
- file: `_acceptance/loi-moi-da-huy-van-cho-vao/rang/tu-vung-goi.mjs:72`
- severity: low
- AC: AC-5
- source: bugs

tu-vung-goi.mjs:72 trích tập trạng thái của gói bằng [...dong.matchAll(/"([a-z]+)"/g)]. Regex đòi toàn bộ phần trong ngoặc kép là [a-z]+, nên bất kỳ giá trị nào chứa `_`, `-`, chữ số hay chữ hoa đều KHÔNG khớp và bị loại khỏi tapGoi trong im lặng — không phải loại thành lỗi.

Kiểm chứng: với dòng `InvitationStatus = "pending" | "accepted" | "rejected" | "canceled" | "auto_expired"`, script trích ra đúng 4 giá trị, thua = [] và thieu = [], rồi in "DAT: hai tap bang nhau, 4 trang thai" và exit 0. Tức là better-auth thêm một trạng thái mới tên có gạch dưới thì E5 — phép đo duy nhất của AC-5, vốn tồn tại chỉ để bắt đúng loại trôi này — báo xanh và khẳng định hai tập bằng nhau trong khi kho đang thiếu một trạng thái.

Giảm nhẹ: lưới compile-time BangNhau ở packages/auth/src/invitation-status.ts:9 vẫn bắt được lượt trôi đó khi chạy check-types, nên trôi không lọt hẳn. Nhưng E5 sẽ in bằng chứng sai. Sửa: nới regex thành /"([^"]+)"/g (áp cho cả dòng 82).

### Hình dạng 2 (không round-trip, tự viết bộ đọc thay vì dùng giá trị thật): thước E5 rút tập của kho bằng regex trên VĂN BẢN nguồn, giá trị có gạch/số/hoa bị nuốt im nên chiều đỏ số 1 của chính E5 không thành
- file: `_acceptance/loi-moi-da-huy-van-cho-vao/rang/tu-vung-goi.mjs:82`
- severity: high
- AC: AC-5
- source: measurement

Dòng 74–82 đọc `packages/validation/src/invitation-status.ts` như chuỗi rồi rút tập bằng `/TRANG_THAI_LOI_MOI = \[([^\]]*)\]/` và `/"([a-z]+)"/g`, thay vì import chính hằng mà mã chạy dùng. Lớp ký tự `[a-z]+` chỉ khớp chuỗi toàn chữ thường: một giá trị như "gia-mao", "pending_review", "Canceled" hay "status2" KHÔNG khớp và biến mất khỏi `tapKho`. Đã thử trên cùng regex: thêm "gia-mao" vào mảng thì tập rút ra vẫn đúng bốn phần tử ['pending','accepted','rejected','canceled'], `thua` rỗng, thước in DAT và thoát mã 0. Đúng cái mà E5 khai là chiều đỏ số một — «thêm một giá trị giả vào tập của kho thì mã 1 và in đúng giá trị thừa» — nên chiều đỏ đó không thành với bất kỳ cách viết nào ngoài một từ chữ thường liền. Cùng lỗ hổng ở dòng 72 cho phía gói. Import module (hoặc đọc qua bun/tsx rồi so mảng thật) thì không có lớp ký tự nào để lọt.

### Hình dạng 1 (đo khâu trung gian thay vì ĐẦU RA lời hứa nói tới): ma trận «trục B» đo `conHieuLuc`, không đo `decideSignIn` — đổi danh sách trắng thành danh sách cấm bài vẫn xanh
- file: `packages/auth/test/loi-moi-ket-thuc.spec.ts:34`
- severity: medium
- AC: AC-3
- source: measurement

E8 khai đây là «MA TRẬN TOÀN PHẦN của trục B» với sáu ô cho-vào/từ-chối, khai `paths` gồm `packages/auth/src/allow-list.ts`, và khai chiều đỏ «đổi luật từ danh sách trắng sang danh sách cấm thì đỏ ở ô rác». Nhưng vòng lặp dòng 32–38 chỉ gọi `conHieuLuc(docTrangThai(chuoi).trangThai)` — một vị từ thuần trong `packages/validation`, tautology với `CON_HIEU_LUC.includes(value)`. Luật danh sách trắng thật sống ở `allow-list.ts` dòng 72–75 (`conHieuLuc(candidate.status)` bên trong `decideSignIn`), và file test này không gọi `decideSignIn` trong describe đó (chỉ `huy-qua-goi`/`tu-choi-loi-moi`/`du-lieu-cu` mới gọi, và chỉ ở chiều âm). Đổi `decideSignIn` sang danh sách cấm (`candidate.status !== "canceled"`) thì cả sáu ô vẫn xanh, kể cả ô "rac" mà E8 chỉ đích danh. E8 còn khai «không có nó thì một bản sửa từ chối tất cả mọi người vẫn làm mọi eval khác xanh» — không đúng: đối chứng dương thật nằm ở E9 (`loi-moi-ket-thuc.integration.spec.ts` dòng 127–135, pending sinh đúng 1 dòng). Muốn đúng lời hứa thì cột `mong` phải đọc từ `dungThu(...).allowed`.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Trạng thái huỷ được ghi bằng chỉ số mảng TRANG_THAI_LOI_MOI[3] — thứ tự không ai canh**
  Người dùng thấy gì: Nếu sau này có người sắp xếp lại danh sách trạng thái nội bộ cho gọn, nút "Thu hồi" và luồng xoá thành viên có thể vô tình ghi sai trạng thái, khiến người vừa bị gỡ quyền lại được cấp quyền trở lại.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: high
  Đề xuất: known-limits

- **toStatus nuốt lỗi phân tích: .loi bị bỏ, API im lặng trả "unknown"**
  Người dùng thấy gì: Khi một lời mời có trạng thái không đọc được, quản trị viên chỉ thấy chữ "không rõ" trên màn hình mà không có manh mối gì trong nhật ký hệ thống để tìm hiểu vì sao.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: medium
  Đề xuất: known-limits

- **CON_HIEU_LUC không được dùng ở chính hai truy vấn quyết định "còn hiệu lực"**
  Người dùng thấy gì: Nếu sau này danh sách trạng thái hợp lệ được mở rộng, một số màn hình khác (chặn trùng lời mời, gỡ thành viên) có thể không cập nhật theo, gây lời mời trùng hoặc quên thu hồi khi gỡ người.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Eval E2 khai một assert "từ chối đo" mà bài test không có**
  Người dùng thấy gì: Bài kiểm tự động cho tình huống "từ chối lời mời" báo đã kiểm đủ, nhưng thực ra thiếu một phép kiểm đã hứa, nên một loại lỗi liên quan có thể lọt qua mà không ai hay.
  file: `_acceptance/loi-moi-da-huy-van-cho-vao/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Không có migration cho các hàng "cancelled" cũ — chúng thành unknown và spam console.error**
  Người dùng thấy gì: Những lời mời từng bị huỷ theo cách ghi cũ sẽ luôn hiện là "không rõ" và tạo một dòng lỗi trong nhật ký hệ thống mỗi lần người đó thử đăng nhập, dù không có gì thực sự hỏng.
  file: `packages/validation/src/invitation-status.ts`
  severity: low
  Đề xuất: known-limits

- **ALLOWANCE_STATUSES chép tay lại từ vựng vừa được tập trung**
  Người dùng thấy gì: Danh sách trạng thái lời mời trả ra ngoài API được chép tay ở một chỗ riêng; nếu quên cập nhật đồng bộ, ứng dụng khách có thể thiếu một trạng thái mới mà không có cảnh báo.
  file: `apps/api/src/workspace/workspace.contracts.ts`
  severity: low
  Đề xuất: known-limits

- **console.error in kèm địa chỉ email của người dùng**
  Người dùng thấy gì: Địa chỉ email của người dùng đang bị ghi thẳng vào nhật ký hệ thống mỗi khi có lời mời với trạng thái lỗi, làm lộ thông tin cá nhân trong log không cần thiết.
  file: `packages/auth/src/allow-list.ts`
  severity: low
  Đề xuất: new-contract

- **revokeAllowance ghi TRANG_THAI_LOI_MOI[3] theo vị trí, và mọi test kiểm giá trị ghi đều so với chính biểu thức đó (tautology)**
  Người dùng thấy gì: Nếu sau này có người sắp xếp lại danh sách trạng thái nội bộ, nút "Thu hồi truy cập" có thể vô tình cấp lại quyền cho đúng người vừa bị gỡ thay vì thu hồi, và các bài kiểm hiện tại sẽ không phát hiện ra vì chúng tự so với chính giá trị đã ghi.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Dòng cũ mang "cancelled" bị coi là không đọc được, nên mỗi lượt đăng nhập của người từng bị thu hồi in một dòng console.error**
  Người dùng thấy gì: Những lời mời từng bị huỷ theo cách ghi cũ sẽ khiến hệ thống ghi một dòng lỗi vào nhật ký mỗi lần người đó đăng nhập, mãi mãi, dù việc từ chối cho vào vẫn đúng.
  file: `packages/auth/src/allow-list.ts`
  severity: medium
  Đề xuất: known-limits

- **E9 có thể xanh rỗng vì ensureWorkspaceMembership nuốt mọi exception**
  Người dùng thấy gì: Một bài kiểm tra tự động có thể báo "đạt" ngay cả khi có lỗi hạ tầng khiến việc gỡ quyền không thực sự chạy, làm giảm độ tin cậy của bằng chứng đã ký duyệt.
  file: `packages/auth/test/loi-moi-ket-thuc.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc, không round-trip): bài «du-lieu-cu» nạp giá trị ĐÃ ĐƯỢC READER chuẩn hoá, chuỗi cancelled thật không bao giờ tới quyết định**
  Người dùng thấy gì: Chưa có phép kiểm nào chạy đúng theo đường thật (từ dữ liệu trong bảng tới quyết định đăng nhập) để chứng minh dữ liệu lời mời huỷ theo cách ghi cũ vẫn bị chặn; kết luận "đã kiểm" một phần dựa vào suy luận thay vì đo trực tiếp.
  file: `packages/auth/test/loi-moi-ket-thuc.spec.ts`
  severity: high
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/14 lỗi rơi vào file không bộ đo nào phủ (_acceptance/loi-moi-da-huy-van-cho-vao/evals.yaml, packages/validation/src/invitation-status.ts, apps/api/src/workspace/workspace.contracts.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
