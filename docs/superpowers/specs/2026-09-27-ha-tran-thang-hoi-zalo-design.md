# Hạ trần tháng của Hỏi CRM qua Zalo xuống 300 câu

Ngày 27/09/2026. Slug `ha-tran-thang-hoi-zalo`. Hạng T2.

## Vì sao

Vòng `hoi-crm-qua-zalo` (PR #158) đặt ba trần: 3 câu mỗi phút, 20 câu mỗi người mỗi ngày,
1.500 câu mỗi tháng của cả xưởng. Con số 1.500 được chọn khi chưa ai đo giá một câu.

N0 (`~/dev/nghien-cuu-crm/2026-09-26-ai-okr/N0-ket-qua.md`, mục 7) đo trên đúng đường của
vòng đó, ba câu mẫu:

| Model của trợ lý | Giá trung bình một câu | 1.500 câu/tháng | 300 câu/tháng |
|---|---|---|---|
| Gemini 3.7 Flash | $0,016 | $23,5 | $4,7 |
| GLM 5.2 Fast (mặc định khi chưa chọn) | $0,039 | $57,9 | $11,6 |

Ngân sách AI Gateway của cả team là $20/tháng, trong đó $9 đã dành cho khu OKR. Ở trần cũ,
riêng Hỏi CRM qua Zalo đã có thể tiêu hết cả $20 — Gateway chạm trần thì mọi phần AI
(nghiên cứu danh bạ, Tác nhân, OKR) cùng dừng. Chủ kho chốt 27/09: **300 câu mỗi tháng**.

## Làm gì

- Đổi một hằng: `ZALO.hoi.tran.thang` trong `apps/agent/agent/lib/zalo-config.ts` từ `1_500`
  thành `300`. Trần phút (3) và trần ngày (20) giữ nguyên.
- Câu báo hết lượt tháng (`ZALO.loi.hetTranThang`) không mang con số, nên không đổi chữ.
- Luật đếm giữ nguyên: chỉ câu đã mở phiên (`dang-hoi`, `da-tra-loi`, `gui-hong`) tính vào
  trần; tháng tính theo giờ Việt Nam.
- Một tệp test mới ghim con số 300 và hành vi ở ranh 300/301, đếm bằng số viết tay (không
  suy từ hằng), để đổi hằng mà quên người quyết thì test đỏ.
- `docs/agent.md` §Zalo ghi 300; bảng theo dõi `docs/plan/lo-trinh-zalo.md` ghi quyết định
  27/09 kèm căn cứ N0.

## Không làm

- Không sửa hồ sơ đã ký `_acceptance/hoi-crm-qua-zalo/` (AC-5 của nó còn ghi 1.500 — đó là
  sử liệu của lần ký; hồ sơ này thay con số). Test (d) của hồ sơ đó suy số từ hằng nên vẫn
  xanh ở 300 — AC-6 ghim điều này.
- Không đổi trần sang tiền (đô la) thay cho số câu: cần sổ chi phí AI, là việc của lượt 9a OKR.
- Không báo quản trị khi xưởng chạm trần tháng: người hỏi đã nhận câu hết lượt; báo quản trị
  đi cùng báo 80%/100% ngân sách ở 9a.
- Không đổi model hay mức suy nghĩ của trợ lý Zalo (chạm `lib/model.ts` của hãng).

## Quy trình đã chạy

- Brainstorm: không câu hỏi mở — con số, phạm vi và căn cứ do chủ kho chốt trong phiên N0.
- Quét không gian AC: bỏ (một chiều; ghi ở sổ quyết định).
- Đặc tả UX: bỏ (không có màn nào; ghi ở sổ quyết định).
