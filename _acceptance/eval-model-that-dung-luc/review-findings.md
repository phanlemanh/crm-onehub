# Review findings: eval-model-that-dung-luc (round 3)

## Trong hợp đồng

- **«SO LOI GOI MODEL» không phải bộ đếm lời gọi model: nhánh dùng lại in hằng chuỗi 2**
  file:line: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts:175`
  severity: medium
  source: conventions
  AC: AC-8
  detail: E8 khai «bộ đếm nằm trong lớp gọi model của cham-bo-do, đếm cả lời gọi qua eve eval». Mã thật thì khác: ở nhánh DUNG LAI, `console.log("SO LOI GOI MODEL: 2")` là một chuỗi cứng. Ở nhánh đo mới, `soLoiGoi = 2 + keHoach.mot.length + keHoach.hai.length` (dòng 510, 528) đếm số câu trong kế hoạch, không đếm lời gọi qua `doModel`/generateText hay lời gọi bên trong eve. Phép kiểm `l2.goi !== 2` của luot-kep.mjs:58 vì vậy luôn đúng ở nhánh dùng lại, dù có thêm lời gọi model nào đi nữa, ví dụ doModel gọi lại hoặc có một generateText thừa. Điều này trái với luật kho «eval phải gọi đúng hàm tiêu chí hứa». Cách sửa: đếm ở chỗ bọc GoiDo truyền vào doModel, và lấy số lời gọi do eve báo.

- **In the re-ask round, unverifiable-citation answers are dropped, so the zero threshold is never applied there**
  file:line: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts:585`
  severity: high
  source: bugs
  AC: AC-6
  detail: After the re-ask round, `c2 = chamTungCau(l2.tungCau, NGUONG)` counts answers whose citations fail verification in `c2.kl.traLoiKhongQuaKiem`, and `ketLuan` makes `c2.kl.ma` 1 when that count is not 0. The code then only checks `c2.kl.ma === 2`. `maThoat` is built only from `conKhongDat` of round 1 and `gopCua...every(g => g.dat)`, and none of `c2.kl.dong` goes into `tong`. Example: round 1 has dungTrang in the grey zone (15/20) with kiem=0. In the re-ask round 17/20 answer TRA_LOI with the right page, but one of them cites an unverifiable passage (`khongQuaKiem: true`). The merged rate is 32/40 = 0.8, so it passes, `maThoat = 0`, and `ghiBanGhi({dat: true})` writes a passing record that is then reused for 7 days. The evidence never shows the line «tra loi co trich khong qua kiem: 1». This breaks AC-6, which keeps the threshold `0` for the merged conclusion. The spec also has no case for `khongQuaKiem`/`traLoiKhongQuaKiem` (grep returns nothing), so no eval catches it.

- **Hình dạng 1 — đo chỉ dẫn thay vì đầu ra: «SO LOI GOI MODEL» là chữ in sẵn, không phải bộ đếm lời gọi model (E8)**
  file:line: `_acceptance/eval-model-that-dung-luc/rang/luot-kep.mjs:58`
  severity: high
  source: measurement
  AC: AC-8
  detail: luot-kep.mjs:31 lấy số từ stdout `SO LOI GOI MODEL: (\d+)`. Dòng 58 khẳng định `l2.goi !== 2`, dòng 42 khẳng định `l1.goi > 2`. Ở nhánh dùng lại, cham-bo-do.ts:175 in hằng chữ `console.log("SO LOI GOI MODEL: 2")`; không có biến nào đếm. Ở nhánh đo mới, `soLoiGoi` bắt đầu bằng 2 (dòng 510) rồi cộng `keHoach.mot.length + keHoach.hai.length` (dòng 528). Tức là đếm số câu đã lên kế hoạch, không đếm lời gọi model thật. Hàm `doModel`/`generateText` (dòng 147-154) không bọc bộ đếm nào. Evals.yaml lại hứa «bộ đếm nằm trong lớp gọi model của cham-bo-do, đếm cả lời gọi qua eve eval». Hệ quả: lượt 2 luôn in đúng 2, nên khẳng định `goi === 2` không thể đỏ. Đối chứng dương `> 2` chỉ chứng minh bộ câu không rỗng. Round 1 đã bắt lỗi này (run-log dòng 30), HEAD vẫn còn nguyên.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **docBanGhi/docBanGhiHead nuốt lỗi parse thành null: bản ghi hỏng hiện ra thành «chua co ban ghi»**
  Người dùng thấy gì: Nếu tệp ghi kết quả đo bị sửa hỏng, hệ thống đo lại từ đầu (tốn tiền gọi model) và báo lý do là «chưa có bản ghi» thay vì «bản ghi hỏng». Người đọc sẽ hiểu sai vì sao bị đo lại.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`
  severity: high
  Đề xuất: known-limits

- **khuonDongTungCau quá lỏng, rồi ép kiểu `as KetCucMot/KetCucHai`: hàng lượt 1 mang ketCuc «loi» bị chấm thành «sai»**
  Người dùng thấy gì: Khi chấm lại từ tệp đã bị sửa tay thành dữ liệu vô lý, một câu lỗi hạ tầng có thể bị tính là model trả lời sai. Với lượt đo thật thì không gặp vì hệ thống không tự ghi ra dữ liệu như vậy.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`
  severity: high
  Đề xuất: known-limits

- **Ngưỡng E15 có hai nguồn: NGUONG ở cham-bo-do.ts và CHAM_BO_DO.nguong ở quyet-do.ts; spec đo bản không chạy**
  Người dùng thấy gì: Ngưỡng đạt/không đạt đang được khai ở hai chỗ có cùng số. Sau này ai sửa một chỗ mà quên chỗ kia thì kết quả đo thật và bài kiểm tra sẽ lệch nhau mà không ai được báo.
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`
  severity: medium
  Đề xuất: known-limits

- **Kết luận gộp sau hỏi lại nằm ở cham-bo-do.ts, đọc trạng thái bằng khớp chuỗi `endsWith(" khong-dat")`; E7 không đo hàm này**
  Người dùng thấy gì: Việc quyết định kết quả cuối sau khi hỏi lại dựa vào chữ hiển thị trên màn hình. Nếu ai đó đổi cách hiển thị, kết quả có thể báo «đạt» sai mà không bài kiểm tra nào phát hiện.
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`
  severity: medium
  Đề xuất: known-limits

- **Quyết định truyền qua biến môi trường E15_QUYET được parse bằng `as Quyet`; biến cũ còn trong shell sẽ bỏ qua lời dò model**
  Người dùng thấy gì: Nếu một giá trị cũ còn sót trong môi trường chạy, lượt đo có thể bỏ qua bước dò model và ghi lại thông tin model cũ. Người chạy bình thường không gặp, nhưng khi gặp thì kết quả lưu có thể sai.
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`
  severity: medium
  Đề xuất: known-limits

- **cham-lai.mjs round-trip does not compare the exit code with the real run and filters out the unverifiable-citation line**
  Người dùng thấy gì: Bài kiểm tra «chấm lại cho kết quả giống lượt thật» bỏ sót một dòng kết luận và không so mã kết thúc, nên có thể báo xanh dù chấm lại lệch ở chỗ đó.
  file: `_acceptance/eval-model-that-dung-luc/rang/cham-lai.mjs`
  severity: medium
  Đề xuất: known-limits

- **The per-question schema does not tie ketCuc to its round, and a round-1 row with ketCuc 'loi' is silently scored as 'sai'**
  Người dùng thấy gì: Khi chấm lại từ tệp bị sửa tay, một hàng ghi sai lượt có thể làm câu lỗi hạ tầng bị tính là model sai và không báo lỗi.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét lớp nhưng chỉ có điểm-case: bảng nhãn E1 có 12/20 ô, số đếm tự so với chính độ dài bảng**
  Người dùng thấy gì: Bảng kiểm tra cách gắn nhãn câu trả lời chỉ phủ 12 trên 20 tổ hợp, nên một số tổ hợp có thể gắn nhãn sai mà bài kiểm tra vẫn xanh.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — thông điệp ghim không được ghim thật: cặp (g) ghim «thieu model_id cua goc» trên nhánh bảo vệ chết; dot-bien khớp ghim qua đoạn mã nguồn bun in ra**
  Người dùng thấy gì: Bước thử phá bài kiểm tra có thể coi là «bài đỏ đúng lý do» nhờ trùng chữ trong mã nguồn chứ không nhờ thông báo thật. Hệ quả chỉ là độ tin cậy của việc thử phá thấp hơn vẻ ngoài.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts`
  severity: high
  Đề xuất: wont-fix

- **Hình dạng 2 — fixture không round-trip từ writer hiện tại: mau-luot-that/cham-tung-cau.jsonl là đầu ra của writer cũ, thiếu trường zalo mà reader ưu tiên**
  Người dùng thấy gì: Bài kiểm tra «lượt đo thật» dùng dữ liệu mẫu của định dạng cũ, nên đường đọc định dạng mới chưa được thử bằng bài này.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — lời hứa round-trip là quan hệ (mã thoát và dòng tổng bằng lượt thật), nhưng chỉ đo dòng chỉ số có mặt**
  Người dùng thấy gì: Bài kiểm tra chấm lại không so mã kết thúc với lượt thật và bỏ sót một dòng kết luận, nên một số lệch lạc vẫn qua được.
  file: `_acceptance/eval-model-that-dung-luc/rang/cham-lai.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — khẳng định âm tính đứng một mình: «không có dòng eve eval» ở lượt 2 không có đối chứng dương**
  Người dùng thấy gì: Bài kiểm tra «lượt hai không chạy lại bộ chấm» có thể xanh chỉ vì dòng chữ cần tìm đã đổi, chứ không vì bộ chấm thật sự không chạy.
  file: `_acceptance/eval-model-that-dung-luc/rang/luot-kep.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — kiểm thử đo khoá ngưỡng mà đường chạy thật không đọc: spec dùng CHAM_BO_DO.nguong, cham-bo-do chấm bằng NGUONG cục bộ**
  Người dùng thấy gì: Các bài kiểm tra dùng một bản ngưỡng, lượt đo thật dùng bản khác. Hôm nay hai bản giống nhau, nhưng nếu chỉ sửa một bản thì bài kiểm tra vẫn xanh trên số mà lượt đo thật không dùng.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — đo hàm trợ giúp thay vì đầu ra của lệnh: «GHI BAN GHI» chỉ đo dongKetLuot, không đo việc cham-bo-do in dòng đó**
  Người dùng thấy gì: Bài kiểm tra chỉ thử đoạn sinh chữ hướng dẫn ghi bản ghi, không thử việc lượt đo thật có in dòng đó. Nếu dòng bị bỏ, người chạy sẽ không biết phải ghi bản ghi và lượt sau lại đo mới, tốn tiền.
  file: `_acceptance/eval-model-that-dung-luc/rang/doi-dau-vao.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — khẳng định «không ghi đè» trong khi lượt sau không ghi gì, và chỉ kiểm tệp còn tồn tại**
  Người dùng thấy gì: Bài kiểm tra «lượt sau không ghi đè lượt trước» thực ra không ghi gì ở lượt sau nên luôn xanh. Rủi ro thực tế thấp vì mỗi lượt đã có thư mục riêng.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
