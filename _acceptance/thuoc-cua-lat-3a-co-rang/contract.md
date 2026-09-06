---
schema_version: 1
feature: Thước của lát ③a có răng — mỗi phép đo nghiệm thu của vòng ③a phải đỏ được, và chứng minh lại điều đó mỗi lượt chạy
slug: thuoc-cua-lat-3a-co-rang
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [script]
status: approved
approved_by: Manh Phan
approved_at: 2026-09-04
design_doc: docs/superpowers/specs/2026-09-04-thuoc-cua-lat-3a-co-rang-design.md
---

# Acceptance Contract: thuoc-cua-lat-3a-co-rang

## Context

S4 vòng 8 của `nhan-ung-dung-noi-tieng-viet` trả về 16 phát hiện đã xác nhận và
**không cái nào trong-hợp-đồng**. Chín cái nói về CÁI THƯỚC chứ không về sản
phẩm, và chúng tái xuất suốt vòng 5 → 8 vì hợp đồng của ③a nói về chữ trên màn:
scope-triage xếp mọi lỗi của giàn đo ra ngoài hợp đồng, vòng nào cũng vậy. Toàn
văn ở `_acceptance/nhan-ung-dung-noi-tieng-viet/review-findings.md`.

Vòng này là **thứ mở khoá Cổng 2 của ③a**, không phải đường vòng khỏi nó.

Chủ ngữ của hợp đồng này là **giàn đo**, không phải sản phẩm. Bảy file: sáu chân
trong `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/` và
`apps/app/test/messages-guard.spec.ts`.

Tám trong chín khiếm khuyết cùng một hình — **xanh được mà không đỏ được**. Cái
thứ chín, `rang/dot-bien.mjs`, khác họ: nó đỏ được, bệnh của nó là **bán kính
nổ**. Khác bệnh thì khác thuốc, nên nó có tiêu chí riêng.

Luật áp dụng: `references/measure-birth.md` của gói acceptance-gate (bốn mục
khai sinh) và bốn luật đo ở `_acceptance/handoff.md`.

Source input: prompt · `_acceptance/nhan-ung-dung-noi-tieng-viet/review-findings.md` · `_acceptance/nhan-ung-dung-noi-tieng-viet/decisions.jsonl`

## Criteria

- AC-1: Given enum giai đoạn thoả thuận đọc từ máy chủ đang chạy làm DÂN SỐ, When chân `khai-tieng.mjs` chạy, Then nó đưa ra một KHẲNG ĐỊNH riêng cho từng giá trị trong dân số đó — giá trị ấy hiện trên màn bên trong một phần tử tự khai `lang="en"`, đúng AC-14 của vòng ③a — và số khẳng định bằng số giá trị enum; một giá trị enum không tìm được phần tử tương ứng trên màn làm chân đỏ và gọi tên giá trị đó. Không hằng gõ tay nào còn đóng thế cho dân số, và không vế nào của khẳng định lấy từ cùng nguồn với vế kia.
- AC-2: Given một chân đo mà tập quan sát của nó rỗng — không giá trị nào hiện ra, không hàng dữ liệu nào để đối chiếu, When chân chạy, Then nó TỪ CHỐI đo: thoát mã 2 và gọi tên tập đang rỗng. Tập rỗng không bao giờ là đạt.
- AC-3: Given lời hứa của lượt máy chủ trả về đầu tiên là một quan hệ — chữ tiếng Việt có mặt VÀ chữ tiếng Anh cũ vắng mặt, When `may-chu-ve.sh` đo ba màn, Then nó kiểm cả hai vế; và khi lượt về đầu còn chứa chuỗi tiếng Anh của một trong ba màn, chân đỏ và in ra chuỗi nó tìm thấy.
- AC-4: Given mười chuỗi vòng ① định tuyến sang ③a, When `no-vong-1.mjs` đo, Then mỗi chuỗi mang bản dịch tiếng Việt đã ghim và chân kiểm bản dịch ấy có mặt; và khi một chuỗi vắng ở CẢ hai thứ tiếng, chân báo KHÔNG ĐO ĐƯỢC chứ không báo đã dịch.
- AC-5: Given phép đo chữ thời gian tương đối, When nó chạy, Then nó đọc phần tử `<time>` do chính trang vẽ ra; và khi trang không vẽ ra phần tử nào như vậy, chân thoát mã 2 thay vì tự dựng một cái để đọc.
- AC-6: Given bản khai bề mặt ẩn của mỗi màn, When chân bốn-màn chạy, Then nó so bản khai với số bề mặt mà trang THẬT SỰ mời ra; trang mời một bề mặt mà bản khai không có thì chân đỏ và gọi tên bề mặt đó, và một dòng bản khai không còn bề mặt thật cũng đỏ.
- AC-7: Given ba trạng thái dữ liệu biên của AC-11 vòng ③a, When phép đo chạy, Then nó đọc chữ hiện trên màn cho từng trạng thái; phần đếm hàng trong cơ sở dữ liệu ở lại nhưng là TIỀN ĐỀ — thiếu hàng thì thoát mã 2 gọi tên trạng thái thiếu, không phải một kết quả đạt hay hỏng.
- AC-8: Given chặn khoá-chết, When nó xét một khoá, Then khoá chỉ được gọi là còn sống khi ĐƯỜNG ĐẦY ĐỦ của nó có mặt tại một chỗ gọi; một tên lá trùng với một từ phổ thông xuất hiện ở nơi khác không giữ khoá sống. Bài tự kiểm của chặn chạy đúng đường đụng-tên đó bằng một tên lá có thật trong mã.
- AC-9: Given các bản khai miễn trừ của giàn đo — khối `mienTru` của `rang/danh-sach-chan.json`, `KHONG_DAU` trong bài kiểm khoá-chết, và `rang/dot-bien-sot.txt`, When bộ kiểm chạy, Then một dòng miễn trừ không còn đối tượng thật làm bộ kiểm ĐỎ và gọi tên dòng đó. Thêm một dòng vào bản khai không bao giờ là cách tắt im lặng một phép đo.
- AC-10: Given `rang/dot-bien.mjs` đang chạy một lượt, When một người sửa một file mã sản phẩm giữa lượt đó, Then bản sửa ấy còn nguyên sau khi lượt chạy kết thúc; và sau khi chân thoát bằng bất kỳ đường nào, không file mã sản phẩm nào còn mang bản đột biến.
- AC-11: Given DANH SÁCH CHÂN NGHIỆM THU khai trước — suy từ các file có thật trong `rang/` cộng `apps/app/test/messages-guard.spec.ts`, trừ đi một bản khai miễn trừ có lý do từng dòng, When bộ kiểm khai sinh chạy, Then nó chạy CẢ HAI chiều của TỪNG chân trong danh sách ấy ngay trong lượt chạy đó — chiều lành phải im, chiều bị phá phải đỏ với đúng thông điệp đã ghim — và bảng kết quả có đúng số dòng bằng số chân trong danh sách. Một chân không chạy được vì hạ tầng (không có trình duyệt, máy chủ không lên) làm bộ kiểm TỪ CHỐI ĐO, gọi tên chân đó; nó không bao giờ là một lượt đạt.
- AC-13: Given một chân đo mà không véc-tơ phá nào làm nó đỏ được, When vòng này kết thúc, Then chân đó bị XOÁ khỏi kho và sổ khai sinh mang một mục ghi tên nó cùng lý do; bộ kiểm đỏ khi một chân trong danh sách không có véc-tơ phá mà cũng không được khai là đã xoá, và đỏ khi một chân được khai là đã xoá mà file vẫn còn.
- AC-12: Given hồ sơ bằng chứng của vòng này, When một người chịu trách nhiệm ký đọc nó, Then với từng chân đo họ nói được cái gì phải hỏng ngoài đời thì chân ấy đỏ, bằng ngôn ngữ sản phẩm chứ không bằng mã thoát. (judgment)

## Coverage

Quét bằng skill `morphological-scan`. Preset `test-matrix` có trục hình dạng sản
phẩm (surface, role, trạng thái dữ liệu, mạng) — **chủ ngữ ở đây là giàn đo nên
trục dựng lại từ đầu**; giữ đúng một điều của preset: thước CE là **lịch sử
lỗi**. Ở đây lịch sử lỗi là chính bốn vòng S4 số 5 → 8 của ③a, hai ngày tuổi.

Ba trục, 5 × 5 × 4 = 100 ô; không gian > 30 nên quét theo lát cắt của trục A.

- Trục **A — vì sao nó xanh được** (MECE trên câu hỏi "cái gì làm nó xanh"):
  hằng-đúng (tập quan sát rỗng hoặc tự cấp) | nửa-quan-hệ (chỉ kiểm một vế) |
  fixture-nặn-sẵn (vật đo do bên đọc nặn ra) | sai-vật-đo (đo vật khác vật đã
  hứa) | bán-kính-nổ (đỏ được, nhưng làm hỏng cây làm việc)
  [thước CE: `[SUY-TỪ-REPO: _acceptance/nhan-ung-dung-noi-tieng-viet/review-findings.md]`
  — chín phát hiện đã xác nhận của vòng 8, mỗi cái rơi vào đúng một giá trị ·
  `[SUY-TỪ-REPO: ~/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.7.0/skills/acceptance/references/measure-birth.md]`
  — bảng lớp lỗi của kit, 13 lớp có tên; bốn giá trị đầu gộp từ chín lớp trong
  bảng đó. **Giá trị `bán-kính-nổ` KHÔNG có trong bảng lớp lỗi của kit** — nó là
  lớp mới vòng này tìm ra, và đó là lý do `dot-bien.mjs` bốn vòng liền bị xếp
  nhầm cùng họ với tám cái kia.]
- Trục **B — véc-tơ phá vật**: lật ngôn ngữ (phục vụ đúng trang đó ở `lang=en`) |
  sửa kho chuỗi trong bản sao | rút hàng dữ liệu để dựng tập rỗng | đổi enum máy
  chủ | không phá được ⇒ **XOÁ** (AC-13)
  [thước CE: `[NGÀNH: Stryker Mutator · PIT · mutmut]` — ba bộ đột biến có tên
  của ngành, mỗi bộ khai một danh mục toán tử đột biến; danh sách ở đây là bản
  dịch danh mục ấy sang vật mà giàn này đo (một ứng dụng đang chạy, hai thứ
  tiếng) ·
  `[SUY-TỪ-REPO: _acceptance/nhan-ung-dung-noi-tieng-viet/decisions.jsonl]` —
  `d-20260903T133725Z-22380` đã chứng minh véc-tơ "truyền tay slug sai" đỏ được]
- Trục **C — nơi cặp hai chiều sống**: trong bài kiểm `bun test` | trong chính
  chân đo (`--chan pha-thu`) | cần máy chủ sống và Chrome | cần cây sao riêng
  [thước CE: `[SUY-TỪ-REPO: _acceptance/handoff.md]` — mục "Bẫy mới" ghi bốn
  lượt đo đầu của vòng 8 đo nhầm cây, và ghi rằng trần thời gian Bash là 600
  giây nên chân đột biến luôn phải chạy nền. Giá của giá trị thứ ba và thứ tư đã
  trả thật, không phải ước lượng.]

**Ô Core đến từ quét chứ không từ đề bài — ba cái:**

1. **AC-9, bánh cóc trên bản khai miễn trừ.** Giàn đo có BA bản khai miễn trừ
   (`KHONG_DAU` 29 dòng · `dot-bien-sot.txt` 289 dòng khoá mà đầu file tự khai
   275 · khối `case` của `khong-may-quet.sh` 9 tên) và không cái nào có bánh
   cóc. Không phát hiện nào trong chín cái gọi tên chỗ này. Đây là "ai canh cái
   canh" — và nó đã hỏng sẵn: `viet-tat.ts` được miễn trong `khong-may-quet.sh`
   của ③a trong khi file đó sống ở thư mục `rang/` của vòng ①, còn vòng lặp của
   chân chỉ duyệt `*.mjs` và `*.sh`. Dòng miễn trừ ấy chưa từng có một hit nào,
   và nó nằm trong chính cái chân vừa sửa ở `dc70600`.
2. **AC-7 nửa sau, tiền đề exit 2.** `handoff.md` ghi cơ sở dữ liệu dev rỗng
   giữa vòng 7 và 8, và **không phép đo nào của vòng phát hiện** — người bắt
   được chỉ vì mở ảnh chụp ra nhìn. Ô này và `du-lieu-bien.mjs` là cùng một lỗ.
3. **AC-11, sổ khai sinh tự chạy lại.** Luật khai sinh cấm lời khai tĩnh; nếu
   không có ô này thì bảy bản vá kia chỉ được chứng minh MỘT lần, trong hồ sơ,
   và vòng sau không có gì giữ chúng.

Cross-cutting áp mọi ô Core:

- **Mã thoát 2 (không đo được) khác mã thoát 1 (vật hỏng).** Mọi chân, nguyên
  nhân gọi được tên. Đây là luật đã chốt ở `d-20260903T133725Z-22380`.
- **Hết giờ không tính là bắt được.** `[NGÀNH: PIT · Stryker]` tách `TIMED_OUT`
  và `NO_COVERAGE` khỏi `KILLED`; một chiều đỏ vì hết giờ là chiều đỏ chưa
  chứng minh gì.
- **Đột biến tương đương vào sổ riêng, không vào mẫu số.** `[NGÀNH: mutation
  testing — equivalent mutant]`. `dot-bien.mjs` đã có sổ thứ ba này; các chân
  còn lại chưa.
- **Không đổi chuỗi sản phẩm.**
- **Mọi cặp hai chiều chạy lại được mỗi CI**, không phải một câu trong hồ sơ.

Ô cắt sang Later, có tên để khỏi bàn lại: giàn đo của vòng ① và ② (cùng bệnh gần
như chắc, nhưng lát này khoanh đúng chín cái vòng 8 gọi tên) · độ phủ đột biến
cho 275 khoá ngoài tầm với ở `dot-bien-sot.txt` (đó là lỗ TẦM VỚI của bốn chân
vẽ, không phải lỗ hiệu lực của thước) · `packages/ui/tsconfig.json` để 850 dòng
test ngoài `check-types` (một lỗ đo thật, nhưng cơ chế khác và đã có tên trong
bảng nợ của `handoff.md`).

## Out of scope

- **Chuỗi sản phẩm.** Bản dịch của ③a đã xong và đang xanh. Một chân có răng mà
  phát hiện chuỗi thật còn thiếu thì việc đó đi vòng ③a vòng 9, không đi đây.
- **`rang/khong-may-quet.sh` ngoài phần bánh cóc và phần dọn dòng chết.** Nhánh
  đỏ của nó đã chứng minh ở `dc70600`; mở lại là lật một quyết định đã chốt.
  **Ngoại lệ có tên:** vòng này ĐƯỢC xoá những dòng miễn trừ đã chết trong cả ba
  bản khai, kể cả khối `case` của file này — nếu không thì AC-9 đỏ ngay lượt đầu
  và không ai có quyền gỡ nguyên nhân. Hồ sơ phải gọi tên từng dòng đã xoá.
- **Thay giàn đo bằng khung đột biến có sẵn** (Stryker, PIT, mutmut). Chúng đột
  biến mã rồi chạy bài kiểm đơn vị; giàn này đo một ứng dụng đang chạy qua trình
  duyệt, hai thứ tiếng. Sai công cụ.
- **Giàn đo của vòng ① và ②.** Xem mục Later ở trên.

## Notes

- Vòng này sửa `apps/app/test/messages-guard.spec.ts`, một file ngoài
  `_acceptance/`. Lưới kiểm hiệu lực sẽ gọi bằng chứng của ③a là STALE và ③a
  phải chạy vòng 9. Giá gần bằng không: vòng 8 của ③a sập trước khi có verdict.
- **Một chân có răng thì nó cắn.** Nhiều khả năng vòng 9 của ③a đỏ ở chỗ vòng 8
  xanh. Đó là điều vòng này tồn tại để làm, không phải một rủi ro cần giảm.
