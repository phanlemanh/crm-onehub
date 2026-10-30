# Thước đã ký đo cập nhật KR — ma trận chuyển chỗ đo

Vòng SV8 gỡ hộp `HopThoaiCapNhatKr`; mọi thước đã ký từng đo hộp nay đo khối cập nhật trong ngăn KR. Duyệt bởi chủ kho:
`cham-tep` V1-7 (đổi chỗ đo, giữ kỳ vọng), Hỏi-2 ở Cổng Phạm vi (lời hứa 1: nút «Cập nhật» đầu ngăn; lời hứa 2: khối «lần
trước» trong hộp), V1-10 (A–F). Ma trận dựng từ `git grep` các dấu hộp (`data-hop-cap-nhat-kr`, `HopThoaiCapNhatKr`,
`useCapNhatKr`, `cap-nhat-ngan-kr`, `hop-thoai-cap-nhat-kr`) trên merge-base, cộng hai tệp cùng thư mục phải sửa theo.
Răng `rang/thuoc-da-ky.mjs` đối chiếu.

Nhãn: `giu` không đổi · `chuyen-cho-do` đổi selector hay đường tới form, giữ kỳ vọng · `thay-loi-hua` lời hứa đã duyệt thay
(1, 2 của Hỏi-2; A–F của V1-10).

| tệp | ca | dòng | assertion | nhãn | hồ sơ |
|---|---|---|---|---|---|
| `apps/app/test/ngan-kr-mot-cho.dom.tsx` | vk7-cap-nhat-ngan (mở K1 rồi K3) | 120–191 | hộp của K3, tiêu điểm ô giá trị, làm mới canhKr và Lịch sử, tên KR, phiên sheet | chuyen-cho-do | ngan-kr-mot-cho |
| `apps/app/test/ngan-kr-mot-cho.dom.tsx` | vk7-xem-truoc | 400–480 | chấm `[data-diem-moi]` trên Lịch sử, đích, lỗi «abc», chữ mốc, đọc lichSuKr | chuyen-cho-do | ngan-kr-mot-cho |
| `apps/app/test/ngan-kr-mot-cho.dom.tsx` | vk7-xem-truoc | 418, 428, 468, 477 | tiến độ mới `[data-tien-do-moi]` | giu | ngan-kr-mot-cho |
| `apps/app/test/ngan-kr-mot-cho.dom.tsx` | vk7-dau-ngan | 618, 631 | đầu ngăn: nút chính «Cập nhật» → không nút chính, khối có mặt | thay-loi-hua | ngan-kr-mot-cho |
| `apps/app/test/ngan-kr-mot-cho.dom.tsx` | vk7-dau-ngan, vk7-hep, vk7-trang-thai | 661, 677, 1077, 1202, 1256 | có / không có lối cập nhật theo quyền và khổ; vòng focus-visible | chuyen-cho-do | ngan-kr-mot-cho |
| `apps/app/test/ngan-kr-mot-cho.dom.tsx` | vk7-cap-nhat-ngan (từ đầu ngăn) | 946–1003 | mở form, tiêu điểm, gửi, làm mới, form thu | chuyen-cho-do | ngan-kr-mot-cho |
| `apps/app/test/ngan-kr-mot-cho.dom.tsx` | vk7-tren-dong | 1771–1774, 1811 | form của K3 trong ngăn, tên ngăn, menu «…» mở khối K1 | chuyen-cho-do | ngan-kr-mot-cho |
| `apps/app/test/ngan-kr-mot-cho.dom.tsx` | vk7-tren-dong | 1780 | bấm dòng K3 không mở ngăn → mở ngăn K3 | thay-loi-hua | ngan-kr-mot-cho |
| `apps/app/test/ngan-kr-mot-cho.dom.tsx` | vk7-tren-dong | 1781 | entry «sheet» → «bang-don-vi» | thay-loi-hua | ngan-kr-mot-cho |
| `apps/app/test/ngan-kr-mot-cho.dom.tsx` | vk7-ba-bam | 1915, 1980, 1995 | số bấm 3/3/4, item gửi, nút khoá khi chưa chọn tự tin | chuyen-cho-do | ngan-kr-mot-cho |
| `apps/api/test/ngan-kr-mot-cho.spec.ts` | vk7-ghi-that | 38 | `DUONG_HOP` trỏ khoi-cap-nhat-kr.tsx (krCapNhatTuSheet, mucGui) | chuyen-cho-do | ngan-kr-mot-cho |
| `_acceptance/ngan-kr-mot-cho/rang/man.mjs` | capNhatTuDong, ngan 1440, ngan 390 | 233–479 | hộp mở, điểm mới, gửi, số bấm, ngăn còn mở | chuyen-cho-do | ngan-kr-mot-cho |
| `_acceptance/ngan-kr-mot-cho/rang/man.mjs` | ngan 1440, ngan 390 | 355, 460–479 | bấm / có nút đầu ngăn «Cập nhật» → khối | thay-loi-hua | ngan-kr-mot-cho |
| `apps/app/test/hop-tuan-tren-bang.dom.tsx` | (dữ liệu, helper) | 172, 259–281 | lichSuKr giả; gửi từ khối | chuyen-cho-do | hop-tuan-tren-bang |
| `apps/app/test/hop-tuan-tren-bang.dom.tsx` | htb-cap-nhat | 605–621 | form của K mở, gửi, form thu | chuyen-cho-do | hop-tuan-tren-bang |
| `apps/app/test/hop-tuan-tren-bang.dom.tsx` | htb-cap-nhat | 619–626 | bấm dòng không mở ngăn → mở ngăn K có khối (A) | thay-loi-hua | hop-tuan-tren-bang |
| `apps/app/test/hop-tuan-tren-bang.dom.tsx` | htb-cap-nhat | 643 | đường dẫn không đổi sau gửi | giu | hop-tuan-tren-bang |
| `apps/app/test/hop-tuan-tren-bang.dom.tsx` | htb-cap-nhat, htb-cap-nhat-cham | 650–660, 757–770 | tiêu điểm về nút dòng → ở lại ngăn, Esc thì về nút dòng (B) | thay-loi-hua | hop-tuan-tren-bang |
| `apps/app/test/hop-tuan-tren-bang.dom.tsx` | htb-cap-nhat | 661–673 | nút đầu ngăn mở cùng hộp → khối trong ngăn (1) | thay-loi-hua | hop-tuan-tren-bang |
| `apps/app/test/hop-tuan-tren-bang.dom.tsx` | htb-sau-gui | 977–979 | gửi từ nút đầu ngăn → gửi từ khối của B (1) | thay-loi-hua | hop-tuan-tren-bang |
| `apps/app/test/hop-tuan-tren-bang.dom.tsx` | htb-chu | 1108–1114 | bấm Huỷ → Esc đóng ngăn, tiêu điểm về nút dòng (C) | thay-loi-hua | hop-tuan-tren-bang |
| `_acceptance/hop-tuan-tren-bang/rang/man.mjs` | AC-4 | 437, 527, 551 | form của K, gửi, khối thu và ngăn còn mở (A) | thay-loi-hua | hop-tuan-tren-bang |
| `_acceptance/hop-tuan-tren-bang/rang/man.mjs` | AC-4 «mo hop» | 482–496 | ngăn KR không mở → ngăn K mở với khối (A) | thay-loi-hua | hop-tuan-tren-bang |
| `_acceptance/hop-tuan-tren-bang/rang/man-chieu-do.mjs` | roi-bang | 29 | chuỗi đột biến theo mã mới | chuyen-cho-do | hop-tuan-tren-bang |
| `apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx` | hct-khoi | 434–474 | khối «lần trước» → dòng đầu Lịch sử: vị trí, tiêu đề, số, tự tin, ghi chú (2) | thay-loi-hua | hop-cap-nhat-lan-truoc |
| `apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx` | hct-khoi, hct-rong | 112, 455–458, 595 | ngày giờ «15/10, 09:30» → dạng dòng Lịch sử (D) | thay-loi-hua | hop-cap-nhat-lan-truoc |
| `apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx` | hct-khoi | 425, 461–464, 486–504 | số lần trước của KR mốc → trạng thái mốc qua khối (E) | thay-loi-hua | hop-cap-nhat-lan-truoc |
| `apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx` | hct-khoi | 476–480 | chữ phụ «Hiện tại 70 khách», không «Lần trước 70» | chuyen-cho-do | hop-cap-nhat-lan-truoc |
| `apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx` | hct-rong | 545–589 | chưa có lần, không ghi chú, số hỏng — đo trên dòng Lịch sử (2) | thay-loi-hua | hop-cap-nhat-lan-truoc |
| `apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx` | hct-tai | 610–682 | lúc tải và lỗi theo Lịch sử (F); vẫn gửi được | thay-loi-hua | hop-cap-nhat-lan-truoc |
| `apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx` | hct-goi-y | 691–750 | ba câu gợi ý, ô tối đa 200, trang Cập nhật tuần không gợi ý | chuyen-cho-do | hop-cap-nhat-lan-truoc |
| `apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx` | hct-sau-gui | 809–889 | gửi, làm mới, mở lại, ghi chú «Moi», mức đổi (2) | thay-loi-hua | hop-cap-nhat-lan-truoc |
| `_acceptance/hop-cap-nhat-lan-truoc/rang/man.mjs` | mở, toàn ca | 154–255 | nút đầu ngăn (1); khối «lần trước» → dòng đầu Lịch sử (2); gợi ý, nút gửi trong khung nhìn | thay-loi-hua | hop-cap-nhat-lan-truoc |
| `apps/app/test/lich-su-moi-lan-cap-nhat.dom.tsx` | lsml-sau-gui | 516–597 | mở form mỗi lần gửi, ô giá trị, tự tin, nút gửi; đếm dòng và chấm | chuyen-cho-do | lich-su-moi-lan-cap-nhat |
| `_acceptance/lich-su-moi-lan-cap-nhat/rang/man-lib.mjs` | CHON | 49–52 | nút đầu ngăn → dòng thu của khối (1) | thay-loi-hua | lich-su-moi-lan-cap-nhat |
| `_acceptance/lich-su-moi-lan-cap-nhat/rang/man.mjs` | guiMotLan | 134–174 | bấm nút đầu ngăn (1); hộp đóng → khối thu, ngăn còn mở (A) | thay-loi-hua | lich-su-moi-lan-cap-nhat |
| `apps/app/test/okr-sheet.dom.tsx` | sheet-cap-nhat-mot-kr | 1074–1141 | mục menu mở ngăn KR có khối, ghi hộ, «Lần trước: vừa», gửi đúng phiên | chuyen-cho-do | khung-tao-okr-nhu-deal |
| `apps/app/test/okr-sheet.dom.tsx` | sheet-cap-nhat-mot-kr | 1116 | entry «sheet» → «muc-tieu» (AC-7) | chuyen-cho-do | khung-tao-okr-nhu-deal |
| `apps/app/test/okr-sheet.dom.tsx` | sheet-cap-nhat-mot-kr (đối chứng) | 1160 | mục menu theo quyền | giu | khung-tao-okr-nhu-deal |
| `apps/app/test/sheet-quyen-cap-nhat.dom.tsx` | cả hai ca | — | mục menu `[data-muc="cap-nhat-kr"]` | giu | no-sau-luot-4-okr |
| `_acceptance/cua-toi-chi-liet-kr/rang/man.mjs` | (b), (c) | 250–309 | lối cập nhật trong ngăn (1); tên KR ở đầu ngăn thay tên hộp (A) | thay-loi-hua | cua-toi-chi-liet-kr |
| `_acceptance/cua-toi-chi-liet-kr/rang/mot-duong.mjs` | AC-6 (2), (4) | 32–219, 273 | tập LOI_VAO; khối mở lượt với entry thuộc bốn lối của khối (A); bản phá | thay-loi-hua | cua-toi-chi-liet-kr |
| `_acceptance/cap-nhat-tuan-okr/rang/man-cap-nhat.mjs` | E18 b5 | 1637–1704 | menu mở ngăn KR; ghi hộ; tự tin; hộp đóng → khối thu (A) | thay-loi-hua | cap-nhat-tuan-okr |
| `_acceptance/canh-kr-okr/rang/man-canh-kr.mjs` | E11 b9 | 1483–1542 | form trong ngăn K4; gửi → khối thu (A); về ngăn mục tiêu xem dấu | thay-loi-hua | canh-kr-okr |
| `_acceptance/hop-thoai-giu-cho-dang-nhap/rang/soi-giu.mjs` | huy | ~244 | DANH_SACH bỏ hop-thoai-cap-nhat-kr.tsx (tệp đã gỡ) | chuyen-cho-do | hop-thoai-giu-cho-dang-nhap |

## Đường `paths:` chết trong hồ sơ đã ký

Không sửa (hồ sơ đã ký); các hồ sơ này sẽ hoá cũ và cần ghim lại khi gộp: `ngan-kr-mot-cho` E5, E9 · `hop-tuan-tren-bang` E4 ·
`hop-cap-nhat-lan-truoc` E1–E7 · `cap-nhat-tuan-okr` E26 · `hop-thoai-giu-cho-dang-nhap` E9 (đếm «26 tệp»).
