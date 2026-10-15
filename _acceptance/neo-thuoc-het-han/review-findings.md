## Trong hợp đồng

Ba mục t1, t6, t10 cùng một gốc (phép so của `pham-vi.mjs` bỏ sót trường ngoài danh sách `TRUONG`); giữ nguyên cả ba để không mất nguồn phát hiện.

- **pham-vi.mjs leaves expected_exit (and evidence_required) out of the guarded fields, so an eval can be quietly made allowed to fail**
  AC: AC-6
  file: `_acceptance/neo-thuoc-het-han/rang/pham-vi.mjs:37`
  severity: medium
  source: conventions
  detail: E5/AC-6 hứa mọi trường đổi ngoài `expected` của eval đã ký sẽ in `DOI NGOAI <ho so>:<eval>:<truong>` và thoát 1. `TRUONG = [criterion, executor, cmd, expected, status, layer, question]` cộng `paths` là toàn bộ trường được so; không có `expected_exit` hay `evidence_required`. `ghim-xanh.mjs` (dòng 46) đọc mã thoát kỳ vọng qua `kit().Y.expectedExits(evalsText)`. Một commit của vòng có thể thêm `expected_exit: 1` cho một eval đang đỏ ở so-okr-tu-chay hoặc lam-moi-chuyen-viec-qua-loi-chung; pham-vi không bắt, ghim-xanh coi mã đỏ là đạt kỳ vọng. Cách sửa: thêm `expected_exit` và `evidence_required` vào TRUONG, hoặc so mọi trường mà parseEvals trả về.

- **soi-ma.mjs --ca thiet-ke lặng lẽ bỏ các tệp _acceptance/*/rang và scripts/ ra khỏi phép soi chú thích, Record và useEffect**
  AC: AC-1
  file: `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs:433`
  severity: medium
  source: bugs
  detail: `dungCayDinh()` chỉ `git archive` ba mục `apps packages .env.example` vào CAY_DO. `caThietKe` sau đó lọc `doi = tepDiff("AM").filter((t) => existsSync(join(CAY_DO, t)))`, nên mọi tệp khớp VUNG_MOI ở nhánh `scripts/` hay `_acceptance/[^/]+/rang/` rơi khỏi tepMa và tepMoi mà không có dòng nào báo. Cặp f2acca7f1^1...f2acca7f1 có năm tệp như thế (`_acceptance/so-okr-tu-chay/rang/{man-so-tu-chay,migration-chi-them,soi-ma,tin-so,ty-le}.mjs`). Ở aba7f6418 bản cũ đọc cây làm việc nên vẫn soi được. Chạy lại ở HEAD: dòng «tep ma doi soi chu thich tren dong them (82)» không còn tệp _acceptance nào. Phạm vi soi của E23 hẹp đi lặng lẽ, trong khi expected mới ghi «đọc nội dung mọi tệp ở f2acca7f1». Cách sửa: thêm `_acceptance` và `scripts` vào lệnh git archive, hoặc in ra (và tính là lỗi) những tệp trong diff bị bỏ vì không có trong cây đỉnh.

- **pham-vi.mjs không so expected_exit, evidence_required hay các trường khác ngoài TRUONG, nên một lượt nới mã thoát kỳ vọng của eval vẫn lọt**
  AC: AC-6
  file: `_acceptance/neo-thuoc-het-han/rang/pham-vi.mjs:37`
  severity: medium
  source: bugs
  detail: `docEvals` gọi `Y.parseEvals(r.stdout, TRUONG)` với TRUONG = criterion, executor, cmd, expected, status, layer, question (cộng thêm paths). parseEvals của kit chỉ lấy đúng các trường được xin. Một commit của vòng thêm hoặc đổi `expected_exit` (trường kit dùng làm kỳ vọng mã thoát trong expectedExits và lượt ghim), hay đổi `evidence_required`, ở bất kỳ eval nào của so-okr-tu-chay hoặc lam-moi-chuyen-viec-qua-loi-chung thì không sinh dòng «DOI NGOAI», và E5 (AC-6) vẫn thoát 0. Expected của E5 hứa «truong doi ngoai expected -> DOI NGOAI», tức là mọi trường. Cách sửa: thêm expected_exit (và evidence_required) vào TRUONG, hoặc so nguyên khối văn bản của từng eval trừ trường expected.

- **Hình dạng 5 (tuyên bố quét cả lớp nhưng chỉ liệt kê một phần): pham-vi chỉ so 7 trường viết tay, trong khi lời hứa là «chỉ đổi trường expected»**
  AC: AC-6
  file: `_acceptance/neo-thuoc-het-han/rang/pham-vi.mjs:37`
  severity: high
  source: measurement
  detail: AC-6 hứa trong `evals.yaml` của hai hồ sơ chỉ eval E23, E25, E5, E3 đổi và chỉ đổi trường `expected`. Danh sách `TRUONG` (dòng 37-45) chỉ gồm criterion, executor, cmd, expected, status, layer, question, cộng thêm `paths` ở dòng 87. Mọi trường khác bị bỏ qua vì `Y.parseEvals` không lấy key ngoài danh sách. Ở so-okr-tu-chay/evals.yaml có `evidence_required` (25 eval), `steps`, `inputs`, đều không được so. Một commit thêm `expected_exit: 1` cho một eval đang đỏ, tức lật đỏ thành «đạt kỳ vọng», lọt qua E5 mà không có dòng DOI NGOAI nào. Danh sách trường không rút từ tập key có thật trong tệp, và không có assert nào nói số trường đã so bằng số trường có mặt.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **ghim-xanh.mjs skips run-log.jsonl lines it cannot parse, which can pick an older green re-pin line**
  Người dùng thấy gì: Nếu một lượt ghim lại bị ngắt giữa chừng, bước kiểm tra có thể bỏ qua dòng hỏng và tin vào lượt ghim xanh cũ hơn, khiến hồ sơ trông đã đạt dù lượt mới nhất chưa đạt.
  file: `_acceptance/neo-thuoc-het-han/rang/ghim-xanh.mjs`
  severity: medium
  Đề xuất: known-limits

- **The fixed merge-pair sha for PR #162 is declared twice in one dossier, and the check that resolves it is copied three times**
  Người dùng thấy gì: Mốc gộp cố định được ghi ở nhiều chỗ, nên sau này đổi mốc mà quên một chỗ thì phép kiểm sẽ lệch nhau. Hiện tại chưa gây sai kết quả.
  file: `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`
  severity: low
  Đề xuất: known-limits

- **Control 1 in hai-ref.mjs only moves the end anchor for migration-chi-them, not back to origin/onehub...HEAD as E2 says**
  Người dùng thấy gì: Một phép thử đối chứng đo hơi khác điều nó tự mô tả, nhưng vẫn cho kết quả đúng nên không ảnh hưởng người dùng.
  file: `_acceptance/neo-thuoc-het-han/rang/hai-ref.mjs`
  severity: low
  Đề xuất: known-limits

- **voiCayTam để sót worktree tạm khi việc bên trong gọi dung() hay process.exit, vì finally không chạy**
  Người dùng thấy gì: Khi phép kiểm gặp lỗi, thư mục làm việc tạm có thể bị bỏ lại và tích dần trên máy; không ảnh hưởng kết quả nghiệm thu.
  file: `_acceptance/neo-thuoc-het-han/rang/chung.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng dương không cô lập được biến, không ghim thông điệp): ba đối chứng của hai-ref so bản sao ở cây tạm với bản gốc ở gốc kho**
  Người dùng thấy gì: Phép thử đối chứng chứng minh được ít hơn vẻ ngoài: nó có thể xanh ngay cả khi bản sao hỏng vì lý do khác, nên độ tin cậy của phép kiểm thước neo thấp hơn kỳ vọng.
  file: `_acceptance/neo-thuoc-het-han/rang/hai-ref.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 (đo nhãn in ra thay vì phạm vi thật được dùng): E1 kiểm dòng «dai so sanh» của E23, mà dòng này là hằng độc lập với tepDiff**
  Người dùng thấy gì: Phép kiểm chỉ đọc dòng nhãn in ra chứ không kiểm tệp thật được soi, nên nếu script trôi phạm vi mà vẫn in nhãn đúng thì phép kiểm không phát hiện.
  file: `_acceptance/neo-thuoc-het-han/rang/chay-o-dinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm một mình, không đối chứng dương): các bộ bắt DOI NGOAI, CONFIG DOI GIA TRI, CHAM của pham-vi không lần nào được cho bắn thử**
  Người dùng thấy gì: Phép kiểm phạm vi chưa từng được thử bằng một vi phạm cố ý, nên nếu nó hỏng im lặng thì vẫn báo xanh và không ai biết.
  file: `_acceptance/neo-thuoc-het-han/rang/pham-vi.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
