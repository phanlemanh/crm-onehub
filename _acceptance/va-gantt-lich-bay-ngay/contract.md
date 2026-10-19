---
schema_version: 1
feature: Lịch làm việc chọn đủ bảy ngày vẫn giữ đúng như chọn, và dự án đủ 300 việc vẫn sửa được mốc và phụ thuộc
slug: va-gantt-lich-bay-ngay
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, docs]
status: approved
approved_by: manh
approved_at: 2026-10-19T15:42:01Z
design_doc: docs/superpowers/specs/2026-10-19-va-gantt-lich-bay-ngay-design.md
---

# Acceptance Contract: va-gantt-lich-bay-ngay

## Context

Hàng DA12 của `docs/plan/lo-trinh-viec-du-an.json`; chủ kho duyệt Cổng Đáng («build») ở thẻ khởi tạo đợt
`viec-du-an-kho-tai-lieu` 19/10/2026. Gộp ba mục ngoài hợp đồng của DA4 mà chủ kho chọn «mở hợp đồng mới» ở Cổng
Bằng chứng 18/10: Ngoài-3 và Ngoài-9 — quản trị bỏ chọn hết ngày nghỉ trong tuần, máy báo đã lưu, nhưng Thứ Bảy và
Chủ nhật bật lại; Ngoài-8 — dự án đủ 300 việc thì không thêm, sửa, xoá được mốc và không thêm, gỡ được phụ thuộc. Hạng
T3 vì thêm một cột ở `packages/db/prisma`.

Source input: hàng DA12 · `opportunity.md` · sổ `_acceptance/du-an-gantt/decisions.jsonl` dòng 61, 66, 67 · mục «Lịch
làm việc», «Phụ thuộc (việc)», «Mốc (dự án)» của `CONTEXT.md` · `docs/api.md` mục «Dự án» · design doc.

Quy ước ngày: Thứ Sáu 23/10/2026, Thứ Bảy 24/10, Chủ nhật 25/10, Thứ Hai 26/10. «Lịch làm cả tuần» là lịch mà quản trị
đã bỏ chọn hết ngày nghỉ trong tuần và không có ngày lễ. «Dự án đủ 300 việc» là dự án mở có đúng 300 việc, dựng qua
hàm ghi thật.

## Criteria

- AC-1: Given lịch đang nghỉ Thứ Bảy, Chủ nhật, When chủ hay quản trị bỏ chọn hết ngày nghỉ trong tuần, Then lịch đọc
  lại ở màn Cài đặt (`lichLamViec.get`) và ở Gantt (`duAn.lich`) là làm cả tuần, và vẫn vậy ở mọi lần đọc sau.
- AC-2: Given lịch chưa từng được đặt — chưa có cài đặt chung, hoặc có cài đặt từ trước vòng này với ô ngày nghỉ trống
  — When đọc lịch, Then lịch nghỉ Thứ Bảy, Chủ nhật như hôm nay; và cài đặt từ trước vòng này đã có ngày nghỉ khác
  trống giữ nguyên các thứ đó sau khi nâng cơ sở dữ liệu.
- AC-3: Given lịch làm cả tuần và hai việc A (hạn Thứ Sáu 23/10) và B phải chờ A trong một dự án, When A dời hạn làm B
  chồng lên, Then B tự dời sang Thứ Bảy 24/10, giữ số ngày làm việc tính cả Thứ Bảy, Chủ nhật. (cross-layer)
- AC-4: Given quản trị vừa đổi lịch trên màn Cài đặt, When bấm Hoàn tác trên thông báo «Đã lưu», Then lịch về đúng
  như trước — từ lịch làm cả tuần về nghỉ Thứ Bảy, Chủ nhật, và ngược lại — kể cả sau khi tải lại.
  (cross-layer)
- AC-5: Given dự án đủ 300 việc, When người dùng thêm, sửa, xoá một mốc, Then thao tác thành công và lịch sử dự án
  ghi đúng một dòng cho mỗi thao tác.
- AC-6: Given dự án đủ 300 việc, When người giao hay người thực hiện thêm hay gỡ phụ thuộc giữa hai việc của dự án,
  hay đổi ngày một việc, Then thao tác thành công, và việc phải chờ tự dời như ở dự án ít việc.
- AC-7: Given dự án đủ 300 việc, When tạo việc mới trong dự án, thêm việc con cho một việc của dự án, hay chuyển một
  việc từ ngoài vào, Then máy từ chối với «Một dự án chứa tối đa 300 việc.» và dự án vẫn 300 việc; dự án 299 việc nhận
  được việc thứ 300 qua cả ba đường; hai người cùng thêm việc thứ 300 thì đúng một người được, người kia nhận lời trần;
  dự án đã đóng từ chối mọi thao tác trên với «Dự án đã đóng.».
- AC-8: Given lịch làm cả tuần, When quản trị mở lại Cài đặt › Lịch làm việc và mở Gantt của một dự án có việc qua
  cuối tuần, ở khổ 1280 và 375, Then cả bảy ô thứ đều ở trạng thái bỏ chọn, cột Thứ Bảy, Chủ nhật của Gantt mang nền
  như ngày thường, và trang vừa khổ 375 mà không cuộn ngang.
- AC-9: Given vòng xong, When người đọc `docs/api.md` và `CONTEXT.md`, Then hai tệp nói: lịch chưa đặt thì nghỉ Thứ
  Bảy, Chủ nhật; bỏ chọn hết là không nghỉ ngày nào; trần 300 việc chỉ chặn thêm việc vào dự án. (judgment)

## Coverage

Quét bằng skill morphological-scan, preset test-matrix — bản đầy đủ ở `_acceptance/va-gantt-lich-bay-ngay/coverage-scan.md`.

- Ma trận L, trục L-A trạng thái đã lưu: chưa có cài đặt | có cài đặt chưa từng đặt (ô trống, dữ liệu cũ) | đã đặt khác
  rỗng | đã đặt rỗng [thước CE: `docs/api.md` mục «Lịch làm việc»; migration `20261016120000_du_an_gantt`; chân ngành
  Microsoft Project — Change Working Time, Smartsheet — Working Days: «không nghỉ ngày nào» là lịch hợp lệ]
- Ma trận L, trục L-B đường đọc: `lichLamViec.get` | `duAn.lich` | tự dời và luật phụ thuộc | Hoàn tác [thước CE: mọi
  chỗ gọi `docLichLam`, grep 19/10]
- Ma trận T, trục T-A thao tác: tạo việc | việc con | chuyển vào | thêm mốc | sửa mốc | xoá mốc | thêm phụ thuộc | gỡ
  phụ thuộc | đổi ngày [thước CE: mọi chỗ gọi `docDuAnMo` và `apLich`, grep 19/10]
- Ma trận T, trục T-B trạng thái dự án: mở 299 việc | mở 300 việc | đã đóng [thước CE: `DU_AN.viecToiDa`,
  `docs/api.md` mục «Vòng đời»]

## Đường đo

- Thước: lịch làm cả tuần giữ được · số từ: `lichLamViec.get` và `duAn.lich` sau `datNgayNghiTuan([])` · bảo đảm bởi: AC-1, AC-8
- Thước: dự án đủ 300 việc vẫn sửa được mốc và phụ thuộc · số từ: ma trận chín thao tác × ba trạng thái của bài trần việc · bảo đảm bởi: AC-5, AC-6, AC-7

## Out of scope

- Chọn đủ bảy ngày nghỉ: hợp đồng `datNgayNghiTuan` giữ trần sáu thứ.
- Câu báo mới trên màn Cài đặt khi không nghỉ ngày nào; màn và Gantt không đổi mã.
- Ô chọn «Dự án» bị cắt ở khổ 375 (hạt giống `docs/plan/2026-10-19-hat-giong-o-chon-du-an-375.md`) — hàng riêng.
- Các mục Known limits khác của DA4 (Ngoài-4, 5, 10, 11).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Cột mới `AppSetting.khongNghiTuan` (mặc định `false`); migration chỉ thêm cột, không câu `UPDATE` nào.
- Bài `dg_lich` đã ký của DA4 dựng «lịch trống» bằng mảng rỗng và đòi T7, CN; bài đó không bao giờ đặt rỗng qua API nên
  cờ mới giữ `false` sau nó, bài giữ xanh mà không sửa. Kho test dùng chung cho mọi tệp của một lượt: bài mới của vòng
  đặt cờ thì trả về `false` ở bước dọn và tự kiểm sau dọn.
- Trần 300 khoá hàng `duAn` trong lời kiểm thêm việc, nên chỉ ba đường thêm việc vào dự án chờ nhau.
