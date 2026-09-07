---
schema_version: 1
feature: Lịch chạy nền của API phải theo bản khai apps/api/vercel.json, không theo một dòng ghim cứng trong script dựng — bốn trong năm việc nền hiện không bao giờ chạy
slug: cron-theo-ban-khai
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: [api, ci]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-07T08:23:09Z
design_doc: docs/superpowers/specs/2026-09-07-cron-theo-ban-khai-design.md
---

# Acceptance Contract: cron-theo-ban-khai

## Bối cảnh

`apps/api/vercel.json` khai năm việc nền và `docs/environment.md` nói «Crons live
in apps/api/vercel.json». Nhưng `apps/api/scripts/build-func.mjs` ghi
`.vercel/output/config.json` với một dòng cron ghim cứng, và Vercel đọc file ấy
chứ không đọc bản khai. Đo trên bản production: đúng **một** cron được đăng ký.

Cả sáu đường đều tồn tại thật và tự canh cửa (gọi không token trả 403), nên đây là
lỗi đăng ký lịch, không phải lỗi route.

## Mốc ghim

SHA cố định của cây TRƯỚC vòng này:

```
e55a9e88e7423cb362b965dac5ad1260c499c2a3
```

Neo, đếm tại SHA ấy:

| Neo | Số |
| --- | --- |
| cron khai trong `apps/api/vercel.json` | 5 |
| cron mà `build-func.mjs` ghi vào `config.json` | 1 |
| đường `/internal/*` API khai trên đĩa | 7 |
| trong đó thuộc lịch chạy nền (năm của bản khai + bí danh) | 6 |
| ngoài lịch: `/internal/listings/ingest` | 1 |

Bảy đường ấy: `/internal/archive/prune` · `/internal/listings/ingest` ·
`/internal/sync/google` · `/internal/sync/mailboxes` · `/internal/sync/rates` ·
`/internal/telemetry/rollup` · `/internal/tracking/retention`.

Con số **7** thay con số 6 tôi ghi lúc mở vòng: 6 là số đường tôi đã thử bằng
`curl`, không phải số đường API khai. `/internal/listings/ingest` không nằm trong
lịch nên tôi không thử tới nó.

## Acceptance criteria

**AC-1 — Lượt dựng ghi đúng bản khai.**
Given `apps/api/vercel.json`,
When chạy `build-func.mjs` rồi đọc `.vercel/output/config.json`,
Then khối `crons` **bằng đúng** khối `crons` của bản khai — cùng số dòng, cùng
`path`, cùng `schedule`, so từng phần tử chứ không so số đếm.
Sàn dân số: bản khai có 0 cron → **mã 2**; hai bên cùng rỗng thì «bằng nhau» không
nói lên điều gì.
Chiều đỏ: thêm một dòng vào bản khai trong bản sao thì `config.json` phải theo; gỡ
một dòng cũng vậy. Lệch một dòng là mã 1, nêu dòng nào.

**AC-2 — Không còn danh sách cron ghim cứng trong script dựng.**
Given `build-func.mjs`,
When soi bằng AST,
Then không có mảng cron nào viết sẵn trong mã; giá trị duy nhất đi vào `config.json`
phải là thứ đọc từ `vercel.json`.
Chiều đỏ: cấy lại một mảng cron ghim cứng trong bản sao → mã 1, nêu `file:dòng`.

**AC-3 — Vắng bản khai thì DỪNG, không rơi về rỗng.**
Given bản sao ở **ba hình dạng hỏng cùng lớp**: không có `apps/api/vercel.json` ·
có file nhưng không có khối `crons` · **có khối `crons` nhưng RỖNG**,
When chạy `build-func.mjs`,
Then lượt dựng trả mã khác 0 và thông điệp nêu tên file. **Không** được ghi
`config.json` với `crons` rỗng.
Đối chứng dương: bản sao có bản khai đủ thì mã 0.
**Mỗi hình dạng chạy trên một bản sao MỚI**, và chân phải in ra đường tuyệt đối nó
vừa đọc — đường ấy nằm ngoài bản sao là mã 2. Không dùng chung một bản sao cho ba
bước: một `config.json` sót lại từ bước trước làm bước sau xanh oan.
Vì sao: một lịch chạy nền biến mất lặng lẽ là đúng lớp lỗi vòng này đóng.

**AC-4 — Mỗi đường cron trỏ tới một route có thật.**
Given năm `path` trong bản khai,
When quét `apps/api/src` bằng AST lấy mọi route `/internal/*` mà API khai,
Then **mỗi** `path` của bản khai khớp đúng một route đã quét được.
Hai chốt chống bộ-quét-bắt-thiếu, thay cho chốt «lớn hơn 0» vốn quá lỏng:
tập quét được **rỗng** → mã 2; và bộ quét **phải** tìm thấy bí danh
`/internal/sync/google` → không thấy là mã 2, vì chính bí danh ấy là thứ đang chạy
trên bản thật, nên một bộ quét bỏ sót nó là bộ quét không tin được.
Chân in trọn danh sách quét được để người đối chiếu.

**AC-5 — Bí danh cũ không còn được đăng ký, và cái thay nó làm ĐÚNG việc ấy.**
Given `config.json` sau lượt dựng,
When soi khối `crons`,
Then **không** có `/internal/sync/google`, và `/internal/sync/mailboxes` có mặt với
đúng nhịp `*/5 * * * *`.
**Và đo QUAN HỆ, không đo chuỗi có mặt:** hai đường ấy phải trỏ về **cùng một
phương thức xử lý** trong bảng route của API. Nếu chúng là hai handler khác nhau
thì việc nền duy nhất đang chạy sẽ bị dừng lặng lẽ khi gỡ bí danh — mã 1, nêu tên
cả hai handler.
Vì sao: neo «403» chỉ chứng đường TỒN TẠI, không chứng nó LÀM việc ấy. Lời hứa «bỏ
bí danh vẫn an toàn» phải đứng trên đầu ra của mã, không trên một câu trong tài
liệu.

**AC-6 — Phần còn lại của lượt dựng không đổi.**
Given `config.json` tại SHA ghim và sau vòng này,
When so hai bản,
Then chỉ khối `crons` khác; `version` và `routes` không đổi một ký tự. Và hàm dựng
ra vẫn có mặt ở `.vercel/output/functions/api/index.func`.

**AC-8 — Bản triển khai THẬT đăng ký đúng năm việc.**
Given bản triển khai production của `crm-onehub-api` **sau khi vòng này lên**,
When đọc khối `crons` của chính bản triển khai ấy qua API của nền tảng — đúng dụng
cụ đã lập neo «một cron» trước vòng,
Then có **đúng năm** mục, và từng cặp `path` + `schedule` khớp `apps/api/vercel.json`.
Không đọc được bản triển khai → mã 2, không phải mã 0.
Vì sao tiêu chí này bắt buộc: mọi tiêu chí khác dừng ở một file trên đĩa. Một lượt
dựng ghi đúng năm dòng vào `.vercel/output` mà nền tảng vẫn đăng ký lịch cũ là ca
hỏng mà cả bảy tiêu chí kia đều xanh — đúng lớp lỗi vòng này tuyên đóng.

**AC-7 — Năm lệnh chứng còn xanh.**
Given HEAD của vòng này,
When chạy `bun run test`, `check-types`, `lint`, `lint:slop`, `build`,
Then cả năm mã 0, và `apps/app` về đúng ba cảnh báo lint có sẵn.

## Coverage

Bỏ quét không gian AC — xem entry `descope` mở đầu `"bỏ coverage-scan"` trong
`decisions.jsonl`. Bài toán một chiều: một file ghi sai một khối, nguyên nhân và
hậu quả đã đo xong trên bản production trước khi mở vòng.

Thước CE: **bản đang chạy ngoài internet**. Không phải suy luận — đã đọc
`crons` của deployment thật và đếm được đúng một dòng, trong khi bản khai có năm.

## Out of scope

- **Không đổi route nào** trong `apps/api/src` — cả sáu đã tồn tại và tự canh.
- **Không đổi nhịp** của bất kỳ việc nào; nhịp thuộc bản khai.
- **Không đụng thư mục gốc của dự án Vercel** — đổi sang `apps/api` làm
  `.vercel/output` nằm sai chỗ.
- **Không thêm cron mới.**
- **Không đo chuyện gói Hobby hạ nhịp phút thành ngày** — đó là giới hạn của nền
  tảng, không phải của mã.

## Notes

### Known limits

- **Bản xem trước của API dùng chung cơ sở dữ liệu production.** Vòng này cắm
  `DATABASE_URL` cho môi trường preview để phép đo AC-8 chạy được trước khi merge;
  trước đó không bản xem trước nào dựng nổi. `docs/setup.md` của hãng đã khai đây
  là tình trạng hiện tại, nhưng rủi ro là thật: một bản xem trước mang migration
  mới sẽ áp thẳng lên dữ liệu thật. Tách cơ sở dữ liệu cho preview là một hồ sơ
  riêng. Ghi 07/09 tại Cổng 2, chủ kho phê.
- **Nhịp `*/5 * * * *` cần gói Pro; trên gói Hobby nó âm thầm thành hằng ngày.**
  Vòng này làm cho năm việc được đăng ký, nhưng không đo chúng chạy đúng nhịp trên
  gói hiện tại. Đo điều đó cần theo dõi lượt chạy thật qua nhiều ngày.
  Ghi 07/09 tại Cổng 2, chủ kho phê.
- **`/internal/listings/ingest` không nằm trong lịch nào.** Đường này tồn tại và tự
  canh cửa, nhưng không cron nào gọi nó — có thể đúng, vì nó là đầu vào cho bộ thu
  thập ở `tools/listing-crawl` chứ không phải việc theo lịch. Ghi lại để lần sau ai
  đọc bản khai không tưởng là sót. Ghi 07/09 tại Cổng 2, chủ kho phê.
