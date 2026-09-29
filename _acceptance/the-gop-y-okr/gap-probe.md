---
slug: the-gop-y-okr
at: 2026-09-29T12:20:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Phép đo bố cục (AC-1, AC-11, E1, E11) chỉ mở hộp Sửa mục tiêu; hộp Sửa KR dùng cùng cột mà không đo, và `hop-thoai-kr.tsx` không nằm trong `paths` | Hộp KR quên chuyển sang cỡ `assist`, câu mới vẫn ≈ 135 px; mọi phép đo vẫn xanh, và sửa `hop-thoai-kr.tsx` sau này không làm hoá cũ eval nào | E1 và E11 đo cả hai hộp; chiều đỏ «cau moi hep (kr)» | fixed: AC-1, AC-11 nêu cả hộp Sửa KR; E1, E11 đo từng hộp và thêm `hop-thoai-kr.tsx` vào `paths`; E9 khai giao ST-thegopy-hep và bề ngang của ST-thegopy-kr cho E1/E11 |
| P1 | contract | «Một nút chính mỗi thẻ» chưa định nghĩa cho thẻ câu hỏi: không có «Nhận», nên không biết thẻ đó có nút tô màu hay không | Bản dựng tô «Mở KR này» thành primary, cột có hai nút tô màu cạnh nhau; E9 và E14 đọc hai cách khác nhau | Luật theo loại thẻ, E9 đếm số nút tô màu theo từng dòng bảng | fixed: design §3, bảng trạng thái và opportunity chốt: viết lại, căn chỉnh, thông tin có đúng một nút tô màu; thẻ câu hỏi không có nút tô màu («Mở KR này» là nút viền); E14 hỏi «mỗi thẻ cần quyết»; E9 đếm `button[data-variant=default]` theo từng dòng |
| P1 | evals | E3, E5, E7, E10 so dữ liệu gửi đi với object viết tay, không với schema đầu vào thật của thủ tục | Đổi tên trường trong `troLyQuyetInput` hay `factDecisionInput`; bài DOM vẫn so với object cũ và xanh, còn máy chủ trả lỗi 400 | Parse payload bằng schema thật import từ `okr.contracts.ts` và `contacts.contracts.ts` | fixed: E3, E5, E7 parse bằng `troLyQuyetInput`; E10 parse bằng `factDecisionInput`, chiều đỏ đổi quyết định sang giá trị ngoài enum; deferred: ui-check cho tab Tổng quan, vì cần tác tử sinh thông tin bằng chứng yếu |
| P2 | evals | E8 hứa bắt sự cố «bấm Sửa đóng hộp» trong jsdom, nơi lỗi có thể không tái hiện | jsdom không phát sự kiện con trỏ như Chromium, bài xanh trên mã còn lỗi | Chiều đỏ theo hành vi; lớp chốt trong Chromium | fixed: chiều đỏ E8 ghim theo hành vi; bước đầu chạy ca trên cột của merge-base, không tái hiện thì in «jsdom khong tai hien»; E13 khẳng định sau mỗi cú bấm trong cột còn đúng một `role=dialog` |
| P2 | contract | Ngưỡng CHẾT «người lạ bấm nhầm Bác» trong opportunity không có đường đo | Buổi lái thử ghi vấp chung chung, không ai đếm được lần bấm nhầm, ngưỡng không bao giờ bật | Dòng Đường đo có nguồn và AC bảo đảm | fixed: thêm dòng Đường đo «số lần người lạ bấm Bác rồi nói mình định nhận», CHẾT ≥ 1, nguồn là cột riêng trong nhật ký vấp, bảo đảm bởi AC-2, AC-5, AC-10 |
