---
schema_version: 2
feature_slug: cai-dat-con-lai-noi-tieng-viet
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent (chay tuan tu — dieu khoan CLASSIFIER-FALLBACK)
enforcement_mode: strict
bypass_used: false
verified_commit: 296564f2aef813e016177f34a049779a46871c27
human_signoff:
---

# Evidence Report: cai-dat-con-lai-noi-tieng-viet

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-1b | script | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-5 | script | PASS |
| E7 | AC-5b | script | PASS |
| E8 | AC-6 | script | PASS |
| E9 | AC-6b | script | PASS |
| E10 | AC-7 | script | PASS |
| E11 | AC-8 | script | PASS |
| E12 | AC-9 | script | PASS |
| E13 | AC-10 | script | PASS |
| E14 | AC-10b | script | PASS |
| E15 | AC-11 | script | PASS |
| E16 | AC-12 | script | PASS |
| E17 | AC-13 | script | PASS |
| E18 | AC-1 | test | PASS |
| E19 | AC-1 | judgment | PASS |

## Evidence

- eval: E1
  run_id: s4r7-20260905T122152Z-16596-E1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cd2_hai_tieng
  verified_at: 2026-09-05T12:21:52Z
  output: |
    ket qua: route do duoc 9/9 (thu muc sinh ra 12, tru 2 route dot mot) · 268 cap doi chieu · ngoai lat (gioi han da khai)=8 · mien dau=1 · mien tru chet=0 · hong=0

- eval: E2
  run_id: s4r7-20260905T122152Z-16596-E2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cd2_chu_cung_jsx
  verified_at: 2026-09-05T12:21:52Z
  output: |
    ket qua: 33 file .tsx tren dia, tru 0 loai tru co ten, cong 1 khai them = 34 file quet.
    0 chuoi khoa cung ngoai 3 dong mien tru, va ca 3 dong deu con doi tuong that.

- eval: E3
  run_id: s4r7-20260905T122152Z-16596-E3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cd2_toast
  verified_at: 2026-09-05T12:21:52Z
  output: |
    XANH: khong loi goi toast nao con mang chu tieng Anh viet thang.

- eval: E4
  run_id: s4r7-20260905T122152Z-16596-E4
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cd2_tieu_de
  verified_at: 2026-09-05T12:21:52Z
  output: |
    XANH: ca 7 o nhan deu doc tu kho chuoi.

- eval: E5
  run_id: s4r7-20260905T122152Z-16596-E5
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cd2_khong_du_quyen
  verified_at: 2026-09-05T12:21:52Z
  output: |
    apps/.../slack-channels.tsx · canInviteItself === false — ma sinh ra 3 khoa, ban khai co 3
    XANH: ca 4 o deu con nut doc dung khoa, va ban tieng Viet co dau.

- eval: E6
  run_id: s4r7-20260905T122152Z-16596-E6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cd2_trang_thai_rong
  verified_at: 2026-09-05T12:21:52Z
  output: |
    ket qua: dung duoc=3 · khong dung duoc=3 · o dung duoc ma khong co dau tieng Viet=0 · o do duoc ma man hien sai=0
    GIOI HAN DA KHAI: 3/6 o khong dung duoc tren may nay (ly do o tren) — danh sach mang sang cong ky.

- eval: E7
  run_id: s4r7-20260905T122152Z-16596-E7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cd2_oauth
  verified_at: 2026-09-05T12:21:52Z
  output: |
    ket qua: quan sat tren man=2 + do muc ma=10 + khai khong ton tai=8 = 20 · doi 20 · o hong=0

- eval: E8
  run_id: s4r7-20260905T122152Z-16596-E8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cd2_khong_dich
  verified_at: 2026-09-05T12:21:52Z
  output: |
    ket qua: thieu dong=0 · thua gia tri=0 · thieu thuoc tinh=0 · ngoai lat (gioi han da khai)=8
    mien tru chet=0 · route khong do duoc=0 · route lech do dai hai luot=0

- eval: E9
  run_id: s4r7-20260905T122152Z-16596-E9
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cd2_du_lieu_nguoi_nhap
  verified_at: 2026-09-05T12:21:52Z
  output: |
    co   translate="no" — /settings/tracking ... = "onehub.vn"
    co   translate="no" — /settings/members ... = "manh.phan@onemount.com"
    ket qua: chan ma thieu thuoc tinh=0 · truong chua ghim bieu thuc=0 · chan man thieu thuoc tinh=0

- eval: E10
  run_id: s4r7-20260905T122152Z-16596-E10
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cd2_dot_bien
  verified_at: 2026-09-05T12:21:52Z
  output: |
    vet "sua ten thuoc tinh trong trackingSnippet cua packages/db (WRITER that)" -> do boi: doan-ma-chep
    cay lam viec da tro ve dung trang thai truoc khi chay.
    XANH: ca 11 vet deu bi it nhat mot chan bat, va cay lanh thi ca 6 chan deu xanh.

- eval: E11
  run_id: s4r7-20260905T122152Z-16596-E11
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cd2_khai_sinh
  verified_at: 2026-09-05T12:21:52Z
  output: |
    XANH: 34 file, ba chan doc bang nhau; 23 loi goi toast va 7 o tieu de, khop bang khai.

- eval: E12
  run_id: s4r7-20260905T122152Z-16596-E12
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cd2_dan_so_tu_dia
  verified_at: 2026-09-05T12:21:52Z
  output: |
    neo: 33/33 file — khop · neo: 10/10 route — khop · neo: 9/9 file mang /canManage/ — khop
    chieu xanh: ca hai chan xanh tren cay lanh truoc khi tha file thu.
    XANH: dan so tu thay file moi, va ca hai chan deu do vi no.

- eval: E13
  run_id: s4r7-20260905T122152Z-16596-E13
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cd2_be_rong
  verified_at: 2026-09-05T12:21:52Z
  output: |
    ket qua 360px: 146 nhan dich duoc tren 9/9 route · vi tran ma en vua=0 · tran ca hai luot=0 · en tran ma vi vua=0

- eval: E14
  run_id: s4r7-20260905T122152Z-16596-E14
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cd2_be_rong_do
  verified_at: 2026-09-05T12:21:52Z
  output: |
    cay lam viec da tro ve dung trang thai truoc khi chay.
    XANH: chan be-rong do dung chieu — 1 nhan tran o luot vi trong khi luot en vua, tai 360px.

- eval: E15
  run_id: s4r7-20260905T122152Z-16596-E15
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cd2_moi_chuoi
  verified_at: 2026-09-05T12:21:52Z
  output: |
    quet 34 file · 55 chuoi nguoi co the doc · tru 31/31 dong giu nguyen co ten
    XANH: khong chuoi nguoi doc thay nao con la tieng Anh.

- eval: E16
  run_id: s4r7-20260905T122152Z-16596-E16
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cd2_doan_ma_chep
  verified_at: 2026-09-05T12:21:52Z
  output: |
    neo: 5/5 file co vat chep — khop
    khop tung byte voi NGUON NGOAI MAN (tracking.settings) — the script theo doi (lang=vi)
    doi chieu HAI CHIEU bang <-> man: 3 da do · 3 khai khong do · 0 khong ai do
    GIOI HAN DA KHAI: 3 vat khong do duoc tren may nay — 6 vat do duoc deu khop tung byte.

- eval: E17
  run_id: s4r7-20260905T122152Z-16596-E17
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cd2_mot_bo_thuoc
  verified_at: 2026-09-05T12:21:52Z
  output: |
    ve 1: 12 file .mjs/.sh cua dot mot va 4 cua lat nay — 0 khoi trung tu 12 dong tro len.
    XANH: mot bo thuoc, khong ban chep nao troi; 4 mui goi cua dot mot chay khong tham so van dung con so da ky.

- eval: E18
  run_id: s4r7-20260905T122152Z-16596-E18
  exit_code: 0
  baseline: green
  verifier: config:executors.test.rang3_khoa_chet
  verified_at: 2026-09-05T12:21:52Z
  output: |
    Ran 42 tests across 1 file. 42 pass, 0 fail.

- eval: E19
  judged_by: judge panel (fresh context, 3 lens)
  verdict: PASS
  run_id: s4r7-20260905T122152Z-16596-E19
  verified_at: 2026-09-05T12:21:52Z
  rationale: |
    Nam kho chuoi doc nhu tieng Viet cua nguoi lam nghe: cum danh tu dao dung trat tu
    Viet, danh tu theo CONTEXT.md (cong ty · ca nhan · thoa thuan), thuat ngu ky thuat
    giu ten that. Vong truoc mot phieu cham truot vi doc trung cua so dot bien cua chan
    be-rong; vet do nay la mot cum tieng Viet co dau doc duoc.

### Lenh suite (hoi quy)

- cmd: bun run db:test && bunx turbo run test --force --concurrency=1
  run_id: s4r7-20260905T122152Z-16596-S1
  exit_code: 0
  verified_at: 2026-09-05T12:21:52Z

- cmd: bunx turbo run check-types --force
  run_id: s4r7-20260905T122152Z-16596-S2
  exit_code: 0
  verified_at: 2026-09-05T12:21:52Z

- cmd: bunx turbo run lint --force
  run_id: s4r7-20260905T122152Z-16596-S3
  exit_code: 0
  verified_at: 2026-09-05T12:21:52Z

- cmd: bun run lint:slop
  run_id: s4r7-20260905T122152Z-16596-S4
  exit_code: 0
  verified_at: 2026-09-05T12:21:52Z

## Known limits

- **Tam voi cua may do nay.** Tai khoan do la thanh vien, Slack chua cam, bang SSO rong.
  Ba trong sau trang thai rong va ba trong sau vat khach chep khong dung duoc; chung
  duoc GOI TEN kem ly do trong output, khong bi ha xuong doc ma roi ghi dat.
- **Ve "thay chu tren man" cua AC-5b khong phai mot quan he.** No gom chu bon man ket noi
  o trang thai song hien tai vao mot tap phang roi hoi "chuoi nay co nam dau do khong";
  no khong dung trang thai nao. No co ten, khai trong hop dong.
- **Bon chan man chua co doi chung duong trong bo dot bien** (hai-tieng · oauth ·
  khong-dich · du-lieu-nguoi-nhap). Ba trong bon da chung bang tay ngay 05/09.
- **Bo test cua kho chi xanh khi chay TUAN TU.** Chay song song thi api:test do bat dinh
  vi cac goi dung chung mot co so du lieu thu — chay rieng api:test cho 385 pass, 0 fail.
  Vong nay khong cham file nao duoi apps/api. Day la net moi truong co san cua kho.
- **channel-picker.tsx la component dung chung** ma nay doc kho chuoi cua khu vuc Cai dat;
  chu tren man agent-builder theo kho do. Tach kho rieng la viec cua dot agent-builder.
- **Lenh moi bot Slack `/invite @Comp AI` van go cung** trong ma, trong khi chu quanh no
  da doi sang OneHub. Ten app Slack that khong suy duoc tu kho.
- **Danh muc them ket noi so bang chuoi hien thi da dich** (`add-connection-dialog.tsx`):
  hom nay dung vi ten thuong hieu giu nguyen o ca hai tieng, nhung Viet hoa mot ten trong
  bang `ten` thi hop thoai hien lai ket noi da cam nhu chua cam. Vong nay lam cho phep so
  do phu thuoc locale.

## Ngoai hop dong

Muoi mot phat hien cua luot soi ma, tat ca duoc phan loai NGOAI hop dong (chin
known-limits, hai wont-fix). Chi tiet o `review-findings.md`. Ba cho dang chu y nhat da
ghi thanh giới hạn o muc tren; phan con lai la net quy uoc (cn() boc mot chuoi tinh,
kho chuoi moi bo fallback locale cua kho dung chung, enum vai tro suy tu kho chuoi).

## Analyst

Sau eval xanh tren CA HAI cay (khong phan biet duoc tinh nang): E2, E3, E4, E5, E11,
E12, E15, E18 — chung la luoi hoi quy cua dot mot, dung nhu thiet ke. Muoi eval con lai
do tren cay goc (E1, E6, E7, E8, E9, E10, E13, E14, E16, E17).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: PASS. Sau vong chay fan-out bi bo phan loai giet agent hai lan lien tiep,
luot nay di duong verify TUAN TU theo dieu khoan CLASSIFIER-FALLBACK: mot phien tuoi
chay lan luot 19 eval va 4 lenh suite, tat ca deu xanh.
