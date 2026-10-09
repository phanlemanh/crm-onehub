---
slug: khoa-eve-khong-tranh
at: 2026-10-08T09:52:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | evals | E2 và E6 kiểm lời từ chối/lời ném TRƯỚC, nên thông điệp ghim của cặp (b), (c), (e) không bao giờ là lời đỏ đầu tiên [ca-chap-chon-cach-ly#F1] | Trên bản sao lối cũ, C lấy được khoá và trả về bình thường; bài đỏ ở «expected reject» chứ không ở «eve cua luot B bi dung»; E8 exit 1 dù phép phá đã bị bắt | Bắt kết quả bằng try/catch, kiểm vật trước (E1 còn sống, con = []) với thông điệp ghim, lời từ chối kiểm sau cùng | fixed: E2 và E6 viết lại thứ tự kiểm năm bước / vật trước lời ném sau |
| P1 | contract | Ô Core C3 (bộ dọn lúc exit) không có GWT, eval hay cặp phá | traKhoa có so ma nhưng bộ dọn exit vẫn rmSync vô điều kiện; A bị đổi khoá rồi thoát gỡ khoá của B; mọi eval xanh | Ca thoát tiến trình trong E6 và một cặp phá riêng | fixed: AC-4 thêm vế tiến trình thoát; E6 ca (3) A' process.exit(0); cặp (g) «don luc thoat go khoa nguoi khac»; SO_CAP_KHAI lên 8 |
| P2 | evals | E1 dòng (2) không làm cũ mtime thư mục, nên xetKhoaCu = false đúng cả trên mã cũ | Cặp (a) chỉ đỏ nhờ JSON.parse; lời hứa «phán khoá không cũ» không có chiều đỏ | utimesSync lùi thư mục quá nhipMs trước ghiConVaoKhoa; kiểm xetKhoaCu trước JSON.parse với thông điệp riêng | fixed: E1 dòng (2) lùi mtime; ghim cặp (a) đổi sang «khoa song bi phan cu giua luc ghi» |
| P2 | design | Dấu ino + ma khi ma vắng chưa có luật; ext4 cấp lại ino ngay | Khoá cũ không có chu.json; B tạo lại khoá trùng ino trước khi ghi chu.json; C coi là cùng khoá và gỡ khoá của B | Chốt luật so dấu và đo bằng ma trận trên hàm so dấu | fixed: dấu thêm mtimeMs thư mục; AC-6 mới (null chỉ bằng null); E9 ma trận sáu dòng trên cungDau, cặp (h) |
| P2 | contract | Ngưỡng CHẾT 20/20 không có đường đo; E8 chạy mỗi cặp một lần | Một cặp đỏ nhờ thời điểm, một lượt E8 vô tình đỏ; Cổng Bằng chứng ký mà không có số cho vế 20 lần | Tham số lặp của dot-bien.mjs, in số đếm từng cặp | fixed: E10 dot-bien --lap 20 --cap a,b,c; mục Đường đo thêm dòng |
