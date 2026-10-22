# Tệp theo người phụ trách bản ghi — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người phụ trách bản ghi và quản trị mở được tệp trong ô Tệp; đổi người phụ trách thì quyền đi theo ngay.

**Architecture:** Một hàm luật `quyenMoTep` ở `packages/auth` trả `{ coTheMo, lyDo }`; `FieldFilesService.downloadUrl` và bộ dựng
`tepTheoTruong` của ba `byId` cùng gọi nó với `ownerId` đọc cùng lượt. Luật xoá `coTheXoaTep` chuyển cùng chỗ, theo lối Hỏi-2.
Màn chỉ vẽ dòng lý do từ `lyDoKhongMo`.

**Tech Stack:** NestJS + nestjs-trpc (`apps/api`), Prisma (`packages/db`), Zod (`packages/validation`), Next/React (`apps/app`),
`bun test`.

**Spec:** `docs/superpowers/specs/2026-10-22-tep-theo-chu-ban-ghi-design.md` · hợp đồng
`_acceptance/tep-theo-chu-ban-ghi/contract.md` · evals `_acceptance/tep-theo-chu-ban-ghi/evals.yaml`.

**Cổng 1.5:** chủ kho (manh) duyệt 22/10.

**Đứng trên DA19.** Mọi tên của ô Tệp (`FieldFilesService`, `coTheMoTep`, `coTheXoaTep`, `TepTrongO`, `KHO_TEP`, `OTruongPhieu`,
chữ «Chỉ quản trị mở được tệp.») là tên trong kế hoạch DA19 (`origin/feat/truong-tep:docs/superpowers/plans/2026-10-21-truong-tep.md`,
Task 4). Task 0 đọc lại tên thật sau khi DA19 gộp; tên khác thì sửa kế hoạch này một lượt trước Task 1, hợp đồng không đổi.

## Global Constraints

- Luật 45: không task nào chạy trước khi DA19 #532 gộp onehub và nhánh này gộp onehub.
- Không chú thích trong mã (`AGENTS.md`).
- `apps/app` không import `@crm/auth` (gói máy chủ); màn chỉ đọc `coTheMo`, `lyDoKhongMo` từ `byId`.
- Không migration, không biến môi trường mới.
- `_acceptance/config.yaml`, `apps/app/lib/messages/crm.ts`: chỉ thêm hoặc sửa đúng dòng của DA19 (luật 7).
- Chữ màn, nguyên văn: «Chỉ {ten} và quản trị mở được tệp.» · «Bản ghi chưa có người phụ trách nên chỉ quản trị mở được tệp.» ·
  «Bạn không còn phụ trách bản ghi này nên không mở được tệp.»; bản tiếng Anh: «Only {name} and admins can open these files.» ·
  «This record has no owner, so only admins can open its files.» · «You no longer own this record, so you can't open its files.»
- Log: `Field file opened` / `Field file open refused`, khoá `tepId`, `fieldId`, `recordId`, `userId`, `role`, `laPhuTrach`
  (+ `lyDo` khi từ chối); không URL.
- Hỏi-2 lối đã duyệt: `khuyen` (quản trị, người đang phụ trách, người đã tải lên). Hạn URL giữ 300 giây (Hỏi-1).

## Review Focus

1. Thoả thuận do vai «chỉ OKR» phụ trách: người ấy vẫn bị middleware chặn, không phải `FORBIDDEN` của luật — Task 2 ô `O × dO`.
2. Gán hàng loạt đổi người phụ trách qua `updateManyAndReturn`, không qua `update`: lời gọi kế phải theo người mới — Task 2 đường
   `bulkAssignOwner`.
3. Người phụ trách được gán là người đã rời nhóm: mọi `fieldFiles.*` của họ trả `NOT_A_MEMBER`, quản trị vẫn mở — Task 2 ca R.
4. Phiếu mở từ trước khi đổi: bấm «Mở» nhận `FORBIDDEN`, phiếu tải lại đúng `byId` của loại ấy, không mở tab — Task 5.
5. Khoá API của nhân viên: đi đúng luật của nhân viên đó qua REST — Task 2 ca khoá API.

---

### Task 0: Gộp onehub sau DA19, đọc lại tên, đường nền

`independent: false`.

**Files:**
- Modify: `docs/superpowers/plans/2026-10-22-tep-theo-chu-ban-ghi.md` (chỉ khi tên thật khác).
- Create: `_acceptance/tep-theo-chu-ban-ghi/evidence/ke-hoach.json` — `{ "hoi2_loi": "khuyen", "nguon": "<id dòng sổ gate1 hay
  S1 của Hỏi-2>" }`.

- [ ] Chờ DA19 #532 gộp (lệnh nền chờ `gh pr view 532 --json state` = `MERGED`); gộp `origin/onehub` vào nhánh bằng
  `sync_with_base_branch`; `bun install`; `bun run db:generate`.
- [ ] Đọc lại trên mã thật và ghi một dòng sổ `fix` nếu lệch: tên hàm luật mở và luật xoá của DA19 và tệp chứa chúng; khuôn
  `TepTrongO`; tên provider kho giả; tên component ô Tệp; khoá chữ «Chỉ quản trị mở được tệp.» ở `crm.ts`; khuôn bắt log trong
  `apps/api/test`.
- [ ] Xin `duong-nen`, chạy `duong-nen.mjs --root . --slug tep-theo-chu-ban-ghi` qua `giu-nhip.mjs`, nhả; đỏ thì gom vào lời
  trình Cổng 1.5.
- [ ] Ghi `ke-hoach.json`; commit.

### Task 1: Luật `quyenMoTep` và `coTheXoaTep` ở `@crm/auth`

`independent: false` (Task 2–4 đứng trên). Phục vụ E1b.

**Files:**
- Create: `packages/auth/src/quyen-tep.ts`; export qua barrel `packages/auth/src/index.ts`.
- Test: `packages/auth/test/quyen-tep.spec.ts` (`describe("tcb-ham")`).

**Interfaces — Produces:**
- `type LyDoKhongMoTep = "khong-phu-trach" | "chua-co-phu-trach"`
- `quyenMoTep(i: { vai: WorkspaceRole | null; userId: string; phuTrachId: string | null }): { coTheMo: true; lyDo: null } |
  { coTheMo: false; lyDo: LyDoKhongMoTep | "ngoai-pham-vi" }`
- `coTheXoaTep(i: { vai: WorkspaceRole | null; userId: string; phuTrachId: string | null; taiBoiId: string | null }): boolean`
  — lối `khuyen`.

- [ ] Viết `tcb-ham` (a): bảng 15 ô (5 vai × 3 quan hệ) với đáp án viết tay; `okr` → `ngoai-pham-vi`, `null` vai → `ngoai-pham-vi`;
  thêm 15 ô cho `coTheXoaTep` với `taiBoiId` bằng / khác người gọi. Chạy: đỏ «thieu quyenMoTep».
- [ ] Viết `tcb-ham` (b): quét TypeScript compiler API như evals E1b, kèm đối chứng chèn dòng `isWorkspaceAdmin`. Đỏ «khong goi»
  (DA19 chưa gọi `quyenMoTep`) — giữ đỏ tới Task 2.
- [ ] Hiện thực hai hàm (dùng `isWorkspaceAdmin`, `docDuocDoiTac`); (a) xanh.
- [ ] Đột biến tay «bỏ vế người phụ trách» → (a) đỏ đúng câu; hoàn lại; ghi sổ S3. Commit.

### Task 2: Mở tệp theo người phụ trách — `downloadUrl`, cờ `byId`, đi theo khi đổi

`independent: false`. Phục vụ E1, E1b (b), E2, E3.

**Files:**
- Modify: `apps/api/src/fields/field-files.service.ts` — `coTheMoTep` của DA19 thành lớp gọi `quyenMoTep`; `downloadUrl` đọc
  `fieldFile` kèm `deal|company|contact { ownerId }` trong một truy vấn; từ chối bằng `TRPCError FORBIDDEN` mang `lyDo`.
- Modify: bộ dựng `tepTheoTruong` mà DA19 dùng chung cho `deals|companies|contacts.service.ts` `byId` — truyền `ownerId` của
  bản ghi và vai người gọi; mỗi tệp thêm `lyDoKhongMo`.
- Modify: `packages/validation/src/tep-truong.ts` — `tepTrongO` thêm
  `lyDoKhongMo: z.enum(["khong-phu-trach", "chua-co-phu-trach"]).nullable()`.
- Modify: ba router `byId` nếu DA19 chưa đưa vai người gọi vào service (dùng `docPhamViYeuCau(ctx).role`, mẫu
  `tai-lieu.router.ts:56`).
- Modify: `apps/api/src/generated/server.ts` (`bun run trpc:generate`).
- Test: `apps/api/test/tep-theo-chu.spec.ts` — `tcb-luat`, `tcb-doi-chu`, `tcb-pham-vi`.

**Interfaces — Consumes:** Task 1. **Produces:** `TepTrongO.lyDoKhongMo`; `FieldFilesService.downloadUrl(nguoiGoi: { id: string;
role: WorkspaceRole }, { tepId }): { url: string; hetHan: Date }`.

- [ ] Viết `tcb-luat` (28 ô downloadUrl + 21 ô cờ, fixture bảy bản ghi, bốn người) → đỏ «A dA FORBIDDEN».
- [ ] Viết `tcb-doi-chu` (7 đường, gỡ về trống, đặt lại, đếm bảng qua `Prisma.dmmf`) và `tcb-pham-vi` (a)–(e) gồm người tải không
  phụ trách, khoá API qua REST, người đã rời bằng `workspace.removeMember` → đỏ.
- [ ] Hiện thực; ba ca xanh; `tcb-ham` (b) xanh.
- [ ] Đột biến tay theo evals E1 («mọi member mở»), E2 (Map nạp một lần), E3 (thừa kế công ty; vế `taiBoiId`) → mỗi cái đỏ đúng
  câu; hoàn lại; ghi sổ S3.
- [ ] Chạy lại bài DA19 `-t ttp-quyen` → xanh (fixture DA19 do quản trị phụ trách). Commit.

### Task 3: Xoá tệp theo lối Hỏi-2

`independent: false` (cùng `field-files.service.ts`). Phục vụ E4.

**Files:**
- Modify: `apps/api/src/fields/field-files.service.ts` — `remove` và cờ `coTheXoa` dùng `coTheXoaTep` của Task 1 với `ownerId`
  đọc cùng lượt; xoá hàm luật xoá cũ của DA19.
- Test: `tcb-xoa` trong `apps/api/test/tep-theo-chu.spec.ts`.

- [ ] Viết `tcb-xoa` đọc `hoi2_loi`, ba ma trận 18 ô, bốn lời `remove`, đối chứng «ma trận mù» → đỏ «co khuyen truoc A fQ false».
- [ ] Hiện thực; xanh; đột biến tay theo evals E4; hoàn lại; ghi sổ S3.
- [ ] Chạy lại bài DA19 `-t ttp-xoa` → xanh. Commit.

### Task 4: Vết mở và từ chối mở

`independent: false` (cùng `downloadUrl`). Phục vụ E6.

**Files:**
- Modify: `apps/api/src/fields/field-files.service.ts` — `Logger` ghi hai message ở Global Constraints; `laPhuTrach` là
  `ownerId === userId`, tính độc lập với kết quả `quyenMoTep`.
- Test: `tcb-vet` trong `apps/api/test/tep-theo-chu.spec.ts`.

- [ ] Viết `tcb-vet` (28 ô, câu lọc CHẾT, dòng giả đối chứng, phần đột biến đếm đúng 11, quét `laPhuTrach`) → đỏ «mo Q dA message».
- [ ] Hiện thực; xanh. Commit.

### Task 5: Ô Tệp — dòng lý do và lời báo mất quyền

`independent: false` (đứng trên `lyDoKhongMo` của Task 2). Phục vụ E5.

**Files:**
- Modify: tệp ô Tệp của DA19 trong `apps/app/components/crm/fields/` — dưới danh sách tệp một `FieldDescription` có `id`, nút «Mở»
  khoá mang `aria-describedby`; tên người phụ trách trong `<span translate="no">`; `onError` của `downloadUrl` với mã `FORBIDDEN`:
  `toast.error(<chữ mất quyền>)` rồi `cache.deal(id)` / `cache.company(id)` / `cache.contact(id)` theo loại bản ghi của ô.
- Modify: `apps/app/lib/messages/crm.ts` — sửa đúng khoá chữ lý do của DA19 thành ba khoá mới (vi, en) ở Global Constraints.
- Test: `apps/app/test/tep-theo-chu.dom.tsx` — `tcb-o-tep`.

- [ ] Viết `tcb-o-tep` (18 ô, 3 ca mất quyền, quét không so vai hay id) → đỏ «khong-phu-trach vi dong».
- [ ] Hiện thực; xanh. Chạy lại bài DA19 `-t ttp-o-tep` → xanh. Commit.

### Task 6: Đo màn

`independent: true` so với Task 3, 4 (chỉ cần Task 2, 5). Phục vụ E7.

**Files:**
- Create: `_acceptance/tep-theo-chu-ban-ghi/rang/do-man.mjs` — dựng dữ liệu qua API thật trong phiên đo (`tien-de.mjs`), ba ngữ cảnh
  trình duyệt Q, A, B bằng `dev:session`, máy chủ Blob giả theo hợp đồng E8 DA19; bảy ảnh và các lối thoát 1 đúng câu của evals E7.
- Modify: `_acceptance/truong-tep/rang/do-man.mjs` của DA19 — bước 5 đọc chữ lý do từ bảng chữ thay vì chuỗi «Chỉ quản trị mở được
  tệp.» (chỉ khi DA19 đã gộp với chuỗi viết cứng; báo phiên DA19 trước khi sửa).

- [ ] Chạy `bun run do:man --chay "bun _acceptance/tep-theo-chu-ban-ghi/rang/do-man.mjs"` → mã 0 «tcb man: dat»; mở bảy ảnh. Commit.

## Thứ tự

Task 0 → 1 → 2 → 3 → 4 → 5 → 6 (6 có thể song song với 3, 4 khi chạy bằng `execute-parallel`). Xong Task 6: hợp đồng sang
`implemented`, xin `s4`, chấm.

## Nếu Cổng 1.5 đổi

| Đổi | Ảnh hưởng |
|---|---|
| Hỏi-2 lối `a` hay `b` | Task 0 ghi `hoi2_loi` khác; Task 1 `coTheXoaTep` theo lối ấy; E4 tự đọc lối, không sửa eval |
| Hỏi-1 hạ hạn URL | Thêm một bước ở Task 2 đổi hằng của DA19 và sửa AC-4 DA19 — cần mở lại hợp đồng DA19 |
