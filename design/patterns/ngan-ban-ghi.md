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
  ngoai_khuon:
    - kind: soan
      ly_do: khung soạn OKR của Kara (CuocSoanTrongKhung) — mặt trò chuyện theo docs/ai-ux.md, không phải ngăn bản ghi
    - kind: soan-bo
      ly_do: khung soạn bộ OKR của Kara — mặt trò chuyện theo docs/ai-ux.md, không phải ngăn bản ghi
    - kind: hoi-okr
      ly_do: cột hỏi Kara về OKR (CotHoiKara) — mặt trò chuyện theo docs/ai-ux.md, không phải ngăn bản ghi
    - kind: viec
      ly_do: nợ — ngăn Việc dựng bằng KhungViec của apps/app/components/viec, chưa vào khuôn; đưa vào khuôn là một hàng riêng
mau_dang_chay:
  doi_tuong: deal
  tep: apps/app/components/crm/record-sheet/deal-sheet.tsx
khe_bat_buoc: [loading, error, title]
khe_tuy_chon: [errorView, loadingView, onRetry, lyDo, description, note, media, actions, stats, tabs, than, vo, vungThan, cuonCaKhung]
cam_ngoai_khuon: [DetailSheetHeader, Spinner, VungTaiLoi, Skeleton, Sheet, Dialog]
cam_ho: [Sheet, Dialog]
thay_cho:
  DetailSheetHeader: RecordSheetFrame
  Spinner: ChoTaiNgan
  VungTaiLoi: KhungTaiLoi
  Skeleton: ChoTaiNgan
  Sheet: RecordSheetFrame
  Dialog: khối soạn trong ngăn, ConfirmDialog hay PickListDialog
thanh_phan_tang_ngan:
  cho_tai: ChoTaiNgan
  loi_tai: KhungTaiLoi
ngoai_le:
  - tep: apps/app/components/crm/record-sheet/kr-sheet.tsx
    khoi: Skeleton
    ly_do: chờ tải của riêng mục «Sổ nguồn» khi quyền còn chưa biết, bên trong thân đã tải xong — không phải chờ tải của ngăn
  - tep: apps/app/components/crm/record-sheet/so-kr-sheet.tsx
    khoi: Skeleton
    ly_do: NoiDungSoKr là phần Số KR nhúng vào mục «Sổ nguồn» của ngăn KR, không phải một ngăn; ngăn SoKrSheet dùng khung
  - tep: apps/app/components/crm/record-sheet/company-plans.tsx
    khoi: Spinner
    ly_do: chờ tải mục Kế hoạch trong thân ngăn công ty đã tải xong
  - tep: apps/app/components/crm/record-sheet/contact-plans.tsx
    khoi: [Skeleton, VungTaiLoi]
    ly_do: chờ tải và lỗi tải mục Kế hoạch trong thân ngăn liên hệ đã tải xong
  - tep: apps/app/components/crm/record-sheet/khoi-cap-nhat-kr.tsx
    khoi: Spinner
    ly_do: nút gửi cập nhật KR đang chạy
  - tep: apps/app/components/crm/record-sheet/kr-bang-chung.tsx
    khoi: [Dialog, Spinner]
    ly_do: nợ — hộp nhỏ một ô dán đường dẫn bằng chứng mở chồng lên ngăn KR, chờ dời sang khối soạn trong ngăn; nút đính đang chạy
  - tep: apps/app/components/crm/record-sheet/lich-su-kr.tsx
    khoi: [Skeleton, VungTaiLoi]
    ly_do: chờ tải và lỗi tải mục Lịch sử trong thân ngăn KR đã tải xong
  - tep: apps/app/components/crm/record-sheet/objective-duyet.tsx
    khoi: [Dialog, Spinner]
    ly_do: hộp lý do trả lại bắt buộc — Dialog nhỏ mà docs/design.md mục «Ghi vào bản ghi» cho phép; nút duyệt, trả lại đang chạy
  - tep: apps/app/components/crm/record-sheet/objective-hien-thi.tsx
    khoi: [Dialog, Spinner]
    ly_do: nợ — hộp chọn ai thấy mục tiêu mở chồng lên ngăn để sửa một trường, chờ dời sang sửa tại chỗ; nút lưu đang chạy
  - tep: apps/app/components/crm/record-sheet/objective-trao-doi.tsx
    khoi: [Skeleton, Spinner]
    ly_do: chờ tải dòng thời gian Trao đổi trong thân ngăn mục tiêu; nút gửi bình luận đang chạy
  - tep: apps/app/components/crm/record-sheet/plan-steps.tsx
    khoi: VungTaiLoi
    ly_do: lỗi tải mục Bước trong thân ngăn kế hoạch đã tải xong
  - tep: apps/app/components/crm/record-sheet/quick-add.tsx
    khoi: Spinner
    ly_do: nút thêm nhanh đang chạy
  - tep: apps/app/components/crm/record-sheet/kr-viec.tsx
    khoi: Skeleton
    ly_do: chờ tải danh sách Việc trong thân ngăn KR đã tải xong
  - tep: apps/app/components/crm/record-sheet/objective-dien-bien.tsx
    khoi: Skeleton
    ly_do: chờ tải biểu đồ Diễn biến trong thân ngăn mục tiêu đã tải xong
---

# Khuôn ngăn bản ghi

Mọi loại bản ghi mở trong ngăn bên phải (`record-sheet-host.tsx`) dựng bằng **một khung**: `RecordSheetFrame`, nhập từ
`record-parts.tsx`. Khung giữ đầu ngăn, chờ tải, lỗi tải và chỗ đặt thẻ con, để mở bảy loại ngăn người dùng gặp cùng một
hình. Màn mẫu là ngăn deal.

Chủ kho chốt 30/10 (bản phạm vi `docs/plan/pham-vi-ban-do-khuon-3010.md`, hàng BK1) và 31/10 «BK chạy trước».

## Luật

- **Ngăn mới đi qua khung.** Không nhập `DetailSheetHeader`, `Spinner`, `VungTaiLoi`, `Skeleton`, hay mảnh thô của
  `Sheet`, `Dialog` trong thư mục ngăn. Luật `onehub/ngan-trong-khung` của `lint:slop` và bài
  `apps/app/test/khung-ngan.spec.ts` đọc `cam_ngoai_khuon`, `cam_ho`, `thay_cho`, `ngoai_le` từ frontmatter này — sửa
  danh sách ở đây, không ở mã. Ngoại lệ ở `ngoai_le`, một dòng một tệp, mỗi dòng có lý do; tệp không còn dùng khối thì
  xoá dòng.
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
