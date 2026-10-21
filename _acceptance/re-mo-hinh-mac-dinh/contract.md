---
schema_version: 1
feature: Tác nhân CRM và Trợ lý Kho tài liệu dùng model mặc định rẻ hơn mà không tụt chất lượng trên bộ đo
slug: re-mo-hinh-mac-dinh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [agent]
status: approved
approved_by: manh
approved_at: 2026-10-21
design_doc: _acceptance/re-mo-hinh-mac-dinh/design.md
---

# Acceptance Contract: re-mo-hinh-mac-dinh

## Context

Hàng `MH2` của lộ trình Kho tài liệu. Cổng Đáng ký `build` (manh, 2026-10-19T14:59:33Z, `opportunity.md`). MH2 áp bảng
kiến nghị của MH4 (`docs/model-theo-vai.md`, #524) vào code sản phẩm: đổi model mặc định của Tác nhân CRM
(`DEFAULT_AGENT_MODEL`) và của Trợ lý kho (`hoi.maModel`), rồi đo xác nhận trên code đã đổi. Model chọn cho mỗi vai theo
Hỏi-1, Hỏi-3 (dòng sổ S1); hợp đồng gọi chúng là «model Tác nhân mới» và «model kho mới». Hạng T2: không tệp nào khớp
`risk_tiers.t3_paths`.

## Criteria

- AC-1: Given `packages/db/src/settings.ts`, When đọc `DEFAULT_AGENT_MODEL`, Then `id` là model Tác nhân mới theo Hỏi-1 và `contextWindowTokens` giữ 1.000.000; And model đó có trong fixture danh mục Gateway mà `model-lui-mac-dinh.integration.spec.ts` dùng (chụp lại fixture nếu thiếu); And `docs/agent.md` mục «Model» ghi mặc định mới.
- AC-2: Given một workspace có ô Cài đặt model trống, When agent gốc CRM, phiên gốc Zalo, phiên nghiên cứu (purpose `research`), bộ dựng và bộ chạy giải model, Then cả năm trả model Tác nhân mới; And mọi nơi trong `apps/**`, `packages/**` đọc `DEFAULT_AGENT_MODEL` hoặc lùi về nó qua `modelTheoVai` trùng đúng danh sách đường kê trong design.md; And workspace có ô Cài đặt mang một model khác vẫn chạy model trong ô; And model trong ô bị Gateway gỡ thì lùi về model Tác nhân mới.
- AC-3: Given `apps/agent/agent/lib/tai-lieu-config.ts`, When đọc khối `hoi`, Then `maModel` là model kho mới theo Hỏi-3 và `gateway.zeroDataRetention` vẫn `true`; And khối `soan` theo Hỏi-2; And `bangGia` có dòng giá cho mọi `maModel` đang dùng, bằng giá chọn theo Hỏi-5 (niêm yết hay Gateway tính thật) ghim trong `evidence/ke-hoach.json`; And một lượt hỏi kho ghi `chiPhiUsd` khác 0 khi có token.
- AC-4: Given code đã đổi và một kho đo dùng-một-lần có ô Cài đặt model trống, When chạy `eve eval agent-builder` số lượt ghim theo Hỏi-4, Then mỗi lượt có bằng chứng: kết quả, giây, cờ bị cắt ở 180 giây, model Gateway trả cho phiên con `agent_builder`, bản kết xuất aiChiPhi; And model Gateway trả là model Tác nhân mới ở mọi lượt; And số lượt qua dưới 180 giây đạt ngưỡng Tác nhân của MH4 (`_acceptance/model-theo-vai-do-lai/rang/nguong.json`, ≥ 4/5).
- AC-5: Given code đã đổi và một kho đo có ô Cài đặt model đặt về trống trước lượt, When chạy `_acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts --do` trên bộ 50 câu (vòng CRM 46 câu quy định, vòng Zalo 50 câu), Then bằng chứng chép bảng theo tầng, dòng «Tổng», danh sách mã không đạt kèm nhãn, model Gateway trả cho phiên `kho` và cho phiên gốc Zalo, bản kết xuất aiChiPhi; And model `kho` là model kho mới và model gốc Zalo là model Tác nhân mới; And mỗi tầng không kém mốc 13/10 (`_acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md`) quá 1 câu và câu lỗi gọi model không quá ngưỡng ghim trong `evidence/ke-hoach.json` theo Hỏi-3.
- AC-6: Given trần chi đo xác nhận ghim theo Hỏi-4 trong `evidence/ke-hoach.json`, When cộng tiền Gateway thật (`costUsd` Gateway trả trong aiChiPhi, không tính theo `bangGia`) của mọi lượt AC-4, AC-5, Then tổng không vượt trần; And chạm trần thì lượt kế không chạy và kết luận vai thiếu lượt là «chưa đủ số».
- AC-8: Given mốc tiền thật của model cũ ghim theo Hỏi-6 trong `evidence/ke-hoach.json` (Tác nhân: `_acceptance/tac-nhan-glm-5-3-cham/evidence/aichiphi-moc-*.json`; kho: theo Hỏi-6), When tính tiền Gateway thật trung bình mỗi lượt của lượt AC-4 và AC-5, Then với mỗi vai đổi model bộ so in «re hon <vai> <phần trăm>» hoặc «khong re hon <vai>»; And ngưỡng sống/chết của Cổng Giá trị ghim theo Hỏi-6 được ghi vào phần ngưỡng của `opportunity.md` (bốn trường quyết định của ô giữ nguyên).
- AC-7: Given nhánh của hàng này, When so với `origin/onehub`, Then không tệp nào dưới `apps/agent-okr/`, `apps/agent/agent/lib/okr/`, `apps/app/components/crm/record-sheet/` bị đổi; And judge OKR (`MO_HINH_JUDGE`) và model Soạn OKR không đổi; And `packages/db/test/measure-db-model.spec.ts` (kho đo dùng model khác mặc định) vẫn xanh.

## Coverage

Không gian khép kín, liệt kê tay — dòng sổ `descope` «bỏ coverage-scan».

- Vai: Tác nhân — năm đường giải model, răng liệt kê nơi tiêu thụ (AC-1, AC-2) · Trợ lý kho (AC-3) · Máy soạn kho (AC-3, Hỏi-2) · Soạn OKR, Judge OKR
  không đổi (AC-7).
- Ô Cài đặt: trống → mặc định mới · có giá trị → giữ · bị Gateway gỡ → lùi về mặc định mới (AC-2).
- Chi phí: dòng giá kho (AC-3), tiền đo xác nhận và trần (AC-6), rẻ hơn mốc model cũ (AC-8).
- Chất lượng trên bộ đo: Tác nhân (AC-4), Trợ lý kho qua CRM và Zalo (AC-5).

## Đường đo

`opportunity.md` chưa khai ngưỡng sống/chết; Hỏi-6 đề xuất ngưỡng, AC-8 ghi nó vào ô. Ngưỡng chất lượng dùng ngưỡng MH4 đã ký.

- Số lượt Tác nhân qua dưới 180 giây · `evidence/tac-nhan.jsonl` + kết xuất aiChiPhi · AC-4 bảo đảm.
- Tầng đạt và câu lỗi bộ 50 câu · `evidence/kho/` · AC-5 bảo đảm.
- Tổng chi đo xác nhận · `evidence/chi-phi.json` · AC-6 bảo đảm.
- Rẻ hơn mốc · `evidence/chi-phi.json` + mốc ghim trong `evidence/ke-hoach.json` · AC-8 bảo đảm.

## Out of scope

- Đổi model Soạn OKR, Judge OKR, Trợ lý OKR trong `apps/agent` — bảng MH4 kiến nghị giữ.
- Dựng thước cho máy soạn kho (Hỏi-2 khuyên giữ model cũ ở vai này).
- Đổi `MEASURE_DATABASE.agentModel` (model gieo vào kho đo của mọi hồ sơ).
- Thêm cấu hình suy luận theo model cho Tác nhân (GLM 5.3 Flash qua 5/5 ở mức mặc định).
- Ghi đè ô Cài đặt model của workspace đã chọn model khác (Hỏi-7 khuyên không ghi đè; chủ kho kiểm ô production trên Neon trước khi gộp).

## Notes

- Gateway tính tiền DeepSeek gấp 4 lần giá niêm yết (Known limits Ngoài-2 của MH4); sổ chi phí kho tính theo `bangGia`
  nên sẽ ghi thấp hơn tiền thật nếu chọn DeepSeek cho kho.
- Mọi lượt gọi model chạy dưới khoá s4 của đợt, trên kho đo dùng-một-lần.
