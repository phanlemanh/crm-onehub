---
slug: zalo-hoi-okr-khong-chet
at: 2026-10-08T17:10:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

Phản biện lần hai, trên bộ artifact viết lại sau S4 round 1 (hướng mới chủ kho duyệt 08/10).

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | E8 và chiều đỏ của E1 cất `tools/tro-ly-okr-ngoai.ts` khỏi cây tại chỗ trong lúc workflow chạy eval song song, không giữ khoá chung | E1 chạy trên cây thiếu công cụ đè, E2 import hỏng, bộ kiểm quét `agent/tools/` đỏ giả, hoặc đụng `eve dev` thoát 2 | Khoá chung cho mọi chế độ của `c33.mjs`; E2/E5 kiểm tệp có mặt đầu và cuối lượt | fixed: bỏ hẳn việc cất tệp — E8 tắt công cụ đè bằng công tắc đo `TRO_LY_OKR_BO_DE=1` truyền vào tiến trình `eve dev` của lượt, kiểm `git status` sạch trước và sau; chiều `--do` của E1 bỏ (chiều đỏ trên eve thật đã đo ở round 1, `do-3`). Mỗi lượt cham-bo-do vẫn đi qua `mot-luot.sh` nên không đụng `eve dev` |
| P0 | contract | AC-1/E1 còn viết theo giả thuyết cũ: tính lượt gọi subagent là sai, chiều đỏ đòi dòng hook cũ, nói đường có gọi do E2/E5 chứng | Bản sửa đúng mà một lượt model vẫn gọi thì E1 đỏ oan; chiều đỏ không bao giờ đạt | Lượt có gọi hợp lệ khi có dòng `ngoai-okr` và vẫn trả lời; bỏ câu E2/E5; E2 so `inputSchema` | fixed: AC-1/E1 nhận lượt có gọi khi `eve.log` có `[okr-uy-quyen] ngoai-okr purpose=zalo` và lượt đạt đủ ba điều; bỏ câu «đường có gọi do E2/E5 chứng», trỏ sang AC-7; chiều đỏ trỏ bằng chứng round 1 và cặp (d). `inputSchema`: rejected — subagent không khai `inputSchema`, eve dùng `UNSPECIFIED_INPUT_SCHEMA` (`execution/node-step.js`), và round 1 `do-3` cho thấy lượt có gọi chỉ chết vì hook |
| P1 | evals | AC-7/E8 ở đường có gọi chỉ đòi tin khác `tacTuLoi`, không đòi đúng một tin có chữ OKR | Phiên con từ chối, model gốc gửi câu xin lỗi khác — E8 vẫn xanh trong khi đúng điều kiện CHẾT | E8 dùng nguyên phép kiểm (3) của E1 | fixed: AC-7 đòi đủ ba điều của AC-1; E8 dùng nguyên ba phép kiểm (1)–(3) của E1 cho mọi lượt |
| P1 | evals | E7 đo bằng sự có mặt: không có ca việc OKR đang chạy ở phiên khác | Bản cài lấy việc đang chạy bất kỳ vẫn qua E7; Zalo nộp được đề xuất vào việc nền | Ca việc của phiên khác + cặp phá bỏ điều kiện phiên gốc | fixed: AC-6 và E7 thêm ca việc `okr-de-xuat` đang chạy gắn phiên gốc khác → phải `tu-choi` («nop_de_xuat: nhan viec cua phien khac»); thêm cặp (f) bỏ điều kiện phiên gốc; E5 lên 7 cặp |
| P1 | contract | Sổ hứa ghim lại `tro-ly-okr-nen` trong cùng PR mà AC-4/E4 không cho tệp của hồ sơ đó | Ghim lại thì E4 đỏ; không ghim thì bằng chứng của hồ sơ đã ký hoá cũ trên onehub | Thêm tệp ghim lại vào ranh giới, giới hạn phần được đổi | fixed: AC-4/E4 cho `_acceptance/tro-ly-okr-nen/run-log.jsonl` (chỉ dòng thêm kind repin) và `evidence-report.md` (chỉ `verified_commit` và mục «### Re-pin» cuối); đối chứng `contract.md` của hồ sơ đó → ngoài ranh giới |
