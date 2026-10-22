# Kế hoạch thi công — nhap-truong-luc-tao (DA16)

Hợp đồng: `_acceptance/nhap-truong-luc-tao/contract.md` (duyệt manh 21/10 14:46Z). Thiết kế:
`docs/superpowers/specs/2026-10-21-nhap-truong-luc-tao-design.md`. Hạng T2, không có cổng duyệt kế hoạch.

Đọc lại mã DA15 trên onehub 95a71d219: tên khớp thiết kế — `fields.layout`, `useBoTriTruong(entity, tuTao)`,
`mucChiTiet`, `nhanTruongChuan`, `kieuTruongChuan`, `khoaTruongChuan` (`apps/app/components/crm/fields/truong-chuan.ts`),
`STANDARD_FIELD_KEYS`, `REQUIRED_STANDARD_KEYS`, `isRequiredStandardKey` (`@crm/db/fields-chuan`). Không sửa hợp đồng.

Hai điều mã thật bắt thêm, không đổi hợp đồng:

- `companyCreateInput` chỉ nhận `name`, `domain`, `ownerId`; `contactCreateInput` không nhận `linkedinUrl`,
  `twitterUrl`, `githubUrl`. AC-1 đòi form có mọi trường chuẩn đang hiện, nên đầu vào tạo phải nhận thêm các cột ấy
  (đúng tên và luật `blankToNull` như `update`).
- Mặt «sửa tại chỗ» của Điện thoại tự tạo gửi đúng chuỗi người gõ (`docNhapTheoKieu`), không chuẩn hoá. Form theo
  cùng luật («một trường, một cách cư xử»); đáp án PHONE của E3, E3b là chuỗi gõ — ghi một dòng sổ `fix`.

## Việc

### Việc 1 — Lỗi trường mang khoá (validation + API)

- Files: `packages/validation/src/loi-truong.ts` (mới, export `@crm/validation/loi-truong`),
  `packages/validation/package.json`, `apps/api/src/fields/loi-gia-tri-truong.ts` (mới),
  `apps/api/src/trpc/middlewares/domain-error.middleware.ts`, `apps/api/src/trpc/error-formatter.ts`,
  `apps/api/src/fields/fields.service.ts` (`applyValues` ném lỗi mang khoá).
- Hình dạng: `data.truong = { khoa, lyDo: "thieu" | "gia-tri" }`; một schema Zod `loiTruong` và một hàm
  `docLoiTruong(data: unknown)` mà formatter ghi và app đọc.
- Verify: `cd packages/validation && bun test`; `bun run check-types`.
- Phục vụ: E5, E5b. independent: false (việc 2 dùng).

### Việc 2 — Ba thủ tục tạo nhận trường (API)

- Files: `apps/api/src/{companies,contacts,deals}/*.contracts.ts`, `*.service.ts` (create),
  `apps/api/src/fields/fields.service.ts` (`kiemBatBuocLucTao`, `queueBackfillForNewRecord(entity, id, daCo)`),
  `apps/api/src/generated/server.ts` (sinh lại).
- Trong cùng giao dịch `withCrmEvents`: tạo bản ghi → kiểm trường tự tạo bắt buộc chưa lưu trữ (thiếu khoá hay rỗng →
  `LoiGiaTriTruong` lý do `thieu`) → `applyValues`. Hàng chờ Kara bỏ các khoá đã có giá trị.
- Verify: `apps/api/test/nhap-truong-luc-tao.spec.ts` (E3b, E4b, E5b, E7, E8); bài cũ `fields.spec.ts`,
  `ten-mien-nen-tang.spec.ts`, `dien-thoai-ca-nhan.spec.ts`, `giai-doan.spec.ts`.
- Phục vụ: E3b, E4b, E5b, E7, E8. independent: false.

### Việc 3 — Mặt «ô form tạo» và hàm chọn trường (app)

- Files: `apps/app/components/crm/fields/kieu-truong.tsx` (`DongKieu.oTao`, `MoTaTao`, `OTruongTao`),
  `apps/app/components/crm/fields/truong-chuan.ts` (`mucFormTao`), `apps/app/components/crm/fields/form-tao.ts` (mới:
  `useFormTao(entity)` — tải `fields.list`, bố trí, bản nháp trường tự tạo, kiểm lúc bấm Tạo, dựng `fields`, đọc lỗi
  máy chủ), `apps/app/lib/messages/crm.ts` (chỉ thêm dòng: câu «Chưa tạo được <loại>.»).
- Ô tích chưa tích là để trống (Hỏi-4). Kiểm theo `docNhapTheoKieu`; Chọn/Người bắt buộc không có «Không có».
- Verify: `bun run check-types`; E2 (rang quét).
- Phục vụ: E2. independent: false.

### Việc 4 — Ba sheet «Tạo mới»

- Files: `apps/app/app/(app)/[slug]/{companies,contacts,deals}/create-*-sheet.tsx`.
- Mọi ô theo `mucFormTao` qua `OTruongTao`; ngoại lệ ô Công ty (`CompanyPicker`) và ô Giai đoạn (ngay sau Công ty).
  Luật riêng giữ trong bộ mô tả: tên miền nền tảng, số điện thoại sai, tiền tệ báo cáo mặc định. Nút Tạo khoá khi
  `fields.list` đang tải. Lỗi máy chủ có khoá → toast tiếng Việt + câu dưới ô; lỗi khác giữ như nay.
- Verify: E1, E1b, E1c, E3, E4, E5 trong `apps/app/test/nhap-truong-luc-tao.dom.tsx`.
- Phục vụ: E1, E1b, E1c, E3, E4, E5. independent: false.

### Việc 5 — Hai ô thêm nhanh

- Files: `apps/app/components/crm/record-sheet/quick-add.tsx`.
- Cùng `useFormTao`, bớt Công ty; Người phụ trách điền sẵn chủ công ty; Giai đoạn không hiện (như nay, mặc định giai
  đoạn mở đầu). `dirty` tính cả trường tự tạo.
- Verify: E6, E1c (`dien-thoai-ca-nhan.dom.tsx`).
- Phục vụ: E6. independent: false.

### Việc 6 — Phép đo còn lại

- Files: `_acceptance/nhap-truong-luc-tao/rang/quet.mjs` (E2), `rang/do-man.mjs` (E9), E8b trong tệp DOM, hai fixture
  lỗi `apps/app/test/fixtures/loi-tao-*.json` sinh từ bài API.
- Verify: mỗi phép đo có cặp hai chiều trên cùng fixture (khuôn MEASURE-BIRTH-CLAUSE); chạy lần phá-thử ghi vào sổ.
- Phục vụ: E2, E8b, E9. independent: false.

## Thứ tự

1 → 2 → 3 → 4 → 5 → 6, tuần tự trong phiên chính: mọi việc chung tệp hay chung kiểu với việc trước.

## Năm lệnh

`bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` trước khi xin lượt S4.
