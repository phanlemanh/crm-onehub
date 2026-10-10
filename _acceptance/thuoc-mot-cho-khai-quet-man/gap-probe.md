---
slug: thuoc-mot-cho-khai-quet-man
at: 2026-10-09T18:46:56Z
verdict: findings
p0: 0
p1: 4
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Chiều đỏ «thước cũ không bắt» của E2/E3 gọi bản d089cb8d bằng cờ nó không biết, ROOT cố định ở kho thật — không lượt nào tái hiện lỗi gốc | Bản cũ thoát 2 hay ném thiếu mô-đun vì cờ lạ mà chiều đỏ vẫn «xanh»; Cổng 1 tin đã có cặp trước/sau | Cây tạm cùng bố cục, bản cũ không cờ: lành thoát 0, khu soạn khai trùng thoát 0; bản mới trên cùng cây thoát 1 | fixed: E2, E3, AC-2, AC-3 và design chuyển sang cây tạm dưới .acceptance-runs (ba cấp dưới gốc kho, nối node_modules thật); thử 09/10: bản cũ 0 / 0 / agent 1; đối chứng dương bắt buộc, khác 0 thì exit 2 |
| P1 | evals | E1 hứa quan hệ bằng git ls-files nhưng chiều đỏ chỉ là gốc rỗng (0 so k), phép > 0 một mình cũng bắt | tepQuet bỏ .tsx, khu soạn đếm 6/22 mà E1 vẫn xanh | In hai vế từng gốc; ca --tu-thu lệch đúng một tệp | fixed: E1 in «khu-soan <k>=<k>»; chiều đỏ là cây tạm bỏ một tệp .tsx → «khu-soan khong khop (<k-1> / <k>)» |
| P1 | contract | AC-4 đòi ba chuỗi gốc chỉ ở chung.mjs trên mọi tệp rang/ mà chưa đo hiện trạng; chỉ bắt dạng import { glob } | ranh-gioi.mjs có packages/validation/src/okr-cuoc-soan.ts → E4 đỏ oan; fs.glob( lọt | grep từng chuỗi trên từng tệp tại d089cb8d; thu hẹp AC-4; bắt \bglob\s*\( | fixed: đo 09/10 ghi ở Notes; AC-4 chỉ khoá đường khu soạn (một lần, chung.mjs) và mot-nguon.mjs không khai gốc; đường tệp cụ thể không tính; E4 bắt mọi lời gọi glob( và mọi dạng nhập |
| P1 | design | Chưa đo eval nào khác của K2b có paths khớp chung.mjs | Eval ui-check của K2b thành cũ, làn ghim lại không chứng lại, nhánh kẹt | Liệt eval K2b có paths khớp chung.mjs hay rang/** | fixed: đo 09/10 — không eval nào khai chung.mjs; chỉ E7 (script) khai mot-nguon.mjs; E10 (ui-check) chỉ khai man.mjs; ghi Notes, giữ GOC_QUET ở chung.mjs |
| P2 | contract | AC-3/E3 không đòi tệp thật còn nguyên sau ca gốc rỗng | --goc-rong đổi tên tạm thư mục thật; tiến trình chết giữa lượt không trả về | sha256 + git status --porcelain trước/sau như E2 | fixed: AC-3 và E3 thêm vế tệp thật và git status không đổi; ca gốc rỗng làm trên cây tạm |
