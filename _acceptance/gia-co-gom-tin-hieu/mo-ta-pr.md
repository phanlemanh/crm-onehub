Hàng TH2b của `docs/plan/lo-trinh-okr.json`, mốc 29/10. Câu giao: «Một tín hiệu cài lời dặn không lấy được khoá nào của
lịch gom và không đẩy được gì ngoài PR đề xuất». Mở từ Ngoài-3 của TH2 (#513).

## Lịch gom sau PR này

- Phiên gom chỉ cầm khoá mô hình; Claude Code gỡ cả khoá đó khỏi mọi lệnh con. Không token GitHub nào trong môi trường
  của phiên.
- Phiên chỉ chạy được đúng các lệnh kit liệt trong lời dặn (đường tuyệt đối, đối số cố định), chỉ gọi hai skill gom và
  cắt lượt, chỉ sửa bản gom lượt đã định và các tệp lộ trình. Không git, không mạng, không MCP, không hook, không đọc
  ngoài kho và gói kit.
- Lượt đặt sẵn bản gom vào index để răng phủ chạy được mà phiên không cần git; lượt tự commit.
- Trước khi gọi phiên, lượt quét đĩa tìm token; phiên đổi cấu hình, hook hay ref của git thì lượt dừng trước lệnh git
  kế; trước khi đẩy, lượt quét nội dung đề xuất tìm khoá (nguyên văn và base64).
- Token chỉ tới `git fetch`, `git push` và `gh`. Tệp lịch: checkout không lưu token, cài gói kit đưa token qua cấu hình
  git mức lệnh của chính bước đó, bước gom bỏ `GH_TOKEN`, Claude Code ghim 2.1.304.
- Nhật ký lượt in «phiên gom bị từ chối N lời gọi» kèm tên công cụ.

## Bằng chứng

- Hồ sơ `_acceptance/gia-co-gom-tin-hieu/`: Cổng Đáng `build` 21/10, Cổng Phạm vi duyệt 21/10 (mở lại sau khi bỏ AC-8),
  S4 vòng 1 PASS 8/8 eval, Cổng Bằng chứng ký 22/10 — Manh Phan.
- Hồ sơ TH2 `gom-tin-hieu-tu-chay` ghim lại sau vòng này: bộ thử dùng chung đã đổi (claude giả thôi commit trong phiên,
  dòng 8 của gtc-de-xuat soi `--tools`), ghi ở sổ quyết định của TH2b.

## Known limits

- Chưa có phép đo Claude Code chặn thật (chủ kho bỏ phép thử với Claude Code thật — cần khoá mô hình).
- Chưa cách ly ở tầng hệ điều hành; mục chờ «cách ly hệ điều hành cho lịch gom» vào lộ trình OKR qua PR riêng sau gộp
  (yêu cầu S1-14).
- Bảy mục Ngoài-1, 4–9 trong hợp đồng.

Sau khi gộp, chủ kho đặt `ANTHROPIC_API_KEY` cho lịch gom theo mục «Lịch gom tín hiệu» của `docs/setup.md`.

Không có khối giao diện mới (vòng không chạm UI).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
