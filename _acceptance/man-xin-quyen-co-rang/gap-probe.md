---
slug: man-xin-quyen-co-rang
at: 2026-09-16T16:18:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

# Phản biện context sạch — man-xin-quyen-co-rang

Một subagent context sạch, đầu vào đúng năm file: design doc, contract, evals,
decisions.jsonl, và corpus bài học từ hồ sơ trước (`claim-scan` exit 0, có nội
dung). Không đọc mã nguồn kho — mã chưa tồn tại.

Cả năm finding đã được SỬA TRONG ARTIFACT ở lượt này. Không mục nào đẩy sang
người ở Cổng 1. Không mục nào lật một quyết định đã ghi trong sổ.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | evals | E9 tuyên lời hứa LỚP nhưng số assert suy từ runtime, chỉ ghim «khác không» | Bộ chọn sót chữ trên nút đăng xuất; E9 đếm 4, assert 4, cả 4 đạt, thoát 0. Chiều đỏ vẫn xanh-đúng vì nó đột biến khoá title — một ô chắc chắn được quét. Đúng cái hỏng mà design gọi tên lại đi qua cổng | Ghim ma trận viết trước: 5 ô × 3 khổ = 15 khẳng định, số ô là hằng khai trong AC. Bắt được ít hơn 5 là từ chối đo. Chiều đỏ hai lần ở hai ô khác nhau, một bắt buộc là nút đăng xuất | fixed: AC-9 ghim mười lăm khẳng định và hằng năm ô; E9 cấm đếm-được-bao-nhiêu-assert-bấy-nhiêu, chiều đỏ hai lần |
| P1 | contract + evals | Out of scope chỉ loại trừ nhánh chỉ-Microsoft, nên người duyệt tin nhánh Google có đo thật — nhưng không eval nào gieo trạng thái một-nhà-cung-cấp | `grant-access.tsx` chọn sai khoá cho nhánh Google (trả khoá `both`). E2 vẫn xanh vì ba câu trong kho chuỗi vẫn khác nhau, và nhánh duy nhất dựng thật là `both`. Người chỉ liên kết Google đọc câu «cả hai nhà cung cấp». Cùng lớp với `[do-quyen-luot-bang-hanh-vi#F1]` | Gieo thêm trạng thái chỉ-Google và bắt AC-2 khẳng định quan hệ trên màn thật | fixed: AC-2 nay gieo HAI trạng thái và đo trên màn thật; Out of scope nói rõ chỉ nhánh Microsoft là chưa render; E2 thêm chiều đỏ thứ hai đúng ca mà lớp kho chuỗi không bắt được |
| P1 | evals | Chín chặn khai «chiều đỏ trên một bản sao» mà không chỗ nào ghim cách PHỤC VỤ bản sao đã đột biến | Người làm chọn đường rẻ: đột biến file rồi đọc lại file đó từ đĩa. Chiều xanh đo màn dựng, chiều đỏ đo file — hai thước khác lớp, cặp hai chiều thành giả. Lỗi ở tầng render vẫn lọt. Đúng bài học `[ma-tran-phai-co-chieu-song#F1]` | Khai một điều khoản chung: bản sao dựng ở CONG_SAO, `chotMayChu()` chốt trên bản sao, đường dẫn suy từ vị trí script | fixed: thêm khoá `chieu_do_dung_ban_sao` và điều khoản ba ý ngay đầu evals.yaml, áp cho mọi chiều đỏ |
| P1 | evals | E10 là chặn duy nhất không có chiều đỏ, và khẳng định thuần âm tính không có đối chứng dương | Phiên gieo hết hạn, `/grant-access` chuyển hướng về `/`. Hai ảnh vẫn chụp được nên không BLOCKED, sàn chạy trên hai ảnh trang chủ, không thấy P0 nào, thoát 0. E11 đo tiền đề nhưng là lượt chạy riêng nên không cứu được | Khẳng định đường cuối cùng và tiêu đề tài liệu trước khi chụp; in số luật sàn đã chạy và đòi khác không; thêm chiều đỏ hạ tương phản | fixed: E10 thêm hai đối chứng dương kiểm NGAY TRONG LƯỢT CHẠY CỦA CHÍNH NÓ, cộng một chiều đỏ |
| P2 | evals | E1 tuyên năm ô nhưng chiều đỏ chỉ đột biến MỘT ô; ràng «bằng năm» không chặn được bộ chọn trỏ nhầm | Ô «câu riêng tư» và ô «mô tả màn» cùng bắt một thẻ `<p>`. Đếm vẫn ra năm, cả năm quan hệ đều đạt. Câu riêng tư thật sót tiếng Anh, không chặn nào đỏ | Chiều đỏ năm lần, mỗi lần một khoá khác, mỗi lần phải gọi đúng tên khoá; thêm assert năm chuỗi khác nhau từng đôi một | fixed: E1 nay chiều đỏ năm lần có ghim tên khoá, cộng khẳng định chống bộ chọn trùng |
