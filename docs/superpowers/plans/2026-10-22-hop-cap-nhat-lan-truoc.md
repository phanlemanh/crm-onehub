# HT3 · Hộp cập nhật hiện lần trước — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hộp cập nhật KR hiện khối «Lần cập nhật trước» (ngày giờ, số, mức tự tin, ghi chú) và ba câu hỏi gợi ý dưới ô ghi chú.

**Architecture:** Hai hàm thuần (`lan-truoc-kr.ts`) rút lần trước từ vết của `okr.objective` và ghi chú từ `okr.dienBien` cùng tuần VN. Một component khách (`khoi-lan-truoc.tsx`) vẽ khối bằng `Item` + `StatusIndicator`; `hop-thoai-cap-nhat-kr.tsx` nhận prop `lanTruoc` từ `cap-nhat-kr.tsx`. Không đổi API.

**Tech Stack:** Next.js app (`apps/app`), React Query + tRPC client, bun test (DOM qua `khung-gop-y-dung-cho.tsx`, API qua `okr-san.ts`).

**Spec:** `docs/superpowers/specs/2026-10-22-hop-cap-nhat-lan-truoc-design.md` · hợp đồng `_acceptance/hop-cap-nhat-lan-truoc/contract.md` · evals `_acceptance/hop-cap-nhat-lan-truoc/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (`AGENTS.md`).
- Chữ mới chỉ ở `apps/app/lib/messages/okr-lan-truoc.ts` (vi + en, một hàm `okrLanTruocMessages`); không sửa dòng nào của `okr.ts`.
- Thành phần UI chỉ từ `@crm/ui`; không `className` đổi màu, góc, khoảng cách của component `@crm/ui`.
- Giờ VN `Asia/Ho_Chi_Minh`; định dạng ngày giờ khối `dd/mm, HH:mm` (ví dụ `15/10, 09:30`).
- Ghi chú và dữ liệu người nhập mang `translate="no"`.
- Ô ghi chú: `<input>`, `maxLength` = `GHI_CHU_TOI_DA` (200).
- Tên ca kiểm đúng như `evals.yaml`: `hct-khoi`, `hct-rong`, `hct-moi-nhat`, `hct-sau-gui`, `hct-goi-y`, `hct-tai`.
- Không chạy cả bộ kiểm (máy đang áp lực bộ nhớ): chạy theo tệp/ca.

## Review Focus

- Ghi chú lần trước có dấu `<`, `&`, emoji hay 200 ký tự liền không khoảng trắng → hiện nguyên văn, xuống dòng (`break-words`), không tràn — ca E1 dùng chuỗi có dấu và E7 chuỗi 200 ký tự.
- Vết có `after.currentValue` không parse được (dữ liệu cũ) → `lanTruocTuVet` trả số `null`, khối vẫn hiện ngày và mức tự tin, không ném — thêm ô vào E2.
- KR mốc: `dienBien.diem[].giaTri` luôn `null`; số phải lấy từ vết, không từ điểm — ô mốc của E1 và E3.
- Hộp mở lại cho KR khác trong cùng phiên (khoá `key={hop.lan}`) → khối là của KR mới, không giữ ghi chú cũ — E4 mở cùng KR; ca KR khác do khóa truy vấn theo `keyResultId`.
- Lần gửi 00:30 thứ Hai giờ VN → ghép đúng tuần — E3 ô biên.

---

### Task 1: Hàm thuần rút lần trước + bài kiểm API (E3)

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/lan-truoc-kr.ts`
- Create: `apps/api/test/hop-cap-nhat-lan-truoc.spec.ts`

**Interfaces:**
- Produces:
  - `export type LanTruocKr = { luc: string; giaTri: number | null; tuTin: MucTuTin | null }`
  - `export function lanTruocTuVet(trail: readonly VetDong[], keyResultId: string): LanTruocKr | null` — dòng `action === "cap-nhat-tuan"` mới nhất theo `at` (bằng nhau thì dòng sau trong mảng); `giaTri` = `soKr.safeParse(after.currentValue)`, `tuTin` = `mucCapNhat.shape.confidence.safeParse(after.confidence)`.
  - `export function tuanVN(luc: string): string` — `YYYY-MM-DD` thứ Hai của tuần VN chứa `luc`, cùng phép tính với `dauTuanVN` (`packages/db/src/onboarding-nhac.ts:151`) dựa trên `homNayVN`.
  - `export function ghiChuLanTruoc(diem: readonly { tuan: string; ghiChu: string | null }[], luc: string): string | null` — `ghiChu` của điểm có `tuan === tuanVN(luc)`, không có thì `null`.
  - `VetDong` = `RouterOutputs["okr"]["objective"]["trail"][number]` (chỉ dùng `action`, `keyResultId`, `at`, `after`).

- [ ] **Step 1: Viết `hct-moi-nhat`** theo E3: CSDL thử, phiên qua `okr.moCapNhat`/`okr.guiCapNhat` (helper `goi`, `phienCua` của `okr-san.ts`); KR K ba lần (40 cao "A"; 50 vua ""; trưởng phòng ghi hộ 55 thap "C"); KR mốc M (0 vua "X"; 1 cao "Y"); KR B ghi qua `OkrCapNhatService` với `now = new Date("2026-10-18T17:30:00Z")`, ghi chú "Bien". Đọc `okr.objective` + `okr.dienBien`, so `lanTruocTuVet` + `ghiChuLanTruoc` với hàng `OkrCheckIn` mới nhất (`orderBy [{createdAt:"desc"},{id:"desc"}]`, `include session`). Đối chứng dương sau lần hai của K: `(50, "vua", null)`. Thông điệp ghim: `hct-moi-nhat: K lech (gia tri <x>, can <y>)`, `hct-moi-nhat: K ghi chu lech`, `hct-moi-nhat: B mat ghi chu o bien tuan`.
- [ ] **Step 2: Chạy, thấy đỏ vì chưa có module** — `bun run test -- "cd apps/api && bun test test/hop-cap-nhat-lan-truoc.spec.ts -t hct-moi-nhat"`.
- [ ] **Step 3: Viết `lan-truoc-kr.ts`** theo Interfaces.
- [ ] **Step 4: Chạy lại, xanh.**
- [ ] **Step 5: Phá-thử ba chiều đỏ** trên bản sao (lấy dòng đầu; ghép theo điểm cuối có ghi chú; tuần theo UTC) — mỗi chiều đỏ đúng câu ghim; hoàn lại.
- [ ] **Step 6: Commit** `feat(hop-cap-nhat-lan-truoc): rút lần cập nhật trước từ vết và diễn biến`.

independent: false · phục vụ E3 (AC-3).

### Task 2: Khối «Lần cập nhật trước» trong hộp (E1, E2, E6)

**Files:**
- Create: `apps/app/lib/messages/okr-lan-truoc.ts`
- Create: `apps/app/app/(app)/[slug]/okr/khoi-lan-truoc.tsx`
- Modify: `apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx` (prop `lanTruoc: LanTruocKr | null`, khối đầu `FieldGroup`; `OGiaTri` nhận `lan={null}` khi có khối)
- Modify: `apps/app/app/(app)/[slug]/okr/cap-nhat-kr.tsx` (truyền `lanTruoc={lanTruocTuVet(hop.mt.trail, hop.kr.id)}`)
- Create: `apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx`

**Interfaces:**
- Consumes: Task 1 (`LanTruocKr`, `lanTruocTuVet`, `ghiChuLanTruoc`).
- Produces:
  - `okrLanTruocMessages(locale)` → `{ tieuDe: string; luc: (ngay: string, gio: string) => string; loiGhiChu: string; thuLai: string; goiY: readonly [string, string, string] }`. vi: `tieuDe` «Lần cập nhật trước», `loiGhiChu` «Không tải được ghi chú lần trước.», `thuLai` «Thử lại», `goiY` theo Hỏi-1 đã duyệt: «Điều ghi lần trước đã xong chưa?», «Đang vướng gì, cần ai giúp?», «Tuần tới làm gì?».
  - `export function KhoiLanTruoc({ kr, lan }: { kr: KrCapNhat; lan: LanTruocKr })` — `Item variant="outline" size="sm" data-lan-truoc`; số `data-lan-truoc-so` qua `giaTri(kr, so, locale)` của `bang-kr.tsx`; `StatusIndicator` tone `toneTheoNghia(NGHIA_TU_TIN[muc])`; ghi chú `data-ghi-chu-truoc` trong `translate="no"`; đang tải `Skeleton data-ghi-chu-truoc-cho`; lỗi: câu `loiGhiChu` + `Button variant="outline" size="sm"` gọi `refetch`. Truy vấn `trpc.okr.dienBien.queryOptions({ keyResultId })`.

- [ ] **Step 1: Viết `hct-khoi`, `hct-rong`, `hct-tai`** theo E1, E2, E6 (ma trận viết trước, đếm số ô đã chạy, thông điệp ghim như evals). Dựng qua `useCapNhatKr` như `ngan-kr-mot-cho.dom.tsx` (`ThuHook`, `kho.rieng.set("okr.dienBien", …)` parse bằng `dienBienOutput`). Thêm ô Review Focus: vết có `currentValue` là chuỗi hỏng → khối có ngày, không có `[data-lan-truoc-so]`, không ném.
- [ ] **Step 2: Chạy ba ca, thấy đỏ.**
- [ ] **Step 3: Viết tệp chữ, `KhoiLanTruoc`, nối vào hộp và `cap-nhat-kr.tsx`.**
- [ ] **Step 4: Chạy ba ca, xanh.** Chạy lại các ca đã ký đụng hộp: `ngan-kr-mot-cho.dom.tsx -t "vk7-cap-nhat-ngan|vk7-xem-truoc|vk7-tren-dong|vk7-ba-bam"` và `okr-sheet.dom.tsx` — phải xanh như trước.
- [ ] **Step 5: Phá-thử chiều đỏ** (bỏ dòng ghi chú; UTC; nhãn «Lần trước» ở ô số; bỏ nhánh null; vẽ ghi chú khi null; ẩn khối khi đang tải; bỏ nút Thử lại) — từng câu ghim; hoàn lại.
- [ ] **Step 6: Commit** `feat(hop-cap-nhat-lan-truoc): khối lần cập nhật trước trong hộp`.

independent: false · phục vụ E1 (AC-1), E2 (AC-2), E6 (AC-6).

### Task 3: Câu hỏi gợi ý dưới ô ghi chú (E5)

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx` — `OGhiChu` thêm prop `goiY?: readonly string[]`; có thì `FieldDescription data-goi-y-ghi-chu` liệt ba câu.
- Modify: `apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx` — truyền `goiY={okrLanTruocMessages(locale).goiY}`.
- Test: `apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx` ca `hct-goi-y`.

- [ ] **Step 1: Viết `hct-goi-y`** theo E5 (cả đối chứng `BangCapNhat` không có câu gợi ý).
- [ ] **Step 2: Đỏ.** **Step 3: Sửa.** **Step 4: Xanh**; chạy lại ca đã ký của trang Cập nhật tuần chạm `OGhiChu` (`grep -l "cap-nhat-tuan" apps/app/test/*.dom.tsx`, chạy từng tệp).
- [ ] **Step 5: Phá-thử hai chiều đỏ; Commit** `feat(hop-cap-nhat-lan-truoc): câu hỏi gợi ý cho ô ghi chú`.

independent: false · phục vụ E5 (AC-5).

### Task 4: Mở lại sau khi gửi (E4)

**Files:**
- Test: `apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx` ca `hct-sau-gui`.
- Modify (chỉ khi đỏ): `hop-thoai-cap-nhat-kr.tsx` `onSuccess`.

- [ ] **Step 1: Viết `hct-sau-gui`** theo E4 (`kho.ghiRieng` cho `okr.guiCapNhat` đổi `kho.chiTiet` và dienBien sau ghi; đếm `kho.daDoc` của `okr.dienBien` và `okr.objective`).
- [ ] **Step 2: Chạy.** `onSuccess` sẵn có đã làm mới `dienBien` theo KR và `cache.okr(objectiveId)`; xanh ngay là đúng kỳ vọng — chứng chiều đỏ ở Step 3.
- [ ] **Step 3: Phá-thử** bỏ invalidate dienBien → đỏ `hct-sau-gui: ghi chu cu sau khi gui (A)`; hoàn lại. **Commit** `test(hop-cap-nhat-lan-truoc): mở lại sau khi gửi`.

independent: false · phục vụ E4 (AC-4).

### Task 5: Bàn đo màn 375/1440 (E7)

**Files:**
- Create: `_acceptance/hop-cap-nhat-lan-truoc/rang/man.mjs` (theo khuôn `_acceptance/ngan-kr-mot-cho/rang/man.mjs`: cổng từ `APP_URL`/`API_URL`, từ chối 3000/3001, `--tu-kiem`, `doTran` có đối chứng 4000px, KET LUAN mã 0/1/2, ảnh `hct-1440.png`, `hct-375.png` vào `BANG_CHUNG` hay `_acceptance/hop-cap-nhat-lan-truoc/evidence`).

- [ ] **Step 1:** Viết script; `node --check` và `bun _acceptance/hop-cap-nhat-lan-truoc/rang/man.mjs --tu-kiem` → `DUNG tu kiem`.
- [ ] **Step 2:** KHÔNG chạy lượt đo thật (cần phiên đo, thuộc S4 của dãy V2). Ghi vào bàn giao.
- [ ] **Step 3: Commit** `test(hop-cap-nhat-lan-truoc): bàn đo màn hộp cập nhật`.

independent: true · phục vụ E7 (AC-7).

### Task 6: Kiểm cuối S3

- [ ] `bun run check-types` lọc app (`cd apps/app && bunx tsc --noEmit -p .` hoặc turbo filter app), `bun run lint`, `bun run lint:slop` — sạch ở tệp của vòng.
- [ ] `apps/app/test/messages-guard.spec.ts` xanh (tệp chữ mới).
- [ ] Skill `web-design-guidelines` soát `khoi-lan-truoc.tsx`, `hop-thoai-cap-nhat-kr.tsx`.
- [ ] Hợp đồng `status: implemented`; vẽ lại bản đồ; commit.
