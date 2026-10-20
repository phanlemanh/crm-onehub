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

## Vòng mở lại 21/10 — DeepSeek và Gemini kho

Hợp đồng duyệt lại 21/10 (d-20261020T224703Z-27). `ke-hoach.json` ghim ứng viên, giá niêm yết, cỡ mẫu, thứ tự, trần 12 USD
(Hỏi-11); `rang/nguong.json` thêm khối `chon` (Hỏi-10). Bằng chứng `glm` vòng đầu giữ nguyên byte.

### T8 — Khuôn nhiều ứng viên (`rang/khuon.ts`)
`khuonKeHoach` mới (ung_vien, gia, tac_nhan.ung_vien[].bien_the, do_suy_luan, thu_tu); `khuonNguong.chon`; dòng tác nhân có
`ung_vien` tuỳ chọn (dòng cũ suy từ biến thể); hàng aiChiPhi có `tinhNang`, `cacheReadTokens` tuỳ chọn; tóm tắt kho thêm
`ung_vien`, `aichiphi`, `so_du_truoc/sau`, `usd_nguon` mở rộng; tóm tắt soạn thêm `ung_vien`, `aichiphi`; bảng: mỗi hàng một
mảng ứng viên (số, chi phí phần ứng viên, chi phí thật, trạng thái). Bỏ `MTV.model`; đường bằng chứng theo khoá ứng viên
(`glm` giữ tên cũ). Phục vụ E1–E7.

### T9 — Thước đo theo ứng viên (`rang/do-*.ts`, `do-soan-chay.mjs`)
Mỗi thước nhận `--ung-vien <ma>` (mặc định: mọi ứng viên của vai trong `ke-hoach.json`, bỏ ứng viên đã đủ lượt); model và
biến thể đọc từ `ke-hoach.json`; kết xuất aiChiPhi (kèm `tinhNang`, `cacheReadTokens`) cho lượt kho và soạn từ kho đo của
phiên đo; khoá chi phí `<ma>-<n>` cho lượt mới, dòng `glm` cũ giữ khoá cũ. Phục vụ E1–E4, E6.

### T10 — Bộ so và bảng (`rang/so-do.ts`)
Kiểm E1–E6 trên mọi ứng viên; luật vai rồi luật chọn (`nguong.chon`); chi phí phần ứng viên tính lại từ kết xuất × giá;
ứng viên đạt mà thiếu chi phí → «chưa đủ số»; ghim byte bằng chứng `glm` về 49456c140; chiều đỏ mới của E1–E6 tự chạy trên
bản sao; dựng lại `bang-kien-nghi.json` và `docs/model-theo-vai.md`. Viết và chạy trên bằng chứng giả lập của `ds`, `gem`
TRƯỚC lượt đo thật.

### T11 — Lượt đo thật (dưới khoá s4)
Thứ tự theo `ke-hoach.json`: dò `ds` → Tác nhân `ds`, `ds-low` (10) → soạn `ds` (2) → kho `ds` → kho `gem`. Sau đó
`so-do.ts --ghi`, `so-do.ts` xanh, `--pham-vi` xanh. Commit evidence.
