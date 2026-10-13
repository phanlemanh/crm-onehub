# Review findings: cay-can-chinh-co-ly-do (round 1)

## Trong hợp đồng

- **Hình dạng 3 (assert có mặt thay cho quan hệ): vế «roots và chuaCanChinh giữ nguyên như trước vòng» của AC-1 không có assert nào**
  file:line: `apps/api/test/okr-cay-ly-do.spec.ts:97`
  severity: medium
  AC: AC-1
  source: measurement
  detail: Mục E1 trong evals.yaml hứa: «roots và chuaCanChinh bằng đúng (toEqual) đầu ra của bản trước vòng: dựng lại bằng dungCayCanChinh + gan như service». Trong spec, roots và chuaCanChinh chỉ được đọc ở moiNut (dòng 97) để gom tập id cho phép kiểm cạnh có mặt. Spec không import dungCayCanChinh (grep chỉ thấy dòng 45 và 97) và không có toEqual nào so cây sau vòng với cây dựng lại theo cách trước vòng. Lời hứa là một quan hệ bằng nhau giữa đầu ra trước và sau vòng, nhưng phép đo chỉ dùng hai mảng này làm nguồn id. Nếu service đổi hình nút (ví dụ gan làm rơi trường, đổi thứ tự hay mất nhánh) thì l3-canh vẫn xanh, miễn các id còn đủ cho tập cạnh.
  rationale: AC-1 hứa roots và chuaCanChinh giữ nguyên như trước vòng, mà phép đo không so sánh gì cả. Vế này của AC-1 không được chứng minh.

- **Hình dạng 5 (ma trận tuyên đủ ca nhưng một ca không chạy hành vi): ca «tat-ca» của l3-loc không bấm chip, không kiểm việc trả lại cây đầy đủ sau khi lọc**
  file:line: `apps/app/test/cay-can-chinh-ly-do.dom.tsx:301`
  severity: medium
  AC: AC-6
  source: measurement
  detail: MA_TRAN của l3-loc có ba ca, và expected của E6 ghi «Bấm chip qua ToggleGroup thật». Nhưng `if (c.loc !== "tat-ca")` (dòng 301) bỏ qua lần bấm ở ca tat-ca. Ca này chỉ dựng cây mới ở trạng thái mặc định rồi đếm nút. Vế AC-6 «And «Tất cả» trả cây đầy đủ» (sau khi đã lọc thì bấm Tất cả để quay lại) và nhánh `setLoc(moi === "tat-ca" ? null : moi)` trong cay-can-chinh.tsx không bị đo. Không có bước nào lọc trước rồi mới bấm tat-ca, cũng không kiểm tham số mucTinCay bị xoá khỏi đường dẫn. `expect(soCa).toBe(3)` vẫn đạt, dù chỉ hai ca thật sự chạy hành vi bấm.
  rationale: AC-6 có vế «Tất cả» trả cây đầy đủ, tức là lọc xong rồi bấm Tất cả. Không có phép đo nào chạy hành vi đó.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Phần hiện lý do và mức tin bị chép tay từ LyDoNoiGop thay vì chuyển thành phần vào packages/ui**
  Người dùng thấy gì: Phần hiện lý do và mức tin trên cây được viết lại riêng, giống bản trên khung chi tiết mục tiêu. Hôm nay hai nơi hiện đúng nhau, nhưng sau này sửa một nơi mà quên nơi kia thì hai màn sẽ hiện khác nhau.
  file: `apps/app/app/(app)/[slug]/okr/cay-can-chinh.tsx`
  severity: medium
  Đề xuất: new-contract

- **Nhóm chip lọc mang cùng aria-label với cây**
  Người dùng thấy gì: Người dùng đọc màn hình sẽ nghe nhóm nút lọc được gọi cùng tên với cả cây căn chỉnh, nên khó phân biệt hai vùng. Mắt thường không thấy gì khác.
  file: `apps/app/app/(app)/[slug]/okr/cay-can-chinh.tsx`
  severity: low
  Đề xuất: known-limits

- **Bộ lọc mức tin bỏ cả nhánh «Chưa căn chỉnh», nên cạnh khớp nằm trong đó biến mất dù số trên chip vẫn đếm chúng**
  Người dùng thấy gì: Khi bấm lọc theo một mức, các mục tiêu nằm dưới một mục tiêu chưa căn chỉnh đi đâu sẽ không hiện, dù số trên nút lọc vẫn đếm chúng. Người dùng có thể thấy nút ghi số lớn hơn 0 mà màn lại báo không có mục tiêu nào.
  file: `apps/app/app/(app)/[slug]/okr/cay-can-chinh.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): nhãn chip «Tất cả» chỉ được kiểm trong tệp messages, không kiểm trên màn**
  Người dùng thấy gì: Nếu ai đó viết cứng chữ «Tất cả» vào nút lọc thì bài kiểm vẫn xanh. Khi đó đổi sang tiếng Anh nút này vẫn hiện tiếng Việt mà không ai biết.
  file: `apps/app/test/cay-can-chinh-ly-do.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (thông điệp đỏ khai là đã ghim nhưng không có): E5 tuyên chiều đỏ ghim ở E11 (c), nhưng dot-bien không chạy l3_lap_lai dưới vết nào**
  Người dùng thấy gì: Chưa có bằng chứng máy cho thấy bài kiểm sẽ đỏ khi một mục tiêu hiện lần hai kèm lý do của chỗ nối sai. Nếu có lỗi kiểu này thì có thể lọt qua mà không báo.
  file: `_acceptance/cay-can-chinh-co-ly-do/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm tính đứng một mình): vế bộ mẫu của l3-quyen không đếm số cạnh đã xét, nên có thể xanh vì trống**
  Người dùng thấy gì: Phép kiểm quyền trên bộ dữ liệu mẫu có thể xanh dù người dùng không được trả cạnh nào. Lỗi mất cạnh cho người không phải quản trị sẽ khó bị bắt.
  file: `apps/api/test/okr-cay-ly-do.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm tính đứng một mình): «chip có số 0 vẫn bấm được» chỉ đo bằng việc thiếu thuộc tính disabled**
  Người dùng thấy gì: Một nút lọc có số 0 mà bị khoá theo cách khác vẫn có thể qua bài kiểm. Khi đó người dùng thấy nút không bấm được.
  file: `apps/app/test/cay-can-chinh-ly-do.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét cả lớp nhưng chỉ bắt một điểm cú pháp): grep «bảng mức tin thứ hai» chỉ bắt đúng một dạng object literal**
  Người dùng thấy gì: Nếu ai đó viết thêm một bảng mức tin thứ hai theo kiểu khác thì bài kiểm không bắt được. Màu và nhãn của cây có thể lệch khung chi tiết mà không ai hay.
  file: `apps/app/test/cay-can-chinh-ly-do.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
