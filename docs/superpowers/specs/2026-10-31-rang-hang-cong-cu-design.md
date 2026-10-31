# Răng hàng công cụ — thiết kế (BK6, 31/10/2026)

Hàng BK6 `rang-hang-cong-cu` của `docs/plan/lo-trinh-okr.json`, đợt `ban-do-khuon-3010`, dãy L, đứng sau BK3. Ô cơ hội
ký `build` ngày 31/10. Đích ở `docs/design.md` mục «Thứ tự một màn» và «Hàng công cụ» (chủ kho 25/10); trang tri thức
`ban-do-khuon.md` mục «Khoảng hở 2».

## Vấn đề, đo trên cây

Luật hàng công cụ có, răng không. Đo ở đỉnh nhánh (BK3 `94b81ff80`) trên 534 tệp `.tsx` dưới `apps/app/app` và
`apps/app/components` (trừ `proto/`), bằng cây cú pháp TypeScript:

| Dấu hiệu | Chỗ | Trong đó ô nhập | Nợ thật |
| --- | --- | --- | --- |
| chip lọc dính thanh (`ToggleGroup spacing={0}` ngoài ô nhập) | 9 ở 6 tệp | 2 (kênh thông báo, loại ghi chú) | 7 ở 4 tệp: lọc tình trạng KR, phạm vi Tổng quan ×2, thẻ dòng thời gian, vòng đời và chia cột Lộ trình |
| chip trong thẻ (`ToggleGroup` ngoài ô nhập trong `Card`, `CardHeader`, `CardContent`) | 1 | 1 (ngày nghỉ tuần) | 0 |
| nhóm gập chứa bảng (`CollapsibleContent` chứa `Bang…`, `DataTable`, `SimpleTable`, `Table`) | 3 | 0 | 3: «Còn lại (n)» Họp tuần, «Đã bỏ (n)» mục tiêu, «Đã đóng (n)» dự án |

Phần lớn `ToggleGroup` của app là ô nhập trong form (nằm trong `Field`), không phải lọc. Bài coi một `ToggleGroup` là
**ô nhập** khi nó nằm trong `Field`, `FieldSet`, `FieldGroup` hoặc mang `aria-labelledby`; ô nhập không bị soát.

## Cách làm

Một bài `apps/app/test/hang-cong-cu.spec.ts` và bảng `apps/app/test/fixtures/hang-cong-cu-ngoai-le.json`, trong vùng
của hàng. Không chạm `apps/app/test/lib/**` (vùng BK2) và không sửa lối quét của BK3.

1. **Tập tệp là cây thật**: `git ls-files` (cả tệp chưa theo dõi) dưới `apps/app/app/` và `apps/app/components/`, đuôi
   `.tsx`, trừ `apps/app/app/proto/`. Quét theo tệp chứ không theo trang: hàng công cụ thường nằm trong thành phần
   khách, ngoài `page.tsx` và ngoài thư mục của trang.
2. **Ba dấu hiệu**, mỗi chỗ một dòng đỏ `hcc: <tệp>:<dòng> <dấu hiệu>`.
3. **Bảng ngoại lệ đếm theo tệp**: mỗi dòng `{ tep, dau_hieu, so, loai, ly_do }`, `loai` ∈ `no` · `o-nhap`. Số chỗ thật
   vượt `so` thì đỏ (chỗ mới ở tệp đã khai), thấp hơn `so` thì đỏ «thừa» (dọn nợ phải hạ số hay gỡ dòng). Đếm theo tệp
   thay vì theo dòng mã để sửa một dòng ở tệp khác không làm bảng lệch.
4. **Bảng ngày dựng**: 10 dòng — 7 `no` ghi đích sửa, 3 `o-nhap` (ô nhập chưa bọc `Field`). Nhóm «Đã bỏ» của mục
   tiêu giữ tới SV1 theo sổ `bo-okr-chi-don-vi` (d-20261028T050849Z-5).

## Không làm

- Sửa bảy chỗ nợ: răng chặn nợ mới, nợ cũ vào bảng (luật 40 của đợt).
- Bọc ba ô nhập vào `Field`.
- Lọc đặt bằng nút tự ghép ngoài `ToggleGroup`, ô chọn đơn vị trên hàng công cụ, lưới thẻ dưới bảng: không có dấu hiệu
  cú pháp đủ chắc để máy đọc mà không báo nhầm; để khuôn «trang danh sách» của bản đồ khuôn.
- Thứ tự tầng của một màn (đầu trang · dòng vị trí · thẻ con · hàng công cụ · nội dung · chân).

## Đặc tả UX

Bỏ: vòng chỉ thêm bài kiểm của kho, không đổi màn nào.
