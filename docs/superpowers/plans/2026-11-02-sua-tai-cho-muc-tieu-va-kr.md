# Kế hoạch thi công — sua-tai-cho-muc-tieu-va-kr (SV9)

Hợp đồng: `_acceptance/sua-tai-cho-muc-tieu-va-kr/contract.md` (duyệt 02/11). Thiết kế:
`docs/superpowers/specs/2026-11-01-sua-tai-cho-muc-tieu-va-kr-design.md`. Nền: onehub `7341a193d` đã gộp (`fe5bf7df6`).

Mã sẵn có từ bước bản mẫu: `record-sheet/truong-okr.ts` (khoá ba trường, `truongMucTieu`, `truongKr`, `loiDoDaiOkr`).

## T1 — Lưu một trường OKR (`record-sheet/luu-truong-okr.ts`, mới)

Hook `useLuuTruongOkr({ loai: "muc-tieu" | "kr", id, objectiveId, nhan })` trả `{ luu, dangLuu }`.

- `luu(khoa, giaTri)`: giá trị bằng giá trị cũ → không gọi. `loiDoDaiOkr` khác null → `toast.error` câu độ dài của
  `okrMessages(...).sheet.tenDoDai` hoặc `viSaoDai`, không gọi. Còn lại gửi đúng `{ id, [khoa]: giaTri }` qua
  `okr.updateObjective` hoặc `okr.updateKeyResult`.
- `onSuccess`: `cache.okr(objectiveId, { settle: "record" })`.
- `onError`: `ownerUserId` + `BAD_REQUEST` → `loiLuuTruong({ nhan, kieu: "USER" })`; mọi lỗi khác →
  `chuaLuu(nhan) + tuChoi.khac`. Không câu nào lấy `error.message`.
- `dangLuu` = `savingField` trên biến của mutation (cùng cách ngăn deal).
- Ô về giá trị cũ: ô sửa tại chỗ hiện `giaTri` của props; không lưu thì props không đổi.

AC: 1, 2, 3, 4, 5, 7, 8.

## T2 — Khối Chi tiết của ngăn mục tiêu (`record-sheet/objective-chi-tiet.tsx`, mới)

`objective-sheet.tsx` đã 1097 dòng nên khối mới ở tệp riêng.

- `KhuChiTietMucTieu({ mt })`: sửa được khi `suaNoiDung(mt) && mt.kyGhiDuoc` (xuất `suaNoiDung` từ
  `objective-sheet.tsx` hoặc chuyển cùng `ghiDuoc` sang tệp mới). Sửa được → `truongMucTieu` + `OTruongPhieu`. Không →
  `DetailSheetProperties` với `HienThiTruong` cho ba giá trị (chữ, không ô).
- Danh sách người: `users.list` như hộp sửa.
- `TabKr` thay `<KhuViSao>` bằng `<KhuChiTietMucTieu>`; xoá `KhuViSao`.

AC: 1, 2, 3, 4, 6.

## T3 — Chi tiết của ngăn KR (`kr-sheet.tsx`)

- `ChiTietKr({ mt, kr })`: tên sửa được khi `mt.canEditKr.includes(kr.id)` ∧ mục tiêu không bỏ, không chờ duyệt ∧
  `mt.kyGhiDuoc`; người phụ trách sửa được khi điều đó ∧ `mt.canEdit`. Ô sửa qua `truongKr(..., { suaNguoi })`; phần
  không sửa vẫn hiện bằng chữ. Hạn và Kiểu giữ nguyên.
- Danh sách người: `okr.thanhVien` mà `KrSheet` đã tải.

AC: 5, 6.

## T4 — «Đã rời» cho người phụ trách (`fields/kieu-truong.tsx`)

`luaChonNguoi`: người hiện tại không có trong danh sách thành viên → nhãn `<tên> · <formerMember>` (trước: chỉ tên).
Đổi chung bảng kiểu trường nên ngăn deal cũng được. AC-4.

## T5 — Chữ (`lib/messages/okr.ts`, cả en và vi)

Bảy khoá `okr.sheet.{khuChiTiet, truongTen, truongViSao, truongNguoi, goiYViSao, tenDoDai, viSaoDai}` đã có từ commit
bản mẫu (f89d32b0e) và đang làm `khoa chet` đỏ vì chưa ai dùng; T1–T3 dùng chúng, không thêm tệp chữ mới.

## T6 — Bài kiểm

- `apps/app/test/sua-tai-cho-okr.dom.tsx`: ca E1–E8 và ma trận 13 ô E13; ngăn thật, tRPC giả ghi lời gọi;
  `TRPCClientError` với `data.code` thật cho E7; QueryClient thật cho E8; đối chứng bỏ `cache.okr`.
- `apps/api/test/sua-tai-cho-okr.spec.ts`: E12 trên cơ sở dữ liệu thử, router thật.
- Bốn bài cũ (E9) và `lint:slop` (E11) phải xanh.

## Thứ tự

T5 → T1 → T4 → T2 → T3 → T6 (viết bài DOM trước khi nối T2/T3 để thấy đỏ) → lint, check-types → S4.
