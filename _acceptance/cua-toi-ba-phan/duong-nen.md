---
slug: cua-toi-ba-phan
at: 2026-10-15T04:37:27.546Z
sha: a61f66f2d74426a4c214282365d10a3010f3ba01
nen: do
cong_cu: xanh
suite: do
luoi: do
engine: do
---

## Dòng đỏ

- nen suite: DO SAN executors.script.lint_slop ma 1
- nen luoi: 2 vi pham co san
- VIOLATION [cua-toi-ba-phan]: hồ sơ có bằng chứng nhưng status chưa arm cổng — status=draft; PR đổi code chịu cổng (apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/page.tsx…) mà hồ sơ trong PR chưa arm. Cổng chỉ chấm hồ sơ ở implemented/verified/signed-off, hồ sơ này đang tàng hình. Đặt status: implemented để cổng chấm, hoặc gỡ evidence-report.md / tách hồ sơ khỏi PR nếu bằng chứng thuộc phạm vi đã bỏ.
- VIOLATION [dieu-huong-khu-muc-tieu]: status=implemented but no evidence-report.md
- nen engine: LECH scripts/pre-merge-check.sh (vendored ≠ dang-chay)
- nen engine: LECH scripts/product-map.mjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/khong-can-nguoi.mjs (vendored ≠ dang-chay)
- nen engine: LECH lib/out-of-contract.cjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/ho-so-tom-tat.cjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/tin-hieu.mjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/cat-luot.mjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/co-hop-dong.cjs (vendored ≠ dang-chay)

## Ghi chú phiên thợ (phân loại, không sửa phần máy sinh ở trên)

Cây đo: `onehub` @02ed3aec0 + nhánh DH1 @8df415703 + hồ sơ và bản mẫu của DH3 (sha `a61f66f2d`, chưa có mã sản phẩm của
DH3). Lượt nền do Điều phối M5 cấp lúc 04:2xZ.

- **suite · lint_slop (10 lỗi):** 2 lỗi ở bản mẫu `proto/_modules/cua-toi-ba-phan` của chính vòng này — ĐÃ GỠ ngay
  (`satisfies`, `Map`), chạy lại `bun run lint:slop` chỉ còn 8 lỗi. 8 lỗi còn lại nằm ở tệp của DH1
  (`test/okr-dau-trang-khu.dom.tsx` ×6, `_acceptance/dieu-huong-khu-muc-tieu/rang/ho-so-da-ky.mjs` ×2); DH1 đã báo đang
  sửa ở round 2 của nó. Gỡ khi gộp lại nhánh DH1.
- **lưới · 2 vi phạm:** cả hai là trạng thái giữa vòng của nhánh chồng, không phải lỗi vật: `cua-toi-ba-phan` đang
  `draft` mà diff so `onehub` có mã chịu cổng (là mã của DH1) — tự hết khi DH1 gộp và hồ sơ này lên `implemented`;
  `dieu-huong-khu-muc-tieu` `implemented` chưa có báo cáo bằng chứng — tự hết khi DH1 qua S4.
- **engine · 8 tệp vendored lệch:** đã biết, crm #413 gỡ — **không đọc được ở đây**.
- **công cụ:** xanh.
