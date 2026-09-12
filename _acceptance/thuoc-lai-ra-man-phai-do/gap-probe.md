---
slug: thuoc-lai-ra-man-phai-do
at: 2026-09-12T05:52:58Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | E2 đứng trọn trên fixture bản-vẽ tự dựng đúng khuôn bên ĐỌC; không ô nào rút round-trip từ bản vẽ bên VIẾT thật sinh, không sàn khuôn buộc tên trường hai bên khớp | Bên viết đổi tên trường (`loi_dong` → `loiDong`) hoặc ngừng phát `loi_mo`; bên chấm đọc `undefined` nên xếp TẤT CẢ vào nhóm vẽ-được. E2 vẫn xanh bốn ô vì fixture của nó viết đúng khuôn cũ — tái lập chính L1 | Ít nhất một ô rút từ bản vẽ do lượt chạy thật sinh, đọc bằng chính hàm bên chấm dùng; cộng assert sàn-khuôn so tập tên trường hai bên, lệch một tên là mã 1 ghim tên trường | fixed: E2 thêm ô O5 round-trip + assert sàn-khuôn SAN-KHUON |
| P0 | evals | E5 đối chứng dương là khẳng định âm-tính-một-mình; không phép tiêm nào làm vế sạch-cây đỏ, không chứng cứ lượt chạy đã thật sự chạy | Trong bản sao `bun run test` không khởi động được (thoát 127) ⇒ không file nào bị sửa ⇒ git status sạch ⇒ E5 mã 0; kho thật vẫn bẩn, `git add -A` vẫn nuốt bằng chứng đã ký | Ba mảnh một ca: chứng cứ lượt chạy đã sống (mã thoát 0 + bản vẽ ở chỗ tạm có phần tử) · chiều đỏ cho chính vế sạch-cây (tiêm lại đường ghi cũ trỏ evidence) · chỉ khi mảnh một xanh mới đọc git status | fixed: E5 viết lại đủ ba mảnh a-b-c |
| P1 | evals | E6 đo chuỗi-có-mặt trong lời tự xưng của từng ca, trong khi AC-6 hứa QUAN HỆ: dương đã thật xanh và đỏ đã thật đỏ đúng thông điệp | Bước tiêm của E3 hỏng nên chiều đỏ chưa từng chạy, script vẫn in vô điều kiện hai dòng mốc ⇒ E6 xanh ⇒ người duyệt đọc «mọi phép đo có chiều đỏ sống» và ký, trong khi E3 là ca chết | Hai dòng mốc mang tải máy kiểm được: mã thoát quan sát từng chiều + nguyên văn thông điệp bắt được; E6 assert dương = 0, đỏ ≠ 0, thông điệp chứa nhãn ca. Chiều đỏ của E6: vô hiệu phép tiêm một ca ⇒ E6 mã 1 gọi tên ca | fixed: E6 viết lại đo mã thoát + thông điệp |
| P1 | contract | AC-5 có When đi qua `bun run test` và móc trước-khi-đẩy — hai lớp ngoài `rang/` — mà thiếu tag (cross-layer); và không AC nào đòi thước đã sửa vẫn được CỔNG gọi | Bản vẽ dời sang chỗ tạm; lệnh cổng vẫn trỏ đường cũ hoặc ngừng gọi thước. E1-E5 gọi thẳng script nên xanh đủ, người duyệt ký; kho merge với thước đỏ-được-nhưng-không-ai-gọi — y hệt trước vòng này | Tag (cross-layer) cho AC-5; thêm một vế đo QUA LỆNH CỔNG: tiêm component hỏng rồi chạy đúng lệnh cổng của kho ⇒ phải thoát khác 0 ghim tên ca | fixed: AC-5 gắn tag, thêm AC-7 + E7 đo qua lệnh cổng |
| P1 | evals | E1 không khai CÁCH rút danh sách bên VẼ; ca có thể tự gọi `docMacDinh()` hai lần rồi so chính nó với chính nó | Ai đó trả spec về đọc `evidence/mac-dinh.json`; xoá một component ⇒ ca vẫn thấy hai danh sách cùng ngắn đi vì cả hai đều từ kho tươi ⇒ E1 xanh, L1 sống lại nguyên vẹn | Danh sách bên VẼ rút từ vật được giao — bản vẽ lượt chạy của spec sinh ở chỗ tạm trong chính lượt chạy đó. Chiều đỏ thứ hai: tiêm lại bản spec cũ đọc `evidence/mac-dinh.json`, xoá một component ⇒ mã 1 ghim MOT-NGUON kèm đường dẫn file chết | fixed: E1 khai nguồn rút + chiều đỏ thứ hai |
