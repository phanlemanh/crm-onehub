# Review findings: re-mo-hinh-mac-dinh (round 1)

## Trong hợp đồng

- **so-nguong.ts only caps model errors in round one, so 4 Gemini errors on the Zalo round are silently dropped and the run still reports «đạt»**
  AC: AC-6
  file: `_acceptance/re-mo-hinh-mac-dinh/rang/so-nguong.ts:165`
  severity: high
  source: bugs
  detail: `kiem` checks only `loiMoi.length <= loiKy.length`, where `SO.luotLoi = 1` (line 41). Round-two (Zalo) errors are never counted. Before ketLuan computes chuyenQuyDinh, `hai.filter((c) => c.nhan !== "loi")` (line 149) also drops them from the denominator. What the committed evidence shows:
  - The signed bo-cau-hoi-mau run had 2 errors, both in round one (m09, m27), and 0 in round two.
  - The Gemini run in this record has 0 errors in round one and 4 in round two (m23, m28, m32, m43 in cham-tung-cau.jsonl lines 69/74/78/89). The do-bo-mau.md header reads `ma thoat cham-bo-do: 2` / `KHONG DO DUOC: 4 cau loi`.

  Running `bun _acceptance/re-mo-hinh-mac-dinh/rang/so-nguong.ts` ends with success and prints `loi model luot 1: (khong co) — tran 2` and `chuyenQuyDinh: 100.0% (42/42)`. The real figure is 42 of 46 eligible questions, with 4 that errored. Total model errors doubled (2 → 4), but the script reports «cau loi model trong tran».

  This contradicts AC-6 («câu lỗi gọi model không nhiều hơn lượt đã ký») and the will_do line in card-plain.json shown to the owner («câu lỗi model không nhiều hơn lượt đã ký»), neither of which limits it to round one. The script also never reads `maCham`, so the scoring tool's own verdict («KHONG DO DUOC») is ignored even though the AC says the result must pass «theo kết luận của bộ chấm». None of the red-path checks inject errors into round two, so the ruler has no red case for this gap. Fix: cap round-two errors too (or total errors) against the signed run, or at least print round-two errors next to the cap so the Evidence Gate card does not hide them.
  rationale: AC-6 đòi câu lỗi gọi model không nhiều hơn lượt đã ký và đạt theo kết luận bộ chấm; lượt Gemini có 4 câu lỗi so với 2 của lượt đã ký (bộ chấm trả «KHONG DO DUOC») mà thước vẫn báo đạt.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Cùng một mã model viết lặp làm chuỗi literal trong một tệp cấu hình, không lấy từ một nguồn**
  Người dùng thấy gì: Hôm nay máy soạn và trợ lý Kho tài liệu dùng đúng model mới và tính đúng giá. Lần sau đổi model, người sửa phải nhớ đổi nhiều chỗ, nếu sót thì sổ chi phí sẽ mất số mà không báo lỗi.
  file: `apps/agent/agent/lib/tai-lieu-config.ts`
  severity: low
  Đề xuất: known-limits

- **Bài kiểm của apps/agent import thẳng mã nguồn của app khác (apps/agent-okr) qua đường dẫn tương đối**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào. Nếu sau này ai đổi tên khai báo model chấm bên trợ lý OKR thì bài kiểm này chỉ báo lỗi khi chạy, chứ không báo sớm khi kiểm kiểu.
  file: `apps/agent/test/rmh-judge.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Assertion âm tính một mình (hình dạng 4): chiều đỏ «dung trang tut duoi nguong» ghim chữ «dungTrang», mà chữ này có trong mọi lần chạy**
  Người dùng thấy gì: Phép kiểm tự thử «thước có bắt được lỗi không» chưa chỉ rõ được nguyên nhân khi thước báo đỏ. Kết quả đo hiện tại vẫn đúng, nhưng sau này thước có thể báo đỏ vì lý do khác mà không ai phân biệt được.
  file: `_acceptance/re-mo-hinh-mac-dinh/rang/so-nguong.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
