# nguoi-huy-khong-lac — kế hoạch

Hồ sơ `_acceptance/nguoi-huy-khong-lac/` · design `docs/superpowers/specs/2026-10-07-nguoi-huy-khong-lac-design.md`

| # | Việc | Tệp | Phục vụ | independent |
|---|---|---|---|---|
| 1 | Khung: `fetch` giả từ chối signal huỷ sẵn + đếm `soLanHuySan`; `choTreo(hanMs)` có hạn; hằng `TRE_TOI_FETCH_MS`, `HAN_KHONG_LAC_MS` | `apps/app/test/khung-cua-hoan.ts` | E1, E2, E3 | false |
| 2 | Spec: hàm dùng chung `huyKhiDangTreo(n, tre)` + `khangDinhHuy`; ca `nguoi-huy` đi qua nó; describe `khong-lac-duong-cham` (tre = `TRE_TOI_FETCH_MS`); describe `fetch-gia-theo-that` (ma trận năm ô + đối chứng fetch thật + đối chứng dương) | `apps/app/test/soan-okr-khong-tru-luot.spec.ts` | E1, E2, E3 | false (cần việc 1) |
| 3 | Khai lệnh `nhkl_duong_cham`, `nhkl_fetch_gia` trong `executors.test` | `_acceptance/config.yaml` | E1, E2 | false |
| 4 | Cặp đo hai chiều trên bản sao (measure-birth), ghi kết quả vào Notes của contract | bản sao trong scratchpad, không vào cây | E1, E2, E3 | false |

Verify mỗi việc: `bun run test -- "cd apps/app && export TZ=Asia/Ho_Chi_Minh && bun test ./test/soan-okr-khong-tru-luot.spec.ts -t '<describe>'"`; cuối: ba tệp dùng chung khung 5 lượt, `check-types`, `lint`, `lint:slop`.

Chiều đỏ (việc 4), mỗi bản sao là một tệp spec/khung tạm đặt cạnh tệp thật rồi xoá:
- E1/E3: ca chờ `Bun.sleep(20)` / `Bun.sleep(0)` thay `k.choTreo()` → `huy-truoc-fetch n=<n>`.
- E2: khung bỏ dòng kiểm signal huỷ sẵn → năm dòng `fetch-gia-da-huy <ket>`.
- `choTreo`: mock tăng lượt ném lỗi → `cho-treo-qua-han`.
- E3 (E4 gốc): route bỏ nhánh `request.signal.aborted` → `hoan-khi-nguoi-huy n=<n>` dưới 1 s.
