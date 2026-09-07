# Review findings — lenh-dung-do-khong-ai-thay

## Trong hợp đồng — máy đã sửa

- **Neo 19 của hợp đồng đếm bằng một luật sai** — `awk` quét sau dòng khai xuất mặc định nên bắt cả lời gọi ở hàm anh em. Đã dựng chân AST đo khả năng đi tới; số thật khác hẳn.
- **Luật đo viết theo TÊN HÀM chứ không theo HÀNH VI** — chân đầu tìm `getLocale`, nên bỏ sót đúng nguyên nhân chính: root layout đọc thẳng `cookies()` + `headers()`. Đã đổi sang `getLocale · cookies · headers · draftMode`.
- **Luật đo per-file đỏ oan trên cây đúng** — một màn đọc dữ liệu lượt truy cập là vô hại khi layout đã bọc `{children}`. Đã đổi sang luật xuyên file, hai chiều đỏ đều chạy thật.
- **15 bản vá màn là thừa** — đo được: cấy lỗi cũ vào một màn thì lượt dựng vẫn xanh; cấy vào layout thì đỏ. Đã trả lại 15 file; bản vá còn đúng một.
- **Chân E5 có đối chứng dương rỗng** — `pre-push` đọc stdin, stdin rỗng nghĩa là «chỉ xoá nhánh» nên nó thoát 0 mà không chạy gì. Đối chứng dương đã xanh vì lý do sai. Đã sửa: nạp một dòng ref thật, và khẳng định log có `pre-push: bun run build`.
- **Chân E5 cấy vào mốc đã biến mất** — sau khi trả lại 15 màn, mốc cấy trỏ vào màn không còn khớp. Chân từ chối tự lừa (mã 2) thay vì xanh rỗng; đã đổi mốc sang layout.
- **Chân E9 có thể đo nhầm cây** — nó có thể nói chuyện với một máy chủ cũ còn sống ở cùng cổng. Đã thêm cửa chặn: cổng đang có ai trả lời thì mã 2.
- **`<html lang>` hoá cứng thành mặc định** — bản vá layout làm vỏ tĩnh mất tiếng. Đã vá bằng `InlineScript` và thêm AC-9 canh bằng HTML thật do máy chủ trả về.

## Ngoài hợp đồng — người quyết ở Gate 2

- **`ci.yml` của hãng vẫn không chạy lệnh dựng**
  Người dùng thấy gì: vòng này đưa lệnh dựng vào `pre-push` và vào CI riêng của công ty, nhưng CI của hãng vẫn chỉ chạy bốn lệnh cũ. Ai chạy CI của hãng — kể cả chính hãng — vẫn không thấy lớp lỗi này.
  file: `.github/workflows/ci.yml`
  severity: P2
  Đề xuất: new-contract — `CLAUDE.md` cấm chạm `ci.yml` của hãng, nên đây là việc gửi ngược lên hãng, có nhịp riêng

- **Vỏ tĩnh của toàn ứng dụng nay là ô chờ rỗng**
  Người dùng thấy gì: mọi route stream sau một ranh `<Suspense>` ở layout, nên byte đầu tiên trình duyệt nhận không còn nội dung nào. Vòng này không có phép đo nào canh thời gian tới nội dung đầu tiên; nếu nó chậm đi thì không ai thấy.
  file: `apps/app/app/layout.tsx`
  severity: P1
  Đề xuất: known-limits — đo tốc độ tải là một hồ sơ riêng có ngưỡng của nó; ghi vào Known limits rồi ship, vì hiện tại ứng dụng không dựng được chút nào nên đây không phải đánh đổi giữa hai thứ tốt

- **`lang` đúng chỉ từ khi nhánh theo tiếng tới, không từ byte đầu**
  Người dùng thấy gì: thẻ `<html lang>` in ra là `vi` cho mọi lượt; lượt tiếng Anh được sửa lại bằng một đoạn script ngay sau đó. Với sản phẩm tiếng Việt thì mặc định `vi` là đúng chiều, nhưng đây vẫn là một khoảng ngắn khai sai.
  file: `apps/app/app/layout.tsx`
  severity: P2
  Đề xuất: known-limits — giữ `lang` đúng ngay byte đầu đòi lối chọn tiếng qua middleware, tức thiết kế khác đã khai ngoài phạm vi ở Cổng 1

- **Kho khai `engines: node >=22` nhưng `eve build` đòi >=24**
  Người dùng thấy gì: một máy cài Node 22 — đúng như kho khai là đủ — sẽ không dựng
  nổi `apps/agent`. CI của hãng chưa bao giờ thấy vì nó không dựng; vòng này thêm
  lệnh dựng vào CI riêng nên lộ ra ngay ở lượt chạy đầu.
  file: `package.json`
  severity: P2
  Đề xuất: new-contract — sửa `engines` là chạm khai báo của hãng, và đây là thứ nên
  gửi ngược lên hãng chứ không vá riêng; vòng này ghim Node 24 trong job CI để cổng
  chạy được

