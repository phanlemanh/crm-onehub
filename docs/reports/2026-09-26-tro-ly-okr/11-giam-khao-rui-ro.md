# 11 — Giám khảo độc lập, lăng kính 3: rủi ro và niềm tin

Viết 2026-09-26. Tôi chỉ chấm theo lăng kính rủi ro và niềm tin, không chấm lịch, phí
bản rẽ hay độ đẹp kiến trúc, trừ khi chúng đổi mức rủi ro.

**Đã đọc trọn:** `09-soat-do-du.md`, `10-phuong-an-A.md`, `10-phuong-an-B.md`,
`10-phuong-an-C.md`. Tra thêm `02` (lời phàn nàn về thông báo AI của Tability) và `08`
(ZDR, model dự phòng).

**Đã tự kiểm lại trong mã và tài liệu eve.** Danh sách đủ ở mục 7. Đường dẫn mã tính
từ gốc kho, lấy trong bản chụp `scratchpad/onehub`. Đường dẫn eve tính từ
`apps/agent/node_modules/eve/docs`. Kết luận chưa có nguồn nói thẳng thì tôi ghi
«(suy luận)».

---

## 0. Kết luận ngắn

| Phương án | Điểm (rủi ro và niềm tin) | Một câu |
|---|---|---|
| **A** Dọc OKR trước | **8/10** | Cách ly bằng cấu trúc và fail-closed: subagent không có tool đối tác, không có tool đọc, dữ liệu do mã nạp sẵn, model và ZDR đặt tĩnh. Ít mặt tấn công nhất và dễ gỡ nhất. Yếu ở chỗ chỉ có một công tắc, gói tóm tắt mang tên người, và một kẽ nhỏ: chữ tự do quay về phiên gốc |
| **B** Nền năng lực khai báo | **6/10** | Sổ chi phí và công tắc tốt nhất, lại có số đo thật sớm nhất. Nhưng cách ly dựa vào stub ở phiên gốc, một hành vi chưa chạy thử, và ZDR đi qua resolver model đọc DB. **Resolver hỏng thì eve rơi về `zai/glm-5.2-fast` mà không mang ZDR** |
| **C** Đồng đội chủ động | **5/10** | Tìm ra những lối rò thật, đã kiểm, trong khung Tác nhân của hãng, và có bộ luật chống thông báo dồn dập tốt nhất. Nhưng C mở mặt rủi ro rộng nhất: người dùng tự ghép tác nhân, đầu ra OKR nằm trong bảng của hãng (thành một đường đọc thứ hai), 13 hunk vào lõi, và cùng lỗi ZDR với B |

**Khuyến nghị:** lấy **A làm nền**. Sửa bốn chỗ trong A trước Cổng Bằng chứng của gia
số 0 (mục 6.1). Ghép sổ chi phí phủ mọi purpose và công tắc theo tính năng từ B. Ghép
gói dữ liệu không tên người, danh sách từ cấm NG, khoá ngân sách suy nghĩ và bộ luật
chống thông báo dồn dập từ C. Bỏ stub ở phiên gốc, bỏ tác nhân do người ghép, và bỏ
việc lưu đầu ra OKR trong bảng của hãng. Lối rò Slack của Tác nhân mà C tìm ra nên
thành một việc riêng, độc lập với việc chọn phương án.

---

## 1. Thước chấm

Có chín chiều. Mỗi chiều hỏi một câu: *nếu thứ này hỏng, người dùng mất gì, và ai phát
hiện?*

1. **Rò dữ liệu đối tác sang vai «chỉ OKR»**, cả khi tương tác lẫn khi chạy nền, nhất
   là khi người nhận khác người hỏi.
2. **Dữ liệu gửi nhà cung cấp model**: ZDR có được áp chắc chắn không, và có bên thứ ba
   nào lọt vào không.
3. **Vượt ngân sách**: trần của Gateway là trần mềm. Sổ trong app có đủ và đúng không.
4. **Số bịa trong tóm tắt và gợi ý.**
5. **Thông báo dồn dập.** Đây là lời phàn nàn cụ thể duy nhất về AI của Tability, và
   nguyên văn là «kể cả cho việc không phải của mình» (`02` dòng 34, 97).
6. **NG-05, NG-06, NG-07, NG-01** có đứng bằng cấu trúc hay chỉ bằng lời dặn.
7. **Tác nhân do người dùng ghép làm sai.**
8. **Tắt được từng phần.**
9. **Đo được và hoàn tác được**, gồm cả gỡ chính kiến trúc nếu nó sai.

---

## 2. Điều tôi tự kiểm, và nó đổi điểm thế nào

| # | Sự thật đã kiểm | Nguồn | Ảnh hưởng |
|---|---|---|---|
| K1 | Tool động trùng tên tool đã viết thì **đè** nó. Tài liệu chỉ nói resolver *model* hỏng thì «degrade»; về resolver *tool* hỏng thì **không nói gì** | eve `guides/dynamic-capabilities.md` §Conflicts, §Dynamic models | Tiền đề stub của B và C là hành vi có tài liệu. Nhưng khi resolver tool hỏng thì phiên fail-open hay fail-closed vẫn chưa ai biết. B có nêu và giảm rủi ro bằng resolver thuần. C không nêu |
| K2 | Resolver model hỏng thì «degrade, never fail the turn» và rơi về `fallback`. Selection bỏ trống `modelOptions` thì dùng `modelOptions` cấp agent. `fallback` của gốc là `zai/glm-5.2-fast`. `selectedModel()` bắt lỗi rồi trả `null`. Luật kho ghi: «A failed read logs and keeps the compiled fallback» | eve `agent-config.md` §Choose the model dynamically; `packages/db/src/settings.ts` dòng 10–13; `apps/agent/agent/lib/model.ts`; `docs/agent.md` §Model | **ZDR đặt trong resolver model của phiên gốc là fail-open.** Đọc DB hỏng, hay resolver ném lỗi, là nội dung OKR đi tới Z.ai mà không có `zeroDataRetention`. `08` dòng 133 ghi không thấy Z.ai trong danh sách ZDR. Lỗi này trúng B và C, không trúng A |
| K3 | `defineAgent` có `modelOptions` và `reasoning` ở cấp agent, đặt tĩnh | eve `agent-config.md` §Other defineAgent fields, §Reasoning effort | Subagent của A đặt ZDR tĩnh được, nên chắc chắn. Khoá ngân sách suy nghĩ cũng là một dòng |
| K4 | Hook ném lỗi thì thành `turn.failed`. Hook của gốc không chạy trong lượt của subagent. Hook chạy ít nhất một lần | eve `guides/hooks.md` §What happens when a hook throws, §Subagent isolation, §Persist events | Chặn bằng hook ở phiên gốc (A) có tiền lệ trong kho: `apps/agent/agent/lib/builder-delegation.ts` ném lỗi ở lời gọi thứ hai. Sổ chi phí của A, khoá theo `meta.id`, không cộng trùng. Sổ upsert-cộng-dồn của B có thể cộng trùng. Lệch theo chiều an toàn, nhưng vẫn lệch |
| K5 | Hook `audit` bọc mọi thứ trong `try/catch` rồi chỉ `console.warn` | `apps/agent/agent/hooks/audit.ts` | Mọi sổ chi phí dựa trên hook đều có thể **đếm thiếu mà không ai hay**. Chỉ A có phép đối soát với Gateway (±10%). B và C cần thêm |
| K6 | Purpose lạ rơi về `research` qua `.catch("research")`. Khi đó `instructions/task.ts` đổ lời dặn nghiên cứu cộng `sessionPreamble`, tức phần mở đầu đọc liên hệ, công ty, thoả thuận | `apps/agent/agent/lib/session-purpose.ts`; `apps/agent/agent/instructions/task.ts` | Cả ba đều thêm purpose vào danh sách. B và C có test «purpose lạ không rơi về research». A nên thêm test này |
| K7 | Lượt Tác nhân chạy bằng id người dựng (`principalId = run.initiatedById ?? run.agent.createdById`). `queryRunCrm` trả hết khi `WORKSPACE`. `approvedSlackDestination` chỉ kiểm đích trong khuôn. Hồ sơ lượt 2 để kênh nội bộ ngoài phạm vi | `apps/agent/agent/lib/custom-agent-dispatch.ts`; `apps/agent/agent/lib/run-runtime.ts`; `_acceptance/vai-chi-okr/contract.md` §Out of scope | Ba phát hiện của C là **đúng**. Tác nhân đối tác đăng được dữ liệu đối tác vào một kênh Slack có người mang vai «chỉ OKR». Lối này không thuộc OKR nhưng có thật từ 26/10 (suy luận về mức độ: còn tuỳ luật «kênh Slack có thuộc ranh CRM không») |
| K8 | Router `agents` của hãng mở `byId`, `history`, `activity` cho mọi thành viên khi tác nhân không còn là nháp. `pause`, `archive`, `remove` mở cho người tạo hoặc quản trị workspace | `apps/api/src/agent/agents.router.ts`; `apps/api/src/agent/agent-definitions.service.ts`; `apps/api/src/agent/agent-access.service.ts` | C chỉ loại kind `tac-nhan` khỏi `list` và `runNow` (C §3.3). Mọi thủ tục theo id còn lại vẫn là **đường đọc và quản lý thứ hai**, nằm ngoài luật quyền OKR của C |
| K9 | `mockModel` là một phần định nghĩa agent, nên chỉ dùng cho agent dựng riêng làm fixture | eve `evals/overview.mdx` §Deterministic fixture models | A §8.2 và B E9 định dùng `mockModel` cho eval tất định trên agent thật. Không làm thẳng được, phải dựng agent fixture. C nói đúng |
| K10 | C viết gemini-3.7-flash «có suy nghĩ (thẻ reasoning trong catalog, NC-08)». Tôi tìm không thấy chữ «reasoning» nào trong `08` hay trong `raw/` | grep | Chưa có nguồn. Nhưng rủi ro chi phí vẫn đáng đóng, vì eve có sẵn nút `reasoning` (K3) |
| K11 | Telemetry chỉ gửi trường nằm trong danh sách cho phép (`permittedErrorClass`, `permittedTool`, `permittedTaskKind`) | `packages/telemetry/src/events.ts`; `apps/agent/agent/hooks/telemetry.ts` | Đã loại trừ: không phương án nào để nội dung OKR rò qua PostHog của hãng |
| K12 | Bản rẽ **chưa từng sửa** `hooks/audit.ts`, `lib/model.ts`, `agent.ts`, `lib/approval.ts`, `agent-definitions.service.ts`, `agent-runs.service.ts` | `git diff --stat origin/release origin/onehub` (chỉ đọc) | C chạm cả sáu tệp này, trong đó có `isAutomated`, một ngữ nghĩa an ninh của hãng. B chạm hai. A không chạm tệp nào |

---

## 3. Chấm từng phương án

### 3.1 Bảng chín chiều

| Chiều | A | B | C |
|---|---|---|---|
| 1. Rò sang vai «chỉ OKR» | **Mạnh, fail-closed.** Subagent chỉ có hai tool nộp, không có tool đọc. Gói ngữ cảnh do mã đọc từ bảng OKR. Phiên gốc có tool đối tác nhưng không nhận chữ OKR, bị hook chặn, và 10/26 tool tự kiểm purpose. Nền: con trỏ trong tin sáng, lọc theo người xem lúc hiện | **Khá, nhưng chưa chạy thử.** Stub che 36 tên ở phiên gốc. Có test ghim danh sách, resolver thuần, lối lùi định sẵn. Hai kẽ tự nhận: tool subagent `agent_builder` và `agent_runner` không che được, và resolver tool hỏng thì chưa rõ ra sao (K1). Lượt 10 mở `/eve/v1` cho vai `okr` vào đúng phiên gốc đang cầm tool đối tác | **Chốt ba lớp là thiết kế mạnh nhất trên giấy.** Tool tự đọc lại vai mỗi lần gọi, danh tính tác nhân, lọc theo người nhận. Nhưng C dùng cùng stub chưa chạy thử như B, và mở thêm đường đọc thứ hai qua router của hãng (K8) |
| 2. Dữ liệu tới nhà cung cấp model | **Tốt.** Model và `modelOptions` của subagent đặt tĩnh (K3), nên ZDR không phụ thuộc DB. **Kẽ:** `ketQuaTroLy.lyDo` là chữ tự do, tối đa 300 ký tự, và quay về phiên gốc. Model của phiên gốc lấy từ `AppSetting`, fallback là Z.ai | **Lỗi nặng.** ZDR đọc từ `AppSetting.aiZdr` trong resolver model của phiên gốc. Resolver hỏng thì rơi về `zai/glm-5.2-fast` không có ZDR (K2) | **Cùng lỗi với B.** Tầng model chọn theo mẫu, nên resolver phải biết mẫu, tức cần đọc DB. ZDR đặt trong cùng selection đó (K2) |
| 3. Vượt ngân sách | **Vừa.** Trần tháng và trần theo người, giữ chỗ cho tóm tắt, `limits` 40k/4k cho subagent, đối soát ±10% với Gateway. Nhưng chặng chuyển tiếp ở gốc làm giá mỗi lượt gấp khoảng 2 lần. Làn nghiên cứu vẫn không có trần. Không nhắc token suy nghĩ. Trần $8 sẽ chặn đúng mùa quý 1 (A tự tính) | **Mạnh nhất.** Sổ phủ **mọi** purpose từ gia số 0, nên có số thật sớm nhất. `choPhep()` ở hai chỗ, trần theo tính năng, `inputHash` để bấm lại không tốn thêm, 402 thì tạm nghỉ. Thiếu đối soát với Gateway | **Mạnh.** Trần USD mỗi lượt có huỷ lượt, `choPhep()` ở ba chỗ, báo quản trị ở 80% và 100%, khoá suy nghĩ. Sổ dựa vào hook `audit` đã sửa (K5) |
| 4. Số bịa | **Mạnh.** Viết lại không được thêm số mới. Tóm tắt khớp nguồn được dẫn hoặc số do mã tính sẵn. DO-06 tính bằng mã | **Vừa.** Bộ kiểm tốt và chạy lại được lúc hiển thị. Nhưng DO-06 để **model đề xuất `kr.targetValue`**, một con số không có nguồn để khớp | **Mạnh.** DO-06 do mã tính khoảng. Quá 30% câu bị bỏ thì giữ bản tin lại, không đăng |
| 5. Thông báo dồn dập | **Tốt nhờ tối giản.** Chỉ Trưởng phòng ban nhận, và chỉ một dòng dẫn. Không có cơ chế tự tắt theo người | **Tốt.** Một dòng, gửi trưởng đơn vị và người theo dõi. Không có trần số dòng AI | **Tốt nhất về luật**: tối đa hai dòng, đứng sau việc của người, báo theo cạnh, nguội 14 ngày, người nhận tự tắt, đo tỷ lệ tắt. **Nhưng nhiều nguồn nhất**: cảnh báo, nhiều tác nhân mỗi đơn vị, gửi cả người phụ trách KR và người theo dõi |
| 6. NG-05/06/07/01 | NG-05 và NG-06 bằng cấu trúc. NG-07 yếu hơn: gói tóm tắt mang tên người phụ trách. NG-01 chỉ có eval, không có danh sách từ cấm | NG-05 và NG-06 bằng cấu trúc, có test tĩnh «không ghi bảng `okr*`». Gói vẫn mang tên người. NG-01 không có từ cấm | **Mạnh nhất**: gói dữ liệu không tên người, bỏ câu chứa họ tên, danh sách từ cấm NG-01/02/07, danh mục hành động khép kín |
| 7. Người ghép tác nhân làm sai | Không có đường ghép, nên không có rủi ro này | Không có (bản khai viết trong mã) | **Rủi ro mới.** 500 ký tự lời dặn do quản trị hoặc Trưởng đơn vị viết, kể cả người mang vai «chỉ OKR». Nó chạy trong phiên sinh nội dung cho **người khác** đọc, và không ai eval được lúc Deploy |
| 8. Tắt từng phần | **Yếu.** Một công tắc `aiOn` cho cả khu OKR, cộng các trần. «Tắt từng loại gợi ý» được nhắc nhưng không có cơ chế | **Mạnh.** Công tắc theo tính năng, công tắc ZDR, trần theo tính năng | **Mạnh nhất.** Tắt được theo tác nhân, theo đơn vị, theo người nhận, và có công tắc tổng |
| 9. Đo và hoàn tác | **Mạnh.** Sổ gợi ý có trạng thái, tỷ lệ hoàn tác đọc từ `OkrTrail`, đối soát chi phí. Gỡ kiến trúc dễ nhất: một thư mục, ba bảng trong khối OKR, không chạm tệp chưa sửa của hãng | **Mạnh về đo** (theo `feature@phienBan`). Gỡ ở mức vừa: resolver chạy trong **mọi** phiên gốc, và thêm cột vào `AppSetting` của hãng | **Mạnh về truy vết** (`AgentRun` mang principal, model, chi phí). **Gỡ khó nhất**: 13 hunk trong 12 tệp, có đổi `isAutomated` và hook `audit` của hãng (K12) |

### 3.2 Phương án A: 8/10

**Vì sao cao.** Trong ba phương án, chỉ A đặt ranh vai «chỉ OKR» vào một thứ **không
thể thiếu sót khi chạy**: subagent không thừa kế gì (eve `subagents.mdx` §The isolation
boundary). Subagent cũng không có tool đọc nào, nên chữ người gõ trong OKR không kéo
được model đi đọc thêm. Phiên gốc là chỗ yếu, nhưng có ba lớp chặn và không mang theo
chữ OKR. Kể cả khi phiên gốc bị dụ gọi tool đối tác, đầu ra của nó cũng không tới tay
người dùng, vì việc được đóng bằng `closeTask`. Đầu ra nằm trong bảng riêng của khối
OKR và chỉ đọc qua `okr.router`. Kênh nhắc chỉ mang con trỏ. Tắt `aiOn` là tắt sạch.

**Lỗi chết người: không có.**

**Lỗi phải sửa trước khi có nút đầu tiên:**

1. **`ketQuaTroLy.lyDo` là chữ tự do và quay về phiên gốc** (A §3.2). Model của phiên
   gốc là hàng `AppSetting`, fallback `zai/glm-5.2-fast` (K2). Hệ quả là một mẩu nội
   dung OKR có thể tới nhà cung cấp ngoài ZDR. Cách sửa: `lyDo` thành enum mã lỗi.
2. **W7 định chuyển model của subagent sang `defineDynamic` sau này.** Làm vậy thì
   mất đúng tính tất định của ZDR (K2). ZDR phải nằm ở `modelOptions` cấp agent của
   subagent. Selection động chỉ được thêm tag, không bao giờ là nơi duy nhất mang ZDR.
3. **Chỉ có một công tắc.** Một loại gợi ý bị bác nhiều thì hôm nay phải tắt cả khu
   OKR, kể cả tóm tắt.
4. **Gói tóm tắt mang tên người phụ trách** (A §8.1: tên được hiện nếu là người phụ
   trách KR được dẫn). Luật đó giữ NG-07 bằng bộ kiểm, không bằng cấu trúc.

**Khẳng định cần chỉnh.** «`mockModel` cho các ca về bộ kiểm và uỷ quyền» (A §8.2)
không chạy thẳng trên agent thật được (K9). Ca uỷ quyền cần một agent fixture, còn bộ
kiểm thì là hàm thuần, test bằng `bun test`.

**Rủi ro còn lại, A đã tự nêu và xử lý hợp lý.**

- Thuộc tính auth có tới được phiên con không: A xếp một phép đo đỏ được ở gia số 0.
  Nếu không tới, subagent trả `khong-lam-duoc`, tức fail-closed.
- Chặng chuyển tiếp làm đắt: A có ba nấc giảm, xếp theo thứ tự đảo được.

### 3.3 Phương án B: 6/10

**Vì sao không thấp hơn.** B là phương án hiểu vấn đề ngân sách rõ nhất:

- sổ phủ cả làn nghiên cứu đang tiêu chung $20;
- số thật có từ gia số 0;
- trần theo tính năng, `inputHash`, và `choPhep()` ở hai chỗ.

B không có đường cho người dùng tự ghép. B cũng tự nêu đúng hai kẽ của stub (tool
subagent; resolver tool hỏng thì sao), và đặt «phép đo số 1» chạy trước mọi thứ, có lối
lùi định sẵn.

**Lỗi chết người, nếu không sửa:**

- **ZDR fail-open** (K2). B đặt `zeroDataRetention: <theo cài đặt>` đọc từ
  `AppSetting.aiZdr` trong resolver model của phiên gốc. Đó chính là đường mà luật kho
  ghi «A failed read logs and keeps the compiled fallback». Một lần đọc DB hỏng là nội
  dung OKR đi tới `zai/glm-5.2-fast` không kèm ZDR, và không ai được báo.
  - Nếu chủ kho trả lời điều kiện mở lượt 9 bằng «chỉ gửi khi có ZDR», lỗi này phá đúng
    câu trả lời đó.
  - Sửa được: resolver cho purpose `ai-feature` phải thuần, không I/O, lấy ZDR từ hằng
    trong mã hoặc từ env. Cộng một phép đo: tắt DB giữa phiên thì phiên phải lỗi, không
    được chạy tiếp.

**Lỗi nặng:**

- **Cách ly dựa vào hành vi chưa chạy thử**, trong một phiên gốc cầm 26 tool đối tác.
  Lượt 10 còn mở `/eve/v1` cho vai `okr` vào chính phiên đó. Chỉ cần một lỗi ở resolver,
  người mang vai «chỉ OKR» chat thẳng với một agent có tool đối tác. So với A, mức hỏng
  tệ nhất của B nặng hơn hẳn.
- **Model đề xuất đích cho DO-06.** `deXuatDong.truong` có `kr.targetValue` (B §2.3).
  Bảng chi phí của B tính DO-06 là hai bước model (B §6.3). Một con số do model nghĩ ra
  thì không có nguồn để mã kiểm. A và C đều để mã tính.
- 36 stub có tên thật (`read_crm_history`, `search_crm`…) nằm trong ngữ cảnh.
  - Model sẽ thử gọi chúng, mỗi lần tốn một bước.
  - Trong chat, model có thể nói với người mang vai «chỉ OKR» rằng có những công cụ ấy
    (suy luận).

**Khẳng định cần chỉnh.** B E11 ghi «phiên subagent đọc được thuộc tính auth của phiên
cha» như một sự thật. Mã cho thấy `agent_runner` có đọc
(`apps/agent/agent/subagents/agent_runner/tools/finish_run.ts`). Nhưng eve
`guides/auth-and-route-protection.md` lại nói `auth.current` và `initiator` có thể là
`null` «on internal runtime paths (subagents, for instance)». Nên coi đây là điều cần
đo, như A đã làm. Cũng như A, «dùng `mockModel` trên agent thật» cần agent fixture
(K9).

### 3.4 Phương án C: 5/10

**Đóng góp lớn nhất của C là phân tích, không phải kiến trúc.** C đã kiểm và tìm ra:

- lượt Tác nhân chạy bằng id người dựng;
- `WORKSPACE` trả mọi bản ghi cho bất kỳ ai gọi được tác nhân;
- tác nhân đăng Slack mà không lọc người trong kênh;
- `isAutomated` không nhận principal runtime khác `APP_AUTH`;
- sổ chi phí `AgentRun` mù phần việc của `agent_runner`;
- mỗi tác nhân chỉ được một lượt RUNNING.

Tôi đã kiểm lại cả sáu điều (K7; `apps/agent/agent/lib/approval.ts`;
`apps/agent/agent/hooks/audit.ts` có `persistRunEvent` chỉ cho `team-agent`;
`apps/agent/agent/subagents/agent_runner/` không có `hooks/`). Chống thông báo dồn dập và
giữ NG-07 bằng cấu trúc cũng là phần tốt nhất trong ba phương án.

**Lỗi chết người, nếu không sửa:**

1. **Cùng lỗi ZDR fail-open với B** (K2). Resolver model của C chọn tầng theo mẫu,
   nên phải biết mẫu. Thuộc tính `phienTacNhan` chỉ có `runId`, `agentId` và
   `versionId`, nên resolver phải đọc DB.
2. **Đầu ra OKR nằm trong bảng của khung Tác nhân của hãng**, gồm `AgentRun.result`,
   `AgentAction` và `AgentRunEvent`. Router `agents` của hãng vẫn phục vụ các bảng này
   theo luật của hãng (K8):
   - mọi thành viên đọc được `history` và `activity`;
   - người tạo hoặc quản trị workspace được `pause`, `archive`, `remove`.

   C chỉ loại hai thủ tục. Hôm nay mọi thành viên đọc được mọi OKR, nên chưa thành rò.
   Nhưng từ lượt 8, khi có «mức hiển thị giới hạn», đây là đường vòng qua bộ lọc người
   nhận. Luật quản lý tác nhân OKR của C (`suaDuocDonVi`) cũng bị luật của hãng bỏ qua.

**Lỗi nặng:**

- **Tác nhân do người ghép** (chiều 7). Lời dặn thêm tự do do một người viết chạy
  trong phiên sinh nội dung cho người khác, và người nhận không thấy lời dặn đó. C chặn
  tốt phần NG bằng danh mục khép kín và gói không tên người. Nhưng C tự thừa nhận
  «model vẫn có thể so sánh đơn vị», và eval lúc dựng không phủ được những câu dặn viết
  sau này.
- **Mặt rủi ro và độ khó gỡ.**
  - 13 hunk trong 12 tệp của hãng, có sáu tệp bản rẽ chưa từng chạm (K12), trong đó có
    `isAutomated` và hook `audit` dùng chung cho mọi Tác nhân và mọi phiên.
  - Gia số 0 là T3, đặt trong khoảng bốn tuần của lượt 9. C tự xếp rủi ro «quá sức một
    người» ở mức vừa đến cao. Lịch dồn là lúc cổng an ninh dễ bị ký vội (suy luận).
- **Nguồn thông báo nhiều nhất.** Cảnh báo lệch cộng nhiều tác nhân mỗi đơn vị cộng
  nhiều nhóm người nhận chính là hình của lời phàn nàn về Tability. Luật «tối đa hai
  dòng» giảm được, nhưng không bỏ được gốc.

**Khẳng định cần chỉnh.** «gemini-3.7-flash có suy nghĩ, theo NC-08»: tôi không tìm thấy
trong `08` (K10). Rủi ro vẫn đáng đóng, nhưng con số ×3 ở C §7 là suy luận chưa có
nguồn.

---

## 4. Rủi ro cả ba cùng sót

1. **Lọc theo nguồn không chặn được nội dung lọt từ nguồn không được dẫn** (suy
   luận).
   - Cả ba lọc câu tóm tắt theo `nguon[]`: người xem đọc được mọi nguồn thì thấy câu.
     Nhưng model đọc **cả gói**, và có thể viết một câu dẫn KR Y mà mang ý của KR X, dù
     KR X bị ẩn với người xem.
   - Bộ kiểm số chỉ chặn con số, không chặn chữ.
   - Khi lượt 8 có mức hiển thị giới hạn, gói của một bản tóm tắt dùng chung chỉ được
     chứa thứ **mọi** người nhận đều đọc được. Nếu không, phải chia gói theo tầng hiển
     thị.
   - A đã chạm tới ý này ở W6, nhưng mới cho kênh Slack.
2. **ZDR và cache có thể kéo nhau** (suy luận, cần đo). Cả ba ước chi phí đều tính 60–80%
   token vào trúng cache. Chưa ai kiểm cache ngầm có còn trên đường ZDR của Gateway
   không. Nếu không còn, câu trả lời «bật ZDR» của chủ kho làm đổi cả con số trần.
   - Việc cần làm: thêm vào lời gọi thử ZDR (A 0.2) một phép đo `cachedInputTokens` trên
     hai lời gọi cùng tiền tố.
3. **Chữ chỉ chiều không được kiểm** (suy luận). Câu «Mức tự tin tụt» hay «tiến độ
   tăng» không có số vẫn qua bộ kiểm.
   - Việc cần làm: câu có «tăng», «giảm», «tụt» hay «vượt» phải cùng dấu với chênh lệch
     mà mã đã tính cho KR được dẫn. Chỉ tốn một hàm thuần.
4. **Nút biến mất giữa mùa đặt OKR là một rủi ro niềm tin**, không chỉ là rủi ro tiền.
   - A tự tính: kịch bản vừa sẽ chạm trần $8 trong tháng đặt OKR.
   - Người dùng mất nút đúng tuần cần nhất mà không hiểu vì sao. Nên báo quản trị ở 80%
     như C, và để chủ kho quyết trước có giữ chỗ riêng cho mùa 21/12–11/01 không.
5. **Trần phiên trong chat là trần mềm.** Phiên có người mà vượt trần token thì eve hỏi
   *Approve / Stop*, và **Approve** mở một cửa sổ ngân sách mới (eve `agent-config.md`
   §Runtime limits).
   - Ở lượt 10, người dùng tự mở thêm ngân sách được. Trần lượt theo người mỗi ngày ở
     tầng app là bắt buộc, không phải tuỳ chọn. B và C có trần này; A mới nêu trần cho
     góp ý.

---

## 5. Ý tưởng đáng ghép vào phương án nền

**Từ B**

- **Sổ chi phí phủ mọi purpose ngay từ gia số 0.** Một hook mới ở gốc (tệp mới, không
  sửa `audit.ts`) gắn `research`, `builder`, `team-agent` với một id. Làn nghiên cứu đang
  tiêu chung $20 mà không có trần. Không đo nó thì trần OKR chỉ là một nửa bức tranh.
  - Lệch có chủ ý so với nguyên tắc «rút khung sau» của A. Đổi lại, A bỏ được W2 (đổi
    tên bảng sổ sau này).
- **Công tắc theo tính năng và công tắc ZDR.** Đặt trong `OkrProgramConfig`, bảng có
  phiên bản và thuộc bản rẽ, không đặt trong `AppSetting` của hãng. Nhờ vậy tắt được một
  loại gợi ý bị bác nhiều mà không tắt tóm tắt.
- **Bộ kiểm là hàm thuần trong `packages/validation`, và chạy lại lúc hiển thị.** Số đã
  đổi sau khi tóm tắt thì câu bị ẩn, thay vì hiện sai.
- **`inputHash`**: bấm lại mà đầu vào không đổi thì trả kết quả cũ, không gọi model.
- **Test tĩnh fail-closed**: không có lời gọi ghi nào lên model `okr*` dưới thư mục AI.
  Mở rộng thêm: `lib/okr/doc.ts` chỉ được chạm danh sách model cho phép.
- **Nút «hữu ích / không» trên bản tóm tắt**: một thước chất lượng cho đầu ra chỉ-đọc.

**Từ C**

- **Gói dữ liệu không mang tên người.** Chỉ id; màn tự ghép tên khi vẽ. Bộ kiểm bỏ câu
  có họ tên đầy đủ. NG-07 chuyển từ lời dặn sang cấu trúc.
- **Danh sách từ cấm cho NG-01, NG-02, NG-07** (lương, thưởng, xếp loại, xếp hạng, đánh
  giá nhân viên…), đặt trong config.
- **Khoá ngân sách suy nghĩ.** Đặt `reasoning` tĩnh trong `defineAgent` của subagent
  (eve có nút này, K3), rồi đo token suy nghĩ trong `usage`.
- **Báo quản trị ở 80% và 100% trần**, bằng một dòng trong Nhắc buổi sáng của quản trị
  chương trình.
- **Luật chống dồn dập**:
  - dòng AI tối đa hai dòng mỗi tin, đứng sau việc của người, bị cắt trước;
  - lượt 10 báo theo cạnh và nguội theo KR;
  - người nhận tắt được dòng AI;
  - đo tỷ lệ tắt Nhắc buổi sáng trước và sau khi bật AI.
- **Giữ bản tin lại khi quá 30% câu bị bỏ**, đánh dấu «cần xem» thay vì đăng.
- **Tool đọc tự đọc lại vai từ `member` mỗi lần gọi**, không tin bản chụp trong payload.
  Với A, áp cho `lib/okr/doc.ts` khi lượt 8 có mức hiển thị.
- **Việc riêng, độc lập với phương án thắng:** sửa lối rò Slack và lối chạy bằng danh
  tính người dựng của Tác nhân (K7), và cộng chi phí phiên con `agent_runner` vào
  `AgentRun`. Phần sửa là tổng quát, gửi lên hãng được.

**Từ A** (giữ khi ghép, đừng để bị pha loãng)

- ZDR và model tĩnh ở cấp agent của subagent.
- Không tool đọc ở lượt 9.
- Đầu ra nằm trong bảng riêng của khối OKR, đọc qua `okr.router`.
- Kênh chỉ mang con trỏ.
- Đối soát ±10% với Gateway.
- Không chạm tệp của hãng mà bản rẽ chưa từng sửa.

---

## 6. Khuyến nghị tổng hợp

**Nền: A.** Nhìn theo rủi ro, A là phương án duy nhất mà mức hỏng tệ nhất của cách ly
và của ZDR là «việc thất bại», chứ không phải «dữ liệu đi ra».

### 6.1 Bốn sửa bắt buộc trong A, trước Cổng Bằng chứng gia số 0

1. `ketQuaTroLy.lyDo` thành enum mã. Không chữ OKR nào quay về phiên gốc.
2. ZDR và `reasoning` đặt ở `modelOptions` và `reasoning` **cấp agent** của subagent.
   Cấm dùng selection động làm nơi duy nhất mang ZDR. Thêm một test ghim điều này.
3. Gói tóm tắt không mang tên người. Bộ kiểm bỏ câu chứa họ tên đầy đủ, và có danh sách
   từ cấm NG-01, NG-02, NG-07.
4. Công tắc theo loại việc (`gop-y`, `tom-tat-tuan`, và mỗi loại dòng gợi ý) trong
   `OkrProgramConfig`, ngoài `aiOn`.

### 6.2 Ghép

- Từ B: sổ chi phí phủ mọi purpose ngay gia số 0, bộ kiểm chạy lại lúc hiển thị,
  `inputHash`, test tĩnh «không ghi `okr*`, chỉ đọc model cho phép».
- Từ C: báo 80% và 100%, luật chống dồn dập, giữ bản tin khi quá 30% câu bị bỏ, đọc lại
  vai mỗi lần đọc.
- Từ giám khảo:
  - kiểm chữ chỉ chiều;
  - đo `cachedInputTokens` trên đường ZDR;
  - luật «gói dùng chung chỉ chứa thứ mọi người nhận đọc được», bắt đầu từ lượt 8.

### 6.3 Bỏ

- Stub che tool ở phiên gốc (B, C): không cần khi đã có subagent, và nó mang theo một
  kiểu hỏng chưa có tài liệu.
- DO-06 do model đề xuất đích (B).
- Cột mới trong `AppSetting` của hãng (B).
- Tác nhân do người ghép và lời dặn thêm tự do (C), ít nhất tới khi lượt 8 có số đo.
- Lưu đầu ra OKR trong `AgentRun` và `AgentAction` của hãng (C).
- Đổi `isAutomated` và `audit.ts` trong bản rẽ (C). Nếu cần thì gửi lên hãng, đừng vá
  riêng.

### 6.4 Chủ kho cần quyết

Lượt 9 vốn đã có hai câu hỏi mở cửa. Việc chọn phương án không thêm câu nào. Nhìn từ rủi
ro, câu ZDR nên trả lời kèm luật **«không có ZDR thì không gửi»**, tức fail-closed. Khi
đó sửa 6.1 số 2 là thứ giữ lời hứa đó.

---

## 7. Nguồn đã tự kiểm

**Mã** (bản chụp `scratchpad/onehub`, chỉ đọc)

- `apps/agent/agent/agent.ts`, `lib/model.ts`, `lib/session-purpose.ts`,
  `lib/approval.ts`, `lib/capabilities.ts`, `lib/builder-delegation.ts`,
  `lib/custom-agent-dispatch.ts` (dòng 377–409, 480–520), `lib/run-runtime.ts`
  (`queryRunCrm`, `postRunSlackMessage`, `approvedSlackDestination`)
- `apps/agent/agent/hooks/{audit,builder-delegation,telemetry,activity}.ts`
- `apps/agent/agent/instructions/task.ts`, `apps/agent/agent/instructions.md`
- `apps/agent/agent/subagents/agent_runner/{agent.ts, tools/finish_run.ts}`, danh sách
  `tools/`; danh sách `apps/agent/agent/{tools,subagents,skills,lib}`
- `apps/agent/agent/channels/eve.ts` (`repFromCrm` chặn `laVaiChiOkr`);
  `apps/app/app/eve/v1/[...path]/route.ts` (đòi `doi-tac`)
- `apps/api/src/agent/{agents.router.ts, agent-definitions.service.ts, agent-access.service.ts, agent-trigger.service.ts}`
- `apps/api/src/trpc/middlewares/pham-vi-du-lieu.middleware.ts` (`PhamViOkrMiddleware`)
- `packages/validation/src/{vai-workspace.ts, okr-vet.ts, okr-kr.ts}`
- `packages/db/src/settings.ts` (`DEFAULT_AGENT_MODEL = zai/glm-5.2-fast`)
- `packages/db/prisma/schema.prisma` (`AgentTask` có `sessionId` và chỉ mục
  `agentTask_nhac_mot_ngay`; `AppSetting`; `OkrProgramConfig`)
- `packages/telemetry/src/events.ts` (`agentError` chỉ gửi trường được phép)
- `packages/ui/src/components/suggestion.tsx`; `apps/agent/agent/lib/facts.ts` dòng 124
- `docs/agent.md` §Model, §What may be read, §Team-agent builder and runner;
  `docs/plan/lo-trinh-okr.md` lượt 9, 10, mục 6, 7; `CONTEXT.md` «Nhắc buổi sáng», «Trợ
  lý AI»
- `_acceptance/vai-chi-okr/contract.md` §Out of scope
- `git diff --stat origin/release origin/onehub` trên 15 tệp của hãng (chỉ đọc, trong
  kho crm)

**eve 0.29.4** (`apps/agent/node_modules/eve/docs`)

- `guides/dynamic-capabilities.md`: §Dynamic models, §Dynamic tools, §execute inline,
  §Conflicts, §Execution order
- `guides/hooks.md`: §Persist events, §Execution order, §What happens when a hook throws,
  §Subagent isolation
- `agent-config.md`: §Choose the model dynamically, §Reasoning effort, §Runtime limits,
  §Other defineAgent fields
- `subagents.mdx`: §The isolation boundary, §What the parent sees
- `concepts/default-harness.md`: §Disable a default, `Workflow`
- `guides/auth-and-route-protection.md`: `auth.current` và `initiator` có thể `null`
  trên đường nội bộ
- `evals/overview.mdx`: §Deterministic fixture models

**Nghiên cứu:** `02` dòng 34, 97 (lời phàn nàn về thông báo); `08` dòng 20, 127–133 (ZDR,
Z.ai); grep «reasoning» trên `08` và `raw/` không có kết quả.
