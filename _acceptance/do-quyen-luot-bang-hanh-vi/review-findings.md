## Trong hợp đồng

- **Bộ đột biến lẫn "giết được đột biến" với "giàn đo hỏng" — cho xanh giả**
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs:188`
  severity: high
  AC: AC-7
  source: conventions

  `hong()` trong `chung.mjs` thoát mã 2, và `khai-sinh.json` khai đúng `"ma": 2` cho các vectơ của E3, E4, E6, E9. Hai thứ trùng mã, nên `khai-sinh.mjs` không phân biệt được.

  Đường xanh giả cụ thể, ở `nguon-ghi.mjs:186-189`: nếu lượt ĐỐI CHỨNG (bản sao chưa đột biến) đã đỏ — ví dụ ai đó thêm một chỗ ghi `commandType` hợp lệ thứ tư ở `apps/api/src`, làm ma trận toàn phần lệch — thì `hong("doi chung duong hong: … " + truoc.chu)` được gọi. `truoc.chu` là toàn bộ output của lượt đối chứng, tức có chứa nguyên văn chuỗi ghim "nguon ghi commandType khong nam trong danh sach da ghim". Kết quả: thoát 2, output chứa ghim.

  `khai-sinh.mjs:70-88` chấm đúng hai điều kiện đó (`r.ma !== dong.ma` và `!r.chu.includes(dong.ghim)`), nên nó kết luận ĐẠT — trong khi thực tế phép đo chưa bao giờ chạy được lượt đột biến. Cùng hình dạng ở `khong-cam-tin-nhan.mjs:147` và `vet-ho-so-cu.mjs:119`. Đúng bằng chứng mà E4 nói nó ngăn ("thuoc chua bao gio chay thi mau do sau do khong noi len dieu gi"), nhưng chỉ ngăn được ở E2/E5 (khai `ma: 1`, khác mã của `hong`).

- **"Ma trận toàn phần" của E4 bỏ số dòng nên không thấy chỗ ghi thứ hai trong cùng hàm**
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs:83`
  severity: medium
  AC: AC-3
  source: bugs

  `expected` của E4 hứa "tập `file:dòng` tìm được phải BẰNG ĐÚNG danh sách đã ghim", nhưng khoá so sánh lại là `viTri(...).replace(/:\d+$/, "")` — tức `file :: tên hàm :: loại nguồn`, rồi còn khử trùng bằng `[...new Set(thay.map((t) => t.khoa))]` ở dòng 95. Số dòng chỉ được in ra, không tham gia so sánh. Hệ quả: thêm một chỗ ghi `commandType` mới trong một hàm đã ghim, với hình dạng nguồn hợp lệ, là vô hình với sàn dân số. Kiểm chứng: chèn thêm `commandType: input.commandType,` vào thẳng khối `data` của `createBuilder` (ngoài `submissions.create` đã có) rồi chạy `--goc` lên cây đó → chấn dò in "4 cho ghi commandType, khop dung danh sach da ghim" và thoát 0. Đúng cái loại thay đổi mà AC-3 muốn chặn (một đường ghi quyền mới) lại lọt, miễn nó nằm cùng hàm với một đường đã ghim.

- **Chiều đỏ của E2/E5 chỉ khẳng định "mã khác 0", và tự in ra chính thông điệp ghim**
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/mang-theo-do.mjs:47`
  severity: high
  AC: AC-4
  source: measurement

  Hình dạng 4 (assertion âm-tính-một-mình, không ghim thông điệp).

  Hai chân dò đột biến này chỉ kiểm `if (sau.ma === 0) hong(...)` — nghĩa là BẤT KỲ mã thoát khác 0 nào của `bun test test/quyen-luot.spec.ts` cũng được tính là "bắt được đột biến". Không có assert nào buộc bài do đúng cái bài mang lời hứa, cũng không có assert nào soi nội dung `sau.chu`. So sánh: rang/khong-cam-tin-nhan.mjs, rang/nguon-ghi.mjs, rang/bo-do-grep.mjs, rang/vet-ho-so-cu.mjs đều kiểm thêm `sau.chu.includes(GHIM)` và `/apps\/…:\d+/`; hai tệp này thì không.

  Cụ thể vì sao nó lệch: vector "mang-theo-luon-mo" (dòng 13-21) đổi `commandTypeFromAuthorization` trong packages/validation/src/builder-question.ts thành luôn trả "CREATE_AGENT". Hàm đó bị gọi TRỰC TIẾP bởi 4 bài trong describe("ke-thua") của apps/agent/test/quyen-luot.spec.ts (dòng 27-63) — những bài không hề đo đường mang-theo. Suite đỏ vì describe("ke-thua") là đủ để probe kết luận "thuộc có đo đường mang theo", trong khi lời hứa của E5 chưa được chứng minh chút nào.

  Tệ hơn, chuỗi ghim bị tự-thoả: dòng 52 (và cong-quyen-do.mjs dòng 82) `process.stdout.write(\`${GHIM}\n …\`)` in GHIM ra vô điều kiện ở nhánh THÀNH CÔNG. rang/khai-sinh.mjs::chayBanKhai kiểm `r.chu.includes(dong.ghim)` trên chính stdout đó, nên phép "ghim thông điệp" của bản khai sinh cho E2/E5 chỉ đọc lại tiếng vọng của probe, không đọc bằng chứng từ phép đo. Cùng lỗi ở rang/cong-quyen-do.mjs dòng 77 và 82.

- **"Ma trận toàn phần" của E4 bị Set gộp — thừa một chỗ ghi trong cùng hàm vẫn xanh**
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs:95`
  severity: medium
  AC: AC-3
  source: measurement

  Hình dạng 5 (tuyên quét lớp/ma trận toàn phần nhưng số assert không bằng số phần tử).

  E4 hứa: "tập `file:dong` tìm được phải BẰNG ĐÚNG danh sách ghim sẵn. Thừa một phần tử hay thiếu một phần tử đều là mã 2." Nhưng khoá so sánh (dòng 83) là `<file> :: <hàm bao> :: <loại nguồn>` — đã bỏ số dòng bằng `.replace(/:\d+$/, "")` — rồi dòng 95 còn gộp trùng bằng `new Set`. Nên số phần tử thực (`thay.length`) không hề được so với số phần tử ghim (DA_GHIM, dòng 22-26); chỉ tập khoá đã gộp mới được so.

  Hệ quả: thêm một chỗ ghi commandType MỚI, trong cùng hàm, cùng loại nguồn hợp lệ → khoá trùng khoá cũ, tập không đổi, xanh.

  Đã đo trên bản sao: cấy thêm `banSao2: { create: { commandType: input.commandType } }` cạnh chỗ ghi trong submitBuilder → probe in "4 cho ghi commandType, khop dung danh sach da ghim" và EXIT=0, dù danh sách ghim chỉ có 3 phần tử. Muốn đúng lời hứa thì phải so cả `thay.length` (hoặc giữ số dòng trong khoá) với danh sách ghim.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hai executor E2/E5 khai trong config.yaml luôn thoát 2 — không bao giờ chạy được**
  Người dùng thấy gì: Hai mục đo tự động — một cho việc khoá cổng dựng tác nhân sai quyền, một cho đường quyền đi qua câu hỏi treo — sẽ luôn hiện lỗi trên báo cáo nghiệm thu dù tính năng làm đúng, vì bản thân lệnh đo bị thiếu một tham số. Người đọc báo cáo có thể hiểu nhầm tính năng đang hỏng.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **tu-kiem-khung.mjs sửa file nguồn có theo dõi trong cây chung, và Ctrl+C bỏ qua bước hoàn nguyên**
  Người dùng thấy gì: Nếu người chạy công cụ kiểm tra bấm dừng (Ctrl+C) giữa chừng, một dòng mã thử nghiệm có thể bị bỏ quên lại trong mã nguồn thật của kho dùng chung, ảnh hưởng tới người khác đang làm việc trên cùng cây mã.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/tu-kiem-khung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Ghi chú 'Hai hàm trùng tên' ở hồ sơ cũ nay trỏ vào hàm đã bị xoá**
  Người dùng thấy gì: Một ghi chú cũ trong hồ sơ nghiệm thu trước vẫn nhắc tới một hàm đã bị xoá khỏi mã nguồn, có thể khiến người đọc hồ sơ sau này bị dẫn nhầm hướng.
  file: `_acceptance/quyen-luot-mang-theo/contract.md`
  severity: low
  Đề xuất: known-limits

- **Executor của E2 và E5 gọi script thiếu --vecto nên luôn thoát 2**
  Người dùng thấy gì: Hai mục đo tự động — một cho việc khoá cổng dựng tác nhân sai quyền, một cho đường quyền đi qua câu hỏi treo — sẽ luôn hiện lỗi trên báo cáo nghiệm thu dù tính năng làm đúng, vì bản thân lệnh đo bị thiếu một tham số. Người đọc báo cáo có thể hiểu nhầm tính năng đang hỏng.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **Vector đối chứng "duoi-select" của E4 rỗng — xanh vì lý do sai**
  Người dùng thấy gì: Một trong các phép thử tự động dùng để chứng minh 'hệ thống phân biệt được đọc dữ liệu với ghi quyền' thực ra không kiểm tra được điều đó — nếu khả năng phân biệt này từng bị hỏng trong tương lai, phép thử sẽ không phát hiện ra.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs`
  severity: high
  Đề xuất: known-limits

- **tu-kiem-khung.mjs sửa file nguồn thật và mất bước hoàn nguyên khi bị ngắt**
  Người dùng thấy gì: Nếu người chạy công cụ kiểm tra bấm dừng (Ctrl+C) giữa chừng, một dòng mã thử nghiệm có thể bị bỏ quên lại trong mã nguồn thật của kho dùng chung, ảnh hưởng tới người khác đang làm việc trên cùng cây mã.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/tu-kiem-khung.mjs`
  severity: medium
  Đề xuất: known-limits

- **chay() nuốt lỗi spawn và trả ma: null, rồi process.exitCode = null thành 0**
  Người dùng thấy gì: Một phần nhỏ trong bộ máy đo có thể âm thầm báo 'đo thành công' ngay cả khi phép đo chưa chạy được do sự cố hệ thống, dù hiện tại một lớp kiểm tra khác đang tình cờ vẫn phát hiện ra sai lệch này.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs`
  severity: low
  Đề xuất: known-limits

- **Đối chứng dương "duoi-select" của E4 rỗng — nó xanh kể cả khi bỏ hẳn duoiKhoaDoc**
  Người dùng thấy gì: Một trong các phép thử tự động dùng để chứng minh 'hệ thống phân biệt được đọc dữ liệu với ghi quyền' thực ra không kiểm tra được điều đó — nếu khả năng phân biệt này từng bị hỏng trong tương lai, phép thử sẽ không phát hiện ra.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs`
  severity: high
  Đề xuất: known-limits

- **Lệnh đã đăng ký của E2 và E5 không bao giờ thoát 0 — thiếu --vecto**
  Người dùng thấy gì: Hai mục đo tự động — một cho việc khoá cổng dựng tác nhân sai quyền, một cho đường quyền đi qua câu hỏi treo — sẽ luôn hiện lỗi trên báo cáo nghiệm thu dù tính năng làm đúng, vì bản thân lệnh đo bị thiếu một tham số. Người đọc báo cáo có thể hiểu nhầm tính năng đang hỏng.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/13 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.