---
slug: ma-tran-phai-co-chieu-song
at: 2026-09-12T15:10:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện context sạch — ma-tran-phai-co-chieu-song

Một phiên tươi, context sạch, chỉ đọc năm tệp: design doc · contract · evals ·
sổ quyết định · bài học từ feature trước. Không đọc mã repo.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | E3 điều 3 (hai sàn AST vẫn thoát 0 trên bản sao đã đột biến) là một assert ÂM TÍNH không có đối chứng dương, và không ghim cách suy gốc bản sao | Răng chạy hai sàn bằng đường tương đối từ thư mục phiên chứ không từ gốc bản sao, nên chúng đọc mã CHƯA đột biến, thoát 0, điều 3 xanh rỗng — và Cổng 1 duyệt lời chứng «mua một thứ không ai bán» chưa từng được đo | Trên CHÍNH bản sao đã đột biến, cắm thêm hình dạng cũ (ternary đọc `inputResponse` tại chỗ gọi) rồi đòi hai sàn ấy thoát KHÁC 0; ghim gốc bản sao suy từ vị trí script, in đường tuyệt đối đã chạy | fixed: E3 lên BỐN điều, điều 4 là đối chứng dương ấy |
| P0 | contract | AC-1 tuyên lời hứa LỚP trên một tập biến thể VIẾT TAY, không neo vào nơi giá trị sinh ra — tái phạm đúng lớp lỗi vòng này tồn tại để vá. Cite [do-quyen-luot-bang-hanh-vi#F1] | Máy chủ thêm biến thể thứ ba, bài đo vẫn dựng đúng hai hàng cũ, hai khối vẫn bằng nhau, cả năm eval xanh — và «chỗ bắt phải khai khi thêm biến thể thứ ba» mà sổ quyết định viện ra để chọn đường này thì không tồn tại | Sàn dân số: đọc bằng AST chính nơi máy chủ sinh `inputResponse`, đếm số nhánh, đòi bằng đúng số hàng bài đo dựng; đối chứng dương là cấy nhánh thứ ba vào bản sao rồi đòi mã 2 | fixed: thêm AC-6 + E6 |
| P1 | evals | Sàn AST của E4 khớp ĐÚNG MỘT cách viết (`toHaveLength` ngay trước `for...of` trên cùng mảng) — đo hình dạng chuỗi trong khi lời hứa là quan hệ | Phiên sau viết lại bằng `forEach` hoặc `it.each` kèm `toHaveLength(2)`, mỗi lượt chỉ assert riêng nó; E4 không khớp nên thoát 0 và chiều chết mọc lại nguyên vẹn dưới tên khác | Đối chứng dương phải cấy lại hình dạng cũ ở ba cách viết và cả ba đều cho mã 2 | fixed: E4 lên ba vectơ |
| P1 | contract | AC-5 liệt danh sách trắng sáu lệnh `dq_*` nhưng bỏ sót `ql_khong_suy_dien` — chính lệnh hợp đồng hai lần viện ra làm lý do khối `describe("suy-dien")` phải giữ tên | Vòng sửa thân khối ấy, `ql_khong_suy_dien` đỏ, nhưng E5 chỉ chạy sáu lệnh `dq_*` nên mọi eval vẫn xanh và `recheck: strict` ở Cổng 2 mới bắt — vòng trượt vì phép đo của hồ sơ khác, đúng điều AC-5 sinh ra để chặn | Liệt đích danh mọi lệnh của hai hồ sơ cũ có `paths` chạm `apps/agent/test/quyen-luot.spec.ts` | fixed: AC-5 lên chín lệnh, liệt đích danh |
| P1 | contract | Ô thứ tư của trục A — «suy từ một thuộc tính đã có sẵn» — không có AC nào phủ và cũng không nằm trong danh sách ô đã cắt | Ai đó cho cổng mở theo một thuộc tính ĐÃ CÓ trong khối (`hasTitle`, `purpose`): không khoá mới, không chữ `commandType`; hai khối vẫn bằng nhau từng byte nên E1 xanh, E2 chỉ biến thiên `commandType` nên xanh — và người duyệt đọc trục A như đã quét đủ | Hoặc thêm vectơ thứ hai cho E3, hoặc ghi ô ấy vào danh sách đã cắt kèm lý do và khai ở Giới hạn đã biết | fixed: ghi vào Out of scope + Giới hạn đã biết — hai biến thể mang `hasTitle`/`purpose` giống hệt nhau nên KHÔNG bài nào của vòng này đỏ được cho ô đó; giấu nó đi mới là nói dối |

## Ghi chú

Finding P0 thứ hai là finding tự chiếu: bộ artifact dựng ra để vá lỗi «tuyên
quét lớp mà chiều biến thiên chết» đã tái phạm đúng lớp ấy — lần này ở tập
biến thể chứ không ở chiều biến thiên. Nó được phát hiện bởi chính câu hỏi mà
bản luật bắt người soi phải hỏi.
