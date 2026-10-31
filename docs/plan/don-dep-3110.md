# Dọn dẹp trước lộ trình chính — kiểm kê và kế hoạch (31/10)

Chủ kho giao 31/10: «tôi muốn làm một lần dọn dẹp trước khi chạy các phiên của lộ trình chính crm». Tệp này là
phần **kiểm kê và kế hoạch**: chưa xoá, chưa đóng, chưa đẩy gì. Mọi việc xoá, đóng hay đẩy chỉ làm khi giám sát Mac
Studio chuyển lời duyệt của chủ kho.

- Đo trên Mac Studio, kho `/Users/manh-macmini/dev/crm`, `origin/onehub` từ `aeb8b8152` tới `50ba6e6eb` (#595 gộp
  giữa lúc đo, 31/10 khoảng 09:15Z). Số nào đo trước #595 thì ghi rõ.
- Phần design-floor do phiên «Design-floor crm · nâng bậc» lo; ở đây không xét.
- Không đụng: worktree `thiet-lap-kit-2-36`, `dot-ban-do-khuon-3010`, worktree của phiên design-floor
  (`chu-thich-glob-md-65b44d`, nhánh `docs/nghien-cuu-design-floor-crm`), vùng và worktree của MacBook Pro và M5.

## Tóm tắt

| Nhóm | Số đo | Loại việc |
| --- | --- | --- |
| Worktree | 11 mục; 6 mục không còn phiên nào dùng, cộng 4 bản sao `git clone` ở `/T` | A, B |
| Nhánh cục bộ | 71 nhánh; 52 đã gộp vào `onehub` và không worktree nào giữ; 13 chưa gộp | A, B |
| Nhánh remote | 14 nhánh chưa gộp; 5 tham chiếu `pr/*` cục bộ đã gộp | B |
| PR mở lâu | #499 (12 ngày, 2285 commit sau `onehub`), #509 (11 ngày, T3, người ngoài) | B |
| Cổng Giá trị | 201 hồ sơ chờ; 78 ngưỡng chưa chốt; 52 quá timebox | B, C |
| Cửa veto | 105 hồ sơ cửa veto mở; 7 hồ sơ `machine-cleared` chưa ai ký | B |
| Paths chết (F19) | 9 hồ sơ đã ký, 10 mục `paths` không trỏ tới tệp nào | C |
| Đỏ sẵn trên nền | 0 hồ sơ mang nhãn trên `onehub`; 1 dòng `nen-do` nằm trong #499 chưa gộp | B |
| Lộ trình | 35 hàng ghi «chưa mở» mà đã gộp; 2 hàng khai lệch khác; 1 hàng trễ hạn (DH11) | A |
| Nợ giao diện | 34 thẻ `<hN className>` · 10 `spacing={0}` · 11 tệp `AlertDialog` · 7 tệp `navigator.clipboard` · 3 tệp `SECTION_TITLE` · `NhomDaBo` | C |
| CI | `test (api)` và `test (app-ui)` **đỏ cố định**, không chập chờn: 4 ca đỏ trên mọi lượt CI đủ từ 28/10 | C (đi đầu) |
| Máy | ổ trong còn 100 GiB trống (78 %); Docker thu hồi được 34,7 GB; `/T` 19 GB | A, B |

## 1. Git và worktree

### Worktree

Lệnh: `git -C /Users/manh-macmini/dev/crm worktree list --porcelain`, rồi với từng mục `git status --porcelain`,
`git merge-base --is-ancestor <HEAD> origin/onehub`, `du -sh`. Phiên còn sống đối chiếu bằng danh sách phiên của app.

Có **11** mục (brief ghi 9; hai mục thêm là `dot-ban-do-khuon-3010` và worktree của phiên này).

| Worktree | HEAD | Đã vào `onehub` | Thay đổi chưa commit | Phiên dùng | `du` | Xếp |
| --- | --- | --- | --- | --- | --- | --- |
| `/Users/manh-macmini/dev/crm` (chính, `onehub`) | `aeb8b8152` | có | 5 tệp chưa track (mục dưới) | giám sát, «bản đồ khuôn» | — | giữ |
| `/T/bkr-khong-doi-nxfcCX/crm` (detached) | `a3138b29c` | có | 0 | không | 3,8G | A1 |
| `/T/ctbp-hai-chieu-fiyeMA/crm` (detached) | `6b158c6b7` | có | 4354 tệp `D` — bản sao bị xoá dở | không | 450M | A1 |
| `/T/ctbp-hai-chieu-sa1jd2/crm` (detached) | `39448ab1d` | có | 1 dòng: `void datTu(null);` trong `phan-can-cap-nhat.tsx` — đột biến của lượt đo bị bỏ lại | không | 637M | A1 |
| `/T/htb-khong-doi-yAzVyY/crm` (detached) | `043848c22` | có | 0 | không | 1,5G | A1 |
| `.claude/worktrees/agent-a798442a1bb909308` (`worktree-agent-a798442a1bb909308`) | `59697fa4e` | có | proto `cap-nhat-trong-ngan-kr` + 2 dòng `catalog.ts`, `registry.ts` | không | 3,7G | B1 |
| `.claude/worktrees/ve-khung-muc-tieu-dung-kr-b601db` (detached) | `d7172c268` | có | 0 | không | 11G | A1 |
| `.claude/worktrees/chu-thich-glob-md-65b44d` | `aeb8b8152` | có | 0 | design-floor | 8,9G | không đụng |
| `.claude/worktrees/cua-toi-don-vi-dan-khi-cay-loi-41c5ba` | phiên này | — | — | phiên này | 6,5G | giữ |
| `.claude/worktrees/dot-ban-do-khuon-3010` | `7fa455f9f` | chưa | 0 | «bản đồ khuôn» | 4,5G | không đụng |
| `.claude/worktrees/thiet-lap-kit-2-36` | `300e5bd46` | có (#595 gộp 31/10) | 0 | giám sát | 5,1G | không đụng; gỡ khi giám sát cho |

Proto trong `agent-a798…`: chín tệp dưới `apps/app/app/proto/_modules/cap-nhat-trong-ngan-kr/` giống từng byte bản trên
`onehub` (so bằng `git show origin/onehub:<tệp> | diff -q - <tệp>`), và `catalog.ts`, `registry.ts` trên `onehub` đã có
mục `cap-nhat-trong-ngan-kr`. Phần chưa commit là bản nháp của proto đã gộp, nên mất nó không mất gì.

`du` đếm cả `node_modules` là bản sao APFS từ `~/.bun`, nên số thật nhả ra nhỏ hơn tổng cột `du` (bài học 26/10: `du`
báo 47G, `df` thật 15,5G). Đo nhả bằng `df` trước và sau.

Ngoài worktree, `/T` còn **4 bản `git clone`** (không phải worktree) `tmp.ERlTMWImJ4`, `tmp.XTsRMTUcBy`,
`tmp.fknAMGHdxQ`, `tmp.wUNzAE2XIH` (mỗi bản 1,4G) và vài thư mục `tmp.*` 0,6–1,4G — dấu vết của bước vẽ bản đồ
`git clone --no-hardlinks`. Toàn `/T`: 7439 mục, 19G (`du -sh $TMPDIR`).

### Năm tệp tín hiệu chưa track ở checkout chính

Lệnh: `git -C /Users/manh-macmini/dev/crm status --porcelain`, đọc từng tệp, tra `slug` trong ba tệp lộ trình và
`_acceptance/`.

Năm tệp `tin-hieu/crm/vo-khu-muc-tieu-*.json` không phải tín hiệu của người dùng: chúng mang `phien` (V1, V2) và
`loai` `hang-moi`/`viec-phu` — đề xuất hàng của phiên thợ đợt `vo-khu-muc-tieu` (đã đóng), rơi vào cửa tín hiệu.

| Tệp | Đề xuất | Đã xử ở đâu |
| --- | --- | --- |
| `V1-5` | `gon-dau-trang-lay-y-kien` | VK13, hồ sơ đã ký |
| `V2-4` | `doi-nhan-khu-muc-tieu` (đổi nhãn «Dây căn chỉnh») | VK4, hồ sơ đã ký; `git grep` không còn chữ cũ |
| `V1-7` | `suc-khoe-bao-loi-quyen` | chưa có hàng, chưa có hồ sơ |
| `V1-8` | `huy-hieu-hoi-y-co-thuoc` | chưa có hàng, chưa có hồ sơ |
| `V1-15` | `hang-cong-cu-bo-okr-mot-dong` | chưa có hàng, chưa có hồ sơ |

→ B2.

### Nhánh

Lệnh: `git fetch origin --prune`; `git branch --merged origin/onehub`; `git branch --no-merged origin/onehub`;
`git log --no-merges origin/onehub..<nhánh>`; `git cherry origin/onehub <nhánh>`; PR qua `gh pr list --head <nhánh>`.

- Cục bộ **71** nhánh. **52** đã gộp vào `onehub` và không worktree nào đang giữ → A2. Sha đỉnh từng nhánh ở phụ lục A.
- Cục bộ chưa gộp **13** (bảng dưới, trừ hai nhánh không đụng).
- Remote chưa gộp **14** (đo trước #595): 3 có PR mở (#499, #509, #594), 1 là `chore/thiet-lap-kit-2-36` (#595 đã
  gộp sau đó), 10 không PR nào mở.
- Năm tham chiếu `pr/294`, `pr/297`, `pr/374`, `pr/405`, `pr/422` (tạo 07–15/10) đã gộp → A2.
- `git stash list`: 0.

| Nhánh cục bộ chưa gộp | PR | Commit riêng (`cherry +`) | Đỉnh | Đề xuất |
| --- | --- | --- | --- | --- |
| `chore/ghim-sau-kara-mot-ten` | #411 đóng | 2 | `344097ec9` | xoá cả remote (B3) |
| `chore/nhan-kit-2-30` | #413 gộp | 1 (vẽ lại bản đồ) | `9a48976fe` | xoá (A2b) |
| `chore/re-mo-hinh-mac-dinh` | không | 23, sau `onehub` 4051 | `d8372a37c` | B3 |
| `docs/ci-tach-job-de-xuat-hang` | không | 3 | `5dbb431da` | xoá (B3) |
| `feat/cap-nhat-gan-day` | #574 gộp | 20 (bản trước khi đẩy lại) | `5f41ebd64` | xoá (A2b) |
| `feat/ly-do-tu-choi-nop-theo-locale` | #337 gộp | 0 | `a88053406` | xoá (A2b) |
| `feat/sua-sau-chay-that` | #410 gộp | 1 (merge) | `bbdd8d9c5` | xoá (A2b) |
| `fix/ci-test-duoi-tran` | #305 đóng | 13 | `7063f7b40` | xoá cả remote (B3) |
| `fix/khung-chat-cuon-duoc` | không | 1 (S0 tái hiện) | `4d8456645` | B3 |
| `fix/kiem-cheo-dung-lai-cay` | #396 đóng | 0 | `a27d88e2c` | xoá (A2b) |
| `fix/mien-so-chup-cho-bo-okr-mau` | không | 12, có «Gate 2 signoff» | `1a844557b` | B3 |
| `proto/bo-okr-la-noi-hop` | không | 2 | `1cab9daeb` | xoá cả remote (B3) |
| `thu/ci-tach-job` | #323 đóng, «KHÔNG GỘP» | 2 | `8a1154d1f` | xoá cả remote (B3) |

| Nhánh remote chưa gộp, không PR mở | Commit riêng | Đỉnh | Đề xuất |
| --- | --- | --- | --- |
| `origin/feat/dieu-huong-okr` | 4 (proto 14/10) | `706ba494a` | B3 |
| `origin/feat/so-do-can-chinh-okr` | 1 (proto 14/10) | `6e98e80e5` | B3 |
| `origin/feat/vo-khu-muc-tieu` | 4 (18/10) | `2790552ac` | B3 |
| `origin/fix/do-phu-khong-gia-dinh-cay-trong` | 2, PR #505 đóng | `dc12fcf36` | B3 |
| `origin/chore/rang-khung-trang-mo` | 2 (30/10, BK3) | — | không đụng: nhánh của BK3 |

## 2. PR mở lâu

Lệnh: `gh pr view <n> --json …`, `git rev-list --count origin/<nhánh>..origin/onehub`.

| PR | Mở từ | Nội dung | Tình trạng | Khuyến nghị |
| --- | --- | --- | --- | --- |
| [#499](https://github.com/phanlemanh/crm-onehub/pull/499) `chore/giu-tuoi-sau-489` | 19/10 | giữ tươi 7 hồ sơ sau #489 trên khoảng `be5151e..4206083`, ghi một dòng `nen-do` cho `okr-soat-anh-luot-3` E9, E13 | sau `onehub` 2285 commit; `verified_commit` nó ghi là 4206083, đã bị hàng chục lượt ghim lại sau đè | **đóng** (B4): dòng ghim của nó không còn đúng với cây nào sẽ gộp; dòng `nen-do` nếu còn cần thì làm lại trên nền mới |
| [#509](https://github.com/phanlemanh/crm-onehub/pull/509) `feat/chi-phi-ads` | 20/10, tác giả commit `doviettuan…` | bảng `ChiPhiAds` + migration + cầu REST `/rest/ad-spend` | chạm `packages/db/prisma` → T3; không hồ sơ `_acceptance`; mốc migration `20261020150000` nằm giữa sáu migration đã lên `onehub` sau đó; sau `onehub` 2144 commit | **chủ kho quyết** (B5): việc của người khác, có client đang chờ ở kho AdsProductfeed |
| [#594](https://github.com/phanlemanh/crm-onehub/pull/594) `docs/gom-tin-hieu-3110` | 31/10 | bản gom 17 tín hiệu thành 8 nhóm | chờ chủ kho đọc | chỉ ghi nhận |

## 3. Hồ sơ `_acceptance`

Lệnh: `node ~/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.36.0/scripts/start-scan.mjs --root .`
trên cây `aeb8b8152` (trước #595), rồi `jq` đếm theo `groups`, `flags`, `vetoOpen`, `vetoOpenUnsigned`, `broken`,
`loTrinh`.

- `gates` 201 (cả 201 là `cho-cong-gia-tri`) · `inProgress` 4 · `considering` 9 · `done` 161 · `broken` 1
  (`ban-mau-okr` — #595 đã khép).
- Cờ: `nguong-chua-chot` 78 · `qua-timebox` 52 (7 hồ sơ mang cả hai).

### Cổng Giá trị: 78 ngưỡng chưa chốt, 52 quá timebox

Kit 2.36 cho đúng **hai lối** với một ngưỡng còn `…` hay `[đề xuất]` (`skills/uat-session/SKILL.md`, điều kiện
đầu): điền ngưỡng vào ô, hoặc khai một dòng `Không đo được — <lý do>` trong mục «Ngưỡng chết / ngưỡng UAT» kèm một
dòng sổ quyết định. Mục «Cho một hồ sơ nghỉ» của `GUIDE.md` là lối khác: cho hồ sơ **đã ký** thôi bị chấm ở lưới
trước-merge khi lời hứa không còn kiểm lại được — nó không chốt ngưỡng Cổng Giá trị.

Chia 78 hồ sơ ngưỡng chưa chốt theo `surfaces` của `contract.md`:

- **27 hồ sơ không có mặt giao diện** (`tooling`, `ci`, `cli`, `api`, `agent`, hay rỗng) — phần lớn là vệ sinh thước
  và CI, không có người dùng cuối để mở phiên nghiệm thu. Ứng viên khai «Không đo được» (B6). Danh sách ở phụ lục B.
- **51 hồ sơ có mặt giao diện** — người dùng thật bấm vào được. Ngưỡng nên điền, không khai «không đo được». Đây là
  việc dài, thành hàng C.

52 hồ sơ quá timebox: đã qua hạn tự khai trong `opportunity.md` mà chưa có phán quyết giá trị. Chúng không chặn
gộp, nhưng làm thẻ đầu phiên dài và che việc thật. Lối nhanh nhất: chủ kho đọc theo nhóm (khu Mục tiêu, Kara, tín
hiệu, vệ sinh) và ghi một phán quyết cho cả nhóm — giữ, bỏ, hay lùi hạn (B7). Danh sách ở phụ lục B.

### Bảy hồ sơ cửa veto mở mà chưa ai ký

Lệnh: `jq '.vetoOpenUnsigned' start-scan`, đọc `status`, `veto_state`, `veto_opened_at` từng `contract.md`.
105 hồ sơ có `veto_state: mo`; chữ ký người ở Cổng Bằng chứng đóng cửa veto, nên 98 hồ sơ đã ký coi như đóng. Còn 7
hồ sơ `machine-cleared` (làn V, không chữ ký người), cửa mở từ 06/09 tới 04/10:

| Hồ sơ | Mở cửa veto |
| --- | --- |
| `go-khoa-goc-nhin` | 06/09 |
| `moi-phia-deu-thay-ke-hoach` | 22/09 |
| `test-api-khong-de-viec-vo-chu` | 24/09 |
| `o-so-tien-doc-theo-tieng` | 24/09 |
| `tien-te-chua-tai-khong-doan` | 24/09 |
| `khoa-rieng-dien-node` | 25/09 |
| `nop-ban-nhap-chon-theo-khoa` | 04/10 |

→ B8.

### Paths chết (F19)

Lệnh: script đọc mọi `evals.yaml` của hồ sơ `signed-off` hoặc `machine-cleared`, đổi từng mục `paths` thành biểu thức
glob và so với `git ls-files` (`$SCRATCHPAD/paths-chet.mjs`). **9 hồ sơ, 10 mục** không trỏ tới tệp nào:

| Hồ sơ | Mục chết |
| --- | --- |
| `cay-can-chinh-co-ly-do` | `apps/app/app/(app)/[slug]/okr/cay-can-chinh.tsx`, `apps/app/test/cay-can-chinh-ly-do.dom.tsx` |
| `cho-tac-nhan-lau` | `apps/app/lib/thong-bao*.ts` |
| `goi-y-mo-ke-hoach` | `packages/validation/src/goi-y-ke-hoach.ts` |
| `hoi-dap-okr` | `apps/agent-okr/agent/instructions.md` |
| `kara-gop-y-luot-2` | `apps/app/lib/okr-search-params.ts` |
| `ngan-kr-mot-cho` | `apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx` |
| `quyet-gop-y-noi-dung-ly-do` | `apps/app/test/gop-y-dung-cho-k3c.dom.tsx` |
| `toan-canh-okr` | `apps/app/app/(app)/[slug]/okr/suc-khoe/**` |
| `tro-ly-okr-nen` | `packages/db/src/okr-can-chinh.ts` |

Một mục chết tắt bộ lọc cũ hoá của cả hồ sơ (`staleByPaths` đóng mặc định), nên hồ sơ ấy bị đòi ghim lại sau mọi PR.
Sửa `evals.yaml` của hồ sơ đã ký là sửa thước: luật tạm 18/10 cấm máy tự sửa → C2, cần chủ kho cho.

### Đỏ sẵn trên nền

Lệnh: `node -e` gọi `nhanHoSo()` của `lib/do-san-tren-nen.cjs` cho từng thư mục `_acceptance/*`; `grep` dòng
`"kind":"nen-do"` trong mọi `run-log.jsonl`.

Trên `onehub`: **0** hồ sơ mang nhãn, **0** dòng `nen-do`. Dòng `nen-do` duy nhất (`okr-soat-anh-luot-3` E9, E13) nằm
trong #499 chưa gộp → theo B4.

### Hồ sơ đang treo không thuộc hàng nào

`start-scan` báo 10 hồ sơ «đang mở mà không thuộc việc nào trong kế hoạch»: chín hồ sơ «đang cân nhắc»
(`mo-o-dau`, `tim-trong-phan-khuc`, `bo-cao-noi-khi-hong-mot-phan`, `phan-tich-cau-hinh-bo-cao`,
`agent-doi-truong-theo-quyen`, `ma-tran-bam-khong-dong-hop`, `the-gop-y-cot-cuon-rieng`, `the-gop-y-sua-nhanh`,
`the-thong-tin-ca-nhan`) và `thuoc-cua-lat-3a-co-rang` (đã duyệt, vật đã ở nhánh gốc; kit hỏi «đóng theo quan sát
hay chấm lại»). Thêm `chu-thich-glob-md`: hồ sơ còn «sắp mở vòng» mà hàng F36 đã gộp ở #507. → B9.

## 4. Lộ trình

Lệnh: phần `loTrinh` của `start-scan` (chỉ đọc `lo-trinh-okr.json`); với hai tệp còn lại, `jq` đối chiếu
`trang_thai` của từng hàng với `status` của `_acceptance/<slug>/contract.md`; sha gộp bằng
`git log origin/onehub --first-parent --diff-filter=A -- _acceptance/<slug>/evidence-report.md`.

Ba tệp: `lo-trinh-okr.json` 193 hàng · `lo-trinh-viec-du-an.json` 28 · `lo-trinh-kho-tai-lieu.json` 15. Không mã hàng
trùng, không `khoa` trùng giữa ba tệp.

**35 hàng ghi «chưa mở» mà hồ sơ đã ký và đã gộp** (đúng ca brief nêu: NM1 đã gộp #388):

| Tệp | Hàng → PR gộp |
| --- | --- |
| `lo-trinh-okr.json` (31) | N1 #385 · C #419 · K6a #389 · E5 #408 · LT2 #374 · NM1 #388 · NM2 #418 · NM3 #431 · LT1b #371 · DH12 #515 · DH13 #530 · LT1f #497 · F8 #423 · K2f #426 · L2 #384 · L3 #390 · L4 #395 · E6b #382 · NM4 #400 · V2a #383 · V2b #392 · V2c #440 · V2e #393 · V2f #401 · F23 #427 · F24 #406 · F31 #439 · F34 #590 · VN1 #472 · VS11 #575 · K7c #576 |
| `lo-trinh-viec-du-an.json` (1) | DA13 |
| `lo-trinh-kho-tai-lieu.json` (3) | l3b · cb · MH4 |

Lệch khác:

- MH1 khai «đang dựng», hồ sơ đã giao.
- F36 khai «đã lên onehub» (#507), hồ sơ `chu-thich-glob-md` còn «sắp mở vòng».
- DH4 khai hạng T2, hồ sơ T3.
- F32 tự khai xong mà không có hồ sơ `paths-judgment-hep`.
- E4b đang mở vòng mà chưa thuộc mốc nào.
- DH11 (Vỏ khu Mục tiêu) có hạn 26/10, đã trễ.

Nhiều hàng trong 35 hàng mang `buoc_ke` «R2 — lên production 31/10 (tạm)». Đó là việc vận hành sau gộp; luật 17/10
«bỏ mốc ngoài» không cho nó đứng thành trạng thái hàng. → A3.

## 5. Nợ giao diện còn sống trên `origin/onehub`

Lệnh: `git grep` trên `origin/onehub`, `apps/app/**`, trừ `apps/app/app/proto/**` trừ khi ghi khác.

| Mẫu | Số đo | Nơi | Đã có hàng lo chưa |
| --- | --- | --- | --- |
| `<hN className=…>` | 34 chỗ / 23 tệp (31 chỗ là chuỗi `className="…"`; brief đếm 27); 91 chỗ nếu tính proto | `(app)` 16 · `agent-builder` 7 · `landing` 4 · `(landing)` 3 · `crm` 2 · `detail-sheet`, `auth-shell` | chưa |
| `spacing={0}` | 10 chỗ / 7 tệp (18 nếu tính proto) | `cap-nhat-tuan.tsx` 2, `overview-scope.tsx` 2, `trang-lo-trinh.tsx` 2, `moi-kr.tsx`, `khoi-kenh.tsx`, `activity-composer.tsx`, `timeline.tsx` | NM2 nêu chung |
| `AlertDialog` ráp tay | 11 tệp (13 nếu tính proto) | Cài đặt: `api-keys`, `connections` ×4, `notifications/khoi-zalo`, `sso`, `tracking` · `agent-builder` ×3 | chưa |
| `navigator.clipboard` | 7 tệp | `slack-channels`, `phat-chia-dialog`, `khoi-zalo`, `tracking-script`, `agent-builder-chat`, `share-chat-dialog`, `setup-prompt-button` | chưa |
| `SECTION_TITLE` | 3 tệp (+1 proto) | `kr-sheet.tsx`, `timeline.tsx`, `detail-sheet.tsx` | `kr-sheet` thuộc BK1 |
| `NhomDaBo` gập | 1 chỗ: `apps/app/app/(app)/[slug]/okr/cua-toi.tsx:63` | Của tôi | VK19 nêu «Đã bỏ» |
| `kr-sheet.tsx`, `so-kr-sheet.tsx` ngoài `RecordSheetFrame` | 2 tệp | `components/crm/record-sheet/` | **BK1** (vùng M5) |

Cách chia:

- **Để hàng răng lo, không dọn tay trước**: mọi mẫu trong bảng «Dấu hiệu vẽ tay» của `docs/design.md` sẽ thành luật
  `anti-slop` trong `tools/oxlint`. Sửa tay từng chỗ bây giờ rồi dựng răng sau là làm hai lần, và không gì giữ chỗ đã
  sửa khỏi tái phát. BK2, BK3 là hai răng đầu (khung ngăn, khung trang); răng vẽ tay đi sau, theo cùng khuôn (C4).
- **Dọn trước lộ trình chính**: không mẫu nào. Không mẫu nào chặn BK1–BK3 hay SV9/SV10; `kr-sheet` đã là của BK1.
- **Ngoại lệ đáng làm sớm**: 11 tệp `AlertDialog` và 7 tệp `navigator.clipboard` tập trung ở Cài đặt và
  `agent-builder` — hai khu lộ trình chính không chạm. Có thể chạy song song cùng dãy lộ trình mà không giẫm vùng (C5).

## 6. CI: không phải chập chờn

Lệnh: `gh pr checks 594`; `gh run view <run> --log-failed | grep "(fail)"` cho 11 lượt CI từ 28/10 21:12Z tới 31/10
08:59Z.

Cả 11 lượt CI đủ (PR sẵn sàng, không nháp) đều đỏ ở **cùng bốn ca**, trên đủ loại PR — tài liệu (#594), tín hiệu
(`tin-hieu/keo-ve`), kit (`chore/nhan-kit-2-36`, `chore/thiet-lap-kit-2-36`), tính năng
(`feat/cap-nhat-trong-ngan-kr`). Các lượt «success» xen giữa là lượt nháp chỉ chạy job nhẹ. Đây là đỏ cố định trên nền
`onehub`, không phải chập chờn; nếp «`test (api)` chập chờn không chặn» đang che nó.

| Job | Ca | Dòng log nguyên văn (lượt `41149763596`, #594, 31/10) |
| --- | --- | --- |
| `test (app-ui)` | `packages/ui/test/pre-push-da-chung.spec.ts:457` — `dau-hook (e): chuoi ngay 13 roi 15` | `00:24:40.2345485Z (fail) dau-hook > dau-hook (e): chuoi ngay 13 roi 15 [891.00ms]`, trước đó `error: expect(received).toEqual(expected)` · `Expected  - 1` · `Received  + 5` (`"check-types", "lint", "lint:slop", …`) |
| `test (api)` | `apps/api/test/mat-khau-lien-ket.spec.ts:153` — móc dọn (`(unnamed)`) | `00:39:41.3872140Z Foreign key constraint violated on the constraint: \`viec_nguoiGiaoId_fkey\` [user.deleteMany]` |
| `test (api)` | `apps/api/test/vai-chi-okr.spec.ts:1175` — `gan-vai: … chu so huu cuoi khong bi ha` | `00:39:43.5212934Z ##[error]Expected promise that rejects` · `Received promise that resolved: Promise { <resolved> }` |
| `test (api)` | `dgt-thuoc: đúng đáp án viết tay trên kho mẫu, chỉ đọc, gieo luỹ đẳng` | `00:39:44.1435743Z (fail) dgt-thuoc > dgt-thuoc: … [320.00ms]`. Dòng `expect` của ca này không tìm thấy trong log: **chưa rõ** |

`test (api)`: `2167 pass`, `3 fail`. Lượt `41147938992` (31/10 00:02Z) đỏ thêm `do-phu > do-phu: E11 …`; lượt
`40904086708` (29/10) đỏ thêm hai ca `tlk-ranh-gioi` ở `test (con-lai)` — hai ca này chỉ xuất hiện một lần, nên mới
đúng là chập chờn.

Ước cỡ chẩn: ca `dau-hook (e)` — nhỏ (một bài thuần git, chạy riêng một tệp được). Ca FK `viec_nguoiGiaoId_fkey` và
`vai-chi-okr` — nhỏ tới vừa (thứ tự dọn dữ liệu bài kiểm sau khi thêm bảng `viec`; một ca quyền chủ sở hữu cuối).
`dgt-thuoc` — chưa rõ tới khi tái hiện. Tổng: một hàng C, khoảng nửa ngày giờ máy, **đi đầu** (C1).

## 7. Máy

Lệnh: `df -h`; `docker system df`; `du -sh` các thư mục; `jq` trên `~/.claude/plugins/installed_plugins.json`;
`ps -axo pid,rss,etime,command`; `sysctl vm.swapusage`.

- Ổ trong: `/System/Volumes/Data` 335 GiB đã dùng, **100 GiB trống** (78 %). Ổ ngoài `LuuTru` 901 GiB trống.
- Docker: 80 ảnh, 3 đang dùng, **34,71 GB thu hồi được** (91 %); 30 ảnh `eve-sandbox-template`; 20 container đã thoát;
  volume thu hồi được 2,1 GB. Đây là khoản lớn nhất.
- `/T`: 19G, 7439 mục; bốn worktree detached và bốn bản `git clone` ở mục 1.
- Bộ đệm kit `~/.claude/plugins/cache/acceptance-gate-kit/`: tổng chưa tới 1 GB. Bản `acceptance-gate`/`feature-loop`
  2.34.0 không ai ghim; `dieu-phoi`, `road-map` 2.33.1–2.35.0 và `tri-thuc` 2.34.0–2.35.0 không ai ghim. Bản 2.15,
  2.19, 2.24, 2.33.0, 2.33.1, 2.35.0 còn được dự án khác (`policy-graph-hub`, `aes`, `floorplanstudio`, worktree của
  kit) ghim — giữ. Ba đường ghim trỏ thư mục không còn: `dev/oneflow`, `dev/map`, `dev/artifact-platform` (đã dời ra
  `LuuTru`) và worktree kit `nervous-margulis-4ed23b`.
- Thư mục đợt đã đóng `.acceptance-runs/dieu-phoi-{1410,sau-14-10,r2,vo-khu-muc-tieu,cap-nhat-trong-ngan}`: tổng 28M —
  không đáng dọn; giữ làm sử liệu.
- Tiến trình: không còn `tail -F su-kien.jsonl` mồ côi; `fseventsd` 15 MB; swap 1,6/3 GB. Không cần làm gì.

---

## (A) Máy làm ngay — an toàn, đảo được

Chạy khi giám sát chuyển lời duyệt. Mỗi bước đo `df` trước và sau.

| Mã | Việc | Lệnh | Đảo lại |
| --- | --- | --- | --- |
| A1 | Gỡ 5 worktree không phiên nào dùng, HEAD đã ở `onehub`, không giữ thay đổi đáng giá: 4 mục `/T/*/crm` và `ve-khung-muc-tieu-dung-kr-b601db` | `git -C /Users/manh-macmini/dev/crm worktree remove --force <đường>` rồi `git -C … worktree prune` | HEAD là commit trên `onehub`: `git worktree add --detach <đường> <sha>` |
| A2 | Xoá 52 nhánh cục bộ đã gộp (phụ lục A) và 5 tham chiếu `pr/*` | `git -C … branch -d <nhánh>` (`-d` từ chối nếu chưa gộp) | sha ở phụ lục A: `git branch <nhánh> <sha>` |
| A2b | Xoá 5 nhánh cục bộ có PR đã gộp hoặc 0 commit riêng: `chore/nhan-kit-2-30`, `feat/cap-nhat-gan-day`, `feat/ly-do-tu-choi-nop-theo-locale`, `feat/sua-sau-chay-that`, `fix/kiem-cheo-dung-lai-cay` | `git -C … branch -D <nhánh>` | sha ở bảng mục 1 |
| A3 | Đồng bộ trạng thái 35 hàng lộ trình với hồ sơ: `trang_thai` «đã lên onehub», `pr` đúng số, `buoc_ke` thôi ghi «R2 — lên production»; sửa MH1, F36, DH4 theo hồ sơ | một PR T1 (`docs/**`), vẽ lại `LO-TRINH.html` bằng máy; không sửa tay `PRODUCT-MAP.md` | revert PR |
| A4 | Dọn rác `/T` của bài kiểm và lượt đo cũ hơn 3 ngày, trừ thư mục đang mở bởi tiến trình | `find $TMPDIR -maxdepth 1 -mtime +3 …` sau khi `lsof +D` rỗng; dùng `${X:?}/${Y:?}` | không đảo được, nhưng chỉ là bản sao tạm |
| A5 | Xoá bộ đệm kit không ai ghim: `acceptance-gate`/`feature-loop` 2.34.0, `dieu-phoi`/`road-map` 2.33.1–2.35.0, `tri-thuc` 2.34.0–2.35.0 | `rm -rf` từng thư mục phiên bản | cài lại từ thẻ kit |

A4 và A5 không đảo được bằng một lệnh, nhưng chỉ xoá bản sao và bộ đệm. Nếu giám sát muốn giữ A đúng nghĩa «đảo
được», dời hai bước này sang B.

## (B) Cần chủ kho quyết

| Mã | Câu hỏi | Khuyến nghị |
| --- | --- | --- |
| B1 | Gỡ worktree `agent-a798442a1bb909308` và nhánh `worktree-agent-a798442a1bb909308`? Phần chưa commit là bản nháp proto đã gộp giống từng byte. | **Gỡ.** |
| B2 | Năm tệp `tin-hieu/crm/vo-khu-muc-tieu-*.json` là đề xuất của phiên thợ, không phải tín hiệu người dùng. | **Dời** về `.acceptance-runs/dieu-phoi-vo-khu-muc-tieu/` (V1-5 và V2-4 đã xử); đưa ba đề xuất còn lại (V1-7, V1-8, V1-15) vào lượt `cat-luot` kế cùng bản gom #594. |
| B3 | Xoá 12 nhánh chưa gộp không PR mở — 8 nhánh cục bộ ghi B3 và 4 nhánh chỉ có ở remote (bảng mục 1) — cả cục bộ và remote? | **Xoá**, giữ sha trong tệp này. Riêng `chore/re-mo-hinh-mac-dinh` (23 commit, 16/10) và `fix/mien-so-chup-cho-bo-okr-mau` (12 commit, có chữ ký Cổng 2 của 01/10): xoá nhánh nhưng giữ thẻ `luu/<tên>` trỏ sha, phòng khi cần đọc lại. |
| B4 | Đóng #499? | **Đóng.** Dòng ghim của nó không còn đúng với cây nào sẽ gộp; nếu `okr-soat-anh-luot-3` còn đỏ thì ghim lại trên nền mới. |
| B5 | #509 (chi phí ads, người khác viết, T3, không hồ sơ, sau 2144 commit): làm tiếp hay đóng? | **Chuyển về đường thường**: đóng PR này, mở lại thành hàng có Cổng Đáng (T3: `packages/db/prisma`), đặt mốc migration mới. Nếu chủ kho muốn giữ, tác giả cần gộp `onehub` và đổi mốc migration. |
| B6 | Khai «Không đo được — <lý do>» cho 27 hồ sơ không mặt giao diện (phụ lục B)? | **Khai cả lô**, một dòng sổ mỗi hồ sơ, lý do theo loại: «thước/CI nội bộ, không có người dùng cuối». Chủ kho gạch hồ sơ nào không đồng ý. |
| B7 | 52 hồ sơ quá timebox: phán quyết theo nhóm? | **Đọc theo bốn nhóm** (khu Mục tiêu, Kara, tín hiệu, vệ sinh) trong một buổi; mỗi nhóm một câu giữ / bỏ / lùi hạn. |
| B8 | Bảy hồ sơ `machine-cleared` mở cửa veto 4–8 tuần: ký hay veto? | **Trình bảy thẻ trong một lượt**, chủ kho ký hoặc veto từng thẻ. |
| B9 | 10 hồ sơ treo ngoài kế hoạch, cộng `chu-thich-glob-md` | Chín hồ sơ «đang cân nhắc»: **bác hoặc xếp vào `chan_troi`**. `thuoc-cua-lat-3a-co-rang`: **đóng theo quan sát**. `chu-thich-glob-md`: **khép** (F36 đã gộp #507). |
| B10 | Dọn Docker: xoá ảnh không dùng (34,7 GB) và 20 container đã thoát? | **Có**, lúc khoá S4 rảnh: `docker container prune` rồi `docker image prune -a`; giữ ba ảnh đang chạy. |
| B11 | Bốn ca CI đỏ cố định: hàng C1 chạy trước BK1, hay song song? | **Trước BK1.** Mọi PR của BK sẽ gặp đúng bốn ca này; gộp khi `test` đỏ làm mất tín hiệu thật. |
| B12 | Cho máy sửa `evals.yaml` của 9 hồ sơ đã ký để vá paths chết (luật tạm 18/10 cấm)? | **Cho, trong một hàng (C2)**, đo hai chiều từng mục, trình trên thẻ Cổng 2 của hàng đó. |

## (C) Việc dài — thành hàng lộ trình

Mã nối dãy vệ sinh F của `lo-trinh-okr.json` (cuối là F36). Cỡ ước theo giờ máy.

| Mã đề xuất | Slug | Câu giao | Cỡ | Thứ tự |
| --- | --- | --- | --- | --- |
| F37 | `ci-test-het-do-co-dinh` | «Một PR chỉ đổi tài liệu ra `test (api)` và `test (app-ui)` xanh trên `onehub`» — bốn ca ở mục 6 | ~4–6 giờ máy | **đầu tiên**, trước BK1 |
| F38 | `paths-chet-chin-ho-so` | «Chín hồ sơ đã ký hết bị đòi ghim lại chỉ vì một mục `paths` trỏ vào tệp đã đổi tên» | ~3 giờ máy, kèm ghim lại | sau F37, song song BK1 (khác vùng: `_acceptance/**`) |
| F39 | `nguong-gia-tri-mat-giao-dien` | «Mỗi hồ sơ có mặt giao diện chờ Cổng Giá trị có ngưỡng điền xong, để phiên nghiệm thu mở được» — 51 hồ sơ, máy đề xuất `[đề xuất]`, người chốt | ~4 giờ máy + một buổi người | sau B6, B7; không chặn lộ trình |
| F40 | `rang-ve-tay` | «Một dấu hiệu vẽ tay của `docs/design.md` trong `apps/app` làm `lint:slop` đỏ và gọi tên tệp» — luật `anti-slop` trong `tools/oxlint` cho `<hN className>`, `spacing={0}`, `AlertDialog`, `navigator.clipboard`, `SECTION_TITLE` | ~6 giờ máy | sau BK2, BK3 (cùng khuôn răng) |
| F41 | `cai-dat-va-agent-builder-het-ve-tay` | «Cài đặt và Agent builder hỏi lại bằng `ConfirmDialog` và chép bằng `CopyValue`» — 11 tệp `AlertDialog`, 7 tệp `navigator.clipboard` | ~4 giờ máy | song song lộ trình chính, trước F40 bật chặn |

Thứ tự cùng BK và SV (chủ kho đã chốt BK trước SV9, SV10):

```text
F37 ─▶ BK1 ─▶ BK2 ─▶ SV9 ─▶ SV10
        │      BK3 ─┘
        └─ F38 (song song, vùng _acceptance)
F41 (song song, vùng Cài đặt + agent-builder) ─▶ F40 (sau BK2, BK3)
F39 (việc người + máy, không chặn)
```

Nợ `<hN className>` và `spacing={0}` ở khu OKR không có hàng riêng: răng F40 bật thì từng hàng chạm tệp đó sửa luôn.

---

## Phụ lục A — 52 nhánh cục bộ đã gộp, sha đỉnh

```text
chore/bat-ngoai-n-tu-dinh-tuyen 3f43e7c4b
chore/e9-lt1b-chung-lai c9dc065b6
chore/giu-tuoi-sau-483 11a4b9177
chore/khong-doi-hinh-sang-kiem-cheo 2725a2b7a
chore/nhan-kit-2-33 6fe9796e7
claude/focused-montalcini-0cca84 73bb599b2
claude/hop-tuan-hien-trang-78b3d1 4830de27d
claude/khong-doi-hinh-sang-kiem-cheo-3eced7 1478ac08a
claude/quizzical-jang-52c51d d8c261369
docs/cap-nhat-trong-ngan-kr a35120bd0
docs/cat-hang-sau-vo-khu c29f07942
docs/cat-luot-ghi-trong-ngan 47c729385
docs/cat-luot-hop-tuan a0cb9b8fc
docs/doi-chieu-vo-khu b370013f2
docs/doi-hang-okr-sau-hang-gop 2ea0e6146
docs/goi-dot-vo-khu-muc-tieu bd0330146
docs/lo-trinh-ba-lan e3d594a48
docs/lo-trinh-trang-thai-19-10 754b5a94d
docs/luat-hang-cong-cu fdf4eca39
docs/them-hang-ht6 fa2468692
feat/bo-okr-chi-don-vi c6181f3dd
feat/bo-okr-co-so da9dc769f
feat/cam-xuc-tren-cap-nhat 45fc8f45d
feat/cap-nhat-trong-ngan-kr d7172c268
feat/che-do-soan-bo-okr b724d1f5e
feat/chu-may-sinh-ten-moi 6fb26c21f
feat/cua-toi-chi-liet-kr bee6b3687
feat/doi-nhan-khu-muc-tieu 44560c340
feat/gon-dau-trang-lay-y-kien d8d47b341
feat/hop-cap-nhat-lan-truoc 67160cdd6
feat/hop-tuan-mo-dung-bo 8c8cff0fe
feat/hop-tuan-tren-bang c3342ad6c
feat/khung-cho-don-vi-mot-hinh 83c2fd8fc
feat/lich-su-moi-lan-cap-nhat d211bdd87
feat/loc-don-vi-khong-tu-dong 8f50be51d
feat/moi-kr-ca-cong-ty d61edcf7f
feat/mot-nut-tao-muc-tieu 5f7871b34
feat/ngan-kr-mot-cho c9e4aab2c
feat/so-do-toan-vung b85045fe2
feat/thanh-ben-khu-dung-chung e8aaca725
feat/tom-tat-tuan-dang-cho 7c8059ec9
feat/trang-bo-okr 68c84f186
feat/ve-khung-muc-tieu-dung-kr 3c9a39d6e
feat/vo-khu-muc-tieu-2 b984b061c
fix/bam-kr-mo-chi-tiet-kr fab71f2bc
fix/cham-bo-do-chiu-cau-loi dd504a131
fix/cua-toi-don-vi-dan-khi-cay-loi bfca8a74a
fix/okr-mau-xoa-du ac8b2b80d
fix/thu-paths-e15-giai-doan f30b5dd3d
fix/to-chuc-don-don-vi-sau-kiem e0906c56b
worktree-agent-a907e6cccbd8d0b14 d6fd2d818
worktree-agent-ad9e602b55684216f 043848c22
```

Đỉnh các nhánh remote đề xuất xoá: `origin/feat/dieu-huong-okr 706ba494a` · `origin/feat/so-do-can-chinh-okr 6e98e80e5` ·
`origin/feat/vo-khu-muc-tieu 2790552ac` · `origin/fix/do-phu-khong-gia-dinh-cay-trong dc12fcf36` ·
`origin/chore/giu-tuoi-sau-489 7f64f7eec` · `origin/feat/chi-phi-ads c5ef6c886` · `origin/fix/ci-test-duoi-tran 7063f7b40` ·
`origin/fix/khung-chat-cuon-duoc 4d8456645` · `origin/thu/ci-tach-job 8a1154d1f` · `origin/proto/bo-okr-la-noi-hop 1cab9daeb` ·
`origin/chore/ghim-sau-kara-mot-ten 344097ec9`.

## Phụ lục B — danh sách hồ sơ Cổng Giá trị

**27 hồ sơ ngưỡng chưa chốt, không mặt giao diện** (ứng viên «Không đo được», B6), kèm `surfaces`:
`ba-ho-so-do-san` [tooling] · `bao-loi-tac-nhan-sau-cau-hoi` [api] · `bo-ca-mau-quy-4` [cli, agent-eval] ·
`bo-cau-hoi-mau` [cli] · `ca-chap-chon-cach-ly` [] · `ca-chap-chon-con-lai` [] · `cham-bo-do-chiu-cau-loi` [cli] ·
`don-ho-so-cu` [ci] · `eval-model-that-dung-luc` [] · `ghim-thuoc-soi-xem-okr` [] · `gia-co-gom-tin-hieu` [ci] ·
`gom-tin-hieu-tu-chay` [ci] · `ho-so-do-kiem-cheo` [tooling] · `hop-dong-mau` [cli, api] · `khoa-eve-khong-tranh` [] ·
`khoa-viec-con-dung-thu-tu` [api, docs] · `khong-do-them-chay-gh` [ci] · `khong-re-theo-ten-thanh-luat-kho` [tooling] ·
`mo-lai-khong-tra-viec-chi-okr` [api, docs] · `model-theo-vai-do-lai` [agent] · `neo-thuoc-het-han` [tooling] ·
`tai-lieu-khoi-phuc-chap-chon` [] · `thu-paths-e15-giai-doan` [tooling] · `thuoc-khong-tu-het-han` [] ·
`zalo-bom-gio` [api] · `zalo-cau-thu-hai-lien-ket` [agent] · `zalo-hoi-okr-khong-chet` [].

Bốn hồ sơ `[api]`/`[agent]` có người dùng gián tiếp (`bao-loi-tac-nhan-sau-cau-hoi`, `hop-dong-mau`,
`zalo-cau-thu-hai-lien-ket`, `model-theo-vai-do-lai`): chủ kho nên xem riêng trước khi khai «không đo được».

**51 hồ sơ ngưỡng chưa chốt, có mặt giao diện** (F39): `bo-cuc-hep-ngan-va-kanban` · `cap-nhat-trong-ngan-kr` ·
`cay-can-chinh-co-ly-do` · `cho-tac-nhan-lau` · `chu-man-tieng-viet-khong-tran` · `dai-luu-tru-dung-chung` ·
`dau-trang-okr-cho-nut-hoi-kara` · `duong-ly-do-muc-tieu` · `gan-tay-va-kara-co-ly-do` · `go-tin-hieu-rac` ·
`gon-dau-trang-lay-y-kien` · `gop-y-dung-cho` · `hoan-tac-loat-bao-dung` · `hoan-tac-loat-dung-id` · `hoi-dap-okr` ·
`kara-mot-ten` · `khung-cho-don-vi-mot-hinh` · `khung-man-chung` · `khung-soan-chan-lien-ket` ·
`lich-su-va-luu-tru-trang` · `lien-quan-loc-ban-da-cat` · `lo-trinh-nhieu-san-pham` · `lo-trinh-ten-va-build` ·
`loc-don-vi-khong-tu-dong` · `loc-moi-truong` · `loc-va-kieu-xem-chung` · `luu-tru-truong-khong-hoi` ·
`mau-trang-thai-chung` · `nen-kara` · `ngan-ban-ghi-giu-danh-tinh` · `nhap-truong-luc-tao` · `okr-cua-toi-tach-theo-doi` ·
`okr-loai-hoc-tap` · `quyet-gop-y-noi-dung-ly-do` · `soan-okr-khong-lac` · `sort-moi-truong` · `sua-sau-chay-that` ·
`tac-nhan-va` · `the-gop-y-okr` · `them-buoc-bao-dung` · `thong-bao-mot-nguon-nhieu-kenh` ·
`tieu-diem-sau-hop-xoa-tin-hieu` · `trang-lo-trinh-mo-hinh-hien-thi` · `trang-thai-tin-hieu-song` ·
`truong-chuan-o-cai-dat` · `truong-mot-cach-cu-xu` · `truong-tep` · `va-lo-ro-vai-chi-okr` ·
`ve-khung-muc-tieu-dung-kr` · `viec-rieng-chi-nguoi-trong-cuoc` · `zalo-gui-hong-ghi-ly-do`.

**52 hồ sơ quá timebox** (B7): `bam-kr-mo-chi-tiet-kr` · `bo-okr-co-so` · `bo-xuong-kara` · `cap-nhat-gan-day` ·
`cau-truc-to-chuc` · `che-do-soan-bo-okr` · `chu-may-sinh-ten-moi` · `cua-toi-ba-phan` · `cua-toi-chi-liet-kr` ·
`cua-vao-va` · `da-luu-tru-tai-loi` · `deal-va` · `dich-ten-nganh-bang-bang` · `dieu-huong-khu-muc-tieu` · `dieu-phoi-va` ·
`doi-nhan-khu-muc-tieu` · `giai-doan-mac-dinh` · `go-tin-hieu-rac` · `goi-y-mo-ke-hoach` · `gom-tin-hieu-tu-chay` ·
`hop-cap-nhat-lan-truoc` · `hop-tuan-mo-dung-bo` · `kho-nguon-khong-ket` · `khung-ban-ghi-kara` · `khung-okr-truoc-r1` ·
`lich-su-moi-lan-cap-nhat` · `lo-trinh-hien-ngay-du-kien` · `lo-trinh-nhieu-san-pham` · `ly-do-can-chinh-tu-soan` ·
`may-soan-de-xuat` · `moi-kr-ca-cong-ty` · `mot-nut-tao-muc-tieu` · `ngan-kr-mot-cho` · `re-mo-hinh-mac-dinh` ·
`so-do-toan-vung` · `soan-okr-trang-rieng` · `thanh-ben-khu-dung-chung` · `thanh-vien-vao-dung` ·
`thong-bao-mot-nguon-nhieu-kenh` · `thuoc-7-ngay-loc-pr` · `tieu-diem-sau-hop-xoa-tin-hieu` · `tim-va-dieu-huong-kho` ·
`tom-tat-tuan-dang-cho` · `trang-bo-okr` · `trang-thai-tin-hieu-song` · `tro-ly-doc-kho` · `tro-ly-kho-dung-phien` ·
`va-gantt-lich-bay-ngay` · `va-lo-ro-vai-chi-okr` · `ve-sinh-do-san-onehub` · `viec-chung` · `vo-khu-muc-tieu`.
