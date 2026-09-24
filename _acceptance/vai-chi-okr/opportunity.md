---
schema_version: 1
slug: vai-chi-okr
feature: Vai «chỉ OKR» — người ngoài khối kinh doanh đăng nhập được, thấy khu OKR và hồ sơ của chính mình, nhưng không đọc được dữ liệu đối tác qua bất kỳ cửa nào
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan — uỷ quyền phiên điều phối 2026-09-24
decided_at: 2026-09-24T16:05:00Z
prototype:
  base_commit: 47f98e009491db908cd9999ef88dbca5c71bb5c7
  disposition: archive
---

## Vấn đề & ai gặp

Lộ trình OKR (`docs/plan/lo-trinh-okr.md`, chốt 2026-09-24) mở CRM cho **mọi
phòng ban** từ 2026-10-26 — kể cả người chưa từng dùng nó. Hôm nay CRM chỉ có ba
vai workspace (chủ sở hữu, quản trị, thành viên) và **mọi thành viên đọc được toàn
bộ dữ liệu đối tác**: cá nhân, công ty, thoả thuận, chiến dịch, kế hoạch 30 ngày,
thư đã đồng bộ. Vai lạ ghi vào bảng thành viên bị hạ im lặng về «thành viên»
(`toWorkspaceRole`), nên không có cách nào cho một người vào CRM mà *không* thấy
dữ liệu đối tác.

Hồ sơ `go-la-cat-quyen-that` (ký 2026-09-23) vừa dựng lớp kiểm tư cách chặn-mặc-định
ở lớp chung của API: mỗi lời gọi hỏi «có phiên và còn là thành viên». Lớp đó chỉ
trả lời *có phải người trong kho không*, chưa trả lời *người này được đọc phần
nào*.

**Người gặp:** nhân viên ngoài khối kinh doanh (mục tiêu: đặt và cập nhật OKR của
phòng ban mình) — họ không có lý do gì để thấy danh bạ đối tác; và chủ sản phẩm —
không thể mở CRM cho cả công ty khi chưa có vai này (mục 6 lộ trình: «nếu lượt 2
trễ, ngày bắt đầu lùi theo tuần, không bỏ lượt 2»).

Vật liệu nền: mục «Vai «chỉ OKR»» trong `CONTEXT.md` (chốt 2026-09-23), mục 5
«Lượt 2» của lộ trình, hồ sơ đã ký `go-la-cat-quyen-that` (contract + design doc).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Một chỗ chặn ở lớp chung của API (phạm vi dữ liệu theo phạm vi router) đóng được đủ năm cửa: màn, tRPC, REST, khoá API, trợ lý AI | Sót một cửa là người ngoài khối kinh doanh đọc được đối tác ngày mở cửa | Ma trận rút từ sổ router lúc chạy cho từng cửa, người mang vai «chỉ OKR» — đỏ trước khi vá | Sẽ thử ở S3/S4 |
| 2 | Người mang vai này không cần hộp thư (Gmail/Outlook) — đăng nhập Google không được đòi cấp quyền hộp thư | Người mới bị chặn ở màn xin quyền hộp thư, không vào được, hoặc cấp rồi thư của họ đổ vào CRM | Đọc `requireMailboxAccess`: tường xin quyền áp cho mọi tài khoản chỉ đăng nhập bằng Google — sai với vai này | Đã đọc mã: giả định đúng, phải vá |
| 3 | Vai là chuyện gán từng người ở màn Thành viên và lời mời; không suy từ phòng ban | Phải sửa cây tổ chức của lượt 1 | `CONTEXT.md` mục «Vai «chỉ OKR»» chốt 2026-09-23 | Đã chốt |
| 4 | Lượt này chưa có khu OKR nên Tổng quan rút gọn là đủ để «đăng nhập được» | Người mới vào thấy màn trống, không biết làm gì | Tổng quan rút gọn nói rõ khu OKR mở ở lượt sau và trỏ tới Cài đặt cá nhân | Chấp nhận, ghi trong hợp đồng |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau khi mở CRM cho cả công ty, có người mang vai «chỉ OKR» nào đọc được dữ liệu đối tác không, và họ có vào được CRM không?
- Kết quả nào là SỐNG: 0 lượt đọc dữ liệu đối tác thành công của vai «chỉ OKR» trong nhật ký sau hai tuần kể từ 2026-10-26 (số từ nhật ký lời gọi tRPC: vai = chỉ OKR · phạm vi = đối tác · kết quả = ok).
- Kết quả nào là CHẾT: ≥ 1 lượt đọc như trên; hoặc một người mang vai này bị chặn ở màn xin quyền hộp thư.
- Kết quả nào là SỐNG (vế đăng nhập): ≥ 90 % người được gán vai «chỉ OKR» đã đăng nhập ít nhất một lần trong hai tuần đầu (số từ bảng phiên nối bảng thành viên theo vai — đã có sẵn trong cơ sở dữ liệu).
- Timebox: đo ở phiên nghiệm thu R1 ngày 2026-11-13 (mục 6 lộ trình).

## Kết quả prototype

Không dựng bản mẫu: vòng này đi thẳng vào vòng làm vì quyết định «có vai này» đã
chốt ở lộ trình và ở từ điển sản phẩm (2026-09-23); thứ còn mở là *cách chặn*, và
đó là việc của Cổng Phạm vi.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Lớp kiểm tư cách chặn-mặc-định, ma trận rút từ sổ router | `_acceptance/go-la-cat-quyen-that/` (trong kho) | triết-lý/logic | có | — |
| Chuẩn «chặn mặc định» cho kiểm soát truy cập | OWASP ASVS, chương kiểm soát truy cập | triết-lý/logic | có | — |
| Tiền lệ giấy phép «đăng nhập được mà không thấy đối tượng CRM» | Salesforce, giấy phép Chatter Free | triết-lý/logic (chỉ để đối chiếu hình dạng vai) | không | — |

Không có vật liệu ngôn-ngữ-thiết-kế/hình-thái nào từ ngoài kho: giao diện dùng
component sẵn của `/packages/ui`.

## Cổng 0

- **decision = build.** Căn cứ: lộ trình OKR mục 5 «Lượt 2» và mục 6 — không mở CRM cho người ngoài khối kinh doanh khi vai này chưa lên; chủ kho chốt 2026-09-23, uỷ quyền phiên điều phối ký các cổng của lượt ngày 2026-09-24.
- **disposition = archive.** Căn cứ: không có mã bản mẫu.
- **Ngưỡng UAT chốt cùng lúc ký:** 0 lượt đọc dữ liệu đối tác thành công của vai «chỉ OKR» trong nhật ký sau hai tuần; vế đăng nhập ≥ 90 % người được gán vai đăng nhập trong hai tuần đầu — chốt tại Cổng Phạm vi 2026-09-24.

## Thước đo thành công → ứng viên criterion

- Lượt đọc dữ liệu đối tác thành công theo vai và phạm vi dữ liệu, đếm được từ nhật ký lời gọi tRPC → AC về nhật ký mang vai và phạm vi.
- Người mang vai «chỉ OKR» đăng nhập bằng Google mà không bị đòi quyền hộp thư → AC về tường xin quyền hộp thư.
- Người mang vai «chỉ OKR» gõ tay đường dẫn tới màn dữ liệu thì thấy trang «ngoài phạm vi» → AC về proxy.

## Out of scope từ khám phá

- Quyền xem theo đơn vị cho dữ liệu đối tác (thành viên khối kinh doanh chỉ thấy đối tác của phòng mình) — chưa ai đòi; lộ trình ghi ngoài phạm vi.
- Khu OKR (màn, bảng, thủ tục `okr.*`) — lượt 3; lượt này chỉ đặt sẵn phạm vi dữ liệu `okr` để router sau này khai.
- Nhắc OKR qua Zalo/Slack cho vai này — lượt 5; kênh nhắc kế hoạch hôm nay chỉ gửi việc người đó cầm, người mang vai «chỉ OKR» không cầm việc nào.
- Các endpoint khác của Better Auth mà một người có phiên gọi thẳng được (organization plugin, `/sso/register`) — kế thừa Out of scope của `go-la-cat-quyen-that`, áp cho mọi người có phiên.
