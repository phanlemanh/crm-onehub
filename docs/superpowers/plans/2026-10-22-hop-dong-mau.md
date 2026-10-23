# Bộ hợp đồng mẫu — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (thực thi tuần tự trong phiên). Bước dùng `- [ ]`.

**Goal:** `bun run hop-dong:mau` gắn sáu hợp đồng mẫu có nhãn vào ô Tệp của bảy thoả thuận mẫu qua đường ghi thật của DA19,
kèm đáp án cho DA23.

**Architecture:** Byte bộ mẫu sinh một lần bằng `pdf-lib` của `apps/agent`, commit ở `packages/db/mau/hop-dong/` cùng
`dap-an.json`; khuôn đáp án Zod ở `packages/validation`, bộ đọc ở `packages/db`. Lệnh nạp ở `apps/api/scripts/` theo khuôn
`okr:mau`: chặn production trước mọi import nặng, rồi dựng ngữ cảnh Nest (`AppModule`) để lấy `FieldsService`,
`CompaniesService`, `DealsService`, `FieldFilesService` thật; tải byte bằng `fetch` PUT lên URL đã ký.

**Tech Stack:** Bun, NestJS, Prisma, `pdf-lib`/`@pdf-lib/fontkit` (devDep có sẵn ở `apps/agent`), `unpdf`, `mammoth`.

**Spec:** `docs/superpowers/specs/2026-10-22-hop-dong-mau-design.md` · hợp đồng `_acceptance/hop-dong-mau/contract.md` ·
evals `_acceptance/hop-dong-mau/evals.yaml`.

## Global Constraints

- Không chú thích trong mã (AGENTS.md). Hằng số một tệp cấu hình mỗi khu (`cau-hinh.ts`).
- Không sửa tệp của `apps/api/scripts/okr-mau/**` (hồ sơ `bo-okr-mau` đã ký); chỉ import `kiemDuocNap`, `mayChuCua`.
- Thêm thư viện vào gói nào thì khai ở `package.json` của chính gói đó; vùng chung chỉ thêm dòng (luật 7).
- Test tạo công ty, thoả thuận qua service phải dọn `agentTask` theo id (bài học DA19).
- Ghi thẳng bảng chỉ cho người dùng mẫu (`user`, `member`) theo Hỏi-1, và chỉ sau mọi bước kiểm.
- Khoá trường `hop-dong`, nhãn trường «Hợp đồng»; tên bản ghi mang « · mẫu».

## Review Focus

- Kho tệp tắt mà workspace thiếu cùng lúc: thông điệp nói cả hai hay chỉ cái đầu — chọn kiểm theo thứ tự cố định
  (workspace → kho → khoá trường), mỗi lần một lỗi; E6 ghim thứ tự.
- Chạy lại khi một thoả thuận mẫu bị người lưu trữ: `requestUpload` từ chối «bản ghi đã lưu trữ»; lệnh khôi phục? Không —
  lệnh tìm theo tên cả bản ghi đã lưu trữ và báo lỗi có tên thay vì tạo bản thứ hai. E4 không phủ; thêm một ca ở E6 nếu rẻ.
- Tên thoả thuận mẫu trùng tên một thoả thuận thật người dùng đặt: tìm theo tên + công ty mẫu, không theo tên trần.
- Byte PUT lên mà `complete` trả `trung`: DA19 xoá Blob mới ngay (`donNgay`) — đếm Blob ở E4 dựa vào hành vi ấy.
- Lệnh chạy khi API đang chạy cùng kho: không khoá gì chung; chạy song song hai lệnh nạp là ca không hỗ trợ.

---

### Task 0: Gộp onehub sau DA19, đường nền

- [x] Gộp `origin/onehub` (830d82e1f) bằng merge commit, `bun install`.
- [ ] Xin khoá `duong-nen`, chạy `duong-nen.mjs` trên worktree sạch tách riêng ở cùng commit, chép `duong-nen.md` về.

### Task 1: Đáp án và bộ đọc bộ mẫu (phục vụ E1, E2)

**Files:** Create `packages/validation/src/hop-dong-mau.ts`, `packages/db/src/hop-dong-mau.ts`; Modify
`packages/validation/package.json`, `packages/db/package.json` (một dòng `exports` mỗi tệp).

**Interfaces:**
- `dongDapAnHopDongMau` (Zod): `ma` `HD1`..`HD6`, `tenTep`, `kieu` `pdf|docx`, `sha256`, `thoaThuan` (tên thoả thuận mẫu đích),
  `coChu`, `ngayKy`/`ngayHetHan` (`YYYY-MM-DD` hoặc `null`), `giaTri` (số nguyên đồng hoặc `null`), `doan`
  `{ ngayKy?, ngayHetHan?, giaTri? }` (đoạn chữ nguyên văn), `suyTu?` (luật suy hết hạn).
- `docDapAnHopDongMau(chu: string): DapAnHopDongMau` — ném lỗi có tên khi sai khuôn.
- `boHopDongMau(): { tep: (DongDapAn & { byte: Uint8Array })[] }` — đọc `packages/db/mau/hop-dong/` theo vị trí tệp.

### Task 2: Bộ dựng và sáu tệp (phục vụ E1, E2)

**Files:** Create `apps/agent/scripts/sinh-hop-dong-mau.ts`; byte ở `packages/db/mau/hop-dong/` + `dap-an.json`.

- Nội dung theo bảng design mục 1; nhãn ba chỗ; siêu dữ liệu PDF cố định (`Title`, `Subject`, `Creator`, `Producer`,
  ngày tạo và sửa cố định 2026-10-22); DOCX bằng zip lưu không nén có `docProps/core.xml`.
- HD5: ảnh xám dựng điểm ảnh, vẽ chữ không dấu bằng phông bitmap 5×7 trong bộ dựng (nhãn mẫu và ba thuộc tính), không lớp
  chữ.
- Bộ dựng tính `sha256` và ghi `dap-an.json`; chạy `bun apps/agent/scripts/sinh-hop-dong-mau.ts`.

### Task 3: Bài kiểm bộ mẫu (E1, E2)

**Files:** Create `apps/agent/test/hop-dong-mau.spec.ts` — `describe("hdm-bo-mau")`, `describe("hdm-doc-chu")`, theo đúng
`expected` của E1, E2 (bảng ca và bảng giá trị viết tay, đối chứng trên bản chép thư mục tạm).

### Task 4: Lệnh nạp (phục vụ E3–E6)

**Files:** Create `apps/api/scripts/hop-dong-mau.ts`, `apps/api/scripts/hop-dong-mau/{cau-hinh,chan,lenh,nap}.ts`; Modify
`apps/api/package.json` (`hop-dong:mau`), `package.json` gốc (`hop-dong:mau`).

**Interfaces:**
- `HOP_DONG_MAU` (`cau-hinh.ts`): khoá trường, nhãn, tên công ty, tên bảy thoả thuận, id và thư người mẫu, mã thoát
  `{ chan: 2, sai: 4, khoTat: 6 }`, thông điệp.
- `kiemDuocNapHopDong(env): KetQuaChan` (`chan.ts`) — gọi `kiemDuocNap` của `okr-mau/chan.ts`, dựng lại câu theo `lyDo`.
- `chayLenh(args: string[], phu?: { ungDung?: () => Promise<INestApplicationContext> }): Promise<number>` (`lenh.ts`).
- `napHopDongMau(ctx, bo, inRa): Promise<DongBaoCao[]>` (`nap.ts`): kiểm tiền đề → người mẫu → công ty → thoả thuận → trường →
  gắn từng tệp.

### Task 5: Bài kiểm lệnh nạp (E3, E3b, E4, E5, E6)

**Files:** Create `apps/api/test/hop-dong-mau.spec.ts`, `apps/api/test/hop-dong-mau-san.ts` (kho giả: `khoTepTruongGia` của
DA19 bọc một máy chủ `Bun.serve` nhận PUT theo URL đã ký và ghi vào kho; đếm PUT, tiêm lỗi 503 và lỗi trước `complete`).

### Task 6: Tài liệu (E7)

**Files:** Modify `docs/setup.md` (mục dữ liệu mẫu, chỉ thêm).

### Sau Task 6

`bun run test`, `check-types`, `lint`, `lint:slop`, `build`; hợp đồng sang `implemented`; S4.
