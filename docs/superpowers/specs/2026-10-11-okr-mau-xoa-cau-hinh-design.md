# Gỡ bộ OKR mẫu gỡ luôn phiên bản cấu hình chương trình do người mẫu tạo

Slug `okr-mau-xoa-cau-hinh` · T2 · xếp chồng trên `okr-mau-xoa-cuoc-soan` (nhánh `claude/quirky-bohr-b4f1ad`).

## Vấn đề

Nạp bộ mẫu, `le-hai-dang@mau.onehub.test` bật Soạn OKR cho `mau-okr-pb-kd-bac` ở Cài đặt → OKR
(`okr.setProgram` ghi một hàng `okrProgramConfig` mới, `version` = lớn nhất + 1,
`createdById = 'mau-okr-nguoi-le-hai-dang'`, `aiSoanDonVi = ['mau-okr-pb-kd-bac']`), rồi
`bun run okr:mau --xoa`. Hàng đó còn lại, trỏ người đã xoá và một phòng đã xoá. Hồ sơ
`okr-mau-xoa-cuoc-soan` khai đây là giới hạn (dòng `descope` sau seal) và spec `omx-xoa` đang bỏ đúng
khoá `okrProgramConfig.createdById` khỏi phép quét qua danh sách `DU_PHEP`.

## Quyết định của chủ kho (11/10)

Xoá các phiên bản do người mẫu tạo, và gạt mã đơn vị mẫu khỏi 6 mảng `*DonVi` ở các phiên bản còn
lại. Cấu hình hiện hành lùi về bản cuối trước phiên mẫu (hoặc về mặc định nếu chưa có bản nào) — đúng
nghĩa «gỡ bộ mẫu, trả kho về như cũ». Loại: viết lại tác giả sang người thật (ghi sai lịch sử, giữ cài
đặt demo); để nguyên.

## Căn cứ: không gì tra cấu hình theo số phiên bản

- Bộ đọc đều lấy bản mới nhất: `OkrService.program` (`version desc`), `docChamVaTran`,
  `docThangCham` (`version desc`), `cauHinhAiLuc` (`createdAt desc`; mọi chỗ gọi truyền `now`).
- Số phiên bản chỉ được *chép*: `okrDiemKr.phienBanChuongTrinh` (số nguyên, không khoá ngoại, ghi lúc
  khép kỳ, `bangCham` đọc thang và trọng số trên chính hàng điểm). Hàng vết `cau-hinh` mang số trong
  JSON nhưng tác giả là người mẫu nên đã đi theo `--xoa` (`okrTrail.actorUserId`).
- Mỗi phiên bản là ảnh chụp trọn cấu hình, nên xoá một bản ở giữa không làm bản sau thiếu trường.
- Hệ quả nhận: `setProgram` lấy lớn nhất + 1, nên số của bản bị xoá được dùng lại ở lần ghi kế.

## Cách làm (chỉ `apps/api/scripts/okr-mau/**`, tệp kiểm, `docs/setup.md`)

1. `tapMau` thêm hai tập:
   - `cauHinh` — mã các phiên bản có `createdById` thuộc người mẫu đang có **hoặc** bắt đầu
     `mau-okr-` (như cuộc soạn: bắt cả bản mồ côi từ một lần `--xoa` trước bản vá).
   - `cauHinhGat` — các phiên bản còn lại có ít nhất một phần tử bắt đầu `mau-okr-` trong một mảng
     `*DonVi`. Bảng nhỏ; đọc hết các mảng rồi lọc trong mã, vì Prisma không lọc phần tử mảng theo
     tiền tố.
   Danh sách 6 trường rút từ `OKR_PROGRAM_MAC_DINH` (khoá có giá trị là mảng), không chép tay — một
   trường `*DonVi` mới tự vào.
2. Cả hai tập vào `tong`: kho chỉ còn phiên bản mồ côi vẫn được gỡ và đếm.
3. `xoaTrong`: `okrProgramConfig.deleteMany({ id in cauHinh })`; với mỗi hàng của `cauHinhGat`, ghi
   lại đúng các mảng có mã mẫu với mã mẫu đã bỏ — không tạo phiên bản mới, không đổi cột khác.
   Trong cùng giao dịch hiện có, nên mã 5 vẫn để kho nguyên.
4. Dòng in của `--xoa` thêm `N phiên bản cấu hình chương trình OKR do người mẫu tạo` và
   `gỡ mã đơn vị mẫu khỏi M phiên bản khác`.
5. Nạp lại gọi cùng `xoaTrong`, nên cài đặt người mẫu bật lúc demo cũng lùi khi nạp lại.
6. `omx-xoa` bỏ `DU_PHEP`: khoá `okrProgramConfig.createdById` thành một khoá phải-thấy-trước,
   phải-mất-sau như bốn khoá `okrCuocSoan.*`.

## Phép đo

Spec mới `apps/api/test/okr-mau-cau-hinh.spec.ts` (tiền tố ca `omc-`). Phiên bản «của người thật»
dựng bằng bộ ghi thật (`okr.setProgram` qua cookie người mẫu) rồi đổi đúng một cột `createdById`
sang `ngoai-mau-nguoi-omc` — giữ khuôn của bộ ghi, không viết tay hàng. Phiên bản mồ côi: chụp hàng
do `setProgram` ghi (`to_jsonb`), gỡ bộ mẫu, chèn lại đúng hàng đó (`jsonb_populate_record`) — đúng
trạng thái kho của ai đã chạy `--xoa` trước bản vá. Một phép quét mới quét mọi cột `text[]` của kho
tìm mã người, bộ phận, phòng ban mẫu. Đột biến trên bản sao cây như hồ sơ anh em
(`ca-chap-chon-cach-ly/rang/ban-sao.mjs`).
