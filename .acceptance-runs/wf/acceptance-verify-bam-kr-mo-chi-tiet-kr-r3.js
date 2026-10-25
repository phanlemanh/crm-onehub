export const meta = {
  name: 'acceptance-verify',
  description: 'S4 VERIFY cua /feature-loop: machine evals (dedupe cmd) + judge panel + review, sinh evidence-report.md',
  whenToUse: 'Goi tu skill feature-loop khi contract status=implemented. args do skill chuan bi (xem comment dau file).',
  phases: [
    { title: 'Machine', detail: 'moi lenh distinct 1 agent + verify suite' },
    { title: 'Judge', detail: '3 blind judges / judgment item' },
    { title: 'Review', detail: 'invariants + code-review, adversarial verify' },
    { title: 'Synthesize', detail: 'viet evidence-report.md + verdict routing' },
  ],
}

args = {
  "generated_at": "2026-10-25T04:32:56Z",
  "generated_sha": "51403986a1bca580e5b9c371d02bc34a67289bfa",
  "mainBranchInfo": {
    "branch": "onehub",
    "source": "remote"
  },
  "slug": "bam-kr-mo-chi-tiet-kr",
  "round": 3,
  "riskTier": "T2",
  "evals": [
    {
      "id": "E1",
      "criterion": "AC-1",
      "cmd": "cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/bam-kr-mo-chi-tiet-kr.dom.tsx -t bkr-kr-phu-trach",
      "expected": "Ca «bkr-kr-phu-trach»: PhanKrPhuTrach thật trong DOM, nuqs adapter thử, dữ liệu parse bằng khuôn thật của thủ tục mà\nthành phần gọi; ma trận viết trước 2 KR (K1 của mục tiêu O1, K2 của O2) = 2 ô: bấm nút tên Ki → giá trị record cuối\nbằng `kr:<Ki>` và không chứa `objective:`. Đếm ô = 2. Đối chứng dương: chưa bấm → record rỗng.\nCHIEU DO (bản sao): trả lại openRecord({kind:\"objective\"}) → đỏ «bkr-kr-phu-trach: K1 mo objective:O1, can kr:K1».",
      "executor": "test",
      "expectedExit": 0,
      "paths": [
        "apps/app/app/(app)/[slug]/okr/phan-kr-phu-trach.tsx",
        "apps/app/test/bam-kr-mo-chi-tiet-kr.dom.tsx"
      ],
      "evidence_required": [
        "run_id",
        "exit_code",
        "verifier",
        "verified_at",
        "output"
      ],
      "ref": "config:executors.test.bkr_kr_phu_trach"
    },
    {
      "id": "E2",
      "criterion": "AC-2",
      "cmd": "cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/bam-kr-mo-chi-tiet-kr.dom.tsx -t bkr-cay",
      "expected": "Ca «bkr-cay»: CayCanChinh thật, đầu ra đọc từ apps/app/test/fixtures/bkr-cay.json (đầu ra thật E2b ghi), parse bằng\ncayCanChinhOutput. Ma trận viết trước 2 ô: chọn nút K (bấm nhãn trong TreeNav) → record `kr:<K>`; chọn\nnút O → record `objective:<O>`. Đếm ô = 2.\nCHIEU DO (bản sao): mở nut.objectiveId cho mọi loại → đỏ «bkr-cay: nut kr K mo objective:O, can kr:K».",
      "executor": "test",
      "expectedExit": 0,
      "paths": [
        "apps/app/app/(app)/[slug]/okr/cay-can-chinh.tsx",
        "apps/app/test/bam-kr-mo-chi-tiet-kr.dom.tsx",
        "apps/app/test/fixtures/bkr-cay.json"
      ],
      "evidence_required": [
        "run_id",
        "exit_code",
        "verifier",
        "verified_at",
        "output"
      ],
      "ref": "config:executors.test.bkr_cay"
    },
    {
      "id": "E2b",
      "criterion": "AC-2",
      "cmd": "bun run test -- \"cd apps/api && bun test test/bam-kr-mo-chi-tiet-kr.spec.ts -t bkr-cay-api\"",
      "expected": "Ca «bkr-cay-api» trên CSDL thử: gieo một mục tiêu O và hai KR K1, K2 qua service thật, gọi okr.cayCanChinh bằng router\ncaller, parse bằng cayCanChinhOutput. Ma trận viết trước 2 ô: với mỗi Ki, đúng một nút loai \"kr\" có id bằng id bản ghi\nOkrKeyResult của Ki (đọc bằng Prisma) và objectiveId bằng O; đối chứng: nút loai \"muc-tieu\" có id gắn O. Ghi\nđầu ra cây vào apps/app/test/fixtures/bkr-cay.json khi BKR_GHI=1, so byte khi chạy thường; E2 dựng cây từ đúng tệp ấy\n— lệch là đỏ «bkr-cay-api: fixture lech dau ra that».\nCHIEU DO (bản sao): can-chinh.ts thêm tiền tố vào id nút KR → đỏ «bkr-cay-api: nut kr K1 id <x>, can <id K1>».",
      "executor": "test",
      "expectedExit": 0,
      "paths": [
        "apps/api/src/okr/can-chinh.ts",
        "apps/api/test/bam-kr-mo-chi-tiet-kr.spec.ts"
      ],
      "evidence_required": [
        "run_id",
        "exit_code",
        "verifier",
        "verified_at",
        "output"
      ],
      "ref": "config:executors.test.bkr_cay_api"
    },
    {
      "id": "E3",
      "criterion": "AC-3",
      "cmd": "cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/bam-kr-mo-chi-tiet-kr.dom.tsx -t bkr-viec",
      "expected": "Ca «bkr-viec»: ViecCuaToi thật, danh sách việc parse bằng khuôn thật; ma trận viết trước 2 dòng: việc có keyResultId K\n→ nút tên «Mở KR» (chữ lấy từ tệp chữ), bấm → record `kr:<K>`; việc keyResultId null, objectiveId O → nút «Mở mục\ntiêu», bấm → record `objective:<O>`. Đếm ô = 2.\nCHIEU DO (bản sao): bỏ nhánh keyResultId → đỏ «bkr-viec: viec gan KR mo objective:O, can kr:K».",
      "executor": "test",
      "expectedExit": 0,
      "paths": [
        "apps/app/app/(app)/[slug]/okr/viec-cua-toi.tsx",
        "apps/app/lib/messages/okr.ts",
        "apps/app/test/bam-kr-mo-chi-tiet-kr.dom.tsx"
      ],
      "evidence_required": [
        "run_id",
        "exit_code",
        "verifier",
        "verified_at",
        "output"
      ],
      "ref": "config:executors.test.bkr_viec"
    },
    {
      "id": "E4",
      "criterion": "AC-4",
      "cmd": "cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/bam-kr-mo-chi-tiet-kr.dom.tsx -t bkr-bang-kr",
      "expected": "Ca «bkr-bang-kr»: BangKr thật trong ngăn mục tiêu O (record ban đầu `objective:<O>`), hai KR K1, K2. Ma trận viết\ntrước 2 ô, mỗi KR: getByRole(\"button\", { name: tên Ki }) có; Tab tới được (focus vào nút sau một chuỗi Tab từ đầu\nbảng); bấm → record bằng `objective:<O>|kr:<Ki>`. Đối chứng: thêm ô Enter trên nút K2 → cùng kết quả; đóng ngăn KR (gọi\nclose của record stack) → record về `objective:<O>`. Đếm ô = 2 (+2 đối chứng).\nCHIEU DO (bản sao): tên KR là span như trước vòng → đỏ «bkr-bang-kr: ten K1 khong phai nut».",
      "executor": "test",
      "expectedExit": 0,
      "paths": [
        "apps/app/app/(app)/[slug]/okr/bang-kr.tsx",
        "apps/app/test/bam-kr-mo-chi-tiet-kr.dom.tsx"
      ],
      "evidence_required": [
        "run_id",
        "exit_code",
        "verifier",
        "verified_at",
        "output"
      ],
      "ref": "config:executors.test.bkr_bang_kr"
    },
    {
      "id": "E5",
      "criterion": "AC-5",
      "cmd": "cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 ./test/bam-kr-mo-chi-tiet-kr.spec.ts -t bkr-chu",
      "expected": "Ca «bkr-chu» QUÉT LỚP LÚC CHẠY: liệt mọi tệp khớp apps/app/lib/messages/**/*.ts và apps/agent/agent/lib/**/*.ts (trừ\nokr/chi-dan-tom-tat.ts), đọc mọi chuỗi chữ trong tệp (literal và template, bằng bộ phân tích TS); in «quet: <f> tep, <n>\nchuoi» (f bằng số tệp khớp khuôn, kiểm bằng glob độc lập). Thêm: tin nhắc thật do bộ ghép tin của agent dựng cho loại\nokr-cap-nhat (dữ liệu mẫu) không chứa «Cập nhật tuần» ở đầu tin.\n(1) vi: không chuỗi nào khớp /[Cc]ập nhật tuần(?! này)/ — in từng chuỗi lọt «bkr-chu: <khoá> \"<chuỗi>\"»; (2) en: không\nchuỗi nào khớp /[Ww]eekly update(?! day)/; (3) ma trận viết trước 8 khoá vi phải đổi (bảng cặp «Chữ» của design doc), giá trị bằng đúng chuỗi mới:\nokr.ts capNhatTuan (hai chỗ) và \"cap-nhat-tuan\" = «Cập nhật»; okr-toan-canh chuaCapNhat = «Tuần này chưa có lần cập\nnhật nào», chuỗi mô tả kế nó = «Kara tóm tắt sáng hôm sau ngày cập nhật, khi phòng có ít nhất một lần cập nhật.», chuỗi\nviệc tóm tắt chạy lúc 06:00 chứa «ít nhất một lần cập nhật»; okr-soan \"3-tom-gon\" = «Lớp 3: dòng tóm gọn lần cập\nnhật»; tin-nhac \"okr-cap-nhat\" = «Cập nhật». Đếm ô = 8. (4) đối chứng dương: ít nhất một chuỗi chứa «cập nhật tuần\nnày» còn (khoảng thời gian giữ).\nCHIEU DO (bản sao): thêm lại «Cập nhật tuần» vào một chuỗi → đỏ «bkr-chu: <khoá> \"Cập nhật tuần\"».",
      "executor": "test",
      "expectedExit": 0,
      "paths": [
        "apps/app/lib/messages/**",
        "apps/agent/agent/lib/**",
        "apps/app/test/bam-kr-mo-chi-tiet-kr.spec.ts"
      ],
      "evidence_required": [
        "run_id",
        "exit_code",
        "verifier",
        "verified_at",
        "output"
      ],
      "ref": "config:executors.test.bkr_chu"
    },
    {
      "id": "E6",
      "criterion": "AC-6",
      "cmd": "bun _acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs",
      "expected": "khong-doi-hinh.mjs QUÉT LỚP LÚC CHẠY (khuôn gon-dau-trang-lay-y-kien/rang/khong-doi-hinh.mjs): mọi hồ sơ signed-off\nhay machine-cleared có eval test/script (không not-run) mà tệp trong lệnh đã giải chứa «Cập nhật tuần», chạm một trong\nphan-kr-phu-trach, cay-can-chinh, viec-cua-toi, bang-kr, tin-nhac, hoặc bị vòng sửa; cộng hai thước màn viết trước:\ndat-okr-trong-crm (dok_man_chrome) và hop-thoai-giu-cho-dang-nhap (hg_man_that). In «quet lop: <n> ho so, <k> eval».\n(1) Chạy các mục trên cây; mục đỏ chạy lại trên worktree origin/onehub: «SAI AC-6: <slug>#<E> nen 0, cay <m>» khi nền 0\nmà cây khác 0, «DO SAN TREN NEN <slug>#<E>» khi nền đỏ; mục xanh in «DUNG <slug>#<E>». (2)\napps/agent/test/fixtures/tin-nhac-truoc-tb1.json không đổi so origin/onehub (thêm, sửa hay xoá) — đổi → «SAI AC-6: ANH\nCHUP LICH SU DOI». Đối chứng dương: hai thước màn có mặt trong lớp («THEM <slug>»).\nCHIEU DO (bản sao HEAD): sửa ảnh chụp lịch sử → «SAI AC-6: ANH CHUP LICH SU DOI», mã 1; trong bản sao đổi chuỗi kỳ vọng\n«*Cập nhật*» của kara-mot-ten.spec.ts thành chuỗi sai rồi chạy eval của kara-mot-ten trên bản sao và trên nền →\n«SAI AC-6: kara-mot-ten#<E> nen 0, cay 1», mã 1.",
      "executor": "script",
      "expectedExit": 0,
      "paths": [
        "_acceptance/*/rang/**",
        "apps/agent/test/fixtures/tin-nhac-truoc-tb1.json",
        "apps/app/test/**",
        "apps/agent/test/**",
        "apps/api/test/**",
        "packages/validation/test/**"
      ],
      "evidence_required": [
        "run_id",
        "exit_code",
        "verifier",
        "verified_at",
        "output"
      ],
      "longRunning": 200,
      "ref": "config:executors.script.bkr_khong_doi_hinh"
    },
    {
      "id": "E7",
      "criterion": "AC-7",
      "cmd": "cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 ./test/bam-kr-mo-chi-tiet-kr.spec.ts -t bkr-quet-mo",
      "expected": "Ca «bkr-quet-mo» QUÉT LỚP LÚC CHẠY: bộ phân tích TS liệt mọi lời gọi openRecord(...) và hàm từ useOpenRecord() dưới\napps/app/app/(app)/[slug]/okr/ cùng giá trị kind (literal, hoặc biểu thức điều kiện thì liệt cả hai nhánh); in «quet:\n<n> cho goi». Bảng viết trước rang/cho-mo-ban-ghi.json (viết ở S3 TRƯỚC khi sửa mã, mỗi phần tử: tệp, mỏ neo, kind,\nnguon muc-tieu|kr) phải khớp toàn phần: số phần tử bằng n; chỗ gọi không có trong bảng → «bkr-quet-mo: cho goi moi\n<tep>:<dong>»; phần tử nguon kr mà kind objective → «bkr-quet-mo: <tep>:<dong> nguon KR mo objective». Bảng gồm bốn chỗ\nsửa (nguon kr, kind kr) và các chỗ đã đúng của design doc.\nCHIEU DO (bản sao): trả lại kind objective ở phan-kr-phu-trach.tsx → đỏ «bkr-quet-mo: phan-kr-phu-trach.tsx:<dong>\nnguon KR mo objective»; thêm một lời gọi mới → đỏ «bkr-quet-mo: cho goi moi».",
      "executor": "test",
      "expectedExit": 0,
      "paths": [
        "apps/app/app/(app)/[slug]/okr/**",
        "_acceptance/bam-kr-mo-chi-tiet-kr/rang/cho-mo-ban-ghi.json",
        "apps/app/test/bam-kr-mo-chi-tiet-kr.spec.ts"
      ],
      "evidence_required": [
        "run_id",
        "exit_code",
        "verifier",
        "verified_at",
        "output"
      ],
      "ref": "config:executors.test.bkr_quet_mo"
    }
  ],
  "suiteCommands": [
    "bun run test -- --filter=api",
    "bun run test -- --filter=app --filter=@crm/ui",
    "bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db",
    "bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation",
    "bunx turbo run lint --force",
    "bun run lint:slop",
    "bunx turbo run build --force"
  ],
  "diffBase": "49843223e73fcca11e7bb1d709e2975e5a2a7b9d",
  "repoRoot": "/Users/manh-macmini/dev/crm/.claude/worktrees/sv6-bam-kr-mo-chi-tiet-kr",
  "personasPath": "/Users/manh-macmini/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.33.1/skills/acceptance/references/judge-personas.md",
  "templatePath": "/Users/manh-macmini/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.33.1/skills/acceptance/references/evidence-report-template.md",
  "toolKillRule": "# TOOL-KILL-RULE — lệnh bị công cụ ngắt KHÔNG phải lệnh fail\n\n**Nguồn duy nhất** của luật «hết giờ không phải trượt» cho MỌI đường chạy lệnh\nkiểm của kit. Hai đường tiêu thụ, cùng đọc khối marker dưới đây, không chép tay:\n\n- **Vòng lặp tính năng** (plugin feature-loop): skill `feature-loop` đọc file này\n  (resolve qua `resolve-plugin.mjs --require skills/acceptance/references/tool-kill-rule.md`)\n  và truyền NGUYÊN VĂN vào `args.toolKillRule` của workflow\n  `acceptance-verify.js`; workflow rút khối marker và nội suy vào prompt của mọi\n  agent chạy lệnh (machine · ui-check · baseline). Thiếu args hoặc không rút\n  được marker → workflow trả BLOCKED có tên, không chạy không luật.\n- **Đường VERIFY độc lập** (skill `acceptance` Phase 3): phiên điều phối chép khối\n  marker VERBATIM vào prompt của phiên tươi VERIFY, cùng nếp «Network truth».\n\nVì sao có luật: verifier chạy lệnh qua Bash tool có trần thời gian mặc định\n(~120 s) NGẮN hơn nhiều suite; lệnh bị công cụ giết trả exit code CỦA CÔNG CỤ,\nkhông phải của lệnh (vấp thật release-2-2-0 S4 r5: suite 108 s đơn lẻ, dưới tải\nbị giết ở 118 s → REJECT giả 4 eval). Nhận diện là việc AGENT (nó thấy tool\nresult thật); phần máy chỉ phòng thủ trên field cấu trúc `killedByTool` —\nKHÔNG grep nội dung output trong engine (chuỗi tổng kết là của suite từng repo).\n\nLệnh dài hơn trần 600 s của công cụ thì KHÔNG bị giết: công cụ **đẩy nó sang\nnền** và nó chạy tiếp. Tệp đầu ra nền trống tới phút chót, vì khung bọc lệnh của\nkit chỉ in khi lệnh xong — đọc trống thành «bị giết» là đúng sự cố crm 07/10/2026\n(hồ sơ `lenh-dai-chay-rieng`: hai lượt BLOCKED giả). Dòng «chuyển sang nền» trong\nkhối dưới là lối LỜI cho mọi lệnh. Lối MÁY: eval khai `long_running: <phút>`\ntrong `evals.yaml` thì lượt chấm feature-loop tự chạy lệnh nền, ghi nhật ký ở\n`.acceptance-runs/<slug>/s4-lenh-dai/` và chờ bằng lệnh nó sinh ra\n(`eval-executors.md`, mục `long_running`).\n\n<!-- <<<TOOL-KILL-RULE -->\nTRAN THOI GIAN CONG CU: khi goi Bash chay lenh, LUON dat tham so timeout >= 600000 (ms) — tran mac dinh cua cong cu (~120s) NGAN hon nhieu suite; lenh vuot tran se bi CONG CU giet va exit code luc do la cua cong cu, KHONG phai cua lenh. Neu lenh van bi cong cu dung (tool result bao timeout/killed, hoac output bi CAT giua chung truoc dong tong ket cuoi cua lenh) → DO KHONG PHAI ket qua that: khai cannotRun=true + killedByTool=true + reason \"bi cong cu giet o <so giay> giay\" kem dau hieu (timeout tool / output cat). TUYET DOI khong bao exitCode nhu the lenh tu fail va khong doan PASS/FAIL tu output cut.\nDAU RA DAI: harness co the CAT DAU RA RA TEP (\"Output too large … saved to <tep>\") va chi hien doan DAU — do KHONG phai bi cong cu giet: doc DUOI tep do (tail) de lay dong tong ket va ma thoat; chi khai killedByTool khi tool result bao timeout/killed that.\nCHUYEN SANG NEN KHONG PHAI BI GIET: tool result bao lenh chua xong trong timeout va da duoc CHUYEN SANG NEN (\"moved to the background\", kem ID + tep dau ra) → lenh VAN DANG CHAY: KHONG khai killedByTool, KHONG ket luan tu tep dau ra luc do. Tep dau ra nen TRONG la binh thuong — khung boc lenh chi in duoi dau ra + dong __EXIT=<n> khi lenh XONG. Cho bang lenh Bash co gioi han (moi lan goi ≤ 100 giay, duoi tran mac dinh 120 giay cua cong cu; vd vong lap kiem tep do co dong __EXIT= chua, sleep vai giay, het 100 giay thi thoat) va goi lai toi khi tep co dong __EXIT=<n> → doc ma tu dong do nhu binh thuong. Tong thoi gian cho toi da = so phut eval khai o long_running (vang thi 30 phut), tinh tu luc chay lenh; qua ma chua co dong __EXIT → cannotRun=true + reason \"lenh chay qua <so> phut chua xong — khai long_running: <phut> cho eval trong evals.yaml\" (KHONG killedByTool), va dung tac vu nen neu cong cu cho phep.\n<!-- TOOL-KILL-RULE>>> -->\n\n## Hồ sơ cho lượt bị ngắt (đường độc lập)\n\nPhiên tươi VERIFY gặp lệnh bị công cụ ngắt thì:\n\n- dòng run-log của eval đó: `\"exit_code\": null, \"killed_by_tool\": true` (không\n  ghi mã thoát của công cụ như mã thoát của lệnh);\n- verdict báo cáo `BLOCKED`, `reason: bi cong cu giet o <so giay> giay — <eval ids>`\n  (kèm dấu hiệu: timeout tool / output cắt trước dòng tổng kết); `failed_evals`\n  rỗng — người đọc hồ sơ thấy đây là sự cố hạ tầng, chữa bằng chạy lại với trần\n  công cụ đủ dài, không phải sửa sản phẩm.\n\nLệnh bị đẩy sang nền rồi QUÁ trần chờ (`long_running`, vắng thì 30 phút) cũng\nlà sự cố hạ tầng chứ không phải lệnh hỏng: dòng run-log `\"exit_code\": null`,\n`\"cannot_run\": true` (KHÔNG `killed_by_tool` — công cụ không giết nó), verdict\n`BLOCKED`, reason gọi tên việc cần làm (khai `long_running: <phút>` cho eval).\n",
  "contractPath": "/Users/manh-macmini/dev/crm/.claude/worktrees/sv6-bam-kr-mo-chi-tiet-kr/_acceptance/bam-kr-mo-chi-tiet-kr/contract.md",
  "invokedAt": "2026-10-25T04:32:56Z",
  "invokedSha": "51403986a1bca580e5b9c371d02bc34a67289bfa",
  "vungVat": [
    "_acceptance/bam-kr-mo-chi-tiet-kr/card-plain.json",
    "_acceptance/bam-kr-mo-chi-tiet-kr/card.html",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evals.yaml",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/chu--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/chu--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/chu--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/chu--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/cua-toi--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/cua-toi--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/cua-toi--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/cua-toi--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hom-nay--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hom-nay--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hom-nay--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hom-nay--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hop-cap-nhat--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hop-cap-nhat--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hop-cap-nhat--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hop-cap-nhat--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr-chong--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr-chong--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr-chong--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr-chong--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-muc-tieu--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-muc-tieu--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-muc-tieu--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-muc-tieu--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/so-do--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/so-do--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/so-do--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/so-do--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/chi-tiet-kr--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/chi-tiet-kr--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/chi-tiet-muc-tieu--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/chi-tiet-muc-tieu--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi-bam-kr--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi-bam-kr--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi-kr--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi-kr--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/so-do--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/so-do--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/so-do-bam-kr--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/so-do-bam-kr--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/viec-bam-mo--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/viec-bam-mo--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/cap-chu.json",
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/cho-mo-ban-ghi.json",
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/chup-hom-nay.mjs",
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs",
    "_acceptance/bam-kr-mo-chi-tiet-kr/s4-args-r2.json",
    "_acceptance/config.yaml",
    "_acceptance/hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs",
    "apps/agent/agent/lib/tin-nhac.ts",
    "apps/agent/test/kara-mot-ten.spec.ts",
    "apps/agent/test/okr-nhac.integration.spec.ts",
    "apps/agent/test/support/cap-chu-sv6.ts",
    "apps/agent/test/thong-bao-ghi.integration.spec.ts",
    "apps/agent/test/thong-bao-kenh.integration.spec.ts",
    "apps/api/test/bam-kr-mo-chi-tiet-kr.spec.ts",
    "apps/app/app/(app)/[slug]/okr/bang-kr.tsx",
    "apps/app/app/(app)/[slug]/okr/cay-can-chinh.tsx",
    "apps/app/app/(app)/[slug]/okr/phan-kr-phu-trach.tsx",
    "apps/app/app/(app)/[slug]/okr/viec-cua-toi.tsx",
    "apps/app/app/proto/_modules/bam-kr-mo-chi-tiet-kr/du-lieu.ts",
    "apps/app/app/proto/_modules/bam-kr-mo-chi-tiet-kr/index.tsx",
    "apps/app/app/proto/_modules/bam-kr-mo-chi-tiet-kr/ngan.tsx",
    "apps/app/app/proto/catalog.ts",
    "apps/app/app/proto/registry.ts",
    "apps/app/lib/messages/okr-so.ts",
    "apps/app/lib/messages/okr-soan.ts",
    "apps/app/lib/messages/okr-tai-co-cau.ts",
    "apps/app/lib/messages/okr-toan-canh.ts",
    "apps/app/lib/messages/okr.ts",
    "apps/app/test/bam-kr-mo-chi-tiet-kr.dom.tsx",
    "apps/app/test/bam-kr-mo-chi-tiet-kr.spec.ts",
    "apps/app/test/fixtures/bkr-cay.json",
    "apps/app/test/okr-cua-toi-ba-phan.dom.tsx",
    "apps/app/test/okr-tai-co-cau.dom.tsx",
    "apps/app/test/support/bam-kr-quet.ts",
    "apps/app/test/tro-ly-okr-tom-tat.dom.tsx"
  ],
  "ngoaiVatGlobs": [
    "docs/**",
    "**/*.md",
    "PRODUCT-MAP.md",
    "LO-TRINH.html",
    "AGENTS.md",
    "CLAUDE.md",
    "scripts/pre-merge-check.sh",
    "scripts/recheck-evidence.cjs",
    "lib/evidence-core.cjs",
    "lib/gap-probe.cjs",
    "lib/workspace-record.cjs",
    "lib/ac-line.cjs",
    "lib/md-section.cjs",
    "lib/eval-yaml.cjs",
    "lib/lop-nhin-thay.cjs",
    "lib/nhan-canh-gay.cjs",
    "scripts/product-map.mjs",
    "scripts/trang-thai-ho-so.cjs",
    "scripts/khong-can-nguoi.mjs",
    "lib/nguong-o-co-hoi.cjs",
    "lib/out-of-contract.cjs",
    "scripts/lo-trinh-khoa.cjs",
    "scripts/lo-trinh.mjs",
    "scripts/ho-so-tom-tat.cjs",
    "scripts/tin-hieu-khoa.cjs",
    "scripts/tin-hieu.mjs",
    "scripts/cat-luot.mjs",
    "scripts/co-hop-dong.cjs",
    "scripts/gio-may.mjs",
    "lib/chan-lo-trinh.cjs",
    "lib/do-san-tren-nen.cjs",
    "dieu-phoi/scripts/hinh-dang.mjs",
    "dieu-phoi/scripts/cau-hinh.mjs",
    "dieu-phoi/scripts/dot.mjs",
    "skills/acceptance/references/tin-hieu-template.md",
    ".claude/launch.json",
    ".github/workflows/ci.yml",
    "tin-hieu/crm/**",
    "_acceptance/*/run-log.jsonl",
    "_acceptance/*/decisions.jsonl",
    "_acceptance/*/**/*.md",
    "_acceptance/*/**/*.jsonl"
  ],
  "ngoaiVatFiles": [
    "LO-TRINH.html",
    "PRODUCT-MAP.md",
    "_acceptance/bam-kr-mo-chi-tiet-kr/contract.md",
    "_acceptance/bam-kr-mo-chi-tiet-kr/decisions.jsonl",
    "_acceptance/bam-kr-mo-chi-tiet-kr/design-pass.md",
    "_acceptance/bam-kr-mo-chi-tiet-kr/duong-nen.md",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence-report.md",
    "_acceptance/bam-kr-mo-chi-tiet-kr/gap-probe.md",
    "_acceptance/bam-kr-mo-chi-tiet-kr/opportunity.md",
    "_acceptance/bam-kr-mo-chi-tiet-kr/review-findings.md",
    "_acceptance/bam-kr-mo-chi-tiet-kr/run-log.jsonl",
    "_acceptance/bam-kr-mo-chi-tiet-kr/usage-report.md",
    "_acceptance/cap-nhat-tuan-okr/decisions.jsonl",
    "_acceptance/dieu-huong-khu-muc-tieu/decisions.jsonl",
    "_acceptance/doi-nhan-khu-muc-tieu/decisions.jsonl",
    "_acceptance/hop-thoai-giu-cho-dang-nhap/decisions.jsonl",
    "_acceptance/hop-thong-bao-tren-web/decisions.jsonl",
    "_acceptance/kara-mot-ten/decisions.jsonl",
    "_acceptance/thong-bao-mot-nguon-nhieu-kenh/decisions.jsonl",
    "_acceptance/tro-ly-okr-tom-tat/decisions.jsonl",
    "docs/superpowers/plans/2026-10-24-bam-kr-mo-chi-tiet-kr.md",
    "docs/superpowers/specs/2026-10-24-bam-kr-mo-chi-tiet-kr-design.md"
  ],
  "diffFiles": [
    "LO-TRINH.html",
    "PRODUCT-MAP.md",
    "_acceptance/bam-kr-mo-chi-tiet-kr/card-plain.json",
    "_acceptance/bam-kr-mo-chi-tiet-kr/card.html",
    "_acceptance/bam-kr-mo-chi-tiet-kr/contract.md",
    "_acceptance/bam-kr-mo-chi-tiet-kr/decisions.jsonl",
    "_acceptance/bam-kr-mo-chi-tiet-kr/design-pass.md",
    "_acceptance/bam-kr-mo-chi-tiet-kr/duong-nen.md",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evals.yaml",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence-report.md",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/chu--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/chu--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/chu--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/chu--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/cua-toi--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/cua-toi--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/cua-toi--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/cua-toi--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hom-nay--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hom-nay--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hom-nay--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hom-nay--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hop-cap-nhat--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hop-cap-nhat--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hop-cap-nhat--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hop-cap-nhat--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr-chong--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr-chong--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr-chong--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr-chong--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-muc-tieu--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-muc-tieu--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-muc-tieu--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-muc-tieu--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/so-do--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/so-do--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/so-do--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/so-do--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/chi-tiet-kr--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/chi-tiet-kr--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/chi-tiet-muc-tieu--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/chi-tiet-muc-tieu--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi-bam-kr--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi-bam-kr--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi-kr--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi-kr--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/so-do--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/so-do--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/so-do-bam-kr--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/so-do-bam-kr--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/viec-bam-mo--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/viec-bam-mo--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/gap-probe.md",
    "_acceptance/bam-kr-mo-chi-tiet-kr/opportunity.md",
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/cap-chu.json",
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/cho-mo-ban-ghi.json",
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/chup-hom-nay.mjs",
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs",
    "_acceptance/bam-kr-mo-chi-tiet-kr/review-findings.md",
    "_acceptance/bam-kr-mo-chi-tiet-kr/run-log.jsonl",
    "_acceptance/bam-kr-mo-chi-tiet-kr/s4-args-r2.json",
    "_acceptance/bam-kr-mo-chi-tiet-kr/usage-report.md",
    "_acceptance/cap-nhat-tuan-okr/decisions.jsonl",
    "_acceptance/config.yaml",
    "_acceptance/dieu-huong-khu-muc-tieu/decisions.jsonl",
    "_acceptance/doi-nhan-khu-muc-tieu/decisions.jsonl",
    "_acceptance/hop-thoai-giu-cho-dang-nhap/decisions.jsonl",
    "_acceptance/hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs",
    "_acceptance/hop-thong-bao-tren-web/decisions.jsonl",
    "_acceptance/kara-mot-ten/decisions.jsonl",
    "_acceptance/thong-bao-mot-nguon-nhieu-kenh/decisions.jsonl",
    "_acceptance/tro-ly-okr-tom-tat/decisions.jsonl",
    "apps/agent/agent/lib/tin-nhac.ts",
    "apps/agent/test/kara-mot-ten.spec.ts",
    "apps/agent/test/okr-nhac.integration.spec.ts",
    "apps/agent/test/support/cap-chu-sv6.ts",
    "apps/agent/test/thong-bao-ghi.integration.spec.ts",
    "apps/agent/test/thong-bao-kenh.integration.spec.ts",
    "apps/api/test/bam-kr-mo-chi-tiet-kr.spec.ts",
    "apps/app/app/(app)/[slug]/okr/bang-kr.tsx",
    "apps/app/app/(app)/[slug]/okr/cay-can-chinh.tsx",
    "apps/app/app/(app)/[slug]/okr/phan-kr-phu-trach.tsx",
    "apps/app/app/(app)/[slug]/okr/viec-cua-toi.tsx",
    "apps/app/app/proto/_modules/bam-kr-mo-chi-tiet-kr/du-lieu.ts",
    "apps/app/app/proto/_modules/bam-kr-mo-chi-tiet-kr/index.tsx",
    "apps/app/app/proto/_modules/bam-kr-mo-chi-tiet-kr/ngan.tsx",
    "apps/app/app/proto/catalog.ts",
    "apps/app/app/proto/registry.ts",
    "apps/app/lib/messages/okr-so.ts",
    "apps/app/lib/messages/okr-soan.ts",
    "apps/app/lib/messages/okr-tai-co-cau.ts",
    "apps/app/lib/messages/okr-toan-canh.ts",
    "apps/app/lib/messages/okr.ts",
    "apps/app/test/bam-kr-mo-chi-tiet-kr.dom.tsx",
    "apps/app/test/bam-kr-mo-chi-tiet-kr.spec.ts",
    "apps/app/test/fixtures/bkr-cay.json",
    "apps/app/test/okr-cua-toi-ba-phan.dom.tsx",
    "apps/app/test/okr-tai-co-cau.dom.tsx",
    "apps/app/test/support/bam-kr-quet.ts",
    "apps/app/test/tro-ly-okr-tom-tat.dom.tsx",
    "docs/superpowers/plans/2026-10-24-bam-kr-mo-chi-tiet-kr.md",
    "docs/superpowers/specs/2026-10-24-bam-kr-mo-chi-tiet-kr-design.md"
  ],
  "fileDoTrongDiff": [
    "_acceptance/bam-kr-mo-chi-tiet-kr/card-plain.json",
    "_acceptance/bam-kr-mo-chi-tiet-kr/card.html",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evals.yaml",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/chu--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/chu--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/chu--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/chu--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/cua-toi--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/cua-toi--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/cua-toi--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/cua-toi--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hom-nay--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hom-nay--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hom-nay--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hom-nay--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hop-cap-nhat--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hop-cap-nhat--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hop-cap-nhat--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/hop-cap-nhat--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr-chong--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr-chong--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr-chong--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-kr-chong--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-muc-tieu--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-muc-tieu--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-muc-tieu--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/ngan-muc-tieu--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/so-do--desktop-1440--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/so-do--desktop-1440--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/so-do--mobile-375--dark.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/design-pass/so-do--mobile-375--light.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/chi-tiet-kr--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/chi-tiet-kr--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/chi-tiet-muc-tieu--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/chi-tiet-muc-tieu--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi-bam-kr--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi-bam-kr--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi-kr--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/cua-toi-kr--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/so-do--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/so-do--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/so-do-bam-kr--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/so-do-bam-kr--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/viec-bam-mo--1440.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay/viec-bam-mo--375.png",
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/cap-chu.json",
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/cho-mo-ban-ghi.json",
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/chup-hom-nay.mjs",
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs",
    "_acceptance/bam-kr-mo-chi-tiet-kr/s4-args-r2.json",
    "_acceptance/config.yaml",
    "_acceptance/hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs",
    "apps/agent/agent/lib/tin-nhac.ts",
    "apps/agent/test/kara-mot-ten.spec.ts",
    "apps/agent/test/okr-nhac.integration.spec.ts",
    "apps/agent/test/support/cap-chu-sv6.ts",
    "apps/agent/test/thong-bao-ghi.integration.spec.ts",
    "apps/agent/test/thong-bao-kenh.integration.spec.ts",
    "apps/api/test/bam-kr-mo-chi-tiet-kr.spec.ts",
    "apps/app/app/(app)/[slug]/okr/bang-kr.tsx",
    "apps/app/app/(app)/[slug]/okr/cay-can-chinh.tsx",
    "apps/app/app/(app)/[slug]/okr/phan-kr-phu-trach.tsx",
    "apps/app/app/(app)/[slug]/okr/viec-cua-toi.tsx",
    "apps/app/lib/messages/okr-so.ts",
    "apps/app/lib/messages/okr-soan.ts",
    "apps/app/lib/messages/okr-tai-co-cau.ts",
    "apps/app/lib/messages/okr-toan-canh.ts",
    "apps/app/lib/messages/okr.ts",
    "apps/app/test/bam-kr-mo-chi-tiet-kr.dom.tsx",
    "apps/app/test/bam-kr-mo-chi-tiet-kr.spec.ts",
    "apps/app/test/fixtures/bkr-cay.json",
    "apps/app/test/okr-cua-toi-ba-phan.dom.tsx",
    "apps/app/test/okr-tai-co-cau.dom.tsx",
    "apps/app/test/support/bam-kr-quet.ts",
    "apps/app/test/tro-ly-okr-tom-tat.dom.tsx"
  ],
  "coverageFiles": [
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/cap-chu.json",
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/cho-mo-ban-ghi.json",
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/chup-hom-nay.mjs",
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs",
    "_acceptance/hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs",
    "apps/agent/agent/lib/tin-nhac.ts",
    "apps/agent/test/kara-mot-ten.spec.ts",
    "apps/agent/test/okr-nhac.integration.spec.ts",
    "apps/agent/test/support/cap-chu-sv6.ts",
    "apps/agent/test/thong-bao-ghi.integration.spec.ts",
    "apps/agent/test/thong-bao-kenh.integration.spec.ts",
    "apps/api/test/bam-kr-mo-chi-tiet-kr.spec.ts",
    "apps/app/app/(app)/[slug]/okr/bang-kr.tsx",
    "apps/app/app/(app)/[slug]/okr/cay-can-chinh.tsx",
    "apps/app/app/(app)/[slug]/okr/phan-kr-phu-trach.tsx",
    "apps/app/app/(app)/[slug]/okr/viec-cua-toi.tsx",
    "apps/app/lib/messages/okr-so.ts",
    "apps/app/lib/messages/okr-soan.ts",
    "apps/app/lib/messages/okr-tai-co-cau.ts",
    "apps/app/lib/messages/okr-toan-canh.ts",
    "apps/app/lib/messages/okr.ts",
    "apps/app/test/bam-kr-mo-chi-tiet-kr.dom.tsx",
    "apps/app/test/bam-kr-mo-chi-tiet-kr.spec.ts",
    "apps/app/test/fixtures/bkr-cay.json",
    "apps/app/test/okr-cua-toi-ba-phan.dom.tsx",
    "apps/app/test/okr-tai-co-cau.dom.tsx",
    "apps/app/test/support/bam-kr-quet.ts",
    "apps/app/test/tro-ly-okr-tom-tat.dom.tsx"
  ],
  "coEvalPaths": true,
  "evalsHash": "3a29f5ac88c76e18e2499cba73b76ddc7d75bc289fa78313fb076825cafdb304",
  "runBaseline": true,
  "carriedEvals": [
    {
      "id": "E2",
      "runId": "minted-bam-kr-mo-chi-tiet-kr-E2-r1",
      "fromRound": 1,
      "verifiedAt": "2026-10-24T12:16:06Z",
      "cmd": "cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/bam-kr-mo-chi-tiet-kr.dom.tsx -t bkr-cay"
    },
    {
      "id": "E2b",
      "runId": "minted-bam-kr-mo-chi-tiet-kr-E2b-r1",
      "fromRound": 1,
      "verifiedAt": "2026-10-24T12:16:06Z",
      "cmd": "bun run test -- \"cd apps/api && bun test test/bam-kr-mo-chi-tiet-kr.spec.ts -t bkr-cay-api\""
    },
    {
      "id": "E4",
      "runId": "minted-bam-kr-mo-chi-tiet-kr-E4-r1",
      "fromRound": 1,
      "verifiedAt": "2026-10-24T12:16:06Z",
      "cmd": "cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/bam-kr-mo-chi-tiet-kr.dom.tsx -t bkr-bang-kr"
    }
  ],
  "carriedFindings": [
    {
      "file": "_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs",
      "title": "Hàm cocSo là hàm đồng nhất chết",
      "severity": "low",
      "plain": "Không ảnh hưởng gì đến người dùng; chỉ làm người đọc mã của bộ kiểm tra dễ hiểu nhầm một bước thừa.",
      "can_cu": "Không đụng tới màn hình hay dữ liệu của người dùng, chỉ là một dòng thừa trong công cụ kiểm tra nên sửa hay không cũng không đổi gì cho họ.",
      "proposal": "wont-fix",
      "fromRound": 2,
      "tepDoi": true
    },
    {
      "file": "_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs",
      "title": "dongSo nuốt lỗi đọc JSON của decisions.jsonl",
      "severity": "low",
      "plain": "Không ảnh hưởng người dùng cuối. Khi sổ quyết định bị hỏng, bộ kiểm tra vẫn báo lỗi nhưng nói là thiếu dòng sổ chứ không nói là sổ hỏng.",
      "can_cu": "Bộ kiểm tra vẫn đỏ nên không lọt lỗi nào, chỉ làm người sửa mất thêm một lúc để hiểu đúng nguyên nhân; sửa sau cũng rẻ.",
      "proposal": "known-limits",
      "fromRound": 2,
      "tepDoi": true
    },
    {
      "file": "_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs",
      "title": "Hình dạng 1 (đo chỉ dẫn thay vì đầu ra) và hình dạng 3 (chuỗi có mặt thay vì quan hệ): tệp hỗ trợ cap-chu-sv6.ts được miễn quét, chỉ grep hai chuỗi trong mã nguồn; còn theoCapChu bỏ soLan và khoá, thay toàn cục",
      "severity": "medium",
      "plain": "Nếu sau này có thêm một chỗ chữ «Cập nhật tuần» bị đổi ngoài ý định, bộ kiểm tra có thể không phát hiện. Hiện chưa thấy người dùng nào bị ảnh hưởng.",
      "can_cu": "Rủi ro chỉ xảy ra nếu có thay đổi chữ ngoài dự kiến trong tương lai, không mất dữ liệu, và bắt được lại khi rà soát chữ trên màn hình.",
      "proposal": "known-limits",
      "fromRound": 2,
      "tepDoi": true
    },
    {
      "file": "_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs",
      "title": "Hình dạng 3 (chuỗi có mặt thay vì quan hệ): ngoại lệ apAnh trong khoiHopLe xét từng dòng có thuộc tập hay không, không xét đúng phép thay bọc theoCapChu",
      "severity": "low",
      "plain": "Bộ kiểm tra có thể chấp nhận một chỉnh sửa dở dang trong bài kiểm tra cũ mà lẽ ra phải bị chặn. Người dùng không thấy khác biệt nào trên màn hình.",
      "can_cu": "Chỉ làm bộ kiểm tra nội bộ lỏng hơn dự định, không đụng tới màn hình hay dữ liệu người dùng, và siết lại sau cũng không đắt.",
      "proposal": "known-limits",
      "fromRound": 2,
      "tepDoi": true
    },
    {
      "file": "apps/api/src/okr/okr-config.ts",
      "title": "Text users still see says «Cập nhật tuần» outside the two folders E5 scans",
      "severity": "medium",
      "plain": "Vài chỗ người dùng vẫn thấy chữ «Cập nhật tuần» cũ: thông báo lỗi khi cập nhật KR, chú thích dưới biểu đồ trong chi tiết KR. Kara cũng còn nói chữ cũ trong khung chat, trong khi nút trên màn đã đổi thành «Cập nhật».",
      "can_cu": "Chỉ là chữ gọi tên lệch giữa vài nơi, không mất dữ liệu và không làm sai thao tác nào, nhưng người dùng sẽ thấy hai cách gọi cho cùng một thứ, và sửa gọn trong một việc riêng về chữ.",
      "proposal": "new-contract",
      "fromRound": 1,
      "tepDoi": false
    },
    {
      "file": "_acceptance/bam-kr-mo-chi-tiet-kr/rang/chup-hom-nay.mjs",
      "title": "chup-hom-nay.mjs vẫn chụp và in «ANH …» khi chờ ngăn hay phần tử hết hạn",
      "severity": "low",
      "plain": "Ảnh minh hoạ gửi kèm cho người duyệt có thể chụp nhầm màn khi ngăn chi tiết không mở được, mà không có cảnh báo. Người duyệt có thể thấy một ảnh trông bình thường nhưng không đúng trạng thái.",
      "can_cu": "Chỉ ảnh minh hoạ cho người duyệt bị ảnh hưởng, không đụng tới người dùng cuối, và người duyệt chụp lại hay mở màn xem trực tiếp là kiểm lại được ngay.",
      "proposal": "known-limits",
      "fromRound": 1,
      "tepDoi": false
    },
    {
      "file": "apps/app/test/bam-kr-mo-chi-tiet-kr.spec.ts",
      "title": "Hình dạng 5 (quét lớp, đối chứng không độc lập): số tệp E5 được so với chính nó",
      "severity": "medium",
      "plain": "Bài kiểm tự động của lần đổi chữ này có thể bỏ sót vài tệp chữ mà vẫn báo xanh. Người dùng không thấy gì ngay, chỉ là nguy cơ sót chữ cũ sau này.",
      "can_cu": "Không ảnh hưởng người dùng hôm nay, chỉ làm lưới an toàn lỏng hơn hứa; ghi lại để biết, sửa sau rẻ khi có việc chạm bài kiểm này.",
      "proposal": "known-limits",
      "fromRound": 1,
      "tepDoi": false
    },
    {
      "file": "apps/app/test/bam-kr-mo-chi-tiet-kr.spec.ts",
      "title": "Hình dạng 3 (đo chuỗi có mặt thay vì quan hệ khoá→giá trị) và hình dạng 5 (ma trận 8 ô thành ≥8): mục (3) của E5",
      "severity": "medium",
      "plain": "Bài kiểm chữ chỉ đếm xem cụm chữ mới có mặt hay không, chưa buộc đúng từng ô với đúng câu. Nếu có một câu bị đổi lệch, bài kiểm có thể không thấy.",
      "can_cu": "Chữ trên màn hiện đúng theo bảng cặp đã duyệt, rủi ro chỉ là bắt sót lỗi chữ về sau; người dùng thấy sai chữ thì chỉ là lệch nhẹ và sửa nhanh.",
      "proposal": "known-limits",
      "fromRound": 1,
      "tepDoi": false
    },
    {
      "file": "_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs",
      "title": "Hình dạng 4 (âm tính không ghim): chiều đỏ not-tobe sửa một dòng không liên quan, và chỉ đếm loi.length > 0",
      "severity": "medium",
      "plain": "Bước tự thử xem thước có bắt được lỗi cố ý hay không đang thử trên một dòng không đúng ý định. Thước vẫn có thể hoạt động, chỉ là chưa chứng minh được chắc chắn.",
      "can_cu": "Không đụng tới thứ người dùng thấy; chỉ làm bằng chứng tự kiểm yếu hơn, và sửa sau là việc nhỏ khi có người mở lại thước này.",
      "proposal": "known-limits",
      "fromRound": 1,
      "tepDoi": true
    },
    {
      "file": "_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs",
      "title": "Hình dạng 4 (thiếu đối chứng dương đã khai): E6 không có ca «Tuần này chưa có Cập nhật tuần nào → … qua» và không chặn daSua rỗng",
      "severity": "low",
      "plain": "Thước kiểm thiếu một ca mẫu «đúng thì phải qua» và có thể báo đạt khi không có gì để kiểm. Người dùng không thấy ảnh hưởng, chỉ giảm độ tin cậy của lần kiểm tự động.",
      "can_cu": "Chỉ làm bằng chứng tự động kém chắc hơn, không gây sai gì trên màn của người dùng, và bổ sung ca mẫu sau này là việc nhỏ.",
      "proposal": "known-limits",
      "fromRound": 1,
      "tepDoi": true
    }
  ],
  "deltaFiles": [
    "_acceptance/bam-kr-mo-chi-tiet-kr/card-plain.json",
    "_acceptance/bam-kr-mo-chi-tiet-kr/card.html",
    "_acceptance/bam-kr-mo-chi-tiet-kr/evals.yaml",
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/chu-bai.json",
    "_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs",
    "_acceptance/bam-kr-mo-chi-tiet-kr/s4-args-r2.json",
    "_acceptance/config.yaml",
    "_acceptance/dat-okr-trong-crm/rang/man-okr.mjs",
    "_acceptance/dieu-huong-khu-muc-tieu/rang/man-dau-trang.mjs",
    "_acceptance/hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs",
    "_acceptance/khep-ky-okr/rang/man-khep-ky.mjs",
    "_acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs",
    "_acceptance/ngan-kr-mot-cho/rang/giu-ho-so.mjs",
    "_acceptance/ngan-kr-mot-cho/rang/quet-loi.mjs",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/card-plain.json",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/card.html",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evals.yaml",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence-page.html",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/E6-network.txt",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/E6-step1.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/E6-step10.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/E6-step11.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/E6-step12.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/E6-step2.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/E6-step3.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/E6-step4.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/E6-step5.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/E6-step6.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/E6-step7.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/E6-step8.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/E6-step9.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/esc-1280.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/esc-375.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/giu-lai-1280.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/giu-lai-375.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/lay-ve-1280-menu.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/lay-ve-1280.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/lay-ve-375-menu.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/lay-ve-375.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/mang-1280.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/mang-375.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/xoa-xong-1280.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/evidence/xoa-xong-375.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/figures/luong-tieu-diem.html",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/figures/luong-tieu-diem.png",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/rang/do-ban-phim.mjs",
    "_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/rang/ranh-gioi.mjs",
    "_acceptance/trang-bo-okr/card-plain.json",
    "_acceptance/trang-bo-okr/card.html",
    "_acceptance/trang-bo-okr/du-bao.json",
    "_acceptance/trang-bo-okr/evals.yaml",
    "_acceptance/trang-bo-okr/evidence/tbo-danh-sach-1440-sang.png",
    "_acceptance/trang-bo-okr/evidence/tbo-danh-sach-1440-toi.png",
    "_acceptance/trang-bo-okr/evidence/tbo-danh-sach-375-sang.png",
    "_acceptance/trang-bo-okr/evidence/tbo-mot-bo-1440-sang.png",
    "_acceptance/trang-bo-okr/evidence/tbo-mot-bo-1440-toi.png",
    "_acceptance/trang-bo-okr/evidence/tbo-mot-bo-375-sang.png",
    "_acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs",
    "_acceptance/trang-bo-okr/rang/man-bo-okr-chieu-do.mjs",
    "_acceptance/trang-bo-okr/rang/man-bo-okr-do.mjs",
    "_acceptance/trang-bo-okr/rang/man-bo-okr-du-lieu.mjs",
    "_acceptance/trang-bo-okr/rang/man-bo-okr.mjs",
    "_acceptance/trang-don-vi-mot-bang/rang/ghim-nam.mjs",
    "_acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs",
    "_acceptance/trang-don-vi-mot-bang/rang/ho-so-da-ky.mjs",
    "_acceptance/trang-don-vi-mot-bang/rang/man-don-vi.mjs",
    "_acceptance/vo-khu-muc-tieu/rang/do-man-dieu-huong.mjs",
    "_acceptance/vo-khu-muc-tieu/rang/do-man-lib.mjs",
    "apps/api/src/generated/server.ts",
    "apps/api/src/okr/bo-okr.ts",
    "apps/api/src/okr/okr-xem.contracts.ts",
    "apps/api/src/okr/okr-xem.service.ts",
    "apps/api/src/okr/okr.router.ts",
    "apps/api/test/okr-danh-sach-bo.spec.ts",
    "apps/api/test/vai-chi-okr.spec.ts",
    "apps/app/app/(app)/[slug]/okr/hanh-dong-khu.tsx",
    "apps/app/app/(app)/[slug]/okr/okr-search-params.ts",
    "apps/app/app/(app)/[slug]/okr/phan-kr-phu-trach.tsx",
    "apps/app/app/(app)/[slug]/okr/thanh-tab.tsx",
    "apps/app/app/(app)/[slug]/okr/theo-don-vi/danh-sach-bo.tsx",
    "apps/app/app/(app)/[slug]/okr/theo-don-vi/hang-cong-cu.tsx",
    "apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx",
    "apps/app/app/(app)/[slug]/okr/theo-don-vi/the-con.tsx",
    "apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx",
    "apps/app/app/(app)/[slug]/okr/theo-don-vi/vi-tri-bo.tsx",
    "apps/app/app/(app)/[slug]/okr/theo-don-vi/viec-cua-bo.tsx",
    "apps/app/app/(app)/[slug]/okr/toan-canh/toan-canh.tsx",
    "apps/app/app/(app)/[slug]/okr/viec-cua-toi.tsx",
    "apps/app/app/(app)/[slug]/tin-hieu/danh-sach-tin-hieu-trang.tsx",
    "apps/app/components/tin-hieu/danh-sach-tin-hieu.tsx",
    "apps/app/lib/messages/okr-vo-khu.ts",
    "apps/app/lib/search-param-keys.ts",
    "apps/app/lib/tin-hieu/tieu-diem.ts",
    "apps/app/lib/trpc/cache.ts",
    "apps/app/test/khung-cho-don-vi.dom.tsx",
    "apps/app/test/khung-okr-truoc-r1.dom.tsx",
    "apps/app/test/messages-guard.spec.ts",
    "apps/app/test/mot-nut-tao-muc-tieu.dom.tsx",
    "apps/app/test/okr-theo-don-vi.dom.tsx",
    "apps/app/test/okr-trang-don-vi.dom.tsx",
    "apps/app/test/tieu-diem-sau-hop-xoa-tin-hieu.dom.tsx",
    "apps/app/test/trang-bo-okr.dom.tsx",
    "apps/app/test/vo-khu-muc-tieu.dom.tsx",
    "packages/ui/src/components/khung-xuong.tsx",
    "packages/validation/src/okr-tham-so.ts"
  ],
  "thuocChup": {
    "sha": "51403986a1bca580e5b9c371d02bc34a67289bfa",
    "n": 735,
    "digest": "b3ae4df1e993f4890c1ddf50971f4b5b29c05a9ee346a5208a55c39628978450",
    "tep": {
      ".github/scripts/test/phan-loai.test.mjs": "261f68bcab173e7c233a13d172a633b43ffb49503e07fb117757b84cad924b87",
      "_acceptance/bam-kr-mo-chi-tiet-kr/evals.yaml": "3a29f5ac88c76e18e2499cba73b76ddc7d75bc289fa78313fb076825cafdb304",
      "_acceptance/bam-kr-mo-chi-tiet-kr/rang/cap-chu.json": "17893f0254ac3498fc024f37a5744cddb6a1ae319e6501e4d4c188407371a3be",
      "_acceptance/bam-kr-mo-chi-tiet-kr/rang/cho-mo-ban-ghi.json": "cd6eccc804ea9b5e0d4bef3c2cc53dc2bb2c46e0ce9cb4fa02b657a50ab94eab",
      "_acceptance/bam-kr-mo-chi-tiet-kr/rang/chup-hom-nay.mjs": "e05afbc8e25e74a355b0382d3e85c8070efbc55ab9891eaf46191c6eb3e16341",
      "_acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs": "83f50b238598ea43e4da06a133ca679dbd0935692486155b61d8d68cf4aa23cb",
      "_acceptance/bo-cau-hoi-mau/rang/do-bo-mau.test.ts": "4045f221a89dfae9477e72a2bcae44afe88640d1dd6ca614615234f4b42660fb",
      "_acceptance/bo-cau-hoi-mau/rang/kiem-bo.test.ts": "6de051839243101755d1bc549371b590b09371bd655b392b45208b9bad3b61ee",
      "_acceptance/chat-an-toan-truoc-r1/rang/dem-doi-truong.spec.ts": "28af3a1eedc19126a24cea60132b3b2b93faa64e5b67781ffd7d6aa08fecd77d",
      "_acceptance/config.yaml": "e8934eeb23570758224e6b0edd168a55a8694d0ecf5b97bf81b479099d4d408e",
      "_acceptance/e24-qua-han-khong-phai-ha-tang/rang/kiem.test.ts": "0e8a5cb89935ab8c95f5623381b3837fee821d87e28fd5ab6e5fb2dc9eff5c77",
      "_acceptance/hoi-dap-okr/rang/do-hoi-dap.test.ts": "385daae0f516778a3f58551f0350b0329ffccc645c84548bbf7227626b1ea483",
      "_acceptance/kho-nguon-khong-ket/rang/dem-ket.spec.ts": "a028d96c6a360d82710d937775fa07f039745073cca95cdc25e3a60a46bbc9fa",
      "_acceptance/man-xin-quyen-co-rang/rang/ban-sao.spec.mjs": "3a36154a24ffb662d1488ff3c96b059cb9dc9bdb58606f0108f744f9b5aad7a7",
      "_acceptance/ngan-kr-mot-cho/rang/giu-ho-so.test.mjs": "2d6e6f81fe1514a1a5a741db9ce9e516aa1f06724eeffbc146939cdcc520f9c9",
      "_acceptance/ngan-kr-mot-cho/rang/loi-console.test.mjs": "2bde5362e2df6f8c96046ed4ff67768f71e096724456ac0b3b5a60d0e9c110e6",
      "_acceptance/thu-haiku-tro-ly-okr/rang/doc-so.test.ts": "41cdf3e2435eaa437401d85c1aec5c7698a602d38e7ba3570ea3375f12428e9f",
      "_acceptance/thuoc-7-ngay-loc-pr/rang/do-7-ngay.test.mjs": "97b44e1e2723057363556ae2a3af43b7371a2884a8b062b453a7bb4504058aef",
      "_acceptance/thuoc-tro-ly-okr-khong-lot/rang/kiem.test.ts": "01daa9061ddb53508bb1a67ce51899f1d06e7213c75d38c5a50e434098b073a4",
      "_acceptance/tro-ly-doc-kho/rang/quyet-do.spec.ts": "73694a51d72c8d38144a239db845f471555ff66d9a48753bdcfb7c9b5b6bc496",
      "_acceptance/tro-ly-kho-dung-phien/rang/dem-sai-phien.spec.ts": "241e6cddb844099a3507b8fdf601d8a76300c1cd3a63f3911f5cde904a2ba8f7",
      "_acceptance/zalo-va-cach-ly/fixtures/zalo-va-truoc.spec.ts.txt": "e618ab88018d3bc3e9932eea2041b4816d72ca4412b0a78932e0d9f677598fcb",
      "_acceptance/zalo-va/rang/dem-getme.spec.ts": "eb87dbc6fce642c85d00b53de6fa909fe284d7db1183bc233e91b0c5a7db7560",
      "apps/agent-okr/test/app-rieng.integration.spec.ts": "aca7004baadd025c79fde24759d626635a004d73b4936799a2ae6cddbb6a629e",
      "apps/agent-okr/test/ban-nhap-trung-khoa.integration.spec.ts": "fd44652239929a23ce5a6f0c88e74825495b891a15ffe7905b110969e9e05052",
      "apps/agent-okr/test/cach-ly.spec.ts": "5ce11b3bc55ebe0c26c377e725d06a36c657c8a51eaeadb14e421875751a26b8",
      "apps/agent-okr/test/cay.spec.ts": "8ff065907a92da10e9a4435e7171ac91f6c498a55fcbab7de1e0dd01696364e1",
      "apps/agent-okr/test/chi-phi-hoi.spec.ts": "c74aedfb26f53e49561504ab7f5bf6482af5f4f996276e1e5f1f6cee07d4f8c4",
      "apps/agent-okr/test/chu-may-sinh-ten-moi.spec.ts": "7883d6a131418a3ececb21cef249574dfdb74bd4f989274463f1a192e6836244",
      "apps/agent-okr/test/eval-soan-cham.spec.ts": "c6f50cdc24969e091b54dccba3307eb9d8b3bb73506eedf1c4fef9fe924462ae",
      "apps/agent-okr/test/eval-soan.spec.ts": "bcdc721059a0cc68f05e9560422c1ec2ed5cbe830f95986e15080ec209559d0f",
      "apps/agent-okr/test/goi-soan.integration.spec.ts": "f9611cda4c8fcf811c7aa68ded66e48a0314286a33489ed61c47dcbd7601bf43",
      "apps/agent-okr/test/hoi-purpose.spec.ts": "757a694c678d2d4f872ec8ac3d5eeaf20b42ead7ce63c47eaf0262b15d6b05be",
      "apps/agent-okr/test/hoi-quyen.integration.spec.ts": "7fc164c08ab0bf76130a6fffd6bbb56679c3810d7e87bc86921ae3bbbce3af7a",
      "apps/agent-okr/test/hong-chen.integration.spec.ts": "8ea8f6d6352191523cc127e38be470aa71c698be00782626c5b78289ed7c34d3",
      "apps/agent-okr/test/judge-zdr.spec.ts": "0dcac41c589c268241d53737b1c403938d6cda3135fca2c457fd5db5f57819dd",
      "apps/agent-okr/test/kenh-cua-hoi.spec.ts": "2924ea43fc4d7fac8545b68ae47d6e0237fc6a9715bf4d365784b9a00be5ecd1",
      "apps/agent-okr/test/kenh.spec.ts": "ed6cf629dfa723b2d86547c0bb7bd1471c4f0987c05f538a0663a9ff4ce063bd",
      "apps/agent-okr/test/khoa-eve-khong-tranh.spec.ts": "0eac5d6a71dc317a9e8843c4a76573061d224fed3bff53bfe2c3dbc267bedc54",
      "apps/agent-okr/test/khoi-dong-don.spec.ts": "8f3a9414681bebfc56aa6f16a6595f1d6d404170cdbb2f460ee3b8481aecb478",
      "apps/agent-okr/test/khoi-dong-node.spec.ts": "87be5a4417fdf0fc59c0b5ec1cd55b99953482704dfde7540da404bd4fed4d40",
      "apps/agent-okr/test/loi-dan-theo-phien.spec.ts": "fad93b857c99cb32b480c7f27b8cbae4ffb102b48a8db53b6deae68b6539950a",
      "apps/agent-okr/test/loi-dan.spec.ts": "19fcf3773c5b1f2bd9a5feefe684b425f1a6c240794a592a2ee5edcba0b32dc3",
      "apps/agent-okr/test/moi-truong-model.spec.ts": "eb0d402a5ac5eb3b8661850b26a1960dfa66389e9f003bcfe7aad1801e1446de",
      "apps/agent-okr/test/nop-ban-nhap.integration.spec.ts": "d990528b17f101161d22e154301ccf52f02de36e2085b2e7d31f5a116ec2b819",
      "apps/agent-okr/test/nop-tra-loi.integration.spec.ts": "9bee45a5f5a099274569c38b44833217479a69c8ca3312179b1305425bf13610",
      "apps/agent-okr/test/tim-okr-chu-ky.integration.spec.ts": "3f0577a0256b146cd47dadc2c3bcb5d456c1d27158c28a41c0617644e2bd8ed7",
      "apps/agent-okr/test/vercel-preview-moi-du-an.spec.ts": "a7fa06179747ac1d440c452440e674823a0d813941f932cd0d30e620c3b317d6",
      "apps/agent-okr/test/vercel-trien-khai.spec.ts": "31962c493a9b822388bf86e2dc5995c07ef1dbe8033eede619fa5eb46d6d8578",
      "apps/agent-okr/test/zdr-hoi.spec.ts": "c0022391c876f0c5c99a3dd0410483334fa834f5dff5bbb98395a636e038c9b1",
      "apps/agent/test/accounts.integration.spec.ts": "2b18e84870e24e98fc3a746318ec56dee6fcae1aada220d469cedd075e35b5f4",
      "apps/agent/test/ai-bao-tran.integration.spec.ts": "663ab4004bb1137cf1c3ac4673aefb0628bc8a4b4815bd24d5c383efbf9d2786",
      "apps/agent/test/ai-doi-soat.integration.spec.ts": "fe4d900688aaf0afd2206f3e64c28be0a89eab67e55a4c6cf0d1dc79b8066a4b",
      "apps/agent/test/blank-facts.integration.spec.ts": "856a6bbb61cbbd83137882cfa1ab0e068f88df3673be695308ab8c4cf752a7ea",
      "apps/agent/test/brand-mapping.spec.ts": "551c80c32ae73a97c53c6474bd7eb6a8e93f0f0c25a046b7cd9c9d55c59ef8e6",
      "apps/agent/test/builder-runtime.integration.spec.ts": "716821ac105c35e476129b02254de32d9918f4e2852c10e85193457e1dbd035f",
      "apps/agent/test/capabilities.spec.ts": "7e7f049b912aedb238773f6ae0537f1c1db98def28757645af58e3c1e84492a1",
      "apps/agent/test/cau-hoi-het-han-muc.integration.spec.ts": "1e518ca58e31f54456c67c79800032054a0a3a483374ce8041e2998892cb0cf5",
      "apps/agent/test/chan-khuon-bo-dung.spec.ts": "ff908fdac82ec94b4fe644838f8c62ff67d5fb141087b85d6848e083a355ba8e",
      "apps/agent/test/chan-uy-thac.spec.ts": "3dcdc69a992d5f5e3852ed0dd050a43afbd2d2e4afda8bc14e7c1ee488b135d7",
      "apps/agent/test/channel-auth.spec.ts": "d3cb137c10ea64c9893ef28fd44ac82d2709c72aada128aa28f8bda19c0839d4",
      "apps/agent/test/chat-an-toan-truong-chu.spec.ts": "9cbfc82b9e86655f0a934008470246b0b48270512d26981f72ff186b2b52d813",
      "apps/agent/test/chat-an-toan-truong.integration.spec.ts": "6d14c53f84dc4f041a3c7eb4b3cd1d262cd92e4d5646a4585c722bd3f3b22a8b",
      "apps/agent/test/cho-tac-nhan-lau.integration.spec.ts": "012ccc2eced0af8f2b0e22809f6fe71ba898c0b1f132b65ce4d4599b26e89c46",
      "apps/agent/test/chu-may-sinh-ten-moi.spec.ts": "1a4fddeefa1aaa8de5f9826f8ee053631ad25552d56b0ed2394721edb7ffebb9",
      "apps/agent/test/close-task.integration.spec.ts": "231de563dd5de4e05bc89e2d69235c41736e46df655d44aa766f5a178c2380fd",
      "apps/agent/test/crm-token.spec.ts": "5c8461ce54cd396c4db8cdb3c7b16af7fd94e2953c4d9bed20714f0c12222393",
      "apps/agent/test/custom-agent-runtime.spec.ts": "673fc59ffbde5e3e50d432ca7735d14ac1eba51165b0576c96760f9770e8a786",
      "apps/agent/test/dieu-phoi-va.spec.ts": "7b362617379f9871b1c74190c38a8729340a4b1e24dab724e84457d647f313a9",
      "apps/agent/test/dispatch-health.spec.ts": "3c00596aa16f3ab9548106dd8c5988f0bbe1b9154d5d24ca1dc842b6162185eb",
      "apps/agent/test/dong-luot-tac-nhan.integration.spec.ts": "4d77d61305e813faee506f18dad39694a0a750629d21f264be381ffafb627909",
      "apps/agent/test/drain.spec.ts": "e7f98b2b028cb71fa2cc3a5df32ffa5bdbd4215fb713fefd27674cc1a5303c81",
      "apps/agent/test/duong-do-tro-ly.integration.spec.ts": "d2f6d0de2726c24c55ea722662230e79b96e5432266c73294520c61809976cbe",
      "apps/agent/test/durable-agent-runtime.integration.spec.ts": "79a5f26543cde54c0926f72c2770560ee889d6b652857b130daf22271e0d444a",
      "apps/agent/test/enrichment.integration.spec.ts": "2d7e312c2d9240b30511ab5dcedbf7aff32e7c3fad4767ab41c2e7bd0ee59a0c",
      "apps/agent/test/event-persistence.spec.ts": "72dd397c5f9a27d82f324d10956dfb71221e0ccd2210377ae7398f643b1a3d31",
      "apps/agent/test/evidence.spec.ts": "4cd50daae08fd68ee4ffb8392c85b2a30c11b219158c3b48d8d966acc2c09693",
      "apps/agent/test/facts.integration.spec.ts": "d82f50404ee8f15efd00dce4086eb030df0e7a405153f648a39c6573e7afa868",
      "apps/agent/test/giai-doan-agent.integration.spec.ts": "16094c93f2fdca790c2965bc7dde070adce4c54baa90c3533a4d36865018016b",
      "apps/agent/test/goi-y-mo-ke-hoach.integration.spec.ts": "22e2c8189dfc34666afa72c876f3015870f4220265c433f9ecb1e0ef2d329901",
      "apps/agent/test/han-muc-phien.spec.ts": "68d21c4719564e4c8c3a6283f06e36f0a9477b46cd00ab1b386aee0bcc480c1a",
      "apps/agent/test/hoan-thien-hoi-crm-qua-zalo.integration.spec.ts": "35753950fb598c7f191c138656be022e5c25ef3e9dc61217b6858f5b1e428482",
      "apps/agent/test/hoi-crm-qua-zalo-nguong.integration.spec.ts": "c15ef0e31fec6c9e370d1e2c37e6498f0a0288ec3e59bf52a15471bcdcaea489",
      "apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts": "2561f93e6853c9d47a8ff8377177d389d1280d11220e91b6e0fbadcc369884b9",
      "apps/agent/test/hop-dong-mau.spec.ts": "8ac5ec56c195fabe4f9a8e7d417f2337581f0756d4e0d25d9b0989d915888c9c",
      "apps/agent/test/identity.spec.ts": "db23d9ba53261f811974f570a41f136f29a1ae4c329f5f5b8c89fe8286564ffd",
      "apps/agent/test/images.spec.ts": "75b2cc086a20f883d8d3be265845561d493c126904082aa3d308580254637e39",
      "apps/agent/test/kara-khong-ghi-de-truong.integration.spec.ts": "bf8f5f671bff546a0b4c6412d1cb1fa85f36530da403f992482fcaacb99b9e91",
      "apps/agent/test/kara-mot-ten.spec.ts": "aac5b96b69255cdbc28b2703279d7afa633db1c6656dbb134c14d9dca46c2ffa",
      "apps/agent/test/ke-hoach-sinh-viec.integration.spec.ts": "a44035e5eefb9c6682bd5dda86a69fa369c469dc9244203388ef401543ee847f",
      "apps/agent/test/kenh-chi-okr.spec.ts": "815f837e118080cce74a16603b07e7cf3eb2fbc64ed471e12b6ab6f0f9e65035",
      "apps/agent/test/keyless-brand.integration.spec.ts": "6b5d111ee2259e5613e40e4a7543d06d72fc69f0a9191ef3fc67b3368983ec8c",
      "apps/agent/test/khuon-di-dong.spec.ts": "de2c0bfe048b3912f099effba9ef308438ab1720592153ff7a4cfb42f42d9d07",
      "apps/agent/test/lanes.integration.spec.ts": "2e13a4e531de691b8898be06d129bb19d3cc81c1f50f4bb8f02f8db8178d2eaa",
      "apps/agent/test/lo-trinh-san-pham.spec.ts": "9b982e66b91b34a86b117d20628b870f0c1d74bad2bd38f2e8344ff3fbbfa805",
      "apps/agent/test/log-loi-hoi-thoai.integration.spec.ts": "3792844de27250664987174c251ef22e0b8fce85125faca2bb5b6bc8fcb8461e",
      "apps/agent/test/loi-tac-tu-zalo.integration.spec.ts": "e38aae9501a328ba0bc008dbb2ef73846faa4398b64fc6d68571f5007f0712d7",
      "apps/agent/test/lookup.integration.spec.ts": "560daa6b5e7e7244eb86eefecf5425d4bf8da19fd2b40521766f8392734e369a",
      "apps/agent/test/luot-tu-dong.integration.spec.ts": "8aa3aace4898350cc4acfcba52ff8c8093ad69b76e1de439546137296525f8a1",
      "apps/agent/test/ma-lech-viec.integration.spec.ts": "b46ebdbeda9f38fd6af60e8cebe43b72ccdf03eb74c43654baf081b05570f4ff",
      "apps/agent/test/mo-hinh-khoa.spec.ts": "7ce12ac1840161ec1c4031dec378fc14955bf3184dbfbff8fe1ca4163cf8cb6d",
      "apps/agent/test/model-lui-mac-dinh.integration.spec.ts": "318ecbac598a636dabdde84b77fe7016a93ec4f064db1eb5ccfadfa1aabefe01",
      "apps/agent/test/model-theo-vai.integration.spec.ts": "2c8e23559f772df8a81afa42746f5be3c7d8b5eeb90d066afa81b81df40ebda3",
      "apps/agent/test/model.integration.spec.ts": "84bd37b2b24450c82bde3b6a09fa6abeef48afb8339ef1c8cbe80830d79d739d",
      "apps/agent/test/muc-nhac-okr.integration.spec.ts": "d1c0000a34f432b5890203e9af5cebc3894e495b9113e0f3ad39b9d4abd606d6",
      "apps/agent/test/muc-nhac-okr.spec.ts": "b97768e2c43ef57c74f89866997bb9abe0b2d9650ab15e4c08ead7d59afac0ad",
      "apps/agent/test/names.spec.ts": "c66253c3b7fd8340e81d2dbec987c3c31afb4f0871ceb2f10c90b29b199de4ba",
      "apps/agent/test/nhac-ke-hoach.integration.spec.ts": "1a69feb756ad3d120f53dc1028d63d72d3ff6b4946e6ceac482f1dafba3498c0",
      "apps/agent/test/nhac-moc-sang.integration.spec.ts": "252cd38c550d6b824aba1f76f86f50bc5d6263b963b44a7f6de6b2f3d96415e7",
      "apps/agent/test/nhac-qua-zalo.integration.spec.ts": "7f24d05584994c15f127d28907f0f4878e729c926f0805ca323468ba9da25e13",
      "apps/agent/test/nhac-vai-chi-okr.integration.spec.ts": "a4e47b00d73a69f8f5fb82e0599b77631dd11c5dc637af64a06a6afa7b7e50cb",
      "apps/agent/test/nhac-viec.integration.spec.ts": "fee73f972104987c2a59b7f9e32609178c2abf947bb9a3482fd96059f7d4aa91",
      "apps/agent/test/noi-zalo-cho-nguoi-moi.integration.spec.ts": "5edfb11710dfffe2f5158ff0a95904bd0ee7118510a3610e3282d7ae73a0e597",
      "apps/agent/test/nop-ban-de-xuat.spec.ts": "2f05d0518af42456d172289ef1b96b97bd4b2e464cc4bfaef5f29a7a77097504",
      "apps/agent/test/nop-de-xuat-can-cu.integration.spec.ts": "ba53724e83a71ae72c3fe1d6f75556cda042b61fbecf2c333288cade549b1536",
      "apps/agent/test/okr-ca-gop-y.spec.ts": "23e881a145c805e6b78f28963c62911ff12c82734776ac403f9ca07e74ffa5a9",
      "apps/agent/test/okr-ca-quy-4.spec.ts": "91beb5b71575da40faba6da6863e80b759aac723ea62f451e68df54e4a98a5f3",
      "apps/agent/test/okr-chi-dan-tom-tat.spec.ts": "c4724fe404ebed216ee63ec2ea1f303a46a2edac920c58c8d0d2d4e58132fdfb",
      "apps/agent/test/okr-chi-tro-ly.spec.ts": "0b939116d5dcd322a7ff7fd260c168a8e972c5504427f0e89c747ecbab476c78",
      "apps/agent/test/okr-chup-hieu-nang.integration.spec.ts": "decfb849c656cf5e3f78ccd263b400827567891f8b4203394c7cc66a4524b8e9",
      "apps/agent/test/okr-chup.integration.spec.ts": "6f2ba322fe5baf1454a1df41091cd0f223207fed66c93cf46b8e0306e3968437",
      "apps/agent/test/okr-chuyen-tiep.spec.ts": "1f6a8dd224b15f5206268bbc44d5a912b6cb680d6ad476cf3dde13f20977bf87",
      "apps/agent/test/okr-dich-can-chinh.integration.spec.ts": "3c454a20a122ceab6973c019493eb98aa004ec92bd1d13f091841cc071583935",
      "apps/agent/test/okr-hien-thi.integration.spec.ts": "483db67c5080f2a07a268dc5dd750fea2e771e50da29b971b86da9193f97bb73",
      "apps/agent/test/okr-nhac.integration.spec.ts": "f01dc12a71eae7498abcc4a73e102a2d26c6f3bee8388ceb4adb9ca5017ba2fd",
      "apps/agent/test/okr-sheets.spec.ts": "835a74b2d06c45967fd0f06d3543e16826a2869c96778ce40a80c11f338188fd",
      "apps/agent/test/okr-uy-quyen-ngoai.spec.ts": "74eff880b02bac1aff00e5d320bde92373353cfc9c4287433de32d88d8f6560c",
      "apps/agent/test/okr-uy-quyen.spec.ts": "4970ed2466c5197510802572b36c1e3161ad23014c45240ab929aa50424926c2",
      "apps/agent/test/people.spec.ts": "392a16ca1e1117f734ba00ef395004d9a41bfafbf99a6c3990ec8018e28cb300",
      "apps/agent/test/pool.spec.ts": "7cfb3547fbd78a21920e11932148dcfb36e0412a5a6a8859e93d700baa0d6f16",
      "apps/agent/test/portrait-bo-qua.spec.ts": "b7cbddbebfabae7aea152a3477b26e2745e930297ee7ac18fb6f2fcd6980e0b7",
      "apps/agent/test/preamble.integration.spec.ts": "c4ce14751a64ed15b65f2ad3e090aa7092c35dfbce15930dbf9f4d97b87b6243",
      "apps/agent/test/quyen-luot.spec.ts": "e84c28af7f5dec3f32ea0f387b104ad717cca161aa4b787658916d4b6b843aae",
      "apps/agent/test/ro-slack-tac-nhan.integration.spec.ts": "88c420ffcf18332726ad9affe27a125074bb0bfc2931c0db459ba231942001a7",
      "apps/agent/test/same-value.spec.ts": "d7c9a4add6ad062d16efd51cb29f12e5fe1a65c2719be13438857684b6ec136d",
      "apps/agent/test/slack-membership.integration.spec.ts": "6009d1f3b5a5b1f8d4f81d2470df7c5e33f5c292ca718ba8170760ffd87a8e60",
      "apps/agent/test/slack-people.integration.spec.ts": "3aa1b95e9a8e1d770e48fad5d06d659b90a4b24992262efba6ed8e911b18699e",
      "apps/agent/test/slack-thieu-quyen-email.integration.spec.ts": "5fc84ef5f24fcc5d053bd4ef63ded5fa663a049b295357e583fc18c623946540",
      "apps/agent/test/so-chi-phi.integration.spec.ts": "d68d4cfc8d3b4ec0adc239335579a61f45b84ad2f49d120201dbb43e0448dc8c",
      "apps/agent/test/socials.spec.ts": "8b80c027f953dd93156e7f6ffee527e165c16044e8b74cde8446f60992b14437",
      "apps/agent/test/ssct-nop-luu-tru.spec.ts": "423a3e29b6e4b0cd868691471cf223716310fb46894ff144f5d5cdd3b2adaa27",
      "apps/agent/test/stale-tasks.integration.spec.ts": "a3ac57c508d57c1948515717d574090875e91f96eb20502fa9d67e2116fe9c7b",
      "apps/agent/test/tac-nhan-giao-viec.integration.spec.ts": "1bf068c01a938b09f942bc7b0ad97345bbfc88ea3736e83e46a7a813c8230047",
      "apps/agent/test/tac-nhan-va.integration.spec.ts": "b93d1cbc1c854106701170d56c8a21f4559e84c8552b52877ebec7ba5930919f",
      "apps/agent/test/tai-lieu-doc-chu.spec.ts": "ed30f29f0bb6b5ba6930bff0411e87275f023c6358d673592fc1acf6f9183279",
      "apps/agent/test/tai-lieu-khoa-rieng.spec.ts": "eb10d4e6d5ced730a3b251263a812cf4d8c15e69c86ded86336b8bcb1df12789",
      "apps/agent/test/tai-lieu-nguon-mo-coi.integration.spec.ts": "ed480755d4a85c1a725504991c3494321b5e6745cd2fe46c5a7f774c9b71ba79",
      "apps/agent/test/tai-lieu-nhac.spec.ts": "3d6e3b86c7e533c943e7beaddba6d6071ae639342a335a30e6ac17b6a1b3a861",
      "apps/agent/test/tai-lieu-ranh-gioi.spec.ts": "387e50eefeda8eaf9c5c060c1995e1cc7bfa5ca211e6263db519210aadfce2f6",
      "apps/agent/test/tai-lieu-soan.integration.spec.ts": "3e80d502b3ceab257170fe1fe063ef220dcdfc9e447b267cd2b375913899f132",
      "apps/agent/test/tasks.integration.spec.ts": "1296d9d37f3d25aa2e46ca68bb798cc68f44ce4591885d7f4a75a5d1e04f1558",
      "apps/agent/test/thong-bao-doi-chieu.integration.spec.ts": "1bebaaa7c67916ccff69f09f5e8f2857c3a6805a427830ad673ca2a9ce3ddbc4",
      "apps/agent/test/thong-bao-duong.spec.ts": "fc241b40dd95d1bc567fc53a211afc1180640ab0f65de7cb6e20e2f7601874e4",
      "apps/agent/test/thong-bao-ghi.integration.spec.ts": "0ebe602f3e6dcfaeea97b8086d3f9a1fad03b5e062e44377957b56a36c90ba39",
      "apps/agent/test/thong-bao-kenh.integration.spec.ts": "008f197cefa82b4eb97dfcd2f48e4e7c8ad6d73c1fd6d686e3e10c20e5746754",
      "apps/agent/test/tim-theo-so.integration.spec.ts": "a6f4eaf37c811c4cfbcd0c8e2682a71c1793616f2b476b76f402c301f5cd4070",
      "apps/agent/test/tra-cuu-thuong-hieu-viet-nam.spec.ts": "ab2a2663c6ff01a497f037c8387b0771832473d11c5ee2a9cc842f63db156f4c",
      "apps/agent/test/tra-loi-tin-nhac-nguong.integration.spec.ts": "cdc849495b8fdeb3abac29806471e51cf5ba380e3d92abf196dcb2c06e522b67",
      "apps/agent/test/tra-loi-tin-nhac.integration.spec.ts": "72e2350890cd4f7fb2da51b8505750023870b31e40bcfde4fa814ae1c9367c44",
      "apps/agent/test/tran-thang-hoi-zalo.integration.spec.ts": "41bea7c86b20db64f03601eec5b68b6096aab3e12f451a9edaf9a72832b515e0",
      "apps/agent/test/tran-uy-thac.spec.ts": "31899c9c112b6e618505bf14c7995bc8da4f4372f32857d732dee3cec8eb638b",
      "apps/agent/test/tro-ly-kho-bat-dau.spec.ts": "1a604bd34c425023e918fb0717f8c261e172ba4362a012d82135c7bdb2adae03",
      "apps/agent/test/tro-ly-kho-boc.spec.ts": "961e5b351b090a367ce280401b25e57e7ff6a49078a178dc975c456057b265b3",
      "apps/agent/test/tro-ly-kho-dung-phien.integration.spec.ts": "577607b61456f2fec845b1e7113669e0cb71995c458fb0ea5ab22d29e7d67a1b",
      "apps/agent/test/tro-ly-kho-loi.spec.ts": "d3ce73c30e3353f4fc676b3e7f2a021836bef17ed99e20adc9b79d1074f73b1c",
      "apps/agent/test/tro-ly-kho-luu-tru.spec.ts": "aeb9f103b76fec24e18f66c7513f663dc12513f4f601f336c13bfba96829ec9b",
      "apps/agent/test/tro-ly-kho-nop.spec.ts": "47903f7f61479c203189281668c842133d950ae8b9b60ebc0ce8ab2ef84ac2b5",
      "apps/agent/test/tro-ly-kho-ranh-gioi.spec.ts": "89456fd07f84f7938c47c14c88363a7d2384e7c01209a0522453391b4e986a2e",
      "apps/agent/test/tro-ly-kho-tim-doc.spec.ts": "48e6fde65bc9e35c53c349a9b756c176c1ed9f42d3d06fde4c0c1a8da4056889",
      "apps/agent/test/tro-ly-kho-zalo.integration.spec.ts": "148678c1531cce0c742299235adf3a17da62cc043ccac341d53533dcc6223dff",
      "apps/agent/test/tro-ly-okr-cach-ly.spec.ts": "29bd5ee81869684243d9025079d5f46a50187647594b14e3a54aaa62ca1a11c2",
      "apps/agent/test/tro-ly-okr-dong-viec.integration.spec.ts": "a16e31c1454b1e6ac66d3890b21cbd22d88b8a13d107db1a14fe29c38d9527df",
      "apps/agent/test/tro-ly-okr-duong-do.integration.spec.ts": "ce7326fceabc1579cc89aa34c4ed4a6ab6f47195b076b056b234275b4c926c69",
      "apps/agent/test/tro-ly-okr-giu-viec.integration.spec.ts": "902940a8ef3af7e412ecf5d29ae503768960bb4e3c97017d2f5efe6d868ee866",
      "apps/agent/test/tro-ly-okr-goc-zdr.integration.spec.ts": "ae37a567913a42ff708098197d2862ba1af8084a72a53adebb2c607c7dc8ce11",
      "apps/agent/test/tro-ly-okr-khong-khuon-ra.spec.ts": "f6b4f6161217654d66bcfc6c74e7921842653cc321e9f9e8fa372ad6d646bb8d",
      "apps/agent/test/tro-ly-okr-lease-theo-loai.integration.spec.ts": "7185586202191dee9dcf769ac22870d5f52026b05a2d8ce681d5cad4918db107",
      "apps/agent/test/tro-ly-okr-lich-tom-tat.integration.spec.ts": "f34f4ad1c6db1703d8824cd7b7a0511f18d7f03f4d8c60e500af4ca08c785c8c",
      "apps/agent/test/tro-ly-okr-mo-hinh-thu.integration.spec.ts": "cdf49a47918e9a7733de98295d195c486ac6c15cc893d291e123408201f7e03e",
      "apps/agent/test/tro-ly-okr-nhac-tom-tat.integration.spec.ts": "9e98a8afca2e99e1bf1a8eeefa34b9df45448c9fb278b7e26b65722def3461a6",
      "apps/agent/test/tro-ly-okr-nhanh-can-chinh.integration.spec.ts": "88eadefa175443794e42928d4831d1c39a9e17f767727f03f152546b3affd3b2",
      "apps/agent/test/tro-ly-okr-nop-tom-tat.integration.spec.ts": "a468b934be0239cad0465c5302da287256913014740e7d71741acc8c2002ec1a",
      "apps/agent/test/tro-ly-okr-nop.integration.spec.ts": "9409f57cc7db05a1f5f41643e1b4018d95e0c3af2bc50dee7fcd99911e28bcc3",
      "apps/agent/test/tro-ly-okr-san-sang.integration.spec.ts": "970a88dea1abc8b2a9aee8937916544b02c7806bd5ef63675e9f40ffe3c709de",
      "apps/agent/test/tro-ly-okr-tom-tat-duong-do.integration.spec.ts": "57ce2d96ecdaec858c39569ff8b558ee29440816d15674d1d7b1fbaaaec711d7",
      "apps/agent/test/tro-ly-okr-viec.integration.spec.ts": "9877cfc16278aa5ca219b4c0aff0f4acf14c66e9ab0f2d41f80d9068bc0da2b2",
      "apps/agent/test/truong-tep.integration.spec.ts": "8eaa85a931131bbf5c8f4795292840ba3d168ad62caef639a7e51bc5fe3fd022",
      "apps/agent/test/verify-key.spec.ts": "ca619bc65ca0a008a614ec05759fb81a94d7c887a9cbb76c548dd4b3e21dff9d",
      "apps/agent/test/workspace.spec.ts": "8f262899781f886afbbab29d72acffbc3b04e16a1186b434b1bd4b4e66b7875a",
      "apps/agent/test/zalo-chi-doc.spec.ts": "3212e40b3ce77a9a9589645e598d291c780dc52d38943aa68057ebdf153a23ca",
      "apps/agent/test/zalo-goi-thu-hong.integration.spec.ts": "a3623e3cf4d12d0155dd92061ac7bdccece8df30bb91d7ff5e1b494574524bf9",
      "apps/agent/test/zalo-gui-hong-ly-do.spec.ts": "0a7de8d73849a2aede94e5ba79cac9a338767a54d8ddb52e1d2a3861fa3dbd1d",
      "apps/agent/test/zalo-hoi-schema.spec.ts": "6b13412374f87e397c47ea5fd989d80e36e969f38cbebfee10426483ada94fd8",
      "apps/agent/test/zalo-lenh.spec.ts": "875886c236e1859acbdb08aa08b5b4638b46dcc2426079a3098ddfe9309b6763",
      "apps/agent/test/zalo-loc.spec.ts": "8564ce49d89a8dac72bfa1d979af86ba8303e729a5582da0a4b22d9a2cb98296",
      "apps/agent/test/zalo-qua-webhook.integration.spec.ts": "450084d5108e63c3f218d885920c173f46df1712bc98839372e8becee3ded532",
      "apps/agent/test/zalo-va.integration.spec.ts": "15e9c96360e8b3c45f6dbe1e436982d741dfc88df3e1915719cb2ddd8f31574d",
      "apps/agent/test/zalo-webhook-doc-khuon-that.integration.spec.ts": "be3009385b10066da205169739b8d4fedea786ea4f4a02dda0ada38f71d24d5b",
      "apps/agent/test/zch-cau-thu-hai.integration.spec.ts": "d51bcaac6dcdf338abc1855fbdd00b6eb98ca02de55b120067b90340cb5ac0de",
      "apps/agent/test/zkd-chi-dan.integration.spec.ts": "ce4a30a2b0d225cc16c27b8c5fb6fce9c9394ac699f671c676f7718500b47782",
      "apps/agent/test/zkd-lien-ket.integration.spec.ts": "c54c0c30eae6becc2f438ac969dc3b0124bbff0f6c8e93aa424f5f543903895b",
      "apps/api/test/agent-delete.spec.ts": "873817425ad8cebee75a4dbb6490e208fe9ad58ca720184bcc70cb450311df9d",
      "apps/api/test/agent-events.spec.ts": "8efc9662c07f44565e9170094cd9f601c7ecc8f11b8f4481f87d0f83809b886e",
      "apps/api/test/agent-lifecycle.spec.ts": "741e00c8c23362395915140e7626a497f41e33593126e577dbc24618d43443d1",
      "apps/api/test/agent-queue.spec.ts": "c04ba46133d65b391fff4aa5a978039b5a4a9e80f339ea3eed8b95e173c58332",
      "apps/api/test/agent-runs.spec.ts": "c742f3a83e88c2461d3814f70bf2c8b26bb4ff95216246d9ca53aa7ee26f74ad",
      "apps/api/test/agent-visibility.spec.ts": "4d0ccdba88f171addfb3d9f7da98477827b99b9d29643159cf29036ae8be300a",
      "apps/api/test/auth.e2e.spec.ts": "76b915087ea30c8c54568d4551c4f4475d3b310dac805f2660312600e26c3fdf",
      "apps/api/test/bam-kr-mo-chi-tiet-kr.spec.ts": "531ce04dba9d16e3b5abee4d8d4e36406d11af439e22aade108aae76f903534b",
      "apps/api/test/ban-chup-lo-trinh.spec.ts": "9278a32b4cfffd3bfd2dcc8ccb93f2d2b8353ebfb35d184eb3319b4c241e7823",
      "apps/api/test/bulk.spec.ts": "72d36bcc5a6b858d0be2e7424eade5790ad8569d29e712fc94200f7eb6cfe70e",
      "apps/api/test/cai-dat-chung-chi-quan-tri.spec.ts": "211af57136e941d9fab209eabda3b146fa52c7b1a7d6d19a7bb63e3b0607d024",
      "apps/api/test/cai-dat-model-bi-go.spec.ts": "91d5856a2b862bc735025965ef72e9b761ae09cee36cbe642eab94bcf3de5bf4",
      "apps/api/test/campaign-schema.spec.ts": "4fd4d68a3f3d8d6992dccf971bd17208cb3e3b6a1b99eaff77f405360179011b",
      "apps/api/test/campaigns.spec.ts": "951c37410c8bc9a75317ba87b74030998184925bf68badbc3b42b40a3dc16306",
      "apps/api/test/chi-quan-tri-truong.spec.ts": "74ff545a672152de549c2368d2c8f3ef1254857a5b4c1d0fcc7c50fb9fb81e6c",
      "apps/api/test/cho-tac-nhan-lau.spec.ts": "fb8eb9cd1d04a04bc3059adf65a79c292c9cd98f982c65ad5cf8ab0275791c2f",
      "apps/api/test/chu-may-sinh-ten-moi-goc.spec.ts": "68a97881bf138dcc71d4968b44602b75ab2f5ed089659fb62ade7fde059d7de1",
      "apps/api/test/chu-may-sinh-ten-moi.spec.ts": "bb8dd2b64b23d255510d66fd85a2c8c6ad7ae88c63b1bfdc4be87d8adfe00380",
      "apps/api/test/company-requested.spec.ts": "8062fcd5f1f8d1b3655cd32a0eea8629d852843f13a3773ee4e3b82178acf67b",
      "apps/api/test/conversation-sharing.spec.ts": "3869a7adae16cd2a630a45036d7bc81b0aba14e3954d6e7e5dcf1ba8376e6c63",
      "apps/api/test/conversations.spec.ts": "1fa856b82bc469d00f36a06dab19e848ff8a378d5535064d72a4ca7d3b2677fe",
      "apps/api/test/cua-toi-ba-phan.spec.ts": "8e4862554979da539f8b774efd57f61c2ef44f1ec9a84543528f94260e247ff9",
      "apps/api/test/cua-vao-va.spec.ts": "8f176292492236fb4d0cf632eca95363fbc8ea07b97a3eb5a790cf4f53100db0",
      "apps/api/test/currency-totals.integration.spec.ts": "742d99722336d5e093040a1de25089357538d0c986b88bc015a7784e18efadf9",
      "apps/api/test/deal-contacts.spec.ts": "4878437964c7b5f4981d0f6256c6a66752214de98ef91cd69480915b86666e2e",
      "apps/api/test/deals-board.spec.ts": "390182e33691a9baba391466b6a51549cd1d4441b8507814b0b1c3ebe67094c0",
      "apps/api/test/dev-grant-needed.spec.ts": "295887926d0b0f1adb4896e41b397ae279559dc7ceb4528618ae88a0a44d1ccb",
      "apps/api/test/dien-thoai-ca-nhan.spec.ts": "0671436f59f16fe126ecbbf54ea61fe0ce02f40807927fd65a70e02ff322e79a",
      "apps/api/test/dien-thoai-o-deal-cong-ty.spec.ts": "09130fa35ebfd77fb8017d0ae7e96285f94f0247d40f1ee602a1ec4d3b9faad8",
      "apps/api/test/dieu-phoi-diem-nhan.spec.ts": "c0a33e0857aae2e48c9264c2e017bd3c921c42002509d259ad1a5c8ca011e6d9",
      "apps/api/test/dieu-phoi-va.spec.ts": "7330b9d7104b2c81b4825a20908dfe13831aa680cf8640d96381f83ec08af8e4",
      "apps/api/test/dieu-phoi.spec.ts": "a2ea6f0bd785b6b91e91f33571e3a532ae422c25d2191216cd0f505269091ec1",
      "apps/api/test/do-cap-nhat-cua-toi.spec.ts": "8b89dfbddfc1220344db0f58b2ebf8301c7b1e9785d2eee7ba055cd1a965f23e",
      "apps/api/test/domain-nha-tach.spec.ts": "bfaf00aef27e1250b87b9017055af1688be1cddb875995b47243999c96bc25d9",
      "apps/api/test/domain.spec.ts": "2e8782f099bc0faea5c10498baca797a7e62c887329c98d3cd88bc1cc249eb10",
      "apps/api/test/du-an-do-nguong.spec.ts": "d1d7be7f5944427717e5cddb1e359109e7acb0b40731587967aad773c2441bdd",
      "apps/api/test/du-an-lich.spec.ts": "ce1cfe48b16a4a2001e7cfbd0079e529b952526988a13d74e1c312414aa5d0ff",
      "apps/api/test/du-an-quyen.spec.ts": "63dc0d1d93503b5ac095816405c1f0cb337e6d5783c0e3c94d5a188948289ef4",
      "apps/api/test/du-an-tran-viec.spec.ts": "f26aff22dcf3f68119394b7f06df642c4cd2f9e7640696a8365470cac3d22a39",
      "apps/api/test/du-an.spec.ts": "fb970854a059a2bc1c2e5b074852a908d6530b91eb43b60804c3e5f3d35f5cbf",
      "apps/api/test/enrichment-copy.spec.ts": "ca300c6952e96209a7e0e86af47f11f717b8d3618c31834a82a820ae54f99b2b",
      "apps/api/test/enrichment-queue.spec.ts": "a897170cdd9a494b0530abe8e9a1979523ac16bf629083d84f83a3b4440bfb1a",
      "apps/api/test/error-formatter.spec.ts": "f0d72935a6e23f851d8b3ba564d428fb6324334e9602cff8f0c594fd7b679f99",
      "apps/api/test/fields.spec.ts": "559fe28facd2b896f6b7a8a724a138a5f01c1b045392f141a0373a6d391a239f",
      "apps/api/test/giai-doan-bao-cao.spec.ts": "895d9c1187082fb83a17ecbf5bfdc52e22efea3e3a526632110d5c7cacd55716",
      "apps/api/test/giai-doan-quyen.spec.ts": "b80eb3befb03b0370d5d3ce932e806a0f2b999d8f08c998a45916f132a64041d",
      "apps/api/test/giai-doan-seed.spec.ts": "443bfc68f716f5e057327b3ca3e30f3e7deebfa83a1da01e1a72e4f91b665de5",
      "apps/api/test/giai-doan.spec.ts": "1c88e8d792eb53671dd52705fdc58ce4ede1db22ed4ffbbf98ac490de794e7f6",
      "apps/api/test/gieo-nguoi-song-song.spec.ts": "8fea8709e657f64101ee831a4033e71887bf492a547ce39b6e2f92e3d8ccd00d",
      "apps/api/test/go-la-cat-quyen.spec.ts": "ec34e7e7f529e24fcbdb6effc16ec2a9935418e026eaeeff30d967cd37538dac",
      "apps/api/test/go-thanh-vien.spec.ts": "acda04e50048658f2328259c0a042d3e2324f05cf12b6769528d7f0bf0016110",
      "apps/api/test/goi-y-mo-ke-hoach-do-nguong.spec.ts": "68f90a71f5854c966c5c792a3623efcff10f2c9b9d995a5d491edc00306766ae",
      "apps/api/test/goi-y-mo-ke-hoach.spec.ts": "299198d1b1723b41db33d15def0825b994ed93c7057557a81c112b271a4221fe",
      "apps/api/test/gop-y-dung-cho.spec.ts": "20535f889fa8aa18a093447d05dc650d9d94c3522225b149300ace153c0b1ec3",
      "apps/api/test/han-viec.spec.ts": "62d4fcc5b00ea42e7f7a10162af975a88c04d52127f97bbe801c252cc726c5ef",
      "apps/api/test/hoan-tac-loat-bao-dung.spec.ts": "24ba20d722304fa9603a3d9ee17db6e75fd1e8b4e8966837a8d6a3a78be6a171",
      "apps/api/test/hoan-tac-loat-dung-id.spec.ts": "6d63e1124da187ad665aec870b2e7e36a19fe170294525bb53a3fbe6ad07d42c",
      "apps/api/test/hoan-tac-thong-tin.spec.ts": "be6bcd4ecd4e91445cb3f65c58732f4938c8f4e985370fb1d0689489aabbc328",
      "apps/api/test/hop-cap-nhat-lan-truoc.spec.ts": "e5be207794a607009bd95461e1e3391ffe2609a617035e1d37797235136c7650",
      "apps/api/test/hop-dong-mau.spec.ts": "02b9df86db15f3172e718cb29b02ac9be5bb941056ca0838f1bb419f9abf3a2d",
      "apps/api/test/kara-gop-y-luot-2.spec.ts": "816b636ddb1e2f2ff1801c36b0d3a0f6f4c52dee1dabcddcf4f4334ed7273f80",
      "apps/api/test/ke-hoach-ban-ghi.spec.ts": "7885c7e903539c6af47e2507e1ea7eeb865eb6268d95a0d116ee390153f88299",
      "apps/api/test/ke-hoach-sinh-viec-do-nguong.spec.ts": "cc72dc4ae75d0eb643a9c2d179bfa7d5272665709e49f0f7adf11de933da4f9d",
      "apps/api/test/ke-hoach-sinh-viec.spec.ts": "d9ac740eb45269a3ca5a23e09a35897ac02e4d2d4f970bf3dea8a7e6001807b6",
      "apps/api/test/khoa-api-ghi-thua.spec.ts": "9dd6d7cf8584db29eb79af04d445d84505d6feb05048378004ef7ae7c952811c",
      "apps/api/test/khoa-keo-tin-hieu.spec.ts": "12d2a23bbf88e30c3f8dac193f5e4c8e21adf97a0a5e5c7f635c322ac06f2635",
      "apps/api/test/khuon-mat-bo-phan.spec.ts": "d3ce334f84a7f6672de86a5b448eaf77c9a5feeac7001b8c58358c9330770c39",
      "apps/api/test/lich-bay-ngay.spec.ts": "b715aaf84e50e4dcf1b119cbb5685bbb56fee6ab2797b81a76594d29bb943904",
      "apps/api/test/lich-lam-viec.spec.ts": "64438977b4eef09ac9268a504e870dd66b71550211aa9298f19c529b2ce7caae",
      "apps/api/test/lien-quan-loc-ban-da-cat.spec.ts": "e12a5c957e1d76ce253ab0e949808277f7b2b96c51608c3142489ea92461fa18",
      "apps/api/test/listing-body-limit.spec.ts": "376a71bb279eacaddbc9d07ecb1569c2cf04fc41c055bbcf73a7daaf73483079",
      "apps/api/test/listing-fields.spec.ts": "07fe4c0236353f442223a753c6bb935595f77791cd1602c0c36c00b94ac6b320",
      "apps/api/test/listing-fixture-batch.spec.ts": "ad1007ddb4584f58c77b7cbeec6351ded7afbd105065f9ed19d69eedd991d52d",
      "apps/api/test/listing-ingest.integration.spec.ts": "647c4e561fec28b318cb40246328d2a872d7dfb01e58acdf28651faa8508bed5",
      "apps/api/test/loc-moi-truong-toc-do.spec.ts": "9d5c29efea45293f8beb833ba6936fb2250bbceab345a61338c3b2871cbc1ee8",
      "apps/api/test/loc-moi-truong.spec.ts": "3c036aac7f8b3b22819cd4c0c6d420369b6578a16e4d10cfc5920dd4215bebda",
      "apps/api/test/logging.spec.ts": "dd45dc6e45c14f00d4a28570aec651fbaa4ab4910e098e0a35430d379aa2c97a",
      "apps/api/test/loi-hoi-thoai.spec.ts": "dda839ee906495a63e268fae89b7177a9462cfe8ab7908ee5486e082f99d650c",
      "apps/api/test/loi-tac-tu-zalo.spec.ts": "3d7d21756d6eac85d6af8f0ef7958d5631a3d67c337949ff1547fd128b82a443",
      "apps/api/test/luat-vai-truong-trung.spec.ts": "a2c719ecc313fb2cab7a9f6084782d0cfe744909b1c5ba78579370354a66f40e",
      "apps/api/test/luu-tru-chat.spec.ts": "0e354662aed254cec786e57264bc1e2e9b7f15c891a69319ddffd5c9b85f4e01",
      "apps/api/test/mailbox-api-client.spec.ts": "2c175bd631e7c478536cfa76b464d4626533d03a9c00cb2a1b04c55facbc9fb7",
      "apps/api/test/mailbox-message-text.spec.ts": "89544565672739300b867b39c9cb9481f75812b238ce58ae76dbf3cb19090a43",
      "apps/api/test/mailbox-participants.spec.ts": "3e730b5871700c1bd375dda4551e7e010ef4fe9a70637653f250bb1606685993",
      "apps/api/test/mailbox-purge.spec.ts": "998a88413fff675cfea3469d7d795b74025c272f9f1b8e359122d3a6cc26b620",
      "apps/api/test/mailbox-scopes.spec.ts": "230c836fa4d0b9cbc69bfba9a75e9c5d8838095cb4258e8b41bb9661d34b0129",
      "apps/api/test/mailbox-sync-tick.spec.ts": "7521d346bb9447d6c1e9f1a0cc40132c6fce4e28d6c7fc109dcdf1f0d93eef5e",
      "apps/api/test/mailbox-thread-writer.spec.ts": "b07674d3f21c76288164df4729a5f15ab0b0444d4ed23fb9ee3ac106b3a6b394",
      "apps/api/test/mat-khau-lien-ket.spec.ts": "a281680c49ff1abc8814246abf25324e5ffe1c54359b0d725d4dcb7d44c172f7",
      "apps/api/test/may-nhac.spec.ts": "a51383b026c02ac4eff79c351890e0143f061a83b7f8c04277aee2cbce40c102",
      "apps/api/test/mo-lai-vai-chi-okr.spec.ts": "a3b221e8a96c7cd2ead95b5fc6c58c8c62507f0f01bb1714f1fb4f2375182eed",
      "apps/api/test/moi-phia-ke-hoach.spec.ts": "d328d43ad65c1b880bda0c89e4e40194e8834cbe3af94b5ab3353684ecb37441",
      "apps/api/test/mot-duong-ghi-phong-ban.spec.ts": "d2dd52a1d3898536cbadedccac63508ae1e3dd09138931878ebd78381fce56a6",
      "apps/api/test/ngan-kr-mot-cho.spec.ts": "5df00d90cffe464393555dfc9c38379555c26ae176e903a648de2bfdbe63222d",
      "apps/api/test/nhac-qua-zalo.spec.ts": "2e68b55ba636180d7e88504e7a70ec6f92ce2dd204f65ed1f93d3251ba73197f",
      "apps/api/test/nhap-truong-luc-tao.spec.ts": "71c6cfc5f90191e95bc009183e37a430ca29b0b55e2a0be1100e90da748e8f7d",
      "apps/api/test/no-sau-luot-4-okr.spec.ts": "de3f674049a0fc2fa7b18e0d67449fc19b4da61198b31da70bfa4d543d65d918",
      "apps/api/test/noi-bon-nut.spec.ts": "4d08aaf60c0ac978c61cda1e30fd927919edce6bf304d2c5113648d4e5ee094e",
      "apps/api/test/noi-zalo-cau-noi.spec.ts": "13213beef186bba4954dc6b0db117456b6adbb5afce0debd0814bf0e2587b3a9",
      "apps/api/test/noi-zalo-cho-nguoi-moi.spec.ts": "2ed132d89ba8e6bb88029e0c85462b0d74a175e4d943617c73def05a635f4319",
      "apps/api/test/okr-ca-quy-4.spec.ts": "e403ff57e6a250fa5bc9d6d91756e27e12c749ba015b4414a765a18107066b5d",
      "apps/api/test/okr-can-chinh.spec.ts": "c6d4c4422495ddef2074bf5ba24a8517b1f8514d1874d7b0662bd34b9f2c781a",
      "apps/api/test/okr-canh-kr.spec.ts": "c9502685ce7c9f73dde72ea64e6b66ed7d426365151b600ee1af2b30ac90e35b",
      "apps/api/test/okr-cap-nhat.spec.ts": "6b618f1c5805685f31969124832e815f4f29344e6e359dec2effbec8537192e3",
      "apps/api/test/okr-cay-ly-do.spec.ts": "029d7bb855181401b518a3db9a88cc77620088a44e727d34cb95e145ec7ffeec",
      "apps/api/test/okr-chi-so.spec.ts": "8f511abb4a4714801ebc6bc389b7be63246354b5ab2dd8b174d5bc031a6b9fc0",
      "apps/api/test/okr-cua-toi-chia.spec.ts": "efadef3a6b11b958825f1ebc10b3d9cc0696bb4fc532982b4920d5d85656534e",
      "apps/api/test/okr-cua-toi-theo-doi.spec.ts": "8b359f569d8afe0161a8823078ab44315678755c2a85b8834f4e3f6c4ac47379",
      "apps/api/test/okr-danh-sach-bo.spec.ts": "f1e9f65df05e81a756c2e5d60f359105b1b46ee9a4540180faaa13a2d6daa80e",
      "apps/api/test/okr-duyet.spec.ts": "e666e8ec226d156752ec975791f0c75389451f3171a26efb1a48158d0e648e76",
      "apps/api/test/okr-gan-ly-do.spec.ts": "b1ecd6439cad6c75a9783683afec6cea56557054bae6ace992cc17ece1134df4",
      "apps/api/test/okr-hien-thi.spec.ts": "b7eb4699c9a69febc83ac1d62ff4c69b7b1d63521673fd37bcca73e11ada2e1c",
      "apps/api/test/okr-hoc-tap.spec.ts": "4561d109663a8d01e1bcc8bc5d93b27f20aa36bba535e8ec3257ebd1b68332dc",
      "apps/api/test/okr-hoi-luot.spec.ts": "7dfb7dd2787b108aeeda21ee237929697dd8e918105bfec6261a14f4f956db06",
      "apps/api/test/okr-hoi-y-hieu-nang.spec.ts": "ad767f263701a6f85914a2f2138a9c2d6fcb90b82609875c36fe9a4b5fb200c9",
      "apps/api/test/okr-hoi-y-thuan.spec.ts": "6a555368be7fd211838120cff4caa4fa85e39bf85a551d6786702ad40898350e",
      "apps/api/test/okr-hoi-y.spec.ts": "e928e7ca533a68bdb99931dd06150af17d04f5c0fc2d0b067abda04550f05510",
      "apps/api/test/okr-khep-xuat.spec.ts": "da0064a8261b682f9f8dacb1e46efb6fe01e7ed4612716bb0ead0fee7eb5b3b9",
      "apps/api/test/okr-khep.spec.ts": "eeba5a8dc14b642fb67d3a8ad55f62f594059bdb8687888139a40bda3ada00a1",
      "apps/api/test/okr-khoa-api.spec.ts": "b2ebf048cc25db6e944bfd7cb6f3267dd1c05abaafe7d2da1128dbd18b19a5d4",
      "apps/api/test/okr-ly-do-can-chinh.spec.ts": "eaa2471e2c3407640d9c45e6c51c3bb9398a44b3d58ef56e57b34b38f8e6f672",
      "apps/api/test/okr-mau-cau-hinh.spec.ts": "12fa8cebeaa9361e03d6cda10578ad8e1e87483b8fbe3a5094c6b68a4a3a203a",
      "apps/api/test/okr-mau-chan.spec.ts": "087240142f17f95c6cab1d8cd08bce5d32f00e246a1eba245da93f5273559f71",
      "apps/api/test/okr-mau-cuoc-soan.spec.ts": "790209fc79fe3ff907dfe3f2de792cca36a034f5f61c6d34983838cece3c5acd",
      "apps/api/test/okr-mau-khoa-nguoi.spec.ts": "67191c614c55422cfe1ab1aaace244025ff5a709df795f650206aaa66ebfe4d7",
      "apps/api/test/okr-mau-ly-do.spec.ts": "909f4736318a0607c5af3acc488669c83a7a758992a8e844fe1dcff319bf40ef",
      "apps/api/test/okr-mau-soan.spec.ts": "360c3b799a320e533b5b17036b44c6f7155c21b0148cb86e48b7c482a842ea37",
      "apps/api/test/okr-mau.spec.ts": "b45c601301137f8b73363b48ad670c36ca707ca992f1a5b1cf29a88e4a8a6d8b",
      "apps/api/test/okr-moi-kr.spec.ts": "82e55f7e0e8ca6becc465a77aa731638939edc14f07c916dff1fddb33339db2e",
      "apps/api/test/okr-nguon.spec.ts": "4dbcda8aacd2184dbf421b395b13a5b8a548d44253bc4637510ee148aedcacdc",
      "apps/api/test/okr-nhap.spec.ts": "023804ebe60b75adb4883b188a9fde81f460d0cdf77fc4d3972c649d6f6f5aae",
      "apps/api/test/okr-quanh-muc-tieu.spec.ts": "370b2521a3cfeea79386339a1503f96dc5baad2fb467da2e88b90ac66fa5774f",
      "apps/api/test/okr-so-do-don-vi.spec.ts": "7e7684379c02c5ed1013cdea7f0c0f210f5fc5affe5df9418426f13824fcb2e0",
      "apps/api/test/okr-sua-an-chu-ky.spec.ts": "1640d2094b57f7b68700531de982204ca8c446eff522b59d12d6cfd39cbc4801",
      "apps/api/test/okr-tai-co-cau.spec.ts": "49f1100b8546b4b717bca2b52236bad0d239b5e025a010088b38339fa98addd4",
      "apps/api/test/okr-to-chuc-va-mau.spec.ts": "d926ba7ed4ba6ababa2db11bc7d1208aad3a6a2d1351625a13ec8e70edb0b48f",
      "apps/api/test/okr-to-chuc-va-quyen.spec.ts": "7a6afc2f3e751a63851cfc607f9c9734d527d7fdfa398572469fe76b3458fea9",
      "apps/api/test/okr-to-chuc-va-to-chuc.spec.ts": "9a06020b37f5c850f2ba661b58bbc8666e8c6152dd1b012382a6fd75046864f2",
      "apps/api/test/okr-toan-canh-hieu-nang.spec.ts": "81b671dbd772d6c94fa7b7d8beb95a222e3a25a8cd8cc4b3c02e3b520a275491",
      "apps/api/test/okr-toan-canh-thuan.spec.ts": "39c35695d1d5e02bc91d2d8b0d65d207537a370ea75d337d654f6cf6a887e8d2",
      "apps/api/test/okr-toan-canh.spec.ts": "4edc51d60fecfe51bdb92f962aebc203fda7fd187084422f29c83189655cba81",
      "apps/api/test/okr-tom-tat-db.spec.ts": "be7cae41bf248455175c3144349813bcc424f4fc21f803ae7226b5742dc56824",
      "apps/api/test/okr-ux-8d.spec.ts": "546b31991c34e1ebf13ce395811bff892b5f68c702ee36cad63c0d7da1eb5f7e",
      "apps/api/test/okr-xoa-muc-tieu.spec.ts": "ff29372e9da5775f84f089d0d0029340146a360f73f23965485a2004ef0215a3",
      "apps/api/test/okr.spec.ts": "459bc48037b04d7991d1c0ffac645d151f2900f055c94e4c1935396f123cb167",
      "apps/api/test/onboarding-giong-deals.spec.ts": "d4abe26fafc0227b889b7e9307842194b8a85b3763d3e341877ae7fa252f8619",
      "apps/api/test/outlook-sync.spec.ts": "14135d21bfbff7fff3b568a1fccbf129decdef6c6b72c091f6d8d3639f22e9ae",
      "apps/api/test/phieu-nguon.spec.ts": "341bc451dfa4e47431ed25b6b30f26c49bad2b71ab8c16673b93411b8d8f1225",
      "apps/api/test/quan-ly-danh-muc.spec.ts": "f89ed92fd5d43a00052222c9a45edfc399b193f038fdffd147a75f59e851d3f5",
      "apps/api/test/quen-mat-khau-co.spec.ts": "a3883eea124ae7f591d20eabbd7a40dd8ee2a5fdfc2b1a3499a396e594685c35",
      "apps/api/test/quet-khi-dang-nhap.spec.ts": "3fae42ec597dbb38aa98ad3a5fa05bfa759c5277f95865ccdc7fd37e58a5fca5",
      "apps/api/test/quyen-luot.spec.ts": "7b04653d594f3fc3ba49db327064485f33b633410d2cce77c0f5154e290d860f",
      "apps/api/test/quyet-gop-y-noi-dung-ly-do.spec.ts": "a1d06bfcfe3797c661231774f2aedf438dd36cdd5a34999ab2748fdd9d48e11b",
      "apps/api/test/rates-precision.spec.ts": "e40e3032775c59100c35b8d4099cbd1cd9b65441b87c62d5c586b4ddd50cf9ff",
      "apps/api/test/record-delete.spec.ts": "7a09756f276f2f785f72b0c964b9fb1e2039de77cf707b3562e668bc0a7ad90f",
      "apps/api/test/ro-vai-chi-okr.spec.ts": "296735441f40b9fa491894e6aeb71ca90e65b1004ccf746a2bbe456dd420ef8d",
      "apps/api/test/san-pham-lo-trinh.spec.ts": "ce852f9c2124ceb50663d1d7bdd9246c71d85677fec106e5c071494668806e03",
      "apps/api/test/saved-views-in-use.spec.ts": "836f86e090811c2aa4ff2ebd94f107e08477a144f9358cfe666527e3dfdea275",
      "apps/api/test/slack-channels.spec.ts": "c7d488910a847c7bd16134b7efcff23b12e5e9d56abdf62f1d107b142722240f",
      "apps/api/test/slack-connection.spec.ts": "f066764c8fa7b638ca4e7922f985ca58b2d9d9e4b68b134cc90ae3f5214ba059",
      "apps/api/test/soan-okr-cuoc.spec.ts": "11985cb6602f5b33b7fd3030a9e826ade02641eb80eb0138256a129ec8dfa50b",
      "apps/api/test/soan-okr-dua-vao.spec.ts": "ce211cc4cead96c12fc2c72444ff5d6f807b9219db7a873013bb7f86dd9bf373",
      "apps/api/test/soan-okr-hoan-luot.spec.ts": "fc34c84185ee76773858d23c71e7db17393da0df8a0f9e880804c4349585cb40",
      "apps/api/test/soan-okr-hoan-tac.spec.ts": "d8c375f7f22ea7277dd343b23415bdda45528ed614cf2cbbf76041a68864365e",
      "apps/api/test/soan-okr-mo.spec.ts": "b5d61defb520842aaa5dfffa13d7b2e1998517c67fc35deed36fc4118c21bfb0",
      "apps/api/test/soan-okr-nac.spec.ts": "5b950e70120ff1e46b1e7576d61b8eef2fa754ebd3b5ef445954b5e5d8159607",
      "apps/api/test/soan-okr-quyen.spec.ts": "0ca459b05e90201a161390613d8759e20b5a2d7bf6d20cf56253feca51fc8df4",
      "apps/api/test/soan-okr-so-do.spec.ts": "65b8b7548f4f67b4527accc5cf173da07975c288ada222948af49f542828c23f",
      "apps/api/test/soan-okr-tran.spec.ts": "543e42be1cc7852ad78c4812a4d3300d61c3d330cf19c72cd47f431ef3fcc375",
      "apps/api/test/soi-thanh-vien.spec.ts": "9d58bb72d0d858f61e8ba83770f24a8eac956c6b8ed29f99a99a3bf44d7d5077",
      "apps/api/test/sort-moi-truong-toc-do.spec.ts": "3cdae92df82da2d17e5ae5c05e7a0ce6680b7dbb2baff05ea11761a937652c99",
      "apps/api/test/sort-moi-truong.spec.ts": "120b2497e4e1f3b75634bcdbb7a338b5039d8de4dd0aec052af234850d2b2d39",
      "apps/api/test/ssct-hoi-ma.spec.ts": "d52d91668bd0c0f69f6ac029ec37396e08d6fc2a8044a289369dd11326f376a2",
      "apps/api/test/ssct-nguon.spec.ts": "ab756ad41b864d867a7f99b83581ccc052039e56b17754bcb111073d95db0127",
      "apps/api/test/ssct-quay-lai.spec.ts": "58f7a587535ff34a810def47c115d21cba2a16f1067f41f0bdb4379a3555280a",
      "apps/api/test/sso.spec.ts": "15860f622a34fb774868cd741d636d06066c6cbe1e7219c90c6355f81a7c343f",
      "apps/api/test/sua-luu-tru.spec.ts": "790be2cabc6599a71860f3267f48c1bad5ccebbef4914dfac36fb65c8d6577bf",
      "apps/api/test/tai-lieu-bat-dong.spec.ts": "e0c4923d7932a564a47434ee133d0352c12ff4946d0d26d05a9c6d25541be175",
      "apps/api/test/tai-lieu-chi-ghi-them.spec.ts": "a12877beeb1ccd5e9ec2fd69a1a3e07066778242157f4918f3aec7d05390e390",
      "apps/api/test/tai-lieu-chien-luoc.spec.ts": "aaea49afe1e8686a6cce246648a3ae3559deb4f28b318c8f3496c8b209cc2897",
      "apps/api/test/tai-lieu-dang-dung.spec.ts": "bc1b3f8f1506751694aecc18cb332f7b5abd822889cfc5daa10b771c83c49fe5",
      "apps/api/test/tai-lieu-de-xuat-chung.spec.ts": "904af100dbcd22fb37b6531157cd0aa11337a973b76c054421375750b8713f02",
      "apps/api/test/tai-lieu-hoi-suc-khoe.spec.ts": "c028d54b8dfa7fc69193077462642cdd4695080afcfc24ee530eb253ebe96253",
      "apps/api/test/tai-lieu-hoi.spec.ts": "51499f08c2dbe2fc1ecce6da5b1dacea50df01d4660b9d869434565302761969",
      "apps/api/test/tai-lieu-khong-ro.spec.ts": "3472a2fd0f0aed7b58d6b260e05ec2950cab5f44dac96b3240c8e1dc83aecbd0",
      "apps/api/test/tai-lieu-lich-su.spec.ts": "e531a57b5c874c56afd117c4661ecf78d5f2c7ff4ba1ddc89dec638fe703e5c4",
      "apps/api/test/tai-lieu-loc.spec.ts": "f6ec41cb9a5ba547e0f50d588b7d9070b911f285638b231d436974fabd237b0c",
      "apps/api/test/tai-lieu-luu-tru-loc.spec.ts": "f17d27fc33a50345c54e1a04b60ce6e0ea366786ec0866aa10a7c78a134265ea",
      "apps/api/test/tai-lieu-luu-tru.spec.ts": "5067de2d179ace2d03d04889703dbd63c667eb03918716f9a2ce22346b4c2e7b",
      "apps/api/test/tai-lieu-man-sua.spec.ts": "167750199b0d4d516c5a1c55885497e783ce39da73a4ae042308b3a0a958307f",
      "apps/api/test/tai-lieu-nguon-cua-ai.spec.ts": "0a7eb544170c7d0c235298a84e5c8e07324840e4b9e607f0ec08d1b40121aff4",
      "apps/api/test/tai-lieu-nguon-duyet.spec.ts": "df132412f78a5ddb1cde310e325d6859b0fff1c6979becdfaa23dfa09bb229b9",
      "apps/api/test/tai-lieu-nguon-khoa-logo.spec.ts": "9ddf1ef027beef3ea2523a57a816456c30217ccd6dc1aa2760ccaa24250fc14a",
      "apps/api/test/tai-lieu-nguon-khong-ro.spec.ts": "eab726f5dccb110f6ecdd632551eee331341b84a71a959becb79f85549595d02",
      "apps/api/test/tai-lieu-nguon-tat.spec.ts": "3847b75b4706aa5e22a772d3454b9ae9c07bcc28f03acbeb913220121a5cd58e",
      "apps/api/test/tai-lieu-nguon.spec.ts": "a2fa6f71b3ba4dfc2e64f8c254a875614ac5aa2d76de9499bc285dbc66a35ed2",
      "apps/api/test/tai-lieu-nhac-bang-tab.spec.ts": "e8aad34fc164ea4682476907beb136dda7e361dc3012f35364346f5de91317d6",
      "apps/api/test/tai-lieu-nhac-toi.spec.ts": "b6b576b88f07215c13b1edde21ab9ea9027021e08498d262cbac64deaa65b1d2",
      "apps/api/test/tai-lieu-quyen.spec.ts": "4794fdb5e67023868eadc47c073faf53f19f33d0444207698d5eca87710ba4dc",
      "apps/api/test/tai-lieu-suc-khoe.spec.ts": "f2f6208c7c9351cdaae9ec9aa1f4763a8350ba114644588e2c89655f0f2c2436",
      "apps/api/test/tai-lieu-thay-trang.spec.ts": "fd9aeb299d976c36eae7c26615eae069ce049b92bd4473529249c18e64f05c75",
      "apps/api/test/tai-lieu-tim-khong-ro.spec.ts": "2788a5704397ed6e4a4868ec9523dddaff08c4a25a60bbe34bea1bd2c7df6b81",
      "apps/api/test/tai-lieu-tim.spec.ts": "ac8b60d4ae9fef87c31f4e2e0730496cb197b8149bcb63299fe33a5860b10388",
      "apps/api/test/tai-lieu-xac-minh.spec.ts": "50644e7a1b2354cc2572e0ffc7a498457cab1625c4addcb8c0d113a90328d572",
      "apps/api/test/tai-lieu.spec.ts": "5ed06f3a58736c57acf87228783b75e967dcfd1dc6f63214a0d1cb327e367b81",
      "apps/api/test/telemetry-zalo-hoi.spec.ts": "0348c052f7372d662fab7f1a0310f20a4f8f1c08fda1c6b70d16fc1f0c859573",
      "apps/api/test/ten-mien-nen-tang.spec.ts": "45fdf75b8588d6058ba9158375fa9ac39fb3361e73a86d92bcb8defba338c2d9",
      "apps/api/test/tep-theo-chu.spec.ts": "345d22c1ece1c9f752edd1db89e45b40ecd094e9d405bbb6fe2982c312a88107",
      "apps/api/test/thanh-vien-vao-dung.spec.ts": "f3a81c6c019de50b9c3ad9bdff941300baf598c02e27520feb16737458715bbd",
      "apps/api/test/them-buoc-bao-dung.spec.ts": "3ff56078ada55084915845b261f927b3e14555423aa4e72e2943e931f4b259f2",
      "apps/api/test/thong-bao-cai-dat.spec.ts": "c6dcaad9bb3e3a39b175c49ab52999fae337ca1860b0aa75a46ca96dddb44f1c",
      "apps/api/test/thong-bao.spec.ts": "7c51a5070501d588df1bbfaf06f87e25c93c055b845b455c2844bcfd8d981f95",
      "apps/api/test/tin-hieu-doi-cho.spec.ts": "da57a66285d2a19efcf749499f6b22b6edf9b49ecdf94520fd2a127be6b61020",
      "apps/api/test/tin-hieu-luu-tru.spec.ts": "d0e4e6eb21a8c0d0ea75af079ca8f9b0ebce1499f6870e859fb1152f1b4912af",
      "apps/api/test/tin-hieu-tat-ca.spec.ts": "ec4db40f427be92d5157dc21fa2374047f453f29e04a412e93fe02f1d351a80d",
      "apps/api/test/tin-hieu.spec.ts": "bc0bf9326cb43b2c81cb535104eee97b26e56b31df4a79a01a8910a0f5e0d169",
      "apps/api/test/to-chuc-chi-tiet.spec.ts": "38622c93caacfc29b79b9605119a7e211bf1e6521f54c5cf419e28bc702f5176",
      "apps/api/test/to-chuc-dieu-phoi.spec.ts": "c1bd6aa0229632f40f1e924ccef551c1f01081204f92370e6ceae3454ed82b6b",
      "apps/api/test/to-chuc-mo-ta.spec.ts": "8766f4887e37ca144722890dadd4eda23f6a53c6beae948bb3f204b04aa80483",
      "apps/api/test/to-chuc-nhap.spec.ts": "f59120ec0135f2551387b667a524799a72c7aaf6ae8c0735d6b5d683edd03b7b",
      "apps/api/test/to-chuc.spec.ts": "685200c55adea19a7f8f2de3beeb57a23a1c85d936e9f69b8dc54b57418bf168",
      "apps/api/test/tra-loi-het-han-muc.spec.ts": "bf8937b60689a68c2367d5192250fd3330e8c947f73fad9cdc58a55a97b5cd0f",
      "apps/api/test/tra-loi-tin-nhac.spec.ts": "ce320fa6e1242958bf30a509f0c45f636759c369bb1a1a98f6b778ec4e4f4e7a",
      "apps/api/test/tracking-collector.spec.ts": "1e14492c9928b070cdcc863ae5413daa3d4169ac9decd6e25a4822b401dbacd9",
      "apps/api/test/tracking-filing.integration.spec.ts": "b389183e6986703cc8d52a28d54d806235fa181ec92ad4ed144a30c99a5965dc",
      "apps/api/test/tracking-ingest.integration.spec.ts": "eaa2e29bb1d9f30543d7f9511f56f450eac840de8835ae2159ee145da7f3563d",
      "apps/api/test/tran-than-rest.spec.ts": "bac120d6864a770aafb8db1af81b342543ff8584f8fa1dd466e0ba4049d192b6",
      "apps/api/test/tro-ly-okr-che-do-an.spec.ts": "bede5c56f004672cb57e91ae51afdcad9505599ce811fd86546cda91d49fd6b3",
      "apps/api/test/tro-ly-okr-chi-tieu.spec.ts": "459aff8ccd005b4d1ecd4d65aed62638aa652e48d3004bf4f637d53a7d02b4b6",
      "apps/api/test/tro-ly-okr-de-xuat-quyen.spec.ts": "223f98d798e18a24c8b7d27de2041829529a14cf0af280e6cb06159e6bdb763a",
      "apps/api/test/tro-ly-okr-de-xuat-tran.spec.ts": "26a032c12ba7cf86694425703fa050bf4d9cb47d05b52267b20755d67d2a4f59",
      "apps/api/test/tro-ly-okr-hoan-tac.spec.ts": "583bc6b295c2df12374067b00844e86c977d0506f31e29c297272c6b6ba51302",
      "apps/api/test/tro-ly-okr-nac.spec.ts": "48138175aeaaa80fccd7d15168e1695e517e44286eb4fbe31545ea8f502cfa1d",
      "apps/api/test/tro-ly-okr-nguon-khoa.spec.ts": "a06e7b2a24897b51701ebeec64562b6f65c7406f21518ce459ef988ea7d3b20c",
      "apps/api/test/tro-ly-okr-quyet.spec.ts": "43347e1e583b32a76ed99607769e5244963c5e290702ed5a10942ca5c48b712c",
      "apps/api/test/tro-ly-okr-so-do.spec.ts": "d07ec78446f9a3044f108611bbdcbe854ac88b7386288cac040ce1b8827b0708",
      "apps/api/test/tro-ly-okr-tat-dong.spec.ts": "1581b6cfdcff631c75f320c9d03cfb87c8d4928c042d3930ca62649a50ac62ef",
      "apps/api/test/tro-ly-okr-tom-tat-doc.spec.ts": "ed678bdc20b6a3bd1125e443b25cfa0b71b019916899451d394ce9e1638a91ba",
      "apps/api/test/tro-ly-okr-tom-tat-phan-hoi.spec.ts": "2538c9d72ab410c3455918ac1221ef7782cbd50a7dc27ecc7d831d62262ed81d",
      "apps/api/test/tro-ly-okr-tom-tat-quan-tri.spec.ts": "821dcdb4363cac4692ed946e6848e2ca609134d9803c592fc9eba5522a538501",
      "apps/api/test/tro-ly-okr-tom-tat-thuoc.spec.ts": "dcfc1817a62082498f7cbea2917f393822a28222a74f7192c13b79e79a8dffee",
      "apps/api/test/tro-ly-okr-xu-huong.spec.ts": "2663fd06a4c00d4be6e0714505aa3721eb6c9e5bdb9a39113d0490ddc8327489",
      "apps/api/test/truong-chuan-cai-dat.spec.ts": "4ca946292014766153d1e607971fff39b2a2c2a1fcbe4fe1317bd3ca94808ce9",
      "apps/api/test/truong-mot-cach.spec.ts": "7bbb29df2332279d0c3d5c1ccc538419384f51de9250cf9e0c65619bbfec8b77",
      "apps/api/test/truong-tep-blob-that.spec.ts": "a2a75e696ee26fe7293420c9a099f68f356534f92bb6a39362ecc3546731df80",
      "apps/api/test/truong-tep.spec.ts": "96eeb5fa1df60b0189878a5c30d4ced85fca385e04382b87bfb3d61a99aa0f0a",
      "apps/api/test/vai-chi-okr-ke-hoach.spec.ts": "b0f09d53a9df16ac3ddd8ce5ceb3ede80b4f80fb1ec18c06511ad9b68b054eb0",
      "apps/api/test/vai-chi-okr.spec.ts": "22eca1be5312b208ee9df40cda4f8fab57fed537f54d1eb62a241820e844ed7e",
      "apps/api/test/viec-bang-do-nguong.spec.ts": "63140b073263bad20d6f96384d00d0a987fc42a2b7c7a4aaa3b8013480dd8c85",
      "apps/api/test/viec-bang.spec.ts": "a28efefb88b9e2d6c8ef5b61e4331284f941a8656a0d1f1d1d82a55e1e6dcbc4",
      "apps/api/test/viec-can-lam-cu.spec.ts": "6f639086d60fcc530be38f8612102ab2109795e8415eacc0ee3aa4290ab467fa",
      "apps/api/test/viec-cha-an.spec.ts": "a84b39c50fe8d5e54e6b14f63840ac4e3a091de770ced36313d36189379c205e",
      "apps/api/test/viec-chuyen.spec.ts": "4447e92ed65738b27991588027d79bc66818ce0647a7ac05bd06895885aeb47f",
      "apps/api/test/viec-con-khoa.spec.ts": "b79b9f054e9de39201c81e9044371f1e930732315e3654776357dba3c9fc328f",
      "apps/api/test/viec-con.spec.ts": "155ba9337585e4175474a4b4359770cd779f1dd9a1ebaaf6a452589720949753",
      "apps/api/test/viec-cua-toi.spec.ts": "c5f996d3a2ff354fb1c67e2274cad7b95d41627278d4761b575c782534ef74da",
      "apps/api/test/viec-do-nguong.spec.ts": "ad6379293eb2a59b9c60f0fbaee756d89ae7994ac7b9d56c71514680a79c9369",
      "apps/api/test/viec-ghi.spec.ts": "085116e6a96880a89d43cceca812aa6cfb9bc131ccbc68a2338f3f874e3ecc0c",
      "apps/api/test/viec-quyen.spec.ts": "a19b2683539cb35712954563a4d15a90387e013ddb9a415bc758b479d5ad95bc",
      "apps/api/test/viec-rieng-trong-cuoc.spec.ts": "f2b84638d3c126e43826429d9cc0d2aa896444a54d36ace6831ca1f66261b963",
      "apps/api/test/vong-doi-mot-cach-cat.spec.ts": "e0c7318f80e4053e64e4aa23b43aa8f01f0d63a7f0a161c8556b9c63a7fa9f71",
      "apps/api/test/workspace-thanh-vien.spec.ts": "0057ce5aee4eea47ed19155b59f0b4f7b83b8adeb51029ed00da1b97ce562bf3",
      "apps/api/test/workspace.spec.ts": "6e00707aeefed1186a9107b0cab81f8099c2c3668cbaad6f4670c94341dcd52e",
      "apps/api/test/zalo-doi-bot.spec.ts": "5d51a5aaf63fe845ba04d866299ebb4850d06b7228aa69557b8d50a675e0d7da",
      "apps/api/test/zalo-goi-thu-hong.spec.ts": "724da3ae8b1f4d0242594e306e113cff602e74e8783f26a080898d48fededd22",
      "apps/app/lib/agent-builder-state.test.ts": "28ecaa487f7c075c67ef83a39d2b7b82decedf5fb47507d75a3a7468df8e9386",
      "apps/app/lib/search-param-keys.test.ts": "a3cceffce402abd69facb41f51ae90491608c15c471a0c90ec442f3c2a0d7bc7",
      "apps/app/lib/ten-nganh.test.ts": "64bbc7733e522cfecccd976672789f4f09fe66699946f7bc4e2a7f0573239e9c",
      "apps/app/test/agent-bridge.spec.ts": "6821676d6651736087508908a2fde43dc2a194c4cb08c7a8960645696168c172",
      "apps/app/test/agent-builder.spec.ts": "2abf174e94e582c0c355a3636410ff0827d4d400af1347700c8e7275a5055ba9",
      "apps/app/test/agent-results.spec.ts": "029149bb99c13cb5a6878bed601799275b3761689bbcc06a741d1736c5d22bfa",
      "apps/app/test/agent-session.spec.ts": "2aced984d3441cae4e4af7a30b157f0fc8cb71db1062a3c65730c9ed66bf2afb",
      "apps/app/test/agent-tool-display.spec.ts": "10a0e8e13c5667e61d2d473158910da75da06c2fb4c9527bcd7b37cde7cf9681",
      "apps/app/test/agent-transcript.spec.ts": "eaee13dbeac226d9561f492f0582b9f4dc324d777ec8a22ac9adea000060de74",
      "apps/app/test/api-proxy-headers.spec.ts": "433670eea66154ab00184a4cbd325f6d2e79991e28791c8101fc00eb78c56cae",
      "apps/app/test/api-proxy-response.spec.ts": "2e68946784afbcfcf3455df72c80ccd0fc48bec04998e27e80da32d134acd325",
      "apps/app/test/auth-messages.spec.ts": "0874a0d3860a01235988610817b50634553e610e88ff2f86acdab7211acf09f6",
      "apps/app/test/bam-kr-mo-chi-tiet-kr.spec.ts": "3d369ab67138617d9f9cc1f8040d152e499715377c957181ac8e4e01bf1ae1db",
      "apps/app/test/cai-dat-dieu-huong.spec.ts": "6611076a365b67fe0e662a220aa86dab3a5cc186fea01d439cc578fd13c30463",
      "apps/app/test/campaign-states.spec.ts": "c9da5ab5f68ab15f3f13f07a83e5cdda17913d621f6cb36396043fc59c3cc055",
      "apps/app/test/chan-uy-thac.spec.ts": "90c099ea19ea93b30134959ad791cfddd77e261ecfabb6dc28966cc7bf5c5011",
      "apps/app/test/chat-date-group.spec.ts": "648e963b5461b0d90a4fcba9d89458b2c50d2ad3652bcfa9e03fc5e7dcf215f3",
      "apps/app/test/chat-route.spec.ts": "5f5a546f6cd011f873c78629793c93eb51177ecdddad74a0a43e4e1ad069b8a6",
      "apps/app/test/chu-man-tieng-viet.spec.ts": "35ae475d791f1d97ae861e96a4aaa0faf196b2183fdb5f78f6176a6dc51bacce",
      "apps/app/test/chu-model-bi-go.spec.ts": "99c9711f999e45587f9b24f5d0946bae1d1ef01bce98bb297ce117ffc6094f5e",
      "apps/app/test/cua-okr-hoi.spec.ts": "afe5f669a85df265859ba0f9b31694026a80ec18ad7931b1dd185468c24fa35a",
      "apps/app/test/cua-okr.spec.ts": "a38d78d94011bfa3a06b6172c5f25ccf47aba77e406c0c0d6e3fc4b52245ed4b",
      "apps/app/test/cua-vao-ham.spec.ts": "1b153edc408420cde53e1ea6925e962426f08f379d13c1e0a4749ae218c27a4b",
      "apps/app/test/day.spec.ts": "e61b503641cc2734a4740a6bb3c64220c183cbcd6f68e9d582e281420ad7b7b9",
      "apps/app/test/dem-dau-cot.spec.ts": "a32216631061384ca152cc9058930f20820c6563e5bf29f6a05cc6c9cd477d86",
      "apps/app/test/dieu-phoi-trang-thai.spec.ts": "43250dbad37d3bc31764c0cfde884b8a4854a2390d6581791f592a38d7c36fe0",
      "apps/app/test/doi-nhan-khu-muc-tieu.spec.ts": "bee1faed06fa484aad89857b6803497305e41d57b97731c55be35de5125e1ee2",
      "apps/app/test/enrichment-queue.spec.ts": "9990c90ec2c16cb611e64381859ec65de3553f5184f41e0d9254aff2517b552e",
      "apps/app/test/eve-cau-noi-chi-okr.spec.ts": "ed14ab4149229512710b5faeb7c538562e44bd0e7a39319eb8c9e53cb8fb53a6",
      "apps/app/test/eve-cau-noi-thanh-vien.spec.ts": "c9f76128095f9bf01f3f6c483d2537a71425d663aca860f835625f5352d925be",
      "apps/app/test/gop-y-dung-cho-luot-2.spec.ts": "a9866f6483b2b0da482b5117976c3fd3bdeace59d43507ac2635f11cedb5c1bd",
      "apps/app/test/grant-access-messages.spec.ts": "8086c9ee52112266ecbd4140ea9a7ea72983b8b06d0d4212ab2eb3a2dd10771e",
      "apps/app/test/kara-mot-ten.spec.ts": "e3ac4384e8c9f952993803b56197fe67d66971e0992230d8c42414856261fdd8",
      "apps/app/test/ke-hoach-chuyen-huong.spec.ts": "082e506a522edb46e01c7523f504f0ff959efc9bcf70b0876203f1524d438b1f",
      "apps/app/test/khai-tieng-metaline.spec.tsx": "85fe2d67ff8f7e5ca7852d8417839f30ebe85349ab41a7a9ae3c6ecfd4eb4033",
      "apps/app/test/khung-dieu-huong.spec.ts": "e145c0388128675b1c835fb287532b04c374c0332e5a8bf88fed177d707f1b64",
      "apps/app/test/khung-man-chung.spec.ts": "73a13d4ad9ce283f01d2fc2d16514ade27c311c545d65a60393f091c9903bdac",
      "apps/app/test/khung-trang-cai-dat.spec.ts": "a00b020990d715fa6a3095bdd6f24a17bfbf480e99b7ac7f94c36a0f3833b27f",
      "apps/app/test/landing-analytics.spec.ts": "2ba2cea23f03534363c650b2d015a7191f6fd6bfe5e581d1e3a2df2430228a9a",
      "apps/app/test/lo-trinh-ban-chup.spec.ts": "7387402763c9042b70948b6753b24e5073e48c54ea76963972d1aa57e3cc83f1",
      "apps/app/test/lo-trinh-doc-tep.spec.ts": "50415a568d77b23e0139ac759c24606503b67c57445109a8da9bc054141dd80f",
      "apps/app/test/lo-trinh-du-kien.spec.ts": "2b28fba6f578675df391c5cf6ced4fba2d352f26dcf60c0695a38f7228371114",
      "apps/app/test/lo-trinh-mo-hinh.spec.ts": "43981702e42c6b5fc28cb2ad8632ddd65912ffb8a48f4700525d2e07d9487044",
      "apps/app/test/lo-trinh-ngay.spec.ts": "3442965392e2d41cc402fb300ac0f5b97b6f6f79f419922a15cd8a00f49dce71",
      "apps/app/test/lo-trinh-san-pham.spec.ts": "4b072b6b0dbf91adc8ef3ae37d4ad64ba5b10c6ab392ece6f698f63ef5265de9",
      "apps/app/test/loc-don-vi-giu-bang.spec.ts": "7973eb401c3d6bfd38f354b4f3bac9846d1f58ee073088e1e3db051a8f588190",
      "apps/app/test/loc-okr-tai-truoc.spec.ts": "35aa7dddea929468cd015aceabf78ccdb2dce0aa20095500745679078375013b",
      "apps/app/test/loc-okr-ten.spec.ts": "291c227aba09acaef6f7a047cc450fd40e2a46d5cb4217dcf9a0122f09dbf04c",
      "apps/app/test/loc-va-kieu-xem.spec.ts": "72c728dd8e744bb27fda280382d6701054175018ef7a92b0f7ce7780df48b912",
      "apps/app/test/locale-resolve.spec.ts": "cd2806a7f8ff8b17fc0d3b5e8011d455a779c50bf41b631d3f3af84ddd6260d7",
      "apps/app/test/mau-trang-thai-anh-xa.spec.ts": "8def3e09896731f680a7578a59e4a5c26d1e5cf3064b22dd49be48f53424d7b0",
      "apps/app/test/messages-guard.spec.ts": "6ca49b9bdd060e1a8127bab7840b2af9c3ac6e02a706c5f83973eeeb0f9706b2",
      "apps/app/test/mk-dang-nhap-cung-man.spec.ts": "ed81a1776e44bc2f04df599f29e81c8a3d1208d4ea57e29387199f54600c1a2d",
      "apps/app/test/okr-chu-ky-nhan.spec.ts": "43f65fec57fccf8959660fd0b7915f66bffe8ce06487dcc3d76c970cba171454",
      "apps/app/test/okr-chuyen-huong-cap-nhat.spec.ts": "0a2c6904d9274a7c11156224518340a0b8fff7285045f1ae4bee0386a5619971",
      "apps/app/test/okr-giai-ky-an.spec.ts": "790a669437df9c045ff2337e0661fdb49d127b3f9afe9e1e6cf03137c740eef4",
      "apps/app/test/okr-khep-chu.spec.ts": "dadf0c6295561b2b0e011e5b77cd7484ceabad5c0713d1c7f154aae12755db85",
      "apps/app/test/okr-lam-moi.spec.ts": "8365d8a9b5a58e800197d7c6e2ef3183498309f55344debf07dc13ece1171ffb",
      "apps/app/test/okr-nguon-so-luat.spec.ts": "bb6f95c55983a56ad6608f19bceb14ea60d73efb09a13c3a8e87dcf321a27222",
      "apps/app/test/okr-so-chu.spec.ts": "fbf51c670cecf3384282e80e0afb807be9ffbefde7fefc98b29f056ddedb504c",
      "apps/app/test/okr-soan-record.spec.ts": "87c4ca72e2d769278fdf14858f6074e69fe79d1116d8bb6f53b580694b9e9a2f",
      "apps/app/test/onboarding-gate.spec.ts": "e85fef8b3c65880ebced1a18991e65349ab8b5238dee3b77a5c58268cd354f7b",
      "apps/app/test/onehub-center-metadata.spec.ts": "22b07bd6d0da46e642761c156cd96be42a45e875039c61c5c39ade8ffbd9fee0",
      "apps/app/test/pham-vi-man.spec.ts": "f3610dab2a03bc9d456c9985204933b7195f3b5f8d8bf17fa99de274fe6700cf",
      "apps/app/test/proto-catalog.spec.ts": "994b831b37f1fb274b20f1b4841884655992f4e5e7289cfbd303160c3f42137b",
      "apps/app/test/proxy-an-danh.spec.ts": "c042d4bb3658352e789410fba6f07a2755b7538e6cb2e4cbe2e1b31b5a60c5d5",
      "apps/app/test/proxy-duong-mo.spec.ts": "e8429f77d91a8ebec3305f889b42745a7b11c785a32f38c90b817647cf3b9cd3",
      "apps/app/test/proxy-lo-trinh.spec.ts": "8117e976dbd0d5ce4635a1f849a63a301696647aec2aa91b531df4a8c960e194",
      "apps/app/test/qua-han-theo-ngay.spec.ts": "0c6e41edcf80e5d8f81dbdf77e63b994485059c10ddbe4f786b30eaefae33db1",
      "apps/app/test/saved-views-in-use.spec.ts": "05e71423c7dbe6289b3fa45d51d5c37f5d61323756657d68491d82cfb272da46",
      "apps/app/test/sign-in-mat-khau-luon-hien.spec.ts": "b4369f4143d3f431daff61d5c4db1420be9f4e0fe74a1288f98ab2a379f7a05a",
      "apps/app/test/sign-out.spec.ts": "e82133035d2054a7ce163b8f8a5e6bb55c1940f693b6b6cc9a02b1774cd5b102",
      "apps/app/test/soan-okr-hoan-hong.spec.ts": "17277a325cbffeec8c610ae6c3294e68be9e493400dbaacf67d35eea9339d743",
      "apps/app/test/soan-okr-huy-luot.spec.ts": "0a748087557575515f2c5be85aea523f9d4858db3de4570234c02bac1dbee4f3",
      "apps/app/test/soan-okr-khong-lac.spec.ts": "7072b21f2d6060fc331e68d1631ae7976fd5431d6b3d35faa382e110aa363f0d",
      "apps/app/test/soan-okr-khong-tru-luot.spec.ts": "ba05c446a85b482d7bcf4f69ffe50fd7e658883f0a9dd5cee5ba3ae2b9eb9ca8",
      "apps/app/test/soan-okr-luat.spec.ts": "10e27d5d26c3b20f1dab5c2fc66e3c62d9f72e374b3e7896e27f0f61e1e68528",
      "apps/app/test/soan-okr-ly-do-loi.spec.ts": "9eb0bf7b1f1521743ea78eb4a49b44713b2fdb19cff528b1b396f3a7a34d2aeb",
      "apps/app/test/soan-okr-ly-do-tu-choi.spec.ts": "3f1e7b848be5c4bba46b4a6631b96d5f67bf7b58316deab5eec4ad508856560b",
      "apps/app/test/soan-okr-moc.spec.ts": "8c32493e8af9d4ae41393bb1dc37927c5af25983eafc9e1dfb3dcc7115b1645d",
      "apps/app/test/soan-okr-song-lai.spec.ts": "e6f6440c6443a2e5f6dd6b8b0d00f14b320fdf54e0e4d8bc08695ab6af6b2637",
      "apps/app/test/soan-okr-store-eve-huy.spec.ts": "0e5d097ed53a4725c7eb040e52ad52bfabcb1b93913e7b2f90e2ed9b6ef6d33d",
      "apps/app/test/soan-so-do-ky-an.spec.ts": "2d1a8d153e385cf10ea0b02966330134607638d79ddd5c2244b3f4996494cedd",
      "apps/app/test/sua-giao-dien-tin-hieu-cau.spec.ts": "5b02f39c6b5b2297d45c52977c6fd28c519bdf55286f3ce9f19ea55ccdbd8380",
      "apps/app/test/tai-lieu-chu-lien-ket.spec.ts": "5b4845a09e7f67647cb834ba68acbb45b1cf10f1b5088fd64ce987c81579eb25",
      "apps/app/test/ten-goi.spec.ts": "9d8efa0c19b95398c8740019eb2129b1fb4c096ccb9c0fd54df26eaf9386144a",
      "apps/app/test/ten-man.spec.ts": "19d0bd0c7fca9833f8bcb00a4f534141451bda89e96ec0c28cab84ef4041d158",
      "apps/app/test/thong-bao-cau.spec.ts": "e3ed4ce6521a3259005e087a0449a1fc502127cee43297358393a776d452533e",
      "apps/app/test/thong-bao-ten-loai.spec.ts": "a273bf30f87d2f9d347d4450cb317467ce932122711056d0b5e435dca4fb91f1",
      "apps/app/test/tin-hieu-cho.spec.ts": "10439c6eff902efc6555fe1b8f692cb8e9f0b827f79506c5f00ae982d7e2f297",
      "apps/app/test/tin-hieu-nguon.spec.ts": "228f2e408bc6d0e96c8e08e2fe861e2d66439eb8c092d2b8a432a3d6e5d199ec",
      "apps/app/test/tin-hieu-tat-ca.spec.ts": "a2ecfa315bc47450055ad8f612fa85d5bd1aa078cfdec97440cb3d5c1e448fc2",
      "apps/app/test/tin-hieu-trang-thai.spec.ts": "7866c08564a4fa92acbf3006174b5d2f06ea56963b0030ffdea200c687abbd79",
      "apps/app/test/tracking-bundle.spec.ts": "a5d021755a9c645195395aa3b06d909d0ac6d9faa07ae885cc1056271e11d722",
      "apps/app/test/truong-mot-cach.spec.ts": "e8c01d1fb1e051e52f0a6c717e9239d0be780e94427eb7e28220ab28c8d9ce53",
      "apps/app/test/tuong-hop-thu.spec.ts": "9acbf7dce2b2a1a0dbfc96818bc1887f5a1495d397f209635fe0cd3da8a349e8",
      "apps/app/test/vo-khu-chuyen-huong.spec.ts": "90e07301697e0b031d4936135bc11c2abff21715fb910e36171023290ddd858a",
      "apps/app/test/workspace-label.spec.ts": "b3bb78960a50a3764984d475cc0763de4d5f7fa3ed4e5cd6e67db62520ebc8c1",
      "apps/app/test/zalo-cau-chao-nhan.spec.ts": "478e0933fdf6dffd3aa01adaf832a610a0621daf538aad95b8352a4263846f7a",
      "apps/app/test/zalo-gio-theo-mui-gio-xuong.spec.ts": "bcd47f810ef6d55e82f8629e2775a8d7752eadeec69d80430149c78b5592b51c",
      "packages/ai-okr/test/xuong-model-zdr.spec.ts": "8bf56c65fff6481ba1255811e6970f7cef847d419fe3103ac0d5c3ee87439d24",
      "packages/auth/test/ai-duoc-vao.spec.ts": "142a0eb45f4d729f81ea224f58ec92ac6e291f717f82f420fc0da7d30b8fa6c0",
      "packages/auth/test/cau-tu-choi.spec.ts": "50563cde38241cf19afce5a5d746987f4915f86f30b2ea31f6442b748f0c439c",
      "packages/auth/test/chay-nen.spec.ts": "b4a8da3b9543e2168e8e02aefa7ec64e13eb545641651a88662ee6e6f1a806b0",
      "packages/auth/test/chia-mat-khau.integration.spec.ts": "0e6fe73894dbf0716ccb8a63c2a3c58e6122cd3faf7d1a5e41c9199ebd33eba2",
      "packages/auth/test/cong-vao.integration.spec.ts": "35f3d3e1a607604a9233b9c3ed9659d9deac4058fc51644ba3c8f729851298b7",
      "packages/auth/test/dia-chi.spec.ts": "990c2beebdfb6bb05a09f15ca0e4750af9ea95560814436c425b406d345b6121",
      "packages/auth/test/hd-cua-google.spec.ts": "2a7626c089a3eb43bfd8231620e6c15a0a7595aebc48566bf1ea4207002558f3",
      "packages/auth/test/hosted-domain.spec.ts": "101f590e5ea15e550fcdae143dcf6a1d6e0cde81b8f7a23cc57eb8847eac80ea",
      "packages/auth/test/khoa-api-ghi-thua.spec.ts": "4978a548635300f313016e7a289c097b7e44b2973df2882605240fedaa626efd",
      "packages/auth/test/loi-moi-ket-thuc.integration.spec.ts": "70e3f85978e5c07a4e4c6675b6c76002325c003f6128b62e16c4e65c7c5d88e3",
      "packages/auth/test/loi-moi-ket-thuc.spec.ts": "880b7dec984de9aa0060c1aa684ef4a236058053655b3846ab2777348029833b",
      "packages/auth/test/mailbox-grant-vai.spec.ts": "cda5ebbefe4c02349572b17f9b39cfa2fe92cbd3c834453587f02f7884207b74",
      "packages/auth/test/mailbox-grant.spec.ts": "5f63a460ab9723cc4215db34261309a59ece5222ce476185186b6e841e1337cb",
      "packages/auth/test/onehub-center-khong-gian.integration.spec.ts": "1b98e51181f3d38dafdd38843ad44e707abb700c9d66004942fe2526fa47be90",
      "packages/auth/test/onehub-center-thu.spec.ts": "f36aad1652774ae9a709ef81021a76e05e5116bd1be238cabcd173bb37f13174",
      "packages/auth/test/organization.integration.spec.ts": "39199e8f425d3da7c11a322d3d467ed3e896ce1786192d45c64ddc9938f180b5",
      "packages/auth/test/quen-mat-khau-cau-hinh.spec.ts": "666c02b2ca79f19a0678707526741048dcf7fe0a20ea1042ac0dc5d1526c31a7",
      "packages/auth/test/quen-mat-khau.integration.spec.ts": "03ce73839f4a123509208fb52d5f867fef87d4a5e4870729d68a5e1169ee4f8d",
      "packages/auth/test/quyen-cai-dat.spec.ts": "9dc674befac262bf989ad45eafe98c9eeaa8fd988f6431f1d61136dab8b2f41e",
      "packages/auth/test/quyen-dieu-phoi.spec.ts": "2817acced4210029342605380e4efc6f33168b8e03c818db6a2e07e929fa04c5",
      "packages/auth/test/quyen-tep.spec.ts": "7083f2dcd7106d0e1900ae6fe4234e01b492eddaf0d7672bac9468b9e383336f",
      "packages/auth/test/quyen-truong.spec.ts": "940925ef77d9476e7a520a3ee2c37d38802bf143a97d408ce31bcc0c772e6864",
      "packages/auth/test/signed-in.spec.ts": "e8ba08b6ddc03338b123499de4518ef63a66f3e0d588cd4e5b0831d81c71e938",
      "packages/auth/test/slack-connect.integration.spec.ts": "830191b77a25a4f52e4011619f74b58c7e64ec35143cbac66924ecc10be41b09",
      "packages/auth/test/sso.spec.ts": "ad582d6a9909f9374177b7b9cd3e43c743f1f9d17097e7c5b2a5c2316868963c",
      "packages/auth/test/tu-choi-khong-de-lai-hang.integration.spec.ts": "9644241c6a2027966aeff6a8618a8947242043566050444491a790e0ab4333f0",
      "packages/auth/test/xu-ly-xac-thuc.spec.ts": "bd6a38f18cf0b70671b3ee8d5ce68b99d49aa99b53fa0ff309179f6a8465abf7",
      "packages/db/test/attribution.spec.ts": "5eb230ca58f5275c5e7465fed6d11a8a59f0ea5565d61d67343c9ded0642a9b6",
      "packages/db/test/blob-nguon.spec.ts": "4ce72e21f4c8a305984e7d569086c65d0dfe4cc264ccc81758bdf195dbe7e49a",
      "packages/db/test/blob-tep-truong.spec.ts": "0e1077d0af8e6fbd3a0cb1cd68f610bde6f7a5a9657ee52b2c9adeafe77e70d2",
      "packages/db/test/cai-dat-thong-bao.spec.ts": "eedd0103a2bfe6e68b996eac87e7973935844521b9bc3c35bf6314874e9f0ac3",
      "packages/db/test/currency.spec.ts": "4fbadcbbc948de88313f3482f53e8fc7db5421a801de9ed9d94a47ca06ac3f9e",
      "packages/db/test/dau-tuan-vn.spec.ts": "fb14c440f7ec78ae59b4464448c6cea5a85f30132aebb45c7c60af905113f529",
      "packages/db/test/dem-viec-rieng.spec.ts": "1181b4ba714ad66b39aef4c57e7acba9ea1c256594c378680a842f607c12dcc4",
      "packages/db/test/du-an-vet.spec.ts": "3ea5600c17499937223fc7862c7593d4f9ce28d3405d8768fa302b5d1bef0903",
      "packages/db/test/favicon.spec.ts": "cfe37725b45c8b5279f14c04e3d8acad882e7f128a2c31a09fb904a741abb493",
      "packages/db/test/fields-chuan.spec.ts": "6d66c10ea7fdedbdc7ecdaae4f900a0466e0a9d84f86693bc6fb3960725c4b17",
      "packages/db/test/fields.spec.ts": "7c1bf3dfd48750a87af0dce337298a4ac8505cb8d782005d782483471b227a17",
      "packages/db/test/giai-doan.spec.ts": "f4d4f70aab6b157db411399aab20d3f62247055ba79e15c832af539db38f96aa",
      "packages/db/test/images.spec.ts": "aabc1d1bf1c0c0566300267ec25ec13efeaf57e471e7cc2fe7126aac8182f034",
      "packages/db/test/lich-bay-ngay.spec.ts": "ffd4d5fb431ea51ce5b1e5c9db3775678bfbdfc66eb03667b9d4a77300a3e046",
      "packages/db/test/lich-lam-viec.spec.ts": "25767b8ee7341ecae5ba805441aa8165332075b1c6713742caed7301c902d1c0",
      "packages/db/test/lich-viec.spec.ts": "ff8895750fc5fafc0ce18c17b161b0c8231d6fd1e8c250b8526c7ebf4c488c37",
      "packages/db/test/measure-database.spec.ts": "5ee5c147f69d1fe2e30785ab12840d24ead2c5da5accbf6509d44f8d11467f8f",
      "packages/db/test/measure-db-model.spec.ts": "97673384d34345bd125d4b618fe5aca644fbfc5ee63bf1bf32e4b983aaeba020",
      "packages/db/test/okr-cuoc-hoi.spec.ts": "b408690b4f7f273766468ecfdec106b1487a90c073364c5380990165a5a44d6b",
      "packages/db/test/okr-cuoc-soan.spec.ts": "0046f905aa4c29f2ace4ae32801e93683b21087e4e820ac5a623e8f483986802",
      "packages/db/test/okr-de-xuat-het-hieu-luc.spec.ts": "d0f3af46e92408b81ec0f291043e5c7e1d0ff39a608956e69f7d48616f4c7662",
      "packages/db/test/okr-goi-soan.spec.ts": "85f99212e615b489464eff084b6c3d7e609621dbd7d55d6404197d07137a3375",
      "packages/db/test/okr-hoan-luot.spec.ts": "d77195d8cadd0960bc6e88e0bb49881a6315b2235941c34de50231c219c11b24",
      "packages/db/test/okr-hop-tuan.spec.ts": "d615c557b7508b6a5844e592b052b9d2c9cec56de11c8d31987e8533666eedf8",
      "packages/db/test/okr-tro-ly-tran.spec.ts": "48579caf41dc434a2608d6c93076a3130829b5abcaa0b6f073f10fc89fac04e5",
      "packages/db/test/okr-xu-huong.spec.ts": "f7fe8ae91b9476611d1e9e8b2352b9f50611c42bcb23a342bdcfb1d45d2f52ba",
      "packages/db/test/test-database.spec.ts": "30018c88ac1dbe0261e119cf2e49930a17cc36b6d37859f13e9f696ea2ef5042",
      "packages/db/test/tracking.spec.ts": "f670660f69dc2c9a0e985f470baf9c53384e0b61c79921835d998cc25aa36dda",
      "packages/db/test/viec-chep-lenh.spec.ts": "3af5158f0c6a2f375b58e698c9d6de2226c130b6afe45dedbf01f274333e0ffb",
      "packages/db/test/viec-chep.spec.ts": "27d88f9bbd1f075cdb0ffa3dac6eb5bed3ca8cc72c73e8705a5bcb21ac54b1d2",
      "packages/db/test/viec-gieo.spec.ts": "6fbd7b92a298e1de00a316d37ea325ceae042410fb1b54e33778f546bb7c177a",
      "packages/db/test/viec-thu-tu.spec.ts": "fb7a9648a2841433ee75f113d047347601bc222120bf7f6f848856f683ed41df",
      "packages/db/test/viec.spec.ts": "d182b96b2c9c2b6414cb322360e79ac89bf442b6598637a6f0536347bd2c8adf",
      "packages/db/test/workspace-onboarded.spec.ts": "da53123eaefee82d6914d81eda41ecf261cba0a24e9b5375749f62ad5f3d0a81",
      "packages/db/test/workspace-slug.spec.ts": "c355906b77a02842e104a679e5d628e3291633825422ed24e3018b580301fa2f",
      "packages/env/test/parse.spec.ts": "96f22183c9fc14d9145d881c0f86a88a7ab1d314dd378c9a63a68aeeeda03356",
      "packages/env/test/root.spec.ts": "10f7aec2fcd197cbd1e68eadc6220bb660eaa69e4f01d8f81b7baa5d2a6e9b3a",
      "packages/telemetry/test/allowlist.spec.ts": "e63bd045cf100f377947acdcf44df6020973a3be18e59d6a91c5f3d58645e3f4",
      "packages/telemetry/test/client.integration.spec.ts": "e84a7d324d628ba1b321625cdf60888074be7efafba3efd89134de6a1ee8ce86",
      "packages/telemetry/test/disabled.spec.ts": "f7379a1ba29c4345723b20ad12e70cdad3dc7bb859297daf56f2ea94ef9a3887",
      "packages/telemetry/test/install.integration.spec.ts": "bf9451bf0b1f1cfccf77f5a471677655ddd6d6cba2b775e6af48b52ab3b85468",
      "packages/telemetry/test/stable-uuid.spec.ts": "866346a761921ca3547a65bc4d781a98e091ab5b7a8c7af004732a2b191c5635",
      "packages/ui/test/chay-tung-tep-dom.spec.ts": "b3f37485cc9636c9c2a6201a3e0f77e2f1389d8852059b2e7a8021b902d07420",
      "packages/ui/test/data-table-locale.spec.tsx": "8656ee18d0b8c0d153300dd75ab4df486b39378908736243ce3a898ae6198985",
      "packages/ui/test/data-table-mo-rong.spec.tsx": "c782da262b84399ec6e1a5fe528a76871f9ca3f8524f57d1dc033789cd4598a3",
      "packages/ui/test/eve-to-ai-sdk.spec.ts": "4e4522eecd5611d46191bdfc8c83fb8ed0259836cf7f2239a59692aeb6027c5b",
      "packages/ui/test/format-locale.spec.ts": "93ed6c7c20c1140b75515172a375db679cea4f62193a1a7bf73c2047c859810c",
      "packages/ui/test/khai-tieng.spec.tsx": "f0959f5132bc2d7ff66d5a983dd69bd186373a13778200b69ac1667ac47d606d",
      "packages/ui/test/lai-ra-man.spec.tsx": "5675845e6e156d3179d0b22d3c30bded62f3885fd11f12020ae5756c22cee4c2",
      "packages/ui/test/locale-messages.spec.tsx": "99fc2889049d38a5b38214ff42f0f6353f916ec99bfad983cf532bc4a66b4e7f",
      "packages/ui/test/logo-icons.spec.ts": "63c715f2291a72a7affdf46a80ece672189f817a0d1c52e38740862d66147eb6",
      "packages/ui/test/logo-khop-goc.spec.ts": "5fd8cf21fa4d0079befc28136f9df18450863d06b66e5a957fa7aacfaf5aad2b",
      "packages/ui/test/mau-trang-thai-mot-bang.spec.ts": "2861ddbeb7675cd984ea87f7384a8aac1207ae566a4211e51aca4eb2df3e226f",
      "packages/ui/test/messages-guard.spec.ts": "13e2f21f9fb90fa6dd9fd39cdc2b0a36c7275815d494d40d3361c14b7409ffad",
      "packages/ui/test/money-input.spec.ts": "0efeaafc8726fb762e949322e09d4cb2f220cf03fd9c8701a4592b240673a7fc",
      "packages/ui/test/pre-push-da-chung.spec.ts": "b87bf45a23f7be658b3a894e2eb227da7839785a0684797e76c76eabca3bc055",
      "packages/ui/test/pre-push-t1.spec.ts": "787219f61ad3ee2f1cf29b918fa88785e98fcd290829346a33447d2a5ca6e65c",
      "packages/ui/test/push-ghim-lai-t1.spec.ts": "eaeab341b3f680f09060cd9df764706678d8a2aaa9d61355a9fcf6168f6172ef",
      "packages/ui/test/rang-chat.spec.ts": "62b1bdb287f8375a8df2549895341c27f7d759a84f1a10d10d4839915bf1d730",
      "packages/ui/test/render-diff.spec.tsx": "e8d5f10346e4fb59acdfe9d3ffacfc814e8ed2ac2a16dafcdf1a990f7cd5b5ea",
      "packages/ui/test/status-tone.spec.ts": "03d5cec13714e49c97878c45ff12643eef676d2ef91c7953941968004160cc2f",
      "packages/ui/test/t1-ma-doc.spec.ts": "bffe64939df4d586fa159cd269b475948535ddeafd10a43289db1089cdfac361",
      "packages/ui/test/trang-ve-gop.spec.ts": "5fc236d33f70b1927b65271679b0f91b8c331cf965a99315a2045f5eccbfe71a",
      "packages/validation/test/agent-transcript.spec.ts": "1509193ad131b8a0dcf536c4223f34c2f3a4015685011f5551fc456023fc099f",
      "packages/validation/test/ai-chi-phi.spec.ts": "e86b83632f59a659ea6c45e286b77ab53562fd97cba853a491c084abb4493097",
      "packages/validation/test/ban-chup-lo-trinh.spec.ts": "a8a531c58e290fa6b0203a2cd49da20b06572614a4f074fbde0822393aec18d2",
      "packages/validation/test/bo-loc-truong.spec.ts": "9482f2ab86a27bf4d9f0908df55c2e10ce8bbd46ce1451fee33511810c5001cb",
      "packages/validation/test/deal-list.spec.ts": "83eef6b79f9115d654d626a7ba6e695b0230f407579a05ba5a00a3545238574a",
      "packages/validation/test/doc-du-lieu-lo-trinh.spec.ts": "e6a148e1c6a0f0f9cbc122cbee3c810bc9e35a6fa02b610f7ac745eb4a9806d6",
      "packages/validation/test/giai-doan.spec.ts": "ee33d288e940a658be95719b7939360be1db0d6e77408f7c0de9a2a37fec54e3",
      "packages/validation/test/kieu-tep.spec.ts": "cbf998e204bcd984b005eb7b58d18f594b3373c3222ad71f56e5e24617d37f2b",
      "packages/validation/test/listing-ingest.spec.ts": "1fbfbb172ce642c8a5ca48d08f11253a749e25618f99ea7d5bc3cd834af9c62e",
      "packages/validation/test/lo-trinh-du-lieu.spec.ts": "cf76251ab91a0da987494ae2aabd81ed9b59cb42d740eaa2b23c6933acb6c988",
      "packages/validation/test/ly-do-can-chinh.spec.ts": "9a1a5f8870e65a466a0965867fbd3b89ee479ed9d3cf00480bb45221c6eaf5e3",
      "packages/validation/test/ngay-vn.spec.ts": "81e7cc86572c3499046cc1a7213b81ed37c000fc6eb65e83f664a6de623c8c57",
      "packages/validation/test/okr-canh-kr.spec.ts": "bfb681b610d37a98c9893b93d0bd910bba47e0d5558cd71e0681b5ff0393f93f",
      "packages/validation/test/okr-cap-nhat.spec.ts": "a8b07ddeb13e9dd342baf7f4c0d6530a9e2352634db4497cae73879abbd2b890",
      "packages/validation/test/okr-chi-so-trinh-duyet.spec.ts": "02aecbf1c7253db7efb7f0061c5931a0a72ab15e794d1cf637e7334e88e81b06",
      "packages/validation/test/okr-chi-so.spec.ts": "5e2abe6d0fc256a255b71c9dc2846e4e3d98def01e5b4f81f94d214f75d457e8",
      "packages/validation/test/okr-chu-ky-viec.spec.ts": "47400b0daf75cd1b479844258cb4393f8ba1c05a0e03e8cd4b2c756d1539b1d3",
      "packages/validation/test/okr-cuoc-soan.spec.ts": "8b867b40d038269254e7e19f1780813188f8a6c1828cdddb38c24ba55717e605",
      "packages/validation/test/okr-goi-soan-khop.spec.ts": "390fc88ba36bcac5390d71c8f066d44743fcbd57690d0fef2a409cd0db07ab86",
      "packages/validation/test/okr-hien-thi.spec.ts": "060dacf6bf1f9df9960348f1baf479c067d86cb0a10d1ec65ec24a1a3be101ef",
      "packages/validation/test/okr-hoi-y.spec.ts": "3a7449b2d4ce112272ed688f8ab83766664eef6098b6537738a850df42570b7d",
      "packages/validation/test/okr-khep.spec.ts": "29d4dd3a39c6a95376ac94740afd4ea479f4e78987215f7ff71878c16bd9067f",
      "packages/validation/test/okr-kiem-ban-nhap.spec.ts": "f3e1954b842a2874bf120b29f700abba92ca0968af88607ebb20628440e47475",
      "packages/validation/test/okr-kiem-de-xuat.spec.ts": "5b1b0f3db885b5dc7a0851fdc76e57f12517016032ada2ba8cb8909e1bb7ab0c",
      "packages/validation/test/okr-kiem-tom-tat.spec.ts": "2059f1d652e9cc14d15f7f5ab8cb88159c00ca8d1fed7ab90bb9801e460ba81e",
      "packages/validation/test/okr-kiem.spec.ts": "af061146ba89de5107297f43f47fda887a05b6ac60493349d7353271e5e67d79",
      "packages/validation/test/okr-kr.spec.ts": "6b17bab83c3932f0d00e4432a34e8b9f92df81ca10798d2a0b01aca485badd85",
      "packages/validation/test/okr-loai-hoc-tap.spec.ts": "0b4f167ff86e47bb3cc04598c43a73e4c8e580219296f584a880099099603aec",
      "packages/validation/test/okr-mau.spec.ts": "f6b85cbcbe871b9326ede013722ffc8078a00c107ea326cd5d8880ae31570808",
      "packages/validation/test/okr-phien-soan.spec.ts": "4ea0498607d51ced8a990343f1fe64e231b54713f7e83ca8df0db923685058de",
      "packages/validation/test/okr-theo-kara.spec.ts": "74dbefc2049cdf2f83008260129630dbf2ef338fe25ebcd910cd0387a979d78f",
      "packages/validation/test/okr-tinh-trang.spec.ts": "fe077683939ee7b9215b2e82d3ef00b7d2a928878c0ca7d54df4ecef2428d9d1",
      "packages/validation/test/okr-tom-gon-ky.spec.ts": "2e6a7621f746c0398da7868a91fe7f6cc915e1679fc0b582e94ee4a012138bb8",
      "packages/validation/test/okr-tra-loi.spec.ts": "47cdcb0ecdeadbfeb2a32c03bcf90b73f4f9d40821d6b35f80c0cc647daedac8",
      "packages/validation/test/okr-tro-ly.spec.ts": "4c5ca7495c8d2d3ffb2418853ee0fb36e59cdfc1709e520bf52f92380460c082",
      "packages/validation/test/onboarding-activity.spec.ts": "9d656537166822e6970430f5ab8a355dbecdfdb255becb69cb3e55c33f8bd1d6",
      "packages/validation/test/onboarding.spec.ts": "ba42b0cb8028be130db7ed00bdce0491ba4fae2dda0ebfc8fd4a8841719faae2",
      "packages/validation/test/parse.spec.ts": "3cca19eaf34eebba830f87bc0242a3d45730231e324e258abb002406b455e611",
      "packages/validation/test/san-pham-lo-trinh.spec.ts": "02986849fd9ef2f5758bba7940b276f763d0754d342357124f12b84cf38f5dde",
      "packages/validation/test/so-dien-thoai.spec.ts": "3c32c5d54b5c1db58c650700d21ee41b203a794db7bb5809f1aed5549c850b46",
      "packages/validation/test/tai-lieu-diff.spec.ts": "65624c9bbc47be59a0e5a91c1a9db67026c38dd7318372a6024fee17a3dac256",
      "packages/validation/test/tai-lieu-hoi-khuon.spec.ts": "4215e4c520aca525e2a2a1130af23a828a6956ed4c27bbc9fe17bbce23b680ed",
      "packages/validation/test/tai-lieu-hoi.spec.ts": "202df62c774f0e687f0ec8467b6e0a284fc39a249607816acc96818242d0e416",
      "packages/validation/test/tai-lieu-kiem-so-ngu-canh.spec.ts": "b2474ae3083e626ed426852cee7714f4b7d51407458b960dd4ef9ecaf31bd2c2",
      "packages/validation/test/tai-lieu-kiem-so.spec.ts": "c3c59e60fb3f31eaaa7d2974366e40b91b65dbcc87d28abedd38757dea52149f",
      "packages/validation/test/tai-lieu-markdown.spec.ts": "7db0786ab2750794ae6a5b09ba618f59e9b63d1f92a3badb7e7e9a3d7b8804ec",
      "packages/validation/test/tai-lieu-tim.spec.ts": "a4bb92500c44df49acce24a0819f357a3a5198ceb5727798dd825ab9e5e12c82",
      "packages/validation/test/tai-lieu.spec.ts": "87ea07a94c7ce488d394974713af1a13dca631d9cbb65a8f0e0958a32bfaea79",
      "packages/validation/test/ten-cu-okr.spec.ts": "9969ddd6f0a4a9bba2fc7537482a3c1b761c04fff56b64cca3d3523ad4bf38a0",
      "packages/validation/test/ten-mien-nen-tang.spec.ts": "ea0dc6b2f5d8c95577d340deb52c9df8e349012b85898112b1ac69f235c97a42",
      "packages/validation/test/thong-bao-muc.spec.ts": "934171e251108889c15312c76c6ab18d2f72277bcd0165ae6c2d2e8ef4642317",
      "packages/validation/test/thong-bao.spec.ts": "95778a1bd2b2b7698da08735527701226e59a1c9e223c76b3771ab4e77dc0d8b",
      "packages/validation/test/tin-hieu-dong-dau.spec.ts": "a955761f93f0ce05d3463ac1465660f2127f6143177a0289fd007cb1fd205647",
      "packages/validation/test/tin-hieu-nguong-song.spec.ts": "306536af2bdbd8d256e5c270c39cee80f03b28f2decc21dbf1aea91967d194fa",
      "packages/validation/test/tin-hieu.spec.ts": "fba15cf87c2d18f36f79cd5e6ecea7a18c6eb8618e264d6b889417ef2aadbfbd",
      "packages/validation/test/vai-workspace.spec.ts": "b845e84a6ade22146bd095ef3e58f70f5629ffec8555adede01e86fa75c2afff",
      "packages/validation/test/zalo-cau-noi.spec.ts": "cf39ee14952412074af763c800cbe872677a474df8597450dc44d523ff254259",
      "packages/validation/test/zalo-webhook.spec.ts": "404775c48601336bce390dcfe1d70313c8aea763fd61d9cfd3256358535483a8",
      "scripts/ban-chup-lo-trinh/test/day.test.ts": "944282bd3fec3252518b59ee728d2d08080b56a7b58978fc6b4d09e4d82906e0",
      "scripts/ban-chup-lo-trinh/test/do-tre.test.ts": "19b677ecf83d6bfe5db51cda208217399602f53d8c42da60f9f1782eeeb07318",
      "scripts/kiem-cheo/test/bao.test.mjs": "83fed5dbf8e8ca6421e4197260c1619435c6343de7939510fc1936794926537f",
      "scripts/kiem-cheo/test/cai.test.mjs": "668d1435e77874364ecfd2652b7d0856f9ace9d27e5b4aa80fab564a25451892",
      "scripts/kiem-cheo/test/dem.test.mjs": "778b14941e5cde775e653b95143a3cc531c262c2c271278b90aaf7003a05e97d",
      "scripts/kiem-cheo/test/khoa.test.mjs": "ec6d01e45ead02f4a7bda9c6d82ed7736ba4d5f257369d70d350cddae524c605",
      "scripts/kiem-cheo/test/moc.test.mjs": "bad9b34fc2ce9da9a8d519b2a2b45b758dc883b6bf3aec75afd8136aa759a442",
      "scripts/kiem-cheo/test/phan-xu.test.mjs": "cb8616f2953c0e0a1cc91a39238138ccac4e8f11faab22c1d1e6049b1dd331a0",
      "scripts/kiem-cheo/test/tap-cham.test.mjs": "3042ceeba9a4c98762a45092326f3eb3b4fa0dd26677010c9c54883579cf3c7a",
      "scripts/kiem-cheo/test/thu-pham.test.mjs": "8cba2ebabd17a50c5166ed6060b2e17f1cff7122cb9687ddbf0a41ee1c80bb97",
      "scripts/kiem-cheo/test/tien-do.test.mjs": "a36bb9a328fff91be17b1e2a7b0f0c86e9caf8afe6a28d92128e28bb740fcdf8",
      "scripts/lo-trinh-san-pham/test/do.spec.ts": "175f7007fc62fa92c53ce61f6e026cff46ade281deaf1522aa3897a24d0e5adb",
      "scripts/tin-hieu/test/do-bao-doi-cho.spec.ts": "ba160f2499b9bfab49014af9efaf83a23ddda0df94ee878f53c51fc51fab9ae7",
      "scripts/tin-hieu/test/do-gom.test.ts": "2ab9c0c8f98e32f158fd38ebd908bf11633b9bcd3a6a776ced55875b885c3160",
      "scripts/tin-hieu/test/gom-gia-co.test.ts": "19a2b08ed2855a89e1fd3e3f71fbf2a78dbbc17657c26c7ff2c7762e60735368",
      "scripts/tin-hieu/test/gom-lich.test.ts": "a564d40e0fe09744f65ebde6b97282b88e26fd02f99073aa40c2f366d57b7311",
      "scripts/tin-hieu/test/keo-ve-lich.test.ts": "e3b8f40f5c429fd993109bf479262d8a86a6308ff72f94f4051d91a4cbe55ff3",
      "scripts/tin-hieu/test/keo-ve.test.ts": "9d12f69f24e94b9c9b230517ada88b9ba266e05112c540456bbecd1b0a72d3db",
      "scripts/tin-hieu/test/lich.test.ts": "83fca64f6b11b14a195a64ff756a08210c108bba28bd4fc35ca7a025db3b5f13",
      "scripts/tin-hieu/test/nguong-song-khop.test.ts": "5d79e96f7014e6e2588135251e343ced152acaffbd8450f4cbdb68fd80dc3fe7"
    }
  },
  "cayChup": {
    "sha": "51403986a1bca580e5b9c371d02bc34a67289bfa",
    "ban": {},
    "chuaTheoDoi": []
  }
};
// ===== args contract — do SKILL.md feature-loop chuẩn bị =====
// {
//   slug: 'my-feature',
//   round: 1,                          // số round verify hiện tại (1-3)
//   riskTier: 'T2' | 'T3',
//   evals: [{ id, criterion, executor,  // 'test'|'script'|'ui-check'|'judgment'
//             cmd,                      // máy: lệnh ĐÃ resolve từ config: ref
//             ref,                      // config: ref GỐC (vd 'config:executors.test.api') — synthesize ghi verifier (hook L2)
//             expected, evidence_required,
//             question, inputs,           // judgment only; inputs = abs paths
//             runs,                        // OPTIONAL int>1: eval ngẫu nhiên (LLM) chạy N lần → pass_rate + variance
//             longRunning }],              // OPTIONAL (lenh-dai-chay-rieng): phút tối đa (khối LONG-RUNNING-RANGE) — lệnh
//                                          // dài hơn trần công cụ: chạy nền, nhật ký đường cố định, chờ bằng lệnh máy sinh
//   evalsChayRieng: ['E6', ...],       // OPTIONAL (lenh-dai-chay-rieng): id trong feature_loop.model_evals — lệnh của
//                                      // chúng chạy tuần tự SAU mọi lệnh máy khác. Vắng → thứ tự 2.24.0.
//   suiteCommands: ['npm run build', 'npm run typecheck', ...],
//                                      // thuoc-co-cua AC-9: lệnh có tên trong danh sách này chạy TUẦN TỰ (theo thứ tự
//                                      // xuất hiện) — kể cả khi trùng lệnh của một eval; lệnh máy khác giữ song song.
//   diffBase: 'main',
//   repoRoot: '<abs repo root>',
//   invokedAt: '2026-07-02T10:00:00Z',   // ISO, do skill lấy bằng `date -u` (script bị cấm Date) — ts cho run-log.jsonl
//   models: { judge: 'opus', ... },      // OPTIONAL — từ config feature_loop.models.<role>; 'session' = kế thừa. Role lạ/giá trị rác bị sanitize bỏ.

//   personasPath: '<abs>/judge-personas.md',
//   templatePath: '<abs>/evidence-report-template.md',
//   toolKillRule: '<NGUYEN VAN file skills/acceptance/references/tool-kill-rule.md>',  // BAT BUOC: nguon duy nhat luat «bi cong cu giet ≠ fail»; script rut khoi marker, thieu → BLOCKED (args)
//   contractPath: '<abs>/_acceptance/<slug>/contract.md',  // input của scope-triage (finding trong/ngoài hợp đồng).
//                                      // Vắng/không đọc được → triageFailed: KHÔNG finding nào được kéo REJECT.
//   reviewSkillPath: '<abs>/SKILL.md',  // OPTIONAL — skill review invariant riêng của repo; thiếu → review theo conventions (CLAUDE.md)
//   dryRun: false,                     // true → trả fan-out plan, KHÔNG spawn agent
//
//   ── Đợt 5 (P1/P2/P3 — carry-forward): TẤT CẢ optional, thiếu → hành vi 1.11 y nguyên ──
//   carriedEvals: [{ id, runId, fromRound, verifiedAt, cmd }],
//                                      // P1: eval máy/ui KHÔNG chạy lại (delta staleness không chạm paths của eval).
//                                      // id PHẢI có trong evals (định nghĩa 1 nguồn); runId = run_id GỐC đã nằm trong
//                                      // run-log từ round fromRound → hook L2/recheck đối chiếu pass tự nhiên.
//   carriedPanels: [{ evalId, proposal, votes: [{lens, verdict}], fromRound, inputsHash }],
//                                      // P3: panel giữ nguyên từ round trước (inputs_hash khớp) — KHÔNG spawn judge.
//   runBaseline: true,                 // P2: false → không spawn baseline agent (evals.yaml không đổi từ lần baseline cuối)
//   carriedAnalyst: { fromRound, nonDiscriminating: [{cmd, evals}] },  // P2: Analyst carry khi runBaseline=false
//   evalsHash: '<sha256 evals.yaml>',  // P2: ghi vào dòng run-log kind:"baseline" cho round sau so hash
//   evalsNotRun: ['E9', ...],           // OPTIONAL (thuoc-co-cua AC-1): id eval máy tự khai `status: not-run` — s4-args ĐÃ bỏ
//                                      // chúng khỏi `evals`; workflow KHÔNG chạy gì cho chúng, chỉ chuyển cho bước tổng hợp
//                                      // thành MỘT dòng «không chạy theo hồ sơ: <id, id>». Vắng/rỗng → không chữ nào thêm.
//   (judgment eval thêm optional inputsHash: '<sha256 question+inputs>' — ghi vào dòng run-log kind:"panel")
// }

// args co the den dang JSON string tuy harness (xac nhan bang dry-run e2e 2026-06-11) — parse truoc khi validate
if (typeof args === 'string') {
  try { args = JSON.parse(args) } catch (e) { args = null }
}
// AC-9: dòng tổng kết lượt phải có ở MỌI verdict — kể cả các đường BLOCKED trả
// về sớm. Chính những lượt này (args hỏng, thiếu luật, evals khai thiếu) là lớp
// mà ngưỡng «5 vòng kế» cần đếm; để chúng không dòng nào là đúng chỗ mù cần bịt.
// <<<ROUND-TALLY-SCHEMA
// Khuôn dòng tổng kết lượt — NGUỒN DUY NHẤT cho cả bên VIẾT (dưới đây) lẫn bên
// ĐỌC (round-tally-read.mjs rút chính khối này). `round` nhận number HOẶC null:
// null là SỰ THẬT có nghĩa «lượt hỏng trước khi biết được round», không phải dữ
// liệu lỗi — bản trước cho writer sinh null trong khi reader đòi number, nên một
// lượt hỏng-sớm làm câm bộ đọc của cả hồ sơ (S4-r2, lớp bên-viết-bên-đọc-trôi).
// {"round": number|null, "verdict": string, "expected": number,
//  "returned": number, "blocked": number, "kind": "round-tally"}
// ROUND-TALLY-SCHEMA>>>
const tallyLine = (verdict, blockedCount, expected = 0, returned = 0) => JSON.stringify({
  ts: (args && typeof args.invokedAt === 'string') ? args.invokedAt : '',
  ...(args && typeof args.invokedSha === 'string' && args.invokedSha ? { sha: args.invokedSha } : {}),
  round: (args && typeof args.round === 'number') ? args.round : null,
  kind: 'round-tally', verdict, expected, returned, blocked: blockedCount,
})
const blockedEarly = (cmd, reason) => ({
  verdict: 'BLOCKED', blocked: [{ cmd, reason }], failedEvals: [], failedCommands: [], panels: [],
  confirmedFindings: [], boNgoaiVat: [], reviewIncomplete: [], runLog: [tallyLine('BLOCKED', 1)], runLogWriteFailed: true,
})

// <<<CHOT-TRUONG-NGUOI
// Chốt máy trường-của-người (hồ sơ chot-may-chu-ky-sau-synthesize, mốc 2.18.2). Báo cáo
// bằng chứng là MỘT CHUỖI do tác tử tổng hợp viết; bốn trường trong đó không thuộc quyền tác
// tử: ba chữ của NGƯỜI (ADR 0002) và giờ đo mà ENGINE đã có. Dặn trong prompt không phải
// nghiệm (đo 23/09: 13/84 báo cáo kit, 12/56 crm mang verified_at tác tử đặt; S4-r2 của chính
// hồ sơ này: tác tử ghi 07:40:00Z tương lai trên 14 dòng) — nên JS viết lần cuối.
// KHUÔN (owner chọn «đổi khuôn» 23/09 sau hai lượt vá cùng lớp «chốt hẹp hơn bên đọc»): chốt
// KHÔNG tự đặt ngữ pháp — nó nhận đúng những gì BÊN ĐỌC (lib/evidence-core.cjs) nhận:
//   · human_signoff / bypass_ack: chỉ trong frontmatter, khoá cấp 0, hàng rào `---[ \t]*` sau
//     dòng trống đầu, thiếu rào đóng thì tới hết tệp (frontmatterField · chuKyThat);
//   · human_override / verified_at: mọi dòng `^\s*(-\s+)?khoá\s*[:=]`, mọi cột (L3 đếm override
//     ở mọi nơi); khoá so không phân biệt hoa thường;
//   · run_id của một bản ghi: mọi dòng `^\s*(-\s+)?run_id\s*[:=]` trong bản ghi, kể cả dòng mở,
//     bỏ chú thích và nháy (extractRunIds); bản ghi mở bằng `^\s*-\s+` (walkEvalExits);
//   · human_override rỗng viết thành `khoá:  # chi nguoi ghi` — L3 đếm cả dòng rỗng trần.
// Ngoại lệ: nội dung khối vô hướng (`output: |`…) không bao giờ chạm — xoá chuỗi ở đó là làm
// giả output. L3 của bên đọc KHÔNG neo dòng (`human_override\s*[:=]\s*[^#\s]` trên cả payload),
// nên các hình dạng dưới đây L3 vẫn đếm mà chốt KHÔNG được chạm (văn xuôi/output/chú thích) —
// GIỚI HẠN ĐÃ KHAI, nghiệm đúng tầng là neo L3 (hạt giống vế 2); ngưỡng mở lại: ≥ 1 báo cáo thật
// mang override ở một hình dạng dưới đây. Ca vi phân đòi mỗi tên có một ô và mỗi ô có tên.
// <<<GIOI-HAN-CHOT
//   giua-dong-bang     `| E3 | … | human_override: X |` — giữa dòng bảng
//   sau-chu-thich      `verdict: UNCERTAIN  # human_override: X` — trong chú thích
//   tien-to            `judge_human_override: X` — khoá khác có đuôi trùng
//   flow               `- {eval: E3, human_override: X}` — bản ghi một dòng
//   trong-vo-huong     nội dung `output: |` — không bao giờ chạm
// GIOI-HAN-CHOT>>> Ca vi phân tests/workflows/chot-truong-nguoi.test.mjs so chốt với bộ đọc
// thật trên bảng hình dạng viết trước; khối này rút nguyên văn bởi chot-truong-nguoi-corpus.mjs.
const KHOA_NGUOI = ['human_signoff', 'human_override', 'bypass_ack']
const RONG_OVERRIDE = '  # chi nguoi ghi'
// Hai khoá bên đọc CHỈ đọc ở frontmatter cấp 0 (frontmatterField · chuKyThat); override và giờ
// bên đọc đọc ở mọi nơi (L3 · HAS_VERIFIED_AT).
const KHOA_CHI_FM = ['human_signoff', 'bypass_ack']
const GIO_ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/
function chotTruongNguoi(report, opts) {
  const invokedAt = opts && typeof opts.invokedAt === 'string' && GIO_ISO_RE.test(opts.invokedAt) ? opts.invokedAt : ''
  const gioTheoRunId = (opts && opts.gioTheoRunId) || {}
  const doi = { human_signoff: 0, human_override: 0, bypass_ack: 0, verified_at: 0 }
  const text = typeof report === 'string' ? report : ''
  const tho = text.split('\n')
  const cr = tho.map(l => l.endsWith('\r'))
  const dong = tho.map((l, i) => (cr[i] ? l.slice(0, -1) : l))
  const n = dong.length
  const chuanHoa = v => String(v).replace(/\s+#.*$/, '').trim().replace(/^["']+|["']+$/g, '').trim()
  // Frontmatter theo frontmatterField / chuKyThat.
  const RAO = /^---[ \t]*$/
  let fmDau = 0
  while (fmDau < n && dong[fmDau].trim() === '') fmDau += 1
  let fmHet = -1, thanDau = 0
  if (fmDau < n && RAO.test(dong[fmDau])) {
    fmHet = n
    for (let j = fmDau + 1; j < n; j += 1) if (RAO.test(dong[j])) { fmHet = j; break }
    thanDau = fmHet < n ? fmHet + 1 : fmDau + 1
  }
  // Nội dung khối vô hướng: dòng sau một `khoá: |` / `khoá: >` thụt sâu hơn dòng mở của nó.
  const MO_VO_HUONG = /^[^:=]*[:=]\s*[|>][-+0-9]*\s*(#.*)?$/
  const voHuong = new Array(n).fill(false)
  let cotVh = -1
  for (let j = 0; j < n; j += 1) {
    const c = dong[j].search(/\S/)
    if (c === -1) { if (cotVh >= 0) voHuong[j] = true; continue }
    if (cotVh >= 0) { if (c > cotVh) { voHuong[j] = true; continue } cotVh = -1 }
    // Nội dung khối vô hướng thụt sâu hơn CỘT KHOÁ, không phải cột dấu gạch: `- output: |` có
    // khoá ở cột c+2, các trường anh em ở cột đó KHÔNG phải nội dung (S4-r3, t4).
    const cKhoa = c + ((dong[j].slice(c).match(/^-\s+/) || [''])[0].length)
    if (MO_VO_HUONG.test(dong[j])) cotVh = cKhoa
  }
  // Bản ghi: mở bằng `^\s*-\s+`, kéo tới dòng không trống đầu tiên thụt ≤ dòng mở. Dựng trên
  // CẢ frontmatter lẫn thân — bên đọc (extractRunIds) quét run_id trên toàn payload, nên một khối
  // carry lồng trong frontmatter vẫn phải giữ giờ carry (Ngoài-1 lượt 4). Dòng rào không mở bản ghi.
  const banGhi = new Array(n).fill(-1)
  const ridBanGhi = []
  let bg = -1, cotBg = -1
  const ghiDau = fmHet > 0 ? fmDau + 1 : thanDau
  for (let j = ghiDau; j < n; j += 1) {
    if (voHuong[j]) { banGhi[j] = bg; continue }
    const l = dong[j]; const c = l.search(/\S/)
    if (c === -1) continue
    if (/^\s*-\s+\S/.test(l) && (bg === -1 || c <= cotBg)) { bg = ridBanGhi.length; ridBanGhi.push(null); cotBg = c }
    else if (bg !== -1 && c <= cotBg) { bg = -1; cotBg = -1 }
    banGhi[j] = bg
    if (bg !== -1) {
      const m = l.match(/^\s*(?:-\s+)?run_id\s*[:=]\s*(.+?)\s*$/i)
      const rid = m ? chuanHoa(m[1]) : ''
      if (rid && ridBanGhi[bg] === null) ridBanGhi[bg] = rid
    }
  }
  const RE_TRUONG = /^(\s*(?:-\s+)?)(human_signoff|human_override|bypass_ack|verified_at)(\s*[:=])(.*)$/i
  let loi = null
  const ra = dong.map((l, j) => {
    if (voHuong[j]) return l
    const trongFm = fmHet > 0 && j > fmDau && j < fmHet
    if (!trongFm && j < thanDau) return l
    const m = l.match(RE_TRUONG)
    if (!m) return l
    const khoa = m[2].toLowerCase()
    // Cột 0 và «chỉ trong frontmatter» là ngữ pháp của RIÊNG hai khoá bên đọc đọc bằng
    // frontmatterField/chuKyThat; override và giờ bên đọc đọc ở mọi nơi — kể cả khi rào không đóng
    // làm cả tệp thành frontmatter (S4-r3, t1/t3: hồi quy của lượt đổi khuôn).
    if (KHOA_CHI_FM.includes(khoa) && (!trongFm || m[1] !== '')) return l
    if (KHOA_NGUOI.includes(khoa)) {
      const v = m[4].trim()
      if (v.startsWith('#')) return l
      // human_override rỗng TRẦN vẫn bị L3 đếm là «đã có người chấp thuận» khi dòng kế không mở
      // bằng `#` (biểu thức `\s*` của bên đọc vượt dòng) — nên dạng rỗng chuẩn của khoá này mang
      // chú thích; hai khoá kia bên đọc đọc theo dòng, rỗng trần là rỗng.
      if (v === '' && khoa !== 'human_override') return l
      doi[khoa] += 1
      return m[1] + m[2] + m[3] + (khoa === 'human_override' ? RONG_OVERRIDE : '')
    }
    const rid = banGhi[j] >= 0 ? ridBanGhi[banGhi[j]] : null
    const gio = rid && Object.prototype.hasOwnProperty.call(gioTheoRunId, rid) && gioTheoRunId[rid] ? gioTheoRunId[rid] : invokedAt
    if (!gio) { loi = 'chot-truong-nguoi: khong co gio engine (invokedAt vang) — khong ep duoc verified_at'; return l }
    if (chuanHoa(m[4]) === gio) return l
    doi.verified_at += 1
    return m[1] + m[2] + m[3] + (m[4].match(/^\s*/)[0] || ' ') + gio
  })
  if (loi) return { text, doi, loi }
  return { text: ra.map((l, i) => (cr[i] ? l + '\r' : l)).join('\n'), doi, loi: null }
}
// CHOT-TRUONG-NGUOI>>>

if (!args || !Array.isArray(args.evals) || !Array.isArray(args.suiteCommands)) {
  return blockedEarly('(args)', 'args.evals / args.suiteCommands phai la array — skill feature-loop build args sai')
}

// Luật chống «hạ tầng mạo danh vật» (TOOL-KILL-RULE): verifier chạy lệnh qua
// Bash tool có trần thời gian mặc định (~120s) NGẮN hơn nhiều suite — lệnh bị
// công cụ giết trả exit code CỦA CÔNG CỤ, không phải của lệnh (vấp thật
// release-2-2-0 S4 r5). MỘT NGUỒN duy nhất của luật là file
// skills/acceptance/references/tool-kill-rule.md của plugin acceptance-gate
// (khối marker <<<TOOL-KILL-RULE … TOOL-KILL-RULE>>>) — script này KHÔNG chép
// câu luật: main loop của skill feature-loop đọc file (resolve-plugin --require)
// và truyền NGUYÊN VĂN vào args.toolKillRule; dưới đây chỉ RÚT khối (tách theo
// dòng giữa hai marker) và nội suy vào prompt cả 3 lane (machine/ui/baseline).
// Thiếu args / không rút được marker → BLOCKED có tên, KHÔNG fallback chuỗi cứng
// (fallback chính là bản chép thứ hai). Nhận diện là việc AGENT; JS chỉ phòng
// thủ trên field cấu trúc killedByTool (normKill dưới) — KHÔNG grep output.
const TOOL_KILL_RULE = (() => {
  const src = typeof args.toolKillRule === 'string' ? args.toolKillRule : ''
  const lines = src.split('\n')
  const a = lines.findIndex(l => l.includes('<<<TOOL-KILL-RULE'))
  const b = lines.findIndex(l => l.includes('TOOL-KILL-RULE>>>'))
  if (a === -1 || b === -1 || b <= a) return ''
  return lines.slice(a + 1, b).join('\n').trim()
})()
if (!TOOL_KILL_RULE) {
  return blockedEarly('(args)', 'args.toolKillRule thieu hoac khong chua marker TOOL-KILL-RULE — skill feature-loop phai truyen NGUYEN VAN file skills/acceptance/references/tool-kill-rule.md cua plugin acceptance-gate (resolve-plugin.mjs --require); khong co luat nay verifier se doc exit code cua cong cu nhu exit code cua lenh' )
}

const KILLED_BY_TOOL_FIELD = { type: 'boolean', description: 'true khi lenh bi CONG CU dung (timeout tool/output cat) — exit code khong phai cua lenh; di kem cannotRun=true' }

const MACHINE_SCHEMA = {
  type: 'object',
  properties: {
    exitCode: { type: 'number' },
    outputTail: { type: 'string', description: 'NGUYEN VAN phan duoi tool result cua khung boc lenh — PHAI giu dong cuoi __EXIT=<n>; khong chon loc, khong viet lai' },
    runId: { type: 'string', description: 'run_id tu stdout neu co, khong co thi chuoi rong' },
    cannotRun: { type: 'boolean' },
    killedByTool: KILLED_BY_TOOL_FIELD,
    reason: { type: 'string', description: 'ly do neu cannotRun=true' },
  },
  required: ['exitCode', 'outputTail', 'cannotRun'],
}

// ui-check (v1.1): MACHINE_SCHEMA + screenshotPath — assertion máy-kiểm + evidence file
const UI_SCHEMA = {
  type: 'object',
  properties: {
    exitCode: { type: 'number', description: '0 = moi assertion pass' },
    outputTail: { type: 'string', description: 'cac assertion da kiem + ket qua' },
    runId: { type: 'string', description: 'chuoi rong neu khong co' },
    screenshotPath: { type: 'string', description: 'path file evidence da luu (anh; fallback .html neu khong co tool chup — ghi ro trong outputTail)' },
    observed: { type: 'string', description: 'mo ta NOI DUNG nhin thay trong TUNG frame da luu (da mo bang Read, doi chieu expected); chuoi rong neu cannotRun/khong co frame' },
    networkObserved: { type: 'string', description: 'NETWORK TRUTH vocab CHU: clean | no-app-traffic | third-party-only | app-fail | n-a (driver) | n-a (tool-error: <ly do>) | unscoped | unscoped-partial — theo luat scoping trong prompt; driver khong doc duoc network → "n-a (driver)"; TUYET DOI khong ghi so status/exit vao field nay' },
    cannotRun: { type: 'boolean' },
    killedByTool: KILLED_BY_TOOL_FIELD,
    reason: { type: 'string', description: 'ly do neu cannotRun=true' },
  },
  required: ['exitCode', 'outputTail', 'cannotRun'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['PASS', 'FAIL', 'UNCERTAIN'] },
    rationale: { type: 'string', description: '1-3 cau can cu' },
    required_evidence: { type: 'array', items: { type: 'string' }, description: 'BAT BUOC (nghi thuc) khi verdict khac PASS: moi muc la MOT bang chung cu the + cho lay no, du de "co muc nay thi verdict doi". PASS thi bo qua.' },
  },
  required: ['verdict', 'rationale'],
}

// judge-required-evidence: dấu ghim khi judge không-PASS mà bỏ trống danh sách
// bằng-chứng-thiếu — máy KHÔNG bịa hộ, dấu này chảy vào memo + report cho
// người thấy (đo O3). Chuỗi phải khớp token trong evidence-report-template.
const MISSING_EVIDENCE_MARK = '(judge không nêu bằng-chứng-thiếu)'
const normalizeVote = v => {
  if (!v) return v
  if (v.verdict === 'PASS') { const { required_evidence, ...rest } = v; return rest }
  const re = (Array.isArray(v.required_evidence) ? v.required_evidence : []).map(x => String(x).trim()).filter(Boolean)
  return { ...v, required_evidence: re.length ? re : [MISSING_EVIDENCE_MARK] }
}

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          file: { type: 'string' },
          line: { type: 'number' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          detail: { type: 'string' },
        },
        required: ['title', 'file', 'severity', 'detail'],
      },
    },
  },
  required: ['findings'],
}

const REFUTE_SCHEMA = {
  type: 'object',
  properties: {
    refuted: { type: 'boolean', description: 'true neu finding KHONG phai van de that hoac khong du can cu' },
    reason: { type: 'string' },
  },
  required: ['refuted', 'reason'],
}

// Scope-triage: finding da qua refuter DEU la loi THAT — cau hoi con lai la
// "co trong hop dong khong". Ba ngan: in-contract (co acRef) · out-of-contract
// (co proposal cho nguoi o Gate 2) · unclassified (buoc phan loai hong).
// Ba ngăn cho finding NGOÀI hợp đồng — MỘT nguồn cho cả ba bên đọc: schema
// triage (máy ép), prompt triage (agent phân loại), prompt synthesize (agent
// VIẾT review-findings.md mà thẻ Cổng 2 đọc lại). S4-r1 thêm `wont-fix` vào hai
// chỗ đầu mà quên chỗ thứ ba, nên giá trị mới có thể bị agent viết lại thành
// giá trị cũ trước khi tới thẻ — đúng seam LLM-viết→máy-đọc phải ở MỘT chỗ.
// <<<OOC-PROPOSAL-VALUES
const OOC_PROPOSALS = [
  ['known-limits', 'ghi han che da biet, ship nhu hien tai'],
  ['new-contract', 'dang mot feature rieng'],
  ['wont-fix', 'loi that nhung chi phi sua vuot xa hau qua — chap nhan va ghi vet, khong mo viec nao'],
]
// OOC-PROPOSAL-VALUES>>>
const OOC_ENUM = OOC_PROPOSALS.map(([v]) => v)
const OOC_GLOSS = OOC_PROPOSALS.map(([v, g]) => `"${v}" (${g})`).join(' hoac ')
// Khuôn MỘT mục ngoài hợp đồng — MỘT nguồn cho hai bên viết: prompt synthesize in nó cho tác
// tử, và `chenMucCarry` dựng mục carry bằng chính nó (luot-sua-giu-du-dem-dung AC-3). Ca P55 /
// hskt / nlvh / lan-v rút khối marker từ văn bản nguồn này.
// ── Chốt máy sau synthesize: mục CARRY và khung CARRY (luot-sua-giu-du-dem-dung) ─────────
// Hai thứ lượt trước đã có mà lượt này KHÔNG chấm lại thì máy tự đặt vào hai tệp, không trông
// vào tác tử tổng hợp nghe lời: crm don-okr-nhap-sai 07/10 mất cả hai (ba mục ngoài hợp đồng
// rụng khỏi thẻ, khối ui-check E12 mất ảnh). Hàm thuần, chạy lại vô hại (đã có thì không chèn).
const HEAD_NGOAI_RE = /^##\s+Ngoài hợp đồng/
const HEAD_RE = /^##\s+/
const CUM_RE = /Cụm ngoài vùng phủ/
const nhanCarry = c => ` (r${typeof c.fromRound === 'number' ? c.fromRound : '?'}${c.tepDoi === true ? ' · tệp đã đổi' : ''})`
// Dòng tiêu đề mục: máy chèn nhãn TRONG sao, tác tử có thể viết NGOÀI sao (`- **t** (r1)`) — cả hai là CÙNG
// một mục, nếu không thì bước chèn dưới đây in bản thứ hai. Khối giống từng ký tự với lib/out-of-contract.cjs
// (bộ đọc thẻ) — ca DG2.
// <<<OOC-TITLE-RE
const OOC_TITLE_RE = /^-\s+\*\*(.+?)\*\*(?:\s+(\([rR](?:\d+|\?)(?:\s*[·,—–-][^()]*)?\)))?\s*$/
// OOC-TITLE-RE>>>
const tieuDeMuc = m => m[1] + (m[2] ? ' ' + m[2] : '')
// Phần ngoặc sau tiêu đề chỉ là NHÃN LƯỢT khi khớp ĐÚNG nhóm nhãn của OOC_TITLE_RE — «(race condition)»,
// «(Redux …)», «(r1 lỗi)» là chữ của mục tươi, không phải nhãn (S4-r1 finding t2, AC-3: mục tươi cùng tệp tên
// dài hơn không được nuốt mục mang sang).
const NHAN_LUOT_RE = /^\([rR](?:\d+|\?)(?:\s*[·,—–-][^()]*)?\)$/
function dungMucCarry(c) {
  const khuon = OOC_ITEM_TEMPLATE.split('\n').slice(1, -1).join('\n')
  const v = { title: String(c.title || '') + nhanCarry(c), plain: c.plain || '', can_cu: c.can_cu || '', file: c.file || '', severity: c.severity || '', proposal: c.proposal || '' }
  return khuon.replace(/\{(\w+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(v, k) ? v[k] : m))
}
function chenMucCarry(text, carried) {
  const ds = (Array.isArray(carried) ? carried : []).filter(c => c && typeof c.title === 'string' && typeof c.file === 'string')
  if (!ds.length) return text
  const dong = String(text || '').split('\n')
  let dau = dong.findIndex(l => HEAD_NGOAI_RE.test(l))
  if (dau === -1) {
    // Tác tử không viết mục: dựng mục ngay trước dòng cụm (hoặc cuối tệp).
    const cum = dong.findIndex(l => CUM_RE.test(l))
    const o = cum === -1 ? dong.length : cum
    dong.splice(o, 0, '## Ngoài hợp đồng — người quyết ở Gate 2', '', 'Mục mang nhãn (r<N>) mang sang từ lượt N — lượt này không chấm lại; người quyết.', '')
    dau = o
  }
  let het = dau + 1
  while (het < dong.length && !HEAD_RE.test(dong[het])) het += 1
  // Mục đã có trong khối: cặp (tiêu đề, tệp). Khoá chỉ-tiêu-đề sẽ để một mục TƯƠI trùng tên
  // trên tệp khác nuốt mục carry (gap-probe P1 của hồ sơ, AC-3).
  const daCo = []
  let cur = null
  for (let i = dau + 1; i < het; i += 1) {
    const t = OOC_TITLE_RE.exec(dong[i])
    if (t) { cur = { title: tieuDeMuc(t), file: '' }; daCo.push(cur); continue }
    const f = cur && /^\s+file\s*:\s*(.+?)\s*$/.exec(dong[i])
    if (f) cur.file = f[1].replace(/^`|`$/g, '').replace(/:\d+(-\d+)?$/, '')
  }
  // Đã in = CÙNG tệp VÀ tiêu đề bằng đúng title, hoặc mở bằng «title (r» (nhãn carry). Khoá
  // «tiêu đề chứa title» để một mục TƯƠI cùng tệp tên dài hơn nuốt mục carry (AC-12, lượt chấm 1).
  const thieu = ds.filter(c => {
    const tepC = String(c.file).replace(/:\d+(-\d+)?$/, '')
    return !daCo.some(x => x.file === tepC && (x.title === c.title || (x.title.startsWith(c.title + ' (') && NHAN_LUOT_RE.test(x.title.slice(c.title.length + 1)))))
  })
  if (!thieu.length) return dong.join('\n')
  // Chèn sau dòng có chữ cuối cùng của khối (không tính dòng cụm).
  let sau = dau
  for (let i = dau + 1; i < het; i += 1) if (dong[i].trim() && !CUM_RE.test(dong[i])) sau = i
  const khoi = []
  for (const c of thieu) khoi.push('', ...dungMucCarry(c).split('\n'))
  if (dong[sau + 1] !== undefined && dong[sau + 1].trim() !== '') khoi.push('')
  dong.splice(sau + 1, 0, ...khoi)
  return dong.join('\n')
}
function chenKhungCarry(report, carriedForReport) {
  const coKhung = (Array.isArray(carriedForReport) ? carriedForReport : []).filter(c => c && c.screenshot && c.observed)
  if (!coKhung.length) return report
  const dong = String(report || '').split('\n')
  for (const c of coKhung) {
    const dau = dong.findIndex(l => new RegExp(`^-\\s+eval:\\s*${String(c.id).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`).test(l))
    if (dau === -1) continue
    let het = dau + 1
    while (het < dong.length && !/^(-\s|#)/.test(dong[het])) het += 1
    const than = dong.slice(dau + 1, het)
    const co = k => than.some(l => new RegExp(`^\\s+${k}\\s*:`).test(l))
    const them = []
    if (!co('screenshot')) them.push(`  screenshot: ${c.screenshot}`)
    if (!co('observed')) them.push('  observed: |', ...String(c.observed).split('\n').map(l => (l ? `    ${l}` : '')))
    if (!co('network_observed')) them.push(`  network_observed: ${c.network_observed || 'n-a (driver)'}`)
    if (!them.length) continue
    let sau = dau
    for (let i = dau + 1; i < het; i += 1) if (dong[i].trim()) sau = i
    dong.splice(sau + 1, 0, ...them)
  }
  return dong.join('\n')
}
const OOC_ITEM_TEMPLATE = `<<<OOC-ITEM-TEMPLATE\n- **{title}**\n  Người dùng thấy gì: {plain}\n  Căn cứ: {can_cu}\n  file: \`{file}\`\n  severity: {severity}\n  Đề xuất: {proposal}\nOOC-ITEM-TEMPLATE>>>`

// Chỉ dẫn viết căn cứ (hồ sơ bang-ngoai-n-co-can-cu) — MỘT nguồn: lời nhắc phân loại chèn nguyên khối này, và
// hội đồng chấm E7 đọc đúng khối giữa hai marker. Câu căn cứ là cột «Căn cứ» trên bảng Ngoài-n của thẻ Cổng 2.
// <<<CAN-CU-CHI-DAN
const CAN_CU_CHI_DAN = `- inContract=false: BAT BUOC viet them can_cu = MOT cau ngon ngu san pham noi VI SAO de xuat do: hau qua nang hay nhe voi nguoi dung, co mat hay lo du lieu khong, nguoi dung tu go duoc khong (tai lai, thu lai), sua sau re hay dat. Day la cot "Can cu" tren the Cong 2 — nguoi ky doc no de dong y hay dao de xuat ma khong mo tep nao. Cam ten ham, duong dan file, ma thoat, tu ngu regex/schema. Khong de xuat cach sua, khong doc code.\n`
// CAN-CU-CHI-DAN>>>

// Tên trường mã máy đúc — MỘT nguồn cho tải gửi, lược đồ và bộ ghép. Test rút từ
// đây (AC-10). Mã do máy đúc, LLM chỉ chép lại một chuỗi ngắn; định danh không còn
// là đường dẫn dài mà agent hay viết lại.
// <<<TRIAGE-ID-FIELD
const TRIAGE_ID_FIELD = 'tid'
// TRIAGE-ID-FIELD>>>

const TRIAGE_SCHEMA = {
  type: 'object',
  properties: {
    triaged: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          [TRIAGE_ID_FIELD]: { type: 'string', description: 'chep NGUYEN VAN ma cua finding (vd t3) — day la KHOA ghep; khong duoc doi, khong duoc danh so lai' },
          title: { type: 'string', description: 'chep NGUYEN VAN title cua finding duoc phan loai' },
          file: { type: 'string', description: 'chep NGUYEN VAN file cua finding — title KHONG duy nhat, (file,title) moi la khoa' },
          inContract: { type: 'boolean', description: 'true CHI khi finding lam mot AC cua contract that bai' },
          acRef: { type: 'string', description: 'id AC bi cham (vd AC-3) khi inContract=true; chuoi rong khi false' },
          rationale: { type: 'string', description: '1 cau: vi sao trong/ngoai hop dong' },
          plain: { type: 'string', description: 'CHI khi inContract=false: 1-2 cau NGON NGU SAN PHAM mo ta hau qua cho nguoi dung — day la chu THE Cong 2 in ra cho nguoi quyet doc. Cam ten ham, duong dan file, ma thoat, thuat ngu regex/schema. Chuoi rong khi inContract=true' },
          can_cu: { type: 'string', description: 'CHI khi inContract=false: MOT cau ngon ngu san pham — vi sao de xuat nay (luat o khoi CAN-CU-CHI-DAN cua loi nhac); chuoi rong khi inContract=true' },
          proposal: { type: 'string', enum: [...OOC_ENUM, ''], description: `CHI khi inContract=false: de xuat cho nguoi o Gate 2 — ${OOC_GLOSS}; chuoi rong khi inContract=true` },
        },
        required: ['title', 'file', 'inContract', 'acRef', 'rationale', 'proposal', 'plain', 'can_cu', TRIAGE_ID_FIELD],
      },
    },
    contractUnreadable: { type: 'boolean', description: 'true khi KHONG doc duoc contract — bat buoc bao that, tuyet doi khong doan phan loai tu tri nho' },
  },
  required: ['triaged', 'contractUnreadable'],
}

// Synthesize TRẢ VỀ NỘI DUNG hai file, KHÔNG ghi file. Vì sao: run-log phải nằm
// trên đĩa TRƯỚC evidence-report (hook L2 đối chiếu run_id trong report với log),
// mà run-log do main loop append sau khi workflow trả về — nên report cũng phải
// để main loop ghi, SAU log. Đồng thời bỏ nốt bề mặt "agent ghi file audit"
// (agent scribe đã bị bỏ cùng lý do — xem comment ở khối provenance).
const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    report: { type: 'string', description: 'NOI DUNG evidence-report.md day du theo template — main loop ghi file SAU khi append run-log' },
    findings: { type: 'string', description: 'NOI DUNG review-findings.md day du — main loop ghi file' },
  },
  required: ['report', 'findings'],
}


// Provenance đo BẰNG MÁY (3 lệnh cơ học), KHÔNG để synthesizer LLM tự quyết — giá trị thành literal cho prompt.
const PROV_SCHEMA = {
  type: 'object',
  properties: {
    bypass_used: { type: 'boolean' },
    enforcement_mode: { type: 'string', enum: ['strict', 'warn', 'off'] },
    verified_commit: { type: 'string', description: 'git rev-parse HEAD (40 hex nguyen van); khong phai git repo / loi → chuoi rong' },
  },
  required: ['bypass_used', 'enforcement_mode', 'verified_commit'],
}

// A/B baseline (đối chứng): kết quả chạy lại lệnh-CÓ-eval trên diffBase (commit gốc)
const BASELINE_SCHEMA = {
  type: 'object',
  properties: {
    dauRa: { type: 'string', description: 'TOAN BO stdout cua lenh baseline kit sinh, NGUYEN VAN (cac dong __BL ...) — JS doc ma thoat tu day' },
    killedByTool: KILLED_BY_TOOL_FIELD,
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          cmd: { type: 'string' },
          baselineExit: { type: 'number', description: 'exit code cua lenh tren commit goc (diffBase)' },
          cannotRun: { type: 'boolean', description: 'true neu khong chay duoc tren baseline (thieu env, worktree fail, lenh chua ton tai o commit goc)' },
          killedByTool: KILLED_BY_TOOL_FIELD,
          reason: { type: 'string' },
        },
        required: ['cmd', 'cannotRun'],
      },
    },
  },
  required: ['dauRa', 'results'],
}

// ===== MODEL ROUTING (logic thuần — unit-tested tại tests/workflows, case W10) =====
// Bảng route DUY NHẤT vai-trò → model. null = kế thừa model session của main loop.
// Đổi routing = đổi Ở ĐÂY (kèm sửa test W10) — không sửa rải rác trong agent().
const MODEL_ROUTES = {
  machine: 'haiku',      // chạy 1 lệnh + capture output — thuần cơ học
  ui: 'sonnet',          // nhiều bước (server lifecycle, assertion, evidence) nhưng không cần suy luận sâu
  judge: 'sonnet',       // phán xét scoped trên input đã resolve; majority 2/3 của panel bù sai số từng judge
  triage: 'sonnet',      // đối chiếu finding với văn bản contract — không đọc code, không cần model lớn
  finder: null,          // recall bug là chỗ trí tuệ tạo giá trị — GIỮ model lớn (kế thừa session)
  refute: 'sonnet',      // kiểm 1 finding cụ thể có sẵn file:line — phạm vi hẹp
  baseline: 'sonnet',    // worktree + chạy lại lệnh trên commit gốc — cơ học có điều kiện
  provenance: 'sonnet',  // 3 lệnh cơ học, kết quả thành literal cho prompt
  synthesize: 'sonnet',  // điền template từ verdict + JSON đã tính sẵn; hook evidence-gate chặn nếu sai shape
}
// Override per-role từ repo: config.yaml `feature_loop.models.<role>` — SKILL đọc và truyền
// args.models. sanitize THUẦN (unit-tested W15/W16): chỉ nhận role có trong bảng, value string
// không rỗng; 'session' = kế thừa model main loop. Repo không khai gì → default y nguyên.
const sanitizeModels = m => {
  const out = {}
  if (m && typeof m === 'object' && !Array.isArray(m)) {
    for (const k of Object.keys(MODEL_ROUTES)) {
      const v = m[k]
      if (typeof v !== 'string' || !v.trim()) continue
      out[k] = v.trim().toLowerCase() === 'session' ? null : v.trim()
    }
  }
  return out
}
const ROUTES = { ...MODEL_ROUTES, ...sanitizeModels(args && args.models) }
const modelOpt = role => (ROUTES[role] ? { model: ROUTES[role] } : {})
// ===== VAI → LOẠI TÁC TỬ (hồ sơ tac-tu-cham-chi-cham-khong, unit-tested AT2) =====
// Harness chép câu người gần nhất vào đầu đề bài MỌI tác tử, kèm luật «câu này thắng» — lời dặn
// «KHONG sua code» trong đề bài đã thua (ca 07/10). Nghiệm là danh sách công cụ: vai không cần
// ghi thì không cầm bút. Danh sách sống ở feature-loop/agents/<loại>.md; đổi bảng = đổi test AT2.
const AGENT_TYPES = {
  machine: 'feature-loop:cham-lenh', baseline: 'feature-loop:cham-lenh', finder: 'feature-loop:cham-lenh',
  refute: 'feature-loop:cham-lenh', provenance: 'feature-loop:cham-lenh',
  ui: 'feature-loop:cham-ui',
  judge: 'feature-loop:cham-doc', triage: 'feature-loop:cham-doc', synthesize: 'feature-loop:cham-doc',
}
const vaiOpt = role => ({ ...modelOpt(role), agentType: AGENT_TYPES[role] })
// Loại tác tử chỉ nạp lúc MỞ phiên: phiên mở trước khi cài gói gặp «agent type … not found» ở mọi
// lời gọi. Rơi CÓ TÊN: gọi lại MỘT lần cùng đề bài, không loại; vai ghi vào loaiVang → một dòng
// run-log `loai-tac-tu-vang`. Lỗi khác giữ hành vi cũ (ném tiếp → null như trước).
const LOAI_VANG_RE = /agent type .* not found/i
const loaiVang = new Map()   // vai → thông điệp lỗi đầu tiên
// Vai đọc từ tiền tố nhãn — không thêm khoá lạ vào opts (AT3: opts chỉ được thêm agentType).
const TIEN_TO_VAI = [['machine', 'machine:'], ['baseline', 'baseline:'], ['finder', 'review:'], ['refute', 'refute:'],
  ['provenance', 'capture:provenance'], ['ui', 'ui:'], ['judge', 'judge:'], ['triage', 'triage'], ['synthesize', 'synthesize:']]
const vaiCuaLoai = opts => (TIEN_TO_VAI.find(([, t]) => opts.label === t || opts.label.startsWith(t)) || [opts.label])[0]
// [wf-label:] dòng đầu prompt — harness KHÔNG ghi opts.label xuống transcript agent-*.jsonl;
// scripts/wf-usage.mjs (đo model/token per vai trò, 0-token) map transcript → role bằng tag này.
// Cả lượt (Cổng Bằng chứng 09/10): sau lần «not found» đầu tiên, lời gọi khởi động SAU đó đi thẳng
// không loại — bảng theo dõi chỉ hiện đợt đang bay lúc ấy là thất bại, không phải mọi lời gọi.
let loaiVangCaLuot = false
const agentT = (prompt, opts) => {
  const p = `[wf-label: ${opts.label}]\n${prompt}`
  const khongLoai = () => { const { agentType, ...con } = opts; return con }
  if (loaiVangCaLuot && opts.agentType) {
    const vai = vaiCuaLoai(opts)
    if (!loaiVang.has(vai)) loaiVang.set(vai, [...loaiVang.values()][0])
    return agent(p, khongLoai())
  }
  return agent(p, opts).catch(e => {
    const msg = String((e && e.message) || e)
    if (!opts.agentType || !LOAI_VANG_RE.test(msg)) throw e
    loaiVangCaLuot = true
    const vai = vaiCuaLoai(opts)
    if (!loaiVang.has(vai)) loaiVang.set(vai, msg.split('\n')[0])
    return agent(p, khongLoai())
  })
}
// <<<LOAI-VANG-LINE
// {"kind":"loai-tac-tu-vang","ts":"<invokedAt>","round":<n>,"vai":["<vai>"],"ly_do":"<thông điệp lỗi đầu tiên>"}
// LOAI-VANG-LINE>>>
const ghiLoaiVang = lines => {
  if (!loaiVang.size) return
  lines.push(JSON.stringify({ kind: 'loai-tac-tu-vang', ts: (args && typeof args.invokedAt === 'string') ? args.invokedAt : '', round: (args && typeof args.round === 'number') ? args.round : null, vai: [...loaiVang.keys()], ly_do: [...loaiVang.values()][0] }))
}
const khoaLoaiVang = () => (loaiVang.size ? { loaiTacTuVang: [...loaiVang.keys()] } : {})

// ---- Guard fail-loud: field mà prompt fan-out NỘI SUY THẲNG vào ----
// Thiếu = agent nhận "undefined"/chuỗi rỗng làm đề bài rồi vẫn trả PASS. Đo được
// ở motion-floor r1-r2 (judgment thiếu `question` → panel PASS 3/3 vào report).
// Executor lạ/vắng còn tệ hơn: không khớp bộ lọc nào bên dưới nên eval bị bỏ rơi
// IM LẶNG — không chạy, không blocked, không failed, verdict vẫn PASS.
// Kiểm NGUYÊN BỘ args.evals, TRƯỚC mọi lọc carry-forward và TRƯỚC dryRun: soi
// "tươi" thôi là tự mở lại đúng cửa hậu vừa đóng (panel carried của E6).
// Test RÚT bảng dưới đây TỪ MARKER, không chép tay — hai bên không được trôi.
// judgment `inputs` CỐ Ý không nằm trong bảng: vắng/rỗng đi nhánh UNCERTAIN
// (thiếu căn cứ ≠ hỏng khuôn), chỉ SAI KIỂU mới là hỏng khuôn.
// Bảng VÀ hai vị từ đọc nó nằm CÙNG trong marker: phép đo tồn kho rút cả ba rồi
// áp y nguyên. Để vị từ ngoài marker là mời test viết lại luật — và bản viết lại
// yếu hơn bản thật thì phép đo xanh trong khi lần chạy thật BLOCKED.
// <<<EVAL-REQUIRED-FIELDS
const EVAL_REQUIRED = {
  'test': { str: ['id', 'criterion', 'cmd'], arr: [] },
  'script': { str: ['id', 'criterion', 'cmd'], arr: [] },
  'ui-check': { str: ['id', 'criterion', 'expected'], arr: ['steps'] },
  'judgment': { str: ['id', 'criterion', 'question'], arr: [] },
}
const isBlankStr = v => typeof v !== 'string' || !v.trim()
const badStrArray = v => !Array.isArray(v) || !v.length || v.some(x => isBlankStr(x))
// judgment `inputs` KHÔNG ở bảng str/arr vì nó có HAI mức nặng riêng, và CẢ HAI
// phải nằm trong marker: S4-r1 đưa hai vị từ trên vào nhưng bỏ quên hai cái này,
// nên phép đo tồn kho lại chép tay và lại lệch engine theo cả hai chiều.
const badInputsShape = v => v !== undefined && v !== null && (!Array.isArray(v) || v.some(isBlankStr))
const isUngroundedInputs = v => !Array.isArray(v) || !v.length
// EVAL-REQUIRED-FIELDS>>>

// lenh-dai-chay-rieng AC-1/AC-2: khoảng hợp lệ của `long_running` (phút) — MỘT nguồn; s4-args.mjs
// RÚT khối này (bên viết kiểm cùng khoảng với bên đọc, không chép số).
// <<<LONG-RUNNING-RANGE
const LONG_RUNNING_MIN = 1
const LONG_RUNNING_MAX = 240
// LONG-RUNNING-RANGE>>>

const evalProblems = []
args.evals.forEach((e, i) => {
  const nm = (e && typeof e.id === 'string' && e.id.trim()) ? e.id.trim() : `#${i} (khong co id)`
  if (!e || typeof e !== 'object') { evalProblems.push(`${nm}: khong phai object`); return }
  // hasOwnProperty, KHÔNG phải EVAL_REQUIRED[x]: tra thẳng trên object literal thì
  // khoá kế thừa từ prototype trả về truthy — executor 'constructor'/'__proto__'/
  // 'toString' lọt qua nhánh fail-loud rồi ném TypeError ở spec.str. Đúng ca
  // "executor lạ" mà guard này sinh ra để bắt.
  const spec = (typeof e.executor === 'string' && Object.prototype.hasOwnProperty.call(EVAL_REQUIRED, e.executor))
    ? EVAL_REQUIRED[e.executor] : null
  if (!spec) {
    evalProblems.push(`${nm}: executor ${e.executor === undefined ? 'VANG' : JSON.stringify(e.executor)} khong thuoc {test, script, ui-check, judgment} — eval nay se bi bo roi im lang`)
    return
  }
  for (const f of spec.str) if (isBlankStr(e[f])) evalProblems.push(`${nm}: thieu field "${f}"`)
  for (const f of spec.arr) if (badStrArray(e[f])) evalProblems.push(`${nm}: field "${f}" phai la mang chuoi khong rong`)
  if (e.executor === 'judgment' && badInputsShape(e.inputs)) {
    evalProblems.push(!Array.isArray(e.inputs)
      ? `${nm}: field "inputs" phai la mang`
      : `${nm}: field "inputs" co phan tu khong phai chuoi`)
  }
  // Khoá vắng = lệnh thường. Có mặt mà sai → hỏng khuôn, không đoán (một lệnh 35 phút chạy như lệnh
  // thường là đúng sự cố crm 07/10 — fail-open ở đây đốt lượt).
  if (e.longRunning !== undefined && (!Number.isInteger(e.longRunning) || e.longRunning < LONG_RUNNING_MIN
    || e.longRunning > LONG_RUNNING_MAX || (e.executor !== 'test' && e.executor !== 'script'))) {
    evalProblems.push(`${nm}: longRunning ${JSON.stringify(e.longRunning)} khong hop le — so phut nguyen ${LONG_RUNNING_MIN}..${LONG_RUNNING_MAX}, chi cho eval test/script`)
  }
})
if (evalProblems.length) {
  log(`evals.yaml khai thieu ${evalProblems.length} cho — BLOCKED truoc khi fan-out, 0 agent`)
  return blockedEarly('(evals)', `evals.yaml khai thieu field bat buoc — sua file roi chay lai CUNG round nay: ${evalProblems.join(' ; ')}`)
}

// ---- Đợt 5 carry-forward (P1/P2/P3) — sanitize thuần; args thiếu → hành vi cũ y nguyên ----
// P1: chỉ nhận carried cho eval máy/ui CÓ TRONG args.evals (định nghĩa eval giữ 1 nguồn duy nhất).
// runId tác tử khai: bỏ khoảng trắng VÀ dấu nháy bao quanh trước khi tin. Tác tử trả chuỗi `""` (hai ký tự
// nháy) thì bản trước coi là có giá trị → run-log ghi `"\"\""`, báo cáo ghi `run_id: ""` mà bên đọc bỏ nháy ra
// rỗng rồi lặng lẽ bỏ qua (crm danh-sach-keo-chung r2: E3/E7/E12). Rỗng sau khi bỏ → đúc mã như khi vắng;
// eval MANG SANG với run_id như thế thì KHÔNG mang (chạy lại) — run-log cũ của kho tiêu thụ đang chứa nó.
// Mã verifier khai đi qua ĐÚNG luật bên đọc (`extractRunIds` của lib/evidence-core.cjs: bỏ đuôi
// ` # …`, bỏ mọi nháy đầu/cuối) TRƯỚC khi vào run-log. Verifier từng trả nguyên hai dấu nháy `""`
// thay cho chuỗi rỗng: bộ ghi chép nguyên vào log, bộ đọc bỏ nháy, hai bên lệch nhau — L2 PROVENANCE
// chặn ngay lúc ghi chữ ký (hồ sơ lo-trinh-cat-luot, 09/10). Còn rỗng sau chuẩn hoá → máy đúc mã.
const docRid = (v) => String(v == null ? '' : v).replace(/\s+#.*$/, '').trim().replace(/^["']+|["']+$/g, '').trim()
const evalById = new Map(args.evals.map(e => [e.id, e]))
const carriedEvals = (Array.isArray(args.carriedEvals) ? args.carriedEvals : []).filter(c =>
  c && typeof c.id === 'string' && typeof c.runId === 'string' && docRid(c.runId)
  && evalById.has(c.id) && evalById.get(c.id).executor !== 'judgment')
const carriedEvalIds = new Set(carriedEvals.map(c => c.id))
const runBaseline = args.runBaseline !== false // P2 — default true (tương thích ngược)
// thuoc-co-cua AC-1: ô khai không-chạy. Bên viết (s4-args) đã lọc chúng khỏi `evals`, nên ở
// đây chỉ còn việc NÓI RA — sanitize thuần; khoá vắng (args đời cũ) → mảng rỗng → không chữ nào.
const evalsNotRun = (Array.isArray(args.evalsNotRun) ? args.evalsNotRun : []).filter(id => typeof id === 'string' && id)

// ---- phân loại + dedupe (thuần JS, deterministic) ----
const machineEvals = args.evals.filter(e => (e.executor === 'test' || e.executor === 'script') && !carriedEvalIds.has(e.id))
const judgmentEvals = args.evals.filter(e => e.executor === 'judgment')
const uiEvals = args.evals.filter(e => e.executor === 'ui-check' && !carriedEvalIds.has(e.id))
// Thiếu CĂN CỨ ≠ hỏng KHUÔN: câu hỏi hỏi được, chỉ là chưa ai khai vật để đọc.
// Không spawn judge (họ sẽ phán từ hư không — đo được: panel trả PASS trên eval
// 0 input); chèn panel UNCERTAIN cơ học → routing đẩy PENDING-JUDGMENT → người
// quyết ở Gate 2. Cũng là đường đọc-cũ cho workspace đã ký khai judgment không
// có inputs (gate-card-ac-visibility E11/E12) — không bắt migrate hàng loạt.
const ungroundedIds = new Set(judgmentEvals.filter(e => isUngroundedInputs(e.inputs)).map(e => e.id))
// P3: panel carried chỉ hợp lệ khi trỏ đúng judgment eval hiện có + proposal hợp lệ.
// ungrounded LOẠI khỏi carried: panel cũ KHÔNG được ghi đè nhánh UNCERTAIN, nếu
// không thì một panel PASS 3/3 giả carry vô hạn (kịch bản E6 motion-floor).
const carriedPanels = (Array.isArray(args.carriedPanels) ? args.carriedPanels : []).filter(p =>
  p && typeof p.evalId === 'string' && judgmentEvals.some(e => e.id === p.evalId)
  && !ungroundedIds.has(p.evalId)
  && (p.proposal === 'PASS' || p.proposal === 'FAIL' || p.proposal === 'UNCERTAIN'))
const carriedPanelIds = new Set(carriedPanels.map(p => p.evalId))
const freshJudgmentEvals = judgmentEvals.filter(e => !carriedPanelIds.has(e.id) && !ungroundedIds.has(e.id))

// Mỗi lệnh distinct chạy đúng 1 lần, cover mọi eval trỏ tới nó (vd 1 lệnh itest cover E1-E11)
const byCmd = new Map()
for (const e of machineEvals) {
  if (!byCmd.has(e.cmd)) byCmd.set(e.cmd, [])
  byCmd.get(e.cmd).push(e.id)
}
for (const cmd of args.suiteCommands) {
  if (!byCmd.has(cmd)) byCmd.set(cmd, []) // suite command không gắn eval vẫn phải pass
}
const distinctCmds = [...byCmd.keys()]

// Kỳ vọng tính theo LỆNH, không theo eval: byCmd gom nhiều eval vào MỘT lượt
// chạy, mà một lượt chạy chỉ có một mã thoát. Hai eval chung lệnh khai hai mã
// khác nhau là mâu thuẫn không có lời giải đúng — BLOCKED có tên, để người sửa
// evals.yaml. Chọn thầm một mã là đúng lớp fail-open kit đang chặn.
const expOf = e => Number.isInteger(e.expectedExit) ? e.expectedExit : 0
const expByCmd = new Map()
const expConflicts = []
for (const cmd of distinctCmds) {
  const es = machineEvals.filter(e => e.cmd === cmd)
  if (!es.length) { expByCmd.set(cmd, 0); continue }   // lệnh suite: luôn kỳ vọng 0
  const set = [...new Set(es.map(expOf))]
  if (set.length > 1) {
    expConflicts.push({ cmd, reason: `hai eval tro cung lenh "${cmd}" khai HAI ma thoat mong doi khac nhau: ${es.map(e => `${e.id}=${expOf(e)}`).join(', ')} — mot luot chay chi co MOT ma thoat, may khong chon tham. Sua evals.yaml: tach lenh, hoac khai cung mot ma.` })
    expByCmd.set(cmd, 0); continue
  }
  expByCmd.set(cmd, set[0])
}
const expCmd = cmd => expByCmd.get(cmd) || 0
// AC-10 (khong phat mot cai thien): mot lenh khai ky vong khac 0 ma lan chay
// tra 0 la GIOI HAN DA KHAI KHONG CON, khong phai mot luot truot — cung dinh
// nghia voi lane repin-lane.mjs (hetHan). Dat MOT noi, dung xuyen "failed",
// rut gon dau ra bao cao, va lane doi chung (baseline/non-discriminating) de
// ba cho do khong troi khoi nhau nhu chinh lo hong nay da xay ra.
const isHetHan = (exitCode, cmd) => expCmd(cmd) !== 0 && exitCode === 0

// variance-N: số lần chạy mỗi lệnh = max(runs) trên các eval trỏ tới nó (default 1, cap 10).
// runs>1 = eval NGẪU NHIÊN (vd qua ctx.providers.invoke / generator-LLM) → cần phân phối pass-rate, không phải 1 phát.
const evalRuns = e => Math.max(1, Number.isInteger(e.runs) ? e.runs : 1)
const cmdRuns = new Map(distinctCmds.map(cmd => {
  const ns = machineEvals.filter(e => e.cmd === cmd).map(evalRuns)
  return [cmd, ns.length ? Math.min(10, Math.max(...ns)) : 1]
}))

// thuoc-co-cua AC-9: lệnh SUITE chạy TUẦN TỰ, lệnh eval giữ song song. Hai suite của cùng một
// lượt chồng lên nhau là đè tài nguyên chung (thư mục tạm, cổng, tiến trình nặng) — lượt chấm
// bị hạ tầng đốt chứ không vì vật. Hàng đợi sống trong bộ nhớ của MỘT lượt: không tệp khoá.
// Tư cách SUITE xét theo danh sách lệnh suite của args (so chuỗi lệnh), KHÔNG theo
// «lệnh không có eval đi kèm»: lệnh suite trùng lệnh của một eval bị gộp ở byCmd nên
// mảng eval của nó không rỗng (thuoc-co-cua, phản biện F1).
const SUITE_SET = new Set(args.suiteCommands || []);
// lenh-dai-chay-rieng AC-6: eval «nặng» (id trong `args.evalsChayRieng`, bên viết rút từ
// `feature_loop.model_evals` qua bộ đọc hẹp docModelEvals) dựng tài nguyên chung — crm 07/10: eval model dựng `eve dev`
// ở `apps/agent` trong lúc một ca suite canh đúng tiến trình đó, hai lượt REJECT. Lệnh của chúng chạy
// RIÊNG: tuần tự, SAU khi nhánh song song lẫn chuỗi suite đã xong. Thuộc tính của LỆNH (dedupe theo
// cmd), như làn ghim lại. Lệnh suite giữ chỗ trong chuỗi suite. Khoá vắng (args đời cũ) → nhóm rỗng.
const CHAY_RIENG = new Set((Array.isArray(args.evalsChayRieng) ? args.evalsChayRieng : []).filter(id => typeof id === 'string' && id))
const laChayRieng = c => (byCmd.get(c) || []).some(id => CHAY_RIENG.has(id))
const cmdTuanTu = distinctCmds.filter(c => SUITE_SET.has(c));
const cmdSongSong = distinctCmds.filter(c => !SUITE_SET.has(c) && !laChayRieng(c));
const cmdChayRieng = distinctCmds.filter(c => !SUITE_SET.has(c) && laChayRieng(c));
// lenh-dai-chay-rieng AC-2: thời lượng tối đa (phút) của LỆNH = max `longRunning` trên mọi eval trỏ
// tới nó — một lần chạy phục vụ mọi eval, nên hạn chờ phải đủ cho eval đòi dài nhất.
const cmdPhut = new Map(distinctCmds.map(cmd => [cmd, Math.max(0, ...machineEvals.filter(e => e.cmd === cmd && Number.isInteger(e.longRunning)).map(e => e.longRunning))]))

// A/B baseline: chỉ chạy lại trên diffBase các lệnh CÓ eval (eval của feature) — để biết lệnh nào
// xanh-cả-hai-phía (không phân biệt). Suite-only cmd bỏ qua (đắt + green-on-both là regression-guard bình thường).
// P2: runBaseline=false (evals.yaml không đổi từ lần baseline cuối) → không đo lại — tín hiệu
// "phân biệt/không" là thuộc tính của (eval, code); Analyst carry từ carriedAnalyst.
const baselineCmds = runBaseline ? distinctCmds.filter(c => (byCmd.get(c) || []).length > 0) : []

const LENSES = ['domain-correctness', 'operational-feasibility', 'spec-alignment']


log(`Round ${args.round}: ${distinctCmds.length} lenh may (dedupe tu ${machineEvals.length} eval + ${args.suiteCommands.length} suite), ${uiEvals.length} ui-check, ${freshJudgmentEvals.length} judgment x ${LENSES.length} judges`
  + (carriedEvals.length ? ` — carried ${carriedEvals.length} eval (P1)` : '')
  + (carriedPanels.length ? ` — carried ${carriedPanels.length} panel (P3)` : '')
  + (runBaseline ? '' : ' — baseline carried (P2)'))
if (cmdChayRieng.length) log(`Chay rieng (feature_loop.model_evals): ${cmdChayRieng.length} lenh, tuan tu SAU moi lenh may khac`)
if ([...cmdPhut.values()].some(p => p > 0)) log(`Lenh dai (long_running): ${distinctCmds.filter(c => cmdPhut.get(c) > 0).map(c => `${c.slice(0, 40)} ≤${cmdPhut.get(c)} phut`).join(' ; ')} — chay nen, nhat ky .acceptance-runs/${args.slug}/s4-lenh-dai/`)

// Sáu hình dạng lỗi đo-lường (matrix-measure-law — chưng cất từ baseline B4
// ≥13 round bị đốt + 4 hình dạng CLAUDE.md "thước gắn vào vật"). MỘT CHỖ:
// prompt finder `measurement` build từ danh sách này; test pin ba-chiều
// (pin-độc-lập ↔ const này ↔ prompt) + mutation từng phần tử.
const MEASUREMENT_SHAPES = [
  'Đo CHỈ DẪN thay vì ĐẦU RA (grep file hướng dẫn trong khi renderer không đọc key).',
  'Fixture VIẾT TAY đúng khuôn bên đọc — không round-trip rút-từ-writer-đọc-bằng-reader.',
  'Assert "chuỗi có mặt" trong khi lời hứa là QUAN HỆ giữa các giá trị.',
  'Assertion âm-tính-một-mình: không đối chứng dương, không ghim thông điệp.',
  'Tuyên quét LỚP nhưng chỉ có điểm-case — thiếu ma trận toàn phần viết-trước (số assert = số phần tử, mẫu P105).',
  'Đường dẫn hardcode ROOT — đo checkout của tác giả thay vì cây đang kiểm.',
]

// Review finders: repo có skill review riêng → dùng; không → review theo conventions chung
// S4-r2 ĐỔI KHUÔN: tín hiệu chỗ-đứng-hỏng phải là CẤU TRÚC, không phải chữ.
// Bản trước dò thông điệp `cd:` trong outputTail — đo TỪ VỰNG trên không gian
// mở: thiếu họ thông điệp của zsh/dash thì lọt, mà một lệnh sản phẩm lỡ in đúng
// chuỗi đó thì bị nuốt thành BLOCKED. Nay lệnh tự khai bằng MÃ THOÁT dành riêng:
// wrapper là `cd "<root>" || exit 97`, nên 97 = không vào được chỗ đứng, bất kể
// shell nào và bất kể lệnh in gì. 127 giữ nguyên (mã POSIX chuẩn cho
// command-not-found, cũng là mã chứ không phải chữ).
// <<<INFRA-EXIT-CODES
const INFRA_EXITS = {
  97: 'khong vao duoc cho dung (cd that bai: worktree bi don? repoRoot sai?) — HA TANG CHAM, khong phai san pham do',
  127: 'lenh/script khong ton tai o cho dung (command not found) — HA TANG CHAM, khong phai san pham do',
}
const CD_GUARD = (dir) => `cd ${dir} || exit 97`
// INFRA-EXIT-CODES>>>

// Khung bọc lệnh máy (cham-khong-tu-dot-luot AC-1): mã thoát là VẬT máy đọc, không phải điều
// tác tử suy từ chữ in ra (E21 crm, 26/09). Đầu ra ghi trọn ra tệp tạm; chỉ ĐUÔI (≤ 6000 byte)
// và một dòng dấu đi vào tool result, nên harness không cất đầu ra ra tệp (đo 27/09: 74 KB bị
// cất, preview 2 KB). Xuống dòng trước `)` để `#`/`exit` trong lệnh không nuốt dấu. Chỉ BỌC ở
// tầng prompt — chuỗi `cmd` là khoá của dedupe/carry/SUITE/run_id, không đổi.
// Trần byte là `tail -c 6000`, KHÔNG phải cắt dòng: `cut -c` đếm byte ở locale C mà đếm ký tự ở
// locale UTF-8, nên 40 dòng × 240 cột tự nó không chặn được byte (40 × 241 B > 8000 kể cả ở C).
// <<<EXIT-MARK
const EXIT_MARK = '__EXIT='
const BOC_LENH = (lenh) => `F=$(mktemp); ( ${lenh}\n) > "$F" 2>&1; rc=$?; tail -n 40 "$F" | cut -c1-240 | tail -c 6000; printf '\\n${EXIT_MARK}%s\\n' "$rc"; rm -f "$F"; (exit $rc)`
// Kết bằng `(exit $rc)`: trạng thái công cụ phải bằng mã của LỆNH, không bằng mã của `rm` (luôn 0) —
// thiếu vế này thì tác tử làm rơi dòng dấu mà khai theo trạng thái công cụ sẽ ra PASS giả (S4-r2).
// EXIT-MARK>>>

// Lệnh DÀI hơn trần công cụ (lenh-dai-chay-rieng AC-2/AC-3). Sự cố crm 07/10: công cụ không giết lệnh
// quá 600 s mà ĐẨY SANG NỀN; tệp nền trống vì BOC_LENH chỉ in lúc xong, tác tử đọc trống thành «bị
// giết» — hai lượt BLOCKED. Eval khai `long_running` thì kit giữ nhật ký ở đường CỐ ĐỊNH và chờ bằng
// lệnh MÁY sinh, tác tử chỉ chép nguyên văn:
//   BOC_NEN — chạy lệnh nền (job con, pid vào `.pid`), toàn bộ đầu ra vào nhật ký, lúc xong nối
//             `__EXIT=<n>` (cùng EXIT_MARK) rồi mới viết `.xong`.
//   CHO_NEN — mỗi lần gọi tối đa TRAN_LAN giây, DƯỚI trần MẶC ĐỊNH 120 s của công cụ (tác tử quên
//             timeout thì lệnh chờ cũng không bị đẩy sang nền — gap-probe F2). Chờ tệp `.xong`, KHÔNG
//             chờ chữ trong nhật ký: lệnh tự in `__EXIT=` giả giữa chừng không kết thúc việc chờ. Chưa
//             xong / quá hạn → đuôi ngắn với MỌI dòng dấu bị che (normDau không được thấy dấu nào trên
//             đuôi chưa-xong — gap-probe F1) + `__CHUA_XONG` / `__QUA_HAN`. Quá hạn → ghi `.qua-han`
//             (lần chờ sau vẫn trả quá hạn) rồi giết CẢ CÂY từ `.pid` (đệ quy pgrep -P).
// Nhật ký dưới `.acceptance-runs/` (eval-executors.md «Where a run writes its artifacts»), tự ẩn khỏi
// git như làn ghim lại (TU-AN-GIT). Chỉ BỌC ở tầng prompt — chuỗi `cmd` không đổi.
// <<<LENH-DAI
const TRAN_LAN_GIAY = 100
const DAU_CHUA_XONG = '__CHUA_XONG'
const DAU_QUA_HAN = '__QUA_HAN'
const NEN_DIR = `${args.repoRoot}/.acceptance-runs/${args.slug}/s4-lenh-dai`
// Nhãn LƯỢT: một lượt chấm = một invokedAt. Lượt cùng round chạy lại (BLOCKED hạ tầng) có tên nhật ký
// mới, nên không bao giờ đọc `.xong` của lượt trước (S4-r1 finding t3, S4-r2 finding t2).
const NHAN_LUOT = String(args.invokedAt || '').replace(/\D/g, '') || 'x'
// Dừng CẢ CÂY: thu danh sách (đệ quy pgrep -P) TRƯỚC khi gửi tín hiệu, TERM, chờ tối đa 5 s, KILL phần
// còn sống (S4-r1 finding t5: chỉ TERM thì lệnh bẫy tín hiệu sống tiếp, chồng lệnh nặng kế). Vòng `for`
// trên `$(…)` để tách từ giống nhau ở bash và zsh.
const DUNG_CAY = `cay() { echo "$1"; for c in $(pgrep -P "$1"); do cay "$c"; done; }; dung() { DS=$(cay "$1"); for p in $(printf '%s\\n' "$DS"); do kill -TERM "$p" 2>/dev/null; done; i=0; while [ $i -lt 10 ]; do S=; for p in $(printf '%s\\n' "$DS"); do kill -0 "$p" 2>/dev/null && S=1; done; [ -z "$S" ] && break; sleep 0.5; i=$((i+1)); done; for p in $(printf '%s\\n' "$DS"); do kill -KILL "$p" 2>/dev/null; done; }`
// Bước dọn cây MỒ CÔI của lượt trước đã GỠ (owner chọn thu phạm vi sau lượt chấm 4, sổ quyết định): nó đẻ
// lỗi ở lượt 3 (giết nhầm pid tái dùng) và lượt 4 (zsh chạy thẳng lệnh cuối của subshell nên pid không mang
// dòng lệnh khởi chạy — phép kiểm danh tính luôn trượt). Nhãn lượt trong tên nhật ký một mình đã chặn việc
// đọc kết quả cũ; lệnh dài của một lượt bị cắt ngang còn chạy chồng lượt chấm lại là giới hạn đã khai.
const BOC_NEN = (lenh, ten) => `D="${NEN_DIR}"; mkdir -p "$D"; [ -f "${args.repoRoot}/.acceptance-runs/.gitignore" ] || printf '*\\n' > "${args.repoRoot}/.acceptance-runs/.gitignore"; L="$D/${ten}.log"; rm -f "$L" "$L.xong" "$L.qua-han"; date +%s > "$L.bat-dau.t" && mv -f "$L.bat-dau.t" "$L.bat-dau"; ( ${lenh}\n) > "$L" 2>&1 & P=$!; echo "$P" > "$L.pid"; wait "$P"; rc=$?; printf '\\n${EXIT_MARK}%s\\n' "$rc" >> "$L"; echo "$rc" > "$L.xong"; (exit $rc)`
// Mốc bắt đầu thiếu (bước khởi chạy chưa chạy / hỏng) → lệnh chờ TỰ ghi mốc ở lần chờ đầu, nên số phút
// khai luôn chặn trên mọi ca — không lượt chấm nào treo (S4-r2 finding t2). Tự `mkdir -p`: lần chờ đầu có thể
// chạy TRƯỚC bước khởi chạy tạo thư mục — không ghi được mốc thì hạn rơi về 0 và «quá hạn» giả ngay.
// Mốc ghi NGUYÊN TỬ (tệp tạm rồi `mv`) ở cả hai lệnh, và lệnh chờ không bao giờ tin mốc rỗng/không phải số:
// `>` cắt tệp trước khi ghi, lệnh chờ đọc đúng lúc đó ra mốc rỗng → «quá hạn» giả (S4-r3: LN1 đỏ 4/4 khi
// bốn bản tệp ca chạy song song).
const CHO_NEN = (ten, phut) => `mkdir -p "${NEN_DIR}"; L="${NEN_DIR}/${ten}.log"; TRAN_LAN=${TRAN_LAN_GIAY}; HAN_PHUT=${phut}; ${DUNG_CAY}; [ -f "$L.bat-dau" ] || { date +%s > "$L.bat-dau.c" && mv -f "$L.bat-dau.c" "$L.bat-dau"; }; B=$(cat "$L.bat-dau" 2>/dev/null); case "$B" in ''|*[!0-9]*) B=$(date +%s);; esac; HAN=$((B + HAN_PHUT * 60)); T=$(( $(date +%s) + TRAN_LAN )); KQ=chua-xong; while :; do if [ -f "$L.qua-han" ]; then KQ=qua-han; break; fi; if [ -f "$L.xong" ]; then KQ=xong; break; fi; N=$(date +%s); if [ "$N" -ge "$HAN" ]; then KQ=qua-han; : > "$L.qua-han"; P=$(cat "$L.pid" 2>/dev/null); [ -n "$P" ] && dung "$P"; break; fi; if [ "$N" -ge "$T" ]; then break; fi; sleep 2; done; if [ "$KQ" = xong ]; then tail -n 40 "$L" | cut -c1-240 | tail -c 6000; else tail -n 5 "$L" 2>/dev/null | sed 's/^${EXIT_MARK}/[__EXIT che]/' | cut -c1-240; if [ "$KQ" = qua-han ]; then printf '\\n${DAU_QUA_HAN}\\n'; else printf '\\n${DAU_CHUA_XONG}\\n'; fi; fi`
// LENH-DAI>>>

// Lane ĐỐI CHỨNG (baseline:diffBase) chạy MỘT lệnh do kit sinh (hồ sơ baseline-tran-bo-qua-don).
// Sự cố crm 07/10 (wf_f425c910-a3b): prompt cũ để tác tử TỰ CHẾ cách chạy — nó dựng vòng `while read …
// bash -c "…$c"`, và lệnh ấy chờ một hộp xin quyền 5 giờ dù phiên ở bypassPermissions (nhật ký app:
// yêu cầu 22:45:15, owner bấm 03:45:17 giờ máy). Lượt 08:32 cùng ngày: tác tử baseline khác, vòng `eval
// "$c"`, cũng bị hỏi. Lệnh máy (BOC_LENH, lệnh viết thẳng) chưa lần nào bị hỏi. Nên lệnh dưới đây:
//   · viết THẲNG từng lệnh eval vào khối của nó — KHÔNG eval / bash -c "$biến" / while-read / <(…);
//   · TRẦN mỗi lệnh (canh nền giết CẢ CÂY bằng DUNG_CAY) + TRẦN TỔNG dưới trần 600 s của công cụ, nên
//     một lần gọi Bash không bao giờ treo quá trần tổng; lệnh hết lượt ghi «het-tran-tong», không chạy;
//   · BỎ QUA lệnh trỏ tới tệp CÓ ở cây đang kiểm mà KHÔNG có ở merge-base — đo code cũ bằng một tệp kiểm
//     chưa tồn tại không phân biệt gì (crm: 8 lệnh «had no matches»);
//   · DỌN worktree tạm bằng trap (EXIT/TERM/HUP/INT), và QUÉT worktree `agk-baseline*` mồ côi của lượt
//     trước bị giết cứng (KILL không chạy trap) — trừ lượt có pid trong lý do khoá còn sống.
// Kết quả là DÒNG DẤU trên stdout (`__BL <i> <kq> …`, `__BL_XONG`), JS đọc — không tin results[] tác
// tử khai. Đầu ra của chính lệnh eval đi vào nhật ký, không lên stdout, nên lệnh không giả được dấu.
// KHÔNG `rm`/`rmdir` nào: kiểm tra an toàn có sẵn của Claude Code hỏi người cho mọi lệnh xoá có đích là
// biến nó không phân giải được, và cho mọi script `-c`/eval có `rm` nó không đọc được — kể cả ở
// bypassPermissions. Đo 08/10 trong phiên sửa, chạy CHÍNH lệnh này qua công cụ Bash: bản có `rmdir
// "$T0"` (T0 từ dirname) bị chặn. Nên: worktree nằm thẳng trong thư mục mktemp, khoá bằng `git worktree
// lock` khoá NGUYÊN TỬ ngay lúc `worktree add --lock --reason "agk-baseline pid <$$>"` (dấu sống cho bước
// quét; khoá tách bước sau `add` để hở một khe mà bước quét của lượt song song coi worktree là mồ côi), gỡ bằng `worktree remove --force
// --force` (git xoá cả thư mục); cờ chạm trần là ghi đè tệp, không xoá.
// Chạy được ở bash lẫn zsh (công cụ chạy lệnh trong zsh): vòng `for` chỉ trên chữ viết thẳng hoặc
// `$(…)`, không glob — zsh dừng cả lệnh khi glob không khớp.
// GIỚI HẠN ĐÃ KHAI: hộp xin quyền đến TRƯỚC khi lệnh chạy, nên không trần nào trong lệnh chặn được nó;
// harness không có trần cho agent(). Ngưỡng mở lại: ≥1 lượt baseline chờ hộp xin quyền với lệnh kit sinh.
// <<<BASELINE-LENH
const BL_TRAN_LENH_GIAY = 180
const BL_TRAN_TONG_GIAY = 480
const BL_DIR = `${args.repoRoot}/.acceptance-runs/${args.slug}/s4-baseline/${NHAN_LUOT}`
const DAU_BL = '__BL'
const sq = s => `'${String(s).replace(/'/g, `'\\''`)}'`
// Tệp mà lệnh trỏ tới — suy theo `cd` của TỪNG phạm vi: chuỗi trong nháy chứa toán tử là một lệnh con
// (`bun run test -- "cd apps/api && bun test x.spec.ts"`) với `cd` riêng, không rò ra lệnh ngoài.
// Ứng viên chỉ là ĐOÁN; lệnh sinh ra mới hỏi git: bỏ qua chỉ khi tệp CÓ ở cây đang kiểm và VẮNG ở
// merge-base — chữ không phải tệp (cờ, tên test) tự rơi vì không tồn tại.
const BL_TACH = /&&|\|\||[;|&]/
function tachTu(s) {
  const out = []
  let cur = '', q = null, coNhay = false
  const day = () => { if (cur || coNhay) out.push({ t: cur, nhay: coNhay }); cur = ''; coNhay = false }
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (q) { if (ch === q) q = null; else cur += ch; continue }
    if (ch === '"' || ch === "'") { q = ch; coNhay = true; continue }
    if (/\s/.test(ch)) { day(); continue }
    if (ch === ';' || ch === '|' || ch === '&') { day(); out.push({ t: ch, toanTu: true }); continue }
    if (ch === '>' || ch === '<') { if (/^\d+$/.test(cur)) cur = ''; day(); out.push({ t: ch, chuyenHuong: true }); continue }
    cur += ch
  }
  day()
  return out
}
function noiDuong(cwd, p) {
  const ra = []
  for (const phan of (cwd ? cwd.split('/') : []).concat(p.split('/'))) {
    if (!phan || phan === '.') continue
    if (phan === '..') { if (!ra.length) return null; ra.pop(); continue }
    ra.push(phan)
  }
  return ra.length ? ra.join('/') : null
}
function tepCuaLenh(cmd, cwd0 = '') {
  const ra = []
  let cwd = cwd0, dauDoan = true, sauChuyenHuong = false
  for (const tk of tachTu(String(cmd))) {
    if (tk.toanTu) { dauDoan = true; sauChuyenHuong = false; continue }
    // Đích chuyển hướng (`> out/r.json`) là tệp lệnh GHI, không phải tệp lệnh đo.
    if (tk.chuyenHuong) { sauChuyenHuong = true; continue }
    if (sauChuyenHuong) { sauChuyenHuong = false; continue }
    const t = tk.t
    if (tk.nhay && BL_TACH.test(t)) { if (cwd !== null) ra.push(...tepCuaLenh(t, cwd)); dauDoan = false; continue }
    if (dauDoan && t === 'cd') { dauDoan = 'cd'; continue }
    if (dauDoan === 'cd') {
      cwd = (cwd === null || t.startsWith('/') || /[$~*?{]/.test(t)) ? null : noiDuong(cwd, t) || ''
      dauDoan = false; continue
    }
    dauDoan = false
    if (cwd === null) continue
    const v = t.startsWith('-') ? (t.includes('=') ? t.slice(t.indexOf('=') + 1) : '') : t
    if (!v || v.startsWith('/') || /[$~*?{}<>]/.test(v)) continue
    if (!v.includes('/') && !/\.[A-Za-z0-9]{1,6}$/.test(v)) continue
    const p = noiDuong(cwd, v)
    // Thứ do môi trường/lượt chạy cấp, không phải tệp kiểm của eval: phụ thuộc cài đặt và tệp env.
    if (!p || /(^|\/)node_modules(\/|$)/.test(p) || /(^|\/)\.env[^/]*$/.test(p)) continue
    if (!ra.includes(p)) ra.push(p)
  }
  return ra
}
// Một khối cho một lệnh: kiểm tệp mới → kiểm trần tổng → chạy nền có canh trần → dòng dấu.
const BL_KHOI = (i, cmd) => {
  const teps = tepCuaLenh(cmd)
  const kiemTep = teps.length
    ? `for p in ${teps.map(sq).join(' ')}; do if [ -z "$KQ" ] && [ -e "$R/$p" ] && ! git -C "$R" check-ignore -q -- "$p" 2>/dev/null && ! git -C "$R" cat-file -e "$B:$p" 2>/dev/null; then KQ="bo-qua $p"; fi; done; `
    : ''
  return `KQ=; ${kiemTep}CON=$((HAN - $(date +%s))); if [ -n "$KQ" ]; then echo "${DAU_BL} ${i} $KQ"; elif [ "$CON" -le 0 ]; then echo "${DAU_BL} ${i} het-tran-tong"; else L="$D/${i}.log"; : > "$L.qua-tran"; HL=$TRAN_LENH; [ "$CON" -lt "$HL" ] && HL=$CON; ( ${CD_GUARD('"$WT"')} && ${cmd}\n) > "$L" 2>&1 < /dev/null & P=$!; ( sleep "$HL"; echo 1 > "$L.qua-tran"; dung "$P" ) > /dev/null 2>&1 < /dev/null & G=$!; wait "$P"; rc=$?; P=; kill "$G" $(pgrep -P "$G") 2>/dev/null; wait "$G" 2>/dev/null; if [ -s "$L.qua-tran" ]; then echo "${DAU_BL} ${i} qua-tran $HL"; else echo "${DAU_BL} ${i} xong $rc"; fi; fi`
}
const LENH_BASELINE = (cmds) => [
  `R=${sq(args.repoRoot)}; B=${sq(args.diffBase)}; D=${sq(BL_DIR)}; TRAN_LENH=${BL_TRAN_LENH_GIAY}; TRAN_TONG=${BL_TRAN_TONG_GIAY}; ${DUNG_CAY}`,
  `HAN=$(( $(date +%s) + TRAN_TONG )); mkdir -p "$D"; [ -f "$R/.acceptance-runs/.gitignore" ] || printf '*\\n' > "$R/.acceptance-runs/.gitignore"; echo "${DAU_BL}_BAT_DAU ${cmds.length}"`,
  `for e in $(git -C "$R" worktree list --porcelain | awk '/^worktree /{if (w != "") print w "|" p; w = ""; p = ""; x = substr($0, 10); if (x ~ /\\/agk-baseline[^\\/]*$/) w = x} /^locked agk-baseline pid /{p = $4} END{if (w != "") print w "|" p}'); do w=\${e%|*}; P0=\${e##*|}; if [ -n "$P0" ] && kill -0 "$P0" 2>/dev/null; then :; else git -C "$R" worktree remove --force --force "$w" > /dev/null 2>&1; echo "${DAU_BL}_DON $w"; fi; done; git -C "$R" worktree prune > /dev/null 2>&1`,
  `P=; G=; WT=$(mktemp -d "\${TMPDIR:-/tmp}/agk-baseline.XXXXXX")`,
  `don() { if [ -n "$P" ]; then dung "$P"; fi; if [ -n "$G" ]; then kill "$G" 2>/dev/null; fi; if [ -n "$WT" ]; then git -C "$R" worktree remove --force --force "$WT" > /dev/null 2>&1; git -C "$R" worktree prune > /dev/null 2>&1; WT=; fi; }; trap don EXIT; trap 'don; exit 129' HUP; trap 'don; exit 130' INT; trap 'don; exit 143' TERM`,
  `if git -C "$R" worktree add --detach --lock --reason "agk-baseline pid $$" "$WT" "$B" > "$D/worktree.log" 2>&1; then for m in $(cd "$R" && find . -maxdepth 3 -path ./.git -prune -o -type d -name node_modules -prune -print 2>/dev/null); do m=\${m#./}; [ -e "$WT/$m" ] || { [ -d "$(dirname "$WT/$m")" ] && ln -s "$R/$m" "$WT/$m"; }; done; for e in .env .env.local; do [ -e "$R/$e" ] && [ ! -e "$WT/$e" ] && ln -s "$R/$e" "$WT/$e"; done`,
  ...cmds.map((c, k) => BL_KHOI(k + 1, c)),
  `else echo "${DAU_BL}_HA_TANG worktree-add"; fi; don; echo "${DAU_BL}_XONG"`,
].join('\n')
// Bộ đọc dấu — MỘT nguồn với bên viết (DAU_BL). Trả { du, haTang, theoCmd: Map(cmd → kết quả) }.
// `du` = có `__BL_XONG` và không `__BL_HA_TANG`; lệnh vắng dòng dấu → cannotRun có tên.
function docBaseline(dauRa, cmds) {
  const s = String(dauRa || '')
  const haTang = (s.match(new RegExp(`^${DAU_BL}_HA_TANG (.+)$`, 'm')) || [])[1] || ''
  const du = new RegExp(`^${DAU_BL}_XONG$`, 'm').test(s) && !haTang
  const theoCmd = new Map()
  const re = new RegExp(`^${DAU_BL} (\\d+) (xong|qua-tran|het-tran-tong|bo-qua)(?: (.*))?$`, 'gm')
  let m
  while ((m = re.exec(s))) {
    const cmd = cmds[Number(m[1]) - 1]
    if (cmd === undefined || theoCmd.has(cmd)) continue
    const kq = m[2], du3 = (m[3] || '').trim()
    if (kq === 'xong' && /^-?\d+$/.test(du3)) theoCmd.set(cmd, { cmd, baselineExit: Number(du3), cannotRun: false })
    else if (kq === 'qua-tran') theoCmd.set(cmd, { cmd, cannotRun: true, tran: true, reason: `baseline vuot tran ${du3} giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu` })
    else if (kq === 'het-tran-tong') theoCmd.set(cmd, { cmd, cannotRun: true, tran: true, reason: `het tran tong ${BL_TRAN_TONG_GIAY} giay cua lane baseline truoc khi toi lenh nay — khong chay` })
    else if (kq === 'bo-qua') theoCmd.set(cmd, { cmd, cannotRun: true, boQua: true, reason: `bo qua baseline: tep ${du3} co o cay dang kiem nhung chua co o merge-base ${args.diffBase} — eval moi, chay tren code cu khong phan biet gi` })
  }
  return { du, haTang, theoCmd }
}
// BASELINE-LENH>>>

// Glob toi gian theo ngu nghia chuan: `**/` khop KHONG hoac NHIEU thu muc (nen
// `src/**/*.ts` phai khop ca `src/a.ts`), `**` khop moi thu, `*` khop trong mot doan.
// Tach `**` TRUOC khi doi `*`, neu khong `**` bi doi thanh hai lan `[^/]*` va het
// khop qua dau `/`. Ky tu glob khac (`?`) duoc escape de khong thanh luong tu regex.
// `?` = ĐÚNG MỘT ký tự trong một đoạn (cùng ngữ nghĩa với matcher `paths` của kit và với
// bản ở carry-plan.mjs mà s4-args dùng). Bản trước escape `?` thành ký tự literal, nên
// một mẫu `t1_skip_globs` có `?` cho bên VIẾT loại tệp khỏi vùng vật trong khi bên ĐỌC
// vẫn coi finding trên tệp đó là trong vật — hai đầu nói hai chuyện về cùng một trường
// (lượt chấm 1 của hồ sơ này bắt; ca VV4b canh bằng ma trận).
function globToRe(g) {
  const lit = t => t.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\?/g, '[^/]').replace(/\*/g, '[^/]*')
  const body = String(g).split('**/')
    .map(part => part.split('**').map(lit).join('.*'))
    .join('(?:.*/)?')
  return new RegExp('^' + body + '$')
}

// ── T2 (khoi-tim-loi-tra-phi-theo-vat): VÙNG VẬT — đọc từ s4-args, KHÔNG tự tính ──
// `args.vungVat` vắng (SKILL/s4-args đời cũ) → đường đọc-cũ: diff trọn, không lọc,
// cờ vàng trong log. Không bắt kho nào migrate.
const coVungVat = Array.isArray(args.vungVat)
const vungVat = coVungVat ? args.vungVat.filter(f => typeof f === 'string' && f) : []
const ngoaiVatRes = (Array.isArray(args.ngoaiVatGlobs) ? args.ngoaiVatGlobs : [])
  .filter(g => typeof g === 'string' && g).map(globToRe)
// ĐỔI KHUÔN (owner quyết 14/09 theo STOP-PATCHING): bên đọc KHÔNG còn khớp glob. Lớp
// «writer/reader trôi» đã tái phát ba lần vì bên viết tính xong rồi vẫn chỉ truyền MẪU,
// buộc bên đọc dựng lại vị từ. Nay bên viết truyền KẾT QUẢ; ở đây chỉ còn phép
// thuộc-tập — không có vị từ nào để trôi.
//
// Hệ quả đẹp: `ngoaiVatFiles` chỉ chứa tệp TRONG DIFF, nên finding ở tệp NGOÀI diff
// (lớp liên-file) tự nhiên đi tiếp mà không cần vế miễn trừ nào.
//
// SUA KHUNG (owner quyet 14/09 sau DUNG-VA lan hai). Ban dau cua DOI KHUON chi doc
// THUOC-TAP, va tap do chi chua tep TRONG DIFF — nen moi tep NGOAI diff roi khoi bo loc:
// finding tren docs/**, CLAUDE.md, hay gap-probe.md chua commit di thang vao triage.
// Goc: cau hoi «duong dan nay co phai vat khong» co mien MO (finder bao duoc bat ky
// duong dan nao), ma mot TAP chi tra loi duoc tren mien DONG.
//
// Nay chia theo MIEN: tep CO trong diff tra loi bang KET QUA ben viet da tinh (khong
// vi tu nao de troi); moi duong dan khac tra loi bang MAU. Rui ro troi writer/reader
// ma DOI KHUON sinh ra de chan nay da co rang canh that (VV4 rut ham cua ben doc tu
// nguon; VV4b so hai ban khop glob tren ma tran 9 o) — dieu kien khac han luc doi khuon.
const coNgoaiVatFiles = Array.isArray(args.ngoaiVatFiles)
const ngoaiVatSet = new Set(coNgoaiVatFiles ? args.ngoaiVatFiles : [])
// `diffFiles` noi mot duong dan thuoc mien nao. Ben viet doi cu khong truyen → coi nhu
// KHONG biet mien nao, tuc moi duong dan di duong MAU (duong doc-cu, hanh vi truoc 14/09).
const coDiffFiles = Array.isArray(args.diffFiles)
const diffSet = new Set(coDiffFiles ? args.diffFiles : [])
// Ve mien tru: tep khai trong `eval.paths` la DAU VAO CUA THUOC, khong bao gio la
// ngoai-vat. Ap cho nhanh MAU (nhanh TAP da co ve nay nuong trong ket qua ben viet).
const pathsKhaiResDoc = (Array.isArray(args.evals) ? args.evals : [])
  .flatMap(e => Array.isArray(e.paths) ? e.paths : []).map(globToRe)
const khopMauNgoaiVat = pth => ngoaiVatRes.length > 0
  && !pathsKhaiResDoc.some(re => re.test(pth))
  && ngoaiVatRes.some(re => re.test(pth))
const laNgoaiVat = pth => (coNgoaiVatFiles && coDiffFiles && diffSet.has(pth))
  ? ngoaiVatSet.has(pth)
  : khopMauNgoaiVat(pth)
if (coVungVat && !coNgoaiVatFiles) log(ngoaiVatRes.length
  ? 'CO VANG: args.ngoaiVatFiles vang (s4-args doi cu) — loc ngoai-vat chay bang MAU glob cho MOI duong dan (duong doc-cu)'
  : 'CO VANG: args.ngoaiVatFiles VA args.ngoaiVatGlobs deu vang — KHONG loc dau ra theo ngoai-vat (duong doc-cu, fail-open co khai)')
if (coVungVat && coNgoaiVatFiles && !coDiffFiles) log('CO VANG: args.diffFiles vang — khong phan biet duoc mien, moi duong dan di duong MAU (duong doc-cu)')
if (!coVungVat) log('Vung vat khong khai (args.vungVat vang) — finder soi tron diff, khong loc dau ra (duong doc-cu)')
// Lens `measurement` CHỈ spawn khi diff chạm phép đo. Tập file đo = glob tệp ca kiểm
// thử + MỌI tệp không phải .md/.jsonl trong thư mục hồ sơ (kho tiêu thụ đặt răng ở
// `_acceptance/<slug>/rang/*.mjs` — một mẫu kiểu kit `rang*.sh` sẽ trượt hết) + tệp
// khai trong `eval.paths`. Không chắc → SPAWN: fail-open về phía tốn tiền, không về
// phía bỏ sót. Hôm nay lens này vẫn chạy một tác tử opus ~3,5 M để tự trả rỗng.
// «Tệp đo» cũng do bên VIẾT quyết và truyền sang — định nghĩa sống ở MỘT chỗ
// (`s4-args.mjs`, khối NGOAI-VAT), gồm cả `_acceptance/config.yaml` nơi mọi `cmd` của
// eval thật sự sống. Bên đọc chỉ hỏi «danh sách có rỗng không».
const fileDoTrongDiff = Array.isArray(args.fileDoTrongDiff) ? args.fileDoTrongDiff : null
// Không chắc → SPAWN: fail-open về phía tốn tiền, không về phía bỏ sót. Bên viết đời cũ
// không truyền trường này → `null` → spawn như trước (đường đọc-cũ).
const chamFileDo = fileDoTrongDiff === null ? true : fileDoTrongDiff.length > 0
// Tiền tố phạm vi: finder được TẬP TRUNG vào vùng vật, nhưng KHÔNG bị cấm báo lỗi ở
// file khác — lớp «diff đổi chữ ký, caller ở file không đổi vỡ» phải còn đường ra.
const vungVatScope = coVungVat && vungVat.length
  ? `Tap trung cac file sau (vung vat — vat duoc giao cua vong nay): ${vungVat.join(', ')}. Doc file khac de hieu ngu canh thi duoc; DUOC bao finding o file KHAC neu no vo VI thay doi trong vung vat. `
  : ''

// T5/K8 mở rộng: lượt ≥2 có deltaFiles → `bugs` và `measurement` cũng TẬP TRUNG vào
// tệp đã đổi (lane thứ ba đã làm từ K8). CHỈ tiền tố prompt — KHÔNG lọc đầu ra theo
// deltaFiles: lớp liên-file phải còn đường ra, cùng lý do với bộ lọc loại-trừ ở T2.
const deltaScope = Array.isArray(args.deltaFiles) && args.deltaFiles.length
  ? `Tap trung cac tep DA DOI so round truoc (tep khong doi thi khong soi lai — finding tren chung da co so trong run-log): ${args.deltaFiles.join(', ')}. `
  : ''

// K8: tiền tố phạm vi cho làn conventions — TÍNH TRƯỚC, không nhúng template lồng, để phần
// thân cũ của prompt giữ NGUYÊN VĂN (răng MM6 của hồ sơ matrix-measure-law đọc quan hệ đó).
// Lọc theo FILE ĐÃ ĐỔI so round trước — MỌI đuôi, không riêng .md. Bản đầu chỉ giữ .md
// nên vòng sửa chỉ chạm code làm làn này nhận lệnh «bỏ qua, trả rỗng»: code viết ở round
// fix (phần rủi ro nhất của vòng) không còn làn nào chấm theo quy ước (finding S4-r2/r3).
// Lý do gốc của K8 là bỏ file KHÔNG ĐỔI, không phải bỏ file code.
const conventionScope = Array.isArray(args.deltaFiles) && args.deltaFiles.length
  ? `CHI cham cac file DA DOI so round truoc (file khong doi thi KHONG cham lai — gop y lap lai moi round la nhieu): ${args.deltaFiles.join(', ')}. `
  : ''

const REVIEWERS = [
  args.reviewSkillPath
    ? { key: 'invariants', prompt: `${vungVatScope}Trong repo ${args.repoRoot}: doc ${args.reviewSkillPath} va lam DUNG quy trinh cua skill do tren diff ${args.diffBase}...HEAD. Tra ve danh sach violation lam findings (title=ten check/rule, detail=vi pham gi o dau). Khong tu fix.` }
    // K8: round ≥2 co deltaFiles (s4-args tinh tu --carry-anchor) → lan nay chi cham FILE CHU
    // da doi so round truoc. Do tren kho nay: 13/34 finding cua mot vong la gop y ve chu lap
    // lai o moi round vi lan doc lai TRON diff moi lan.
    : { key: 'conventions', prompt: `${vungVatScope}${conventionScope}Review diff ${args.diffBase}...HEAD trong repo ${args.repoRoot} theo conventions cua repo (doc CLAUDE.md / CONTRIBUTING.md neu co): vi pham invariant kien truc, sai pattern co san, thieu validation o system boundary. CHI bao finding high-confidence. Khong tu fix.` },
  { key: 'bugs', prompt: `${vungVatScope}${deltaScope}Review diff ${args.diffBase}...HEAD trong repo ${args.repoRoot}, tim correctness bugs va silent failures (catch nuot loi, fallback an, error bi nuot). CHI bao finding high-confidence — khong style nit, khong suy dien.` },
  // matrix-measure-law: lens do-luong — san loi trong chinh cac PHEP DO cua diff
  { key: 'measurement', prompt: `${vungVatScope}${deltaScope}Review CAC FILE KIEM THU/EVAL trong diff ${args.diffBase}...HEAD cua repo ${args.repoRoot} (cac file test/spec, tests/**, evals.yaml, fixtures — bo qua file khong phai phep do; diff khong cham phep do nao thi tra findings rong). San DUNG 6 hinh dang loi do-luong sau, CHI bao finding high-confidence (thay RO trong code, khong suy dien y dinh), khong style-nit, khong tu fix, khong phan xu pham-vi (viec cua triage):\n${MEASUREMENT_SHAPES.map((s, i) => `${i + 1}. ${s}`).join('\n')}\nMoi finding: title goi TEN hinh dang bi pham + detail chi dong/assert cu the va vi sao no la hinh dang do.` },
]

// T2: lane nào THẬT SỰ chạy lượt này. Vùng vật rỗng → `bugs`/`conventions`/`invariants`
// không có vật để soi: không spawn (0 token) thay vì spawn để tự trả rỗng.
const REVIEWERS_ACTIVE = REVIEWERS.filter(d => d.key === 'measurement' ? chamFileDo : (!coVungVat || vungVat.length > 0))
if (coVungVat && vungVat.length === 0) log('Vung vat rong — khong spawn finder bugs/conventions (0 token)')
if (coVungVat && !chamFileDo) log('Diff khong cham file do — khong spawn lens measurement (0 token)')

if (args.dryRun) {
  return {
    dryRun: true,
    distinctCommands: distinctCmds,
    commandGroups: { songSong: cmdSongSong, tuanTu: cmdTuanTu, ...(cmdChayRieng.length ? { chayRieng: cmdChayRieng } : {}) },
    evalsPerCommand: Object.fromEntries([...byCmd.entries()]),
    judgePanels: freshJudgmentEvals.map(e => ({ eval: e.id, judges: LENSES.length })),
    uiCheckEvals: uiEvals.map(e => e.id),
    finders: REVIEWERS_ACTIVE.map(d => d.key),
    vungVat: coVungVat ? vungVat : null,
    ungroundedJudgments: [...ungroundedIds],
    runsPerCommand: Object.fromEntries([...cmdRuns.entries()]),
    carriedEvals: carriedEvals.map(c => c.id),
    carriedPanels: carriedPanels.map(p => p.evalId),
    runBaseline,
    ...(evalsNotRun.length ? { evalsNotRun } : {}),
  }
}

// khong co gi de verify → khong duoc PASS rong. Carried KHÔNG tính là fresh: round toàn
// carry-forward mà suite rỗng = không có gì xác nhận CÂY CODE MỚI → BLOCKED, không PASS chay.
if (!distinctCmds.length && !freshJudgmentEvals.length && !uiEvals.length) {
  const reason = (carriedEvals.length || carriedPanels.length)
    ? 'toan bo eval/panel deu carry-forward va suite rong — khong co gi FRESH verify cay code moi cua round nay; them feature_loop.suite_keys hoac thu hep paths cua eval'
    : ungroundedIds.size
      // Nói ĐÚNG sự thật: judgment CÓ tồn tại, chỉ là không khai inputs nên máy
      // không chấm được, và không còn eval máy/suite nào xác nhận cây code mới.
      // Thông điệp cũ ("khong co judgment") sai sự thật và chỉ người sửa nhầm chỗ.
      ? `${ungroundedIds.size} judgment eval (${[...ungroundedIds].join(', ')}) khong khai inputs nen may khong cham duoc, va khong co eval may/suite nao xac nhan cay code moi — khai inputs cho cac eval do, hoac them feature_loop.suite_keys`
      : 'evals.yaml khong co eval may va khong co judgment — khong co gi de verify, kiem tra lai evals.yaml'
  return blockedEarly('(none)', reason)
}

// ---- Machine + UI-check + Judge + Review chạy đồng thời (không phụ thuộc nhau; Judge là blind) ----
// ── T7 (khoi-tim-loi-tra-phi-theo-vat): baseline RỜI ĐƯỜNG GĂNG ─────────────
// Baseline là tín hiệu PHỤ, nhưng nằm cùng barrier thì Triage và cả chuỗi sau nó phải
// chờ. Đo 14/09 bằng `wf-usage --md` (cột wall, đơn vị GIÂY — kit không đo phút):
// lượt wf_3e8f4e9b-29d có baseline wall 819s kết ở 22:12:29 và triage khởi động đúng
// 22:12:29; một lượt khác baseline giữ đồng hồ ~7700s trong khi mọi lane còn lại kết ở
// ~2000s. Nay là promise riêng, `await` ở điểm MUỘN NHẤT cần — bỏ CỘNG DỒN, không bỏ
// chờ: harness không có trần thời gian cho agent(), nên ca treo là giới-hạn-đã-khai.
  // A/B baseline (đối chứng): chạy lại lệnh-CÓ-eval trên diffBase trong worktree CÔ LẬP — KHÔNG đụng
  // cwd chính (verifier HEAD đang chạy song song ở đó). Tín hiệu PHỤ: thiếu env → cannotRun, không sao.
const baselineP = Promise.resolve().then(() => baselineCmds.length === 0
    ? { results: [] }
    : agentT(
        `Ban tinh BASELINE doi chung tren commit goc "${args.diffBase}" cho ${baselineCmds.length} lenh may, de biet lenh nao xanh-ca-hai-phia (pass ca truoc lan sau = khong test gi moi cua feature).
Kit DA SINH SAN toan bo viec: worktree CO LAP tren commit goc (KHONG dung cwd chinh — verifier HEAD dang chay song song o do), noi node_modules/.env, chay tung lenh co TRAN ${BL_TRAN_LENH_GIAY} giay/lenh va TRAN TONG ${BL_TRAN_TONG_GIAY} giay, bo qua lenh tro toi tep chua co o commit goc, don worktree ke ca khi bi dung. Viec cua ban DUY NHAT: MOT lan goi Bash (timeout 600000) voi lenh giua hai dong dau duoi day, chep NGUYEN VAN tung byte (KHONG tach, KHONG viet lai thanh vong lap, KHONG chay tung lenh rieng, KHONG chay lai). Hai dong dau KHONG thuoc lenh.
<<<AGK-BASELINE
${LENH_BASELINE(baselineCmds)}
AGK-BASELINE>>>
Tra ve: dauRa = TOAN BO stdout cua lan goi do NGUYEN VAN (cac dong bat dau bang ${DAU_BL}); results = [] (JS tu doc ma thoat tu dauRa — ban KHONG khai exit). Lenh loi/khong ra gi → van tra dauRa nguyen van (ke ca rong). KHONG goi them lenh nao khac, KHONG doc nhat ky, KHONG sua gi.\n${TOOL_KILL_RULE}`,
        { label: 'baseline:diffBase', phase: 'Machine', schema: BASELINE_SCHEMA, ...vaiOpt('baseline') }
      )
).catch(() => null)   // BẮT BUỘC: parallel nuốt throw, promise trần thì KHÔNG — một lần reject giết cả lượt

// AC-9: MỘT lời gọi agent cho MỘT lần chạy của một lệnh máy — hai nhánh (song song cho lệnh
// eval, tuần tự cho lệnh suite) dùng CHUNG hàm này để prompt không bị chép thành hai bản.
// MỘT đuôi chung cho hai nhánh prompt máy: luật TOOL-KILL nội suy đúng MỘT chỗ cho lane máy (W25 ánh xạ
// chỗ nội suy → lane), và nhánh lệnh thường giữ NGUYÊN VĂN từng byte (AC-7).
const DUOI_LENH_MAY = `KHONG sua code. KHONG dung git checkout/switch/stash/reset — repo dang o dung branch can verify, doi branch la pha hong cac verifier khac dang chay song song. KHONG chay lai nhieu lan de "cho pass". Neu lenh khong the chay (thieu env, service/DB local chua chay, script khong ton tai...) → cannotRun=true + reason cu the.\n\n${TOOL_KILL_RULE}`
// lenh-dai-chay-rieng AC-2: lệnh có `longRunning` nhận prompt hai bước (BOC_NEN + CHO_NEN); lệnh
// không khai giữ prompt cũ NGUYÊN VĂN (AC-7 so từng byte với v2.24.0).
const promptLenhDai = (lenhGhim, cmd, __i, phut) => {
  const goc = `r${args.round}-l${distinctCmds.indexOf(cmd) + 1}-${__i + 1}`
  const ten = `${goc}-${NHAN_LUOT}`
  return `Ban la verifier doc lap, KHONG phai nguoi viet code nay (doer ≠ grader). Lenh can kiem khai chay toi ${phut} phut — DAI hon tran 600 giay cua cong cu chay lenh, nen KHONG chay no o dang thuong. Lam DUNG hai buoc, chep NGUYEN VAN tung lenh (cho dung da GHIM trong lenh — khong tach ve cd ra, khong sua ve || exit 97, khong tin cwd hien tai cua ban).\n\nBUOC 1 — KHOI CHAY: goi Bash voi run_in_background=true (cong cu khong co tham so do thi goi thuong — no tu day lenh sang nen o 600 giay, ket qua khong doi). Lenh tu ghi TOAN BO dau ra vao nhat ky ${NEN_DIR}/${ten}.log va ket bang dong \`${EXIT_MARK}<n>\`:\n\n${BOC_NEN(lenhGhim, ten)}\n\nKHONG doc tep dau ra nen cua cong cu (no TRONG toi khi lenh xong — do KHONG phai dau hieu lenh chet); chi doc nhat ky qua lenh cho o buoc 2.\n\nBUOC 2 — CHO: goi Bash (timeout 600000) lenh sau; LAP LAI DUNG lenh do moi khi dong cuoi la ${DAU_CHUA_XONG}:\n\n${CHO_NEN(ten, phut)}\n\nDoc ket qua cua lan cho CUOI:\n- dong cuoi la \`${EXIT_MARK}<n>\` → lenh da xong: outputTail = NGUYEN VAN dau ra lan cho do (PHAI giu dong \`${EXIT_MARK}<n>\`), exitCode = <n>, cannotRun=false.\n- dong cuoi la ${DAU_QUA_HAN} → lenh vuot ${phut} phut da khai, lenh cho DA dung tien trinh: cannotRun=true, killedByTool=false, reason "vuot thoi luong khai ${phut} phut — chua co dong ${EXIT_MARK}", outputTail = NGUYEN VAN dau ra lan cho do. KHONG doan PASS/FAIL tu dau ra do dang.\nrun_id neu nhat ky co in (khong co thi de chuoi rong).\n${DUOI_LENH_MAY}`
}
const agentCuaLenh = (cmd, __i) => {
  // Chỗ đứng ghim MỘT lần cho cả hai nhánh (RS5 đếm lời gọi CD_GUARD theo lane).
  const lenhGhim = `${CD_GUARD(`"${args.repoRoot}"`)} && ${cmd}`
  const phut = cmdPhut.get(cmd) || 0
  return agentT(
    phut > 0 ? promptLenhDai(lenhGhim, cmd, __i, phut) :
    `Ban la verifier doc lap, KHONG phai nguoi viet code nay (doer ≠ grader). Chay dung lenh sau NGUYEN VAN — cho dung da GHIM trong chinh lenh (khong tach ve cd ra, khong sua ve || exit 97, khong tin cwd hien tai cua ban):\n\n${BOC_LENH(lenhGhim)}\n\nCapture TRUNG THUC: outputTail = NGUYEN VAN phan duoi tool result, PHAI giu dong cuoi \`${EXIT_MARK}<n>\`; exitCode = so <n> cua dong do (khong suy tu chu); run_id neu stdout co in (khong co thi de chuoi rong).\n${DUOI_LENH_MAY}`,
    { label: `machine:${cmd.slice(0, 40)}${(cmdRuns.get(cmd) || 1) > 1 ? '#' + (__i + 1) : ''}`, phase: 'Machine', schema: MACHINE_SCHEMA, ...vaiOpt('machine') }
  ).then(r => r && { ...r, cmd, runIndex: __i + 1 })
}

// cham-khong-tu-dot-luot AC-9: ảnh ui lưu DƯỚI hồ sơ bằng đường tuyệt đối — đường tương đối
// `evidence/…` rơi vào cwd của tác tử (không phải hồ sơ). Báo cáo mang lại đường tương đối.
const EVD = `${args.repoRoot}/_acceptance/${args.slug}/evidence`

const [machineRaw, uiRaw, judgeRaw, reviewRaw] = await parallel([
  // AC-9: nhánh song song (lệnh eval) và nhánh tuần tự (lệnh suite) chạy ĐỒNG THỜI với nhau;
  // trong nhánh tuần tự mỗi lệnh (và mỗi lần lặp) chờ lệnh trước xong. Một agent ném lỗi ở
  // nhánh tuần tự → null như parallel làm — không giết các lệnh suite còn lại.
  () => Promise.all([
    parallel(cmdSongSong.flatMap(cmd => Array.from({ length: cmdRuns.get(cmd) || 1 }, (_, __i) => () => agentCuaLenh(cmd, __i)))),
    (async () => {
      const out = []
      for (const cmd of cmdTuanTu) for (let n = 0; n < (cmdRuns.get(cmd) || 1); n++) out.push(await Promise.resolve().then(() => agentCuaLenh(cmd, n)).catch(() => null))
      return out
    })(),
  ]).then(async ([ss, tt]) => {
    // lenh-dai-chay-rieng AC-6: nhóm chạy-riêng chỉ bắt đầu khi CẢ HAI nhánh trên đã xong, và tuần tự
    // với nhau — không chồng suite, không chồng eval khác. Cùng agentCuaLenh nên lệnh vừa chạy-riêng
    // vừa dài (ca crm E6/E7) vẫn nhận khung nền.
    const rr = []
    for (const cmd of cmdChayRieng) for (let n = 0; n < (cmdRuns.get(cmd) || 1); n++) rr.push(await Promise.resolve().then(() => agentCuaLenh(cmd, n)).catch(() => null))
    return [...ss, ...tt, ...rr]
  }),

  // ui-check (v1.1): 1 agent/eval — chạy steps trên dev server, assertion máy-kiểm + evidence file
  () => parallel(uiEvals.map(e => () =>
    agentT(
      `Ban la verifier UI doc lap, KHONG phai nguoi viet code nay (doer ≠ grader). Repo: ${args.repoRoot} — MOI lenh shell ban chay trong steps phai o dang \`${CD_GUARD(`"${args.repoRoot}"`)} && <lenh>\`: cho dung dat trong CHINH lenh (giu nguyen ve || exit 97), khong tin cwd hien tai (thu muc trung ten o noi khac la moi nhu).\n` +
      `Eval ${e.id} (criterion ${e.criterion}) — lam DUNG cac steps sau, theo thu tu:\n` +
      `${(e.steps || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n` +
      `Expected: ${e.expected}\n\n` +
      `Quy tac:\n` +
      `- Tu quan dev server: start NEN (background) neu steps yeu cau, doi ready (poll HTTP toi 90s); TAT server truoc khi tra ket qua (chi tat server minh start — port dang co server san thi dung chung va KHONG tat).\n` +
      `- Assertion phai MAY-KIEM-DUOC: HTTP status + marker trong HTML/DOM (trang SSR thi curl + grep du). Ghi tung assertion + ket qua vao outputTail.\n` +
      `- Evidence file: mkdir -p thu muc truoc. LUU FRAME RA FILE: neu config.yaml co "capture.ui" (lenh <cmd> <url> <out.png>, vd npm run ui:capture) thi DUNG no de luu moi frame — preview_screenshot tra anh INLINE, khong luu file duoc. NHIEU FRAME: luu 1 anh o MOI buoc co screenshot trong steps → ${EVD}/${e.id}-step1.png, ${EVD}/${e.id}-step2.png... (de trang bang chung phat slideshow nhu flow). Tra frame DAU vao screenshotPath — Khai screenshotPath bang duong TUYET DOI da luu; liet ke moi frame da luu vao outputTail. KHONG co capture.ui/tool chup → luu HTML da assert (duoi .html) vao screenshotPath va GHI RO fallback trong outputTail.\n` +
      `- observed (BAT BUOC khi co frame): MO TUNG file frame vua luu bang Read (anh doc truc tiep; .html doc noi dung file) roi VIET field observed = thay gi CU THE trong tung frame, doi chieu Expected. KHONG viet observed tu tri nho lenh/steps — phai doc file that. Neu noi dung frame MAU THUAN Expected → assertion do FAIL: exitCode phai khac 0 du lenh exit 0.\n` +
      `- NETWORK TRUTH (mo rong rail observed tu pixels sang wire): NEU driver la browser tool co duong doc network (read_network_requests / read_console_messages hoac tuong duong) — SAU khi chay xong steps: doc failed requests + console errors, dump tho vao ${EVD}/${e.id}-network.txt (mkdir -p truoc). Luat scoping: FAIL-eligible = fetch/XHR toi origin cua config dev_server.url HOAC prefix trong dev_server.api_base (co the la LIST); third-party (analytics/CDN/tracker) KHONG BAO GIO fail; static asset (.map/favicon/anh/font) ke ca app-origin → chi note. Trong tap FAIL-eligible: connection-error/timeout/status tu 500 tro len → eval FAIL: exitCode phai khac 0 KE CA khi frame dep; loi 4xx → FAIL TRU KHI expected cua eval khai dung status do. Dien field networkObserved bang VOCAB CHU (cam so status/exit): "clean" = CO thay traffic app-scope va tat ca OK — khong thay request app nao thi PHAI ghi "no-app-traffic" (cam ghi clean khi khong co traffic); "third-party-only" = chi third-party fail; "app-fail" = co request FAIL-eligible fail; "unscoped" = config chua khai dev_server.url/api_base; "unscoped-partial" = thay XHR toi origin la ngoai scope da khai (note-only); driver khong doc duoc network (curl+grep, capture-only) → "n-a (driver)"; tool doc network tu loi → "n-a (tool-error: <ly do ngan>)" kem chi tiet trong outputTail. Cac gia tri n-a/unscoped/no-app-traffic KHONG lam eval fail.\n` +
      `- exitCode=0 CHI khi MOI assertion pass. KHONG sua code. Khong the chay (port ban khong xu ly duoc, thieu env...) → cannotRun=true + reason cu the.\n` +
      `- ${TOOL_KILL_RULE}`,
      { label: `ui:${e.id}`, phase: 'Machine', schema: UI_SCHEMA, ...vaiOpt('ui') }
    ).then(r => r && { ...r, cmd: `ui-check:${e.id}`, evals: [e.id] })
  )),

  () => parallel(freshJudgmentEvals.flatMap(e =>
    LENSES.map(lens => () =>
      agentT(
        `Ban la judge DOC LAP, context sach, lens duy nhat: ${lens}. BLIND: KHONG doc diff, KHONG doc reasoning cua nguoi code.\nDoc persona tai ${args.personasPath}, ap persona hop lens.\nCHI duoc doc dung cac file liet ke o dong "Input:" duoi day, cong file persona o tren. Danh sach do la DAY DU: file nao KHONG co ten trong do deu ngoai pham vi, ke ca khi no co ve lien quan hay co ten nghe quan trong. Luat nay theo QUAN HE (co-trong-danh-sach hay khong), KHONG theo loai file — cung mot ten file co the la input hop le cua eval nay va ngoai pham vi cua eval khac.\nInput: ${(e.inputs || []).join(' , ')}\n\nThay danh sach tren KHONG du can cu de phan → do la ly do tra UNCERTAIN, TUYET DOI KHONG phai ly do di tim file khac de tu cuu. Tu chon them mot artifact roi phan tu no la pha hong tinh doc lap cua hoi dong: ban se dang cham bang mot tieu chi khong ai duyet.\n\nCau hoi phan xet (${e.id} / ${e.criterion}): ${e.question}\n\nTra verdict PASS | FAIL | UNCERTAIN + rationale 1-3 cau. UNCERTAIN khi khong du can cu — dung doan.\nVerdict khac PASS thi BAT BUOC dien required_evidence: >=1 muc, MOI muc la MOT bang chung cu the + CHO LAY no (file/lenh/anh nao), du de "neu co muc nay thi verdict doi" — khong loi khuyen chung chung, khong doi bang chung vo han de ne phan. PASS thi bo qua field nay.`,
        { label: `judge:${e.id}:${lens}`, phase: 'Judge', schema: VERDICT_SCHEMA, ...vaiOpt('judge') }
      ).then(v => v && { evalId: e.id, lens, ...v })
    )
  )),

  // T1 (khoi-tim-loi-tra-phi-theo-vat): lane review nay CHI TIM. Bước bác bỏ đã dời
  // xuống SAU phase Triage — xem khối `phase('Refute')`. Vì sao: đo 20 lượt chấm
  // 10–14/09, refute ăn 44 % token S4 (0,89 M/tác tử × ~13 tác tử) trong khi bước
  // triage phân loại cùng danh sách hết 0,19 M cho MỘT tác tử; 3/4 sản phẩm của
  // refute bị chính triage xếp ra ngoài hợp đồng. Trạm lọc phạm vi đứng SAU trạm
  // đắt nhất là gốc của rò — luật ở tầng phán quyết vẫn đúng, thứ tự thi hành sai.
  // Barrier ở đây chỉ chờ BA finder (không chờ machine/ui/judge/baseline): cần cả ba
  // để dedupe liên-lane TRƯỚC bước đắt — hai lane cùng báo một lỗi là chuyện thường.
  () => parallel(REVIEWERS_ACTIVE.map(d => () =>
    agentT(d.prompt, { label: `review:${d.key}`, phase: 'Review', schema: FINDINGS_SCHEMA, ...vaiOpt('finder') })
      .then(res => res
        ? { key: d.key, dead: false, findings: (Array.isArray(res.findings) ? res.findings : []).map(f => ({ ...f, source: d.key })) }
        : { key: d.key, dead: true, findings: [] }) // finder chet → KHONG phai "0 findings"
  )),

])

// Đọc dấu (cham-khong-tu-dot-luot AC-2, design §2 bảng tám hàng). Chỉ lane machine.
// Dấu có mặt = lệnh ĐÃ chạy xong → mã dấu thắng lời khai, TRỪ ca tác tử khai hạ tầng khác
// (thiếu env…) mà dấu ≠ 0: giữ hạ tầng — «thiếu env thoát 1» không được thành REJECT đốt round.
// Không dấu: khai ≠ 0 giữ (97/127 đi tiếp normInfra); khai 0 không có căn cứ → không PASS.
// Lấy LẦN KHỚP CUỐI: lệnh con tự in một dấu giả giữa đầu ra không thắng dấu thật của khung bọc.
const rutDau = tail => { const all = [...String(tail || '').matchAll(new RegExp(`^${EXIT_MARK}(\\d+)\\s*$`, 'gm'))]; return all.length ? Number(all[all.length - 1][1]) : null }
const normDau = r => {
  if (!r) return r
  // lenh-dai-chay-rieng (S4-r2 finding t4): đuôi lệnh chờ kết bằng dấu chưa-xong / quá-hạn là VẬT máy
  // đọc — lệnh chưa có mã thoát, bất kể tác tử khai gì. Thiếu vế này thì «khai exit 0 sau một lần chờ»
  // ra PASS khi lệnh còn chạy: đúng lớp fail-open kit chặn.
  const cuoi = String(r.outputTail || '').trim().split('\n').pop().trim()
  if (cuoi === DAU_CHUA_XONG || cuoi === DAU_QUA_HAN) {
    const { killedByTool, ...rest } = r
    return { ...rest, cannotRun: true, exitCode: 1, reason: cuoi === DAU_QUA_HAN
      ? `vuot thoi luong khai (long_running) — lenh cho tra ${DAU_QUA_HAN}, chua co dong ${EXIT_MARK}`
      : `lenh dai CHUA XONG — tac tu dung cho o ${DAU_CHUA_XONG}, chua co dong ${EXIT_MARK}` }
  }
  const dau = rutDau(r.outputTail)
  if (dau != null) {
    if (r.cannotRun === true && r.killedByTool !== true && dau !== 0) return r
    const { killedByTool, ...rest } = r
    return { ...rest, cannotRun: false, exitCode: dau, reason: r.cannotRun ? '' : r.reason }
  }
  // Không dấu → giữ lời khai như trước vòng. Vế «không dấu mà khai 0 → không PASS» đã GỠ theo
  // ngưỡng chết khai ở Cổng Đáng: lượt chấm 1 của chính vòng (27/09) có 3/11 tác tử chạy lệnh
  // trần, không qua khung bọc — khung vẫn là lời trong prompt, nên thiếu dấu không chứng được
  // lệnh hỏng; chặn ở đây chỉ tăng BLOCKED hạ tầng (sổ S4-r1).
  return r
}

// killedByTool ⇒ cannotRun: không tin một lời khai đơn lẻ — đúng ca sự cố
// (agent khai cannotRun=false + exitCode=1 khi lệnh bị giết). reason agent giữ
// NGUYÊN VĂN nếu có; trống → điền khuôn ghim để card BLOCKED không rỗng.
// Vì reason là chữ tự do, tín hiệu máy-đọc là CỜ killedByTool: nó đi tới sổ chạy
// thành `killed_by_tool` (dưới) và lib/nhan-canh-gay.cjs phân nhãn trên cờ ấy —
// thiếu cờ trên sổ là lượt suite bị cắt ra nhãn null, khoá, đốt round (crm 26/09).
// Áp cho CẢ BA lane trước mọi merge; baseline → cannotRun → baselineStatus n-a.
const TOOL_KILL_REASON = 'bi cong cu giet (timeout tool/output cat) — exit code khong phai cua lenh'
const normKill = r => (r && r.killedByTool === true)
  ? { ...r, cannotRun: true, reason: (typeof r.reason === 'string' && r.reason.trim()) ? r.reason : TOOL_KILL_REASON }
  : r

// AC-12 (cham-dung-cay-dung-cho-dung): hạ tầng hỏng phải TỰ XƯNG. Hai dấu hiệu
// máy-nhận-diện-được — bước `cd` của lệnh wrap thất bại (chỗ đứng không tồn tại:
// worktree bị dọn, repoRoot sai) và exit 127 (không tìm thấy lệnh/script) — là
// ERROR của hạ tầng chấm, KHÔNG phải FAILURE của sản phẩm (nếp JUnit error≠failure).
// Đẩy sang cannotRun → nhánh BLOCKED-toward-human, khỏi đốt round bằng REJECT giả.
// exit 1 thường KHÔNG bị đụng: phân loại không được nuốt lỗi thật. Các hình dạng
// hạ tầng KHÁC hai dấu hiệu này là giới-hạn-đã-khai của contract (đi FAIL như cũ).
const normInfra = r => {
  if (!r || r.cannotRun || r.exitCode === 0) return r
  const why = INFRA_EXITS[r.exitCode]
  return why ? { ...r, cannotRun: true, reason: `exit ${r.exitCode} — ${why}` } : r
}

// ---- variance-N: gộp các lần chạy của 1 lệnh → 1 entry/lệnh với pass-rate ----
const runsByCmd = new Map()
for (const r of (machineRaw || []).filter(Boolean).map(normDau).map(normKill).map(normInfra)) {
  if (!runsByCmd.has(r.cmd)) runsByCmd.set(r.cmd, [])
  runsByCmd.get(r.cmd).push(r)
}
const machine = []
for (const cmd of distinctCmds) {
  const N = cmdRuns.get(cmd) || 1
  const rs = runsByCmd.get(cmd) || []
  if (!rs.length) continue // không kết quả nào (mọi agent chết) → blocked-detection bên dưới bắt (cmd vắng trong ran set)
  const ran = rs.filter(r => !r.cannotRun)
  const cannotRunCount = rs.length - ran.length
  const missing = Math.max(0, N - rs.length) // agent chết/null (bị filter(Boolean) loại trước khi gộp)
  // Mẫu KHÔNG đủ N lần chạy sạch (có cannotRun hoặc agent chết) → không đủ căn cứ → BLOCKED.
  // KHÔNG được tính pass-rate/variance trên mẫu thiếu: 1/5 lần chạy được mà PASS = giả mạo (đúng triết lý kit: verify được hay BLOCKED, không fake).
  if (cannotRunCount > 0 || missing > 0) {
    const firstCannot = rs.find(r => r.cannotRun)
    machine.push({ cmd, evals: byCmd.get(cmd), runs: N, passes: ran.filter(r => r.exitCode === expCmd(cmd)).length, variance: false, cannotRun: true, killedByTool: !!(firstCannot && firstCannot.killedByTool === true), reason: (firstCannot && firstCannot.reason) || `chi ${ran.length}/${N} lan chay duoc (${cannotRunCount} cannotRun, ${missing} agent chet) — khong du can cu de PASS`, exitCode: 1, runId: (ran[0] || rs[0]).runId || '', outputTail: (rs[0] || {}).outputTail || '' })
    continue
  }
  // đủ N lần chạy sạch → tính pass-rate / variance
  const passes = ran.filter(r => r.exitCode === expCmd(cmd)).length
  const variance = ran.length > 1 && passes > 0 && passes < ran.length
  const rep = ran.find(r => r.exitCode !== expCmd(cmd)) || ran[0] // ưu tiên lần fail làm đại diện chẩn đoán
  // Mã thoát là SỐ — 0 là mã hợp lệ (verifier trả 0 khi eval khai exit khác 0
  // vẫn phải giữ nguyên 0 để "gioi han da khai khong con" bắt được). Phép
  // hoặc-mặc-định (`rep.exitCode || 1`) biến 0 thành 1 vì 0 là falsy trong JS —
  // đúng lớp lỗi lib/evidence-core.cjs đã tự vá ở nơi khác. Kiểm số nguyên rồi
  // mới dùng, đừng suy diễn qua truthy/falsy.
  const exitCode = (passes === ran.length || variance) ? expCmd(cmd) : (Number.isInteger(rep.exitCode) ? rep.exitCode : 1)
  machine.push({ cmd, evals: byCmd.get(cmd), runs: ran.length, passes, variance, cannotRun: false, reason: rep.reason, exitCode, runId: rep.runId, outputTail: rep.outputTail })
}
// ui-check hợp nhất vào machine-style (luôn 1 lần): cmd ui-check:<evalId> — routing blocked/failed dùng chung
// AC-9: ảnh nằm dưới hồ sơ → báo cáo mang đường TƯƠNG ĐỐI hồ sơ (`evidence/…`); ngoài hồ sơ giữ nguyên.
const EVD_PREFIX = `${args.repoRoot}/_acceptance/${args.slug}/`
const neoAnh = r => (r && typeof r.screenshotPath === 'string' && r.screenshotPath.startsWith(EVD_PREFIX + 'evidence/'))
  ? { ...r, screenshotPath: r.screenshotPath.slice(EVD_PREFIX.length) } : r
machine.push(...(uiRaw || []).filter(Boolean).map(neoAnh).map(normKill).map(normInfra).map(r => ({ ...r, runs: 1, passes: !r.cannotRun && r.exitCode === 0 ? 1 : 0, variance: false })))

// ---- run-log: run_id per eval do JS THUẦN quyết (verifier có runId thật → dùng; rỗng → mint
// deterministic) + build NGUYÊN VĂN từng dòng JSONL. Synthesize CHỈ chép map này — hết quyền
// tự mint. recheck-evidence/hook đối chiếu run_id trong report với log: PASS bịa tay
// (không qua verify) bị chặn. ts từ args.invokedAt (skill đo bằng `date -u` — script bị cấm Date).
const invokedAt = typeof args.invokedAt === 'string' ? args.invokedAt : ''
// AC-6 delta-verify-repin: sha của HEAD lúc invoke (main loop truyền `git rev-parse HEAD`)
// — chảy vào TỪNG dòng run-log làm anchor cho carry round fix; vắng args → không field.
const invokedSha = typeof args.invokedSha === 'string' && args.invokedSha ? args.invokedSha : ''
const evalRunIds = {}
const suiteRunIds = Object.create(null)
const runLogLines = []
/** Lệnh suite KHÔNG gắn eval nào (`byCmd.set(cmd, [])`), nên vòng dưới — vốn lặp theo
 *  `m.evals` — không chạy lần nào cho chúng và KHÔNG sinh dòng run-log. Nhưng bản chấm
 *  VẪN khai chúng ở mục «Lệnh suite regression-guard», và vì `evalRunIds` không có mục
 *  nào cho suite nên agent tổng hợp phải TỰ ĐẶT run_id — đúng thứ câu dặn ở prompt cấm.
 *  `recheck-evidence.cjs` đòi MỌI run_id trong bản chấm phải có mặt trong run-log ⇒ mọi
 *  vòng có mục suite đều đỏ L2 PROVENANCE, và chỉ lộ ra SAU khi Cổng 2 ký (chốt
 *  human_signoff `continue` trước khối recheck). Đo thật: media-library vòng 11.
 *  Tên suy từ CHÍNH lệnh nên id ổn định qua các vòng, không phụ thuộc thứ tự mảng
 *  `suiteCommands` — đổi thứ tự khai mà id đổi theo thì carry/đối chiếu vòng sau lệch. */
const tenSuite = (cmd) => {
  const sach = String(cmd).replace(/^cd\s+\S+\s*&&\s*/, '').replace(/^.*;\s*/, '')
  const hit = sach.match(/pnpm\s+run\s+[\w:.-]+|pnpm\s+[\w:.-]+|npm\s+run\s+[\w:.-]+|yarn\s+[\w:.-]+/g) || []
  const ten = hit.map(x => x.replace(/^(pnpm|npm|yarn)\s+(run\s+)?/, '')).join('_')
  return (ten || sach).replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'suite'
}
/** Hai lệnh KHÁC nhau rút về CÙNG một tên là chuyện thường ở kho nhiều gói
 *  (`cd apps/web && pnpm build` và `cd apps/api && pnpm build` đều ra `build`;
 *  `pnpm test:unit --project a|b` đều ra `test_unit`; hai lệnh trần trùng 40 ký
 *  tự đầu cũng thế). Dùng chung một mã thì sổ chạy hết phân biệt được lượt nào
 *  là lượt nào: một lệnh ĐỎ có thể nấp sau một lệnh XANH mà bộ đối chiếu vẫn
 *  xanh — cùng lớp false-green với chính lỗi khối này sinh ra để vá.
 *  Hậu tố băm suy từ CHÍNH chuỗi lệnh (không phải chỉ số mảng) nên đổi thứ tự
 *  khai `suiteCommands` không đổi mã; và chỉ gắn cho lệnh THẬT SỰ trùng tên nên
 *  mã của lệnh không va chạm giữ nguyên hình dạng cũ. */
const bamSuite = (s) => {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 }
  return h.toString(16).padStart(8, '0').slice(0, 6)
}
// Object.create(null), KHÔNG `{}`: với tên là khoá kế thừa (`constructor`,
// `toString`, `valueOf`…) thì object trần đọc ra HÀM chứ không phải undefined,
// nên phép đếm hoá chuỗi và `> 1` false mãi mãi — lưới tắt IM LẶNG đúng lớp nó
// sinh ra để vá. Cùng nếp với `Object.prototype.hasOwnProperty.call` ở khối
// kiểm executor phía trên file này.
const demTenSuite = Object.create(null)
for (const m of machine) {
  if ((m.evals || []).length) continue
  const t = tenSuite(m.cmd)
  demTenSuite[t] = (demTenSuite[t] || 0) + 1
}
const tenDuyNhat = (cmd) => {
  const t = tenSuite(cmd)
  return demTenSuite[t] > 1 ? `${t}__${bamSuite(cmd)}` : t
}
/** Lưới trên chỉ canh nhánh ĐÚC mã. Verifier được prompt dặn khai `run_id` khi
 *  stdout có in, nên nó có thể trả CÙNG một mã cho hai lệnh khác nhau — và
 *  `run_id` mới là trường DUY NHẤT mà `lib/evidence-core.cjs` đọc, `evalId`
 *  không cứu được. Đếm TRƯỚC rồi mới gắn hậu tố cho MỌI thành viên của nhóm
 *  trùng (không phải "ai tới sau thì gắn"): mã khi đó không phụ thuộc thứ tự
 *  khai `suiteCommands`, đúng bất biến AC-2. */
const ridTho = (m) => docRid(m.runId) || `minted-${args.slug}-SUITE-${tenDuyNhat(m.cmd)}-r${args.round}`
const demRidSuite = Object.create(null)
for (const m of machine) {
  if ((m.evals || []).length) continue
  const r0 = ridTho(m)
  demRidSuite[r0] = (demRidSuite[r0] || 0) + 1
}
for (const m of machine) {
  if (!(m.evals || []).length) {
    const ten = tenDuyNhat(m.cmd)
    const r0 = ridTho(m)
    const rid = demRidSuite[r0] > 1 ? `${r0}__${bamSuite(m.cmd)}` : r0
    m.runId = rid
    suiteRunIds[m.cmd] = rid
    runLogLines.push(JSON.stringify({
      ts: invokedAt, ...(invokedSha ? { sha: invokedSha } : {}), round: args.round,
      evalId: `SUITE-${ten}`, run_id: rid,
      exit_code: m.cannotRun ? null : m.exitCode, cmd: m.cmd,
      ...(m.cannotRun ? { cannot_run: true, reason: m.reason || '' } : {}),   // lý do: thẻ + lưới phân nhãn cạnh gãy (lib/nhan-canh-gay.cjs)
      ...(m.cannotRun && m.killedByTool ? { killed_by_tool: true } : {}),   // cờ máy-đọc: nhãn «không đọc được ở đây» (tool-kill-rule.md)
    }))
    continue
  }
  for (const evalId of (m.evals || [])) {
    const rid = docRid(m.runId) || `minted-${args.slug}-${evalId}-r${args.round}`
    evalRunIds[evalId] = rid
    runLogLines.push(JSON.stringify({
      ts: invokedAt, ...(invokedSha ? { sha: invokedSha } : {}), round: args.round, evalId, run_id: rid,
      exit_code: m.cannotRun ? null : m.exitCode, cmd: m.cmd,
      ...(m.runs > 1 ? { runs: m.runs, passes: m.passes } : {}),
      ...(m.cannotRun ? { cannot_run: true, reason: m.reason || '' } : {}),   // lý do: thẻ + lưới phân nhãn cạnh gãy (lib/nhan-canh-gay.cjs)
      ...(m.cannotRun && m.killedByTool ? { killed_by_tool: true } : {}),   // cờ máy-đọc: nhãn «không đọc được ở đây» (tool-kill-rule.md)
    }))
  }
}
// P1: eval carried — ghi dòng cho ROUND NÀY với run_id GỐC (id đã nằm trong log từ round gốc →
// hook/recheck đối chiếu pass tự nhiên); carried_from_round là dấu vết kiểm toán, consumer cũ bỏ qua field lạ.
for (const c of carriedEvals) {
  evalRunIds[c.id] = c.runId
  runLogLines.push(JSON.stringify({
    ts: invokedAt, ...(invokedSha ? { sha: invokedSha } : {}), round: args.round, evalId: c.id, run_id: c.runId,
    exit_code: 0, cmd: evalById.get(c.id).cmd || c.cmd || '',
    carried_from_round: typeof c.fromRound === 'number' ? c.fromRound : null,
  }))
}

const judges = (judgeRaw || []).filter(Boolean).map(normalizeVote)
const reviewResults = (reviewRaw || []).filter(Boolean)
// Chuẩn hoá path ở BIÊN — MỘT lần, ngay chỗ gom findings, trước mọi thứ đọc
// chúng (prompt triage, khoá ghép, dedupe, vùng phủ, review-findings.md, thẻ).
// Reviewer agent được nhắc "trong repo <abs path>" nên lane này trả path tuyệt
// đối và lane kia trả tương đối — cả hai đều hợp lệ theo schema. Mỗi consumer tự
// so chuỗi thô thì mỗi consumer hỏng một kiểu, và hỏng âm thầm. Chuẩn hoá phòng
// thủ là đủ; không dựa vào việc agent nghe lời.
const repoPrefix = String(args.repoRoot || '').replace(/\/+$/, '')
const relPath = v => {
  let p = String(v || '')
  if (repoPrefix && p.startsWith(repoPrefix + '/')) p = p.slice(repoPrefix.length + 1)
  return p.replace(/^\.\//, '').replace(/^\/+/, '')
}
const relFile = f => relPath(f && f.file)
// Khoá PHÂN BIỆT (file đã chuẩn hoá :: title) — MỘT chỗ cho triage, refute và vùng
// phủ. T1 đưa nó lên ĐÂY: dedupe liên-lane phải xảy ra TRƯỚC triage (trước đây nó
// nằm dưới khối vùng phủ, sau cả refute).
const distinctKey = f => `${relFile(f)} :: ${f.title}`
const dedupe = arr => [...new Map(arr.map(f => [distinctKey(f), f])).values()]
// Finding THÔ đã dedupe — CHƯA qua bác bỏ. Refute chạy SAU triage (T1).
// T2: lọc đầu ra theo LOẠI TRỪ, không theo bao gồm. Bỏ finding nằm trên thứ NGOÀI VẬT
// (văn bản hồ sơ vòng, thứ repo khai là không-phải-hành-vi); GIỮ finding ở file sản
// phẩm ngoài diff — đó là lớp liên-file, lọc-theo-bao-gồm sẽ đánh mất nó. Lens
// `measurement` KHÔNG bị lọc: nó soi chính phép đo, đó là tầng một hợp pháp.
const rawAll = dedupe(reviewResults.flatMap(r => r.findings).map(f => ({ ...f, file: relPath(f.file) })))
const boNgoaiVat = coVungVat ? rawAll.filter(f => f.source !== 'measurement' && laNgoaiVat(relFile(f))) : []
const boNgoaiVatSet = new Set(boNgoaiVat)
const rawFindings = rawAll.filter(f => !boNgoaiVatSet.has(f))
if (boNgoaiVat.length) log(`Vung vat: bo ${boNgoaiVat.length} finding ngoai vat (${boNgoaiVat.map(relFile).join(', ')})`)

// ── T5: finding đã CARRY từ lượt trước — không triage, không refute lại ──────
// Mục ngoài hợp đồng ở lượt trước mà tệp của nó không chạm diff-fix thì phân loại cũ
// còn nguyên giá trị; chấm lại là trả tiền hai lần cho cùng một câu trả lời. Minh bạch
// như P1/P3: lượt nào carry gì đều hiện ở `result.carried` và trên bản findings.
const carriedFindings = (Array.isArray(args.carriedFindings) ? args.carriedFindings : [])
  .filter(c => c && typeof c.file === 'string' && typeof c.title === 'string')
const carriedKeys = new Set(carriedFindings.map(c => `${relPath(c.file)} :: ${c.title}`))
const rawFindingsFresh = rawFindings.filter(f => !carriedKeys.has(distinctKey(f)))
if (carriedFindings.length) log(`Carry finding ngoai hop dong: ${carriedFindings.length} muc tu round truoc — khong triage/refute lai`)
const reviewIncomplete = reviewResults.filter(r => r.dead).map(r => r.key)
for (const k of REVIEWERS_ACTIVE.map(r => r.key)) {   // T2: lane cố ý không spawn KHÔNG phải lane chết
  if (!reviewResults.some(r => r.key === k) && !reviewIncomplete.includes(k)) reviewIncomplete.push(k)
}

// ---- Scope-triage: ngăn thứ ba cho finding THẬT nhưng NGOÀI hợp đồng ----
// Reviewer là finder KHÔNG giới hạn phạm vi, gate là thước CÓ giới hạn phạm vi.
// Thiếu ngăn này thì mỗi bản vá trong vùng-không-đặc-tả lại đẻ ra lựa chọn
// không-đặc-tả mới, nên vòng lặp không thể hội tụ (ca OneFlow: 7 round, mọi
// round eval xanh, 12/12 finding rơi ngoài vùng phủ).
phase('Triage')
// T1: phân loại phạm vi TRƯỚC bác bỏ — câu hỏi «có làm một AC thất bại không» độc
// lập với «có phải lỗi thật không», nên không cần refute trước để trả lời.
const toTriage = rawFindingsFresh
toTriage.forEach((f, i) => { f.tid = `t${i + 1}` }) // đúc MỘT lần cho cả trạm (AC-9)
const hasContract = typeof args.contractPath === 'string' && !!args.contractPath.trim()
let triageRaw = null
let triageFailed = false
// Khai ngoài khối để lượt hỏi lại (bên dưới) gọi được; mặc định «không có gì để gọi».
let triageOnce = () => Promise.resolve(null)
if (toTriage.length === 0) {
  triageFailed = false // không có gì để phân loại — không phải thất bại
} else if (!hasContract) {
  triageFailed = true // không có hợp đồng thì không đoán phạm vi
  log('Triage: thieu args.contractPath — moi finding ve unclassified, khong ai REJECT tu findings')
} else {
  const triagePrompt =
    `Ban la nguoi PHAN LOAI PHAM VI, khong phai nguoi tim loi va khong phai nguoi bac bo. Cac finding duoi day CHUA qua bac bo doi khang — dung tranh cai ve tinh dung sai cua chung, buoc bac bo di SAU buoc nay va chi chay cho finding trong hop dong.\n` +
    `Cau hoi duy nhat cho MOI finding: no co lam mot AC (acceptance criterion) trong hop dong that bai khong?\n\n` +
    `Doc hop dong tai ${args.contractPath} (Read). Doc CA section "Out of scope" — muc trong do la bang chung MANH cho inContract=false.\n\n` +
    `Findings: ${JSON.stringify(toTriage.map(f => ({ [TRIAGE_ID_FIELD]: f.tid, title: f.title, file: f.file, line: f.line, severity: f.severity, detail: f.detail })))}\n\n` +
    `Luat phan loai:\n` +
    `- inContract=true CHI khi chi duoc DICH DANH mot AC ma finding nay lam that bai → acRef = id AC do (vd "AC-3"), proposal = "".\n` +
    `- inContract=false khi finding that nhung khong AC nao phu → acRef = "", proposal = ${OOC_GLOSS}.\n` +
    `- KHONG suy dien AC "gan giong". Khong chac chan → inContract=false: sua ngoai hop dong la viec cua NGUOI o Gate 2, khong phai cua may.\n` +
    `- inContract=false: BAT BUOC viet them plain = 1-2 cau NGON NGU SAN PHAM ke hau qua cho NGUOI DUNG (vd "Bam Cap nhat co the lam mat tien ich dang cai"). Day la cot "Nguoi dung gap gi" the Cong 2 in ra cho nguoi quyet doc — title ky thuat KHONG bao gio den duoc mat ho. Cam ten ham, duong dan file, ma thoat, tu ngu regex/schema.\n` +
    CAN_CU_CHI_DAN +
    `- KHONG doc code repo, KHONG de xuat cach sua. Chi phan loai pham vi.\n` +
    `- KHONG doc duoc contract (Read that bai, file khong ton tai, rong) → tra contractUnreadable=true va triaged=[] . TUYET DOI khong doan phan loai tu tri nho: mot ket qua bia doc y het mot ket qua that.\n` +
    `Tra ve contractUnreadable=false va triaged[] dung MOT muc cho MOI finding; ${TRIAGE_ID_FIELD} chep NGUYEN VAN ma da gui (day la KHOA ghep — khong doi, khong danh so lai); title VA file chep NGUYEN VAN (title khong duy nhat — hai file khac nhau co the trung title).`
  // Lời nhắc cho một danh sách con: cùng luật phân loại, chỉ đổi mảng Findings.
  const taiGui = ds => `Findings: ${JSON.stringify(ds.map(f => ({ [TRIAGE_ID_FIELD]: f.tid, title: f.title, file: f.file, line: f.line, severity: f.severity, detail: f.detail })))}`
  // Ghim CHUỖI tải gốc một lần: tính lại từ toTriage mỗi lần gọi thì bất kỳ ai đụng tid
  // sau đó làm replace trượt và lượt hỏi lại lặng lẽ gửi lại TRỌN danh sách (mutant
  // đúc-lại-mã của ca ma-giu-nguyen lộ ra đúng đường này).
  const taiGuiGoc = taiGui(toTriage)
  // Replacer phải là HÀM: chuỗi thay thế bị JS diễn giải các mẫu $&, $', $` và $$ — mà tải
  // là JSON của title/detail do reviewer viết, và kho này đầy script shell nên «$$», «$'»
  // là dữ liệu THẬT. Dạng chuỗi làm khối Findings tự chèn đầu/đuôi lời nhắc vào giữa JSON,
  // ngay LƯỢT 1 (lượt 1 cũng đi qua đây), và hỏng theo đường LẶNG: tác tử đọc tải méo, trả
  // thiếu hoặc lệch, không dòng nào gọi tên nguyên nhân. Hai lượt chấm đều bắt (AC-11).
  const triagePromptFor = ds => triagePrompt.replace(taiGuiGoc, () => taiGui(ds))
  triageOnce = (ds = toTriage) => agentT(triagePromptFor(ds), { label: 'triage', phase: 'Triage', schema: TRIAGE_SCHEMA, ...vaiOpt('triage') })
  triageRaw = await triageOnce().catch(() => null)
  if (!triageRaw) triageRaw = await triageOnce().catch(() => null) // retry 1
  if (!triageRaw || !Array.isArray(triageRaw.triaged)) {
    triageFailed = true
    log('Triage: agent chet ca retry — moi finding ve unclassified, khong ai REJECT tu findings')
  }
}
// Agent tự khai KHÔNG đọc được contract → fail-toward-human, y như agent chết.
// Không có nhánh này thì luật "không chắc chắn → inContract=false" biến mọi
// finding thành out-of-contract và card in "ngoài phạm vi đã duyệt" cho những
// lỗi chưa từng được đối chiếu — đọc như kết quả triage nhưng là bịa.
if (triageRaw && triageRaw.contractUnreadable === true) {
  triageFailed = true
  log('Triage: agent bao KHONG doc duoc contract — moi finding ve unclassified, khong ai REJECT tu findings')
}
// Khoá ghép là (file, title): title do hai lane reviewer sinh tự do trên cùng
// một diff nên trùng title giữa hai FILE là chuyện thường; ghép bằng title trần
// thì Map giữ mục cuối và finding out-of-contract lọt vào fix-list.
//
// Path phải CHUẨN HOÁ ở cả hai phía trước khi so. Reviewer được nhắc "trong repo
// <abs path>" nên lane này trả path tuyệt đối, lane kia trả tương đối, và agent
// triage chép lại dạng nó nhận: so chuỗi thô thì mọi finding rơi unclassified →
// triageFailed → rejectFindings rỗng → round báo PASS trong khi lỗi in-contract
// còn sống. Đây là khớp LLM-viết→máy-đọc: bỏ LLM ra khỏi định danh của khoá,
// đừng trông vào việc nó chép nguyên văn một đường dẫn dài.
// (3/5 round của discovery-brainstorm-socket dính, sổ d-20260806T122000Z-10021.)
// Vòng do-tin-tram-phan-loai (2.14): ghép BA NẤC, fail-closed từ trên xuống —
// (1) theo mã máy đúc; (2) khoá tệp::tiêu đề như cũ; (3) lưới tiêu đề
// duy-nhất-cả-hai-phía như cũ. Hai lưới chống tin mù cho nấc 1: mã LẠ (không trong
// tập gửi) là dòng THỪA — bỏ và gọi tên, không ghép sang ai; mã khớp mà TIÊU ĐỀ lệch
// thì không ghép — mã là định danh, tiêu đề là chữ ký kiểm (AC-1, AC-2, AC-3).
// Gỡ-mơ-hồ bằng title (nấc 3): CHỈ khi title duy nhất ở CẢ HAI phía; đếm theo khoá
// PHÂN BIỆT chứ không theo số lượt — ba lane cùng báo một lỗi không phải "mơ hồ".
const triageKey = t => `${relFile(t)} :: ${t.title}`
const ghepTriage = (rowsRaw, sent) => {
  const sentTids = new Set(sent.map(f => f.tid))
  // Dòng mang mã LẠ là dòng THỪA: bỏ khỏi TOÀN BỘ bộ ghép — kể cả nấc 2/3 — chứ không chỉ
  // khỏi nấc mã (lượt chấm 1 bắt: nó vẫn ghép qua khoá tệp::tiêu đề trong khi log nói «không
  // ghép sang ai»). Dòng KHÔNG mang mã (bên gửi đời cũ) vẫn đi nấc 2/3 như trước.
  const rows = rowsRaw.filter(r => {
    if (!r[TRIAGE_ID_FIELD] || sentTids.has(r[TRIAGE_ID_FIELD])) return true
    log(`Triage: ma la ${r[TRIAGE_ID_FIELD]} — bo dong thua, khong ghep sang ai`)
    return false
  })
  const byTid = new Map(rows.filter(r => sentTids.has(r[TRIAGE_ID_FIELD])).map(r => [r[TRIAGE_ID_FIELD], r]))
  const byKey = new Map(rows.map(t => [triageKey(t), t]))
  const distinctByTitle = arr => arr.reduce((m, x) => {
    if (!m.has(x.title)) m.set(x.title, new Set())
    m.get(x.title).add(triageKey(x))
    return m
  }, new Map())
  const rowsByTitle = distinctByTitle(rows)
  const sentByTitle = distinctByTitle(sent)
  const unique = (m, title) => (m.get(title) || new Set()).size === 1
  const byFinding = new Map()
  for (const f of sent) {
    const r1 = byTid.get(f.tid)
    const r = (r1 && String(r1.title || '').trim() === String(f.title || '').trim()) ? r1
      : byKey.get(triageKey(f))
      || ((unique(rowsByTitle, f.title) && unique(sentByTitle, f.title)) ? rows.find(t => t.title === f.title) : undefined)
    if (r) byFinding.set(distinctKey(f), r)
  }
  const thieu = sent.filter(f => !byFinding.has(distinctKey(f)))
  return { byFinding, thieu }
}
const rowsOf = raw => ((raw && Array.isArray(raw.triaged)) ? raw.triaged : []).filter(t => t && typeof t.title === 'string')
let { byFinding, thieu } = ghepTriage(rowsOf(triageRaw), toTriage)
// Hỏi lại ĐÚNG MỘT lần, chỉ phần còn thiếu, mang MÃ CŨ (AC-4, AC-9): ghepTriage tính
// tập mã hợp lệ từ chính `thieu`, nên một dòng lượt 2 mang mã ngoài tập đang hỏi tự
// thành mã lạ. Tác tử chết hay vẫn thiếu → rơi về luật fail-toward-human bên dưới,
// không thử lần ba (AC-6). Lượt 1 đủ thì không có lượt này (AC-5).
if (thieu.length && !triageFailed) {
  log(`Triage: thieu ${thieu.length}/${toTriage.length} muc sau luot 1 — hoi lai MOT lan chi cac muc thieu`)
  let triageRaw2 = null
  triageRaw2 = await triageOnce(thieu).catch(() => null)
  if (triageRaw2 && triageRaw2.contractUnreadable === true) triageFailed = true
  const g2 = ghepTriage(rowsOf(triageRaw2), thieu)
  for (const [k, r] of g2.byFinding) byFinding.set(k, r)
  thieu = g2.thieu
}
const matchTriage = f => byFinding.get(distinctKey(f))
// Finding gửi đi mà agent KHÔNG trả về → unclassified (không mặc định in/out).
const triagedRaw = toTriage.map(f => {
  const t = matchTriage(f)
  const ok = !triageFailed && !!t
  return {
    ...f,
    inContract: ok ? t.inContract === true : false,
    acRef: (ok && t.inContract === true && t.acRef) ? t.acRef : null,
    rationale: ok ? (t.rationale || '') : '',
    proposal: (ok && t.inContract !== true && t.proposal) ? t.proposal : null,
    // Câu ngôn ngữ sản phẩm — chữ DUY NHẤT thẻ Cổng 2 in ra cho người quyết.
    plain: (ok && t.inContract !== true && t.plain) ? t.plain : null,
    can_cu: (ok && t.inContract !== true && t.can_cu) ? t.can_cu : null,
    unclassified: !ok,
  }
})
// Fix-list của round: CHỈ finding trong hợp đồng. Out-of-contract KHÔNG BAO GIỜ
// vào đây, kể cả khi round REJECT vì lý do khác — chốt chặn chính của feature.
// Agent tra THIEU muc cho mot finding (bo sot / chep lech khoa) cung la triage
// KHONG day du — keo ca round ve fail-toward-human, dung nhat quan voi luat
// "khong chac chan thi khong ai duoc REJECT tu findings".
if (!triageFailed && triagedRaw.some(f => f.unclassified)) {
  triageFailed = true
  log('Triage: agent tra thieu muc cho it nhat mot finding — coi nhu phan loai khong day du, khong ai REJECT tu findings')
}
// ---- T1: REFUTE — chỉ finding TRONG hợp đồng (khi triage lành) ----
// Máy không tốn tiền chứng minh thứ máy KHÔNG ĐƯỢC SỬA: mục ngoài hợp đồng đi thẳng
// sang người ở Cổng Bằng chứng, mang cờ `khongBacBo` (theo THIẾT KẾ) — khác hẳn
// `unverified` (refuter CHẾT, hạ tầng hỏng). Trộn hai cờ là dán nhãn hỏng-hạ-tầng lên
// một quyết định cố ý. Triage hỏng → rơi về ĐƯỜNG CŨ: refute tất cả, vì lúc đó máy
// không biết cái nào trong hợp đồng, và người nhận việc xứng đáng có danh sách đã lọc.
phase('Refute')
const toRefute = triageFailed ? triagedRaw : triagedRaw.filter(f => f.inContract && !f.unclassified)
log(`Refute: ${toRefute.length}/${triagedRaw.length} finding — ${triageFailed ? 'triage hong, refute TAT CA (duong cu)' : 'chi finding trong hop dong'}`)
const refuteVotes = await parallel(toRefute.map(f => () =>
  agentT(
    `Adversarially verify finding sau trong repo ${args.repoRoot} (diff ${args.diffBase}...HEAD):\n"${f.title}" tai ${f.file}${f.line ? ':' + f.line : ''} — ${f.detail}\nCo BAC BO no: doc code that (Read/Grep; KHONG git checkout/switch — repo phai o nguyen branch), tim bang chung no KHONG phai van de. refuted=true neu khong chac chan day la van de that.`,
    { label: `refute:${(f.file || '').split('/').pop()}`, phase: 'Review', schema: REFUTE_SCHEMA, ...vaiOpt('refute') }
  ).then(v => ({ key: distinctKey(f), v }))
))
const refuteByKey = new Map((refuteVotes || []).filter(Boolean).map(x => [x.key, x.v]))
const refuteAttempted = new Set(toRefute.map(distinctKey))
const triaged = triagedRaw.flatMap(f => {
  const k = distinctKey(f)
  if (!refuteAttempted.has(k)) return [{ ...f, khongBacBo: true }]   // ngoài hợp đồng: không chấm, nói ra
  const v = refuteByKey.get(k)
  if (!v || typeof v !== 'object') return [{ ...f, unverified: true }] // refuter chết → giữ, đánh dấu
  return v.refuted === true ? [] : [f]
})
const confirmedFindings = triaged

// ── T5: FINDING CÓ SỔ ────────────────────────────────────────────────────────
// Eval có id/paths/hash nên kit carry được, khoanh được, đếm được. Finding do LLM
// sinh tự do thì KHÔNG có tên máy đọc — nên không cơ chế nào của kit chạm tới, và
// `bugs`/`measurement`/`refute` chạy lại TRỌN mỗi lượt kể cả khi diff không đổi một
// dòng. Dòng dưới đây là cái tên đó: lượt sau đọc nó để biết mục ngoài hợp đồng nào
// đã phân loại rồi và file của nó có đổi không.
// Dòng KHÔNG có `run_id` → mọi bộ đọc bằng chứng bỏ qua nó, cùng đường với dòng
// `panel`/`baseline` (đã kiểm: round-tally-read lọc kind, loop-health đếm kind repin,
// evidence-core/recheck chỉ đọc dòng có run_id).
// <<<FINDING-LINE
const findingLine = (f, carriedFrom) => JSON.stringify({
  ts: invokedAt, ...(invokedSha ? { sha: invokedSha } : {}), round: args.round, kind: 'finding',
  file: relFile(f), title: f.title, severity: f.severity || '', source: f.source || '',
  inContract: f.inContract === true, acRef: f.acRef || '', plain: f.plain || '', can_cu: f.can_cu || '', proposal: f.proposal || '',
  khongBacBo: f.khongBacBo === true, unverified: f.unverified === true, unclassified: f.unclassified === true,
  ...(typeof carriedFrom === 'number' ? { carried_from_round: carriedFrom } : {}),
})
// FINDING-LINE>>>
for (const f of triaged) runLogLines.push(findingLine(f))
// Mục CARRY cũng phải để lại dòng sổ Ở LƯỢT NÀY — đúng nếp P1 làm cho eval carried
// (dòng `carried_from_round` trỏ về gốc). Thiếu nó thì chuỗi carry đứt sau đúng một
// lượt: lượt 3 không thấy mục đó trong sổ của lượt 2 nên triage lại từ đầu, và nhãn
// «(r1)» biến mất khỏi bản findings. Lượt chấm 1 của hồ sơ này bắt (hai lane).
for (const c of carriedFindings) runLogLines.push(findingLine(
  { file: c.file, title: c.title, severity: c.severity, source: 'carried',
    inContract: false, acRef: '', plain: c.plain, can_cu: c.can_cu, proposal: c.proposal, khongBacBo: true },
  typeof c.fromRound === 'number' ? c.fromRound : args.round - 1))

// T7: điểm MUỘN NHẤT cần baseline — sau Triage và Refute. Vẫn ĐỢI (W44c canh vế này):
// bỏ lượt đợi thì nonDiscriminating rỗng và một eval xanh-cả-hai-phía được ký PASS.
const baselineRaw = await baselineP
// BASELINE-LENH: kết quả là DÒNG DẤU trong `dauRa` do JS đọc, không phải results[] tác tử khai.
// Lane không về trọn (tác tử chết/bị dừng, công cụ cắt, thiếu `__BL_XONG`, worktree không dựng được)
// là BLOCKED HẠ TẦNG CÓ TÊN cho làn đối chứng: mọi lệnh n-a kèm lý do, lượt chấm vẫn đi tiếp tới báo
// cáo — làn PHỤ không được giữ cả lượt (crm 07/10: 5 giờ, 0 báo cáo).
let baselineHaTang = ''
let baselineKetQua = []
if (baselineCmds.length > 0) {
  if (!baselineRaw || typeof baselineRaw !== 'object') baselineHaTang = 'tac tu baseline chet hoac bi dung — khong co ket qua'
  else if (typeof baselineRaw.dauRa === 'string') {
    const doc = docBaseline(baselineRaw.dauRa, baselineCmds)
    if (baselineRaw.killedByTool === true) baselineHaTang = 'lenh baseline bi cong cu dung giua chung'
    else if (doc.haTang) baselineHaTang = `khong dung duoc worktree tren ${args.diffBase} (${doc.haTang})`
    else if (!doc.du) baselineHaTang = `dau ra thieu dong ${DAU_BL}_XONG — lenh baseline khong chay het (bi dung, cho hop xin quyen, dau ra bi cat, hoac lenh eval vo cu phap shell)`
    baselineKetQua = baselineCmds.map(c => doc.theoCmd.get(c) || { cmd: c, cannotRun: true, reason: 'khong co dong ket qua cho lenh nay trong dau ra baseline' })
  } else {
    // Đường đọc-cũ: tác tử/harness đời cũ không trả `dauRa` — đọc results[] như 2.24.0, có cờ vàng.
    log('CO VANG: baseline khong tra dauRa (duong doc-cu) — doc results[] tac tu khai')
    const khai = new Map((Array.isArray(baselineRaw.results) ? baselineRaw.results : []).filter(b => b && typeof b.cmd === 'string').map(b => [b.cmd, b]))
    // Lệnh tác tử không khai = không đo: có tên, và phép đo không trọn (không ghi dòng kind:"baseline").
    baselineKetQua = baselineCmds.map(c => khai.get(c) || { cmd: c, cannotRun: true, thieu: true, reason: 'tac tu baseline khong khai ket qua cho lenh nay (duong doc-cu)' })
  }
  if (baselineHaTang) {
    baselineKetQua = baselineCmds.map(c => ({ cmd: c, cannotRun: true, reason: `BLOCKED ha tang baseline: ${baselineHaTang}` }))
    log(`baseline: BLOCKED ha tang — ${baselineHaTang}; moi lenh baseline n-a, luot van di tiep (lane phu), round sau do lai`)
  }
}
// Phép đo TRỌN mới được ghi thành dòng run-log `kind:"baseline"` (P2 carry theo evalsHash): ghi một
// phép đo hỏng hay chạm trần là để các round sau mang theo nó mà không đo lại.
const baselineTron = !baselineHaTang && !baselineKetQua.some(b => b && (b.tran || b.thieu))
// ---- A/B baseline: map kết quả đối chứng theo cmd; status = green | red | n-a ----
// Lane baseline nay CUNG mang cd guard, nen phai qua CUNG bo phan loai: cd hong
// trong worktree ma doc thanh baselineExit != 0 se bao «eval CO phan biet» cho
// mot cay khong ton tai — bang chung tu doi (S4-r2).
const baselineByCmd = new Map(baselineKetQua
  .map(normKill)
  .map(b => normInfra({ ...b, exitCode: b.baselineExit }))
  .map(b => [b.cmd, b]))
// AC-6: 'green' nghia la lan doi chung tra DUNG KY VONG — hai duong:
//   (1) baseline khop CHINH XAC ma da khai (b.baselineExit === expCmd(cmd)), HOAC
//   (2) CA HAI phia (baseline VA HEAD) cung the hien DUNG mot hanh vi hetHan
//       (gioi han da khai khong con) — currentExit BAT BUOC phai duoc truyen
//       va cung hetHan, khong chi rieng baseline. Truoc ban vi nay chi doi
//       isHetHan(baseline) ma KHONG doi HEAD cung hetHan, nen HEAD con gioi han
//       (exitCode === expCmd(cmd), vd 2) so baseline HET gioi han (0) van bi
//       doc la 'green' — mot hoi quy that (S4, eval-khai-ma-thoat-mong-doi,
//       luot soi toan nhanh 2026-09-09/10) bi dan nhan sai thanh
//       nonDiscriminating. currentExit thieu (khong truyen) -> chi con duong
//       (1), khong tu suy dien hetHan.
// Lệnh baseline KHÔNG đo được + lý do — lên báo cáo (section Analyst), không im lặng thành «n-a».
const baselineKhongDo = runBaseline
  ? [...baselineByCmd.values()].filter(b => b.cannotRun).map(b => ({ cmd: b.cmd, ly_do: b.reason || 'khong chay duoc tren baseline' }))
  : []
const baselineStatus = (cmd, currentExit) => {
  const b = baselineByCmd.get(cmd)
  if (!b || b.cannotRun) return 'n-a'
  const bothHetHan = typeof currentExit === 'number' && isHetHan(b.baselineExit, cmd) && isHetHan(currentExit, cmd)
  return (b.baselineExit === expCmd(cmd) || bothHetHan) ? 'green' : 'red'
}
// Eval không-phân-biệt: lệnh-CÓ-eval pass trên CẢ HEAD lẫn baseline (green-on-both) → chứng minh harness, không phải feature
// P2: round không đo baseline → Analyst carry nguyên từ round có baseline gần nhất (carriedAnalyst).
const carriedAnalyst = (!runBaseline && args.carriedAnalyst && Array.isArray(args.carriedAnalyst.nonDiscriminating))
  ? args.carriedAnalyst : null
const nonDiscriminating = runBaseline
  ? machine
      .filter(m => (byCmd.get(m.cmd) || []).length > 0 && !m.cannotRun && !m.variance && (m.exitCode === expCmd(m.cmd) || isHetHan(m.exitCode, m.cmd)) && baselineStatus(m.cmd, m.exitCode) === 'green')
      .map(m => ({ cmd: m.cmd, evals: byCmd.get(m.cmd) }))
  : (carriedAnalyst ? carriedAnalyst.nonDiscriminating : [])

// T1 giữ bất biến 27/07: unverified (refuter CHẾT) KHÔNG BAO GIỜ kéo REJECT và
// KHÔNG vào fix-list. Trước T1 điều đó tự đúng vì finding unverified chưa từng qua
// triage nên không thể mang inContract; nay triage chạy TRƯỚC nên phải nói ra bằng
// vị từ — nếu không, một refuter chết biến thành một round sửa trên một lỗi chưa ai
// xác nhận. Chúng vẫn hiện ở mục «chưa adversarial-verify» cho người đọc.
const rejectFindings = triageFailed ? [] : triaged.filter(f => f.inContract && !f.unverified)
const triageHighInContract = triageFailed ? [] : triaged.filter(f => f.inContract && f.severity === 'high' && !f.unverified)

// Tín hiệu cụm-ngoài-vùng-phủ: findings dồn vào file không eval nào đo = hợp đồng
// đang hụt. Ngưỡng ≥2 — một finding lẻ không đẩy người vào quyết định mở-rộng-hay-rút.
// Glob tối giản: ** = mọi thứ, * = trong một đoạn đường dẫn.

// Vùng phủ cũng đọc KẾT QUẢ của bên viết: `coverageFiles` = tệp (trong diff) được ít
// nhất một eval khai `paths`; `coEvalPaths` phân biệt «không eval nào khai» (n-a) với
// «có khai nhưng finding rơi ngoài». Bên viết đời cũ không truyền → rơi về đường cũ.
const coverageFiles = Array.isArray(args.coverageFiles) ? new Set(args.coverageFiles) : null
const coEvalPaths = typeof args.coEvalPaths === 'boolean' ? args.coEvalPaths
  : args.evals.some(e => Array.isArray(e.paths) && e.paths.length)
const coverageResCu = args.evals.flatMap(e => Array.isArray(e.paths) ? e.paths : []).map(globToRe)
// Path đã chuẩn hoá bằng relFile khai ở đầu bước Triage — cùng một phép cho khoá
// ghép, dedupe và vùng phủ, để ba chỗ không trôi khỏi nhau.
// Đếm theo finding PHÂN BIỆT (file+title), không theo số lượt báo: hai reviewer
// cùng thấy một lỗi là chuyện thường, và nó KHÔNG được tự nhân đôi thành "cụm".
// Khoá phân biệt dùng path ĐÃ chuẩn hoá (relFile khai ngay trên): hai lane
// reviewer có thể báo cùng một lỗi bằng path tuyệt đối và path tương đối —
// dedupe trên path thô sẽ nhân đôi nó thành "cụm" giả.
const triagedDistinct = dedupe(triaged)
// SỬA KHUNG 14/09 — CÙNG phép chia miền với `laNgoaiVat`. Bản trước hỏi thuộc-tập cho
// MỌI đường dẫn, mà `coverageFiles` chỉ chứa tệp trong diff; nên một finding trên tệp
// ĐÃ được `eval.paths` phủ nhưng ngoài diff bị đếm là ngoài vùng phủ, và cờ cụm bật
// GIẢ. Lượt chấm 3 dính đúng ca đó: cụm 3/12, cả ba tệp đều ngoài diff — một lượt gọi
// người giả ở Cổng Bằng chứng, tức chính thứ north star đếm là chi phí.
const duocPhu = pth => (coverageFiles && diffSet.has(pth))
  ? coverageFiles.has(pth)
  : coverageResCu.some(re => re.test(pth))
const outsideCoverage = !coEvalPaths ? [] // không eval nào khai paths → không tính được (n-a)
  : triagedDistinct.filter(f => relFile(f) && !duocPhu(relFile(f)))
const coverageCluster = outsideCoverage.length >= 2
  ? { count: outsideCoverage.length, total: triagedDistinct.length, files: [...new Set(outsideCoverage.map(relFile))] }
  : null
if (coverageCluster) log(`Cum ngoai vung phu: ${coverageCluster.count}/${coverageCluster.total} finding roi vao file khong eval nao do`)

// ---- panel verdict per judgment eval: majority 2/3, else UNCERTAIN. CHỈ LÀ ĐỀ XUẤT cho Gate 2 ----
const freshPanels = freshJudgmentEvals.map(e => {
  const votes = judges.filter(j => j.evalId === e.id)
  const count = v => votes.filter(x => x.verdict === v).length
  const proposal = count('PASS') >= 2 ? 'PASS' : count('FAIL') >= 2 ? 'FAIL' : 'UNCERTAIN'
  return { evalId: e.id, proposal, votes }
})
// P3: panel carried ghép vào cùng danh sách — verdict routing phía dưới GIỮ NGUYÊN luật
// (T3 / proposal khác PASS → PENDING-JUDGMENT), chỉ khác nguồn: không chấm lại khi inputs không đổi.
const panels = [
  ...freshPanels,
  ...carriedPanels.map(p => ({
    evalId: p.evalId, proposal: p.proposal,
    votes: (Array.isArray(p.votes) ? p.votes : []).map(v => ({ lens: v.lens, verdict: v.verdict, ...(v.required_evidence ? { required_evidence: v.required_evidence } : {}) })),
    carried: true, fromRound: typeof p.fromRound === 'number' ? p.fromRound : null,
  })),
  // Không khai input → máy không có căn cứ. Panel cơ học, KHÔNG do agent nào phán.
  ...[...ungroundedIds].map(id => ({
    evalId: id, proposal: 'UNCERTAIN', votes: [], ungrounded: true,
    note: 'eval khong khai input nao — may khong co can cu de phan, nguoi quyet o Cong 2',
  })),
]

// P3/P2: dòng memo run-log cho round SAU so hash — CHỈ ghi khi SKILL truyền hash (flow cũ không
// hash → không ghi, log gọn). Dòng không có run_id → evidence-core/loadRunLogIds bỏ qua, vô hại.
for (const pn of freshPanels) {
  const ih = (evalById.get(pn.evalId) || {}).inputsHash
  if (typeof ih === 'string' && ih) runLogLines.push(JSON.stringify({
    ts: invokedAt, ...(invokedSha ? { sha: invokedSha } : {}), round: args.round, evalId: pn.evalId, kind: 'panel', proposal: pn.proposal,
    votes: pn.votes.map(v => ({ lens: v.lens, verdict: v.verdict, ...(v.required_evidence ? { required_evidence: v.required_evidence } : {}) })), inputs_hash: ih,
  }))
}
for (const p of carriedPanels) {
  if (typeof p.inputsHash === 'string' && p.inputsHash) runLogLines.push(JSON.stringify({
    ts: invokedAt, ...(invokedSha ? { sha: invokedSha } : {}), round: args.round, evalId: p.evalId, kind: 'panel', proposal: p.proposal,
    votes: (Array.isArray(p.votes) ? p.votes : []).map(v => ({ lens: v.lens, verdict: v.verdict, ...(v.required_evidence ? { required_evidence: v.required_evidence } : {}) })),
    inputs_hash: p.inputsHash, carried_from_round: typeof p.fromRound === 'number' ? p.fromRound : null,
  }))
}
if (typeof args.evalsHash === 'string' && args.evalsHash && (!runBaseline || baselineTron)) {
  runLogLines.push(JSON.stringify({
    ts: invokedAt, ...(invokedSha ? { sha: invokedSha } : {}), round: args.round, kind: 'baseline', evals_hash: args.evalsHash,
    non_discriminating: nonDiscriminating,
    ...(runBaseline ? {} : { carried_from_round: carriedAnalyst && typeof carriedAnalyst.fromRound === 'number' ? carriedAnalyst.fromRound : null }),
  }))
}

// ---- verdict routing (kit rules) ----
const blocked = machine.filter(m => m.cannotRun)
  .map(m => ({ cmd: m.cmd, reason: m.reason || 'cannotRun khong co reason' }))
  .concat(expConflicts)
{
  // AC-8 (cham-dung-cay-dung-cho-dung): vắng mặt là TÍN HIỆU — agent chết không
  // được tàng hình. Mỗi eval mất kết quả để lại một dòng `kind: vang-mat` trong
  // run-log (trước đây: 0 dòng, phiên khảo cổ phải đoán từ sự thiếu vắng).
  const vangMat = (evalId, reason) => runLogLines.push(JSON.stringify({
    ts: invokedAt, ...(invokedSha ? { sha: invokedSha } : {}), round: args.round, evalId, kind: 'vang-mat', reason,
  }))
  const ran = new Set(machine.map(m => m.cmd))
  for (const cmd of distinctCmds.filter(c => !ran.has(c))) {
    blocked.push({ cmd, reason: 'agent bi skip/chet — khong co ket qua, khong duoc tinh la pass' })
    for (const evalId of (byCmd.get(cmd) || [])) vangMat(evalId, 'agent bi skip/chet — khong co ket qua nao tra ve cho lenh: ' + cmd)
  }
  for (const e of uiEvals.filter(e => !ran.has(`ui-check:${e.id}`))) {
    blocked.push({ cmd: `ui-check:${e.id}`, reason: 'ui-check agent bi skip/chet — khong co ket qua, khong duoc tinh la pass' })
    vangMat(e.id, 'ui-check agent bi skip/chet — khong co ket qua')
  }
}
const failed = machine.filter(m => !m.cannotRun && m.exitCode !== expCmd(m.cmd) && !isHetHan(m.exitCode, m.cmd))
const failedEvalIds = [...new Set(failed.flatMap(m => m.evals))]

const failedCommands = failed.map(m => ({ cmd: m.cmd, evals: m.evals, exitCode: m.exitCode }))

// variance-N: lệnh đa-lần pass-rate hỗn hợp (không 0%, không 100%) = phương sai → NGƯỜI quyết ngưỡng ở Gate 2
const varianceCmds = machine.filter(m => m.variance)

let verdict
if (blocked.length) verdict = 'BLOCKED'
else if (failed.length) verdict = 'REJECT'
// Vế MỚI: finding THẬT + trong hợp đồng + nặng → máy tự quay S3 sửa, không tốn
// một lượt cổng người. Đặt DƯỚI BLOCKED (môi trường hỏng thì không sửa gì) và
// sau failed (cùng kết cục, gộp chung fix-list).
else if (triageHighInContract.length) verdict = 'REJECT'
// Triage hỏng = máy KHÔNG biết finding nào trong hợp đồng, nên nó cũng không
// biết round này sạch. Verdict phải nói ra điều đó: PASS sạch bong là thứ người
// ký đọc rồi ký, trong khi chính workflow không tin nó (fail-toward-human chỉ có
// nghĩa khi con người THẤY được là mình đang được chuyển việc). PENDING-JUDGMENT
// đúng nghĩa sẵn có: máy chạy xong, một người phải quyết. triageFailed chỉ bật
// khi CÓ finding, nên round không finding không bị kéo vào đây.
else if (triageFailed) verdict = 'PENDING-JUDGMENT'
else if (varianceCmds.length || (judgmentEvals.length && (args.riskTier === 'T3' || panels.some(p => p.proposal !== 'PASS')))) verdict = 'PENDING-JUDGMENT'
else verdict = 'PASS'

// AC-9 (cham-dung-cay-dung-cho-dung): mỗi lượt đúng MỘT dòng tổng kết máy-đọc-được
// — vật đo cho ngưỡng 5-vòng-kế (đếm lượt cháy vì hạ tầng mà không phải khảo cổ).
// expected đếm từ lịch đã lên (distinct cmds × runs + ui evals), returned đếm từ
// kết quả THẬT trả về — hai nguồn độc lập, writer không hardcode được returned=expected.
{
  // CÙNG một bên viết với đường hỏng-sớm (tallyLine) — hai bản dựng dòng là hai
  // khuôn sẽ trôi khỏi nhau; đây là chỗ lớp đó từng nổ.
  const expected = distinctCmds.reduce((n, c) => n + (cmdRuns.get(c) || 1), 0) + uiEvals.length
  const returned = (machineRaw || []).filter(Boolean).length + (uiRaw || []).filter(Boolean).length
  runLogLines.push(tallyLine(verdict, blocked.length, expected, returned))
}

log(`Verdict: ${verdict}${failedEvalIds.length ? ' — failed: ' + failedEvalIds.join(', ') : ''}${blocked.length ? ' — blocked: ' + blocked.length + ' lenh' : ''}${varianceCmds.length ? ' — variance: ' + varianceCmds.length : ''} — findings xac nhan: ${confirmedFindings.length}${triaged.length ? ` (trong hop dong: ${rejectFindings.length}, ngoai: ${triaged.filter(f => !f.inContract && !f.unclassified).length}${triageFailed ? ', TRIAGE HONG' : ''})` : ''}`)

// Dòng Known limits cho eval đạt-có-giới-hạn — JS TÍNH SẴN, bên soạn chỉ chép
// nguyên văn. Không để bên soạn tự diễn đạt: mục này là điều kiện xanh-sạch,
// một câu lệch khuôn là một hồ sơ đi nhầm cổng.
const acOf = id => (args.evals.find(e => e.id === id) || {}).criterion || '?'
const knownLimitLines = machine
  .filter(m => !m.cannotRun && expCmd(m.cmd) !== 0 && m.exitCode === expCmd(m.cmd))
  .flatMap(m => (byCmd.get(m.cmd) || []).map(id =>
    `- ${id} (${acOf(id)}) dat-co-gioi-han: ma thoat ${m.exitCode} la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: ${m.cmd}`))
// Giới hạn đã khai KHÔNG CÒN: khai mã khác 0 mà nay trả 0.
const gioiHanHet = machine
  .filter(m => !m.cannotRun && isHetHan(m.exitCode, m.cmd))
  .flatMap(m => (byCmd.get(m.cmd) || []).map(id =>
    `- ${id} (${acOf(id)}): gioi han da khai khong con — evals.yaml khai ma ${expCmd(m.cmd)}, lan chay nay tra 0. Go loi khai o vong sau.`))

// ---- Synthesize: 1 agent viết evidence-report.md đúng template (hook enforce) ----
phase('Synthesize')
// Trim payload: lệnh PASS chỉ cần ~3 dòng output cuối làm evidence; lệnh fail/blocked giữ nguyên tail (cần cho chẩn đoán).
// AC-10: hetHan (giới hạn đã khai không còn) là ĐẠT, không phải một lượt trượt
// cần chẩn đoán — dòng "GIOI HAN DA KHAI KHONG CON" đã nói rõ mã khai/mã thật,
// nên trim như một PASS bình thường, không giữ tail đầy đủ.
const machineForReport = machine.map(m => (!m.cannotRun && !m.variance && (m.exitCode === expCmd(m.cmd) || isHetHan(m.exitCode, m.cmd)))
  ? { ...m, outputTail: String(m.outputTail || '').split('\n').slice(-3).join('\n') }
  : m)
const machineForReportB = machineForReport.map(m => ({ ...m, baseline: baselineStatus(m.cmd, m.exitCode) }))
// Provenance xác định bằng máy → literal (synthesizer chỉ chép, không tự suy diễn/bỏ field trust-critical).
// Run-log KHÔNG còn agent scribe: một agent "chép sẵn dòng audit" trông y hệt hành
// vi ngụy tạo hồ sơ và bị safety layer chặn lặp lại (4 lần, phiên 2026-07-27→28),
// dù nội dung do JS tính từ kết quả chạy thật. Main loop tự append result.runLog
// (cơ chế được user ủy quyền minh danh 2026-07-28) — SKILL bước "Mọi verdict".
const prov = await agentT(
    `Chay DUNG 3 lenh, bao cao KET QUA THUC (KHONG suy dien, KHONG doan):\n1) printf '%s' "$ACCEPTANCE_GATE_BYPASS" — in ra dung "1" → bypass_used=true; rong/khac → false.\n2) Doc ${args.repoRoot}/_acceptance/config.yaml, lay field "enforcement" o cap 0 (^enforcement: strict|warn|off); thieu file/field → "strict".\n3) git -C ${args.repoRoot} rev-parse HEAD — tra ve verified_commit = chuoi 40-hex NGUYEN VAN tu stdout; lenh loi (khong phai git repo) → chuoi rong. TUYET DOI KHONG bia SHA.\nTra ve {bypass_used, enforcement_mode, verified_commit} dung ket qua 3 lenh tren.`,
    { label: 'capture:provenance', phase: 'Synthesize', schema: PROV_SCHEMA, ...vaiOpt('provenance') }
  )
// K1 (gom-duc-ket-2-10-0, AC-3): agent xuất-xứ chết vì hạn mức phiên → `prov` null →
// `prov.enforcement_mode` ở prompt synthesize ném TypeError và GIẾT cả vòng chấm ở bước
// cuối (đo 24 lần trên máy, 2 lần trong một vòng). Lane chết phải nói ra như mọi lane
// khác: BLOCKED có tên, không đoán xuất-xứ, không soạn report trên trường rỗng.
if (!prov || typeof prov !== 'object') {
  blocked.push({ cmd: 'capture:provenance', reason: 'capture:provenance agent bi skip/chet — khong co ket qua, khong duoc tinh la pass' })
  verdict = 'BLOCKED'
  // Dòng round-tally ĐÃ được đẩy vào runLogLines TRƯỚC bước này, mang verdict cũ (thường
  // PASS). Nếu để nguyên, run-log trên đĩa khai một vòng PASS/blocked=0 cho đúng cái vòng
  // bị hạ tầng giết — bằng chứng tự dối ở chính chỗ K1 sinh ra để chữa, và bộ đếm
  // «vòng cháy vì hạ tầng» (round-tally-read.mjs) đếm hụt. Thay dòng cuối bằng dòng thật.
  const tallyIdx = runLogLines.map(l => { try { return JSON.parse(l).kind } catch (_) { return null } }).lastIndexOf('round-tally')
  const oldTally = tallyIdx >= 0 ? (() => { try { return JSON.parse(runLogLines[tallyIdx]) } catch (_) { return null } })() : null
  const fixedTally = tallyLine('BLOCKED', blocked.length, oldTally ? oldTally.expected : 0, oldTally ? oldTally.returned : 0)
  if (tallyIdx >= 0) runLogLines[tallyIdx] = fixedTally
  else runLogLines.push(fixedTally)
  log('Provenance: agent chet — BLOCKED, dong round-tally ghi lai theo verdict that, KHONG soan report')
  // Khuôn trả về ĐỦ TRƯỜNG như blockedEarly: ba đường BLOCKED phải cùng một hợp đồng kết
  // quả, nếu không bên đọc nào gọi `.length` trên trường vắng sẽ ném — đúng lớp lỗi K1 chữa.
  return {
    verdict,
    failedEvals: failedEvalIds,
    failedCommands,
    blocked,
    panels: panels.map(p => ({ evalId: p.evalId, proposal: p.proposal })),
    carried: { evals: carriedEvals.map(c => c.id), panels: carriedPanels.map(p => p.evalId), baseline: !runBaseline, findings: [...carriedKeys] },
    confirmedFindings,
    rejectFindings,
    boNgoaiVat: boNgoaiVat.map(f => ({ file: relFile(f), title: f.title, source: f.source || '' })),
    nonDiscriminating,
    variance: varianceCmds.map(m => ({ cmd: m.cmd, evals: m.evals, runs: m.runs, passRate: `${m.passes}/${m.runs}` })),
    triaged,
    triageFailed,
    coverageCluster,
    reviewIncomplete,
    runLog: (ghiLoaiVang(runLogLines), runLogLines),
    runLogWriteFailed: true,
    report: '',
    findings: '',
    ...khoaLoaiVang(),
  }
}
const runLogWriteFailed = runLogLines.length > 0 // luôn: main loop append, không còn scribe
if (runLogWriteFailed) log('Run-log: ' + runLogLines.length + ' dong trong result.runLog — main loop TU append truoc Gate 2 (hook/recheck doi chieu run_id voi log nay)')
// verified_commit sanitize bang JS thuan — khong tin agent: sai shape (khong phai hex SHA) coi nhu
// khong co (report BO field; pre-merge se NOTE "not pinned" thay vi hook chan oan ca round).
// cham-khong-tu-dot-luot AC-5: mã commit do MÁY đưa (s4-args, git rev-parse HEAD lúc gọi) thắng
// giá trị tác tử khai (vòng 3 lượt 4 OKR: tác tử trả ec2849e5, không trùng commit nào). Không
// invokedSha → đường cũ (giá trị tác tử qua bộ lọc hình dạng). Không phát hiện cây trôi (descope d-…-4).
const hopLeSha = v => (/^[0-9a-f]{7,40}$/i.test(String(v || '').trim()) ? String(v).trim().toLowerCase() : '')
const verifiedCommit = hopLeSha(args.invokedSha) || hopLeSha(prov && prov.verified_commit)
// P1: payload block carried cho report — run_id + verified_at NGUYÊN GỐC round trước (không giả
// timestamp mới), kèm carried_from_round để Gate 2 thấy rõ eval nào round này KHÔNG chạy lại.
const carriedForReport = carriedEvals.map(c => {
  const d = evalById.get(c.id)
  return {
    id: c.id, criterion: d.criterion, executor: d.executor, ref: d.ref, expected: d.expected,
    run_id: c.runId, verified_at: c.verifiedAt || invokedAt,
    carried_from_round: typeof c.fromRound === 'number' ? c.fromRound : null,
    // AC-5: khung lượt gốc do s4-args gắn (cùng run_id, ảnh có thật). Chỉ ui-check, chỉ khi đủ.
    ...(d.executor === 'ui-check' && typeof c.screenshot === 'string' && c.screenshot.trim() && typeof c.observed === 'string' && c.observed.trim()
      ? { screenshot: c.screenshot.trim(), observed: c.observed, network_observed: typeof c.networkObserved === 'string' && c.networkObserved.trim() ? c.networkObserved.trim() : 'n-a (driver)' }
      : {}),
  }
})
const report = await agentT(
  `Soan NOI DUNG evidence report cho feature "${args.slug}" round ${args.round} — TRA VE trong field "report", KHONG ghi file nao ca (main loop se append run-log roi MOI ghi evidence-report.md — hook doi chieu run_id trong report voi log nen thu tu do la bat buoc). Noi dung thay tron round cu; lich su round nam trong section Iterations.\nDoc template tai ${args.templatePath} va tuan thu TUYET DOI shape — hook acceptance-evidence-gate.js se chan neu sai (L1 SHAPE: PASS can run_id ≥4 ky tu + exit_code 0 + verifier + verified_at ISO8601; L1 CONSISTENCY: report PASS chi duoc chua token exit khac 0 BEN TRONG khoi cua eval DA KHAI dung ma do (gioi han da khai) — moi cho khac van cam; chuoi "verdict: FAIL" van bi cam o moi cho; L2: verifier la config: ref hoac script path; L3: moi UNCERTAIN can human_override).\n\nVerdict DA TINH SAN (khong tu thay doi): ${verdict}\nPROVENANCE — ghi NGUYEN VAN cac dong frontmatter nay (DA do bang buoc capture, TUYET DOI KHONG tu doi/suy dien/bo): "enforcement_mode: ${prov.enforcement_mode}" va "bypass_used: ${prov.bypass_used}"${verifiedCommit ? ` va "verified_commit: ${verifiedCommit}"` : ''}. CI pre-merge dung cac field nay de chan gate yeu va phat hien code doi SAU verify (stale evidence).${verifiedCommit ? ' Hook L1 chan verified_commit khong phai hex SHA — chep dung nguyen van, khong rut gon.' : ' Repo khong phai git: BO HAN field verified_commit (khong bia, khong ghi rong).'}\n${triageFailed ? `TRIAGE HONG — buoc phan loai pham vi KHONG chay duoc round nay, nen may KHONG biet finding nao trong hop dong va KHONG tu sua gi. Ghi CA HAI dau vet sau, khong duoc bo mot cai nao:\n(1) frontmatter THEM DUNG dong "triage_failed: true" (dat ngay duoi dong verdict);\n(2) than bai, NGAY DUOI dong tieu de "# Evidence Report: ...", mot dong canh bao BAT DAU bang "⚠ phân loại phạm vi KHÔNG chạy được" roi noi ro: khong loi nao duoc may tu sua, danh sach day du nam trong review-findings.md, nguoi xem lai toan bo truoc khi ky.\nTUYET DOI KHONG them section "##" moi cho viec nay va KHONG viet lai verdict.\n` : ''}failed_evals: ${JSON.stringify(failedEvalIds)}\nblocked (neu BLOCKED, ghi reason vao frontmatter): ${JSON.stringify(blocked)}\nLenh fail khong gan eval (ghi ro trong report neu co): ${JSON.stringify(failedCommands)}\nReview incomplete (finder chet — ghi canh bao trong review-findings.md): ${JSON.stringify(reviewIncomplete)}\n${evalsNotRun.length ? `O KHAI KHONG-CHAY (evals.yaml tu khai status: not-run — may KHONG chay, khong co ket qua nao): chep NGUYEN VAN dong sau vao report, ngay duoi bang ket qua:\nkhông chạy theo hồ sơ: ${evalsNotRun.join(', ')}\nKHÔNG viết hàng bảng và KHÔNG viết khối \`- eval:\` nào cho các id này — báo cáo chỉ nói ra chúng bằng dòng ấy.\n` : ''}\nKet qua may (moi block cmd cover cac eval cua no; block cua eval ui-check ghi them field "screenshot:" = screenshotPath tu ket qua VA field "observed:" = observed tu ket qua (template schema v2 — hook CHAN report PASS co screenshot: ma thieu observed: thuc chat >=20 ky tu; neu ket qua ui THIEU observed → TU MO tung frame evidence da luu bang Read va viet observed truoc khi ghi report, KHONG bia)): ${JSON.stringify(machineForReportB)}\n${knownLimitLines.length ? `\nKNOWN LIMITS — chep NGUYEN VAN ${knownLimitLines.length} dong sau vao muc "## Known limits", moi dong mot bullet, KHONG dien dat lai, KHONG gop dong:\n${knownLimitLines.join('\n')}\nVoi cac eval nay: khoi eval PHAI ghi "exit_code: <ma that>" DUNG TEN TRUONG do — TUYET DOI khong bo truong va khong dat ten truong khac.\n` : ''}${gioiHanHet.length ? `\nGIOI HAN DA KHAI KHONG CON — chep NGUYEN VAN vao muc "## Known limits":\n${gioiHanHet.join('\n')}\n` : ''}NETWORK TRUTH (advisory — schema v2 GIU NGUYEN, hook KHONG kiem field nay): moi block eval ui-check ghi them field "network_observed:" = chep NGUYEN VAN field networkObserved tu ket qua ui o tren; ket qua ui KHONG co field nay → ghi "n-a (driver)". TUYET DOI KHONG tu suy ra "clean". Vocab chu duy nhat: clean | no-app-traffic | third-party-only | app-fail | n-a (driver) | n-a (tool-error) | unscoped | unscoped-partial — CAM ghi so status/exit tho hay chu 'verdict: FAIL' vao report (bay L1 CONSISTENCY; so tho nam trong evidence/E{id}-network.txt).
run_id cua TUNG eval: chep NGUYEN VAN tu map nay — JS da tinh san va DA GHI vao ${args.repoRoot}/_acceptance/${args.slug}/run-log.jsonl truoc khi ban viet report; hook + CI recheck doi chieu TUNG run_id trong report voi log do (id la/khong khop = BLOCK). TUYET DOI KHONG tu mint/doi/rut gon run_id: ${JSON.stringify(evalRunIds)}\nrun_id cua TUNG LENH SUITE — cung luat, key la cmd. MOI lenh mot khoi theo DUNG khuon SUITE-BLOCK-TEMPLATE trong ban mau o tren — ban mau noi ro ca hinh dang lan cho dat, dung tu che khuon khac. Khoi do BAT BUOC co dong run_id: bo doi chieu quet MOI dong run_id trong bao cao va doi tung ma co mat trong run-log, nen khoi vang run_id la lenh suite khong co dau vet, con ma tu dat la cong do L2 PROVENANCE ngay sau chu ky: ${JSON.stringify(suiteRunIds)}${carriedForReport.length ? `
EVAL CARRY-FORWARD (P1 — delta staleness khong cham paths cua cac eval nay, round nay KHONG chay lai): moi item van la MOT block eval PASS trong bang + Evidence, ghi run_id va verified_at NGUYEN VAN tu payload (id da nam trong run-log tu round goc), exit_code: 0, verifier = field ref, THEM dong "carried_from_round: <N>" va ghi chu 1 dong "carry-forward tu round <N> — delta khong cham paths cua eval". Item ui-check co field screenshot/observed/network_observed trong payload = KHUNG CUA LUOT GOC (cung run_id, anh con tren dia): ghi NGUYEN VAN ba field do vao block carried ("observed: |" roi tung dong noi dung thut le) — may se chen neu ban bo sot; item KHONG co cac field do thi KHONG ghi screenshot:/observed: (may khong bia khung): ${JSON.stringify(carriedForReport)}` : ''}
A/B BASELINE: moi block eval may ghi them field "baseline: <green|red|n-a>" lay tu field "baseline" trong ket qua may o tren (green=pass tren code cu diffBase, red=fail tren code cu nghia la eval CO phan biet, n-a=khong chay duoc tren baseline). Field baseline DUNG TU green/red/n-a, TUYET DOI KHONG ghi exit-code so o day hay trong section Analyst — hook L1 CONSISTENCY se chan oan report PASS neu thay token exit khac 0.${baselineHaTang ? `\nBASELINE BLOCKED HA TANG: ${baselineHaTang}. Mo dau section Analyst bang dong "baseline: BLOCKED ha tang — ${baselineHaTang}"; moi field baseline ghi n-a; danh sach eval khong-phan-biet ben duoi KHONG do duoc o round nay.` : ''}${baselineKhongDo.length ? `\nBASELINE KHONG DO (lenh baseline khong chay hoac khong ra ket qua — field baseline cua chung la n-a): trong section Analyst them muc "Baseline khong do", MOI lenh mot dong "- <cmd>: <ly_do>" chep NGUYEN VAN: ${JSON.stringify(baselineKhongDo)}` : ''}
Them section "## Analyst" ngay sau bang ket qua: liet ke eval KHONG-PHAN-BIET (pass tren CA HEAD lan baseline, chung minh harness chu khong phai feature; nen viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y): ${JSON.stringify(nonDiscriminating)}. ${runBaseline ? 'Rong thi ghi "none — moi eval feature deu red tren baseline (co phan biet)".' : `BASELINE ROUND NAY KHONG DO LAI (P2 — evals.yaml khong doi tu lan baseline cuoi${carriedAnalyst && typeof carriedAnalyst.fromRound === 'number' ? `, round ${carriedAnalyst.fromRound}` : ''}): mo dau section Analyst bang dong "carried tu round ${carriedAnalyst && typeof carriedAnalyst.fromRound === 'number' ? carriedAnalyst.fromRound : 'truoc'} — baseline khong do lai round nay"; field "baseline:" cua tung block eval ghi "n-a" (round nay khong do).`} Lenh suite xanh-ca-hai-phia la regression-guard binh thuong, KHONG liet ke.
VARIANCE-N: eval co field "runs" > 1 = eval NGAU NHIEN (da chay nhieu lan, gop lai). Voi eval do ghi them "runs: <N>" va "pass_rate: <passes>/<runs>" (dang phan so vd "4/5" — DUNG so exit). Eval khong co runs hoac runs=1 (deterministic) KHONG ghi pass_rate. Eval co field "variance": true (pass_rate khac 0 va khac full) → tin hieu PHUONG SAI: feature ngau nhien chua on dinh; verdict tong DA la PENDING-JUDGMENT; ghi eval do vao section moi "## Variance" kem pass_rate de NGUOI quyet nguong o Gate 2 (giong judgment item). Eval deterministic ma variance=true = test flaky/racy → cung vao "## Variance", ghi ro "flaky".\nDinh nghia eval (ghi "verifier:" = field "ref" — config: ref GOC, hook L2 chi chap nhan config: ref hoac script path, KHONG ghi lenh resolved): ${JSON.stringify(args.evals.map(e => ({ id: e.id, criterion: e.criterion, executor: e.executor, ref: e.ref, expected: e.expected, evidence_required: e.evidence_required })))}\nJudge panels (DE XUAT — ghi de xuat panel + rationale tung judge, de human_override TRONG cho moi item; T3 thi MOI judgment item deu cho human). QUAN TRONG format: trong section judge, ghi vote dang "- <lens>: FAIL — <rationale>" / "- <lens>: PASS — ...", TUYET DOI KHONG dung chuoi "verdict: FAIL" (hook L1 CONSISTENCY scan token nay trong report PASS) — moi dissent phai hien thi day du, khong duoc om/viet lai. Panel co "carried": true (P3) = inputs khong doi tu round "fromRound" (hash khop) nen KHONG cham lai: ghi ro "panel giu nguyen tu round <fromRound> — inputs khong doi, khong cham lai; rationale xem round do", votes carried chi co lens+verdict (ghi "- <lens>: <verdict> (r<fromRound>)"). Panel co "ungrounded": true = eval KHONG khai input nao nen KHONG hoi dong nao duoc cham (votes rong la DUNG, khong phai thieu du lieu): ghi ro "khong khai input — may khong co can cu, nguoi quyet o Cong 2" va de human_override TRONG; TUYET DOI khong ghi no nhu mot muc da dat: ${JSON.stringify(panels)}\n\nSau do soan NOI DUNG file thu hai review-findings.md — TRA VE trong field "findings", KHONG ghi file (informational, NGOAI hook — TUYET DOI khong them section/field nao cua no vao evidence-report.md).\nFile nay chia theo ket qua SCOPE-TRIAGE, moi finding ghi title, file:line, severity, detail, source:\n- "## Trong hợp đồng" — findings da map duoc vao AC; moi dong ghi them "AC: <acRef>". Findings: ${JSON.stringify(triaged.filter(f => f.inContract && !f.unverified))}\n- "## Ngoài hợp đồng — người quyết ở Gate 2" — findings THAT nhung khong AC nao phu. Mo dau ngan bang DUNG mot cau: "Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa." Roi MOI MUC viet DUNG khuon duoi day, KHONG doi thu tu dong, KHONG bo dau gach dau dong hay hai dau sao (bo doc lai file nay bang may — sai khuon la khoi bien mat khoi the, khong bao loi):\n${OOC_ITEM_TEMPLATE}\n{plain} chep NGUYEN VAN truong plain (cot "Nguoi dung gap gi" the Cong 2 in ra cho nguoi quyet doc); {can_cu} chep NGUYEN VAN truong can_cu (cot "Can cu"; rong thi de trong sau dau hai cham); {proposal} chep NGUYEN VAN tu truong proposal cua finding — gia tri hop le: ${OOC_GLOSS}. TUYET DOI khong doi sang gia tri khac. Findings: ${JSON.stringify(triaged.filter(f => !f.inContract && !f.unclassified))}\nCARRIED (T5 — muc ngoai hop dong tu round TRUOC, round nay KHONG cham lai): ${carriedFindings.length ? `${carriedFindings.length} muc — MAY tu chen vao muc "## Ngoài hợp đồng" sau khi ban tra ve, mang nhan "(r<N>)"; KHONG in lai cac muc nay (titles: ${JSON.stringify(carriedFindings.map(c => c.title))})` : "khong co"}\n${triaged.some(f => f.unclassified) ? '- "## Chưa phân loại (triage-failed)" — buoc phan loai pham vi hong nen KHONG finding nao duoc coi la trong hop dong; mo dau bang dong "phân loại phạm vi không chạy được — không lỗi nào bị máy tự sửa, người xem lại toàn bộ". Findings: ' + JSON.stringify(triaged.filter(f => f.unclassified)) + '\n' : ''}- Finding co unverified=true liet ke RIENG duoi heading VIET DUNG NGUYEN VAN "## Chưa adversarial-verify (refuter chết)" (bat buoc muc ##: heading khac cap hoac dong tran se lam cac muc nay bi may doc nham thanh finding ngoai-hop-dong tren the): ${JSON.stringify(confirmedFindings.filter(f => f.unverified))}\n${coverageCluster ? `Cuoi file ghi DUNG mot dong co: "⚠ Cụm ngoài vùng phủ: ${coverageCluster.count}/${coverageCluster.total} lỗi rơi vào file không bộ đo nào phủ (${coverageCluster.files.join(', ')}) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi."\n` : 'Cuoi file ghi DUNG mot dong: "Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm)." TUYET DOI khong bia co canh bao.\n'}Tra ve {report, findings} — hai CHUOI NOI DUNG day du, khong phai duong dan.`,
  { label: 'synthesize:report', phase: 'Synthesize', schema: REPORT_SCHEMA, ...vaiOpt('synthesize') }
)

// Chốt máy trường-của-người NGAY sau synthesize, TRƯỚC khi trả report cho vòng chính (hồ sơ
// chot-may-chu-ky-sau-synthesize). Giờ engine của khối carry = đúng giá trị prompt đã đưa
// (carriedForReport); mọi khối khác = invokedAt. Thiếu giờ mà báo cáo có verified_at →
// BLOCKED có tên (không để lại giờ tác tử đặt). Chốt đổi dòng nào thì NÓI RA: một dòng run-log.
const gioTheoRunId = {}
for (const c of carriedEvals) gioTheoRunId[c.runId] = c.verifiedAt || invokedAt
const chot = chotTruongNguoi(chenKhungCarry(String((report && report.report) || ''), carriedForReport), { invokedAt, gioTheoRunId })
if (chot.loi) {
  blocked.push({ cmd: 'chot-truong-nguoi', reason: chot.loi })
  verdict = 'BLOCKED'
  const tIdx = runLogLines.map(l => { try { return JSON.parse(l).kind } catch (_) { return null } }).lastIndexOf('round-tally')
  const tCu = tIdx >= 0 ? (() => { try { return JSON.parse(runLogLines[tIdx]) } catch (_) { return null } })() : null
  const tMoi = tallyLine('BLOCKED', blocked.length, tCu ? tCu.expected : 0, tCu ? tCu.returned : 0)
  if (tIdx >= 0) runLogLines[tIdx] = tMoi
  else runLogLines.push(tMoi)
  log('Chot truong nguoi: ' + chot.loi + ' — BLOCKED, report rong')
} else if (Object.values(chot.doi).some(n => n > 0)) {
  runLogLines.push(JSON.stringify({
    ts: invokedAt, ...(invokedSha ? { sha: invokedSha } : {}), round: args.round, kind: 'chot-truong-nguoi', ...chot.doi,
  }))
  log('Chot truong nguoi: tac tu tong hop da viet vao truong khong thuoc quyen no — ' + JSON.stringify(chot.doi) + ' (da ep lai, ghi mot dong run-log)')
}

return {
  verdict,
  failedEvals: failedEvalIds,
  failedCommands,
  blocked,
  panels: panels.map(p => ({ evalId: p.evalId, proposal: p.proposal, ...(p.carried ? { carried: true, fromRound: p.fromRound } : {}), ...(p.ungrounded ? { ungrounded: true, note: p.note } : {}) })),
  // Đợt 5: main loop in cho user round này carry gì (minh bạch ở Gate 2)
  carried: { evals: carriedEvals.map(c => c.id), panels: carriedPanels.map(p => p.evalId), baseline: !runBaseline, findings: [...carriedKeys] },
  confirmedFindings,
  triaged,
  triageFailed,
  rejectFindings,
  boNgoaiVat: boNgoaiVat.map(f => ({ file: relFile(f), title: f.title, source: f.source || '' })),
  // Làn CỐ Ý không spawn phải để lại vết máy-đọc-được: «0 finding» và «không làn nào
  // chạy» trông y hệt nhau trong result, nên bằng chứng Cổng 2 sẽ đọc là «đã soi, không
  // thấy gì». Cùng lập luận đã áp cho boNgoaiVat (lượt chấm 1 bắt chỗ chưa áp).
  finders: { chay: REVIEWERS_ACTIVE.map(d => d.key), boQua: REVIEWERS.filter(d => !REVIEWERS_ACTIVE.includes(d)).map(d => d.key) },
  coverageCluster,
  reviewIncomplete,
  nonDiscriminating,
  // BASELINE-LENH: lý do làn đối chứng không đo (hạ tầng / trần / bỏ qua tệp mới) — máy-đọc-được cho vòng chính.
  baselineKhongDo: { haTang: baselineHaTang || null, lenh: baselineKhongDo },
  variance: varianceCmds.map(m => ({ cmd: m.cmd, evals: m.evals, runs: m.runs, passRate: m.passes + '/' + m.runs })),
  // run-log: JS tính dòng, MAIN LOOP ghi — thứ tự bắt buộc: (1) append runLog vào
  // run-log.jsonl, (2) ghi report/findings từ hai chuỗi dưới. Hook L2 đối chiếu
  // run_id trong report với log, nên log phải nằm trên đĩa trước report.
  runLog: (ghiLoaiVang(runLogLines), runLogLines),
  runLogWriteFailed,
  report: chot.loi ? '' : chot.text,
  // Mục carry do MÁY chèn (AC-3) — chỉ khi tác tử trả bản findings; rỗng = tác tử chết, lượt chạy lại.
  findings: chot.loi || !(report && report.findings) ? '' : chenMucCarry(report.findings, carriedFindings),
  ...khoaLoaiVang(),
}
