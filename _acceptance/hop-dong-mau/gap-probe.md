---
slug: hop-dong-mau
at: 2026-10-22T01:00:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

# Gap probe — hop-dong-mau

Phản biện ngữ cảnh sạch (tác tử `cham-doc`), đọc sáu tệp: design doc, `contract.md`, `evals.yaml`, `decisions.jsonl`,
`opportunity.md` và bài học từ tính năng trước (claim-scan). Một lượt, không chấm lại sau khi sửa.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Ba dòng sổ S1 (chặn bằng kiemDuocNap, chỉ thoả thuận mẫu, không đo Blob thật) ghi nguồn mục-tiêu nhưng câu trích chỉ liên quan, không quyết lựa chọn | Người ký tin ba lựa chọn do CLAUDE.md hay lộ trình buộc nên không cân lối khác | Đổi sang một-lối có lối chết nêu được, hoặc thành Hỏi | fixed: dòng chặn đổi sang một-lối (hai bản luật máy cục bộ đã lệch nhau một lần); loại bản ghi thành Hỏi-2; Blob thật thành Hỏi-3 — ba dòng supersedes |
| P1 | contract, evals | Không thước nào đo quan hệ giữa giá trị đáp án và chữ trong tệp; ô null của HD6 không đo | Đáp án đảo ngày tháng HD2 hay hết hạn HD2 lệch luật suy mà E1, E2 vẫn xanh, DA23 bị chấm sai | Bảng giá trị viết tay độc lập trong test, so với dap-an.json; đối chứng đảo ngày tháng | fixed: design doc mục 1 nay có bảng giá trị cụ thể và luật suy hết hạn; AC-2 thêm vế giá trị đáp án; E2 thêm 18 ô giá trị, ô suy hết hạn HD2, ô rò rỉ HD6 và đối chứng đảo ngày tháng |
| P1 | evals | E5 chỉ quét import của tệp vào; ca cho chạy gọi thẳng kiemDuocNap, không chạy lệnh | cau-hinh.ts import @crm/db làm Prisma nạp trước chặn; chan.ts của lệnh chặn nhầm máy cục bộ — E5 vẫn xanh | Đi cả đồ thị import tĩnh; ca cho chạy chạy tiến trình con | fixed: AC-5 thêm vế import bắc cầu và vế chính lệnh đi qua bộ chặn; E5 đi đồ thị import tĩnh có đối chứng dương, ca cho chạy chạy tiến trình con |
| P1 | contract, evals | Hỏi-1 không ghi lối khác đổi AC nào; E6 không đếm user và member | Người mẫu tạo trước bước kiểm kho tệp để lại hàng user, member mà E6 vẫn xanh | Ghi hệ quả lối khác vào Hỏi-1; E6 đếm user, member; đột biến tạo người trước kiểm | fixed: Hỏi-1 nêu lối khác thêm ca «workspace chưa có quản trị» vào AC-6; design doc nói người mẫu tạo sau mọi bước kiểm; AC-6 và E6 đếm người dùng, thành viên, thêm đột biến thứ hai |
| P2 | evals | Ca chạy dở của E4 chỉ tiêm lỗi ở PUT nên không sinh Blob mồ côi | Lệnh ngắt sau PUT thứ tư, trước complete; Blob mồ côi không ai dọn mà E4 vẫn xanh | Ca ngắt sau PUT trước complete, chạy lượt dọn DA19, đếm Blob | fixed: E4 có hai ca chạy dở, cả hai chạy lượt dọn qua hạn phiếu rồi đếm Blob |
