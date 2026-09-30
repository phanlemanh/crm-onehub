# Lượt 8d OKR — sửa UX sau lái thử 8c: kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa luật máy chủ có sẵn ra trước mắt người dùng ở tám chỗ đã thấy khi lái thử 8c.

**Architecture:**
- Đầu ra API thêm vài trường: `hienThi`, `soNguoiXem`, `nguoiDuyetDuKien`, `lanTraLaiTruoc`.
- Thêm hai truy vấn xem trước (`okr.chuyenDonViXemTruoc`, `org.luuTruXemTruoc`). Mỗi truy vấn gọi CHÍNH hàm kiểm mà mutation tương ứng dùng.
- `okr.countByUnit` đổi sang điều kiện xem của người gọi.
- Giao diện dùng một nhãn khoá chung ở `packages/ui`.
- Không bảng mới, không migration, không đổi luật ghi.

**Tech Stack:** NestJS + nestjs-trpc, Prisma, Zod, Next.js (App Router) + React Query, `bun test`, happy-dom, puppeteer-core cho thước màn.

**Spec:** `docs/superpowers/specs/2026-09-30-ux-lai-thu-8c-okr-design.md` · hợp đồng
`_acceptance/ux-lai-thu-8c-okr/contract.md` · phép đo `_acceptance/ux-lai-thu-8c-okr/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Thành phần giao diện dùng chung chỉ ở `packages/ui`; không đè `className` đổi màu, góc, khoảng cách của thành phần `@crm/ui` (docs/design.md).
- Client component không nhập `@crm/db` hay `@crm/auth`.
- Hằng số tinh chỉnh được nằm trong object cấu hình của khu, không đặt rải trong tệp.
- Chữ giao diện nằm ở `apps/app/lib/messages/*`; câu máy chủ nằm ở `apps/api/src/okr/okr-config.ts` và `apps/api/src/to-chuc/to-chuc-config.ts`.
- Mọi phép đo mới có cặp hai chiều trên cùng fixture: vật lành cho xanh; vật phá trong bản sao cho đỏ, kèm thông điệp ghim.
- Lệnh chứng ở gốc: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.
- Đổi router thì chạy `cd apps/api && bun run trpc:generate`. Nhập tên khuôn gốc ở router, không dùng `import … as`.

## Review Focus

1. Đơn vị không có mục tiêu công bố nào: cây không ghi số (khoá vắng), danh sách rỗng. E10 phủ bằng một đơn vị rỗng của bộ mẫu.
2. Hộp gỡ người mở cho chính quản trị hay cho người vừa bị gỡ ở tab khác: `transferPreview` trả lỗi thì hộp vẫn cho gỡ. E3 ca R phủ.
3. Mục tiêu giới hạn không có người xem có tên: nhãn dùng câu không số. E2 ca `soNguoiXem` 0 phủ.
4. Chuyển OKR khi tập chọn rỗng: không gọi xem trước, nút chuyển khoá như trước lượt này. Thêm vào E9 (Task 8, bước 1).
5. Mục tiêu bị trả lại hai lần: dải người duyệt nêu lần gần nhất. E12 phủ.

---

### Task 1: Danh sách mang mức hiển thị (API)

Phục vụ E1. `independent: false` (các việc giao diện ăn trường này).

**Files:**
- Modify: `apps/api/src/okr/okr.contracts.ts` (`mucTieuOutput`, `nutCanChinh`, `NutCanChinh`, `mucMoCoi`)
- Modify: `apps/api/src/okr/okr-xem.contracts.ts` (`dongKr`)
- Modify: `apps/api/src/okr/okr.service.ts` (`chonMucTieu` thêm `_count: { select: { nguoiXem: true } }` qua include của `docMucTieu`; mapper thêm `hienThi`, `soNguoiXem`)
- Modify: `apps/api/src/okr/can-chinh.ts` (nút mục tiêu và nút KR chép `hienThi`, `soNguoiXem` từ mục tiêu)
- Modify: `apps/api/src/okr/okr-xem.service.ts` (hàng họp tuần chép từ mục tiêu chứa KR)
- Modify: `apps/api/src/okr/okr-tai-co-cau.service.ts` (`moCoi` đọc `hienThi`, `_count.nguoiXem`)
- Test: `apps/api/test/okr-ux-8d.spec.ts` (tạo mới, nhóm `danh-sach`)

**Interfaces:**
- Produces: `MucTieuOutput.hienThi: "cong-khai" | "gioi-han"`, `MucTieuOutput.soNguoiXem: number`, cùng hai trường trên `NutCanChinh`, `dongHop`, `MucMoCoi`.

- [ ] Bước 1: Viết bài `describe("danh-sach")`:
  - gieo G0 (cấp công ty, giới hạn, người xem V) và một cập nhật tuần cho KR của G;
  - dựng ma trận 16 ô theo E1 thành mảng `{ thuTuc, nguoi, kyVong }`;
  - mỗi ô gọi thủ tục thật qua `goi(app, …)` của `tro-ly-okr-san.ts`, đếm mục `hienThi === "gioi-han"`, so `kyVong`;
  - so tập id với `xemDuocMucTieu` trên dữ liệu đọc từ bảng.
  Chiều đỏ: tệp tạm `okr-ux-8d-do.spec.ts`, vá `mucTieuOutput` bằng `mock.module` trả `cong-khai`; chạy một lần, ghi kết quả vào báo cáo việc, rồi xoá.
- [ ] Bước 2: `bun run test -- "cd apps/api && bun test test/okr-ux-8d.spec.ts -t danh-sach"` → ĐỎ (thiếu trường).
- [ ] Bước 3: Thêm trường vào khuôn và mapper. Mapper viết `hienThi: mucHienThi.parse(r.hienThi), soNguoiXem: r._count.nguoiXem`. Dùng khuôn `mucHienThi` đã có ở `@crm/validation/okr-hien-thi`; nếu chưa có thì thêm `export const mucHienThi = z.enum(MUC_HIEN_THI)`.
- [ ] Bước 4: Chạy lại → XANH; `bun run check-types`.
- [ ] Bước 5: Commit `okr: danh sách mục tiêu mang mức hiển thị và số người xem`.

### Task 2: Cây đơn vị đếm theo quyền xem (API)

Phục vụ E10. `independent: true`.

**Files:**
- Modify: `apps/api/src/okr/okr.service.ts:1721` (`countByUnit(userId, cycleId)`: điều kiện `dieuKienXemMucTieu(this.quyenOkr.nguCanhXem(q, userId))` thay `boGioiHan`)
- Modify: `apps/api/src/okr/okr.router.ts` (truyền `ctx.user.id`)
- Test: `apps/api/test/okr-ux-8d.spec.ts` (nhóm `dem-don-vi`)

- [ ] Bước 1: Viết bài:
  - PHẦN 1: 4 người × mọi khoá của `countByUnit`, so với số mục `cong-bo` trong `okr.danhSach` (`loc` rỗng) của đơn vị ứng với khoá. Gieo một nháp ở Pháp chế do chủ G tạo.
  - PHẦN 2: 12 ô (Sức khoẻ, tiến độ gộp của Pháp chế và Khối Hỗ trợ, toàn cảnh) × 4 người, so với hằng ghim.
  - Hằng ghim chụp trên onehub trước khi sửa: chạy phần 2 trên cây sạch bằng `git stash` có tên, in số, chép vào bài.
- [ ] Bước 2: Chạy → phần 1 ĐỎ ở ô Pháp chế của V (`2 != 3`).
- [ ] Bước 3: Sửa `countByUnit`.
- [ ] Bước 4: Chạy → XANH; phần 2 vẫn xanh.
- [ ] Bước 5: Commit `okr: cây đơn vị đếm theo quyền xem của người gọi`.

### Task 3: Người duyệt dự kiến và lần trả lại trước (API)

Phục vụ E11, E12. `independent: true`.

**Files:**
- Modify: `apps/api/src/okr/okr.contracts.ts` (`objectiveOutput.nguoiDuyetDuKien: nguoiOkr.nullable()`, `choDuyet.lanTraLaiTruoc: z.object({ lyDo, nguoi, luc }).nullable()`)
- Modify: `apps/api/src/okr/okr.service.ts` (quanh chỗ dựng `choDuyet`/`traLaiGanNhat` ~1900)
- Test: `apps/api/test/okr-ux-8d.spec.ts` (nhóm `nguoi-duyet`, `tra-lai-truoc`)

- [ ] Bước 1: Viết bài theo E11 (bảng 4 cấp, ba ca null) và E12 (chuỗi hai lần trả lại).
- [ ] Bước 2: Chạy → ĐỎ.
- [ ] Bước 3: Sửa `objective()`:
  - `nguoiDuyetDuKien` bằng `this.quyenOkr.tenNguoiDuyet(q, this.quyenOkr.nguoiDuyet(q, objective))`, chỉ khi `mt.status === "nhap" && ct.duyetCongBo && quyen.guiDuyet`, ngược lại `null`.
  - `lanTraLaiTruoc` là dòng vết `tra-lai` mới nhất có `at` trước `guiCuoi.at`.
  - Dùng lại mảng vết đã đọc cho `traLaiGanNhat`, không truy vấn thêm.
- [ ] Bước 4: Chạy → XANH.
- [ ] Bước 5: Commit `okr: khung mục tiêu nêu người duyệt dự kiến và lần trả lại trước`.

### Task 4: Hai truy vấn xem trước (API)

Phục vụ E7, E8. `independent: true`.

**Files:**
- Modify: `apps/api/src/okr/okr-tai-co-cau.service.ts`
  - `canhBaoTran(tx, dv, chuKy, them = new Map<string, number>())`: đếm cộng `them.get(cycleId) ?? 0`;
  - thêm `chuyenDonViXemTruoc(userId, input)` chạy phần kiểm của `chuyenDonVi` (quyền, cấp, đã bỏ, kỳ đóng) mà không ghi, `them` là số mục chọn chưa ở đơn vị nhận theo từng chu kỳ;
  - `chuyenDonVi` tách phần kiểm thành `kiemChuyen(tx, nc, input)` dùng chung.
- Modify: `apps/api/src/okr/okr.contracts.ts` (`chuyenDonViXemTruocOutput = z.object({ canhBao: z.string().nullable() })`)
- Modify: `apps/api/src/okr/okr.router.ts` (query `chuyenDonViXemTruoc`, input `chuyenDonViInput`)
- Modify: `apps/api/src/to-chuc/to-chuc.service.ts` (`lyDoChanLuuTru(id): Promise<string[]>` gom câu khuôn, người, OKR; `archiveDepartment` gọi nó rồi ném câu đầu, kiểm OKR giữ lại trong giao dịch có khoá; thêm `luuTruXemTruoc({ id })`)
- Modify: `apps/api/src/to-chuc/to-chuc.contracts.ts`, `apps/api/src/to-chuc/to-chuc.router.ts` (query `luuTruXemTruoc`, output `z.object({ lyDo: z.array(z.string()) })`)
- Test: `apps/api/test/okr-ux-8d.spec.ts` (nhóm `chuyen-xem-truoc`, `luu-tru`)

- [ ] Bước 1: Viết bài:
  - E8: 4 ca, mutation chạy trong `db.$transaction` ném lỗi cuộn lại để lấy `canhBao` mà không giữ ghi.
  - E7: 5 phòng gieo cộng mọi phòng sống; `archiveDepartment` gọi trong giao dịch cuộn lại.
- [ ] Bước 2: Chạy → ĐỎ (thủ tục chưa có).
- [ ] Bước 3: Cài như Files. `bun run trpc:generate`.
- [ ] Bước 4: Chạy → XANH; `bun run check-types`.
- [ ] Bước 5: Commit `okr, to-chuc: xem trước chuyển OKR và lưu trữ bằng chính hàm kiểm`.

### Task 5: Nhãn khoá chung và năm danh sách (UI)

Phục vụ E2. `independent: false` (cần Task 1).

**Files:**
- Create: `packages/ui/src/components/restricted-badge.tsx`: `RestrictedBadge({ label, hint, onOpen }: { label: string; hint: string; onOpen: (() => void) | null })`. Dựng bằng `Badge` + `Tooltip`, biểu tượng khoá `aria-hidden`. Khi có `onOpen` là nút có `aria-haspopup="dialog"`, khi không có là `span` có `tabIndex={0}`. Phần tử mang `data-nhan-gioi-han`.
- Modify: `apps/app/components/crm/record-sheet/objective-hien-thi.tsx` (`NhanGioiHan` dùng `RestrictedBadge`)
- Modify: `apps/app/app/(app)/[slug]/okr/khoi-muc-tieu.tsx`, `cay-can-chinh.tsx`, `hop-tuan.tsx`, `toan-canh/suc-khoe/okr-mo-coi.tsx` (vẽ nhãn khi `hienThi === "gioi-han"`, `onOpen={null}`)
- Test: `apps/app/test/okr-ux-8d.dom.tsx` (tạo mới, nhóm `nhan-danh-sach`)

- [ ] Bước 1: Viết bài theo E2, dữ liệu giả dựng từ khuôn đầu ra thật (`RouterOutputs`). Mỗi fixture có đủ trường bắt buộc, kể cả `hienThi`, `soNguoiXem`.
- [ ] Bước 2: Chạy `u8d_dom` → ĐỎ.
- [ ] Bước 3: Cài. Dữ liệu giả của các bài dom cũ phải thêm hai trường mới (khuôn thật); chạy `bun run test:dom` để tìm hết.
- [ ] Bước 4: Chạy → XANH.
- [ ] Bước 5: Commit `ui: nhãn «Giới hạn» dùng chung, hiện ở năm danh sách mục tiêu`.

### Task 6: Hộp gỡ người báo OKR (UI)

Phục vụ E3, E4. `independent: true`.

**Files:**
- Modify: `apps/app/app/(app)/[slug]/settings/members/members-table.tsx` (hộp gỡ đọc `trpc.okr.transferPreview({ fromUserId })` khi mở; có số thì thân nêu câu, nút chính «Chuyển OKR…» mở `chuyen-okr-dialog` với cùng người, «Gỡ» thành nút huỷ; đang đọc hay lỗi thì một dòng, «Gỡ» vẫn bấm được)
- Modify: `apps/app/lib/messages/settings-thanh-vien.ts` (câu mới)
- Test: `apps/app/test/okr-ux-8d.dom.tsx` (nhóm `go-nguoi`); `apps/api/test/okr-ux-8d.spec.ts` (nhóm `go-nguoi`, E4)

- [ ] Bước 1: Viết bài E3 (P, Q, R, S), E4 (đếm độc lập, chỉ kỳ còn ghi được).
- [ ] Bước 2: Chạy → ĐỎ (dom). E4 có thể xanh ngay vì là bài ghim hành vi có sẵn; chạy chiều đỏ của E4 bằng bài đếm cả kỳ đóng để chứng minh bài phân biệt được.
- [ ] Bước 3: Cài. Nếu hộp gỡ đang là `ConfirmDialog` thì mở rộng bằng prop thân và nút phụ đã có, không tự dựng `AlertDialog`.
- [ ] Bước 4: Chạy → XANH.
- [ ] Bước 5: Commit `settings: hộp gỡ người báo OKR đang phụ trách`.

### Task 7: Khung mục tiêu — gửi duyệt, người duyệt, trả lại trước, Vết, «Công bố» (UI)

Phục vụ E5, E13. `independent: false` (cần Task 3).

**Files:**
- Modify: `apps/app/components/crm/record-sheet/objective-duyet.tsx`:
  - `NutGuiDuyet` nhận `soKr`; `soKr === 0` thì nút `disabled`, kèm `<p id=…>` lý do nối qua `aria-describedby`;
  - thân hộp thêm «<tên> sẽ duyệt.» khi có `nguoiDuyetDuKien`;
  - dải người duyệt thêm dòng `lanTraLaiTruoc`.
- Modify: `apps/app/components/crm/record-sheet/objective-sheet.tsx` («Công bố» dùng `variant="outline"` khi `traLaiGanNhat?.nguoi.id === viewerId`; truyền `soKr`)
- Modify: `apps/app/app/(app)/[slug]/okr/bang-vet.tsx` (dòng `tra-lai` hiện `note` ở dòng dưới)
- Modify: `apps/app/lib/messages/okr-gioi-han.ts` (câu mới)
- Test: `apps/app/test/okr-ux-8d.dom.tsx` (nhóm `gui-duyet-khoa`, `duyet-chu`)

- [ ] Bước 1: Viết bài E5, E13.
- [ ] Bước 2: Chạy → ĐỎ.
- [ ] Bước 3: Cài.
- [ ] Bước 4: Chạy → XANH; chạy lại `okr-gioi-han-duyet.dom.tsx` và `the-gop-y-okr.dom.tsx` (không hồi quy).
- [ ] Bước 5: Commit `okr: gửi duyệt báo trước KR và người duyệt, người duyệt thấy lần trả lại trước`.

### Task 8: Hộp lưu trữ và hộp chuyển OKR đọc xem trước (UI)

Phục vụ E6, E9. `independent: false` (cần Task 4).

**Files:**
- Modify: `apps/app/app/(app)/[slug]/settings/organization/xac-nhan-luu-tru.tsx` (một hộp cho mọi trạng thái, đọc `trpc.org.luuTruXemTruoc`; lý do OKR kèm «Chuyển OKR…»; «Lưu trữ» khoá khi còn lý do; lỗi → một dòng, vẫn bấm được)
- Modify: `apps/app/components/okr/hop-chuyen-okr.tsx` (gọi `trpc.okr.chuyenDonViXemTruoc` với `{ tuDonVi, denDonVi, objectiveIds }` khi có nơi nhận và tập chọn khác rỗng; cảnh báo trong `Alert` có `aria-live="polite"`; lỗi → «Chưa kiểm được trần»)
- Modify: `apps/app/lib/messages/okr-tai-co-cau.ts` (câu mới)
- Test: `apps/app/test/okr-ux-8d.dom.tsx` (nhóm `luu-tru`, `chuyen-tran`)

- [ ] Bước 1: Viết bài E6, E9, thêm ca «tập chọn rỗng thì không gọi xem trước» (Review Focus 4).
- [ ] Bước 2: Chạy → ĐỎ.
- [ ] Bước 3: Cài.
- [ ] Bước 4: Chạy → XANH.
- [ ] Bước 5: Commit `settings: hộp lưu trữ và chuyển OKR nói trước điều kiện chặn và trần`.

### Task 9: Khung xương «Theo đơn vị» (UI)

Phục vụ E14. `independent: true`.

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx` (`byUnit.isPending || byUnit.isPlaceholderData` → `<DangTai />`; `DangTai` có `aria-busy` và `sr-only` «Đang tải…» nếu chưa có)
- Test: `apps/app/test/okr-ux-8d.dom.tsx` (nhóm `khung-xuong`)

- [ ] Bước 1: Viết bài E14 hai ca.
- [ ] Bước 2: Chạy → ca (2) ĐỎ.
- [ ] Bước 3: Cài.
- [ ] Bước 4: Chạy → XANH.
- [ ] Bước 5: Commit `okr: Theo đơn vị hiện khung xương khi chờ danh sách đơn vị mới`.

### Task 10: Thước màn và tài liệu

Phục vụ E15. `independent: false` (cần mọi việc trên).

**Files:**
- Create: `_acceptance/ux-lai-thu-8c-okr/rang/man-ux-8d.mjs` (dựng theo `_acceptance/gioi-han-duyet-cay-okr/rang/man-gioi-han-duyet.mjs`: phiên đo `tien-de`, `canh-cay`, puppeteer-core qua `createRequire`, chuột thật; tạo phẩm ra `.acceptance-runs/ux-lai-thu-8c-okr/`; bảng ảnh → chuỗi của E15 là một hằng trong tệp)
- Modify: `docs/api.md` (hai truy vấn xem trước, `countByUnit` theo quyền xem, trường mới)
- Modify: `CONTEXT.md` nếu có chữ mới chưa có mục

- [ ] Bước 1: Viết thước. Chạy `EVAL=E15 bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/ux-lai-thu-8c-okr/rang/man-ux-8d.mjs"` → xanh, 20 ảnh.
- [ ] Bước 2: Phá thử trên bản sao (thước trỏ một chuỗi sai) → đỏ in tên ảnh và chuỗi thiếu; bỏ bản sao.
- [ ] Bước 3: Năm lệnh chứng xanh.
- [ ] Bước 4: Commit `ux-lai-thu-8c-okr: thước màn E15 và tài liệu`.

## Thứ tự

Task 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10, tuần tự trong vòng chính. Việc giao diện ăn đầu ra
của việc API trước nó.
