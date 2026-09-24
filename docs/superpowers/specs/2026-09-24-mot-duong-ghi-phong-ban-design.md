# Một đường ghi phòng ban — thiết kế

Ngày: 2026-09-24 · hồ sơ `_acceptance/mot-duong-ghi-phong-ban/` · hạng T3 (đổi thủ tục
ghi có kiểm quyền) · nguồn: «Ngoài-1» và «Ngoài-24» của hồ sơ `cau-truc-to-chuc`
(PR phanlemanh/crm-onehub#120, ký Cổng Bằng chứng 2026-09-24).

## Vấn đề

Phòng ban (`Department`) đang có hai đường ghi với hai bộ luật:

| Thao tác | `org.*` (màn Tổ chức) | `onboarding.*` (đường cũ của Điều phối 30 ngày) |
| --- | --- | --- |
| Tạo | gọt khoảng trắng, ≤ 80 ký tự, chặn trùng tên (không phân biệt hoa thường), kiểm bộ phận | ≤ 120 ký tự, không chặn trùng, không có bộ phận |
| Đổi tên | như trên | ≤ 120, không chặn trùng |
| Sắp / chuyển | `moveDepartment` — theo bộ phận | `reorderDepartments` — danh sách phẳng, bỏ qua bộ phận |
| Lưu trữ · khôi phục · xoá hẳn | **không có** | chỉ ở đây |

Không màn nào gọi `onboarding.createDepartment` / `updateDepartment` /
`reorderDepartments` nữa, nhưng chúng vẫn mở qua tRPC và REST
(`/rest/onboarding/departments…`). Gọi thẳng vẫn tạo được hai phòng ban trùng tên
hoặc tên dài 120 ký tự. Còn lưu trữ, khôi phục, xoá hẳn thì chỉ có ở `onboarding.*`,
nên màn Tổ chức phải gọi cả hai router.

Điều kiện «xoá hẳn được» tính ở ba nơi:

- `org.tree` (`cay.ts`): không còn bước kế hoạch · không ai nhận nó làm phòng ban
  chính · không khuôn nào (kể cả khuôn đã lưu trữ) chứa nó.
- `onboarding.purgeDepartment`: cùng ba điều trên, cộng «đã lưu trữ».
- `onboarding.listDepartments` (`purgeable`): bước kế hoạch và khuôn — **thiếu** vế
  người. Một phòng ban đã lưu trữ còn người nhận làm phòng ban chính hiện
  `purgeable: true` nhưng bấm xoá thì bị từ chối.

## Hướng làm

**Một router ghi, một bộ luật, một hàm «xoá được».**

1. `org` nhận ba thủ tục mới: `archiveDepartment`, `restoreDepartment`,
   `purgeDepartment` — cùng khuôn với ba thủ tục của bộ phận: gọi `yeuCauQuanTri`
   trước (`canManageOrganization`), nhận `{ id }`, trả `{ id }`, REST
   `POST /org/departments/{id}/archive`, `POST /org/departments/{id}/restore`,
   `DELETE /org/departments/{id}`.
2. `onboarding` mất sáu thủ tục ghi phòng ban (`create`, `update`, `archive`,
   `restore`, `purge`, `reorderDepartments`) cùng đường REST của chúng. Giữ
   `onboarding.listDepartments` — đó là đường đọc mà Điều phối 30 ngày dùng cho ô chọn
   phòng ban và bộ lọc.
3. Luật lưu trữ chuyển nguyên từ `onboarding` sang `org`, giữ đúng thứ tự kiểm và câu:
   còn khuôn chưa lưu trữ chứa nó → «Phòng ban này còn nằm trong khuôn … — sửa khuôn
   trước.»; còn thành viên đang hiệu lực nhận nó làm phòng ban chính → «Còn N người
   có phòng ban chính ở đây — chuyển họ trước.». Bước kế hoạch và người chỉ có phòng
   ban phụ không chặn lưu trữ. Khôi phục giữ nguyên bộ phận và vị trí cũ.
4. Luật xoá hẳn là **một hàm thuần** trong `apps/api/src/to-chuc/` nhận số bước, số
   người nhận làm phòng ban chính (kể cả người đã rời), tên các khuôn chứa nó và trạng
   thái lưu trữ, trả câu từ chối hoặc không gì. Ba nơi đọc cùng hàm đó: `org.tree`
   (`purgeable = không có câu`), `org.purgeDepartment` (có câu thì từ chối bằng chính
   câu đó), `onboarding.listDepartments` (`purgeable`, chỉ với phòng ban đã lưu trữ).
   Hàm nằm ở `to-chuc` vì cây sở hữu phòng ban; `onboarding` import nó như import một
   luật của bảng mình đọc.
5. Câu từ chối của phòng ban theo chữ của cây. Hai câu đổi, cho khớp nút «Xoá hẳn» của
   màn Tổ chức và câu của bộ phận cùng điều kiện:
   - chưa lưu trữ: «Chỉ xoá vĩnh viễn được thứ đã lưu trữ.» → «Chỉ xoá hẳn được đơn vị
     đã lưu trữ.» (đúng câu bộ phận đang dùng);
   - còn bước kế hoạch: «Đã được dùng nên không xoá vĩnh viễn được — lịch sử kế hoạch
     còn trỏ tới.» → «Phòng ban còn bước kế hoạch trỏ tới nên không xoá hẳn được.» (cùng
     khuôn với «Phòng ban còn người trỏ tới…» và «Bộ phận còn phòng ban trỏ tới…»).
   Hai câu cũ vẫn sống cho **khuôn** kế hoạch — khuôn có nút «Xoá vĩnh viễn» riêng ở
   Cài đặt › Điều phối 30 ngày, không thuộc vòng này. Câu «còn nằm trong khuôn … — xoá
   vĩnh viễn khuôn đó…» giữ nguyên vì nó nói về thao tác trên khuôn.
6. Màn Tổ chức (sau vòng `to-chuc-danh-sach-chi-tiet`: hộp xác nhận `xac-nhan-luu-tru.tsx`
   và mục «Đã lưu trữ» `da-luu-tru-to-chuc.tsx`) đổi bốn chỗ gọi
   `trpc.onboarding.*Department` sang `trpc.org.*Department`. Không đổi hình, không đổi
   nhãn. Làm mới sau khi ghi vẫn qua `useLamMoiToChuc` (đã làm mới cả `org.tree` lẫn
   `onboarding.listDepartments`).

Loại đi:

- **Giữ sáu thủ tục cũ làm lối chuyển tiếp gọi sang `org.*`.** Không ai ngoài kho gọi
  chúng (`apps/agent` không gọi, không tích hợp nào khai), nên một lối chuyển tiếp chỉ
  giữ lại bề mặt phải kiểm quyền và phải đo.
- **Thêm `org.reorderDepartments` phẳng.** Thứ tự phòng ban chỉ có nghĩa trong một bộ
  phận; `org.moveDepartment` đã làm việc đó.
- **Để `onboarding.listDepartments` bỏ trường `purgeable`.** Không màn nào đọc trường
  đó nữa, nhưng hai hồ sơ đã ký (`khuon-mat-bo-phan`, `sua-luu-tru-dieu-phoi`) đo nó;
  tính nó bằng hàm chung rẻ hơn bỏ nó rồi đi sửa lời hứa của hai hồ sơ.

## Hồ sơ đã ký bị chạm

Tám hồ sơ có eval máy chạy một tệp kiểm gọi đường cũ — tập này do máy rút (eval nào
của hồ sơ đã ký có lệnh nhắc tới tệp kiểm vòng này sửa), không liệt kê tay. Vòng này không phá lời hứa nào của chúng: mỗi bài
kiểm giữ nguyên điều nó chứng, chỉ đổi đường gieo và đường gọi sang `org.*`, rồi mỗi hồ
sơ được ghim lại bằng **một lượt làn máy** (`repin-lane.mjs`, nhiều `--slug`) tại HEAD
— chạy lại mọi eval máy của chính hồ sơ đó.

| Hồ sơ | Bài kiểm | Đổi gì |
| --- | --- | --- |
| `dieu-phoi-30-ngay-dau` | `apps/api/test/dieu-phoi.spec.ts`, `apps/app/test/dieu-phoi-xoa-ghi-danh.dom.tsx` | gieo phòng ban qua `ToChucService`, tên có hậu tố riêng mỗi lần gọi; bỏ khối giả lập thủ tục không còn |
| `test-api-khong-de-viec-vo-chu` | chạy lại `dieu-phoi.spec.ts` rồi đếm dữ liệu sót | không đổi tệp riêng của hồ sơ; tên phòng ban gieo không mang tiền tố «Bo phan-» mà thước đếm sót đọc |
| `quan-ly-danh-muc-30-ngay` | `apps/api/test/quan-ly-danh-muc.spec.ts` | đổi tên qua `ToChucService.renameDepartment` |
| `noi-bon-nut-dieu-phoi` | `apps/api/test/noi-bon-nut.spec.ts`, `apps/app/test/noi-bon-nut.dom.tsx` | gieo qua `org`; bỏ khối giả lập `onboarding.*Department` không còn thủ tục thật |
| `khuon-mat-bo-phan` | `apps/api/test/khuon-mat-bo-phan.spec.ts` | tạo, lưu trữ, khôi phục, xoá qua `org.*`; đọc `purgeable` vẫn qua `onboarding.listDepartments` |
| `sua-luu-tru-dieu-phoi` | `apps/api/test/sua-luu-tru.spec.ts`, `apps/app/test/sua-luu-tru.dom.tsx` | ghi qua `org.*`; «sắp xếp» gieo ba phòng ban trong một bộ phận riêng của bài kiểm rồi sắp bằng `org.moveDepartment` — giữ nguyên cả khẳng định thứ tự lẫn vị trí tuyệt đối 0·1·2 |
| `cau-truc-to-chuc` | `apps/api/test/to-chuc.spec.ts`, `to-chuc-nhap.spec.ts`, `apps/app/test/to-chuc.dom.tsx` | lưu trữ, khôi phục, xoá qua `org.*`; hai câu đổi ở mục 5; danh sách thủ tục ghi của bài kiểm quyền rút từ router chỉ còn `org.*` |
| `to-chuc-danh-sach-chi-tiet` | `apps/api/test/to-chuc-chi-tiet.spec.ts`, `apps/app/test/to-chuc-chi-tiet.dom.tsx` | lưu trữ qua `org.archiveDepartment`; ba giả lập lưu trữ/khôi phục/xoá hẳn chuyển từ khối `onboarding` sang khối `org`, cùng khoá |

Quyết định `d-20260924T062111Z-12` của `cau-truc-to-chuc` từng giữ thủ tục cũ vì
`dieu-phoi.spec.ts` tạo lại «Van hanh» nhiều lần trong một lượt. Lời hứa của bài đó là
«đổi tên / lưu trữ phòng ban không cắt nó khỏi bước kế hoạch», không phải «tạo được hai
phòng ban cùng tên»; hậu tố riêng giữ nguyên lời hứa và thôi dựa vào lỗ hổng.

Một ngoại lệ đã duyệt (d-20260924T154916Z-16): bài «tên trống bị từ chối» của
`noi-bon-nut-dieu-phoi` đo lời từ chối của bộ kiểm dữ liệu vào cũ — bộ đó gỡ cùng đường
cũ, nên chiều đỏ đổi sang câu «Tên không được để trống.» của cây kèm vế «không ghi hàng nào».

Trước khi sửa bài kiểm của một hồ sơ đã ký, sổ quyết định của hồ sơ đó nhận một dòng
`revisit` nói bài nào đổi và vì sao.

## Tiêu chí

Tám tiêu chí trong `contract.md`; bộ đo trong `evals.yaml`. Đo quan hệ, không đo chữ:
«mọi thủ tục ghi phòng ban nằm dưới `org`» đo bằng router đang chạy, «ba nơi đồng ý về
xoá được» đo bằng cùng một ma trận trạng thái đi qua cả ba.

## Không làm

- Chuyển các màn Điều phối 30 ngày sang đọc phòng ban từ `org.tree`.
- Chặn tên dài trong nhập hàng loạt (Ngoài-2 của `cau-truc-to-chuc`) — nhập đã đi qua
  `org`, nhưng luật độ dài tên của nó là một thay đổi riêng trên ma trận lỗi nhập đã ký.
- Bất cứ đổi nào về khuôn kế hoạch và câu «xoá vĩnh viễn» của khuôn.
