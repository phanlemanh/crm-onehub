# dieu-phoi-va-bien Implementation Plan

> **For agentic workers:** thực thi tuần tự trong phiên chính (feature-loop T2). Steps dùng checkbox.

**Goal:** Vá năm lỗ biên của bộ điều phối (Ngoài-1, 3, 5, 6, 7 của `dieu-phoi-hai-tang`) trước khi mở đợt sau-14-10.

**Architecture:** Mọi thay đổi trong `scripts/dieu-phoi/` (không phụ thuộc gói, `node --test`), cộng phần cổng ở `.githooks/`, `scripts/verify-gate-shape.mjs` và `.github/workflows/acceptance.yml`. Răng đo ở `_acceptance/dieu-phoi-va-bien/rang/`.

**Tech Stack:** Node ≥ 22 (`node:test`, `node:child_process`), bun cho `bun run`, bash pre-push.

**Spec:** `docs/superpowers/specs/2026-10-07-dieu-phoi-va-bien-design.md` · hợp đồng `_acceptance/dieu-phoi-va-bien/contract.md` · evals `_acceptance/dieu-phoi-va-bien/evals.yaml`.

## Global Constraints

- Không chú thích trong mã (kể cả code sửa).
- Không chữ `crm`, `onehub`, `/Users/`, `gh pr merge`, `--auto` dưới `scripts/dieu-phoi/` ngoài `test/`.
- Hằng thời gian chỉ ở `scripts/dieu-phoi/cau-hinh.mjs`; không số `60_000`, `30_000`… ở tệp khác.
- Giữ nguyên tên mọi ca test cũ và mọi mốc của `_acceptance/dieu-phoi-hai-tang/rang/dot-bien.mjs`.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture + một đột biến trong `rang/dot-bien.mjs` mới.
- Fixture cấu hình `{}` dùng cho ca không cố ý kiểm cấu hình hỏng → đổi thành cấu hình đúng hình dạng.

## Review Focus

1. Cấu hình mẫu `mau/dieu-phoi.config.json` sau `mo` (có `goc_kho`) phải qua bộ kiểm — CLI test `mo → chay → xem` phải còn xanh.
2. Hook chặn S4 không được chậm/đỏ với lệnh thường khi cấu hình hỏng — lệnh thường không bao giờ đọc cấu hình.
3. `giu-nhip` không có lệnh con (`giu-nhip.mjs` trần, không `--`) → thoát 2 với thông điệp cách dùng, không treo.
4. Yêu cầu `gia-han` với `tai_nguyen` là loại không tồn tại (`abc`) → `can_phan`, không ném.
5. Log pre-push có HAI tổng kết node test (lặp lại) → bộ kiểm lấy tổng kết trong mục `test:dieu-phoi`, không lẫn mục khác.

---

### Task 1: Kiểm hình dạng hai tệp cấu hình (AC-3, AC-4, AC-5, AC-6)

**Files:** Modify `scripts/dieu-phoi/cau-hinh.mjs`, `hinh-dang.mjs`, `phat-lich.mjs`, `hook-chan-s4.mjs`, `hook-cho-nguoi.mjs`; tests `test/hinh-dang.test.mjs` (mới), `test/hook-chan-s4.test.mjs`, `test/hook-nhip-cho-nguoi.test.mjs`, `test/bien.test.mjs` (fixture).
**Interfaces — Produces:** `NHIP.giuNhipMs`; `kiemCauHinh(du) → du`, `kiemHangViec(du) → du`, `docCauHinh(thuMuc)`, `docHangViec(thuMuc)` (ném `Error('dieu-phoi.config.json: …')` / `Error('hang-viec.json: …')`).
**Verify:** `node --test scripts/dieu-phoi/test/hinh-dang.test.mjs` + `bun run test:dieu-phoi`.
**Evals:** E3, E4, E5, E6, E7. **independent:** false.

- [ ] Viết `hinh-dang.test.mjs`: ma trận 16 ô cấu hình, 13 ô hàng việc, ca nhịp thật qua `taoVong` (bao_ve chuỗi; thiếu `han_thue_phut["duong-nen"]`) + đối chứng cấu hình đúng; chạy → đỏ (hàm chưa có).
- [ ] Thêm ca vào `hook-chan-s4.test.mjs` (cấu hình bao_ve chuỗi → 2 lỗi nội bộ; hang-viec sai không đổi hook) và `hook-nhip-cho-nguoi.test.mjs` (hang-viec sai → không ghi, hook thật thoát 0; cấu hình sai → vẫn ghi).
- [ ] Cài `kiemCauHinh`, `kiemHangViec`, `docCauHinh`, `docHangViec`; nối vào `motNhip`, khởi động `phat-lich`, `hook-chan-s4.quyet`, `hook-cho-nguoi`.
- [ ] Sửa fixture `{}` của test cũ thành cấu hình đầy đủ (kèm `goc_kho`); chạy cả bộ → xanh.
- [ ] Commit.

### Task 2: Hook chặn S4 nhận S4 theo danh tính (AC-1, AC-2)

**Files:** Modify `scripts/dieu-phoi/hook-chan-s4.mjs`; test `test/hook-chan-s4.test.mjs`; create `_acceptance/dieu-phoi-va-bien/rang/s4-that.mjs`.
**Interfaces — Produces:** `LENH_MAC_DINH.workflow = { meta: 'acceptance-verify', tep: /^acceptance-verify(?:-[^/]*)?\.js$/ }`; `laS4Workflow(tool_input) → boolean`; `phanLoai(dauVao)` giữ chữ ký.
**Verify:** `node --test scripts/dieu-phoi/test/hook-chan-s4.test.mjs` + `node _acceptance/dieu-phoi-va-bien/rang/s4-that.mjs`.
**Evals:** E1, E2, E21. **independent:** false.

- [ ] Test: ma trận năm đường vào × {chưa cấp → 2, khoá đúng worktree → 0}; chiều im ba ca + đầu vào hỏng nhắc bản chép → 2; chạy → đỏ.
- [ ] Cài đọc meta: `script` nội tuyến → regex meta; `name`; `scriptPath` → đọc 64 KiB (`NHIP`-free, kích thước là hằng `DOC_DAU_BYTE` trong `cau-hinh.mjs`) → regex meta; không đọc được → regex tên tệp. `MAU_THO` = `/acceptance-verify|repin-lane|s4-args|duong-nen\.mjs/`.
- [ ] Viết `rang/s4-that.mjs` (import meta thật từng tệp, so `phanLoai`); chạy → xanh.
- [ ] Commit.

### Task 3: Lệnh bọc giữ nhịp + hook ép dùng (AC-9, AC-10)

**Files:** Create `scripts/dieu-phoi/giu-nhip.mjs`, `test/giu-nhip.test.mjs`; modify `hook-chan-s4.mjs`, `cau-hinh.mjs`; test `hook-chan-s4.test.mjs`.
**Interfaces — Consumes:** `chamNhip(dauVao, {timDot})` từ `hook-nhip.mjs`. **Produces:** `chayGiuNhip({ lenh, cwd, moiMs = NHIP.giuNhipMs, timDot }) → Promise<number>`; CLI `node giu-nhip.mjs -- <lệnh…>`; `TEP_GIU_NHIP` (đường tuyệt đối) dùng trong thông điệp hook.
**Verify:** `node --test scripts/dieu-phoi/test/giu-nhip.test.mjs scripts/dieu-phoi/test/hook-chan-s4.test.mjs`.
**Evals:** E10, E11, E12. **independent:** false.

- [ ] Test vòng ghi → đọc: hai khoá do `motNhip` cấp, lùi hạn và nhịp, lệnh bọc chạy con ngủ 600 ms với chu kỳ 50 ms, lùi nhịp giữa chừng, khẳng định chạm lặp; `motNhip` sau → gia-han s4, thu-hoi duong-nen P2; đối chứng không bọc → thu-hoi.
- [ ] Test mã thoát 0/3, SIGTERM → con nhận, lệnh bọc 143; ngoài đợt vẫn chạy; thiếu `--` → 2.
- [ ] Test hook: ma trận sáu ca nền/bọc/tiền cảnh/không nặng/chưa giữ khoá.
- [ ] Cài `giu-nhip.mjs` và luật ép trong `quyet`; chạy → xanh; commit.

### Task 4: Gia hạn theo yêu cầu thật sự kéo dài hạn thuê (AC-11, AC-12)

**Files:** Modify `yeu-cau.mjs`, `lich.mjs`, `phat-lich.mjs`; create `test/gia-han.test.mjs`.
**Interfaces — Produces:** `nguCanh.khoaCua(phien) → string[]` (tài nguyên phiên đang giữ); `xetYeuCau` gia-han trả `{ket_qua:'duyet', boi:'may', ly_do, tai_nguyen}`; `hanGiaHan({ hanCu, nowMs, phut }) → ISO` trong `lich.mjs`; `apGiaHan(thuMuc, nowMs, daBao)` trong `phat-lich.mjs`.
**Verify:** `node --test scripts/dieu-phoi/test/gia-han.test.mjs scripts/dieu-phoi/test/yeu-cau.test.mjs`.
**Evals:** E13, E14, E15. **independent:** false.

- [ ] Test: máy duyệt 12:00 → 14:00 một lần qua bốn nhịp; gốc giờ nhịp khi hạn cũ đã qua; ma trận năm ca giữ khoá; giám sát năm vế (a)–(e).
- [ ] Cài; nhớ báo `can_phan` một lần bằng danh sách `da_bao` sẵn có trong `trang-thai.json` (khoá `gh:<id>`).
- [ ] Commit.

### Task 5: Bộ kiểm điều phối vào cổng (AC-7, AC-8)

**Files:** Modify `.githooks/pre-push`, `.githooks/gate-shape.json`, `scripts/verify-gate-shape.mjs`, `.github/workflows/acceptance.yml`; create `scripts/gate-shape-node-test.mjs`, `_acceptance/dieu-phoi-va-bien/rang/cong.mjs`.
**Interfaces — Produces:** `checkNodeTest(checker, log, { reference }) → { problems: string[], report: string[] }`, `nodeTestSummary(text) → { tests, fail } | null`, `runReference(dir) → { tests, fail } | null`.
**Verify:** `node _acceptance/dieu-phoi-va-bien/rang/cong.mjs`.
**Evals:** E8, E9. **independent:** false.

- [ ] Viết `rang/cong.mjs` (bốn quan hệ + bốn ca phá trên bản sao + năm log mẫu dựng từ đầu ra thật); chạy → đỏ.
- [ ] Cài module, nối vào verify-gate-shape, thêm task pre-push, khai checker, job CI Node 24.
- [ ] Chạy → xanh; commit.

### Task 6: Tài liệu + bộ đột biến + hồi quy vòng trước (AC-13, AC-14)

**Files:** Modify `scripts/dieu-phoi/mau/LUAT.md`, `README.md`; create `_acceptance/dieu-phoi-va-bien/rang/dot-bien.mjs`.
**Verify:** `node _acceptance/dieu-phoi-va-bien/rang/dot-bien.mjs`, `node _acceptance/dieu-phoi-hai-tang/rang/dot-bien.mjs`, `node _acceptance/dieu-phoi-hai-tang/rang/ranh-gioi.mjs`, `bun run test:dieu-phoi`.
**Evals:** E16, E17, E18, E19, E20. **independent:** false.

- [ ] LUAT mẫu: mục «Việc nền dài khi giữ khoá» (lệnh bọc + mẫu) và «Gia hạn» (`noi_dung.uoc_phut`, `tai_nguyen`); README: hai tệp được kiểm hình dạng mỗi nhịp, `loi-nhip`, duyệt `gia-han` bằng `tra-loi` (kèm `uoc_phut` tuỳ chọn).
- [ ] Bộ đột biến V1–V33 (trừ V16, ở `cong.mjs`): mốc đúng một lần, ca ghim đỏ.
- [ ] Chạy cả bốn lệnh verify → xanh; commit.

### Task 7: Cổng không đổi kho thật khi chạy trong hook (AC-15 — thêm khi mở lại hợp đồng 07/10)

**Files:** Modify `.githooks/pre-push`, `scripts/gate-shape-node-test.mjs`; create `_acceptance/dieu-phoi-va-bien/rang/git-sach.mjs`.
**Interfaces — Produces:** `runReference(root, dir)` chạy `node --test` với `env` đã lọc bỏ mọi biến `GIT_*`; pre-push gọi `unset $(git rev-parse --local-env-vars)` ngay sau khi lấy `ROOT`.
**Verify:** `node _acceptance/dieu-phoi-va-bien/rang/git-sach.mjs` + `bun _acceptance/dieu-phoi-va-bien/rang/cong.mjs` + `bun run test:dieu-phoi`.
**Evals:** E22 (và E8, E9 không hồi quy). **independent:** false.

- [ ] Viết `rang/git-sach.mjs`: kho nháp có worktree liên kết; chạy tệp pre-push thật với `bun` giả và lượt tham chiếu thật, `GIT_DIR` trỏ gitdir worktree nháp; so trạng thái kho trước/sau; chiều đỏ trên bản sao bỏ bước gỡ biến. Chạy → đỏ (chưa sửa).
- [ ] Sửa pre-push và `runReference`; chạy → xanh; commit.
