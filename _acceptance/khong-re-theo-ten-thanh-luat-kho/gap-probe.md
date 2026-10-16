---
slug: khong-re-theo-ten-thanh-luat-kho
at: 2026-10-15T15:38:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Câu trích của dòng sổ d-20261015T145045Z-1 (docs/design.md, bảng «Dấu hiệu vẽ tay») chỉ liên quan, không quyết chọn oxlint; còn lối sống khác là một bài kiểm trong bun run test. | Người ký đọc như thể tài liệu mục tiêu đã chọn oxlint, trong khi máy chọn giữa các lối còn sống. | Thay d-1 bằng dòng mới có căn cứ đúng, hoặc nguồn một-lối nêu vì sao lối bun run test chết. | fixed: dòng sổ mới supersedes d-1, nguồn một-lối — bài kiểm trong bun run test ăn cache turbo của gói chứa nó nên PR chỉ chạm gói khác không quét lại; bước CI riêng thì pre-push không chạy. Thiết kế mục 1 ghi lý do này. |
| P1 | contract | Một luật hay hai luật: thiết kế và AC-1 nói một luật kèm tuỳ chọn cho_phep, sổ và evals nói hai luật; E4 chỉ chèn CLOSED_WON. | Dựng theo một hình thì đột biến hay AC kia trượt; import GIAI_DOAN_GOC có thể lọt E17. | Chốt một hình; thêm ca chèn GIAI_DOAN_GOC vào E4. | fixed: chốt hai luật (khong-re-theo-ten-giai-doan cho bảy id, khong-dung-giai-doan-goc cho tên) ở thiết kế, AC-1, AC-4, E5; E4 thêm ca chèn export GIAI_DOAN_GOC, đo xanh. |
| P1 | design | oxlint mở hai đường tắt mà quét chữ cũ không có: chỉ thị tắt trong tệp và override tắt cho thư mục con; tự kiểm E17 chỉ hỏi tệp mồi mỗi thư mục. | PR thêm oxlint-disable-next-line hoặc override cho apps/api/src/dashboard/** — lint:slop và E17 cùng xanh. | E5 thêm hai đột biến; E17 soát mọi overrides. | fixed: E17 soát overrides tắt luật ngoài chỗ miễn đã khai, tệp cấu hình lồng, chỉ thị (oxlint or eslint)-disable trong bảy thư mục, mã 2; paths E17 đổi .oxlintrc.json thành **/*oxlintrc*; E5 thêm override-thu-muc-con và chi-thi-tat, 5/5 bị bắt. Phần mỗi PR (lint:slop tôn trọng chỉ thị) ghi Out of scope kèm lý do. |
| P1 | evals | Danh sách tệp của thiết kế và E8 thiếu package.json gốc và bun.lock dù vòng tạo gói tools/oxlint/onehub/package.json. | bun install ghi gói vào bun.lock, E8 đỏ NGOAI DANH SACH bun.lock. | Chốt plugin không phải workspace, hoặc thêm bun.lock vào danh sách. | rejected: tools/oxlint/onehub/package.json chỉ khai type module như tools/oxlint/anti-slop/package.json, không nằm trong workspaces; bun.lock không đổi (git status sạch sau lint:slop); E8 đo xanh ở đỉnh. package.json gốc nằm trong paths của E1–E3 vì nó khai lệnh lint:slop, vòng không sửa nó. |
| P2 | evals | E6 dùng tệp mồi viết cứng mà không kiểm chúng nằm ngoài paths của mọi eval khác của hồ sơ. | Eval khác khai apps/api/src/** thì E6 đỏ vì tệp mồi sai. | E6 rút hoặc kiểm tệp mồi so với hợp paths của eval khác. | fixed: E6 kiểm tệp mồi với hợp paths của E1–E19 trừ E17, nằm trong thì KHONG DO DUOC mã 2; đo: hai tệp mồi ngoài. |
