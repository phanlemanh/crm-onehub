# Review findings: giam-phut-acceptance (round 2)

## Trong hợp đồng

Không có mục nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **dungCay/goCay đi lệch nếp worktree tạm của kho: không try/finally, không symlink node_modules/.env, git lỗi ra mã 1 thay vì 2**
  Người dùng thấy gì: Nếu bước kiểm lại các hồ sơ cũ bị ngắt giữa chừng, nó có thể để lại thư mục tạm trên máy. Nếu sau này có hồ sơ cũ cần thư viện ngoài, bước kiểm có thể báo đỏ sẵn nhầm thay vì báo không đo được. Hôm nay chưa hồ sơ nào bị ảnh hưởng.
  file: `_acceptance/giam-phut-acceptance/rang/ho-so-cu.mjs`
  severity: medium
  Đề xuất: known-limits

- **tongKet mặc định nhánh thiếu là onehub, nên dữ liệu giả không có head_branch vẫn qua và che lỗi phép chiếu jq**
  Người dùng thấy gì: Nếu sau này cách lấy tên nhánh từ GitHub bị hỏng âm thầm, các lượt push lên nhánh release có thể bị tính chung vào số đo của onehub mà bộ tự kiểm không báo. Hiện dữ liệu thật vẫn đúng.
  file: `_acceptance/giam-phut-acceptance/rang/do-phut.mjs`
  severity: low
  Đề xuất: known-limits

- **E3 expected text in evals.yaml still describes the old git-archive comparison tree that round 1 replaced**
  Người dùng thấy gì: Lời mô tả của một phép kiểm vẫn nói cách dựng bản so sánh cũ, nên người đọc hoặc người chấm có thể hiểu sai cách phép kiểm làm việc. Kết quả kiểm không đổi.
  file: `_acceptance/giam-phut-acceptance/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): kiểm «PR không SỐNG» luôn đạt vì mẫu dưới 10 lượt; quan hệ trung vị–ngưỡng (SỐNG/CHẾT) không được assert ở đâu**
  Người dùng thấy gì: Dòng kết luận đạt hay không đạt ngưỡng phút trong báo cáo đo chưa được bộ tự kiểm thử chặt, nên nếu so ngưỡng bị đảo thì báo cáo vẫn có thể in kết luận sai mà không ai biết. Các con số trung vị vẫn đúng.
  file: `_acceptance/giam-phut-acceptance/rang/do-phut.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): bộ lọc nhánh push dựa vào mặc định `?? "onehub"`, fixture bỏ trống `nhanh`, nên ánh xạ `head_branch` của docThat chưa từng được đo**
  Người dùng thấy gì: Bộ tự kiểm chưa chứng minh được rằng tên nhánh lấy từ GitHub được đọc đúng. Nếu việc đọc này hỏng, số đo push có thể lẫn lượt của nhánh khác mà không có cảnh báo.
  file: `_acceptance/giam-phut-acceptance/rang/do-phut.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assert không thể sai): chiều đo «cua-so» so một bản chép tay `cuaSoCu` với hằng số, không đi qua hàm hay câu truy vấn thật**
  Người dùng thấy gì: Một dòng tự kiểm về cửa sổ ngày luôn báo đã bắt được lỗi dù không so với mã thật, nên nó tạo cảm giác yên tâm không có cơ sở. Việc tính cửa sổ ngày thật vẫn được kiểm ở chỗ khác.
  file: `_acceptance/giam-phut-acceptance/rang/do-phut.mjs`
  severity: low
  Đề xuất: wont-fix

- **Thẻ quyết định vẫn hứa AC-5 cũ «giữ xanh mọi hồ sơ đã ký» sau khi AC-5 đã được sửa (r1)**
  Người dùng thấy gì: Thẻ đưa cho người quyết vẫn ghi vòng này giữ xanh mọi hồ sơ đã ký, trong khi lời hứa thật yếu hơn: chỉ cam kết không có lệnh nào đỏ thêm. Người đọc thẻ có thể tưởng bảo đảm mạnh hơn thực tế.
  file: `_acceptance/giam-phut-acceptance/card-plain.json`
  severity: medium
  Đề xuất: known-limits

- **nen-gop.mjs chỉ đối chiếu check bắt buộc với job của acceptance.yml, nên sẽ báo đỏ oan khi một check của ci.yml bị bắt buộc (r1)**
  Người dùng thấy gì: Nếu sau này chủ kho bắt buộc một kiểm tra thuộc luồng CI khác, phép kiểm trước khi ghim lại sẽ báo nhầm là kiểm tra đó biến mất và chặn lượt ghim. Hôm nay chưa kiểm tra nào bị bắt buộc nên chưa ảnh hưởng.
  file: `_acceptance/giam-phut-acceptance/rang/nen-gop.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên bố quét cả lớp nhưng chỉ kiểm từng điểm): Trục C xanh|đỏ|huỷ không có ô ma trận nào, AC-4 «bước đỏ thì bước sau vẫn chạy, job vẫn đỏ» chỉ được kiểm bằng so chuỗi if (r1)**
  Người dùng thấy gì: Việc một bước kiểm tra đỏ thì các bước sau vẫn chạy chỉ được xác nhận bằng cách đọc cấu hình, chưa được mô phỏng thật. Nếu cấu hình sai theo cách khó thấy thì phép kiểm hiện tại có thể không bắt được.
  file: `_acceptance/giam-phut-acceptance/rang/hinh.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
