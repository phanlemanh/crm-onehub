---
schema_version: 1
feature: Hỏi Kho qua Zalo từ câu thứ hai trở đi trong ngày, trợ lý kho vẫn trả lời đúng chỉ dẫn
slug: zalo-cau-thu-hai-lien-ket
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [agent]
status: draft
approved_by:
approved_at:
design_doc: _acceptance/zalo-cau-thu-hai-lien-ket/design.md
---

# Acceptance Contract: zalo-cau-thu-hai-lien-ket

## Context

Hàng `l7` của lộ trình Kho tài liệu, mốc 30/10. Cổng Đáng ký `build` (chủ kho, 2026-10-19T14:59:33Z, ghi ở
`opportunity.md`). Nguồn là mục Ngoài-4 của `zalo-tro-ly-kho-chi-dan` (l6): câu Zalo thứ hai trở đi trong cùng cuộc chat
cùng ngày dùng lại phiên gốc, nên hook `session.started` không chạy và liên kết câu hỏi → phiên chỉ được ghi khi `send`
trả về. Phiên con `tro_ly_kho` bắt đầu trước liên kết thì nhận chỉ dẫn dừng và không trả lời. Hướng sửa ở `design.md`:
hook nghe thêm `turn.started`; luật in dòng nhật ký giữ nguyên như l6. Hạng T3 theo hàng lộ trình
(`hang: T3`) và luật 21 của đợt; tệp dự kiến chạm (`hooks/lien-ket-hoi.ts`, bài kiểm, phép
đo) không khớp `risk_tiers.t3_paths`, nên hạng máy suy là T2 — giữ T3, không hạ.

## Criteria

- AC-1: Given một người đã hỏi Kho qua Zalo câu đầu trong ngày, hàng `ZaloHoi` câu đó đã gắn phiên gốc và đã kết thúc, và người đó gửi câu tiếp theo (thứ hai, rồi thứ ba) cùng ngày qua `hoiTacTu` — cùng token phiên với câu đầu, hàng `ZaloHoi` mới đang hỏi chưa gắn phiên, `auth.attributes` của lượt mang `purpose` = `zalo` và `hoiId` của câu mới, When sự kiện `turn.started` của phiên gốc đi qua hook của agent gốc, Then `ZaloHoi.sessionId` của câu mới bằng mã phiên gốc ngay khi hook xong; And hàng của các câu trước không đổi; And lần gọi hook đó in đúng một dòng «[lien-ket-hoi] zalo <hoiId câu mới> -> <mã phiên gốc>»; And lần ghi sau của `moPhien` với cùng mã phiên không đổi hàng nào khác; And khi `moPhien` đã ghi trước rồi hook mới chạy, hàng không đổi và hook vẫn in dòng đó.
- AC-2: Given câu đầu của một phiên gốc — Zalo (`purpose` = `zalo`) hay CRM (`purpose` = `kho`, hàng `TaiLieuHoi` mang dấu chờ `gui:<hoiId>`), When `session.started` rồi `turn.started` của cùng phiên cùng đi qua hook, Then liên kết của hàng bằng mã phiên gốc sau lần gọi đầu và không đổi ở lần gọi thứ hai; And không hàng nào khác đổi; And câu CRM vẫn đang hỏi và `guiHoiKho` ghi lại sau đó không ném.
- AC-3: Given `turn.started` với `purpose` khác `zalo` và `kho`, hoặc thiếu `hoiId`, hoặc `hoiId` trỏ hàng đã gắn phiên khác hay không còn đang hỏi, When hook chạy, Then không hàng `ZaloHoi` hay `TaiLieuHoi` nào đổi và không có dòng «[lien-ket-hoi]»; And lỗi cơ sở dữ liệu trong hook ở `turn.started` không làm hỏng lượt (hook không ném, ghi đúng một cảnh báo).
- AC-4: Given câu thứ hai trong ngày đã được hook gắn ở `turn.started`, When phiên con `tro_ly_kho` của lượt đó bắt đầu với ngữ cảnh đúng hình eve thật, Then bộ nạp chỉ dẫn trả chỉ dẫn kho mang mã hàng `TaiLieuHoi` của câu thứ hai — không phải của câu đầu — ngay ở lần tra đầu; And hàng `TaiLieuHoi` đó gắn với `ZaloHoi` của câu thứ hai.
- AC-5: Given tám người đã nối Zalo, mỗi người hỏi ba câu kho liên tiếp trong ngày qua `/zalo/webhook` trên eve thật (24 câu cố định của `rang/chuoi.json`, model mặc định của nhánh), When lượt đo chạy xong, Then ba câu của mỗi người cùng một mã phiên gốc; And mỗi câu có hàng `TaiLieuHoi` kênh ZALO gắn với `ZaloHoi` của chính câu đó, kết thúc ở `TRA_LOI` hoặc `TU_CHOI`, và Zalo giả nhận một câu trả lời cho chat đó; And nhật ký eve có 0 dòng «[tro-ly-kho] khong tim thay cau hoi» và 0 dòng «Dynamic instructions resolver (session.started) threw»; And mỗi câu có ít nhất một dòng «[lien-ket-hoi] zalo <zaloHoiId> -> <mã phiên gốc>» mang `zaloHoiId` của chính câu đó; And câu lỗi gọi model không quá ngưỡng chốt ở Hỏi-2 (khuyên 1 trên 24), và câu lỗi đó không phải câu nhận chỉ dẫn dừng.

## Coverage

Không gian nhỏ, liệt kê tay, không quét bằng skill — dòng sổ `descope` «bỏ coverage-scan».

Trục và ô:

- Thứ tự câu trong phiên gốc: câu đầu (`session.started` + `turn.started` — AC-2) · câu thứ hai (AC-1, AC-4, AC-5) ·
  câu thứ ba (AC-1, AC-5).
- Kênh: Zalo (AC-1, AC-4, AC-5) · CRM kho, mỗi câu một phiên (AC-2).
- Đầu vào của hook ở `turn.started`: hợp lệ (AC-1) · purpose khác / thiếu `hoiId` / hàng gắn phiên khác / hàng đã đóng
  (AC-3) · cơ sở dữ liệu lỗi (AC-3).
- Ai ghi liên kết trước: hook trước `moPhien`, `moPhien` ghi lại cùng giá trị (AC-1) · `moPhien` trước hook (AC-1 vế cuối).
- Lớp: logic trên Postgres thật (AC-1–AC-4) · eve thật đầu-cuối (AC-5).

Ô bỏ: câu trước còn `TaiLieuHoi` đang hỏi khi câu sau tới (Out of scope).

## Out of scope

- Câu trước còn hàng `TaiLieuHoi` đang hỏi khi câu sau tới (lượt câu trước chưa xong, quá hạn phía Zalo):
  `hangDangHoi(goc)` có thể trả hàng câu trước. `dangBan` chặn câu sau khi câu trước còn trong hạn; ca vượt hạn là việc
  riêng.
- Đổi model mặc định, chất lượng câu trả lời — hồ sơ `re-mo-hinh-mac-dinh`, `bo-cau-hoi-mau`.
- Kênh `apps/agent/agent/channels/zalo.ts` (vùng làn Mac Studio) không đổi.
- Máy soạn (`may_soan`) tra phiên gốc theo cùng kiểu — việc riêng, như Out of scope của l6.

## Notes

- AC-5 gọi model thật qua AI Gateway một lượt (24 câu Zalo, mỗi câu một lượt agent gốc và một phiên con
  `tro_ly_kho`; ước dưới 1 USD). Trần chi và ngưỡng lỗi model chốt ở Hỏi-2 (design.md).
- AC-5 chạy trên kho đo dùng-một-lần `crm_<cây>_do`, không chạm kho chung `crm`, không dữ liệu thật.
- Phép đo không đổi model: bằng chứng ghi model mà Gateway trả.
