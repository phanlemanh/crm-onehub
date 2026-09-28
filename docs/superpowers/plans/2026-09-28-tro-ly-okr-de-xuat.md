# Góp ý khi bấm (9b · tro-ly-okr-de-xuat) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người sửa được một Mục tiêu hay KR nhờ Trợ lý OKR góp ý trong hộp thoại sửa, nhận · sửa · bác từng dòng; quản trị đặt nấc tắt · chế độ ẩn · bật theo việc và đơn vị và đọc số đo; vá hai lỗi 9a.

**Architecture:** Khuôn, bộ kiểm đề xuất và bộ đọc số ở `packages/validation`; luật nấc, trần, xếp việc, đọc danh sách đề xuất (kiểm lại, hết hạn, ghi lúc hiện) và hàm xu hướng ở `packages/db` để API và `apps/agent` dùng chung; subagent `tro_ly_okr` dựng gói v1 và chạy bộ kiểm trong `nop_de_xuat`; API chỉ kiểm quyền, xếp `AgentTask`, đọc sổ và ghi OKR qua `OkrService` khi người nhận; màn đọc API.

**Tech Stack:** Bun, Turbo, Prisma 7 (Postgres), Zod 4, NestJS + nestjs-trpc, eve 0.29.4, AI SDK (Gateway), Next.js 16, `@crm/ui` (shadcn, AI Elements `Shimmer`), bun:test, puppeteer-core.

**Spec:** `docs/superpowers/specs/2026-09-28-tro-ly-okr-de-xuat-design.md` · hợp đồng `_acceptance/tro-ly-okr-de-xuat/contract.md` (duyệt 28/09, Manh Phan) · bộ đo `_acceptance/tro-ly-okr-de-xuat/evals.yaml` · bản mẫu `apps/app/app/proto/_modules/tro-ly-okr-de-xuat/`.

## Global Constraints

- Trước việc đầu tiên: gộp `origin/onehub` vào nhánh (có #186 bộ OKR mẫu, #183 lộ trình, #187), `bun install`, `cd packages/db && bun run db:generate`.
- Không chú thích trong mã, ở mã mới và mã sửa (`AGENTS.md`).
- Trí khôn chỉ ở `apps/agent`; API không gọi model (`docs/api.md`).
- Không biến môi trường mới.
- Parse ở biên bằng Zod trong `packages/validation`, một module mỗi khuôn, nhập theo subpath; cột chuỗi mang trạng thái parse bằng enum lúc đọc, hỏng là lỗi có tên.
- Mọi hằng tinh chỉnh ở `TRO_LY_OKR_TRAN` (`packages/db/src/okr-tro-ly-danh-muc.ts`), đơn vị gốc `MINUTE_MS`:
  - `troLyNgayMoiNguoi: 20`;
  - `luotAnMoiNgay: 40`;
  - `nhipAnMucTieuMs: 30 * MINUTE_MS`;
  - `hanKiemKhoaMs: 10 * MINUTE_MS`;
  - `hoiLaiMs: 1_500`;
  - `tranChoMs: 30_000`;
  - `diemXuHuongToiThieu: 3`;
  - `hoanTacNgay: 7`.
- Chữ trên màn: «Chế độ ẩn», «Chế độ ẩn cho», «Bật cho», «Nhờ Trợ lý OKR góp ý», theo bảng trạng thái của design doc. Chữ người nhập mang `translate="no"`.
- Tên kỹ thuật của nấc giữa: giá trị `an`, cột `…AnPhamVi`/`…AnDonVi`, thủ tục `okr.troLyAn`.
- Migration chỉ thêm; đặt mốc sau migration mới nhất trên `onehub` lúc viết (hôm nay `20261002010000`), dự kiến `20261003010000_tro_ly_okr_de_xuat`.
- UI chỉ `@crm/ui` theo subpath; không `className` đổi màu, góc, khoảng cách của component; biến thể mới dựng trong `packages/ui`.
- Test chạm DB là `*.integration.spec.ts` (agent) hoặc chạy qua `bun run test --` (api), id gieo tiền tố `TEST_RUN_ID`, khai `timeout` cho ca chạm DB.
- Dữ liệu thử đi qua bên ghi thật: bộ OKR mẫu qua `napBoOkrMau` (`apps/api/scripts/okr-mau/nap.ts`), cấu hình qua `okr.setProgram`, đề xuất qua `nop_de_xuat` thật, quyết qua `troLyQuyet` thật.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture, thông điệp ghim như `evals.yaml` khai.
- Không ghi vào kho `crm` chung; phép đo màn chạy qua `scripts/lan-do/tien-de.mjs`.
- Tiến trình nền cần `PATH` Node 24.
- Eval gọi model thật chỉ chạy ở S4, sau khi chủ kho khai khoá trả tiền và trần.

## Review Focus

1. **Người sửa ô tên sau khi đề xuất đã hiện, rồi bấm Nhận dòng viết lại tên** — không ghi đè sửa chưa lưu của họ. Nút Nhận dòng đó khoá, kèm câu «Lưu hoặc hoàn lại ô này trước». Pin: Task 7, ca DOM `o-dang-sua`.
2. **Hai thẻ trình duyệt cùng một Mục tiêu; thẻ A nhận, thẻ B bấm Nhận cùng dòng** — B nhận lỗi gọn «Đề xuất này đã được quyết», danh sách của B làm mới, không hàng vết thứ hai. Pin: Task 4, ca API `quyet-lai` (bên cạnh ca đồng thời của E9).
3. **Mục tiêu bị lưu trữ hay xoá khi việc góp ý đang chạy** — `nop_de_xuat` không ghi dòng, việc đóng `khong-lam-duoc` mã `thieu-du-lieu`; `troLyDanhSach` trả rỗng, không ném. Pin: Task 5, ca `muc-tieu-mat`.
4. **Đơn vị đổi từ chế độ ẩn sang bật khi còn lượt ẩn cùng đầu vào** — người bấm nhận một lượt nấc bật mới, không bao giờ thấy dòng nấc ẩn. Pin: Task 4, ca `an-sang-bat`.
5. **Model viết số bằng chữ hay đổi đơn vị («năm tỷ», «50%» khi KR ghi 0,5)** — dòng bị loại `so-moi`. Pin: Task 1, ca trong bảng E6 (năm dạng số).

---

## File Structure

| Tệp | Trách nhiệm |
|---|---|
| `packages/validation/src/okr-tro-ly.ts` | thêm `NAC_TRO_LY`, `nac` trong `okrTroLyViec`, `bi-loai`, `MA_LOAI_DE_XUAT`; khuôn vào/ra của bảy thủ tục |
| `packages/validation/src/okr-chuong-trinh.ts` | bốn trường chế độ ẩn của `okrProgram` và mặc định |
| `packages/validation/src/okr-kiem-de-xuat.ts` (mới) | `kiemDongDeXuat`, `trichSo` |
| `packages/db/src/okr-tro-ly-danh-muc.ts` | hằng mới; `nacCuaDonVi` |
| `packages/db/src/okr-tro-ly.ts` | `troLyOkrSanSang` thêm `nguoiYeuCau`; `xepViecTroLy` thêm `nac`; `xepLuotAnSauKhiLuu`; `ketQuaKiemGanNhat` có hạn; `canKiemLaiKhoa` |
| `packages/db/src/okr-de-xuat.ts` (mới) | `danhSachDeXuat` (kiểm lại, hết hạn, ghi `hienLuc`, lọc quyền do bên gọi truyền), `khoaDeXuat` |
| `packages/db/src/okr-xu-huong.ts` (mới) | `xuHuongKr`, `docDiemXuHuong` |
| `packages/db/prisma/schema.prisma` + migration | bốn cột `OkrProgramConfig`, ba cột `OkrDeXuat` |
| `apps/api/src/okr/okr.service.ts` | `updateObjectiveTrong`, `updateKeyResultTrong`, `addAlignmentTrong`; gọi `xepLuotAnSauKhiLuu` sau khi lưu |
| `apps/api/src/okr/tro-ly.service.ts`, `okr.router.ts`, `okr.contracts.ts` | bảy thủ tục |
| `apps/agent/agent/lib/okr/goi-ngu-canh.ts`, `doc.ts` | gói v1 |
| `apps/agent/agent/subagents/tro_ly_okr/tools/nop_de_xuat.ts` | bộ kiểm, khoá, `nac`, dòng `bi-loai` |
| `apps/agent/agent/subagents/tro_ly_okr/hooks/giu-viec.ts` (mới) | gia hạn lease từ phiên con |
| `apps/agent/agent/subagents/tro_ly_okr/skills/phuong-phap-okr.md`, `instructions.md` | phương pháp OKR tĩnh |
| `apps/agent/agent/lib/dispatch.ts` | xếp lại kiểm khoá khi kết quả cũ quá hạn |
| `packages/ui/src/components/suggestion.tsx` | biến thể câu cũ → câu mới, Nhận · Sửa · Bác, đã quyết |
| `apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx` (mới), `hop-thoai-muc-tieu.tsx`, `hop-thoai-kr.tsx`, `bang-vet.tsx` | màn người dùng |
| `apps/app/app/(app)/[slug]/settings/okr/the-tro-ly-okr.tsx`, `the-gop-y-so-do.tsx` (mới), `khoi-tro-ly-okr.tsx` | màn quản trị |
| `apps/app/lib/messages/tro-ly-okr.ts` | chữ mới |
| `apps/agent/evals/okr/gop-y.eval.ts`, `ng.eval.ts` | eval ca mẫu |
| `_acceptance/tro-ly-okr-de-xuat/rang/*` | thước và kịch bản đo |

---

### Task 1: Khuôn, bộ kiểm đề xuất, bộ đọc số (validation)

**independent: true** · phục vụ E6, E14 (phần khuôn) · verify: `cd packages/validation && bun test test/okr-kiem-de-xuat.spec.ts test/okr-tro-ly.spec.ts`

**Files:**
- Create: `packages/validation/src/okr-kiem-de-xuat.ts`, `packages/validation/test/okr-kiem-de-xuat.spec.ts`
- Modify: `packages/validation/src/okr-tro-ly.ts`, `packages/validation/src/okr-chuong-trinh.ts`, `packages/validation/package.json` (export `./okr-kiem-de-xuat`), `packages/db/src/okr-tro-ly-danh-muc.ts` (enum và hằng sống ở đây, validation nhập lại như 9a)

**Interfaces — Produces:**
- `NAC_TRO_LY = ["tat", "an", "bat"] as const`; `okrTroLyViec` nhánh `de-xuat` thêm `nac: z.enum(["an","bat"]).default("bat")`.
- `TRANG_THAI_DE_XUAT` thêm `"bi-loai"`.
- `MA_LOAI_DE_XUAT = ["id-ngoai-goi","so-moi","tu-cam","noi-ve-nguoi","chep-cap-tren","trung-luat","dich-ngoai-tap","da-bac","dang-cho","khong-doi"] as const`.
- `okrProgram` thêm `aiDeXuatAnPhamVi`, `aiDeXuatAnDonVi`, `aiTomTatAnPhamVi`, `aiTomTatAnDonVi`; mặc định `tat`/`[]`.
- `type GoiKiem = { mucTieu: {id,title,whyNow}; krs: {id,title,startValue,targetValue,currentValue}[]; dichCanChinh: {id, loai:"muc-tieu"|"kr", title}[]; luatDaHoi: {ma: MaLuatOkr; keyResultId: string|null}[]; khoaDaBac: string[]; khoaDangCho: {khoa: string; sau: string}[]; tenThanhVien: string[]; tuCam: readonly string[] }`
- `kiemDongDeXuat(dong: DongDeXuat, goi: GoiKiem): { qua: true } | { qua: false; maLoai: MaLoaiDeXuat }` — thứ tự kiểm: `id-ngoai-goi` → `khong-doi` → `so-moi` → `tu-cam` → `noi-ve-nguoi` → `chep-cap-tren` → `trung-luat` → `dich-ngoai-tap` → `da-bac` → `dang-cho`.
- `khoaDong(dong): string` — viết lại `vl:<obj>:<kr|->:<truong>`; câu hỏi `hoi:<obj>:<kr|->:<maVanDe>`; Căn chỉnh `cc:<obj>:<dich>`.
- `trichSo(chu: string): number[]` — chữ số có dấu chấm hay phẩy (qua `docSoOkr`), hậu tố tỷ/triệu/nghìn/%, số viết bằng chữ «một»…«mười», «hai mươi»…«chín mươi».

- [ ] **Step 1:** Viết bài ma trận E6 trong `test/okr-kiem-de-xuat.spec.ts`. Gói rút từ `docBoCaGopY(THU_MUC_CA_MAU)` (ca đầu mỗi bộ), không dựng tay. Mỗi mã một cặp đỏ và lành cùng gói; đếm cặp bằng số mã, lệch thì in `ma loai chua co cap: <ma>`. Thêm năm dạng số: «5 tỷ», «năm tỷ», «50%», «1,5», «5 tỷ» khi KR ghi 5000000000. Thêm bài `nac` của E14 vào `test/okr-tro-ly.spec.ts`: hàng cấu hình cũ parse ra hai việc tắt.
- [ ] **Step 2:** Chạy bài, thấy đỏ vì chưa có module.
- [ ] **Step 3:** Viết `okr-kiem-de-xuat.ts` theo giao diện trên; từ cấm lấy từ `TRO_LY_OKR_TRAN.tuCam` (danh sách NG-01, NG-02, NG-07 cộng dòng _Avoid_ của `CONTEXT.md` chép vào hằng); so họ tên không dấu dùng `boDau` như `okr-kiem.ts`.
- [ ] **Step 4:** Chạy bài, xanh. Phá thử: bản sao bỏ nhánh `so-moi` → đỏ `lot so moi: 5`. Hoàn lại.
- [ ] **Step 5:** Commit `feat(okr): bộ kiểm đề xuất và bộ đọc số`.

### Task 2: Cột mới, luật nấc, trần người/ngày, danh sách đề xuất, xu hướng (db)

**independent: false** (cần Task 1) · phục vụ E5 (phần db), E12, E14, E15 (migration), E19 (phần db) · verify: `bun run test -- "cd packages/db && bun test test/okr-xu-huong.spec.ts"` và `cd packages/validation && bun test test/okr-tro-ly.spec.ts -t nac`

**Files:**
- Modify: `packages/db/prisma/schema.prisma`; Create: `packages/db/prisma/migrations/20261003010000_tro_ly_okr_de_xuat/migration.sql`
- Modify: `packages/db/src/okr-tro-ly-danh-muc.ts`, `packages/db/src/okr-tro-ly.ts`
- Create: `packages/db/src/okr-de-xuat.ts`, `packages/db/src/okr-xu-huong.ts`, `packages/db/test/okr-xu-huong.spec.ts`; export trong `packages/db/package.json`

**Interfaces — Produces:**
- Cột: `OkrProgramConfig.aiDeXuatAnPhamVi String @default("tat")`, `aiDeXuatAnDonVi String[] @default([])`, `aiTomTatAnPhamVi`, `aiTomTatAnDonVi`; `OkrDeXuat.nac String @default("bat")`, `maLoai String?`, `hienLuc DateTime?`; chỉ mục `@@index([objectiveId, nac, trangThai])`.
- `nacCuaDonVi(ct: CauHinhAi, viec: ViecTroLy, donVi: DonViMucTieu): "tat"|"viec-tat"|"don-vi-chua-bat"|"an"|"bat"` — thay `donViDuocBat`; mọi chỗ gọi cũ so `=== "bat"`.
- `troLyOkrSanSang(db, { viec, objectiveId?, keyResultId?, nguoiYeuCau?, now?, coTacTu? })` → thêm lý do `het-tran-ngay` (đếm `AgentTask` `okr-de-xuat` nấc `bat` của người đó từ 00:00 giờ Việt Nam, không tính lượt dùng lại vì lượt dùng lại không ghi hàng); nấc `an` trả `{bat:false, lyDo:"don-vi-chua-bat"}` cho người dùng.
- `xepViecTroLy(db, { viec:"de-xuat", objectiveId, keyResultId, nguoiYeuCau, nac })` → `{ taskId, dungLai: boolean } | { bat:false, lyDo }`; dùng lại khi có hàng cùng `inputHash` và cùng nấc, chưa đóng hoặc đóng `da-nop`.
- `xepLuotAnSauKhiLuu(db, { objectiveId, keyResultId, nguoiLuu, doiChu: boolean, now })` → không làm gì khi `!doiChu`, nấc không phải `an`, đã có lượt ẩn của Mục tiêu trong `nhipAnMucTieuMs`, hoặc đủ `luotAnMoiNgay`.
- `ketQuaKiemGanNhat(db, luc)` → `{ ketQua, luc }`; `canKiemLaiKhoa(db, now): boolean` — `aiOn` và kết quả gần nhất là `chua-co-khoa-mo-hinh` cũ hơn `hanKiemKhoaMs` và không có việc kiểm đang chờ.
- `danhSachDeXuat(db, { objectiveId, keyResultIds: string[] | "moi", nac: "bat", now })` → `DongHien[]`: chỉ `cho`, chạy lại `kiemDongDeXuat` với số hiện tại (qua thì giữ, không qua thì bỏ khỏi kết quả), dòng có `truoc` khác giá trị hiện tại thành `het-han`, ghi `hienLuc` cho dòng trả lần đầu; kèm `dangSoan` và `maKetThuc` của việc mới nhất.
- `xuHuongKr(diem: {tuan: Date; giaTri: number}[], ketThucKy: Date, kieu: KieuKr): { moiTuan: number; uocCuoiKy: number } | null`; `docDiemXuHuong(db, keyResultId)` đọc `OkrSoChup` (KR nguồn CRM) hoặc lần cập nhật của KR kỳ trước qua `OkrMangSang`.

- [ ] **Step 1:** Bài E12 ma trận xu hướng (sáu kiểu × 2, 3, 4 điểm), bài E14 ma trận `nacCuaDonVi` (in số ô).
- [ ] **Step 2:** Đỏ.
- [ ] **Step 3:** Sửa schema, viết migration chỉ thêm, `bun run db:generate`; viết các hàm.
- [ ] **Step 4:** Xanh; phá thử: hạ số điểm tối thiểu về 2 → `xu huong tu 2 diem`; cho ẩn thắng bật → ô lệch in ra. Hoàn lại.
- [ ] **Step 5:** Commit `feat(okr): cột chế độ ẩn, luật nấc, danh sách đề xuất, xu hướng`.

### Task 3: Ghi có giao dịch và kích chế độ ẩn khi lưu (API · OkrService)

**independent: false** (cần Task 2) · phục vụ E11, E17 (phần kích) · verify: `bun run test -- "cd apps/api && bun test test/okr*.spec.ts"`

**Files:**
- Modify: `apps/api/src/okr/okr.service.ts`
- Test: `apps/api/test/tro-ly-okr-hoan-tac.spec.ts` (ca kích ẩn và hoàn tác nằm ở Task 4)

**Interfaces — Produces:**
- `updateObjectiveTrong(tx, userId, input, opts?: { note?: string })`, `updateKeyResultTrong(tx, userId, input, opts?)`, `addAlignmentTrong(tx, userId, input, opts?)` — thân cũ, cộng `note` vào hàng `OkrTrail`; ba hàm cũ mở `$transaction` rồi gọi hàm mới, trả đúng giá trị như trước.
- Sau khi `updateObjective`, `updateKeyResult`, `createKeyResult` commit xong: gọi `xepLuotAnSauKhiLuu` với `doiChu` = tên, «vì sao lúc này» hay tên KR khác bản trước; lỗi của bước này ghi log cảnh báo, không làm hỏng lần lưu.

- [ ] **Step 1:** Chạy nguyên bộ `test/okr*.spec.ts` trước khi sửa, ghi số ca xanh.
- [ ] **Step 2:** Tách ba hàm; không đổi kỳ vọng nào.
- [ ] **Step 3:** Chạy lại, cùng số ca xanh; `git diff --stat` các tệp bài cũ rỗng.
- [ ] **Step 4:** Commit `refactor(okr): ba hàm ghi nhận giao dịch; kích chế độ ẩn sau khi lưu`.

### Task 4: Bảy thủ tục Trợ lý OKR (API)

**independent: false** (cần Task 2, 3) · phục vụ E1, E5, E9, E11, E13, E15, E17, E20 · verify: `bun run test -- "cd apps/api && bun test test/tro-ly-okr-de-xuat-quyen.spec.ts test/tro-ly-okr-de-xuat-tran.spec.ts test/tro-ly-okr-quyet.spec.ts test/tro-ly-okr-hoan-tac.spec.ts test/tro-ly-okr-xu-huong.spec.ts test/tro-ly-okr-nac.spec.ts test/tro-ly-okr-che-do-an.spec.ts test/tro-ly-okr-so-do.spec.ts"` (tên tệp khớp khoá `tdx_*` trong `_acceptance/config.yaml`)

**Files:**
- Modify: `apps/api/src/okr/tro-ly.service.ts`, `apps/api/src/okr/okr.router.ts`, `apps/api/src/okr/okr.contracts.ts`
- Create: tám tệp bài ở dòng verify; `_acceptance/tro-ly-okr-de-xuat/rang/{ty-le-quyet,hoan-tac,do-tre,bi-loai,chi-phi-moi-nhan}.sql`

**Interfaces — Produces (router, mỗi thủ tục có `restMeta` như thủ tục OKR sẵn có):**
- `troLySanSang({ objectiveId, keyResultId? })` → `troLySanSang` — kiểm quyền sửa (`assertSuaMucTieu` / `assertSuaKr`), trả lý do có tên.
- `troLyDeXuat({ objectiveId, keyResultId? })` → `{ taskId }` — cùng kiểm quyền, `xepViecTroLy` nấc `bat`, poke dispatch.
- `troLyDanhSach({ objectiveId, keyResultId? })` → `{ dong: DongHien[]; dangSoan: boolean; maKetThuc: string|null }` — tập KR truyền vào `danhSachDeXuat` là tập KR người gọi sửa được; người không sửa được gì → 403.
- `troLyQuyet({ deXuatId, cach: "nhan"|"sua"|"bac"|"bo-qua", giaTri? })` → `{ ok: true }` — một `$transaction`: kiểm quyền trên đích của dòng (cả `bac`, `bo-qua`); `updateMany where { id, trangThai:"cho" }` đếm 0 → lỗi `CONFLICT` «Đề xuất này đã được quyết»; nhận/sửa gọi hàm `…Trong` với `note: "tro-ly-okr:<id>"`.
- `troLyAn({ thang? })` → danh sách lượt nấc `an` và dòng (kể cả `bi-loai`) — `assertQuanTri`.
- `troLySoDo({ thang? })` → số của thẻ, tính đúng như năm câu SQL — `assertQuanTri`.
- `xuHuongKr({ keyResultId })` → `{ moiTuan, uocCuoiKy } | null` — null khi nấc không phải `bat`.

- [ ] **Step 1:** Viết tám tệp bài theo `expected` của E1, E5, E9, E11, E13, E15, E17, E20, dựng cảnh bằng `napBoOkrMau`; thêm ca Review Focus 2 `quyet-lai` và 4 `an-sang-bat`.
- [ ] **Step 2:** Đỏ.
- [ ] **Step 3:** Viết thủ tục và năm câu SQL (đường suy từ vị trí bài).
- [ ] **Step 4:** Xanh; phá thử mỗi chiều đỏ khai trong `evals.yaml` (bỏ `assertSuaKr`, bỏ kiểm quyền nhánh bác, cập nhật không điều kiện, bỏ lọc `nac`, SQL tính cả dòng chưa hiện, cộng tiền ẩn vào tử số). Hoàn lại.
- [ ] **Step 5:** Commit `feat(okr): bảy thủ tục Trợ lý OKR`.

### Task 5: Subagent — gói v1, bộ kiểm khi nộp, giữ chỗ việc, kiểm khoá hết hạn (agent)

**independent: false** (cần Task 1, 2) · phục vụ E7, E8, E18, E19, E23, E26 · verify: `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tro-ly-okr-nop.integration.spec.ts test/tro-ly-okr-giu-viec.integration.spec.ts test/tro-ly-okr-san-sang.integration.spec.ts test/tro-ly-okr-duong-do.integration.spec.ts test/tro-ly-okr-cach-ly.spec.ts test/khuon-di-dong.spec.ts"`

**Files:**
- Modify: `apps/agent/agent/lib/okr/goi-ngu-canh.ts`, `lib/okr/doc.ts`, `subagents/tro_ly_okr/tools/nop_de_xuat.ts`, `subagents/tro_ly_okr/instructions.md`, `lib/dispatch.ts`, `lib/okr/config.ts`
- Create: `subagents/tro_ly_okr/hooks/giu-viec.ts`, `subagents/tro_ly_okr/skills/phuong-phap-okr.md`
- Create/Modify tests: `test/tro-ly-okr-nop.integration.spec.ts`, `test/tro-ly-okr-giu-viec.integration.spec.ts`, `test/tro-ly-okr-san-sang.integration.spec.ts` (ca `kiem-khoa-het-han`), `test/tro-ly-okr-duong-do.integration.spec.ts`, `test/tro-ly-okr-cach-ly.spec.ts` (ca `judge-zdr`); `_acceptance/tro-ly-okr-de-xuat/rang/so-moi-lot.mjs`

**Interfaces — Consumes:** `kiemDongDeXuat`, `khoaDong` (Task 1); `danhSachDeXuat`, `canKiemLaiKhoa`, `ketQuaKiemGanNhat` (Task 2).

**Interfaces — Produces:**
- `dungGoiDeXuat(objectiveId, { keyResultId })` → `GoiDeXuat` v1 = v0 + `phamVi: "objective"|"kr"`, `dichCanChinh` (điều kiện đích Căn chỉnh đã tách ở 9a), `luatDaHoi` (`kiemOkr` trên dữ liệu đã lưu), `khoaDaBac`, `khoaDangCho`; `goiKiemTu(goi)` → `GoiKiem`.
- `nop_de_xuat`: mọi dòng qua `kiemDongDeXuat`; ghi dòng qua kiểm `cho`, dòng không qua `bi-loai` + `maLoai`; `nac` lấy từ payload; Mục tiêu không còn → trả `thieu-du-lieu`, không ghi.
- `hooks/giu-viec.ts`: `"*"` → tìm việc qua `phienGocCua` + `docViecTheoPhienGoc`, gọi `giaHanLease`; lỗi nuốt có cảnh báo.
- `dispatch.ts`: mỗi nhịp, `canKiemLaiKhoa` → `okrKiemSanSang` xếp một việc, chống trùng bằng khoá idempotency sẵn có.

- [ ] **Step 1:** Viết bài E7, E8, E18, E19, E26, E23 và ca Review Focus 3 `muc-tieu-mat`; phiên con dựng theo `lib/phien-con.ts`.
- [ ] **Step 2:** Đỏ; E18 đỏ đúng `dong giua chung khi phien con chay` trên mã hiện tại (đây là lỗi 9a — chứng đỏ trước khi vá).
- [ ] **Step 3:** Viết mã; `instructions.md` giữ câu «Act at once…» của 9a ở đầu phần việc; skill tĩnh đặt trước để ăn cache.
- [ ] **Step 4:** Xanh; phá thử theo `evals.yaml`. `test/khuon-di-dong.spec.ts` xanh (khuôn tool không đệ quy).
- [ ] **Step 5:** Commit `feat(agent): gói v1, bộ kiểm khi nộp, giữ chỗ việc, kiểm khoá hết hạn`.

### Task 6: Biến thể `Suggestion` (packages/ui)

**independent: true** · phục vụ E3 (phần thành phần), E29 · verify: `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/suggestion.dom.tsx`

**Files:**
- Modify: `packages/ui/src/components/suggestion.tsx`; Create: `packages/ui/test/suggestion.dom.tsx`
- Modify: `packages/ui/src/locale/*` nếu thêm chữ nút (`msg.suggestion.edit`, `…accept`, `…dismiss` có sẵn)

**Interfaces — Produces:** `Suggestion` thêm prop tuỳ chọn `before?: ReactNode`, `label?: ReactNode`, `onEdit?: (value: string) => void`, `editing?: boolean`, `decided?: "accepted" | "dismissed"`, `error?: ReactNode`, `acceptDisabledReason?: ReactNode`; giữ nguyên dáng cũ khi không truyền prop mới (dùng ở `facts.tsx`). Câu cũ gạch và câu mới dùng token `diff-bo`/`diff-them` của `diff-trang`. Không mặc định chuỗi trong tham số (bài `lai-ra-man`).

- [ ] **Step 1:** Bài DOM: dáng cũ không đổi (ảnh DOM của `facts.tsx` giữ nguyên); dáng mới có câu cũ, câu mới, ba nút chữ, ô sửa, đã quyết, lỗi, nút Nhận khoá kèm lý do.
- [ ] **Step 2:** Đỏ. **Step 3:** Viết. **Step 4:** Xanh; `design-gate` tĩnh trên tệp, P0 bằng 0.
- [ ] **Step 5:** Commit `feat(ui): Suggestion hiện câu cũ cạnh câu mới`.

### Task 7: Cột góp ý trên hộp thoại Mục tiêu và KR, dòng xu hướng, vết (app)

**independent: false** (cần Task 4, 6) · phục vụ E2, E3, E10, E29 · verify: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tro-ly-okr-gop-y.dom.tsx ./test/tro-ly-okr-vet.dom.tsx`

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/cot-gop-y.tsx`, `apps/app/test/tro-ly-okr-gop-y.dom.tsx`, `apps/app/test/tro-ly-okr-vet.dom.tsx`
- Modify: `hop-thoai-muc-tieu.tsx`, `hop-thoai-kr.tsx`, `bang-vet.tsx`, `apps/app/lib/messages/tro-ly-okr.ts`, `apps/app/lib/trpc/cache.ts` (làm mới Mục tiêu và KR sau khi quyết)

**Interfaces — Consumes:** bảy thủ tục (Task 4), `Suggestion` (Task 6), `TRO_LY_OKR_TRAN.hoiLaiMs`/`tranChoMs`.

**Interfaces — Produces:** `CotGopY({ objectiveId, keyResultId?, coSuaChuaLuu, oDangSua: Set<"title"|"whyNow"|string>, onDaNhan })` — client component nhận dữ liệu từ tRPC, không nhập gói máy chủ. Hộp thoại dùng `Dialog size="wide"` khi cột mở. Toast sau khi nhận có «Hoàn tác» gọi `updateObjective`/`updateKeyResult` với `truoc`.

- [ ] **Step 1:** Bài DOM: mỗi dòng `ST-muctieu-*` và `ST-kr-*` của bảng trạng thái (rút từ design doc lúc chạy), bảng lý do không sẵn sàng rút từ `LY_DO_KHONG_SAN_SANG`, đồng hồ giả hỏi lại và trần chờ, ca Hoàn tác gửi `truoc`, ca Review Focus 1 `o-dang-sua`; bài vết đọc `note`.
- [ ] **Step 2:** Đỏ. **Step 3:** Viết. **Step 4:** Xanh; phá thử theo E3; `design-gate` tĩnh trên các tệp.
- [ ] **Step 5:** Commit `feat(okr): nút và cột góp ý trên hộp thoại Mục tiêu và KR`.

### Task 8: Thẻ Trợ lý OKR hai dòng nấc và thẻ số đo (app · Cài đặt)

**independent: false** (cần Task 4, 6) · phục vụ E16, E21, E29 · verify: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tro-ly-okr-cai-dat.dom.tsx ./test/tro-ly-okr-so-do.dom.tsx`

**Files:**
- Modify: `settings/okr/the-tro-ly-okr.tsx`, `settings/okr/khoi-tro-ly-okr.tsx`, `apps/app/lib/messages/tro-ly-okr.ts`
- Create: `settings/okr/the-gop-y-so-do.tsx`, `apps/app/test/tro-ly-okr-so-do.dom.tsx`; Modify: `apps/app/test/tro-ly-okr-cai-dat.dom.tsx` (ca `nac`)

**Interfaces — Produces:** mỗi việc hai `Field` «Bật cho» và «Chế độ ẩn cho» (`Select` ba lựa chọn + `PickListDialog`); bật toàn công ty khoá dòng chế độ ẩn; danh sách chế độ ẩn loại đơn vị đã bật. Thẻ số đo: `SimpleTable` hai cột Bật · Ẩn, bảng lượt, `Sheet` một lượt với dòng bị loại và nhãn mã (bảng nhãn rút từ `MA_LOAI_DE_XUAT`).

- [ ] **Step 1:** Bài DOM E16, E21. **Step 2:** Đỏ. **Step 3:** Viết. **Step 4:** Xanh, phá thử. **Step 5:** Commit `feat(okr): nấc chế độ ẩn và thẻ số đo ở Cài đặt`.

### Task 9: Eval ca mẫu, thước độ trễ, kịch bản màn thật (rang + evals)

**independent: false** (cần Task 5, 7, 8) · phục vụ E4, E22, E24, E25 · verify: `node --check` mọi tệp `rang/*.mjs`; `bun _acceptance/tro-ly-okr-de-xuat/rang/eval-gop-y.mjs --kho` (chỉ dựng kho, không gọi model) thoát 0. Chạy thật E4, E22, E24 ở S4.

**Files:**
- Create: `apps/agent/evals/okr/gop-y.eval.ts`, `apps/agent/evals/okr/ng.eval.ts`
- Create: `_acceptance/tro-ly-okr-de-xuat/rang/{eval-gop-y,do-tre,man-gop-y}.mjs`; `evidence/hieu-chinh-judge.md` sinh ở S4 cho chủ kho chấm

**Interfaces — Consumes:** `docBoCaGopY`, `THU_MUC_CA_MAU` (M); judge `zai/glm-5.2-fast` với `judge.modelOptions.providerOptions.gateway.zeroDataRetention: true`.

- [ ] **Step 1:** Viết hai eval; chốt bằng mã theo E22; judge `closedQA` ba ý.
- [ ] **Step 2:** Viết `eval-gop-y.mjs` (kho đo, `napBoOkrMau`, chạy eval, in `ma: n/n · judge: x`, ca đối chứng «gọi 50 cuộc»), `do-tre.mjs` (20 lượt, đọc bằng `do-tre.sql`), `man-gop-y.mjs` (các bước E4, canh cây trước màn đầu).
- [ ] **Step 3:** Chạy phần không gọi model; commit `test(okr): eval ca mẫu, thước độ trễ, kịch bản màn`.

### Task 10: Tài liệu và lộ trình

**independent: false** (cuối cùng) · phục vụ E27, E28 · verify: `node _acceptance/tro-ly-okr-de-xuat/rang/tai-lieu.mjs`

**Files:**
- Modify: `docs/api.md` §OKR (bảy thủ tục, ai gọi được, kích chế độ ẩn khi lưu), `docs/agent.md` (mục «Chỗ rẽ: Trợ lý OKR (lượt 9b)» liệt tệp của hãng chạm thêm: `lib/dispatch.ts`, tệp mới trong `subagents/tro_ly_okr/`), `docs/plan/lo-trinh-okr.md` (đổi «chạy bóng» → «chế độ ẩn»; dòng 9b mục 10), `docs/plan/lo-trinh-tro-ly-okr.md` (cùng đổi chữ)
- Create: `_acceptance/tro-ly-okr-de-xuat/rang/tai-lieu.mjs`

- [ ] **Step 1:** Viết `tai-lieu.mjs` (danh sách thủ tục rút từ `okr.router.ts`), đỏ trước khi sửa tài liệu.
- [ ] **Step 2:** Sửa tài liệu; xanh; phá thử xoá một tên → `tai lieu thieu thu tuc: <ten>`.
- [ ] **Step 3:** Commit `docs(okr): Trợ lý OKR góp ý khi bấm, chế độ ẩn`.

---

## Thứ tự và song song

- Task 1 và Task 6 chạy song song ngay sau khi gộp `onehub`.
- Rồi 2 → 3 → 4; Task 5 chạy song song với 3–4 sau khi 2 xong.
- Rồi 7 và 8 song song; cuối cùng 9, 10.
- Hết S3: năm lệnh chứng (`bun run test`, `check-types`, `lint`, `lint:slop`, `build`) xanh rồi mới đặt hợp đồng `implemented`.
