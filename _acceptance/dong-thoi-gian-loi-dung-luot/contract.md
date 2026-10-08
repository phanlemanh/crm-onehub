---
schema_version: 1
feature: «Thông báo lỗi của dòng thời gian theo đúng lượt tải đã hỏng, không theo lượt đang chạy» — khi lỗi «Xem cũ hơn» và lỗi làm mới chồng nhau, thông báo chỉ đổi khi một lượt tải đã xong
slug: dong-thoi-gian-loi-dung-luot
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
design_doc: docs/superpowers/specs/2026-10-08-dong-thoi-gian-loi-dung-luot-design.md
approved_by:
approved_at:
---

# Acceptance Contract: dong-thoi-gian-loi-dung-luot

## Context

Hàng K6e của đợt `sau-14-10`, dãy P2, sau K6c `dong-thoi-gian-giu-khi-loi` (#319). Ngoài-1, 2, 5 của K6c (cùng gốc), anh
chọn «mở hợp đồng mới» ở Cổng 2 2026-10-08T15:12:55Z — luật 26 coi đó là Cổng Đáng `build`. K6c chọn thông báo theo cờ
của TanStack Query suy từ lượt ĐANG chạy, nên khi hai lỗi chồng nhau thông báo hiện cho lượt chưa hỏng và cảnh báo làm
mới có thể tắt dù chưa làm mới được. Chỉ sửa `timeline.tsx`; không đổi API, chữ hay thành phần.

## Criteria

- AC-1: Given tab Hoạt động đang hiện thông báo «Không làm mới được hoạt động…» và còn trang cũ hơn, When người bấm «Xem cũ hơn» và trang kế đang tải, Then không lúc nào hiện thông báo «Không tải được hoạt động cũ hơn.», nút «Xem cũ hơn» vẫn ở đó và bị tắt (bấm thêm không gọi chồng), và thông báo làm mới vẫn hiện; When trang kế tải xong thành công, Then hoạt động cũ hơn nối vào và thông báo làm mới VẪN hiện; When trang kế lỗi, Then hiện cả hai thông báo.
- AC-2: Given tab Hoạt động đang hiện thông báo «Không tải được hoạt động cũ hơn.», When một lượt làm mới nền đang chạy, Then không lúc nào hiện thông báo «Không làm mới được hoạt động…» và thông báo «xem cũ» vẫn hiện; When lượt làm mới thành công, Then cả hai thông báo hết và nút «Xem cũ hơn» quay lại; When lượt làm mới lỗi, Then hiện cả hai thông báo.
- AC-3: Given thông báo làm mới đang hiện, When người bấm «Thử lại» của nó, Then nút đó tắt trong lúc lượt làm mới chạy (bấm thêm không gọi chồng), và thông báo chỉ biến mất khi lượt làm mới đó thành công; lượt «Xem cũ hơn» thành công không làm nó biến mất.
- AC-4: Given tab Hoạt động có thông báo lỗi, When người đổi sang tab lọc khác, Then tab mới không mang thông báo của tab cũ (chỉ hiện thông báo khi chính truy vấn của tab mới có lỗi); When người quay lại tab cũ trong lúc truy vấn của nó vẫn đang lỗi trong bộ nhớ (chưa tới hạn tải lại), Then thông báo của tab đó hiện lại đúng loại.
- AC-5: Given các hành vi đơn lẻ K6c đã ký (một lỗi «Xem cũ hơn», một lỗi làm mới, thử lại, tiếng Anh, tải đầu lỗi, rỗng), When chạy lại các bài kiểm của `dong-thoi-gian-giu-khi-loi` và dòng thời gian của `kara-trang-thai-toan-crm`, Then tất cả vẫn xanh không sửa bài.

## Coverage

- Quét bằng `morphological-scan` (`_acceptance/dong-thoi-gian-loi-dung-luot/coverage-scan.md`), preset `test-matrix`.
- Trục A — lỗi đang hiện trước: không | xem cũ | làm mới [thước CE: hai thông báo của K6c — SUY-TỪ-REPO: `apps/app/components/crm/timeline/timeline.tsx`]
- Trục B — lượt kế tiếp: xem cũ | làm mới [thước CE: hai lối tải của `useInfiniteQuery` — SUY-TỪ-REPO; NGÀNH: TanStack Query «Infinite Queries»]
- Trục C — thời điểm quan sát: đang chạy | xong thành công | xong lỗi [thước CE: bảng trạng thái design doc mục 3]
- Ô «không lỗi trước» và các ô một lỗi đơn lẻ đã có ở K6c — AC-5 canh không hồi quy.
- Later: «Việc cần làm» lỗi, các khoảng hở đo của K6c — xem Out of scope.

## Đường đo

- Thước: 0 lần thông báo sai lượt hiện ra trong lúc đang tải, ở cả hai thứ tự chồng lỗi · số từ: bài DOM `apps/app/test/dong-thoi-gian-loi-dung-luot.dom.tsx` (treo từng lượt tải giữa chừng) · bảo đảm bởi: AC-1, AC-2
- Thước: lái thử người lạ gây hai lỗi chồng nhau mà không thấy thông báo nhảy qua lại · số từ: nhật ký vấp (khuôn `stranger-drive-template.md`) · bảo đảm bởi: đã có sẵn — nghi thức lái-thử của `/acceptance-gate:uat-session` §0

## Out of scope

- Truy vấn «Việc cần làm» của tab Tất cả (`pinned`) lỗi vẫn ẩn mục.
- Các khoảng hở đo đã ghi Known limits ở K6c (lỗi console của răng màn, dòng cuối số 35, vị trí thông báo «xem cũ», nút thử lại làm mới tắt khi tải — Ngoài-7 được phủ một phần ở AC-3).
- Chữ, vị trí và thành phần của hai thông báo — giữ nguyên K6c.

## Notes

- Vòng đời (luật 14): (1) Dọn thế nào — không đổi; (2) «Lịch sử» — không đổi; (3) Danh sách mặc định — không đổi.
- Giả định thiết kế: không lệnh nào ghi thẳng vào cache dòng thời gian (grep 0 chỗ) và không dùng `maxPages` — xem design doc.
- `timeline.tsx` nằm trong `paths` của hồ sơ đã ký `dong-thoi-gian-giu-khi-loi` và `kara-trang-thai-toan-crm`; AC-5 chạy lại đúng các bài của hai hồ sơ đó, và hai hồ sơ sẽ được ghim lại trước khi gộp.
