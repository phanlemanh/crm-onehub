---
slug: lam-moi-chuyen-viec-qua-loi-chung
at: 2026-09-25T15:20:00Z
verdict: findings
p0: 0
p1: 1
p2: 4
---

# Gap-probe — lam-moi-chuyen-viec-qua-loi-chung

Phản biện context sạch, một lượt, đầu vào: design doc, `contract.md`, `evals.yaml`,
`decisions.jsonl`, và claims của các hồ sơ trước (input 5). Trước khi gửi probe, máy đã tự sửa
AC-5 theo claim [mot-duong-ghi-phong-ban#F1]: danh sách tám khoá viết tay đổi thành tập rút bằng
máy (49 lệnh).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E5 rút cả những eval cũng là lượt quét không-hồi-quy của hồ sơ khác; `paths` của E5 là `apps/**`/`packages/**`; đối chứng dương phụ thuộc `diff` thật | Hai lượt quét chạy lồng nhau, hoặc sau khi ký mọi vòng chạm `apps/**` kéo E5 vào và E5 đỏ vĩnh viễn «bộ rút tập hỏng» | Loại lượt quét lồng, thu hẹp `paths` của E5, đối chứng dương không phụ thuộc `diff` | fixed: E5 rút theo ba tệp mã cố định của vòng (gác «không tệp mã nào ngoài ba tệp»), thoát 0 sớm khi ba tệp giống hệt ở `merge-base`; đối chứng dương cố định rut([dialog]) ∋ moi-phia:E3, rut([cache.ts]) ∋ tvhk:E19; lệnh trỏ `rang/*.mjs` có chữ `worktree` bị LOẠI và in tên; `paths` E5 thu về ba tệp + script; AC-5 viết lại |
| P2 | evals | Chiều đỏ `settle: "record"` của E2 là đột biến tương đương vì `run` vẫn chờ nhóm `record` | Phá thử ở S3 vẫn xanh, người làm sửa thước sau duyệt | Dùng `run([], [ba khoá], { settle: "record" })` | fixed: E2 đổi chiều đỏ sang dời ba khoá vào nhóm không chờ, giữ đột biến bỏ `await` |
| P2 | evals | Khẳng định âm của E3 không có đối chứng dương cùng lệnh, cùng bộ ghi | Bộ ghi gắn nhầm client, E3 luôn xanh | Lần bấm thứ hai thành công trên cùng fixture phải ra 3 lời gọi | fixed: E3 và AC-3 thêm lần bấm thứ hai thành công trên cùng bộ ghi, thông điệp ghim riêng |
| P2 | evals | Ma trận E1 ghim khoá dạng chuỗi chấm — proxy tRPC viết tay theo khuôn bên đọc | Khoá thật khác khuôn, test xanh theo luật khớp tự chế | Proxy tRPC thật trên client giả, so với `queryKey()` của cùng proxy | fixed: E1 dùng `createTRPCOptionsProxy` thật trên `createTRPCClient` với link giả; gieo và so bằng khoá do thư viện sinh |
| P2 | evals | E4 không khai gốc kho suy từ vị trí script | Chạy trong cây `merge-base` của lượt quét sau, đọc nhầm cây | Khai gốc từ `import.meta.url`, chạy thử từ thư mục khác | fixed: E4 khai gốc từ vị trí script, in đường tuyệt đối, S3 chạy thêm từ `/tmp` |
