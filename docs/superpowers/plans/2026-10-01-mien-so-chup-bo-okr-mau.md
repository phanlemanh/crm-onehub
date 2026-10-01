# Miễn sổ chụp cho bộ OKR mẫu — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thước `soi-ma.mjs --ca chi-them` của `so-okr-tu-chay` miễn đúng hai lời gọi của `okr:mau` khi bốn chốt đạt, văn bản bốn nơi nói cùng luật, và bốn phép đo mới chứng hai chiều.

**Architecture:** Mọi logic miễn sống trong thước đã có (một tệp). Phép đo của hồ sơ mới là tiến trình con gọi đúng lệnh E8 đọc từ `_acceptance/config.yaml`, với `--thay` trỏ bản sao trong `tmpdir`. Không tệp `apps/`, `packages/` nào đổi.

**Tech Stack:** Bun 1.3.12, `typescript` (AST, đã có trong thước), Node `child_process`, git.

**Spec:** `docs/superpowers/specs/2026-10-01-mien-so-chup-bo-okr-mau-design.md`

## Global Constraints

- Không chú thích mã trong tệp mới hay tệp sửa (`AGENTS.md`).
- Không đổi `apps/**`, `packages/**` (AC-7).
- Câu ghim nguyên văn theo bảng 4.2 của thiết kế; chữ máy in không dấu theo nếp thước cũ, riêng câu `okrSoChup …` và `miễn bộ mẫu không áp: …` có dấu.
- Bản sao phá-thử chỉ trong `os.tmpdir()`.
- Script đo suy gốc kho từ `import.meta.url`, không hardcode.
- PATH: `export PATH="$(brew --prefix bun@1.3.12)/bin:$PATH"`.

## Review Focus

- `hamBaoQuanh` cho lời gọi trong hàm mũi tên không tên trả tên hàm cha — C3 phải dùng hàm-gần-nhất kể cả mũi tên, không dùng `hamBaoQuanh`.
- Tên `xoaTrong` xuất hiện trong khai báo `export async function xoaTrong` — không được tính là «dùng ngoài lời gọi».
- `okr-mau.ts` dùng top-level `await import(...)` — AST là `AwaitExpression(CallExpression(ImportKeyword))`, không phải `ImportDeclaration`.
- `--thay` cho một tệp vai trò không tồn tại trong cây (không dùng) — bỏ qua im lặng là lỗi; phải chỉ thay tệp có trong lượt quét.
- Số dòng trên bản sao phải tính sau khi chèn, không lấy từ tệp gốc.

---

### Task 1: Bảng miễn, bốn chốt, cờ `--thay` trong thước

**Files:** Modify `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`

**Interfaces — Produces:** CLI `bun soi-ma.mjs --ca chi-them [--thay <vai>=<duong>]…`; dòng in `chot mien bo mau: C1 <dat|vo> · C2 … · C3 … · C4 …`, `mien <tệp>:<dòng> <lối> trong <hàm>`, các câu ghim của bảng 4.2.

- [ ] Thêm hằng `TEP_NAP_MAU`, `TEP_LOI_VAO_MAU`, `THU_MUC_MAU = "apps/api/scripts/okr-mau/"`, `MIEN_BO_MAU`, `TEN_CHOT = ["xoaTrong","napTrong"]`.
- [ ] `docVai(vai, thay)` đọc `thay.get(vai) ?? join(GOC, vai)`; `kiemChot(tep, thay)` trả `{ c2, c3, c4, ly: [] }` với câu ghim từng vế.
  - C2: duyệt câu lệnh cấp tệp của `okr-mau.ts`; vị trí `import("./okr-mau/lenh")` động; trước nó phải có lời gọi `kiemDuocNap` và một `IfStatement` mà `thenStatement` chứa lời gọi `process.exit`; không `ImportDeclaration` nào trỏ `./okr-mau/lenh` hay `./okr-mau/nap`.
  - C3: trong `nap.ts`, mỗi `CallExpression` có callee `Identifier` thuộc `TEN_CHOT` mà nằm ngoài chính hàm cùng tên: tìm hàm-gần-nhất (mọi `isFunctionLike`), đòi một lời gọi `kiemOkrThat` trong cùng hàm đó có `pos` nhỏ hơn; mọi `Identifier` thuộc `TEN_CHOT` khác (không phải tên khai báo hàm, không phải callee đã xét) → «<tệp>:<dòng> dùng <tên> ngoài lời gọi có chốt»; mọi tệp khác dưới `THU_MUC_MAU` có `Identifier` thuộc `TEN_CHOT` → cùng câu.
  - C4: mọi tệp quét (không thuộc `TEP_LOI_VAO_MAU` và `THU_MUC_MAU`) có `ImportDeclaration`, `ExportDeclaration.moduleSpecifier`, `import()` hay `require()` với chuỗi khớp `/okr-mau\/(nap|lenh)(\.ts)?$/`.
- [ ] Trong `soiChiThem`: lời gọi tạo/sửa trên `okrSoChup` khớp `MIEN_BO_MAU` (tệp, `hamBaoQuanh`, lối) và chốt chung đạt → đẩy vào `mien`; riêng `deleteMany` còn kiểm C1 trên đối số (object có `where` là object có khoá `keyResultId`); C1 vỡ → câu ghim C1 + vi phạm cũ.
- [ ] `caChiThem(thay)` in dòng chốt trước, dòng `mien` xen giữa dòng `tao` theo thứ tự tệp; câu ghim chốt vào `hong`.
- [ ] Đọc `--thay` lặp lại thành `Map`; vai không có trong tập tệp quét → «KHONG DO DUOC: --thay <vai> khong phai tep duoc soi», exit 2.
- [ ] Verify: `bun _acceptance/so-okr-tu-chay/rang/soi-ma.mjs --ca chi-them` → exit 0, dòng chốt bốn `dat`, hai dòng `mien`; `--chieu-do` → `2/2`, exit 1; phá-thử tay một ca C3 bằng `--thay` → exit 1 với câu ghim.
- [ ] Commit.

### Task 2: `rang/xanh.mjs` (E1)

**Files:** Create `_acceptance/mien-so-chup-bo-okr-mau/rang/xanh.mjs`. **Consumes:** lệnh E8 từ config (regex dòng `sot_soi_chi_them:`).

- [ ] Đọc lệnh; chạy `bash -c <lệnh>` ở gốc kho; tách stdout; rút d1/d2 bằng dòng chứa `okrSoChup.createMany` / `okrSoChup.deleteMany` trong `nap.ts` (đúng một mỗi chuỗi, khác → exit 2).
- [ ] Khẳng định từng điều theo `expected` E1, in `dat|HONG <điều>`; exit 1 nếu có HONG.
- [ ] Verify: chạy → exit 0; phá-thử bằng tạm sửa kỳ vọng d1 (+1) trong bản sao script ở `tmpdir` → exit 1 «HONG».
- [ ] Commit.

### Task 3: `rang/do-mien.mjs` (E2, E3, E4)

**Files:** Create `_acceptance/mien-so-chup-bo-okr-mau/rang/do-mien.mjs`.

- [ ] Khung chung: đọc lệnh E8 từ config; `chay(thay)` → `{ma, ra}`; `banSao(vai, bienDoi)` chép tệp vào `mkdtempSync`, áp `bienDoi(chu)` trả `{chu, moc}` (moc = chuỗi duy nhất để tính dòng); bienDoi không thay đổi gì → ném «BIEN DOI KHONG AP: <ô>».
- [ ] Đối chứng dương rồi ma trận: `--ca ngoai` mười ô n1…n10, `--ca chot` mười ba ô c1a…c4d, `--ca cu` ba lệnh; mỗi ô kiểm mã, câu ghim (dòng tính trên bản sao), tập dòng `mien`, dòng chốt.
- [ ] Verify: ba ca chạy → exit 0, in `ngoai: 10/10`, `chot: 13/13`, `cu: 3/3`; phá-thử: tạm bỏ C3 khỏi thước trong bản sao (`--thay` không áp cho thước) — thay vào đó chạy `do-mien.mjs --thuoc <bản sao thước đã bỏ một chốt>` để chứng ô lọt in `LOT`.
- [ ] Commit.

### Task 4: Văn bản bốn nơi + `rang/van-ban.mjs` (E5, E6)

**Files:** Modify `_acceptance/so-okr-tu-chay/contract.md` (AC-4, AC-14, Notes), `_acceptance/so-okr-tu-chay/evals.yaml` (E8 expected), `_acceptance/so-okr-tu-chay/decisions.jsonl` (một dòng `revisit`), `docs/api.md` (đoạn 811–820). Create `_acceptance/mien-so-chup-bo-okr-mau/rang/van-ban.mjs`.

- [ ] Sửa câu theo §6 thiết kế.
- [ ] `van-ban.mjs`: `kiem({hopDong, evals, docs, thuoc})` trả danh sách thiếu; chạy trên tệp hiện tại (phải rỗng) và trên `git show 9c65f368:<tệp>` (phải khác rỗng, kèm câu ghim); exit 0 chỉ khi cả hai đúng.
- [ ] Verify: exit 0; in các câu thiếu của bản cũ.
- [ ] Commit.

### Task 5: `rang/pham-vi.mjs` (E7)

**Files:** Create `_acceptance/mien-so-chup-bo-okr-mau/rang/pham-vi.mjs`.

- [ ] (i) `git log --no-merges --name-only --format=@@%H -- _acceptance/mien-so-chup-bo-okr-mau`; (ii) merge-base với `origin/onehub` ≠ HEAD → `git diff --name-only`; phân loại `/^(apps|packages)\//`; đối chứng âm `git show --name-only --format= e3e2f252f`.
- [ ] Verify: exit 0; danh sách tệp in ra không có `apps/`.
- [ ] Commit.

### Task 6: Cổng kho

- [ ] `bun run lint`, `bun run lint:slop`, `bun run check-types` (thước không thuộc gói nào nhưng lint quét `_acceptance/**/rang`? kiểm), `bun run test` chạy bởi pre-push.
- [ ] Commit, set contract `status: implemented`, dispatch S4.
