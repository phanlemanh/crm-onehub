---
slug: duong-proto-cho-design-pass
at: 2026-09-16T03:24:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
claims_input: ok
---

# gap-probe — duong-proto-cho-design-pass

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract + evals | AC-12 / E13 đòi ảnh dưới `evidence/design-pass/` nhưng không vật nào trong vòng này sinh ra chúng — design-pass đã descope, `capture_cmd` không khai, không eval nào chụp. Ma trận cũng không ghim trước nên "đủ ô" không kiểm được | S4 chạy, thư mục bằng chứng rỗng → E13 theo chính expected của nó trả UNCERTAIN → AC-12 không PASS → hồ sơ FAIL Cổng 2 dù mã đúng hoàn toàn. Biến thể xấu hơn: chụp tay 3 ảnh, E13 không có danh sách 20 ô nên vẫn xanh | Khai trong E13 ai sinh ảnh, và ghim ma trận toàn phần 20 ô trước khi chạy, số assert bằng số ô | `fixed`: E13 khai rõ chính nó chụp bằng dev_cmd + Browser pane; ma trận ghim đúng 20 ô (5 state × 2 khổ × 2 theme), danh sách state rút từ catalog.ts; thiếu một ô → UNCERTAIN kèm tên ô |
| P0 | evals | E4, E7, E8 đều "đọc sổ đăng ký" mà không khai đọc bằng đường nào, và không sàn nào đòi tập đọc ra khác rỗng — fixture tự dựng đúng khuôn bên đọc, cite [do-quyen-luot-bang-hanh-vi#F1] | Răng bóc registry.ts bằng biểu thức chuỗi. Ai đó khai sổ bằng `.map()` → răng đọc ra 0 mục. E8 duyệt 0 mục nên đúng vô nghĩa, E4 lặp 0 state, E7 so hai tập rỗng — ba AC PASS trên một sổ chưa từng được đọc | Nạp qua chính đường runtime, cộng sàn cứng trước mọi so sánh | `fixed`: tách `catalog.ts` (dữ liệu thuần, không nhập gì) khỏi `registry.ts`; E4/E7/E8 nạp bằng `import` đúng đường mã thật dùng; sàn cứng catalog ≥ 1 và duong-proto đúng 5 state; chiều đỏ thêm: đổi khuôn khai sang `.map()` thì răng vẫn phải đọc đúng 5 state |
| P1 | contract + evals | AC-2 khai hai điều kiện (không đặt HOẶC khác `1`) nhưng E2 chỉ đo nhánh "không đặt" | Mã viết `if (!process.env.PROTO_ROUTE)`. Chạy `PROTO_ROUTE=0` → chuỗi truthy → cả nhánh MỞ. E2 vẫn xanh, AC-2 PASS, mà proxy đã thôi canh `/proto` nên không còn lớp chặn nào | E2 thành ma trận toàn phần trên tập giá trị khai trước | `fixed`: E2 ghim sáu giá trị (không đặt · "" · "0" · "false" · "true" · "1"), chỉ "1" mở, năm giá trị còn lại phải 404 trên cả hai đường, thông điệp ghim giá trị làm lọt |
| P1 | evals | E14 gán cho AC-1 và E15 gán cho AC-11, nhưng `build`/`check-types` không đo lời hứa của hai AC đó; kéo theo trục A ô "sống chung bản thật" thực tế không AC nào phủ | Một hồi quy ở module khác làm build đỏ → AC-1 bị chấm đỏ dù proto chạy đúng; chiều ngược lại, check-types xanh được đọc là bằng chứng AC-11 trong khi tsc không bắt import gói server. Cổng 1 duyệt một bảng trông như có hai lớp đo mà chỉ có một | Gán lại, hoặc ghim assert vào artefact proto | `fixed`: thêm AC-14 (lưới drift của phòng trưng bày), E14 và E15 chuyển sang AC-14; chiều đỏ của cả hai ghim vào proto — gỡ một export `@crm/ui` proto đang dùng, đổi kiểu `ProtoState` — không phải một lỗi bất kỳ trong kho. AC-1 còn E1 + E13, AC-11 còn E11 |
| P1 | contract + evals | Vế cuối AC-7 — liên kết mỗi dòng mở đúng trang proto — không eval nào đo | Mục lục dựng href bằng tên thay vì slug. Tập slug hiển thị vẫn đúng, số state vẫn đúng → E7 xanh, AC-7 PASS. Người duyệt bấm vào dòng duy nhất và nhận 404 — cửa vào của cả phòng trưng bày hỏng mà hồ sơ báo xanh | E7 rút href thật trên DOM, GET nó, đòi 200 và đúng tên proto | `fixed`: E7 thêm vế hai đo href thật; chiều đỏ là đổi href sang tên thì răng đỏ với thông điệp ghim href sai và slug mong đợi |
