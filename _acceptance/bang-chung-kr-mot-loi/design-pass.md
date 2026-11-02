---
slug: bang-chung-kr-mot-loi
context: standalone
reaction: nac-1
proto: /proto/bang-chung-kr-mot-loi
---

# Design-pass: bang-chung-kr-mot-loi

Bản mẫu `/proto/bang-chung-kr-mot-loi` dựng bằng chính `DongDinhBangChung`, `ODuongDanBangChung` và `DongBangChung` của
ngăn KR, dữ liệu mẫu dày (tên KR 110 ký tự, đường dẫn dài, ghi chú hai dòng, hai người đính). Chụp bằng
`_acceptance/bang-chung-kr-mot-loi/rang/chup-proto.mjs` qua `bun run do:man`.

## Ma trận capture

7 trạng thái × 2 khổ = 14 ảnh ở `evidence/design-pass/`, theme sáng. Script in «14 anh; xong; tran ngang: 0; khong co
ngan: 0».

| Trạng thái | 1280 | 375 |
|---|---|---|
| ST-bc-rong / dang-nhap / sai / dang-dinh / loi / co | có | có |
| ST-bc-cap-nhat-moc | có | có |

## Findings

- Dòng nhập nằm trong danh sách của ngăn, cùng viền `Item variant="outline"` với các dòng bằng chứng, không lớp phủ.
- Đường dẫn sai: nhãn và ô chuyển màu lỗi, câu «Đường dẫn phải bắt đầu bằng http:// hoặc https://» thay câu gợi ý,
  «Đính» khoá.
- Máy chủ từ chối: câu «Chưa đính được bằng chứng. Thử lại sau một lát.» dưới ô, giá trị đã gõ còn nguyên.
- Khối cập nhật KR mốc: ô «Đường dẫn bằng chứng» cùng nhãn, cùng câu gợi ý với dòng nhập.
- Khổ 375, trạng thái lỗi: khung mẫu cao cố định 38rem cắt hai nút dưới cùng; ngăn thật cuộn được nên đây là giới hạn của
  khung bản mẫu, không phải của màn.
- Tên KR 110 ký tự xuống ba dòng ở 1280, năm dòng ở 375; ghi chú dài cắt hai dòng bằng `ItemDescription` như hôm nay.

## Nấc

- Ngữ cảnh: `standalone` — bản mẫu dựng phần Bằng chứng và khối cập nhật trong khung ngăn mẫu, không dựng cả ngăn KR.
- Phản ứng: `nac-1` — máy dựng, tự chụp, gửi gói; người phản ứng lúc duyệt Cổng Phạm vi.
