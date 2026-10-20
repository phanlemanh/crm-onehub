---
schema_version: 1
feature: Đo zai/glm-5.3-flash, deepseek/deepseek-v4.1-flash-1017 và (riêng Trợ lý kho) google/gemini-3.8-flash cho Tác nhân, Trợ lý kho và Soạn OKR bằng thước đã có, rồi dựng bảng kiến nghị model theo vai trỏ từng lượt đo
slug: model-theo-vai-do-lai
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [agent]
status: draft
approved_by:
approved_at:
design_doc: _acceptance/model-theo-vai-do-lai/design.md
---


# Acceptance Contract: model-theo-vai-do-lai

## Context

Hàng `MH4` của lộ trình Kho tài liệu, mốc 30/10. Cổng Đáng ký `build` (manh, 2026-10-19T14:59:33Z, ghi ở
`opportunity.md`). Đo sau khi VK5 (`chu-may-sinh-ten-moi`, #503) đưa lời dặn Kara mới lên `onehub` e290fa498 — luật 22 của
đợt. Vòng đầu (Cổng Phạm vi ký lại 20/10, S3 xong 49456c140) đo `zai/glm-5.3-flash` cho ba vai. Ngày 21/10, trước khi S4
ký, chủ kho mở rộng vòng: «Tôi muốn bổ sung một model giá rẻ hiệu năng cao là "deepseek v4 1 flash 1017" thực hiện đo đầy
đủ với các vai cho model này, và đo gemini cho Trợ lý kho. Sau đó lập bảng kiến nghị cuối cùng cho tôi.» Vì vậy hợp đồng
mở lại: thêm `deepseek/deepseek-v4.1-flash-1017` (0,075/0,30 USD mỗi triệu token vào/ra, có tool-use, ZDR qua Gateway) cho
Tác nhân, Trợ lý kho, Soạn OKR, và `google/gemini-3.8-flash` cho Trợ lý kho; số GLM 5.3 Flash đã đo giữ nguyên. Việc đo,
không đổi model nào trong sản phẩm — đổi mặc định là MH2. Hạng T2: không tệp nào khớp `risk_tiers.t3_paths`.

Danh sách ứng viên, biến thể, cỡ mẫu, thứ tự và trần chi ghim trong `evidence/ke-hoach.json` (Hỏi-11); ngưỡng và luật
chọn ghim trong `rang/nguong.json` (Hỏi-10). Giá niêm yết ngoài giờ cao điểm của mỗi ứng viên chụp từ danh mục Gateway
(`/v1/models`) và ghim trong `ke-hoach.json`. Khoá ứng viên: `glm` = `zai/glm-5.3-flash`, `ds` =
`deepseek/deepseek-v4.1-flash-1017`, `gem` = `google/gemini-3.8-flash`.

## Criteria

- AC-1: Given các biến thể Tác nhân ghim trong `evidence/ke-hoach.json` — `flash`, `flash-low` của `glm` (đã đo 20/10) và `ds`, `ds-low` của `ds` (suy luận mặc định; `reasoning: "low"` ở phiên con `agent_builder`) — When chạy `eve eval agent-builder` xen kẽ giữa các biến thể của cùng một ứng viên tới đủ số lượt mỗi biến thể ghim trong `ke-hoach.json`, mỗi lượt một kho đo riêng, ô model của kho đo được ghi rồi đọc lại ngay trước eval, Then bằng chứng có một dòng mỗi lượt ghi: ứng viên, biến thể, kết quả eval (qua hay hỏng, lý do), giờ bắt đầu và kết thúc, cờ `bi_cat` khi eval huỷ ở 180 giây, băm `subagents/agent_builder/agent.ts` lúc chạy, và của phiên con `agent_builder`: số bước, token vào, token ra, giây — tính lại được từ bản kết xuất `aiChiPhi` của chính lượt, và model Gateway trả cho phiên con `agent_builder`; And lượt có model Gateway trả khác model của ứng viên (kể cả khi `modelTheoVai` lùi về mặc định) hay không đọc được model đó bị ghi «sai model» và không vào kết luận; And đọc lại ô model lệch thì lượt dừng, không có dòng; And chỉ lượt biến thể `-low` mang băm bản sửa tạm; And không hai lượt chồng giờ, không hai lượt liền nhau cùng biến thể của cùng ứng viên; And dòng và tệp bằng chứng của `flash`, `flash-low` giữ nguyên từng byte so với 49456c140.
- AC-2: Given một câu cố định và mỗi ứng viên Tác nhân trong `ke-hoach.json`, When gọi thẳng AI Gateway với model của ứng viên ở suy luận mặc định, `low` và `high`, Then bằng chứng dò của ứng viên ghi model Gateway trả và token suy luận của từng mức (hoặc ghi rõ Gateway không trả trường đó), và bộ so in «muc low toi nha cung cap <ứng viên>» chỉ khi token suy luận của `low` nhỏ hơn mặc định; And tệp dò của `glm` giữ nguyên từng byte.
- AC-3: Given bộ 50 câu `_acceptance/bo-cau-hoi-mau/bo-mau.json`, mỗi ứng viên Trợ lý kho trong `ke-hoach.json` (`glm` đã đo, `ds`, `gem`), và `maModel` của vai `hoi` sửa tạm thành model của ứng viên với ZDR giữ bật như code chạy thật, When chạy số lượt ghim trong `ke-hoach.json` của `bun _acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts --do` trên kho đo dùng-một-lần — mỗi lượt gồm hai vòng của thước: vòng một hỏi qua CRM 46 câu quy định của bộ, vòng hai hỏi qua Zalo cả 50 câu — Then mỗi lượt có bằng chứng dưới thư mục của ứng viên chép bảng theo tầng và theo kiểu chữ, dòng «Tổng», danh sách mã không đạt (câu lỗi gọi model mang nhãn `loi`), mã thoát của script chấm, model Gateway trả cho phiên `kho` và phiên gốc, băm `bo-mau.json` và băm `tai-lieu-config.ts` bản sửa tạm, bản kết xuất `aiChiPhi` của kho đo (mỗi bước: tính năng, token vào, đọc cache, ra, `costUsd`) và số dư Gateway trước, sau lượt kèm giờ; And model Gateway trả cho phiên `kho` bằng model của ứng viên; And lượt mà Gateway từ chối vì không có nhà cung cấp ZDR được ghi «không có ZDR» và tính là lượt hỏng; And sau lượt `tai-lieu-config.ts` trở về đúng băm đã commit; And bằng chứng `kho/luot-1` của `glm` giữ nguyên từng byte.
- AC-4: Given lời dặn soạn trên cây đo có băm bằng `bam.loiDan` của `_acceptance/chu-may-sinh-ten-moi/evidence/eval-soan-sau.json` (mốc Gemini của VK5), mỗi ứng viên Soạn OKR trong `ke-hoach.json` (`glm` đã đo, `ds`), và `MO_HINH` của `apps/agent-okr/agent/lib/config.ts` sửa tạm thành model của ứng viên, When chạy số lượt ghim trong `ke-hoach.json` của eval soạn bằng thước của VK5, Then mỗi lượt có một bản tóm tắt cùng khuôn với `eval-soan-sau.json` (tong, dat, hong, duoiNguong, chotMaHong, judgeHong, judgeDuoiNguong, p50, p90, usd, moHinh, judge, băm lời dặn, băm thước, sha) và bản kết xuất `aiChiPhi` của kho đo cho các bước soạn; And `moHinh` của tóm tắt là model của ứng viên và model Gateway trả khớp; And băm lời dặn khác mốc thì lượt không vào so sánh và bảng ghi «lời dặn lệch mốc»; And lượt mà eval chạy xong nhưng không lưu đề xuất nào vẫn có tóm tắt cùng khuôn, mang `soDeXuat` = 0 và `khongNopDeXuat` = true, và được tính là lượt hỏng — trượt ngưỡng soạn dù số đạt bao nhiêu; And sau lượt `config.ts` trở về đúng băm đã commit; And tóm tắt `eval-soan-flash-<n>.json` của `glm` giữ nguyên từng byte.
- AC-5: Given các bằng chứng AC-1–AC-4 và bằng chứng mốc đã có (MH3 `_acceptance/tac-nhan-glm-5-3-cham/evidence/bang.md` 16/10, bộ 50 câu GLM 5.2 Fast `_acceptance/bo-cau-hoi-mau/evidence/cham-bo-do-mau.md` 13/10, eval soạn Gemini `_acceptance/chu-may-sinh-ten-moi/evidence/eval-soan-sau.json` 20/10), When `rang/so-do.ts` dựng `evidence/bang-kien-nghi.json` qua khuôn Zod và in `docs/model-theo-vai.md` từ nó, Then bảng có đúng năm hàng — Tác nhân, Trợ lý kho, Soạn OKR, Judge OKR, Máy soạn kho — mỗi hàng ghi model đang chạy, số đo của mốc, và cho MỖI ứng viên đã đo của vai: số đo, chi phí phần ứng viên trung bình mỗi lượt và chi phí thật mỗi lượt, trạng thái (đạt · không đạt · chưa đủ số), ngày đo, đường tệp bằng chứng của từng số; And mỗi hàng có đúng một kiến nghị; And mọi số tính lại được từ tệp bằng chứng nó trỏ; And chi phí phần ứng viên = token vào, đọc cache và ra của các bước do model ứng viên chạy (theo tính năng của vai trong `aiChiPhi`; không gồm judge, không gồm phiên gốc chạy model khác) × giá niêm yết ghim trong `ke-hoach.json`; And ứng viên có lượt bị loại (sai model, lời dặn lệch mốc, dừng vì trần) mang «chưa đủ số» và không vào luật chọn; And ứng viên còn lại đạt hay không theo luật vai trong `rang/nguong.json`, và kiến nghị theo luật chọn của Hỏi-10 ghim trong cùng tệp, không chọn tay; And hàng có kiến nghị «giữ» in danh sách thông số chưa dò; And hàng Judge giữ `zai/glm-5.2-fast` kèm số «không chấm được» và «dưới ngưỡng» của judge; And hàng Máy soạn ghi «chưa có thước», kiến nghị «giữ»; And `docs/model-theo-vai.md` in lại từ json trùng từng byte.
- AC-6: Given trần chi cả vòng và thứ tự lượt ghim trong `evidence/ke-hoach.json` theo Hỏi-11, When cộng chi phí Gateway của mọi lượt AC-1–AC-4 (cả lượt đã chi ở vòng đầu), Then tổng không vượt trần; And khi tổng chạm trần giữa chừng, lượt kế không chạy, các lượt chưa chạy được ghi «dừng vì trần», và ứng viên thiếu lượt của vai ấy mang «chưa đủ số», không vào luật chọn; And chi phí thật của lượt kho lấy từ `aiChiPhi` của kho đo khi các bước có `costUsd`, chênh số dư Gateway chỉ là số đối chiếu; And dòng chi phí của các lượt `glm` vòng đầu giữ giá trị ở 49456c140.
- AC-7: Given nhánh của hàng này, When so với điểm cắt từ `onehub`, Then không tệp nào ngoài `_acceptance/model-theo-vai-do-lai/`, `docs/model-theo-vai.md` và các dòng thêm vào `_acceptance/config.yaml` bị đổi; And mọi sửa tạm của AC-1, AC-3, AC-4 đã trả lại trước commit; And `git diff origin/onehub -- apps/agent-okr/agent/lib/config.ts apps/agent/agent/lib/okr/config.ts` rỗng trên nhánh (điều kiện của K1-8).

## Coverage

Không gian khép kín, liệt kê tay — dòng sổ `descope` «bỏ coverage-scan».

- Vai × ứng viên: Tác nhân {`glm` đã đo, `ds`} (AC-1, AC-2) · Trợ lý kho {`glm` đã đo, `ds`, `gem`} (AC-3) · Soạn OKR
  {`glm` đã đo, `ds`} (AC-4) · Judge OKR (AC-5, số đọc từ AC-4 và mốc) · Máy soạn kho (AC-5, hàng «chưa có thước»).
- Thông số: suy luận mặc định (AC-1, AC-3, AC-4) · `low` ở Tác nhân (AC-1) · token mỗi mức ở Gateway (AC-2). Mức suy luận
  ở kho và soạn theo Hỏi-9.
- Chọn giữa ứng viên: ngưỡng từng vai rồi luật chọn khi nhiều ứng viên đạt (AC-5, Hỏi-10).
- Mốc: bằng chứng đã có, ghi đường tệp và ngày (AC-5); không đo lại. Bằng chứng `glm` vòng đầu giữ nguyên (AC-1–AC-4).
- Chi phí: phần ứng viên cho luật chọn (AC-5), chi phí thật từng lượt và tổng, trần (AC-6). Phạm vi tệp và sửa tạm đã trả lại (AC-7).

Ô bỏ (Hỏi-11): `flash-low`/`ds-low` cho Trợ lý kho và Soạn OKR · biến thể trần bước, trần thời gian phiên con · Gemini cho
Tác nhân. Bảng in các thông số chưa dò ở mỗi hàng «giữ» (AC-5).

## Đường đo

- Số lượt Tác nhân qua dưới 180 giây mỗi biến thể · `evidence/tac-nhan.jsonl` + kết xuất `aiChiPhi`, đếm bằng `rang/so-do.ts` · AC-1, AC-5 bảo đảm.
- Token suy luận mỗi mức mỗi ứng viên · tệp dò của ứng viên dưới `evidence/` · AC-2 bảo đảm.
- Tầng đạt và câu lỗi của bộ 50 câu mỗi ứng viên · `evidence/kho/` · AC-3, AC-5 bảo đảm.
- Đạt, hỏng, judge của eval soạn mỗi ứng viên · `evidence/eval-soan-<biến thể>-<n>.json` · AC-4, AC-5 bảo đảm.
- Chi phí phần ứng viên · kết xuất `aiChiPhi` của từng lượt × giá ghim trong `ke-hoach.json` · AC-5 bảo đảm.
- Tổng chi thật · `evidence/chi-phi.json` · AC-6 bảo đảm.

## Out of scope

- Đổi model mặc định hay hằng model trong code chạy thật — hàng MH2 đọc bảng này.
- Đổi ứng viên judge (theo Hỏi-3, khuyên giữ): mọi số soạn OKR đã có đều chấm bằng judge `zai/glm-5.2-fast`; đổi
  judge làm mất mốc. DeepSeek ở vai Judge OKR và Máy soạn kho theo Hỏi-12 (khuyên để ngoài vòng).
- Đo lại `zai/glm-5.3-flash` hay `zai/glm-5.2-fast`: số đã có giữ nguyên.
- Dựng thước cho máy soạn kho (theo Hỏi-4, khuyên để hàng riêng).
- Biến thể trần bước, trần thời gian phiên con; biến thể `-low` cho Trợ lý kho và Soạn OKR; Gemini cho Tác nhân (theo Hỏi-11).
- Trợ lý OKR trong `apps/agent` (`tro_ly_okr`, `TRO_LY_OKR_MO_HINH`) — thước soạn của VK5 đo `apps/agent-okr`.
- Agent gốc Zalo đi lạc (Known limits của l7).

## Notes

- Gọi model thật qua AI Gateway, dưới khoá s4. Đã chạy ở vòng đầu: 10 lượt Tác nhân `glm`, 3 lời dò, 1 lượt kho, 2 lượt
  soạn (khoảng 3,1 USD). Phần thêm theo Hỏi-11 (khuyên): 10 lượt Tác nhân `ds`, 3 lời dò `ds`, 2 lượt soạn `ds`, 1 lượt kho
  `ds`, 1 lượt kho `gem`. Mọi lượt chạy trên kho đo dùng-một-lần `crm_<cây>_do`, không chạm kho chung `crm`.
- Sửa tạm trong lúc đo (không commit, băm ghi vào bằng chứng): `subagents/agent_builder/agent.ts` (lượt `-low`),
  `apps/agent/agent/lib/tai-lieu-config.ts` (`hoi.maModel`), `apps/agent-okr/agent/lib/config.ts` (`MO_HINH`). Xin chạm
  tệp K1-8: giám sát đợt duyệt 20/10, điều kiện hai tệp khai model OKR không lệch `origin/onehub` khi trình Cổng
  Bằng chứng (AC-7).
- Tác nhân đổi model bằng ô Cài đặt; `modelTheoVai` lùi về mặc định khi model không có trong danh mục Gateway gắn tag
  `tool-use` (`apps/agent/agent/lib/model.ts`). Danh mục 21/10 có `deepseek/deepseek-v4.1-flash-1017` với tag ấy; AC-1 bắt
  trường hợp lùi qua model Gateway trả.
- Trợ lý kho và Soạn OKR bật ZDR cứng. Phiên K1 cũ thử `generateText` với `zeroDataRetention: true` cho DeepSeek ngày
  21/10: model trả đúng, nhà cung cấp fireworks. Gemini kho đã chạy với ZDR ngày 16/10 (`_acceptance/zalo-tro-ly-kho-chi-dan`).
- Soạn OKR ép `thinkingLevel: low` chỉ qua khoá `google`/`vertex`; DeepSeek ở soạn và cả ba ứng viên ở kho chạy suy luận
  mặc định trừ khi Hỏi-9 chọn khác. Trần ra của soạn là 3.000 token mỗi lời gọi, của kho 8k mỗi phiên.
- Ngưỡng từng vai giữ như Hỏi-6 đã duyệt 20/10 (`rang/nguong.json`): Tác nhân ≥ 4/5 lượt qua dưới 180 giây; Trợ lý kho mỗi
  tầng không kém mốc 13/10 quá 1 câu, câu lỗi ≤ 2; Soạn OKR mọi lượt ≥ 13/18, hỏng ≤ 3, có nộp đề xuất. Luật chọn khi nhiều
  ứng viên đạt chờ Hỏi-10 (khuyên: rẻ nhất theo chi phí phần ứng viên — token × giá niêm yết — rồi điểm, rồi trung vị giây).
- DeepSeek có giá giờ cao điểm gấp đôi (thứ Hai–Sáu 01:00–04:00 và 06:00–10:00 UTC). Luật chọn dùng giá niêm yết nên giờ chạy
  không đổi kết luận; lượt rơi vào giờ cao điểm chỉ tốn thêm tiền thật, tính vào trần.
- Lượt soạn 2 của `glm` (20/10) chạy lại một lần bằng thước đã sửa theo Hỏi-8; GLM 5.3 Flash không nộp đề xuất, lượt hỏng.
- Mốc Gemini của VK5 dao động giữa hai lượt trên lời dặn cũ (15/18 và 13/18); vì vậy mỗi ứng viên soạn chạy hai lượt.
