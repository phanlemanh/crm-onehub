# Review findings: eval-model-that-dung-luc (round 4)

## Trong hợp đồng

Không có phát hiện nào nằm trong hợp đồng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ngưỡng E15 có hai nguồn: CHAM_BO_DO.nguong (quyet-do.ts) và NGUONG (cham-bo-do.ts), mỗi bên được kiểm bởi một bài khác nhau**
  Người dùng thấy gì: Ngưỡng đạt/không đạt của phép đo Kho tài liệu đang ghi ở hai chỗ. Hôm nay hai chỗ giống nhau, nhưng ai sửa một chỗ thì phép đo thật và bài kiểm có thể chấm theo hai ngưỡng khác nhau mà không ai thấy.
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`
  severity: high
  Đề xuất: known-limits

- **khuonDongTungCau rộng hơn dữ liệu thật, rồi bị ép kiểu: kết cục lỗi đọc vào bị dán thành `sai`/`khong-chuyen`**
  Người dùng thấy gì: Nếu tệp kết quả của một lượt đo bị sửa tay hoặc hỏng, một câu lỗi hạ tầng có thể bị tính nhầm thành trả lời sai khi chấm lại. Lượt đo thật bình thường không gặp trường hợp này.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`
  severity: high
  Đề xuất: known-limits

- **docBanGhi/docBanGhiHead nuốt lỗi đọc thành null: bản ghi hỏng hiện ra như «chua co ban ghi»**
  Người dùng thấy gì: Khi bản ghi kết quả đã lưu bị hỏng, hệ thống báo là chưa có bản ghi và lặng lẽ đo lại bằng model thật, tốn tiền mà không ai biết bản ghi đang hỏng.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`
  severity: medium
  Đề xuất: known-limits

- **E15_QUYET đi qua ranh giới tiến trình bằng `JSON.parse(...) as Quyet`, không qua khuôn**
  Người dùng thấy gì: Nếu còn sót một thiết lập cũ trong phiên làm việc, lượt đo có thể ghi ra bản ghi mang dấu vân tay không khớp đầu vào thật, và lượt sau tin nhầm để dùng lại.
  file: `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts`
  severity: medium
  Đề xuất: known-limits

- **pathsCuaE15 đọc evals.yaml bằng regex thay vì Bun.YAML.parse như các răng khác, đổi định dạng thì lặng lẽ ra []**
  Người dùng thấy gì: Nếu cách viết danh sách tệp của phép đo này bị đổi, hệ thống sẽ lặng lẽ bỏ sót nhiều tệp khi xét đầu vào đã đổi chưa, và có thể dùng lại kết quả cũ dù mã đã thay.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`
  severity: medium
  Đề xuất: known-limits

- **Nhãn bị nới từ literal union thành `string` dù kiểu NhanMot/NhanHai đã có**
  Người dùng thấy gì: Một lỗi gõ nhãn trong công cụ đo sẽ không bị trình biên dịch bắt, nhưng hiện chưa có lỗi nào xảy ra và người dùng không thấy ảnh hưởng.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`
  severity: low
  Đề xuất: wont-fix

- **Đơn vị thời gian viết tay lặp lại thay vì dẫn xuất từ một gốc**
  Người dùng thấy gì: Vài mốc thời gian trong script đo được viết lặp ở nhiều nơi; không ảnh hưởng kết quả hay người dùng.
  file: `_acceptance/eval-model-that-dung-luc/rang/luot-kep.mjs`
  severity: low
  Đề xuất: wont-fix

- **E13 and dot-bien pair (h) pick a run folder that has no cham-bo-do.md, then crash with exit 1 instead of a clear 'cannot measure'**
  Người dùng thấy gì: Nếu có một lượt đo bị ngắt giữa chừng, phép kiểm tra của vòng này báo đỏ cứng thay vì báo là chưa đo được, cho tới khi có một lượt hoàn tất mới hơn.
  file: `_acceptance/eval-model-that-dung-luc/rang/cham-lai.mjs`
  severity: medium
  Đề xuất: known-limits

- **Re-ask round runs real model calls even when another metric already failed outright, so the result is fixed at exit 1**
  Người dùng thấy gì: Khi một chỉ số đã rớt hẳn mà chỉ số khác chỉ sát ngưỡng, hệ thống vẫn hỏi lại model thật và tốn tiền dù kết quả cuối đã chắc chắn là không đạt.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.ts`
  severity: low
  Đề xuất: new-contract

- **Shape 4 (negative assertion with no real pinned message): pair g of dot-bien only goes red through bun's code frame, because the guard never fires**
  Người dùng thấy gì: Một phép thử phá cố ý báo đỏ đúng nhưng bằng chứng nó đưa ra về lý do đỏ không đáng tin, nên người duyệt có thể tin nhầm là bài kiểm bắt đúng lỗi.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Shape 5 (claims a full class sweep but has only point cases): the E1 label table has 12 of 20 cells and counts against itself**
  Người dùng thấy gì: Bài kiểm cách gán nhãn cho các câu hỏi chưa thử hết các tổ hợp, nên một nhánh hiếm có thể gán nhãn sai mà không bị bắt.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion of a constant): `hoiLanBa` false can never fail, and E7's ma 1 and round-2 `loi` → ma 2 cases are not measured**
  Người dùng thấy gì: Hai tình huống của lượt hỏi lại, gộp vẫn không đạt và lượt hai có câu lỗi, chưa có bài kiểm riêng nên nếu chúng hỏng sẽ không ai biết ngay.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (asserts presence while the promise is a relation): cham-lai.mjs does not compare the re-scored exit code with the real run's exit code**
  Người dùng thấy gì: Phép kiểm chấm lại chỉ xác nhận các dòng tóm tắt có mặt, không đối chiếu kết luận đạt/không đạt với lượt thật, nên một sai lệch kết luận có thể lọt.
  file: `_acceptance/eval-model-that-dung-luc/rang/cham-lai.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 (hand-written input instead of the real scope): the 'paths E15' row of the hash matrix picks a file inside layer 1**
  Người dùng thấy gì: Bài kiểm dấu vân tay đầu vào chưa tách riêng được nhóm tệp khai trong phép đo, nên nếu nhóm đó bị bỏ sót thì bài kiểm vẫn xanh.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 5 (claims all indices but covers 2 of 4): the test for loi exclusion from the numerator and denominator has an empty round-2 set**
  Người dùng thấy gì: Bài kiểm việc loại câu lỗi khỏi tính toán chỉ thử với nhóm câu đầu, nên nhóm câu chuyển sang Zalo chưa được kiểm tương tự.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 3 (asserts presence while the promise is a relation): 'round 1's file stays intact after round 2 writes' is measured only by existence, and round 2 never writes**
  Người dùng thấy gì: Bài kiểm việc giữ nguyên nhật ký lượt trước chỉ xem tệp còn tồn tại, không xem nội dung; nguy cơ thấp vì chưa thấy lần ghi đè nào.
  file: `_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Shape 4 (negative assertion with no positive control): luot-kep.mjs asserts the line «eve eval tro-ly-kho/cham-bo-do» is absent in round 2 but never confirms it is present when round 1 measures fresh**
  Người dùng thấy gì: Phép kiểm lượt thứ hai không gọi model dựa vào việc không thấy một dòng chữ, mà chưa chứng minh dòng chữ đó thật sự xuất hiện khi có gọi model, nên nếu chữ đổi thì phép kiểm vẫn xanh.
  file: `_acceptance/eval-model-that-dung-luc/rang/luot-kep.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
