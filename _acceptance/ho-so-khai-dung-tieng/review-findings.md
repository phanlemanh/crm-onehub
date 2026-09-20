## Trong hợp đồng

- **Thước của hồ sơ ĐÃ KÝ bị sửa, trong khi hợp đồng và eval của vòng này vẫn khai là "nguyên trạng"**
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs:147`
  severity: high
  AC: AC-11
  source: conventions

  Vòng này đổi `waitUntil: "networkidle0"` -> `"load"` tại dòng 147 của một tệp thuộc hồ sơ ĐÃ ĐÓNG `nhan-ung-dung-noi-tieng-viet` (commit `3f3f142f`). Nhưng ba bản khai còn đứng nguyên và nay nói sai về cây:

  - `_acceptance/ho-so-khai-dung-tieng/contract.md:48` (AC-11): "chân đo **NGUYÊN TRẠNG** của vòng trước (`_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs` …) vẫn xanh"
  - `_acceptance/ho-so-khai-dung-tieng/evals.yaml:342` (E12 expected): "Chay lai THUOC CU nguyen trang, **khong sua mot dong nao cua no**"
  - `_acceptance/ho-so-khai-dung-tieng/s4-args.json:298` — cùng câu, chép lại
  - `_acceptance/thuoc-khai-dung-tieng/evidence-report.md:438` — vẫn viết "chạy lại … khai-tieng.mjs **nguyên trạng**"

  `evidence-report.md:69-78` (của vòng thước) có kể lại việc vá và nói người ký đã gỡ ràng buộc ngày 20/09, và "Lệch 4" (dòng 546) có bàn một phần chuyện này — nhưng không bản khai nào ở trên được sửa theo. Hệ quả: E12 của `ho-so-khai-dung-tieng` bây giờ đo một cái thước KHÁC với cái mà `expected` của nó mô tả, và hợp đồng đã ký AC-11 mô tả một trạng thái cây không còn tồn tại. Đây đúng lớp bệnh mà kho này lấy làm nguyên tắc ("khai sai hoặc bỏ khai là bài kiểm đỏ") — chỉ khác là ở đây không răng nào canh bản khai bằng chữ trong `contract.md` / `evals.yaml`, nên nó lệch im lặng. Cần hoặc sửa lời AC-11 + E12 expected + evidence-report cho khớp cây, hoặc hoàn nguyên tệp và chờ đúng ở chỗ khác.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Chú thích trong code — vi phạm luật "Never add code comments" của AGENTS.md**
    Người dùng thấy gì: Một vài dòng ghi chú kỹ thuật được thêm vào trong mã nguồn không ảnh hưởng gì tới người dùng đang xem hồ sơ — đây là vi phạm quy ước viết mã nội bộ của đội, không phải lỗi hiển thị hay lỗi tính năng.
    file: `_acceptance/ho-so-khai-dung-tieng/rang/cay-sao.mjs`
    severity: high
    Đề xuất: wont-fix

- **Một tệp test của apps/app cài jsdom vào globalThis cho CẢ tiến trình `bun test`**
    Người dùng thấy gì: Một số bài kiểm tự động khác của ứng dụng có thể vô tình chạy trong môi trường khác với bình thường mà không ai để ý, khiến lỗi thật trong tương lai có nguy cơ bị bỏ sót hoặc báo nhầm.
    file: `apps/app/test/khai-tieng-metaline.spec.tsx`
    severity: medium
    Đề xuất: new-contract

- **`packages/ui/tsconfig.json` liệt kê hai tệp kiểm nhưng bỏ đúng tệp chạy cổng ra khỏi check-types**
    Người dùng thấy gì: Một bài kiểm quan trọng dùng để mở cổng cho các thay đổi mã hiện không được tự động rà soát lỗi kiểu dữ liệu, nên lỗi ẩn trong đó có thể lọt qua mà không ai phát hiện.
    file: `packages/ui/tsconfig.json`
    severity: medium
    Đề xuất: new-contract

- **`rang-chat.spec.ts` đọc gate-shape.json bằng ép kiểu, chỉ kiểm "mảng rỗng" chứ không kiểm hình dạng từng khối**
    Người dùng thấy gì: Nếu tệp cấu hình quyết định bài kiểm nào chạy ở cổng kiểm tra bị viết sai định dạng, toàn bộ bài kiểm liên quan có thể biến mất cùng lúc với một thông báo lỗi khó hiểu, khiến lỗi thật bị bỏ lọt mà không ai biết vì sao.
    file: `packages/ui/test/rang-chat.spec.ts`
    severity: medium
    Đề xuất: new-contract

- **ghim-lai-da-xong.mjs is red on HEAD: the whole-repo hash excludes _acceptance/ but not PRODUCT-MAP.md, which the signoff itself rewrites**
    Người dùng thấy gì: Bằng chứng tự động dùng để xác nhận một tính năng đã ổn định có thể báo sai là 'chưa ổn định' ngay sau khi người phụ trách vừa ký duyệt, dù thực chất không có gì thay đổi — gây chậm trễ không đáng có ở lần duyệt tiếp theo.
    file: `_acceptance/thuoc-khai-dung-tieng/rang/ghim-lai-da-xong.mjs`
    severity: high
    Đề xuất: new-contract

- **congTrong() reads may.address() before the socket is listening — TypeError under Node**
    Người dùng thấy gì: Một công cụ hỗ trợ nội bộ dùng để dựng môi trường đo có thể báo lỗi khởi động nếu cách chạy nó thay đổi trong tương lai, dù hiện tại vẫn hoạt động bình thường.
    file: `_acceptance/ho-so-khai-dung-tieng/rang/cay-sao.mjs`
    severity: medium
    Đề xuất: known-limits

- **pha-thu.mjs: process.exit(2) on bad PHA_THU_* env skips the finally block, leaking the worktree copy and two dev servers**
    Người dùng thấy gì: Trong một số trường hợp hiếm, công cụ dùng để chạy phép đo có thể dừng giữa chừng và để sót các tiến trình chạy ngầm cùng bản sao thư mục tạm, làm chậm hoặc gây nhiễu cho các lần đo kế tiếp.
    file: `_acceptance/ho-so-khai-dung-tieng/rang/pha-thu.mjs`
    severity: medium
    Đề xuất: known-limits

- **sign-out.spec.ts replaces globalThis.window for every later test file in the same bun process, now that khai-tieng-metaline.spec.tsx installs a jsdom window at module scope**
    Người dùng thấy gì: Thứ tự chạy các bài kiểm tự động có thể ảnh hưởng ngầm lẫn nhau; một bài kiểm liên quan đến giao diện được thêm sau này có nguy cơ báo lỗi sai chỗ, khiến người kiểm tra mất thời gian tìm nhầm nguyên nhân.
    file: `apps/app/test/sign-out.spec.ts`
    severity: low
    Đề xuất: known-limits

- **Assertion âm-tính-một-mình: chân E9 `tieng-trang` đếm 0 trên một trang chưa xác nhận đã vẽ**
    Người dùng thấy gì: Một phép đo dùng để xác nhận nội dung tiếng Việt không lẫn vào vùng đã khai tiếng Anh có thể báo 'đạt' ngay cả khi tấm hồ sơ chưa kịp hiển thị lên màn hình — nghĩa là kết quả 'đạt' đôi khi không thật sự chứng minh được điều nó hứa.
    file: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs`
    severity: medium
    Đề xuất: new-contract

- **Assert "chuỗi có mặt" trong khi lời hứa là QUAN HỆ: 6/7 bệnh của E14 đo bằng includes() trên mã nguồn**
    Người dùng thấy gì: Một số bài kiểm chống lỗi cũ quay lại chỉ tìm xem một đoạn chữ có còn nằm trong mã nguồn hay không, chứ chưa thật sự kiểm tra hành vi trên màn hình — vài lỗi cũ có nguy cơ quay lại mà không bị phát hiện.
    file: `_acceptance/thuoc-khai-dung-tieng/rang/bay-benh-cu.mjs`
    severity: low
    Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 5/11 lỗi rơi vào file không bộ đo nào phủ (_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs, packages/ui/tsconfig.json, packages/ui/test/rang-chat.spec.ts, _acceptance/thuoc-khai-dung-tieng/rang/ghim-lai-da-xong.mjs, _acceptance/thuoc-khai-dung-tieng/rang/bay-benh-cu.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.