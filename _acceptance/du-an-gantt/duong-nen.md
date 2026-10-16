---
slug: du-an-gantt
at: 2026-10-16T10:28:49.437Z
sha: 87cc639e1ba3fe73509f58205dcaaaee7b067fb7
nen: do
cong_cu: xanh
suite: xanh
luoi: do
engine: do
---

## Dòng đỏ

- nen luoi: 1 vi pham co san
- VIOLATION [du-an-gantt]: hồ sơ có bằng chứng nhưng status chưa arm cổng — status=draft; PR đổi code chịu cổng (apps/app/app/proto/_modules/du-an-gantt/du-lieu.ts…) mà hồ sơ trong PR chưa arm. Cổng chỉ chấm hồ sơ ở implemented/verified/signed-off, hồ sơ này đang tàng hình. Đặt status: implemented để cổng chấm, hoặc gỡ evidence-report.md / tách hồ sơ khỏi PR nếu bằng chứng thuộc phạm vi đã bỏ.
- nen engine: LECH scripts/pre-merge-check.sh (vendored ≠ dang-chay)
- nen engine: LECH scripts/product-map.mjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/khong-can-nguoi.mjs (vendored ≠ dang-chay)
- nen engine: LECH lib/out-of-contract.cjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/ho-so-tom-tat.cjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/tin-hieu.mjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/cat-luot.mjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/co-hop-dong.cjs (vendored ≠ dang-chay)
