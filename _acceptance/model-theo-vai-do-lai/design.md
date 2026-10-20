# Thiết kế (bản phác trên giấy): model-theo-vai-do-lai (MH4)

> Trạng thái: MỞ LẠI 21/10 để thêm DeepSeek và Gemini (mục «Mở rộng 21/10» cuối tệp). Bản chốt 20/10: CHỐT ở S1 sau khi VK5 (`chu-may-sinh-ten-moi`, #503) gộp `onehub` e290fa498 ngày 20/10. Nhánh đã gộp
> mốc đó (961b36548). Lời dặn trên onehub khớp diff vk dán ở #375: «Căn chỉnh» → «Góp vào», thêm câu cấm viết «căn
> chỉnh»/«hỏi ý», và dòng `can-chinh` của `tro_ly_okr` đổi chữ theo. Hợp đồng ở `contract.md`.

Hàng `MH4` của lộ trình Kho tài liệu, mốc 30/10. Câu giao: «Mỗi vai (Tác nhân, Trợ lý kho, judge, soạn) có model kiến
nghị, đo lại sau l6». Đứng trên MH3 (đã lên onehub). MH2 (`re-mo-hinh-mac-dinh`, đổi model mặc định) đứng sau MH4 và
đọc kết quả của nó.

## Hiện trạng (đọc ngày 20/10)

| Vai | Model đang chạy | Khai ở | Thước đo đã có | Đổi model khi đo bằng |
|---|---|---|---|---|
| Tác nhân (agent gốc CRM, `agent_builder`, `agent_runner`, phiên gốc `zalo`) | `zai/glm-5.2-fast` | `packages/db/src/settings.ts` (`DEFAULT_AGENT_MODEL`), ô Cài đặt `AppSetting.agentModelId`; bộ giải `modelTheoVai` (`apps/agent/agent/lib/model.ts`) | `_acceptance/tac-nhan-glm-5-3-cham/rang/do-tac-nhan.ts` + `so-tac-nhan.ts` (eve eval `agent-builder`, 3 lượt) | ghi ô Cài đặt trong kho đo |
| Trợ lý kho (`tro_ly_kho`, phiên gốc `kho`) | `zai/glm-5.2-fast`, ZDR, khoá riêng | `apps/agent/agent/lib/tai-lieu-config.ts` (`hoi.maModel`) | bộ 50 câu `_acceptance/bo-cau-hoi-mau` + `tro-ly-doc-kho/rang/cham-bo-do.ts` | sửa hằng tạm, không commit |
| Soạn OKR (`tro_ly_okr` ở apps/agent; `apps/agent-okr`) | `google/gemini-3.8-flash` | `apps/agent/agent/lib/okr/config.ts`, `apps/agent-okr/agent/lib/config.ts` | eval `okr-soan` (`apps/agent-okr/evals/okr-soan`), `soan-okr-cung-tro-ly/rang/eval-soan.mjs` | `TRO_LY_OKR_MO_HINH` (chỉ apps/agent); agent-okr là hằng |
| Máy soạn kho (`may_soan`) | `zai/glm-5.2-fast` | `tai-lieu-config.ts` (`soan.maModel`) | chưa có (E15a của `may-soan-de-xuat` `not-run`) | — |
| Judge OKR | `zai/glm-5.2-fast`, ZDR | `okr/config.ts`, `agent-okr/agent/lib/config.ts` | gián tiếp: «judge mù» và tỉ lệ «không chấm được» trong `eval-soan` | — |

Số đã có: MH3 (16/10) GLM 5.2 Fast 3/3, GLM 5.3 mặc định 0/3, GLM 5.3 Fast 3/3, GLM 5.3 + `reasoning: low` 3/3; bộ 50 câu
kho GLM 5.2 Fast (13/10) và Gemini 3.8 Flash (16/10) đều đạt mọi tầng, 2 câu lỗi mỗi lượt; Haiku 5.5 trượt cả Trợ lý OKR
lẫn Tác nhân (15/10). Chưa có «bảng kiến nghị model» nào trong kho.

## Mốc Soạn OKR do VK5 đo (20/10)

VK5 chạy thước soạn của nó (`_acceptance/chu-may-sinh-ten-moi/rang/eval-soan.mjs`, 18 ca, judge `zai/glm-5.2-fast`) ba lượt
với `google/gemini-3.8-flash`:

| Lượt | Lời dặn | Đạt | Hỏng | Dưới ngưỡng | Judge hỏng | p50 ms | p90 ms | USD |
|---|---|---|---|---|---|---|---|---|
| `nen-lap` | cũ (939d1c…) | 15 | 0 | 3 | 0 | 10 942 | 15 911 | 0,71 |
| `nen` | cũ (939d1c…) | 13 | 2 | 3 | 1 | 12 304 | 30 293 | 0,69 |
| `sau` | mới (9b0510…) | 13 | 3 | 2 | 2 | 11 367 | 34 066 | 0,69 |

Lượt `sau` là mốc của MH4: cùng lời dặn đang chạy, cùng thước. Không đo lại Gemini. Hai lượt trên lời dặn cũ lệch nhau
2/18, nên GLM 5.3 Flash chạy hai lượt.

Thước soạn đọc `TRO_LY_OKR_SOAN.model` của `apps/agent-okr` — đó là vai Soạn OKR của bảng. Trợ lý OKR trong
`apps/agent` (`tro_ly_okr`, cửa `TRO_LY_OKR_MO_HINH`) không nằm trong thước này, nên ra Out of scope.

## Hướng

1. Dựng **bảng kiến nghị model theo vai** — một tệp dữ liệu có khuôn Zod (vai · model hiện tại · ứng viên · số đo · chi
   phí mỗi lượt · kiến nghị · ngày đo · mã lượt bằng chứng) và một trang đọc được sinh từ nó trong `docs/`. Mỗi hàng
   bảng trỏ bằng chứng của một lượt đo đã lưu, không chép số tay.
2. Đo lại từng vai bằng **thước đã có** của vai đó, trên cây sau khi VK5 gộp, cùng một bộ ứng viên, cỡ mẫu nâng từ 3
   lên mức chốt ở Cổng Phạm vi. Không viết thước mới cho vai đã có thước.
3. Ghi model **thật** mà Gateway trả ở mỗi bước (sự kiện `model.phien-chon`, `response.modelId`), không tin hằng đã đặt —
   sổ chi phí hiện để `modelId` rỗng (giới hạn đã khai của MH3).
4. Không đổi model nào trong code chạy thật: đổi mặc định là việc của MH2, đọc bảng này.

## Câu chỉ người trả lời (sẽ lên Cổng Phạm vi — đã gửi giám sát)

- **Hỏi-1 (thẻ: Hỏi-1 và Hỏi-2) — ứng viên mỗi vai. ĐÃ TRẢ (chủ kho, 20/10):** «dùng GLM 5.3 Flash bỏ GLM 5.2 Fast vì lý do chi phí tinh chỉnh
  lại các thông số cho phù hợp model này». Gateway có `zai/glm-5.3-flash` (0,15/0,5 USD mỗi triệu token vào/ra, so với
  2,8/8,8 của `zai/glm-5.2-fast` — khoảng 18 lần rẻ hơn); khác `zai/glm-5.3-fast` mà MH3 đã đo. Vì vậy:
  - Tác nhân và Trợ lý kho: đo `zai/glm-5.3-flash` với các biến thể thông số — mức suy luận (mặc định · `low` · tắt khi
    model cho phép) và trần bước/thời gian của phiên con — để chọn bộ thông số hợp model này. MH3 đã thấy GLM 5.3 với
    suy luận mặc định bị cắt ở 180 s, nên mức suy luận là thông số phải dò đầu tiên.
  - Không đo lại `zai/glm-5.2-fast`: số mốc lấy từ bằng chứng đã có (MH3 16/10, bộ 50 câu 13/10), ghi rõ cây và ngày.
  - Soạn OKR (đang Gemini 3.8 Flash): ĐÃ TRẢ (chủ kho, 20/10) — đo thêm `zai/glm-5.3-flash` cạnh mốc Gemini. Ở
    `apps/agent` đổi bằng `TRO_LY_OKR_MO_HINH` (cần nới danh sách mã nhận); ở `apps/agent-okr` model là hằng, lượt đo
    đổi hằng tạm, không commit.
- **Hỏi-3 — judge có vào bảng không.** Khuyên: vào bảng với số «không chấm được» và «judge mù» đo được, nhưng KHÔNG đổi
  ứng viên judge ở vòng này (đổi judge làm lệch mọi số soạn OKR đã có).
- **Hỏi-4 — máy soạn kho.** Khuyên: ghi hàng «chưa có thước» trong bảng, Out of scope; dựng thước là việc riêng.
- **Hỏi-5 — cỡ mẫu, biến thể, trần chi.** Khuyên: 5 lượt mỗi biến thể Tác nhân (`flash`, `flash-low`), 1 lượt bộ 50
  câu, 2 lượt eval soạn; mốc Gemini lấy của VK5, không đo lại; trần bước, trần thời gian và `flash-low` cho kho, soạn để
  hàng sau; trần tổng 6 USD, chạm trần thì dừng. Lối khác: thêm trần bước và `flash-low` cho kho, soạn — trần 12 USD.
- **Hỏi-6 — ngưỡng để đổi một vai sang GLM 5.3 Flash** (từ gap-probe F1). Khuyên: Tác nhân ≥ 4/5 lượt qua dưới 180 giây;
  Trợ lý kho mỗi tầng không kém mốc 13/10 quá 1 câu và câu lỗi ≤ 2; Soạn OKR mọi lượt ≥ 13/18 (bằng mốc) và hỏng ≤ 3.
  Lối khác: Soạn OKR cho kém mốc 1 câu (12/18) vì mốc dao động 2 câu.

- **Hỏi-7 — lượt soạn không nộp đề xuất. ĐÃ TRẢ (chủ kho, 20/10):** lượt mà eval chạy xong nhưng không lưu đề xuất
  nào là lượt hỏng, trượt ngưỡng. Thước MH4 ghi tóm tắt cho lượt đó (`soDeXuat` 0, `khongNopDeXuat` true) thay vì thoát 2.
- **Hỏi-8 — lượt soạn 2 đã hỏng hai lần.** Khuyên: chạy lại một lần bằng thước đã sửa. Lối khác: dựng bản ghi từ
  `summary.json` của eve còn lại — thiếu độ trễ, chi phí, băm lời dặn, model.

## Đổi model khi đo

Sửa tạm hằng trong cây đo rồi trả lại, băm bản sửa vào bằng chứng — nếp MH3. Ba tệp: `agent_builder/agent.ts` (lượt
`flash-low`), `tai-lieu-config.ts` (`hoi.maModel`), `apps/agent-okr/agent/lib/config.ts` (`MO_HINH`). Không thêm cửa đổi
model vào code sản phẩm. Xin chạm tệp K1-8 gửi giám sát đợt. Tác nhân đổi bằng ô Cài đặt trong kho đo; danh mục Gateway
có `zai/glm-5.3-flash` nên `modelTheoVai` không lùi về mặc định.

## Mở rộng 21/10 — DeepSeek V4.1 Flash 1017 và Gemini cho Trợ lý kho

Chủ kho, 21/10, sau khi S3 xong và trước khi S4 ký (qua phiên K1 cũ): «Tôi muốn bổ sung một model giá rẻ hiệu năng cao là
"deepseek v4 1 flash 1017" thực hiện đo đầy đủ với các vai cho model này, và đo gemini cho Trợ lý kho. Sau đó lập bảng
kiến nghị cuối cùng cho tôi.» Bảng kiến nghị là sản phẩm của MH4, nên vòng mở lại thay vì mở hàng mới (d-20261020T223012Z-17).

### Ứng viên

| Khoá | Model Gateway | Giá vào/ra mỗi triệu token | Vai đo |
|---|---|---|---|
| `glm` | `zai/glm-5.3-flash` | 0,15 / 0,50 | Tác nhân, Trợ lý kho, Soạn OKR — đã đo 20/10, giữ nguyên |
| `ds` | `deepseek/deepseek-v4.1-flash-1017` | 0,075 / 0,30 (giờ cao điểm × 2) | Tác nhân (`ds`, `ds-low`), Trợ lý kho, Soạn OKR |
| `gem` | `google/gemini-3.8-flash` | 0,75 / 3,75 | Trợ lý kho (đang là model chạy thật của Soạn OKR) |

Danh mục Gateway (`/v1/models`, đọc 21/10) có `deepseek/deepseek-v4.1-flash-1017` kiểu `language`, tag `tool-use` và
`reasoning`, cửa sổ 1.048.576 — nên `modelTheoVai` không lùi về mặc định (`packages/validation/src/gateway-danh-muc.ts` lọc
theo hai điều kiện ấy). Giá DeepSeek nhân đôi thứ Hai–Sáu 01:00–04:00 và 06:00–10:00 UTC; thước không mở lượt `ds` trong
khung đó (d-20261020T223012Z-21) — sau gap-probe bỏ chặn (d-20261020T223820Z-26): luật chọn so bằng token × giá niêm yết,
nên giờ chạy chỉ đổi tiền thật, tính vào trần.

### Chỗ có thể làm lệch số (tra code 21/10)

- **Tác nhân.** Biến thể `-low` chèn `reasoning: "low"` vào `defineAgent` của `agent_builder`; eve chuyển thẳng vào lời gọi
  AI SDK, Gateway chuyển nguyên lên nhà cung cấp — không khoá theo `zai`. Gateway có dịch `low` cho DeepSeek không thì chỉ
  lời dò AC-2 nói được. Đường Tác nhân không bật ZDR.
- **Trợ lý kho.** `hoi.maModel` không kiểm mã; ZDR bật cứng (`tai-lieu-config.ts`), không có tuỳ chọn suy luận, trần ra 8k
  mỗi phiên. Bảng giá `TAI_LIEU_AGENT.bangGia` chỉ có `zai/glm-5.2-fast` — model khác ghi `chiPhiUsd` 0, thước không đọc
  trường đó (đo bằng chênh số dư Gateway).
- **Soạn OKR.** `xuongModelZdr` ép `thinkingLevel: low` chỉ qua khoá `google`/`vertex`; DeepSeek chạy suy luận mặc định.
  Trần ra 3.000 token mỗi lời gọi — DeepSeek suy luận dài có thể chạm. Hỏi-9 hỏi giữ mặc định hay sửa tạm thêm `low`.
- **Thước.** `rang/khuon.ts` ghim một model (`MTV.model`), so-do.ts dùng nó khoảng 23 chỗ; đường bằng chứng ghim nhãn
  `flash`. Vòng mở lại tham số hoá theo danh sách ứng viên trong `ke-hoach.json`, giữ tên bằng chứng `glm` cũ (d-20261020T223012Z-22);
  khoá chi phí thêm chiều ứng viên để hai ứng viên cùng số lượt không đè nhau.

### Câu chỉ người trả lời (lên Cổng Phạm vi)

- **Hỏi-9 — mức suy luận ở kho và soạn.** Khuyên: mặc định — đúng thứ chạy khi MH2 chỉ đổi mã model; ghi «suy luận low»
  vào thông số chưa dò. Lối khác: sửa tạm thêm `reasoning: low` cho DeepSeek ở kho và soạn.
- **Hỏi-10 — nhiều ứng viên cùng đạt ngưỡng.** Khuyên: ngưỡng Hỏi-6 (20/10) áp nguyên cho `ds`, `gem`; ứng viên có lượt bị
  loại (sai model, lời dặn lệch, dừng vì trần) là «chưa đủ số»; trong các ứng viên đạt chọn ứng viên có **chi phí phần ứng
  viên** thấp nhất, bằng nhau thì điểm cao hơn rồi trung vị giây thấp hơn. Chi phí phần ứng viên = token các bước do model
  ứng viên chạy (kết xuất `aiChiPhi` của kho đo — dùng-một-lần, nên không lẫn phiên khác) × giá niêm yết ghim. Không dùng
  `usd` tóm tắt soạn (gồm judge GLM 5.2 Fast) hay chênh số dư (gồm phiên gốc và các phiên khác dùng chung số dư nhóm).
  Lối khác: điểm cao nhất, chi phí chỉ phá hoà.
- **Hỏi-12 — DeepSeek ở Judge OKR và Máy soạn kho.** Hai vai chưa có thước đo model ứng viên. Khuyên: để ngoài vòng, ghi
  DeepSeek vào thông số chưa dò của hai hàng; dựng thước judge, máy soạn là hàng riêng. Lối khác: thêm thước chấm judge —
  chạy lại judge DeepSeek trên đề xuất đã lưu của các lượt soạn và so phán với GLM 5.2 Fast (khoảng nửa ngày, 1–2 USD).
- **Hỏi-11 — cỡ mẫu, thứ tự, trần.** Khuyên: DeepSeek cùng cỡ mẫu vòng GLM (5 lượt mỗi biến thể Tác nhân, 3 lời dò, 1 lượt
  kho, 2 lượt soạn), Gemini 1 lượt kho; thứ tự dò → Tác nhân → soạn → kho `ds` → kho `gem`; trần tổng cả vòng 12 USD (đã chi
  khoảng 3,1). Ước phần thêm: Tác nhân và dò dưới 0,1 USD, soạn khoảng 1,2 USD (phần lớn là judge GLM 5.2 Fast), kho `ds`
  1–3 USD, kho `gem` 2–5 USD. Lối khác: trần 10 USD (lượt `gem` có thể dừng vì trần) hoặc 15 USD (còn khoảng 0,7 USD cho MH2
  từ số dư 18,8 USD ngày 20/10).
