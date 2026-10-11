# Gỡ bộ OKR mẫu gỡ luôn cuộc soạn — thiết kế

Hồ sơ: `_acceptance/okr-mau-xoa-cuoc-soan/`. Hạng T2 (chạm `apps/api/scripts/okr-mau/**`,
`apps/api/test/**`, `docs/setup.md`; không chạm đường T3).

## Vì sao

Tái hiện 2026-10-10: nạp bộ mẫu, bật Soạn OKR cho phòng KD Bắc
(`mau-okr-pb-kd-bac`) bằng `le-hai-dang`, `nguyen-thi-lan` mở một cuộc soạn trên chu kỳ năm
kế (`mau-okr-chu-ky-nam-ke`), rồi `bun run okr:mau --xoa`. Lệnh thoát 0 và báo đã xoá hết,
nhưng còn một hàng `okrCuocSoan` trỏ chu kỳ và phòng đã xoá. Bảng không có khoá ngoại nên
không gì cascade, và `xoaTrong` (`apps/api/scripts/okr-mau/nap.ts`) không biết bảng đó.

Đề xuất của cuộc soạn cũng sót: tác tử ghi chúng với `objectiveId = HANG_SOAN.objectiveId`
(chuỗi rỗng, `packages/validation/src/okr-tro-ly.ts`), nên dòng
`okrDeXuat.deleteMany({ objectiveId: O })` không bao giờ chạm tới.

## Thiết kế

**Chọn cuộc soạn của bộ mẫu theo tiền tố, không theo tập vừa đọc.** `tapMau` thêm một tập
`cuocSoan`: mọi hàng `okrCuocSoan` có `cycleId`, `divisionId` hay `departmentId` bắt đầu
`mau-okr-`, hoặc `nguoiMoUserId` thuộc người mẫu (mã `mau-okr-` hay thư `@mau.onehub.test`).
Chọn theo tiền tố, không theo danh sách chu kỳ mẫu đang có, để cuộc mồ côi từ lần `--xoa`
cũ (bộ mẫu đã đi, cuộc còn lại — đúng kho của người tái hiện) cũng bị gỡ. Tập này tính vào
`tong`, nên kho chỉ còn cuộc mồ côi không bị báo «không có gì để xoá».

**Thứ tự trong `xoaTrong`:** xoá `okrDeXuat` có `cuocSoanId` thuộc tập, rồi xoá các
`okrCuocSoan` đó, cùng giao dịch với phần còn lại. Mọi trạng thái đề xuất (chờ, nhận, sửa,
bác, bị loại) đi theo. Ba đường dùng `xoaTrong` — `--xoa`, nạp lại, nạp hỏng tự dọn — cùng
được sửa.

**Đếm:** `DemBoMau` thêm `cuocSoan` và `deXuatSoan`; dòng in của `--xoa`
(`tomTat` ở `lenh.ts`) thêm «N cuộc soạn OKR với M đề xuất soạn». Đường nạp đặt hai số đó
bằng 0, vì nạp không sinh cuộc soạn nào.

**Giữ `aiChiPhi`.** Hàng chi phí của cuộc soạn (`tinhNang = "okr.soan"`, `taskId` là mã
cuộc) ghi tiền đã tiêu thật cho nhà cung cấp mô hình. `chiTieuKhung`
(`packages/db/src/ai-chi-phi.ts`) đọc nó theo `at` để tính trần chi phí tháng: xoá nó là hạ
số đã tiêu của tháng và mở lại trần giả. Hàng còn lại trỏ một `taskId` không còn cuộc nào.
Không bộ đọc nào đi từ chi phí sang cuộc (`tienTheoCuoc` đi từ cuộc sang chi phí), nên hàng
đó chỉ còn được đếm vào tổng tháng. `agentEvent` của phiên soạn cũng giữ: không cột nào trỏ
mã mẫu.

**Mã 5 không đổi:** gỡ vẫn là một giao dịch, nên khi dữ liệu ngoài đang giữ người mẫu thì
cuộc soạn và đề xuất của nó cũng đứng nguyên.

## Tệp

- `apps/api/scripts/okr-mau/nap.ts` — `tapMau`, `xoaTrong`, `DemBoMau`, số đếm của `napTrong`.
- `apps/api/scripts/okr-mau/lenh.ts` — `tomTat`.
- `apps/api/test/okr-mau-cuoc-soan.spec.ts` (mới) — mở cuộc qua `okr.soanMo` thật, đề xuất
  qua `hangTuDongSoan` thật (`gieoDongNhap`), chi phí qua `ghiChiPhi` thật (`gieoChiPhi`),
  gỡ bằng lệnh thật (`chayLenh`).
- `apps/api/test/okr-mau-san.ts` — `lamSachOkr` thêm `okrCuocSoan` vào `TRUNCATE`, để cuộc
  của lượt trước không làm bẩn `demThamChieu` của lượt sau.
- `docs/setup.md` «Bộ OKR mẫu» — một đoạn về cuộc soạn và vì sao chi phí AI ở lại.
- `_acceptance/okr-mau-xoa-cuoc-soan/rang/dot-bien.mjs` — chiều đỏ.

## Ngoài phạm vi

- Mục tiêu do «Đưa vào bộ OKR» hay chốt hỏi ý tạo trong chu kỳ mẫu mang mã không có tiền tố
  `mau-okr-`, nên `--xoa` từ chối mã 3 khi có chúng. Lỗi khác, việc riêng.
- Phiên eve của tác tử soạn (kho phiên của `apps/agent-okr`) không thuộc CSDL CRM.
