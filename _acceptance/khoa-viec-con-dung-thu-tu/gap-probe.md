---
slug: khoa-viec-con-dung-thu-tu
at: 2026-10-21T07:12:00Z
verdict: findings
p0: 2
p1: 1
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ ghi lời 400 khi việc cha đổi dự án là lối duy nhất, nhưng còn lối chạy lại trong giao dịch mới; lời người dùng thấy không phải máy tự quyết được. | Mã cũ tạo được việc con ở cả ba dòng của AC-3; vòng này biến thao tác đang thành công thành lỗi bắt bấm lại. | Đổi lối hoặc thành câu hỏi; nếu chạy lại thì E3 kỳ vọng 200 và đột biến bỏ lời kiểm lại vẫn phải chết. | fixed: đổi sang chạy lại tối đa DU_AN.thuLaiViecCon lượt trong giao dịch mới (dòng sổ thay d-…-2, căn cứ câu giao của hàng); AC-3 nay đòi thành công; thêm E3b đo tầng một lượt để đột biến (b) chết. |
| P0 | contract | Dòng bỏ đường-đo ghi nguồn một-lối trong khi ô ngưỡng trống là thứ có thể hỏi lại. | Cổng Giá trị đọc bảng ngưỡng toàn ô chưa đo, không ai biết lỗi chung chung đã hết thật trên production. | Câu hỏi ngưỡng hoặc dòng bỏ có tên người. | fixed: dòng sổ thay d-…-6 trỏ CLAUDE.md (đo dữ liệu thật là việc sau gộp, không phải cổng của việc dựng) và việc chủ kho đã ký Cổng Đáng với ô ngưỡng trống; giữ bỏ, nêu ở thẻ. |
| P1 | evals | Điều kiện chờ chỉ đòi một tiến trình chờ khoá bất kỳ, không lọc kho và không buộc bị chính B chặn; B hết hạn 5 giây trước lời ghim 10 giây. | Tiến trình lạ làm điều kiện đúng sớm, B commit trước, mã cũ vẫn xanh; đột biến (a) chết theo may rủi. | datname = current_database() và pg_blocking_pids chứa pid B; timeout B lớn hơn 10 giây; chạy mỗi đột biến 3 lần. | fixed: E1, E2, E3, E3b đòi datname và pg_blocking_pids chứa pid B, in pid; B mở với timeout 30000. rejected phần chạy 3 lần: cạnh chặn đã kiểm trực tiếp nên xen kẽ tất định, một lần là đủ. |
| P2 | contract | AC-5 bắt tài liệu tuyên mọi đường ghi đã khoá đúng thứ tự trong khi đường ghi việc lẻ chưa rà. | Người viết đường ghi kế tin tài liệu và không rà thứ tự khoá. | AC-5 nói phạm vi đúng và có câu giới hạn; E5 thêm vế (3). | fixed: AC-5 và E5 viết lại ba vế, vế (3) là câu chưa rà. |
| P2 | design | Câu trích của d-…-1 không quyết giữa khoá khoaDuAn đầy đủ và chỉ khoá hàng duAn; khoá đầy đủ nới mặt tranh chấp lên mọi việc của dự án. | Một đường giữ việc X của P rồi ghi hàng trỏ khoá ngoại tới duAn P sẽ vòng với bản khoá đầy đủ. | Nêu lối chỉ khoá duAn và giá của khoá đầy đủ. | fixed: đổi sang chỉ khoá hàng duAn (dòng sổ thay d-…-1, căn cứ gợi ý ghi ở hàng DA13); grep 21/10 không thấy đường nào ghi duAnVet hay đặt Viec.duAnId mà chưa khoá hàng duAn trước. |
