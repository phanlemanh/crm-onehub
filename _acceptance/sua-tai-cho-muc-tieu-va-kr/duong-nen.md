---
slug: sua-tai-cho-muc-tieu-va-kr
at: 2026-11-02T02:32:05.727Z
sha: fe5bf7df6e5af16475b5c290c9128112e9755ce4
nen: do
cong_cu: xanh
suite: do
luoi: xanh
engine: do
---

## Dòng đỏ

- nen suite: DO SAN executors.test.suite_api ma 1
- nen suite: DO SAN executors.test.suite_app_ui ma 1
- nen engine: LECH scripts/pre-merge-check.sh (vendored ≠ dang-chay)
- nen engine: LECH lib/evidence-core.cjs (vendored ≠ dang-chay)

## Dòng vàng

- nen luoi: 1 vi pham cua chinh vong (khong tinh)
- VIOLATION [sua-tai-cho-muc-tieu-va-kr]: hồ sơ có bằng chứng nhưng status chưa arm cổng — status=approved; PR đổi code chịu cổng (apps/app/app/proto/_modules/sua-tai-cho-muc-tieu-va-kr/du-lieu.ts…) mà hồ sơ trong PR chưa arm. Cổng chỉ chấm hồ sơ ở implemented/verified/signed-off, hồ sơ này đang tàng hình. Đặt status: implemented để cổng chấm, hoặc gỡ evidence-report.md / tách hồ sơ khỏi PR nếu bằng chứng thuộc phạm vi đã bỏ.
