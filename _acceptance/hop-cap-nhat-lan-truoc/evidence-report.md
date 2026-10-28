---
schema_version: 2
feature_slug: hop-cap-nhat-lan-truoc
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 392f29497d28218340519359e23bad3a9f7fe4a3
human_signoff: Phan Le Manh 2026-10-23 — ký Cổng Bằng chứng trên vòng chấm 2 (PASS, 7 eval, 7 suite xanh; vòng 1 PASS nhưng sửa ba thước trong hợp đồng AC-1, AC-4, AC-7); 6 mục ngoài hợp đồng ghi Known limits
---

# Evidence Report: hop-cap-nhat-lan-truoc

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-hop-cap-nhat-lan-truoc-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hct_khoi
  verified_at: 2026-10-23T10:11:51Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-cap-nhat-lan-truoc.dom.tsx -t hct-khoi
    Ran 1 test across 1 file. [1246.00ms]

- eval: E2
  run_id: minted-hop-cap-nhat-lan-truoc-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hct_rong
  verified_at: 2026-10-23T10:11:51Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-cap-nhat-lan-truoc.dom.tsx -t hct-rong
    Ran 1 test across 1 file. [1129.00ms]

- eval: E3
  run_id: minted-hop-cap-nhat-lan-truoc-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hct_api_moi_nhat
  verified_at: 2026-10-23T09:43:06Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-hop-cap-nhat-lan-truoc-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hct_sau_gui
  verified_at: 2026-10-23T10:11:51Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-cap-nhat-lan-truoc.dom.tsx -t hct-sau-gui
    Ran 1 test across 1 file. [1188.00ms]

- eval: E5
  run_id: minted-hop-cap-nhat-lan-truoc-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hct_goi_y
  verified_at: 2026-10-23T10:11:51Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-cap-nhat-lan-truoc.dom.tsx -t hct-goi-y
    Ran 1 test across 1 file. [1224.00ms]

- eval: E6
  run_id: minted-hop-cap-nhat-lan-truoc-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hct_tai
  verified_at: 2026-10-23T10:11:51Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-cap-nhat-lan-truoc.dom.tsx -t hct-tai
    Ran 1 test across 1 file. [1212.00ms]

- eval: E7
  run_id: minted-hop-cap-nhat-lan-truoc-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hct_man
  verified_at: 2026-10-23T10:11:51Z
  screenshot: evidence/E7-step1.png
  observed: |
    hct-1440.png (dark theme): hop dialog «Cập nhật KR» mo, tieu de phu «Đối tác hàng lạnh mới đạt 10». Dau than co khoi «Lần cập nhật trước · 23/10, 17:12» voi dong «11 đối tác» + cham cam + nhan «Vừa»; ghi chu 200 ky tu (chuoi lien khong khoang trang 40 ky tu dau «Hopdongkhungvoidoitacphiabacdaduyetxongx» roi xuong dong tron trong khoi, 5 dong, ket thuc «gửi bản cuố»), nam gon trong vien khoi, khong bi cat/tran ra ngoai vien hop. Ngay duoi: o Giá trị (11 đối tác), bieu do, nhom Mức tự tin (Cao/Vừa/Thấp, «Lần trước: vừa»), o Ghi chú voi placeholder, dong ba cau goi y («Điều ghi lần trước đã xong chưa? · Đang vướng gì, cần ai giúp? · Tuần tới làm gì?»), nut Huỷ và «Gửi cập nhật» thay ro o cuoi hop. hct-375.png: cung noi dung o khoi 375px — khoi «Lần cập nhật trước · 23/10, 17:12», «11 đối tác ● Vừa», ghi chu 200 ky tu xuong dong tron (chuoi 40 ky tu bi bẻ dong «Hopdongkhungvoidoitacphiabacdaduyetxon / gxchờ…»), khong tran ngang; o Ghi chu + ba cau goi y ngay duoi; nut «Gửi cập nhật» full-width thay duoc o day anh trong khung nhin (phan dau hop bi cuon len do cuon de nut vao khung nhin, dung theo steps). Khop Expected o ca hai anh; ban do in DUNG cho (21 DUNG, 0 SAI).
  network_observed: n-a (driver)
  output: |
    Lenh: bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/hop-cap-nhat-lan-truoc/rang/man.mjs". Phien do rieng crm_suspicious_matsumoto_c64c22_do, app :4887, api :4619 (khong dung 3000/3001); okr:mau nap xong, ghi ca M=mau-okr-mt-q4-kd-nam-1 K=mau-okr-kr-q4-kd-nam-1-k1 ghi chu 200 ky tu.
    KET LUAN: 21 DUNG, 0 SAI. Assertion o moi kho 1440 va 375: khoi lan truoc co ghi chu; ghi chu 200 ky tu nguyen van; khong bi dich; hop khong tran ngang; khoi va ghi chu trong mep hop; doi chung (chen khoi rong 4000px) lam hop va khoi tran = bat duoc; ba cau goi y; trang khong cuon ngang; doi chung trang tran bat duoc; nut gui trong khung nhin; cong them 'DUNG du 2 anh'.
    Frame da luu: evidence/hct-1440.png, hct-375.png (tu man.mjs), E7-step1.png (=hct-1440), E7-step2.png (=hct-375), log E7-run.log. Port 4887/4619 khong con listen sau khi xong. Network: driver la script bun (khong co tool doc network) -> n-a (driver); ghi vao E7-network.txt.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-hop-cap-nhat-lan-truoc-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-23T10:11:51Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-hop-cap-nhat-lan-truoc-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-23T10:11:51Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-hop-cap-nhat-lan-truoc-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-23T10:11:51Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-hop-cap-nhat-lan-truoc-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-23T10:11:51Z

- cmd: bunx turbo run lint --force
  run_id: minted-hop-cap-nhat-lan-truoc-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-23T10:11:51Z

- cmd: bun run lint:slop
  run_id: minted-hop-cap-nhat-lan-truoc-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-23T10:11:51Z

- cmd: bunx turbo run build --force
  run_id: minted-hop-cap-nhat-lan-truoc-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-23T10:11:51Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay. Field baseline cua tung eval ghi n-a (round nay khong do). Eval khong-phan-biet: none. Lenh suite xanh o ca hai phia la regression-guard binh thuong, khong liet ke.

## Variance

none — moi eval chay mot lan, deterministic, khong co pass_rate hon hop.

## Iterations

Round 1: E3 chay va dat (run_id minted-hop-cap-nhat-lan-truoc-E3-r1); S4 vong 1 chi ra ba cho yeu cua thuoc E7, sua o commit 67ebfce94. Returned to implementation.
Round 2: E1, E2, E4, E5, E6, E7 chay lai tren verified_commit, tat ca dat; E3 mang sang tu round 1 (delta khong cham paths cua eval); bay lenh suite xanh. Moc verified_at cua cac eval chay round 2 la gio tong hop bao cao (xap xi); gio chinh xac nam trong run-log.jsonl.


### Re-pin lần 1 — 2026-10-28, do HT5 cam-xuc-tren-cap-nhat đổi thước (V3-59..67) và hai trường mới checkInId, camXuc trên Họp tuần, Cập nhật gần đây, diễn biến
run_id: repin-20261027T235917Z-18758
sha: 392f29497d28218340519359e23bad3a9f7fe4a3 · suites: 7 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng · ngoài làn máy: E7 · AC không có chốt máy: AC-7 · chập chờn (đỏ lần đầu, đạt khi chạy lại): suite 1/7 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
