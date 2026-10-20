---
schema_version: 1
feature: Đo zai/glm-5.3-flash cho Tác nhân, Trợ lý kho và Soạn OKR bằng thước đã có, rồi dựng bảng kiến nghị model theo vai trỏ từng lượt đo
slug: model-theo-vai-do-lai
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [agent]
status: implemented
approved_by: manh
approved_at: 2026-10-20
design_doc: _acceptance/model-theo-vai-do-lai/design.md
---

# Acceptance Contract: model-theo-vai-do-lai

## Context

Hàng `MH4` của lộ trình Kho tài liệu, mốc 30/10. Cổng Đáng ký `build` (manh, 2026-10-19T14:59:33Z, ghi ở
`opportunity.md`). Đo sau khi VK5 (`chu-may-sinh-ten-moi`, #503) đưa lời dặn Kara mới lên `onehub` e290fa498 — luật 22 của
đợt. Chủ kho chốt ở S1: ứng viên là `zai/glm-5.3-flash` thay `zai/glm-5.2-fast` (rẻ hơn khoảng 18 lần), vòng này dò thông
số cho model đó; số của GLM 5.2 Fast lấy từ bằng chứng đã có, không đo lại; Soạn OKR đo thêm GLM 5.3 Flash cạnh mốc
Gemini 3.8 Flash. Việc đo, không đổi model nào trong sản phẩm — đổi mặc định là MH2. Hạng T2: không tệp nào khớp
`risk_tiers.t3_paths`, hàng lộ trình không khai hạng.

## Criteria

- AC-1: Given hai biến thể Tác nhân (`flash` = `zai/glm-5.3-flash` suy luận mặc định; `flash-low` = cùng model với `reasoning: "low"` ở phiên con `agent_builder`), When chạy `eve eval agent-builder` xen kẽ theo vòng (`flash`, `flash-low`) tới đủ số lượt mỗi biến thể ghim trong `evidence/ke-hoach.json` theo Hỏi-5 (khuyên 5), mỗi lượt một kho đo riêng, ô model của kho đo được ghi rồi đọc lại ngay trước eval, Then bằng chứng có một dòng mỗi lượt ghi: biến thể, kết quả eval (qua hay hỏng, lý do), giờ bắt đầu và kết thúc, cờ `bi_cat` khi eval huỷ ở 180 giây, băm `subagents/agent_builder/agent.ts` lúc chạy, và của phiên con `agent_builder`: số bước, token vào, token ra, giây — tính lại được từ bản kết xuất `aiChiPhi` của chính lượt, và model Gateway trả cho phiên con `agent_builder` (`response.modelId` của bước model, hoặc bản ghi model phiên); And lượt có model Gateway trả khác `zai/glm-5.3-flash` hay không đọc được model đó bị ghi «sai model» và không vào kết luận; And đọc lại ô model lệch thì lượt dừng, không có dòng; And chỉ lượt `flash-low` mang băm bản sửa tạm; And không hai lượt chồng giờ, không hai lượt liền nhau cùng biến thể.
- AC-2: Given một câu cố định, When gọi thẳng AI Gateway với `zai/glm-5.3-flash` ở suy luận mặc định, `low` và `high`, Then bằng chứng ghi model Gateway trả và token suy luận của từng mức (hoặc ghi rõ Gateway không trả trường đó), và bộ so in «muc low toi nha cung cap» chỉ khi token suy luận của `low` nhỏ hơn mặc định.
- AC-3: Given bộ 50 câu `_acceptance/bo-cau-hoi-mau/bo-mau.json` và `maModel` của vai `hoi` sửa tạm thành `zai/glm-5.3-flash`, When chạy số lượt ghim trong `evidence/ke-hoach.json` theo Hỏi-5 (khuyên 1) của `bun _acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts --do` trên kho đo dùng-một-lần — mỗi lượt gồm hai vòng của thước: vòng một hỏi qua CRM 46 câu quy định của bộ, vòng hai hỏi qua Zalo cả 50 câu — Then mỗi lượt có bằng chứng chép bảng theo tầng và theo kiểu chữ, dòng «Tổng», danh sách mã không đạt (câu lỗi gọi model mang nhãn `loi`), mã thoát của script chấm, model Gateway trả cho phiên `kho` và phiên gốc, băm `bo-mau.json` và băm `tai-lieu-config.ts` bản sửa tạm; And sau lượt `tai-lieu-config.ts` trở về đúng băm đã commit.
- AC-4: Given lời dặn soạn trên cây đo có băm bằng `bam.loiDan` của `_acceptance/chu-may-sinh-ten-moi/evidence/eval-soan-sau.json` (mốc Gemini của VK5), và `MO_HINH` của `apps/agent-okr/agent/lib/config.ts` sửa tạm thành `zai/glm-5.3-flash`, When chạy số lượt ghim trong `evidence/ke-hoach.json` theo Hỏi-5 (khuyên 2) của eval soạn bằng thước của VK5, Then mỗi lượt có một bản tóm tắt cùng khuôn với `eval-soan-sau.json` (tong, dat, hong, duoiNguong, chotMaHong, judgeHong, judgeDuoiNguong, p50, p90, usd, moHinh, judge, băm lời dặn, băm thước, sha); And `moHinh` của tóm tắt là `zai/glm-5.3-flash` và model Gateway trả khớp; And băm lời dặn khác mốc thì lượt không vào so sánh và bảng ghi «lời dặn lệch mốc»; And lượt mà eval chạy xong nhưng không lưu đề xuất nào vẫn có tóm tắt cùng khuôn, mang `soDeXuat` = 0 và `khongNopDeXuat` = true, và được tính là lượt hỏng — trượt ngưỡng soạn dù số đạt bao nhiêu; And lượt 2 đã chạy hai lần không ra tóm tắt trước khi có luật này được xử theo Hỏi-8; And sau lượt `config.ts` trở về đúng băm đã commit.
- AC-5: Given các bằng chứng AC-1–AC-4 và bằng chứng mốc đã có (MH3 `_acceptance/tac-nhan-glm-5-3-cham/evidence/bang.md` 16/10, bộ 50 câu GLM 5.2 Fast `_acceptance/bo-cau-hoi-mau/evidence/cham-bo-do-mau.md` 13/10, eval soạn Gemini `_acceptance/chu-may-sinh-ten-moi/evidence/eval-soan-sau.json` 20/10), When `rang/so-do.ts` dựng `evidence/bang-kien-nghi.json` qua khuôn Zod và in `docs/model-theo-vai.md` từ nó, Then bảng có đúng năm hàng — Tác nhân, Trợ lý kho, Soạn OKR, Judge OKR, Máy soạn kho — mỗi hàng ghi model đang chạy, ứng viên, số đo của ứng viên và của mốc, chi phí mỗi lượt, kiến nghị, ngày đo, đường tệp bằng chứng của từng số; And mọi số tính lại được từ tệp bằng chứng nó trỏ; And kiến nghị theo ngưỡng ghim trong `rang/nguong.json` theo Hỏi-6, không chọn tay; And hàng có kiến nghị «giữ» in danh sách thông số chưa dò ở vòng này; And hàng Judge giữ `zai/glm-5.2-fast` kèm số «không chấm được» và «dưới ngưỡng» của judge; And hàng Máy soạn ghi «chưa có thước», kiến nghị «giữ»; And `docs/model-theo-vai.md` in lại từ json trùng từng byte.
- AC-6: Given trần chi cả vòng đo ghim trong `evidence/ke-hoach.json` theo Hỏi-5 (khuyên 6 USD), When cộng chi phí Gateway của mọi lượt AC-1–AC-4, Then tổng không vượt trần; And khi tổng chạm trần giữa chừng, lượt kế không chạy, các lượt chưa chạy được ghi «dừng vì trần», và kiến nghị của vai thiếu lượt là «chưa đủ số».
- AC-7: Given nhánh của hàng này, When so với điểm cắt từ `onehub`, Then không tệp nào ngoài `_acceptance/model-theo-vai-do-lai/`, `docs/model-theo-vai.md` và các dòng thêm vào `_acceptance/config.yaml` bị đổi; And mọi sửa tạm của AC-1, AC-3, AC-4 đã trả lại trước commit; And `git diff origin/onehub -- apps/agent-okr/agent/lib/config.ts apps/agent/agent/lib/okr/config.ts` rỗng trên nhánh (điều kiện của K1-8).

## Coverage

Không gian khép kín, liệt kê tay — dòng sổ `descope` «bỏ coverage-scan».

- Vai: Tác nhân (AC-1, AC-2) · Trợ lý kho (AC-3) · Soạn OKR (AC-4) · Judge OKR (AC-5, số đọc từ AC-4 và mốc) · Máy soạn kho
  (AC-5, hàng «chưa có thước»).
- Thông số của GLM 5.3 Flash: suy luận mặc định (AC-1, AC-3, AC-4) · `low` (AC-1) · đo token mỗi mức ở Gateway (AC-2).
- Mốc: bằng chứng đã có, ghi đường tệp và ngày (AC-5); không đo lại.
- Chi phí: từng lượt và tổng, trần (AC-6). Phạm vi tệp và sửa tạm đã trả lại (AC-7).

Ô bỏ, chờ Hỏi-5 (khuyên để hàng sau): `flash-low` cho Trợ lý kho và Soạn OKR · biến thể trần bước, trần thời gian
phiên con. Bảng in các thông số chưa dò ở mỗi hàng «giữ» (AC-5).

## Đường đo

- Số lượt Tác nhân qua dưới 180 giây mỗi biến thể · `evidence/tac-nhan.jsonl` + kết xuất `aiChiPhi`, đếm bằng `rang/so-do.ts` · AC-1, AC-5 bảo đảm.
- Token suy luận mỗi mức · `evidence/do-suy-luan.json` · AC-2 bảo đảm.
- Tầng đạt và câu lỗi của bộ 50 câu · `evidence/kho/` · AC-3, AC-5 bảo đảm.
- Đạt, hỏng, judge của eval soạn · `evidence/eval-soan-flash-<n>.json` · AC-4, AC-5 bảo đảm.
- Tổng chi · `evidence/chi-phi.json` · AC-6 bảo đảm.

## Out of scope

- Đổi model mặc định hay hằng model trong code chạy thật — hàng MH2 đọc bảng này.
- Đổi ứng viên judge (theo Hỏi-3, khuyên giữ): mọi số soạn OKR đã có đều chấm bằng judge `zai/glm-5.2-fast`; đổi
  judge làm mất mốc.
- Dựng thước cho máy soạn kho (theo Hỏi-4, khuyên để hàng riêng).
- Biến thể trần bước, trần thời gian phiên con; `flash-low` cho Trợ lý kho và Soạn OKR (theo Hỏi-5).
- Trợ lý OKR trong `apps/agent` (`tro_ly_okr`, `TRO_LY_OKR_MO_HINH`) — thước soạn của VK5 đo `apps/agent-okr`.
- Agent gốc Zalo đi lạc (Known limits của l7).

## Notes

- Gọi model thật qua AI Gateway, dưới khoá s4: 10 lượt Tác nhân, 3 lời gọi dò, 1 lượt bộ 50 câu, 2 lượt eval soạn. Mọi
  lượt chạy trên kho đo dùng-một-lần `crm_<cây>_do`, không chạm kho chung `crm`.
- Sửa tạm trong lúc đo (không commit, băm ghi vào bằng chứng): `subagents/agent_builder/agent.ts` (lượt `flash-low`),
  `apps/agent/agent/lib/tai-lieu-config.ts` (`hoi.maModel`), `apps/agent-okr/agent/lib/config.ts` (`MO_HINH`). Xin chạm
  tệp K1-8: giám sát đợt duyệt 20/10, điều kiện hai tệp khai model OKR không lệch `origin/onehub` khi trình Cổng
  Bằng chứng (AC-7). Mốc Gemini lấy từ `_acceptance/chu-may-sinh-ten-moi/evidence/eval-soan-sau.json` của VK5.
- Ngưỡng kiến nghị chờ Hỏi-6, ghim vào `rang/nguong.json` theo câu trả lời trước S3. Khuyên:
  - Tác nhân: ít nhất 4/5 lượt qua dưới 180 giây; nhiều biến thể đạt thì biến thể nhiều lượt qua hơn, bằng nhau thì
    trung vị giây thấp hơn. Không biến thể nào đạt → «giữ `zai/glm-5.2-fast`».
  - Trợ lý kho: mỗi tầng đúng không kém lượt mốc 13/10 quá 1 câu, câu lỗi gọi model không quá 2 → `zai/glm-5.3-flash`;
    không → «giữ».
  - Soạn OKR: mọi lượt đạt ít nhất 13/18 (bằng mốc), hỏng không quá 3 và có nộp đề xuất → `zai/glm-5.3-flash`;
    không → «giữ `google/gemini-3.8-flash`». Lượt `khongNopDeXuat` là trượt (chủ kho chốt 20/10 sau lượt 2).
  - Judge OKR: theo Hỏi-3 (khuyên «giữ `zai/glm-5.2-fast`»). Máy soạn kho: theo Hỏi-4 (khuyên «giữ», «chưa có thước»).
- Cỡ mẫu, biến thể và trần chi chờ Hỏi-5, ghim vào `evidence/ke-hoach.json` trước lượt đo đầu; mọi eval đọc số từ đó.
- Lượt soạn 2 (20/10) chạy hai lần, 54 và 93 phút: eve báo 12/18 rồi 8/18 đạt, GLM 5.3 Flash trả rỗng hoặc lỗi hàng chục
  lần, không đề xuất nào được lưu, thước VK5 thoát 2 không ghi tóm tắt (`evidence/soan-luot-2.md`). Thước MH4 nay ghi tóm
  tắt cho lượt như vậy.
- Mốc Gemini của VK5 dao động giữa hai lượt trên lời dặn cũ (15/18 và 13/18); vì vậy Hỏi-5 khuyên hai lượt soạn.
