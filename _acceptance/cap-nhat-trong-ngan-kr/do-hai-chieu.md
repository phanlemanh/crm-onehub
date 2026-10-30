# Đo hai chiều — thước máy của vòng

Mỗi thước mới chạy xanh trên cây lành (đối chứng dương) và đỏ trên bản phá với câu ghim. Bản phá áp tạm vào cây đã commit,
chạy đúng ca, rồi `git checkout` trả lại (bộ chạy ở scratchpad `sv8/chieu-do.py`). Lần chạy 30/10/2026, nhánh
`feat/cap-nhat-trong-ngan-kr`.

| Eval | Bản phá | Mã | Câu ghim |
|---|---|---|---|
| E1 | khối luôn thu (`moNguoi ?? false`) | 1 | `cnk-mo-thu: (a) khoi thu can mo` |
| E1 | tuần tính theo ngày UTC của lần cập nhật | 1 | `cnk-mo-thu: (c) bien tuan VN khoi mo` |
| E2 | khối dựng theo `coTheCapNhat` | 1 | `cnk-chi-doc: ky-cham-diem con khoi` |
| E3 | mức đổi tính từ tiến độ thay giá trị | 1 | `cnk-xem-truoc: ty-dong muc doi` |
| E4a | `close()` sau gửi | 1 | `ngan K dong sau gui` |
| E4a | không làm mới mục tiêu và Lịch sử sau gửi | 1 | `bieu do … diem can …` |
| E4a | bỏ ô liên kết bằng chứng | 1 | `moc thieu bang chung` |
| E4b | bỏ `hop-tuan` khỏi `LOI_VAO` | 1 | `cnk-api: hop-tuan bi tu choi` |
| E5 | `onError` xoá nháp | 1 | `nhap mat sau loi` |
| E6 | bỏ lời khai `useKhaiThayDoi` | 1 | `cnk-giu-nhap: › co nhap khong hoi` |
| E7 | phục hồi `HopThoaiCapNhatKr` và `NutCapNhatDong` cũ | 1 | `cnk-loi-vao: hop-tuan mo dialog` |
| E8 | trạng thái khối giữ qua KR (biến mô-đun) | 1 | `cnk-dau-ngan: K2 mang nhap cua K` |
| E8 | giữ `tab=cap-nhat` qua › | 1 | `cnk-dau-ngan: K2 mo do tab=cap-nhat` |
| E9 | trả bốn tệp lối cập nhật, `kr-sheet.tsx`, `objective-sheet.tsx`, `theo-don-vi/bang.tsx` về bản trước vòng (hộp thoại) | 2 | `SAI 1280 buoc 1: … khoi mo false` |
| E10a | thêm lại import vào kr-sheet.tsx | 1 | `khong-hop-thoai: kr-sheet.tsx con dung HopThoaiCapNhatKr` |
| E10c | xoá lặng một `expect` của hop-cap-nhat-lan-truoc.dom.tsx | 1 | `thuoc-da-ky: hop-cap-nhat-lan-truoc.dom.tsx: mat 1 assertion khong co dong so` |
| E10c (S4-r1) | đổi một câu báo trượt và thêm một khẳng định khác để tổng số không đổi (ca hội đồng chỉ ra) | 1 | `thuoc-da-ky: hop-cap-nhat-lan-truoc.dom.tsx: mat 1 assertion khong co dong so` |

Đối chứng dương trong cùng lần chạy: E10a cấy một import vào bản sao tạm và bắt được; E10c xoá một `expect` trong bộ nhớ và
bắt được. Hai lần sửa thước do chiều đỏ lộ ra: E10c ban đầu cho mất tối đa bằng số ô `thay-loi-hua` nên lọt bản phá — nay
chỉ cho mất khi ô khai `[gỡ]`; E7 ban đầu dừng ở ô đầu khi ô sau ném lỗi — nay mỗi ô tự bắt lỗi và in câu đỏ ngay.

Lượt chấm S4 vòng 1 chỉ ra răng E10c đếm tổng nên bù trừ được (phát hiện trong hợp đồng, AC-10). Vòng 2 răng rút từng khẳng
định (câu báo trượt, dòng `expect(`) và đòi mỗi khẳng định mất có một ô ma trận trích nguyên văn; ma trận thêm 9 ô cho 9
khẳng định mất thật.
