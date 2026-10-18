---
schema_version: 1
feature: Lần đẩy và PR chỉ ghim lại (run-log, decisions, báo cáo bằng chứng) được CI và pre-push tính là nhẹ, mà cổng nghiệm thu vẫn chạy và vẫn đỏ được
slug: push-ghim-lai-t1
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: implemented
approved_by: manh
approved_at: 2026-10-18T15:10:53Z
design_doc: docs/superpowers/specs/2026-10-18-push-ghim-lai-t1-design.md
---

# Acceptance Contract: push-ghim-lai-t1

## Context

Ghim lại chỉ ghi `_acceptance/<slug>/run-log.jsonl`, `decisions.jsonl` và `evidence-report.md`. Hai tệp `.jsonl`
không khớp `risk_tiers.t1_skip_globs`, nên bộ phân loại chung (`.github/scripts/phan-loai.mjs`, gọi lại từ
`scripts/pre-push-t1.mjs`) xếp mọi lần đẩy và PR ghim lại là nặng: commit ghim lại thật `38ecca3be` (16 tệp) ra
`co-tep-nang`. Vòng này thêm đúng hai glob vào `t1_skip_globs`, thêm vào `tachT1` (`.github/scripts/phan-loai.mjs`)
luật số đoạn cho glob không có `**`, và chứng bằng ca đỏ rằng job cổng nghiệm thu vẫn chạy và vẫn chặn bằng chứng giả.
Chủ kho ký Cổng Đáng «build» 18/10 (`opportunity.md`).

## Criteria

- AC-1: Given `_acceptance/config.yaml` của kho, When đọc `risk_tiers.t1_skip_globs`, Then nó chứa đúng một lần mỗi
  chuỗi `_acceptance/*/run-log.jsonl` và `_acceptance/*/decisions.jsonl`, và không glob nào khác của khoá bắt đầu
  bằng `_acceptance/`; và `tachT1(docGlobT1(KHO), tep)` cho đúng bảng 11 ca viết trước ở `evals.yaml` E1 (run-log,
  decisions, evidence-report, contract, review-findings → T1; evals.yaml, config.yaml, `evidence/**`, `rang/**`,
  `_acceptance/run-log.jsonl` không có thư mục hồ sơ → không T1; hợp đồng khai trong `t1_ma_doc` → mã đọc).
- AC-2: Given bộ phân loại CI cho PR sẵn sàng, When danh sách tệp là đúng 16 tệp của commit ghim lại `38ecca3be`
  (chép nguyên văn trong bài kiểm), Then ra `nang=false`, `ly_do=chi-t1`; cùng danh sách thêm một trong
  `_acceptance/t1-ma-doc/evals.yaml`, `_acceptance/config.yaml`, `_acceptance/x/rang/a.mjs`,
  `_acceptance/x/evidence/a.json`, `_acceptance/x/rang/f/run-log.jsonl` → `nang=true`, `ly_do=co-tep-nang`; thêm
  `_acceptance/dieu-huong-khu-muc-tieu/contract.md` → `ly_do=t1-ma-doc`; thêm `.github/workflows/ci.yml` →
  `ly_do=cham-github`.
- AC-3: Given kho git tạm có remote trần, branch `onehub`, bản chép thật của bộ phân loại pre-push và config thật,
  When `git push` một ref chỉ chạm `_acceptance/x/run-log.jsonl`, `_acceptance/x/decisions.jsonl` và
  `_acceptance/x/evidence-report.md`, Then bộ phân loại in stdout `test build` và stderr đúng một dòng
  `pre-push: chỉ tệp T1 (3 tệp) — bỏ test, build; CI phân loại PR theo cùng luật.`; đẩy cùng ba tệp kèm
  `_acceptance/x/evals.yaml`, hoặc kèm `_acceptance/x/rang/f/run-log.jsonl` → stdout rỗng và stderr rỗng (chạy đủ năm
  bước).
- AC-4: Given `tachT1` của `.github/scripts/phan-loai.mjs` (một hàm cho CI, pre-push và bộ quét t1-ma-doc), When một
  tệp khớp một glob không có `**` mà số đoạn đường dẫn của tệp khác số đoạn của glob, Then glob đó không tính cho tệp:
  `_acceptance/x/rang/f/run-log.jsonl` và `_acceptance/x/evidence/decisions.jsonl` → không T1 với config thật;
  `_acceptance/x/rang/f/a.md` vẫn T1 (khớp `**/*.md`); `_acceptance/x/run-log.jsonl` vẫn T1; và ngoài hai glob mới,
  không glob nào của `t1_skip_globs` hay `t1_ma_doc` có ký tự đại diện mà không có `**` — luật không đổi cách xếp của
  glob cũ nào (bộ khớp glob của kit không đổi).
- AC-5: Given kho mẫu của bộ quét có `_acceptance/*/run-log.jsonl` trong `t1_skip_globs`, When một tệp mã dưới
  `apps/` đọc `_acceptance/s/run-log.jsonl` bằng `readFileSync`, Then báo cáo có
  `thieu-khai _acceptance/s/run-log.jsonl ← <tệp mã>`; cùng kho bỏ tệp mã đó → báo cáo rỗng.
- AC-6: Given một `git worktree` tạm của kho tại `38ecca3be^`, mang `_acceptance/config.yaml` của vòng này, ref
  `origin/onehub` trỏ commit gốc, và PR mô phỏng bằng `git merge --no-ff` commit ghim lại thật `38ecca3be`, When chạy bộ
  phân loại CI và chạy đúng kịch bản `run:` của bước `Pre-merge check` đọc từ `acceptance.yml` thật với ngữ cảnh
  `pull_request`, Then phân loại ra `chi-t1` và cổng thoát 0; PR cùng commit đó cộng một commit chỉ đổi `run_id:` của
  mục Re-pin cuối trong `_acceptance/t1-ma-doc/evidence-report.md` sang một mã giả → vẫn `chi-t1`, cổng thoát 1 với dòng
  `VIOLATION [t1-ma-doc]` chứa mã giả; PR cộng một commit chỉ đổi `suites_exit` của dòng repin được trích trong
  `_acceptance/t1-ma-doc/run-log.jsonl` thành có số 1 → vẫn `chi-t1`, cổng thoát 1 với dòng `VIOLATION [t1-ma-doc]`
  chứa `nonzero suites_exit`.
- AC-7: Given `.github/workflows/acceptance.yml`, When đọc YAML, Then `on.pull_request` không có `paths`,
  `paths-ignore`, `branches-ignore` và `types` gồm `opened`, `synchronize`, `reopened`; job `luat-kho` (tên «acceptance
  gate») không có `needs`, `if` hay `continue-on-error` ở cấp job; bước `Pre-merge check` không có `continue-on-error`,
  `if` của nó đúng `${{ !cancelled() }}`, và nó lẫn bước `Product map` không nhắc `phan-loai` hay `nang`; mỗi luật có một
  bản chép tệp phá đúng luật đó → phép kiểm đỏ với thông điệp gọi tên khoá bị phá.
- AC-8: Given cây chép dựng từ chỉ mục git riêng, có lượt lành chạy trước (lượt lành không xanh → thoát 2
  «thuoc hong»), When lần lượt đột biến đường sinh thật — xoá dòng `_acceptance/*/run-log.jsonl` khỏi `t1_skip_globs`;
  thay dòng `_acceptance/*/decisions.jsonl` bằng `_acceptance/**`; bỏ luật số đoạn trong `tachT1`; thêm `needs:
  phan-loai` vào job `luat-kho`; thêm `paths-ignore` vào `on.pull_request` của `acceptance.yml` thật — Then mỗi đột biến
  làm đúng bài kiểm của AC nó phá đỏ, với thông điệp ghim tên ca, và tệp được trả nguyên bản sau mỗi ca.

## Coverage

Quét không gian bằng skill chống sót (preset test-matrix), ba trục:

- **Loại tệp trong diff:** run-log.jsonl · decisions.jsonl · tệp `.md` của hồ sơ · evals.yaml · config.yaml ·
  `evidence/**` · `rang/**` · tệp sâu hơn một bậc · tệp `.github/` · tệp mã. [thước CE: danh sách tệp mà
  `repin-lane.mjs` ghi + `git ls-files '_acceptance/*'`, SUY-TỪ-REPO: `.acceptance-runs` không cần; commit `38ecca3be`]
- **Đường phân loại:** CI PR sẵn sàng · pre-push. [thước CE: hai bên gọi chung `quyetDinh`/`tachT1`; SUY-TỪ-REPO:
  `scripts/pre-push-t1.mjs`]. PR nháp đã nhẹ sẵn → Never.
- **Cổng đi kèm:** job acceptance gate · recheck bằng chứng của pre-merge · bộ quét t1-ma-doc. [thước CE:
  `.github/workflows/acceptance.yml`, `scripts/pre-merge-check.sh` dòng 680/813; NGÀNH: GitHub Actions
  `paths-ignore` — lọc theo đường dẫn mà check bắt buộc vẫn phải có kết quả, kho này giải bằng `ci-ok`]

Core → AC: run-log/decisions ở cả hai đường (AC-1, AC-2, AC-3) · tệp gần mà không được nhẹ (AC-1, AC-2, AC-3) · tệp
sâu hơn một bậc ở cả hai đường (AC-2, AC-3, AC-4) · bộ quét đỏ khi có bên đọc mới (AC-5) · recheck vẫn đỏ ở PR nhẹ,
cả ở báo cáo lẫn ở sổ chạy `.jsonl` vừa nới (AC-6) · job cổng chạy và chặn ở mọi PR — không lọc đường dẫn, không phụ
thuộc phân loại, không nuốt lỗi (AC-7) · bài kiểm đọc đúng tệp thật của kho, không chỉ kho mẫu (AC-8). Later/Never ở Out of scope.

## Out of scope

- OOS-1: Không sửa `scripts/pre-merge-check.sh`, bộ khớp glob `match_globs` hay chế độ `--hang-pr` của kit (bộ cổng chép
  từ kit, phí bản rẽ). Luật số đoạn sống ở `tachT1` của kho, chỉ CI và pre-push đọc.
- OOS-2: Không đổi hành vi PR nháp — đã nhẹ sẵn.
- OOS-3: Không nới `t1_skip_globs` cho `evidence/**`, `rang/**`, `evals.yaml`, `config.yaml` — có bài kiểm đọc chúng.
- OOS-4: Không làm lần đẩy mang commit gộp onehub kèm ghim lại thành nhẹ, và không đổi cách CI xét cả PR (PR có mã
  vẫn nặng khi nhận thêm lần đẩy ghim lại).
- OOS-5: Không sửa câu `vi_sao` của khối `t1Only` hay `CLAUDE.md` — cả hai vẫn đúng với luật mới.

## Notes

- AC-6 dựa vào commit `38ecca3be` còn trong lịch sử (nhánh `chore/t1-ma-doc` gộp bằng merge commit). Commit không
  với tới được thì răng thoát 2 «KHONG DO DUOC», không xanh.
- Bộ quét chỉ thấy tên tệp viết nguyên trong mã (giới hạn đã khai của `t1-ma-doc`).
- Recheck kiểm báo cáo và sổ chạy nhất quán với nhau, không chạy lại eval. Một PR giả cả dòng repin lẫn mục Re-pin cho
  khớp nhau thì không bị bắt — như trước vòng này, ở mọi PR, nhẹ hay nặng. Vòng không đổi điều đó.
