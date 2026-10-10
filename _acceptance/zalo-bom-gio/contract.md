---
schema_version: 1
feature: «Bài kiểm Zalo webhook không còn đỏ theo giờ thật»
slug: zalo-bom-gio
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: draft
approved_by:
approved_at:
---

# Acceptance Contract: zalo-bom-gio

## Context

Hai bài trong `apps/agent/test/zalo-qua-webhook.integration.spec.ts` gieo mã liên kết bằng đồng hồ ghim `GOC = 2026-10-10T02:00:00Z` (mã sống 15 phút) nhưng đổi mã bằng giờ thật; từ 02:15Z hôm nay chúng đỏ tất định (đo trên cây K6d và cây DT2 nền onehub 91fe8d69: 30 pass, 2 fail) và `pre-push` chặn mọi lệnh đẩy. Sửa: bài «vòng tay» truyền `now: () => GOC` vào `vongTay` (cùng đồng hồ với lúc gieo); bài «kenh-route» đi qua route thật — route dùng giờ thật — nên gieo mã bằng giờ thật (`gieoMa(new Date())`). Không đổi mã sản phẩm.

Source input: yeu-cau P6-32/P6-33 (đợt `sau-14-10`), giám sát mở hàng H5; anh duyệt «P6 sửa ngay» 2026-10-10.

## Criteria

- AC-1: Given tệp `zalo-qua-webhook.integration.spec.ts`, When chạy ở giờ thật hôm nay (sau 02:15Z 10/10), Then 32/32 bài xanh, gồm «giao-khi-mo: vong tay bat duoc tin den o giay 30» và «kenh-route».
- AC-2: Given mốc `GOC` lùi về 2020-01-01T02:00:00Z hoặc đẩy tới 2030-01-01T02:00:00Z, When chạy lại tệp, Then vẫn 32/32 xanh — không bài nào phụ thuộc khoảng cách giữa giờ thật và `GOC`; và bản trước sửa (91fe8d69) ở mốc 2020 thì đỏ đúng hai bài trên.
- AC-3: Given diff của vòng so với onehub 91fe8d69, When liệt kê tệp, Then mã chạy chỉ đổi đúng `apps/agent/test/zalo-qua-webhook.integration.spec.ts`; ngoài ra chỉ hồ sơ `_acceptance/zalo-bom-gio/`, khoá mới `h5_*` trong `_acceptance/config.yaml` và tệp bản đồ do máy vẽ — không mã sản phẩm.

## Coverage

- bỏ coverage-scan — một tệp kiểm, hai bài, một nguyên nhân; xem dòng sổ quyết định «bỏ coverage-scan».

## Out of scope

- Đổi mã sản phẩm (`apps/agent/agent/lib/zalo-poll.ts`, route webhook, `packages/db/src/zalo-lien-ket.ts`).
- Soát các tệp kiểm khác ghim ngày cố định.

## Notes

- Không migration. Không đổi hành vi sản phẩm.
