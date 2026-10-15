# Phân loại 8 lỗi ghd_soi_xem — onehub 8f819cf6a (15/10 14:44Z)

Lệnh: bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem → exit 1, «DO: 8 loi» (cùng danh sách M5).

| # | Chỗ | Cổng ở tầng trên | Phân loại | PR gốc |
|---|-----|------------------|-----------|--------|
| 1 | okr.service.ts:1014 xoaMucTieu tho:okrKeyResult (FOR UPDATE) | assertSuaMucTieu :1010 → assertXemMucTieu (okr-access.service.ts:157-161, dieuKienXemMucTieu, 404) | ĐÚNG THIẾT KẾ — khoá hàng KR của mục tiêu đã qua cổng | #290 b542f549f 07/10 |
| 2 | okr.service.ts:1020 xoaMucTieu okrObjective.findUniqueOrThrow | như #1; đọc title của chính mt.id | ĐÚNG THIẾT KẾ | #290 |
| 3 | packages/db/src/okr-muc-tieu-lich-su.ts:82 lichSuMucTieu | 2 người gọi: okr.service.ts:1017 (sau assertSuaMucTieu) và :2177 objective() (mt từ docMucTieu có nguCanh, 404 nếu không xem được :2073-2074); trả boolean/lý do, không tên | ĐÚNG THIẾT KẾ (hàm thư viện; miễn ghi «chỉ gọi sau cổng xem») | #290 |
| 4 | okr.service.ts:2061 mine okrObjective.findMany | chỉ lấy id theo vaiCuaToi (cua-toi.ts:4-11); chiaCuaToi (cua-toi.ts:19-28) chỉ lọc ds đã có dieuKienXemMucTieu — đầu ra ⊆ ds | ĐÚNG THIẾT KẾ | #300 b9e51ffa0 07/10 |
| 5 | tro-ly.service.ts:293 coKrSuaDuoc okrKeyResult.count | gọi duy nhất ở :279 sau assertXemMucTieu :272; đếm KR của chính người gọi, ra boolean | ĐÚNG THIẾT KẾ | #342 dbc6d30ed 09/10 |
| 6 | okr.service.ts:1514 congSuaCanChinh okrAlignment.findUnique | là đúng lời đọc removeAlignment đã miễn (soi-ma.mjs MIEN_XEM), dời vào hàm chung; ngay sau là assertSuaMucTieu trên nguồn | ĐÚNG THIẾT KẾ — đổi khoá miễn removeAlignment → congSuaCanChinh | #395 edf23b35a 14/10 |
| 7 | okr.service.ts:1535 suaLyDoCanChinh okrAlignment.findUnique | đọc lại trong giao dịch cùng g.id sau congSuaCanChinh | ĐÚNG THIẾT KẾ | #395 |
| 8 | MIEN_XEM thừa removeAlignment#okrAlignment | hệ quả của #6 | sửa thước | #395 |

LỘ THẬT: 0. CHƯA RÕ: 0. Không viết ca đỏ (bước 3 không áp).
Ghi chú nhỏ #6/#7: mã căn chỉnh không tồn tại → «khongCo(id)», tồn tại mà nguồn không xem được → khongThayMucTieu: phân biệt được mã căn chỉnh có tồn tại; mã cuid không đoán được, mục tiêu giới hạn không căn chỉnh được (trừ ca đua Ngoài-5), và y hệt hành vi removeAlignment đã ký miễn. Không xếp lộ.

Production: cả 4 merge đều là tổ tiên của onehub; 8f819cf6a có 4 dòng «Production – …» success 14:24–14:25Z 15/10. Mã đang chạy, nhưng không lộ.

Nguyên nhân thước đỏ: E23 (ghd_soi_xem) không chạy ở CI theo PR — chỉ chạy khi ghim lại hồ sơ; lần sửa thước cuối d4e79220b 04/10. Luật «ai gộp sau chạy lại soi-ma --ca xem» (contract.md Notes) là luật chữ, 4 PR 07–14/10 lọt.
