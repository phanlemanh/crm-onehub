# Review findings: agent-test-khong-nhap-app (round 1)

## Trong hợp đồng

- **The field-loss check in E4 only loops over keys the schema declares, so the red case "schema drops currency" can never fail**
  AC: AC-4
  file: `apps/agent/test/giai-doan-agent.integration.spec.ts:167`
  severity: high
  source: bugs
  detail: The new round-trip check runs `for (const khoa of Object.keys(dealListItem.shape))` and compares the parsed value with the real `list_deals` output for each key. Gap-probe P1, and both evals.yaml and s4-args.json, say this check exists to catch a package schema that is missing a field Zod then silently drops. The promised red case is a copy of the schema without `currency`, which should fail with "parse lam mat truong currency". But in that copy `currency` is no longer in `dealListItem.shape`, so the loop never reaches it, the assertion never runs, and the test stays green. The check can only see a declared field whose value changes, never a field that was dropped from the schema, which is the exact defect it was added for. Fix: loop over the keys of the real output instead, e.g. `Object.keys(that ?? {})`, or the union of both key sets, so a field the writer emits but the schema omits fails the test.
  rationale: AC-4 hứa parse không làm mất trường nào của đầu ra thật; vòng lặp chỉ đi qua khoá schema khai nên trường bị schema bỏ sót không bao giờ bị bắt.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E4 paths miss tools/list_deals.ts, the file whose toModelOutput and default export E4 measures**
  Người dùng thấy gì: Nếu sau này ai sửa cách công cụ trả danh sách thoả thuận cho Kara, bằng chứng của phép kiểm này có thể không bị đánh dấu là đã cũ, nên có thể không ai nhắc kiểm lại. Hiện tại chưa gây sai kết quả nào.
  file: `_acceptance/agent-test-khong-nhap-app/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **ghim.mjs checks that the repin sha descends from the merge-base, not that it is a commit of this branch**
  Người dùng thấy gì: Phép kiểm ghim lại có thể chấp nhận một mốc ghim không thuộc nhánh này, nên bằng chứng có thể gắn với bản code khác bản sắp gộp mà vẫn báo đạt.
  file: `_acceptance/agent-test-khong-nhap-app/rang/ghim.mjs`
  severity: low
  Đề xuất: known-limits

- **The new shared-schema test fixture leaves out fields the producer always emits; it parses only because of .catch()**
  Người dùng thấy gì: Dữ liệu mẫu trong bài kiểm thiếu vài trường mà Kara luôn trả thật, nên bài kiểm có thể xanh trong khi chưa thử đúng hình dạng dữ liệu thật.
  file: `packages/validation/test/deal-list.spec.ts`
  severity: low
  Đề xuất: known-limits

- **ghim.mjs checks that the repin sha comes after the merge-base, not that it is on this branch**
  Người dùng thấy gì: Phép kiểm ghim lại có thể chấp nhận mốc ghim không còn trong lịch sử nhánh (ví dụ sau khi sửa lại commit), nên bằng chứng có thể trỏ vào bản code không tồn tại trên máy chủ sau khi đẩy lên.
  file: `_acceptance/agent-test-khong-nhap-app/rang/ghim.mjs`
  severity: medium
  Đề xuất: known-limits

- **ghim.mjs ignores the result of git fetch and silently measures against a stale origin/onehub**
  Người dùng thấy gì: Khi mạng lỗi lúc lấy bản mới nhất, phép kiểm ghim lại vẫn chạy trên bản cũ và vẫn có thể báo đạt, nên người xem tin kết quả đã so với bản mới nhất trong khi chưa phải.
  file: `_acceptance/agent-test-khong-nhap-app/rang/ghim.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định sai quan hệ): E5 không kiểm sha ghim nằm trên nhánh này**
  Người dùng thấy gì: Phép kiểm chỉ chắc mốc ghim nằm sau điểm rẽ nhánh chứ chưa chắc nằm trên nhánh này, nên một mốc của nơi khác vẫn có thể lọt qua.
  file: `_acceptance/agent-test-khong-nhap-app/rang/ghim.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (không ghim số khẳng định bằng số phần tử): E3 chỉ cần pass > 0 trên cả tệp**
  Người dùng thấy gì: Nếu ai lỡ xoá hoặc bỏ qua nhóm kiểm so sánh app với gói, phép kiểm vẫn báo xanh nhờ các ca cũ, nên có thể mất bảo vệ mà không ai biết.
  file: `_acceptance/agent-test-khong-nhap-app/rang/app-dung-goi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét cả lớp nhưng chỉ có điểm-case): luật «không còn schema viết tay» chỉ bắt hai tên**
  Người dùng thấy gì: Nếu sau này có người viết lại danh sách thoả thuận bằng tay dưới một tên khác, phép kiểm sẽ không phát hiện, dẫn tới hai bản định nghĩa lệch nhau như trước.
  file: `_acceptance/agent-test-khong-nhap-app/rang/app-dung-goi.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình): evals_exit rỗng hay vắng vẫn qua**
  Người dùng thấy gì: Một dòng ghim thiếu danh sách kết quả kiểm vẫn có thể được tính là đạt, nên có hồ sơ báo đã kiểm lại trong khi thực ra chưa chạy eval nào.
  file: `_acceptance/agent-test-khong-nhap-app/rang/ghim.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
