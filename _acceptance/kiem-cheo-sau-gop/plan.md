# kiem-cheo-sau-gop Implementation Plan

> **For agentic workers:** thực thi tuần tự trong phiên chính (feature-loop T2, S3). Steps dùng checkbox.

**Goal:** lượt đêm `scripts/kiem-cheo/dem.mjs` kiểm một lần mọi lần gộp vào onehub từ mốc trước, gọi tên lần gộp làm đỏ eval của hồ sơ đã ký, chỉ báo.

**Architecture:** hàm thuần nhỏ (rút tập, mốc, đọc dòng làn, phân loại, báo) + một điểm vào điều phối khoá, cây riêng, làn của kit qua `resolve-plugin.mjs`. Mọi hằng ở `scripts/kiem-cheo/cau-hinh.mjs` (`KIEM_CHEO`). Kiểm bằng `node --test` trên kho git giả trong thư mục tạm.

**Tech Stack:** Node 24 ESM (`.mjs`), `node:test`, git CLI, launchd.

**Spec:** `_acceptance/kiem-cheo-sau-gop/design.md` · `contract.md` · `evals.yaml`

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md). Hằng chỉ ở `cau-hinh.mjs`, đơn vị suy từ `MS_MOI_PHUT`.
- Không chép kit vào kho; làn gọi qua `node scripts/resolve-plugin.mjs --plugin feature-loop --require scripts/repin-lane.mjs`.
- Không gọi model/AI Gateway.
- Ghi `xin/*.json` và `yeu-cau/*.json` bằng tệp tạm cùng thư mục rồi `rename` (luật 29).
- Không ghi vào cây nơi lệnh được gọi; mọi thứ của lượt ở `.acceptance-runs/kiem-cheo/`.
- Mẫu dòng làn (từ lượt thật 08/10, feature-loop 2.24.0):
  `[lane] suite <i>/<n>: <lệnh> → exit <mã> (<giây>s)` · `[lane] <slug> <E>: <lệnh> → exit <mã> (<giây>s)` · `[lane] TỔNG KẾT — …`.

## Review Focus

1. Làn thật in khuôn khác mẫu (kit nâng bản) → bộ đọc không thấy eval đỏ, đêm nào cũng xanh. Ghim: Task 2 ca phiên bản lệch.
2. Hồ sơ vào trong khoảng `T..D` rồi bị làm đỏ → không được xếp «đỏ sẵn». Ghim: Task 4 ca `chuaCoOT`.
3. launchd chạy với PATH tối thiểu → không thấy bun. Ghim: Task 7 ca `env -i`.
4. Lượt lỗi giữa chừng (fetch, dựng cây, vượt trần) → khoá vẫn trả, có báo, mốc không tiến. Ghim: Task 6 ca lỗi + E3 (f)(i).
5. Đơn xin đọc dở bởi bộ phát lịch → ghi tệp tạm rồi đổi tên. Ghim: Task 3 ca «không lúc nào có tệp đơn rỗng».

---

### Task 1 (independent: false): `cau-hinh.mjs`, `tap-cham.mjs`, `moc.mjs` — phục vụ E1 (a)(b)(e)(j)

**Files:** Create `scripts/kiem-cheo/cau-hinh.mjs`, `tap-cham.mjs`, `moc.mjs`, `test/kho-gia.mjs` (dựng kho git giả: onehub với merge first-parent M1..Mk, nhánh nháp), `test/tap-cham.test.mjs`, `test/moc.test.mjs`.

**Interfaces — Produces:**
- `KIEM_CHEO = { gio: {gio:1, phut:0}, mocSauGio: 20, tranLuotPhut: 90, choKhoaToiDaPhut, thuMuc: ".acceptance-runs/kiem-cheo", phien: "kiem-cheo", slug: "kiem-cheo-sau-gop", nhanhChinh: "onehub", nhan: "vn.onehub.crm.kiem-cheo", ... } as const`
- `duongCua(text): string[]`, `khuon(glob): RegExp`, `tapCham({goc, tepDoi}): {slug, so}[]` — `signed-off`/`machine-cleared`, bỏ tệp `_acceptance/`.
- `docMoc(goc): {sha, luc} | {loi}`, `ghiMoc(goc, {sha, luc})`, `lanGop(git, tu, den): string[]` (first-parent merges, cũ → mới), `tepDoi(git, tu, den): string[]`, `canMoc({lucTruoc, now, lanGop, ngayCua}): string|null`.

- [ ] Viết test (a)(b)(e)(j) theo ma trận E1 → chạy `node --test scripts/kiem-cheo/test/` → đỏ (module thiếu).
- [ ] Viết mã tối thiểu → xanh. Phá thử: bỏ lọc `_acceptance/` → ô (b) đỏ ghim thông điệp; hoàn lại.
- [ ] Commit.

### Task 2 (independent: true): `doc-lan.mjs` + mẫu dòng thật — phục vụ E1 (k)

**Files:** Create `scripts/kiem-cheo/doc-lan.mjs`, `scripts/kiem-cheo/fixtures/lan-that.txt` (dòng 1: `# feature-loop 2.24.0 · lượt repin-20261008T051302Z-97985 · soan-okr-cung-tro-ly`; rồi trích nguyên văn các dòng `[lane]` của lượt đó, thêm một dòng eval `→ exit 1` lấy nguyên văn từ một `repin-do` thật nếu có, nếu không thì giữ toàn bộ dòng thật và tạo ca đỏ bằng cách đổi mã trong bộ nhớ của test), `test/doc-lan.test.mjs`.

**Interfaces — Produces:** `docLan(text): {suite: {i, lenh, ma}[], eval: {slug, id, lenh, ma}[]}`; `phienBanFixture(text): string`; `phienBanDangCai(goc): string` (qua `resolve-plugin.mjs`, đọc `.claude-plugin/plugin.json`).

- [ ] Test: rút đủ 7 suite + 25 eval của fixture với đúng mã; dòng đổi mã 1 → eval đỏ đúng slug/E/lệnh; phiên bản fixture ≠ phiên bản đang cài → test đỏ thông điệp «mau dong lan cu: <a> != <b>». Đỏ → mã → xanh → commit.

### Task 3 (independent: false): `khoa.mjs` + `lich.mjs` đọc `moc` của đơn — phục vụ E1 (f)(g), E2

**Files:** Create `scripts/kiem-cheo/khoa.mjs`, `test/khoa.test.mjs`. Modify `scripts/dieu-phoi/lich.mjs:9` (`d.moc ?? mocCua(hangViec, d.slug)`), `scripts/dieu-phoi/test/lich.test.mjs` (ca mới E2).

**Interfaces — Produces:** `dotSong(goc): {thuMuc} | null` (đợt có `phat-lich.pid` còn sống, chọn đợt mới nhất); `layKhoa({goc, moc, cay, now, choMs, nghiMs}): {loai:"dot"|"tay", tra(): void} | {ban: true, chu}`.

- [ ] Test (f)(g) + lich (đơn có `moc` lên trước; đối chứng bỏ `moc`). Ghi tệp tạm: test theo dõi thư mục `xin/` trong lúc ghi — không lúc nào có `kiem-cheo-s4.json` rỗng. Đỏ → mã → xanh → commit.

### Task 4 (independent: false): `thu-pham.mjs` — phục vụ E3 (b)(c)(d)(g)

**Files:** Create `scripts/kiem-cheo/thu-pham.mjs`, `test/thu-pham.test.mjs`.

**Interfaces — Consumes:** `lanGop`. **Produces:** `phanLoai({lenh, D, T, lanGop, chay, coOT}): Promise<{loai:"chap-chon"|"do-san"|"do-moi", lan_gop?}>` — `chay(sha, lenh) → mã`; `coOT(sha) → bool` (hồ sơ/eval có ở sha); tìm nhị phân tìm lần gộp đầu tiên đỏ.

- [ ] Test bằng `chay` giả theo sha: đỏ từ M2 → `do-moi` M2; đỏ từ T → `do-san`; đỏ lần đầu xanh lần hai → `chap-chon`; hồ sơ vào ở M1, đỏ từ M2 → `do-moi` M2 (đối chứng có từ T, đỏ từ T → `do-san`); số lần gọi `chay` ≤ ⌈log2 k⌉ + 3. Đỏ → mã → xanh → commit.

### Task 5 (independent: true): `bao.mjs` — phục vụ E1 (h)

**Files:** Create `scripts/kiem-cheo/bao.mjs`, `test/bao.test.mjs`.

**Interfaces — Produces:** `bao({goc, ketQua, dot, thongBao}): {tep, yeuCau?}` — ghi `<ngày>.json`; `do`/`khong-chay-duoc`/`loi` → có đợt: `yeu-cau/kiem-cheo-<n>.json` loai `can-nguoi` (tệp tạm + rename), không đợt: `thongBao(tieuDe, noiDung)` (mặc định `osascript -e 'display notification …'`).

- [ ] Test (h) đủ khoá, đếm tệp/lần gọi. Đỏ → mã → xanh → commit.

### Task 6 (independent: false): `dem.mjs` + răng `pha-thu.mjs` — phục vụ E1 (c)(d), E3

**Files:** Create `scripts/kiem-cheo/dem.mjs`, `test/dem.test.mjs`, `_acceptance/kiem-cheo-sau-gop/rang/pha-thu.mjs`, `_acceptance/kiem-cheo-sau-gop/rang/lan-gia.mjs`.

**Interfaces — Consumes:** mọi module trên. **Produces:** CLI `node scripts/kiem-cheo/dem.mjs [--tu <sha>] [--nhanh <ref>] [--goc <dir>]`; biến thử `KIEM_CHEO_LAN` (đường làn thay), `KIEM_CHEO_DUNG_CAY` (lệnh dựng cây thay), `KIEM_CHEO_TRAN_PHUT`, `KIEM_CHEO_THONG_BAO` (lệnh thông báo thay).

Luồng theo design §Luồng; mọi nhánh lỗi đi qua `bao` với `loi`; `finally` gỡ cây, trả khoá; trần lượt dừng cả nhóm tiến trình (`spawn` với `detached: true`, `process.kill(-pid, …)`).

- [ ] Test (c)(d) trên kho giả. `lan-gia.mjs` in dòng theo đúng mẫu của `fixtures/lan-that.txt` (đọc khuôn từ chính fixture), ghi argv, chạy thật lệnh eval trong cwd của nó. `pha-thu.mjs` chạy ô (a)–(i) của E3. Đỏ → mã → xanh. Phá thử: bỏ nhánh `coOT` → ô (g) đỏ; hoàn lại. Commit.

### Task 7 (independent: true): `cai.mjs` + script `package.json` — phục vụ E1 (i)

**Files:** Create `scripts/kiem-cheo/cai.mjs`, `test/cai.test.mjs`. Modify `package.json` (thêm `kiem-cheo:cai`, `kiem-cheo:go`, `kiem-cheo:chay`).

**Interfaces — Produces:** `plistCho({goc, bun, path, nhan, log}): string`; CLI `cai|go` với `HOME`, `KIEM_CHEO_LAUNCHCTL` thay được.

- [ ] Test (i) kể cả `env -i` và đối chứng plist thiếu PATH. Đỏ → mã → xanh → commit.

### Task 8 (independent: true): khoá config + răng ranh giới — phục vụ E4

**Files:** Modify `_acceptance/config.yaml` (chỉ thêm `kcs_don_vi`, `kcs_lich` dưới `executors.test`; `kcs_pha_thu`, `kcs_ranh_gioi` dưới `executors.script`). Create `_acceptance/kiem-cheo-sau-gop/rang/ranh-gioi.mjs`.

- [ ] Răng (a)(b)(c) + hai chiều đỏ trên bản sao tạm. Đỏ → mã → xanh → commit. Contract → `implemented`.

### Task 9 (sau Cổng 2, cùng PR): chuyển lời hứa `tra-loi-tin-nhac`

**Files:** Modify `_acceptance/tra-loi-tin-nhac/contract.md` (AC-9 theo nguyên văn ở Notes của hợp đồng này), `_acceptance/tra-loi-tin-nhac/evals.yaml` (E11 `status: not-run`, `superseded_by: kiem-cheo-sau-gop#AC-6`, bỏ `inputs` trỏ `ho-so-cham.mjs`). Delete `_acceptance/tra-loi-tin-nhac/rang/ho-so-cham.mjs`.

- [ ] Sửa → `pre-merge-check.sh` có/không `--slug` → xin khoá ghim lại → làn `--write` cho `tra-loi-tin-nhac` → commit → bản đồ trên bản sạch → `--check` → đẩy.
