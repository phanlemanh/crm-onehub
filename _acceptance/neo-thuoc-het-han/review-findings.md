# Review findings: neo-thuoc-het-han (round 3)

## Trong hợp đồng

Không có phát hiện nào trong hợp đồng ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đối chứng dương của hai-ref coi mọi khác biệt là đạt, kể cả khi lượt «trước» là KHONG DO DUOC (mã 2) hoặc một lượt bị sập**
  Người dùng thấy gì: Phép thử kiểm tra «thước còn đo đúng sau khi có commit mới» có thể báo đạt ngay cả khi lượt đo trước đó không đo được gì. Vì vậy một lần báo đạt chưa chắc chứng minh thước thật sự bắt được thay đổi, nhưng không làm hỏng kết quả nào mà hồ sơ đã hứa.
  file: `_acceptance/neo-thuoc-het-han/rang/hai-ref.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng dương không ghim thông điệp): DOI CHUNG DUONG chỉ đòi «trước và sau commit giả khác nhau», không đòi dấu commit giả hiện ra trong đầu ra**
  Người dùng thấy gì: Phép thử đối chứng chỉ kiểm tra rằng kết quả đổi đi khi thêm commit giả, chứ không kiểm tra rằng kết quả đổi đúng vì dấu của commit giả. Có thể có lần báo đạt mà thước thật ra đổi vì lý do khác, nên độ tin của phép thử này yếu hơn vẻ ngoài.
  file: `_acceptance/neo-thuoc-het-han/rang/hai-ref.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): bất biến của pham-vi đúng sẵn theo cách dựng, còn luật «không đổi giá trị khoá config» và «không chạm cap-nhat-tuan-okr» không có đối chứng dương (r2)**
  Người dùng thấy gì: Bộ kiểm phạm vi hiện xanh nhưng chưa có ca thử chứng minh nó thật sự bắt được một commit đổi giá trị cấu hình có sẵn hay đụng vào hồ sơ cập nhật tuần OKR. Nếu ai đó vi phạm hai luật này, có thể không có gì báo đỏ.
  file: `_acceptance/neo-thuoc-het-han/rang/pham-vi.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (khẳng định «mọi eval» không có ma trận toàn phần): ghim-xanh chỉ duyệt các khoá có trong evals_exit, không đối chiếu với tập eval khai trong evals.yaml (r2)**
  Người dùng thấy gì: Bước kiểm dòng ghim lại chỉ xét những eval mà dòng ghim tự liệt kê. Nếu một dòng ghim bỏ sót vài eval thì vẫn được coi là xanh, nên «mọi eval đều đạt» chưa được bảo đảm đầy đủ.
  file: `_acceptance/neo-thuoc-het-han/rang/ghim-xanh.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): AC-3 «bốn tệp Bun.YAML từ chối nay đọc được» chỉ được đo bằng grep mã nguồn và mã thoát 0 (r2)**
  Người dùng thấy gì: Việc bốn tệp mô tả kiểm thử nay đọc được chỉ được xác nhận gián tiếp, qua việc lệnh chạy xong không lỗi. Nếu bộ đọc mới đọc ra rỗng thì bước kiểm vẫn có thể báo xanh.
  file: `_acceptance/neo-thuoc-het-han/rang/chay-o-dinh.mjs`
  severity: low
  Đề xuất: known-limits

- **ghim-xanh.mjs skips run-log.jsonl lines it cannot parse, which can pick an older green re-pin line (r1)**
  Người dùng thấy gì: Nếu một lượt ghim lại bị ngắt giữa chừng, bước kiểm tra có thể bỏ qua dòng hỏng và tin vào lượt ghim xanh cũ hơn, khiến hồ sơ trông đã đạt dù lượt mới nhất chưa đạt.
  file: `_acceptance/neo-thuoc-het-han/rang/ghim-xanh.mjs`
  severity: medium
  Đề xuất: known-limits

- **The fixed merge-pair sha for PR #162 is declared twice in one dossier, and the check that resolves it is copied three times (r1)**
  Người dùng thấy gì: Mốc gộp cố định được ghi ở nhiều chỗ, nên sau này đổi mốc mà quên một chỗ thì phép kiểm sẽ lệch nhau. Hiện tại chưa gây sai kết quả.
  file: `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`
  severity: low
  Đề xuất: known-limits

- **Control 1 in hai-ref.mjs only moves the end anchor for migration-chi-them, not back to origin/onehub...HEAD as E2 says (r1 · tệp đã đổi)**
  Người dùng thấy gì: Một phép thử đối chứng đo hơi khác điều nó tự mô tả, nhưng vẫn cho kết quả đúng nên không ảnh hưởng người dùng.
  file: `_acceptance/neo-thuoc-het-han/rang/hai-ref.mjs`
  severity: low
  Đề xuất: known-limits

- **voiCayTam để sót worktree tạm khi việc bên trong gọi dung() hay process.exit, vì finally không chạy (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi phép kiểm gặp lỗi, thư mục làm việc tạm có thể bị bỏ lại và tích dần trên máy; không ảnh hưởng kết quả nghiệm thu.
  file: `_acceptance/neo-thuoc-het-han/rang/chung.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng dương không cô lập được biến, không ghim thông điệp): ba đối chứng của hai-ref so bản sao ở cây tạm với bản gốc ở gốc kho (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép thử đối chứng chứng minh được ít hơn vẻ ngoài: nó có thể xanh ngay cả khi bản sao hỏng vì lý do khác, nên độ tin cậy của phép kiểm thước neo thấp hơn kỳ vọng.
  file: `_acceptance/neo-thuoc-het-han/rang/hai-ref.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 (đo nhãn in ra thay vì phạm vi thật được dùng): E1 kiểm dòng «dai so sanh» của E23, mà dòng này là hằng độc lập với tepDiff (r1)**
  Người dùng thấy gì: Phép kiểm chỉ đọc dòng nhãn in ra chứ không kiểm tệp thật được soi, nên nếu script trôi phạm vi mà vẫn in nhãn đúng thì phép kiểm không phát hiện.
  file: `_acceptance/neo-thuoc-het-han/rang/chay-o-dinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm một mình, không đối chứng dương): các bộ bắt DOI NGOAI, CONFIG DOI GIA TRI, CHAM của pham-vi không lần nào được cho bắn thử (r1)**
  Người dùng thấy gì: Phép kiểm phạm vi chưa từng được thử bằng một vi phạm cố ý, nên nếu nó hỏng im lặng thì vẫn báo xanh và không ai biết.
  file: `_acceptance/neo-thuoc-het-han/rang/pham-vi.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
