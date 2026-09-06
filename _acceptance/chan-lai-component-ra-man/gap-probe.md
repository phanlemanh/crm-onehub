---
slug: chan-lai-component-ra-man
at: 2026-09-06T14:20:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện context sạch

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | evals | E2 mount ở trạng thái MẶC ĐỊNH tức trạng thái ĐÓNG, và chỉ neo TỔNG 119 chứ không neo từng nhóm | Combobox, date-picker, command palette — đúng năm ví dụ đầu bài — vẽ rỗng khi đóng, nên chuỗi của chúng không có mặt trong tập chữ-người-đọc và bị xếp nhóm KỸ THUẬT. Tổng vẫn 119 nên E2 xanh; nhóm chữ-người-đọc vẫn khác rỗng nhờ dòng khác nên E6 cũng xanh. Vòng đóng lại mà bỏ sót chính lớp nó đi tìm | Ma trận tối thiểu viết trước trong sổ ca: năm dòng ví dụ PHẢI rơi vào nhóm chữ-người-đọc, sai một dòng là mã 1. Mount HAI trạng thái cho mọi component có trạng thái mở. Neo riêng số phần tử từng nhóm | fixed: AC-2 nay đòi mount hai trạng thái + ma trận tối thiểu năm dòng ghim tên; AC-1 neo thêm số phần tử từng nhóm |
| P0 | evals | Chiều đỏ của E4 tự so với chính mình — cả hai vế đều rút từ `gioi-han-bam-moi-hien.json`, không có neo độc lập cho số 10 | Xoá một dòng khỏi bảng: đầu vào còn 9, mount được 9, hai vế bằng nhau, chân thoát mã 0. Chiều đỏ khai «đã chạy» nhưng về cấu trúc không bao giờ đỏ được | Ghim 10 thành neo độc lập trong AC-1. Chiều đỏ thật: xoá một dòng thì neo lệch số dòng đọc được, mã 1, nêu tên dòng mất | fixed: AC-1 nay có neo thứ tư là 10; AC-4 đối chiếu với neo ấy chứ không với chính file |
| P1 | contract | AC-2 giao chiều đỏ «đỏ khi phân nhóm bằng danh sách tên prop gõ tay» cho chân `mot-bo-thuoc`, nhưng E9 đo việc khác hẳn — khối trùng 12 dòng | Người viết thêm một allowlist tên prop ngắn dưới 12 dòng để xếp nhóm cho số component không mount được. E2 xanh vì tổng vẫn 119, E9 xanh vì không có khối trùng. Phép phân biệt quay về đúng cách gõ tay mà Ô Never cấm | Assert riêng có cặp hai chiều: thêm một allowlist giả vào bản sao thì phải mã 1 nêu `file:dòng` | fixed: tách thành AC-11 với eval riêng E11, cặp hai chiều tường minh |
| P1 | evals | E5 đo TÀI LIỆU chứ không đo đầu ra của E4, và đo chuỗi-có-mặt trong khi AC-5 hứa một quan hệ | Người viết tay «đã đo: 9 trên 10 dòng rỗng» trong khi E4 thực đo 7 trên 10. Cụm chữ cũ đã mất, slug đã trỏ đúng, E5 xanh. Bản khai vòng trước mang một con số sai đóng dấu «đã đo» | E5 đọc tạo phẩm của E4, so từng dòng: tên dòng và trạng thái rỗng-hay-có phải khớp đầu ra máy. Lệch một dòng là mã 1. Vắng tạo phẩm là mã 2 | fixed: E5 nay đọc `evidence/mo-nguyen-ban.json` do E4 sinh và so từng dòng |
| P1 | evals | E7 không có neo số và không có ca rỗng thoát mã 2; số ca không buộc bằng số dòng «đã vá» của E6 | Vòng vá 4 mặc định, người viết chỉ đặt 1 ca. E7 xanh với một ca, E6 cũng xanh vì cả 4 dòng đều «đã vá». Ba chuỗi còn lại chưa ai chứng là đến màn bằng tiếng Việt mà AC-7 vẫn được ký | Số ca của E7 phải BẰNG số dòng «đã vá» lấy từ tạo phẩm chứ không gõ tay. Lệch là mã 1 nêu tên component thiếu ca; tập rỗng là mã 2 | fixed: AC-7 nay buộc số ca bằng số dòng đã vá, đọc từ tạo phẩm |

Không finding nào lật quyết định đã ghi trong `decisions.jsonl`. Bên phản biện xác
nhận mọi AC đều có eval, mọi trục Coverage đều có AC, và không criterion nào đi qua
backend nên không thiếu tag `(cross-layer)`.
