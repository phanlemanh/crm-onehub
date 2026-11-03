# Đính bằng chứng KR một lối, ngay trong ngăn (SV10 · `bang-chung-kr-mot-loi`)

Hàng SV10 của `docs/plan/lo-trinh-okr.json`, đợt `okr-ghi-trong-ngan-3010`, dãy K, đứng trên SV8 và BK2 (onehub
`a3c562cd7`). Ô cơ hội ký `build` (31/10).

## Vấn đề, đo trên cây `a3c562cd7`

- Thẻ «Bằng chứng» của ngăn KR (`record-sheet/kr-bang-chung.tsx`): nút «Đính bằng chứng» mở `HopThoaiDinh`, một
  `Dialog` với ô đường dẫn và ô ghi chú (:72–186). `docs/design.md` bảng «Dấu hiệu vẽ tay» ghi đúng mẫu này là vẽ tay
  (`Dialog` mở từ trong ngăn để ghi một dòng).
- Khối cập nhật KR (`record-sheet/khoi-cap-nhat-kr.tsx`, do SV8 dựng thay hộp cập nhật cũ): KR mốc chọn «Xong» thì hiện
  một ô đường dẫn bằng chứng tự dựng (:576–601), khác nhãn, khác gợi ý, khác cách báo lỗi với ô trong hộp thoại.
- Vậy bằng chứng của KR vào bằng hai lối với hai ô khác nhau; một trong hai lối là hộp thoại che ngăn.
- Máy chủ không đổi: `okr.themBangChung` nhận `{ keyResultId, url, ghiChu }` (`packages/validation/src/okr-canh-kr.ts`),
  `okr.guiCapNhat` nhận `bangChung` tuỳ chọn cho KR mốc (`okr-cap-nhat.ts`).

## Thiết kế

1. **Một ô đường dẫn** — `ODuongDanBangChung` (tệp mới `record-sheet/o-duong-dan-bang-chung.tsx`): `Field` + `Input
   type="url"` + câu lỗi `loiDuongDan` hoặc gợi ý, `translate="no"`. Khối cập nhật KR mốc và dòng nhập dưới đây cùng dựng
   ô này; khối cập nhật bỏ ô tự dựng.
2. **Dòng nhập tại chỗ cuối danh sách** thay `HopThoaiDinh` — `DongDinhBangChung` trong `kr-bang-chung.tsx`, theo nếp
   `DongNhap` của việc KR (`kr-viec.tsx`): `Item variant="outline"` cuối danh sách bằng chứng (hay trong khối rỗng) gồm
   `ODuongDanBangChung` có tiêu điểm, ô ghi chú, nút «Huỷ» và nút chính «Đính». Enter ở ô đường dẫn đính, Esc huỷ. Bản
   nháp đi qua bộ giữ thay đổi (`useKhaiThayDoi`) khi đóng ngăn hay ‹ ›.
3. **Giữ dấu cho thước đã ký** — dòng nhập mang `data-hop-dinh-bang-chung`, nút chính `data-nut="dinh"` khoá khi đường
   dẫn sai, dòng nhập biến mất khi đính xong. Thước E11/E12 của hồ sơ đã ký `canh-kr-okr`
   (`_acceptance/canh-kr-okr/rang/man-canh-kr.mjs:1266–1312`) đi trọn đường này mà không phải sửa.
4. **Lỗi** — đường dẫn sai và ghi chú quá dài báo dưới ô như nay. Máy chủ từ chối hay mất mạng → một câu tiếng người
   «Chưa đính được bằng chứng. Thử lại sau một lát.» dưới ô đường dẫn, dòng nhập giữ giá trị; không hiện câu máy chủ
   (`docs/design.md` mục «Trường»: lỗi khi lưu nói tiếng người dùng).
5. **Quyền giữ nguyên** — chỉ người sửa được KR, KR không khoá, không chờ duyệt mới thấy nút; KR mốc chưa xong thì nút
   khoá kèm câu vì sao như nay.
6. **Chữ** — hai khoá `bangChung.hop.tieuDe`, `hop.moTa` không còn ai dùng thì bỏ; thêm `bangChung.loiDinh`.
7. **Bản mẫu** `/proto/bang-chung-kr-mot-loi`: thẻ Bằng chứng (rỗng · đang nhập · đường dẫn sai · đang đính · lỗi máy
   chủ · có bằng chứng) và khối cập nhật KR mốc chọn Xong, khổ 1280 và 375, theo `docs/proto.md`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở ngăn KR mốc đã xong → thẻ «Việc và bằng chứng», phần Bằng chứng → bấm «Đính bằng chứng» → dòng nhập hiện
  cuối danh sách, con trỏ trong ô đường dẫn → dán đường dẫn, gõ ghi chú nếu muốn → Enter hay «Đính» → dòng nhập đóng,
  bằng chứng mới hiện trong danh sách (điểm ra: vẫn trong ngăn).
- Lối thứ hai: khối cập nhật của KR mốc, chọn «Xong» → ô bằng chứng (cùng ô) → gửi cập nhật → bằng chứng vào danh sách.
- Biên: KR mốc chưa xong → nút khoá, câu vì sao; người chỉ đọc → không nút; danh sách rỗng → dòng nhập nằm trong khối rỗng.
- Lỗi & quay lại: đường dẫn sai → câu dưới ô, «Đính» khoá; máy chủ từ chối → câu tiếng người, giá trị còn, bấm lại;
  Esc → huỷ, không gửi.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ngăn KR, phần Bằng chứng | xem và đính bằng chứng cho một KR mốc | bảng KR, Sơ đồ, Của tôi / ngăn mục tiêu cha |
| Khối cập nhật KR mốc | ghi lần cập nhật, kèm bằng chứng khi xong | ngăn KR / dòng thời gian Lịch sử |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bc-rong | Bằng chứng | khối rỗng «Chưa có bằng chứng» + nút «Đính bằng chứng» | bấm nút |
| ST-bc-dang-nhap | Bằng chứng | dòng nhập cuối danh sách, con trỏ trong ô đường dẫn | dán, Enter / Esc |
| ST-bc-sai | Bằng chứng | câu «Đường dẫn phải bắt đầu bằng http:// hoặc https://», «Đính» khoá | sửa đường dẫn |
| ST-bc-dang-dinh | Bằng chứng | ô khoá, vòng quay trên «Đính» | chờ |
| ST-bc-loi | Bằng chứng | câu «Chưa đính được bằng chứng. Thử lại sau một lát.», giá trị còn | bấm lại |
| ST-bc-co | Bằng chứng | danh sách tên miền, ghi chú, người đính, ngày; nút «Đính bằng chứng» dưới | đính thêm / gỡ |
| ST-bc-cap-nhat-moc | Khối cập nhật | KR mốc chọn Xong, cùng ô đường dẫn dưới ô số | dán rồi gửi |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Đường dẫn bắt buộc, bắt đầu http:// hay https://; ghi chú tuỳ chọn, tối đa `OKR_CANH_KR.ghiChu.max`. Enter ở ô đường
  dẫn đính; ô ghi chú là `Textarea`, Enter xuống dòng, Ctrl/⌘+Enter đính. Esc huỷ. Dưới `md` dòng nhập vẫn trong ngăn (ngăn kéo).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Item`, `Field`, `Input`, `Textarea`, `Button` | dùng | thành phần `packages/ui` của dòng nhập, như `DongNhap` |
| `ODuongDanBangChung` | tạo (trong `record-sheet`) | một ô cho hai chỗ cùng khu ngăn KR |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: ngăn KR là phần chi tiết; đính bằng chứng là thêm một mục con vào danh sách của chính nó — luồng hiển nhiên.
<!-- UX-SPEC-TEMPLATE>>> -->

## Lựa chọn và căn cứ

- Dòng nhập tại chỗ thay hộp thoại: `docs/design.md:244` «Thêm một mục con (bước, việc, KR) | dòng nhập tại chỗ cuối
  danh sách».
- Một ô cho hai chỗ: `bat_khi` của hàng SV10 «khối cập nhật của KR mốc dùng cùng ô đó».
- Ô nằm ở `record-sheet`, không ở `packages/ui`: hai chỗ dùng cùng thuộc ngăn KR; `docs/design.md:260` chỉ đòi
  `packages/ui` khi ô dùng ở hai khu trở lên.
- Giữ dấu `data-hop-dinh-bang-chung`: thước đã ký `canh-kr-okr` E11/E12 đọc nó; không sửa thước hồ sơ đã ký.

## Ngoài vòng

- Đổi luật «chỉ đính khi mốc đã xong».
- Sửa hay đính lại một bằng chứng đã có; đính nhiều đường dẫn một lần.
- Bằng chứng cho KR không phải mốc.
