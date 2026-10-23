# Quét độ phủ — truong-tep (DA19)

Preset `entity-feature` của skill `morphological-scan`. Đọc trên onehub `110a07377` và nhánh DA18
`feat/loc-moi-truong` (`680bc1d38`, chỉ đọc), nhánh DA17 `feat/sort-moi-truong` (chỉ đọc).

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub. Người dùng là nhân viên quan hệ đối tác (vai `member`), quản trị (`owner`, `admin`),
  vai «chỉ OKR» (`okr`, không đọc dữ liệu đối tác). Hợp đồng với đối tác nằm ngoài CRM.
- Chân sản phẩm: đào repo.
  - Luật đích và dòng Tệp của bảng kiểu [SUY-TỪ-REPO: docs/design.md].
  - Câu giao, ghi chú hàng (nhiều tệp, PDF DOCX ảnh, Blob riêng tư ký trước, quyền tạm, purgeExpired xoá kèm Blob)
    [SUY-TỪ-REPO: docs/plan/lo-trinh-viec-du-an.json].
  - Một hàng giá trị mỗi trường × bản ghi, mười kiểu [SUY-TỪ-REPO: packages/db/prisma/schema.prisma].
  - Đường ký trước PUT, đọc lại byte, phiếu HMAC, thiếu khoá thì tắt [SUY-TỪ-REPO: packages/db/src/blob-nguon.ts].
  - Giới hạn 20 MB, URL tải về 300 giây [SUY-TỪ-REPO: packages/validation/src/tai-lieu-nguon.ts].
  - Xoá bản ghi là lưu trữ rồi xoá vĩnh viễn, cron dọn [SUY-TỪ-REPO: docs/api.md].
  - Ba câu vòng đời [SUY-TỪ-REPO: docs/vong-doi.md].
  - Mã hoá bộ lọc `field:<khoá>=<giá trị>`, `none` là trống [SUY-TỪ-REPO: docs/superpowers/specs/2026-10-21-loc-moi-truong-design.md trên nhánh feat/loc-moi-truong].
  - Ghi giá trị qua `*.update` với `data.fields`, `coerceValue` rơi về chữ ở `default`
    [SUY-TỪ-REPO: packages/db/src/fields.ts].
- Chân ngành: HubSpot có kiểu thuộc tính «File» — tệp gắn vào bản ghi, tối đa 10 tệp mỗi thuộc tính, trần 20 MB ở gói
  miễn phí, người tạo thuộc tính chọn ai xem được tệp [NGÀNH: HubSpot CRM, knowledge.hubspot.com «Property field types»].
  Pipedrive chỉ có tab Files trên thoả thuận và dùng trường nhiều lựa chọn để gắn loại tài liệu; người dùng của nó xin
  trường chứa tệp [NGÀNH: Pipedrive, community.pipedrive.com] — cận kề, cho thấy cách «tab tệp chung» không lọc được.

## Trục

- **Vòng đời tệp**: tải lên một tệp · tải nhiều tệp · tệp trùng trong ô · tải lên bị từ chối · tải dở · xem tên và số tệp · mở
  hay tải về · xoá khỏi ô · bản ghi lưu trữ · bản ghi xoá vĩnh viễn (tay và lịch dọn) · trường lưu trữ · trường xoá.
  [thước CE: vòng đời của `docs/vong-doi.md` + chuỗi `xinCho → PUT → nhan` của `docs/api.md` mục «Kho tài liệu: nguồn»]
- **Người × quyền**: quản trị · nhân viên (`member`) · vai «chỉ OKR» · người cầm URL đã ký lọt ra · Kara · lệnh nạp mẫu
  (DA22). [thước CE: `WORKSPACE_ROLES` (`packages/validation/src/vai-workspace.ts`) + ghi chú quyền tạm của hàng + DA22]
- **Mặt**: Cài đặt › Trường · phiếu (Thoả thuận, Công ty, Cá nhân) · ô bảng · thẻ bảng cột · form tạo · bộ lọc và số
  đếm · bộ lọc đã lưu và chiến dịch · sort · lối ghi chữ (`*.update`, Kara). [thước CE: bảng kiểu ở `docs/design.md`
  mục «Trường» (sáu mặt) + mục «Luật» (nơi hiện)]
- **Hạ tầng**: khoá có · khoá thiếu · xoá Blob hỏng · Blob giả theo hợp đồng · Blob riêng tư thật.
  [thước CE: luật 35 của đợt + `AGENTS.md` «Anything a self-hoster might not have is optional and must never throw»]

## Không gian

Vòng đời × người là lõi (11 × 6 = 66 ô, gạch ô vô nghĩa: OKR và URL lọt chỉ có nghĩa ở «xem» và «mở»; Kara chỉ có
nghĩa ở «tải lên» vì Kara không ghi tệp ở hàng này; lệnh nạp mẫu chỉ ở «tải lên» và «trùng»). Còn 31 ô có nghĩa. Mặt và
hạ tầng cắt ngang.

## Core

1. Quản trị tạo trường Tệp cho ba loại bản ghi ở Cài đặt › Trường — cửa vào của mọi ô khác. → AC-1
2. Nhân viên tải một và nhiều tệp lên ô trên phiếu, thấy tên, cỡ, ngày, người tải; bảng và thẻ hiện số tệp. → AC-2
3. Tải lên bị từ chối (kiểu theo byte thật, cỡ, rỗng, quá số tệp, phiếu giả, bản ghi hay trường đã lưu trữ, trường khác
   loại) và tệp trùng trong ô; bị từ chối thì Blob bị xoá. → AC-3
4. Ai thấy tên, ai mở được (quyền tạm: chỉ quản trị), URL ký có hạn, vai «chỉ OKR» không thấy gì. → AC-4
5. Lọc «Có tệp» / «Chưa có tệp» trên ba danh sách, bảng cột, số đếm, bộ lọc đã lưu, chiến dịch — cùng cách mã hoá DA18.
   → AC-5
6. Xoá một tệp khỏi ô. → AC-6
7. Bản ghi lưu trữ giữ tệp; xoá vĩnh viễn (tay, lịch dọn) và xoá trường kéo theo xoá Blob, có thử lại khi Blob hỏng;
   tệp tải dở (PUT mà không `complete`) được dọn sau hạn phiếu.
   → AC-7
8. Thiếu khoá thì mất khả năng tải lên và mở, tên tệp vẫn hiện, không ném lỗi, không mượn khoá kho khác. → AC-8
9. Mọi lối ghi chữ (`*.update`, Kara) bị từ chối với ô Tệp; sort bỏ qua ô Tệp; form tạo không vẽ ô Tệp. → AC-9
10. Màn bấm được ở 1280 và 375. → AC-10

Lệnh nạp mẫu (DA22) không có AC riêng: nó đi đúng đường của ô 2 và 3 (service thật, tệp trùng trả bản cũ — chạy lại
không nhân đôi). Thiết kế mục 3 ghi ràng buộc ấy.

Core 10 trên 31 ô có nghĩa, cao hơn trần 20% của preset: ô Tệp là một kiểu mới đi qua mọi mặt đã có của bảng kiểu, và
luật đích (`docs/design.md` «một trường, một cách cư xử») đòi đủ mặt. Phần cắt nằm ở Later.

## Later

- Mở tệp theo chủ bản ghi, quyền đi theo khi đổi chủ — DA20.
- Kara đọc chữ trong tệp để điền trường — DA23.
- Bộ hợp đồng mẫu gắn vào ô qua đường ghi thật — DA22.
- Xem trước PDF ngay trên phiếu (khung xem) thay cho mở tab mới.
- Quét mã độc tệp tải lên [NGÀNH: HubSpot không quét tệp thuộc tính; Google Drive có] — để sau, kho riêng tư và chỉ
  quản trị mở.
- Ô Tệp trong form tạo và ô thêm nhanh: bản ghi chưa có id nên chưa có chỗ gắn; thêm sau khi tạo.
- Bật «Bắt buộc» cho trường Tệp (DA15) — cùng lý do.
- Đổi tên tệp, sắp lại thứ tự tệp trong ô.
- Sort theo số tệp.
- HEIC, XLSX, ZIP.
- Người tạo trường chọn ai xem tệp như HubSpot [NGÀNH: HubSpot] — kho chốt một luật cho mọi trường Tệp (`docs/design.md`).

## Never

- Loại bản ghi Hợp đồng riêng — chủ kho chốt 20/10 «kiểu trường Tệp, không dựng loại bản ghi riêng».
- Byte đi qua Nest — `docs/api.md`: «The browser uploads, the API only signs and receives».
- Dùng chung kho Blob và khoá của Kho tài liệu — luật 35.
- Lưu tệp trong Postgres — cỡ hợp đồng scan, và kho đã có Blob riêng tư.

## Cắt ngang mọi ô Core

- Dữ liệu cá nhân: hợp đồng chứa tên, số giấy tờ, chữ ký của đối tác. Kho riêng tư, URL tải về ký có hạn, chỉ quản trị
  mở, xoá vĩnh viễn bản ghi là xoá cả byte. Khung pháp lý không vào lộ trình (lộ trình là việc dựng).
- Mọi chữ trên màn theo `CONTEXT.md` («trường», «trường tự tạo», «Xoá», «Đã lưu trữ»); tên tệp người tải là dữ liệu
  người nhập, mang `translate="no"`.
- Mọi lỗi khi lưu nói tiếng người dùng và theo kiểu (`docs/design.md`).
- Trạng thái chờ tải, lỗi tải, rỗng có ở ô Tệp.
