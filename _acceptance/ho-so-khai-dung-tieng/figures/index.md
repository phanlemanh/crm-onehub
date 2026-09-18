# Điểm quyết định chờ ký — kê và đếm

Ngưỡng N5: từ **ba bước nối tiếp** hoặc từ **hai nhánh rẽ** thì cần hình.

| Điểm | Đếm | Hình |
|---|---|---|
| `d-…-1` cơ chế: component dùng chung hay viết tay tại chỗ gọi | 1 nhánh rẽ, 2 lối | dưới ngưỡng: 1 |
| `d-…-2` nuốt luôn 5 chỗ viết tay cũ hay chỉ làm 4 chỗ mới | 1 nhánh rẽ, 2 lối | dưới ngưỡng: 1 |
| `d-…-3` loại ô người nhập được và danh từ riêng khỏi phạm vi khai | **5 nguồn giá trị → 2 nhóm qua một bảng tra ngoại lệ, và đường từ giá trị tới giọng đọc có 4 bước nối tiếp: giá trị trong CSDL → chỗ gọi trong mã → phần tử DOM → giọng trình đọc màn hình** | **cần hình** → `duong-toi-giong-doc` |
| `d-…-4` bỏ design-pass vì vòng này không đổi pixel nào | 1 nhánh rẽ, 2 lối | dưới ngưỡng: 1 |
| `d-…-5` đổi kiểu `MetaLine.parts` thay vì khai theo cả dòng | 1 nhánh rẽ, 2 lối | dưới ngưỡng: 1 |
| `d-…-6` canh hồi quy bằng cách chạy lại thước cũ | 1 nhánh rẽ, 3 lối | dưới ngưỡng: 1 |

Không có dòng `[GIẢ ĐỊNH]` nào trong `## Coverage`. Không finding gap-probe nào
để lại `human-gate1` — cả năm đã sửa vào artifact.

## Đề bài hình `duong-toi-giong-doc`

- **Loại hình**: sơ đồ luồng, một chiều trái sang phải, có nhánh rẽ ở bước 2.
- **Nút**: bốn cột nối tiếp — (1) *Giá trị trong cơ sở dữ liệu* · (2) *Nguồn đã
  ghi nó* · (3) *Phần tử trên màn* · (4) *Giọng trình đọc màn hình đọc nó*.
- **Nhánh rẽ ở cột 2** chia làm hai đường, và đây là điều duy nhất hình phải nói
  cho rõ:
  - **đường KHAI** — giá trị do máy ghi: `company.description` · `brief.narrative`
    · `company.industry` · nhãn giai đoạn thoả thuận. Cột 3 ghi
    `<… lang="en">` qua `ForeignText`. Cột 4 ghi *giọng tiếng Anh*.
  - **đường KHÔNG KHAI** — `contact.title` (người nhập) · `company.name` và
    `location` (danh từ riêng). Cột 3 ghi `<span>` trần cộng `translate="no"`.
    Cột 4 ghi *giọng tiếng Việt của trang*.
- **Nhãn bằng chữ** trên chỗ rẽ, lấy đúng chữ của chuẩn: `words of indeterminate
  language` và `proper names` (WCAG 2.2 SC 3.1.2) đi cùng đường KHÔNG KHAI.
- **Một ô chú ở dưới đường KHÔNG KHAI**: "khai cứng ở đây là khai SAI — 'Giám đốc
  kinh doanh' sẽ bị đọc bằng bộ phát âm tiếng Anh".
- **AC liên quan**: đường KHAI → AC-1, AC-2, AC-3, AC-4. Đường KHÔNG KHAI → AC-5.
- Không vẽ kiến trúc, không vẽ thư mục, không vẽ dòng thời gian. Một hình, một ý:
  *cái gì quyết định một giá trị được khai hay không, và hậu quả nghe được của nó*.
