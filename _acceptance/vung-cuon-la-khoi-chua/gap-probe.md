---
slug: vung-cuon-la-khoi-chua
at: 2026-09-25T14:44:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

# Gap-probe: vung-cuon-la-khoi-chua

Phản biện context sạch, một lượt, đầu vào: design doc, contract, evals, sổ quyết định, claim-scan.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E6 định nghĩa «đặt toạ độ» là top/right/bottom/left computed khác auto, trong khi phần tử đã định vị trả giá trị px | sau khi sửa, 21 phần tử sr-only và select/input ẩn có offsetParent main, top computed ra số px, E6 đỏ giả trên sản phẩm đạt | ép inline top/right/bottom/left về auto rồi so hộp, lệch quá 1px là có toạ độ; đối chứng dương bằng span top:0 right:0 chèn tạm | fixed: E6, AC-6 và design dùng phép so hộp; đối chứng span top:0 right:0 mỗi trang mỗi khổ, không bắt được thì mã 2 |
| P1 | design | điểm chèn khối đệm và span thăm dò chưa ghim là trong main | nếu chèn ra ngoài main, span vẫn thoát, E4 và E5 đỏ giả trên mã đã sửa | ghim điểm chèn, khẳng định main.contains trước khi đo | fixed: tiền đề của phát hiện sai một nửa — [data-slot=page-shell] là con trực tiếp của main, không phải tổ tiên; nhưng artifact chưa ghim điều đó, nay AC-4, E4 và design ghim điểm chèn và khẳng định main.contains, sai thì mã 2 |
| P1 | contract | AC-1 bốn nhãn mà E1 thêm nhãn thứ năm; ngưỡng đo chỉ là cận dưới 60 | phiên hỏng hay đoạn động thiếu bản ghi làm bảy trang rơi khỏi phép đo mà AC-1 vẫn đạt | cùng bộ nhãn; tập không-đo ghim theo đường; đăng nhập hay thiếu bản ghi thì mã 2; đếm chính xác | fixed: AC-1 và E1 ghim chín trang không-đo theo đường mẫu, số đo bằng 3(T−9), trang ngoài tập ghim mà không đo là SAI, bị đẩy về đăng nhập hay thiếu bản ghi là mã 2; bỏ nhãn khong-du-lieu |
| P1 | evals | không có ngân sách thời gian cho khoảng 90 ô dưới trần Bash 600s | lượt bị giết giữa chừng, tien-de không dọn khoá lính canh, mọi eval BLOCKED | mở mỗi trang một lần, đổi khổ tại chỗ, in thời gian, trần có tên | fixed: E1 và design khai mỗi đường một trang, đổi khổ bằng setViewport, in thời gian từng trang và tổng, quá 540s thì mã 2 gọi tên |
| P2 | evals | các dòng 0/N là khẳng định âm không in cỡ tập, đối chứng không phủ chiều ngang | bộ chọn hỏng trả tập rỗng, E2 xanh trên mọi mã | in số phần tử đã xét; đối chứng mỗi lượt; thăm dò chiều ngang | fixed: E2 in k phần tử absolute đã xét (k = 0 thì mã 2) và đối chứng span thăm dò bị bắt khi ép static; E4 đẩy span sang phải 150vw, đối chứng đòi tràn cả dọc lẫn ngang |
