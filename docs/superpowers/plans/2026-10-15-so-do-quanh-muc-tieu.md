# Sơ đồ quanh một mục tiêu — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Từ ngăn chi tiết mục tiêu bấm «Xem quanh mục tiêu» mở trang sơ đồ: đường góp lên tới KR công ty, KR của mục tiêu và ai góp vào nó, mỗi mục tiêu một thẻ, rê chuột làm nổi đường đi.

**Architecture:** Truy vấn tRPC `okr.quanhMucTieu` gọi hàm thuần `gopQuanhMucTieu(mts, tamId)` trên đúng tập `mucTieuCuaCay` (đã lọc quyền, gộp kỳ cha/con). Trang `/<slug>/okr/quanh-muc-tieu/<id>` vẽ bằng `FlowMap` của DH4 (`focusId` + `centerId` = tâm), dưới md thành danh sách bốn nhóm. Ngăn chi tiết thêm một nút liên kết.

**Tech Stack:** NestJS + nestjs-trpc + zod (apps/api), Next.js App Router + React Query + `@crm/ui` FlowMap (React Flow 12 + dagre), bun test + happy-dom.

**Spec:** `docs/superpowers/specs/2026-10-15-so-do-quanh-muc-tieu-design.md` · hợp đồng `_acceptance/so-do-quanh-muc-tieu/contract.md` (đã ký 59f9e0aed) · evals `_acceptance/so-do-quanh-muc-tieu/evals.yaml`.

## Global Constraints

- Không sửa `packages/ui/src/components/flow-map.tsx`, `packages/ui/src/lib/flow-layout.ts`, `apps/api/src/okr/can-chinh.ts`, `apps/app/lib/messages/okr.ts`, `apps/app/lib/search-param-keys.ts`, Toàn cảnh, tệp gieo `apps/api/scripts/okr-mau/*`.
- Chỉ sửa tệp trong mục Ranh giới của `## Notes` hợp đồng; tệp «chỉ thêm» không xoá dòng nào.
- Chữ ở `apps/app/lib/messages/okr-quanh.ts`, đủ `vi` và `en` khác nhau; tên mục tiêu, KR, đơn vị mang `translate="no"`.
- Câu ca rỗng: «Không thấy đường lên công ty trong phạm vi bạn xem được.» — không câu nào nhắc tới mục tiêu ẩn.
- Phía trên đi lên tới hết; phía dưới đúng một bậc; mỗi id đúng một nút; đích căn chỉnh ngoài tập đọc được bị bỏ hẳn.
- Cạnh truyền FlowMap `kind: "lien"` cho mọi cạnh (nét đứt mang nghĩa khác ở DH4).
- Đường dẫn trong test/rang suy từ vị trí tệp (`import.meta.dir`, `fileURLToPath`), không hardcode.

## Review Focus

- Mục tiêu tâm ở kỳ con, KR công ty ở kỳ cha — `gopLenCongTy` phải có KR ấy (ca CSDL E1).
- Mục tiêu giới hạn phía trên — tên không lộ, `gopLenCongTy` rỗng (ca CSDL E3).
- Vòng góp X↔Y — hàm không lặp vô hạn (ca thuần E2).
- Tâm có cả căn chỉnh KR lẫn mục tiêu tới cùng mục tiêu công ty — một thẻ cho mục tiêu công ty, hai mục trong dòng góp lên (E1, E5).
- Tên mục tiêu rất dài — `line-clamp-2` + `min-w-0`, trang 390 không cuộn ngang (E12).

---

### Task 1: Truy vấn `okr.quanhMucTieu` (E1, E2, E3) — independent: false (Task 2, 3 dùng kiểu)

**Files:**
- Create: `apps/api/src/okr/quanh-muc-tieu.ts`
- Modify (chỉ thêm): `apps/api/src/okr/okr-xem.contracts.ts`, `apps/api/src/okr/okr-xem.service.ts`, `apps/api/src/okr/okr.router.ts`
- Regenerate: `apps/api/src/generated/server.ts` (lệnh sinh kiểu tRPC của kho — cùng lệnh DH4 dùng ở commit `83c4be0a5`)
- Test: `apps/api/test/okr-quanh-muc-tieu.spec.ts`

**Interfaces — Produces:**
```ts
// okr-xem.contracts.ts
export const quanhMucTieuInput = z.object({ objectiveId: ma });
const nutQuanh = z.object({
  id: z.string(), loai: z.enum(["muc-tieu", "kr"]), phia: z.enum(["tam", "tren", "duoi"]),
  tieuDe: z.string(), donVi: z.string(), congTy: z.boolean(), tienDo: z.number(),
  mucTieuId: z.string(), // KR: mục tiêu chủ; mục tiêu: chính nó
});
const canhQuanh = z.object({ tu: z.string(), den: z.string(), loai: z.enum(["cua", "gop"]) });
const gopLen = z.object({
  kr: z.object({ id: z.string(), tieuDe: z.string() }).nullable(),
  mucTieu: z.object({ id: z.string(), tieuDe: z.string() }),
});
export const quanhMucTieuOutput = z.object({
  tamId: z.string(), laCongTy: z.boolean(), nut: z.array(nutQuanh), canh: z.array(canhQuanh),
  gopLenCongTy: z.array(gopLen),
});
export type QuanhMucTieuOutput = z.infer<typeof quanhMucTieuOutput>;
// quanh-muc-tieu.ts
export function gopQuanhMucTieu(mts: readonly MucTieuOutput[], tamId: string): QuanhMucTieuOutput | null;
// okr-xem.service.ts
async quanhMucTieu(userId: string, objectiveId: string): Promise<QuanhMucTieuOutput>; // NOT_FOUND khi null
```

- [ ] **Step 1: Bài đỏ.** `okr-quanh-muc-tieu.spec.ts` theo khung `okr-so-do-don-vi.spec.ts` (`dungUngDung`, `batDauMau`, `napCaSoDo`, `phienMau`, `goi`). Ba `describe`: `dh5-len` (ma trận bốn tâm sd-a1-1, sd-a3-1, n1, sd-b-1 bằng `mtSoDo(...)` / `idMau("mt","n1")`, `idMau("kr","n1-k1")`; ca kỳ cha dựng trong `beforeAll` bằng `db.okrObjective.create` + `okrKeyResult.create` + `okrAlignment.create` với `cycleId` = kỳ năm (`idMau("chu-ky","nam")`) cho NY, kỳ quý cho BQ, PQ); `dh5-xuong` (hàm thuần trên `mucTieuThuan` + một ca CSDL tâm sd-a-1); `dh5-quyen` (NGUOI_XEM_HEP; ca GT phía trên dựng trong `beforeAll` với `hienThi: "gioi-han"` theo cách `napCaSoDo` dựng sd-g). Mỗi assert phủ định in đúng thông điệp ghim của evals (`'nut lap: <id>'`, `'kr ngoai duong: n1-k2'`, `'xuong qua mot bac: D'`, `'vong gop lap nut'`, `'lo ten muc tieu gioi han'`, `'lo muc tieu gioi han phia tren'`, `'ngoai tap cay: <id>'`, `'mat duong len ky cha'`) qua `throw new Error(...)` trước `expect`.
- [ ] **Step 2: Chạy, xác nhận đỏ.** `bun run test -- "cd apps/api && bun test test/okr-quanh-muc-tieu.spec.ts"` → FAIL (thiếu `okr.quanhMucTieu`).
- [ ] **Step 3: Hàm thuần.**
```ts
import type { MucTieuOutput } from "./okr.contracts";
import type { QuanhMucTieuOutput } from "./okr-xem.contracts";

type Nut = QuanhMucTieuOutput["nut"][number];
type Canh = QuanhMucTieuOutput["canh"][number];

export function gopQuanhMucTieu(mts: readonly MucTieuOutput[], tamId: string): QuanhMucTieuOutput | null {
  const mt = new Map(mts.map((m) => [m.id, m]));
  const tam = mt.get(tamId);
  if (!tam) return null;
  const chuKr = new Map(mts.flatMap((m) => m.keyResults.map((k) => [k.id, m] as const)));
  const nut = new Map<string, Nut>();
  const canh = new Map<string, Canh>();
  const congTy = (m: MucTieuOutput) => m.level === "onehub";
  const themMt = (m: MucTieuOutput, phia: Nut["phia"]) => {
    if (!nut.has(m.id)) nut.set(m.id, { id: m.id, loai: "muc-tieu", phia, tieuDe: m.title, donVi: m.unitName, congTy: congTy(m), tienDo: m.progress, mucTieuId: m.id });
  };
  const themKr = (k: MucTieuOutput["keyResults"][number], m: MucTieuOutput, phia: Nut["phia"]) => {
    if (!nut.has(k.id)) nut.set(k.id, { id: k.id, loai: "kr", phia, tieuDe: k.title, donVi: m.unitName, congTy: congTy(m), tienDo: k.progress, mucTieuId: m.id });
  };
  const noi = (tu: string, den: string, loai: Canh["loai"]) => canh.set(`${tu}->${den}`, { tu, den, loai });
  const gopLen: QuanhMucTieuOutput["gopLenCongTy"] = [];
  const daGop = new Set<string>();
  const ghiGop = (kr: { id: string; tieuDe: string } | null, p: MucTieuOutput) => {
    const khoa = kr?.id ?? p.id;
    if (!congTy(p) || daGop.has(khoa)) return;
    daGop.add(khoa);
    gopLen.push({ kr, mucTieu: { id: p.id, tieuDe: p.title } });
  };

  themMt(tam, "tam");
  const tren = new Set<string>([tam.id]);
  const hang = [tam];
  while (hang.length > 0) {
    const x = hang.shift() as MucTieuOutput;
    for (const a of x.alignments) {
      const k = a.targetKeyResultId ? chuKr.get(a.targetKeyResultId) : undefined;
      if (a.targetKeyResultId && k) {
        const kr = k.keyResults.find((r) => r.id === a.targetKeyResultId);
        if (!kr) continue;
        themMt(k, "tren"); themKr(kr, k, "tren");
        noi(k.id, kr.id, "cua"); noi(kr.id, x.id, "gop");
        ghiGop({ id: kr.id, tieuDe: kr.title }, k);
        if (!tren.has(k.id)) { tren.add(k.id); hang.push(k); }
        continue;
      }
      const p = a.targetKeyResultId ? undefined : mt.get(a.targetObjectiveId ?? "");
      if (!p) continue; // đích ngoài tập đọc được → bỏ hẳn
      themMt(p, "tren"); noi(p.id, x.id, "gop"); ghiGop(null, p);
      if (!tren.has(p.id)) { tren.add(p.id); hang.push(p); }
    }
  }
  const krTam = new Set(tam.keyResults.map((k) => k.id));
  for (const k of tam.keyResults) { themKr(k, tam, "duoi"); noi(tam.id, k.id, "cua"); }
  for (const c of mts) {
    if (c.id === tam.id || tren.has(c.id)) continue;
    for (const a of c.alignments) {
      const den = a.targetKeyResultId && krTam.has(a.targetKeyResultId) ? a.targetKeyResultId
        : !a.targetKeyResultId && a.targetObjectiveId === tam.id ? tam.id : null;
      if (!den) continue;
      themMt(c, "duoi"); noi(den, c.id, "gop");
    }
  }
  return { tamId: tam.id, laCongTy: congTy(tam), nut: [...nut.values()], canh: [...canh.values()], gopLenCongTy: congTy(tam) ? [] : gopLen };
}
```
  Kiểm khi viết: căn chỉnh tới KR ghi cả `targetObjectiveId` lẫn `targetKeyResultId`? (đọc `canhCuaCay`: `a.targetKeyResultId ?? a.targetObjectiveId`) — nhánh KR đi trước nên đúng cả hai cách ghi.
- [ ] **Step 4: Service + router.** `okr-xem.service.ts`: `const o = await this.db.okrObjective.findUnique({ where: { id: objectiveId }, select: { cycleId: true } }); if (!o) throw new NotFoundException(...)`; `const { mts } = await this.okr.mucTieuCuaCay(userId, o.cycleId); const kq = gopQuanhMucTieu(mts, objectiveId); if (!kq) throw new NotFoundException(...)`. Router: `@Query({ input: quanhMucTieuInput, output: quanhMucTieuOutput, meta: restMeta("GET", "/okr/objective-map", TAG) }) quanhMucTieu(@Ctx() ctx, @Input() input) { return this.xem.quanhMucTieu(ctx.user.id, input.objectiveId); }` ngay sau `soDoDonVi`. Sinh lại `generated/server.ts`.
- [ ] **Step 5: Xanh.** Lệnh Step 2 → PASS cả ba describe; `bun run typecheck` (lọc api) xanh.
- [ ] **Step 6: Commit** `feat(okr): truy vấn quanhMucTieu — đường lên tới KR công ty, một bậc xuống, lọc quyền`.

### Task 2: Trang sơ đồ quanh mục tiêu (E5–E10, E11) — independent: false (cần Task 1)

**Files:**
- Create: `apps/app/lib/messages/okr-quanh.ts`, `apps/app/app/(app)/[slug]/okr/quanh-muc-tieu/[objectiveId]/page.tsx`, `.../quanh-muc-tieu/quanh-muc-tieu.tsx`, `.../quanh-muc-tieu/the-quanh.tsx`
- Modify (chỉ thêm, khi bài bắt): `apps/app/test/messages-guard.spec.ts`
- Test: `apps/app/test/okr-quanh-muc-tieu.dom.tsx`

**Interfaces — Consumes:** `quanhMucTieuOutput`, `gopQuanhMucTieu` (Task 1); `FlowMap`, `FlowMapNode`, `FlowMapCard`, `pathAround` từ `@crm/ui`; `useOpenRecord` (`{ kind: "objective" | "kr", id }`); `useIsMobile`. **Produces:** `okrQuanhMessages(locale)` với khoá `tieuDe, moTa, dangXemQuanh, gopLenQuaKr(kr, mt), gopLenThang(mt), laCongTy, chuaLenCongTy, chuThich, congTy, dangTai, loiTieuDe, loiMoTa, thuLai, khongThay, veToanCanh, nhom: { gopVao, tam, kr, gopVaoNo }, nhanKhung, nutXemQuanh`; `QuanhMucTieu({ objectiveId })`; `TheQuanh({ nut, laTam, onMo })`.

- [ ] **Step 1: Bài đỏ** `okr-quanh-muc-tieu.dom.tsx` theo khung `okr-so-do-don-vi.dom.tsx` (mock `@/lib/trpc/client` với `okr.quanhMucTieu.queryOptions`, `next/navigation` slug `ws`, `record-stack` ghi `moBanGhi`); dữ liệu sinh `quanhMucTieuOutput.parse(gopQuanhMucTieu(mtsThuan, tam))` với `mtsThuan` dựng bằng `mucTieuThuan` (n1 với KR n1-k1, n1-k2; sd-a-1 góp n1-k1; sd-a1-1 góp sd-a-1; sd-a3-1 góp sd-a-1 và n1; sd-b-1 không góp). Bảy `describe`: `dh5-so-do`, `dh5-ro-chuot`, `dh5-bam`, `dh5-hep`, `dh5-trang-thai`, `dh5-chu`, và `dh5-loi-vao` (Task 3). Hằng thông điệp ghim: `'thieu nhan cong ty: <id>'`, `'kr cong ty thua: n1-k2'`.
- [ ] **Step 2: Đỏ.** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-quanh-muc-tieu.dom.tsx` → FAIL (thiếu mô-đun).
- [ ] **Step 3: Chữ** `okr-quanh.ts` theo khuôn `okr-toan-canh.ts` (`const vi = {...}; const en: typeof vi = {...}; export const okrQuanhMessages = (l) => (l === "en" ? en : vi)`); câu vi: «Sơ đồ quanh mục tiêu», «Phía trên là những gì mục tiêu này góp vào, phía dưới là KR của nó và những mục tiêu góp vào nó.», «Đang xem quanh:», «Góp lên công ty qua KR «{kr}» của mục tiêu «{mt}»», «Góp thẳng vào mục tiêu công ty «{mt}»», «Đây là mục tiêu cấp công ty», «Không thấy đường lên công ty trong phạm vi bạn xem được.», chú thích ba câu của thiết kế, «Công ty», «Đang tải sơ đồ…», «Không tải được sơ đồ», «Không tìm thấy mục tiêu này, hoặc bạn không có quyền xem.», «Về Toàn cảnh», nhóm «Góp vào» · «Mục tiêu này» · «KR của nó» · «Góp vào nó», «Xem quanh mục tiêu».
- [ ] **Step 4: `the-quanh.tsx`.** `TheQuanh` dùng `FlowMapCard active={laTam}` bọc nút `<button type="button">` (focus-visible ring) với `data-quanh-the={nut.id}`; tên `<span translate="no" className="line-clamp-2 min-w-0">`; đơn vị `translate="no"`; thanh tiến độ của kho (cùng thành phần `TienDoMucTieuGon`/`Progress` mà `the-don-vi.tsx` dùng); `nut.congTy` → `<Badge variant="secondary" data-cong-ty>{m.congTy}</Badge>`. `onClick`/Enter/Space → `onMo()`; thẻ KR nhỏ hơn (`QUANH.the.kr`).
- [ ] **Step 5: `quanh-muc-tieu.tsx`.** `useQuery(trpc.okr.quanhMucTieu.queryOptions({ objectiveId }))`; đang chạy → khung xương `aria-busy` + `<span className="sr-only">{m.dangTai}</span>`; lỗi `NOT_FOUND` (`error.data?.code`) → câu `khongThay` + `<Link href={`/${slug}/okr/toan-canh`}>`; lỗi khác → `VungTaiLoi` + `refetch`. Có dữ liệu: dòng `dangXemQuanh` + tên tâm; khối `data-gop-len-cong-ty` (mỗi mục một `<span data-gop-len-muc data-kr={kr?.id ?? ""} data-muc-tieu={mucTieu.id}>`); `laCongTy` → câu `laCongTy`; rỗng → `chuaLenCongTy`. `useIsMobile()` → danh sách bốn nhóm `data-quanh-danh-sach` / `data-nhom` theo thứ tự [gop-vao (sắp `congTy` trước, rồi theo độ sâu BFS), tam, kr, gop-vao-no], `Item variant="outline"`; ngược lại `FlowMap` cao `QUANH.khung.caoPx` (600) với `nodes` từ `layout` mặc định của FlowMap (vị trí 0,0 + kích thước), `edges` `{ id: `${tu}->${den}`, source: tu, target: den, data: { kind: "lien" } }`, `focusId={tamId}`, `centerId={tamId}`, `label={m.nhanKhung}`, `nodeTypes={{ "quanh": NutQuanhVe }}`. Hằng `QUANH` ở `quanh-muc-tieu.tsx`.
- [ ] **Step 6: `page.tsx`.** Như `toan-canh/page.tsx`: `generateMetadata` từ `okrQuanhMessages(await getLocale()).tieuDe`; `PageShell` › `PageShellHeader` › `PageShellHeading` (`PageShellTitle` = tieuDe, `PageShellDescription` = moTa) › thân `<QuanhMucTieu objectiveId={objectiveId} />` trong `Suspense`.
- [ ] **Step 7: Xanh** lệnh Step 2 cho sáu describe của Task 2; `bun test ./test/messages-guard.spec.ts` trong apps/app; sàn thiết kế `config:executors.script.dh5_san_thiet_ke` (thêm khoá ở Task 4 trước khi chạy, hoặc chạy tay `design-gate.mjs --target <tệp> --mode static`).
- [ ] **Step 8: Commit** `feat(okr): trang Sơ đồ quanh mục tiêu — dòng góp lên công ty, thẻ, rê chuột, danh sách hẹp`.

### Task 3: Nút «Xem quanh mục tiêu» trong ngăn chi tiết (E4) — independent: false (cần chữ Task 2)

**Files:** Modify (chỉ thêm): `apps/app/components/crm/record-sheet/objective-sheet.tsx` · Test: `apps/app/test/okr-quanh-muc-tieu.dom.tsx` (describe `dh5-loi-vao`).

- [ ] **Step 1: Bài đỏ** dựng `ObjectiveSheet` như `muc-tieu-va-kr.dom.tsx` (mock `okr.objective`, `okr.comments`), tìm `a` có chữ `nutXemQuanh`, `href === "/ws/okr/quanh-muc-tieu/<id>"`; `[data-khu=gop-vao]` đủ dòng; NOT_FOUND → không có nút.
- [ ] **Step 2: Đỏ** (lệnh Task 2 Step 2, `-t dh5-loi-vao`).
- [ ] **Step 3: Thêm** một thành phần `NutXemQuanh({ id })` cuối tệp (chỉ thêm) và một dòng `<NutXemQuanh id={mt.id} />` trong `actions` trước `<NutTheoDoi mt={mt} />`: `<Button asChild size="sm" variant="outline"><Link href={`/${slug}/okr/quanh-muc-tieu/${id}`}><Icon icon={<icon sơ đồ của kho>} data-icon="inline-start" />{m.nutXemQuanh}</Link></Button>`; `slug` lấy theo cách các liên kết khác trong `record-sheet/` lấy (đọc trước khi viết: `grep -rn "useParams" apps/app/components/crm/record-sheet`).
- [ ] **Step 4: Xanh** `-t dh5-loi-vao` + `config:executors.test.mtkr_sheet` (bài ngăn của hồ sơ đã ký).
- [ ] **Step 5: Commit** `feat(okr): ngăn chi tiết mục tiêu có nút Xem quanh mục tiêu`.

### Task 4: Răng và khoá lệnh (E11–E15) — independent: false (cần Task 1–3)

**Files:** Modify (chỉ thêm): `_acceptance/config.yaml` · Create: `_acceptance/so-do-quanh-muc-tieu/rang/{giu-ho-so.mjs, ranh-gioi.mjs, dot-bien.mjs, man.mjs, ca-man.json}`.

- [ ] **Step 1: Khoá lệnh** trong `executors.test` (kề `dh4_*`): `dh5_len`, `dh5_xuong`, `dh5_quyen` (`bun run test -- "cd apps/api && bun test test/okr-quanh-muc-tieu.spec.ts -t <tên>"`); `dh5_loi_vao`, `dh5_so_do`, `dh5_ro_chuot`, `dh5_bam`, `dh5_hep`, `dh5_trang_thai`, `dh5_chu` (lệnh DOM như dh4, `dh5_chu` kèm `&& bun test ./test/messages-guard.spec.ts`). `executors.script`: `dh5_san_thiet_ke` (vòng for bốn tệp như `mtkr_san_thiet_ke`), `dh5_giu_ho_so`, `dh5_ranh_gioi`, `dh5_dot_bien`, `dh5_man` (bọc `mot-luot.sh` như `dh4_man`).
- [ ] **Step 2: Rang** chép từ `_acceptance/so-do-can-chinh-don-vi/rang/` rồi đổi: SLUG; mốc so sánh = điểm gộp DH4 gần nhất (`git merge-base HEAD feat/so-do-can-chinh-don-vi` khi nhánh còn, sau khi DH4 gộp onehub thì `git merge-base HEAD origin/onehub`); tệp cấm thêm `flow-map.tsx`, `flow-layout.ts`; đối chứng dương `objective-sheet.tsx` → `muc-tieu-va-kr#E8`. `dot-bien.mjs` tám đột biến (a)–(h) đúng bảng E15, mỗi đột biến là một `replace` chuỗi duy nhất trên bản sao `git archive HEAD apps packages`, kiểm chuỗi gốc có mặt trước khi thay (không có thì exit 1 «dot bien khong ap duoc»). `man.mjs` theo `dh4 man.mjs`: phiên đo riêng, mở `?record=objective:<sd-a1-1>`, bấm nút thật, kiểm dòng, rê chuột, 390.
- [ ] **Step 3: Chạy** từng lệnh `dh5_*` (trừ `dh5_man` — chạy ở S4 trong làn nặng): xanh; `dh5_dot_bien` in tám `DO DUNG`.
- [ ] **Step 4: Commit** `test(so-do-quanh-muc-tieu): răng giữ hồ sơ, ranh giới, đột biến, màn thật`.

### Task 5: Tài liệu (không eval) — independent: true

- [ ] `docs/api.md`: thêm dòng `okr.quanhMucTieu` (GET `/okr/objective-map`) cạnh `okr.soDoDonVi`. Commit cùng Task 4.

## Thứ tự

Task 1 → Task 2 → Task 3 → Task 4 (+5) → `status: implemented` → S4. Trước Task 1: gộp nhánh DH4 mới nhất (`git merge feat/so-do-can-chinh-don-vi`) và `bun install`.
