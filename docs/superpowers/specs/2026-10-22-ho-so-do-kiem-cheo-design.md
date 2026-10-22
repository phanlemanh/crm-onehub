# Hồ sơ đỏ ở kiểm chéo — thiết kế (F28, `ho-so-do-kiem-cheo`)

Ngày 22/10/2026 · đợt lo-trinh-tin-hieu, dãy F1 · hạng T2 · Cổng Đáng ký 19/10 (build) · surface `tooling`.

## Vấn đề

F24 (`ba-ho-so-do-san`) chỉ dọn 12 hồ sơ có mục `paths` chết. Phần còn lại dồn sang hàng này:

- 15 hồ sơ mà kiểm chéo đêm 11–13/10 gọi tên có eval đỏ (mục `ngoai_vong` của `_acceptance/ba-ho-so-do-san/danh-sach.json`).
- 7 hồ sơ F24 hoàn lại sau lượt ghim 13/10 (mục `hoan_lai`, hàng nhận F28).
- `so-okr-tu-chay`: bản vá E23/E25 F8 để lại (`_acceptance/neo-thuoc-het-han/vao-f28-so-okr-tu-chay.patch`, chủ kho chọn «F8: b1»).
- Hai thước `ranh-gioi.mjs` dùng `--first-parent --ancestry-path` (`ban-gieo-gop-y-sau-nop`, `kara-gop-y-luot-2`).
- `evals.yaml` không phải YAML chuẩn.

Một hồ sơ đã ký mang eval đỏ làm hỏng việc của người khác: PR nào chạm hồ sơ ấy đều phải ghim lại, và lượt ghim đỏ
ngay ở thước mà không ai trong PR đó gây ra.

## Số đo lúc mở vòng (mốc nền `6be0bb688900ecd8843989bd8f8b3095548b604f`, onehub sau #512)

Lượt đo 22/10 chạy MỌI eval máy (`test`/`script`, không tự khai `not-run`) của 27 hồ sơ đầu vào, bằng chính bộ đọc
evals của kit (`isRepinMachineEval`, `expectedExits`), không chạy bốn suite: **345 eval, 73 đỏ, trên 22 hồ sơ**
(`do-lai-nen.json`). `kara-gop-y-luot-2`, `do-man-tren-kho-rieng`, `dieu-phoi-hai-tang`, `lich-su-va-luu-tru-trang`,
`no-sau-luot-5-okr` xanh hết. Sáu tác tử chỉ-đọc tra nguyên nhân từng eval đỏ bằng `git log -S` và hợp đồng của hồ sơ
đã đổi vật; số đếm chính xác theo từng cách xử lý là của danh sách đóng (mục «Cách làm»), bảng dưới chỉ gom gốc.

| Gốc | Ví dụ |
|---|---|
| «Vòng này» tính theo nhánh trôi — ở HEAD = onehub phạm vi rỗng | merge-base(HEAD, onehub), `origin/onehub...HEAD`, ghép `--first-parent --ancestry-path` (ra rỗng trên git 2.37) — 11 ô |
| Vật đổi có chủ đích theo một hồ sơ đã ký sau, răng neo theo vật cũ | `datatable-loc-ro` thay câu rỗng khi lọc (8 eval) · `cua-toi-ba-phan` dời /okr/cap-nhat-tuan · `vo-khu-muc-tieu` bỏ thanh thẻ · `ngan-kr-mot-cho` · neo đếm và bảng khai chậm hơn mã |
| Lỗi của chính răng | `spawnSync` ENOBUFS · quét `apps/agent/.eve/` (bản chụp máy sinh) · phụ thuộc thứ tự eval · một `try` bao cả lượt · lệnh đo màn không qua `tien-de.mjs` |
| Cần thứ máy đo không có | `cron-theo-ban-khai` E8 đòi bản triển khai production dựng từ đúng sha HEAD, token Vercel CLI máy đo hết hạn 17/10 |
| Tệp ghim sinh lúc chạy chưa có (làn nối tiếp chưa chạy) | `tong-quan-va-khung-noi-tieng-viet` E3, E22–E25 |
| **Sản phẩm hỏng thật** — 4 ô | 8 bài DOM tự khai lại kiểu `Locale` · nhãn trường tự tạo ở Cài đặt › Trường thiếu `translate="no"` · chữ Việt bị cắt ở 360px trên Cài đặt › Trường · nhãn giai đoạn ở Tổng quan bọc `lang="en"` không `translate="no"` |

Bốn lỗi sản phẩm rơi vào ba hồ sơ: `bo-dung-chung-nhan-chuoi`, `cai-dat-con-lai-noi-tieng-viet`,
`tong-quan-va-khung-noi-tieng-viet`.

`evals.yaml` không đọc được bằng bộ đọc YAML chuẩn (`yaml` 2.9): 5/329 hồ sơ — `danh-sach-keo-chung` (trong danh sách),
`dieu-phoi-hai-tang`, `lich-su-va-luu-tru-trang`, `no-sau-luot-5-okr`, `zalo-gui-hong-ghi-ly-do`.

## Cách làm

Khuôn của F24, mở rộng một cách xử lý. Vật trung tâm là **danh sách đóng** `_acceptance/ho-so-do-kiem-cheo/danh-sach.json`:
mỗi dòng là một (hồ sơ, eval) đỏ ở mốc nền, kèm đúng một cách xử lý:

| Xử lý | Khi nào | Đổi gì |
|---|---|---|
| `neo-co-dinh` | răng tính «vòng này» theo nhánh trôi | răng neo vào cặp gộp đưa hồ sơ lên onehub (sha cố định, kiểm `git cat-file -e`, không có thì mã 2) |
| `sua-rang` | vật đổi có chủ đích theo một hồ sơ đã ký sau (trích AC hay dòng sổ của hồ sơ đó), hoặc lỗi của chính răng | sửa răng hoặc bảng khai của nó; chiều đỏ của răng vẫn bắt, chứng bằng một đột biến có tên |
| `khai-not-run` | lời hứa bị một quyết định đã ký sau lật, hoặc ô cần thứ máy đo không bao giờ có | `status: not-run` + `ly_do` + `can_cu` (sha có thật hoặc `tệp:dòng` có thật) |
| `tro-duong-moi` | tệp bị dời, trỏ lại là đủ | `paths`/đường trong răng |
| `tu-het` | xanh lại khi chạy đúng tiền đề | không đổi; ghi lượt chạy xanh |
| `san-pham-hong` | màn hay hành vi đổi mà không quyết định đã ký nào cho phép | không sửa răng, không hạ ô; hồ sơ vào mục `hoan_lai` kèm mã tín hiệu gửi làn chủ |

Luật của nhóm F35/F28/F31/F34 (luật 23 của đợt, chủ kho duyệt A 19/10) áp cho mọi dòng sửa thước: đối chứng dương (bản
nguyên vẹn XANH) và chiều đỏ (bản tiêm ĐỎ với đúng thông điệp), một dòng sổ `fix` mang `decided_by` chủ kho, không đổi
lời AC của hồ sơ bị sửa, và chỉ chạy trên hồ sơ mà làn chủ không có vòng đã ký chờ gộp (hỏi qua giám sát trước S3).

Mỗi hồ sơ bị chạm được **ghim lại trong một lượt lane** (`repin-lane.mjs --write`, khoá `ghim-lai`) ở đuôi vòng — ghim
xanh là định nghĩa của «không còn đỏ». Lượt ghim chạy `tq_lan_noi_tiep` trước nếu `tong-quan` còn trong vòng.

**Chiều đỏ có chung một bộ chạy.** Mỗi dòng `neo-co-dinh`/`sua-rang` khai đột biến dạng máy đọc: một bản vá nhỏ
(`dot-bien/<hồ sơ>-<eval>.patch`), lệnh của eval, thông điệp ghim. `rang/chieu-do.mjs` dựng một cây tạm ở HEAD
(`git worktree add --detach` trong tmpdir), chạy lệnh trên cây nguyên vẹn (phải đạt kỳ vọng), áp bản vá, chạy lại (phải
không đạt và in đúng thông điệp), dọn cây ở mọi lối thoát. Không có răng nào được tính là đã sửa nếu chưa qua cặp này.

Lớp đo của vòng:

1. **Khai** — tập đầu vào suy từ nguồn (mục `ngoai_vong` và `hoan_lai` hàng F28 của danh sách F24, `so-okr-tu-chay`,
   quét YAML mọi hồ sơ ở mốc nền), không khai cứng; `do-lai-nen.json` (máy sinh bằng `rang/do-lai.mjs`) phủ đủ mọi
   (hồ sơ, eval máy không not-run) của tập đó ở mốc nền; danh sách bằng đúng tập đỏ trong nó; mỗi dòng một xử lý hợp
   lệ; tái lập trên cây tạm ở mốc nền cho mọi hồ sơ đầu vào, nhóm eval cần máy chủ khai số đếm và lý do.
2. **Khai đủ** — mọi commit của vòng mang nhãn hồ sơ (commit không nhãn không đến từ onehub là đỏ), mọi thay đổi dưới
   `_acceptance/<hồ sơ khác>/` từ mốc nền tới HEAD có dòng danh sách; hồ sơ ở
   `hoan_lai` không đổi ròng; `contract.md` của hồ sơ bị sửa không đổi (không đổi lời AC).
3. **Chiều đỏ** — bộ chạy ở trên, cho mọi dòng `neo-co-dinh`/`sua-rang`.
4. **Hành vi** — mỗi hồ sơ bị chạm có dòng `repin` mới, suite và eval đạt, `verified_commit` khớp, `recheck-evidence`
   không VIOLATION.
5. **YAML chuẩn** — mọi `evals.yaml` trong vòng đọc được bằng `yaml` chuẩn, và bộ đọc của kit cho đúng cùng bản ghi trước
   và sau khi sửa (sửa chỉ là cú pháp).
6. **Phán xét** — hội đồng đọc `danh-sach.json` + `bang-truoc-sau.md`: mỗi lý do thuộc một loại hợp lệ, không dòng nào
   hạ một ô đỏ vì sản phẩm hỏng. `bang-truoc-sau.md` do `rang/bang.mjs` sinh từ danh sách, diff và `do-lai-nen.json`:
   mỗi dòng (kể cả `san-pham-hong`) mang đuôi đầu ra đỏ ở mốc nền, nguyên văn câu căn cứ (dòng ở `tệp:dòng`, hoặc
   thông điệp commit của sha), eval trước/sau, đầu ra đột biến; lớp khai sinh lại bảng và so từng byte.
7. **Lối ra** — mỗi dòng `san-pham-hong` có mã tín hiệu đã gửi, hồ sơ của nó ở `hoan_lai`, và phần sửa răng đã tra cho hồ
   sơ đó ghi sẵn trong danh sách để hàng sửa sản phẩm mang theo.

Mốc nền là sha cố định, không dùng `merge-base` hay `HEAD` — chính là lớp lỗi vòng này dọn.

## Ranh giới và chi phí

- Hàng khai ranh giới `_acceptance/ho-so-do-kiem-cheo/**`; vòng còn chạm răng, bảng khai và `evals.yaml` của 22 hồ sơ (19 có
  eval đỏ ngoài ba hồ sơ hoàn lại, cộng 3 chỉ sửa cú pháp YAML) và vài dòng `_acceptance/config.yaml` (bọc lệnh đo màn qua `tien-de.mjs`, chỉ thêm hay đổi lệnh của
  chính hồ sơ bị sửa) → gửi `cham-tep` cho giám sát trước S3. Hồ sơ của làn Mac Studio (`zalo-gui-hong-ghi-ly-do`) đi qua
  `cham-tep` riêng.
- Không chạm mã sản phẩm (`apps/**`, `packages/**`) ở lối máy khuyên.
- Ghim lại 22 hồ sơ: suite một lần + ~270 eval máy, trong đó 5 phép đo màn dài (3–11 phút mỗi lượt). Ước 80–120 phút,
  vượt trần `repin_budget_min: 80` → chia hai lượt lane theo nhóm (nhóm đo màn riêng).
- Chiều đỏ: ~40 đột biến; phần đo màn chiếm phần lớn thời gian (ước 40–60 phút).

## Câu hỏi cho người (lên thẻ Cổng Phạm vi)

- **Hỏi-1 · bốn lỗi sản phẩm thật.** Khuyên: vòng này không sửa sản phẩm. Ba hồ sơ dính (`bo-dung-chung-nhan-chuoi`,
  `cai-dat-con-lai-noi-tieng-viet`, `tong-quan-va-khung-noi-tieng-viet`) vào mục `hoan_lai`, không chạm tệp nào; gửi bốn
  tín hiệu cho làn chủ của màn (Cài đặt › Trường, Tổng quan, bài test DOM); phần sửa răng đã tra cho ba hồ sơ ghi sẵn
  trong danh sách để hàng sửa sản phẩm mang theo. Lối khác: sửa luôn sản phẩm trong vòng — giá: chạm `apps/app` thuộc
  vùng của làn khác, vòng thành chạm giao diện (thêm eval nhìn thấy và nghi thức thiết kế), to thêm khoảng một phần ba;
  hoặc chỉ sửa 8 bài test DOM (rẻ, không phải giao diện) và hoàn lại hai hồ sơ kia.
- **Hỏi-2 · 11 ô đo «vòng này» theo nhánh trôi.** Khuyên: neo từng ô vào cặp gộp đưa hồ sơ của nó lên onehub (sha cố
  định, không giải được thì mã 2), như chủ kho chọn cho `so-okr-tu-chay` ở F8; thử trên bản chép, cả 11 xanh và đột
  biến vẫn bắt. Quyết định F8 chỉ áp cho hai ô của `so-okr-tu-chay`, nên 9 hồ sơ kia cần chữ của anh. Lối khác: khai
  not-run cả 11 ô — rẻ nhất, mất chốt «vòng không chạm ngoài ranh giới» của 9 hồ sơ.
- **Hỏi-3 · ghim «3 cảnh báo lint» của `cron-theo-ban-khai` E7, nay đo 36.** Khuyên: đo ở cặp gộp của vòng cron — vòng đó
  không thêm cảnh báo. Lối khác: ghim lại 36 (đỏ lại mỗi lần ai thêm một cảnh báo); coi là hồi quy và dọn 33 cảnh báo
  (chạm `apps/app` của nhiều làn).
- **Hỏi-4 · `cron-theo-ban-khai` E8 — cron thật trên production khớp bản khai.** Khuyên: răng đòi một bản triển khai
  production READY có sha chứa cặp gộp của vòng cron, thay vì đúng sha HEAD; anh đăng nhập lại Vercel CLI một lần trên
  máy đo (token hết hạn 17/10). Lối khác: khai not-run — không cần anh, mất chốt máy duy nhất canh cron trên production.

## Đặc tả UX

Không áp dụng — vòng không chạm mặt người nhìn (surface `tooling`). Đã ghi `descope` trong sổ.
