# Thẻ góp ý của Trợ lý OKR — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (T2, chạy tuần tự trong phiên chính theo feature-loop). Steps dùng checkbox.

**Goal:** Hộp sửa Mục tiêu/KR rộng ra khi cột góp ý mở, mỗi đề xuất là một thẻ xếp dọc với hàng nút ở chân và đúng một nút chính, dựng trên AI Elements `confirmation`; gợi ý thông tin của Cá nhân dùng cùng thẻ.

**Architecture:** `packages/ui` nhận ba thứ: `ai-elements/confirmation.tsx` (cài bằng CLI, vá theo `docs/design.md`), thành phần `ProposedChange` ghép từ nó (thay `Suggestion`), và cỡ `assist` của `Dialog`. `apps/app` chỉ đổi phần trình bày: `cot-gop-y.tsx` dựng thẻ bằng một hàm chuyển thuần `propsThe()`, thêm phím và «chỉ tới ô»; hai hộp dùng cỡ `assist`; khung chi tiết Mục tiêu mở hộp KR từ câu hỏi. Dữ liệu, API, tác tử không đổi.

**Tech Stack:** Next.js App Router, React 19, Radix Dialog, Tailwind v4, tRPC + TanStack Query, bun test + happy-dom/jsdom (`packages/ui/test/setup-dom.ts`), Playwright qua `tien-de.mjs` cho màn thật.

**Spec:** `docs/superpowers/specs/2026-09-29-the-gop-y-okr-design.md` · hợp đồng `_acceptance/the-gop-y-okr/contract.md` · phép đo `_acceptance/the-gop-y-okr/evals.yaml`.

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- `/packages/ui` là nguồn giao diện duy nhất; không `className` đổi màu, góc, khoảng cách của component `@crm/ui` tại chỗ gọi — cần biến thể thì thêm vào `packages/ui`.
- Chỉ `primary` và `destructive` được tô; mọi thẻ cần quyết có đúng một nút `variant="default"`; thẻ câu hỏi không có nút tô màu.
- Góc chỉ từ thang `rounded-sm|md|lg`; `rounded-full` của bản vendored đổi về thang và ghi sổ lệch chuẩn.
- Chữ trên màn đi qua `useMessages()` (packages/ui) hoặc `okrGopYMessages`/`crmMessages` (apps/app); tên truy cập giữ nguyên: Nhận · Sửa · Bác · Bỏ qua · Nhận bản đã sửa · Huỷ.
- Câu cũ, câu mới, dữ liệu người nhập mang `translate="no"`.
- Cài AI Elements bằng `bunx --bun ai-elements@latest add confirmation` từ `packages/ui`, không chép tay; tệp mới phải được `apps/**` với tới trong cùng thay đổi (cổng mồ côi).
- Hằng tinh chỉnh (bề ngang cột 380 px, mốc `lg`) sống ở token CSS `packages/ui/src/styles/globals.css`, không rải số.
- `bun test` trong `apps/app` chạy với `TZ=Asia/Ho_Chi_Minh`.

## Review Focus

1. Bấm «Sửa» làm nút rời cây trong lúc Radix đang xét «bấm ngoài» — hộp không được đóng (Task 2 ca `pointerdown` trên phần tử rời cây).
2. «Mở KR này» khi form Mục tiêu còn sửa chưa lưu — không được vứt thay đổi im lặng: nút khoá kèm lý do như nút Nhận (Task 4 ca khoá).
3. Phím J/K/Enter/E khi focus ở ô sửa của chính thẻ — gõ chữ «j», «e» không được chuyển thẻ hay mở sửa (Task 4 ca gõ trong ô sửa).
4. Câu đề xuất rất dài không dấu cách (URL) ở 390 px — không tràn ngang (Task 1 `wrap-anywhere` trên câu mới; E11 đo).
5. `FactSuggestion` khi `decideFact` lỗi — nút không kẹt ở trạng thái chờ (Task 5 ca lỗi, khẳng định nút bấm lại được).

---

### Task 1: ProposedChange trên AI Elements Confirmation

**Files:**
- Create (CLI): `packages/ui/src/components/ai-elements/confirmation.tsx`
- Create: `packages/ui/src/components/proposed-change.tsx`
- Modify: `packages/ui/src/lib/messages.ts` (khối `proposedChange`, giữ nguyên chữ của khối `suggestion` cũ)
- Modify: `_acceptance/nen-chat-ai-elements/so-lech-chuan.md` (mục `confirmation.tsx`, vân tay đo bằng răng)
- Modify (nếu răng chữ đòi): danh sách cho phép của `_acceptance/nen-chat-ai-elements/rang/chu-cung.mjs`
- Test: `packages/ui/test/proposed-change.dom.tsx` (nhãn `ba-tang`)

**Interfaces — Produces:**
```ts
export type ProposedChangeDecision = "accepted" | "dismissed" | "skipped";
export type ProposedChangeAction = {
  id: string; label: ReactNode; tone: "primary" | "secondary" | "quiet";
  onClick: () => void; disabled?: boolean; describedBy?: string;
};
export function ProposedChange(props: {
  kind: "rewrite" | "compact" | "question";
  label?: ReactNode;
  before?: ReactNode;
  value: ReactNode;
  rationale?: ReactNode;
  pending?: boolean;
  decided?: { decision: ProposedChangeDecision; text: ReactNode };
  error?: ReactNode;
  lockedReason?: ReactNode;
  editing?: { value: string; onChange: (v: string) => void; onAccept: () => void; onCancel: () => void };
  actions: ProposedChangeAction[];
  onPointerEnter?: () => void; onPointerLeave?: () => void;
  onFocus?: () => void; onBlur?: () => void; onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
  tabIndex?: number;
}): JSX.Element
```
`tone` ánh xạ: `primary→variant="default"`, `secondary→"outline"`, `quiet→"ghost"`; nút `quiet` luôn đứng cuối hàng (`ms-auto` trên nút `quiet` đầu tiên — lớp bố cục, không đổi kiểu). Gốc thẻ `data-slot="proposed-change"`, `data-kind`, `data-decided`. Thứ tự DOM: nhãn → `<del>` câu cũ → `<ins>` câu mới (hoặc `Textarea` khi `editing`) → lý do → khối `ConfirmationActions` → lý do khoá → `FieldError`.

- [ ] Step 1: Viết `proposed-change.dom.tsx` nhãn `ba-tang`: dựng `kind="rewrite"` với ba nút (primary Nhận, secondary Sửa, quiet Bác), khẳng định thứ tự DOM năm khối, hàng nút là anh em sau lý do, đúng một `button[data-variant=default]` tên «Nhận», «Sửa» outline, «Bác» ghost là nút cuối. Thông điệp ghim `nut chinh: <n> != 1`. (Props của ca E2 sẽ rút qua `propsThe()` ở Task 4 — Step 7 của Task 4 nối lại.)
- [ ] Step 2: `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/proposed-change.dom.tsx -t ba-tang` → đỏ vì chưa có tệp.
- [ ] Step 3: `cd packages/ui && bunx --bun ai-elements@latest add confirmation`; đọc diff; vá: bỏ kiểu `ToolUIPart` bắt buộc (nhận `state` là union chữ cục bộ), bán kính về thang, chữ qua `useMessages`. Chạy `node _acceptance/nen-chat-ai-elements/rang/so-lech-chuan.mjs`, chép số dòng khác + vân tay vào mục mới của sổ, ghi «Đổi gì / Vì sao».
- [ ] Step 4: Viết `proposed-change.tsx` ghép `Confirmation` + `ConfirmationRequest` + `ConfirmationActions` + `Button` + `Textarea` + `FieldError`; câu mới `text-sm` (14 px), câu cũ và lý do `text-xs`, `wrap-anywhere` trên câu.
- [ ] Step 5: Chạy lại Step 2 → xanh. Phá thử: đặt Sửa `tone:"primary"` trong một ca riêng của cùng tệp chạy trên bản sao → đỏ `nut chinh: 2 != 1`.
- [ ] Step 6: `bun run --filter=@crm/ui check-types`; commit `feat(ui): ProposedChange trên AI Elements Confirmation`.

**independent:** false · **phục vụ:** E2, E12 (một phần), E15

### Task 2: Cỡ `assist` của Dialog, ô được chỉ, và chặn đóng khi nút rời cây

**Files:**
- Modify: `packages/ui/src/styles/globals.css` (`--container-assist`, `--container-assist-rail: 380px`)
- Modify: `packages/ui/src/components/dialog.tsx` (`size?: "default" | "wide" | "table" | "assist"`; `onInteractOutside` bỏ qua sự kiện có đích đã rời cây)
- Modify: `packages/ui/src/components/input.tsx`, `textarea.tsx` (kiểu `data-[duoc-chi=true]:` viền nhấn bằng `ring`)
- Modify: `packages/ui/src/lib/utils.ts` (`laDichRoiCay(e)` cạnh `laTuThongBao`)
- Test: `packages/ui/test/dialog-assist.dom.tsx`

**Interfaces — Produces:** `DialogContent size="assist"` → `data-size="assist"`, lớp `lg:max-w-(--container-assist)`, dưới `lg` như `wide`. `laDichRoiCay(e: CustomEvent<{ originalEvent: Event }>): boolean`. Lớp thân hộp hai cột xuất từ `packages/ui` dưới tên `DIALOG_ASSIST_BODY = { single, split }` trong `dialog.tsx`, thay `LOP_THAN_HOP` của app.

- [ ] Step 1: Bài `dialog-assist.dom.tsx`: (a) `size="assist"` ra `data-size="assist"`; (b) một nút trong hộp tự gỡ khỏi DOM ở `pointerdown` rồi `click` — `onOpenChange(false)` không được gọi; (c) đối chứng: bấm lớp phủ khi không có sửa → đóng.
- [ ] Step 2: chạy → đỏ.
- [ ] Step 3: cài đặt; chạy → xanh; phá thử bỏ nhánh `laDichRoiCay` → ca (b) đỏ.
- [ ] Step 4: commit `feat(ui): cỡ hộp assist, ô được chỉ, không đóng khi nút rời cây`.

**independent:** false · **phục vụ:** E1, E8, E11, E16

### Task 3: Hai hộp dùng cỡ assist và nhận «ô được chỉ»

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx`, `hop-thoai-kr.tsx`
- Test: `apps/app/test/the-gop-y-okr.dom.tsx` (nhãn `co-hop`)

**Interfaces — Consumes:** `DIALOG_ASSIST_BODY`, `size="assist"`. **Produces:** mỗi ô viết lại được nhận `data-duoc-chi={gopY.oDuocChi === "<truong>" || undefined}`; hai hộp nhận prop tùy chọn `moKr?: (keyResultId: string) => void` (chỉ hộp Mục tiêu).

- [ ] Step 1: Tạo `the-gop-y-okr.dom.tsx` với bộ giả tRPC ghi lời gọi (chép khuôn từ `tro-ly-okr-gop-y.dom.tsx`), ca `co-hop`: cột đóng → `data-size` khác `assist`; cột mở → cả hai hộp `data-size="assist"`, cột nằm trong hộp. Thông điệp ghim `co hop kr`.
- [ ] Step 2: đỏ → sửa hai hộp → xanh; phá thử để hộp KR giữ `wide` → đỏ `co hop kr`.
- [ ] Step 3: commit.

**independent:** false · **phục vụ:** E16, E1, E11

### Task 4: Cột góp ý dựng bằng ProposedChange, phím, chỉ ô, «Mở KR này»

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx` (tách phần thẻ sang `the-gop-y.tsx` nếu tệp vượt 400 dòng)
- Create: `apps/app/app/(app)/[slug]/okr/the-gop-y-props.ts` (hàm thuần `propsThe()`, chỉ nhập kiểu và `okr-gop-y` messages)
- Modify: `apps/app/lib/messages/okr-gop-y.ts` (`dong.moKr`, `dong.khoaMoKr`, `dong.canChinh`)
- Modify: `apps/app/components/crm/record-sheet/objective-sheet.tsx` (`HanhDongMucTieu` giữ `hoi: … | { kr: string }`, dựng `HopThoaiKr` cho KR được mở)
- Test: `apps/app/test/the-gop-y-okr.dom.tsx` nhãn `sua-roi-nhan`, `mo-kr`, `can-chinh`, `chi-o`, `phim`, `khong-dong`, `trang-thai`; `packages/ui/test/proposed-change.dom.tsx` nối `propsThe()`

**Interfaces — Produces:**
```ts
export function propsThe(d: DongHien, ctx: {
  m: OkrGopYMessages; khoaNhan: string | undefined; dangGui: boolean;
  loi?: string; ket?: KetQuyet; coMoKr: boolean; khoaMoKr: boolean;
}): Omit<ProposedChangeProps, "editing" | "actions"> & { hanhDong: HanhDong[] }
type HanhDong = "nhan" | "sua" | "bac" | "bo-qua" | "can-chinh" | "mo-kr";
```
`useGopY` thêm `oDuocChi: TruongVietLai | null`, `chiO(t | null)`, `moKr?: (id) => void` truyền từ hộp. Phím gắn `onKeyDown` lên `<section data-cot-gop-y>`; bỏ qua khi đích là `textarea`/`input`.

- [ ] Step 1: Viết bảy ca trước (đỏ), theo đúng `expected` của E3–E9 trong `evals.yaml`; payload parse bằng `troLyQuyetInput` nhập từ `apps/api/src/okr/okr.contracts.ts`. E9 đọc bảng ST-thegopy-* từ design doc bằng đường suy từ `import.meta.dir`.
- [ ] Step 2: E8 bước đầu: chạy ca `khong-dong` «bấm Sửa» trên `cot-gop-y.tsx` của merge-base (bản sao ở `.acceptance-runs/the-gop-y-okr/`), ghi kết quả vào `evidence/E8-merge-base.txt`.
- [ ] Step 3: Cài đặt: thẻ viết lại (Nhận primary · Sửa outline · Bác quiet), căn chỉnh (Căn chỉnh primary · Bác quiet), câu hỏi (Mở KR này outline nếu gắn KR và có `moKr` · Bỏ qua quiet), đã quyết (thẻ gọn một dòng `decided`). «Mở KR này» khoá kèm `m.dong.khoaMoKr` khi `coSuaChuaLuu`.
- [ ] Step 4: `objective-sheet.tsx` nối `moKr`.
- [ ] Step 5: Chạy cả tệp → xanh; phá thử từng chiều đỏ ghim trong `expected` (mỗi chiều một bản sao ở `.acceptance-runs/the-gop-y-okr/sao-*`, không phá tại chỗ).
- [ ] Step 6: Nối `propsThe()` vào ca `ba-tang` (nhập tương đối từ `apps/app`), chạy lại Task 1 Step 2.
- [ ] Step 7: commit.

**independent:** false · **phục vụ:** E2–E9

### Task 5: Gợi ý thông tin của Cá nhân dùng ProposedChange gọn

**Files:** Modify `apps/app/components/crm/facts.tsx`; Test `apps/app/test/the-gop-y-okr.dom.tsx` nhãn `thong-tin`.

- [ ] Step 1: ca `thong-tin` theo E10 (parse bằng `factDecisionInput` từ `apps/api/src/contacts/contacts.contracts.ts`) + ca lỗi: `decideFact` trả lỗi thì hai nút bấm lại được. Đỏ.
- [ ] Step 2: `FactSuggestion` → `ProposedChange kind="compact"`, Nhận primary, Bác quiet. Xanh; phá thử đảo decision → `decideFact sai quyet`.
- [ ] Step 3: commit.

**independent:** true (với Task 4, chỉ chung Task 1) · **phục vụ:** E10

### Task 6: Gỡ Suggestion, dời thước cũ, sổ đăng ký

**Files:**
- Delete: `packages/ui/src/components/suggestion.tsx`; khối `suggestion` trong `messages.ts` (nếu không còn ai đọc)
- Modify: `packages/ui/test/suggestion.dom.tsx` → dời các ca còn giá trị sang `proposed-change.dom.tsx`, xoá tệp cũ
- Modify: `packages/ui/test/render-diff.spec.tsx`, `apps/app/test/tro-ly-okr-gop-y.dom.tsx`, `_acceptance/tro-ly-okr-de-xuat/rang/man-gop-y.mjs` (bám `data-slot="proposed-change"` thay `suggestion`, tên nút giữ nguyên)
- Modify: `docs/chat-ui.md` (register: `confirmation` Available → Adopted; bảng «in the tree today» thêm dòng; đếm Adopted 15, Available 6, in tree 5)
- Create: `_acceptance/the-gop-y-okr/rang/ten-goi.mjs` (dùng bộ giải của `mo-coi.mjs`)

- [ ] Step 1: viết `ten-goi.mjs` theo E12, chạy → đỏ `con export Suggestion`.
- [ ] Step 2: gỡ, dời thước, sửa register; chạy `ten-goi.mjs` → xanh; bản sao thêm lại export → đỏ.
- [ ] Step 3: chạy lại các bài của hồ sơ `tro-ly-okr-de-xuat` đã chạm (`tro-ly-okr-gop-y.dom.tsx`, `suggestion`/`render-diff`) → xanh.
- [ ] Step 4: commit.

**independent:** false · **phục vụ:** E12

### Task 7: Kịch bản lái màn thật

**Files:** Create `_acceptance/the-gop-y-okr/rang/man-the-gop-y.mjs` (dựng lại từ `_acceptance/tro-ly-okr-de-xuat/rang/man-gop-y.mjs`).

- [ ] Step 1: viết đo E1 (1440, hai hộp, bốn số), E11 (390, 1024, 1023), E13 (luồng model thật, một `role=dialog` sau mỗi cú bấm, đọc lại qua API, tab Vết), chụp `evidence/E1-*.png`, `E11-*.png`, `E13-*.png`; ba chiều đỏ `--kiem-do-do`.
- [ ] Step 2: chạy `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/the-gop-y-okr/rang/man-the-gop-y.mjs"` → xanh; chạy `--kiem-do-do` → đỏ đúng thông điệp.
- [ ] Step 3: commit.

**independent:** false · **phục vụ:** E1, E11, E13, E14 (ảnh)

### Task 8: Năm lệnh chứng

- [ ] `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build` — cả năm thoát 0; ghi đầu ra vào `.acceptance-runs/the-gop-y-okr/s3-cong.txt`. Rồi contract `status: implemented`.

**phục vụ:** E15 và cổng kho
