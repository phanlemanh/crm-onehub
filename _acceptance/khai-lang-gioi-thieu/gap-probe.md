---
slug: khai-lang-gioi-thieu
at: 2026-09-21T15:50:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract, evals | Lời hứa ở dòng feature — đoạn giới thiệu trên tấm hồ sơ công ty khai lang="en" — không thành tiêu chí nào; ca đỏ nằm trong một đoạn mô tả không đi qua MetaLine nên E1–E3 không chạm tới nó | company-sheet.tsx mất lớp bọc ForeignText (merge từ release, sửa tab Tổng quan); E1–E3 vẫn xanh, ca đỏ quay lại prod và chỉ lộ khi chủ kho quan sát lại | AC-4 + E4: dựng phần giới thiệu dưới tổ tiên lang="vi", đi từ nút chữ lên [lang] gần nhất đòi "en"; chiều đỏ gỡ ForeignText thì Received "vi" | fixed (chủ kho chọn lối b tại Cổng 1, 2026-09-22): thêm AC-4 + E4 — khối giới thiệu tách thành CompanyAbout, bài kiểm của kho dựng nó dưới vùng lang="vi". Bối cảnh lúc đẩy lên người: CompanyOverview gọi tRPC, React Query và mutation nên đo trực tiếp phải giả lập module (rò sang tệp khác, ghi nhớ mock-module-song-qua-tep-kiem). Hai lối cho chủ kho: (a) giữ giới hạn có tên, quan sát prod sau gộp là phép đo; (b) tách khối giới thiệu thành một thành phần trình bày nhỏ và thêm E4 là bài kiểm của kho |
| P1 | contract | AC-3 chỉ hứa «hiện đúng một lần», không nói bản nào được giữ | Phần không khai đứng trước phần khai cùng chữ: chữ hiện một lần mà không có lang, E3 vẫn xanh | Sửa AC-3 thêm «nằm trong vùng en», E3 chạy cả hai thứ tự | fixed: khai giới hạn có tên «khi trùng chữ, bản đứng trước thắng» trong Notes của contract; mọi chỗ gọi hiện có hai phần khác chữ nên ca chưa xảy ra. Đổi hành vi là đổi mã, không thuộc ô rút-vật này |
| P1 | evals | Khẳng định âm của E2 thiếu đối chứng dương; chiều đỏ mới chạy cho khẳng định 1 | MetaLine rơi mất phần không khai, hoặc bọc cả dòng trong vùng en | Đối chứng dương «Hà Nội có mặt» + chiều đỏ riêng cho khẳng định 2 | fixed: vungKhai vốn ném «khong thay chu» khi chữ vắng (đối chứng dương có sẵn); chiều đỏ thứ hai đã chạy trên vật thật — bọc phần không khai trong ForeignText en → Received "en"; ghi vào expected của E2 |
| P2 | evals | Fixture E2/E3 không có tổ tiên lang="vi" như màn thật | Một thay đổi làm phần không khai kế thừa sai vùng thoát được nếu cây tổ tiên khác màn | Dựng MetaLine dưới tổ tiên lang="vi" | fixed: đi cùng lối (b) — bài "chieu b" của E2 và "chieu d" của E4 dựng dưới tổ tiên lang="vi"; khẳng định 2 của E2 nay đòi vùng "vi" |
| P2 | contract, design | Không artifact nào liệt kê mười chỗ gọi; design và contract kể lệch nhau | Người ký không có danh sách để soi chỗ gọi bị sót | Bảng mười chỗ gọi trong Notes | fixed: bảng mười chỗ gọi rút từ diff, thêm vào Notes của contract |
