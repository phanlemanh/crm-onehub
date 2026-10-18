---
schema_version: 1
feature: Lần đẩy và PR chỉ ghim lại (run-log, decisions, báo cáo bằng chứng) được CI và pre-push tính là nhẹ, mà cổng nghiệm thu vẫn chạy và vẫn đỏ được
slug: push-ghim-lai-t1
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-18-push-ghim-lai-t1-design.md
---

# Acceptance Contract: push-ghim-lai-t1

## Context

Ghim lại chỉ ghi `_acceptance/<slug>/run-log.jsonl`, `decisions.jsonl` và `evidence-report.md`. Hai tệp `.jsonl`
không khớp `risk_tiers.t1_skip_globs`, nên bộ phân loại chung (`.github/scripts/phan-loai.mjs`, gọi lại từ
`scripts/pre-push-t1.mjs`) xếp mọi lần đẩy và PR ghim lại là nặng: commit ghim lại thật `38ecca3be` (16 tệp) ra
`co-tep-nang`. Vòng này thêm đúng hai glob vào `t1_skip_globs`, thêm luật độ sâu vào bộ quét
`.github/scripts/t1-ma-doc.mjs`, và chứng bằng ca đỏ rằng job cổng nghiệm thu vẫn chạy và vẫn chặn bằng chứng giả.
Chủ kho ký Cổng Đáng «build» 18/10 (`opportunity.md`).

## Criteria

- AC-1: Given `_acceptance/config.yaml` của kho, When đọc `risk_tiers.t1_skip_globs`, Then nó chứa đúng một lần mỗi
  chuỗi `_acceptance/*/run-log.jsonl` và `_acceptance/*/decisions.jsonl`, và không glob nào khác của khoá bắt đầu
  bằng `_acceptance/`; và `tachT1(docGlobT1(KHO), tep)` cho đúng bảng 11 ca viết trước ở `evals.yaml` E1 (run-log,
  decisions, evidence-report, contract, review-findings → T1; evals.yaml, config.yaml, `evidence/**`, `rang/**` →
  không T1; hợp đồng khai trong `t1_ma_doc` → mã đọc).
- AC-2: Given bộ phân loại CI cho PR sẵn sàng, When danh sách tệp là đúng 16 tệp của commit ghim lại `38ecca3be`
  (chép nguyên văn trong bài kiểm), Then ra `nang=false`, `ly_do=chi-t1`; cùng danh sách thêm một trong
  `_acceptance/t1-ma-doc/evals.yaml`, `_acceptance/config.yaml`, `_acceptance/x/rang/a.mjs`,
  `_acceptance/x/evidence/a.json` → `nang=true`, `ly_do=co-tep-nang`; thêm `_acceptance/dieu-huong-khu-muc-tieu/contract.md`
  → `ly_do=t1-ma-doc`; thêm `.github/workflows/ci.yml` → `ly_do=cham-github`.
- AC-3: Given kho git tạm có remote trần, nhánh `onehub`, bản chép thật của bộ phân loại pre-push và config thật,
  When `git push` một ref chỉ chạm `_acceptance/x/run-log.jsonl`, `_acceptance/x/decisions.jsonl` và
  `_acceptance/x/evidence-report.md`, Then bộ phân loại in stdout `test build` và stderr đúng một dòng
  `pre-push: chỉ tệp T1 (3 tệp) — bỏ test, build; CI phân loại PR theo cùng luật.`; đẩy cùng ba tệp kèm
  `_acceptance/x/evals.yaml` → stdout rỗng và stderr rỗng (chạy đủ năm bước).
- AC-4: Given bộ quét `.github/scripts/t1-ma-doc.mjs`, When một tệp đang theo dõi khớp một glob của `t1_skip_globs`
  dạng `_acceptance/*/<tên>` (không ký tự đại diện nào khác) mà không có đúng dạng `_acceptance/<slug>/<tên>`, Then
  báo cáo có dòng `glob-qua-sau <glob> <tệp>` và lệnh thoát 1; kho mẫu không có tệp như vậy → không dòng
  `glob-qua-sau` nào; trên kho thật bộ quét in `sach:` và thoát 0.
- AC-5: Given kho mẫu của bộ quét có `_acceptance/*/run-log.jsonl` trong `t1_skip_globs`, When một tệp mã dưới
  `apps/` đọc `_acceptance/s/run-log.jsonl` bằng `readFileSync`, Then báo cáo có
  `thieu-khai _acceptance/s/run-log.jsonl ← <tệp mã>`; cùng kho bỏ tệp mã đó → báo cáo rỗng.
- AC-6: Given bản sao của kho tại commit ghim lại thật `38ecca3be` mang `_acceptance/config.yaml` của vòng này, When
  chạy bộ phân loại trên diff `38ecca3be^..38ecca3be` và `pre-merge-check.sh --base 38ecca3be^ --slug t1-ma-doc`,
  Then phân loại ra `chi-t1` và cổng thoát 0; cùng bản sao thêm một commit chỉ sửa `run_id:` của mục Re-pin cuối
  trong `_acceptance/t1-ma-doc/evidence-report.md` sang một mã không có trong sổ chạy → phân loại vẫn `chi-t1`, cổng
  thoát 1 và in một dòng `VIOLATION` nhắc `t1-ma-doc`.
- AC-7: Given `.github/workflows/acceptance.yml`, When đọc job `luat-kho` (tên «acceptance gate»), Then job không có
  `needs`, không có `if` ở cấp job, và bước `Pre-merge check` lẫn `Product map` không nhắc `phan-loai` hay `nang`;
  bản chép tệp thêm `needs: phan-loai` vào job đó → phép kiểm đỏ với thông điệp gọi tên `needs`.

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
sâu một bậc (AC-4) · bộ quét đỏ khi có bên đọc mới (AC-5) · recheck vẫn đỏ ở PR nhẹ (AC-6) · job cổng không phụ thuộc
phân loại (AC-7). Later/Never ở Out of scope.

## Out of scope

- OOS-1: Không sửa `scripts/pre-merge-check.sh` hay chế độ `--hang-pr` của kit (bộ cổng chép từ kit, phí bản rẽ).
- OOS-2: Không đổi hành vi PR nháp — đã nhẹ sẵn.
- OOS-3: Không nới `t1_skip_globs` cho `evidence/**`, `rang/**`, `evals.yaml`, `config.yaml` — có bài kiểm đọc chúng.
- OOS-4: Không làm lần đẩy mang commit gộp onehub kèm ghim lại thành nhẹ, và không đổi cách CI xét cả PR (PR có mã
  vẫn nặng khi nhận thêm lần đẩy ghim lại).
- OOS-5: Không sửa câu `vi_sao` của khối `t1Only` hay `CLAUDE.md` — cả hai vẫn đúng với luật mới.

## Notes

- AC-6 dựa vào commit `38ecca3be` còn trong lịch sử (nhánh `chore/t1-ma-doc` gộp bằng merge commit). Commit không
  với tới được thì răng thoát 2 «KHONG DO DUOC», không xanh.
- Bộ quét chỉ thấy tên tệp viết nguyên trong mã (giới hạn đã khai của `t1-ma-doc`).
