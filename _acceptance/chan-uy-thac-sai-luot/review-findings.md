## Trong hợp đồng

- **Hình dạng 5 — ma trận AC-4 tuyên quét toàn lớp `purposeOf` nhưng dân số là mảng hardcode trong bài đo, thiếu sàn dân số bắt buộc**
  file:line: `apps/agent/test/chan-uy-thac.spec.ts:13`
  severity: medium
  detail: AC-4 và `expected` của E4 đòi hai thứ: (a) ma trận toàn phần, số assert bằng số phần tử — bài đo làm đúng (`cases` 6 phần tử, `expect(cases).toHaveLength(6)`, dòng 69-73); và (b) **sàn dân số**: "tập giá trị `purposeOf` đếm ra khác 3 → mã 2, nêu giá trị lạ". Vế (b) không có trong bài đo. Dân số của ma trận là `const PURPOSES = ["research", "team-agent", "builder"] as const` (dòng 13) — một mảng viết tay trong file test, không đối chiếu với nguồn sự thật nào. `SessionPurpose` là union type của TypeScript nên bị xoá lúc chạy, và session-purpose.ts không export mảng runtime nào để so; bài đo cũng không đọc nguồn để đếm. So sánh trực tiếp: cùng file, phép đo dân số tool (`moi-tool: dan so tren dia phai bang danh sach ghim`, dòng ~118) LÀM đúng việc này — đọc `TOOL_DIR` trên đĩa và `expect(trenDia).toEqual([...TOOLS_GHIM].sort())` — nên khoảng trống ở AC-4 không phải vì bất khả thi. Cụ thể cái lọt lưới: thêm một giá trị thứ tư vào `SessionPurpose` và một nhánh trả nó trong `purposeOf` (đúng kiểu `team-agent` đã được thêm và từng lọt cửa ở vòng chấm trước) thì `PURPOSES` vẫn 3, `cases` vẫn 6, `toHaveLength(6)` vẫn xanh, và mục đích phiên mới đi qua policy mà không một assert nào chạm tới.
  source: measurement
  AC: AC-4

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Cửa ra not_authorized không được khai ở chỉ dẫn con — con nhận hàng lý do viết cho cha**
  Người dùng thấy gì: Khi hệ thống từ chối yêu cầu tạo tác nhân, tác nhân con chưa được dạy phải báo kết quả đúng cách, nên cuộc trò chuyện có thể vẫn bị treo giống lỗi cũ thay vì báo lỗi rõ ràng cho người dùng.
  file: `apps/agent/agent/subagents/agent_builder/instructions.md`
  severity: high
  Đề xuất: known-limits

- **Danh sách tool ghim policy được suy ra bằng grep chuỗi, nên bất biến "không ambient" trong docs chỉ được bảo vệ một nửa**
  Người dùng thấy gì: Cách kiểm tra tự động hiện tại có thể bỏ sót một cách viết tính năng dựng tác nhân mới theo kiểu khác, khiến tính năng đó lách qua được bước xin phép mà không ai phát hiện.
  file: `apps/agent/test/chan-uy-thac.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Cổng uỷ quyền mới bị vượt bởi bất kỳ câu trả lời ask_question nào**
  Người dùng thấy gì: Khi người dùng chỉ đang trả lời một câu hỏi phụ trong đoạn chat bình thường, hệ thống có thể hiểu nhầm thành lệnh tạo tác nhân và cho phép các thao tác dựng tác nhân chạy ngoài ý muốn của người dùng.
  file: `apps/agent/agent/lib/custom-agent-dispatch.ts`
  severity: high
  Đề xuất: new-contract

- **apps/agent/test/** nằm ngoài tsconfig — bài đo mới không qua check-types**
  Người dùng thấy gì: Các bài kiểm tra mới cho tính năng chặn quyền này chưa được máy tự rà lỗi kiểu dữ liệu, nên nếu sau này cách kiểm tra quyền bị đổi sai, bài kiểm tra vẫn có thể báo đạt trong khi bản chạy thật đã hỏng.
  file: `apps/agent/tsconfig.json`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — E7/AC-7 đo CHỈ DẪN viết cho cha, không đo câu trả lời cha thật sự soạn**
  Người dùng thấy gì: Phép đo cho tiêu chí 'trả lời không dùng từ kỹ thuật' hiện chỉ kiểm tra bản hướng dẫn viết sẵn, chứ chưa kiểm câu trả lời thật hệ thống đưa ra cho người dùng, nên câu trả lời thật vẫn có thể lộ thông tin kỹ thuật dù hồ sơ báo đạt.
  file: `_acceptance/chan-uy-thac-sai-luot/evals.yaml`
  severity: high
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/6 lỗi rơi vào file không bộ đo nào phủ (apps/agent/agent/subagents/agent_builder/instructions.md, apps/agent/agent/lib/custom-agent-dispatch.ts, apps/agent/tsconfig.json, _acceptance/chan-uy-thac-sai-luot/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
