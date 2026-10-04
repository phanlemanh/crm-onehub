---
schema_version: 1
slug: cua-vao-va
feature: «Quên mật khẩu giữ logo, đăng xuất lỗi báo tiếng Việt, lỗi cơ sở dữ liệu không đá người về đăng nhập»
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-04T13:54:35Z
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: R1f
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng R1f của «OKR» (`docs/plan/lo-trinh-okr.json`).

«Quên mật khẩu giữ logo, đăng xuất lỗi báo tiếng Việt, lỗi cơ sở dữ liệu không đá người về đăng nhập»

Người gặp: mọi nhân viên OneHub ở cửa vào sau đợt nhập cả công ty 04/10 — người quên mật khẩu, người đăng xuất, và người đang làm việc lúc API trục trặc. Ba lỗi, đều đã có nguồn:

- #31 — trang Quên mật khẩu (`apps/app/app/(landing)/quen-mat-khau/quen-mat-khau-form.tsx`) chỉ có tiêu đề chữ, không mang logo OneHub như trang đăng nhập; người vừa bấm «Quên mật khẩu» thấy một màn lạc thương hiệu. Nguồn: khảo sát lộ trình A5.
- #32 — `apps/app/lib/sign-out.ts` hiện `error.message` của thư viện đăng nhập khi đăng xuất lỗi, nên người dùng đọc câu tiếng Anh; chữ tiếng Việt chỉ là dự phòng khi thư viện không trả câu nào. Nguồn: khảo sát lộ trình A5.
- #33 — `apps/api/src/trpc/trpc.context.ts` nuốt mọi lỗi của `getSession()` thành «không có phiên», nên lúc API lỗi cơ sở dữ liệu người còn phiên bị proxy đưa về `/sign-in`, có khi vòng qua lại tới ERR_TOO_MANY_REDIRECTS. Nguồn: Known limits Ngoài-1/Ngoài-4 của `phien-chet-ve-dang-nhap`.
- Nợ thước `cua-vao-dang-nhap` (khảo sát F9): hồ sơ đã ký 26/09 trên `d579103f`, các lần chạm sau (đổi tên OneHub Center) để thước của nó hoá cũ; vòng này chạm cùng vùng nên ghim lại nó trong cùng lượt.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau khi giao, người ở cửa vào còn gặp màn lạc thương hiệu, thông báo tiếng Anh, hay bị đá về đăng nhập khi API trục trặc không?
- Kết quả nào là SỐNG: trên production, trang Quên mật khẩu mang logo OneHub như trang đăng nhập; đăng xuất lỗi chỉ hiện câu tiếng Việt (0 câu tiếng Anh từ thư viện); khi API không đọc được phiên vì lỗi cơ sở dữ liệu, người còn phiên thấy báo lỗi có lối thử lại, không về `/sign-in`, không vòng chuyển hướng; hồ sơ `cua-vao-dang-nhap` ghim lại xanh trên nhánh chính.
- Kết quả nào là CHẾT: còn tái hiện được một trong ba lỗi trên production, hoặc lỗi cơ sở dữ liệu ở API vẫn đẩy người còn phiên về `/sign-in`.
- Timebox: hạn 11/10/2026; quá 2 ngày công thì tách #33 thành hợp đồng riêng và giao #31 + #32 trước.
