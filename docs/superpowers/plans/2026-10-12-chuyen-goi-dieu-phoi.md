# Chuyển crm sang gói `dieu-phoi` của kit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** crm thôi mang `scripts/dieu-phoi/`; kiểm chéo đêm nạp gói `dieu-phoi` của kit, không khai mốc; eval đã ký mất vật đo khai thay bởi; khoá `dieu_phoi.goi_dot`.

**Architecture:** Gỡ thẳng bộ cũ và mọi chỗ nối (settings, `package.json`, `pre-push`, `gate-shape.json`, `acceptance.yml`). Kiểm chéo giải gói qua `scripts/resolve-plugin.mjs` trong một mô-đun mới và nạp động `dot.mjs`, `hook-nhip.mjs`. Mười phép đo `rang/*.mjs` đi qua một bộ giải gói chung `rang/goi.mjs` (biến → bản cài → tệp trỏ tạm kit `origin/main`).

**Tech Stack:** Node 26 ESM, Bun (chạy `rang/`, `Bun.YAML`), `node --test`, git.

**Spec:** `_acceptance/chuyen-goi-dieu-phoi/design.md` · hợp đồng `_acceptance/chuyen-goi-dieu-phoi/contract.md` · `evals.yaml` cùng hồ sơ.

## Global Constraints

- Không viết chú thích trong mã (`AGENTS.md`).
- Không sửa script kit vendored: `scripts/recheck-evidence.cjs`, `scripts/product-map.mjs`, `scripts/pre-merge-check.sh`, `scripts/resolve-plugin.mjs`, `lib/*.cjs`.
- `_acceptance/config.yaml` chỉ thêm dòng (luật 7 của `docs/plan/dot-r2/LUAT-rieng.md`).
- Hồ sơ đã ký chỉ đổi đúng các dòng `status: not-run` / `superseded_by:` của bảng thay bởi.
- Mọi đường trong `rang/` suy từ vị trí script; mọi fixture trong thư mục tạm của hệ thống hoặc `.acceptance-runs/chuyen-goi-dieu-phoi/`.
- Không cài bản kit chưa phát hành; đọc kit chỉ bằng `git -C <kho kit> archive origin/main dieu-phoi`.
- Cổng 3000/3001 là của chủ kho; phép đo không mở máy chủ dev.
- Tiến trình nền do phép đo mở (bộ phát lịch) chỉ dừng bằng `dong` hoặc `kill <pid đã ghi>`; cấm `pkill -f`.

## Review Focus

1. Gói vắng ở đêm thật (chưa cài, cài hỏng) — lượt phải nói ra bằng `khong-chay-duoc` và lệnh cài, không chạy làn, mốc đứng (Task 1 ca `goi-vang`).
2. Đơn kiểm chéo cũ còn khoá `moc` từ tệp tạm của lượt bị giết giữa chừng — `layKhoa` mới không đọc lại đơn cũ, ghi đè nguyên tử (Task 1 ca «đơn không moc»).
3. Đợt sống nhưng gói ở bản khác bản đã chép vào `loi/` — giao kèo tệp (`xin/`, `khoa/s4/chu.json`) là chung, kiểm chéo không gọi CLI của đợt (Task 5, E7 chạy bộ phát lịch thật).
4. Worktree: `kiemChuyen`/`chan-doan` đọc gốc kho chung — mọi phép đo chạy trên clone độc lập (Task 4).
5. Một con trỏ thay bởi ngoài bảng gãy vì AC đích mất eval sống — E9 quét mọi con trỏ (Task 6).

---

### Task 1: Kiểm chéo nạp gói và thôi khai mốc

**independent:** false (phép đo Task 5 đo đúng mô-đun này) · **phục vụ:** E5, E6, E7

**Files:**
- Create: `scripts/kiem-cheo/goi-dieu-phoi.mjs`
- Modify: `scripts/kiem-cheo/cau-hinh.mjs` (thêm `goiDieuPhoi`, bỏ `moc.sauGio`)
- Modify: `scripts/kiem-cheo/khoa.mjs` (bỏ import tĩnh, `timDot` bắt buộc từ bên gọi, bỏ `moc`)
- Modify: `scripts/kiem-cheo/dem.mjs` (nạp gói đầu lượt, lỗi → `khong-chay-duoc`; bỏ `canMoc`)
- Modify: `scripts/kiem-cheo/moc.mjs` (bỏ `canMoc`)
- Test: `scripts/kiem-cheo/test/khoa.test.mjs`, `scripts/kiem-cheo/test/moc.test.mjs`, `scripts/kiem-cheo/test/dem.test.mjs`

**Interfaces:**
- Produces: `napGoiDieuPhoi({ bien = process.env.KIEM_CHEO_GOI_DIEU_PHOI } = {}) → Promise<{ goc: string, timThuMucDot: (cwd) => string|null, chamNhip: (dauVao) => string[] }>`; ném `Error` với message bắt đầu `goi dieu-phoi khong giai duoc:` và chứa lệnh cài.
- Produces: `layKhoa({ goc, cay, timDot, fs, now, cho, choToiDaMs })` — `timDot` bắt buộc; đơn không có `moc`.
- Consumes: `scripts/resolve-plugin.mjs --plugin dieu-phoi --require scripts/dot.mjs --require scripts/hook-nhip.mjs --require scripts/hinh-dang.mjs [--root <bien>]`.

- [ ] Step 1: Sửa `test/khoa.test.mjs` — `kiemDon` lấy từ `napGoiDieuPhoi()` (gốc gói + `scripts/hinh-dang.mjs`), mọi lời gọi `layKhoa` truyền `timDot`, ca «(f) co dot» đòi `!("moc" in don)`; bỏ ca «khong moc thi don khong co khoa moc». Bỏ ca `canMoc` của `test/moc.test.mjs`. Thêm ca `goi-vang` vào `test/dem.test.mjs`.
- [ ] Step 2: Chạy `KIEM_CHEO_GOI_DIEU_PHOI=<gói trích> node --test "scripts/kiem-cheo/test/*.test.mjs"` — đỏ (mô-đun chưa có).
- [ ] Step 3: Viết `goi-dieu-phoi.mjs`, sửa `khoa.mjs`, `dem.mjs`, `moc.mjs`, `cau-hinh.mjs`.
- [ ] Step 4: Chạy lại — xanh. Phá-thử: `khoa.mjs` ghi lại `moc` → ca «(f) co dot» đỏ.
- [ ] Step 5: Commit `refactor(kiem-cheo): nạp gói dieu-phoi của kit, thôi khai mốc`.

### Task 2: Gỡ bộ cũ, khoá gói đợt, tài liệu sống

**independent:** false (bảng thay bởi của Task 3 rút từ đỏ thật sau gỡ) · **phục vụ:** E1, E3, E4, E8

**Files:**
- Delete: `scripts/dieu-phoi/**` (33 tệp)
- Modify: `.claude/settings.json` (bỏ khoá `hooks`), `package.json` (bỏ `test:dieu-phoi`), `.githooks/pre-push` (vòng task), `.githooks/gate-shape.json` (checker), `.github/workflows/acceptance.yml` (bước)
- Modify: `_acceptance/config.yaml` (thêm khối `dieu_phoi:` cuối tệp)
- Modify: `docs/plan/dot-r2/README.md`, `docs/plan/dot-r2/LUAT-rieng.md` (thôi nhắc nguyên văn đường cũ)

- [ ] Step 1: `git rm -r scripts/dieu-phoi`; sửa năm tệp cấu hình bằng script node giữ định dạng (tab cho `package.json`, `gate-shape.json`; hai dấu cách cho settings).
- [ ] Step 2: Thêm `dieu_phoi:\n  goi_dot: docs/plan/dot-{ten}` cuối `config.yaml`.
- [ ] Step 3: Sửa hai tệp `docs/plan/dot-r2`.
- [ ] Step 4: Verify: `git grep -n "scripts/dieu-phoi\|test:dieu-phoi\|\.\./dieu-phoi/" -- ':!_acceptance' ':!docs/superpowers' ':!docs/plan/dot-sau-14-10'` rỗng; `bun scripts/verify-gate-shape.mjs` không phàn nàn về checker vắng (chạy qua `pre-push` ở bước đẩy).
- [ ] Step 5: Commit `chore: gỡ bộ điều phối tự viết; khoá dieu_phoi.goi_dot`.

### Task 3: Khai thay bởi cho eval đã ký

**independent:** false · **phục vụ:** E9

**Files:** `_acceptance/{dieu-phoi-hai-tang,dieu-phoi-truoc-mo-dot,dieu-phoi-va-bien,kiem-cheo-chay-quang-lang,kiem-cheo-sau-gop,sua-paths-e5-soan-okr,giam-phut-ci-nhap-t1,giam-phut-acceptance}/evals.yaml`

- [ ] Step 1: Script trong scratch đọc bảng của design doc; với eval chưa khai, chèn `    status: not-run` và `    superseded_by: chuyen-goi-dieu-phoi#AC-n` ngay sau dòng `cmd:` của khối; với eval đã khai, thay giá trị `superseded_by`.
- [ ] Step 2: Verify: `git diff -U0` mỗi tệp chỉ gồm các dòng đó; `parseEvals` đọc lại đúng.
- [ ] Step 3: Commit `acceptance: khai thay bởi chuyen-goi-dieu-phoi cho eval đo bộ cũ`.

### Task 4: Bộ giải gói và bốn phép đo cây (E1–E4, E8)

**independent:** false · **phục vụ:** E1, E2, E3, E4, E8

**Files:** Create `_acceptance/chuyen-goi-dieu-phoi/rang/{goi.mjs,chung.mjs,kiem-chuyen.mjs,mo-dun.mjs,hook.mjs,cong.mjs,goi-dot.mjs}`

**Interfaces:**
- Produces (`goi.mjs`): `giaiGoi() → { goc, nguon: 'bien'|'da-cai'|'chua-phat-hanh', nhan }` — in dòng `goi dieu-phoi: …`; `napGoi(tep) → Promise<module>`.
- Produces (`chung.mjs`): `GOC`, `MB` (merge-base cố định của hợp đồng), `SLUG`, `Ket` (đếm đạt/sai, `ket()` thoát 0/1), `cloneDocLap(sha, dich) → dir`, `tam(ten) → dir`.

- [ ] Steps: viết từng tệp, chạy đối chứng dương rồi từng ca đỏ, mỗi tệp thoát 0 trên cây thật.
- [ ] Commit `acceptance(chuyen-goi-dieu-phoi): phép đo E1–E4, E8`.

### Task 5: Phép đo kiểm chéo (E5–E7)

**independent:** false · **phục vụ:** E5, E6, E7

**Files:** Create `_acceptance/chuyen-goi-dieu-phoi/rang/{kiem-cheo.mjs,goi-vang.mjs,luot-kho.mjs}`

- [ ] Steps: kho giả bằng `scripts/kiem-cheo/test/kho-gia.mjs`; đợt thật bằng CLI của gói với `DIEU_PHOI_MAY_DIR` tạm; làn giả in dòng kết theo khuôn `phan-xu.mjs`; mỗi tệp thoát 0 và bắt mọi ca đỏ.
- [ ] Commit `acceptance(chuyen-goi-dieu-phoi): phép đo E5–E7`.

### Task 6: Phép đo thay bởi và không đỏ thêm (E9, E10)

**independent:** false · **phục vụ:** E9, E10

**Files:** Create `_acceptance/chuyen-goi-dieu-phoi/rang/{thay-boi.mjs,khong-do-them.mjs}`; Modify `_acceptance/config.yaml` (thêm `chuyen-goi-dieu-phoi/E10` vào `feature_loop.model_evals` để lượt chấm chạy nó tuần tự sau suite — bài học `[d-20261011T053831Z-10]`).

- [ ] Steps: E9 rút bảng từ design doc, quét mọi con trỏ; E10 dựng hai clone đầy đủ, chạy tập lệnh, so.
- [ ] Commit `acceptance(chuyen-goi-dieu-phoi): phép đo E9–E10`.

### Task 7: Kiểm cả cây và chuyển `implemented`

- [ ] `bun run check-types`, `bun run lint`, `bun run lint:slop` xanh; chạy đủ mười `rang/`.
- [ ] `contract.md` → `status: implemented`; commit.
