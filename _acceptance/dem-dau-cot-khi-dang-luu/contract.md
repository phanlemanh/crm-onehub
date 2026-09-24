---
schema_version: 1
feature: Bảng cột thoả thuận — số đếm và tổng đầu cột đổi ngay khi thả, trả về đúng khi lưu thất bại
slug: dem-dau-cot-khi-dang-luu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: implemented
design_doc: docs/superpowers/specs/2026-09-24-dem-dau-cot-khi-dang-luu-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-24T01:34:19Z
---

# Acceptance Contract: dem-dau-cot-khi-dang-luu

## Context

Trên bảng cột của màn Thoả thuận, thả một thẻ sang cột khác thì thẻ dời ngay nhưng
đầu hai cột (số thoả thuận, tổng tiền, lời «N thoả thuận chưa quy đổi») đứng yên
tới khi lưu xong, và cột cũ hiện «còn 1 thẻ» không có thật. Vòng này cho đầu cột
đổi cùng lúc với thẻ, và trả về đúng số cũ khi máy chủ từ chối.

Source input: Known limits Ngoài-2 của `_acceptance/keo-tha-thoa-thuan/contract.md`
+ yêu cầu của chủ kho 2026-09-24 («chạy chip sửa số đếm đầu cột»).

## Criteria

- AC-1: Given một thẻ được tính vào tổng ở cột mở A, When thả nó sang cột mở B và máy chủ chưa trả lời, Then đầu A hiện số thoả thuận bớt 1 và tổng bớt đúng giá trị quy đổi của thẻ, đầu B hiện số thêm 1 và tổng thêm đúng giá trị đó.
- AC-2: Given một thẻ có số tiền nhưng không được tính vào tổng — cả hai loại: chưa có giá trị quy đổi, và quy đổi theo tiền báo cáo cũ — When thả nó sang cột khác và đang lưu, Then tổng của hai cột không đổi; lời «chưa quy đổi» của cột cũ bớt 1 và của cột mới thêm 1 kèm mã tiền của thẻ.
- AC-3: Given một thẻ không có số tiền, When thả và đang lưu, Then chỉ số thoả thuận của hai cột đổi (−1, +1); tổng và lời «chưa quy đổi» giữ nguyên.
- AC-4: Given cột cũ đang hiện đủ mọi thẻ của nó, When thả một thẻ đi và đang lưu, Then cột cũ không hiện dòng «còn N thẻ».
- AC-5: Given thẻ vừa kéo là thoả thuận được tính cuối cùng của cột cũ, When đang lưu, Then tổng của cột cũ về rỗng đúng như máy chủ trả cho một cột không còn thoả thuận được tính (không phải số 0 tính ra từ phép trừ), nên đầu cột hiện y như khi máy chủ trả dữ liệu đó; Given cột mới trước đó không có thoả thuận được tính, Then đầu cột mới in tổng bằng giá trị của thẻ.
- AC-6: Given đang lưu, When máy chủ từ chối, Then thẻ về cột cũ và đầu hai cột trở về đúng số, tổng và lời «chưa quy đổi» như trước khi kéo.
- AC-7: Given lưu thành công, When bảng tải lại xong mà lượt dời chưa kịp xoá, Then đầu hai cột bằng đúng đầu ra của máy chủ — không bị trừ hay cộng hai lần.
- AC-8: Given cột cũ đang hiện đủ mọi thẻ và thẻ chưa quy đổi vừa rời là thẻ duy nhất mang mã tiền đó trong cột, When đang lưu, Then mã tiền đó không còn trong lời «chưa quy đổi» của cột cũ.
- AC-10: Given hai thẻ khác nhau cùng rời một cột và lượt thứ nhất chưa lưu xong (hoặc đã lưu và bảng đã tải lại trong khi lượt thứ hai còn chờ), When đang lưu, Then đầu các cột bằng đúng đầu ra của máy chủ sau khi cả hai lượt lưu xong.
- AC-9: Given dữ liệu bảng cột từ máy chủ, Then mỗi thẻ cho biết nó có được tính vào tổng không, và mỗi cột cho biết số thoả thuận được tính (kể cả phần vượt 50 thẻ), theo đúng luật tiền tệ mà tổng của cột đang dùng — ở cột hiện đủ thẻ, tổng của cột bằng tổng giá trị quy đổi của các thẻ được tính.

## Coverage

- Bỏ quét coverage — xem sổ quyết định (entry «bỏ coverage-scan»). Không gian ba trục đã liệt kê đủ trong thiết kế: loại thẻ {được tính, chưa quy đổi, không có số tiền} × tình trạng cột {bình thường, cột cũ mất thoả thuận được tính cuối, cột mới trước đó rỗng tổng, cột bị cắt} × kết cục {đang lưu, lưu thất bại, lưu xong rồi tải lại} × số lượt dời đang chờ {một, hai} → AC-1 … AC-8, AC-10; AC-9 là đầu vào máy chủ. Trục số lượt dời thêm sau phản biện context sạch.

## Out of scope

- Danh sách mã tiền «chưa quy đổi» của cột trên 50 thoả thuận trong lúc lưu: giữ danh sách cũ (trừ khi số chưa quy đổi về 0). Máy chủ không trả số theo từng mã tiền, và chênh lệch chỉ sống vài trăm mili giây.
- Menu giai đoạn trên thẻ (đổi giai đoạn bằng bàn phím): nó không đi qua lượt dời lạc quan; hành vi giữ nguyên.
- Thả vào cột thua: vẫn mở hộp lý do trước khi ghi, đầu cột không đổi cho tới khi lưu.
- Known limits Ngoài-3, 4, 5 của `keo-tha-thoa-thuan` (độ sắc của các phép đo cũ).

## Notes

- Dữ liệu mẫu hiện có đúng ca khó của AC-2: cột DEMO_BOOKED có thẻ EUR mang giá trị quy đổi 90000 xu nhưng không nằm trong tổng 35000 (quy đổi theo tiền báo cáo cũ). Trình duyệt vì thế không được đoán «được tính» từ giá trị quy đổi.
