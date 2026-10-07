---
schema_version: 1
feature: Các bài so-moi của nop-ban-nhap chọn số thử bằng cách đọc chính gói gửi mô hình — hết đỏ ngẫu nhiên khi tên gieo tình cờ mang chữ số
slug: so-moi-khong-chap-chon
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: []
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-07T13:33:45Z
design_doc: _acceptance/so-moi-khong-chap-chon/design.md
---

# Acceptance Contract: so-moi-khong-chap-chon

## Context

`apps/agent-okr/test/nop-ban-nhap.integration.spec.ts`, bài «số người gõ đọc trên mọi phiên của cuộc…»
đỏ một lần trên CI của #290 (07/10): bài cần số 41 VẮNG khỏi gói gửi mô hình để dòng bị loại `so-moi`
trước khi người gõ, nhưng 41 tình cờ có trong gói. Chạy lại xanh (luật 15 của đợt).

Gốc lỗi đo tại chỗ: tên bộ phận, phòng và chu kỳ gieo bằng `ma()` của `test/support/gieo.ts`
= `sokr-<Date.now() hệ 36>x<đếm>`. Tên đó nằm trong chữ gói (`chuCacLop` của
`agent/lib/goi-soan.ts`; chỉ id của lớp 2a bị lọc), và `trichSo` đọc mọi chuỗi chữ số trong đó:
`trichSo("sokr-mg41abcx3")` = `[41, 3]`. Hai nguồn chữ số lạc: dấu thời gian (đổi theo từng
mili-giây) và bộ đếm `dem` (bun chạy mọi tệp kiểm của gói trong một tiến trình, nên đếm phụ thuộc
thứ tự tệp). Luật sản phẩm (`soMoiCua` của `packages/validation/src/okr-kiem-ban-nhap.ts`) đúng:
số có trong gói thì không phải số mới. Cái sai là bài kiểm giả định một số cố định luôn vắng.

Cùng lớp lỗi chạm bốn bài của tệp, không phải một: bài 1 (`k13` «Đạt 100 %»), bài 2 (37),
bài 3 (41), bài 4 (2031 trong `viPham`).

## Criteria

- AC-1: Given spec ở HEAD, When chạy cả tệp trên cơ sở dữ liệu riêng của lượt (`bun run test --`), Then mọi bài xanh, 0 fail.
- AC-2: Given bốn bài dựa vào một số vắng khỏi gói (bài 1, 2, 3, 4), When bài dựng dòng nộp, Then số thử của mỗi bài lấy từ một hàm trong spec đọc `soTrongGoi` của chính cuộc đó qua `goiSoan` + `goiKiemTu` của sản phẩm và trả số nhỏ nhất ≥ số gợi ý mà gói không chứa — không còn hằng 37, 41, 100, 2031 nào làm số «vắng».
- AC-3: Given bản sao của gói `agent-okr` có `ma()` bị đổi để mọi tên gieo mang sẵn `37`, `41`, `100`, `2031` (fixture va chạm), When chạy spec MỚI trong bản sao đó, Then mọi bài xanh, và một bài dò chèn thêm in `RANG-VA-CHAM 37,41,100,2031` — bốn số thật sự nằm trong `soTrongGoi`.
- AC-4: Given CÙNG fixture va chạm, When chạy spec CŨ (bản ghim `fixtures/spec-truoc.ts.txt`, lấy từ `onehub` 0426cc9d0), Then đúng bốn bài đỏ — bài 1 «bản nháp trộn», bài 2 «nộp lại dòng có khoá đã bác», bài 3 «số người gõ đọc trên mọi phiên», bài 4 «so-moi đọc mọi chữ gói» — mỗi bài có dòng `(fail) nop-ban-nhap > <tên>`, và bài dò in cùng dòng `RANG-VA-CHAM 37,41,100,2031`.
- AC-5: Given spec mới và bản ghim spec cũ, When người đọc so hai tệp, Then mỗi bài vẫn đòi đúng điều cũ đòi — bài 1 `k13` bị loại `so-moi`; bài 2 và 3 bị loại `so-moi` trước khi gõ và được nhận sau khi gõ; bài 4 đúng một dòng `k3` bị loại với `viPham` «số mới: <số>» — không phép kiểm nào bị nới (đổi `toBe`/`toEqual` thành phép yếu hơn, bỏ một khẳng định, thêm `skip`/`retry`). (judgment)
- AC-6: Given hai răng của hồ sơ đã ký `nop-ban-nhap-chon-theo-khoa` chèn mã vào spec này theo mốc chuỗi, When chạy `nbn_dao_thu_tu_xanh`, `nbn_dao_thu_tu_do` và `nbn_quet_mau` trên spec mới, Then cả ba thoát 0 — mốc của chúng vẫn xuất hiện đúng một lần, chữ ký đỏ của chúng không đổi.

## Coverage

- Trục A — nguồn chữ số lạc trong chữ gói: dấu thời gian hệ 36 trong tên `ma()` | hậu tố đếm `x<dem>` theo thứ tự tệp | dữ liệu gieo cố định có số (tên trang, ngày xác minh, số chốt — chủ đích, tất định) [thước CE: `chuCacLop` + `idCuaGoi` của `agent/lib/goi-soan.ts` là toàn bộ chữ gói; `ma()` của `test/support/gieo.ts` là nguồn tên duy nhất có phần ngẫu nhiên — SUY-TỪ-REPO]
- Trục B — bài dựa vào việc một số vắng khỏi gói: bài 1 (100) | bài 2 (37) | bài 3 (41) | bài 4 (2031) [thước CE: `grep so-moi` trong spec ra đúng bốn chỗ — dòng 239, 293, 351, 404 ở 0426cc9d0]
- Trục C — chiều khẳng định: trước khi gõ thì bị loại | sau khi gõ thì được nhận | tên số trong `viPham`
- Core → AC: A1·A2 × B1–B4 × C1–C3 → AC-2 (một hàm chọn số), chứng chiều xanh dưới va chạm AC-3, chiều đỏ trên bản cũ AC-4; không nới phép kiểm → AC-5 (người đọc) và AC-1/AC-3 (hành vi: luật bị nới thì bài «trước khi gõ bị loại» đỏ); không gãy thước hồ sơ khác → AC-6; đường thường của CI → AC-1.
- Ô A3 (số chủ đích) không cần đổi: bài 4 dựa vào chúng có mặt, và chúng tất định.
- Later: làm `ma()` không còn chữ số — chữa gốc cho mọi spec dùng `gieo.ts`, nhưng nằm ngoài ranh giới hàng này (xem Out of scope).

## Out of scope

- Sửa `apps/agent-okr/test/support/gieo.ts` hay `gieo-goi.ts` (đổi `ma()` thành không chữ số): ranh giới của hàng chỉ gồm spec và hồ sơ; spec khác của gói có thể cùng lớp lỗi — mở hồ sơ riêng nếu thấy.
- Đổi luật `so-moi`, `goi-soan.ts` hay bất kỳ mã sản phẩm nào: luật đúng, bài kiểm sai.
- Chạy lại khi đỏ (`retry`) hay nới phép kiểm: hàng này đòi bài tất định.
- Các bài khác của tệp không dựa vào luật `so-moi` (giữ nguyên).

## Notes

- Spec này nằm trong `paths` eval của hai hồ sơ đã ký (`nop-ban-nhap-chon-theo-khoa` E1–E3, `soan-okr-cung-tro-ly` E11): pin của chúng hoá cũ khi vòng này gộp. Giám sát đã duyệt (`tra-loi/P4-1.json`) ghim lại hai hồ sơ đó bằng làn ghim lại của kit ở cuối nhánh, sau khi gộp `origin/onehub` mới nhất.
- «Mã sản phẩm không đổi» không có thước riêng: thước phạm vi neo `merge-base` tự hết hạn và đỏ trên nhánh khác sau khi gộp (bẫy đã đo ở kho này). Người ký thấy danh sách tệp ở `diff --stat` trên thẻ Cổng 2.
- Design doc đặt trong hồ sơ (không ở `docs/superpowers/specs/`) vì ranh giới của hàng F13 chỉ gồm spec và `_acceptance/so-moi-khong-chap-chon/**`.
