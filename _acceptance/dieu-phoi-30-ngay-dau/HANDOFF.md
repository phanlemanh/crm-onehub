# Bàn giao — dieu-phoi-30-ngay-dau

Viết lúc 2026-09-21, trên Mac mini, tại `25f47ed4`.
Đọc file này trước, rồi mở `contract.md` và `evidence-report.md`.

## Đang ở đâu

| Mốc | Trạng thái |
| --- | --- |
| Cổng Đáng | ký 2026-09-19 (`opportunity.md`) |
| Cổng Phạm vi | ký 2026-09-20 bởi Manh Phan, 14 tiêu chí, 15 phép đo, hạng T3 |
| Thi công (S3) | xong |
| Năm lệnh chứng minh | xanh cả năm ở `25f47ed4` |
| S4 vòng 1, lượt chấm A | **BLOCKED** — E11 (khoá thư mục) + E15 (agent chết). Hồ sơ đã ghi |
| S4 vòng 1, lượt B và C | **huỷ giữa chừng** — tác nhân từ chối chạy. KHÔNG ghi hồ sơ |
| Cổng Bằng chứng | chưa tới được |

`contract.md` vẫn ở `status: implemented`. **Đừng đưa sang `verified`** —
chưa lượt nào cho verdict thật sau khi sửa.

## Việc đang chặn: tác nhân con từ chối chạy

Hai lượt chấm liên tiếp hỏng cùng một kiểu, không phải lỗi sản phẩm:

- Lượt B (`wf_66f43637-7c9`): 12/19 tác nhân khai `cannotRun`
- Lượt C (`wf_b37274be-cc0`): 11/20 tác nhân khai `cannotRun`

Lý do chúng tự khai: *«User cancelled with "Dừng nó"»*, *«Người dùng yêu cầu
dừng workflow»*. Câu **«Dừng nó»** là lời chủ kho nói về **máy chủ dev PID
59628**, không phải về vòng chấm; nó nằm trong ngữ cảnh phiên và các tác nhân
con đọc thành lệnh huỷ. Đợi cho câu đó lùi xa KHÔNG chữa được — lượt C đã là
sau khi đợi.

Hai lượt đó bị dừng tay và **không dòng nào vào `run-log.jsonl`,
`evidence-report.md` hay `review-findings.md`** — ghi vào là vu cho người dùng
đã huỷ vòng chấm, điều không đúng.

Ba lối, chủ kho chọn:

| Lối | Làm gì | Đổi lại |
| --- | --- | --- |
| Phiên mới | Mở phiên Claude Code mới rồi chạy S4 ở đó | Phiên mới không có câu «Dừng nó» → gỡ hẳn nguyên nhân. Mất một nhịp bàn giao |
| Câu vô hiệu hoá | Người nhắn rõ trong phiên cũ rằng «Dừng nó» chỉ nói về máy chủ dev, vòng chấm cứ chạy | Rẻ nhất, nhưng câu mệnh lệnh cũ vẫn nằm cạnh câu mới |
| VERIFY độc lập | Dùng Phase 3 của skill `acceptance` thay bầy tác nhân của workflow | Khác bộ máy nên không thừa ngữ cảnh. Đổi cách sinh bằng chứng giữa vòng, cần một dòng sổ quyết định |

## Đã sửa trong phiên 20–21/09

Ba lỗi TRONG hợp đồng của vòng soi lượt trước, mỗi nhát có chiều đỏ chạy bằng
CHÍNH lệnh của eval:

- **AC-12 / E12 đổi nhà** — E12 hứa «dựng màn hồ sơ, bấm nút xoá» mà chỉ gọi bộ
  giảm thuần. Thêm `apps/app/test/dieu-phoi-xoa-ghi-danh.dom.tsx` dựng thật
  `HoSoKeHoach` trong jsdom; bản giả tRPC ghi lại TÊN thủ tục màn hình gọi.
- **AC-12 nút «Gỡ»** — nó gọi `upsertEnrollment` (một phép GHI) và lật `source`
  về `tay`. Thêm `onboarding.removeEnrollment` thật; chiều đỏ in ra
  «Expected onboarding.removeEnrollment / Received onboarding.upsertEnrollment».
- **AC-6 chống trùng** — hai nhát. Nhát một khoá theo mã đơn; vòng soi bắt được
  rằng như vậy lô của kế hoạch B mang mã còn treo ở kế hoạch A vẫn mất trắng.
  Nhát hai khoá theo **cặp** `planId` + `platformBrokerId`; `subject` của
  `enqueue` nay nhận nhiều cặp đường-dẫn ⇄ giá trị.

Hai commit `a559192c` và `03a09dc7` do một tác nhân của lượt chấm A tự tạo giữa
chừng (sửa chính phép đo đang bị chấm) **đã revert** — `dfd664d6`.

Trần nhát sửa thước nổ ở lượt sinh args (mã 4). Chủ kho chọn lối (1): sáu giới
hạn CÓ TÊN của bộ đo đã khai vào `## Notes` của `contract.md`, ghi là **đề
nghị, chờ ký tại Cổng Bằng chứng** — chưa ai chấp nhận chúng.

## Chạy tiếp thế nào

Bộ kit: **acceptance-gate-kit 2.17.0**. Sinh args (BẮT BUỘC sau mỗi lần cây đổi):

```
node ~/.claude/plugins/cache/acceptance-gate-kit/feature-loop/2.17.0/scripts/s4-args.mjs \
  --slug dieu-phoi-30-ngay-dau --root . --round 1 --out /tmp/s4-args.json
```

`--round 1` vì BLOCKED không tiêu một vòng. So `generated_sha` với
`git rev-parse HEAD` trước khi dispatch; lệch là sinh lại.

Workflow `feature-loop/2.17.0/workflows/acceptance-verify.js` không nhận
`scriptPath` ngoài thư mục làm việc — chép nguyên văn vào
`node_modules/.cache/ag/` (vùng gitignore) và so sha trước khi dùng.

Sau khi Workflow trả về, ở MỌI verdict: nối `runLog` vào `run-log.jsonl`
TRƯỚC, rồi mới ghi `evidence-report.md` và `review-findings.md`; sau đó chạy
`wf-usage.mjs` và `thuoc-vat.mjs --write`. Workflow trả `runLogWriteFailed:
true` thì phần ghi đó là việc của phiên.

## Môi trường

- Cổng 3000 / 3300 / 3301 rảnh, không `next dev` nào chạy, `.next/dev/lock` hết.
- Next.js 16 khoá **một tiến trình mỗi thư mục dự án**: một `next dev` đang chạy
  trong `apps/app` làm mọi `next dev` thứ hai trong cùng thư mục tự thoát mã 1,
  bất kể cổng. Đây là cái đã chặn E11 ở lượt A — không phải cổng bị chiếm.
- `bun run db:test --reset` trước khi tin một màu đỏ `P2021`.
- Đẩy lên `origin` cần `http.version HTTP/1.1`.

## Nợ đã biết, chưa trả

- Ba script kit chép trong kho đã cũ so với 2.17.0: `scripts/pre-merge-check.sh`,
  `scripts/recheck-evidence.cjs`, `lib/workspace-record.cjs`.
  `pre-merge-check.sh` CHÍNH LÀ cổng merge của CI — chép lại trước khi mở PR.
- Ô `chi-quan-tri-sua-duoc-truong` đang chờ Cổng Đáng.
- Giả định #2 (đội có thật sự bỏ Google Sheet) chưa đo.
- Giả định #3: cần quyền đọc lịch sử sửa của Google Sheet cho ngưỡng UAT thứ hai.
