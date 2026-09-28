---
slug: lai-ra-man-tran-gio
at: 2026-09-28T06:56:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

# Gap probe — lai-ra-man-tran-gio

Người phản biện chạy ở context sạch và chỉ đọc năm đầu vào: design doc, contract.md,
evals.yaml, decisions.jsonl, và bài học claim-scan. Không đọc mã. Mỗi phát hiện dưới đây
đã sửa thẳng vào contract/evals; theo nghi thức one-pass nên không probe lại.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Bản sao của E3/E4 ghi `ve-that.json` và `mo-nguyen-ban.json` vào thư mục tạo phẩm dùng chung với hồ sơ đã ký `chan-lai-component-ra-man`, và không eval nào khẳng định tạo phẩm đó còn nguyên. Cùng lớp với [do-man-tren-kho-rieng#F1]. | Ở chiều đỏ của E3, vòng chết đi tới `ghi()` và đè một `ve-that.json` hỏng lên tạo phẩm của hồ sơ đã ký. Làn ghim lại chạy xen sẽ đọc bản vẽ hỏng. | Mỗi bản sao đổi đích `ghi()` sang `.acceptance-runs/`; sha256 tạo phẩm hồ sơ đã ký trước/sau lượt; chạy tuần tự. | fixed: E3/E4 đổi đích qua mốc `LUOT_CHAY.duongLuot(ten)`, kiểm sha256 trước/sau (lệch → mã 2); contract Notes khai chạy tuần tự. |
| P1 | evals | Bản sao spec cũ của E4 không có tên ghim và không xoá trong `finally`. | Bản sao sót lại dưới tên `*.spec.tsx` sẽ bị `bun run test` nhặt: spec cũ không có trần chạy lại, và lỗi đỏ ngẫu nhiên quay về. | Tên `lai-ra-man.cu-<pid>.tsx`, xoá trong `finally`, so danh sách tệp của `packages/ui/test` trước/sau. | fixed: E4 ghim tên `.cu-<pid>.tsx` / `.moi-<pid>.tsx`, xoá trong `finally`; danh sách tệp lệch → mã 2 (cả E3). |
| P2 | contract | «≥ 4 × xanh chậm nhất» chỉ đọc hàng xanh, mà mọi hàng xanh đều ≤ 5000 ms, nên thước không bao giờ đỏ được. Đuôi phân bố nằm ở hàng đỏ. | Bảng đo mới có một lượt đỏ ≥ 8000 ms: căn cứ gãy nhưng E2 vẫn xanh. | Mốc = max(xanh chậm nhất, cận dưới đỏ lớn nhất); fixture chiều đỏ 25000. | fixed: AC-2 và E2 đổi sang max(xanh, cận đỏ); thêm chiều đỏ (b) `TRAN_LAI_MS = 25000` ghim thông điệp cận đỏ 36371259813/1. |
| P2 | evals | `mo-nguyen-ban.json` không có chiều đỏ. «Bản cũ» chỉ là riêng tệp spec, còn các tệp đỡ vẫn là bản mới trong cả hai lượt. | Răng tự so với chính nó thì luôn trùng. Sửa `setup-dom.ts` thì cả hai lượt lệch cùng nhau, và E4 vẫn xanh. | Đột biến riêng cho `mo-nguyen-ban.json`; tiền kiểm các tệp đỡ không đổi so với neo. | fixed: E4 thêm đột biến (b) cho `mo-nguyen-ban.json`; tiền kiểm `setup-dom.ts`, `luot-chay.mjs`, `moi-mac-dinh.mjs` so với `c895e5bf` (lệch → mã 2); AC-4 thêm Given. |
| P2 | evals | Chiều đỏ của E3 dựa vào một cuộc đua giờ, mới tái hiện được một lần. | Vòng chết xong trước khi «chuoi da va» vẽ: chiều đỏ ra xanh, rồi REJECT giả với lời «tín hiệu dừng không giữ». | Chạy chiều đỏ 3 lần; không đua → mã 2 thay vì mã 1. | fixed: E3 chạy chiều đỏ 3 lần, đòi 3/3 đỏ; lần nào ra xanh → mã 2 «đối chứng không đua». |
