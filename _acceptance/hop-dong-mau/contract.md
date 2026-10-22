---
schema_version: 1
feature: "Lệnh nạp mẫu tạo bộ hợp đồng mẫu PDF và DOCX có nhãn và gắn vào ô Tệp của bản ghi mẫu qua đường ghi thật"
slug: hop-dong-mau
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli, api]
status: approved
approved_by: manh
approved_at: 2026-10-22T01:00:15Z
design_doc: docs/superpowers/specs/2026-10-22-hop-dong-mau-design.md
---

# Acceptance Contract: hop-dong-mau

## Context

Hàng DA22 của `docs/plan/lo-trinh-viec-du-an.json`, gói `truong-hop-dong` (#511), `du_lieu: sinh-gia`. Chủ kho duyệt
Cổng Đáng (build) ngày 20/10/2026 («Tôi duyệt Cổng Đáng build cho cả 9 hàng.»), ghi vào ô ngày 21/10. Mốc đợt
2026-10-22.

DA22 đứng trên DA19 `truong-tep` (#532, Cổng Phạm vi đã ký 21/10 22:32Z, chưa gộp): ô Tệp, `FieldFilesService`
(`requestUpload` → PUT lên URL đã ký → `complete`) và luật trùng `sha256` trong cùng ô đều là của DA19. Soạn trên giấy theo
luật 45 của đợt; mã viết sau khi DA19 gộp onehub. DA23 `kara-doc-o-tep` đo độ đúng trích ngày ký, ngày hết hạn và giá trị
trên chính bộ mẫu này (luật 36), nên bộ mẫu mang đáp án.

Hôm nay: kho không có tệp hợp đồng nào để DA23 đo — dữ liệu chỉ có khi phòng ban tải hợp đồng thật lên. Lệnh mẫu duy nhất
là `okr:mau`, có bộ chặn production đã ký (`_acceptance/bo-okr-mau` E9).

Source input: `opportunity.md` · câu giao, `bat_khi` và ghi chú DA22 · hợp đồng, thiết kế và kế hoạch DA19 trên nhánh
`feat/truong-tep` · `CLAUDE.md` mục «Lộ trình là việc dựng; thiếu dữ liệu thì dùng dữ liệu mẫu» · LUAT.md của đợt (luật
16, 36, 45) · `apps/api/scripts/okr-mau/**` · `apps/agent/agent/lib/tai-lieu-doc-chu.ts` · design doc.

## Criteria

- AC-1: Given bộ mẫu ở `packages/db/mau/hop-dong/` và `boHopDongMau()`, When đọc sáu tệp và đáp án, Then:
  - đáp án phân tích qua khuôn Zod của `packages/validation/src/hop-dong-mau.ts`, có đúng sáu dòng HD1..HD6, mỗi dòng mang
    kiểu, `sha256`, thoả thuận mẫu đích, `coChu`, `ngayKy`, `ngayHetHan`, `giaTri`;
  - `sha256` của byte mỗi tệp trên đĩa bằng `sha256` trong đáp án;
  - mỗi tệp mang nhãn mẫu ở ba chỗ: tên tệp mở đầu `MAU-`; siêu dữ liệu (PDF `Title`/`Subject`, DOCX `dc:title`/`dc:subject`)
    mang «Bản mẫu — không phải hợp đồng thật»; tệp có chữ thì dòng đầu là «BẢN MẪU — KHÔNG PHẢI HỢP ĐỒNG THẬT»;
  - bộ phủ đủ năm ô Core của bảng quét: PDF có lớp chữ, DOCX, PDF quét, hết hạn suy từ thời hạn, một thuộc tính vắng.
- AC-2: Given sáu tệp và `tai-lieu-doc-chu.ts` của `apps/agent`, When đọc chữ từng tệp, Then:
  - năm tệp `coChu: true` trả chữ, và chữ chứa nguyên văn đoạn viết của mỗi thuộc tính khác `null` trong đáp án;
  - giá trị trong đáp án đúng bằng bảng giá trị của design doc mục 1 (ngày ký, ngày hết hạn, giá trị từng tệp), và
    hết hạn của HD2 bằng ngày ký + 12 tháng − 1 ngày;
  - tệp có thuộc tính `null` (giá trị của HD4, hết hạn của HD6) không chứa đoạn viết nào của thuộc tính ấy ở tệp khác;
  - HD5 (`coChu: false`) trả `can-go-tay`;
  - ngày ký, ngày hết hạn và giá trị khác nhau giữa các tệp, để một bộ trích lấy nhầm tệp không ra đúng đáp án.
- AC-3 (cross-layer): Given kho thử chỉ có workspace, kho tệp bật trên kho Blob giả theo hợp đồng thật của DA19, When chạy
  `hop-dong:mau` lần đầu, Then:
  - một công ty mẫu và bảy thoả thuận mẫu tạo qua service, tên mang « · mẫu»; sáu thoả thuận mang đúng tệp của đáp án,
    thoả thuận thứ bảy không có tệp;
  - trường «Hợp đồng» kiểu `FILE` trên Thoả thuận tạo qua `FieldsService.create`, «Kara điền» tắt;
  - mỗi tệp thành một hàng `FieldFile` đúng thoả thuận, với `sha256` bằng đáp án, và byte đi qua PUT lên URL đã ký của kho
    giả — kho giả giữ đúng sáu Blob;
  - `deals.byId` của mỗi thoả thuận trả tệp ấy trong `tepTheoTruong`, và `deals.list` lọc «Chưa có tệp» trả thoả thuận thứ
    bảy;
  - không lời gọi Prisma nào trong `apps/api/scripts/hop-dong-mau/**` ghi `fieldFile`, `blobChoXoa`, `deal`, `company` hay
    `fieldDefinition`; lần ghi thẳng duy nhất là người làm theo Hỏi-1;
  - lệnh in mỗi tệp một dòng và thoát 0.
- AC-4 (cross-layer): Given kho thử đã nạp một lần, cộng một thoả thuận, một công ty và một tệp của người dùng ngoài bộ
  mẫu, When chạy `hop-dong:mau` thêm hai lần, và một lần chạy bị ngắt sau tệp thứ ba rồi chạy lại, Then:
  - số công ty mẫu, thoả thuận mẫu, trường «Hợp đồng» và hàng `FieldFile` không đổi sau mỗi lần;
  - mỗi lần chạy lại in «đã có» cho cả sáu tệp;
  - kho Blob giả vẫn giữ đúng sáu Blob của bộ mẫu sau khi lượt dọn của DA19 chạy;
  - bản ghi và tệp của người dùng ngoài bộ mẫu không đổi.
- AC-5: Given `NODE_ENV=production`, `VERCEL_ENV` là `production` hay `preview`, URL kho trỏ máy xa (kể cả qua `?host=`,
  `?hostaddr=`, IPv6), hay thiếu URL — mỗi ca có và không có `ALLOW_REMOTE_DB=1` — When chạy `hop-dong:mau`, Then:
  - lệnh thoát mã `chan` với câu tiếng Việt nêu lý do, trước khi mô-đun kho và mô-đun Blob được nạp — kể cả qua import
    bắc cầu của các tệp lệnh nạp trước bộ chặn;
  - không yêu cầu nào tới kho hay kho Blob giả, và chữ lỗi kết nối không xuất hiện;
  - với máy cục bộ (`localhost`, `127.0.0.1`, `::1`) và `VERCEL_ENV=development`, chính lệnh `hop-dong:mau` đi qua bộ chặn
    (không thoát mã `chan`, không in câu từ chối).
- AC-6: Given kho cục bộ, When chạy `hop-dong:mau` khi thiếu `TEP_BAN_GHI_BLOB_TOKEN` (hay chỉ có khoảng trắng), khi thiếu
  workspace, và khi Thoả thuận đã có trường khoá `hop-dong` kiểu khác `FILE`, Then:
  - mỗi ca thoát một mã có tên khác 0, với câu tiếng Việt nói cách sửa (biến cần đặt, lệnh cần chạy trước, trường cần đổi
    tên);
  - không bản ghi, người dùng, thành viên, trường, tệp hay Blob nào được tạo;
  - lệnh không ném lỗi chưa bắt.
- AC-7 (judgment): Given `docs/setup.md`, When người mới đọc mục dữ liệu mẫu, Then họ biết `bun run hop-dong:mau` làm gì,
  cần gì trước (workspace, `TEP_BAN_GHI_BLOB_TOKEN`, DA19), chạy lại có an toàn không, nó không bao giờ chạy trên production,
  và đáp án cho DA23 nằm ở đâu.

## Coverage

Quét bằng `morphological-scan` (`coverage-scan.md`), preset `entity-feature`. Bốn trục:

- dạng tệp: PDF có lớp chữ · DOCX · PDF quét · ảnh quét · PDF nhiều trang;
- cách viết thuộc tính: ngày viết chữ · ngày số · hết hạn ghi ngày · hết hạn suy từ thời hạn · giá trị số · giá trị bằng
  chữ · thuộc tính vắng;
- lượt chạy × môi trường: lần đầu · chạy lại · chạy dở · kho xa hay production · kho tệp tắt · thiếu workspace · khoá
  trường lệch kiểu;
- đích gắn: thoả thuận mẫu · công ty mẫu · cá nhân mẫu · bản ghi thật.

Thước CE:

- kiểu nhận theo byte và luật trùng của ô Tệp [SUY-TỪ-REPO: docs/superpowers/specs/2026-10-21-truong-tep-design.md, nhánh
  feat/truong-tep];
- nhánh bản quét `can-go-tay` [SUY-TỪ-REPO: apps/agent/agent/lib/tai-lieu-doc-chu.ts];
- thuộc tính DA23 cần [SUY-TỪ-REPO: docs/plan/lo-trinh-viec-du-an.json DA23];
- nhãn thuộc tính hợp đồng cho bộ đáp án trích (Agreement Date, Effective Date, Expiration Date, Renewal Term)
  [NGÀNH: CUAD — Contract Understanding Atticus Dataset];
- chặn production và chạy lại [SUY-TỪ-REPO: _acceptance/bo-okr-mau/evals.yaml E7, E9].

Ánh xạ Core sang AC: năm ô dạng tệp × cách viết → AC-1, AC-2; lần đầu × thoả thuận mẫu → AC-3; chạy lại và chạy dở → AC-4;
production → AC-5; kho tệp tắt, thiếu workspace, khoá lệch kiểu → AC-6. Later và Never ở `coverage-scan.md`.

## Đường đo

Ngưỡng của ô Cổng Đáng (từ `bat_khi` của hàng):

- Thước: chạy lại hai lần không nhân đôi tệp · số từ: đếm hàng `FieldFile`, bản ghi mẫu và Blob trong kho giả sau mỗi lần
  · bảo đảm bởi: AC-4
- Thước: lệnh thoát lỗi khi trỏ vào production · số từ: mã thoát và số yêu cầu tới kho, kho Blob trên bảng ca · bảo đảm
  bởi: AC-5
- Thước: mỗi tệp sinh ra mang nhãn mẫu · số từ: ba chỗ nhãn trên sáu tệp · bảo đảm bởi: AC-1

## Out of scope

- Gỡ bộ mẫu (`--xoa`).
- Ảnh PNG/JPEG quét, PDF nhiều trang, điều khoản gia hạn tự động.
- Gắn tệp vào công ty hay cá nhân mẫu (theo khuyến nghị Hỏi-2).
- Tạo trường «Ngày ký», «Ngày hết hạn» bật «Kara điền» (DA23).
- Thay khuôn bằng hợp đồng thật của OneHub.
- Nạp bộ mẫu lúc `db:seed`.
- Đo trên kho Blob riêng tư thật (theo khuyến nghị Hỏi-3; DA19 AC-2 đã đo đường ghi ấy).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Phụ thuộc DA19: tên thủ tục, chữ ký hàm của `FieldFilesService` và kho Blob giả là của DA19; kế hoạch S2 đọc tên thật sau
  khi DA19 gộp. Hợp đồng không đổi nếu tên khác.
- Byte bộ mẫu commit, không sinh lúc chạy (design doc mục 1). Bộ dựng chạy một lần trên máy dev, dùng `pdf-lib`, `fontkit`
  có sẵn ở `apps/agent` và phông hệ thống như `dung-mau-tai-lieu.ts`; dựng lại là việc của người sửa bộ mẫu, không của CI.
- Bộ chặn dùng chung `kiemDuocNap` của `okr:mau`, không sửa tệp của hồ sơ `bo-okr-mau` đã ký.
- Vùng chung chỉ thêm dòng (luật 7): `package.json` gốc và của `apps/api` (một lệnh), `_acceptance/config.yaml`,
  `docs/setup.md`.
