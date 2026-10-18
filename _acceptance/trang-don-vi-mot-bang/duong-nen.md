---
slug: trang-don-vi-mot-bang
at: 2026-10-15T03:58:49.439Z
sha: b94cea9f01f39ae3abeb9fb23ebe587931f94019
nen: do
cong_cu: xanh
suite: do
luoi: do
engine: do
---

## Dòng đỏ

- nen suite: DO SAN executors.script.lint_slop ma 1
- nen luoi: 2 vi pham co san
- VIOLATION [dieu-huong-khu-muc-tieu]: hồ sơ có bằng chứng nhưng status chưa arm cổng — status=approved; PR đổi code chịu cổng (apps/app/app/proto/_modules/dieu-huong-khu-muc-tieu/index.tsx…) mà hồ sơ trong PR chưa arm. Cổng chỉ chấm hồ sơ ở implemented/verified/signed-off, hồ sơ này đang tàng hình. Đặt status: implemented để cổng chấm, hoặc gỡ evidence-report.md / tách hồ sơ khỏi PR nếu bằng chứng thuộc phạm vi đã bỏ.
- VIOLATION [trang-don-vi-mot-bang]: hồ sơ có bằng chứng nhưng status chưa arm cổng — status=draft; PR đổi code chịu cổng (apps/app/app/proto/_modules/dieu-huong-khu-muc-tieu/index.tsx…) mà hồ sơ trong PR chưa arm. Cổng chỉ chấm hồ sơ ở implemented/verified/signed-off, hồ sơ này đang tàng hình. Đặt status: implemented để cổng chấm, hoặc gỡ evidence-report.md / tách hồ sơ khỏi PR nếu bằng chứng thuộc phạm vi đã bỏ.
- nen engine: LECH scripts/pre-merge-check.sh (vendored ≠ dang-chay)
- nen engine: LECH scripts/product-map.mjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/khong-can-nguoi.mjs (vendored ≠ dang-chay)
- nen engine: LECH lib/out-of-contract.cjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/ho-so-tom-tat.cjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/tin-hieu.mjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/cat-luot.mjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/co-hop-dong.cjs (vendored ≠ dang-chay)

## Đọc lại các dòng đỏ (phiên thợ, sau lượt)

- **Nền đo ở đâu:** nhánh cắt từ nhánh local DH1 `feat/dieu-huong-khu-muc-tieu`, nên lượt này đo trên `onehub`
  (merge-base 38300b3c8) CỘNG DH1 tới `1f2634926`, cộng S1 của chính vòng tới `b94cea9f0` — không phải `onehub` trần
  (Điều phối M5 dặn ghi rõ).
- **suite — `lint_slop` mã 1: KHÔNG phải nền.** Hai lỗi `anti-slop(no-known-value-widening)` nằm ở
  `apps/app/app/proto/_modules/trang-don-vi-mot-bang/du-lieu.ts` — tệp bản mẫu của chính vòng, đang được viết song song
  lúc đường nền chạy. Đã gỡ (hai hằng sang `Map` suy kiểu); `bun run lint:slop` chạy lại: 0 lỗi; `tsc --noEmit -p
  apps/app` 0 lỗi; `test/proto-catalog.spec.ts` 3 pass.
- **luoi — 2 vi phạm «hồ sơ có bằng chứng nhưng status chưa arm cổng»:** trạng thái GIỮA VÒNG, không phải nợ cũ: ảnh
  design-pass trong `evidence/` của hồ sơ này (status draft) và của DH1 (status approved). Tự hết khi hợp đồng của mỗi
  vòng sang `implemented` ở cuối S3.
- **engine — 8 tệp vendored lệch bản đang chạy:** đã biết, #413 (nâng crm lên 2.30) gỡ; **không đọc được ở đây**.
