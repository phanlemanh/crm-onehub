# 11 — Giám khảo độc lập, lăng kính 1: khớp kho và bảo trì

Viết 2026-09-26. Chỉ chấm theo một lăng kính: phương án có khớp luật kho không, có
chạy thật được trên eve 0.29.4 không, bản rẽ phình tới đâu, phải qua bao nhiêu lượt
T3, một người cộng các phiên AI có gánh nổi không, dùng lại được bao nhiêu thứ đã có,
và mở sang miền thứ hai có thật hay chỉ trên giấy. Lăng kính sản phẩm và chi phí
không chấm ở đây.

**Nhãn**

- **[mã]**: tôi tự đọc trong bản chụp `scratchpad/onehub`. Đường dẫn tính từ gốc kho.
- **[eve]**: tôi tự đọc trong `apps/agent/node_modules/eve/docs` (eve `0.29.4`, đã
  kiểm `package.json`). Đường dẫn tính từ thư mục `docs/`.
- **[git]**: tôi tự chạy `git diff --stat origin/release origin/onehub` (chỉ đọc)
  trong kho crm. Đầu `origin/onehub` là `46d7d3d7`, đầu
  `origin/release` là `6d4793dd`.
- **(suy luận)**: kết luận của tôi, chưa chạy thử.

**Đã đọc:** trọn `09-soat-do-du.md`; trọn ba phương án `10-phuong-an-A.md`, `B`, `C`;
luật kho `AGENTS.md`, `CLAUDE.md`; mục lượt 9–10 và nguyên tắc chia lượt của
`docs/plan/lo-trinh-okr.md`; các mục «Gợi ý», «Trợ lý AI» của `CONTEXT.md`.

---

## 0. Kết luận một màn

| Phương án | Điểm (lăng kính này) | Một câu |
|---|---|---|
| **A** Dọc OKR trước | **7,5** | Bản rẽ gần như không phình thêm; dựa trên cách ly subagent, thứ eve cam kết rõ nhất và kho đã chạy thật. Cái giá là mỗi lượt tốn hai phiên, và mở sang miền thứ hai phải trả thêm một lượt T3 cho mỗi miền cho tới khi rút khung. |
| **B** Nền năng lực khai báo | **6,5** | Mở sang miền thứ hai tốt nhất và rẻ nhất mỗi lượt. Nhưng ranh vai «chỉ OKR» đặt cược vào một câu tài liệu eve chưa ai chạy thử. Nó còn chèn một lượt T3 mới vào tháng 10, giữa lúc cả công ty bắt đầu dùng OKR. |
| **C** Đồng đội trên khung Tác nhân | **4,5** | Soi mã sâu nhất và tìm ra lỗi thật. Nhưng chọn khung Tác nhân của hãng (CMP-1, mới 07/08) làm đơn vị mở rộng thì phí bản rẽ cao nhất: 7 tệp của hãng bản rẽ chưa từng chạm, và cột `AgentVersion.manifest` của hãng chứa khuôn mà khuôn của hãng không mô tả. Đây cũng là phương án nặng nhất cho một người trước 18/12. |

**Khuyến nghị:** lấy **A** làm nền. Ghép phép thử «stub cùng tên ở gốc» của B/C
thành một phép đo ở gia số 0; kết quả của nó quyết đường đi của lượt 10. Ghép thêm
các lưới nhỏ của B và C (mục 5). Bỏ lớp đăng ký năng lực của B và việc dựa lên khung
Tác nhân của C.

---

## 1. Kiểm các khẳng định quan trọng

### 1.1 Về eve 0.29.4

| # | Khẳng định | Của | Kết quả kiểm | Căn cứ |
|---|---|---|---|---|
| V1 | Tool động trùng tên với tool **tự viết** thì đè lên nó, theo từng người gọi | B E1, C 4.1 | **Đúng theo tài liệu.** Câu gốc: «A dynamic tool or skill whose name matches an **authored** one **overrides** it — a per-caller resolver can replace a built-in by name.» 09 G11 chỉ nói «không gỡ được». B và C dùng chữ «thay bằng stub», không phải «gỡ», nên không trái 09. **Chưa ai chạy thử.** Tài liệu cũng không nói gì khi resolver tool ném lỗi (với model thì có câu «failures degrade») | [eve] `guides/dynamic-capabilities.md` §Conflicts (dòng 69), §Dynamic models |
| V2 | `execute` của tool động phải viết tại chỗ, không thì không sống qua lần chạy lại | C | Đúng | [eve] `guides/dynamic-capabilities.md` §`execute` must be an inline function |
| V3 | Subagent khai báo không thừa kế gì từ gốc: tool, skill, hook, sandbox | A, B E3, C | Đúng | [eve] `subagents.mdx` dòng 64–84 |
| V4 | Hook của gốc không chạy trong lượt của subagent | A, B E4, C | Đúng. `subagents/agent_runner/` không có thư mục `hooks/` [mã]. Vì vậy `AgentRun.costUsd` (do `persistRunEvent` trong `apps/agent/agent/hooks/audit.ts` cộng) gần như chắc chắn **bỏ sót** chi phí phần việc thật của tác nhân (suy luận mạnh; A và C cùng thấy) | [eve] `guides/hooks.md` §Subagent isolation; [mã] `apps/agent/agent/hooks/audit.ts` dòng 61, 157–177 |
| V5 | Subagent đọc được thuộc tính auth của phiên cha | B E11 (ghi là sự thật) | **Chưa chứng minh được.** Tài liệu eve nói `auth.current` và `auth.initiator` «are `null` only on internal runtime paths (subagents, for instance)». Kho *dựa vào* điều ngược lại: `agent_runner` đọc `purposeOf(ctx)` trong bộ chọn model và `requireTeamAgentAttribute` trong mọi tool. A ghi rõ đây là phép đo bắt buộc ở gia số 0; B trình bày như đã kiểm | [eve] `guides/auth-and-route-protection.md` dòng 250; [mã] `apps/agent/agent/subagents/agent_runner/agent.ts`, `tools/finish_run.ts` |
| V6 | Skill động cần sandbox, skill tĩnh thì không | cả ba | Đúng | [eve] `skills.mdx` dòng 12 |
| V7 | Chọn model ở `session.started` trả được `{ model, modelContextWindowTokens?, modelOptions? }`; ở phiên hay lượt thì phải là chuỗi id | cả ba | Đúng. Thêm: agent có trường `reasoning` (`"none"`…`"xhigh"`), và `modelOptions` đặt tĩnh ở cấp agent được, nên subagent của A đặt tĩnh được cả hai | [eve] `agent-config.md` dòng 70–105 |
| V8 | Subagent nhận một phần hạn mức còn lại của cha; giới hạn tự viết chỉ áp khi chặt hơn | A, B E7 | Đúng | [eve] `agent-config.md` dòng 172–180 |
| V9 | Mỗi subagent khai báo hiện thành một tool trong phiên gốc | (không ai nói rõ) | Đúng, và **A bỏ sót hệ quả**: `tro_ly_okr` sẽ hiện trong mọi phiên gốc (nghiên cứu, hội thoại dựng tác nhân), không chỉ phiên `okr`. Phải có chốt như `requireTeamAgentAttribute`: vắng `purpose=okr` hay `okrTaskId` thì tool nộp từ chối | [eve] `subagents.mdx` dòng 88, 94 |
| V10 | Hook ném lỗi ở `actions.requested` làm lượt thất bại | A | Đúng: «A thrown handler … surfaces as `turn.failed`». Khuôn trong kho là `hooks/builder-delegation.ts`; `docs/agent.md` dòng 493 | [eve] `guides/hooks.md`; [mã] |
| V11 | `gemini-3.7-flash` là model có suy nghĩ; không khoá thì chi phí gấp khoảng ba | C | **Không kiểm được.** C dẫn «NC-08», nhưng 08 không có chữ «reasoning» nào. Dù vậy, đặt `reasoning` tường minh là việc rẻ và nên làm (V7) | `08-ma-du-lieu-quyen-chi-phi.md` |

### 1.2 Về mã

| # | Khẳng định | Của | Kết quả | Căn cứ |
|---|---|---|---|---|
| M1 | Purpose lạ rơi về `research` | B, C | Đúng: `z.enum(SESSION_PURPOSES).catch("research")` | [mã] `apps/agent/agent/lib/session-purpose.ts` |
| M2 | Lượt tác nhân chạy bằng danh tính người dựng; mỗi tác nhân chỉ một lượt RUNNING | C | Đúng: `principalId = run.initiatedById ?? run.agent.createdById`, `authenticator: "crm-schedule"`. `pendingAgentRunIds` bỏ qua tác nhân đang có lượt `RUNNING`/`WAITING_FOR_APPROVAL` | [mã] `apps/agent/agent/lib/custom-agent-dispatch.ts` dòng 377–409, 498–511 |
| M3 | `recordScope === "WORKSPACE"` trả toàn bộ kết quả tìm kiếm | C | Đúng | [mã] `apps/agent/agent/lib/run-runtime.ts` dòng 178 |
| M4 | Gửi Slack của tác nhân chỉ kiểm đích đã duyệt, không kiểm thành viên kênh | C | Đúng với `approvedSlackDestination`. Lượt 2 để kênh nội bộ ngoài phạm vi | [mã] `run-runtime.ts` dòng 378–395, 1024–1056; `_acceptance/vai-chi-okr/contract.md` dòng 71 |
| M5 | `isAutomated` chỉ nhận đúng `APP_AUTH` | C | Đúng | [mã] `apps/agent/agent/lib/approval.ts` |
| M6 | Khuôn subagent có sẵn: tắt tool dựng sẵn, sandbox deny-all, `outputSchema` object | A | Đúng: 10 tệp `disableTool()` và `sandbox/sandbox.ts` deny-all trong `agent_runner` | [mã] `apps/agent/agent/subagents/agent_runner/{tools,sandbox}` |
| M7 | Luật «đã bác thì không mời lại» ở đường ghi | A, B | Đúng | [mã] `apps/agent/agent/lib/facts.ts` dòng 120–132 |
| M8 | Kênh `crm` gửi hàng nghiên cứu không có `mode: "task"`, còn tác nhân có | (không ai nói rõ) | Đúng. Vì vậy phiên gốc của B không phải phiên task mode: khi vượt trần token, nó sẽ **dừng chờ Approve/Stop** chứ không «thất bại» như B E7 viết cho trường hợp này (suy luận từ tài liệu) | [mã] `apps/agent/agent/channels/crm.ts` dòng 308–311; `custom-agent-dispatch.ts` dòng 506; [eve] `agent-config.md` dòng 160–163 |
| M9 | «Ngay gia số 0 đã có số thật» cho hội thoại dựng tác nhân và tác nhân nhóm | B §6.1 | **Sai một nửa.** Hook mới đặt ở gốc không thấy các bước trong `agent_builder` và `agent_runner` (V4). B tự nêu điểm mù này ở bảng 3.2, rồi mâu thuẫn với chính mình ở 6.1 | V4 |
| M10 | `packages/ui/src/components/suggestion.tsx` bản rẽ chưa sửa | A phụ lục A | **Sai nhỏ.** [git] cho thấy tệp này đã bị bản rẽ sửa (6 dòng). Kết luận của A không đổi | [git] |
| M11 | A «chỉ chạm sáu tệp hãng mà bản rẽ vốn đã sửa» | A | **Gần đúng.** A còn chạm `apps/agent/agent/skills/data-boundaries.md` (bản rẽ chưa sửa, nhưng là markdown), và thêm một chỉ mục vào model `AgentTask` của hãng trong `schema.prisma` | [git]; [mã] `schema.prisma` dòng 550 |
| M12 | Mọi tính năng sau gia số 0 là T2 | B §1 | **Lạc quan.** Gia số 1 của B dời phần quyền của `OkrAccessService` xuống `packages/db/src/okr-doc.ts`. Theo luật lộ trình, «lượt chạm … quyền là T3». Dù logic giữ nguyên, đường thực thi quyền vẫn đổi chỗ (suy luận) | [mã] `docs/plan/lo-trinh-okr.md` §2 |
| M13 | Ba chỗ cần lọc khi lưu khuôn `kind: "tac-nhan"` trong bảng của hãng | C §3.3 | **Thiếu.** Mã hãng parse `AgentVersion.manifest` ở sáu chỗ: `run-runtime.ts` 984, 999; `run-preflight.ts` 48; `agent-definitions.service.ts` 381; `evals/agent-builder.eval.ts` 102. Riêng `agent-definitions.service.ts` có 16 truy vấn `agentDefinition`/`agentVersion`; `slack-connection.service.ts` và `agent-access.service.ts` cũng đọc bảng này. C chỉ liệt kê hunk ở `list`, `runNow` và `custom-agent-dispatch` | [mã] grep `parseAgentManifest`, `agentDefinition.` |
| M14 | Lộ trình xếp lượt 9 là T2 | (A không nêu) | Lộ trình ghi `tro-ly-okr · R3 · T2`. A thêm ba bảng nên đẩy lượt 9 thành T3. Đây là một chỗ lệch lộ trình mà A nên nói ra để chủ kho biết | [mã] `docs/plan/lo-trinh-okr.md` dòng 88, 319 |

---

## 2. Phí bản rẽ đo bằng git

`git diff --stat origin/release origin/onehub` trên các tệp của hãng mà ba phương
án chạm [git]:

| Tệp của hãng | Bản rẽ đã sửa | A | B | C |
|---|---|---|---|---|
| `apps/agent/agent/lib/session-purpose.ts` | 24 dòng | ✓ | ✓ | ✓ |
| `apps/agent/agent/instructions/task.ts` | 4 | ✓ | ✓ | ✓ |
| `apps/agent/agent/lib/dispatch.ts` | 6 | ✓ | ✓ | ✓ |
| `apps/agent/agent/schedules/dispatch.ts` | 4 | ✓ | ✓ | ✓ |
| `packages/db/src/agent-tasks.ts` | 3 | ✓ | ✓ | ✓ |
| `apps/api/src/agent/agent-trigger.service.ts` | 32 | ✓ | — | — |
| `packages/ui/src/components/suggestion.tsx` | 6 | ✓ | ✓ | ✓ |
| `apps/agent/agent/lib/capabilities.ts` | 6 | — | — | ✓ |
| `apps/agent/agent/lib/custom-agent-dispatch.ts` | 80 | — | — | ✓ |
| `apps/agent/agent/channels/crm.ts` | 358 | — | — | ✓ |
| `apps/agent/agent/channels/eve.ts` | 11 | (lượt 10) | (lượt 10) | (lượt 10) |
| `apps/app/app/eve/v1/[...path]/route.ts` | 14 | (lượt 10) | (lượt 10) | (lượt 10) |
| `apps/agent/agent/agent.ts` | **chưa từng sửa** | — | ✓ | ✓ |
| `apps/agent/agent/lib/model.ts` | **chưa từng sửa** | — | ✓ | ✓ |
| `apps/agent/agent/hooks/audit.ts` | **chưa từng sửa** | — | — | ✓ |
| `apps/agent/agent/lib/approval.ts` | **chưa từng sửa** | — | — | ✓ |
| `apps/api/src/agent/agent-definitions.service.ts` | **chưa từng sửa** | — | — | ✓ |
| `apps/api/src/agent/agent-runs.service.ts` | **chưa từng sửa** | — | — | ✓ |
| `apps/agent/evals/evals.config.ts` | **chưa từng sửa** | — | — | ✓ |
| `apps/agent/agent/skills/data-boundaries.md` | chưa từng sửa (markdown) | ✓ | — | — |
| Model của hãng trong `schema.prisma` | đã có tiền lệ | chỉ mục `AgentTask` | 4 cột `AppSetting`, chỉ mục `AgentTask` | không |
| **Tệp mã của hãng mới bị chạm lần đầu** | | **0** | **2** | **7** |

Đọc bảng:

- **A** không mở thêm tệp xung đột nào về mã.
- **B** mở hai tệp nhỏ và ổn định (`agent.ts`, `lib/model.ts`). Phần đó tổng quát và
  gửi lên hãng được: truyền `modelOptions` theo purpose.
- **C** mở bảy tệp. Nặng hơn con số: C gắn OneHub vào **nội tạng** khung Tác nhân
  của hãng (bảng `AgentDefinition/Version/Run/Action`, bộ điều phối, dịch vụ API).
  Khung này mới ra 07/08 và nhiều khả năng còn đổi nhanh (suy luận). Mỗi lần kéo
  `release` về là một lần soát xung đột trên đúng khu đó. C tự xếp rủi ro này là
  «Cao, kéo dài».

---

## 3. Số lượt T3, khối lượng, tái dùng, mở rộng

| Tiêu chí | A | B | C |
|---|---|---|---|
| Lượt T3 thêm so với lộ trình tới R3 | +1: lượt 9 thành T3 vì có ba bảng | +1 tới +2: một lượt nền T3 mới chèn giữa lượt 5 và 6; gia số 1 có thể thành T3 vì dời quyền (M12) | +1: gia số 0 của lượt 9 là T3 vì chạm quyền |
| Chèn lượt vào lịch tuần tự | Không | **Có**, vào tháng 10: sát R1 (23/10) và ngày cả công ty bắt đầu dùng (26/10). Có lối lùi: dời sát lượt 9 | Không |
| Khối lượng trước 18/12 (suy luận) | Nhỏ nhất. Gia số 0 có 9 mục, phần lớn là tệp mới trong thư mục riêng | Vừa. Khoảng 20 tệp nền cộng một màn cài đặt, làm sớm từ tháng 10 | Lớn nhất. Ba chốt, stub, bộ điều phối và khoá song song mới, sổ chi phí, 13 hunk, cùng dời quyền, trong cửa sổ khoảng bốn tuần. C tự xếp «quá sức một người» là rủi ro vừa–cao |
| Dùng lại thứ đã có | `AgentTask` và làn nghiên cứu; chép khuôn `agent_runner`; luật `facts.ts`; `canReachAgent()`; `OkrService`, `OkrTrail` cho đường ghi; `AgentEvent` cho phần gốc. Không dùng khung Tác nhân (có chủ ý) | `AgentTask`; luật `facts.ts`; khuôn `stepUsage` của hook audit; tinh thần `capabilities.ts` (`aiReadyAt`); `Suggestion`, `SourcedValue`; khung eval | Dùng nhiều nhất trên giấy (`AgentRun`, `AgentAction`, idempotency, huỷ lượt). Nhưng vẫn phải viết lại bộ xếp lượt, bộ điều phối và principal, và sửa `audit.ts`, `approval.ts`, `capabilities.ts`: vừa dùng lại vừa vá |
| Miền thứ hai (Điều phối 30 ngày) | Thật, nhưng đắt: chép dọc, thêm **một bảng mới (T3)**, lại chạm `session-purpose`, `task.ts`, `taskAuth` và hook, rồi mới rút khung. A liệt kê đủ tệp | Thật và rẻ nhất: một mục danh mục, một mô-đun runtime, một khuôn, eval; không chạm tệp hãng, không migration. **Chỉ khi** stub chạy (V1). Đã kiểm `docKeHoach` chưa export (`packages/db/src/onboarding-nhac.ts` dòng 107) | Thật: gói, mẫu, gói dữ liệu, không hunk mới. Nhưng mỗi đơn vị phải Deploy mẫu trước khi nút có tác dụng, nên vận hành nặng |
| Năng lực biến mất khi thiếu khoá | Phản ứng sau khi hỏng: hai việc lỗi trong một giờ thì ẩn nút. Đúng chữ «không ném lỗi», nhưng lượt đầu vẫn hỏng | Chủ động: agent ghi `aiReadyAt` lúc khởi động | Chủ động: thêm mục «AI Gateway» vào `capabilities.ts` (tệp đã rẽ, +6) |

---

## 4. Chấm từng phương án

### A — 7,5/10

**Vì sao cao nhất ở lăng kính này**

1. **Phí bản rẽ thấp nhất đo được.** Không tệp mã nào của hãng bị chạm lần đầu
   (mục 2). Ba tệp nhạy nhất (`agent.ts`, `lib/model.ts`, `hooks/audit.ts`) được giữ
   nguyên có chủ ý (A §12.2).
2. **Dựa trên cam kết eve chắc nhất.** Cách ly subagent là khái niệm lõi, có bảng
   tường minh (V3). Kho đã chạy khuôn này thật ở `agent_runner` (M6). A không đặt cược
   vào V1.
3. **Gốc không bao giờ thấy chữ OKR.** Subagent tự nạp gói ngữ cảnh theo `okrTaskId`,
   không dùng `message` của gốc làm dữ liệu. Lời phê của B với lối subagent («chữ tiêm
   vào tên mục tiêu có thể khiến gốc gọi `read_crm_history`») không áp được cho A,
   vì gốc của A không đọc tên mục tiêu. Hook `okr-uy-quyen` chặn thêm một lớp (V10).
4. **Khuôn có kiểu theo miền** (`OkrGoiY`, `OkrTomTat` có cột rõ, Json nào cũng parse
   lúc đọc). Đúng luật «parse ở biên» và «schema tả đúng thứ được lưu» của
   `AGENTS.md`. A là phương án duy nhất nhớ viết lại luật dữ liệu (`docs/agent.md`
   §What may be read cùng `skills/data-boundaries.md`, hai tệp phải khớp nhau), điều
   09 sự thật 4 đòi. B và C đọc mục đó nhưng không lên kế hoạch sửa.
5. **Từ điển sạch.** A giữ «Trợ lý OKR» tách hẳn khỏi «Trợ lý AI», nên khỏi phải sửa
   câu «vai chỉ OKR không gọi được Trợ lý AI». B và C gắn nhãn «Trợ lý AI» lên đầu ra
   OKR, nên phải sửa mục từ điển đó.
6. **Bản đồ viết lại trung thực** (A §10.3, W1–W8). Chỗ đắt đã có tên và có điều kiện.

**Trừ điểm**

- **Hai phiên mỗi lượt.** Chặng gốc chiếm khoảng 60% đầu vào (A tự tính). Đó là chi
  phí tiền, nhưng cũng là chi phí bảo trì: thêm một hook chuyển tiếp, một nhánh
  instructions, và một chỗ phải đo cache.
- **W1 bị đánh giá thấp.** Tách subagent thành eve app riêng ở lượt 10 không chỉ là
  «dời thư mục». Nó là một lần triển khai thứ hai: dự án Vercel, biến môi trường, tin
  cậy OIDC, token cầu nối mang phạm vi `okr`. Với đội một người, đây là chi phí vận
  hành lâu dài (suy luận). Lối rẻ hơn có thể là stub ở gốc (V1), nếu phép thử qua.
- **Miền thứ hai trả thêm một T3 mỗi miền** cho tới khi rút khung, và lại chạm các
  tệp hãng đã chạm.
- **Chưa nói rõ chốt cho `tro_ly_okr` ở phiên khác purpose** (V9).
- **Chưa nêu việc lệch lộ trình**: lượt 9 từ T2 thành T3 (M14).
- **Cần sửa hai khẳng định nhỏ**: M10 và M11.

**Lỗi chết người:** không có.

### B — 6,5/10

**Điểm mạnh**

- Mở rộng thật nhất: tính năng mới không chạm tệp hãng, không migration, không đổi
  quyền (mục 3).
- Mỗi lượt rẻ nhất: một phiên, tiền tố nhỏ.
- Hai lưới bảo trì thông minh:
  - test danh sách **đóng khi lỗi**: hãng thêm tool mà danh sách chưa che thì
    `bun run test` đỏ;
  - phép đo số 1 chạy trước mọi thứ, có sẵn lối lùi.
- Tái dùng hàng đợi, luật `facts.ts` và `inputHash` để bấm lại không tốn tiền.
- Nhận ra hai phần đáng gửi lên hãng: `modelOptions` theo purpose, và điểm cắm purpose.

**Trừ điểm**

- **Ranh vai «chỉ OKR» đặt trên một câu tài liệu chưa chạy thử** (V1). Tài liệu còn
  im lặng về hai điều:
  - resolver tool hỏng thì sao;
  - stub có đè được tool sinh từ subagent (`agent_builder`, `agent_runner`) không.
  Mỗi lần nâng eve lại phải kiểm lại. So với A, đây là rủi ro bảo trì cao hơn ở đúng
  chỗ khó đảo nhất.
- **Khung cho một miền.** Bản khai có bốn kiểu trigger, bốn kiểu người duyệt (có
  `duyet-ghi` chưa ai dùng) và bảng chung `AiOutput` với `content`, `sources`,
  `principal` đều là Json. «Luật của hai» mà B tự đặt lại bị chính B vượt ở bước đầu.
  Câu «32 chỗ tự làm» là phóng đại: trong một miền OKR, A đã dùng chung một sổ gợi ý
  cho AI-01/02/03/05 và DO-06.
- **Chèn một lượt T3 mới vào tháng 10**, trái nhịp «mọi lượt đi tuần tự» của lộ
  trình, giữa R1 và ngày cả công ty bắt đầu dùng. Lợi ích «lượt 9 giữ T2» không chắc
  (M12).
- **Hai khẳng định sai hoặc quá tay:** M9 (sổ chi phí thấy hội thoại dựng tác nhân và
  tác nhân nhóm), V5 (ghi E11 như đã kiểm).
- **Lệch nhỏ với luật hằng số:** đặt `priority` 850 ở config riêng thay vì trong
  `PRIORITY`, thành hai chỗ giữ mức ưu tiên.
- Chạm hai tệp hãng lần đầu (mục 2).

**Lỗi chết người:** không có nếu phép thử stub qua. Nếu hỏng thì B lùi về subagent,
tức về hình của A, và mất lý do tồn tại của nửa bộ khung.

### C — 4,5/10

**Điểm mạnh** (giá trị nhất của cả đợt ở mảng soi mã)

- Tìm ra bốn lỗi có thật trong khung Tác nhân của hãng (M2–M5).
- Có một lối rò đứng riêng, không phụ thuộc AI OKR: tác nhân đối tác gửi vào kênh
  Slack chung có người vai «chỉ OKR» (M4). Lượt 2 để ngoài phạm vi, nên đây là việc
  thật từ 26/10 (suy luận của C, tôi thấy hợp lý).
- Phép thử stub 6 điểm là kế hoạch kiểm tốt nhất trong ba bản.
- Cảnh báo token suy nghĩ đáng làm, dù nguồn dẫn sai (V11).

**Trừ điểm**

- **Phí bản rẽ cao nhất và dài hạn nhất** (mục 2): 7 tệp mã hãng chạm lần đầu, cộng
  hai tệp đã rẽ nặng (`crm.ts` 358 dòng, `custom-agent-dispatch.ts` 80 dòng). C tự
  nhận rủi ro «Cao, kéo dài». Lối giảm là «hãng nhận PR loại tác nhân», nhưng việc đó
  nằm ngoài tầm kiểm soát.
- **Trái luật `AGENTS.md` «The schema describes what is actually stored».** Khuôn
  `kind: "tac-nhan"` sống trong cột `AgentVersion.manifest`, nên khuôn
  `agentManifest` của hãng không còn tả đúng dữ liệu. Mã hãng parse cột này ở sáu chỗ
  (M13), C chỉ lọc ba. Muốn đúng luật thì phải đổi khuôn của hãng thành hợp, tức thêm
  một hunk nữa vào tệp hãng.
- **Nặng nhất cho một người.** Gia số 0 là T3 chạm quyền, cộng bộ điều phối và khoá
  song song viết mới, trong cửa sổ khoảng bốn tuần trước 18/12.
- **Tái dùng một phần.** Vẫn phải viết lại xếp lượt, điều phối, principal. Còn đổi
  `approval.ts` và `audit.ts` cho mọi purpose, tức đổi hành vi của cả tác nhân đối tác
  đang chạy.
- **Cùng đặt cược V1** như B.
- **Vận hành:** mỗi đơn vị phải Deploy mẫu trước khi nút có tác dụng.

**Lỗi chết người (theo lăng kính này):** chọn khung Tác nhân của hãng làm đơn vị mở
rộng duy nhất. `CLAUDE.md` gọi phí bản rẽ là «chi phí dài hạn lớn nhất». C đặt toàn
bộ AI của OneHub lên phần hãng đang phát triển nhanh nhất, và làm lệch khuôn lưu trữ
của hãng.

---

## 5. Ý đáng ghép vào phương án thắng (A)

| # | Từ | Ý | Vì sao |
|---|---|---|---|
| G1 | B, C | **Phép thử stub cùng tên ở gốc** (1–2 giờ, nhánh nháp, không gộp), đưa vào gia số 0 của A thành phép đo. Kiểm đủ 6 điểm của C §4.1: đè tool tự viết, đè tool dựng sẵn, phiên khác không đổi, tool subagent, sống qua lần chạy lại, đo tiền tố thật | Kết quả quyết W1 của lượt 10. Qua thì chat OKR chạy ở gốc có stub, khỏi dựng eve app thứ hai; hỏng thì giữ đường app riêng. Còn có thể bỏ chặng chuyển tiếp nếu số đo chi phí xấu. Chưa phải cam kết ranh quyền trước khi có bằng chứng |
| G2 | C | Đặt `reasoning` tường minh (`"low"` hoặc `"minimal"`) trong `agent.ts` của `subagents/tro_ly_okr`, và đo token suy nghĩ ở gia số 0 | Trường có sẵn ([eve] `agent-config.md` §Reasoning effort), đặt tĩnh trong thư mục riêng nên không chạm tệp hãng. Chặn rủi ro chi phí C nêu dù chưa kiểm được nguồn |
| G3 | C, B | Năng lực biến mất **chủ động**: thêm mục «AI Gateway» vào `apps/agent/agent/lib/capabilities.ts` (tệp đã rẽ), hoặc cờ sẵn sàng agent ghi lúc khởi động kiểu `aiReadyAt`. Thay cho luật «hai lỗi trong một giờ» của A | Đúng khuôn `capabilities.ts` mà `AGENTS.md` chỉ định, và không có lượt hỏng đầu tiên |
| G4 | B | `inputHash` trên `OkrGoiY` và `OkrTomTat`: đầu vào không đổi thì trả kết quả cũ, không gọi model | Một cột, chặn bấm lặp trong tuần đặt OKR, rẻ để bảo trì |
| G5 | C | Gói ngữ cảnh mặc định **không mang họ tên**, chỉ id người phụ trách; màn tự ghép tên. Bộ kiểm bỏ câu chứa họ tên đầy đủ, trừ người phụ trách của KR được dẫn | NG-07 đứng bằng cấu trúc thay vì bằng lời dặn; hàm thuần, test được |
| G6 | B, C | Test đóng khi lỗi: danh sách tool của `tro_ly_okr` bằng đúng tập đã khai; `purposeOf` nhận `okr`, và phiên `okr` không nhận lời dặn nghiên cứu (M1). Thêm chốt V9: tool nộp từ chối khi vắng `purpose=okr` hay `okrTaskId` | Chặn hồi quy khi kéo `release`; lấp chỗ A bỏ sót |
| G7 | C | **Bỏ chỉ mục mới trên `AgentTask`.** Chống trùng bằng `@@unique([departmentId, weekStart])` sẵn có trên `OkrTomTat` cộng tra `(kind, subject)` trước khi xếp, hoặc `lockIdempotencyKey` (`packages/db/src/idempotency.ts`) | Không chạm model của hãng trong `schema.prisma`; migration chỉ nằm trong khối OKR |
| G8 | B | Gắn `gateway.tags` và `gateway.user` tĩnh qua `modelOptions` của subagent từ ngày đầu, không đợi W7 | Đối soát với Custom Reporting mà không phải sửa tệp hãng |
| G9 | C | **Mở việc riêng** (không nằm trong lát dọc OKR) cho lối rò Slack của tác nhân đối tác tới người vai «chỉ OKR», và cho `isAutomated` chỉ nhận `APP_AUTH`. Phần sửa gửi lên hãng | Rò có thật từ 26/10, độc lập với AI OKR; gửi lên hãng thì giảm phí bản rẽ |
| G10 | A, C | Gộp phép đo G20 với một việc: tìm phiên con `agent_runner` trong `AgentEvent`. Nối qua `subagent.called.data.childSessionId` mà hook audit đã lưu ([eve] `concepts/sessions-runs-and-streaming.md` dòng 52, 131) | Xác nhận V4 bằng dữ liệu; dùng lại bảng có sẵn |
| G11 | B | Kế hoạch lượt 10 khi đi đường gốc có stub: cầu nối nhận vai `okr` chỉ khi token mang purpose OKR và phạm vi không có `doi-tac` | Chỉ dùng nếu G1 qua; giữ hai lớp chặn của lượt 2 cùng phép đo của chúng |

**Cân nhắc, chưa khuyến nghị cứng (suy luận):** thay `OkrAiChiPhi` bằng cách cho hook
của subagent ghi thẳng `AgentEvent`, rồi cộng chi phí qua `childSessionId`.

- Lợi: khỏi W2 (đổi tên sổ sau này), và vết điều tra một mối.
- Hại: truy vấn trần tháng trên `AgentEvent` cần chỉ mục theo `type`/thời điểm, mà
  thêm chỉ mục là chạm model của hãng.

Giữ bảng riêng của A là chấp nhận được.

---

## 6. Khuyến nghị tổng hợp

**Nền: phương án A**, với ba sửa:

1. Ghi rõ lượt 9 lệch lộ trình, từ T2 thành T3 vì có ba bảng. Đó là **một** Cổng 1.5,
   tương đương B và C, nhưng không chèn lượt mới vào tháng 10.
2. Thêm chốt V9 và test G6.
3. Sửa M10, M11 trong phụ lục.

**Ghép:** G1 (phép thử stub thành phép đo ở gia số 0, quyết W1), G2 (`reasoning`
tường minh), G3 (năng lực chủ động), G4 (`inputHash`), G5 (gói không tên người),
G7 (không chạm `AgentTask`), G8 (tag tĩnh), G10 (đo điểm mù chi phí). G9 là một việc
riêng ngoài lát dọc. G11 chỉ khi G1 qua.

**Bỏ:**

- Từ B: danh mục bản khai và kiểu `AiFeatureRuntime`, bảng chung `AiOutput` và
  `AiSpend`, lượt nền T3 chèn giữa lượt 5 và 6, sửa `agent.ts`/`lib/model.ts` ở gia số
  đầu. Giữ làm **đích rút khung** khi có ca thứ hai, đúng W2–W8 của A.
- Từ C: khung Tác nhân làm đơn vị mở rộng, `AgentAction` làm sổ gợi ý, 13 hunk vào
  lõi hãng, Deploy theo đơn vị. Giữ các phát hiện lỗi của C cho G9.

**Vì sao không chọn B dù B mở rộng tốt hơn** (suy luận):

- Lợi thế của B chỉ hiện ra từ miền thứ hai, mà hôm nay chưa miền nào khác có câu
  giao về AI.
- Cái giá của B thì trả ngay, ở đúng chỗ khó đảo nhất: ranh quyền đặt trên V1 chưa
  chạy thử, và một lượt T3 chèn vào tháng 10.
- G1 lấy phần giá trị nhất của B, tức bằng chứng stub có chạy không, với giá 1–2 giờ
  và không cam kết gì. Qua thì rút khung theo hướng B có dữ liệu thật; hỏng thì A đã
  không mất gì.

---

## 7. Quyết định cần chủ kho

Duy nhất một: **chấp nhận lượt 9 thành T3** (thêm Cổng 1.5 vì có ba bảng trong khối
OKR) thay cho lượt 9 T2 của lộ trình. Khuyến nghị: **đồng ý**.

- Lý do: cả ba phương án đều cần đúng một cổng khó đảo trước tính năng AI đầu tiên.
  Đặt nó trong lượt 9 là cách duy nhất không chèn thêm lượt vào lịch tuần tự của
  tháng 10.
- Trả lời một chạm: «đồng ý» hoặc «giữ T2».

---

## Phụ lục: đã tự kiểm những gì

**eve** (`apps/agent/node_modules/eve/docs`, bản 0.29.4):

- `guides/dynamic-capabilities.md` (trọn)
- `concepts/default-harness.md` (trọn)
- `subagents.mdx` (trọn)
- `guides/hooks.md` dòng 125–150
- `guides/auth-and-route-protection.md` dòng 105–111, 241–252
- `agent-config.md` dòng 50–180
- `instructions.mdx` §Split instructions
- `skills.mdx` dòng 12
- `concepts/sessions-runs-and-streaming.md` dòng 49–52, 78, 131

**Mã** (`scratchpad/onehub`):

- `apps/agent/agent/`
  - `agent.ts`, `instructions.md`, `instructions/task.ts`
  - `lib/{model.ts, session-purpose.ts, approval.ts, capabilities.ts, dispatch.ts, custom-agent-dispatch.ts (200–240, 370–530), run-runtime.ts (165–200, 378–396, 1020–1060), facts.ts (120–132), focus.ts}`
  - `hooks/{audit.ts, builder-delegation.ts, telemetry.ts, activity.ts}`
  - `channels/crm.ts` dòng 295–325
  - `tools/` (26 tool cộng `agent.ts`)
  - `subagents/agent_runner/{agent.ts, tools/*, sandbox/sandbox.ts}` và danh sách `subagents/agent_builder/`
- `packages/db/prisma/schema.prisma`: `AgentAction`, `AgentRun`, `AgentEvent`, `AppSetting`, `AgentTask` dòng 550, `OkrCycle.updateWeekday`
- `packages/db/src/{agent-tasks.ts, onboarding-nhac.ts}`
- `packages/validation/src/{vai-workspace.ts, okr-vet.ts, agent-manifest.ts}`
- `packages/ui/src/components/suggestion.tsx`
- `apps/api/src/okr/{tien-do.ts, okr.service.ts:890}`
- `apps/api/src/agent/agent-trigger.service.ts` (350–400, 567)
- `apps/api/src/slack/slack-connection.service.ts` (45–70)
- grep `parseAgentManifest` và `agentDefinition.` trên `apps`, `packages`
- `apps/api/test/vai-chi-okr.spec.ts` dòng 42
- `_acceptance/vai-chi-okr/contract.md` dòng 66–74
- `docs/agent.md` dòng 441–451, 493
- `docs/plan/lo-trinh-okr.md` dòng 30–70, 80–90, 319–360
- `CONTEXT.md` dòng 222–226, 495–499

**Git** (chỉ đọc):

- `git diff --stat origin/release origin/onehub` trên 22 tệp ở mục 2
- đầu `origin/onehub` và `origin/release`
