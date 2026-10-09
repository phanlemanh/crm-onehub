# Thiết kế — ci-ma-tran-ba-o (F21)

## Mục tiêu

Rút thời gian CI của mọi PR vào `onehub` từ ~27′ xuống ~10–11′ bằng cách chạy bước test thành ba job song song trên ba
máy, đúng cấu hình đã đo ở #323; và đổi luật kho để `ci.yml` là tệp OneHub tự giữ (anh quyết 09/10, luật 47).

## Hình dạng `ci.yml`

Lấy nguyên bản `ci.yml` của nhánh thử `thu/ci-tach-job` (commit `341a9d6c1`), không đổi gì — để số đo của #323 là số đo
của chính bản gộp (AC-4):

| Job | Máy | Làm gì |
| --- | --- | --- |
| `check` | 1 | install, `check-types` (`NODE_OPTIONS` giữ như bản vá cũ), `lint`, `lint:slop`; không Postgres |
| `test` × 3 | 3 | ma trận `api` · `app-ui` (`app` + `@crm/ui`) · `con-lai` (bộ lọc loại trừ); Postgres riêng, `db:deploy`, `bun run test -- <bộ lọc>`; `fail-fast: false` |
| `ci-ok` | 1 | `needs: [check, test]`, `if: always()`, đỏ khi một job trước không `success` |

`timeout-minutes` mọi job 20 — đúng trần gốc của hãng; bản vá 30′ của kho bỏ đi.

Vì sao ô `con-lai` dùng bộ lọc loại trừ: gói mới thêm vào `apps/` hay `packages/` tự rơi vào ô này, không bao giờ lọt
khỏi CI (AC-2). Vì sao ba ô: thời lượng tuần tự của từng gói đo ở `docs/plan/ci-tach-job.md` — `api` 10,2′, `app` +
`@crm/ui` 9,1′, phần còn lại ≈ 6′.

## CLAUDE.md

Thay đúng một câu trong mục «Kho này là bản riêng» bằng đoạn ở Notes của hợp đồng. Không đổi luật nào khác. Đoạn mới
nói cách xử khi kéo bản mới của hãng: giữ bản OneHub ở `ci.yml`, chép tay phần hãng đổi mà OneHub cần.

## Bài đo

- E1 `rang/hinh.mjs` — đọc YAML, kiểm hình dạng; AC-3 đo bằng chính chuỗi lệnh của bước `ci-ok` chạy qua bash trên ma
  trận 16 cặp kết quả.
- E2 `rang/phu-goi.mjs` — tập gói có test rút từ `package.json` thật, so với tập turbo chọn cho từng ô.
- E3 `rang/khop-323.mjs` — so `ci.yml` HEAD với bản đã đo ở #323, và đọc hai lượt CI của #323 qua `gh api`.
- E4 `rang/claude-md.mjs` — câu cũ vắng, đoạn mới có nguyên văn (đọc từ Notes của hợp đồng).
- E5 `rang/do-7-ngay.mjs` — thước của ngưỡng 7 ngày, định nghĩa sẵn «huỷ vì trần» khác «huỷ vì đẩy chồng»; chạy được
  ngay trên hai lượt thật của #323.

Năm khoá cấu hình mới `cmtb_hinh`, `cmtb_phu_goi`, `cmtb_khop_323`, `cmtb_claude_md`, `cmtb_do_7_ngay` — chỉ thêm vào `_acceptance/config.yaml`,
xin `cham-tep`.
