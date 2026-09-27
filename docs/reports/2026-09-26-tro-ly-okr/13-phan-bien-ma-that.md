# 13 — Phản biện 1: đối chiếu tài liệu 12 với mã thật

Ngày soát: 2026-09-26. Soát trọn `12-kien-truc-va-lo-trinh.md`, sau khi đọc trọn `09-soat-do-du.md`.
Mọi đường dẫn tính từ gốc kho, đã tự mở trong bản chụp `scratchpad/onehub` hoặc trong
`apps/agent/node_modules/eve/docs` (eve 0.29.4). Vài điểm về trạng thái các lượt đọc thêm trong
các cây làm việc `.claude/worktrees/*` (chỉ đọc) và `git log` chỉ đọc; chỗ
đó ghi rõ. Thứ tôi suy luận ghi «(suy luận)». Không sửa tài liệu gốc.

**Kết luận ngắn.** Phần lớn khẳng định về mã và eve trong 12 đứng được: 26 tool cộng
`tools/agent.ts`; 16 tool không kiểm purpose (tôi đếm lại, đúng 16); 4 skill; `agent_runner` tắt đúng
9 tool dựng sẵn và sandbox `deny-all`; hook của gốc không chạy trong subagent; ném lỗi trong hook
thành `turn.failed`; resolver model hỏng thì «degrade, never fail the turn»; `auth.current`/`initiator`
có thể `null` ở đường nội bộ; bảy tệp hãng mà bản rẽ chưa sửa đúng là chưa sửa. Không thấy API eve
bịa. Nhưng có **hai lỗ chặn** ở chính cam kết «gốc không bao giờ thấy chữ OKR» và «hỏng thì việc thất
bại», cùng **tám chỗ nên sửa** — phần lớn là mã thật không làm được như câu viết.

Mức: **chặn** = phải sửa trước khi dùng tài liệu làm căn cứ cho Cổng Đáng/1.5 · **nên sửa** = sai
hoặc thiếu làm lệch thiết kế · **nhỏ** = chính xác hoá.

---

## A. Chặn

### A1. Cột `reason` của `AgentTask` đưa chữ vào gốc — hợp đồng bỏ sót nó

- **Vị trí.** §4.3 «Hợp đồng giữa các tầng», dòng «API → hàng việc: Ghi `AgentTask{kind, subject, payload: okrTroLyViec, priority}`»; §4.5 bước «payload không có chữ OKR»; K1 «theo khuôn `onboardingMatchNeeded`»; §4.7 «gốc không bao giờ đọc chữ OKR».
- **Vấn đề.** `reason` là cột bắt buộc (`packages/db/prisma/schema.prisma`, model `AgentTask`: `reason String`). Nó đi vào gốc bằng ba đường:
  1. `taskAuth()` chép `reason: task.reason` vào thuộc tính phiên (`apps/agent/agent/lib/dispatch.ts`, hàm `taskAuth`);
  2. `brief()` nhánh `default` trả `` `Handle this: ${reason}` `` làm tin nhắn đầu của gốc (`apps/agent/agent/lib/dispatch.ts`, hàm `work`);
  3. nhánh mặc định của `apps/agent/agent/instructions/task.ts` đưa `reason` vào `sessionPreamble`.
  Khuôn mà K1 bảo chép, `onboardingMatchNeeded` (`apps/api/src/agent/agent-trigger.service.ts`), lại đặt **dữ liệu** vào `reason` («Lô từ nền tảng mang mã … không khớp cá nhân nào trong kế hoạch …»). Người viết mã làm theo khuôn đó sẽ đưa tên Mục tiêu vào `reason`, và chữ OKR tới model của gốc — model không có ZDR (xem A2 của chốt 1).
- **Sửa.** Thêm vào §4.3 và K1: «`reason` của mọi việc `okr-*` là một hằng cố định theo loại việc (ví dụ `"okr-de-xuat"`), đặt trong `TRO_LY_OKR`; `brief()` có nhánh riêng cho `okr-*` trả câu cố định; nhánh `okr` của `instructions/task.ts` đứng **trước** nhánh nghiên cứu và không gọi `sessionPreamble`.» Thêm vào bộ test cách ly tĩnh (§4.11): «mọi hàng `okr-*` do `tro-ly.service.ts` và `lib/okr/lich.ts` ghi có `reason` thuộc tập hằng».

### A2. Việc hỏng không đóng, bị thử lại tới ba lần, và kết quả mã không được ghi ở đâu

- **Vị trí.** §0 «Hỏng thì việc thất bại»; §4.3 `ketQuaTroLy`; §4.5 «G-->>DB: đóng việc»; §4.9 thước «Tỷ lệ không làm được»; §4.11 eval «Uỷ quyền: … việc kết thúc có lý do»; §4.10 dòng «Trần mỗi phiên con … Cần đo ở N0».
- **Vấn đề.**
  1. Kênh `crm` khi nhận `turn.failed` chỉ `settle` bản ghi liên quan; **không** gọi `completeTask` (`apps/agent/agent/channels/crm.ts`, `crmEvents["turn.failed"]`). Việc chỉ đóng ở `session.waiting`/`session.completed`, với outcome cố định `"ran"` (`closeTask(channel.continuationToken, "ran")`). Vậy hook `okr-uy-quyen` ném lỗi thì việc hoặc đóng là «ran» (mất lý do), hoặc nằm chờ hết lease.
  2. Lease làn nghiên cứu là 30 phút và thử tối đa 3 lần (`apps/agent/agent/lib/dispatch-config.ts` `research.leaseMs: 30 * MINUTE_MS`; `packages/db/src/agent-tasks.ts` `MAX_ATTEMPTS = 3`). Một việc đề xuất hỏng có thể mở thêm hai phiên nữa sau 30 và 60 phút — tốn tiền, và đề xuất tới khi người đã rời hộp thoại.
  3. `ketQuaTroLy.trangThai`/`maLoi` về gốc rồi dừng ở đó: không bảng nào nhận. Thước «Tỷ lệ không làm được» và cờ `dangSoan` không có nguồn.
  4. Phiên nghiên cứu gửi qua kênh `crm` **không** có `mode: "task"` (`apps/agent/agent/channels/crm.ts`, `POST("/internal/crm/dispatch")`), trong khi lượt Tác nhân có (`apps/agent/agent/lib/custom-agent-dispatch.ts`, `send(..., { mode: "task" })`). Theo `agent-config.md` §Runtime limits, chỉ phiên không tới được người («task-mode runs … and subagents without input proxying») mới thất bại gọn bằng `SESSION_TOKEN_LIMIT_REACHED`; subagent có proxy thì lời hỏi Approve được đẩy lên kênh cha — kênh `crm` không có người, nên treo (suy luận, khớp với điểm N0 mà 12 tự nêu).
- **Sửa.** Đổi «Cần đo ở N0» thành quyết định có sẵn tiền lệ, ghi vào K2/K4:
  «Việc `okr-*` được gửi với `mode: "task"` như lượt Tác nhân (`lib/custom-agent-dispatch.ts`). `turn.failed` của việc `okr-*` gọi `completeTask` với lý do, không để hết lease. Việc `okr-*` không được thử lại: `attempts` tối đa 1 (hằng trong `TRO_LY_OKR`). Kết quả `ketQuaTroLy` được ghi vào `AgentTask.outcome` bởi hook ở gốc nghe `action.result` loại `subagent-result` của `tro_ly_okr` (khuôn `toolResultFrom`, `eve/docs/guides/hooks.md` §Narrowing tool results); `okr.troLyDanhSach` đọc `finishedAt`/`outcome` để hạ cờ `dangSoan`.»
  Điểm 6 của N0 giữ lại, nhưng chỉ để xác nhận hành vi dưới `mode: "task"`.

---

## B. Nên sửa

### B1. «`troLyQuyet` gọi `OkrService` trong cùng giao dịch» — mã hôm nay không cho

- **Vị trí.** §4.9 bảng «Luật của sổ đề xuất», dòng «Nhận thì ghi qua đường có quyền».
- **Vấn đề.** `updateObjective`, `updateKeyResult`, `addAlignment` mỗi hàm tự mở `this.db.$transaction(...)` và không nhận `tx` (`apps/api/src/okr/okr.service.ts`). Prisma không lồng giao dịch tương tác. Muốn «cùng giao dịch» thì phải đổi chữ ký ba hàm đó. Thêm nữa, ghi `nguon: "tro-ly"` vào `OkrTrail.after` buộc `OkrService` nhận thêm một tham số, vì `vet()` được gọi bên trong hàm.
- **Sửa.** Thay câu bằng: «`troLyQuyet` gọi `OkrService` qua một biến thể nhận `tx` (tách thân `updateObjective`, `updateKeyResult`, `addAlignment` thành hàm `…Trong(tx, …)`, hàm cũ gọi lại hàm mới), rồi đổi `OkrDeXuat.trangThai` bằng cập nhật có điều kiện `trangThai = 'cho'` trong cùng `tx`. Đây là sửa trong `apps/api/src/okr`, tính vào phạm vi 9b.» Ghi nguồn vào cột `note` sẵn có của `OkrTrail` thay vì trộn vào `after` (xem C5).

### B2. Lọc tóm tắt theo người xem đặt ở «trang máy chủ» là vòng qua `okr.router`

- **Vị trí.** §4.6 bước «M->>DB: trang máy chủ đọc OkrTomTat, chạy lại bộ kiểm…, lọc câu theo người xem»; §4.7 hàng «Người nhận: … Trang máy chủ chỉ giữ câu nào…».
- **Vấn đề.** Trang OKR của `apps/app` không đọc DB: chúng gọi tRPC phía máy chủ (`apps/app/app/(app)/[slug]/okr/page.tsx`: `getServerTrpc()`, `trpc.okr.*`). Đọc `OkrTomTat` thẳng từ trang sẽ bỏ qua `PhamViOkrMiddleware` và `OkrAccessService`, và kéo `@crm/db` vào `apps/app`. Chính §4.3 lại ghi đúng: `okr.troLyTomTat` trả câu đã lọc. Hai chỗ mâu thuẫn nhau.
- **Sửa.** §4.6: «M->>API: `okr.troLyTomTat` (dưới `PhamViOkrMiddleware`) đọc `OkrTomTat`, chạy lại bộ kiểm với số hiện tại, lọc câu theo người xem, trả câu kèm trích dẫn; trang chỉ vẽ.» §4.7 đổi «Trang máy chủ» thành «Thủ tục `okr.troLyTomTat`».

### B3. «Gửi kèm lượt 5» đã muộn: luật «đáng bàn» nằm trong `apps/api`

- **Vị trí.** §6.1 mục 2, §6.3 bảng «Gửi kèm các lượt 5–8» dòng lượt 5 («Luật chọn đáng bàn … là hàm thuần trong `packages/validation`»; «Chi phí gần bằng không»).
- **Vấn đề.** Hợp đồng lượt 5 đã ở `status: implemented` (`.claude/worktrees/toan-canh-okr/_acceptance/toan-canh-okr/contract.md`, chỉ đọc), và luật đã viết ở `apps/api/src/okr/hop-tuan.ts` (`lyDoCua`, 172 dòng, nhập `@crm/db/okr-nhac`, `@crm/db/onboarding-nhac`) trong cây đó. Tác nhân không nhập được `apps/api`. Như vậy việc dời là việc có thật, không phải «chọn chỗ đặt».
- **Sửa.** Bỏ dòng lượt 5 khỏi bảng «Gửi kèm». Thêm vào phạm vi 9c: «Dời `lyDoCua` và kiểu `LanCapNhat`/`KrSo` từ `apps/api/src/okr/hop-tuan.ts` xuống gói dùng chung, không đổi hành vi, có test so kết quả trước và sau.» Tương tự, kiểm lại lượt 4 (`.claude/worktrees/cap-nhat-tuan-okr`, bảng `OkrCheckIn`, `@crm/validation/okr-cap-nhat`) trước khi viết «Gửi kèm».

### B4. 9c cần đổi `schema.prisma`, nên không còn là T2

- **Vị trí.** §6.3 lượt 9c (T2): «nút hữu ích / không»; §4.12 «Người nhận tắt được dòng AI»; §4.9 thước «Nhịp tuần còn khoẻ … tỷ lệ tắt dòng AI».
- **Vấn đề.** Không chỗ nào lưu được hai thứ đó: `OkrTomTat` trong phác §4.3 không có cột phản hồi; `NotificationPreference` chỉ có `userId`, `channel` (`packages/db/prisma/schema.prisma`). Thêm cột là chạm `packages/db/prisma`, tức T3 theo luật lộ trình (`docs/plan/lo-trinh-okr.md` §2).
- **Sửa.** Đưa vào migration của 9a: «bảng `OkrTomTatPhanHoi(tomTatId, userId, huuIch Boolean, luc)` và cột `NotificationPreference.dongAi Boolean @default(true)`», để 9b, 9c giữ T2. Ghi thêm dòng này vào §4.3 «Bảng (phác)».

### B5. Hai con số chi phí trong quyết định chính không khớp phép tính của chính 12

- **Vị trí.** §0 và §9.1 «$8 … đủ cho tháng đặt OKR khi trúng cache»; §4.10 «đề xuất bị trần chặn ở khoảng 350–650 lượt mỗi tháng».
- **Vấn đề.** Dùng đúng số của §4.10 (kịch bản vừa: G = 500, M = 40, f = 0,8):
  - 60% trúng cache, gốc không đổi model: 500 × $0,013 + 40 × 4,3 × 0,8 × $0,014 = $6,50 + $1,93 = **$8,43 > $8**. «Đủ» chỉ đúng khi cộng thêm dùng lại theo `inputHash` hoặc nấc 2.
  - 350–650 lượt là $8 chia thẳng cho c_dx ($8/$0,024 ≈ 333; $8/$0,013 ≈ 615), **bỏ qua phần giữ chỗ cho tóm tắt** mà chính §4.10 bắt buộc. Trừ phần tóm tắt: ($8 − $3,58)/$0,024 ≈ **184** và ($8 − $1,93)/$0,013 ≈ **467** lượt.
  - Cận dưới của bảng kịch bản không tái lập được: vừa ra $6,51 (bảng ghi $6,3); lớn ra $18,0 (bảng ghi $17).
- **Sửa.** §9.1: «$8 đủ cho kịch bản vừa ở tháng thường ($2,4–6,0). Trong tháng đặt OKR, $8 chỉ đủ khi vừa trúng cache vừa dùng lại kết quả theo `inputHash`, hoặc khi đã làm nấc 2; không thì đề xuất tạm nghỉ sau khoảng 180–470 lượt.» Sửa câu «350–650» thành «184–467 lượt, sau khi giữ chỗ cho tóm tắt». Ghi rõ giá model rẻ giả định cho nấc 2, hoặc sửa cận dưới.

### B6. Chữ «trợ lý» đứng một mình trên nút — từ điển cấm đúng việc này

- **Vị trí.** §4.4, §4.5, §6.3 9b: nút «Nhờ trợ lý góp ý»; mục «Về chữ»: đề xuất «Trợ lý OKR».
- **Vấn đề.** `CONTEXT.md` mục **Trợ lý AI**: «"trợ lý" một mình thì lẫn với hai thứ kia — luôn viết đủ "trợ lý AI"». Mục **Tác nhân** và **Bot Zalo** đều đặt «trợ lý» vào `_Avoid_`. «Trợ lý OKR» còn đứng sát «Trợ lý AI», thứ mà vai «chỉ OKR» không gọi được — người vai đó thấy nút «trợ lý» sẽ không biết mình được dùng cái nào.
- **Sửa.** Nhãn nút mang đủ tên, ví dụ «Nhờ Trợ lý OKR góp ý». Mục từ điển mới «Trợ lý OKR» phải ghi dòng «Khác **Trợ lý AI** …» và `_Avoid_: trợ lý` (một mình). Đưa việc này lên Cổng Đáng 9a, không để tới «trước màn đầu tiên».

### B7. 9b đổi chân đứng so với lộ trình mà không ghi là chỗ lệch

- **Vị trí.** §6.3 9b «Đứng trên: Lượt 3»; §6.6 «9b … chỉ đứng trên lượt 3».
- **Vấn đề.** `docs/plan/lo-trinh-okr.md` §3 ghi lượt 9 đứng trên **lượt 4, 7**. 12 chỉ khai lệch hạng (T2→T3) ở §6.1 và §9.2 dòng 1, không khai lệch chân đứng. Đây chính là lý do «9b kịp 07/12» nên phải được chủ kho thấy.
- **Sửa.** Thêm dòng vào §9.2: «14 · Chân đứng của 9b · Lượt 3 (và luật lượt 7 nếu đã lên), lệch lộ trình vốn ghi lượt 4, 7 · Viết lại và Căn chỉnh không cần Cập nhật tuần · Veto thì 9b đợi lượt 4 gộp.»

### B8. Kết quả lỗi của subagent có thể mang chữ OKR về model của gốc (suy luận)

- **Vị trí.** §4.1 chốt 1 «Kết quả subagent trả về gốc chỉ là mã»; R3 ở §8.1.
- **Vấn đề.** `outputSchema` chỉ ràng buộc đường thành công. Khi subagent hết lượt thử model, hết trần token, hay trả đầu ra sai khuôn, eve trả về «one failed task result» (`subagents.mdx` §What the parent sees). Tài liệu không nói nội dung lỗi đó có chép lại đầu ra sai khuôn hay không. Model của gốc là model của `AppSetting`, mặc định `zai/glm-5.2-fast` (`packages/db/src/settings.ts`), không có ZDR (xem C2).
- **Sửa.** Thêm vào N0 điểm 6: «ép subagent trả đầu ra sai khuôn và vượt trần, đọc `action.result` của `tro_ly_okr` trong `AgentEvent` của gốc, xác nhận không có chữ nào ngoài mã». Nếu có, hook `okr-uy-quyen` phải kết thúc lượt ngay khi thấy `subagent-result` lỗi, trước bước model kế tiếp.

---

## C. Nhỏ

| # | Vị trí | Vấn đề | Bằng chứng | Sửa |
|---|---|---|---|---|
| C1 | §3.2 ý 2 «Khuôn subagent đã chạy thật (`agent_runner`) … có nhánh từ chối hợp lệ. Trợ lý OKR chép khuôn này» | Nhánh từ chối (`not_authorized`) là của `agent_builder`. `agent_runner` trả `{summary, result}` và **chọn model động** — đúng thứ chốt 2 cấm | `apps/agent/agent/subagents/agent_runner/agent.ts`; `apps/agent/agent/subagents/agent_builder/agent.ts` (`BUILDER_STATUS.notAuthorized`) | «Chép phần tắt tool và sandbox của `agent_runner`, nhánh từ chối của `agent_builder`; **không** chép `defineDynamic` model của `agent_runner`» |
| C2 | §3.1 hàng Agent; §4.1 chốt 1 «đọc hỏng thì rơi về `zai/glm-5.2-fast`» | Gốc chạy `zai/glm-5.2-fast` cả khi hàng cài đặt **trống**, không chỉ khi đọc hỏng | `packages/db/src/settings.ts` (`readAgentModel` trả `isDefault: true`); `apps/agent/agent/lib/model.ts` trả `null`; `docs/agent.md` §Model «Default `zai/glm-5.2-fast`» | «Model của gốc là `AppSetting.agentModelId`; trống hoặc đọc hỏng thì là `zai/glm-5.2-fast`». Bảng chi phí §4.10 ghi rõ giá gốc là giá của model đang đặt |
| C3 | §4.2 K6; §6.3 9a mục 1 «Dời `tien-do.ts` xuống `packages/db/src/okr-tien-do.ts`, theo tiền lệ `onboarding-buoc`» | `datBuocXong` là hàm **ghi DB** (async, `Prisma.InputJsonValue`), còn `tien-do.ts` là hàm thuần. Hàm thuần cùng loại đã ở `packages/validation/src/okr-kr.ts` (`tienDoKr`) và `okr-muc-tieu.ts` (`tinhTrang`). Tệp mới cũng phải khai `exports` | `packages/db/src/onboarding-buoc.ts`; `apps/api/src/okr/tien-do.ts` (chỉ nhập `soNgayVN`); `packages/db/package.json` `exports` | Hoặc đặt ở `packages/validation/src/okr-tien-do.ts` và dời `soNgayVN` theo, hoặc giữ `@crm/db` nhưng đổi lý do («cần `soNgayVN` của `@crm/db/onboarding-nhac`»). Ghi thêm dòng khai `exports` cho `okr-tien-do`, `ai-chi-phi`, `okr-tro-ly`, `okr-kiem-tro-ly` |
| C4 | §3.1 hàng UI «`Suggestion` chỉ có `value`, `rationale`, `onAccept`, `onDismiss`»; §4.12 «`Shimmer` có sẵn» | Còn prop `pending`. `suggestion` trong sổ AI Elements (gợi ý câu hỏi bấm được) là thứ khác `packages/ui/src/components/suggestion.tsx`. Có hai `Shimmer`; bản `ai-elements/` thuộc hội thoại | `packages/ui/src/components/suggestion.tsx`; `docs/chat-ui.md` («Clickable prompt starters | `Suggestions` + `Suggestion`»); `packages/ui/src/components/shimmer.tsx` và `ai-elements/shimmer.tsx` | Ghi đủ prop; tách hai «Suggestion»; chỉ định `packages/ui/src/components/shimmer.tsx` cho danh sách đề xuất |
| C5 | §4.3 dòng «Người → dữ liệu OKR: `OkrTrail.after` thêm `nguon: "tro-ly"` và `deXuatId`» | `after` là ảnh chụp trường đã đổi; màn Vết chỉ vẽ các khoá trong `KHOA_HIEN`, nên `nguon` không tự hiện. `OkrTrail` đã có cột `note` | `packages/validation/src/okr-vet.ts`; `apps/app/app/(app)/[slug]/okr/bang-vet.tsx` (`thayDoi`); `packages/db/prisma/schema.prisma` `OkrTrail.note` | Ghi «theo đề xuất của Trợ lý OKR · `deXuatId`» vào `note`; màn Vết đọc `note` |
| C6 | §4.3, K8 | `docs/api.md` §OKR: «Every write leaves one `OkrTrail` row». Tool nộp ghi `OkrDeXuat`/`OkrTomTat` không kèm vết | `docs/api.md` §OKR | Ghi rõ hai bảng này nằm ngoài luật vết (không phải bản ghi OKR), và thêm câu đó vào `docs/api.md` §OKR trong 9a |
| C7 | §4.2 K3 «Mỗi nhịp dispatch, xếp việc cho phòng ban…» | `docs/agent.md` §Budget and scheduling: «`schedules/dispatch.ts` is the only schedule and decides nothing… belongs in a `dueAt`». Có tiền lệ lệch của bản rẽ: `lenLichNhac()` | `docs/agent.md`; `apps/agent/agent/schedules/dispatch.ts` | Nêu luật và tiền lệ `lenLichNhac`, hoặc làm theo luật: mỗi việc tóm tắt khi đóng tự đặt việc tuần sau với `dueAt` |
| C8 | §4.10 «Hook ở gốc … `research` → `crm.nghien-cuu`» | Phiên chat của tab Agent đi qua cầu nối **không** mang `purpose`, nên rơi về `research` và sẽ bị tính là «nghiên cứu» | `apps/agent/agent/lib/session-purpose.ts` (`.catch("research")`); chỉ `custom-agent-dispatch.ts` đặt `purpose` | Tách theo `ctx.channel.kind` (`crm` hay `eve`) trước khi theo purpose; `tinhNang` là một enum trong `packages/validation` |
| C9 | §4.3 khuôn và bảng | Thiếu enum cho `OkrDeXuat.trangThai` (`cho`/`nhan`/`sua`/`bac`/`het-han`) và cho cột AI mới của `OkrProgramConfig`; chưa nhắc sửa `okrProgram`/`OKR_PROGRAM_MAC_DINH`. Số ma trong khuôn (200, 280, 8, 6). `sau.max(200)` không viết lại được «vì sao lúc này» dài 201–500 ký tự | `docs/api.md` §OKR («Categories are Zod enums in `packages/validation`»); `packages/validation/src/okr-chuong-trinh.ts`; `apps/api/src/okr/okr-config.ts` (`ten.viSao: 500`, `mucTieuToiDa: 200`) | Thêm hai enum vào `okr-tro-ly.ts`; K10 thêm `okr-chuong-trinh.ts`; trần chữ đọc từ `TRO_LY_OKR_TRAN`, riêng theo trường |
| C10 | §4.2 K1, §4.4 «dùng lại theo `inputHash`» | API tính băm trên gì? Gói của tác nhân gồm cả cấu hình chương trình, đề xuất đã bác, kết quả luật lượt 7; băm lệch thì dùng lại kết quả cũ sai | — (suy luận) | Một hàm băm duy nhất ở `packages/validation/src/okr-tro-ly.ts`, nhận đúng các trường của gói; API và tác nhân cùng gọi |
| C11 | §4.3 `OkrTomTat @@unique([departmentId, tuan])` | Khuôn việc mang `cycleId`, và chu kỳ năm với chu kỳ quý chạy chồng nhau (`OkrCycle.parentId`) | `packages/db/prisma/schema.prisma` `OkrCycle`, `OkrObjective.cycleId` | `@@unique([cycleId, departmentId, tuan])`, hoặc nói rõ tóm tắt gộp mọi chu kỳ đang chạy |
| C12 | §4.9 «Bác rồi không mời lại» | Khoá chặn chỉ định nghĩa cho `viet-lai` (trường, câu chuẩn hoá). Dòng `hoi` và `can-chinh` chưa có khoá | `apps/agent/agent/lib/facts.ts` (khớp đúng giá trị) | Khoá `hoi` = (objectiveId, keyResultId, maVanDe); `can-chinh` = (objectiveId, đích) |
| C13 | §4.2 K2 «`subject` dùng để chống trùng» | Khuôn `enqueue` chống trùng bằng khoá tư vấn cộng so đường dẫn trong `payload`, không dùng cột `subject`. Cột đó chỉ có chỉ mục duy nhất cho `nhac-ke-hoach` | `apps/api/src/agent/agent-trigger.service.ts` (`enqueue`, `lockIdempotencyKey`); `schema.prisma` `agentTask_nhac_mot_ngay` | «Chống trùng bằng `enqueue(… subject: [{path:["objectiveId"],…}])` của `AgentTriggerService`» |
| C14 | §6.3 N0 điểm 7 «tìm phiên con qua `subagent.called.data.childSessionId`»; §3.1 «Các phiên khác để usage trong `AgentEvent.data`» | Chỉ phiên gốc có trong `AgentEvent`: hook `audit.ts` không chạy trong subagent, và `agent_runner` không có hook. Truy vấn DB tìm được id phiên con nhưng không cộng được tiền của nó | `apps/agent/agent/hooks/audit.ts`; `eve/docs/guides/hooks.md` §Subagent isolation | «Tiền phiên con chỉ đọc được qua `GET /eve/v1/session/:childSessionId/stream`; trong DB thì không» |
| C15 | Lộ trình N0 điểm 8; §8.1 R12 «Không tệp mã nào của hãng bị chạm lần đầu» | Vá lối rò Slack chạm `lib/run-runtime.ts` và `lib/approval.ts`, hai tệp bản rẽ chưa từng sửa. Vá tại chỗ trước khi hãng gộp là chạm lần đầu | `git diff --stat origin/release origin/onehub` (không có hai tệp đó) | Ghi: «gửi lên hãng trước; chỉ vá tại chỗ nếu tới 26/10 hãng chưa gộp, và ghi thành chỗ rẽ có tên» |
| C16 | §4.11 «Judge … thuộc họ model khác Gemini; eve không bao giờ dùng model đang bị chấm làm judge» | eve chỉ nói judge «resolved separately» và «never the model under test» về vai trò; chọn họ khác là luật của mình | `eve/docs/evals/judge.mdx` | Tách hai ý: «eve phân giải judge riêng; **ta** chọn họ model khác Gemini» |
| C17 | Nhãn [git] đầu tài liệu; §3.1 «Trạng thái các lượt» | `origin/onehub` nay là `e394b581` (26/09 12:17, gộp #152 `khoa-api-ghi-thua`). Hợp đồng lượt 4 và lượt 5 đều đã `implemented` trong cây làm việc riêng, chưa gộp | `git log -1 origin/onehub`; `.claude/worktrees/{cap-nhat-tuan-okr,toan-canh-okr}/_acceptance/*/contract.md` | Cập nhật đầu nhánh và trạng thái; #152 xác nhận khoá API tắt rate limit, nên trần theo người ở router (§4.7 ý 4) là bắt buộc |

---

## D. Những gì đã kiểm và đứng được

- `apps/agent/agent/tools/`: 27 tệp = 26 tool + `agent.ts` (`disableTool`). 16 tool không gọi `purposeOf`/`assert…Purpose`/`require…Attribute` — tôi đếm lại, khớp 06.
- `apps/agent/agent/skills/`: đúng 4 skill. `apps/agent/evals/`: một eval, `evals.config.ts` không khai judge.
- `agent_runner`: 9 `disableTool` (bash, glob, grep, read_file, todo, web_fetch, web_search, write_file, ask_question), sandbox `deny-all`, `outputSchema`, không có `hooks/`. So với `concepts/default-harness.md`, đó là mọi tool dựng sẵn một subagent không có skill hay connection nhận được (`agent` là của gốc).
- `session-purpose.ts`: ba giá trị, giá trị lạ rơi về `research`. `app-auth.ts`: `eve:app`. `taskAuth`, `brief`, `runResearchLane` có thật.
- `PRIORITY.workspace = 500` là cao nhất trong các loại của làn nghiên cứu. `claimDue` xếp theo `priority DESC`.
- `hooks/builder-delegation.ts` chặn bằng cách ném lỗi ở `actions.requested` — tiền lệ cho `okr-uy-quyen` đứng được. `hooks/activity.ts` đọc `usage.cacheReadTokens`, `usage.costUsd` của `step.completed`.
- eve: hook ném → `turn.failed` (`guides/hooks.md`); hook của cha không chạy trong subagent; `meta.id` bền cho lần đọc lại. `agent-config.md`: bỏ trống `modelOptions` thì dùng lại cấp agent; resolver hỏng thì rơi về `fallback`; `reasoning` có sẵn; `limits` của con chỉ áp khi chặt hơn phần cha cấp. `subagents.mdx`: subagent không thừa kế gì và thành tool trong mọi phiên cha. `guides/auth-and-route-protection.md`: `auth.*` có thể `null` trên đường nội bộ. `defineRemoteAgent`, skill tĩnh không cần sandbox, `botToken` dạng hàm: đều có.
- Luật kho: `PhamViOkrMiddleware` trên `okr.router`, `restMeta` có thật; `OkrAccessService` phụ thuộc Nest (`ToChucService`, `@crm/auth`); `HANH_DONG_VET` có 13 hành động; `okrVetSnapshot` nhận chuỗi; `OkrCycle.updateWeekday @default(1)`; `NHAC.gio` 8:30, `tran: 10`; `ZALO.tranKyTu: 2_000`; `ngayLich` có ở `okr-chu-ky.ts`; `docKeHoach` chưa export; `canReachAgent()` có. Không có pgvector/tsvector/pg_trgm.
- `git diff --stat origin/release origin/onehub`: `agent.ts`, `lib/model.ts`, `hooks/audit.ts`, `lib/approval.ts`, `lib/run-runtime.ts`, `evals/evals.config.ts`, `skills/data-boundaries.md` đúng là bản rẽ chưa sửa.
- Không thấy khối nào đặt trí khôn trong API: K1 chỉ kiểm quyền, công tắc, trần rồi ghi `AgentTask`. Không thấy client component nhập gói server. Tác nhân chỉ ghi hai bảng đầu ra; mọi lần ghi Mục tiêu hay KR đi qua `OkrService` (trừ chỗ «cùng giao dịch» ở B1).
