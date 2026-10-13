---
slug: lien-quan-loc-ban-da-cat
at: 2026-10-13T01:08:24.505Z
sha: 33e1171673a7b322ac2c9d9cef880f244d7562d3
nen: do
cong_cu: xanh
suite: do
luoi: do
engine: do
---

## Dòng đỏ

- nen suite: DO SAN executors.test.suite_app_ui ma 1
- nen luoi: 1 vi pham co san
- VIOLATION [lien-quan-loc-ban-da-cat]: hồ sơ có bằng chứng nhưng status chưa arm cổng — status=approved; PR đổi code chịu cổng (apps/api/src/companies/companies.contracts.ts…) mà hồ sơ trong PR chưa arm. Cổng chỉ chấm hồ sơ ở implemented/verified/signed-off, hồ sơ này đang tàng hình. Đặt status: implemented để cổng chấm, hoặc gỡ evidence-report.md / tách hồ sơ khỏi PR nếu bằng chứng thuộc phạm vi đã bỏ.
- nen engine: LECH scripts/tin-hieu-khoa.cjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/tin-hieu.mjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/cat-luot.mjs (vendored ≠ dang-chay)
