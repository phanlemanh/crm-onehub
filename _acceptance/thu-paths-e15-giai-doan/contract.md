---
schema_version: 1
feature: Đổi một tệp mà không eval nào của hồ sơ đọc thì không kéo hồ sơ đó vào ghim lại — E15 của giai-doan-thoa-thuan chỉ theo dõi tệp chữ của màn giai đoạn, và eval judgment khai paths đúng bằng tệp nó đọc
slug: thu-paths-e15-giai-doan
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [tooling]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-16T05:50:40Z
design_doc: docs/superpowers/specs/2026-10-16-thu-paths-e15-giai-doan-design.md
---

# Acceptance Contract: thu-paths-e15-giai-doan

## Context

`pre-merge-check` chỉ tính một tệp đổi vào hoá cũ khi nó khớp `paths` của một eval (`staleByPaths`). Một eval
judgment không khai `paths` làm cả hồ sơ rơi về luật cũ, và E15 của `giai-doan-thoa-thuan` khai cả
`apps/app/lib/messages/**`, nên một PR chỉ sửa chữ ở màn khác vẫn bị đòi ghim lại hồ sơ không liên quan (#424 sửa
`tin-hieu.ts` làm #427 phải ghim lại). Vòng này khai `paths` đúng bằng tệp được đọc, chỉ ở các hồ sơ không bị kéo ghim
lại, không đổi thứ được đo.

Source input: `_acceptance/thu-paths-e15-giai-doan/opportunity.md` (Cổng Đáng `build`, 2026-10-16T04:38:49Z; hàng F31
của `docs/plan/lo-trinh-okr.json`).

## Criteria

- AC-1: Given `evals.yaml` của `giai-doan-thoa-thuan` sau vòng này, When đọc `paths` của E15, Then mục
  `apps/app/lib/messages/**` được thay bằng đúng các tệp chữ mà mã dưới `settings/giai-doan/**` và `deals/**` nhập
  thẳng (hôm nay: `settings.ts`, `deals.ts`, `crm.ts`), ba mục còn lại giữ nguyên chữ; xét MỌI tệp
  `apps/app/lib/messages/*.ts` của cây, glob của E15 giữ đúng tập tệp chữ suy từ import đó và không giữ tệp nào khác.
- AC-2: Given cây có cả vòng này và F23 (#427) trên `onehub`, When bộ lọc hoá cũ của `pre-merge-check` xét
  `giai-doan-thoa-thuan` với một tệp đổi duy nhất, Then tệp chữ ngoài màn (`apps/app/lib/messages/tin-hieu.ts`) bị bỏ
  qua, còn `apps/app/lib/messages/settings.ts` vẫn bị giữ (hồ sơ hoá cũ).
- AC-3: Given danh sách hồ sơ đóng của vòng ở một nguồn duy nhất `_acceptance/thu-paths-e15-giai-doan/danh-sach.txt`
  và mốc cố định `5ac01b453` (đỉnh `onehub` lúc dựng; chủ kho chọn lối A ở P1-26), When kiểm, Then (a) danh sách bằng
  đúng tập luật chọn tại mốc — hồ sơ có eval judgment thiếu `paths` ở cây mốc, không ở trạng thái
  `da-cham-boi-thuc-te`, thêm `paths` xong thì không hoá cũ ở cây mốc hoặc chưa ghim — trừ hồ sơ hoá cũ ở HEAD do PR khác,
  mỗi hồ sơ bị trừ được in tên và lý do, và không bị vòng này chạm; (b) danh sách có `thu-haiku-tro-ly-okr`, hồ sơ chủ kho
  gọi tên (`ghim-thuoc-soi-xem-okr` thuộc nhóm bị trừ: thêm `paths` ở lần ghim kế của chính nó); và (c) mọi eval judgment
  của các hồ sơ trong danh sách, không khai `not-run` và có `inputs` giải được, có `paths` chứa mọi input đã quy về gốc kho
  (input khai tương đối thư mục hồ sơ được giải từ thư mục hồ sơ).
- AC-4: Given diff `evals.yaml` từ merge-base tới HEAD, When so từng eval của mọi hồ sơ, Then ngoài E15 của
  `giai-doan-thoa-thuan`, thay đổi duy nhất là khối `paths` thêm vào eval judgment của các hồ sơ trong danh sách, với
  giá trị bằng đúng inputs quy đổi; không trường nào khác của eval nào đổi chữ, không `evals.yaml` nào ngoài danh sách
  bị chạm (trừ `giai-doan-thoa-thuan` và chính `_acceptance/thu-paths-e15-giai-doan/**`, không miễn gì khác), và không
  tệp nào dưới `lib/` đổi.
- AC-5: (cross-layer) Given các hồ sơ đã ký trong danh sách, When chạy bộ lọc hoá cũ của `pre-merge-check` (cùng
  `staleByPaths`, cây git của HEAD) với mọi tệp đổi từ `verified_commit` của chúng, Then mỗi hồ sơ không còn tệp nào bị
  giữ (`SACH`); hồ sơ chưa ghim báo `CHUA_GHIM`, không lỗi.
- AC-6: Given eval judgment khai `not-run`, không có `inputs`, có input trỏ tệp không còn trong cây, hay thuộc hồ sơ
  `da-cham-boi-thuc-te` (thước đã khoá), When công cụ
  chạy `--ghi`, Then eval đó không bị thêm `paths` và lệnh `--ke` in nó thành `BO_QUA <hồ sơ>#<eval>: <lý do>`.

- AC-7: (cross-layer) Given cây ở merge-base và cây ở HEAD, When chạy `bash scripts/pre-merge-check.sh` thật, không
  `--base`, trên từng cây, Then mọi hồ sơ đã ký trong danh sách không có trong tập hồ sơ in `evidence is stale` ở cây
  sau và có trong tập ấy ở cây trước — trừ hồ sơ mà lưới không in dòng nào ở cây trước (không tệp nào đổi từ lúc ghim); không hồ sơ
  nào mới vào tập; số đếm sau nhỏ hơn số đếm trước; và không hồ sơ nào trong danh sách còn dòng
  `bộ lọc paths không áp (eval-ngoai-may-thieu-paths:<id>)` với `<id>` là một eval judgment.

## Coverage

- Trục A — Loại eval: judgment | ui-check | test/script [thước CE: bốn giá trị `EXEC` ở `lib/evidence-core.cjs:510`] →
  AC-3, AC-6 (judgment), AC-1 (ui-check E15); test/script thiếu `paths` là Later.
- Trục B — `paths` so với tệp được đọc: thiếu | hẹp hơn | khớp | rộng hơn [thước CE: `them-paths.mjs --ke` (53 thiếu,
  18 hẹp hơn, 42 khớp); NGÀNH: Turborepo/Nx `inputs` — khai thiếu cho cache trúng sai] → AC-3 (thiếu), AC-1 (rộng hơn);
  hẹp hơn là Later.
- Trục C — Nguồn khai tệp đọc: inputs gốc kho | inputs tương đối hồ sơ | input trỏ tệp mất | không inputs [thước CE:
  quét 113 eval judgment] → AC-3, AC-6.
- Trục D — Hồ sơ sau khi sửa: chưa ghim | đã ký và sạch | đã ký mà vẫn hoá cũ [thước CE: `mo-phong.mjs` trên
  `onehub 34d31a8bf`: 3 | 4 | 44] → AC-3, AC-5; «vẫn hoá cũ» là Later (Hỏi-2).
- Cắt ngang: không đổi thứ được đo; không chạm `lib/` → AC-4; đầu ra thật của `pre-merge-check` → AC-7.

## Đường đo

- Ngưỡng «số hồ sơ hoá cũ giảm so với 245»: AC-7 chạy `pre-merge-check` thật trên merge-base và HEAD, khẳng định số
  sau nhỏ hơn số trước và không hồ sơ nào mới vào tập; AC-5 khẳng định từng hồ sơ đã ký trong danh sách sang `SACH`.
- Ngưỡng «không hồ sơ nào còn lý do `eval-ngoai-may-thieu-paths` do một eval judgment»: AC-7 đo ở các hồ sơ trong danh
  sách. Toàn kho thì KHÔNG đạt trong vòng này: 44 hồ sơ đợi lần ghim kế (Hỏi-2) và ba eval không suy được paths
  (`okr-loai-hoc-tap` E14, `chu-mac-dinh-thu-vien-ngoai` E10, `cua-so-tro-chuyen-noi-tieng-viet` E20). Ký Hỏi-2 theo
  khuyến nghị là đổi câu SỐNG này thành «ở các hồ sơ trong danh sách».
- Ngưỡng «đổi tệp chữ ngoài màn không làm `giai-doan-thoa-thuan` hoá cũ»: AC-2.
- Ngưỡng «không eval judgment nào bị khai `paths` khác tệp nó đọc» (CHẾT): AC-4.
- Đếm 7 ngày sau gộp (số PR bị đòi ghim lại một hồ sơ mà nó không chạm vật đo) là việc của Cổng Giá trị, đọc từ nhật
  ký CI.

## Out of scope

- 44 hồ sơ đã ký mà thêm `paths` xong vẫn hoá cũ thật: thêm `paths` vào lần ghim lại kế tiếp của chính chúng
  (`them-paths.mjs --kiem --ho-so <slug>`), không ghim lại hàng loạt trong vòng này (Hỏi-2).
- Thu `paths` của `gioi-han-duyet-cay-okr` (Hỏi-1): bao đóng import các trang nó đo rộng hơn glob hiện tại, thu là đi
  ngược thứ nó đọc.
- 18 eval judgment có `paths` hẹp hơn `inputs` khi so chuỗi nguyên văn; theo luật lưới (khớp glob, trừ `_acceptance/` và
  `risk_tiers.t1_skip_globs`, kể cả `CONTEXT.md`, `AGENTS.md` ở gốc) không eval nào bỏ sót tệp mà lưới tính (đếm 16/10 trên
  `onehub d5e01c5a3`); việc dọn chuỗi thuộc hàng F32.
- Eval test/script và ui-check thiếu `paths`, `paths` trỏ tệp mất: không có `inputs` để suy, việc của hàng vệ sinh.
- Sửa `lib/evidence-core.cjs` (tệp của kit): đề xuất cho kit đi qua yêu cầu `viec-phu`.

## Notes

- Hạng T2: chỉ `_acceptance/**` và dòng thêm vào `_acceptance/config.yaml`. Hồ sơ đã ký bị chạm: gửi `cham-tep` trên
  #375 trước khi sửa; hồ sơ nào hoá cũ khi bị chạm thì ghim lại trong cùng PR.
- Phụ thuộc: AC-2 cần F23 (#427) trên `onehub`. Thứ tự gộp: #427 trước, rồi vòng này.
- Hai hồ sơ chủ kho gọi tên (`thu-haiku-tro-ly-okr` E8, `ghim-thuoc-soi-xem-okr` E3) chờ P0 gộp #436 và PR thu-haiku.
  Lúc dựng mà chúng không thoả luật chọn (thêm `paths` xong vẫn hoá cũ) thì máy dừng, hỏi chủ kho: ghim lại chúng trong
  PR, hay để tới lần ghim kế — không tự bỏ chúng khỏi danh sách.
- Hỏi-1, Hỏi-2: xem design doc mục «Hỏi chủ kho».
- Known limits — chọn ở Cổng Bằng chứng 2026-10-16:
  - Ngoài-1: Mô tả trong hồ sơ nghiệm thu về dòng kết quả cuối của một bước kiểm đã cũ so với dòng thật mà công cụ in ra. Kết quả kiểm vẫn đúng, chỉ có chữ mô tả lệch nên người đọc đối chiếu có thể thấy khác nhau.
  - Ngoài-2: Một bài kiểm nghiệm thu bị bỏ qua có thể lặng lẽ biến mất khỏi hồ sơ mà công cụ kiểm vẫn báo đạt. Chỉ xảy ra khi ai đó cố ý đổi loại hoặc xoá bài kiểm đó, và không làm sai kết quả đo hiện tại.
  - Ngoài-3: Mô tả trong hồ sơ nghiệm thu về dòng kết quả cuối của một bước kiểm đã cũ so với dòng thật mà công cụ in ra. Kết quả kiểm vẫn đúng, chỉ có chữ mô tả lệch.
  - Ngoài-4: Nếu ai đó đổi loại một bài kiểm đã bị bỏ qua rồi thêm phạm vi theo dõi cho nó, bước kiểm phụ vẫn báo đạt dù đáng lẽ phải bắt. Đây là trường hợp hiếm, chỉ do chỉnh tay cố ý, và không ảnh hưởng đến việc hồ sơ nào bị đòi ghim lại.
  - Ngoài-5: Nếu chạy lại bước kiểm tra từ nhánh này sau khi đã gộp, công cụ có thể lấy nhầm mốc so sánh và báo sai. Lúc ký và gộp thì kết quả vẫn đúng.
  - Ngoài-6: Sau khi vòng này được gộp, chạy lại phép kiểm trên một nhánh mới có thể báo lỗi giả cho tám hồ sơ. Việc gộp hôm nay không bị ảnh hưởng.
  - Ngoài-7: Công cụ có thể coi nhầm một hồ sơ là chưa có tệp nào đổi trong vài tình huống hiếm. Với tám hồ sơ hiện tại thì kết quả vẫn đúng.
  - Ngoài-8: Phép kiểm có thể bỏ qua nhầm một hồ sơ mà lưới nghiệm thu thật ra đã bỏ dở, nên chưa đo được chắc chắn. Với dữ liệu hiện tại thì chưa gây sai kết quả.
  - Ngoài-9: Công cụ kiểm tra nội bộ chỉ đọc một phần danh sách tệp được miễn, nên sau này có thể báo đỏ nhầm hoặc xanh nhầm cho một hồ sơ. Hôm nay kết quả vẫn đúng, người dùng chưa bị ảnh hưởng.
  - Ngoài-10: Bài thử kiểm tra chính bộ kiểm tra chưa chạy đúng lệnh mà chủ kho đã ký cho hai hồ sơ được gọi tên. Bộ kiểm tra có thể sai mà bài thử vẫn báo là bắt được.
  - Ngoài-11: Khi công cụ kiểm tra gặp lỗi giữa chừng, nó để lại một bản sao kho tạm trên máy. Chỉ tốn chỗ và gây rối nhẹ, không ảnh hưởng người dùng sản phẩm.
  - Ngoài-12: Bài thử có thể báo xanh dù hai phép thử chưa chạy, nếu sau này một hồ sơ khác thay đổi. Hiện tại chưa xảy ra.
  - Ngoài-13: Bài thử kiểm tra chính bộ kiểm tra không phủ hết mọi trường hợp đã hứa và chạy một lệnh khác với lệnh đã ký. Bộ kiểm tra có thể bỏ sót lỗi mà vẫn báo là bắt được hết.
