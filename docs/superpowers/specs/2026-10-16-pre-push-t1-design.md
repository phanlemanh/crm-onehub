# pre-push-t1 — pre-push bỏ `test` và `build` khi lần đẩy chỉ chạm tệp T1

Ô cơ hội: `_acceptance/pre-push-t1/opportunity.md` (chủ kho ký «build» 16/10). Gốc: finding kit
`docs/findings/2026-10-16-truy-nguyen-toc-do-m5.md` §5 PA5, §10.2 C-1.

## Vấn đề

`.githooks/pre-push` chạy `check-types → lint → lint:slop → test → build` (`TURBO_FORCE=true`) cho mọi lần đẩy. Lần
đẩy chỉ có tài liệu vẫn tốn ≈15′ và giữ khoá nặng của M5. Ở PR sẵn sàng chỉ T1, CI (`.github/scripts/phan-loai.mjs`) đã
bỏ job nặng từ vòng `giam-phut-ci-nhap-t1`, nên hook đang chạy nhiều hơn CI.

## Lời giải

Ba tệp đổi, một tệp mới, một tệp kiểm mới.

### 1. `scripts/pre-push-t1.mjs` (mới) — phân loại lần đẩy

Đầu vào: các dòng stdin của pre-push (`<local ref> <local sha> <remote ref> <remote sha>`, githooks(5)) và tên remote
(`$1` của hook). Với mỗi dòng:

| Dòng | Gốc so |
| --- | --- |
| local sha toàn 0 (xoá) | bỏ dòng |
| remote sha khác 0 và là commit có trong kho | remote sha |
| còn lại (ref mới, hay sha remote không có trong kho) | `git merge-base <remote>/onehub <local sha>` |

Tập tệp = hợp của `git diff --name-only --no-renames <gốc> <local sha>` qua mọi dòng. Quyết định gọi ĐÚNG hàm của CI:
`quyetDinh({ suKien: "pull_request", nhap: "false", tep, laT1 })` với `laT1` dựng từ `tepT1(docGlobT1(goc), tep)` — tức
lần đẩy được phân loại y như một PR sẵn sàng mang đúng các tệp đó. Không có glob nào viết lần hai; luật `.github/**` →
nặng và «rỗng → nặng» đi theo CI.

- `nang: false` (lý do `chi-t1`) → in ra stdout danh sách `t1Only.skip` của `.githooks/gate-shape.json`, và in ra stderr
  đúng một dòng `pre-push: chỉ tệp T1 (<n> tệp) — bỏ test, build; CI vẫn chạy đủ.` (danh sách bỏ ghép từ khai).
- `nang: true` → stdout rỗng, không in gì.
- Lỗi bất kỳ (git hỏng, ref `<remote>/onehub` vắng, config hay `gate-shape.json` hỏng, khối `t1Only` vắng, bash vắng)
  → stdout rỗng (đủ năm bước) và một dòng stderr `pre-push: không phân loại được lần đẩy (<lý do>) — chạy đủ năm bước.`
  Lệnh luôn thoát 0. Đóng mặc định: hỏng nghĩa là chạy nhiều hơn, không ít hơn.

### 2. `.githooks/pre-push`

- Vòng `while read` giữ nguyên việc đếm xoá, thêm gom dòng vào biến `DAY`.
- Sau `unset $(git rev-parse --local-env-vars)`: nếu `$ROOT/scripts/pre-push-t1.mjs` không có (cây cũ, kho tạm của
  răng `dieu-phoi-truoc-mo-dot`) thì hook KHÔNG gọi node, in đúng dòng
  `pre-push: không phân loại được lần đẩy (thiếu scripts/pre-push-t1.mjs) — chạy đủ năm bước.` và để `BO_QUA` rỗng;
  có tệp thì `BO_QUA="$(printf '%s' "$DAY" | node "$ROOT/scripts/pre-push-t1.mjs" --remote "${1:-origin}")" || BO_QUA=""`.
- Dòng `for task in check-types lint lint:slop test build; do` giữ nguyên từng byte; dòng đầu thân vòng thêm
  `case " ${BO_QUA:-} " in *" $task "*) continue ;; esac`; hai dòng `echo …`/`bun run "$task" …` giữ nguyên từng byte.
- Lời gọi `verify-gate-shape.mjs` thêm `--bo-qua "$BO_QUA"` khi `BO_QUA` khác rỗng.

### 3. `.githooks/gate-shape.json` — khối khai `t1Only`

```json
"t1Only": {
  "note": "…",
  "skip": ["test", "build"],
  "classifier": "scripts/pre-push-t1.mjs",
  "sameRuleAs": ".github/scripts/phan-loai.mjs",
  "vi_sao": "…"
}
```

Khối này là nguồn DUY NHẤT của danh sách bỏ: bộ phân loại đọc nó, `verify-gate-shape` kiểm theo nó. Bỏ khối → bộ phân
loại báo lỗi → đủ năm bước (không phải im lặng bỏ).

### 4. `scripts/verify-gate-shape.mjs` — nhận nhánh T1 khi và chỉ khi có khai

Cờ mới `--bo-qua "<id …>"`. Không có cờ → hành vi y như hôm nay. Có cờ:

- `t1Only` vắng → chết: `the gate skipped <ids> for a T1-only push, but gate-shape.json declares no t1Only block`.
- `t1Only.skip` rỗng, có id không phải checker đã khai, hay `vi_sao` rỗng → chết, gọi tên.
- Tập `--bo-qua` khác tập `t1Only.skip` → chết: `the gate skipped <a> but gate-shape.json t1Only declares <b>`.
- Checker trong `--bo-qua` vẫn để lại run summary → chết: `checker '<id>' is declared skipped for a T1-only push, but it ran`.
- Checker còn lại kiểm y như hôm nay (thiếu summary → `left no run summary`).
- Báo cáo thêm một dòng `  skipped: test, build — T1-only push; <vi_sao>`.

### 5. `packages/ui/test/pre-push-t1.spec.ts` (mới)

Theo tiền lệ `rang-chat.spec.ts`: kiểm hạ tầng cổng nằm trong `@crm/ui#test`, nên `bun run test`, CI và pre-push của
lần đẩy có mã đều chạy nó. Mỗi ca dựng một kho git tạm có remote trần, CHÉP các tệp thật (hook, bộ phân loại,
`phan-loai.mjs`, `pre-merge-check.sh`, `lib/workspace-record.cjs`, `verify-gate-shape.mjs`,
`gate-shape-node-test.mjs`, `gate-shape.json`, `config.yaml`, mọi `package.json` của gói) rồi `git push` thật. `bun`
trên PATH là bản giả: `bun run <tác vụ>` ghi tên vào sổ, ghi một run summary turbo cho mọi gói có kịch bản đó (cùng
khuôn bên đọc `readLedger`), và theo biến môi trường thì thoát 1 cho một tác vụ; `bun <tệp>.mjs` chạy `node` thật — nên
`verify-gate-shape.mjs` chạy thật trên sổ đó. `oxlint` giả in dòng phủ.

## Răng đã ký ghim vào hook — giữ xanh bằng hình, không bằng may

Sáu răng; E8 soát năm ghim đọc và chạy hai răng rẻ, E10 chạy răng ep-chay.

| Răng | Ghim gì | Cách giữ |
| --- | --- | --- |
| `luoi-day-do-that/rang-hook.sh` ep-chay | dòng `for task in …; do` nguyên văn; lần đẩy sha cũ = sha mới chạy đủ năm | dòng giữ byte; tập tệp rỗng → nặng |
| `hinh-cua-luoi/rang-hinh.sh` tan-cong | hai `sed` mỗi cái đổi đúng một dòng | hai dòng đích giữ byte, không trùng dòng nào khác |
| `dieu-phoi-va-bien/rang/cong.mjs` | thân vòng chạy độc lập dưới `bash -c` | dòng `case` chỉ dùng `${BO_QUA:-}` |
| `dieu-phoi-truoc-mo-dot/rang/hook-cay.mjs` | hook thật trong kho tạm KHÔNG có tệp phân loại | lỗi phân loại → đủ năm bước, thoát 0 |
| `lenh-dung-do-khong-ai-thay/rang/ba-noi-deu-chay.mjs` | lần đẩy sha = sha in `pre-push: bun run build` | tập rỗng → nặng; không chạy lại (chạy hook thật hai lượt ≈30′) — cùng dạng đẩy và cùng dòng nằm trong E10 |
| `chuyen-goi-dieu-phoi/rang/cong.mjs` | dòng vòng tìm bằng `/^for task in .*; do$/` | dòng giữ byte |

## Ngôn ngữ thông điệp

Thông điệp bỏ chép nguyên văn đề bài. Đuôi «CI vẫn chạy đủ» chỉ đúng khi nhánh còn tệp mã khác so với `onehub`; với
nhánh chỉ có tài liệu, CI cũng bỏ job nặng. Câu hỏi cho chủ kho ở Cổng Phạm vi (Hỏi-1).

## Đặc tả UX

Không chạm giao diện — bỏ (sổ quyết định).
