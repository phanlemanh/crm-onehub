## Trong hợp đồng

(không có finding nào ánh xạ được vào AC ở vòng này.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **evidence-report.md ở HEAD là hồ sơ cũ: ghim SHA lệch, verdict REJECT, và còn PASS cho hai AC đã rút**
  Người dùng thấy gì: Hồ sơ dùng để người quyết định ký duyệt tính năng này hiện là bản cũ: nó vẫn ghi PASS cho hai tiêu chí đã bị rút khỏi lần giao này, nên người ký có thể duyệt dựa trên thông tin không còn đúng.
  file: `_acceptance/chan-uy-thac-sai-luot/evidence-report.md`
  severity: high
  Đề xuất: known-limits

- **docs/agent.md khai "Every builder tool carries the shared approval policy" — trên đĩa là 3/11 tool**
  Người dùng thấy gì: Tài liệu nội bộ hướng dẫn người sau khi thêm công cụ mới cho tính năng dựng agent lại nói sai rằng mọi công cụ đều tự động có lớp bảo vệ — có thể khiến người thêm công cụ mới tin nhầm là đã an toàn trong khi chưa.
  file: `docs/agent.md`
  severity: medium
  Đề xuất: known-limits

- **Hai executor trong _acceptance/config.yaml trỏ vào test đã xoá, chạy là đỏ**
  Người dùng thấy gì: Nếu ai đó chấm lại tính năng này sau, hệ thống đo sẽ tự báo đỏ vì trỏ vào hai phép đo đã xoá — không phải vì tính năng có lỗi — gây mất thời gian điều tra nhầm và có thể làm hoang mang người xem kết quả.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **evidence-report.md vẫn ghi PASS cho E8/E9/E8b/E9b đã bị rút khỏi evals.yaml**
  Người dùng thấy gì: Hồ sơ nghiệm thu vẫn khai bốn phép đo "đã qua" cho phần thu hồi hội thoại treo — phần mà quyết định gần nhất đã công khai rút khỏi lần giao này — nên người đọc hồ sơ dễ tưởng nhầm là tính năng đó đã có và đã kiểm chứng.
  file: `_acceptance/chan-uy-thac-sai-luot/evidence-report.md`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 — input của E7 ghim đường dẫn tuyệt đối theo checkout của tác giả**
  Người dùng thấy gì: Nếu phép đo cho tiêu chí AC-7 được chấm lại trên một máy khác, hệ thống có thể âm thầm đọc nhầm sang một cây mã khác trên máy tác giả thay vì cây đang xét, mà không có cảnh báo nào — làm sai lệch kết quả chấm lại mà không ai biết.
  file: `_acceptance/chan-uy-thac-sai-luot/s4-args.json`
  severity: low
  Đề xuất: new-contract

## Chưa phân loại (triage-failed)

phân loại phạm vi không chạy được — không lỗi nào bị máy tự sửa, người xem lại toàn bộ.

- **Hình dạng 1 (biến thể văn-bản-nguồn) — vế "lớp trong không bị gỡ" của AC-3 đo bằng grep chuỗi trong file .ts, không gọi tool**
  file:line: `apps/agent/test/chan-uy-thac.spec.ts:136`
  severity: medium
  detail: AC-3 đòi mỗi tool thoả CẢ HAI VẾ: (a) khai policy dùng chung, (b) VẪN giữ `requireBuilderAttribute` làm lớp trong; Notes của contract nói rõ vai trò lớp trong là "chốt cuối nếu có đường nào lọt qua cửa". Vế (a) đo đúng bằng import thật + so danh tính đối tượng (dòng 133: `expect(mod.default.approval).toBe(builderTurnApproval)`). Vế (b) thì đo bằng `readFileSync` rồi `expect(than).toContain("requireBuilderAttribute(")` (dòng 134-137) — chỉ khẳng định VĂN BẢN NGUỒN có chuỗi ấy, không hề chứng minh chốt cuối THẬT SỰ ném khi ctx không được phép. Bài đo không một lần nào gọi `mod.default.execute(...)` với một ctx không được phép, nên trạng thái "ném Error" — chính hành vi mà AC-3 gọi là chốt cuối — chưa từng được quan sát. Ba tool đều có `execute(input, ctx)` đơn giản và fixture `phienThat({ commandType: "CHAT" })` đã có sẵn trong cùng file, nên phép đo hành vi là khả thi ngay tại chỗ. Cụ thể cái lọt lưới: dời `requireBuilderAttribute` sang một nhánh không chạy, hoặc gọi nó rồi vứt kết quả và đọc thẳng `ctx.session.auth.current.attributes`, thì chuỗi vẫn nằm trong file, `-t moi-tool` vẫn xanh, mà lớp trong đã mất. Đáng chú ý: chính `expected` của E3 (evals.yaml:71-72) đã CẤM kỹ thuật tìm-chuỗi-trong-file cho vế (a) — "đọc bằng AST hoặc import thật module rồi soi thuộc tính" — nhưng vế (b) lại rơi đúng vào kỹ thuật đã bị cấm ấy.
  source: measurement

⚠ Cụm ngoài vùng phủ: 5/6 lỗi rơi vào file không bộ đo nào phủ (_acceptance/chan-uy-thac-sai-luot/evidence-report.md, docs/agent.md, _acceptance/config.yaml, _acceptance/chan-uy-thac-sai-luot/s4-args.json) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
