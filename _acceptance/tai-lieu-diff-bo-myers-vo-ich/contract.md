---
schema_version: 1
feature: soSanh bỏ vòng Myers mức khối vô ích khi cận dưới số bước sửa đã vượt trần, để ca tat-dinh của tai-lieu-diff hết đỏ chập chờn trên CI
slug: tai-lieu-diff-bo-myers-vo-ich
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: approved
design_doc: docs/superpowers/specs/2026-09-28-tai-lieu-diff-bo-myers-vo-ich-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-28T13:56:23Z
---

# Acceptance Contract: tai-lieu-diff-bo-myers-vo-ich

## Context

Ca `tai-lieu-diff > tat-dinh: dong ho chay nhanh hay cham thi diff va diffHash van y het`
chạy sát trần 5 000 ms của bun trên CI và đỏ ở ba lượt ngày 28/09 (5 079, 5 065, 5 133 ms).
Điều tra (design doc) cho thấy không có nhánh nào phụ thuộc đồng hồ: jsdiff so `Date.now()`
với `Infinity`. Khoảng 40 % thời gian của mỗi `soSanh` trên hai bản khác nhau hoàn toàn là
`diffArrays` mức khối chạy đủ 2 000 vòng rồi trả `undefined`. Vòng này chặn lời gọi đó bằng
cận dưới đa tập `N + M − 2·|giao|`, cho ra đúng kết quả cũ, và không đặt trần thời gian riêng.

Source input: prompt — «tìm vì sao ca này chậm […] sửa gốc nếu có; nếu chỉ là khối lượng thì
đặt trần thời gian riêng cho ca này qua hằng trong module cấu hình của khu».

## Criteria

- AC-1: Given bảy cặp văn bản viết trước (`ngan`, `dai-khac-het`, `bien-dung-tran` với cận dưới đúng bằng `tranSuaKhoi`, `bien-qua-tran` với cận dưới `tranSuaKhoi + 1`, `dao-thu-tu`, `dai-sua-rai-rac` với 1 500 khối sửa 10 khối rải rác, `lap-khoi` với 1 500 khối mà 1 400 khối cùng một câu, sửa 10 khối), When `soSanh` sau vòng chạy trên từng cặp, Then `diffHash` của từng cặp trùng đúng 64 ký tự với giá trị ghim từ mã ở `cfac5bea`.
- AC-2: Given hai bản 200 000 ký tự khác nhau hoàn toàn (cận dưới vượt `tranSuaKhoi`), When `soSanh` chạy, Then vòng Myers mức khối không chạy (`Date.now` được gọi 0 lần trong lời gọi đó); đối chứng: Given cặp `dai-sua-rai-rac` (cận dưới trong trần), When `soSanh` chạy, Then `Date.now` được gọi ít nhất một lần.
- AC-3: Given mỗi đột biến trong bốn đột biến viết trước của `soSanh` (so `>=` thay `>`; không đếm phần chung; đếm phần chung theo tập khoá riêng biệt thay vì đa tập; bỏ hẳn phép chặn), When chạy đúng ca bắt nó trong một worktree tạm, Then ca đó đỏ với thông điệp ghim tên fixture hay tên ca; bản lành trên cùng worktree xanh.
- AC-4: Given thân ca `tat-dinh` (hai `soSanh` 200 000 ký tự, một lần dưới đồng hồ giả), When chạy mười lượt xen kẽ trên mã HEAD và mã ở `cfac5bea` (mốc ghim, không phải merge-base trôi), cùng máy, Then trung vị HEAD ≤ 0,75 × trung vị gốc, và mọi lượt cho `diffHash` dưới đồng hồ giả bằng lượt đồng hồ thật; Given mốc gốc đã chứa `canDuoiSua`, Then phép đo thoát 2 «goc so da chua ban sua» thay vì in tỉ lệ.
- AC-5: Given `tai-lieu-diff.spec.ts` sau vòng, When đọc ca `tat-dinh`, Then ca đó không có đối số trần thời gian riêng, spec không gọi `setDefaultTimeout` và không truyền tuỳ chọn `timeout` cho `test`/`describe`, `TRAN_MS` không đổi, không `bunfig.toml` nào ở gói hay ở gốc có khoá `timeout`, và script `test` của `packages/validation/package.json`, của `package.json` gốc cùng `turbo.json` không có cờ `--timeout`.
- AC-6: Given hồ sơ đã ký `kho-tai-lieu`, When chạy hai eval có `paths` chứa `tai-lieu-diff.ts` (E6 `ktl_so_va_dat`, E13 `ktl_diff`), Then cả hai thoát 0 ở HEAD.
- AC-7: Given `packages/validation/src/tai-lieu-diff.ts` sau vòng, When đọc mã, Then phép chặn dùng `TAI_LIEU.diff.tranSuaKhoi`, mọi literal số mới so với `cfac5bea` thuộc {0, 1, 2} (hằng toán học của công thức, không số ma), không có chú thích, và chữ ký export của `soSanh`, `diffHash`, `suKienDoi` bằng ở `cfac5bea`.

## Coverage

Bỏ `morphological-scan` — không gian đầu vào của phép chặn có đúng một trục, liệt kê tay đủ
ở đây (sổ quyết định, entry «bỏ coverage-scan»).

- Trục — cận dưới `L` so với trần `T` và khoảng cách thật `D`: `L ≤ T, D ≤ T` (`ngan`,
  `dai-sua-rai-rac`, biên `bien-dung-tran` với `L = D = T`) · `L ≤ T < D` (`dao-thu-tu`, chặn
  không bắt, `diffArrays` vẫn bỏ cuộc) · `L > T` (`dai-khac-het`, biên `bien-qua-tran` với
  `L = T + 1`). Ô `L > T ≥ D` không tồn tại vì `L ≤ D`.
- Trục — cách tính `L`: khối từng đôi khác nhau (sáu fixture đầu) · khối lặp nhiều lần
  (`lap-khoi`, nơi đếm theo tập thay đa tập làm `L` vượt trần sai). Phép bằng của khoá
  `[kieu, chu]` đúng là phép bằng của `giong` (so nguyên chuỗi), nên không có ô «bằng theo
  `giong` mà khác chuỗi thô». [thước CE: vòng `while (editLength <=
  maxEditLength …)` của `diff@8.0.4/libesm/diff/base.js`]
- Cross-cutting: đầu ra y hệt (AC-1), việc vô ích bị bỏ (AC-2), thước bắt được đột biến (AC-3),
  tốc độ so với gốc (AC-4), không nới thước (AC-5), hồ sơ đã ký (AC-6), luật mã của kho (AC-7).

## Out of scope

- Bỏ lần parse thứ hai trong `khoiCua` (`nap(chuanHoa(md))`) — có thể đổi `diffHash` đã lưu.
- Chặn tương tự ở mức từ (`diffWordsWithSpace` trong `soTheoTu`).
- Tăng tốc ca đảo thứ tự (`L ≤ T < D`) — cần LCS thật.
- Đặt `timeout` cho `diffArrays` hay trần thời gian riêng cho ca `tat-dinh`.
- Đo thời gian trên CI như một eval — CI không chạy trong lượt chấm; số CI của PR ghi vào mô tả PR.

## Notes

- Điều kiện xét lại (sổ quyết định): ca `tat-dinh` trên CI vượt 3 500 ms ở bất kỳ lượt nào sau
  merge thì mở vòng mới cho lần parse thứ hai hoặc trần riêng.
- AC-4, AC-7 neo mốc so ở `cfac5bea`, không ở merge-base: sau khi merge, merge-base của nhánh
  sau đã chứa bản sửa và phép so mất nghĩa; mốc ghim giữ lời hứa là của vòng này.
- AC-2 đếm `Date.now` làm proxy cho số vòng Myers vì jsdiff gọi nó mỗi vòng. Nếu một bản jsdiff
  sau thôi gọi, vế 0 lần sẽ xanh rỗng; đối chứng dương của AC-2 là thứ bắt được điều đó.
