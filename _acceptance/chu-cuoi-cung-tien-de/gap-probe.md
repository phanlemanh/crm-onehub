---
slug: chu-cuoi-cung-tien-de
at: 2026-09-23T07:35:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Không eval nào chạy ca đã sửa cùng chủ lạ mà vẫn đòi ca khẳng định luật chủ cuối; E1 không phân biệt passed với skipped | Ca bị sửa thành bỏ qua khi có chủ lạ: E1–E4 vẫn xanh, cả bộ duyệt một ca rỗng đúng tình huống CI | E4 chạy đột biến kèm chủ lạ và đòi ca đỏ với câu ghim; E1 đòi testcase passed trong junit | fixed: AC-1 đòi passed không skipped; AC-4 và E4 chạy cả đối chứng lẫn đột biến kèm chủ lạ |
| P1 | evals | AC-2 chỉ đo đường ca xanh, không chứng việc trả vai khi ca đỏ | Trả vai ở cuối thân ca thay vì finally: ca đỏ thật thì chủ lạ kẹt ở member | Lượt đột biến (ca bị ép đỏ) vẫn phải in VAI-GIU; bản sao dời khối trả vai ra ngoài finally phải in VAI-MAT | fixed: AC-2 thêm «kể cả khi ca đỏ»; E2 đo cả hai lượt và bản sao ngoài finally |
| P1 | evals | AC-2 hứa trả đúng người đã hạ, E2 chỉ đo chủ lạ còn là owner | Trả vai bằng cách nâng mọi member lên owner: E2 vẫn xanh, member thường bị thành chủ | Thêm member lạ vai member, đòi VAI-GIU member; bản sao trả vai cho mọi member phải đỏ | fixed: AC-2 và E2 thêm member lạ và bản sao đột biến trả-vai-cho-mọi-member |
| P2 | evals | E3 không khẳng định tiền đề «không có chủ lạ»; ghi bun test trần | Cơ sở dữ liệu chung còn chủ lạ: E3 xanh mà không biết đo nhánh nào | Chạy qua bun run test --, đếm owner lạ trước khi chạy, khác 0 thì TIEN DE | fixed: AC-3 và E3 đếm và khẳng định số owner lạ bằng 0; lệnh đi qua bun run test -- |
| P2 | contract | AC-6 hứa suite của repo nhưng E9 bỏ agent và không có build | Cổng 1 đọc AC-6 là toàn kho xanh trong khi thiếu một gói và lệnh dựng | Sửa AC-6 cho đúng thứ đo hoặc thêm eval | fixed: AC-6 ghi rõ năm lệnh (suite trừ agent + build), thêm E10 build; bỏ agent ghi descope |
