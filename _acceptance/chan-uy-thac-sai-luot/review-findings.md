## Trong hợp đồng

- **Assertion âm-tính-một-mình: `rejects.not.toThrow` ghim luồng cho-đi-tiếp bằng đúng việc mọi tool đều phải HỎNG**
  file: `apps/agent/test/chan-uy-thac.spec.ts:160`
  severity: high
  AC: AC-1
  source: measurement
  detail: Bài `moi-tool: luot duoc phep KHONG bi lop trong chan` (dòng 155-164) chỉ có một assert duy nhất: `await expect(mod.default.execute({}, phienThat())).rejects.not.toThrow("Agent creation requires an explicit request to create or build an agent.")`. `.rejects` BẮT BUỘC promise phải reject — nên bài đo đang khẳng định cả ba tool ghim đều NÉM trên một lượt ĐƯỢC PHÉP, chỉ khác thông điệp. Nó xanh vì lý do hoàn toàn ngoài lời hứa: `inspect_context.execute` gọi thẳng `builderContext("conv_1","user_1")` đập vào DB thật (apps/agent/agent/lib/builder-runtime.ts:143) — hội thoại không tồn tại, hoặc chỉ cần mất kết nối DB, là đã có reject; `write_agent_file` và `save_agent_draft` ném từ `assertBuilderDraftOpen()` / `draftInputFromTool({})` vì chạy ngoài eve session. Không ghim thông điệp thực nhận, không có đối chứng dương nào cho chiều 'được phép đi tiếp' ở tầng execute. Hệ quả hai mặt: (a) gỡ `approval` hoặc gỡ `requireBuilderAttribute` khỏi một tool vẫn không làm bài này đỏ; (b) nếu sau này một tool chạy được thật trên `{}` thì bài đi ĐỎ vì hết reject — tức phép đo thưởng cho hỏng và phạt cho đúng.
  rationale: AC-1 hứa lượt purpose=builder+CREATE_AGENT phải "cho đi tiếp, và mọi tool builder chạy như trước vòng này"; bài đo duy nhất phủ chiều này chỉ xác nhận có reject xảy ra (bất kể lý do), không xác nhận thật sự cho-đi-tiếp, nên có thể xanh ngay cả khi AC-1 đã hỏng.

- **Assert chuỗi-vắng-mặt trong khi lời hứa (E10) là QUAN HỆ 'mọi tool import hằng dùng chung'**
  file: `apps/agent/test/chan-uy-thac.spec.ts:168`
  severity: high
  AC: AC-10
  source: measurement
  detail: E10 trong `_acceptance/chan-uy-thac-sai-luot/evals.yaml` khai nguyên văn: "Do QUAN HE chu khong do chuoi-co-mat: khong file tool nao chua chuoi ly do viet thang tai cho — moi tool phai IMPORT hang ay." Bài `moi-tool: khong tool nao viet lai hang ly do tai cho` (dòng 166-172) chỉ làm nửa âm: `expect(readFileSync(join(TOOL_DIR, `${name}.ts`), "utf8")).not.toContain(BUILDER_DENIED_REASON)`. Không có assert nào chạm vế dương 'import hằng ấy'. Một file tool trống rỗng, không policy, không import, không tham chiếu gì tới `BUILDER_DENIED_REASON` vẫn qua bài này. Vế dương lại còn không đúng với mã: ba tool import `builderTurnApproval`, không tool nào import `BUILDER_DENIED_REASON` (xem apps/agent/agent/subagents/agent_builder/tools/{inspect_context,write_agent_file,save_agent_draft}.ts), nên quan hệ mà E10 hứa đo hiện không được đo ở bất kỳ đâu.
  rationale: AC-10 hứa "chuỗi đến từ một hằng được export, không phải chuỗi viết lại ở mỗi tool" — tức đòi cả vế dương (phải import hằng); bài đo chỉ chấm vế âm (không chứa chuỗi viết tay), bỏ trống hoàn toàn vế dương mà AC-10 đòi.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **builderCommandType đã thành hàm identity, còn giữ tham số chết `_value`**
  Người dùng thấy gì: Không ảnh hưởng gì tới người dùng cuối — đây là một hàm nội bộ còn giữ tham số thừa, không làm thay đổi hành vi sản phẩm.
  file: `apps/agent/agent/lib/custom-agent-dispatch.ts`
  severity: medium
  Đề xuất: wont-fix

- **Biến chết `boDongImport` trong file test mới — biome đang cảnh báo**
  Người dùng thấy gì: Không ảnh hưởng người dùng; đây chỉ là một dòng thừa trong bộ kiểm thử gây cảnh báo lint, không tác động tới sản phẩm thật.
  file: `apps/agent/test/chan-uy-thac.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Bài đo "đếm suy diễn trên đĩa = 0" quét theo từng dòng, chỉ cần format lại là mù**
  Người dùng thấy gì: Người dùng không thấy khác biệt ngay, nhưng nếu sau này có ai vô tình đưa lại kiểu suy luận quyền theo nội dung tin nhắn — chỉ cần trình bày code khác một chút — hệ thống kiểm tra sẽ không phát hiện, để lọt đúng loại lỗi từng gây treo hội thoại trước đây.
  file: `apps/agent/test/quyen-luot.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: hai chuỗi cấm chọn tay, sập thành boolean nên không in được thông điệp thực**
  Người dùng thấy gì: Không ảnh hưởng người dùng ngay lúc này; nhưng đây là một phép kiểm thử yếu — nếu sau này lý do từ chối vô tình viết theo giọng nói trực tiếp với người dùng thay vì với hệ thống, phép kiểm thử này sẽ không phát hiện ra.
  file: `apps/agent/test/quyen-luot.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Tuyên 'ma trận toàn phần' nhưng một trục là literal viết tay, không có sàn dân số viết trước**
  Người dùng thấy gì: Không ảnh hưởng người dùng ở phiên bản hiện tại; nhưng nếu tương lai có thêm một loại lệnh mới, phép kiểm thử tự xưng là 'phủ toàn bộ tổ hợp quyền' có thể lặng lẽ bỏ sót tổ hợp mới đó mà vẫn báo xanh.
  file: `apps/agent/test/chan-uy-thac.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/7 lỗi rơi vào file không bộ đo nào phủ (apps/agent/agent/lib/custom-agent-dispatch.ts, apps/agent/test/quyen-luot.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
