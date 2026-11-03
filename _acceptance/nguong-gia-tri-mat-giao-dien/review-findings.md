# Review findings: nguong-gia-tri-mat-giao-dien

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Sổ quyết định đọc nuốt lỗi parse: dòng JSONL hỏng bị bỏ qua im lặng**
  Người dùng thấy gì: Nếu có người sửa tay làm hỏng một dòng trong sổ quyết định, các phép kiểm sẽ báo là chưa có quyết định thay vì báo sổ đọc không được. Người xem có thể hiểu sai nguyên nhân đỏ.
  Căn cứ: Chỉ xảy ra khi sổ bị sửa hỏng, hậu quả là báo sai nguyên nhân chứ không mất dữ liệu, và người dùng sửa lại dòng là xong.
  file: `_acceptance/nguong-gia-tri-mat-giao-dien/rang/mien.mjs`
  severity: medium
  Đề xuất: known-limits

- **Còn sót dòng «[đề xuất] Việc nội bộ, không có người dùng.» sau khi chủ kho đã chốt ngưỡng, và dòng này trái surfaces: [ui]**
  Người dùng thấy gì: Người đọc hồ sơ này ở Cổng Giá trị sẽ thấy một dòng vẫn ghi đề xuất và nói không có người dùng, trong khi ngưỡng đã được chốt cho người dùng. Dễ gây hiểu lầm nhưng không chặn việc mở phiên nghiệm thu.
  Căn cứ: Chỉ là một dòng chữ thừa gây khó hiểu, không mất dữ liệu và không chặn nghiệm thu, sửa sau rẻ.
  file: `_acceptance/zalo-gui-hong-ghi-ly-do/opportunity.md`
  severity: low
  Đề xuất: known-limits

- **timebox.mjs gọi n.timeboxDate nhưng napNguong không kiểm hàm này có tồn tại**
  Người dùng thấy gì: Nếu bộ công cụ nghiệm thu đổi tên một hàm, phép kiểm báo sai thay vì báo không đo được. Người xem chỉ thấy đỏ nhầm loại.
  Căn cứ: Rất hiếm xảy ra, hậu quả chỉ là nhãn lỗi chưa đúng và tự lộ ra ngay khi chạy, không đáng công sửa.
  file: `_acceptance/nguong-gia-tri-mat-giao-dien/rang/chung.mjs`
  severity: low
  Đề xuất: wont-fix

- **doi-chieu.mjs: phép kiểm «dòng thêm/gỡ chỉ là bốn ô» không giới hạn trong mục Ngưỡng, nên dòng thụt bị gỡ ở mục khác lọt qua mà không báo**
  Người dùng thấy gì: Một lần sửa nhầm ở mục khác của hồ sơ có thể không bị phát hiện bởi phép đối chiếu. Hiện chưa có sửa nhầm nào như vậy.
  Căn cứ: Chưa có hồ sơ nào sai thật, rủi ro chỉ là bỏ sót một sửa nhầm về sau, và người duyệt vẫn thấy được trong diff.
  file: `_acceptance/nguong-gia-tri-mat-giao-dien/rang/doi-chieu.mjs`
  severity: medium
  Đề xuất: known-limits

- **zalo-gui-hong-ghi-ly-do còn dòng trần «[đề xuất] Việc nội bộ, không có người dùng.» sau khi đã chốt «*», và dòng này mâu thuẫn với bốn ô đã điền**
  Người dùng thấy gì: Hồ sơ vừa nói không có người dùng vừa có ngưỡng người dùng đã chốt, nên người đọc có thể bối rối. Phép kiểm vẫn xanh vì không nhìn thấy dòng này.
  Căn cứ: Chỉ là một dòng chữ mâu thuẫn gây khó hiểu, không mất dữ liệu, không chặn việc nào và sửa sau rẻ.
  file: `_acceptance/zalo-gui-hong-ghi-ly-do/opportunity.md`
  severity: low
  Đề xuất: known-limits

- **E6 (timebox.mjs) so với ngày chạy thật nên sẽ tự đỏ sau 2026-11-14, ở mọi lượt ghim lại sau đó**
  Người dùng thấy gì: Sau 14/11/2026 phép kiểm hạn sẽ báo đỏ cho cả 51 hồ sơ dù không có gì đổi, buộc người phải gia hạn hoặc ghi miễn. Đây là hành vi theo thiết kế.
  Căn cứ: Đỏ do hết hạn là đúng mục đích nhắc người, không mất dữ liệu, và người gia hạn là gỡ được ngay.
  file: `_acceptance/nguong-gia-tri-mat-giao-dien/rang/timebox.mjs`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình dạng 4): E5 ghim.mjs đếm việc vắng dòng «evidence is stale» mà không kiểm pre-merge-check có thật sự xét bằng chứng cũ của từng hồ sơ**
  Người dùng thấy gì: Màu xanh của phép kiểm ghim không phân biệt được hồ sơ đã được xét và còn mới với hồ sơ không bị xét. Người ký nên hiểu nó chỉ có nghĩa là không có báo cũ.
  Căn cứ: Không ảnh hưởng người dùng cuối, kết quả đúng với luật của kit hiện tại, và rủi ro chỉ là niềm tin hơi dư vào một dòng xanh.
  file: `_acceptance/nguong-gia-tri-mat-giao-dien/rang/ghim.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

