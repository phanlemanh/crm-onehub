---
slug: khoa-rieng-dien-node
at: 2026-09-25T21:08:00Z
verdict: findings
p0: 0
p1: 0
p2: 5
---

# Gap-probe — khoa-rieng-dien-node

Phản biện context sạch, một lượt. Đầu vào: design doc, `contract.md`, `evals.yaml`, `decisions.jsonl`
và claims của các hồ sơ trước (input 5). Probe không đọc mã. Nó ghi thêm hai điểm không thành
finding. Một: React không gộp cảnh báo «same key», nên `test.each` chung một tiến trình không làm
ca sau im. Hai: chiều đỏ của E2 (bảy ca đỏ khi bỏ `.filter`) khớp với kết quả tách mẫu.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P2 | evals | Chiều đỏ «mã trước sửa» của E1 không chạy được: E1–E3 chung tệp, và import tĩnh `dienNode` chưa export làm hỏng cả tệp | Người chấm chạy E1 trên commit trước sửa, bun báo lỗi nạp mô-đun, không có thông điệp «khoa trung o …» | Chỉ khai chiều đỏ bằng phá thử, hoặc tách tệp | fixed: tệp lấy `ChuyenViecDialog` và `dienNode` bằng `await import` (namespace), nên mã cũ nạp được tệp và E1 đỏ đúng thông điệp; E2 trên mã cũ đỏ vì `dienNode` không phải hàm, chiều đỏ đúng nghĩa của E2 lấy bằng phá thử; Notes của contract viết lại |
| P2 | contract | Trục 1 và E2 thiếu mẫu có đoạn chỉ gồm khoảng trắng giữa hai chỗ trống | Người làm viết `.filter((phan) => phan.trim() !== "")`, cả mười ca xanh, mẫu `"{ten} {vaiTro}"` sau này dính chữ | Thêm ca `"{a} {b}"` → `"A B"` | fixed: ca thứ 11 vào trục 1, AC-2, E2 (33 khẳng định); chiều đỏ (b) của E2 là biến thể `trim` |
| P2 | evals | Không ai đối chiếu số ca runner thật chạy | Một dòng ma trận bị xoá hoặc `test.skip`, bun in 9 pass, E2 xanh | Đếm ca | fixed: `afterAll` mỗi nhóm so số ca đã chạy với hằng 4 và 11 viết riêng, thông điệp ghim «nhom <ten> chay <n> ca, phai <k>»; AC-2 thêm vế đếm |
| P2 | contract | AC-4 mù với eval đỏ sẵn ở cả hai cây mà sổ không có entry descope, E4 không in chúng | Một eval màn thật soi chữ trong hộp đỏ ở cả hai cây vì thiếu máy chủ, E4 thoát 0 và người ký không biết lệnh nào không được đo | Entry descope có tên, E4 in «DO SAN» | fixed: E4 in từng dòng «DO SAN» và tổng số, AC-4 thêm vế đó; entry descope «AC-4 không đo lệnh đỏ ở cả hai cây» vào sổ; chiều đỏ E4 ghi rõ `kh2_chuyen_giao_man` và `lmcv_ba_khoa` là test DOM, không cần máy chủ |
| P2 | evals | `TEP_VONG` của E4 viết tay, lệch khi S3 chạm tệp thứ ba [mot-duong-ghi-phong-ban#F1] | S3 sửa thêm một tệp, eval đã ký đo tệp đó không bị rút | Suy D từ `diff` | fixed: tập tệp của vòng là hợp của hai tệp khai với `diff` thật từ `merge-base`; rejected phần «D phải chứa hai tệp đã khai, thiếu thì mã 1» — sau merge, một PR khác chỉ chạm hộp sẽ làm vế đó đỏ giả, đúng lớp Ngoài-1 mà d-6 tránh |
