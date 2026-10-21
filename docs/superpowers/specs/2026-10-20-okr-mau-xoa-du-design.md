# Xoá bộ OKR mẫu dọn đủ — thiết kế

Việc phụ V3-8 của đợt `vo-khu-muc-tieu`, chủ kho chọn lối A ở Hỏi-6 (20/10): hàng VK7 `ngan-kr-mot-cho` chờ việc này
gộp rồi mới ghim lại `canh-kr-okr`.

## Vấn đề

`okr:mau --xoa` (`apps/api/scripts/okr-mau/nap.ts`, hàm `xoaTrong`) xoá theo một danh sách bảng viết tay. Từ sau lần ghim
`canh-kr-okr` ngày 06/10, kho có thêm các bảng trỏ vào người dùng bằng khoá ngoại kiểu chặn (`viec`, `duAn`,
`ngayNghi`, …). Phép đo màn của `canh-kr-okr` (E12) để người mẫu tạo việc; việc ấy nay ghi cả vào bảng `viec`
(việc chung). Bước dọn vấp khoá ngoại `P2003`, cả giao dịch lùi lại, lệnh thoát 5 với thông điệp «(User)» — không gọi
tên bảng đang giữ. Đo lại 20/10 trên `e6c0296a4`: sau một lượt E12, kho đo còn 2 hàng `viec` (`nguoiGiaoId`,
`nguoiThucHienId`, `taoBoiId` đều là người mẫu); mọi bảng khác trỏ vào người mẫu đều nằm trong danh sách đã dọn.
E12, E15, E17 của `canh-kr-okr` đỏ sẵn trên nền `a0b110b06` vì đúng lỗi này.

## Cách làm

1. **Một sổ khoá ngoại viết trước.** Mỗi khoá ngoại kiểu chặn (`Restrict`, `NoAction`, mặc định) trỏ vào bảng người
   dùng được khai đúng một lần trong một bảng tra ở thư mục bộ mẫu: `don` (bộ mẫu dọn hàng trỏ vào người mẫu) hoặc
   `chan` (dữ liệu nghiệp vụ ngoài bộ mẫu — gặp thì dừng mã 5, kèm lý do một dòng). Khoá `Cascade`/`SetNull` không phải
   khai: chúng không chặn được bước xoá người.
2. **Dọn thêm** trong `xoaTrong`, trước khi xoá người:
   - `viec` do người mẫu tạo (`taoBoiId` thuộc người mẫu); các bảng con (`viecGan`, `viecTheoDoi`, `viecVet`,
     `viecThuTu`, `viecPhuThuoc`, `duAnMocCho`) tự đi theo `Cascade`.
   - `tinHieu` do người mẫu gửi (`nguoiGuiId` thuộc người mẫu) — giám sát dặn dọn cả bảng này; khoá của nó là `SetNull`
     nên không chặn, nhưng hàng do người mẫu sinh ra không được sót lại.
3. **Không xoá dữ liệu ngoài bộ mẫu.** Việc do người ngoài tạo mà giao cho hay do người mẫu thực hiện vẫn chặn: lệnh
   dừng mã 5, không hàng nào đổi — cùng nguyên tắc với ca đã ký «dữ liệu ngoài bộ mẫu đang giữ người mẫu: dừng mã 5,
   nêu bảng, không đổi gì» (`apps/api/test/okr-mau.spec.ts`, khối `xoa-mau`).
4. **Thông điệp gọi đúng tên.** Ngay trong giao dịch, sau mọi bước dọn và TRƯỚC khi xoá người, lệnh đọc catalog
   Postgres (`pg_constraint`): mọi khoá ngoại kiểu chặn vào bảng người dùng còn hàng trỏ vào người mẫu → dừng mã 5, in
   `<bảng>.<cột> (<số hàng>)` cho từng khoá, giao dịch lùi. Không lọc theo sổ: một khoá dán nhãn `don` mà thiếu bước xoá
   vẫn hiện tên.
4b. **Không kéo theo dữ liệu của người ngoài.** Trước khi xoá việc của người mẫu, nếu một việc con của chúng do người
   ngoài tạo, hoặc một phụ thuộc nối chúng với việc của người ngoài → dừng mã 5, nêu `viec.chaId` hay
   `viecPhuThuoc`, không đổi gì. Người theo dõi và gắn bản ghi trên việc của người mẫu đi theo việc (Cascade).
5. **Lưới chống ruỗng.** Một bài kiểm đọc lược đồ Prisma: mọi khoá ngoại kiểu chặn vào `User` phải có trong sổ; thiếu
   → đỏ, gọi tên `<model>.<trường>`. Đây là thứ đã thiếu khi `viec` ra đời.

## Đặc tả UX

Bỏ: việc không chạm giao diện (sổ quyết định, dòng `bỏ đặc-tả-UX`).

## Lối khác đã loại

- **Xoá động theo catalog** (dò mọi khoá ngoại, xoá dây chuyền): chết vì xoá được cả dữ liệu ngoài bộ mẫu trỏ vào người
  mẫu — trái nguyên tắc ở mục 3.
- **Chỉ thêm `viec` vào danh sách tay, cùng thông điệp gọi tên ở mục 4**: không chết — bảng mới sẽ lộ tên ở lượt
  `okr:mau --xoa` kế tiếp thay vì ở PR thêm bảng. Lưới ở mục 5 đổi lấy bắt sớm bằng một luật CI đặt lên mọi PR lược đồ
  có khoá chặn tới người dùng, của mọi dãy. Cân hai giá này là câu hỏi cho người (sổ, dòng thay d-2).
