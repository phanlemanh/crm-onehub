---
schema_version: 1
feature: Bộ phận còn nằm trong một khuôn bất kỳ (kể cả đã lưu trữ) thì không xoá vĩnh viễn được, nên khuôn đã lưu trữ khôi phục được sau khi khôi phục bộ phận của nó
slug: khuon-mat-bo-phan
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: verified
approved_by: Phan Le Manh
approved_at: 2026-09-22
design_doc: docs/superpowers/specs/2026-09-22-khuon-mat-bo-phan-design.md
---

# Acceptance Contract: khuon-mat-bo-phan

## Context

Ở Cổng Bằng chứng của `sua-luu-tru-dieu-phoi` (22/09), phiên soi tìm ra lỗi Ngoài-3
và Ngoài-5: một bộ phận chỉ còn nằm trong khuôn đã lưu trữ vẫn được tính là «chưa
từng dùng», nên xoá vĩnh viễn được, và sau đó khuôn kia không bao giờ khôi phục được.
Chủ kho chọn mở hợp đồng mới và quyết `build`. Hướng sửa: coi «nằm trong một khuôn
bất kỳ» cũng là «đã dùng».

## Criteria

- AC-1: Given một bộ phận đã lưu trữ, không có bước kế hoạch nào, và chỉ còn nằm trong khuôn đã lưu trữ (một hoặc nhiều khuôn), When xem danh sách bộ phận đã lưu trữ, Then máy chủ báo bộ phận đó không xoá được (`purgeable: false`); When gọi thẳng máy chủ xoá vĩnh viễn nó, Then máy chủ trả 400 với thông điệp nêu tên MỌI khuôn còn nhắc tới nó và bộ phận vẫn còn trong cơ sở dữ liệu; xoá vĩnh viễn một trong hai khuôn thì bộ phận vẫn không xoá được và thông điệp nêu khuôn còn lại.
- AC-2: Given ca của AC-1, When khôi phục bộ phận rồi khôi phục khuôn, Then cả hai trở lại danh sách đang dùng và các bước của khuôn còn nguyên, giao đúng bộ phận đó.
- AC-3: Given ca của AC-1, When làm theo một trong hai lối thông điệp chỉ — (a) xoá vĩnh viễn khuôn trước (khuôn chưa có kế hoạch), hoặc (b) khôi phục bộ phận và khuôn, sửa khuôn bỏ bước của bộ phận, rồi lưu trữ lại cả hai — Then danh sách bộ phận đã lưu trữ báo bộ phận xoá được (`purgeable: true`) và xoá vĩnh viễn bộ phận thành công.
- AC-4: Given bốn ca bộ phận đã lưu trữ — không ở đâu cả; chỉ trong khuôn đã lưu trữ; chỉ có bước kế hoạch; có cả hai — When so `purgeable` trong danh sách với kết quả gọi xoá vĩnh viễn, Then với mọi ca `purgeable: true` đúng khi và chỉ khi xoá thành công; và `purgeable` mà `archiveDepartment` trả về ngay lúc lưu trữ bằng đúng giá trị trong danh sách.
- AC-5: Given các luật đã giao ở `sua-luu-tru-dieu-phoi` — xoá vĩnh viễn (chưa lưu trữ thì không xoá; có bước kế hoạch thì không xoá; khuôn đã có kế hoạch thì không xoá; bộ phận và khuôn chưa từng dùng thì xoá được) và chặn lưu trữ (bộ phận còn trong khuôn đang dùng thì không lưu trữ được, thông điệp nêu tên khuôn) — When chạy lại, Then các luật đó giữ nguyên.

## Coverage

Quét không gian tiêu chí bằng morphological-scan (preset test-matrix), ba trục:

- Trục trạng thái bộ phận: đang dùng | đã lưu trữ [thước CE: cột `archivedAt` của `department` — SUY-TỪ-REPO: packages/db/prisma/schema.prisma]
- Trục nơi nhắc tới nó: không đâu | khuôn đang dùng | khuôn đã lưu trữ | bước kế hoạch | khuôn đã lưu trữ và bước kế hoạch [thước CE: hai đường tham chiếu duy nhất tới `departmentId` — khoá ngoại của `onboardingStep` và cột JSON `onboardingTemplate.steps` — SUY-TỪ-REPO: packages/db/prisma/schema.prisma; NGÀNH: SQL chuẩn, hành động tham chiếu `ON DELETE RESTRICT`]
- Trục thao tác: liệt kê `purgeable` | xoá vĩnh viễn | khôi phục khuôn sau đó | thủ tục trả một bộ phận

Ô bị gạch: bộ phận đang dùng × mọi nơi nhắc (không xoá được vì chưa lưu trữ, AC-5); bộ phận đã lưu trữ × khuôn đang dùng (không tồn tại — lưu trữ bị chặn khi khuôn đang dùng còn nhắc tới nó).

Core: AC-1 (liệt kê + xoá, một hoặc nhiều khuôn đã lưu trữ), AC-2 (khôi phục khuôn), AC-3 (hai lối dọn thông điệp chỉ), AC-4 (ma trận quan hệ purgeable ⇔ xoá được, kể cả thủ tục trả một bộ phận), AC-5 (hồi quy, gồm luật chặn lưu trữ mà ô gạch «đã lưu trữ × khuôn đang dùng» dựa vào).

Later: vá khuôn đã mồ côi từ trước · nói lý do nút «Xoá vĩnh viễn» không hiện.

Never: cho khôi phục khuôn mà bỏ bước mồ côi — mất dữ liệu người đã soạn.

## Out of scope

- Dò và vá khuôn đã mồ côi từ trước khi sửa: nếu prod đã có ca xoá như trên, khôi phục khuôn đó vẫn báo 404 với mã bộ phận.
- Nói trên màn vì sao nút «Xoá vĩnh viễn» không hiện — ca «đã dùng» hôm nay cũng không nói.
- Cấu trúc hai cấp bộ phận / phòng ban — ô `cau-truc-to-chuc`.

## Notes

- Màn hình không đổi mã (không có phép đo máy nào cho việc làm mới danh sách trên màn — phép thử là chủ kho thử lại đường dọn sau khi gộp): `da-luu-tru.tsx` chỉ hiện «Xoá vĩnh viễn» khi `purgeable`, và làm mới cả hai danh sách sau mọi lần xoá.
