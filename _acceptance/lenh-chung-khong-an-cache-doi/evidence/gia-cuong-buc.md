# Cái giá của việc ép chạy lại

Đo ngày 06/09 trên máy này, cùng một cây, sau khi cơ sở dữ liệu test đã dựng lại.

| Lượt chạy | Thời gian | Ai dùng |
| --- | --- | --- |
| `bun run test` — có cache | **1092 ms** | người viết code, hằng ngày |
| `bun run db:test && bunx turbo run test --force --concurrency=1` | **22271 ms** | ô cắm của cổng, mỗi lượt chấm |

Chênh lệch: **21179 ms** cho mỗi lượt chấm của cổng.

Lượt có cache **không chạy** bộ test — nó phát lại kết quả đã lưu. Lượt cưỡng bức chạy
thật cả 11 gói, nối tiếp, cộng bước dựng lại cơ sở dữ liệu test.

Con số này là thứ AC-8 hỏi: cái giá ấy có đáng đổi lấy một màu xanh có nghĩa không.
Người quyết, máy không chấm.
