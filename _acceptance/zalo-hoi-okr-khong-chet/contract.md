---
schema_version: 1
feature: Zalo hỏi OKR không chết lượt — ngoài phiên OKR, agent gốc gọi tro_ly_okr thì nhận một kết quả từ chối có lý do và vẫn trả lời người hỏi
slug: zalo-hoi-okr-khong-chet
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-08T23:53:07Z
design_doc: _acceptance/zalo-hoi-okr-khong-chet/design.md
---

# Acceptance Contract: zalo-hoi-okr-khong-chet

## Context

Hỏi bot Zalo «KR doanh thu quý này đang đạt bao nhiêu phần trăm?» thì agent gốc gọi subagent `tro_ly_okr`, hook `okr-uy-quyen` ném lỗi vì phiên không phải OKR, lượt chết, người hỏi nhận «Tôi chưa trả lời được câu này…». Lặp 2/2 lượt model thật trên máy đo ngày 08/10. Có trên onehub từ 28/09.

Cổng Đáng: chủ kho «F12 A, build» qua giám sát, 08/10 — hàng sửa nóng H1.

Source input: `opportunity.md` (bằng chứng máy đo + nhật ký production), `design.md`.

## Criteria

- AC-1: Given bàn đo của tro-ly-doc-kho (kho đo dùng-một-lần, `eve dev` thật của `apps/agent`, Zalo giả, model gốc thật như production) với công cụ đè `tro-ly-okr-ngoai` bật như production và một bộ câu chỉ có c33 «KR doanh thu quý này đang đạt bao nhiêu phần trăm?», When c33 được gửi qua `/zalo/webhook` sáu lượt liền, Then cả sáu lượt: hàng ZaloHoi của tin kết thúc `da-tra-loi`; Zalo giả nhận đúng một tin trả lời, khác `ZALO.loi.tacTuLoi` và có chữ «OKR»; `eve.log` của lượt không có dòng «may be called only from an OKR session»; lượt nào model vẫn gọi subagent `tro_ly_okr` thật thì hợp lệ khi `eve.log` có dòng `[okr-uy-quyen] ngoai-okr purpose=zalo` — số lượt có gọi chỉ ghi lại; đường có gọi khi không có công cụ đè đo ở AC-7.
- AC-2: Given mỗi giá trị `purpose` trong `SESSION_PURPOSES` (tám giá trị), When công cụ động `tro-ly-okr-ngoai` giải ở `step.started` với `purpose` đó, Then `purpose` `okr` nhận `null` (subagent `tro_ly_okr` thật còn nguyên); bảy giá trị còn lại nhận đúng một công cụ tên `tro_ly_okr`, và gọi `execute` của nó trả `{ ok: false, reason }` với `reason` bằng `TRO_LY_OKR.ngoaiPhien.lyDo`; And khi `NODE_ENV` là `production` thì công tắc đo `TRO_LY_OKR_BO_DE` bị bỏ qua — `purpose` `zalo` vẫn nhận công cụ đè dù biến bằng `1`.
- AC-3: Given hook `okr-uy-quyen`, When một lượt có `purpose` khác `okr` xin gọi subagent `tro_ly_okr` thật, Then hook KHÔNG ném (lượt không hỏng), ghi đúng một dòng `[okr-uy-quyen] ngoai-okr purpose=<purpose>` không mang chữ nào của câu hỏi, và không đổi giá trị `uyQuyenOkrState`; When lượt có `purpose` `okr` gọi công cụ khác hay gọi `tro_ly_okr` lần hai, Then hook ném như trước (`khacTroLy`, `lanHai`) — ma trận viết trước tám `purpose` × ba loại xin.
- AC-4: Given diff của vòng so với merge-base với `onehub`, Then chỉ các tệp `apps/agent/agent/tools/tro-ly-okr-ngoai.ts`, `apps/agent/agent/lib/okr/config.ts`, `apps/agent/agent/lib/okr/uy-quyen.ts`, `apps/agent/agent/subagents/tro_ly_okr/instructions/viec.ts`, `.env.example` (chỉ dòng THÊM khai `TRO_LY_OKR_BO_DE`), `_acceptance/tro-ly-okr-nen/run-log.jsonl` (chỉ dòng THÊM của lượt ghim lại) và `_acceptance/tro-ly-okr-nen/evidence-report.md` (chỉ dòng `verified_commit` và mục «### Re-pin» thêm cuối — ghim lại hồ sơ đã ký đó trong cùng PR vì `okr-uy-quyen.spec.ts` và hook của nó đổi), `apps/agent/agent/hooks/okr-uy-quyen.ts`, `apps/agent/test/okr-uy-quyen-ngoai.spec.ts`, `apps/agent/test/okr-uy-quyen.spec.ts` (chỉ các dòng ma trận của `purpose` khác `okr`), `docs/agent.md` (đính chính đoạn «Hook chỉ quan sát»), `_acceptance/zalo-hoi-okr-khong-chet/**`, `PRODUCT-MAP.md`, `LO-TRINH.html`, các dòng THÊM vào `_acceptance/config.yaml`, và chỉ dòng THÊM mang tên `tro-ly-okr-ngoai` ở `apps/agent/agent/lib/zalo-config.ts` (một dòng, `ZALO.hoi.congCu.doc`), `packages/telemetry/src/allowlist.ts` (một dòng, `AGENT_TOOLS`), `apps/app/lib/agent-transcript.ts` (một dòng, `TOOL_VERBS`) và `apps/app/lib/messages/kara-ban-ghi.ts` (hai dòng, nhãn en và vi) đổi.
- AC-5: Given một việc OKR nền chạy thật (`purpose` `okr`, `eve` thật, model thật có cờ ZDR) sau bản sửa, When lượt gốc của việc đó gọi `tro_ly_okr`, Then đó là subagent thật (`tro_ly_okr` con chạy và chỉ gọi `nop_de_xuat`), không phải công cụ đè trả `{ ok: false }`.
- AC-6: Given một phiên con `tro_ly_okr` mà phiên gốc không có hàng `okr-*` nào (như phiên Zalo), When phiên con gọi `nop_de_xuat` và `nop_tom_tat` bằng đầu vào hợp lệ — kể cả khi đúng lúc đó có một việc `okr-de-xuat` đang chạy gắn một phiên gốc KHÁC —, Then cả hai trả `tu-choi` «not an OKR session» và không ghi hàng `okrDeXuat`, `okrTomTat` nào; đối chứng: phiên gốc có việc `okr-de-xuat` của chính nó đang chạy thì `nop_de_xuat` ghi được.
- AC-7: Given bàn đo của AC-1 với công cụ đè tắt bằng công tắc đo `TRO_LY_OKR_BO_DE=1` truyền vào tiến trình `eve dev` của lượt (không sửa, không cất tệp nào trong cây; như khi eve bỏ công cụ động ở bước replay), When c33 được gửi lần lượt tới khi có ít nhất một lượt tác nhân gốc gọi subagent `tro_ly_okr` thật (tối đa sáu lượt), Then mọi lượt đã chạy đạt đủ ba điều của AC-1 (ZaloHoi `da-tra-loi`; đúng một tin, khác `ZALO.loi.tacTuLoi`, có «OKR»; không có «may be called only from an OKR session»); lượt có gọi có thêm dòng `[okr-uy-quyen] ngoai-okr purpose=zalo`; sáu lượt không lượt nào gọi thì phép đo thoát 2 «khong ep duoc goi», không xanh. Khi `TRO_LY_OKR_BO_DE` vắng, hay `NODE_ENV` là `production`, công cụ đè giải như AC-2.
- AC-8: Given một phiên con `tro_ly_okr` mà phiên gốc không có hàng `okr-*` nào (như phiên Zalo), When chỉ dẫn động `subagents/tro_ly_okr/instructions/viec.ts` giải ở `session.started`, Then phiên con nhận đúng một chỉ dẫn `TRO_LY_OKR.ngoaiPhien.chiDanKhongViec`: không gọi công cụ nào, trả về phiên gốc nguyên văn câu `TRO_LY_OKR.ngoaiPhien.lyDo` (câu đó chỉ người hỏi sang mục OKR của OneHub Center); And phiên con mà phiên gốc có việc `okr-de-xuat` hay `okr-tom-tat-tuan` đang chạy nhận chỉ dẫn của việc như trước, không mang câu `lyDo`; And việc đã kết thúc (`finishedAt`) vẫn nhận `null`.

## Coverage

Quét bằng `morphological-scan` (preset test-matrix), 08/10.

- **Trục A — mục đích phiên gốc:** tám giá trị của `SESSION_PURPOSES`.
  - Thước CE: `packages/validation/src/phien-tac-tu.ts` (đọc 08/10).
- **Trục B — model gốc xin gì:** `tro_ly_okr` | công cụ khác | `tro_ly_okr` lần hai.
  - Thước CE: các nhánh của `quyetUyQuyen` (`lib/okr/uy-quyen.ts`).
- **Trục C — đường chạy:** model giả gọi thẳng resolver/hook | `eve dev` thật + model thật qua Zalo.
  - Thước CE: bàn thử `okr-uy-quyen.spec.ts`; máy đo `cham-bo-do.ts`.
- **Ô Core:** A×B1 qua resolver (AC-2) · A×B qua hook (AC-3) · zalo×B1 trên `eve dev` thật không gọi (AC-1) và có gọi subagent thật (AC-7) · công cụ nộp của phiên con ngoài OKR (AC-6) · chỉ dẫn của phiên con không có việc (AC-8) · okr×B1 trên `eve` thật (AC-5) · ranh giới (AC-4).
- **Đối chiếu ngành:** [NGÀNH: eve `defineDynamic` — «a dynamic tool whose name matches an authored one overrides it», `eve/docs/guides/dynamic-capabilities.md`] — nhưng `docs/agent.md` (đo trên eve 0.29.4) ghi bản thay KHÔNG đè được subagent: lời gọi vẫn tới phiên con, nên lối sửa thật là hook không ném (AC-3), công cụ đè chỉ giảm số lần gọi; mẫu sẵn trong kho: `tools/zalo-chi-doc.ts`, `tools/okr-chi-tro-ly.ts`.
- **Later:**
  - cho Zalo đọc số liệu OKR thật (tính năng mới, đụng ZDR).

## Đường đo

- «c33 và mọi câu hỏi KR/OKR khác qua Zalo trên máy đo có ZaloHoi `da-tra-loi`, không `MODEL_CALL_FAILED`»: số từ E1 (sáu lượt c33 liền) · AC-1. Các câu OKR khác: E15 của tro-ly-doc-kho chạy lại khi F12 round 3.
- «0 dòng «may be called only from an OKR session» trên production hai tuần sau khi (A) được gỡ»: không có bộ đếm máy; người đo chạy `vercel logs -p crm-onehub-agent … --query "OKR session"` · AC-1.

## Out of scope

- (A) Webhook Zalo trả 403 / không tin nào tới production từ 30/09 — hàng riêng.
- (B) Nhật ký `sendMessage hong: tra-loi-la` vứt `description` của Zalo — hàng riêng.
- Zalo trả số liệu OKR thật cho câu hỏi KR.
- Đổi chỉ dẫn kênh Zalo (`lib/zalo-chi-dan.ts`).
- eve bỏ qua công cụ động ở bước replay (ghi nhớ 26/09): không đo replay riêng — AC-7 đo đúng hậu quả của nó (model thấy subagent thật) bằng công tắc đo `TRO_LY_OKR_BO_DE`.
- Câu trả lời cuối của tác nhân gốc vẫn do model viết: AC-8 chỉ bảo đảm nó nhận được câu chỉ sang OKR; còn chữ «OKR» trên tin Zalo đo ở AC-7.

## Notes

- Không migration. Không đổi API.
- Tệp ngoài ranh giới ban đầu: `apps/agent/agent/tools/tro-ly-okr-ngoai.ts` (giám sát duyệt P5-22); `lib/zalo-config.ts` và `packages/telemetry/src/allowlist.ts` mỗi tệp một dòng, do hai bài canh quét `agent/tools/` (`zalo-chi-doc.spec.ts`, `allowlist.spec.ts`) — xin ở P5-23, P5-24.

- Sửa sau S4 round 1 (REJECT, 08/10): phản biện chỉ ra công cụ đè không đè được subagent (`docs/agent.md`); chủ kho duyệt hướng mới 08/10 («Duyệt hướng mới H1»): hook không ném ngoài phiên OKR, công cụ nộp tự từ chối (AC-6), đo ép gọi (AC-7); E6 chạy qua `mot-luot.sh` vì đụng `eve dev` của E1.
- Sửa sau S4 round 3 (REJECT, 08/10, hết trần ba round): E8 đỏ vì trên đường subagent thật, phiên con không có việc thì không nhận chỉ dẫn nào (`viec.ts` trả `null`), nên câu chỉ sang OKR chỉ nằm ở công cụ đè — mà eve bỏ công cụ động khi replay, nên đó cũng là đường production của mọi lượt Zalo sau lượt đầu. Thêm AC-8, nới AC-4 thêm `instructions/viec.ts`, chặn công tắc đo ở production (AC-2), xin chủ kho duyệt round 4.
- Subagent `tro_ly_okr` chỉ có công cụ nộp; công cụ dựng sẵn (web, bash…) tắt bằng `disableTool()` và sandbox `deny-all` — lời hứa AC-7 của hồ sơ đã ký `tro-ly-okr-nen` — nên phiên con chạy dưới phiên Zalo không mở thêm đường đọc hay ghi nào.