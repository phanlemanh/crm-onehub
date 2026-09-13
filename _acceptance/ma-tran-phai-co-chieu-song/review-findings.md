> Review Findings: ma-tran-phai-co-chieu-song (round 3)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hằng đường dẫn và helper doiTrongSao nhân bản khắp các module răng thay vì sống ở chung.mjs**
  Người dùng thấy gì: Nếu sau này có người đổi đường dẫn tệp mã nguồn liên quan, một vài nơi kiểm tra tự động có thể không cập nhật theo, khiến việc kiểm tra âm thầm sai lệch mà không ai nhận ra ngay.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khong-cam-tin-nhan.mjs`
  severity: medium
  Đề xuất: new-contract

- **Răng của ma-tran suy đường dẫn của CHÍNH NÓ bằng cách đi ngược ra khỏi thư mục hồ sơ khác**
  Người dùng thấy gì: Nếu thư mục của một hồ sơ kiểm tra khác bị đổi tên hoặc di chuyển, việc kiểm tra ở đây có thể không tự tìm thấy mình và báo lỗi khó hiểu, dù nguyên nhân thật nằm ở chỗ khác.
  file: `_acceptance/ma-tran-phai-co-chieu-song/rang/khong-moc-lai.mjs`
  severity: low
  Đề xuất: known-limits

- **Lỗi dọn cây sao bị nuốt: worktree registration rác ở .git/worktrees dùng chung**
  Người dùng thấy gì: Khi việc dọn dẹp bản sao tạm không thành công, có thể để lại rác trong hệ thống theo dõi phiên bản dùng chung mà không ai được báo để dọn tiếp, khiến kho chứa tích tụ rác dần theo thời gian.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs`
  severity: medium
  Đề xuất: new-contract

- **Đối chứng "khai-thieu-vecto" tự vô hiệu khi dòng được ghim biến mất**
  Người dùng thấy gì: Một phép kiểm tra vốn dùng để phát hiện việc bỏ sót có thể tự mất tác dụng khi có người đổi tên một mục liên quan một cách hợp lệ, khiến sau đó việc kiểm tra không còn bắt được đúng lỗi mà nó được tạo ra để bắt, dù báo cáo vẫn hiện có vấn đề (chỉ sai chỗ).
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.mjs`
  severity: medium
  Đề xuất: new-contract

- **Throw trong finally của voiCaySao nuốt mất lỗi thật đang bay**
  Người dùng thấy gì: Trong một số trường hợp hiếm khi hệ thống bận cùng lúc, thông báo lỗi thật sự có thể bị thay bằng một thông báo không liên quan, khiến người đọc báo cáo hiểu nhầm nguyên nhân thất bại.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs`
  severity: low
  Đề xuất: known-limits

- **coCo() trả undefined khi cờ đứng cuối argv, mọi script lặng lẽ đổi chế độ**
  Người dùng thấy gì: Nếu một lệnh kiểm tra bị gọi thiếu tham số do gõ nhầm hoặc cấu hình sai, việc kiểm tra có thể âm thầm báo 'đạt' dù thực chất không hề kiểm tra gì, khiến người xem báo cáo tin nhầm rằng mọi thứ vẫn ổn.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs`
  severity: low
  Đề xuất: new-contract

- **Fixture viết tay đúng khuôn bên đọc — neo chỉ round-trip SỐ LƯỢNG nhánh, không round-trip HÌNH DẠNG giá trị**
  Người dùng thấy gì: Nếu sau này có người đổi tên một trường dữ liệu ở nơi sinh ra nó nhưng vẫn giữ nguyên số lượng biến thể, phép kiểm tra hiện tại sẽ không nhận ra thay đổi đó và vẫn báo mọi thứ ổn, dù hình dạng dữ liệu thực tế đã khác với cái đang được đo.
  file: `_acceptance/ma-tran-phai-co-chieu-song/rang/neo-bien-the.mjs`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 5/7 lỗi rơi vào file không bộ đo nào phủ (_acceptance/do-quyen-luot-bang-hanh-vi/rang/khong-cam-tin-nhan.mjs, _acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs, _acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
