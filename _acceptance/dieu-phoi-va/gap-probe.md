---
slug: dieu-phoi-va
at: 2026-10-10T01:00:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-1 là tiêu chí xuyên lớp, nhưng không eval nào chạy cả mạch «API nhận lô → làn trực tiếp chạy». E1 tự gieo hàng `AgentTask` theo khuôn bên đọc, chỉ phần `payload` đi qua schema. | `onboardingMatchNeeded` ghi một cột mà bộ lọc `claimDue` của làn trực tiếp loại ra. E1 và E1b vẫn xanh, nhưng trên production không hàng nào được nhận. | E1 gieo hàng bằng chính đường ghi thật rồi chạy làn trực tiếp. Chiều đỏ: writer đặt cột lọc khác thì đỏ. | fixed: thêm E1c nối mạch thật trong cùng một lượt `bun run test` — ca API `mach-lien-ghi` ghi hàng qua lô thật, ca tác nhân `mach-lien-doc` đọc đúng hàng đó, không tự gieo; chiều đỏ là writer đặt `runAt` ở tương lai |
| P1 | evals | Trục A khai lô nhiều mã, nhưng không AC hay eval nào đo. | Writer gom cả lô vào một hàng, hoặc chỉ giữ mã đầu. Lô ba mã lệch khi đó thành «payload hỏng» hoặc mất hai mã. | Thêm ca lô ≥ 2 mã lệch: số hàng bằng số mã, mỗi hàng qua schema với đúng mã của nó. | fixed: AC-1 nói «một hoặc nhiều mã», mỗi mã một việc; E1b thêm ca lô ba mã lệch (dòng 4, kèm chiều đỏ «ma lech bi gom vao mot hang»); E1c chạy lô hai mã tới hai việc |
| P1 | contract | Phạm vi «Tất cả» của AC-7 đo hở hai chỗ: (a) không gieo việc ở workspace khác; (b) không chốt nghĩa của `quaHan.buoc` ở «Tất cả». | Service quên lọc workspace, hoặc ở «Tất cả» đếm bước của cả workspace. E7 vẫn xanh, còn thẻ ghi sai số. | AC-7 chốt nghĩa `buoc` ở «Tất cả»; E7 gieo workspace thứ hai. | (a) rejected: kho chỉ có một tổ chức (`docs/api.md` «One organization, and it is not a tenancy boundary»), không có workspace thứ hai để lọc. (b) fixed: AC-7 chốt `quaHan.buoc` luôn là bước quá hạn của chính người xem, không đổi theo phạm vi; E7 thêm dòng 5 viết trước giá trị cho «Tất cả» |
| P2 | evals | Hai khẳng định âm tính của E1 (dòng 2, 10) thiếu đối chứng dương. | Làn nghiên cứu trả 0 vì thiếu khoá mô hình, nên hai dòng xanh rỗng ngay cả khi `onboarding-identify` vẫn nằm trong làn nghiên cứu. | Gieo kèm một hàng nghiên cứu hợp lệ: làn nghiên cứu nhận đúng hàng đó, không nhận hàng `onboarding-identify`. | fixed: E1 gieo kèm hàng `identify` hợp lệ làm đối chứng dương, thêm chiều đỏ «lan nghien cuu nhan onboarding-identify» |
| P2 | contract | Đặc tả UX có luồng lỗi bộ phận vừa bị lưu trữ, nhưng không AC nào đo phía màn. | Form đóng khi lưu lỗi, chữ đã gõ mất. AC-6 vẫn đạt. | Thêm vế giao diện vào AC-6 kèm ca DOM. | fixed: AC-6 thành tiêu chí xuyên lớp, thêm vế màn; thêm E6b (`loi-bo-phan`: thông điệp trong form, giữ chữ, form không đóng; đối chứng: lưu thành công thì form đóng) |
