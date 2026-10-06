# OKR và tổ chức vá (R1d) — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sửa bảy lỗi trên đường dựng cây và đặt OKR (#11 #13 #16 #18 #30, R1m-7, AC-10 điện thoại của R1a) và giữ bản sửa #17, theo 12 AC đã duyệt ở Cổng Phạm vi.

**Architecture:** Mỗi lỗi một task, sửa đúng tệp gốc của lỗi. Hình dữ liệu mới (lý do chặn lưu trữ, kết quả khôi phục) là module mới trong `packages/validation`, parse ở biên, màn dựng câu từ `lib/messages`. Quyền tạo lẻ của quản trị đi qua `nhapDuoc` có sẵn; luật sửa `suaDuocDonVi` không đổi.

**Tech Stack:** NestJS + nestjs-trpc, Prisma, Zod, Next.js App Router, React 19, nuqs, bun test + happy-dom, puppeteer-core (phép đo màn).

**Spec:** `docs/superpowers/specs/2026-10-04-okr-to-chuc-va-design.md` · hợp đồng `_acceptance/okr-to-chuc-va/contract.md` · bài đo `_acceptance/okr-to-chuc-va/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- `packages/validation/src`: chỉ thêm module mới. `packages/ui/src/hooks`: chỉ thêm hook mới, không đổi `useIsMobile`. `lib/messages`: chỉ thêm khoá; khoá mới có hàm phải ghim ở `apps/app/test/messages-guard.spec.ts` (GHIM).
- Không đụng `schema.prisma` hay `migrations/`.
- Chạy Bun 1.3.12: `PATH="$(brew --prefix bun@1.3.12)/bin:$PATH"`. Test DOM của app: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/<tệp>`. Test API cần CSDL: `bun run test -- "cd apps/api && bun test test/<tệp>"` từ gốc kho.
- Mọi phép đo mới có cặp hai chiều trên cùng fixture (MEASURE-BIRTH-CLAUSE): xanh trên vật lành, đỏ với thông điệp ghim trên bản sao bị phá. Chiều đỏ chạy trong bản sao ở `.acceptance-runs/okr-to-chuc-va/`, không phá tại chỗ.
- Không `pkill`/`killall`; máy thiếu RAM: chỉ một phiên đo `mot-luot.sh`, không máy chủ dev tay.

## Review Focus

1. Quản trị vừa tạo mục tiêu lẻ rồi mở khung của nó — nút «Thêm KR» phải hiện (T5 có ca).
2. Tên đơn vị có dấu tiếng Việt trong câu tiếng Anh — phần tên không dịch, câu dịch không còn chữ Việt (T6, T7 có ca «Khuôn Bán hàng», «Khối Kinh doanh»).
3. Trùng tên khác hoa thường «kinh DOANH» — vẫn chặn (T7 có ca).
4. Khung mở lần đầu trên máy tính (khổ đã biết ngay) vẫn cuộn tới vùng Kara đúng một lần (T8 ca đối chứng).
5. Mục tiêu bị khuất bởi bộ lọc rồi bị xoá hẳn — id thu gọn còn trong URL không làm vỡ màn (T1: `moCua` của id không có trong `ds` không được gọi; ghi chú, không thêm phép đo).

---

### Task 1: #11 — thu gọn giữ id của mục tiêu đang khuất (E1)

`independent: true`

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/bang-muc-tieu.tsx` (hàm `doiMo`)
- Create: `apps/app/test/okr-to-chuc-va.dom.tsx` (describe `thu-gon`)

**Interfaces:** Produces tệp test chung `okr-to-chuc-va.dom.tsx` mà T2, T5, T6, T7, T8 thêm describe vào.

- [ ] Viết test `thu-gon`: dựng `BangMucTieu` trong `NuqsTestingAdapter` (ghi `onUrlUpdate`), mục tiêu giả parse bằng `mucTieuOutput` của `apps/api/src/okr/okr.contracts.ts`. Ma trận 2 cách khuất: (lọc) `ds=[A,B]`, URL `thuMucTieu=A`; rerender `ds=[B]`; bấm nút thu của B; URL chứa A và B; rerender `ds=[A,B]`, cả hai `aria-expanded=false`; bấm mở B → URL còn A. (đổi đơn vị) như trên với `ds=[C]` rồi về `[A,B]`. In `so ca: 2`.
- [ ] Chạy, thấy đỏ (bản hiện tại lọc theo `ds`).
- [ ] Sửa `doiMo`:
```tsx
const daThuDs = [...daThu];
const sau = daThu.has(id) ? daThuDs.filter((x) => x !== id) : [...daThuDs, id];
void setThu(sau.length > 0 ? sau : null);
```
- [ ] Chạy xanh. Chiều đỏ: bản sao `bang-muc-tieu.tsx` trả lại `ds.map(...).filter(...)` → test đỏ với `mat id khuat: loc`.
- [ ] Chạy `muc-tieu-va-kr.dom.tsx -t thu-mo` (bài cũ) vẫn xanh. Commit.

### Task 2: #13 — nút số KR trên điện thoại mang `data-so-kr` (E2)

`independent: true`

**Files:** Modify `apps/app/app/(app)/[slug]/okr/bang-kr.tsx` (bản điện thoại: bỏ `moc={false}` ở `<SoCuaKr ... />` trong `TienDoGon`). Test: describe `so-kr` trong `okr-to-chuc-va.dom.tsx`.

- [ ] Test: dựng `BangKr` với một KR `source` máy (`xem=duoc`) và một KR tay; đếm `button[data-so-kr=<id>]` trong `span.md\:hidden` = 1, trong ô `hidden md:table-cell` = 1, KR tay = 0; bấm nút bản điện thoại → URL `record` trỏ `so-kr:<id>`. Đỏ trước khi sửa.
- [ ] Sửa: `tren={<SoCuaKr kr={kr} xem={xem} />}`. Xanh. Chiều đỏ: bản sao đặt lại `moc={false}` → `dien thoai thieu moc: so-kr`.
- [ ] Chạy `so-okr-tu-chay` các bài DOM liên quan `bang-kr` (grep `data-so-kr` trong `apps/app/test`) vẫn xanh. Commit.

### Task 3: #16 — tạo từ mẫu ghi vết `tao-kr` cho từng KR (E4)

`independent: true`

**Files:** Modify `apps/api/src/okr/okr-mau.service.ts` (`taoTuMau`, vòng tạo KR). Create `apps/api/test/okr-to-chuc-va-mau.spec.ts`.

- [ ] Test (theo khuôn `apps/api/test/okr-mau.spec.ts` để dựng chu kỳ, mẫu, người): `taoTuMau` với mẫu 3 KR giao B, A, C (A là người tạo); đếm `okrTrail` `action='tao-kr'` mỗi KR = 1; so tập khoá `after` với dòng `tao-kr` do `OkrService.createKeyResult` ghi cho một KR tay; đọc lời nhắc bằng hàm đọc của `packages/db/src/okr-nhac.ts` (hàm xuất ra danh sách `okr-duoc-giao` cho một người) → B có KR1, C có KR3, A không có KR2. In `so kr: 3`. Đỏ trước khi sửa.
- [ ] Sửa: giữ `const kr = await tx.okrKeyResult.create(...)` rồi
```ts
await this.okr.vet(tx, userId, "tao-kr", { objectiveId: objective.id, keyResultId: taoRa.id }, null, {
	title: taoRa.title, kind: taoRa.kind, startValue: kr.startValue, targetValue: kr.targetValue,
});
```
- [ ] Xanh; chiều đỏ trên bản sao bỏ lời gọi → `thieu vet tao-kr: KR1`. Chạy `okr-mau*.spec.ts` cũ xanh. Commit.

### Task 4: R1m-7 phía API — tạo lẻ theo luật nhập (E9)

`independent: true`

**Files:** `apps/api/src/okr/okr-access.service.ts` (thêm `assertNhapMucTieu(userId, objectiveId, client)`), `apps/api/src/okr/okr.service.ts` (`createObjective` dùng `assertNhapDuoc`; `createKeyResult` khi không `trong` dùng `assertNhapMucTieu`; `objective` thêm `quyen.themKrLe`; `byUnit` ở `okr.service.ts:1877` thêm `canCreate`), `apps/api/src/okr/okr-xem.service.ts:334` + `okr-xem.contracts.ts` (`canCreate`), `apps/api/src/okr/okr.contracts.ts` (`canCreate: z.boolean()` ở hai output byUnit; `quyen.themKrLe: z.boolean()`). Create `apps/api/test/okr-to-chuc-va-quyen.spec.ts`.

**Interfaces:** Produces `byUnit.canCreate: boolean`, `objective.quyen.themKrLe: boolean` cho T5.

```ts
async assertNhapMucTieu(userId: string, objectiveId: string, client: Prisma.TransactionClient | Db = this.db) {
	const { q, mt } = await this.assertXemMucTieu(userId, objectiveId, client);
	if (!this.nhapDuoc(q, userId, mt)) throw new ForbiddenException(OKR.thongDiep.khongSuaDuocDonVi);
	return mt;
}
```
`themKrLe: ghiDuoc && !choDuyet && this.quyenOkr.nhapDuoc(q, userId, objective)`.

- [ ] Test ma trận 3 cấp × 2 vai + ô `createKeyResult` + `updateObjective` vẫn 403 + `byUnit.canCreate`; `so o: 7`. Đỏ trước khi sửa.
- [ ] Sửa, xanh. Chiều đỏ: bản sao `createObjective` quay về `assertSuaDonVi` → `quan tri khong tao duoc: phong-ban`.
- [ ] Grep mọi fixture/test parse `objectiveOutput`/byUnit output (`grep -rln "objectiveOutput\|byUnitOutput" apps/*/test`) và thêm trường mới vào fixture; chạy các tệp đó. Chạy `okr-nhap.spec.ts`, `okr-duyet.spec.ts`, `vai-chi-okr` (grep) xanh. Commit.

### Task 5: R1m-7 phía màn — nút cho quản trị (E10)

`independent: false` (cần T4)

**Files:** `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx` (`NutThemMucTieu suaDuoc={byUnit.data?.canCreate}`, `NganTaoMucTieu suaDuoc={byUnit.data?.canCreate}`), các trang khác dùng `NganTaoMucTieu`/`NutThemMucTieu` (grep) giữ `canEdit` trừ khi có `canCreate`; `apps/app/components/crm/record-sheet/objective-sheet.tsx` (nút `them-kr` hiện khi `suaNoiDung(mt) || mt.quyen.themKrLe`). Test: describe `nut-them` trong `okr-to-chuc-va.dom.tsx`.

- [ ] Test 3 vai (`canCreate/canEdit`: true/false, true/true, false/false) như E10, `so vai: 3`; thêm ca khung Mục tiêu với `quyen.themKrLe=true, canEdit=false` → có `[data-nut=them-kr]`. Đỏ, sửa, xanh, chiều đỏ (`quan tri khong thay nut them`). Commit.

### Task 6: #18 — lý do chặn lưu trữ mang dữ liệu (E5, E6)

`independent: true`

**Files:** Create `packages/validation/src/to-chuc-luu-tru.ts` (+ khai subpath trong `packages/validation/package.json` theo khuôn module khác):
```ts
export const lyDoChanLuuTru = z.discriminatedUnion("loai", [
	z.object({ loai: z.literal("khuon"), khuon: z.array(z.string().min(1)).min(1) }),
	z.object({ loai: z.literal("nguoi"), so: z.number().int().positive() }),
	z.object({ loai: z.literal("okr"), so: z.number().int().positive() }),
]);
export type LyDoChanLuuTru = z.infer<typeof lyDoChanLuuTru>;
export const ketQuaKhoiPhuc = z.union([
	z.object({ id: z.string() }),
	z.object({ chan: z.object({ loai: z.enum(["cha-luu-tru", "trung-ten"]), ten: z.string().min(1) }) }),
]);
export type KetQuaKhoiPhuc = z.infer<typeof ketQuaKhoiPhuc>;
```
Modify `apps/api/src/to-chuc/to-chuc.contracts.ts` (dùng `lyDoChanLuuTru` mới), `to-chuc.service.ts` (`lyDoChanLuuTru` trả dữ liệu; `archiveDepartment` ném câu từ `cauLyDo(lyDo)` dựng bằng `T.*` cũ), `apps/app/lib/messages/okr-tai-co-cau.ts` (`chan.lyDoKhuon(khuon)`, `chan.lyDoNguoi(n)`, vi + en; okr dùng `chan.lyDo["phong-ban"]` có sẵn), `xac-nhan-luu-tru.tsx` (dựng câu theo `loai`, tên khuôn trong `<span translate="no">`), `apps/app/test/messages-guard.spec.ts` (GHIM hai khoá mới), các fixture `to-chuc.dom.tsx` dùng `cau`. Create `apps/api/test/okr-to-chuc-va-to-chuc.spec.ts` (describe `ly-do`); DOM describe `ly-do-luu-tru`.

- [ ] Test API `ly-do` và DOM `ly-do-luu-tru` (2 ngôn ngữ × 3 lý do, gỡ `[translate=no]` rồi kiểm ký tự Việt, đối chứng «á», `so o: 6`). Đỏ, sửa, xanh, hai chiều đỏ ghim. Chạy `to-chuc*.spec.ts`, `to-chuc.dom.tsx`, `messages-guard.spec.ts` xanh. Commit.

### Task 7: #30 — khôi phục chạy kiểm của tạo mới, trả `chan` (E7, E8, E19)

`independent: false` (cùng module validation, cùng tệp spec với T6)

**Files:** `apps/api/src/to-chuc/to-chuc.service.ts` (`restoreDepartment`, `restoreDivision` trả `KetQuaKhoiPhuc`; thêm `tenTrung(loai, ten, boQuaId)` trả tên đơn vị đang hoạt động trùng hoặc null — dùng cùng `where` của `tenKhongTrung`), `to-chuc.router.ts` (output `ketQuaKhoiPhuc` cho hai thủ tục restore), `apps/app/app/(app)/[slug]/settings/organization/da-luu-tru-to-chuc.tsx` (onSuccess: có `chan` → `toast.error(câu theo loai)`, không làm mới; không có → như cũ), `apps/app/lib/messages/to-chuc.ts` (`khoiPhucChaLuuTru(ten)`, `khoiPhucTrungTen(ten)` vi + en; GHIM). Describe API `khoi-phuc`, `trung-ten`; DOM `khoi-phuc-toast`.

```ts
async restoreDepartment(input: { id: string }): Promise<KetQuaKhoiPhuc> {
	const pb = await this.phongBanCo(input.id);
	if (pb.divisionId !== null) {
		const bp = await this.db.division.findUniqueOrThrow({ where: { id: pb.divisionId }, select: { name: true, archivedAt: true } });
		if (bp.archivedAt !== null) return { chan: { loai: "cha-luu-tru", ten: bp.name } };
	}
	const trung = await this.tenTrung("department", pb.name, pb.id);
	if (trung !== null) return { chan: { loai: "trung-ten", ten: trung } };
	return this.db.department.update({ where: { id: input.id }, data: { archivedAt: null }, select: { id: true } });
}
```
(`restoreDivision` tương tự, chỉ kiểm trùng tên.)

- [ ] Tests đỏ → sửa → xanh; ba chiều đỏ ghim (`khoi phuc vao bo phan da luu tru`, `hai don vi cung ten: bo-phan`, `toast khong theo ngon ngu: en cha-luu-tru`). Grep người gọi `restoreDepartment`/`restoreDivision` khác (test cũ dùng `{id}`) và sửa đọc kết quả. Commit.

### Task 8: AC-9 — chip Kara trên điện thoại chờ biết khổ màn (E12)

`independent: true`

**Files:** Create `packages/ui/src/hooks/use-kho-man.ts`:
```ts
export type KhoMan = "chua-biet" | "dien-thoai" | "may-tinh";
export function useKhoMan(): KhoMan { /* như useIsMobile, state khởi đầu "chua-biet" */ }
```
Modify `apps/app/components/detail-sheet.tsx` (`CuonCaKhungContext = createContext<"chua-biet" | boolean>(false)`; người đọc cũ so `=== true`), `record-parts.tsx` (`const kho = useKhoMan(); const cuon = cuonCaKhung && kho === "dien-thoai"`; context nhận `kho === "chua-biet" && cuonCaKhung ? "chua-biet" : cuon`), `objective-sheet.tsx` (effect neo: đọc context, `if (ctx === "chua-biet") return;`, thêm vào deps; div vùng Kara thêm `data-vung-kara`). Test DOM `neo-kara` 3 ca.

- [ ] Test đỏ → sửa → xanh; chiều đỏ ghim `cuon truoc khi biet kho`. Chạy `khung-okr-truoc-r1.dom.tsx` (bài R1a) xanh. Commit.

### Task 9: phép đo màn `rang/man-okr.mjs` (E3, E11, E13, E18, E20)

`independent: false` (cần T1–T8)

**Files:** Create `_acceptance/okr-to-chuc-va/rang/man-okr.mjs`, `rang/san-r1d.mjs` (seed qua thủ tục tRPC thật của quản trị, theo `_acceptance/khung-okr-truoc-r1/rang/ban-do.mjs`: `chuanBi`, `moTrang`, `idMau`, cảnh cây). Năm phần `--phan so-kr|them|kara|thu-gon|khoi-phuc`, không cờ thì chạy cả năm; cờ `--kiem-do-do` cho chiều đỏ từng phần như evals.yaml.

- [ ] Viết, chạy qua `mot-luot.sh` (lệnh `r1d_man_okr`), đủ năm phần xanh; năm chiều đỏ in đúng thông điệp ghim và mã 1. Ảnh vào `evidence/`. Commit.

### Task 10: lưới kho + đóng S3

`independent: false`

- [ ] `bun run check-types`, `bun run lint`, `bun run lint:slop`, lệnh `r1d_san_thiet_ke`, rồi bộ kiểm app + api (một lần, tuần tự).
- [ ] Đặt `status: implemented` trong contract, commit; vào S4.
