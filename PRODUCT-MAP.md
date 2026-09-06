# Bản đồ sản phẩm

> Bản đồ vẽ lại từ hồ sơ của xưởng mỗi lần một người ký một cổng — đừng sửa tay.
> (đọc từ thư mục `_acceptance/` và `.out-of-scope/`)

```mermaid
flowchart TD
  A["Đang cân nhắc cơ hội<br/>chưa có"] --> GD{"Cổng Đáng"}
  GD --> B["Sắp mở vòng<br/>chưa có"]
  GD --> XL["Xếp lại sau<br/>chưa có"]
  GD --> DB["Đã bác từ khám phá<br/>chưa có"]
  B --> CD["Chờ duyệt phạm vi<br/>chưa có"] --> GP{"Cổng Phạm vi"}
  GP --> DL["Đang làm<br/>5 việc"] --> GB{"Cổng Bằng chứng"}
  GB --> DG["Đã giao<br/>10 việc"]
  GB --> CN["Chờ phiên nghiệm thu<br/>chưa có"] --> GG{"Cổng Giá trị"}
  GG --> NT["Đã nghiệm thu giá trị<br/>chưa có"]
```

> **Bốn cổng người** — mỗi cổng là một câu hỏi chỉ người trả lời được:
> **Cổng Đáng** việc này có đáng làm không · **Cổng Phạm vi** bộ tiêu chí
> đã đủ và đúng chưa · **Cổng Bằng chứng** đã làm đúng thứ đã hứa chưa ·
> **Cổng Giá trị** thứ đã giao có ăn thua không.

## Đang làm

- Chữ mặc định của thư viện ngoài — dựng thước cho lớp chữ mà mọi bộ quét tĩnh đều mù, rồi vá cái nó tìm ra (`chu-mac-dinh-thu-vien-ngoai`)
- Cửa vào nói tiếng Việt — màn đăng nhập và màn khai báo đọc đúng tiếng của nhân viên, ngay lần đầu họ mở CRM (`cua-vao-noi-tieng-viet`)
- Nhãn ứng dụng nói tiếng Việt trên ba luồng của ngưỡng — thêm công ty, ghi hoạt động, cập nhật thoả thuận (`nhan-ung-dung-noi-tieng-viet`)
- Thước của lát ③a có răng — mỗi phép đo nghiệm thu của vòng ③a phải đỏ được, và chứng minh lại điều đó mỗi lượt chạy (`thuoc-cua-lat-3a-co-rang`)
- Xương sống ngôn ngữ — nhân viên chọn tiếng Việt một lần, màn công ty hiện trọn tiếng Việt (`tieng-viet-cho-crm`)

## Đã giao

- Lát dựng tác nhân nói tiếng Việt — đợt một: khung điều hướng, cụm Tác nhân của đội, và bảng kết quả/mã đọc đúng tiếng của người quản trị (`agent-builder-noi-tieng-viet`)
- Bộ dựng chung nhận chuỗi từ ngoài — một component hiện đúng tiếng người đọc mà chỗ gọi không phải truyền gì (`bo-dung-chung-nhan-chuoi`)
- Cài đặt còn lại nói tiếng Việt — năm cụm Theo dõi, Kết nối, Khoá API, SSO, Thành viên đọc đúng tiếng của người quản trị, và mọi đoạn mã người chép giữ nguyên từng byte (`cai-dat-con-lai-noi-tieng-viet`)
- Cửa sổ trò chuyện của lát dựng tác nhân nói tiếng Việt — đợt hai, và tháo ba mối nối với hồ sơ đợt một đã ký (`cua-so-tro-chuyen-noi-tieng-viet`)
- Lưới tự đối chiếu với bản khai hình của nó, thay vì chờ người nghĩ ra đòn tấn công kế tiếp (`hinh-cua-luoi`)
- Cho khẳng định về đăng nhập Microsoft có răng, thay vì tự tính kỳ vọng từ chính môi trường nó đo (`khang-dinh-microsoft-co-rang`)
- Lưới chặn trước khi đẩy phải chạy thật, và hồ sơ đã ký phải trỏ đúng chân răng (`luoi-day-do-that`)
- Màn Cài đặt nói tiếng Việt — cụm General và Currencies đọc đúng tiếng của người quản trị, kể cả ở những trạng thái màn hình không tự mở ra (`man-cai-dat-noi-tieng-viet`)
- Trả ổ cắm buổi khai thác về trạng thái trung tính, và thu phép đo ổ cắm về đúng hai ổ thiết kế (`o-cam-khai-thac-trung-tinh`)
- Sửa hai lỗi môi trường làm suite test đỏ, và nối dây cổng nghiệm thu vào bản kit đang cài (`sua-test-do-thu-tu-nap`)
