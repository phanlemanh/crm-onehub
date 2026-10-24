# Họp tuần mở đúng bộ (HT1) — kế hoạch

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Họp tuần không kèm đơn vị mở bộ người xem dẫn; đầu thẻ có hàng bốn số của tuần; màn rỗng nói đúng lý do và chỉ sang đơn vị có KR.

**Architecture:** Một hàm thuần `boHopTuan` ở `packages/validation` chọn bộ từ `okr.access` và `org.tree`; `page.tsx` (máy chủ) gọi nó rồi `redirect()`. Hàng số và lý do rỗng là hai hàm thuần ở màn (`oSoHop`, `lyDoRong`), `hop-tuan.tsx` chỉ dựng. API đổi đúng một dòng (`tuanDau` của bộ rỗng).

**Tech Stack:** Next.js App Router (máy chủ `redirect`), tRPC + TanStack Query, Zod, Prisma, bun test (DOM qua `packages/ui/test/setup-dom.ts`), Playwright trong bàn đo `rang/`.

**Spec:** `docs/superpowers/specs/2026-10-23-hop-tuan-mo-dung-bo-design.md` · nghiên cứu `docs/findings/2026-10-22-hop-tuan/README.md` (§1 lời chủ kho, §3 F01–F03 · F07, §6) · bản phạm vi `docs/plan/pham-vi-okr-sau-vo-khu-2410.md` §1 «Lối (b)» · hợp đồng `_acceptance/hop-tuan-mo-dung-bo/contract.md` (approved 24/10) · `evals.yaml` (12 eval, lệnh ở khoá `htmb_*` của `_acceptance/config.yaml`).

**Tiền đề S3:** viết trên mã của VK3 `trang-bo-okr` (`the-con.tsx`, `danh-sach-bo.tsx`, `page.tsx` chia danh sách/bộ). S3 bắt đầu khi VK3 đã gộp `onehub`; trước đó gộp `origin/onehub` vào nhánh, `bun install`, `bun run db:generate`.

## Global Constraints

- Không viết chú thích trong mã (`AGENTS.md`).
- Không thủ tục API mới, không thêm/bớt khoá ở đầu ra `okr.hopTuan`; không migration.
- Client component không import `@crm/db`, `@crm/auth`; tính ở `page.tsx`, khách nhận dữ liệu xong.
- Chữ mới chỉ ở `apps/app/lib/messages/okr-hop-tuan-bo.ts` (vi + en); không sửa `okr-toan-canh.ts`. Mỗi câu có biến thêm dòng GHIM ở `apps/app/test/messages-guard.spec.ts`.
- Ngày theo lịch giờ Việt Nam (`Asia/Ho_Chi_Minh`), đúng cả khi máy chạy UTC.
- Tên đơn vị và tên chu kỳ bọc `translate="no"`.
- Thành phần từ `packages/ui` (`StatGroup`, `StatCard`, `Item variant="outline"`, `Empty`, `Skeleton`, `VungTaiLoi`); không `className` đổi màu/góc/khoảng cách.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture (đối chứng dương + phá-thử trong bản sao, thông điệp ghim đúng như `evals.yaml`).
- «Lối (b)» (chủ kho 24/10): chỉ còn hộp cập nhật một KR, mở từ ngăn KR hay dòng bộ OKR. HT1 không thêm lối cập nhật nào, không chạm `phan-can-cap-nhat.tsx` / `BangCapNhat` (SV1 gỡ), không thêm nút cập nhật trên dòng Họp tuần (HT2, qua hộp một KR).
- Thứ tự «đơn vị bạn dẫn» giữ đúng AC-2 đã duyệt (bộ phận trước phòng ban); README F01 ghi ngược (phòng ban trước) — đã báo giám sát, chủ kho quyết, không đổi ở S3 khi chưa có lời.
- Không sửa thước hồ sơ đã ký ngoài đúng một lớp đã duyệt (VK3 E10, ca `xem-khong-don`), kèm dòng sổ `fix` `decided_by: Phan Le Manh`.

## Review Focus

1. Người xem dẫn đơn vị đã lưu trữ hay đơn vị không còn trong cây → `boHopTuan` bỏ qua đơn vị không có trong cây, không trả khoá trỏ đơn vị chết (Task 1, ca `htmb-bien-bo`).
2. Phòng ban chính của thành viên đã bị lưu trữ → rơi về `goc`, không chuyển tới bộ không mở được (Task 1, ca `htmb-bien-bo`).
3. `kyOkr` mang id chu kỳ không tồn tại → chuyển hướng vẫn giữ nguyên chuỗi `kyOkr`, không vòng chuyển hướng (Task 3, ca `htmb-bien-chuyen`: đích chứa `kyOkr=khong-co`, gọi `duongChuyenHopTuan` trên đích → `null`).
4. `endsOn` trước `startsOn` hay chu kỳ một ngày → không số âm, không `NaN` (Task 4, ca `htmb-bien-o-so`: hôm nay = start = end → «1»).
5. Danh sách «Đơn vị có KR» dài (≥ 12 mục) ở 375 → tên dài cắt bằng dấu ba chấm, không tràn ngang (Task 8, bàn đo đo `scrollWidth` của tài liệu khi ca mẫu có tên đơn vị 60 ký tự).

---

## File Structure

| Tệp | Việc |
| --- | --- |
| `packages/validation/src/okr-bo-hop-tuan.ts` (mới) | `thuTuDanTheoCay`, `boHopTuan` — một luật chọn bộ, dùng chung cho trang và bài API |
| `packages/validation/package.json` | xuất subpath `./okr-bo-hop-tuan` |
| `apps/app/app/(app)/[slug]/okr/phan-don-vi-dan.tsx` | `thuTuDan` gọi `thuTuDanTheoCay` (một luật thứ tự) |
| `apps/app/app/(app)/[slug]/okr/theo-don-vi/chuyen-hop-tuan.ts` (mới) | `duongChuyenHopTuan` — URL đích hay `null` |
| `apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx` | đọc `okr.access` + `org.tree`, gọi hai hàm, `redirect()` |
| `apps/api/src/okr/okr-xem.service.ts:586` | `tuanDau` = `tatCa.length > 0 && every(...)` |
| `apps/app/app/(app)/[slug]/okr/o-so-hop.ts` (mới) | `oSoHop` — bốn ô |
| `apps/app/app/(app)/[slug]/okr/ly-do-rong.ts` (mới) | `lyDoRong` |
| `apps/app/app/(app)/[slug]/okr/don-vi-co-kr.tsx` (mới) | `DonViCoKr` — gọi `okr.toanCanh` chỉ trong nhánh rỗng |
| `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx` | hàng số, nhánh rỗng, khung xương |
| `apps/app/lib/messages/okr-hop-tuan-bo.ts` (mới) | chữ vi/en |
| `apps/api/scripts/okr-mau/ca-hop-tuan.ts` (mới) + nơi `okr:mau` gọi ca | ca đo trên bộ mẫu |
| `_acceptance/hop-tuan-mo-dung-bo/rang/man.mjs`, `khong-doi-hinh.mjs` (mới) | bàn đo E1, E11, E12 |
| Bài kiểm: `apps/api/test/hop-tuan-mo-dung-bo.spec.ts`, `apps/api/test/fixtures/htmb-toan-canh.json`, `apps/app/test/hop-tuan-mo-dung-bo.spec.ts`, `apps/app/test/hop-tuan-mo-dung-bo.dom.tsx` | E2–E10 |

---

### Task 1: `boHopTuan` — chọn bộ của người xem

phục vụ E2 (AC-2) · `independent: true`

**Files:**
- Create: `packages/validation/src/okr-bo-hop-tuan.ts`
- Modify: `packages/validation/package.json` (exports), `apps/app/app/(app)/[slug]/okr/phan-don-vi-dan.tsx:67-92`
- Test: `apps/api/test/hop-tuan-mo-dung-bo.spec.ts` (describe `htmb-bo`)

**Interfaces:**
- Produces:
  - `type CayChonBo = { divisions: { id: string; departments: { id: string }[] }[]; chuaXep: { id: string }[]; people: { id: string; primaryDepartmentId: string | null }[] }` (khớp cấu trúc `orgTreeOutput`, không import từ `apps/api`)
  - `type QuyenChonBo = { canManageProgram: boolean; headOf: { divisions: string[]; departments: string[] } }`
  - `thuTuDanTheoCay(headOf: QuyenChonBo["headOf"], cay: CayChonBo | undefined): DonChonOkr[]` — đúng luật `thuTuDan` hôm nay (bộ phận trước, rồi phòng ban, theo vị trí trong cây; không có trong cây xếp cuối theo thứ tự đầu vào).
  - `type NguonBoHop = "dan" | "quan-tri" | "phong-ban-chinh" | "goc"`
  - `boHopTuan(v: { access: QuyenChonBo; cay: CayChonBo; userId: string }): { don: DonChonOkr; nguon: NguonBoHop }`

- [ ] **Step 1: Viết ca `htmb-bo` đỏ.** Dựng cây qua `ToChucService` thật, vai qua đường mời/đổi vai thật; với mỗi người xem gọi `okr.access`, `org.tree` qua router caller, parse bằng `okrAccessOutput`, `orgTreeOutput`, rồi `boHopTuan`. Ma trận 8 ô viết trước, đúng như `evals.yaml` E2 (trưởng bộ phận → `bp:B`; dẫn `bp:B`+`pb:P2` → `bp:B`; dẫn `pb:P1`+`pb:P3` → `pb:P1`; quản trị không dẫn → `goc`/`quan-tri`; quản trị kiêm trưởng `pb:P1` → `pb:P1`/`dan`; thành viên phòng ban chính P2 → `pb:P2`/`phong-ban-chinh`; không phòng ban → `goc`/`goc`; trưởng P4 bị chuyển sang P2 → `pb:P2`, đối chứng trước khi chuyển → `pb:P4`). Cuối ca `expect(dem).toBe(8)` (đúng số E2 đã duyệt). Describe riêng `htmb-bien-bo` (không khớp `-t htmb-bo`, chạy trong suite) cho Review Focus 1–2: dẫn một phòng ban rồi phòng ban ấy bị lưu trữ → không trả khoá của nó; phòng ban chính bị lưu trữ → `goc`.
- [ ] **Step 2:** `bun run test -- "cd apps/api && bun test test/hop-tuan-mo-dung-bo.spec.ts -t htmb-bo"` → FAIL (`boHopTuan` chưa có).
- [ ] **Step 3: Viết `okr-bo-hop-tuan.ts`.** Thứ tự: `thuTuDanTheoCay` lọc khoá có trong cây, có phần tử → `{don: đầu, nguon: "dan"}`; `canManageProgram` → `goc`/`quan-tri`; người trong `people` có `primaryDepartmentId` còn trong cây → `pb:<id>`/`phong-ban-chinh`; còn lại `goc`/`goc`. `phan-don-vi-dan.tsx` `thuTuDan` gọi `thuTuDanTheoCay` (giữ chữ ký cũ cho người gọi).
- [ ] **Step 4:** chạy lại lệnh Step 2 → PASS 8 ô; `-t htmb-bien-bo` → PASS 2 ô. Chạy `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test` lọc tệp có `thuTuDan` / `phan-don-vi-dan` → xanh như trước.
- [ ] **Step 5: Phá-thử trong bản sao** (theo `MEASURE-BIRTH-CLAUSE`): đặt nhánh quản trị trước nhánh dẫn → đỏ «htmb-bo: quan-tri-kiem-truong ra goc, can pb:P1»; sắp theo id thay thứ tự cây → đỏ «htmb-bo: dan-hai-phong ra pb:P3, can pb:P1». Hoàn lại, commit trước khi phá.
- [ ] **Step 6: Commit** `feat(hop-tuan-mo-dung-bo): boHopTuan chọn bộ của người xem`.

### Task 2: `tuanDau` của bộ rỗng và quan hệ `toanCanh` ↔ `hopTuan`

phục vụ E8 (AC-6, AC-7) · `independent: true`

**Files:**
- Modify: `apps/api/src/okr/okr-xem.service.ts:586`
- Test: `apps/api/test/hop-tuan-mo-dung-bo.spec.ts` (describe `htmb-toan-canh`), `apps/api/test/fixtures/htmb-toan-canh.json`

**Interfaces:**
- Produces: `okr.hopTuan(...).tuanDau === false` khi `tongKr === 0`; tệp `htmb-toan-canh.json` = đầu ra `okr.toanCanh` của người xem thường trong ca (Task 6 đọc).

- [ ] **Step 1: Viết ca `htmb-toan-canh` đỏ** đúng dữ liệu và khẳng định của `evals.yaml` E8 (OneHub rỗng; bộ phận B có 3 KR ở P: tuần này / chỉ tuần trước qua `OkrCapNhatService` với `now` cố định / chưa lần nào; X có 1 KR; Q chỉ mục tiêu hạn chế 3 KR). Khẳng định `hopTuan(goc)` = `{tongKr: 0, tuanDau: false}`; `bp:B` soKr 3, daCapNhat 1, khớp hai lệnh SQL; ma trận quan hệ 3 ô (`bp:B`, `pb:P`, `pb:X`) `hopTuan(khoá).tongKr = soKr`, `daCapNhat` bằng nhau; `pb:Q` soKr 0 hoặc vắng; đối chứng người xem trong danh sách được xem → `pb:Q` soKr 3. `HTMB_GHI=1` ghi fixture, chạy thường so byte → lệch đỏ «htmb-toan-canh: fixture lech dau ra that».
- [ ] **Step 2:** `bun run test -- "cd apps/api && bun test test/hop-tuan-mo-dung-bo.spec.ts -t htmb-toan-canh"` → FAIL ở «goc rong tuanDau true».
- [ ] **Step 3:** sửa dòng 586: `tuanDau: tatCa.length > 0 && tatCa.every((k) => k.lan.length === 0)`.
- [ ] **Step 4:** chạy `HTMB_GHI=1` một lần ghi fixture, rồi chạy thường → PASS. Chạy `bun run test -- "cd apps/api && bun test test/okr-toan-canh.spec.ts"` → xanh như trước (bài đã ký chỉ khẳng định `tuanDau: false` cho bộ có KR).
- [ ] **Step 5: Phá-thử:** bỏ lọc hạn chế ở `toanCanh` → «htmb-toan-canh: pb:Q lo muc tieu han che (3)»; `hopTuan(bp)` bỏ phòng ban con → «htmb-toan-canh: bp:B liet 3, hopTuan 0»; trả lại `every()` trần → «htmb-toan-canh: goc rong tuanDau true».
- [ ] **Step 6: Commit** `fix(hop-tuan-mo-dung-bo): tuanDau false khi bộ không có KR công bố`.

### Task 3: Chuyển hướng ở máy chủ

phục vụ E3 (AC-2), góp E1 (AC-1) · `independent: false` (cần Task 1)

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/theo-don-vi/chuyen-hop-tuan.ts`
- Modify: `apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx` (`NoiDung`)
- Test: `apps/app/test/hop-tuan-mo-dung-bo.spec.ts` (describe `htmb-chuyen`, `htmb-chuyen-loi`)

**Interfaces:**
- Consumes: `boHopTuan`, `CayChonBo`, `QuyenChonBo` (Task 1); `khoaDon` của `okr-search-params.ts`.
- Produces: `duongChuyenHopTuan(thamSo: URLSearchParams, don: DonChonOkr): string | null` — trả chuỗi truy vấn đích (`?donOkr=…&xemOkr=hop-tuan[&kyOkr=…]`, giữ mọi tham số khác) chỉ khi `xemOkr === "hop-tuan"` và không có `donOkr`; còn lại `null`.

- [ ] **Step 1: Viết ca đỏ.** `htmb-chuyen` ma trận 6 ô như E3, `expect(dem).toBe(6)`; describe riêng `htmb-bien-chuyen` cho Review Focus 3 (`kyOkr=khong-co` giữ nguyên, gọi lại hàm trên đích → `null`). `htmb-chuyen-loi` 2 ô (`okr.access` giả ném, `org.tree` giả ném → lời gọi trang `rejects` với chính lỗi ấy) + đối chứng (cả hai bình thường → ném `NEXT_REDIRECT`, đích mang `donOkr`).
- [ ] **Step 2:** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 ./test/hop-tuan-mo-dung-bo.spec.ts -t htmb-chuyen` → FAIL.
- [ ] **Step 3: Viết hàm và sửa trang.** Trong `NoiDung`, trước nhánh danh sách: khi `xemOkr === "hop-tuan"` và `donOkr === null`, `fetchQuery` `okr.access` và `org.tree` (không `.catch` — lỗi ném lên vùng lỗi của khu), lấy `userId` từ `requireSession()`, gọi `boHopTuan` rồi `duongChuyenHopTuan`; khác `null` → `redirect(\`${pathname}${dich}\`)` với `pathname` là đường của trang (`/<slug>/okr/bo-okr`). `next.config.ts` đã chuyển `theo-don-vi` → `bo-okr` giữ chuỗi truy vấn: không đổi.
- [ ] **Step 4:** chạy lại lệnh Step 2 → PASS 6 + 3 ô; `-t htmb-bien-chuyen` → PASS.
- [ ] **Step 5: Phá-thử:** hàm coi `donOkr=goc` là «không có» → «htmb-chuyen: donOkr=goc bi chuyen»; trang bắt lỗi rồi dùng `goc` → «htmb-chuyen-loi: loi roi ve goc»; bắt lỗi `org.tree` dùng cây rỗng → «htmb-chuyen-loi: org.tree loi roi ve goc».
- [ ] **Step 6: Commit** `feat(hop-tuan-mo-dung-bo): Họp tuần không kèm đơn vị chuyển sang bộ của người xem`.

### Task 4: `oSoHop` — bốn ô của tuần

phục vụ E6 (AC-5) · `independent: true`

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/o-so-hop.ts`
- Test: `apps/app/test/hop-tuan-mo-dung-bo.spec.ts` (describe `htmb-o-so`)

**Interfaces:**
- Produces:
  - `type OSo = { khoa: "da-cap-nhat" | "dang-ban" | "tu-tin-thap" | "ngay-con"; giaTri: string; moTa: { loai: "tuan" | "can-ban" | "moi-nhat" | "ket-thuc" | "bat-dau" | "da-ket-thuc"; ngay: string | null } }`
  - `oSoHop(d: HopTuanOutput, chuKy: { startsOn: string; endsOn: string }, homNay: Date): OSo[]` — luôn 4 phần tử theo thứ tự trên; chữ do màn ghép từ `moTa` + tệp chữ. Nếu VK8 `bo-okr-co-so` đã gộp hàm ngày còn lại trước, gọi hàm ấy thay vì viết lại.

- [ ] **Step 1: Viết ca đỏ** 6 ô của E6, `expect(dem).toBe(6)`; mỗi ô: `giaTri` và `ngay` không chứa `NaN`, `undefined`, không khớp `/-\d/`. Describe riêng `htmb-bien-o-so` cho Review Focus 4 (start = end = hôm nay → «1»).
- [ ] **Step 2:** lệnh `htmb_o_so` (hai lượt TZ) → FAIL.
- [ ] **Step 3:** viết hàm; ngày lịch VN bằng `Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" })`, đếm ngày cả hai đầu; tự tin thấp đếm trên `dangBan ∪ conLai` có `tuTin === "thap"`.
- [ ] **Step 4:** lệnh Step 2 → PASS cả hai lượt.
- [ ] **Step 5: Phá-thử:** dùng `getDate()` theo giờ máy → đỏ ở lượt UTC «htmb-o-so: truoc-bat-dau ra 92, can —».
- [ ] **Step 6: Commit** `feat(hop-tuan-mo-dung-bo): oSoHop dựng bốn ô của tuần`.

### Task 5: `lyDoRong` và tệp chữ

phục vụ E9 (AC-7) phần hàm · `independent: true`

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/ly-do-rong.ts`, `apps/app/lib/messages/okr-hop-tuan-bo.ts`
- Modify: `apps/app/test/messages-guard.spec.ts` (GHIM câu có biến)
- Test: `apps/app/test/hop-tuan-mo-dung-bo.spec.ts` (describe `htmb-ly-do-ham`)

**Interfaces:**
- Produces:
  - `type LyDoRong = "chu-ky-chua-chay" | "chua-kr-cong-bo" | "chua-ai-cap-nhat" | null`
  - `lyDoRong(v: { hop: HopTuanOutput; chuKy: { phase: string; startsOn: string }; homNay: Date }): LyDoRong` — xét theo thứ tự `chu-ky-chua-chay` (pha `lap-ke-hoach` hoặc hôm nay VN trước `startsOn`, và chưa KR nào có lần cập nhật) → `chua-kr-cong-bo` (`tongKr === 0`) → `chua-ai-cap-nhat` (`tuanDau`) → `null`.
  - `okrHopTuanBoMessages(locale)` với khoá: `hangSo.{daCapNhat, dangBan, tuTinThap, ngayCon}`, `moTa.{tuan, canBan, moiNhat, ketThuc, batDau, daKetThuc}`, `rong.{chuKyChuaChay, chuaKr}`, `donViCoKr.{tieuDe, dong, xemMoiBo, loi}`. Câu vi chép nguyên văn từ hợp đồng: «Chu kỳ {ten} bắt đầu {ngay} — Họp tuần có số từ tuần đầu của chu kỳ.», «{bo} chưa có KR công bố trong {chuKy}.», «{n} KR · đã cập nhật {m}», «Xem mọi bộ OKR», «Đơn vị có KR», «Không tải được các đơn vị có KR.».

- [ ] **Step 1:** ca hàm 5 ô của E9 (phần hàm) đỏ.
- [ ] **Step 2:** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/hop-tuan-mo-dung-bo.spec.ts -t htmb-ly-do-ham` → FAIL.
- [ ] **Step 3:** viết hàm và tệp chữ (vi + en); thêm GHIM ở `messages-guard.spec.ts` cho mọi câu có biến.
- [ ] **Step 4:** Step 2 + `cd apps/app && bun test ./test/messages-guard.spec.ts` → PASS.
- [ ] **Step 5: Commit** `feat(hop-tuan-mo-dung-bo): lyDoRong và chữ của Họp tuần theo bộ`.

### Task 6: Màn Họp tuần — hàng số, nhánh rỗng, tải và lỗi

phục vụ E5 (AC-4), E7 (AC-6), E9 (AC-7), E10 (AC-8) · `independent: false` (cần Task 2 fixture, 4, 5)

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/don-vi-co-kr.tsx`
- Modify: `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx:192-280`
- Test: `apps/app/test/hop-tuan-mo-dung-bo.dom.tsx` (describe `htmb-hang-so`, `htmb-hang-so-the-khac`, `htmb-chua-kr`, `htmb-ly-do`, `htmb-tai`)

**Interfaces:**
- Consumes: `oSoHop`, `OSo` (Task 4); `lyDoRong`, `okrHopTuanBoMessages` (Task 5); `htmb-toan-canh.json` (Task 2).
- Produces: dấu DOM mà bàn đo đọc — `[data-hang-so-hop]` (bọc `StatGroup`), `[data-don-vi-co-kr]`, `data-trang-thai` `ST-hoptuan-chuky-chua-chay` · `ST-hoptuan-chua-kr` · `ST-hoptuan-donvi-tai` · `ST-hoptuan-donvi-loi`; `DonViCoKr({ cycleId, ky }: { cycleId: string; ky: string | null })`.

- [ ] **Step 1: Viết năm ca DOM đỏ** đúng ma trận và đếm ô của `evals.yaml` E5 (4 ô + 3 ô thẻ khác + đối chứng), E7 (4 ô, fixture `toanCanh` đọc từ `apps/api/test/fixtures/htmb-toan-canh.json` cho ô `goc`), E9 (5 ô trên màn), E10 (4 ô). Mọi đầu ra giả parse bằng `hopTuanOutput` / `toanCanhOutput` thật.
- [ ] **Step 2:** chạy bốn lệnh `htmb_hang_so`, `htmb_chua_kr`, `htmb_ly_do`, `htmb_tai` → FAIL.
- [ ] **Step 3: Sửa `HopTuan`.** Thứ tự nhánh: tải → bốn `StatCard` khung xương trong `[data-hang-so-hop]` + khung bảng; lỗi → `ST-hoptuan-loi` như nay; `lyDoRong` khác `null` và khác `chua-ai-cap-nhat` → `Empty` với câu lý do, không hàng số (bộ OneHub `chua-kr-cong-bo` thêm `DonViCoKr`, bộ khác thêm liên kết «Xem mọi bộ OKR» tới `/okr/bo-okr?kyOkr=…`); còn lại → `[data-hang-so-hop]` trước `KhoiTomTat` và bảng. Bỏ `[data-tom-tat-hop]`. `DonViCoKr` gọi `trpc.okr.toanCanh` (chỉ được dựng trong nhánh rỗng), liệt hàng `soKr > 0` của bộ phận và phòng ban chưa xếp theo thứ tự cây, mỗi mục `Item variant="outline"` là `Link` tới `hrefThe({ goc, don, ky, the: "hop-tuan" })` của `the-con.tsx`; tải → ba khung xương `ST-hoptuan-donvi-tai`; lỗi → `VungTaiLoi` `ST-hoptuan-donvi-loi` có Thử lại; rỗng → «Xem mọi bộ OKR».
- [ ] **Step 4:** bốn lệnh Step 2 → PASS. Chạy toàn bộ `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/hop-cap-nhat-lan-truoc.dom.tsx ./test/tom-tat-tuan-dang-cho.dom.tsx ./test/trang-bo-okr.dom.tsx` → xanh (bài đã ký mock `useTRPC` không có `toanCanh` không chạm nó ở nhánh có dữ liệu).
- [ ] **Step 5: Phá-thử:** đếm tự tin thấp chỉ trên `dangBan` → «htmb-hang-so: tu tin thap 1, can 2»; xét `tuanDau` trước `tongKr` → «htmb-chua-kr: bo rong ra cau tuanDau»; liệt cả B2 → «htmb-chua-kr: liet don vi soKr 0 (B2)»; bỏ điều kiện `startsOn` → «htmb-ly-do: chua-toi-ngay ra chua-ai-cap-nhat»; lỗi `toanCanh` thay cả câu lý do → «htmb-tai: loi toanCanh mat cau ly do».
- [ ] **Step 6: Commit** `feat(hop-tuan-mo-dung-bo): hàng số của tuần và màn rỗng nói lý do`.

### Task 7: Đường vào qua thanh bên và thẻ con

phục vụ E4 (AC-3) · `independent: true` (không đổi mã nếu VK3 đúng như đọc; đây là bài khoá)

**Files:**
- Test: `apps/app/test/hop-tuan-mo-dung-bo.dom.tsx` (describe `htmb-thanh-ben`, `htmb-duong-vao`)

- [ ] **Step 1:** viết hai ca đúng E4 (3 URL thanh bên + đối chứng `aria-current`; 2 đường `DanhSachBo` lọc `toi-dan` → `TheConBo`, và «đơn vị bạn dẫn» → `TheConBo`), dữ liệu parse bằng khuôn thật.
- [ ] **Step 2:** lệnh `htmb_thanh_ben` → PASS ngay (khoá hành vi VK3); nếu đỏ, ghi dòng sổ `fix` và sửa đúng chỗ VK3 lệch thiết kế.
- [ ] **Step 3: Phá-thử:** thêm mục `hop-tuan` vào `NHOM_THANH_BEN` → «htmb-thanh-ben: thanh ben co muc Hop tuan»; `TheConBo` bỏ `donOkr` → «htmb-duong-vao: the con mat donOkr».
- [ ] **Step 4: Commit** `test(hop-tuan-mo-dung-bo): khoá đường vào Họp tuần qua bộ OKR`.

### Task 8: Ca mẫu và bàn đo màn

phục vụ E1 (AC-1), E11 (AC-9) · `independent: false` (cần Task 3, 6)

**Files:**
- Create: `apps/api/scripts/okr-mau/ca-hop-tuan.ts`, `_acceptance/hop-tuan-mo-dung-bo/rang/man.mjs`
- Modify: điểm vào `okr:mau` (tệp gọi các ca trong `apps/api/scripts/okr-mau/`) để gọi ca mới

**Interfaces:**
- Produces: ca mẫu in một dòng JSON `{ truongP, thanhVienM, quanTriA, boP, boRong, chuKyCon, chuKyKeHoach }` (email và khoá) để bàn đo đọc; `man.mjs --phan duong|anh [--chieu-do [giu-ky]]` in `DUNG <dong>` / `SAI AC-n: …` và dòng `KET LUAN` mã 0/1/2.

- [ ] **Step 1: Ca mẫu** qua service thật (không chèn bảng; lần cập nhật ghi qua `OkrCapNhatService` với lối `sheet` — đường còn sống sau «Lối (b)», không dùng `cua-toi`, `viec-cua-toi`): chu kỳ `lap-ke-hoach` bắt đầu sau hôm nay; chu kỳ con đang chạy mà OneHub không mục tiêu công bố, ≥ 2 đơn vị chưa xếp có KR công bố và lần cập nhật; phòng ban có trưởng mà không KR; thành viên M (phòng ban chính Q, không dẫn); quản trị A không dẫn; một đơn vị tên 60 ký tự có KR (Review Focus 5). Từ chối chạy trên production như các ca khác.
- [ ] **Step 2: `man.mjs --phan duong`** đúng bảy dòng của E1 (ba URL × (a)(b)(c)(d), hai vai phần B, hai đường bấm phần C), đếm dòng = 7; `--chieu-do` (bỏ nhánh chuyển) → «SAI AC-1: <dong> khong chuyen (200)»; `--chieu-do giu-ky` → «SAI AC-1: ky-okr mat kyOkr».
- [ ] **Step 3: `man.mjs --phan anh`** đúng bước của E11: 1440/375 × sáng/tối × ba màn = 12 ảnh vào `evidence/`, đo tràn ngang có đối chứng khối 4000px, lưới ô, nhãn không cắt, danh sách ≥ 2 mục.
- [ ] **Step 4:** `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/hop-tuan-mo-dung-bo/rang/man.mjs --phan duong"` → `KET LUAN` mã 0; rồi hai lượt chiều đỏ → mã 1 với đúng thông điệp. Lặp với `--phan anh` → mã 0, đủ 12 ảnh.
- [ ] **Step 5: Commit** `feat(hop-tuan-mo-dung-bo): ca Họp tuần trên bộ mẫu và bàn đo màn`.

### Task 9: Hồ sơ đã ký — đổi thước VK3 E10 và bài «không đổi hình»

phục vụ E12 (AC-10) · `independent: false` (chạy sau cùng, trên cây đủ Task 1–8)

**Files:**
- Modify: thước VK3 E10 (`_acceptance/trang-bo-okr/rang/…` ca `xem-khong-don`) — chỉ chuỗi kỳ vọng tiêu đề/đường
- Modify: `_acceptance/trang-bo-okr/decisions.jsonl` (một dòng `fix`)
- Create: `_acceptance/hop-tuan-mo-dung-bo/rang/khong-doi-hinh.mjs`

- [ ] **Step 1:** xin `cham-tep` cho các tệp của `_acceptance/trang-bo-okr/` qua `dieu-phoi.mjs yeu-cau cham-tep`; chờ duyệt.
- [ ] **Step 2:** đổi ca `xem-khong-don` của VK3 E10: kỳ vọng «mở bộ của người xem» (tiêu đề tên đơn vị người xem dẫn, URL mang `donOkr`) thay «tiêu đề tên gốc». Không đổi gì khác. Ghi dòng sổ `fix` vào `_acceptance/trang-bo-okr/decisions.jsonl` theo khối `DEC-ID-RECIPE`, `decided_by: "Phan Le Manh"`, nhắc tệp thước, kèm cặp đo hai chiều (thước mới xanh trên cây; đỏ khi bỏ nhánh chuyển hướng).
- [ ] **Step 3: `khong-doi-hinh.mjs`** cùng khuôn VK3 E15: quét lớp lúc chạy, in «quet lop: <n> ho so, <k> eval», chạy trên cây, mục đỏ chạy lại trên worktree `origin/onehub`, đối chiếu sổ `fix` và lớp diff đã khai, đúng các thông điệp của E12.
- [ ] **Step 4:** `node _acceptance/hop-tuan-mo-dung-bo/rang/khong-doi-hinh.mjs` → mã 0 (hoặc chỉ «DO SAN TREN NEN»); phá-thử trong bản sao HEAD: thêm `export const doiLogicThu = 1 + 1;` cuối một thước đã ký → «SAI AC-10: DOI LOGIC <tep>:<dong>»; xoá dòng sổ fix → «SAI AC-10: THIEU SO <tep>».
- [ ] **Step 5: Commit** `test(hop-tuan-mo-dung-bo): đổi thước VK3 E10 theo quyết định chủ kho, khoá không đổi hình`.

---

## Thứ tự

Task 1, 2, 4, 5, 7 độc lập (chạy song song được). Task 3 sau 1. Task 6 sau 2, 4, 5. Task 8 sau 3, 6. Task 9 cuối. Xong Task 9: `bun run test`, `check-types`, `lint`, `lint:slop`, `build`, rồi contract `status: implemented` và S4.
