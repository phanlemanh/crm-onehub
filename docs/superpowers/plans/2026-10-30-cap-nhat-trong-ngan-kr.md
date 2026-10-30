# Kế hoạch thi công — cap-nhat-trong-ngan-kr (SV8)

Hồ sơ: `_acceptance/cap-nhat-trong-ngan-kr/` (Cổng Phạm vi duyệt 30/10, Phan Le Manh). Hạng T2, không Gate 1.5.

**Mục tiêu:** thay `HopThoaiCapNhatKr` bằng `KhoiCapNhatKr` trong ngăn KR (giữa ô số và Lịch sử); mọi lối «Cập nhật» mở
ngăn KR và cuộn tới khối; không Dialog nào trong luồng.

**Kiến trúc:**

- `apps/app/components/crm/record-sheet/khoi-cap-nhat-kr.tsx` (mới) — khối, hằng `TAB_CAP_NHAT = "cap-nhat"`, hàm
  `denHanCapNhat(lanCuoi, now)` (tuần giờ VN từ thứ Hai, Hỏi-1), hook `useMoCapNhatKr()` cho lối ngoài ngăn (mở ngăn với
  `tab=cap-nhat`, giữ `thuTuKr` khi có, gửi `entry` qua biến mô-đun như `CHUYEN_KR`), và kênh `nghe/baoDaGui` để bảng Họp
  tuần biết KR vừa gửi.
- Ô nhập dùng lại `OGiaTri`, `ChonTuTin`, `OGhiChu`, `docGiaTri`, `loiSo`, `oBanDau` của `cap-nhat-tuan`; `mucGui` và
  `krCapNhatTuSheet` chuyển từ `hop-thoai-cap-nhat-kr.tsx` sang khối.
- Xem trước: `LichSuKr` nhận `xemTruoc?: number | null` và truyền `previewPoint` cho `TargetLineChart` (đã hỗ trợ).
  Khối giữ giá trị đang gõ; `CacMucKr` nâng trạng thái lên để chia cho `LichSuKr`.
- Nháp: `useKhaiThayDoi` của `packages/ui` khi ô có chữ khác ban đầu.
- `LOI_VAO` thêm `hop-tuan`, `bang-don-vi`, `muc-tieu` (cột chuỗi, không migration).

## Task 1 — `LOI_VAO` và khoá lệnh (independent: true)

- Files: `packages/validation/src/okr-cap-nhat.ts`, `packages/validation/test/okr-cap-nhat.spec.ts`,
  `_acceptance/config.yaml` (chỉ thêm khoá `cnk_*`).
- Verify: `cd packages/validation && bun test okr-cap-nhat`; `bun run check-types`.
- Phục vụ E4b, E7.

## Task 2 — Khối cập nhật và xem trước (independent: false)

- Files: `khoi-cap-nhat-kr.tsx` (mới), `kr-sheet.tsx` (bỏ nút đầu ngăn và `useCapNhatKr`; `CacMucKr` dựng khối giữa
  `OSoKr` và `LichSuKr`, cuộn khi `tab=cap-nhat`), `lich-su-kr.tsx` (`xemTruoc`), `apps/app/lib/messages/okr-canh-kr.ts`
  (chỉ thêm khoá).
- Hành vi: mở sẵn khi `denHanCapNhat`, thu một dòng nếu không; mở thì gọi `okr.moCapNhat({ entry })` một lần; gửi bằng nút
  hoặc Ctrl/⌘+Enter; xong thì `cache.okr(..., { settle: "record" })` + `lichSuKr`, `canhKr`, khối thu, `baoDaGui`; lỗi
  hiện trong khối, nháp giữ; KR khác (‹ ›) dựng khối mới theo `key={kr.id}`.
- Verify: `bun run test:dom -- cap-nhat-trong-ngan-kr` (ca E1, E2, E3, E4a, E5, E6, E8), mỗi ca có chiều đỏ ghim.
- Phục vụ E1, E2, E3, E4a, E5, E6, E8.

## Task 3 — Lối vào ngoài ngăn (independent: false, sau Task 2)

- Files: `hop-tuan.tsx`, `theo-don-vi/bang.tsx`, `objective-sheet.tsx`, `nut-cap-nhat-dong.tsx` (nhận `onMo` thay cho
  `mo(mt, kr)`), gỡ `cap-nhat-kr.tsx` phần hook (giữ `coTheCapNhat`, `coNutCapNhat`), gỡ `hop-thoai-cap-nhat-kr.tsx`.
- Bảng Họp tuần: `vuaGui` lấy từ `nghe(baoDaGui)` thay `onDaGui` của hộp.
- Verify: ca E7 của `cap-nhat-trong-ngan-kr.dom.tsx`; `git grep HopThoaiCapNhatKr apps/app` rỗng (E10a).
- Phục vụ E7, E10a.

## Task 4 — Bài API (independent: true)

- Files: `apps/api/test/cap-nhat-trong-ngan-kr.spec.ts` — `moCapNhat` nhận ba `entry` mới, `guiCapNhat` thêm đúng một
  `OkrCheckIn` mang giá trị, tự tin, ghi chú; KR mốc kèm liên kết bằng chứng; từ chối thì không thêm hàng.
- Verify: `cd apps/api && bun test cap-nhat-trong-ngan-kr`.
- Phục vụ E4b, E5.

## Task 5 — Chuyển thước đã ký (independent: false, sau Task 3; chờ V1-7)

- Files: sáu tệp dom và tám thư mục `rang/` liệt kê trong yêu cầu `V1-7`; `_acceptance/cap-nhat-trong-ngan-kr/thuoc-da-ky.md`.
- Ma trận dựng bằng grep mọi assertion chạm `[data-hop-cap-nhat-kr]`, `cap-nhat-ngan-kr`, `useCapNhatKr`; mỗi assertion
  một nhãn giữ / chuyển chỗ đo / thay lời hứa. Thay lời hứa chỉ được là hai lời Hỏi-2 đã duyệt; ô thay lời hứa thứ ba
  (vd bảng Họp tuần trả tiêu điểm về nút dòng sau khi gửi) thành câu hỏi cho chủ kho, không sửa lặng.
- Mỗi hồ sơ một dòng sổ `fix` (luật 34).
- Verify: từng tệp dom xanh; `cnk_thuoc_da_ky` (E10c) đối chiếu ma trận với assertion trước/sau.
- Phục vụ E10b, E10c.

## Task 6 — Thước màn (independent: false, sau Task 3)

- Files: `_acceptance/cap-nhat-trong-ngan-kr/rang/man.mjs` (phiên đo màn 1280 và 375).
- Verify: `bun run do:man` theo khoá `cnk_man`, có chiều đỏ.
- Phục vụ E9.

## Thứ tự

Task 1 và Task 4 song song được nhưng nhỏ — chạy tuần tự trong vòng chính. Rồi 2 → 3 → 5 (khi V1-7 về) → 6.
