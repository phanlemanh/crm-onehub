---
schema_version: 1
feature: «Khung bản ghi tải lỗi nói đúng lý do: đã xoá, không có quyền, hay mất kết nối» — ngăn cá nhân, công ty, thoả thuận, kế hoạch phân biệt NOT_FOUND, FORBIDDEN và lỗi khác; hai lý do đầu có «Đóng», lỗi mạng có «Thử lại»
slug: khung-loi-ban-ghi-dung-ly-do
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
design_doc: docs/superpowers/specs/2026-10-09-khung-loi-ban-ghi-dung-ly-do-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-09
---

# Acceptance Contract: khung-loi-ban-ghi-dung-ly-do

## Context

Hàng K4b của đợt `sau-14-10`, dãy P2, sau K4 `khung-ban-ghi-kara` (#306). Ngoài-4 của K4, anh chọn «mở hợp đồng mới»;
anh ký `build` 2026-10-08T02:23:55Z (luật 25). Khung lỗi của ngăn bản ghi hôm nay luôn bảo «kiểm tra kết nối rồi thử
lại» kể cả khi bản ghi đã bị xoá (NOT_FOUND) hay người xem không có quyền (FORBIDDEN); ngăn kế hoạch còn không có nút
«Thử lại». Không đổi API: máy chủ đã trả đúng mã lỗi.

## Criteria

- AC-1: Given ngăn của một cá nhân, công ty, thoả thuận hay kế hoạch được mở theo id, When truy vấn bản ghi trả lỗi mã `NOT_FOUND`, Then ngăn hiện «Bản ghi này không còn» kèm một câu giải thích và nút «Đóng»; không có «Thử lại», không có câu «Kiểm tra kết nối rồi thử lại.», không in thông điệp lỗi thô; bấm «Đóng» thì ngăn đó đóng (về ngăn trước nếu đang chồng ngăn); máy chủ thật trả mã `NOT_FOUND` cho bản ghi không còn ở cả bốn loại. (cross-layer)
- AC-2: Given như AC-1, When truy vấn trả lỗi mã `FORBIDDEN`, Then ngăn hiện «Bạn không có quyền xem bản ghi này» kèm một câu giải thích và nút «Đóng»; không có «Thử lại», không có câu kiểm tra kết nối, không in lỗi thô; máy chủ thật trả mã `FORBIDDEN` cho người không thuộc workspace. (cross-layer)
- AC-3: Given như AC-1, When truy vấn trả lỗi mã khác (mạng, máy chủ), Then ngăn hiện «Không tải được bản ghi này» kèm «Kiểm tra kết nối rồi thử lại.» và «Thử lại» — kể cả ngăn kế hoạch; bấm «Thử lại» gọi lại đúng truy vấn của ngăn đó đúng một lần.
- AC-4: Given mục «Kế hoạch» trong ngăn công ty, When truy vấn kế hoạch của công ty trả lỗi `NOT_FOUND`, `FORBIDDEN` hay mã khác, Then mục hiện tiêu đề và câu giải thích theo đúng lý do như AC-1 đến AC-3; hai lý do đầu KHÔNG có nút nào (ngăn công ty vẫn đang dùng được, không có gì để đóng), lỗi khác có «Thử lại».
- AC-5: Given giao diện tiếng Anh, When một trong ba khung hiện, Then chữ là bản tiếng Anh lấy từ tệp chữ `kara-ban-ghi.ts` (cặp en/vi do messages-guard giữ), không ký tự tiếng Việt có dấu trong khung.
- AC-6: Given bản chạy thật của cây này, một cá nhân vừa bị xoá vĩnh viễn, When mở `?record=contact:<id>` ở khổ 1440 và 390, Then ngăn hiện «Bản ghi này không còn» kèm «Đóng» (không phải khung kiểm tra kết nối), bấm «Đóng» thì ngăn đóng, ở 390 không có gì tràn ngang; một người không làm lượt này đọc ảnh thấy rõ bản ghi không còn và việc nên làm tiếp. (judgment)

## Coverage

- Quét bằng `morphological-scan` (`_acceptance/khung-loi-ban-ghi-dung-ly-do/coverage-scan.md`), preset `test-matrix`.
- Trục A — ngăn: cá nhân | công ty | thoả thuận | kế hoạch | mục «Kế hoạch» của công ty [thước CE: các tệp `*-sheet.tsx` dùng `RecordSheetFrame` và `company-plans.tsx` — SUY-TỪ-REPO: `apps/app/components/crm/record-sheet/`]
- Trục B — mã lỗi: NOT_FOUND | FORBIDDEN | khác [thước CE: `NotFoundException` trong `contacts.service.ts`, `NOT_A_MEMBER` FORBIDDEN trong `auth.middleware.ts` — SUY-TỪ-REPO; NGÀNH: Nielsen Norman Group Error-Message Guidelines (nói đúng nguyên nhân, chỉ việc làm được)]
- Trục C — khổ × ngôn ngữ: 1440 vi | 390 vi | en — 1440/390 đo ở AC-6, en ở AC-5.
- Later: phiên hết hạn (UNAUTHORIZED), bản ghi lưu trữ — xem Out of scope.

## Đường đo

- Thước: 0 khung «kiểm tra kết nối» cho lỗi NOT_FOUND hay FORBIDDEN ở bốn ngăn và mục «Kế hoạch» · số từ: bài DOM `apps/app/test/khung-loi-ban-ghi-dung-ly-do.dom.tsx` · bảo đảm bởi: AC-1, AC-2, AC-4
- Thước: lái thử người lạ mở đường dẫn tới cá nhân đã xoá, không bấm «Thử lại» lần nào · số từ: nhật ký vấp (khuôn `stranger-drive-template.md`) · bảo đảm bởi: đã có sẵn — nghi thức lái-thử của `/acceptance-gate:uat-session` §0

## Out of scope

- Phiên hết hạn (`UNAUTHORIZED`) vẫn hiện khung «kiểm tra kết nối» — đường đăng nhập lại đã có (#184).
- Bản ghi đã lưu trữ và dải báo «Đã lưu trữ ngày …» — V2.
- Ngăn mục tiêu và KR của OKR — đã có cách riêng.
- Mục con khác trong ngăn (dòng thời gian, hoạt động trên website, 30 ngày đầu).

## Notes

- Vòng đời (luật 14): (1) Dọn thế nào — không đổi; (2) «Lịch sử» — không đổi; (3) Danh sách mặc định — không đổi, «Đóng» trả về danh sách hay ngăn trước.
- `KhungTaiLoi` được bài `kara-ban-ghi.dom.tsx` của hồ sơ đã ký `khung-ban-ghi-kara` dùng; lý do mặc định là «mất kết nối» để hành vi cũ giữ nguyên (E7 chạy lại bài đó).
