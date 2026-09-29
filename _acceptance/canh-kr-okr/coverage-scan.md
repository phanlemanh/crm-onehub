# Quét độ phủ — canh-kr-okr (lượt 8a)

Preset `entity-feature` (thực thể: KR và các vật nằm cạnh nó), chạy trước khi viết
thiết kế. Bản này là thước CE cho hợp đồng và kế hoạch.

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub, khu OKR. Chân sản phẩm đào từ kho: câu «Ý định» và bảng
  phủ của lượt 8 [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.md], từ điển «Kết quả then chốt»
  («Việc và sáng kiến gắn vào KR là thứ khác»), «Trao đổi (OKR)», «Phạm vi dữ liệu»
  (chiến dịch và kế hoạch 30 ngày là dữ liệu đối tác) [SUY-TỪ-REPO: CONTEXT.md], quyền
  theo bản ghi `ghiDuocKr`, khoá pha `assertKyGhiDuoc`, luật vết [SUY-TỪ-REPO:
  docs/api.md], hàng đợi việc OKR `viecOkr` [SUY-TỪ-REPO: packages/db/src/okr-nhac.ts],
  bộ OKR mẫu của hạng mục M [SUY-TỪ-REPO: _acceptance/bo-okr-mau/contract.md, nhánh
  `feat/bo-okr-mau`].
- Chân ngành (tra web 2026-09-28): Perdoo — Initiatives là «dự án và việc» gắn vào KR,
  là giả thuyết đẩy KR, nối được tới thẻ Asana/Trello có sẵn [NGÀNH: Perdoo
  «Initiatives in Perdoo»]; Profit.co — ghi nhận đồng nghiệp gắn với tiến độ OKR
  [NGÀNH: Profit.co]; Perdoo — mẫu do quản trị đặt ở Configure › Templates [NGÀNH:
  Perdoo Support «Add templates»]; Weekdone — thư viện ví dụ OKR theo phòng ban
  [NGÀNH: Weekdone OKR examples].

## Trục

- **Trục A — vật cạnh KR:** việc tự gõ · sáng kiến là chiến dịch có sẵn · sáng kiến là
  kế hoạch 30 ngày có sẵn · bằng chứng của KR mốc · ghi nhận · mẫu OKR
  [thước CE: câu «Ý định» lượt 8 phần 8a + năm mã SK-01, SK-02, CI-05, CI-06, MT-07;
  NGÀNH: Perdoo initiatives, Profit.co recognition, Perdoo templates]. Sáu giá trị.
- **Trục B — thao tác:** tạo · đọc lại · sửa hay đánh dấu xong · gỡ · báo người liên
  quan [thước CE: mục 2 lộ trình «mỗi thủ tục ghi có một AC đọc lại từ DB»; luật vết
  mọi ghi của `docs/api.md`].
- **Trục C — người:** quản trị · người sửa được KR (người phụ trách KR, trưởng đơn vị)
  · người làm một việc / người được ghi nhận · thành viên khác · vai «chỉ OKR»
  [thước CE: `OkrAccessService`, từ điển «Vai chỉ OKR», «Phạm vi dữ liệu»].
- **Trục D — pha và trạng thái:** mục tiêu nháp · đã công bố, chu kỳ lập kế hoạch hoặc
  đang chạy · chu kỳ chấm điểm hoặc đã đóng · mục tiêu đã bỏ [thước CE: `PHA_CHU_KY`,
  `assertKyGhiDuoc`, `TRANG_THAI_MUC_TIEU`].

Lớp phụ áp như cross-cutting: bản ghi gốc của sáng kiến đổi tên, lưu trữ, xoá hẳn;
người làm hay người nhận đã rời; bốn đường vào (màn, tRPC, REST, khoá API); màn rỗng ·
đang tải · lỗi; khổ 1440 và 390; bộ OKR mẫu.

## Không gian

A × B = 30 ô. Gạch vô nghĩa: «sửa» của ghi nhận (gửi rồi thì thôi — chỉ gỡ); «đánh dấu
xong» của sáng kiến gắn sẵn (trạng thái đọc từ bản ghi gốc); «báo người» của mẫu và bằng
chứng (không ai đợi tin). Còn 25 ô, mỗi ô nhân C và D trong AC.

## Core

1. Việc × tạo, sửa, xong, gỡ × người sửa được KR và người làm — đọc lại từ bảng, vết.
2. Sáng kiến gắn sẵn × tạo, đọc, gỡ × vai có phạm vi đối tác — lưu mã, đọc tên và trạng
   thái sống từ bản ghi gốc; vai «chỉ OKR» không gắn được.
3. Sáng kiến gắn sẵn × đọc × vai «chỉ OKR» × bốn đường vào — không lộ tên, mã, trạng thái
   của chiến dịch hay kế hoạch.
4. Sáng kiến gắn sẵn × đọc × bản ghi gốc lưu trữ / xoá hẳn — hàng còn, nhãn nói rõ;
   xoá hẳn bản ghi gốc không bị chặn.
5. Bằng chứng × tạo, đọc, gỡ × người sửa được KR × KR mốc — đường dẫn http(s) và ghi chú.
6. Ghi nhận × tạo, đọc, gỡ × mọi vai (kể cả «chỉ OKR») × mục tiêu đã công bố.
7. Ghi nhận × báo người nhận — «việc của tôi» và tin nhắc buổi sáng.
8. Mẫu × tạo, sửa, lưu trữ × quản trị.
9. Mẫu × đọc và dùng × trưởng đơn vị khi đặt mục tiêu — lọc theo cấp và đơn vị.
10. Mọi ghi × pha chấm điểm, đã đóng, mục tiêu đã bỏ — bị từ chối (trừ ghi nhận).

## Later

- Việc đến hạn nhắc qua Zalo hay Slack, việc được giao hiện trong «việc của tôi» — phần
  gửi tin, hợp với 8b.
- Việc con trong một sáng kiến (checklist hai tầng) [NGÀNH: Profit.co tasks trong
  initiatives] — một tầng đủ cho quý 4.
- Sáng kiến góp vào tiến độ mục tiêu có trọng số [NGÀNH: Perdoo progress drivers] — tiến
  độ OKR của OneHub chỉ đọc KR; trộn việc vào là đo việc làm thay kết quả.
- Tải tệp làm bằng chứng — kho chỉ có Vercel Blob công khai cho ảnh; tệp bằng chứng công
  khai theo đường dẫn là lối rò.
- Mẫu theo nhãn «loại đơn vị» khai ở cây tổ chức — cây chưa có trường loại; chọn đơn vị
  trực tiếp là đủ tới khi có loại thật.
- Nối việc với Asana, Trello, Jira [NGÀNH: Perdoo] — OneHub chưa dùng công cụ nào trong số đó.
- Trợ lý OKR đọc việc, sáng kiến, ghi nhận — lượt 9b hay C quyết.

## Never

- Bảng xếp hạng người theo ghi nhận, đếm ghi nhận mỗi người, điểm đổi quà — NG-07.
- Máy tự đánh dấu việc xong hay tự ghi bằng chứng — NG-05.
- Chép tên chiến dịch hay kế hoạch vào hàng sáng kiến — tên cũ sống mãi, và vai «chỉ OKR»
  đọc được dữ liệu đối tác qua bản chép.
- Nút «tạo mục tiêu cấp dưới từ KR cấp trên» trong mẫu — NG-06.

## Cross-cutting áp mọi ô Core

- Mọi ghi để đúng một dòng `OkrTrail`, không `Activity`.
- Mọi thủ tục mới nằm trong router `okr` (phạm vi OKR); danh sách thủ tục vai «chỉ OKR»
  với tới được sửa có chủ ý ở `vai-chi-okr.spec.ts`.
- Màn rỗng · đang tải · lỗi; khổ 390 không cuộn ngang.
- Bảng mới là khối liền cuối `schema.prisma`, `migration` chỉ tạo bảng.
