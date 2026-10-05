---
schema_version: 1
feature: «Thành viên thường không nhờ chat sửa trường của cả đội; model bị gỡ thì chat lùi về mặc định và báo quản trị»
slug: chat-an-toan-truoc-r1
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-05
design_doc: docs/superpowers/specs/2026-10-05-chat-an-toan-truoc-r1-design.md
---

# Acceptance Contract: chat-an-toan-truoc-r1

## Context

Hàng R1e của lộ trình OKR (`docs/plan/lo-trinh-okr.json`), Cổng Đáng ký `build` 05/10. Từ 26/10 thành viên
thường vào CRM. Hôm nay công cụ chat `manage_fields`/`archive_field` đổi được trường của cả đội mà không
kiểm vai (#35), và model đã chọn bị AI Gateway gỡ thì mọi lượt chat hỏng mà Cài đặt không báo (#36).

## Criteria

- AC-1: Given một phiên chat của người đăng nhập (`authenticator` `crm-app`) với vai `owner`, `admin`, `member`, `okr` hoặc không phải thành viên workspace, When người đó nhờ chat chạy `manage_fields` `create` và `manage_fields` `update-brief` (kể cả `agentFilled: false`), Then với `owner`/`admin` trường được tạo / đổi như hôm nay; với ba vai còn lại công cụ trả `created`/`updated` `false` kèm đúng câu `FIELDS_AGENT.tuChoi` và không hàng `fieldDefinition` nào được tạo hay đổi. (cross-layer)
- AC-2: Given cùng năm vai ở AC-1, When chat chạy `archive_field` trên một trường đang dùng (sau khi lời duyệt của người được chấp nhận), Then với `owner`/`admin` trường được lưu trữ như hôm nay; với ba vai còn lại công cụ trả `archived` `false` kèm câu `FIELDS_AGENT.tuChoi` và `archivedAt` của trường vẫn rỗng. (cross-layer)
- AC-3: Given một phiên không có người — lượt dispatch nền (`APP_AUTH`) hoặc lượt Tác nhân (purpose `team-agent`) — When phiên đó chạy `manage_fields` (`create`, `update-brief`) hoặc `archive_field`, Then cả ba bị từ chối với câu `FIELDS_AGENT.tuChoi` và không hàng `fieldDefinition` nào đổi.
- AC-4: Given năm giá trị vai `owner`, `admin`, `member`, `okr` và `null`, When so luật vai mà agent dùng (`laQuanTriWorkspace` của `@crm/validation/vai-workspace`) với luật API dùng cho màn Trường (`canManageFields` của `@crm/auth`), Then hai hàm trả cùng kết quả trên cả năm giá trị.
- AC-5: Given mỗi lần chạy `manage_fields` hoặc `archive_field` ở AC-1, AC-2, AC-3, When công cụ làm hoặc từ chối, Then có đúng một hàng `AgentEvent` loại `truong.doi-qua-chat` của phiên đó, mang `hanhDong`, `vai` (một trong `owner`, `admin`, `member`, `okr`, `khong-thanh-vien`, `tu-dong`), `ketQua` `lam`/`tu-choi` đúng với điều đã xảy ra; và `rang/dem-doi-truong.ts` đọc các hàng đó in đúng số lần làm theo vai, số lần từ chối, số lần một vai không phải `owner`/`admin` đã làm (ngưỡng chết), cùng số hàng `model.bi-go-lui` và `model.khong-tim-thay` (AC-6, AC-11), không ghi hàng nào.
- AC-6: Given model trợ lý đã chọn khác mặc định, When `modelTheoVai` chọn model cho phiên (cả vai `tro-ly` lẫn `tac-nhan`, và `modelChoLuot` ghim cho lượt Tác nhân) với danh mục Gateway (a) có id đó, (b) đọc được mà không có id đó, (c) không đọc được (lỗi mạng, mã HTTP lỗi, thân không phải danh mục), và (d) là thân phản hồi thật của Gateway đã ghi lại (có ngày và nguồn), Then (a) trả model đã chọn; (b) trả `null` để eve lùi về `DEFAULT_AGENT_MODEL`, và ghi đúng một `AgentEvent` loại `model.bi-go-lui` mang id đó cho mỗi id mỗi tiến trình; (c) trả model đã chọn; (d) bộ đọc nhận đủ id của thân thật và trả model đã chọn khi id có trong đó. Bộ đọc danh mục của agent và của API dùng chung một schema ở `@crm/validation`.
- AC-7: Given danh mục Gateway đã đọc một lần, When `modelTheoVai` chạy lại trong `MODEL_DANH_MUC.ttlMs` (5 phút), Then không gọi Gateway lần nữa; quá `ttlMs` thì gọi lại; lời gọi Gateway quá `MODEL_DANH_MUC.timeoutMs` tính là không đọc được.
- AC-8: Given model đã chọn và danh mục Gateway, When API trả `settings.agentModel` cho một quản trị và cho một thành viên thường, Then `selectedMissing` là `true` khi có model đã chọn, danh mục đọc được và id không có trong đó; `false` khi id có trong danh mục, khi đang dùng mặc định, và khi danh mục không đọc được.
- AC-9: Given màn Cài đặt › Model trợ lý thật trên bàn đo riêng của cây, When model đã chọn là một id Gateway không phục vụ, Then quản trị thấy hộp báo «model đã chọn không còn» ở khổ 1440 và 390, hộp không tràn ngang; thành viên thường cũng thấy hộp báo, còn ô chọn model của họ vẫn bị khoá kèm câu «chỉ chủ sở hữu hoặc quản trị đổi được» như hôm nay; và khi model đã chọn là một id Gateway có phục vụ thì hộp báo không hiện.
- AC-10: Given chữ mới của hộp báo và câu từ chối, When đọc bảng chữ hai ngôn ngữ, Then có đúng câu tiếng Việt và tiếng Anh đã khai và khoá được ghim ở `messages-guard`.
- AC-11: Given một lượt chat mà lời gọi model hỏng vì Gateway không tìm thấy model (`GatewayModelNotFoundError`), When eve phát `step.failed` cho lượt đó, Then có đúng một hàng `AgentEvent` loại `model.khong-tim-thay` của phiên đó mang id model; lỗi model khác (hết tín dụng, quá hạn mức) không ghi hàng này.

## Coverage

Quét bằng skill morphological-scan, preset test-matrix.

- Trục A — người đứng sau phiên: `owner` | `admin` | `member` | `okr` | không phải thành viên | dispatch nền (`APP_AUTH`) | lượt Tác nhân (`team-agent`) [thước CE: SUY-TỪ-REPO `packages/validation/src/vai-workspace.ts` WORKSPACE_ROLES, `apps/agent/agent/lib/approval.ts` isAutomated]
- Trục B — việc đổi trường: tạo | đổi chỉ dẫn | chuyển sang nhập tay | lưu trữ [SUY-TỪ-REPO `tools/manage_fields.ts`, `tools/archive_field.ts`]
- Trục C — danh mục Gateway: có id | đọc được, thiếu id | lỗi mạng | mã HTTP lỗi | thân hỏng | quá giờ | thân thật đã ghi | model biến mất sau khi cache [NGÀNH: Vercel AI Gateway `/v1/models`]
- Trục D — người xem Cài đặt model: quản trị | thành viên thường [SUY-TỪ-REPO `settings/agent-model.tsx` canManage]
- Core: A × B → AC-1, AC-2, AC-3 · luật vai trùng → AC-4 · đo → AC-5 · C × vai model → AC-6, AC-7, AC-11 · C × D → AC-8, AC-9 · chữ → AC-10.
- Later: báo quản trị qua Zalo/email khi model bị gỡ; cột người sửa trên `fieldDefinition`.
- Never: chặn thành viên thường dùng `list_fields`/`set_field_value` — đọc trường và điền giá trị một bản ghi là việc của mọi người (`set_field_value` vẫn tôn trọng `agentFilled`).

## Đường đo

- Thước: thành viên thường đổi trường của cả đội qua chat · số từ: `AgentEvent` loại `truong.doi-qua-chat` có `ketQua` `lam` và `vai` không phải `owner`/`admin` · bảo đảm bởi: AC-1, AC-2, AC-3, AC-5
- Thước: phiên chat hỏng vì model bị gỡ · số từ: `AgentEvent` loại `model.khong-tim-thay` (lượt vẫn hỏng) và `model.bi-go-lui` (lượt đã lùi) · bảo đảm bởi: AC-6, AC-11
- Ai đọc số, khi nào: ngày 10/11 chủ kho chạy `bun _acceptance/chat-an-toan-truoc-r1/rang/dem-doi-truong.ts` trên máy mình với kết nối production chỉ đọc (máy của phiên không đọc được biến cơ sở dữ liệu production — biến sensitive); bộ đếm chỉ đọc, không ghi.

## Out of scope

- Thống nhất model đo với model production, đổi `DEFAULT_AGENT_MODEL` (`packages/db/src/settings.ts`) — chủ kho chưa quyết.
- Kiểm production «Trợ lý OKR bị đóng `khong-chay:chua-co-khoa-mo-hinh`?» — biến cơ sở dữ liệu production là sensitive, máy không đọc được; chủ kho tự xem Cài đặt › OKR.
- Cột người sửa trên `fieldDefinition` (cần migration).
- Báo quản trị qua Zalo/email khi model bị gỡ.

## Notes

- Ngoại lệ có tên của ngưỡng #36: danh mục Gateway được cache `MODEL_DANH_MUC.ttlMs` (5 phút); model bị gỡ trong cửa sổ đó thì các lượt tới khi cache hết hạn vẫn hỏng và được đếm ở `model.khong-tim-thay` — chủ kho quyết ở Cổng Phạm vi (gap-probe P1-2).

- `packages/auth` không đổi (đường T3); AC-4 ghim luật agent trùng luật API.
- Bỏ design-pass theo chủ kho duyệt 05/10 (entry `bỏ design-pass` trong decisions.jsonl); khung hình thật ở AC-9.
- Known limits (Cổng 2, 05/10):
  - Trong hợp đồng, AC-6 — `ghiBiGoLui` kiểm `daBao` trước khi ghi và chỉ đánh dấu sau khi ghi xong, nên hai phiên mở cùng lúc ngay khi model vừa bị gỡ có thể ghi hai hàng `model.bi-go-lui` cho cùng một id; `ghiModelPhien` cùng khuôn với `model.phien-chon`. Số đếm ngày 10/11 có thể dư.
  - Ngoài-1 — luật «chủ sở hữu hoặc quản trị» viết ở hai nơi (`laQuanTriWorkspace` và `isWorkspaceAdmin`); chỉ bài kiểm AC-4 giữ hai nơi trùng nhau.
  - Ngoài-2 — ghi nhật ký `truong.doi-qua-chat` hỏng sau khi trường đã đổi thì công cụ ném lỗi dù việc đã xong.
  - Ngoài-3 — địa chỉ danh mục Gateway khai hai nơi; agent giữ danh mục 5 phút, API 30 phút, nên màn Cài đặt có thể báo chậm hơn chat.
  - Ngoài-4 — `ModelCatalogService.find` không còn ai gọi; chấp nhận, không sửa.
  - Ngoài-5 — tập `daGhi` của `model-phien.ts` giữ mọi mã phiên suốt đời tiến trình agent.
  - Ngoài-7 — cùng lớp với Ngoài-2: lỗi ghi nhật ký tạm thời biến việc đổi trường đã thành công thành lỗi, và mất dấu thay đổi đó.
  - Ngoài-8 — phiên không có hàng `model.phien-chon` thì `model.khong-tim-thay` lùi về model đã chọn ở Cài đặt, có thể không phải model phiên con đã chạy.
  - Ngoài-9 — E11 tự dựng `event.data.details` của `step.failed`, không lấy từ bên ghi của eve; eve đổi khuôn lỗi thì bài vẫn xanh.
  - Ngoài-10 — E5 chạy năm ô chọn tay, không quét cả ma trận vai × việc.
- Ngoài-6 (thẻ Cài đặt vẫn ghi tên model đã bị gỡ trong ô chọn và dòng chú thích khi hộp báo nói đang chạy mặc định) tách thành hợp đồng mới theo chủ kho 05/10.
