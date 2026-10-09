# Đề xuất gửi hãng: tách bước test của `ci.yml` thành nhiều job

> **09/10: anh quyết không gửi hãng (luật 47).** OneHub tự giữ `ci.yml`; hàng F21 `ci-ma-tran-ba-o` áp ma trận ba ô vào kho.
> Tài liệu này giữ làm bằng chứng đo cho F21. Mục «Bản nháp gửi hãng» bên dưới không dùng nữa.
>
> Hàng F20 `ci-tach-job-de-xuat-hang` của đợt sau-14-10 (luật 33). Đây là **bản nháp chưa gửi**.
> Gửi issue hay PR sang `trycompai/crm` là việc ra ngoài kho: giám sát hỏi anh trước, không ai tự gửi.

## Vì sao làm

CLAUDE.md: «Phí bản rẽ là chi phí dài hạn lớn nhất ở đây. Sửa được ở hãng thì gửi lên hãng.»
`ci.yml` là tệp của hãng. Bản của ta đã lệch hãng hai chỗ để job test khỏi bị huỷ:

| Chỗ lệch | Hãng (`release`) | `onehub` |
| --- | --- | --- |
| `timeout-minutes` của job `check` | 20 | 30 |
| `NODE_OPTIONS` cho `check-types` | không có | `--max-old-space-size=6144` |

Nâng trần không giải gốc. `bun run test` gọi turbo với `--concurrency=1`
(`packages/db/scripts/test-run.ts`, hàm `commandFor`), tức mọi gói chạy **tuần tự** trong MỘT job trên một
máy 2 nhân: bước test bằng tổng thời gian các gói, nên cứ thêm test là job lại sát trần. F16 đã thử nới
song song trong cùng máy và anh đóng nó (luật 33): máy 2 nhân không ổn định (bước test 20,1′, job 24,1′,
gói `api` từ 795 s lên 1110 s, một ca đo tốc độ 1055 ms vượt 1 s). Lối còn lại là chạy song song trên
NHIỀU máy, tức nhiều job, mỗi job vẫn tuần tự như hiện nay.

## Số đo đêm 07–08/10/2026

Nguồn: `gh run list --workflow ci.yml` trên `phanlemanh/crm-onehub`, mọi lượt tạo trong
2026-10-07T00:00Z–2026-10-09T00:00Z, thời lượng job và bước lấy từ API `actions/runs/<id>/jobs`.

| | Số job | Ghi chú |
| --- | --- | --- |
| Tổng | 63 | |
| Xanh | 52 | |
| Đỏ | 4 | lỗi thật của nhánh, không vì trần |
| Huỷ | 7 | 2 lượt huỷ ở trần 30′ (`37813188666`, `37590353875`, bước test 26,1′ và 25,9′); 5 lượt huỷ vì có lượt mới đè lên |

Trên 52 job xanh (phút):

| | Trung vị | p90 | Lớn nhất | Nhỏ nhất |
| --- | --- | --- | --- | --- |
| Cả job | 26,9 | 29,2 | 29,8 | 18,5 |
| Bước `bun run test` | 22,9 | 25,1 | 25,6 | 15,6 |
| Bước `check-types` | 2,6 | 2,9 | 3,1 | 1,6 |
| Bước `bun install` | 0,5 | 0,6 | 0,7 | 0,4 |

37/63 job dài từ 25′ trở lên. Ở trần hãng (20′), 49/52 job xanh của ta sẽ bị huỷ.

### Thời lượng từng gói

Turbo in khối của một gói khi gói đó xong. Vì các gói chạy tuần tự, thời lượng một gói bằng mốc xong
của nó trừ mốc xong của gói ngay trước; số này khớp với tổng thời gian bun tự báo cho gói đó.

| Lượt | `@crm/db` | `@crm/ui` | `agent` | `api` | `app` | Bước test |
| --- | --- | --- | --- | --- | --- | --- |
| `37835855349` (08/10, xanh) | 2,0′ | 1,6′ | 2,9′ | 10,2′ | 7,5′ | 25,4′ |
| `37692109964` (07/10, xanh) | ≈ 2,2′ | ≈ 1,6′ | ≈ 3′ | 10,7′ | 7,0′ | 25,6′ |

Bảy gói còn lại (`@crm/env`, `@crm/ai-okr`, `@crm/telemetry`, `@crm/validation`, `agent-okr`, `@crm/auth`)
cộng lại dưới 1,5′. Ở lượt `37835855349`, ba nhóm của đề xuất dưới đây cộng ra: `api` 10,2′ · `app` +
`@crm/ui` 9,1′ · phần còn lại khoảng 6′.

## Đề xuất

Giữ nguyên lệnh và tên lệnh của hãng. Chỉ đổi hình dạng job:

1. **Job `check`** — `bun install`, `check-types`, `lint`, `lint:slop`. Không cần Postgres.
2. **Job `test` dạng ma trận**, mỗi ô một máy, mỗi ô có Postgres riêng và `db:deploy` riêng, chạy
   `bun run test -- <bộ lọc turbo>`. Ba ô, chia theo thời điểm xong ở trên:
   - `api`
   - `app` + `@crm/ui`
   - phần còn lại: `agent`, `@crm/db`, `@crm/auth`, `@crm/env`, `@crm/validation`, `@crm/telemetry`,
     và các gói ứng dụng khác khi có.
   `fail-fast: false`, để một ô đỏ không giấu kết quả ô khác.
3. **Job `ci-ok`** `needs: [check, test]`, một bước xác nhận mọi job trước đều xanh. Branch
   protection trỏ vào đúng một tên này, nên thêm hay bớt ô ma trận sau này không phải sửa
   protection.

`bun run test` của hãng đã dựng mỗi lượt một cơ sở dữ liệu riêng (`packages/db/scripts/test-run.ts`,
`crm_<id>_test`), nên ba ô trên ba máy không đụng nhau. Bộ lọc `--filter` đi thẳng qua tới turbo,
giống lệnh mà kho ta đã dùng ổn định cho làn ghim lại (`_acceptance/config.yaml`, `suite_api`,
`suite_app_ui`, `suite_agent_db`, `suite_okr_goi`).

Phần ô ba gom «phần còn lại» bằng danh sách loại trừ (`--filter=!api --filter=!app --filter=!@crm/ui`)
thay vì liệt kê, để gói mới tự rơi vào một ô, không bao giờ lọt khỏi CI.

### Giá

- Phút máy tăng: mỗi ô thêm `checkout` + `bun install` + `db:deploy` + `^build` của gói phụ thuộc,
  khoảng 1′/ô theo số đo trên. Ba ô ≈ +3′ máy mỗi lượt, đổi lấy thời gian chờ ngắn hơn.
- Hai tệp cấu hình cần chép giống nhau giữa các job (biến môi trường, dịch vụ Postgres). Dùng
  `env` ở cấp workflow và một khối `services` lặp lại; không cần composite action.

### Ngưỡng nghiệm thu `[đề xuất]`

- `[đề xuất]` Job dài nhất của một lượt xanh ≤ 15′ (trung vị trên ≥ 10 lượt sau khi gộp), so với 26,9′ hiện nay.
- `[đề xuất]` 0 lượt bị huỷ vì trần trong 7 ngày sau khi gộp.
- `[đề xuất]` Kho ta bỏ được bản vá `timeout-minutes: 30`, quay về đúng trần 20′ của hãng.

Ba ngưỡng này đo được bằng chính lệnh đã dùng ở mục «Số đo», chạy lại trên các lượt sau khi gộp.

## Cái ta KHÔNG biết, và phải nói thẳng với hãng

- **Nỗi đau chủ yếu là của bản rẽ.** Phần lớn test trong `api` và `app` là của các tính năng OneHub
  (OKR, Zalo, Kho tài liệu…). Bộ test của hãng có thể vẫn vừa trong 20′. Lý lẽ gửi hãng phải là
  khuôn job chung (thêm test không đẩy job tới trần, đỏ một gói không chờ cả bộ), không phải con số
  của ta. Chưa đo bộ test thuần của hãng: việc đó cần chạy `bun run test` trên `release` sạch.
- **Phí dựng mỗi ô chưa đo.** Ước lượng ô dài nhất ≈ 10′ test + ≈ 1,5′ dựng (checkout, `bun install`,
  `db:deploy`, `^build` của gói phụ thuộc) ≈ 12′. Chỉ lượt CI thật trên ba máy mới cho số.
- **Phí ma trận phụ thuộc gói hãng có.** Nếu hãng không có các gói của ta, có thể hai ô (`api`,
  phần còn lại) đã đủ.

## Kết quả thử trên nhánh nháp (09/10/2026)

Nhánh `thu/ci-tach-job` (PR nháp phanlemanh/crm-onehub#323, không gộp), `ci.yml` đổi đúng như mục «Đề xuất», mã giống
hệt `onehub`. Hai lượt, cả hai xanh:

| Lượt | Cả lượt | `check-types, lint` | `test (api)` | `test (app-ui)` | `test (con-lai)` |
| --- | --- | --- | --- | --- | --- |
| `37860355090` | 10,1′ | 3,9′ | 9,1′ (test 7,6′) | 9,8′ (test 8,9′) | 7,1′ (test 6,1′) |
| `37862221635` | 11,2′ | 2,6′ | 11,0′ (test 10,0′) | 9,5′ (test 8,5′) | 6,8′ (test 5,8′) |

So với 52 job xanh của đêm 07–08/10 (trung vị cả job 26,9′, p90 29,2′): người chờ CI giảm từ khoảng 27′ xuống
10–11′. Job dài nhất 9,8′ và 11,0′, đạt ngưỡng `[đề xuất]` ≤ 15′ trên hai lượt; cần ≥ 10 lượt sau khi gộp để chốt trung vị.
Phút máy tăng: tổng thời lượng các job ≈ 30′ mỗi lượt so với ≈ 27′ trước, đúng ước lượng «≈ +1′ mỗi ô».

## Thử trước khi gửi (anh đã chọn 3 rồi 2)

`ci.yml` là tệp của hãng. Sửa nó ở `onehub` để thử là thêm một chỗ rẽ (CLAUDE.md). Ba lối:

1. Gửi đề xuất dạng issue kèm số đo trên, để hãng tự thử. Rẻ nhất, không thêm rẽ.
2. Mở PR lên hãng, CI của chính PR đó là lượt thử (CI hãng chạy trên PR). Có số thật, nhưng số đo
   trên bộ test của hãng, không phải của ta.
3. Thử trên một nhánh nháp của `onehub` (không gộp), lấy số ba ô với bộ test của ta, rồi gửi kèm.
   Không thêm rẽ vì nhánh không gộp; tốn khoảng một lượt CI (≈ 30′ máy).

Máy khuyên **3 rồi 2**: có số thật của ta để biết ngưỡng 15′ có đạt không, rồi mới gửi PR lên hãng.

## Bản nháp gửi hãng (tiếng Anh, chưa gửi)

> **Title:** ci: split `bun run test` into a parallel job matrix
>
> The `check` job runs `check-types`, `lint`, `lint:slop` and the whole `bun run test` on one 2-vCPU
> runner, and `bun run test` runs turbo with `--concurrency=1`, so the test step is the sum of every
> package. On our fork it now takes a median 22.9 min (p90 25.1 min, 52 green runs on 2026-10-07/08),
> the whole job a median 26.9 min, and two runs were cancelled at the job timeout. Raising concurrency
> inside one runner was unstable for us (`api` went from 795 s to 1110 s, timing-sensitive tests
> crossed their limits).
>
> Proposal, no change to any command:
> - `check` job: install, `check-types`, `lint`, `lint:slop` (no Postgres).
> - `test` job as a matrix, one runner per cell, each with its own Postgres service and `db:deploy`,
>   running `bun run test -- <turbo filter>`: `api` · `app` + `@crm/ui` · everything else via
>   exclusion filters, so a new package can never fall out of CI. `fail-fast: false`.
> - `ci-ok` job with `needs: [check, test]` as the single required check for branch protection.
>
> On our fork, two trial runs of this shape took 10.1 and 11.2 min end to end (longest job 9.8 and 11.0 min),
> against a 26.9 min median for the single job.
>
> `packages/db/scripts/test-run.ts` already gives each run its own database, so cells on separate
> runners do not collide. Cost: roughly +1 min of runner time per cell for checkout, install and
> migrations. Happy to open the PR if this direction works for you.
