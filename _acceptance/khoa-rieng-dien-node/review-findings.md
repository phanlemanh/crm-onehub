## Trong hợp đồng

- **Infra failures in khong-hoi-quy.mjs exit with 1, the same code as a real regression**
  file: `_acceptance/khoa-rieng-dien-node/rang/khong-hoi-quy.mjs:160`
  severity: medium
  AC: AC-4
  `git("worktree", "add", "--detach", cayGoc, coSo)` (line 160) runs outside the try/finally, and so do `git("merge-base", ...)` (line 102) and `git("diff", "--name-only", ...)` (line 107). All three go through execFileSync, which throws on a non-zero git exit. Nothing catches the throw, so Bun exits with code 1 (checked: an uncaught execFileSync error gives EXIT 1) and never prints a "KHONG DO DUOC" line. Exit 1 is the code this script uses for "vong nay lam do them N lenh" (the round made N more commands red) and for "bo rut tap hong" (the eval-selection step is broken). Contract AC-4 and decision d-...-6 exist to keep infrastructure errors off code 1 (they call this Ngoai-2) and put them on code 2. Only the missing-ref case got that handling. Concrete scenario: `.acceptance-runs/khoa-rieng-dien-node/goc` still exists as a non-empty directory that is no longer a registered worktree, for example after a prune or a partial cleanup of a killed run. `git worktree remove --force` then quietly does nothing, `worktree add` fails with "already exists", and the script exits 1. That reads as a regression even though no command was compared on the base tree. Fix: wrap these git calls, or move them inside the try, and route failures to `dung(2, "KHONG DO DUOC: ...")`.
  source: bugs
  rationale: AC-4 định nghĩa rõ ràng lỗi hạ tầng (không đọc được ref) phải thoát mã 2, không được thoát mã 1 như một vòng làm đỏ thêm lệnh; finding cho thấy các lỗi git khác ngoài trường hợp ref-thiếu (worktree đã tồn tại, merge-base hoặc diff lỗi) vẫn rơi vào thoát 1, khiến AC-4 thất bại ở những tình huống hạ tầng chưa được xử lý.

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): bộ loại «quét lồng» của E4 grep chữ trong mã nguồn cả tệp script, không xét lệnh thật làm gì, nên loại nhầm ndk_pham_vi, một eval đỏ ở HEAD và xanh ở B**
  file: `_acceptance/khoa-rieng-dien-node/rang/khong-hoi-quy.mjs:113`
  severity: high
  AC: AC-4
  `laQuetLong` (dòng 113-120) loại một lệnh khi tệp `_acceptance/*/rang/*.mjs` mà lệnh gọi có chứa chữ "worktree" hoặc "repin-lane" ở bất kỳ đâu trong mã nguồn (DAU_QUET_LONG, dòng 19). Lệnh không được chạy để xem nó có dựng cây hay gọi làn ghim không. Hậu quả đo được: `ndk_pham_vi` (`bun _acceptance/neo-dan-so-khong-cung/rang/do-neo.mjs --ca pham-vi`, eval neo-dan-so-khong-cung:E7, hồ sơ signed-off, paths "apps/**" khớp dialog) bị in «LOAI quet long» và không chạy. Lý do chỉ là do-neo.mjs có các ca khác nhắc tới hai chữ đó: caCayLech gọi `git worktree add` ở dòng 412, và dòng 550 nhắc tới scripts/repin-lane.mjs. Còn caPhamVi (dòng 479-500) chỉ đọc `git diff merge-base...HEAD`, không dựng cây và không gọi làn ghim. Theo AC-4, chỉ lệnh nào «dựng cây gốc khác hoặc gọi làn ghim» mới bị loại, nên lệnh này phải nằm trong tập chạy. Đã chạy nó ở HEAD: thoát 1, «SAI sua — pham-vi: doi ngoai _acceptance va T1: …chuyen-viec-dialog.tsx, apps/app/test/dien-node-khoa-rieng.dom.tsx». Ở B = merge-base, diff rỗng nên lệnh xanh. Nếu được chạy, nó rơi đúng vào nhánh «HEAD đỏ, B xanh» và E4 thoát 1. Như vậy kết quả mã 0 ghi ở contract.md (lượt 73fd6733, 5 lệnh loại) có được một phần nhờ bộ phân loại dán nhãn sai. Bộ phân loại đọc lời mô tả trong tệp, không đọc hành vi của lệnh.
  source: measurement
  rationale: AC-4 khai rõ chỉ lệnh "dựng cây gốc khác hoặc gọi làn ghim" mới bị loại khỏi tập chạy; finding chỉ ra bộ lọc thực tế grep chữ trong toàn bộ mã nguồn tệp script chứa lệnh đó, nên loại nhầm một ca (phạm-vi) không thực sự làm việc bị cấm, đúng vi phạm tiêu chí loại trừ mà AC-4 đã định nghĩa.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E2 expected tự mâu thuẫn về số ca và số khẳng định, lệch với test**
  Người dùng thấy gì: Việc mô tả trong hồ sơ kiểm ghi sai số ca và số lần kiểm chứng không làm hộp chuyển việc chạy sai cho người dùng; nó chỉ có thể khiến người đọc lại hồ sơ hiểu nhầm quy mô đã kiểm khi xác nhận tính năng.
  file: `_acceptance/khoa-rieng-dien-node/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **E2 expected text in evals.yaml gives the wrong case and assertion counts**
  Người dùng thấy gì: Việc mô tả trong hồ sơ kiểm ghi sai số ca và số lần kiểm chứng không làm hộp chuyển việc chạy sai cho người dùng; nó chỉ có thể khiến người chấm hồ sơ hiểu nhầm quy mô đã kiểm khi đối chiếu kết quả.
  file: `_acceptance/khoa-rieng-dien-node/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận viết trước không khớp số phần tử): mô tả E2 khai «10 ca» và «33 khẳng định», nhưng ma trận liệt kê 11 mẫu và test chạy 44 khẳng định**
  Người dùng thấy gì: Việc mô tả trong hồ sơ kiểm ghi sai số ca và số lần kiểm chứng không làm hộp chuyển việc chạy sai cho người dùng; nó chỉ có thể khiến người chấm hồ sơ hiểu nhầm quy mô đã kiểm khi đối chiếu kết quả.
  file: `_acceptance/khoa-rieng-dien-node/evals.yaml`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/5 lỗi rơi vào file không bộ đo nào phủ (_acceptance/khoa-rieng-dien-node/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.