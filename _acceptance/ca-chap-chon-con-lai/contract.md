---
schema_version: 1
feature: Ba ca chập chờn còn lại chạy tất định — hai đối chứng «the fixture bites» của tasks.integration giữ thống kê đứng yên và gọi tên khi kế hoạch đổi; ma() của bộ gieo agent-okr không sinh chữ số
slug: ca-chap-chon-con-lai
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-09T07:52:08Z
design_doc: docs/superpowers/specs/2026-10-08-ca-chap-chon-con-lai-design.md
---

# Acceptance Contract: ca-chap-chon-con-lai

## Context

Ba ca CI đỏ rồi chạy lại xanh (bảng ở `opportunity.md`). Đã tái hiện tất định cả hai lớp trên máy:

- `tasks.integration.spec.ts` :332, :337 — một `ANALYZE "agentTask"` chen giữa bước gieo và `probe` đảo thứ tự Nested Loop (subquery ra ngoài, chạy một lần) → 2 hàng thay vì 3, đúng «Received length: 2» của CI 37824401395.
- `goi-soan.integration.spec.ts:376` — tên thành viên dựng bằng `ma()` (`sokr-<giờ base36>x<đếm>`) mang dãy số; dưới `setSystemTime(1791498237630)` (`mv03sn26`) bài đỏ đúng «so cap nhat tuan khong in lot».

Cổng Đáng: luật 22 — anh mở hàng lúc 2026-10-07T23:59:20Z, «Sửa cho tất định, không nới phép kiểm» (`opportunity.md`).

Source input: `opportunity.md`, design doc, yêu cầu P5-5.

## Criteria

- AC-1: Given `describe` «a limited lock subquery when the planner re-runs it per row» của `apps/agent/test/tasks.integration.spec.ts`, When `describe` chạy, Then trong suốt `describe` bảng `agentTask` mang `autovacuum_enabled=false` trong `pg_class.reloptions`, và sau `describe` `reloptions` bằng đúng giá trị đọc được trước `describe` — kể cả khi trước đó đã có `autovacuum_enabled=false` (bài bị giết lần trước để lại), hay không có khoá đó.
- AC-2: Given hai ca đối chứng «the fixture bites» của `describe` đó, When thống kê vẫn đúng như bước gieo dựng, Then mỗi ca trả đủ `rows` (3) hàng như hôm nay — không nới phép kiểm; And When thống kê bị cập nhật giữa bước gieo và `probe` (một `ANALYZE` chen vào), Then ca ném lỗi có chữ «ke hoach doi» kèm `EXPLAIN` của câu và `reltuples`, `relpages`, số trang hiện tại, `n_dead_tup`, `last_analyze`, `last_autoanalyze` của bảng đọc SAU `probe` — bất kể analyze rơi vào khe nào trước `probe` — thay vì «Expected length: 3 / Received length: 2».
- AC-3: Given hai ca thật của `describe` (`retireExhausted still retires exactly the limit`, `claimDue still claims exactly the limit`), When chạy trên mã sau bản sửa, Then cả hai xanh không đổi một dòng phép kiểm nào của chúng.
- AC-4: Given `ma()` của `apps/agent-okr/test/support/gieo.ts`, When gọi 10 000 lần với `Date.now` cố định và lần lượt ở ba mốc giờ (gồm `1791498237630`), Then mọi chuỗi bắt đầu bằng `TIEN_TO`, không chứa chữ số nào sau `TIEN_TO`, và 10 000 chuỗi của mỗi mốc khác nhau đôi một.
- AC-5: Given `setSystemTime(1791498237630)` nạp trước khi chạy `apps/agent-okr/test/goi-soan.integration.spec.ts -t goiKiemTu`, When bài chạy, Then xanh — «26» không có trong `soTrongGoi`, `kr(26)` là `so-moi` — không đổi phép kiểm nào của bài.
- AC-7 (phép canh hồi quy): Given gói soạn THẬT mà `id` của một mục tiêu hoặc KR trong `lop2a.capTren` và `id` của một ứng viên trong `lop2a.ungVienCanChinh` chứa dãy số đứng riêng — ví dụ `cid26x`, `cid27x` —, When `goiKiemTu` trích số trong gói, Then 26 và 27 KHÔNG có trong `soTrongGoi`; And các số thật in trong gói (giá trị chấm, số khởi đầu, đích) vẫn có như hôm nay. Phép canh giữ việc gỡ id đã có ở `goi-soan.ts`; vòng không đổi tệp đó.
- AC-6: Given diff của vòng so với merge-base với `onehub`, Then chỉ `apps/agent/test/tasks.integration.spec.ts`, `apps/agent-okr/test/support/gieo.ts` (chỉ khai báo `ma` và hàm mã hoá chỉ `ma` dùng), `_acceptance/ca-chap-chon-con-lai/**`, `docs/superpowers/**`, `PRODUCT-MAP.md`, `LO-TRINH.html` và các dòng THÊM vào `_acceptance/config.yaml` đổi; `apps/agent-okr/test/goi-soan.integration.spec.ts` chỉ có dòng THÊM (ca của AC-7), không dòng bỏ nào.

## Coverage

Quét bằng `morphological-scan` (preset test-matrix), 08/10.

- **Trục A — ca:** tasks :332 (exhausted) | tasks :337 (due) | goiKiemTu :376.
  - Thước CE: ba run CI trong `opportunity.md` (đọc log 08/10).
- **Trục B — điều kiện tái hiện:** thống kê đứng yên | thống kê bị cập nhật giữa chừng · giờ thường | giờ đối kháng (base36 có dãy số đứng riêng).
  - Thước CE: hai phép tái hiện trong design (đã chạy 08/10).
- **Trục C — phía:** đối chứng dương (fixture bites) | ca thật (`retireExhausted`, `claimDue`) | bộ gieo (`ma()`).
- **Ô Core:** A1, A2 × B thống kê đứng yên và cập nhật (AC-1, AC-2) · ca thật giữ nguyên (AC-3) · `ma()` không chữ số, duy nhất (AC-4) · A3 × giờ đối kháng (AC-5) · id của capTren và ứng viên căn chỉnh trong gói — canh hồi quy (AC-7) · ranh giới (AC-6).
- **Later:** chạy lặp trên CI để đo tần suất trước/sau (chỉ đo được sau gộp — ngưỡng hai tuần ở `opportunity.md`).

## Đường đo

- «0 lượt CI/pre-push đỏ ở ba ca này hai tuần sau gộp»: không có bộ đếm máy; người đo đọc `gh run list` của onehub và tìm ba tên ca trong log job đỏ · AC-2 bảo đảm nếu đỏ thì dòng lỗi gọi tên «ke hoach doi».

## Out of scope

- Ca `trinh-soan-lien-ket.dom.tsx:205` — hàng F14 của P4.
- Đổi câu SQL của `claimDue`/`retireExhausted` — đã đúng bằng CTE `MATERIALIZED`.

## Notes

- Không migration. Không đổi mã sản phẩm.
- Ranh giới: `apps/agent/test/tasks.integration.spec.ts`, `apps/agent-okr/test/goi-soan.integration.spec.ts`, `apps/agent-okr/test/support/gieo.ts` (xin chạm tệp P5-49 — ngoài ranh giới ban đầu của hàng), `_acceptance/ca-chap-chon-con-lai/**`.
- Known limits — chấp nhận tại Cổng Bằng chứng 2026-10-09 (Phan Le Manh), từ mục ngoài hợp đồng của S4 round 1:
  - Ngoài-2: chữ của E1 gọi hai khối thử là «tra lai sau khoi» và «da tat tu truoc»; tên thật trong `tasks.integration.spec.ts` là «autovacuum is handed back after the block» và «autovacuum already off before the block». Lệnh `-t 'a limited lock subquery'` vẫn chọn đúng các ca.
- Sửa sau Cổng 1 (09/10, chủ kho): AC-7 bản duyệt đầu tả một gói không thể có — gói chỉ mang id ở `lop2a.capTren` và `lop2a.ungVienCanChinh`, và `idCuaGoi` đã gỡ hết chúng trước khi trích số (đọc lúc S3). AC-7 đổi thành phép canh hồi quy cho việc gỡ đó; `goi-soan.ts` ra khỏi Ranh giới.
- `ALTER TABLE … SET (autovacuum_enabled = false)` chạy trên kho thử; bài bị giết giữa chừng thì `crm_test` giữ cờ đó cho tới `bun run db:test --reset`.
