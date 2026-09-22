# Quét hình thái — may-nhac-truoc-nguoi

Ngày 2026-09-22 · preset xuất phát `entity-feature` (entity = một lần nhắc), trục
dựng lại từ B1 vì nhắc là một luồng thời gian × kênh chứ không phải một bản ghi.

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub, điều phối 30 ngày đầu của đối tác — chân sản
  phẩm: đào repo (`CONTEXT.md`, `docs/agent.md`, `docs/plan/lo-trinh-dieu-phoi-30-ngay.md`,
  `opportunity.md` của hồ sơ này) · chân ngành: nhắc hạn việc của Asana (nhắc
  trước hạn, tổng hợp qua Slack) và nhắc việc của HubSpot (nhắc task tới người
  sở hữu) — `[NGÀNH: Asana, HubSpot]`.
- Người gạch các dòng `[GIẢ ĐỊNH]` ở Cổng Phạm vi (gom về Coverage của hợp đồng).

## Trục

- Trục A — loại nhắc: `buoc-qua-han` | `buoc-sap-han` | `ke-hoach-im` | `moc-ngay` — [thước CE: design doc mục 3 + lộ trình mục Lượt 3 «sắp tới hạn, im quá lâu, tới mốc»] `[SUY-TỪ-REPO: docs/plan/lo-trinh-dieu-phoi-30-ngay.md]`
- Trục B — người nhận: người được giao | người cầm trịch | người theo dõi | người không còn trong xưởng — [thước CE: design doc mục 3 bảng người nhận + opportunity.md «Người gặp»] `[SUY-TỪ-REPO: _acceptance/may-nhac-truoc-nguoi/opportunity.md]`
- Trục C — đường tới người: Slack gửi được | xưởng chưa nối Slack | người chưa khớp Slack | Slack trả lỗi | thiếu `APP_URL` | thẻ Tasks trong app — [thước CE: nếp `capabilities.ts` + `run-runtime.ts` gửi Slack] `[SUY-TỪ-REPO: apps/agent/agent/lib/capabilities.ts]`
- Trục D — thời điểm quét: trước 08:30 | lần đầu sau 08:30 | quét lại cùng ngày | ngày mới | tác tử tắt qua nửa đêm | quanh nửa đêm giờ VN — [thước CE: `schedules/dispatch.ts` chạy mỗi phút; «ngày» là ngày giờ VN] `[SUY-TỪ-REPO: apps/agent/agent/schedules/dispatch.ts]`

Theo dõi (bật · tắt · bật hai lần) là một thao tác ghi riêng, đo như lớp cross-cutting «mỗi thủ tục ghi có một AC đọc lại từ DB».

## Không gian

A × B có nghĩa: 8 ô (bước → người được giao; im/mốc → cầm trịch, theo dõi; mọi loại → người đã rời xưởng = không nhận). C và D quét theo lát của trục quan trọng nhất (A đã gom thành một tin/người/ngày), nên 6 × 6 = 36 ô có nghĩa cho lát «một tin buổi sáng». Tổng ≈ 44 ô có nghĩa.

## Core (≤ 20% — 9 ô)

1. A × B đúng người nhận, gồm ca không nhận (bước đã xong, kế hoạch đóng, bước chưa giao, người đã rời, người theo dõi không nhận nhắc bước) — nhắc sai người là lỗi đắt nhất.
2. Biên ngưỡng: `sapHanNgay`/`+1`, im 6/7, ngày 13/14/15 — ngưỡng là nơi hằng số trôi.
3. D: trước 08:30 không ghi; lần đầu sau 08:30 đúng một hàng/người; quét lại không thêm; ngày mới thêm — chống trùng là lời hứa «tối đa một tin».
4. D: quanh nửa đêm giờ VN (00:30 và 23:30 VN) — «ngày» VN khác ngày UTC.
5. C: Slack gửi được → đúng người Slack, mỗi dòng mang `?record=plan:<id>`; `outcome` đọc lại từ DB.
6. C: xưởng chưa nối / người chưa khớp → không lời gọi Slack, `outcome` ghi lý do, không ném.
7. C: thẻ Tasks hiện `ke-hoach-im` và `moc-ngay` cho người cầm trịch và người theo dõi, bấm mở đúng kế hoạch (xuyên lớp).
8. Theo dõi bật/tắt đọc lại từ DB + vết; bật hai lần không đẻ hàng thứ hai.
9. Đường đo của ngưỡng UAT: số ngày im trung vị và tỷ lệ bước tới hạn đã nhận nhắc xong đúng hạn.

## Later

- C: Slack trả lỗi tạm (429, token hết hạn) — đi luật thử lại sẵn có của `AgentTask`; không thêm AC, ghi trong Notes.
- C: thiếu `APP_URL` → tin không đường mở — một dòng Notes, đo cùng AC làn gửi nếu rẻ.
- D: tác tử tắt qua nửa đêm → bỏ ngày đó — hành vi rơi ra từ khoá `subject` theo ngày, không đo riêng.
- Tin vượt trần 10 dòng → «và N việc nữa» — đo trong AC làn gửi.
- `[NGÀNH: Asana]` người tự chọn giờ nhận / tắt từng loại nhắc — lượt sau, nếu phiên nghiệm thu thấy tắt tiếng nhiều.

## Never

- Kênh thư — cần `gmail.send` + đường gửi mới trong `mailbox`, T3 riêng (opportunity.md).
- `[NGÀNH: HubSpot]` nhắc tức thời theo sự kiện — trái chốt «một tin mỗi sáng» (sổ quyết định).
- Leo thang lên quản lý, nhắc đối tác — ngoài phạm vi của lộ trình.

## Cross-cutting áp mọi ô Core

- Mọi ngưỡng ở `NHAC`; không số rời trong code.
- `AgentTask.payload` chỉ giữ mã — Luật 91/2025/QH15 `⏱ verify-current` ở S3.
- Chữ trên màn qua bảng tin nhắn có dấu; dữ liệu người nhập mang `translate="no"`.
- `[GIẢ ĐỊNH]` chờ gạch: OneHub đã nối Slack và phần lớn người được giao khớp Slack; tin Slack riêng là chỗ người bộ phận đọc.
