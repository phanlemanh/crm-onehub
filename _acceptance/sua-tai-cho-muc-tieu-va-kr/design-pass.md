---
slug: sua-tai-cho-muc-tieu-va-kr
context: standalone
reaction: nac-1
proto: /proto/sua-tai-cho-muc-tieu-va-kr
---

# Design-pass: sua-tai-cho-muc-tieu-va-kr

Bản mẫu `/proto/sua-tai-cho-muc-tieu-va-kr` dựng bằng chính `truong-okr.ts` và `OTruongPhieu` của ngăn deal, dữ liệu mẫu
dày (tên 120 ký tự, «Vì sao» hai dòng, người phụ trách KR đã rời đơn vị). Chụp bằng
`_acceptance/sua-tai-cho-muc-tieu-va-kr/rang/chup-proto.mjs` qua `bun run do:man`.

## Ma trận capture

2 ngăn × 4 trạng thái × 2 khổ = 16 ảnh ở `evidence/design-pass/`, theme sáng. Script in «16 anh; tran ngang: 0; khong co
ngan: 0».

| Trạng thái | 1280 | 375 |
|---|---|---|
| ST-muc-tieu-xem / dang-sua / dang-luu / loi | có | có |
| ST-kr-xem / dang-sua / dang-luu / loi | có | có |

## Findings

- F1 (thấp, có sẵn): ở khổ 375, giá trị ô chọn người bị cắt không dấu «…» («Nguyễn Thị Phươn»). Cùng hành vi ở ngăn deal
  (`InlineSelectField`) — không sửa riêng ở vòng này; nếu sửa thì sửa trong `packages/ui` (`SelectTrigger`).
- F2 (thấp): cột nhãn chiếm khoảng 40% bề ngang ở khổ 375, «Vì sao» xuống dòng hẹp. Cùng bố cục `DetailSheetProperty` của
  ngăn deal.
- Ô Tên trong khối Chi tiết lặp tên ở đầu ngăn: giữ, vì đầu ngăn là chữ đọc còn ô là chỗ sửa (như ngăn deal: tên ở đầu
  ngăn và ô Tên trong Chi tiết).

## Nấc

- Ngữ cảnh: `standalone` — bản mẫu dựng riêng một ngăn, không đặt trong trang OKR thật.
- Phản ứng: `nac-1` — không đồng bộ: máy dựng, tự chụp, gửi gói ở Cổng Phạm vi.
