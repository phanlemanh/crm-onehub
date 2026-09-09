# Chặn uỷ thác agent_builder sai lượt

Ngày 2026-09-08 · slug `chan-uy-thac-sai-luot` · hạng T2 · `apps/agent`

## Chuyện đã xảy ra trên prod

Log runtime của `crm-onehub-agent` ngày 08/09 ghi lại trọn chuỗi:

```
07:54:21  ▸ session wrun_41M1Z84E8R0GRD93QZ72SPDS8Z on channel:crm
07:54:39  ◂ replied 1023 chars (stop)
07:56:10  » 48 chars  →  subagent agent_builder
07:56:35  tool execution failed ×6 — inspect_context ×3, write_agent_file ×3
          'Agent creation requires an explicit request to create or build an agent.'
            at requireBuilderAttribute
08:00:13  GET /eve/v1/session/wrun_41M1Z…/stream
08:02:14  GET /eve/v1/session/wrun_41M1Z…/stream
```

Gốc uỷ thác sang `agent_builder` ở một lượt không mang `commandType: CREATE_AGENT`.
Mọi tool của builder từ chối. Trình duyệt vẫn hỏi luồng phiên sáu phút sau.

Hạ tầng sạch: cron chạy đúng mỗi 60 giây, 24 giờ không một dòng 5xx, không
rate-limit, không hết credit. Đây không phải lỗi Vercel.

## Ranh giới quyền không hỏng — cách nó từ chối mới hỏng

`requireBuilderAttribute` (`agent/lib/session-purpose.ts`) đòi hai điều kiện và
**ném `Error`** khi thiếu. Ba hệ quả nối nhau:

1. Mô hình đọc `Error` như lỗi tạm nên thử lại — log cho thấy ba lần mỗi tool.
2. `agent_builder` chạy task mode với `outputSchema` chỉ nhận `draft_ready`
   (`agent/subagents/agent_builder/agent.ts`), nên **không có cửa ra hợp lệ** để
   con báo "bị từ chối". Con không kết thúc sạch được.
3. Cha không nhận kết quả nên lượt không settle. `continuationToken` mãi `null`,
   mà `builderConversationIsWorking` đọc đúng dấu hiệu đó, nên giao diện treo
   "đang chạy nền" vĩnh viễn. Không có `turn.failed` nên `latestTurnFailure` trả
   `null`, nên thẻ đỏ không bao giờ hiện.

Lệnh cấm uỷ thác chỉ tồn tại trong prompt (`agent/instructions/task.ts`, nhánh
không-CREATE_AGENT: *"Do not call agent_builder…"*). Hook mang tên
`builder-delegation.ts` chỉ **ghi nhận** rồi `return`; tài liệu eve nói rõ
*"Handlers are observe-only"* — hook không chặn được gì.

## Đường không đi, và vì sao

**Gỡ `agent_builder` khỏi bề mặt tool bằng resolver động.** Tên subagent nằm
chung namespace với tool tự viết, nên đặt `agent/tools/agent_builder.ts` là
trùng tên và eve **từ chối build**. Tài liệu cũng không hứa resolver động gỡ
được slot subagent. Và chính eve viết: *"Do not rely on subagent delegation by
itself as an approval boundary. Put sensitive tools behind `approval` … or
route/session authorization"* — chốt thuộc về tầng tool, đúng chỗ kho đang đặt.

## Thiết kế

### 1. Từ chối bằng `approval`, không bằng exception

eve có sẵn nguyên thuỷ cho việc này: policy `approval` chạy **trước khi tool
chạy**, nhận đúng `session.auth` mà `requireBuilderAttribute` đang đọc, và trả
được `{ type: "denied", reason }` để **mô hình nhận lý do**.

Mỗi tool kiểm quyền của builder (`inspect_context`, `write_agent_file`,
`save_agent_draft`) gắn cùng một policy dùng chung: lượt không mang
`purpose=builder` **và** `commandType=CREATE_AGENT` thì `denied` kèm lý do cố
định. Không còn gì để mô hình thử lại, và chốt phủ mọi cửa vào chứ không riêng
tool được gọi đầu tiên.

`requireBuilderAttribute` giữ nguyên chỗ cũ làm lớp trong: policy là cửa, hàm
ném là chốt cuối nếu có đường nào lọt qua cửa.

### 2. Cho con đường kết thúc sạch

`outputSchema` của `agent_builder` mở thành union rời rạc:

```
{ status: "draft_ready", summary, agentId, versionId }
{ status: "not_authorized", reason }
```

Task mode giờ có cửa ra hợp lệ khi bị từ chối, nên con settle thay vì chết treo.

### 3. Cha trả lời bằng lời

Nhận `not_authorized`, gốc nói với người dùng bằng lời — dựng tác nhân bắt đầu
từ nút Tạo tác nhân — rồi trả lời tiếp câu họ vừa hỏi. Không thẻ đỏ: định tuyến
sai là lỗi của máy, người dùng không gây ra nó.

### 4. Lưới an toàn: không bao giờ treo im lặng nữa

Ba phần trên chữa đúng đường đã gặp. Phần này chữa *lớp* lỗi: builder ném ở bất
kỳ đường nào khác thì lượt phải **settle thành thất bại** — `turn.failed` phát
ra, thẻ đỏ hiện, `continuationToken` được ghi, hội thoại thoát trạng thái "đang
chạy nền". Điều kiện này đứng độc lập với việc lần sau mô hình định tuyến sai
theo kiểu chưa gặp.

## Cách đo

Mỗi phép đo mới đi theo cặp hai chiều trên cùng fixture: vật lành cho xanh, phá
vật thật cho đỏ với thông điệp ghim. Cụ thể — lượt `CREATE_AGENT` qua được,
lượt `CHAT` bị từ chối với đúng chuỗi lý do đã ghim; bỏ policy khỏi một tool thì
phép đo "phủ mọi tool" phải đỏ; bỏ nhánh `not_authorized` khỏi schema thì phép
đo "kết thúc sạch" phải đỏ.

## Files

| File | Việc |
|---|---|
| `agent/lib/session-purpose.ts` | thêm hàm đọc quyền không ném, cạnh hàm ném hiện có |
| `agent/subagents/agent_builder/lib/authorization.ts` (mới) | policy `approval` dùng chung + chuỗi lý do ghim |
| `agent/subagents/agent_builder/tools/{inspect_context,write_agent_file,save_agent_draft}.ts` | gắn policy |
| `agent/subagents/agent_builder/agent.ts` | mở `outputSchema` thành union |
| `agent/instructions/task.ts` | chỉ dẫn cha xử lý `not_authorized` |
| lưới an toàn (chỗ settle) | xác định ở S2 |
| `apps/agent/test/chan-uy-thac.spec.ts` (mới) | bốn phép đo |
