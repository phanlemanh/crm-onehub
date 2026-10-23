# Một thông báo, nhiều kênh (TB2) — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zalo/Slack chỉ chuyển tiếp những loại thông báo người dùng cho phép, chuông luôn nhận đủ; người dùng chọn theo loại trên trang Nhắc buổi sáng.

**Architecture:** Bảng mức + mặc định một chỗ ở `@crm/validation/thong-bao`; cài đặt mỗi (người, loại) trong bảng `CaiDatThongBao`, đọc qua một hàm ở `@crm/db`. Nhắc buổi sáng lọc mục trước khi dựng tin; thông báo sự kiện rẽ ra kênh qua một bước mới trong nhịp mỗi phút của tác nhân, đọc thẳng bảng `ThongBao`. API thêm hai thủ tục ở router `thongBao`; app thêm một mục trên trang Nhắc buổi sáng.

**Tech Stack:** Bun, Prisma (Postgres), NestJS + nestjs-trpc, Next.js App Router, zod, `@crm/ui`.

**Gate 1.5:** duyệt — Manh Phan, 2026-10-23.

**Spec:** `docs/superpowers/specs/2026-10-23-thong-bao-mot-nguon-nhieu-kenh-design.md` · hợp đồng `_acceptance/thong-bao-mot-nguon-nhieu-kenh/contract.md` · phép đo `_acceptance/thong-bao-mot-nguon-nhieu-kenh/evals.yaml` (expected của từng eval là đặc tả bài kiểm — đọc trước khi viết test).

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Hằng số tinh chỉnh vào `THONG_BAO` của `packages/validation/src/thong-bao.ts`: `day.cuaSoPhut = 30`, `day.tranLan = 3`.
- Trí khôn ở `apps/agent`; API không gọi Zalo/Slack, không tự chọn kênh ngoài `kenhSeDungCua`.
- Không sửa gì trong `apps/agent/agent/channels/**` (luật 21 của đợt).
- Tệp chữ dùng chung `apps/app/lib/messages/*.ts`, `CONTEXT.md`, `_acceptance/config.yaml`: chỉ THÊM dòng (luật 7).
- Migration chỉ thêm bảng/cột; tên migration xếp sau mọi migration trên `origin/onehub` lúc tạo (luật 2).
- Dữ liệu giữ nguyên tin Zalo/Slack từng byte cho người chưa đổi cài đặt — bản chụp `apps/agent/test/fixtures/tin-nhac-truoc-tb1.json` không được sửa.
- Zalo hỏng không đổi sang Slack (`docs/agent.md`).
- UI chỉ dùng thành phần `@crm/ui`; dòng công tắc là `Field orientation="horizontal"`; lưu ngay + toast; lỗi trả giá trị cũ (`docs/settings.md`).
- Không `useEffect` trong mã app cho việc dữ liệu.
- Bài chạm DB chạy qua `bun run test -- "…"` (kho thử riêng mỗi lượt), không `bun test` trần.

## Review Focus

1. Người có cả Zalo lẫn Slack, đổi «Nhận nhắc việc qua» sau khi đã tắt vài loại → cài đặt theo loại giữ nguyên, tên cột đổi theo kênh mới (T6: ô dom đổi kênh, tên cột cập nhật).
2. Thông báo sự kiện ghi đúng lúc người vừa bật (cùng giây) → so `taoLuc >= doiLuc` bao gồm bằng (T4: ô biên bằng nhau).
3. Tin sáng bị cắt bởi trần ký tự (`dungTin` trả `daGui` ít hơn danh sách) → `daGuiKhoa` lấy từ mục thật sự vào tin, không từ danh sách đã lọc (T3: ô trần ký tự).
4. Người bị gỡ khỏi xưởng hoặc user bị xoá giữa lúc có thông báo chờ đẩy → bước đẩy bỏ qua, không ném, các thông báo khác vẫn đi (T4: ô người không còn).
5. Hàng cài đặt mang loại đã bỏ khỏi `LOAI_THONG_BAO` → đọc bỏ qua, ghi một dòng nhật ký, trang và lượt đẩy chạy tiếp (T2 + T5: ô loại lạ).

---

### Task 1: Bảng mức, mặc định và câu sự kiện dùng chung

Phục vụ: E1 (AC-1), một phần E4. `independent: false` (mọi task sau dùng).

**Files:**
- Modify: `packages/validation/src/thong-bao.ts`
- Create: `packages/validation/src/thong-bao-cau.ts` (khai thêm export `./thong-bao-cau` trong `packages/validation/package.json`)
- Test: `packages/validation/test/thong-bao-muc.spec.ts`

**Interfaces — Produces:**
- `MUC_THONG_BAO: Record<LoaiThongBao, { muc: "can-lam" | "de-biet"; macDinhDayRa: boolean }>` — `satisfies`, bảng đúng như bảng mức của thiết kế.
- `LOAI_SU_KIEN = ["tac-nhan-xong","tac-nhan-can-tra-loi","tac-nhan-hong","tin-hieu-doi-cho"] as const`.
- `THONG_BAO.day = { cuaSoPhut: 30, tranLan: 3 }`.
- `laLoaiThongBao(v: string): v is LoaiThongBao`.
- `luuCaiDatThongBaoInput = z.object({ loai: z.enum(LOAI_THONG_BAO), dayRa: z.boolean() }).strict()`.
- `cauSuKienVi(nd: NoiDungThongBao & { loai: (typeof LOAI_SU_KIEN)[number] }): string` trong `thong-bao-cau.ts` — khuôn tiếng Việt của bốn loại, chép đúng chữ của `apps/app/lib/messages/thong-bao.ts` (`cau`, `chuong.tacNhanKhongTen`) và nhãn chỗ tiếng Việt của `apps/app/lib/messages/tin-hieu.ts`; bài `tbk-cau` (Task 4) giữ hai bản khớp.

- [ ] **Step 1: Viết `thong-bao-muc.spec.ts` describe `tbk-muc`** theo E1: bảng kỳ vọng 26 dòng viết tay trong tệp test; assert (1)–(4); ô (5) chép `packages/validation` sang `mkdtemp`, đường gốc suy từ `import.meta.dir`, thêm `"loai-thu-moi"` vào `LOAI_THONG_BAO`, chạy `bunx tsc --noEmit -p <bản chép>` → mã ≠ 0 và stderr chứa `loai-thu-moi`; đối chứng: bản chép nguyên vẹn mã 0. Thông điệp ghim đúng như E1.
- [ ] **Step 2: Chạy** `cd packages/validation && bun test test/thong-bao-muc.spec.ts -t tbk-muc` → FAIL (`MUC_THONG_BAO` chưa có).
- [ ] **Step 3: Thêm các export ở trên.**
- [ ] **Step 4: Chạy lại** → PASS; chạy ba chiều đỏ của E1 trên bản sao (sửa tạm, chạy, xem đúng thông điệp, `git checkout` tệp) — commit trước khi phá thử.
- [ ] **Step 5: Commit** `feat(thong-bao-mot-nguon-nhieu-kenh): bảng mức và mặc định kênh ngoài`.

### Task 2: Bảng cài đặt và hàm đọc dùng chung

Phục vụ: E2–E6 (nền). `independent: false`.

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (model `CaiDatThongBao`; thêm vào `ThongBao`: `dayLan Int @default(0)`, `dayLuc DateTime?`, `dayKenh String?`, `dayLoi String?`, `@@index([dayLuc, taoLuc])`; quan hệ ngược trên `User`)
- Create: `packages/db/prisma/migrations/<UTC>_cai_dat_thong_bao/migration.sql` (sinh bằng `prisma migrate dev --create-only`)
- Create: `packages/db/src/cai-dat-thong-bao.ts` (+ export `./cai-dat-thong-bao` trong `packages/db/package.json`)
- Test: `packages/db/test/cai-dat-thong-bao.spec.ts`

**Interfaces — Produces:**
- `type CaiDatHieuLuc = { dayRa: boolean; macDinh: boolean; doiLuc: Date | null }`
- `docCaiDatThongBao(db: Db, userId: string): Promise<(loai: LoaiThongBao) => CaiDatHieuLuc>` — một truy vấn; hàng loại lạ bỏ qua + `console.warn` một dòng.
- `docCaiDatNhieuNguoi(db: Db, userIds: string[]): Promise<Map<string, (loai: LoaiThongBao) => CaiDatHieuLuc>>` (cho bước đẩy).
- `luuCaiDatThongBao(db: Db, userId: string, loai: LoaiThongBao, dayRa: boolean): Promise<CaiDatHieuLuc>` — trùng mặc định thì `deleteMany` hàng, khác thì `upsert`.

- [ ] **Step 1: Test** `ccd-doc`: không hàng → mọi loại = mặc định của `MUC_THONG_BAO`; lưu khác mặc định → đọc lại `macDinh:false`, `doiLuc` khác null; lưu trùng mặc định → đếm hàng của người = 0; hàng loại `loai-da-bo` gieo qua `db.caiDatThongBao.create` → đọc không ném.
- [ ] **Step 2: Chạy** `bun run test -- "cd packages/db && bun test test/cai-dat-thong-bao.spec.ts"` → FAIL.
- [ ] **Step 3: Sửa schema, tạo migration, `bun run db:generate`, viết module.**
- [ ] **Step 4: Chạy lại** → PASS; `bun run check-types` xanh.
- [ ] **Step 5: Commit** `feat(thong-bao-mot-nguon-nhieu-kenh): bảng cài đặt loại thông báo`.

### Task 3: Nhắc buổi sáng lọc theo cài đặt

Phục vụ: E2 (a, b, 0), E3. `independent: false`.

**Files:**
- Modify: `apps/agent/agent/lib/nhac-ke-hoach.ts` (`chayNhac`, `KetQuaNhac`, `guiQuaZalo`/`guiQuaSlack` trả `daGui`)
- Modify: `apps/agent/agent/lib/thong-bao-doi-chieu.ts` chỉ khi kết quả mới cần đếm (xem Task 7)
- Test: `apps/agent/test/thong-bao-kenh.integration.spec.ts` (describe `tbk-mac-dinh`, `tbk-loc`)

**Interfaces:**
- Consumes: `docCaiDatThongBao` (Task 2), `khoaThongBao`.
- Produces: `KetQuaNhac` thêm `"da-tat-het"`; `payload.daGuiKhoa: string[]` (khoá của mục thật sự vào tin — từ `daGui` của `dungTin`, không từ danh sách đã lọc); hàm thuần `locDayRa(viec: ViecNhac[], cd: (l: LoaiThongBao) => CaiDatHieuLuc): ViecNhac[]` export để test.

- [ ] **Step 1: Test** theo E2 (ô 0, a, b) và E3 (a–d), cộng ô Review Focus 3: hai mục mà tin bị cắt bởi `ZALO.tranKyTu` → `daGuiKhoa` chỉ chứa mục đã vào tin. Ô (a) của E2: `chupTin(dungTin, …)` trên `locDayRa(mục mẫu, mặc định)` bằng bản chụp; cộng một lượt `chayNhac` thật cho Z và S với mục gieo bằng `nhac-gieo` — tin gửi đi bằng `dungTin` trên danh sách chưa lọc.
- [ ] **Step 2: Chạy** `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao-kenh.integration.spec.ts -t 'tbk-mac-dinh|tbk-loc'"` → FAIL.
- [ ] **Step 3: Sửa `chayNhac`:** sau `kenhSeDungCua` có kênh → `locDayRa`; rỗng → `dong(task.id, "da-tat-het")` (payload vẫn ghi `mucTinh`, `kenh`); còn → gửi như cũ với danh sách đã lọc, ghi `daGuiKhoa`.
- [ ] **Step 4: Chạy lại** → PASS; chạy cả `htb_kenh` và `cmst_nhac` (bài cũ của tin sáng) xanh.
- [ ] **Step 5: Commit** `feat(thong-bao-mot-nguon-nhieu-kenh): tin sáng bỏ loại người đã tắt`.

### Task 4: Đẩy thông báo sự kiện qua kênh

Phục vụ: E2 (c), E4, E5. `independent: false`.

**Files:**
- Create: `apps/agent/agent/lib/thong-bao-day.ts`
- Modify: `apps/agent/agent/schedules/dispatch.ts` (thêm `dayThongBaoSuKien()` vào `Promise.all` cạnh `donThongBaoDinhKy()`)
- Modify: `apps/agent/agent/lib/nhac-ke-hoach.ts` — export `lienKetDuongDan(appUrl: string | null): Promise<(duongDan: string) => string | null>` dựng trên `xuongSlug`
- Test: `apps/agent/test/thong-bao-kenh.integration.spec.ts` (`tbk-su-kien`, `tbk-hong`, ô c của `tbk-mac-dinh`); `apps/app/test/thong-bao-cau.spec.ts` (describe `tbk-cau`)

**Interfaces:**
- Produces: `dayThongBaoSuKien(deps?: { now?: Date; zaloFetcher?: typeof fetch; fetcher?: typeof fetch; appUrl?: string | null }): Promise<{ gui: number; hong: number; boQua: number }>`.
- Thuật toán: chọn `ThongBao` có `nguon ≠ THONG_BAO.nguon.nhacBuoiSang`, `taoLuc ≥ now − cuaSoPhut`, `dayLan < tranLan`, (`dayLuc` null hoặc `dayLoi` khác null); lọc theo `docCaiDatNhieuNguoi` (`dayRa` và `taoLuc ≥ doiLuc`); giữ chỗ từng hàng bằng `updateMany({ where: { id, dayLan: <đọc được>, OR: [{dayLuc:null},{dayLoi:{not:null}}] }, data: { dayLan: {increment:1}, dayLuc: now, dayLoi: null } })` — `count` 0 thì bỏ (nhịp khác đã giữ); `kenhSeDungCua` → null thì ghi `dayKenh: null`, thôi; gửi `cauSuKienVi(nd) + "\n" + lienKet(duongDan)` qua `guiZalo` hoặc `sendSlackMessage` (mã tin = id thông báo); hỏng → `dayLoi` = thông điệp, không đổi kênh.

- [ ] **Step 1: Test** theo E4 (8 ô + e–h), E5 (a–f), ô c của E2, cộng Review Focus 2 (`taoLuc == doiLuc` → gửi) và 4 (người nhận đã bị xoá thành viên → bỏ qua, thông báo khác vẫn gửi). `tbk-cau`: bốn loại × mẫu nội dung (tin hiệu: mọi giá trị `KHOA_CHO_TIN_HIEU`) → `cauThongBao("vi", nd) === cauSuKienVi(nd)`.
- [ ] **Step 2: Chạy** `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao-kenh.integration.spec.ts -t 'tbk-su-kien|tbk-hong|tbk-mac-dinh'" && cd apps/app && bun test ./test/thong-bao-cau.spec.ts -t tbk-cau` → FAIL.
- [ ] **Step 3: Viết `thong-bao-day.ts`, nối vào `dispatch.ts`.**
- [ ] **Step 4: Chạy lại** → PASS; ba chiều đỏ của E4 và E5 trên bản sao (commit trước khi phá).
- [ ] **Step 5: Commit** `feat(thong-bao-mot-nguon-nhieu-kenh): đẩy thông báo sự kiện qua Zalo/Slack`.

### Task 5: Thủ tục đọc và lưu cài đặt

Phục vụ: E6. `independent: false`.

**Files:**
- Modify: `apps/api/src/thong-bao/thong-bao.router.ts`, `thong-bao.service.ts`, `thong-bao.contracts.ts`
- Test: `apps/api/test/thong-bao-cai-dat.spec.ts` (describe `tbk-api`)
- Regenerate: tRPC types (`bun run trpc:generate` hay lệnh kho đang dùng; nhập tên khuôn gốc, không `as`)

**Interfaces — Produces:**
- `caiDat` (query, `GET /thong-bao/cai-dat`) → `{ kenh: "zalo" | "slack" | null; lyDo: "chua-noi" | "zalo-tat" | "slack-chua-khop" | null; loai: { loai: LoaiThongBao; muc: "can-lam" | "de-biet"; dayRa: boolean; macDinh: boolean }[] }` — thứ tự theo `LOAI_THONG_BAO`; `kenh` lấy từ `kenhSeDungCua(db, userId, { coToken: true })` như `zalo.service.cuaToi`.
- `luuCaiDat` (mutation, `POST /thong-bao/cai-dat`, input `luuCaiDatThongBaoInput`) → `{ loai, dayRa, macDinh }`.

- [ ] **Step 1: Test** theo E6 (a–g, ô e năm ca so với `kenhSeDungCua`).
- [ ] **Step 2: Chạy** `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test --preload ./test/setup.ts test/thong-bao-cai-dat.spec.ts -t tbk-api"` → FAIL.
- [ ] **Step 3: Thêm hai thủ tục và service gọi Task 2.**
- [ ] **Step 4: Chạy lại** → PASS; `htb_api` xanh.
- [ ] **Step 5: Commit** `feat(thong-bao-mot-nguon-nhieu-kenh): thủ tục cài đặt loại thông báo`.

### Task 6: Mục «Loại thông báo» và lối từ chuông

Phục vụ: E7, E1 (`tbk-ten`). `independent: false`.

**Files:**
- Create: `apps/app/components/thong-bao/khoi-loai-thong-bao.tsx` (client)
- Modify: `apps/app/app/(app)/[slug]/reminders/page.tsx` (thêm `<section id="loai-thong-bao">` sau khối kênh; prefetch `thongBao.caiDat`)
- Modify: `apps/app/components/thong-bao/chuong-thong-bao.tsx` (nút biểu tượng «Cài đặt thông báo» ở đầu ô bật ra, `Link` tới `/${slug}/reminders#loai-thong-bao`)
- Modify (chỉ thêm dòng): `apps/app/lib/messages/thong-bao.ts` — `tenLoai: Record<LoaiThongBao,string>` vi/en, chữ mục cài đặt
- Test: `apps/app/test/thong-bao-cai-dat.dom.tsx` (`tbk-man`), `apps/app/test/thong-bao-ten-loai.spec.ts` (`tbk-ten`)

**Interfaces:** Consumes `thongBao.caiDat`, `thongBao.luuCaiDat` (Task 5). Component tự giữ kiểu prop, không nhập gói máy chủ.

- [ ] **Step 1: Test** theo E7 (a hai ô kênh, b–f) và `tbk-ten`, cộng Review Focus 1 (dữ liệu `caiDat` đổi `kenh` từ zalo sang slack → tên cột đổi, công tắc giữ trạng thái).
- [ ] **Step 2: Chạy** lệnh `tbk_man` và `cd apps/app && bun test ./test/thong-bao-ten-loai.spec.ts -t tbk-ten` → FAIL.
- [ ] **Step 3: Dựng mục:** hai `Card` (Cần làm, Để biết) mỗi thẻ `CardHeader` + `CardDescription`; từ `md` `SimpleTable` ba cột, dưới `md` danh sách `Item`; cột Chuông `Switch checked disabled`; cột kênh `Switch` gọi `luuCaiDat`, cập nhật lạc quan, lỗi trả giá trị cũ + toast; `kenh` null → mọi công tắc kênh khoá + một dòng lý do; chờ tải `KhungXuong`, lỗi `VungTaiLoi`.
- [ ] **Step 4: Chạy lại** → PASS; `bun run lint` và `bun run lint:slop` xanh cho tệp mới.
- [ ] **Step 5: Commit** `feat(thong-bao-mot-nguon-nhieu-kenh): mục loại thông báo trên trang Nhắc buổi sáng`.

### Task 7: Lệnh đối chiếu có khối kênh ngoài

Phục vụ: E9. `independent: false`.

**Files:**
- Modify: `apps/agent/agent/lib/thong-bao-doi-chieu.ts` (`DongNgay` thêm `quaZalo`, `quaSlack`, `suKienDaDay`, `kenhCoThongBao`, `kenhLech: {userId,khoa}[]`; `KetQuaDoiChieu` thêm `nguoiKhacMacDinh`; `coMat` tính cả `kenhLech`; `inKetQua` thêm một dòng mỗi ngày)
- Test: `apps/agent/test/thong-bao-doi-chieu.integration.spec.ts` (describe `tbk-doi-chieu`)

- [ ] **Step 1: Test** theo E9; bài `htb-doi-chieu` cũ vẫn xanh.
- [ ] **Step 2: Chạy** lệnh `tbk_doi_chieu` → FAIL.
- [ ] **Step 3: Đếm** từ `payload.daGuiKhoa` + `payload.kenh` của lượt nhắc, và `ThongBao` có `dayLuc`/`dayKenh`; lệch = khoá đã gửi không có `ThongBao` cùng người.
- [ ] **Step 4: Chạy lại** → PASS; `htb_doi_chieu` xanh.
- [ ] **Step 5: Commit** `feat(thong-bao-mot-nguon-nhieu-kenh): đối chiếu kênh ngoài với chuông`.

### Task 8: Từ điển, tài liệu và phép đo màn

Phục vụ: E10, E8. `independent: false`.

**Files:**
- Modify (chỉ thêm dòng): `CONTEXT.md` — mục «Cần làm», «Để biết»; thêm câu vào mục «Thông báo» (Zalo/Slack chỉ chuyển tiếp theo cài đặt, chuông luôn đủ)
- Modify: `docs/agent.md` mục nhắc buổi sáng — một đoạn về lọc theo cài đặt và bước đẩy sự kiện
- Create: `_acceptance/thong-bao-mot-nguon-nhieu-kenh/rang/do-man.mjs` (theo khuôn `_acceptance/hop-thong-bao-tren-web/rang/do-man.mjs`, 7 cảnh của E8, gieo qua đường ghi thật, ảnh vào `$BANG_CHUNG`)

- [ ] **Step 1: Viết mục từ điển và đoạn tài liệu.**
- [ ] **Step 2: Viết `do-man.mjs`; chạy** `NGUOI=ada@trycomp.ai bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/thong-bao-mot-nguon-nhieu-kenh/rang/do-man.mjs"` với `BANG_CHUNG` trỏ thư mục tạm → 7 dòng DUNG, mã 0.
- [ ] **Step 3: Năm lệnh chứng của kho** (`test`, `check-types`, `lint`, `lint:slop`, `build`) qua khoá máy → xanh.
- [ ] **Step 4: Commit** `docs(thong-bao-mot-nguon-nhieu-kenh): từ điển, tài liệu tác nhân, phép đo màn`; đặt hợp đồng `status: implemented`.
