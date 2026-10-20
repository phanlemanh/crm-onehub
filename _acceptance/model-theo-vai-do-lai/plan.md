# Kế hoạch thi công: model-theo-vai-do-lai (MH4)

Hợp đồng `contract.md` (duyệt manh 2026-10-20), bài đo `evals.yaml`, thiết kế `design.md`. T2: không có Gate 1.5.
Cỡ mẫu ghim ở `evidence/ke-hoach.json` (Hỏi-5), ngưỡng ở `rang/nguong.json` (Hỏi-6). Mọi lượt gọi model chạy dưới khoá
s4 của đợt, trên kho đo dùng-một-lần; mọi sửa tạm trả lại trong `finally` và được so băm sau lượt.

## Ràng buộc chung

- Không chú thích trong code; hằng nhóm trong một đối tượng cấu hình mỗi tệp (`DO`, `SO`); parse bằng Zod ở chỗ đọc.
- Không ghi vào hồ sơ đã ký (`_acceptance/chu-may-sinh-ten-moi/`, `_acceptance/bo-cau-hoi-mau/`,
  `_acceptance/tac-nhan-glm-5-3-cham/`): thước được chép hoặc trỏ evidence về `_acceptance/model-theo-vai-do-lai/evidence/`.
- Giờ của `aiChiPhi` lệch 7 giờ (Known limits Ngoài-4 của MH3): `so-do.ts` dùng cùng hằng `lechKetXuatMs`.
- Model thật của Tác nhân: `agentEvent` loại `model.phien-chon` của phiên con `agent_builder` (ghi bởi
  `subagents/agent_builder/agent.ts` sau khi `modelChoBoDung` lùi hay không).

## Tác vụ

### T1 — Khuôn (`rang/khuon.ts`)
Zod cho `ke-hoach.json`, `nguong.json`, dòng `tac-nhan.jsonl`, hàng `aiChiPhi`, `do-suy-luan.json`, tóm tắt kho
(`evidence/kho/tom-tat.json`), tóm tắt soạn (cùng khoá với `eval-soan-sau.json` của VK5 + `modelGateway`, `bam.config`),
`chi-phi.json`, `bang-kien-nghi.json`. Hằng `DO`/`SO` dùng chung (đường tệp, nhãn ghim). Phục vụ E1–E7.

### T2 — Dò suy luận (`rang/do-suy-luan.ts`)
Chép MH3; model `zai/glm-5.3-flash`; ba mục `mac-dinh` (không gửi `reasoning`), `low`, `high`; ghi
`evidence/do-suy-luan.json`. Phục vụ E2.

### T3 — Lượt Tác nhân (`rang/do-tac-nhan.ts`)
Chép MH3; biến thể và số lượt đọc `ke-hoach.json`; `datModel` đọc lại ô model trước eval; sau eval đọc
`model.phien-chon` của phiên con và chi phí từ `aiChiPhi`; ghi băm bản gốc/bản `low` vào `evidence/ke-hoach-tac-nhan.json`;
dừng trước lượt khi tổng `chi-phi.json` chạm trần. Phục vụ E1, E6.

### T4 — Lượt Trợ lý kho (`rang/do-kho.ts`)
Sửa tạm `hoi.maModel` trong `apps/agent/agent/lib/tai-lieu-config.ts`; chạy `do-bo-mau.ts --do` với biến evidence của
`bo-mau-config.ts` trỏ `evidence/kho/`; đọc model Gateway từ báo cáo chấm; chi phí ước theo số dư Gateway trước/sau
lượt; trả tệp, so băm với HEAD; ghi `evidence/kho/tom-tat.json`. Phục vụ E3, E6.

### T5 — Lượt soạn OKR (`rang/do-soan.mjs`)
Chép runner `eval-soan.mjs` của VK5, đổi đường ra về `evidence/eval-soan-flash-<n>.json` và `.acceptance-runs/model-theo-
vai-do-lai/`; sửa tạm `MO_HINH` trong `apps/agent-okr/agent/lib/config.ts`; so `bam.loiDan`, `bam.thuoc` với mốc; trả tệp,
so băm. Phục vụ E4, E6.

### T6 — Bộ so và bảng (`rang/so-do.ts`)
Kiểm E1–E6 trên evidence; dựng `bang-kien-nghi.json` theo `nguong.json`; in `docs/model-theo-vai.md`; `--pham-vi` cho E7
(diff với merge-base, diff `origin/onehub` hai tệp khai model OKR, ba tệp sửa tạm trùng HEAD). Chiều đỏ của từng eval tự
chạy trên bản sao evidence, ghim thông điệp. Viết và chạy trên evidence giả lập TRƯỚC lượt đo thật (đối chứng dương
bằng bản sao nguyên khi đã có evidence thật).

### T7 — Lượt đo thật (dưới khoá s4)
Thứ tự: T2 → T3 (10 lượt) → T4 → T5 (2 lượt). Sau đó `so-do.ts --ghi` dựng bảng và trang, `so-do.ts` xanh, `--pham-vi`
xanh. Commit evidence.

Phụ thuộc: T1 trước mọi tác vụ; T2–T5 độc lập với nhau; T6 cần T1 và khuôn đầu ra của T2–T5; T7 cần tất cả.
