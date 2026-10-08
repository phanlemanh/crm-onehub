# Ca chập chờn cách ly — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bốn ca chập chờn theo máy thôi làm đỏ lượt dài: dọn eve mồ côi của lượt bị ngắt, chờ `/health` thật có trần, đặt trần hook dựng Nest có tên, và cho công tắc bỏ ca tới được test.

**Architecture:** Mọi sửa nằm ở tầng test. `khoi-dong.ts` ghi pid các `eve dev` nó sinh vào tệp chủ khoá có sẵn. Lượt sau gặp khoá cũ thì dừng đúng các pid đó, nhưng chỉ khi giờ khởi động và dòng lệnh khớp. Sau đó nó chờ `/health` trả mã khác 503. Hook Nest lấy trần từ một hằng có tên. `turbo.json` chuyền thêm một biến.

**Tech Stack:** bun test, eve 0.29.4 (`eve dev`), NestJS testing, turbo.

**Spec:** `_acceptance/ca-chap-chon-cach-ly/design.md`, `contract.md`, `evals.yaml`.

## Global Constraints

- Không viết chú thích trong code.
- Không đổi tệp nào dưới `apps/*/src/**`, `apps/*/agent/**`, `apps/*/app/**`, `packages/*/src/**` (AC-7).
- Hằng mới vào khối cấu hình có sẵn: `KHOI_DONG` (eve) và `TAI_LIEU_SAN` (Nest). Đơn vị suy từ `MINUTE_MS` của `@crm/db/okr-tro-ly-danh-muc`.
- `turbo.json` và `_acceptance/config.yaml` chỉ thêm dòng (luật 7 của đợt).
- Chỉ dừng tiến trình có trong tệp khoá, khớp cả giờ khởi động lẫn dòng lệnh `/node_modules/.bin/eve dev`.
- Bản sao phá-thử dựng bằng `git worktree` ngoài kho, không phá tại chỗ.

## Review Focus

1. Pid ghi trong khoá đã bị một tiến trình khác dùng lại. Kỳ vọng: không bị dừng. Khớp giờ khởi động và dòng lệnh, đo ở E2 (ii) của Task 1.
2. Eve mồ côi đã tự chết trước lượt sau. Kỳ vọng: bước dọn bỏ qua, không ném. Ca «pid đã chết» của Task 1.
3. `ps` không trả gì: pid vắng, hoặc máy không có lệnh. Kỳ vọng: coi như không khớp, không dừng. Cùng ca với mục 2.
4. `/health` trả 200 ngay lần đầu. Kỳ vọng: trả máy ngay, không chờ. Ca nền của E3 trong Task 1.
5. Hai gốc dùng chung một tệp khoá. Không xảy ra được: mỗi gốc có thư mục khoá riêng theo băm của `realpath`. Không thêm test.

---

### Task 1: dọn eve mồ côi và chờ route trong `khoi-dong.ts`

**Files:**
- Modify: `apps/agent-okr/test/support/khoi-dong.ts`
- Create: `apps/agent-okr/test/khoi-dong-don.spec.ts`
- Create: `apps/agent-okr/test/support/eve-gia.ts` (dựng gốc tạm có `node_modules/.bin/eve` giả)

**Evals phục vụ:** E1, E2, E3 · **independent:** false

**Interfaces — Produces:**
- `KHOI_DONG.moCoi = { dau: "/node_modules/.bin/eve dev" }`
- `KHOI_DONG.sanSang = { choMs: 30 * SECOND_MS, nhipMs: 300 }`
- `export function ghiConVaoKhoa(goc: string, pid: number): void` — ghi `{pid, batDau}` vào `chu.json` của khoá đang giữ cho gốc đó. `batDau` lấy từ `ps -o lstart=`.
- `export async function choRoute(url: string, tran: { choMs: number; nhipMs: number } = KHOI_DONG.sanSang): Promise<number>` — trả mã khác 503 đầu tiên. Hết trần thì ném `route <url> chua san sang sau <ms> ms: <503|khong ket noi>`.
- Lược đồ `chuKhoaEve` thêm `con: z.array(z.object({ pid, batDau })).default([])`.

- [ ] **Step 1: bàn thử eve giả.** `support/eve-gia.ts` xuất:
  - `dungGocGia(): { goc, don }` — `mkdtemp`, rồi ghi `node_modules/.bin/eve` (`#!/usr/bin/env node` cùng `setInterval(()=>{},1e6)`, quyền 755).
  - `sinhEveGia(goc): ChildProcess` — `spawn(join(goc,"node_modules/.bin/eve"), ["dev","--no-ui","--port","1"], { detached: false })`.
  - `songCon(pid)`.
- [ ] **Step 2: viết ba describe đỏ trước.**
  - `mo-coi`: một tiến trình con `bun -e` nhập `khoi-dong.ts` thật, gọi `giuKhoaEve([goc])`, `sinhEveGia`, `ghiConVaoKhoa(goc, pid)`, in `SAN SANG <pid>` rồi chờ. Bài SIGKILL con và khẳng định eve giả còn sống (nếu không thì ném «khong dung duoc canh mo coi»). Gọi `giuKhoaEve([goc])` rồi khẳng định `songCon(pid) === false` với thông điệp «mo coi con song: <pid>».
  - `ngoai-khoa (i)`: thêm một eve giả do chính bài sinh, không ghi khoá. Sau `giuKhoaEve` nó còn sống («dung nham eve ngoai khoa»).
  - `ngoai-khoa (ii)`: tiến trình con ghi pid của `sleep 300` do bài sinh. Sau `giuKhoaEve` `sleep` còn sống («dung nham tien trinh khong phai eve»).
  - Ca «pid đã chết»: tiến trình con ghi pid của một tiến trình đã thoát. `giuKhoaEve` trả về, không ném.
  - `cho-route` có bốn ca như E3, cộng ca 200 ngay và dòng `expect(KHOI_DONG.sanSang.choMs).toBeLessThan(KHOI_DONG.choMs)`. Ca «từ chối rồi mở»: hỏi trên một cổng tự do, sau 1 s mới `Bun.serve` ở đúng cổng đó.
- [ ] **Step 3:** chạy `cd apps/agent-okr && bun test test/khoi-dong-don.spec.ts`. Kỳ vọng: đỏ, `ghiConVaoKhoa`/`choRoute` không tồn tại.
- [ ] **Step 4: cài.**
  - `batDauCua(pid)` và `dongLenh(pid)` gọi `spawnSync("ps", ["-o", "lstart=" | "command=", "-p", String(pid)])`. Kết quả rỗng thì trả `null`.
  - `cayCon(pid)` dùng `pgrep -P` đệ quy.
  - `async dungMoCoi(khoa)`: với mỗi `c` trong `chuKhoa(khoa)?.con ?? []`, nếu `batDauCua(c.pid) === c.batDau && dongLenh(c.pid)?.includes(KHOI_DONG.moCoi.dau)` thì gom `[c.pid, ...cayCon(c.pid)]`. Gửi SIGTERM, chờ tới `KHOI_DONG.dungMs`, còn sống thì SIGKILL.
  - Trong `giuMot`, nhánh `catch`: `if (khoaCu(khoa)) { await dungMoCoi(khoa); rmSync(...) }`.
  - `ghiConVaoKhoa`: đọc khoá ở `khoaDangGiu.get(thatCua(goc))` (không giữ thì ném «khong giu khoa cua <goc>»), thêm phần tử, ghi lại.
  - `moEve`: ngay sau `spawn`, gọi `ghiConVaoKhoa(goc, tien.pid)`. Sau `choGhiTrangThai`, gọi `await choRoute(`${url}/health`)`; nếu ném thì `await dung()` rồi ném lại.
- [ ] **Step 5:** chạy lại Step 3. Kỳ vọng: xanh. Chạy thêm `bun test test/app-rieng.integration.spec.ts`. Kỳ vọng: 5 pass.
- [ ] **Step 6:** `bun run check-types` và `bun run lint:slop`, rồi commit `fix(agent-okr): don eve mo coi cua luot bi ngat, cho /health that`.

### Task 2: trần hook dựng Nest có tên

**Files:**
- Modify: `apps/api/test/tai-lieu-san.ts` (thêm `TAI_LIEU_SAN`; `beforeAll` của `dungSan` nhận trần)
- Modify: `apps/api/test/tai-lieu-khong-ro.spec.ts:120`
- Modify: `apps/api/test/tai-lieu-thay-trang.spec.ts:171`

**Evals phục vụ:** E6, E7 (d1–d3) · **independent:** true

- [ ] **Step 1:** trong `tai-lieu-san.ts`: `import { MINUTE_MS } from "@crm/db/okr-tro-ly-danh-muc"; export const TAI_LIEU_SAN = { hookMs: 2 * MINUTE_MS } as const;`. `beforeAll(async () => {...}, TAI_LIEU_SAN.hookMs)` trong `dungSan`.
- [ ] **Step 2:** hai spec: `beforeAll(async () => {...}, TAI_LIEU_SAN.hookMs)`, và thêm `TAI_LIEU_SAN` vào import từ `./tai-lieu-san`.
- [ ] **Step 3:** chạy `bun run test -- "cd apps/api && bun test test/tai-lieu-khong-ro.spec.ts test/tai-lieu-thay-trang.spec.ts"`. Kỳ vọng: 0 fail.
- [ ] **Step 4:** commit `fix(api): tran hook dung Nest co ten cho tai-lieu`.

### Task 3: công tắc qua turbo

**Files:**
- Modify: `turbo.json` (thêm `"SOKR_KHONG_CHAY_AGENT_CU"` vào `globalPassThroughEnv`)
- Create: `_acceptance/ca-chap-chon-cach-ly/rang/cong-tac.mjs`

**Evals phục vụ:** E8 · **independent:** true

- [ ] **Step 1:** `cong-tac.mjs` chạy `bun run test -- --filter=agent-okr -- test/app-rieng.integration.spec.ts -t "chạy cạnh"` hai lần, một lần đặt biến và một lần không. Mỗi lần gom stdout và stderr. Lần bật phải có «bo qua ca chay canh apps/agent» và không có dòng `(pass)` của ca «chạy cạnh»; in «BAT: bo ca». Lần tắt phải có dòng đó; in «TAT: chay ca». Gốc kho suy từ `import.meta.dirname`.
- [ ] **Step 2:** chạy trước khi sửa `turbo.json`. Kỳ vọng: exit 1 ở «BAT». Sửa `turbo.json`, chạy lại. Kỳ vọng: exit 0.
- [ ] **Step 3:** commit `fix(turbo): chuyen SOKR_KHONG_CHAY_AGENT_CU toi test`.

### Task 4: bàn đo của hồ sơ

**Files:**
- Create: `_acceptance/ca-chap-chon-cach-ly/rang/mo-coi.mjs` (E4 `xanh`, E5 `do`)
- Create: `_acceptance/ca-chap-chon-cach-ly/rang/pham-vi.mjs` (E9; `--tu-danh-sach <tệp>`)
- Create: `_acceptance/ca-chap-chon-cach-ly/rang/dot-bien.mjs` (E7, `SO_CAP_KHAI = 9`)
- Create: `_acceptance/ca-chap-chon-cach-ly/rang/ban-sao.mjs` (dựng và gỡ git worktree ngoài kho, liên kết `node_modules` của gốc và từng gói, liên kết `.env`)

**Evals phục vụ:** E4, E5, E7, E9 · **independent:** false (cần Task 1–3)

- [ ] **Step 1:** `ban-sao.mjs` xuất `dungBanSao(ten)` và `goBanSao()`.
  - Worktree tạo tại `/private/tmp/cccl-<ten>-<pid>` từ `HEAD`.
  - Liên kết `node_modules` ở gốc và ở mọi `apps/*` và `packages/*` có `node_modules`; liên kết `.env`.
  - `goBanSao` gọi `git worktree remove --force`.
- [ ] **Step 2: `mo-coi.mjs`.**
  - `xanh` chạy ba lượt trên cây này.
  - `do` chạy một lượt trên bản sao, sau khi `thayMotLan` gỡ dòng `await dungMoCoi(khoa);`. Mốc xuất hiện khác đúng 1 lần thì exit 2.
  - Mỗi lượt:
    - spawn `bun test test/app-rieng.integration.spec.ts`;
    - mỗi 300 ms đọc `pgrep -P <test>` và `ps -o command=`, tới khi có một con chứa `apps/agent-okr/node_modules/.bin/eve dev` (trần 120 s);
    - SIGKILL tiến trình test; khẳng định eve đó còn sống với `ps -o ppid=` là 1;
    - chạy `bun test … -t "chạy cạnh"`, rồi kiểm theo bảng kỳ vọng của E4/E5.
  - `finally`: dừng mọi pid mồ côi mà script đã thấy.
- [ ] **Step 3: `pham-vi.mjs`.**
  - Lấy danh sách bằng `git merge-base HEAD origin/onehub`, rồi `git diff --name-only <base> HEAD`.
  - Bốn tiền tố cấm khớp bằng `^(apps/[^/]+/(src|agent|app)|packages/[^/]+/src)/`.
  - `--tu-danh-sach` đọc danh sách tệp tay.
- [ ] **Step 4: `dot-bien.mjs`.** Chín cặp như E7. Mỗi cặp:
  - dựng bản sao, đo chiều xanh, phá bằng `thayMotLan`, đo chiều đỏ, khẳng định thông điệp ghim;
  - in dòng `<cặp> <tên> xanh=0 do=<mã> ghim=ok`.
  - Thêm bước tiền đề cho E6: đếm `test(` ở merge-base cho hai spec `tai-lieu`.
- [ ] **Step 5:** chạy cả bốn script. Kỳ vọng: E4 xanh ba lượt; E5 «DO DUNG»; E7 đủ 9 cặp; E9 «0 ma san pham».
- [ ] **Step 6:** commit `test(ca-chap-chon-cach-ly): ban do mo coi, pha thu, pham vi`.
