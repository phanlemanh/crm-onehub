# Sổ S3 — o-tep-dien-thoai

Cùng một răng (`rang/do-man.mjs`), cùng fixture (công ty, T1 rỗng, T2 một tệp tên dài, trường FILE nhãn dài), ba lượt
trong phiên đo của cây này. Nhật ký trọn ở `.acceptance-runs/o-tep-dien-thoai/do-{truoc,sau,pha}.log`.

| Lượt | Cây | Kết | Lời ghim |
|---|---|---|---|
| Trước vòng | `fefa94528` (mã chưa sửa) | thoát 1, 11 lỗi | `phieu 375 nut canh chu` · `chu hep 67/171px` · `nhan 2 dong` · `mo ta 4 dong` · `nhan truong bi cat` · `nhan canh gia tri` · `le lech 112px` (và bốn lỗi đầu lặp ở «co tep») — chiều đỏ E1, E2 |
| Sau sửa | `a01a29e08` | thoát 0, `otdt man: dat` | — đối chứng dương E1–E5 |
| Bản sao phá | `a01a29e08` + `basis-full` cho khối chữ, `min-w-sm` cho khung (đã hoàn lại) | thoát 1, 5 lỗi | `phieu 375 vung cuon tran 30px` (E3) · `phieu 1280 khung xep doc` (E4) · `nguon 1280 khung xep doc` · `nguon 375 cuon ngang` (E5) |

Chiều đỏ E6: nhánh nháp `tam-otdt-e6` sửa một dòng `packages/ui/test/nguon-canh-nhau.dom.tsx` rồi commit → lệnh
`otdt_dom` thoát 1 với `otdt dom: bai cu bi sua`; trên nhánh thật lệnh thoát 0. Nhánh nháp đã xoá.

Số đo chọn bề rộng nền (sổ quyết định d-…-5): phần còn lại của khung sau nút — phiếu 375 trước vòng 171px, sau khi hàng
xếp dọc 299px; phiếu 1280 665px; hộp tải nguồn 1280 574px, 375 277px. `basis-52` (13rem = 208px): khối chữ rớt dòng khi
chỗ sau nút (≈ trong − 104px) dưới 208px, tức ở mọi khung điện thoại đã đo, và còn cách ngưỡng ≥ 250px ở 1280.

Ngoài vòng, thấy khi đo: nhãn trường dài ở 1280 vẫn bị cắt trong cột 6.5rem (`nhanCat: true`) — đúng mục Out of scope 1.
