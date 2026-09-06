---
slug: tiep-thi-tuyen-doi-tac
at: 2026-09-04T13:05:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
claims_input: ok
---

# Phản biện context sạch — S1

Một phiên tươi đọc sáu tệp (thiết kế, hợp đồng, bộ đo, sổ quyết định, bài học
từ hồ sơ trước, hồ sơ Cổng Đáng); không đọc mã, không thấy hội thoại. Một lượt,
không phản biện lại sau khi sửa (phần mã đã có ba vòng S4).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Đường đo lệch hồ sơ Cổng Đáng hai chiều: dòng «≥ 60% cuộc gọi từ danh sách» không có trong hồ sơ hiện hành (là ngưỡng của ô cũ); dòng «đường nền» trỏ vào hoạt động Gọi vốn không mang kết quả nên không ra tỷ lệ trả lời; và «toàn tập» tính cả chính chiến dịch nên với một chiến dịch tỷ số luôn bằng 1 | Người ký tin đường nền có sẵn; tại phiên nghiệm thu ngưỡng 2× chết theo cấu trúc hoặc không có số để so | Bỏ dòng 60%; đường nền thành dòng bỏ có tên; đối chứng = mọi chiến dịch khác; E13 thêm bài «chỉ một chiến dịch → chưa có đối chứng» | fixed: bỏ dòng 60% khỏi hợp đồng và thiết kế; đường nền → dòng bỏ có tên (entry d-20260904T130000Z-duongnen); AC-10 và §7.1 đổi «toàn tập» thành «đối chứng = mọi chiến dịch khác», chưa có thì hiện «chưa có đối chứng»; E13 thêm hai bài. human-gate1: ngưỡng là của người — người ký đọc lại hai dòng đường đo còn lại và dòng bỏ |
| P1 | evals | Không eval nào đưa lô do bộ cào THẬT phát qua cổng tiếp nhận THẬT; lược đồ JSON phía Python là bản chép tay không gì giữ đồng bộ với Zod; paths của E17, E18 thiếu tệp Zod | Zod đổi, bản chép không đổi → mọi eval xanh, lượt cào thật đầu tiên 400 cả lô, chiến dịch đầu 0 thành viên | Eval vòng khép kín emitter → tệp → Zod thật → dịch vụ thật; lược đồ JSON sinh từ Zod + bánh cóc diff | fixed: E22 (layer backend-effect, ổ cắm tt_crawl_to_ingest); E17 thêm bài bánh cóc sinh-lại-và-diff; thiết kế §6 và Notes hợp đồng khai script sinh; paths E17, E18 thêm tệp Zod |
| P1 | design + evals | E9 đòi nonce trên dòng thời gian nhưng cú bấm không có ô nhập; nội dung hoạt động Gọi chưa định nghĩa; E9 đo chuỗi-có-mặt thay vì quan hệ 1 cú bấm → đúng 1 hoạt động | Cá nhân đã có một cuộc gọi ghi tay từ trước → E9 xanh dù cú bấm không tạo gì | Định nghĩa tiêu đề/thân hoạt động; nonce = tên chiến dịch chứa run_id; đếm trước/sau lệch đúng 1 | fixed: §4.1 khai tiêu đề «nhãn kết quả · tên chiến dịch» + thân = ghi chú; AC-8 nêu tiêu đề; E9 viết lại: đếm n0/n1 sau tải lại, lệch đúng 1, mục mới mang tên chiến dịch |
| P1 | contract + evals | Bảng trạng thái 12 dòng nhưng hợp đồng và eval chỉ mở 7; không AC nào đo nháp/kết thúc chỉ đọc; nút Kết thúc chưa eval nào bấm trên giao diện; E15 đòi «số bề mặt = số khai» mà không khai N; hai bề mặt rỗng toàn cục không dựng lại được trên kho một workspace [nhan-ung-dung-noi-tieng-viet#F3] [thuoc-cua-lat-3a-co-rang#F1] | Trang nháp vẫn vẽ nút kết quả, bấm ra lỗi tiếng Anh mà mọi eval xanh; E15 không mở bề mặt nào vẫn exit 0 | AC-12 liệt 12 mã làm danh sách đóng, E15 ghim N; thêm AC chỉ đọc + Kết thúc (cross-layer) với cặp ui-check + backend-effect; hai bề mặt rỗng đo ở mức đơn vị | fixed: AC-12 liệt đủ 12 mã, thiếu một là hỏng; E15 ghim N=12 và cách dựng từng mã, thoát mã 2 khi thiếu; AC-16 mới (cross-layer) với E23 ui-check (ổ cắm tt_ui_trang_thai) + E24 backend-effect; hai trạng thái rỗng toàn cục → E25 mức đơn vị, khai giới hạn có lệnh tái lập ở Notes |
| P1 | contract + design | Lược đồ có phone tuỳ chọn và lộ số có trần, nhưng không nói mục vắng số thì giữ hay xoá số cũ; AC-2 và E2 không đụng số điện thoại dù Coverage khai «số đổi giữa hai lượt» là Core | Lượt cào sau chạm trần → hàng trăm thành viên đang gọi dở mất số, liên kết gọi biến mất, đội quay về bảng tính | AC-2 thêm vế giữ/đè; E2 thêm ba lô lành/vắng/đổi | fixed: AC-2 thêm «vắng số thì giữ, có số thì đè»; §4.2 thiết kế nêu luật; E2 thêm bài «giữ số» ba lô; entry d-20260904T130200Z-giuso |

Bộ soát độ phủ của kit (advisory) cùng lượt: W1 — AC-13 là tiêu chí ngưỡng
chưa có ca sát-dưới → E17 thêm bài biên 60/59/20/19/1/0; W6 — ba từ nằm trong
mục *Avoid* của `CONTEXT.md` (cơ hội · giao dịch · khách hàng) → viết lại bằng
từ chuẩn.
