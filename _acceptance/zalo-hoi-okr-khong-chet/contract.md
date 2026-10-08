---
schema_version: 1
feature: Zalo hỏi OKR không chết lượt — ngoài phiên OKR, agent gốc gọi tro_ly_okr thì nhận một kết quả từ chối có lý do và vẫn trả lời người hỏi
slug: zalo-hoi-okr-khong-chet
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-08T10:29:20Z
design_doc: _acceptance/zalo-hoi-okr-khong-chet/design.md
---

# Acceptance Contract: zalo-hoi-okr-khong-chet

## Context

Hỏi bot Zalo «KR doanh thu quý này đang đạt bao nhiêu phần trăm?» thì agent gốc gọi subagent `tro_ly_okr`, hook `okr-uy-quyen` ném lỗi vì phiên không phải OKR, lượt chết, người hỏi nhận «Tôi chưa trả lời được câu này…». Lặp 2/2 lượt model thật trên máy đo ngày 08/10. Có trên onehub từ 28/09.

Cổng Đáng: chủ kho «F12 A, build» qua giám sát, 08/10 — hàng sửa nóng H1.

Source input: `opportunity.md` (bằng chứng máy đo + nhật ký production), `design.md`.

## Criteria

- AC-1: Given bàn đo của tro-ly-doc-kho (kho đo dùng-một-lần, `eve dev` thật của `apps/agent`, Zalo giả, model gốc thật như production) và một bộ câu chỉ có c33 «KR doanh thu quý này đang đạt bao nhiêu phần trăm?», When c33 được gửi qua `/zalo/webhook` ba lượt liền, Then ở ba lượt mà model gốc có gọi `tro_ly_okr`: lời gọi đi tới công cụ đè (không có lời gọi subagent `tro_ly_okr` thật); hàng ZaloHoi của tin kết thúc `da-tra-loi`; Zalo giả nhận đúng một tin trả lời, khác `ZALO.loi.tacTuLoi` và có chữ «OKR»; `eve.log` của lượt không có dòng «may be called only from an OKR session».
- AC-2: Given mỗi giá trị `purpose` trong `SESSION_PURPOSES` (tám giá trị), When công cụ động `tro-ly-okr-ngoai` giải ở `step.started` với `purpose` đó, Then `purpose` `okr` nhận `null` (subagent `tro_ly_okr` thật còn nguyên); bảy giá trị còn lại nhận đúng một công cụ tên `tro_ly_okr`, và gọi `execute` của nó trả `{ ok: false, reason }` với `reason` bằng `TRO_LY_OKR.ngoaiPhien.lyDo`.
- AC-3: Given hook `okr-uy-quyen`, When một lượt có `purpose` khác `okr` vẫn xin gọi subagent `tro_ly_okr` thật, hoặc lượt có `purpose` `okr` gọi công cụ khác hay gọi `tro_ly_okr` lần hai, Then hook chặn như trước — ma trận của `okr-uy-quyen.spec.ts` xanh không sửa.
- AC-4: Given diff của vòng so với merge-base với `onehub`, Then chỉ các tệp `apps/agent/agent/tools/tro-ly-okr-ngoai.ts`, `apps/agent/agent/lib/okr/config.ts`, `apps/agent/test/okr-uy-quyen-ngoai.spec.ts`, `_acceptance/zalo-hoi-okr-khong-chet/**`, `PRODUCT-MAP.md`, `LO-TRINH.html`, các dòng THÊM vào `_acceptance/config.yaml`, và chỉ dòng THÊM mang tên `tro-ly-okr-ngoai` ở `apps/agent/agent/lib/zalo-config.ts` (một dòng, `ZALO.hoi.congCu.doc`), `packages/telemetry/src/allowlist.ts` (một dòng, `AGENT_TOOLS`), `apps/app/lib/agent-transcript.ts` (một dòng, `TOOL_VERBS`) và `apps/app/lib/messages/kara-ban-ghi.ts` (hai dòng, nhãn en và vi) đổi — riêng `apps/agent/test/okr-uy-quyen.spec.ts` không đổi một dòng.
- AC-5: Given một việc OKR nền chạy thật (`purpose` `okr`, `eve` thật, model thật có cờ ZDR) sau bản sửa, When lượt gốc của việc đó gọi `tro_ly_okr`, Then đó là subagent thật (`tro_ly_okr` con chạy và chỉ gọi `nop_de_xuat`), không phải công cụ đè trả `{ ok: false }`.

## Coverage

Quét bằng `morphological-scan` (preset test-matrix), 08/10.

- **Trục A — mục đích phiên gốc:** tám giá trị của `SESSION_PURPOSES`.
  - Thước CE: `packages/validation/src/phien-tac-tu.ts` (đọc 08/10).
- **Trục B — model gốc xin gì:** `tro_ly_okr` | công cụ khác | `tro_ly_okr` lần hai.
  - Thước CE: các nhánh của `quyetUyQuyen` (`lib/okr/uy-quyen.ts`).
- **Trục C — đường chạy:** model giả gọi thẳng resolver/hook | `eve dev` thật + model thật qua Zalo.
  - Thước CE: bàn thử `okr-uy-quyen.spec.ts`; máy đo `cham-bo-do.ts`.
- **Ô Core:** A×B1 qua resolver (AC-2) · A×B qua hook (AC-3) · zalo×B1 trên `eve dev` thật (AC-1) · okr×B1 trên `eve` thật (AC-5) · ranh giới (AC-4).
- **Đối chiếu ngành:** [NGÀNH: eve `defineDynamic` — «a dynamic tool whose name matches an authored one overrides it», `eve/docs/guides/dynamic-capabilities.md`]; mẫu sẵn trong kho: `tools/zalo-chi-doc.ts`, `tools/okr-chi-tro-ly.ts`.
- **Later:**
  - cho Zalo đọc số liệu OKR thật (tính năng mới, đụng ZDR).

## Đường đo

- «c33 và mọi câu hỏi KR/OKR khác qua Zalo trên máy đo có ZaloHoi `da-tra-loi`, không `MODEL_CALL_FAILED`»: số từ E1 (ba lượt c33) · AC-1. Các câu OKR khác: E15 của tro-ly-doc-kho chạy lại khi F12 round 3.
- «0 dòng «may be called only from an OKR session» trên production hai tuần sau khi (A) được gỡ»: không có bộ đếm máy; người đo chạy `vercel logs -p crm-onehub-agent … --query "OKR session"` · AC-1.

## Out of scope

- (A) Webhook Zalo trả 403 / không tin nào tới production từ 30/09 — hàng riêng.
- (B) Nhật ký `sendMessage hong: tra-loi-la` vứt `description` của Zalo — hàng riêng.
- Zalo trả số liệu OKR thật cho câu hỏi KR.
- Đổi chỉ dẫn kênh Zalo (`lib/zalo-chi-dan.ts`).
- eve bỏ qua công cụ động ở bước replay (ghi nhớ 26/09): không đo được bằng máy ở vòng này.

## Notes

- Không migration. Không đổi API.
- Tệp ngoài ranh giới ban đầu: `apps/agent/agent/tools/tro-ly-okr-ngoai.ts` (giám sát duyệt P5-22); `lib/zalo-config.ts` và `packages/telemetry/src/allowlist.ts` mỗi tệp một dòng, do hai bài canh quét `agent/tools/` (`zalo-chi-doc.spec.ts`, `allowlist.spec.ts`) — xin ở P5-23, P5-24.
