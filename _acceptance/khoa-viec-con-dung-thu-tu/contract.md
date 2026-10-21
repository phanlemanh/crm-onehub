---
schema_version: 1
feature: Thêm việc con vào dự án không vấp khoá với dời ngày hay sửa mốc cùng lúc
slug: khoa-viec-con-dung-thu-tu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, docs]
status: verified
veto_state: mo
veto_opened_at: 2026-10-21T07:08:51Z
design_doc: docs/superpowers/specs/2026-10-21-khoa-viec-con-dung-thu-tu-design.md
---

# Acceptance Contract: khoa-viec-con-dung-thu-tu

## Context

Hàng DA13 của `docs/plan/lo-trinh-viec-du-an.json`; Cổng Đáng `build`, chủ kho 21/10 «DA13 Build». Gốc là Ngoài-1 và
Ngoài-2 ở Cổng Bằng chứng của DA12 (`va-gantt-lich-bay-ngay`), chủ kho chọn «mở hợp đồng mới»: `taoViecCon` khoá hàng
việc cha rồi mới khoá hàng dự án, ngược thứ tự chung (hàng `duAn` rồi mọi việc của dự án theo `id`, ở `khoaMot` và
`khoaDuAn`). Thêm việc con đúng lúc người khác sửa mốc, đổi ngày hay đổi phụ thuộc cùng dự án thì Postgres huỷ một bên
và người dùng nhận lỗi chung chung. Hạng T2: chỉ chạm `packages/db/src/viec-ghi.ts`, `packages/db/src/du-an.ts`,
`apps/api/src/viec/viec-bang.service.ts`, bài kiểm của `apps/api` và `docs/api.md`.

Source input: hàng DA13 · `opportunity.md` · sổ `_acceptance/va-gantt-lich-bay-ngay/decisions.jsonl` dòng
`d-20261020T032627Z-13`, `-14` · `docs/api.md` mục «Dự án» · mục «Việc con» của `CONTEXT.md` · design doc.

«Người khác giữ khoá dự án P» nghĩa là một giao dịch khác đã khoá hàng `duAn` của P và đang làm một thao tác ghi trên
P, đúng lúc việc thêm việc con tới. Bài đo dựng thứ tự này một cách tất định: người khác khoá trước, thêm việc con tới
chỗ chờ (đọc thấy ở `pg_stat_activity`), rồi người khác mới làm thao tác của mình.

## Criteria

- AC-1: Given việc cha trong dự án mở P và người khác đang giữ khoá P để làm một trong tám thao tác — thêm mốc, sửa
  mốc, xoá mốc, thêm phụ thuộc, gỡ phụ thuộc, sửa tên dự án, đổi ngày một việc của P, chuyển một việc từ ngoài vào P —
  When người giao việc cha thêm việc con qua `viec.taoCon` đúng lúc đó, Then cả hai thao tác thành công: việc con nằm
  trong P dưới việc cha, và thao tác kia để lại đúng kết quả của nó. (cross-layer)
- AC-2: Given việc cha trong dự án mở P và người khác đang giữ khoá P để đóng P, When thêm việc con đúng lúc đó, Then
  đóng thành công, còn thêm việc con nhận 400 «Dự án đã đóng.» và không sinh việc con nào. (cross-layer)
- AC-3: Given thêm việc con đang chờ khoá thì người khác chuyển việc cha — từ P sang Q, từ P ra ngoài dự án, hay từ
  ngoài vào P — When thêm việc con đi tiếp qua `viec.taoCon`, Then thêm việc con thành công và việc con nằm đúng dự án
  hiện tại của việc cha; còn một lượt `taoViecCon` gặp việc cha vừa đổi dự án thì dừng bằng lỗi riêng trước khi khoá dự
  án mới (để `viec.taoCon` chạy lại trong giao dịch mới), không sinh việc con nào ở lượt đó. (cross-layer)
- AC-4: Given không ai giữ khoá, When thêm việc con, Then mọi hành vi đã có giữ nguyên: quyền, một tầng, việc cha đang
  mở, trần 300 việc và dự án đã đóng trả đúng lời như trước vòng này.
- AC-5: Given vòng xong, When người đọc `docs/api.md` mục «Dự án», Then tệp nói: các đường ghi qua `khoaMot`,
  `khoaDuAn` và thêm việc con (`viec.taoCon`) khoá hàng `duAn` trước khi khoá một việc; thêm việc con tự chạy lại khi
  việc cha vừa đổi dự án và hết lượt thì trả 400 «Việc cha vừa đổi dự án. Hãy thử lại.»; và các đường ghi việc lẻ
  khác chưa được rà thứ tự khoá. (judgment)

## Coverage

Bỏ quét bằng skill (sổ quyết định, dòng «bỏ coverage-scan»); trục lấy thẳng từ mã, grep 21/10:

- Trục A, thao tác của người khác giữ khoá dự án: thêm mốc · sửa mốc · xoá mốc · thêm phụ thuộc · gỡ phụ thuộc · sửa
  dự án · đổi ngày một việc (`suaViec` → `khoaDuAnCuaViec`) · chuyển việc vào (`doiDuAn` → `khoaDuAn`) · đóng dự án ·
  mở lại dự án · xoá dự án [thước CE: mọi chỗ gọi `khoaMot` ở `packages/db/src/du-an-ghi.ts` và `khoaDuAn` ở
  `packages/db/src/viec-ghi.ts`]. Mở lại cần dự án đã đóng (thêm việc con bị từ chối trước khi chờ); xoá cần dự án
  chưa có lịch sử, mà dự án có việc thì đã có — hai ô này không dựng được, ghi ở Out of scope.
- Trục B, dự án của việc cha lúc thêm việc con so với lúc khoá: không đổi · P→Q · P→ngoài · ngoài→P [thước CE:
  `viec.doiDuAn` là đường duy nhất đổi `Viec.duAnId`, grep `duAnId:` trong `viec-ghi.ts`].
- Trục C, việc cha có dự án hay không: có dự án (AC-1, AC-2) · không dự án (AC-3 dòng ngoài→P, AC-4 qua `kv-con-tao`).
- Trục D, tầng đo của AC-3: `viec.taoCon` (người dùng thấy) · `taoViecCon` một lượt (lời kiểm lại có thật).

## Out of scope

- Mở lại và xoá dự án làm đối thủ: không dựng được trạng thái để thêm việc con xen vào (Coverage trục A).
- Bắt lỗi `40P01` ở API để tự thử lại: che lỗi thay vì gỡ.
- Rà các đường ghi việc lẻ (`docViecGhi`) có chạm dự án qua khoá ngoại.
- Màn hình: không đổi; lời 400 mới (chỉ khi hết lượt chạy lại) hiện qua thông báo lỗi sẵn có của ô thêm việc con.
- Đo trường hợp hết cả `DU_AN.thuLaiViecCon` lượt chạy lại: cần việc cha đổi dự án ba lần liền giữa các lượt.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Lời mới đặt ở `DU_AN.thongDiep.chaDoiDuAn`, số lượt ở `DU_AN.thuLaiViecCon` (`packages/db/src/du-an.ts`), chỉ thêm
  dòng.
- Bài mới chỉ thêm tệp `apps/api/test/viec-con-khoa.spec.ts`; bài đã ký `viec-con.spec.ts` và `du-an-tran-viec.spec.ts`
  chạy nguyên văn.
