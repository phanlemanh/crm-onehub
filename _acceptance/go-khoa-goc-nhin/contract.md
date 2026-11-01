---
schema_version: 1
feature: Gỡ khoá góc nhìn — góc nhìn đang được chiến dịch dùng thì nói ra trước, và có lối trỏ chiến dịch sang góc nhìn khác
slug: go-khoa-goc-nhin
owner: omre.cnsp4@onemount.com
risk_tier: T2
surfaces: [api, ui]
status: signed-off
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-06T10:01:01Z
---

# Acceptance Contract: go-khoa-goc-nhin

## Context

Ván lái-thử người-lạ ngày 06/09 dừng ở một vấp CHẶN: nhân viên kết thúc chiến
dịch xong, bấm x để bỏ góc nhìn đã lưu, máy từ chối và bảo *«Finish or repoint
those campaigns first»* — trong khi chiến dịch **đã kết thúc từ ba phút trước**,
và trong sản phẩm **không có thao tác trỏ-lại nào tồn tại**. Đo lại xác nhận:
`usedViewIds` truy vấn theo `savedViewId` không lọc trạng thái, và khoá ngoại
`onDelete: Restrict` khiến bỏ chặn cũng không xoá được. Góc nhìn vĩnh viễn kẹt.

Đây là mục **Ngoài-15** người ký đã nhận làm giới hạn đã biết ở Cổng Bằng chứng
05/09. Ván lái cho thấy nó chặn một việc thật ở lượt chạy đầu, nên chủ kho nâng
nó thành vòng sửa riêng.

Sửa hai vế bù nhau: **bày ra trước** (menu nói góc nhìn đang được ai dùng và
không mời bấm x) và **mở lối ra** (trỏ chiến dịch sang góc nhìn khác — đúng lối
thoát mà thông điệp đã hứa từ đầu).

Source input: `_acceptance/tiep-thi-tuyen-doi-tac/stranger-drive.md` vấp #11 · ảnh `evidence/SD-MT5-step4.png`

## Criteria

- AC-1: Given một góc nhìn đang là phân khúc của ít nhất một chiến dịch, When lấy danh sách góc nhìn, Then mỗi góc nhìn mang kèm tên các chiến dịch đang dùng nó.
- AC-2: Given một góc nhìn không chiến dịch nào dùng, When lấy danh sách góc nhìn, Then danh sách chiến dịch đang dùng của nó rỗng.
- AC-3: Given một góc nhìn đang được một chiến dịch ĐÃ KẾT THÚC dùng, When gọi xoá góc nhìn đó, Then bị từ chối, và câu từ chối nêu tên chiến dịch và nêu ĐÚNG lối thoát có thật là trỏ chiến dịch sang góc nhìn khác — không câu nào bảo người dùng đi kết thúc một chiến dịch đã kết thúc.
- AC-4: Given một chiến dịch và một góc nhìn cá nhân dùng chung khác, When trỏ chiến dịch sang góc nhìn đó, Then phân khúc của chiến dịch đổi sang góc nhìn mới và danh sách thành viên tính lại theo bộ lọc mới.
- AC-5: Given một chiến dịch vừa được trỏ khỏi góc nhìn A và không chiến dịch nào khác dùng A, When xoá A, Then xoá được.
- AC-6: Given một góc nhìn của thực thể khác cá nhân, hoặc một mã góc nhìn không tồn tại, When trỏ chiến dịch sang nó, Then bị từ chối và phân khúc của chiến dịch giữ nguyên.
- AC-7: Given nhân viên đọc tiếng Việt mở menu góc nhìn, When một góc nhìn đang được chiến dịch dùng, Then chỗ vốn là nút xoá hiện một dòng tiếng Việt nói góc nhìn đang được chiến dịch nào dùng, và không có nút xoá để bấm. (cross-layer)

## Coverage

- Trục vế sửa: bày ra trước (AC-1, AC-2, AC-7) | mở lối ra (AC-4, AC-5) [thước CE: hai vế của chính vấp CHẶN]
- Trục chiều: cho phép (AC-4, AC-5) | từ chối có lý do đúng (AC-3, AC-6) [thước CE: luật cặp hai-chiều của kit]
- Trục lớp: máy chủ (AC-1..AC-6) | màn hình (AC-7) [thước CE: vấp gốc là vấp người nhìn thấy]
- Bỏ coverage-scan — không gian là hai vế × hai chiều, đếm được bằng tay (entry d-go-khoa-descope-scan)

## Out of scope

- Xoá chiến dịch — vẫn ngoài phạm vi như vòng trước đã cắt; lối ra của vòng này là trỏ-lại, không phải xoá.
- Lưu trữ (archive) góc nhìn thay cho xoá — một khái niệm mới, cần vòng riêng.
- Dịch thông điệp lỗi của máy chủ sang tiếng Việt — vẫn là phạm vi vòng ④ của hồ sơ tiếng Việt; vòng này chỉ đảm bảo câu tiếng Anh nói ĐÚNG.
- Chụp ảnh phân khúc lúc kết thúc chiến dịch để nó thôi phụ thuộc góc nhìn sống — đó là đổi lược đồ, hạng T3, vòng khác.
- Trỏ-lại hàng loạt nhiều chiến dịch một lượt.
- Siết luật «chỉ góc nhìn dùng chung mới làm phân khúc được» — trỏ-lại theo ĐÚNG luật của thủ tục tạo mới (góc nhìn thuộc thực thể Cá nhân là đủ); chỗ lỏng đó là Ngoài-18 của vòng trước, vòng này không đụng.

## Notes

- Hồ sơ đi đường `acceptance` ba pha, không qua feature-loop: vấp đã có ảnh, có mã, có phép đo lại; không có gì để brainstorm.
- Không chạm `packages/db/prisma` nên giữ T2. Khoá ngoại `Restrict` giữ nguyên — vòng này không bỏ chặn, chỉ làm chặn nói thật và mở một lối đi vòng.
