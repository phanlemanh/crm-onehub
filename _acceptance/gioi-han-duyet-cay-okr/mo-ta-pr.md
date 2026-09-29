# Lượt 8c OKR — mức hiển thị giới hạn, bước duyệt nhẹ, tái cơ cấu không mồ côi

Hồ sơ `_acceptance/gioi-han-duyet-cay-okr` · MT-06, QT-02, TC-06 · T3.

## Người dùng được gì

- Người sửa được một mục tiêu đặt nó ở mức **giới hạn**: chỉ người dính vào mục tiêu,
  trưởng sửa được nó, quản trị và người xem có tên thấy. Người khác không thấy nó ở bất
  kỳ màn, thủ tục, cầu REST, khoá API, tin nhắc hay trợ lý nào; giới hạn không vào số gộp
  và không căn chỉnh được.
- Chương trình OKR có ô **«Công bố cần duyệt»** (mặc định tắt). Bật thì trưởng đơn vị gửi
  duyệt, trưởng cấp trên duyệt và công bố hay trả lại kèm lý do.
- Cây tổ chức **không lưu trữ hay xoá được đơn vị còn OKR**; quản trị **chuyển OKR** sang
  đơn vị khác khi gộp, tách; Sức khoẻ chương trình có khối **OKR mồ côi**.

## Khối giao diện mới — bậc dừng (docs/design.md)

| Khối | Bậc | Đã tra |
|---|---|---|
| Hộp mức hiển thị | 1 | `radio-group`, `token-field`, `field` có sẵn |
| Dải chờ duyệt, bị trả lại | 1 | `alert`, `badge` |
| Hộp trả lại, hộp chuyển OKR | 1 | `dialog`, `combobox`, `checkbox`, `item`; ReUI «transfer list» — không cần |
| Khối OKR mồ côi | 1 | `item`, `badge`, `empty`, `skeleton` |

## Dữ liệu

`migration` chỉ thêm: `okrObjective.hienThi` (mặc định `cong-khai`), `okrProgramConfig.duyetCongBo`
(mặc định `false`), bảng `OkrNguoiXem` cuối `schema.prisma`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
