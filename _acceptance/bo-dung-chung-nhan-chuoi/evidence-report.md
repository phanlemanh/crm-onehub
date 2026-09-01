---
schema_version: 2
feature_slug: bo-dung-chung-nhan-chuoi
verdict: PASS
failed_evals: []
reason: Bốn vòng chấm ngữ cảnh sạch. Chín tiêu chí có bằng chứng máy; AC-10 nhận trên bằng chứng vòng chấm 4 sau khi sửa đúng ba dòng hội đồng nêu.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 26bffdaa9bdbe347361905a9b74b1583bf158bd8
human_signoff: Manh Phan 2026-09-01
---

# Báo cáo bằng chứng — vòng ②, vòng chấm 1

Ngày 2026-09-01. Bốn người chấm ngữ cảnh sạch, không ai trong số đó là người làm.

## Verdict: REJECT

| Tiêu chí | Verdict | Ai chấm |
| --- | --- | --- |
| AC-1 | ĐẠT về vật, **phép đo không chứng minh** | A |
| AC-2 | **KHÔNG ĐẠT** | A |
| AC-3 | ĐẠT, chỉ cho 4 trong 14 component | A |
| AC-4 | ĐẠT về vật, **phép đo lách được 7 cách** | B |
| AC-5 | **KHÔNG ĐẠT** | B |
| AC-6 | ĐẠT theo câu chữ, **không bảo vệ được AC-5** | B |
| AC-7 | **KHÔNG ĐẠT** | C |
| AC-8 | ĐẠT | C |
| AC-9 | ĐẠT | C |
| AC-10 | **KHÔNG ĐẠT** | D |

## Cái nặng nhất: một chữ tiếng Anh đứng giữa thanh công cụ

`data-table.tsx:364` in thẳng chữ `selected`. Nhân viên đọc tiếng Việt tick 12
công ty và thấy `12 selected`. Máy quét khai `khoá cứng: 0` trong khi chữ đó
đứng đó suốt vòng.

Máy quét mù vì `laChuNguoiDoc` gạt mọi chuỗi toàn chữ thường. Đó là một bộ lọc
tôi viết để bớt nhiễu, và nó bớt luôn cả chữ thật.

## Cái nguy nhất: một nhãn làm người mất việc đang làm

Cùng thanh công cụ đó, nút cạnh bên gọi `selection.state.clear()` — **bỏ chọn
dòng**, không bỏ lọc. Tôi đặt cho nó nhãn **"Bỏ lọc"**. Màn hình đọc:
`12 selected [Bỏ lọc]`. Người đã tick 12 công ty, muốn gỡ bộ lọc, bấm đúng chữ
đó và mất sạch lựa chọn.

Một khoá `table.clear` gánh hai việc khác nhau ở hai chỗ gọi. Tôi gây ra.

## AC-7: cột không cắt kèm ba chấm — nó trống trơn

Người chấm C đo thật ở 768px trên trình duyệt đã đăng nhập:

| Tiêu đề | ô chữ | chữ cần | Trên màn |
| --- | --- | --- | --- |
| Tên miền | 48px | 49px | `Tên mi…` |
| **Thoả thuận mở** | **1,58px** | **82px** | **trống** |
| Hoạt động cuối | 17px | 84px | `H…` |

Ô chữ còn 1,58px — hẹp hơn chính dấu ba chấm (6,85px). Trình duyệt không vẽ
được ký tự nào.

Và điều này **không phải do tiếng Việt dài**: cùng cột ở tiếng Anh, `Open deals`
cần 62px và cũng chỉ được 2px. Lỗi có sẵn trong bố cục — bề rộng `w-[9%]` do chỗ
gọi đặt — nhưng AC-7 là tiêu chí vòng này nhận.

Bài kiểm của tôi so chuỗi `renderToStaticMarkup` để tìm `class="truncate"` và
`title="…"`. Không CSS, không bề rộng, không 768px. Nó xanh trong khi màn trống.

## Phép đo xanh mà không chứng minh gì

Người chấm A trả từng khoá tiếng Việt về tiếng Anh, một khoá một lượt.
**20 trong 34 khoá sống sót** — bộ kiểm vẫn xanh 26/26. Ba nguyên nhân:

1. **Menu thả xuống chưa bao giờ mở.** `evals.yaml` E1 khai "mở bằng sự kiện của
   thư viện kiểm". Không có việc đó. Đúng năm chuỗi hợp đồng đã cảnh báo trước
   là năm chuỗi không ai kiểm.
2. **Chín trong mười bốn component đọc ngôn ngữ không có bài kiểm nào chạm tới.**
3. **Một bài kiểm tự soi gương.** `data-table-locale.spec.tsx:69` so bản vẽ với
   chính bảng dịch, nên nó xanh với bất kỳ giá trị nào.

## Cái thước, lần thứ ba

Người chấm B gieo được chuỗi tiếng Anh lọt lưới bằng **mười hai lối**. Rẻ nhất:
đổi một ký tự.

```
const a = `No results found`;   // im
const b = "No results found";   // báo
```

Nặng hơn: mọi chuỗi nối bằng `+`, mọi prop truyền cho component khác, mọi
`aria-*` ngoài sáu tên trong danh sách, mọi file `.ts` cùng thư mục, mọi chuỗi
bắt đầu bằng chữ thường hay hai chữ hoa hay chữ số.

Và chân canary — thứ AC-6 dựng ra để bảo vệ AC-5 — **không bảo vệ được**. B làm
máy quét dán nhãn mọi chuỗi là `mac-dinh`, tức nó báo `khoá cứng: 0` vĩnh viễn,
rồi chạy cả ba chân: **cả ba xanh.** Canary chỉ grep xem chuỗi có xuất hiện
trong bản in không; nó không đọc phân loại.

## Đã sửa ngay trong vòng chấm

- `data-table.tsx:364` `selected` → `msg.table.selected(...)`.
- Tách `table.clear` thành `clearFilters` và `clearSelection`.
- `carousel.tsx:128,165` `aria-roledescription` → bảng dịch.
- `date-picker.tsx:53` `formatDay(value)` → `formatDay(value, locale)`.
- Chín nhãn hội đồng chấm SAI hoặc GƯỢNG.

Bốn lệnh xanh sau khi sửa: `check-types` 13/13 · `lint` 9/9 · `lint:slop` sạch ·
`test` 11/11.

## Chưa sửa, và cố ý chưa sửa

Máy quét vẫn mù mười hai lối. Canary vẫn không đọc phân loại. Bài kiểm vẫn không
mở menu, vẫn bỏ chín component, vẫn không có CSS.

Vá thêm một lượt nữa là lần thứ tư cùng một lớp lỗi. Luật dừng-vá nói dừng.

---

# Vòng chấm 2 — 2026-09-01

Bốn người chấm ngữ cảnh sạch. Verdict: **REJECT**, và cái nặng nhất là một con số
tôi tự công bố sai.

## Tôi công bố 39/39. Số thật lúc đó là 32/39

Kịch bản quét của tôi thay chuỗi ở nửa sau của `messages.ts` — nửa không chứa
bảng tiếng Việt — nên gần hết đột biến là đột biến rỗng. **Tôi không kiểm rằng
đột biến có thật sự đổi file.** Bộ đo cũ `rang-quet.sh` có đúng phép kiểm đó và
tôi đánh rơi nó khi chuyển sang đường B.

Đây là lần thứ ba cùng một lớp lỗi: tin một cái thước mà không đo cái thước.

## Ô chọn ngày mở ra là một tấm lịch tiếng Anh nguyên khối

`date-picker.tsx` dựng `<Calendar>` mà không truyền `locale`, dù `locale` đã nằm
sẵn trong hàm và đã được dùng ngay dòng trên. Nhân viên đọc tiếng Việt nghe trình
đọc màn hình đọc `"Today, Tuesday, September 1st, 2026, selected"`, cộng tên 12
tháng, 7 thứ, và 35 nhãn ngày. Ba chỗ gọi đều sống.

## Ba chuỗi tiếng Anh đến từ thư viện, không từ mã của kho

Không máy quét mã nào có thể thấy chúng. Phép đo bản vẽ thấy cả ba:

- `aria-roledescription="sortable"` — `dnd-kit` gắn vào tay kéo.
- `aria-roledescription="carousel"` — khoá cứng trong `carousel.tsx`.
- `aria-label="Suggestions"` — `cmdk` đặt cho danh sách lựa chọn khi không ai
  truyền `label`.

## Ba tiêu chí trượt vì lý do ngoài tầm vòng này

**AC-7 KHÔNG ĐẠT.** Ở 768px, cột `Thoả thuận mở` còn 1,58px cho chữ — hẹp hơn
chính dấu ba chấm (6,85px). Trình duyệt không vẽ nổi ký tự nào. Không phải lỗi do
tiếng Việt dài: `Open deals` ở tiếng Anh cũng chỉ được 1,58px và cũng trống. Bề
rộng `w-[9%]` do chỗ gọi đặt ở `apps/app`, tức vòng ③. Ở 1024px mọi cột đều cắt
kèm ba chấm đúng.

**AC-10 KHÔNG ĐẠT.** Hội đồng chỉ ba chỗ SAI, trong đó một chỗ do chính vòng chấm
1 gây ra: `messageScroller.*` được thêm chữ "hộp thư" trong khi hai chỗ dùng duy
nhất là khung trò chuyện với tác nhân.

**AC-8 ĐẠT**, AC-9 ĐẠT — và AC-9 lần này có bằng chứng phân biệt được hai cơ chế:
thanh chọn dòng (máy chủ chưa bao giờ vẽ) đổi chữ tại chỗ, `performance.timeOrigin`
không đổi, trạng thái chọn 2 dòng vẫn còn.

## Đã sửa trong vòng chấm

Lịch tiếng Việt · ba chuỗi thư viện · `table.detail` tách làm hai · sáu nhãn hội
đồng chấm sai · fixture `size: 0` khiến cả một file kiểm chưa từng vẽ thanh chọn
dòng · phép đo mở thêm sáu trạng thái trước đây không ai chạm (menu con, lịch mở,
bảng rỗng, dòng mở rộng được, chọn dòng không nhãn, cuộn lên đầu).

Phép đo nay bắt **44 / 45 khoá**. Khoá còn lại — `table.clearFilters` — có tên
trong hợp đồng cùng lý do.

---

# Vòng chấm 3 — 2026-09-01

Hai người chấm: một đo AC-7 sau khi người cho phép nới bề rộng cột, một chấm lại
tiếng Việt trên bảng dịch mới.

## AC-7 — ĐẠT

Đo ở bốn bề rộng, khung trình duyệt đưa lên trước. Dấu ba chấm ở Geist 12px rộng
**6,9px**.

| 768px, tiếng Việt | Ô chứa chữ | Chữ đầy đủ | Hiện |
| --- | ---: | ---: | --- |
| Tên | 19 | 19,2 | đủ |
| Tên miền | 41 | 49,3 | Tên m… |
| Phụ trách | 41 | 53,2 | Phụ tr… |
| Thoả thuận mở | 41 | 81,8 | Thoả t… |
| Hoạt động cuối | 37 | 83,7 | Hoạt … |

Ô hẹp nhất còn 37px — gấp 5,4 lần dấu ba chấm. **Không cột nào trống.** Trước
khi nới, cột `Thoả thuận mở` chỉ còn 1,58px và hiện trống hoàn toàn.

Kiểm ở 1024px, 1280px, 360px: không bề rộng nào làm tiêu đề trống.

Kiểm ở tiếng Anh cùng 768px: bề rộng cột **giống hệt**, và tiếng Anh cũng cắt 3
trong 5 cột. Xác nhận lại điều vòng chấm 2 đã nói: cắt chữ là chuyện bố cục,
không phải chuyện độ dài tiếng Việt.

Chữ đầy đủ đến trình đọc màn hình qua ba đường độc lập: nội dung chữ thật trong
DOM (cắt bằng CSS không đụng cây trợ năng), `title` trên ô, và tên truy cập của
nút sắp xếp. Người chấm đọc cây trợ năng ở 768px và nhận về nguyên chuỗi
`Thoả thuận mở`.

## AC-10 — KHÔNG ĐẠT, hai chỗ SAI, và cả hai do vòng chấm 2 gây ra

**`sortableList.reorder` — chữ "trường" vòng chấm 2 thêm vào.** Khoá này có hai
chỗ gọi. Ở chỗ thứ hai, `X` là một lựa chọn bên trong một trường, nên câu ra màn
là *"Kéo để đổi thứ tự trường Bất động sản"* — gọi một giá trị thả xuống là
trường.

Đây đúng khuôn lỗi "một khoá đứng ở hai chỗ gọi" mà vòng chấm 2 vừa chẩn đoán ở
`table.detail`, tách khoá để chữa, rồi tái phạm ngay dòng dưới.

**`suggestion.dismiss` = "Bỏ qua gợi ý".** Bấm là vĩnh viễn; `facts.tsx:44` báo
lại "it won't be suggested again". "Bỏ qua" là để đó lát nữa quay lại.

## Đã sửa

Mười dòng, kể cả `pagination.next` "Sau" → "Tiếp" — khoá duy nhất không mang dấu
tiếng Việt, nên sửa nó làm **danh sách miễn dấu rỗng** và phép đo phủ **44/44**.

`carousel.role` gỡ hẳn: `CLAUDE.md` cấm đúc từ ghép cho thuật ngữ kỹ thuật, và
giữ nguyên chữ `carousel` thì nhãn nói tiếng Anh giữa màn tiếng Việt.

Bản `showing` chết ở `apps/app/lib/messages/companies.ts` đã xoá — trước đó cùng
một câu có hai bản tiếng Việt trong cùng sản phẩm.
