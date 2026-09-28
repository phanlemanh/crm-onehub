---
slug: kho-nguon-khoa-rieng
at: 2026-09-28T19:20:00Z
verdict: findings
p0: 0
p1: 1
p2: 3
---

# Gap probe — kho-nguon-khoa-rieng

Phản biện context sạch (subagent tươi, 5 input: design, contract, evals, decisions, claims).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | evals E1, E4 + contract AC-4 | AC-1 hứa rỗng và khoảng trắng là vắng, nhưng bảng viết trước chỉ 4 ô; ô trim không có kỳ vọng, không chiều đỏ [khep-ky-okr#F1] | Khoá dán lên Vercel kèm dấu cách: bat() thấy có, nút mở, mọi lượt ký hỏng; capabilities trim còn blob-nguon không, hai bên lệch; E1, E4 vẫn xanh | Bảng 6 ô x 2 = 12 kỳ vọng cho E1 và E4, chiều đỏ bỏ trim | fixed: E1, E4 thành 6 ô x 2 = 12 kỳ vọng kèm chiều đỏ «khoang trang tinh la co khoa»; AC-1, AC-4 nêu sáu ô |
| P2 | evals E6 | Phép thử store thật không tách được token đến từ biến nào; .env máy dev có thể giữ khoá private ở cả hai tên | Script đọc KHO rồi lùi BLOB vẫn xanh bốn bước; chiều đỏ không có dòng nào nên đỏ đúng câu | Lượt xanh ép BLOB_READ_WRITE_TOKEN giả; .env tạm của chiều đỏ có dòng BLOB giả | fixed: E6 ép BLOB giả trong lượt xanh, .env tạm chiều đỏ có dòng BLOB giả |
| P2 | evals E5 | docs/api.md và ghi chú .env.example đo bằng chuỗi-có-mặt; mục api.md đã có sẵn nên luôn xanh; thiếu vế «không gắn dự án» | api.md vẫn nói BLOB_READ_WRITE_TOKEN mà E5 xanh; ghi chú thiếu «không gắn», người dựng gắn store vào dự án, Vercel tự đặt khoá private vào tên logo | Cắt thân mục api.md, đòi có tên mới và không có tên cũ; ghim cụm «không gắn»; hai chiều đỏ | fixed: E5 cắt thân mục, ghim cụm «không gắn», thêm hai chiều đỏ; AC-5 nêu hai vế |
| P2 | contract Coverage trục B + evals | Đường agent đọc nguồn khi soạn (dispatch.ts) không eval nào phủ | dispatch.ts có chặn riêng bằng BLOB_READ_WRITE_TOKEN hay blobEnabled, production chỉ đặt KHO: agent bỏ qua mọi nguồn, E1..E7 xanh | Quét tĩnh mọi tệp agent gọi khoNguonVercel, in số tệp, chiều đỏ trên bản sao dispatch.ts | fixed: E5 quét apps/agent/agent/** gọi khoNguonVercel, in N tệp > 0, chiều đỏ «agent doc nguon con doc khoa logo»; AC-5 và Coverage trục B nêu đường agent |
