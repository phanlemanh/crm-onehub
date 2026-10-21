# Gom tín hiệu tự chạy — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Một lịch GitHub Actions tự gom tín hiệu mới bằng hai skill của kit và giao kết quả thành PR nháp đề xuất mà chủ kho sửa, đóng hay để gộp.

**Architecture:** `scripts/tin-hieu/gom-lich.ts` là bộ chạy tất định: đọc tín hiệu chưa có chỗ bằng lệnh của gói kit, quyết có gọi phiên gom không theo PR đề xuất đang có, gọi `claude -p`, hậu kiểm bằng răng của kit và vùng tệp, rồi đẩy nhánh `tin-hieu/gom` và mở hay sửa PR nháp. Thân PR mang ba khối máy đọc (dấu tập, nhóm của máy, giờ đề xuất từng tín hiệu) để lượt sau và lệnh đo `do-gom.ts` đọc lại mà không cần lịch sử commit của nhánh bị đẩy ép.

**Tech Stack:** Bun + TypeScript (như `scripts/tin-hieu/lich.ts`), `bun:test`, `gh` CLI, Claude Code CLI, lệnh `tin-hieu.mjs` và `cat-luot.mjs` của gói acceptance-gate.

**Spec:** `docs/superpowers/specs/2026-10-20-gom-tin-hieu-tu-chay-design.md` · hợp đồng `_acceptance/gom-tin-hieu-tu-chay/contract.md` · bộ đo `_acceptance/gom-tin-hieu-tu-chay/evals.yaml`.

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- Hằng số tinh chỉnh ở một tệp cấu hình của khu: `scripts/tin-hieu/gom-cau-hinh.ts`, `as const`, phút suy từ `PHUT_MS`.
- Gốc gói kit `AG`: env `AG` → env `CLAUDE_PLUGIN_ROOT` → `node scripts/resolve-plugin.mjs --plugin acceptance-gate --require scripts/tin-hieu.mjs --require skills/gom-tin-hieu/SKILL.md --require scripts/cat-luot.mjs`. Bản chép `scripts/tin-hieu.mjs` của crm KHÔNG dùng được (thiếu `skills/gom-tin-hieu/SKILL.md`).
- Nhánh đề xuất `tin-hieu/gom`; nhánh chính `onehub`; tác giả máy `github-actions[bot]` / `41898282+github-actions[bot]@users.noreply.github.com` (như `LICH.tacGia`).
- Tiêu đề PR: `TH2 · chore(gom-tin-hieu-tu-chay): Đợt tín hiệu <dd/mm/yyyy>`.
- Đẩy với `CRM_SKIP_HOOKS=1`; không đường nào gọi `gh pr merge`, `gh pr ready`, `--auto`.
- Mọi thông điệp in cho người là tiếng Việt, đọc từ `GOM.thongDiep` / `GOM_DO`.
- Khoá mô hình: `ANTHROPIC_API_KEY` hoặc `CLAUDE_CODE_OAUTH_TOKEN`; giá trị không bao giờ in ra.
- Mô hình `sonnet`, trần lượt 60, trần 25 phút (Hỏi-1 theo khuyến nghị).

## Review Focus

- Tên nhóm có dấu ngoặc kép, gạch hay chữ có dấu — khối máy đọc trong thân PR phải là JSON hợp lệ, không vỡ chú thích HTML (`-->` trong tên): test ở Task 2.
- `onehub` đi tiếp giữa hai lượt mà PR của máy còn mở — lượt dựng lại từ đỉnh mới, không cộng dồn commit cũ: test ở Task 4 (ca 3 của E5).
- Thân PR do người sửa tay trên web (mất khối máy đọc) — lượt coi như không có dấu và không có giờ cũ, không vỡ: test ở Task 4.
- Phiên gom để lại tệp chưa commit trong vùng cho phép — bộ chạy commit nốt rồi mới kiểm: test ở Task 3.
- `gh pr list` trả mảng rỗng hay JSON lạ — lượt đỏ có tên, không mở PR thứ hai: test ở Task 4.

---

### Task 1: Cấu hình, gốc kit và kho tạm cho bài kiểm

**Files:**
- Create: `scripts/tin-hieu/gom-cau-hinh.ts`
- Create: `scripts/tin-hieu/test/gom-kho-tam.ts`
- Test: `scripts/tin-hieu/test/gom-lich.test.ts` (khung)

**Interfaces:**
- Produces: `GOM` (`nhanhChinh`, `nhanhDeXuat`, `tacGia`, `tieuDe(ngay: Date): string`, `moHinh: { lenh, ten, tranLuot, tranMs, congCu: string, loiDan(phuQuyet: string[]): string }`, `vung: { thuMucGom, loTrinh: string[] | "doc-cau-hinh", trang: "LO-TRINH.html" }`, `than: { sua, phuQuyet, gop }`, `thongDiep: { khongMoi, nguoiSua, cungDau, phuQuyet, thieuKhoa, thieuLenh, moHinhHong, quaTran, chamNgoai, soBanGom, rangDo, cauDo, catLuotDo, dayHong, moPrHong, thieuKit, tinHieuSai }`, `boHookTruocDay`), `GOM_DO`, `PHUT_MS`; `gocKit(goc: string, env): string | null`.
- Produces (test): `dungKhoGom(o?: { tinHieu?: number[]; daGiao?: boolean }): KhoGom` với `{ origin, seed, goc }`, `claudeGia(cheDo: CheDo): { bin, argv(): string[] | null, daGoi(): boolean }`, `ghGia(): { bin, nhatKy(): string[], datPr(ds: PrGia[]): void }`, `themTinHieu(kho, so)`, `commitNguoi(kho)`.

- [ ] Kho tạm: `origin` trần + `seed` + `goc`; `seed` có `_acceptance/config.yaml` tối thiểu (`tin_hieu.nguon: [tin-hieu/crm]`, `tin_hieu.gom: tin-hieu/gom`, `lo_trinh.tep: [docs/plan/lo-trinh-mau.json]`), tệp lộ trình mẫu một hàng cũ, `scripts/product-map.mjs` giả vẽ `LO-TRINH.html` từ `cau_giao` mọi hàng, tín hiệu CHÉP từ `tin-hieu/crm/crm-<n>.json` thật; `daGiao` thêm một hồ sơ `_acceptance/viec-cu/contract.md` `status: signed-off`.
- [ ] `claudeGia`: một tệp bun ghi argv ra `argv.json`, chạy `node $AG/scripts/tin-hieu.mjs --root . --chua-gom` THẬT, dựng bản gom theo khối GOM-MAU (nửa đầu G1, nửa sau G2, tín hiệu cuối lẻ, `da_phu` khi có `da_giao`) và một hàng mỗi nhóm (`dot`, `phu`, `cau_giao`) vào tệp lộ trình mẫu, rồi commit. Chế độ: `dung`, `bo-sot`, `hai-cho`, `lot-ma`, `hang-sai`, `khong-gom`, `hai-gom`, `ngoai-commit`, `ngoai-chua-theo-doi`, `xoa-tin-hieu`, `ngoai-config`, `thoat-1`, `ngu`.
- [ ] Dò ba lệnh kit trên kho tạm bằng tay (`--chua-gom`, `--rang`, `--cau`, `cat-luot --pham-vi --lo-trinh`) tới khi bản gom `dung` cho mã 0; ghi các khoá hàng mà `cat-luot` đòi.
- [ ] Commit.

### Task 2: Thân PR và khối máy đọc

**Files:**
- Create: `scripts/tin-hieu/gom-than-pr.ts`
- Test: `scripts/tin-hieu/test/gom-lich.test.ts` (`gtc-than`)

**Interfaces:**
- Produces: `dauTap(ids: string[]): string` (sha256 của mã xếp thứ tự nối `\n`, 16 hex đầu); `dungThan(o: { banGom: BanGom; hang: HangDeXuat[]; daGiao: DaGiao[]; dau: string; gioDeXuat: Record<string, string> }): string`; `docKhoiMay(than: string): { dau: string | null; nhom: NhomMay[]; gio: Record<string, string>; tep: string | null }`. Bốn khối: `<!-- gom-dau: … -->`, `<!-- gom-nhom: <JSON base64> -->`, `<!-- gom-gio: <JSON base64> -->`, `<!-- gom-tep: <đường bản gom> -->` (base64 để tên nhóm không vỡ chú thích). Gio là ánh xạ mã tín hiệu → ISO giờ đề xuất đầu tiên.
- [ ] Test: thân có tên nhóm, số tín hiệu, `cau_giao` hàng đề xuất, lý do lẻ, câu giao việc đã giao cho tín hiệu đã phủ, ba dòng `GOM.than.*`; khối máy đọc mã hoá base64 nên thân toàn văn không khớp `/crm-\d+/`; khứ hồi `docKhoiMay(dungThan(x))` trả đúng dấu, nhóm, giờ; tên nhóm chứa `"`, `-->`, chữ có dấu vẫn khứ hồi; thân sửa tay mất khối → `dau: null`, `gio: {}`.
- [ ] Cài, chạy, commit.

### Task 3: Bộ chạy — đọc, gọi phiên gom, hậu kiểm, giao (đường chưa có PR)

**Files:**
- Create: `scripts/tin-hieu/gom-lich.ts`
- Test: `scripts/tin-hieu/test/gom-lich.test.ts` (`gtc-khong-moi`, `gtc-de-xuat`, `gtc-rang-do`, `gtc-cham-ngoai`, `gtc-hong`)

**Interfaces:**
- Consumes: Task 1, Task 2.
- Produces: `chayGom(o: { goc: string; env: Record<string, string | undefined>; gh: string; claude: string; now: Date; tranMs?: number }): Promise<{ ma: 0 | 1 | 2; dong: string[] }>`; khối `import.meta.main` như `lich.ts`.
- [ ] Viết test E1b, E2 (10 dòng), E3 (5+1 ca), E4 (4 ca), E7 (4 ca, chuỗi khoá giả `sk-test-KHOA-BI-MAT`) đúng `expected` của evals.yaml; mỗi ca chiều đỏ của evals là một test chạy bản sao tiêm trong thư mục tạm.
- [ ] Chạy, thấy đỏ.
- [ ] Cài theo thứ tự thiết kế bước 1–7; hậu kiểm: commit nốt tệp bẩn trong vùng, vẽ lại trang, kiểm vùng bằng `git diff --name-status origin/onehub HEAD` cộng `git status --porcelain --untracked-files=all`, đúng một tệp `A` dưới thư mục bản gom và không `M`/`D` ở đó, rồi `--rang`, `--cau`, `cat-luot --pham-vi <bản gom> --lo-trinh <tệp>` cho từng tệp lộ trình bị đổi (không tệp nào đổi → tệp đầu của `lo_trinh.tep`). Dòng in qua một hàm che mọi giá trị khoá có trong env.
- [ ] Chạy tới xanh, commit.

### Task 4: PR đang có — sửa của người, cùng dấu, dựng lại, phủ quyết

**Files:**
- Modify: `scripts/tin-hieu/gom-lich.ts`
- Test: `scripts/tin-hieu/test/gom-lich.test.ts` (`gtc-nguoi-sua`, `gtc-phu-quyet`)

**Interfaces:**
- Consumes: `docKhoiMay`, `GOM.thongDiep.{nguoiSua,cungDau,phuQuyet}`.
- [ ] Test E5 (3 ca) và E6 (2 ca + đối chứng MERGED), mỗi PR dựng bằng một lượt trước của chính `chayGom`; ca thân sửa tay; ca `gh pr list` trả JSON lạ → mã 1 có tên.
- [ ] Cài: `gh pr list --head tin-hieu/gom --base onehub --state all --json number,state,body,mergedAt` → PR mở: tác giả `git log --format=%ae origin/onehub..origin/tin-hieu/gom`; PR gần nhất `CLOSED` không `mergedAt` cùng dấu → dừng; khác dấu → `GOM.moHinh.loiDan(<tên nhóm từ khối gom-nhom>)`. PR mở của máy khác dấu → dựng lại, đẩy ép, `gh pr edit <n> --title … --body …`, giữ giờ đề xuất cũ cho tín hiệu cũ.
- [ ] Chạy tới xanh, commit.

### Task 5: Lệnh đo

**Files:**
- Create: `scripts/tin-hieu/do-gom.ts`
- Test: `scripts/tin-hieu/test/do-gom.test.ts` (`gtc-do`)

**Interfaces:**
- Consumes: `docKhoiMay`, `GOM_DO`.
- Produces: `doGom(o: { goc: string; gh: string; now: Date }): Promise<{ ma: 0 | 1; dong: string[] }>`.
- [ ] Test E8 ô 1–8 và ma trận ngưỡng 4 ô; lịch sử dựng bằng chính `chayGom` với `GIT_COMMITTER_DATE`/`now` đặt sẵn; ô 8 gộp nhánh hàng chờ bằng `git merge --no-ff`.
- [ ] Cài: giờ lên `onehub` = `git log --first-parent --diff-merges=first-parent --diff-filter=A --format=%cI origin/onehub -- <tệp>` (dòng cuối); giờ đề xuất = khối `gom-gio` của mọi PR; nhóm bị sửa = so khối `gom-nhom` với bản gom ở `gom-tep` trên `onehub` (đổi tên, đổi tập tín hiệu, thêm, bớt).
- [ ] Chạy tới xanh, commit.

### Task 6: Tệp lịch, răng tệp lịch, tài liệu

**Files:**
- Create: `.github/workflows/tin-hieu-gom.yml`
- Create: `_acceptance/gom-tin-hieu-tu-chay/rang/tep-lich.mjs`
- Modify: `docs/setup.md` (mục «Lịch gom tín hiệu»), `package.json` (`tin-hieu:gom`, `tin-hieu:do-gom`)

**Interfaces:**
- Consumes: `bun scripts/tin-hieu/gom-lich.ts`.
- [ ] Răng E1 (8 dòng, `--tu-kiem` ba bản tiêm), đọc YAML bằng `Bun.YAML.parse`; chạy đỏ trước khi có tệp lịch.
- [ ] Tệp lịch: `push` (`onehub`, `tin-hieu/crm/**`), `schedule` `0 11 * * *`, `workflow_dispatch`, `if` kho, `concurrency` không huỷ, `permissions` hai khoá, `timeout-minutes: 40`; bước: checkout `TIN_HIEU_TOKEN` fetch-depth 0 → Node 24 → Bun → `bun install` (CSDL giả) → `npm i -g @anthropic-ai/claude-code@<bản ghim>` → `claude plugin marketplace add phanlemanh/acceptance-gate-kit` + `claude plugin install acceptance-gate@acceptance-gate-kit` (GH_TOKEN = `TIN_HIEU_TOKEN`) → `bun scripts/tin-hieu/gom-lich.ts` với `ANTHROPIC_API_KEY`, `GH_TOKEN`.
- [ ] `docs/setup.md`: lịch làm gì, khi nào chạy, ba việc với PR, máy không đè sửa và không mở lại đề xuất bị phủ quyết, việc cài một lần (bí mật `ANTHROPIC_API_KEY` + trần chi tiêu; `TIN_HIEU_TOKEN` đọc được kho kit).
- [ ] Răng xanh, `bun run lint`, `bun run check-types`, commit.
