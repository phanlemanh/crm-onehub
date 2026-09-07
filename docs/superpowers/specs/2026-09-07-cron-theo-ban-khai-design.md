# Cron phải theo bản khai, không theo một dòng ghim trong script dựng

> Hồ sơ nghiệm thu: `_acceptance/cron-theo-ban-khai/`
> Hạng **T2** — chạm `apps/api/scripts/build-func.mjs`.

## Lỗi, nói gọn

Kho có **hai nguồn sự thật** cho lịch chạy nền, và chúng nói khác nhau.

`apps/api/vercel.json` khai **năm** việc:

```
/internal/sync/mailboxes     */5 * * * *
/internal/sync/rates         0 6 * * *
/internal/telemetry/rollup   0 7 * * *
/internal/tracking/retention 0 4 * * *
/internal/archive/prune      0 5 * * *
```

`docs/environment.md` nói thẳng: *«Crons live in `apps/api/vercel.json`»*.

Nhưng `apps/api/scripts/build-func.mjs` ghi `.vercel/output/config.json` với **một
dòng ghim cứng**:

```js
crons: [{ path: "/internal/sync/google", schedule: "*/5 * * * *" }],
```

API dựng bằng Build Output API và thư mục gốc của dự án là gốc kho, nên Vercel đọc
`config.json` ấy chứ **không** đọc `apps/api/vercel.json`. Bản khai năm dòng không
có hiệu lực.

## Đã đo trên bản đang chạy

Bản triển khai production của `crm-onehub-api` đăng ký đúng **một** cron:
`/internal/sync/google`. Cả sáu đường đều **tồn tại thật** trên máy chủ — gọi
không token trả 403, tức route có và tự canh cửa. Nên đây không phải lỗi route;
đây là lỗi **đăng ký lịch**.

Bốn việc không bao giờ chạy:

| Việc | Hậu quả khi không chạy |
| --- | --- |
| `/internal/sync/rates` | tỷ giá đứng yên; mọi con số quy đổi lệch dần |
| `/internal/telemetry/rollup` | số dùng không được gom |
| `/internal/tracking/retention` | **lượt xem trang quá 90 ngày không bị xoá** |
| `/internal/archive/prune` | bản lưu trữ không được dọn |

Việc thứ ba nặng nhất: nó là nghĩa vụ giữ dữ liệu, không phải tối ưu.

Việc còn lại — đồng bộ hộp thư — vẫn chạy, vì `/internal/sync/google` là **bí danh**
của `/internal/sync/mailboxes` với cùng nhịp, đúng như `docs/environment.md` khai.

## Cách sửa

`build-func.mjs` **đọc** `apps/api/vercel.json` và ghi đúng khối `crons` của nó vào
`config.json`. Một nguồn sự thật, và là cái nguồn tài liệu đã trỏ tới.

Bí danh `/internal/sync/google` **bỏ**: bản khai đã có `/internal/sync/mailboxes`
cùng nhịp, và giữ cả hai là chạy đồng bộ hộp thư hai lần mỗi năm phút.

Vắng `vercel.json`, hoặc nó không có khối `crons` → **dừng lượt dựng**, không rơi
về danh sách rỗng. Một lịch chạy nền biến mất lặng lẽ là đúng lớp lỗi vòng này
đang đóng.

## Cái giá, nói thẳng

Nhịp `*/5 * * * *` cần gói Pro của Vercel; trên gói Hobby nó âm thầm thành hằng
ngày. Vòng này không đổi điều đó và không đo nó — chỉ làm cho thứ được khai trở
thành thứ được đăng ký.

## Sẽ KHÔNG làm

- **Không đổi một route nào** trong `apps/api/src`. Cả sáu đã tồn tại và tự canh.
- **Không đổi nhịp** của bất kỳ việc nào — nhịp là của bản khai.
- **Không đụng thư mục gốc của dự án Vercel.** Đổi nó sang `apps/api` sẽ làm
  `.vercel/output` (mà `build-func.mjs` ghi ở gốc kho) nằm sai chỗ.
- **Không thêm cron mới.**

## Gửi ngược lên hãng

Đây là mã của hãng nói ngược tài liệu của chính hãng. Vá ở bản rẽ để lịch chạy
đúng, rồi gửi ngược lên hãng — `CLAUDE.md`: sửa được ở hãng thì gửi lên hãng.
