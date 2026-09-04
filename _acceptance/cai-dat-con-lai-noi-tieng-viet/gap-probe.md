---
slug: cai-dat-con-lai-noi-tieng-viet
at: 2026-09-04T14:20:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

# Phản biện context sạch — cai-dat-con-lai-noi-tieng-viet

Một lượt, phiên tươi, chỉ đọc bốn artifact cộng 12 bài học từ ba vòng chấm đợt
một. Không đọc mã. Cả năm sửa vào artifact cùng lượt, không chạy lại (một lượt).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract AC-12, evals E16 E10 | Đối chứng dương ĐỘC LẬP cho đoạn mã người chép. So `vi` với `en` là so hai lượt dựng từ CÙNG một template — bảng tự so với chính nó. Khoá API mỗi lần tạo một giá trị khác nên "giống hai lượt" bất khả thi theo cấu tạo. Bảng đóng kê tay; paths E16 thiếu slack và google [man-cai-dat-noi-tieng-viet#F2] | Dev sửa template thẻ script dùng chung (đổi dấu nháy) → cả hai lượt cùng sai, `vi === en`, E16 xanh, site khách vỡ. Khoá API: E16 thoát mã 2 mãi, hoặc dev bỏ khoá khỏi bảng và "số đoạn bằng số dòng" vẫn đúng | So với NGUỒN NGOÀI MÀN: script ↔ template từ token DB; khoá API ↔ giá trị API trả trong cùng lượt tạo; SSO ↔ cấu hình. Ứng viên sinh từ DOM mọi route, hai chiều, bảng phải có ≥1 dòng cho mỗi trong 6 file. Đột biến E10 áp lên template dùng chung | **fixed** — AC-12, E16, E10 viết lại đúng thế |
| P1 | evals E9 | Tập đo có thật. Workspace `onehub` mặc định KHÔNG có khoá API, SSO, kênh Slack — phần tử chứa dữ liệu người nhập không dựng ra màn, mà E9 đo trên màn [cua-vao-noi-tieng-viet#F2] | E9 thoát mã 2 vĩnh viễn, hoặc dev hạ xuống đọc mã không khai, hoặc chỉ gieo khoá API rồi ghi đạt cả bốn loại | Tách: chân mã (AST, bảng `(file, trường)`, khai là mức mã) + chân màn chỉ cho thứ gieo được không cần OAuth, in danh sách gieo được / không | **fixed** — AC-6b, E9 tách hai chân |
| P1 | design, contract AC-9 AC-8 AC-1 | Con số neo độc lập. "Năm thư mục, không đệ quy" bỏ sót 12 file dưới connections/*, và dân số với luật quét cùng một nguồn nên mọi "BẰNG" tự đúng [thuoc-cua-lat-3a-co-rang#F1] | Bản khai liệt năm thư mục → chân đọc 21 file, mọi đối chiếu khớp vì hai vế cùng luật, bốn màn kết nối ở lại tiếng Anh, toàn bộ xanh | Ghim bốn số neo từ S0 (33 · 10 · 6 · 9) trong bản khai; chân dan-so thoát mã 2 kèm diff khi lệch; liệt đủ mười thư mục | **fixed** — AC-9, E12, design sửa "năm" thành "mười" + neo |
| P1 | contract AC-5b, evals E7 | Ma trận toàn phần 4×5. E7 "liệt tên" mà không có tổng; CE chỉ có 2 "Not connected" cho 4 nguồn nên có ô dùng chung hoặc không có chữ mà eval không phân biệt "đã đo" với "bỏ" [man-cai-dat-noi-tieng-viet#F2] | "Reconnect" của Microsoft bị bỏ, `onehub` đang "chưa cắm" nên màn không lộ, chân liệt cái nó thấy, E7 xanh | Ma trận đóng 20 ô: mỗi ô = khoá / "dùng chung ô X" / "không tồn tại + lý do"; E7 đòi màn + mã + không-tồn-tại = 20 | **fixed** — AC-5b, E7 đòi đủ 20 |
| P2 | evals E17 | Dò chỉ grep hai tên hàm AST — chân DOM chép được mà không lộ; và không chứng "--lat mặc định giữ hành vi cũ", bằng chứng đợt một có thể không tái lập [d-20260904T115841Z-29963] | Chép be-rong.mjs rồi đổi ngưỡng → E17 xanh; `--lat` phân giải theo cwd → mũi gọi đợt một đọc nhầm bản khai, E17 vẫn xanh vì không chạy lại đợt một | Hai vế: so thân hàm ≥12 dòng giữa hai rang/ (chiều đỏ bằng chép be-rong); chạy lại mũi gọi đợt một không tham số, đòi 10·12·9 như báo cáo đã ký | **fixed** — AC-13, E17 hai vế |

Một mục chờ người (không phải finding): câu *"Comp AI reads the list from Slack
after it connects"* — dịch "Comp AI" thành OneHub (văn mô tả CRM) hay giữ (tên
ứng dụng Slack đã đăng ký)? Làn V: máy chọn **OneHub** vì câu là văn mô tả, không
phải chuỗi định danh gửi lên Slack; ghi vào sổ là quyết định tạm, người veto ở
Cổng Bằng chứng.
