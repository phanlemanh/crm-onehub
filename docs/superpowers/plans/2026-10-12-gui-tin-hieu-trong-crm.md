# Gửi tín hiệu trong CRM — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (feature-loop S3, main loop). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người dùng CRM gửi tín hiệu (hai câu: muốn làm gì · điều gì xảy ra) từ mọi màn, xem tín hiệu của mình đang ở đâu; chủ kho kéo tín hiệu về git theo khuôn kit bằng một lệnh.

**Architecture:** Bảng `TinHieu` là hàng chờ của CRM; router `tinHieu` (phạm vi chung) có `gui`/`cuaToi`/`xoa` tự phục vụ và `keoVe` chỉ quản trị (gọi bằng khoá API qua REST). Lệnh `scripts/tin-hieu/keo-ve.ts` ghi `tin-hieu/crm/crm-<số>.json`. Trang máy chủ `/[slug]/tin-hieu` ghép `cuaToi` với khoá `tin_hieu` của khối dữ liệu `LO-TRINH.html` (kit ≥ 2.27).

**Tech Stack:** Prisma 7 (Postgres), NestJS + nestjs-trpc, Next.js (app router, cacheComponents), Zod, Bun test, `@crm/ui`.

**Duyệt kế hoạch (Gate 1.5):** Manh Phan, 2026-10-12T03:08:18Z — chủ kho gõ «Duyệt kế hoạch gui-tin-hieu-trong-crm: duyệt».

**Spec:** `docs/superpowers/specs/2026-10-12-gui-tin-hieu-trong-crm-design.md` · hợp đồng `_acceptance/gui-tin-hieu-trong-crm/contract.md` · phép đo `_acceptance/gui-tin-hieu-trong-crm/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md). Mọi chữ hiện cho người qua `apps/app/lib/messages/tin-hieu.ts` (vi + en).
- Hằng số chỉ ở `TIN_HIEU` (`packages/validation/src/tin-hieu.ts`): trần 10 tín hiệu/người/ngày giờ Việt Nam, 1.000 ký tự mỗi ô, tiêu đề 120, màn 200, đếm 30 ngày, phiên `crm`, nguồn `tin-hieu/crm`.
- Khuôn tệp = khuôn yêu cầu của kit `{phien, loai: "tin-hieu", hang: null, noi_dung: {tieu_de, muon_lam, da_xay_ra, man}, luc}`; không đổi khuôn kit, không đụng `scripts/dieu-phoi/`.
- Không đụng `apps/app/components/lo-trinh/*`, `packages/validation/src/lo-trinh-du-lieu.ts`, `apps/app/lib/lo-trinh/doc-trang.ts` (vòng LT1b). Chỉ đọc `apps/app/lib/lo-trinh/doc-du-lieu.js` và `doc-tep.ts`.
- Router `tinHieu` dùng `PhamViChungMiddleware`; nhật ký không ghi nội dung tín hiệu; không `AgentTask`.
- Client component chỉ nhập `@crm/ui/components/*`, tRPC client, React, `@crm/validation/tin-hieu` (không `@crm/db`, không `@crm/auth`).
- Tệp git không mang tên, thư, id người dùng hay phòng ban.
- Migration đặt tên `YYYYMMDDHHMMSS_tin_hieu` bằng giờ UTC thật lúc tạo; trước khi gộp soát `origin/onehub` có migration nào sắp sau không.
- Việc nặng (cả bộ test, dựng app, đẩy) đi qua `~/.claude/projects/-Users-manhphan-dev-crm/khoa-may/chay-nang.sh`.

## Review Focus

1. Hai lượt `gui` đồng thời của một người ở ngưỡng trần − 1 → chỉ một qua (khoá theo người) — Task 3 ca `gth-tran` dòng 4.
2. `keoVe` và `xoa` chạy đua trên cùng tín hiệu → không bao giờ vừa xoá vừa trả về — Task 3 ca `gth-xoa` ô 4.
3. Người không có phòng ban chính, hoặc phòng ban đã lưu trữ → `phongBanId` null, đếm vào dòng «chưa có phòng ban» — Task 3 `gth-gui` (b, c) + Task 4 `tong-ket`.
4. `LO-TRINH.html` có danh sách tín hiệu nhưng một bản ghi sai khuôn → trang báo «chưa đọc được», không coi là «không có» — Task 6 + Task 7 `khoan-dung`.
5. Đường dẫn có `?` hoặc `#`, hay dài hơn 200 ký tự → `man` chỉ còn đường dẫn, cắt 200 — Task 2 `lamSachMan` + Task 3 `gth-gui` (d).

---

### Task 1: Bảng `TinHieu` và bộ đếm trong `@crm/db` (T3)

**independent:** true (với Task 2) · **phục vụ:** E2, E3, E5, E6

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (thêm model + quan hệ ngược ở `User`, `Department`)
- Create: `packages/db/prisma/migrations/<UTC>_tin_hieu/migration.sql` (sinh bằng `--create-only`)
- Create: `packages/db/src/tin-hieu.ts`; Modify: `packages/db/package.json` (export `./tin-hieu`)

**Interfaces — Produces:** `demTinHieuTrongNgay(db: Ghi, nguoiId: string, now: Date): Promise<number>`; Prisma model `tinHieu` với các trường dưới.

- [ ] **Step 1: Thêm model**

```prisma
model TinHieu {
  id         String      @id @default(cuid())
  so         Int         @unique @default(autoincrement())
  nguoiGuiId String?
  nguoiGui   User?       @relation("TinHieuNguoiGui", fields: [nguoiGuiId], references: [id], onDelete: SetNull)
  phongBanId String?
  phongBan   Department? @relation(fields: [phongBanId], references: [id], onDelete: SetNull)
  muonLam    String
  daXayRa    String
  tieuDe     String
  man        String
  guiLuc     DateTime    @default(now())
  keoVeLuc   DateTime?

  @@index([nguoiGuiId, guiLuc])
  @@map("tin_hieu")
}
```
Thêm `tinHieu TinHieu[] @relation("TinHieuNguoiGui")` vào `User`, `tinHieu TinHieu[]` vào `Department`.

- [ ] **Step 2: Sinh migration** — `cd packages/db && bunx prisma migrate dev --create-only --name tin_hieu` (kho cục bộ). Đổi tên thư mục nếu giờ không phải UTC thật lúc chạy. Đọc `migration.sql`: chỉ `CREATE TABLE "tin_hieu"`, sequence của `so`, hai khoá ngoài `SET NULL`, chỉ mục.

- [ ] **Step 3: Bộ đếm**

```ts
import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";
import { dauNgayVN } from "./onboarding-nhac";

type Ghi = Db | Prisma.TransactionClient;

export function demTinHieuTrongNgay(db: Ghi, nguoiId: string, now: Date): Promise<number> {
	return db.tinHieu.count({ where: { nguoiGuiId: nguoiId, guiLuc: { gte: dauNgayVN(now) } } });
}
```

- [ ] **Step 4: Verify** — `cd packages/db && bun run db:generate && bunx prisma validate && bun run db:migrate` (kho cục bộ) rồi `bun run check-types --filter=@crm/db`. Kỳ vọng: xanh.
- [ ] **Step 5: Commit** `feat(tin-hieu): bảng TinHieu và bộ đếm theo ngày`

### Task 2: Khuôn tín hiệu (`@crm/validation/tin-hieu`) hoàn chỉnh

**independent:** true (với Task 1) · **phục vụ:** E2, E6, E7, E8, E10, E11

**Files:** Modify `packages/validation/src/tin-hieu.ts`; Create `packages/validation/test/tin-hieu.spec.ts`

**Interfaces — Produces (đã có):** `TIN_HIEU`, `guiTinHieuInput`, `xoaTinHieuInput`, `idTep(so)`, `lamSachMan(duong)`, `dungNoiDung({muonLam,daXayRa})→{tieuDe,muonLam,daXayRa}`, `tepTinHieu`, `tepTuBanGhi(row)`, `vietTep(tep)`, `keoVeOutput`, `duongTinHieu`, `parseDuongTinHieu(raw)`. **Thêm:** `bocPhanHoiKeoVe(ds: KeoVeOutput["tep"]): KeoVeOutput` và `docPhanHoiKeoVe(body: unknown): KeoVeOutput["tep"]` — đọc đúng vỏ REST `{ result: { data: { tep: [...] } } }` của nestjs-trpc, sai vỏ thì ném `Error("lệnh kéo về lệch vỏ phản hồi REST: …")`.

- [ ] **Step 1: Ca kiểm (đỏ trước)** — `packages/validation/test/tin-hieu.spec.ts`:
  - `dungNoiDung`: dòng đầu trống bỏ qua; 300 ký tự một dòng → 120 + «…»; giữ nguyên văn hai ô (đã trim).
  - `lamSachMan`: `/okr/kr?x=1#a` → `/okr/kr`; 250 ký tự → 200; chuỗi rỗng → `/`.
  - `vietTep(tepTuBanGhi(row))` → `JSON.parse` → `tepTinHieu.parse` không lỗi; thứ tự khoá `phien, loai, hang, noi_dung, luc`; xuống dòng cuối.
  - `docPhanHoiKeoVe(bocPhanHoiKeoVe-đã-bọc-như-trpc)` bằng danh sách gốc; mảng trần → ném với thông điệp ghim «lệnh kéo về lệch vỏ phản hồi REST».
  - `parseDuongTinHieu`: `undefined` → `khong-co`; mảng hợp lệ → `co`; một bản ghi thiếu `cau` → `hong` (chiều đỏ ghim «ban ghi hong bi coi la khong co» nếu trả mảng rỗng).
- [ ] **Step 2:** `cd packages/validation && bun test test/tin-hieu.spec.ts` → FAIL (hàm bọc/đọc chưa có).
- [ ] **Step 3:** Thêm hai hàm:

```ts
const vo = z.object({ result: z.object({ data: keoVeOutput }) });

export function bocPhanHoiKeoVe(tep: KeoVeOutput["tep"]): KeoVeOutput {
	return { tep };
}

export function docPhanHoiKeoVe(body: unknown): KeoVeOutput["tep"] {
	const kq = vo.safeParse(body);
	if (!kq.success)
		throw new Error(`lệnh kéo về lệch vỏ phản hồi REST: ${kq.error.issues[0]?.message ?? "sai vỏ"}`);
	return kq.data.result.data.tep;
}
```
- [ ] **Step 4:** chạy lại → PASS; `bun run lint:slop` xanh.
- [ ] **Step 5: Commit** `feat(tin-hieu): khuôn tệp, vỏ phản hồi kéo về, bộ đọc đường đi`

### Task 3: Router `tinHieu` (gửi · của tôi · xoá · kéo về)

**independent:** false (cần Task 1, 2) · **phục vụ:** E2, E3, E4, E5, E6, E16

**Files:**
- Create: `apps/api/src/tin-hieu/tin-hieu.contracts.ts`, `tin-hieu.service.ts`, `tin-hieu.router.ts`, `tin-hieu.module.ts`
- Modify: `apps/api/src/app.module.ts` (thêm `TinHieuModule`), `apps/api/src/generated/server.ts` (`bun run trpc:generate`), `apps/api/test/vai-chi-okr.spec.ts` (`ALIAS_CHO_PHEP` + `"tinHieu"`, `TU_PHUC_VU` + `"tinHieu.gui"`, `"tinHieu.xoa"`)
- Create: `apps/api/test/tin-hieu.spec.ts` (dùng `dungSan`, `goi`, `phien`, `ok` của `tai-lieu-san.ts`)

**Interfaces — Produces:** tRPC `tinHieu.gui({muonLam,daXayRa,man}) → {id, ma}`, `tinHieu.cuaToi() → {rows: {id, so, ma, tieuDe, muonLam, man, guiLuc, daKeoVe}[]}`, `tinHieu.xoa({id}) → {ok: true}`, `tinHieu.keoVe() → KeoVeOutput` (REST `POST /rest/tin-hieu/keo-ve`).

- [ ] **Step 1: Ca kiểm (đỏ trước)** — năm `describe` đúng tên `gth-gui`, `gth-tran`, `gth-cua-toi`, `gth-xoa`, `gth-keo-ve`, mỗi ca đúng ma trận viết sẵn của E2–E6 (evals.yaml). Ca `gth-keo-ve` tạo khoá API bằng `apiKeys.create` cho từng vai rồi gọi REST với đầu `x-api-key`; dòng 4 đưa nguyên thân HTTP vào `docPhanHoiKeoVe`.
- [ ] **Step 2:** `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/tin-hieu.spec.ts"` → FAIL (router chưa có).
- [ ] **Step 3: Service** (rút gọn hình — viết đủ):

```ts
async gui(nguoi: NguoiGoi, input: GuiTinHieuInput) {
	const now = new Date();
	const nd = dungNoiDung(input);
	return this.db.$transaction(async (tx) => {
		await lockIdempotencyKey(tx, `tin-hieu:${nguoi.id}`);
		if ((await demTinHieuTrongNgay(tx, nguoi.id, now)) >= TIN_HIEU.tranMoiNgay)
			throw new HttpException(TIN_HIEU.loi.quaTran.replace("{tran}", String(TIN_HIEU.tranMoiNgay)), HttpStatus.TOO_MANY_REQUESTS);
		const cho = await tx.orgPlacement.findUnique({ where: { userId: nguoi.id }, select: { primaryDepartment: { select: { id: true, archivedAt: true } } } });
		const phongBanId = cho?.primaryDepartment && !cho.primaryDepartment.archivedAt ? cho.primaryDepartment.id : null;
		const hang = await tx.tinHieu.create({ data: { nguoiGuiId: nguoi.id, phongBanId, ...nd, man: lamSachMan(input.man), guiLuc: now }, select: { id: true, so: true } });
		this.logger.log({ message: "tin-hieu.gui", userId: nguoi.id, so: hang.so });
		return { id: hang.id, ma: idTep(hang.so) };
	});
}

async xoa(nguoi: NguoiGoi, id: string) {
	await this.db.$transaction(async (tx) => {
		await tx.$queryRaw`SELECT id FROM tin_hieu WHERE id = ${id} FOR UPDATE`;
		const hang = await tx.tinHieu.findFirst({ where: { id, nguoiGuiId: nguoi.id }, select: { keoVeLuc: true, so: true } });
		if (!hang) throw new NotFoundException(TIN_HIEU.loi.khongCo);
		if (hang.keoVeLuc) throw new ConflictException(TIN_HIEU.loi.daLayVe);
		await tx.tinHieu.delete({ where: { id } });
		this.logger.log({ message: "tin-hieu.xoa", userId: nguoi.id, so: hang.so });
	});
	return { ok: true as const };
}

async keoVe(nguoi: NguoiGoi) {
	if (!laQuanTri(nguoi)) throw new ForbiddenException();
	return this.db.$transaction(async (tx) => {
		await tx.$executeRaw`LOCK TABLE tin_hieu IN SHARE ROW EXCLUSIVE MODE`;
		await tx.tinHieu.updateMany({ where: { keoVeLuc: null }, data: { keoVeLuc: new Date() } });
		const hang = await tx.tinHieu.findMany({ orderBy: { so: "asc" }, include: { phongBan: { select: { name: true } } } });
		return bocPhanHoiKeoVe(hang.map((h) => ({ id: idTep(h.so), tep: tepTuBanGhi(h), phongBan: h.phongBan?.name ?? null })));
	});
}
```
`cuaToi` lọc `where: { nguoiGuiId: nguoi.id }`, `orderBy: { guiLuc: "desc" }`. `laQuanTri` lấy từ `apps/api/src/tai-lieu/quyen.ts` (owner/admin). Router theo khuôn `hoi-kho.router.ts` với `@UseMiddlewares(PhamViChungMiddleware)`, `restMeta("POST", "/tin-hieu/keo-ve", ["Signals"])` cho `keoVe`.
- [ ] **Step 4:** `cd apps/api && bun run trpc:generate`; sửa `vai-chi-okr.spec.ts`; chạy lại ca → PASS; chạy `gth_vai` → PASS.
- [ ] **Step 5: Commit** `feat(tin-hieu): router gửi, của tôi, xoá trước khi lấy về, kéo về cho quản trị`

### Task 4: Lệnh kéo về

**independent:** false (cần Task 2 và tệp mẫu của Task 5) · **phục vụ:** E7, E8, E12

**Files:** Create `scripts/tin-hieu/keo-ve.ts`, `scripts/tin-hieu/test/keo-ve.test.ts`; Modify `package.json` (gốc: `"tin-hieu:keo-ve": "bun scripts/tin-hieu/keo-ve.ts"`), `.env.example` (khối `CRM_API_URL`, `CRM_API_KEY` — chỉ máy chủ kho, API không đọc).

**Interfaces — Consumes:** `docPhanHoiKeoVe`, `vietTep`, `TIN_HIEU`, `parseDuongTinHieu`; `docDuLieu` (`apps/app/lib/lo-trinh/doc-du-lieu.js`, nhập tương đối từ vị trí tệp). **Produces:** `chayKeoVe({root, url, key, now, fetch}) → {ma: 0|1|2, moi, daCo, tongKet: string[]}` (xuất để ca kiểm gọi thẳng; CLI gọi nó với `process.env`).

- [ ] **Step 1: Ca kiểm (đỏ trước)** theo E8 (bốn dòng) + E12 (`tong-ket`, ba dòng), kho tạm `mkdtemp`, máy chủ giả `Bun.serve` trả `{result:{data: bocPhanHoiKeoVe(...)}}`; ca 7 ngày dùng `LO-TRINH.html` mẫu ở `apps/app/test/fixtures/tin-hieu/` (Task 6 sinh).
- [ ] **Step 2:** `bun test scripts/tin-hieu/test/keo-ve.test.ts` → FAIL.
- [ ] **Step 3: Cài** — thiếu biến → `{ma: 2}` + stderr gọi tên biến, không chạm đĩa. Mỗi tệp: đã có cùng byte → `daCo++`; khác byte → `{ma: 1}` + gọi tên tệp, dừng trước khi ghi tệp nào khác; chưa có → ghi. Tổng kết: «mới N · đã có M»; «trong 30 ngày: n tín hiệu từ k phòng ban» + mỗi phòng ban một dòng + «chưa có phòng ban: x»; «gửi quá 7 ngày: n · chưa có chỗ sau gom: m» (mẫu số = mọi tín hiệu máy chủ trả có `luc` quá 7 ngày; «có chỗ» = mã có trong `tin_hieu` của `LO-TRINH.html` ở `root` với `cho !== "chua-gom"`). Gốc kho suy từ `import.meta.dir`, không viết cứng.
- [ ] **Step 4:** chạy lại → PASS; `bun run lint:slop` xanh.
- [ ] **Step 5: Commit** `feat(tin-hieu): lệnh kéo tín hiệu về git kèm dòng tổng kết ngưỡng`

### Task 5: Bộ đọc trạng thái cho trang (app)

**independent:** false (cần Task 2) · **phục vụ:** E4b, E10, E11

**Files:** Create `apps/app/lib/tin-hieu/trang-thai.ts`, `apps/app/test/tin-hieu-trang-thai.spec.ts`, `apps/app/test/fixtures/tin-hieu/LO-TRINH.mau.html` + `_acceptance/gui-tin-hieu-trong-crm/rang/sinh-mau.mjs` (bộ sinh: kho tạm có tệp tín hiệu mẫu dựng bằng `tepTuBanGhi` và một bản gom phủ đủ bảy chỗ, vẽ bằng `product-map.mjs` của kit main lấy qua `git archive origin/main`, ghi tệp mẫu kèm dòng sha kit; vắng kho kit → thoát 2 có tên, ca kiểm dùng bản đã commit), `apps/app/lib/messages/tin-hieu.ts` (đã có nhãn).

**Interfaces — Produces:**

```ts
export type BanVe = "co" | "khong-co-danh-sach" | "vang" | "hong";
export type TrangThaiTinHieu = { nhan: string; cau: string; nghia: NghiaTrangThai };
export function docTrangThaiTinHieu(
	html: string | null,
	cuaToi: { ma: string; daKeoVe: boolean }[],
	m: TinHieuMessages,
): { banVe: BanVe; trangThai: Record<string, TrangThaiTinHieu> };
```
Chỉ trả khoá thuộc `cuaToi`. `nghia`: `da-phu` → `xong`; `hang-*` → theo `nhom_trang_thai` của hàng cùng mã trong `hang` của khối (`da-giao` → `xong`, `dang-lam` → `dangChay`, còn lại → `nhap`); mọi chỗ khác và hai trạng thái CRM → `nhap`.

- [ ] **Step 0:** viết và chạy `sinh-mau.mjs`; commit tệp mẫu (không viết tay khối).
- [ ] **Step 1:** ca kiểm ma trận toàn phần E10 (7 giá trị `cho` × nhóm trạng thái + 2 trạng thái CRM), E4b (chỉ của tôi), E11 dòng 2 (bản ghi hỏng ≠ không có), năm ca khoan dung dẫn từ tệp mẫu (bỏ tệp, bỏ khối, hỏng JSON, bỏ khoá, một bản ghi thiếu `cau`).
- [ ] **Step 2:** `cd apps/app && bun test ./test/tin-hieu-trang-thai.spec.ts` → FAIL. **Step 3:** cài. **Step 4:** PASS. **Step 5: Commit** `feat(tin-hieu): bộ đọc trạng thái sau gom cho trang của người gửi`

### Task 6: Cửa tín hiệu của kho + răng vòng kit

**independent:** false (cần Task 4, 5) · **phục vụ:** E7, E9, E14

**Files:** Modify `_acceptance/config.yaml` (khối cột 0 `tin_hieu:` với `  nguon: [tin-hieu/crm]`, `  gom: tin-hieu/gom`); Create `tin-hieu/crm/.gitkeep`, `tin-hieu/gom/.gitkeep`, `_acceptance/gui-tin-hieu-trong-crm/rang/vong-kit.mjs`, `_acceptance/gui-tin-hieu-trong-crm/rang/may-chu-gia.ts`.

- [ ] **Step 1:** `vong-kit.mjs` — suy gốc kho từ vị trí tệp; lấy kit main bằng `git -C $KIT archive origin/main scripts skills dieu-phoi lib` vào thư mục tạm (`KIT` mặc định `~/dev/acceptance-gate-kit`, vắng → thoát 2 «khong co bo doc tin hieu cua kit»), in sha; phần `doc` (E7): máy chủ giả + `chayKeoVe` → `docTinHieu` của kit 0 lỗi, quét chuỗi danh tính; phần `ve` (E9): `git worktree add` tạm tại HEAD, chép tệp kéo về, chạy `product-map.mjs` của kit main → khối mang `tin_hieu`, `docTrangThaiTinHieu` ra đúng `cau`; đọc khối `tin_hieu` config bằng `scripts/tin-hieu-khoa.cjs` của kit; ghi `_acceptance/gui-tin-hieu-trong-crm/evidence/cau-kit-mau.json` (đủ mọi `cho`, cho E14), dùng lại bộ vẽ của `sinh-mau.mjs`. Dọn worktree tạm ở `finally`.
- [ ] **Step 2:** chạy → xanh; phá thử hai chiều đỏ (bỏ khối config trong bản sao; bản sao bộ đọc bỏ `cau`) → đỏ đúng thông điệp ghim. Commit phá-thử trước khi `git checkout` (luật kho).
- [ ] **Step 3: Commit** `feat(tin-hieu): khai cửa tín hiệu của kho và răng đi trọn vòng kit`

### Task 7: Giao diện — nút, hộp, menu, trang

**independent:** false (cần Task 3, 5) · **phục vụ:** E1, E2b, E3b, E5b, E10b, E11, E15

**Files:**
- Create: `apps/app/components/tin-hieu/nut-gui-tin-hieu.tsx` (vỏ có `useMutation(trpc.tinHieu.gui…)`, `usePathname` bỏ đoạn `/<slug>`, lỗi `< 500` dùng thông điệp máy chủ, còn lại `m.hop.chuaGui`; thành công → `giaiDoan "da-gui"` + invalidate qua `useCrmCache().tinHieu()`)
- Create: `apps/app/app/(app)/[slug]/tin-hieu/page.tsx` (máy chủ: `requireSession`, `getServerQueryClient().fetchQuery(getServerTrpc().tinHieu.cuaToi.queryOptions())`, `docTepLoTrinh()` → `docTrangThaiTinHieu` → `HydrateClient` + `DanhSachTinHieuTrang`), `danh-sach-tin-hieu-trang.tsx` (khách: `useQuery cuaToi`, `useMutation xoa`, `VungTaiLoi`, khung xương)
- Modify: `apps/app/components/app-header.tsx` (`<NutGuiTinHieu />` trước `UserMenu`; chỗ giữ cùng cỡ trong `AppHeaderFallback`; mục menu «Tín hiệu đã gửi» cạnh «Nhắc buổi sáng»), `apps/app/lib/trpc/cache.ts` (`tinHieu: () => run([trpc.tinHieu.cuaToi.queryKey()], [])`)
- Create: `apps/app/test/tin-hieu.dom.tsx` (ba `describe`: `hop` gồm ca `menu`, `trang`, `khoan-dung`)

- [ ] **Step 1:** ca DOM đỏ trước theo E1, E2b, E3b, E5b, E10b, E11 (mock `@/lib/trpc/client`, `next/navigation` như `lo-trinh.dom.tsx`); dòng «kiểu nút» đọc `data-variant`/`data-size` từ DOM của cụm và của nút ⋮ trong `danh-sach-khuon.tsx`.
- [ ] **Step 2:** chạy `gth_hop`, `gth_trang`, `gth_khoan_dung` → FAIL. **Step 3:** cài (giữ `HopGuiTinHieu`, `DanhSachTinHieu`, `NutGuiDauTrang`, `NutGuiTao` đã có từ bản mẫu). **Step 4:** PASS; `gth_thiet_ke` (design-gate tĩnh) không P0; `cd apps/app && bunx tsc --noEmit -p .` không lỗi mới. **Step 5: Commit** `feat(tin-hieu): nút Gửi tín hiệu, hộp hai câu, trang Tín hiệu đã gửi`

### Task 8: Phép đo màn thật, bản dựng, tài liệu

**independent:** false (cần Task 7) · **phục vụ:** E13, E17

**Files:** Create `_acceptance/gui-tin-hieu-trong-crm/rang/do-man.mjs` (theo `trang-lo-trinh-trong-crm/rang/do-man.mjs`: `tien-de.mjs` kho đo riêng, người vai chỉ OKR, 10 ô E13, ảnh vào `BANG_CHUNG`), `_acceptance/gui-tin-hieu-trong-crm/rang/ban-dung.mjs` (theo `trang-lo-trinh-trong-crm/rang/ban-dung.mjs`, hai dòng E17); Modify `docs/setup.md` (mục «Kéo tín hiệu về»: tạo khoá API owner, `CRM_API_URL`, `CRM_API_KEY`, `bun run tin-hieu:keo-ve`, commit cùng bản gom), `docs/api.md` (dòng máy gọi REST `POST /rest/tin-hieu/keo-ve`).

- [ ] **Step 1:** viết hai răng; **Step 2:** chạy `gth_do_man` và `gth_ban_dung` qua khoá máy → mã 0; phá thử chiều đỏ của E17. **Step 3: Commit** `test(tin-hieu): đo màn thật hai khổ và bản dựng mang LO-TRINH.html`
- [ ] **Step 4:** đặt hợp đồng `status: implemented`, vào S4.

---

## Thứ tự

Task 1 ∥ Task 2 → Task 3 → Task 5 → Task 4 → Task 6 → Task 7 → Task 8. Chạy tuần tự trong vòng chính (`executing-plans`): chỉ Task 1 và 2 độc lập, nhỏ, không đáng tách worktree.
