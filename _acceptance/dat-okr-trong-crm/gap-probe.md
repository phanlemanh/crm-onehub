---
slug: dat-okr-trong-crm
at: 2026-09-25T04:05:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
claims_input: ok
---

# Phản biện context sạch — dat-okr-trong-crm

Một agent tươi đọc đúng sáu file (design doc, contract, evals, sổ quyết định, bài học xuyên feature, hồ sơ cơ hội), không đọc code. Một lượt (one-pass); artifact đã sửa theo cột Xử lý, không re-probe.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-9 (cross-layer) và ba trạng thái hộp thoại nhập có trong design nhưng không eval ui-check nào mở hộp thoại; E9 tự ghép chuỗi `text` bằng tay, hộp thoại là writer duy nhất ngoài đời mà không round-trip [noi-zalo-cho-nguoi-moi#F1] | Hộp thoại ghép ô bằng dấu «;» trong khi máy chủ tách bằng tab → mọi dòng «thiếu KR», hoặc nút Ghi vẫn bật khi 0 dòng hợp lệ → trưởng bấm Ghi 3 lần → ngưỡng CHẾT «≥ 3 lượt nhập» sập ngay tuần 26/10; E9 và E11–E16 vẫn xanh | ui-check mở hộp thoại, dán lô 5 dòng có tab thật, đếm dòng hỏng và câu ghim, nút Ghi disabled khi 0 hợp lệ; script backend-effect đếm mục tiêu và vết sau Ghi | fixed: thêm E20 (ui-check, năm bước, hai chiều đỏ) và E21 (backend-effect qua API sau Ghi) cùng lần chạy `dok_man_chrome` |
| P1 | contract | Tab «Của tôi» (`/okr`, đích của mục rail, `okr.mine`, hai trạng thái trong design) và `okr.access` không có AC và eval nào | `okr.mine` bỏ mục tiêu tôi tham gia và KR tôi phụ trách trên mục tiêu người khác → người phụ trách KR bấm «Mục tiêu» thấy màn rỗng dù đang giữ 3 KR; mọi eval xanh; Cổng Phạm vi duyệt hợp đồng không có dòng nào cho màn đổ bộ | Ma trận 2 người × [số mục tiêu, tập id, số KR đánh dấu]; đối chứng `okr.byUnit` cho member trắng | fixed: thêm AC-16 (cross-layer) + E22 (`dok_cua_toi`, ma trận viết trước, chiều đỏ bỏ vế participant); E11 thêm hai bước mở `/okr` cho hai người; design mục 6 chốt ba vế của `okr.mine`; hợp đồng ghi chú 16 tiêu chí, một hơn trần |
| P1 | evals | E5 khoá pha chỉ 5/11 thủ tục ghi và chỉ pha chấm điểm trong khi AC-5 nêu cả đã đóng; E8 vết thiếu removeAlignment; design nói «mọi thủ tục ghi» để vết nhưng không chốt setProgram có để vết không | Người làm đặt kiểm pha ở 5 thủ tục E5 gọi, quên updateKeyResult → người phụ trách KR sửa số trong kỳ đã đóng, E5 xanh; removeAlignment không ghi vết → gỡ chỗ góp mất dấu, E8 đếm 9 vẫn đúng | Ma trận 11 thủ tục × 2 pha = 22 ô + đối chứng dương 11 ở pha đang chạy; E8 chuỗi 11 thủ tục kể cả gỡ căn chỉnh và ghi cấu hình | fixed: AC-5 nêu đích danh mười một thủ tục và hai pha; E5 ma trận 22 ô + đối chứng dương, chiều đỏ ở updateKeyResult; design mục 3 chốt setProgram để vết hành động `cau-hinh` (không thêm cột), applyImport để vết chỉ khi written > 0; E8 chuỗi 11 dòng (thêm gỡ căn chỉnh, ghi cấu hình), chiều đỏ ở removeAlignment |
| P2 | evals | E11 thiếu bước cho «lỗi máy chủ → Empty có Thử lại» và «đơn vị chưa có trưởng → câu gán trưởng»; bước «chưa mở chu kỳ» đo tham số lạ `ky=none` thay vì trạng thái không có chu kỳ; E12 chỉ đo «có nút Quay lại» (chuỗi-có-mặt) trong khi AC-11 hứa quay lại sheet Thoả thuận (quan hệ) | Nút Thử lại không tải lại, hoặc Quay lại đóng cả ngăn xếp → người dùng mất chỗ đang xem; E11/E12 xanh vì chỉ đếm nút | Chặn request `okr.byUnit` trả 500 rồi bỏ chặn và bấm Thử lại; fixture không chu kỳ thật; phòng ban không trưởng; sau Quay lại URL còn `record=deal:<id>` và tiêu đề là tên thoả thuận | fixed: AC-10 và AC-11 viết lại vế đó; E11 thêm bước 7–9 (không trưởng, chặn request + Thử lại, không chu kỳ với hai vai); E12 thêm bước Quay lại đo URL và tiêu đề, chiều đỏ đóng hết ngăn xếp |
| P2 | design | Đường đo «không nhập lại quá một lần» đếm vết `nhap-bang-tinh` nhưng design không nói lô written 0 có để vết không; AC-9 bỏ câu lỗi vượt trần ở chế độ chặn; opportunity giả định 3 còn ghi kiểu thứ sáu là «danh sách mốc» khác d-1 | Lô lặp bấm Ghi 3 lần → 3 dòng vết dù 0 dòng ghi → phiên R1 đọc «CHẾT» giả; hoặc lô bị trần chặn vẫn để vết; người ký thấy hai danh mục sáu kiểu khác nhau | Vết nhập chỉ khi written > 0; E9 lần hai đếm vết không đổi; ca capMode chặn | fixed: design mục 3 và 5 chốt «vết nhập chỉ khi written > 0» và «lô vượt trần ở chế độ chặn từ chối cả lô, không vết»; AC-9 thêm loại lỗi và vế «không thêm dòng vết»; E9(b) thêm hai ca; opportunity giả định 3 sửa «danh sách mốc» → «phần trăm» dẫn d-1 |
