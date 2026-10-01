---
slug: mien-so-chup-bo-okr-mau
at: 2026-10-01T07:12:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract, evals | Ma trận AC-3/E3 chỉ một ô mỗi chốt, trong khi C2 có ba vế, C3 có bốn, C4 có bốn lối nhập | Bản cài chỉ làm vế đầu của mỗi chốt (nhập tĩnh lenh ở okr-mau.ts, lenh.ts gọi thẳng xoaTrong, bỏ chốt ở napBoOkrMau, import() động) mà E3 vẫn 4/4 | Bảng viết trước mỗi vế một ô, in N/N | fixed: AC-3 và E3 thành 13 ô (C1×2, C2×3, C3×4, C4×4), in «chot: <bắt>/13» |
| P1 | contract, evals | E2 chỉ bốn ô phía sửa/xoá; thiếu tạo ngoài hàm miễn, delete một hàng, upsert, lồng soChup, và kiểm cả hai dòng mien ở mọi ô | Bản cài khớp miễn theo tệp+lối bỏ qua hàm: createMany trong xoaTrong được miễn mà E2 vẫn 4/4 | Thêm sáu ô; mọi ô kiểm tập dòng mien bằng đối chứng | fixed: AC-2 và E2 thành 10 ô, mọi ô so tập dòng mien và dòng chốt |
| P1 | contract, evals | E7 gom commit theo chữ slug trong thông điệp | Commit sửa nap.ts không mang slug lọt qua, E7 xanh | Gom theo nội dung, thêm diff từ merge-base khi chưa gộp | fixed: E7 gom mọi commit chạm thư mục hồ sơ + diff merge-base..HEAD khi nhánh chưa gộp; đối chứng âm e3e2f252f giữ |
| P2 | evals | E6 cho giám khảo đọc cả thiết kế và toàn hợp đồng | Đoạn docs thiếu ý mà giám khảo lấp từ thiết kế, chấm PASS | Thu inputs, thêm ca chứng đỏ trên bản 9c65f368 | fixed một phần: bỏ tệp thiết kế khỏi inputs, câu hỏi giới hạn vào đoạn docs và hai câu AC. deferred: ca chứng đỏ cho judgment — cần panel thứ hai; chiều đỏ máy trên đúng bản 9c65f368 đã có ở E5 |
| P2 | evals | E1 để người chấm grep số dòng và đếm dòng mien; E3 không kiểm ba chốt còn lại vẫn dat | Thước in lệch dòng hay đánh vo cho cả bốn chốt mà vẫn xanh | E1 thành script so quan hệ; E3 so nguyên dòng chốt | fixed: E1 dùng rang/xanh.mjs (đọc lệnh E8 từ config, rút d1/d2 từ nap.ts, đếm đúng 2 mien và 3 tao); E2/E3 so nguyên dòng chốt |
