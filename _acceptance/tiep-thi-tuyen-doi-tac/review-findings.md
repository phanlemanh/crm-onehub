# Phát hiện — vòng 4

Hai làn, không mục nào TRONG hợp đồng. Mọi mục dưới đây là việc của người ở Cổng Bằng chứng.

## Lượt máy

# Ngoài hợp đồng — làn máy, vòng 4

Bốn mục. Tất cả thuộc loại «phép đo không chứng minh điều nó khai», tìm thấy khi
đối chiếu từng dòng `expected` của `evals.yaml` với các bài kiểm thật sự nạp.
KHÔNG mục nào là hồi quy của vòng 4: bản sửa của vòng này không chạm ba tệp kiểm
liên quan (`git diff --stat d8240a5f90b1a9790f404f4bf62ab90c45af94a1 HEAD` không
liệt kê `apps/api/test/campaigns.spec.ts`,
`apps/api/test/listing-ingest.integration.spec.ts`,
`apps/api/test/listing-fields.spec.ts`).

Tôi KHÔNG sửa gì. Bốn mục dưới là để người ký Cổng 2 đọc.

---

## 1 (medium) — E13 khai ba bài, kho chỉ có hai; vế «chưa gọi ai thì tỷ lệ là null» không có chân

`evals.yaml` E13 khai ba bài, trong đó có: «Bai "khong chia cho 0": chien dich
chua touch → ty le = null». Bài đó không tồn tại.

`apps/api/test/campaigns.spec.ts` chỉ có hai bài AC-10:
- dòng 343 «số đo đếm cá nhân riêng biệt, đối chứng không tính chính nó»
- dòng 375 «chưa có chiến dịch khác thì đối chứng là null, không phải tỷ số 1»

Trong toàn bộ tệp, `answerRate` bị khẳng định đúng MỘT lần, ở dòng 368:
`expect(stats.answerRate).toBe(1)`. Không dòng nào khẳng định `answerRate` là
null cho một chiến dịch chưa có lượt gọi.

Hệ quả: vế «chưa gọi ai thì tỷ lệ hiện —» của AC-10 chưa có chân ở tầng máy
chủ. Chia cho 0 lọt vào sản phẩm thì bộ kiểm hiện tại vẫn xanh.

Đường sửa: thêm một bài dựng chiến dịch RUNNING không lượt gọi nào rồi khẳng
định `statsFor(...).answerRate` là null.

## 2 (medium) — E5 khai bài «lọc được», kho chỉ khẳng định cái cờ

`evals.yaml` E5 khai: «Bai "loc duoc": contacts.list voi fields
{san_luong: [id option Cao]} tra dung tap». Bài đó không tồn tại.

Cái kho có là khẳng định CỜ, không phải hành vi:
- `listing-ingest.integration.spec.ts:380-383` — lọc `showOnFilter` rồi so tập
  khoá về `["chung_chi", "hinh_thai", "san_luong"]`
- `listing-fields.spec.ts:26-27` — `expect(filterable?.showOnFilter).toBe(true)`

Không lời gọi `contacts.list` nào kèm `fields` trong hai tệp đó.

Hệ quả: AC-5 hứa ba trường «lọc được trên màn cá nhân». Bộ kiểm chứng minh cờ
`showOnFilter` được bật, không chứng minh câu lọc chạy ra đúng tập. Đường lọc
theo trường tuỳ biến hỏng thì bộ kiểm vẫn xanh — cùng họ với Ngoài-9 đã ghi
trong giới hạn đã biết của hợp đồng.

## 3 (low, đã được suite gánh) — lệnh chấm `tt_api` bỏ sót `listing-body-limit.spec.ts`

`apps/api/test/listing-body-limit.spec.ts` TỒN TẠI và mang chân của vế «lô từ 1
đến 500 mục» trong AC-1. Nó KHÔNG nằm trong `executors.test.tt_api` của
`_acceptance/config.yaml`, tức lệnh gắn với E1…E5, E7, E8, E10, E11, E13, E14,
E24 không nạp nó. Vòng 3 chạy một lệnh RỘNG HƠN chính giá trị trong config:
dòng run-log vòng 3 ghi `... listing-fixture-batch listing-body-limit
campaigns.spec ...`, còn config chưa bao giờ có `listing-body-limit`.

Vì sao vẫn là «low»: lệnh suite `bun run test` mà làn này chạy CÓ nạp nó, và nó
xanh — `api:test: (pass) Trần thân yêu cầu của /internal/listings > nhận một lô
đúng 500 mục qua HTTP thật [3910.07ms]`. Vế 500 mục của AC-1 vẫn được chứng
minh ở vòng này, chỉ là bằng lệnh suite chứ không bằng lệnh chấm.

Rủi ro: ai đó thu hẹp lệnh suite, hoặc đọc E1 rồi tưởng lệnh chấm của E1 đã
gánh vế 500 mục. Đường sửa: thêm `listing-body-limit` vào `tt_api` trong
`_acceptance/config.yaml`.

## 4 (low) — mục Ngoài-21 trong giới hạn đã biết của hợp đồng có vẻ đã CŨ

`contract.md` ghi: «Ngoài-21 (medium). Bài kiểm tra việc nạp dữ liệu từ sàn chỉ
đếm số bản ghi được tạo ra, không đối chiếu từng giá trị trường với dữ liệu
gốc; một lỗi hoán đổi giá trị giữa hai trường vẫn có thể lọt qua.»

Kho hiện tại mâu thuẫn với lời khai đó.
`apps/api/test/listing-ingest.integration.spec.ts:195` là bài «AC-1 · chín
trường mang đúng giá trị của mục — ma trận toàn phần», và `expected` của E1 mô
tả đúng chiều đo hoán vị mà Ngoài-21 nói là còn hở: «hoan vi tin_dang ↔
tin_moi_30_ngay ... → bai do o assert got.tin_dang».

Tôi KHÔNG khẳng định Ngoài-21 đã được sửa — tôi không đọc lịch sử của mục đó.
Tôi chỉ ghi rằng lời khai và mã nguồn hiện không khớp. Người ký nên đọc lại
mục này thay vì mang nguyên nó sang vòng sau: một giới hạn đã khai mà thực ra
đã đóng sẽ làm hồ sơ vòng sau nói sai về sản phẩm.


---

## Lượt lái trình duyệt

# Ngoài hợp đồng — làn trình duyệt, vòng 4

Sáu quan sát. Không mục nào làm đỏ eval của làn này; tất cả là chuyện hồ sơ hoặc
chuyện ngoài phạm vi 16 tiêu chí.

1. **Màn góc nhìn đã lưu KHÔNG có khung hình nào ở vòng này.** Bản sửa đổi
   `apps/app/components/data-table/saved-views-menu.tsx` (góc nhìn đang được chiến dịch
   dùng hiện tên một dòng + dòng lý do mờ `Đang là phân khúc của …`, bỏ nút xoá) tồn tại
   trong mã (dòng 199-228), nhưng năm chặn của làn này không mở menu «Bảng xem» lần nào.
   `E6-goc-nhin.png` chỉ chụp nút đóng. Không có ảnh nào chứng minh dòng lý do hiện đúng
   trên màn. Người ký muốn bằng chứng thị giác cho thay đổi đó thì phải thêm một chặn,
   hoặc chấp nhận E14 (làn máy, mức API) là bằng chứng duy nhất.

2. **Ba mã trạng thái của E15 dùng CHUNG một tệp ảnh, trùng từng byte.**
   `E15-ST-chien-dich-nhap.png`, `E15-ST-so-do-chua-goi.png`,
   `E15-ST-thanh-vien-chua-so.png` cùng md5 `109a19de70dc2beaa8f51673e6c10107`. Nội dung
   của khung hình đó thật sự chứa cả ba thứ (huy hiệu Nháp, «Chưa gọi ai nên chưa có tỷ
   lệ.», ô «Chưa có số»), nên không sai — nhưng ba tên tệp gợi ba lần chụp riêng, mà thực
   tế là một lần.

3. **`evidence/E6-network.txt` là của vòng 3, không được ghi lại ở vòng 4.** Mốc tệp
   05/09 06:33, trong khi mọi khung hình khác mang mốc 06/09 17:51-17:53. Vì vậy báo cáo
   khai `network_observed: n-a (driver)` cho mọi khối, không khai `clean`.

4. **Lớp phủ nhà phát triển của Next.js che góc dưới-trái mọi khung hình.** Huy hiệu đỏ
   «1 Issue» đè lên dòng đếm cuối bảng ở hầu hết ảnh, và ở
   `E15-ST-ghi-ket-qua-loi.png` nó đè lên đúng chữ của thông báo lỗi. Chữ vẫn đọc được ở
   ảnh đó, nhưng đây là ảnh chụp máy chủ dev, không phải bản dựng thật.

5. **Thanh điều hướng bên vẫn trộn hai thứ tiếng.** Bản kết xuất
   `E20-chien-dich.html` in: Overview · Chat · Companies · Contacts · Deals · **Chiến
   dịch** · Settings. Đúng như Ngoài-11 đã khai ở giới hạn đã biết; ghi lại vì nó nằm
   ngay cạnh hai màn của vòng này.

6. **Hàng đối chứng hiện `Thành viên —` trong mọi khung hình.** Cột «Thành viên» của
   dải «Mọi chiến dịch khác» luôn là gạch ngang, còn ba cột kia có số. Hợp đồng AC-10
   không đòi số thành viên cho đối chứng, nên không đỏ — nhưng một người đọc màn có thể
   hiểu nhầm là số bị hỏng chứ không phải cố ý bỏ trống.
