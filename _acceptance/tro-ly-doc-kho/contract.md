---
schema_version: 1
feature: Trợ lý AI đọc Kho tài liệu — hỏi bằng lời thường trong CRM (tab «Hỏi») hay qua bot Zalo, trả lời có trích trang, phiên bản, đoạn nguyên văn do máy chủ kiểm; câu từ chối cố định; cảnh báo quá hạn xác minh và ô đặt hạn; báo sai thành việc cho chủ trang; nhật ký hỏi và hàng câu chưa trả lời được
slug: tro-ly-doc-kho
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: signed-off
design_doc: docs/superpowers/specs/2026-10-01-tro-ly-doc-kho-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-01
---

# Acceptance Contract: tro-ly-doc-kho

## Context

Lượt 4 của `docs/plan/lo-trinh-kho-tai-lieu.md`. Sau lượt này nhân viên nói được: «Tôi hỏi
bằng lời thường, trong CRM hay qua Zalo, được trả lời có trích trang và phiên bản; không biết
thì nói không biết.» Lượt 1 (#180), 2 (#194), 3 (#205) đã lên `onehub`.

Lộ trình ghi T2; lượt này là **T3** vì cần hai bảng mới ở `packages/db/prisma`: nhật ký hỏi
(`TaiLieuHoi`) và việc «báo sai» cho chủ trang (`TaiLieuBaoSai`). Kho chưa có «bảng việc» nào
dùng được: `Activity` kiểu `TASK` không có người được giao và bắt buộc gắn công ty, liên hệ,
thoả thuận hay kế hoạch; `OkrViecKr` bắt buộc một KR.

Source input: lộ trình mục 2, 4 «Lượt 4», 5, 6, 8; `kho-tai-lieu-nghien-cuu.md` mục 4.1, 5.4,
7.2–7.6, 9.1–9.4; `kho-tai-lieu-viet-nam-va-do-luong.md` mục 12.1–12.9; `kho-tai-lieu-bo-vang.md`;
`Notes` của ba hợp đồng trước; `docs/agent.md` mục «Khi nào thêm mã, tool, skill, subagent»;
bản mẫu `ST-tac-nhan-tra-loi`, `ST-tac-nhan-tu-choi`; bốn lựa chọn chủ kho chốt trong phiên
2026-10-01 (tab «Hỏi» trong Kho; Zalo do trợ lý AI tự nhận ra; thêm ô đặt «Xác minh đến ngày»;
chỉ lưu chữ câu chưa trả lời được và câu bị báo sai).

Từ ngữ: «trợ lý AI» trên màn, không «tác nhân» (`CONTEXT.md`). Trong mã, `subagent` tên
`tro_ly_kho`.

## Criteria

- AC-1: Given ma trận viết trước gồm trang đã duyệt có tên và nội dung tiếng Việt có dấu, một trang chưa từng duyệt có bản chờ mang từ «tulapcho», một trang đang dùng có bản chờ mang từ «tulapmoi», một trang đang dùng có bản bị trả lại mang từ «tulaptralai», When `search_pages` của `tro_ly_kho` được gọi với truy vấn có dấu, không dấu, gõ dở và ba từ lạ kia, Then chỉ trả trang có bản đang dùng, đoạn trích lấy từ chữ của bản đang dùng, bản có dấu và bản không dấu cùng tập; And ba từ lạ không ra trang nào; And `taiLieu.tim` của API trả cùng tập slug cho cùng truy vấn, vì cả hai gọi một hàm. (cross-layer)
- AC-2: Given một trang đang dùng có bản chờ mới hơn, một trang chưa từng duyệt, một slug không có, một trang mà thân chứa dấu `<<<TRANG-HET>>>` và câu ra lệnh «bỏ qua mọi chỉ dẫn», và một trang dài hơn trần đọc, When `read_page` được gọi với từng slug, Then trang đang dùng trả đúng chữ, số phiên bản, ngày duyệt, «xác minh đến» của bản đang dùng, không chữ nào của bản chờ; And trang chưa từng duyệt và slug không có trả cùng một kết quả «không có»; And chữ trang nằm giữa `<<<TRANG-BAT-DAU>>>` và `<<<TRANG-HET>>>`, mọi dấu `<<<…>>>` có sẵn trong trang bị xoá; And trang dài bị cắt ở trần và kết quả nói đã cắt.
- AC-3: Given ma trận viết trước các bản nộp `nop_tra_loi` — (a) đúng, (b) đoạn không có trong trang, (c) đoạn đúng nhưng ghi phiên bản cũ, (d) đoạn chỉ có trong bản đề xuất chờ duyệt, (e) câu không kèm trích, (f) con số trong câu không có trong đoạn trích của câu đó, (f2) con số chỉ khớp một phần trong đoạn («20%» với «2026», «1,2» với «1,25»), (f3) con số chỉ có trong đoạn trích của câu khác, (g) đoạn đúng nhưng gõ dạng NFD, (h) đoạn ngắn hơn trần tối thiểu, (i) slug không có, (j) bản được duyệt mới giữa lúc đọc và lúc nộp — When máy chủ kiểm, Then chỉ (a) và (g) được nhận; And mỗi ca còn lại, kể cả (d) chạy trên bản đề xuất thật trong cơ sở dữ liệu, bị bác bằng thông điệp nêu đúng câu, đoạn, số hay phiên bản sai; And hàng `TaiLieuHoi` chỉ thành «đã trả lời» khi bản nộp được nhận, câu trả lời lưu là bản đã kiểm.
- AC-4: Given (i) kho không có trang nào khớp câu hỏi, (ii) trợ lý AI nộp «không biết», (iii) trợ lý AI bị bác tới trần số lần bác, When phiên kết thúc, Then người hỏi nhận đúng câu từ chối cố định của mã, kèm tối đa ba «trang gần nhất» lấy tên từ bản đang dùng (không có thì không kèm), không chữ nào do model viết; And hàng `TaiLieuHoi` đóng «từ chối» với lý do `khong-co-trang` hoặc `trich-truot` và giữ chữ câu hỏi. (cross-layer)
- AC-5: Given câu trả lời được nhận có trích bốn trang với «xác minh đến» là hôm qua, hôm nay, ngày mai và không có ngày, theo giờ Việt Nam, When câu trả lời được dựng, Then có đúng một cảnh báo, cho trang hôm qua, nêu tên trang, ngày và tên chủ trang; And ngày quá hạn tính bằng cùng hàm của danh sách «Quá hạn xác minh» ở tab Sức khoẻ.
- AC-6: Given ma trận năm người (chủ trang, `owner`, `admin`, thành viên khác, vai `okr`) × hai trang (thấy được, chưa từng duyệt của người khác), When mỗi người đặt rồi gỡ «Xác minh đến ngày», Then chủ trang, `owner`, `admin` đặt và gỡ được, mỗi lần ghi một sự kiện `XAC_MINH`; thành viên khác và vai `okr` nhận `FORBIDDEN` trên trang thấy được, `NOT_FOUND` trên trang không thấy, cột không đổi; And màn đọc hiện «Xác minh đến <ngày>» hoặc «Quá hạn xác minh», nút «Đặt hạn xác minh» chỉ hiện với người có quyền; And đặt hạn trong quá khứ thì trang vào danh sách «Quá hạn xác minh» của tab Sức khoẻ. (cross-layer)
- AC-7: Given một thành viên ở Kho tài liệu, When mở tab «Hỏi», gõ một câu và nhấn Enter, Then thấy «Trợ lý AI đang đọc kho…» rồi câu trả lời, dưới mỗi ý là trích dẫn với tên trang dẫn tới màn đọc, phiên bản, ngày duyệt và đoạn nguyên văn đọc từ hàng `TaiLieuHoi` đã kiểm; And câu bị từ chối hiện câu cố định, «Trang gần nhất» và «Câu hỏi đã vào hàng chưa trả lời được»; And lỗi trợ lý AI hiện câu cố định với nút «Hỏi lại»; gửi lỗi mạng giữ nguyên chữ trong ô với nút «Thử lại»; And người vai `okr` không thấy tab «Hỏi» và `taiLieu.hoi` từ chối họ. (cross-layer)
- AC-8: Given một người đã nối Zalo hỏi câu về quy định có trang trả lời, một câu không trang nào trả lời, và một câu về thoả thuận trong CRM, When bot nhận từng tin, Then câu quy định đi qua `tro_ly_kho`, hàng `TaiLieuHoi` kênh Zalo nối với câu Zalo đó có trước bước model đầu tiên của `tro_ly_kho`, và bot gửi câu trả lời dựng bằng mã từ hàng `TaiLieuHoi` kênh Zalo (tên trang, «phiên bản N», đoạn trong «…»), qua `locTraLoi`, không gửi chữ agent gốc tự viết; And câu không có trang nhận đúng câu từ chối cố định; And câu thoả thuận vẫn trả lời như trước, không mở `tro_ly_kho`; And mỗi câu tính vào trần Zalo đúng một lần và không tính vào trần của tab «Hỏi». (cross-layer)
- AC-9: Given ma trận viết trước các câu hỏi CRM và Zalo kết thúc «đã trả lời», «từ chối» và «lỗi», When đọc bảng `TaiLieuHoi` và gọi `demHoiKho(tu, den)`, Then mỗi câu có đúng một hàng với người hỏi, kênh, thời điểm, kết quả, trang và phiên bản được trích, token, chi phí, nhãn khoá; And hàng «đã trả lời» không còn chữ câu hỏi từ lần ghi kết quả, hàng «từ chối» giữ chữ; And `demHoiKho` trả đúng số mỗi loại và tỉ lệ «đã trả lời / (đã trả lời + từ chối)», hàng lỗi không vào tỉ lệ; And không dòng log nào mang chữ câu hỏi hay câu trả lời.
- AC-10: Given các câu bị từ chối có «trang gần nhất» thuộc nhiều chủ trang và một câu không có trang gần nhất, When `owner`, `admin`, từng chủ trang và một thành viên khác mở tab «Sức khoẻ», Then «Câu chưa trả lời được» hiện đủ mọi câu với quản trị, chỉ câu có trang gần nhất của mình với chủ trang, không câu nào với thành viên khác; And không dòng nào có tên người hỏi; And «Đã xử lý» chỉ quản trị và chủ trang liên quan bấm được, dòng rời danh sách và hàng ghi người, lúc xử lý; And tải danh sách lỗi hiện lỗi có nút «Thử lại». (cross-layer)
- AC-11: Given một câu trả lời đã nhận trích hai trang của hai chủ trang, When người đã hỏi bấm «Báo sai» kèm ghi chú, Then mỗi trang được trích có đúng một việc «báo sai» mang câu hỏi, ghi chú, phiên bản đã trích, hiện ở danh sách «Bị báo sai» của tab Sức khoẻ cho chủ trang đó và quản trị, không cho người khác; And báo lần hai không tạo thêm việc, nút thành «Đã báo sai»; And người khác người hỏi, hay câu «từ chối», không báo sai được; And chủ trang đóng việc bằng một kết luận bắt buộc, «Trợ lý trả lời sai» hay «Trợ lý trả lời đúng theo trang», ghi người, lúc và kết luận; And `demBaoSai` trả đúng tổng, số đã xử lý và số xác nhận sai. (cross-layer)
- AC-12: Given bản dựng của `apps/agent`, When đọc danh sách tool, sandbox và cấu hình model của `tro_ly_kho` và chạy một phiên trên model giả, Then `tro_ly_kho` có đúng ba tool sống `search_pages`, `read_page`, `nop_tra_loi`, mọi tool dựng sẵn bị tắt, sandbox chặn mạng; And mọi lời gọi model mang ZDR với khoá riêng `KHO_TAI_LIEU_AI_GATEWAY_API_KEY` lẫn khoá chung, nhãn khoá `rieng`/`chung` vào sổ; And mỗi tool gọi ngoài phiên con của `tro_ly_kho` hay với hàng không còn «đang hỏi» ném lỗi ngay trong `execute`; And kết quả `tro_ly_kho` trả về agent gốc không chứa chữ trang nào; And khuôn mọi tool chuyển được sang JSON Schema không có `$ref`; And mỗi bước model ghi token và chi phí vào hàng `TaiLieuHoi` và sổ chi phí AI với tính năng `tai-lieu.tro-ly`.
- AC-13: Given AI Gateway trả lỗi hết ngân sách, hết tín dụng hay 402 (ở CRM, và ở Zalo ngay bước model đầu tiên của `tro_ly_kho` trước mọi tool), model trả lỗi khác, phiên con xong mà chưa nộp, và một hàng «đang hỏi» quá hạn trả lời, When phiên kết thúc hay nhịp dispatch chạy, Then hàng đóng «lỗi» với lý do `het-tran`, `loi-model` hay `qua-han` tương ứng; And người hỏi ở CRM thấy và ở Zalo nhận câu cố định «Trợ lý AI tạm dừng vì hết hạn mức tháng.» cho `het-tran`, «Chưa trả lời được lúc này.» cho các lý do khác; And sau nhịp dispatch không còn hàng «đang hỏi» nào quá hạn. (cross-layer)
- AC-14: Given trần tab «Hỏi» mỗi người mỗi ngày và cả xưởng mỗi tháng theo giờ Việt Nam, When một người gửi câu vượt trần ngày, rồi một người khác gửi câu khi xưởng đã đủ trần tháng, Then `taiLieu.hoi` từ chối bằng câu nêu trần, không ghi việc cho agent, không mở phiên; And câu thứ n bằng trần vẫn được nhận; And trần đếm hàng kênh CRM, không đếm hàng Zalo; And tab «Hỏi» hiện câu trần và khoá ô nhập. (cross-layer)
- AC-15: Given bộ câu đo «tạm» do máy soạn từ các trang mẫu của kho đo (chủ kho chọn ở Cổng Phạm vi 2026-10-01), mỗi câu gắn trang mong đợi hoặc nhãn «không có trang» và mang nhãn «tạm», When script chấm hỏi từng câu qua đúng đường `tro_ly_kho` với model và khoá thật, rồi hỏi lại mọi câu cộng một mẫu câu không phải quy định qua phiên Zalo của agent gốc, Then mỗi câu có nhãn trả lời đúng trang hay từ chối đúng, và mỗi câu Zalo có nhãn chuyển hay không chuyển, được tính và in ra, đạt ngưỡng ghi ở `evals.yaml`; And người duyệt đọc câu trả lời của nhóm câu khó và câu phải từ chối thấy không câu nào khẳng định điều trang không nói. (judgment)

## Coverage

Quét bằng `morphological-scan` (preset entity-feature, chất vấn trục) ở phiên 2026-10-01.
Chân sản phẩm: lộ trình, nghiên cứu nền, schema và mã của ba lượt trước. Chân ngành: Intercom
Fin, Slite Ask, GitBook Content gaps, Zendesk Knowledge Capture — tên có thật, nghiên cứu mục
5.4 dẫn — cho câu trả lời có nguồn, nút báo câu trả lời sai giao cho chủ trang, hàng câu chưa
trả lời được.

- Trục A — kênh hỏi: tab «Hỏi» trong CRM (AC-7, AC-14) · bot Zalo (AC-8) · tab Agent của khung
  bản ghi (để sau, chủ kho chọn tab «Hỏi»). [thước CE: lộ trình mục 4 «Lượt 4»; SUY-TỪ-REPO:
  `apps/app/components/crm/agent-panel.tsx`, `apps/agent/agent/lib/zalo-hoi.ts`]
- Trục B — kết quả của một câu: trả lời có trích (AC-3, AC-7) · từ chối vì không có trang ·
  từ chối vì trích trượt tới trần (AC-4) · lỗi model hay hết tiền (AC-13) · vượt trần (AC-14)
  · không có quyền hỏi (AC-7 vai `okr`, Zalo chưa nối đã có từ `hoi-crm-qua-zalo`). [thước CE:
  nghiên cứu 7.3, 7.4; NGÀNH: Intercom Fin, Slite Ask]
- Trục C — trạng thái trang chạm tới: bản đang dùng còn hạn · quá hạn xác minh (AC-5, AC-6) ·
  chỉ có bản đề xuất hay bản trả lại (AC-1, AC-2, AC-3 d) · bản đang dùng đổi giữa đọc và nộp
  (AC-3 j) · không tồn tại (AC-2, AC-3 i) · thân trang chứa dấu phân cách hay lệnh (AC-2) ·
  trang lưu trữ (lượt 3b). [thước CE: `packages/db/prisma/schema.prisma` `TaiLieuTrang`,
  `TaiLieuDeXuat`; CONTEXT.md mục Bản đề xuất, Bản đang dùng, Xác minh đến ngày]
- Trục D — việc sau câu trả lời: không gì · báo sai (AC-11) · chủ trang xử lý câu chưa trả
  lời được (AC-10) · chủ trang xử lý báo sai (AC-11) · chủ trang đặt hạn xác minh (AC-6) · đo
  bốn số (AC-9). [thước CE: lộ trình mục 5; NGÀNH: Zendesk Knowledge Capture, GitBook Content
  gaps]
- Cross-cutting: ranh giới tiền và nơi gửi của `tro_ly_kho` (AC-12); không chữ nào chưa kiểm
  tới người hỏi (AC-3, AC-4, AC-8); vai người xem (chủ trang, `owner`, `admin`, thành viên
  khác, `okr`) ở AC-6, AC-7, AC-10, AC-11; lỗi hiện là lỗi (AC-7, AC-10, AC-13); chất lượng trên
  câu thật (AC-15).
- [GIẢ ĐỊNH] Agent gốc ở Zalo nhận ra câu quy định đủ thường xuyên để kênh Zalo có ích; không đo
  tỉ lệ nhận nhầm trong lượt này ngoài mẫu câu của AC-15. Chủ kho chọn «trợ lý tự nhận ra»
  2026-10-01, biết rủi ro này.
- [GIẢ ĐỊNH] Trần tab «Hỏi» 20 câu mỗi người mỗi ngày và 600 câu cả xưởng mỗi tháng đủ cho
  hai tuần chạy thật; ngân sách theo giá đo ở `hoi-crm-qua-zalo` ($0,016–0,039 một câu).

## Đường đo

- Thước: câu hỏi được trả lời có trích trên tổng câu hỏi (ngưỡng ≥ 70%, lộ trình mục 5) · số từ: `demHoiKho` trên `TaiLieuHoi` · bảo đảm bởi: AC-9
- Thước: số lần bấm «báo sai», số đã xử lý, số chủ trang xác nhận trợ lý trả lời sai (ngưỡng CHẾT của `opportunity.md`) · số từ: `demBaoSai` trên `TaiLieuBaoSai.ketLuan` · bảo đảm bởi: AC-11
- Thước: tỉ lệ câu quy định qua Zalo được chuyển cho trợ lý kho · số từ: lượt Zalo của script chấm bộ câu đo (câu không được chuyển không sinh hàng nào, nên bảng không đếm được) · bảo đảm bởi: AC-15
- Thước: số câu chưa trả lời được và số đã xử lý · số từ: `TaiLieuHoi` trạng thái «từ chối» và `xuLyLuc` · bảo đảm bởi: AC-10
- Thước: số trang quá hạn xác minh cuối chạy thật · số từ: `TaiLieuTrang.xacMinhDen`, nay có đường ghi · bảo đảm bởi: AC-6

## Out of scope

- Vai «chỉ OKR» hỏi kho — từ điển chốt vai này không gọi được trợ lý AI; tab «Hỏi» giữ luật đó. Mở ra là việc riêng.
- «Báo sai» qua Zalo; nhắc chủ trang qua Zalo hay email về báo sai và câu chưa trả lời được.
- Hội thoại nhiều lượt có ngữ cảnh; phép tính trên số trích (vd tính tiền từ tỉ lệ).
- Trang lưu trữ — lượt 3b `lich-su-va-luu-tru-trang`; hàm tìm và đọc là một chỗ để lượt đó thêm điều kiện.
- Hiệu lực theo ngày, trang bị thay thế (tầng S4, S5 của bộ vàng), bộ vàng 470 mục, mồi rò rỉ, tiêm lệnh, G1–G10 — lộ trình mục 2 đã bỏ.
- Vector, `pg_trgm`, xếp hạng lại, Citations API của nhà cung cấp.
- Tab Agent của khung bản ghi hỏi kho.

## Notes

- T3 (bảng `TaiLieuHoi`, `TaiLieuBaoSai`, enum mới): có Cổng 1.5. `migration` mang mốc lớn hơn mọi mốc trên `origin/onehub` — hôm nay lớn nhất là `20261009010000_okr_an_chu_ky` — kiểm lại ngay trước khi mở PR.
- Nền hạ tầng lúc mở vòng (`duong-nen.md`, `bb558531`): đỏ đúng một ca `kr-may` (`apps/api/test/okr-cap-nhat.spec.ts`) đã đỏ sẵn trên `onehub` theo giờ chạy, phiên khác đang sửa; không phải lỗi của vòng. Gộp `onehub` sau khi bản sửa lên.
- `xacMinhDen` trước lượt này không có đường ghi nào ngoài test: danh sách «Quá hạn xác minh» của lượt 3 luôn rỗng ở production. AC-6 mở đường ghi.
- Tìm của lượt 3 (`TaiLieuTimService.tim`) chuyển xuống `packages/db` để API và agent dùng một hàm; `apps/api/test/tai-lieu-tim.spec.ts` giữ nguyên làm phép đo không-hồi-quy.
- Thủ tục mới dưới `taiLieu` ở phạm vi chung: `apps/api/test/vai-chi-okr.spec.ts` lọc theo alias nên vai `okr` tự vào danh sách được gọi; `taiLieu.hoi`, `taiLieu.hoiKetQua`, `taiLieu.baoSai` chặn vai `okr` trong service theo AC-7. Mutation mới đều có đầu vào (`SO_MUTATION_KHONG_DAU_VAO` giữ 13).
- Luật «không lưu chữ tin nhắn» của Zalo (`docs/agent.md`) đổi đúng một ngoại lệ do chủ kho chốt 2026-10-01: câu Zalo bị trợ lý kho từ chối được lưu ở `TaiLieuHoi.cauHoi`.
- Luật `docs/agent.md` «Khi nào thêm mã, tool, skill, subagent» áp: kiểm trích và số là mã (1), `tro_ly_kho` là `subagent` vì ranh giới tiền và nơi gửi khác (2), quyền nằm trong từng tool (4), khuôn không đệ quy (6), hỏng hiện là hỏng (7), sổ chi phí riêng (8).
- Ngưỡng Cổng Đáng của lượt ở `opportunity.md`; ngưỡng cả sản phẩm ở lộ trình mục 5.
- Bộ câu đo (chủ kho chọn ở Cổng Phạm vi 2026-10-01): vòng chấm lượt này dùng bộ «tạm» máy soạn từ trang mẫu của kho đo, nằm trong git ở `_acceptance/tro-ly-doc-kho/bo-do/`, chỉ đo cơ chế trích dẫn, câu từ chối và việc chuyển câu ở Zalo — không phải câu thật, không gọi là câu thật. 50 câu thật chủ kho gom theo `kho-tai-lieu-bo-vang.md`, giữ ở tệp ngoài kho trên máy chủ kho; chủ kho tự chạy `cham-bo-do.ts --bo <tệp>` lần đầu trong tuần đầu chạy thật, khi đã có trang thật — phiên máy không đọc đáp án. Kết quả bộ thật không chặn lượt này; nó vào phiên nghiệm thu.

- **Known limits (chủ kho ghi ở Cổng Bằng chứng 2026-10-02):**
  - Ngoài-2 — Người dùng chọn giao diện tiếng Anh vẫn thấy câu từ chối, câu báo lỗi và cảnh báo trang quá hạn bằng tiếng Việt, xen giữa các nhãn tiếng Anh. Nội dung vẫn đúng, chỉ lệch ngôn ngữ.
  - Ngoài-5 — Khi trợ lý không gửi được câu hỏi đi, nhân viên chỉ thấy câu chung chung là chưa trả lời được lúc này. Người vận hành không có dấu vết nào cho biết vì sao, nên khó tìm nguyên nhân khi lỗi lặp lại.
  - Ngoài-6 — Nếu việc đóng câu hỏi hoặc ghi chi phí hỏng, nhật ký chỉ ghi tên lỗi chung chung nên khó biết lý do. Câu hỏi sẽ tự đóng là quá hạn sau ba phút, và chi phí có thể bị đếm thiếu mà không ai hay.
  - Ngoài-7 — Nếu câu hỏi phải chờ hàng đợi một lúc, trợ lý còn ít hơn ba phút để trả lời. Hiếm khi một câu trả lời đúng đã soạn xong vẫn bị bỏ vì đã quá hạn, người hỏi nhận câu chưa trả lời được lúc này.
  - Ngoài-8 — Phép kiểm cho danh sách trang gần nhất chỉ xác nhận có mặt trang đúng, không xác nhận đúng thứ tự tìm được. Nếu sau này thứ tự trang gợi ý bị đảo, phép kiểm vẫn báo xanh.
  - Ngoài-9 — Phép kiểm khẳng định trợ lý kho không trả nội dung trang về cho trợ lý chính thực ra không thể báo đỏ, vì dữ liệu vào của nó không bao giờ chứa nội dung đó. Việc không rò chữ trang hiện chỉ được bảo đảm một phần.
  - Ngoài-10 — Phép kiểm chỉ xác nhận hàng nhật ký câu hỏi Zalo có được tạo, chứ không xác nhận nó được tạo trước khi trợ lý bắt đầu đọc kho. Nếu thứ tự bị đổi, câu hỏi Zalo có thể không được ghi đúng lúc mà phép kiểm không báo.
  - Ngoài-11 — Phép kiểm màn Hỏi không phân biệt được phần ý trả lời với phần đoạn trích vì dữ liệu giả cho hai phần giống hệt nhau. Nếu màn bỏ mất dòng ý trả lời, phép kiểm vẫn qua.
  - Ngoài-12 — Phép thử chứng minh script chấm bộ câu đo biết báo lỗi luôn báo lỗi với bất kỳ bộ ba câu nào, kể cả khi dữ liệu đúng. Nó không chứng minh được script thật sự phát hiện sai trang.
  - Ngoài-14 — Lời hứa nhật ký không chứa chữ câu hỏi chỉ được thử thật trên một trong mười câu mẫu. Chưa thấy câu hỏi nào lọt vào nhật ký, nhưng phần lớn các đường khác chưa được kiểm.
