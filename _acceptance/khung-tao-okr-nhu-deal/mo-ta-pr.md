## Tạo và sửa OKR cùng khung với deal

Tạo và sửa Mục tiêu, thêm và sửa KR nay mở trong ngăn trượt từ bên phải, cùng khung với ngăn tạo
deal: cùng bề ngang, cùng đầu, cùng chân. Trạng thái mở ghi trên URL — tạo Mục tiêu dùng `new`
như tạo deal, các ngăn trong khung Mục tiêu dùng `hopOkr`. Cột góp ý của Trợ lý OKR mở thành ngăn
rộng thay cho hộp thoại hai cột; thẻ góp ý giữ nguyên.

Chân ngăn chung trong `packages/ui` nay xếp như chân hộp thoại: «Huỷ» trái, nút chính phải từ
640 px, nút chính trên «Huỷ» dưới 640 px. Bảy ngăn tạo khác (deal, cá nhân, công ty, chiến dịch,
khoá API, SSO, khung tạo ở màn chào) đổi thứ tự nút theo; ba ngăn ở Cài đặt › Chương trình OKR
vốn đã đặt «Huỷ» trước nên nay mới hiện đúng.

Không đổi dữ liệu, thủ tục API, tác tử, bộ kiểm góp ý, vết hay hoàn tác.

### Vẽ tay là bậc cuối — đã tra gì

| Khối | Dừng ở bậc | Đã tra |
|---|---|---|
| Chân ngăn một hàng | 1 — sửa `SheetFooter` có sẵn | `DialogFooter` đã có bố cục đích; `docs/settings.md` ghi sửa ở đây |
| Ngăn rộng có cột (`size="assist"`) | 5 — mở rộng `Sheet` trong `packages/ui` | (1) `Sheet` năm cỡ, không cỡ nào có cột · (2) shadcn `sheet`, `drawer` · (3) ReUI «sheet drawer create form footer cancel submit»: `c-sheet-1`, `c-sheet-2`, `c-sheet-4` — một cột · (4) Pro «side sheet form with assistant panel column, edit form drawer with side rail»: `sheet-8`, `sheet-4`, `sheet-10`, `ai-chat-2` — chép cách đặt cột trợ lý, không block nào có form cộng cột |
| Thân ngăn chung (`SheetBody`) | 5 — tạo trong `packages/ui` | như trên; `sheet-8` cho cách xếp thân cuộn và chân dính |

### Hồ sơ ghim lại

`the-gop-y-okr`, `tro-ly-okr-de-xuat`, `hop-thoai-giu-cho-dang-nhap` — thước hoặc bài kiểm của
chúng chỉ đổi chỗ bám vỏ hộp sang ngăn. Phép đo nhìn bằng trình duyệt của ba hồ sơ chạy lại trong
lượt chấm của hồ sơ `khung-tao-okr-nhu-deal`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
