---
slug: loi-tac-tu-zalo-noi-dung-nguyen-nhan
at: 2026-09-24T09:32:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E7 và E2 dò «không lộ» bằng JSON.stringify, mà hàm này biến Error thành {} — mù đúng ở đối tượng lỗi fetch mang /bot<T>/ | log truyền nguyên đối tượng lỗi có URL chứa token; stderr thật lộ token, phép dò chỉ thấy {} nên AC-6 xanh | tuần tự hoá bằng Bun.inspect; đột biến truyền nguyên Error có /bot<T>/ | fixed: AC-2, AC-6 nói rõ tuần tự hoá như console in kể cả Error; E2, E7 đổi sang Bun.inspect; E7 thêm đột biến (2) truyền nguyên đối tượng lỗi |
| P1 | design, contract, evals | Lối token sai qua thân 200 ok:false error_code 4xx không có ô đo; E3 chỉ có HTTP 401 | Zalo trả 200 {ok:false,error_code:401}, bản cài chỉ đọc HTTP nên báo «Zalo đang không trả lời» cho token sai — lật chiều lỗi gốc | thêm ô ok:false 401 → tokenSai và ok:false 500 → zaloKhongTraLoi; đột biến bỏ nhánh đọc error_code | fixed: AC-3 thành 6 ô (d) ok:false 500, (f) ok:false 401; E3 thêm hai ô và đột biến (2); vỏ lỗi theo vỏ Zalo thật lái thử 23/09, ghi [GIẢ ĐỊNH] ở Coverage vì chưa bắt được getMe hỏng thật |
| P1 | contract, evals | Ô sai khuôn chỉ dùng JSON hợp lệ bị zod từ chối, không ô nào gửi thân không phải JSON | res.json() nằm chung try với fetch; thân HTML ném SyntaxError rơi vào nhánh mạng, người dùng thấy «Không gọi được», log ghi khong-toi-duoc | tách ô (e) JSON sai và (f) text/html; ma trận 6 × 2 = 12; đột biến gộp res.json() vào try của fetch | fixed: AC-1, AC-2 sáu tình trạng, mười hai ô; E1 thêm ô (f) và đột biến (2); design ghi lý do |
| P2 | evals | Chưa ca nào đặt Bot Token vào thân lời gọi cầu nối đúng lúc API ghi warn — khẳng định không lộ phía API là hằng đúng | service thêm input vào dòng warn cho dễ tra; luuBot mang token trong thân nên lộ vào log API, E2 và E7 vẫn xanh | ở năm ô luuBot của E2 dùng token đánh dấu; khẳng định không warn nào chứa nó; đột biến đưa input vào warn | fixed: AC-2 nêu Bot Token là chuỗi đánh dấu; E2 dò token và thêm đột biến (2) |
| P2 | evals, design | Ca «cổng không ai nghe» không nói cổng lấy đâu, không kiểm cổng còn đóng; hệ điều hành có thể cấp lại cổng cho tiến trình test song song | api#test đóng cổng P, zaloMayChu của agent#test được cấp đúng P; ô mạng gọi nhầm Zalo giả kia, đỏ giả xen kẽ | dùng địa chỉ từ chối tất định; thăm dò trước mỗi ô, không bị từ chối thì dừng với thông điệp lỗi môi trường | fixed: mọi ô mạng dùng http://127.0.0.1:1 và thăm dò trước (AC-1, AC-3, AC-4, AC-6; E1, E3, E4, E7); design mục Test ghi lý do |

Ngoài cap 5 (critic nêu, máy định đoạt): trạng thái `ST-ket-noi-zalo-luu-hong` không có eval riêng — rejected: màn Kết nối không đổi mã ở vòng này, và ô token hiện nguyên văn câu lỗi API đã được đo ở `nzm_o_token` (test «o-token: 2 … loi cua API») của hồ sơ đã ký `noi-zalo-cho-nguoi-moi`; E3 đo câu API mà ô đó chuyển tiếp.
