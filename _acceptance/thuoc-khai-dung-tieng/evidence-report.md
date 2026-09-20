---
schema_version: 2
feature_slug: thuoc-khai-dung-tieng
verdict: PASS
failed_evals: [E1, E10]
reason:
verified_by: fresh-context verification subagent (vòng chấm 2 — lượt tuần tự)
enforcement_mode: strict
bypass_used: false
verified_commit: 5b958a5ccdce44ca1269bd50adaef90249526821
human_signoff: Phan Le Manh 2026-09-20
---

# Evidence Report: thuoc-khai-dung-tieng (vòng chấm 2 — lượt tuần tự)

Bản ghi được chấm: `.acceptance-runs/thuoc-khai-dung-tieng/tuan-tu-20260920T0516Z/`
(`tuantu.txt` + 21 tệp `tuantu-<id>.out`). Bắt đầu `2026-09-20T05:16:31Z`, kết thúc
`07:35:17Z`, sha đầu = sha cuối = `5b958a5c`. Không ai commit giữa chừng.

Lượt này thay cho vòng 1 (song song, sha `6064ca69`), verdict `BLOCKED` vì các chân
đo chồng lên nhau. **Tổng thời gian đo được của 21 lệnh cộng lại bằng đúng cửa sổ
chạy (8326 giây = 2h18m46s)** — không có một giây chồng lấn nào, tức lượt này thật
sự chạy tuần tự. Đó là số kiểm độc lập, không phải lời khai.

Người chấm không chạy lại lệnh nào và không đọc mã sản phẩm để «kiểm lại».

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | FAIL (có mục Known limits gọi đúng tên) |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | UNCERTAIN (vế (c) không có dấu vết trong đầu ra) |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-8 | test | PASS (xanh bằng cache turbo, xem Analyst) |
| E10 | AC-9 | script | FAIL (có mục Known limits gọi đúng tên) |
| E11 | AC-10 | judgment | UNCERTAIN (hội đồng vòng 1 đề xuất PASS; chờ người ký) |
| E12a | AC-11 | script | PASS |
| E12b | AC-11 | script | PASS |
| E12c | AC-11 | script | PASS |
| E12d | AC-11 | script | PASS |
| E13 | AC-12 | script | PASS |
| E14 | AC-13 | script | PASS (đi qua cửa Known limits của chính `expected`) |
| E15 | AC-11 | script | UNCERTAIN (hai chốt `expected` đòi không được gọi tên) |

Ba con số kiểm lại từ chính bản ghi, không lấy từ lời khai:

- tổng số lệnh: **21** (17 lệnh eval + 4 lệnh suite)
- số lệnh thoát 0: **19/21** (E1 mã 2 · E10 mã 1)
- phép phá lọt trong E12a-d: **0 / 24** (nhanh 17 · vừa 5 · chậm 1 · đạt 1; mọi mục «đạt»)

## Evidence

- eval: E1
  run_id: tk-tuantu-E1-20260920
  exit_code: 2
  verifier: config:executors.script.tk_ghim_phan_biet
  verified_at: 2026-09-20T05:27:59Z
  output: |
    KHONG DO DUOC: lenh lanh thoat 1, le ra phai 0 tren cay sach.
       lenh: bun _acceptance/ho-so-khai-dung-tieng/rang/hoi-quy-nam-cho.mjs
       Mot lenh do tren cay lanh khong phai ket qua do — no la tien de hong.
         TimeoutError: Navigation timeout of 120000 ms exceeded
               at goto (.../puppeteer-core/lib/puppeteer/api/Page.js:582:43)
               at xem (.../_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs:146:13)
  # Chân dừng ở TIỀN ĐỀ: không một khẳng định nào trong bảng «chuỗi ghim vắng ở
  # lượt lành» được sinh ra. `expected` đòi số khẳng định = số chuỗi ghim khai
  # trong pha-thu.mjs (14 đột biến / 11 lệnh, theo dòng đầu đầu ra) — đạt 0.
  # Đây cũng là lệnh DUY NHẤT trong 21 lệnh có `cay_doi: CO`, và nó chạy ĐẦU TIÊN.

- eval: E2
  run_id: tk-tuantu-E2-20260920
  exit_code: 0
  verifier: config:executors.script.tk_khai_sinh_dung_ghim
  verified_at: 2026-09-20T05:30:10Z
  output: |
    -- Phep do: dat lai chuoi ghim cua E1 ve "gioi-thieu"
       (ten chan, in o moi luot), roi doi bo khai sinh phai bao KHONG DAT.
       (1) bo khai sinh in nhan [dem-roi-vut]:            co
       (2) no bao "ghim vang o luot lanh: KHONG":         co
       (3) no cham E1 la KHONG DAT:                       co
    ket qua: dat
  # Cả ba điều `expected` đòi đều có mặt, và được chứng bằng cách CHẠY pha-thu
  # trên bản sao có một chuỗi ghim cố ý đặt thành tên chân — đúng phép đo đã khai.

- eval: E3
  run_id: tk-tuantu-E3-20260920
  exit_code: 0
  verifier: config:executors.script.tk_cong_chan_duoc
  verified_at: 2026-09-20T05:31:34Z
  output: |
    -- Moi viec xay ra trong ban sao .../worktrees/.cong-chan-duoc-52206; cay dang xet khong doi mot byte.
    -- Ket qua:
       them cho thu muoi -> `bun run test` DO (ma 1), va goi ten apps/app/components/crm/deal-stage.tsx (18.2 giay)
       tra ban goc       -> `bun run test` xanh (23.0 giay)
       cay dang xet: `git status --porcelain` truoc va sau giong het nhau
    ket qua: 0 cho hong
  # Đo HIỆU LỰC chứ không đo bản khai: cả hai chiều trên cùng một bản sao, và
  # chiều đỏ GỌI TÊN đúng tệp vừa thêm. `cay_doi: khong` trong bảng tổng khớp
  # với khẳng định git status trước/sau.

- eval: E4
  run_id: tk-tuantu-E4-20260920
  exit_code: 0
  verifier: config:executors.script.tk_hai_ho_so
  verified_at: 2026-09-20T05:31:34Z
  output: |
    -- HANG GHIM chep tay tu cay, so TRUOC khi dem vi pham:
         nen-chat-ai-elements: 6 tep .mjs
         ho-so-khai-dung-tieng: 7 tep .mjs
    -- 2 khoi trong ban khai cong:   [13 dong "co dinh doat", goi ten tung tep]
    -- 3 thuoc cu, chay that, goi ten tung cai:
       xanh mo-coi
       xanh chu-cung
       xanh mau-ban-kinh
    ket qua: 0 cho hong
  # Vế (a) và (b) đủ bằng chứng: hàng ghim 6 và 7 khẳng định TRƯỚC khi so bản
  # khai, 13 tệp gọi tên từng cái, ba thước cũ chạy thật và gọi tên.
  # Vế (c) — «bộ chạy đọc bản khai chứ không gõ cứng danh sách: đổi một id
  # trong bản khai thì bộ chạy phải đổi theo» — KHÔNG có một dòng nào trong
  # đầu ra đầy đủ. Bản ghi không đủ để kết luận vế này. Thiếu dữ kiện: một
  # khẳng định (hoặc một phép phá) cho thấy đổi id trong gate-shape.json làm
  # bộ chạy đổi theo. Ba phép phá E4a/E4b/E4c trong E12a phủ hai vị trí của
  # «Cặp hai chiều», không phủ vế (c).

- eval: E5
  run_id: tk-tuantu-E5-20260920
  exit_code: 0
  verifier: config:executors.script.tk_khong_de_lai_vet
  verified_at: 2026-09-20T05:31:35Z
  output: |
    -- Chup TRUOC: 27 thoa thuan.
    -- Luot bi ep loi thoat ma 3.
    -- BA TIEN DE cua phep do nay, kiem TRUOC khi doc bat ky con so nao:
         (1) luot chay phai THOAT KHAC 0: 3
         (2) no phai da TAO that su: 1 thoa thuan
         (3) no phai chet vi DUNG loi ta ep: dung
    -- 28 ban ghi da doi chieu, goi ten tung cai:
       nguyen ven  seed-deal-stripe-0 DECISION_MAKER_BOUGHT_IN
       ... [27 dong "nguyen ven <id> <giai doan>"]
       vat thu mang moc doclmu9dpdpl: da don sach
    ket qua: 0 ban ghi that con lech tren 27
  # Ngoại lệ ép Ở GIỮA (sau khi đã tạo thoả thuận thật, trước khi trả), đúng
  # chỗ `expected` đòi. Gọi tên từng bản ghi kèm giá trị, không trả con số.
  # Ba tiền đề kiểm TRƯỚC khi đọc số — chặn đúng lớp «xanh mà không chứng gì».

- eval: E6
  run_id: tk-tuantu-E6-20260920
  exit_code: 0
  verifier: config:executors.script.tk_xoa_co_kiem
  verified_at: 2026-09-20T05:31:35Z
  output: |
    -- Cua CHI_KIEM_DUONG nay thoat SAU lenh xoa, khong truoc.
    -- Ket qua bon duong:
       (a) worktree hop le, DA TON TAI   duong hop le di qua ca ba luat VA qua lenh xoa
       (b) goc kho                       bi chan boi [luat-1-goc-kho], va vat con nguyen
       (c) thu muc thuong, khong tien to  bi chan boi [luat-2-tien-to], va vat con nguyen
       (d) MANG tien to, khong worktree   bi chan boi [luat-3-khong-phai-worktree], va vat con nguyen
    ket qua: 0 duong hong tren 4
  # `expected` đòi BA đường; bản ghi chạy BỐN, mỗi đường rơi vào một nhánh
  # khác nhau của kiemDuongSao(). Cả (b)(c)(d) đều khẳng định THƯ MỤC VẪN CÒN
  # sau khi gọi, đúng điều `expected` nhấn mạnh là chưa đủ nếu chỉ xem mã thoát.

- eval: E7
  run_id: tk-tuantu-E7-20260920
  exit_code: 0
  verifier: config:executors.script.tk_ban_khai_khop
  verified_at: 2026-09-20T05:38:56Z
  output: |
    -- VE (a): 21 hinh dang rut tu `expected` cua 12 o:
       con ton tai  E1   "ForeignText"
       ... [21 dong, moi dong mot hinh dang, goi ten o va chuoi]
    -- VE (b): doc TU o E11: moi muc can "tieng_viet_lot";
       moi phan tu cua `cho` can "gia_tri", "boc", "the", "so_phan_tu_khai", "duong_the".
    -- Chay lai 7 chan ui-check that de sinh lai .../evidence/vung-khai.json.
    -- VE (b): tung khoa da doi chieu:   [58 dong "co khoa <khoa>"]
    ket qua: 0 cho ban khai lech ban that
  # Cả hai vế gọi tên từng mục: 21 hình dạng + 58 khoá, không một con số trần.
  # Danh sách khoá ĐỌC TỪ `expected` của ô hội đồng, không gõ lại lần hai.
  # Giới hạn đã khai: chiều ĐỎ của nhánh glob `docDuong()` (commit cc31d5bb)
  # chưa chạy — xem Known limits.

- eval: E8
  run_id: tk-tuantu-E8-20260920
  exit_code: 0
  verifier: config:executors.script.tk_bai_kiem_dung_nha_quet
  verified_at: 2026-09-20T05:39:00Z
  output: |
    -- HANG GHIM chep tay tu cay: 224 tep nguon duoi packages/ (bo /generated/).
       So TRUOC khi dem vi pham.
    -- PHAM VI: ca src/ LAN test/.
    -- Da quet 224 tep, khong tep nao nhap nguoc chieu.
    -- 2 bai kiem, doi chieu bang tsc --listFiles:
       nam trong chuong trinh packages/ui/test/khai-tieng.spec.tsx (tsc doc 1346 tep)
       nam trong chuong trinh apps/app/test/khai-tieng-metaline.spec.tsx (tsc doc 3825 tep)
    ket qua: 0 cho hong (ve a: nhap nguoc chieu tren 224 tep · ve b: 2 bai kiem)
  # Vế (b) đo QUAN HỆ thật bằng `tsc --listFiles` (tệp thuộc tập tsc đọc), không
  # bằng chuỗi đại diện. Hàng ghim 224 khẳng định TRƯỚC khi đếm vi phạm — chặn
  # đúng ca «glob neo sai gốc quét 0 tệp rồi báo 0 vi phạm».

- eval: E9
  run_id: tk-tuantu-E9-20260920
  exit_code: 0
  verifier: config:executors.test.tk_bai_kiem_dung_nha
  verified_at: 2026-09-20T05:39:00Z
  output: |
    agent:check-types: cache hit, replaying logs 9489ffb6c2876be7
    api:check-types:   cache hit, replaying logs 749c0b0f91c20db2
    app:check-types:   cache hit, replaying logs 7ea4a24abe872540
     Tasks:    13 successful, 13 total
    Cached:    13 cached, 13 total
      Time:    38ms >>> FULL TURBO
  # Xanh, nhưng xanh bằng CACHE: không một lượt `tsc` nào chạy trong lượt này
  # (13/13 cache hit, 38ms). Khoá cache suy từ nội dung tệp nên đây là xanh hợp
  # lệ, không phải xanh giả — nhưng nó không phải một lượt soi mới.
  # Chiều đỏ đã chạy ở E12b (phép phá `E9a`, chân đỏ). Vòng 1 đã đánh dấu E9
  # `non_discriminating` trong khối baseline của run-log.

- eval: E10
  run_id: tk-tuantu-E10-20260920
  exit_code: 1
  verifier: config:executors.script.tk_ho_so_cu_van_xanh
  verified_at: 2026-09-20T05:54:28Z
  output: |
    -- Ve (b): diff 32491c87..HEAD co cham tep san pham nao khong.
       61 tep doi so voi 32491c87, KE CA thay doi chua commit va tep chua theo doi.
    -- Ket qua:
       xanh gioi-thieu · xanh tom-tat-lien-he · xanh nganh · xanh dong-thoi-gian
       xanh khong-khai-thua · xanh ho-so-trong · xanh tieng-trang · xanh mot-duong
       DO   [ho-so-cu-do:hoi-quy-nam-cho] ma thoat 1
       bang chung: 0 cho lech tren 8 muc
       diff 61 tep, giao voi 11 tep san pham: RONG
    ket qua: 1 cho hong
  # Vế (b) — lời hứa trung tâm «thước đổi, sản phẩm không đổi» — chạy TRỌN và
  # XANH: 61 tệp đổi, giao với 11 tệp sản phẩm là RỖNG, và khoảng diff không
  # rỗng nên khẳng định có đối chứng. Vế (a) đỏ đúng 1/9 chân.
  # Cùng chân, cùng thông điệp đã đỏ ở vòng 1 (sha 6064ca69) — xem Analyst.

- eval: E11
  judged_by: hội đồng ba người, vòng chấm 1 (context sạch)
  verdict: UNCERTAIN
  rationale: |
    Ô hội đồng, `executor: judgment` — KHÔNG có trong bản ghi máy vì nó không
    phải một lệnh. Vòng chấm 1 hội đồng đề xuất PASS. Người chấm lượt này không
    chấm thay hội đồng và không có bản ghi máy nào để đối chiếu.
  required_evidence:
    - Bảng 13 dòng của hội đồng (cách nói dối | phép đo bắt được | TÊN TỆP + SỐ DÒNG),
      chấm trên `evidence/dau-ra-mot-luot.txt` chứ không trên hợp đồng.
  human_override: Phan Le Manh 2026-09-20
  human_override_decision: |
    Đạt. Người ký phát ngôn «E11: Đạt» qua /acceptance-gate:signoff ngày
    2026-09-20, sau khi đọc đề xuất PASS của hội đồng ba người ở vòng chấm 1 và
    việc người chấm vòng 2 để UNCERTAIN vì không có bản ghi máy để đối chiếu.

- eval: E12a
  run_id: tk-tuantu-E12a-20260920
  exit_code: 0
  verifier: config:executors.script.tk_khai_sinh_nhanh
  verified_at: 2026-09-20T06:21:33Z
  output: |
    -- 17 eval may, moi eval co it nhat mot dot bien:
         E1 <- E1 · E2 <- E2 · E3 <- E3 · E4 <- E4a, E4b, E4c · E5 <- E5
         E6 <- E6 · E7 <- E7 · E8 <- E8 · E9 <- E9a · E10 <- E10a, E10b
         E12a <- E12 · E12b <- E12 · E12c <- E12 · E12d <- E12 · E13 <- E13
         E14 <- E14, E14-A, E14-C, E14-D, E14-E, E14-F, E14-G, E14-chot-ghim-cu
         E15 <- E15
    -- NHOM CHAY: nhanh — 17/24 dot bien.
    -- LUOT LANH: 8 lenh rieng biet, chay MOT LAN moi lenh, TRUOC khi pha bat cu gi.
    -- DA TRA 0 thoa thuan ve nguyen trang.  -- DA TAT may chu cua ban sao
    -- nhom nhanh: 17 phep pha:   [17 dong "dat <id> ma 1 · ghim CO · vang o luot lanh co"]
    ket qua: 0 phep pha KHONG do duoc tren 17 (nhom nhanh; ca bang 24)
  # Phép kiểm ÁNH XẠ đọc bảng ĐẦY ĐỦ (17 eval máy), không đọc bảng đã lọc —
  # đúng chỗ vòng 1 bắt («13=13 vẫn đạt khi một eval không có phép phá nào»).
  # Mỗi phép phá đều qua luật AC-1: «vắng ở lượt lành: có».
  # Lệch bản khai: `expected` nói «15 phép phá rẻ» và «Ba nhóm cộng lại phủ đủ
  # 21 phép phá» — bản ghi có BỐN nhóm và 24 phép phá. Xem Analyst.

- eval: E12b
  run_id: tk-tuantu-E12b-20260920
  exit_code: 0
  verifier: config:executors.script.tk_khai_sinh_vua
  verified_at: 2026-09-20T07:21:16Z
  output: |
    -- CHUP CSDL TRUOC: 27 thoa thuan. Mot phep pha o day co CHU DICH
       vo hieu hoa phep tra lai (E5), nen chinh bo khai sinh phai tra CSDL ve nguyen trang.
    -- DA TRA 0 thoa thuan ve nguyen trang.  -- DA TAT may chu cua ban sao
    -- nhom vua: 5 phep pha:
       dat  E5   ma 1 · ghim CO · vang o luot lanh co
       dat  E7   ma 1 · ghim CO · vang o luot lanh co
       dat  E10a ma 1 · ghim CO · vang o luot lanh co
       dat  E9a  ma 2 · ghim CO · vang o luot lanh co
       dat  E10b ma 1 · ghim CO · vang o luot lanh co
    ket qua: 0 phep pha KHONG do duoc tren 5 (nhom vua; ca bang 24)
  # Nhóm này là nhóm bị công cụ giết ở 600 giây trong vòng 1; chạy tuần tự nó
  # mất 3583 giây và về trọn. Trả CSDL về nguyên trạng sau nhóm — kiểm được
  # bằng E5 chạy trước đó (0 bản ghi thật còn lệch).
  # Lệch bản khai: `expected` nói «4 phép phá vừa» — bản ghi có 5.

- eval: E12c
  run_id: tk-tuantu-E12c-20260920
  exit_code: 0
  verifier: config:executors.script.tk_khai_sinh_cham
  verified_at: 2026-09-20T07:31:00Z
  output: |
    -- NHOM CHAY: cham — 1/24 dot bien.
    -- LUOT LANH: 1 lenh rieng biet, chay MOT LAN, TRUOC khi pha bat cu gi.
    -- DA TRA 0 thoa thuan ve nguyen trang.  -- DA TAT may chu cua ban sao
    -- nhom cham: 1 phep pha:
       dat  E2   ma 1 · ghim CO · vang o luot lanh co
    ket qua: 0 phep pha KHONG do duoc tren 1 (nhom cham; ca bang 24)

- eval: E12d
  run_id: tk-tuantu-E12d-20260920
  exit_code: 0
  verifier: config:executors.script.tk_khai_sinh_dat
  verified_at: 2026-09-20T07:34:37Z
  output: |
    -- NHOM CHAY: dat — 1/24 dot bien.
    -- DA TRA 0 thoa thuan ve nguyen trang.  -- DA TAT may chu cua ban sao
    -- nhom dat: 1 phep pha:
       dat  E3   ma 1 · ghim CO · vang o luot lanh co
    ket qua: 0 phep pha KHONG do duoc tren 1 (nhom dat; ca bang 24)
  # Phép phá E3 dùng một bản sao cây riêng và chạy `bun run test` hai lần trong
  # đó — đúng mô tả «phép phá đắt nhất» của `expected`.

- eval: E13
  run_id: tk-tuantu-E13-20260920
  exit_code: 0
  verifier: config:executors.script.tk_ghim_lai_da_xong
  verified_at: 2026-09-20T07:34:38Z
  output: |
    -- Rut duong TU KHOI "paths:" (neo theo thut dau dong), khong quet ca tep.
       27 muc tho -> 14 duong rieng biet, KHONG loc bo muc nao.
    -- verified_commit hien tai: cc31d5bbe43ceb14fb939051061cd4757c999afa
    -- 14 duong trong paths eval, doc TU _acceptance/nen-chat-ai-elements/evals.yaml.
       con tuoi ** 1773 tep · dd9
       con tuoi .githooks/gate-shape.json 936ed3cdb609c6
       con tuoi _acceptance/nen-chat-ai-elements/rang/** 6 tep · d13703
       ... [14 dong, moi duong mot bam]
    ket qua: 0 duong hoa cu tren 14
  # Gọi tên từng đường kèm băm, không trả con số — đủ điều `expected` đòi ở
  # mức cốt lõi. Mẫu `**` (toàn kho) KHÔNG bị vứt thầm, đúng chỗ vòng 1 bắt.
  # Một khác biệt hình thức: `expected` nói «kèm HAI băm», mỗi dòng chỉ in MỘT
  # băm (khi tươi thì hai băm bằng nhau). Xem Analyst.

- eval: E14
  run_id: tk-tuantu-E14-20260920
  exit_code: 0
  verifier: config:executors.script.tk_bay_benh_cu_khong_quay_lai
  verified_at: 2026-09-20T07:34:38Z
  output: |
    -- BAY benh da va o hai vong truoc. Hang ghim 7, chep tay tu AC-13.
    -- Muc "## Known limits": doc tu TIEU DE dau dong, 21 dong.
    -- 7 benh:  [A · C · D · E · F · G · chot-ghim-cu — moi benh mot dau hieu, goi ten tep]
    -- 1 benh do bang QUAN HE:
       E do bang QUAN HE: ban lanh DO (1), ban khoi phuc benh XANH (0)
    -- 6 benh CHI do bang dau hieu, gioi han khai dich danh:
       A / C / D / F / G / chot-ghim-cu — moi cai mot ly do doc duoc
    ket qua: 0 cho hong (7 benh · 1 do quan he · 6 khai gioi han)
  # `expected` mở sẵn cửa này: «Bệnh nào không dựng được đột biến -> chân này
  # ĐỌC mục "## Known limits" của hợp đồng và khẳng định tên bệnh đó CÓ trong
  # mục ấy; không có tên thì chân ĐỎ. Im lặng là đường duy nhất bị cấm.»
  # Sáu bệnh đi đúng cửa đó, và hợp đồng tại sha `5b958a5c` có tên cả sáu.
  # Nói thẳng: AC-13 hứa BẢY quan hệ, bản ghi có MỘT (bệnh E). Sáu kia là
  # khẳng định đại diện. Điều này người ký đã nhận ở mục Known limits.

- eval: E15
  run_id: tk-tuantu-E15-20260920
  exit_code: 0
  verifier: config:executors.script.tk_chung_spec
  verified_at: 2026-09-20T07:34:39Z
  output: |
    chung.mjs: 10 khang dinh dat
  # Đây là TOÀN BỘ đầu ra của lệnh (tệp `tuantu-E15.out` dài 29 byte).
  # `expected` đòi khẳng định HAI chốt có tên: `ghim()` NÉM kèm tên hàng và cả
  # hai con số, và `chay()` NÉM khi lệnh không cho ra mã thoát. Bản ghi nói có
  # 10 khẳng định đạt nhưng KHÔNG gọi tên chốt nào, nên không đủ để kết luận
  # hai chốt ấy nằm trong mười. Thiếu dữ kiện: một dòng mỗi khẳng định, hoặc
  # ít nhất hai dòng gọi tên hai chốt. Chiều đỏ có chạy (phép phá `E15` ở E12a).

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: tk-tuantu-S1-20260920
  exit_code: 0
  verified_at: 2026-09-20T07:35:01Z
  # 297 pass · 0 fail · 986 expect() · 30 tệp. Tasks 11/11.

- cmd: bunx turbo run lint --force
  run_id: tk-tuantu-S2-20260920
  exit_code: 0
  verified_at: 2026-09-20T07:35:01Z
  # Checked 336 files, 3 warnings (noBarrelFile — cảnh báo, không chặn). Tasks 9/9.

- cmd: bun run lint:slop
  run_id: tk-tuantu-S3-20260920
  exit_code: 0
  verified_at: 2026-09-20T07:35:02Z
  # oxlint: 0 warnings, 0 errors trên 1071 tệp.

- cmd: bunx turbo run build --force
  run_id: tk-tuantu-S4-20260920
  exit_code: 0
  verified_at: 2026-09-20T07:35:17Z
  # Tasks 4/4, 0 cached (--force). Đây là lệnh cổng thứ năm thêm 07/09.

## Known limits

Chép từ `contract.md` (bốn mục). Hai mục cuối được người ký thêm SAU lượt chạy
này và chưa commit — xem Analyst.

- **sáu-bệnh-chỉ-đo-bằng-dấu-hiệu** — AC-13 hứa một QUAN HỆ: khôi phục bệnh rồi
  đòi bộ đo đỏ. Sau vòng chấm 3, chỉ bệnh **E** được đo bằng quan hệ thật. Sáu
  bệnh còn lại — **A, C, D, F, G, chốt-ghim-cũ** — chỉ được đo bằng «dấu hiệu
  cấu trúc còn trong tệp», tức một khẳng định đại diện. Năm trong sáu khai là
  giới hạn **chi phí**; riêng **C** là giới hạn **thật**: không phép đo nào
  trong kho phân biệt được «so DOM với giá trị về từ máy chủ» và «so DOM với
  một hằng gõ sẵn».
- **trần thước** — trần nhát sửa thước (thuoc-co-cua AC-12) được miễn cho vòng
  này theo quyết định của người ký 19/09, vì tiền đề của trần không đúng với
  một vòng mà sản phẩm CHÍNH LÀ thước. Cái mất: vòng này không còn chuông báo
  trôi thước, nên nếu máy thật sự trôi thì phải do người đọc diff bắt.
- **E1-và-E10-tựa-thước-hồ-sơ-đã-đóng** — hai ô này chạy lại
  `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs` nguyên trạng.
  Thước ấy mở trang bằng `waitUntil: "networkidle0"`, mà `next dev` giữ kết nối
  HMR nên mạng không bao giờ «im» — `page.goto` treo tới 120 giây rồi ném. Lối
  không-chạm (`next build && next start`) đã thử và hỏng vì `canh-cay.mjs` của
  một hồ sơ đã ký THỨ HAI luôn thoát 2. Cái mất: hai tiêu chí AC-1 và AC-9
  không có một lượt đo máy đáng tin giữa hai chữ ký. Mọi ô khác của vòng xanh
  trong lượt tuần tự 20/09 (19/21 lệnh, 0/24 phép phá lọt, 4 suite xanh).
- **chiều-đỏ-của-nhánh-glob-chưa-chạy** — bản vá `docDuong()` (commit `cc31d5bb`)
  đã chạy chiều LÀNH trong lượt tuần tự (E7 mã 0, 441 giây) nhưng chiều ĐỎ thì
  chưa; chứng nó đòi ba lượt `ban-khai-khop`, ~10 phút mỗi lượt. Cái mất: hai ca
  mới (`git ls-files` trả rỗng khi pathspec không khớp; `readFileSync` hỏng giữa
  danh sách glob) chỉ được kiểm bằng đọc mã.

## Ngoài hợp đồng

Phát hiện của lượt chấm này, không thuộc mười ba tiêu chí. Để lại cho Cổng Bằng
chứng quyết, không tự sửa.

1. **E1 là lệnh DUY NHẤT chạm cây, và nó chạy ĐẦU TIÊN.** `cay_doi: CO`, thoát
   mã 2 sau 688 giây. Bản ghi KHÔNG nói byte nào đổi. Cả 20 lệnh sau đó chạy
   trên một cây E1 đã sửa — kể cả E10, mà vế (b) của nó đếm «61 tệp đổi so với
   `32491c87`, KỂ CẢ thay đổi chưa commit và tệp chưa theo dõi». Giao với 11 tệp
   sản phẩm là RỖNG nên lời hứa vẫn đứng, nhưng danh tính của vết thì không có
   trong hồ sơ. E3 có ghi `git status --porcelain` trước/sau cho chính nó; E1
   không có phép tương đương.
2. **Lượt tuần tự không có mặt trong `run-log.jsonl`.** Cả 36 dòng của tệp đó
   đều là `round: 1` tại sha `6064ca69`. Không một dòng máy tính nào ở
   `5b958a5c`. Hệ quả: mọi `run_id` trong báo cáo này là mã TỰ ĐẶT, và báo cáo
   không đối chiếu được với sổ chạy — phép đối chiếu mà hook và CI re-check thi
   hành cho một báo cáo PASS.
3. **Bản khai E12 lệch bản thật** (vòng 1 đã ghi nhận ở mức low; xác nhận lại
   độc lập). Khối `expected` dùng chung của E12a-d nói «**Ba** nhóm cộng lại phủ
   đủ **21** phép phá»; E12a nói «**15** phép phá rẻ»; E12b nói «**4** phép phá
   vừa». Bản ghi: **bốn** nhóm, **24** phép phá (17 · 5 · 1 · 1). Chiều lệch an
   toàn (phủ nhiều hơn khai), nhưng phép tính của AC-11 cũng không đứng: tệp
   `evals.yaml` có **17** mệnh đề «Cặp hai chiều», bản ghi có 24 phép phá.
4. **Bốn ô E12a-d dùng chung MỘT phép phá.** Ánh xạ in ra `E12a <- E12`,
   `E12b <- E12`, `E12c <- E12`, `E12d <- E12`. Luật «mỗi eval ≥ 1 phép phá»
   đạt, nhưng bốn ô nhóm cộng lại chỉ có một phép phá — đúng hình dạng mà chính
   AC-11 cảnh báo, chỉ lùi lên một tầng.
5. **`expected` của E8 đòi HAI vị trí phá, bảng có MỘT.** «(i) thêm một dòng nhập
   ngược chiều vào `packages/ui/src`; (ii) vào `packages/ui/test`» — ánh xạ chỉ
   có `E8 <- E8`, và bản ghi không nói phép phá ấy đặt ở vị trí nào. So sánh:
   E4 có ba phép phá cho hai vị trí của nó.
6. **Mục `## Known limits` của hợp đồng tự mâu thuẫn.** Sau bốn mục thật và sau
   đoạn kết, dòng cuối vẫn là placeholder «(chưa có mục nào — mọi dòng trong
   bảng mười ba đều phải có phép đo…)». Một dòng nói mục rỗng, nằm dưới bốn mục
   đã điền. E14 đọc đúng mục này.

## Analyst

### Xác minh mục Known limits `E1-và-E10-tựa-thước-hồ-sơ-đã-đóng`

Nhiệm vụ là kiểm mục này có MÔ TẢ ĐÚNG cái bản ghi cho thấy không. Bốn điểm
khớp chính xác, bốn điểm lệch.

**Khớp chính xác — kiểm bằng chính bản ghi:**

- «19/21 lệnh» — đếm được 21 khối `=====`, 19 dòng `ma_thoat: 0`. Khớp.
- «0/24 phép phá lọt» — 17+5+1+1 = 24, mọi mục «đạt», bốn dòng kết đều «0 phép
  phá KHÔNG đo được». Khớp.
- «4 suite xanh» — S1..S4 đều mã 0. Khớp.
- «E10 có 8/9 chân con xanh ở lượt đỏ» — bản ghi có đúng 8 dòng `xanh` và 1 dòng
  `DO`. Khớp.
- «`page.goto` treo tới 120 giây rồi ném» — `TimeoutError: Navigation timeout of
  120000 ms exceeded`, ngăn xếp kết ở `page.goto`. Khớp.

**Lệch 1 — mục này NÓI QUÁ về AC-9, và nói quá theo hướng bất lợi cho chính
vòng.** Câu «hai tiêu chí AC-1 và AC-9 không có một lượt đo máy đáng tin giữa
hai chữ ký» gộp hai thứ rất khác nhau:

- AC-1 (E1): đúng là không có gì. Chân dừng ở TIỀN ĐỀ, sinh ra ZERO khẳng định
  trong bảng chuỗi ghim.
- AC-9 (E10): **không đúng**. Vế (b) — lời hứa trung tâm của cả vòng, «thước đổi
  mà sản phẩm không đổi» — chạy TRỌN VẸN và XANH: 61 tệp đổi so với `32491c87`
  kể cả chưa commit và chưa theo dõi, giao với 11 tệp sản phẩm là RỖNG, và
  khoảng diff KHÔNG rỗng nên khẳng định có đối chứng (đúng chỗ vòng chấm 3 bắt).
  Vế (a) đỏ đúng 1/9 chân, với «bằng chứng: 0 chỗ lệch trên 8 mục».

Viết gộp một câu, mục này mời người ký gạch bỏ một bằng chứng đang có. Cách viết
khớp bản ghi: *AC-1 không có lượt đo nào; AC-9 có vế (b) xanh trọn và vế (a)
8/9.*

**Lệch 2 — «chập chờn» đúng cho E1, KHÔNG đúng cho E10.** Đối chiếu hai lượt đã
ghi trong `run-log.jsonl` và báo cáo vòng 1:

| ô | vòng 1 (`6064ca69`, song song) | lượt tuần tự (`5b958a5c`) |
|---|---|---|
| E1 | mã 0 — «0 chuỗi ghim KHÔNG phân biệt được trên 14» | mã 2 — không đo được |
| E10 | mã 1 — `DO [ho-so-cu-do:hoi-quy-nam-cho] ma thoat 1`, 8 xanh | mã 1 — **cùng chân, cùng thông điệp, 8 xanh** |

E1 thật sự chập chờn: xanh một lượt, đỏ một lượt. E10 **đỏ ở cả hai lượt đã
ghi, cùng một chân, cùng một thông điệp** — 0/2. Gọi chung cả hai là «chập chờn»
khiến người ký chờ một lần chạy lại sẽ xanh; bản ghi không đỡ kỳ vọng đó cho E10.

Hệ quả kèm theo: AC-1 **có** một lượt đo máy xanh trong vòng này, ở vòng 1 tại
`6064ca69`. Hai commit ngăn cách (`cc31d5bb` sửa nhánh glob của E7, `5b958a5c`
ghim lại nen-chat) không chạm chủ đề của `ghim-phan-biet`. Giới hạn chính xác là
«không có lượt xanh TẠI sha đã ghim», không phải «không có lượt đo nào».

**Lệch 3 — cơ chế `waitUntil: "networkidle0"` KHÔNG có trong bản ghi.** Bản ghi
chỉ cho thấy triệu chứng: timeout 120000 ms trong `page.goto`. Con số 120000 (so
với mặc định 30 giây của puppeteer) có cho thấy một timeout đặt tay, và vị trí
`nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs:146` có đặt chỗ treo vào đúng
hồ sơ đã đóng — nên **hệ quả** (vá nghĩa là mở lại một hồ sơ đã ký) thì bản ghi
đỡ được. Riêng chiến lược chờ thì không: nó được khai ở `decisions.jsonl`
(`d-20260920T082109Z-13`), tức một bản khai thứ hai, không phải một phép đo.

**Lệch 4 — «hai ô này chạy lại `nhan-…/khai-tieng.mjs`» là nói tắt.** Cái E1 và
E10 gọi là `_acceptance/ho-so-khai-dung-tieng/rang/hoi-quy-nam-cho.mjs` — bản ghi
in nguyên văn dòng lệnh đó, và E10 gọi tên chân đỏ là `[ho-so-cu-do:hoi-quy-nam-cho]`.
Tệp của hồ sơ đã đóng được với tới TỪ BÊN TRONG nó. Khác biệt có giá: người đọc
câu hiện tại sẽ kết luận chỗ vá nằm trọn trong hồ sơ đã đóng, trong khi script
gọi thì nằm ở hồ sơ đang mở.

### Xác minh mục `sáu-bệnh-chỉ-đo-bằng-dấu-hiệu`

Phần lõi khớp tuyệt đối: đúng 1 bệnh (**E**) đo bằng quan hệ, đúng 6 bệnh
(**A, C, D, F, G, chốt-ghim-cũ**) đo bằng dấu hiệu, mỗi cái một lý do đọc được,
và **C** được chính chân đo tuyên là giới hạn thật («Day la gioi han that, khong
phai gioi han chi phi»).

**Lệch: «Năm trong sáu là giới hạn chi phí» — bản ghi cho thấy BỐN.** Lý do E14
in ra: A «vượt trần 600 giây», F «cần máy chủ dev và vài phút», G «cần một lượt
pha-thu đầy đủ», chốt-ghim-cũ «vài phút và cần máy chủ dev» — bốn cái nói chi
phí. C là giới hạn thật. **D thì không nói chi phí một chữ nào**: «Chỗ bắt phải
là một vật thử có enrichment RỖNG mà khối Giới thiệu VẪN về — dùng một fixture
thứ hai chưa có trong tập dữ liệu thử.» Đó là thiếu **vật liệu**, không phải
thiếu thời gian — và là cái duy nhất trong sáu vừa không đắt vừa không bất khả.
Nếu người ký muốn thu hẹp giới hạn này bằng một nhát rẻ, D là chỗ duy nhất.

### Xác minh mục `chiều-đỏ-của-nhánh-glob-chưa-chạy`

«E7 mã 0, 441 giây» khớp chính xác. Một làm rõ để không bị đọc quá: ánh xạ của
E12a có `E7 <- E7`, nên E7 **có** một chiều đỏ đã chạy — cái chưa chạy là chiều
đỏ cho hai ca MỚI của nhánh glob vá ở `cc31d5bb`. Câu «chiều đỏ thì chưa» đọc
trơ dễ thành «E7 không có chiều đỏ nào».

### Ghi chú khác

- **Hợp đồng đã sửa SAU lượt chạy và chưa commit.** Tại `5b958a5c`, mục Known
  limits chỉ có HAI mục; hai mục `E1-và-E10-…` và `chiều-đỏ-…` là thay đổi chưa
  commit trong cây. E14 đọc mục này lúc chạy («21 dòng») nên màu xanh của E14
  chứng cho văn bản CŨ. Sáu tên bệnh vẫn còn nguyên trong mục
  `sáu-bệnh-chỉ-đo-bằng-dấu-hiệu` nên nhiều khả năng E14 vẫn xanh trên văn bản
  mới, nhưng điều đó chưa được đo. `pre-merge-check.sh` không bắt (tệp nằm trong
  `_acceptance/`).
- **E13 in MỘT băm mỗi đường, `expected` nói «kèm hai băm».** Tiêu đề khối ghi
  «Từng đường, kèm băm trước/sau» nhưng mỗi dòng chỉ có một giá trị. Khi tươi
  thì hai băm bằng nhau nên in một là hợp lý, và điều AC-12 thật sự hỏi («bằng
  chứng của hồ sơ đã ký còn tươi không») được trả lời bằng 14 đường gọi tên kèm
  băm cộng `verified_commit` tường minh. Chấm PASS, ghi lệch hình thức ở đây chứ
  không nâng thành UNCERTAIN.
- **Lượt chạy thật sự tuần tự — kiểm được.** Tổng 21 giá trị `giay` = 8326 giây,
  bằng ĐÚNG khoảng `05:16:31Z → 07:35:17Z`. Không một giây chồng lấn. Đây là
  điều vòng 1 thiếu và là lý do lượt này tồn tại.
- **Không có ô nào đỏ mà thiếu giới hạn khai.** E1 và E10 là hai ô đỏ duy nhất,
  và cả hai có tên trong mục `E1-và-E10-tựa-thước-hồ-sơ-đã-đóng`. Vì vậy verdict
  là `PENDING-JUDGMENT`, không phải `REJECT`.

# Non-discriminating evals
E9 (`bun run check-types`) — vòng 1 ghi trong khối baseline của `run-log.jsonl`:
`non_discriminating: [{cmd: "bun run check-types", evals: ["E9"]}]`. Ở lượt này
nó còn xanh bằng cache turbo (13/13 cache hit, 38ms), không có lượt `tsc` nào
chạy. Chiều đỏ của nó có thật (phép phá `E9a` ở E12b), và vế quan hệ của AC-8
do E8 gánh bằng `tsc --listFiles`.

## Variance

E1 là ô duy nhất đổi kết quả giữa hai lượt đã ghi: mã 0 ở vòng 1 (`6064ca69`),
mã 2 ở lượt tuần tự (`5b958a5c`) — `pass_rate: 1/2`, đánh dấu **flaky**, gốc là
`page.goto` treo trong thước của hồ sơ đã đóng. E10 KHÔNG variance: đỏ 2/2 lượt,
cùng chân, cùng thông điệp. Không ô nào khác chạy nhiều lượt.

## Iterations

Vòng 1 (song song, `6064ca69`): BLOCKED — `E12b` bị công cụ giết ở 600 giây, cộng
E3/E10/E12a/E13 đỏ vì các chân đo chồng lên nhau.
Vòng 2 (tuần tự, `5b958a5c`): 19/21 lệnh mã 0; E1 và E10 đỏ, cả hai có mục Known
limits gọi đúng tên; E4, E15 và ô hội đồng E11 để UNCERTAIN cho người ký.
