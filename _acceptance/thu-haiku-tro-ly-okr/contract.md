---
schema_version: 1
feature: "Thử Haiku 5.5 cho Trợ lý OKR, và kho đo thôi chạy GLM 5.2 Fast"
slug: thu-haiku-tro-ly-okr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [agent, docs]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-15
design_doc: docs/superpowers/specs/2026-10-14-thu-haiku-tro-ly-okr-design.md
---

# Acceptance Contract: thu-haiku-tro-ly-okr

## Context

Hàng phát sinh của đợt r2, giám sát giao dãy P0 ngày 14/10 sau khi chủ kho duyệt hai việc (b) «thử Haiku 5.5»
và (c) «thống nhất model đo theo phương án B». Lượt thử 14/10 đổi hằng tại chỗ cho số không dùng được: Haiku bị
cắt ở trần 2 000 token chỉnh cho Gemini (11/20 lượt E24), và Tác nhân trên kho đo chạy GLM 5.2 Fast vì ô model
trống. Vòng này dựng đồ để lượt so chạy không sửa mã, gieo model vào kho đo, rồi chạy lượt so sau khi thước
E22/E24 của `tro-ly-okr-de-xuat` đã sửa. Không đổi model nào trên production.

Source input: `opportunity.md` · design doc · `docs/agent.md` (model, mục 5, mục 6) · `docs/environment.md` ·
nhật ký đo 14/10 chép ở `rang/mau/`.

## Criteria

- AC-1: Given `TRO_LY_OKR_MO_HINH` không đặt, When nạp mô-đun model của Trợ lý OKR, Then model góp ý, model tóm tắt tuần và model phiên gốc `okr` (cả `session.started` lẫn `step.started`) đều là `google/gemini-3.8-flash`, trần ra mỗi lời gọi góp ý 2 000, trần tóm tắt 8 000, cửa sổ ngữ cảnh 1 048 576, và `ghiModelPhien` ghi `google/gemini-3.8-flash` — y như trước vòng; When biến đặt tường minh `google/gemini-3.8-flash`, Then mục được chọn trùng hệt mục mặc định.
- AC-2: Given `TRO_LY_OKR_MO_HINH=anthropic/claude-haiku-5.5` và `NODE_ENV` khác `production`, When nạp mô-đun và gọi model góp ý, model tóm tắt và model phiên gốc `okr`, Then cả bốn vai gọi `anthropic/claude-haiku-5.5` qua Gateway với `zeroDataRetention: true` và thẻ `onehub:tro-ly-okr`, trần ra mỗi lời gọi góp ý 4 000, trần tóm tắt 8 000, cửa sổ ngữ cảnh 1 000 000, `ghiModelPhien` ghi `anthropic/claude-haiku-5.5`, và lời gọi không mang tuỳ chọn suy nghĩ riêng cho Anthropic; When cùng biến đặt cho một tiến trình con nạp đúng các mô-đun mà `subagents/tro_ly_okr/agent.ts` nhập, Then tiến trình đó cũng gọi Haiku ở cả bốn vai.
- AC-3: Given `TRO_LY_OKR_MO_HINH` mang một giá trị ngoài danh sách (`zai/glm-5.2-fast`, chuỗi chỉ có khoảng trắng, chữ hoa của một mã hợp lệ), When nạp mô-đun, Then việc nạp ném lỗi có tên biến, giá trị nhận được và cả hai mã hợp lệ, và không model nào được dựng.
- AC-4: Given `NODE_ENV=production`, When `TRO_LY_OKR_MO_HINH` là `anthropic/claude-haiku-5.5` hay một giá trị ngoài danh sách, Then biến bị bỏ qua: mọi model của Trợ lý OKR là `google/gemini-3.8-flash` với trần 2 000, và không lỗi nào được ném.
- AC-5 (cross-layer): Given kho dev và một cây chưa có kho đo, When chạy `bun run db:do --tao` cho cây đó, Then kho đo mới có `AppSetting.agentModelId` = mã model đo khai ở `MEASURE_DATABASE` (`google/gemini-3.8-flash`) với cửa sổ khai kèm, `readAgentModel` trên kho đó trả `isDefault: false`, ô ấy được ghi bằng `writeAgentModel`, và `AppSetting` của kho nguồn không đổi; When đổi mã model đo, Then dấu vân tay nguồn đổi và lần `--tao` kế dựng lại mẫu.
- AC-6: Given nhật ký đo thật ngày 14/10 ở `rang/mau/`, When `doc-so.mjs` đọc chúng, Then E24 Haiku ra 11 lượt hỏng trên 20, E24 Gemini ra 0 lượt hỏng với p50 13 360 và p90 30 990, E22 Haiku ra 20/30 ca đúng, 3 ca góp ý thừa (gy-10, gy-12, gy-13), judge 0,95, chi 0,158889 USD, E22 Gemini mất kho ra «không đo được», và dòng kết quả của một eval trong đầu ra `eve eval` đọc ra qua hay trượt; `NGUONG` bằng đúng các số ở mục «SỐNG» của ô cơ hội (E24 0 lượt hỏng/20, E22 ≥ 28/30, 0 ca góp ý thừa, judge ≥ 0,9, Tác nhân 3/3), và `ketLuan` đặt ở biên đúng từng vế: 0 hỏng đạt, 1 hỏng trượt; 28/30 đạt, 27/30 trượt; 0 ca thừa đạt, 1 ca trượt; judge 0,90 đạt, 0,89 trượt; Tác nhân 3/3 đạt, 2/3 trượt.
- AC-7: Given việc sửa thước E22/E24 của `tro-ly-okr-de-xuat` đã gộp vào onehub và số dư Gateway dương, When chạy `rang/so-mo-hinh.mjs` trên cây của vòng, Then nó chạy lần lượt E24 và E22 với Gemini rồi Haiku, ba lượt bộ dựng Tác nhân cho mỗi model, đọc lại mã model đã thật sự chạy ở mỗi nhánh (sự kiện `model.phien-chon` của các lượt Trợ lý OKR, ô model của kho đo ở nhánh Tác nhân), in bảng số của hai model kèm số lượt theo từng kết cục (`da-nop`, `hong:het-lease`, `hong:turn-failed`, …) và kết luận từng vai theo `NGUONG`, rồi thoát 0; When số dư ≤ 0, một nhánh không đo được, hay mã model đã chạy khác model của nhánh, Then thoát 2 nêu nhánh và dòng nhật ký.
- AC-8 (judgment): Given `.env.example`, `docs/environment.md`, `docs/agent.md` và `docs/setup.md` sau vòng này, When một người mới đọc, Then biết `TRO_LY_OKR_MO_HINH` chỉ dùng cho phép đo, nhận đúng hai mã `google/gemini-3.8-flash` và `anthropic/claude-haiku-5.5`, bị bỏ qua trên production, giá trị lạ làm agent không khởi động; biết kho đo mang sẵn `google/gemini-3.8-flash` cho agent chính và Tác nhân, vì sao không còn là GLM 5.2 Fast, và đổi ở `MEASURE_DATABASE` trong `packages/db/src/measure-database.ts`.

## Coverage

Quét tay theo ba trục (soạn cùng lúc với hợp đồng, không gọi skill):

- Vai gọi model: góp ý · tóm tắt tuần · phiên gốc `okr` · Tác nhân/bộ dựng · agent chính.
- Nguồn chọn model: không đặt · Gemini tường minh · Haiku · giá trị lạ · production.
- Kho: dev `crm` · kho đo · kho test · production.

Ô lõi: {góp ý, tóm tắt, phiên gốc} × {không đặt, Gemini tường minh} → AC-1; × Haiku → AC-2; × lạ → AC-3; ×
production → AC-4; {Tác nhân, agent chính} × kho đo → AC-5, đo ở AC-7. Ô ngoài: kho test, production và Tác nhân
trên kho dev → Out of scope. Thước của Coverage là chính danh sách ô này `[CE chưa kiểm chứng]`.

## Đường đo

- Ngưỡng Trợ lý OKR (E24 0/20 hỏng; E22 ≥ 28/30, 0 ca góp ý thừa; judge ≥ 0,9): số từ `so-mo-hinh.mjs` gọi `do-tre.mjs` và `eval-gop-y.mjs` — AC-7, bộ đọc và `NGUONG` ở AC-6.
- Ngưỡng Tác nhân (3/3 lượt mỗi model): số từ `so-mo-hinh.mjs` gọi `eve eval agent-builder` trên kho đo — AC-7, ô model gieo theo AC-5.

## Out of scope

- Đổi model Trợ lý OKR, agent chính hay Tác nhân trên production — ship ra người dùng thật; người quyết theo bảng của AC-7.
- Đổi `DEFAULT_AGENT_MODEL` (phương án A) và gieo ô model vào kho test `crm_<id>_test` — nhiều bài kiểm dựa vào ô trống để thử đường lùi mặc định.
- Lease theo model — giữ 30 s; lượt hết lease hiện ra ở E24 thành lượt hỏng.
- Tuỳ chọn suy nghĩ riêng cho Anthropic — lượt so giữ Haiku chạy mặc định như lượt 14/10 để số còn so được.
- Soạn OKR (`apps/agent-okr`), Kho tài liệu, bộ chấm nội bộ GLM 5.2 Fast.
- Sửa thước E22/E24 của `tro-ly-okr-de-xuat` — việc (a), PR riêng.

## Notes

- AC-7 chạy ở S4 sau khi việc (a) gộp; trước đó kho `crm_tdx_e22_do` còn dùng chung giữa các cây.
