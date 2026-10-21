# Thiết kế (bản phác trên giấy): re-mo-hinh-mac-dinh (MH2)

Hàng `MH2` của lộ trình Kho tài liệu, mốc 30/10 (đợt viec-du-an-kho-tai-lieu đặt hạn làn 22/10). Câu giao: «Tác nhân CRM
và Trợ lý Kho tài liệu dùng model mặc định rẻ hơn mà không tụt chất lượng trên bộ đo». Cổng Đáng ký `build` (manh,
2026-10-19). Đứng sau MH4 (`model-theo-vai-do-lai`, #524 gộp onehub 112bf6d46): MH2 áp bảng kiến nghị của MH4 vào code
sản phẩm rồi đo xác nhận trên code đã đổi.

## Đọc trước khi chạm

`docs/agent.md` mục «Model» (bảng chỉ mục AGENTS.md cho `apps/agent`): model mặc định là hằng `DEFAULT_AGENT_MODEL` trong
`@crm/db/settings`, ô `AppSetting.agentModelId` có giá trị thì thắng, bộ giải `modelTheoVai` lùi về mặc định khi model
không còn trong danh mục Gateway. Kho tài liệu khai model riêng trong `apps/agent/agent/lib/tai-lieu-config.ts`.

## Hiện trạng và chỗ đổi (tra code 21/10)

| Vai | Đang chạy | Khai ở | Đổi ở MH2 |
|---|---|---|---|
| Tác nhân (agent gốc CRM, phiên gốc Zalo, phiên nghiên cứu `research`, bộ dựng, bộ chạy; API Cài đặt đọc `defaultId`) | `zai/glm-5.2-fast` | `packages/db/src/settings.ts` `DEFAULT_AGENT_MODEL` | Hỏi-1 |
| Trợ lý kho (`hoi`, phiên gốc kho) | `zai/glm-5.2-fast` | `tai-lieu-config.ts` `hoi.maModel` | Hỏi-3 |
| Máy soạn kho (`soan`) | `zai/glm-5.2-fast` | `tai-lieu-config.ts` `soan.maModel` | Hỏi-2 (khuyên giữ) |
| Soạn OKR, Judge OKR | Gemini 3.8 Flash, GLM 5.2 Fast | `apps/agent-okr`, `apps/agent/agent/lib/okr` | không đổi (bảng MH4 giữ) |

- Không migration hay seed nào ghi sẵn `agentModelId` (migration `20260802120000_app_settings` cố ý không seed), nên
  workspace chưa chọn model chạy mặc định mới ngay khi bản lên; workspace đã chọn giữ model của mình.
- Màn Cài đặt (`settings/agent-model.tsx`) lấy tên mặc định từ API và danh mục Gateway, không ghim tên.
- `TAI_LIEU_AGENT.bangGia` chỉ có dòng `zai/glm-5.2-fast`; thiếu dòng thì chi phí kho ghi 0 lặng lẽ và hai test ranh giới
  vỡ kiểu → thêm dòng giá của model kho mới (giá niêm yết chụp 21/10 ở `ke-hoach.json` của MH4).
- Test theo hằng: `model-lui-mac-dinh.integration.spec.ts` đòi mặc định có trong fixture danh mục Gateway 05/10 (có
  `zai/glm-5.3-flash`, không có `deepseek/deepseek-v4.1-flash-1017`); `packages/db/test/measure-db-model.spec.ts` đòi model
  kho đo (`google/gemini-3.8-flash`) khác mặc định.
- `docs/agent.md` dòng «Default `zai/glm-5.2-fast`» phải đổi theo.

## Câu chỉ người trả lời (lên Cổng Phạm vi)

- **Hỏi-1 — model mặc định Tác nhân.** Khuyên `zai/glm-5.3-flash` ở suy luận mặc định: MH4 đo 5/5 lượt qua (cả mặc định
  lẫn `low`), tiền thật khoảng 0,007 USD mỗi lượt eval bộ dựng so với DeepSeek 0,016 (Gateway tính DeepSeek gấp 4 lần giá
  niêm yết — Known limits Ngoài-2 của MH4). Lối khác: DeepSeek theo kiến nghị chữ của bảng MH4.
- **Hỏi-3 — model Trợ lý kho.** Khuyên `deepseek/deepseek-v4.1-flash-1017`: ứng viên duy nhất đạt ngưỡng kho của MH4 (1 câu
  lỗi, khoảng 0,34 USD mỗi lượt bộ 50 câu). Lối khác: Gemini 3.8 Flash theo câu chủ kho 21/10 «Tỷ lệ lỗi của Gemini 3.8
  Flash chấp nhận được» — 3 câu lỗi (ngưỡng 2), khoảng 1,87 USD mỗi lượt.
- **Hỏi-2 — máy soạn kho.** Khuyên giữ `zai/glm-5.2-fast`: chưa có thước, không chứng được «không tụt chất lượng». Lối
  khác: đổi cùng Trợ lý kho, chỉ có test ranh giới chứng.
- **Hỏi-4 — đo xác nhận.** Khuyên 5 lượt eval bộ dựng với ô Cài đặt trống và 1 lượt bộ 50 câu kho trên code đã đổi, trần
  3 USD. Lối khác: không đo lại, dùng số MH4.

Ngưỡng xác nhận dùng lại ngưỡng MH4 đã ký (`_acceptance/model-theo-vai-do-lai/rang/nguong.json`): Tác nhân ≥ 4/5 lượt qua
dưới 180 giây; Trợ lý kho mỗi tầng không kém mốc 13/10 quá 1 câu, câu lỗi ≤ 2.

- **Hỏi-6 — ngưỡng Cổng Giá trị và mốc «rẻ hơn».** Khuyên sống khi tiền Gateway thật mỗi lượt của mỗi vai đổi model thấp
  hơn mốc ít nhất 50% và chất lượng đạt ngưỡng MH4; mốc Tác nhân lấy `aichiphi-moc-*` của MH3 (GLM 5.2 Fast khoảng 0,114 USD
  mỗi lượt), mốc kho tính bằng token của chính lượt xác nhận × giá GLM 5.2 Fast trong `bangGia`. Lối khác: chạy thêm một lượt
  kho GLM 5.2 Fast làm mốc thật (2–3 USD).
- **Hỏi-7 — ô Cài đặt production.** Khuyên không ghi đè; chủ kho kiểm `AppSetting.agentModelId` trên Neon trước khi gộp, ô đã
  chọn `zai/glm-5.2-fast` thì xoá ô trên màn Cài đặt sau khi bản lên. Lối khác: bước di trú xoá ô đang bằng model cũ.
- **Hỏi-5.** Khuyên ghi giá Gateway tính thật vào `bangGia` (DeepSeek: 4 lần niêm yết theo MH4). Lối khác: giá niêm yết.

## Nơi tiêu thụ model mặc định (răng của AC-2)

`packages/db/src/settings.ts` (khai) · `apps/agent/agent/lib/model.ts` (`MODEL_GOC`, `modelTheoVai` lùi về mặc định cho vai
`tro-ly` và `tac-nhan`: agent gốc CRM, phiên gốc Zalo, phiên `research`, `builder`, `team-agent`; `modelChoLuot`) ·
`apps/agent/agent/subagents/agent_builder/agent.ts` · `apps/agent/agent/subagents/agent_runner/agent.ts` ·
`apps/api/src/settings/settings.service.ts` (`defaultId` cho màn Cài đặt). Răng `rang/so-mh2.ts --tieu-thu` grep mã nguồn và
so đúng danh sách này.

## Đo xác nhận

Thước mới `rang/so-mh2.ts` của hồ sơ này, tái dùng thước MH4:
- Tác nhân: chạy `eve eval agent-builder` trên kho đo riêng với `agentModelId` = null (mặc định mới), như
  `do-tac-nhan.ts` của MH4 nhưng không sửa tạm hằng nào; ghi model Gateway trả cho phiên con `agent_builder`.
- Trợ lý kho: `bun run do:man --chay` chạy `_acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts --do` trên code đã đổi, sau khi
  đặt `agentModelId` của kho đo về null (kho đo gieo sẵn Gemini cho agent gốc); kết xuất aiChiPhi và model Gateway trả.
- Mọi lượt gọi model chạy dưới khoá s4 của đợt.
