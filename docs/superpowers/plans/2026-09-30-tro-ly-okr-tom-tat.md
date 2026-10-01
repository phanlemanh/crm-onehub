# Tóm tắt tuần (9c · tro-ly-okr-tom-tat) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sáng hôm sau ngày cập nhật, bảng họp tuần của mỗi phòng ban có đoạn Trợ lý OKR tóm tắt tuần, câu nào cũng bấm ra lần cập nhật gốc và mọi số đã được mã so lại; Trưởng phòng ban nhận một dòng báo tắt được; quản trị thấy mọi bản ở màn Sức khoẻ; ba nấc tắt · chế độ ẩn · bật.

**Architecture:** Khuôn bản tóm tắt và bộ kiểm câu ở `packages/validation`; luật «đáng bàn» dời sang `@crm/db/okr-hop-tuan`; gói ngữ cảnh, ghi bản, đọc bản cho người xem và dòng nhắc ở `@crm/db/okr-tom-tat` để API và `apps/agent` dùng chung; `apps/agent` có việc xếp tự nối theo ngày và nhánh tóm tắt của subagent `tro_ly_okr` với tool `nop_tom_tat`; API chỉ đọc bảng tóm tắt, kiểm lại lúc hiện và ghi phản hồi; màn đọc API.

**Tech Stack:** Bun, Turbo, Prisma 7 (Postgres), Zod 4, NestJS + nestjs-trpc, eve 0.29.4, AI SDK (Gateway), Next.js 16, `@crm/ui` (shadcn, AI Elements `inline-citation`), bun:test, puppeteer-core.

**Hạng T2** — không Cổng 1.5; S2 đi thẳng S3.

**Spec:** `docs/superpowers/specs/2026-09-30-tro-ly-okr-tom-tat-design.md` · hợp đồng `_acceptance/tro-ly-okr-tom-tat/contract.md` (duyệt 30/09, Manh Phan) · bộ đo `_acceptance/tro-ly-okr-tom-tat/evals.yaml` (22 phép) · bản mẫu `apps/app/app/proto/_modules/tro-ly-okr-tom-tat/`.

## Global Constraints

- Không chú thích trong mã, ở mã mới và mã sửa (`AGENTS.md`).
- Trí khôn chỉ ở `apps/agent`; API không gọi model, chỉ đọc `OkrTomTat` và ghi `OkrTomTatPhanHoi` (`docs/api.md`).
- Không migration, không biến môi trường mới.
- Parse ở biên bằng Zod trong `packages/validation`, một module mỗi khuôn, nhập theo subpath; `OkrTomTat.cau` và `trangThai` parse lúc đọc, hỏng là lỗi có tên, không nuốt thành rỗng.
- Mọi hằng tinh chỉnh ở `OKR_TOM_TAT` trong `packages/db/src/okr-tro-ly-danh-muc.ts`, đơn vị gốc `MINUTE_MS`/`NGAY_MS` sẵn có:
  - `gioXep: { gio: 6, phut: 0 }` (giờ VN);
  - `cuaSoNgay: 7` (cập nhật trong 7 ngày trước giờ chạy);
  - `tyLeGiuLai: 0.3`;
  - `soCauToiDa` và trần chữ dùng lại `TRO_LY_OKR_TRAN.soCauTomTat`, `TRO_LY_OKR_TRAN.chu.cauTomTat`, `TRO_LY_OKR_TRAN.soNguonMoiCau`;
  - `hienTrongNgay: 8` (bản còn hiện trên bảng trong 8 ngày);
  - `hoiLaiMs: 5_000`, `tranChoMs: 120_000` (màn đang soạn);
  - `dongBaoAiToiDa: 2` (dòng báo máy mỗi tin).
- Chữ trên màn theo bảng trạng thái của design doc; chữ máy viết về dữ liệu người nhập và chữ người nhập mang `translate="no"`.
- UI chỉ `@crm/ui` theo subpath; không `className` đổi màu, góc, khoảng cách; biến thể mới dựng trong `packages/ui`. `inline-citation` cài bằng CLI (`docs/chat-ui.md` Rule 2) và phải tới được một màn trong cùng thay đổi (cổng mồ côi).
- Test chạm DB là `*.integration.spec.ts` (agent) hoặc chạy qua `bun run test --` (api, db); id gieo tiền tố `TEST_RUN_ID`; khai `timeout` cho ca chạm DB (trần 5 s của bun test cắn dưới tải).
- Không chạy `bun` trần chạm `@crm/db`: mọi script qua `bun run test -- "<lệnh>"`.
- Dữ liệu thử đi qua bên ghi thật: bộ OKR mẫu qua `napBoOkrMau`, cấu hình qua đường ghi của `okr.setProgram`, bản tóm tắt qua hàm ghi của `nop-tom-tat`, phản hồi qua `troLyTomTatPhanHoi`, vết mở bảng qua `OkrXemService.moHopTuan`.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture, thông điệp ghim như `evals.yaml` khai; lượt phá-thử commit trước khi `git checkout` hoàn lại.
- Eval gọi model thật (E9, E17) chỉ chạy ở S4, sau khi chủ kho khai khoá trả tiền và trần.
- Mỗi task sửa `apps/api/src/okr/okr.router.ts` phải chạy `bun run trpc:generate` sau đó; import khuôn ở router bằng tên gốc, không `as` (trpc:generate hỏng với `as`).

## Review Focus

1. **Chu kỳ có ngày cập nhật là Chủ nhật** — việc xếp sáng thứ Hai phải nhận ra «hôm qua» là ngày cập nhật dù sang tuần ISO mới, và `tuan` của bản là thứ Hai của tuần chứa Chủ nhật đó. Pin: Task 4, ca `cn-sang-t2`.
2. **Tác tử tắt qua 06:00, chạy lại lúc 10:00** — việc xếp vẫn chạy cho ngày hôm đó (không bỏ ngày); bản ghi sau 08:30 vào tin nhắc sáng hôm sau, không mất. Pin: Task 4, ca `xep-muon`; Task 7, ca `ban-sau-moc`.
3. **Phòng ban đã lưu trữ hoặc chưa có trưởng** — việc xếp bỏ qua phòng lưu trữ; phòng không trưởng vẫn có bản trên bảng nhưng không ai nhận dòng báo, không lỗi. Pin: Task 4, ca `phong-luu-tru`; Task 7, ca `khong-truong`.
4. **KR kiểu «giảm xuống» có câu «giảm 3»** — luật chiều so dấu của giá trị, không so tốt/xấu: giá trị giảm thì «giảm» đúng. Pin: Task 2, cặp ca `giam-xuong`.
5. **Người xem chọn chu kỳ khác trên bảng họp tuần** — `troLyTomTat` trả bản của đúng chu kỳ đã chọn; chu kỳ không có bản trong 8 ngày thì không có khối (không lấy bản của chu kỳ kia). Pin: Task 6, ca `chu-ky-khac`.

---

## File Structure

| Tệp | Trách nhiệm |
|---|---|
| `packages/db/src/okr-hop-tuan.ts` (mới, dời từ `apps/api/src/okr/hop-tuan.ts`) | luật «đáng bàn» và xếp bảng họp tuần |
| `packages/validation/src/okr-tom-tat.ts` (mới) | `noiDungTomTat`, `TRANG_THAI_TOM_TAT`, `MA_BO_CAU`, khuôn vào/ra ba thủ tục |
| `packages/validation/src/okr-kiem-tom-tat.ts` (mới) | `kiemCauTomTat`, `kiemBanTomTat` thuần |
| `packages/validation/src/okr-tro-ly.ts` | nhánh `tom-tat-tuan` của `okrTroLyViec` thêm `nac` |
| `packages/validation/src/nhac-ke-hoach.ts` | nhánh `okr-tom-tat` của `mucNhac` |
| `packages/db/src/okr-tro-ly-danh-muc.ts` | `OKR_TOM_TAT` |
| `packages/db/src/okr-tom-tat.ts` (mới) | gói, ghi bản, đọc bản cho người xem, trạng thái tuần, dòng nhắc |
| `apps/agent/agent/lib/okr/lich-tom-tat.ts` (mới) | `chayXepTomTat`, `damBaoLichTomTat` |
| `apps/agent/agent/lib/okr/nop-tom-tat.ts` (mới), `subagents/tro_ly_okr/tools/nop_tom_tat.ts` (mới), `instructions/viec.ts`, `instructions.md` | nhánh tóm tắt của subagent |
| `apps/agent/agent/lib/okr/viec.ts`, `lib/dispatch.ts`, `lib/okr/doc.ts`, `lib/so-chi-phi.ts` | chặn trước khi gửi theo nấc và đơn vị; nhánh trực tiếp; bảng đọc; nhóm chi phí từ hàng việc |
| `apps/agent/agent/lib/tin-nhac.ts`, `lib/nhac-ke-hoach.ts`, `packages/db/src/onboarding-nhac.ts` | dòng báo tóm tắt, trần hai dòng AI |
| `apps/api/src/okr/tro-ly.service.ts`, `okr.router.ts`, `okr.contracts.ts` | ba thủ tục |
| `apps/api/src/zalo/zalo.service.ts`, `zalo.router.ts` | đọc và ghi `dongTroLyOkr`, cờ `laTruongPhong` |
| `packages/ui/src/components/ai-elements/inline-citation.tsx` | cài CLI + mở bằng bấm |
| `apps/app/app/(app)/[slug]/okr/khoi-tom-tat.tsx` (mới), `hop-tuan.tsx` | khối tóm tắt |
| `apps/app/app/(app)/[slug]/okr/toan-canh/suc-khoe/tom-tat-quan-tri.tsx` (mới), `suc-khoe.tsx` | khối quản trị |
| `apps/app/app/(app)/[slug]/settings/notifications/khoi-kenh.tsx` | công tắc tắt dòng |
| `apps/app/lib/messages/okr-toan-canh.ts`, `nhac-qua-zalo.ts` | chữ mới |
| `apps/agent/evals/okr/tom-tat.eval.ts` | eval Tóm tắt |
| `_acceptance/tro-ly-okr-tom-tat/rang/*` | thước, kịch bản đo |

---

### Task 1: Dời luật «đáng bàn» ra `@crm/db`

**independent: true** · phục vụ E1, E2 · verify: `cd packages/db && bun test test/okr-hop-tuan.spec.ts` và `bun run test -- "cd apps/api && bun test test/okr-toan-canh-thuan.spec.ts"`

**Files:**
- Create: `packages/db/src/okr-hop-tuan.ts` (git mv từ `apps/api/src/okr/hop-tuan.ts`), `packages/db/test/okr-hop-tuan.spec.ts`, `_acceptance/tro-ly-okr-tom-tat/rang/ky-vong-khong-doi.mjs`
- Modify: `packages/db/package.json` (export `./okr-hop-tuan`), `apps/api/src/okr/okr-xem.service.ts`, `toan-canh.ts`, `dien-bien.ts`, `apps/api/test/okr-toan-canh-thuan.spec.ts` (chỉ dòng import)

**Interfaces — Produces:** `@crm/db/okr-hop-tuan` xuất nguyên các tên hiện có: `LanCapNhat`, `KrSo`, `LyDoHop`, `LoaiLyDo`, `lyDoCua(kr, homNay)`, `congTuan`, `cacTuan`, `moiNhat`, `cuoiTrongTuan`, `moiNhatDenTuan`, `DongXep`, `XepHop`, `xepHopTuan`, `SoTuTin`, `SoTuanCuaNhom`, `soTuanCuaNhom`. Phần `OKR_XEM.thoiGian` nó dùng thay bằng `NGAY_MS` và `7` lấy từ hằng sẵn có của `@crm/db` (không khai hằng thứ hai).

- [ ] **Step 1:** Viết `packages/db/test/okr-hop-tuan.spec.ts`: bảng ca viết trước của E1 (tụt 1 và 2 bậc, tụt so tuần trước khi tuần này hai lần, im 13/14 ngày từ lần cuối, im 14 ngày từ `khoaLuc`, ghi chú trước và sau đầu tuần trước, KR trống) — mỗi ca `toEqual` mảng lý do; in số ca; và kiểm `apps/api/src/okr/hop-tuan.ts` không tồn tại (đường suy từ `import.meta.dir`).
- [ ] **Step 2:** Chạy, đỏ vì chưa có module.
- [ ] **Step 3:** `git mv`, sửa import trong bốn tệp API, thêm export.
- [ ] **Step 4:** Viết `ky-vong-khong-doi.mjs`: `git diff -U0 $(git merge-base HEAD origin/onehub) -- <năm tệp test của E2>`; mọi dòng `+`/`-` không bắt đầu bằng `import`/`} from` thì in `ky vong bi sua: <tep>` và thoát 1.
- [ ] **Step 5:** Xanh cả hai lệnh verify và `node _acceptance/tro-ly-okr-tom-tat/rang/ky-vong-khong-doi.mjs`. Phá thử: đổi `>=` thành `>` ở luật im → ca 14 ngày đỏ `ly do lech: im-14`. Commit phá thử, rồi hoàn lại.
- [ ] **Step 6:** Commit `refactor(okr): dời luật đáng bàn sang @crm/db/okr-hop-tuan`.

### Task 2: Khuôn bản tóm tắt và bộ kiểm câu (validation)

**independent: true** · phục vụ E4 · verify: `cd packages/validation && bun test test/okr-kiem-tom-tat.spec.ts`

**Files:**
- Create: `packages/validation/src/okr-tom-tat.ts`, `packages/validation/src/okr-kiem-tom-tat.ts`, `packages/validation/test/okr-kiem-tom-tat.spec.ts`
- Modify: `packages/validation/package.json` (hai export), `packages/validation/src/okr-tro-ly.ts` (nhánh `tom-tat-tuan` thêm `nac: z.enum(["an","bat"]).default("bat")`), `packages/validation/src/nhac-ke-hoach.ts` (nhánh `okr-tom-tat`)

**Interfaces — Produces:**
- `TRANG_THAI_TOM_TAT = ["hien", "can-xem"] as const`; `MA_BO_CAU = ["nguon-ngoai-goi","so-lech","sai-chieu","noi-ve-nguoi","tu-cam","trung-cau"] as const`.
- `noiDungTomTat = z.object({ nac: z.enum(["an","bat"]), cau: z.array(cauTomTat), bo: z.array(cauTomTat.extend({ maBo: z.enum(MA_BO_CAU) })) })`; `parseNoiDungTomTat(value: unknown): NoiDungTomTat` ném lỗi có tên.
- `type NguonKiem = { id: string; keyResultId: string; giaTri: number; truoc: number | null; chenhLech: number | null; chenhTuTin: -2|-1|0|1|2|null; ngay: string /*dd/mm*/ }`; `type KrKiem = { id: string; khoiDiem: number|null; dich: number|null; tienDo: number|null }`; `type GoiKiemTomTat = { nguon: NguonKiem[]; krs: KrKiem[]; tenThanhVien: string[]; tuCam: readonly string[]; chuDauVao: string }`.
- `kiemCauTomTat(cau: CauTomTat, goi: GoiKiemTomTat, truoc: readonly string[]): { qua: true } | { qua: false; maBo: MaBoCau }` — thứ tự bảng §8 thiết kế; số đọc bằng `trichSo` của `okr-kiem-de-xuat` và chấp nhận cả cách đọc kiểu Anh (`1.5`, `1,200`, `3k`, `12.5%`): một số khớp khi MỘT trong các cách đọc bằng một giá trị tham chiếu (so sai số 1e-9; phần trăm so với `tienDo`).
- `kiemBanTomTat(cau: CauTomTat[], goi): { cau: CauTomTat[]; bo: (CauTomTat & {maBo})[]; trangThai: TrangThaiTomTat }` — giữ lại khi `bo/(cau+bo) > OKR_TOM_TAT.tyLeGiuLai` hoặc `cau.length === 0`. Tỷ lệ truyền vào dưới dạng tham số `tyLeGiuLai` (validation không nhập `@crm/db`).
- `mucNhac` thêm `{ loai: "okr-tom-tat", tomTatId: string, departmentId: string, cycleId: string, soKrDangBan: number }`.

- [ ] **Step 1:** Viết bảng ca E4 — mỗi mã của `MA_BO_CAU` (rút lúc chạy) một ca đỏ và một ca lành cùng gói; thiếu cặp thì `ma chua co ca: <ma>`. Dạng số: `1,5` · `12%` · `3 triệu` · `mười hai` · `12/10` · chênh lệch · tiến độ · `1.5` · `1,200` · `3k` · `12.5%`, mỗi dạng một ca khớp một ca lệch. Cặp `giam-xuong` (Review Focus 4). Ba ca bản: 3/10 → `hien`, 4/10 → `can-xem`, 0 câu → `can-xem`.
- [ ] **Step 2:** Đỏ.
- [ ] **Step 3:** Viết hai module.
- [ ] **Step 4:** Xanh. Phá thử: bỏ luật `sai-chieu` → `cau do lot: sai-chieu`. Commit phá thử, hoàn lại.
- [ ] **Step 5:** Commit `feat(okr): khuôn tóm tắt và bộ kiểm câu`.

### Task 3: Gói, ghi bản, đọc bản, trạng thái tuần (db)

**independent: false** (cần Task 1, 2) · phục vụ E5, E7, E22 (phần db) · verify: `bun run test -- "cd packages/db && bun test test/okr-tom-tat.spec.ts"`

**Files:**
- Create: `packages/db/src/okr-tom-tat.ts`, `packages/db/test/okr-tom-tat.spec.ts`
- Modify: `packages/db/src/okr-tro-ly-danh-muc.ts` (`OKR_TOM_TAT`), `packages/db/package.json` (export `./okr-tom-tat`)

**Interfaces — Produces:**
- `dungGoiTomTat(db, { cycleId, departmentId, tuan: string, now }): Promise<GoiTomTat | null>` — Mục tiêu `cong-bo`, `hienThi` công khai (`boGioiHan`), `level` phòng ban, `departmentId` đúng, trong chu kỳ; lần cập nhật có `luc` trong `[now − cuaSoNgay, now)`; mỗi KR kèm lần ngay trước, `chenhLech`, `chenhTuTin`, `tienDo` (`tienDoKr`), `lyDo` (`lyDoCua`); `null` khi phòng lưu trữ; gói không có trường tên người nào. `GoiTomTat = { phong: {id,ten}; tuan; krs: {...}[]; nguon: NguonKiem[] }`; `goiKiemTomTatTu(db, goi): Promise<GoiKiemTomTat>` thêm `tenThanhVien`, `tuCam`, `chuDauVao`.
- `ghiTomTat(db, { taskId, cycleId, departmentId, tuan, inputHash, nac, cau }): Promise<{ id: string; trangThai; soCauBo }>` — chạy `kiemBanTomTat`, ghi một hàng `OkrTomTat` (`cau` = `noiDungTomTat`), trùng `(cycleId, departmentId, tuan)` hay `taskId` thì ném lỗi có tên.
- `trangThaiTuan(db, { cycleId, departmentId, now }): Promise<{ dangSoan: boolean; chuaCapNhat: boolean }>` — `dangSoan` khi có `okr-tom-tat-tuan` chưa đóng của (chu kỳ, phòng) — chờ xả hay đang chạy; `chuaCapNhat` khi không có lần cập nhật nào trong cửa sổ.
- `docTomTatChoNguoiXem(db, { cycleId, departmentId, nguoiXem, now }): Promise<BanHien | null>` — bản `hien` mới nhất trong `hienTrongNgay` ngày, `nac` bật (đọc Json), nấc hiện tại của phòng là `bat`; với từng câu: nguồn còn tồn tại, Mục tiêu nguồn xem được với `nguCanhXemOkr(nguoiXem)`, chạy lại `kiemCauTomTat` trên giá trị hiện trong kho; câu trượt bị bỏ khỏi kết quả; trả `{ id, tuan, soLanCapNhat, cau: { vanBan, nguon: NguonHien[] }[], phanHoiCuaToi: boolean|null }` — danh sách câu có thể rỗng (khác `null`).
- `banTuanChoQuanTri(db, { cycleId, now })`: mọi (phòng có việc tóm tắt tuần gần nhất) với `nac`, trạng thái (`hien`/`can-xem`/`khong-lam-duoc`/`dang-soan`/`chua-cap-nhat`), số câu, `soCauBo`, đếm phản hồi; kèm `cau` và `bo`.
- `viecTomTatCanNhac(db, { cuaSo, now })`: xem Task 7.

- [ ] **Step 1:** Bài tích hợp trên bộ mẫu (`napBoOkrMau`): tập Mục tiêu trong gói bằng tập đọc thẳng (so tập); gói JSON không chứa họ tên nào của bảng thành viên (in số tên đã so); `ghiTomTat` 3 lành + 2 đỏ → `can-xem`, `soCauBo` 2; ghi lần hai → ném; `trangThaiTuan` ba ô (chờ xả, đang chạy, không cập nhật); `docTomTatChoNguoiXem` với lọc quyền, sửa `value`, xoá riêng lần cập nhật, xoá KR.
- [ ] **Step 2:** Đỏ. **Step 3:** Viết. **Step 4:** Xanh; phá thử bỏ điều kiện công khai → `goi lech cong khai`; bỏ kiểm lại lúc hiện → `so cu lot: cau 1`. Commit phá thử, hoàn lại.
- [ ] **Step 5:** Commit `feat(okr): gói, ghi và đọc tóm tắt tuần`.

### Task 4: Việc xếp tự nối theo ngày (agent)

**independent: false** (cần Task 3) · phục vụ E3, E10 (phần xếp) · verify: `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 TZ=Asia/Ho_Chi_Minh bun test test/tro-ly-okr-lich-tom-tat.integration.spec.ts"`

**Files:**
- Create: `apps/agent/agent/lib/okr/lich-tom-tat.ts`, `apps/agent/test/tro-ly-okr-lich-tom-tat.integration.spec.ts`
- Modify: `apps/agent/agent/lib/dispatch.ts` (nhánh `okr-tom-tat-xep` trong `handleDirect`; `damBaoLichTomTat` cạnh `xepKiemLaiKhoa` trong `drainAll`), `apps/agent/agent/lib/okr/viec.ts` (`lyDoChanTruocKhiGui` cho `tom-tat-tuan`: truyền `nacViec: payload.nac` và `donVi` suy từ `departmentId` — `{ onehub: false, boPhanId: <division của phòng>, phongBanId }`)

**Interfaces — Produces:**
- `chayXepTomTat(task, now = new Date()): Promise<string>` (outcome) — trong `lockIdempotencyKey("okr-tom-tat-xep:<ngày VN>")`: (1) ghi việc xếp ngày kế (`subject` `okr-tom-tat-xep:<ngày mai>`, `dueAt` = 06:00 VN ngày mai, bỏ qua nếu đã có); (2) chu kỳ `dang-chay` có `updateWeekday` = thứ của hôm qua (VN); (3) với mỗi phòng không lưu trữ có nấc `bat`/`an`, có cập nhật trong cửa sổ, chưa có bản hay việc mở cho `(chu kỳ, phòng, tuan)`: kiểm `troLyOkrSanSang({viec:"tom-tat-tuan", donVi, nacViec})`; hết trần → dừng vòng, outcome `khong-chay:het-tran-thang:<n da xep>`; còn lại ghi `okr-tom-tat-tuan` `{viec:"tom-tat-tuan", departmentId, cycleId, tuan, inputHash, nac}`, `priority: PRIORITY.okrNen`, `reason` hằng từ `LY_DO_VIEC_OKR`; outcome `da-xep:<n>`.
- `damBaoLichTomTat(now = new Date()): Promise<boolean>` — `aiOn` và một trong hai phạm vi tóm tắt khác `tat`, không có `okr-tom-tat-xep` mở → ghi một, `dueAt` = 06:00 VN kế tiếp (hôm nay nếu chưa tới 06:00, không thì mai); trong khoá tư vấn; trả `true` khi đã ghi.

- [ ] **Step 1:** Bài ma trận E3 (bảy ngày × hai chu kỳ × ba nấc × có/không cập nhật; so TẬP `(cycleId, departmentId, nac)`), đồng thời, chạy lại, trần, `damBaoLichTomTat` hai lần và khi tắt. Cộng Review Focus 1 `cn-sang-t2`, 2 `xep-muon` (chạy 10:00 vẫn xếp), 3 `phong-luu-tru`.
- [ ] **Step 2:** Đỏ. **Step 3:** Viết. **Step 4:** Xanh; phá thử bỏ điều kiện hôm qua → `o lich lech: …`; ghi việc kế sau vòng + ném giữa vòng → `chuoi dut`. Commit phá thử, hoàn lại.
- [ ] **Step 5:** Commit `feat(agent): lịch tóm tắt tuần tự nối theo ngày`.

### Task 5: Nhánh tóm tắt của subagent, tool nộp, sổ chi phí (agent)

**independent: false** (cần Task 3) · phục vụ E5, E6, E16 · verify: `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tro-ly-okr-nop-tom-tat.integration.spec.ts"`, `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tro-ly-okr-cach-ly.spec.ts`, `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/so-chi-phi.integration.spec.ts -t tom-tat"`

**Files:**
- Create: `apps/agent/agent/lib/okr/nop-tom-tat.ts`, `apps/agent/agent/subagents/tro_ly_okr/tools/nop_tom_tat.ts`, `apps/agent/test/tro-ly-okr-nop-tom-tat.integration.spec.ts`
- Modify: `apps/agent/agent/subagents/tro_ly_okr/instructions/viec.ts` (nhánh `okr-tom-tat-tuan` → `dungGoiTomTat` → `goiThanhChiDan`), `subagents/tro_ly_okr/instructions.md` (mục «Tóm tắt tuần»: tối đa 6 câu, câu đầu nói chung tuần, KR đáng bàn trước, 1–4 id nguồn mỗi câu, không nêu người, không đoán ngoài ghi chú, câu đầu tiên là lời gọi `nop_tom_tat`), `lib/okr/doc.ts` (`DANH_SACH_DOC` thêm `okrTomTat`, `okrCheckIn`; `docViecTheoPhienGoc` nhận cả hai loại), `lib/okr/nop-de-xuat.ts` (từ chối khi việc không phải `okr-de-xuat` — đã có, kiểm lại), `lib/so-chi-phi.ts` + `packages/db/src/ai-chi-phi-danh-muc.ts` (`tinhNangCua` nhận `okrViec` từ hàng việc tìm qua phiên gốc khi thuộc tính vắng), `test/tro-ly-okr-cach-ly.spec.ts` (`TOOL_SONG`), `test/so-chi-phi.integration.spec.ts` (ca `tom-tat`)

**Interfaces — Produces:**
- `nopTomTatVao(input: NopTomTat, ctx): Promise<{ ketQua: "da-ghi"|"tu-choi"|"thieu-du-lieu"; lyDo: string; soCau: number; soBo: number }>` — tìm việc qua phiên gốc; từ chối khi không phải `okr-tom-tat-tuan`, đã đóng, payload hỏng, hay đã có `OkrTomTat` cho `taskId`; dựng lại gói; gọi `ghiTomTat`.
- Tool `nop_tom_tat`: `inputSchema: nopTomTat` (khuôn 9a), mô tả tiếng Anh như `nop_de_xuat`.

- [ ] **Step 1:** Bài E5 (nộp lành+đỏ, nộp hai, nộp từ việc góp ý, `ketThucTuKetQua` → `da-nop`), sửa `TOOL_SONG` thành `{nop_de_xuat, nop_tom_tat}`, ca `tom-tat` của sổ chi phí (ctx không thuộc tính).
- [ ] **Step 2:** Đỏ. **Step 3:** Viết. **Step 4:** Xanh; phá thử đọc loại việc từ thuộc tính → `tinh nang lech: okr.de-xuat`. Commit phá thử, hoàn lại.
- [ ] **Step 5:** Commit `feat(agent): nhánh tóm tắt tuần của Trợ lý OKR`.

### Task 6: Ba thủ tục đọc và phản hồi, tuỳ chọn tắt dòng (API)

**independent: false** (cần Task 3) · phục vụ E7, E11, E13 (a), E14 (a), E22, E10 (phần API) · verify: `bun run test -- "cd apps/api && bun test test/tro-ly-okr-tom-tat-doc.spec.ts test/tro-ly-okr-tom-tat-phan-hoi.spec.ts test/tro-ly-okr-tom-tat-quan-tri.spec.ts test/tro-ly-okr-tat-dong.spec.ts"`

**Files:**
- Modify: `apps/api/src/okr/tro-ly.service.ts`, `okr.router.ts`, `okr.contracts.ts` (nhập khuôn từ `@crm/validation/okr-tom-tat`), `apps/api/src/generated/server.ts` (sinh lại), `apps/api/src/zalo/zalo.service.ts`, `zalo.router.ts`, `apps/app/lib/trpc/cache.ts`
- Create: bốn tệp test trên

**Interfaces — Produces:**
- `okr.troLyTomTat({ cycleId, departmentId })` (REST `GET /okr/weekly-summary`) → `{ ban: BanHien | null; dangSoan: boolean; chuaCapNhat: boolean }`; mọi thành viên (`quyen`), `null` khi nấc phòng ≠ `bat`.
- `okr.troLyTomTatPhanHoi({ tomTatId, huuIch })` (REST `POST /okr/weekly-summary/{tomTatId}/feedback`) → `{ ok: true }`; upsert theo `(tomTatId, userId)`; bản không hiện được với người gọi → `NotFoundException` có tên.
- `okr.troLyTomTatQuanTri({ cycleId })` (REST `GET /okr/weekly-summary/admin`) → `banTuanChoQuanTri`; `quanTriChuongTrinh` như `sucKhoe`, khác → 403.
- `zalo.cuaToi` (thủ tục đọc sẵn có, REST `GET /zalo/me`) thêm `dongTroLyOkr: boolean`, `laTruongPhong: boolean`; `zalo.luuDongTroLyOkr({ bat: boolean })` ghi `NotificationPreference` của `ctx.user.id`.

- [ ] **Step 1:** Bài E7 (ma trận người × bản × tRPC/REST, lọc, sửa value, xoá lần cập nhật, xoá KR), E22 (`-t trang-thai`), E11, E14a, E13a, Review Focus 5 `chu-ky-khac`.
- [ ] **Step 2:** Đỏ. **Step 3:** Viết; `bun run trpc:generate`. **Step 4:** Xanh; ba chiều đỏ của E7, hai của E22, của E11, E13, E14. Commit phá thử, hoàn lại.
- [ ] **Step 5:** Commit `feat(api): đọc tóm tắt tuần, phản hồi, khối quản trị, tắt dòng báo`.

### Task 7: Dòng báo trong nhắc buổi sáng (db + agent)

**independent: false** (cần Task 3, Task 1) · phục vụ E12 · verify: `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 TZ=Asia/Ho_Chi_Minh bun test test/tro-ly-okr-nhac-tom-tat.integration.spec.ts"` và các bài nhắc sẵn có `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/nhac*.spec.ts test/tin-nhac*.spec.ts"`

**Files:**
- Modify: `packages/db/src/okr-tom-tat.ts` (`viecTomTatCanNhac`), `packages/db/src/onboarding-nhac.ts` (gộp nguồn, `THU_TU_NHAC` thêm `okr-tom-tat` cạnh hai loại AI), `apps/agent/agent/lib/tin-nhac.ts` (`TIEU_DE`, dòng chữ, đường mở, trần `dongBaoAiToiDa`), `apps/agent/agent/lib/nhac-ke-hoach.ts`
- Create: `apps/agent/test/tro-ly-okr-nhac-tom-tat.integration.spec.ts`

**Interfaces — Produces:**
- `viecTomTatCanNhac(db, { cuaSo: "buoi-sang", now }): Promise<Map<userId, ViecTomTat[]>>` — bản `hien`, `nac` bật, nấc hiện tại `bat`, `createdAt` trong `(mốc hôm trước, mốc hôm nay]`; người nhận là `Department.headUserId` còn là thành viên, `dongTroLyOkr` khác `false`; `soKrDangBan` = số KR của phòng có `lyDoCua` khác rỗng trừ KR có trong mục `okr-kr-im` của cùng người (trừ ở bước dựng tin, nơi có đủ danh sách mục).
- Dòng chữ: `Tóm tắt tuần Phòng <tên> · <n> KR đáng bàn`; đường mở `<APP_URL>/<slug>/okr/theo-don-vi?xemOkr=hop-tuan&donOkr=pb:<id>&kyOkr=<cycleId>` (khoá tham số lấy từ `SEARCH_PARAM`/`THAM_SO_KY_OKR`, không viết chuỗi tay).
- Trần: dòng thuộc `LOAI_NHAC_AI ∪ {"okr-tom-tat"}` ≤ `dongBaoAiToiDa`, xếp sau mọi dòng việc người, bị cắt trước khi chạm `NHAC.tran`.

- [ ] **Step 1:** Bài tám ô E12, cộng `ban-sau-moc` và `khong-truong` (Review Focus 2, 3); đường mở parse từng tham số.
- [ ] **Step 2:** Đỏ. **Step 3:** Viết. **Step 4:** Xanh; phá thử không trừ KR im → `dem trung kr im`; bỏ trần → `qua hai dong bao`. Commit phá thử, hoàn lại.
- [ ] **Step 5:** Commit `feat(nhac): dòng tóm tắt tuần trong nhắc buổi sáng`.

### Task 8: `InlineCitation` mở bằng bấm (packages/ui)

**independent: true** · phục vụ E8 (phần thành phần), E21 · verify: `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/inline-citation.dom.tsx`

**Files:**
- Create (CLI từ `packages/ui`: `bunx --bun ai-elements@latest add inline-citation`): `packages/ui/src/components/ai-elements/inline-citation.tsx`; `packages/ui/test/inline-citation.dom.tsx`
- Modify: `docs/chat-ui.md` (bảng «What is in the tree today» thêm `inline-citation.tsx` và lý do)

**Interfaces — Produces:** các phần `InlineCitation`, `InlineCitationText`, `InlineCitationCard`, `InlineCitationCardTrigger`, `InlineCitationCardBody`, `InlineCitationCarousel*` như bản của AI Elements; `InlineCitationCard` mở bằng bấm, Enter, Space (Popover thay HoverCard, vẫn mở khi di chuột trên thiết bị có chuột); `InlineCitationCardTrigger` nhận `nhan: string` thay cho hiển thị hostname của URL.

- [ ] **Step 1:** Bài DOM: bấm, Enter, Space mở; Esc đóng; lật 2/3. **Step 2:** Đỏ. **Step 3:** Cài CLI, sửa theo `docs/reui.md`/`docs/chat-ui.md` (import `@crm/ui`, token). **Step 4:** Xanh; phá thử để mở chỉ khi di chuột → `trich dan khong bam duoc`. Hoàn lại.
- [ ] **Step 5:** Commit `feat(ui): trích dẫn nội dòng mở bằng bấm`.

### Task 9: Màn — khối tóm tắt, khối quản trị, công tắc tắt dòng (app)

**independent: false** (cần Task 6, 8) · phục vụ E8, E13 (b), E14 (b), E21 · verify: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tro-ly-okr-tom-tat.dom.tsx ./test/suc-khoe-tom-tat.dom.tsx ./test/nhac-dong-tom-tat.dom.tsx` và `node _acceptance/... tts_san_thiet_ke`

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/khoi-tom-tat.tsx`, `apps/app/app/(app)/[slug]/okr/toan-canh/suc-khoe/tom-tat-quan-tri.tsx`, ba tệp test DOM
- Modify: `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx` (khối trên hàng «Đáng bàn», chỉ khi `unit.loai === "pb"`), `apps/app/app/(app)/[slug]/okr/toan-canh/suc-khoe/suc-khoe.tsx`, `apps/app/app/(app)/[slug]/settings/notifications/khoi-kenh.tsx`, `apps/app/lib/messages/okr-toan-canh.ts`, `apps/app/lib/messages/nhac-qua-zalo.ts`, `apps/app/test/messages-guard.spec.ts` nếu bài đòi khoá mới

**Interfaces — Consumes:** `trpc.okr.troLyTomTat`, `troLyTomTatPhanHoi`, `troLyTomTatQuanTri`, `trpc.zalo.cuaToi`, `trpc.zalo.luuDongTroLyOkr`; `useMoDienBien()` cho «Xem diễn biến KR».

- [ ] **Step 1:** Ba bài DOM: mỗi id `ST-tomtat-*`, `ST-suckhoe-tomtat-*`, `ST-nhac-dong-tomtat` của bảng UX (rút từ design doc) một ca; bấm/Enter/Space; đơn vị bp/goc/nguoi không gọi thủ tục; hỏi lại 5 000 ms, dừng 120 000 ms, unmount ngừng; nhãn sáu mã bỏ câu rút từ `MA_BO_CAU`.
- [ ] **Step 2:** Đỏ. **Step 3:** Dựng theo bản mẫu `apps/app/app/proto/_modules/tro-ly-okr-tom-tat/` (thay Popover tạm bằng `InlineCitation`, giữ `ToggleGroup`). **Step 4:** Xanh; phá thử bảng trạng thái có id thiếu ca → `trang thai chua do: <id>`. Hoàn lại. Chạy `tts_san_thiet_ke`.
- [ ] **Step 5:** Commit `feat(okr): khối tóm tắt tuần, khối quản trị, công tắc tắt dòng`.

### Task 10: Thước, kịch bản đo, eval (rang + evals)

**independent: false** (cần mọi task trên) · phục vụ E9, E10, E15, E17, E19 · verify: `bun run test -- "cd apps/api && bun test test/tro-ly-okr-tom-tat-thuoc.spec.ts"`, `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tro-ly-okr-tom-tat-duong-do.integration.spec.ts"`, `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tro-ly-okr-cach-ly.spec.ts -t judge-zdr`, `node _acceptance/tro-ly-okr-tom-tat/rang/tai-lieu.mjs` (sau Task 11). E9, E17 chỉ chạy thử khô (không khoá) ở S3: phải thoát 2 «thiếu khoá».

**Files:**
- Create: `_acceptance/tro-ly-okr-tom-tat/rang/{cau-bi-bo.sql,mo-sau-nhac.sql,huu-ich.sql,tat-dong.sql,chi-phi-tom-tat.sql,so-lech-lot.mjs,man-tom-tat.mjs,eval-tom-tat.mjs,tai-lieu.mjs}`, `apps/api/test/tro-ly-okr-tom-tat-thuoc.spec.ts`, `apps/agent/test/tro-ly-okr-tom-tat-duong-do.integration.spec.ts`, `apps/agent/evals/okr/tom-tat.eval.ts`

**Interfaces:** `so-lech-lot.mjs` tự tính tập tham chiếu từ kho (giá trị lần dẫn, lần trước, chênh lệch, khởi điểm, đích, tiến độ phần trăm, ngày dd/mm), không nhập `okr-kiem-*`; in `ban|cau|so` mỗi dòng lệch; thoát 1 khi có. `man-tom-tat.mjs` theo khuôn `_acceptance/tro-ly-okr-de-xuat/rang/man-gop-y.mjs` (cảnh cây, tien-de, 1440/390, scrollWidth). `eval-tom-tat.mjs` theo khuôn `eval-gop-y.mjs` (kho `_do`, `okr:mau --moc` hai mốc, `eve eval okr/tom-tat`, chốt bằng mã). `tom-tat.eval.ts` judge `closedQA` `zai/glm-5.2-fast` với `providerOptions.gateway.zeroDataRetention: true`.

- [ ] **Step 1–4:** Viết từng thước kèm cặp đối chứng như `evals.yaml`; chạy các lệnh verify; phá thử từng chiều đỏ đã khai. **Step 5:** Commit `test(tro-ly-okr-tom-tat): thước, kịch bản đo, eval`.

### Task 11: Tài liệu, từ điển, lộ trình

**independent: false** (cuối) · phục vụ E19, E20 · verify: `node _acceptance/tro-ly-okr-tom-tat/rang/tai-lieu.mjs`, `bun run lint:slop`

**Files:** `docs/api.md` §OKR (ba thủ tục, ai gọi, lọc lúc hiện, giữ lại), `docs/agent.md` (Hai làn: `okr-tom-tat-xep` nay chạy; mục «Chỗ rẽ: Trợ lý OKR (lượt 9c)» liệt tệp của hãng bị chạm — rút bằng phép giao như 9b; nhắc buổi sáng: dòng tóm tắt), `CONTEXT.md` (mục Tóm tắt tuần khớp hành vi), `docs/plan/lo-trinh-okr.md` mục 10 dòng 9c (trạng thái, ngày, PR).

- [ ] **Step 1:** Viết. **Step 2:** `tai-lieu.mjs` xanh; phá thử bỏ một tệp khỏi mục chỗ rẽ → `cho re thieu: <tep>`. **Step 3:** Commit `docs(tro-ly-okr-tom-tat): tài liệu và lộ trình`.

---

## Thứ tự và cách chạy

Task 1 → 2 → 3 → (4, 5, 6, 7 tuần tự) → 8 → 9 → 10 → 11. Task 1, 2, 8 độc lập với nhau nhưng chạy tuần tự trong cây này (sổ quyết định S2). Mỗi task: một tác tử con tươi viết theo TDD, một tác tử soi tươi đọc lại trước task kế. Xong Task 11: bốn lệnh chứng của kho + `bun run build` xanh, rồi S4.
