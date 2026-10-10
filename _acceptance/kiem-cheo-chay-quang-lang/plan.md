# kiem-cheo-chay-quang-lang — kế hoạch thi công

> Thực thi: Native, tuần tự (feature-loop S3). Hạn gộp 01:00 ngày 11/10.

**Goal:** kiểm chéo xếp sau mọi đơn thợ; làn chạm trần thì lưu tiến độ, đêm sau chạy tiếp.
**Spec:** `design.md`, `contract.md`, `evals.yaml` (Cổng 1 duyệt 10/10).

## Global Constraints

- Không chú thích trong mã. Hằng số mới vào `scripts/kiem-cheo/cau-hinh.mjs`.
- Không khởi động lại bộ phát lịch (pid 16906).
- `config.yaml` chỉ thêm khoá `kcq_*`.

## Review Focus

1. Làn chạm trần trước dòng `[lane]` đầu (đang chạy suite) → 0 hồ sơ xong, tiến độ cũ giữ nguyên `xong`, `do`.
2. Tập đo đêm sau rỗng (mọi hồ sơ đã xong, không bị chạm) → không gọi làn, gộp kết luận, tiến mốc.
3. `--tu` tay khác mốc trong `tien-do.json` → bỏ tiến độ, ghi lý do.
4. Đêm sau đỉnh `D'` = `den` (không gộp mới) → `chamMoi` rỗng, không gọi `tepDoi` sai khoảng.
5. Đầu ra làn có dòng của hồ sơ ngoài tập đêm đó → bỏ qua.

---

### Task 1: Lịch (E1)
**Files:** `scripts/dieu-phoi/lich.mjs`, `scripts/dieu-phoi/test/lich.test.mjs`. **independent:** true.
- [ ] Ma trận viết trước + ca cũ đảo chiều; đỏ trước. Thêm phần tử `laKiemCheo` đầu khoá xếp; bỏ ưu tiên `moc`. Xanh.

### Task 2: Tiến độ trên nhật ký thật (E2)
**Files:** `scripts/kiem-cheo/tien-do.mjs`, `scripts/kiem-cheo/test/tien-do.test.mjs`, `_acceptance/kiem-cheo-chay-quang-lang/rang/mau/{lan-2026-10-10.log,ho-so-2026-10-10.json}`. **independent:** true.
- [ ] Chép nhật ký thật và danh sách 146 hồ sơ; ca ghim sha256, 21 xong, dở `cron-theo-ban-khai`; xáo dòng → đổi.

### Task 3: Nối vào lượt đêm (E3)
**Files:** `scripts/kiem-cheo/dem.mjs`, `scripts/kiem-cheo/cau-hinh.mjs`, `scripts/kiem-cheo/test/dem.test.mjs`. **independent:** false.
- [ ] Ca ba đêm, thoát 1 cuối, thoát 3 giữ tiến độ, tiến độ hỏng, `tap_lan`; đỏ trước; nối `tien-do.mjs` vào `luotTho`; xanh; phá-thử ghi đè.

### Task 4: Nối F9 và khoá (E4)
**Files:** `_acceptance/kiem-cheo-sau-gop/evals.yaml` (E2), `_acceptance/kiem-cheo-chay-quang-lang/rang/noi-f9.mjs`, `_acceptance/config.yaml`. **independent:** true.
- [ ] Con trỏ `superseded_by`, thước nối, bốn khoá `kcq_*`; contract `implemented`.
