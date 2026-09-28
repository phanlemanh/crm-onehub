## Tóm tắt

Bước kiểm người nhận Slack của Tác nhân nay từ chối đăng khi có người ở nơi nhận mà nó
không xác định được — người trong danh bạ Slack không có email đọc được và chưa khớp với
thành viên nào. Lời từ chối nêu số người đó và nhắc kết nối lại Slack; không nêu tên hay
email của ai.

Tiếp nối vá lối rò Slack (#170), theo mục đã ký «mở hợp đồng mới» ở Cổng Bằng chứng của
hồ sơ `ro-slack-tac-nhan`.

## Thay đổi

- `apps/agent/agent/lib/slack-nguoi-nhan.ts` (tệp của bản rẽ): phân loại thêm «không xác
  định» và thứ tự lời từ chối.
- `docs/agent.md`, mục chỗ rẽ «người nhận Slack và lượt tự động của Tác nhân»: nói luật mới.
- Tệp kiểm mới `apps/agent/test/slack-thieu-quyen-email.integration.spec.ts`.
- Không tệp nào của hãng bị sửa.

## Bằng chứng

Hồ sơ nghiệm thu `_acceptance/slack-thieu-quyen-email` — hợp đồng, phép đo, báo cáo bằng
chứng. Bộ kiểm đỏ trên mã trước bản sửa và xanh sau bản sửa; bộ kiểm của #170 vẫn xanh.

## Lưu ý

Việc báo cho hãng không đi qua PR hay issue công khai; nếu có, chủ kho quyết và gửi qua
kênh bảo mật riêng của hãng.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
