---
slug: tran-mot-lan-uy-thac
at: 2026-09-09T00:34:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | contract AC-8 + evals E8 | AC-8 viện lớp tiêu thụ câu ném để biện minh nhưng không eval nào chạm lớp đó; AC không mang tag (cross-layer). Cite [chan-uy-thac-sai-luot#F2] | Bỏ chữ `creation` làm câu thôi khớp nhánh phân loại ở `latestTurnFailure`; người dùng nhận thẻ lỗi chung chung, tám eval vẫn xanh vì đều assert tại đầu ra hook | Thêm AC-8b (cross-layer) + E8b `layer: backend-effect` đẩy câu qua `turn.failed` tới `latestTurnFailure` thật | human-gate1 — kịch bản fail đã kiểm và **sai sự thật**: `latestTurnFailure` chỉ phân loại `restricted` · `rate-limit` · `credits` · `unknown`, và grep `apps/app` + `apps/api` + `packages` cho 0 chỗ khớp theo câu trần. Câu rơi vào `unknown` cả trước lẫn sau vòng, nên không có nhánh nào để rớt ra và eval xuyên lớp sẽ đo một hằng-đúng. Phần đúng còn lại — AC-8 nói quá — đã vá: AC-8 và E8 nay khai thẳng phạm vi dừng ở đầu ra hook, kèm dữ kiện vừa kiểm. Người quyết ở Cổng 1 |
| P1 | evals E6 | E6 đòi ma trận 6 ô nhưng không có sàn khuôn fixture cho `team-agent`/`research`. Cite [chan-uy-thac-sai-luot#F1] | Bốn ô ngoài builder dựng bằng object viết tay; khuôn lồng sai một tầng thì `purposeOf` trả đường mặc định ở cả bốn, chúng xanh vì sai khuôn chứ không vì hook đúng | Dựng attribute mỗi ô qua bên ghi thật, hoặc thêm ô đối chứng khuôn phải ném có tên | fixed: AC-6 và E6 thêm sàn khuôn — cả sáu ô dựng từ **một** bộ, là đầu ra thật của `builderSessionAttributes` trải ra rồi đè đúng hai trường; hai đường dựng khác nhau là mã 2. Khi ấy hai ô ném chính là chốt kiểm khuôn |
| P1 | contract Coverage trục B | Giá trị "0 lần" của trục B không AC nào phủ và không nằm trong danh sách ô bị gạch — đúng ô mà vòng này mở rộng bán kính | Sự kiện `actions.requested` trên lượt builder không mang lời gọi `agent_builder` nào đi vào đường trước đây return sớm; mọi lượt chat của kênh builder chạm hook lần đầu, tám eval xanh vì bài nào cũng có ít nhất một lời gọi | AC mới: hai hình dạng sự kiện rỗng nhân hai chiều quyền, assert trạng thái chứ không chỉ "không ném" | fixed: thêm **AC-9** + **E9** + executor `tr_khong_co_loi_goi`, 4 assert, chiều đỏ đổi `subagentName` sang `agent_builder`. Bảng 14 ô trong Coverage nay liệt kê đủ, không ô nào để câm |
| P2 | contract AC-8 + evals E8 | "Sàn dân số: câu ném trong mã sản phẩm bằng 1" không có đường đo, vì E8 cấm đọc mã nguồn | Câu cũ còn sót trên một nhánh không bài đo nào đi qua; hai chiều đo được đều trả câu mới nên E8 xanh trong khi lời hứa "một câu" sai | Tách một eval đếm dân số văn bản riêng, khai rõ là phép đếm | fixed bằng cách **bỏ lời hứa**, không bằng cách thêm thước: sàn dân số đã gỡ khỏi AC-8. Giữ một lời hứa không đo được là đúng thứ hồ sơ này phải tránh, và thêm một eval grep mã nguồn là dựng lại đúng lớp đo mà vòng chấm trước đã nhặt lên ở `quyen-luot.spec.ts` |
| P2 | contract Out of scope | Không AC nào ghim lại con số 2 câu dặn `not_authorized` trong `task.ts` sau vòng | Người làm thấy đã có chốt cứng nên gỡ hai câu dặn; toàn bộ eval xanh vì chúng chỉ chạy hook. Hàng rào rẻ biến mất, mọi lượt không quyền kết thúc bằng thẻ đỏ | Eval tái-kiểm mốc ghim: đếm câu dặn phải vẫn bằng 2 | rejected: đếm câu trong tệp chỉ dẫn là thước giòn — sửa câu chữ hợp lệ cũng làm nó đỏ, và nó đo tài liệu thay vì đầu ra. Con số 2 đã nằm trong bảng mốc ghim của hợp đồng; chỗ bắt là diff ở Cổng 2 |

## Trả lời cross-check (nguyên văn từ critic, rút gọn)

- **(a)** AC-1..AC-8 ánh xạ 1-1 với E1..E8, không AC mồ côi, không eval không map. *(sau vá: 9 AC ↔ 9 eval)*
- **(b)** Hai chỗ không đo được như viết: sàn dân số của AC-8 (đã gỡ), và Given của AC-6 chỉ dựng được bằng object viết tay (đã thêm sàn khuôn). Chiều đỏ của AC-1 là chiều giả — cả hai chiều cùng ném; hợp đồng tự thừa nhận và giao phần phân biệt cho AC-3, AC-6.
- **(c)** Trục A, C, D có AC phủ. Trục B thiếu giá trị "0 lần" — đã vá bằng AC-9.
- **(d)** AC-8 là criterion duy nhất có Then đi xuyên lớp; bảy AC còn lại nằm trọn trong lớp hook. *(sau kiểm: câu trần không có bên tiêu thụ nào khớp theo nó, nên AC-8 cũng không xuyên lớp — xem cột Xử lý P0)*
- **(e)** Không có `opportunity.md`; mục "Đường đo" trỏ đúng entry `descope` và entry khai đúng hệ quả. Nhất quán, không finding.
- **(f)** E6 có ma trận toàn phần sinh từ tích Descartes, assert độ dài bằng 6, cấm đếm-rồi-vứt — đạt; điểm hỏng là xuất xứ fixture. Assertion âm tính đều có đối chứng dương trong cùng bài; E3, E4, E5 bắt đọc trạng thái chứ không chỉ "không ném". Thông điệp được ghim ở E1 và E8. Không eval nào đo chuỗi-có-mặt thay cho quan hệ, không eval nào đo chỉ dẫn thay cho đầu ra. Đường dẫn suy từ `require.resolve("eve/package.json")`, không hardcode ROOT.
