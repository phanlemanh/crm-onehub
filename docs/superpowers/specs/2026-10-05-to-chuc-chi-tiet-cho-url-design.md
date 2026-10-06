# Ca kiểm Tổ chức chờ URL trước khi đọc — thiết kế

Ngày: 2026-10-05 · Hồ sơ: `_acceptance/to-chuc-chi-tiet-cho-url/` · Hạng T2 · Không chạm mã sản phẩm.

## Vấn đề

`apps/app/test/to-chuc-chi-tiet.dom.tsx` dựng trang Tổ chức trong `NuqsTestingAdapter`
và ghi URL mới vào biến `url` trong `onUrlUpdate`. Nuqs không ghi URL ngay khi state đổi:
hàng đợi của nó lên lịch lần ghi bằng `setTimeout(…, 0)` (`ThrottledQueue.flush`,
`rateLimitFactor = 0` ở bản testing), còn khung chi tiết vẽ lại ngay trong lượt `act` của
cú bấm. Ba ca chờ khung rồi đọc `url.get("don")` ngay, nên đúng thời điểm đọc là một cuộc đua
giữa lần vẽ và hẹn giờ của nuqs:

| Ca | Chờ gì | Đọc ngay |
|---|---|---|
| chon-nut: bam tung loai nut… | `khung() === x.chiTiet` | `url.get("don")` vào `thay` |
| o-so-man: o thu nhat noi X/M… | `khung() === "chua-co-phong-ban"` | `url.get("don")` trong `expect` |
| nhap-ba-buoc: buoc dan… | hộp thoại đóng (`doiDong`) | `url.get("don")` và `khung()` trong `expect` |

Đo ngày 05/10 trên Mac mini, không tạo tải thêm: chạy riêng tệp với `--rerun-each 10` cho
6 và 9 lượt đỏ trên 290. «chon-nut» đỏ nhiều nhất (URL còn giữ `pb:pb-kho` sau khi bấm
`chua-co`), «o-so-man» đỏ với `don: null`. Lặp 20 lần: 21 lượt đỏ, đều ở hai ca này. Chạy
một lượt thì thường xanh — đúng hình dạng lỗi P3 gặp ở pre-push lúc 07:35.

## Cách sửa

Đưa điều kiện URL vào chính bộ chờ `cho(...)` của từng ca, đứng cạnh điều kiện khung:

```ts
await cho(
	() => khung() === "chua-co-phong-ban" && url.get("don") === "chua-co",
	"khung chua co va ?don=chua-co",
);
```

Ca «nhap-ba-buoc» thêm một `cho` sau `doiDong()` cho `khung() === "goc" && url.get("don") === "goc"`.
Không câu `expect` nào đổi: các khẳng định vẫn so đúng giá trị như trước. Nếu sản phẩm ghi sai
`?don`, bộ chờ hết 60 nhịp và ném `khong toi: khung … va ?don=…` — ca vẫn đỏ, kèm tên điều
kiện không tới.

`cho` đếm nhịp `setTimeout(0)` (60 nhịp), không đếm mili giây. Hẹn giờ của nuqs cũng là một
nhịp `setTimeout(0)`, nên dưới tải cả hai cùng chậm theo nhau; ngưỡng duy nhất là 60 nhịp, và
lần ghi URL cần một nhịp. Đo trên Mac mini: bản sửa vẫn xanh khi chèn trễ 40 ms (60 nhịp lúc
rảnh dài khoảng 60–80 ms), nhưng ca «loc tat» vốn có đã đỏ ở 80 ms — vì vậy phép đo tất định
(E3) chèn trễ bằng nhịp, không bằng mili giây.

## Đã loại

- **Đặt `rateLimitFactor` hay sửa adapter để URL ghi đồng bộ.** Bản testing đã ở 0; phần
  `setTimeout(0)` nằm trong lõi hàng đợi của nuqs, không có cờ tắt. Vá vào thư viện là phí bản rẽ.
- **Chờ cố định (`sleep`) trước khi đọc.** Đổi một cuộc đua lấy một ngưỡng thời gian; dưới tải
  vẫn đỏ, còn khi rảnh thì làm ca chậm đi.
- **Đọc URL trong `expect` bằng hàm thử lại của bun.** Bun không có `expect.poll`; tự dựng thì
  thành một bộ chờ thứ hai cạnh `cho`.

## Đo

Bốn răng ở `_acceptance/to-chuc-chi-tiet-cho-url/rang/`, mỗi răng có chiều đỏ trên cùng vật:

- `cho-truoc-doc.mjs` — đọc cây cú pháp: mọi lần đọc `url.get(...)` nằm ngoài `cho` phải đứng sau
  một `cho` có vế `url.get(k) === V`, tính từ lần `bam` gần nhất, với `V` đúng giá trị ca khẳng định.
  Ma trận viết trước: đúng ba ca. Chiều đỏ cho cả ba ca: gỡ vế URL; đổi vế thành `!== null`. Bản
  neo `ee0cc227` phải đỏ cả ba.
- `khang-dinh.mjs` — bỏ mọi câu `await cho(...)` thì cả tệp trùng neo từng chữ; `cho` của neo còn
  đủ, theo thứ tự. Chiều đỏ: `toEqual` → `toMatchObject` ở ba ca; bớt hàng `chua-co` của `BON_NUT`;
  bỏ một `bam`; đổi tên một ca; bỏ `cho` «loc tat».
- `tre-url.mjs` — bản sao chèn trễ ba nhịp vào `onUrlUpdate`: bản hiện tại 29/29 xanh, bản neo đỏ
  đúng ba ca, và mọi giá trị `?don` nhận được nằm trong ma trận «giá trị trước cú bấm» viết trước.
- `on-dinh.mjs` — `--rerun-each 20`: bản hiện tại 0 đỏ; bản neo cùng lệnh phải đỏ ít nhất một lần
  ở ba ca, nếu không thì lệnh lặp không phân biệt được và răng thoát 2.

«Dưới tải» của đề bài không thành eval máy: một eval tự tạo tải trong làn S4 (suite và eval
chạy song song) sẽ làm đỏ giả các lệnh khác của chính lượt. Thay vào đó, đo tay dưới khoá `s4`
— lặp tệp song song với bộ kiểm toàn kho — và ghi ở `evidence/do-duoi-tai.md`.
