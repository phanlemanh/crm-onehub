# DA11 · Việc riêng chỉ người trong cuộc thấy — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khung việc nói đúng ai thấy việc, lịch sử việc che việc người xem không thấy, có lệnh đếm production chỉ đọc.

**Architecture:** API tính `aiThay` trong `viec.get` và che vết trong `viec.lichSu` ở đầu ra (apps/api/src/viec). Khung việc chỉ vẽ theo dữ liệu đã xong. Luật thấy việc (`packages/db/src/viec.ts`) không đổi. Lệnh đếm là script `packages/db/scripts` chạy trong `transaction` chỉ đọc.

**Tech Stack:** NestJS + nestjs-trpc, Prisma, zod, Next.js client components, bun test (API dùng `support/viec-gieo`, DOM dùng `test/khung-gop-y.tsx`).

**Spec:** `docs/superpowers/specs/2026-10-19-viec-rieng-chi-nguoi-trong-cuoc-design.md`, hợp đồng `_acceptance/viec-rieng-chi-nguoi-trong-cuoc/contract.md`, evals `evals.yaml` cùng thư mục.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Không chạm `packages/db/src/viec.ts` hay `packages/db/prisma` (giữ T2).
- Chiều đỏ trong lịch sử: commit bài kiểm đứng TRƯỚC commit sửa; bài kiểm phải đỏ trên onehub `0d9ef3183` với đúng lời đã ghim trong `evals.yaml`.
- Chữ đúng nguyên văn:
  - `khung.rieng` = «Việc riêng — chỉ người trong cuộc thấy» (giữ);
  - `khung.duAnChung` = «Việc trong dự án — mọi người xem được dự án đều thấy việc này»;
  - `lichSu.viecKhuat` = «một việc bạn không có quyền xem».

  Bản `en` có câu tương ứng.
- Dữ liệu thử đi qua đường ghi thật (caller tRPC, hàm ghi của packages/db), không chèn bảng.
- Thông điệp ghim của từng eval chép đúng từ `evals.yaml`.

## Review Focus

1. Việc được nhắc đã bị xoá: vết vẫn còn, mang null, không ném lỗi khi vẽ — E6, E7.
2. Một việc vừa gắn bản ghi vừa trong dự án: `aiThay` = `ban-ghi`, không phải `du-an` — ô V3 của E1.
3. Vết tự dời có `boi` vắng (dời tay) khác `boi: null` (bị che): khung phải vẽ câu dời thường cho vắng, câu «vì …» với chữ che cho null — E7.
4. Lịch sử dài: phép che đọc mã việc một lần (`findMany` theo tập mã), không đọc từng vết — kiểm trong E4 bằng số câu đọc không cần, chỉ là luật viết.
5. Khung 375 với câu dài ở «Gắn với»: không cuộn ngang — E11.

---

### Task 1: Bài kiểm API (đỏ trên onehub)

**independent:** false · phục vụ E1, E3, E4, E5, E6, E8

**Files:**
- Create: `apps/api/test/viec-rieng-trong-cuoc.spec.ts`

**Interfaces:** dùng `batApp, goi, nguoi, taoThu, thoaThuan, donViec` của `./support/viec-gieo`, `moXuong, donDep` của `./support/ke-hoach-gieo`, `viecChiTietOutput`, `viecVetOutput` của `../src/viec/viec.contracts`.

- [ ] Viết sáu `describe` mang đúng tên `-t`: `vrc-ma-tran`, `vrc-chuyen`, `vrc-phu-thuoc`, `vrc-tu-doi`, `vrc-viec-con`, `vrc-man-du-an`. Ma trận, đối chứng dương, lời ném theo đúng `expected` của E1, E3–E6, E8. Đáp án E1 là mảng 24 phần tử viết tay trong tệp. Dữ liệu dự án và phụ thuộc tạo qua `duAn.tao`, `viec.doiDuAn`, `duAn.phuThuocTao`, `viec.doiLich`.
- [ ] Chạy `bun run test -- "cd apps/api && bun test test/viec-rieng-trong-cuoc.spec.ts"`. Mong đợi: E1, E3, E4, E5, E6 ĐỎ với đúng lời đã ghim; E8 XANH (bài kiểm giữ).
- [ ] Đột biến tay cho E8: bỏ `duAnId` khỏi chỗ chọn việc của `DuAnService.lich` (tạm, không commit) → E8 ném `vrc: man du an lo V`. Hoàn lại. Ghi kết quả vào sổ (dòng `fix` stage S3).
- [ ] Commit chỉ tệp kiểm: `test(viec-rieng-chi-nguoi-trong-cuoc): bài kiểm API đỏ trên onehub`.

### Task 2: Bài kiểm DOM và lệnh đếm (đỏ trên onehub)

**independent:** false · phục vụ E2, E3b, E7, E10

**Files:**
- Create: `apps/app/test/viec-rieng-trong-cuoc.dom.tsx`
- Create: `packages/db/test/dem-viec-rieng.spec.ts`

**Interfaces:** DOM dùng `dat, mo, cho, dongHet` của `./khung-gop-y`, `KhungViec`, `LichSuViec`, `viecMessages`, và hai lược đồ `viecChiTietOutput`, `viecVetOutput` (import từ `apps/api/src/viec/viec.contracts.ts` theo đường tương đối, như các test DOM khác nhập kiểu tRPC). Kiểm đếm dùng hàm ghi của `packages/db/src/viec-ghi.ts`, `du-an-ghi.ts`.

- [ ] Viết `vrc-khung-chu`, `vrc-khung-doi`, `vrc-lich-su-khung` theo E2, E3b, E7. Dữ liệu giả đi qua `.parse` của lược đồ thật.
- [ ] Viết `vrc-dem` theo E10: fixture W1, W2, V, R2/R3, G; đọc lại `viecVet` rồi ghim; spawn lệnh thật; kiểm mã thoát trước khi parse; import động `giaoDichChiDoc`.
- [ ] Chạy hai lệnh `vrc_khung`, `vrc_khung_doi`, `vrc_lich_su_khung`, `vrc_dem` của config. Mong đợi: ĐỎ với lời ghim (`vrc: khung du-an hua rieng`, `vrc: khung khong doi sau doi du an`, `vrc: lich su vo`, `vrc: dem thoat <ma>`).
- [ ] Commit chỉ tệp kiểm.

### Task 3: API — `aiThay` và che lịch sử

**independent:** false · phục vụ E1, E3, E4, E5, E6

**Files:**
- Modify: `apps/api/src/viec/viec.contracts.ts`
- Modify: `apps/api/src/viec/viec.service.ts`
- Create: `apps/api/src/viec/viec-khuat.ts`

**Interfaces — Produces:**
- `AI_THAY = ["rieng", "du-an", "ban-ghi"] as const`; `viecChiTietOutput` thêm `aiThay: z.enum(AI_THAY)`.
- `aiThayCua(h: { duAnId: string | null; gan: unknown[] }): AiThay` trong `viec-khuat.ts`: `gan.length > 0` → `ban-ghi`; `duAnId` → `du-an`; còn lại `rieng`.
- `vetViecRa`: lược đồ đầu ra trong `viec.contracts.ts`, chiếu từ `vetViec`. Nó thay đúng bốn nhánh: `them-phu-thuoc`/`go-phu-thuoc` có `viec` nullable; `doi-han`/`doi-bat-dau` có `boi` nullable-optional; `them-viec-con` có `sau` nullable. Các nhánh khác dùng lại nhánh gốc. `viecVetOutput.vet` đổi sang `vetViecRa`.
- `cheVet(vet: VetViec, thay: ReadonlySet<string>): VetViecRa` và `maNhac(vet: VetViec): string[]` trong `viec-khuat.ts`.
- `ViecService.lichSu`: gom `maNhac` của mọi hàng, đọc một lần `viec.findMany({ where: { AND: [{ id: { in } }, dieuKienXemViec(userId)] }, select: { id: true } })`, rồi `cheVet`.

- [ ] Cài theo Interfaces.
- [ ] Chạy `bun run test -- "cd apps/api && bun test test/viec-rieng-trong-cuoc.spec.ts"` → XANH cả sáu. Chạy thêm `test/viec-quyen.spec.ts`, `test/viec-cha-an.spec.ts`, `test/du-an.spec.ts` → XANH.
- [ ] `bun run check-types` → 0 lỗi (consumer của `viecVetOutput` ở app phải biên dịch, Task 4 sửa nếu đỏ — gộp commit với Task 4 nếu cần để mỗi commit dựng được).
- [ ] Commit.

### Task 4: Khung việc và lịch sử trên màn

**independent:** false · phục vụ E2, E3b, E7, E11, E12

**Files:**
- Modify: `apps/app/lib/messages/viec.ts` (vi + en: `khung.duAnChung`, `lichSu.viecKhuat`)
- Modify: `apps/app/components/viec/khung-viec.tsx` (ô «Gắn với» và dòng mô tả theo `v.aiThay`; `rieng` → `khung.rieng`; `du-an` → `khung.duAnChung`, mô tả = `v.duAn.ten`; `ban-ghi` → như cũ)
- Modify: `apps/app/components/viec/lich-su-viec.tsx` (null → `lichSu.viecKhuat` ở chỗ tên việc; `boi === null` vẫn dùng câu «tự dời»)

- [ ] Cài; khung đọc lại `viec.get` sau `doiDuAn` (đã có invalidate thì giữ, chưa có thì thêm).
- [ ] Chạy ba lệnh DOM → XANH; `bun run test -- "cd apps/app && …"` các test khung việc cũ → XANH.
- [ ] `bun run lint`, `bun run lint:slop` → sạch (luật «AI một tên», messages-guard có dấu).
- [ ] Commit.

### Task 5: Lệnh đếm và tài liệu

**independent:** false · phục vụ E9, E10

**Files:**
- Create: `packages/db/scripts/dem-viec-rieng.ts` (xuất `giaoDichChiDoc<T>(db, than: (tx) => Promise<T>): Promise<T>` mở `$transaction` và chạy `SET TRANSACTION READ ONLY` trước thân; `main` đọc `DATABASE_URL`, rỗng → stderr nêu `DATABASE_URL`, thoát 2; đếm ba số bằng truy vấn đọc; in JSON một dòng)
- Modify: `packages/db/package.json` (script `viec:dem-rieng`)
- Modify: `CONTEXT.md` mục «Việc»; `docs/api.md` mục «Việc»; `docs/production.md` thêm mục chạy lệnh đếm (chỉ đọc, của chủ kho)

Định nghĩa đếm:
- `viecDuAnKhongGan` = việc có `duAnId` và không `gan`.
- `vetNhacViecRieng` = dòng `viecVet` thuộc một việc KHÔNG riêng, mà `maNhac` của dòng có một việc hiện là riêng.
- `viecRiengBiNhac` = số việc riêng khác nhau xuất hiện trong các dòng đó.

«Riêng» là không `gan` và không `duAnId`. `maNhac` dùng lại từ Task 3 (đặt hàm thuần ở chỗ cả hai gói nhập được: nếu apps/api không nhập được từ packages/db/scripts thì để `maNhac` ở `packages/validation` và hai nơi cùng nhập).

- [ ] Cài; chạy `vrc_dem` → XANH.
- [ ] Commit.

### Task 6: Răng màn và chụp

**independent:** false · phục vụ E11, E12

**Files:**
- Create: `_acceptance/viec-rieng-chi-nguoi-trong-cuoc/rang/man.mjs` (khuôn `_acceptance/du-an-gantt/rang/man.mjs`: `PHIEN_DO` bắt buộc, dữ liệu qua API thật, sáu ảnh `vrc-*.png`, lời thoát đúng E11/E12, dòng cuối `vrc man: dat`)

- [ ] Viết; chạy lần đầu sẽ do S4 làm trong làn M5 (đo màn là việc nặng). Trước đó chỉ `node --check`.
- [ ] Commit; contract `status: implemented`; dispatch S4.
