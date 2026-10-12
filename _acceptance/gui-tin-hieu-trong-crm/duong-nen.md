---
slug: gui-tin-hieu-trong-crm
at: 2026-10-12T02:07:32.803Z
sha: faae1bb1e09c346259e083f652a74ee3027c82b7
nen: do
cong_cu: xanh
suite: do
luoi: do
engine: xanh
---

## Dòng đỏ

- nen suite: DO SAN executors.test.suite_agent_db ma 1
- nen suite: DO SAN executors.test.suite_okr_goi ma 1
- nen suite: DO SAN executors.script.lint_slop ma 1
- nen suite: DO SAN executors.script.build_khong_cache ma 1
- nen luoi: 1 vi pham co san
- VIOLATION [gui-tin-hieu-trong-crm]: hồ sơ có bằng chứng nhưng status chưa arm cổng — status=draft; PR đổi code chịu cổng (apps/app/app/proto/_modules/gui-tin-hieu-trong-crm/du-lieu.ts…) mà hồ sơ trong PR chưa arm. Cổng chỉ chấm hồ sơ ở implemented/verified/signed-off, hồ sơ này đang tàng hình. Đặt status: implemented để cổng chấm, hoặc gỡ evidence-report.md / tách hồ sơ khỏi PR nếu bằng chứng thuộc phạm vi đã bỏ.
