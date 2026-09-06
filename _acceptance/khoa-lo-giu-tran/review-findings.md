## Trong hợp đồng

- **Hình dạng 4 — Chiều đỏ của AC-3/E3 chỉ hứa bằng chữ, chân `can` không có đối chứng nào làm nó đỏ**
  file: `_acceptance/khoa-lo-giu-tran/rang.sh:107`
  severity: low
  AC: AC-3
  detail: evals.yaml E3 (dòng 20–25) expected: "độ vì thống kê trôi thì thông điệp statistics drifted; độ vì Postgres đổi kế hoạch thì thông điệp Expected length: 3 — hai nguyên nhân hai thông điệp". Hợp đồng dòng 49 xếp AC-3 vào nhóm "âm, bản hỏng đỏ có thông điệp ghim" và dùng nó để đủ thước "số tiêu chí có chiều đỏ ghim thông điệp = 4". Nhưng chân `can` (rang.sh dòng 107–111) chỉ làm `run_test ... -t "the fixture bites"` rồi `expect_counts "$OUT" 2 0` — toàn bộ là chiều xanh; không bản sao hỏng nào (ví dụ fixture bỏ `ANALYZE` hay chèn `ANALYZE` sau khi thêm hàng) được dựng để chứng minh "statistics drifted" thật sự bật, không có `expect_red` nào ghim thông điệp như chân `tai-lieu` đã làm. So sánh trong cùng tệp: `tai-lieu` dựng 4 bản sao hỏng và ghim 4 thông điệp; `can` không dựng bản nào. Vậy thước "đỏ ghim = 4" được thoả bằng câu chữ trong `expected`, không bằng assertion đã chạy. Rationale: AC-3 tự yêu cầu chiều đỏ ("statistics drifted" khi reltuples vượt 1) phải được minh chứng, nhưng chân `can` trong rang.sh chỉ chạy đường xanh, không có bản dựng/mutation nào từng thực sự kích hoạt và ghim thông điệp đó — lời hứa của chính AC-3 chưa được kiểm chứng bằng phép đo đã chạy.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Mã răng nghiệm thu đặt trong cây app thay vì _acceptance/<slug>/ như mọi tiền lệ**
  Người dùng thấy gì: Công cụ kiểm tra nội bộ nằm ở vị trí mới, ngoài vùng máy tự rà lỗi kiểu và lỗi code chết — nếu công cụ này hỏng âm thầm, không có cảnh báo tự động.
  file: `apps/agent/rang/khoa-lo-giu-tran.rang.ts`
  severity: medium
  Đề xuất: known-limits

- **`deleteMany({})` xoá toàn bảng agentTask, trái với mọi spec anh em chỉ xoá theo kind/reason/id**
  Người dùng thấy gì: Bộ kiểm tra này xoá sạch một bảng dữ liệu tạm dùng để test, thay vì chỉ xoá phần của riêng nó. Hiện chưa gây lỗi, nhưng nếu sau này chạy nhiều bộ kiểm cùng lúc, dữ liệu của bộ khác có thể biến mất mà không báo.
  file: `apps/agent/test/tasks.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Test xoá toàn bảng agentTask, không chỉ hàng của kind mình tạo**
  Người dùng thấy gì: Bộ kiểm tra này xoá sạch một bảng dữ liệu tạm dùng để test, thay vì chỉ xoá phần của riêng nó. Hiện chưa gây lỗi, nhưng nếu sau này chạy song song, dữ liệu của phần khác có thể mất mà không ai biết.
  file: `apps/agent/test/tasks.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hai bài 'the fixture bites' khẳng định lựa chọn của planner, không phải hành vi được bảo đảm**
  Người dùng thấy gì: Một phần bài kiểm tra dựa vào cách máy chủ cơ sở dữ liệu chọn kế hoạch chạy truy vấn. Nếu sau này nâng cấp phần mềm cơ sở dữ liệu, bài kiểm có thể báo đỏ dù bản sửa vẫn đúng, gây mất thời gian tìm hiểu.
  file: `apps/agent/test/tasks.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — Tuyên quét lớp 'due work' nhưng bài thứ hai chạy đúng cùng một phép đo với bài thứ nhất**
  Người dùng thấy gì: Hai bài kiểm tưởng như kiểm hai tình huống khác nhau, thực ra đang đo lại đúng một tình huống. Một trường hợp thật (công việc đến hạn) vẫn chưa có bài kiểm riêng, có thể để lọt lỗi sau này.
  file: `apps/agent/test/tasks.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — Hợp đồng tuyên 'kê tay đủ' không gian 2×2×2 nhưng hai ô không có eval nào**
  Người dùng thấy gì: Hồ sơ nghiệm thu nói đã kiểm đủ mọi trường hợp, nhưng thực ra bỏ sót hai trường hợp (xoá hết lượt và thuê việc, cùng lúc nhiều tiến trình, dưới thống kê dữ liệu cũ). Lỗi ở hai trường hợp này có thể không bị phát hiện.
  file: `_acceptance/khoa-lo-giu-tran/contract.md`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).