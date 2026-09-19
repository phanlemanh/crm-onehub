# Review Findings: cho-phep-ai-vao-o-man-hinh (round 6)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E4's mandatory "đối chứng" leg cannot fail — ensureWorkspaceMembership returns WORKSPACE_ID on every non-throwing branch**
  Người dùng thấy gì: Bài kiểm dựng để bắt lỗi khi rút quyền vào không hoạt động đúng — nó có thể báo 'đạt' ngay cả khi tính năng rút quyền bị hỏng thật sự, nên một lỗi ở đây có thể lọt qua mà không ai biết.
  file: `_acceptance/cho-phep-ai-vao-o-man-hinh/evals.yaml`
  severity: high
  Đề xuất: known-limits

- **E13's seeding step is ordered after both screenshot steps, though the admin frame cannot exist without it**
  Người dùng thấy gì: Nếu làm lại đúng theo các bước đã ghi, ảnh chụp màn hình quản trị dùng làm bằng chứng có thể chụp phải một bảng còn trống, khiến bằng chứng không còn phản ánh đúng giao diện thật.
  file: `_acceptance/cho-phep-ai-vao-o-man-hinh/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **E13 evidence uses an owner session where the eval requires role `admin`; the report labels Owner as "đúng phiên vai admin"**
  Người dùng thấy gì: Bằng chứng cho thấy vai quản trị hoạt động đúng thực ra được chụp từ tài khoản chủ sở hữu, không phải tài khoản quản trị viên thường — nên chưa có gì xác nhận người có vai quản trị viên (không phải chủ) thực sự thao tác được.
  file: `_acceptance/cho-phep-ai-vao-o-man-hinh/evidence/E13-members-admin.png`
  severity: medium
  Đề xuất: known-limits

- **E13-network.txt replaced a captured request log with a one-line self-assertion**
  Người dùng thấy gì: Ghi chép về lỗi mạng khi chụp màn hình quản trị chỉ còn một câu khẳng định 'không thấy lỗi', không còn dữ liệu chi tiết để ai đó kiểm tra lại độc lập.
  file: `_acceptance/cho-phep-ai-vao-o-man-hinh/evidence/E13-network.txt`
  severity: medium
  Đề xuất: known-limits

- **Dead `trangThai` parameter left in choPhep, typed as loose `string` instead of TrangThaiLoiMoi**
  Người dùng thấy gì: Một tham số thừa, không còn nơi nào dùng tới, vẫn còn sót lại trong mã kiểm thử — không ảnh hưởng người dùng.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **E4 vế 4–5 (đối chứng đường tạo phiên) không có chiều đỏ — khẳng định luôn đúng bất kể sản phẩm hỏng hay không**
  Người dùng thấy gì: Bài kiểm dựng để đối chứng đường tạo phiên đăng nhập không thể bắt được lỗi thật, nên một lỗi ở khâu này có thể không bị phát hiện dù bài kiểm báo đạt.
  file: `apps/api/test/workspace-thanh-vien.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Cho phép lại một người ĐANG là thành viên để lại dòng `pending` treo vĩnh viễn — thành viên hiện tại bị liệt vào "chưa vào"**
  Người dùng thấy gì: Nếu quản trị viên cho phép lại một người vốn ĐÃ đang là thành viên, hệ thống có thể tạo ra một dòng 'đang chờ' thừa, khiến người đó bị hiển thị nhầm là 'chưa vào' dù họ vẫn đang là thành viên, và các lần cho phép sau cho đúng địa chỉ đó có thể bị từ chối vì tưởng đã có sẵn.
  file: `packages/auth/src/organization.ts`
  severity: medium
  Đề xuất: new-contract

- **Vế `doiChungConThanhVien` tự lành: `phienMoi` chạy trước nó và tái kết nạp hàng member của người đối chứng**
  Người dùng thấy gì: Do thứ tự các bước kiểm tra, một lỗi khiến tư cách thành viên của người đối chứng bị mất có thể không bị bài kiểm phát hiện, vì một bước trước đó vô tình khôi phục lại đúng dữ liệu mà bài kiểm định đo.
  file: `apps/api/test/workspace-thanh-vien.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **E4 `paths` bỏ mất `packages/auth/src/allow-list.ts` và `packages/auth/src/auth.ts` — đúng hai file mà hai vế trung tâm của test mới chạy qua**
  Người dùng thấy gì: Bài kiểm cho một phần quan trọng của tính năng không tự động chạy lại khi có người sửa đúng những file trung tâm xử lý việc cho phép vào — một lỗi ở đó có thể đi qua mà không bị bắt lại.
  file: `_acceptance/cho-phep-ai-vao-o-man-hinh/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hai khung hình bằng chứng lệch nhau ~27 phút, trái với thứ tự `verified_at` và lời khai "cùng phiên chụp" trong evidence-report**
  Người dùng thấy gì: Hai ảnh chụp dùng làm bằng chứng có thời điểm lệch nhau khoảng 27 phút so với những gì báo cáo mô tả, khiến thứ tự sự kiện trong báo cáo không khớp với chính ảnh chụp đính kèm.
  file: `_acceptance/cho-phep-ai-vao-o-man-hinh/evidence/E13-members-admin.png`
  severity: medium
  Đề xuất: known-limits

- **`phienMoi` đọc lại bằng `findFirst` theo userId và cast bỏ chính trường đang đo**
  Người dùng thấy gì: Cách đọc lại dữ liệu trong bài kiểm không đủ chặt chẽ — nếu có nhiều hơn một bản ghi liên quan, bài kiểm có thể đọc nhầm bản ghi và cho kết quả không đáng tin, dù đây chỉ ảnh hưởng nội bộ bài kiểm, không ảnh hưởng người dùng.
  file: `apps/api/test/workspace-thanh-vien.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Tham số `trangThai` mới của `choPhep` là code chết — người dùng duy nhất của nó bị xoá trong cùng diff**
  Người dùng thấy gì: Một tham số thừa khác, không còn nơi nào dùng tới, vẫn còn sót lại trong mã kiểm thử — không ảnh hưởng người dùng.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **E13-network.txt thu về một dòng khẳng định, không khai origin/cổng — không chứng minh được nó đo cây đang xét**
  Người dùng thấy gì: Ghi chép về mạng cho bằng chứng thiếu thông tin cổng/địa chỉ đang đo, nên không ai đọc lại có thể chắc chắn bằng chứng đó đo đúng bản đang xét chứ không phải một bản đang chạy sẵn ở máy khác.
  file: `_acceptance/cho-phep-ai-vao-o-man-hinh/evidence/E13-network.txt`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — assert "hằng có mặt" trong khi lời hứa là quan hệ: vế 4 của `rut-khong-dung-da-vao` là tautology, không bao giờ đỏ được**
  Người dùng thấy gì: Cùng một bài kiểm đối chứng ở trên (vế 4) — nó không thể bắt được lỗi thật vì phép so sánh dùng một giá trị luôn cố định, không phải giá trị phản ánh đúng trạng thái sản phẩm.
  file: `apps/api/test/workspace-thanh-vien.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 6 — đường dẫn hardcode ROOT: `inputs` của E14 ghim tuyệt đối vào worktree của tác giả**
  Người dùng thấy gì: Một cấu hình đo dùng đường dẫn cố định trỏ vào đúng một bản sao trên máy của người viết; chạy lại trên một máy hoặc một bản sao khác, phần đo này có thể đọc nhầm file hoặc báo lỗi mà không ai để ý.
  file: `_acceptance/cho-phep-ai-vao-o-man-hinh/s4-args.json`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — đối chứng dương bắt buộc không với tới được: bước gieo dòng của E13 đặt SAU cả hai bước chụp**
  Người dùng thấy gì: Trùng với phát hiện ở trên: nếu làm đúng theo thứ tự các bước đã ghi, ảnh chụp bằng chứng cho quản trị viên có thể chụp phải một bảng còn trống, không thể hiện đủ các thao tác mà bài kiểm yêu cầu phải thấy.
  file: `_acceptance/cho-phep-ai-vao-o-man-hinh/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — ghi lời khai thay vì đầu ra: `E13-network.txt` bị thay bằng một câu khẳng định, không còn log yêu cầu nào**
  Người dùng thấy gì: Trùng với phát hiện ở trên: ghi chép mạng dùng làm bằng chứng chỉ còn một câu khẳng định, không còn dữ liệu chi tiết nào để kiểm tra lại độc lập.
  file: `_acceptance/cho-phep-ai-vao-o-man-hinh/evidence/E13-network.txt`
  severity: low
  Đề xuất: known-limits

- **Cột staffEmailDomains không có đường ghi và không có backfill — hai đường đọc "người nhà" mất sạch domain (r3)**
  Người dùng thấy gì: Nếu chưa có nơi nào để nhập danh sách domain công ty, tính năng lọc 'đây là đồng nghiệp mình' sẽ luôn coi ai cũng là người ngoài — nhân viên mới có thể bị ghi nhầm thành khách hàng tiềm năng trong CRM.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: high
  Đề xuất: new-contract

- **`staff-domains.ts` tự đúc hằng `APP_SETTING_ID` và đọc `findFirst` không khoá theo id, lệch pattern của cả kho (r3)**
  Người dùng thấy gì: Nếu bảng cài đặt từng có hơn một dòng, màn hình có thể âm thầm đọc nhầm danh sách domain nội bộ, khiến việc nhận diện email nhân viên hoặc lọc số liệu truy cập sai mà không ai biết.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: medium
  Đề xuất: known-limits

- **Cột staffEmailDomains không có đường ghi và migration không backfill — lọc "địa chỉ nhà" ở tracking tắt hẳn, âm thầm (r3)**
  Người dùng thấy gì: Nếu chưa có nơi nào để nhập danh sách domain công ty, các mẫu đăng ký do chính nhân viên điền bằng email công ty có thể bị tính nhầm thành khách hàng tiềm năng thật, làm sai lệch số liệu tiếp thị mà không ai nhận ra.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: high
  Đề xuất: new-contract

- **Câu từ chối ở cổng vào vẫn chỉ người dùng đi sửa .env, trong khi mô hình mới quyết bằng bảng cho phép (r3)**
  Người dùng thấy gì: Với một hệ thống đã có người dùng, khi có người mới bị từ chối vào, thông báo họ nhận được hướng dẫn sửa một file cấu hình không còn tác dụng nữa, khiến quản trị viên loay hoay sai hướng thay vì vào màn Members để cấp quyền.
  file: `packages/auth/src/auth.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 10/17 lỗi rơi vào file không bộ đo nào phủ (_acceptance/cho-phep-ai-vao-o-man-hinh/evals.yaml, _acceptance/cho-phep-ai-vao-o-man-hinh/evidence/E13-members-admin.png, _acceptance/cho-phep-ai-vao-o-man-hinh/evidence/E13-network.txt, _acceptance/cho-phep-ai-vao-o-man-hinh/s4-args.json) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
