# Quét độ phủ — so-okr-tu-chay

## Ngữ cảnh

- Sản phẩm: khu OKR của CRM OneHub, công cụ quản trị nội bộ — chân sản phẩm: đào repo (`CONTEXT.md` mục KR, Cập nhật tuần, Mức tự tin, Chốt, Giai đoạn thoả thuận; `docs/plan/lo-trinh-okr.md` mục 5 «Lượt 6» và mục 9; `schema.prisma` khối OKR và bảy bảng nguồn; `packages/db/src/crm-events.ts`; `apps/api/src/dashboard/dashboard.service.ts`) · chân ngành: Perdoo (nguồn tiến độ Google Sheets chọn bảng tính, trang, ô), Tability (mẫu cập nhật tự điền số mới nhất, người vẫn ghi), Profit.co (đồng bộ HubSpot hằng ngày vào KR) — tra web 2026-09-26.

## Trục

- **Trục A — nguồn số của KR:** tay · chỉ số CRM · khoá API · Google Sheets  [thước CE: `NGUON_KR` trong `@crm/validation/okr-kr` (tay · crm · api) + lộ trình «KR ngoài CRM nhận số qua khoá API và Google Sheets» — SUY-TỪ-REPO; ba nguồn máy khớp [NGÀNH: Perdoo, Profit.co]]
- **Trục B — vòng đời số:** đặt nguồn · đo (tính số) · chụp thành lịch sử · hiện và bấm vào · vào cập nhật tuần · đổi nguồn giữa kỳ · khép kỳ  [thước CE: lộ trình mục 5 bốn gạch «Trong phạm vi» — mỗi gạch một hay hai giá trị; `CONTEXT.md` «Cập nhật tuần» (số tự chảy không phải cập nhật tuần)]
- **Trục C — người:** người phụ trách KR · trưởng đơn vị · quản trị · thành viên thường · vai «chỉ OKR» · máy khác cầm khoá API  [thước CE: `OkrAccessService`, `WORKSPACE_ROLES`, `docs/api.md` mục phạm vi dữ liệu]
- **Trục D — chỉ số × phạm vi:** bảy chỉ số của lộ trình × toàn công ty · bộ phận · phòng ban · người  [thước CE: lộ trình «Tham số theo người, phòng ban, bộ phận»; bảy bảng nguồn trong `schema.prisma`]

## Không gian (A × B, cắt theo C và D ở cross-cutting)

| Nguồn | Vòng đời | Có nghĩa? | Nhãn |
|---|---|---|---|
| CRM | đặt nguồn (chỉ số, phạm vi, bậc) khi mục tiêu còn nháp | có | Core |
| CRM | đo — bảy chỉ số × bốn phạm vi, định nghĩa cố định | có | Core |
| CRM | chụp mỗi ngày trên nhịp dispatch, chỉ thêm | có | Core |
| CRM | bấm vào số ra bản ghi, chọn ngày trong lịch sử | có | Core |
| CRM | vào cập nhật tuần: số khoá, người ghi mức tự tin và ghi chú | có | Core |
| CRM | đổi nguồn giữa kỳ → đo cạnh, để vết, tiến độ theo số tay tới hết kỳ | có | Core |
| CRM | khép kỳ: số không đổi khi dữ liệu cũ hay tiền tệ báo cáo đổi | có | Core |
| API | đặt nguồn, ghi số bằng khoá, để vết người cầm khoá | có | Core |
| API | bấm vào số | không | — (không có bản ghi CRM đằng sau; hiện lịch sử lần ghi) |
| Sheets | đặt nguồn (đường dẫn, ô), đọc thử, đọc mỗi ngày | có | Core |
| Sheets | ghi ngược vào bảng tính | có | Never — đồng bộ hai chiều ngoài lộ trình |
| Tay | giữ nguyên như lượt 3–4 | có | Core (không hồi quy) |
| CRM | chỉ số tiền (giá trị thoả thuận), chỉ số theo giai đoạn | có | Never — nghĩa chưa chốt |
| CRM | trình dựng truy vấn tự do | có | Never — NG-04 |
| CRM | kỳ đo riêng («tháng này») khác chu kỳ | có | Later |
| CRM | tính lại bản chụp cũ khi định nghĩa đổi | có | Never — lịch sử không đổi |
| mọi nguồn | đường đo ngưỡng: tỷ lệ KR khối kinh doanh có nguồn CRM | có | Core |
| mọi nguồn | phép thử tin số: năm chỉ số so số đếm độc lập, lệch khai trước | có | Core |

## Core (vì sao)

1. Danh mục bảy chỉ số có định nghĩa cố định — DO-01, khuôn `CRM_EVENT_CATALOG`.
2. Đếm đúng bảy chỉ số × bốn phạm vi — DO-01, tham số theo người, phòng ban, bộ phận.
3. Chụp mỗi ngày, lịch sử chỉ thêm — DO-02.
4. Bấm vào số ra bản ghi — DO-03; vai «chỉ OKR» chỉ thấy số (phạm vi dữ liệu).
5. Đổi nguồn giữa kỳ để vết, đo cạnh — DO-04.
6. Khoá API và Google Sheets — DO-05, KR-05 (API).
7. KR tự đo trong hộp thoại KR và trong cập nhật tuần — KR-04.
8. Đường đo và phép thử tin số — AC không được thiếu của lộ trình.

## Later

- Kỳ đo tự chọn khác chu kỳ (tháng, tuần).
- Thêm chỉ số thứ tám trở đi — mỗi chỉ số mới là một mục trong danh mục, một vòng có hợp đồng.
- Cảnh báo khi số máy và số tay lệch nhiều (lượt 10, AI-06).

## Never

- Giá trị tiền, chỉ số theo giai đoạn thoả thuận — nghĩa chưa chốt trong từ điển (lộ trình «Ngoài phạm vi»).
- Trình dựng truy vấn tự do — NG-04.
- Máy chọn mức tự tin hay viết ghi chú — NG-05, `CONTEXT.md` «Mức tự tin».
- Sửa hay xoá bản chụp; tính lại lịch sử — DO-02 «lịch sử không đổi».
- Ghi ngược Google Sheets.

## Cross-cutting áp mọi ô Core

- Mọi thủ tục ghi có vế đọc lại từ cơ sở dữ liệu và để một dòng vết OKR (không `Activity`).
- Khoá theo pha chu kỳ như mười một thủ tục ghi của lượt 3.
- Ba trạng thái màn (đang tải, rỗng, lỗi) và 390/1440; vi/en; chữ người nhập mang `translate="no"`.
- Trí khôn ở tác tử: API không gọi Google, không ghi bản chụp theo lịch; API chỉ ghi `AgentTask` để tác tử đọc thử Sheets.
- Khoá tuỳ chọn không bao giờ ném: thiếu khoá Sheets thì mất một nguồn, không mất khu OKR.
