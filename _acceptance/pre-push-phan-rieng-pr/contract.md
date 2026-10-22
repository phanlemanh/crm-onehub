---
schema_version: 1
feature: pre-push xét phần PR tự thêm khi lần đẩy mang commit mới của onehub, nên lần đẩy chỉ mang mã của người khác không chạy lại test và build
slug: pre-push-phan-rieng-pr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: signed-off
approved_by: Manh Phan
approved_at: 2026-10-21T13:26:49Z
design_doc: docs/superpowers/specs/2026-10-21-pre-push-phan-rieng-pr-design.md
---

# Acceptance Contract: pre-push-phan-rieng-pr

## Context

Đường nhẹ của `.githooks/pre-push` (`scripts/pre-push-t1.mjs`, hồ sơ `pre-push-t1`) quyết theo phần tăng so với đầu
nhánh từ xa. Lần đẩy ngay sau khi gộp `origin/onehub` vào nhánh mang theo mọi tệp người khác vừa đưa vào `onehub`, nên
chạy đủ năm bước (~30 phút) để kiểm lại mã đã qua CI của PR khác. CI thì xét phần PR tự thêm so với `onehub`. Ca thật
`1ddf125b3` (#523): phần tăng 24 tệp, 4 tệp mã của người khác; phần PR tự thêm chỉ có `LO-TRINH.html`. Đề bài do phiên
phân tích `phan-tich-no-verify` giao ngày 21/10, mục 1 và 3.2.

Thuật ngữ của hợp đồng (định nghĩa đầy đủ ở design doc):

- **dòng xét riêng**: dòng stdin có gốc so là sha từ xa (khác 0, có trong kho) và có `refs/remotes/<remote>/onehub`.
- **phần PR tự thêm** của dòng xét riêng: `S = tăng ∩ (riêng_sau ∪ riêng_trước)`, với `nền = merge-base(đỉnh,
  <remote>/onehub)`, `tăng = diff(sha từ xa, đỉnh)`, `riêng_sau = diff(nền, đỉnh)`, `riêng_trước = diff(merge-base(nền,
  sha từ xa), sha từ xa)`; mọi diff là `--name-only --no-renames`. Lần đẩy không mang commit mới của onehub thì `S = tăng`.
- **tệp của onehub**: tệp của `tăng` không thuộc `S` của dòng nào trong lần đẩy.

## Criteria

- AC-1: Given một lần đẩy có ít nhất một dòng xét riêng, When `scripts/pre-push-t1.mjs` phân loại, Then tập xét là hợp
  của `S` các dòng xét riêng và tập tăng như cũ của các dòng khác; tập xét rỗng mà có tệp của onehub → stdout là
  `t1Only.skip`; tập xét khác rỗng → `quyetDinh` như cũ trên tập xét quyết. Đúng bảng 16 ca viết trước ở E1.
- AC-2: Given lần đẩy có tệp của onehub, When phân loại xong, Then stderr đúng một dòng theo một trong ba khuôn của design
  doc mục «Dòng stderr» (rỗng · chỉ T1 · nặng), với `<k>` = số tệp của onehub, `<n>` = cỡ tập xét, danh sách bỏ là
  `t1Only.skip` nối bằng «, »; lần đẩy không có tệp của onehub thì stderr như trước vòng từng byte.
- AC-3: Given lần đẩy không mang commit mới của onehub, hoặc không có dòng xét riêng — ref mới, sha từ xa không có trong
  kho, `<remote>/onehub` vắng —, When phân loại, Then stdout và stderr y như trước vòng: 17 ca của bảng `pre-push-t1` E1
  (trừ ca 6) xanh không sửa, và các ca G7, G9, G11, G13, G15 của E1 ra đúng kết quả luật cũ.
- AC-4: Given một kho git tạm mang bản chép các tệp thật của cổng và `bun` giả, When `git push` thật một đỉnh gộp onehub
  mà phần PR tự thêm rỗng, Then hook thoát 0, in dòng «rỗng» của AC-2, chạy đúng `check-types`, `lint`, `lint:slop`, và
  `verify-gate-shape` in `pre-push: gate matches its shape` cùng `  skipped: test, build`; When đỉnh gộp có một tệp mã
  do chính commit gộp thêm, Then hook chạy đủ năm lệnh theo thứ tự cũ, và `test` giả đỏ thì thoát 1 với
  `` `bun run test` failed ``.
- AC-5: Given cây thật và hai commit treo dựng bằng `commit-tree` (ngoài mọi ref, thư mục làm việc giữ nguyên): `X` =
  một tệp `docs/` trên `origin/onehub~5`, `M` = gộp `X` với `origin/onehub` mang cùng tệp đó, When chạy hook thật với
  stdin đẩy `M` lên trên `X`, Then phần tăng có ít nhất một tệp dưới `apps/` hoặc `packages/` (đối chứng dương), hook
  thoát 0, in dòng «rỗng» với `<k>` = cỡ phần tăng, chạy ba lệnh bằng turbo thật, `verify-gate-shape` thật khớp hình;
  commit treo `M2` = `M` thêm một tệp `.ts` dưới `packages/env/src/` thì bộ phân loại cho stdout rỗng và dòng «nặng»
  gọi tên tệp đó.
- AC-6: Given commit thật `1ddf125b3` và cha thứ nhất của nó, When chạy bộ phân loại với stdin đẩy `1ddf125b3` lên trên
  cha thứ nhất, Then stdout rỗng và stderr đúng
  `pre-push: phần PR tự thêm (1 tệp; 23 tệp của onehub không tính) có tệp T1 mà mã đọc (LO-TRINH.html) — chạy đủ năm bước.`;
  và When chạy bộ phân loại trên mọi commit gộp `origin/onehub` vào nhánh PR giữa 14/10 và `1f6757ba0`, Then kết quả của
  nó khớp một phép tính `S` độc lập bằng lệnh `git` của chính phép đo ở mọi commit, không commit nào luật cũ cho nhẹ mà
  luật mới cho nặng, và phép đo in hai con số «nhẹ theo luật cũ / nhẹ theo luật mới».
- AC-7: Given hồ sơ đã ký `pre-push-t1`, When soát sau vòng này, Then bài kiểm và răng của nó (E1–E8) xanh, còn E9, E10
  (hook thật trên cây thật) chứng ở lượt ghim lại của hồ sơ đó trước Cổng Bằng chứng; ca 6 của E1 mang
  lời hứa mới (gộp onehub mang mã, nhánh chỉ docs → bỏ `test, build`, dòng «rỗng» của AC-2), dòng 6 của `expected` E1
  và Notes của hai hợp đồng ghi lời hứa đổi; `.githooks/pre-push` giống từng byte `origin/onehub`; các neo byte mà
  `rang/dot-bien.mjs` và `rang/mot-nguon.mjs` của `pre-push-t1` cấy đột biến vào xuất hiện đúng một lần. Bài kiểm
  `t1-ma-doc.spec.ts` và `push-ghim-lai-t1.spec.ts` xanh không sửa.
- AC-8: Given `.githooks/gate-shape.json` sau vòng này, When đọc, Then `t1Only.skip` vẫn đúng `["test", "build"]`,
  `classifier` và `sameRuleAs` không đổi, và `vi_sao` nói luật gộp: đỉnh gộp onehub xét phần PR tự thêm, tệp của onehub
  không tính.
- AC-9: Given bản sao các tệp nguồn, When cấy từng đột biến viết trước (bỏ phép giao, bỏ vế `riêng_trước`, nền là đầu
  `origin/onehub` thay merge-base, `riêng_trước` so với nền thay merge-base của nền và sha từ xa, tập xét rỗng coi là
  nặng, phần tăng tính từ cha thứ nhất của đỉnh), Then mỗi đột biến làm đỏ đúng ca đã ghim ở E10; bản sao không đột biến
  thì spec xanh.

## Coverage

- Trục A — hình lần đẩy: đỉnh là gộp onehub | gộp rồi sửa thêm mới đẩy | commit cục bộ chưa đẩy rồi gộp onehub | gộp
  nhánh không thuộc onehub | ref mới có đỉnh gộp | đẩy lại cùng sha [thước CE: githooks(5) + `git merge-base`]
- Trục B — phần PR tự thêm: rỗng | chỉ T1 | có `t1_ma_doc` | có mã do commit gộp thêm | có mã do giải xung đột ghép |
  tệp PR từng sửa bị trả về bản onehub | có `.github/**` [thước CE: các nhánh của `quyetDinh` trong
  `.github/scripts/phan-loai.mjs` + ca rỗng riêng của vòng]
- Trục C — trạng thái nền: `<remote>/onehub` có | vắng | đã đi tiếp sau lần gộp [thước CE: `git merge-base
  --is-ancestor`]
- Trục D — nhiều dòng: dòng mang onehub mới + ref mới chỉ docs | dòng mang onehub mới + dòng khác sửa đúng tệp của onehub [thước CE: AC-1 cũ
  «hợp qua mọi dòng»]
- Cross-cutting: lời hứa đã ký của `pre-push-t1` → AC-7; hook và cổng thật → AC-4, AC-5; dữ liệu thật → AC-6.
- Core → AC: A×B×C → AC-1, AC-2, AC-3; D → AC-1; hook → AC-4; cây thật → AC-5, AC-6; khai → AC-8; răng → AC-9.
  Later: chạy riêng các bài đọc khi phần PR tự thêm chỉ có `t1_ma_doc` (Hỏi-2, khuyến nghị để vòng sau); hàm «phần PR tự thêm»
  dùng chung với CI ở kit. Never: tự `fetch` trong hook; đọc trạng thái PR qua mạng; coi `LO-TRINH.html` là T1 thuần.
- [NGÀNH: githooks(5) — dòng `<local ref> <local sha> <remote ref> <remote sha>`] · [NGÀNH: GitHub `refs/pull/N/merge`
  — CI thử đầu PR gộp với đầu nhánh nền, so `HEAD^1..HEAD`].
- [GIẢ ĐỊNH] Tệp của onehub đã qua CI của PR đưa nó vào `onehub`; tổ hợp mã PR × mã onehub mới do CI trên merge-ref thử.

## Đường đo

Không có ngưỡng: vòng không đi từ Cổng Đáng (không có `opportunity.md`). Số đo lịch sử ở AC-6 là bằng chứng phạm vi, không
phải ngưỡng nghiệm thu.

## Out of scope

- Chạy một phần `test` theo bên đọc của `t1_ma_doc`; đổi vòng lặp của `.githooks/pre-push`; đổi `verify-gate-shape.mjs`.
- Đổi `phan-loai.mjs`, `t1_skip_globs`, `t1_ma_doc`, hay việc `LO-TRINH.html` kéo nặng ở CI.
- Lệ `--no-verify` của đợt, phân hạng lần đẩy trong khoá máy của điều phối, tệp sinh gây xung đột (việc của kit).
- Kiểm PR nháp hay `ci-ok` qua mạng trong hook.

## Notes

- **Ca #523 (`1ddf125b3`) không được giải** theo khuyến nghị Hỏi-2: phần PR tự thêm chỉ có `LO-TRINH.html`, mà tệp đó là
  `t1_ma_doc`, nên vẫn chạy đủ năm bước. Vòng này đổi ở ca đó dòng stderr (gọi tên tệp, đếm 23 tệp của onehub), không
  đổi kết cục. Số đo lịch sử (design doc): 6 → 38 trên 412 lần gộp.
- Phạm vi theo khuyến nghị Hỏi-3: luật áp cho mọi lần đẩy mang commit mới của onehub, không chỉ đỉnh là commit gộp như
  câu giao. Lối kia thêm điều kiện «đỉnh hai cha, cha thứ hai thuộc onehub»: ca gộp rồi sửa thêm (G8) đi nặng như hôm nay.
- Lời hứa của hồ sơ đã ký đổi theo vòng này (bản đối ở Notes của `pre-push-t1`): ca 6 của E1 `pre-push-t1` — nhánh chỉ
  docs gộp onehub mang mã — từ «chạy đủ năm bước» sang «bỏ `test, build`». Đây là đúng hành vi đề bài xin.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-22:
  - Ngoài-1: Câu giải thích của khối t1Only trong bản khai cổng tả lệch cách so ở đầu nhánh từ xa (so với điểm rẽ của nền, không phải với nền); hook vẫn chạy đúng luật.
  - Ngoài-2: Khi phần PR tự thêm chỉ có tài liệu dưới .github/, dòng báo của hook gọi chúng là «tệp ngoài T1» và không nói lý do thật là thư mục .github; quyết định chạy đủ vẫn đúng.
  - Ngoài-3: Phép đo lịch sử chưa tách ca bộ phân loại sập khỏi ca nó cho nặng đúng; lượt đo 21/10 không có ca nào sập.
  - Ngoài-4: Cùng chỗ với Ngoài-1 — câu giải thích tả sai vế so ở đầu nhánh từ xa, có thể làm người đọc hiểu nhầm.
  - Ngoài-5: Răng hồ sơ cũ chỉ kiểm dòng 6 của E1 cũ không còn ghi «chạy đủ», chưa ghim nội dung lời hứa mới; hành vi ca 6 vẫn được bài kiểm chạy thật.
