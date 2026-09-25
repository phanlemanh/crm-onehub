---
slug: vai-chi-okr
at: 2026-09-24T16:40:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
claims_input: ok
---

# Phản biện context sạch — vai-chi-okr

Một agent tươi đọc đúng sáu file (design doc, contract, evals, sổ quyết định, bài học xuyên feature, hồ sơ cơ hội), không đọc code. Một lượt (one-pass); artifact đã sửa theo cột Xử lý, không re-probe.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals (E9) + contract (AC-8) | AC-8 hứa ứng dụng không dựng tường xin quyền hộp thư, nhưng E9 chỉ đo hai hàm thuần; chỗ nối `requireMailboxAccess` đọc vai rồi truyền vào hàm không eval nào đo; thiếu tag cross-layer — đúng khuôn [noi-zalo-cho-nguoi-moi#F1] | Người làm sửa hai hàm, nhưng chỗ nối vẫn gọi hàm không truyền vai; E9 xanh, cả bộ xanh; người vai chỉ OKR đăng nhập Google bị đẩy tới màn xin quyền hộp thư — đúng vế CHẾT thứ hai của hồ sơ cơ hội | Eval gọi chỗ nối thật với cơ sở dữ liệu thật: okr → không cần cấp; member → cần | fixed: AC-8 gắn (cross-layer); design tách chỗ nối thành `hopThuCanCap(userId)`; thêm E9b (layer backend-effect, `vco_tuong_hop_thu`) đo chỗ nối với cơ sở dữ liệu thật, chiều đỏ là chỗ nối không truyền vai |
| P1 | evals (E1, E2, E3) | Ma trận gọi mọi mutation bằng POST đầu vào rỗng; mutation không schema đầu vào chạy thật giữa bài; không khẳng định tư cách người gieo còn nguyên sau ma trận | Một mutation không đầu vào đổi tư cách giữa bài → các hàng sau lệch mã → đỏ giả hoặc xanh giả tuỳ thứ tự; E3 chạy mọi mutation không đầu vào trên cơ sở dữ liệu của lượt kiểm | Bài in danh sách mutation không đầu vào (số ghim), query trước mutation, kết bài `workspace.get` vẫn đúng vai | fixed: E1, E2, E3 khai thứ tự query→mutation, in danh sách mutation không đầu vào với số ghim, và khẳng định cuối bài `workspace.get` của người gieo vẫn 200 với đúng vai |
| P1 | contract (giả định 3) + evals | Giả định «thủ tục ghi ở phạm vi chung đã đòi quản trị» là căn cứ xếp bảy router vào chung nhưng không eval nào gửi đầu vào hợp lệ tới service | Một thủ tục ghi ở chung chỉ kiểm tư cách, không kiểm quản trị; bộ đo xanh vì không bài nào gửi đầu vào hợp lệ; ngày mở cửa, người vai chỉ OKR sửa được cấu hình hệ thống | Eval liệt kê mọi mutation của các alias chung, gửi đầu vào hợp lệ, tập không bị 403 so bằng tập tự phục vụ viết trước | fixed: soát mã cho thấy ba thủ tục ghi của `settings` hôm nay KHÔNG đòi quản trị (giả định sai một phần); thêm AC-12 + E15 (`vco_ghi_chung`, tập tự phục vụ so bằng), design thêm `canManageSettings`, giả định 3 viết lại nói rõ chỗ sót, sổ quyết định thêm dòng d-11 |
| P1 | design + contract (Trục A) + evals | Trục A dựa trên router; không artifact nào liệt kê đường HTTP ngoài hai cửa đó (controller Nest, Better Auth) và không eval nào rút danh sách đó lúc chạy cho phiên okr | Một controller ngoài tRPC trả dữ liệu đối tác chỉ hỏi tư cách thành viên; E1/E2 xanh vì đường không nằm trong sổ router; ngưỡng SỐNG đếm nhật ký tRPC nên cũng không thấy | Eval rút mọi route của Express lúc chạy, trừ tRPC và REST, tập 2xx cho cookie okr so bằng tập viết trước | fixed: soát mã cho thấy các controller hiện có không trả dữ liệu đối tác cho người có phiên (internal gác bí mật, attachments chỉ của mình); thêm AC-13 + E16 (`vco_duong_ngoai_router`) ghim tập 2xx, Trục A thêm ô «đường HTTP ngoài router», design thêm mục tương ứng |
| P2 | design (mục 4) + evals (E11) | Không kiểm kê lời gọi của khung ứng dụng chạy trên mọi trang; E11 chỉ đo chữ trên màn và lỗi hydrat, không đo request | Một thành phần khung gọi router đối tác khi mount; người vai chỉ OKR thấy toast 403 ở mọi màn; ảnh chụp sạch, E11 xanh | E11 đếm request tới tRPC có alias phạm vi đối tác trên ba màn của okr, phải bằng 0 | fixed: E11 thêm bước đếm request và khẳng định 0 alias đối tác, 0 phản hồi 403, in danh sách alias; design mục 4 thêm đoạn «khung ứng dụng không gọi đối tác cho vai này» |

Ghi chú của agent, không tính finding: vế ngưỡng đăng nhập ≥ 90 % còn tiền tố đề xuất ở cả hồ sơ cơ hội lẫn hợp đồng — là quyết định của người ký ở Cổng Phạm vi, không phải lỗ hổng đo.
