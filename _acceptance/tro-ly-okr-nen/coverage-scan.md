# Quét độ phủ tiêu chí — tro-ly-okr-nen

Preset: risk-premortem (câu khung «sáu tháng sau nền này hỏng — vì sao?»), cộng một trục
đường vào lấy từ entity-feature.

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub, bản rẽ của `trycompai/crm` — chân sản phẩm: `CONTEXT.md`
  mục «OneHub là gì» [SUY-TỪ-REPO: CONTEXT.md], lộ trình Trợ lý OKR
  [SUY-TỪ-REPO: docs/plan/lo-trinh-tro-ly-okr.md], thiết kế
  [SUY-TỪ-REPO: docs/reports/2026-09-26-tro-ly-okr/12-kien-truc-va-lo-trinh.md].
- Chân ngành: quản trị chi tiêu và trần của AI trong sản phẩm SaaS — báo cáo chi tiêu theo
  khoá và theo thẻ, ngân sách có báo ở ngưỡng [NGÀNH: Vercel AI Gateway Custom Reporting và
  Budgets — đã đọc tài liệu hôm nay]; trợ lý AI có công tắc của quản trị và bảng mức dùng
  [NGÀNH: Atlassian Rovo, Notion AI — trích ở thiết kế §4.1]; cách ly agent con có công cụ
  hẹp [NGÀNH: eve 0.29.4 `subagents.mdx`].

## Trục

- **Trục A — thành phần:** A1 sổ chi phí (ghi) · A2 trần và sẵn sàng · A3 hàng việc và
  đóng việc · A4 cách ly (gốc chuyển tiếp, hook uỷ quyền, subagent) · A5 cấu hình và màn
  · A6 báo và đối soát · A7 dời hàm và tài liệu
  [thước CE: bảng khối K1–K13 của thiết kế §4.2; mục 6.3 «Phạm vi» mười điểm]
- **Trục B — kiểu hỏng:** sai (số hay trạng thái sai) · chết (không chạy, treo) · rò (dữ
  liệu vượt ranh, ra nhà cung cấp không ZDR, chữ OKR về gốc) · vượt tiền · lộ sớm (người
  dùng thấy trước 9b)
  [thước CE: preset risk-premortem; N0 «việc còn mở»; `tac-nhan-hien-nay.md` bảng «luật của
  kế hoạch»]
- **Trục C — người hay đường vào:** quản trị qua màn · người không quản trị và vai «chỉ OKR»
  qua màn, tRPC, REST, khoá API · máy (nhịp dispatch, hook, việc trực tiếp)
  [thước CE: AC «một phép đo cho mỗi đường vào» của `vai-chi-okr`]

## Ô có nghĩa (A × B, đường vào ghi trong ô)

| | sai | chết | rò | vượt tiền | lộ sớm |
|---|---|---|---|---|---|
| A1 sổ | **1** thiếu phiên / sai việc | ghi hỏng làm hỏng việc → Later (bọc lỗi) | sổ ghi chữ OKR → **5** | — | — |
| A2 trần | **11** sẵn sàng sai lý do | — | — | **2** trần 0 vẫn mở phiên | — |
| A3 hàng việc | — | **3** việc hỏng treo / chạy lại | — | chạy lại tốn tiền → **3** | — |
| A4 cách ly | **7** khuôn đệ quy làm hỏng lượt | — | **4** gốc gọi tool đối tác · **5** chữ về gốc · **6** không ZDR | **8** một lời gọi dài | — |
| A5 cấu hình, màn | **10** số trên màn khác sổ | — | **9** người không quản trị đọc sổ | — | **9** người dùng thấy khối |
| A6 báo, đối soát | **13** đối soát im khi không lọc được | — | — | **12** không ai được báo | — |
| A7 dời hàm, tài liệu | **14** tiến độ đổi hành vi · **15** chữ sai nghĩa | — | — | — | — |

## Core → ứng viên AC

1. Sổ ghi mọi bước của mọi phiên — gốc và ba subagent — với việc có tên, không trùng khi hook chạy lại (A1 × sai) → AC-1.
2. Trần bằng 0 thì không phiên nào mở, ở cả hai lớp kiểm (A2 × vượt tiền) → AC-3.
3. Việc `okr-*` bị ép hỏng đóng trong một phút, có lý do, không phiên thứ hai (A3 × chết) → AC-4.
4. Gốc purpose `okr` chỉ gọi `tro_ly_okr` một lần; tool khác bị chặn trước khi chạy; phiên khác gọi `tro_ly_okr` bị chặn (A4 × rò) → AC-5.
5. Không chữ OKR nào về gốc hay vào sổ chi phí (A4 × rò) → AC-6, AC-8.
6. Model, ZDR, mức suy nghĩ cố định ở subagent (A4 × rò) → AC-7.
7. Khuôn không đệ quy, tập tool đúng bằng tập khai (A4 × sai) → AC-7.
8. Chặn cỡ một lời gọi (A4 × vượt tiền) → AC-9.
9. Màn chỉ quản trị thấy; vai «chỉ OKR» và thành viên bị từ chối ở mọi đường vào mới (A5 × rò, lộ sớm) → AC-10, AC-11.
10. Số trên màn bằng tổng sổ (A5 × sai) → AC-10.
11. Sẵn sàng đúng lý do (A2 × sai) → AC-12.
12. Báo 80% và 100% một lần (A6 × vượt tiền) → AC-13.
13. Đối soát khớp trong 10% và không im khi không lọc được (A6 × sai) → AC-2, AC-13.
14. Dời hàm tiến độ không đổi hành vi (A7 × sai) → AC-14.
15. Bốn mục từ điển và luật dữ liệu (A7 × sai) → AC-15.

Core 15 ô trên 22 ô có nghĩa — vượt 20% vì lượt này là nền: mỗi ô là một chốt mà 9b, 9c
đứng lên. Đã gộp: ô 5 và 6 chung một AC về ba đường chữ; ô 9 và 10 chung một AC màn.

## Later

- Ghi sổ hỏng làm hỏng việc (A1 × chết) — hook bọc lỗi như `audit.ts`; đối soát bắt thiếu.
- Trần theo người mỗi ngày (A2, đường khoá API) — 9b, ở router.
- Đếm thiếu `AgentRun.costUsd` — gửi lên hãng.
- Trần cho làn nghiên cứu — chỉ đếm ở lượt này.

## Never

- Đọc model của subagent từ `AppSetting` — đọc hỏng rơi về model không ZDR.
- Stub cùng tên để che tool ở gốc — N0 đo 2/8 hỏng theo hướng mở.
- Dựng Trợ lý OKR bằng Tác nhân — luật 10 của `docs/agent.md`.

## Cross-cutting áp mọi ô Core

- Mọi phép đo máy có cặp hai chiều trên cùng fixture, thông điệp ghim.
- Nội dung OKR trong eval chỉ tới model có ZDR; eval chạy trên kho dùng-một-lần.
- Không ghi vào kho `crm` chung.
