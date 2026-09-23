---
schema_version: 1
feature: Mọi bài kiểm DOM (*.dom.tsx) của apps/app và packages/ui chạy trong bun run test, mỗi tệp một tiến trình
slug: moi-bai-kiem-dom-deu-chay
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [tooling]
status: draft
design_doc: docs/superpowers/specs/2026-09-23-moi-bai-kiem-dom-deu-chay-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-23T09:45:00Z
---

# Acceptance Contract: moi-bai-kiem-dom-deu-chay

## Context

`bun run test` chỉ chạy các bài kiểm DOM được liệt kê tay; ba tệp (40 bài) của hai
tính năng đã giao không bao giờ chạy trước khi đẩy code. Vòng này cho script nhặt
mọi `test/*.dom.tsx` và chạy từng tệp trong tiến trình riêng.

Source input: Known limits Ngoài-1 của `_acceptance/keo-tha-thoa-thuan/contract.md`
+ yêu cầu của chủ kho 2026-09-23 («làm việc đưa bài kiểm bảng cột vào bun run test»).

## Criteria

- AC-1: Given thư mục `apps/app/test` có N tệp `*.dom.tsx`, When chạy `bun run test:dom` trong `apps/app`, Then đúng N tệp được chạy, mỗi tệp đúng một lần, không thiếu tệp nào — kể cả `keo-tha-thoa-thuan.dom.tsx` và `may-nhac.dom.tsx`.
- AC-2: Given `packages/ui/test` có tệp `*.dom.tsx`, When chạy `bun run test` trong `packages/ui`, Then mọi tệp `*.dom.tsx` đó được chạy, cùng với các tệp `*.spec` như trước.
- AC-3: Given một tệp `*.dom.tsx` mới được thêm vào `test/` của một trong hai gói, When chạy lệnh kiểm của gói đó, Then tệp mới được chạy mà không cần sửa `package.json`.
- AC-4: Given một bài trong một tệp `*.dom.tsx` đỏ, When chạy lệnh kiểm của gói, Then lệnh thoát với mã khác 0 và đầu ra gọi tên tệp đỏ — nên `bun run test`, pre-push và CI cùng đỏ.
- AC-5: Given nhiều tệp `*.dom.tsx`, When chạy lệnh kiểm DOM, Then mỗi tệp chạy trong một tiến trình `bun test` riêng (mỗi lượt báo «across 1 file»), và cả 16 tệp hiện có của app đều xanh.
- AC-6: Given bài kiểm DOM của app, When chạy qua script mới, Then vẫn chạy với `TZ=Asia/Ho_Chi_Minh` như script cũ.

## Coverage

- Bỏ quét coverage — xem sổ quyết định (entry «bỏ coverage-scan»). Không gian nhỏ và đã đếm hết: 2 gói × {tệp đang có, tệp mới, tệp đỏ, cách ly tiến trình, múi giờ} = AC-1 … AC-6.

## Out of scope

- Đổi tên `*.dom.tsx` thành `*.spec.tsx`.
- Chạy song song các tiến trình để nhanh hơn.
- Sửa số đếm đầu cột khi đang lưu (Known limits Ngoài-2 của keo-tha-thoa-thuan) — việc riêng.
- Các gói khác ngoài `apps/app` và `packages/ui` (hiện không gói nào khác có `*.dom.tsx`).

## Notes

- Đo trước khi làm (23/09): chạy chung 16 tệp của app trong một tiến trình → 8 bài đỏ do `mock.module` rò; chạy riêng → 16/16 xanh, 164 bài, 17 giây.
