# Của tôi ba phần — thiết kế

Hàng DH3 của đợt `okr-dieu-huong-1410` (`docs/plan/lo-trinh-okr.json`), phủ C1, C2, C3 và A3 của
`docs/plan/pham-vi-okr-dieu-huong-1410.md`. Dựng trên DH1 (`_acceptance/dieu-huong-khu-muc-tieu/`, khung đầu trang
khu Mục tiêu). Ô cơ hội: `_acceptance/cua-toi-ba-phan/opportunity.md` (Cổng Đáng ký 15/10: build).

## Vấn đề

«Của tôi» hôm nay là bảng mục tiêu người xem phụ trách, tham gia hoặc có KR (`apps/api/src/okr/cua-toi.ts`
`vaiCuaToi`). Trưởng đơn vị không tự phụ trách mục tiêu nào thì gặp trang rỗng dù đang dẫn cả đơn vị. Cập nhật
tuần sống ở một thẻ riêng (`/okr/cap-nhat-tuan`): khối việc ở Của tôi, nhắc Zalo và chuông đều dẫn sang trang đó,
nên lượt cập nhật nào cũng phải rời Của tôi.

## Hướng làm

Của tôi thành hộp việc ba phần, theo thứ tự đọc từ trên xuống:

1. **Cần cập nhật tuần này** — các KR người xem phụ trách ở chu kỳ đang chạy mà chưa có số tuần này (đúng dữ liệu
   `okr.capNhatTuan` mà trang cũ dùng, `updatedThisWeek = false`). Nút «Cập nhật N KR» mở ngay tại chỗ đúng bảng cập
   nhật của trang cũ (`BangCapNhat` trong `okr/cap-nhat-tuan/cap-nhat-tuan.tsx` — ô số, tự tin, ghi chú,
   thanh gửi). Phiên cập nhật (`okr.moCapNhat`) chỉ mở khi người bấm, ghi lối vào mới `cua-toi`. Gửi xong phần này
   hiện «đã gửi» như trang cũ, rồi danh sách tự làm mới.
2. **Đơn vị bạn dẫn** — chỉ hiện khi người xem dẫn ít nhất một đơn vị (`okr.access.headOf`, đúng nguồn DH1 dùng để
   chọn đơn vị đích). Mỗi đơn vị một thẻ, bộ phận trước phòng ban, theo thứ tự cây tổ chức: tên, số mục tiêu, số KR,
   tiến độ trung bình, đếm KR đúng nhịp / chậm nhịp / trượt của chu kỳ đang chọn (đọc `okr.danhSach` của đơn vị
   đó — cùng truy vấn trang Theo đơn vị dùng, nên số khớp hai nơi), nút «Mở trang đơn vị».
3. **KR bạn phụ trách** — mọi KR có người phụ trách là người xem trong chu kỳ đang chọn, ở mọi đơn vị (lọc từ
   `okr.mine`), cột KR (tên + đơn vị · mục tiêu), tiến độ, tình trạng, tự tin; bấm tên mở ngăn chi tiết như bảng
   hôm nay. Mục tiêu trong `okr.mine` mà người xem không có KR nào (họ phụ trách mục tiêu hoặc tham gia) vào nhóm thu
   gọn «Mục tiêu bạn tham gia» đứng trên hai nhóm có sẵn «Đang theo dõi» và «Đã bỏ» — không mục tiêu nào rời Của tôi.

Khối việc OKR (`ViecOkrCuaToi`) đứng ngay dưới phần 1 và thôi hiện việc «Cập nhật tuần» ở Của tôi (phần 1 đã là
việc đó); ở trang Tổng quan việc ấy vẫn hiện, nút dẫn về `/okr?tu=viec-cua-toi`.

**Lối vào từ ngoài.** `/okr?tu=nhac` (nhắc Zalo, chuông) và `/okr?tu=viec-cua-toi` (khối việc ở Tổng quan) mở thẳng
bảng cập nhật trong phần 1, phiên ghi đúng lối vào đó. `/okr` không có `tu` không mở phiên nào. Đường cũ
`/okr/cap-nhat-tuan` (tin Zalo đã gửi vẫn mang nó) chuyển hướng phía máy chủ về `/okr`, giữ nguyên mọi tham số.
Trang chuyển hướng sống lâu dài, không có hạn gỡ (tin Zalo đã gửi không sửa được).
Liên kết nhắc mới sinh (`apps/agent/agent/lib/nhac-ke-hoach.ts`) và hai liên kết trong app (`viec-cua-toi.tsx`,
`hop-thoai-kr.tsx`) trỏ thẳng `/okr`. Giữ nguyên vì không phải liên kết: `hop-thoai-cap-nhat-kr.tsx` (đường import
của bảng cập nhật và tên hành động vết `cap-nhat-tuan`), bản mẫu `ban-mau-okr` (import thành phần mẫu).

**A3.** Thanh thẻ còn bốn thẻ: Của tôi · Theo đơn vị · Toàn cảnh · Hỏi ý (`okr/tab-okr.ts`). Mô tả thẻ Của tôi đổi
thành «Việc cần cập nhật tuần này, đơn vị bạn dẫn và KR bạn phụ trách.». Nhãn vết `cap-nhat-tuan` (sổ hoạt động)
giữ nguyên — đó là tên hành động, không phải tên thẻ. A3 là một commit riêng để gộp lại DH1 dễ.

**C3.** Thành viên không dẫn đơn vị nào: không có phần 2; nút «Thêm mục tiêu» trên đầu trang khoá kèm dòng «Bạn chưa
dẫn đơn vị nào…» (DH1 đã dựng, giữ nguyên); thân Của tôi không có nút hay liên kết nào mời tạo mục tiêu, kể cả khi
chương trình bật OKR cá nhân.

**Đo ngưỡng Cổng Đáng.** Lối vào mới `cua-toi` vào `LOI_VAO` (`packages/validation/src/okr-cap-nhat.ts`); cột
`okrCheckInSession.entry` là chuỗi nên không cần migration. Một lệnh đo chỉ đọc
(`apps/api/scripts/okr/do-cap-nhat-cua-toi.ts`) đếm phiên đã gửi của người đang dẫn ≥1 đơn vị trong một cửa sổ ngày, tách
«mở ở Của tôi» (mọi lối trừ `sheet`) với «mở ở ngăn KR» (`sheet`), in tỉ lệ và cờ sàn 10 phiên.

Không đổi: quyền, thủ tục gửi cập nhật, khuôn dữ liệu, ngăn chi tiết KR (lối `sheet`), trang Theo đơn vị, khung đầu
trang của DH1.

## Vì sao không làm cách khác

- **Xoá hẳn trang cũ** — chết: tin nhắc Zalo đã gửi mang đường `/okr/cap-nhat-tuan?tu=nhac` sẽ thành trang 404.
- **Mở phiên ngay khi tải Của tôi** — mỗi lượt xem đẻ một dòng phiên chưa gửi; bảng phiên hôm nay chỉ có lượt người
  thật sự vào cập nhật. Mở khi bấm giữ nghĩa đó.
- **Phần 3 giữ bảng mục tiêu** — câu giao của hàng là «KR mình phụ trách»; bảng mục tiêu lại lặp phần 2 với trưởng
  đơn vị. Mục tiêu không có KR của mình đi vào nhóm thu gọn để không mất.
- **API mới cho «đơn vị bạn dẫn»** — không cần: `okr.access.headOf` và `okr.danhSach` đủ, và ghi chú của hàng chốt
  «chỉ đọc thêm đơn vị người này dẫn, không đổi quyền».

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: thanh bên «Mục tiêu» → Của tôi → phần 1 «Cần cập nhật tuần này» → «Cập nhật 3 KR» → bảng cập nhật mở tại
  chỗ → điền số + tự tin → «Gửi 3 KR» → «Đã gửi cập nhật tuần» (điểm ra: vẫn ở Của tôi, phần 1 báo đã đủ).
- Từ nhắc: tin Zalo / chuông → `/okr?tu=nhac` → bảng cập nhật đã mở ở phần 1 → gửi.
- Đường cũ: `/okr/cap-nhat-tuan?tu=nhac&kyOkr=…` → chuyển về `/okr?tu=nhac&kyOkr=…`.
- Biên: không phụ trách KR nào ở chu kỳ đang chạy (phần 1 một dòng, không nút); dẫn hai đơn vị (hai thẻ); không dẫn
  đơn vị nào (không phần 2, nút tạo khoá kèm lý do); đơn vị dẫn chưa có mục tiêu ở chu kỳ (thẻ ghi rõ, vẫn có nút mở).
- Lỗi & quay lại: tải phần nào lỗi thì chỉ phần đó hiện lỗi kèm «Thử lại», hai phần kia vẫn đọc được; gửi lỗi giữ
  nguyên số đã nhập, nút thành «Gửi lại» (hành vi của bảng cũ).

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Của tôi (`/okr`) | thấy và làm việc OKR của mình tuần này | thanh bên, thẻ khu, nhắc Zalo, chuông, Tổng quan / trang đơn vị, ngăn mục tiêu |
| Bảng cập nhật trong phần 1 | gửi số tuần này cho mọi KR mình phụ trách | nút «Cập nhật N KR» hoặc `?tu=` / ở lại Của tôi |
| `/okr/cap-nhat-tuan` | (chỉ chuyển hướng) | liên kết cũ / Của tôi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ctbp-dang-tai | Của tôi | ba khung xương cùng chỗ ba phần, đầu trang DH1 hiện ngay | chờ |
| ST-ctbp-can-cap-nhat | Của tôi | phần 1 «3 KR chưa có số của tuần 13/10, hạn thứ Sáu» + bảng 3 dòng + nút «Cập nhật 3 KR» | bấm cập nhật |
| ST-ctbp-dang-cap-nhat | Của tôi | bảng cập nhật mở trong phần 1, thanh gửi dính đáy | điền, gửi |
| ST-ctbp-da-gui | Của tôi | «Đã gửi cập nhật tuần cho 3 KR» trong phần 1 | đọc tiếp phần 2, 3 |
| ST-ctbp-da-du | Của tôi | «Bạn đã cập nhật đủ cho tuần 13/10.» + «Sửa lần gửi tuần này» | sửa hoặc thôi |
| ST-ctbp-khong-kr | Của tôi | phần 1 «Bạn không phụ trách KR nào ở chu kỳ đang chạy.», phần 3 rỗng trỏ Theo đơn vị | sang Theo đơn vị |
| ST-ctbp-dan-mot | Của tôi | phần 2 một thẻ đơn vị: số mục tiêu, KR, tiến độ, ba đếm tình trạng, «Mở trang đơn vị» | mở trang đơn vị |
| ST-ctbp-dan-hai | Của tôi | phần 2 hai thẻ, bộ phận trước phòng ban | mở một đơn vị |
| ST-ctbp-don-vi-rong | Của tôi | thẻ «Chưa có mục tiêu nào ở Q4 2026» + «Mở trang đơn vị» | mở trang đơn vị để đặt |
| ST-ctbp-khong-dan | Của tôi | không phần 2; đầu trang: «Thêm mục tiêu» khoá + dòng «Bạn chưa dẫn đơn vị nào…» | cập nhật KR của mình |
| ST-ctbp-loi-phan | Của tôi | một phần lỗi: «Chưa tải được phần này» + «Thử lại», hai phần kia vẫn đủ | thử lại |
| ST-ctbp-loi-mo | Của tôi | phần 1 «Không mở được lượt cập nhật.» + «Thử lại», bảng chưa mở, `tu` còn trên đường dẫn | thử lại |
| ST-ctbp-dang-cap-nhat-390 | Của tôi 390 px | bảng cập nhật một cột, thanh gửi dính đáy, không tràn ngang | điền, gửi |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Phần 1 theo chu kỳ đang chạy (như trang cũ), không theo ô chu kỳ; phần 2, 3 theo ô chu kỳ của đầu trang.
- `?tu=nhac` / `?tu=viec-cua-toi` mở bảng và cuộn tới phần 1, focus ô số đầu tiên; mở xong `tu` rời đường dẫn để tải
  lại trang không mở thêm phiên.
- Mở bảng lỗi (nút hay `tu`): phần 1 báo «Không mở được lượt cập nhật.» kèm «Thử lại» mở lại đúng lối vào ban đầu;
  `tu` chỉ rời đường dẫn sau khi mở được. Tải lại nền lỗi khi phần 1 đã có dữ liệu thì giữ nguyên bảng đang điền,
  dòng «đã gửi» hay danh sách — «Chưa tải được phần này» chỉ cho lần tải đầu (thêm ở Cổng Bằng chứng 15/10).
- Bảng cập nhật: giới hạn ghi chú 200 ký tự, kiểu số theo kiểu KR, nguồn máy khoá ô — giữ nguyên hành vi bảng cũ.
- 390 px: ba phần một cột; thẻ đơn vị xếp dọc; bảng KR phần 3 ẩn cột tự tin như `KhoiKrCuaToi`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `BangCapNhat` + `DongCapNhat` (cap-nhat-tuan.tsx) | dùng | bảng gửi cập nhật đã đo và ký (hồ sơ cap-nhat-tuan-okr) |
| `SectionHeading`, `Card`, `SimpleTable`, `StatusIndicator` (@crm/ui) | dùng | khuôn phần và thẻ của bản mẫu 14/10 |
| `ViecOkrCuaToi` | mở rộng | thêm cách ẩn việc «Cập nhật tuần» khi đứng trong Của tôi |
| `NhomDangTheoDoi`, `NhomDaBo` | dùng | hai nhóm thu gọn đã ký (okr-cua-toi-tach-theo-doi) |
| Nhóm «Mục tiêu bạn tham gia» | ghép | cùng khuôn nhóm thu gọn của `nhom-da-bo.tsx` |
| Thẻ «Đơn vị bạn dẫn» | ghép | Card + StatusIndicator như bản mẫu `/proto/dieu-huong-okr` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: bảng-điều-khiển (dashboard-first)
Căn cứ: (ii) chọn từ danh sách — trang là hộp việc của một người với ba khối đọc từ trên xuống, việc gấp nhất đứng
đầu; đúng cách Perdoo dựng «My OKRs» mà hàng DH3 dẫn và bản mẫu `/proto/dieu-huong-okr` (14/10) đã vẽ. Luồng hiển
nhiên nên không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->
