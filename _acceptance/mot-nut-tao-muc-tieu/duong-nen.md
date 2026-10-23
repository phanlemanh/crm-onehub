---
slug: mot-nut-tao-muc-tieu
at: 2026-10-22T12:05:55.240Z
sha: 90dd60f01f2514dd305e4e4c280511d63a0e4cab
nen: do
cong_cu: xanh
suite: do
luoi: do
engine: xanh
---

## Dòng đỏ

- nen suite: DO SAN executors.test.suite_api ma 1
- nen luoi: 4 vi pham co san
- VIOLATION [dieu-huong-khu-muc-tieu]: evidence is stale — code changed after verify (verified_commit dec1d667e3d2dd9c745d2aad72ce7e86ab8c0660); re-run verify before merge. Changed:
- VIOLATION [khung-okr-truoc-r1]: evidence is stale — code changed after verify (verified_commit a0124b2dba7fd0f324ebb62c0a560e6b83425141); re-run verify before merge. Changed:
- VIOLATION [okr-to-chuc-va]: evidence is stale — code changed after verify (verified_commit 603c4f8fe81a9b0b35dffef5173b82fae3160d39); re-run verify before merge. Changed:
- VIOLATION [soan-okr-song-lai]: evidence is stale — code changed after verify (verified_commit cdc762c63018535345b2e142f23e81aa94dc9943); re-run verify before merge. Changed:

## Dòng vàng

- nen luoi: 1 vi pham cua chinh vong (khong tinh)
- VIOLATION [mot-nut-tao-muc-tieu]: hồ sơ có bằng chứng nhưng status chưa arm cổng — status=approved; PR đổi code chịu cổng (apps/app/app/(app)/[slug]/okr/hanh-dong-khu.tsx…) mà hồ sơ trong PR chưa arm. Cổng chỉ chấm hồ sơ ở implemented/verified/signed-off, hồ sơ này đang tàng hình. Đặt status: implemented để cổng chấm, hoặc gỡ evidence-report.md / tách hồ sơ khỏi PR nếu bằng chứng thuộc phạm vi đã bỏ.
