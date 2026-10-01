# Hình tại điểm quyết định — mien-so-chup-bo-okr-mau (Cổng Phạm vi)

| Điểm | Đếm | Hình |
| --- | --- | --- |
| d-…-1 hướng (a) thay (b) | đã quyết bởi chủ kho 01/10; hai nhánh đã trình trong chat | dưới ngưỡng: quyết định đã có, không cần chọn lại |
| d-…-2 miễn hẹp bốn chốt | chuỗi gọi `okr-mau.ts` → `lenh.ts` → `napBoOkrMau`/`xoaBoOkrMau` → `napTrong`/`xoaTrong` → `okrSoChup`: năm bước nối tiếp, bốn chốt đứng trên đường | cần hình: `chuoi-chot.html` |
| d-…-3 bỏ đặc-tả-UX | một bước | dưới ngưỡng: 1 |
| d-…-4 không làm xanh E12/E14/E23/E25 | một bước | dưới ngưỡng: 1 |
| [GIẢ ĐỊNH] C3 tin hành vi kiemOkrThat | một bước | dưới ngưỡng: 1 |
| [GIẢ ĐỊNH] C1 chỉ đòi khoá keyResultId | một bước | dưới ngưỡng: 1 |

## Đề bài `chuoi-chot`

- Loại hình: flowchart ngang (luồng gọi), một làn.
- Nút theo thứ tự: «bun run okr:mau» → `apps/api/scripts/okr-mau.ts` → `okr-mau/lenh.ts` (`chayLenh`) → `nap.ts` `napBoOkrMau` / `xoaBoOkrMau` (giao dịch) → `napTrong` (createMany okrSoChup) / `xoaTrong` (deleteMany okrSoChup) → bảng `okrSoChup`.
- Chốt gắn trên cạnh, nhãn bằng chữ: C2 «kiemDuocNap: chỉ máy cục bộ, thoát mã 2 trước khi nạp lenh» trên cạnh okr-mau.ts → lenh.ts; C3 «kiemOkrThat: kho không có OKR thật» trên cạnh napBoOkrMau/xoaBoOkrMau → napTrong/xoaTrong; C1 «where có keyResultId (id mẫu)» trên cạnh xoaTrong → okrSoChup; C4 là một nút chặn bên dưới: «apps/api/src, apps/agent, packages: không được nhập okr-mau/nap hay lenh».
- Một nút phụ «ba chỗ sản phẩm vẫn ghi: chụp hằng ngày của tác tử · chupKrCrm · ghiSoKr» nối vào okrSoChup, khác màu, để thấy miễn là chỗ thứ tư có chốt.
- AC liên quan: AC-1 (đường xanh), AC-3 (mỗi chốt vỡ → đỏ), AC-2 (lối khác vẫn đỏ).
