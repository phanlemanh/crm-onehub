---
slug: nop-ban-nhap-chon-theo-khoa
at: 2026-10-04T02:20:00Z
verdict: findings
p0: 0
p1: 2
p2: 2
---

# Gap probe: nop-ban-nhap-chon-theo-khoa

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | evals | AC-5 cũ hứa phép quét đủ bốn chỗ nhưng không eval nào đo; E4 chỉ có một tệp spec trong inputs | Một spec khác trong packages/*/test có orderBy createdAt nhiều dòng; hội đồng không thấy, E4 PASS | Eval script quét bằng regex chịu xuống dòng, so danh sách cố định, chiều đỏ có đối chứng | fixed: thêm AC-5 mới + E5 (rang/quet-mau.mjs) — 3 chỗ sau sửa cùng tệp spec; chiều đỏ trong bộ nhớ trả bộ chọn cũ phải đếm 4; lập luận chuyển sang AC-6 |
| P1 | evals | Câu (3) của E4 dựa trên tiền đề khoá bản nháp duy nhất, mà chỗ cưỡng chế nằm ngoài inputs | Hội đồng chép lời design rồi PASS suông, hoặc kẹt cổng | Thêm tệp cưỡng chế vào inputs, hoặc eval test trùng khoá | fixed: kiểm thật thì schema banNhap KHÔNG chặn trùng khoa — design sửa, lập luận nay đứng trên khoá phụ id của docDaQuyet; okr-cuoc-soan.ts vào inputs E4; khe trùng khoá ghi Out of scope + sổ descope |
| P2 | evals | E2 khớp tên mới bằng includes trên toàn log — quan hệ «tên gắn vào m1» thành chuỗi-có-mặt | Tên xuất hiện ở vế expected hay đoạn mã bun in, E2 báo đúng chữ ký sai | Khớp trên dòng vế received của diff | fixed: răng khớp regex trên dòng bắt đầu «+» cho cả "giu": [] lẫn tên mới |
| P2 | design | Khối bộ chọn răng khớp từng byte không được ghim; khối chiều đỏ viết tay | Biome định dạng lại hay người cài viết khác chữ, E1/E2 mã 2; chiều đỏ tái hiện bộ chọn khác bộ đã đỏ | Ghim nguyên văn; rút khối đỏ từ merge-base | fixed: design ghim nguyên văn cả hai khối (khối cũ chép từ onehub 0b8540c1 dòng 503–506); không rút từ git merge-base vì neo đó hết hạn sau khi merge |
