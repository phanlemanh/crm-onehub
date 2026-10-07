# ci-test-duoi-tran — design

Hàng F16, dãy P4, Cổng Đáng `build` (luật 21). Hạng T2.

## Số đo (07/10, 10 lượt CI xanh gần nhất, `gh run view`)

| Lượt | Job | Bước test |
|---|---|---|
| 37647955405 | 27.4 | 23.0 |
| 37624939982 | 21.5 | 18.1 |
| 37620262552 | 27.3 | 23.2 |
| 37614388129 | 19.3 | 16.0 |
| 37601862688 | 28.4 | 24.2 |
| 37601233265 | 29.0 | 24.8 |
| 37592209468 | 28.6 | 24.4 |
| 37591762331 | 27.9 | 24.1 |
| 37583824388 | 21.6 | 18.3 |
| 37582491991 | 26.9 | 22.8 |

Cộng «Ran … [x s]» theo gói (37624939982): api 7.1 · app 4.6 · agent 2.5 · db 2.0 · ui 1.0 · năm gói còn lại 0.9 →
≈ 18 phút = bước test. Các gói chạy nối tiếp vì `test-run.ts` gọi `turbo run test --concurrency=1` trên một CSDL chung.

## Cách làm

`scripts/ci/test-song-song.mjs`:
- Không đối số → bốn nhóm, tối đa `min(os.availableParallelism(), 4)` nhóm cùng lúc, nhóm dài trước, đúng bốn nhóm suite của `config.yaml`: api | app + @crm/ui | agent + @crm/auth + @crm/db |
  agent-okr + @crm/env + @crm/ai-okr + @crm/telemetry + @crm/validation. Mỗi nhóm là một tiến trình
  `bun packages/db/scripts/test-run.ts --filter=…`, nên tự dựng và xoá CSDL `crm_<id>_test` riêng. Chạy đồng thời,
  in đầu ra từng nhóm theo khối khi nhóm xong, in một dòng kết quả mỗi nhóm, thoát khác 0 nếu nhóm nào đỏ.
- Trước khi chạy: đọc workspace globs của `package.json` gốc và miễn trừ checker `test` của `.githooks/gate-shape.json`;
  mọi gói có script `test` phải nằm trong đúng một nhóm, không thì dừng và gọi tên gói.
- Có đối số → `bun packages/db/scripts/test-run.ts <đối số>` y như cũ.
- `package.json` gốc: `"test": "node scripts/ci/test-song-song.mjs"` (đã xin `cham-tep`).

Máy CI: kho private → máy chuẩn của GitHub 2 vCPU, 7 GB (log không in số nhân; theo bảng máy chuẩn). Hai làn, nhóm dài trước:
api 7.1 → OKR 0.5 = 7.6 | app+ui 5.6 → agent+db 4.8 = 10.4 → đường găng lý tưởng ≈ 10.4 phút (+ dựng CSDL mỗi nhóm), so với ≈ 18.
Ngưỡng AC-6: bước test < 16, job < 22.
- Thử nghiệm được: cờ `--test-run <tệp>` (thay `test-run.ts`) và `--goc <thư mục>` (workspace giả) để bài kiểm chạy chính CLI với tiến trình con giả.

## Đo

E1 hàm thuần (ma trận viết trước, tiến trình con giả). E2 chạy thật ở máy: bốn CSDL khác nhau, thời gian chồng nhau,
`verify-gate-shape` không có vấn đề ở checker `test`. E3 đọc thời gian job trên CI của chính PR (PR nháp mở sau S3).
