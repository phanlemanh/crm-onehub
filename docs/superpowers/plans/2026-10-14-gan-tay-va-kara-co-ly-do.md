# Gắn tay và Kara có lý do — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mọi căn chỉnh gắn tay hay nhận từ đề xuất của Kara đều mang lý do (và căn cứ khi có), sửa được lý do sau khi gắn.

**Architecture:** Một module luật chung ở `packages/validation` (chuẩn hoá chữ, mức tin). API: `addAlignment` nhận lý do, thủ tục mới `suaLyDoCanChinh`, `troLyQuyet` ghi lý do khi nhận/sửa đề xuất `can-chinh`. Kara: `dongGopY` thêm `canCu`, bộ ghi lưu vào `OkrDeXuat.noiDung`. App: `HopThoaiCanChinh` ba chế độ, `DeXuatNeo` hiện mức tin + lý do + căn cứ.

**Tech Stack:** Bun test, NestJS + nestjs-trpc, Prisma, Zod 4, Next.js app, `@crm/ui`, eve agent tools.

**Spec:** `docs/superpowers/specs/2026-10-14-gan-tay-va-kara-co-ly-do-design.md` · hợp đồng `_acceptance/gan-tay-va-kara-co-ly-do/contract.md` · bộ đo `evals.yaml`.

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- Không `migration`; căn cứ đề xuất Kara nằm ở `OkrDeXuat.noiDung` (`{ canCu }`).
- Trần: lý do căn chỉnh 500, căn cứ căn chỉnh 500; `canCu` của Kara 200 (cùng `TRO_LY_OKR_TRAN.chu.lyDo`).
- Mã lỗi căn cứ thiếu lý do: `can-cu-can-ly-do`.
- Tệp chữ `apps/app/lib/messages/*.ts`, `_acceptance/config.yaml`, `vai-chi-okr.spec.ts`: chỉ thêm dòng.
- `apps/api/test/okr-can-chinh.spec.ts`, `apps/api/test/okr-ly-do-can-chinh.spec.ts`: không đổi dòng nào.
- Nhãn mức tin dùng `okrMessages(locale).sheet.mucTin` và `NGHIA_MUC_TIN` của `ly-do-noi-gop.tsx`; không khai bảng thứ hai.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture (đỏ có thông điệp ghim) — gom ở `rang/dot-bien.mjs`.

## Review Focus

1. Lý do chỉ có khoảng trắng hay NBSP → coi như chưa có, không lưu chuỗi rỗng (Task 1, Task 5 ma trận năm ca).
2. «Sửa lý do» rồi nhận mà không đổi chữ → giữ dấu Kara (Task 4, ca y chữ).
3. Gọi REST với `canCu` mới → không bị lột ở DTO (Task 2, Task 4 ca REST).
4. Công cụ `nop_de_xuat` chuyển `canCu` xuống bộ ghi (Task 3, gọi `execute` của công cụ).
5. Người không sửa được mục tiêu không thấy «Sửa lý do» và bị máy chủ từ chối như gỡ căn chỉnh (Task 2 ma trận, Task 5).

---

### Task 1: Luật chung `ly-do-can-chinh` (independent: true · phục vụ E1)

**Files:**
- Create: `packages/validation/src/ly-do-can-chinh.ts`
- Modify: `packages/validation/package.json` (thêm đường con `./ly-do-can-chinh`)
- Modify: `apps/api/src/okr/can-chinh.ts` (xuất lại `MUC_TIN_CAN_CHINH`, `mucTinCanChinh`, kiểu `MucTinCanChinh`)
- Test: `packages/validation/test/ly-do-can-chinh.spec.ts`

**Interfaces — Produces:**
```ts
export const LY_DO_CAN_CHINH = { lyDoToiDa: 500, canCuToiDa: 500 } as const;
export const MA_CAN_CU_CAN_LY_DO = "can-cu-can-ly-do";
export const MUC_TIN_CAN_CHINH = ["chua-co-ly-do", "dat-cuoc", "co-so-lieu"] as const;
export type MucTinCanChinh = (typeof MUC_TIN_CAN_CHINH)[number];
export function mucTinCanChinh(lyDo: string | null, canCu: string | null): MucTinCanChinh;
export const lyDoCanChinhNhap: z.ZodType<{ lyDo: string | null; canCu: string | null }>;
export type LyDoCanChinhNhap = z.infer<typeof lyDoCanChinhNhap>;
```
`lyDoCanChinhNhap` nhận `{ lyDo?: string | null, canCu?: string | null }`: mỗi ô `trim()`, rỗng → `null`, quá trần → lỗi; `canCu` khác null mà `lyDo` null → issue `custom`, `path: ["canCu"]`, `message: MA_CAN_CU_CAN_LY_DO`. `mucTinCanChinh` tự cắt khoảng trắng trước khi xếp (để màn và máy chủ cùng một luật).

- [ ] Viết bài `-t l4-luat`: ma trận bảy ca viết trước + đối chứng 500 ký tự + ba ca mức tin + `toBe` cùng tham chiếu qua `../../../apps/api/src/okr/can-chinh` (thông điệp `ban thu hai cua mucTinCanChinh`, `can cu thieu ly do lot qua`).
- [ ] Chạy `cd packages/validation && bun test test/ly-do-can-chinh.spec.ts -t l4-luat` → đỏ (module chưa có).
- [ ] Viết module; `can-chinh.ts` bỏ bản riêng, `export { MUC_TIN_CAN_CHINH, mucTinCanChinh, type MucTinCanChinh } from "@crm/validation/ly-do-can-chinh"`.
- [ ] Chạy lại → xanh; `bun run check-types`.
- [ ] Commit `feat(ly-do-can-chinh): luật chung lý do căn chỉnh`.

### Task 2: Gắn tay có lý do và sửa lý do (independent: false, sau Task 1 · phục vụ E2, E3, E4)

**Files:**
- Modify: `apps/api/src/okr/okr.contracts.ts` (`alignmentInput` thêm `lyDo`, `canCu` tuỳ chọn; `suaLyDoCanChinhInput = { id, lyDo, canCu }`)
- Modify: `apps/api/src/okr/okr.service.ts` (`addAlignment` truyền lý do; `suaLyDoCanChinh`)
- Modify: `apps/api/src/okr/okr.router.ts` (`suaLyDoCanChinh`, `PATCH /okr/alignments/{id}`)
- Modify: `apps/api/src/generated/server.ts` (`cd apps/api && bun run trpc:generate`)
- Modify: `apps/api/test/vai-chi-okr.spec.ts` (thêm `"suaLyDoCanChinh"` vào danh sách)
- Test: `apps/api/test/okr-gan-ly-do.spec.ts` (`l4-gan`, `l4-sua`, `l4-quyen`)

**Interfaces — Produces:** `OkrService.suaLyDoCanChinh(userId: string, input: SuaLyDoCanChinhInput): Promise<{ id: string; canhBao: null }>` — cổng chép `removeAlignment` (tách hàm `congGoSuaCanChinh(tx, userId, id)` dùng chung cho cả hai), ghi `lyDo`, `canCu`, `lyDoTuKara: false` khi chữ khác chữ đang lưu, vết `"sua-ly-do-can-chinh"` với `{ alignmentId, truoc: { lyDo, canCu }, sau: { lyDo, canCu } }`; chữ y nguyên → không ghi gì. Đầu vào parse bằng `lyDoCanChinhNhap` ở contract; lỗi → 400.
`addAlignment` truyền `{ ...lyDoCanChinhNhap.parse(input), lyDoTuKara: false }` làm `opts.lyDo` của `addAlignmentTrong` chỉ khi `lyDo` khác null.

- [ ] Viết `okr-gan-ly-do.spec.ts` (khuôn `okr-ly-do-can-chinh.spec.ts`: `batDauMau`, `dungUngDung`, `goi`, `goiRest`, người `nguyen-thi-lan` sửa được `q4-kd-bac-*`): `l4-gan` (tRPC + REST, đọc qua `okr.objective`, ca thiếu hai trường, ca căn cứ thiếu lý do đếm trước/sau, thông điệp `ly do gan tay bi roi`, `tao can chinh khi bi tu choi`); `l4-quyen` ma trận năm ca so lỗi với `removeAlignment`.
- [ ] Chạy `bun run test -- "cd apps/api && bun test test/okr-gan-ly-do.spec.ts -t l4-gan"` → đỏ.
- [ ] Sửa contracts, service, router; `trpc:generate`; thêm tên vào `vai-chi-okr.spec.ts`.
- [ ] Chạy `l4-gan`, `l4-quyen`, `vai-chi-okr.spec.ts` → xanh; `check-types`.
- [ ] Commit `feat(okr): gắn tay có lý do, sửa lý do căn chỉnh`.

### Task 3: Kara viết căn cứ (independent: true sau Task 1 · phục vụ E5, E8)

**Files:**
- Modify: `packages/validation/src/okr-tro-ly.ts` (`dongGopY.canCu: z.string().trim().min(1).max(TRO_LY_OKR_TRAN.chu.lyDo).nullable().default(null)`; refine: `canCu` khác null ở dòng khác `can-chinh` → lỗi `canCu chi cho can-chinh`; `HangDeXuat` thêm `noiDung: unknown`; `dongTuHang` đọc `canCu` từ `noiDung` qua schema `noiDungCanChinh = z.object({ canCu: z.string().nullable() })`, `noiDung` null → `canCu: null`)
- Modify: `apps/agent/agent/lib/okr/nop-de-xuat.ts` (`noiDung: d.loai === "can-chinh" && d.canCu ? { canCu: d.canCu } : undefined`)
- Modify: `apps/agent/agent/subagents/tro_ly_okr/instructions.md` (mục `can-chinh`: lyDo vì sao mục tiêu đẩy được đích; canCu chỉ khi khối dữ liệu có con số chống lưng, chép đúng số, không có thì null; luật 3 áp cả canCu)
- Modify: `apps/api/src/okr/okr.contracts.ts` (`noiDungDong.canCu: z.string().nullable()`), `apps/api/src/okr/tro-ly.service.ts` (`noiDungDong(id, dong)` trả `canCu`; mọi chỗ gọi `dongTuHang` truyền `noiDung`)
- Test: `apps/agent/test/nop-de-xuat-can-cu.spec.ts` (`l4-can-cu`), `apps/api/test/okr-gan-ly-do.spec.ts` (`l4-danh-sach`)

- [ ] Viết `l4-can-cu`: dùng `xepViecTroLy` + `nopDeXuat` tool `execute` (khuôn `nopThat` của `apps/api/test/tro-ly-okr-san.ts`, ngữ cảnh subagent) với hai dòng `can-chinh`; đọc hàng, `dongTuHang`; hàng `noiDung: null`; `dongGopY.safeParse` các ca từ chối; thông điệp `can cu Kara bi roi khi nop`.
- [ ] Chạy `cd apps/agent && bun test test/nop-de-xuat-can-cu.spec.ts -t l4-can-cu` → đỏ.
- [ ] Sửa schema, bộ ghi, `dongTuHang`, contract, service, chỉ dẫn.
- [ ] Xanh `l4-can-cu`, `l4-danh-sach`; chạy lại `apps/agent/test/nop-ban-de-xuat.spec.ts`, `okr-ca-gop-y.spec.ts`; `check-types`.
- [ ] Commit `feat(tro-ly-okr): Kara viết căn cứ cho đề xuất căn chỉnh`.

### Task 4: Nhận và sửa đề xuất `can-chinh` giữ lý do (independent: false, sau Task 1, 3 · phục vụ E6, E7, E3)

**Files:**
- Modify: `apps/api/src/okr/okr.contracts.ts` (`troLyQuyetInput.canCu: z.string().max(LY_DO_CAN_CHINH.canCuToiDa).optional()`)
- Modify: `apps/api/src/okr/tro-ly.service.ts` (`CACH_CUA_LOAI["can-chinh"] = ["nhan", "sua", "bac"]`; `ghiTheoDong` cho `can-chinh` nhận `lyDo: LyDoCanChinh`; `troLyQuyet` tính lý do: `nhan` → `{ lyDo: dong.lyDo, canCu: dong.canCu, lyDoTuKara: true }`; `sua` → parse `lyDoCanChinhNhap({ lyDo: giaTri, canCu })`, lỗi → `BadRequestException(MA_CAN_CU_CAN_LY_DO)`; y nguyên chữ Kara (so sau cắt) → xử như `nhan` (trạng thái `nhan`, cờ true); khác → cờ false, trạng thái `sua`, `giaTriCuoi` = lý do đã sửa)
- Test: `apps/api/test/okr-gan-ly-do.spec.ts` (`l4-nhan`, `l4-sua-de-xuat`, rồi bật `l4-sua` của Task 2)

- [ ] Viết `l4-sua` (A gieo bằng `gieoDong` + `troLyQuyet nhan` để có cờ Kara thật; tRPC rồi REST cặp mới rồi REST y nguyên; B giữ cờ; thông điệp `co Kara con sau khi nguoi sua`), `l4-nhan`, `l4-sua-de-xuat` (tRPC + REST, ca y chữ, thông điệp `nhan de xuat roi ly do`, `sua roi nhan van dau Kara`, `sua y chu van ha co`).
- [ ] Đỏ → sửa → xanh cả `l4-sua`; chạy lại `tro-ly-okr-quyet.spec.ts`, `tro-ly-okr-hoan-tac.spec.ts`, `quyet-gop-y-noi-dung-ly-do.spec.ts`.
- [ ] Commit `feat(tro-ly-okr): nhận và sửa đề xuất căn chỉnh giữ lý do`.

### Task 5: Hộp thoại căn chỉnh ba chế độ (independent: false, sau Task 2, 4 · phục vụ E9, E11)

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/hop-thoai-can-chinh.tsx`
- Modify: `apps/app/components/crm/record-sheet/objective-sheet.tsx` (`TabCanChinh`: cột `suaLyDo` với nút `data-nut="sua-ly-do"` khi `sua`, mở hộp thoại chế độ sửa)
- Modify: `apps/app/lib/messages/okr.ts` (chỉ thêm `hopThoai.viSao`, `hopThoai.viSaoMoTa`, `hopThoai.canCu`, `hopThoai.canCuMoTa`, `hopThoai.mucTin`, `hopThoai.loiCanCu`, `hopThoai.suaLyDo`, `hopThoai.moTaSua`, `hopThoai.luu`, `hopThoai.daLuu`, `hopThoai.canChinh`, `sheet.suaLyDo`; vi và en)
- Test: `apps/app/test/gan-ly-do.dom.tsx` (`l4-hop-thoai`, `l4-chu`)

**Interfaces — Produces:**
```ts
export type CheDoHopThoai =
  | { loai: "gan" }
  | { loai: "sua"; alignmentId: string; dich: string; lyDo: string | null; canCu: string | null }
  | { loai: "nhan"; deXuatId: string; dich: string; lyDo: string; canCu: string | null; guiNhan: (lyDo: string, canCu: string | null) => void };
export function HopThoaiCanChinh(p: { objectiveId: string; daGop: DaGop[]; dong: () => void; cheDo?: CheDoHopThoai }): JSX.Element;
```
Hai `Textarea` (`data-o="vi-sao"`, `data-o="can-cu"`, `translate="no"`, `maxLength` 500), `FieldDescription`, dòng mức tin `StatusIndicator data-muc-tin` tone `toneTheoNghia(NGHIA_MUC_TIN[mucTinCanChinh(lyDo, canCu)])`, lỗi `data-loi-can-cu` khi `canCu.trim() && !lyDo.trim()`; nút gửi khoá khi có lỗi. Chế độ `sua`/`nhan`: ô đích thay bằng chữ đích tĩnh.

- [ ] Viết `l4-hop-thoai` (ma trận năm trạng thái, ba chế độ, nút ẩn với người không sửa được; thông điệp `muc tin hop thoai sai`) và `l4-chu`.
- [ ] Chạy `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gan-ly-do.dom.tsx -t l4-hop-thoai` → đỏ.
- [ ] Sửa hộp thoại, `TabCanChinh`, tệp chữ.
- [ ] Xanh; `messages-guard.spec.ts`, `okr-sheet.dom.tsx`, `sheet-quyen-cap-nhat.dom.tsx`; `bun run lint:slop`.
- [ ] Commit `feat(okr): hộp thoại căn chỉnh có lý do và căn cứ`.

### Task 6: Đề xuất căn chỉnh của Kara có lý do (independent: false, sau Task 3, 4, 5 · phục vụ E10, E11)

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx` (`DeXuatNeo` nhánh `can-chinh`: `rationale` = khối `[data-de-xuat-ly-do]` + `[data-de-xuat-can-cu]` + `StatusIndicator data-muc-tin`; ba nút `can-chinh` (primary, `m.dong.canChinhKemLyDo`), `sua-ly-do` (secondary, mở `HopThoaiCanChinh` chế độ `nhan`), `bo-qua`)
- Modify: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts` (`quyet(d, cach, giaTri?, canCu?)` gửi `canCu`)
- Modify: `apps/app/lib/messages/okr-gop-y.ts` (chỉ thêm `dong.canChinhKemLyDo`, `dong.suaLyDo`, `dong.viSao`, `dong.canCu`; vi và en)
- Test: `apps/app/test/gan-ly-do.dom.tsx` (`l4-de-xuat`)

- [ ] Viết `l4-de-xuat` (thông điệp `thieu dong can cu`); đỏ → sửa → xanh; chạy lại `gop-y-dung-cho*.dom.tsx`, `khung-gop-y-luot-2.tsx` nếu có `-t`.
- [ ] Commit `feat(okr): đề xuất căn chỉnh của Kara hiện lý do và căn cứ`.

### Task 7: Bộ mẫu có đề xuất căn chỉnh của Kara (independent: false, sau Task 3 · phục vụ E13, E15)

**Files:**
- Create: `apps/api/scripts/okr-mau/nap-de-xuat-kara.ts` (`xepViecTroLy` + công cụ `nop_de_xuat` `execute` với ngữ cảnh subagent, `noteSession`, `completeTask` — đúng khuôn `nopThat`; một dòng `can-chinh` có lý do và căn cứ trên mục tiêu mẫu chưa căn chỉnh tới đích đó)
- Modify: `apps/api/scripts/okr-mau/nap.ts` hoặc `lenh.ts` (gọi sau nạp OKR; dọn theo tiền tố như cũ)
- Create: `_acceptance/gan-tay-va-kara-co-ly-do/rang/ca-man.json` (người xem, mã mục tiêu, lý do, căn cứ mẫu)
- Test: `apps/api/test/okr-gan-ly-do.spec.ts` (`l4-mau`, `l4-man-doc-lai`)

- [ ] Viết hai bài; đỏ → viết nạp → xanh; chạy lại bài từ chối production của okr:mau.
- [ ] Commit `feat(okr-mau): đề xuất căn chỉnh mẫu của Kara`.

### Task 8: Răng của hồ sơ (independent: false, cuối · phục vụ E12, E14, E16, E17)

**Files:**
- Create: `_acceptance/gan-tay-va-kara-co-ly-do/rang/man.mjs` (khuôn `cay-can-chinh-co-ly-do/rang/man.mjs`: cảnh cây, mỗi khổ một tiến trình con, đo tràn cấp trang + đối chứng đỏ, ảnh vào `evidence/`)
- Create: `rang/dot-bien.mjs` (mười vết a–j, khuôn `cay-can-chinh-co-ly-do/rang/dot-bien.mjs`)
- Create: `rang/giu-ho-so.mjs`, `rang/ranh-gioi.mjs` (chép khuôn L3, đổi slug, ranh giới đọc từ contract)
- Modify: `_acceptance/config.yaml` (chỉ thêm khoá `l4_*` cho mọi `config:` ref của `evals.yaml`)

- [ ] Viết bốn tệp; chạy `ranh-gioi`, `giu-ho-so`, `dot-bien` → xanh (dot-bien: mỗi vết đỏ đúng thông điệp).
- [ ] Chạy phép đo màn `bun run do:man --chay "l4"` hoặc lệnh `l4_man` → 6 ảnh, mỗi kiểm `DUNG`.
- [ ] `bun run check-types && bun run lint && bun run lint:slop`.
- [ ] Commit `test(gan-tay-va-kara-co-ly-do): răng đo màn, đột biến, giữ hồ sơ, ranh giới`.
