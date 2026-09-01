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
