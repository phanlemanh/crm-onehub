# Review findings: nguong-gia-tri-mat-giao-dien (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Tệp nguồn của bộ dựng bảng vẫn giữ chữ r1 đã bị trả cho cả 10 ô vừa chốt; chạy lại dung-bang.mjs sẽ âm thầm ghi đè**
  Người dùng thấy gì: Chữ ngưỡng người dùng đã chốt vẫn đúng trong hồ sơ. Nhưng nếu ai đó chạy lại công cụ dựng bảng, 10 ô sẽ lặng lẽ quay về chữ cũ đã bị trả.
  Căn cứ: Chỉ xảy ra khi có người chủ động chạy lại công cụ dựng bảng, hồ sơ hiện tại không bị ảnh hưởng, và lúc đó bộ đối chiếu báo đỏ nên người dùng không mất dữ liệu và tự sửa được.
  file: `_acceptance/nguong-gia-tri-mat-giao-dien/rang/nguon/ab.json`
  severity: medium
  Đề xuất: known-limits

- **lo-trinh-ten-va-build: ô r2 đo bằng người dùng, nhưng dòng ngay trên vẫn ghi «Không đo bằng người dùng»**
  Người dùng thấy gì: Hồ sơ này có hai câu mâu thuẫn: một câu nói không đo bằng người dùng, ba ô ngưỡng bên dưới lại đo bằng phiên nghiệm thu với người dùng. Người đọc ở bước nghiệm thu có thể bối rối nên theo câu nào.
  Căn cứ: Chỉ gây bối rối khi đọc chứ không làm mất hay sai dữ liệu, và ba ô ngưỡng cụ thể bên dưới đã đủ rõ để làm phiên nghiệm thu, nên người đọc tự hiểu được.
  file: `_acceptance/lo-trinh-ten-va-build/opportunity.md`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — bang-de-xuat.json, tệp E2 đọc, được vá tay cho khớp opportunity.md chứ không do dung-bang.mjs sinh ra; 10 ô r2 lệch với nguồn của bộ sinh**
  Người dùng thấy gì: Bảng ngưỡng đã được sửa tay cho khớp chữ mới chốt, nên hồ sơ hiện đúng. Phép đối chiếu xanh vì so với chính bảng đã sửa, nên không kiểm được bảng có khớp nguồn gốc của nó hay không.
  Căn cứ: Chữ người dùng nhìn thấy trong hồ sơ hiện đúng, rủi ro chỉ nằm ở lần dựng lại bảng sau này và lúc đó phép đối chiếu sẽ báo đỏ nên dễ phát hiện và sửa.
  file: `_acceptance/nguong-gia-tri-mat-giao-dien/rang/bang-de-xuat.json`
  severity: medium
  Đề xuất: known-limits

- **Sổ quyết định đọc nuốt lỗi parse: dòng JSONL hỏng bị bỏ qua im lặng (r1)**
  Người dùng thấy gì: Nếu có người sửa tay làm hỏng một dòng trong sổ quyết định, các phép kiểm sẽ báo là chưa có quyết định thay vì báo sổ đọc không được. Người xem có thể hiểu sai nguyên nhân đỏ.
  Căn cứ: Chỉ xảy ra khi sổ bị sửa hỏng, hậu quả là báo sai nguyên nhân chứ không mất dữ liệu, và người dùng sửa lại dòng là xong.
  file: `_acceptance/nguong-gia-tri-mat-giao-dien/rang/mien.mjs`
  severity: medium
  Đề xuất: known-limits

- **Còn sót dòng «[đề xuất] Việc nội bộ, không có người dùng.» sau khi chủ kho đã chốt ngưỡng, và dòng này trái surfaces: [ui] (r1)**
  Người dùng thấy gì: Người đọc hồ sơ này ở Cổng Giá trị sẽ thấy một dòng vẫn ghi đề xuất và nói không có người dùng, trong khi ngưỡng đã được chốt cho người dùng. Dễ gây hiểu lầm nhưng không chặn việc mở phiên nghiệm thu.
  Căn cứ: Chỉ là một dòng chữ thừa gây khó hiểu, không mất dữ liệu và không chặn nghiệm thu, sửa sau rẻ.
  file: `_acceptance/zalo-gui-hong-ghi-ly-do/opportunity.md`
  severity: low
  Đề xuất: known-limits

- **timebox.mjs gọi n.timeboxDate nhưng napNguong không kiểm hàm này có tồn tại (r1)**
  Người dùng thấy gì: Nếu bộ công cụ nghiệm thu đổi tên một hàm, phép kiểm báo sai thay vì báo không đo được. Người xem chỉ thấy đỏ nhầm loại.
  Căn cứ: Rất hiếm xảy ra, hậu quả chỉ là nhãn lỗi chưa đúng và tự lộ ra ngay khi chạy, không đáng công sửa.
  file: `_acceptance/nguong-gia-tri-mat-giao-dien/rang/chung.mjs`
  severity: low
  Đề xuất: wont-fix

- **doi-chieu.mjs: phép kiểm «dòng thêm/gỡ chỉ là bốn ô» không giới hạn trong mục Ngưỡng, nên dòng thụt bị gỡ ở mục khác lọt qua mà không báo (r1)**
  Người dùng thấy gì: Một lần sửa nhầm ở mục khác của hồ sơ có thể không bị phát hiện bởi phép đối chiếu. Hiện chưa có sửa nhầm nào như vậy.
  Căn cứ: Chưa có hồ sơ nào sai thật, rủi ro chỉ là bỏ sót một sửa nhầm về sau, và người duyệt vẫn thấy được trong diff.
  file: `_acceptance/nguong-gia-tri-mat-giao-dien/rang/doi-chieu.mjs`
  severity: medium
  Đề xuất: known-limits

- **zalo-gui-hong-ghi-ly-do còn dòng trần «[đề xuất] Việc nội bộ, không có người dùng.» sau khi đã chốt «*», và dòng này mâu thuẫn với bốn ô đã điền (r1)**
  Người dùng thấy gì: Hồ sơ vừa nói không có người dùng vừa có ngưỡng người dùng đã chốt, nên người đọc có thể bối rối. Phép kiểm vẫn xanh vì không nhìn thấy dòng này.
  Căn cứ: Chỉ là một dòng chữ mâu thuẫn gây khó hiểu, không mất dữ liệu, không chặn việc nào và sửa sau rẻ.
  file: `_acceptance/zalo-gui-hong-ghi-ly-do/opportunity.md`
  severity: low
  Đề xuất: known-limits

- **E6 (timebox.mjs) so với ngày chạy thật nên sẽ tự đỏ sau 2026-11-14, ở mọi lượt ghim lại sau đó (r1)**
  Người dùng thấy gì: Sau 14/11/2026 phép kiểm hạn sẽ báo đỏ cho cả 51 hồ sơ dù không có gì đổi, buộc người phải gia hạn hoặc ghi miễn. Đây là hành vi theo thiết kế.
  Căn cứ: Đỏ do hết hạn là đúng mục đích nhắc người, không mất dữ liệu, và người gia hạn là gỡ được ngay.
  file: `_acceptance/nguong-gia-tri-mat-giao-dien/rang/timebox.mjs`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình dạng 4): E5 ghim.mjs đếm việc vắng dòng «evidence is stale» mà không kiểm pre-merge-check có thật sự xét bằng chứng cũ của từng hồ sơ (r1)**
  Người dùng thấy gì: Màu xanh của phép kiểm ghim không phân biệt được hồ sơ đã được xét và còn mới với hồ sơ không bị xét. Người ký nên hiểu nó chỉ có nghĩa là không có báo cũ.
  Căn cứ: Không ảnh hưởng người dùng cuối, kết quả đúng với luật của kit hiện tại, và rủi ro chỉ là niềm tin hơi dư vào một dòng xanh.
  file: `_acceptance/nguong-gia-tri-mat-giao-dien/rang/ghim.mjs`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

