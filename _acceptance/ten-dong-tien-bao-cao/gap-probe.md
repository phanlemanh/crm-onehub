---
slug: ten-dong-tien-bao-cao
at: 2026-09-24T08:40:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

# Gap probe — ten-dong-tien-bao-cao

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Câu mẫu của E1 nằm trong bài kiểm viết lại ở chính vòng này, không phép đo nào so nguyên văn với AC-1 | Ba dấu chấm thay dấu chấm lửng, viết y hệt vào mã lẫn bài kiểm, mọi thước xanh | Rút bốn câu từ contract.md, so từng ký tự với deals.ts | fixed: thước quét chữ rút bốn câu của AC-1 từ hợp đồng và so nguyên văn (NFC) với deals.ts; AC-3 nói rõ vế này |
| P1 | evals | AC-5 hứa mọi phép đo máy của hai hồ sơ trước, E5 chỉ chạy bốn tệp | Thước hồ sơ cũ còn so chữ cũ, E5 vẫn xanh, kiểm lại sau merge đỏ | Chạy trọn phép đo máy của cả hai hồ sơ, đếm đủ | fixed: E5 chạy làn máy của bộ kit cho cả hai slug (bốn lệnh bộ chứng và mọi phép đo đã khai), chỉ đo không ghim |
| P1 | evals | Phép tìm «default currency» phân biệt hoa thường, chỉ quét bảng câu chữ .ts | «Default currency» viết hoa hoặc viết thẳng trong .tsx lọt qua | Tìm không phân biệt hoa thường, NFC, quét mọi .ts/.tsx của app và bộ giao diện | fixed: quét mọi .ts/.tsx dưới apps/app và packages/ui/src trừ bài kiểm, không phân biệt hoa thường, sàn số tệp đã quét |
| P2 | evals | E3 không đo mục từ điển có định nghĩa và chỗ đặt | Mục chỉ có tiêu đề và dòng tránh vẫn qua | Khẳng định có «Cài đặt», «Tiền tệ» và câu định nghĩa không rỗng | fixed: 4 khẳng định trong phạm vi mục từ điển |
| P2 | contract | Dòng Notes của hợp đồng cũ không có AC hay phép đo | Quên thêm dòng, hợp đồng cũ đọc lệch mà không chỉ sang đây | AC mới: Criteria cũ không đổi, Notes trỏ sang | fixed: thêm AC-6 và E6 (so Criteria với f87ca17f, tìm dòng Notes) |
