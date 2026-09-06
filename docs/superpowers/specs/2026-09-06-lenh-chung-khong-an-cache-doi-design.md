# Lệnh chứng không được ăn cache dối

> Hồ sơ nghiệm thu: `_acceptance/lenh-chung-khong-an-cache-doi/`

## Vì sao có vòng này

Ngày 06/09, trong lúc chạy lượt chấm cho một hồ sơ khác, bốn lệnh chứng đều trả mã 0
— và cả bốn đều là **FULL TURBO**, tức bản phát lại chứ không phải một lượt chạy. Chạy
cưỡng bức thì lộ ra một màu đỏ mà bản phát lại đang che.

Một lượt xanh phát lại **không sai** khi khoá cache trung thực: cùng đầu vào thì cùng
kết quả. Vấn đề là ở kho này khoá cache **không trung thực** ở hai chỗ, cả hai đã đo:

### Lỗ một — ô cắm test của cổng là suite duy nhất còn ăn cache

`check_types_khong_cache` và `lint_khong_cache` đã có bản cưỡng bức và đã cắm vào
`suite_keys`. Riêng test vẫn dùng `executors.test.api` = `bun run db:test && bun run
test`, mà `bun run test` giải ra `turbo run test --concurrency=1` — không `--force`.

Trớ trêu: test là suite phụ thuộc trạng thái ngoài **nhiều nhất**. Cơ sở dữ liệu test
không nằm trong khoá cache của turbo, nên một lượt xanh phát lại không nói gì về trạng
thái cơ sở dữ liệu lúc này.

### Lỗ hai — bộ vẽ của `packages/ui` đọc file ngoài gói mà không khai

Đo trực tiếp ngày 06/09:

| Đổi gì | Kết quả `turbo run test --filter=@crm/ui` |
| --- | --- |
| `_acceptance/…/rang/da-tim-thay.json` — bộ vẽ ĐỌC lúc chạy | **FULL TURBO, 2 cached** |
| `packages/ui/src/lib/messages.ts` — trong gói | bể cache đúng, chạy lại 2.4s |

Sửa đúng cái bảng mà phép đo đọc thì thước vẫn báo xanh cũ. Chỗ này do chính vòng
`chan-lai-component-ra-man` tạo ra hôm qua: `lai-ra-man.spec.tsx` đọc
`_acceptance/**` và nhập component từ `apps/app/**`, cả hai đều ngoài gói.

## Đo hành vi, đừng đo bản khai

Cám dỗ là viết một chân soi `turbo.json` xem danh sách `inputs` có "đúng" không. Đó là
đo **bản khai**, và bản khai trôi khỏi sự thật ngay khi bộ vẽ đọc thêm một file.

Vòng này đo **hành vi**, hai chiều, trên cùng một vật:

> Đổi một file mà bộ vẽ đọc ngoài gói → cache **phải bể**.
> Không đổi gì → cache **phải trúng**.

Chiều thứ hai là đối chứng dương, và nó cần thiết: một chân chỉ khẳng định "cache bể"
không phân biệt được «đã khai đúng» với «cache tắt hẳn».

## Việc của vòng

1. **Ô cắm test cưỡng bức**: thêm `executors.test.api_khong_cache` =
   `bun run db:test && bunx turbo run test --force --concurrency=1`, trỏ `suite_keys`
   sang nó. Giữ `--concurrency=1` vì nhiều gói dùng chung một cơ sở dữ liệu test —
   chạy song song thì đụng ràng buộc duy nhất.
2. **Khai input ngoài gói** cho `@crm/ui#test` bằng `packages/ui/turbo.json` theo đúng
   nếp `extends: ["//"]` mà `apps/app` đã dùng, với `$TURBO_ROOT$` trỏ ra gốc kho.
3. **Hai chân đo** cho hai lỗ, mỗi chân một cặp hai chiều đã chạy thật.

## Cái giá, nói thẳng

Ép `--force` cho test nghĩa là **mỗi lượt chấm của cổng chạy lại toàn bộ bộ test**,
không bao giờ ăn cache. Đo hôm nay: một lượt cưỡng bức nối tiếp mất khoảng **19 giây**
cho 11 gói. Đó là giá phải trả để màu xanh của cổng có nghĩa.

Khai input ngoài gói thì mỗi lần sửa file trong `_acceptance/**` sẽ bể cache test của
`packages/ui` — đúng, nhưng tốn thêm vài giây cho vòng làm việc hằng ngày.

## Sẽ KHÔNG làm

- **Không ép `--force` cho lệnh hằng ngày của người viết code.** `bun run test` giữ
  nguyên cache; chỉ ô cắm CỦA CỔNG mới cưỡng bức. Người viết code cần vòng lặp nhanh;
  cổng cần sự thật.
- **Không tắt cache của turbo.** Cache đúng là một tài sản; vòng này chỉ bắt nó khai
  thật.
- **Không dời bộ vẽ ra khỏi `packages/ui`.** Nó cần bộ nạp DOM giả và các component
  của chính gói ấy; dời đi là một vòng riêng.
