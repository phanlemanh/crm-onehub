---
schema_version: 1
feature: «Đã lưu trữ» ở Cài đặt › Giai đoạn báo lỗi tải và cho thử lại thay vì biến mất
slug: da-luu-tru-tai-loi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-08T09:07:14Z
design_doc: docs/superpowers/specs/2026-10-08-da-luu-tru-tai-loi-design.md
---

# Acceptance Contract: da-luu-tru-tai-loi

## Context

Khi tải danh sách giai đoạn đã lưu trữ (`giaiDoan.archived`) lỗi, khối «Đã lưu trữ (n)» ở Cài đặt › Giai
đoạn biến mất — trông như không có giai đoạn nào đã cất — và lúc đang tải cũng không hiện gì. Vòng này cho
khối hiện lỗi tải kèm «Thử lại» và khung xương lúc đang tải, theo mục «Trạng thái» của `docs/settings.md`.

Source input: Ngoài-3 và Ngoài-5 của `danh-sach-keo-chung` (Cổng Bằng chứng 2026-10-08, «mở hợp đồng mới»);
`_acceptance/da-luu-tru-tai-loi/opportunity.md` (Cổng Đáng `build` theo luật 26 của đợt sau-14-10).

## Criteria

- AC-1: Given quản trị viên mở Cài đặt › Giai đoạn và `giaiDoan.archived` trả lỗi, When trang tải xong, Then ở chỗ của «Đã lưu trữ» có khung `Empty` viền liền mang tiêu đề «Không tải được danh sách giai đoạn đã lưu trữ», câu «Kiểm tra kết nối rồi thử lại.» và nút «Thử lại»; ba thẻ nhóm giai đoạn vẫn hiện đầy đủ, tay kéo mở, và lưu trữ một giai đoạn trống vẫn gọi `giaiDoan.archive` đúng một lần.
- AC-2: Given khung lỗi đang hiện, When bấm «Thử lại» và lần tải lại trả hai giai đoạn đã lưu trữ, Then khung lỗi biến mất và mục gập «Đã lưu trữ (2)» hiện; lần bấm gọi lại `giaiDoan.archived` đúng một lần và không gọi lại `giaiDoan.list`.
- AC-3: Given khung lỗi đang hiện, When bấm «Thử lại», Then trong lúc đang tải lại khung lỗi vẫn hiện (không đổi sang khung xương) và nút «Thử lại» khoá; When lần tải lại vẫn lỗi, Then khung lỗi còn, nút mở lại, bấm tiếp thì gọi lại lần nữa.
- AC-4: Given `giaiDoan.archived` đang tải (chưa trả), When trang hiện, Then ở chỗ của «Đã lưu trữ» có một khung xương; When trả về danh sách rỗng, Then không có khối nào (như trước vòng này).
- AC-5: Given người không phải quản trị viên và `giaiDoan.archived` trả lỗi, When mở trang, Then vẫn thấy khung lỗi và bấm «Thử lại» được (đọc không bị khoá theo quyền).
- AC-6: Given app thật, When trình duyệt trả lỗi cho yêu cầu `giaiDoan.archived` rồi mở Cài đặt › Giai đoạn ở khổ 1440 và 375, Then sau khi cuộn tới cuối trang, khung lỗi và nút «Thử lại» không tràn ngang khung nhìn, và ba thẻ nhóm vẫn hiện (không phải lỗi của cả trang); When ở 1440 bấm «Thử lại» trong lúc yêu cầu tải lại còn treo, Then khung lỗi còn và nút khoá; When thả yêu cầu thành công, Then mục gập «Đã lưu trữ (n)» hiện mà trang không tải lại.
- AC-7: (kiểm không hồi quy) Given bài kiểm `giai-doan-cai-dat.dom.tsx` của `danh-sach-keo-chung`, When chạy lại sau thay đổi, Then thoát 0 không sửa kỳ vọng; và tệp giao diện vòng này sửa không vi phạm P0 của sàn thiết kế.

## Coverage

Quét bằng `morphological-scan` preset test-matrix (S1, 08/10).

- Trục A — Kết cục tải: đang tải | lỗi | thử lại thành công | thử lại vẫn lỗi | rỗng [thước CE: bốn trạng thái của `docs/settings.md` mục «Trạng thái»]
- Trục B — Vai: quản trị viên | không quản trị [thước CE: `canManage` của `giaiDoan.list`]
- Trục C — Khổ: 1440 | 375
- Core → AC: lỗi (AC-1) · thử lại được (AC-2) · thử lại vẫn lỗi (AC-3) · đang tải và rỗng (AC-4) · không quản trị (AC-5) · màn thật hai khổ (AC-6) · hồi quy và sàn thiết kế (AC-7).
- Later: trạng thái lỗi trong `ArchivedList` dùng chung cho mọi nơi.
- Never: gộp danh sách đã lưu trữ vào `giaiDoan.list`.

## Đường đo

- Thước: người thử thấy lỗi ở chỗ «Đã lưu trữ», bấm thử lại và thấy danh sách, 0 lần hỏi · số từ: phiên nghiệm thu (`uat-session`) trên production; người điều phối chặn URL chứa `giaiDoan.archived` trong DevTools (Network request blocking) của máy thử trước khi giao máy, không báo trước, rồi bỏ chặn khi người thử tìm cách lấy lại danh sách; câu hỏi sau phiên đếm số người kết luận «không có giai đoạn nào đã lưu trữ» · bảo đảm bởi: AC-1, AC-2, AC-6
- Thước: không còn khối biến mất khi lỗi hay đang tải · số từ: bài DOM `da-luu-tru-tai-loi` · bảo đảm bởi: AC-1, AC-4

## Out of scope

- Trạng thái lỗi trong `ArchivedList` của `packages/ui` (mọi nơi dùng).
- Lỗi của chính `giaiDoan.list` (đã có `Empty` có nút thử lại từ `giai-doan-thoa-thuan`).
- Khôi phục bị chặn (đã có ở `danh-sach-keo-chung` AC-9).

## Notes

- Không đổi API, không migration. Nhánh xếp chồng trên `feat/danh-sach-keo-chung` (#311 chưa gộp).
- Đường nền đo xanh trên `cf003458` (đỉnh E3, 2026-10-08T08:55:54Z).
