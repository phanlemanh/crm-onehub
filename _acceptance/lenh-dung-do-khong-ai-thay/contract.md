---
schema_version: 1
feature: Lệnh dựng của kho đang đỏ vì 19 màn đọc dữ liệu lượt truy cập ngoài Suspense — vá 19 màn, và đưa lệnh dựng vào bộ lệnh chứng để lớp lỗi này không còn vô hình với bốn cổng
slug: lenh-dung-do-khong-ai-thay
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: [app, ci]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-07T03:16:26Z
design_doc: docs/superpowers/specs/2026-09-07-lenh-dung-do-khong-ai-thay-design.md
---

# Acceptance Contract: lenh-dung-do-khong-ai-thay

## Bối cảnh

`bun run build` đỏ và đã đỏ suốt bốn vòng Việt hoá đã ký, vì `cacheComponents:
true` đòi mỗi màn dựng nổi một vỏ tĩnh, còn `getLocale()` đọc `cookies()` +
`headers()` ở vỏ tĩnh của **root layout**, thứ chặn mọi route kể cả
`/_not-found`. Bốn lệnh chứng của kho không có `build`, nên không cổng nào thấy.

Ba số đo xác định đây là lỗi của bản rẽ: `apps/app/lib/locale/server.ts` không
có trên `release`; không màn nào của hãng gọi `getLocale`; hãng đã bật
`cacheComponents` từ trước.

## Mốc ghim

SHA cố định của cây TRƯỚC vòng này, dùng cho AC-4 và AC-5:

```
3c97e759a6c87bc8b6f0621d3854cb486728b442
```

Bốn con số neo, đếm **tại SHA ấy**, dùng làm mốc độc lập cho AC-2, AC-3 và AC-4 —
không phép đo nào được lấy dân số bằng chính kết quả của mình:

| Neo | Số |
| --- | --- |
| file dưới `apps/app/app/**` đọc dữ liệu lượt truy cập (`getLocale` · `cookies` · `headers` · `draftMode`) | 26 |
| trong đó chặn được vỏ tĩnh của **mọi** route — tập phải sửa | **1** (`apps/app/app/layout.tsx`) |
| màn đọc dữ liệu lượt truy cập nhưng **nằm trong ranh `<Suspense>` của layout** | 15 |
| file đọc dữ liệu lượt truy cập trong `generateMetadata` — **không** phải lỗ | 22 |

Bốn số này thay bộ ba đầu tiên (25 · 19 · 22), vốn đếm bằng một luật từ vựng sai.
Bốn điều đã đo lại, không suy:

- Luật phải là **đọc dữ liệu lượt truy cập**, không phải «gọi `getLocale`»: root
  layout đọc thẳng `cookies()` + `headers()`, nên luật hẹp bỏ sót đúng nguyên
  nhân chính.
- Root layout chặn **mọi** route, kể cả `/_not-found` — đây là gốc lớn nhất, và
  nó không nằm trong 25 màn.
- `generateMetadata` đọc dữ liệu lượt truy cập ở 22 file mà lượt dựng **vẫn
  xanh** — Next cho metadata động. Đã chứng bằng lượt dựng xanh với cả 22 file
  còn nguyên.
- **15 màn KHÔNG cần sửa.** Cấy lại đúng lỗi cũ vào một màn → lượt dựng **vẫn
  xanh**, vì ranh `<Suspense>` của layout đã bọc mọi màn. Cấy vào layout → **đỏ**.
  Nên bản vá là **một file**. Vá thêm 15 màn còn làm UX xấu đi — tiêu đề màn bị
  đẩy vào ô chờ — và cộng thêm 15 file phân kỳ với bản hãng mà không mua được gì.

## Acceptance criteria

**AC-1 — Lệnh dựng xanh.**
Given kho ở HEAD của vòng này,
When chạy `bun run build` từ gốc kho,
Then mã thoát 0.

**AC-2 — Không chỗ nào còn đọc dữ liệu lượt truy cập ở vỏ tĩnh.**
Given danh sách file của `apps/app/app/**` sinh **từ đĩa**, không gõ tay — gồm cả
layout, không riêng màn,
When đi từ hàm xuất mặc định của từng màn, bám tham chiếu JSX **một chặng** sang
component con,
Then **mọi đường** từ hàm xuất mặc định tới một lời gọi đọc dữ liệu lượt truy cập
— `getLocale` · `cookies` · `headers` · `draftMode` — đều phải đi qua một ranh
`<Suspense>`. Luật phải theo **hành vi đọc**, không theo tên `getLocale`: root
layout đọc thẳng `cookies()` và đó là nguyên nhân lớn nhất. Đo khả năng ĐI TỚI, không đo chỗ đứng từ vựng: chính
cách sửa của vòng này đưa lời gọi sang một hàm anh em ngoài thân hàm xuất mặc
định, nên luật «nằm trong thân» sẽ xanh oan.
Số file chân soi phải bằng neo **26**; lệch lên hay xuống đều là mã 2.
Lời gọi trong `generateMetadata` được đếm và in ra nhưng **không** tính là lỗ —
đã đo là Next cho phép.
**Hai** chiều đỏ, cả hai đã chạy thật: (1) cấy một lời gọi vào layout ngoài ranh
Suspense → mã 1, nêu `layout.tsx:dòng`; (2) gỡ ranh `<Suspense>` của layout → mã
1, và 15 màn lập tức hoá lỗ. Chiều thứ hai là thứ chứng luật xuyên file có răng.

**AC-3 — Không màn nào đổi một ký tự.**
Given SHA ghim,
When so cây làm việc với SHA ấy trên `apps/app/**`,
Then đúng **một** file đổi, và đó là `apps/app/app/layout.tsx`. Không màn nào,
không kho chuỗi nào, không khoá nào đổi — nên chữ trên màn không thể đổi.
Đây thay phép so 15 màn của bản trước: bản vá nay là một file, nên phép đo mạnh
hơn và rẻ hơn là đếm chính cái diff.
Chiều đỏ: sửa một ký tự ở một màn bất kỳ → mã 1, nêu tên file.

**AC-4 — `generateMetadata` không bị đụng.**
Given các màn có `generateMetadata`,
When so với mốc SHA ghim trước vòng,
Then thân `generateMetadata` không đổi một ký tự, và tiêu đề tab vẫn ra đúng
chuỗi của kho chuỗi.

**AC-5 — Lệnh dựng nằm trong bộ lệnh chứng, ở cả ba nơi.**
Given `_acceptance/config.yaml`, `.githooks/pre-push`,
`.github/workflows/acceptance.yml`,
When soi cả ba,
Then mỗi nơi đều chạy `build` — và với hai nơi có thể chạy được thì đo **hành vi**
chứ không đọc bản khai: chạy `pre-push` trên bản sao đã cấy lại lỗi cũ phải trả mã
khác 0; bước trong `acceptance.yml` không được mang `continue-on-error` và không
được nằm dưới một điều kiện không bao giờ đúng. Config có ổ cắm ép-chạy-lại và
`feature_loop.suite_keys` gọi tên nó. `.github/workflows/ci.yml` của hãng **không
đổi một ký tự**.
Vì sao đo hành vi: chính câu mở đầu của vòng này là «một lệnh không ai chạy thì
không phải bằng chứng» — một bản khai không ai chạy cũng vậy.

**AC-6 — Ổ cắm mới thật sự ép chạy lại.**
Given task `build` còn đệm trong turbo,
When chạy ổ cắm hai lượt liên tiếp không đổi gì,
Then cả hai lượt đều thật sự dựng, không lượt nào trả xanh từ đệm. Chiều đỏ: bỏ
cờ ép trong bản sao thì lượt hai ăn đệm và chân trả mã 1.

**AC-7 — Lệnh chứng mới bắt được đúng lớp lỗi này.**
Given bản sao kho ở trạng thái đã vá, và **đối chứng dương**: bản sao ấy dựng
xanh TRƯỚC khi cấy — không xanh thì mã 2, vì một bản sao vốn đã hỏng không chứng
được gì,
When cấy đúng hình dạng lỗi cũ vào **root layout** — nơi duy nhất đã đo là chặn
được lượt dựng: thêm một lời gọi `cookies()` vào thân hàm xuất mặc định, cú pháp
vẫn hợp lệ,
Then `bun run build` trả mã khác 0 **và** khớp chẩn đoán vỏ tĩnh của Next (`uncached or runtime data during prerendering`) — không
nhận một lỗi biên dịch nào khác thay thế. Đây là cặp hai chiều của AC-1: một lệnh
chứng chưa bao giờ đỏ thì không phân biệt được «kho lành» với «lệnh chưa chạy».

**AC-9 — Thuộc tính `lang` của trang vẫn theo tiếng của lượt truy cập.**
Given vỏ tĩnh nay không đọc được dữ liệu lượt truy cập nên `<html lang>` in ra là
mặc định,
When trang tải xong phần theo tiếng,
Then `document.documentElement.lang` bằng đúng tiếng đã giải cho lượt ấy. Vì sao
có tiêu chí này: `lang` sai làm trình duyệt tự dịch một màn vốn đã tiếng Việt, và
làm trình đọc màn đọc sai giọng — `CLAUDE.md` đã đòi đánh dấu để trình duyệt
không tự dịch.
Chiều đỏ: gỡ đoạn đặt `lang` thì phép đo phải đỏ.

**AC-8 — Bốn lệnh chứng cũ còn xanh.**
Given HEAD của vòng này,
When chạy `bun run test`, `check-types`, `lint`, `lint:slop`,
Then cả bốn mã 0, và `apps/app` về đúng ba cảnh báo lint có sẵn.

## Coverage

Bỏ quét không gian AC — xem entry `descope` mở đầu `"bỏ coverage-scan"` trong
`decisions.jsonl`. Bài toán một chiều: nguyên nhân đã đo xong trước khi mở vòng
(một hàm, một lớp lỗi, danh sách màn sinh từ đĩa), và bộ AC đi thẳng từ hai việc
đã khai — vá màn, và đưa lệnh dựng vào bộ chứng.

Thước CE của bộ AC này là **lịch sử lỗi thật của kho**: bốn vòng Việt hoá đã ký
mà không vòng nào thấy lệnh dựng đỏ. AC-5 và AC-7 tồn tại chính vì thước ấy —
sửa 19 màn mà không đóng lỗ thì vòng sau lọt lại.

## Out of scope

- **Không đổi `getLocale()`** — hàm đúng, chỗ gọi sai.
- **Không dựng lối chọn tiếng qua middleware hay đoạn đường dẫn** — thiết kế
  khác, đắt hơn nhiều, không cần để dựng được.
- **Không đụng `generateMetadata`** — đã đo bằng lượt dựng xanh với cả 22 file còn
  nguyên: Next cho metadata đọc dữ liệu lượt truy cập.
- **Không thêm `build` vào `.github/workflows/ci.yml`** — `CLAUDE.md` cấm chạm CI
  của hãng.
- **Không triển khai** — vòng này chỉ làm kho dựng được; việc đưa lên Vercel là
  việc riêng sau.

## Notes
