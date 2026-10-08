# Danh sách kéo thả chung — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Một thành phần kéo có lưu (`SortableSaveList`) cho Tổ chức và Giai đoạn, và giai đoạn thoả thuận lưu trữ / khôi phục được.

**Architecture:** `packages/ui/src/components/sortable-list.tsx` thêm `SortableSaveList` giữ thứ tự tạm, khoá, quay về khi lỗi, toast «Hoàn tác» (sonner, như `copy-value.tsx`). API `giai-doan` thêm `archived` (query) và `restore` (mutation) — chỉ đọc / ghi, không trí khôn. Trang Giai đoạn và Tổ chức truyền hàm lưu trả Promise (`mutateAsync`).

**Tech Stack:** React 19, dnd-kit, sonner, TanStack Query, nestjs-trpc, Prisma, bun test + jsdom.

**Spec:** `docs/superpowers/specs/2026-10-08-danh-sach-keo-chung-design.md` · hợp đồng `_acceptance/danh-sach-keo-chung/contract.md` (duyệt 2026-10-08T05:06:29Z) · phép đo `_acceptance/danh-sach-keo-chung/evals.yaml`.

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- Chỉ ghi trong worktree `epic-gates-7891a0`; tệp ngoài ranh giới đã duyệt: P3-15, P3-16, P3-17, P3-18. `apps/app/lib/messages/settings.ts`, `packages/ui/src/lib/messages.ts`, `_acceptance/config.yaml`, `apps/app/lib/trpc/cache.ts`, `docs/api.md` chỉ THÊM (luật 7). `apps/api/src/generated/server.ts` sinh lại bằng `bun run trpc:generate` (không sửa tay).
- `SortableList`, `SortableItem` giữ nguyên chữ ký (Trường tuỳ chỉnh dùng).
- Chữ: vi «Đã lưu thứ tự mới», «Hoàn tác», «Đã trả thứ tự cũ», hướng dẫn «Kéo để sắp thứ tự, hoặc dùng phím Space rồi mũi tên lên xuống.»; giai đoạn «Lưu trữ», «Lưu trữ «{ten}»?», «Chuyển và lưu trữ», «Đã lưu trữ «{ten}».», «Đã lưu trữ», «Khôi phục», «Đã khôi phục «{ten}».».
- Dữ liệu người nhập (tên) mang `translate="no"`.
- Không migration. Tests DOM: `TZ=Asia/Ho_Chi_Minh`, preload `packages/ui/test/setup-dom.ts`.
- Một phép đo mới chỉ XONG khi có cặp hai chiều trên cùng fixture: vật lành xanh, bản sao phá đỏ với thông điệp ghim.

## Review Focus

1. Lưu chồng: người kéo lần hai ngay khi lần đầu đang lưu → tay kéo đã khoá, không có lời gọi thứ hai (E1 dòng 2, thêm ca ở Task 1).
2. Hoàn tác sau khi dữ liệu đã làm mới (props `ids` đổi) → thứ tự tạm phải bỏ, không ghim thứ tự cũ đè lên dữ liệu mới (Task 1 ca «props đổi thì bỏ tạm»).
3. Khôi phục khi tên đã được dùng lại bằng chữ hoa khác / khoảng trắng → chặn (E10 dòng 2).
4. Hoàn tác lưu trữ khi nhóm đã đổi giữa chừng (người khác thêm giai đoạn) → `reorder` lệch thì máy chủ từ chối, toast lỗi, giai đoạn vẫn đã khôi phục ở cuối nhóm (Task 3: ca reorder reject sau restore).
5. Trang Tổ chức chuyển sang bộ phận khác khi đang lưu → không lỗi React (setState sau unmount) — SortableSaveList bỏ qua kết quả khi đã unmount (Task 1).

---

### Task 1: SortableSaveList trong packages/ui

independent: true · phục vụ E1, E2, E3 (và nền cho E4, E5)

**Files:**
- Modify: `packages/ui/src/components/sortable-list.tsx`
- Modify: `packages/ui/src/lib/messages.ts` (chỉ thêm `sortableList.hint|saved|undo|restored`, en + vi)
- Create: `packages/ui/test/sortable-save-list.dom.tsx`

**Interfaces:**
- Produces:
  ```ts
  export type SortableChange = { ids: string[]; id: string; index: number };
  export function SortableSaveList(props: {
    ids: string[];
    label: (id: string) => string;
    disabled?: boolean;
    onSave: (change: SortableChange) => Promise<unknown>;
    children: (id: string, locked: boolean) => ReactNode;
  }): JSX.Element;
  ```
  Mỗi hàng là một `SortableItem` do `SortableSaveList` dựng (`id`, `label(id)`, `disabled={locked}`), `children(id, locked)` là nội dung hàng. Dòng hướng dẫn `<p data-slot="sortable-hint" className="text-muted-foreground text-xs">`.

- [ ] **Step 1: Viết bài kiểm đỏ** — `sortable-save-list.dom.tsx`, bốn describe theo `evals.yaml`:
  - `dang-luu`: dựng `SortableSaveList` ids `["a","b","c"]`, `onSave` trả Promise treo; stub `getBoundingClientRect` theo khuôn `datViTri` của `apps/app/test/to-chuc-chi-tiet.dom.tsx` (hàng có `[data-muc]`); Space + ArrowDown + Space trên nút «Đổi thứ tự a». Kỳ vọng 4 dòng của E1 + dòng 5 (`disabled` → 0 lần gọi) + ca Review Focus 1 (kéo b khi đang lưu → vẫn 1 lần gọi).
  - `loi`: `onSave` reject `new Error("x")` → thứ tự a,b,c; `toast.error` 1 lần với "x" (`mock.module("sonner")` ghi lời gọi); tay kéo mở. Thông điệp ghim: `"giu thu tu vua keo khi luu loi"`.
  - `hoan-tac`: `onSave` xong → `toast(msg.sortableList.saved, { action: { label: msg.sortableList.undo, onClick } })`; `onClick()` → `onSave` lần 2 `{ ids:["a","b","c"], id:"a", index:0 }`; `onClick()` lần nữa khi lần 2 treo → không lần 3; lần 2 xong → `toast.success(msg.sortableList.restored)` không action; lần 2 reject "y" → thứ tự b,a,c + `toast.error("y")`; en cùng hai chữ.
  - `tam-thoi`: lưu xong rồi rerender với `ids` mới `["b","a","c"]` → hiện đúng props; rerender với `ids` khác hẳn khi đang lưu → bỏ tạm, hiện props (Review Focus 2); unmount khi đang lưu rồi resolve → không cảnh báo React (Review Focus 5).
- [ ] **Step 2: Chạy, thấy đỏ** — `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/sortable-save-list.dom.tsx` → FAIL «SortableSaveList is not exported».
- [ ] **Step 3: Cài**:
  ```tsx
  export type SortableChange = { ids: string[]; id: string; index: number };

  export function SortableSaveList({ ids, label, disabled = false, onSave, children }: {
    ids: string[];
    label: (id: string) => string;
    disabled?: boolean;
    onSave: (change: SortableChange) => Promise<unknown>;
    children: (id: string, locked: boolean) => ReactNode;
  }) {
    const msg = useMessages();
    const [tam, setTam] = useState<{ goc: string[]; ids: string[] } | null>(null);
    const [dangLuu, setDangLuu] = useState(false);
    const song = useRef(true);
    useEffect(() => () => { song.current = false; }, []);
    const hien = tam && sameIds(tam.goc, ids) ? tam.ids : ids;
    const locked = disabled || dangLuu;

    const luu = (change: SortableChange, truoc: string[], sau: () => void) => {
      setTam({ goc: ids, ids: change.ids });
      setDangLuu(true);
      onSave(change).then(
        () => { if (!song.current) return; setDangLuu(false); sau(); },
        (e: Error) => { if (!song.current) return; setTam({ goc: ids, ids: truoc }); setDangLuu(false); toast.error(e.message); },
      );
    };
    ...
  }
  ```
  `onReorder(next)` của `SortableList` bên trong: bỏ qua khi `locked`; tính `id` = phần tử đổi chỗ (`arrayMove` từ `from` tới `to`, lấy `hien[from]`), `index = to`; gọi `luu({ids: next, id, index}, hien, () => toast(msg.sortableList.saved, { action: { label: msg.sortableList.undo, onClick: hoanTac } }))`. `hoanTac` dùng ref `dangTra` chặn bấm lặp, gọi `luu({ ids: truoc, id, index: from }, next, () => toast.success(msg.sortableList.restored))`. `sameIds` so độ dài + từng phần tử cùng tập (tạm chỉ áp khi props vẫn là bản gốc lúc kéo). Hàng: `SortableItem key id label={label(id)} disabled={locked}` bọc `children(id, locked)`; dưới danh sách `<p data-slot="sortable-hint" className="text-muted-foreground text-xs">{msg.sortableList.hint}</p>`.
  Chữ thêm ở `messages.ts`: en `hint: "Drag to reorder, or press Space then the up and down arrows."`, `saved: "New order saved"`, `undo: "Undo"`, `restored: "Previous order restored"`; vi như Global Constraints.
- [ ] **Step 4: Chạy, thấy xanh** — cùng lệnh Step 2 → PASS. Chạy thêm `bun test --preload ./test/setup-dom.ts` toàn `packages/ui` (hồi quy).
- [ ] **Step 5: Phá-thử hai chiều** — bản sao trong `.acceptance-runs/danh-sach-keo-chung/pha/`: (a) bỏ `locked` khi đang lưu → `dang-luu` đỏ "tay keo con mo khi dang luu"; (b) bỏ `setTam(truoc)` ở nhánh lỗi → `loi` đỏ "giu thu tu vua keo khi luu loi"; (c) Hoàn tác gửi `next` → `hoan-tac` đỏ "hoan tac khong tra thu tu cu". Ghi kết quả vào `.acceptance-runs/danh-sach-keo-chung/pha-thu.md`. Không `git checkout` trong cây (bài học: phá-thử tại chỗ mất thay đổi) — chỉ phá bản sao.
- [ ] **Step 6: Commit** — `feat(ui): SortableSaveList — kéo có lưu, quay về khi lỗi, Hoàn tác`.

### Task 2: API giai đoạn — archived, restore

independent: true · phục vụ E10 (nền cho E7, E9, E11)

**Files:**
- Modify: `apps/api/src/giai-doan/giai-doan.contracts.ts`, `giai-doan.service.ts`, `giai-doan.router.ts`, `giai-doan-config.ts` (thêm `chuaLuuTru`)
- Regenerate: `apps/api/src/generated/server.ts` (`cd apps/api && bun run trpc:generate`)
- Test: `apps/api/test/giai-doan.spec.ts` (describe `khoi-phuc`), `apps/api/test/giai-doan-quyen.spec.ts` (thêm `restore` vào danh sách và `dauVaoHopLe`)
- Modify: `docs/api.md` (một gạch đầu dòng ở «Deal stages are rows»)

**Interfaces:**
- Produces:
  ```ts
  export const giaiDoanArchivedOutput = z.array(z.object({ id: z.string(), label: z.string(), kind: loaiGiaiDoan, archivedAt: z.date() }));
  export const giaiDoanRestoreInput = z.object({ id: z.string().min(1) });
  // router: giaiDoan.archived (query, GET /deal-stages/archived), giaiDoan.restore (mutation, POST /deal-stages/{id}/restore) → giaiDoanWriteOutput
  ```

- [ ] **Step 1: Bài kiểm đỏ** — `giai-doan.spec.ts` describe `khoi-phuc`, 8 dòng của E10 (dùng `taoGiaiDoan`, `songCuaLoai`; dòng 3 tạo thêm tới đủ `GIAI_DOAN.tran.tong` sống rồi dọn trong `finally`). `giai-doan-quyen.spec.ts`: `expect(ds).toEqual(["archive","create","rename","reorder","restore"])`, `dauVaoHopLe("restore")` tạo giai đoạn tạm có `archivedAt: new Date()`.
- [ ] **Step 2: Chạy đỏ** — `bun run test -- "cd apps/api && bun test test/giai-doan.spec.ts -t khoi-phuc"` → FAIL `giaiDoan.restore is not a function`.
- [ ] **Step 3: Cài** —
  ```ts
  async archived(): Promise<GiaiDoanArchived> {
    return this.db.dealStage.findMany({
      where: { archivedAt: { not: null } },
      orderBy: [{ archivedAt: "desc" }, { id: "asc" }],
      select: { id: true, label: true, kind: true, archivedAt: true },
    }) as Promise<GiaiDoanArchived>;
  }

  async restore(userId: string, raw: GiaiDoanRestoreInput) {
    await this.requireManager(userId);
    const input = giaiDoanRestoreInput.parse(raw);
    const ketQua = await this.db.$transaction(async (tx) => {
      const song = await this.khoaSong(tx);
      const g = await tx.dealStage.findUnique({ where: { id: input.id }, select: { id: true, label: true, kind: true, archivedAt: true } });
      if (!g) throw new NotFoundException(M.khongCo);
      if (g.archivedAt === null) throw new BadRequestException(M.chuaLuuTru);
      if (song.length >= GIAI_DOAN.tran.tong) throw new BadRequestException(M.tran);
      if (this.nhanTrung(song, g.label)) throw new BadRequestException(M.trung);
      const cung = song.filter((s) => s.kind === g.kind);
      const position = cung.length === 0 ? 0 : Math.max(...cung.map((s) => s.position)) + 1;
      return tx.dealStage.update({ where: { id: g.id }, data: { archivedAt: null, position }, select: { id: true } });
    });
    this.logger.log({ message: "Deal stage restored", stageId: ketQua.id });
    return ketQua;
  }
  ```
  `archivedAt` trả qua tRPC: dùng `z.date()` nếu superjson có, ngược lại `z.string()` + `.toISOString()` — kiểm transformer của kho trước (`apps/api/src/trpc`), chọn theo quy ước sẵn có. Router thêm hai thủ tục theo khuôn `list`/`archive`. `M.chuaLuuTru = "Only an archived stage can be restored."`.
- [ ] **Step 4: Sinh lại tRPC + chạy xanh** — `cd apps/api && bun run trpc:generate`; `bun run test -- "cd apps/api && bun test test/giai-doan.spec.ts test/giai-doan-quyen.spec.ts"` → PASS; `bun run check-types --filter=api`.
- [ ] **Step 5: Phá-thử** — bản sao service bỏ `nhanTrung` trong restore → dòng 2 đỏ; ghi `pha-thu.md`.
- [ ] **Step 6: docs/api.md** — thêm gạch: «**Archived stages come back through `restore`.** `giaiDoan.archived` lists them newest first; `restore` runs under the same `FOR UPDATE`, refuses a name a live stage uses, the cap, and a stage that is not archived, and puts the stage last in its kind. There is no purge: history keeps the id.»
- [ ] **Step 7: Commit** — `feat(api): giai đoạn đã lưu trữ — archived, restore`.

### Task 3: Trang Giai đoạn

independent: false (cần Task 1, Task 2) · phục vụ E5 (nơi giai đoạn), E7, E8, E9, E4/E11 (màn thật)

**Files:**
- Modify: `apps/app/app/(app)/[slug]/settings/giai-doan/giai-doan-settings.tsx`, `hop-thoai-giai-doan.tsx`
- Modify: `apps/app/lib/messages/settings.ts` (chỉ thêm khoá `giaiDoan.luuTru`, `luuTruTieuDe`, `luuTruThan`, `conThoaThuanLuuTru`, `chuyenVaLuuTru`, `daLuuTruTen`, `daLuuTru`, `khoiPhuc`, `daKhoiPhucTen`, `datTranLuuTru`, `xoaVinhVien` (nhãn bắt buộc của ArchivedList, không hiện vì `purgeable: false`) — en + vi)
- Modify: `apps/app/lib/trpc/cache.ts` (thêm `trpc.giaiDoan.archived.queryKey()` vào `giaiDoan`)
- Test: `apps/app/test/giai-doan-cai-dat.dom.tsx`

**Interfaces:**
- Consumes: `SortableSaveList`, `SortableChange` (Task 1); `trpc.giaiDoan.archived`, `trpc.giaiDoan.restore` (Task 2).

- [ ] **Step 1: Bài kiểm đỏ** — sửa mock `useTRPC` thêm `archived` (query, mặc định `[]`) và `restore`; mock `reorder`/`archive`/`restore` ghi lời gọi và cho mỗi ca chọn kết quả (xong / reject). Đổi hai ca cũ dùng `t.giaiDoan.xoa` sang `t.giaiDoan.luuTru`. Thêm describe `luu-loi` (E5 nơi giai đoạn), `luu-tru-ngay` (E7 8 dòng), `luu-tru-chuyen` (E8 4 dòng), `da-luu-tru` (E9 6 dòng), ca Review Focus 4 (restore xong, reorder reject → toast lỗi).
- [ ] **Step 2: Chạy đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/giai-doan-cai-dat.dom.tsx`.
- [ ] **Step 3: Cài**:
  - `TheLoai`: bỏ `useState` tạm; `SortableSaveList ids={cua.map(g=>g.id)} label={id => theoId.get(id)?.label ?? id} disabled={khoa} onSave={({ids}) => sapXep(kind, ids)}` với `sapXep` = `reorder.mutateAsync({kind, ids}).finally(() => cache.giaiDoan())`; hàng giữ `data-hang-giai-doan`, `MenuHang` nhận `khoa || locked`. Bỏ toast/hoàn tác cũ ở `GiaiDoanSettings` (thành phần chung lo). `key` của `TheLoai` bỏ chuỗi ids (không còn tạm cần reset).
  - `MenuHang`: mục `t.luuTru` (khoá + `t.xoaCuoiCung` khi `laCuoi`), gọi `onLuuTru`.
  - `GiaiDoanSettings`: `onLuuTru(g)` — `g.dealCount === 0` → `archive.mutateAsync({id})` → `cache.giaiDoan()` + `cache.deal()` → `toast(t.daLuuTruTen.replace("{ten}", g.label), { action: { label: t.hoanTac, onClick: () => hoanTacLuuTru(g, truoc) } })` với `truoc` = ids nhóm trước khi cất; `hoanTacLuuTru` = `restore.mutateAsync({id})` rồi `reorder.mutateAsync({kind, ids: truoc})`, lỗi ở bước nào cũng `toast.error(e.message)`, cuối `cache.giaiDoan()`; chặn bấm lặp bằng ref. `g.dealCount > 0` → `hop.moXoa(g.id)` (hộp cũ).
  - `HopThoaiXoa`: chữ đổi sang `luuTruTieuDe`, `conThoaThuanLuuTru`, `chuyenVaLuuTru`; toast `toast.success(t.daLuuTruTen…)` không action; bỏ nhánh `ConfirmDialog` (giai đoạn rỗng không còn mở hộp).
  - `DaLuuTruGiaiDoan` (trong `giai-doan-settings.tsx`): `useQuery(trpc.giaiDoan.archived.queryOptions())` → `ArchivedList label={t.daLuuTru} restoreLabel={t.khoiPhuc} purgeLabel={t.xoaVinhVien} items={rows.map(g => ({ id, name: g.label, kind: nhomTen[g.kind], purgeable: false }))} disabled={!canManage} pending={restore.isPending} onRestore={id => restore.mutate({id}, { onSuccess: () => toast.success(t.daKhoiPhucTen…), onError: e => toast.error(e.message), onSettled: () => cache.giaiDoan() })} onPurge={() => undefined}`. Đặt sau ba thẻ, trước `HopThoaiGiaiDoan`.
  - `LyDoGiaiDoan`: `datTran` → `datTranLuuTru`.
- [ ] **Step 4: Chạy xanh** — lệnh Step 2 → PASS; thêm `keo-tha-thoa-thuan.dom.tsx`, `giai-doan-board.dom.tsx`, `giai-doan-menu.dom.tsx` (hồi quy).
- [ ] **Step 5: Phá-thử** — bản sao: Hoàn tác chỉ gọi `restore` → `luu-tru-ngay` dòng 6 đỏ "hoan tac luu tru khong tra dung cho cu"; toast chuyển có action → `luu-tru-chuyen` dòng 4 đỏ. Ghi `pha-thu.md`.
- [ ] **Step 6: Commit** — `feat(app): giai đoạn lưu trữ, Hoàn tác, Đã lưu trữ; kéo qua SortableSaveList`.

### Task 4: Trang Tổ chức

independent: false (cần Task 1) · phục vụ E5 (gốc, bộ phận), E6, E4 (màn thật)

**Files:**
- Modify: `apps/app/app/(app)/[slug]/settings/organization/danh-sach-keo.tsx`, `chi-tiet-goc.tsx`, `chi-tiet-bo-phan.tsx`
- Create: `apps/app/test/sap-luu-loi.dom.tsx`

**Interfaces:**
- Consumes: `SortableSaveList`, `SortableChange`.
- Produces: `DanhSachKeo` prop `ghi: (change: SortableChange) => Promise<unknown>` (thay `ghi(moi, id, xong)`).

- [ ] **Step 1: Bài kiểm đỏ** — `sap-luu-loi.dom.tsx`: chép khung mock của `to-chuc-chi-tiet.dom.tsx` (trpc giả, `datViTri`, `keoLen`), `mock.module("sonner")` ghi lời gọi. Ma trận 2 nơi × 3 dòng của E5 (goc: `reorderDivisions` reject "tu choi"; bo phan: `moveDepartment` reject "tu choi") + đối chứng dương (thủ tục xong → `toast` saved 1 lần) + ca Hoàn tác ở bộ phận gọi `moveDepartment {id, divisionId, index: from}`.
- [ ] **Step 2: Chạy đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/sap-luu-loi.dom.tsx`.
- [ ] **Step 3: Cài** — `DanhSachKeo`: `<SortableSaveList ids={muc.map(x=>x.id)} label={id => theoId.get(id)?.name ?? id} disabled={!sua} onSave={ghi}>{(id, locked) => <div className="flex min-w-0 flex-1 items-center justify-between gap-2 py-2 pe-2" data-muc-keo={id} …>…<MenuDong … sua={sua && !locked} /></div>}</SortableSaveList>` — bỏ `<div className="rounded-lg border">`, bỏ `useState`, bỏ `dangGhi`. `chi-tiet-goc.tsx`: `ghi={({ ids }) => sap.mutateAsync({ ids }).then(() => lamMoi())}`; bỏ `toast.success(m.daSap)`/`toast.error` và dòng `<p>{m.keo}</p>` (thành phần chung lo). `chi-tiet-bo-phan.tsx`: `ghi={({ id, index }) => doi.mutateAsync({ id, divisionId: bp.id, index }).then(() => lamMoi())}`, tương tự.
- [ ] **Step 4: Chạy xanh** — lệnh Step 2 + `to-chuc-chi-tiet.dom.tsx`, `to-chuc.dom.tsx` (không sửa kỳ vọng, E12).
- [ ] **Step 5: Phá-thử** — bản sao `chi-tiet-goc` nuốt lỗi (`.catch(() => undefined)`) → nơi gốc dòng 1 và 3 đỏ "giu thu tu vua keo khi luu loi". Ghi `pha-thu.md`.
- [ ] **Step 6: Commit** — `feat(app): Tổ chức kéo qua SortableSaveList — Hoàn tác, quay về khi lỗi`.

### Task 5: Thước của hồ sơ

independent: false (cần Task 3, 4 cho phép đo màn) · phục vụ E4, E6, E11, E12, E13 và mọi khoá executor

**Files:**
- Modify: `_acceptance/config.yaml` (chỉ thêm khoá `dsk_*`)
- Create: `_acceptance/danh-sach-keo-chung/rang/mot-thanh-phan.mjs`, `rang/san-thiet-ke.mjs`, `rang/do-man.mjs`

- [ ] **Step 1: Khoá executor** (test):
  - `dsk_dang_luu`, `dsk_loi`, `dsk_hoan_tac`: `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/sortable-save-list.dom.tsx -t <dang-luu|loi|hoan-tac>`
  - `dsk_luu_loi`: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/giai-doan-cai-dat.dom.tsx ./test/sap-luu-loi.dom.tsx -t "luu-loi|sap-luu-loi"`
  - `dsk_gd_luu_tru_ngay`, `dsk_gd_luu_tru_chuyen`, `dsk_gd_da_luu_tru`: cùng tệp giai-doan-cai-dat với `-t` tương ứng
  - `dsk_api_khoi_phuc`: `bun run test -- "cd apps/api && bun test test/giai-doan.spec.ts -t khoi-phuc && bun test test/giai-doan-quyen.spec.ts"`
  - `dsk_hoi_quy`: `git diff --quiet $(git merge-base HEAD origin/onehub) -- <4 tệp> && cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts <4 tệp>`
  (script): `dsk_do_man` theo khuôn `mcl_do_man` (`mot-luot.sh "bun _acceptance/danh-sach-keo-chung/rang/do-man.mjs"`, cổng 3340/3341), `dsk_mot_thanh_phan: bun _acceptance/danh-sach-keo-chung/rang/mot-thanh-phan.mjs`, `dsk_san_thiet_ke: bun _acceptance/danh-sach-keo-chung/rang/san-thiet-ke.mjs`.
- [ ] **Step 2: `mot-thanh-phan.mjs`** — đọc AST bằng `typescript` (khuôn `menu-con-loc-dien-thoai/rang/khong-cham-noi-goi.mjs`), đường suy từ `import.meta.dirname`; luật E6; `--tu-thu` ba bản giả trong thư mục tạm → mỗi bản thoát 1 và gọi tên tệp. Chạy cả hai chiều.
- [ ] **Step 3: `san-thiet-ke.mjs`** — rút tệp từ `git diff --name-only --diff-filter=AM <merge-base>`, lọc, gọi `design-gate.mjs --mode static` (đường qua `scripts/resolve-plugin.mjs`), rỗng → 2; `--tu-thu`. Chạy hai chiều.
- [ ] **Step 4: `do-man.mjs`** — khuôn `menu-con-loc-dien-thoai/rang/do-man.mjs` (puppeteer-core, `canhCay`, `BANG_CHUNG`), sáu cảnh của E4 + E11, kéo bằng bàn phím, tạo giai đoạn riêng qua `fetch` tRPC với cookie phiên đo, dọn trong `finally`. Chạy một lượt thật qua `mot-luot.sh` (mọi cảnh DUNG) và ghi chiều đỏ của E4 (`hoan-tac-to-chuc-1440` trên bản onehub) vào `pha-thu.md` nếu đo được, không thì ghi lý do.
- [ ] **Step 5: Commit** — `test(acceptance): danh-sach-keo-chung — thước và khoá executor`.

### Task 6: Cổng xanh toàn kho

independent: false

- [ ] `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run test`, `bun run build` — từ gốc, tất cả thoát 0.
- [ ] Contract `status: implemented`, commit, vào S4.
