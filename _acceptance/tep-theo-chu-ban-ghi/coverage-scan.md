# Quét Zwicky: tep-theo-chu-ban-ghi (DA20)

## Ngữ cảnh

- Sản phẩm: CRM nội bộ của OneHub, người dùng là nhân viên quan hệ đối tác (môi giới, RM ngân hàng). Chân sản phẩm: đào
  repo — `docs/plan/lo-trinh-viec-du-an.json` (DA20), `docs/plan/pham-vi-truong-hop-dong.md` (F2), `docs/design.md` mục
  «Trường» › «Tệp», thiết kế DA19 trên `feat/truong-tep`, `packages/db/prisma/schema.prisma`,
  `packages/validation/src/vai-workspace.ts`. Chân ngành: Salesforce Files «Set by Record» (quyền tệp gắn bản ghi đi theo
  quyền bản ghi, không chép); HubSpot quyền «Their records» theo chủ bản ghi, nhóm «Unassigned» cho bản ghi không chủ.

## Trục

- Trục A — người gọi so với bản ghi: quản trị (`owner`, `admin`) | nhân viên phụ trách bản ghi | nhân viên không phụ
  trách | nhân viên đã tải tệp lên mà không phụ trách | vai «chỉ OKR» là người phụ trách | người đã rời nhóm vẫn mang
  `ownerId` | khoá API của nhân viên
  [thước CE: `vai-workspace.ts` (bốn vai) SUY-TỪ-REPO; `docs/api.md` «Removing a member» SUY-TỪ-REPO; HubSpot «Their
  records / Unassigned» NGÀNH]
- Trục B — trạng thái người phụ trách: có, là người gọi | có, người khác | chưa có (Công ty, Cá nhân; Thoả thuận luôn
  có) | vừa đổi A→B | vừa gỡ về trống | bản ghi đã lưu trữ
  [thước CE: `schema.prisma:411, 484, 1048` SUY-TỪ-REPO]
- Trục C — việc trên tệp: thấy tên và số | mở (`downloadUrl`) | cờ `coTheMo`, `lyDoKhongMo` trong `byId` | xoá | tải
  lên | URL đã cấp trước lúc đổi
  [thước CE: bảng mục 4 thiết kế DA19 SUY-TỪ-REPO]
- Trục D — đường đổi người phụ trách: `deals|companies|contacts.update` (phiếu và REST `PATCH`) | gán hàng loạt ba loại |
  tự tạo từ hộp thư, lịch, biểu mẫu (chỉ lúc tạo) | Kara (không có công cụ đổi) | gỡ thành viên (không đổi `ownerId`)
  [thước CE: báo cáo soát mã 22/10, `deals.service.ts:484, 900`, `companies.service.ts:375, 583`, `contacts.service.ts:578,
  607`, `workspace.service.ts:542` SUY-TỪ-REPO]

Cross-cutting: ba loại bản ghi (Thoả thuận, Công ty, Cá nhân); luật ở một hàm; máy chủ tính, màn vẽ.

## Core

1. A × B × «mở»: bảng chân lý vai × quan hệ × loại bản ghi, ở `downloadUrl` và ở cờ `byId` — câu giao. → AC-1
2. D × «mở» sau đổi: mỗi đường đổi trên mã hôm nay, người cũ mất quyền, người mới có ngay — vế hai của câu giao. → AC-2
3. B «chưa có» và «gỡ về trống»: chỉ quản trị — ghi chú hàng. → AC-1, AC-2
4. A «không phụ trách» × C «thấy, tải lên», B không thừa kế từ công ty: phạm vi luật chỉ là mở. → AC-3
5. A × C «xoá»: theo Hỏi-2. → AC-4
6. C «cờ» trên màn: dòng lý do và lời báo mất quyền. → AC-5, AC-7
7. Vết mở và từ chối mở cho Đường đo. → AC-6

## Later

- A «người đã rời nhóm vẫn mang `ownerId`»: câu lý do riêng «<tên> không còn trong nhóm…» (hôm nay câu nêu tên người đã
  rời); ô chọn người phụ trách vẫn liệt cả người đã rời — việc của ô chọn, không của tệp.
- D «gán hàng loạt» và «update» không kiểm người phụ trách còn trong nhóm (`requireOwner` chỉ kiểm hàng `User`).
- C «URL đã cấp»: thu hồi không làm được với Blob ký trước; hạ hạn là Hỏi-1.

## Never

- Lấy người phụ trách của công ty cho cá nhân hay thoả thuận — câu giao nói «bản ghi mình phụ trách».
- Bảng cấp quyền lưu riêng (ghi khi đổi người phụ trách) — phải đồng bộ ở mọi đường của trục D, sót một đường là quyền
  không đi theo; tính lúc gọi thì không có gì để sót.
- Giới hạn xem hay sửa bản ghi theo người phụ trách — luật 3 của gói: không chạm quyền dữ liệu khác trong một hàng.
- Kara mở tệp hộ người chat — DA23.
