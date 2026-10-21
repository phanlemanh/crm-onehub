# Gom tín hiệu tự chạy — thiết kế (TH2)

Hàng TH2 `gom-tin-hieu-tu-chay` của `docs/plan/lo-trinh-okr.json`, mã G1 của bản phạm vi
`docs/plan/pham-vi-vong-tin-hieu-1410.md`. Cổng Đáng `build` 19/10 (Phan Le Manh). Đợt `lo-trinh-tin-hieu`, dãy S1,
mốc 29/10.

## Ý định

Câu giao: «Chủ kho nhận trong ngày một đợt gom đề xuất sẵn nhóm và hàng mỗi khi có tín hiệu mới, và chỉ cần sửa hay
phủ quyết.»

Hôm nay tín hiệu đã tự về kho (TH1: lịch `tin-hieu-keo-ve.yml` kéo hai lần mỗi ngày, mở PR «Tín hiệu kéo về»). Nhưng
từ đó tới lộ trình vẫn cần một người mở phiên máy, gõ `/acceptance-gate:gom-tin-hieu` rồi `/acceptance-gate:cat-luot`.
Sáu tín hiệu đang nằm trên `onehub` mà chưa ở bản gom nào. TH2 bỏ bước gõ lệnh đó: một lịch của kho tự chạy hai skill
của kit, rồi giao kết quả cho chủ kho dưới dạng một PR nháp mà chủ kho chỉ việc sửa, gộp hay đóng.

Ngưỡng ở ô cơ hội: mỗi tín hiệu kéo về có chỗ trong bản gom trong vòng 2 ngày; chủ kho sửa ít hơn một nhóm trên năm.

## Mục tiêu · không làm · phản mục tiêu

Mục tiêu:
- Tín hiệu mới lên `onehub` → trong ngày có một PR nháp chứa một bản gom mới (nhóm theo trục kết quả) và các hàng đề
  xuất trong tệp lộ trình, cùng trang lộ trình vẽ lại.
- Chủ kho làm một trong ba việc: sửa trên nhánh của PR · đóng PR (phủ quyết) · để chủ nhóm tệp lộ trình gộp.
- Sửa của người không bao giờ bị lượt máy sau ghi đè. Phủ quyết không bị lượt máy sau lật lại.

Không làm (vòng này):
- Tự gộp, tự chuyển PR sang sẵn sàng (luật 22 của đợt; chủ kho duyệt B 19/10).
- Báo tin riêng cho chủ kho ngoài thông báo PR của GitHub (TB1/N5 lo «Có n tín hiệu mới»).
- Ghi trạng thái vào tệp lộ trình; xếp ưu tiên theo số tín hiệu (luật của hai skill).
- Lộ trình nhiều sản phẩm (L6); học từ lần chủ kho sửa.

Phản mục tiêu — thứ làm vòng hỏng dù «chạy được»:
- Một PR đề xuất mà răng đỏ, câu lọt mã, hay chạm tệp ngoài vùng — chủ kho phải dọn rác của máy.
- Lượt sau đè lên chỗ chủ kho vừa sửa.
- Đóng PR rồi sáng hôm sau PR y hệt mở lại.
- Lượt hỏng im lặng: không có PR mà cũng không ai biết vì sao.

## Ràng buộc

- Việc PHÁN (tín hiệu nào vào nhóm nào, tên nhóm, câu giao của hàng) là việc của một phiên chạy skill — mã của kit
  không gọi mô hình (`skills/gom-tin-hieu/SKILL.md` của kit). Phần lịch chạy thuộc kit; crm chỉ khai lịch và nhận PR
  (ghi chú hàng TH2). Vậy crm không chép chữ hai skill, và không tự viết lại phán xét bằng mã.
- Đúng/sai của đề xuất do lệnh tất định quyết, không do lời mô hình: răng phủ `tin-hieu.mjs --rang`, kiểm câu
  `tin-hieu.mjs --cau`, răng cắt lượt `cat-luot.mjs --pham-vi … --lo-trinh …`. Kho đã có bản chép của ba lệnh (lớp
  chép của kit trong `_acceptance/config.yaml`).
- Răng phủ đòi MỌI tín hiệu gửi trước mốc `den` của bản gom có chỗ trong cây. Hệ quả: hai PR đề xuất cùng dựng trên
  `onehub` không đứng chung được — PR thứ hai đỏ vì tín hiệu của PR thứ nhất chưa có chỗ. Một lúc chỉ một PR đề xuất.
- Đẩy nhánh từ Actions chạy `.githooks/pre-push` (19 phút, cần Postgres) — đặt `CRM_SKIP_HOOKS=1` như lịch TH1.
- Kho GitHub hiện có bốn bí mật (`CRM_API_URL`, `CRM_KHOA_DAY_LO_TRINH`, `CRM_KHOA_KEO_TIN_HIEU`, `TIN_HIEU_TOKEN`),
  chưa có khoá mô hình nào. Gói kit nằm ở kho riêng tư `phanlemanh/acceptance-gate-kit`.
- Hằng số tinh chỉnh (trần lượt, phút, mô hình, tên nhánh) nằm trong một đối tượng cấu hình, như `LICH` của TH1.

## Cách làm

### Tệp lịch `.github/workflows/tin-hieu-gom.yml`

- Chạy khi: đẩy lên `onehub` có chạm `tin-hieu/crm/**` (PR «Tín hiệu kéo về» vừa gộp) · mỗi ngày một lần lúc 11:00 UTC
  làm lưới đỡ · chạy tay.
- Chỉ ở `phanlemanh/crm-onehub`; một lượt một lúc (`concurrency`, không huỷ lượt đang chạy); trần phút cho cả job.
- Quyền: ghi nội dung và PR, không hơn.
- Bước: lấy mã `onehub` đủ lịch sử bằng `TIN_HIEU_TOKEN` → Node 24, Bun, `bun install` (địa chỉ CSDL giả như TH1) → cài
  Claude Code bản ghim, thêm chợ gói của kit và cài gói `acceptance-gate` (dùng `TIN_HIEU_TOKEN` để đọc kho kit) →
  `bun scripts/tin-hieu/gom-lich.ts`.
- Không có bước gộp, không có bước chuyển sẵn sàng.

### Lệnh `scripts/tin-hieu/gom-lich.ts`

Một lượt, theo thứ tự; mỗi nhánh rẽ in một dòng tiếng Việt và thoát:

1. **Đọc.** `fetch` `onehub` và nhánh đề xuất `tin-hieu/gom`; đứng ở đỉnh `onehub`. Chạy
   `node scripts/tin-hieu.mjs --root . --chua-gom`. `loi` không rỗng → đỏ, gọi tên tệp tín hiệu sai khuôn.
2. **Không có gì mới.** Không tín hiệu nào chưa có chỗ → «không có tín hiệu nào chưa có chỗ — không gọi mô hình», mã 0.
3. **Dấu tập.** Dấu của lượt = băm của danh sách mã tín hiệu chưa có chỗ, xếp thứ tự. Dấu ghi trong thân PR đề xuất
   (một dòng chú thích máy đọc).
4. **Xét PR đề xuất đang có** (`gh pr list --head tin-hieu/gom --state all`):
   - PR đang mở có commit không phải của tài khoản máy → «đề xuất đang mở có sửa của người — không đụng; tín hiệu mới
     vào đề xuất kế sau khi PR này gộp hay đóng», mã 0. Không gọi mô hình, không đẩy.
   - PR đang mở chỉ có commit của máy và cùng dấu → «đề xuất đang mở đã gồm mọi tín hiệu chưa có chỗ», mã 0.
   - PR đang mở chỉ có commit của máy, khác dấu → đi tiếp; bước 7 dựng lại nhánh và sửa thân PR đó.
   - PR gần nhất đã đóng mà không gộp, cùng dấu → «đề xuất cho đúng các tín hiệu này đã bị phủ quyết — chờ tín hiệu
     mới», mã 0. Khác dấu (có tín hiệu mới) → đi tiếp; lời gọi mô hình mang theo tóm tắt đề xuất đã bị phủ quyết để
     phiên gom không lặp lại đúng cách gom cũ.
5. **Gọi phiên gom.** `claude -p` với lời dặn cố định: chạy skill gom rồi skill cắt lượt trên bản gom vừa ghi; ghi bản
   gom vào `tin-hieu/gom/`, hàng vào tệp lộ trình; được commit cục bộ, không đẩy, không mở PR. Công cụ được phép: đọc,
   ghi, sửa tệp; `git add`/`commit`/`status`/`diff`; ba lệnh kit. Mô hình, trần lượt và trần phút lấy từ cấu hình.
   Thiếu khoá, CLI vắng, mô hình thoát khác 0 hay quá trần → đỏ với câu nói chủ kho phải làm gì; không đẩy.
6. **Hậu kiểm tất định — chỉ lệnh quyết.** Commit nốt tệp còn bẩn trong vùng cho phép, vẽ lại `LO-TRINH.html` bằng
   `scripts/product-map.mjs`, rồi:
   - mọi tệp đổi so với `onehub` (kể cả tệp chưa theo dõi) nằm trong vùng: `tin-hieu/gom/*.md`, các tệp ở
     `lo_trinh.tep`, `LO-TRINH.html`; ngoài vùng → đỏ gọi tên tệp;
   - đúng một bản gom mới;
   - răng phủ, kiểm câu và răng cắt lượt (bản gom mới làm bản phạm vi, trên từng tệp lộ trình bị đổi) đều mã 0; đỏ →
     không đẩy, in nguyên các dòng lỗi.
7. **Giao.** Đẩy ép nhánh `tin-hieu/gom` (với `CRM_SKIP_HOOKS=1`). Chưa có PR mở → `gh pr create --draft` vào `onehub`,
   tiêu đề `TH2 · chore(gom-tin-hieu-tu-chay): Đợt tín hiệu <ngày>`; đã có PR mở của máy → `gh pr edit` thân. Thân PR
   bằng tiếng sản phẩm, máy dựng từ bản gom: mỗi nhóm một dòng (tên nhóm · số tín hiệu · hàng đề xuất), các tín hiệu
   lẻ kèm lý do, các tín hiệu đã phủ kèm việc đã giao, rồi ba dòng «Sửa · Phủ quyết · Gộp» nói cách làm, cuối là dòng
   dấu máy đọc. Không đường nào gọi `gh pr merge` hay `gh pr ready`.

### Lệnh đo `scripts/tin-hieu/do-gom.ts`

In giờ chờ của mọi tín hiệu trên `onehub` — từ commit trên đường cha thứ nhất của `onehub` đưa tệp vào (kể cả commit
gộp của nhánh hàng chờ) tới lúc PR đề xuất đầu tiên chứa nó được mở, hoặc tới lúc đo nếu chưa có — và gọi tên tín
hiệu chờ quá 48 giờ. Cho mỗi bản gom đã gộp: số nhóm chủ kho sửa trên tổng nhóm (so bản gom ở lần đẩy cuối của máy
trước commit đầu tiên của người với bản gom đã gộp: nhóm đổi tên, đổi thành viên, thêm hay bớt). Dòng tổng so với hai
ngưỡng của ô cơ hội. Đọc từ git và `gh`, không ghi gì.

### Bằng chứng trên dữ liệu mẫu

Không có khoá mô hình trong CI và vòng dựng không chờ chạy thật. Bài kiểm dựng một kho tạm có `origin` trần, chép tín
hiệu thật của `tin-hieu/crm/`, và thay hai dịch vụ ngoài bằng bản giả theo đúng hợp đồng thật của chúng: `claude` giả
đọc đầu ra thật của `tin-hieu.mjs --chua-gom` rồi viết bản gom và hàng (nên bản gom đi khứ hồi qua bộ đọc thật, không
viết tay đúng khuôn bên đọc); `gh` giả ghi lại mọi lời gọi và trả JSON đúng hình của `gh pr list`. Chạy thật lần đầu là
việc sau gộp, khi chủ kho đã cài khoá.

## Vòng đời của một đề xuất

| Trạng thái | Từ đâu | Ai đổi | Sang |
|---|---|---|---|
| Mở, của máy | lượt lịch mở | lượt lịch (tín hiệu mới) | Mở, của máy (dựng lại) |
| Mở, có sửa của người | chủ kho commit lên nhánh | chủ kho | Gộp · Đóng |
| Gộp | chủ nhóm tệp lộ trình | — | (kết cục; bản gom thành lịch sử trong git) |
| Đóng không gộp | chủ kho | chủ kho mở lại | Mở · (đề xuất mới khi có tín hiệu mới) |

Ba câu của `docs/vong-doi.md` — máy đề xuất, chủ kho chốt ở Cổng Phạm vi:
1. Dọn thế nào: kết cục nghiệp vụ — gộp hay đóng PR. Kho không xoá gì; bản gom bị phủ quyết không vào `onehub`.
2. «Lịch sử»: bản gom đã gộp là lịch sử (răng phủ đọc nó mãi); PR đã đóng là vết phủ quyết.
3. Mặc định thấy gì: một PR nháp đang mở trong danh sách PR của kho; đề xuất đã đóng tìm lại ở mục PR đã đóng của nhánh
   `tin-hieu/gom`.

## Phần do người chốt (lên Cổng Phạm vi)

- Bộ chạy dựng tạm ở crm (kịp mốc, gửi việc phụ để kit nhận về) hay dựng trong kit trước (crm chỉ khai tệp lịch).
- Khi PR đề xuất đang có sửa của người: máy đứng yên (bản này), hay thêm một bản gom thứ hai chỉ cho tín hiệu mới lên
  trên sửa của người mà không đẩy ép.
- Khoá mô hình cho lịch, trần chi tiêu, và việc gửi nội dung tín hiệu tới nhà cung cấp mô hình từ GitHub Actions.
- Ba câu vòng đời ở trên, gồm nghĩa của «phủ quyết».
- Đồng hồ «trong ngày» bắt đầu từ lúc tín hiệu lên `onehub` (sau khi PR «Tín hiệu kéo về» gộp), hay từ lúc nó lên
  nhánh hàng chờ.

## Để cho người dựng

- Lời dặn cố định cho `claude -p` và danh sách công cụ được phép — viết trong cấu hình, dò bằng bài kiểm.
- Bản ghim Claude Code và cách cài gói kit trong Actions.
- Hình dạng chính xác của thân PR, miễn tiếng sản phẩm và qua được `tin-hieu.mjs --cau` với cùng luật chữ cấm.
- Chỗ ghi việc cài một lần trong `docs/` (theo bảng chỉ mục của `AGENTS.md`).
