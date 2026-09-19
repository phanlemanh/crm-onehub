---
slug: thuoc-khai-dung-tieng
at: 2026-09-19T02:39:59.202Z
sha: 32491c87474b2c94ff0d523d19e2bbed2ba11fb2
nen: do
cong_cu: do
suite: xanh
luoi: do
engine: xanh
---

## Dòng đỏ

- nen cong-cu: THIEU ${CLAUDE_PLUGIN_ROOT:-$(node (khoa executors.design.ui_check)
- nen luoi: 2 vi pham co san
- VIOLATION [ho-so-khai-dung-tieng]: verdict=REJECT (must be PASS to merge)
- VIOLATION [nhan-ung-dung-noi-tieng-viet]: hồ sơ có bằng chứng nhưng status chưa arm cổng — status=approved; evidence-report.md verdict=BLOCKED đã có. Cổng chỉ chấm hồ sơ ở implemented/verified/signed-off, hồ sơ này đang tàng hình. Đặt status: implemented để cổng chấm, hoặc gỡ evidence-report.md / tách hồ sơ khỏi PR nếu bằng chứng thuộc phạm vi đã bỏ.
