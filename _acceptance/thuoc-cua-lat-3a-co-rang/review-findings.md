## Trong hợp đồng

### Seed script writes unscoped updateMany against the live dev database, and one break path never restores
- file: `_acceptance/thuoc-cua-lat-3a-co-rang/gieo-du-lieu-bien.mjs:15`
- severity: high
- AC: AC-7
- source: conventions

The script runs its Prisma snippets through `bun -e` with `env: process.env` and `cwd: packages/db`. NODE_ENV is not "test", so `packages/db/src/client.ts` resolves `liveDatabase()` — DATABASE_URL, the developer's real dev database, not TEST_DATABASE_URL. Two statements have no `where` clause and no workspace scope at all:

  line 15: `await db.company.updateMany({ data: { enrichmentStatus: "PENDING" } })`
  line 27: `await db.company.updateMany({ data: { lastActivityAt: null } })`

This is the exact hazard `client.ts` was written to prevent: its `testDatabase()` error text refuses to fall back to DATABASE_URL because "a run that is interrupted leaves everybody locked out of whatever database it was pointed at". This harness walks straight around that guard.

The `lastActivityAt` path at least snapshots to /tmp/moc-hoat-dong.json and has a `--phuc-hoat-dong` restore. The `--tra-ve-pending` path has none. In `khai-sinh.mjs` (line 138/144) the no-vong-1 case uses `pha: ["--tra-ve-pending"]` with no `phuc`, so restoration falls to the default re-seed, which only fills *missing* statuses onto `rows.slice(1, 1 + thieu.length)` — four rows. Every other company's original enrichmentStatus is permanently PENDING after one acceptance run. This executor is wired into the gate as `rang3_khai_sinh_tap_rong`.

Also: /tmp is used for the snapshot rather than a scratch dir, and if /tmp/moc-hoat-dong.json is absent the `--phuc-hoat-dong` script throws instead of reporting KHONG DO DUOC.

Rationale: contract's own Coverage Core cell 2 names this exact class — unrecovered test-data corruption during the boundary-state precondition — as the same hole as du-lieu-bien.mjs's AC-7 precondition.

### Birth-registry population is a hand-written list, not enumerated from disk — the hole the round exists to close
- file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.mjs:29`
- severity: high
- AC: AC-11
- source: conventions

E11 in evals.yaml states the rule explicitly: "DAN SO KHONG LAY TU evals.yaml — lay tu CAC FILE co that: moi *.mjs va *.sh trong rang/ cong apps/app/test/messages-guard.spec.ts, tru di mot ban khai mien tru co ly do tung dong" — and names the failure mode: "lay dan so tu mot tai lieu thi chan nao khong duoc tai lieu nhac ten se khong bao gio bi doi khai sinh".

The implementation does exactly what the criterion forbids:

  const DAN_SO = [...danhSach.chanNghiemThu, ...danhSach.chanSieuDo].map(c => c.ten);

Nothing in the diff ever reads the `rang/` directory. `doiChieu()` checks declaration→record and record→file, but never file→declaration. `mien-tru.mjs` ratchets declared-lines-that-are-dead, again only in that one direction. And `khong-may-quet.sh` line 19 now `continue`s any file not named in `chanNghiemThu`, where the previous version scanned everything except an explicit skip list.

Net effect: add a new .mjs to `rang/` and it needs no birth record, gets no anti-cheat scan, and no guard turns red. The three lists happen to cover all 21 files today; nothing keeps that true. Fix is one directory read: enumerate `rang/*.{mjs,sh}` plus messages-guard.spec.ts, subtract `mienTru`, and fail on anything left undeclared.

Rationale: AC-11 requires the guard population be derived from real files in rang/ minus a justified exemption list, not a hand-typed array.

### E2's empty-set break vector covers two of the three guards it names
- file: `_acceptance/thuoc-cua-lat-3a-co-rang/evals.yaml:28`
- severity: medium
- AC: AC-2
- source: conventions

E2's `expected` names three guards — "khai-tieng, no-vong-1, du-lieu-bien" — and its `paths` lists all three plus khai-sinh.mjs. The implementation in `khai-sinh.mjs` line 113 defines:

  const CA = [ { ten: "no-vong-1.mjs", ... }, { ten: "du-lieu-bien.mjs", ... } ];

`khai-tieng.mjs` is absent. Its empty-set guard (the new `NGANH.length === 0` / `GIAI_DOAN.length === 0` exits added in this same diff) is never exercised, and `rang3_khai_sinh_tap_rong` still exits 0 with `ket qua: ca tap-rong hong=0/2`.

Separately, E2 pins the message "KHONG DO DUOC: tap <ten tap> rong", but the code pins "vang o CA HAI thu tieng" and "thieu hang cho trang thai". Neither guard emits the string the criterion asks a verifier to look for.

Rationale: E2 operationalizes AC-2's empty-observed-set refusal, and this finding shows AC-2's coverage of khai-tieng.mjs is unproven with mismatched pinned messages.

### E9's expected text describes code this diff deleted
- file: `_acceptance/thuoc-cua-lat-3a-co-rang/evals.yaml:163`
- severity: medium
- AC: AC-9
- source: conventions

E9 says the ratchet covers three declarations: "KHONG_DAU trong messages-guard.spec.ts · rang/dot-bien-sot.txt · hai khoi case cua rang/khong-may-quet.sh", and its built-in red direction is the dead `viet-tat.ts` line "trong khoi case cua khong-may-quet.sh" (lines 172-176).

Those two `case` blocks were removed in commit 60f86bd; `khong-may-quet.sh` now reads `danh-sach-chan.json`. `mien-tru.mjs` correspondingly ratchets `danh-sach-chan.json`, KHONG_DAU, and dot-bien-sot.txt. So the criterion's third declaration and its entire stated proof-of-redness point at code that no longer exists, and `viet-tat.ts` is nowhere in the tree.

The implementation is the better one; the contract text was not carried forward with it. A verifier reading E9 will look for a file and a message that cannot appear.

Rationale: E9 is the eval meant to prove AC-9's exemption ratchet, and its expected text and proof direction point at code this diff already deleted.

### Break-test name is word-split by the shell, so `bun test -t` filters on the first word only — a declared test that no longer exists still reports "dat"
- file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.mjs:181`
- severity: high
- AC: AC-11
- source: bugs

`const lenh = m.chayBai.map((x) => x.replace("{{BAI}}", bai));` splices the test name raw into the single `bash -lc "cd apps/app && bun test test/messages-guard.spec.ts -t {{BAI}}"` string (khai-sinh.json:199). Nothing quotes it, so bash word-splits: `bun test` receives `-t <first word>` and the remaining words become file filters that match nothing and are silently ignored.

Verified in this worktree:
- `bun test test/messages-guard.spec.ts -t chan nay do duoc: mot khoa khong ai goi phai bi goi ten` -> `2 pass, 19 filtered out` (i.e. `-t chan`).
- `bun test test/messages-guard.spec.ts -t chan bai kiem nay khong he ton tai` -> also `2 pass`. A break-test that does not exist at all is reported as proven.

The committed evidence already shows the damage: `evidence/khai-sinh-bang.md` line for `apps/app/test/messages-guard.spec.ts` reads `2/2 2/2 8/8 1/1` — the two distinct declarations both ran the identical 2 tests (`-t chan`), and the single declaration "ban khai CHUA_NOI khong duoc co dong chet" ran 8 tests (`-t ban`). The registry that is supposed to re-prove each named red direction each run is proving something else.

Fix: pass the name as its own argv element instead of interpolating into a shell string (e.g. `["bun","test","test/messages-guard.spec.ts","-t",bai]` with `cwd: apps/app`), or shell-quote `{{BAI}}`. Additionally assert the run count matches exactly one test, otherwise a substring match keeps over-reporting.

Rationale: AC-11 requires each guard's break direction be re-proven each run with the exact pinned message, and this word-split filter defeats that proof by matching the wrong tests.

### Test-data restore in `--chan tap-rong` ignores its exit status; a failed restore leaves every company's `lastActivityAt` null and destroys the snapshot
- file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.mjs:144`
- severity: medium
- AC: AC-7
- source: bugs

The break direction for `du-lieu-bien.mjs` runs `gieo-du-lieu-bien.mjs --go-hoat-dong`, which does an unscoped `db.company.updateMany({ data: { lastActivityAt: null } })` after snapshotting to the fixed path `/tmp/moc-hoat-dong.json`. The break command's status IS checked (line 139), but the restore is not:

```js
chay("node", [GIEO, ...(c.phuc ?? [])]);   // line 144 — status discarded
...
chay("node", [GIEO]);                       // line 149 — status discarded
```

If `--phuc-hoat-dong` fails (DB down, snapshot file gone, a single `db.company.update` throwing on a deleted row), the harness prints its normal pass/fail table and exits 0 while the test database keeps `lastActivityAt = null` on every company. The next run then hits the second `--go-hoat-dong`, which re-snapshots — now an empty list — and the original timestamps are gone for good. From there `du-lieu-bien.mjs` fails its "co hoat dong trong 30 ngay" precondition with exit 2 and the cause looks like missing seed data rather than a swallowed restore.

Fix: check `.status` on both restore calls and exit 2 with an explicit "du lieu thu chua tra ve nguyen trang" message; make `--go-hoat-dong` refuse to overwrite an existing snapshot.

Rationale: contract's own Coverage Core cell 2 names exactly this class — unrecovered test-data corruption around the boundary-state precondition — as the AC-7 gap this round targets.

### Hidden-surface ratchet counts facet submenus as page menus, giving the comparison ~4 units of slack on `companies`
- file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs:668`
- severity: medium
- AC: AC-6
- source: bugs

`khaiMenu = banKhaiMan.filter((b) => LA_MENU(b.ten)).length` counts every declared entry whose name matches `/menu/i`. For `companies`, `CHUNG(0, 4, true)` declares "menu Bộ lọc", four "menu con facet N", "menu Sắp xếp", "menu Cột" and "menu Views" — 8.

The other side of the comparison, `DEM_BE_MAT_TRANG`, is evaluated on the freshly loaded page before any dropdown is opened, and counts only elements inside `[data-slot="page-shell"]` carrying `aria-haspopup="menu"`. Facet submenus are `[data-slot="dropdown-menu-sub-trigger"]` nodes that exist only inside an open dropdown's content, so they can never be part of `trangMoi.loai`.

The guard therefore fires only when `loai > 8` while the page actually offers about 4–5. Four new undeclared page menus can be added without `BE MAT KHONG KHAI` ever triggering — the ratchet the commit "ratchet the hidden-surface declaration against what the page offers" was meant to install does not bite in that direction. (The opposite direction, `BAN KHAI CO DONG CHET`, works.)

Fix: count only declared entries that correspond to top-level page menus (exclude the facet submenu entries from `khaiMenu`), or compare submenu declarations against a separate count taken while the parent menu is open.

Rationale: AC-6 requires the hidden-surface declaration be reconciled against surfaces the page actually offers, and this slack lets undeclared menus go undetected.

### Hình dạng 5 — tuyên quét LỚP "mọi file có thật trong rang/" nhưng dân số là danh sách gõ tay
- file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.mjs:29`
- severity: high
- AC: AC-11
- source: measurement

AC-11 (contract.md) khai dân số là "suy từ CÁC FILE CÓ THẬT trong rang/ cộng apps/app/test/messages-guard.spec.ts, trừ đi một bản khai miễn trừ", và E11 nói rõ lý do: "lay dan so tu mot tai lieu thi chan nao khong duoc tai lieu nhac ten se khong bao gio bi doi khai sinh". Nhưng khai-sinh.mjs:26-31 đọc `danh-sach-chan.json` rồi lấy `DAN_SO = [...chanNghiemThu, ...chanSieuDo]` — một liệt kê điểm-case gõ tay. Không file nào trong rang/ gọi readdir/glob (grep readdir|globSync trên toàn thư mục rang/ trả về rỗng), nên không có phép trừ "tất cả file − miễn trừ" nào chạy. Bánh cóc duy nhất chạm danh sách này là mien-tru.mjs:73-77, và nó chỉ kiểm MỘT chiều (`song: (ten) => existsSync(...)`, tức file được miễn trừ còn tồn tại); không có chiều ngược kiểm mọi file trong rang/ đều nằm trong một trong ba danh sách. Hệ quả: thêm một chân đo mới `rang/x.mjs` mà quên khai — nó không có mục khai sinh, không ai đòi véc-tơ phá, và cả E11 lẫn E12 vẫn xanh. Đây đúng cái lỗ mà tiêu chí sinh ra để giết.

Rationale: same AC-11 population-enumeration requirement as the earlier finding on this hand-written list.

### Hình dạng 5 — chân tập-rỗng khai ba chân nhưng chỉ chạy hai
- file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.mjs:113`
- severity: high
- AC: AC-2
- source: measurement

E2/AC-2 khai lớp gồm ba chân "co the roi vao tap quan sat rong — khai-tieng, no-vong-1, du-lieu-bien", và `paths` của E2 liệt kê cả khai-tieng.mjs. Mảng `CA` ở khai-sinh.mjs:113-127 chỉ có hai phần tử: no-vong-1.mjs và du-lieu-bien.mjs. Số khẳng định (2) < số phần tử của lớp đã tuyên (3); khai-tieng.mjs không bao giờ được chạy ở trạng thái không-quan-sát-được, nên nhánh "KHONG DO DUOC: tap ... rong" của nó (khai-tieng.mjs:161-167 và nhánh ngành ở cuối file) chưa từng được chứng minh là đi tới được. Dòng tổng kết `ket qua: ca tap-rong hong=${hong}/${CA.length}` in mẫu số 2, che luôn chỗ thiếu.

Rationale: finding names AC-2 directly: the declared three-guard empty-set class is only exercised for two of them.

### Hình dạng 5 — AC-1 đòi số khẳng định BẰNG số giá trị enum, chân chỉ khẳng định trên các giai đoạn có trong dữ liệu thu
- file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs:183`
- severity: medium
- AC: AC-1
- source: measurement

AC-1 viết "số khẳng định bằng số giá trị enum; một giá trị enum không tìm được phần tử tương ứng trên màn làm chân đỏ". Chân lấy `MA_GIAI_DOAN` = tập stage rút từ các hàng deals.list (dòng 101), rồi vòng khẳng định chạy trên `GIAI_DOAN` suy từ tập đó (dòng 183). Các giá trị enum không có hàng dữ liệu được tính vào `chuaPhu` (dòng 170) và in ra kèm chính chữ "khai ra, khong tinh la dat" (dòng 177) — tức chân vẫn exit 0 khi enum còn giá trị chưa được khẳng định lần nào. Ma trận toàn phần theo enum không tồn tại; số khẳng định = số giá trị CÓ TRONG DỮ LIỆU, không phải số phần tử của lớp đã tuyên.

Rationale: finding names AC-1 directly: assertion count must equal the enum's value count, not the count of values present in fetched data.

### Hình dạng 3 — lời hứa là quan hệ "ô Phụ trách của hàng đó hiện ký hiệu ô-trống", khẳng định là "chuỗi có mặt đâu đó trên trang"
- file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs:177`
- severity: medium
- AC: AC-7
- source: measurement

Trạng thái biên thứ nhất khai `cho: ["—"]` với lý do ghi ngay tại chỗ (dòng 66-68): "o Phu trach trong phai hien ky hieu o-trong chung cua bo dung (EmptyCellValue)". Đó là một quan hệ giữa một Ô cụ thể và một hàng cụ thể. Khẳng định thật lại là `gop.includes(m)` với `gop = chu.join(" · ")` (dòng 172, 178) — toàn bộ text node hiển thị của cả trang gộp lại. Em dash là ký hiệu ô-trống dùng chung của bộ dựng, nên bất kỳ ô trống nào ở bất kỳ cột nào (Ngành, Tên miền, Hoạt động cuối…) cũng làm khẳng định này xanh, kể cả khi ô Phụ trách để trắng hoàn toàn — đúng lớp lỗi mà `vi_sao_cho` nói nó cấm.

Rationale: AC-7 requires reading the screen text that proves each boundary state's specific promised relation, not any matching substring anywhere on the page.

### Hình dạng 3 — lời hứa là quan hệ bề-rộng-cột với độ-dài-tên, khẳng định đọc textContent nên cắt CSS không bao giờ làm nó đỏ
- file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs:189`
- severity: medium
- AC: AC-7
- source: measurement

Trạng thái biên thứ ba khai `vi_sao: "be rong cot chua bao gio gap ten that dai"` (dòng 81) và có `cho: []`, `cam: []` (dòng 83-84), nên khẳng định duy nhất của nó là dòng 189: `const tenDay = chu.some((t) => t.includes(c.viDu));`, báo lỗi "TEN BI CAT" ở dòng 191. `chu` do DOC() rút từ text node (dòng 140-152), mà `text-overflow: ellipsis` không hề đổi textContent — một tên 40-60 ký tự bị cắt cụt trên màn vẫn cho `tenDay === true`. Chính kho này đã có cách đo đúng cho quan hệ đó: ban-ve.mjs chân `be-rong` so `boxWidth` với `textWidth` và phân biệt "CAT TRAN" / "cat + ba cham" (ban-ve.mjs:1114-1136); chân này không dùng.

Rationale: AC-7 requires reading what is actually rendered for the boundary state, and a textContent check cannot observe CSS truncation, so the promised relation goes unverified.

### Hình dạng 5 — AC-10 đòi sạch sau MỌI đường thoát, chân khoanh-vung chỉ đo đường thoát bình thường
- file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien.mjs:175`
- severity: medium
- AC: AC-10
- source: measurement

AC-10 và E10(b) khai lớp ba phần tử: "sau khi chan thoat bang MOI duong (binh thuong, SIGINT, loi khong bat), git status --porcelain tren nam file kho chuoi phai RONG". Nhánh `--chan khoanh-vung` (dòng 175-252) chỉ kiểm `sachChua(...)` một lần, sau khi khối try/finally chạy hết đường bình thường (dòng 245-249), rồi `process.exit`. Nhánh này còn KHÔNG đăng ký trình xử lý tín hiệu nào: `process.on("SIGINT"...)` và `process.on("uncaughtException"...)` nằm ở dòng 283-292, tức SAU khối khoanh-vung đã thoát, nên hai đường thoát còn lại vừa không được đo vừa không được che trong chính chân được E10 chỉ định.

Rationale: finding names AC-10 directly: the self-test must prove cleanliness after every exit path, and khoanh-vung only exercises the normal one.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **A guard declared in chanNghiemThu is silently never scanned by the anti-cheat check**
  Người dùng thấy gì: Một khâu tự kiểm dùng để bắt các kịch bản kiểm thử gian dối có thể bỏ sót một kịch bản mà không báo lỗi gì, nên nếu kịch bản đó có gian dối, sẽ không ai biết.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khong-may-quet.sh:17`
  severity: high
  Đề xuất: known-limits

- **The two JSON declarations that drive the registry are parsed with no schema**
  Người dùng thấy gì: Nếu một tệp khai báo bên trong bị sai định dạng, công cụ đo có thể dừng đột ngột thay vì báo rõ nguyên nhân, khiến người xem kết quả khó biết đo được hay không.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.mjs:26`
  severity: medium
  Đề xuất: new-contract

- **Unused constant left in du-lieu-bien.mjs**
  Người dùng thấy gì: Có một khai báo thừa, không dùng tới, bên trong công cụ đo; nó không ảnh hưởng gì tới kết quả đo hay tới người dùng sản phẩm.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs:56`
  severity: low
  Đề xuất: wont-fix

- **CLAUDE.md still documents ports 3000/3001 that the new executors no longer measure**
  Người dùng thấy gì: Tài liệu hướng dẫn chạy thử vẫn ghi hai cổng cũ; ai làm đúng theo hướng dẫn có thể vô tình kiểm tra nhầm phiên bản khác, mà kết quả vẫn trông bình thường.
  file: `CLAUDE.md:90`
  severity: low
  Đề xuất: new-contract

- **`dot-bien.mjs` exits without cleanup on the "cay lanh da do" path, leaking a detached dev server on port 3200 and a git worktree**
  Người dùng thấy gì: Khi công cụ đột biến gặp một tình huống lỗi hiếm, nó có thể để lại một máy chủ và một bản sao kho chạy ngầm không dọn dẹp, khiến lượt đo kế tiếp vô tình đọc nhầm bản cũ mà vẫn báo kết quả trông hợp lệ.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien.mjs:341`
  severity: high
  Đề xuất: new-contract

- **Anti-source-reading ratchet silently skips any declared guard that is not a file inside `rang/`**
  Người dùng thấy gì: Một khâu tự kiểm dùng để bắt các kịch bản kiểm thử gian dối có thể bỏ sót một kịch bản mà không báo lỗi gì, nên nếu kịch bản đó có gian dối, sẽ không ai biết.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khong-may-quet.sh:19`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — chặn chống-lách khai 9 chân nghiệm thu nhưng vòng lặp chỉ quét được 8**
  Người dùng thấy gì: Một khâu tự kiểm dùng để bắt các kịch bản kiểm thử gian dối có thể bỏ sót một kịch bản mà không báo lỗi gì, nên nếu kịch bản đó có gian dối, sẽ không ai biết.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khong-may-quet.sh:17`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 — mặc định cổng 3000/3001 trỏ về checkout chính, không phải cây đang kiểm**
  Người dùng thấy gì: Nếu ai chạy riêng một phép đo mà không qua cấu hình chung, phép đo đó có thể âm thầm kiểm tra nhầm sang bản chạy chính thay vì bản đang xét, mà vẫn in ra kết quả trông hợp lệ.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs:10`
  severity: medium
  Đề xuất: new-contract

⚠ Cụm ngoài vùng phủ: 4/21 lỗi rơi vào file không bộ đo nào phủ (_acceptance/thuoc-cua-lat-3a-co-rang/gieo-du-lieu-bien.mjs, _acceptance/thuoc-cua-lat-3a-co-rang/evals.yaml, CLAUDE.md) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
