---
slug: zalo-bom-gio
at: 2026-10-10T02:31:03Z
verdict: clean
p0: 0
p1: 0
p2: 0
---

## Soát trộn giờ ghim với giờ thật (giám sát nhờ, 10/10)

Cách đo: chạy từng tệp với đồng hồ JS đẩy tới ba mốc bằng một preload `setSystemTime` (`2026-10-14T03:00Z`, `2026-11-15T03:00Z`, `2027-01-01T03:00Z`) và ở giờ thật. Đối chứng dương: bản `zalo-qua-webhook` trước sửa (91fe8d69) xanh 32/32 ở `2026-10-10T02:05Z` và đỏ 30/2 ở `2026-11-15` — cách đo bắt được bệnh này. Giới hạn: giờ của Postgres (`now()`, cột mặc định) vẫn là giờ thật, cách đo chỉ bắt trộn ở phía JS.

| Tệp | Giờ thật | 14/10 | 15/11 | 01/01/2027 | Kết luận |
|---|---|---|---|---|---|
| `apps/agent/test/muc-nhac-okr.spec.ts` | 4/0 | 4/0 | 4/0 | 4/0 | đã soát, không trộn — `SANG` truyền làm tham số cho `dungTin` |
| `apps/agent/test/nhac-ke-hoach.integration.spec.ts` | 30/0 | 30/0 | 30/0 | 30/0 | đã soát, không trộn — đồng hồ đặt bằng `setSystemTime(LUC_NHAC)` trước mỗi lần quét |
| `apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts` | 29/0 | 29/0 | 29/0 | 29/0 | đã soát, không trộn — mốc 15/10, 31/10 truyền làm tham số `hoi(…, luc)` / `now: () => goc` |
| `apps/agent/test/zalo-qua-webhook.integration.spec.ts` (đã sửa) | 32/0 | 32/0 | 32/0 | 32/0 | đối chứng sau sửa |

(số = pass/fail)
