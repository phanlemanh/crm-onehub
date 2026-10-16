# Sơ đồ căn chỉnh theo đơn vị — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Toàn cảnh › Theo đơn vị có cách xem Sơ đồ: mỗi đơn vị một thẻ, dây theo căn chỉnh thật, lọc «Cần chú ý», mở thẻ trên sơ đồ, thu gọn khi hơn 12 đơn vị; trang đơn vị bỏ cách xem Cây (B5).

**Architecture:** Một truy vấn tRPC mới `okr.soDoDonVi` gọi hàm thuần `gopSoDoDonVi` (API, không ghi CSDL) trên tập mục tiêu mà `okr.mucTieuCuaCay` đã lọc quyền. Phía app, `toan-canh.tsx` thêm `ViewSwitch` Bảng · Sơ đồ và nạp lười `so-do-don-vi.tsx`; tệp này có hàm thuần `dungSoDo` (nút, dây, thu gọn, lọc) và dựng `FlowMap` của `packages/ui` (React Flow + dagre, rút tệp máy từ block `@reui/flow-2`).

**Tech Stack:** NestJS + nestjs-trpc, Prisma, zod; Next.js app router, TanStack Query, nuqs; `@xyflow/react` 12.12, `@dagrejs/dagre` 3.1; bun test (DOM qua `packages/ui/test/setup-dom.ts`).

**Spec:** `docs/superpowers/specs/2026-10-15-so-do-can-chinh-don-vi-design.md` · hợp đồng `_acceptance/so-do-can-chinh-don-vi/contract.md` (15 AC, đã duyệt 15/10) · `evals.yaml` (E1–E17).

## Global Constraints

- Không chú thích trong mã (AGENTS.md «Never add code comments»).
- Client không nhập `@crm/db`, `@crm/auth`; kiểu prop do client tự khai.
- Hằng chỉnh được đặt ở một tệp cấu hình theo khu: `SO_DO` trong `apps/app/app/(app)/[slug]/okr/toan-canh/so-do-config.ts` (`thuGonKhiHon: 12`), kích thước thẻ trong `FLOW_LAYOUT` của `packages/ui/src/lib/flow-layout.ts`.
- Chữ khung ở `apps/app/lib/messages/okr-toan-canh.ts` (khối `soDo`, đủ `vi` và `en` khác nhau) và `packages/ui/src/lib/messages.ts` (khối `soDo` của khung vẽ) — chỉ thêm.
- Dữ liệu người nhập (tên đơn vị, tên người, tên mục tiêu, câu lý do) mang `translate="no"`.
- Màu trạng thái qua `StatusIndicator` + `toneTheoNghia`; mức tin qua `NGHIA_MUC_TIN` của `apps/app/components/crm/record-sheet/ly-do-noi-gop.tsx`, không khai bảng thứ hai.
- Không sửa `apps/api/src/okr/can-chinh.ts`; không đổi `hangToanCanh`; không đổi `apps/api/scripts/okr-mau/cong-ty.json` (nhiều hồ sơ đã ký đếm trên nó).
- Phụ thuộc chỉ thêm `@xyflow/react@^12.12.0` và `@dagrejs/dagre@^3.1.1` vào `packages/ui/package.json` (chủ kho chọn ở Cổng Phạm vi); `bun add` là làn nặng — xin lượt Điều phối M5.
- TDD: commit bài kiểm đỏ trước commit vật trong mỗi task.
- Mỗi khối UI mới ghi một dòng «dừng ở bậc nào» cho mô tả PR (`docs/design.md` «Vẽ tay là bậc cuối»): FlowMap bậc 4 (rút tệp máy block Pro).

## Review Focus

1. Bộ mẫu thật có 14 đơn vị → thu gọn bật ngay ở màn mặc định; nhánh có đơn vị chưa nối phải mở sẵn — bài `dh4-thu-gon` ca thứ tư và E12.
2. Mục tiêu năm của công ty nằm ở kỳ cha; dây của phòng ban góp vào KR năm phải tìm được đơn vị đích qua tập mục tiêu kỳ cha mà `mucTieuCuaCay` trả — bài `dh4-du-lieu` gieo đích ở kỳ năm.
3. Căn chỉnh tới mục tiêu người xem không thấy: đích không có trong tập → không thành dây, không lộ tên — bài `dh4-quyen`.
4. KR loại mốc không có tình trạng trượt (`moc-xong`/`moc-chua`) — bài `dh4-chu-y` thêm một KR mốc dưới mục tiêu cam kết, cờ trượt tắt.
5. Tên đơn vị rất dài trên thẻ 280px — bài `dh4-the` kiểm thẻ tên 120 ký tự có `truncate` và `title`.

---

### Task 1: Khung vẽ dùng chung `FlowMap` trong `packages/ui`

**independent: true** (không chạm API) · phục vụ E11, E12, E4 (tệp nạp lười)

**Files:**
- Modify: `packages/ui/package.json` (thêm hai phụ thuộc), `bun.lock`
- Create: `packages/ui/src/components/flow-map.tsx`, `packages/ui/src/lib/flow-layout.ts`
- Modify: `packages/ui/src/lib/messages.ts` (thêm khối `soDo`, chỉ thêm)

**Interfaces:**
- Produces: `FlowMap<N extends Node>({ nodes, edges, nodeTypes, label, onNodeClick?, focusId? })` · `FlowMapEdge = Edge<FlowMapEdgeData, "flow-map">` với `FlowMapEdgeData = { kind: "lien" | "dut" | "an"; label?: string }` · `layoutTopDown(nodes, edges) → { nodes, bends }` · `FLOW_LAYOUT` · re-export `Node`, `NodeProps`. Gốc khung có `data-flow-map`.

- [ ] **Step 1: Xin lượt làn nặng «bun install khi thêm phụ thuộc»** — nhắn Điều phối M5, chờ «DH4 vào làn».
- [ ] **Step 2: Thêm phụ thuộc**

```bash
cd packages/ui && nice -n 10 bun add @xyflow/react@^12.12.0 @dagrejs/dagre@^3.1.1
```

- [ ] **Step 3: Rút hai tệp từ bản mẫu** — `git show 6e98e80e5:packages/ui/src/components/flow-map.tsx > packages/ui/src/components/flow-map.tsx` và tương tự `flow-layout.ts`; khối `soDo` của `messages.ts` lấy đúng phần thêm ở `git show 6e98e80e5 -- packages/ui/src/lib/messages.ts`.
- [ ] **Step 4: Sửa theo hợp đồng** — đổi `FlowMapEdgeData.kind` thành `"lien" | "dut" | "an"` (nét liền `strokeDasharray` rỗng, nét đứt `"6 4"`, `an` không vẽ nhưng vẫn vào `layoutTopDown`); thêm `data-flow-map` vào phần tử gốc; đọc `window.matchMedia("(prefers-reduced-motion: reduce)").matches` một lần khi gắn và truyền `duration: 0` cho mọi `fitView`/`setCenter`; giữ `aria-label` của ba nút từ `msg.soDo` (`thuNho`, `phongTo`, `vuaKhung`); `touch-action: manipulation` trên khung. Giữ props `focusId` để DH5 dùng.
- [ ] **Step 5: Kiểm kiểu và lint**

Run: `nice -n 10 bun run check-types --filter=@crm/ui && cd packages/ui && bunx biome check src/components/flow-map.tsx src/lib/flow-layout.ts src/lib/messages.ts`
Expected: exit 0.

- [ ] **Step 6: Nhả lượt, commit**

```bash
git add packages/ui/package.json bun.lock packages/ui/src/components/flow-map.tsx packages/ui/src/lib/flow-layout.ts packages/ui/src/lib/messages.ts
git commit -m "feat(ui): FlowMap — khung vẽ nút–cạnh dùng chung (React Flow + dagre, tệp máy rút từ @reui/flow-2)"
```

---

### Task 2: Truy vấn `okr.soDoDonVi` và bộ gieo ca sơ đồ

**independent: true** (không chạm app, không chạm `packages/ui`) · phục vụ E1, E2, E3, E17

**Files:**
- Create: `apps/api/scripts/okr-mau/ca-so-do.ts` (bộ gieo ca sơ đồ; KHÔNG gọi từ `okr:mau` mặc định)
- Create: `apps/api/src/okr/so-do-don-vi.ts` (hàm thuần)
- Modify: `apps/api/src/okr/okr-xem.contracts.ts` (thêm `soDoDonViOutput`, chỉ thêm)
- Modify: `apps/api/src/okr/okr-xem.service.ts` (thêm `docDauVaoSoDo`, `soDoDonVi`)
- Modify: `apps/api/src/okr/okr.router.ts` (thêm thủ tục, chỉ thêm)
- Test: `apps/api/test/okr-so-do-don-vi.spec.ts`

**Interfaces:**
- Produces (contracts):

```ts
export const CO_CHU_Y = ["chua-truong", "chua-okr", "chua-noi", "muc-tieu-chua-gop", "kr-truot"] as const;
export const dongGopSoDo = z.object({
	dich: z.string(),
	tenDich: z.string(),
	donViDich: z.string(),
	lyDo: z.string().nullable(),
	mucTin: z.enum(MUC_TIN_CAN_CHINH),
	lyDoTuKara: z.boolean(),
});
export const mucTieuSoDo = z.object({
	id: z.string(),
	ten: z.string(),
	gop: z.array(dongGopSoDo),
});
export const nutSoDo = z.object({
	khoa: z.string(),
	ten: z.string(),
	cap: z.enum(["goc", "bo-phan", "phong-ban"]),
	cha: z.string().nullable(),
	truong: z.object({ id: z.string(), name: z.string() }).nullable(),
	soMucTieu: z.number(),
	soKr: z.number(),
	tienDo: z.number().nullable(),
	tinhTrang: z.object({ dungNhip: z.number(), chamNhip: z.number(), truot: z.number() }),
	chuaGop: z.number(),
	co: z.array(z.enum(CO_CHU_Y)),
	canChuY: z.boolean(),
	mucTieu: z.array(mucTieuSoDo),
});
export const duongSoDo = z.object({
	tu: z.string(),
	den: z.string(),
	loai: z.enum(["lien", "dut"]),
	soMucTieu: z.number(),
});
export const soDoDonViOutput = z.object({ nut: z.array(nutSoDo), duong: z.array(duongSoDo) });
export type SoDoDonViOutput = z.infer<typeof soDoDonViOutput>;
```

- Produces (hàm thuần): `gopSoDoDonVi(vao: DauVaoSoDo): SoDoDonViOutput` với
  `DauVaoSoDo = { cay: CayGon; tenGoc: string; truongGoc: NguoiGon | null; cycleId: string; mts: MucTieuOutput[] }`.
- Produces (service): `docDauVaoSoDo(userId, cycleId): Promise<DauVaoSoDo>` (gọi `this.okr.mucTieuCuaCay` + `this.quyenOkr.quyen` + `cayGon`) và `soDoDonVi(userId, cycleId)`.
- Produces (bộ gieo): `napCaSoDo(db, { cycleIdQuy, cycleIdNam })` + `DON_VI_CHUA_NOI: readonly string[]` + `DON_VI_CAN_CHU_Y: readonly string[]` + `KHOA_CA: Record<"A"|"A1"|"A2"|"A3"|"B"|"B1"|"B2"|"X", string>`.

**Luật trong `gopSoDoDonVi` (một chỗ, viết đúng thế này):**
- Khoá đơn vị của mục tiêu: `onehub → "goc"`, `bo-phan → "bp:" + unitId`, `phong-ban → "pb:" + unitId`, `ca-nhan` bỏ.
- Mục tiêu tính cho nút: `m.cycleId === cycleId && m.status === "cong-bo" && m.level !== "ca-nhan"`.
- Đơn vị đích của một nối góp = khoá đơn vị của `targetObjectiveId` tra trong toàn bộ `mts` (kể cả kỳ cha); không tra được → bỏ nối góp đó (không dây, không tên).
- Góp ra ngoài khi đơn vị đích ≠ đơn vị nguồn. Dây: `loai = "lien"` khi đích là cha theo cây tổ chức, ngược lại `"dut"`; gộp theo cặp (đích, nguồn), `soMucTieu` = số mục tiêu khác nhau.
- Cờ: `chua-truong` (head null) · `chua-okr` (0 mục tiêu) · `chua-noi` (≥1 mục tiêu và 0 mục tiêu góp ra ngoài) · `muc-tieu-chua-gop` (có mục tiêu 0 nối góp) · `kr-truot` (có KR `kind !== "moc"` mà `tinhTrang(kr.progress, m.expected, m.kind) === "truot"`). Nút `goc`: `co = []`, `canChuY = false`.
- `tinhTrang` đếm KR không phải mốc theo `dung-nhip`/`cham-nhip`/`truot`; `tienDo` = trung bình `m.progress`, `null` khi 0 mục tiêu.

- [ ] **Step 1: Viết bộ gieo `ca-so-do.ts`** — tạo hai bộ phận `sd-a`, `sd-b` (trưởng là người mẫu), phòng ban `sd-a1`, `sd-a2`, `sd-a3` (trong A), `sd-b1`, `sd-b2` (trong B; `sd-b2` không trưởng), `sd-x` (chưa xếp); id qua `idMau`; mục tiêu kỳ quý: A góp hai mục tiêu vào KR của mục tiêu năm công ty, A1 góp mục tiêu A (lý do «co-so-lieu», `lyDoTuKara: true`) và cùng mục tiêu ấy góp KR công ty (lý do «dat-cuoc») — ca góp hai chỗ của E17, A2 góp KR của B, A3 góp A và góp công ty, B có một mục tiêu không nối, B1 góp thẳng mục tiêu công ty, B2 chỉ góp nội bộ, X góp mục tiêu công ty; A1 có một KR cam kết trượt (tiến độ đặt để `tinhTrang` trả `truot` theo `NGUONG_TINH_TRANG.truot`), X có một KR tham vọng dưới ngưỡng và một KR mốc; một mục tiêu giới hạn `sd-g` của A1 góp A, chỉ một người mẫu được xem. Xuất `DON_VI_CHUA_NOI = ["pb:"+id(sd-b2)]` và `DON_VI_CAN_CHU_Y` tính tay theo luật trên, cùng tệp với dữ liệu.
- [ ] **Step 2: Viết bài kiểm đỏ** `apps/api/test/okr-so-do-don-vi.spec.ts` với bốn `describe`: `dh4-du-lieu`, `dh4-chu-y`, `dh4-quyen`, `dh4-ly-do`, đúng `expected` của E1, E2, E3, E17 (ma trận viết trước, đếm assert, đối chứng dương, thông điệp ghim `duong sai loai: <tu>-><den>`, `duong lo cho don vi chua noi: <khoá>`, `tinh truot ngoai cam ket`, `lo ten muc tieu gioi han`, `ly do sai cho noi: <mục tiêu>-><đích>`). `beforeAll`: `dungUngDung`, `batDauMau`, `napCaSoDo`; `afterAll`: `ketThucMau`. `dh4-chu-y` lấy đầu vào bằng `app.get(OkrXemService).docDauVaoSoDo(...)` rồi gọi `gopSoDoDonVi` — không viết tay đầu vào.

Run: `bun run test -- "cd apps/api && bun test test/okr-so-do-don-vi.spec.ts"`
Expected: FAIL — `okr.soDoDonVi` chưa có (thủ tục không tồn tại).

- [ ] **Step 3: Commit bài đỏ**

```bash
git add apps/api/scripts/okr-mau/ca-so-do.ts apps/api/test/okr-so-do-don-vi.spec.ts
git commit -m "test(so-do-can-chinh-don-vi): bộ gieo ca sơ đồ và bốn bài API đỏ (E1 E2 E3 E17)"
```

- [ ] **Step 4: Viết `so-do-don-vi.ts`, contracts, service, router** — thủ tục theo khuôn `toanCanh` (`okr.router.ts`): `@Query({ input: cycleOnlyInput, output: soDoDonViOutput, meta: restMeta("GET", "/okr/unit-map", TAG) })`, thân `return this.xem.soDoDonVi(ctx.user.id, input.cycleId)`.
- [ ] **Step 5: Chạy lại** — Run như Step 2. Expected: PASS cả bốn `describe`.
- [ ] **Step 6: Chạy bài API của L3 và Toàn cảnh để chắc không chạm** — `bun run test -- "cd apps/api && bun test test/okr-cay-ly-do.spec.ts test/okr-toan-canh.spec.ts"`. Expected: PASS.
- [ ] **Step 7: Commit**

```bash
git add apps/api/src/okr/so-do-don-vi.ts apps/api/src/okr/okr-xem.contracts.ts apps/api/src/okr/okr-xem.service.ts apps/api/src/okr/okr.router.ts
git commit -m "feat(okr): truy vấn soDoDonVi — đơn vị, dây theo căn chỉnh, năm cờ Cần chú ý"
```

---

### Task 3: Cách xem Sơ đồ ở Toàn cảnh

**independent: false** (cần Task 1 và Task 2) · phục vụ E4–E11

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/toan-canh/so-do-config.ts`, `so-do-don-vi.tsx`, `the-don-vi.tsx`
- Modify: `apps/app/app/(app)/[slug]/okr/toan-canh/toan-canh.tsx`, `apps/app/app/(app)/[slug]/okr/okr-search-params.ts`, `apps/app/lib/search-param-keys.ts` (chỉ thêm `xemToanCanh`, `locSoDo`, `moDonVi`, `moNhanh`), `apps/app/lib/messages/okr-toan-canh.ts` (chỉ thêm khối `soDo`)
- Test: `apps/app/test/okr-so-do-don-vi.dom.tsx`

**Interfaces:**
- Consumes: `soDoDonViOutput` (Task 2), `FlowMap`, `FlowMapEdge`, `layoutTopDown` (Task 1).
- Produces: `dungSoDo(du: SoDoDonViOutput, tt: { loc: "moi" | "chu-y"; moDonVi: string | null; moNhanh: readonly string[] }) → { nut: NutVe[]; day: FlowMapEdge[]; soMoi: number; soChuY: number; tuMoNhanh: string[] }` — `NutVe = Node<{ nut: NutSoDo; mo: boolean; mo_ro: boolean; gop: { soPhongBan: number; soChuY: number } | null }, "don-vi">`; `SoDoDonVi` (component mặc định của tệp, dùng qua `next/dynamic`); `SO_DO = { thuGonKhiHon: 12 } as const`.
- Luật `dungSoDo`: tổng đơn vị > `SO_DO.thuGonKhiHon` → phòng ban có cha là bộ phận gộp, trừ nhánh có phòng ban `chua-noi`, nhánh có `moDonVi`, nhánh trong `moNhanh`, và (khi `loc = "chu-y"`) nhánh có phòng ban `canChuY`; mỗi đơn vị không có dây đi lên nào nhận một cạnh `kind: "an"` tới cha để dagre xếp; dây `dut` có `label` = `soMucTieu` khi > 1.

- [ ] **Step 1: Viết bài đỏ** `apps/app/test/okr-so-do-don-vi.dom.tsx` theo khuôn `okr-toan-canh-chu.dom.tsx` (mock `@/lib/trpc/client`, `NuqsTestingAdapter`, `createRoot`), tám `describe`: `dh4-cach-xem`, `dh4-the`, `dh4-loc`, `dh4-mo-the`, `dh4-thu-gon`, `dh4-hep`, `dh4-trang-thai`, `dh4-chu` đúng `expected` E4–E11. Dữ liệu sinh bằng `gopSoDoDonVi` (nhập thẳng từ `../../api/src/okr/so-do-don-vi`) trên đầu vào dựng từ `MucTieuOutput` parse bằng `mucTieuOutput` thật, rồi `soDoDonViOutput.parse`. `dh4-cach-xem` duyệt đồ thị import tĩnh bắc cầu (đọc tệp, regex `^\s*(import|export)\s[^;]*?from\s+["']([^"']+)["']` bỏ `import type`, giải `@/` → `apps/app/`, `@crm/ui/` → `packages/ui/src/`, đường tương đối; đường tính từ `import.meta.dir`) và bản sao đỏ trong `mkdtemp`.

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx`
Expected: FAIL — không tìm thấy `so-do-don-vi.tsx`.

- [ ] **Step 2: Commit bài đỏ** — `git commit -m "test(so-do-can-chinh-don-vi): tám bài DOM đỏ (E4–E11)"`.
- [ ] **Step 3: Khoá đường dẫn và bộ đọc** — `search-param-keys.ts`: thêm `xemToanCanh: "xemToanCanh"`, `locSoDo: "locSoDo"`, `moDonVi: "moDonVi"`, `moNhanh: "moNhanh"` vào `okr`; `okr-search-params.ts`: `CACH_XEM_TOAN_CANH = ["bang", "so-do"] as const`, `parseAsXemToanCanh = parseAsStringLiteral(CACH_XEM_TOAN_CANH).withDefault("bang")`, `parseAsLocSoDo = parseAsStringLiteral(["moi", "chu-y"] as const).withDefault("moi")`, `parseAsMoDonVi = parseAsString`, `parseAsMoNhanh = parseAsArrayOf(parseAsString).withDefault([])`.
- [ ] **Step 4: `the-don-vi.tsx`** — thẻ là `<button type="button">` bọc `Card` (`focus-visible:ring-2`), tên `CardTitle translate="no" className="truncate" title={ten}`, trưởng hay `m.soDo.chuaCoTruong`, dòng số, ba `StatusIndicator` đếm tình trạng (`toneTheoNghia`), `[data-chua-noi]` mang `m.soDo.chuaNoiLen`, `[data-co]` liệt tên cờ qua `m.soDo.co[c]`; khi mở: danh sách `Item` mục tiêu, mỗi dòng góp dùng nhãn `m.sheet.mucTin` + tone `toneTheoNghia(NGHIA_MUC_TIN[mucTin])`, câu `[data-ly-do-cau]`, `KaraTrace` khi `lyDoTuKara`; tên mục tiêu là `Button variant="link"` gọi `openRecord({ kind: "objective", id })` với `const openRecord = useOpenRecord()` (`apps/app/components/crm/record-sheet/record-stack.ts`); thẻ gộp có nút «+n phòng ban».
- [ ] **Step 5: `so-do-don-vi.tsx`** — `"use client"`; `dungSoDo` như Interfaces; component đọc `useQueryStates` bốn khoá, `useQuery(trpc.okr.soDoDonVi.queryOptions({ cycleId }))`, `matchMedia("(min-width: 768px)")` để chọn `FlowMap` hay danh sách `Item` thụt (`data-so-do-danh-sach`), `ToggleGroup` chip lọc (số `tabular-nums`, `aria-live="polite"`), chú giải ba dòng, khung xương / `VungTaiLoi` / câu kỳ rỗng; Esc đóng thẻ mở.
- [ ] **Step 6: `toan-canh.tsx`** — `CardAction` thêm `ViewSwitch items=[bang, so-do]` (giữ nút Sức khoẻ cạnh nó); `const SoDoDonVi = dynamic(() => import("./so-do-don-vi"), { ssr: false, loading: () => <KhungSoDo /> })`; nhánh `xem === "so-do"` dựng `SoDoDonVi`, còn lại giữ `SimpleTable` cũ nguyên dòng.
- [ ] **Step 7: Chạy lại bài DOM** — như Step 1. Expected: PASS tám `describe`; rồi `cd apps/app && bun test ./test/messages-guard.spec.ts` PASS và chạy bài Toàn cảnh cũ `-t toan-canh` của `okr-toan-canh-chu.dom.tsx` PASS.
- [ ] **Step 8: Commit** — `git commit -m "feat(okr): Toàn cảnh có cách xem Sơ đồ — thẻ đơn vị, lọc Cần chú ý, mở thẻ, thu gọn"`.

---

### Task 4: B5 — bỏ cách xem Cây khỏi trang đơn vị — HOÃN (Gate 1.5, 15/10: tách thành hàng riêng sau phiên nghiệm thu L3; hạt giống `docs/plan/2026-10-15-hat-giong-b5-bo-cay-sau-nghiem-thu-l3.md`; E13 khai not-run — không thực thi task này)

**independent: false** (cần Task 3: đích chuyển hướng là Sơ đồ) · phục vụ E13, E14

**Files:**
- Modify: `packages/validation/src/okr-tham-so.ts` (bỏ `"cay"` khỏi `CACH_XEM_OKR`), `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx` (bỏ `XemCay`, mục ViewSwitch `cay`, nhánh `xem === "cay"`), `apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx` (bỏ prefetch cây; `xemOkr=cay` → `redirect(dichCay(thamSo, slug))`)
- Create: hàm `dichCay` trong `apps/app/app/(app)/[slug]/okr/theo-don-vi/dich-cay.ts`
- Delete: `apps/app/app/(app)/[slug]/okr/cay-can-chinh.tsx`, `apps/app/test/cay-can-chinh-ly-do.dom.tsx`
- Modify: `apps/app/test/okr-theo-don-vi.dom.tsx` (bỏ bài `theo-don-vi-cay`, bỏ phần nút cây của `nhan-danh-sach`, thêm `dh4-b5`)
- Modify: `_acceptance/cay-can-chinh-co-ly-do/evals.yaml`, `_acceptance/ux-lai-thu-8c-okr/evals.yaml` — eval đo cây khai `status: not-run` + `superseded_by: so-do-can-chinh-don-vi#AC-7` (khuôn GUIDE §7.1)

**Interfaces:**
- Produces: `dichCay(tham: { don: string | null; ky: string | null }, base: string): string` → `${base}/okr/toan-canh?xemToanCanh=so-do[&moDonVi=<don>][&<THAM_SO_KY_OKR>=<ky>]`, `don === "goc"` hay `null` thì không có `moDonVi`.

- [ ] **Step 1: Viết bài đỏ `dh4-b5`** trong `okr-theo-don-vi.dom.tsx` đúng `expected` E13 (đếm mục ViewSwitch === `CACH_XEM_OKR.length`, `cay ∉ CACH_XEM_OKR`, ba ca `dichCay`, đối chứng `danh-sach`). Run lệnh `config:executors.test.dh4_b5`. Expected: FAIL (`dichCay` chưa có).
- [ ] **Step 2: Commit bài đỏ.**
- [ ] **Step 3: Sửa vật** theo Files; xoá hai tệp cây.
- [ ] **Step 4: Nghỉ eval có tên** — với từng eval của hai hồ sơ đã ký mà lệnh trỏ bài cây đã xoá (`l3_nut`, `l3_ba_muc`, `l3_lap_lai`, `l3_loc`, `l3_dem`, `l3_chu`, `l3_man` của `cay-can-chinh-co-ly-do`; eval `nhan-danh-sach` của `ux-lai-thu-8c-okr`): thêm `status: not-run` và `superseded_by`; ghi danh sách nghỉ vào `## Notes` của hợp đồng này (mục «Eval đã nghỉ»), một dòng sổ `fix` S3.
- [ ] **Step 5: Chạy lại** — `config:executors.test.dh4_b5` PASS; `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-theo-don-vi.dom.tsx` PASS; `bun run lint:dead` không báo tệp mồ côi mới.
- [ ] **Step 6: Commit** — `git commit -m "feat(okr): B5 — trang đơn vị bỏ cách xem Cây, đường cũ mở Sơ đồ đúng đơn vị"`.

---

### Task 5: Răng của hồ sơ

**independent: false** (cần Task 1–4) · phục vụ E12, E14, E15, E16

**Files:**
- Create: `_acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs`, `ranh-gioi.mjs`, `dot-bien.mjs`, `man.mjs`, `ca-man.json`

**Interfaces:**
- Consumes: `DON_VI_CHUA_NOI`, `DON_VI_CAN_CHU_Y`, `napCaSoDo` (Task 2); lệnh config `dh4_*`.
- Mọi đường dẫn suy từ `import.meta.dirname` (gốc kho = `../../..`), không hardcode.

- [ ] **Step 1: `ranh-gioi.mjs`** đúng `expected` E16 — rút đường trong backtick của mục «Ranh giới» và «Eval đã nghỉ» ở `## Notes`; kèm ca đối chứng diff giả tệp lạ phải đỏ `tep ngoai ranh gioi: <tệp>`.
- [ ] **Step 2: `giu-ho-so.mjs`** đúng `expected` E14 — mẫu: `_acceptance/cay-can-chinh-co-ly-do/rang/giu-ho-so.mjs`; bỏ qua eval có tên ở «Eval đã nghỉ», in tên.
- [ ] **Step 3: `dot-bien.mjs`** đúng `expected` E15 — bản sao bằng `git archive HEAD apps packages | tar -x -C <tmp>`, symlink `node_modules`, bảy đột biến (a)–(g) mỗi cái một bản sao, mỗi cái chạy đúng một `-t` và so thông điệp ghim; bài lành trước.
- [ ] **Step 4: `man.mjs` + `ca-man.json`** đúng E12 — chạy trong `mot-luot.sh`; trước màn gọi `napCaSoDo` qua `bun apps/api/scripts/okr-mau/ca-so-do.ts --nap`; Playwright 1440×1000 và 390×844; chụp 4 ảnh vào `_acceptance/so-do-can-chinh-don-vi/evidence/`.
- [ ] **Step 5: Chạy ba răng máy** — `bun _acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs`, `node .../ranh-gioi.mjs`, `bun .../dot-bien.mjs`. Expected: exit 0, đủ dòng `DUNG` / `DO DUNG (a)`…`(g)`. `man.mjs` chạy ở S4 (cần dev server — làn của S4).
- [ ] **Step 6: Commit** — `git commit -m "test(so-do-can-chinh-don-vi): răng giữ hồ sơ, ranh giới, đột biến, màn thật"`.

---

### Task 6: Đóng S3

**independent: false**

- [ ] **Step 1:** `nice -n 10 bun run check-types && bun run lint && bun run lint:slop` — exit 0.
- [ ] **Step 2:** Sinh lại bản đồ (`product-map.mjs --root .`) nếu hồ sơ đổi trạng thái; contract `status: implemented`; commit; dispatch S4 bằng bộ đệm feature-loop 2.30.0 (xin lượt `s4` Điều phối M5).

---

## Thứ tự và làn

| # | Việc | Phục vụ | Phụ thuộc | Làn nặng |
|---|---|---|---|---|
| 1 | Khung vẽ `FlowMap` | E4, E11, E12 | — | `bun add` |
| 2 | Truy vấn `soDoDonVi` + bộ gieo | E1, E2, E3, E17 | — | — |
| 3 | Cách xem Sơ đồ | E4–E11 | 1, 2 | — |
| 4 | ~~B5~~ hoãn (Gate 1.5) | — | — | — |
| 5 | Răng | E12, E14–E16 | 1–4 | — |
| 6 | Đóng S3 | — | 1–5 | S4 |
