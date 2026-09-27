# Quét độ phủ — khep-ky-okr

Preset `entity-feature` (thực thể: chu kỳ OKR ở nửa sau vòng đời), chạy trước khi viết
thiết kế. Bản này là thước CE cho hợp đồng và kế hoạch.

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub, khu OKR — chân sản phẩm đào từ kho:
  `CONTEXT.md` (Điểm cuối kỳ, Chu kỳ, Chương trình OKR, KR, Kiểu KR, Nguồn số)
  [SUY-TỪ-REPO: CONTEXT.md], `docs/plan/lo-trinh-okr.md` mục 5 «Lượt 7»
  [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.md], `packages/validation/src/okr-chu-ky.ts`
  (bốn pha, hai pha ghi được) [SUY-TỪ-REPO: packages/validation/src/okr-chu-ky.ts],
  `apps/api/src/okr/okr.service.ts` (`setCyclePhase` chỉ đi tới; `assertKyGhiDuoc`)
  [SUY-TỪ-REPO: apps/api/src/okr/okr.service.ts].
- Chân ngành (tra web 2026-09-27): Perdoo «Close OKRs» — đóng OKR để ghi điều học được,
  giữ OKR có số trễ ở trạng thái mở [NGÀNH: Perdoo]; Google re:Work — chấm 0,0–1,0,
  tham vọng 0,6–0,7 là tốt [NGÀNH: Google re:Work]; mooncamp / okrstool «OKR Review» —
  mỗi mục tiêu quyết mang sang, viết lại hay bỏ; review (nội dung) tách khỏi
  retrospective (quy trình) [NGÀNH: mooncamp, okrstool].

## Trục

- **Trục A — khâu:** rà giữa kỳ · sang pha chấm (chốt số) · chấm KR · nhìn lại mục tiêu
  (điều học được) · mang sang · đóng / mở lại · xuất · kiểm chất lượng khi đặt
  [thước CE: sáu gạch «Ý định» + bốn gạch «Trong phạm vi» của lộ trình lượt 7; NGÀNH:
  Perdoo, mooncamp]. Tám giá trị — «đóng / mở lại» gộp vì là hai chiều của cùng một cửa;
  «kiểm khi đặt» đứng riêng vì nó thuộc đầu vòng nhưng cùng lượt.
- **Trục B — người:** quản trị · người sửa được mục tiêu (trưởng đơn vị, người phụ trách
  mục tiêu) · người phụ trách KR · thành viên không sửa được · vai «chỉ OKR»
  [thước CE: `OkrAccessService` (`assertQuanTri`, `assertSuaMucTieu`, `assertSuaKr`),
  `CONTEXT.md` «Vai chỉ OKR»].
- **Trục C — pha chu kỳ:** lập kế hoạch · đang chạy trong cửa sổ rà · đang chạy ngoài cửa
  sổ rà · chấm điểm · đã đóng [thước CE: `PHA_CHU_KY` + cửa sổ rà mới].
- **Trục D — hình dạng KR:** tăng tới · giảm xuống · giữ trên · giữ dưới · mốc · phần
  trăm; mỗi kiểu nguồn tay hoặc máy [thước CE: `KIEU_KR`, `NGUON_KR`].

Lớp phụ (áp như cross-cutting, không thành trục): loại mục tiêu cam kết / tham vọng;
trạng thái mục tiêu nháp / công bố / đã bỏ; thang chấm 0–1 / 0–100; trọng số bật / tắt.

## Không gian

A × C là lát cắt chính (8 × 5 = 40 ô). Ô vô nghĩa gạch: chấm, nhìn lại, mang sang, xuất,
mở lại ở lập kế hoạch và đang chạy (chưa có số chốt); rà giữa kỳ ở chấm điểm và đã đóng;
kiểm khi đặt ở chấm điểm và đã đóng (không đặt được). Còn khoảng 20 ô có nghĩa, mỗi ô
nhân B và D ở các AC dưới.

## Core

1. Rà giữa kỳ × đang chạy × quản trị — mở / đóng cửa sổ; sửa đích trong và ngoài cửa sổ
   (lý do + nhãn) × người sửa được KR.
2. Sang pha chấm × quản trị — chốt số mọi KR đã công bố, điểm gợi ý theo sáu kiểu × thang.
3. Chấm KR × chấm điểm × người sửa được KR — xác nhận gợi ý, chỉnh kèm lý do; người không
   sửa được và vai «chỉ OKR» không sửa KR của người khác bị từ chối; nhãn «đích sửa ngoài
   rà» hiện cạnh điểm.
4. Nhìn lại × chấm điểm × người sửa được mục tiêu — ô điều học được, ghi và đọc lại.
5. Đóng × chấm điểm × quản trị — từ chối khi còn KR chưa chấm (nói còn bao nhiêu, ở đơn
   vị nào), đi khi đủ; khoá mọi ghi sau đóng (kể cả chấm, điều học được).
6. Mở lại × đã đóng × quản trị — lý do bắt buộc, vết, về chấm điểm.
7. Mang sang × chấm điểm, đã đóng × người sửa được mục tiêu — bản nháp ở chu kỳ kế, nối
   hai chiều.
8. Xuất × đã đóng × mọi vai đọc OKR — tệp một dòng mỗi KR.
9. Kiểm khi đặt × lập kế hoạch, đang chạy × người đặt — bốn luật, hỏi không chặn.

## Later

- Nhắc chấm và nhắc rà qua Slack, Zalo.
- Kiểm luật trên màn xem trước khi nhập bảng tính.
- Đóng từng mục tiêu riêng khi KR có số trễ, giữ mục tiêu «đang mở» sau khi kỳ đóng
  [NGÀNH: Perdoo] — kỳ của OneHub đóng cả khối; KR số trễ ghi vào điều học được.
- Retrospective quy trình (nhìn lại cách đơn vị chạy OKR) tách khỏi nhìn lại nội dung
  [NGÀNH: mooncamp] — một ô điều học được mỗi mục tiêu là đủ cho quý 4.
- Chấm sao cho khâu thực thi [NGÀNH: Perdoo] — thêm một con số dễ thành xếp hạng.
- Nhiều cửa sổ rà chồng nhau, cửa sổ rà theo từng đơn vị.

## Never

- Điểm nối lương, thưởng, xếp hạng người hay đơn vị — từ điển «Điểm cuối kỳ».
- Máy tự chấm thay người mà không có xác nhận — «máy gợi ý, người chỉnh».
- Tính lại số chốt khi mở lại kỳ — số đã báo lên phải đứng yên.
- Kiểm chất lượng bằng mô hình trong lượt này — lượt 9b.

## Cross-cutting áp mọi ô Core

- Mọi ghi để một dòng vết (`okrTrail`) với trước → sau; mọi thủ tục mới đi qua ma trận
  phạm vi `vai-chi-okr`.
- Ba trạng thái màn (đang tải, rỗng, lỗi có «Thử lại»), 390 và 1440, vi và en, chữ người
  nhập mang `translate="no"`.
- `migration` chỉ thêm bảng; không cột mới trên bảng có sẵn.
- Hằng số chỉnh được (bước thang, ngưỡng đọc 0,7, trần chữ) ở một mô-đun cấu hình.
