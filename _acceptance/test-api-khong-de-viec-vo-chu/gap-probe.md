---
slug: test-api-khong-de-viec-vo-chu
at: 2026-09-24T04:52:00Z
verdict: findings
p0: 0
p1: 1
p2: 2
---

# Gap probe — test-api-khong-de-viec-vo-chu

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E3 đếm lại bằng đúng điều kiện vừa dùng để xoá nên phép đếm luôn ra 0; không chờ lượt quét không ai chờ chạy xong | Lượt quét còn ghi sau dòng identify (portrait, workspace-profile) ngoài điều kiện xoá hoặc sau phép đếm, dòng sống sang gói agent mà E3 vẫn xanh | Đóng ứng dụng, chờ yên theo số dòng createdAt >= t0 không lọc, xoá theo điều kiện rộng, chờ yên, đếm lại rộng bằng 0; chiều đỏ khi thu hẹp điều kiện xoá | fixed: E3 expected nay đóng ứng dụng, chờ yên, xoá và đếm lại bằng điều kiện rộng createdAt >= t0 mọi loại; thêm chiều đỏ phần dọn |
| P2 | evals | E5 không nói «chưa xong» có trùng điều kiện claimDue không; không chạy claimDue ngay sau gói api [moi-bai-kiem-dom-deu-chay#F2] | claimDue nhặt dòng mà E5 không đếm, E5 xanh còn gói agent đỏ | Đếm theo đúng điều kiện claimDue hoặc mọi trạng thái; chạy chuỗi api rồi bài claimDue | rejected: claimDue (apps/agent/agent/lib/tasks.ts) chỉ nhặt dòng finishedAt IS NULL cộng điều kiện hẹp hơn, nên đếm finishedAt null là tập bao; E5 in thêm số dòng mọi trạng thái theo kind để đọc; chuỗi api rồi agent đã có trong bộ lệnh suite (bun run test) mỗi vòng S4 |
| P2 | evals | Chỉ E1 ghim bước tự kiểm đang đọc cơ sở dữ liệu của lượt; E5 là phép đếm âm tính không có đối chứng dương | Thước đọc nhầm cơ sở dữ liệu dev hoặc crm_test dùng chung, E5 in 0 trên cơ sở dữ liệu rỗng và xanh giả | Thêm tự kiểm cơ sở dữ liệu cho E4, E5; E5 có đối chứng dương trước khi đếm | fixed: E4, E5 expected nêu bước tự kiểm exit 2; E5 thêm đối chứng dương _prisma_migrations có ít nhất một dòng, không thì exit 1 'phep do mo' |
