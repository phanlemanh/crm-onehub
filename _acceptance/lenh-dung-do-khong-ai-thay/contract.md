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
`headers()` ở thân **19 màn**. Bốn lệnh chứng của kho không có `build`, nên
không cổng nào thấy.

Ba số đo xác định đây là lỗi của bản rẽ: `apps/app/lib/locale/server.ts` không
có trên `release`; không màn nào của hãng gọi `getLocale`; hãng đã bật
`cacheComponents` từ trước.

## Mốc ghim

SHA cố định của cây TRƯỚC vòng này, dùng cho AC-4 và AC-5:

```
3c97e759a6c87bc8b6f0621d3854cb486728b442
```

Ba con số neo, đếm **tại SHA ấy**, dùng làm mốc độc lập cho AC-2, AC-3 và AC-4 —
không phép đo nào được lấy dân số bằng chính kết quả của mình:

| Neo | Số |
| --- | --- |
| file dưới `apps/app/app/**` gọi `getLocale` | 25 |
| trong đó gọi ở **thân** hàm xuất mặc định — tập phải sửa | 19 |
| file có `generateMetadata` | 22 |

## Acceptance criteria

**AC-1 — Lệnh dựng xanh.**
Given kho ở HEAD của vòng này,
When chạy `bun run build` từ gốc kho,
Then mã thoát 0.

**AC-2 — Không màn nào còn đọc dữ liệu lượt truy cập ở vỏ tĩnh.**
Given danh sách màn của `apps/app` sinh **từ đĩa**, không gõ tay,
When đi từ hàm xuất mặc định của từng màn, bám tham chiếu JSX **một chặng** sang
component con,
Then **mọi đường** từ hàm xuất mặc định tới một lời gọi `getLocale()` đều phải đi
qua một ranh `<Suspense>`. Đo khả năng ĐI TỚI, không đo chỗ đứng từ vựng: chính
cách sửa của vòng này đưa lời gọi sang một hàm anh em ngoài thân hàm xuất mặc
định, nên luật «nằm trong thân» sẽ xanh oan.
Số màn chân soi phải bằng neo **25**; lệch lên hay xuống đều là mã 2.
Chiều đỏ: cấy lại một lời gọi ngoài ranh Suspense trong bản sao thì chân trả mã 1
và nêu `file:dòng`.

**AC-3 — Chữ trên màn không đổi.**
Given tập màn phải sửa, lấy **tại SHA ghim** (neo **19**), chứ không lấy bằng
«màn nào vòng này đã sửa» — lấy thế là tự so với chính mình,
When với mỗi màn, so từng khoá kho chuỗi màn ấy dùng ở SHA ghim với khoá màn ấy
dùng ở HEAD,
Then trùng từng ký tự, cho cả `vi` lẫn `en`. Điều kiện phụ: `vi` khác `en`.
Số ca chạy phải bằng **19**; lệch, hoặc tập rỗng, là mã 2.

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
When cấy đúng hình dạng lỗi cũ vào một màn **ghim tên**: đưa lời gọi `getLocale()`
lên thân hàm xuất mặc định, cú pháp vẫn hợp lệ,
Then `bun run build` trả mã khác 0, thông điệp nêu tên màn ấy **và** khớp chẩn
đoán vỏ tĩnh của Next (`uncached or runtime data during prerendering`) — không
nhận một lỗi biên dịch nào khác thay thế. Đây là cặp hai chiều của AC-1: một lệnh
chứng chưa bao giờ đỏ thì không phân biệt được «kho lành» với «lệnh chưa chạy».

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
- **Không đụng `generateMetadata`** — đã đo là không phải nguyên nhân.
- **Không thêm `build` vào `.github/workflows/ci.yml`** — `CLAUDE.md` cấm chạm CI
  của hãng.
- **Không triển khai** — vòng này chỉ làm kho dựng được; việc đưa lên Vercel là
  việc riêng sau.

## Notes
