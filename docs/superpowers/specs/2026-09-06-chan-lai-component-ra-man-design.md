# Chân lái từng component ra màn

> Hồ sơ nghiệm thu: `_acceptance/chan-lai-component-ra-man/`
> Sinh từ định đoạt **Ngoài-2 (P1)** người chốt ở Cổng 2 ngày 06/09 của hồ sơ
> `chu-mac-dinh-thu-vien-ngoai`.

## Vì sao có vòng này

Vòng trước đo được **29 component bọc thư viện ngoài mà không đọc kho chuỗi**, rồi
khai một **bảng 10 dòng** cho nhóm *chỉ hiện sau khi bấm* — hộp thoại, menu, ngăn
kéo, chú giải. Bảng ấy đếm được và có chiều đỏ, nhưng nó **khai** chứ không **đo**:
phép đo trên màn không bao giờ với tới thứ chưa vẽ ra.

Người chốt: mở hợp đồng mới, vì *khai không thay được đo*.

## Điều phép đo thử đã nói, trước khi thiết kế

Chạy thử trên chín trong mười dòng của bảng (mount ở trạng thái MỞ, đọc chữ vẽ ra):

| Nguyên bản | Chữ tiếng Anh nó tự sinh |
| --- | --- |
| accordion · alert-dialog · drawer · dropdown-menu | không có |
| hover-card · popover · select · tabs · tooltip | không có |

Tất cả những gì hiện ra là nhãn của chính chúng ta, mã máy (`radix-_r_1_`), hoặc
giá trị liệt kê của thuộc tính trợ năng (`vertical`, `dialog`, `none`). **Radix
không mang chữ.**

Nhưng cùng lượt đo ấy chạm phải một lớp khác, và lớp này thật:

```
combobox.tsx:35   placeholder = "Select an option"
combobox.tsx:36   searchPlaceholder = "Search…"
combobox.tsx:37   empty = "Nothing matches."
date-picker.tsx:24 placeholder = "Select a date"
command.tsx:37    title = "Command Palette"
```

**Chữ tiếng Anh nằm ở giá trị mặc định của tham số.** Nó vẽ ra màn CHỈ KHI người gọi
bỏ trống prop — nên nó lọt qua cả năm vòng Việt hoá đã ký:

- Chân quét chữ trong JSX không thấy nó: nó không phải nội dung thẻ, cũng không phải
  thuộc tính JSX — nó là giá trị mặc định trong khai báo tham số.
- Chân *chữ không thuộc về ai* của vòng trước loại nó theo đúng định nghĩa: chuỗi ấy
  CÓ trong file nguồn của kho.
- Chân đo trên màn chỉ thấy nó ở đúng những màn tình cờ bỏ trống prop đó.

Đếm từ đĩa: **389 file `.ts`/`.tsx`** trong `packages/ui/src`, `apps/app/components`,
`apps/app/lib`, `apps/app/app` · **119 giá trị mặc định là chuỗi có chữ cái**.

## Bài toán trung tâm

Trong 119 giá trị ấy, phần lớn là **tên kỹ thuật** — `variant = "ghost"`,
`size = "sm"`, `orientation = "horizontal"`. Chúng không bao giờ đến mắt người; chúng
thành tên lớp CSS hoặc thuộc tính dữ liệu. Chỉ một phần là **chữ người đọc**.

Ranh giới ấy **không được gõ tay**. Vòng trước suýt khai `status` là tên thuộc tính
kỹ thuật, trong khi chính nó mang `"Live"` và `"Private"` — chữ người đọc thật. Và
hai lần neo sai của vòng trước đều đến từ phép đếm tay.

## Cách phân biệt: để bản vẽ tự trả lời

Không phán đoán theo TÊN prop. Phán theo **ĐÍCH ĐẾN**:

> Mount component ở trạng thái mặc định — không truyền prop nào ngoài prop bắt buộc —
> rồi đọc tập chữ-người-đọc của bản vẽ. Giá trị mặc định nào **có mặt** trong tập ấy
> là chữ người đọc. Không có mặt là giá trị kỹ thuật.

`variant = "ghost"` chui vào `class`, không nằm trong tập. `placeholder = "Select an
option"` nằm trong tập, ở đúng thuộc tính `placeholder`. Phép đo tự định nghĩa; danh
sách tên prop không bao giờ phải gõ.

Tập «chữ người đọc» **không phải danh sách mới**: dùng lại nguyên `DOC_NGHE_DUOC` đã
sống trong `packages/ui/test/render-diff.spec.tsx` — `title` · `aria-label` ·
`aria-description` · `aria-placeholder` · `aria-roledescription` · `aria-valuetext` ·
`aria-keyshortcuts` · `placeholder` · `alt` — cộng text node.

## Ba việc của vòng

1. **Chân lái** (`lai-ra-man.mjs` + sổ ca): mount từng component, đọc chữ vẽ ra, đối
   chiếu với 119 giá trị mặc định lấy từ AST. Kết quả là hai bảng đếm được: *mặc định
   chữ-người-đọc* và *mặc định kỹ thuật*.
2. **Giải toả bảng 10 dòng** của vòng trước bằng ĐO: mount cả mười ở trạng thái mở,
   chứng bằng số rằng chín dòng không sinh chữ nào — và dòng nào sinh thì nêu đích
   danh. Bảng khai của vòng trước đổi từ *chưa đo được* sang *đã đo*.
3. **Vá** những mặc định chữ-người-đọc mà chân tìm ra: đưa về kho chuỗi dùng chung,
   theo đúng khuôn `useMessages()` mà `sonner` vừa đi ở vòng trước.

## Chiều đỏ của từng chân

| Chân | Vật lành → xanh | Phá vật → đỏ, thông điệp ghim |
| --- | --- | --- |
| lái-ra-man | mọi mặc định chữ-người-đọc đều nằm trong bảng khai | thêm một mặc định tiếng Anh mới vào một component → đỏ nêu `file:dòng` |
| phân-biệt | `variant = "ghost"` xếp vào nhóm kỹ thuật | đổi nó thành một chuỗi thật sự vẽ ra màn → nó phải nhảy sang nhóm chữ-người-đọc |
| mo-nguyen-ban | mười dòng đều mount được và đếm được | bỏ một dòng khỏi bảng → đỏ vì số dòng khác số đếm |
| dan-so | 389 file · 119 mặc định | đổi một neo → đỏ |

## Sẽ KHÔNG làm

- **Không lái component ra TRÌNH DUYỆT thật.** Bản vẽ trong DOM giả (jsdom) là đủ cho
  câu hỏi «chuỗi này có đến mắt người không»; trình duyệt thật thêm chi phí mà không
  thêm câu trả lời. Đổi lại: thứ chỉ sai khi có CSS thật — chữ bị cắt, bị tràn — nằm
  ngoài tầm vòng này.
- **Không dịch nốt các chuỗi tiếng Anh khác của `packages/ui`.** Vòng này chỉ vá lớp
  nó tìm ra.
- **Không đo nội dung giả trong CSS** (`::before`/`::after`) — vẫn hoãn như vòng trước.
