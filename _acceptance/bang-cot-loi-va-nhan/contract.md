---
schema_version: 1
feature: Bảng cột danh mục 30 ngày đầu báo lỗi kèm nút tải lại, và giữ nhãn cột đúng với dữ liệu đang hiện khi đổi cách chia
slug: bang-cot-loi-va-nhan
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-21T13:34:13Z
design_doc: docs/superpowers/specs/2026-09-21-bang-cot-loi-va-nhan-design.md
---

# Acceptance Contract: bang-cot-loi-va-nhan

## Context

Hai mục ngoài hợp đồng của hồ sơ `quan-ly-danh-muc-30-ngay` (Ngoài-5, Ngoài-6),
ký «ghi Known limits» tại Cổng Bằng chứng 2026-09-21 rồi chủ kho yêu cầu sửa ngay:
bảng cột tải lỗi thì khung chờ quay mãi; vừa đổi cách chia thì cột cũ mang nhãn của
cách chia mới cho tới khi dữ liệu mới về.

## Criteria

- AC-1: Given màn danh mục ở dạng bảng cột, When thủ tục bảng cột trả lỗi ngay lần tải đầu, Then thanh lọc vẫn còn, vùng bảng cột hiện «Không tải được bảng cột» kèm nút «Tải lại», và không còn khung chờ nào.
- AC-2: Given bảng cột đang báo lỗi, When bấm «Tải lại» và lần này thủ tục trả dữ liệu, Then các cột hiện ra với tiêu đề và số đếm của dữ liệu đó, thông báo lỗi biến mất, và đường dẫn không đổi.
- AC-3: Given bảng cột đang hiện các cột của một bộ lọc, When đổi bộ lọc và lần tải mới trả lỗi, Then màn hiện «Không tải được bảng cột» kèm nút «Tải lại» và không còn cột nào của lần tải trước trên màn.
- AC-4: Given bảng cột đang chia theo một cách (bước, hoặc trạng thái), When đổi sang cách chia kia mà dữ liệu mới chưa về, Then mọi cột đang hiện mang đúng nhãn theo cách chia của chính dữ liệu đó — không cột nào mang nhãn của cách chia mới — và vùng bảng cột báo đang tải; đúng ở cả hai chiều đổi.
- AC-5: Given đã đổi cách chia và đang chờ, When dữ liệu của cách chia mới về, Then các cột mang nhãn theo cách chia mới và vùng bảng cột thôi báo đang tải.
- AC-6: Given bảng cột đang báo lỗi sau khi đổi bộ lọc, When bấm «Tải lại» và thủ tục trả dữ liệu, Then lần gọi lại mang đúng bộ lọc mới đang hiện trên thanh lọc, và các cột hiện ra là cột của chính lần gọi đó, không phải cột của bộ lọc cũ.

## Coverage

- Bỏ coverage-scan — hai lỗi đã gọi tên đích danh ở Cổng Bằng chứng của hồ sơ trước; không gian là ba trạng thái tải của bảng cột (có dữ liệu · đang chờ dữ liệu mới · lỗi) và đã liệt kê đủ ở AC-1 đến AC-6 (entry `descope` «bỏ coverage-scan» trong `decisions.jsonl`).

## Out of scope

- Trạng thái lỗi của dạng bảng — đã có từ hồ sơ trước, không đổi.
- Các mục ngoài hợp đồng khác của hồ sơ trước (Ngoài-1..4, Ngoài-7) — vẫn là hạn chế đã biết.
- Tự thử lại sau một khoảng — «Tải lại» là thao tác của người.

## Notes

- Không có ảnh chụp E-ui-check: cả ba trạng thái là trạng thái tải thoáng qua hoặc do lỗi gây ra, đo trong jsdom với thủ tục giả điều khiển được (entry `descope` «bỏ ui-observed»).
