---
slug: tat-preview-agent-okr
at: 2026-10-04T05:52:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

# Gap-probe — tat-preview-agent-okr

Phản biện context sạch (một tác tử tươi, chỉ đọc design doc, contract, evals, decisions và
bài học xuyên hồ sơ).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals (E5), contract (AC-4) | Đối chứng crm-onehub-app chỉ chứng Vercel thấy lần đẩy, không chứng agent-okr bị ảnh hưởng; dự án bật «bỏ dự án không bị ảnh hưởng» | HEAD chỉ chạm `_acceptance/**` → Vercel bỏ agent-okr vì không ảnh hưởng → E5 xanh dù deploymentEnabled vô tác dụng | E5 đo trên commit gần nhất chạm `apps/agent-okr/`, đối chứng bằng status Vercel của crm-onehub-* | fixed: AC-4 Given và E5 đo trên S = commit gần nhất chạm `apps/agent-okr/`; đối chứng là status GitHub «Vercel – crm-onehub-*» của S đã hết pending |
| P1 | evals (E5, E6), contract (AC-4) | Lời hứa là check không đỏ; AC-4 chỉ đo không có deployment | Vercel đăng status failure mà không có deployment (như «Root Directory does not exist») → E5 xanh, PR vẫn đỏ | Đọc thêm commit status GitHub; E6 làm đối chứng dương | fixed: AC-4 Then và E5 đòi không có status «Vercel – agent-okr» failure/error; E6 đòi bắt được status failure trên 9333acad |
| P1 | evals (E4) | Chữ ký ca `sao` ghim "fix/a" trong khi assert từng phần tử dừng ở `feat/a` đầu bảng | Cài đúng mà E4 thoát 1, đốt round | Ghim theo cách không phụ thuộc thứ tự | fixed: E3 so cả bảng trong một `toEqual` nên diff liệt mọi nhánh lệch; ca `sao` đòi cả `fix/a` lẫn `claude/a` lệch, `main` không lệch |
| P1 | evals (E8) | E8 ghim "Ignored Build Step" mà design doc ghi reason là «configured to skip this build» | E8 đỏ oan | Chép reason nguyên văn từ API | rejected: reason nguyên văn từ API (`dpl_7gzCfDYa…`) là «The deployment was canceled because the Ignored Build Step command is configured to skip this build.», có chứa chuỗi ghim; design doc nay trích nguyên câu |
| P1 | evals (E7) | E7 nhận mọi bản production cho sha, kể cả bản deploy tay; không tách CANCELED vì bị bản mới hơn thay | Đường lui deploy tay làm E7 xanh oan; merge kế tiếp làm E7 đỏ oan | Chỉ tính `source: git`; tách ca bị thay | fixed: E7 chỉ tính `source: git` (bản tay mang `source: cli`, đo 04/10), CANCELED vì bị thay → mã 2 BI-THAY; thêm E10 trên ff8c3372 đòi bỏ qua `dpl_9Ldx…` (cli, READY) và gọi tên `dpl_6tv5…` (git, CANCELED) |
