---
slug: chan-trung-khoa-ban-nhap
at: 2026-10-04T04:52:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

# Gap probe — chan-trung-khoa-ban-nhap

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | contract | Lời hứa «agent nhận lỗi nêu đúng ô» không AC nào ghim đường dẫn issue trong error-text; AC-5/AC-6 và E2 chỉ dò chuỗi thông điệp, mà thông điệp chỉ nêu khoá mà hai dòng cùng mang | AI SDK hay eve chỉ đưa thông điệp, bỏ path; agent không biết sửa dòng nào mà E2 vẫn xanh | Then của AC-5/AC-6 ghim path; E2 so path có chỉ số | fixed: AC-5/AC-6 ghim issue có path; E2 cắt mảng issue từ error-text rồi so toEqual path + message |
| P1 | evals | E5 câu (3) hỏi các hàm «không đổi» và chú thích trong «mã mới» — hội đồng chỉ đọc bản hiện tại, không có diff | Người cài sửa chanTrungKhoa; hội đồng không có gì để so, đoán PASS hoặc FAIL oan | Bỏ vế không-đổi khỏi judgment; chú thích giao lint:slop | fixed: AC-8 và E5 bỏ vế «không đổi», câu (3) hỏi điều đọc được trên bản hiện tại (nopBanNhap có tự kiểm trùng theo khoaModel không); chú thích do lint:slop trong suite bắt; «không đổi» chỉ còn ở Out of scope |
| P2 | evals | E1 thoát-0 không ghim số ca; E3 không ghim n; E4 không đòi ba ca nhận có mặt | Ca (e) KR trùng khoá khác cha bị quên hay đặt tên lệch, AC-4 chưa đo mà vẫn xanh | Ghim 7 pass; E4 đòi đúng ba (pass) | fixed: E1 «7 pass, 0 fail»; E3 «don-vi: 7 pass», «tich-hop: 2 pass»; E4 đúng bốn (fail) + đúng ba (pass) |
| P2 | evals | E4 tích hợp chỉ đòi (fail) theo tên, không ghim nguyên nhân; E3 không nói cách đổi schema, có thể làm ca toBe đỏ ở chiều xanh | Bản sao đỏ vì lỗi nạp module hay CSDL vẫn tính là đỏ đúng chữ ký | Nêu cách đổi; ghim thông điệp expect của phép đếm execute | fixed: răng chỉ đổi đường import okr-cuoc-soan và chỉ chạy ca trung-khoa (ca toBe mang tên khác); E4 đòi đúng hai (fail), 0 pass, và thông điệp «execute chay o buoc mot» |
| P2 | design | Không kê nơi khác dùng banNhap (extend/pick, parse dữ liệu đã lưu) | Zod 4 ném khi extend object có refine, hay đường đọc bản nháp cũ ném | Kê kết quả tìm toàn kho trong design | fixed: design thêm mục «Ai dùng banNhap» — chỉ công cụ và bài kiểm validation; không extend/pick/omit; không parse dữ liệu đã lưu |
