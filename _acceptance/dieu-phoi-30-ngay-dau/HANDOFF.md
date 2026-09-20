# Bàn giao — dieu-phoi-30-ngay-dau

Viết lúc 2026-09-20, trên Mac mini, tại `5649ead1`.
Đọc file này trước, rồi mở `contract.md` và `evidence-report.md`.

## Đang ở đâu

Vòng tính năng đã đi qua Cổng Đáng và Cổng Phạm vi. Đang mắc ở giữa S4.

| Mốc | Trạng thái |
| --- | --- |
| Cổng Đáng | ký 2026-09-19 (`opportunity.md`) |
| Cổng Phạm vi | ký 2026-09-20 bởi Manh Phan, 14 tiêu chí, 15 phép đo, hạng T3 |
| Thi công (S3) | xong, 10 task |
| Năm lệnh chứng minh | xanh cả năm ở `38cea6a6` |
| S4 vòng 1 | **BLOCKED** — xem dưới |
| Cổng Bằng chứng | chưa tới được |

`contract.md` đang ở `status: implemented`. **Đừng đưa nó sang `verified`**:
vòng 1 không cho ra verdict thật.

## Vì sao BLOCKED

Một phép đo không chạy được, ba phép đo chạy xanh mà sai.

### E11 không chạy được — chặn hạ tầng, không phải lỗi sản phẩm

E11 là phép đo «nhìn thấy trên ảnh» của AC-11. Nó bắt buộc dùng cặp cổng
3300/3301 khai trong `.claude/launch.json` (`api-cay-nay`, `app-cay-nay`).

Trên Mac mini, cặp cổng đó đang bị worktree `busy-chatterjee-fc04e2` giữ
(pid api 94900, app 95303) — nhánh của **PR #65**, một luồng việc khác đang
chạy. Bước «chặn cây» của E11 làm đúng việc: nó nhận ra mình đang nhìn cây
khác, thoát mã 2, và không đọc con số nào trên ảnh.

Cổng là tài nguyên toàn máy, dù tên khai là «cây này». Chi tiết ở bộ nhớ dự
án `cong-3300-la-tai-nguyen-chung`.

**Trên máy mới, việc đầu tiên là kiểm lại cổng** — nhiều khả năng nó rảnh và
chặn này tự biến mất:

```
for P in 3300 3301; do lsof -nP -iTCP:$P -sTCP:LISTEN -t; done
```

Rảnh thì đi thẳng, không cần quyết gì. Bị chiếm thì ba lối, và lối nào cũng
cần người chọn:

| Lối | Làm gì | Đổi lại |
| --- | --- | --- |
| A | Dừng hai máy chủ của phiên kia | Phiên đó mất bản dev đang chạy — và nó có PR đang mở |
| B | Đổi E11 sang cặp 3500/3501 (`cay-chinh-*`, đã khai sẵn) | Sửa phép đo đã ký: phải thêm dòng sổ quyết định, `evalsHash` đổi |
| C | Khai E11 không chạy | Hạ thước. AC-11 là tiêu chí duy nhất «thấy được trên màn». Đừng |

Chưa ai chọn. Đây là việc đang chờ người.

### Ba lỗi TRONG hợp đồng — phải sửa trước khi chấm lại

Cả ba mức nặng. Máy không được tự bỏ qua, và cũng không được sửa các mục
*ngoài* hợp đồng cùng lúc.

1. **AC-6 — mã không khớp thứ hai trở đi bị bỏ âm thầm.**
   `apps/api/src/onboarding/onboarding-ingest.service.ts:75`.
   `onboardingMatchNeeded` xếp việc cho tác nhân mà không mang `contactId`
   hay `subject`, nên câu chống trùng ở `agent-trigger.service.ts:479` khớp
   *bất kỳ* việc `onboarding-identify` nào còn treo. Trong cùng một lô có hai
   mã không khớp: mã đầu tạo việc, mã sau biến mất. Phản hồi vẫn đếm đủ N mã
   đã chuyển. Mã mất không lưu ở đâu, không có đường thử lại.
   E6 không bắt được vì bài kiểm thay hẳn `AgentTriggerService` bằng một bản
   giả và chỉ dùng MỘT mã không khớp.

2. **AC-12 — nút «Gỡ» không gỡ gì.**
   `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx:158`.
   `onConfirm` gọi `upsertEnrollment` — một phép GHI. Router không có thủ tục
   xoá ghi danh nào cả. Bấm Gỡ rồi xác nhận thì hàng vẫn còn, bốn mốc bậc còn
   nguyên, và không có lỗi nào hiện ra. Tệ hơn: cú bấm đó lật `source` từ
   `nen-tang` về `tay`.

3. **AC-12 — phép đo không chạm lời hứa nó tự khai.**
   `apps/app/test/dieu-phoi-trang-thai.spec.ts:79`.
   E12 hứa «dựng màn hồ sơ, bấm nút xoá». Ba bài kiểm chỉ gọi bộ giảm thuần
   `luong-xoa.ts` với một closure do chính bài kiểm dựng; `HoSoKeHoach` chưa
   từng được render. Đột biến mà E12 tự khai xảy ra ở chỗ phép đo không với
   tới — nên nó xanh, và lỗi số 2 đi qua.
   Đây là gốc của lỗi 2, và nó vi phạm luật đã ghi ở bộ nhớ dự án
   `luat-do-phai-cham-loi-hua`.

Sửa xong ba mục này thì chứng chiều đỏ từng cái bằng chính lệnh của eval, rồi
chấm lại **cùng vòng 1** (BLOCKED không tính là một vòng đã tiêu).

### 32 mục ngoài hợp đồng

17 mức nặng. Chúng nằm ở `review-findings.md`, và đi Cổng Bằng chứng cho
người quyết — **không sửa ở vòng chấm**. Vài mục đáng đọc sớm vì chúng nặng:
so khoá bí mật của điểm nhận chưa chống đo thời gian (bản anh em ở
`listings.controller.ts` thì có), `ONEHUB_PLATFORM_INGEST_SECRET` không có
decorator kiểm nào, `createFromTemplate` không kiểm người/công ty có thật,
`listPlans` nhận `q`/`sort`/`dir` rồi bỏ lặng.

## Chạy tiếp thế nào

Bộ kit đang dùng: **acceptance-gate-kit 2.17.0**.

Sinh lại args (BẮT BUỘC sau mỗi lần cây đổi — tệp args mang `generated_sha`,
lệch HEAD là phải sinh lại, tuyệt đối không soạn tay):

```
node ~/.claude/plugins/cache/acceptance-gate-kit/feature-loop/2.17.0/scripts/s4-args.mjs \
  --slug dieu-phoi-30-ngay-dau --root . --out /tmp/s4-args.json
```

Rồi dispatch `feature-loop/2.17.0/workflows/acceptance-verify.js` với nội
dung tệp đó làm `args`. Vòng 1 vừa rồi tốn 30 agent, ~25 phút.

Sau khi Workflow trả về, ở MỌI verdict: nối `runLog` vào `run-log.jsonl`
TRƯỚC, rồi mới ghi `evidence-report.md` và `review-findings.md`; sau đó chạy
`wf-usage.mjs` và `thuoc-vat.mjs --write`.

## Máy mới cần gì

- `bun`, Postgres, và một `.env` ở gốc kho. Mac mini đã có sẵn; máy mới thì
  chưa — xem `docs/setup.md`.
- `bun run db:test --reset` trước khi tin một màu đỏ `P2021`.
- Đẩy lên `origin` cần `http.version HTTP/1.1` (HTTP/2 trả 400).
- Nhánh làm việc là `feat/dieu-phoi-30-ngay-dau`, mọc từ `8b9717d8`.

## Nợ đã biết, chưa trả

- Ba script kit chép trong kho đã cũ so với 2.17.0:
  `scripts/pre-merge-check.sh`, `scripts/recheck-evidence.cjs`,
  `lib/workspace-record.cjs`. `pre-merge-check.sh` CHÍNH LÀ cổng merge của
  CI, nên phải chép lại trước khi mở PR — không phải trước khi viết code.
- Ô `chi-quan-tri-sua-duoc-truong` đang chờ Cổng Đáng.
- Giả định #2 (đội có thật sự bỏ Google Sheet hay nhập hai lần) chưa đo.
- Giả định #3: cần quyền đọc lịch sử sửa của Google Sheet cho ngưỡng UAT
  thứ hai.
