---
schema_version: 1
feature: Hạ trần tháng của Hỏi CRM qua Zalo từ 1.500 xuống 300 câu mỗi tháng của cả xưởng, giữ trần phút và trần ngày
slug: ha-tran-thang-hoi-zalo
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, docs]
status: signed-off
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-26T23:47:31Z
design_doc: docs/superpowers/specs/2026-09-27-ha-tran-thang-hoi-zalo-design.md
---

# Acceptance Contract: ha-tran-thang-hoi-zalo

## Context

Hỏi CRM qua Zalo (vòng `hoi-crm-qua-zalo`, PR #158) cho cả xưởng 1.500 câu mỗi tháng. N0 đo
giá một câu trên đúng đường đó: $0,016 với Gemini 3.7 Flash, $0,039 với GLM 5.2 Fast — tức
1.500 câu tốn $23,5–57,9, vượt $20 của cả team. Chủ kho chốt 27/09: hạ trần tháng xuống 300
câu; trần 3 câu/phút và 20 câu/người/ngày giữ nguyên.

Source input: prompt (chủ kho, 27/09) · `~/dev/nghien-cuu-crm/2026-09-26-ai-okr/N0-ket-qua.md` mục 7

## Criteria

- AC-1: Given cấu hình Zalo của tác tử, When đọc ba trần hỏi, Then trần phút là 3, trần ngày là 20 và trần tháng là 300 — so với số viết tay trong test, không suy từ chính hằng.
- AC-2: Given trong tháng hiện tại (giờ Việt Nam) cả xưởng đã có 299 câu đã mở phiên của ít nhất hai người, When người A (vai kinh doanh, chưa chạm trần phút hay ngày) nhắn câu thứ 300 rồi câu thứ 301, Then câu 300 mở phiên, còn câu 301 không mở phiên, để lại hàng `tu-choi-tran-thang` và nhận nguyên văn câu hết lượt tháng.
- AC-3: Given xưởng đã đủ 300 câu trong tháng 10 (giờ Việt Nam), When A nhắn lúc 23:59 ngày 31/10 giờ Việt Nam và lúc 00:01 ngày 01/11 giờ Việt Nam, Then câu 23:59 bị từ chối theo trần tháng và câu 00:01 mở phiên.
- AC-4: Given xưởng có 299 câu đã mở phiên trong tháng cùng các hàng `tu-choi-tran-ngay`, `tu-choi-tran-phut`, `loi` và `dang-ban`, When A nhắn một câu, Then câu đó mở phiên — hàng không mở phiên không tính vào trần tháng.
- AC-5: Given tài liệu của kho, When đọc mục Zalo của `docs/agent.md` và bảng theo dõi `docs/plan/lo-trinh-zalo.md`, Then mục Zalo ghi «300 câu mỗi tháng» và không còn con số 1.500 dưới bất kỳ cách viết nào («1.500», «1500»); bảng theo dõi có dòng `4c` của vòng này ghi quyết định 27/09 hạ 1.500 xuống 300 kèm căn cứ N0; và cùng phép kiểm đó chạy trên `docs/agent.md` của commit gốc `ad7c8ed0` thì phải hỏng (đối chứng từ bản thật).
- AC-6: Given hồ sơ đã ký `hoi-crm-qua-zalo`, When so cây này với `origin/onehub` và chạy kiểm trước-gộp với `--base origin/onehub`, Then không tệp nào dưới `_acceptance/hoi-crm-qua-zalo/` và không tệp `apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts` bị đổi, kiểm trước-gộp không in VIOLATION nào của hồ sơ khác ngoài chính hồ sơ này, và các ca trần (a)–(d) của hồ sơ đã ký (`hcz_tran`, suy số từ hằng) vẫn xanh với trần 300.

## Coverage

- Bỏ coverage-scan — không gian AC một chiều: một hằng đổi giá trị, luật đếm và câu báo giữ nguyên (entry d-20260926T234226Z-1). Sáu AC phủ: giá trị, ranh 300/301, ranh tháng giờ VN, luật không đếm hàng không mở phiên, tài liệu, hồ sơ đã ký không bị chạm.

## Out of scope

- Đổi trần sang tiền (đô la) thay cho số câu — cần sổ chi phí AI của lượt 9a OKR (entry d-20260926T234226Z-3).
- Báo quản trị khi xưởng chạm trần tháng — đi cùng báo 80%/100% ngân sách ở 9a (entry d-20260926T234226Z-3).
- Đổi chữ câu hết lượt tháng: câu hiện tại không mang con số.
- Sửa hồ sơ đã ký `_acceptance/hoi-crm-qua-zalo/` (AC-5 của nó còn ghi 1.500; hồ sơ này thay con số).
- Đổi model hay mức suy nghĩ của trợ lý Zalo.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Quyết định của chủ kho, 27/09/2026, sau khi đọc số đo N0: «đồng ý, hạ xuống 300 câu/tháng».
- Mọi ca hành vi (AC-2 tới AC-4) đi qua `hoiTacTu` — đường thật — với giờ hiện tại truyền vào cố định trong tháng 10/2026; hàng do chính đường đó ghi mang giờ đó, nên đếm và ghi cùng một đồng hồ.
- Thước tài liệu của hồ sơ đã ký (`hcz_tai_lieu`) không dùng làm bằng chứng ở đây: nó so với `merge-base`, nên đỏ trên mọi nhánh sau khi chính hồ sơ đó đã gộp (đo 27/09, trước khi sửa gì).
- Ở 300 câu, chi phí ước tính $4,7/tháng với Gemini, $11,6/tháng với GLM. Model production chưa biết cho tới khi chủ kho chạy `N0-truy-van-production.sql`.
- Known limits (Cổng Bằng chứng 27/09, Manh Phan):
  - Ngoài-1: thước không-chạm-hồ-sơ-đã-ký (E7) so với đầu `origin/onehub` chứ không so với chỗ tách nhánh, nên có thể đỏ giả khi nhánh chính ghim lại hồ sơ `hoi-crm-qua-zalo`.
  - Ngoài-2: phần trước-gộp của E7 báo «ok» khi `pre-merge-check.sh` thoát lỗi nội tại (mã 2, 127) mà không in dòng VIOLATION.
  - Ngoài-3: cùng gốc với Ngoài-1 — đỏ giả khi nhánh chính đổi tệp của hồ sơ đã ký sau khi tách nhánh.
  - Ngoài-5: ca `khong-tinh` phủ bốn trạng thái không tính và hai trạng thái có tính, chưa phủ `tu-choi-vai`, `tu-choi-tran-thang` và `dang-hoi`.
  - Ngoài-6: dữ liệu gieo ghi trạng thái bằng chuỗi tự do, nên gõ nhầm tên trạng thái không bị bắt.
  - Ngoài-7: đối chứng bản gốc trong thước tài liệu nhận bất kỳ lỗi nào, không ghim đúng lỗi «còn số 1.500».
  - Ngoài-8: dòng 4c của bảng theo dõi được kiểm bằng bốn chuỗi rời, không kiểm chiều quyết định (1.500 → 300).
- Ngoài-4 (E7 báo «không vi phạm» khi trước-gộp không chạy): mở hợp đồng mới, theo quyết định Cổng Bằng chứng 27/09.
