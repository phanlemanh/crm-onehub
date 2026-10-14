---
schema_version: 1
feature: "Màn tác nhân đọc được trên điện thoại, trạng thái nói tiếng Việt, và bộ dựng không treo im lặng: câu hỏi của bộ dựng ở lượt sau luôn hiện thay ô soạn"
slug: tac-nhan-va
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-14T04:06:34Z
design_doc: docs/superpowers/specs/2026-10-14-tac-nhan-va-design.md
---

# Acceptance Contract: tac-nhan-va

## Context

Hàng E5 của `docs/plan/lo-trinh-okr.json`, câu giao «Màn tác nhân đọc được trên điện thoại, trạng thái tiếng Việt, bộ
dựng không treo im lặng». Khảo sát bằng mã trên onehub `966eeb78e`: chữ máy tiếng Anh ở danh sách tác nhân và ngăn
lượt chạy, bảng thoả thuận rộng 56rem trong kết quả lượt chạy, và câu hỏi của bộ dựng ở lượt sau bị bỏ vì so toạ độ
giữa hai phiên con — ô soạn mở lại như thể bộ dựng đã xong, phiên con đỗ chờ một câu trả lời không ai được hỏi.

Source input: `_acceptance/tac-nhan-va/opportunity.md` (Cổng Đáng `build` 2026-10-12T23:58:15Z);
`docs/superpowers/specs/2026-10-14-tac-nhan-va-design.md`; mục Ngoài-n «câu hỏi hết hạn mức của phiên con mới bị bỏ»
của `_acceptance/bo-dung-khong-ket/review-findings.md`.

## Criteria

- AC-1: Given ba tác nhân của đội ở trạng thái `LIVE`, `PAUSED`, `ARCHIVED`, When mở danh sách tác nhân, Then mỗi dòng hiện `StatusIndicator` với chữ «Đang bật», «Tạm dừng», «Đã lưu trữ» và tone lấy từ `toneTheoNghia` theo nghĩa `xong`, `cho`, `nhap`; không dòng nào chứa chữ `live`, `paused`, `archived`.
- AC-2: Given một lượt chạy có đủ mọi giá trị `AgentRunStatus`, `AgentActionStatus` (kể cả `PLANNED`), `AgentTriggerType`, các sự kiện `run.*`, `step.*` kho ghi, một sự kiện loại lạ, không người mở và không model, When mở lượt đó trong ngăn lượt chạy, Then mọi trạng thái, mốc kích hoạt và dòng sự kiện là chữ tiếng Việt của bảng chữ; sự kiện loại lạ hiện «Sự kiện khác»; ô người mở hiện «Lịch tự động», ô model hiện «Mặc định»; lý do của lượt hỏng là câu tiếng Việt theo mã lỗi; không chữ nào là tên máy (chuỗi viết hoa có gạch dưới, hay loại sự kiện tách chấm thành khoảng trắng).
- AC-3: Given kết quả lượt chạy là một bảng thoả thuận lọc theo trạng thái `open`, `won` hay `lost`, When mở lượt đó, Then tên vùng bảng (`aria-label`, chữ trình đọc màn hình đọc to) ghi trạng thái lọc bằng chữ của từ điển («đang mở», «chốt được», «không thành»), không in giá trị thô.
- AC-4: Given khổ 375 px, When mở danh sách tác nhân, màn tác nhân được xem một bản ghi tên 60 ký tự, ngăn lượt chạy có kết quả bảng thoả thuận năm dòng, và một hội thoại dựng, Then không màn nào cuộn ngang (`scrollWidth <= clientWidth` của trang và của ngăn); bảng thoả thuận hiện thành danh sách mục, mỗi mục thấy được tên, công ty, giai đoạn và số tiền trong khung nhìn; chip bản ghi không vượt mép phải vùng năng lực.
- AC-5: Given một hội thoại dựng mà bộ dựng đã hỏi một câu ở lần giao việc thứ nhất và người đã trả lời câu đó, When ở lần giao việc thứ hai bộ dựng hỏi một câu khác — loại `question` và loại `session-limit`, payload `input.requested` đúng như eve thật phát lên gốc (phiên con mới mang `requestId` mới, toạ độ và `turnId` không lớn hơn câu trước) — và kênh `crm` xử lý nó, Then câu thứ hai được ghi: `pendingInputRequest` mang đúng `requestId` của câu thứ hai với đúng loại.
- AC-6: (đối chứng) Given cùng hội thoại ở AC-5 khi câu thứ nhất còn đang chờ, When nhận lại đúng câu đó (cùng `requestId`), Then không ghi gì thêm và không có dòng lỗi; When cùng phiên con hỏi tiếp một câu `requestId` mới, toạ độ lớn hơn, Then câu đó được ghi; When sau đó tới một câu `requestId` mới mà toạ độ nhỏ hơn câu đang chờ, Then không ghi gì.
- AC-7: Given một `input.requested` mang mã hội thoại không phải hội thoại dựng, hay hội thoại chưa có phiên, When kênh `crm` xử lý nó, Then không ghi gì và có đúng một dòng `console.error` nêu mã hội thoại và lý do; phát lại cùng câu hỏi (AC-6) không ghi dòng lỗi nào.
- AC-8: Given một hội thoại dựng có bài nộp mới nhất `FAILED` mã `DELIVERY_FAILED` và `errorMessage` tiếng Anh của máy chủ, When mở hội thoại, Then dòng lỗi dưới tin đó là chữ tiếng Việt chọn theo mã, không chứa `errorMessage`; một mã lạ hiện câu chung «Tin này gửi không được.».
- AC-9: (cross-layer) Given câu hỏi lượt thứ hai của AC-5 đã qua kênh `crm` vào cơ sở dữ liệu thật, When `conversations.builderById` thật trả về và màn hội thoại đọc đúng đầu ra đó, Then `pendingQuestion` mang `requestId` và loại của câu thứ hai, màn hiện ô câu hỏi thay ô soạn ở 375 px và 1440 px; trên cây trước vòng cùng kịch bản cho `pendingQuestion` của câu thứ nhất hoặc rỗng (đối chứng chiều đỏ).
- AC-10: (kiểm không hồi quy) Given các bài kiểm sẵn có của khu (`apps/agent/test/cau-hoi-het-han-muc.integration.spec.ts`, `builder-runtime.integration.spec.ts`, `stale-tasks.integration.spec.ts`; `apps/app/test/agent-builder.spec.ts`, `agent-results.spec.ts`, `agent-transcript.spec.ts`, `het-han-muc.dom.tsx`) và các ca `chay-tiep`, `chan-khuon` của `apps/agent/test/eve-tran`, When chạy lại, Then thoát 0 mà không khẳng định `expect(` nào bị xoá hay sửa so với mốc `966eeb78e`; không ca nào thêm `.skip`, `.todo` hay `.only`; `bun run check-types` thoát 0.

## Coverage

Quét hình thái preset test-matrix, đầy đủ ở design doc mục «Độ phủ». Thước CE: enum `schema.prisma` dòng 294–344,
`subagent-hitl-proxy.js` của eve.

- Trục A — màn: danh sách | màn tác nhân | ngăn lượt chạy | hội thoại dựng [thước CE: `components/agent-builder`]
- Trục B — khổ: 375 | 768 | 1440
- Trục C — loại chữ máy: trạng thái tác nhân | lượt | bước | sự kiện | ô mặc định | thoả thuận
- Trục D — đường câu hỏi bộ dựng: lượt đầu | cùng phiên con hỏi tiếp | phiên con mới, toạ độ trùng | phát lại
- Core → AC: A{danh sách}×C{tác nhân} (AC-1) · A{ngăn}×C{lượt, bước, sự kiện, ô mặc định} (AC-2) · C{thoả thuận} (AC-3) · A×B{375} (AC-4) · D{phiên con mới, toạ độ trùng} trên payload eve thật (AC-5) · D{cùng phiên con hỏi tiếp, phát lại} (AC-6) · đường bỏ không phải phát lại (AC-7) · dòng lỗi gửi hỏng (AC-8) · D{lượt sau} qua `builderById` thật tới màn (AC-9) · không hồi quy (AC-10).
- Later: B{320} (ngưỡng Reflow của WCAG).
- Never: đổi khuôn danh sách tác nhân sang `Item` (nếp màn cũ theo dõi ở NM1–NM3); đưa chữ trạng thái về máy chủ; ngưỡng treo do người dùng chỉnh `[NGÀNH: MuleSoft Agentforce — ngưỡng chờ đọc do người tích hợp cấu hình]`.

## Đường đo

- bỏ đường-đo — `opportunity.md` không khai ngưỡng nào; ba vế sửa đã có tên, không có số để Cổng Giá trị đọc (entry descope «bỏ đường-đo»)

## Out of scope

- Vòng đời tác nhân: Lưu trữ / Khôi phục, Xoá khi chưa có lịch sử, hai cột `archivedAt` + `deletedAt`, hộp thoại xoá tiếng Anh, danh sách mặc định lẫn tác nhân đã lưu trữ — đợt 2 vòng đời (`docs/vong-doi.md`), tác nhân đang ở nợ nền của luật `vong-doi`.
- Hội thoại dựng quay vòng «đang làm» khi không sự kiện kết lượt nào tới (móc kênh `crm` ném lỗi, sự kiện mất): lưới dọn, huỷ lượt eve, chặn sự kiện muộn, ngưỡng treo do người chốt — đề xuất hàng riêng.
- Đổi khuôn danh sách tác nhân từ hộp tự dựng sang `Item`.
- Ngân sách viết 128k của bộ dựng bị trần 50k của gốc chặn (mục Ngoài-n khác của `bo-dung-khong-ket`).

## Notes

- AC-5 thay đề xuất `new-contract` của mục Ngoài-n «câu hỏi hết hạn mức của phiên con mới bị bỏ» ở
  `bo-dung-khong-ket`; lỗi rộng hơn mục đó nói — chạm cả câu hỏi làm rõ thường.
