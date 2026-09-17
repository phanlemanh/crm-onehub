# Review findings — agent-builder-noi-tieng-viet, vòng 6

Phiên nghiệm thu context sạch, chạy TUẦN TỰ. Cây đo ghim ở
`4159e3bad574786ba143bb9c0c331274a42490a5`. Không lệnh nào bị công cụ giết: mọi lời gọi
Bash đặt trần 600000 ms, và không lượt nào có dấu hiệu timeout hay output cắt giữa chừng.
Phiên này KHÔNG chạm một file sản phẩm nào.

## Vòng này sửa đúng một dòng — đã chứng

Commit `4159e3ba` gỡ `DealListItem` khỏi dòng import ở
`apps/app/components/agent-builder/deal-list-result.tsx:19`. Đó đúng là mục «Ngoài hợp đồng»
số 1 mà phiên nghiệm thu vòng 5 ghi ra.

| Vật chứng | Nguồn |
|---|---|
| Diff của commit là một dòng import, và file sản phẩm duy nhất đổi sau `7ec602c8` là `deal-list-result.tsx` | `git show 4159e3ba --stat`, `git diff --name-only 7ec602c8 HEAD` |
| `app:lint` đếm 0 lượt `noUnusedImports`; cảnh báo 4 → 3 | `bunx turbo run lint --force`, exit 0 |
| Ba cảnh báo còn lại đều ngoài lát: `noDocumentCookie` ở `components/app-header.tsx:129:3`, `noBarrelFile` ở `lib/locale/locale.ts:1:1` và `postcss.config.mjs:1:1` | cùng lượt chạy, lọc đích danh từng dòng |
| Mọi chuỗi mà hội đồng vòng 5 nêu còn Y NGUYÊN (`khung.ts:84`, `tac-nhan.ts:143,147,161,182,195,197-201,205,211`, `ket-qua.ts:44,95`) | đọc lại tận tay ở vòng này |

## Làn máy

15/15 eval máy exit 0, CẢ BỐN lệnh suite exit 0. Không con số neo nào nhúc nhích so vòng 5:
26/20/6 file, 41 chuỗi (E14), 39 thuộc tính (E5), 10 toast · 4 ô tiêu đề (E10), 285 ca
`bun run test`, 70 ca · 402 khẳng định (E16).

## Bốn mục hội đồng vòng 5 để ngỏ — được nêu lại, KHÔNG đòi sửa

Cả bốn đang chờ chủ từ điển quyết ở Cổng Bằng chứng. Hồ sơ giữ chúng dạng UNCERTAIN kèm
bằng chứng cần, đúng như vòng 5 để lại.

1. **"đội kinh doanh" / "đội khởi tạo"** (`agent-builder-khung.ts:84`) — CẢ BA lăng kính
   cùng nêu ở vòng này (vòng 5 có hai). spec-alignment ghi thêm: cùng dòng còn dùng "đối
   tác mới", tức một danh từ thứ ba song song với hai mục **Công ty**/**Cá nhân** đã chốt.
2. **Hai cặp gọi tên lẫn trong cùng một kho** — *deploy*: "Đưa vào chạy"
   (`agent-builder-tac-nhan.ts:199`) cạnh "Đã đưa tác nhân cho cả đội" (`:195`) và "Đưa cho
   đội trước" (`:211`); *action*: "việc" (`:143,161`) cạnh "thao tác" (`:201,205`).
   operational-feasibility bồi thêm một lớp: `:136` lại dùng chính chữ "việc" cho nghĩa
   khác hẳn là task của CRM.
3. **Nhãn "Sống ở đâu"** (`agent-builder-tac-nhan.ts:147`, dùng lại ở `:222`) — spec-alignment.
4. **`tableTitle` nối enum thô vào câu Việt** (`deal-list-result.tsx:155-163`) —
   domain-correctness và operational-feasibility cùng tìm ra, độc lập. **Phiên này kiểm lại
   bằng `git show bd99ba3f:...`: khối 155-163 có Y NGUYÊN từ mốc so** — không phải hồi quy
   của vòng nào.

## Ba mục MỚI — chưa từng nêu ở năm vòng trước

Cả ba cùng một lớp: chữ chưa có mục từ điển chống lưng. Phiên này kiểm tận tay từng dòng.

1. **"gắn thẻ" vs "gắn bản ghi CRM"** (spec-alignment). `agent-builder-khung.ts:77` viết
   "gắn thẻ một bản ghi hay một kết nối", trong khi nút thật của ô soạn viết "Gắn bản ghi
   CRM và kết nối" (`agent-builder-o-soan.ts:49`) và `CONTEXT.md:130` mô tả thao tác ấy là
   gắn bản ghi CRM. Hai chữ cho một thao tác; "thẻ" trong tiếng Việt CRM đọc mặc định ra
   *gán nhãn*. Đã kiểm cả hai dòng — đúng nguyên văn như giám khảo dẫn.
2. **Cụm "bộ dựng" chưa có mục riêng** (spec-alignment). Lặp ở
   `agent-builder-tac-nhan.ts:214,216,227,232` và `agent-builder-o-soan.ts:43`; `CONTEXT.md`
   chỉ nhắc nó trong phần văn của mục **Ô soạn**.
3. **Vùng khoá `ma.*` với nhãn "Mã tác nhân"** (domain-correctness).
   `agent-builder-ket-qua.ts:4,55,59` — có thể đọc lẫn với nghĩa «mã định danh» quen thuộc
   của CRM. Giám khảo tự ghi rằng nhãn đứng cạnh cây tệp thì có lẽ không ai nhầm, nên đây
   là mục nhẹ nhất trong ba.

## Hai mục KHÔNG phải khiếm khuyết — đọc đúng bản chất

- **`thoaThuan.ngayNamIm` giữ "nằm im từ N ngày"** (`agent-builder-ket-qua.ts:95`, không
  thêm dấu "+" của bản `en` dòng 44) là **QUYẾT ĐỊNH của chủ kho**, đã chốt trước vòng này.
  domain-correctness có nêu vì chấm kín và không được biết quyết định đó. Ghi ở đây để
  người ký không đọc nhầm thành lỗi.
- **Cụm `khiNao` = "Chạy khi nào"** (`agent-builder-tac-nhan.ts:182`) khác với "mốc kích
  hoạt" (`:205`) là chỗ **CHƯA được yêu cầu sửa**. Vòng này không lăng kính nào nêu lại nó;
  hồ sơ giữ nguyên lập trường vòng 5 và KHÔNG đòi sửa.

## Một quan sát ngoài hợp đồng — phiên ghi ra, không tự sửa

**Tên khoá `duongOng` mang chữ trong `_Avoid_`** (`agent-builder-ket-qua.ts:47,97`). Giá trị
hiển thị đúng — bản `vi` ra "đang mở", bám mục **Đang mở** của `CONTEXT.md:166-169`. Chỉ TÊN
KHOÁ còn chữ mà chính mục ấy cấm ở dòng `_Avoid_`. spec-alignment nêu và TỰ XẾP là ngoài
phạm vi AC-13: tiêu chí chấm chữ người đọc thấy, không chấm tên khoá. Phiên này đồng ý và
không đề nghị sửa trong vòng này.

## Tính sạch của hội đồng

Ba giám khảo được dispatch TRONG nghi thức nghiệm thu, mỗi người một context sạch, mỗi người
một lăng kính, không mang một chữ nào từ phía người sửa mã. Lời dặn cấm mọi lệnh git đọc
lịch sử (`diff`, `log`, `show`, `blame`) và cấm mọi vật `_acceptance/` ngoài `contract.md` —
tức không ai thấy phán quyết vòng trước, hồ sơ bằng chứng, sổ quyết định hay `s4-args.json`.
Cả ba trả CHẬM (267s · 343s · 388s) nhưng đều trả; không lăng kính nào phải tự chấm thay, và
không phiếu nào là của phiên điều phối.

Dấu hiệu chấm kín thật: cả ba đều nêu lại bốn mục vòng 5 mà không ai nhắc tên vòng 5, hai
lăng kính tìm ra `tableTitle` một cách độc lập, và không lăng kính nào nêu lại câu chào —
chỗ người TRẢ LẠI ở vòng 4 — dù không ai được biết nó từng là vấn đề.

## Ghi chú nghi thức

- **Nếp tuần tự giữ nguyên như vòng 5 đã chứng.** E9 (đột biến, cắm vết vào `CONTEXT.md` và
  ba kho chuỗi — đúng bốn file đầu vào của E18) chạy MỘT MÌNH và chạy TRƯỚC khi hội đồng
  được dispatch. E11 (thả một file `.tsx` tiếng Anh vào thư mục lát) bị GIỮ LẠI tới khi cả
  ba phiếu đã về. `git status` trước/sau của cả hai chân bằng nhau, kiểm tận tay ở cả hai
  lượt.
- **Một vết nhỏ trong bản ghi vòng 5.** Khối E12 của báo cáo vòng 5 có dòng `GIOI HAN KE
  THUA: mu voi vung chua cho xuong dong.` Chân của hồ sơ NÀY không in dòng đó; chuỗi ấy do
  `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs:700` của một hồ sơ KHÁC
  in ra. Giới hạn là THẬT — hợp đồng khai ở AC-9 và ở Known limits — chỉ là nó không tới từ
  output của lượt chạy. Vòng này chép output nguyên văn và để giới hạn ấy ở đúng chỗ của nó.
  Không phải khiếm khuyết sản phẩm, không phải eval đỏ.
- **Vòng này vượt trần ba vòng của skill**, chạy theo chỉ đạo trực tiếp của người.
- **Không hạ thước, không sửa sản phẩm.** Cây làm việc chỉ đổi ở `run-log.jsonl` (ghi lúc
  chạy), `evidence-report.md`, `review-findings.md` và `s4-args.json` (máy sinh trước phiên).
- **Bằng chứng không hoá cũ:** không file nào ngoài `_acceptance/` đổi sau `4159e3ba`.
