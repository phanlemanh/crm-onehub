# Coverage scan — dot-hoi-y-tuong-okr (Hỏi ý mục tiêu)

Preset `entity-feature`, chạy 2026-09-29 ở S1, trước design doc.

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub, khu OKR — chân sản phẩm: đào repo (`CONTEXT.md`
  mục OKR, Chu kỳ, Mục tiêu, Vai «chỉ OKR», Phạm vi dữ liệu, Trợ lý OKR, Đề xuất;
  `docs/api.md` mục OKR; `docs/agent.md` mục Nhắc buổi sáng; hồ sơ Cổng Đáng
  `_acceptance/dot-hoi-y-tuong-okr/opportunity.md` đã ký 2026-09-29).
- Chân ngành (tra web 2026-09-29, bậc b):
  - [NGÀNH: vòng đời ý tưởng của phần mềm quản lý ý tưởng — thu · xếp theo chủ đề ·
    đánh giá · ưu tiên · làm · báo lại người góp (Guideflow, tổng hợp 15 nền tảng
    2026)] — https://www.guideflow.com/blog/idea-management-software-platforms
  - [NGÀNH: Ideanote — người quản lý trả lời thẳng ý góp và báo lại chuyện gì đã xảy
    ra với ý, «đóng vòng để người góp tiếp tục góp»]
  - [NGÀNH: Microsoft Employee Ideas (Teams) — «chiến dịch ý tưởng», người góp và
    bình chọn] — https://ideas.sideways6.com/article/how-to-run-an-employee-ideas-campaign-on-microsoft-teams
  - [NGÀNH: InnovationCast — điểm, huy hiệu, bảng xếp hạng] → bị luật kho loại (NG-07).
  - [NGÀNH: catchball / Hoshin Kanri — mục tiêu công ty nháp ở trên, đi xuống để
    phản biện rồi quay lên] — i-nexus; kho chọn thứ tự ngược (hỏi trước), đã chốt ở
    Cổng Đáng.

## Trục

Ba trục. Mỗi trục là một chiều độc lập: đổi bước không ép đổi người, đổi người
không ép đổi trạng thái.

- **Trục A — bước của vòng:** mở · góp · gom · chọn · công bố · báo lại
  [thước CE: vòng đời 6 bước của ngành (Guideflow) khớp 1–1; bước 1–2 của áp
  phích VNOKRs trong `opportunity.md`]
- **Trục B — người:** quản trị OKR · người chọn · thành viên · vai «chỉ OKR» ·
  người đã rời hoặc vào sau khi mở
  [thước CE: `OkrAccessService` (quanTri = owner/admin) `[SUY-TỪ-REPO:
  apps/api/src/okr/okr-access.service.ts]`; bốn vai `[SUY-TỪ-REPO:
  packages/validation/src/vai-workspace.ts]`; «người chọn» là vai MỚI theo lần
  hỏi ý, không phải vai workspace `[GIẢ ĐỊNH]`]
- **Trục C — trạng thái lần hỏi ý:** chưa có · đang mở · đang gom · đã công bố ·
  (chu kỳ không ở «lập kế hoạch»)
  [thước CE: `PHA_CHU_KY` `[SUY-TỪ-REPO: packages/validation/src/okr-chu-ky.ts]`;
  ba trạng thái suy từ thời gian và hai mốc đóng/công bố `[GIẢ ĐỊNH]`]

Không gian: 6 × 5 × 5 = 150 ô; phần lớn vô nghĩa (vd «góp» ở «đã công bố»). Quét
theo lát của trục A.

## Core

1. **mở × quản trị × chưa có** — mở lần hỏi ý cho chu kỳ đang lập kế hoạch, chọn
   người chọn, lời mở, 3–5 con số, hạn; một chu kỳ một lần hỏi ý.
2. **mở × {thành viên, chỉ OKR, người chọn không phải quản trị} × chưa có** — bị
   từ chối.
3. **mở × quản trị × chu kỳ không ở «lập kế hoạch»** — bị từ chối.
4. **góp × {thành viên, chỉ OKR, quản trị, người chọn} × đang mở** — góp 1–3 ý,
   sửa và gỡ ý của mình tới hạn; đồng ý với ý người khác (không với ý mình).
5. **góp × mọi người × {đang gom, đã công bố}** — mọi ghi ý và đồng ý bị từ chối.
6. **góp (đọc) × {thành viên, chỉ OKR} × đang mở** — thấy ý người khác KHÔNG kèm
   tên, không thấy số đồng ý; **× {quản trị, người chọn}** thấy tên và số.
7. **viết trước × người chọn × đang mở** — viết 3–5 câu, niêm phong một lần; chưa
   niêm phong (hoặc chưa khai bỏ) thì người chọn KHÔNG đọc được ý; bản viết trước
   không ai khác đọc được — quản trị cũng không — qua màn hay API, tới khi công bố.
8. **gom × {quản trị, người chọn} × đang gom** — tạo, đổi tên, gộp chủ đề; gắn mỗi
   ý vào một chủ đề hoặc «ý lạ»; **× thành viên** bị từ chối; **× đang mở** bị từ
   chối (gom chỉ sau hạn).
9. **chọn × người chọn × đang gom** — mỗi chủ đề một kết luận (chọn · để sau ·
   không làm · đã có) và một lý do tự viết; chủ đề «chọn» có câu mục tiêu; nối
   (hoặc không) với một câu của bản viết trước. **× quản trị không phải người
   chọn** bị từ chối.
10. **công bố × người chọn × đang gom** — chặn khi còn ý chưa gom, chủ đề thiếu
    kết luận hay lý do, 0 chủ đề chọn, hoặc vượt trần mục tiêu OneHub của chương
    trình; qua thì một giao dịch tạo mục tiêu nháp cấp OneHub cho mỗi chủ đề chọn
    (người phụ trách = người chọn, «vì sao lúc này» = lý do của người chọn), nối
    chủ đề ↔ mục tiêu, chuyển trạng thái; vết.
11. **báo lại × người đã góp × đã công bố** — thấy kết luận và lý do của từng ý
    mình; bấm «Tôi hiểu vì sao» một lần; bản viết trước lộ ra cho mọi người kèm
    giữ · thêm · bỏ; kho ý (chủ đề «để sau») ai cũng đọc được.
12. **nhắc × {thành viên, chỉ OKR} × đang mở** — người chưa góp có một dòng trong
    nhắc buổi sáng và trong «Việc của bạn»; người đã góp thì không.
13. **nhắc × người đã góp × đã công bố** — một dòng «đã công bố, xem ý của bạn đi
    đâu» trong cửa sổ 24 giờ sau công bố.
14. **độ phủ × mọi người × {đang mở, đang gom, đã công bố}** — heatmap đơn vị ×
    ngày của lần hỏi ý, tỉ lệ thành viên còn hiệu lực đã góp ≥ 1 ý; không màn nào
    liệt tên người chưa góp.
15. **mọi bước × vai «chỉ OKR»** — vào được mọi thủ tục đọc/ghi của thành viên
    thường ở lần hỏi ý; không phản hồi nào chứa dữ liệu đối tác (không có dữ liệu
    đối tác nào trong vật này — nhưng tập thủ tục vai với tới được sửa có chủ ý).
16. **người đã rời × đã công bố** — ý của người đã rời vẫn nằm trong chủ đề và
    được đếm; không nhận nhắc; mẫu số độ phủ chỉ gồm thành viên còn hiệu lực.

Core 16 / ≈ 80 ô có nghĩa ≈ 20%.

## Later

- **gom × Trợ lý OKR × đang gom** — máy đề xuất nhóm chủ đề khi AI bật (việc mới
  của Trợ lý OKR, cột phạm vi mới, bảng đề xuất riêng vì `OkrDeXuat` buộc có mục
  tiêu, màn nhận/bác mà 9b còn chưa dựng) → lượt nối tiếp 11b. [NGÀNH: Ideanote,
  Guideflow — «tổ chức theo chủ đề» là bước của người, AI là phụ trợ]
- **mở × quản trị × đang mở** — gia hạn và đóng sớm: có trong Core ở mức sửa hạn;
  đóng sớm có ở Core qua «sửa hạn thành bây giờ».
- **góp × Slack/Zalo** — lượt 10 của lộ trình.
- **mở × trưởng đơn vị** — lần hỏi ý riêng của một đơn vị.
- **báo lại × kho ý** làm mồi tự động ở lần hỏi ý kế (hiện cạnh thẻ mồi): lần hỏi
  ý đầu chưa có kho, nên đo được ở lần thứ hai.

## Never

- **góp × ẩn tên / tự chọn ẩn** — bác ở Cổng Đáng: ẩn giả ở 40 người, phá đóng vòng.
- **độ phủ × xếp hạng người, danh sách tên người chưa góp** — NG-07; nhắc đi thẳng
  tới người. [NGÀNH: InnovationCast leaderboard] → loại.
- **chọn × máy điền sẵn lý do** — máy không phát ngôn hộ quyết định.
- **mở × thẻ mồi lấy số đối tác** — rò vai «chỉ OKR».
- **gom × trưởng đơn vị lọc ý trước khi lên** — ý đi thẳng.
- **công bố × sửa sau công bố** — lần hỏi ý đã công bố là hồ sơ; mục tiêu nháp
  sửa ở luồng OKR như thường.

## Cross-cutting áp mọi ô Core

- Vết: mở, sửa, niêm phong, công bố để một dòng `OkrTrail`; ý, đồng ý và gom là
  dữ liệu góp của người, không phải bản ghi OKR — không vết (cùng luật với Đề xuất).
- Bốn đường vào: tRPC, cầu REST, khoá API của chính người đó — cùng một luật quyền.
- Màn: rỗng · đang tải · lỗi kèm «Thử lại»; khổ 390 không cuộn ngang; chữ người
  nhập mang `translate="no"`.
- Bộ OKR mẫu: thêm chu kỳ năm kế ở «lập kế hoạch» và một lần hỏi ý mẫu; nạp lại
  không nhân đôi, xoá sạch.
- `migration` chỉ thêm bảng; bảng mới liền nhau cuối `schema.prisma`.
- Đường đo: câu SQL chỉ đọc cho ba ngưỡng của Cổng Đáng.
