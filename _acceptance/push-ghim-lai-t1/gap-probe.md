---
slug: push-ghim-lai-t1
at: 2026-10-18T14:19:59Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design (sổ d-20261018T141333Z-3) | Căn cứ sai nguồn: câu trích opportunity.md buộc có ca đỏ nhưng không chọn giữa commit thật và kho mẫu dựng tay — đúng điều dòng sổ quyết. Cùng dạng [dich-ten-nganh-bang-bang#F1]. | Người duyệt tưởng chủ kho đã chọn ca đỏ trên commit thật; giá phụ thuộc lịch sử chưa ai ký nhận. | Thay d-3 bằng dòng nguồn mot-loi nêu ràng buộc: kho mẫu không round-trip từ repin-lane.mjs. | fixed: dòng d-20261018T141959Z-10 thay d-3, nguồn mot-loi (kho mẫu viết tay không đi qua repin-lane.mjs). |
| P1 | design + contract (AC-4) + evals (E2, E3) | Luật glob-qua-sau nằm trong bộ quét, mà PR thêm tệp sâu được xếp chi-t1 và bỏ test nên bộ quét không chạy ở đúng PR đó. | PR làn đêm thêm _acceptance/x/rang/f/run-log.jsonl mà một răng đọc: CI và pre-push xếp nhẹ, lỗi lọt onehub; E4 vẫn xanh vì gọi bộ quét trực tiếp. | Ca «16 tệp + tệp sâu» ở E2, E3 phải nặng; đột biến E8 làm ca này đỏ. | fixed: luật số đoạn chuyển vào tachT1 (hàm chung CI, pre-push, bộ quét); AC-4 viết lại; E2 ca 8, E3 ca 3; E8 ca bo-luat-so-doan; dòng sổ d-20261018T141959Z-9 thay d-2. |
| P1 | contract (AC-7) + evals (E7) | Chưa kiểm on.pull_request (paths, paths-ignore, types) và continue-on-error ở job hay bước Pre-merge check — đo chuỗi-có-mặt thay quan hệ «job chạy và đỏ ở mọi PR». | Ai đó thêm paths-ignore cho run-log.jsonl hoặc continue-on-error vào Pre-merge check: PR ghim lại không chạy gate hoặc gate đỏ mà job xanh; E7 và E8 cũ vẫn xanh. | Mở rộng kiemJobCong, mỗi luật một ca đỏ cùng fixture có thông điệp ghim; thêm đột biến paths-ignore. | fixed: AC-7 thêm on.pull_request, types, continue-on-error cấp job và bước, if của bước; E7 thành 9 ca có tên luật ghim; E8 ca cong-loc-duong. |
| P1 | evals (E6 ca b) | Ca âm tính chưa ghim nguyên nhân; không có đối chứng cho thấy VIOLATION đến từ recheck chứ không từ mọi sửa đổi. | Pre-merge đỏ vì lý do khác; E6 xanh mà không chứng recheck còn bắt run_id giả. | Ghim dòng VIOLATION chứa nonce; ca lành cùng commit không có dòng đó. | fixed: (b) ghim «VIOLATION [t1-ma-doc]» chứa nonce; thêm (c) sửa suites_exit trong run-log.jsonl ghim «nonzero suites_exit»; (a) lành cùng commit làm đối chứng. |
| P2 | evals (E6) | Răng tự viết lệnh pre-merge-check với --slug thay vì chạy đúng run: của bước CI; bản giả chỉ chạm .md đã là T1 từ trước, không chạm .jsonl vừa nới. | Bước CI gọi cổng khác tham số; PR ghim lại có bằng chứng giả xanh ở CI dù E6 xanh. | Đọc run: từ acceptance.yml thật và chạy với ngữ cảnh pull_request; thêm ca giả trong .jsonl. | fixed: E6 lấy kịch bản Pre-merge check từ acceptance.yml qua Bun.YAML, thay biến pull_request/onehub, đặt origin/onehub; ca (c) giả trong run-log.jsonl; giới hạn «giả nhất quán cả hai không bị bắt» ghi vào Notes của hợp đồng. |
