---
slug: doi-ten-onehub-center
at: 2026-09-26T11:20:00Z
verdict: findings
p0: 0
p1: 5
p2: 0
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | AC-1 và E1 chỉ đo tập quét do chính vòng này khai (bảng §3); ngoại lệ không liệt kê trước, E1 chỉ bắt ngoại lệ mồ côi, không bắt ngoại lệ lạ | Chữ JSX «CRM» trong apps/app/components ngoài bảng §3 lọt; người làm thêm một ngoại lệ cho câu khó viết lại mà E1 vẫn xanh | Tập quét theo chiều loại trừ, bốn ngoại lệ nguyên văn trong contract, so tập với thông điệp «ngoại lệ lạ» | fixed: AC-1 quét toàn apps/app/{app,components,lib}, apps/api/src, packages/*/src trừ glob loại trừ khai kèm lý do ở Notes; bốn ngoại lệ nguyên văn; E1 thêm vạch (3) so tập và chiều đỏ trên app-header.tsx |
| P1 | contract | AC-14 cấm chạm (landing)/** trong khi năm trang AuthShell nằm dưới (landing); E14 (e) chỉ bắt (landing)/page.tsx | Sửa sign-in/page.tsx: AC-14 theo chữ là fail mà E14 xanh; sửa trang khác của hãng dưới (landing) cũng xanh | Danh sách cấm tường minh, ma trận viết trước có đối chứng dương và âm | fixed: AC-14 liệt danh sách cấm tường minh (proxy.ts, (landing)/page.tsx, components/landing/**, module /proto có sẵn, name của package.json, hai dòng This CRM is private) và nói rõ năm trang AuthShell, het-quyen, quen-mat-khau được sửa; E14 (e) ma trận 7 assert |
| P1 | contract | Vòng lật lời hứa đã ký của cua-vao-dang-nhap (nền phẳng, AuthShader, chữ CRM) mà không kê eval đã ký bị thay thế | E13 báo SAI cua-vao-dang-nhap/E… hoặc người làm sửa thước đã ký ngoài phép thế tên | Rút tập eval đã ký bằng máy, danh sách thay thế khai trước, dòng supersedes trong sổ, eval thay thế đỏ ở merge-base | fixed: rút bằng máy 26/09 (lệnh của mọi eval máy đã ký); Notes kê danh sách thay thế — cua-vao-dang-nhap E2 ba vạch, E11/E12/E13/E19 vạch khong-shader của do-cua-vao.mjs (nó coi mọi radial-gradient là AuthShader), E14 vế nền phẳng; AC-13 (ii) và E13 (b)(d); dòng supersedes vào sổ quyết định |
| P1 | evals | AC-13 (b) không ràng nội dung bang-the.json; một chuỗi mới ứng nhiều chuỗi cũ | Sửa toBe(2) thành toBe(3) trong thước đã ký rồi thêm đúng cặp đó vào bảng: E13 xanh | Kiểm từng cặp: cũ khớp CRM và hoặc chuẩn hoá tên bằng nhau, hoặc là cặp chuỗi sản phẩm thật | fixed: AC-13 (i) hai loại cặp; E13 (c) kiểm từng cặp với thông điệp «SAI bảng thế», chiều đỏ cặp toBe(2)→toBe(3) |
| P1 | evals | E5 gõ tay tên mặc định cũ; tên khi tạo mới chỉ đo bằng hằng số, không qua đường tạo thật; AC-5 thiếu cross-layer | Tên mặc định cũ khác «CRM» hoặc hook tạo không dùng hằng mới mà E5 vẫn xanh | Đọc giá trị cũ ở merge-base; ca gọi ensureWorkspaceMembership thật đọc lại db; tag cross-layer | fixed: AC-5 gắn (cross-layer) và thêm vế tạo mới/không đổi dữ liệu cũ; E5 đọc DEFAULT_WORKSPACE_NAME bằng git show merge-base (đã kiểm: «CRM», upsert theo WORKSPACE_ID); thêm E5b layer backend-effect trên CSDL test |
