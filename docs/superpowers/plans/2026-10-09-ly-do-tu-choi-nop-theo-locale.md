# Lý do từ chối nộp theo ngôn ngữ — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dòng hệ thống «Kara nộp bản nháp chưa được — …» hiện câu lý do theo ngôn ngữ trang thay cho mã máy không dấu.

**Architecture:** Tập bảy mã từ chối dời từ `TRO_LY_OKR_SOAN.tuChoi` (agent) sang `LY_DO_TU_CHOI_NOP` trong
`packages/validation/src/okr-cuoc-soan.ts`, giữ nguyên giá trị chuỗi; agent trỏ vào đó và ghi chặt; bộ đọc
`docKetQuaNop` đổi giá trị thành khoá mã (lạ hay rỗng → `null`); app ánh xạ khoá sang câu trong `okrSoanMessages`.

**Tech Stack:** TypeScript, Zod, React (Next.js app), bun test + jsdom, puppeteer cho bàn đo màn.

**Spec:** `docs/superpowers/specs/2026-10-09-ly-do-tu-choi-nop-theo-locale-design.md` · hợp đồng
`_acceptance/ly-do-tu-choi-nop-theo-locale/contract.md` (AC-1…AC-9) · `evals.yaml` (E1…E9).

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Giá trị chuỗi của bảy mã giữ nguyên từng ký tự so với `577f23b2b` (AC-5).
- Câu đúng bằng `rang/cau-da-duyet.json` (bảng duyệt ở Cổng 1).
- Tệp ngoài ranh giới hàng chỉ những tệp đã duyệt: P1-33 (`apps/agent-okr/agent/lib/config.ts` khối `tuChoi` + import,
  `_acceptance/config.yaml` chỉ thêm, design, kế hoạch, bản đồ), P1-39 (`_acceptance/soan-okr-khong-lac/rang/{man,ranh-gioi}.mjs`,
  `decisions.jsonl` của K2b), P1-40 (`apps/app/test/khung-soan-okr.tsx`: `datNgonNgu` + một dòng). Ghim lại K2b sinh
  `_acceptance/soan-okr-khong-lac/{evidence-report.md,run-log.jsonl}`.
- Bài DOM chỉ so giá trị nguyên thuỷ; lượt chạy đầu của tệp DOM mới có trần thời gian và đo RSS (luật 35).
- Đột biến tại chỗ chạy tuần tự, trả tệp trong `finally`, so sha256.

## Review Focus

1. Transcript của cuộc soạn đã lưu trước vòng này (giá trị mã cũ) phải ra câu — E5 round-trip từ schema ghi thật, E9 tải lại trang.
2. Lý do lạ từ một bản agent mới hơn: bộ đọc phải trả `null` (không phải chuỗi thô) — Task 2 thêm khẳng định tầng đọc vào E3, vì nếu chỉ đo màn thì đột biến (b) vẫn xanh (tra câu theo chuỗi lạ ra `undefined` → câu không lý do).
3. Kết quả `da-ghi` mang `lyDo: ""` — bên ghi chặt vẫn phải nhận chuỗi rỗng (Task 1 bước kiểm agent).
4. Bài K2b đang dùng lý do giả «so moi: 2031» — Task 1 đổi sang mã thật để K2b vẫn xanh.
5. Bàn đo màn E10 của K2b đòi chuỗi mã trên màn — Task 4 đổi sang câu đã duyệt.

---

### Task 1: Tập mã một chỗ, bên ghi chặt, bộ đọc ra mã

**Files:**
- Modify: `packages/validation/src/okr-cuoc-soan.ts` (sau `KET_QUA_NOP`)
- Modify: `apps/agent-okr/agent/lib/config.ts` (khối `tuChoi` + import)
- Modify: `apps/agent-okr/agent/lib/nop-ban-nhap.ts` (dòng `lyDo` của `ketQuaNop`, hàm `tuChoi`, import)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/moc-nop.ts` (`NopKhongThanh.lyDo`)
- Modify: `apps/app/test/soan-okr-khong-lac.spec.ts`, `apps/app/test/soan-okr-khong-lac.dom.tsx` (lý do giả → mã thật)
- Create: `_acceptance/ly-do-tu-choi-nop-theo-locale/rang/chung.mjs`, `rang/gia-tri.mjs`

**Interfaces — Produces:**
- `LY_DO_TU_CHOI_NOP: { readonly [k in LyDoTuChoiNop]: string }` (bảy khoá như `config.ts` cũ)
- `type LyDoTuChoiNop = keyof typeof LY_DO_TU_CHOI_NOP`
- `lyDoTuChoiGhi: ZodType<"" | (typeof LY_DO_TU_CHOI_NOP)[LyDoTuChoiNop]>`
- `docKetQuaNop(value: unknown): { ketQua: "da-ghi" | "tu-choi"; lyDo: LyDoTuChoiNop | null } | null`
- `NopKhongThanh.lyDo: LyDoTuChoiNop | null`

- [ ] **Step 1: Viết `rang/gia-tri.mjs` (E5) trước, chạy để thấy đỏ**

```js
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: HERE, encoding: "utf8" }).trim();
const NGUON = "577f23b2b";
const docGoc = (tep) => {
	const s = execFileSync("git", ["show", `${NGUON}:apps/agent-okr/agent/lib/config.ts`], { cwd: ROOT, encoding: "utf8" });
	const khoi = /\ttuChoi: \{\n([\s\S]*?)\n\t\},/.exec(s)?.[1] ?? "";
	return Object.fromEntries([...khoi.matchAll(/(\w+): "([^"]*)",/g)].map((m) => [m[1], m[2]]));
};
```
Then: đọc `rang/ly-do-goc.json` (hoặc bản ở `--mau-sai`), đòi khớp `docGoc` từng cặp (lệch → in `mau lech nguon 577f23b2b`,
exit 1); so với `LY_DO_TU_CHOI_NOP` (import động `packages/validation/src/okr-cuoc-soan.ts`) cùng khoá, từng giá trị `===`
(lệch → `gia tri doi: <khoá>`, exit 1); với mỗi khoá `ketQuaNop.parse({ketQua:"tu-choi", lyDo, soDong:0, biLoai:[], giuNguyen:[]})`
(import `apps/agent-okr/agent/lib/nop-ban-nhap.ts`) rồi `docKetQuaNop` → `lyDo === khoá`; `ketQuaNop.safeParse` với lyDo
`"la"` phải `success === false`. In `gia-tri: 7/7 ma giu nguyen, 7/7 round-trip`.

Run: `bun _acceptance/ly-do-tu-choi-nop-theo-locale/rang/gia-tri.mjs` → Expected: lỗi import `LY_DO_TU_CHOI_NOP` (chưa có).

- [ ] **Step 2: Thêm tập vào validation**

```ts
export const LY_DO_TU_CHOI_NOP = {
	cuocKhongThuocPhien: "cuoc khong thuoc phien",
	cuocKhongDang: "cuoc khong con dang",
	donViChuaBat: "don-vi-chua-bat",
	saiMucDich: "phien khong phai okr-soan",
	chuKyKhongLapKeHoach: "chu ky khong o pha lap ke hoach",
	dongTrungKhoa: "dong trung khoa",
	phienKhongSong: "phien khong con song",
} as const;

export type LyDoTuChoiNop = keyof typeof LY_DO_TU_CHOI_NOP;
type GiaTriLyDo = (typeof LY_DO_TU_CHOI_NOP)[LyDoTuChoiNop];

const GIA_TRI_LY_DO = Object.values(LY_DO_TU_CHOI_NOP) as [GiaTriLyDo, ...GiaTriLyDo[]];
const MA_THEO_GIA_TRI = new Map<string, LyDoTuChoiNop>(
	(Object.keys(LY_DO_TU_CHOI_NOP) as LyDoTuChoiNop[]).map((k) => [LY_DO_TU_CHOI_NOP[k], k]),
);

export const lyDoTuChoiGhi = z.union([z.enum(GIA_TRI_LY_DO), z.literal("")]);

export const ketQuaNopDoc = z.object({
	ketQua: z.enum(KET_QUA_NOP),
	lyDo: z.string().transform((v): LyDoTuChoiNop | null => MA_THEO_GIA_TRI.get(v) ?? null),
});
```
`docKetQuaNop` giữ nguyên thân (safeParse → data | null).

- [ ] **Step 3: Agent trỏ vào tập, ghi chặt.** `config.ts`: import `LY_DO_TU_CHOI_NOP` từ `@crm/validation/okr-cuoc-soan` (gộp vào dòng import `BAN_NHAP_TRAN` đã có), khối `tuChoi: {…}` thành `tuChoi: LY_DO_TU_CHOI_NOP,`. `nop-ban-nhap.ts`: `lyDo: lyDoTuChoiGhi,` trong `ketQuaNop`; `const tuChoi = (lyDo: (typeof TU_CHOI)[keyof typeof TU_CHOI]): KetQuaNop => ({…})`; import `lyDoTuChoiGhi`.

- [ ] **Step 4: `moc-nop.ts`** — `import type { LyDoTuChoiNop }`; `lyDo: LyDoTuChoiNop | null`; nhánh tu-choi: `lyDo: kq.lyDo`.

- [ ] **Step 5: Bài K2b dùng mã thật.** `soan-okr-khong-lac.spec.ts`: `tuChoi("n2", LAN_2, LY_DO_TU_CHOI_NOP.chuKyKhongLapKeHoach)` và
`expect(khongThanh[0]?.lyDo).toBe("chuKyKhongLapKeHoach")`; dòng thứ hai (`tuChoi("n2", LAN_2, "x")`) → `LY_DO_TU_CHOI_NOP.cuocKhongDang`.
`soan-okr-khong-lac.dom.tsx`: `kq("tu-choi", LY_DO_TU_CHOI_NOP.chuKyKhongLapKeHoach)` và
`expect(...).toBe(m.moc.nopKhongThanh(m.moc.lyDoTuChoi.chuKyKhongLapKeHoach))` (sau Task 2).

- [ ] **Step 6: Chạy** `bun _acceptance/ly-do-tu-choi-nop-theo-locale/rang/gia-tri.mjs` → `gia-tri: 7/7 …`, exit 0;
`--mau-sai` (tệp mẫu tạm đổi một giá trị) → exit 1 `mau lech nguon 577f23b2b`; `cd apps/agent-okr && bun run check-types`;
`TZ=Asia/Ho_Chi_Minh bun test` cho `soan-okr-khong-lac.spec.ts` (sau Task 2 cả `.dom.tsx`). Phục vụ E5. independent: false.

- [ ] **Step 7: Commit** `fix(okr-soan): mã lý do từ chối nộp khai một chỗ ở packages/validation, bộ đọc trả mã`.

### Task 2: Câu theo ngôn ngữ trên màn

**Files:**
- Modify: `apps/app/lib/messages/okr-soan.ts` (khối `moc` vi và en: `lyDoTuChoi`)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/hoi-thoai-soan.tsx` (dòng gọi `nopKhongThanh`)
- Modify: `apps/app/test/khung-soan-okr.tsx` (`datNgonNgu`, dòng `LocaleProvider`)
- Modify: `apps/app/test/messages-guard.spec.ts` (nếu bài «khoá chết»/ghim đòi)
- Create: `apps/app/test/soan-okr-ly-do-tu-choi.dom.tsx` (describe `k2c-vi`, `k2c-en`, `k2c-ngoai`)
- Create: `apps/app/test/soan-okr-ly-do-tu-choi.spec.ts` (describe `k2c-ban-do`)

**Interfaces — Consumes:** Task 1. **Produces:** `okrSoanMessages(locale).moc.lyDoTuChoi: Record<LyDoTuChoiNop, string>`;
`datNgonNgu(locale: "vi" | "en"): void` trong `khung-soan-okr.tsx`; `soBanDo(banDo, cau): string[]` trong spec.

- [ ] **Step 1: Viết bài DOM và spec trước, chạy để thấy đỏ.** DOM đọc `cau-da-duyet.json` qua
`resolve(import.meta.dir, "../../../_acceptance/ly-do-tu-choi-nop-theo-locale/rang/cau-da-duyet.json")`; mỗi ca: `datNgonNgu(loc)`,
`datDanhSach({ dong: [mt("1", "Đối tác lớn gắn bó")] })`, `moTrang()`, `datAgent({status:"ready", data:{messages:[tinNop da-ghi, tinNop tu-choi lyDo]}})`,
`nhip(10)`, đọc `textContent` của `[data-nop-khong-thanh="tu-choi"]`.
  - `k2c-vi`/`k2c-en`: lặp `Object.keys(LY_DO_TU_CHOI_NOP)` (đòi length 7); `expect(chu === TIEN_TO[loc] + CAU[loc][ma] ? "dung" : …)`;
    vi đòi `/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i` khớp câu; dòng không chứa khoá hay giá trị nào
    (`lo ma may: <x>`); en không chứa ký tự có dấu.
  - `k2c-ngoai`: lyDo `"ma-moi-cua-agent"` và `""` × vi/en: `chu === CHI[loc]` (vi «Kara nộp bản nháp chưa được», en «Kara could not submit the draft»);
    `qa('[data-kara-turn="checkpoint"]').length === 1`; tầng đọc: `docKetQuaNop(output).lyDo === null` và
    `luotNop(items).khongThanh[0].lyDo === null`, khác thì `lo chuoi la: ma-moi-cua-agent`.
  - Spec `k2c-ban-do`: `soBanDo(banDo, cau)` trả lỗi `thieu cau cho ma: k` / `cau sai cho ma: k`; thật → `[]` cả vi/en; giả đổi chỗ hai câu và giả thiếu một mã → lỗi đúng thông điệp.

Run (DOM, lần đầu có trần + RSS): `cd apps/app && TZ=Asia/Ho_Chi_Minh /usr/bin/time -l perl -e 'alarm 120; exec @ARGV' bun test --preload ../../packages/ui/test/setup-dom.ts ./test/soan-okr-ly-do-tu-choi.dom.tsx` → Expected FAIL (`lyDoTuChoi` chưa có).

- [ ] **Step 2: Câu chữ.** Trong `moc` của vi và en thêm `lyDoTuChoi: { … } satisfies Record<LyDoTuChoiNop, string>` đúng bảy câu của
`cau-da-duyet.json` (import type từ `@crm/validation/okr-cuoc-soan`). `nopKhongThanh` giữ chữ ký.

- [ ] **Step 3: Màn.** `hoi-thoai-soan.tsx`: `m.moc.nopKhongThanh(hong.lyDo ? m.moc.lyDoTuChoi[hong.lyDo] : null)`.

- [ ] **Step 4: Khung bài.** `khung-soan-okr.tsx`: `const ngonNgu = { hien: "vi" as "vi" | "en" }; export function datNgonNgu(l: "vi" | "en") { ngonNgu.hien = l; }`;
`<LocaleProvider locale={ngonNgu.hien}>`; trong `don()` đặt lại `ngonNgu.hien = "vi"`.

- [ ] **Step 5: Chạy** DOM mới (3 describe), spec mới, `soan-okr-khong-lac.*`, `messages-guard.spec.ts`, `cd apps/app && bunx tsc --noEmit`. Phục vụ E1, E2, E3, E6. independent: false.

- [ ] **Step 6: Commit** `fix(okr-soan): lý do Kara nộp bị từ chối hiện câu theo ngôn ngữ trang`.

### Task 3: Thước một chỗ khai (E4)

**Files:** Create `_acceptance/ly-do-tu-choi-nop-theo-locale/rang/mot-nguon.mjs`.

- [ ] **Step 1:** Viết thước: import thật `TRO_LY_OKR_SOAN` (`apps/agent-okr/agent/lib/config.ts`) và `LY_DO_TU_CHOI_NOP`; `===` → nếu khác in
`khong cung doi tuong`. Quét ba gốc bằng `fs.readdirSync(…, { recursive: true, withFileTypes: true })` (không glob — `[slug]`),
lọc `.ts`/`.tsx`, in số tệp mỗi gốc, gốc 0 tệp → `goc quet rong: <gốc>`; tệp chứa literal `"<giá trị>"` của bất kỳ mã nào → danh sách,
đòi đúng `[packages/validation/src/okr-cuoc-soan.ts]`, khác → `tap ma khai <n> cho: <tệp…>`. `--ban-sao them-tap`: chép ba gốc vào
`fs.mkdtempSync(os.tmpdir())`, thêm tệp `.../soan/them.ts` chứa `"chu ky khong o pha lap ke hoach"`, quét bản sao. `--goc-rong <gốc>`: thay gốc đó bằng thư mục rỗng tạm.
- [ ] **Step 2:** Chạy xanh (`mot-nguon: LY_DO_TU_CHOI_NOP 1 cho, agent tro vao, 3 goc quet (a/b/c tep)`), hai chiều đỏ exit 1 với thông điệp. Phục vụ E4. independent: true.
- [ ] **Step 3:** Commit `test(acceptance): răng K2c E4–E5`. (gộp `chung.mjs`, `gia-tri.mjs` nếu chưa commit)

### Task 4: Đột biến, ranh giới, và hai thước của K2b

**Files:** Create `rang/dot-bien.mjs`, `rang/ranh-gioi.mjs` (K2c). Modify `_acceptance/soan-okr-khong-lac/rang/ranh-gioi.mjs`,
`_acceptance/soan-okr-khong-lac/rang/man.mjs`, `_acceptance/soan-okr-khong-lac/decisions.jsonl`.

- [ ] **Step 1: dot-bien.mjs** — chiều xanh trước (`k2c_vi`, `k2c_ngoai`, `k2c_mot_nguon`, `k2c_gia_tri` qua `lenhCauHinh`), không xanh → exit 2.
Năm vết, mỗi vết một tệp, trả trong `finally`, so sha256 (khác → exit 3 `TEP KHONG TRA LAI`):
(a) `hoi-thoai-soan.tsx`: `m.moc.nopKhongThanh(hong.lyDo ? m.moc.lyDoTuChoi[hong.lyDo] : null)` → `m.moc.nopKhongThanh(hong.lyDo)` → `k2c_vi` đỏ có `lo ma may:`;
(b) `okr-cuoc-soan.ts`: `MA_THEO_GIA_TRI.get(v) ?? null` → `(v || null) as LyDoTuChoiNop | null` → `k2c_ngoai` đỏ có `lo chuoi la: ma-moi-cua-agent`;
(c) `config.ts`: `tuChoi: LY_DO_TU_CHOI_NOP,` → khối literal bảy dòng cũ → `k2c_mot_nguon` đỏ có `khong cung doi tuong`;
(d) `okr-soan.ts`: xoá dòng `phienKhongSong` trong `lyDoTuChoi` của vi → `cd apps/app && bunx tsc --noEmit` exit ≠ 0 và output chứa `phienKhongSong`;
(e) `okr-cuoc-soan.ts`: giá trị `chu ky khong o pha lap ke hoach` → `chu ky khong o pha lap-ke-hoach` → `k2c_gia_tri` đỏ có `gia tri doi: chuKyKhongLapKeHoach`.
In `dot-bien: 5/5 vet bi bat, tep tra lai nguyen`.
- [ ] **Step 2: ranh-gioi.mjs (K2c)** — neo: `F = git log --diff-filter=A --format=%H -- _acceptance/<slug>/contract.md | tail -1`; nếu
`git merge-base --is-ancestor F origin/onehub` → `M = git rev-list --first-parent --ancestry-path F..origin/onehub | tail -1`, đo
`merge-base(M^1, M^2)..M^2`; không → `merge-base(HEAD, origin/onehub)..HEAD`. Ranh giới: `hang-viec.json` (mã K2c) hoặc hằng chép;
cham-tep P1-33/P1-39/P1-40; tệp ghim lại K2b (`_acceptance/soan-okr-khong-lac/{evidence-report.md,run-log.jsonl}`). Luật dòng:
`config.yaml` chỉ `+`; `config.ts` `-` thuộc khối `tuChoi` cũ (tám dòng mở/giá trị/đóng) hoặc dòng import, `+` là `tuChoi: LY_DO_TU_CHOI_NOP,` hoặc import;
`nop-ban-nhap.ts` `-`/`+` khớp dòng `lyDo`, `tuChoi`, `KetQuaNop => ({`, hoặc import. Chiều đỏ `--them`, `--diff-mau`, `--diff-mau-nop`.
- [ ] **Step 3: Hai thước K2b (P1-39).** `ranh-gioi.mjs` của K2b: neo `merge-base(577f23b2b^1, 34badf2a)..34badf2a` (commit ghim của K2b),
khuôn đã dùng cho K2 ở P1-31. `man.mjs` của K2b: `canDong` đọc câu `chuKyKhongLapKeHoach` (vi) từ `cau-da-duyet.json` của K2c. Một dòng
`fix` vào `decisions.jsonl` của K2b.
- [ ] **Step 4:** Chạy cả ba thước hai chiều; commit `test(acceptance): răng K2c E7–E8; neo E9 và câu E10 của K2b`. Phục vụ E7, E8. independent: false.

### Task 5: Bàn đo màn (E9)

**Files:** Create `_acceptance/ly-do-tu-choi-nop-theo-locale/rang/man.mjs`.

- [ ] **Step 1:** Khuôn `_acceptance/soan-okr-khong-lac/rang/man.mjs`: tiến trình cha không mở phiên, mỗi lượt (`vi-390`, `vi-1440`, `en-1440`)
một tiến trình con tự `moPhien`; lượt `en` đặt cookie `lang=en` trên `t.ctx` trước khi mở trang. Bước: `mo` → nộp 1 → chu kỳ rời pha (sql) →
nộp 2 (tu-choi) → trả pha → nộp lại → đòi một `[data-nop-khong-thanh=tu-choi]` có `textContent === TIEN_TO[loc] + CAU[loc].chuKyKhongLapKeHoach`,
không chứa khoá/giá trị; ảnh `E9-tu-choi-<lượt>.png`; `t.p.goto(url)` mới, chờ yên, đòi lại cùng chữ; ảnh `E9-tu-choi-<lượt>-tai-lai.png`.
Chiều đỏ `--kiem-do-do tho`: cha sửa tại chỗ vết (a) rồi chạy lượt `vi-1440`, trả tệp, so sha → in `lo ma may:` và exit 1.
- [ ] **Step 2:** Chạy qua `mot-luot.sh` (xanh + đỏ, tuần tự), xem ảnh. Phục vụ E9. independent: false.
- [ ] **Step 3:** Commit `test(acceptance): bàn đo màn K2c E9 — vi 390/1440, en 1440, tải lại`.
