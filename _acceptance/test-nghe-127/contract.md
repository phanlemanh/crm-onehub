---
schema_version: 1
feature: Mọi máy chủ tạm cổng 0 trong test nghe 127.0.0.1
slug: test-nghe-127
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [tooling]
status: approved
veto_state: mo
veto_opened_at: 2026-10-21T23:23:04Z
design_doc: docs/superpowers/specs/2026-10-22-test-nghe-127-design.md
---

# Acceptance Contract: test-nghe-127

## Context

Việc phụ F-127 của đợt `viec-du-an-kho-tai-lieu` (dãy V2), Điều phối M5 giao 22/10 để gỡ tận gốc lỗi
`Malformed_HTTP_Response` đã làm đỏ pre-push và CI `test (api)` ở DA12, DA13. Không có ô Cổng Đáng, không mã lộ trình.
Nguyên nhân M5 xác nhận: Colima (`limactl`) giữ một cổng ở `127.0.0.1` trong dải cổng tạm; máy chủ tạm của test mở cổng 0
không chỉ hostname nghe trên mọi địa chỉ, macOS vẫn cấp đúng cổng ấy, và fetch tới `127.0.0.1` rơi vào `limactl`.

Hạng T2: chỉ chạm tệp test (`apps/*/test`, `packages/db/test`, `scripts/*/test`), tài liệu `docs/setup.md` và hồ sơ.

Source input: lời giao của giám sát đợt 22/10 · `apps/api/node_modules/supertest/lib/test.js` (`serverAddress`) ·
`docs/setup.md` · design doc.

«Máy chủ tạm» là máy chủ HTTP một bài test tự mở để gọi tới trong lúc chạy: `Bun.serve`, `app.listen` của Nest, và máy
chủ `supertest` tự mở khi được trao một app chưa nghe.

## Criteria

- AC-1: Given mã test của kho (`apps/*/test`, `packages/*/test`, `scripts/**/test`), When đọc mọi lời gọi `Bun.serve`,
  Then lời gọi nào cũng nghe `hostname: "127.0.0.1"`, và URL bài test dùng để gọi máy chủ ấy trỏ `127.0.0.1` chứ không
  `localhost`.
- AC-2: Given mã test của kho (`apps/*/test`, `packages/*/test`, `scripts/**/test`), When một bài mở cổng bằng `listen`
  — kể cả 49 chỗ dựng app Nest ở `apps/api/test` (`createApp()` · `createNestApplication()`) — Then mỗi app Nest gọi
  `<biến>.listen(0, "127.0.0.1")` trên đúng biến vừa nhận app, trước chỗ dựng app kế tiếp và trước khi `supertest` hay
  `fetch` gọi tới; và không lời gọi `listen` nào (kể cả `listen()` không đối số) mở cổng mà thiếu hostname.
- AC-3: Given một tiến trình khác giữ `127.0.0.1:P`, When một máy chủ không chỉ hostname nghe cổng P và bài test fetch
  `127.0.0.1:P`, Then bài nhận `Malformed_HTTP_Response`; còn máy chủ chỉ hostname `127.0.0.1` thì bị từ chối cổng P,
  nên với cổng 0 hệ điều hành không cấp cho nó cổng đang bị giữ.
- AC-4: Given vòng xong, When so mọi tệp test đã đổi với `origin/onehub`, Then mỗi dòng đổi chỉ thuộc một trong sáu dạng:
  (1) thêm `hostname: "127.0.0.1"` cho `Bun.serve` (dòng riêng hay giữa dòng); (2) thêm hostname cho một `listen` đã
  có; (3) `http://localhost:${…}` thành `http://127.0.0.1:${…}` ở dòng không phải khẳng định; (4) thay `<x>.init()`
  bằng `<x>.listen(0, "127.0.0.1")` hoặc thêm dòng ấy ngay sau chỗ dựng app; (5) `await app.listen(0, "127.0.0.1")`
  nằm trong bài thành `app.getHttpServer()` khi app đã nghe từ lúc dựng; (6) bỏ dòng `await <x>.listen(0)` đã thành
  thừa. Không `expect`, lời ném hay dữ liệu nào đổi; và mọi tệp đã đổi chạy xanh.
- AC-5: Given vòng xong, When người đọc `docs/setup.md`, Then tệp nói máy chủ tạm trong test phải nghe `127.0.0.1` và vì
  sao (Colima giữ cổng tạm ở `127.0.0.1`, lỗi `Malformed_HTTP_Response`). (judgment)

## Coverage

Bỏ quét bằng skill (sổ quyết định, dòng «bỏ coverage-scan»); trục lấy thẳng từ mã, grep 22/10:

- Trục A, đường mở máy chủ tạm: `Bun.serve` (AC-1) · `app.listen` của Nest (AC-2) · `supertest` tự mở (AC-2, qua app đã
  nghe) · `createServer().listen` của Node ở mọi thư mục test (AC-2, máy quét) [thước CE: `git grep "Bun.serve(\|.listen(\|createServer("`
  trên `apps/ packages/ scripts/`].
- Trục B, nơi chứa test: `apps/api/test` · `apps/agent/test` · `apps/agent-okr/test` · `packages/db/test` ·
  `scripts/ban-chup-lo-trinh/test` · `scripts/tin-hieu/test` [thước CE: cùng lệnh grep].
- Trục C, cách gọi tới máy chủ: URL `127.0.0.1` · URL `localhost` · `server.url` của Bun · `app.getUrl()` (AC-1, AC-2).

## Out of scope

- Răng đo dưới `_acceptance/*/rang/` của các hồ sơ đã ký (vài chỗ `Bun.serve` không hostname): thước đã ký, máy không
  tự sửa.
- Luật lint vĩnh viễn chặn máy chủ tạm thiếu hostname trong test: việc riêng sau vòng.
- Đổi cấu hình Colima, dải cổng tạm của máy hay mã sản phẩm (`apps/*/src`).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Tái tạo cơ chế không cần Colima: một socket giữ `127.0.0.1:P` trả chữ không phải HTTP (`rang/co-che.ts`).
