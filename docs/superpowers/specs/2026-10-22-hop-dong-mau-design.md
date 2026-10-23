# Bộ hợp đồng mẫu — thiết kế

Hàng DA22 `hop-dong-mau` của `docs/plan/lo-trinh-viec-du-an.json`, gói `truong-hop-dong` (#511), dãy R1 của đợt
`viec-du-an-kho-tai-lieu`. Câu giao: «Lệnh nạp mẫu tạo bộ hợp đồng mẫu PDF và DOCX có nhãn và gắn vào ô Tệp của bản ghi
mẫu qua đường ghi thật». Hạng T2, `du_lieu: sinh-gia`. Cổng Đáng: build, manh, 2026-10-21T23:04:34Z. Mốc đợt 22/10.

Soạn trên giấy theo luật 45 của đợt: hàng này chưa viết mã tới khi DA19 `truong-tep` (#532) gộp. Thiết kế đọc onehub
`33ddf1b02` và nhánh DA19 `feat/truong-tep` (`89cb431c1`: thiết kế, hợp đồng đã ký Cổng Phạm vi 21/10 22:32Z, kế hoạch),
chỉ đọc.

Đã đọc: `CLAUDE.md` (mục «Lộ trình là việc dựng; thiếu dữ liệu thì dùng dữ liệu mẫu»), `AGENTS.md`, `docs/api.md`,
`docs/setup.md`, LUAT.md của đợt (luật 16, 36, 45), thiết kế, hợp đồng và kế hoạch DA19, `apps/api/scripts/okr-mau/**` và
hồ sơ `_acceptance/bo-okr-mau/`, `packages/db/scripts/require-local-db.ts`, `packages/db/prisma/seed.ts`,
`apps/agent/agent/lib/tai-lieu-doc-chu.ts`, `apps/agent/test/dung-mau-tai-lieu.ts`, `packages/db/src/blob-nguon.ts` và
hai kho Blob giả của nó, `morphological-scan` (`_acceptance/hop-dong-mau/coverage-scan.md`). Không chạm UI nên không nạp
`docs/design.md` và không có đặc tả UX.

## Hiện trạng

| Chỗ | Hôm nay (onehub `33ddf1b02`) | Sau DA19 |
|---|---|---|
| Ô Tệp | Không có kiểu `FILE`. | `FieldFile` mỗi tệp một hàng; trùng `sha256` trong cùng ô trả hàng cũ. |
| Ghi tệp | — | `FieldFilesService.requestUpload` → PUT lên URL đã ký → `complete` (kế hoạch DA19, Task 4). |
| Thiếu khoá | — | `TEP_BAN_GHI_BLOB_TOKEN` vắng: `status` trả `{ bat: false }`, ghi tệp trả `PRECONDITION_FAILED`. |
| Lệnh nạp mẫu | `okr:mau` (`apps/api/scripts/okr-mau.ts`): chặn ở `kiemDuocNap` trước khi nạp mô-đun kho; mã thoát 2–5. | — |
| Đọc chữ | `tai-lieu-doc-chu.ts`: PDF bằng `unpdf`, DOCX bằng `mammoth`; trang dưới 40 ký tự là bản quét, trả `can-go-tay`. | DA23 đọc ô Tệp bằng đúng bộ đọc này. |
| Sinh tệp mẫu | `apps/agent/test/dung-mau-tai-lieu.ts` dựng PDF bằng `pdf-lib` + `fontkit`, DOCX bằng XML viết tay nén zip, bản quét bằng ảnh xám; byte commit ở `_acceptance/may-soan-de-xuat/mau/`. | — |

## Phương án

### 1. Bộ mẫu là byte đã commit, kèm đáp án

Sáu tệp sinh một lần bằng bộ dựng có sẵn ở `apps/agent` (`pdf-lib`, `fontkit`, zip XML viết tay), byte commit vào
`packages/db/mau/hop-dong/`, cạnh `dap-an.json`. Lệnh nạp đọc byte ấy, không sinh lúc chạy.

Vì sao byte commit chứ không sinh lúc chạy (một lối sống): chạy lại không nhân đôi đứng trên luật trùng `sha256` của DA19,
nên byte phải giống hệt ở mọi lượt, mọi máy. Sinh lúc chạy cần phông có dấu tiếng Việt trên máy CI Linux (bộ dựng có sẵn
đọc phông ở đường dẫn macOS) và cần `pdf-lib` cho ra cùng byte qua mọi bản nâng cấp — đổi một bản thư viện là chạy lại sinh
tệp mới thay vì gặp tệp cũ. Byte commit không có hai rủi ro đó.

Sáu tệp, theo Core của bảng quét:

| Mã | Dạng | Ngày ký | Hết hạn | Giá trị (đồng) |
|---|---|---|---|---|
| HD1 | PDF có lớp chữ | 2026-03-05, viết «ngày 05 tháng 03 năm 2026» | 2027-03-04, viết «04/03/2027» | 1.250.000.000, viết số |
| HD2 | PDF có lớp chữ | 2026-04-12, viết «12/04/2026» | 2027-04-11, suy từ «có hiệu lực 12 tháng kể từ ngày ký» | 860.000.000, viết số |
| HD3 | DOCX | 2026-06-20, viết chữ | 2028-06-19, viết số | 2.300.000.000, viết «Hai tỷ ba trăm triệu đồng (2.300.000.000 đồng)» |
| HD4 | DOCX | 2026-07-15, viết số | 2026-12-31, viết số | vắng — `null` |
| HD5 | PDF quét, không lớp chữ | 2026-08-01 (trong ảnh) | 2027-07-31 (trong ảnh) | 480.000.000 (trong ảnh) |
| HD6 | PDF có lớp chữ, phụ lục của HD1 | 2026-09-10, viết số | vắng — `null` | 1.400.000.000, «giá trị sau điều chỉnh» |

Hai chỗ cố ý làm khó, ghi vào đáp án để DA23 chấm đúng: hết hạn của HD2 suy theo luật «ngày ký + 12 tháng − 1 ngày»
(trường `suyTu` của đáp án nêu luật ấy); HD6 nhắc lại số và ngày ký của HD1 («phụ lục của hợp đồng số 01/2026 ký ngày
05/03/2026») nhưng không chép ngày hết hạn của HD1 — bộ trích lấy ngày ký HD1 cho HD6 là sai.

`dap-an.json` mỗi tệp một dòng: mã, tên tệp, kiểu, `sha256`, thoả thuận mẫu đích, `coChu` (có đọc được chữ không),
`ngayKy`, `ngayHetHan`, `giaTri` (số đồng, hoặc `null`), và với mỗi thuộc tính khác `null` là đoạn chữ đúng như viết trong
tệp. Khuôn đáp án khai bằng Zod ở `packages/validation/src/hop-dong-mau.ts` (khuôn vượt ranh gói: lệnh nạp ở `apps/api`
đọc, DA23 ở `apps/agent` đọc); bộ đọc `boHopDongMau()` ở `packages/db/src/hop-dong-mau.ts` đọc byte và phân tích đáp án
một lần. Giá trị ngày và tiền chọn để lệch nhau giữa các tệp, để một bộ trích chép nhầm tệp không ra đúng đáp án.

### 2. Nhãn mẫu trên mọi tệp

- Tên tệp mở đầu `MAU-` (`MAU-HD1-hop-dong-hop-tac.pdf`).
- Siêu dữ liệu: PDF `Title` và `Subject` mang «Bản mẫu — không phải hợp đồng thật»; DOCX `docProps/core.xml` mang cùng câu
  ở `dc:title` và `dc:subject`.
- Tệp có chữ: dòng đầu nội dung là «BẢN MẪU — KHÔNG PHẢI HỢP ĐỒNG THẬT». Bản quét mang câu ấy trong ảnh và ở siêu dữ liệu.
- Bên trong hợp đồng là hai bên hư cấu đánh dấu mẫu («Công ty Đối tác Mẫu A · mẫu»), không tên công ty thật.

### 3. Lệnh nạp: `bun run hop-dong:mau`

Khuôn của `okr:mau`: `package.json` gốc `hop-dong:mau` → `apps/api` `bun scripts/hop-dong-mau.ts`, thư mục
`apps/api/scripts/hop-dong-mau/` (`cau-hinh.ts` hằng và mã thoát, `chan.ts`, `lenh.ts`, `nap.ts`).

1. **Chặn trước mọi thứ.** Tệp vào chỉ nạp `@crm/env/load`, cấu hình và bộ chặn; gọi `kiemDuocNap` của
   `apps/api/scripts/okr-mau/chan.ts` (một luật «máy cục bộ» cho hai lệnh mẫu, không sửa tệp ấy) rồi mới `await import`
   phần nạp. Câu từ chối và mã thoát là của lệnh này: câu của `kiemDuocNap` nói «bộ OKR mẫu», nên `chan.ts` của lệnh dựng
   lại câu theo `lyDo` trả về.
2. **Kiểm tiền đề, chưa ghi gì.** Workspace `WORKSPACE_ID` có chưa (thiếu → mã `sai`, như `okr:mau`); kho tệp bật chưa
   (`FieldFilesService.status().bat` sai → mã `khoTat`, câu nói đặt `TEP_BAN_GHI_BLOB_TOKEN` ở `.env`); khoá trường `hop-dong`
   của Thoả thuận đã có với kiểu khác `FILE` → mã `sai`, nêu tên trường. Mọi kiểm này xong trước lần ghi đầu.
3. **Người làm.** Theo Hỏi-1.
4. **Bản ghi mẫu qua service.** Một công ty «Công ty Đối tác Mẫu A · mẫu» qua `CompaniesService.create`, sáu thoả thuận
   «HĐ mẫu HD1 · mẫu»… qua `DealsService.create` (chủ là người làm), cộng một thoả thuận «HĐ mẫu không tệp · mẫu» không gắn
   tệp (để bộ lọc «Chưa có tệp» của DA19 có hàng). Chạy lại tìm theo tên trước khi tạo.
5. **Trường «Hợp đồng».** Kiểu `FILE` trên Thoả thuận qua `FieldsService.create` (`agentFilled: false` — DA19 không cho Kara
   ghi ô Tệp; `showOnSheet`, `showOnTable`, `showOnFilter` bật). Đã có đúng kiểu thì dùng lại.
6. **Gắn tệp qua đường ghi thật.** Mỗi tệp: `requestUpload` → `fetch(url, { method: "PUT", body })` như trình duyệt →
   `complete`. Lần chạy lại gặp `{ trung: true }` và DA19 xoá Blob vừa PUT — đó là luật không nhân đôi. Không lời gọi Prisma
   nào ghi `fieldFile`, `blobChoXoa`, `deal`, `company` hay `fieldDefinition` trong thư mục lệnh.
7. **Lỗi giữa chừng.** Không giao dịch bao trùm (ba bước tải đi qua mạng). Lượt sau chạy lại từ đầu: bản ghi tìm theo tên,
   trường dùng lại, tệp đã gắn trả `trung`, tệp tải dở do DA19 dọn sau hạn phiếu.
8. **Báo cáo.** In mỗi tệp một dòng: mã, thoả thuận, «đã gắn» hay «đã có», rồi tổng; mã thoát 0.

Service dựng bằng `new` với `db`, như `nap-tai-lieu.ts` của `okr:mau`; kế hoạch S2 đọc chữ ký hàm thật của
`FieldFilesService` sau khi DA19 gộp.

### 4. Chặn production

Một luật với `okr:mau` (`_acceptance/bo-okr-mau` E9 đã ký): `NODE_ENV=production`, `VERCEL_ENV` là `production` hay
`preview`, URL kho không phải máy cục bộ (kể cả `?host=`, `?hostaddr=`), thiếu URL — đều từ chối với mã `chan`; không cờ nào
vượt (`ALLOW_REMOTE_DB` bị bỏ qua). Từ chối xảy ra trước khi mô-đun kho và mô-đun Blob được nạp, nên không có yêu cầu nào
tới kho hay Blob.

### 5. Đo

- **Bộ mẫu** (`apps/agent/test/hop-dong-mau.spec.ts`): đọc từng tệp bằng chính `tai-lieu-doc-chu.ts` mà DA23 dùng.
- **Lệnh nạp** (`apps/api/test/hop-dong-mau.spec.ts`): kho thử của lượt, workspace dựng bằng khuôn `okr-mau-san.ts`, kho
  Blob giả theo hợp đồng thật của DA19 (máy chủ `Bun.serve` mà bài của DA19 dùng, giữ byte đã PUT và đếm lượt xoá). Gọi
  lệnh như tiến trình con khi đo mã thoát và chặn; gọi hàm `chayLenh` khi đo dữ liệu.
- Không đo trên Blob thật ở hàng này: DA19 AC-2 đã đo kho riêng tư thật; hàng này chỉ dùng đường ghi ấy.

## Câu hỏi cho Cổng Phạm vi

- **Hỏi-1.** Tệp mẫu do ai tải lên. Máy khuyên **một người dùng mẫu có nhãn** (`mau-hop-dong-nguoi`,
  `hop-dong@mau.onehub.test`, vai quản trị), tạo như `okr:mau` tạo người mẫu — đây là lần ghi thẳng bảng duy nhất của lệnh
  (bảng `user` và `member`), vì kho không có đường service tạo người ngoài đăng nhập, và đường đăng nhập là vùng T3. Người
  mẫu chỉ được tạo sau mọi bước kiểm của mục 3.2. Lối khác: dùng quản trị đầu tiên đang có của workspace — không ghi thẳng
  bảng nào, giá là tệp mẫu hiện «tải bởi <người thật>», nút xoá theo luật Hỏi-2 của DA19 thuộc về người ấy, và AC-6 thêm ca
  «workspace chưa có quản trị» (mã `sai`, câu nói chạy `dev:session` với một email quản trị); AC-3 gạch người làm đổi theo.
- **Hỏi-2.** Gắn tệp vào loại bản ghi nào. Máy khuyên **chỉ thoả thuận mẫu**: DA19 AC-2 đã chứng ô Tệp trên ba loại, và DA23
  đo trích thuộc tính từ tệp chứ không từ loại bản ghi. Lối khác: thêm một công ty và một cá nhân mẫu, mỗi bên một tệp — DA23
  đo được trên phiếu cả ba loại, giá là ba trường «Hợp đồng» thay vì một và AC-3, AC-4 đếm thêm hai loại.
- **Hỏi-3.** Đo trên kho Blob riêng tư thật. Máy khuyên **không**: hàng này chỉ dùng đường ghi của DA19, mà DA19 AC-2 đã
  đo PUT, đọc lại và xoá trên kho thật; ở đây đo trên kho giả theo hợp đồng thật. Lối khác: thêm một ca chạy lệnh trên kho
  thật khi máy có khoá dev (bật bằng cờ, như `TTB_BLOB_THAT=1` của DA19) — bắt được một lệch giữa kho giả và kho thật ở bước
  PUT, giá là một khoá Blob nữa cho máy đo và một ca không chạy trên CI.

## Không làm trong hàng này

- Gỡ bộ mẫu (`--xoa`): dữ liệu mẫu chỉ sống ở kho cục bộ; gỡ tay đi qua lưu trữ rồi xoá vĩnh viễn của DA19.
- Ảnh PNG/JPEG quét, PDF nhiều trang, điều khoản gia hạn tự động (Later của bảng quét).
- Gắn tệp vào công ty hay cá nhân mẫu.
- Tạo trường «Ngày ký», «Ngày hết hạn» bật «Kara điền» — việc của DA23; tạo trường «Kara điền» xếp ngay việc điền bù cho
  agent.
- Thay khuôn bằng hợp đồng thật của OneHub.
- Nạp bộ mẫu lúc `db:seed`.
