# Review findings — thuoc-cache-het-doi-tuong

## Trong hợp đồng — máy đã sửa

- **Kết luận «hết đối tượng» dựa trên MỘT gói** — đã đo lại toàn kho: 10 gói, 46 cặp, 25 còn đệm.
- **Đối chứng dương rỗng** — đặt trên task `test` vốn không đệm nên luôn thoả. Đã dời sang một task CÒN đệm với một file trong khoá, và thêm lượt mồi.
- **Quy nhầm cả gói** — chân ban đầu quy mọi task của một gói là «đọc ngoài đồ thị» chỉ vì gói ấy có một file như thế. Task phân tích chỉ đọc văn bản.
- **Neo 30 sai** — thật ra 46 cặp, 25 còn đệm.
- **Chân của hồ sơ cũ đo chuỗi thay vì đo quan hệ** — vế `db:test` bắt oan `bun run test`, mà chính `test-run.ts` gọi `db:test`. Đã đổi sang đo quan hệ.
- **Một bản khai vô tác dụng CÓ SẴN, không phải của vòng này** — `packages/db/turbo.json` khai `inputs` cho `dev:prepare`, task `cache: false`. Tiêu chí AC-3 là toàn kho nên nó nằm trong hợp đồng; đã gỡ phần trơ, không đổi hành vi.

## Ngoài hợp đồng — người quyết ở Gate 2

- **Vòng này sửa `evals.yaml` của một hồ sơ NGƯỜI ĐÃ KÝ**
  Người dùng thấy gì: hồ sơ `lenh-chung-khong-an-cache-doi` anh ký hôm qua nay ít đi hai tiêu chí (AC-3, AC-4), và ba gạch Known limits giải thích vì sao. Phạm vi hợp đồng ấy hẹp lại thật, không chỉ số đếm đổi như những lần trước.
  file: `_acceptance/lenh-chung-khong-an-cache-doi/evals.yaml`
  severity: P1
  Đề xuất: known-limits — hai tiêu chí ấy KHÔNG THỂ xanh lại vì tiền đề bị commit 6f581bb vá mất, và giữ một phép đo không bao giờ xanh là đúng lớp lỗi cả chuỗi này tồn tại để chặn; nhưng đây là artifact người đã ký nên người phê hay veto

- **Lỗ re-pin của bộ kit vẫn còn nguyên**
  Người dùng thấy gì: nghi thức re-pin chỉ chạy bốn lệnh chứng chứ không chạy lại phép đo của hồ sơ. Chính nó đã cho một hồ sơ ký hỏng đi thẳng vào nhánh chính hôm qua, và CI xanh suốt.
  file: `_acceptance/thuoc-cache-het-doi-tuong/decisions.jsonl`
  severity: P1
  Đề xuất: new-contract — lỗi của bộ kit đi chip riêng sang `~/dev/acceptance-gate-kit` theo CLAUDE.md, không sửa tại chỗ

- **Chỉ MỘT hồ sơ được chạy lại**
  Người dùng thấy gì: AC-5 chứng `lenh-chung-khong-an-cache-doi` dựng lại được. Sáu hồ sơ đã ký khác không được chạy lại; nếu một trong số chúng cũng mất tiền đề sau lần hợp nhất 88 commit, vòng này không thấy.
  file: `_acceptance/thuoc-cache-het-doi-tuong/contract.md`
  severity: P2
  Đề xuất: known-limits — chạy lại eval của mọi hồ sơ sau mỗi lần hợp nhất là việc của bộ kit chứ không của một vòng tính năng
