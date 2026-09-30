## Tạo và sửa OKR cùng khung với deal

Tạo và sửa Mục tiêu, thêm và sửa KR nay mở trong ngăn trượt từ bên phải, cùng khung với ngăn tạo
deal: cùng bề ngang, cùng đầu, cùng chân. Trạng thái mở ghi trên URL — tạo Mục tiêu dùng `new`
như tạo deal, các ngăn trong khung Mục tiêu dùng `hopOkr`. Cột góp ý của Trợ lý OKR mở thành ngăn
rộng thay cho hộp thoại hai cột; thẻ góp ý giữ nguyên.

Chân ngăn chung trong `packages/ui` nay xếp như chân hộp thoại: «Huỷ» trái, nút chính phải từ
640 px, nút chính trên «Huỷ» dưới 640 px. Bảy ngăn tạo khác (deal, cá nhân, công ty, chiến dịch,
khoá API, SSO, khung tạo ở màn chào) đổi thứ tự nút theo; ba ngăn ở Cài đặt › Chương trình OKR
vốn đã đặt «Huỷ» trước nên nay mới hiện đúng.

Phần đầu cột góp ý nay bám mép cột, cùng kiểu chữ với tiêu đề ngăn và thẳng tâm với nút đầu của form (thêm ở Cổng Bằng chứng theo yêu cầu của chủ kho).

Không đổi dữ liệu, thủ tục API, tác tử, bộ kiểm góp ý, vết hay hoàn tác.

### Vẽ tay là bậc cuối — đã tra gì

| Khối | Dừng ở bậc | Đã tra |
|---|---|---|
| Chân ngăn một hàng | 1 — sửa `SheetFooter` có sẵn | `DialogFooter` đã có bố cục đích; `docs/settings.md` ghi sửa ở đây |
| Ngăn rộng có cột (`size="assist"`) | 5 — mở rộng `Sheet` trong `packages/ui` | (1) `Sheet` năm cỡ, không cỡ nào có cột · (2) shadcn `sheet`, `drawer` · (3) ReUI «sheet drawer create form footer cancel submit»: `c-sheet-1`, `c-sheet-2`, `c-sheet-4` — một cột · (4) Pro «side sheet form with assistant panel column, edit form drawer with side rail»: `sheet-8`, `sheet-4`, `sheet-10`, `ai-chat-2` — chép cách đặt cột trợ lý, không block nào có form cộng cột |
| Thân ngăn chung (`SheetBody`) | 5 — tạo trong `packages/ui` | như trên; `sheet-8` cho cách xếp thân cuộn và chân dính |
| Tiêu đề cột phụ của ngăn (`SheetRailHeader`, `SheetRailTitle`) — đầu cột góp ý | 5 — tạo trong `packages/ui` | (1) `Item size="xs"` đang dùng có đệm trong riêng nên chữ thụt 11 px — chính là lỗi; `CardHeader`/`CardTitle` là tiêu đề của thẻ có viền, không phải của một cột trong ngăn; `SheetTitle` là tiêu đề Radix, một ngăn chỉ có một · (2) shadcn `sheet`: chỉ có `SheetHeader`/`SheetTitle` · (3) ReUI «sheet side panel section header title with close button aligned to content edge» (mặt `card`): `c-sheet-4` — không có đầu cột phụ · (4) Pro: `sheet-8`, `sheet-4`, `sheet-10` — đầu ngăn có nút, không có đầu cột phụ cạnh form; chép cách đặt tiêu đề và nút đóng trên một hàng cao bằng nút |

### Hồ sơ ghim lại

`the-gop-y-okr` và `hop-thoai-giu-cho-dang-nhap` ghim lại trong PR này: thước hoặc bài kiểm của
chúng chỉ đổi chỗ bám vỏ hộp sang ngăn, cộng phần mã đã gộp từ onehub sau lần ký của chúng. `tro-ly-okr-de-xuat` đổi bài kiểm cùng cách nhưng lưới
trước khi gộp vẫn báo khớp, nên không ghim. Phép đo nhìn bằng trình duyệt của ba hồ sơ chạy lại
trong lượt chấm của hồ sơ `khung-tao-okr-nhu-deal`.

### Cổng Bằng chứng

Ký 2026-09-30 (Manh Phan) sau năm vòng chấm; vòng 4 vượt trần ba vòng theo yêu cầu của chủ kho
(thêm phần đầu cột góp ý). Tám mục ngoài hợp đồng ghi vào hạn chế đã biết, xem `contract.md`.
Hai việc tách riêng: lỗi hydrat có sẵn trên màn Deals, và bộ đọc thẻ cổng của bộ kit bỏ sót mục
mang từ vòng trước.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
