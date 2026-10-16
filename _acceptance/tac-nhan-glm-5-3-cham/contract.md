---
schema_version: 1
feature: Đo Tác nhân bộ dựng trên bốn biến thể model (GLM 5.2 Fast, GLM 5.3, GLM 5.3 hạng nhanh, GLM 5.3 suy luận thấp) bằng số bước, token và giây của phiên con, và nêu nguyên nhân GLM 5.3 chạy quá trần kèm số làm bằng
slug: tac-nhan-glm-5-3-cham
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [agent]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-16
design_doc: _acceptance/tac-nhan-glm-5-3-cham/design.md
---

# Acceptance Contract: tac-nhan-glm-5-3-cham

## Context

Hàng MH3 của dãy P6, đợt r2. Cổng Đáng ký `build` (chủ kho, 2026-10-16T05:33:48Z, nguyên văn «MH3 build; MH4 build; K7
build», ghi ở `opportunity.md`). Việc điều tra, không sửa sản phẩm. Phần đã biết từ đọc mã và nhật ký ở `design.md`.

## Criteria

- AC-1: Given bốn biến thể (mốc `zai/glm-5.2-fast`; `zai/glm-5.3`; `zai/glm-5.3-fast`; `zai/glm-5.3` với `reasoning: "low"` ở phiên con `agent_builder`), When chạy `eve eval agent-builder` xen kẽ theo vòng (mốc, glm53, glm53-fast, glm53-low) cho tới đủ số lượt mỗi biến thể, mỗi lượt một kho đo riêng, Then bằng chứng có một dòng mỗi lượt, ghi: biến thể, kết quả eval (qua hay hỏng, lý do), giờ bắt đầu và kết thúc, cờ `bi_cat` khi eval huỷ ở 180 giây, băm của `subagents/agent_builder/agent.ts` lúc chạy, và của phiên con `agent_builder`: số bước, token vào, token ra, giây từ bước đầu tới bước cuối — tính lại được từ bản kết xuất thô bảng `aiChiPhi` của chính lượt đó; And không hai lượt nào chồng giờ, không hai lượt liền nhau cùng biến thể.
- AC-2: Given mỗi lượt, When đối chiếu dòng của lượt trong `evidence/tac-nhan.jsonl` với kế hoạch và đọc `rang/do-tac-nhan.ts`, Then dòng ghi model bằng model của biến thể, và ô model của kho đo được đọc lại ngay trước khi eval chạy (đọc lại lệch thì lượt dừng, không có dòng); lượt lệch được in «sai model» và loại khỏi kết luận, không làm đỏ cả hồ sơ; And chỉ các lượt glm53-low mang băm của bản sửa tạm, mọi lượt khác mang băm của bản đã commit. Bản kết xuất `aiChiPhi` không chứng model vì cột `modelId` luôn rỗng (`so-chi-phi.ts:90`); bằng chứng model theo từng bước thuộc hàng MH4.
- AC-3: Given một phép dò thẳng AI Gateway với `zai/glm-5.3` ở mức suy luận `low` và `high` trên cùng một câu, When đọc `usage` Gateway trả, Then bằng chứng ghi token suy luận của hai mức, để biết mức `low` có tới nhà cung cấp hay không.
- AC-4: Given bảng các lượt, When đọc kết luận, Then kết luận chỉ nêu nguyên nhân khi glm53 mặc định trong lô có ít nhất một lượt hỏng hay trên 180 giây (không thì ghi «không tái hiện»); mỗi câu về nguyên nhân dẫn chênh lệch số bước, token, giây của phiên con giữa hai biến thể kèm tên tệp nhật ký lượt; biến thể còn ít hơn số lượt đã định thì không được nói «cả n lượt»; mọi con số khớp một ô của bảng hay của phép dò AC-3, hoặc ghi nguồn P0 khi là số của GLM 5.3 Flash; và kết luận nói rõ trần 3 phút là của bài đo còn phiên bộ dựng thật có trần một ngày.
- AC-5: Given nhánh của hàng này, When so với điểm cắt từ onehub, Then không tệp nào ngoài `_acceptance/tac-nhan-glm-5-3-cham/` và các dòng thêm vào `_acceptance/config.yaml` bị đổi.

## Coverage

Không gian khép kín: bốn biến thể đã kê ở design.md (mốc, mặc định, hạng nhanh, suy luận thấp) × số lượt theo Hỏi-1
(AC-1, AC-2, AC-4), cộng một phép dò mức suy luận ở Gateway (AC-3). Giả thuyết ZDR loại bằng đọc mã (design.md mục 4),
giả thuyết trần bài đo trả lời bằng đọc mã (mục 3). Bỏ quét: dòng sổ `descope`.

## Đường đo

- Số lượt qua dưới 180 giây của mỗi biến thể · `evidence/tac-nhan.jsonl` và bản kết xuất `aiChiPhi` từng lượt, đếm bằng `rang/so-tac-nhan.ts` · AC-1, AC-4 bảo đảm.
- Token suy luận của `zai/glm-5.3` ở mức low và high · `evidence/do-suy-luan.json` · AC-3 bảo đảm.
- Giây và số bước của phiên con `agent_builder` mỗi biến thể · cùng nguồn · AC-1 bảo đảm.

## Out of scope

- Đặt mức suy luận hay đổi model trong sản phẩm — hàng MH4 quyết theo số của hồ sơ này.
- Trải nghiệm chờ Tác nhân lâu — hàng K7.
- Token suy luận riêng của từng lượt Tác nhân (sổ chi phí chỉ ghi token ra tổng); mức suy luận đo riêng bằng phép dò AC-3.

## Notes

- Gọi model thật qua AI Gateway: các lượt Tác nhân (số lượt theo Hỏi-1) và hai lời gọi dò mức suy luận, dưới khoá s4.
- Số của GLM 5.3 Flash không đo lại ở hồ sơ này; kết luận dẫn số P0 (dòng sổ «KHÔNG đo GLM 5.3 Flash»).
