---
slug: viec-cha-khong-lo-tieu-de
at: 2026-10-14T06:57:02Z
verdict: findings
p0: 1
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Ẩn con người xem không thấy khỏi số trên thẻ cha kéo theo mất hộp hỏi lại khi đóng cha — đánh đổi riêng tư với cảnh báo là nghĩa sản phẩm, sổ ghi máy quyết (dòng d-2 chỉ quyết việc gộp) [kanban-viec#F2] | Người giao kéo cha sang Xong không được nhắc dù việc con riêng của người khác còn mở; chủ kho muốn giữ một dạng nhắc thì phải viết lại AC-4, E4 sau khi ký | Dòng sổ chỉ-người-biết + vế Then của AC-4 nói rõ không có hỏi lại và con giữ trạng thái | human-gate1: thêm Hỏi-1 (khuyên không đếm, không nhắc — cùng khung việc từ DA2 và luật 404); AC-4 thêm vế A đổi P3 sang Xong thành công, con giữ trạng thái; E4 đo bằng viec.doiTrangThai thật và đọc lại K4 bằng Prisma |
| P1 | evals | Không eval nào đo màn hình ở tổ hợp việc mang chaId mà cha null | Giao diện rẽ theo chaId, vẫn hiện dòng Thuộc hoặc liên kết tới P; E1–E5 xanh | Ca DOM rút dữ liệu từ đầu ra thật của viec.bang, viec.con | rejected: đầu ra viecBangOutput, viecConOutput không mang chaId (viecRa chọn trường tường minh), nên giao diện không có gì để rẽ ngoài cha; vế lộ mã P ở bất kỳ trường nào được E6 quét trên toàn JSON |
| P1 | contract | Chỉ đo trường cha của hai câu đọc trong khi ngưỡng phủ mọi kênh C xem K (viec.get, lịch sử, mã cha trên hàng) | Khung K vẫn lộ tiêu đề hay mã P qua câu đọc khác; máy xanh mà có báo cáo — đường CHẾT của ô cơ hội | Quét mọi câu đọc viec.* C chạm được, assert không chứa chuỗi đánh dấu và mã P, có đối chứng dương | fixed: thêm AC-6 và E6 — mảng sáu câu đọc viết sẵn (get, lichSu, con, bang, cuaToi, cuaBanGhi), đếm đủ 6, đối chứng trước khi gỡ gắn |
| P2 | evals | Fixture E3, E4 không có con Huỷ nên vế lọc Huỷ của E4 không bao giờ chạy | Bản sửa vô tình đếm con Huỷ vào tong trên thẻ; E4 vẫn xanh | Thêm con Huỷ vào fixture, đối chứng viec.con có con Huỷ | fixed: fixture thêm K5 Huỷ; E3 đếm chaId = 4; E4 ném 'vca: fixture thieu con huy' khi viec.con không có con Huỷ |
