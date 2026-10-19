---
slug: t1-ma-doc
at: 2026-10-17T01:28:40Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ d-20261017T012225Z-3 ghi nguồn một-lối cho khối `apps/**` `packages/**`, nhưng lối «glob theo quy ước eve + bộ quét xét cả tệp T1 trong cây mã» vẫn sống; đánh đổi phút CI lấy độ chắc là việc của người (cùng dạng [bo-cuc-hep-ngan-va-kanban#F1]) | Cổng Phạm vi ký khối nguyên vì tin chỉ có một lối; mọi PR chỉ sửa README hay .md trong cây mã chạy CI nặng mà chủ kho chưa được hỏi | Dòng sổ chỉ-người lên thẻ thành Hỏi, kèm số PR 90 ngày chỉ chạm .md trong cây mã | human-gate1: dòng sổ Hỏi-1 d-20261017T012656Z-8 (supersedes d-3), khuyên giữ khối nguyên; đo 17/10: 0/465 PR gộp 90 ngày chỉ chạm .md dưới apps/ packages/ |
| P1 | evals | Mọi eval đo quyết định của bộ phân loại, không đo đầu ra thật: sửa riêng tài liệu thì bài kiểm đọc nó có chạy lại và đỏ không; design không nói cache turbo | Turbo trả cache cho @crm/ui#test thì status-tone.spec không chạy lại, lệch lọt lên onehub dù E1–E9 xanh | Bản sao: sửa lệch bảng màu docs/design.md, chạy lại, phải đỏ với tên ca; đối chứng lành xanh | fixed: AC-10 + E9 (rang/dau-ra-that.mjs) ghim turbo.json test cache false, pre-push TURBO_FORCE=true, và đột biến bảng màu làm status-tone.spec đỏ «bang mau lech docs/design.md» |
| P1 | design | Bảng MIEN khoá theo đích, không theo cặp (đích, nguồn): nguồn đọc thật mới của tệp đã miễn bị che; E7a của chính vòng đọc CLAUDE.md mà CLAUDE.md đang trong danh sách miễn | PR chỉ sửa CLAUDE.md, xoá chữ t1_ma_doc khỏi đoạn PR nháp, được tính nhẹ; E7a không chạy, AC-7 hồi quy lọt | MIEN theo cặp; ca E5: miễn docs/cu.md ← a.ts rồi thêm d.ts đọc nó phải thieu-khai | fixed: MIEN khoá theo cặp (design mục Phán, AC-5, E5 ca 4 và 12); E7a chuyển sang răng khai.mjs ngoài bun run test, không bài kiểm nào đọc CLAUDE.md (AC-7, E7a mục e) |
| P1 | evals | E3 ca 1–3 chỉ đòi stdout rỗng — nhánh lỗi «không phân loại được» cũng cho stdout rỗng; E8 tepT1-khong-tru không chạy -t day; stdin viết tay | Kho tạm thiếu tệp chép hay tachT1 ném lỗi: ca 1–3 vẫn rỗng nhờ nhánh lỗi, E3 PASS | Ghim stderr không «không phân loại được»; E8 chạy cả -t day; stdin từ git push thật | fixed: E3 đi qua git push thật với hook tạm, mỗi ca ghim dòng stderr đúng nguyên văn và cấm «không phân loại được»; E8 tepT1-khong-tru đòi cả t1-ma-doc.spec -t day đỏ ca 1 |
| P2 | design | Căn cứ một-lối của d-20261017T012225Z-6 (pre-push im) không làm lối kia chết: AC-1 pre-push-t1 chỉ ghim stdout; PR này đằng nào cũng ghim lại pre-push-t1 | Cổng Phạm vi ký «pre-push im» vì tin vào ràng buộc không có thật | Ghi lại dòng sổ với nguồn đúng, lên thẻ thành Hỏi | fixed: dòng sổ Hỏi-2 d-20261017T012656Z-9 (supersedes d-6), khuyên thêm một dòng stderr; AC-3 và E3 soạn theo khuyến nghị |
