# Thiết kế (bản phác trên giấy): model-theo-vai-do-lai (MH4)

> Trạng thái: PHÁC. Giám sát đợt cho soạn S0/S1 trên giấy trong lúc chờ VK5 (`chu-may-sinh-ten-moi`) gộp `onehub`;
> KHÔNG đo model và KHÔNG chốt phép đo trước mốc đó (luật 22 của đợt, trả lời K1-6 đã sửa). Lời dặn mới đọc từ diff
> vk dán ở #375 (issuecomment-6282341815): chỉ đổi chữ «Căn chỉnh» → «Góp vào» và thêm một câu cấm viết «căn
> chỉnh»/«hỏi ý» trong `apps/agent-okr/agent/lib/loi-dan-soan.ts` và `apps/agent/agent/subagents/tro_ly_okr/instructions.md`.

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

## Hướng (phác)

1. Dựng **bảng kiến nghị model theo vai** — một tệp dữ liệu có khuôn Zod (vai · model hiện tại · ứng viên · số đo · chi
   phí mỗi lượt · kiến nghị · ngày đo · mã lượt bằng chứng) và một trang đọc được sinh từ nó trong `docs/`. Mỗi hàng
   bảng trỏ bằng chứng của một lượt đo đã lưu, không chép số tay.
2. Đo lại từng vai bằng **thước đã có** của vai đó, trên cây sau khi VK5 gộp, cùng một bộ ứng viên, cỡ mẫu nâng từ 3
   lên mức chốt ở Cổng Phạm vi. Không viết thước mới cho vai đã có thước.
3. Ghi model **thật** mà Gateway trả ở mỗi bước (sự kiện `model.phien-chon`, `response.modelId`), không tin hằng đã đặt —
   sổ chi phí hiện để `modelId` rỗng (giới hạn đã khai của MH3).
4. Không đổi model nào trong code chạy thật: đổi mặc định là việc của MH2, đọc bảng này.

## Câu chỉ người trả lời (sẽ lên Cổng Phạm vi — đã gửi giám sát)

- **Hỏi-1 — ứng viên mỗi vai. ĐÃ TRẢ (chủ kho, 20/10):** «dùng GLM 5.3 Flash bỏ GLM 5.2 Fast vì lý do chi phí tinh chỉnh
  lại các thông số cho phù hợp model này». Gateway có `zai/glm-5.3-flash` (0,15/0,5 USD mỗi triệu token vào/ra, so với
  2,8/8,8 của `zai/glm-5.2-fast` — khoảng 18 lần rẻ hơn); khác `zai/glm-5.3-fast` mà MH3 đã đo. Vì vậy:
  - Tác nhân và Trợ lý kho: đo `zai/glm-5.3-flash` với các biến thể thông số — mức suy luận (mặc định · `low` · tắt khi
    model cho phép) và trần bước/thời gian của phiên con — để chọn bộ thông số hợp model này. MH3 đã thấy GLM 5.3 với
    suy luận mặc định bị cắt ở 180 s, nên mức suy luận là thông số phải dò đầu tiên.
  - Không đo lại `zai/glm-5.2-fast`: số mốc lấy từ bằng chứng đã có (MH3 16/10, bộ 50 câu 13/10), ghi rõ cây và ngày.
  - Soạn OKR (đang Gemini 3.8 Flash): ĐÃ TRẢ (chủ kho, 20/10) — đo thêm `zai/glm-5.3-flash` cạnh mốc Gemini. Ở
    `apps/agent` đổi bằng `TRO_LY_OKR_MO_HINH` (cần nới danh sách mã nhận); ở `apps/agent-okr` model là hằng, lượt đo
    đổi hằng tạm, không commit.
- **Hỏi-2 — judge có vào bảng không.** Khuyên: vào bảng với số «không chấm được» và «judge mù» đo được, nhưng KHÔNG đổi
  ứng viên judge ở vòng này (đổi judge làm lệch mọi số soạn OKR đã có).
- **Hỏi-3 — máy soạn kho.** Khuyên: ghi hàng «chưa có thước» trong bảng, Out of scope; dựng thước là việc riêng.
- **Hỏi-4 — trần chi và cỡ mẫu.** Khuyên: 5 lượt mỗi biến thể Tác nhân, 1 lượt bộ 50 câu mỗi biến thể kho, 1 lượt eval
  soạn mỗi ứng viên; trần tổng 6 USD — GLM 5.3 Flash rẻ nên phần lớn chi là mốc Gemini của soạn OKR và judge; quá trần
  thì dừng.

## Việc chờ

- VK5 gộp `onehub` → đọc lại hai tệp lời dặn trên onehub, chốt phép đo, viết `contract.md` + `evals.yaml`, gap-probe,
  rồi trình Cổng Phạm vi (T2 theo đường máy suy nếu không chạm `t3_paths`).
