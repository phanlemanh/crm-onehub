## Trong hợp đồng

- **Hồ sơ bằng chứng chứng cho một bộ tiêu chí không còn tồn tại — E8/E9 chưa từng chạy trong làn có sổ**
  AC: AC-1
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/evidence-report.md:10`
  severity: high
  Commit cuối `47cea41` viết lại AC-1 trong contract.md và thêm E8 + E9 vào evals.yaml (dòng 103, 118) cùng hai executor mới trong config.yaml — SAU khi `44c2315` đã ghi evidence-report.md.

  Tại HEAD (trước vòng này), evidence-report.md vẫn khai `verdict: PASS`, `verified_commit: e035792` (lùi hai commit), bảng chỉ có E1–E7, và run-log.jsonl dòng round-tally cuối ghi `expected: 7, returned: 7`. Không có dòng `round: 3` nào trong run-log.jsonl, và không có dòng nào mang evalId E8/E9 của bộ đo mới.

  Chính contract.md tự khai: «E9 là eval DUY NHẤT trong hồ sơ bắt được việc gỡ bản vá khỏi cây làm việc.» Eval mang tải đó có 0 lượt chạy được ghi sổ.

  Backstop staleness của kho KHÔNG bắt được: `scripts/pre-merge-check.sh` (dòng 219-220) khai rõ mọi thay đổi dưới `_acceptance/` không làm cũ bằng chứng. Nên PASS lỗi thời này đi qua CI xanh.

  Tiền lệ trong chính kho: feature liền trước làm đúng cách — commit `7e5f425 verify(hd-theo-danh-sach): re-verify under one logged lane` chạy lại cả làn và cập nhật evidence-report + run-log khi bằng chứng phải đổi. Vòng này thiếu commit tương đương.

  Sửa: chạy lại làn S4 với đủ 9 eval, cập nhật evidence-report.md (bảng, verified_commit) và ghi round 3 vào run-log.jsonl.
  source: conventions

- **E8/E9 added after the PASS was minted — no evidence entry, no lane, and nothing detects the drift**
  AC: AC-1
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/evidence-report.md:5`
  severity: high
  Commit 47cea41 added E8 (apr_moc_to_tien) and E9 (apr_moc_khop_cay) to evals.yaml plus two executors to _acceptance/config.yaml, but did not touch evidence-report.md or run-log.jsonl. The record therefore still claims verdict: PASS with failed_evals: [] over E1-E7 only (verified_commit: e035792, run-log round-2 tally `"expected":7,"returned":7`), while contract.md AC-1 now states "Ba eval E1 + E8 + E9 cùng nhau mới là AC-1". Nothing catches the mismatch: stale_files() in scripts/pre-merge-check.sh:483 skips every `_acceptance/*` path, so changing the eval set post-verify never marks evidence stale, and `evals_hash` recorded in run-log.jsonl has zero consumers (`grep -rn evals_hash scripts/` returns nothing). Ran `bash scripts/pre-merge-check.sh . --base 5ac85ef` and it printed `pre-merge-check: clean`. Net effect: the two evals that exist specifically to bind the pinned marker to the working tree have never run under a logged lane, and the gate reports the feature as fully evidenced anyway.
  source: bugs

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hai mục Known limits / Ngoài hợp đồng rỗng khiến cổng tự kết «xanh-sạch, KHÔNG mời ký» cho hồ sơ có 3 finding severity high**
  Người dùng thấy gì: Tính năng có thể được gộp vào nhánh chính mà không ai đọc qua các hạn chế và vấn đề đã biết, vì hồ sơ trình cho người duyệt hiển thị trống dù thực tế có nhiều mục chưa xử lý.
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/evidence-report.md`
  severity: high
  Đề xuất: new-contract

- **Vá riêng vào tệp của hãng mà không có đường gửi lên hãng — và AC-2 khoá vĩnh viễn độ lệch ở đúng một dòng**
  Người dùng thấy gì: Bản sửa này chỉ áp dụng riêng cho bản rẽ mà chưa có quyết định rõ ràng về việc gửi lên bản gốc của hãng, nên khác biệt với bản hãng sẽ tồn tại lâu dài và mỗi lần cập nhật từ hãng sẽ tốn thêm công xử lý tay.
  file: `.github/workflows/auto-pr.yml`
  severity: medium
  Đề xuất: known-limits

- **Known limits written into contract.md instead of evidence-report.md silently suppresses the Gate-2 signature**
  Người dùng thấy gì: Tính năng có thể được gộp vào nhánh chính mà không ai đọc qua các hạn chế đã biết, vì nơi ghi hạn chế không phải là nơi hệ thống duyệt tự động đọc để quyết định có cần người ký hay không.
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/evidence-report.md`
  severity: high
  Đề xuất: new-contract

- **AC-1's pinned-commit evals go permanently red / permanently blind the next time auto-pr.yml legitimately changes**
  Người dùng thấy gì: Nếu sau này ai đó sửa đúng cách vào quy trình mở PR tự động, phép kiểm tra hiện tại sẽ báo lỗi mãi mãi cho tới khi có người cập nhật lại phép kiểm tra bằng tay.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Record claims E9 is the only eval that catches removal of the patch — E2 and E3 catch it too**
  Người dùng thấy gì: Tài liệu nói chỉ có một phép kiểm tra phát hiện việc gỡ bản vá, nhưng thực ra có ba phép kiểm tra cùng phát hiện — mức bảo vệ thật sự tốt hơn những gì tài liệu mô tả.
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Đối chứng âm-tính-một-mình — chiều đỏ của E2 đỏ trên MỌI cây, có vá hay không**
  Người dùng thấy gì: Một trong các phép thử đối chứng không thật sự phân biệt được bản đúng với bản sai, nhưng đây là hạn chế chủ sản phẩm đã biết và đã chấp nhận từ trước, không ảnh hưởng tới việc bản vá chính có hoạt động đúng hay không.
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/evals.yaml`
  severity: high
  Đề xuất: known-limits

- **Đối chứng âm-tính-một-mình — chiều đỏ của E3 cũng đổi khuôn thay vì đổi cây, làm hỏng lối thoát mà hợp đồng dựa vào**
  Người dùng thấy gì: Cách ghi lại để chứng minh phép thử thứ hai hoạt động đúng chưa thật sự chứng minh được điều đó, dù bản thân phép thử vẫn phát hiện đúng khi thử trên bản có lỗi thật.
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Khẳng định phủ sóng không có phép đo đỡ — «E9 là eval DUY NHẤT» sai, kiểm được bằng một lượt chạy**
  Người dùng thấy gì: Tài liệu nói chỉ có một phép kiểm tra phát hiện việc gỡ bản vá, nhưng thực ra có ba phép kiểm tra cùng phát hiện — mức bảo vệ thật sự tốt hơn những gì tài liệu mô tả.
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/evals.yaml`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 9/10 lỗi rơi vào file không bộ đo nào phủ (_acceptance/auto-pr-thoi-do-o-ban-re/evidence-report.md, _acceptance/config.yaml, _acceptance/auto-pr-thoi-do-o-ban-re/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
