# Tiêu đề cột đọc trọn ở các trang danh sách — thiết kế

Hồ sơ: `_acceptance/tieu-de-cot-doc-tron/` · hạng T2 · 2026-09-22

## Vấn đề

Các trang danh sách dựng trên `packages/ui/src/components/data-table.tsx` cắt
tiêu đề cột có nút sắp xếp ở một số khổ. Đo lại trên bàn đo riêng (Chrome thật,
máy chủ dev của cây này, 5 trang × 5 khổ × 2 tiếng = 50 ô): **30 ô có tiêu đề bị
cắt, tổng 67 tiêu đề**, khớp đúng từng ô người dùng đã đo trên deals (320: Công ty, Giai đoạn ·
768: Giá trị, Phụ trách · 1024: Ngày chốt, Hoạt động gần nhất; bản en tương ứng).
Companies, contacts, campaigns và members cũng cắt. Đầu ra đo:
`_acceptance/tieu-de-cot-doc-tron/evidence/nen-truoc-sua.txt`.

## Nguyên nhân (đo, không đoán)

1. **Bề rộng cột là phần trăm cố định trong bảng `table-fixed`**, còn `hideBelow`
   ẩn cột bằng CSS. Phần trăm không bao giờ được chia lại theo cột đang hiện: ở
   768 các cột hiện ra của deals cộng lại 79%, và `table-fixed` đổ phần dư vào
   cột cố định duy nhất — ô chọn `w-10` (40px) rộng **139px**. Ở 1024 bảng deals
   cộng 120%, trình duyệt co mọi cột theo tỷ lệ.
2. **Tiêu đề sắp được cần nhãn + ~58px**, không phải +48: `th` px-3 (24) + nút
   px-2 (16) + viền trong suốt (2) + gap (4) + mũi tên (12). `-ml-2` dịch nút sang
   trái nhưng `max-w-full` vẫn chặn bề rộng nút bằng phần ruột của `th`.

Vì (1), chỉnh số phần trăm từng trang chỉ dời chỗ vỡ sang khổ khác, tiếng khác,
hoặc lần tới ai thêm một cột.

## Cách sửa đã chọn — ở DataTable chung, cộng ba chỉnh ưu tiên cột

`docs/design.md`: `/packages/ui` là nguồn duy nhất của giao diện. Sửa ở đó:

- **Bỏ `table-fixed`** (về bố cục `auto`), thêm `[&_td]:max-w-0` cho ô thân.
  Bề rộng tối thiểu của mỗi cột = bề rộng tối thiểu của **tiêu đề**, nên tiêu đề
  không bị cắt theo cấu trúc. Ô thân `max-w-0` không nong cột: nội dung dài vẫn
  cắt «…» như cũ. Phần trăm thành tỷ lệ chia phần dư.
- **Nhãn tiêu đề xuống tối đa hai dòng** (`line-clamp-2`), với sàn bề rộng bằng
  nửa độ dài nhãn tính theo `ch`, để nhãn luôn vừa hai dòng. Không có bước này,
  sàn của cột là *cả cụm* «Số thoả thuận đang mở» (128px) và cột Tên chịu thiệt:
  đo 15:16Z, companies@1024/vi chữ tên 88→41px, members@768/vi 54→16px.
  Hàng tiêu đề giữ `h-11` (44px) vì hai dòng chữ 12px vừa trong đó.
- **Mũi tên sắp nằm cùng dòng chữ** (nút `inline-block`, không còn flex): cột
  trái thì mũi tên theo sau chữ, cột phải thì đứng trước chữ. Với flex, nhãn
  xuống dòng làm nút giãn hết cột và mũi tên đứng tách xa nhãn.
- **Nút sắp `max-w-[calc(100%+0.5rem)]`**, bù đúng `-ml-2`/`-mr-2`, giữ nhãn thẳng
  hàng với nội dung cột như hiện nay.

Và ba chỉnh ưu tiên cột ở từng trang — đo cho thấy không có chúng thì hỏng
(`evidence/thu-hai-dong-khong-chinh-trang.txt`: campaigns@320 chữ tên 37px và bản
en cuộn 11px, companies@320/vi 51px, members@768/vi cắt «Ngày vào»):

| Trang | Cột | Trước | Sau | Vì sao |
|---|---|---|---|---|
| campaigns | Đã gọi | hiện mọi khổ | ẩn dưới 640 | bốn cột cần hơn 288px; giữ «Trả lời» vì là kết quả |
| companies | Số thoả thuận đang mở | hiện mọi khổ | ẩn dưới 640 | ở điện thoại còn cột Tên đọc trọn; con số xem trong tấm công ty |
| members | Ngày vào | ẩn dưới 640 | ẩn dưới 1024 | ở 768 bốn cột sắp được ép tên còn 25px |

Kết quả (`evidence/thu-hai-dong.txt`, 15:24Z): **50/50 ô không cắt tiêu đề, không
cuộn**. Chữ tên so với cây chưa sửa (`evidence/nen-chu-ten-truoc-sua.txt`): bằng
hoặc rộng hơn ở 38/50 ô; hẹp hơn nhiều nhất ở campaigns@320 (95→72px) và
members@320/vi (62→44px). Nhỏ nhất toàn ma trận: 43px ở contacts@768 — bằng cây chưa sửa.

## Phương án đã loại

- **Chỉnh `width`/`hideBelow` từng trang, giữ `table-fixed`** — tám trang, hai
  tiếng, mọi bản dịch hay cột mới về sau lại vỡ; không sửa nguyên nhân (1).
- **Chỉ bỏ `table-fixed`, nhãn một dòng** — hết cắt tiêu đề nhưng đổi chỗ bị cắt
  sang cột Tên (số ở trên). Tệ hơn với cột quan trọng nhất.
- **Ẩn mũi tên của cột không đang sắp dưới 640px** — làm thử, đo: cột Tên không
  rộng thêm, vì bố cục auto rải phần dư cho mọi cột. Bỏ.
- **Rút gọn nhãn «Số thoả thuận đang mở»** — `CONTEXT.md` đã chốt giữ nguyên cặp
  nhãn này (2026-09-03); mở lại là việc của từ điển, không của hồ sơ này.
- **Đo bằng JS rồi tự ẩn cột** — phức tạp, nhấp nháy khi tải, trùng `hideBelow`.

## Đánh đổi phải nói ra

- **Tiêu đề dài xuống hai dòng** ở 27/50 ô (vd «Hoạt động / gần
  nhất»). Đổi lấy chữ đọc trọn và cột Tên không bị ép.
- **Ba cột ẩn thêm ở khổ hẹp** (bảng trên). Dữ liệu vẫn trong tấm bản ghi.
- **Chữ tên hẹp hơn ở 12/50 ô**, sâu nhất 95→72px (campaigns@320), 62→44px
  (members@320/vi). Hợp đồng đặt sàn 40px (AC-7) và để mắt người phán (AC-9).
- **Đổi bố cục của mọi bảng DataTable**, kể cả onboarding (hồ sơ
  `onboarding-giong-deals`, PR #85, không sửa tệp nào của nó). Thứ tự đã thống
  nhất: #85 merge trước, hồ sơ này rebase rồi chạy thước `ogd_man_danh_muc` của
  nó làm đối chứng (AC-8).
- Nút «Phát chia» ở members@320 bị xén mép phải — **có sẵn trước bản sửa**
  (`evidence/cong1-truoc/members-320-vi.png`), để ngoài phạm vi.
- Cột căn giữa không trang nào dùng — không đo.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở một trang danh sách → đọc tên cột → bấm tiêu đề để sắp (điểm ra: bảng sắp lại, mũi tên chỉ chiều)
- Biên: khổ 320–375 với 3–4 cột; tiêu đề tiếng Việt dài («Số thoả thuận đang mở», «Hoạt động gần nhất»); cột trường tuỳ biến hiện từ 1024
- Lỗi & quay lại: không có luồng lỗi mới

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Danh sách thoả thuận / công ty / cá nhân / chiến dịch / thành viên | tìm và mở một bản ghi | thanh bên / tấm bản ghi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-danhsach-codulieu | mọi danh sách | tiêu đề đọc trọn, tối đa hai dòng, mũi tên sát chữ; ô thân dài cắt «…» | đọc, sắp, mở bản ghi |
| ST-danhsach-dangsap | mọi danh sách | cột đang sắp có mũi tên chiều sắp | bấm lại để đổi chiều |
| ST-danhsach-hep | mọi danh sách, dưới 640px | tiêu đề đọc trọn, bảng không cuộn ngang, chữ tên ≥ 40px; campaigns/companies bớt một cột | đọc, bấm tiêu đề để sắp, mở tấm bản ghi |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Breakpoint 640px (`sm`): campaigns ẩn «Đã gọi», companies ẩn «Số thoả thuận đang mở»; 1024px (`lg`): members hiện «Ngày vào»
- Nhãn tiêu đề tối đa hai dòng; hàng tiêu đề giữ 44px
- Tiêu đề vẫn giữ `title` (tooltip) như cũ

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| DataTable (`packages/ui`) | mở rộng | sửa bố cục một chỗ cho mọi trang |
| Button ghost `xs` | dùng | không đổi biến thể; DataTable (cũng trong packages/ui) đổi cách xếp nội dung nút tiêu đề, như nó đã làm với `-ml-2` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không đổi IA — trang danh sách mở tấm bản ghi sẵn có; luồng hiển nhiên, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->
