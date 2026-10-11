---
slug: okr-mau-xoa-cau-hinh
at: 2026-10-10T23:18:06Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Ô «người ngoài × chỉ mã mẫu» không có AC; sau khi gỡ, mảng rỗng mà phạm vi vẫn danh-sach, và chỉ cauHinhAiLuc được đo | Bộ đọc ở biên từ chối danh sách rỗng khi phạm vi là danh-sach thì okr.program ném, trang Cài đặt → OKR hỏng, E3/E4 vẫn xanh | Ca gạt thành rỗng, đọc qua bốn bộ đọc thật | fixed: AC-4 thêm vế gạt thành rỗng; E4 ca thứ hai gọi OkrService.program, docChamVaTran, docThangCham, cauHinhAiLuc, ghim 'omc: cau hinh sau gat khong doc duoc' |
| P1 | evals | Spec omc- để lại hàng okrProgramConfig cho các spec chạy sau trên cùng CSDL | Spec chạy sau đọc cấu hình krCap 9 hay bản mẫu sót, đỏ theo thứ tự chạy tệp | Chụp bảng ở beforeAll, trả lại ở afterAll, ca so ảnh chụp | fixed: thêm AC-11 và E11 (omc-tra-lai, ghim 'omc: spec de lai cau hinh', đối chứng dương 'omc: tra lai khong co gi de do'); E3 khai beforeAll/afterAll chung |
| P1 | evals | E7 không ghim vanTayKho băm nội dung hàng; không có cặp đột biến cho AC-7 | Gạt mảng ngoài giao dịch, thoát 5, số hàng giữ 2, E7 xanh | Ghim băm nội dung; cặp (h) dời bước gạt ra ngoài giao dịch | fixed một phần: E7 ghim rằng vanTayKho băm md5 nội dung mọi hàng (apps/api/test/okr-mau-san.ts, đã đọc). rejected cặp đột biến: xoaTrong chỉ nhận tx, nap.ts không nhập client db, nên không có đường ghi ngoài giao dịch để phá |
| P2 | contract | Lời khẳng định phép đo của hồ sơ okr-mau-xoa-cuoc-soan vẫn chạy không có eval | Vòng này đổi dòng chứa chuỗi neo, dot-bien.mjs của hồ sơ anh em thoát 2 | Eval chạy E9 của hồ sơ anh em | fixed: AC-10 và E10 chạy config:executors.script.omx_dot_bien, đòi 7/7 |
| P2 | evals | Phép quét mảng của E1 không có danh sách cột đối chiếu; chiều đỏ của E1 chỉ chạy tay | Phép quét chỉ duyệt một bảng mà đối chứng dương vẫn xanh | Trả danh sách cột, so truy vấn độc lập; đưa chiều đỏ vào E9 | fixed: E1 so danh sách cột đã quét với truy vấn udt_name '_text' và 8 cột ghim, ghim 'omx: quet mang thieu cot'; E9 thêm cặp (h) cho omx_xoa, SO_CAP_KHAI = 8 |
