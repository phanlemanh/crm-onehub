---
schema_version: 1
feature: Phiên gốc của câu Kho (CRM và Zalo) tự ghi liên kết câu hỏi → phiên ngay khi bắt đầu, và trợ lý kho không bao giờ chạy thiếu chỉ dẫn kho; đo lại bộ 50 câu trên Gemini 3.8 Flash
slug: zalo-tro-ly-kho-chi-dan
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [agent]
status: draft
design_doc: _acceptance/zalo-tro-ly-kho-chi-dan/design.md
---

# Acceptance Contract: zalo-tro-ly-kho-chi-dan

## Context

Hàng phát sinh `l6` của dãy P6, đợt r2. Cổng Đáng ký `build` (chủ kho, 2026-10-15T23:44:49Z, nguyên văn «phiên giám
sát này build», ghi ở `opportunity.md`). Nguyên nhân và hướng sửa ở `design.md`: liên kết câu hỏi → phiên gốc chỉ được
ghi sau khi lệnh mở phiên trả về, nên phiên con `tro_ly_kho` có thể bắt đầu trước liên kết, bộ nạp chỉ dẫn ném lỗi,
và eve chạy phiên con bằng chỉ dẫn mặc định của khung.

## Criteria

- AC-1: Given một tin Zalo đã có hàng `ZaloHoi` đang hỏi, chưa gắn phiên, và phiên gốc của tin mở với thuộc tính `purpose` = `zalo` cùng `hoiId` của hàng đó, When sự kiện `session.started` của phiên gốc đi qua hook của agent gốc, Then `ZaloHoi.sessionId` bằng mã phiên gốc ngay khi hook xong; And lần ghi sau của `moPhien` với cùng mã phiên không đổi hàng nào khác.
- AC-2: Given một câu Kho kênh CRM có hàng `TaiLieuHoi` mang dấu chờ `phienId` = `gui:<hoiId>`, và phiên gốc mở với `purpose` = `kho` cùng `hoiId` đó, When `session.started` của phiên gốc đi qua hook, Then `TaiLieuHoi.phienId` bằng mã phiên gốc ngay khi hook xong; And lần ghi sau của `guiHoiKho` với cùng mã phiên không ném, không đổi hàng nào khác, và câu vẫn đang hỏi.
- AC-3: Given phiên gốc có `purpose` khác `zalo` và `kho`, hoặc thiếu `hoiId`, hoặc `hoiId` trỏ hàng đã gắn phiên khác hay không còn đang hỏi, When hook chạy, Then không hàng `ZaloHoi` hay `TaiLieuHoi` nào đổi; And lỗi cơ sở dữ liệu trong hook không làm hỏng lượt của phiên gốc (hook không ném, chỉ ghi cảnh báo).
- AC-4: Given liên kết câu hỏi → phiên gốc đã được hook ghi, When phiên con `tro_ly_kho` bắt đầu với ngữ cảnh đúng hình eve thật (không có `session.parent`, token `subagent:<phiên gốc>:…`), Then bộ nạp chỉ dẫn trả chỉ dẫn kho mang mã câu hỏi ngay ở lần tra đầu, không phải chờ.
- AC-5: Given phiên con `tro_ly_kho` không tìm được câu hỏi kho nào cho phiên gốc của nó, When `session.started` chạy, Then bộ nạp chỉ dẫn không ném lỗi mà trả chỉ dẫn dừng — không gọi công cụ nào, trả kết quả ngay — vẫn ghi sự kiện «sai chỗ» như hôm nay, và ghi đúng một dòng cảnh báo «[tro-ly-kho] khong tim thay cau hoi» vào nhật ký.
- AC-6: Given bộ 50 câu mẫu Kho tài liệu và ngưỡng cũ của bộ chấm, When đo trợ lý kho trên Gemini 3.8 Flash ở cây của lượt này (hai hằng model đổi tạm như hồ sơ `re-mo-hinh-mac-dinh`), Then nhật ký eve của lượt đo không có dòng «Dynamic instructions resolver (session.started) threw» và không có dòng «[tro-ly-kho] khong tim thay cau hoi»; And mỗi phiên gốc của lượt (mã phiên ghi trong `ket-qua.jsonl`) có trong nhật ký đúng một dòng «[lien-ket-hoi]» mang mã phiên đó, tức hook đọc được `purpose` và `hoiId` trên eve thật; And tổng câu lỗi gọi model hai lượt không quá lượt đã ký của `bo-cau-hoi-mau` (2); And bốn chỉ số đạt ngưỡng cũ.

## Coverage

Không gian khép kín, không quét: hai đường mở phiên gốc (CRM `kho`, Zalo `zalo`) × ba trạng thái liên kết khi phiên con
bắt đầu (đã ghi sớm — AC-1, AC-2, AC-4; chưa ghi được vì đầu vào không hợp lệ — AC-3; không có câu hỏi — AC-5) ×
một phép đo đầu-cuối (AC-6). Bỏ quét: dòng sổ `descope` «bỏ coverage-scan».

## Đường đo

- Số dòng resolver ném lỗi và số dòng «khong tim thay cau hoi» trong nhật ký eve của lượt đo bộ 50 câu · bản chép
  `evidence/eve.log` của lượt, đếm bằng `rang/so-do.ts` · AC-6 bảo đảm.
- Số phiên gốc có dòng «[lien-ket-hoi]» trên tổng số phiên gốc của lượt · `evidence/eve.log` và `evidence/ket-qua.jsonl` ·
  AC-6 bảo đảm.
- Tổng câu lỗi model hai lượt cạnh lượt đã ký · `evidence/cham-tung-cau.jsonl` · AC-6 bảo đảm.

## Out of scope

- Máy soạn (`may_soan`) gọi làm phiên con tra `TaiLieuNguon.phienId` theo cùng kiểu (`nguonCuaPhien`) — cùng lớp rủi
  ro, việc riêng.
- Đổi model mặc định của nhánh — hồ sơ `re-mo-hinh-mac-dinh`.
- Lỗi sai khuôn kết quả do chính model khi đã có chỉ dẫn.
- Câu trả lời Zalo người dùng thấy khi lượt hỏng — giữ nguyên.

## Notes

- AC-6 gọi model thật qua AI Gateway một lượt (khoảng 100 lượt hỏi, khoảng 1,5 USD trên Gemini).
- AC-6 đo trên cây có hai hằng model đổi tạm, không commit; bằng chứng ghi model mà Gateway trả trong báo cáo bộ chấm.
