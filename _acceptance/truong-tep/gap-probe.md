---
slug: truong-tep
at: 2026-10-21T14:50:00Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

# Phản biện context sạch — truong-tep

Một tác tử tươi (`feature-loop:cham-doc`) đọc design doc, hợp đồng, evals, sổ quyết định, bài học xuyên tính năng
(`claim-scan`, 12 dòng) và ô cơ hội. Không đọc mã. Không có finding nào dựa vào một claim.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ d-9 bỏ ô Tệp khỏi form tạo bằng nguồn một-lối, trong khi docs/design.md mục «Trường» ghi form tạo của Tệp là kéo thả NguonKeoTha; lối «tạo bản ghi rồi tải lên id mới» còn sống | Cổng Phạm vi duyệt AC-9 «form tạo không có ô Tệp», DA16 hay chủ kho đối chiếu bảng kiểu thì thấy Tệp lệch luật đích, phải viết lại sau khi ký | dòng sổ thay d-9 nguồn chỉ-người, hợp đồng ghi lệch có chủ ý | fixed: dòng sổ mới thay d-9 thành Hỏi-6 (chỉ người, khuyến nghị lệch có chủ ý + hạt giống sau DA16); AC-9 và E9b(c) theo lối đã duyệt; Known limits ghi lệch |
| P0 | design | Sổ d-3 rút blob-nguon.ts của Kho tài liệu thành nhà máy chung, câu trích AGENTS.md chỉ liên quan không quyết, và việc chạm tính năng đang chạy production | Nhà máy đổi một tham số ký của Kho tài liệu, bốn bài cũ vẫn xanh, Kho tài liệu hỏng tải nguồn trên production mà không ai duyệt rủi ro | dòng sổ thay d-3 nguồn chỉ-người, hoặc E8b chứng mỗi đột biến làm bài cũ đỏ | fixed: dòng sổ mới thay d-3 thành Hỏi-7, khuyến nghị viết riêng không sửa tệp nào của Kho tài liệu; E8b đo git diff rỗng trên danh sách tệp Kho tài liệu viết sẵn, có cặp hai chiều |
| P0 | contract | Nhiều mục Out of scope không có dòng descope; quét mã độc là rủi ro khi lên mà không ai quyết | Một DOCX có macro do nhân viên tải lên được quản trị mở; chưa người nào chấp nhận rủi ro | mỗi mục Out of scope một dòng descope, quét mã độc nguồn chỉ-người | fixed: thêm dòng descope cho DA20, DA23, DA22, xem trước/đổi tên/sắp lại/sort, HEIC/XLSX/ZIP; quét mã độc thành Hỏi-8 (khó đảo, khuyến nghị để sau); thêm vào AC-3 từ chối DOCX chứa word/vbaProject.bin |
| P1 | design | TepTrongO không có cờ coTheMo, coTheXoa; không eval backend đo cờ theo vai và người tải; E4b dựng cờ bằng tay; không eval UI đo nút Xoá theo Hỏi-2 | Máy khách tự so người tải, hoặc hiện Xoá cho mọi người; N2 bấm Xoá trên tệp của N1 nhận FORBIDDEN, mọi eval vẫn xanh | cờ do máy chủ tính, E4 đo ma trận cờ, E4b thêm ô coTheXoa | fixed: design thêm coTheMo, coTheXoa vào TepTrongO do máy chủ tính; AC-4, AC-6 đòi hai cờ; E4 thêm 4 ô cờ trong byId; E4b thành 12 ô (3 trạng thái × 4 cặp cờ), đầu vào rút qua schema TepTrongO thật |
| P1 | evals | E2b skipIf cờ, exit 0 khi 0 bài chạy | Khoá chưa về hoặc cờ không đặt, E2b xanh rỗng, Cổng Bằng chứng ký vế kho riêng tư thật | expected đòi 0 skip và số bài đạt | fixed: expected của E2b đòi stdout '0 skip' và ít nhất 3 pass, exit 0 với bài bị bỏ là không đo được; lệnh của eval đặt sẵn cờ |

Hai chỗ phụ tác tử nêu ngoài bảng, đã xử lý:

- Cỡ tệp chỉ kiểm theo cỡ người gọi khai: `complete` nay kiểm cỡ byte thật (design mục 3); E3 thêm ô «khai 1 MB, PUT
  20 MB + 1 byte» (ma trận 16 ô).
- Số dòng `fields.ts:98` và `:118` lệch giữa các tệp: `:98` là đầu hàm `coerceValue`, `:118` là câu `switch` — cả hai
  đúng; giữ nguyên.

Không chạy lại phản biện sau khi sửa (một lượt, theo nghi thức).
