# Rà soát ReUI lần hai — Timeline, Navbar và kho ví dụ

2026-09-29, theo lời chủ kho: «nhiều component ReUI Pro không dùng đến hoặc sắp đặt
chưa ổn» — Timeline (`/blocks/application/timeline`), Navbar
(`/blocks/application/navbar`), kho 1149 mục (`/components`). Tra bằng MCP của ReUI
(gói Pro của kho, bản Radix), xem ảnh từng ứng viên, đối chiếu `docs/reui.md` và
`docs/design.md`. Không cài gì.

## Kho 1149 mục là gì

22 thành phần miễn phí + ví dụ `c-*` của 81 nhóm (nút 61, nhóm nút 57, ô nhập 40…).
Phần lớn là biến thể của thứ `packages/ui` đã có. Thứ đáng giá với việc này là 4
thành phần chưa cài và 2 thành phần đã cài mà bản mẫu bỏ qua:

| Thứ | Có ở kho? | Dùng cho |
|---|---|---|
| `timeline` (miễn phí, `docs/reui.md` đã ghi «Dùng») | chưa cài | dải pha; hành trình của một ý |
| `scrollspy` (miễn phí) | chưa cài | mục lục chủ đề ở màn kết luận |
| `StatCard` | **có — bản mẫu không dùng** | thẻ con số (nhãn · số · chênh lệch · ghi chú) |
| `questionnaire` | có | cân nhắc cho ô góp — bác, xem dưới |

## Timeline — 9 block Pro, 12 ví dụ miễn phí

| Mục | Hình | Hợp với | Kết luận |
|---|---|---|---|
| `c-timeline-12` | mốc ngang, ngày trên, nhãn «Current» ở mốc hiện tại | **dải pha** Mở · Hạn · Gom · Công bố, mỗi mốc có ngày giờ | **dùng** — thay `StepList` dọc (110px ở 375) và bỏ được biến thể `StepList` đã xếp vào phạm vi |
| `c-timeline-3` | dọc, dấu tích, ngày, tiêu đề, mô tả (trạng thái đơn hàng) | **hành trình của một ý** trong «Ý của bạn đi đâu»: bạn góp → vào chủ đề → kết luận + lý do → mục tiêu nháp | **dùng** — đây là chữ ký của tính năng: người góp thấy ý mình đi qua từng bước, không chỉ đọc một nhãn |
| `c-timeline-9` | ngang, ngày trên, mô tả dưới | dải pha bản đầy đủ | dự phòng cho `c-timeline-12` khi cần câu mô tả mỗi pha |
| `timeline-1` | dọc, mỗi mốc là thẻ gập được | — | bác: dùng `frame` (kho chỉ dùng `card`) |
| `timeline-2`, `-4`, `-6`, `-7`, `-8` | kèm sao đánh giá, tệp đính, thanh tiến độ | — | bác: sao và badge nhiều màu phạm `docs/design.md`; ý không có tệp |
| `timeline-3`, `-9` (block) | dòng hoạt động có ảnh người | nhật ký lần hỏi ý cho quản trị | để sau: khu OKR đã có tab «Vết» với nếp riêng |
| `timeline-5` | nhật ký phiên bản có cột ngày | — | bác: badge nhiều màu |

## Navbar — 13 block Pro

| Mục | Hình | Hợp với | Kết luận |
|---|---|---|---|
| `navbar-1` | breadcrumb + tab gạch dưới có badge đếm + hành động phải | **thanh tab khu OKR** | **dùng bố cục**: tab «Hỏi ý» mang badge khi có việc cho người xem (thành viên chưa góp khi đang mở: «Mới»; người chọn khi đang gom: số chủ đề chưa kết luận); chọn chu kỳ ở bên phải cùng hàng; không thêm breadcrumb — thanh bên đã nói «OKR» |
| `navbar-2` | breadcrumb + nhóm ảnh người + lọc, sắp | — | bác: khu OKR không có lọc ở tầng này |
| `navbar-13` | thanh gọn: đóng · tiêu đề · nút gửi | «Mở hỏi ý» thành màn tập trung | bác: sheet đủ; thêm một kiểu màn là thêm một nếp |
| `navbar-3/4/6/8/9/10/11/12` | switcher tổ chức, Cmd+K, mega-menu, marketplace | — | ngoài việc: là thanh đầu ứng dụng hay trang tiếp thị |
| `navbar-5/7` | thanh biên tập (Publish, lịch sử) | — | không áp dụng |

## Kho ví dụ — thêm hai chỗ

| Mục | Hợp với | Kết luận |
|---|---|---|
| `c-scrollspy-1` | màn kết luận của người chọn ở ≥ lg: mục lục trái liệt kê chủ đề với chấm trạng thái (đã / chưa kết luận), sáng mục đang đọc khi cuộn, bấm để nhảy | **dùng** — bố cục ba cột: mục lục · chủ đề · bản viết trước dính; điện thoại giữ thanh đáy liệt điều thiếu |
| `StatCard` của kho | thẻ con số: nhãn, số, chênh lệch có mũi tên («↓ so kế hoạch»), ghi chú | **dùng** — bậc 1 bị bỏ sót, bản mẫu đang tự ghép `Card` |
| `stats-2`, `stats-15` | thẻ số nền màu | bác: chỉ `primary`, `destructive` được tô nền |
| `c-questionnaire-3/4` | ô góp thành ba bước có thanh tiến độ | bác: ba ô ngắn, bước hoá thêm hai lần bấm; lỗi «dưới nếp gấp» đã vá bằng thứ tự khối |
| `c-button-37` | «Tôi cũng nghĩ vậy» kèm số | bác phần số: thành viên không thấy số — giữ `Toggle` |

## Đề xuất

| # | Người dùng thấy gì khác | Mục ReUI | Bậc | Chạm phạm vi |
|---|---|---|---|---|
| R1 | Dải pha ngang một dòng: Mở 07/12 · Hạn 17:00 08/12 · Gom · Công bố, mốc hiện tại gắn «Bây giờ» | `timeline` theo `c-timeline-12` | 3 | cài `timeline` vào `packages/ui`; bỏ biến thể `StepList` khỏi phạm vi |
| R2 | Mỗi ý của bạn có hành trình dọc: Bạn góp · Vào chủ đề · Kết luận kèm lý do · Mục tiêu nháp | `timeline` theo `c-timeline-3` | 3 | một vế ở AC-12 |
| R3 | Tab «Hỏi ý» có badge khi có việc cho bạn; chọn chu kỳ cùng hàng tab | bố cục `navbar-1` | 4 | thanh tab khu OKR thật; một vế ở AC-11 |
| R4 | Người chọn có mục lục chủ đề bên trái, sáng mục đang đọc, chấm đã/chưa kết luận | `scrollspy` theo `c-scrollspy-1` | 3 | cài `scrollspy`; một vế ở AC-12 |
| R5 | Thẻ con số có chênh lệch mũi tên và ghi chú, cùng kiểu với Tổng quan | `StatCard` (kho) | 1 | không |

Giá: hai thành phần ReUI mới trong `packages/ui` (mỗi cái bốn chỗ sửa sau cài theo
`docs/reui.md`); đổi lại bỏ một biến thể tự dựng (`StepList` ngang).
