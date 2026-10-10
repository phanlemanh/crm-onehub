---
slug: eval-model-that-dung-luc
at: 2026-10-08T05:35:07Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design | Không có đường đưa bản ghi của một lượt đo mới vào `HEAD`, vì làn ghim lại cấm eval ghi vào hồ sơ đã ký. Phạm vi băm cũng không nói là loại trừ tệp bản ghi. | Một vòng sau sửa một tệp dưới `apps/agent/agent/**`. Lượt ghim lại kế tiếp đo mới, nhưng không ai commit bản ghi. Từ đó mọi lượt đều đo mới mãi, lời hứa token không đạt, mà eval vẫn xanh. | Thêm tiêu chí về một bước có tên ghi bản ghi vào `HEAD`; thêm một dòng vào ma trận băm cho trường hợp đổi tệp bản ghi. | fixed: thêm AC-10. Lượt đo mới đạt in dòng «GHI BAN GHI: … --ghi-ban-ghi <tệp>»; lệnh đó chép bản ghi vào evidence của `tro-ly-doc-kho`; đo ở E11 trên bản sao. Ma trận E3 có dòng 6: đổi tệp bản ghi thì băm không đổi. Notes của hợp đồng nói rõ dùng lại chỉ có hiệu lực khi thợ chạy bước đó rồi commit. |
| P1 | evals | E9 cấm mọi tệp ngoài `_acceptance/`, nhưng `PRODUCT-MAP.md` do máy vẽ lại khi ký. | Ký Cổng 1 làm `PRODUCT-MAP.md` đổi; E9 thoát 1 dù mã đúng. | Miễn đích danh hai tệp máy vẽ; thêm đối chứng dương và âm. | fixed: AC-9 và E9 miễn `PRODUCT-MAP.md` và `LO-TRINH.html` (liệt từng tên), có đối chứng dương và âm. |
| P1 | evals | AC-1, 6, 7 chỉ được đo trên hàm thuần. Không có phép đo nào chứng minh `cham-bo-do.ts` thật sự gọi các hàm đó; dữ liệu gõ tay, không round-trip từ lượt thật. | `cham-bo-do.ts` giữ nhánh nhãn cũ; E1/E6/E7 vẫn xanh. | Chấm lại trên kết quả của một lượt thật, không gọi model; cặp phá-thử nhãn cũ. | fixed: thêm AC-12 và E13. `--cham-lai <thư mục lượt>` chấm lại tệp `cham-tung-cau.jsonl` do lượt thật ghi (round-trip), có ca LOI, ca vùng xám, và cặp (h). |
| P1 | contract | Chưa nói lời dò model hỏng thì làm gì, và chưa đo được việc lấy đủ hai `response.modelId` thật. | Gateway 402: lời dò ném lỗi, E15 thoát 1, lỗi hạ tầng lại đọc thành model sai. Hoặc mã chỉ dò một model. | Lời dò hỏng thì thoát 2 có tên; bản ghi mang đủ hai id. | fixed: thêm AC-11 và E12, cùng cặp (g). E5, E8, E11 dò hai model thật. |
| P1 | evals | E8 ép đo đầy đủ ở mọi lượt ghim lại; lượt 1 không đạt thì E8 đỏ oan; bằng chứng «không gọi model» chỉ là vắng một dòng. | Model 79%: E8 đỏ dù mã đúng. Nhánh dùng lại bỏ `eve eval` nhưng lượt Zalo vẫn gọi model, và E8 vẫn xanh. | Given «lượt 1 đạt»; đo quan hệ số lời gọi; khai E8 là eval model thật. | fixed: AC-8 sửa — lượt 1 không cờ (dùng lại từ `HEAD` nếu được), lượt 1 không đạt thì thoát 2. Lượt 2 phải báo «SO LOI GOI MODEL: 2», còn lượt 1 đo mới phải > 2. Cả hai lượt chạy qua `eve eval`, nên lượt Zalo cũng được đếm. E5, E8, E11 khai trong `feature_loop.model_evals`. |
