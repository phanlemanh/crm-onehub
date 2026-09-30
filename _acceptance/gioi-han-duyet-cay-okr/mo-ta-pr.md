# Lượt 8c OKR — mức hiển thị giới hạn, bước duyệt nhẹ, tái cơ cấu không mồ côi

Hồ sơ `_acceptance/gioi-han-duyet-cay-okr` · MT-06, QT-02, TC-06 · T3.

## Người dùng được gì

- **Mức hiển thị.** Người sửa được một mục tiêu đặt nó ở mức **giới hạn** — từ menu «…»
  của khung mục tiêu («Mức hiển thị…») hay ngay trong hộp «Đặt mục tiêu», để mục tiêu
  nhạy cảm không lộ dù chỉ lúc còn nháp. Chỉ người liên quan (người phụ trách, người
  phụ trách KR, người làm việc dưới KR, người tham gia), trưởng sửa được nó, quản trị và
  tối đa 20 người xem có tên thấy. Người khác không thấy nó ở danh sách, bảng họp, bảng
  chấm, tệp xuất, «Việc của tôi», tin nhắc buổi sáng hay Trợ lý OKR; mở đường dẫn của nó
  thì thấy «Không tìm thấy mục tiêu này» — đúng câu của mục tiêu không có. Mục tiêu giới
  hạn không vào số gộp của ai (cả quản trị), không căn chỉnh được và không nằm ở nhóm
  «chưa căn chỉnh» của cây căn chỉnh; chọn giới hạn khi
  mục tiêu còn căn chỉnh thì hộp báo số căn chỉnh cần gỡ. Đầu khung có nhãn «Giới hạn».
- **Bước duyệt.** Chương trình OKR có ô **«Công bố cần duyệt»** (mặc định tắt, chỉ quản
  trị đổi). Bật thì người sửa được mục tiêu bấm «Gửi duyệt»; người duyệt suy từ cây tổ
  chức (mục tiêu phòng ban — trưởng bộ phận; bộ phận — quản trị; cá nhân — trưởng phòng
  ban chính) thấy mục «Chờ bạn duyệt» trong việc OKR và tin buổi sáng, mở khung và bấm
  «Duyệt và công bố» hay «Trả lại…» kèm lý do 10–500 ký tự; người gửi thấy dải «Chờ …
  duyệt», rút lại được, và thấy lý do khi bị trả lại. Trong lúc chờ, nội dung, KR, căn
  chỉnh và mức hiển thị khoá. Người duyệt tự bấm «Công bố» thì công bố thẳng. Tắt ô khi
  còn mục chờ: mục chờ ở lại và người sửa được công bố thẳng.
- **Tái cơ cấu không mồ côi.** Cài đặt › Tổ chức: phòng ban, bộ phận có dòng «OKR: N mục
  tiêu ở kỳ đang mở»; đơn vị còn OKR mở không lưu trữ được (hộp lưu trữ nói lý do, nút
  khoá, có «Chuyển OKR…»), đơn vị có lịch sử OKR không xoá hẳn được (máy chủ trả câu, không
  còn lỗi 500). Hộp **Chuyển OKR** đưa 1–50 mục tiêu cùng cấp sang đơn vị khác, giữ KR,
  cập nhật tuần, căn chỉnh, người xem và vết; một mục hỏng thì cả lô không chuyển. Sức
  khoẻ chương trình có khối **OKR mồ côi** (đơn vị đã lưu trữ, không ai sửa được, người
  phụ trách hay người phụ trách KR đã rời) với lối sửa: «Chuyển OKR…», «Đặt trưởng»,
  «Mở mục tiêu».
- Bộ OKR mẫu có thêm một mục tiêu giới hạn (phòng Pháp chế), một mục tiêu chờ duyệt, một
  vết trả lại trên bản nháp, một phòng ban lưu trữ chỉ còn OKR quý đã khép.

## Cách làm

- **Luật xem là một hàm, hai dạng.** `xemDuocMucTieu` (thuần, `@crm/validation/okr-hien-thi`)
  và `dieuKienXemMucTieu` (điều kiện Prisma, `@crm/db/okr-hien-thi`). Mọi đọc mục tiêu và
  bảy bảng con của nó ở API, `packages/db` và tác tử gắn điều kiện này; số gộp bỏ giới hạn
  qua `boGioiHan`. API dựng ngữ cảnh từ cùng cây quyết quyền sửa; nhắc buổi sáng và tác tử
  dựng bằng `nguCanhXemOkr`. `soi-ma.mjs --ca xem` soi mọi lời đọc.
- **Bước duyệt không thêm bảng.** Trạng thái `cho-duyet`, ô `duyetCongBo` theo phiên bản
  chương trình, người duyệt suy lúc đọc bằng `nguoiDuyetMucTieu` (`@crm/db/okr-duyet`) —
  API và bộ sinh nhắc gọi cùng hàm. Sáu hành động vết mới: `doi-hien-thi`, `gui-duyet`,
  `duyet`, `tra-lai`, `rut-duyet`, `chuyen-don-vi`.
- **Cây tổ chức không nhập module OKR.** `to-chuc` hỏi số OKR mở và lịch sử qua
  `demOkrCuaDonVi` / `demOkrTheoDonVi` (`@crm/db/okr-don-vi`).
- Tài liệu: `docs/api.md` (mục OKR, mục cây tổ chức), `docs/agent.md` (hai loại nhắc,
  trợ lý đọc lại quyền), `CONTEXT.md` (Mức hiển thị, Chờ duyệt / Người duyệt, Chuyển OKR,
  OKR mồ côi).
- **Hồ sơ 9b ghim lại trong PR này**, vì 8c đổi đường đọc của trợ lý. Bài `tach-giao-dich`
  của 9b nay so đúng khoảng thay đổi của lượt 9b (`2e328047^1..^2`) thay cho so với onehub,
  cùng cách onehub đã sửa `tai-lieu.mjs`. E22 xanh; E24 thoát 1 theo giới hạn đã khai ở #212.

## Khối giao diện mới — bậc dừng (docs/design.md)

| Khối | Bậc | Đã tra |
|---|---|---|
| Hộp mức hiển thị | 1 | `radio-group`, `token-field`, `field` có sẵn |
| Dải chờ duyệt, bị trả lại | 1 | `alert`, `badge` |
| Hộp trả lại, hộp chuyển OKR | 1 | `dialog`, `combobox`, `checkbox`, `item`; ReUI «transfer list» — không cần |
| Khối OKR mồ côi | 1 | `item`, `badge`, `empty`, `skeleton` |
| Ô «Công bố cần duyệt» | 1 | `switch`, `field` (`orientation="horizontal"`) |
| Dòng OKR mở và hộp lưu trữ chặn ở Tổ chức | 1 | `item`, `alert`, `dialog` |

Hộp chuyển OKR dùng chung cho Tổ chức và Sức khoẻ nên sống ở `apps/app/components/okr`,
không ở thư mục tính năng.

## Dữ liệu

`migration` chỉ thêm: `okrObjective.hienThi` (mặc định `cong-khai`), `okrProgramConfig.duyetCongBo`
(mặc định `false`), bảng `OkrNguoiXem` cuối `schema.prisma`. Không sửa dữ liệu, không xoá cột.

## Đo sau khi gộp

- `rang/ty-le-gioi-han-duyet.sql` (chỉ đọc, `SET okr.chu_ky`): tỷ lệ mục tiêu giới hạn
  trên mục tiêu đã công bố; trung vị giờ chờ duyệt, tỷ lệ xử lý trong 5 ngày, số lần tắt ô
  duyệt trong hai tuần sau khi bật.
- `rang/okr-mo-coi.sql` mỗi thứ hai: danh sách mục tiêu mồ côi và lớp của nó.

## Giới hạn đã biết

- Mục tiêu cá nhân của người đã rời ở kỳ đang mở không ai sửa hay bỏ được: quyền sửa chỉ
  có khi người đó còn trong cây, quản trị không có lối riêng, và «Mở mục tiêu» mở khung
  chỉ đọc. Mục tiêu nằm ở danh sách OKR mồ côi tới khi kỳ đóng, nên phép đọc mồ côi hằng
  tuần sẽ thấy nó. Câu hỏi sản phẩm để ngỏ cho Cổng Bằng chứng: sổ quyết định
  `decisions.jsonl` dòng 14 (d-20260929T082318Z-14, loại revisit).
- Số OKR mở của mỗi đơn vị trên cây tổ chức có tính mục tiêu giới hạn, nên người không
  xem được vẫn đoán được đơn vị đó có mục tiêu giới hạn.
- Mục tiêu còn chờ duyệt khi kỳ sang chấm điểm không duyệt, rút lại hay bỏ được nữa, và
  vẫn chặn lưu trữ đơn vị của nó.
- Chỉ số «chưa khởi điểm» ở Sức khoẻ chương trình không tính mục tiêu đang chờ duyệt.
- Bảng Vết không hiện chi tiết của lần đổi mức hiển thị và lần chuyển đơn vị.
- Chuyển một mục tiêu đang chờ duyệt sang đơn vị khác đổi người duyệt mà không báo ai.
- Người duyệt gửi duyệt được cho chính mình qua thủ tục; màn không hiện nút đó cho họ.
- Ghi theo mã KR (nguồn số, việc, bằng chứng) cho người cầm mã KR biết mục tiêu giới hạn
  của nó đã bỏ hay đã công bố.
- Hai khe tranh chấp hẹp: gắn căn chỉnh cùng lúc với đặt giới hạn; ghi nội dung KR cùng lúc
  với gửi duyệt.
- Hộp dời phòng ban sang bộ phận khác chưa nói trước số mục tiêu đi theo.
- Hai hồ sơ đã ký có bài sửa vì bộ mẫu và số loại nhắc lớn thêm: `n4_du_duong` của
  `no-sau-luot-4-okr` (câu expected vẫn ghi năm loại nhắc) và số đếm của `okr-mau.spec`
  (`bo-okr-mau`).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
