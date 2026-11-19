---
slug: chuyen-cho-delivery-loop-3-0
at: 2026-11-19T18:20:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | AC-8 nói «mọi hồ sơ lưới đòi ghim», dòng sổ d-11 chỉ ghim hồ sơ đỏ vì vòng; E8 so run-log với danh sách người điền sau làn ghim — vòng tròn | Hồ sơ X có eval paths khớp scripts/**, xanh hay đỏ cả hai bên, không ghim; E8 xanh vì hai tập rỗng như nhau; Cổng Phạm vi tin mọi hồ sơ bị chạm đã ghim | E8 đọc tập từ tệp kết quả làn khô, assert run-log đổi bằng tập ấy, thêm ca phá | fixed: AC-8 viết lại theo đúng d-11 (ba lớp đỏ cả hai bên · đo diff của nhánh · đỏ vì vòng); E8 thêm ca đọc evidence/phan-loai-ghim.json do rang/chay-kho.mjs và rang/phan-loai.mjs sinh, suy lại ứng viên từ evals.yaml và diff, ba tập ghim phải bằng nhau, ba bản phá; sau làn khô thêm lớp «giới hạn đã duyệt» khai bằng dòng `gioi-han` ở hợp đồng (Hỏi-4), đỏ cả hai chiều |
| P1 | evals | Hai sha cho cùng thẻ: hợp đồng ghi c16d25db, chú thích evals.yaml ghi 228f9b64 | Kit đọc theo một ảnh khác ảnh hợp đồng hứa, hoặc mọi eval đọc kit đỏ dù vật đúng | Cùng một sha, nói rõ loại; assert rev-parse v3.0.0^{commit} | fixed: c16d25db là commit, 228f9b64 là đối tượng thẻ — ghi ở hợp đồng AC-1 và chú thích evals.yaml; rang/kit.mjs so v3.0.0^{commit}; ca «kit đọc đúng commit của thẻ v3.0.0, không phải đối tượng thẻ» |
| P1 | evals | Mệnh đề «bộ kiểm của kho xanh» của AC-9 không có eval; d-6 dựa vào bộ kiểm để bắt import còn trỏ dieu-phoi/scripts/ | Một tệp ngoài hai thư mục kiểm còn nạp ../dieu-phoi/scripts/dot.mjs; E2b, E5b, E9 vẫn xanh | Eval chạy suite_keys; ca cấy import; paths cho E9 | fixed: ca mới quét mọi tệp mã được theo dõi, giải từng import tương đối, 0 đích dưới dieu-phoi/scripts/, bản cấy đỏ đúng thông điệp (AC-1); mệnh đề suite của AC-9 nay đọc theo lệnh suite của lượt chấm S4 — suite_keys chạy mỗi lượt, đỏ sẵn trên nền theo nhãn do_san của kho (9 ca api#test đỏ trên cây chưa sửa); E9 khai paths |
| P1 | contract | Lớp chép 3.0 mang luật 2.38 T3-CAN-HO-SO-GUARD; AC-7 không bao giờ kích nó; hợp đồng nói không bật luật mới | PR sau chạm packages/auth bị chặn bởi một phán quyết mới mà không AC hay dòng sổ nào ghi | Ca đối chứng có diff chạm t3_paths, hoặc ghi là đổi được chấp nhận kèm dòng sổ | human-gate1: ghi vào AC-7 và thiết kế mục 1 là khác biệt luật duy nhất của lớp chép; dòng sổ Hỏi-3 (chi-nguoi) — khuyên nhận theo mốc v3.0.0, lối khác là bản chép vá riêng |
| P2 | evals | E2, E3 đo chuỗi có mặt; tên chợ trong marketplace.json của thẻ chưa đối chiếu; cache dựng theo hằng số | Thẻ khai tên chợ khác; job gom chết ở bước cài, phiên không nạp plugin | Đọc .claude-plugin/marketplace.json tại thẻ, assert name và sáu plugin | fixed: ca «chợ của thẻ mang tên delivery-loop và đủ sáu plugin đã bật» với hai bản phá (AC-3, E3). deferred: chạy thật các bước cài của tin-hieu-gom.yml cần CLI claude và mạng — phép thử phiên K6 (--phien) chạy trước và sau gộp, ghi vào mô tả PR |
