---
schema_version: 1
slug: bo-okr-chi-don-vi
feature: Trưởng khối mở bộ OKR của khối mình chỉ thấy mục tiêu của khối, và sang bộ của từng phòng bằng dòng vị trí
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-28T04:57:47Z
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: VK19
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Chủ kho trả lời trực tiếp ở phiên V5·VK19 lúc 2026-10-28T04:57:47Z, nguyên văn: «Cổng Đáng bo-okr-chi-don-vi: build, giữ ngưỡng đề xuất».

Mở từ hàng VK19 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: chưa gắn — hàng mang hạn `ngay` 2026-10-29, đứng trên HT1, VK8, VK10, SV6, HT2, HT5; chưa thuộc mốc nào của kế hoạch.

Trưởng khối mở bộ OKR của khối mình chỉ thấy mục tiêu của khối, và sang bộ của từng phòng bằng dòng vị trí.

**Ai gặp.** Trưởng bộ phận (Khối) mở bộ của khối mình qua Bộ OKR › Tôi dẫn, hoặc ai mở bộ của một khối bất kỳ
(`/okr/bo-okr?donOkr=bp:<id>`). Chủ kho báo 25/10 nguyên văn: «…đang gom tất cả bộ okr khác của bộ phận vào một nơi
điều này làm rối, tôi muốn chỉ bộ okr của đối tượng đó».

**Hôm nay sai thế nào** (đo 25/10, `docs/findings/2026-10-25-bo-okr-gom-lan/README.md`):
- `dieuKienDonVi` (`apps/api/src/okr/okr-xem.service.ts`) mở `bp` sang mọi phòng ban con, dùng cho cả bốn thẻ con —
  OKR (`danhSach`), Việc (`viecCuaBo`), Họp tuần (`hopTuan`), Chấm điểm (`bangCham`, `okr-khep.service.ts`).
  `pb` và `goc` không gom.
- Bộ mẫu: Khối Kinh doanh có 1 mục tiêu riêng mà mở ra hiện 15; Khối Hỗ trợ 0 riêng mà hiện 10, trong khi danh sách
  Bộ OKR ghi 0.
- Bảng không có cột đơn vị; các phòng con hiện hai lần (lẫn trong bảng và ở lưới «Đơn vị trực thuộc» dưới bảng).
- Trang một bộ có ba đường sang đơn vị khác (dòng vị trí, ô chọn đơn vị, lưới trực thuộc) và mục gập «Đã bỏ (n)»
  kẹp giữa bảng và lưới — trái luật màn chốt 25/10 (`docs/design.md` «Thứ tự một màn», «Hàng công cụ»).
- Một hàng bộ phận ở danh sách Bộ OKR lệch chính nó: cột Mục tiêu là số riêng, Tiến độ và KR tự tin thấp là số gộp.

**Đã chốt trước ô này** (chủ kho 25/10, «Đồng ý hết theo khuyến nghị»): Q1 (a) bỏ gộp ở mọi thẻ con; Q2 (a) số riêng
ở danh sách Bộ OKR; Q3 (a) hàng mới VK19; Q4 đổi AC-1 đã ký của `toan-canh-okr` và thước `gop-y-dung-cho`; Q6 Đã bỏ
thành nút cuối hàng công cụ; Q7 đơn vị trực thuộc qua menu ở mắt xích cuối dòng vị trí, bỏ ô chọn đơn vị và lưới.
Toàn cảnh giữ gộp (`toan-canh-okr` AC-5, quyết định 04/10). Hỏi-6 VK8: bộ đi kèm số của chính bộ đó. Chủ kho 28/10:
VK19 là một trong hai việc quan trọng nhất.

**Kéo theo hồ sơ đã ký** (ghi_chu của hàng): `toan-canh-okr` AC-1/E1 lật chiều đỏ; `gop-y-dung-cho` đổi đơn vị trong
thước sang `pb`; `tro-ly-okr-tom-tat` theo E1; `trang-bo-okr` AC-7, AC-10, thêm ca bộ phận vào E5; `bo-okr-co-so`
E1/E14; bốn điểm của HT1 (AC-6 số «Đơn vị có KR», thứ tự AC-2, chiều đỏ E8, màn rỗng OneHub sang dòng vị trí). Mỗi hồ
sơ một dòng sổ `fix` `decided_by` chủ kho, đo hai chiều.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: trên bộ OKR mẫu, mở bộ của một khối có còn thấy mục tiêu của phòng con, và có
  đúng một đường (dòng vị trí) sang bộ của phòng không?
- Kết quả nào là SỐNG: trên bộ mẫu, cả bốn thẻ con của Khối Kinh doanh hiện đúng 1 mục tiêu (hôm nay 15),
  Khối Vận hành 1 (hôm nay 11), Khối Hỗ trợ 0 kèm câu rỗng riêng (hôm nay 10); hàng ba khối ở danh sách Bộ OKR có
  Mục tiêu, Tiến độ, KR tự tin thấp cùng là số riêng; trang một bộ có 0 ô chọn đơn vị, 0 lưới trực thuộc, 0 mục gập
  Đã bỏ, và mắt xích cuối dòng vị trí mở menu đơn vị cha · ngang hàng · trực thuộc; Toàn cảnh vẫn cộng phòng con.
- Kết quả nào là CHẾT: còn một thẻ con nào của bộ khối hiện mục tiêu phòng con, hoặc số trên danh sách Bộ
  OKR lệch số trong bộ, hoặc trưởng khối không đi được sang bộ của một phòng trong hai lần bấm từ dòng vị trí.
- Timebox: một vòng T2 ≈ 10 giờ máy (hệ số đợt, luật 25), hạn hàng 29/10; đọc lại số tuần sau gộp — trên
  production đếm số lần mở bộ `bp:` dẫn tới một bộ `pb:` qua menu dòng vị trí.
