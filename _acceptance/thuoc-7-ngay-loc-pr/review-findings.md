# Review findings: thuoc-7-ngay-loc-pr (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **--tu/--den are not validated as UTC ISO: offset-less or '--tu=' input silently moves the window**
  Người dùng thấy gì: Nếu người đo gõ mốc thời gian thiếu múi giờ hoặc viết dạng --tu=..., thước có thể lặng lẽ đo lệch cửa sổ vài giờ hoặc bỏ qua mốc đó mà không báo gì, rồi vẫn in kết luận. Dùng đúng cú pháp trong hồ sơ thì không bị.
  file: `_acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs`
  severity: medium
  Đề xuất: known-limits

- **mocGopCi swallows the git error and reads a local origin/<nhanh> that may be stale**
  Người dùng thấy gì: Khi thước không tìm được mốc bắt đầu, thông báo không nói rõ nguyên nhân thật. Nếu máy chưa cập nhật nhánh mới nhất, thước có thể đo trên một cửa sổ cũ đã đóng mà vẫn đưa ra kết luận.
  file: `_acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs`
  severity: low
  Đề xuất: known-limits

- **New .mjs files and samples are not biome-formatted, unlike existing rang files**
  Người dùng thấy gì: Một số tệp công cụ đo mới chưa theo đúng kiểu trình bày chung của kho, nên lần chạy định dạng tự động sau sẽ sửa lại chúng. Không ảnh hưởng kết quả đo.
  file: `_acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs`
  severity: low
  Đề xuất: wont-fix

- **phan-trang.mjs: the no-pagination mutant check passes even when the mutant prints nothing or crashes**
  Người dùng thấy gì: Phép kiểm chứng rằng thước sẽ bắt được lỗi thiếu phân trang có thể báo đạt ngay cả khi bản thử hỏng không chạy được. Thước vẫn đếm đủ các trang, chỉ là bằng chứng cho điều đó yếu hơn mức hứa.
  file: `_acceptance/thuoc-7-ngay-loc-pr/rang/phan-trang.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét ma trận biên nhưng chỉ có 10 điểm-case, và chốt «số assert = số ô» là tự quy chiếu**
  Người dùng thấy gì: Bảng thử các ngưỡng SỐNG, CHẾT và giữa hai ngưỡng mới có 10 trường hợp trong 32 tổ hợp có thể có, nên một lỗi ở tổ hợp chưa thử có thể lọt mà không ai thấy. Kết luận hiện tại chưa bị chứng minh sai.
  file: `_acceptance/thuoc-7-ngay-loc-pr/rang/do-7-ngay.test.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — chiều đỏ của phép phân trang chỉ khẳng định âm (≠141), không ghim 100 hay mã thoát**
  Người dùng thấy gì: Phép thử thiếu trang coi mọi kết quả khác 141 là đã bắt được lỗi, kể cả khi bản thử bị chết giữa chừng. Bằng chứng rằng thước bắt được lỗi này vì thế lỏng hơn lời khai.
  file: `_acceptance/thuoc-7-ngay-loc-pr/rang/phan-trang.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — E1 khai «lần 1 tràn, lần 2 xanh → 1 lượt xanh» nhưng phép thử assert xanh=false và không có ca nhiều attempt nào mang ci-ok**
  Người dùng thấy gì: Chưa có ca thử nào cho lượt chạy lại mà lần cuối xanh, nên nếu thước nhầm lượt như vậy là đỏ thì phép thử hiện tại sẽ không phát hiện. Số lượt xanh tính ra có thể lệch trong trường hợp hiếm này mà không ai biết.
  file: `_acceptance/thuoc-7-ngay-loc-pr/rang/do-7-ngay.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — trên cây thật, lúc chưa ký, phép đo vẫn chấp nhận ok, nên quan hệ chưa ký ⇒ chỉ «ho-so-thay-chua-ky» không được ghim**
  Người dùng thấy gì: Phép kiểm việc nối với hồ sơ cũ chỉ thử khi hồ sơ mới đã ký, nên nếu có ai làm hỏng luật từ chối trước khi ký thì không phép đo nào thấy.
  file: `_acceptance/thuoc-7-ngay-loc-pr/rang/noi-f21.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — câu annotation lớp «tay» viết tay cho khớp regex của bên đọc, không chụp từ GitHub**
  Người dùng thấy gì: Câu GitHub ghi khi người dùng huỷ tay chưa từng được chụp thật, nên nếu GitHub viết khác dự kiến thì lượt huỷ tay đầu tiên sẽ làm thước dừng báo lỗi thay vì đếm. Hợp đồng đã ghi rõ đây là giả định.
  file: `_acceptance/thuoc-7-ngay-loc-pr/rang/do-7-ngay.test.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
