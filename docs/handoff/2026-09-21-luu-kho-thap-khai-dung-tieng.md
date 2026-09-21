# Lưu kho tháp đo «khai đúng tiếng» — PR #65

Ngày 2026-09-22. Chủ kho chọn lối «cắt đuôi giữ lõi» cho PR #65 ngày 2026-09-21.
Nhánh này không gộp. Nó ở lại làm sử liệu, và PR #65 đóng mà không gộp.

## Vật đã đi đường khác

Bản sửa khai `lang` cho giá trị tiếng Anh trên tấm hồ sơ đã lên `onehub` qua
PR #72 (merge `1d6e8001`), hồ sơ `_acceptance/khai-lang-gioi-thieu/` đã ký Cổng
Bằng chứng. Mã rút từ các commit `9409080d`, `bab60026`, `1f9feb69`, `a4eaf7a8`
của nhánh này. PR #72 thêm `CompanyAbout` để đo đúng chỗ đoạn giới thiệu công ty.

PR #72 KHÔNG mang: thư mục `rang/` của hai hồ sơ dưới đây, răng `mot-duong` trong
lệnh cổng (`.githooks/gate-shape.json`, `packages/ui/test/rang-chat.spec.ts`), bản
sửa thước `khai-tieng.mjs` của `nhan-ung-dung-noi-tieng-viet`, và các mục bàn đo
trong `.claude/launch.json`.

## Ba hồ sơ trên nhánh này

| Hồ sơ | Trạng thái trên nhánh | Số phận |
|---|---|---|
| `thuoc-khai-dung-tieng` | đã ký Cổng Bằng chứng, bằng chứng hoá cũ sau rebase | ở lại làm sử liệu; không ghim lại |
| `ho-so-khai-dung-tieng` | REJECT | lưu kho; lời hứa về chỗ đỏ prod đã đi PR #72 |
| `nhan-ung-dung-noi-tieng-viet` | mở lại bằng dòng `supersedes` `d-20260921T151920Z-22` | dòng mở lại chỉ sống trên nhánh này; trên `onehub` hồ sơ vẫn «đã chấm bởi thực tế» từ 18/09 |

## Bài học: hằng E8 «224 tệp» là ghim cơ chế

Eval E8 của `thuoc-khai-dung-tieng` ghim tay «224 tệp nguồn dưới `packages/`».
Hằng đó đúng lúc ký, và nó sai ngay khi `onehub` thêm tệp vào `packages/` (231
sau lần rebase lên `b108a2fb`). Lỗi không nằm ở vật: một phép đo ghim con số của
CƠ CHẾ quét thay vì KẾT LUẬN của nó thì mọi thay đổi không liên quan ở nhánh chính
đều làm nó đỏ, và sửa hằng lại là sửa thước của một hồ sơ đã ký. Cùng lớp với lỗi
C của AC-11 ở `ho-so-khai-dung-tieng` (ghim byte của tệp thước thay vì kết luận).
Khi viết thước lần sau, ghim điều phép đo chứng minh, không ghim số đếm của lượt
quét.

## Việc còn lại

- Sau khi prod dựng lại từ `onehub` có `1d6e8001`: chủ kho quan sát đoạn giới
  thiệu công ty rồi `/acceptance-gate:observed khai-lang-gioi-thieu <sha bản dựng> …`.
- Đóng PR #65 không gộp — quyết định của chủ kho.
