# Kế hoạch thi công — ci-ma-tran-ba-o

Hồ sơ đã duyệt Cổng 1 ngày 09/10. Không viết chú thích trong mã.

## Task 1 — ci.yml và bản chép đã đo

**Files:** `.github/workflows/ci.yml` = đúng blob `c4c5f58e…` của commit `341a9d6c1` (`git show 341a9d6c1:.github/workflows/ci.yml`);
`_acceptance/ci-ma-tran-ba-o/rang/ci-323.yml` = cùng nội dung (bản chép cho E3, không cần nhánh thử còn sống).
**Verify:** `git hash-object` của hai tệp = `c4c5f58e06e42e594b519c2a2e7eb40fb9afbfcb`. **Phục vụ:** E1, E2, E3. **independent:** true.

## Task 2 — CLAUDE.md

**Files:** `CLAUDE.md` — thay đúng câu «CI riêng của công ty sống ở `.github/workflows/acceptance.yml`, không bao giờ vào
`ci.yml` của hãng.» bằng đoạn ở Notes của hợp đồng, chữ khớp từng ký tự.
**Verify:** E4. **Phục vụ:** E4. **independent:** true.

## Task 3 — tài liệu đo

**Files:** `docs/plan/ci-tach-job.md` lấy từ nhánh `docs/ci-tach-job-de-xuat-hang` (bản có kết quả hai lượt thử), thêm
một dòng đầu nói tài liệu nay là bằng chứng của F21 và F20 dừng gửi hãng (luật 47).
**Verify:** đọc lại. **Phục vụ:** Đường đo. **independent:** true.

## Task 4 — bài đo E1–E5 và khoá cấu hình

**Files:** `_acceptance/ci-ma-tran-ba-o/rang/{hinh.mjs, phu-goi.mjs, khop-323.mjs, claude-md.mjs, do-7-ngay.mjs}`;
`_acceptance/config.yaml` thêm `cmtb_hinh`, `cmtb_phu_goi`, `cmtb_khop_323`, `cmtb_claude_md`, `cmtb_do_7_ngay` (giám sát duyệt
P4-46, P4-47). Mỗi bài có chiều đỏ trong cùng lượt như `expected` ghi.
**Verify:** từng lệnh mã 0; phá thử mỗi bài một lần (sửa bản sao) thấy mã khác 0 gọi tên. **Phục vụ:** E1–E5.
**independent:** false (cần Task 1, 2).
