---
schema_version: 1
feature: «Bài kiểm Zalo webhook không còn đỏ theo giờ thật»
slug: zalo-bom-gio
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-10T02:30:08Z
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

Known limits — anh chọn ở Cổng Bằng chứng 2026-10-10, từ S4 round 1:

- Ngoài-1: E3 (`h5_chi_tep_kiem`) so diff với sha cố định `91fe8d69f`, không theo merge-base; nhánh gộp onehub mới hay hồ sơ được chấm lại sau khi lên onehub thì E3 đỏ oan.
- Ngoài-2: `rang/hai-moc.sh` ghi bản kiểm tạm vào `apps/agent/test`; một lượt `bun test` của gói agent chạy cùng lúc có thể nhặt phải.
- Ngoài-3: Cùng gốc với Ngoài-1 (phát hiện lặp từ lane soát khác).
- Trong-AC-2 chiều đỏ: Lệnh E2 không gọi `--tu-thu`; chiều đỏ (bản 91fe8d69 ở mốc 2020 đỏ đúng hai bài) chỉ đo tay ở S3, và `--tu-thu` không đối chiếu tên hai bài.
- Trong-AC-3 config chỉ thêm khoá: E3 loại cả `_acceptance/`, nên không đo vế «config.yaml chỉ thêm khoá `h5_*`» hay việc không chạm hồ sơ khác; diff thật của config là ba dòng thêm `h5_*`.
