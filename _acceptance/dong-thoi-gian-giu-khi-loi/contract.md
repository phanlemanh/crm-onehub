---
schema_version: 1
feature: «Dòng thời gian giữ các hoạt động đã tải khi «Xem cũ hơn» hay làm mới ngầm bị lỗi» — lỗi sau khi đã có dữ liệu không thay danh sách bằng khung lỗi; thông báo tại chỗ kèm «Thử lại» tải đúng phần hỏng
slug: dong-thoi-gian-giu-khi-loi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
design_doc: docs/superpowers/specs/2026-10-08-dong-thoi-gian-giu-khi-loi-design.md
approved_by:
approved_at:
---

# Acceptance Contract: dong-thoi-gian-giu-khi-loi

## Context

Hàng K6c của đợt `sau-14-10`, dãy P2, sau K6b `kara-trang-thai-toan-crm` (#314). Ngoài-1 và Ngoài-5 của K6b (cùng
một lỗi), anh chọn «mở hợp đồng mới» ở Cổng 2 2026-10-08T07:13:17Z — luật 26 coi đó là Cổng Đáng `build`. K6b đưa
khung «Không tải được hoạt động» vào dòng thời gian, nhưng rẽ nhánh theo `isError` trước khi xét dữ liệu đã có, nên
lượt «Xem cũ hơn» hay lượt làm mới nền hỏng cũng thay cả danh sách bằng khung lỗi, và «Thử lại» tải lại từ trang đầu.
Không đổi API.

## Criteria

- AC-1: Given tab Hoạt động của một ngăn bản ghi đã hiện trang đầu và còn trang cũ hơn, When người bấm «Xem cũ hơn» mà truy vấn trang kế trả lỗi, Then các hoạt động đã hiện vẫn nguyên (cùng số dòng, cùng thứ tự), không hiện khung «Không tải được hoạt động» trọn vùng, không hiện trạng thái rỗng, không in thông điệp lỗi thô; cuối danh sách, ở chỗ nút «Xem cũ hơn», hiện thông báo «Không tải được hoạt động cũ hơn.» kèm «Thử lại», thông báo mang `role="alert"`.
- AC-2: Given thông báo của AC-1, When người bấm «Thử lại», Then truy vấn dòng thời gian được gọi đúng một lần với `cursor` của trang cuối đã tải và trang đầu không bị gọi lại; trong lúc đang tải, «Thử lại» bị tắt nên bấm thêm không gọi chồng; thành công thì các hoạt động cũ hơn nối vào cuối, thông báo biến mất và «Xem cũ hơn» quay lại khi còn trang (bấm nó tải trang kế theo cursor mới); lỗi lần nữa thì thông báo vẫn đó và danh sách vẫn nguyên.
- AC-3: Given tab Hoạt động đã tải xong — có danh sách, hoặc đang ở trạng thái rỗng của tab — When một lượt làm mới nền của dòng thời gian trả lỗi, Then danh sách đang hiện (hoặc trạng thái rỗng) vẫn nguyên; phía trên nó hiện «Không làm mới được hoạt động. Đang hiện bản đã tải.» kèm «Thử lại» (`role="alert"`); bấm «Thử lại» gọi lại truy vấn dòng thời gian, thành công thì thông báo biến mất và vùng theo dữ liệu mới.
- AC-4: Given tab Hoạt động, When lần tải đầu trả lỗi (chưa có trang nào), Then vẫn hiện khung «Không tải được hoạt động» kèm «Thử lại» như AC-1 của `kara-trang-thai-toan-crm`; When tải xong mà không có mục nào, Then vẫn hiện trạng thái rỗng của tab — K6c không đổi hai trạng thái này.
- AC-5: Given giao diện tiếng Anh, When thông báo của AC-1 hay AC-3 hiện, Then chữ là bản tiếng Anh lấy từ tệp chữ `crm.ts` (cặp en/vi do messages-guard giữ), không còn ký tự tiếng Việt có dấu trong thông báo.
- AC-6: Given bản chạy thật của cây này với một cá nhân có hơn một trang hoạt động, ảnh khổ 1440 và 390 của tab Hoạt động sau khi lượt «Xem cũ hơn» bị chặn, When một người không làm lượt này đọc ảnh, Then họ thấy danh sách hoạt động còn nguyên kèm thông báo không tải được phần cũ hơn và «Thử lại» ở cuối — không phải khung lỗi thay cả danh sách — và ở 390 không có gì tràn ngang. Thông báo làm mới của AC-3 dùng cùng thành phần và chỉ đo bằng bài DOM (không chụp ảnh). (judgment)

## Coverage

- Quét bằng `morphological-scan` (`_acceptance/dong-thoi-gian-giu-khi-loi/coverage-scan.md`), preset `test-matrix`.
- Trục A — lối tải của truy vấn vô hạn: tải trang đầu | tải trang kế («Xem cũ hơn») | làm mới nền [thước CE: cờ trạng thái của TanStack Query v5 `isLoadingError` / `isFetchNextPageError` / `isRefetchError` — SUY-TỪ-REPO: `@tanstack/react-query` trong `apps/app/package.json`; NGÀNH: TanStack Query «Infinite Queries»]
- Trục B — kết cục: thành công | lỗi | thử lại thành công | thử lại lỗi lần nữa [thước CE: bảng trạng thái của design doc mục 3; NGÀNH: Nielsen Norman Group Error-Message Guidelines (lỗi phải nhìn thấy, giữ việc người dùng đang làm)]
- Trục C — khổ × ngôn ngữ: 1440 tiếng Việt | 390 tiếng Việt | tiếng Anh — 1440/390 đo ở AC-6, tiếng Anh ở AC-5.
- Ô giữ nguyên (không phải tiêu chí mới): tải trang đầu lỗi và rỗng thật — AC-4 canh không hồi quy.
- Later: truy vấn «Việc cần làm» lỗi, số đếm tab lỗi, cuộn vô hạn — xem Out of scope.

## Đường đo

- Thước: lái thử người lạ chặn «Xem cũ hơn» và lượt làm mới ở dòng thời gian, danh sách luôn còn nguyên kèm thông báo và «Thử lại» · số từ: nhật ký vấp của nghi thức lái thử (khuôn `stranger-drive-template.md`) · bảo đảm bởi: đã có sẵn — nghi thức lái-thử của `/acceptance-gate:uat-session` §0
- Thước: 0 lần trang đầu bị gọi lại khi «Thử lại» sau lỗi «Xem cũ hơn» · số từ: bài DOM `apps/app/test/dong-thoi-gian-giu-khi-loi.dom.tsx` · bảo đảm bởi: AC-2

## Out of scope

- Truy vấn «Việc cần làm» của tab Tất cả (`pinned`) lỗi vẫn im lặng ẩn mục.
- Số đếm trên tab lỗi vẫn ẩn số.
- Hoạt động trên website làm mới hỏng (Ngoài-2 của `kara-trang-thai-toan-crm`, đã ghi Known limits).
- Tự tải khi cuộn tới cuối danh sách.

## Notes

- Vòng đời (luật 14, `docs/vong-doi.md` «ba câu»): (1) Dọn thế nào — không đổi; (2) «Lịch sử» — không đổi, dòng thời gian vẫn là lịch sử hoạt động; (3) Danh sách mặc định — không đổi.
- `timeline.tsx` nằm trong `paths` của E1 thuộc hồ sơ đã ký `kara-trang-thai-toan-crm`; AC-4 giữ đúng hành vi E1 đo, và hồ sơ đó sẽ được ghim lại trước khi gộp.
- Bộ dựng thử chung `apps/app/test/khung-gop-y.tsx` chuyển `pageParam` thành `cursor` (yêu cầu P2-26) để đo AC-2.
