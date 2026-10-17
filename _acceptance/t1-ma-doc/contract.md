---
schema_version: 1
feature: tệp T1 mà bài kiểm, bản dựng hay runtime đọc không còn được CI và pre-push tính là nhẹ; một nguồn luật trong _acceptance/config.yaml cho cả hai, có răng giữ danh sách đủ
slug: t1-ma-doc
owner: manh@mstar.vn
risk_tier: T2
surfaces: []
status: approved
approved_by: manh
approved_at: 2026-10-17T01:41:04Z
design_doc: docs/superpowers/specs/2026-10-17-t1-ma-doc-design.md
---

# Acceptance Contract: t1-ma-doc

## Context

CI (`.github/scripts/phan-loai.mjs`) bỏ job nặng cho PR sẵn sàng mà mọi tệp khớp `risk_tiers.t1_skip_globs`;
pre-push (`scripts/pre-push-t1.mjs`, nhánh `chore/pre-push-t1`) bỏ `test` và `build` cho lần đẩy như vậy. Cả hai gọi
chung `docGlobT1`, `tepT1`, `quyetDinh`. Một số tệp khớp `docs/**` hay `**/*.md` lại là đầu vào thật của bài kiểm hay
runtime (Ngoài-1, Ngoài-3 của S4 `pre-push-t1`), nên sửa riêng chúng thì bài kiểm đọc chúng không chạy. Vòng này thêm
khoá `risk_tiers.t1_ma_doc`: tệp khớp nó là nặng với CI và pre-push, còn cổng nghiệm thu đọc `t1_skip_globs` như cũ.
Chủ kho ký Cổng Đáng «build» 17/10 (`opportunity.md`).

## Criteria

- AC-1: Given `_acceptance/config.yaml` có `risk_tiers.t1_ma_doc`, When gọi `docGlobT1(goc)`, Then kết quả là mọi
  glob của `t1_skip_globs` theo thứ tự, rồi mọi glob của `t1_ma_doc` mang tiền tố `!` theo thứ tự; khoá `t1_ma_doc`
  vắng hay rỗng → ném lỗi có chữ `t1_ma_doc rong`; `tachT1(globs, tep)` trả `{t1, maDoc}` với `t1` = tệp khớp một glob
  dương và không khớp glob `!` nào, `maDoc` = tệp khớp glob dương và khớp một glob `!`; `tepT1(globs, tep)` bằng đúng
  `tachT1(globs, tep).t1`. Đúng bảng ca viết trước ở `evals.yaml` E1.
- AC-2: Given bộ phân loại CI chạy trên commit hợp nhất của một PR sẵn sàng, When mọi tệp là T1 hoặc maDoc và có ít
  nhất một maDoc, Then ra `nang=true`, `ly_do=t1-ma-doc`; PR chỉ tài liệu không ai đọc (`docs/api.md`) vẫn ra
  `nang=false`, `ly_do=chi-t1`; PR có tệp mã vẫn ra `co-tep-nang`; config thiếu `t1_ma_doc` ra `nang=true` với
  `ly_do` bắt đầu `loi: `; `quyetDinh` gọi không có `laMaDoc` cho kết quả như trước vòng.
- AC-3: Given kho git tạm có remote trần và nhánh `onehub`, mang bản chép thật của bộ phân loại pre-push, và một hook
  pre-push tạm chỉ gọi `scripts/pre-push-t1.mjs` (stdin do chính `git push` sinh), When `git push` một ref chỉ chạm
  `docs/design.md`, hoặc chỉ `apps/agent/agent/subagents/x/instructions.md`, hoặc chỉ `LO-TRINH.html`, Then bộ phân
  loại cho stdout rỗng (hook chạy đủ năm lệnh), stderr đúng một dòng
  `pre-push: có tệp T1 mà mã đọc (<tệp>) — chạy đủ năm bước.` và không có dòng `không phân loại được`; đẩy ref chỉ chạm
  `docs/api.md` cho stdout `test build` (đối chứng); đẩy ref có tệp mã giữ stdout rỗng và stderr rỗng như AC-1 của
  `pre-push-t1`. `scripts/pre-push-t1.mjs` vẫn import `docGlobT1`, `tepT1`, `quyetDinh` từ phan-loai, và
  `.githooks/pre-push` không đổi một byte so với `origin/chore/pre-push-t1`. (Theo khuyến nghị Hỏi-2; lối kia → bỏ
  dòng stderr và `scripts/pre-push-t1.mjs` không đổi một byte.)
- AC-4: Given cây thật của kho, When chạy bộ quét đầu vào (`.github/scripts/t1-ma-doc.mjs`), Then không có đích nào
  `thieu-khai`, không mục miễn nào `mien-thua`, không glob `t1_ma_doc` nào `glob-chet`; tập đích bộ quét thấy chứa
  `docs/design.md` (bên đọc gồm `packages/ui/test/status-tone.spec.ts` và
  `_acceptance/nen-chat-ai-elements/rang/mau-ban-kinh.mjs`), `docs/telemetry.md`, `docs/setup.md`, `CONTEXT.md`,
  `docs/environment.md`, `LO-TRINH.html` (bên đọc gồm `apps/app/lib/lo-trinh/doc-tep.ts`) và
  `scripts/pre-merge-check.sh` (bên đọc gồm `.github/scripts/phan-loai.mjs`); bộ quét chạy dưới 5 giây.
- AC-5: Given kho tạm mang bản chép config thật, When thêm một tệp mã dưới `apps/` gọi `readFileSync` trên
  `docs/moi.md` (tệp có trong kho, không trong `t1_ma_doc`), Then bộ quét đỏ với dòng
  `thieu-khai docs/moi.md ← <đường tệp mã đó>`; gỡ một glob đích danh (`docs/design.md`) khỏi `t1_ma_doc` của bản chép
  thì đỏ `thieu-khai docs/design.md`; miễn khoá theo cặp (đích, nguồn): miễn `docs/cu.md ← apps/x/a.ts` rồi thêm
  `apps/x/d.ts` đọc `docs/cu.md` thì đỏ `thieu-khai docs/cu.md ← apps/x/d.ts`; một cặp miễn không còn được nhắc thì
  đỏ `mien-thua <đích> ← <nguồn>`; một glob không khớp
  tệp nào thì đỏ `glob-chet <glob>`; tệp chỉ được nhắc trong tệp mã KHÔNG có lời gọi đọc thì không phải đích.
- AC-6: Given luật đọc của bộ quét, When nguồn nằm ngoài `apps/` `packages/`, Then nó là nguồn chỉ khi một tệp mã dưới
  hai gốc đó có lời gọi đọc và nhắc tên nó (một bậc), hoặc nó là `script` của khối `rang` trong
  `.githooks/gate-shape.json`; tệp JSON không bao giờ là nguồn; tệp T1 dưới `apps/` `packages/` không phải đích (đã có
  glob `apps/**`, `packages/**`).
- AC-7: Given `.githooks/gate-shape.json` khối `t1Only` và đoạn «PR mở ở dạng nháp» của `CLAUDE.md` sau vòng này, When
  đọc, Then câu `vi_sao` nói lần đẩy được bỏ `test`/`build` là lần đẩy mà mọi tệp khớp `t1_skip_globs` và không tệp nào
  khớp `t1_ma_doc`, nói `t1_ma_doc` là tệp T1 mà bài kiểm, bản dựng hay runtime đọc, và không còn câu «không đổi mã nào
  test hay build đọc» hay «không mất chiều đỏ nào so với CI» nếu thiếu điều kiện đó; `CLAUDE.md` nói PR chỉ T1 bỏ job
  nặng trừ tệp dưới `.github/` và tệp của `t1_ma_doc`. Không bài kiểm nào trong `bun run test` đọc `CLAUDE.md` hay
  phụ thuộc một ref nhánh (phần so với `origin/chore/pre-push-t1` chạy ở răng của hồ sơ). (judgment)
- AC-8: Given hồ sơ đã ký chạm cùng tệp, When chạy bài kiểm của chúng trên cây vòng này, Then `node --test
  .github/scripts/test/phan-loai.test.mjs` (mọi ca cũ), ca `phan-loai` và `mot-nguon` của
  `packages/ui/test/pre-push-t1.spec.ts`, `_acceptance/pre-push-t1/rang/mot-nguon.mjs` và
  `_acceptance/giam-phut-ci-nhap-t1/rang/phan-loai.mjs` đều thoát 0.
- AC-9: Given bản sao của cây, When phá từng vật thật — `tepT1` thôi trừ glob `!`; `phanLoai` thôi truyền `laMaDoc`;
  gỡ `docs/design.md` khỏi `t1_ma_doc`; bộ quét bỏ cầu `gate-shape.json`; bộ quét bỏ lọc lời gọi đọc — Then đúng phép đo
  phải đỏ với tên ca ghim (bảng ở `evals.yaml` E8), và cây lành thì cả năm phép đo xanh.

- AC-10: Given cây thật, When đọc `turbo.json` và `.githooks/pre-push`, Then tác vụ `test` khai `cache: false` và hook
  đặt `TURBO_FORCE=true`; và trên bản sao của cây, sửa lệch một dòng bảng «Màu trạng thái» của `docs/design.md` thì
  `bun test ./test/status-tone.spec.ts` trong `packages/ui` đỏ với `bang mau lech docs/design.md`, còn bản sao lành
  thì xanh — tức lần đẩy/PR nặng vì `t1_ma_doc` thật sự bắt được lệch của tài liệu.

## Coverage

- Trục A — chỗ tệp nằm: dưới `apps/`/`packages/` | `docs/**` | `.md` ở gốc kho | `_acceptance/**/*.md` | bộ cổng chép
  từ kit (`scripts/*.sh`, `lib/*.cjs`) | `LO-TRINH.html` [thước CE: `risk_tiers.t1_skip_globs` hiện hành]
- Trục B — ai đọc: bài kiểm trực tiếp | runtime (`apps/app/lib`) | răng khai trong `gate-shape.json` | mã ngoài hai
  gốc mà bài kiểm gọi (cầu một bậc) | prompt nạp theo quy ước (eve) | chỉ nhắc tên (miễn) [thước CE: đo 17/10 bằng
  bộ quét v3/v4 trong design doc]
- Trục C — đường phân loại: CI PR sẵn sàng | CI PR nháp | pre-push | config hỏng/thiếu khoá [thước CE: nhánh
  `quyetDinh` + `phanLoai` + `phanLoaiDay`]
- Trục D — giữ danh sách: đích mới chưa khai | khai thừa (glob chết) | miễn thừa | giới hạn tên ghép
  [thước CE: luật phán của bộ quét]
- Core → AC: A×C → AC-1, AC-2, AC-3; B → AC-4, AC-6; D → AC-5; lời giải thích → AC-7; hồ sơ đã ký → AC-8; chiều đỏ →
  AC-9; đầu ra thật (bài kiểm đọc tài liệu đỏ được, không cache) → AC-10. Later: kit đọc `t1_ma_doc` cho hồ sơ bắt buộc và hoá cũ (chip kit). Never: sửa `t1_skip_globs`; bắc cầu không
  giới hạn qua JSON; quét `scripts/**` không chạy trong `bun run test`.
- [GIẢ ĐỊNH] PR nháp vẫn nhẹ bất kể tệp (luật `giam-phut-ci-nhap-t1`); chiều đỏ ở PR nháp vốn không có.

## Đường đo

Không có ngưỡng: Cổng Đáng khai «Không đo được — việc nội bộ của bộ công cụ».

## Out of scope

- Cổng nghiệm thu của kit hiểu `t1_ma_doc` (hồ sơ bắt buộc, hoá cũ bằng chứng khi tệp đọc được đổi) — chip sang
  `~/dev/acceptance-gate-kit`.
- Đổi `t1_skip_globs`, `t3_paths`, hay bộ cổng chép từ kit.
- Tệp đọc bằng tên ghép lúc chạy, hay qua từ hai bậc cầu trở lên.
- Mã dưới `scripts/**` không chạy trong `bun run test`.

## Notes

- `t1_ma_doc` không làm PR tài liệu cần hồ sơ: pre-merge-check của kit không đọc khoá này.
- Ghim lại `giam-phut-ci-nhap-t1` và `pre-push-t1` trong PR này (đổi `phan-loai.mjs`, `gate-shape.json`).
