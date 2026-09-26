# Hoàn thiện Hỏi CRM qua Zalo — thiết kế

Hồ sơ: `_acceptance/hoan-thien-hoi-crm-qua-zalo/` · hạng T2 · nối tiếp `hoi-crm-qua-zalo` (#158).

## Vì sao có vòng này

#158 lên production 26/09 20:48 ngay sau merge (Vercel tự triển khai `onehub`; build API tự
chạy `prisma migrate deploy`). Log production 20:53–20:54 cho thấy đường chính chạy đúng:
webhook 200, phiên `channel:zalo`, gọi `search_crm` và `read_company_history`, trả lời
trong ~4 giây. Cùng log đó, ở mọi bước của câu thứ hai, eve in:

```
[eve:dynamic-tools] Dynamic tool "set_field_value" references step function
"eve:framework-dynamic:zalo-chi-doc:set_field_value" which is not registered — skipping on this step.
```

cho cả 22 tên mà `tools/zalo-chi-doc.ts` thay. `harness/tool-loop.js` chỉ ghi đè công cụ
động lên bộ công cụ tĩnh theo tên, nên khi bản thay bị bỏ qua thì công cụ ghi gốc còn nguyên
trong tay model. Lời hứa «trên Zalo không ghi được gì» (AC-7 của hồ sơ cũ) hiện chỉ đứng bằng
chỉ dẫn. Hợp đồng cũ đã khai đúng lỗ này là Known limit «eve chọn bản ghi đè không có phép đo
máy»; nay nó đã xảy ra.

Vòng này gom ba nhóm việc còn treo của hồ sơ cũ, chủ kho đồng ý gộp 26/09:

- **A** — chặn ghi nằm trong chính công cụ, không dựa vào cơ chế ghi đè của framework.
- **B** — Known limit Ngoài-6 (tin không chữ thành câu hỏi rỗng) và Ngoài-7 (số tiền ≥ 1.000
  tỷ bị che như số điện thoại).
- **C** — Known limit Ngoài-8..15: tám chỗ test của hồ sơ cũ có thể xanh giả; Ngoài-9 đóng
  bằng phép đo mới của A.

Kèm theo (T1, không AC): `docs/plan/lo-trinh-zalo.md` dòng 3 (đã merge #144) và dòng 4 (bỏ
«production chưa có `ZALO_*`, chưa db:deploy», ghi ngày lên production 26/09), và
`opportunity.md` của hồ sơ cũ — đồng hồ Cổng Giá trị tính từ 26/09.

## A — chặn ghi trong công cụ

**Hiện trạng** (`apps/agent/agent/tools/`, 19 tên trong `ZALO.hoi.congCu.ghi`):

| Nhóm | Công cụ | Chặn hôm nay |
| --- | --- | --- |
| đã chặn theo mục đích | `enrich_company`, `fetch_contact_photo`, `identify_contact`, `record_fact`, `record_job_change`, `schedule_recheck`, `set_contact_socials`, `write_brief`, `write_workspace_profile` | `assertResearchPurpose` — ném lỗi ở mọi mục đích khác `research` |
| chặn builder | `set_chat_title` | ném lỗi ngoài `builder` |
| chưa chặn gì | `archive_field`, `manage_fields`, `set_field_value`, `research_company`, `research_person`, `find_contact_socials`, `get_contact_work_history`, `get_linkedin_profile`, `resolve_linkedin_profile` | không |

Khung chat web không đặt `purpose`, nên `purposeOf` lùi về `research`; mọi công cụ trên vẫn
phải chạy ở web.

**Thiết kế:**

1. Thêm `assertNotZaloQuestion(ctx)` vào `lib/session-purpose.ts` — ném
   `Error(ZALO.hoi.tuChoiGhi)` khi `purposeOf(ctx) === "zalo"`, không làm gì ở mục đích khác.
   Gọi nó ở **dòng đầu** `execute` của cả 19 công cụ trong `ghi`, kể cả những công cụ đã có
   `assertResearchPurpose` — để trên Zalo mọi công cụ bị chặn trả **cùng một** câu từ chối,
   và phép đo ghim được một thông điệp. Chặn ở dòng đầu nghĩa là không có tác dụng phụ nào
   trước nó.
2. `web_fetch` (công cụ có sẵn, chạy trong app runtime): thêm tệp tĩnh `tools/web_fetch.ts`
   bọc `webFetch` của `eve/tools/defaults` theo đúng mẫu «Override a default» của
   `eve/docs/concepts/default-harness.md` — gọi `assertNotZaloQuestion` rồi chuyển cho
   `webFetch.execute`. Tên `web_fetch` chuyển từ `coSanChan` sang `ghi` (tệp giờ tồn tại, bánh
   cóc «mỗi tệp thuộc đúng một danh sách» đòi vậy).
3. `tools/zalo-chi-doc.ts` giữ nguyên nội dung nhưng đổi sự kiện `session.started` →
   `step.started`. Công cụ của `step.started` là «live tools» dựng lại trước mỗi lần gọi
   model (`dynamic-tool-lifecycle.js`: `setVirtualContext(LiveStepToolsKey, …)`), không đi
   đường dựng lại từ tên hàm bước như `session.started` — đó là đường đang hỏng ở production.
   Lớp này chỉ để **ẩn** công cụ khỏi model (đỡ một bước gọi vô ích, lời nhắc ngắn hơn); lớp
   chặn thật là (1) và (2). Nếu eve cũng bỏ qua ở đường này thì chỉ mất lớp ẩn.
4. Không đổi: `ask_question` (không có bản tĩnh để bọc; nếu model hỏi lại thì
   `input.requested` → `canHoiLai` đã đóng câu và báo người, AC-2 của hồ sơ cũ); `web_search`
   (nhà cung cấp chạy, không qua `execute` nào trong kho — chỉ ẩn được bằng (3)); công cụ hộp
   cát (`bash`, tệp — hộp cát `deny-all`, không có `DATABASE_URL`, `docs/agent.md` mục Sandbox);
   `agent` (đã `disableTool`).

**Phép đo:**

- Ma trận toàn phần viết trước: tập công cụ ghi rút từ thư mục (mọi tệp `tools/` không thuộc
  `doc` hay `tat`) phải bằng đúng danh sách 20 tên ghim trong test — một công cụ ghi bị xếp nhầm
  sang `doc` làm đỏ. Nạp module thật, gọi `execute({}, ctx zalo)` → ném đúng
  `ZALO.hoi.tuChoiGhi`; cùng module với `ctx` của **mỗi** mục đích khác (`research` như khung
  chat web, `builder`, `team-agent`) → không ném câu đó. 20 ca Zalo, 60 ca đối chứng. `ctx`
  Zalo rút từ `auth` mà eve giả ghi lại khi webhook thật mở phiên, không dựng tay `purpose`.
- Sâu (đóng Ngoài-9): `set_field_value` và `record_fact` thật trên liên hệ thật — phiên Zalo:
  giá trị và số hàng không đổi; phiên web cùng đầu vào: giá trị đổi và số hàng tăng đúng 1
  (chứng thước nhìn thấy được lần ghi của cả hai công cụ).
- `web_fetch`: máy chủ `Bun.serve` cục bộ đếm yêu cầu — phiên Zalo: ném câu từ chối, máy chủ
  nhận 0 yêu cầu; phiên `research`: nhận 1 yêu cầu và thân trả về chứa chuỗi máy chủ phát.
- `zalo-chi-doc`: `events["step.started"]` với phiên zalo trả đúng tập `ghi ∪ coSanChan`, mọi
  bản thay từ chối; phiên khác trả `null`; `events["session.started"]` không còn.
- Không phép đo máy nào trong kho tái hiện được replay của runtime workflow. Sau khi lên
  production: một phiên hai câu, `vercel logs` không còn dòng `not registered` nào của
  `zalo-chi-doc` — ghi ở Notes, là việc của phiên nghiệm thu.

## B — tin không chữ và số tiền

**Tin không chữ** (chủ kho chọn (a) 26/09): tin của người đã nối không mang `text` (sticker —
`message.sticker.received`, ảnh — `message.image.received` với `photo_url`/`caption`, tệp),
hoặc `text` chỉ có khoảng trắng, trên đường có hỏi (`deps.hoi`) → bot trả đúng một câu mới
`ZALO.loi.chiDocChu` — «Tôi chỉ đọc được tin chữ. Gõ câu hỏi của bạn ở đây nhé.» — không
`hoiTacTu`, không hàng `ZaloHoi`, không `send` sang eve, không tính vào trần. Chặn nằm trong
`khongMa` của `lib/zalo-nhan.ts`, ngay trước `hoiTacTu` và sau lệnh `xong`/`mới` (hai lệnh
cần chữ nên không bị ảnh hưởng). Giữ nguyên: người chưa nối vẫn nhận `huongDan`; đường luật
cũ không có `deps.hoi` vẫn trả `daNoiRoi`. Người đã nối vai chỉ OKR gửi sticker cũng nhận
`chiDocChu` — không lộ gì, và câu chữ kế tiếp của họ vẫn bị cổng vai từ chối như cũ.

Webhook không lọc theo `event_name`, nên mọi loại tin không chữ đi cùng một đường. Phép đo dựng
bốn tin (sticker, ảnh, ảnh chú thích rỗng, chữ toàn khoảng trắng) từ mẫu tin thật
`test/fixtures/zalo-tin-that.json`, chỉ đổi `event_name` và các trường nội dung. Ảnh có chú
thích chữ vẫn là tin không chữ ở vòng này (chú thích nằm ở `caption`).

**Số tiền:** `SO_DIEN_THOAI` trong `lib/zalo-loc.ts` khớp nhóm «000.000.000.000» đứng sau
«1.» vì nhánh `0\d{1,4}` chỉ cấm đứng sau chữ số hay `+`. Không nới luật số điện thoại (nhìn lùi
cấm «chữ số + dấu phân cách» làm lọt «0912345678,0987654321» — phản biện F3). Thay vào đó `che`
tách trước những đoạn có **dạng số tiền** — bắt đầu bằng chữ số 1–9, rồi ít nhất hai nhóm đúng
ba chữ số nối bằng cùng một dấu chấm hoặc phẩy — và chỉ che số điện thoại ở phần còn lại. Số
điện thoại bắt đầu bằng 0 hay «+» không bao giờ có dạng đó. Ma trận số tiền viết trước, ma trận
số điện thoại đứng liền sau số khác viết trước, và ma trận `loc-che` hiện có chạy lại làm đối
chứng.

## C — siết thước hồ sơ cũ

Mỗi mục sửa trong tệp test của hồ sơ `hoi-crm-qua-zalo`; mọi mục có chiều đỏ chạy thật ở S3
bằng cách phá vật trong bản sao, ghim thông điệp.

| Mục | Sửa |
| --- | --- |
| Ngoài-8 | E13 (`nguong`): hàng `tu-choi-tran-ngay` và `dang-ban` sinh bằng `hoiTacTu` thật chạm trần, không `create` tay |
| Ngoài-10 | `cai-lenh` «không lộ số»: khẳng định trước là đã có đúng một `sendMessage` và nó chứa `[đã ẩn]`, rồi mới khẳng định không có số |
| Ngoài-11 | `input.requested`: token mới **bằng** `bo:<hoiId>` của đúng hàng, không chỉ «khác token cũ» |
| Ngoài-12 | sự kiện kênh dùng `ctx`/`continuationToken` rút từ lời gọi `send` mà eve giả ghi lại, không dựng tay |
| Ngoài-13 | `luat-cu` ô (c): đọc lại bước trong DB có `completedAt` khác null, không so chuỗi câu trả lời |
| Ngoài-14 | «trả lời muộn»: khẳng định `cu.loai === "hoi"` thành một assert, bỏ `if`; log ghim đúng một chuỗi, không OR |
| Ngoài-15 | cổng vai chung: gọi hàm của khung chat web với vai `okr` và người mất `member` → từ chối, thay grep `channels/eve.ts` |

Ngoài-3 (tên `zalo-chi-doc` trong allowlist telemetry và `TOOL_VERBS`) không làm — ghi
`descope` trong sổ.

## Không đổi

Ranh giới dữ liệu A, trần 20/3/1.500, bảng `ZaloHoi`, telemetry `zalo_questions`, chỉ dẫn
`CHI_DAN_ZALO`. Không migration, không biến môi trường mới.
