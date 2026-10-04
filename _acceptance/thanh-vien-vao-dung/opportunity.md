---
schema_version: 1
slug: thanh-vien-vao-dung
feature: "«Nhập cả công ty không hỏng ngầm: đặt được tên miền nội bộ, cho phép lại người đang là thành viên không treo»"
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-04T06:18:33Z
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: R1b
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng R1b của «OKR» (`docs/plan/lo-trinh-okr.json`).

«Nhập cả công ty không hỏng ngầm: đặt được tên miền nội bộ, cho phép lại người đang là thành viên không treo»

Người gặp: quản trị workspace khi thêm người sau đợt nhập 04/10 và khi cho phép lại một người. Bốn lỗi, đều đã có nguồn trong hồ sơ cũ:

- #28 — `appSetting.staffEmailDomains` chỉ có đường đọc (`apps/api/src/workspace/staff-domains.ts:18-23`, đọc ở `tracking-filing.service.ts:82` và `mailbox-match.service.ts:60`); không màn hình, không thủ tục nào ghi được, migration `20260916025034` không backfill. Lọc «người nhà» ở tracking và ghép hộp thư nội bộ đang tắt hẳn. Nguồn: Ngoài-18/20 của `cho-phep-ai-vao-o-man-hinh`.
- #29 — cho phép lại một người đang là thành viên để lại dòng `pending` treo vĩnh viễn; người đó bị liệt vào «chưa vào». Nguồn: Ngoài-7 của `cho-phep-ai-vao-o-man-hinh`.
- #43 — `quyenQuanTri()` ở `settings/members/page.tsx` biến lỗi `workspace.get` thành «không có quyền», nên nút «Cho phép một địa chỉ» biến mất sau một lỗi mạng. Nguồn: review r1 của `thanh-vien-hai-khoi-cung-khuon`.
- #44 — backfill coi «từng có lời mời đã kết thúc» là «đang bị gỡ», nên người được mời lại bị bỏ sót (`packages/auth/src/organization.ts`). Nguồn: review của `go-thanh-vien-phai-giu-duoc`. Dữ liệu production chỉ đọc để soi có ai đang dính.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau khi giao, quản trị có tự đặt được tên miền nội bộ và cho phép lại một người mà không sinh người «chưa vào» sai không?
- Kết quả nào là SỐNG: trên production, tên miền nội bộ của công ty được quản trị đặt qua màn hình (không sửa CSDL tay); truy vấn chỉ đọc đếm 0 thành viên đang hiệu lực mà vẫn có lời cho phép `pending`; 0 người bị coi nhầm «đang bị gỡ».
- Kết quả nào là CHẾT: quản trị vẫn phải nhờ kỹ thuật sửa CSDL để đặt tên miền, hoặc còn ≥1 thành viên bị liệt «chưa vào» sai sau một lần cho phép lại.
- Timebox: hạn 08/10/2026 (trước lần thêm người kế tiếp); quá 3 ngày công thì thu phạm vi về #28 + #29.
