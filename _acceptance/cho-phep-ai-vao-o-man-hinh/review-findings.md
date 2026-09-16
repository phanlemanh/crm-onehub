## Trong hợp đồng

(không có — không finding nào map được vào một AC cụ thể trong vòng này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Cột staffEmailDomains không có đường ghi và không có backfill — hai đường đọc "người nhà" mất sạch domain**
  Người dùng thấy gì: Nếu chưa có nơi nào để nhập danh sách domain công ty, tính năng lọc 'đây là đồng nghiệp mình' sẽ luôn coi ai cũng là người ngoài — nhân viên mới có thể bị ghi nhầm thành khách hàng tiềm năng trong CRM.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: high
  Đề xuất: new-contract

- **Trạng thái lời cho phép ép kiểu ở biên, và sai chính tả so với better-auth ("canceled"/"rejected") — cổng vào hở**
  Người dùng thấy gì: Nếu ai đó huỷ hoặc từ chối lời mời bằng một tính năng có sẵn khác của hệ thống đăng nhập (không phải nút trên màn Members), người đó vẫn có thể lọt vào được vì hệ thống chỉ nhận ra đúng một cách viết của trạng thái 'đã huỷ'.
  file: `packages/auth/src/allow-list.ts`
  severity: high
  Đề xuất: new-contract

- **`ensureWorkspaceMembership` lấy email mặc định `""` — chỗ gọi quên tham số thành từ chối lặng lẽ, `dev:session` gãy**
  Người dùng thấy gì: Khi dùng công cụ đăng nhập thử nội bộ mà không ghi rõ email, người dùng hợp lệ có thể bị hệ thống coi như chưa được phép và bị chặn ngoài cửa.
  file: `packages/auth/src/organization.ts`
  severity: high
  Đề xuất: known-limits

- **`staff-domains.ts` tự đúc hằng `APP_SETTING_ID` và đọc `findFirst` không khoá theo id, lệch pattern của cả kho**
  Người dùng thấy gì: Nếu bảng cài đặt từng có hơn một dòng, màn hình có thể âm thầm đọc nhầm danh sách domain nội bộ, khiến việc nhận diện email nhân viên hoặc lọc số liệu truy cập sai mà không ai biết.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: medium
  Đề xuất: known-limits

- **`allowEmailInput` không kiểm dạng email ở biên tRPC**
  Người dùng thấy gì: Một địa chỉ email viết sai định dạng vẫn có thể lọt vào danh sách cho phép, tạo ra một dòng chờ không bao giờ khớp được khi người đó thật sự đăng nhập.
  file: `apps/api/src/workspace/workspace.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **Quyền quản thành viên không có vị từ tên riêng trong `@crm/auth` như bốn quyền còn lại**
  Người dùng thấy gì: Luật ai được quản lý thành viên hiện nằm rải ở nhiều chỗ trong mã nguồn, nên lần sau đổi luật này có thể vô tình sót một chỗ, khiến nút bấm và thông báo lỗi nói hai điều khác nhau.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: medium
  Đề xuất: known-limits

- **`_acceptance/config.yaml` nhúng đường tuyệt đối theo máy và ghim phiên bản plugin**
  Người dùng thấy gì: Một file cấu hình nội bộ của công cụ kiểm định chứa đường dẫn chỉ đúng trên một máy cụ thể; đây không phải phần của tính năng đang giao cho người dùng.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: wont-fix

- **`domain-nha-tach.spec.ts` nuốt ngoại lệ thành chuỗi rồi đem chính chuỗi đó ra khẳng định, và sửa hàng cài đặt dùng chung mà không trả lại**
  Người dùng thấy gì: Một trong các bài kiểm tự động có thể báo 'đạt' ngay cả khi có trục trặc khác xảy ra trong lúc chạy, nên một số lỗi liên quan có thể không được phát hiện dù bài kiểm vẫn xanh.
  file: `apps/api/test/domain-nha-tach.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Người bị gỡ khỏi workspace vẫn dùng được toàn bộ API sau khi đăng nhập lại — chặn chỉ nằm ở proxy của Next**
  Người dùng thấy gì: Một người vừa bị gỡ khỏi không gian làm việc, nếu đăng nhập lại, có thể vẫn xem và sửa được dữ liệu khách hàng bằng cách gọi thẳng vào hệ thống phía sau, dù trên giao diện họ đã bị chặn — nghĩa là chỉ màn hình bị khoá, dữ liệu thì không.
  file: `packages/auth/src/organization.ts`
  severity: high
  Đề xuất: new-contract

- **Cột staffEmailDomains không có đường ghi và migration không backfill — lọc "địa chỉ nhà" ở tracking tắt hẳn, âm thầm**
  Người dùng thấy gì: Nếu chưa có nơi nào để nhập danh sách domain công ty, các mẫu đăng ký do chính nhân viên điền bằng email công ty có thể bị tính nhầm thành khách hàng tiềm năng thật, làm sai lệch số liệu tiếp thị mà không ai nhận ra.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: high
  Đề xuất: new-contract

- **decideSignInFromDb truy vấn bằng client `db` toàn cục ngay bên trong interactive transaction**
  Người dùng thấy gì: Khi hệ thống bận, bước kiểm tra quyền vào có thể bị timeout, và người dùng hợp lệ có thể bị đưa nhầm sang màn 'hết quyền' mà không ai được báo, ngoài một dòng nhật ký kỹ thuật.
  file: `packages/auth/src/organization.ts`
  severity: medium
  Đề xuất: known-limits

- **Phép đo domain-nha-tach nuốt mọi exception thành đúng chuỗi mà nó kỳ vọng**
  Người dùng thấy gì: Một trong các bài kiểm tự động cho phần lọc 'email nội bộ' có thể báo 'đạt' ngay cả khi tính năng đó đã hỏng hoàn toàn, vì bài kiểm bắt mọi lỗi rồi tự coi là đúng kết quả mong đợi.
  file: `apps/api/test/domain-nha-tach.spec.ts`
  severity: medium
  Đề xuất: new-contract

- **Câu từ chối ở cổng vào vẫn chỉ người dùng đi sửa .env, trong khi mô hình mới quyết bằng bảng cho phép**
  Người dùng thấy gì: Với một hệ thống đã có người dùng, khi có người mới bị từ chối vào, thông báo họ nhận được hướng dẫn sửa một file cấu hình không còn tác dụng nữa, khiến quản trị viên loay hoay sai hướng thay vì vào màn Members để cấp quyền.
  file: `packages/auth/src/auth.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — đo NGUỒN tĩnh thay vì ĐẦU RA đã dựng: E15/cp_san_thiet_ke chạy bộ dò HTML trên file .tsx nên luôn PASS**
  Người dùng thấy gì: Bài kiểm chất lượng thiết kế cho các màn hình mới hiện không thực sự nhìn vào giao diện đã dựng lên, nên có thể báo 'đạt chuẩn thiết kế' ngay cả khi màn hình đó trên thực tế trông xấu hoặc khó đọc.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 2 — fixture VIẾT TAY đúng khuôn bên đọc: lời cho phép được cắm thẳng bằng Prisma, không round-trip qua thủ tục ghi**
  Người dùng thấy gì: Hai kịch bản chứng minh 'vai trò định trước có hiệu lực' và 'rút quyền chặn được người mới' được dựng bằng cách ghi thẳng vào cơ sở dữ liệu thay vì đi đúng đường thao tác mà người quản sẽ dùng, nên nếu chính đường thao tác đó có lỗi ở bước chuẩn hoá địa chỉ, bài kiểm vẫn báo đạt.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 6 — đường dẫn hardcode ROOT máy tác giả trong cấu hình phép đo**
  Người dùng thấy gì: Không ảnh hưởng người dùng CRM; đây là trục trặc của công cụ đo nghiệm thu khi chạy trên máy hoặc hệ thống khác, thuộc phần việc của một kho khác.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 4 — khẳng định âm-tính-một-mình: mọi ngoại lệ đều thoả `.not.toEqual`, và một crash được ghim làm giá trị mong đợi**
  Người dùng thấy gì: Một bài kiểm khác trong bộ nghiệm thu có thể báo 'đạt' dù chức năng bên dưới bị hỏng, vì cách viết phép so sánh không đủ chặt để bắt lỗi thật.
  file: `apps/api/test/domain-nha-tach.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — nhánh thoát im lặng và một `expect` tự-bằng-chính-nó không thể sai**
  Người dùng thấy gì: Bài kiểm cho tiêu chí 'chỉ mở đường mồi khi cài đặt mới' có thể tự bỏ qua phần việc chính khi chạy trên cơ sở dữ liệu đã có người dùng, khiến báo cáo 'đạt' dù phần đó chưa hề được kiểm chứng thật.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên ba khẳng định AST nhưng chỉ cài một điểm-case**
  Người dùng thấy gì: Bài kiểm 'chỉ chủ và quản mới thao tác được' hiện không thực sự xác minh rằng luật phân quyền nằm đúng một chỗ dùng chung — nếu sau này ai đó vô tình chép luật đó ra một nơi khác trong màn Members, bài kiểm này sẽ không phát hiện ra.
  file: `apps/api/test/workspace-thanh-vien.spec.ts`
  severity: medium
  Đề xuất: new-contract

## Chưa adversarial-verify (refuter chết)

(không có)

⚠ Cụm ngoài vùng phủ: 3/19 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
