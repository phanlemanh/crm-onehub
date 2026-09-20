
# Review Findings: thuoc-khai-dung-tieng (round 1)

## Trong hợp đồng

- **Glob branch của docDuong() nuốt lỗi đọc từng tệp và cả trường hợp glob không khớp tệp nào**
  AC: AC-7
  file: `_acceptance/thuoc-khai-dung-tieng/rang/ban-khai-khop.mjs:60`
  severity: medium
  source: bugs
  detail: |
    Nhánh không-glob của docDuong() trả null khi readFileSync hỏng, và chỗ gọi (dòng 111-119) báo nó ra thành `[duong-trong-paths-khong-doc-duoc:...]` kèm đúng lời giải thích: nuốt lỗi đọc TỪNG đường rồi chỉ báo khi GỘP LẠI rỗng nghĩa là đổi tên một tệp thì ô vẫn đo trên các tệp còn sống.

    Nhánh glob (dòng 56-67) làm đúng cái nó vừa cấm: `.map(... catch { return null })` rồi `.join("\n")` — null biến thành chuỗi rỗng, không ai đếm. Và `git ls-files -- <tiền tố>` thoát 0 với đầu ra RỖNG khi pathspec không khớp gì (đã kiểm: `git ls-files --cached --others --exclude-standard -- khong/co/duong/nay` → exit 0, không in gì), nên một glob chết trả về `""` chứ không trả null.

    Kịch bản hỏng cụ thể: ô E10 của _acceptance/ho-so-khai-dung-tieng/evals.yaml khai 4 paths, trong đó có `_acceptance/ho-so-khai-dung-tieng/rang/**` và `apps/app/components/crm/record-sheet/**`. Đổi tên thư mục `rang/` (hoặc `record-sheet/`) → docDuong trả `""` cho đường đó; `noi_dung` gộp vẫn khác rỗng nhờ hai đường còn lại, nên guard `noi_dung.trim() === ""` ở dòng 124 không bắn, không hàng `DUONG CHET` nào được đẩy, `hong` không tăng. Vế (a) vẫn in "con ton tai" cho mọi hình dạng và chan thoát 0 — nhưng kết luận "mọi hình dạng còn tồn tại" nay nói về một tập tệp NHỎ HƠN tập đã khai. Đây đúng là lớp lỗi mà chính bình luận trong tệp nói là đã vá.

    Sửa: cho nhánh glob trả về mảng {duong, noi} như nhánh kia — đường không đọc được và glob khớp 0 tệp đều phải thành một hàng `[duong-trong-paths-khong-doc-duoc:...]` chứ không phải chuỗi rỗng im lặng.
  rationale: AC-7 requires the checker to name every key/path it reconciled rather than return an aggregate number; this glob branch silently drops a stale/renamed path into an empty string instead of a named [duong-trong-paths-khong-doc-duoc:...] failure, defeating exactly that promise.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **AC-7(b) assertion is vacuous — it measures ancestors up to <html>, not the generated span**
  Người dùng thấy gì: Bài kiểm kiểm tra nhãn ngôn ngữ trên hồ sơ có thể báo 'đạt' ngay cả khi phần hiển thị thật đã sai, vì nó vô tình so khớp một nơi khác trên trang thay vì đúng chỗ cần kiểm.
  file: `apps/app/test/khai-tieng-metaline.spec.tsx:21`
  severity: high
  Đề xuất: new-contract

- **packages/ui/tsconfig.json include is a hand-enumerated file allowlist — reopens the gap AC-8 was written to close**
  Người dùng thấy gì: Nếu sau này có ai thêm một tệp kiểm mới cho phần hiển thị ngôn ngữ, lỗi kiểu dữ liệu trong tệp đó có thể lọt qua mà không ai biết, vì hệ thống chỉ soi đúng hai tệp được liệt tên sẵn.
  file: `packages/ui/tsconfig.json:4`
  severity: medium
  Đề xuất: new-contract

- **.githooks/gate-shape.json reindented from tabs to 2 spaces — repo formatter is tab, file was clean before**
  Người dùng thấy gì: Một lần chạy công cụ định dạng code trong tương lai có thể vô tình đổi lại một tệp cấu hình quan trọng, khiến phép kiểm của một tính năng khác đã được duyệt trước đó báo lỗi giả không liên quan.
  file: `.githooks/gate-shape.json:1`
  severity: medium
  Đề xuất: new-contract

- **New harness scripts carry code comments — AGENTS.md "Never add code comments" is an Always-true invariant**
  Người dùng thấy gì: Một số tệp công cụ mới thêm các dòng ghi chú vi phạm quy tắc chung của dự án, nên có thể bị yêu cầu dọn lại trước khi coi là hoàn tất.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/cay-sao.mjs:46`
  severity: medium
  Đề xuất: new-contract

- **@crm/ui now publicly exports test/* but its only dependency, jsdom, is declared solely in the root package.json**
  Người dùng thấy gì: Một phần công cụ kiểm tra mới phụ thuộc ngầm vào một thư viện chưa được khai báo đúng chỗ của nó, nên nếu môi trường cài đặt thay đổi cách khác, công cụ đó có thể bất ngờ ngừng chạy được.
  file: `packages/ui/package.json:12`
  severity: medium
  Đề xuất: new-contract

- **DIEM_CUOI không giải được thoát mã 1 (= có vi phạm) thay vì mã 2 (= không đo được)**
  Người dùng thấy gì: Nếu một mốc so sánh cũ trong tương lai không còn xác định được (ví dụ sau khi lịch sử mã nguồn thay đổi), hệ thống có thể báo nhầm là 'có vi phạm phạm vi' thay vì đúng ra là 'không đo được', khiến người đọc mất công tìm sai chỗ.
  file: `_acceptance/nen-chat-ai-elements/rang/pham-vi-diff.mjs:103`
  severity: medium
  Đề xuất: new-contract

- **congTrong() đọc may.address() ngay sau listen() — null dưới node, và cổng đã nhả trước khi dùng**
  Người dùng thấy gì: Trong một số cách chạy ít dùng, công cụ tự mở cổng mạng nội bộ để kiểm thử có thể bị lỗi hoặc trùng cổng với một lượt kiểm khác chạy song song, làm kết quả không đáng tin — hiện chưa xảy ra vì mọi lệnh cổng đang dùng đúng cách chạy an toàn.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/cay-sao.mjs:24`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: chân `tieng-trang` nuốt tiền đề rồi đếm trên trang chưa kiểm**
  Người dùng thấy gì: Phép kiểm xác nhận trang hồ sơ không lẫn tiếng Việt có thể báo 'đạt' ngay cả khi trang đó chưa từng mở đúng hay tải đúng dữ liệu, khiến một lỗi hiển thị thật có thể lọt qua mà không ai phát hiện.
  file: `_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs:548`
  severity: high
  Đề xuất: new-contract

- **Tuyên quét LỚP «bài kiểm nằm trong nhà» nhưng chỉ có hai điểm-case**
  Người dùng thấy gì: Công cụ kiểm tra tự nhận là đã chặn được mọi tệp kiểm thử bị bỏ sót khỏi việc soát lỗi kiểu, nhưng thực ra chỉ kiểm đúng hai tệp cụ thể — các tệp kiểm khác trong cùng thư mục vẫn có thể chứa lỗi mà không ai phát hiện.
  file: `_acceptance/thuoc-khai-dung-tieng/rang/bai-kiem-dung-nha.mjs:75`
  severity: medium
  Đề xuất: new-contract

- **Ma trận phủ đọc bảng ĐẦY ĐỦ nhưng thi hành theo `nhom`, không chốt `nhom` hợp lệ**
  Người dùng thấy gì: Nếu một mục kiểm tra mới bị gõ sai nhãn nhóm, hệ thống vẫn có thể báo là 'đã kiểm đầy đủ' trong khi mục đó trên thực tế chưa từng được chạy thử.
  file: `_acceptance/thuoc-khai-dung-tieng/rang/khai-sinh-phu-vong-nay.mjs:385`
  severity: medium
  Đề xuất: new-contract

- **Bản khai eval lệch bản thật: số phép phá và số nhóm của E12**
  Người dùng thấy gì: Bản mô tả số lượng và cách chia nhóm trong chính tài liệu kiểm tra của vòng này không khớp với những gì công cụ thực sự làm, và không có phép đo nào tự phát hiện ra sự lệch đó.
  file: `_acceptance/thuoc-khai-dung-tieng/evals.yaml:253`
  severity: low
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
