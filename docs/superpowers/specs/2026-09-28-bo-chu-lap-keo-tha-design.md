# Bỏ chữ lặp trong vùng kéo-thả — design

Ngày: 2026-09-28 · Slug: `bo-chu-lap-keo-tha` · Hạng: T2 · Nguồn: Known limits «Ngoài-1»
của hồ sơ đã ký `nguon-keo-tha-reui` (sổ `d-20260928T120837Z-6`).

## Vấn đề

PR #195 dựng lại vùng kéo-thả `NguonKeoTha` trong hộp «Tải nguồn lên» theo bố cục ReUI
`c-file-upload-3`: nút outline «Chọn tệp» đứng ngay trước câu gợi ý. Câu gợi ý vẫn là bản
cũ, viết cho thời chưa có nút — «Kéo tệp vào đây, hoặc chọn tệp» / «Drag a file here, or
choose a file». Vế sau lặp lại việc cái nút bên cạnh đã nói.

Luật «Ngôn ngữ sản phẩm» của `CLAUDE.md`: xoá một chữ mà người đứng ở màn đó vẫn hiểu đúng
thì chữ đó thừa.

## Câu mới

| Khoá `nguon.hop.keoTha` | Trước | Sau |
|---|---|---|
| `vi` | Kéo tệp vào đây, hoặc chọn tệp | **Kéo tệp vào đây** |
| `en` | Drag a file here, or choose a file | **Drag a file here** |

Thử xoá từng chữ còn lại theo đúng luật:

- «hoặc chọn tệp» / «or choose a file» — xoá được: nút «Chọn tệp» / «Choose file» đứng ngay
  cạnh đã nói việc đó. Đây là phần chữ thừa của vòng này.
- «tệp» / «a file» — giữ. Trang tài liệu còn những thứ khác kéo được (hàng bảng, thẻ), nên
  «Kéo vào đây» không nói là kéo cái gì, từ đâu tới. Câu gợi ý là chỗ duy nhất nói vùng này
  nhận tệp kéo từ máy người dùng. Tiếng Anh giữ «a» vì hộp chỉ nhận **một** tệp.
- «vào đây» / «here» — giữ: bỏ đi thì câu mất chỗ thả.

Hệ quả phụ, không phải lý do chọn: hai phép đo của hồ sơ đã ký đọc màn thật và khớp chuỗi
con «Kéo tệp vào đây» (`apps/app/test/tai-lieu-nguon.dom.tsx:445`,
`_acceptance/may-soan-de-xuat/rang/man-tai-nguon.mjs:425`). Câu mới giữ nguyên chuỗi con đó,
nên hai thước chạy nguyên văn và vẫn xanh. Câu «Kéo vào đây» sẽ làm cả hai đỏ.

## Chỗ sửa

Một tệp sản phẩm: `apps/app/lib/messages/tai-lieu.ts`, hai dòng (`vi`, `en`). Không đổi
`NguonKeoTha`, `hop-tai-nguon.tsx`, `keoThaNut`, `keoThaMoTa`. `nhan` chỉ là một `span`
hiển thị; tên truy cập của nút và ô tệp lấy từ `nutChon`, nên đổi câu không đổi gì với
trình đọc màn hình.

Phép đo mới: một tệp test riêng `apps/app/test/keo-tha-khong-lap-chu.dom.tsx` (không sửa
`nguon-keo-tha-chu.dom.tsx` của hồ sơ đã ký), cộng một thước `rang/` kiểm vòng không chạm
tệp đo nào của hai hồ sơ đã ký.

## Các thước đọc chuỗi cũ

| Tệp | Đọc gì | Hệ quả |
|---|---|---|
| `packages/ui/test/nguon-keo-tha.dom.tsx`, `nguon-canh-nhau.dom.tsx` | chuỗi cố định tự dựng | không đổi, không chạm |
| `apps/app/test/tai-lieu-nguon.dom.tsx:445` | màn thật, chuỗi con «Kéo tệp vào đây» | xanh nguyên văn |
| `_acceptance/may-soan-de-xuat/rang/man-tai-nguon.mjs:425` | màn thật, chuỗi con «Kéo tệp vào đây» | xanh nguyên văn |
| `apps/app/test/nguon-keo-tha-chu.dom.tsx` | `keoThaNut` từ tệp chữ | không đọc `keoTha` |
| `apps/app/test/messages-guard.spec.ts` | mọi khoá: vi có dấu, khác en | câu mới qua |

CI chỉ kiểm lại hồ sơ có tệp `_acceptance/<slug>/` nằm trong diff PR. Vòng này không chạm
thư mục của hồ sơ nào khác, nên không hồ sơ đã ký nào phải ghim lại.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Tài liệu → «Tải nguồn lên» → hộp mở, vùng kéo-thả đọc «Chọn tệp» · «Kéo tệp vào đây» · «Word (.docx) hoặc PDF, tới 20 MB» → người bấm nút hoặc thả tệp (điểm ra: dòng «Tệp đã chọn»). Luồng không đổi; chỉ câu gợi ý ngắn lại.
- Biên: khổ 390 — vùng `flex-wrap`, câu ngắn hơn nên không xuống dòng nhiều hơn bản cũ.
- Lỗi & quay lại: không đổi (câu lỗi dưới ô tệp như trước).

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hộp «Tải nguồn lên» | nhận một tệp nguồn và chọn trang đích | nút «Tải nguồn lên» ở Tài liệu / tab Nguồn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hop-tai-thuong | Hộp «Tải nguồn lên» | nút «Chọn tệp» + «Kéo tệp vào đây» + «Word (.docx) hoặc PDF, tới 20 MB» | bấm nút hoặc thả tệp |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Không đổi hành vi nào; chỉ chữ. Chữ người nhập (tên tệp) không bị chạm.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `NguonKeoTha` (`@crm/ui`) | dùng | đã dựng ở #195; vòng này chỉ đổi prop `nhan` qua tệp chữ |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: hộp hiện có là một cột; vòng chỉ đổi chữ, không có khuôn thứ hai khả dĩ nên không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->
