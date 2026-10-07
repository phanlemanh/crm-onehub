---
schema_version: 1
feature: Trợ lý OKR thôi trả rỗng — phiên con bỏ khuôn kết quả nên eve không thêm final_output; tool nộp tự đóng việc, hook phiên gốc chỉ còn là lưới
slug: tro-ly-okr-bo-final-output
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [agent, docs]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-07T00:18:00Z
design_doc: docs/superpowers/specs/2026-10-07-tro-ly-okr-bo-final-output-design.md
---

# Acceptance Contract: tro-ly-okr-bo-final-output

## Context

E22 của `tro-ly-okr-de-xuat` đỏ ở làn ghim lại 06/10 vì một ca góp ý đóng
`hong:SUBAGENT_EXECUTION_FAILED`. Chẩn đoán 07/10: Gemini 3.8 Flash nghĩ hết trần 2.000 token rồi
trả rỗng ở 15–19% lời gọi đầu của phiên con, từ 27/09. Gốc là tool `final_output` eve tự thêm vì
phiên con khai khuôn kết quả, đá với chỉ dẫn «câu trả lời đầu là `nop_de_xuat`» (đầu vào khó: chỉ
`nop_de_xuat` 0/22 hết trần, có `final_output` 5/8). Vòng này bỏ khuôn kết quả của phiên con, để
tool nộp tự đóng việc, và hạ hook phiên gốc thành lưới.

Source input: chủ kho 07/10 trong phiên chẩn đoán (chọn hướng «bỏ final_output», duyệt thiết kế
trong chat); thiết kế `docs/superpowers/specs/2026-10-07-tro-ly-okr-bo-final-output-design.md`.

## Criteria

- AC-1: Given phiên con `tro_ly_okr`, When đọc định nghĩa của nó, Then nó không khai `outputSchema`; And When đọc chỉ dẫn góp ý và chỉ dẫn tóm tắt tuần, Then không câu nào đòi kết bằng một khuôn `{"trangThai":…}` hay gọi `final_output` — nộp xong thì trả lời `done`; And khi thiếu khối dữ liệu, chỉ dẫn bảo không gọi tool nào và trả lời `done`, để việc đóng `hong:khong-nop` thay vì một lần nộp rỗng được đọc là «không có gì cần sửa».
- AC-2: Given một việc góp ý đang chạy và ma trận viết trước {ghi được có dòng, ghi được 0 dòng, Mục tiêu đã xoá, payload hỏng, việc đã đóng, đã nộp một lần, việc là tóm tắt tuần}, When `nop_de_xuat` chạy ở từng ô, Then việc đóng ngay trong tool với đúng {`da-nop`, `da-nop`, `khong-lam-duoc:thieu-du-lieu`, `khong-lam-duoc:khuon-hong`, giữ kết cục cũ, giữ kết cục cũ, không đóng}, và tool vẫn trả đúng `ketQua` như hôm nay. (cross-layer)
- AC-3: Given một việc tóm tắt tuần đang chạy và ma trận viết trước {ghi được có bản, ghi được nhưng không bản nào còn lại, phòng đã lưu trữ, payload hỏng, đã có bản, việc đã đóng `hong:het-lease` từ trước, việc là góp ý}, When `nop_tom_tat` chạy ở từng ô, Then việc đóng ngay trong tool với đúng {`da-nop`, `da-nop` (bản ghi giữ các câu bị bỏ, không câu nào hiện), `khong-lam-duoc:thieu-du-lieu`, `khong-lam-duoc:khuon-hong`, giữ kết cục cũ, giữ `hong:het-lease` và không ghi bản nào, không đóng}. (cross-layer)
- AC-4: Given phiên gốc của một việc OKR nhận kết quả của `tro_ly_okr` và ma trận viết trước {việc đã đóng bởi tool + kết quả không lỗi, việc đã đóng bởi tool + kết quả lỗi, việc còn mở + kết quả lỗi mã X, việc còn mở + kết quả không lỗi, kết quả của subagent khác}, When hook ủy quyền OKR xử lý, Then kết cục là {giữ của tool, giữ của tool, `hong:X`, `hong:khong-nop`, không đụng}. (cross-layer)
- AC-5: Given model thật có ZDR và bộ ca góp ý của E22 (`tro-ly-okr-de-xuat`), When chạy E22 và đọc trace của đúng cửa sổ lượt đó, Then có ít nhất 18 lời gọi đầu của `tro_ly_okr`, 0 lời gọi tool `final_output`, 0 lời gọi `tro_ly_okr` mang `outputSchema`; số lời gọi dừng vì hết trần, số dòng «empty model response» và mã thoát của E22 được in ra để đối chiếu, không chặn (xem Known limits). (cross-layer)
- AC-6: Given model thật có ZDR và bộ ca tóm tắt tuần của E17 (`tro-ly-okr-tom-tat`), When chạy E17 ngay sau E22 và đọc trace của đúng cửa sổ lượt đó, Then có ít nhất một lời gọi đầu của `tro_ly_okr`, 0 lời gọi `final_output`, 0 lời gọi `tro_ly_okr` mang `outputSchema`; số lời gọi hết trần và mã thoát của E17 được in ra, không chặn. (cross-layer)
- AC-8: Given `docs/agent.md` mục «Chỗ rẽ: Trợ lý OKR (lượt 9a)», When đọc đoạn về Gemini trả rỗng, Then đoạn nói đúng gốc (tool `final_output` do khuôn kết quả đá với lệnh nộp), số đo 07/10, và không còn khẳng định câu «Act at once» đưa lỗi về 0. (judgment)

## Coverage

Trục (quét bằng morphological-scan, preset tự dựng):

- Loại việc: góp ý · tóm tắt tuần [SUY-TỪ-REPO: packages/db/src/agent-tasks.ts]
- Kết cục của tool: ghi có dòng · ghi rỗng · thiếu dữ liệu · payload hỏng · từ chối vì đã đóng/đã nộp · sai loại việc [SUY-TỪ-REPO: apps/agent/agent/lib/okr/nop-de-xuat.ts, apps/agent/agent/lib/okr/nop-tom-tat.ts]
- Phiên con kết thúc: xong sạch · hỏng sau khi nộp · hỏng trước khi nộp · không gọi tool [SUY-TỪ-REPO: apps/agent/node_modules/eve/dist/src/harness/tool-loop.js]
- Đường chạy: dispatch thật · eve eval · chế độ ẩn [SUY-TỪ-REPO: docs/agent.md]

Thước CE: hai hàm nộp có đúng các nhánh trên (đọc mã); eve chỉ có ba kết cục của phiên con
(chữ, lỗi, khuôn). Chân ngành: [GIẢ ĐỊNH: chưa có chuẩn ngành đúng loại] — đây là sửa nội bộ một
khung tác tử; đối chiếu cận kề là tài liệu eve 0.29.4 `docs/subagents.mdx` (một tool kết thúc,
khuôn ra là tùy chọn).

Core → AC-2 (ô góp ý), AC-3 (ô tóm tắt), AC-4 (điểm hỏng), AC-5/AC-6 (đường eval). Chế độ ẩn
không thành AC riêng: cùng đường mã với dispatch thật (Never — cùng đường).

## Out of scope

- Không đổi model, trần ra mỗi lời gọi, `thinkingLevel` hay lease.
- Không thêm thử lại ở dispatch hay cho phiên gốc gọi `tro_ly_okr` lần hai (đề xuất trước đó, bị thay bởi vòng này).
- Không đụng Soạn OKR (`apps/agent-okr`) và lớp giữa ZDR dùng chung `@crm/ai-okr`.
- Không đổi màn chờ của khối góp ý.

## Notes

- Mã đóng việc giữ đúng chuỗi hôm nay; `ketQuaTroLy` vẫn là nguồn của giá trị `da-nop` cho màn góp ý.
- AC-5, AC-6 đo bằng MỘT lệnh tuần tự (E22 → E17) để cửa sổ trace không chồng nhau và máy không chạy hai eval model cùng lúc.
- AC-5, AC-6 gọi model thật qua khoá Gateway, có trần chi trong lệnh (E22 `TDX_TRAN_USD` mặc định 2, E17 `--tran-usd 1`).
- Thu phạm vi 07/10 sau S4 round 1 (chủ kho đồng ý trong phiên): AC-7 (độ trễ) bỏ khỏi hợp đồng; AC-5, AC-6 thôi chặn ở «0 lời gọi hết trần».

## Known limits

- Gemini 3.8 Flash ở `thinkingLevel: low` vẫn có đuôi lời gọi nghĩ hết trần khi chỉ còn một tool nộp: round 1 đo 11/114 lời gọi đầu của `tro_ly_okr` dừng `length` (trước vòng này 17/88), E22 còn 3 + 2 dòng «empty model response» (trước 9 + 5) và một ca hỏng vì lời nộp bị cắt giữa chừng khi hết trần. `minimal` bị Vertex từ chối, `thinkingBudget` bị bỏ qua — không chặn được độ dài suy nghĩ trong model này.
- Độ trễ E24 round 1: p50 6 928 ms, p90 20 702 ms (ngưỡng 15 000), 0 lượt hỏng — đuôi do các lần nghĩ dài, không đổi so với 06/10 (p90 17,8 s và 21,2 s).
- Việc tóm tắt tuần (trần 8 000) có lần nghĩ 7 687 token trong 49 s rồi hết trần.
- Sửa đuôi suy nghĩ (đổi model có ZDR, hay nâng trần cùng lease) là một vòng riêng.

