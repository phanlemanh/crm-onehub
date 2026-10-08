---
schema_version: 1
feature: "Sửa hai paths chết (E5, E17) trong evals.yaml của hồ sơ đã ký soan-okr-cung-tro-ly để lưới hoá cũ lọc theo paths được, rồi ghim lại hồ sơ một lần"
slug: sua-paths-e5-soan-okr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: verified
approved_by: Phan Le Manh
approved_at: 2026-10-08
design_doc: docs/superpowers/specs/2026-10-08-sua-paths-e5-soan-okr-design.md
---

# Acceptance Contract: sua-paths-e5-soan-okr

## Context

Hàng F19 của dãy P1, đợt `sau-14-10`. Cổng Đáng `build` do Phan Le Manh ký lúc 2026-10-08T05:56:32Z (luật 31 của đợt).
Lưới trước-merge lọc «hoá cũ theo `paths`» (`risk_tiers.stale_scope: paths`) bằng `staleByPaths` của
`lib/evidence-core.cjs`. Hàm này đóng mặc định: một mục `paths` không trỏ tới tệp nào là bộ lọc tắt cho cả hồ sơ.
`soan-okr-cung-tro-ly` có hai mục như vậy: E5 trỏ `settings/to-chuc/**` và E17 trỏ `lib/messages/okr-tro-ly.ts`.
Vì thế hồ sơ cũ sau mọi lượt gộp chạm mã.

Source input: `opportunity.md` · design doc · `lib/evidence-core.cjs` (`phanLoaiMucPaths`, `staleByPaths`) · LUAT.md
của đợt, luật 31.

## Criteria

- AC-1: Given `_acceptance/soan-okr-cung-tro-ly/evals.yaml` ở HEAD và cây git của HEAD (`git ls-files -z`), When phân loại mọi mục `paths` của mọi eval bằng `phanLoaiMucPaths` rồi gọi `staleByPaths` của `lib/evidence-core.cjs`, Then không mục nào bị từ chối và kết quả là `apply: true`; cùng phép đo trên bản `evals.yaml` ở `onehub` `b633a7e3` cho `apply: false` với lý do bắt đầu `paths-khong-tro-toi-tep:E5:`.
- AC-2: Given `evals.yaml` ở HEAD, When khớp từng tệp với `paths` của CHÍNH eval canh nó bằng `evalPathsOf` + `pathGlobToRe`, và đưa bốn tệp vào `staleByPaths`, Then `apps/app/app/(app)/[slug]/settings/organization/to-chuc.tsx` khớp một mục của E5 và `apps/app/lib/messages/tro-ly-okr.ts` khớp một mục của E17; trong `staleByPaths`, hai tệp đó nằm trong `kept`, còn `.github/workflows/acceptance.yml` và `scripts/dieu-phoi/giu-nhip.mjs` nằm trong `skipped`, không tệp nào thừa hay thiếu.
- AC-3: Given `evals.yaml` của hồ sơ ở HEAD và ở `onehub` `b633a7e3`, When đọc cả hai bằng `parseEvals` của `lib/eval-yaml.cjs` và lấy `git diff -U0` giữa hai bản, Then hai bản có cùng danh sách id theo cùng thứ tự; mọi trường ngoài `paths` giống hệt nhau; `git diff -U0` có đúng 2 dòng `-` và 2 dòng `+`, mỗi cặp chỉ khác đúng một chuỗi viết trước — E5 `apps/app/app/(app)/[slug]/settings/to-chuc/**` → `apps/app/app/(app)/[slug]/settings/organization/**`, E17 `apps/app/lib/messages/okr-tro-ly.ts` → `apps/app/lib/messages/tro-ly-okr.ts`.
- AC-4: Given hồ sơ đã ghim lại trong vòng này, When đọc dòng `kind: repin` cuối của `_acceptance/soan-okr-cung-tro-ly/run-log.jsonl` và frontmatter `evidence-report.md`, Then dòng ấy là dòng `kind: repin` DUY NHẤT mà diff của nhánh so với điểm rẽ khỏi `onehub` thêm vào, và `sha` của nó có commit sửa `evals.yaml` làm tổ tiên; `sha` bằng `verified_commit`; `suites_exit` toàn 0; khoá của `evals_exit` bằng đúng tập eval máy (test/script không khai `status: not-run`) của `evals.yaml` ở HEAD, mọi mã là 0; `human_signoff` của báo cáo giữ nguyên như ở `b633a7e3`.
- AC-5: Given nhánh của vòng ở bước cuối trước khi đẩy, đã commit hết, When chạy `bash scripts/pre-merge-check.sh . --base origin/onehub` không `--slug`, Then lệnh thoát 0 và không có dòng `VIOLATION [soan-okr-cung-tro-ly]`.
- AC-6: Given diff của nhánh so với điểm rẽ khỏi `onehub`, When liệt tệp đổi bằng `git diff --name-only` và đọc `git diff -U0` của từng tệp trong hồ sơ đã ký, Then mọi tệp nằm trong ranh giới đã duyệt: `_acceptance/soan-okr-cung-tro-ly/{evals.yaml,run-log.jsonl,evidence-report.md}`, `_acceptance/sua-paths-e5-soan-okr/**`, `_acceptance/config.yaml`, `docs/superpowers/specs/2026-10-08-sua-paths-e5-soan-okr-design.md`, `docs/superpowers/plans/2026-10-08-sua-paths-e5-soan-okr.md`, `PRODUCT-MAP.md`, `LO-TRINH.html`; `_acceptance/soan-okr-cung-tro-ly/contract.md` không đổi; `run-log.jsonl` của hồ sơ đã ký và `_acceptance/config.yaml` chỉ có dòng thêm, 0 dòng `-`.
- AC-7: Given một bản sao tạm của HEAD (`git worktree`), When thêm một commit vừa đổi một byte trong `scripts/dieu-phoi/giu-nhip.mjs` (ngoài mọi `paths` của hồ sơ) vừa thêm một tệp vào `_acceptance/soan-okr-cung-tro-ly/` để hồ sơ vào diff, rồi chạy `bash scripts/pre-merge-check.sh . --base <commit trước đó>` không `--slug` trên bản sao, Then không có dòng `VIOLATION [soan-okr-cung-tro-ly]`; cùng lệnh trên bản sao mà commit ấy trả `evals.yaml` về bản `b633a7e3` thì có dòng `VIOLATION [soan-okr-cung-tro-ly]: evidence is stale` nêu `scripts/dieu-phoi/giu-nhip.mjs`.

## Coverage

Bỏ quét không gian AC (entry `descope` «bỏ coverage-scan» trong sổ quyết định). Bài toán một chiều: hai chuỗi trong một
tệp, cộng một lượt ghim lại. Bảy AC phủ đủ năm câu: bộ lọc bật không (AC-1), lọc có đúng không (AC-2), lưới thật có hết làm hồ sơ cũ
vì một tệp ngoài `paths` không (AC-7), có lỡ đổi gì ngoài hai chuỗi không (AC-3, AC-6), hồ sơ còn ký và còn
xanh không (AC-4, AC-5).

## Out of scope

- 11 hồ sơ đã ký khác cùng có `paths` chết (đo 08/10): doi-ten-onehub-center, giai-doan-thoa-thuan, khoa-con-bat-xa-tran,
  khung-tao-okr-nhu-deal, nguon-keo-tha-reui, soan-okr-song-lai, the-gop-y-okr, to-chuc-danh-sach-chi-tiet, toan-canh-okr,
  tro-ly-okr-de-xuat, tro-ly-okr-nen. Đã báo giám sát (`yeu-cau/P1-18.json`).
- Răng chặn một PR làm `paths` của hồ sơ đã ký thành chết — việc của kit `acceptance-gate`.
- Thu hẹp `paths` của E27: luật kho đo cả cây `apps/` và `packages/`, nên nó cũ sau lượt gộp chạm mã là đúng luật.
- Đổi lệnh, kỳ vọng, chiều đỏ hay `inputs` của bất kỳ eval nào của `soan-okr-cung-tro-ly`.

## Notes

- Lưới hoá cũ chỉ soi hồ sơ có tệp trong diff của PR (`slug_in_diff` của `scripts/pre-merge-check.sh`), nên hồ sơ
  này chỉ bị soi khi một PR chạm `_acceptance/soan-okr-cung-tro-ly/` — đúng các lượt ghim lại đêm 07–08/10.
- Kỳ vọng đã đo trước khi làm: chạy bộ lọc trên bốn lượt gộp gần nhất của `onehub`, chỉ 1/4 lượt hết làm hồ sơ cũ. Ba
  lượt còn lại vẫn cũ đúng luật, do E27.
- Sửa hai chuỗi bằng thay chuỗi nguyên văn, không bằng regex (bài học «regex cắt nhầm [slug]»).
- Tệp ngoài ranh giới hàng đã xin `cham-tep` (`yeu-cau/P1-19.json`): `_acceptance/config.yaml` (thêm khoá `f19_*`),
  design doc và kế hoạch của vòng, bản đồ sản phẩm.
