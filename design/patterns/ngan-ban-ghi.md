---
nhom: ngan-ban-ghi
doi_tuong: [deal, lien-he, cong-ty, ke-hoach, muc-tieu, kr, so-kr]
khuon:
  ten: RecordSheetFrame
  nhap: apps/app/components/crm/record-sheet/record-parts.tsx
  lop_trinh_bay: KhungNgan
nhan_dien:
  dang_ky: apps/app/components/crm/record-sheet/record-sheet-host.tsx
  kind: [deal, contact, company, plan, objective, kr, so-kr]
mau_dang_chay:
  doi_tuong: deal
  tep: apps/app/components/crm/record-sheet/deal-sheet.tsx
khe_bat_buoc: [loading, error, title]
khe_tuy_chon: [errorView, loadingView, onRetry, lyDo, description, note, media, actions, stats, tabs, than, vo, vungThan, cuonCaKhung]
cam_ngoai_khuon: [DetailSheetHeader, Spinner, VungTaiLoi, Skeleton]
thanh_phan_tang_ngan:
  cho_tai: ChoTaiNgan
  loi_tai: KhungTaiLoi
ngoai_le:
  - tep: apps/app/components/crm/record-sheet/kr-sheet.tsx
    khoi: Skeleton
    ly_do: chờ tải của riêng mục «Sổ nguồn» khi quyền còn chưa biết, bên trong thân đã tải xong — không phải chờ tải của ngăn
  - tep: apps/app/components/crm/record-sheet/so-kr-sheet.tsx
    khoi: [Skeleton, DetailSheetEmpty]
    ly_do: NoiDungSoKr là phần Số KR nhúng vào mục «Sổ nguồn» của ngăn KR, không phải một ngăn; ngăn SoKrSheet dùng khung
---

# Khuôn ngăn bản ghi

Mọi loại bản ghi mở trong ngăn bên phải (`record-sheet-host.tsx`) dựng bằng **một khung**: `RecordSheetFrame`, nhập từ
`record-parts.tsx`. Khung giữ đầu ngăn, chờ tải, lỗi tải và chỗ đặt thẻ con, để mở bảy loại ngăn người dùng gặp cùng một
hình. Màn mẫu là ngăn deal.

Chủ kho chốt 30/10 (bản phạm vi `docs/plan/pham-vi-ban-do-khuon-3010.md`, hàng BK1) và 31/10 «BK chạy trước».

## Luật

- **Ngăn mới đi qua khung.** Không gọi thẳng `DetailSheetHeader`, `Spinner`, `VungTaiLoi` hay `Skeleton` cho trạng thái của
  ngăn. Ngoại lệ ở `ngoai_le` của frontmatter, mỗi dòng có lý do.
- **Khung thiếu chỗ thì mở khe ở khung, không thoát khung.** Ngăn KR cần thẻ con nằm giữa thân, «không thấy» có nút về
  mục tiêu, vỏ mang dấu dữ liệu riêng; các khe ấy nay nằm trong khung (`than`, `KhungTaiLoi.hanhDong`, `vo`, `vungThan`).
- **Chờ tải là khung xương.** Mặc định `ChoTaiNgan` — hình `ngan` của `KhungXuong` trong `packages/ui`: hàng ô số, một
  thanh, các đoạn thân. Không vòng quay. Ngăn chỉ đổi nhãn đọc màn hình hay gắn dấu dữ liệu, không đổi hình.
- **Lỗi tải là `KhungTaiLoi`.** Nó nói đúng lý do: `khong-con` (bản ghi đã xoá hay không tìm thấy, nút Đóng hoặc nút riêng),
  `khong-quyen`, `mat-ket-noi` (mặt thử lại chính là `VungTaiLoi` của `packages/ui`). `VungTaiLoi` dùng thẳng ở tầng trang,
  theo `docs/design.md` mục «Chờ tải và lỗi tải».
- **Khe chờ tải và lỗi bắt buộc qua kiểu.** `loading` và `error` là prop bắt buộc của khung; bỏ một trong hai thì
  `check-types` đỏ.
- **Thẻ con tuỳ chọn, đi cả ba prop.** Có `tabs` thì phải có `tab` và `onTabChange`; ngăn không có thẻ con (Số KR) bỏ cả ba.
- **Thân tự đặt thẻ con.** Ngăn cần thẻ con ở giữa thân thì dùng `than={(theCon) => …}`; còn lại khung đặt `stats` rồi thẻ
  con.

## Đối tượng → tệp

| Đối tượng | `kind` | Tệp | Gọi khung bằng |
| --- | --- | --- | --- |
| deal | `deal` | `deal-sheet.tsx` | `RecordSheetFrame` |
| liên hệ | `contact` | `contact-sheet.tsx` | `RecordSheetFrame` |
| công ty | `company` | `company-sheet.tsx` | `RecordSheetFrame` |
| kế hoạch | `plan` | `plan-sheet.tsx` | `RecordSheetFrame` |
| mục tiêu | `objective` | `objective-sheet.tsx` | `RecordSheetFrame` |
| KR | `kr` | `kr-sheet.tsx` | `KhungKr` → `KhungNgan` (lớp trình bày, nhận `onBack`) |
| Số KR | `so-kr` | `so-kr-sheet.tsx` | `RecordSheetFrame` |

`KhungKr` gọi `KhungNgan` thay cho `RecordSheetFrame` vì nó nhận `onBack` từ ngăn và được bài kiểm dựng thẳng không có
bộ đọc đường dẫn; cả hai đi cùng một thân khung.
