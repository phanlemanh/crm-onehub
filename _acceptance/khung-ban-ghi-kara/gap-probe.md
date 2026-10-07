---
slug: khung-ban-ghi-kara
at: 2026-10-07T13:48:33Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-9 hứa chỉ phục hồi đề xuất bị thay ở đúng lần nhận đó, nhưng ca phục hồi của E11 chỉ có fact bị thay cùng mốc với Z; chiều đỏ không bắt lỗi khớp mốc | W bị thay từ một lần nhận trước; bản cài phục hồi mọi fact SUPERSEDED của trường đưa W về chờ mà E11 vẫn xanh | thêm W bị thay ở mốc cũ, sau hoàn tác W giữ SUPERSEDED và mốc cũ; chiều đỏ bỏ điều kiện khớp mốc → «chan: phuc hoi fact cua lan nhan khac» | fixed: E11 thêm fact W ở mốc t0 làm đối chứng và chiều đỏ ghim thông điệp đó |
| P1 | evals | AC-4 hứa «Bắt đầu cuộc mới» mở cuộc mới với ô soạn dùng được, E4 chỉ kiểm setThread trên hàm giả | màn giữ trạng thái ended sau khi đổi thread, ô soạn vẫn khoá, E4 vẫn xanh | ca ended dùng nơi giữ thread thật; sau khi bấm, textarea hết disabled, chữ kết thúc và nút biến mất; chiều đỏ «khoa: cuoc moi van khoa» | fixed: E4 dùng bộ chuyển nuqs thử của kho và kiểm ô soạn sau khi bấm |
| P1 | evals | Đường đo hứa đếm 0 gợi ý lập trình viên, E5 chỉ quét chữ cứng JSX nên gợi ý nằm trong hằng hay toast lọt | hằng «Start it with bun run dev» đưa vào toast(); răng in 0 mà người lạ vẫn gặp | lượt quét chuỗi literal với danh sách cấm 5 mục × 9 tệp = 45 phép kiểm; chiều đỏ chèn hằng vào toast() → «agent-panel.tsx: 1 goi y lap trinh vien» | fixed: E5 thêm lượt 2 đúng như đề xuất |
| P2 | evals | E17 không có ảnh ngăn công ty và không có ảnh trạng thái nào, nên hai vế của AC-13 không ai chấm | tab Kara của công ty hay trạng thái lỗi lệch luật, E17 vẫn PASS | thêm ảnh ngăn công ty và một ảnh trạng thái vào inputs; câu hỏi hỏi thẳng về trạng thái theo ai-ux §7 | fixed: E16 chụp thêm kbk-kara-trang-thai-1440.png (phiên đo không chạy tác nhân nên tab hiện trạng thái lỗi hoặc chưa bật); E17 đọc tám ảnh và hỏi về ba ngăn cùng trạng thái |
| P2 | evals | E14 đo có dấu Kara chứ không đo vắng MagicWand, và không kiểm biểu tượng lúc đang chạy | nhánh đang chạy vẫn render MagicWand cạnh dấu Kara, E14 xanh | đếm svg MagicWand = 0 ở ba ô nghỉ, đang chạy, lỗi; đối chứng dương; chiều đỏ «tra-cuu: MagicWand con o dang chay» | fixed: E14 thành ma trận 3 trạng thái × 2 nút, nhận diện MagicWand bằng đường vẽ rút từ gói icon lúc chạy |
