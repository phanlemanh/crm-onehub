# Thiết kế: giam-phut-ci-nhap-t1

Ngày 11/10/2026 · T2 · nhánh gốc `onehub` · sha ghim của vòng: `27d47de04725bc04d8d6deff870ac16751f3bf69`
(đỉnh `onehub` lúc mở vòng; hai tệp workflow ở sha này giống hệt `4e03d1e5a`).

## Hiểu biết đã ghi lại

**Anh nói:**

- PR nháp không chạy job nặng: `ci.yml` `check` và ma trận `test` ba ô; `acceptance.yml` `build` và
  `agent-okr-node24`. Chuyển sẵn sàng thì chạy đủ một lượt.
- PR chỉ chạm tệp T1 không chạy job nặng. T1 đọc từ `risk_tiers.t1_skip_globs` (mẫu `case`, `*` vượt `/`), không viết
  danh sách `paths-ignore` thứ hai. PR chạm `.github/**` không bao giờ là T1.
- `ci-ok` xanh khi bỏ qua hợp lệ, đỏ khi job chạy mà đỏ.
- Push lên `onehub` giữ nguyên; CI1 đang đo 7 ngày tới 16/10.
- Tuỳ chọn: bỏ `TURBO_FORCE` ở `pre-push`.
- Luật tạm trong `CLAUDE.md`: mở PR nháp, chuyển sẵn sàng lúc trình thẻ Cổng Bằng chứng.
- Sửa `build`/`agent-okr` phải kiểm hồ sơ đã ký không đỏ thêm.

**Máy tìm thấy khi đọc kho (không phải giả định):**

1. `.github/workflows/ci.yml` đang nằm trong `t1_skip_globs` (khai 01/10). Bộ phân loại của vòng này phải tự loại
   `.github/**` dù glob có khớp — đúng án của kit.
2. `ci.yml` chỉ chạy khi push `main`/`release`, không chạy khi push `onehub`. «Push lên `onehub` giữ nguyên» nghĩa là:
   `acceptance.yml` khi push vẫn chạy đúng `acceptance gate` và `lệnh dựng`, không thêm phút.
3. Mọi cách bỏ qua job nặng đều làm đỏ sáu eval đã ký vốn chụp cứng hình dạng CI hôm nay:
   - `giam-phut-acceptance/E1` đòi đúng ba job, `build` không `if` cấp job, `if` của `agent-okr-node24` đúng nguyên chuỗi.
   - `giam-phut-acceptance/E2` chỉ đánh giá được một ngữ pháp biểu thức tối thiểu (`luong.mjs`); biểu thức mới → mã 2.
   - `giam-phut-acceptance/E3` chạy lại mọi eval đã ký có `paths` chạm `acceptance.yml` — kể cả E1, E2 của chính nó — nên
     đỏ theo hai eval trên.
   - `ci-ma-tran-ba-o/E1` đòi đúng ba job `check`, `test`, `ci-ok`, và `ci-ok` phải ĐỎ khi cả hai job `skipped`.
   - `ci-ma-tran-ba-o/E3` so từng khoá với bản đã đo ở #323 (`needs`, `if` cấp job…).
   - `giam-phut-acceptance/E5` rút tên job chạy khi PR bằng cùng bộ đánh giá `luong.mjs` của CI1, nên cũng thoát vì
     biểu thức mới. Tìm thấy ở S3 khi chạy phép đo «không đỏ thêm» (AC-7), sau Cổng Phạm vi lần đầu.
   Đường đúng của kit cho ca này là «eval thay bởi» (`status: not-run` + `superseded_by`) — kho đã dùng một lần
   (`thuoc-7-ngay-loc-pr` thay `ci-ma-tran-ba-o/E5`).
4. Bỏ `TURBO_FORCE` không chỉ là một dòng: `scripts/verify-gate-shape.mjs` từ chối mọi kết quả không phải `MISS`
   («read cache instead of running»), và hai hồ sơ đã ký (`hinh-cua-luoi`, `luoi-day-do-that`) đo luật đó.

**Máy giả định (anh gạch nếu sai):**

- [GIẢ ĐỊNH] Phút thêm của job phân loại (+1 phút tính tiền mỗi workflow, mỗi lượt PR) đáng đổi lấy phần bỏ qua.
- [GIẢ ĐỊNH] Job nhẹ «acceptance gate» giữ chạy ở PR nháp (lý do ở mục Job nhẹ).
- [GIẢ ĐỊNH] Ngưỡng Cổng Đáng ở `opportunity.md` (≤ 42 phút PR mỗi nhánh là sống; > 50 là chết).

## Cách làm

### Bộ phân loại — một tệp, một nguồn

`.github/scripts/phan-loai.mjs` (Node, không gói ngoài) quyết `nang=true|false` kèm `ly_do`:

| Ngữ cảnh | Kết quả | `ly_do` |
|---|---|---|
| sự kiện không phải `pull_request` | nặng | `khong-phai-pr` |
| PR nháp | nhẹ | `nhap` |
| PR sẵn sàng, có tệp dưới `.github/` | nặng | `cham-github` |
| PR sẵn sàng, mọi tệp khớp T1 | nhẹ | `chi-t1` |
| PR sẵn sàng, có tệp không T1 | nặng | `co-tep-nang` |
| PR sẵn sàng, không đọc được danh sách tệp, danh sách rỗng, hay lỗi bất kỳ | nặng | `loi: <câu>` / `khong-co-tep` |

- **Danh sách glob** đọc bằng `configList` của `lib/workspace-record.cjs` — đúng bộ đọc `pre-merge-check.sh` dùng.
- **Phép khớp** gọi đúng hai hàm `glob_variants` và `match_globs` rút từ `scripts/pre-merge-check.sh` qua bash — cùng
  cách `scripts/product-map.mjs` đã làm («kit giữ MỘT bộ khớp glob»). Không có danh sách glob thứ hai, không có bộ khớp
  thứ hai; thêm một glob vào config là đổi phân loại, không sửa tệp nào khác.
- **Danh sách tệp** = `git diff --name-only --no-renames HEAD^1 HEAD` trên commit hợp nhất `refs/pull/N/merge` (checkout
  `fetch-depth: 2`). `--no-renames` để một tệp mã đổi tên thành `.md` vẫn hiện cả tên cũ. HEAD không có đúng hai cha →
  nặng.
- **Hỏng là chạy đủ:** mọi lỗi cho `nang=true`. Bộ phân loại chỉ có quyền bớt việc khi nó chắc.
- Đặt dưới `.github/` có chủ đích: sửa bộ phân loại là chạm `.github/**`, nên PR đó luôn chạy đủ.
- `.github/scripts/test/phan-loai.test.mjs` (`node --test`) chạy trước bước phân loại trong chính job phân loại: bài kiểm
  đỏ thì job đỏ, `nang` rỗng, job nặng vẫn chạy và `ci-ok` đỏ.

### Hai workflow

Job mới `phan-loai` (tên hiển thị «phân loại PR»), giống hệt nhau ở hai tệp: `if: github.event_name == 'pull_request'`,
checkout `fetch-depth: 2`, bài kiểm, rồi bước `id: pl` chạy bộ phân loại với `SU_KIEN` và `NHAP` từ sự kiện; xuất
`outputs.nang`.

Job nặng (`check`, `test`, `build`): `needs: phan-loai`,
`if: ${{ !cancelled() && needs.phan-loai.outputs.nang != 'false' }}`.
`agent-okr-node24`: thêm `github.event_name == 'pull_request' &&` ở đầu cùng biểu thức đó.

- Push: `phan-loai` bị bỏ qua (0 phút), `nang` rỗng, job nặng chạy như cũ. `acceptance.yml` khi push lên `onehub` chạy
  đúng `acceptance gate` + `lệnh dựng` — cùng lệnh, cùng phút.
- `!cancelled()` để job nặng vẫn chạy khi bộ phân loại hỏng (mặc định GitHub sẽ bỏ qua job khi job nó cần bị đỏ).
- Phần còn lại của mọi job cũ (bước, biến, ma trận, dịch vụ, trần giờ), khối `on:`, `concurrency`, `permissions`,
  `env` cấp gốc giữ từng khoá như sha ghim.

`ci-ok`: `needs: [phan-loai, check, test]`, `if: always()`. Xanh khi và chỉ khi phân loại `success` hoặc `skipped`, VÀ
(hoặc `check` và `test` cùng `success`, hoặc phân loại `success` với `nang == false` và cả hai `skipped`). Mọi ô khác đỏ:
job nặng đỏ, bị huỷ, bị bỏ qua mà không có lời phân loại nhẹ, hay bộ phân loại hỏng.

`acceptance.yml` không có job tổng hợp; job bị bỏ qua hiện xám. `onehub` không có check bắt buộc (CI1 E5 đo), nên không
PR nào kẹt «Expected».

### Job nhẹ «acceptance gate» giữ ở PR nháp

Giữ, không thêm `if`. Ba lý do: khoảng 2–3 phút; nó bắt đúng lớp lỗi hay chặn gộp nhất (bằng chứng hoá cũ, thiếu chữ ký,
bản đồ lệch) đúng lúc phiên đang chuẩn bị trình cổng; và `luat-kho-vong-doi` cùng CI1 đã ký đòi job đó không có `if` cấp
job. Ở PR nháp nó sẽ đỏ vì chưa có chữ ký — đó là tin, không phải lỗi.

### Chuyển sẵn sàng chạy đủ đúng một lượt

Khối `on:` đã có `ready_for_review`; sự kiện đó mang `draft: false`, nên bộ phân loại cho nặng (trừ PR chỉ T1).
`concurrency` theo số PR với `cancel-in-progress` (không đổi) nên lần đẩy ngay sau đó huỷ lượt trước, không chạy chồng.

### Thước phút

`rang/do-phut-ci.mjs`: đọc lượt `pull_request` của cả hai workflow trong cửa sổ, tính phút bằng ĐÚNG hàm
`phutCuaJob`/`phutCuaLuot` export từ `giam-phut-acceptance/rang/do-phut.mjs` (mỗi job làm tròn lên phút, job `skipped`
0 phút) — không viết cách tính thứ hai. In: số lượt, tổng phút, phút mỗi nhánh, lượt «nhẹ» (job nặng bị bỏ qua) và lượt
«nặng», và dòng ngưỡng đọc từ `opportunity.md`.

### Luật tạm trong `CLAUDE.md`

Một mục ngắn: mở PR bằng `gh pr create --draft`; chuyển `gh pr ready` đúng lúc trình thẻ Cổng Bằng chứng (sau ghim lại
và vẽ bản đồ); nháp chỉ chạy job nhẹ; luật tạm tới đề xuất kit #301 (mốc 25/10).

## Eval cũ thay bởi vòng này

Sáu eval dưới đây chụp cứng hình dạng CI mà vòng này đổi có chủ đích. Mỗi eval được khai `status: not-run` +
`superseded_by` trỏ AC của vòng này; AC đó đo lại phần lời hứa cũ còn đúng. Hai hồ sơ cũ được ghim lại ở đỉnh nhánh
sau khi vòng này có chữ ký Cổng Bằng chứng.

| Eval cũ | Lời hứa cũ | AC mới |
|---|---|---|
| giam-phut-acceptance/E1 | ba job; `acceptance gate` đúng hình; `build` chạy khi push; `agent-okr` chỉ khi PR; concurrency | AC-5 |
| giam-phut-acceptance/E2 | PR chạy đủ lệnh cũ; push chạy đúng lệnh đã chọn | AC-6 |
| giam-phut-acceptance/E3 | hồ sơ đã ký đo `acceptance.yml` không đỏ thêm | AC-7 |
| giam-phut-acceptance/E5 | mọi check bắt buộc của `onehub` còn một job cùng tên chạy khi PR | AC-12 |
| ci-ma-tran-ba-o/E1 | `ci-ok` chỉ xanh khi job nặng xanh; ba job đúng hình | AC-4 |
| ci-ma-tran-ba-o/E3 | `check`/`test` giống bản đã đo ở #323 | AC-3 |

Các eval còn lại của hai hồ sơ (`giam-phut-acceptance` E4; `ci-ma-tran-ba-o` E2, E4) giữ nguyên và vẫn chạy.

## Không làm ở vòng này

- `TURBO_FORCE` ở `pre-push` (tuỳ chọn 5): bỏ nó đòi đổi luật «chạy mới hết» của `verify-gate-shape.mjs` mà hai hồ sơ đã
  ký đo — một quyết định chính sách riêng, vòng riêng.
- Danh sách `paths`/`paths-ignore` ở khối `on:` — danh sách thứ hai, anh đã cấm; và bỏ cả workflow thì mất `ci-ok`.
- Bỏ job nhẹ ở PR nháp.
- Bảo vệ nhánh, check bắt buộc, cài đặt GitHub.
- Đổi lượt push.

## Rủi ro

- Phiên không theo luật nháp → chỉ còn phần T1 (≈ 20% PR). Đo ở Cổng Giá trị.
- PR T1 lọt lỗi: tệp T1 là tài liệu và bộ thước vendored; bộ thước vendored đổi thì `luat-kho` vẫn chạy
  `pre-merge-check` và `product-map --check` trên chính nó.
- Bộ phân loại sai → hỏng theo hướng chạy đủ, trừ lỗi logic cho «nhẹ» sai — bài kiểm trong job phân loại và eval của vòng
  chặn lớp đó.
- Cửa sổ đo CI1: lượt push không đổi; trung vị PR của CI1 giảm thêm vì vòng này (ngưỡng PR của CI1 vốn đã đạt).
