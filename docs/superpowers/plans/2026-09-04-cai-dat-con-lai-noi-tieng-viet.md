# Cài đặt còn lại nói tiếng Việt — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 33 file của năm cụm Cài đặt đọc tiếng Việt; mọi đoạn mã người chép giữ nguyên từng byte so với nguồn ngoài màn; một bộ thước dùng chung với đợt một, không chép.

**Architecture:** Thứ tự giữ nguyên của đợt một — **đo đỏ trước, dịch sau, sinh bảng đóng từ cây đã dịch**. Bốn bộ quét đợt một nhận `--lat`; `rang/` đợt này chỉ có bản khai, mũi gọi, vết đột biến, và các chân màn mới. Ba lớp mới (đoạn mã người chép, ma trận OAuth, cần gạt `khong_quet`) mỗi lớp một chân.

**Tech Stack:** TypeScript compiler API · Node ESM · puppeteer-core + Chrome · bun test.

**Spec:** `docs/superpowers/specs/2026-09-04-cai-dat-con-lai-noi-tieng-viet-design.md` · **Contract:** `_acceptance/cai-dat-con-lai-noi-tieng-viet/contract.md` (17 AC) · **Evals:** 19.

## Global Constraints

- Không chú thích trong code. `/packages/ui` là nguồn duy nhất của UI — vòng không sửa component.
- Kho chuỗi: nối vào `apps/app/lib/messages/settings.ts` hiện có; `const vi satisfies SettingsMessages`; hàm ghép biến nhận `string`.
- Client: `settingsMessages(useLocale())` với `useLocale` từ `@crm/ui/components/locale-provider`. Server: `getLocale()` từ `@/lib/locale/server`; `export const metadata` → `generateMetadata`.
- Mọi giá trị `vi` mang dấu, trừ miễn trừ có tên trong `KHONG_DAU`. Hàm ghép biến phải có dòng `GHIM`.
- `translate="no"` cho thương hiệu, dữ liệu người nhập, và đoạn mã người chép.
- Danh từ theo `CONTEXT.md`: công ty · cá nhân · thoả thuận. `"Comp AI"` trong văn mô tả → **OneHub** (quyết định tạm làn V, người veto ở Cổng 2).
- Bề rộng ghim 360px. Chứng minh: `bun run db:test && bun run test` · `check-types` · `lint` · `lint:slop`.
- **Không chép logic quét** từ `_acceptance/man-cai-dat-noi-tieng-viet/rang/` sang `rang/` đợt này.

---

### Task 1: Bốn bộ quét đợt một nhận `--lat`, mặc định giữ nguyên hành vi

**Files:** Modify `_acceptance/man-cai-dat-noi-tieng-viet/rang/{lat,moi-chuoi,chu-cung-lat,chu-ngoai-jsx,khai-sinh}.mjs`

**Interfaces:** `lat.mjs` export `lat(duongKhai?)`; mỗi script đọc `--lat <abs>` từ argv, mặc định `join(HERE, "lat-cai-dat.json")` — theo thư mục script, KHÔNG theo `cwd`. Các bản khai phụ (toast, tieu-de, khong-du-quyen, khong-phai-chu-nguoi-doc) tìm **cạnh bản khai `--lat`**, không cạnh script.

- [ ] Step 1: `lat.mjs` — `export function lat(khai = join(HERE, "lat-cai-dat.json"))`; đọc JSON từ `khai`; `GOC` không đổi.
- [ ] Step 2: Mỗi script: `const KHAI_PATH = argv["--lat"] ?? join(HERE, "lat-cai-dat.json")`; `const KHAI_DIR = dirname(KHAI_PATH)`; mọi `readFileSync(\`${HERE}/toast-cua-lat.json\`)` → `${KHAI_DIR}/...`.
- [ ] Step 3: **Tái lập đợt một không tham số** — chạy `cd $ROOT && node .../chu-cung-lat.mjs && node .../chu-ngoai-jsx.mjs --chan toast && node .../khai-sinh.mjs`: exit 0, output chứa `10 file`, `12/12`, `9 o nhan`. Đây là E17 vế 2; lệch là Task 1 chưa xong.
- [ ] Step 4: Commit `test(acceptance): bốn bộ quét nhận --lat, mặc định giữ hành vi đợt một`.

### Task 2: Bản khai đợt hai + neo + khoá cần gạt

**Files:** Create `_acceptance/cai-dat-con-lai-noi-tieng-viet/rang/lat-cai-dat-2.json`; Modify `khai-sinh.mjs` (đợt một, chân `dan-so`).

- [ ] Step 1: JSON: `thu_muc` = 10 thư mục (settings/{tracking,connections,connections/slack,connections/slack/people,connections/google,connections/microsoft,connections/intake,api-keys,members,sso}); `neo: { file: 33, route: 10, file_vat_chep: 6, file_quyen: 9 }`; `khong_quet: []`; `mien_tru: []`.
- [ ] Step 2: `khai-sinh --chan dan-so`: đọc `neo`; `soTuDia !== neo.file` → exit 2 kèm diff tên file (so với danh sách tìm bằng `find` độc lập trong chính chân). Rồi: với MỖI file trong `khong_quet`, chạy `moi-chuoi` lên riêng file đó; còn tiếng Anh → exit 1 `LOAI TRU CHE GIAU: <file>`.
- [ ] Step 3: Chứng: `node khai-sinh.mjs --lat <cd2> --chan dan-so` → 33 file khớp neo. Thêm một file `.tsx` tiếng Anh tạm rồi khai nó vào `khong_quet` trên bản sao JSON → chân đỏ gọi tên file. Dọn.
- [ ] Step 4: Commit.

### Task 3: Đo đỏ trước khi dịch — con số dân số thật

- [ ] Step 1: `node moi-chuoi.mjs --lat <cd2>` → ghi con số N chuỗi vào `_acceptance/cai-dat-con-lai-noi-tieng-viet/evidence/S3-dan-so-truoc-dich.txt`. Đây là dân số thật, thay cho 242+20+7 sơ bộ.
- [ ] Step 2: `chu-ngoai-jsx --lat <cd2> --chan toast` với bảng toast RỖNG → thoát mã 2 và in `THUA` cho mọi lời gọi mang chữ: đó là **bảng toast nháp** (file, dòng, chuỗi gốc). Lưu để Task 5 ghép khoá.
- [ ] Step 3: Commit evidence.

### Task 4: Kho chuỗi + nối 33 file

**Files:** Modify `apps/app/lib/messages/settings.ts`; 33 file dưới `settings/`.

`independent: true` giữa năm cụm SAU khi kho chuỗi đã commit (Step 2). Fan-out `execute-parallel` với 5 task con: tracking (8) · connections (16) · api-keys (4) · sso (3) · members (2). Mỗi task con: chỉ `sửa file trong cụm mình`, `KHÔNG sửa settings.ts` — thiếu khoá thì báo về, không tự thêm.

- [ ] Step 1: Kho chuỗi — năm nhóm `theoDoi` · `ketNoi` (gốc, slack, google, microsoft, intake) · `khoaApi` · `sso` · `thanhVien`, khoá cho MỌI chuỗi trong output Task 3. Câu ghép số nhiều `${n===1?"is":"are"}` → một hàm `(danhSach: string) => \`${danhSach} đã cắm rồi.\``. `"Comp AI reads…"` → `"OneHub đọc danh sách kênh từ Slack sau khi cắm."`.
- [ ] Step 2: `check-types` xanh (`satisfies` bắt khoá thiếu/thừa). Commit kho chuỗi RIÊNG trước khi fan-out.
- [ ] Step 3: Fan-out 5 cụm. Mỗi cụm: import, `const t`, thay literal → `t.x.y`; 7 `export const metadata` → `generateMetadata`; `translate="no"` cho thương hiệu, dữ liệu người nhập, và **mọi phần tử `code`/`pre`/ô chép**.
- [ ] Step 4: Gộp. `moi-chuoi --lat <cd2>` → 0 (trừ giữ-nguyên có tên). `check-types` · `lint` · `lint:slop` xanh.
- [ ] Step 5: Commit `feat(app): năm cụm Cài đặt đọc chữ từ kho chuỗi`.

### Task 5: Bảng đóng sinh từ cây đã dịch

**Files:** Create trong `rang/` đợt hai: `toast-cua-lat.json` (file, khoá) · `tieu-de-cua-lat.json` (so_o 7) · `khong-du-quyen.json` (file, khoá, co_khi) · `oauth-ma-tran.json` (20 ô) · `khong-dich-cua-lat.json` · `doan-ma-chep.json` (route, selector, tên, `nguon`: db-template | api-tao | cau-hinh) · `du-lieu-nguoi-nhap.json` (file, trường) · `khong-phai-chu-nguoi-doc.json` (chép cấu trúc từ đợt một, hai danh sách tách).

- [ ] Step 1: Toast — từ AST: mọi `toast.*(t.X.Y…)` → dòng (file, "X.Y"). Chạy chân toast → khớp cả hai chiều.
- [ ] Step 2: OAuth — kê 20 ô từ mã `connections/**`: khoá thật, hoặc `dung_chung: "<ô>"`, hoặc `khong_ton_tai: "<lý do>"`.
- [ ] Step 3: Đoạn mã chép — ≥1 dòng cho mỗi trong 6 file; mỗi dòng ghi `nguon` và cách lấy nguồn (`db-template`: SQL lấy site token → template; `api-tao`: tRPC `apiKeys.create` trả về; `cau-hinh`: `.env`/DB).
- [ ] Step 4: Commit.

### Task 6: Chân màn — `man-that.mjs` đợt hai

**Files:** Create `rang/man-that.mjs` (chân: `hai-tieng` · `khong-dich` · `du-lieu-nguoi-nhap` · `be-rong` · `trang-thai-rong` · `oauth` · `doan-ma-chep`). Dựa trên `man-that.mjs` đợt một về cách lái Chrome — **không chép**: import các helper (`dungTrang`, `gomChuoi`, `doBeRong`) sau khi tách chúng ra `_acceptance/man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs` (Task 6 Step 0, sửa đợt một tối thiểu, E17 vế 2 phải còn xanh).

- [ ] Step 0: Tách helper ra `man-that-lib.mjs`; đợt một import lại; chạy lại `hai-tieng` đợt một → 160 cặp, hỏng=0.
- [ ] Step 1: Route list: `readdirSync` đệ quy `settings/` tìm `page.tsx`, bỏ hai route đợt một, bỏ route trong `khong_dung_duoc` của bản khai (kèm lý do). In `route đo được / route sinh ra`.
- [ ] Step 2: `hai-tieng`, `khong-dich`, `be-rong`: cùng luật đợt một, chạy trên mọi route.
- [ ] Step 3: `trang-thai-rong`: 6 câu; in hai danh sách dựng được / không.
- [ ] Step 4: `oauth`: đọc ma trận; đếm màn + mã + không-tồn-tại = 20.
- [ ] Step 5: `du-lieu-nguoi-nhap`: chân mã (AST) trên bảng (file, trường) + chân màn: tạo một khoá API qua tRPC, thêm một tên miền; in gieo được / không.
- [ ] Step 6: `doan-ma-chep`: với từng dòng — lấy `nguon` (DB/API/config) → chuỗi kỳ vọng; dựng route, đọc `textContent` của selector ở lượt `vi` VÀ lượt `en`; so **từng lượt với nguồn**, không so hai lượt với nhau; byte lệch đầu tiên in ra; kiểm `translate="no"`. Khoá API: tạo qua tRPC, giữ giá trị, mở dialog, so.
- [ ] Step 7: Chạy cả bảy; chân nào exit 2 ghi tiền đề thiếu vào `evidence/`.
- [ ] Step 8: Commit.

### Task 7: Đột biến đợt hai

**Files:** Create `rang/dot-bien.mjs` — import `chayHet`/`vetTay` từ đợt một? KHÔNG: đợt một chưa tách. Tách `dot-bien-lib.mjs` ở đợt một (chạy vết, so `git status`, chỉ tính mã 1) — đợt hai chỉ khai VET.

- [ ] Step 1: Tách lib ở đợt một; đợt một vẫn 11 vết xanh.
- [ ] Step 2: VET đợt hai: JSX · title · thuộc tính · từ đơn · mảng lựa chọn · toast đổi khoá · toast giữ khoá thêm chuỗi · xoá khối `canManage` · **sửa template thẻ script dùng chung một ký tự → E16 (`doan-ma-chep`) phải mã 1**.
- [ ] Step 3: Chạy; cây trả nguyên trạng. Commit.

### Task 8: Một bộ thước — E17

**Files:** Create `rang/mot-bo-thuoc.mjs`.

- [ ] Step 1: Vế 1 — với mọi cặp `.mjs` (rang đợt một × rang đợt hai): tách thân hàm bằng AST, chuẩn hoá khoảng trắng, khối trùng ≥12 dòng → đỏ kèm hai tên file. Chiều đỏ: chép `man-that-lib.mjs` vào rang đợt hai → đỏ. Xoá.
- [ ] Step 2: Vế 2 — chạy ba mũi gọi đợt một không tham số; parse `10 file`, `12/12`, `9 o nhan`; lệch → đỏ.
- [ ] Step 3: Commit.

### Task 9: Ổ cắm + bộ canh + `implemented`

- [ ] Step 1: `_acceptance/config.yaml`: 17 ổ `cd2_*` trỏ đúng lệnh (`--lat` abs qua `$PWD`).
- [ ] Step 2: `messages-guard.spec.ts`: `KHONG_DAU` cho từ mượn (Slack, OAuth, URL…); `GHIM` cho mọi hàm ghép biến mới. 27+ pass.
- [ ] Step 3: Đối chiếu ổ cắm ↔ evals: không `THIEU`. Contract `status: implemented`. Commit → dispatch S4.

## Self-Review

**Spec coverage:** AC-1→T6 · 1b→T1/T4 · 2→T5 · 3→T5 · 4→T5 · 5→T6 · 5b→T5/T6 · 6/6b→T5/T6 · 7→T7 · 8→T1/T2 · 9→T2 · 10/10b→T6 · 11→T1/T4 · 12→T5/T6 · 13→T8. Không AC nào không có task.
**Type consistency:** `lat(khai?)`, `--lat` abs, `KHAI_DIR` dùng nhất quán T1/T2/T5/T6. Bảng JSON tên nhất quán T5/T6/T7.
**Thứ tự có chủ ý:** T3 đo đỏ trước T4 dịch; T5 sinh bảng SAU T4 để ghim khoá thật; T6 Step 0 và T7 Step 1 sửa đợt một tối thiểu và mỗi lần đều chạy lại đợt một để E17 vế 2 canh.
