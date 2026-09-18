---
slug: go-thanh-vien-phai-giu-duoc
at: 2026-09-18T09:30:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals + design | AC-2 hứa «phiên MẤT QUYỀN trong 0 giây» nhưng E2 chỉ đòi hiệu số dòng bảng session bằng 2 — đo khâu trung gian, không đo đầu ra tiêu chí hứa. Cite [d-20260918T031539Z-11] | Mọi lớp đệm giữa token người kia cầm và dòng trong bảng làm hai mệnh đề tách nhau. removeMember xoá đúng 2 dòng, E2 xanh, mà lượt gọi mang token cũ vẫn qua suốt TTL của lớp đệm. Con số «0 giây» in ra hồ sơ là sai và không phép đo nào bắt được | Mint phiên bằng đường thật rồi hỏi `auth.api.getSession` với cookie của chính phiên ấy; hiệu số dòng hạ xuống làm khẳng định phụ | fixed: E2 viết lại — hỏi đúng cửa ứng dụng hỏi, hai chiều trên cùng phiên, cộng đối chứng dương phiên người khác |
| P1 | contract + evals | AC-1 là lời hứa LỚP nhưng E1 đo đúng MỘT thủ tục, không ma trận toàn phần. Cite [ma-tran-phai-co-chieu-song#F2] | Người sau thêm một thủ tục quản trị quên lưới quyền; E1 vẫn xanh vì chỉ hỏi `allowances()` | Ma trận trên tập thủ tục quản trị, mỗi thủ tục một hàng, số assert bằng số hàng | fixed: E1 thành ma trận SÁU thủ tục, MƯỜI HAI assert hằng; giới hạn «thủ tục thêm sau không tự vào ma trận» ghi vào Known limits |
| P1 | contract + evals | AC-3 cũ chồng lấn eval đã ký: vế lời mời chính là `cp_chu_cuoi_cung`, vế danh sách là hệ quả `cp_go_tron_ven` đã canh. Và `feature` ghi «ba chỗ» trong khi có bốn AC | Người ký duyệt theo cam kết «không tạo eval trùng», tới S4 người soi đối chiếu và kết luận E3 trùng — hồ sơ trượt vì chính điều khoản của nó | Đặt cạnh nhau từng khẳng định của E3 và của hai eval đã ký; giữ phần không trùng hoặc bỏ AC | fixed: BỎ hẳn AC-3 cũ, ghi lý do vào Out of scope; hồ sơ còn ba tiêu chí, khớp đúng câu tiêu đề |
| P1 | evals | E4 khai cảnh «bảng rỗng + lời mời kết thúc» mà không nói cữ liệu dựng ra sao; luật «dựng qua thủ tục thật» không áp được cho chính bài quan trọng nhất. Cite [ma-tran-phai-co-chieu-song#F2] | Bài ghi tay một dòng `TRANG_THAI_HUY` rồi xoá tay thành viên; bản sửa lọc đúng giá trị ấy nên bài xanh, trong khi lượt gỡ thật ghi giá trị khác và người bị gỡ vẫn thành owner | Dựng trạng thái bằng chính `removeMember` rồi đọc lại giá trị đã ghi; một hàng cho mỗi trạng thái kết thúc trong hằng có tên | fixed: E3 mới đưa người qua lượt gỡ thật rồi đọc lại giá trị; ma trận trên mọi trạng thái kết thúc; bước tay duy nhất được khai rõ |
| P2 | contract + evals | AC-3 cũ mở bằng «Given màn quản trị» mà không artifact nào ghim rằng màn ấy đọc đúng hai thủ tục E3 gọi | Màn lấy danh sách qua đường khác; E3 xanh trên hai thủ tục không ai đọc, người bị gỡ vẫn hiện trên màn | Khẳng định tĩnh ghim nguồn dữ liệu của trang, hoặc sửa câu Given thành tên thủ tục | fixed: moot — AC-3 cũ đã bỏ theo mục P1 phía trên |
