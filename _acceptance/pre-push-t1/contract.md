---
schema_version: 1
feature: pre-push bỏ test và build khi mọi tệp của lần đẩy là tệp T1; vẫn chạy check-types, lint, lint:slop; verify-gate-shape chấp nhận nhánh này qua một khối khai có lý do trong gate-shape.json
slug: pre-push-t1
owner: manh@mstar.vn
risk_tier: T2
surfaces: []
status: draft
design_doc: docs/superpowers/specs/2026-10-16-pre-push-t1-design.md
---

# Acceptance Contract: pre-push-t1

## Context

`.githooks/pre-push` chạy đủ năm lệnh nặng (`check-types lint lint:slop test build`, `TURBO_FORCE=true`) cho mọi lần
đẩy, kể cả lần đẩy chỉ có tài liệu (≈15′, giữ khoá nặng của M5). CI đã bỏ job nặng cho PR sẵn sàng chỉ T1 bằng
`.github/scripts/phan-loai.mjs`. Vòng này mang CÙNG luật đó xuống pre-push: lần đẩy chỉ T1 bỏ `test` và `build`, còn ba
lệnh kia vẫn chạy; `verify-gate-shape` chỉ nhận nhánh này qua khối khai `t1Only` của `.githooks/gate-shape.json`. Chủ
kho ký Cổng Đáng «build» ngày 16/10 (`opportunity.md`).

## Criteria

- AC-1: Given `scripts/pre-push-t1.mjs` nhận các dòng stdin của pre-push và tên remote, When phân loại, Then tập tệp là
  hợp của `git diff --name-only --no-renames <gốc> <local sha>` qua mọi dòng không phải xoá, với gốc = sha remote khi nó
  khác 0 và có trong kho, ngược lại = `git merge-base <remote>/onehub <local sha>`; quyết định là `quyetDinh` của CI cho
  một PR sẵn sàng mang đúng tập đó; `chi-t1` → stdout là `t1Only.skip` của `gate-shape.json` và stderr đúng một dòng
  `pre-push: chỉ tệp T1 (<n> tệp) — bỏ test, build; CI vẫn chạy đủ.`; mọi kết cục khác → stdout rỗng; mọi lỗi (git,
  `<remote>/onehub` vắng, config hay `gate-shape.json` hỏng, khối `t1Only` vắng) → stdout rỗng và stderr
  `pre-push: không phân loại được lần đẩy (<lý do>) — chạy đủ năm bước.`; lệnh luôn thoát 0; thứ tự dòng stdin không
  đổi kết quả. Đúng bảng 18 ca viết trước ở `evals.yaml` E1.
- AC-2: Given bộ phân loại của pre-push, When xét T1 và danh sách bỏ, Then nó gọi `docGlobT1`, `tepT1`, `quyetDinh` của
  `.github/scripts/phan-loai.mjs` và đọc danh sách bỏ từ `gate-shape.json`; không tệp nào của vòng chứa glob T1 hay chữ
  `test`/`build` làm danh sách bỏ; thêm một glob vào `t1_skip_globs` của config đổi kết quả mà không sửa tệp nào khác;
  đổi `t1Only.skip` thành `["build"]` thì hook chạy `test` và chỉ bỏ `build`.
- AC-3: Given một kho git tạm mang bản chép các tệp thật của cổng, When `git push` một nhánh chỉ có tệp T1, Then hook
  thoát 0, in dòng bỏ của AC-1, chạy đúng `check-types`, `lint`, `lint:slop` theo thứ tự, không in
  `pre-push: bun run test` hay `pre-push: bun run build`, và `verify-gate-shape` chạy thật in
  `pre-push: gate matches its shape` cùng dòng `  skipped: test, build`; `test` giả đỏ không đổi kết quả; `lint` giả đỏ
  thì hook thoát 1 với `` `bun run lint` failed ``.
- AC-4: Given cùng kho tạm, When lần đẩy có tệp mã, chỉ có `.github/workflows/ci.yml`, sha remote bằng sha local, hay
  cây không có `scripts/pre-push-t1.mjs`, Then hook chạy đủ năm lệnh theo thứ tự cũ, không in dòng bỏ; `test` giả đỏ thì
  thoát 1 với `` `bun run test` failed ``; ca thiếu tệp phân loại thoát 0, không gọi node, in đúng dòng
  `pre-push: không phân loại được lần đẩy (thiếu scripts/pre-push-t1.mjs) — chạy đủ năm bước.`
- AC-5: Given `scripts/verify-gate-shape.mjs`, When gọi kèm `--bo-qua "<id …>"`, Then chỉ xanh khi `gate-shape.json` có
  khối `t1Only` với `skip` khác rỗng, mọi id là checker đã khai, `vi_sao` khác rỗng, tập `--bo-qua` bằng tập `skip`, và
  không checker nào trong tập để lại run summary; mỗi vi phạm chết với thông điệp gọi tên (bảng 7 ca ở E4); không có
  `--bo-qua` thì hành vi như trước vòng (thiếu summary của `test` → `checker 'test' left no run summary`).
- AC-6: Given `.githooks/gate-shape.json` sau vòng này, When đọc, Then có khối `t1Only` với `skip` đúng
  `["test", "build"]`, `classifier` trỏ `scripts/pre-push-t1.mjs`, `sameRuleAs` trỏ `.github/scripts/phan-loai.mjs`
  (cả hai có trên đĩa), `vi_sao` nói vì sao bỏ an toàn.
- AC-7: Given sáu răng đã ký ghim vào hook (bảng ở design doc), When soát hook sau vòng này, Then dòng
  `for task in check-types lint lint:slop test build; do` và hai dòng thân vòng `echo …`/`bun run "$task" …` giống từng
  byte bản gốc vòng; mỗi `sed` của `rang-hinh.sh --chan tan-cong` đổi đúng một dòng; thân vòng chạy độc lập dưới
  `bash -c` cho cả năm tác vụ; khối `rang` của checker `test` giống bản gốc vòng; và hai răng rẻ `dptm_hook_cay`,
  `rang_hook_loi_thoat` chạy thật thoát 0.
- AC-8: Given cây thật của kho và một commit treo (không ref, không đổi thư mục làm việc) chỉ thêm một tệp dưới
  `docs/`, When chạy hook thật với dòng stdin đẩy commit đó lên trên HEAD, Then hook thoát 0, in dòng bỏ `(1 tệp)`,
  chạy `check-types`, `lint`, `lint:slop` bằng turbo thật, không turbo run summary nào của `test`/`build` sinh ra, và
  `verify-gate-shape` thật in `pre-push: gate matches its shape` cùng dòng `skipped`; commit treo thứ hai có một tệp
  `.ts` thì bộ phân loại cho stdout rỗng.
- AC-9: Given cây thật, When lần đẩy sha remote bằng sha local (đường nền của răng đã ký), Then `rang-hook.sh --chan
  ep-chay` của `luoi-day-do-that` xanh — đủ năm tác vụ, không tác vụ nào đọc bộ nhớ đệm.

## Coverage

- Trục A — ref của lần đẩy: ref mới (sha remote 0) | ref có sẵn, sha remote có trong kho | ref có sẵn, sha remote không
  có trong kho | xoá (sha local 0) | sha local = sha remote | nhiều ref một lần [thước CE: NGÀNH githooks(5) — khuôn
  dòng stdin của pre-push]
- Trục B — tập tệp: chỉ T1 | có tệp mã | có `.github/**` (kể cả `ci.yml` khai T1) | đổi tên mã → `.md` | gộp `onehub`
  mang mã | `.md` ở gốc kho | rỗng [thước CE: `risk_tiers.t1_skip_globs` + bảng `quyetDinh` ở
  `.github/scripts/test/phan-loai.test.mjs`]
- Trục C — trạng thái khai: khối `t1Only` đúng | vắng | `skip` lệch cờ | id lạ | `vi_sao` rỗng | checker bị bỏ vẫn chạy
  [thước CE: các nhánh `problems.push` của `checkTurbo` trong `scripts/verify-gate-shape.mjs`]
- Trục D — đường hỏng: `<remote>/onehub` vắng | config vắng | `gate-shape.json` thiếu khối | tệp phân loại vắng (cây cũ)
  [thước CE: các nhánh `loi:` của `phanLoai` trong `phan-loai.mjs`]
- Cross-cutting: răng đã ký ghim vào hook → AC-7, AC-9; turbo thật → AC-8, AC-9.
- Core → AC: A×B → AC-1, AC-3, AC-4; C → AC-5, AC-6; D → AC-1, AC-4; một nguồn → AC-2. Later: in thời lượng mỗi lần
  đẩy (Cổng Đáng chọn «Không đo được»). Never: bỏ `check-types`/`lint`/`lint:slop` ở lần đẩy T1; coi `.github/**` là
  T1 (luật CI); danh sách glob riêng cho hook; bỏ hẳn `test` khỏi pre-push (finding §6.1 PA5).
- [NGÀNH: githooks(5) — dòng `<local ref> <local sha> <remote ref> <remote sha>`, sha toàn 0 cho xoá và ref mới] ·
  [NGÀNH: lint-staged — chạy kiểm theo tệp đổi của lần commit, cùng khuôn «phân loại theo tập tệp»].
- [GIẢ ĐỊNH] Mọi commit mã đã có trên remote từng qua pre-push đủ năm lệnh, nên so với sha remote là đủ (lối thoát
  `CRM_SKIP_HOOKS` và `--no-verify` nằm ngoài giả định này, như hôm nay).

## Đường đo

Không có ngưỡng: Cổng Đáng khai «Không đo được — việc nội bộ của bộ công cụ».

## Out of scope

- Bỏ `TURBO_FORCE`, cache turbo, hay đổi luật «chạy mới hết» của `verify-gate-shape` cho các checker còn chạy.
- Đổi bộ phân loại của CI (`.github/scripts/phan-loai.mjs`) hay `t1_skip_globs`, `t3_paths` của config.
- Lần đẩy có `CRM_SKIP_HOOKS` hay `--no-verify` — giữ như hôm nay.
- Đo thời lượng lần đẩy trước/sau.

## Notes

- Răng nền chat (`nen-chat-ai-elements` AC-9/AC-10) chạy trong `@crm/ui#test`; lần đẩy chỉ T1 không chạy chúng, đúng như
  CI ở PR sẵn sàng chỉ T1. Lần đẩy có mã vẫn chạy.
- `t1_skip_globs` chỉ nhận `**/*.md` trong `_acceptance/`; `run-log.jsonl`, `decisions.jsonl`, `evals.yaml` không phải T1.
  Lần đẩy gói bằng chứng sau S4 vì thế vẫn chạy đủ năm lệnh. Lợi của vòng rơi vào lần đẩy tài liệu (docs, `.md`, bản
  đồ); nới `t1_skip_globs` là việc của config, ngoài vòng.
