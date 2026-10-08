# Sửa paths chết của soan-okr-cung-tro-ly — thiết kế

Hàng F19 của dãy P1, đợt `sau-14-10`. Cổng Đáng `build` do Phan Le Manh ký lúc 2026-10-08T05:56:32Z (luật 31).

## Vấn đề

Pre-merge lọc «hoá cũ theo `paths`» khi `risk_tiers.stale_scope: paths`. Hàm thực hiện là `staleByPaths` trong
`lib/evidence-core.cjs`, và nó **đóng mặc định**: phân loại từng mục `paths` trên cây git đang kiểm, rồi gặp mục đầu
tiên bị từ chối là trả `apply: false` cho cả hồ sơ. Khi đó lưới quay về luật cũ, mọi tệp mã đổi đều làm hồ sơ cũ.

Trên `onehub` `b633a7e3`, hồ sơ `soan-okr-cung-tro-ly` bị từ chối ở
`paths-khong-tro-toi-tep:E5:apps/app/app/(app)/[slug]/settings/to-chuc/**`. Quét đủ 29 eval thì thấy hai mục chết:

| Eval | Mục chết | Tệp đang sống | Căn cứ |
|---|---|---|---|
| E5 | `apps/app/app/(app)/[slug]/settings/to-chuc/**` | `apps/app/app/(app)/[slug]/settings/organization/**` | `to-chuc.tsx`, `chi-tiet*.tsx` của màn Cây tổ chức nằm ở đó; bài DOM `to-chuc-mo-ta.dom.tsx` của E5 đo màn này |
| E17 | `apps/app/lib/messages/okr-tro-ly.ts` | `apps/app/lib/messages/tro-ly-okr.ts` | `settings/okr/the-tro-ly-okr.tsx` và bài DOM `soan-okr-cai-dat.dom.tsx` của E17 đều nhập `@/lib/messages/tro-ly-okr` |

## Cách làm

Sửa đúng hai mục trên trong `_acceptance/soan-okr-cung-tro-ly/evals.yaml`, thay chuỗi nguyên văn. Không dùng regex,
theo bài học «Sửa evals.yaml bằng regex cắt nhầm [slug]». Mọi trường khác của mọi eval giữ nguyên byte: lệnh, kỳ vọng,
chiều đỏ, `inputs`, `status`. Xong thì ghim lại hồ sơ một lần dưới khoá `s4`.

Răng đo của vòng nằm ở `_acceptance/sua-paths-e5-soan-okr/rang/` và gọi thẳng các hàm thật của
`lib/evidence-core.cjs` (`dungCayPaths`, `phanLoaiMucPaths`, `staleByPaths`). Không có bản chép lại luật lọc nào; cây
git dựng bằng `git ls-files -z` như lưới thật.

## Kỳ vọng đã đo trước khi làm

Bộ lọc thật chạy trên bản đã sửa, qua bốn lượt gộp gần nhất của `onehub`. Bộ lọc bật lại (`apply: true`), nhưng chỉ
1/4 lượt hết làm hồ sơ cũ. Ba lượt còn lại vẫn cũ đúng luật, vì E27 (`luat_kho_cay_du`) khai `apps/**` và
`packages/**`: luật kho đo cả cây, nên mọi lượt gộp chạm mã phải chứng lại nó. Vậy F19 bớt được một phần lượt ghim
lại chứ không xoá hết.

## Ngoài phạm vi

- 11 hồ sơ đã ký khác cũng có `paths` chết. Trong đó `soan-okr-song-lai` E3 trỏ `okr/soan/man-soan.tsx`, tệp mà K2
  (#312) đã xoá. Đã báo giám sát; cần Cổng Đáng riêng.
- Một răng chặn PR làm `paths` của hồ sơ đã ký thành chết — nhiều khả năng là việc của kit, không phải của kho.
- Thu hẹp `paths` của E27.
