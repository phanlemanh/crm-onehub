---
schema_version: 1
slug: tim-trong-phan-khuc
feature: Ô tìm trong trang thành viên chiến dịch phải tìm TRONG phân khúc, không thay thế phân khúc
owner: omre.cnsp4@onemount.com
stage: decided
decision: park
decided_by: Phan Le Manh
decided_at: 2026-10-31T09:52:29Z
---

## Vấn đề & ai gặp

Trang thành viên của một chiến dịch hiện danh sách người rút từ góc nhìn đã lưu — đó
là định nghĩa của phân khúc. Khi nhân viên tiếp thị gõ từ khoá vào ô tìm trên trang đó,
ô tìm **thay hẳn** bộ lọc gốc thay vì thu hẹp trong phạm vi nó.

Hệ quả người dùng thấy: cá nhân KHÔNG thuộc phân khúc xuất hiện trong danh sách, được
gọi, và lượt gọi đó bị ghi vào chiến dịch. Số liệu tỷ lệ trả lời của chiến dịch từ đó
lẫn người ngoài đối tượng nhắm tới — mà chính tỷ lệ đó là thứ AC-6 hứa dùng để so
phân khúc này với phần còn lại.

**Người trả giá:** đội tiếp thị (gọi nhầm người, tốn lượt gọi) và người đọc số
(tỷ lệ trả lời của chiến dịch không còn là tỷ lệ của phân khúc).

**Xuất xứ:** rà soát đối kháng ở Cổng Bằng chứng của hồ sơ `tiep-thi-tuyen-doi-tac`,
mục **Ngoài-13**, mức cao. Người ký chọn «mở hợp đồng mới» ngày 2026-09-05 thay vì ghi
vào giới hạn đã biết, vì mục này đổi thứ người dùng thấy chứ không chỉ đổi tốc độ.

## Hướng chưa quyết

Câu phải trả lời trước khi viết tiêu chí: ô tìm nên **giao** với bộ lọc phân khúc
(kết quả luôn là tập con), hay nên hiện rõ hai chế độ để nhân viên tự chọn? Ngả đầu
đúng với lời hứa của phân khúc; ngả sau giữ được việc tìm nhanh một người bất kỳ mà
nhân viên có thể đang dựa vào.

Ràng buộc: lời hứa AC-6 của hồ sơ trước — «phân khúc là một góc nhìn dùng chung» —
đã ký, nên hồ sơ này không được làm lỏng nó thêm.

## Quyết định Cổng Đáng 31/10

Xếp lại sau — Lỗi ô tìm thay phân khúc ở trang thành viên chiến dịch còn đúng, nhưng chiến dịch không có hàng nào trên lộ trình hiện tại; mở lại khi lộ trình có hàng chiến dịch, hoặc khi người dùng báo lại qua cửa tín hiệu. Chủ kho 31/10 «Đồng ý theo khuyên» cho B9 của docs/plan/don-dep-3110.md (bác hoặc xếp lại hồ sơ treo ngoài kế hoạch), qua phiên giám sát Mac Studio; máy chọn từng hồ sơ.
