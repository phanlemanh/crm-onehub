# Lý do căn chỉnh từ Soạn OKR — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** «Đưa vào OKR» chép lý do Kara viết sang căn chỉnh thật. Căn chỉnh cũ từ Soạn được điền lại. Khuôn trả của mục tiêu nói rõ mức tin của từng căn chỉnh.

**Architecture:** Ba cột thêm vào `OkrAlignment` trong một `migration` chỉ thêm, kèm một câu `UPDATE` điền lại. `addAlignmentTrong` nhận lý do qua `opts`, mặc định trống. `soan-dua-vao.ts` truyền `viSao` đã cắt. Khuôn `noiGopOutput` thêm bốn trường; mức tin suy bằng hàm thuần.

**Tech Stack:** Prisma (Postgres), NestJS + tRPC/REST, Zod, `bun test`.

**Spec:** `docs/superpowers/specs/2026-10-08-ly-do-can-chinh-tu-soan-design.md` · hợp đồng `_acceptance/ly-do-can-chinh-tu-soan/contract.md` · evals `_acceptance/ly-do-can-chinh-tu-soan/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (`AGENTS.md`).
- Lý do KHÔNG bắt buộc: không đường nào từ chối lưu căn chỉnh vì thiếu lý do.
- `migration` chỉ thêm: không `DROP`, không đổi kiểu, không `NOT NULL` thiếu `DEFAULT`.
- Mốc thư mục `migration` lấy theo giờ thật lúc viết, kiểm `origin/onehub` ngay trước khi đẩy.
- Hằng số tinh chỉnh được đặt trong `apps/api/src/okr/okr-config.ts`, không đặt rải.
- Chỉ chạm các tệp trong mục Ranh giới ở `## Notes` của hợp đồng.
- Đọc `docs/api.md` trước khi sửa `apps/api`.
- Mã viết sau khi K2b (P1) đã gộp vào `onehub`. Gộp `onehub` vào nhánh rồi chạy `bun install` trước Task 2.

## Review Focus

1. Câu `viSao` có ký tự Unicode khoảng trắng (NBSP, xuống dòng) ở hai đầu: `btrim` của Postgres chỉ cắt dấu cách, còn `String.trim()` cắt mọi khoảng trắng. Câu điền lại và đường đưa vào phải ra cùng một chuỗi. Task 4 thêm một ca `viSao` có `\n` ở cuối, và câu `UPDATE` dùng `btrim(x, E' \t\n\r\u00a0')`.
2. «Đưa vào OKR» chạy hai lần trên cùng một cuộc soạn (đã chặn bằng `duaVaoHaiLan`): lý do không được chép hai lần hay đè. Mã cũ đã chặn; Task 2 chạy lại bài cũ `soan-okr-dua-vao.spec.ts`.
3. Hoàn tác một lượt đưa vào (`soan-okr-hoan-tac.spec.ts`) xoá căn chỉnh. Lý do đi theo hàng bị xoá, không mồ côi. Task 2 chạy lại bài hoàn tác.
4. Một dòng đề xuất cũ có `taoRaId` trỏ tới một căn chỉnh đã bị gỡ rồi gắn lại (id mới): câu điền lại không được gắn lý do sang căn chỉnh khác. Nối bằng `taoRaId = a.id` là đúng id, nên căn chỉnh mới giữ trống. Task 4 thêm ca E.
5. Xuất kỳ (`xuatKy`) và cây căn chỉnh đọc `mucTieuOutput`: bốn trường mới không được làm hỏng khuôn xuất. Task 3 chạy lại `okr-xuat.spec`, hay bài đang phủ `xuatKy`, sau khi đổi khuôn.

## Câu hỏi cho Cổng 1.5 (sửa hợp đồng)

AC-6 gieo «mục tiêu giới hạn có căn chỉnh», nhưng kho đã chặn trạng thái đó bằng hai chốt có bài kiểm:
- Gắn căn chỉnh vào hoặc từ mục tiêu giới hạn bị từ chối: `gioiHanKhongCanChinh`, đo ở `okr-hien-thi.spec.ts:413`, `soan-okr-dua-vao.spec.ts:1559`.
- Chuyển mục tiêu đang có căn chỉnh sang giới hạn bị từ chối: `conCanChinh`, đo ở `okr-hien-thi.spec.ts:840`, `:878`.

Mọi căn chỉnh vì vậy nằm trên mục tiêu công khai, và lý do không mở thêm ai xem được. Đề xuất thay AC-6 và E7 bằng hai ý:
- Một mục tiêu đang có căn chỉnh mang lý do vẫn không chuyển được sang giới hạn (đo lại `conCanChinh` khi căn chỉnh có `lyDo`).
- Người ngoài workspace gọi `mine` nhận 403 `NOT_A_MEMBER`, không có chữ lý do.

Bỏ cặp phá (h).

---

### Task 1: Cột và `migration`

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (model `OkrAlignment`)
- Create: `packages/db/prisma/migrations/<mốc>_ly_do_can_chinh/migration.sql`
- Create: `_acceptance/ly-do-can-chinh-tu-soan/rang/migration.mjs`
- Create: `_acceptance/ly-do-can-chinh-tu-soan/rang/do-nguong.sql`

**Interfaces:**
- Produces: các cột `OkrAlignment.lyDo: string | null`, `canCu: string | null`, `lyDoTuKara: boolean`. Tệp `migration.sql` có đúng một câu `UPDATE`. Tệp `do-nguong.sql` trả một hàng `{ thieu: number }`.

- [ ] **Step 1:** Thêm vào model, ngay sau `targetKeyResult`:

```prisma
  lyDo              String?
  canCu             String?
  lyDoTuKara        Boolean       @default(false)
```

- [ ] **Step 2:** Tạo thư mục `migration` với mốc giờ thật (`date -u +%Y%m%d%H%M%S`), nội dung:

```sql
ALTER TABLE "okrAlignment" ADD COLUMN "lyDo" TEXT;
ALTER TABLE "okrAlignment" ADD COLUMN "canCu" TEXT;
ALTER TABLE "okrAlignment" ADD COLUMN "lyDoTuKara" BOOLEAN NOT NULL DEFAULT false;
UPDATE "okrAlignment" AS a SET "lyDo" = btrim(d."noiDung"->>'viSao', E' \t\n\r\u00a0'), "lyDoTuKara" = true FROM "okrDeXuat" AS d WHERE d."taoRaId" = a."id" AND d."loai" = 'can-chinh-moi' AND a."lyDo" IS NULL AND btrim(COALESCE(d."noiDung"->>'viSao', ''), E' \t\n\r\u00a0') <> '';
```

- [ ] **Step 3:** Viết `rang/do-nguong.sql`:

```sql
SELECT count(*)::int AS "thieu" FROM "okrAlignment" AS a JOIN "okrDeXuat" AS d ON d."taoRaId" = a."id" AND d."loai" = 'can-chinh-moi' WHERE a."lyDo" IS NULL AND btrim(COALESCE(d."noiDung"->>'viSao', ''), E' \t\n\r\u00a0') <> '';
```

- [ ] **Step 4:** Viết `rang/migration.mjs`:
  - Hàm `kiemMigration(chu)` tách câu theo `;`. Mỗi câu phải khớp `^ALTER TABLE "okrAlignment" ADD COLUMN "\w+" \w+( NOT NULL DEFAULT \S+)?$` hoặc bắt đầu bằng `UPDATE "okrAlignment"`.
  - Câu `DROP` → `{ ma: 1, chu: "cau cam: DROP" }`. `ADD COLUMN … NOT NULL` không `DEFAULT` → `"cau cam: NOT NULL khong mac dinh"`. Hai câu `UPDATE` → `"hai cau UPDATE"`.
  - Chạy ba đối chứng trước, rồi tìm đúng một thư mục `*_ly_do_can_chinh`, rồi in `MIGRATION: <n> cau, chi them`. Đường dẫn suy từ `import.meta.dirname`.
- [ ] **Step 5:** Chạy `bun run db:migrate` (kho dev) và `bun run db:test --reset`, rồi `bun run db:generate`. Kỳ vọng: không lỗi.
- [ ] **Step 6:** Chạy `bun _acceptance/ly-do-can-chinh-tu-soan/rang/migration.mjs`. Kỳ vọng: `MIGRATION: 4 cau, chi them`, mã thoát 0.
- [ ] **Step 7:** Commit `feat(ly-do-can-chinh-tu-soan): cot ly do tren OkrAlignment, dien lai tu de xuat`.

Evals phục vụ: E8 (AC-7), E6/E11 dùng ở Task 4. Độc lập: có.

### Task 2: Đưa vào mang lý do, gắn tay giữ nguyên

**Files:**
- Modify: `apps/api/src/okr/okr.service.ts` (`addAlignmentTrong`, kiểu `GhiTrong`)
- Modify: `apps/api/src/okr/soan-dua-vao.ts:252-266`
- Create: `apps/api/test/okr-ly-do-can-chinh.spec.ts` (khối `dua-vao`, `visao-rong`, `gan-tay`)

**Interfaces:**
- Consumes: các cột của Task 1.
- Produces: `addAlignmentTrong(tx, userId, input, opts?: GhiTrong & { daQuaCong?: NguonDaQuaCong; lyDo?: LyDoCanChinh })`, trong đó `type LyDoCanChinh = { lyDo: string | null; canCu: string | null; lyDoTuKara: boolean }`. Hàm thuần `lyDoTuSoan(viSao: string): LyDoCanChinh` trong `apps/api/src/okr/can-chinh.ts`.

- [ ] **Step 1:** Viết bài đỏ trước.
  - `dua-vao`: gieo bằng `gieoCuoc` và `gieoDongNhap` của `./soan-okr-san`, dòng `can-chinh-moi` mang `viSao` «  Tăng tỷ lệ chốt thêm khoảng 9 tỷ  ». Chạy `goiSoan` «đưa vào» qua `DUONG` = trpc và rest. Đọc hàng qua `db.okrAlignment.findUniqueOrThrow({ where: { id: taoRaId } })`.
    - `lyDo` khác `"Tăng tỷ lệ chốt thêm khoảng 9 tỷ"` → ném `dua vao lam roi ly do`.
    - `lyDoTuKara !== true` → ném `mat dau Kara`.
  - `visao-rong`: hai ca `''` và `'   '`, đặt `noiDung.viSao` bằng `db.okrDeXuat.update`. Khẳng định `noiDungSoan` parse được `noiDung` đó. Sau đưa vào, `lyDo !== null` → ném `ly do rong thanh chuoi rong`.
  - `gan-tay`: gọi `okr.addAlignment` qua tRPC với đầu vào cũ. Kỳ vọng 200 và cả ba cột ở mặc định; lỗi → ném `gan tay bi chan vi thieu ly do`.
- [ ] **Step 2:** Chạy `cd apps/api && bun test test/okr-ly-do-can-chinh.spec.ts -t "dua-vao|visao-rong|gan-tay"`. Kỳ vọng: `dua-vao` đỏ `dua vao lam roi ly do`.
- [ ] **Step 3:** Cài đặt.

```ts
export function lyDoTuSoan(viSao: string): LyDoCanChinh {
	const lyDo = viSao.trim();
	return lyDo ? { lyDo, canCu: null, lyDoTuKara: true } : { lyDo: null, canCu: null, lyDoTuKara: false };
}
```

  - Trong `addAlignmentTrong`: `tx.okrAlignment.create({ data: { ...noi, ...(opts?.lyDo ?? LY_DO_TRONG) } })`, với `LY_DO_TRONG = { lyDo: null, canCu: null, lyDoTuKara: false }` đặt trong `can-chinh.ts`.
  - Trong `soan-dua-vao.ts`, thêm `lyDo: lyDoTuSoan(c.dong.dong.viSao)` vào `opts`.
- [ ] **Step 4:** Chạy lại lệnh Step 2, rồi `bun test test/soan-okr-dua-vao.spec.ts test/soan-okr-hoan-tac.spec.ts test/okr-can-chinh.spec.ts`. Kỳ vọng: tất cả xanh.
- [ ] **Step 5:** Commit `feat(ly-do-can-chinh-tu-soan): dua vao OKR mang ly do Kara`.

Evals phục vụ: E1, E2, E3, E4. Độc lập: sau Task 1.

### Task 3: Khuôn trả có lý do và mức tin

**Files:**
- Modify: `apps/api/src/okr/can-chinh.ts` (thêm `MUC_TIN_CAN_CHINH`, `mucTinCanChinh`)
- Modify: `apps/api/src/okr/okr.contracts.ts:285` (`noiGopOutput`)
- Modify: `apps/api/src/okr/okr.service.ts:1743` (ánh xạ `alignments`)
- Modify: `apps/app/test/khung-okr-truoc-r1.dom.tsx`, `tro-ly-okr-vet.dom.tsx`, `muc-tieu-va-kr.dom.tsx` (dữ liệu giả: thêm `lyDo: null, canCu: null, lyDoTuKara: false, mucTin: "chua-co-ly-do"`)
- Test: khối `muc-tin` trong `apps/api/test/okr-ly-do-can-chinh.spec.ts`

**Interfaces:**
- Produces: `MUC_TIN_CAN_CHINH = ["chua-co-ly-do", "dat-cuoc", "co-so-lieu"] as const`, `mucTinCanChinh(lyDo: string | null, canCu: string | null): (typeof MUC_TIN_CAN_CHINH)[number]`. `noiGopOutput` thêm `lyDo: z.string().nullable()`, `canCu: z.string().nullable()`, `lyDoTuKara: z.boolean()`, `mucTin: z.enum(MUC_TIN_CAN_CHINH)`.

- [ ] **Step 1:** Viết bài đỏ trước: khối `muc-tin` với ma trận ba dòng như E5. Phản hồi `mine` parse bằng `mucTieuOutput`. Thiếu khoá → ném `thieu khoa <tên>`. Sai mức → ném `<dòng>: muc tin <thực> khac <mong>`.
- [ ] **Step 2:** Chạy `-t muc-tin`. Kỳ vọng: đỏ `thieu khoa lyDo`.
- [ ] **Step 3:** Cài đặt.

```ts
export function mucTinCanChinh(lyDo: string | null, canCu: string | null) {
	if (!lyDo) return "chua-co-ly-do" as const;
	return canCu ? ("co-so-lieu" as const) : ("dat-cuoc" as const);
}
```

  - Ánh xạ thêm `lyDo: g.lyDo, canCu: g.canCu, lyDoTuKara: g.lyDoTuKara, mucTin: mucTinCanChinh(g.lyDo, g.canCu)`.
  - Sửa ba tệp dom.
  - Chạy `bun run --cwd apps/api trpc:generate`.
- [ ] **Step 4:** Chạy `-t muc-tin`, rồi `bun run check-types`, rồi bài phủ `xuatKy` và `cayCanChinh`. Kỳ vọng: xanh.
- [ ] **Step 5:** Commit `feat(ly-do-can-chinh-tu-soan): khuon tra can chinh co ly do va muc tin`.

Evals phục vụ: E5. Độc lập: sau Task 1.

### Task 4: Điền lại và câu đo ngưỡng

**Files:**
- Test: khối `dien-lai` và `do-nguong` trong `apps/api/test/okr-ly-do-can-chinh.spec.ts`

**Interfaces:**
- Consumes: `migration.sql` và `rang/do-nguong.sql` của Task 1.

- [ ] **Step 1:** Viết khối `dien-lai`.
  - Đọc `migration.sql` từ đĩa và rút câu bắt đầu bằng `UPDATE`.
  - Gieo năm ca:
    - A: dòng nháp `viSao` «Lý do cũ A».
    - B: không có dòng nháp.
    - C: đã có `lyDo` «Người viết».
    - D: `viSao` «   ».
    - E: `viSao` «Lý do E\n», `taoRaId` trỏ một id đã xoá.
  - Mọi ca đặt `lyDo` về null bằng Prisma (trừ C), rồi chạy câu `UPDATE` bằng `db.$executeRawUnsafe`.
  - Khẳng định đúng như AC-5. Hàng gắn lại của E giữ null. Sai → ném `<ca>: dien lai sai`.
- [ ] **Step 2:** Viết khối `do-nguong`.
  - Đọc `rang/do-nguong.sql` và chạy bằng `db.$queryRawUnsafe` sau khi gieo dữ liệu của `dua-vao`, `visao-rong`, `dien-lai`. Kỳ vọng `thieu === 0`, sai → ném `do nguong dem <n>, mong 0`.
  - Đối chứng: một căn chỉnh có dòng nháp «Lý do» mà `lyDo` null → kỳ vọng 1, sai → ném `do nguong khong bat duoc ca thieu`.
- [ ] **Step 3:** Chạy `-t "dien-lai|do-nguong"`. Kỳ vọng: xanh, vì `migration` đã có từ Task 1.
- [ ] **Step 4:** Phá thử tại chỗ sau khi commit:
  - Bỏ `a."lyDo" IS NULL` → kỳ vọng `C: dien lai sai`.
  - Bỏ điều kiện `btrim <> ''` → kỳ vọng `D: dien lai sai`.
  - Mỗi lần phá xong thì `git checkout --` để trả lại.
- [ ] **Step 5:** Commit `test(ly-do-can-chinh-tu-soan): dien lai va cau do nguong`.

Evals phục vụ: E6, E11. Độc lập: sau Task 1–2.

### Task 5: Quyền xem (theo quyết định Cổng 1.5)

**Files:**
- Test: khối `quyen-xem` trong `apps/api/test/okr-ly-do-can-chinh.spec.ts`

- [ ] **Step 1 (nếu anh duyệt bản thay):**
  - Gắn căn chỉnh có `lyDo` «bi-mat-l1» vào một mục tiêu công khai. Đổi mục tiêu đó sang giới hạn qua đường đổi hiển thị thật. Kỳ vọng 400 `conCanChinh(1)`, `lyDo` còn nguyên.
  - Người ngoài workspace gọi `okr.mine` → 403 `NOT_A_MEMBER`, thân trả về không chứa «bi-mat-l1».
- [ ] **Step 1 (nếu anh giữ AC-6 như cũ):** dựng ma trận 8×2 cộng phần quét như E7. Bước gieo sẽ ném `gioiHanKhongCanChinh`, nên eval phải khai giới hạn — máy khuyên bản thay.
- [ ] **Step 2:** Chạy `-t quyen-xem`. Commit.

Evals phục vụ: E7 (sau khi sửa). Độc lập: sau Task 2.

### Task 6: Thước của hồ sơ và kiểm toàn cây

**Files:**
- Create: `_acceptance/ly-do-can-chinh-tu-soan/rang/pham-vi.mjs` (đọc mục Ranh giới của `contract.md`; `<mốc>` khớp `\d{14}`; `apps/api/test/okr-can-chinh.spec.ts` không được đổi)
- Create: `_acceptance/ly-do-can-chinh-tu-soan/rang/dot-bien.mjs` (`dungBanSao` từ `../../ca-chap-chon-cach-ly/rang/ban-sao.mjs`; các cặp (a)–(i) của evals, ghim theo dòng `error:` của bun)

- [ ] **Step 1:** Viết `pham-vi.mjs`, gồm đối chứng `diff rong` (mã 2) và đối chứng `objective-sheet.tsx` (ngoài ranh giới). Chạy. Kỳ vọng `PHAM VI: <n> tep, 0 ngoai ranh gioi`.
- [ ] **Step 2:** Viết `dot-bien.mjs`. Chạy. Kỳ vọng `DOT BIEN: <n>/<n> cap dat`.
- [ ] **Step 3:** Chạy `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`, `bun run test`. Kỳ vọng: cả năm xanh.
- [ ] **Step 4:** Đặt `status: implemented` cho hợp đồng. Commit. Xin khoá `s4`.

Evals phục vụ: E9, E10, toàn bộ suite. Độc lập: cuối cùng.
