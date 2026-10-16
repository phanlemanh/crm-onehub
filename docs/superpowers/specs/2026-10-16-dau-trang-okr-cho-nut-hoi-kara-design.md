# dau-trang-okr-cho-nut-hoi-kara — thiết kế (lần 2, sau DH1)

Hàng NM5 của `docs/plan/lo-trinh-okr.json`. Cổng Đáng `build` 2026-10-15T12:22:27Z. Hạng T2, chỉ `apps/app`.

## Vì sao mở lại

Lần 1 (15–16/10) cho khung chờ đầu trang OKR dựng chính nút «Hỏi Kara», để hàng tiêu đề Toàn cảnh ở khổ 375 không
nhảy 32 → 96 px. Vòng dừng ở S4 vì chồng vùng DH1 `dieu-huong-khu-muc-tieu` (M5). DH1 lên `onehub` 16/10 08:49Z (#437):
đầu trang khu Mục tiêu viết lại, nút «Hỏi Kara» chuyển vào hàng hành động `HanhDongKhu`, khung chờ mới
`DauTrangOkrCho` nằm ngay trong `dau-trang-okr.tsx`, và bản vá bấm hai lần của NM5 (a219fc9fd) được DH1 lấy về cùng hai
ca kiểm của nó (`apps/app/test/nut-hoi-kara-thay-khung.dom.tsx`).

Đo lại 16/10 trên nhánh đã gộp `onehub 04ddefc4f` (E12m của `khung-man-chung`, `chup-man.mjs --chi-do`):

- Lỗi gốc đã hết: hàng tiêu đề 64/32 lúc chờ và lúc xong.
- Còn lỗi mới, bước 1 đỏ: «toancanh 375: vung noi dung lech … noiDung 244/584 … -> … noiDung 284/1594».

M5 chọn lối (b) trên #375 lúc 12:10Z: Mac Studio dựng lại NM5 trên DH1.

## Chẩn đoán (đo 16/10 trên `onehub d5e01c5a3`, bản chép răng E12m in thêm từng phần đầu trang)

| Khổ | Phần | Lúc chờ (top/cao) | Lúc xong (top/cao) |
| --- | --- | --- | --- |
| 1280 | đầu trang | 72/64 | 72/64 |
| 1280 | hàng hành động | 76/28 | 74/32 |
| 375 | đầu trang | 64/96 | 64/136 |
| 375 | hàng hành động | 132/28 | 132/68 |
| 375 | thanh tab | (khung xương) | 224/32 |

Ở 375 hàng hành động lúc chờ là một dòng 28 px (hai khung xương `h-7`), lúc xong là hai dòng 68 px vì các nút thật
cao 32 px (`h-8`) và không vừa một hàng. Đầu trang cao thêm 40 px, nên vùng nội dung tụt 40 px. Ở 1280 lệch 4 px, dưới
ngưỡng 8 px của E12m.

## Cách làm

1. Khung chờ `DauTrangOkrCho` (trong `dau-trang-okr.tsx`) dựng hàng hành động bằng khung xương cùng cỡ với các phần thật
   của `HanhDongKhu` lúc đã có quyền (cao `h-8` như nút, độ rộng theo từng phần: nút «Hỏi Kara», ô chọn kỳ, cụm nút
   theo quyền), để ở 375 chúng xuống dòng y như hàng thật và ở 1280 cao bằng hàng thật. Không đổi `HanhDongKhu`,
   `LuoiDauTrangOkr` hay `NutHoiKara`.
2. Gỡ phần mồ côi của lần 1: `apps/app/app/(app)/[slug]/okr/dau-trang-okr-cho.tsx`, `apps/app/test/dau-trang-okr-cho.dom.tsx`,
   các khoá `dto_*` trong `_acceptance/config.yaml` (dòng của chính NM5, chưa lên `onehub`), và răng chỉ phục vụ chúng.

## Hỏi chủ kho (lên thẻ Cổng Phạm vi)

- **Hỏi-1** — vai ít nút: hàng hành động thật đổi theo quyền (menu thêm, nút soạn, nút thêm chỉ có với người có quyền).
  Phép đo E12m chạy bằng tài khoản quản trị của phiên đo. Với vai ít nút, hàng ở 375 có thể chỉ một dòng, khi đó khung chờ
  hai dòng làm vùng nội dung nhảy LÊN khi tải xong. Khuyến nghị (a): khung chờ khớp hàng của người có quyền đầy đủ (ca
  đo được); vai ít nút ghi Known limits. Lối khác (b): hàng hành động ở 375 giữ chiều cao hai dòng cho mọi vai, cả lúc
  xong — không nhảy với ai, nhưng người chỉ xem có một dòng trống và phải sửa bố cục DH1 (`LuoiDauTrangOkr`).
