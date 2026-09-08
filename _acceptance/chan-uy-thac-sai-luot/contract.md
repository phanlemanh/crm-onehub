---
schema_version: 1
feature: Chặn uỷ thác agent_builder ở lượt không mang CREATE_AGENT — hiện tại chốt quyền ném exception, con không có cửa ra, và hội thoại treo "đang chạy nền" vĩnh viễn không một thẻ lỗi
slug: chan-uy-thac-sai-luot
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [agent]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-08T07:27:15Z
design_doc: docs/superpowers/specs/2026-09-08-chan-uy-thac-sai-luot-design.md
---

# Acceptance Contract: chan-uy-thac-sai-luot

## Bối cảnh

Log runtime prod của `crm-onehub-agent` ngày 2026-09-08 ghi trọn chuỗi hỏng:
gốc uỷ thác sang `agent_builder` lúc 07:56:10 ở một lượt không mang
`commandType: CREATE_AGENT`; sáu tool call của builder ném
`Agent creation requires an explicit request to create or build an agent.` tại
`requireBuilderAttribute`; trình duyệt vẫn hỏi `/eve/v1/session/…/stream` sáu
phút sau.

Hạ tầng sạch: cron chạy đúng mỗi 60 giây, 24 giờ không một dòng 5xx, không
rate-limit, không hết credit.

Ranh giới quyền **giữ đúng**. Ba thứ hỏng là: chốt từ chối bằng exception nên mô
hình thử lại; `outputSchema` của con chỉ nhận `draft_ready` nên không có cửa ra
hợp lệ khi bị từ chối; lượt không settle nên `continuationToken` mãi `null` và
giao diện treo, mà không có `turn.failed` nên thẻ đỏ cũng không hiện.

## Mốc ghim

SHA của cây TRƯỚC vòng này:

```
564cf56
```

Neo, đếm tại SHA ấy:

| Neo | Số |
| --- | --- |
| tool của `agent_builder` gọi `requireBuilderAttribute` | 3 |
| tool của `agent_builder` khai `approval` | 0 |
| nhánh hợp lệ trong `outputSchema` của `agent_builder` | 1 |
| chỗ trong mã chặn được uỷ thác sai lượt trước khi con chạy | 0 |
| lệnh cấm uỷ thác chỉ sống trong prompt | 1 |

## Acceptance criteria

**AC-1 — Lượt được phép vẫn dựng được agent, và fixture phải đúng khuôn thật.**
Given phiên mang `purpose=builder` và `commandType=CREATE_AGENT`,
When policy quyền chấm lượt ấy,
Then kết quả là cho đi tiếp, và mọi tool builder chạy như trước vòng này.
Chiều đỏ: đổi `commandType` thành `CHAT` trên cùng fixture thì kết quả phải lật
sang từ chối. Hai chiều dùng chung một fixture, khác đúng một trường.
**Sàn khuôn fixture:** fixture phiên **không được tự dựng đúng khuôn bên đọc**.
Khoá mà bài đo đặt thuộc tính vào phải được rút round-trip từ chính đường runtime
đặt nó, và bài đo phải khẳng định khoá ấy trùng khoá policy đọc. Không round-trip
được → **mã 2**. Lý do: một fixture đặt `commandType` ở tầng phẳng trong khi
runtime đặt trong `session.auth` sẽ cho cả hai chiều xanh trong khi prod từ chối
100% lượt, kể cả lượt bấm nút Tạo tác nhân.

**AC-2 — Lượt builder không mang CREATE_AGENT bị từ chối, kèm lý do đọc được.**
Given phiên `purpose=builder`, `commandType=CHAT`,
When mô hình gọi `inspect_context`,
Then policy trả `{ type: "denied", reason }` **trước khi** tool chạy, và `reason`
là chuỗi ghim đã khai — không phải chuỗi tự do, không phải `Error`.
Chiều đỏ: đổi chuỗi ghim trong bản sao → phép đo mã 1, nêu chuỗi nhận được.

**AC-3 — Chốt phủ mọi cửa vào, và lớp trong không được gỡ.**
Given danh sách **ghim cứng ba tên** `inspect_context`, `write_agent_file`,
`save_agent_draft`,
When soi từng tool,
Then **mỗi tool** thoả **cả hai vế**: khai policy dùng chung **và** giữ
`requireBuilderAttribute`. Số assert bằng đúng 3, không được chạy vòng lặp rồi
vứt số đếm.
Sàn dân số: đếm trên đĩa số tool gọi `requireBuilderAttribute` mà **khác 3** →
**mã 2**, nêu tên tool thừa hoặc thiếu. Không được để dân số trôi theo đĩa: gỡ
`requireBuilderAttribute` khỏi một tool sẽ làm "đếm được bao nhiêu thì đòi bấy
nhiêu" tự khớp và bỏ lọt một cửa hở.
Chiều đỏ: gỡ policy khỏi đúng một tool trong bản sao → mã 1, nêu tên tool.

**AC-4 — Mọi mục đích phiên không phải builder-được-phép đều bị từ chối.**
Given **ma trận toàn phần** trên tập giá trị `purposeOf` trả về — `research`,
`team-agent`, `builder` — nhân với `commandType` có/không `CREATE_AGENT`,
When gọi tool builder,
Then mọi tổ hợp **trừ** `builder`+`CREATE_AGENT` đều bị từ chối, cùng chuỗi lý do
ghim. Số assert bằng số phần tử của ma trận.
Sàn dân số: tập giá trị `purposeOf` đếm ra khác 3 → **mã 2**, nêu giá trị lạ.
Chiều đỏ: tổ hợp `builder`+`CREATE_AGENT` phải cho đi tiếp — nếu nó cũng bị từ
chối thì phép đo mã 1, vì khi ấy "từ chối tất" không phân biệt được với "policy
luôn đóng".

**AC-5 — Thiếu thuộc tính phiên thì đóng, không mở.**
Given phiên **không** có `purpose`, hoặc có `purpose=builder` mà **không** có
`commandType`, hoặc cả hai đều vắng,
When gọi tool builder,
Then cả ba hình dạng đều bị từ chối.
Chiều đỏ: nạp đủ hai thuộc tính hợp lệ trên cùng fixture → cho đi tiếp.

**AC-6 — Con kết thúc sạch bằng `not_authorized`.**
Given `outputSchema` của `agent_builder`,
When con bị từ chối và trả `{ status: "not_authorized", reason }`,
Then schema **nhận** giá trị ấy, và vẫn nhận `draft_ready` đủ trường như trước.
Chiều đỏ: gỡ nhánh `not_authorized` khỏi schema trong bản sao → phép đo mã 1.

**AC-7 — Cha trả lời bằng lời, không dội lỗi vào mặt người dùng.** (judgment)
Given cha nhận `not_authorized`,
When soạn câu trả lời,
Then câu ấy chỉ đường dựng tác nhân bắt đầu từ nút Tạo tác nhân, rồi trả lời tiếp
câu người dùng vừa hỏi; không đổ lỗi cho người dùng, không dùng từ kỹ thuật
(`commandType`, `subagent`, `schema`), không trình bày như một lỗi hệ thống.

**AC-8 — Hội thoại không bao giờ kẹt "đang chạy nền".** (cross-layer)
Given một lượt builder bị từ chối,
When lượt kết thúc,
Then hai vế phải **cùng** đúng, đo ở hai lớp, không vế nào được chép lại điều kiện
của vế kia:
- *vế agent* — hội thoại đã nhận mà không bao giờ settle thì **được thu hồi**:
  `recoverStalledBuilderTurns` ghi `continuationToken` và đánh submission
  `FAILED`/`TURN_ABANDONED`;
- *vế màn* — gọi **chính hàm** `builderConversationIsWorking` của `apps/app` trên
  hàng hội thoại vế agent vừa ghi, kết quả `false`.
Cấm viết lại điều kiện `sessionId && !continuationToken` theo trí nhớ ở bất kỳ vế
nào — đó là đường lùi tự chấm.
Chiều đỏ: hàng hội thoại chưa settle (`continuationToken = null`) → vế màn phải
trả `true`. Thiếu chiều này thì màu xanh không phân biệt được "không treo" với
"thước chưa bao giờ chạy".

**AC-9 — Builder ném ở đường khác thì lượt hỏng ra mặt, không treo.** (cross-layer)
Given một tool builder ném exception **không** đi qua cửa policy,
When lượt kết thúc,
Then hai vế cùng đúng:
- *vế agent* — hội thoại không nằm mãi ở trạng thái đang chạy: lượt thu hồi có
  mặt ở đúng cửa vào của lịch dispatch, và vị từ thu hồi đóng đúng ba hình dạng
  không được đụng;
- *vế màn* — hàm `latestTurnFailure` của `apps/app` biến một dòng sự kiện thất
  bại thành thẻ đỏ, và trả `null` cho lượt bình thường.
Đo **quan hệ** sự kiện → thẻ đỏ, **không** đo tên sự kiện có mặt: một sự kiện đúng
tên nhưng sai vỏ dữ liệu vẫn làm `latestTurnFailure` trả `null`, và người dùng vẫn
thấy hội thoại treo không thẻ đỏ — đúng triệu chứng prod vòng này hứa chữa.
Đối chứng dương: dòng sự kiện của một lượt bình thường → `latestTurnFailure` trả
`null`.
Sàn dân số: dòng sự kiện rỗng → **mã 2**.

**AC-10 — Lý do từ chối là hằng có tên, dùng chung một chỗ.**
Given chuỗi lý do,
When bất kỳ tool nào từ chối,
Then chuỗi đến từ **một** hằng được export, không phải chuỗi viết lại ở mỗi tool.
Chiều đỏ: viết lại chuỗi ấy tại chỗ ở một tool → phép đo mã 1, nêu `file:dòng`.

## Coverage

Quét bằng `morphological-scan`, preset test-matrix chạy lại test trục (trục của
preset — surface/role/dữ liệu/mạng — không phải chiều của bài này).

| Trục | Giá trị | Thước CE |
| --- | --- | --- |
| **A. Trạng thái quyền của lượt** | builder+CREATE_AGENT · builder+CHAT · research · team-agent · thiếu thuộc tính | `[SUY-TỪ-REPO: apps/agent/agent/lib/session-purpose.ts]` (`purposeOf` trả đúng ba giá trị) + `[SUY-TỪ-REPO: apps/agent/agent/lib/custom-agent-dispatch.ts:884]` (`builderCommandType`) |
| **B. Cửa vào builder bị chạm** | `inspect_context` · `write_agent_file` · `save_agent_draft` · `ask_question` · tool không kiểm quyền | `[SUY-TỪ-REPO: apps/agent/agent/subagents/agent_builder/tools/]` — đếm được trên đĩa |
| **C. Kết cục của lượt** | settle `draft_ready` · settle `not_authorized` · settle thất bại · treo · bị huỷ | `[SUY-TỪ-REPO: apps/app/lib/agent-builder-state.ts:56]` + `[SUY-TỪ-REPO: apps/app/lib/agent-transcript.ts:350]` + log prod 2026-09-08 |

Chân ngành: `[NGÀNH: eve 0.29.4]` — doctrine trong tài liệu ship kèm bản đã cài
(`apps/agent/node_modules/eve/docs/subagents.mdx:105`: *"Do not rely on subagent
delegation by itself as an approval boundary. Put sensitive tools behind
`approval` … or route/session authorization"*; `docs/tools/human-in-the-loop.md:55`:
policy trả `{ type: "denied", reason }`). Thiết kế theo đúng doctrine ấy, không tự
chế cơ chế.

"Thứ người dùng thấy" **không phải trục** — nó suy ra từ trục C, nên nằm ở
cross-cutting chứ không nhân thêm chiều.

Cross-cutting áp mọi ô Core: chuỗi lý do là hằng dùng chung (AC-10); mọi phép đo
mới đi cặp hai chiều trên cùng fixture.

## Out of scope

- **Gỡ `agent_builder` khỏi bề mặt tool bằng resolver động.** Tên subagent chung
  namespace với tool tự viết nên `agent/tools/agent_builder.ts` làm hỏng build;
  tài liệu eve không hứa resolver động gỡ được slot subagent. Đường này bị loại
  bằng bằng chứng, không phải bằng ưu tiên.
- **Đổi chuỗi hiển thị trên thẻ đỏ.** Lưới an toàn (AC-9) dùng thông điệp chung
  sẵn có của `agent-builder-tro-chuyen.ts`. Đặt riêng một câu cho ca này là việc
  của vòng khác — vòng này không chạm `apps/app`.
- **`ask_question` và các tool không kiểm quyền của builder** (`bash`, `glob`,
  `grep`, `read_file`, `web_*`, `todo`). Chúng không tạo được agent, và builder
  đã tắt phần lớn built-in.
- **Tool của runner (`agent_runner`).** Có chốt riêng `requireTeamAgentAttribute`,
  không dính vụ này. Lưu ý phân biệt: phiên `purpose=team-agent` **chạm tool của
  builder** thì **nằm trong** phạm vi và do AC-4 phủ — chính chỗ này là lỗ mà
  phản biện bắt được.
- **Ô "lượt bị huỷ" của trục C.** Huỷ đã có đường riêng đã đo
  (`agents.cancelRun` settle trong một giao dịch, `turn.cancelled` cũng settle —
  `docs/agent.md`), và huỷ không đi qua cửa policy. Không AC nào phủ ô này, có
  chủ ý.

## Notes

`requireBuilderAttribute` giữ nguyên tại chỗ làm lớp trong. Policy là cửa; hàm
ném là chốt cuối nếu có đường nào lọt qua cửa. AC-3 đo **cả hai vế** đúng vì lý do
đó — gỡ lớp trong "cho gọn" là một cửa hở im lặng.

**Lời hứa bị yếu đi so với bản đã chốt phạm vi — người ký phải thấy dòng này.**
AC-8/AC-9 lúc chốt hứa lượt hỏng **ra mặt ngay**. Thứ đã cài yếu hơn: hội thoại
treo tự gỡ **trong vòng 15 phút** (`DISPATCH.builder.turnLeaseMs`), và người dùng
thấy submission `FAILED` chứ không thấy thẻ đỏ tức thì. Lý do đổi nằm ở sổ quyết
định: dựng "làm lượt cha hỏng ngay" phải đoán trường thất bại của
`subagent.completed`, mà tài liệu eve mô tả sự kiện ấy đúng một dòng và không
khai trường nào. Đổi lại, đường thu hồi không phụ thuộc sự kiện nào của eve cả.
Mười lăm phút là con số tôi chọn, chưa ai duyệt.

**Giới hạn đã biết, do phản biện context sạch nêu và chủ ý hoãn:** AC-7 chấm
*chỉ dẫn* viết cho cha, không chấm *câu trả lời cha thật sự soạn*. Đo đầu ra thật
cần một lượt chạy end-to-end với model thật và cơ sở dữ liệu (đường
`bun run --filter=agent eval`), vòng này không dựng. Hệ quả: chỉ dẫn có thể đúng
giọng mà runtime vẫn dán trường `reason` kỹ thuật vào mặt người dùng, và hồ sơ
vẫn PASS. Đã ghim danh sách từ cấm và yêu cầu trả lời tiếp câu hỏi gốc vào E7 để
thu hẹp khe hở.
