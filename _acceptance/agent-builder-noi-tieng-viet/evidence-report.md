---
schema_version: 2
feature_slug: agent-builder-noi-tieng-viet
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2bf938e6511c00c6c2d29af571759b2afaad2a49
human_signoff: Phan Le Manh 2026-09-17 — ký Cổng 2 trên verdict PASS sau SÁU vòng đo (15/15 eval máy và cả bốn lệnh chứng đều xanh ở vòng cuối, phép đo đột biến bảy chân chứng từng thước đỏ được), với BA giới hạn đã khai. Ký trên hiểu biết rằng: vòng 2 cho một màu ĐỎ GIẢ vì chạy song song khiến phép đo đột biến cắm vết vào cây mà thước tĩnh đang đọc, và từ vòng 3 mọi vòng đều chạy tuần tự; rằng người đã TRẢ LẠI ở vòng 4 vì câu chào gọi người dùng bằng họ, và bản sửa đã được giám khảo chấm kín xác nhận độc lập ở vòng 5; và rằng BẢY mục chữ vẫn để ngỏ — đều cùng một lớp «chữ chưa có mục từ điển», đều do hội đồng ba người khai UNCERTAIN chứ không lăng kính nào FAIL, và đều cần phán quyết của chủ từ điển chứ không cần thêm vòng đo.
---

# Evidence Report: agent-builder-noi-tieng-viet

⚠ Vòng 6 chạy TUẦN TỰ — không lệnh kiểm nào chạy song song, E9 (đột biến) chạy một mình và chạy TRƯỚC khi hội đồng được dispatch, và E11 (chân thả file thử) bị giữ lại cho tới khi cả ba giám khảo đã trả phiếu. Làn máy XANH: 15/15 eval máy và CẢ BỐN lệnh suite hồi quy. Vòng này sửa đúng MỘT dòng (`4159e3ba`): gỡ tên thừa khỏi dòng import ở `deal-list-result.tsx:19` — đúng mục «Ngoài hợp đồng» số 1 mà vòng 5 ghi ra. Cảnh báo `app:lint` đi từ 4 về lại 3. Vòng này KHÔNG xanh-sạch: E18 còn UNCERTAIN, thuộc người quyết ở Cổng Bằng chứng.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-1b | script | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-5 | script | PASS |
| E8 | AC-6b | script | PASS |
| E9 | AC-7 | script | PASS |
| E10 | AC-8 | script | PASS |
| E11 | AC-8 | script | PASS |
| E12 | AC-9 | script | PASS |
| E14 | AC-10 | script | PASS |
| E15 | AC-11 | script | PASS |
| E16 | AC-12 | test | PASS |
| E17 | AC-12 | script | PASS |
| E18 | AC-13 | judgment | UNCERTAIN |

## Evidence

- eval: E9
  run_id: agent-builder-noi-tieng-viet-E9-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ab_dot_bien
  verified_at: 2026-09-17T12:31:33Z
  output: |
    bang dong: 7 hinh dang, moi hinh dang mot vet va mot chan chuyen trach.
    chieu xanh: ca 7 chan xanh tren cay lanh.
    vet "chu trong JSX" -> do boi: moi-chuoi, chu-cung-jsx · vet "chu trong thuoc tinh" -> do boi: thuoc-tinh · vet "o tieu de tai lieu" -> do boi: tieu-de
    vet "toast doi khoa" -> do boi: moi-chuoi · vet "khoa object mang chu" -> do boi: moi-chuoi · vet "go chu trang thai rong khoi man" -> do boi: trang-thai · vet "go muc tu dien khoi CONTEXT.md" -> do boi: tu-dien
    cay lam viec da tro ve dung trang thai truoc khi chay. (git status truoc/sau bang nhau — da kiem tan tay)
    XANH: ca 7 vet deu bi bat, va cay lanh thi ca 7 chan deu xanh.

- eval: E1
  run_id: agent-builder-noi-tieng-viet-E1-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ab_hai_tieng
  verified_at: 2026-09-17T12:33:40Z
  output: |
    -- man /agents · vi=5 en=5 · cap doi chieu=5
    -- man /chat · vi=17 en=17 · cap doi chieu=17
    ngoai lat (gioi han da khai): 1 chuoi sinh tu file hoan sang dot hai — day la GIOI HAN, khong phai da dich.
    ket qua: route do duoc 2/4 (thu muc sinh ra 4, chua chot cach gieo 2) · 22 cap doi chieu · ngoai lat=1 · hong=0 · tu choi do=0
    GIOI HAN DA KHAI: 2 route can mot ban ghi that — khong co phep do man o vong nay, va ca 2 da duoc chung la THAT SU khong dung duoc bang mot dinh danh khong co that.

- eval: E2
  run_id: agent-builder-noi-tieng-viet-E2-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ab_chu_cung_jsx
  verified_at: 2026-09-17T12:33:31Z
  output: |
    bo quet doc 20 file
    ket qua: 26 file .tsx tren dia, tru 6 loai tru co ten, cong 0 khai them = 20 file quet. 0 chuoi khoa cung ngoai 0 dong mien tru, va ca 0 dong deu con doi tuong that.

- eval: E3
  run_id: agent-builder-noi-tieng-viet-E3-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ab_toast
  verified_at: 2026-09-17T12:33:31Z
  output: |
    quet 20 file trong lat · nhan ra 10/10 loi goi khai trong bang · bo qua 13 luot chi chuyen tiep error.message (ngoai pham vi)
    XANH: khong loi goi toast nao con mang chu tieng Anh viet thang.

- eval: E4
  run_id: agent-builder-noi-tieng-viet-E4-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ab_tieu_de
  verified_at: 2026-09-17T12:33:31Z
  output: |
    quet 20 file · 4 o nhan (4 tieu de tab + 0 nhan thanh ben) · 0 nhan thanh ben deu giai duoc qua · 0 o con viet thang
    XANH: ca 4 o nhan deu doc tu kho chuoi.

- eval: E5
  run_id: agent-builder-noi-tieng-viet-E5-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ab_thuoc_tinh
  verified_at: 2026-09-17T12:33:31Z
  output: |
    quet 20 file · 39 thuoc tinh doc tu kho chuoi · 276 thuoc tinh ky thuat co ten · 0 thuoc tinh con chuoi viet thang
    XANH: 39 thuoc tinh doc tu kho chuoi, va khong thuoc tinh nao ngoai danh sach ky thuat con mang chuoi viet thang.

- eval: E6
  run_id: agent-builder-noi-tieng-viet-E6-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ab_trang_thai
  verified_at: 2026-09-17T12:34:20Z
  output: |
    XANH ST-doi-rong tren /agents: "Đội chưa có tác nhân nào"
    XANH ST-thanhben-rong tren /agents: "Không có hội thoại nào trong 7 ngày qua."
    GIOI HAN ST-doi-dang-tai: khong co doi tuong — khung xuong danh sach khong mang chu nao
    GIOI HAN ST-chitiet-* (5 o) va ST-kenh-chua-cam: can mot ban ghi that, cach gieo chua chot
    ket qua: 9 o trang thai · do duoc 2 · gioi han da khai 7 · hong=0

- eval: E8
  run_id: agent-builder-noi-tieng-viet-E8-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ab_du_lieu_nguoi_nhap
  verified_at: 2026-09-17T12:34:35Z
  output: |
    bang du lieu nguoi nhap: 2 o trong lat · 1 o ngoai lat
    XANH tieu de hoi thoai: <span> boc {title} mang translate="no" (agent-builder-sidebar.tsx:132)
    XANH ten tac nhan: <span> boc {agent.name} mang translate="no" (team-agents-index.tsx:42)
    XANH ten kenh Slack: <span> boc {channel.name} mang translate="no" (channel-picker.tsx:89)
    ket qua: 3 o · xanh=3 · hong=0 · ban khai cu=0

- eval: E10
  run_id: agent-builder-noi-tieng-viet-E10-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ab_khai_sinh
  verified_at: 2026-09-17T12:35:12Z
  output: |
    hang FILE: {"latSinh":20,"chanJsx":20,"chanNgoaiToast":20,"chanNgoaiTieuDe":20}
    hang VAT:  {"toastNhanRa":10,"toastKhai":10,"tieuDeNhanRa":4,"tieuDeKhai":4}
    XANH: 20 file, ba chan doc bang nhau; 10 loi goi toast va 4 o tieu de, khop bang khai.

- eval: E11
  run_id: agent-builder-noi-tieng-viet-E11-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ab_dan_so_tu_dia
  verified_at: 2026-09-17T12:41:18Z
  output: |
    neo: 26/26 file — khop
    can gat khong_quet: 6 dong khai BAN GIAO cho ho so khac — quan he lien-ho-so do o chan ban-giao cua ho so nhan, KHONG do o day.
    can gat khong_quet: 6 dong, khong dong nao che giau chu tieng Anh ngoai cac dong khai hoan.
    chieu xanh: ca hai chan xanh tren cay lanh truoc khi tha file thu.
    tha them mot file .tsx mang chu tieng Anh: dan so 26 -> 27 · moi-chuoi(1) chu-cung-jsx(1) · cay da don sach
    XANH: dan so tu thay file moi, va ca hai chan deu do vi no.

- eval: E12
  run_id: agent-builder-noi-tieng-viet-E12-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ab_be_rong
  verified_at: 2026-09-17T12:34:45Z
  output: |
    -- man /agents o 360px · nhan dich duoc=3
    -- man /chat o 360px · nhan dich duoc=7
    CHUA DO DUOC — 2 route can mot ban ghi that ma cach gieo CHUA CHOT (goi ten trong output)
    ket qua 360px: 10 nhan dich duoc · vi tran ma en vua=0 · tran ca hai luot=0

- eval: E14
  run_id: agent-builder-noi-tieng-viet-E14-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ab_moi_chuoi
  verified_at: 2026-09-17T12:35:12Z
  output: |
    quet 20 file · 41 chuoi nguoi co the doc · tru 28/28 dong giu nguyen co ten
    XANH: khong chuoi nguoi doc thay nao con la tieng Anh.

- eval: E15
  run_id: agent-builder-noi-tieng-viet-E15-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ab_mot_bo_thuoc
  verified_at: 2026-09-17T12:35:12Z
  output: |
    chot tien de: moi script ma o cam ab_* tro toi deu co mat.
    so 5 script cua lat nay voi 16 script cua ba lat truoc — nguong 12 dong lien tiep.
    XANH: mot bo thuoc, khong ban chep nao troi.

- eval: E16
  run_id: agent-builder-noi-tieng-viet-E16-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.rang3_khoa_chet
  verified_at: 2026-09-17T12:35:40Z
  output: |
    bun test v1.4.2 (744846f84)
     70 pass
     0 fail
     402 expect() calls
    Ran 70 tests across 1 file. [307.00ms]

- eval: E17
  run_id: agent-builder-noi-tieng-viet-E17-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ab_tu_dien
  verified_at: 2026-09-17T12:35:12Z
  output: |
    doi chieu 3 muc tu dien voi ban vi cua 3 kho chuoi cua lat
    XANH: ca 3 muc deu co trong CONTEXT.md va deu duoc ban vi cua lat dung.

- eval: E18
  judged_by: judge panel (fresh context, dispatch TRONG nghi thuc) — domain-correctness, operational-feasibility, spec-alignment
  proposal: UNCERTAIN
  human_override: Đạt — Phan Le Manh 2026-09-17
  rationale: |
    Ba lăng kính đều UNCERTAIN, KHÔNG lăng kính nào FAIL — như vòng 4 và vòng 5. Ba giám khảo
    chấm kín, mỗi người một context sạch, bị cấm mọi lệnh git đọc lịch sử và mọi vật
    `_acceptance/` ngoài `contract.md`; không phiếu nào mang một chữ nào từ phía người sửa mã.
    KHÔNG LĂNG KÍNH NÀO NÊU LẠI CÂU CHÀO (chỗ người trả lại ở vòng 4) và cũng không ai nêu lại
    ba mục đã xử ở vòng 5 (nhãn danh sách tệp · "đang mở" trên một tổng · cụm "sổ kiểm").
    BỐN MỤC VÒNG 5 ĐỂ NGỎ ĐANG CHỜ CHỦ TỪ ĐIỂN — cả bốn được nêu lại, đúng như dự liệu, và
    hồ sơ KHÔNG đòi sửa chúng trong vòng này: (a) "đội kinh doanh"/"đội khởi tạo"
    (`agent-builder-khung.ts:84`) — cả ba lăng kính cùng nêu; (b) hai cặp gọi tên lẫn trong
    cùng một kho — *deploy* "Đưa vào chạy" (`agent-builder-tac-nhan.ts:199`) cạnh "đưa … cho
    cả đội" (`:195`) và "Đưa cho đội trước" (`:211`); *action* "việc" (`:143,161`) cạnh "thao
    tác" (`:201,205`); (c) nhãn "Sống ở đâu" (`:147,222`); (d) `tableTitle` nối enum thô
    (`deal-list-result.tsx:158-162`) — phiên này kiểm lại bằng `git show`: dòng 155-163 có Y
    NGUYÊN từ mốc so `bd99ba3f`, KHÔNG phải hồi quy.
    BA MỤC MỚI của vòng này, chưa từng được nêu ở bốn vòng trước, đều thuộc cùng một lớp
    «chữ chưa có mục từ điển chống lưng» và đều đã kiểm tận tay: (1) `agent-builder-khung.ts:77`
    gọi thao tác gắn bản ghi là "gắn thẻ một bản ghi" trong khi kho chuỗi ô soạn của chính lát
    viết "Gắn bản ghi CRM và kết nối" (`agent-builder-o-soan.ts:49`) — hai chữ cho một thao
    tác, spec-alignment nêu; (2) cụm "bộ dựng" lặp bốn lần (`agent-builder-tac-nhan.ts:214,227,232`,
    `agent-builder-o-soan.ts:43`) mà `CONTEXT.md` chưa có mục riêng, spec-alignment nêu;
    (3) vùng khoá `ma.*` với nhãn "Mã tác nhân" (`agent-builder-ket-qua.ts:55,59`) có thể đọc
    lẫn với nghĩa «mã định danh» quen thuộc của CRM, domain-correctness nêu.
    HAI MỤC PHẢI ĐỌC ĐÚNG BẢN CHẤT, KHÔNG PHẢI KHIẾM KHUYẾT — giữ nguyên lời vòng 5:
    (a) `thoaThuan.ngayNamIm` giữ "nằm im từ N ngày" không thêm dấu "+" là QUYẾT ĐỊNH của chủ
    kho, đã chốt trước vòng này; domain-correctness có nêu vì chấm kín nên không được biết.
    (b) Cụm `khiNao` = "Chạy khi nào" (`agent-builder-tac-nhan.ts:182`) khác "mốc kích hoạt"
    (`:205`) là chỗ CHƯA được yêu cầu sửa; giữ dạng UNCERTAIN, không đòi sửa.
  votes:
    - domain-correctness: UNCERTAIN
      rationale: |
        Lõi bản dịch mạnh và đúng nghiệp vụ: danh từ trung tâm theo `CONTEXT.md` dùng nhất
        quán (`agent-builder-khung.ts:59,69`, `agent-builder-tac-nhan.ts:136,183`,
        `agent-builder-ket-qua.ts:82,86`), thuật ngữ kỹ thuật giữ tên thật
        (`agent-builder-tac-nhan.ts:140-141`), và quét toàn bộ giá trị `vi` bằng lọc ASCII
        cho thấy không còn chuỗi tiếng Anh sót, không chữ thử nghiệm, không chữ gõ lỗi;
        `đang mở` (`agent-builder-ket-qua.ts:97`) còn tránh đúng từ `pipeline`/`đường ống`
        mà từ điển cấm. Nhưng khái niệm "action của tác nhân" mang HAI chữ trong cùng một
        kho — `việc` ở `agent-builder-tac-nhan.ts:143,161` và `thao tác` ở `:201,205`;
        tương tự *deploy* là "Đưa vào chạy" ở nút (`:199`) nhưng "đưa … cho cả đội" ở toast
        (`:195`) và "Đưa cho đội trước" ở lời nhắc bản nháp (`:211`). Nặng hơn về nghiệp vụ:
        `deal-list-result.tsx:158-162` nối thẳng `result.criteria.status` thô vào câu Việt,
        mà enum đó là `open|won|lost|all` (`apps/agent/agent/tools/list_deals.ts:9`, mặc
        định `open`), nên nhãn thường gặp nhất đọc ra "12 thoả thuận nằm im open" — đúng ba
        chữ mà `CONTEXT.md:155-169` ĐÃ chốt nghĩa tiếng Việt. Thêm `agent-builder-ket-qua.ts:95`
        `nằm im từ ${so} ngày` đánh rơi dấu `+` của bản gốc `:45`. Bốn điểm này đều là chỗ
        từ điển CHƯA ra phán quyết, nên không đủ căn cứ nói đạt, cũng chưa đủ để nói vi phạm rõ.
      required_evidence:
        - Mục `CONTEXT.md` cho khái niệm "thao tác/việc mà tác nhân làm được" do chủ từ điển chốt MỘT chữ (kèm dòng `_Avoid_` cho chữ kia), cộng `agent-builder-tac-nhan.ts:143,161,201,205` đã đổi về đúng chữ đó — bốn dòng cùng một chữ và từ điển có mục thì điểm này hết là chỗ hổng.
        - Mục `CONTEXT.md` cho hành động *deploy* (ứng viên "đưa vào chạy"), cộng `agent-builder-tac-nhan.ts:195,199,211` cùng dùng đúng cụm đó — hoặc biên bản Cổng Phạm vi ghi rõ toast/lời nhắc được phép nói hệ quả ("cho cả đội") thay vì tên hành động, và vì sao người bấm nút không lẫn.
        - Ba khoá mới trong `agent-builder-ket-qua.ts` cho `open|won|lost` ánh xạ theo `CONTEXT.md:155-169`, được gọi ở `deal-list-result.tsx:159` thay cho `result.criteria.status` thô — HOẶC một quyết định của người ký ghi thành mục Known limits, nói rõ nhãn `aria-label` được để lẫn enum tiếng Anh và vì sao điều đó chấp nhận được với người dùng trình đọc màn hình.
        - Phán quyết của chủ từ điển về `agent-builder-ket-qua.ts:95`: giữ nguyên `nằm im từ ${so} ngày` kèm lý lẽ rằng nó đã mang nghĩa "trở lên", hoặc sửa thành dạng mang ngưỡng — kèm chuỗi sau khi sửa.
        - Mục `CONTEXT.md` cho `mã` với nghĩa "mã nguồn tác nhân" (vùng khoá `ma.*`, `agent-builder-ket-qua.ts:4,55-64`), phân biệt với nghĩa `mã định danh` quen thuộc của CRM — hoặc ghi nhận của người quyết rằng "Mã tác nhân" đứng cạnh cây tệp thì không ai đọc nhầm.
    - operational-feasibility: UNCERTAIN
      rationale: |
        Phần lớn ba kho đọc đúng là tiếng Việt của người làm nghề: danh từ trung tâm bám sát
        `CONTEXT.md` (`agent-builder-khung.ts:59,72,88,91`; `agent-builder-ket-qua.ts:81,85`
        — `Phụ trách` đúng dạng bảng nhãn của từ điển), thuật ngữ kỹ thuật giữ tên thật
        (`agent-builder-tac-nhan.ts:140-141`), và không hàm ghép biến nào vỡ ở 0/1/n vì tiếng
        Việt không hợp số; `tenGoi` (`ten-goi.ts:6`) lấy đúng phần TÊN ở cuối cho `vi` và phần
        đầu cho `en`, nên câu chào `agent-builder-khung.ts:75` gọi người dùng bằng tên, và
        đường tên rỗng rơi về "Bạn cần gì hôm nay?" chứ không treo dấu phẩy. Ba chỗ không
        kết luận được: MỘT, cùng kho `agent-builder-tac-nhan.ts` gọi việc-tác-nhân-làm-được
        bằng hai chữ — "việc" ở `:143,161` nhưng "thao tác" ở `:201,205` — trong khi `:136`
        lại dùng chính chữ "việc" cho nghĩa khác hẳn là task của CRM. HAI, dưới lăng kính
        chạy-thật, `deal-list-result.tsx:155-162` ghép chuỗi kho với `result.criteria.status`
        nguyên văn rồi đưa thẳng vào `aria-label` (`:55,58`), nên lượt `vi` đọc ra nửa Việt
        nửa Anh; Out of scope của hợp đồng chỉ gọi tên `error.message`, không nói
        `criteria.status` có thuộc lớp đó hay không. BA, `agent-builder-khung.ts:84` đúc hai
        từ ghép không có mục từ điển, "đội kinh doanh" và "đội khởi tạo".
      required_evidence:
        - Một mục `CONTEXT.md` (hoặc phán quyết của chủ từ điển ghi THÀNH mục `CONTEXT.md`) cho danh từ "việc mà tác nhân làm được", chốt một chữ trong `việc`/`thao tác` và nói rõ chữ `việc` có được đồng thời mang nghĩa task của CRM ở `agent-builder-tac-nhan.ts:136` hay không.
        - Bản đọc `aria-label` thật của `<section>` ở `deal-list-result.tsx:58` trên lượt `vi`, với một `DealListResult` có `criteria.status` khác `"all"` và `inactiveForDays` khác `null` (gieo qua `man-that.mjs` hoặc một fixture của `agent-transcript`), KÈM phán quyết ghi thành chữ trong hợp đồng về việc `criteria.status` có thuộc lớp "chuỗi sinh từ API" của mục Out of scope hay không.
        - Mục `CONTEXT.md` cho hai tên đội xuất hiện ở `agent-builder-khung.ts:84` (`Sales` → "đội kinh doanh", `Onboarding` → "đội khởi tạo"), hoặc bản sửa chuỗi gợi ý đó về chữ thường ai cũng hiểu.
    - spec-alignment: UNCERTAIN
      rationale: |
        Ba phần đo được của AC-13 đều sạch: không chuỗi nào gõ lỗi hay còn sót chữ thử
        nghiệm, và năm danh từ trung tâm dùng nhất quán một chữ đúng từ điển — tác nhân
        (`agent-builder-khung.ts:59,71,88`), hội thoại (`:54-58,68-70`), lượt chạy
        (`agent-builder-tac-nhan.ts:170,183,249`), công ty · phụ trách · ngày chốt
        (`agent-builder-ket-qua.ts:82,85,86`); không chỗ nào rơi vào `_Avoid_` của
        `CONTEXT.md:115,121,127`; thuật ngữ kỹ thuật giữ tên thật (`manifest` ở
        `agent-builder-tac-nhan.ts:140-141`); câu ghép số nhiều đã thành câu Việt tự nhiên
        (`agent-builder-ket-qua.ts:60,74,94`). Phần "đọc như tiếng Việt của người làm nghề"
        thì không đủ căn cứ kết luận: `agent-builder-khung.ts:77` gọi thao tác gắn bản ghi là
        "gắn thẻ" trong khi từ điển (`CONTEXT.md:130`) và kho chuỗi ô soạn
        (`agent-builder-o-soan.ts:49`) đều gọi là "gắn bản ghi CRM";
        `agent-builder-tac-nhan.ts:147,222` đặt nhãn trường kênh là "Sống ở đâu", calque
        thẳng từ `Lives in` (`:19,94`); `agent-builder-khung.ts:84` đúc hai tên đội "đội kinh
        doanh"/"đội khởi tạo"; và "bộ dựng" lặp năm lần (`agent-builder-tac-nhan.ts:214,216,227,232`,
        `agent-builder-o-soan.ts:43`) mà chưa có mục riêng. Cả bốn đều là chữ chưa có mục nào
        trong `CONTEXT.md` chống lưng, mà `CONTEXT.md:21-22` đòi hoặc thêm mục trước hoặc viết
        bằng chữ thường ai cũng hiểu. Chấm PASS ở đây là tự đóng vai chủ từ điển cho bốn chữ đó.
      required_evidence:
        - Phán quyết của chủ từ điển ghi thành mục `CONTEXT.md` cho động từ gắn bản ghi vào ô soạn — "gắn bản ghi" hay "gắn thẻ" — kèm quyết định sửa hay giữ `agent-builder-khung.ts:77`, vì `CONTEXT.md:130` và `agent-builder-o-soan.ts:49` đang nói một đằng còn kho chuỗi khung của lát nói một nẻo.
        - Phán quyết của chủ từ điển về nhãn trường kênh Slack "Sống ở đâu" (`agent-builder-tac-nhan.ts:147,222`): ghi thành một mục `CONTEXT.md` khẳng định đây là giọng sản phẩm cố ý, hoặc thay bằng nhãn đã chốt.
        - Mục `CONTEXT.md` (hoặc bản viết lại chuỗi) cho hai tên đội ở `agent-builder-khung.ts:84` — "đội kinh doanh" và "đội khởi tạo" — và cho danh từ "đối tác" đang dùng ở `:84` và `agent-builder-tac-nhan.ts:221` song song với hai mục **Công ty**/**Cá nhân** đã chốt (`CONTEXT.md:87-98`).
        - Mục `CONTEXT.md` cho **bộ dựng** (đang lặp năm lần: `agent-builder-tac-nhan.ts:214,216,227,232` và `agent-builder-o-soan.ts:43`), hiện chỉ được nhắc trong phần văn của mục **Ô soạn** chứ chưa có mục riêng.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: agent-builder-noi-tieng-viet-SUITE-bun_run_test-r6
  exit_code: 0
  verified_at: 2026-09-17T12:36:05Z
  output: |
    285 pass · 0 fail · 961 expect() calls · Ran 285 tests across 27 files. [498.00ms]
    Tasks: 11 successful, 11 total · Time: 19.89s
    test-run: dropped crm_mu5ij72rax7a_test

- cmd: bunx turbo run lint --force
  run_id: agent-builder-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r6
  exit_code: 0
  verified_at: 2026-09-17T12:36:10Z
  output: |
    app:lint: Checked 321 files in 148ms. No fixes applied.
    app:lint: Found 3 warnings.
    Tasks: 9 successful, 9 total · Time: 228ms
    (Vong 5 co 4 canh bao; vong nay 3 — xem muc Analyst. Ba canh bao con lai la
    noDocumentCookie o components/app-header.tsx va noBarrelFile o lib/locale/locale.ts
    va postcss.config.mjs — deu co san cua kho, khong phai cua lat nay.)

- cmd: bun run lint:slop
  run_id: agent-builder-noi-tieng-viet-SUITE-bun_run_lint_slop-r6
  exit_code: 0
  verified_at: 2026-09-17T12:36:25Z
  output: |
    oxlint --format=default · Found 0 warnings and 0 errors.
    Finished in 457ms on 1017 files with 9 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: agent-builder-noi-tieng-viet-SUITE-bunx_turbo_run_build_force-r6
  exit_code: 0
  verified_at: 2026-09-17T12:36:46Z
  output: |
    agent:build: [BUILD] built output at /Users/manh-macmini/dev/crm/apps/agent/.output
    Tasks: 4 successful, 4 total · Time: 15.221s

## Known limits

- **Hai route cần một bản ghi thật** (`/agents/[agentId]`, `/chat/[chatId]`) không có phép đo màn ở vòng này; cả hai lại được chứng là THẬT SỰ không dựng được bằng một định danh không có thật (E1, E12).
- **Bảy trong chín ô trạng thái** nằm sau cùng quyết định gieo đó; đo được hai ô (`ST-doi-rong`, `ST-thanhben-rong`) — E6 gọi tên bảy ô còn lại kèm lý do.
- **Chiều đỏ của chân bề rộng** không có đối tượng trên lát này: mười nhãn đo được đều nằm trong hộp cho xuống dòng, nên chân mù với vùng chứa cho xuống dòng (E12).
- Cả ba mục đều là giới hạn ĐÃ KHAI trong hợp đồng, không phải phát hiện mới của vòng này; chúng mang sang cổng ký đúng như hợp đồng dặn.

## Ngoài hợp đồng

- **`tableTitle` nối enum thô vào câu Việt** (`deal-list-result.tsx:155-163`): tên gọi khối kết quả ở lượt `vi` dựng ra "N thoả thuận nằm im open". Phiên này kiểm LẠI bằng `git show bd99ba3f:...`: khối 155-163 có Y NGUYÊN từ mốc so — KHÔNG phải hồi quy của vòng nào, mà là một lỗ thước không eval nào của hợp đồng nhìn thấy (AC-10 chỉ đo chuỗi NẰM TRONG 20 file; giá trị này tới từ công cụ của `apps/agent`, sát với dòng ngoài-phạm-vi «chuỗi sinh từ API»). Hai trong ba lăng kính tìm ra nó khi chấm kín, độc lập với nhau.
- **Tên khoá `duongOng` mang chữ trong `_Avoid_`** (`agent-builder-ket-qua.ts:47,97`): giá trị hiển thị đúng ("đang mở" ở bản `vi`), chỉ TÊN KHOÁ còn chữ mà mục **Đang mở** của `CONTEXT.md:168` cấm. spec-alignment nêu và tự xếp là ngoài phạm vi AC-13 — AC-13 chấm chữ người đọc thấy, không chấm tên khoá. Ghi ra đây để người ký biết, không đề nghị sửa trong vòng này.
- Mục «Ngoài hợp đồng» số 1 của vòng 5 — import thừa ở `deal-list-result.tsx:19` — ĐÃ XỬ bằng commit `4159e3ba` và phiên này chứng bằng `app:lint` (0 lượt `noUnusedImports`, cảnh báo 4 → 3).

## Analyst

Vòng này KHÔNG chạy lại baseline (args khai `runBaseline: false`), nên mọi eval ghi
`baseline: n-a`. Danh sách không-phân-biệt mang sang từ vòng 2 — chín eval xanh trên
CẢ HAI phía (nhánh và diffBase), tức chứng minh harness chứ chưa chắc chứng minh
feature; viết lại để assert hành vi mới, hoặc xác nhận đây là regression-guard có chủ ý:

- E2 (`chu-cung-lat.mjs`), E3 (`--chan toast`), E4 (`--chan tieu-de`), E5 (`--chan thuoc-tinh`),
  E10 (`khai-sinh.mjs`), E11 (`khai-sinh.mjs --chan dan-so`), E14 (`moi-chuoi.mjs`),
  E15 (`mot-bo-thuoc.mjs`), E17 (`tu-dien.mjs`).

Bốn quan sát riêng của vòng 6:

- **Cảnh báo `app:lint` đi từ 4 (vòng 5) về 3 (vòng này).** Cảnh báo thứ tư của vòng 5 —
  `components/agent-builder/deal-list-result.tsx:19:15 lint/correctness/noUnusedImports` — đã
  biến mất: phiên này đếm 0 lượt `noUnusedImports` trong toàn bộ output của `bunx turbo run
  lint --force`. **Ba cái còn lại là của KHO, không phải của lát này**, và đã kiểm đích danh
  từng cái: `lint/suspicious/noDocumentCookie` ở `components/app-header.tsx:129:3`,
  `lint/performance/noBarrelFile` ở `lib/locale/locale.ts:1:1`, và `lint/performance/noBarrelFile`
  ở `postcss.config.mjs:1:1`. Không cái nào chạm `components/agent-builder/**` hay
  `lib/messages/agent-builder-*.ts`.
- **Vòng này sửa đúng MỘT dòng, và phiên đã kiểm điều đó.** `git diff --name-only 7ec602c8 HEAD`
  ra sáu tên, năm trong đó là vật hồ sơ (`_acceptance/agent-builder-noi-tieng-viet/*`); file sản
  phẩm duy nhất là `apps/app/components/agent-builder/deal-list-result.tsx`, và diff của nó là
  một dòng import. Mọi chuỗi mà hội đồng vòng 5 nêu — `agent-builder-khung.ts:84`,
  `agent-builder-tac-nhan.ts:143,147,161,182,195,197-201,205,211`, `agent-builder-ket-qua.ts:44,95`
  — phiên này đọc lại tận tay và thấy y nguyên.
- **Nếp tuần tự giữ đúng như vòng 5 đã chứng.** E9 chạy một mình và chạy TRƯỚC khi ba giám
  khảo được dispatch; E11 bị giữ lại tới khi cả ba phiếu đã về. `git status` trước/sau của cả
  hai chân bằng nhau, kiểm tận tay ở cả hai lượt. Cả ba giám khảo trả CHẬM (267s · 343s · 388s)
  nhưng đều trả — không lăng kính nào phải tự chấm thay.
- **Một vết nhỏ trong bản ghi vòng 5, ghi ra cho người đọc hồ sơ.** Khối E12 của báo cáo vòng 5
  có dòng `GIOI HAN KE THUA: mu voi vung chua cho xuong dong.` Chân của hồ sơ NÀY
  (`_acceptance/agent-builder-noi-tieng-viet/rang/man-that.mjs`) không in dòng đó — chuỗi ấy do
  `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs:700` của một hồ sơ KHÁC in.
  Giới hạn là thật (hợp đồng khai ở AC-9 và ở Known limits), chỉ là nó không tới từ output của
  lượt chạy. Vòng này chép output NGUYÊN VĂN và để giới hạn ấy ở đúng chỗ của nó — mục
  Known limits. Không phải khiếm khuyết sản phẩm, không phải eval đỏ.

- **Không lệnh nào bị công cụ giết.** Mọi lời gọi Bash đặt trần 600000 ms; không lượt nào có
  dấu hiệu timeout hay output cắt trước dòng tổng kết của chính lệnh.

## Variance

none — every multi-run eval is uniform (không eval nào của vòng này mang `runs > 1`).

## Iterations

Round 1: 17 eval (E1–E18) đều PASS, ký ở Cổng 2 ngày 2026-09-06,
verified_commit f8aa7f4a9e1ec9ce1be8585683103adf1a901431.
Round 2: E16 FAIL và hội đồng E18 đề xuất FAIL ("đường ống" nằm trong _Avoid_ của
CONTEXT.md). REJECT, quay lại triển khai. Màu đỏ của E16 về sau chứng được là GIẢ —
vòng chạy song song, E9 đang cắm vết vào chính cây nguồn lúc E16 đọc.
Round 3 (tuần tự, E9 chạy một mình): 15/15 eval máy PASS, E16 xanh trở lại. REJECT vì
lệnh suite `bunx turbo run lint --force` đỏ — biome báo sai định dạng ở đúng khối ô ghim
mà commit sửa vòng này vừa đổi (apps/app/test/messages-guard.spec.ts) — và vì hội đồng
E18 đề xuất FAIL cho nhãn cột "Người phụ trách" trái luật nhãn ở CONTEXT.md:36.
Round 4 (tuần tự), sau commit a8c524bb: 15/15 eval máy PASS và CẢ BỐN lệnh suite exit 0;
hội đồng không còn lăng kính nào FAIL, cả ba UNCERTAIN. PENDING-JUDGMENT — làn máy sạch.
NGƯỜI TRẢ LẠI ở Cổng Bằng chứng: câu chào gọi người dùng bằng HỌ chứ không bằng TÊN.
Round 5 (tuần tự, E9 chạy một mình và chạy trước hội đồng), sau hai commit f72d24cc và
7ec602c8: 15/15 eval máy PASS và CẢ BỐN lệnh suite exit 0. Chỗ làm người trả lại đã hết,
và operational-feasibility xác nhận độc lập điều đó tại `ten-goi.ts:6`; ba mục để ngỏ vòng 4
cũng không lăng kính nào còn nêu. Hội đồng vẫn cả ba UNCERTAIN với chỗ MỚI hoặc chỗ CHƯA
được yêu cầu sửa. PENDING-JUDGMENT, cộng hai mục «Ngoài hợp đồng» phiên đó ghi ra.
Round 6 (tuần tự, E9 chạy một mình và chạy trước hội đồng, E11 giữ tới sau khi cả ba phiếu
đã về), sau commit 4159e3ba — một dòng: gỡ `DealListItem` khỏi dòng import ở
`deal-list-result.tsx:19`, đúng mục «Ngoài hợp đồng» số 1 của vòng 5: 15/15 eval máy PASS và
CẢ BỐN lệnh suite exit 0; cảnh báo `app:lint` về lại ba cái có sẵn của kho. Hội đồng vẫn cả
ba UNCERTAIN, không lăng kính nào FAIL: bốn mục vòng 5 để ngỏ được nêu lại (đang chờ chủ từ
điển), cộng ba mục MỚI cùng lớp «chữ chưa có mục từ điển» — "gắn thẻ" vs "gắn bản ghi CRM",
cụm "bộ dựng", và vùng khoá `ma.*`. PENDING-JUDGMENT: làn máy sạch, phần còn lại thuộc người
quyết ở Cổng Bằng chứng. Vòng này VƯỢT trần ba vòng của skill — chạy theo chỉ đạo trực tiếp
của người, không phải một vòng tự động.

### Re-pin lần 1 — 2026-09-17, do dựng lại trên bản chung hiện tại: nhánh cũ gánh việc hồ sơ khác, và bản chung đã sửa dot-bien-lib
run_id: repin-20260917T165105Z-85386
sha: 8c6be6270473fc753bb15e19c063b3ef8c74219e · suites: 4 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-10-04, do sửa thước đỏ lô 2-4 (d2)
run_id: repin-20261004T153704Z-99356
sha: 2bf938e6511c00c6c2d29af571759b2afaad2a49 · suites: 7 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · ngoài làn máy: E18 · diff chạm vật đo ngoài làn máy: E18 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-13
