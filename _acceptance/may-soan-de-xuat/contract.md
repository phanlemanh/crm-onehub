---
schema_version: 1
feature: Máy soạn bản đề xuất — tải tệp quy định đang có (Word, PDF có chữ) lên kho tài liệu, máy soạn thành bản đề xuất có trích đoạn nguồn, chủ trang đọc nguồn cạnh nhau rồi duyệt
slug: may-soan-de-xuat
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: draft
design_doc: docs/superpowers/specs/2026-09-28-may-soan-de-xuat-design.md
approved_by:
approved_at:
---

# Acceptance Contract: may-soan-de-xuat

## Context

Lượt 2 của `docs/plan/lo-trinh-kho-tai-lieu.md`: nhân viên tải tệp quy định đang có (Word
`.docx`, PDF có lớp chữ) lên kho tài liệu, `apps/agent` đọc chữ và soạn thành một bản đề
xuất có trích đoạn nguồn cho từng con số, chủ trang đọc nguồn cạnh bản máy soạn rồi duyệt
bằng đúng luồng duyệt của lượt 1. Nguồn là tệp bất biến có hash, lưu ở Vercel Blob private;
máy soạn chạy bằng khoá AI Gateway thứ hai khi có. Lượt này nạp nội dung cho chạy thật mọi
phòng ban (lộ trình mục 5).

Source input: `docs/plan/lo-trinh-kho-tai-lieu.md` mục 4 «Lượt 2» và sổ dòng 5; bàn giao
`docs/plan/kho-tai-lieu-ban-giao.md` mục 3–4; nghiên cứu `docs/plan/kho-tai-lieu-nghien-cuu.md`
mục 4.1, 6.1–6.8, 8.4, 9.1, 9.4; `docs/agent.md` mục «Khi nào thêm mã, tool, skill,
subagent»; bản mẫu `/proto/kho-tai-lieu`; hợp đồng lượt 1 `_acceptance/kho-tai-lieu/contract.md`.

## Criteria

- AC-1: Given cơ sở dữ liệu có dữ liệu của lượt 1, When chạy `migration` của lượt này, Then mọi câu lệnh chỉ tạo bảng `TaiLieuNguon`, thêm cột rỗng được vào `TaiLieuDeXuat`, tạo chỉ mục và khoá ngoại mới — không lệnh nào sửa kiểu, đổi tên, xoá cột hay xoá dòng; And áp được trên kho test mới tinh và trên bản sao có trang, phiên bản, đề xuất của lượt 1 mà số dòng mọi bảng cũ giữ nguyên.
- AC-2: Given một thành viên bất kỳ (kể cả vai `okr`) và Blob đã bật, When tải lên một tệp `.docx` hay `.pdf` ≤ 20 MB với đích «trang mới» (tên, loại, chủ trang, đơn vị tuỳ chọn) hoặc «cập nhật» một trang đang dùng, Then đúng một `TaiLieuNguon` được ghi với `sha256` do máy chủ tính từ byte đã lưu trên Blob (khớp `sha256` của tệp gốc), tên tệp, cỡ, người tải, trang đích; And blob là `private` và hàng không lưu URL công khai nào; And đúng một `AgentTask` loại `soan-tu-nguon` được ghi trong cùng lần ghi; And đích trang mới tạo trang chưa có bản đang dùng như lượt 1. (cross-layer)
- AC-3: Given hộp tải, When tệp sai loại (đuôi hợp lệ nhưng byte không phải PDF hay docx, `.doc`, ảnh), rỗng, hoặc > 20 MB, hoặc đích là trang chưa có bản đang dùng, Then bị từ chối với câu lỗi dưới ô chọn tệp; And không `TaiLieuNguon`, không `AgentTask`, không trang nào được ghi; And blob đã PUT lên trong lượt bị từ chối bị xoá. (cross-layer)
- AC-4: Given một nguồn đã có, When tải lên đúng những byte đó lần nữa (tên tệp khác cũng vậy), Then trả về nguồn cũ với thông báo «Nguồn này đã có», không ghi hàng hay việc mới, blob mới bị xoá; And tải một tệp khác byte cho cùng trang thì ra một nguồn mới và một việc soạn mới; And không thủ tục nào sửa hay xoá được tên tệp, `sha256`, `blobPathname`, người tải của một nguồn.
- AC-5: Given `BLOB_READ_WRITE_TOKEN` không đặt, When mở kho tài liệu và gọi các thủ tục nạp nguồn, Then nút «Tải nguồn lên» khoá với câu «Chưa bật lưu tệp nguồn — nhờ quản trị cấu hình»; And `xinCho`, `nhan`, `taiVe` trả `PRECONDITION_FAILED` với thông điệp ghim, không 500; And API, app và agent khởi động không lỗi, mọi thủ tục của lượt 1 chạy như cũ. (cross-layer)
- AC-6: Given ma trận tệp mẫu viết trước lưu trong hồ sơ — docx có tiêu đề, danh sách, bảng và số liệu; PDF có lớp chữ nhiều trang; PDF chỉ có ảnh (bản quét); PDF lớp chữ hỏng (`(cid:`, U+FFFD); docx hỏng; PDF có mật khẩu — When `apps/agent` xử lý việc `soan-tu-nguon`, Then docx và PDF có chữ cho chữ đã đọc chuẩn NFC chứa đúng các chuỗi mốc viết trước; And bản quét và PDF lớp chữ hỏng thành «cần gõ tay», không mở phiên máy soạn, không đề xuất nào; And docx hỏng và PDF mật khẩu thành «Chưa soạn được» với lý do nêu tên lỗi; And hash byte tải về lệch `sha256` của hàng thì dừng với lý do, không soạn.
- AC-7: Given một nguồn đã đọc chữ và trang «Quy tắc viết» (slug `quy-tac-viet`) có bản đang dùng, When máy soạn nộp một bản hợp lệ, Then đúng một `TaiLieuDeXuat` «chờ duyệt» được ghi qua hàm tạo đề xuất dùng chung với API, có `taoBoiId` là người tải, `nguonId`, `trichDoan` parse được bằng khuôn Zod, nội dung NFC đã qua bộ tuần tự hoá của lượt 1; And đích trang có sẵn thì bản gốc là bản đang dùng lúc soạn; And lời dặn gửi cho model chứa nội dung bản đang dùng của trang «Quy tắc viết»; And bản đang dùng của trang đích không đổi. (cross-layer)
- AC-8: Given ma trận mọi đường ghi của máy soạn, When quét mã `apps/agent` và chạy một lượt soạn đạt, Then không đường nào của máy soạn ghi `TaiLieuPhienBan` hay `TaiLieuTrang.banDangDungId` hay gọi thủ tục duyệt; And một bản máy soạn chỉ thành bản đang dùng qua `taiLieu.approve` của người duyệt được (chủ trang, `owner`, `admin`) với `diffHash` khớp, như lượt 1; And người tải không phải chủ trang, thành viên khác và vai `okr` nhận `FORBIDDEN` khi duyệt nó. (cross-layer)
- AC-9: Given ma trận kịch bản viết trước cho `nop_ban_de_xuat` — đạt; một số mới không nằm trong trích đoạn nào; trích đoạn không có trong chữ nguồn; trích đoạn khác nguồn chỉ ở vị trí dấu thanh (`hoà`/`hóa`), NBSP hay kiểu nháy; ngày và phần trăm kiểu Việt (`01/10/2026`, `1,5%`); số đã có trong bản gốc không trích; số thứ tự danh sách — When công cụ kiểm, Then kịch bản đạt, lệch dấu thanh, số cũ và số thứ tự danh sách được nhận; And con số so khớp trọn vẹn có biên, không so chuỗi con — «20%» không được nhận nhờ «2026», «2%» không nhờ «12%», «1,5» không nhờ «11,5»; And số mới thiếu trích và trích không có trong nguồn bị bác với thông điệp nêu đích danh số hay đoạn, không hàng nào được ghi.
- AC-10: Given một lượt soạn hỏng — model báo lỗi, hết thời gian, trả rỗng, sai khuôn, bị bác kiểm số tới hết trần bước, chữ nguồn quá trần độ dài, hoặc trang «Quy tắc viết» chưa có bản đang dùng — When việc kết thúc, Then không `TaiLieuDeXuat` nào được ghi (không có bản rỗng hay nửa vời); And nguồn mang trạng thái «Chưa soạn được» với lý do đọc được cho từng ca; And nút «Soạn lại» của người tải hay người duyệt ghi đúng một việc `soan-tu-nguon` mới, người khác không gọi được. (cross-layer)
- AC-11: Given một bản máy soạn chờ duyệt, When người duyệt mở màn duyệt, Then bước 1 «Nguồn nói gì» hiện chữ nguồn với các đoạn được trích tô nền và bảng «Con số và ngày» nối từng số mới với đoạn nguồn của nó, chưa có nút «Duyệt»; And sau «Đã đọc nguồn, xem bản máy soạn», nguồn và bản máy soạn nằm cạnh nhau ở 1440, hai thẻ ở 390; And mỗi dòng của bảng «Con số và ngày» có một ô tick «Đã đối chiếu», nút «Duyệt» khoá tới khi tick hết (bảng không có dòng nào thì không khoá), và máy chủ từ chối `approve` một bản máy soạn khi số dòng đã tick gửi lên ít hơn số con số mới nó tự tính lại; And không nút nào nhận focus sẵn hay tô là lựa chọn nên bấm; And «Duyệt», «Trả lại», «Sửa bản này» đi đúng luồng của lượt 1; And bản người duyệt sửa từ một bản máy soạn giữ `nguonId` và `trichDoan` của bản máy, nên phiên bản sinh ra từ nó vẫn truy được về nguồn. (cross-layer)
- AC-12: Given ma trận viết trước gồm sáu người (người tải, chủ trang đích, `owner`, `admin`, thành viên khác, vai `okr`) × ba trạng thái nguồn (chưa được bản đang dùng nào trích · được bản đang dùng trích · đề xuất của nó bị trả lại), When mỗi người gọi danh sách nguồn, `nguon.get`, `nguon.taiVe` và mở bản máy soạn, Then người tải và người duyệt được thấy và tải về ở mọi trạng thái; And nguồn được bản đang dùng trích thì mọi thành viên tải về được từ mục «Nguồn» của màn đọc trang; And mọi ca không được thấy trả `NOT_FOUND` giống id không tồn tại; And `taiVe` trả URL ký hết hạn ≤ 5 phút, tải về đúng byte có `sha256` của hàng; And trên Blob thật, trình duyệt PUT được tệp vào URL ký của `xinCho`, `nhan` băm đúng byte đó, GET bằng URL của `taiVe` ra đúng byte, và GET không ký vào blob bị từ chối. (cross-layer)
- AC-13: Given `KHO_TAI_LIEU_AI_GATEWAY_API_KEY` đặt hoặc không, When máy soạn chạy một lượt, Then khoá đặt thì model của `subagent` dựng bằng khoá đó, vắng thì bằng đường Gateway chung, không lỗi; And mỗi lượt ghi một sự kiện `MAY_SOAN` có mã model, nhãn khoá `rieng`/`chung`, token vào, token ra, chi phí USD tính từ bảng giá ghim theo mã model trong cấu hình của khu, số lần bị bác; And biến có mặt ở `.env.example`, `globalPassThroughEnv` của `turbo.json` và bảng năng lực của agent, không ở `env` của turbo.
- AC-14: Given `subagent` `may_soan`, When đọc khai báo của nó, Then tập `tool` đúng bằng `{ nop_ban_de_xuat }`, mọi `tool` dựng sẵn tắt, sandbox `deny-all`, không `web_fetch` hay `web_search`; And mã model là hằng trong cấu hình của khu, không đọc `AppSetting`; And khuôn đầu vào của `nop_ban_de_xuat` chuyển được sang JSON Schema không có `$ref` vòng; And chữ nguồn tới model nằm trong khối dữ liệu có dấu phân cách, tách khỏi lời dặn.
- AC-15: Given ba tệp mẫu thật trong hồ sơ (một quyết định về hoa hồng `.docx`, một quy trình PDF có chữ, một biểu mẫu `.docx`) và trang «Quy tắc viết» của chủ kho, When máy soạn chạy một lượt thật với model đã chọn và đầu ra được lưu vào hồ sơ, Then mỗi bản máy soạn giữ một chủ đề, chép số liệu chính xác, nêu đối tượng áp dụng và giới hạn như nguồn nói, không thêm quy định nào nguồn không có, và theo lời dặn của trang «Quy tắc viết». (judgment)
- AC-16: Given một nguồn đã lưu và một thành viên bất kỳ (kể cả vai `okr`, kể cả người đã tải về được nguồn đó nên biết đường lưu của nó), When gọi thủ tục nhận nguồn với một đường lưu đã thuộc về một nguồn có sẵn, hoặc một đường lưu không phải do lần xin chỗ của chính người đó cấp (của người khác, hay chưa từng cấp), Then thủ tục từ chối trước khi đọc hay xoá bất cứ tệp nào; And tệp của nguồn có sẵn còn nguyên — tải về đúng byte có mã băm của hàng, và máy soạn vẫn đọc được tệp đó; And khi một lần nhận hợp lệ của chính người gọi bị từ chối vì lý do khác (sai loại, đích sai, trùng byte), máy chỉ xoá tệp vừa tải trong chính lượt đó. (cross-layer)

## Coverage

Quét bằng `morphological-scan` preset entity-feature, phiên 2026-09-28. Chân sản phẩm:
`docs/plan/lo-trinh-kho-tai-lieu.md`, `CONTEXT.md`, hợp đồng lượt 1. Chân ngành: Document360
Knowledge Base Generator, HelpSite (tải PDF/Word → bài máy soạn ở hàng nháp, người biên tập
duyệt rồi mới đăng; tra 2026-09-28), nghiên cứu mục 6.

- Trục A — tệp vào: docx lành · PDF có chữ · PDF quét · PDF lớp chữ hỏng · tệp hỏng hay có mật khẩu · sai loại, rỗng, quá cỡ · trùng byte · bản mới của nguồn cũ (AC-2, AC-3, AC-4, AC-6). [thước CE: nghiên cứu mục 6.6 bảng «Nạp theo định dạng»; `.doc`, `.xlsx`, ảnh, TCVN3 cắt ra Later]
- Trục B — kết cục máy soạn: đạt · cần gõ tay · model lỗi · hết giờ · rỗng · sai khuôn · trượt kiểm số · quá dài · thiếu Quy tắc viết · hash lệch (AC-6, AC-7, AC-9, AC-10). [thước CE: nghiên cứu mục 6.2 «Thất bại phải to tiếng» và 6.3]
- Trục C — người: người tải · chủ trang đích · `owner` · `admin` · thành viên khác · vai `okr` (AC-8, AC-10, AC-12, AC-16). [thước CE: `packages/validation/src/vai-workspace.ts`, ma trận AC-3 và AC-5 của lượt 1]
- Trục D — cấu hình: Blob bật/tắt · khoá AI thứ hai có/không · trang Quy tắc viết có/không (AC-5, AC-10, AC-13). [thước CE: `docs/environment.md` «Optional: what the agent can do»; `AGENTS.md` «must never throw»]
- Cross-cutting — ranh giới máy soạn và đường ghi: không mạng, một `tool`, không đường tới bản đang dùng (AC-8, AC-14); màn duyệt đưa thông tin không đưa khuyến nghị (AC-11). [thước CE: `docs/agent.md` luật 1–8; nghiên cứu mục 8.4, 9.1]
- [GIẢ ĐỊNH] Ngưỡng «cần gõ tay» (tỉ lệ ký tự hỏng, số ký tự tối thiểu mỗi trang) đặt từ nghiên cứu mục 6.6 và bộ tệp mẫu, chưa thử trên tệp thật của OneHub; chạy thật đếm tỉ lệ cờ để chỉnh.
- [GIẢ ĐỊNH] Một tệp soạn thành đúng một trang. Tệp gộp nhiều quy định thì người tải chia hoặc chủ trang sửa; máy chia một tệp thành nhiều trang là Later.
- [GIẢ ĐỊNH] Model cho máy soạn là model mặc định hiện nay của agent (`zai/glm-5.2-fast`), ghim làm hằng; AC-15 là chỗ kiểm nó có đủ cho văn bản quy định tiếng Việt không.

## Đường đo

- Thước: tỉ lệ bản máy soạn được duyệt · số từ: `TaiLieuDeXuat` có `nguonId`, `trangThai` · bảo đảm bởi: AC-7, AC-8
- Thước: tỉ lệ trang đã duyệt đi từ một nguồn · số từ: `TaiLieuPhienBan` → `TaiLieuDeXuat.nguonId` · bảo đảm bởi: AC-7, AC-12
- Thước: bản máy soạn thành bản đang dùng không qua duyệt · số từ: phép quét đường ghi và sự kiện duyệt của lượt 1 · bảo đảm bởi: AC-8
- Thước: số sai lọt duyệt · số từ: kiểm số bằng mã trước khi ghi (chặn trước); số sai được báo lại trong chạy thật đếm TAY từ nhóm góp ý của chạy thật (lộ trình mục 5), người đếm: chủ kho — nút «báo sai» có bảng là lượt 4 · bảo đảm bởi: AC-9
- Thước: chi phí trung bình mỗi nguồn · số từ: sự kiện `MAY_SOAN` (trường chi phí USD từ bảng giá ghim) · bảo đảm bởi: AC-13
- Thước: tỉ lệ nguồn «cần gõ tay» · số từ: `TaiLieuNguon.trangThai` · bảo đảm bởi: AC-6

## Out of scope

- OCR bản quét — nguồn «cần gõ tay» dừng ở cờ; chọn máy đọc cần thử 30–50 tệp thật trước.
- Thẻ mâu thuẫn giữa trang, sổ khẳng định đầy đủ, kiểm độ phủ nguồn — lượt để sau `bao-tri-trang-luat`.
- Phân lớp dữ liệu (công khai, nội bộ, dữ liệu cá nhân, nhạy cảm) và ô che dữ liệu cá nhân — để sau, chưa gắn lượt.
- Máy tự tìm trang liên quan cho một nguồn, hay chia một tệp thành nhiều trang — người tải chọn một đích.
- Vá theo mục, khoá phần người viết — bản máy soạn là cả trang so với bản gốc, đọc bằng diff của lượt 1.
- `.doc`, `.xlsx`, ảnh, chuyển mã TCVN3/VNI.
- Xoá nguồn, bia mộ, cờ giữ pháp lý.
- Bậc 2, phó chủ trang, giảm tốc nạp theo hàng đợi duyệt.
- Hoàn thiện trang «Quy tắc viết» — chủ kho sửa dần khi vận hành; lượt này chỉ có bản v0 máy soạn từ ba văn bản mẫu (xem Notes).

## Notes

- **Tiền đề của S3 — trang «Quy tắc viết».** Chủ kho chọn cách C ngày 2026-09-28: máy soạn bản v0 từ ba văn bản mẫu thật (`mau/quy-tac-viet.md`), chủ kho nhận làm quy tắc của mình và sửa dần khi vận hành. Trang ở
  slug `quy-tac-viet`, đã duyệt (có bản đang dùng) trên kho dùng để đo, nội dung theo bàn
  giao mục 3: một chủ đề mỗi trang, số liệu chính xác, nêu đối tượng và giới hạn. Máy soạn
  đọc nó làm lời dặn. Thiếu nó thì AC-7 và AC-15 không đo được; S3 các task còn lại chạy được.
- **Tiền đề của S2 — lượt 1 đã lên `onehub`** (lộ trình mục 2–3). Nhánh
  `feat/may-soan-de-xuat` cắt từ `origin/proto/kho-tai-lieu` (`5e3e35b9`) vì PR #180 chưa
  merge lúc mở S1. Đã đạt 2026-09-28: #180 merge (`c1e37b73`), `onehub` đã kéo vào nhánh.
- Từ điển: mục **Nguồn** ở `CONTEXT.md` từng ghi «mỗi nguồn mang một lớp dữ liệu»; chủ kho
  chốt 2026-09-28 sửa thành «sẽ mang… (để sau)» vì lượt này không lưu lớp dữ liệu.
- Tick từng con số trước khi duyệt: chủ kho chọn 2026-09-28 (lựa chọn B của hình `man-duyet`),
  thêm vào AC-11; mở lại Cổng Phạm vi để duyệt lại.
- Luật `docs/agent.md` mục «Khi nào thêm mã, tool, skill, subagent» áp đủ: kiểm số là mã
  (luật 1), máy soạn là `subagent` riêng vì ranh giới đọc, tiền và nơi gửi khác agent gốc
  (luật 2), quyền nằm ở `nop_ban_de_xuat` (luật 4), khuôn không đệ quy (luật 6), việc hỏng
  hiện là hỏng (luật 7), sổ chi phí riêng (luật 8).
- Router nguồn nằm dưới `taiLieu` ở phạm vi chung như lượt 1: danh sách thủ tục ghim của
  `apps/api/test/vai-chi-okr.spec.ts` sửa có ý thức.
- Chạm `packages/db/prisma` → T3, có Cổng 1.5.
- **Known limits (chủ kho ghi ở Cổng Bằng chứng 2026-09-28):**
  - Mù-1 — phép thử kho lưu tệp thật (E2t, AC-12) chưa chạy: máy chưa có kho Blob private; tính năng ship với nút «Tải nguồn lên» khoá cho tới khi có khoá, mở lại E2t khi bàn đo có kho thật.
  - Ngoài-2 — danh sách nguồn tự làm mới đúng hôm nay; nếu sau này đổi cách làm mới dữ liệu ở nơi khác mà quên chỗ này, người dùng có thể thấy danh sách cũ tới khi tải lại trang.
  - Ngoài-3 — vài con số và câu thông báo của máy soạn chưa gom về tệp cấu hình của khu; không ảnh hưởng người dùng.
  - Ngoài-4 — danh sách loại tệp nhận (Word, PDF) khai ở hai nơi; lệch nhau thì người tải chỉ thấy lỗi chung.
  - Ngoài-7 — máy soạn không mở được phiên thì chỉ có thông báo chung, đội vận hành khó truy nguyên nhân.
  - Ngoài-8 — lượt soạn hợp lệ có thể bị đánh «hết giờ» sớm hơn một chút so với trần thời gian thật.
  - Ngoài-9 — phép kiểm «1,5 không khớp 11,5» chưa chứng được sẽ bắt lỗi khi lỗi xảy ra.
  - Ngoài-10 — việc hai đường tạo đề xuất (người viết và máy soạn) cùng một cách ghi mới được chứng ở phía máy soạn.
  - Ngoài-11 — chưa có phép kiểm chắc rằng tệp nguồn luôn lưu ở chế độ riêng tư.
  - Ngoài-12 — phép thử «tệp không đọc được khi không có chữ ký» chưa có chiều đỏ.
  - Ngoài-13 — phép kiểm «không nơi nào sửa tên tệp, mã băm, đường lưu, người tải» chỉ quét một cách viết mã.
  - Ngoài-14 — ca «PDF lớp chữ hỏng kiểu cid» dùng tệp tổng hợp chưa đúng dạng hỏng thật.
  - Ngoài-15 — phép kiểm «máy soạn không ra mạng» đếm chữ trong mã thay vì đọc cấu hình lúc chạy.
- **Mở lại Cổng Phạm vi 2026-09-28 (Cổng Bằng chứng, Ngoài-1 và Ngoài-6 «nâng phạm vi sửa ngay»):** vòng chấm tìm ra thủ tục nhận nguồn có thể xoá tệp của một nguồn đã có (người biết đường lưu gọi lại với đích sai hay tệp trùng). Merge vào `onehub` là lên production, nên chủ kho chọn sửa trong lượt này: thêm AC-16 và E16, duyệt lại Cổng Phạm vi rồi mới sửa mã.
