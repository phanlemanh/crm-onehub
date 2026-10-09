# K3b — Bàn gieo góp ý chạy lại được sau khi công cụ nộp tự đóng việc

Hàng K3b của dãy P1, đợt `sau-14-10`. Cổng Đáng: `build` (Phan Le Manh, 2026-10-09). Nguồn: `opportunity.md`.

## Vấn đề

`_acceptance/gop-y-dung-cho/rang/san-gop-y.mjs` (03/10) là bàn gieo dùng chung của ba bàn đo màn OKR
(`gop-y-dung-cho`, `khung-okr-truoc-r1`, `okr-to-chuc-va`). Hàm `nop()` xếp một việc `okr-de-xuat`, nộp góp ý
mẫu qua đúng công cụ của agent (`nopDeXuatVao`), rồi gọi `completeTask(taskId, "da-nop")` và ném lỗi nếu hàm đó
trả `null`. Từ `871c9b17` (07/10), `nopDeXuatVao` tự đóng việc bằng `dongViecOkr(id, "da-nop")` ngay sau khi ghi,
nên `completeTask` luôn trả `null` và `gieoGopY` luôn ném «viec … da dong truoc khi nop xong». Ba bàn đo dừng ở
bước chuẩn bị từ 07/10. Không lưới nào thấy, vì mọi eval dùng chúng là `ui-check`, không chạy trong làn ghim lại.

## Cách sửa

Đổi đúng hàm `nop()` (và tách phần kiểm ra một hàm thuần để đo được không cần CSDL):

```js
export function kiemNopXong(kq, viec) // ném Error có tên khi không phải «nộp xong»
```

- `kq.ketQua !== "da-ghi"` → ném `nop <objectiveId>: <ketQua> — <lyDo>`.
- Việc chưa đóng (`finishedAt === null`) hoặc đóng bằng kết cục khác `da-nop` (đọc hằng
  `TRO_LY_OKR.ketThuc.daNop` của `apps/agent/agent/lib/okr/config.ts`, không chép chuỗi) → ném
  `viec <id> khong dong bang da-nop sau khi nop (<outcome>)`.
- Bỏ lời gọi `completeTask` và dòng nhập của nó. Phần còn lại của `nop()` (xếp việc, chặn `dungLai`, đặt lease,
  `noteSession`, kiểm số dòng và dòng bị loại) giữ nguyên. `SAN`, `gieoGopY`, `datLaiGopY`, `dongKho` giữ nguyên.

Cách kiểm này đã chạy ở bàn gieo riêng của K3 (`_acceptance/kara-gop-y-luot-2/rang/gieo.mjs`), lượt đo màn
45/45 ngày 09/10. K3 không chuyển về bàn gieo chung trong vòng này.

## Đo

- E1 (AC-1): `rang/gieo-thu.mjs` trong phiên đo riêng: nạp bộ OKR mẫu, `gieoGopY`, rồi đọc thẳng CSDL đo: A có
  đúng ba dòng `cho`, B không dòng nào, hai việc đã đóng bằng `da-nop`.
- E2 (AC-2): `rang/kiem-nop.mjs` gọi `kiemNopXong` với ma trận viết trước bốn ca (da-ghi + da-nop → qua; tu-choi;
  da-ghi + việc chưa đóng; da-ghi + kết cục `loi`), không cần CSDL.
- E3 (AC-3): `rang/ba-ban-do.mjs` chạy bốn khoá bàn đo của ba hồ sơ (`gy_man_that`, `r1a_man_khung`,
  `r1a_man_thanh`, `r1d_man_okr`), đòi không bàn nào dừng ở bước gieo, ghi dòng kết luận từng bàn vào
  `.acceptance-runs/ban-gieo-gop-y-sau-nop/ba-ban-do.txt`. Bàn đo đỏ ở bước đo thì không làm E3 đỏ — nó thành
  mục ngoài hợp đồng cho Cổng 2.
- E4 (AC-4): `rang/ranh-gioi.mjs` theo khuôn của K3: chỉ `san-gop-y.mjs`, thư mục hồ sơ và `config.yaml` (chỉ dòng
  `+`) đổi.
- E5 (AC-5): `rang/dot-bien.mjs` hai vết trên tệp thật, trả lại trong `finally`: (a) đặt lại lời gọi
  `completeTask` bắt buộc → E1 đỏ «da dong truoc khi nop xong»; (b) bỏ kiểm kết cục trong `kiemNopXong` → E2 đỏ
  «ca loi: khong nem».

## Không làm

- Sửa mã sản phẩm, hay nội dung đo của ba bàn đo khi chúng đỏ ở bước đo.
- Chuyển K3 về bàn gieo chung.
- Đưa eval `ui-check` vào làn ghim lại (việc của bộ kit nghiệm thu).
