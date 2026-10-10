# Review findings: thuoc-khong-tu-het-han (vòng 4)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E1/E2 paths leave out lib/eval-yaml.cjs, which both scripts depend on, so a change to it would not trigger a repin**
  Người dùng thấy gì: Nếu sau này ai đó chỉ sửa bộ đọc tệp khai báo đo đạc dùng chung thì hồ sơ này không bị buộc đo lại, nên thước của nó có thể đỏ hoặc xanh sai mà không ai hay cho tới lần ghim kế tiếp.
  file: `_acceptance/thuoc-khong-tu-het-han/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **nguon-keo-tha-reui E1 loses its re-run trigger for the 'examples/ must not exist' check**
  Người dùng thấy gì: Nếu sau này có người thêm lại thư mục ví dụ vốn bị cấm trong thư viện giao diện, phép kiểm cấm đó có thể không chạy lại và vẫn báo xanh theo kết quả cũ.
  file: `_acceptance/nguon-keo-tha-reui/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **doi-ten-onehub-center E10 no longer re-runs when auth-shader.tsx is re-added**
  Người dùng thấy gì: Nếu tệp hiệu ứng nền cũ của màn đăng nhập bị thêm lại, phép kiểm xác nhận nó đã bị xoá có thể không được chạy lại và vẫn hiện xanh.
  file: `_acceptance/doi-ten-onehub-center/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **paths-chet chieu do on dien-thoai-ca-nhan reads its state at the moving anchor, so E1 itself expires once F24 fixes that dossier**
  Người dùng thấy gì: Khi một việc khác sửa xong hồ sơ điện thoại cá nhân, phép kiểm của vòng này có thể chuyển đỏ dù không có gì hỏng ở vòng này, và sẽ làm người gộp bối rối.
  file: `_acceptance/thuoc-khong-tu-het-han/rang/paths-chet.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 2: hand-written fixture in the reader's own format. The «git diff khong ref» sample only matches the regex's array-literal form, so the real scan never catches it**
  Người dùng thấy gì: Bản kiểm kê các thước còn đo theo mốc trôi có thể đếm thiếu vài thước viết theo kiểu gọi khác, nên con số tổng có thể thấp hơn thực tế.
  file: `_acceptance/thuoc-khong-tu-het-han/rang/kiem-ke.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4: negative-only assertion. 'This round touched 0 files under dien-thoai-ca-nhan/the-gop-y-okr' has no positive control on the real file set**
  Người dùng thấy gì: Phép kiểm xác nhận vòng này không đụng tới hai hồ sơ đã chuyển đi có thể báo xanh dù nó lấy nhầm tập tệp đã đổi, nên lời xác nhận yếu hơn vẻ ngoài.
  file: `_acceptance/thuoc-khong-tu-het-han/rang/chi-paths.mjs`
  severity: low
  Đề xuất: known-limits

- **Orphan executor tkh_e10 silently runs the E7 check** (r3)
  Người dùng thấy gì: Còn sót một lệnh kiểm tra cũ cho một mục đã được chuyển đi nơi khác. Ai chạy nhầm lệnh đó sẽ thấy màu xanh nhưng thực ra nó đo một việc khác. Hiện không có mục nào trong hồ sơ này gọi lệnh đó.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **hai-thuoc.mjs keeps dead E10 branches with a hard-coded sha** (r3)
  Người dùng thấy gì: Trong script kiểm tra còn một đoạn mã cũ không còn được dùng nữa. Nó không làm kết quả nào sai, chỉ làm người đọc sau này khó hiểu hơn một chút.
  file: `_acceptance/thuoc-khong-tu-het-han/rang/hai-thuoc.mjs`
  severity: low
  Đề xuất: wont-fix

- **Old Gate 2 evidence page still describes E4/tkh_e10 after the scope cut** (r3)
  Người dùng thấy gì: Trang bằng chứng cũ vẫn nhắc đến một mục đã bị bỏ khỏi vòng này. Nó sẽ được dựng lại ở lượt kiểm tra kế tiếp, nên người xem tạm thời có thể thấy thông tin lỗi thời.
  file: `_acceptance/thuoc-khong-tu-het-han/evidence-page.html`
  severity: low
  Đề xuất: wont-fix

- **tkh_e10 trong config còn sót, và hai-thuoc.mjs bỏ qua cờ lạ, nên lệnh đó chạy thước E7 rồi in XANH** (r3)
  Người dùng thấy gì: Một lệnh kiểm tra đã hết dùng vẫn còn trong cấu hình, và nếu ai chạy nó thì sẽ nhận kết quả xanh dù không đo đúng việc nó tên. Chưa có mục nào trong hồ sơ này dựa vào lệnh đó.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 3/6 lỗi rơi vào file không bộ đo nào phủ (_acceptance/thuoc-khong-tu-het-han/evals.yaml, _acceptance/nguon-keo-tha-reui/evals.yaml, _acceptance/doi-ten-onehub-center/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
