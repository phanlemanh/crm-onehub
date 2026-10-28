# Cảm xúc và trả lời trên từng lần cập nhật — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thả, gỡ và xem cảm xúc trên từng lần cập nhật KR ở Cập nhật gần đây, Họp tuần và ngăn KR, và trả lời dưới mọi lần cập nhật — cả hai bám một khoá `checkInId`.

**Architecture:** Một migration thêm bảng `okrCamXuc` và cột `okrComment.checkInId` (lấp cho bình luận cũ). Máy chủ thêm `okr.thaCamXuc` (đảo) và một hàm gom tóm tắt `tomTatCamXucCua` trong `packages/db` mà ba thủ tục đọc (`capNhatGanDay`, `hopTuan`, `dienBien`) cùng gọi. Màn dùng một thành phần `ThanhCamXuc` mới trong `packages/ui`.

**Tech Stack:** Prisma + Postgres, NestJS + nestjs-trpc, Zod (`packages/validation`), Next.js App Router + TanStack Query, bun test.

**Spec:** `docs/superpowers/specs/2026-10-27-cam-xuc-tren-cap-nhat-design.md` · hợp đồng `_acceptance/cam-xuc-tren-cap-nhat/contract.md` (duyệt 27/10, Hỏi-1..4 theo khuyến nghị) · evals `_acceptance/cam-xuc-tren-cap-nhat/evals.yaml`.

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Bốn loại cảm xúc, đúng thứ tự: `dong-y` 👍 «Đồng ý» · `chuc-mung` 🎉 «Chúc mừng» · `co-len` 💪 «Cố lên» · `da-xem` 👀 «Đã xem».
- `OKR_CAM_XUC.tenToiDa = 3`, đặt trong `apps/api/src/okr/okr-xem.config.ts` cạnh `OKR_XEM` (một object `as const`, theo `dispatch-config.ts`).
- Mọi đọc `okrCamXuc` / `okrCheckIn` / `okrComment` mang `dieuKienXemMucTieu(nc)` lồng qua objective (docs/api.md «Who sees an objective»).
- Ghi dựa trên mục tiêu trả `NotFoundException(OKR.thongDiep.khongThayMucTieu)` khi không xem được; chu kỳ ẩn bị chặn bằng `OkrService.assertKyChuaAn`; KHÔNG khoá theo pha (Hỏi-4).
- Mỗi lần thả/gỡ ghi một dòng vết `tha-cam-xuc` / `go-cam-xuc` qua `OkrService.vet`, `after = { checkInId, loai }`.
- Gỡ không hỏi lại, không Hoàn tác (Hỏi-3).
- Số truy vấn mỗi thủ tục đọc cố định, không tăng theo số lần cập nhật hay số cảm xúc.
- Một `.env` ở gốc; chữ màn ở `apps/app/lib/messages/okr*.ts` (vi + en), chỉ thêm dòng (luật 7 của đợt).
- `apps/app/components/crm/record-sheet/kr-sheet.tsx` chỉ sửa sau khi yêu cầu `cham-tep` V3-58 được trả lời.
- Migration: tên `YYYYMMDDHHMMSS_cam_xuc_tren_cap_nhat`, mốc lấy giờ thật lúc tạo; kiểm `origin/onehub` không có mốc trùng ngay trước khi đẩy.

## Review Focus

- Bình luận cũ viết đúng giây của một lần cập nhật → gắn vào chính lần ấy (`<=`), không lần trước — ca 12:00 của E9.
- Phiên cập nhật có `submittedAt` khác `createdAt` của dòng `okrCheckIn` → thời điểm lấy `submittedAt` — ca riêng của E9.
- Hai lần chạm cùng loại gần như cùng lúc → không lỗi ra màn, tối đa một hàng — E2 lặp 20 lần.
- Người thả rời workspace (không còn `member`) → tên vẫn hiện trong tóm tắt như hôm nay bình luận vẫn hiện tác giả cũ — Task 2 thêm một ca vào E1: tóm tắt vẫn có người ấy, `so` không đổi.
- Lần cập nhật thuộc KR của mục tiêu bị bỏ (đã bỏ) nhưng chu kỳ còn chạy → thả được như bình luận (không khoá theo pha) — Task 2 thêm một ca vào E6.

---

### Task 1: Bảng, cột, lấp khoá và hàm gom tóm tắt

`independent: true` · phục vụ E9, nền cho E1–E3, E6

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (model `OkrCamXuc` mới; `OkrComment.checkInId String?` + quan hệ `checkIn OkrCheckIn? onDelete: SetNull` + `@@index([checkInId])`; quan hệ ngược trên `OkrCheckIn` và `User` nếu kho đặt quan hệ người)
- Create: `packages/db/prisma/migrations/<mốc>_cam_xuc_tren_cap_nhat/migration.sql`
- Create: `packages/validation/src/okr-cam-xuc.ts`
- Create: `packages/db/src/okr-cam-xuc.ts`
- Modify: `packages/validation/package.json` và `packages/db/package.json` (xuất subpath nếu kho khai từng subpath)
- Test: `apps/api/test/okr-cam-xuc-migration.spec.ts`

**Interfaces:**
- Produces:
  - `LOAI_CAM_XUC = ["dong-y","chuc-mung","co-len","da-xem"] as const`, `type LoaiCamXuc`
  - `thaCamXucInput = z.object({ checkInId: z.string().trim().min(1).max(120), loai: z.enum(LOAI_CAM_XUC) })`
  - `tomTatCamXuc = z.array(z.object({ loai: z.enum(LOAI_CAM_XUC), so: z.number().int().min(1), cuaToi: z.boolean(), nguoi: z.array(z.object({ id: z.string(), name: z.string() })) }))`, `type TomTatCamXuc`
  - `tomTatCamXucCua(tx: DbOrTx, checkInIds: string[], nguoiXemId: string, nc: NguCanhXemOkr, tenToiDa: number): Promise<Map<string, TomTatCamXuc>>` — một truy vấn `okrCamXuc.findMany` với `where: { checkInId: { in }, checkIn: { keyResult: { objective: dieuKienXemMucTieu(nc) } } }`, `orderBy: [{ createdAt: "asc" }, { id: "asc" }]`, gom theo `LOAI_CAM_XUC`; `so` đếm đủ, `nguoi` cắt ở `tenToiDa`; id không có cảm xúc → `[]`.
  - Bảng `okrCamXuc` có `@@unique([checkInId, userId, loai])`.

- [ ] **Step 1: Viết bài kiểm `cx-migration` (đỏ)** — đúng `expected` của E9: tìm đúng một thư mục `*cam_xuc*`, khẳng định `CREATE TABLE "okrCamXuc"` và `ADD COLUMN "checkInId"`; rút câu `UPDATE "okrComment"` bằng regex từ chính tệp; gieo qua `OkrCapNhatService.guiCapNhat` và `OkrTraoDoiService.addComment` với đồng hồ ghim (lần t1 10:00, t2 12:00; một phiên có `submittedAt` khác `createdAt`); đặt `checkInId = NULL`, chạy câu lấp, so ma trận sáu dòng viết trước; ghi `traLoi` theo luật VK12 (`traLoiTu` của `apps/api/src/okr/cap-nhat-gan-day.ts`) trước khi đặt NULL và so với tập theo `checkInId` sau.
- [ ] **Step 2: Chạy** `bun run test -- "cd apps/api && bun test test/okr-cam-xuc-migration.spec.ts -t cx-migration"` → FAIL «không đúng một migration».
- [ ] **Step 3: Sửa schema, tạo migration** bằng `cd packages/db && bunx prisma migrate dev --create-only --name cam_xuc_tren_cap_nhat`, rồi thêm vào cuối `migration.sql` câu lấp:

```sql
UPDATE "okrComment" c SET "checkInId" = (
  SELECT ci."id" FROM "okrCheckIn" ci
  JOIN "okrCheckInSession" s ON s."id" = ci."sessionId"
  WHERE ci."keyResultId" = c."keyResultId"
    AND COALESCE(s."submittedAt", ci."createdAt") <= c."createdAt"
  ORDER BY COALESCE(s."submittedAt", ci."createdAt") DESC, ci."createdAt" DESC, ci."id" DESC
  LIMIT 1
) WHERE c."keyResultId" IS NOT NULL AND c."checkInId" IS NULL;
```

  (Tên bảng/cột theo `@@map` thật của schema; sửa theo `\d` nếu khác.)
- [ ] **Step 4: Viết `okr-cam-xuc.ts` của validation và của db** theo Interfaces; `bun run db:generate`.
- [ ] **Step 5: Chạy lại** lệnh Step 2 → PASS; phá thử (đổi `<=` thành `<` trong bản sao) → đỏ ở dòng 12:00 với thông điệp ghim; hoàn lại.
- [ ] **Step 6: Commit** `feat(cam-xuc-tren-cap-nhat): bảng okrCamXuc, okrComment.checkInId và lấp khoá`.

### Task 2: Thủ tục `okr.thaCamXuc`

`independent: false` (cần Task 1) · phục vụ E1, E2, E6 (phần thả)

**Files:**
- Create: `apps/api/src/okr/okr-cam-xuc.service.ts`
- Modify: `apps/api/src/okr/okr.router.ts` (mutation `thaCamXuc`, `restMeta("POST", "/okr/check-ins/{checkInId}/reactions", TAG)`), `apps/api/src/okr/okr.module.ts` (provider), `apps/api/src/okr/okr-xem.config.ts` (`OKR_CAM_XUC`), `packages/db/src/okr-vet.ts` (hai hành động `tha-cam-xuc`, `go-cam-xuc`), danh mục `HANH_DONG_VET` nếu tách riêng
- Modify tests: `apps/api/test/vai-chi-okr.spec.ts` (mục `"okr.thaCamXuc"` cạnh `"okr.capNhatGanDay"`), `apps/api/test/okr-sua-an-chu-ky.spec.ts` (dòng `thaCamXuc` trong bảng ghi cạnh `addComment`), `_acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs` (thêm `"okrCamXuc"` vào `BANG`)
- Test: `apps/api/test/okr-cam-xuc.spec.ts` (describe `cx-tha`, `cx-dao`, `cx-quyen`)

**Interfaces:**
- Consumes: `tomTatCamXucCua`, `thaCamXucInput`, `tomTatCamXuc` (Task 1).
- Produces: `OkrCamXucService.thaCamXuc(userId: string, input: ThaCamXucInput, now = new Date()): Promise<TomTatCamXuc>`; router `okr.thaCamXuc` input `thaCamXucInput`, output `tomTatCamXuc`.

- [ ] **Step 1: Viết `cx-tha`, `cx-dao`, phần thả của `cx-quyen`** đúng `expected` của E1, E2, E6, cộng hai ca của Review Focus (người thả rời workspace; mục tiêu đã bỏ trong chu kỳ đang chạy → thả được). Gieo qua dịch vụ thật như `okr-cap-nhat-gan-day.spec.ts` (`taoKy`, `taoMucTieu`, `guiLan`).
- [ ] **Step 2: Chạy** `bun run test -- "cd apps/api && bun test test/okr-cam-xuc.spec.ts"` → FAIL (thủ tục chưa có).
- [ ] **Step 3: Viết dịch vụ.** Đọc lần cập nhật kèm `keyResult.objectiveId`; `assertXemMucTieu(userId, objectiveId)` (không có lần → `khongThayMucTieu`); trong `$transaction`: `assertKyChuaAn(tx, mt.cycleId)`; `deleteMany({ checkInId, userId, loai })` — xoá được 1 thì vết `go-cam-xuc`, 0 thì `create` + vết `tha-cam-xuc`; `P2002` từ `create` → bỏ qua, không vết; trả `tomTatCamXucCua(tx, [checkInId], userId, nc, OKR_CAM_XUC.tenToiDa).get(checkInId)`.
- [ ] **Step 4: Nối router, module, vết, ba danh sách kiểm** (vai «chỉ OKR», bảng ghi chu kỳ ẩn, `BANG` của soi-ma).
- [ ] **Step 5: Chạy** lệnh `cx_tha`, `cx_dao`, `cx_quyen` trong `_acceptance/config.yaml` → PASS; phá thử từng chiều đỏ của E1, E2, E6 trong bản sao → đỏ với thông điệp ghim; hoàn lại.
- [ ] **Step 6: Commit** `feat(cam-xuc-tren-cap-nhat): okr.thaCamXuc — thả, gỡ, quyền xem, chu kỳ ẩn`.

### Task 3: Ba đường đọc mang tóm tắt; trả lời theo `checkInId`

`independent: false` (cần Task 1, Task 2 cho ca kiểm) · phục vụ E3, E7, E6 (phần đọc và addComment)

**Files:**
- Modify: `apps/api/src/okr/okr-cap-nhat-gan-day.service.ts`, `okr-cap-nhat-gan-day.contracts.ts`, `cap-nhat-gan-day.ts` (bỏ `traLoiTu` khỏi đường đọc, giữ hàm cho bài kiểm migration), `okr-xem.service.ts` (`hopTuan`, `dienBien`), `okr-xem.contracts.ts`, `dien-bien.ts`, `okr-trao-doi.service.ts` (`addComment` nhận `checkInId`), `packages/validation/src/okr-trao-doi.ts` (`checkInId: z.string().trim().min(1).max(120).optional()`), `packages/validation` messages `OKR.thongDiep.traoDoi.capNhatKhacKr`
- Modify test: `apps/api/test/okr-cap-nhat-gan-day.spec.ts` (`cng-tra-loi` đổi theo D5; thêm `cx-tra-loi`)
- Test: `apps/api/test/okr-cam-xuc.spec.ts` (thêm `cx-ba-cho`, phần đọc và addComment của `cx-quyen`)

**Interfaces:**
- Consumes: `tomTatCamXucCua`, `tomTatCamXuc` (Task 1); `thaCamXuc` (Task 2) để gieo.
- Produces: `dongCapNhat.camXuc: tomTatCamXuc`; `dongHop.checkInId: z.string().nullable()`, `dongHop.camXuc: tomTatCamXuc`; mỗi phần tử `dienBienOutput.diem` thêm `checkInId: z.string().nullable()`, `camXuc: tomTatCamXuc`; `addCommentInput.checkInId?: string`.

- [ ] **Step 1: Viết `cx-ba-cho`, `cx-tra-loi`, phần đọc + addComment của `cx-quyen`, sửa `cng-tra-loi`** theo `expected` của E3, E6, E7.
- [ ] **Step 2: Chạy** `bun run test -- "cd apps/api && bun test test/okr-cam-xuc.spec.ts test/okr-cap-nhat-gan-day.spec.ts"` → FAIL.
- [ ] **Step 3: `capNhatGanDay`** — gom `checkInId` của trang, một `tomTatCamXucCua`; trả lời đọc `okrComment.findMany({ where: { checkInId: { in }, objective: dieuKienXemMucTieu(nc) }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] })` cho mọi dòng; `mentionNguoiCapNhat` tính cho mọi dòng.
- [ ] **Step 4: `hopTuan`, `dienBien`** — lấy id của lần đã chọn (mới nhất / `cuoiTrongTuan`) rồi một `tomTatCamXucCua` cho cả tập.
- [ ] **Step 5: `addComment`** — có `checkInId`: `tx.okrCheckIn.findFirst({ where: { id, keyResult: { objectiveId: input.objectiveId, objective: dieuKienXemMucTieu(nc) } }, select: { keyResultId: true } })`; không thấy → `khongThayMucTieu`; `keyResultId` có mà khác → `BadRequest(T.traoDoi.capNhatKhacKr)`; vắng → lấy của lần; ghi `checkInId`.
- [ ] **Step 6: Chạy** lệnh `cx_ba_cho`, `cx_tra_loi`, `cx_quyen` → PASS; đếm truy vấn ghim số; phá thử các chiều đỏ của E3, E7 → đỏ; hoàn lại.
- [ ] **Step 7: Commit** `feat(cam-xuc-tren-cap-nhat): ba đường đọc mang tóm tắt cảm xúc, trả lời theo lần cập nhật`.

### Task 4: `ThanhCamXuc` trong `packages/ui`

`independent: true` · phục vụ E5

**Files:**
- Create: `packages/ui/src/components/thanh-cam-xuc.tsx`
- Modify: `packages/ui/src/lib/messages.ts` (chữ «Thả cảm xúc», «bạn đã thả», «và {n} người khác», tên bốn loại; vi + en, chỉ thêm), `packages/ui/package.json` exports nếu khai từng tệp
- Test: `packages/ui/test/thanh-cam-xuc.dom.tsx` (describe `cx-thanh`)

**Interfaces:**
- Produces:

```ts
export type MucCamXuc = { loai: string; emoji: string; ten: string; so: number; cuaToi: boolean; nguoi: string[] };
export type ThanhCamXucProps = {
	bo: { loai: string; emoji: string; ten: string }[];
	muc: MucCamXuc[];
	tenToiDa: number;
	dangGui?: boolean;
	onDao: (loai: string) => void;
};
export function ThanhCamXuc(props: ThanhCamXucProps): JSX.Element;
```

  `data-thanh-cam-xuc`, chip `data-cam-xuc={loai}` (`Toggle variant="outline" size="sm"`, `aria-pressed`, `aria-label`), nút `data-mo-cam-xuc` mở `Popover` có bốn nút và `dl` tên đủ từng loại; tooltip cắt ở `tenToiDa` + «và n người khác». Không gọi tRPC; không biết `LOAI_CAM_XUC` (nhận `bo` từ app).

- [ ] **Step 1: Viết `cx-thanh`** — ma trận năm dòng và bàn phím của E5, ca «bảng mở không gọi onDao».
- [ ] **Step 2: Chạy** lệnh `cx_thanh` → FAIL.
- [ ] **Step 3: Dựng thành phần** theo bản mẫu `apps/app/app/proto/_modules/cam-xuc-tren-cap-nhat/index.tsx` (cùng thành phần nền, chuyển chữ sang messages).
- [ ] **Step 4: Chạy** → PASS; phá thử hai chiều đỏ của E5; hoàn lại.
- [ ] **Step 5: Commit** `feat(cam-xuc-tren-cap-nhat): ThanhCamXuc trong packages/ui`.

### Task 5: Ba màn dùng `ThanhCamXuc`; trả lời trên mọi dòng

`independent: false` (cần Task 3, Task 4; `kr-sheet.tsx` cần trả lời V3-58) · phục vụ E8, E12, nền cho E4, E10

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/cam-xuc/dung-cam-xuc.ts` (hook `useThaCamXuc` lạc quan: chụp, đổi, lùi + toast khi lỗi, `cache.okr()` khi xong)
- Modify: `apps/app/app/(app)/[slug]/okr/cap-nhat-gan-day/dong-tin.tsx` (hàng cảm xúc dưới ghi chú; `TraLoi` cho mọi dòng, gửi `checkInId`; giữ nhãn «có lần mới hơn»), `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx` (dòng có `checkInId` mới hiện hàng), `apps/app/components/crm/record-sheet/kr-sheet.tsx` (`NoiDungLichSu` mỗi mục tuần), `apps/app/lib/trpc/cache.ts` (`okr` làm mới thêm `capNhatGanDay`, `hopTuan`, `dienBien` nếu chưa có), `apps/app/lib/messages/okr-cap-nhat-gan-day.ts` (toast lỗi, chỉ thêm), `apps/app/test/okr-lam-moi.spec.ts` nếu nó đếm danh sách
- Test: `apps/app/test/cap-nhat-gan-day.dom.tsx` (thêm `cx-tra-loi-man`, `cx-lac-quan`)

**Interfaces:**
- Consumes: `okr.thaCamXuc`, các khoá `camXuc`/`checkInId` (Task 3); `ThanhCamXuc` (Task 4).
- Produces: `useThaCamXuc(checkInId: string, dau: TomTatCamXuc): { muc: MucCamXuc[]; dangGui: boolean; dao: (loai: LoaiCamXuc) => void }`.

- [ ] **Step 1: Viết `cx-tra-loi-man`, `cx-lac-quan`** theo E8, E12.
- [ ] **Step 2: Chạy** lệnh `cx_tra_loi_man`, `cx_lac_quan` → FAIL.
- [ ] **Step 3: Viết hook và nối ba màn.**
- [ ] **Step 4: Chạy** → PASS; phá thử chiều đỏ E8, E12; hoàn lại. Chạy thêm bài sẵn có của ba màn (`cap-nhat-gan-day.dom.tsx` đủ tệp, bài của ngăn KR và Họp tuần) để chắc không đỏ.
- [ ] **Step 5: Commit** `feat(cam-xuc-tren-cap-nhat): cảm xúc ở ba màn, trả lời trên mọi lần cập nhật`.

### Task 6: Bộ OKR mẫu và lệnh đếm tỷ lệ phản hồi

`independent: false` (cần Task 2, Task 3) · phục vụ E11

**Files:**
- Create: `apps/api/scripts/okr-mau/nap-cam-xuc.ts`, `_acceptance/cam-xuc-tren-cap-nhat/rang/ty-le-phan-hoi.sql`
- Modify: `apps/api/scripts/okr-mau/cong-ty.json` (khối `camXuc`: `{ kr, tuan, nguoi, loai }[]`), `okr-mau/khuon.ts` (schema khối mới), `okr-mau/nap.ts` (gọi `napCamXucMau` sau `napTraoDoiMau`), `okr-mau/nap-trao-doi.ts` (trả lời mẫu gửi `checkInId` của lần mới nhất KR)
- Test: `apps/api/test/okr-mau.spec.ts` (describe `cam-xuc-tren-cap-nhat`)

**Interfaces:**
- Consumes: `OkrCamXucService.thaCamXuc` (Task 2), `addComment` có `checkInId` (Task 3).
- Produces: `napCamXucMau(app, ctx): Promise<void>`; SQL nhận `:cycle_id`, `:tu`, `:den` (psql `\set`), in một dòng `ty_le`.

- [ ] **Step 1: Viết ca `cam-xuc-tren-cap-nhat`** theo E11 (a)–(d), nạp lại không nhân đôi, SQL so tỷ lệ tính từ `cong-ty.json` bằng hàm riêng của bài kiểm.
- [ ] **Step 2: Chạy** lệnh `cx_bo_mau` → FAIL.
- [ ] **Step 3: Viết dữ liệu, bộ nạp (đọc hàng có sẵn rồi chỉ thả loại chưa có), SQL** (loại phản hồi của chính người cập nhật: `authorUserId`).
- [ ] **Step 4: Chạy** → PASS; phá thử hai chiều đỏ; hoàn lại.
- [ ] **Step 5: Commit** `feat(cam-xuc-tren-cap-nhat): bộ OKR mẫu có cảm xúc, lệnh đếm tỷ lệ phản hồi`.

### Task 7: Bàn đo màn và tài liệu

`independent: false` (cần Task 5, Task 6) · phục vụ E4, E10

**Files:**
- Create: `_acceptance/cam-xuc-tren-cap-nhat/rang/do-man.mjs` (theo `_acceptance/cap-nhat-gan-day/rang/do-man.mjs`, dùng `taoNguCanh` của `vo-khu-muc-tieu/rang/do-man-ngu-canh.mjs`; chép ảnh sang `evidence/` khi `CX_CHEP_ANH=1`; hai chế độ phá `CX_PHA`)
- Modify: `docs/api.md` mục OKR (một gạch đầu dòng `okr.thaCamXuc` + `okrCamXuc` vào danh sách bảng con), `CONTEXT.md` (mục «Cảm xúc», chỉ thêm), `_acceptance/vo-khu-muc-tieu/…` không đụng.

- [ ] **Step 1: Viết bàn đo** theo E4 (nạp đệm trước, đếm tải trang) và E10 (tám ảnh, `DUNG AC-9 375: tran ngang 0`, `DUNG AC-5 375 thay ten`).
- [ ] **Step 2: Chạy** `bun run do:man --chay "bun _acceptance/cam-xuc-tren-cap-nhat/rang/do-man.mjs"` → mã 0; `CX_PHA=khong-lam-moi-hop` → mã 1 «SAI AC-4 hop-tuan»; `CX_PHA=tai-lai` → mã 1.
- [ ] **Step 3: Sửa tài liệu.**
- [ ] **Step 4: Chạy đủ năm lệnh của kho** (`bun run test`, `check-types`, `lint`, `lint:slop`, `build`).
- [ ] **Step 5: Commit** `test(cam-xuc-tren-cap-nhat): bàn đo ba màn, tài liệu api và từ điển`.
