# dieu-phoi-hai-tang — kế hoạch thi công (S2)

Kế hoạch này là **nguyên văn** kế hoạch 1a của kit (`acceptance-gate-kit@7b1afe1e:docs/superpowers/plans/2026-10-05-orchestrator-workers-1a.md`,
chép từ dòng «# Orchestrator–workers hai tầng · giai đoạn 1a» trở xuống), cộng phần đầu này. Owner bảo dùng
nguyên, không viết lại. Hợp đồng: `_acceptance/dieu-phoi-hai-tang/contract.md` (duyệt Cổng 1 ngày 07/10).

## Hai chỗ chỉnh khi chép mã (sổ quyết định d-4)

1. Bỏ mọi chú thích `//` và `/* */` trong `scripts/dieu-phoi/**/*.mjs`, kể cả test; giữ shebang.
2. Hằng thời gian vào `scripts/dieu-phoi/cau-hinh.mjs`:
   `PHUT_MS = 60_000`, `GIAY_MS = 1_000`, `NHIP = { khoaTrongMs: PHUT_MS, motNgayMs: 24 * 60 * PHUT_MS, baoLaiMs: 30 * PHUT_MS, fetchMs: 5 * PHUT_MS, lenhNgoaiMs: 30 * GIAY_MS, tickGiayMacDinh: 5 }`.
   `lich.mjs`, `yeu-cau.mjs`, `phat-lich.mjs` nhập từ đây thay cho số viết tay. Test giữ nguyên từng dòng.

## Task ↔ eval ↔ phụ thuộc

| Task | Tệp | Phục vụ | independent |
|---|---|---|---|
| 1 nền | `glob.mjs`, `dot.mjs`, `cau-hinh.mjs`, `package.json` | E24 | false (mọi task sau dùng) |
| 2 lập lịch | `lich.mjs` | E1, E3, E5, E8, E15, E25–E27, E33 | false |
| 3 sức khoẻ | `suc-khoe.mjs` | E7, E28 | false |
| 4 kênh yêu cầu | `yeu-cau.mjs` | E13, E32 | false |
| 5 hook chặn S4 | `hook-chan-s4.mjs`, `.claude/settings.json` | E9, E10, E11, E29, E30 | false |
| 6 hook nhịp + chờ người | `hook-nhip.mjs`, `hook-cho-nguoi.mjs`, `.claude/settings.json` | E11, E12, E31, E38 | false |
| 7 bảng | `bang.mjs` | E17, E34 | false |
| 8 bộ phát lịch | `phat-lich.mjs` | E2, E4, E6, E8, E14, E16, E18, E19, E36, E37 | false |
| 9 CLI, mẫu, README | `dieu-phoi.mjs`, `mau/`, `README.md` | E20–E23, E39 | false |
| 10 thước của vòng | `_acceptance/dieu-phoi-hai-tang/rang/{dot-bien,nhip-that}.mjs`, thêm Monitor vào `thu-kho.mjs` | E21, E25–E39 | false (đọc mã của 1–9) |

Mọi task `independent: false`: các tệp nối nhau qua import và test nhỏ, chạy tuần tự trong vòng chính nhanh
hơn dựng worktree song song.

Verify mỗi task: đúng lệnh `Run:` của task trong kế hoạch dưới đây (`node --test scripts/dieu-phoi/test/<tệp>.test.mjs`).
Task 10 verify: `node _acceptance/dieu-phoi-hai-tang/rang/<tệp>.mjs` thoát 0 và có dòng chiều đỏ.

---

# Orchestrator–workers hai tầng · giai đoạn 1a Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng tầng máy của Orchestrator–workers trong kho crm. Gồm:
- bộ phát lịch tất định: khoá có hạn thuê, canh sức khoẻ máy, hàng kế, kênh yêu cầu phần máy làm được, bảng đồng hồ;
- ba hook: chặn S4, nhịp, chờ người.

Phiên giám sát LLM thôi phải tự phát khoá, và owner thôi phải hỏi trạng thái.

**Architecture:** Mọi logic quyết định nằm trong hàm thuần (`lich.mjs`, `yeu-cau.mjs`, `suc-khoe.mjs`, `bang.mjs`), test bằng fixture do mã sinh. `phat-lich.mjs` là vỏ I/O: mỗi nhịp đọc thư mục đợt (ngoài git), gọi các hàm thuần, rồi ghi tệp và sự kiện. Lệnh ngoài (`git`, `gh`, `sysctl`, `ps`) đi qua một đối tượng `io` để test thay thế được. Các hook là script Node ngắn, khai trong `.claude/settings.json`. Mọi giá trị riêng của kho nằm trong `dieu-phoi.config.json` và `hang-viec.json` của đợt.

**Tech Stack:** Node ≥ 22 (máy đang có v26), ES modules `.mjs`, `node:test` + `node:assert/strict`. Không thêm gói npm.

**Spec:** `acceptance-gate-kit/docs/superpowers/specs/2026-10-05-orchestrator-workers-hai-tang-design.md` (đã duyệt 05/10), các mục §3, §4.1–§4.3, §4.5–§4.12, §5 (1a), §5.1, §7, §8.

**Nơi chạy:** kho `phanlemanh/crm-onehub`, trong một vòng `/feature-loop` của crm tên `dieu-phoi-hai-tang`. S1 dựng hợp đồng từ spec, kế hoạch này là đầu vào của S2. Mọi đường dẫn bên dưới tính từ gốc kho crm.

## Global Constraints

- Không ghi cứng thứ gì của crm. Nhánh chính, lệnh S4, ngưỡng, danh sách bảo vệ đều đọc từ `dieu-phoi.config.json`; ranh giới tệp đọc từ `hang-viec.json` (spec §5.1).
- **Giai đoạn 1a không merge.** Không có dòng mã nào gọi `gh pr merge`, và không bao giờ có `--auto` (spec §4.4 thuộc giai đoạn 1b).
- Không đường quan trọng nào đi qua tin nhắn liên phiên. Lượt khoá, trả lời yêu cầu và hàng kế đều là tệp (spec §3).
- Hook `PreToolUse` **chỉ** chặn lệnh S4 (Workflow `acceptance-verify.js`; Bash chứa `repin-lane`, `s4-args`, `duong-nen.mjs`). Mọi lệnh khác thoát 0. Lệnh S4 gặp lỗi nội bộ thì thoát 2 (đóng khi lỗi, spec §4.5).
- Tên lệnh S4 là tên của kit, không phải của crm, nên chúng là hằng `LENH_MAC_DINH` trong hook, không phải cấu hình. Cho cấu hình khai thêm lệnh thì sẽ mở một lỗ im lặng: lối thoát sớm của lệnh thường không biết tới lệnh khai thêm.
- Tên tệp trong thư mục đợt, đúng như spec:
  - `khoa/<s4|duong-nen|merge>/chu.json` và `khoa/<…>/nhip`;
  - `xin/<phiên>-<loại>.json`;
  - các thư mục `yeu-cau/`, `tra-loi/`, `cho-nguoi/`, `tiep/`;
  - `su-kien.jsonl`, `trang-thai.json`, `bang.html`, `ranh-gioi-them.json`;
  - `dieu-phoi.config.json`, `hang-viec.json`;
  - symlink `.acceptance-runs/dieu-phoi-hien-tai`.
- Hạn thuê mặc định (phút): `s4` 90 · `ghim-lai` 40 · `duong-nen` 40 · `merge` 120. Nhịp coi là cũ sau 10′.
- Ngưỡng giảm tải: áp lực bộ nhớ của macOS (`kern.memorystatus_vm_pressure_level`) ≥ 2, hoặc swap dùng > 8 GB.
  - **Không** dùng tỉ lệ swap. macOS tự co giãn dung lượng swap, nên ngày 05/10 máy đo 1,6/3 GB = 54 % lúc đang khoẻ (áp lực mức 1, còn trống 75 %) mà tỉ lệ vẫn báo giảm tải.
- Ngưỡng cần người: một tiến trình > 8 GB RSS. Trần gộp S4: 60′.
- Thứ tự cấp lượt (luật 13:40 và 14:25 ngày 04/10):
  1. đơn `ghim-lai` có `mo_merge: true` đi trước hết;
  2. sau đó theo `moc` của hàng;
  3. sau đó theo giờ xin.
- Trong chế độ giảm tải: không cấp `s4`, `ghim-lai`, `duong-nen` mới. `merge` vẫn cấp.

## Review Focus

1. **Hook chạy ở MỌI lời gọi Bash và Workflow của mọi phiên crm**, kể cả phiên thường của owner. Khi không có đợt nào, hoặc lệnh không phải S4, hook phải thoát 0 nhanh, kể cả khi `dieu-phoi.config.json` hỏng. Test ở Task 5.
2. **Sập giữa lúc cấp lượt.** `khoa/s4/` đã tạo mà chưa có `chu.json` thì không được kẹt mãi: thư mục khoá trống quá 60″ bị thu hồi. Test ở Task 8.
3. **Owner chạy `chay` hai lần.** Bản thứ hai phải từ chối nhờ pidfile, không được cấp lượt song song. Test ở Task 8.
4. **Đường dẫn worktree qua symlink** (`/tmp` ↔ `/private/tmp`, `~/.claude/worktrees`). Mọi phép so cwd với worktree dùng `realpath` và so tiền tố có dấu `/`. Test ở Task 5.
5. **Đơn hay yêu cầu JSON hỏng do thợ ghi dở.** Chuyển tệp vào `xin/hong/` hoặc `yeu-cau/hong/`, phát `can_phan`, và bộ phát lịch vẫn chạy tiếp. Test ở Task 8.

---

## File Structure

| Tệp | Trách nhiệm |
|---|---|
| `scripts/dieu-phoi/glob.mjs` | Khớp glob tối giản (`**`, `*`, `?`) |
| `scripts/dieu-phoi/dot.mjs` | Tìm thư mục đợt; đọc và ghi JSON nguyên tử; ghi sự kiện; ánh xạ cwd → phiên |
| `scripts/dieu-phoi/lich.mjs` | Thuần: xếp hàng đơn, cấp lượt, xét hạn thuê, chọn hàng kế |
| `scripts/dieu-phoi/suc-khoe.mjs` | Thuần: đọc `sysctl` và `ps`, đánh giá giảm tải |
| `scripts/dieu-phoi/yeu-cau.mjs` | Thuần: định tuyến yêu cầu (máy duyệt / gộp / `can_phan`) |
| `scripts/dieu-phoi/bang.mjs` | Thuần: dựng `bang.html` từ trạng thái (escape mọi chuỗi) |
| `scripts/dieu-phoi/phat-lich.mjs` | Vỏ I/O: `motNhip()` cùng vòng chạy và pidfile |
| `scripts/dieu-phoi/dieu-phoi.mjs` | CLI: `mo`, `chay`, `dung`, `dong`, `xem` |
| `scripts/dieu-phoi/hook-chan-s4.mjs` | Hook PreToolUse |
| `scripts/dieu-phoi/hook-nhip.mjs` | Hook PostToolUse |
| `scripts/dieu-phoi/hook-cho-nguoi.mjs` | Hook Notification và UserPromptSubmit |
| `scripts/dieu-phoi/mau/` | Mẫu `dieu-phoi.config.json`, `hang-viec.json`, `LUAT.md` |
| `scripts/dieu-phoi/README.md` | Nghi thức cho phiên giám sát: mở, chạy, đóng đợt; Monitor; task lịch |
| `scripts/dieu-phoi/test/*.test.mjs` | Test |
| `.claude/settings.json` | Khai báo bốn hook |
| `package.json` | Script `test:dieu-phoi` |

---

### Task 1: Nền — glob, thư mục đợt, sự kiện

**Files:**
- Create: `scripts/dieu-phoi/glob.mjs`, `scripts/dieu-phoi/dot.mjs`, `scripts/dieu-phoi/test/nen.test.mjs`
- Modify: `package.json` (thêm script)

**Interfaces:**
- Produces:
  - `khop(mau: string, duongDan: string): boolean`
  - `khopMot(maus: string[], duongDan: string): boolean`
  - `TEN_LIEN_KET = 'dieu-phoi-hien-tai'`
  - `gocKhoChinh(cwd): string`
  - `timThuMucDot(cwd): string|null`
  - `docJson(p, macDinh=null): any` (ném lỗi khi JSON hỏng)
  - `ghiJsonNguyenTu(p, du): void`
  - `ghiSuKien(thuMuc, suKien: object): void`
  - `phienCuaCwd(hangViec, cwd): string|null`
  - `trongWorktree(worktree, cwd): boolean`

- [ ] **Step 1: Thêm script test vào `package.json`**, trong khối `"scripts"`, ngay sau `"ui:capture"`:

```json
		"test:dieu-phoi": "node --test \"scripts/dieu-phoi/test/*.test.mjs\""
```

- [ ] **Step 2: Viết test thất bại** `scripts/dieu-phoi/test/nen.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { khop, khopMot } from '../glob.mjs';
import { docJson, ghiJsonNguyenTu, ghiSuKien, phienCuaCwd, timThuMucDot, trongWorktree, TEN_LIEN_KET } from '../dot.mjs';

const tam = () => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'dp-')));

test('khop: ** nhiều cấp, * một cấp', () => {
  assert.equal(khop('apps/agent/**', 'apps/agent/a/b.ts'), true);
  assert.equal(khop('apps/app/lib/messages/*.ts', 'apps/app/lib/messages/okr.ts'), true);
  assert.equal(khop('apps/app/lib/messages/*.ts', 'apps/app/lib/messages/a/okr.ts'), false);
  assert.equal(khop('**/schema.prisma', 'schema.prisma'), true);
  assert.equal(khop('**/schema.prisma', 'packages/db/prisma/schema.prisma'), true);
  assert.equal(khop('packages/ui/**', 'packages/uix/a.ts'), false);
  assert.equal(khopMot(['x/**', 'y/*.ts'], 'y/a.ts'), true);
});

test('ghiJsonNguyenTu + docJson: ghi rồi đọc; vắng → mặc định; hỏng → ném', () => {
  const d = tam();
  const p = path.join(d, 'a', 'b.json');
  ghiJsonNguyenTu(p, { x: 1 });
  assert.deepEqual(docJson(p), { x: 1 });
  assert.equal(docJson(path.join(d, 'khong.json'), 'md'), 'md');
  fs.writeFileSync(path.join(d, 'hong.json'), '{');
  assert.throws(() => docJson(path.join(d, 'hong.json')));
});

test('ghiSuKien: mỗi sự kiện một dòng JSON có luc', () => {
  const d = tam();
  ghiSuKien(d, { loai: 'cap', can_phan: true });
  const dong = fs.readFileSync(path.join(d, 'su-kien.jsonl'), 'utf8').trim().split('\n');
  assert.equal(dong.length, 1);
  const sk = JSON.parse(dong[0]);
  assert.equal(sk.loai, 'cap');
  assert.equal(sk.can_phan, true);
  assert.match(sk.luc, /^\d{4}-\d{2}-\d{2}T/);
});

test('trongWorktree + phienCuaCwd: so realpath, có dấu /', () => {
  const d = tam();
  const w1 = path.join(d, 'w1');
  fs.mkdirSync(path.join(w1, 'sub'), { recursive: true });
  fs.mkdirSync(path.join(d, 'w10'));
  fs.symlinkSync(w1, path.join(d, 'lk'));
  const hv = { day: [{ id: 'P1', worktree: w1 }] };
  assert.equal(phienCuaCwd(hv, path.join(w1, 'sub')), 'P1');
  assert.equal(phienCuaCwd(hv, path.join(d, 'lk')), 'P1');
  assert.equal(phienCuaCwd(hv, path.join(d, 'w10')), null);
  assert.equal(trongWorktree(w1, path.join(d, 'w10')), false);
});

test('timThuMucDot: null khi không có symlink, đúng thư mục khi có', () => {
  const goc = tam();
  execFileSync('git', ['init', '-q'], { cwd: goc });
  assert.equal(timThuMucDot(goc), null);
  const dot = path.join(goc, '.acceptance-runs', 'dieu-phoi-thu');
  fs.mkdirSync(dot, { recursive: true });
  fs.symlinkSync(dot, path.join(goc, '.acceptance-runs', TEN_LIEN_KET));
  assert.equal(timThuMucDot(goc), dot);
  assert.equal(timThuMucDot(path.join(os.tmpdir())), null);
});
```

- [ ] **Step 3: Chạy test, thấy thất bại**

Run: `node --test scripts/dieu-phoi/test/nen.test.mjs`
Expected: FAIL, với `Cannot find module '../glob.mjs'`.

- [ ] **Step 4: Viết `scripts/dieu-phoi/glob.mjs`**

```js
// Khớp glob tối giản cho ranh giới tệp: ** (nhiều cấp), * (trong một cấp), ? (một ký tự).
export function khop(mau, duongDan) {
  let re = '';
  for (let i = 0; i < mau.length; i++) {
    const c = mau[i];
    if (c === '*') {
      if (mau[i + 1] === '*') {
        i++;
        if (mau[i + 1] === '/') {
          i++;
          re += '(?:.*/)?';
        } else {
          re += '.*';
        }
      } else {
        re += '[^/]*';
      }
    } else if (c === '?') {
      re += '[^/]';
    } else {
      re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${re}$`).test(duongDan);
}

export const khopMot = (maus, duongDan) => maus.some((m) => khop(m, duongDan));
```

- [ ] **Step 5: Viết `scripts/dieu-phoi/dot.mjs`**

```js
// Thư mục đợt, JSON nguyên tử, sự kiện, ánh xạ cwd → phiên thợ. Không chứa gì riêng của kho.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const TEN_LIEN_KET = 'dieu-phoi-hien-tai';

export function gocKhoChinh(cwd) {
  const chung = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
  return path.dirname(chung);
}

export function timThuMucDot(cwd) {
  let goc;
  try {
    goc = gocKhoChinh(cwd);
  } catch {
    return null;
  }
  try {
    return fs.realpathSync(path.join(goc, '.acceptance-runs', TEN_LIEN_KET));
  } catch {
    return null;
  }
}

export function docJson(p, macDinh = null) {
  let tho;
  try {
    tho = fs.readFileSync(p, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return macDinh;
    throw e;
  }
  return JSON.parse(tho);
}

export function ghiJsonNguyenTu(p, du) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const tamThoi = `${p}.${process.pid}.tmp`;
  fs.writeFileSync(tamThoi, `${JSON.stringify(du, null, 2)}\n`);
  fs.renameSync(tamThoi, p);
}

export function ghiSuKien(thuMuc, suKien) {
  const dong = JSON.stringify({ luc: new Date().toISOString(), ...suKien });
  fs.appendFileSync(path.join(thuMuc, 'su-kien.jsonl'), `${dong}\n`);
}

export function trongWorktree(worktree, cwd) {
  let thuc;
  try {
    thuc = fs.realpathSync(cwd);
  } catch {
    return false;
  }
  return thuc === worktree || thuc.startsWith(`${worktree}${path.sep}`);
}

export function phienCuaCwd(hangViec, cwd) {
  const day = (hangViec?.day ?? []).find((d) => trongWorktree(d.worktree, cwd));
  return day ? day.id : null;
}
```

- [ ] **Step 6: Chạy test, thấy qua**

Run: `node --test scripts/dieu-phoi/test/nen.test.mjs`
Expected: PASS, 5/5.

- [ ] **Step 7: Commit**

```bash
git add package.json scripts/dieu-phoi/glob.mjs scripts/dieu-phoi/dot.mjs scripts/dieu-phoi/test/nen.test.mjs
git commit -m "feat(dieu-phoi): nền — glob, thư mục đợt, JSON nguyên tử, sự kiện"
```

---

### Task 2: Bộ lập lịch thuần — xếp hàng, cấp lượt, hạn thuê, hàng kế

**Files:**
- Create: `scripts/dieu-phoi/lich.mjs`, `scripts/dieu-phoi/test/lich.test.mjs`

**Interfaces:**
- Consumes: không có.
- Produces:
  - `TAI_NGUYEN: { s4:'s4', 'ghim-lai':'s4', 'duong-nen':'duong-nen', merge:'merge' }`
  - `xepHang(donXin: Don[], hangViec): Don[]`, với `Don = {phien, slug, loai, luc, worktree, mo_merge?, uoc_phut?, tep?}`
  - `capLuot({donXin, dangGiu: Record<taiNguyen, object|null>, giamTai: boolean, hangViec}): {taiNguyen, don}[]`
  - `xetHanThue({chu, nhipTuoiPhut: number|null, nowMs, cfg}): {hanhDong:'giu'} | {hanhDong:'gia-han', hanMoi} | {hanhDong:'thu-hoi'}`
  - `chonHangKe(hangViec, phien, tienDo: Map<slug, 'chua'|'dang'|'ky'|'gop'>): {hang, moi} | {hang:null, cho:'phu-thuoc'} | {hang:null, xong:true}`

- [ ] **Step 1: Viết test thất bại** `scripts/dieu-phoi/test/lich.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capLuot, chonHangKe, xepHang, xetHanThue } from '../lich.mjs';

const HV = {
  day: [{ id: 'P1' }, { id: 'P2' }, { id: 'P3' }, { id: 'P4' }],
  hang: [
    { ma: 'A', slug: 'a', day: 'P1', moc: '2026-10-12', uu_tien: 1 },
    { ma: 'B', slug: 'b', day: 'P2', moc: '2026-10-14', uu_tien: 1 },
    { ma: 'C', slug: 'c', day: 'P1', moc: '2026-10-12', uu_tien: 2, sau: ['B'] },
    { ma: 'D', slug: 'd', day: 'P1', moc: '2026-10-20', uu_tien: 3 },
  ],
};
const don = (phien, slug, loai, luc, them = {}) => ({ phien, slug, loai, luc, worktree: `/w/${phien}`, ...them });
const CFG = { han_thue_phut: { s4: 90, 'ghim-lai': 40, 'duong-nen': 40, merge: 120 }, nhip_cu_phut: 10 };

test('xepHang: mốc sớm trước, rồi giờ xin', () => {
  const kq = xepHang([don('P2', 'b', 's4', '2026-10-05T01:00:00Z'), don('P1', 'a', 's4', '2026-10-05T02:00:00Z')], HV);
  assert.deepEqual(kq.map((d) => d.phien), ['P1', 'P2']);
});

test('xepHang: ghim-lai mở merge chen lên trước mọi đơn', () => {
  const kq = xepHang([
    don('P1', 'a', 's4', '2026-10-05T01:00:00Z'),
    don('P2', 'b', 'ghim-lai', '2026-10-05T03:00:00Z', { mo_merge: true }),
  ], HV);
  assert.equal(kq[0].phien, 'P2');
});

test('capLuot: mỗi tài nguyên một lượt; ghim-lai dùng chung khoá s4', () => {
  const kq = capLuot({
    donXin: [
      don('P1', 'a', 's4', '2026-10-05T01:00:00Z'),
      don('P2', 'b', 'ghim-lai', '2026-10-05T01:01:00Z'),
      don('P3', 'x', 'duong-nen', '2026-10-05T01:02:00Z'),
    ],
    dangGiu: { s4: null, 'duong-nen': null, merge: null },
    giamTai: false,
    hangViec: HV,
  });
  assert.deepEqual(kq.map((c) => [c.taiNguyen, c.don.phien]), [['s4', 'P1'], ['duong-nen', 'P3']]);
});

test('capLuot: tài nguyên đang giữ thì không cấp', () => {
  const kq = capLuot({ donXin: [don('P1', 'a', 's4', 't')], dangGiu: { s4: { phien: 'P9' }, 'duong-nen': null, merge: null }, giamTai: false, hangViec: HV });
  assert.deepEqual(kq, []);
});

test('capLuot: giảm tải chặn s4, ghim-lai, duong-nen nhưng vẫn cấp merge', () => {
  const kq = capLuot({
    donXin: [don('P1', 'a', 's4', '1'), don('P2', 'b', 'duong-nen', '2'), don('P3', 'c', 'merge', '3')],
    dangGiu: { s4: null, 'duong-nen': null, merge: null },
    giamTai: true,
    hangViec: HV,
  });
  assert.deepEqual(kq.map((c) => c.taiNguyen), ['merge']);
});

test('phát lại 04/10: bốn phiên nhường chéo thì luật cũ không cấp ai, luật mới cấp một', () => {
  // Đối chứng: luật «tự nhường» cũ — mỗi phiên chỉ lấy khoá khi nó tin không ai phải đi trước nó.
  const thayDiTruoc = { P3: 'P1', P1: 'P2', P2: 'P4', P4: 'P3' };
  const luatCu = Object.keys(thayDiTruoc).filter((p) => thayDiTruoc[p] === null);
  assert.equal(luatCu.length, 0, 'luật cũ phải tái hiện quãng kẹt');
  const donXin = Object.keys(thayDiTruoc).map((p, i) => don(p, 'a', 's4', `2026-10-04T10:3${i}:00Z`));
  const kq = capLuot({ donXin, dangGiu: { s4: null, 'duong-nen': null, merge: null }, giamTai: false, hangViec: HV });
  assert.equal(kq.length, 1);
});

test('xetHanThue: còn hạn giữ; hết hạn + nhịp mới gia hạn; hết hạn + nhịp cũ thu hồi', () => {
  const now = Date.parse('2026-10-05T12:00:00Z');
  const chu = { loai: 's4', han_thue_den: '2026-10-05T11:00:00Z' };
  assert.deepEqual(xetHanThue({ chu: { ...chu, han_thue_den: '2026-10-05T13:00:00Z' }, nhipTuoiPhut: 99, nowMs: now, cfg: CFG }), { hanhDong: 'giu' });
  const gh = xetHanThue({ chu, nhipTuoiPhut: 3, nowMs: now, cfg: CFG });
  assert.equal(gh.hanhDong, 'gia-han');
  assert.equal(gh.hanMoi, '2026-10-05T13:30:00.000Z');
  assert.deepEqual(xetHanThue({ chu, nhipTuoiPhut: 25, nowMs: now, cfg: CFG }), { hanhDong: 'thu-hoi' });
  assert.deepEqual(xetHanThue({ chu, nhipTuoiPhut: null, nowMs: now, cfg: CFG }), { hanhDong: 'thu-hoi' });
});

test('chonHangKe: tiếp hàng đang làm; chọn hàng đủ phụ thuộc theo uu_tien; chờ; xong', () => {
  const td = (o) => new Map(Object.entries(o));
  assert.deepEqual(chonHangKe(HV, 'P1', td({ a: 'dang' })), { hang: 'a', moi: false });
  assert.deepEqual(chonHangKe(HV, 'P1', td({ a: 'ky' })), { hang: 'd', moi: true });
  assert.deepEqual(chonHangKe(HV, 'P1', td({ a: 'gop', b: 'gop' })), { hang: 'c', moi: true });
  assert.deepEqual(chonHangKe(HV, 'P1', td({ a: 'gop', d: 'gop', b: 'dang' })), { hang: null, cho: 'phu-thuoc' });
  assert.deepEqual(chonHangKe(HV, 'P1', td({ a: 'gop', c: 'gop', d: 'ky' })), { hang: null, xong: true });
});
```

- [ ] **Step 2: Chạy test, thấy thất bại**

Run: `node --test scripts/dieu-phoi/test/lich.test.mjs`
Expected: FAIL, với `Cannot find module '../lich.mjs'`.

- [ ] **Step 3: Viết `scripts/dieu-phoi/lich.mjs`**

```js
// Bộ lập lịch thuần: không đọc đĩa, không gọi lệnh. Spec §4.2, §4.12.
export const TAI_NGUYEN = { s4: 's4', 'ghim-lai': 's4', 'duong-nen': 'duong-nen', merge: 'merge' };
const MOC_XA = '9999-12-31';

const mocCua = (hangViec, slug) => hangViec?.hang?.find((h) => h.slug === slug)?.moc ?? MOC_XA;

export function xepHang(donXin, hangViec) {
  const khoa = (d) => [d.loai === 'ghim-lai' && d.mo_merge ? 0 : 1, mocCua(hangViec, d.slug), d.luc];
  return [...donXin].sort((a, b) => {
    const ka = khoa(a);
    const kb = khoa(b);
    for (let i = 0; i < ka.length; i++) {
      if (ka[i] < kb[i]) return -1;
      if (ka[i] > kb[i]) return 1;
    }
    return 0;
  });
}

export function capLuot({ donXin, dangGiu, giamTai, hangViec }) {
  const cap = [];
  const ban = new Set(Object.entries(dangGiu).filter(([, chu]) => chu).map(([tn]) => tn));
  for (const don of xepHang(donXin, hangViec)) {
    const tn = TAI_NGUYEN[don.loai];
    if (!tn || ban.has(tn)) continue;
    if (giamTai && tn !== 'merge') continue;
    cap.push({ taiNguyen: tn, don });
    ban.add(tn);
  }
  return cap;
}

export function xetHanThue({ chu, nhipTuoiPhut, nowMs, cfg }) {
  if (nowMs <= Date.parse(chu.han_thue_den)) return { hanhDong: 'giu' };
  if (nhipTuoiPhut !== null && nhipTuoiPhut < cfg.nhip_cu_phut) {
    const them = cfg.han_thue_phut[chu.loai] * 60_000;
    return { hanhDong: 'gia-han', hanMoi: new Date(nowMs + them).toISOString() };
  }
  return { hanhDong: 'thu-hoi' };
}

export function chonHangKe(hangViec, phien, tienDo) {
  const cua = hangViec.hang.filter((h) => h.day === phien);
  const dangLam = cua.find((h) => tienDo.get(h.slug) === 'dang');
  if (dangLam) return { hang: dangLam.slug, moi: false };
  const duPhuThuoc = (h) =>
    (h.sau ?? []).every((ma) => {
      const truoc = hangViec.hang.find((x) => x.ma === ma);
      return truoc !== undefined && tienDo.get(truoc.slug) === 'gop';
    });
  const sanSang = cua
    .filter((h) => (tienDo.get(h.slug) ?? 'chua') === 'chua' && duPhuThuoc(h))
    .sort((a, b) => (a.uu_tien ?? 99) - (b.uu_tien ?? 99));
  if (sanSang.length > 0) return { hang: sanSang[0].slug, moi: true };
  const conViec = cua.some((h) => !['ky', 'gop'].includes(tienDo.get(h.slug) ?? 'chua'));
  return conViec ? { hang: null, cho: 'phu-thuoc' } : { hang: null, xong: true };
}
```

- [ ] **Step 4: Chạy test, thấy qua**

Run: `node --test scripts/dieu-phoi/test/lich.test.mjs`
Expected: PASS, 8/8.

- [ ] **Step 5: Commit**

```bash
git add scripts/dieu-phoi/lich.mjs scripts/dieu-phoi/test/lich.test.mjs
git commit -m "feat(dieu-phoi): bộ lập lịch thuần — cấp lượt theo mốc, hạn thuê, hàng kế"
```

---

### Task 3: Canh sức khoẻ máy

**Files:**
- Create: `scripts/dieu-phoi/suc-khoe.mjs`, `scripts/dieu-phoi/test/suc-khoe.test.mjs`

**Interfaces:**
- Produces:
  - `docSwap(text): {tongGb: number|null, dungGb: number|null}`
  - `docLoad(text): number|null`
  - `docRssLonNhat(psText): {gb, lenh}|null`
  - `docApLuc(text): number|null`
  - `danhGiaSucKhoe({swap, apLuc, load, rssLonNhat}, cfg): {giamTai: boolean, lyDo: string[], canNguoi: string|null, load}`

- [ ] **Step 1: Viết test thất bại** `scripts/dieu-phoi/test/suc-khoe.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { danhGiaSucKhoe, docApLuc, docLoad, docRssLonNhat, docSwap } from '../suc-khoe.mjs';

const CFG = { suc_khoe: { swap_gb: 8, ap_luc_muc: 2, rss_gb: 8 } };

test('docSwap/docLoad/docRssLonNhat đọc đúng định dạng macOS', () => {
  assert.deepEqual(docSwap('total = 24576.00M  used = 22835.25M  free = 1740.75M  (encrypted)'), { tongGb: 24, dungGb: 22835.25 / 1024 });
  assert.equal(docLoad('{ 27.10 20.03 14.50 }'), 27.1);
  assert.deepEqual(docRssLonNhat('  102400 node\n19922944 /System/Library/fseventsd\n'), { gb: 19, lenh: '/System/Library/fseventsd' });
  assert.equal(docRssLonNhat(''), null);
  assert.equal(docApLuc('2\n'), 2);
  assert.equal(docApLuc('lỗi'), null);
});

test('ca 04/10 (swap 22,3/24 GB, fseventsd 19 GB) → giảm tải + cần người', () => {
  const kq = danhGiaSucKhoe({ swap: { tongGb: 24, dungGb: 22.3 }, apLuc: 4, load: 27.1, rssLonNhat: { gb: 19, lenh: 'fseventsd' } }, CFG);
  assert.equal(kq.giamTai, true);
  assert.match(kq.lyDo.join('; '), /swap 22\.3\/24\.0 GB; áp lực bộ nhớ mức 4/);
  assert.match(kq.canNguoi, /fseventsd giữ 19\.0 GB RSS/);
});

test('báo động giả đo 05/10: swap 1,6/3 GB (54 %) nhưng áp lực mức 1 → KHÔNG giảm tải', () => {
  const kq = danhGiaSucKhoe({ swap: { tongGb: 3, dungGb: 1.6 }, apLuc: 1, load: 5.4, rssLonNhat: { gb: 5.3, lenh: 'VirtualMachine' } }, CFG);
  assert.deepEqual([kq.giamTai, kq.canNguoi], [false, null]);
  const kq0 = danhGiaSucKhoe({ swap: { tongGb: 0, dungGb: 0 }, apLuc: null, load: 1, rssLonNhat: null }, CFG);
  assert.equal(kq0.giamTai, false);
});

test('áp lực mức 2 (cảnh báo) dù swap nhỏ → giảm tải', () => {
  const kq = danhGiaSucKhoe({ swap: { tongGb: 2, dungGb: 0.5 }, apLuc: 2, load: 9, rssLonNhat: null }, CFG);
  assert.equal(kq.giamTai, true);
  assert.deepEqual(kq.lyDo, ['áp lực bộ nhớ mức 2']);
});

test('swap tuyệt đối vượt 8 GB dù tỉ lệ thấp → giảm tải', () => {
  assert.equal(danhGiaSucKhoe({ swap: { tongGb: 64, dungGb: 9 }, apLuc: 1, load: 1, rssLonNhat: null }, CFG).giamTai, true);
});
```

- [ ] **Step 2: Chạy test, thấy thất bại**

Run: `node --test scripts/dieu-phoi/test/suc-khoe.test.mjs`
Expected: FAIL, với `Cannot find module '../suc-khoe.mjs'`.

- [ ] **Step 3: Viết `scripts/dieu-phoi/suc-khoe.mjs`**

```js
// Đọc sysctl/ps của macOS và đánh giá giảm tải. Spec §4.3.
export function docSwap(text) {
  const so = (khoa) => {
    const m = text.match(new RegExp(`${khoa} = ([\\d.]+)M`));
    return m ? Number(m[1]) / 1024 : null;
  };
  return { tongGb: so('total'), dungGb: so('used') };
}

export function docLoad(text) {
  const m = text.match(/\{\s*([\d.]+)/);
  return m ? Number(m[1]) : null;
}

export function docRssLonNhat(psText) {
  let lonNhat = null;
  for (const dong of psText.trim().split('\n')) {
    const m = dong.trim().match(/^(\d+)\s+(.+)$/);
    if (!m) continue;
    const gb = Number(m[1]) / 1024 / 1024;
    if (lonNhat === null || gb > lonNhat.gb) lonNhat = { gb, lenh: m[2] };
  }
  return lonNhat;
}

// kern.memorystatus_vm_pressure_level: 1 bình thường · 2 cảnh báo · 4 nguy cấp.
export function docApLuc(text) {
  const m = String(text).match(/^\s*(\d+)/);
  return m ? Number(m[1]) : null;
}

export function danhGiaSucKhoe({ swap, apLuc, load, rssLonNhat }, cfg) {
  const nguong = cfg.suc_khoe;
  const lyDo = [];
  const dung = swap.dungGb ?? 0;
  const tong = swap.tongGb ?? 0;
  if (dung > nguong.swap_gb) lyDo.push(`swap ${dung.toFixed(1)}/${tong.toFixed(1)} GB`);
  if (Number.isFinite(apLuc) && apLuc >= nguong.ap_luc_muc) lyDo.push(`áp lực bộ nhớ mức ${apLuc}`);
  const canNguoi = rssLonNhat && rssLonNhat.gb > nguong.rss_gb ? `${rssLonNhat.lenh} giữ ${rssLonNhat.gb.toFixed(1)} GB RSS` : null;
  return { giamTai: lyDo.length > 0, lyDo, canNguoi, load };
}
```

- [ ] **Step 4: Chạy test, thấy qua**

Run: `node --test scripts/dieu-phoi/test/suc-khoe.test.mjs`
Expected: PASS, 5/5.

- [ ] **Step 5: Commit**

```bash
git add scripts/dieu-phoi/suc-khoe.mjs scripts/dieu-phoi/test/suc-khoe.test.mjs
git commit -m "feat(dieu-phoi): canh sức khoẻ máy — swap, load, tiến trình phình"
```

---

### Task 4: Kênh yêu cầu — phần máy quyết

**Files:**
- Create: `scripts/dieu-phoi/yeu-cau.mjs`, `scripts/dieu-phoi/test/yeu-cau.test.mjs`

**Interfaces:**
- Consumes: `khopMot` (Task 1).
- Produces:
  - `xetYeuCau(yc, nguCanh, cfg): {ket_qua:'duyet'|'gop'|'can_phan', boi?:'may', ly_do: string, dich?:'owner', voi?: string}`
  - `yc = {id, phien, loai, hang, noi_dung, luc}`
  - `nguCanh = {hangViec, nhanhChamTep: Map<tệp, nhánh[]>, nhanhCua: (phien)=>string|null, yeuCauGanDay: yc[]}`

- [ ] **Step 1: Viết test thất bại** `scripts/dieu-phoi/test/yeu-cau.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { xetYeuCau } from '../yeu-cau.mjs';

const CFG = { bao_ve: ['packages/db/prisma/schema.prisma', 'packages/db/prisma/migrations/**'], s4_tran_gom_phut: 60 };
const HV = {
  day: [{ id: 'P1' }, { id: 'P2' }],
  hang: [
    { slug: 'a', day: 'P1', ranh_gioi: ['apps/app/okr/**'], chung_chi_them: ['apps/app/lib/messages/*.ts'] },
    { slug: 'b', day: 'P2', ranh_gioi: ['apps/api/src/to-chuc/**'] },
  ],
};
const nc = (them = {}) => ({ hangViec: HV, nhanhChamTep: new Map(), nhanhCua: (p) => `feat/${p}`, yeuCauGanDay: [], ...them });
const yc = (loai, noi_dung, them = {}) => ({ id: 'y1', phien: 'P1', loai, hang: 'a', noi_dung, luc: '2026-10-05T10:00:00Z', ...them });

test('cham-tep: tệp không ai giữ → máy duyệt', () => {
  const kq = xetYeuCau(yc('cham-tep', { tep: ['apps/app/record-parts.tsx'] }), nc(), CFG);
  assert.equal(kq.ket_qua, 'duyet');
  assert.equal(kq.boi, 'may');
});

test('cham-tep: ba ca đỏ, mỗi ca đúng lý do', () => {
  assert.match(xetYeuCau(yc('cham-tep', { tep: ['packages/db/prisma/migrations/2026/x.sql'] }), nc(), CFG).ly_do, /danh sách bảo vệ/);
  assert.match(xetYeuCau(yc('cham-tep', { tep: ['apps/app/lib/messages/okr.ts'] }), nc(), CFG).ly_do, /danh sách bảo vệ/);
  assert.match(xetYeuCau(yc('cham-tep', { tep: ['apps/api/src/to-chuc/x.ts'] }), nc(), CFG).ly_do, /ranh giới P2/);
  const coNhanh = nc({ nhanhChamTep: new Map([['apps/x.ts', ['feat/P2', 'feat/P1']]]) });
  const kq = xetYeuCau(yc('cham-tep', { tep: ['apps/x.ts'] }), coNhanh, CFG);
  assert.equal(kq.ket_qua, 'can_phan');
  assert.match(kq.ly_do, /đang được nhánh feat\/P2 sửa/);
  assert.doesNotMatch(kq.ly_do, /feat\/P1/);
});

test('cham-tep: nhánh của chính phiên xin không tính là vướng (chiều im)', () => {
  const kq = xetYeuCau(yc('cham-tep', { tep: ['apps/x.ts'] }), nc({ nhanhChamTep: new Map([['apps/x.ts', ['feat/P1']]]) }), CFG);
  assert.equal(kq.ket_qua, 'duyet');
});

test('cham-tep không nêu tệp → can_phan', () => {
  assert.equal(xetYeuCau(yc('cham-tep', {}), nc(), CFG).ket_qua, 'can_phan');
});

test('viec-phu: trùng trong 24 giờ cùng kho + cùng tiêu đề hoặc chung tệp → gộp; khác → can_phan', () => {
  const cu = yc('viec-phu', { kho: 'crm', tieu_de: 'Sửa ca chập chờn  o-so-man', tep: ['apps/app/test/a.tsx'] }, { id: 'y0', luc: '2026-10-05T01:00:00Z' });
  const moi = yc('viec-phu', { kho: 'crm', tieu_de: 'sửa ca chập chờn o-so-man' });
  assert.deepEqual(xetYeuCau(moi, nc({ yeuCauGanDay: [cu] }), CFG), { ket_qua: 'gop', boi: 'may', ly_do: 'trùng yêu cầu y0', voi: 'y0' });
  const chungTep = yc('viec-phu', { kho: 'crm', tieu_de: 'khác', tep: ['apps/app/test/a.tsx'] });
  assert.equal(xetYeuCau(chungTep, nc({ yeuCauGanDay: [cu] }), CFG).ket_qua, 'gop');
  const khacKho = yc('viec-phu', { kho: 'kit', tieu_de: 'sửa ca chập chờn o-so-man' });
  assert.equal(xetYeuCau(khacKho, nc({ yeuCauGanDay: [cu] }), CFG).ket_qua, 'can_phan');
  const quaHan = { ...cu, luc: '2026-10-03T00:00:00Z' };
  assert.equal(xetYeuCau(moi, nc({ yeuCauGanDay: [quaHan] }), CFG).ket_qua, 'can_phan');
});

test('s4-gom/gia-han: trong trần → máy; vượt hoặc thiếu ước → can_phan', () => {
  assert.equal(xetYeuCau(yc('s4-gom', { uoc_phut: 50 }), nc(), CFG).ket_qua, 'duyet');
  assert.equal(xetYeuCau(yc('gia-han', { uoc_phut: 75 }), nc(), CFG).ket_qua, 'can_phan');
  assert.equal(xetYeuCau(yc('gia-han', {}), nc(), CFG).ket_qua, 'can_phan');
});

test('can-nguoi → can_phan dich owner; hang-moi, chuyen-hang, khac → can_phan', () => {
  assert.deepEqual(xetYeuCau(yc('can-nguoi', {}), nc(), CFG), { ket_qua: 'can_phan', dich: 'owner', ly_do: 'việc chỉ người làm được' });
  for (const loai of ['hang-moi', 'chuyen-hang', 'khac', 'la']) assert.equal(xetYeuCau(yc(loai, {}), nc(), CFG).ket_qua, 'can_phan');
});
```

- [ ] **Step 2: Chạy test, thấy thất bại**

Run: `node --test scripts/dieu-phoi/test/yeu-cau.test.mjs`
Expected: FAIL, với `Cannot find module '../yeu-cau.mjs'`.

- [ ] **Step 3: Viết `scripts/dieu-phoi/yeu-cau.mjs`**

```js
// Định tuyến yêu cầu của phiên thợ: máy quyết phần kiểm được, phần còn lại là can_phan. Spec §4.9.
import { khopMot } from './glob.mjs';

const MOT_NGAY_MS = 24 * 3600_000;

export function xetYeuCau(yc, nguCanh, cfg) {
  switch (yc.loai) {
    case 'cham-tep':
      return xetChamTep(yc, nguCanh, cfg);
    case 'viec-phu':
      return xetViecPhu(yc, nguCanh);
    case 's4-gom':
    case 'gia-han': {
      const uoc = yc.noi_dung?.uoc_phut;
      if (Number.isFinite(uoc) && uoc <= cfg.s4_tran_gom_phut) {
        return { ket_qua: 'duyet', boi: 'may', ly_do: `trong trần ${cfg.s4_tran_gom_phut}′` };
      }
      return { ket_qua: 'can_phan', ly_do: `ước ${uoc ?? '?'}′ vượt trần ${cfg.s4_tran_gom_phut}′` };
    }
    case 'can-nguoi':
      return { ket_qua: 'can_phan', dich: 'owner', ly_do: 'việc chỉ người làm được' };
    default:
      return { ket_qua: 'can_phan', ly_do: `loại ${yc.loai} cần phán` };
  }
}

function xetChamTep(yc, nguCanh, cfg) {
  const tep = yc.noi_dung?.tep ?? [];
  if (tep.length === 0) return { ket_qua: 'can_phan', ly_do: 'yêu cầu không nêu tệp' };
  const baoVe = [...cfg.bao_ve, ...nguCanh.hangViec.hang.flatMap((h) => h.chung_chi_them ?? [])];
  const nhanhMinh = nguCanh.nhanhCua(yc.phien);
  for (const t of tep) {
    if (khopMot(baoVe, t)) return { ket_qua: 'can_phan', ly_do: `${t} thuộc danh sách bảo vệ` };
    const chu = nguCanh.hangViec.hang.find((h) => h.day !== yc.phien && khopMot(h.ranh_gioi ?? [], t));
    if (chu) return { ket_qua: 'can_phan', ly_do: `${t} thuộc ranh giới ${chu.day}` };
    const nhanh = (nguCanh.nhanhChamTep.get(t) ?? []).filter((b) => b !== nhanhMinh);
    if (nhanh.length > 0) return { ket_qua: 'can_phan', ly_do: `${t} đang được nhánh ${nhanh.join(', ')} sửa` };
  }
  return { ket_qua: 'duyet', boi: 'may', ly_do: 'không ai giữ, không nhánh mở nào chạm, không thuộc danh sách bảo vệ' };
}

const chuanHoa = (s) => (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

function xetViecPhu(yc, nguCanh) {
  const luc = Date.parse(yc.luc);
  const tepMoi = yc.noi_dung?.tep ?? [];
  const trung = nguCanh.yeuCauGanDay.find(
    (c) =>
      c.loai === 'viec-phu' &&
      c.id !== yc.id &&
      luc - Date.parse(c.luc) < MOT_NGAY_MS &&
      c.noi_dung?.kho === yc.noi_dung?.kho &&
      (chuanHoa(c.noi_dung?.tieu_de) === chuanHoa(yc.noi_dung?.tieu_de) ||
        (c.noi_dung?.tep ?? []).some((t) => tepMoi.includes(t))),
  );
  if (trung) return { ket_qua: 'gop', boi: 'may', ly_do: `trùng yêu cầu ${trung.id}`, voi: trung.id };
  return { ket_qua: 'can_phan', ly_do: 'việc phụ mới' };
}
```

- [ ] **Step 4: Chạy test, thấy qua**

Run: `node --test scripts/dieu-phoi/test/yeu-cau.test.mjs`
Expected: PASS, 7/7.

- [ ] **Step 5: Commit**

```bash
git add scripts/dieu-phoi/yeu-cau.mjs scripts/dieu-phoi/test/yeu-cau.test.mjs
git commit -m "feat(dieu-phoi): kênh yêu cầu — máy duyệt chạm tệp, gộp việc phụ trùng"
```

---

### Task 5: Hook chặn S4 (đóng khi lỗi) + đăng ký PreToolUse

**Files:**
- Create: `scripts/dieu-phoi/hook-chan-s4.mjs`, `scripts/dieu-phoi/test/hook-chan-s4.test.mjs`
- Modify: `.claude/settings.json`

**Interfaces:**
- Consumes: `timThuMucDot`, `docJson`, `trongWorktree` (Task 1).
- Produces:
  - `LENH_MAC_DINH`
  - `phanLoai(dauVao, lenh?): 's4'|'duong-nen'|null`
  - `quyet(dauVao, {timDot}?): {ma: 0} | {ma: 2, loi: string}`
  - `chayHook(raw: string, {timDot}?): {ma, loi?}`

- [ ] **Step 1: Viết test thất bại** `scripts/dieu-phoi/test/hook-chan-s4.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chayHook, phanLoai } from '../hook-chan-s4.mjs';

const tam = () => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'dp-')));
function dung() {
  const dot = tam();
  const wt = tam();
  fs.writeFileSync(path.join(dot, 'dieu-phoi.config.json'), '{}');
  return { dot, wt, timDot: () => dot };
}
const wf = (cwd) => JSON.stringify({ tool_name: 'Workflow', cwd, tool_input: { scriptPath: '/x/workflows/acceptance-verify.js' } });
const bash = (cwd, command) => JSON.stringify({ tool_name: 'Bash', cwd, tool_input: { command } });

test('phanLoai: chỉ lệnh S4 được phân loại', () => {
  assert.equal(phanLoai({ tool_name: 'Workflow', tool_input: { scriptPath: 'a/acceptance-verify.js' } }), 's4');
  assert.equal(phanLoai({ tool_name: 'Workflow', tool_input: { scriptPath: 'a/execute-parallel.js' } }), null);
  assert.equal(phanLoai({ tool_name: 'Bash', tool_input: { command: 'node x/repin-lane.mjs --write' } }), 's4');
  assert.equal(phanLoai({ tool_name: 'Bash', tool_input: { command: 'node x/duong-nen.mjs --slug a' } }), 'duong-nen');
  assert.equal(phanLoai({ tool_name: 'Bash', tool_input: { command: 'bun test' } }), null);
});

test('chưa có lượt → exit 2, thông điệp gọi tên khoá và cách xin', () => {
  const { wt, timDot } = dung();
  const kq = chayHook(wf(wt), { timDot });
  assert.equal(kq.ma, 2);
  assert.match(kq.loi, /^chan-s4: khoá s4 đang trống nhưng chưa cấp cho phiên này\. Ghi đơn xin\/<phiên>-s4\.json/);
});

test('khoá thuộc phiên khác → exit 2 nêu tên phiên giữ', () => {
  const { dot, wt, timDot } = dung();
  fs.mkdirSync(path.join(dot, 'khoa', 's4'), { recursive: true });
  fs.writeFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), JSON.stringify({ phien: 'P9', worktree: '/khac' }));
  assert.match(chayHook(wf(wt), { timDot }).loi, /khoá s4 đang thuộc P9/);
});

test('có lượt đúng worktree (kể cả qua symlink và thư mục con) → 0', () => {
  const { dot, wt, timDot } = dung();
  fs.mkdirSync(path.join(wt, 'apps'));
  const lk = path.join(tam(), 'lk');
  fs.symlinkSync(wt, lk);
  fs.mkdirSync(path.join(dot, 'khoa', 's4'), { recursive: true });
  fs.writeFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), JSON.stringify({ phien: 'P1', worktree: wt }));
  assert.equal(chayHook(wf(path.join(wt, 'apps')), { timDot }).ma, 0);
  assert.equal(chayHook(bash(lk, 'node repin-lane.mjs'), { timDot }).ma, 0);
});

test('chiều im: không có đợt, hoặc lệnh không phải S4 → 0, kể cả khi config hỏng', () => {
  const { dot, wt, timDot } = dung();
  assert.equal(chayHook(wf(wt), { timDot: () => null }).ma, 0);
  fs.writeFileSync(path.join(dot, 'dieu-phoi.config.json'), '{hong');
  assert.equal(chayHook(bash(wt, 'git status'), { timDot }).ma, 0);
  assert.equal(chayHook('khong-phai-json', { timDot }).ma, 0);
});

test('đóng khi lỗi: lệnh S4 + lỗi nội bộ → 2 «lỗi nội bộ»', () => {
  const { dot, wt, timDot } = dung();
  fs.writeFileSync(path.join(dot, 'dieu-phoi.config.json'), '{hong');
  const kq = chayHook(wf(wt), { timDot });
  assert.equal(kq.ma, 2);
  assert.match(kq.loi, /^chan-s4: lỗi nội bộ: .* — chặn để an toàn; báo phiên giám sát$/);
  assert.equal(chayHook('{"tool_name":"Workflow","x": acceptance-verify.js', { timDot }).ma, 2);
});
```

- [ ] **Step 2: Chạy test, thấy thất bại**

Run: `node --test scripts/dieu-phoi/test/hook-chan-s4.test.mjs`
Expected: FAIL, với `Cannot find module '../hook-chan-s4.mjs'`.

- [ ] **Step 3: Viết `scripts/dieu-phoi/hook-chan-s4.mjs`**

```js
#!/usr/bin/env node
// Hook PreToolUse: chặn S4 khi phiên chưa giữ lượt. Chỉ lệnh S4 bị xét; lệnh S4 gặp lỗi thì chặn (spec §4.5).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { docJson, timThuMucDot, trongWorktree } from './dot.mjs';

export const LENH_MAC_DINH = {
  workflow_script: 'acceptance-verify.js',
  bash: { 'repin-lane': 's4', 's4-args': 's4', 'duong-nen.mjs': 'duong-nen' },
};
const MAU_THO = /acceptance-verify\.js|repin-lane|s4-args|duong-nen\.mjs/;

export function phanLoai(dauVao, lenh = LENH_MAC_DINH) {
  if (dauVao.tool_name === 'Workflow') {
    return String(dauVao.tool_input?.scriptPath ?? '').endsWith(lenh.workflow_script) ? 's4' : null;
  }
  if (dauVao.tool_name === 'Bash') {
    const lenhBash = String(dauVao.tool_input?.command ?? '');
    for (const [mau, taiNguyen] of Object.entries(lenh.bash)) if (lenhBash.includes(mau)) return taiNguyen;
  }
  return null;
}

export function quyet(dauVao, { timDot = timThuMucDot } = {}) {
  const thuMuc = timDot(dauVao.cwd);
  if (!thuMuc) return { ma: 0 };
  docJson(path.join(thuMuc, 'dieu-phoi.config.json'), {}); // config hỏng trong đợt → ném → đóng khi lỗi
  const taiNguyen = phanLoai(dauVao);
  if (!taiNguyen) return { ma: 0 };
  const chu = docJson(path.join(thuMuc, 'khoa', taiNguyen, 'chu.json'));
  if (chu && trongWorktree(chu.worktree, dauVao.cwd)) return { ma: 0 };
  const tinhTrang = chu ? `đang thuộc ${chu.phien}` : 'đang trống nhưng chưa cấp cho phiên này';
  return {
    ma: 2,
    loi: `chan-s4: khoá ${taiNguyen} ${tinhTrang}. Ghi đơn xin/<phiên>-${taiNguyen}.json trong ${thuMuc} rồi chờ khoa/${taiNguyen}/chu.json ghi tên phiên này.`,
  };
}

export function chayHook(raw, tuyChon = {}) {
  let dauVao;
  try {
    dauVao = JSON.parse(raw);
  } catch {
    return MAU_THO.test(raw) ? { ma: 2, loi: 'chan-s4: lỗi nội bộ: đầu vào không đọc được — chặn để an toàn; báo phiên giám sát' } : { ma: 0 };
  }
  if (phanLoai(dauVao) === null && !MAU_THO.test(raw)) return { ma: 0 };
  try {
    return quyet(dauVao, tuyChon);
  } catch (e) {
    return { ma: 2, loi: `chan-s4: lỗi nội bộ: ${e.message} — chặn để an toàn; báo phiên giám sát` };
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  let raw = '';
  for await (const manh of process.stdin) raw += manh;
  const kq = chayHook(raw);
  if (kq.loi) process.stderr.write(`${kq.loi}\n`);
  process.exit(kq.ma);
}
```

Ghi chú: `node --test` của Node 26 nhận mẫu glob, không nhận đường dẫn thư mục; vì vậy script dùng `"scripts/dieu-phoi/test/*.test.mjs"`.

Ghi chú: dòng `if (phanLoai(dauVao) === null && !MAU_THO.test(raw)) return { ma: 0 }` làm lệnh không phải S4 thoát 0 **trước khi** đọc config. Vì vậy config hỏng không chặn được lệnh thường (Review Focus 1).

- [ ] **Step 4: Chạy test, thấy qua**

Run: `node --test scripts/dieu-phoi/test/hook-chan-s4.test.mjs`
Expected: PASS, 6/6.

- [ ] **Step 5: Đăng ký hook** — thêm khối `"hooks"` vào `.claude/settings.json`, cùng cấp với `"worktree"`:

```json
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Workflow|Bash",
        "hooks": [
          { "type": "command", "timeout": 10, "command": "f=\"$CLAUDE_PROJECT_DIR/scripts/dieu-phoi/hook-chan-s4.mjs\"; [ -f \"$f\" ] || exit 0; exec node \"$f\"" }
        ]
      }
    ]
  },
```

`[ -f "$f" ] || exit 0` giữ im lặng trên các nhánh cũ chưa có script. `exec` giữ nguyên mã thoát 2.

- [ ] **Step 6: Kiểm tay trong một phiên crm**, ngoài đợt:

Run: `echo '{"tool_name":"Bash","cwd":"'$PWD'","tool_input":{"command":"git status"}}' | node scripts/dieu-phoi/hook-chan-s4.mjs; echo "ma=$?"`
Expected: `ma=0`, không có stderr.

- [ ] **Step 7: Commit**

```bash
git add .claude/settings.json scripts/dieu-phoi/hook-chan-s4.mjs scripts/dieu-phoi/test/hook-chan-s4.test.mjs
git commit -m "feat(dieu-phoi): hook chặn S4 khi chưa có lượt, đóng khi lỗi"
```

---

### Task 6: Hook nhịp + hook chờ người

**Files:**
- Create: `scripts/dieu-phoi/hook-nhip.mjs`, `scripts/dieu-phoi/hook-cho-nguoi.mjs`, `scripts/dieu-phoi/test/hook-nhip-cho-nguoi.test.mjs`
- Modify: `.claude/settings.json`

**Interfaces:**
- Consumes: `timThuMucDot`, `docJson`, `ghiJsonNguyenTu`, `phienCuaCwd`, `trongWorktree` (Task 1).
- Produces:
  - `chamNhip(dauVao, {timDot}?): string[]` (danh sách tài nguyên đã chạm)
  - `xuLyChoNguoi(dauVao, {timDot}?): 'ngoai-dot'|'khong-phai-tho'|'xoa'|'bo-qua'|'cho-luot'|'cho-tra-loi'|'ghi'`

- [ ] **Step 1: Viết test thất bại** `scripts/dieu-phoi/test/hook-nhip-cho-nguoi.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chamNhip } from '../hook-nhip.mjs';
import { xuLyChoNguoi } from '../hook-cho-nguoi.mjs';

const tam = () => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'dp-')));
function dung() {
  const dot = tam();
  const wt = tam();
  fs.writeFileSync(path.join(dot, 'hang-viec.json'), JSON.stringify({ day: [{ id: 'P1', worktree: wt }], hang: [] }));
  return { dot, wt, timDot: () => dot };
}

test('chamNhip: chỉ chạm khoá mà phiên này giữ', () => {
  const { dot, wt, timDot } = dung();
  for (const [tn, w] of [['s4', wt], ['merge', '/khac']]) {
    fs.mkdirSync(path.join(dot, 'khoa', tn), { recursive: true });
    fs.writeFileSync(path.join(dot, 'khoa', tn, 'chu.json'), JSON.stringify({ phien: 'P1', worktree: w }));
  }
  assert.deepEqual(chamNhip({ cwd: wt }, { timDot }), ['s4']);
  assert.equal(fs.existsSync(path.join(dot, 'khoa', 's4', 'nhip')), true);
  assert.equal(fs.existsSync(path.join(dot, 'khoa', 'merge', 'nhip')), false);
  assert.deepEqual(chamNhip({ cwd: wt }, { timDot: () => null }), []);
});

test('chờ người: idle_prompt ghi; UserPromptSubmit xoá; loại khác bỏ qua', () => {
  const { dot, wt, timDot } = dung();
  const tep = path.join(dot, 'cho-nguoi', 'P1.json');
  assert.equal(xuLyChoNguoi({ hook_event_name: 'Notification', notification_type: 'idle_prompt', message: 'Claude đang chờ', cwd: wt, session_id: 's1' }, { timDot }), 'ghi');
  const ghi = JSON.parse(fs.readFileSync(tep, 'utf8'));
  assert.deepEqual([ghi.phien, ghi.loai, ghi.tin, ghi.session_id], ['P1', 'idle_prompt', 'Claude đang chờ', 's1']);
  assert.equal(xuLyChoNguoi({ hook_event_name: 'Notification', notification_type: 'auth_success', cwd: wt }, { timDot }), 'bo-qua');
  assert.equal(xuLyChoNguoi({ hook_event_name: 'UserPromptSubmit', cwd: wt }, { timDot }), 'xoa');
  assert.equal(fs.existsSync(tep), false);
});

test('chờ người — chiều im: đang có đơn xin hoặc yêu cầu chưa trả lời thì không vào hộp quyết định', () => {
  const { dot, wt, timDot } = dung();
  const tb = { hook_event_name: 'Notification', notification_type: 'idle_prompt', cwd: wt };
  fs.mkdirSync(path.join(dot, 'xin'));
  fs.writeFileSync(path.join(dot, 'xin', 'P1-s4.json'), '{}');
  assert.equal(xuLyChoNguoi(tb, { timDot }), 'cho-luot');
  fs.rmSync(path.join(dot, 'xin', 'P1-s4.json'));
  fs.mkdirSync(path.join(dot, 'yeu-cau'));
  fs.writeFileSync(path.join(dot, 'yeu-cau', 'P1-3.json'), JSON.stringify({ id: 'P1-3' }));
  assert.equal(xuLyChoNguoi(tb, { timDot }), 'cho-tra-loi');
  fs.mkdirSync(path.join(dot, 'tra-loi'));
  fs.writeFileSync(path.join(dot, 'tra-loi', 'P1-3.json'), '{}');
  assert.equal(xuLyChoNguoi(tb, { timDot }), 'ghi');
  assert.equal(fs.existsSync(path.join(dot, 'cho-nguoi', 'P1.json')), true);
});

test('chờ người: ngoài đợt và phiên không phải thợ', () => {
  const { timDot } = dung();
  assert.equal(xuLyChoNguoi({ hook_event_name: 'UserPromptSubmit', cwd: tam() }, { timDot: () => null }), 'ngoai-dot');
  assert.equal(xuLyChoNguoi({ hook_event_name: 'UserPromptSubmit', cwd: tam() }, { timDot }), 'khong-phai-tho');
});
```

- [ ] **Step 2: Chạy test, thấy thất bại**

Run: `node --test scripts/dieu-phoi/test/hook-nhip-cho-nguoi.test.mjs`
Expected: FAIL, với `Cannot find module '../hook-nhip.mjs'`.

- [ ] **Step 3: Viết `scripts/dieu-phoi/hook-nhip.mjs`**

```js
#!/usr/bin/env node
// Hook PostToolUse: phiên đang giữ khoá thì chạm khoa/<tên>/nhip — tín hiệu còn sống cho hạn thuê (spec §4.2).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { docJson, timThuMucDot, trongWorktree } from './dot.mjs';

export function chamNhip(dauVao, { timDot = timThuMucDot } = {}) {
  const thuMuc = timDot(dauVao.cwd);
  if (!thuMuc) return [];
  const goc = path.join(thuMuc, 'khoa');
  if (!fs.existsSync(goc)) return [];
  const daCham = [];
  for (const taiNguyen of fs.readdirSync(goc)) {
    const chu = docJson(path.join(goc, taiNguyen, 'chu.json'));
    if (chu && trongWorktree(chu.worktree, dauVao.cwd)) {
      fs.writeFileSync(path.join(goc, taiNguyen, 'nhip'), new Date().toISOString());
      daCham.push(taiNguyen);
    }
  }
  return daCham;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  let raw = '';
  for await (const manh of process.stdin) raw += manh;
  try {
    chamNhip(JSON.parse(raw));
  } catch {
    // PostToolUse không chặn được gì; lỗi ở đây chỉ làm mất một nhịp, hạn thuê vẫn che.
  }
  process.exit(0);
}
```

- [ ] **Step 4: Viết `scripts/dieu-phoi/hook-cho-nguoi.mjs`**

```js
#!/usr/bin/env node
// Hook Notification + UserPromptSubmit: tự ghi và tự xoá «chờ người» cho hộp quyết định (spec §4.9).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { docJson, ghiJsonNguyenTu, phienCuaCwd, timThuMucDot } from './dot.mjs';

const LOAI_CHO = new Set(['idle_prompt', 'permission_prompt']);

function coTepBatDau(thuMuc, ten, tienTo) {
  const d = path.join(thuMuc, ten);
  return fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.startsWith(tienTo) && f.endsWith('.json')) : [];
}

export function xuLyChoNguoi(dauVao, { timDot = timThuMucDot } = {}) {
  const thuMuc = timDot(dauVao.cwd);
  if (!thuMuc) return 'ngoai-dot';
  const hangViec = docJson(path.join(thuMuc, 'hang-viec.json'), { day: [], hang: [] });
  const phien = phienCuaCwd(hangViec, dauVao.cwd);
  if (!phien) return 'khong-phai-tho';
  const tep = path.join(thuMuc, 'cho-nguoi', `${phien}.json`);
  if (dauVao.hook_event_name === 'UserPromptSubmit') {
    fs.rmSync(tep, { force: true });
    return 'xoa';
  }
  if (dauVao.hook_event_name !== 'Notification' || !LOAI_CHO.has(dauVao.notification_type)) return 'bo-qua';
  if (coTepBatDau(thuMuc, 'xin', `${phien}-`).length > 0) return 'cho-luot';
  const chuaTraLoi = coTepBatDau(thuMuc, 'yeu-cau', `${phien}-`).some((f) => !fs.existsSync(path.join(thuMuc, 'tra-loi', f)));
  if (chuaTraLoi) return 'cho-tra-loi';
  ghiJsonNguyenTu(tep, {
    phien,
    loai: dauVao.notification_type,
    tin: dauVao.message ?? '',
    luc: new Date().toISOString(),
    session_id: dauVao.session_id ?? null,
  });
  return 'ghi';
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  let raw = '';
  for await (const manh of process.stdin) raw += manh;
  try {
    xuLyChoNguoi(JSON.parse(raw));
  } catch {
    // Hộp quyết định thiếu một dòng thì phiên giám sát vẫn thấy chấm «cần anh» của app.
  }
  process.exit(0);
}
```

Ghi chú: tên tệp trả lời là `tra-loi/<id>.json`, và `id` của yêu cầu trùng tên tệp yêu cầu không kèm đuôi. Quy ước này ghi trong README (Task 9) và được bộ phát lịch dùng ở Task 8.

- [ ] **Step 5: Chạy test, thấy qua**

Run: `node --test scripts/dieu-phoi/test/hook-nhip-cho-nguoi.test.mjs`
Expected: PASS, 4/4.

- [ ] **Step 6: Đăng ký hook** — trong khối `"hooks"` của `.claude/settings.json`, thêm ba mục sau `"PreToolUse"`:

```json
    "PostToolUse": [
      { "matcher": "*", "hooks": [ { "type": "command", "timeout": 10, "command": "f=\"$CLAUDE_PROJECT_DIR/scripts/dieu-phoi/hook-nhip.mjs\"; [ -f \"$f\" ] || exit 0; exec node \"$f\"" } ] }
    ],
    "Notification": [
      { "matcher": "idle_prompt|permission_prompt", "hooks": [ { "type": "command", "timeout": 10, "command": "f=\"$CLAUDE_PROJECT_DIR/scripts/dieu-phoi/hook-cho-nguoi.mjs\"; [ -f \"$f\" ] || exit 0; exec node \"$f\"" } ] }
    ],
    "UserPromptSubmit": [
      { "hooks": [ { "type": "command", "timeout": 10, "command": "f=\"$CLAUDE_PROJECT_DIR/scripts/dieu-phoi/hook-cho-nguoi.mjs\"; [ -f \"$f\" ] || exit 0; exec node \"$f\"" } ] }
    ]
```

- [ ] **Step 7: Commit**

```bash
git add .claude/settings.json scripts/dieu-phoi/hook-nhip.mjs scripts/dieu-phoi/hook-cho-nguoi.mjs scripts/dieu-phoi/test/hook-nhip-cho-nguoi.test.mjs
git commit -m "feat(dieu-phoi): hook nhịp cho hạn thuê và hook chờ người cho hộp quyết định"
```

---

### Task 7: Bảng đồng hồ

**Files:**
- Create: `scripts/dieu-phoi/bang.mjs`, `scripts/dieu-phoi/test/bang.test.mjs`

**Interfaces:**
- Produces: `veBang(tt): string` (HTML).
- Dạng của `tt` (cũng là dạng của `trang-thai.json`, Task 8 ghi):

```text
{
  dot, trang_thai: 'dang-chay'|'giam-tai', nhip_cuoi,
  suc_khoe: {lyDo, canNguoi, load},
  day: [{id, link, hang, tien_do, cho}],
  khoa: [{tai_nguyen, phien, han_thue_den}],
  hang_cho: [{phien, loai, luc}],
  cho_nguoi: [{phien, loai, tin, luc, link}]
}
```

- [ ] **Step 1: Viết test thất bại** `scripts/dieu-phoi/test/bang.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { veBang } from '../bang.mjs';

const TT = {
  dot: 'sau-14-10',
  trang_thai: 'dang-chay',
  nhip_cuoi: '2026-10-05T12:00:00Z',
  suc_khoe: { lyDo: [], canNguoi: null, load: 3 },
  day: [{ id: 'P1', link: 'claude://claude.ai/epitaxy/local_x', hang: 'k2-soan', tien_do: 'dang', cho: null }],
  khoa: [{ tai_nguyen: 's4', phien: 'P1', han_thue_den: '2026-10-05T13:30:00Z' }],
  hang_cho: [{ phien: 'P2', loai: 's4', luc: '2026-10-05T12:01:00Z' }],
  cho_nguoi: [{ phien: 'P1', loai: 'idle_prompt', tin: 'Ký Cổng 2?', luc: '2026-10-05T12:02:00Z', link: 'claude://claude.ai/epitaxy/local_x' }],
};

test('veBang: có đủ các khối và tự làm mới 30 giây', () => {
  const html = veBang(TT);
  assert.match(html, /<meta http-equiv="refresh" content="30">/);
  for (const chu of ['sau-14-10', 'Hộp quyết định', 'Ký Cổng 2?', 'k2-soan', 'P2']) assert.ok(html.includes(chu), chu);
  assert.match(html, /href="claude:\/\/claude\.ai\/epitaxy\/local_x"/);
});

test('veBang: escape mọi chuỗi; link lạ không thành href', () => {
  const html = veBang({ ...TT, cho_nguoi: [{ ...TT.cho_nguoi[0], tin: '<script>alert(1)</script>', link: 'javascript:alert(1)' }] });
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('href="javascript:'));
});

test('veBang: giảm tải và cần người hiện ở đầu trang', () => {
  const html = veBang({ ...TT, trang_thai: 'giam-tai', suc_khoe: { lyDo: ['swap 22.3/24.0 GB'], canNguoi: 'fseventsd giữ 19.0 GB RSS', load: 27 } });
  assert.match(html, /GIẢM TẢI/);
  assert.match(html, /fseventsd giữ 19\.0 GB RSS/);
});
```

- [ ] **Step 2: Chạy test, thấy thất bại**

Run: `node --test scripts/dieu-phoi/test/bang.test.mjs`
Expected: FAIL, với `Cannot find module '../bang.mjs'`.

- [ ] **Step 3: Viết `scripts/dieu-phoi/bang.mjs`**

```js
// Dựng bang.html từ trang-thai.json. Mọi chuỗi đều escape; chỉ link claude:// hoặc https:// thành href (spec §4.8).
const thoat = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const lienKet = (link, chu) => (/^(claude|https):\/\//.test(link ?? '') ? `<a href="${thoat(link)}">${thoat(chu)}</a>` : thoat(chu));
const bang = (dau, hang) =>
  `<table><tr>${dau.map((d) => `<th>${thoat(d)}</th>`).join('')}</tr>${hang.map((h) => `<tr>${h.map((o) => `<td>${o}</td>`).join('')}</tr>`).join('')}</table>`;

export function veBang(tt) {
  const canhBao = [];
  if (tt.trang_thai === 'giam-tai') canhBao.push(`<p class="do">GIẢM TẢI — ${thoat(tt.suc_khoe.lyDo.join('; '))}</p>`);
  if (tt.suc_khoe?.canNguoi) canhBao.push(`<p class="do">Cần anh: ${thoat(tt.suc_khoe.canNguoi)}</p>`);
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><meta http-equiv="refresh" content="30">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Đợt ${thoat(tt.dot)}</title>
<style>body{font-family:system-ui,sans-serif;background:#f5f5f5;color:#2d3142;margin:0;padding:1.5rem}
table{border-collapse:collapse;background:#fff;margin:.5rem 0 1.25rem;width:100%}th,td{border-bottom:1px solid #ddd;padding:.4rem .6rem;text-align:left;font-size:.9rem}
th{background:#ececec;font-size:.75rem;text-transform:uppercase}.do{color:#b3261e;font-weight:600}h2{font-size:1.05rem;margin:1rem 0 .25rem}</style></head><body>
<h1>Đợt ${thoat(tt.dot)} · ${thoat(tt.trang_thai)}</h1><p>Nhịp cuối ${thoat(tt.nhip_cuoi)}</p>${canhBao.join('')}
<h2>Hộp quyết định</h2>${bang(['Phiên', 'Loại', 'Tin', 'Từ'], tt.cho_nguoi.map((c) => [lienKet(c.link, c.phien), thoat(c.loai), thoat(c.tin), thoat(c.luc)]))}
<h2>Phiên thợ</h2>${bang(['Phiên', 'Hàng', 'Tiến độ', 'Chờ'], tt.day.map((d) => [lienKet(d.link, d.id), thoat(d.hang), thoat(d.tien_do), thoat(d.cho)]))}
<h2>Khoá đang giữ</h2>${bang(['Tài nguyên', 'Phiên', 'Hạn thuê'], tt.khoa.map((k) => [thoat(k.tai_nguyen), thoat(k.phien), thoat(k.han_thue_den)]))}
<h2>Hàng chờ lượt</h2>${bang(['Phiên', 'Loại', 'Xin lúc'], tt.hang_cho.map((h) => [thoat(h.phien), thoat(h.loai), thoat(h.luc)]))}
</body></html>
`;
}
```

- [ ] **Step 4: Chạy test, thấy qua**

Run: `node --test scripts/dieu-phoi/test/bang.test.mjs`
Expected: PASS, 3/3.

- [ ] **Step 5: Commit**

```bash
git add scripts/dieu-phoi/bang.mjs scripts/dieu-phoi/test/bang.test.mjs
git commit -m "feat(dieu-phoi): bảng đồng hồ và hộp quyết định, escape mọi chuỗi"
```

---

### Task 8: Bộ phát lịch — một nhịp, vòng chạy, pidfile

**Files:**
- Create: `scripts/dieu-phoi/phat-lich.mjs`, `scripts/dieu-phoi/test/phat-lich.test.mjs`

**Interfaces:**
- Consumes: mọi hàm ở Task 1–4 và Task 7.
- Produces:
  - `motNhip(thuMuc, io): Promise<void>`, với `io = {nowMs(): number, chay(cmd, args, opts?): string}`
  - `trangThaiHopDong(text): string|null`
  - `giuPid(thuMuc): boolean` (`false` = đã có bản khác đang chạy)
  - `CAC_TAI_NGUYEN = ['s4', 'duong-nen', 'merge']`
  - `taoVong(thuMuc, io, dongHo?): () => Promise<void>`. `git fetch` hỏng thì nhịp vẫn chạy; một lỗi lặp lại chỉ phát `can_phan` khi nội dung đổi hoặc sau 30′. Lý do: Monitor của phiên giám sát tự tắt khi bị ngập sự kiện.

- [ ] **Step 1: Viết test thất bại** `scripts/dieu-phoi/test/phat-lich.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { giuPid, motNhip, taoVong, trangThaiHopDong } from '../phat-lich.mjs';

const tam = () => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'dp-')));
const NOW = Date.parse('2026-10-05T12:00:00Z');
const CFG = {
  nhanh_chinh: 'onehub',
  han_thue_phut: { s4: 90, 'ghim-lai': 40, 'duong-nen': 40, merge: 120 },
  nhip_cu_phut: 10,
  suc_khoe: { swap_gb: 8, ap_luc_muc: 2, rss_gb: 8 },
  bao_ve: [],
  s4_tran_gom_phut: 60,
};
function dung({ swapUsed = 1024 } = {}) {
  const dot = tam();
  const w1 = tam();
  const w2 = tam();
  fs.writeFileSync(path.join(dot, 'dieu-phoi.config.json'), JSON.stringify(CFG));
  fs.writeFileSync(path.join(dot, 'hang-viec.json'), JSON.stringify({
    dot: 'thu',
    day: [{ id: 'P1', worktree: w1, link: 'claude://x/1' }, { id: 'P2', worktree: w2, link: 'claude://x/2' }],
    hang: [
      { ma: 'A', slug: 'a', day: 'P1', moc: '2026-10-12', uu_tien: 1, ranh_gioi: ['apps/a/**'] },
      { ma: 'B', slug: 'b', day: 'P2', moc: '2026-10-14', uu_tien: 1, ranh_gioi: ['apps/b/**'] },
    ],
  }));
  for (const d of ['khoa', 'xin', 'yeu-cau', 'tra-loi', 'cho-nguoi', 'tiep']) fs.mkdirSync(path.join(dot, d));
  const io = {
    nowMs: () => NOW,
    chay: (cmd, args) => {
      if (cmd === 'sysctl' && args[0] === 'vm.swapusage') return `total = 24576.00M  used = ${swapUsed}.00M  free = 1.00M`;
      if (cmd === 'sysctl' && args.includes('kern.memorystatus_vm_pressure_level')) return '1';
      if (cmd === 'sysctl') return '{ 3.00 2.00 1.00 }';
      if (cmd === 'ps') return '102400 node\n';
      if (cmd === 'gh') return '[]';
      if (cmd === 'git' && args[0] === 'show') throw new Error('not found');
      return '';
    },
  };
  return { dot, w1, w2, io };
}
const xin = (dot, ten, du) => fs.writeFileSync(path.join(dot, 'xin', `${ten}.json`), JSON.stringify(du));
const suKien = (dot) => fs.readFileSync(path.join(dot, 'su-kien.jsonl'), 'utf8').trim().split('\n').map((d) => JSON.parse(d));

test('trangThaiHopDong đọc status trong frontmatter', () => {
  assert.equal(trangThaiHopDong('---\nslug: a\nstatus: signed-off\n---\n'), 'signed-off');
  assert.equal(trangThaiHopDong('khong co'), null);
});

test('cấp lượt theo mốc: P1 (mốc 12/10) trước P2 (14/10); đơn được xoá; chu.json đủ trường', async () => {
  const { dot, w1, w2, io } = dung();
  xin(dot, 'P2-s4', { phien: 'P2', slug: 'b', loai: 's4', luc: '2026-10-05T11:00:00Z', worktree: w2 });
  xin(dot, 'P1-s4', { phien: 'P1', slug: 'a', loai: 's4', luc: '2026-10-05T11:30:00Z', worktree: w1 });
  await motNhip(dot, io);
  const chu = JSON.parse(fs.readFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), 'utf8'));
  assert.deepEqual([chu.phien, chu.slug, chu.loai, chu.worktree, chu.han_thue_den], ['P1', 'a', 's4', w1, '2026-10-05T13:30:00.000Z']);
  assert.equal(fs.existsSync(path.join(dot, 'xin', 'P1-s4.json')), false);
  assert.equal(fs.existsSync(path.join(dot, 'xin', 'P2-s4.json')), true);
  assert.ok(suKien(dot).some((s) => s.loai === 'cap' && s.phien === 'P1'));
});

test('nhả khoá → nhịp sau cấp cho người kế (không bao giờ trống khi còn đơn)', async () => {
  const { dot, w2, io } = dung();
  fs.mkdirSync(path.join(dot, 'khoa', 's4'));
  fs.writeFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), JSON.stringify({ phien: 'P1', loai: 's4', worktree: '/w1', han_thue_den: '2026-10-05T13:00:00Z' }));
  xin(dot, 'P2-s4', { phien: 'P2', slug: 'b', loai: 's4', luc: '2026-10-05T11:00:00Z', worktree: w2 });
  await motNhip(dot, io);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), 'utf8')).phien, 'P1');
  fs.rmSync(path.join(dot, 'khoa', 's4'), { recursive: true });
  await motNhip(dot, io);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), 'utf8')).phien, 'P2');
});

test('hạn thuê: hết hạn + nhịp cũ → thu hồi + can_phan; thư mục khoá trống quá 60″ → thu hồi', async () => {
  const { dot, io } = dung();
  fs.mkdirSync(path.join(dot, 'khoa', 's4'));
  fs.writeFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), JSON.stringify({ phien: 'P1', loai: 's4', worktree: '/w1', cap_luc: '2026-10-05T09:00:00Z', han_thue_den: '2026-10-05T10:30:00Z' }));
  fs.mkdirSync(path.join(dot, 'khoa', 'merge'));
  const cu = new Date(NOW - 120_000);
  fs.utimesSync(path.join(dot, 'khoa', 'merge'), cu, cu);
  await motNhip(dot, io);
  assert.equal(fs.existsSync(path.join(dot, 'khoa', 's4')), false);
  assert.equal(fs.existsSync(path.join(dot, 'khoa', 'merge')), false);
  const sk = suKien(dot).filter((s) => s.loai === 'thu-hoi');
  assert.equal(sk.length, 2);
  assert.ok(sk.every((s) => s.can_phan === true));
});

test('giảm tải: không cấp s4; đúng một sự kiện can_phan khi vào giảm tải', async () => {
  const { dot, w1, io } = dung({ swapUsed: 22835 });
  xin(dot, 'P1-s4', { phien: 'P1', slug: 'a', loai: 's4', luc: '2026-10-05T11:00:00Z', worktree: w1 });
  await motNhip(dot, io);
  await motNhip(dot, io);
  assert.equal(fs.existsSync(path.join(dot, 'khoa', 's4')), false);
  assert.equal(suKien(dot).filter((s) => s.loai === 'giam-tai').length, 1);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dot, 'trang-thai.json'), 'utf8')).trang_thai, 'giam-tai');
});

test('đơn hỏng → xin/hong/ + can_phan, nhịp vẫn chạy tiếp', async () => {
  const { dot, w1, io } = dung();
  fs.writeFileSync(path.join(dot, 'xin', 'P9-s4.json'), '{hong');
  xin(dot, 'P1-s4', { phien: 'P1', slug: 'a', loai: 's4', luc: '2026-10-05T11:00:00Z', worktree: w1 });
  await motNhip(dot, io);
  assert.equal(fs.existsSync(path.join(dot, 'xin', 'hong', 'P9-s4.json')), true);
  assert.ok(suKien(dot).some((s) => s.loai === 'don-hong' && s.can_phan === true));
  assert.equal(fs.existsSync(path.join(dot, 'khoa', 's4', 'chu.json')), true);
});

test('yêu cầu: chạm tệp được máy duyệt → tra-loi + ranh-gioi-them; việc cần phán → một can_phan, không lặp', async () => {
  const { dot, io } = dung();
  const ghi = (ten, du) => fs.writeFileSync(path.join(dot, 'yeu-cau', `${ten}.json`), JSON.stringify(du));
  ghi('P1-1', { id: 'P1-1', phien: 'P1', loai: 'cham-tep', hang: 'a', noi_dung: { tep: ['apps/x.ts'] }, luc: '2026-10-05T11:00:00Z' });
  ghi('P1-2', { id: 'P1-2', phien: 'P1', loai: 'hang-moi', hang: 'a', noi_dung: {}, luc: '2026-10-05T11:00:00Z' });
  await motNhip(dot, io);
  await motNhip(dot, io);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dot, 'tra-loi', 'P1-1.json'), 'utf8')).ket_qua, 'duyet');
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dot, 'ranh-gioi-them.json'), 'utf8')), { P1: ['apps/x.ts'] });
  assert.equal(fs.existsSync(path.join(dot, 'tra-loi', 'P1-2.json')), false);
  assert.equal(suKien(dot).filter((s) => s.loai === 'yeu-cau' && s.id === 'P1-2' && s.can_phan).length, 1);
});

test('hàng kế: ghi tiep/P1.json; trang-thai.json + bang.html có mặt', async () => {
  const { dot, io } = dung();
  await motNhip(dot, io);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dot, 'tiep', 'P1.json'), 'utf8')).hang, 'a');
  const tt = JSON.parse(fs.readFileSync(path.join(dot, 'trang-thai.json'), 'utf8'));
  assert.equal(tt.dot, 'thu');
  assert.ok(fs.readFileSync(path.join(dot, 'bang.html'), 'utf8').includes('Hộp quyết định'));
});

test('taoVong: fetch hỏng vẫn chạy nhịp; lỗi lặp chỉ báo một lần trong 30′', async () => {
  const { dot, io } = dung();
  const ioHong = { ...io, chay: (cmd, args) => { if (cmd === 'git' && args[0] === 'fetch') throw new Error('mất mạng'); return io.chay(cmd, args); } };
  let gio = 0;
  const vong = taoVong(dot, ioHong, () => gio);
  await vong();
  assert.equal(fs.existsSync(path.join(dot, 'trang-thai.json')), true);
  gio = 400_000;
  await vong();
  assert.equal(suKien(dot).filter((s) => s.loai === 'fetch-loi').length, 1);
  gio = 2_400_000;
  await vong();
  assert.equal(suKien(dot).filter((s) => s.loai === 'fetch-loi').length, 2);
});

test('giuPid: một tiến trình KHÁC còn sống đang giữ → từ chối; pid chết → nhận lại; chính mình → giữ', () => {
  const { dot } = dung();
  fs.writeFileSync(path.join(dot, 'phat-lich.pid'), String(process.ppid));
  assert.equal(giuPid(dot), false);
  fs.writeFileSync(path.join(dot, 'phat-lich.pid'), '999999');
  assert.equal(giuPid(dot), true);
  assert.equal(fs.readFileSync(path.join(dot, 'phat-lich.pid'), 'utf8'), String(process.pid));
  assert.equal(giuPid(dot), true);
});
```

- [ ] **Step 2: Chạy test, thấy thất bại**

Run: `node --test scripts/dieu-phoi/test/phat-lich.test.mjs`
Expected: FAIL, với `Cannot find module '../phat-lich.mjs'`.

- [ ] **Step 3: Viết `scripts/dieu-phoi/phat-lich.mjs`**

```js
#!/usr/bin/env node
// Bộ phát lịch: vỏ I/O quanh các hàm thuần. Mỗi nhịp đọc thư mục đợt rồi ghi lượt, trả lời, hàng kế,
// trạng thái và sự kiện. Không merge (giai đoạn 1a). Spec §4.2–§4.3, §4.6, §4.8–§4.9, §4.12.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { veBang } from './bang.mjs';
import { docJson, ghiJsonNguyenTu, ghiSuKien } from './dot.mjs';
import { capLuot, chonHangKe, xetHanThue } from './lich.mjs';
import { danhGiaSucKhoe, docApLuc, docLoad, docRssLonNhat, docSwap } from './suc-khoe.mjs';
import { xetYeuCau } from './yeu-cau.mjs';

export const CAC_TAI_NGUYEN = ['s4', 'duong-nen', 'merge'];
const KHOA_TRONG_MS = 60_000;
const MOT_NGAY_MS = 24 * 3600_000;

export function trangThaiHopDong(text) {
  return text.match(/^status:\s*(\S+)/m)?.[1] ?? null;
}

const tuoiPhut = (p, nowMs) => {
  try {
    return (nowMs - fs.statSync(p).mtimeMs) / 60_000;
  } catch {
    return null;
  }
};

function xuLyKhoa(thuMuc, cfg, nowMs) {
  const dangGiu = {};
  for (const tn of CAC_TAI_NGUYEN) {
    const d = path.join(thuMuc, 'khoa', tn);
    dangGiu[tn] = null;
    if (!fs.existsSync(d)) continue;
    const chu = docJson(path.join(d, 'chu.json'));
    if (!chu) {
      if (nowMs - fs.statSync(d).mtimeMs > KHOA_TRONG_MS) {
        fs.rmSync(d, { recursive: true, force: true });
        ghiSuKien(thuMuc, { loai: 'thu-hoi', tai_nguyen: tn, ly_do: 'thư mục khoá trống quá 60″', can_phan: true });
      } else {
        dangGiu[tn] = { phien: '?' };
      }
      continue;
    }
    const nhip = tuoiPhut(path.join(d, 'nhip'), nowMs);
    const kq = xetHanThue({ chu, nhipTuoiPhut: nhip, nowMs, cfg });
    if (kq.hanhDong === 'gia-han') {
      ghiJsonNguyenTu(path.join(d, 'chu.json'), { ...chu, han_thue_den: kq.hanMoi });
      ghiSuKien(thuMuc, { loai: 'gia-han', tai_nguyen: tn, phien: chu.phien, han_moi: kq.hanMoi });
      dangGiu[tn] = { ...chu, han_thue_den: kq.hanMoi };
    } else if (kq.hanhDong === 'thu-hoi') {
      fs.rmSync(d, { recursive: true, force: true });
      ghiSuKien(thuMuc, { loai: 'thu-hoi', tai_nguyen: tn, phien: chu.phien, ly_do: 'hết hạn thuê, nhịp cũ', can_phan: true });
    } else {
      dangGiu[tn] = chu;
    }
  }
  return dangGiu;
}

function docThuMucJson(thuMuc, ten) {
  const d = path.join(thuMuc, ten);
  if (!fs.existsSync(d)) return [];
  const tot = [];
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.json'))) {
    const p = path.join(d, f);
    try {
      const du = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (typeof du.phien !== 'string' || typeof du.loai !== 'string') throw new Error('thiếu phien hoặc loai');
      tot.push({ ...du, _tep: p, _ten: f.replace(/\.json$/, '') });
    } catch (e) {
      fs.mkdirSync(path.join(d, 'hong'), { recursive: true });
      fs.renameSync(p, path.join(d, 'hong', f));
      ghiSuKien(thuMuc, { loai: ten === 'xin' ? 'don-hong' : 'yeu-cau-hong', tep: f, ly_do: e.message, can_phan: true });
    }
  }
  return tot;
}

function capPhat(thuMuc, cfg, hangViec, dangGiu, giamTai, nowMs) {
  const donXin = docThuMucJson(thuMuc, 'xin').filter((d) => typeof d.worktree === 'string');
  for (const { taiNguyen, don } of capLuot({ donXin, dangGiu, giamTai, hangViec })) {
    const d = path.join(thuMuc, 'khoa', taiNguyen);
    try {
      fs.mkdirSync(d);
    } catch {
      continue;
    }
    const chu = {
      phien: don.phien,
      slug: don.slug,
      loai: don.loai,
      worktree: fs.realpathSync(don.worktree),
      cap_luc: new Date(nowMs).toISOString(),
      han_thue_den: new Date(nowMs + cfg.han_thue_phut[don.loai] * 60_000).toISOString(),
    };
    ghiJsonNguyenTu(path.join(d, 'chu.json'), chu);
    fs.rmSync(don._tep, { force: true });
    ghiSuKien(thuMuc, { loai: 'cap', tai_nguyen: taiNguyen, phien: don.phien, slug: don.slug });
  }
  return docThuMucJson(thuMuc, 'xin').map(({ phien, loai, luc }) => ({ phien, loai, luc }));
}

function nhanhMo(io, cfg) {
  const ketQua = new Map();
  let ds = [];
  try {
    ds = JSON.parse(io.chay('gh', ['pr', 'list', '--state', 'open', '--json', 'headRefName']) || '[]');
  } catch {
    return ketQua;
  }
  for (const { headRefName } of ds) {
    let tep = '';
    try {
      tep = io.chay('git', ['diff', '--name-only', `origin/${cfg.nhanh_chinh}...origin/${headRefName}`]);
    } catch {
      continue;
    }
    for (const t of tep.split('\n').filter(Boolean)) ketQua.set(t, [...(ketQua.get(t) ?? []), headRefName]);
  }
  return ketQua;
}

function xuLyYeuCau(thuMuc, cfg, hangViec, io, trangThaiCu, nowMs) {
  const tatCa = docThuMucJson(thuMuc, 'yeu-cau');
  const daBao = new Set(trangThaiCu.da_bao ?? []);
  const choXet = tatCa.filter((y) => !fs.existsSync(path.join(thuMuc, 'tra-loi', `${y._ten}.json`)) && !daBao.has(y._ten));
  if (choXet.length === 0) return [...daBao];
  const nguCanh = {
    hangViec,
    nhanhChamTep: nhanhMo(io, cfg),
    nhanhCua: () => null,
    yeuCauGanDay: tatCa.filter((y) => nowMs - Date.parse(y.luc) < MOT_NGAY_MS),
  };
  for (const y of choXet) {
    const kq = xetYeuCau({ ...y, id: y._ten }, nguCanh, cfg);
    if (kq.ket_qua === 'can_phan') {
      ghiSuKien(thuMuc, { loai: 'yeu-cau', id: y._ten, phien: y.phien, kieu: y.loai, ly_do: kq.ly_do, dich: kq.dich ?? 'giam-sat', can_phan: true });
      daBao.add(y._ten);
      continue;
    }
    ghiJsonNguyenTu(path.join(thuMuc, 'tra-loi', `${y._ten}.json`), { ...kq, luc: new Date(nowMs).toISOString() });
    if (y.loai === 'cham-tep' && kq.ket_qua === 'duyet') {
      const p = path.join(thuMuc, 'ranh-gioi-them.json');
      const them = docJson(p, {});
      them[y.phien] = [...new Set([...(them[y.phien] ?? []), ...y.noi_dung.tep])];
      ghiJsonNguyenTu(p, them);
    }
    ghiSuKien(thuMuc, { loai: 'yeu-cau', id: y._ten, phien: y.phien, kieu: y.loai, ket_qua: kq.ket_qua });
  }
  return [...daBao];
}

function tienDoCua(hangViec, cfg, io) {
  const td = new Map();
  for (const h of hangViec.hang) {
    let trenNhanhChinh = null;
    try {
      trenNhanhChinh = trangThaiHopDong(io.chay('git', ['show', `origin/${cfg.nhanh_chinh}:_acceptance/${h.slug}/contract.md`]));
    } catch {
      trenNhanhChinh = null;
    }
    if (trenNhanhChinh === 'signed-off') {
      td.set(h.slug, 'gop');
      continue;
    }
    const day = hangViec.day.find((d) => d.id === h.day);
    const p = day ? path.join(day.worktree, '_acceptance', h.slug, 'contract.md') : null;
    const st = p && fs.existsSync(p) ? trangThaiHopDong(fs.readFileSync(p, 'utf8')) : null;
    td.set(h.slug, st === null ? 'chua' : st === 'signed-off' ? 'ky' : 'dang');
  }
  return td;
}

function capNhatHangKe(thuMuc, hangViec, tienDo) {
  const ketQua = [];
  for (const day of hangViec.day) {
    const ke = chonHangKe(hangViec, day.id, tienDo);
    const p = path.join(thuMuc, 'tiep', `${day.id}.json`);
    const cu = docJson(p, null);
    if (JSON.stringify(cu?.ke ?? null) !== JSON.stringify(ke)) {
      ghiJsonNguyenTu(p, { phien: day.id, ...ke, ke });
      ghiSuKien(thuMuc, { loai: 'hang-ke', phien: day.id, ...ke });
    }
    ketQua.push({ id: day.id, link: day.link, hang: ke.hang, tien_do: ke.hang ? tienDo.get(ke.hang) : ke.xong ? 'xong' : 'cho', cho: ke.cho ?? null });
  }
  return ketQua;
}

export async function motNhip(thuMuc, io) {
  const nowMs = io.nowMs();
  const cfg = docJson(path.join(thuMuc, 'dieu-phoi.config.json'));
  const hangViec = docJson(path.join(thuMuc, 'hang-viec.json'));
  const pTrangThai = path.join(thuMuc, 'trang-thai.json');
  const cu = docJson(pTrangThai, {});

  const sucKhoe = danhGiaSucKhoe(
    {
      swap: docSwap(io.chay('sysctl', ['vm.swapusage'])),
      apLuc: docApLuc(io.chay('sysctl', ['-n', 'kern.memorystatus_vm_pressure_level'])),
      load: docLoad(io.chay('sysctl', ['-n', 'vm.loadavg'])),
      rssLonNhat: docRssLonNhat(io.chay('ps', ['-axo', 'rss=,comm='])),
    },
    cfg,
  );
  if (sucKhoe.giamTai && cu.trang_thai !== 'giam-tai') ghiSuKien(thuMuc, { loai: 'giam-tai', ly_do: sucKhoe.lyDo, can_phan: true });
  if (!sucKhoe.giamTai && cu.trang_thai === 'giam-tai') ghiSuKien(thuMuc, { loai: 'het-giam-tai' });
  if (sucKhoe.canNguoi && cu.can_nguoi !== sucKhoe.canNguoi) ghiSuKien(thuMuc, { loai: 'can-nguoi', tin: sucKhoe.canNguoi, dich: 'owner', can_phan: true });

  const dangGiu = xuLyKhoa(thuMuc, cfg, nowMs);
  const hangCho = capPhat(thuMuc, cfg, hangViec, dangGiu, sucKhoe.giamTai, nowMs);
  const daBao = xuLyYeuCau(thuMuc, cfg, hangViec, io, cu, nowMs);
  const day = capNhatHangKe(thuMuc, hangViec, tienDoCua(hangViec, cfg, io));
  const lienKetCua = new Map(hangViec.day.map((d) => [d.id, d.link]));
  const choNguoi = docThuMucJson(thuMuc, 'cho-nguoi').map(({ phien, loai, tin, luc }) => ({ phien, loai, tin, luc, link: lienKetCua.get(phien) }));
  const khoa = CAC_TAI_NGUYEN.flatMap((tn) => {
    const chu = docJson(path.join(thuMuc, 'khoa', tn, 'chu.json'));
    return chu ? [{ tai_nguyen: tn, phien: chu.phien, han_thue_den: chu.han_thue_den }] : [];
  });

  const tt = {
    dot: hangViec.dot,
    trang_thai: sucKhoe.giamTai ? 'giam-tai' : 'dang-chay',
    nhip_cuoi: new Date(nowMs).toISOString(),
    suc_khoe: sucKhoe,
    can_nguoi: sucKhoe.canNguoi,
    day,
    khoa,
    hang_cho: hangCho,
    cho_nguoi: choNguoi,
    da_bao: daBao,
  };
  ghiJsonNguyenTu(pTrangThai, tt);
  fs.writeFileSync(path.join(thuMuc, 'bang.html'), veBang(tt));
}

export function giuPid(thuMuc) {
  const p = path.join(thuMuc, 'phat-lich.pid');
  const cu = Number(fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : 0);
  if (cu && cu !== process.pid) {
    try {
      process.kill(cu, 0);
      return false;
    } catch {
      // pid đã chết: nhận lại.
    }
  }
  fs.writeFileSync(p, String(process.pid));
  return true;
}

const IO_THAT = {
  nowMs: () => Date.now(),
  chay: (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 30_000, ...opts }),
};

// Một vòng: fetch tách riêng (hỏng thì vẫn chạy nhịp); lỗi lặp chỉ báo khi đổi nội dung hoặc sau 30′.
export function taoVong(thuMuc, io, dongHo = () => Date.now()) {
  const BAO_LAI_MS = 1_800_000;
  let lanFetch = -Infinity;
  const daBao = new Map();
  const bao = (loai, ly_do) => {
    const cu = daBao.get(loai);
    if (cu && cu.ly_do === ly_do && dongHo() - cu.luc < BAO_LAI_MS) return;
    daBao.set(loai, { ly_do, luc: dongHo() });
    ghiSuKien(thuMuc, { loai, ly_do, can_phan: true });
  };
  return async () => {
    if (dongHo() - lanFetch > 300_000) {
      lanFetch = dongHo();
      try {
        io.chay('git', ['fetch', '-q', 'origin']);
      } catch (e) {
        bao('fetch-loi', e.message);
      }
    }
    try {
      await motNhip(thuMuc, io);
    } catch (e) {
      bao('loi-nhip', e.message);
    }
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  const thuMuc = fs.realpathSync(process.argv[2]);
  if (!giuPid(thuMuc)) {
    process.stderr.write(`phat-lich: đã có bộ phát lịch đang chạy cho ${thuMuc}\n`);
    process.exit(3);
  }
  const cfg = docJson(path.join(thuMuc, 'dieu-phoi.config.json'));
  const io = { ...IO_THAT, chay: (cmd, args, opts) => IO_THAT.chay(cmd, args, { cwd: cfg.goc_kho, ...opts }) };
  const vong = taoVong(thuMuc, io);
  await vong();
  const hen = setInterval(vong, (cfg.tick_giay ?? 5) * 1000);
  const dung = () => {
    clearInterval(hen);
    fs.rmSync(path.join(thuMuc, 'phat-lich.pid'), { force: true });
    process.exit(0);
  };
  process.on('SIGTERM', dung);
  process.on('SIGINT', dung);
}
```

Ghi chú:
- `cfg.goc_kho` là đường dẫn tuyệt đối tới checkout chính của kho, để `git` và `gh` chạy đúng chỗ. CLI ở Task 9 ghi giá trị này khi mở đợt; mã không ghi cứng nó.
- `nhanhCua: () => null` ở 1a là giản lược có chủ đích: nhánh của chính phiên xin chưa được loại khỏi danh sách «nhánh mở đang sửa». Lỗi lệch về phía an toàn: ca đó thành `can_phan` thay vì máy duyệt. Ánh xạ phiên → nhánh để giai đoạn 1b, cùng lúc với hàng merge.

- [ ] **Step 4: Chạy test, thấy qua**

Run: `node --test scripts/dieu-phoi/test/phat-lich.test.mjs`
Expected: PASS, 10/10.

- [ ] **Step 5: Chạy toàn bộ test của dieu-phoi**

Run: `npm run test:dieu-phoi`
Expected: PASS ở cả 8 tệp test.

- [ ] **Step 6: Commit**

```bash
git add scripts/dieu-phoi/phat-lich.mjs scripts/dieu-phoi/test/phat-lich.test.mjs
git commit -m "feat(dieu-phoi): bộ phát lịch — cấp lượt, hạn thuê, giảm tải, yêu cầu, hàng kế, bảng"
```

---

### Task 9: CLI, mẫu đợt, README nghi thức + thử khô

**Files:**
- Create:
  - `scripts/dieu-phoi/dieu-phoi.mjs`
  - `scripts/dieu-phoi/mau/dieu-phoi.config.json`
  - `scripts/dieu-phoi/mau/hang-viec.json`
  - `scripts/dieu-phoi/mau/LUAT.md`
  - `scripts/dieu-phoi/README.md`
  - `scripts/dieu-phoi/test/cli.test.mjs`

**Interfaces:**
- Consumes: `gocKhoChinh`, `TEN_LIEN_KET`, `docJson`, `ghiJsonNguyenTu`, `ghiSuKien` (Task 1); `phat-lich.mjs` (Task 8).
- Produces:
  - `moDot(cwd, ten): string` (trả về thư mục đợt)
  - `dongDot(cwd): void`
  - CLI `node scripts/dieu-phoi/dieu-phoi.mjs <mo <tên>|chay|dung|dong|xem>`

- [ ] **Step 1: Viết test thất bại** `scripts/dieu-phoi/test/cli.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { dongDot, moDot } from '../dieu-phoi.mjs';
import { timThuMucDot } from '../dot.mjs';
import { chayHook } from '../hook-chan-s4.mjs';

const tam = () => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'dp-')));

test('moDot dựng thư mục đợt từ mẫu + symlink; mở đợt thứ hai khi đợt kia còn chạy → ném', () => {
  const goc = tam();
  execFileSync('git', ['init', '-q'], { cwd: goc });
  const dot = moDot(goc, 'thu');
  assert.equal(timThuMucDot(goc), dot);
  for (const f of ['LUAT.md', 'hang-viec.json', 'dieu-phoi.config.json']) assert.ok(fs.existsSync(path.join(dot, f)), f);
  for (const d of ['khoa', 'xin', 'yeu-cau', 'tra-loi', 'cho-nguoi', 'tiep']) assert.ok(fs.statSync(path.join(dot, d)).isDirectory(), d);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dot, 'dieu-phoi.config.json'), 'utf8')).goc_kho, goc);
  assert.throws(() => moDot(goc, 'khac'), /đợt thu đang chạy/);
});

test('thử khô: trong đợt hook chặn S4; sau dongDot hook im', () => {
  const goc = tam();
  execFileSync('git', ['init', '-q'], { cwd: goc });
  moDot(goc, 'thu');
  const wf = JSON.stringify({ tool_name: 'Workflow', cwd: goc, tool_input: { scriptPath: '/x/acceptance-verify.js' } });
  assert.equal(chayHook(wf).ma, 2);
  dongDot(goc);
  assert.equal(timThuMucDot(goc), null);
  assert.equal(chayHook(wf).ma, 0);
});
```

- [ ] **Step 2: Chạy test, thấy thất bại**

Run: `node --test scripts/dieu-phoi/test/cli.test.mjs`
Expected: FAIL, với `Cannot find module '../dieu-phoi.mjs'`.

- [ ] **Step 3: Viết ba tệp mẫu**

`scripts/dieu-phoi/mau/dieu-phoi.config.json`:

```json
{
  "nhanh_chinh": "main",
  "tick_giay": 5,
  "han_thue_phut": { "s4": 90, "ghim-lai": 40, "duong-nen": 40, "merge": 120 },
  "nhip_cu_phut": 10,
  "suc_khoe": { "swap_gb": 8, "ap_luc_muc": 2, "rss_gb": 8 },
  "s4_tran_gom_phut": 60,
  "bao_ve": []
}
```

`scripts/dieu-phoi/mau/hang-viec.json`:

```json
{
  "dot": "",
  "day": [],
  "hang": [],
  "ngoai_hang_merge": []
}
```

`scripts/dieu-phoi/mau/LUAT.md`:

```markdown
# Luật đợt <tên>

Phiên giám sát là phiên duy nhất được sửa tệp này. Các phiên thợ đọc nó trước S1.

## Cách xin tài nguyên
- Xin lượt: ghi `xin/<phiên>-<loại>.json` = `{phien, slug, loai, luc, worktree, uoc_phut, mo_merge?}`;
  `loai` ∈ `s4`, `ghim-lai`, `duong-nen`, `merge`. Rồi chờ bằng lệnh nền
  `until jq -e '.phien=="<phiên>"' <thư mục đợt>/khoa/<tài nguyên>/chu.json >/dev/null 2>&1; do sleep 15; done`.
- Nhả lượt: `rm -rf <thư mục đợt>/khoa/<tài nguyên>`.
- Yêu cầu: ghi `yeu-cau/<phiên>-<số>.json` = `{phien, loai, hang, noi_dung, luc}`; trả lời ở
  `tra-loi/<phiên>-<số>.json`. Loại: `cham-tep`, `viec-phu`, `hang-moi`, `chuyen-hang`, `s4-gom`,
  `gia-han`, `can-nguoi`, `khac`.
- Hàng kế: đọc `tiep/<phiên>.json`.
- Không tự gọi `spawn_task`: việc phụ đi qua yêu cầu `viec-phu`.

## Thứ tự gộp khi tranh chấp

## Nhật ký
```

- [ ] **Step 4: Viết `scripts/dieu-phoi/dieu-phoi.mjs`**

```js
#!/usr/bin/env node
// CLI của phiên giám sát: mo <tên> | chay | dung | dong | xem. Spec §4.11–§4.12, §8.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { docJson, ghiJsonNguyenTu, ghiSuKien, gocKhoChinh, TEN_LIEN_KET } from './dot.mjs';

const DAY = path.dirname(fileURLToPath(import.meta.url));
const lienKet = (goc) => path.join(goc, '.acceptance-runs', TEN_LIEN_KET);

export function moDot(cwd, ten) {
  if (!/^[\w-]+$/.test(ten ?? '')) throw new Error('tên đợt chỉ gồm chữ, số, - và _');
  const goc = gocKhoChinh(cwd);
  const lk = lienKet(goc);
  if (fs.existsSync(lk)) {
    const dangChay = path.basename(fs.realpathSync(lk)).replace(/^dieu-phoi-/, '');
    throw new Error(`đợt ${dangChay} đang chạy — đóng nó trước`);
  }
  const thuMuc = path.join(goc, '.acceptance-runs', `dieu-phoi-${ten}`);
  for (const d of ['khoa', 'xin', 'yeu-cau', 'tra-loi', 'cho-nguoi', 'tiep']) fs.mkdirSync(path.join(thuMuc, d), { recursive: true });
  for (const f of ['LUAT.md', 'hang-viec.json', 'dieu-phoi.config.json']) {
    const dich = path.join(thuMuc, f);
    if (!fs.existsSync(dich)) fs.copyFileSync(path.join(DAY, 'mau', f), dich);
  }
  const cfg = docJson(path.join(thuMuc, 'dieu-phoi.config.json'));
  ghiJsonNguyenTu(path.join(thuMuc, 'dieu-phoi.config.json'), { ...cfg, goc_kho: goc });
  const hv = docJson(path.join(thuMuc, 'hang-viec.json'));
  if (!hv.dot) ghiJsonNguyenTu(path.join(thuMuc, 'hang-viec.json'), { ...hv, dot: ten });
  fs.symlinkSync(thuMuc, lk);
  ghiSuKien(thuMuc, { loai: 'mo-dot', ten });
  return fs.realpathSync(thuMuc);
}

function thuMucHienTai(cwd) {
  const lk = lienKet(gocKhoChinh(cwd));
  if (!fs.existsSync(lk)) throw new Error('không có đợt nào đang chạy');
  return fs.realpathSync(lk);
}

function pidSong(thuMuc) {
  const p = path.join(thuMuc, 'phat-lich.pid');
  const pid = Number(fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : 0);
  if (!pid) return 0;
  try {
    process.kill(pid, 0);
    return pid;
  } catch {
    return 0;
  }
}

export function chayPhatLich(cwd) {
  const thuMuc = thuMucHienTai(cwd);
  const pid = pidSong(thuMuc);
  if (pid) return `bộ phát lịch đang chạy (pid ${pid})`;
  const log = fs.openSync(path.join(thuMuc, 'phat-lich.log'), 'a');
  const con = spawn(process.execPath, [path.join(DAY, 'phat-lich.mjs'), thuMuc], { detached: true, stdio: ['ignore', log, log] });
  con.unref();
  ghiSuKien(thuMuc, { loai: 'chay', pid: con.pid });
  return `đã chạy bộ phát lịch (pid ${con.pid})`;
}

export function dungPhatLich(cwd) {
  const thuMuc = thuMucHienTai(cwd);
  const pid = pidSong(thuMuc);
  if (pid) process.kill(pid, 'SIGTERM');
  ghiSuKien(thuMuc, { loai: 'dung', pid });
  return pid ? `đã dừng pid ${pid}` : 'bộ phát lịch không chạy';
}

export function dongDot(cwd) {
  const thuMuc = thuMucHienTai(cwd);
  dungPhatLich(cwd);
  fs.rmSync(lienKet(gocKhoChinh(cwd)));
  ghiSuKien(thuMuc, { loai: 'dong-dot' });
}

function xem(cwd) {
  const tt = docJson(path.join(thuMucHienTai(cwd), 'trang-thai.json'), null);
  if (!tt) return 'chưa có nhịp nào';
  const khoa = tt.khoa.map((k) => `${k.tai_nguyen}:${k.phien}`).join(' ') || 'trống';
  return `đợt ${tt.dot} · ${tt.trang_thai} · nhịp ${tt.nhip_cuoi} · khoá ${khoa} · chờ lượt ${tt.hang_cho.length} · chờ người ${tt.cho_nguoi.length}`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  const [lenh, doiSo] = process.argv.slice(2);
  const cwd = process.cwd();
  try {
    const viec = {
      mo: () => moDot(cwd, doiSo),
      chay: () => chayPhatLich(cwd),
      dung: () => dungPhatLich(cwd),
      dong: () => dongDot(cwd) ?? 'đã đóng đợt: bộ phát lịch dừng, hook im',
      xem: () => xem(cwd),
    }[lenh];
    if (!viec) throw new Error('dùng: dieu-phoi.mjs <mo <tên>|chay|dung|dong|xem>');
    process.stdout.write(`${viec()}\n`);
  } catch (e) {
    process.stderr.write(`dieu-phoi: ${e.message}\n`);
    process.exit(1);
  }
}
```

- [ ] **Step 5: Viết `scripts/dieu-phoi/README.md`**, nghi thức cho phiên giám sát:

````markdown
# Điều phối đợt — tầng máy của Orchestrator–workers

Spec: `acceptance-gate-kit/docs/superpowers/specs/2026-10-05-orchestrator-workers-hai-tang-design.md`.
Mã này **không** chứa gì riêng của kho. Mọi giá trị riêng nằm trong `dieu-phoi.config.json` và
`hang-viec.json` của đợt.

## Mở đợt (phiên giám sát làm, sau khi owner duyệt thẻ khởi tạo)

1. `node scripts/dieu-phoi/dieu-phoi.mjs mo <tên>`
2. Điền vào thư mục đợt:
   - `hang-viec.json`: các khối `day` (id, worktree tuyệt đối đã `realpath`, link `claude://` lấy từ
     `list_sessions`) và `hang`;
   - `dieu-phoi.config.json`: `nhanh_chinh`, `bao_ve`;
   - `LUAT.md`: phần riêng của đợt.
3. `node scripts/dieu-phoi/dieu-phoi.mjs chay`
4. Giăng Monitor, timeout 30′, hết hạn thì giăng lại:
   `tail -n0 -F <thư mục đợt>/su-kien.jsonl | grep --line-buffered '"can_phan":true'`
5. Tạo task lịch 30′ với `notifyOnCompletion`. Prompt: «đọc trang-thai.json của đợt <tên>, in một
   dòng». Task này là lưới an toàn khi app khởi động lại.
6. Tạo nhóm «Đợt <tên>» ở thanh bên, ghim phiên giám sát, mở chip cho từng phiên thợ. Lời dặn của
   chip gồm thư mục đợt, mã phiên, ranh giới, và câu «đọc LUAT.md trước S1».

## Trong đợt

- Mỗi sự kiện `can_phan`: đọc dòng sự kiện. Với yêu cầu, ghi `tra-loi/<id>.json` gồm
  `{ket_qua, boi:"giam-sat", ly_do, luc}` và một dòng Nhật ký. Với `dich:"owner"`: gom lại, push tối
  đa 1 lần mỗi 30′.
- Mở lại bảng: `<thư mục đợt>/bang.html`. Xem nhanh: `node scripts/dieu-phoi/dieu-phoi.mjs xem`.
- Mỗi lần thức: `dieu-phoi.mjs chay`. Lệnh tự bỏ qua nếu bộ phát lịch còn sống, tự chạy lại nếu
  nó đã chết.

## Đóng đợt

`node scripts/dieu-phoi/dieu-phoi.mjs dong`, sau khi owner duyệt thẻ đóng đợt. Lệnh dừng bộ phát
lịch và gỡ symlink, nên hook im. Sau đó: xoá task lịch, lưu trữ phiên thợ, dọn worktree đã gộp
(kiểm `git status --porcelain` trước), viết báo cáo đợt.

## Đường lùi

`dieu-phoi.mjs dong` là đủ. `LUAT.md` và `khoa/` vẫn dùng tay được theo cách ngày 04/10.
````

- [ ] **Step 6: Chạy test, thấy qua**

Run: `npm run test:dieu-phoi`
Expected: PASS ở cả 9 tệp test.

- [ ] **Step 7: Thử khô thật trên một bản sao kho**, không dùng đợt thật:

```bash
D=$(mktemp -d) && git clone -q --depth 1 "file://$(git rev-parse --show-toplevel)" "$D/kho" && cd "$D/kho"
node scripts/dieu-phoi/dieu-phoi.mjs mo thu-kho && node scripts/dieu-phoi/dieu-phoi.mjs chay && sleep 7
node scripts/dieu-phoi/dieu-phoi.mjs xem
node scripts/dieu-phoi/dieu-phoi.mjs dong && node scripts/dieu-phoi/dieu-phoi.mjs xem; echo "ma=$?"
```

Expected:
- dòng `xem` thứ nhất: `đợt thu-kho · dang-chay · nhịp … · khoá trống · chờ lượt 0 · chờ người 0`;
- sau `dong`: `dieu-phoi: không có đợt nào đang chạy` và `ma=1`.

- [ ] **Step 8: Commit**

```bash
git add scripts/dieu-phoi/dieu-phoi.mjs scripts/dieu-phoi/mau scripts/dieu-phoi/README.md scripts/dieu-phoi/test/cli.test.mjs
git commit -m "feat(dieu-phoi): CLI mở, chạy, đóng đợt; mẫu đợt; README nghi thức phiên giám sát"
```

---

## Tự rà kế hoạch so với spec

| Mục spec | Task |
|---|---|
| §4.1 hàng việc | 1, 2, 9 (mẫu) |
| §4.2 khoá, hạn thuê, nhịp, pidfile, chạy tách app | 2, 6, 8, 9 |
| §4.3 sức khoẻ | 3, 8 |
| §4.5 hook chặn S4, đóng khi lỗi | 5 |
| §4.6 trạng thái suy từ vật kit | 8 (`tienDoCua`) |
| §4.7 phiên giám sát | 9 (README: Monitor, task lịch) |
| §4.8 bảng và hộp quyết định | 7, 8 |
| §4.9 kênh yêu cầu (phần máy), chờ người | 4, 6, 8 |
| §4.10 ghi danh | 5 (thông điệp chặn chỉ đường), 9 (lời dặn chip) |
| §4.11–§4.12 hành trình, vòng đời | 9 (CLI, README), 2 (`chonHangKe`) |
| §5.1 không ghi cứng | Global Constraints, 9 (mẫu `nhanh_chinh: "main"`) |
| §7 kiểm thử hai chiều, phát lại 04/10 | 2, 4, 5, 6, 8 |

Ngoài phạm vi 1a, đúng spec §5:
- hàng merge tự động, báo hoá cũ, train (1b);
- phiên thợ cloud (2);
- phát hiện merge tay (§4.9): cần ánh xạ hàng merge, nên đi cùng 1b.
