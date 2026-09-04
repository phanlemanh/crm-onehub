# Thước của lát ③a có răng — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mỗi phép đo nghiệm thu của vòng ③a phải chứng minh nó ĐỎ ĐƯỢC, và chứng minh lại điều đó ở mỗi lượt chạy.

**Architecture:** Bảy bản vá chân đo, cộng một **sổ khai sinh** (`rang/khai-sinh.json`) và một **chân canh sổ** (`rang/khai-sinh.mjs`) chạy cả hai chiều của từng chân ngay trong lượt chạy đó. Dân số của sổ suy từ **file có thật** trong `rang/` cộng `messages-guard.spec.ts`, trừ một bản khai miễn trừ dùng chung với `khong-may-quet.sh`; bánh cóc hai chiều canh chính bản khai đó.

**Tech Stack:** Node ESM (`.mjs`), bash, `bun test`, puppeteer-core + Chrome, tRPC qua `fetch`, `git worktree`.

**Spec:** `docs/superpowers/specs/2026-09-04-thuoc-cua-lat-3a-co-rang-design.md`
**Hợp đồng:** `_acceptance/thuoc-cua-lat-3a-co-rang/contract.md` (13 tiêu chí, duyệt `978b5bc`)
**Phép đo:** `_acceptance/thuoc-cua-lat-3a-co-rang/evals.yaml` (14 cái)

## Global Constraints

- **KHÔNG đổi một chuỗi sản phẩm nào.** Không sửa `apps/app/lib/messages/*.ts`, không sửa chữ trong JSX. Bản dịch của ③a đã xong và đang xanh. Chân có răng mà phát hiện chuỗi thiếu thì việc đó đi vòng ③a lượt 9.
- **Không viết chú thích trong code** (`AGENTS.md`). Không trailer `Co-Authored-By` trong commit.
- **Mã thoát 2 = không đo được** (hạ tầng, tập rỗng, workspace không giải được), kèm nguyên nhân gọi được tên. **Mã thoát 1 = vật hỏng.** **Mã thoát 0 = đạt.** Hạ tầng hỏng KHÔNG BAO GIỜ ra 0.
- **Luật khai sinh:** mọi phép đo mới hay sửa chỉ tính XONG khi có cặp hai chiều trên CÙNG một fixture — vật lành thước im, phá vật thật thước đỏ với **thông điệp ghim**. `verify` của task phải chứa lượt phá-thử, không chỉ lượt xanh.
- **Véc-tơ phá mặc định:** phục vụ đúng trang đó ở `lang=en` trên cùng máy chủ (`d-…-11024`). Ngoại lệ đã khai: E1 không dùng được nó (bảy giai đoạn cố ý ở lại tiếng Anh).
- **Định danh trong code mới viết bằng tiếng Anh.** Kho đã có nợ định danh tiếng Việt (`handoff.md`); đừng đào sâu thêm. File và chân đo giữ tên tiếng Việt hiện có.
- **Không dùng `git checkout --` để dọn cây.** Nó khôi phục về HEAD và đã làm mất cả một buổi chiều dịch.
- **`git status --porcelain` có output vẫn thoát 0** — luôn kiểm bằng `[ -z "$(git status --porcelain <path>)" ]`.
- **Trần thời gian của Bash là 600 giây.** `dot-bien.mjs` chạy ~20 phút nên LUÔN chạy nền.
- **Trước khi tin bất kỳ con số nào:** `ps ax | grep next` xem máy chủ dev chạy từ thư mục nào. Máy chủ ở `:3000`/`:3001` có thể đang chạy từ kho gốc `/Users/manhphan/dev/crm`, không phải cây làm việc này. Cây làm việc thì dựng máy chủ riêng:
  ```bash
  cd apps/api && bun run dev
  cd apps/app && PORT=3100 API_URL=http://localhost:3001 APP_URL=http://localhost:3100 bun run dev
  ```
  rồi chạy chân đo với `APP_URL=http://localhost:3100`.
- **Cây phải sạch trước khi chạy chân đột biến.**
- Bốn cổng máy chạy cuối mỗi task đụng `apps/**`: `bun run db:test && bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop`.

## File Structure

| File | Trách nhiệm |
| --- | --- |
| `rang/danh-sach-chan.json` | **MỚI.** Bản khai duy nhất: chân nào là phép đo nghiệm thu, chân nào được miễn và vì sao. Dùng chung bởi `khai-sinh.mjs`, `khong-may-quet.sh`, `mien-tru.mjs`. |
| `rang/mien-tru.mjs` | **MỚI.** Bánh cóc hai chiều trên ba bản khai miễn trừ. |
| `rang/khai-sinh.json` | **MỚI.** Sổ khai sinh: mỗi chân một mục (véc-tơ phá · thông điệp ghim · mã thoát), cộng mục `daXoa` cho chân đã gỡ. |
| `rang/khai-sinh.mjs` | **MỚI.** Chân canh sổ. Ba chân con: mặc định · `--chan so` · `--chan tap-rong`. |
| `rang/khai-tieng.mjs` | Sửa: enum thật thay hằng gõ tay; tập rỗng thoát 2. |
| `rang/may-chu-ve.sh` | Sửa: quan hệ hai vế; dùng `danh-sach-chan.json`? không — chỉ sửa khẳng định. |
| `rang/no-vong-1.mjs` | Sửa: ghim bản dịch; vắng hai bên thoát 2. |
| `rang/ban-ve.mjs` | Sửa hai chỗ: `<time>` thật (chân `dong-thoi-gian`); bánh cóc bề mặt (chân `ba-man`). |
| `rang/be-mat.mjs` | Sửa: mỗi bề mặt khai thêm `dauHieu` để đối chiếu với bề mặt trang mời ra. |
| `rang/du-lieu-bien.mjs` | Sửa: đọc chữ trên màn; phần đếm hàng thành tiền đề thoát 2. |
| `rang/dot-bien.mjs` | Sửa: đột biến trong **cây sao**, không đụng cây làm việc; thêm chân `khoanh-vung`. |
| `rang/khong-may-quet.sh` | Sửa: đọc bản khai chung thay hai khối `case` gõ tay. |
| `apps/app/test/messages-guard.spec.ts` | Sửa: `song()` đòi đường đầy đủ; tự kiểm chạy đường đụng-tên. |

---

### Task 1: Bản khai chân đo dùng chung, và bánh cóc canh ba bản khai miễn trừ

**Phục vụ:** E9 (AC-9 — bánh cóc miễn trừ). Đặt nền cho E11/E12/E14.
**independent:** true — chỉ đọc file, không cần máy chủ, không cần trình duyệt.

**Files:**
- Create: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/danh-sach-chan.json`
- Create: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/mien-tru.mjs`
- Modify: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khong-may-quet.sh:14-22`
- Modify: `apps/app/test/messages-guard.spec.ts:36-60` (chỉ dời `KHONG_DAU`, không đổi nội dung)

**Interfaces:**
- Produces: `danh-sach-chan.json` với khuôn
  `{ "chanNghiemThu": [{ "ten": "khai-tieng.mjs" }, …], "mienTru": [{ "ten": "be-mat.mjs", "lyDo": "module dùng chung, không phải phép đo" }, …] }`
  — Task 10 (`khai-sinh.mjs`) đọc `chanNghiemThu` làm dân số.
- Produces: `mien-tru.mjs` thoát 0/1/2, in `DONG MIEN TRU CHET: <ban khai>:<dong>`.

- [ ] **Step 1: Kê bản khai hiện có, và chứng minh dòng chết đã biết**

```bash
cd /Users/manhphan/dev/crm/.claude/worktrees/sweet-leavitt-d88e70
ls _acceptance/nhan-ung-dung-noi-tieng-viet/rang/*.mjs _acceptance/nhan-ung-dung-noi-tieng-viet/rang/*.sh
ls _acceptance/nhan-ung-dung-noi-tieng-viet/rang/viet-tat.ts
```
Dòng cuối phải báo **không có file**. Đó là dòng miễn trừ chết đã biết tên (`viet-tat.ts` sống ở `_acceptance/tieng-viet-cho-crm/rang/`, và vòng lặp của `khong-may-quet.sh` chỉ duyệt `*.mjs` và `*.sh`). Ghi lại kết quả — nó là chiều đỏ có sẵn của task này.

- [ ] **Step 2: Viết `danh-sach-chan.json`**

Chín chân nghiệm thu (mọi `*.mjs`/`*.sh` trong `rang/` cộng bài kiểm khoá-chết, trừ phần miễn):

```json
{
  "chanNghiemThu": [
    { "ten": "khai-tieng.mjs" },
    { "ten": "may-chu-ve.sh" },
    { "ten": "no-vong-1.mjs" },
    { "ten": "ban-ve.mjs" },
    { "ten": "du-lieu-bien.mjs" },
    { "ten": "dot-bien.mjs" },
    { "ten": "chu-cung-jsx.mjs" },
    { "ten": "be-rong.sh" },
    { "ten": "khong-may-quet.sh" },
    { "ten": "mien-tru.mjs" },
    { "ten": "apps/app/test/messages-guard.spec.ts" }
  ],
  "mienTru": [
    { "ten": "be-mat.mjs", "lyDo": "module khai bề mặt ẩn, ban-ve.mjs nhập vào — không phải phép đo" },
    { "ten": "slug.mjs", "lyDo": "module suy slug workspace, mọi chân nhập vào — không phải phép đo" },
    { "ten": "lat.mjs", "lyDo": "đếm phạm vi lát, sinh số cho hợp đồng — không phải phép đo nghiệm thu" },
    { "ten": "phan-loai.mjs", "lyDo": "phân loại chuỗi để sinh số phạm vi — không phải phép đo nghiệm thu" },
    { "ten": "dem-pham-vi.mjs", "lyDo": "đếm phạm vi — không phải phép đo nghiệm thu" },
    { "ten": "kiem-ke.mjs", "lyDo": "kiểm kê khoá, sinh bảng đối chiếu — không phải phép đo nghiệm thu" },
    { "ten": "kiem-ban-dich.mjs", "lyDo": "đối chiếu bảng dịch với kho chuỗi — không phải phép đo nghiệm thu" },
    { "ten": "xuat-hinh.mjs", "lyDo": "xuất ảnh cho hồ sơ — không phải phép đo nghiệm thu" },
    { "ten": "khai-sinh.mjs", "lyDo": "chân canh sổ; nó tự khai sinh bằng chân con --chan so" }
  ]
}
```

**Chú ý:** không có dòng `viet-tat.ts`. Nó là dòng chết, và Step 6 chứng minh việc gỡ nó là hợp lệ.

- [ ] **Step 3: Viết `mien-tru.mjs` — chiều đỏ trước**

```js
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RANG = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(RANG, "../../..");

const banKhai = [];

function docDanhSachChan() {
  const p = join(RANG, "danh-sach-chan.json");
  if (!existsSync(p)) {
    console.log(`KHONG DO DUOC: thieu ban khai chan do tai ${p}`);
    process.exit(2);
  }
  return JSON.parse(readFileSync(p, "utf8"));
}

const danhSach = docDanhSachChan();

banKhai.push({
  ten: "danh-sach-chan.json",
  dong: danhSach.mienTru.map((m) => m.ten),
  song: (ten) => existsSync(join(RANG, ten)) || existsSync(join(GOC, ten)),
});

const guard = join(GOC, "apps/app/test/messages-guard.spec.ts");
const nguonGuard = readFileSync(guard, "utf8");
const khoiKhongDau = nguonGuard.match(/const KHONG_DAU = new Set\(\[([\s\S]*?)\]\);/);
if (!khoiKhongDau) {
  console.log("KHONG DO DUOC: khong tim thay khoi KHONG_DAU trong messages-guard.spec.ts");
  process.exit(2);
}
const khoaMienDau = [...khoiKhongDau[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const khoKhoa = readFileSync(join(GOC, "apps/app/lib/messages/crm.ts"), "utf8")
  + readFileSync(join(GOC, "apps/app/lib/messages/companies.ts"), "utf8")
  + readFileSync(join(GOC, "apps/app/lib/messages/contacts.ts"), "utf8")
  + readFileSync(join(GOC, "apps/app/lib/messages/deals.ts"), "utf8")
  + readFileSync(join(GOC, "apps/app/lib/messages/record-sheet.ts"), "utf8");
banKhai.push({
  ten: "messages-guard.spec.ts:KHONG_DAU",
  dong: khoaMienDau,
  song: (khoa) => {
    const la = khoa.split(".").pop();
    return new RegExp(`(^|[\\s{])${la}:`, "m").test(khoKhoa);
  },
});

const sot = join(RANG, "dot-bien-sot.txt");
const dongSot = readFileSync(sot, "utf8")
  .split("\n")
  .map((d) => d.trim())
  .filter((d) => d !== "" && !d.startsWith("#"));
banKhai.push({
  ten: "dot-bien-sot.txt",
  dong: dongSot,
  song: (khoa) => {
    const la = khoa.split(".").pop();
    return new RegExp(`(^|[\\s{])${la}:`, "m").test(khoKhoa);
  },
});

let chet = 0;
let tong = 0;
for (const bk of banKhai) {
  const chetCuaNo = bk.dong.filter((d) => !bk.song(d));
  tong += bk.dong.length;
  for (const d of chetCuaNo) console.log(`   DONG MIEN TRU CHET: ${bk.ten}:${d}`);
  console.log(`   ${bk.ten.padEnd(38)} ${bk.dong.length} dong, chet ${chetCuaNo.length}`);
  chet += chetCuaNo.length;
}

if (tong === 0) {
  console.log("KHONG DO DUOC: khong doc duoc dong mien tru nao — tap so rong");
  process.exit(2);
}

console.log(`ket qua: dong mien tru chet=${chet}/${tong}`);
process.exit(chet > 0 ? 1 : 0);
```

- [ ] **Step 4: Chạy nó — phải ĐỎ ngay lượt đầu**

```bash
node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/mien-tru.mjs; echo "EXIT=$?"
```
Kỳ vọng: `EXIT=1`, và **không** có dòng `DONG MIEN TRU CHET: danh-sach-chan.json:viet-tat.ts` (vì Step 2 đã không khai nó). Nếu có dòng chết nào khác ở `KHONG_DAU` hay `dot-bien-sot.txt` — ghi lại nguyên văn, đó là chiều đỏ thật của bản khai đã mục.

- [ ] **Step 5: Gỡ đúng những dòng chết mà lượt chạy vừa gọi tên**

Gỡ từng dòng ở đúng bản khai nó nằm. Ghi tên từng dòng đã gỡ vào `_acceptance/thuoc-cua-lat-3a-co-rang/evidence/mien-tru-da-go.txt` — hợp đồng đòi hồ sơ gọi tên từng dòng (mục Out of scope, ngoại lệ có tên).

- [ ] **Step 6: `khong-may-quet.sh` đọc bản khai chung**

Thay hai khối `case` ở dòng 14-22 bằng:

```bash
DANH_SACH="$RANG/danh-sach-chan.json"
[ -f "$DANH_SACH" ] || { echo "KHONG DO DUOC: thieu $DANH_SACH"; exit 2; }
MIEN="$(node -e 'const d=require(process.argv[1]);console.log(d.mienTru.map(m=>m.ten).join("\n"))' "$DANH_SACH")"
```
rồi trong vòng lặp:
```bash
  if printf '%s\n' "$MIEN" | grep -qxF "$ten"; then continue; fi
```
Bỏ hẳn hai dòng `case … continue ;;`.

- [ ] **Step 7: Đối chứng dương — cả hai chân phải im**

```bash
node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/mien-tru.mjs; echo "MIEN_TRU=$?"
bash _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khong-may-quet.sh; echo "KHONG_MAY_QUET=$?"
```
Cả hai phải `=0`.

- [ ] **Step 8: Chiều đỏ, lặp lại được — tiêm một dòng giả vào TỪNG bản khai**

```bash
cd /Users/manhphan/dev/crm/.claude/worktrees/sweet-leavitt-d88e70
cp _acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien-sot.txt /tmp/sot.bak
echo "khong.co.khoa.nay.dau" >> _acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien-sot.txt
node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/mien-tru.mjs; echo "EXIT=$?"
cp /tmp/sot.bak _acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien-sot.txt
```
Kỳ vọng: `EXIT=1` và in đúng `DONG MIEN TRU CHET: dot-bien-sot.txt:khong.co.khoa.nay.dau`. Lặp cùng cách cho `danh-sach-chan.json` (thêm một mục `mienTru` tên `khong-co-file-nay.mjs`) và cho `KHONG_DAU`.
**Khôi phục bằng bản sao đã chụp, KHÔNG bằng `git checkout --`.**

- [ ] **Step 9: Verify của task**

```bash
node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/mien-tru.mjs && \
bash _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khong-may-quet.sh && \
bun run check-types && bun run lint && bun run lint:slop
```
Cộng lượt phá-thử ở Step 8 phải đỏ đủ ba bản khai.

- [ ] **Step 10: Commit**

```bash
git add _acceptance/nhan-ung-dung-noi-tieng-viet/rang/danh-sach-chan.json \
        _acceptance/nhan-ung-dung-noi-tieng-viet/rang/mien-tru.mjs \
        _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khong-may-quet.sh \
        _acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien-sot.txt \
        _acceptance/thuoc-cua-lat-3a-co-rang/evidence/mien-tru-da-go.txt
git commit -m "feat(acceptance): put a ratchet on the three exemption lists"
```

---

### Task 2: `khai-tieng.mjs` — enum thật, và tập rỗng là từ chối

**Phục vụ:** E1 (AC-1), E2 phần `khai-tieng` (AC-2).
**independent:** false — dùng chung máy chủ dev và cơ sở dữ liệu với Task 3–7.

**Files:**
- Modify: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs:106-114` (gỡ hằng `GIAI_DOAN`)
- Modify: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs:143-180` (hai nhánh `continue`)

**Interfaces:**
- Consumes: `suySlug` từ `slug.mjs` (đã có).
- Produces: chân `giai-doan` in `GIAI DOAN KHONG THAY TREN MAN: <gia tri>`; chân `khai-tieng` in `KHONG DO DUOC: tap <ten tap> rong`.

- [ ] **Step 1: Gỡ hằng, lấy dân số từ máy chủ**

Xoá khối `const GIAI_DOAN = [...]` (dòng 106-114) và khối kiểm `GIAI_DOAN.length !== 7`. Thay bằng:

```js
const GIAI_DOAN = MA_GIAI_DOAN;
if (GIAI_DOAN.length === 0) {
	console.log("KHONG DO DUOC: tap giai doan tu may chu rong — deals.list khong tra ve hang nao");
	process.exit(2);
}
console.log(`-- dan so: ${GIAI_DOAN.length} gia tri giai doan doc tu may chu`);
```

`MA_GIAI_DOAN` đã có sẵn ở dòng 118 (`[...new Set(thoaThuan.map((r) => r.stage))]`) và tới nay chỉ dùng để in một dòng đếm.

- [ ] **Step 2: Vế thứ hai — khẳng định trên màn, không phải trên máy chủ**

Trong nhánh `chan === "giai-doan"`, thay `if (cho.length === 0) { console.log(...); continue; }` bằng:

```js
	if (cho.length === 0) {
		console.log(`   GIAI DOAN KHONG THAY TREN MAN: ${g}`);
		hong += 1;
		continue;
	}
```

- [ ] **Step 3: Tập rỗng ở chân `khai-tieng` (ngành nghề)**

Thay `if (cho.length === 0) continue;` ở nhánh mặc định bằng cùng khuôn, và thêm trước vòng lặp:

```js
if (NGANH.length === 0) {
	console.log("KHONG DO DUOC: tap nganh nghe rong — khong cong ty nao co truong industry");
	process.exit(2);
}
```

- [ ] **Step 4: Đối chứng dương**

```bash
cd /Users/manhphan/dev/crm/.claude/worktrees/sweet-leavitt-d88e70
ps ax | grep -c "[n]ext.*sweet-leavitt" || echo "CANH BAO: may chu khong chay tu cay nay"
APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs giai-doan; echo "EXIT=$?"
```
Kỳ vọng `EXIT=0`, và dòng `-- dan so: N gia tri` với N > 0.

- [ ] **Step 5: Chiều đỏ 1 — một giá trị enum không có trên màn**

Cùng máy chủ, đổi đúng một biến: lọc bảng thoả thuận để một giai đoạn biến mất khỏi màn trong khi nó vẫn có trong `deals.list`.

```bash
APP_URL=http://localhost:3100 TRANG='?stage=closed-won' \
  node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs giai-doan; echo "EXIT=$?"
```
Kỳ vọng `EXIT=1` và ít nhất một dòng `GIAI DOAN KHONG THAY TREN MAN: <gia tri>`. (Thêm `TRANG` vào lệnh `xem()` như tham số truy vấn phụ; mặc định rỗng.)

- [ ] **Step 6: Chiều đỏ 2 — tập rỗng**

```bash
APP_URL=http://localhost:3100 TRANG='?q=zzz-khong-co-cong-ty-nao' \
  node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs; echo "EXIT=$?"
```
Kỳ vọng `EXIT=2` và dòng `KHONG DO DUOC: tap nganh nghe rong` — **không phải** `EXIT=0`. Đây là phép thử phân biệt bản cũ với bản mới: bản cũ ra `EXIT=0`.

- [ ] **Step 7: Verify của task**

```bash
APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs giai-doan && \
APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs
```
Cộng hai lượt phá-thử Step 5 và Step 6 phải ra đúng `EXIT=1` và `EXIT=2`.

- [ ] **Step 8: Commit**

```bash
git add _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs
git commit -m "fix(acceptance): read the stage list from the server, and refuse an empty set"
```

---

### Task 3: `may-chu-ve.sh` — quan hệ hai vế, không phải chuỗi có mặt

**Phục vụ:** E3 (AC-3).
**independent:** false — dùng chung máy chủ dev.

**Files:**
- Modify: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/may-chu-ve.sh:38-72`

**Interfaces:**
- Produces: in `CON TIENG ANH /<man>: <chuoi tim thay>` ở nhánh đỏ.

- [ ] **Step 1: Dùng `ANH[]` — nó đang nằm không**

Sau khối kiểm tiếng Việt, thêm vế thứ hai:

```bash
  if grep -qF "${ANH[$i]}" <<<"$html"; then
    echo "   CON TIENG ANH /$m: $(printf '%q' "${ANH[$i]}")"
    hong=$((hong + 1))
    continue
  fi
```

- [ ] **Step 2: Đối chứng dương**

```bash
APP_URL=http://localhost:3100 bash _acceptance/nhan-ung-dung-noi-tieng-viet/rang/may-chu-ve.sh; echo "EXIT=$?"
```
Kỳ vọng `EXIT=0`, `ket qua: man hong=0/3`.

- [ ] **Step 3: Chiều đỏ — cùng ba tuyến, đổi đúng một biến (ngôn ngữ)**

Thêm biến `TIENG` vào script (`TIENG="${TIENG:-vi}"`, dùng ở `Cookie: … lang=$TIENG`), rồi:

```bash
APP_URL=http://localhost:3100 TIENG=en bash _acceptance/nhan-ung-dung-noi-tieng-viet/rang/may-chu-ve.sh; echo "EXIT=$?"
```
Kỳ vọng `EXIT=1` và ba dòng `CON TIENG ANH /companies: Companies`, `/contacts: Contacts`, `/deals: Deals`.
**Đây là phép thử phân biệt:** bản cũ chỉ grep tiếng Việt nên nó xanh cả ở `lang=en` — chạy bản cũ với `TIENG=en` để thấy nó ra `EXIT=0` (hoặc chỉ đỏ vì `<html lang>`), rồi chạy bản mới.

- [ ] **Step 4: Verify của task**

```bash
APP_URL=http://localhost:3100 bash _acceptance/nhan-ung-dung-noi-tieng-viet/rang/may-chu-ve.sh && \
{ APP_URL=http://localhost:3100 TIENG=en bash _acceptance/nhan-ung-dung-noi-tieng-viet/rang/may-chu-ve.sh; [ $? -eq 1 ]; }
```

- [ ] **Step 5: Commit**

```bash
git add _acceptance/nhan-ung-dung-noi-tieng-viet/rang/may-chu-ve.sh
git commit -m "fix(acceptance): assert the relation, not the presence, in the first server response"
```

---

### Task 4: `no-vong-1.mjs` — ghim bản dịch, và vắng hai bên là không đo được

**Phục vụ:** E4 (AC-4), E2 phần `no-vong-1` (AC-2).
**independent:** false — dùng chung máy chủ dev.

**Files:**
- Modify: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/no-vong-1.mjs:10-21` (bảng `NO`)
- Modify: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/no-vong-1.mjs:160-180` (vòng kết luận)

**Interfaces:**
- Produces: `CON TIENG ANH: <chuoi>` · `THIEU BAN DICH: <chuoi> — cho <ban dich>` · `KHONG DO DUOC: <chuoi> vang o ca hai thu tieng`.

- [ ] **Step 1: Ghim bản dịch vào từng dòng của bảng `NO`**

Mỗi mục thêm trường `moi` = chuỗi tiếng Việt thay thế. Lấy giá trị thật từ kho chuỗi, không đoán:

```bash
grep -rn "Search companies\|Archived\|Views\|New company\|Not researched\|Researching\|Enriched\|Enrichment failed\|Nothing found" \
  apps/app/lib/messages/companies.ts apps/app/lib/enrichment-status.ts
```
rồi chép đúng chuỗi `vi` tương ứng vào `moi`.

- [ ] **Step 2: Vòng kết luận ba nhánh, không phải hai**

Thay khối `if (!coOEn) { khongThay += 1; … continue; }` bằng:

```js
	if (!coOEn) {
		console.log(`   KHONG DO DUOC: ${JSON.stringify(cu)} vang o ca hai thu tieng · ${o}`);
		khongDoDuoc += 1;
		continue;
	}
	if (!vi.ra.some((t) => t.includes(moi))) {
		console.log(`   THIEU BAN DICH  ${JSON.stringify(cu)} — cho ${JSON.stringify(moi)} · ${o}`);
		hong += 1;
		continue;
	}
	console.log(`   da dich        ${JSON.stringify(cu)} -> ${JSON.stringify(moi)} · ${o}`);
```

và kết:

```js
if (khongDoDuoc > 0) {
	console.log(`ket qua: KHONG DO DUOC ${khongDoDuoc}/${NO.length} chuoi`);
	process.exit(2);
}
console.log(`ket qua: con tieng Anh hoac thieu ban dich=${hong}/${NO.length}`);
process.exit(hong > 0 ? 1 : 0);
```

- [ ] **Step 3: Đối chứng dương**

```bash
APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/no-vong-1.mjs; echo "EXIT=$?"
```
Kỳ vọng `EXIT=0`, mỗi dòng in ra cặp `<chuoi cu> -> <ban dich>`.

- [ ] **Step 4: Chiều đỏ 1 — bản dịch thiếu**

Trong bản sao của bảng `NO`, đổi một `moi` thành một chuỗi không có trên màn:

```bash
cp _acceptance/nhan-ung-dung-noi-tieng-viet/rang/no-vong-1.mjs /tmp/no.bak
sed -i '' 's/moi: "Lưu trữ"/moi: "KHONG-CO-CHUOI-NAY"/' _acceptance/nhan-ung-dung-noi-tieng-viet/rang/no-vong-1.mjs
APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/no-vong-1.mjs; echo "EXIT=$?"
cp /tmp/no.bak _acceptance/nhan-ung-dung-noi-tieng-viet/rang/no-vong-1.mjs
```
Kỳ vọng `EXIT=1` và dòng `THIEU BAN DICH … cho "KHONG-CO-CHUOI-NAY"`.

- [ ] **Step 5: Chiều đỏ 2 — vắng ở cả hai thứ tiếng**

```bash
APP_URL=http://localhost:3100 TRANG='?q=zzz-khong-co-cong-ty-nao' \
  node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/no-vong-1.mjs; echo "EXIT=$?"
```
Kỳ vọng `EXIT=2` và các dòng `KHONG DO DUOC: … vang o ca hai thu tieng`. **Bản cũ ra `EXIT=0` ở đúng lượt này** — đó là phép thử phân biệt.

- [ ] **Step 6: Verify của task**

```bash
APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/no-vong-1.mjs && \
{ APP_URL=http://localhost:3100 TRANG='?q=zzz-khong-co-cong-ty-nao' node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/no-vong-1.mjs; [ $? -eq 2 ]; }
```

- [ ] **Step 7: Commit**

```bash
git add _acceptance/nhan-ung-dung-noi-tieng-viet/rang/no-vong-1.mjs
git commit -m "fix(acceptance): pin the Vietnamese replacement, and refuse when both languages are silent"
```

---

### Task 5: `ban-ve.mjs` chân `dong-thoi-gian` — đọc `<time>` của sản phẩm

**Phục vụ:** E5 (AC-5).
**independent:** false — dùng chung máy chủ dev.

**Files:**
- Modify: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs:1025-1039`

**Interfaces:**
- Produces: `KHONG DO DUOC: trang khong ve <time> nao` (thoát 2) · `CHU THOI GIAN CON TIENG ANH: <chu doc duoc>` (thoát 1).

- [ ] **Step 1: Thay `createElement` bằng đọc phần tử thật**

```js
		const chuMoi = await page.evaluate(() => {
			const nut = [...document.querySelectorAll("time[data-local-date-kind='relative-time']")]
				.filter((t) => {
					const r = t.getBoundingClientRect();
					return r.width > 0 && r.height > 0 && (t.textContent ?? "").trim() !== "";
				});
			return nut.length === 0 ? null : (nut[0].textContent ?? "").trim();
		});
		if (chuMoi === null) {
			console.log("KHONG DO DUOC: trang khong ve <time> nao mang chu thoi gian tuong doi");
			await browser.close();
			process.exit(2);
		}
```

- [ ] **Step 2: Đối chứng dương**

```bash
APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs dong-thoi-gian; echo "EXIT=$?"
```
Kỳ vọng `EXIT=0` và dòng `chu thoi gian sau khi doi: "<chu that tu trang>" — tieng Viet`.

- [ ] **Step 3: Chiều đỏ 1 — chữ thời gian còn tiếng Anh**

Đây là lượt cần véc-tơ **sửa kho chuỗi trong bản sao** (lật ngôn ngữ không đủ mịn — nó đổi cả trang). Cây sao, do Task 9 dựng sẵn hàm dùng chung:

```bash
node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.mjs --chan mot --ten ban-ve.mjs:dong-thoi-gian
```
Chân này trả khoá `crm.time.*` về bản tiếng Anh trong cây sao, chạy lại, và đòi `EXIT=1` cùng dòng `CHU THOI GIAN CON TIENG ANH:`. (Task 10 dựng `--chan mot`; ở Task 5 làm tay một lượt để ghi bằng chứng.)

- [ ] **Step 4: Chiều đỏ 2 — trang không vẽ `<time>` nào**

```bash
APP_URL=http://localhost:3100 TRANG='?q=zzz-khong-co-cong-ty-nao' \
  node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs dong-thoi-gian; echo "EXIT=$?"
```
Kỳ vọng `EXIT=2`. **Bản cũ ra `EXIT=0`** vì nó tự dựng thẻ — phép thử phân biệt.

- [ ] **Step 5: Verify của task**

```bash
APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs dong-thoi-gian && \
{ APP_URL=http://localhost:3100 TRANG='?q=zzz-khong-co-cong-ty-nao' node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs dong-thoi-gian; [ $? -eq 2 ]; }
```

- [ ] **Step 6: Commit**

```bash
git add _acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs
git commit -m "fix(acceptance): read the time element the page rendered, not one the measure built"
```

---

### Task 6: `ban-ve.mjs` chân `ba-man` — bánh cóc trên bản khai bề mặt

**Phục vụ:** E6 (AC-6).
**independent:** false — dùng chung máy chủ dev; đụng cùng file với Task 5 nên chạy SAU nó.

**Files:**
- Modify: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/be-mat.mjs:104-118`
- Modify: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs:609-652`

**Interfaces:**
- Consumes: `BE_MAT` từ `be-mat.mjs`, mỗi mục thêm `dauHieu` — bộ chọn CSS nhận ra bề mặt đó trên trang.
- Produces: `BE MAT KHONG KHAI: <ten>` · `BAN KHAI CO DONG CHET: <ten>`.

- [ ] **Step 1: Mỗi bề mặt khai dấu hiệu nhận ra nó trên trang**

Trong `be-mat.mjs`, mỗi mục của `BE_MAT[man]` thêm `dauHieu` — ví dụ `'button[aria-haspopup="menu"]:nth-of-type(1)'` cho menu Bộ lọc. Và thêm hàm:

```js
export const DEM_BE_MAT_TRANG = () =>
	[...document.querySelectorAll('[data-slot="page-shell"] button')].filter(
		(el) => el.getAttribute("aria-haspopup") === "menu",
	).length;
```

- [ ] **Step 2: So hai chiều thay cho phép trừ**

Trong `ban-ve.mjs` nhánh `ba-man`, thay `const khai = BE_MAT[man].length; const lech = khai - vi.moDuoc.length;` bằng:

```js
			const trangMoi = await page.evaluate(DEM_BE_MAT_TRANG);
			const khai = BE_MAT[man].length;
			let lech = 0;
			if (trangMoi > khai) {
				console.log(`   BE MAT KHONG KHAI: trang moi ${trangMoi} be mat, ban khai co ${khai}`);
				lech += trangMoi - khai;
			}
			for (const bm of BE_MAT[man]) {
				if (!vi.moDuoc.includes(bm.ten)) {
					console.log(`   BAN KHAI CO DONG CHET: ${man}:${bm.ten} — trang khong moi be mat nay ra`);
					lech += 1;
				}
			}
```

- [ ] **Step 3: Đối chứng dương**

```bash
APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs ba-man; echo "EXIT=$?"
```
Kỳ vọng `EXIT=0`, `be mat lech=0`.

- [ ] **Step 4: Chiều đỏ 1 — bản khai thiếu (bánh cóc chiều tới)**

```bash
cp _acceptance/nhan-ung-dung-noi-tieng-viet/rang/be-mat.mjs /tmp/bm.bak
# gỡ mục cuối của BE_MAT.companies
node -e '…'   # sửa mảng, hoặc sửa tay
APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs ba-man; echo "EXIT=$?"
cp /tmp/bm.bak _acceptance/nhan-ung-dung-noi-tieng-viet/rang/be-mat.mjs
```
Kỳ vọng `EXIT=1` và `BE MAT KHONG KHAI:`. **Bản cũ ra `EXIT=0`** ở đúng lượt này — phép thử phân biệt.

- [ ] **Step 5: Chiều đỏ 2 — bản khai có dòng chết (bánh cóc chiều lui)**

Thêm vào `BE_MAT.companies` một mục `{ ten: "menu-khong-ton-tai", mo: async () => false, dong: async () => {} }`, chạy lại, đòi `EXIT=1` và `BAN KHAI CO DONG CHET: companies:menu-khong-ton-tai`. Khôi phục bằng bản sao.

- [ ] **Step 6: Verify của task**

```bash
APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs ba-man
```
Cộng hai lượt phá-thử Step 4 và Step 5 phải đỏ đúng hai thông điệp.

- [ ] **Step 7: Commit**

```bash
git add _acceptance/nhan-ung-dung-noi-tieng-viet/rang/be-mat.mjs _acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs
git commit -m "fix(acceptance): ratchet the hidden-surface declaration against what the page offers"
```

---

### Task 7: `du-lieu-bien.mjs` — đọc chữ trên màn, đếm hàng thành tiền đề

**Phục vụ:** E7 (AC-7), E2 phần `du-lieu-bien` (AC-2).
**independent:** false — dùng chung máy chủ dev.

**Files:**
- Modify: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs` (viết lại phần sau khi lấy `rows`)

**Interfaces:**
- Produces: `KHONG DO DUOC: thieu hang cho trang thai <ten>` (thoát 2) · `CON TIENG ANH o trang thai <ten>: <chu>` (thoát 1).

- [ ] **Step 1: Phần đếm hàng đổi vai thành tiền đề**

```js
let thieu = 0;
for (const c of can) {
	const hit = rows.filter(c.loc);
	if (hit.length === 0) {
		console.log(`   KHONG DO DUOC: thieu hang cho trang thai ${c.ten}`);
		console.log(`         vi sao can: ${c.vi_sao}`);
		thieu += 1;
	}
}
if (thieu > 0) {
	console.log(`ket qua: KHONG DO DUOC — thieu ${thieu}/${can.length} trang thai bien`);
	process.exit(2);
}
```

- [ ] **Step 2: Mở trình duyệt, đọc chữ cho từng trạng thái**

Nhập `puppeteer-core` và `suySlug` như các chân khác; với từng trạng thái, mở `${APP}/${SLUG}/companies` lọc về đúng hàng đó, đọc chữ hiện ra, và khẳng định chữ thời gian tương đối cùng nhãn facet mang dấu tiếng Việt:

```js
const DAU = /[ăâđêôơưáàảãạếềểễệíìỉĩịóòỏõọúùủũụ]/i;
for (const c of can) {
	const chu = await docMan(c);
	const anh = chu.filter((t) => !DAU.test(t) && /\b(ago|day|days|hour|hours|minute|minutes|Unassigned|No owner)\b/.test(t));
	if (anh.length > 0) {
		console.log(`   CON TIENG ANH o trang thai ${c.ten}: ${JSON.stringify(anh[0])}`);
		hong += 1;
	}
}
```

- [ ] **Step 3: Đối chứng dương**

```bash
APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs; echo "EXIT=$?"
```
Kỳ vọng `EXIT=0` và ba dòng nói rõ đọc được chữ gì trên màn cho từng trạng thái.

- [ ] **Step 4: Chiều đỏ 1 — cùng ba trạng thái ở `lang=en`**

```bash
APP_URL=http://localhost:3100 TIENG=en node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs; echo "EXIT=$?"
```
Kỳ vọng `EXIT=1` và `CON TIENG ANH o trang thai …`. **Bản cũ không mở trình duyệt lần nào nên lượt này KHÔNG tới được** — đó là phép thử phân biệt.

- [ ] **Step 5: Chiều đỏ 2 — cây dữ liệu rỗng**

```bash
bun run db:test   # dọn sạch bảng thử
APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs; echo "EXIT=$?"
```
Kỳ vọng `EXIT=2` và `KHONG DO DUOC: thieu hang cho trang thai …`. Đây là lỗ mà `handoff.md` gọi tên — cơ sở dữ liệu rỗng giữa lượt 7 và 8 mà không phép đo nào thấy. Nạp lại dữ liệu thử sau lượt này.

- [ ] **Step 6: Verify của task**

```bash
APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs && \
{ APP_URL=http://localhost:3100 TIENG=en node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs; [ $? -eq 1 ]; }
```

- [ ] **Step 7: Commit**

```bash
git add _acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs
git commit -m "fix(acceptance): read the boundary states on screen, and demote the row count to a precondition"
```

---

### Task 8: `messages-guard.spec.ts` — đường đầy đủ, và tự kiểm chạy đường đụng tên

**Phục vụ:** E8 (AC-8).
**independent:** true — `bun test`, không cần máy chủ, không cần trình duyệt.

**Files:**
- Modify: `apps/app/test/messages-guard.spec.ts:318-348`

**Interfaces:**
- Produces: `song(duong)` chỉ true khi đường đầy đủ có mặt tại một chỗ gọi.

- [ ] **Step 1: Viết bài kiểm ĐỎ trước — đường đụng tên**

Thêm vào `describe("khoa chet")`, TRƯỚC khi sửa `song()`:

```ts
	it("chan nay do duoc: ten la trung mot tu pho thong khong giu khoa song", () => {
		expect(song("deal.person")).toBe(false);
		expect(song("congTyKhongCoThat.email")).toBe(false);
		expect(song("congTyKhongCoThat.title")).toBe(false);
	});
```

- [ ] **Step 2: Chạy để thấy nó TRƯỢT**

```bash
cd apps/app && bun test test/messages-guard.spec.ts -t "ten la trung mot tu pho thong"
```
Kỳ vọng FAIL — `song("deal.person")` trả `true` vì từ `person` xuất hiện đâu đó trong mã. Ghi lại output; đó là bằng chứng bản cũ không thể đỏ.

- [ ] **Step 3: Sửa `song()` — đòi đường đầy đủ**

```ts
	function song(duong: string): boolean {
		const phan = duong.split(".");
		const la = phan[phan.length - 1] ?? "";
		const cha = phan[phan.length - 2];
		if (!cha) return coTen(la);
		const day = `${cha}.${la}`;
		return (
			new RegExp(`\\.${cha}\\.${la}\\b`).test(NGUON) ||
			new RegExp(`\\.${la}\\b[^\\n]*\\b${cha}\\b`).test(NGUON) ||
			new RegExp(`["'\`]${day}["'\`]`).test(NGUON)
		);
	}
```

- [ ] **Step 4: Chạy lại — bài kiểm đụng tên phải XANH**

```bash
cd apps/app && bun test test/messages-guard.spec.ts
```
Kỳ vọng PASS cả ba bài: tự kiểm cũ, tự kiểm đụng tên mới, và `moi khoa da khai deu co it nhat mot cho goi`.

- [ ] **Step 5: Nếu bài thứ ba ĐỎ — đó là kết quả ĐÚNG, không phải lỗi**

Chặn chặt hơn sẽ lộ ra khoá chết thật mà bản lỏng che mất. **KHÔNG nới `song()` để cho qua** — đó là hạ-thước, lớp lỗi có tên ở kho này (`d-20260903T210311Z-26509`). Với từng khoá bị gọi là chết: hoặc nối nó vào chỗ gọi đúng, hoặc xoá khoá nếu màn đó không tồn tại. **Không đổi chuỗi sản phẩm** — chỉ nối hoặc xoá khoá. Danh sách khoá chết phát hiện được ghi vào `_acceptance/thuoc-cua-lat-3a-co-rang/evidence/khoa-chet-lo-ra.txt`.

- [ ] **Step 6: Chiều đỏ lặp lại được**

```bash
cd apps/app && bun test test/messages-guard.spec.ts -t "chan nay do duoc"
```
Bài này LÀ chiều đỏ tự chạy lại: nó khẳng định một khoá giả có lá trùng từ phổ thông có thật phải bị gọi là chết.

- [ ] **Step 7: Verify của task**

```bash
cd /Users/manhphan/dev/crm/.claude/worktrees/sweet-leavitt-d88e70
bun run db:test && bun run test && bun run check-types && bun run lint && bun run lint:slop
```

- [ ] **Step 8: Commit**

```bash
git add apps/app/test/messages-guard.spec.ts _acceptance/thuoc-cua-lat-3a-co-rang/evidence/khoa-chet-lo-ra.txt
git commit -m "fix(app): a key is alive only when its full path appears at a call site"
```

---

### Task 9: `dot-bien.mjs` — đột biến trong cây sao, bán kính nổ bằng không

**Phục vụ:** E10 (AC-10).
**independent:** true — dựng cây sao và máy chủ riêng, không đụng cây làm việc.

**Files:**
- Modify: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien.mjs:98-220`

**Interfaces:**
- Produces: chân `khoanh-vung` — chứng minh bán kính nổ, dùng `CHI_KHOA` sẵn có để rút gọn.

- [ ] **Step 1: Dựng cây sao thay vì chụp ảnh cây làm việc**

Thay `const goc = new Map(); for (…) goc.set(file, readFileSync(file, "utf8"));` bằng:

```js
const SAO = process.env.CAY_SAO ?? `/tmp/dot-bien-${process.pid}`;
execFileSync("git", ["worktree", "add", "--detach", SAO, "HEAD"], { encoding: "utf8" });
const donDep = () => {
	try {
		execFileSync("git", ["worktree", "remove", "--force", SAO], { encoding: "utf8" });
	} catch {}
};
```
Mọi `readFileSync(file)`/`writeFileSync(file)` đổi sang `join(SAO, file)`. `traLai()` chỉ còn gọi `donDep()`.

- [ ] **Step 2: Máy chủ đọc cây sao, không đọc cây làm việc**

Chân đo chạy với `APP_URL` trỏ máy chủ dựng TỪ CÂY SAO ở một cổng riêng. Dựng trong chính script, cổng `3200`, và tắt ở `donDep()`.

- [ ] **Step 3: Chân `khoanh-vung`**

```js
if (process.argv.includes("--chan") && process.argv[process.argv.indexOf("--chan") + 1] === "khoanh-vung") {
	const MOC = "apps/app/lib/messages/crm.ts";
	const truoc = execFileSync("md5", ["-q", MOC], { encoding: "utf8" }).trim();
	const dauHieu = `\n`;
	appendFileSync(MOC, dauHieu);
	const giua = execFileSync("md5", ["-q", MOC], { encoding: "utf8" }).trim();
	// chạy một lượt đột biến rút gọn trong cây sao
	// …
	const sau = execFileSync("md5", ["-q", MOC], { encoding: "utf8" }).trim();
	if (sau !== giua) {
		console.log(`DOI THAY BI NUOT: ${MOC} md5 ${giua} -> ${sau}`);
		process.exit(1);
	}
	console.log(`   doi thay giua luot chay CON NGUYEN: ${MOC} md5 ${giua}`);
	// gỡ dấu hiệu đã thêm, khôi phục md5 gốc
}
```

- [ ] **Step 4: Đối chứng dương — chạy nền, KHÔNG chạy tiền cảnh**

```bash
[ -z "$(git status --porcelain)" ] || { echo "CAY BAN — dung lai"; exit 1; }
RUT_GON=1 CHI_KHOA=crm.time.days,crm.time.hours \
  node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien.mjs --chan khoanh-vung
```
Chạy nền (trần Bash là 600 giây). Kỳ vọng `EXIT=0`, dòng `doi thay giua luot chay CON NGUYEN`.

- [ ] **Step 5: Kiểm cây sạch sau MỌI đường thoát**

```bash
[ -z "$(git status --porcelain apps/app/lib/messages/)" ] && echo "SACH" || echo "BAN"
```
Phải in `SACH`. Lặp cho ba đường thoát: bình thường · `kill -INT` giữa chừng · ném lỗi không bắt.

- [ ] **Step 6: Chiều đỏ — chạy bản khôi phục kiểu cũ**

Giữ hàm cũ dưới tên `traLaiKieuCu` (ghi đè ảnh chụp đầu lượt) sau cờ `KIEU_CU=1`:

```bash
KIEU_CU=1 RUT_GON=1 CHI_KHOA=crm.time.days \
  node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien.mjs --chan khoanh-vung
```
Kỳ vọng `EXIT=1` và `DOI THAY BI NUOT: apps/app/lib/messages/crm.ts md5 … -> …`. Đối chứng dương là lượt Step 4 trên cùng kịch bản.

- [ ] **Step 7: Verify của task**

Step 4 xanh + Step 5 in `SACH` ba lần + Step 6 đỏ đúng thông điệp. Cộng:
```bash
git worktree list   # không được còn cây sao nào sót lại
```

- [ ] **Step 8: Commit**

```bash
git add _acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien.mjs
git commit -m "fix(acceptance): mutate in a throwaway worktree so a concurrent edit survives the run"
```

---

### Task 10: Sổ khai sinh và chân canh sổ

**Phục vụ:** E2 (AC-2), E11 + E12 (AC-11), E14 (AC-13).
**independent:** false — chạy mọi chân của Task 1–9, nên phải làm SAU cả chín.

**Files:**
- Create: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.json`
- Create: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.mjs`

**Interfaces:**
- Consumes: `danh-sach-chan.json` (Task 1) làm dân số; các chân của Task 2–9.
- Produces: `_acceptance/thuoc-cua-lat-3a-co-rang/evidence/khai-sinh-bang.md` — đầu vào của E13.

- [ ] **Step 1: Viết `khai-sinh.json`, một mục cho mỗi chân trong `chanNghiemThu`**

Khuôn mỗi mục:

```json
{
  "ten": "may-chu-ve.sh",
  "chay": ["bash", "_acceptance/nhan-ung-dung-noi-tieng-viet/rang/may-chu-ve.sh"],
  "vecTo": { "kieu": "lat-ngon-ngu", "moiTruong": { "TIENG": "en" } },
  "thongDiepGhim": "CON TIENG ANH /companies:",
  "maThoatMongDoi": 1
}
```
Mục cho chân đã xoá:
```json
{ "ten": "<ten>", "daXoa": true, "lyDo": "<mot cau>" }
```
**Số mục phải bằng số phần tử `chanNghiemThu`.**

- [ ] **Step 2: Viết `khai-sinh.mjs` — chân con mặc định**

Với từng mục: chạy chiều lành (`spawnSync`, không môi trường véc-tơ) → đòi `status === 0`; áp `vecTo.moiTruong` → chạy lại → đòi `status === maThoatMongDoi` VÀ `stdout` chứa `thongDiepGhim`. In một dòng bảng cho mỗi chân. **Số dòng bảng phải bằng N**, và:

```js
if (bang.length !== danhSach.chanNghiemThu.length) {
	console.log(`KHONG DO DUOC: bang co ${bang.length} dong, danh sach co ${danhSach.chanNghiemThu.length} chan`);
	process.exit(2);
}
```

Hạ tầng hỏng KHÔNG BAO GIỜ ra 0:
```js
	if (lanh.error || lanh.status === null || /ECONNREFUSED|Chrome|Failed to launch/i.test(lanh.stderr ?? "")) {
		console.log(`KHONG DO DUOC: ${m.ten} — ${lanh.error?.message ?? (lanh.stderr ?? "").slice(0, 200)}`);
		process.exit(2);
	}
```

Kết thúc: ghi bảng ra `evidence/khai-sinh-bang.md`, đường dẫn suy từ `import.meta.url`:
```js
const RA = resolve(dirname(fileURLToPath(import.meta.url)), "../../thuoc-cua-lat-3a-co-rang/evidence/khai-sinh-bang.md");
```

- [ ] **Step 3: Chân con `--chan so` — bánh cóc hai chiều, có tự kiểm trong lượt**

Hai chiều đỏ, mỗi chiều dựng một sổ tạm trên bản sao rồi chạy lại chính logic đối chiếu:

```js
function doiChieu(so, danhSach) {
	const loi = [];
	const coMuc = new Set(so.map((m) => m.ten));
	for (const c of danhSach.chanNghiemThu) {
		if (!coMuc.has(c.ten)) loi.push(`CHAN KHONG CO KHAI SINH: ${c.ten}`);
	}
	for (const m of so) {
		const co = existsSync(join(RANG, m.ten)) || existsSync(join(GOC, m.ten));
		if (!co && !m.daXoa) loi.push(`MUC KHAI SINH MO COI: ${m.ten}`);
		if (co && m.daXoa) loi.push(`KHAI XOA NHUNG FILE VAN CON: ${m.ten}`);
		if (!m.daXoa && !m.vecTo) loi.push(`CHAN KHONG PHA DUOC MA VAN CON: ${m.ten}`);
	}
	return loi;
}

const tuKiem = [
	{ ten: "thieu mot muc", so: so.slice(1), cho: `CHAN KHONG CO KHAI SINH: ${so[0].ten}` },
	{ ten: "muc mo coi", so: [...so, { ten: "chan-khong-co-that.mjs", vecTo: {} }], cho: "MUC KHAI SINH MO COI: chan-khong-co-that.mjs" },
	{ ten: "chan khong pha duoc", so: [...so, { ten: "mien-tru.mjs" }], cho: "CHAN KHONG PHA DUOC MA VAN CON: mien-tru.mjs" },
];
for (const t of tuKiem) {
	const ra = doiChieu(t.so, danhSach);
	if (!ra.some((l) => l === t.cho)) {
		console.log(`BANH COC HONG: tu kiem "${t.ten}" khong sinh ra "${t.cho}"`);
		process.exit(1);
	}
}
console.log(`   tu kiem banh coc: ${tuKiem.length}/${tuKiem.length} chieu do lat dung`);

const that = doiChieu(so, danhSach);
for (const l of that) console.log(`   ${l}`);
console.log(`ket qua: loi doi chieu=${that.length}`);
process.exit(that.length > 0 ? 1 : 0);
```

**Đây là chỗ khác hẳn bản nháp:** ba chiều đỏ chạy TRONG lượt, không phải một câu kể ở thì quá khứ.

- [ ] **Step 4: Chân con `--chan tap-rong`**

Chạy `khai-tieng.mjs`, `no-vong-1.mjs`, `du-lieu-bien.mjs` hai lượt: lượt bình thường đòi `0`, lượt `TRANG='?q=zzz-khong-co-cong-ty-nao'` đòi `2` kèm `KHONG DO DUOC:`. Exit 0 ở lượt thứ hai là TRƯỢT; exit 1 cũng là TRƯỢT.

- [ ] **Step 5: Đối chứng dương cả ba chân con**

```bash
node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.mjs --chan so; echo "SO=$?"
node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.mjs --chan tap-rong; echo "TAP_RONG=$?"
node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.mjs; echo "DAY_DU=$?"
```
Cả ba `=0`. Chân mặc định in bảng đủ N dòng và ghi `evidence/khai-sinh-bang.md`.

- [ ] **Step 6: Chiều đỏ của chính chân canh sổ**

```bash
cp _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.json /tmp/ks.bak
node -e 'const f="_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.json";const d=require("fs");const j=JSON.parse(d.readFileSync(f));j.find(m=>m.ten==="may-chu-ve.sh").thongDiepGhim="CHUOI LECH MOT CHU";d.writeFileSync(f,JSON.stringify(j,null,2))'
node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.mjs; echo "EXIT=$?"
cp /tmp/ks.bak _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.json
```
Kỳ vọng `EXIT=1` và `CHAN KHONG DO DUOC: may-chu-ve.sh — cho "CHUOI LECH MOT CHU", nhan …`.

- [ ] **Step 7: Verify của task**

```bash
node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.mjs --chan so && \
node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.mjs --chan tap-rong && \
node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.mjs && \
[ -s _acceptance/thuoc-cua-lat-3a-co-rang/evidence/khai-sinh-bang.md ]
```
Cộng lượt phá-thử Step 6 phải đỏ đúng thông điệp.

- [ ] **Step 8: Commit**

```bash
git add _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.json \
        _acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.mjs \
        _acceptance/thuoc-cua-lat-3a-co-rang/evidence/khai-sinh-bang.md
git commit -m "feat(acceptance): a birth registry that re-proves every red direction each run"
```

---

### Task 11: Bốn cổng máy, và đặt hợp đồng sang `implemented`

**Phục vụ:** khép vòng S3.
**independent:** false — sau tất cả.

**Files:**
- Modify: `_acceptance/thuoc-cua-lat-3a-co-rang/contract.md` (frontmatter `status`)

- [ ] **Step 1: Cây sạch, không sót cây sao**

```bash
git status --porcelain
git worktree list
```

- [ ] **Step 2: Bốn cổng máy, ép chạy không cache**

```bash
bun run db:test && bun run test
bun run check-types
bun run lint
bun run lint:slop
```

- [ ] **Step 3: Chạy trọn mười bốn phép đo một lượt**

Từng lệnh trong `_acceptance/thuoc-cua-lat-3a-co-rang/evals.yaml`, giải qua `_acceptance/config.yaml`. Ghi kết quả vào `_acceptance/thuoc-cua-lat-3a-co-rang/evidence/`.

- [ ] **Step 4: Đặt `status: implemented`**

- [ ] **Step 5: Commit**

```bash
git add _acceptance/thuoc-cua-lat-3a-co-rang/
git commit -m "chore(acceptance): the rulers are rebuilt; hand the round to verification"
```

---

## Self-Review

**1. Độ phủ hợp đồng.** AC-1→T2 · AC-2→T2,T4,T7,T10 · AC-3→T3 · AC-4→T4 · AC-5→T5 · AC-6→T6 · AC-7→T7 · AC-8→T8 · AC-9→T1 · AC-10→T9 · AC-11→T10 · AC-13→T10 · AC-12 là tiêu chí người chấm, ăn vào `evidence/khai-sinh-bang.md` mà T10 Step 2 bắt buộc sinh ra. **Không tiêu chí nào không có task.**

**2. Chỗ trống.** Còn một chỗ: Task 6 Step 4 để `node -e '…'` chưa viết đủ — người thi công sửa mảng `BE_MAT.companies` bằng tay, và bước khôi phục đã ghi rõ dùng bản sao `/tmp/bm.bak`.

**3. Nhất quán kiểu.** `danh-sach-chan.json` khai `chanNghiemThu[].ten` và `mienTru[].ten` — T1 tạo, T10 đọc đúng tên đó. `khai-sinh.json` khai `ten · chay · vecTo · thongDiepGhim · maThoatMongDoi · daXoa · lyDo` — chỉ T10 đọc. `evidence/khai-sinh-bang.md` do T10 sinh, E13 đọc.

**4. Thứ tự bắt buộc.** T1 trước T10 (dân số). T5 trước T6 (cùng file `ban-ve.mjs`). T2–T7 chạy tuần tự vì dùng chung một máy chủ và một cơ sở dữ liệu — đột biến của cái này thấy được bởi cái kia. T1, T8, T9 độc lập thật.
