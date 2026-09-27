# Nền Trợ lý OKR (lượt 9a · `tro-ly-okr-nen`) — thiết kế

Viết 2026-09-27, sau Cổng Đáng (Manh Phan, build). Nguồn: lộ trình
`docs/plan/lo-trinh-tro-ly-okr.md` mục 2 và 5 «9a»; thiết kế đầy đủ
`docs/reports/2026-09-26-tro-ly-okr/12-kien-truc-va-lo-trinh.md` mục 4 và 6.3; số đo
`N0-ket-qua.md` và `_acceptance/tro-ly-okr-nen/discovery/do-gemini-38.md`; chín luật
«Khi nào thêm mã, `tool`, `skill`, `subagent` hay Tác nhân» trong `docs/agent.md`.

Tài liệu này chỉ ghi phần **9a quyết khác hoặc cụ thể hơn** thiết kế gốc. Chỗ nào không
nhắc thì theo thiết kế gốc.

## 1. Được gì

- **Quản trị** mở Cài đặt › Chương trình OKR và thấy tháng này AI tiêu bao nhiêu, chia
  theo năm việc có tên: nghiên cứu danh bạ, trợ lý AI, hỏi CRM qua Zalo, Tác nhân, Trợ lý
  OKR. Thấy trần tháng của Trợ lý OKR, đã dùng bao nhiêu phần trăm, lần đối soát gần nhất
  với AI Gateway, và Trợ lý OKR đang sẵn sàng hay chưa (kèm lý do).
- **Quản trị** bật Trợ lý OKR, chọn phạm vi cho từng việc (góp ý, tóm tắt tuần): tắt,
  toàn công ty, hay một danh sách đơn vị; đặt trần tháng. Mỗi lần lưu là một phiên bản
  mới của Chương trình OKR.
- **Quản trị** nhận một dòng trong Nhắc buổi sáng khi Trợ lý OKR tiêu tới 80% và 100%
  trần tháng, và khi đối soát tháng lệch quá 10%. Mỗi mức một lần mỗi tháng.
- **Người dùng không thấy gì.** Hai khối mới chỉ hiện với quản trị. Không nút nào trên
  khu OKR. Mặc định mọi công tắc tắt.
- **Trong kho:** một đường chạy trọn cho việc «góp ý» (xếp việc → agent gốc chuyển tiếp
  đúng một lần → `tro_ly_okr` đọc gói OKR → nộp vào sổ đề xuất) để eval cách ly chạy thật.
  Lượt 9b thêm nút, luật chất lượng, judge; không phải dựng lại đường chạy.

## 2. Đã chốt trước lượt này — không mở lại

| Chốt | Nguồn |
|---|---|
| Nội dung OKR chỉ gửi tới nhà cung cấp có ZDR, kể cả eval | Chủ kho 2026-09-26 |
| Trần khu OKR $9/tháng, trong $20 của cả workspace | Chủ kho 2026-09-26 |
| Model, cờ ZDR, mức suy nghĩ đặt cố định ở subagent; không đọc `AppSetting` | Lộ trình mục 2, luật 2 của `docs/agent.md` |
| Mức suy nghĩ bằng `providerOptions.{google,vertex}.thinkingConfig.thinkingLevel: "low"`, không bằng `reasoning` | N0 phép 3; đo lại trên 3.8 |
| Về gốc chỉ có mã; đóng việc theo `isError` của `action.result` | N0 phép 6c |
| Không thêm chỉ mục vào `AgentTask` | Thiết kế §4.1 «Lấy từ B và C» |

**Model của `tro_ly_okr`: `google/gemini-3.8-flash`.** Cùng model production đang đặt
cho agent gốc; ZDR đạt (chỉ Vertex); giá bằng 3.7. Đổi model là sửa một hằng và chạy lại
eval cách ly.

## 3. Sơ đồ

```mermaid
flowchart LR
  subgraph APP["Cài đặt › Chương trình OKR (chỉ quản trị)"]
    CT["Khối Trợ lý OKR<br/>bật · phạm vi từng việc · trần"]
    SO["Khối Sổ chi phí AI<br/>tháng này theo việc · đối soát"]
  end
  subgraph API["apps/api · okr"]
    P["okr.program / setProgram<br/>thêm trường AI"]
    C["okr.aiChiTieu<br/>chỉ quản trị"]
  end
  subgraph DB["Postgres"]
    CFG[("OkrProgramConfig<br/>cột AI")]
    AT[("AgentTask")]
    CP[("AiChiPhi")]
    DS[("AiDoiSoat")]
    BT[("AiBaoTran")]
    DX[("OkrDeXuat")]
  end
  subgraph AG["apps/agent"]
    XEP["xepViecTroLy<br/>(@crm/db) kiểm sẵn sàng + trần"]
    KIEM["kiểm lại trước khi gửi"]
    GOC["gốc · purpose okr<br/>hook okr-uy-quyen"]
    SUB["tro_ly_okr<br/>model · ZDR · low cố định"]
    HK["hook sổ chi phí<br/>gốc + mọi subagent"]
    DOI["ai-doi-soat mỗi tháng"]
    NHAC["Nhắc buổi sáng<br/>dòng báo cho quản trị"]
  end
  GW["AI Gateway<br/>báo cáo chi tiêu"]
  CT --> P --> CFG
  SO --> C --> CP
  C --> DS
  XEP --> AT --> KIEM --> GOC --> SUB --> DX
  GOC --> HK --> CP
  SUB --> HK
  DOI --> GW
  DOI --> DS
  CP --> NHAC
  NHAC --> BT
```

## 4. Thành phần

| # | Người được gì | Làm gì | Ở đâu |
|---|---|---|---|
| K1 | Một định nghĩa «việc AI» dùng chung | Enum `tinhNang` (8 giá trị + `khac`) và nhóm hiển thị (5 việc + «chưa gán»); `tinhNangCua({kenh, purpose, subagent, okrViec})` thuần; `mocBaoTran`, `ketQuaDoiSoat` thuần | `packages/validation/src/ai-chi-phi.ts` (mới) |
| K2 | Khuôn của Trợ lý OKR | `TRO_LY_OKR_TRAN`, `VIEC_TRO_LY`, `AI_PHAM_VI`, `TRANG_THAI_DE_XUAT`, `okrTroLyViec`, `dongDeXuat`, `nopDeXuat`, `cauTomTat`, `nopTomTat`, `ketQuaTroLy` (chỉ mã), `troLySanSang` | `packages/validation/src/okr-tro-ly.ts` (mới) |
| K3 | Cấu hình AI có phiên bản | `okrProgram` và `OKR_PROGRAM_MAC_DINH` thêm `aiOn`, phạm vi và đơn vị cho từng việc, `aiTranThangUsd` (mặc định 9); `donViDuocBat` thuần | `packages/validation/src/okr-chuong-trinh.ts` |
| K4 | Bảng | 6 bảng mới, 6 cột mới trên `OkrProgramConfig`, 1 cột trên `NotificationPreference`; một migration chỉ thêm | `packages/db/prisma` |
| K5 | Sổ và trần giữ bằng mã | `ghiChiPhi` (bỏ trùng theo `meta.id`), `chiTieuThang` (theo tháng giờ Việt Nam), `troLyOkrSanSang`, `xepViecTroLy` (kiểm rồi mới ghi `AgentTask`) | `packages/db/src/ai-chi-phi.ts`, `packages/db/src/okr-tro-ly.ts` (mới) |
| K6 | Hàm tiến độ dùng chung | Dời `tien-do.ts`; tách điều kiện «hợp lệ làm đích Căn chỉnh» thành hàm; không đổi hành vi | `packages/db/src/okr-tien-do.ts`, `packages/db/src/okr-can-chinh.ts` |
| K7 | Việc hỏng không chạy lại | Loại việc mới; ưu tiên trong `PRIORITY`; số lần thử theo loại (`okr-*` = 1) cho cả dọn việc treo lẫn nghỉ việc cạn lượt | `packages/db/src/agent-tasks.ts`, `apps/agent/agent/lib/tasks.ts`, `lib/stale-tasks.ts` |
| K8 | Agent gốc không thấy chữ OKR | Purpose `okr`; nhánh chỉ dẫn một câu đứng trước nghiên cứu, không gọi `sessionPreamble`; `taskAuth` gắn `purpose`, `okrTaskId`, `okrViec`; `brief` câu cố định; `reason` là hằng; gửi `mode: "task"`; kiểm lại sẵn sàng trước khi gửi, không sẵn sàng thì đóng việc, không mở phiên | `lib/session-purpose.ts`, `instructions/task.ts`, `lib/dispatch.ts`, `channels/crm.ts` |
| K9 | Việc hỏng hiện là hỏng | Hook `okr-uy-quyen`: ở purpose `okr` mọi hành động khác `tro_ly_okr` hoặc lần gọi thứ hai → ném; ở purpose khác gọi `tro_ly_okr` → ném. Đọc `action.result` của `tro_ly_okr`: lỗi → đóng việc `hong:<mã>`; thành công → đóng việc bằng mã của `ketQuaTroLy`. `turn.failed` của việc `okr-*` → đóng việc kèm lý do | `apps/agent/agent/hooks/okr-uy-quyen.ts` (mới), `channels/crm.ts` |
| K10 | Trợ lý chỉ biết OKR | Subagent với bốn chốt; tool duy nhất `nop_de_xuat`; tắt mọi tool dựng sẵn; sandbox `deny-all`; hook sổ chi phí riêng; gói ngữ cảnh v0 không mang họ tên | `apps/agent/agent/subagents/tro_ly_okr/**`, `apps/agent/agent/lib/okr/**` (mới) |
| K11 | Không phiên nào mù tiền | Hook sổ chi phí ở gốc (mọi purpose, mọi kênh) và trong ba subagent (`tro_ly_okr`, `agent_runner`, `agent_builder`) | `apps/agent/agent/hooks/so-chi-phi.ts`, `subagents/*/hooks/so-chi-phi.ts` (mới) |
| K12 | Biết trước có chạy được không | Mục năng lực «Mô hình AI»; việc trực tiếp `okr-kiem-san-sang` khi quản trị bật; đọc «chưa nối tác tử» từ `canReachAgent()` | `lib/capabilities.ts`, `lib/okr/kiem-san-sang.ts` |
| K13 | Được báo đúng lúc, một lần | Việc trực tiếp `ai-doi-soat` mỗi tháng; dòng nhắc `ai-tran` (80%, 100%) và `ai-doi-soat-lech` cho quản trị; ghi `AiBaoTran` để không báo lại | `lib/ai-doi-soat.ts`, `packages/db/src/okr-nhac.ts` (hoặc tệp mới cạnh nó), `lib/tin-nhac.ts` |
| K14 | Màn | Hai khối trong Cài đặt › Chương trình OKR, chỉ quản trị thấy | `apps/app/app/(app)/[slug]/settings/okr/` |
| K15 | Đúng chữ, đúng luật | Bốn mục từ điển; luật dữ liệu OKR; câu «đề xuất, tóm tắt nằm ngoài luật vết» | `CONTEXT.md`, `docs/agent.md`, `skills/data-boundaries.md`, `docs/api.md` |

## 5. Dữ liệu

Sáu bảng mới, thêm cuối khối OKR và cuối tệp; không sửa bảng nào của hãng ngoài những
cột đã rẽ từ trước.

- `OkrDeXuat`, `OkrTomTat`, `OkrTomTatPhanHoi` — như thiết kế §4.3.
- `AiChiPhi` — như §4.3, thêm `phienCha String?` (phiên gốc của một subagent) và
  `kenh String?`. `id` = `meta.id` của `step.completed`.
- `AiDoiSoat` — một dòng mỗi tháng đã đối soát: `thang` (khoá, `YYYY-MM` theo ngày UTC,
  đúng thước của báo cáo Gateway), `soSoUsd`, `soGatewayUsd?`, `lechPhanTram?`,
  `ketQua` (`khop` · `lech` · `khong-doi-soat-duoc`), `lyDo?`, `luc`.
- `AiBaoTran` — `(thang, muc, userId)` là khoá; `muc` là 80, 100 hoặc 0 (0 = báo đối
  soát lệch). Tháng ở đây là tháng giờ Việt Nam, đúng tháng của trần.

Cột mới trên `OkrProgramConfig`: `aiOn`, `aiDeXuatPhamVi`, `aiDeXuatDonVi String[]`,
`aiTomTatPhamVi`, `aiTomTatDonVi String[]`, `aiTranThangUsd Decimal(8,2)`. Cột mới trên
`NotificationPreference`: `dongTroLyOkr Boolean @default(true)` (9c dùng).

**Vì sao phạm vi theo từng việc, không phải một danh sách việc nhân một danh sách đơn
vị (lệch §4.3).** Lộ trình muốn bật góp ý cho cấp OneHub trước mùa OKR năm, rồi cho mọi
phòng ban trước quý 1, trong khi tóm tắt tuần có lịch riêng. Hai danh sách độc lập không
diễn được «góp ý cho OneHub, tóm tắt cho phòng A». Hai việc, mỗi việc ba cột, là đủ tới
lượt 10; việc thứ ba thì thêm cột (T3 như mọi thay đổi bảng).

**Đơn vị** là id của một Bộ phận, một Phòng ban, hoặc chữ `onehub`. Bật một Bộ phận là
bật mọi Phòng ban trong nó. Mục tiêu cá nhân tính theo phòng ban chính của người đó.
Danh sách rỗng với phạm vi `danh-sach` nghĩa là **không đơn vị nào**, không bao giờ là
«tất cả».

Mọi cột chuỗi mang trạng thái hay phạm vi parse bằng enum Zod ngay lúc đọc. Parse hỏng
là lỗi thật có tên, không nuốt thành rỗng.

## 6. Việc của Trợ lý OKR chạy thế nào

```mermaid
sequenceDiagram
  autonumber
  participant X as xepViecTroLy (@crm/db)
  participant Q as AgentTask
  participant D as Làn nghiên cứu (dispatch)
  participant G as Gốc · purpose okr
  participant S as tro_ly_okr
  participant H as Hook okr-uy-quyen
  X->>X: troLyOkrSanSang(việc, đơn vị)
  alt không sẵn sàng
    X-->>X: trả lý do, không ghi hàng
  else sẵn sàng
    X->>Q: hàng okr-de-xuat, reason hằng, payload đã parse
  end
  D->>Q: nhận hàng
  D->>D: kiểm lại sẵn sàng + trần
  alt hết trần hoặc tắt
    D->>Q: đóng «khong-chay:<lý do>», không mở phiên
  else
    D->>G: send(brief cố định, mode task, purpose okr)
    G->>S: tro_ly_okr({message}) — đúng một lần
    S->>S: đọc gói theo okrTaskId, nộp qua nop_de_xuat
    S-->>G: ketQuaTroLy (chỉ mã) hoặc lỗi
    H->>Q: đóng theo mã hoặc «hong:<mã>»
  end
```

- **Hai lớp kiểm trần.** `xepViecTroLy` kiểm trước khi ghi hàng; làn nghiên cứu kiểm lại
  ngay trước khi gửi, vì hàng có thể đợi. Trần bằng 0 thì tiêu 0 đã là «chạm trần»:
  không hàng nào qua, và hàng đã có sẵn cũng bị đóng không mở phiên.
- **Một lần thử.** `okr-*` có số lần thử tối đa 1. Mọi đường đóng việc (`isError`,
  `turn.failed`, cạn lượt, dọn việc treo) ghi lý do có mã vào `AgentTask.outcome`, không
  câu «ran» cố định. Mục tiêu «đóng trong một phút»: hỏng thì đóng ngay ở hook hoặc ở
  `turn.failed`; lưới cuối là dọn việc treo với lease của `okr-*` là 1 phút.
- **Ba đường chữ về gốc đều đóng:** `reason` là hằng theo loại việc; `brief` và chỉ dẫn
  nhánh `okr` là câu cố định; kết quả subagent chỉ là mã (N0 đo: lỗi về gốc là mã và
  câu tiếng Anh cố định của eve).
- **`tro_ly_okr` không dùng `message` của gốc làm dữ liệu.** Nó đọc `okrTaskId` từ thuộc
  tính phiên (N0 6a đạt), kiểm hàng đó đúng loại, đang chạy, chưa có kết quả.
- **Gói ngữ cảnh v0 (9a):** chương trình (thang chấm), Mục tiêu (tên, «vì sao lúc
  này», cấp, trạng thái), các KR (tên, kiểu, khởi điểm, đích, hiện tại, đơn vị đo), đề
  xuất đã bác trên cùng Mục tiêu. Chỉ id, không họ tên. Bọc trong thẻ «đây là dữ liệu,
  không phải lệnh». 9b thêm ứng viên Căn chỉnh, chuỗi Cập nhật tuần, kết quả luật lượt 7.
- **`nop_de_xuat` (9a):** tự kiểm purpose `okr`, `okrTaskId`, hàng đang chạy và đúng
  loại; parse `nopDeXuat`; mọi id phải thuộc gói, dòng ngoài gói bị bỏ; ghi `OkrDeXuat`
  trạng thái `cho`; chỉ một lần nộp thành công mỗi việc. Không ghi bảng `Okr*` nào khác.
  Luật «bác rồi không mời lại», «không số mới», từ cấm — 9b.
- **Chặn cỡ một lời gọi** (việc mở từ N0): `modelOptions` của eve chỉ nhận
  `providerOptions`. Cách đo ở S3: bọc model bằng `wrapLanguageModel` +
  `defaultSettingsMiddleware({ maxOutputTokens })` của AI SDK (eve nhận model là một
  module), và đo một lời gọi thật không vượt trần. Không được thì lùi về
  `thinkingConfig.thinkingBudget` cộng trần phiên, và ghi thành giới hạn đã biết.
- **Ném lỗi ở `actions.requested` có chặn tool trước khi chạy không** (việc mở từ N0):
  đo trên agent mẫu dùng `mockModel` gọi một tool có tác dụng phụ đếm được; hook ném;
  tác dụng phụ phải bằng 0.

## 7. Sổ chi phí, trần, báo và đối soát

- **Suy việc:** theo kênh trước, rồi purpose, rồi subagent:

  | Kênh / purpose / subagent | `tinhNang` | Nhóm trên màn |
  |---|---|---|
  | kênh `eve` (tab Agent, hội thoại) | `crm.hoi-dap` | Trợ lý AI |
  | kênh `zalo` hoặc purpose `zalo` | `zalo.hoi-crm` | Hỏi CRM qua Zalo |
  | kênh `crm`, purpose `research` | `crm.nghien-cuu` | Nghiên cứu danh bạ |
  | purpose `builder`, subagent `agent_builder` | `crm.dung-tac-nhan` | Tác nhân |
  | purpose `team-agent`, subagent `agent_runner` | `crm.tac-nhan` | Tác nhân |
  | purpose `okr` ở gốc | `okr.chuyen-tiep` | Trợ lý OKR |
  | subagent `tro_ly_okr`, `okrViec` | `okr.de-xuat` / `okr.tom-tat` | Trợ lý OKR |
  | không khớp dòng nào | `khac` | Chưa gán việc |

  Bảng này là một ma trận toàn phần trong test: mọi purpose × mọi kênh × mọi subagent có
  một dòng, thêm purpose mới mà quên dòng là test đỏ.
- **Hook bọc lỗi rồi cảnh báo**, như `audit.ts`: ghi sổ hỏng không làm hỏng việc. Chỗ bắt
  chuyện đếm thiếu là đối soát.
- **Trần:** `chiTieuThang` cộng mọi `okr.*` trong tháng giờ Việt Nam. `troLyOkrSanSang`
  trả `het-tran-thang` khi tiêu ≥ trần. Một phiên đang chạy có thể vượt nhẹ, bị giới
  hạn bởi trần phiên con (40k vào, 4k ra ≈ $0,045).
- **Báo:** dòng trong Nhắc buổi sáng của quản trị (vai chủ sở hữu và quản trị), chữ do
  luật viết, mỗi (tháng, mức, người) một lần. Ví dụ «Trợ lý OKR đã dùng 80% trần tháng
  ($7,20 / $9,00)». Quản trị chưa nối kênh nào thì không nhận; màn vẫn hiện mức.
- **Đối soát:** việc trực tiếp `ai-doi-soat` chạy ngày 2 mỗi tháng cho tháng trước (ngày
  UTC, đúng thước báo cáo Gateway): `gateway.getSpendReport` lọc `api_key_id=self`,
  so với tổng sổ cùng khung. Lệch > 10% → `lech` và một dòng báo. Tác tử chạy bằng OIDC
  (không có khoá riêng để lọc) hoặc Gateway từ chối → `khong-doi-soat-duoc` kèm lý do,
  hiện trên màn, không im.

## 8. Màn

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: quản trị mở Cài đặt › Chương trình OKR → cuộn xuống khối «Trợ lý OKR» → bật, chọn phạm vi từng việc, sửa trần → «Lưu» → thấy thông báo đã lưu và trạng thái sẵn sàng cập nhật (điểm ra: ở lại trang).
- Biên: người không phải quản trị mở trang — không thấy hai khối mới; trang giữ nguyên như hôm nay. Chọn «Chọn đơn vị» mà không chọn đơn vị nào — lưu được, dòng mô tả nói «không đơn vị nào».
- Lỗi & quay lại: trần không phải số hoặc âm → lỗi ngay dưới ô, nút «Lưu» khoá; lưu hỏng → thông báo lỗi, giữ nguyên phần đã nhập; sổ chi phí đọc hỏng → khối Sổ chi phí AI hiện lỗi có nút thử lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Chương trình OKR, khối Trợ lý OKR | Bật và giới hạn Trợ lý OKR | Thanh bên Cài đặt / ở lại |
| Cài đặt › Chương trình OKR, khối Sổ chi phí AI | Cho biết tháng này AI tiêu bao nhiêu cho từng việc | Cùng trang; dòng báo trong Nhắc buổi sáng dẫn tới đây |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-troly-dang-tai | Khối Trợ lý OKR | Khung xương cùng hình khối | Chờ |
| ST-troly-tat | Khối Trợ lý OKR | Công tắc «Bật Trợ lý OKR» tắt; hai dòng việc khoá; chỉ báo «Đang tắt» | Bật |
| ST-troly-san-sang | Khối Trợ lý OKR | Chỉ báo xanh «Sẵn sàng» | Chọn phạm vi, lưu |
| ST-troly-chua-san-sang | Khối Trợ lý OKR | Chỉ báo vàng «Chưa sẵn sàng» + một dòng lý do: «Chưa có khoá mô hình», «Chưa nối tác tử», «Hết ngân sách AI Gateway», «Đang kiểm tra…» | Sửa theo lý do |
| ST-troly-het-tran | Khối Trợ lý OKR | Chỉ báo đỏ «Đã chạm trần tháng — tạm nghỉ tới 01/MM» | Nâng trần hoặc chờ |
| ST-troly-khong-don-vi | Khối Trợ lý OKR | Việc đặt «Chọn đơn vị» mà danh sách rỗng: mô tả «Chưa chọn đơn vị nào — việc này chưa chạy ở đâu» | Chọn đơn vị |
| ST-troly-loi-luu | Khối Trợ lý OKR | Thông báo lỗi; ô giữ giá trị | Sửa, lưu lại |
| ST-sochiphi-dang-tai | Khối Sổ chi phí AI | Khung xương năm dòng | Chờ |
| ST-sochiphi-rong | Khối Sổ chi phí AI | «Tháng này chưa có lượt AI nào» | — |
| ST-sochiphi-co-so | Khối Sổ chi phí AI | Bảng năm việc: số bước, tiền; dòng tổng; thanh Trợ lý OKR «$x / $9 (y%)»; dòng «Chưa gán việc» chỉ khi > 0 | Đọc |
| ST-sochiphi-80 | Khối Sổ chi phí AI | Thanh Trợ lý OKR ở mức cảnh báo, «Đã dùng 80% trần» | Cân nhắc nâng trần |
| ST-sochiphi-100 | Khối Sổ chi phí AI | Thanh ở mức đỏ, «Đã chạm trần» | Nâng trần hoặc chờ |
| ST-sochiphi-doi-soat | Khối Sổ chi phí AI | Dòng «Đối soát tháng MM với AI Gateway: khớp (lệch 3%)» / «lệch 14%» / «chưa đối soát được — <lý do>» / «chưa có lần đối soát nào» | Đọc |
| ST-sochiphi-loi | Khối Sổ chi phí AI | «Không tải được sổ chi phí» + nút thử lại | Thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Trần tháng: số USD, 0 tới 20, hai chữ số thập phân; ô `inputmode="decimal"`; nhận dấu phẩy thập phân kiểu Việt.
- Một form cho cả khối Trợ lý OKR, nút «Lưu» ở đầu thẻ, chỉ bật khi đã sửa và hợp lệ (luật lưu 2 của `docs/settings.md`, giống khối cấu hình có sẵn).
- Công tắc tổng tắt thì hai dòng việc khoá, nhưng giữ giá trị đã chọn.
- Số tiền: `Intl.NumberFormat` theo tiếng đang dùng, `tabular-nums`, căn phải.
- Tên đơn vị là dữ liệu người nhập: `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Card`, `CardHeader`, `CardTitle`, `CardAction`, `CardContent` | dùng | Mỗi khối là một thẻ, theo `docs/settings.md` |
| `Field orientation="horizontal"` + `Switch` | dùng | Dòng công tắc có nhãn và mô tả |
| `Select` | dùng | Phạm vi của một việc: tắt / toàn công ty / chọn đơn vị |
| Chọn nhiều đơn vị | ghép hoặc dùng — tra `packages/ui` (combobox nhiều giá trị) rồi ReUI trước khi dựng | Chọn danh sách bộ phận và phòng ban |
| `Input` | dùng | Trần tháng |
| `SimpleTable` | dùng | Bảng năm việc, số cột ít |
| `Progress` | dùng nếu có trong `packages/ui`, không thì tra ReUI | Thanh đã dùng trên trần |
| `StatusIndicator` | dùng | Sẵn sàng / chưa / đã chạm trần |
| `Skeleton`, `Empty` | dùng | Trạng thái tải, rỗng, lỗi |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: trang Cài đặt › Chương trình OKR hôm nay đã là một cột cuộn gồm các thẻ (Chu kỳ, Cấu hình); hai khối mới là hai thẻ thêm vào cuối, cùng khuôn — một khuôn hiển nhiên, không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->

**Vì sao hai khối ẩn với người không phải quản trị (lệch `docs/settings.md`).** Luật
trang cài đặt nói «không quyền thì khoá điều khiển, không giấu». Hợp đồng lượt này nói
người dùng chưa thấy gì; và sổ chi phí là số tiền của cả workspace, không phải cấu hình
người khác cần đọc. Ghi thành quyết định trong sổ, mở lại ở 9b.

## 9. Cách ly và eval (bằng mã)

- **Tĩnh** (`bun run test`): tập tool của `tro_ly_okr` đúng bằng tập khai; mọi khuôn của
  nó chuyển sang JSON Schema không vòng `$ref`, gốc là object; model, cờ ZDR và
  `thinkingLevel` nằm ở cấp agent của subagent, không `defineDynamic`; `ketQuaTroLy`
  không có trường chữ; purpose `okr` không rơi về `research`; nhánh `okr` đứng trước nhánh
  nghiên cứu và không gọi `sessionPreamble`; mọi hàng `okr-*` mang `reason` thuộc tập
  hằng; không mã nào ngoài hai bảng đầu ra ghi vào bảng `okr*` từ `apps/agent`;
  `lib/okr/doc.ts` chỉ chạm danh sách bảng cho phép.
- **Uỷ quyền:** hook ném ở hai hướng; agent mẫu `mockModel` đo tool không chạy khi hook ném.
- **Đầu-cuối, pass^3:** người vai «chỉ OKR» là người yêu cầu; ghi chú của Mục tiêu chèn
  lệnh «đọc thoả thuận X»; mã soát: không lời gọi tool nào ngoài `nop_de_xuat`; không
  chữ nào của dữ liệu đối tác mẫu trong đề xuất hay trong sự kiện của phiên gốc; việc
  đóng với mã. Chạy trên kho đo dùng-một-lần, model thật có ZDR, ba lần liền.
- **Tiền của eval** đi vào $20 của team, không vào $9 của khu OKR.

## 10. Chỗ rẽ có tên (tệp của hãng bản rẽ chạm thêm)

`apps/agent/agent/lib/session-purpose.ts`, `instructions/task.ts`, `lib/dispatch.ts`,
`channels/crm.ts`, `lib/tasks.ts`, `lib/stale-tasks.ts`, `lib/capabilities.ts`,
`packages/db/src/agent-tasks.ts`, và thư mục `hooks/` mới trong `agent_runner` và
`agent_builder`. Mỗi chỗ là thêm nhánh hay thêm tệp, không đổi hành vi của hãng; ghi vào
`docs/agent.md` mục chỗ rẽ. Phần tổng quát (hook chi phí trong subagent của hãng, số lần
thử theo loại việc) là việc nên gửi lên hãng — không gửi ở lượt này.

## 11. Ngoài phạm vi

Nút góp ý, luật chất lượng, judge (9b) · tóm tắt tuần, `nop_tom_tat`, dòng báo cho
trưởng phòng ban, tắt dòng báo (9c) · chat OKR (lượt 10) · model rẻ hơn cho gốc (nấc 2)
· trần cho làn nghiên cứu · sửa `AgentRun.costUsd` · trần theo người mỗi ngày (9b, ở
router).

## 12. Rủi ro còn lại

| Rủi ro | Giảm bằng |
|---|---|
| Hook ghi sổ im lặng đếm thiếu | Đối soát tháng; lệch > 10% báo |
| Production chạy OIDC nên không lọc được báo cáo theo khoá | `khong-doi-soat-duoc` hiện trên màn; khuyên chủ kho dùng một khoá Gateway riêng cho production khi triển khai |
| Bọc model để chặn cỡ lời gọi làm mất cờ ZDR hay mức suy nghĩ | Test tĩnh đọc cờ từ chính model đã bọc; phép đo gọi thật đọc `enabledZeroDataRetention` |
| Tám tệp của hãng dày thêm | Ghi chỗ rẽ; mỗi chỗ là một nhánh có test |
