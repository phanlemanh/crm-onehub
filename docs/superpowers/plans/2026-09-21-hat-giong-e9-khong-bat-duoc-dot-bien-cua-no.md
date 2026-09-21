# Hạt giống — E9 không bắt được đột biến của chính nó

**Gốc:** `_acceptance/ho-so-khai-dung-tieng`
**Mở ngày:** 2026-09-21 · **Trạng thái:** hạt giống, chưa có ô
**Vì sao là hạt giống:** hồ sơ `ho-so-khai-dung-tieng` đóng theo quan sát (chờ
kit 2.18.0, trạng thái `da-cham-boi-thuc-te`), không dựng bàn đo nữa. Khuyết tật
dưới đây là thật và đã đo được, nhưng chứng minh bản vá thì cần bàn đo — nên nó
nằm lại đây chờ vòng sau.

## Khuyết tật

`_acceptance/ho-so-khai-dung-tieng/rang/bang-dot-bien.mjs:170` khai một đột biến
cho chân E9:

```
mo_ta: "boc ForeignText quanh ca khoi Gioi thieu"
```

Nó bọc `<ForeignText lang="en">` ra **ngoài** cả `DetailSheetSection` — tức nuốt
luôn tiêu đề «GIỚI THIỆU» tiếng Việt vào vùng khai tiếng Anh. Chân
`hskt_tieng_trang` phải ĐỎ với thông điệp ghim `tieng-viet-lot`.

Nó thoát **0**. Đo được ở vòng chấm 4: bảng E10 in `E9 | 0 | khong | co` —
phép phá đã áp, chân vẫn xanh.

## Nguyên nhân đã khoanh, chưa chứng

`review-findings.md` của cùng hồ sơ gọi tên lớp bệnh:

> **Assertion âm-tính-một-mình:** chân E9 `tieng-trang` đếm 0 trên một trang
> **chưa xác nhận đã vẽ**.
> file: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs`

Đếm 0 chỗ tiếng Việt lọt vì trang chưa kịp vẽ, không phải vì không có chỗ nào
lọt. Một khẳng định âm tính không có đối chứng dương tính đi kèm thì không phân
biệt được «không có» với «chưa nhìn».

## Việc phải làm khi mở ô

1. Thêm một tiền đề dương tính vào `khai-tieng-ho-so.mjs` trước khi đếm: khẳng
   định khối Giới thiệu ĐÃ vẽ (một selector có thật, không phải `waitForTimeout`).
2. Chạy lại `bang-dot-bien.mjs` chân E9 — nó phải ĐỎ, thông điệp ghim
   `tieng-viet-lot` và gọi tên chữ Việt đã lọt.
3. Quét cùng lớp bệnh ở các chân đếm-0 khác của hồ sơ này
   (`khong-khai-thua`, `ho-so-trong`) — cùng khuôn viết, có thể cùng bệnh.

## Cần gì để làm

Bàn đo đầy đủ: `db:test` → `db:seed` → `cd apps/api && bun run dev:session <email>`
→ `db:seed` lần hai → khoá nghiên cứu vào `appSetting.contextDevApiKey` → cặp
máy chủ `*-cay-nay`. Công thức ghi ở
`docs/findings/2026-09-20-vong-lan-quan-do-thuoc.md`.
