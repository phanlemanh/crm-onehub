---
slug: thuoc-cache-het-doi-tuong
at: 2026-09-07T11:40:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện context sạch

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | contract | AC-2 không khai dân số «task mà một lệnh chứng chạy». Dân số hẹp (chỉ ô cắm test) thì bất biến chỉ còn một phần tử vốn đã `cache:false`, nên xanh vĩnh viễn bất kể ai thêm suite mới — đúng ca AC-2 tự nhận là chặn | Chân lấy dân số hẹp: bất biến rỗng nghĩa. Người duyệt Cổng 1 không đọc được đây là ca nào | Bảng toàn phần viết trước: mỗi ô cắm một dòng, cột (gói, task, đệm hiệu lực, có --force, thoả hay không). Số dòng bằng số cặp giải được, chân in số dòng | fixed: AC-2 nay ghim bảng toàn phần và bắt in số dòng; đo được 4 ô cắm → 30 cặp (gói, task) |
| P0 | design + contract | Tiền đề gỡ AC-3/AC-4 chỉ đo trên MỘT gói (`@crm/ui`, 4 task). Kho có 10 gói và **30 task còn đệm** | `apps/app#check-types` còn đệm và có thể đọc ngoài gói; lời khai «hết đối tượng» SAI, lớp lỗi cache dối vẫn sống ở gói khác — đúng lớp lỗi vòng trước | AC-4 lấy danh sách gói từ `workspaces` của `package.json`, số dòng bằng số cặp (gói, task còn đệm) giải được, mã 2 nếu quét ít hơn số gói khai | fixed: đã đo lại TOÀN KHO — 10 gói, 30 task còn đệm; **chỉ 2 file** trong mọi gói trỏ ra ngoài đồ thị (`apps/api/test/listing-fixture-batch.spec.ts`, `packages/ui/test/lai-ra-man.spec.tsx`), **cả hai nằm trong `test/`** là task duy nhất `cache:false`. Tiền đề đứng, nay có số |
| P1 | evals | E4 đo «có đọc ngoài gói» bằng hành vi chạm-rồi-chạy nhưng KHÔNG có đối chứng dương. Toàn bảng «không đọc» vừa là kết quả thật vừa là triệu chứng của phép chạm hỏng — `[d-20260906T200100Z-9607]` ghi đúng ca này đã XANH GIẢ | Phép chạm ghi nội dung trùng, hoặc chạm nhầm file bị bỏ qua. Mọi task cache-hit, bảng toàn «không đọc», E4 mã 0, kết luận rút từ một phép đo chưa bao giờ bể được cache nào | Một dòng chứng dương ghim tên: cặp (gói, task, file) đã biết là có đọc, phép chạm ấy phải làm cache BỂ. Chứng dương đỏ → mã 2 | fixed: E4 nay có chứng dương ghim tên `packages/ui#test` với `_acceptance/.../da-tim-thay.json`; nội dung chạm là chuỗi chưa từng có và in ra log |
| P1 | contract + evals | AC-5 so số eval đã chạy với số eval còn khai — hai vế rút từ CÙNG một file, không neo độc lập. Cùng cấu trúc với `[chan-lai-component-ra-man#F2]` | Vòng gỡ nhầm ba eval thay vì hai. Số chạy vẫn bằng số khai, tất cả mã 0, E5 xanh, và hồ sơ cũ được tuyên «dựng lại được» trong khi vừa mất thêm một phép đo | AC-5 ghim ĐÚNG danh sách mã eval còn lại; E5 đối chiếu TÊN với danh sách ghim, lệch một tên là mã 1 kèm tên thừa hoặc thiếu | fixed: AC-5 nay ghim danh sách `E1 E2 E5 E6 E7 E8` và đối chiếu theo tên |
| P1 | contract + evals | AC-8 hứa một QUAN HỆ (cổng chạy test trên cơ sở dữ liệu theo lượt) nhưng đo bằng sự có mặt của chuỗi `bun run test` | Ai đó đổi `scripts.test` về `turbo run test`. Ô cắm vẫn chứa nguyên chuỗi, E8 vẫn mã 0, mà cổng lại chạy trên cơ sở dữ liệu dùng chung — hết đối tượng đúng kiểu bên-thứ-ba-đổi-cấu-hình vừa giết hồ sơ hôm qua | E8 chạy ô cắm test thật và đọc `TEST_DATABASE_URL` hiệu lực, chứng nó mang `TEST_RUN_ID` và KHÁC nhau giữa hai lượt liên tiếp. Chuỗi lệnh chỉ là điều kiện phụ | fixed: AC-8 và E8 nay đo tên cơ sở dữ liệu thật của hai lượt liên tiếp và đòi chúng khác nhau |

Không finding nào lật quyết định đã ghi trong `decisions.jsonl`.
