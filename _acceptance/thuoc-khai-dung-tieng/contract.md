---
schema_version: 1
feature: Thước của hồ sơ khai đúng tiếng — bộ đo thôi nói dối được, và chạy ở lệnh cổng
slug: thuoc-khai-dung-tieng
owner: manh@mstar.vn
risk_tier: T2
surfaces: [tooling]
status: verified
approved_by: Phan Le Manh
approved_at: 2026-09-19
design_doc: docs/superpowers/specs/2026-09-19-thuoc-khai-dung-tieng-design.md
---

# Acceptance Contract: thuoc-khai-dung-tieng

## Context

Hồ sơ `ho-so-khai-dung-tieng` chạm trần nhát sửa thước (5 nhát ở `implemented`,
trần 3). Cả năm nhát chỉ chạm bộ đo; sản phẩm không đổi một dòng. Người ký chọn
lối 3 ngày 2026-09-19: mở vòng có chủ ngữ là thước.

Sản phẩm của vòng này **LÀ bộ đo**: `_acceptance/ho-so-khai-dung-tieng/evals.yaml`
cùng bốn script trong `rang/`, và bài kiểm `packages/ui/test/khai-tieng.spec.tsx`.

Mười ba cách bộ đo đã nói dối nằm ở design doc, mỗi cách có đường dẫn và số đo.
Bảy đã vá ở hai vòng chấm trước; sáu còn mở là phạm vi vòng này.

Source input: `_acceptance/ho-so-khai-dung-tieng/review-findings.md` (hai vòng) ·
phép kiểm tĩnh 19/09 về chuỗi ghim · `docs/superpowers/specs/2026-09-19-thuoc-khai-dung-tieng-design.md`

## Criteria

- AC-1: Given bộ khai sinh (`pha-thu.mjs`) và mọi chuỗi ghim nó khai, When nó chạy chân đo trên vật LÀNH trước khi phá, Then mỗi chuỗi ghim phải VẮNG ở lượt lành; chuỗi nào có mặt ở lượt lành là chuỗi KHÔNG phân biệt được và bộ khai sinh phải đỏ, gọi tên đúng chuỗi đó. Phép đo in ra bảng từng chuỗi ghim kèm "vắng ở lượt lành: có/không".
- AC-2: Given bộ khai sinh sau vòng này, When nó chạy trọn bộ, Then với MỖI đột biến nó khẳng định ba điều chứ không hai: chân đo thoát khác 0 · thông điệp CHỨA chuỗi ghim · và chuỗi ghim đó đã được chứng là vắng ở lượt lành (AC-1). Thiếu điều thứ ba thì đột biến tính là KHÔNG ĐẠT.
- AC-3: Given thước cấu trúc `mot-duong.mjs`, When một người chạy `bun run test` hoặc đẩy nhánh, Then thước đó CHẠY và chặn được: nó khai trong `.githooks/gate-shape.json` và được bộ chạy gọi trong `@crm/ui#test`. Phép đo chứng bằng cách thêm một chỗ khai tiếng thứ mười vào `apps/app` rồi khẳng định `bun run test` ĐỎ và gọi tên chỗ đó.
- AC-4: Given cơ chế khai thước ở `gate-shape.json` nay đỡ NHIỀU hồ sơ, When bộ chạy đọc bản khai, Then ba thước của hồ sơ `nen-chat-ai-elements` vẫn chạy và vẫn xanh, và mọi `.mjs` trong thư mục `rang/` của CẢ HAI hồ sơ đều có định đoạt (trong cổng hoặc ngoài cổng có lý do). Bỏ khai một tệp là bài kiểm đỏ, gọi tên tệp.
- AC-5: Given mọi kịch bản của bộ đo, When chúng chạy và ném lỗi ở bất kỳ bước nào, Then không bản ghi THẬT nào trong cơ sở dữ liệu còn bị đổi sau lượt chạy; phép đo ép một ngoại lệ thật ở giữa rồi đối chiếu trạng thái trước/sau của các bản ghi bị mượn, và gọi tên từng bản ghi nó đã kiểm.
- AC-6: Given `dungCaySao()` nhận đường dẫn bản sao từ biến môi trường, When biến đó trỏ tới một chỗ KHÔNG phải worktree do chính script tạo, Then script từ chối xoá và thoát có tên, thay vì chạy `rmSync` đệ quy. Phép đo thử ba đường: đường hợp lệ · đường trỏ vào gốc kho · đường trỏ vào một thư mục thường.
- AC-7: Given `evals.yaml` của hồ sơ `ho-so-khai-dung-tieng`, When đối chiếu nó với mã thật và với hợp đồng đã tu chính, Then không ô nào mô tả một API đã bị bỏ, và MỌI khoá mà eval hội đồng bảo chấm đều có chân đo ghi ra khoá đó; phép đo gọi tên từng khoá nó đã đối chiếu, không trả một con số.
- AC-8: Given bài kiểm của `MetaLine`, When `bun run check-types` chạy, Then nó SOI bài kiểm đó; và không tệp nào trong `packages/` nhập mã của `apps/` bằng đường dẫn tương đối. Phép đo chứng chiều đỏ bằng cách đổi kiểu `MetaPart` rồi khẳng định `check-types` đỏ.
- AC-9: Given hồ sơ `ho-so-khai-dung-tieng` sau mọi thay đổi của vòng này, When bộ đo của nó chạy lại trọn vẹn, Then mọi chân vẫn xanh và bằng chứng vẫn 0 lệch — thước đổi mà lời hứa về `lang="en"` không đổi. Và không tệp sản phẩm nào của hồ sơ đó nằm trong diff của vòng này.
- AC-10: Given bộ đo sau vòng này, When một người đọc nó cùng bảng mười ba cách nói dối, Then họ nêu được với từng cách: phép đo nào bắt được nó, và bắt bằng cách nào. Cách nào không có phép đo nào bắt thì phải có tên trong Known limits chứ không im lặng. (judgment)

- AC-11: Given MƯỜI chân đo mới của chính vòng này, When bộ khai sinh chạy, Then nó phủ cả mười: danh sách đột biến đọc TỪ `_acceptance/thuoc-khai-dung-tieng/evals.yaml` (số đột biến = số mệnh đề "Cặp hai chiều" đếm được trong tệp, KHÔNG gõ lại một danh sách thứ hai), và mỗi chuỗi ghim của chân mới phải qua đúng phép kiểm vắng-ở-lượt-lành của AC-1. Thước của thước không được miễn luật của thước.
- AC-12: Given hồ sơ `nen-chat-ai-elements` đã `signed-off` và `.githooks/gate-shape.json` nằm trong `paths` eval của nó, When vòng này sửa tệp đó, Then sau vòng này `verified_commit` của hồ sơ ấy trỏ tới một commit mà băm của MỌI tệp trong `paths` eval của nó khớp cây đang xét; phép đo gọi tên từng tệp kèm băm trước/sau, không trả một con số.
- AC-13: Given bảy cách nói dối đã vá ở hai vòng trước (A, C, D, E, F, G và chốt ghim cũ), When bộ đo chạy, Then mỗi cách có một đột biến khôi phục đúng bệnh cũ và bộ đo phải ĐỎ, gọi tên bệnh. Cách nào không dựng được đột biến phải có tên trong mục `## Known limits` của hợp đồng này — không im lặng, và không tính là đã phủ.

## Known limits



- sáu-bệnh-chỉ-đo-bằng-dấu-hiệu — AC-13 hứa một QUAN HỆ: khôi phục bệnh rồi đòi
  bộ đo đỏ. Sau vòng chấm 3, chỉ bệnh **E** được đo bằng quan hệ thật (khôi phục
  bệnh trong bản sao rồi khẳng định `mot-duong.mjs` thôi bắt được). Sáu bệnh còn
  lại — **A, C, D, F, G, chốt-ghim-cũ** — chỉ được đo bằng «dấu hiệu cấu trúc còn
  trong tệp», tức một khẳng định đại diện. `bay-benh-cu.mjs` in ra lý do từng cái
  ở mục `KHAI_GIOI_HAN`. **Bốn** trong sáu — A, F, G, chốt-ghim-cũ — là giới hạn
  **chi phí**: chỗ bắt cần một lượt `pha-thu` hoặc một lượt trình duyệt, vài phút
  mỗi cái, vượt trần 600 giây của công cụ chấm nếu nhét vào chân này. **D** không
  phải chi phí mà là **thiếu vật thử**: chỗ bắt cần một fixture có enrichment RỖNG
  mà khối Giới thiệu VẪN vẽ, và tập dữ liệu thử chưa có cái thứ hai ấy — đây là
  chỗ rẻ nhất để thu hẹp mục này, không cần thêm giây nào. (Sửa 20/09 sau khi
  phiên chấm đối chiếu đầu ra `bay-benh-cu` với dòng này; bản trước ghi «năm
  trong sáu là chi phí», sai.) Riêng **C** là giới hạn **thật**: không
  phép đo nào trong kho phân biệt được «so DOM với giá trị về từ máy chủ» và «so
  DOM với một hằng gõ sẵn» — cả hai đều so DOM với một chuỗi, khác nhau ở chỗ
  chuỗi ấy đến từ đâu.
- trần thước — trần nhát sửa thước (thuoc-co-cua AC-12) được miễn cho vòng này
  theo quyết định của người ký 19/09. Tiền đề của trần là «vá thước nghĩa là đang
  trôi khỏi sản phẩm»; với một vòng mà sản phẩm CHÍNH LÀ thước, tiền đề đó không
  đúng, nên mọi vá hợp lệ đều bị đếm là trôi. Sáu nhát bị đếm đều truy được về một
  phát hiện trong hợp đồng của S4 vòng 1, có tên AC. Cái mất: vòng này không còn
  chuông báo trôi thước, nên nếu máy thật sự trôi thì phải do người đọc diff bắt.
- E1-và-E10-tựa-thước-hồ-sơ-đã-đóng — hai ô này chạy lại
  `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs` **nguyên trạng**
  (đó là điều E10 hứa: chạy lại thước cũ, không sửa một dòng). Thước ấy mở trang
  bằng `waitUntil: "networkidle0"`, mà máy chủ `next dev` giữ kết nối HMR nên mạng
  không bao giờ «im» — `page.goto` treo tới 120 giây rồi ném.
  **Hai ô hỏng KHÁC NHAU, đừng gộp** (sửa 20/09 sau khi phiên chấm đối chiếu; bản
  trước gọi cả hai là «chập chờn», sai với E10): **E1 chập chờn thật** — xanh ở
  lượt song song, đỏ mã 2 ở lượt tuần tự. **E10 đỏ 2/2 lượt**, cùng một chân con
  `hoi-quy-nam-cho`, cùng thông điệp — cố định, không phải may rủi; 8/9 chân con
  còn lại xanh cả hai lượt. Đường gọi đúng tên: E10 → `ho-so-cu-van-xanh.mjs` →
  `hoi-quy-nam-cho.mjs` → `nhan-.../khai-tieng.mjs`. Chuỗi `networkidle0` là chẩn
  đoán đọc TỪ MÃ NGUỒN (`khai-tieng.mjs:146`), không phải từ bản ghi — bản ghi chỉ
  cho thấy triệu chứng `Navigation timeout of 120000 ms exceeded` tại đúng dòng ấy.
  Cùng lớp lỗi này đã vá ở `ho-so-khai-dung-tieng` cùng ngày
  (đổi sang `load` + chờ đúng bộ chọn: 5/5 lượt xanh), nhưng hồ sơ
  `nhan-ung-dung-noi-tieng-viet` đã đóng theo quan sát 18/09 và chủ kho chốt không
  mở lại.
  Lối không-chạm đã thử và **hỏng**: dựng bàn đo bằng bản sản phẩm
  (`next build && next start`) thì hết HMR — ba tiền đề đạt (Origin A/B đúng, 0 dấu
  vết HMR, trang vẫn `lang=vi`) — nhưng `next start` **chụp ảnh `apps/app/public`
  lúc build**, mà `rang/canh-cay.mjs` chứng «đúng cây» bằng dấu mốc ghi lúc chạy;
  tệp thêm sau build trả 307 kể cả sau restart. Chứng hai chiều 20/09. `canh-cay.mjs`
  thuộc `man-cai-dat-noi-tieng-viet`, cũng `signed-off`, và không có biến môi trường
  nào để bỏ qua — nên lối ấy đòi mở lại hồ sơ đã đóng THỨ HAI.
  Cái mất, nói CHÍNH XÁC (sửa 20/09; bản trước viết «AC-1 và AC-9 không có lượt đo
  máy đáng tin», nói quá với AC-9):
  · **AC-1 mất trọn** — E1 dừng ở tiền đề, sinh 0 khẳng định, nên không có gì để đọc.
  · **AC-9 mất một phần** — vế (b) của E10, tức lời hứa trung tâm «thước đổi, sản
  phẩm không đổi», chạy TRỌN và xanh (diff 61 tệp, giao với 11 tệp sản phẩm: RỖNG);
  vế (a) đạt 8/9 chân con, chân thứ chín là chỗ đỏ nêu trên.
  Mọi ô khác của vòng xanh trong lượt tuần tự 20/09: 19/21 lệnh thoát 0, 0/24 phép
  phá lọt, 4 suite xanh, tổng 8326 giây khớp đúng cửa sổ 05:16:31→07:35:17 (tức
  lượt này thật sự tuần tự, không lệnh nào chồng lệnh nào).
- chiều-đỏ-của-nhánh-glob-chưa-chạy — bản vá `docDuong()` (commit `cc31d5bb`, phát
  hiện trong hợp đồng duy nhất của S4 vòng 1) đã chạy chiều LÀNH trong lượt tuần
  tự (E7 mã 0, 441 giây) nhưng chiều ĐỎ thì chưa. Chứng nó đòi ba lượt
  `ban-khai-khop`, mà chân ấy tự chạy lại sáu chân trình duyệt — ~10 phút mỗi lượt.
  Đã bắt đầu rồi dừng giữa chừng và gỡ đột biến. Cái mất: hai ca mới (`git ls-files`
  trả rỗng khi pathspec không khớp; `readFileSync` hỏng giữa danh sách glob) chỉ
  được kiểm bằng đọc mã, không bằng một lượt đỏ có thật.
Mục này có mặt để eval hội đồng (E11) có chỗ đối chiếu. Dòng nào ở đây là một
cách nói dối KHÔNG có phép đo máy nào bắt được, và người ký nhận nó tường minh.

- (chưa có mục nào — mọi dòng trong bảng mười ba đều phải có phép đo; nếu S3 phát hiện một dòng không dựng được đột biến thì tên nó vào đây kèm lý do, và AC-13 đọc mục này)

## Coverage

Quét bằng skill `morphological-scan`, preset risk/pre-mortem, câu khung đổi
thành **"màu xanh này nói dối kiểu gì?"**. Ba trục.

- Trục **thành phần bộ đo**: bản khai (`evals.yaml`) | chân đo (ba script + một bài kiểm) | bộ đỡ (vật thử + bộ khai sinh) | đường chạy (cắm vào cổng) [thước CE: `[SUY-TỪ-REPO: _acceptance/ho-so-khai-dung-tieng/rang/ · .githooks/gate-shape.json · packages/ui/test/rang-chat.spec.ts]` — năm tệp có thật, đọc được]
- Trục **cơ chế nói dối**: không đo tới | đo sai vật | đo sai quan hệ | chốt vô hiệu | không được gọi | gây hại khi chạy | bản khai lệch bản thật [thước CE: `[SUY-TỪ-REPO: _acceptance/ho-so-khai-dung-tieng/review-findings.md]` — 13 phát hiện của hai vòng chấm cộng một phép kiểm tĩnh 19/09; lịch sử lỗi nội bộ, thật, ba ngày tuổi. Cộng `[NGÀNH: mutation testing — Stryker/PIT]`, thực hành có tên với đúng tiền đề: một phép kiểm chưa từng đỏ thì không chứng minh gì]
- Trục **lúc nào lộ ra**: khi đọc mã | khi vòng chấm agent tươi soi | chỉ khi có người cố tình phá vật | chỉ khi sản phẩm hỏng ngoài đời | không bao giờ lộ bằng máy [thước CE: `[SUY-TỪ-REPO: _acceptance/ho-so-khai-dung-tieng/evidence-report.md hai vòng]` — có dữ liệu chặng nào bắt được từng phát hiện. Cả 13 đều rơi vào ba giá trị cuối; không cái nào lộ ra bằng một lượt chạy xanh]

Cross-cutting áp mọi ô Core:

- Mọi phép đo mới của vòng này cũng phải chịu chính luật AC-1: chuỗi ghim phải
  vắng ở lượt lành. Thước của thước không được miễn luật của thước.
- Thước không được để lại dấu vết trên vật nó đo, kể cả khi chết giữa chừng →
  AC-5, AC-6.
- Bản khai phải khớp bản thật → AC-7.

Ô cắt sang Later, có tên: đo độ trung thực thị giác · mở rộng cơ chế cổng cho hồ
sơ tương lai (chỉ hai hồ sơ, YAGNI) · đưa các thước trình duyệt vào lệnh cổng
(cần máy chủ và Chrome, không hợp một lệnh đẩy).

## Out of scope

- **Không đổi sản phẩm.** Không một dòng nào của `ForeignText`, `MetaLine`, bốn chỗ gọi trên tấm hồ sơ, hay năm chỗ đã chuyển. AC-9 đo chính điều đó.
- **Không đưa thước trình duyệt vào lệnh cổng.** Chúng cần máy chủ dev và Chrome; một lệnh đẩy không có cả hai. Chỉ thước đọc đĩa mới cắm vào cổng.
- **Không viết lại bộ kit nghiệm thu.** Lỗi của kit mở chip riêng sang `~/dev/acceptance-gate-kit` theo luật kho.
- **Không sửa 14 phát hiện ngoài hợp đồng của vòng trước mà vòng này không nhận.** Cái nào không nằm trong mười tiêu chí trên thì ở lại `review-findings.md` chờ Cổng Bằng chứng.
- **Không mở rộng cơ chế cổng thành khuôn tổng quát cho mọi hồ sơ tương lai.** Kho có hai hồ sơ cần nó; dựng khuôn cho cái thứ mười là dựng cho người chưa tồn tại.

## Notes

Hợp đồng viết TRƯỚC khi có mã.

**Vì sao AC-1 và AC-2 tách làm hai.** AC-1 là phép đo về chuỗi ghim: nó vắng ở
lượt lành không. AC-2 là phép đo về bộ khai sinh: nó CÓ DÙNG kết quả đó không.
Gộp làm một thì một bản cài đặt tính đúng rồi vứt đi vẫn qua được — đúng lớp lỗi
"đếm-rồi-vứt".

**Vì sao AC-3 đo bằng cách thêm một chỗ thứ mười.** Khẳng định "thước có khai
trong `gate-shape.json`" là đo bản khai, không đo hiệu lực. Chỉ khi thêm một vi
phạm thật rồi thấy `bun run test` đỏ mới chứng minh được cái cổng thật sự chặn.

**Vì sao AC-4 tồn tại.** Vòng này mở rộng một cơ chế đang phục vụ hồ sơ khác, và
hồ sơ đó đã `signed-off`. Ba thước của nó vẫn xanh là một tiêu chí, không phải
một hy vọng. Kèm theo: `.githooks/gate-shape.json` nằm trong `paths` eval của
`nen-chat-ai-elements`, nên vòng này **phải chạy nghi thức ghim-lại** cho hồ sơ
đó. Chi phí này người ký thấy trên thẻ Cổng Phạm vi trước khi duyệt.

**AC-8 kéo theo một lần tu chính hợp đồng khác.** `ho-so-khai-dung-tieng` AC-7
hứa "ba chiều trong CÙNG một bài kiểm"; tách đôi bài kiểm làm câu đó sai chữ.
Lời hứa thật — ba chiều đều được đo, và đo bởi một cổng kiểu thật sự soi chúng —
không đổi. Đó là lần tu chính thứ HAI của hồ sơ ấy; cả hai đều ghi `amended_at`.

**Vòng này không chạm UI.** Không có bề mặt nào người nhìn; sản phẩm là công cụ.
Vì thế không có đặc tả UX và không có nghi thức thiết kế — cả hai bỏ bằng entry
có tên trong sổ quyết định.

**Đã đọc trước khi viết:** `AGENTS.md` · `CLAUDE.md` · `.githooks/gate-shape.json` ·
`packages/ui/test/rang-chat.spec.ts` · `.githooks/pre-push` ·
`_acceptance/ho-so-khai-dung-tieng/review-findings.md` (hai vòng) ·
`_acceptance/nen-chat-ai-elements/contract.md` và `evals.yaml` · năm tệp của bộ đo.
